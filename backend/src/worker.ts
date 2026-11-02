// ====================================================
// PROJECTX-RAY AI - DISTRIBUTED EVALUATION WORKER POOL
// Standalone BullMQ / Persistent Worker Node
// Consumes background evaluation jobs decoupled from API Gateway
// Exposes Prometheus metrics, Kubernetes probes, and graceful drains.
// ====================================================

// Enforce Node.js >= 22.0.0
const [nodeMajor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22) {
  console.error(
    `\x1b[41m\x1b[37m[FATAL ERROR] Node.js version ${process.versions.node} is not supported.\nProjectX-Ray AI Worker requires Node.js >= 22.0.0 for native SQLite (node:sqlite).\nPlease upgrade your Node.js runtime.\x1b[0m`
  );
  process.exit(1);
}

import http from 'node:http';
import { ENV } from './config/env';
import { initSchema } from './db/database';
import { pipelineQueue } from './pipeline/pipelineQueue';
import { createModuleLogger } from './utils/logger';

const workerLogger = createModuleLogger('DistributedWorker');

export interface WorkerServerStatus {
  status: 'ok' | 'degraded' | 'shutting_down';
  ready: boolean;
  role: string;
  engine: string;
  pid: number;
  uptimeSeconds: number;
  activeJobs: number;
  waitingJobs: number;
}

export class EvaluationWorkerServer {
  private server: http.Server | null = null;
  private isReady = false;
  private isShuttingDown = false;
  private port: number = ENV.WORKER_PORT || 3002;
  private startTime = Date.now();

  /**
   * Initializes queue in worker mode and starts HTTP probe & metrics server
   */
  async start(customPort?: number): Promise<void> {
    if (customPort) {
      this.port = customPort;
    }

    workerLogger.info(`Initializing ProjectX-Ray Distributed Worker node on PID ${process.pid}...`);

    // Ensure database schema is initialized
    initSchema();

    // Initialize pipeline queue in dedicated worker role
    await pipelineQueue.init({ role: 'worker', concurrency: ENV.PIPELINE_CONCURRENCY });

    this.server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;

      // 1. Kubernetes Liveness Probe: /healthz
      if (pathname === '/healthz' || pathname === '/health') {
        const payload = {
          status: this.isShuttingDown ? 'shutting_down' : 'ok',
          role: 'worker',
          pid: process.pid,
          uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
          timestamp: new Date().toISOString(),
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload, null, 2));
        return;
      }

      // 2. Kubernetes Readiness Probe: /readyz
      if (pathname === '/readyz' || pathname === '/ready') {
        if (!this.isReady || this.isShuttingDown) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              ready: false,
              status: this.isShuttingDown ? 'shutting_down' : 'initializing',
              reason: 'Worker is not accepting new evaluation jobs',
            })
          );
          return;
        }

        try {
          const status = await pipelineQueue.getStatus();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              ready: true,
              engine: status.engine,
              queueName: status.queueName,
              activeJobs: status.counts.active,
            })
          );
        } catch (err: any) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ready: false, error: err?.message || 'Queue probe error' }));
        }
        return;
      }

      // 3. Prometheus Exposition Format Scraper Endpoint: /metrics
      if (pathname === '/metrics') {
        try {
          const metricsText = await pipelineQueue.getPrometheusMetrics();
          res.writeHead(200, {
            'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          });
          res.end(metricsText);
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`# Error scraping metrics: ${err?.message || 'unknown error'}\n`);
        }
        return;
      }

      // 4. JSON Queue Status Endpoint: /status or /queue/status
      if (pathname === '/status' || pathname === '/queue/status') {
        try {
          const status = await pipelineQueue.getStatus();
          const metrics = await pipelineQueue.getQueueMetrics();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: { status, metrics } }, null, 2));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err?.message }));
        }
        return;
      }

      // 404 Fallback
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found', path: pathname }));
    });

    await new Promise<void>((resolve, reject) => {
      this.server!.listen(this.port, '0.0.0.0', () => {
        this.isReady = true;
        workerLogger.info(`⚡ Distributed Evaluation Worker server listening on port ${this.port} (PID: ${process.pid})`, {
          port: this.port,
          concurrency: ENV.PIPELINE_CONCURRENCY,
          engine: pipelineQueue.getRole(),
        });
        resolve();
      });
      this.server!.on('error', reject);
    });
  }

  /**
   * Graceful shutdown: sets ready probe to false, drains active jobs, and closes server
   */
  async stop(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    this.isReady = false;

    workerLogger.info('Worker initiating graceful shutdown; draining active evaluation jobs...');

    try {
      await pipelineQueue.close();
    } catch (err) {
      workerLogger.warn('Error closing pipeline queue during shutdown', { error: err });
    }

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = null;
    }

    workerLogger.info('Distributed Evaluation Worker stopped cleanly.');
  }

  public isServerReady(): boolean {
    return this.isReady && !this.isShuttingDown;
  }

  public getPort(): number {
    return this.port;
  }

  public async getDiagnostics(): Promise<WorkerServerStatus> {
    const queueMetrics = await pipelineQueue.getQueueMetrics();
    return {
      status: this.isShuttingDown ? 'shutting_down' : 'ok',
      ready: this.isServerReady(),
      role: 'worker',
      engine: queueMetrics.engine,
      pid: process.pid,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      activeJobs: queueMetrics.active,
      waitingJobs: queueMetrics.waiting,
    };
  }
}

export const evaluationWorkerServer = new EvaluationWorkerServer();

// Auto-run if executed directly as entrypoint
const isTestMode =
  process.env.NODE_ENV === 'test' ||
  process.argv.some((arg) => arg.includes('--test') || arg.includes('.test.ts'));

const isWorkerEntry =
  !isTestMode &&
  (process.env.APP_ROLE === 'worker' ||
    process.env.ROLE === 'worker' ||
    process.argv.includes('--worker') ||
    (process.argv[1] && (process.argv[1].endsWith('worker.ts') || process.argv[1].endsWith('worker.js'))));

if (isWorkerEntry) {
  evaluationWorkerServer.start().catch((err) => {
    workerLogger.error('Worker failed to boot', { error: err });
    process.exit(1);
  });

  const handleTermination = async (signal: string) => {
    workerLogger.info(`Received ${signal}, initiating worker drain sequence...`);
    try {
      await evaluationWorkerServer.stop();
      process.exit(0);
    } catch (err) {
      workerLogger.error(`Error during ${signal} termination`, { error: err });
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => handleTermination('SIGTERM'));
  process.on('SIGINT', () => handleTermination('SIGINT'));
}


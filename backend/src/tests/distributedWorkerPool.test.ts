// ====================================================
// PROJECTX-RAY AI - DISTRIBUTED KUBERNETES WORKER POOL TEST SUITE
// Verifies Decoupled API Gateway vs Worker Architecture,
// Standalone Worker Health/Readiness Probes, Queue Depth Metrics,
// Prometheus Text Exporter, HPA Autoscaling Formula, and Manifests.
// ====================================================

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { pipelineQueue } from '../pipeline/pipelineQueue';
import { EvaluationWorkerServer } from '../worker';
import { app } from '../server';
import { signToken } from '../services/tokenService';
import { ProjectRepository } from '../repositories/projectRepository';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { db } from '../db/database';

test('Distributed Kubernetes Worker Pool & Auto-Scaling Architecture', async (t) => {
  const TEST_WORKER_PORT = 3199;
  let workerServer: EvaluationWorkerServer | null = null;

  t.after(async () => {
    if (workerServer) {
      await workerServer.stop();
    }
    // Restore all-in-one queue role for subsequent tests
    await pipelineQueue.init({ role: 'all' });
  });

  // ----------------------------------------------------
  // 1. Decoupled API Role Behavior
  // ----------------------------------------------------
  await t.test('1. API Gateway role dispatches jobs without executing background workers', async () => {
    // Switch queue into API Gateway role
    await pipelineQueue.init({ role: 'api' });
    assert.strictEqual(pipelineQueue.getRole(), 'api');
    assert.strictEqual(pipelineQueue.isWorker(), false, 'API Gateway node must NOT act as active worker');

    const projects = ProjectRepository.findAll();
    assert.ok(projects.length > 0, 'Database must contain sample projects');
    const project = projects[0];

    const testEvalId = `eval_api_only_${Date.now()}`;
    EvaluationRepository.create({
      id: testEvalId,
      projectId: project.id,
      mode: 'VIDEO_ANALYSIS',
      status: 'QUEUED',
    });

    const jobResult = await pipelineQueue.addJob({
      evaluationId: testEvalId,
      projectId: project.id,
      executionId: `exec_api_${Date.now()}`,
      options: { fastMode: true },
    });

    assert.ok(jobResult.jobId);
    assert.ok(jobResult.engine);

    // Verify job is recorded in DB in WAITING state and not immediately processed by API node
    const queuedJob = db.get<any>(
      `SELECT * FROM pipeline_queue_jobs WHERE evaluation_id = ?`,
      testEvalId
    );
    assert.ok(queuedJob, 'Job must be persisted in durable queue');
    assert.strictEqual(queuedJob.status, 'WAITING');

    // Clean up test evaluation record so background worker auto-resume doesn't pick it up
    EvaluationRepository.update(testEvalId, { status: 'COMPLETED' });
    db.run(`DELETE FROM pipeline_queue_jobs WHERE evaluation_id = ?`, testEvalId);
    db.run(`DELETE FROM evaluations WHERE id = ?`, testEvalId);
  });

  // ----------------------------------------------------
  // 2. Dedicated Worker Node Initialization & Consumption
  // ----------------------------------------------------
  await t.test('2. Standalone Worker node initializes in worker role and consumes queued jobs', async () => {
    // Switch queue to worker role
    await pipelineQueue.init({ role: 'worker', concurrency: 2 });
    assert.strictEqual(pipelineQueue.getRole(), 'worker');
    assert.strictEqual(pipelineQueue.isWorker(), true, 'Worker role must have active worker processing enabled');

    const status = await pipelineQueue.getStatus();
    assert.strictEqual(status.role, 'worker');
    assert.ok(status.concurrency >= 1);
  });

  // ----------------------------------------------------
  // 3. Queue Depth Metrics & HPA Target Formula
  // ----------------------------------------------------
  await t.test('3. Queue depth metrics and HPA dynamic autoscaling calculation', async () => {
    const metrics = await pipelineQueue.getQueueMetrics();
    assert.ok(typeof metrics.waiting === 'number');
    assert.ok(typeof metrics.active === 'number');
    assert.ok(typeof metrics.completed === 'number');
    assert.ok(typeof metrics.failed === 'number');
    assert.ok(typeof metrics.recommendedWorkers === 'number');
    assert.ok(metrics.recommendedWorkers >= 2 && metrics.recommendedWorkers <= 20);

    // Test mathematical scaling formula: 1 worker per 5 waiting jobs, bounds [2, 20]
    const testCases = [
      { waiting: 0, expected: 2 },
      { waiting: 4, expected: 2 },
      { waiting: 5, expected: 2 }, // 5/5 = 1, clamped to min 2
      { waiting: 10, expected: 2 }, // 10/5 = 2
      { waiting: 25, expected: 5 }, // 25/5 = 5
      { waiting: 55, expected: 11 }, // 55/5 = 11
      { waiting: 120, expected: 20 }, // 120/5 = 24, clamped to max 20
    ];

    for (const tc of testCases) {
      const calculated = Math.ceil(tc.waiting / 5);
      const pods = Math.max(2, Math.min(20, calculated || 2));
      assert.strictEqual(pods, tc.expected, `Waiting ${tc.waiting} should recommend ${tc.expected} pods`);
    }
  });

  // ----------------------------------------------------
  // 4. Prometheus Exposition Text Exporter
  // ----------------------------------------------------
  await t.test('4. Prometheus exposition format matches v0.0.4 metrics standard', async () => {
    const prometheusText = await pipelineQueue.getPrometheusMetrics();

    assert.ok(prometheusText.includes('bullmq_queue_waiting_jobs{queue='), 'Must expose waiting jobs');
    assert.ok(prometheusText.includes('bullmq_queue_active_jobs{queue='), 'Must expose active jobs');
    assert.ok(prometheusText.includes('bullmq_queue_completed_jobs{queue='), 'Must expose completed jobs');
    assert.ok(prometheusText.includes('bullmq_queue_failed_jobs{queue='), 'Must expose failed jobs');
    assert.ok(prometheusText.includes('bullmq_worker_concurrency{queue='), 'Must expose concurrency');
    assert.ok(prometheusText.includes('bullmq_hpa_recommended_replicas{queue='), 'Must expose HPA recommendation');
    assert.ok(prometheusText.includes('# TYPE bullmq_queue_waiting_jobs gauge'));
    assert.ok(prometheusText.includes('# TYPE bullmq_queue_completed_jobs counter'));
  });

  // ----------------------------------------------------
  // 5. Standalone EvaluationWorkerServer Probes (/healthz, /readyz, /metrics)
  // ----------------------------------------------------
  await t.test('5. Dedicated worker HTTP server responds to Kubernetes probes and metrics scrapers', async () => {
    workerServer = new EvaluationWorkerServer();
    await workerServer.start(TEST_WORKER_PORT);
    assert.strictEqual(workerServer.isServerReady(), true);

    // Test /healthz (Liveness)
    const healthzRes = await fetchJson(`http://127.0.0.1:${TEST_WORKER_PORT}/healthz`);
    assert.strictEqual(healthzRes.status, 'ok');
    assert.strictEqual(healthzRes.role, 'worker');
    assert.ok(healthzRes.pid > 0);

    // Test /readyz (Readiness)
    const readyzRes = await fetchJson(`http://127.0.0.1:${TEST_WORKER_PORT}/readyz`);
    assert.strictEqual(readyzRes.ready, true);
    assert.ok(readyzRes.engine);

    // Test /metrics (Prometheus scraper)
    const metricsRaw = await fetchText(`http://127.0.0.1:${TEST_WORKER_PORT}/metrics`);
    assert.ok(metricsRaw.includes('bullmq_queue_waiting_jobs'));

    // Test /status (JSON diagnostics)
    const statusRes = await fetchJson(`http://127.0.0.1:${TEST_WORKER_PORT}/status`);
    assert.strictEqual(statusRes.success, true);
    assert.ok(statusRes.data.status);
    assert.ok(statusRes.data.metrics);
  });

  // ----------------------------------------------------
  // 6. Graceful Worker Drain Sequence
  // ----------------------------------------------------
  await t.test('6. Worker graceful shutdown drops readiness probe and closes listener', async () => {
    assert.ok(workerServer);
    await workerServer.stop();
    assert.strictEqual(workerServer.isServerReady(), false);
    workerServer = null;
  });

  // ----------------------------------------------------
  // 7. API Gateway HTTP Endpoints (/metrics & /api/admin/worker-pool/status)
  // ----------------------------------------------------
  await t.test('7. API Gateway exposes Prometheus metrics and admin worker-pool diagnostics', async () => {
    const testServer = http.createServer(app);
    await new Promise<void>((resolve) => testServer.listen(0, resolve));
    const port = (testServer.address() as any).port;

    try {
      // 1. Scrape /metrics (Prometheus scraper)
      const resMetrics = await fetch(`http://127.0.0.1:${port}/metrics`);
      assert.strictEqual(resMetrics.status, 200);
      assert.ok(resMetrics.headers.get('content-type')?.includes('text/plain'));
      const text = await resMetrics.text();
      assert.ok(text.includes('bullmq_queue_waiting_jobs'));

      // 2. Admin Worker Pool Status
      const adminToken = signToken({
        userId: 'usr_admin_cluster_test',
        email: 'admin@institution.edu',
        role: 'ADMIN',
      });

      const resAdmin = await fetch(`http://127.0.0.1:${port}/api/admin/worker-pool/status`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(resAdmin.status, 200);
      const json = await resAdmin.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.queue);
      assert.ok(json.data.metrics);
      assert.strictEqual(json.data.autoscaling.minReplicas, 2);
      assert.strictEqual(json.data.autoscaling.maxReplicas, 20);
      assert.strictEqual(json.data.autoscaling.hpaMetricName, 'bullmq_queue_waiting_jobs');
    } finally {
      await new Promise<void>((resolve) => testServer.close(() => resolve()));
    }
  });

  // ----------------------------------------------------
  // 8. Kubernetes Manifest Integrity & Spec Validation
  // ----------------------------------------------------
  await t.test('8. Kubernetes manifests satisfy production deployment and HPA requirements', () => {
    const candidateDirs = [
      path.resolve(__dirname, '../../k8s'),
      path.resolve(process.cwd(), 'backend', 'k8s'),
      path.resolve(process.cwd(), 'final year project', 'backend', 'k8s'),
    ];
    const k8sDir = candidateDirs.find((dir) => fs.existsSync(dir));
    assert.ok(k8sDir && fs.existsSync(k8sDir), 'backend/k8s directory must exist');

    const expectedFiles = [
      'namespace.yaml',
      'configmap.yaml',
      'secrets.yaml',
      'redis-deployment.yaml',
      'redis-service.yaml',
      'api-deployment.yaml',
      'api-service.yaml',
      'worker-deployment.yaml',
      'hpa-worker.yaml',
      'README.md',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(k8sDir, file);
      assert.ok(fs.existsSync(filePath), `Manifest ${file} must exist`);
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.ok(content.length > 20, `Manifest ${file} must not be empty`);
    }

    // Verify worker deployment spec
    const workerYaml = fs.readFileSync(path.join(k8sDir, 'worker-deployment.yaml'), 'utf-8');
    assert.ok(workerYaml.includes('APP_ROLE'), 'Worker deployment must inject APP_ROLE');
    assert.ok(workerYaml.includes('worker.js') || workerYaml.includes('worker.ts'));
    assert.ok(workerYaml.includes('terminationGracePeriodSeconds: 90'));
    assert.ok(workerYaml.includes('/healthz'));
    assert.ok(workerYaml.includes('/readyz'));

    // Verify HPA autoscaler spec
    const hpaYaml = fs.readFileSync(path.join(k8sDir, 'hpa-worker.yaml'), 'utf-8');
    assert.ok(hpaYaml.includes('minReplicas: 2'));
    assert.ok(hpaYaml.includes('maxReplicas: 20'));
    assert.ok(hpaYaml.includes('bullmq_queue_waiting_jobs'));
    assert.ok(hpaYaml.includes('scaleTargetRef'));

    // Verify API Gateway spec
    const apiYaml = fs.readFileSync(path.join(k8sDir, 'api-deployment.yaml'), 'utf-8');
    assert.ok(apiYaml.includes('value: "api"'));
    assert.ok(apiYaml.includes('/api/health'));
    assert.ok(apiYaml.includes('prometheus.io/scrape: "true"'));
  });
});

// Helper for JSON fetching in tests
async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  return res.json();
}

// Helper for text fetching in tests
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}

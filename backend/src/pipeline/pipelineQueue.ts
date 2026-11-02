// ====================================================
// PROJECTX-RAY AI - PERSISTENT EVALUATION PIPELINE QUEUE
// BullMQ with Redis Engine + Durable SQLite Failover Engine
// Features: Persistent Jobs, Stage Checkpointing, Auto-Resume on Server Restart,
// Concurrency Control, Exponential Backoff Retries, SSE Progress Integration.
// ====================================================

import { Queue, Worker, QueueEvents, type Job } from 'bullmq';
import { db } from '../db/database';
import { ENV } from '../config/env';
import { getRedisConnectionOptions, testRedisConnection, getRedisStatus } from './redisConfig';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { pipelineStreamEmitter, OrchestrationService, type StartEvaluationOptions } from './orchestrationService';
import { createModuleLogger } from '../utils/logger';

const queueLogger = createModuleLogger('PipelineQueue');

export interface EvaluationJobData {
  evaluationId: string;
  projectId: string;
  executionId: string;
  options: StartEvaluationOptions;
  resumeFromStage?: number;
}

export type PipelineQueueRole = 'all' | 'api' | 'worker';

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  concurrency: number;
  role: PipelineQueueRole;
  engine: 'BULLMQ_REDIS' | 'PERSISTENT_SQLITE';
  recommendedWorkers: number;
  timestamp: string;
}

export interface PipelineQueueStatus {
  engine: 'BULLMQ_REDIS' | 'PERSISTENT_SQLITE';
  redisAvailable: boolean;
  queueName: string;
  role: PipelineQueueRole;
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  };
  concurrency: number;
  activeJobIds: string[];
  interruptedAutoResumedCount: number;
  lastChecked: string;
}

export class PipelineQueue {
  private static instance: PipelineQueue | null = null;
  private queueEngine: 'BULLMQ_REDIS' | 'PERSISTENT_SQLITE' = 'PERSISTENT_SQLITE';
  private bullQueue: Queue<EvaluationJobData> | null = null;
  private bullWorker: Worker<EvaluationJobData> | null = null;
  private bullEvents: QueueEvents | null = null;
  private isInitialized = false;
  private interruptedResumedCount = 0;
  private role: PipelineQueueRole = 'all';

  // In-process worker state for SQLite persistent fallback engine
  private isProcessingSqlite = false;
  private activeJobsMap = new Map<string, EvaluationJobData>();
  private sqliteWorkerInterval: NodeJS.Timeout | null = null;

  public static getInstance(): PipelineQueue {
    if (!PipelineQueue.instance) {
      PipelineQueue.instance = new PipelineQueue();
    }
    return PipelineQueue.instance;
  }

  /**
   * Initializes the queue engine, checks Redis availability,
   * configures BullMQ if Redis is active, or activates SQLite Durable Queue.
   * Immediately runs auto-resume for interrupted jobs when in worker/all role.
   */
  async init(options?: { role?: PipelineQueueRole; concurrency?: number }): Promise<void> {
    const targetRole = options?.role || (process.env.APP_ROLE || process.env.ROLE || 'all') as PipelineQueueRole;
    if (this.isInitialized) {
      if (options?.role && options.role !== this.role) {
        await this.close();
      } else {
        return;
      }
    }
    this.role = targetRole;

    const redisOk = await testRedisConnection(1000);
    const queueName = ENV.QUEUE_NAME || 'evaluation-pipeline-queue';
    const concurrency = options?.concurrency || ENV.PIPELINE_CONCURRENCY || 2;

    if (redisOk) {
      try {
        const connectionOptions = getRedisConnectionOptions();

        this.bullQueue = new Queue<EvaluationJobData>(queueName, {
          connection: connectionOptions,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: { age: 3600 * 24 },
            removeOnFail: { age: 3600 * 48 },
          },
        });

        // Worker consumer is ONLY spawned if role is 'worker' or 'all'
        if (this.role !== 'api') {
          this.bullWorker = new Worker<EvaluationJobData>(
            queueName,
            async (job: Job<EvaluationJobData>) => {
              return await this.executePipelineJob(job.data, async (progress) => {
                await job.updateProgress(progress);
              });
            },
            {
              connection: connectionOptions,
              concurrency,
              stalledInterval: 30000,
              maxStalledCount: 2,
            }
          );

          this.bullWorker.on('completed', (job) => {
            this.syncJobToSqlite(job.data, 'COMPLETED');
            queueLogger.info(`Job ${job.id} for Evaluation ${job.data.evaluationId} completed.`, {
              jobId: job.id,
              evaluationId: job.data.evaluationId,
              executionId: job.data.executionId,
            });
          });

          this.bullWorker.on('failed', (job, err) => {
            if (job) {
              this.syncJobToSqlite(job.data, 'FAILED', err?.message);
              queueLogger.error(`Job ${job.id} for Evaluation ${job.data.evaluationId} failed`, {
                jobId: job.id,
                evaluationId: job.data.evaluationId,
                executionId: job.data.executionId,
                error: err,
              });
            }
          });
        }

        this.bullEvents = new QueueEvents(queueName, { connection: connectionOptions });
        this.queueEngine = 'BULLMQ_REDIS';
        queueLogger.info(`🚀 BullMQ Redis persistent queue activated on '${queueName}' [Role: ${this.role}, concurrency: ${concurrency}].`, {
          queueName,
          concurrency,
          role: this.role,
        });
      } catch (err: any) {
        queueLogger.warn(`Failed to initialize BullMQ, activating persistent SQLite engine: ${err.message}`, { error: err });
        this.activateSqliteEngine();
      }
    } else {
      this.activateSqliteEngine();
    }

    this.isInitialized = true;

    // Only workers or standalone instances auto-resume interrupted jobs
    if (this.role !== 'api') {
      await this.autoResumeInterruptedJobs();
    }
  }

  private activateSqliteEngine(): void {
    this.queueEngine = 'PERSISTENT_SQLITE';
    queueLogger.info(
      `🛡️ SQLite Durable Persistent Queue engine active [Role: ${this.role}, concurrency: ${ENV.PIPELINE_CONCURRENCY || 2}]. Auto-resume and disk persistence guaranteed.`,
      { concurrency: ENV.PIPELINE_CONCURRENCY || 2, role: this.role }
    );

    // Periodically poll for pending jobs in SQLite queue ONLY when role is worker or all
    if (this.role !== 'api' && !this.sqliteWorkerInterval) {
      this.sqliteWorkerInterval = setInterval(() => {
        this.processNextSqliteJob().catch((err) => {
          queueLogger.error('Pipeline Queue SQLite Worker Error', { error: err });
        });
      }, 500);
      this.sqliteWorkerInterval.unref();
    }
  }

  /**
   * Enqueues an evaluation into the persistent queue (BullMQ or SQLite durable queue)
   */
  async addJob(data: EvaluationJobData): Promise<{ jobId: string; engine: string }> {
    if (!this.isInitialized) {
      await this.init();
    }

    const jobId = `job_${data.evaluationId}_${data.executionId}`;

    // Always record job in SQLite persistent storage for universal state preservation
    this.recordJobInSqlite(data, jobId);

    if (this.queueEngine === 'BULLMQ_REDIS' && this.bullQueue) {
      try {
        await this.bullQueue.add(
          `eval_${data.evaluationId}`,
          data,
          {
            jobId: `eval_${data.evaluationId}`,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          }
        );
        return { jobId, engine: 'BULLMQ_REDIS' };
      } catch (err: any) {
        queueLogger.warn(`BullMQ push failed, falling back to SQLite persistent queue: ${err.message}`, {
          evaluationId: data.evaluationId,
          error: err,
        });
        this.queueEngine = 'PERSISTENT_SQLITE';
      }
    }

    // SQLite engine execution: only trigger local worker cycle if worker or all
    if (this.role !== 'api') {
      setImmediate(() => {
        this.processNextSqliteJob().catch((err) => queueLogger.error('Error processing SQLite job', { error: err }));
      });
    }

    return { jobId, engine: 'PERSISTENT_SQLITE' };
  }

  /**
   * Universal executor for pipeline jobs
   */
  private async executePipelineJob(
    data: EvaluationJobData,
    onProgress?: (progressPercentage: number) => Promise<void>
  ): Promise<void> {
    const { evaluationId, projectId, executionId, options, resumeFromStage } = data;

    const project = ProjectRepository.findById(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found.`);
    }

    // Forward progress to BullMQ progress reporter if provided
    const progressListener = (eventData: any) => {
      if (eventData.evaluationId === evaluationId && onProgress && typeof eventData.progress === 'number') {
        onProgress(eventData.progress).catch(() => {});
      }
    };

    pipelineStreamEmitter.on('progress', progressListener);

    try {
      await OrchestrationService.executePipelineStages(evaluationId, project, executionId, {
        ...options,
        resumeFromStage: resumeFromStage || 1,
      });
    } finally {
      pipelineStreamEmitter.off('progress', progressListener);
    }
  }

  /**
   * SQLite Durable Queue Worker: processes WAITING jobs up to concurrency limit
   */
  private async processNextSqliteJob(): Promise<void> {
    const maxConcurrency = ENV.PIPELINE_CONCURRENCY || 2;
    if (this.activeJobsMap.size >= maxConcurrency) {
      return;
    }

    // Find next WAITING job
    const jobRow = db.get<any>(
      `SELECT * FROM pipeline_queue_jobs WHERE status = 'WAITING' ORDER BY created_at ASC LIMIT 1`
    );

    if (!jobRow) return;

    const evaluationId = jobRow.evaluation_id;
    const executionId = jobRow.execution_id;
    const projectId = jobRow.project_id;
    const resumeFromStage = jobRow.resume_from_stage || 1;
    let options: StartEvaluationOptions = {};

    try {
      if (jobRow.options_json) {
        options = JSON.parse(jobRow.options_json);
      }
    } catch {
      options = {};
    }

    const jobData: EvaluationJobData = {
      evaluationId,
      projectId,
      executionId,
      options,
      resumeFromStage,
    };

    this.activeJobsMap.set(jobRow.id, jobData);

    // Mark ACTIVE in SQLite
    db.run(
      `UPDATE pipeline_queue_jobs SET status = 'ACTIVE', attempts = attempts + 1, updated_at = ? WHERE id = ?`,
      new Date().toISOString(),
      jobRow.id
    );

    try {
      await this.executePipelineJob(jobData);
      db.run(
        `UPDATE pipeline_queue_jobs SET status = 'COMPLETED', updated_at = ? WHERE id = ?`,
        new Date().toISOString(),
        jobRow.id
      );
    } catch (err: any) {
      const attempts = (jobRow.attempts || 0) + 1;
      const maxAttempts = jobRow.max_attempts || 3;
      const newStatus = attempts >= maxAttempts ? 'FAILED' : 'WAITING';

      db.run(
        `UPDATE pipeline_queue_jobs SET status = ?, last_error = ?, updated_at = ? WHERE id = ?`,
        newStatus,
        err?.message || 'Pipeline execution failed',
        new Date().toISOString(),
        jobRow.id
      );
      queueLogger.error(`Job ${jobRow.id} failed (attempt ${attempts}/${maxAttempts})`, {
        jobId: jobRow.id,
        attempts,
        maxAttempts,
        error: err,
      });
    } finally {
      this.activeJobsMap.delete(jobRow.id);
      // Trigger check for more pending jobs
      setImmediate(() => {
        this.processNextSqliteJob().catch((err) => queueLogger.error('Error in next SQLite job cycle', { error: err }));
      });
    }
  }

  /**
   * Scans database on startup for any evaluations left in 'PROCESSING' or 'QUEUED'
   * and auto-resumes them from their last completed stage checkpoint.
   */
  async autoResumeInterruptedJobs(): Promise<{ resumedCount: number; resumedEvaluationIds: string[] }> {
    const interruptedEvals = db.all<any>(
      `SELECT id, project_id, execution_id, status FROM evaluations WHERE status IN ('PROCESSING', 'QUEUED')`
    );

    const resumedEvaluationIds: string[] = [];

    for (const row of interruptedEvals) {
      const evaluationId = row.id;
      const jobs = EvaluationRepository.getJobsByEvaluationId(evaluationId);

      // Determine highest completed stage
      let highestCompletedStage = 0;
      for (const j of jobs) {
        if (j.state === 'COMPLETED' && j.stageIndex > highestCompletedStage) {
          highestCompletedStage = j.stageIndex;
        }
      }

      if (highestCompletedStage >= 15) {
        // All stages were completed, finalize evaluation
        EvaluationRepository.update(evaluationId, { status: 'COMPLETED' });
        continue;
      }

      const resumeFromStage = highestCompletedStage + 1;
      queueLogger.info(
        `Detected interrupted evaluation '${evaluationId}' (last completed stage: ${highestCompletedStage}/15). Auto-resuming from stage ${resumeFromStage}...`,
        { evaluationId, highestCompletedStage, resumeFromStage }
      );

      const queueJob = db.get<any>(
        `SELECT options_json FROM pipeline_queue_jobs WHERE evaluation_id = ? ORDER BY created_at DESC LIMIT 1`,
        evaluationId
      );
      let options: StartEvaluationOptions = { fastMode: true, stageDelayMs: 0 };
      if (queueJob?.options_json) {
        try {
          const parsed = JSON.parse(queueJob.options_json);
          options = { ...options, ...parsed };
        } catch {
          // ignore
        }
      }

      const jobData: EvaluationJobData = {
        evaluationId,
        projectId: row.project_id,
        executionId: row.execution_id || `exec_resumed_${Date.now()}`,
        options,
        resumeFromStage,
      };

      await this.addJob(jobData);
      resumedEvaluationIds.push(evaluationId);
      this.interruptedResumedCount++;
    }

    return {
      resumedCount: resumedEvaluationIds.length,
      resumedEvaluationIds,
    };
  }

  /**
   * Helper to write / update persistent SQLite queue job record
   */
  private recordJobInSqlite(data: EvaluationJobData, jobId: string): void {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO pipeline_queue_jobs (
        id, evaluation_id, project_id, execution_id, options_json, resume_from_stage, status, attempts, max_attempts, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'WAITING', 0, 3, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = 'WAITING',
        resume_from_stage = excluded.resume_from_stage,
        updated_at = excluded.updated_at`,
      jobId,
      data.evaluationId,
      data.projectId,
      data.executionId,
      JSON.stringify(data.options || {}),
      data.resumeFromStage || 1,
      now,
      now
    );
  }

  private syncJobToSqlite(data: EvaluationJobData, status: 'COMPLETED' | 'FAILED', error?: string): void {
    const now = new Date().toISOString();
    db.run(
      `UPDATE pipeline_queue_jobs SET status = ?, last_error = ?, updated_at = ? WHERE evaluation_id = ?`,
      status,
      error || null,
      now,
      data.evaluationId
    );
  }

  /**
   * Fetches real-time status and metrics of the pipeline queue
   */
  async getStatus(): Promise<PipelineQueueStatus> {
    const redisStatus = getRedisStatus();
    const queueName = ENV.QUEUE_NAME || 'evaluation-pipeline-queue';
    const concurrency = ENV.PIPELINE_CONCURRENCY || 2;

    if (this.queueEngine === 'BULLMQ_REDIS' && this.bullQueue) {
      try {
        const counts = await this.bullQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');
        const activeJobs = await this.bullQueue.getActive();

        return {
          engine: 'BULLMQ_REDIS',
          redisAvailable: true,
          queueName,
          role: this.role,
          counts: {
            waiting: counts.waiting || 0,
            active: counts.active || 0,
            completed: counts.completed || 0,
            failed: counts.failed || 0,
            delayed: counts.delayed || 0,
            paused: counts.paused > 0,
          },
          concurrency,
          activeJobIds: activeJobs.map((j) => j.id || j.name),
          interruptedAutoResumedCount: this.interruptedResumedCount,
          lastChecked: new Date().toISOString(),
        };
      } catch (err: any) {
        queueLogger.warn(`Failed reading BullMQ counts: ${err.message}`, { error: err });
      }
    }

    // SQLite queue metrics
    const statsRow = db.get<any>(`
      SELECT
        COUNT(CASE WHEN status = 'WAITING' THEN 1 END) as waiting,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
      FROM pipeline_queue_jobs
    `) || { waiting: 0, active: 0, completed: 0, failed: 0 };

    return {
      engine: 'PERSISTENT_SQLITE',
      redisAvailable: redisStatus.connected,
      queueName: `${queueName}_sqlite`,
      role: this.role,
      counts: {
        waiting: statsRow.waiting || 0,
        active: statsRow.active || this.activeJobsMap.size,
        completed: statsRow.completed || 0,
        failed: statsRow.failed || 0,
        delayed: 0,
        paused: false,
      },
      concurrency,
      activeJobIds: Array.from(this.activeJobsMap.keys()),
      interruptedAutoResumedCount: this.interruptedResumedCount,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Returns current process role (all, api, worker)
   */
  public getRole(): PipelineQueueRole {
    return this.role;
  }

  /**
   * Returns whether this instance actively consumes jobs
   */
  public isWorker(): boolean {
    return this.role !== 'api' && (!!this.bullWorker || !!this.sqliteWorkerInterval);
  }

  /**
   * Returns unified queue depth metrics and autoscaling calculations
   */
  async getQueueMetrics(): Promise<QueueMetrics> {
    const status = await this.getStatus();
    const waiting = status.counts.waiting;
    const active = status.counts.active;
    const completed = status.counts.completed;
    const failed = status.counts.failed;
    const delayed = status.counts.delayed;
    const paused = status.counts.paused;
    const concurrency = status.concurrency;

    // HPA Autoscaling formula: 1 worker pod per 5 waiting jobs (clamped between 2 and 20 pods)
    const targetQueueDepthPerPod = 5;
    const calculatedPods = Math.ceil(waiting / targetQueueDepthPerPod);
    const recommendedWorkers = Math.max(2, Math.min(20, calculatedPods || 2));

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
      concurrency,
      role: this.role,
      engine: status.engine,
      recommendedWorkers,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Formats queue metrics in Prometheus text exposition format (version 0.0.4)
   */
  async getPrometheusMetrics(): Promise<string> {
    const metrics = await this.getQueueMetrics();
    const queueName = ENV.QUEUE_NAME || 'evaluation-pipeline-queue';

    const lines = [
      '# HELP bullmq_queue_waiting_jobs Number of evaluations waiting in the queue',
      '# TYPE bullmq_queue_waiting_jobs gauge',
      `bullmq_queue_waiting_jobs{queue="${queueName}"} ${metrics.waiting}`,
      '',
      '# HELP bullmq_queue_active_jobs Number of evaluations currently being processed by worker pods',
      '# TYPE bullmq_queue_active_jobs gauge',
      `bullmq_queue_active_jobs{queue="${queueName}"} ${metrics.active}`,
      '',
      '# HELP bullmq_queue_completed_jobs Total number of completed evaluation jobs',
      '# TYPE bullmq_queue_completed_jobs counter',
      `bullmq_queue_completed_jobs{queue="${queueName}"} ${metrics.completed}`,
      '',
      '# HELP bullmq_queue_failed_jobs Total number of failed evaluation jobs',
      '# TYPE bullmq_queue_failed_jobs counter',
      `bullmq_queue_failed_jobs{queue="${queueName}"} ${metrics.failed}`,
      '',
      '# HELP bullmq_queue_delayed_jobs Number of evaluations in delayed retry state',
      '# TYPE bullmq_queue_delayed_jobs gauge',
      `bullmq_queue_delayed_jobs{queue="${queueName}"} ${metrics.delayed}`,
      '',
      '# HELP bullmq_worker_concurrency Worker concurrency per pod',
      '# TYPE bullmq_worker_concurrency gauge',
      `bullmq_worker_concurrency{queue="${queueName}"} ${metrics.concurrency}`,
      '',
      '# HELP bullmq_hpa_recommended_replicas Recommended worker pod replicas based on queue depth',
      '# TYPE bullmq_hpa_recommended_replicas gauge',
      `bullmq_hpa_recommended_replicas{queue="${queueName}"} ${metrics.recommendedWorkers}`,
      '',
      '# HELP projectxray_queue_engine Active queue engine (1 = BullMQ Redis, 0 = SQLite fallback)',
      '# TYPE projectxray_queue_engine gauge',
      `projectxray_queue_engine{engine="${metrics.engine}"} ${metrics.engine === 'BULLMQ_REDIS' ? 1 : 0}`,
      '',
    ];

    return lines.join('\n');
  }

  /**
   * Retries an evaluation by re-enqueuing it
   */
  async retryJob(evaluationId: string): Promise<boolean> {
    const evaluation = EvaluationRepository.findById(evaluationId);
    if (!evaluation) return false;

    // Reset failed stages to QUEUED
    db.run(
      `UPDATE analysis_jobs SET state = 'QUEUED', progress_percentage = 0 WHERE evaluation_id = ? AND state IN ('FAILED', 'WARNING')`,
      evaluationId
    );

    EvaluationRepository.update(evaluationId, { status: 'PROCESSING' });

    await this.addJob({
      evaluationId,
      projectId: evaluation.projectId,
      executionId: `exec_retry_${Date.now()}`,
      options: { fastMode: true },
      resumeFromStage: 1,
    });

    return true;
  }

  /**
   * Cancels a job by evaluation ID
   */
  async cancelJob(evaluationId: string): Promise<boolean> {
    db.run(`UPDATE pipeline_queue_jobs SET status = 'CANCELLED' WHERE evaluation_id = ?`, evaluationId);
    EvaluationRepository.update(evaluationId, { status: 'FAILED' });
    this.activeJobsMap.delete(evaluationId);
    return true;
  }

  /**
   * Graceful cleanup
   */
  async close(): Promise<void> {
    if (this.sqliteWorkerInterval) {
      clearInterval(this.sqliteWorkerInterval);
      this.sqliteWorkerInterval = null;
    }

    if (this.bullWorker) {
      await this.bullWorker.close();
      this.bullWorker = null;
    }

    if (this.bullEvents) {
      await this.bullEvents.close();
      this.bullEvents = null;
    }

    if (this.bullQueue) {
      await this.bullQueue.close();
      this.bullQueue = null;
    }

    this.isInitialized = false;
  }
}

export const pipelineQueue = PipelineQueue.getInstance();

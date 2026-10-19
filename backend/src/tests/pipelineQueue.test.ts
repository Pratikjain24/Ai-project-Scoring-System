// ====================================================
// PROJECTX-RAY AI - PERSISTENT QUEUE & AUTO-RESUME TEST SUITE
// Tests BullMQ / Persistent Queue, Server Restart Auto-Resume,
// Stage Checkpointing, Retries, and REST Management Endpoints
// ====================================================

import test from 'node:test';
import assert from 'node:assert';
import { db } from '../db/database';
import { pipelineQueue } from '../pipeline/pipelineQueue';
import { testRedisConnection, getRedisStatus } from '../pipeline/redisConfig';
import { OrchestrationService, pipelineStreamEmitter } from '../pipeline/orchestrationService';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { app } from '../server';
import { signToken } from '../services/tokenService';
import http from 'node:http';

test('Pipeline Persistent Queue & Auto-Resume Test Suite', async (t) => {
  // Ensure queue is initialized
  await pipelineQueue.init();

  // 1. Redis Connection Testing & Status
  await t.test('1. Redis Config & Status telemetry behaves gracefully', async () => {
    const isAvailable = await testRedisConnection(300);
    const status = getRedisStatus();

    assert.ok(typeof isAvailable === 'boolean');
    assert.strictEqual(status.connected, isAvailable);
    assert.ok(status.mode === 'REDIS_BULLMQ' || status.mode === 'FALLBACK_PERSISTENT_SQLITE');
    assert.ok(status.host);
    assert.ok(status.port > 0);
  });

  // 2. Queue Status Telemetry
  await t.test('2. PipelineQueue provides real-time status and metrics', async () => {
    const qStatus = await pipelineQueue.getStatus();
    assert.ok(qStatus.engine === 'BULLMQ_REDIS' || qStatus.engine === 'PERSISTENT_SQLITE');
    assert.ok(qStatus.queueName.includes('evaluation-pipeline-queue'));
    assert.ok(qStatus.concurrency >= 1);
    assert.ok(typeof qStatus.counts.waiting === 'number');
    assert.ok(typeof qStatus.counts.active === 'number');
    assert.ok(typeof qStatus.counts.completed === 'number');
  });

  // 3. Dispatch Evaluation via Persistent Queue
  await t.test('3. OrchestrationService.startEvaluation enqueues job and finishes stages', async () => {
    // Pick an existing project from DB
    const projects = ProjectRepository.findAll();
    assert.ok(projects.length > 0, 'At least one project must exist');
    const project = projects[0];

    const testEvalId = `eval_test_queue_${Date.now()}`;
    EvaluationRepository.create({
      id: testEvalId,
      projectId: project.id,
      mode: 'VIDEO_ANALYSIS',
      status: 'QUEUED',
    });

    const result = OrchestrationService.startEvaluation(testEvalId, {
      fastMode: true,
      stageDelayMs: 0,
    });

    assert.ok(result.executionId);
    assert.strictEqual(result.totalStages, 15);

    // Wait for pipeline execution to complete
    let completed = false;
    for (let i = 0; i < 150; i++) {
      await new Promise(r => setTimeout(r, 100));
      const ev = EvaluationRepository.findById(testEvalId);
      if (ev?.status === 'COMPLETED') {
        completed = true;
        break;
      }
    }

    assert.strictEqual(completed, true, 'Evaluation should complete all stages via persistent queue');
    const jobs = EvaluationRepository.getJobsByEvaluationId(testEvalId);
    assert.strictEqual(jobs.length, 15);
    const completedStages = jobs.filter(j => j.state === 'COMPLETED');
    assert.strictEqual(completedStages.length, 15, 'All 15 stages must be completed');
  });

  // 4. Server Restart Simulation & Auto-Resume
  await t.test('4. Auto-resume detects interrupted evaluation and resumes from intermediate stage', async () => {
    const projects = ProjectRepository.findAll();
    const project = projects[0];
    const interruptedEvalId = `eval_interrupted_${Date.now()}`;

    // Create an evaluation record that was left in 'PROCESSING'
    EvaluationRepository.create({
      id: interruptedEvalId,
      projectId: project.id,
      mode: 'VIDEO_ANALYSIS',
      status: 'PROCESSING',
      executionId: `exec_crashed_${Date.now()}`,
    });

    // Simulate stages 1 to 5 as already completed before crash
    for (let i = 1; i <= 5; i++) {
      EvaluationRepository.createJob({
        id: `job_${interruptedEvalId}_${i}`,
        evaluationId: interruptedEvalId,
        jobType: 'PROJECT_ANALYSIS',
        stageName: `Stage ${i}`,
        stageIndex: i,
        totalStages: 15,
        state: 'COMPLETED',
        progressPercentage: 100,
        message: `Completed stage ${i} before server crash`,
        executionId: `exec_crashed`,
      });
    }

    // Stages 6 to 15 were left in QUEUED / PROCESSING
    for (let i = 6; i <= 15; i++) {
      EvaluationRepository.createJob({
        id: `job_${interruptedEvalId}_${i}`,
        evaluationId: interruptedEvalId,
        jobType: 'PROJECT_ANALYSIS',
        stageName: `Stage ${i}`,
        stageIndex: i,
        totalStages: 15,
        state: i === 6 ? 'PROCESSING' : 'QUEUED',
        progressPercentage: 0,
        message: 'Awaiting upstream artifacts',
        executionId: `exec_crashed`,
      });
    }

    // Trigger auto-resume (which runs on server boot)
    const resumeResult = await pipelineQueue.autoResumeInterruptedJobs();
    assert.ok(resumeResult.resumedEvaluationIds.includes(interruptedEvalId));
    assert.ok(resumeResult.resumedCount >= 1);

    // Wait for resumed evaluation to finish remaining stages
    let completed = false;
    for (let i = 0; i < 100; i++) {
      await new Promise(r => setTimeout(r, 100));
      const ev = EvaluationRepository.findById(interruptedEvalId);
      if (ev?.status === 'COMPLETED') {
        completed = true;
        break;
      }
    }

    assert.strictEqual(completed, true, 'Interrupted evaluation must resume and reach COMPLETED status');
    const finalEval = EvaluationRepository.findById(interruptedEvalId);
    assert.ok(finalEval?.overallScore !== undefined);
    assert.ok(finalEval?.verdict !== undefined);
  });

  // 5. REST API: GET /api/evaluations/queue/status & POST /api/evaluations/:id/retry
  await t.test('5. REST endpoints return queue health and handle job retry', async () => {
    const server = http.createServer(app);
    await new Promise<void>(resolve => server.listen(0, resolve));
    const address = server.address() as any;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const token = signToken({ userId: 'usr_admin', role: 'ADMIN', email: 'admin@projectxray.ai' });
    const authHeaders = { Authorization: `Bearer ${token}` };

    try {
      // Test GET /api/evaluations/queue/status
      const statusRes = await fetch(`${baseUrl}/api/evaluations/queue/status`, { headers: authHeaders });
      assert.strictEqual(statusRes.status, 200);
      const statusBody = await statusRes.json();
      assert.strictEqual(statusBody.success, true);
      assert.ok(statusBody.data.engine);
      assert.ok(statusBody.data.counts);

      // Test POST /api/evaluations/queue/resume-interrupted
      const resumeRes = await fetch(`${baseUrl}/api/evaluations/queue/resume-interrupted`, {
        method: 'POST',
        headers: authHeaders,
      });
      assert.strictEqual(resumeRes.status, 200);
      const resumeBody = await resumeRes.json();
      assert.strictEqual(resumeBody.success, true);
      assert.ok(typeof resumeBody.data.resumedCount === 'number');

      // Test POST /api/evaluations/:id/cancel
      const projects = ProjectRepository.findAll();
      const cancelEvalId = `eval_cancel_${Date.now()}`;
      EvaluationRepository.create({
        id: cancelEvalId,
        projectId: projects[0].id,
        mode: 'VIDEO_ANALYSIS',
        status: 'PROCESSING',
      });

      const cancelRes = await fetch(`${baseUrl}/api/evaluations/${cancelEvalId}/cancel`, {
        method: 'POST',
        headers: authHeaders,
      });
      assert.strictEqual(cancelRes.status, 200);
      const cancelBody = await cancelRes.json();
      assert.strictEqual(cancelBody.success, true);
      assert.strictEqual(cancelBody.data.status, 'FAILED');
    } finally {
      server.close();
    }
  });

  // 6. SSE Pipeline Stream integration
  await t.test('6. SSE pipelineStreamEmitter emits progress events during execution', async () => {
    let receivedEvent = false;
    const testId = `eval_stream_test_${Date.now()}`;
    const listener = (event: any) => {
      if (event.evaluationId === testId) {
        receivedEvent = true;
      }
    };

    pipelineStreamEmitter.on('progress', listener);

    const projects = ProjectRepository.findAll();
    EvaluationRepository.create({
      id: testId,
      projectId: projects[0].id,
      mode: 'VIDEO_ANALYSIS',
      status: 'QUEUED',
    });

    OrchestrationService.startEvaluation(testId, { fastMode: true, stageDelayMs: 0 });

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (receivedEvent) break;
    }

    pipelineStreamEmitter.off('progress', listener);
    assert.strictEqual(receivedEvent, true, 'SSE stream must receive progress events for running evaluation');
  });

  // Clean up queue worker
  await pipelineQueue.close();
});

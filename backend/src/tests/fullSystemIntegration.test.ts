// ====================================================
// PROJECTX-RAY AI - PHASE 12: FULL SYSTEM INTEGRATION TEST SUITE
// ====================================================

import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { app } from '../server';
import { db } from '../db/database';
import { EvaluationOrchestrator } from '../pipeline/evaluationOrchestrator';
import { EvaluationStateMachine, InvalidStateTransitionError, EvaluationLockedError } from '../pipeline/evaluationStateMachine';
import { EvaluationIntegrityChecker } from '../pipeline/evaluationIntegrityChecker';
import { AnalysisImpactResolver } from '../pipeline/analysisImpactResolver';
import { IntegrationRepository } from '../repositories/integrationRepository';
import { AuthorizationService } from '../services/authorizationService';
import { StorageService } from '../services/storageService';
import { UrlSecurity } from '../services/urlSecurity';
import { SystemHealthService } from '../services/systemHealthService';
import { FeatureFlagService } from '../services/featureFlagService';
import { UsageTracker } from '../services/usageTracker';

test('Phase 12: Full System Integration & Production Hardening Test Suite', async (t) => {
  const evaluationId = 'eval_smart-road-vision';

  // 1. End-to-End Orchestrator Pipeline
  await t.test('1. EvaluationOrchestrator runs pipeline through all stages to READY_FOR_REVIEW', async () => {
    IntegrationRepository.updateState(evaluationId, {
      currentState: 'READY',
      isLocked: false
    });
    const progress = await EvaluationOrchestrator.run(evaluationId);

    assert.strictEqual(progress.evaluationId, evaluationId);
    assert.ok(progress.totalStages >= 10);
    assert.ok(progress.completedStages >= 10);
    assert.strictEqual(progress.isCompleted, true);
    assert.strictEqual(progress.isFailed, false);
    assert.strictEqual(progress.currentState, 'READY_FOR_REVIEW');
  });

  // 2. Finite State Machine Valid & Illegal Transitions
  await t.test('2. State Machine enforces valid transitions and rejects illegal transitions', () => {
    // Reset state to DRAFT for test
    IntegrationRepository.updateState(evaluationId, {
      currentState: 'DRAFT',
      isLocked: false
    });

    // Valid: DRAFT -> READY
    const s1 = EvaluationStateMachine.transition(evaluationId, 'READY');
    assert.strictEqual(s1.currentState, 'READY');

    // Valid: READY -> INGESTING
    const s2 = EvaluationStateMachine.transition(evaluationId, 'INGESTING');
    assert.strictEqual(s2.currentState, 'INGESTING');

    // Illegal: INGESTING -> FINAL (must throw InvalidStateTransitionError)
    assert.throws(
      () => EvaluationStateMachine.transition(evaluationId, 'FINAL'),
      InvalidStateTransitionError
    );

    // Fail transition
    const sFail = EvaluationStateMachine.fail(evaluationId, 'TEST_STAGE', 'Simulated failure');
    assert.strictEqual(sFail.currentState, 'FAILED');
    assert.strictEqual(sFail.retryCount >= 1, true);

    // Retry transition
    const sRetry = EvaluationStateMachine.retryFromCheckpoint(evaluationId, 'READY');
    assert.strictEqual(sRetry.currentState, 'READY');
  });

  // 3. Final Evaluation Lock & Tamper Prevention
  await t.test('3. Evaluation Lock prevents modifications once FINAL without a revision', () => {
    IntegrationRepository.updateState(evaluationId, {
      currentState: 'READY_FOR_REVIEW',
      isLocked: false
    });

    // Finalize
    EvaluationStateMachine.transition(evaluationId, 'FINAL');
    const state = IntegrationRepository.getState(evaluationId);
    assert.strictEqual(state?.currentState, 'FINAL');
    assert.strictEqual(state?.isLocked, true);

    // Attempt modification while locked
    assert.throws(
      () => EvaluationStateMachine.transition(evaluationId, 'EVALUATING'),
      EvaluationLockedError
    );

    // Unlock for subsequent tests
    IntegrationRepository.updateState(evaluationId, { isLocked: false, currentState: 'READY_FOR_REVIEW' });
  });

  // 4. Partial Analysis & Graceful Degradation
  await t.test('4. Partial Analysis tolerates missing media, documents, or degraded research', async () => {
    IntegrationRepository.updateState(evaluationId, {
      currentState: 'READY',
      isLocked: false
    });
    const progress = await EvaluationOrchestrator.run(evaluationId, {
      skipMedia: true,
      skipResearch: true
    });

    assert.strictEqual(progress.isFailed, false);
    assert.ok(progress.percentage > 0);
  });

  // 5. Data Consistency & Integrity Checker
  await t.test('5. EvaluationIntegrityChecker validates rubric weights, bounds, and score determinism', () => {
    const result = EvaluationIntegrityChecker.check(evaluationId);

    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.isWeightsValid, true);
    assert.strictEqual(result.weightsSum, 100);
    assert.strictEqual(result.isScoreBounded, true);
    assert.strictEqual(result.calculatedScore, 83.7);
    assert.strictEqual(result.baselineScore, 83.7);
    assert.strictEqual(result.isScoreDeterministic, true);
    assert.strictEqual(result.errors.length, 0);
  });

  // 6. Score Reproducibility Across Multiple Invocations
  await t.test('6. Score Reproducibility ensures exact numeric consistency (83.7)', () => {
    const r1 = EvaluationIntegrityChecker.check(evaluationId);
    const r2 = EvaluationIntegrityChecker.check(evaluationId);
    const r3 = EvaluationIntegrityChecker.check(evaluationId);

    assert.strictEqual(r1.calculatedScore, 83.7);
    assert.strictEqual(r2.calculatedScore, 83.7);
    assert.strictEqual(r3.calculatedScore, 83.7);
  });

  // 7. Authorization & Tenant Isolation
  await t.test('7. AuthorizationService enforces role boundaries and project ownership', () => {
    const userContext = { userId: 'usr_other', role: 'USER' as const, email: 'user@test.com' };
    const adminContext = { userId: 'usr_admin', role: 'ADMIN' as const, email: 'admin@test.com' };

    assert.strictEqual(AuthorizationService.canFinalizeEvaluation(userContext), false);
    assert.strictEqual(AuthorizationService.canFinalizeEvaluation(adminContext), true);
    assert.strictEqual(AuthorizationService.canManageSystem(userContext), false);
    assert.strictEqual(AuthorizationService.canManageSystem(adminContext), true);
  });

  // 8. Storage & File Security
  await t.test('8. StorageService rejects path traversal and dangerous executable uploads', () => {
    // Normal file
    const valid = StorageService.validateUpload('presentation.pdf', 1024 * 1024);
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.extension, '.pdf');

    // Path traversal attempt
    const traversal = StorageService.validateUpload('../../../etc/passwd.pdf', 1024);
    assert.strictEqual(traversal.isValid, true);
    assert.ok(!traversal.sanitizedFilename.includes('..'));

    // Executable rejection
    const exe = StorageService.validateUpload('payload.exe', 1024, 'application/x-msdownload');
    assert.strictEqual(exe.isValid, false);
    assert.ok(exe.error?.includes('not supported'));
  });

  // 9. URL Security & SSRF Defense
  await t.test('9. UrlSecurity blocks localhost, private IPs, and non-http protocols', () => {
    assert.strictEqual(UrlSecurity.validate('https://github.com/project/core').isValid, true);
    assert.strictEqual(UrlSecurity.validate('http://127.0.0.1:8080/secret').isValid, false);
    assert.strictEqual(UrlSecurity.validate('http://localhost:3000/admin').isValid, false);
    assert.strictEqual(UrlSecurity.validate('http://169.254.169.254/metadata').isValid, false);
    assert.strictEqual(UrlSecurity.validate('ftp://files.example.com').isValid, false);
  });

  // 10. Human Review & Evidence Request Flow
  await t.test('10. Human Review creates and updates EvidenceRequests', () => {
    const req = IntegrationRepository.createEvidenceRequest(
      evaluationId,
      'Test Dataset Verification',
      'Provide CSV log from testing',
      'HIGH',
      'Auditor'
    );

    assert.strictEqual(req.status, 'OPEN');
    assert.strictEqual(req.title, 'Test Dataset Verification');

    const updated = IntegrationRepository.updateEvidenceRequest(req.id, 'REVIEWED', 'Verified by reviewer');
    assert.strictEqual(updated?.status, 'REVIEWED');
  });

  // 11. Selective Re-analysis & Revision System
  await t.test('11. AnalysisImpactResolver determines impacted modules and logs revision', () => {
    const impact = AnalysisImpactResolver.resolve(
      evaluationId,
      'VIDEO_TELEMETRY',
      'ev_vid_new_01',
      'Updated hardware demo video'
    );

    assert.strictEqual(impact.requiresReportRegeneration, true);
    assert.ok(impact.impactedModules.includes('VIDEO_PROCESSING'));
    assert.ok(impact.impactedModules.includes('REPORT_GENERATION'));

    const revisions = IntegrationRepository.getRevisions(evaluationId);
    assert.ok(revisions.length > 0);
  });

  // 12. System Health, Usage Tracking, & Feature Flags
  await t.test('12. SystemHealth, UsageTracker, and FeatureFlag services provide metrics', () => {
    const metrics = SystemHealthService.getMetrics();
    assert.ok(metrics.uptimeSeconds >= 0);
    assert.ok(metrics.providers.length >= 4);

    const usage = UsageTracker.track(
      evaluationId,
      'OpenAI GPT-4o',
      'TEST_INFERENCE',
      1500,
      400,
      120
    );
    assert.ok(usage.estimatedCost > 0);

    const flags = FeatureFlagService.getAll();
    assert.ok(flags.length >= 5);
    assert.strictEqual(FeatureFlagService.isEnabled('LIVE_CAMERA'), true);
  });

  // 13. REST Endpoints for Orchestrator and Admin
  await t.test('13. REST Endpoints: orchestrator status, integrity, admin health, and usage', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const base = `http://localhost:${port}/api/evaluations/${evaluationId}`;
    const adminBase = `http://localhost:${port}/api/admin`;

    try {
      // Status
      const resStatus = await fetch(`${base}/orchestrate/status`);
      assert.strictEqual(resStatus.status, 200);
      const jsonStatus = await resStatus.json();
      assert.strictEqual(jsonStatus.success, true);
      assert.ok(jsonStatus.data.totalStages > 0);

      // Integrity
      const resInteg = await fetch(`${base}/integrity`);
      assert.strictEqual(resInteg.status, 200);
      const jsonInteg = await resInteg.json();
      assert.strictEqual(jsonInteg.data.isValid, true);

      // Admin Health
      const resHealth = await fetch(`${adminBase}/health`);
      assert.strictEqual(resHealth.status, 200);
      const jsonHealth = await resHealth.json();
      assert.strictEqual(jsonHealth.data.status, 'HEALTHY');

      // Admin Usage
      const resUsage = await fetch(`${adminBase}/usage`);
      assert.strictEqual(resUsage.status, 200);
      const jsonUsage = await resUsage.json();
      assert.ok(jsonUsage.data.totalOperations >= 0);

      // Feature Flags
      const resFlags = await fetch(`${adminBase}/feature-flags`);
      assert.strictEqual(resFlags.status, 200);
      const jsonFlags = await resFlags.json();
      assert.ok(jsonFlags.data.length >= 5);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

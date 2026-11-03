import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { app } from '../server';
import { db } from '../db/database';
import { LiveJuryEngine } from '../live/liveJuryEngine';
import { LiveJuryRepository } from '../repositories/liveJuryRepository';
import { TelemetryBatchQueue } from '../live/telemetryBatchQueue';
import { AdminController } from '../controllers/adminController';
import { signToken } from '../services/tokenService';
import type { LivePresenterTrackingMetrics } from '../models/liveJury';

test('Phase 11c: Batched Telemetry Ingestion & SQLITE_BUSY Elimination Test Suite', async (t) => {
  const repo = new LiveJuryRepository();
  const batchQueue = TelemetryBatchQueue.getInstance();
  const engine = new LiveJuryEngine(repo, batchQueue);
  const evaluationId = 'eval_smart-road-vision';

  t.beforeEach(() => {
    batchQueue.clear();
  });

  t.afterEach(() => {
    batchQueue.clear();
  });

  await t.test('1. In-Memory Buffering: high-frequency frames do NOT trigger synchronous SQLite writes', () => {
    const session = repo.getOrCreateSession(evaluationId);

    // Initial SQLite row count
    const initialDbEventCount = db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM live_events WHERE session_id = ?`,
      session.id
    )?.count || 0;

    // Ingest 30 visual telemetry frames rapidly (simulating 30 FPS stream)
    for (let i = 1; i <= 30; i++) {
      const telemetry: LivePresenterTrackingMetrics = {
        faceDetected: true,
        faceBoundingBox: { x: 100, y: 100, width: 80, height: 80 },
        gazeStatus: i % 5 === 0 ? 'LOOKING_DOWN' : 'DIRECT',
        eyeContactScore: i % 5 === 0 ? 32 : 92,
        headPose: { yaw: 0, pitch: i % 5 === 0 ? 16 : 0, roll: 0 },
        postureStatus: 'UPRIGHT',
        postureStability: 95,
        gestureActivity: 'OPTIMAL',
        slideNumber: 1,
        slideDwellTimeSeconds: i,
        slideTransitionDetected: false,
        lightingQuality: 'GOOD',
        timestampMs: Date.now() + i * 33
      };

      engine.ingestVisualTelemetry(session.id, telemetry, i);
    }

    // Direct SQLite table row count should NOT have increased by 30+ immediately
    const immediateDbEventCount = db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM live_events WHERE session_id = ?`,
      session.id
    )?.count || 0;

    assert.strictEqual(
      immediateDbEventCount,
      initialDbEventCount,
      'SQLite table live_events should not receive immediate synchronous writes per frame'
    );

    // Verify buffered in-memory items
    const pendingEvents = batchQueue.getPendingEvents(session.id);
    assert.ok(pendingEvents.length >= 30, 'All events must be buffered in TelemetryBatchQueue');
    const stats = batchQueue.getStats();
    assert.strictEqual(stats.totalIngestedFrames, 30);
    assert.ok(stats.pendingEventsCount >= 30);
  });

  await t.test('2. Read-Through Consistency: repo queries immediately return buffered in-memory telemetry', () => {
    const session = repo.getOrCreateSession(evaluationId);
    const targetElapsed = (session.currentElapsedSeconds || 0) + 20;

    // Ingest gaze alert frame
    const telemetry: LivePresenterTrackingMetrics = {
      faceDetected: true,
      faceBoundingBox: { x: 90, y: 90, width: 70, height: 70 },
      gazeStatus: 'LOOKING_DOWN',
      eyeContactScore: 28,
      headPose: { yaw: 1, pitch: 19, roll: 0 },
      postureStatus: 'UPRIGHT',
      postureStability: 90,
      gestureActivity: 'OPTIMAL',
      slideNumber: 2,
      slideDwellTimeSeconds: 15,
      slideTransitionDetected: false,
      lightingQuality: 'GOOD',
      timestampMs: Date.now()
    };

    engine.ingestVisualTelemetry(session.id, telemetry, targetElapsed);

    // repo.getEvents MUST merge in-memory pending items without waiting for flush
    const events = repo.getEvents(session.id);
    const gazeWarning = events.find(e => e.eventType === 'GAZE_WARNING');
    assert.ok(gazeWarning, 'Read-through getEvents must return un-flushed GAZE_WARNING event');

    // repo.getObservations MUST merge in-memory pending observations
    const observations = repo.getObservations(session.id);
    const gazeObs = observations.find(o => o.title.includes('Eye Contact Warning'));
    assert.ok(gazeObs, 'Read-through getObservations must return un-flushed observation');

    // repo.getSession MUST return the updated elapsed seconds from pending session updates
    const currentSession = repo.getSession(session.id);
    assert.strictEqual(currentSession?.currentElapsedSeconds, targetElapsed, 'Session elapsed seconds should reflect pending update');
  });

  await t.test('3. Single-Transaction Atomic Flush: background flush commits all pending items in 1 transaction', () => {
    const session = repo.getOrCreateSession(evaluationId);

    // Ingest 25 frames
    for (let i = 1; i <= 25; i++) {
      const telemetry: LivePresenterTrackingMetrics = {
        faceDetected: true,
        faceBoundingBox: { x: 100, y: 100, width: 80, height: 80 },
        gazeStatus: 'DIRECT',
        eyeContactScore: 90,
        headPose: { yaw: 0, pitch: 0, roll: 0 },
        postureStatus: 'UPRIGHT',
        postureStability: 95,
        gestureActivity: 'OPTIMAL',
        slideNumber: 1,
        slideDwellTimeSeconds: i,
        slideTransitionDetected: false,
        lightingQuality: 'GOOD',
        timestampMs: Date.now() + i * 33
      };
      engine.ingestVisualTelemetry(session.id, telemetry, i);
    }

    assert.ok(batchQueue.getStats().pendingEventsCount >= 25);

    // Perform atomic batched flush
    const flushResult = batchQueue.flushSync();
    assert.ok(flushResult.eventsFlushed >= 25, 'Expected at least 25 events flushed');

    // Post-flush: pending buffer should now be empty
    assert.strictEqual(batchQueue.getStats().pendingEventsCount, 0);

    // And items now exist in SQLite
    const dbEvents = db.all<{ id: string }>(
      `SELECT id FROM live_events WHERE session_id = ?`,
      session.id
    );
    assert.ok(dbEvents.length >= 25);
  });

  await t.test('4. Database Write Reduction: achieves >= 90% reduction in database write transactions', () => {
    const session = repo.getOrCreateSession(evaluationId);

    // Ingest 60 frames (equivalent to 2 seconds at 30 FPS or 6 seconds at 10 FPS)
    for (let i = 1; i <= 60; i++) {
      const telemetry: LivePresenterTrackingMetrics = {
        faceDetected: true,
        faceBoundingBox: { x: 100, y: 100, width: 80, height: 80 },
        gazeStatus: i === 10 ? 'LOOKING_DOWN' : 'DIRECT',
        eyeContactScore: i === 10 ? 30 : 90,
        headPose: { yaw: 0, pitch: i === 10 ? 18 : 0, roll: 0 },
        postureStatus: i === 20 ? 'SLUMPED' : 'UPRIGHT',
        postureStability: i === 20 ? 45 : 95,
        gestureActivity: 'OPTIMAL',
        slideNumber: 1,
        slideDwellTimeSeconds: i,
        slideTransitionDetected: i === 30,
        lightingQuality: 'GOOD',
        timestampMs: Date.now() + i * 33
      };
      engine.ingestVisualTelemetry(session.id, telemetry, i);
    }

    // Flush batch
    batchQueue.flushSync();

    const stats = batchQueue.getStats();
    assert.strictEqual(stats.totalBatchesFlushed, 1, 'All 60 frames must flush in exactly 1 batched transaction');
    assert.ok(stats.totalEventsFlushed >= 60);
    assert.ok(
      stats.writeReductionPct >= 90.0,
      `Write reduction must be >= 90%, actual: ${stats.writeReductionPct}%`
    );
  });

  await t.test('5. Session Finalization: automatically flushes pending telemetry before finalizing session', async () => {
    const session = repo.getOrCreateSession(evaluationId);

    // Ingest frames right before session ends
    const finalTelemetry: LivePresenterTrackingMetrics = {
      faceDetected: true,
      faceBoundingBox: { x: 100, y: 100, width: 80, height: 80 },
      gazeStatus: 'DIRECT',
      eyeContactScore: 95,
      headPose: { yaw: 0, pitch: 0, roll: 0 },
      postureStatus: 'UPRIGHT',
      postureStability: 98,
      gestureActivity: 'OPTIMAL',
      slideNumber: 5,
      slideDwellTimeSeconds: 65,
      slideTransitionDetected: false,
      lightingQuality: 'GOOD',
      timestampMs: Date.now()
    };

    engine.ingestVisualTelemetry(session.id, finalTelemetry, 600);
    assert.ok(batchQueue.getStats().pendingEventsCount > 0, 'Frame should be queued prior to finalize');

    // Finalize session
    const result = await engine.finalizeSession(session.id);
    assert.strictEqual(result.sessionId, session.id);
    assert.strictEqual(result.finalScore, 83.7);

    // Pending queues must be 0 because finalizeSession calls flushSessionSync
    assert.strictEqual(batchQueue.getStats().pendingEventsCount, 0);

    // The final event must be securely persisted in SQLite
    const persistedEvents = db.all<{ id: string; description: string }>(
      `SELECT id, description FROM live_events WHERE session_id = ?`,
      session.id
    );
    assert.ok(persistedEvents.some(e => e.description.includes('Slide=#5')));
  });

  await t.test('6. REST Ingestion & Concurrency: handles rapid POST /telemetry without SQLITE_BUSY', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const base = `http://localhost:${port}/api/evaluations/${evaluationId}/live`;
    const token = signToken({ userId: 'usr_admin', role: 'ADMIN', email: 'admin@projectxray.ai' });
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      // Send 20 concurrent POST /telemetry requests simultaneously
      const requests = Array.from({ length: 20 }, (_, idx) => {
        const payload = {
          telemetry: {
            faceDetected: true,
            faceBoundingBox: { x: 100, y: 100, width: 80, height: 80 },
            gazeStatus: 'DIRECT',
            eyeContactScore: 85 + (idx % 10),
            headPose: { yaw: 0, pitch: 0, roll: 0 },
            postureStatus: 'UPRIGHT',
            postureStability: 90,
            gestureActivity: 'OPTIMAL',
            slideNumber: 3,
            slideDwellTimeSeconds: 20 + idx,
            slideTransitionDetected: false,
            lightingQuality: 'GOOD',
            timestampMs: Date.now() + idx * 10
          },
          elapsedSeconds: 150 + idx
        };

        return fetch(`${base}/telemetry`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload)
        });
      });

      const responses = await Promise.all(requests);
      for (const res of responses) {
        assert.strictEqual(res.status, 200, 'Every concurrent telemetry request must succeed (no SQLITE_BUSY)');
        const json = await res.json();
        assert.strictEqual(json.success, true);
        assert.ok(json.data.snapshot);
      }

      // Check Admin status endpoint for batchQueue telemetry
      let statusResponse: any = null;
      const mockRes: any = {
        status: () => mockRes,
        json: (data: any) => { statusResponse = data; }
      };
      AdminController.getLiveJuryStatus({} as any, mockRes);
      assert.strictEqual(statusResponse.success, true);
      assert.ok(statusResponse.data.batchQueue);
      assert.ok(statusResponse.data.batchQueue.flushIntervalMs === 5000);
      assert.strictEqual(typeof statusResponse.data.batchQueue.writeReductionPct, 'number');
    } finally {
      server.close();
    }
  });

  await t.test('7. Background Worker Lifecycle: startWorker and stopWorker gracefully control timer', () => {
    // Start worker
    batchQueue.startWorker(2000);
    assert.strictEqual(batchQueue.getStats().isWorkerRunning, true);
    assert.strictEqual(batchQueue.getStats().flushIntervalMs, 2000);

    // Stop worker
    batchQueue.stopWorker();
    assert.strictEqual(batchQueue.getStats().isWorkerRunning, false);
  });
});

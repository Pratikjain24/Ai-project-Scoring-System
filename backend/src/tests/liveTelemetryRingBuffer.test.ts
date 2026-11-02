import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { app } from '../server';
import { LiveJuryEngine } from '../live/liveJuryEngine';
import { LiveJuryRepository } from '../repositories/liveJuryRepository';
import { TelemetryRingBuffer, summarizePresenterMetrics } from '../live/telemetryRingBuffer';
import { signToken } from '../services/tokenService';
import type { LivePresenterTrackingMetrics } from '../models/liveJury';

test('Phase 11b: Live Presenter Telemetry Sliding Window Ring Buffer (Bug #5 Elimination)', async (t) => {
  const repo = new LiveJuryRepository();
  const engine = new LiveJuryEngine(repo);
  const evaluationId = 'eval_smart-road-vision';

  const createDummyMetrics = (index: number, eyeContact = 85, posture = 90): LivePresenterTrackingMetrics => ({
    faceDetected: true,
    faceBoundingBox: { x: 100, y: 50, width: 120, height: 150 },
    gazeStatus: eyeContact >= 70 ? 'DIRECT' : eyeContact >= 40 ? 'LOOKING_DOWN' : 'LOOKING_AWAY',
    eyeContactScore: eyeContact,
    headPose: { yaw: (index % 10) - 5, pitch: (index % 6) - 3, roll: 0 },
    postureStatus: posture >= 70 ? 'UPRIGHT' : 'SLUMPED',
    postureStability: posture,
    gestureActivity: 'OPTIMAL',
    slideNumber: Math.floor(index / 50) + 1,
    slideDwellTimeSeconds: (index % 50) + 1,
    slideTransitionDetected: index % 50 === 0,
    lightingQuality: 'GOOD',
    timestampMs: Date.now() + index * 500
  });

  await t.test('1. TelemetryRingBuffer Core: enforces fixed capacity and FIFO eviction', () => {
    const buffer = new TelemetryRingBuffer<{ id: number; value: string }>({ maxSize: 5 });

    assert.strictEqual(buffer.size, 0);
    assert.strictEqual(buffer.capacity, 5);
    assert.strictEqual(buffer.isEmpty, true);
    assert.strictEqual(buffer.isFull, false);

    // Push 3 items
    buffer.push({ id: 1, value: 'one' });
    buffer.push({ id: 2, value: 'two' });
    buffer.push({ id: 3, value: 'three' });

    assert.strictEqual(buffer.size, 3);
    assert.strictEqual(buffer.getOldest()?.id, 1);
    assert.strictEqual(buffer.getLatest()?.id, 3);
    assert.deepStrictEqual(buffer.toArray().map(i => i.id), [1, 2, 3]);

    // Push to capacity
    buffer.push({ id: 4, value: 'four' });
    buffer.push({ id: 5, value: 'five' });
    assert.strictEqual(buffer.size, 5);
    assert.strictEqual(buffer.isFull, true);
    assert.strictEqual(buffer.evictedCount, 0);

    // Exceed capacity: item 1 must be evicted (FIFO)
    const evicted1 = buffer.push({ id: 6, value: 'six' });
    assert.strictEqual(evicted1?.id, 1);
    assert.strictEqual(buffer.size, 5); // Must remain bounded to 5
    assert.strictEqual(buffer.evictedCount, 1);
    assert.strictEqual(buffer.totalPushed, 6);
    assert.strictEqual(buffer.getOldest()?.id, 2);
    assert.strictEqual(buffer.getLatest()?.id, 6);
    assert.deepStrictEqual(buffer.toArray().map(i => i.id), [2, 3, 4, 5, 6]);

    // Exceed capacity again: item 2 must be evicted
    const evicted2 = buffer.push({ id: 7, value: 'seven' });
    assert.strictEqual(evicted2?.id, 2);
    assert.strictEqual(buffer.size, 5);
    assert.strictEqual(buffer.evictedCount, 2);
    assert.strictEqual(buffer.totalPushed, 7);
    assert.deepStrictEqual(buffer.toArray().map(i => i.id), [3, 4, 5, 6, 7]);
  });

  await t.test('2. 45-Minute Continuous Stream Simulation (5,400 frames): zero memory bloat', () => {
    // 45 minutes of 500ms intervals = 5,400 frames
    const TOTAL_FRAMES = 5400;
    const CAPACITY = 100;
    const buffer = new TelemetryRingBuffer<LivePresenterTrackingMetrics>({ maxSize: CAPACITY });

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      buffer.push(createDummyMetrics(i));
    }

    // Memory footprint MUST be strictly bounded to 100 items
    assert.strictEqual(buffer.size, CAPACITY);
    assert.strictEqual(buffer.totalPushed, TOTAL_FRAMES);
    assert.strictEqual(buffer.evictedCount, TOTAL_FRAMES - CAPACITY); // Exactly 5,300 items evicted

    // Contents must be exactly frames 5,301 through 5,400 in strict chronological order
    const array = buffer.toArray();
    assert.strictEqual(array.length, CAPACITY);
    assert.strictEqual(buffer.getOldest()?.slideDwellTimeSeconds, (5301 % 50) + 1);
    assert.strictEqual(buffer.getLatest()?.slideDwellTimeSeconds, (5400 % 50) + 1);

    const stats = buffer.getStats();
    assert.strictEqual(stats.size, 100);
    assert.strictEqual(stats.capacity, 100);
    assert.strictEqual(stats.totalPushed, 5400);
    assert.strictEqual(stats.evictedCount, 5300);
  });

  await t.test('3. Statistical Rolling Averages & Summarization: eye contact, posture, gaze', () => {
    const buffer = new TelemetryRingBuffer<LivePresenterTrackingMetrics>({ maxSize: 10 });

    // Push 5 frames with 90% eye contact and 5 frames with 70% eye contact -> Average = 80%
    for (let i = 0; i < 5; i++) buffer.push(createDummyMetrics(i, 90, 80));
    for (let i = 5; i < 10; i++) buffer.push(createDummyMetrics(i, 70, 60));

    const avgEye = buffer.getAverage(m => m.eyeContactScore);
    const avgPosture = buffer.getAverage(m => m.postureStability);
    assert.strictEqual(avgEye, 80);
    assert.strictEqual(avgPosture, 70);

    const summary = summarizePresenterMetrics(buffer);
    assert.ok(summary);
    assert.strictEqual(summary.sampleCount, 10);
    assert.strictEqual(summary.averageEyeContactScore, 80);
    assert.strictEqual(summary.averagePostureStability, 70);
    assert.ok(summary.gazeDistribution.directPct >= 50);
  });

  await t.test('4. LiveJuryEngine Integration: buffers live visual telemetry with sliding window', () => {
    const session = repo.getOrCreateSession(evaluationId, { role: 'PRESENTER', mockMode: false });

    // Ingest 150 frames into session
    for (let i = 1; i <= 150; i++) {
      engine.ingestVisualTelemetry(session.id, createDummyMetrics(i, 82, 88), i);
    }

    // Buffer MUST be bounded to LiveJuryEngine.MAX_TELEMETRY_BUFFER_SIZE (100)
    const ringBuffer = engine.getTelemetryRingBuffer(session.id);
    assert.ok(ringBuffer);
    assert.strictEqual(ringBuffer.size, 100);
    assert.strictEqual(ringBuffer.totalPushed, 150);
    assert.strictEqual(ringBuffer.evictedCount, 50);

    // Recent telemetry query
    const recent20 = engine.getRecentVisualTelemetry(session.id, 20);
    assert.strictEqual(recent20.length, 20);

    // Diagnostics stats
    const stats = engine.getTelemetryBufferStats(session.id);
    assert.strictEqual(stats?.size, 100);
    assert.strictEqual(stats?.totalPushed, 150);
    assert.strictEqual(stats?.evictedCount, 50);

    // Snapshot incorporates rolling visual metrics
    const snapshot = engine.getScoreSnapshot(session.id);
    assert.ok(snapshot.visualMetrics);
    assert.strictEqual(snapshot.visualTelemetryCount, 150);
  });

  await t.test('5. Multi-Session Isolation: telemetry buffers remain strictly partitioned', () => {
    const sessionA = repo.getOrCreateSession('eval_aquapurify-osmo');
    const sessionB = repo.getOrCreateSession('eval_bioprint-osteo');

    engine.ingestVisualTelemetry(sessionA.id, createDummyMetrics(1, 95, 90), 1);
    engine.ingestVisualTelemetry(sessionA.id, createDummyMetrics(2, 95, 90), 2);

    engine.ingestVisualTelemetry(sessionB.id, createDummyMetrics(10, 40, 50), 1);

    const bufferA = engine.getTelemetryRingBuffer(sessionA.id);
    const bufferB = engine.getTelemetryRingBuffer(sessionB.id);

    assert.strictEqual(bufferA?.size, 2);
    assert.strictEqual(bufferB?.size, 1);
    assert.strictEqual(bufferA?.getLatest()?.eyeContactScore, 95);
    assert.strictEqual(bufferB?.getLatest()?.eyeContactScore, 40);

    assert.ok(engine.getActiveTelemetrySessionCount() >= 2);
  });

  await t.test('6. Lifecycle Memory Cleanup: finalizeSession prunes in-memory telemetry buffer', async () => {
    const session = repo.getOrCreateSession('eval_finguard-gnn', { role: 'PRESENTER', mockMode: false });

    // Ingest telemetry
    engine.ingestVisualTelemetry(session.id, createDummyMetrics(1), 1);
    engine.ingestVisualTelemetry(session.id, createDummyMetrics(2), 2);
    assert.strictEqual(engine.getTelemetryRingBuffer(session.id)?.size, 2);

    // Finalize session
    await engine.finalizeSession(session.id);

    // Buffer MUST be pruned from memory
    assert.strictEqual(engine.getTelemetryRingBuffer(session.id), undefined);
    assert.strictEqual(engine.getLatestVisualTelemetry(session.id), undefined);
  });

  await t.test('7. REST Endpoints: GET /telemetry/recent and Admin diagnostics', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const base = `http://localhost:${port}/api/evaluations/${evaluationId}/live`;
    const token = signToken({ userId: 'usr_admin', role: 'ADMIN', email: 'admin@projectxray.ai' });
    const authHeaders = { Authorization: `Bearer ${token}` };

    try {
      // 1. Ingest telemetry via POST /telemetry
      const postRes = await fetch(`${base}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ telemetry: createDummyMetrics(1, 92, 94), elapsedSeconds: 400 })
      });
      assert.strictEqual(postRes.status, 200);

      // 2. Query recent telemetry via GET /telemetry/recent
      const recentRes = await fetch(`${base}/telemetry/recent?limit=25`, { headers: authHeaders });
      assert.strictEqual(recentRes.status, 200);
      const recentJson = await recentRes.json();

      assert.strictEqual(recentJson.success, true);
      assert.ok(Array.isArray(recentJson.data.items));
      assert.ok(recentJson.data.stats);
      assert.strictEqual(recentJson.data.stats.capacity, 100);

      // 3. Query admin status to verify buffer telemetry diagnostics
      const adminRes = await fetch(`http://localhost:${port}/api/admin/live-jury/status`, { headers: authHeaders });
      assert.strictEqual(adminRes.status, 200);
      const adminJson = await adminRes.json();

      assert.strictEqual(adminJson.success, true);
      assert.ok(adminJson.data.telemetryBuffer);
      assert.strictEqual(adminJson.data.telemetryBuffer.maxBufferSizePerSession, 100);
      assert.strictEqual(adminJson.data.telemetryBuffer.evictionPolicy, 'FIFO_SLIDING_WINDOW');
      assert.ok(typeof adminJson.data.telemetryBuffer.activeSessions === 'number');
    } finally {
      server.close();
    }
  });
});

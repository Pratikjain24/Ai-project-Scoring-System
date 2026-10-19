import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { app } from '../server';
import { db } from '../db/database';
import { LiveJuryEngine } from '../live/liveJuryEngine';
import { LiveJuryRepository } from '../repositories/liveJuryRepository';
import { AdminController } from '../controllers/adminController';
import { signToken } from '../services/tokenService';
import type { LivePresenterTrackingMetrics } from '../models/liveJury';

test('Phase 11: Live Camera AI Jury Engine Test Suite', async (t) => {
  const repo = new LiveJuryRepository();
  const engine = new LiveJuryEngine(repo);
  const evaluationId = 'eval_smart-road-vision';

  await t.test('1. Session Lifecycle: start, pause, resume, and status checks', () => {
    const session = engine.startSession(evaluationId, { role: 'PRESENTER', mockMode: false });
    assert.ok(session.id.startsWith('live_sess_'));
    assert.strictEqual(session.status, 'LIVE');
    assert.strictEqual(session.isRecording, true);

    const paused = engine.pauseSession(session.id);
    assert.strictEqual(paused?.status, 'PAUSED');
    assert.strictEqual(paused?.isRecording, false);

    const resumed = engine.resumeSession(session.id);
    assert.strictEqual(resumed?.status, 'LIVE');
    assert.strictEqual(resumed?.isRecording, true);

    const retrieved = repo.getSession(session.id);
    assert.strictEqual(retrieved?.id, session.id);
  });

  await t.test('2. Streaming Transcription: distinguishes partial vs final segments', () => {
    const session = repo.getOrCreateSession(evaluationId);

    // Ingest partial transcript
    const partial = engine.ingestTranscript(
      session.id,
      'Our model achieves 95 percent',
      false, // partial
      10,
      'Presenter'
    );
    assert.strictEqual(partial.segment.isFinal, false);

    // Ingest finalized transcript
    const final = engine.ingestTranscript(
      session.id,
      'Our model achieves 95% detection accuracy in real-time road conditions.',
      true, // final
      14,
      'Presenter'
    );
    assert.strictEqual(final.segment.isFinal, true);
    assert.ok(final.detectedClaims.length > 0);
    assert.strictEqual(final.detectedClaims[0].claimId, 'clm_smart_road_01');

    const transcript = repo.getTranscript(session.id);
    assert.ok(transcript.length >= 2);
  });

  await t.test('3. Real-Time Claim Detection & Deduplication', () => {
    const session = repo.getOrCreateSession(evaluationId);
    db.run(`DELETE FROM live_claim_occurrences WHERE session_id = ?`, session.id);

    // First mention
    const first = engine.ingestTranscript(
      session.id,
      'We run inference under 22.4ms per frame on the Jetson Orin.',
      true,
      30
    );
    assert.strictEqual(first.detectedClaims[0].isRepeated, false);
    assert.strictEqual(first.detectedClaims[0].repeatCount, 1);

    // Second mention of same claim (repeat)
    const second = engine.ingestTranscript(
      session.id,
      'As mentioned, Jetson Orin processing latency is under 25ms.',
      true,
      65
    );
    assert.strictEqual(second.detectedClaims[0].isRepeated, true);
    assert.strictEqual(second.detectedClaims[0].repeatCount, 2);
    assert.strictEqual(second.detectedClaims[0].occurrenceType, 'REPEATED_CLAIM');
  });

  await t.test('4. Live Demo Event Recognition & Status Classification', () => {
    const session = repo.getOrCreateSession(evaluationId);

    const demo = engine.recordDemoEvent(
      session.id,
      'Live Jetson Orin Inference',
      'Dual video streams processed at 42.4 FPS with 22.4ms latency counter.',
      'SUCCESS',
      120,
      'NVIDIA Jetson Orin Nano'
    );

    assert.ok(demo.id.startsWith('demo_ev_'));
    assert.strictEqual(demo.status, 'SUCCESS');
    assert.strictEqual(demo.hardwareInvolved, 'NVIDIA Jetson Orin Nano');

    const demos = repo.getDemoEvents(session.id);
    assert.ok(demos.some(d => d.id === demo.id));
  });

  await t.test('5. Adaptive Judge Questions: triggers on evidence gaps without interruption', () => {
    const session = repo.getOrCreateSession(evaluationId);

    const questionsBefore = repo.getJudgeQuestions(session.id);

    // Presenter makes accuracy claim -> triggers adaptive question suggestion
    engine.ingestTranscript(
      session.id,
      'Our team reached 95% accuracy in road hazard detection.',
      true,
      180
    );

    const questionsAfter = repo.getJudgeQuestions(session.id);
    assert.ok(questionsAfter.length >= questionsBefore.length);
    const suggested = questionsAfter.find(q => q.question.includes('95% accuracy'));
    assert.ok(suggested);
    assert.strictEqual(suggested?.status, 'SUGGESTED');
    assert.ok(suggested?.reason.includes('Accuracy claim'));
  });

  await t.test('6. Q&A Technical Completeness Analysis: evaluates answer depth', () => {
    const session = repo.getOrCreateSession(evaluationId);
    const q = repo.addJudgeQuestion({
      sessionId: session.id,
      suggestedAtMs: 200000,
      suggestedAtFormatted: '03:20',
      question: 'What independent test set was used to validate the accuracy claim?',
      reason: 'Validation protocol missing',
      evidenceGap: 'Independent dataset split unspecified',
      status: 'SUGGESTED'
    });

    // Ask question
    const asked = engine.askQuestion(q.id, 205);
    assert.strictEqual(asked?.status, 'ASKED');

    // Answer with specific numbers but missing independent split -> PARTIALLY_ADDRESSED
    const answered = engine.recordAnswer(
      q.id,
      'We tested across 12,000 labeled frames from municipal road survey footage.',
      220
    );
    assert.strictEqual(answered?.answerStatus, 'PARTIALLY_ADDRESSED');
    assert.ok(answered?.missingPoints && answered.missingPoints.length > 0);
  });

  await t.test('7. Judge Controls: Notes and Flagged Concerns', () => {
    const session = repo.getOrCreateSession(evaluationId);

    const note = engine.addJudgeNote(
      session.id,
      'Check if thermal throttling was monitored during continuous 42 FPS operation.',
      true, // flagged concern
      true, // isBookmarked
      250
    );

    assert.ok(note.id.startsWith('note_'));
    assert.strictEqual(note.flaggedConcern, true);
    assert.strictEqual(note.isBookmarked, true);

    const notes = repo.getJudgeNotes(session.id);
    assert.ok(notes.some(n => n.id === note.id));
  });

  await t.test('8. Live Indicators & Score Snapshot: non-fluctuating range', () => {
    const session = repo.getOrCreateSession(evaluationId);
    const snapshot = engine.getScoreSnapshot(session.id);

    assert.ok(snapshot.evidenceCount > 0);
    assert.strictEqual(typeof snapshot.claimsDetected, 'number');
    assert.strictEqual(typeof snapshot.demoEventsCount, 'number');
    assert.ok(snapshot.provisionalScoreRange.length > 0);
  });

  await t.test('9. Session Finalization Pipeline: feeds live evidence to Master Scoring (83.7)', async () => {
    const session = repo.getOrCreateSession(evaluationId);
    const result = await engine.finalizeSession(session.id);

    assert.strictEqual(result.sessionId, session.id);
    assert.strictEqual(result.evaluationId, evaluationId);
    assert.strictEqual(result.finalScore, 83.7);
    assert.strictEqual(result.verdict, 'STRONG');
    assert.ok(result.confidence === 86 || result.confidence === 0.86);
    assert.ok(result.totalEvidenceCount > 0);
    assert.ok(result.reportId.length > 0);

    const updatedSession = repo.getSession(session.id);
    assert.strictEqual(updatedSession?.status, 'COMPLETED');
  });

  await t.test('10. REST API Endpoints: live status, events, transcript, demo, notes, and finalization', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const base = `http://localhost:${port}/api/evaluations/${evaluationId}/live`;
    const token = signToken({ userId: 'usr_admin', role: 'ADMIN', email: 'admin@projectxray.ai' });
    const authHeaders = { Authorization: `Bearer ${token}` };

    try {
      // 1. GET /status
      const statusRes = await fetch(`${base}/status`, { headers: authHeaders });
      assert.strictEqual(statusRes.status, 200);
      const statusData = await statusRes.json();
      assert.ok(statusData.data.session);
      assert.ok(statusData.data.snapshot);

      // 2. POST /start
      const startRes = await fetch(`${base}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ role: 'JUDGE', mockMode: true })
      });
      assert.strictEqual(startRes.status, 200);
      const startData = await startRes.json();
      assert.strictEqual(startData.data.session.status, 'LIVE');

      // 3. GET /events
      const eventsRes = await fetch(`${base}/events`, { headers: authHeaders });
      assert.strictEqual(eventsRes.status, 200);
      const eventsData = await eventsRes.json();
      assert.ok(Array.isArray(eventsData.data));
      assert.ok(eventsData.data.length > 0);

      // 4. GET /transcript
      const transRes = await fetch(`${base}/transcript`, { headers: authHeaders });
      assert.strictEqual(transRes.status, 200);
      const transData = await transRes.json();
      assert.ok(Array.isArray(transData.data));

      // 5. GET /observations
      const obsRes = await fetch(`${base}/observations`, { headers: authHeaders });
      assert.strictEqual(obsRes.status, 200);
      const obsData = await obsRes.json();
      assert.ok(Array.isArray(obsData.data));

      // 6. GET /claims
      const claimsRes = await fetch(`${base}/claims`, { headers: authHeaders });
      assert.strictEqual(claimsRes.status, 200);
      const claimsData = await claimsRes.json();
      assert.ok(Array.isArray(claimsData.data));

      // 7. GET /demo
      const demoRes = await fetch(`${base}/demo`, { headers: authHeaders });
      assert.strictEqual(demoRes.status, 200);
      const demoData = await demoRes.json();
      assert.ok(Array.isArray(demoData.data));

      // 8. GET /questions
      const qRes = await fetch(`${base}/questions`, { headers: authHeaders });
      assert.strictEqual(qRes.status, 200);
      const qData = await qRes.json();
      assert.ok(Array.isArray(qData.data));

      // 9. POST /notes
      const noteRes = await fetch(`${base}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          note: 'REST test note: Jetson Orin thermal performance verified',
          flaggedConcern: false,
          isBookmarked: true
        })
      });
      assert.strictEqual(noteRes.status, 201);
      const noteData = await noteRes.json();
      assert.strictEqual(noteData.data.isBookmarked, true);

      // 10. POST /pause & /resume
      const pauseRes = await fetch(`${base}/pause`, { method: 'POST', headers: authHeaders });
      assert.strictEqual(pauseRes.status, 200);
      const pauseData = await pauseRes.json();
      assert.strictEqual(pauseData.data.status, 'PAUSED');

      const resumeRes = await fetch(`${base}/resume`, { method: 'POST', headers: authHeaders });
      assert.strictEqual(resumeRes.status, 200);
      const resumeData = await resumeRes.json();
      assert.strictEqual(resumeData.data.status, 'LIVE');

      // 11. POST /end
      const endRes = await fetch(`${base}/end`, { method: 'POST', headers: authHeaders });
      assert.strictEqual(endRes.status, 200);
      const endData = await endRes.json();
      assert.strictEqual(endData.data.finalScore, 83.7);
      assert.strictEqual(endData.data.verdict, 'STRONG');
    } finally {
      server.close();
    }
  });

  await t.test('11. Real-Time Presenter Face & Gaze Tracking: detects looking down and diverted gaze', () => {
    const session = repo.getOrCreateSession(evaluationId);

    // Telemetry: presenter looking down at notes (eye contact 30%)
    const downTelemetry: LivePresenterTrackingMetrics = {
      faceDetected: true,
      faceBoundingBox: { x: 100, y: 50, width: 120, height: 150 },
      gazeStatus: 'LOOKING_DOWN',
      eyeContactScore: 30,
      headPose: { yaw: 2, pitch: 18, roll: 0 },
      postureStatus: 'UPRIGHT',
      postureStability: 90,
      gestureActivity: 'OPTIMAL',
      slideNumber: 2,
      slideDwellTimeSeconds: 40,
      slideTransitionDetected: false,
      lightingQuality: 'GOOD',
      timestampMs: Date.now()
    };

    const res = engine.ingestVisualTelemetry(session.id, downTelemetry, 260);
    assert.ok(res.event);
    assert.strictEqual(res.event.eventType, 'PRESENTER_CV_TELEMETRY');

    const events = repo.getEvents(session.id);
    const gazeWarning = events.find(e => e.eventType === 'GAZE_WARNING');
    assert.ok(gazeWarning, 'Expected GAZE_WARNING event when presenter looks down at notes');
    assert.ok(gazeWarning.description.includes('eye-contact dipped to 30%'));

    const obs = repo.getObservations(session.id);
    const gazeObs = obs.find(o => o.title.includes('Eye Contact Warning'));
    assert.ok(gazeObs);
  });

  await t.test('12. Posture & Ergonomics Analysis: flags slumped presenter posture', () => {
    const session = repo.getOrCreateSession(evaluationId);

    const slumpedTelemetry: LivePresenterTrackingMetrics = {
      faceDetected: true,
      faceBoundingBox: { x: 90, y: 110, width: 100, height: 110 },
      gazeStatus: 'DIRECT',
      eyeContactScore: 82,
      headPose: { yaw: 0, pitch: 8, roll: 2 },
      postureStatus: 'SLUMPED',
      postureStability: 48,
      gestureActivity: 'LOW',
      slideNumber: 2,
      slideDwellTimeSeconds: 70,
      slideTransitionDetected: false,
      lightingQuality: 'GOOD',
      timestampMs: Date.now()
    };

    engine.ingestVisualTelemetry(session.id, slumpedTelemetry, 275);

    const events = repo.getEvents(session.id);
    const postureAlert = events.find(e => e.eventType === 'POSTURE_ALERT');
    assert.ok(postureAlert, 'Expected POSTURE_ALERT event when presenter slumps');
    assert.ok(postureAlert.description.includes('slumped'));

    const obs = repo.getObservations(session.id);
    const postureObs = obs.find(o => o.title.includes('Ergonomic Alert: Presenter Slumping'));
    assert.ok(postureObs);
  });

  await t.test('13. Slide Change Detection & Dwell Time Pacing: alerts on rushed slides (<15s)', () => {
    const session = repo.getOrCreateSession(evaluationId);

    // Slide 3 rushed transition (dwell time 11s)
    const rushedSlideTelemetry: LivePresenterTrackingMetrics = {
      faceDetected: true,
      gazeStatus: 'DIRECT',
      eyeContactScore: 88,
      headPose: { yaw: 0, pitch: 0, roll: 0 },
      postureStatus: 'UPRIGHT',
      postureStability: 92,
      gestureActivity: 'OPTIMAL',
      slideNumber: 3,
      slideDwellTimeSeconds: 11,
      slideTransitionDetected: true,
      lightingQuality: 'GOOD',
      timestampMs: Date.now()
    };

    engine.ingestVisualTelemetry(session.id, rushedSlideTelemetry, 290);

    const events = repo.getEvents(session.id);
    const slideTransition = events.find(e => e.eventType === 'SLIDE_TRANSITION' && e.metadata?.slideNumber === 3);
    assert.ok(slideTransition, 'Expected SLIDE_TRANSITION event');
    assert.strictEqual(slideTransition.metadata?.isRushed, true);

    const obs = repo.getObservations(session.id);
    const rushedObs = obs.find(o => o.title.includes('Rushed (<15s)'));
    assert.ok(rushedObs, 'Expected observation warning for rushed slide transition');
  });

  await t.test('14. REST API Endpoint: POST /telemetry updates session snapshot with visual metrics', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const base = `http://localhost:${port}/api/evaluations/${evaluationId}/live`;

    try {
      const telemetryPayload: LivePresenterTrackingMetrics = {
        faceDetected: true,
        faceBoundingBox: { x: 120, y: 40, width: 140, height: 160 },
        gazeStatus: 'DIRECT',
        eyeContactScore: 94,
        headPose: { yaw: 1.2, pitch: -2.1, roll: 0.2 },
        postureStatus: 'UPRIGHT',
        postureStability: 96,
        gestureActivity: 'OPTIMAL',
        slideNumber: 4,
        slideDwellTimeSeconds: 52,
        slideTransitionDetected: true,
        lightingQuality: 'GOOD',
        timestampMs: Date.now()
      };

      const token = signToken({ userId: 'usr_admin', role: 'ADMIN', email: 'admin@projectxray.ai' });
      const res = await fetch(`${base}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ telemetry: telemetryPayload, elapsedSeconds: 310 })
      });

      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.session);
      assert.ok(json.data.event);
      assert.ok(json.data.snapshot);
      assert.strictEqual(json.data.snapshot.visualMetrics.gazeStatus, 'DIRECT');
      assert.strictEqual(json.data.snapshot.visualMetrics.eyeContactScore, 94);
      assert.ok(json.data.snapshot.visualTelemetryCount >= 1);
    } finally {
      server.close();
    }
  });

  await t.test('15. Admin Live Jury Diagnostics & On-Demand CV Simulation Endpoints', async () => {
    // 1. Diagnostics status endpoint
    let statusResponse: any = null;
    const mockRes1: any = {
      status: () => mockRes1,
      json: (data: any) => { statusResponse = data; },
    };
    AdminController.getLiveJuryStatus({} as any, mockRes1);

    assert.strictEqual(statusResponse.success, true);
    assert.strictEqual(statusResponse.data.engineStatus, 'ONLINE');
    assert.ok(statusResponse.data.trackingCapabilities.includes('GAZE_VECTOR_ESTIMATION'));
    assert.ok(statusResponse.data.trackingCapabilities.includes('POSTURE_ERGONOMICS_CLASSIFICATION'));
    assert.ok(statusResponse.data.trackingCapabilities.includes('SLIDE_TRANSITION_DETECTION'));

    // 2. On-demand CV Simulation endpoint
    let simResponse: any = null;
    const mockRes2: any = {
      status: () => mockRes2,
      json: (data: any) => { simResponse = data; },
    };
    const mockReq2: any = {
      body: {
        evaluationId,
        faceDetected: true,
        gazeStatus: 'DIRECT',
        eyeContactScore: 92,
        postureStatus: 'UPRIGHT',
        postureStability: 95,
        slideNumber: 5,
        slideDwellTimeSeconds: 60,
        slideTransitionDetected: false,
        elapsedSeconds: 360
      }
    };

    AdminController.simulateLiveJuryCv(mockReq2, mockRes2);

    assert.strictEqual(simResponse.success, true);
    assert.ok(simResponse.data.event);
    assert.strictEqual(simResponse.data.snapshot.visualMetrics.slideNumber, 5);
    assert.strictEqual(simResponse.data.snapshot.visualMetrics.postureStatus, 'UPRIGHT');
  });
});


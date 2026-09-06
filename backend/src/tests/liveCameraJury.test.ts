import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { app } from '../server';
import { db } from '../db/database';
import { LiveJuryEngine } from '../live/liveJuryEngine';
import { LiveJuryRepository } from '../repositories/liveJuryRepository';

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

    try {
      // 1. GET /status
      const statusRes = await fetch(`${base}/status`);
      assert.strictEqual(statusRes.status, 200);
      const statusData = await statusRes.json();
      assert.ok(statusData.data.session);
      assert.ok(statusData.data.snapshot);

      // 2. POST /start
      const startRes = await fetch(`${base}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'JUDGE', mockMode: true })
      });
      assert.strictEqual(startRes.status, 200);
      const startData = await startRes.json();
      assert.strictEqual(startData.data.session.status, 'LIVE');

      // 3. GET /events
      const eventsRes = await fetch(`${base}/events`);
      assert.strictEqual(eventsRes.status, 200);
      const eventsData = await eventsRes.json();
      assert.ok(Array.isArray(eventsData.data));
      assert.ok(eventsData.data.length > 0);

      // 4. GET /transcript
      const transRes = await fetch(`${base}/transcript`);
      assert.strictEqual(transRes.status, 200);
      const transData = await transRes.json();
      assert.ok(Array.isArray(transData.data));

      // 5. GET /observations
      const obsRes = await fetch(`${base}/observations`);
      assert.strictEqual(obsRes.status, 200);
      const obsData = await obsRes.json();
      assert.ok(Array.isArray(obsData.data));

      // 6. GET /claims
      const claimsRes = await fetch(`${base}/claims`);
      assert.strictEqual(claimsRes.status, 200);
      const claimsData = await claimsRes.json();
      assert.ok(Array.isArray(claimsData.data));

      // 7. GET /demo
      const demoRes = await fetch(`${base}/demo`);
      assert.strictEqual(demoRes.status, 200);
      const demoData = await demoRes.json();
      assert.ok(Array.isArray(demoData.data));

      // 8. GET /questions
      const qRes = await fetch(`${base}/questions`);
      assert.strictEqual(qRes.status, 200);
      const qData = await qRes.json();
      assert.ok(Array.isArray(qData.data));

      // 9. POST /notes
      const noteRes = await fetch(`${base}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const pauseRes = await fetch(`${base}/pause`, { method: 'POST' });
      assert.strictEqual(pauseRes.status, 200);
      const pauseData = await pauseRes.json();
      assert.strictEqual(pauseData.data.status, 'PAUSED');

      const resumeRes = await fetch(`${base}/resume`, { method: 'POST' });
      assert.strictEqual(resumeRes.status, 200);
      const resumeData = await resumeRes.json();
      assert.strictEqual(resumeData.data.status, 'LIVE');

      // 11. POST /end
      const endRes = await fetch(`${base}/end`, { method: 'POST' });
      assert.strictEqual(endRes.status, 200);
      const endData = await endRes.json();
      assert.strictEqual(endData.data.finalScore, 83.7);
      assert.strictEqual(endData.data.verdict, 'STRONG');
    } finally {
      server.close();
    }
  });
});

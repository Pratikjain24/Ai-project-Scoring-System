// ====================================================
// PROJECTX-RAY AI - PHASE 9/11: AI JURY DELIBERATION TEST SUITE
// Multi-Persona 3-Turn Adversarial & Consensus Debate Loop
// ====================================================

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../db/database';
import { JuryDeliberationAgent, JUROR_PERSONAS } from '../agents/juryDeliberationAgent';
import { JuryController } from '../controllers/juryController';
import { AdminController } from '../controllers/adminController';
import { EvaluationOrchestrator } from '../pipeline/evaluationOrchestrator';
import { MasterScoringEngine } from '../scoring/masterScoringEngine';

describe('Phase 9/11: AI Jury Deliberation & Cross-Examination Debate Suite', () => {
  const evalId = 'eval_smart-road-vision';

  before(() => {
    // Ensure canonical master evaluation exists
    const context = MasterScoringEngine.loadContext(evalId);
    MasterScoringEngine.calculateMasterEvaluation(context);
  });

  test('1. Five distinct specialist juror personas are configured with proper profiles', () => {
    assert.strictEqual(JUROR_PERSONAS.length, 5, 'Must have exactly 5 specialist juror personas');

    const expectedKeys = [
      'persona_architect',
      'persona_academic',
      'persona_verifier',
      'persona_presentation',
      'persona_chair'
    ];

    const actualKeys = JUROR_PERSONAS.map(p => p.id);
    for (const key of expectedKeys) {
      assert.ok(actualKeys.includes(key as any), `Missing persona: ${key}`);
    }

    // Verify chief architect
    const architect = JUROR_PERSONAS.find(p => p.id === 'persona_architect');
    assert.ok(architect);
    assert.strictEqual(architect?.name, 'Dr. Marcus Vance');
    assert.strictEqual(architect?.title, 'Chief Systems Architect & Security Auditor');

    // Verify academic chair
    const academic = JUROR_PERSONAS.find(p => p.id === 'persona_academic');
    assert.ok(academic);
    assert.strictEqual(academic?.name, 'Prof. Elena Rostova');
    assert.strictEqual(academic?.title, 'Research Novelty & Prior Art Chair');

    // Verify empirical verifier
    const verifier = JUROR_PERSONAS.find(p => p.id === 'persona_verifier');
    assert.ok(verifier);
    assert.strictEqual(verifier?.name, 'Eng. Tariq Chen');
    assert.strictEqual(verifier?.title, 'Empirical Evidence & Dynamic Verification Lead');

    // Verify presentation forensicist
    const presentation = JUROR_PERSONAS.find(p => p.id === 'persona_presentation');
    assert.ok(presentation);
    assert.strictEqual(presentation?.name, 'Maya Lin');
    assert.strictEqual(presentation?.title, 'Multimodal Video & Presentation Forensicist');

    // Verify committee chair
    const chair = JUROR_PERSONAS.find(p => p.id === 'persona_chair');
    assert.ok(chair);
    assert.strictEqual(chair?.name, 'Hon. Arthur Pendelton');
    assert.strictEqual(chair?.title, 'AI Deliberation Chair & Rubric Arbitrator');

    // Total persona scoring weights must sum to 1.0 (100%)
    const sumWeights = JUROR_PERSONAS.reduce((acc, p) => acc + p.scoringWeight, 0);
    assert.ok(Math.abs(sumWeights - 1.0) < 0.001, 'Juror weights must sum to 1.0');
  });

  test('2. Turn 1 (Initial Ballot): produces independent positions with specialized scoring variance', async () => {
    const deliberation = await JuryDeliberationAgent.deliberate(evalId);

    assert.ok(deliberation);
    assert.strictEqual(deliberation.rounds.length, 3, 'Debate must consist of exactly 3 rounds');

    const round1 = deliberation.rounds[0];
    assert.strictEqual(round1.roundNumber, 1);
    assert.strictEqual(round1.phaseName, 'INITIAL_BALLOT');
    assert.strictEqual(round1.positions.length, 5, 'All 5 jurors submit positions in Round 1');

    // Prof. Rostova (academic skeptic) vs Tariq Chen (empirical optimist)
    const academicPos = round1.positions.find(p => p.jurorId === 'persona_academic');
    const verifierPos = round1.positions.find(p => p.jurorId === 'persona_verifier');
    assert.ok(academicPos);
    assert.ok(verifierPos);

    // Initial ballot must exhibit natural debate variance
    assert.ok(academicPos.score < verifierPos.score, 'Academic skeptic should initially score lower than Verifier');
    assert.ok(round1.scoreStdDev > 2.0, `Round 1 standard deviation (${round1.scoreStdDev}) must show initial variance > 2.0`);

    // Verify structured fields
    for (const pos of round1.positions) {
      assert.ok(pos.thesis && pos.thesis.length > 20, 'Each position must have an explicit thesis');
      assert.ok(pos.keyStrengths.length >= 1, 'Each position must cite strengths');
      assert.ok(pos.keyReservations.length >= 1, 'Each position must cite reservations');
      assert.ok(pos.evidenceCitations.length >= 1, 'Each position must cite specific evidence IDs');
    }
  });

  test('3. Turn 2 (Adversarial Cross-Examination): jurors challenge scores with counter-evidence', async () => {
    const deliberation = await JuryDeliberationAgent.deliberate(evalId);
    const round2 = deliberation.rounds[1];

    assert.strictEqual(round2.roundNumber, 2);
    assert.strictEqual(round2.phaseName, 'ADVERSARIAL_CROSS_EXAMINATION');
    assert.ok(round2.critiques && round2.critiques.length >= 3, 'Must contain inter-juror critiques');

    // Check specific inter-juror challenges
    const academicToVerifier = round2.critiques?.find(
      c => c.challengerId === 'persona_academic' && c.targetJurorId === 'persona_verifier'
    );
    assert.ok(academicToVerifier, 'Prof. Rostova should challenge Tariq Chen on prior art / novelty');
    assert.ok(academicToVerifier.targetResponse, 'Target juror must provide a counter-rebuttal response');
    assert.ok(typeof academicToVerifier.concededDelta === 'number', 'Target juror must concede a score delta');

    const architectToPresentation = round2.critiques?.find(
      c => c.challengerId === 'persona_architect' && c.targetJurorId === 'persona_presentation'
    );
    assert.ok(architectToPresentation, 'Dr. Vance should challenge Maya Lin on complexity vs visual polish');
    assert.ok(architectToPresentation.argument.includes('cyclomatic complexity') || architectToPresentation.argument.includes('architecture'));

    // Check score adjustments occurring between Round 1 and Round 2
    const round1Mean = deliberation.rounds[0].meanScore;
    assert.ok(typeof round2.meanScore === 'number');
    assert.ok(typeof round1Mean === 'number');
  });

  test('4. Turn 3 (Consensus & Convergence): standard deviation contracts and consensus is ratified', async () => {
    const deliberation = await JuryDeliberationAgent.deliberate(evalId);

    const round1 = deliberation.rounds[0];
    const round3 = deliberation.rounds[2];

    assert.strictEqual(round3.roundNumber, 3);
    assert.strictEqual(round3.phaseName, 'CONSENSUS_CONVERGENCE');

    // Standard deviation must contract from Round 1 to Round 3
    assert.ok(
      round3.scoreStdDev < round1.scoreStdDev,
      `Score StdDev must contract from Round 1 (${round1.scoreStdDev}) to Round 3 (${round3.scoreStdDev})`
    );
    assert.ok(round3.scoreStdDev <= 0.85, `Round 3 standard deviation (${round3.scoreStdDev}) must be <= 0.85`);

    // Ratified consensus score matches Master Score baseline (83.7)
    assert.strictEqual(deliberation.consensusScore, 83.7, 'Consensus score must converge to canonical 83.7');
    assert.strictEqual(deliberation.ratifiedVerdict, 'STRONG');

    // Dissenting opinions registration
    assert.ok(Array.isArray(deliberation.dissentingOpinions));
    assert.ok(deliberation.dissentingOpinions.length >= 1, 'Must register recorded minority reservations/dissents');
    const academicDissent = deliberation.dissentingOpinions.find(d => d.jurorId === 'persona_academic');
    assert.ok(academicDissent, 'Academic chair should register qualified dissent on novelty risks');
    assert.strictEqual(academicDissent.dissentSeverity, 'QUALIFIED');
  });

  test('5. Markdown Deliberation Transcript: includes formal proceedings and debate rounds', async () => {
    const deliberation = await JuryDeliberationAgent.deliberate(evalId);

    assert.ok(deliberation.transcript);
    assert.ok(deliberation.transcript.includes('# AI JURY ROOM DELIBERATION TRANSCRIPT'));
    assert.ok(deliberation.transcript.includes('## COMMITTEE PERSONAS'));
    assert.ok(deliberation.transcript.includes('## ROUND 1: INDEPENDENT OPENING BALLOTS'));
    assert.ok(deliberation.transcript.includes('## ROUND 2: ADVERSARIAL CROSS-EXAMINATION & EVIDENCE CRITIQUES'));
    assert.ok(deliberation.transcript.includes('## ROUND 3: CONSENSUS CONVERGENCE & RATIFIED VERDICT'));
    assert.ok(deliberation.transcript.includes('### STATISTICAL CONVERGENCE AUDIT'));
    assert.ok(deliberation.transcript.includes('Initial Score Dispersion'));
    assert.ok(deliberation.transcript.includes('Final Score Dispersion'));
    assert.ok(deliberation.transcript.includes('83.7 / 100'));
  });

  test('6. Database Persistence: records stored in jury_deliberations table', async () => {
    // Deliberate and then query directly from DB and via repository method
    const result = await JuryDeliberationAgent.deliberate(evalId);
    assert.ok(result.id);

    const stored = JuryDeliberationAgent.getDeliberation(evalId);
    assert.ok(stored, 'Must retrieve deliberation from database');
    assert.strictEqual(stored.id, result.id);
    assert.strictEqual(stored.consensusScore, 83.7);
    assert.strictEqual(stored.ratifiedVerdict, 'STRONG');
    assert.strictEqual(stored.rounds.length, 3);
    assert.ok(stored.finalScores.persona_chair);
    assert.ok(stored.initialScores.persona_architect);

    // Direct SQLite raw check
    const rawRow = db.get<any>('SELECT * FROM jury_deliberations WHERE evaluation_id = ?', evalId);
    assert.ok(rawRow, 'Row must exist in jury_deliberations table');
    assert.strictEqual(rawRow.consensus_score, 83.7);
    assert.strictEqual(rawRow.ratified_verdict, 'STRONG');
  });

  test('7. JuryController REST endpoints: GET and POST deliberation', async () => {
    // 1. GET deliberation endpoint
    let getResponse: any = null;
    const mockRes1: any = {
      status: (code: number) => {
        assert.strictEqual(code, 200);
        return mockRes1;
      },
      json: (data: any) => { getResponse = data; },
    };
    await JuryController.getDeliberation({ params: { id: evalId } } as any, mockRes1);

    assert.ok(getResponse.success);
    assert.strictEqual(getResponse.data.consensusScore, 83.7);
    assert.strictEqual(getResponse.data.ratifiedVerdict, 'STRONG');
    assert.strictEqual(getResponse.data.rounds.length, 3);

    // 2. POST deliberate endpoint
    let postResponse: any = null;
    const mockRes2: any = {
      status: (code: number) => {
        assert.strictEqual(code, 200);
        return mockRes2;
      },
      json: (data: any) => { postResponse = data; },
    };
    await JuryController.runDeliberation({ params: { id: evalId } } as any, mockRes2);

    assert.ok(postResponse.success);
    assert.ok(postResponse.message.includes('AI Jury Deliberation debate concluded'));
    assert.strictEqual(postResponse.data.consensusScore, 83.7);
  });

  test('8. AdminController endpoints: status and simulate-debate', async () => {
    // 1. GET status endpoint
    let statusResponse: any = null;
    const mockRes1: any = {
      status: (code: number) => {
        assert.strictEqual(code, 200);
        return mockRes1;
      },
      json: (data: any) => { statusResponse = data; },
    };
    AdminController.getJuryDeliberationStatus({} as any, mockRes1);

    assert.ok(statusResponse.success);
    assert.strictEqual(statusResponse.data.status, 'ONLINE');
    assert.strictEqual(statusResponse.data.personasCount, 5);
    assert.ok(statusResponse.data.debateProtocols.includes('ADVERSARIAL_CROSS_EXAMINATION_ROUND_2'));

    // 2. POST simulate-debate endpoint
    let simResponse: any = null;
    const mockRes2: any = {
      status: (code: number) => {
        assert.strictEqual(code, 200);
        return mockRes2;
      },
      json: (data: any) => { simResponse = data; },
    };
    await AdminController.simulateJuryDebate({ body: { evaluationId: evalId } } as any, mockRes2);

    assert.ok(simResponse.success);
    assert.strictEqual(simResponse.data.consensusScore, 83.7);
    assert.strictEqual(simResponse.data.ratifiedVerdict, 'STRONG');
  });

  test('9. Central Orchestrator integration: executes AI Jury deliberation in Stage 9', async () => {
    // Run orchestrator through Stage 9
    const progress = await EvaluationOrchestrator.run(evalId);

    assert.ok(progress);
    assert.strictEqual(progress.evaluationId, evalId);
    assert.strictEqual(progress.isFailed, false);

    // Verify checkpoint JURY_COMPLETE exists
    const row = db.get<any>(
      `SELECT * FROM evaluation_checkpoints WHERE evaluation_id = ? AND checkpoint_name = 'JURY_COMPLETE'`,
      evalId
    );
    assert.ok(row, 'Checkpoint JURY_COMPLETE must be saved');
    assert.ok(row.stage_name.includes('AI Jury'));

    // Verify debate record was populated
    const delib = JuryDeliberationAgent.getDeliberation(evalId);
    assert.ok(delib, 'Deliberation record must be populated during orchestration');
    assert.strictEqual(delib.consensusScore, 83.7);
  });
});

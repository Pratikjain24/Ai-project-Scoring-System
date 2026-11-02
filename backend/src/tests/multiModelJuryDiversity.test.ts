// ====================================================
// PROJECTX-RAY AI - MULTI-MODEL JURY DIVERSITY TEST SUITE
// Independent LLM Architecture Binding & Multi-Model Consensus Verification
// Juror 1 (Claude 3.5 Sonnet), Juror 2 (GPT-4o), Juror 3 (Gemini 1.5 Pro)
// ====================================================

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { JuryDeliberationAgent, JUROR_PERSONAS } from '../agents/juryDeliberationAgent';
import { MasterScoringEngine } from '../scoring/masterScoringEngine';

describe('Multi-Model Jury Diversity & Consensus Verification Suite', () => {
  const evalId = 'eval_smart-road-vision';

  before(() => {
    const context = MasterScoringEngine.loadContext(evalId);
    MasterScoringEngine.calculateMasterEvaluation(context);
  });

  test('1. Juror 1 (Dr. Marcus Vance) is configured with Claude 3.5 Sonnet for Code & Security', () => {
    const juror1 = JUROR_PERSONAS.persona_architect;
    assert.strictEqual(juror1.id, 'persona_architect');
    assert.strictEqual(juror1.jurorNumber, 1);
    assert.strictEqual(JUROR_PERSONAS[0].id, 'persona_architect');
    assert.strictEqual(juror1.name, 'Dr. Marcus Vance');
    assert.strictEqual(juror1.llmArchitecture, 'Claude 3.5 Sonnet');
    assert.strictEqual(juror1.modelId, 'claude-3-5-sonnet-20241022');
    assert.strictEqual(juror1.providerName, 'ANTHROPIC');
    assert.strictEqual(juror1.specializedDomain, 'Code & Security');
    assert.ok(juror1.evaluatorFocus.includes('AST complexity') || juror1.evaluatorFocus.includes('Code maintainability'));
  });

  test('2. Juror 2 (Eng. Tariq Chen) is configured with GPT-4o for Impact & Feasibility', () => {
    const juror2 = JUROR_PERSONAS.persona_verifier;
    assert.strictEqual(juror2.id, 'persona_verifier');
    assert.strictEqual(juror2.jurorNumber, 2);
    assert.strictEqual(JUROR_PERSONAS[1].id, 'persona_verifier');
    assert.strictEqual(juror2.name, 'Eng. Tariq Chen');
    assert.strictEqual(juror2.llmArchitecture, 'GPT-4o');
    assert.strictEqual(juror2.modelId, 'gpt-4o-2024-08-06');
    assert.strictEqual(juror2.providerName, 'OPENAI');
    assert.strictEqual(juror2.specializedDomain, 'Impact & Feasibility');
    assert.ok(juror2.evaluatorFocus.includes('empirical') || juror2.evaluatorFocus.includes('containerized'));
  });

  test('3. Juror 3 (Maya Lin) is configured with Gemini 1.5 Pro for Multimodal Video', () => {
    const juror3 = JUROR_PERSONAS.persona_presentation;
    assert.strictEqual(juror3.id, 'persona_presentation');
    assert.strictEqual(juror3.jurorNumber, 3);
    assert.strictEqual(JUROR_PERSONAS[2].id, 'persona_presentation');
    assert.strictEqual(juror3.name, 'Maya Lin');
    assert.strictEqual(juror3.llmArchitecture, 'Gemini 1.5 Pro');
    assert.strictEqual(juror3.modelId, 'gemini-1.5-pro');
    assert.strictEqual(juror3.providerName, 'GEMINI');
    assert.strictEqual(juror3.specializedDomain, 'Multimodal Video');
    assert.ok(juror3.evaluatorFocus.includes('Vocal') || juror3.evaluatorFocus.includes('pacing'));
  });

  test('4. Committee registry maps all 5 jurors to distinct LLM architectures and domains', () => {
    const registry = JuryDeliberationAgent.getModelDiversityRegistry();
    assert.strictEqual(registry.persona_architect.architecture, 'Claude 3.5 Sonnet');
    assert.strictEqual(registry.persona_verifier.architecture, 'GPT-4o');
    assert.strictEqual(registry.persona_presentation.architecture, 'Gemini 1.5 Pro');
    assert.strictEqual(registry.persona_academic.architecture, 'Claude 3.5 Haiku');
    assert.strictEqual(registry.persona_chair.architecture, 'Consensus Ensemble');

    const status = JuryDeliberationAgent.getStatus();
    assert.strictEqual(status.multiModelDiversity, true);
    assert.ok(status.modelAssignments);
    assert.strictEqual(status.modelAssignments.persona_architect.architecture, 'Claude 3.5 Sonnet');
    assert.strictEqual(status.modelAssignments.persona_verifier.architecture, 'GPT-4o');
    assert.strictEqual(status.modelAssignments.persona_presentation.architecture, 'Gemini 1.5 Pro');
  });

  test('5. Multi-turn debate carries LLM architecture metadata across ballots, critiques, and consensus', async () => {
    const deliberation = await JuryDeliberationAgent.deliberate(evalId);

    // Round 1
    const r1 = deliberation.rounds[0];
    for (const pos of r1.positions) {
      assert.ok(pos.llmArchitecture, `Position for ${pos.jurorName} must specify llmArchitecture`);
      assert.ok(pos.modelId, `Position for ${pos.jurorName} must specify modelId`);
      assert.ok(pos.specializedDomain, `Position for ${pos.jurorName} must specify specializedDomain`);
    }

    // Round 2 (Cross-model challenges)
    const r2 = deliberation.rounds[1];
    assert.ok(r2.critiques && r2.critiques.length >= 3);
    for (const critique of r2.critiques) {
      assert.ok(critique.challengerModel, `Critique must specify challengerModel (${critique.challengerName})`);
      assert.ok(critique.targetModel, `Critique must specify targetModel (${critique.targetJurorName})`);
    }

    // Round 3 (Convergence of diverse models)
    const r3 = deliberation.rounds[2];
    assert.ok(r3.scoreStdDev < r1.scoreStdDev);
    assert.strictEqual(deliberation.consensusScore, 83.7);

    // Dissent metadata
    const dissent = deliberation.dissentingOpinions[0];
    assert.strictEqual(dissent.llmArchitecture, 'Claude 3.5 Haiku');
    assert.strictEqual(dissent.specializedDomain, 'Research Novelty');

    // Transcript contains model diversity documentation
    assert.ok(deliberation.transcript.includes('Claude 3.5 Sonnet'));
    assert.ok(deliberation.transcript.includes('GPT-4o'));
    assert.ok(deliberation.transcript.includes('Gemini 1.5 Pro'));
  });

  test('6. evaluateWithJurorModel provides resilient invocation with fallback execution', async () => {
    // Evaluates with Claude 3.5 Sonnet (falls back gracefully to calibrated domain synthesis when API key is unconfigured)
    const evalResult = await JuryDeliberationAgent.evaluateWithJurorModel('persona_architect', 'Analyze AST complexity');
    assert.strictEqual(evalResult.jurorId, 'persona_architect');
    assert.strictEqual(evalResult.llmArchitecture, 'Claude 3.5 Sonnet');
    assert.strictEqual(evalResult.modelId, 'claude-3-5-sonnet-20241022');
    assert.strictEqual(evalResult.specializedDomain, 'Code & Security');
    assert.ok(typeof evalResult.score === 'number');
    assert.ok(evalResult.thesis.length > 20);
    assert.ok(typeof evalResult.executionTimeMs === 'number');
  });
});


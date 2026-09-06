import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateWeights, SCORING_WEIGHTS } from '../config/scoringWeights';
import { ScoringEngine } from '../scoring/scoringEngine';
import { ScoreValidator } from '../scoring/scoreValidator';
import { ProjectRepository } from '../repositories/projectRepository';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { ClaimRepository } from '../repositories/claimRepository';
import { EvidenceGraphService } from '../evidence/evidenceGraphService';
import { initSchema } from '../db/database';
import { seedDatabase } from '../db/seed';

describe('ProjectX-Ray AI - Backend Core Architecture Tests', async () => {
  // Setup database
  await seedDatabase();

  it('1. Category weights MUST sum strictly to 1.0 (100.0%)', () => {
    const isSum100 = validateWeights();
    assert.strictEqual(isSum100, true, 'Scoring weights do not equal 100%');

    const sum = Object.values(SCORING_WEIGHTS).reduce((acc, w) => acc + w, 0);
    assert.strictEqual(Math.round(sum * 1000) / 1000, 1.0);
  });

  it('2. Scoring engine calculation is 100% deterministic and reproducible', () => {
    const input = {
      problemNeedRaw: 91,
      technicalQualityRaw: 87,
      originalityRaw: 68,
      socialImpactRaw: 92,
      presentationRaw: 76,
      demonstrationRaw: 84,
      feasibilityScalabilityRaw: 79,
      futurePotentialRaw: 94,
      evidenceCounts: {
        problemNeed: 6,
        technicalQuality: 12,
        originality: 7,
        socialImpact: 5,
        presentation: 4,
        demonstration: 4,
        feasibilityScalability: 4,
        futurePotential: 2,
      },
      rawConfidence: 89,
      hasContradictedClaims: false,
      unverifiedClaimRatio: 0.25,
    };

    const run1 = ScoringEngine.calculate('test_eval_1', input);
    const run2 = ScoringEngine.calculate('test_eval_1', input);

    assert.strictEqual(run1.overallScore, 83.7);
    assert.strictEqual(run1.overallScore, run2.overallScore);
    assert.strictEqual(run1.verdict, 'STRONG');
    assert.strictEqual(run1.categoryScores.length, 8);
  });

  it('3. ScoreValidator enforces confidence caps when evidence is sparse', () => {
    // With evidence count < 3, confidence must be capped at 65%
    const result = ScoreValidator.validateAndCalibrateConfidence(95, 2, false, 0);
    assert.strictEqual(result.calibratedConfidence, 65);
    assert.strictEqual(result.warnings.length > 0, true);
  });

  it('4. ScoreValidator applies penalties for contradicted claims', () => {
    const result = ScoreValidator.validateAndCalibrateConfidence(90, 10, true, 0.1);
    assert.strictEqual(result.calibratedConfidence, 75); // 90 - 15 = 75
  });

  it('5. ProjectRepository stores and retrieves normalized projects', () => {
    const project = ProjectRepository.findById('smart-road-vision');
    assert.ok(project, 'Seeded project smart-road-vision not found');
    assert.strictEqual(project?.name, 'Smart Road Vision');
    assert.strictEqual(project?.architectureType, 'SOFTWARE');
  });

  it('6. EvaluationRepository links projects and retrieves status', () => {
    const evalItem = EvaluationRepository.findById('eval_smart-road-vision');
    assert.ok(evalItem, 'Seeded evaluation not found');
    assert.strictEqual(evalItem?.projectId, 'smart-road-vision');
    assert.strictEqual(evalItem?.status, 'COMPLETED');
  });

  it('7. Universal Evidence repository supports batch linking and queries', () => {
    const evidenceItems = EvidenceRepository.findByEvaluationId('eval_smart-road-vision');
    assert.ok(evidenceItems.length >= 3, 'Evidence items count is less than 3');
    assert.ok(evidenceItems.some(e => e.type === 'PROJECT_DOCUMENT'));
    assert.ok(evidenceItems.some(e => e.type === 'GITHUB'));
  });

  it('8. Claim repository correctly maps supporting evidence joins', () => {
    const claims = ClaimRepository.findByEvaluationId('eval_smart-road-vision');
    assert.ok(claims.length >= 2, 'Claims count is less than 2');

    const lineage = EvidenceGraphService.getLineageForClaim(claims[0].id);
    assert.ok(lineage, 'Claim lineage not found');
    assert.strictEqual(lineage?.claim.id, claims[0].id);
    assert.ok(lineage?.supportingEvidence.length > 0);
  });

  it('9. EvidenceGraphService answers "Why did originality receive X score?"', () => {
    const lineage = EvidenceGraphService.getLineageForScore('eval_smart-road-vision', 'originality');
    assert.ok(lineage, 'Score lineage for originality not found');
    assert.strictEqual(lineage?.category, 'Innovation & Originality');
    assert.ok(lineage?.supportingEvidence.length > 0);
  });
});

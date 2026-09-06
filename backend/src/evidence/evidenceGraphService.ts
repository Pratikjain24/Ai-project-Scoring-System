import { db } from '../db/database';
import type { Evidence } from '../models/evidence';
import type { Claim } from '../models/claim';
import type { ResearchSource, ResearchFinding } from '../models/research';
import type { CategoryScore } from '../models/scoring';

export interface ScoreLineageResult {
  evaluationId: string;
  category: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  confidence: number;
  explanation: string;
  supportingEvidence: Evidence[];
  relevantClaims: Claim[];
  relevantSources: ResearchSource[];
}

export interface ClaimVerificationLineage {
  claim: Claim;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  matchedFindings: ResearchFinding[];
  referencedSources: ResearchSource[];
}

export class EvidenceGraphService {
  /**
   * "Why did originality receive 68?" or "Which evidence supports the social impact score?"
   */
  static getLineageForScore(evaluationId: string, categoryKey: string): ScoreLineageResult | undefined {
    const scoreRow = db.get<any>(
      `SELECT * FROM scores WHERE evaluation_id = ? AND (LOWER(category_key) = LOWER(?) OR LOWER(category_key) LIKE LOWER(?))`,
      evaluationId,
      categoryKey,
      `%${categoryKey}%`
    );

    if (!scoreRow) return undefined;

    // Fetch all evidence associated with the evaluation
    const evidenceList = db.all<Evidence>(
      `SELECT * FROM evidence WHERE evaluation_id = ? ORDER BY confidence DESC`,
      evaluationId
    );

    // Fetch relevant claims
    const claims = db.all<Claim>(
      `SELECT * FROM claims WHERE evaluation_id = ?`,
      evaluationId
    );

    // Fetch research sources
    const sources = db.all<ResearchSource>(
      `SELECT * FROM research_sources WHERE evaluation_id = ? ORDER BY overall_rank ASC`,
      evaluationId
    );

    return {
      evaluationId,
      category: scoreRow.category_label,
      rawScore: scoreRow.raw_score,
      weight: scoreRow.weight,
      weightedScore: scoreRow.weighted_score,
      confidence: scoreRow.confidence,
      explanation: scoreRow.explanation,
      supportingEvidence: evidenceList.slice(0, 4),
      relevantClaims: claims.slice(0, 2),
      relevantSources: sources.slice(0, 2),
    };
  }

  /**
   * "Why was this claim marked partially verified?"
   */
  static getLineageForClaim(claimId: string): ClaimVerificationLineage | undefined {
    const claimRow = db.get<any>(`SELECT * FROM claims WHERE id = ?`, claimId);
    if (!claimRow) return undefined;

    const supportingEvidence = db.all<Evidence>(
      `SELECT e.* FROM evidence e
       JOIN claim_evidence ce ON e.id = ce.evidence_id
       WHERE ce.claim_id = ? AND ce.relationship = 'SUPPORTING'`,
      claimId
    );

    const contradictingEvidence = db.all<Evidence>(
      `SELECT e.* FROM evidence e
       JOIN claim_evidence ce ON e.id = ce.evidence_id
       WHERE ce.claim_id = ? AND ce.relationship = 'CONTRADICTING'`,
      claimId
    );

    const findings = db.all<any>(
      `SELECT * FROM research_findings WHERE evaluation_id = ?`,
      claimRow.evaluation_id
    ).map(f => ({
      id: f.id,
      sourceId: f.source_id,
      evaluationId: f.evaluation_id,
      summary: f.summary,
      keyClaimsMatched: JSON.parse(f.key_claims_matched_json),
      noveltyAspectsHighlighted: JSON.parse(f.novelty_aspects_json),
      confidence: f.confidence,
      evidenceId: f.evidence_id,
      createdAt: f.created_at,
    }));

    const sources = db.all<ResearchSource>(
      `SELECT * FROM research_sources WHERE evaluation_id = ?`,
      claimRow.evaluation_id
    );

    return {
      claim: {
        id: claimRow.id,
        evaluationId: claimRow.evaluation_id,
        claimText: claimRow.claim_text,
        claimType: claimRow.claim_type,
        importance: claimRow.importance,
        status: claimRow.status,
        confidence: claimRow.confidence,
        projectEvidence: claimRow.project_evidence,
        externalEvidence: claimRow.external_evidence || undefined,
        explanation: claimRow.explanation,
        recommendedJudgeQuestion: claimRow.recommended_judge_question || undefined,
        supportingEvidenceIds: supportingEvidence.map(e => e.id),
        contradictingEvidenceIds: contradictingEvidence.map(e => e.id),
        createdAt: claimRow.created_at,
      },
      supportingEvidence,
      contradictingEvidence,
      matchedFindings: findings,
      referencedSources: sources,
    };
  }

  /**
   * "What sources caused the similarity finding?"
   */
  static getOriginalitySources(evaluationId: string): {
    originalityScore: number;
    similarityScore: number;
    classification: string;
    similaritySources: any[];
  } | undefined {
    const orig = db.get<any>(
      `SELECT * FROM originality_assessments WHERE evaluation_id = ?`,
      evaluationId
    );
    if (!orig) return undefined;

    const similarities = db.all<any>(
      `SELECT * FROM similarity_results WHERE evaluation_id = ? ORDER BY similarity_score DESC`,
      evaluationId
    );

    return {
      originalityScore: orig.originality_score,
      similarityScore: orig.similarity_score,
      classification: orig.classification,
      similaritySources: similarities.map(s => ({
        sourceType: s.source_type,
        sourceTitle: s.source_title,
        sourceUrl: s.source_url,
        similarityScore: s.similarity_score,
        matchingFeatures: JSON.parse(s.matching_features_json),
        differences: JSON.parse(s.differences_json),
      })),
    };
  }
}

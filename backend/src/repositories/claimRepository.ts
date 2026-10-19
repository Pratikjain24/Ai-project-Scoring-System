import { db } from '../db/database';
import type { Claim, ClaimStatus } from '../models/claim';

export class ClaimRepository {
  static create(claim: Claim): Claim {
    db.run(
      `INSERT OR REPLACE INTO claims (
        id, evaluation_id, claim_text, claim_type, importance, status,
        confidence, project_evidence, external_evidence, explanation, recommended_judge_question, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      claim.id,
      claim.evaluationId,
      claim.claimText,
      claim.claimType,
      claim.importance,
      claim.status,
      claim.confidence,
      claim.projectEvidence,
      claim.externalEvidence || null,
      claim.explanation,
      claim.recommendedJudgeQuestion || null,
      claim.createdAt || new Date().toISOString()
    );

    // Insert supporting evidence joins
    if (claim.supportingEvidenceIds && claim.supportingEvidenceIds.length > 0) {
      for (const evId of claim.supportingEvidenceIds) {
        db.run(
          `INSERT OR IGNORE INTO claim_evidence (id, claim_id, evidence_id, relationship) VALUES (?, ?, ?, ?)`,
          `${claim.id}_sup_${evId}`,
          claim.id,
          evId,
          'SUPPORTING'
        );
      }
    }

    // Insert contradicting evidence joins
    if (claim.contradictingEvidenceIds && claim.contradictingEvidenceIds.length > 0) {
      for (const evId of claim.contradictingEvidenceIds) {
        db.run(
          `INSERT OR IGNORE INTO claim_evidence (id, claim_id, evidence_id, relationship) VALUES (?, ?, ?, ?)`,
          `${claim.id}_con_${evId}`,
          claim.id,
          evId,
          'CONTRADICTING'
        );
      }
    }

    return this.findById(claim.id)!;
  }

  static createBatch(claims: Claim[]): void {
    db.transaction(() => {
      for (const claim of claims) {
        this.create(claim);
      }
    });
  }

  static findById(id: string): Claim | undefined {
    const row = db.get<any>(`SELECT * FROM claims WHERE id = ?`, id);
    if (!row) return undefined;

    const supporting = db.all<{ evidence_id: string }>(
      `SELECT evidence_id FROM claim_evidence WHERE claim_id = ? AND relationship = 'SUPPORTING'`,
      id
    ).map(r => r.evidence_id);

    const contradicting = db.all<{ evidence_id: string }>(
      `SELECT evidence_id FROM claim_evidence WHERE claim_id = ? AND relationship = 'CONTRADICTING'`,
      id
    ).map(r => r.evidence_id);

    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      claimText: row.claim_text,
      claimType: row.claim_type,
      importance: row.importance,
      status: row.status as ClaimStatus,
      confidence: row.confidence,
      projectEvidence: row.project_evidence,
      externalEvidence: row.external_evidence || undefined,
      explanation: row.explanation,
      recommendedJudgeQuestion: row.recommended_judge_question || undefined,
      supportingEvidenceIds: supporting,
      contradictingEvidenceIds: contradicting,
      createdAt: row.created_at,
    };
  }

  static findByEvaluationId(evaluationId: string): Claim[] {
    const rows = db.all<any>(`SELECT id FROM claims WHERE evaluation_id = ? ORDER BY created_at ASC`, evaluationId);
    return rows.map(r => this.findById(r.id)!).filter(Boolean);
  }
}

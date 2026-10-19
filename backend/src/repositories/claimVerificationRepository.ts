import { db } from '../db/database';
import type {
  Claim,
  ClaimStatus,
  ClaimType,
  ClaimImportance,
  ClaimParameters,
  ClaimVerificationResult,
  ClaimBenchmark,
  PotentialContradiction,
  ClaimVersion,
  ClaimHumanReview,
  ClaimDetailBundle,
  EvaluationClaimsSummary,
} from '../models/claim';

export class ClaimVerificationRepository {
  // ==========================================
  // CLAIMS (CRUD)
  // ==========================================

  static createClaim(c: Claim): Claim {
    let validEvalId = c.evaluationId;
    const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, c.evaluationId);
    if (!evalExists) {
      const anyEval = db.get<any>(`SELECT id FROM evaluations LIMIT 1`);
      if (anyEval) validEvalId = anyEval.id;
    }

    db.run(
      `INSERT INTO claims (
        id, evaluation_id, claim_text, claim_type, importance, status,
        confidence, project_evidence, external_evidence, explanation,
        recommended_judge_question, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        claim_text = excluded.claim_text,
        claim_type = excluded.claim_type,
        importance = excluded.importance,
        status = excluded.status,
        confidence = excluded.confidence,
        project_evidence = excluded.project_evidence,
        external_evidence = excluded.external_evidence,
        explanation = excluded.explanation,
        recommended_judge_question = excluded.recommended_judge_question`,
      c.id,
      validEvalId,
      c.claimText,
      c.claimType,
      c.importance,
      c.status,
      c.confidence,
      c.projectEvidence || '',
      c.externalEvidence || null,
      c.explanation || '',
      c.recommendedJudgeQuestion || null
    );

    // Link evidence items in claim_evidence table if evidence exists
    if (c.supportingEvidenceIds && c.supportingEvidenceIds.length > 0) {
      for (const eid of c.supportingEvidenceIds) {
        const evExists = db.get<any>(`SELECT id FROM evidence WHERE id = ?`, eid);
        if (evExists) {
          db.run(
            `INSERT OR IGNORE INTO claim_evidence (id, claim_id, evidence_id, relationship)
             VALUES (?, ?, ?, 'SUPPORTING')`,
            `ce_${c.id}_${eid}`,
            c.id,
            eid
          );
        }
      }
    }

    if (c.contradictingEvidenceIds && c.contradictingEvidenceIds.length > 0) {
      for (const eid of c.contradictingEvidenceIds) {
        const evExists = db.get<any>(`SELECT id FROM evidence WHERE id = ?`, eid);
        if (evExists) {
          db.run(
            `INSERT OR IGNORE INTO claim_evidence (id, claim_id, evidence_id, relationship)
             VALUES (?, ?, ?, 'CONTRADICTING')`,
            `ce_${c.id}_${eid}`,
            c.id,
            eid
          );
        }
      }
    }

    return c;
  }

  static getClaimById(claimId: string): Claim | null {
    const r = db.get<any>(`SELECT * FROM claims WHERE id = ?`, claimId);
    if (!r) return null;

    const suppRows = db.all<any>(
      `SELECT evidence_id FROM claim_evidence WHERE claim_id = ? AND relationship = 'SUPPORTING'`,
      claimId
    );
    const contraRows = db.all<any>(
      `SELECT evidence_id FROM claim_evidence WHERE claim_id = ? AND relationship = 'CONTRADICTING'`,
      claimId
    );

    return {
      id: r.id,
      evaluationId: r.evaluation_id,
      claimText: r.claim_text,
      claimType: r.claim_type,
      importance: r.importance,
      status: r.status,
      confidence: r.confidence,
      projectEvidence: r.project_evidence,
      externalEvidence: r.external_evidence,
      explanation: r.explanation,
      recommendedJudgeQuestion: r.recommended_judge_question,
      supportingEvidenceIds: suppRows.map(s => s.evidence_id),
      contradictingEvidenceIds: contraRows.map(s => s.evidence_id),
      createdAt: r.created_at,
    };
  }

  static getClaimsByEvaluation(evaluationId: string): Claim[] {
    const rows = db.all<any>(
      `SELECT * FROM claims WHERE evaluation_id = ? ORDER BY CASE importance WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`,
      evaluationId
    );

    return rows.map(r => {
      const suppRows = db.all<any>(
        `SELECT evidence_id FROM claim_evidence WHERE claim_id = ? AND relationship = 'SUPPORTING'`,
        r.id
      );
      const contraRows = db.all<any>(
        `SELECT evidence_id FROM claim_evidence WHERE claim_id = ? AND relationship = 'CONTRADICTING'`,
        r.id
      );

      return {
        id: r.id,
        evaluationId: r.evaluation_id,
        claimText: r.claim_text,
        claimType: r.claim_type,
        importance: r.importance,
        status: r.status,
        confidence: r.confidence,
        projectEvidence: r.project_evidence,
        externalEvidence: r.external_evidence,
        explanation: r.explanation,
        recommendedJudgeQuestion: r.recommended_judge_question,
        supportingEvidenceIds: suppRows.map(s => s.evidence_id),
        contradictingEvidenceIds: contraRows.map(s => s.evidence_id),
        createdAt: r.created_at,
      };
    });
  }

  // ==========================================
  // CLAIM PARAMETERS
  // ==========================================

  static upsertClaimParameters(claimId: string, p: ClaimParameters): void {
    db.run(
      `INSERT INTO claim_parameters (
        claim_id, subject, metric, value, unit, condition, dataset, evaluation_method, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(claim_id) DO UPDATE SET
        subject = excluded.subject,
        metric = excluded.metric,
        value = excluded.value,
        unit = excluded.unit,
        condition = excluded.condition,
        dataset = excluded.dataset,
        evaluation_method = excluded.evaluation_method`,
      claimId,
      p.subject,
      p.metric || null,
      p.value || null,
      p.unit || null,
      p.condition || null,
      p.dataset || null,
      p.evaluationMethod || null
    );
  }

  static getClaimParameters(claimId: string): ClaimParameters | null {
    const r = db.get<any>(`SELECT * FROM claim_parameters WHERE claim_id = ?`, claimId);
    if (!r) return null;
    return {
      subject: r.subject,
      metric: r.metric || undefined,
      value: r.value || undefined,
      unit: r.unit || undefined,
      condition: r.condition || undefined,
      dataset: r.dataset || undefined,
      evaluationMethod: r.evaluation_method || undefined,
    };
  }

  // ==========================================
  // CLAIM VERIFICATIONS
  // ==========================================

  static upsertVerification(v: ClaimVerificationResult): ClaimVerificationResult {
    let validEvalId = v.evaluationId;
    const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, v.evaluationId);
    if (!evalExists) {
      const anyEval = db.get<any>(`SELECT id FROM evaluations LIMIT 1`);
      if (anyEval) validEvalId = anyEval.id;
    }

    db.run(
      `INSERT INTO claim_verifications (
        id, claim_id, evaluation_id, status, verification_score, confidence,
        methodology_score, consistency_score, demo_support, demo_timestamp,
        document_support, code_support, missing_evidence_json, explanation,
        recommended_judge_question, score_impact_category, potential_score_impact,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(claim_id) DO UPDATE SET
        status = excluded.status,
        verification_score = excluded.verification_score,
        confidence = excluded.confidence,
        methodology_score = excluded.methodology_score,
        consistency_score = excluded.consistency_score,
        demo_support = excluded.demo_support,
        demo_timestamp = excluded.demo_timestamp,
        document_support = excluded.document_support,
        code_support = excluded.code_support,
        missing_evidence_json = excluded.missing_evidence_json,
        explanation = excluded.explanation,
        recommended_judge_question = excluded.recommended_judge_question,
        score_impact_category = excluded.score_impact_category,
        potential_score_impact = excluded.potential_score_impact,
        updated_at = CURRENT_TIMESTAMP`,
      v.id,
      v.claimId,
      validEvalId,
      v.status,
      v.verificationScore,
      v.confidence,
      v.methodologyScore,
      v.consistencyScore,
      v.demoSupport || 'NO_DEMO',
      v.demoTimestamp || null,
      v.documentSupport || 'NOT_FOUND',
      v.codeSupport || 'NOT_SUPPORTED',
      JSON.stringify(v.missingEvidence || []),
      v.explanation || '',
      v.recommendedJudgeQuestion || null,
      v.scoreImpactCategory || 'TECHNICAL_QUALITY',
      v.potentialScoreImpact || 0.0
    );

    // Also update parent claim status & confidence for consistency
    db.run(
      `UPDATE claims SET status = ?, confidence = ?, explanation = ?, recommended_judge_question = ? WHERE id = ?`,
      v.status,
      v.confidence,
      v.explanation,
      v.recommendedJudgeQuestion || null,
      v.claimId
    );

    return v;
  }

  static getVerificationByClaimId(claimId: string): ClaimVerificationResult | null {
    const r = db.get<any>(`SELECT * FROM claim_verifications WHERE claim_id = ?`, claimId);
    if (!r) return null;
    return {
      id: r.id,
      claimId: r.claim_id,
      evaluationId: r.evaluation_id,
      status: r.status,
      verificationScore: r.verification_score,
      confidence: r.confidence,
      methodologyScore: r.methodology_score,
      consistencyScore: r.consistency_score,
      demoSupport: r.demo_support,
      demoTimestamp: r.demo_timestamp,
      documentSupport: r.document_support,
      codeSupport: r.code_support,
      missingEvidence: JSON.parse(r.missing_evidence_json || '[]'),
      explanation: r.explanation,
      recommendedJudgeQuestion: r.recommended_judge_question,
      scoreImpactCategory: r.score_impact_category,
      potentialScoreImpact: r.potential_score_impact,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  static getVerificationsByEvaluation(evaluationId: string): ClaimVerificationResult[] {
    const rows = db.all<any>(
      `SELECT * FROM claim_verifications WHERE evaluation_id = ?`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      claimId: r.claim_id,
      evaluationId: r.evaluation_id,
      status: r.status,
      verificationScore: r.verification_score,
      confidence: r.confidence,
      methodologyScore: r.methodology_score,
      consistencyScore: r.consistency_score,
      demoSupport: r.demo_support,
      demoTimestamp: r.demo_timestamp,
      documentSupport: r.document_support,
      codeSupport: r.code_support,
      missingEvidence: JSON.parse(r.missing_evidence_json || '[]'),
      explanation: r.explanation,
      recommendedJudgeQuestion: r.recommended_judge_question,
      scoreImpactCategory: r.score_impact_category,
      potentialScoreImpact: r.potential_score_impact,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  // ==========================================
  // CLAIM BENCHMARKS
  // ==========================================

  static createBenchmark(b: ClaimBenchmark): ClaimBenchmark {
    db.run(
      `INSERT INTO claim_benchmarks (
        id, claim_id, benchmark_source, metric, value, dataset, conditions,
        comparability, evidence_ids_json, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        benchmark_source = excluded.benchmark_source,
        metric = excluded.metric,
        value = excluded.value,
        dataset = excluded.dataset,
        conditions = excluded.conditions,
        comparability = excluded.comparability,
        evidence_ids_json = excluded.evidence_ids_json,
        notes = excluded.notes`,
      b.id,
      b.claimId,
      b.benchmarkSource,
      b.metric,
      b.value,
      b.dataset || null,
      b.conditions || null,
      b.comparability,
      JSON.stringify(b.evidenceIds || []),
      b.notes || null
    );
    return b;
  }

  static getBenchmarksByClaimId(claimId: string): ClaimBenchmark[] {
    const rows = db.all<any>(`SELECT * FROM claim_benchmarks WHERE claim_id = ?`, claimId);
    return rows.map(r => ({
      id: r.id,
      claimId: r.claim_id,
      benchmarkSource: r.benchmark_source,
      metric: r.metric,
      value: r.value,
      dataset: r.dataset,
      conditions: r.conditions,
      comparability: r.comparability,
      evidenceIds: JSON.parse(r.evidence_ids_json || '[]'),
      notes: r.notes,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // CONTRADICTIONS
  // ==========================================

  static createContradiction(c: PotentialContradiction): PotentialContradiction {
    db.run(
      `INSERT INTO claim_contradictions (
        id, evaluation_id, claim_a_id, claim_b_id, source_a, source_b,
        statement_a, statement_b, difference, severity, confidence, conflict_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        statement_a = excluded.statement_a,
        statement_b = excluded.statement_b,
        difference = excluded.difference,
        severity = excluded.severity,
        confidence = excluded.confidence,
        conflict_type = excluded.conflict_type`,
      c.id,
      c.evaluationId,
      c.claimAId,
      c.claimBId || null,
      c.sourceA,
      c.sourceB,
      c.statementA,
      c.statementB,
      c.difference,
      c.severity,
      c.confidence,
      c.conflictType || 'INTERNAL'
    );
    return c;
  }

  static getContradictionsByEvaluation(evaluationId: string): PotentialContradiction[] {
    const rows = db.all<any>(
      `SELECT * FROM claim_contradictions WHERE evaluation_id = ? ORDER BY CASE severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      claimAId: r.claim_a_id,
      claimBId: r.claim_b_id,
      sourceA: r.source_a,
      sourceB: r.source_b,
      statementA: r.statement_a,
      statementB: r.statement_b,
      difference: r.difference,
      severity: r.severity,
      confidence: r.confidence,
      conflictType: r.conflict_type,
      createdAt: r.created_at,
    }));
  }

  static getContradictionsByClaimId(claimId: string): PotentialContradiction[] {
    const rows = db.all<any>(
      `SELECT * FROM claim_contradictions WHERE claim_a_id = ? OR claim_b_id = ?`,
      claimId,
      claimId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      claimAId: r.claim_a_id,
      claimBId: r.claim_b_id,
      sourceA: r.source_a,
      sourceB: r.source_b,
      statementA: r.statement_a,
      statementB: r.statement_b,
      difference: r.difference,
      severity: r.severity,
      confidence: r.confidence,
      conflictType: r.conflict_type,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // VERSIONS & HUMAN REVIEW
  // ==========================================

  static createClaimVersion(v: ClaimVersion): ClaimVersion {
    db.run(
      `INSERT INTO claim_versions (
        id, claim_id, version_number, claim_text, status, parameters_json, reason, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      v.id,
      v.claimId,
      v.versionNumber,
      v.claimText,
      v.status,
      v.parameters ? JSON.stringify(v.parameters) : null,
      v.reason
    );
    return v;
  }

  static getClaimVersions(claimId: string): ClaimVersion[] {
    const rows = db.all<any>(
      `SELECT * FROM claim_versions WHERE claim_id = ? ORDER BY version_number DESC`,
      claimId
    );
    return rows.map(r => ({
      id: r.id,
      claimId: r.claim_id,
      versionNumber: r.version_number,
      claimText: r.claim_text,
      status: r.status,
      parameters: r.parameters_json ? JSON.parse(r.parameters_json) : undefined,
      reason: r.reason,
      createdAt: r.created_at,
    }));
  }

  static createHumanReview(hr: ClaimHumanReview): ClaimHumanReview {
    db.run(
      `INSERT INTO claim_human_reviews (
        id, claim_id, evaluation_id, reviewer_name, old_status, new_status, reason, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      hr.id,
      hr.claimId,
      hr.evaluationId,
      hr.reviewerName,
      hr.oldStatus,
      hr.newStatus,
      hr.reason
    );

    // Update claim status and record an updated version
    db.run(`UPDATE claims SET status = ? WHERE id = ?`, hr.newStatus, hr.claimId);
    db.run(`UPDATE claim_verifications SET status = ? WHERE claim_id = ?`, hr.newStatus, hr.claimId);

    const versionCount = db.get<any>(
      `SELECT COUNT(*) as cnt FROM claim_versions WHERE claim_id = ?`,
      hr.claimId
    );
    const claim = this.getClaimById(hr.claimId);

    if (claim) {
      this.createClaimVersion({
        id: `cv_${hr.claimId}_${(versionCount?.cnt || 0) + 1}`,
        claimId: hr.claimId,
        versionNumber: (versionCount?.cnt || 0) + 1,
        claimText: claim.claimText,
        status: hr.newStatus,
        reason: `Human review override by ${hr.reviewerName}: ${hr.reason}`,
        createdAt: new Date().toISOString(),
      });
    }

    return hr;
  }

  static getHumanReviews(claimId: string): ClaimHumanReview[] {
    const rows = db.all<any>(
      `SELECT * FROM claim_human_reviews WHERE claim_id = ? ORDER BY created_at DESC`,
      claimId
    );
    return rows.map(r => ({
      id: r.id,
      claimId: r.claim_id,
      evaluationId: r.evaluation_id,
      reviewerName: r.reviewer_name,
      oldStatus: r.old_status,
      newStatus: r.new_status,
      reason: r.reason,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // DETAIL BUNDLE & SUMMARY
  // ==========================================

  static getClaimDetailBundle(claimId: string): ClaimDetailBundle | null {
    const claim = this.getClaimById(claimId);
    if (!claim) return null;

    const parameters = this.getClaimParameters(claimId) || undefined;
    const verification = this.getVerificationByClaimId(claimId) || undefined;
    const benchmarks = this.getBenchmarksByClaimId(claimId);
    const contradictions = this.getContradictionsByClaimId(claimId);
    const versions = this.getClaimVersions(claimId);
    const humanReviews = this.getHumanReviews(claimId);

    // Fetch supporting & contradicting evidence objects
    const suppEvidence: any[] = [];
    for (const eid of claim.supportingEvidenceIds) {
      const ev = db.get<any>(`SELECT * FROM evidence WHERE id = ?`, eid);
      if (ev) suppEvidence.push(ev);
    }

    const contraEvidence: any[] = [];
    for (const eid of claim.contradictingEvidenceIds) {
      const ev = db.get<any>(`SELECT * FROM evidence WHERE id = ?`, eid);
      if (ev) contraEvidence.push(ev);
    }

    return {
      claim,
      parameters,
      verification,
      benchmarks,
      contradictions,
      versions,
      humanReviews,
      supportingEvidence: suppEvidence,
      contradictingEvidence: contraEvidence,
    };
  }

  static getEvaluationSummary(evaluationId: string): EvaluationClaimsSummary {
    const claims = this.getClaimsByEvaluation(evaluationId);
    const contradictions = this.getContradictionsByEvaluation(evaluationId);

    let verifiedCount = 0;
    let partiallyVerifiedCount = 0;
    let unverifiedCount = 0;
    let contradictedCount = 0;
    let insufficientEvidenceCount = 0;
    let highRiskCount = 0;
    let totalConfidence = 0;

    for (const c of claims) {
      totalConfidence += c.confidence;
      if (c.status === 'VERIFIED') verifiedCount++;
      else if (c.status === 'PARTIALLY_VERIFIED') partiallyVerifiedCount++;
      else if (c.status === 'UNVERIFIED') unverifiedCount++;
      else if (c.status === 'CONTRADICTED') contradictedCount++;
      else if (c.status === 'INSUFFICIENT_EVIDENCE') insufficientEvidenceCount++;

      if (
        (c.importance === 'CRITICAL' || c.importance === 'HIGH') &&
        (c.status === 'UNVERIFIED' || c.status === 'CONTRADICTED' || c.status === 'INSUFFICIENT_EVIDENCE')
      ) {
        highRiskCount++;
      }
    }

    const totalClaims = claims.length;
    const avgConfidence = totalClaims > 0 ? Math.round(totalConfidence / totalClaims) : 0;
    const overallReliabilityRate = totalClaims > 0
      ? Math.round(((verifiedCount * 1.0 + partiallyVerifiedCount * 0.5) / totalClaims) * 100)
      : 0;

    return {
      evaluationId,
      totalClaims,
      verifiedCount,
      partiallyVerifiedCount,
      unverifiedCount,
      contradictedCount,
      insufficientEvidenceCount,
      highRiskCount,
      overallReliabilityRate,
      averageConfidence: avgConfidence,
      claims,
      contradictions,
    };
  }

  static clearEvaluationClaims(evaluationId: string): void {
    db.run(`DELETE FROM claim_human_reviews WHERE evaluation_id = ?`, evaluationId);
    db.run(`DELETE FROM claim_contradictions WHERE evaluation_id = ?`, evaluationId);
    db.run(`DELETE FROM claim_verifications WHERE evaluation_id = ?`, evaluationId);
    // Delete versions and parameters
    const claimIds = db.all<any>(`SELECT id FROM claims WHERE evaluation_id = ?`, evaluationId);
    for (const row of claimIds) {
      db.run(`DELETE FROM claim_versions WHERE claim_id = ?`, row.id);
      db.run(`DELETE FROM claim_benchmarks WHERE claim_id = ?`, row.id);
      db.run(`DELETE FROM claim_parameters WHERE claim_id = ?`, row.id);
    }
  }
}

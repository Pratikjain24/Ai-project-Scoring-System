import { db } from '../db/database';
import type {
  CategoryAssessment,
  EvaluatorRisk,
  EvaluatorEvidenceGap,
  EvaluatorRecommendation,
  ProjectMaturityAssessment,
  SpecialistEvaluationSummary,
  ProjectClassification,
} from '../specialist-evaluators/types';

export class SpecialistEvaluationRepository {
  /**
   * Persist complete Specialist Evaluation summary and all child records
   */
  static saveSummary(s: SpecialistEvaluationSummary): SpecialistEvaluationSummary {
    db.transaction(() => {
      // 1. Save Summary
      db.run(
        `INSERT INTO evaluator_summaries (
          id, evaluation_id, project_type, technical_score, technical_confidence,
          impact_score, impact_confidence, feasibility_score, feasibility_confidence,
          impact_feasibility_quadrant, why_strong_json, why_weak_json, what_must_fix_json,
          what_makes_exceptional_json, cost_known_json, cost_estimated_json,
          cost_unknown_json, technical_debt_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(evaluation_id) DO UPDATE SET
          project_type = excluded.project_type,
          technical_score = excluded.technical_score,
          technical_confidence = excluded.technical_confidence,
          impact_score = excluded.impact_score,
          impact_confidence = excluded.impact_confidence,
          feasibility_score = excluded.feasibility_score,
          feasibility_confidence = excluded.feasibility_confidence,
          impact_feasibility_quadrant = excluded.impact_feasibility_quadrant,
          why_strong_json = excluded.why_strong_json,
          why_weak_json = excluded.why_weak_json,
          what_must_fix_json = excluded.what_must_fix_json,
          what_makes_exceptional_json = excluded.what_makes_exceptional_json,
          cost_known_json = excluded.cost_known_json,
          cost_estimated_json = excluded.cost_estimated_json,
          cost_unknown_json = excluded.cost_unknown_json,
          technical_debt_json = excluded.technical_debt_json,
          updated_at = CURRENT_TIMESTAMP`,
        s.id,
        s.evaluationId,
        s.projectType,
        s.technicalScore,
        s.technicalConfidence,
        s.impactScore,
        s.impactConfidence,
        s.feasibilityScore,
        s.feasibilityConfidence,
        s.impactFeasibilityQuadrant,
        JSON.stringify(s.whyStrong || []),
        JSON.stringify(s.whyWeak || []),
        JSON.stringify(s.whatMustFix || []),
        JSON.stringify(s.whatMakesExceptional || []),
        JSON.stringify(s.costKnown || []),
        JSON.stringify(s.costEstimated || []),
        JSON.stringify(s.costUnknown || []),
        JSON.stringify(s.technicalDebt || [])
      );

      // 2. Save Assessments
      for (const a of s.assessments) {
        db.run(
          `INSERT INTO evaluator_assessments (
            id, evaluation_id, category, sub_category, score, confidence, status,
            summary, strengths_json, weaknesses_json, risks_json, recommendations_json,
            evidence_ids_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            score = excluded.score,
            confidence = excluded.confidence,
            status = excluded.status,
            summary = excluded.summary,
            strengths_json = excluded.strengths_json,
            weaknesses_json = excluded.weaknesses_json,
            risks_json = excluded.risks_json,
            recommendations_json = excluded.recommendations_json,
            evidence_ids_json = excluded.evidence_ids_json,
            updated_at = CURRENT_TIMESTAMP`,
          a.id,
          a.evaluationId,
          a.category,
          a.subCategory,
          a.score,
          a.confidence,
          a.status,
          a.summary,
          JSON.stringify(a.strengths || []),
          JSON.stringify(a.weaknesses || []),
          JSON.stringify(a.risks || []),
          JSON.stringify(a.recommendations || []),
          JSON.stringify(a.evidenceIds || [])
        );
      }

      // 3. Save Risks
      for (const r of s.risks) {
        db.run(
          `INSERT INTO evaluator_risks (
            id, evaluation_id, category, title, description, severity, likelihood,
            confidence, evidence_ids_json, mitigation, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            severity = excluded.severity,
            likelihood = excluded.likelihood,
            confidence = excluded.confidence,
            evidence_ids_json = excluded.evidence_ids_json,
            mitigation = excluded.mitigation`,
          r.id,
          r.evaluationId,
          r.category,
          r.title,
          r.description,
          r.severity,
          r.likelihood,
          r.confidence,
          JSON.stringify(r.evidenceIds || []),
          r.mitigation
        );
      }

      // 4. Save Evidence Gaps
      for (const g of s.evidenceGaps) {
        db.run(
          `INSERT INTO evaluator_evidence_gaps (
            id, evaluation_id, category, description, importance, expected_evidence,
            related_assessment, confidence, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            description = excluded.description,
            importance = excluded.importance,
            expected_evidence = excluded.expected_evidence,
            related_assessment = excluded.related_assessment,
            confidence = excluded.confidence`,
          g.id,
          g.evaluationId,
          g.category,
          g.description,
          g.importance,
          g.expectedEvidence,
          g.relatedAssessment || null,
          g.confidence
        );
      }

      // 5. Save Recommendations
      for (const rec of s.recommendations) {
        db.run(
          `INSERT INTO evaluator_recommendations (
            id, evaluation_id, title, priority, problem, action, expected_benefit,
            related_evidence_ids_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            priority = excluded.priority,
            problem = excluded.problem,
            action = excluded.action,
            expected_benefit = excluded.expected_benefit,
            related_evidence_ids_json = excluded.related_evidence_ids_json`,
          rec.id,
          rec.evaluationId,
          rec.title,
          rec.priority,
          rec.problem,
          rec.action,
          rec.expectedBenefit,
          JSON.stringify(rec.relatedEvidenceIds || [])
        );
      }

      // 6. Save Maturity
      if (s.maturity) {
        db.run(
          `INSERT INTO evaluator_maturity (
            id, evaluation_id, overall_stage, technical_maturity, validation_maturity,
            deployment_maturity, operations_maturity, market_maturity, blockers_json,
            evidence_summary, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(evaluation_id) DO UPDATE SET
            overall_stage = excluded.overall_stage,
            technical_maturity = excluded.technical_maturity,
            validation_maturity = excluded.validation_maturity,
            deployment_maturity = excluded.deployment_maturity,
            operations_maturity = excluded.operations_maturity,
            market_maturity = excluded.market_maturity,
            blockers_json = excluded.blockers_json,
            evidence_summary = excluded.evidence_summary`,
          s.maturity.id,
          s.maturity.evaluationId,
          s.maturity.overallStage,
          s.maturity.technicalMaturity,
          s.maturity.validationMaturity,
          s.maturity.deploymentMaturity,
          s.maturity.operationsMaturity,
          s.maturity.marketMaturity,
          JSON.stringify(s.maturity.blockers || []),
          s.maturity.evidenceSummary
        );
      }
    });

    return s;
  }

  /**
   * Retrieve summary for an evaluation
   */
  static getSummary(evaluationId: string): SpecialistEvaluationSummary | null {
    const row = db.get<any>(`SELECT * FROM evaluator_summaries WHERE evaluation_id = ?`, evaluationId);
    if (!row) return null;

    const assessments = this.getAssessmentsByEvaluation(evaluationId);
    const risks = this.getRisksByEvaluation(evaluationId);
    const evidenceGaps = this.getGapsByEvaluation(evaluationId);
    const recommendations = this.getRecommendationsByEvaluation(evaluationId);
    const maturity = this.getMaturityByEvaluation(evaluationId);

    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      projectType: row.project_type as ProjectClassification,
      technicalScore: row.technical_score,
      technicalConfidence: row.technical_confidence,
      impactScore: row.impact_score,
      impactConfidence: row.impact_confidence,
      feasibilityScore: row.feasibility_score,
      feasibilityConfidence: row.feasibility_confidence,
      impactFeasibilityQuadrant: row.impact_feasibility_quadrant,
      whyStrong: JSON.parse(row.why_strong_json || '[]'),
      whyWeak: JSON.parse(row.why_weak_json || '[]'),
      whatMustFix: JSON.parse(row.what_must_fix_json || '[]'),
      whatMakesExceptional: JSON.parse(row.what_makes_exceptional_json || '[]'),
      costKnown: JSON.parse(row.cost_known_json || '[]'),
      costEstimated: JSON.parse(row.cost_estimated_json || '[]'),
      costUnknown: JSON.parse(row.cost_unknown_json || '[]'),
      technicalDebt: JSON.parse(row.technical_debt_json || '[]'),
      assessments,
      risks,
      evidenceGaps,
      recommendations,
      maturity: maturity || {
        id: `mat_${evaluationId}`,
        evaluationId,
        overallStage: 'PROTOTYPE',
        technicalMaturity: 'Prototype validated in bench environment',
        validationMaturity: 'Benchmarked with primary dataset logs',
        deploymentMaturity: 'Standalone prototype deployment',
        operationsMaturity: 'Manual operational procedures',
        marketMaturity: 'Initial pilot target validation',
        blockers: [],
        evidenceSummary: '',
      },
    };
  }

  static getAssessmentsByEvaluation(evaluationId: string): CategoryAssessment[] {
    const rows = db.all<any>(`SELECT * FROM evaluator_assessments WHERE evaluation_id = ?`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      category: r.category,
      subCategory: r.sub_category,
      score: r.score,
      confidence: r.confidence,
      status: r.status,
      summary: r.summary,
      strengths: JSON.parse(r.strengths_json || '[]'),
      weaknesses: JSON.parse(r.weaknesses_json || '[]'),
      risks: JSON.parse(r.risks_json || '[]'),
      recommendations: JSON.parse(r.recommendations_json || '[]'),
      evidenceIds: JSON.parse(r.evidence_ids_json || '[]'),
    }));
  }

  static getRisksByEvaluation(evaluationId: string): EvaluatorRisk[] {
    const rows = db.all<any>(
      `SELECT * FROM evaluator_risks WHERE evaluation_id = ? ORDER BY CASE severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      category: r.category,
      title: r.title,
      description: r.description,
      severity: r.severity,
      likelihood: r.likelihood,
      confidence: r.confidence,
      evidenceIds: JSON.parse(r.evidence_ids_json || '[]'),
      mitigation: r.mitigation,
    }));
  }

  static getGapsByEvaluation(evaluationId: string): EvaluatorEvidenceGap[] {
    const rows = db.all<any>(
      `SELECT * FROM evaluator_evidence_gaps WHERE evaluation_id = ? ORDER BY CASE importance WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      category: r.category,
      description: r.description,
      importance: r.importance,
      expectedEvidence: r.expected_evidence,
      relatedAssessment: r.related_assessment || undefined,
      confidence: r.confidence,
    }));
  }

  static getRecommendationsByEvaluation(evaluationId: string): EvaluatorRecommendation[] {
    const rows = db.all<any>(
      `SELECT * FROM evaluator_recommendations WHERE evaluation_id = ? ORDER BY CASE priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      title: r.title,
      priority: r.priority,
      problem: r.problem,
      action: r.action,
      expectedBenefit: r.expected_benefit,
      relatedEvidenceIds: JSON.parse(r.related_evidence_ids_json || '[]'),
    }));
  }

  static getMaturityByEvaluation(evaluationId: string): ProjectMaturityAssessment | null {
    const r = db.get<any>(`SELECT * FROM evaluator_maturity WHERE evaluation_id = ?`, evaluationId);
    if (!r) return null;
    return {
      id: r.id,
      evaluationId: r.evaluation_id,
      overallStage: r.overall_stage,
      technicalMaturity: r.technical_maturity,
      validationMaturity: r.validation_maturity,
      deploymentMaturity: r.deployment_maturity,
      operationsMaturity: r.operations_maturity,
      marketMaturity: r.market_maturity,
      blockers: JSON.parse(r.blockers_json || '[]'),
      evidenceSummary: r.evidence_summary,
    };
  }
}

import { db } from '../db/database';
import type {
  Rubric,
  RubricVersion,
  JuryDecision,
  MasterCategoryScore,
  HumanReview,
  JuryNote,
  JuryQuestionInteraction,
  ScoreHistoryEntry,
} from '../models/masterScoring';

export class JuryRepository {
  // 1. Rubrics & Versions
  static createOrUpdateRubric(rubric: Rubric): void {
    db.run(
      `INSERT OR REPLACE INTO rubrics (id, name, description, is_default, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      rubric.id,
      rubric.name,
      rubric.description || null,
      rubric.isDefault ? 1 : 0,
      rubric.createdAt || new Date().toISOString()
    );
  }

  static getRubric(id: string): Rubric | undefined {
    const row = db.get<any>(`SELECT * FROM rubrics WHERE id = ?`, id);
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
    };
  }

  static getDefaultRubric(): Rubric | undefined {
    const row = db.get<any>(`SELECT * FROM rubrics WHERE is_default = 1 LIMIT 1`);
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
    };
  }

  static createRubricVersion(version: RubricVersion): void {
    db.run(
      `INSERT OR REPLACE INTO rubric_versions (
        id, rubric_id, version, name, weights_json, thresholds_json, category_definitions_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      version.id,
      version.rubricId,
      version.version,
      version.name,
      JSON.stringify(version.weights),
      JSON.stringify(version.thresholds),
      JSON.stringify(version.categoryDefinitions),
      version.createdAt || new Date().toISOString()
    );
  }

  static getRubricVersion(id: string): RubricVersion | undefined {
    const row = db.get<any>(`SELECT * FROM rubric_versions WHERE id = ?`, id);
    if (!row) return undefined;
    return {
      id: row.id,
      rubricId: row.rubric_id,
      version: row.version,
      name: row.name,
      weights: JSON.parse(row.weights_json),
      thresholds: JSON.parse(row.thresholds_json),
      categoryDefinitions: JSON.parse(row.category_definitions_json),
      createdAt: row.created_at,
    };
  }

  static getAllRubricVersions(rubricId?: string): RubricVersion[] {
    const sql = rubricId
      ? `SELECT * FROM rubric_versions WHERE rubric_id = ? ORDER BY created_at DESC`
      : `SELECT * FROM rubric_versions ORDER BY created_at DESC`;
    const rows = rubricId ? db.all<any>(sql, rubricId) : db.all<any>(sql);
    return rows.map(r => ({
      id: r.id,
      rubricId: r.rubric_id,
      version: r.version,
      name: r.name,
      weights: JSON.parse(r.weights_json),
      thresholds: JSON.parse(r.thresholds_json),
      categoryDefinitions: JSON.parse(r.category_definitions_json),
      createdAt: r.created_at,
    }));
  }

  // 2. AI Jury Decisions
  static saveJuryDecision(decision: JuryDecision): void {
    db.run(
      `INSERT OR REPLACE INTO jury_decisions (
        id, evaluation_id, rubric_version_id, overall_score, verdict,
        confidence, confidence_level, evidence_coverage, score_reliability,
        qualifiers_json, executive_verdict, strengths_json, weaknesses_json,
        risks_json, evidence_gaps_json, claim_impact_json, sensitivity_json,
        recommendations_json, judge_questions_json, current_project_score,
        future_potential_score, exceptionality_analysis_json, status,
        version_number, calculation_time, engine_version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      decision.id,
      decision.evaluationId,
      decision.rubricVersionId,
      decision.overallScore,
      decision.verdict,
      decision.confidence,
      decision.confidenceLevel,
      decision.evidenceCoverage,
      decision.scoreReliability,
      JSON.stringify(decision.qualifiers || []),
      decision.executiveVerdict,
      JSON.stringify(decision.strengths || []),
      JSON.stringify(decision.weaknesses || []),
      JSON.stringify(decision.risks || []),
      JSON.stringify(decision.evidenceGaps || []),
      JSON.stringify(decision.claimImpact || []),
      JSON.stringify(decision.sensitivity || {}),
      JSON.stringify(decision.recommendations || []),
      JSON.stringify(decision.judgeQuestions || []),
      decision.currentProjectScore,
      decision.futurePotentialScore,
      JSON.stringify(decision.exceptionalityAnalysis || {}),
      decision.status,
      decision.versionNumber,
      decision.calculationTime,
      decision.engineVersion,
      decision.createdAt || new Date().toISOString(),
      new Date().toISOString()
    );

    // Also update parent evaluations table for cross-compatibility
    db.run(
      `UPDATE evaluations SET
        overall_score = ?,
        confidence = ?,
        verdict = ?,
        executive_summary = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      decision.overallScore,
      decision.confidence,
      decision.verdict,
      decision.executiveVerdict,
      decision.evaluationId
    );
  }

  static getJuryDecision(evaluationId: string): JuryDecision | undefined {
    let row = db.get<any>(`SELECT * FROM jury_decisions WHERE evaluation_id = ?`, evaluationId);
    if (!row) {
      const evalRow = db.get<any>(`SELECT id FROM evaluations WHERE project_id = ? OR id = ? OR id = ? LIMIT 1`, evaluationId, evaluationId, `eval_${evaluationId}`);
      if (evalRow) {
        row = db.get<any>(`SELECT * FROM jury_decisions WHERE evaluation_id = ?`, evalRow.id);
      }
    }
    if (!row) return undefined;
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      rubricVersionId: row.rubric_version_id,
      overallScore: row.overall_score,
      verdict: row.verdict,
      confidence: row.confidence,
      confidenceLevel: row.confidence_level,
      evidenceCoverage: row.evidence_coverage,
      scoreReliability: row.score_reliability,
      qualifiers: JSON.parse(row.qualifiers_json || '[]'),
      executiveVerdict: row.executive_verdict,
      strengths: JSON.parse(row.strengths_json || '[]'),
      weaknesses: JSON.parse(row.weaknesses_json || '[]'),
      risks: JSON.parse(row.risks_json || '[]'),
      evidenceGaps: JSON.parse(row.evidence_gaps_json || '[]'),
      claimImpact: JSON.parse(row.claim_impact_json || '[]'),
      sensitivity: JSON.parse(row.sensitivity_json || '{}'),
      recommendations: JSON.parse(row.recommendations_json || '[]'),
      judgeQuestions: JSON.parse(row.judge_questions_json || '[]'),
      currentProjectScore: row.current_project_score,
      futurePotentialScore: row.future_potential_score,
      exceptionalityAnalysis: JSON.parse(row.exceptionality_analysis_json || '{}'),
      status: row.status,
      versionNumber: row.version_number,
      calculationTime: row.calculation_time,
      engineVersion: row.engine_version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // 3. Category Scores
  static saveCategoryScores(scores: MasterCategoryScore[]): void {
    db.transaction(() => {
      for (const s of scores) {
        db.run(
          `INSERT OR REPLACE INTO master_category_scores (
            id, evaluation_id, category_key, category_label, raw_score, weight,
            weighted_score, confidence, evidence_count, evidence_coverage, status,
            strengths_json, weaknesses_json, risks_json, evidence_ids_json, why_this_score, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          s.id,
          s.evaluationId,
          s.categoryKey,
          s.categoryLabel,
          s.rawScore,
          s.weight,
          s.weightedScore,
          s.confidence,
          s.evidenceCount,
          s.evidenceCoverage || 0,
          s.status,
          JSON.stringify(s.strengths || []),
          JSON.stringify(s.weaknesses || []),
          JSON.stringify(s.risks || []),
          JSON.stringify(s.evidenceIds || []),
          s.whyThisScore,
          s.createdAt || new Date().toISOString()
        );
      }
    });
  }

  static getCategoryScores(evaluationId: string): MasterCategoryScore[] {
    let rows = db.all<any>(`SELECT * FROM master_category_scores WHERE evaluation_id = ?`, evaluationId);
    if (!rows || rows.length === 0) {
      const evalRow = db.get<any>(`SELECT id FROM evaluations WHERE project_id = ? OR id = ? OR id = ? LIMIT 1`, evaluationId, evaluationId, `eval_${evaluationId}`);
      if (evalRow) {
        rows = db.all<any>(`SELECT * FROM master_category_scores WHERE evaluation_id = ?`, evalRow.id);
      }
    }
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      categoryKey: r.category_key,
      categoryLabel: r.category_label,
      rawScore: r.raw_score,
      weight: r.weight,
      weightedScore: r.weighted_score,
      confidence: r.confidence,
      evidenceCount: r.evidence_count,
      evidenceCoverage: r.evidence_coverage,
      status: r.status,
      strengths: JSON.parse(r.strengths_json || '[]'),
      weaknesses: JSON.parse(r.weaknesses_json || '[]'),
      risks: JSON.parse(r.risks_json || '[]'),
      evidenceIds: JSON.parse(r.evidence_ids_json || '[]'),
      whyThisScore: r.why_this_score,
      createdAt: r.created_at,
    }));
  }

  // 4. Human Reviews
  static saveHumanReview(review: HumanReview): void {
    db.run(
      `INSERT INTO human_reviews (id, evaluation_id, reviewer, category, original_score, reviewed_score, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      review.id,
      review.evaluationId,
      review.reviewer,
      review.category,
      review.originalScore,
      review.reviewedScore,
      review.reason,
      review.createdAt || new Date().toISOString()
    );
  }

  static getHumanReviews(evaluationId: string): HumanReview[] {
    const rows = db.all<any>(`SELECT * FROM human_reviews WHERE evaluation_id = ? ORDER BY created_at DESC`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      reviewer: r.reviewer,
      category: r.category,
      originalScore: r.original_score,
      reviewedScore: r.reviewed_score,
      reason: r.reason,
      createdAt: r.created_at,
    }));
  }

  // 5. Jury Notes
  static saveJuryNote(note: JuryNote): void {
    db.run(
      `INSERT INTO jury_notes (id, evaluation_id, category, text, author, related_evidence_ids_json, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      note.id,
      note.evaluationId,
      note.category,
      note.text,
      note.author,
      JSON.stringify(note.relatedEvidenceIds || []),
      note.timestamp || new Date().toISOString()
    );
  }

  static getJuryNotes(evaluationId: string): JuryNote[] {
    const rows = db.all<any>(`SELECT * FROM jury_notes WHERE evaluation_id = ? ORDER BY timestamp DESC`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      category: r.category,
      text: r.text,
      author: r.author,
      relatedEvidenceIds: JSON.parse(r.related_evidence_ids_json || '[]'),
      timestamp: r.timestamp,
    }));
  }

  // 6. Question Interactions
  static saveQuestionInteraction(interaction: JuryQuestionInteraction): void {
    db.run(
      `INSERT OR REPLACE INTO jury_question_interactions (
        id, evaluation_id, question_id, is_asked, is_flagged, is_bookmarked, judge_note, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      interaction.id,
      interaction.evaluationId,
      interaction.questionId,
      interaction.isAsked ? 1 : 0,
      interaction.isFlagged ? 1 : 0,
      interaction.isBookmarked ? 1 : 0,
      interaction.judgeNote || null,
      new Date().toISOString()
    );
  }

  static getQuestionInteractions(evaluationId: string): JuryQuestionInteraction[] {
    const rows = db.all<any>(`SELECT * FROM jury_question_interactions WHERE evaluation_id = ?`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      questionId: r.question_id,
      isAsked: Boolean(r.is_asked),
      isFlagged: Boolean(r.is_flagged),
      isBookmarked: Boolean(r.is_bookmarked),
      judgeNote: r.judge_note || undefined,
      updatedAt: r.updated_at,
    }));
  }

  // 7. Score History
  static saveScoreHistory(entry: ScoreHistoryEntry): void {
    db.run(
      `INSERT INTO score_history (
        id, evaluation_id, version_number, overall_score, confidence,
        evidence_coverage, verdict, change_summary, why_score_changed,
        added_evidence_ids_json, rubric_version_id, engine_version, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.id,
      entry.evaluationId,
      entry.versionNumber,
      entry.overallScore,
      entry.confidence,
      entry.evidenceCoverage,
      entry.verdict,
      entry.changeSummary,
      entry.whyScoreChanged,
      JSON.stringify(entry.addedEvidenceIds || []),
      entry.rubricVersionId,
      entry.engineVersion,
      entry.createdAt || new Date().toISOString()
    );
  }

  static getScoreHistory(evaluationId: string): ScoreHistoryEntry[] {
    const rows = db.all<any>(`SELECT * FROM score_history WHERE evaluation_id = ? ORDER BY version_number ASC`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      versionNumber: r.version_number,
      overallScore: r.overall_score,
      confidence: r.confidence,
      evidenceCoverage: r.evidence_coverage,
      verdict: r.verdict,
      changeSummary: r.change_summary,
      whyScoreChanged: r.why_score_changed,
      addedEvidenceIds: JSON.parse(r.added_evidence_ids_json || '[]'),
      rubricVersionId: r.rubric_version_id,
      engineVersion: r.engine_version,
      createdAt: r.created_at,
    }));
  }
}

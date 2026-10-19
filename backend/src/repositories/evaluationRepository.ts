import { db } from '../db/database';
import type { Evaluation, AnalysisJob, EvaluationStatus, JobState } from '../models/evaluation';

export class EvaluationRepository {
  static create(evaluation: Omit<Evaluation, 'createdAt' | 'updatedAt'>): Evaluation {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO evaluations (
        id, project_id, mode, status, overall_score, confidence, verdict, executive_summary, execution_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      evaluation.id,
      evaluation.projectId,
      evaluation.mode,
      evaluation.status,
      evaluation.overallScore || null,
      evaluation.confidence || null,
      evaluation.verdict || null,
      evaluation.executiveSummary || null,
      evaluation.executionId || `exec_${Date.now()}`,
      now,
      now
    );

    return this.findById(evaluation.id)!;
  }

  static findById(id: string): Evaluation | undefined {
    let row = db.get<any>(`SELECT * FROM evaluations WHERE id = ?`, id);
    if (!row) {
      // Fallback: Check if the provided id is a project_id
      row = db.get<any>(`SELECT * FROM evaluations WHERE project_id = ? ORDER BY created_at DESC LIMIT 1`, id);
    }
    if (!row) return undefined;

    return {
      id: row.id,
      projectId: row.project_id,
      mode: row.mode,
      status: row.status as EvaluationStatus,
      overallScore: row.overall_score !== null ? row.overall_score : undefined,
      confidence: row.confidence !== null ? row.confidence : undefined,
      verdict: row.verdict || undefined,
      executiveSummary: row.executive_summary || undefined,
      executionId: row.execution_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static findByProjectId(projectId: string): Evaluation[] {
    const rows = db.all<any>(`SELECT * FROM evaluations WHERE project_id = ? ORDER BY created_at DESC`, projectId);
    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      mode: row.mode,
      status: row.status as EvaluationStatus,
      overallScore: row.overall_score !== null ? row.overall_score : undefined,
      confidence: row.confidence !== null ? row.confidence : undefined,
      verdict: row.verdict || undefined,
      executiveSummary: row.executive_summary || undefined,
      executionId: row.execution_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static findAll(): Evaluation[] {
    const rows = db.all<any>(`SELECT * FROM evaluations ORDER BY created_at DESC`);
    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      mode: row.mode,
      status: row.status as EvaluationStatus,
      overallScore: row.overall_score !== null ? row.overall_score : undefined,
      confidence: row.confidence !== null ? row.confidence : undefined,
      verdict: row.verdict || undefined,
      executiveSummary: row.executive_summary || undefined,
      executionId: row.execution_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static update(id: string, updates: Partial<Evaluation>): Evaluation | undefined {
    const now = new Date().toISOString();
    db.run(
      `UPDATE evaluations SET
        status = COALESCE(?, status),
        overall_score = COALESCE(?, overall_score),
        confidence = COALESCE(?, confidence),
        verdict = COALESCE(?, verdict),
        executive_summary = COALESCE(?, executive_summary),
        updated_at = ?
      WHERE id = ?`,
      updates.status || null,
      updates.overallScore !== undefined ? updates.overallScore : null,
      updates.confidence !== undefined ? updates.confidence : null,
      updates.verdict || null,
      updates.executiveSummary
        ? (typeof updates.executiveSummary === 'string'
            ? updates.executiveSummary
            : (updates.executiveSummary as any).coreSummary || JSON.stringify(updates.executiveSummary))
        : null,
      now,
      id
    );

    return this.findById(id);
  }

  // --- Analysis Jobs ---

  static createJob(job: AnalysisJob): void {
    db.run(
      `INSERT OR REPLACE INTO analysis_jobs (
        id, evaluation_id, job_type, stage_name, stage_index, total_stages,
        state, progress_percentage, message, execution_id, details_json, started_at, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      job.id,
      job.evaluationId,
      job.jobType,
      job.stageName,
      job.stageIndex,
      job.totalStages,
      job.state,
      job.progressPercentage,
      job.message,
      job.executionId,
      job.details ? JSON.stringify(job.details) : null,
      job.startedAt || null,
      job.completedAt || null,
      job.createdAt || new Date().toISOString()
    );
  }

  static updateJobState(
    id: string,
    state: JobState,
    progressPercentage: number,
    message: string,
    details?: Record<string, any>
  ): void {
    const completedAt = state === 'COMPLETED' || state === 'FAILED' ? new Date().toISOString() : null;
    db.run(
      `UPDATE analysis_jobs SET
        state = ?,
        progress_percentage = ?,
        message = ?,
        details_json = COALESCE(?, details_json),
        completed_at = COALESCE(?, completed_at)
      WHERE id = ?`,
      state,
      progressPercentage,
      message,
      details ? JSON.stringify(details) : null,
      completedAt,
      id
    );
  }

  static getJobsByEvaluationId(evaluationId: string): AnalysisJob[] {
    const rows = db.all<any>(`SELECT * FROM analysis_jobs WHERE evaluation_id = ? ORDER BY stage_index ASC`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      jobType: r.job_type,
      stageName: r.stage_name,
      stageIndex: r.stage_index,
      totalStages: r.total_stages,
      state: r.state as JobState,
      progressPercentage: r.progress_percentage,
      message: r.message,
      executionId: r.execution_id,
      details: r.details_json ? JSON.parse(r.details_json) : undefined,
      startedAt: r.started_at || undefined,
      completedAt: r.completed_at || undefined,
      createdAt: r.created_at,
    }));
  }
}

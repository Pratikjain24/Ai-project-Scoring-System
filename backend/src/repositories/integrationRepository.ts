import { db } from '../db/database';
import type {
  EvaluationStateRecord,
  EvaluationCheckpointRecord,
  AuditEventRecord,
  UsageRecord,
  EvidenceRequestRecord,
  EvaluationRevisionRecord,
  FeatureFlagRecord,
  EvaluationState,
  EvaluationCheckpoint
} from '../models/integration';

export class IntegrationRepository {
  // ==========================================
  // EVALUATION STATE MACHINE
  // ==========================================

  static getState(evaluationId: string): EvaluationStateRecord | null {
    const row = db.get<any>(
      `SELECT * FROM evaluation_states WHERE evaluation_id = ?`,
      evaluationId
    );
    if (!row) return null;

    return {
      evaluationId: row.evaluation_id,
      currentState: row.current_state as EvaluationState,
      previousState: row.previous_state as EvaluationState | undefined,
      latestCheckpoint: row.latest_checkpoint as EvaluationCheckpoint | undefined,
      retryCount: row.retry_count,
      errorMessage: row.error_message || undefined,
      errorStage: row.error_stage || undefined,
      isLocked: Boolean(row.is_locked),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static getOrCreateState(evaluationId: string, initialState: EvaluationState = 'DRAFT'): EvaluationStateRecord {
    const existing = this.getState(evaluationId);
    if (existing) return existing;

    const now = new Date().toISOString();
    db.run(
      `INSERT INTO evaluation_states (
        evaluation_id, current_state, previous_state, latest_checkpoint,
        retry_count, error_message, error_stage, is_locked, created_at, updated_at
      ) VALUES (?, ?, NULL, NULL, 0, NULL, NULL, 0, ?, ?)`,
      evaluationId,
      initialState,
      now,
      now
    );

    return this.getState(evaluationId)!;
  }

  static updateState(
    evaluationId: string,
    updates: Partial<Omit<EvaluationStateRecord, 'evaluationId' | 'createdAt'>>
  ): EvaluationStateRecord | null {
    const existing = this.getState(evaluationId);
    if (!existing) return null;

    const currentState = updates.currentState !== undefined ? updates.currentState : existing.currentState;
    const previousState = updates.previousState !== undefined ? updates.previousState : existing.previousState;
    const latestCheckpoint = updates.latestCheckpoint !== undefined ? updates.latestCheckpoint : existing.latestCheckpoint;
    const retryCount = updates.retryCount !== undefined ? updates.retryCount : existing.retryCount;
    const errorMessage = updates.errorMessage !== undefined ? updates.errorMessage : existing.errorMessage;
    const errorStage = updates.errorStage !== undefined ? updates.errorStage : existing.errorStage;
    const isLocked = updates.isLocked !== undefined ? (updates.isLocked ? 1 : 0) : (existing.isLocked ? 1 : 0);
    const now = new Date().toISOString();

    db.run(
      `UPDATE evaluation_states SET
        current_state = ?,
        previous_state = ?,
        latest_checkpoint = ?,
        retry_count = ?,
        error_message = ?,
        error_stage = ?,
        is_locked = ?,
        updated_at = ?
      WHERE evaluation_id = ?`,
      currentState,
      previousState || null,
      latestCheckpoint || null,
      retryCount,
      errorMessage || null,
      errorStage || null,
      isLocked,
      now,
      evaluationId
    );

    return this.getState(evaluationId);
  }

  // ==========================================
  // CHECKPOINTS
  // ==========================================

  static saveCheckpoint(
    evaluationId: string,
    checkpointName: EvaluationCheckpoint,
    stageName: string,
    dataHash: string,
    snapshotData?: any
  ): EvaluationCheckpointRecord {
    const id = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const snapshotJson = snapshotData ? JSON.stringify(snapshotData) : null;

    db.run(
      `INSERT INTO evaluation_checkpoints (
        id, evaluation_id, checkpoint_name, stage_name, data_hash, snapshot_data_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      evaluationId,
      checkpointName,
      stageName,
      dataHash,
      snapshotJson,
      now
    );

    // Update state table latest checkpoint
    this.updateState(evaluationId, { latestCheckpoint: checkpointName });

    return {
      id,
      evaluationId,
      checkpointName,
      stageName,
      dataHash,
      snapshotDataJson: snapshotJson || undefined,
      createdAt: now
    };
  }

  static getCheckpoints(evaluationId: string): EvaluationCheckpointRecord[] {
    const rows = db.all<any>(
      `SELECT * FROM evaluation_checkpoints WHERE evaluation_id = ? ORDER BY created_at ASC`,
      evaluationId
    );

    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      checkpointName: r.checkpoint_name as EvaluationCheckpoint,
      stageName: r.stage_name,
      dataHash: r.data_hash,
      snapshotDataJson: r.snapshot_data_json || undefined,
      createdAt: r.created_at
    }));
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  static logAudit(
    event: string,
    entityType: string,
    entityId: string,
    actorId: string = 'system',
    actorRole: string = 'SYSTEM',
    metadata?: Record<string, any>,
    ipAddress?: string
  ): AuditEventRecord {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const metaJson = metadata ? JSON.stringify(metadata) : null;

    db.run(
      `INSERT INTO audit_logs (
        id, actor_id, actor_role, event, entity_type, entity_id, metadata_json, ip_address, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      actorId,
      actorRole,
      event,
      entityType,
      entityId,
      metaJson,
      ipAddress || null,
      now
    );

    return {
      id,
      actorId,
      actorRole,
      event,
      entityType,
      entityId,
      metadataJson: metaJson || undefined,
      ipAddress,
      timestamp: now
    };
  }

  static getAuditLogs(limit: number = 50, entityId?: string): AuditEventRecord[] {
    const query = entityId
      ? `SELECT * FROM audit_logs WHERE entity_id = ? ORDER BY timestamp DESC LIMIT ?`
      : `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?`;
    
    const rows = entityId
      ? db.all<any>(query, entityId, limit)
      : db.all<any>(query, limit);

    return rows.map(r => ({
      id: r.id,
      actorId: r.actor_id,
      actorRole: r.actor_role,
      event: r.event,
      entityType: r.entity_type,
      entityId: r.entity_id,
      metadataJson: r.metadata_json || undefined,
      ipAddress: r.ip_address || undefined,
      timestamp: r.timestamp
    }));
  }

  // ==========================================
  // USAGE & COST CONTROL
  // ==========================================

  static logUsage(
    evaluationId: string,
    provider: string,
    operation: string,
    tokensInput: number,
    tokensOutput: number,
    durationMs: number,
    estimatedCost: number,
    status: string = 'SUCCESS'
  ): UsageRecord {
    const id = `use_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO usage_records (
        id, evaluation_id, provider, operation, tokens_input, tokens_output, duration_ms, estimated_cost, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      evaluationId,
      provider,
      operation,
      tokensInput,
      tokensOutput,
      durationMs,
      estimatedCost,
      status,
      now
    );

    return {
      id,
      evaluationId,
      provider,
      operation,
      tokensInput,
      tokensOutput,
      durationMs,
      estimatedCost,
      status,
      createdAt: now
    };
  }

  static getUsageSummary(evaluationId?: string): {
    totalTokens: number;
    totalCost: number;
    totalOperations: number;
    byProvider: Record<string, { tokens: number; cost: number; count: number }>;
  } {
    const query = evaluationId
      ? `SELECT * FROM usage_records WHERE evaluation_id = ?`
      : `SELECT * FROM usage_records`;
    
    const rows = evaluationId ? db.all<any>(query, evaluationId) : db.all<any>(query);

    let totalTokens = 0;
    let totalCost = 0;
    const byProvider: Record<string, { tokens: number; cost: number; count: number }> = {};

    for (const r of rows) {
      const tokens = (r.tokens_input || 0) + (r.tokens_output || 0);
      const cost = r.estimated_cost || 0;
      totalTokens += tokens;
      totalCost += cost;

      if (!byProvider[r.provider]) {
        byProvider[r.provider] = { tokens: 0, cost: 0, count: 0 };
      }
      byProvider[r.provider].tokens += tokens;
      byProvider[r.provider].cost += cost;
      byProvider[r.provider].count += 1;
    }

    return {
      totalTokens,
      totalCost: Number(totalCost.toFixed(4)),
      totalOperations: rows.length,
      byProvider
    };
  }

  // ==========================================
  // EVIDENCE REQUESTS (HUMAN REVIEW)
  // ==========================================

  static createEvidenceRequest(
    evaluationId: string,
    title: string,
    description: string,
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH',
    requestedBy: string = 'Lead Reviewer'
  ): EvidenceRequestRecord {
    const id = `evreq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO evidence_requests (
        id, evaluation_id, title, description, priority, requested_by, status, response_notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'OPEN', NULL, ?, ?)`,
      id,
      evaluationId,
      title,
      description,
      priority,
      requestedBy,
      now,
      now
    );

    return {
      id,
      evaluationId,
      title,
      description,
      priority,
      requestedBy,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now
    };
  }

  static getEvidenceRequests(evaluationId: string): EvidenceRequestRecord[] {
    const rows = db.all<any>(
      `SELECT * FROM evidence_requests WHERE evaluation_id = ? ORDER BY created_at DESC`,
      evaluationId
    );

    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      requestedBy: r.requested_by,
      status: r.status,
      responseNotes: r.response_notes || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  static updateEvidenceRequest(
    id: string,
    status: 'OPEN' | 'SUBMITTED' | 'REVIEWED' | 'CLOSED',
    responseNotes?: string
  ): EvidenceRequestRecord | null {
    const now = new Date().toISOString();
    db.run(
      `UPDATE evidence_requests SET status = ?, response_notes = ?, updated_at = ? WHERE id = ?`,
      status,
      responseNotes || null,
      now,
      id
    );

    const row = db.get<any>(`SELECT * FROM evidence_requests WHERE id = ?`, id);
    if (!row) return null;

    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      requestedBy: row.requested_by,
      status: row.status,
      responseNotes: row.response_notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ==========================================
  // EVALUATION REVISIONS
  // ==========================================

  static createRevision(
    evaluationId: string,
    revisionNumber: number,
    previousScore: number,
    newScore: number,
    changedEvidenceCount: number,
    impactedModules: string[],
    reason: string,
    createdBy: string = 'Reviewer'
  ): EvaluationRevisionRecord {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const impactedJson = JSON.stringify(impactedModules);

    db.run(
      `INSERT INTO evaluation_revisions (
        id, evaluation_id, revision_number, previous_score, new_score,
        changed_evidence_count, impacted_modules_json, reason, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      evaluationId,
      revisionNumber,
      previousScore,
      newScore,
      changedEvidenceCount,
      impactedJson,
      reason,
      createdBy,
      now
    );

    return {
      id,
      evaluationId,
      revisionNumber,
      previousScore,
      newScore,
      changedEvidenceCount,
      impactedModulesJson: impactedJson,
      reason,
      createdBy,
      createdAt: now
    };
  }

  static getRevisions(evaluationId: string): EvaluationRevisionRecord[] {
    const rows = db.all<any>(
      `SELECT * FROM evaluation_revisions WHERE evaluation_id = ? ORDER BY revision_number ASC`,
      evaluationId
    );

    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      revisionNumber: r.revision_number,
      previousScore: r.previous_score,
      newScore: r.new_score,
      changedEvidenceCount: r.changed_evidence_count,
      impactedModulesJson: r.impacted_modules_json,
      reason: r.reason,
      createdBy: r.created_by,
      createdAt: r.created_at
    }));
  }

  // ==========================================
  // FEATURE FLAGS
  // ==========================================

  static getFeatureFlags(): FeatureFlagRecord[] {
    const rows = db.all<any>(`SELECT * FROM feature_flags ORDER BY key ASC`);
    return rows.map(r => ({
      key: r.key,
      name: r.name,
      enabled: Boolean(r.enabled),
      description: r.description || undefined,
      updatedAt: r.updated_at
    }));
  }

  static setFeatureFlag(key: string, enabled: boolean): FeatureFlagRecord | null {
    const now = new Date().toISOString();
    db.run(
      `UPDATE feature_flags SET enabled = ?, updated_at = ? WHERE key = ?`,
      enabled ? 1 : 0,
      now,
      key
    );

    const row = db.get<any>(`SELECT * FROM feature_flags WHERE key = ?`, key);
    if (!row) return null;

    return {
      key: row.key,
      name: row.name,
      enabled: Boolean(row.enabled),
      description: row.description || undefined,
      updatedAt: row.updated_at
    };
  }
}

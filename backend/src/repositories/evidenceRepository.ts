import { db } from '../db/database';
import type { Evidence, EvidenceType } from '../models/evidence';

export class EvidenceRepository {
  static create(evidence: Evidence): Evidence {
    db.run(
      `INSERT OR REPLACE INTO evidence (
        id, evaluation_id, type, source, source_title, source_url, location, content, confidence, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      evidence.id,
      evidence.evaluationId,
      evidence.type,
      evidence.source,
      evidence.sourceTitle,
      evidence.sourceUrl || null,
      evidence.location || null,
      evidence.content,
      evidence.confidence,
      evidence.createdAt || new Date().toISOString()
    );

    return this.findById(evidence.id)!;
  }

  static createBatch(items: Evidence[]): void {
    db.transaction(() => {
      for (const item of items) {
        this.create(item);
      }
    });
  }

  static findById(id: string): Evidence | undefined {
    const row = db.get<any>(`SELECT * FROM evidence WHERE id = ?`, id);
    if (!row) return undefined;

    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      type: row.type as EvidenceType,
      source: row.source,
      sourceTitle: row.source_title,
      sourceUrl: row.source_url || undefined,
      location: row.location || undefined,
      content: row.content,
      confidence: row.confidence,
      createdAt: row.created_at,
    };
  }

  static findByEvaluationId(evaluationId: string): Evidence[] {
    const rows = db.all<any>(`SELECT * FROM evidence WHERE evaluation_id = ? ORDER BY created_at ASC`, evaluationId);
    return rows.map(row => ({
      id: row.id,
      evaluationId: row.evaluation_id,
      type: row.type as EvidenceType,
      source: row.source,
      sourceTitle: row.source_title,
      sourceUrl: row.source_url || undefined,
      location: row.location || undefined,
      content: row.content,
      confidence: row.confidence,
      createdAt: row.created_at,
    }));
  }

  static findByIds(ids: string[]): Evidence[] {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const rows = db.all<any>(`SELECT * FROM evidence WHERE id IN (${placeholders})`, ...ids);
    return rows.map(row => ({
      id: row.id,
      evaluationId: row.evaluation_id,
      type: row.type as EvidenceType,
      source: row.source,
      sourceTitle: row.source_title,
      sourceUrl: row.source_url || undefined,
      location: row.location || undefined,
      content: row.content,
      confidence: row.confidence,
      createdAt: row.created_at,
    }));
  }

  static countByEvaluationId(evaluationId: string): number {
    const res = db.get<{ count: number }>(`SELECT COUNT(*) as count FROM evidence WHERE evaluation_id = ?`, evaluationId);
    return res?.count || 0;
  }
}

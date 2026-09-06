import { db } from '../db/database';
import type { ResearchSource, ResearchFinding, ResearchSourceType } from '../models/research';

export class ResearchRepository {
  static createSource(source: ResearchSource): ResearchSource {
    db.run(
      `INSERT INTO research_sources (
        id, evaluation_id, source_type, title, url, authors_json, publication_date,
        authority_score, relevance_score, directness_score, overall_rank, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      source.id,
      source.evaluationId,
      source.sourceType,
      source.title,
      source.url,
      JSON.stringify(source.authors || []),
      source.publicationDate || null,
      source.authorityScore,
      source.relevanceScore,
      source.directnessScore,
      source.overallRank,
      source.metadata ? JSON.stringify(source.metadata) : null,
      source.createdAt || new Date().toISOString()
    );

    return this.findSourceById(source.id)!;
  }

  static findSourceById(id: string): ResearchSource | undefined {
    const row = db.get<any>(`SELECT * FROM research_sources WHERE id = ?`, id);
    if (!row) return undefined;
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      sourceType: row.source_type as ResearchSourceType,
      title: row.title,
      url: row.url,
      authors: row.authors_json ? JSON.parse(row.authors_json) : [],
      publicationDate: row.publication_date || undefined,
      authorityScore: row.authority_score,
      relevanceScore: row.relevance_score,
      directnessScore: row.directness_score,
      overallRank: row.overall_rank,
      metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
      createdAt: row.created_at,
    };
  }

  static findSourcesByEvaluationId(evaluationId: string): ResearchSource[] {
    const rows = db.all<any>(
      `SELECT * FROM research_sources WHERE evaluation_id = ? ORDER BY overall_rank ASC`,
      evaluationId
    );
    return rows.map(row => ({
      id: row.id,
      evaluationId: row.evaluation_id,
      sourceType: row.source_type as ResearchSourceType,
      title: row.title,
      url: row.url,
      authors: row.authors_json ? JSON.parse(row.authors_json) : [],
      publicationDate: row.publication_date || undefined,
      authorityScore: row.authority_score,
      relevanceScore: row.relevance_score,
      directnessScore: row.directness_score,
      overallRank: row.overall_rank,
      metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
      createdAt: row.created_at,
    }));
  }

  static createFinding(finding: ResearchFinding): ResearchFinding {
    db.run(
      `INSERT INTO research_findings (
        id, source_id, evaluation_id, summary, key_claims_matched_json,
        novelty_aspects_json, confidence, evidence_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      finding.id,
      finding.sourceId,
      finding.evaluationId,
      finding.summary,
      JSON.stringify(finding.keyClaimsMatched || []),
      JSON.stringify(finding.noveltyAspectsHighlighted || []),
      finding.confidence,
      finding.evidenceId || null,
      finding.createdAt || new Date().toISOString()
    );

    return this.findFindingById(finding.id)!;
  }

  static findFindingById(id: string): ResearchFinding | undefined {
    const row = db.get<any>(`SELECT * FROM research_findings WHERE id = ?`, id);
    if (!row) return undefined;
    return {
      id: row.id,
      sourceId: row.source_id,
      evaluationId: row.evaluation_id,
      summary: row.summary,
      keyClaimsMatched: JSON.parse(row.key_claims_matched_json),
      noveltyAspectsHighlighted: JSON.parse(row.novelty_aspects_json),
      confidence: row.confidence,
      evidenceId: row.evidence_id || undefined,
      createdAt: row.created_at,
    };
  }

  static findFindingsByEvaluationId(evaluationId: string): ResearchFinding[] {
    const rows = db.all<any>(`SELECT * FROM research_findings WHERE evaluation_id = ?`, evaluationId);
    return rows.map(row => ({
      id: row.id,
      sourceId: row.source_id,
      evaluationId: row.evaluation_id,
      summary: row.summary,
      keyClaimsMatched: JSON.parse(row.key_claims_matched_json),
      noveltyAspectsHighlighted: JSON.parse(row.novelty_aspects_json),
      confidence: row.confidence,
      evidenceId: row.evidence_id || undefined,
      createdAt: row.created_at,
    }));
  }
}

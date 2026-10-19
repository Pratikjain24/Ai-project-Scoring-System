import { db } from '../db/database';
import type {
  Document,
  DocumentPage,
  DocumentImage,
  DocumentTable,
  DocumentArchitecture,
  EvidenceGap,
  DocumentContradiction,
  DocumentStatus,
} from '../models/document';

export class DocumentRepository {
  // --- Documents ---

  static createDocument(doc: Omit<Document, 'createdAt' | 'updatedAt'>): Document {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO documents (
        id, project_id, evaluation_id, file_name, mime_type, size_bytes,
        page_count, status, document_quality_score, missing_sections_json, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      doc.id,
      doc.projectId,
      doc.evaluationId || null,
      doc.fileName,
      doc.mimeType,
      doc.sizeBytes,
      doc.pageCount || 0,
      doc.status || 'UPLOADED',
      doc.documentQualityScore || null,
      doc.missingSections ? JSON.stringify(doc.missingSections) : null,
      doc.metadata ? JSON.stringify(doc.metadata) : null,
      now,
      now
    );

    return this.findDocumentById(doc.id)!;
  }

  static findDocumentById(id: string): Document | undefined {
    const row = db.get<any>(`SELECT * FROM documents WHERE id = ?`, id);
    if (!row) return undefined;

    return {
      id: row.id,
      projectId: row.project_id,
      evaluationId: row.evaluation_id || undefined,
      fileName: row.file_name,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      pageCount: row.page_count,
      status: row.status as DocumentStatus,
      documentQualityScore: row.document_quality_score !== null ? row.document_quality_score : undefined,
      missingSections: row.missing_sections_json ? JSON.parse(row.missing_sections_json) : undefined,
      metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static findByEvaluationId(evaluationId: string): Document[] {
    return this.findDocumentsByEvaluationId(evaluationId);
  }

  static findDocumentsByEvaluationId(evaluationId: string): Document[] {
    const rows = db.all<any>(`SELECT * FROM documents WHERE evaluation_id = ? ORDER BY created_at ASC`, evaluationId);
    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      evaluationId: row.evaluation_id || undefined,
      fileName: row.file_name,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      pageCount: row.page_count,
      status: row.status as DocumentStatus,
      documentQualityScore: row.document_quality_score !== null ? row.document_quality_score : undefined,
      missingSections: row.missing_sections_json ? JSON.parse(row.missing_sections_json) : undefined,
      metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static findDocumentsByProjectId(projectId: string): Document[] {
    const rows = db.all<any>(`SELECT * FROM documents WHERE project_id = ? ORDER BY created_at ASC`, projectId);
    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      evaluationId: row.evaluation_id || undefined,
      fileName: row.file_name,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      pageCount: row.page_count,
      status: row.status as DocumentStatus,
      documentQualityScore: row.document_quality_score !== null ? row.document_quality_score : undefined,
      missingSections: row.missing_sections_json ? JSON.parse(row.missing_sections_json) : undefined,
      metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static updateDocumentStatus(id: string, status: DocumentStatus, qualityScore?: number, missingSections?: string[]): void {
    const now = new Date().toISOString();
    db.run(
      `UPDATE documents SET status = ?, document_quality_score = COALESCE(?, document_quality_score), missing_sections_json = COALESCE(?, missing_sections_json), updated_at = ? WHERE id = ?`,
      status,
      qualityScore !== undefined ? qualityScore : null,
      missingSections ? JSON.stringify(missingSections) : null,
      now,
      id
    );
  }

  static updateDocumentPageCountAndMetadata(id: string, pageCount: number, metadata?: Record<string, any>): void {
    const now = new Date().toISOString();
    db.run(
      `UPDATE documents SET page_count = ?, metadata_json = COALESCE(?, metadata_json), updated_at = ? WHERE id = ?`,
      pageCount,
      metadata ? JSON.stringify(metadata) : null,
      now,
      id
    );
  }

  // --- Pages / Slides ---

  static createPage(page: Omit<DocumentPage, 'createdAt'>): DocumentPage {
    const now = new Date().toISOString();
    db.run(
      `INSERT OR REPLACE INTO document_pages (id, document_id, page_number, title, text, detected_topics_json, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      page.id,
      page.documentId,
      page.pageNumber,
      page.title || null,
      page.text,
      JSON.stringify(page.detectedTopics || []),
      page.confidence,
      now
    );
    return { ...page, createdAt: now };
  }

  static findPagesByDocumentId(documentId: string): DocumentPage[] {
    const rows = db.all<any>(`SELECT * FROM document_pages WHERE document_id = ? ORDER BY page_number ASC`, documentId);
    return rows.map(r => ({
      id: r.id,
      documentId: r.document_id,
      pageNumber: r.page_number,
      title: r.title || undefined,
      text: r.text,
      detectedTopics: JSON.parse(r.detected_topics_json || '[]'),
      confidence: r.confidence,
      createdAt: r.created_at,
    }));
  }

  // --- Images / Diagrams ---

  static createImage(img: Omit<DocumentImage, 'createdAt'>): DocumentImage {
    const now = new Date().toISOString();
    db.run(
      `INSERT OR REPLACE INTO document_images (id, document_id, page_id, page_number, type, caption, identification_state, details_json, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      img.id,
      img.documentId,
      img.pageId || null,
      img.pageNumber,
      img.type,
      img.caption || null,
      img.identificationState,
      img.details ? JSON.stringify(img.details) : null,
      img.confidence,
      now
    );
    return { ...img, createdAt: now };
  }

  static findImagesByDocumentId(documentId: string): DocumentImage[] {
    const rows = db.all<any>(`SELECT * FROM document_images WHERE document_id = ? ORDER BY page_number ASC`, documentId);
    return rows.map(r => ({
      id: r.id,
      documentId: r.document_id,
      pageId: r.page_id || undefined,
      pageNumber: r.page_number,
      type: r.type,
      caption: r.caption || undefined,
      identificationState: r.identification_state,
      details: r.details_json ? JSON.parse(r.details_json) : undefined,
      confidence: r.confidence,
      createdAt: r.created_at,
    }));
  }

  // --- Tables ---

  static createTable(tbl: Omit<DocumentTable, 'createdAt'>): DocumentTable {
    const now = new Date().toISOString();
    db.run(
      `INSERT OR REPLACE INTO document_tables (id, document_id, page_id, page_number, caption, headers_json, rows_json, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      tbl.id,
      tbl.documentId,
      tbl.pageId || null,
      tbl.pageNumber,
      tbl.caption || null,
      JSON.stringify(tbl.headers),
      JSON.stringify(tbl.rows),
      tbl.confidence,
      now
    );
    return { ...tbl, createdAt: now };
  }

  static findTablesByDocumentId(documentId: string): DocumentTable[] {
    const rows = db.all<any>(`SELECT * FROM document_tables WHERE document_id = ? ORDER BY page_number ASC`, documentId);
    return rows.map(r => ({
      id: r.id,
      documentId: r.document_id,
      pageId: r.page_id || undefined,
      pageNumber: r.page_number,
      caption: r.caption || undefined,
      headers: JSON.parse(r.headers_json),
      rows: JSON.parse(r.rows_json),
      confidence: r.confidence,
      createdAt: r.created_at,
    }));
  }

  // --- Architecture ---

  static saveArchitecture(arch: Omit<DocumentArchitecture, 'createdAt'>): DocumentArchitecture {
    const now = new Date().toISOString();
    db.run(
      `INSERT OR REPLACE INTO document_architecture (id, document_id, evaluation_id, nodes_json, relationships_json, architecture_type, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      arch.id,
      arch.documentId || null,
      arch.evaluationId,
      JSON.stringify(arch.nodes),
      JSON.stringify(arch.relationships),
      arch.architectureType,
      arch.confidence,
      now
    );
    return { ...arch, createdAt: now };
  }

  static findArchitectureByEvaluationId(evaluationId: string): DocumentArchitecture | undefined {
    const row = db.get<any>(`SELECT * FROM document_architecture WHERE evaluation_id = ? ORDER BY created_at DESC LIMIT 1`, evaluationId);
    if (!row) return undefined;
    return {
      id: row.id,
      documentId: row.document_id || undefined,
      evaluationId: row.evaluation_id,
      nodes: JSON.parse(row.nodes_json),
      relationships: JSON.parse(row.relationships_json),
      architectureType: row.architecture_type,
      confidence: row.confidence,
      createdAt: row.created_at,
    };
  }

  // --- Evidence Gaps ---

  static createEvidenceGap(gap: Omit<EvidenceGap, 'createdAt'>): EvidenceGap {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO evidence_gaps (id, evaluation_id, claim_id, claim_text, severity, expected_evidence, available_evidence, missing_elements_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      gap.id,
      gap.evaluationId,
      gap.claimId || null,
      gap.claimText,
      gap.severity,
      gap.expectedEvidence,
      gap.availableEvidence,
      JSON.stringify(gap.missingElements),
      now
    );
    return { ...gap, createdAt: now };
  }

  static findEvidenceGapsByEvaluationId(evaluationId: string): EvidenceGap[] {
    const rows = db.all<any>(`SELECT * FROM evidence_gaps WHERE evaluation_id = ? ORDER BY created_at ASC`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      claimId: r.claim_id || undefined,
      claimText: r.claim_text,
      severity: r.severity,
      expectedEvidence: r.expected_evidence,
      availableEvidence: r.available_evidence,
      missingElements: JSON.parse(r.missing_elements_json),
      createdAt: r.created_at,
    }));
  }

  // --- Contradictions ---

  static createContradiction(c: Omit<DocumentContradiction, 'createdAt'>): DocumentContradiction {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO document_contradictions (id, evaluation_id, claim_a, claim_b, location_a, location_b, difference, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      c.id,
      c.evaluationId,
      c.claimA,
      c.claimB,
      c.locationA,
      c.locationB,
      c.difference,
      c.confidence,
      now
    );
    return { ...c, createdAt: now };
  }

  static findContradictionsByEvaluationId(evaluationId: string): DocumentContradiction[] {
    const rows = db.all<any>(`SELECT * FROM document_contradictions WHERE evaluation_id = ? ORDER BY created_at ASC`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      claimA: r.claim_a,
      claimB: r.claim_b,
      locationA: r.location_a,
      locationB: r.location_b,
      difference: r.difference,
      confidence: r.confidence,
      createdAt: r.created_at,
    }));
  }
}

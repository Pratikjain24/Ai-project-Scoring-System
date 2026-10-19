-- Migration: 0002_document_intelligence_and_ocr
-- Direction: UP
-- Description: Document ingestion, OCR extraction, AST architecture graphs, and layout parsing

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  ocr_applied INTEGER DEFAULT 0,
  parsed_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_architecture (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  nodes_json TEXT NOT NULL,
  relationships_json TEXT NOT NULL,
  architecture_type TEXT NOT NULL CHECK(architecture_type IN ('SOFTWARE', 'HARDWARE', 'HYBRID', 'BIOMEDICAL')),
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_text_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL DEFAULT 1,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_ocr INTEGER DEFAULT 0,
  confidence REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_tables (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  table_index INTEGER NOT NULL,
  headers_json TEXT NOT NULL,
  rows_json TEXT NOT NULL,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_eval ON documents(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_doc_arch_eval ON document_architecture(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_doc ON document_text_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_tables_doc ON document_tables(document_id);

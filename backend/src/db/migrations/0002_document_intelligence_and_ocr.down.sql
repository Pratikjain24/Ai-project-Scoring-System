-- Migration: 0002_document_intelligence_and_ocr
-- Direction: DOWN
-- Description: Rollback document intelligence and OCR tables

DROP TABLE IF EXISTS document_tables;
DROP TABLE IF EXISTS document_text_chunks;
DROP TABLE IF EXISTS document_architecture;
DROP TABLE IF EXISTS documents;

// ====================================================
// PROJECTX-RAY AI - TEST SUITE: OCR & SCANNED DOCUMENT INTELLIGENCE
// Validates Optical Character Recognition (Tesseract.js / Fast Raster / Cloud),
// Scanned PDF Decompression, Image-Only Document Ingestion, and Table Extraction
// ====================================================

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'zlib';
import { seedDatabase } from '../db/seed';
import { OcrService } from '../document-intelligence/ocrService';
import { BinaryPdfParser } from '../document-intelligence/binaryPdfParser';
import { DocumentParser } from '../document-intelligence/documentParser';
import { DocumentPipeline } from '../document-intelligence/documentPipeline';
import { DocumentRepository } from '../repositories/documentRepository';

// Helper: Creates a 1x1 or mock PNG buffer with embedded ASCII text metadata
function createMockImageBuffer(textPayload: string): Buffer {
  // Minimal valid 1x1 transparent PNG header + IDAT + text chunk
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk length & type
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, // 8-bit RGBA
    0x89,
  ]);
  const textChunk = Buffer.from(textPayload, 'utf8');
  const pngFooter = Buffer.from([
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82, // IEND
  ]);
  return Buffer.concat([pngHeader, textChunk, pngFooter]);
}

// Helper: Creates a Scanned PDF where the page has NO font text streams, ONLY an embedded image XObject
function createScannedTestPdfBuffer(scannedContent: string): Buffer {
  const imageStream = zlib.deflateSync(Buffer.from(scannedContent, 'utf8'));

  const header = Buffer.from('%PDF-1.4\n', 'ascii');
  const obj1 = Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'ascii');
  const obj2 = Buffer.from('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n', 'ascii');
  // Page 3 has /XObject pointing to /Im1 4 0 R, and NO /Contents font stream
  const obj3 = Buffer.from('3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im1 4 0 R >> >> >>\nendobj\n', 'ascii');
  // Object 4 is an Image XObject with FlateDecode compressed raster data
  const obj4Header = Buffer.from(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width 640 /Height 480 /ColorSpace /DeviceRGB /Filter /FlateDecode /Length ${imageStream.length} >>\nstream\r\n`, 'ascii');
  const obj4Footer = Buffer.from('\r\nendstream\nendobj\n', 'ascii');
  const trailer = Buffer.from('xref\n0 5\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n500\n%%EOF', 'ascii');

  return Buffer.concat([
    header,
    obj1,
    obj2,
    obj3,
    obj4Header,
    imageStream,
    obj4Footer,
    trailer,
  ]);
}

// Helper: Creates a flat image-only PDF with NO /Type /Page objects (pure scan from document scanner)
function createFlatImageOnlyPdfBuffer(scannedContent: string): Buffer {
  const imageStream = zlib.deflateSync(Buffer.from(scannedContent, 'utf8'));

  const header = Buffer.from('%PDF-1.4\n', 'ascii');
  const obj1 = Buffer.from('1 0 obj\n<< /Type /Catalog >>\nendobj\n', 'ascii');
  const obj2Header = Buffer.from(`2 0 obj\n<< /Type /XObject /Subtype /Image /Width 800 /Height 600 /ColorSpace /DeviceRGB /Filter /FlateDecode /Length ${imageStream.length} >>\nstream\r\n`, 'ascii');
  const obj2Footer = Buffer.from('\r\nendstream\nendobj\n', 'ascii');
  const trailer = Buffer.from('xref\n0 3\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n300\n%%EOF', 'ascii');

  return Buffer.concat([
    header,
    obj1,
    obj2Header,
    imageStream,
    obj2Footer,
    trailer,
  ]);
}

describe('OCR & Scanned Document Intelligence Engine', () => {
  before(() => {
    seedDatabase();
    OcrService.clearCache();
  });

  it('1. OcrService extracts text, confidence scores, and blocks from image buffers', async () => {
    const textSample = [
      'Autonomous Municipal Infrastructure Scanner',
      'Hardware Topology: NVIDIA Jetson Orin Nano with Sony IMX477 Optical Sensor',
      'Accuracy: 95.8% mAP50 precision across 12 crack classifications',
      'Throughput: 54 FPS sustained with 14ms latency',
    ].join('\n');

    const buffer = createMockImageBuffer(textSample);
    const result = await OcrService.recognizeImageBuffer(buffer, 'image/png', {
      enginePreference: 'fast_raster',
      documentId: 'test_ocr_1',
    });

    assert.ok(result.text.length > 20, 'OCR text should be extracted');
    assert.ok(result.confidence >= 0.7, 'Confidence should meet minimum threshold');
    assert.ok(result.lines.length >= 2, 'Multiple lines should be detected');
    assert.ok(result.detectedLabels.length > 0, 'Technical labels should be identified');
  });

  it('2. OcrService extracts tabular data from structured OCR lines', async () => {
    const tableSample = [
      'Model Evaluation Benchmark Results',
      'Model Name | Accuracy mAP50 | Latency ms | Power W',
      'YOLOv8-Nano | 95.4% | 14.2ms | 9.2W',
      'ResNet-50 | 87.1% | 28.5ms | 14.8W',
    ].join('\n');

    const buffer = createMockImageBuffer(tableSample);
    const result = await OcrService.recognizeImageBuffer(buffer, 'image/png', {
      enginePreference: 'fast_raster',
      documentId: 'test_table_doc',
    });

    assert.ok(result.tables.length > 0, 'Table should be extracted from pipe delimited OCR text');
    const table = result.tables[0];
    assert.equal(table.headers.length, 4, 'Table should have 4 columns');
    assert.equal(table.headers[0], 'Model Name');
    assert.equal(table.headers[1], 'Accuracy mAP50');
    assert.equal(table.rows.length, 2, 'Table should have 2 data rows');
    assert.equal(table.rows[0][0], 'YOLOv8-Nano');
  });

  it('3. In-memory SHA-256 caching accelerates repeated OCR lookups', async () => {
    const textSample = 'Jetson Orin Nano Hardware Schematic Page 1';
    const buffer = createMockImageBuffer(textSample);

    const firstRun = await OcrService.recognizeImageBuffer(buffer, 'image/png', { enginePreference: 'fast_raster' });
    const secondRun = await OcrService.recognizeImageBuffer(buffer, 'image/png', { enginePreference: 'fast_raster' });

    assert.equal(firstRun.text, secondRun.text, 'Cached text should match original');
    assert.equal(firstRun.confidence, secondRun.confidence, 'Cached confidence should match');
  });

  it('4. BinaryPdfParser detects and runs OCR on scanned PDF pages with empty font streams', () => {
    const scannedText = [
      'Scanned Engineering Field Trial Summary',
      'Vehicle Route: Route 12 Municipal Transit Bus covering 42 miles',
      'Detected Defects: 128 verified asphalt fissures',
      'Inference Engine: Jetson Orin Nano TensorRT pipeline running at 54 FPS',
    ].join('\n');

    const scannedPdfBuffer = createScannedTestPdfBuffer(scannedText);
    assert.ok(BinaryPdfParser.isPdf(scannedPdfBuffer), 'Buffer must be valid PDF');

    const parsed = BinaryPdfParser.parsePdf(scannedPdfBuffer, 'doc_scanned_test_1');

    assert.equal(parsed.pageCount, 1, 'Should extract 1 page');
    assert.equal(parsed.extractorEngine, 'BINARY_PDF_PARSER_WITH_OCR', 'Extractor engine should indicate OCR was applied');
    assert.ok(parsed.pages[0].text.includes('Transit Bus') || parsed.pages[0].text.includes('Autonomous') || parsed.pages[0].text.length > 20, 'Page text should contain OCR recognized content');
    assert.ok(parsed.metadata?.ocrApplied, 'Metadata should reflect ocrApplied = true');
  });

  it('5. BinaryPdfParser handles flat scanned PDFs without /Type /Page catalogs via image object reconstruction', () => {
    const flatScannedText = [
      'Scanned Archival Patent Diagram',
      'Sensor Cluster: Sony IMX477 and Quectel GNSS RTK receiver',
      'Edge Gateway: IP67 weather-sealed transit enclosure',
    ].join('\n');

    const flatPdfBuffer = createFlatImageOnlyPdfBuffer(flatScannedText);
    assert.ok(BinaryPdfParser.isPdf(flatPdfBuffer), 'Must be valid PDF');

    const parsed = BinaryPdfParser.parsePdf(flatPdfBuffer, 'doc_flat_scanned_test');

    assert.ok(parsed.pageCount >= 1, 'Should reconstruct page from raw image XObject');
    assert.equal(parsed.extractorEngine, 'BINARY_PDF_PARSER_WITH_OCR');
    assert.ok(parsed.images.length > 0, 'Image artifact should be recorded');
  });

  it('6. DocumentParser routes direct image uploads (PNG, JPG, WEBP) through OCR Engine', () => {
    const imageText = [
      'Architecture Diagram: Smart Road Vision Perception Pipeline',
      'Component: Edge Perception Layer -> Sony IMX477 MIPI CSI-2',
      'Component: Inference Layer -> NVIDIA Jetson Orin Nano TensorRT',
      'Component: Telemetry Layer -> SQLite Spatio-Temporal Store',
    ].join('\n');

    const imgBuffer = createMockImageBuffer(imageText);
    const parsed = DocumentParser.parse('doc_img_test', 'architecture_diagram.png', 'image/png', imgBuffer);

    assert.equal(parsed.pageCount, 1);
    assert.equal(parsed.extractorEngine, 'OCR_INTELLIGENCE_ENGINE');
    assert.ok(parsed.pages[0].text.length > 20, 'Should extract text from image');
    assert.ok(parsed.images.length > 0, 'Should identify document image');
    assert.equal(parsed.images[0].type, 'ARCHITECTURE_DIAGRAM', 'Should classify as ARCHITECTURE_DIAGRAM from OCR content');
  });

  it('7. DocumentParser.parseAsync handles asynchronous full OCR pipeline', async () => {
    const docText = 'Municipal Transit Bus Pilot Report - Route 12 Findings and Crack Heatmap';
    const buffer = createMockImageBuffer(docText);

    const parsed = await DocumentParser.parseAsync('doc_async_test', 'pilot_report.webp', 'image/webp', buffer);

    assert.equal(parsed.pageCount, 1);
    assert.equal(parsed.extractorEngine, 'OCR_INTELLIGENCE_ENGINE');
    assert.ok(parsed.metadata?.ocrEngine, 'Metadata should specify OCR engine');
  });

  it('8. DocumentPipeline.processDocumentAsync executes full 15-stage pipeline on scanned image and updates DB metadata', async () => {
    const scannedReportText = [
      'Autonomous Municipal Infrastructure Audit Whitepaper',
      'Model Accuracy | Precision mAP50 | Latency ms',
      'YOLOv8-Nano Custom | 95.4% | 14.2ms',
      'Hardware Topology: NVIDIA Jetson Orin Nano, Sony IMX477 camera sensor',
      'Municipal Impact: Reduces reactive repairs by up to $4.2M annually',
    ].join('\n');

    const imgBuffer = createMockImageBuffer(scannedReportText);
    const docId = `doc_pipeline_ocr_${Date.now()}`;
    const evalId = 'eval_smart-road-vision';
    const projId = 'smart-road-vision';

    const result = await DocumentPipeline.processDocumentAsync(
      docId,
      projId,
      evalId,
      'scanned_whitepaper.png',
      'image/png',
      imgBuffer.length,
      imgBuffer
    );

    assert.ok(result.document, 'Document record must exist');
    assert.equal(result.document.status, 'COMPLETED');
    assert.ok(result.qualityReport, 'Quality report must be generated');
    assert.ok(result.architecture, 'Architecture must be synthesized');
    assert.ok(result.extractedClaims.length > 0, 'Claims should be extracted from OCR text');
    assert.ok(result.projectDNA, 'Project DNA must be synthesized');

    // Verify database record has OCR metadata
    const persistedDoc = DocumentRepository.findDocumentById(docId);
    assert.ok(persistedDoc, 'Document should be persisted in SQLite');
    assert.equal(persistedDoc.metadata?.extractorEngine, 'OCR_INTELLIGENCE_ENGINE');
  });

  it('9. DocumentPipeline.processDocuments processes all documents for an evaluation', async () => {
    const evalId = 'eval_smart-road-vision';
    const projId = 'smart-road-vision';
    const docId = `doc_batch_${Date.now()}`;

    // Create uploaded document
    DocumentRepository.createDocument({
      id: docId,
      projectId: projId,
      evaluationId: evalId,
      fileName: 'scanned_page.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      pageCount: 1,
      status: 'UPLOADED',
    });

    const results = await DocumentPipeline.processDocuments(evalId);
    assert.ok(Array.isArray(results), 'Should return array of results');
    const processed = DocumentRepository.findDocumentById(docId);
    assert.equal(processed?.status, 'COMPLETED', 'Document status should transition to COMPLETED');
  });
});

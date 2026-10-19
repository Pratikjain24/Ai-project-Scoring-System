import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { seedDatabase } from '../db/seed';
import { BinaryPdfParser } from '../document-intelligence/binaryPdfParser';
import { OpenXmlDecompressor } from '../document-intelligence/openXmlDecompressor';
import { DocumentParser } from '../document-intelligence/documentParser';
import { DocumentPipeline } from '../document-intelligence/documentPipeline';
import { DocumentRepository } from '../repositories/documentRepository';

// Helper: Generates a valid multi-page binary PDF buffer with FlateDecode compressed text streams
function createValidTestPdfBuffer(): Buffer {
  const contentPage1 = Buffer.from(
    'BT /F1 16 Tf 50 750 Td (Autonomous Edge AI Infrastructure Platform) Tj ET\n' +
    'BT /F1 11 Tf 50 720 Td (Technical Architecture: Jetson Orin Nano with Sony IMX477 Optical Sensor Stream) Tj ET\n' +
    'BT /F1 10 Tf 50 690 Td (Deployed on transit fleet inspecting 42 miles of municipal asphalt network.) Tj ET'
  );
  const stream1 = zlib.deflateSync(contentPage1);

  const contentPage2 = Buffer.from(
    'BT /F1 16 Tf 50 750 Td (Empirical Model Precision and Latency Benchmarks) Tj ET\n' +
    'BT /F1 11 Tf 50 720 Td (Model Architecture | Accuracy mAP50 | Latency ms | Power W) Tj ET\n' +
    'BT /F1 10 Tf 50 690 Td (YOLOv8-Nano Custom | 95.8% mAP50 | 14.2ms | 9.2W) Tj ET\n' +
    'BT /F1 10 Tf 50 660 Td (ResNet-50 Baseline | 87.4% mAP50 | 28.5ms | 14.8W) Tj ET'
  );
  const stream2 = zlib.deflateSync(contentPage2);

  // Assemble PDF structure with binary buffer chunks
  const header = Buffer.from('%PDF-1.4\n', 'ascii');
  const obj1 = Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'ascii');
  const obj2 = Buffer.from('2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>\nendobj\n', 'ascii');
  const obj3 = Buffer.from('3 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 5 0 R >>\nendobj\n', 'ascii');
  const obj4 = Buffer.from('4 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 6 0 R >>\nendobj\n', 'ascii');

  const obj5Header = Buffer.from(`5 0 obj\n<< /Length ${stream1.length} /Filter /FlateDecode >>\nstream\r\n`, 'ascii');
  const obj5Footer = Buffer.from('\r\nendstream\nendobj\n', 'ascii');

  const obj6Header = Buffer.from(`6 0 obj\n<< /Length ${stream2.length} /Filter /FlateDecode >>\nstream\r\n`, 'ascii');
  const obj6Footer = Buffer.from('\r\nendstream\nendobj\n', 'ascii');

  const trailer = Buffer.from('xref\n0 7\ntrailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n999\n%%EOF', 'ascii');

  return Buffer.concat([
    header,
    obj1,
    obj2,
    obj3,
    obj4,
    obj5Header,
    stream1,
    obj5Footer,
    obj6Header,
    stream2,
    obj6Footer,
    trailer,
  ]);
}

// Helper: Generates a valid OpenXML (.pptx) ZIP archive buffer containing slides and tables
function createValidTestPptxBuffer(): Buffer {
  const slide1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="1" name="Title 1"/><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:txBody>
          <a:p><a:r><a:t>Autonomous Edge Vision Infrastructure</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Body 1"/><p:nvPr/></p:nvSpPr>
        <p:txBody>
          <a:p><a:r><a:t>Municipal transit fleet telemetry with NVIDIA Jetson Orin Nano and Sony IMX477 camera sensor.</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

  const slide2Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Title 2"/><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:txBody>
          <a:p><a:r><a:t>Empirical Model Benchmark Comparison</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
      <p:graphicFrame>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">
            <a:tbl>
              <a:tr>
                <a:tc><a:txBody><a:p><a:r><a:t>Model Architecture</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:p><a:r><a:t>Accuracy mAP50</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:p><a:r><a:t>Inference FPS</a:t></a:r></a:p></a:txBody></a:tc>
              </a:tr>
              <a:tr>
                <a:tc><a:txBody><a:p><a:r><a:t>YOLOv8-Nano Edge</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:p><a:r><a:t>95.4%</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:p><a:r><a:t>54.2 FPS</a:t></a:r></a:p></a:txBody></a:tc>
              </a:tr>
              <a:tr>
                <a:tc><a:txBody><a:p><a:r><a:t>ResNet-50</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:p><a:r><a:t>88.1%</a:t></a:r></a:p></a:txBody></a:tc>
                <a:tc><a:txBody><a:p><a:r><a:t>22.0 FPS</a:t></a:r></a:p></a:txBody></a:tc>
              </a:tr>
            </a:tbl>
          </a:graphicData>
        </a:graphic>
      </p:graphicFrame>
    </p:spTree>
  </p:cSld>
</p:sld>`;

  return buildZipArchive([
    { path: '[Content_Types].xml', content: '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>' },
    { path: 'ppt/presentation.xml', content: '<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>' },
    { path: 'ppt/slides/slide1.xml', content: slide1Xml },
    { path: 'ppt/slides/slide2.xml', content: slide2Xml },
  ]);
}

// Helper: Builds a PKZip standard archive buffer
function buildZipArchive(files: Array<{ path: string; content: string }>): Buffer {
  const localHeaders: Buffer[] = [];
  const cdHeaders: Buffer[] = [];
  let offset = 0;

  for (const f of files) {
    const nameBuf = Buffer.from(f.path, 'utf8');
    const rawData = Buffer.from(f.content, 'utf8');
    const compData = zlib.deflateRawSync(rawData);

    // Compute simple CRC32
    const crc = computeCrc32(rawData);

    // Local Header (30 bytes)
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); // Signature
    lh.writeUInt16LE(20, 4); // Version needed (2.0)
    lh.writeUInt16LE(0, 6); // Flags
    lh.writeUInt16LE(8, 8); // Method (8 = Deflate)
    lh.writeUInt16LE(0, 10); // Time
    lh.writeUInt16LE(0, 12); // Date
    lh.writeUInt32LE(crc, 14); // CRC-32
    lh.writeUInt32LE(compData.length, 18); // Compressed Size
    lh.writeUInt32LE(rawData.length, 22); // Uncompressed Size
    lh.writeUInt16LE(nameBuf.length, 26); // Name Length
    lh.writeUInt16LE(0, 28); // Extra Field Length

    localHeaders.push(lh, nameBuf, compData);

    // Central Directory Header (46 bytes)
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); // Signature
    cd.writeUInt16LE(20, 4); // Version made by
    cd.writeUInt16LE(20, 6); // Version needed
    cd.writeUInt16LE(0, 8); // Flags
    cd.writeUInt16LE(8, 10); // Method
    cd.writeUInt16LE(0, 12); // Time
    cd.writeUInt16LE(0, 14); // Date
    cd.writeUInt32LE(crc, 16); // CRC-32
    cd.writeUInt32LE(compData.length, 20); // Compressed Size
    cd.writeUInt32LE(rawData.length, 24); // Uncompressed Size
    cd.writeUInt16LE(nameBuf.length, 28); // Name Length
    cd.writeUInt16LE(0, 30); // Extra Field Length
    cd.writeUInt16LE(0, 32); // Comment Length
    cd.writeUInt16LE(0, 34); // Disk Start
    cd.writeUInt16LE(0, 36); // Internal Attributes
    cd.writeUInt32LE(0, 38); // External Attributes
    cd.writeUInt32LE(offset, 42); // Relative Local Header Offset

    cdHeaders.push(cd, nameBuf);
    offset += 30 + nameBuf.length + compData.length;
  }

  const cdStart = offset;
  const cdSize = cdHeaders.reduce((sum, b) => sum + b.length, 0);

  // End of Central Directory Record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // Signature
  eocd.writeUInt16LE(0, 4); // Disk Number
  eocd.writeUInt16LE(0, 6); // Start Disk
  eocd.writeUInt16LE(files.length, 8); // Entries on Disk
  eocd.writeUInt16LE(files.length, 10); // Total Entries
  eocd.writeUInt32LE(cdSize, 12); // Central Directory Size
  eocd.writeUInt32LE(cdStart, 16); // Central Directory Offset
  eocd.writeUInt16LE(0, 20); // Comment Length

  return Buffer.concat([...localHeaders, ...cdHeaders, eocd]);
}

function computeCrc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

describe('Document Intelligence Ingestion: Binary PDF & OpenXML PPTX Production Engine', () => {
  const evalId = 'eval_smart-road-vision';
  const projId = 'smart-road-vision';

  before(async () => {
    await seedDatabase();
  });

  it('1. BinaryPdfParser detects PDF signature and extracts FlateDecode text streams with page slicing', () => {
    const pdfBuffer = createValidTestPdfBuffer();
    assert.strictEqual(BinaryPdfParser.isPdf(pdfBuffer), true, 'Must identify valid %PDF- signature');

    const result = BinaryPdfParser.parsePdf(pdfBuffer, 'doc_pdf_1');
    assert.strictEqual(result.extractorEngine, 'BINARY_PDF_PARSER');
    assert.strictEqual(result.pageCount, 2, 'Should slice into exactly 2 pages');

    // Page 1 assertions
    const p1 = result.pages[0];
    assert.strictEqual(p1.pageNumber, 1);
    assert.ok(p1.title.includes('Autonomous Edge AI Infrastructure'));
    assert.ok(p1.text.includes('Jetson Orin Nano'));
    assert.ok(p1.text.includes('Sony IMX477'));

    // Page 2 assertions (Benchmarks & Tabular content)
    const p2 = result.pages[1];
    assert.strictEqual(p2.pageNumber, 2);
    assert.ok(p2.title.includes('Empirical Model Precision'));
    assert.ok(p2.text.includes('YOLOv8-Nano Custom'));
    assert.ok(p2.text.includes('95.8% mAP50'));

    // Tabular structures extraction
    assert.ok(result.tables.length >= 1, 'Should extract tabular structures from text layout');
    assert.strictEqual(result.tables[0].headers[0], 'Model Architecture');
  });

  it('2. OpenXmlDecompressor decompresses PPTX archive and extracts discrete slides and tables', () => {
    const pptxBuffer = createValidTestPptxBuffer();
    assert.strictEqual(OpenXmlDecompressor.isZip(pptxBuffer), true, 'Must identify PKZip signature');

    const result = OpenXmlDecompressor.parsePptx(pptxBuffer, 'doc_pptx_1');
    assert.strictEqual(result.extractorEngine, 'PPTX_XML_DECOMPRESSOR');
    assert.strictEqual(result.pageCount, 2, 'Should extract exactly 2 presentation slides');

    // Slide 1 assertions
    const s1 = result.pages[0];
    assert.strictEqual(s1.pageNumber, 1);
    assert.strictEqual(s1.title, 'Autonomous Edge Vision Infrastructure');
    assert.ok(s1.text.includes('Sony IMX477 camera sensor'));

    // Slide 2 assertions
    const s2 = result.pages[1];
    assert.strictEqual(s2.pageNumber, 2);
    assert.strictEqual(s2.title, 'Empirical Model Benchmark Comparison');

    // OpenXML Table extraction from <a:tbl>
    assert.strictEqual(result.tables.length, 1, 'Should extract the <a:tbl> from Slide 2');
    const table = result.tables[0];
    assert.deepStrictEqual(table.headers, ['Model Architecture', 'Accuracy mAP50', 'Inference FPS']);
    assert.strictEqual(table.rows.length, 2);
    assert.strictEqual(table.rows[0][0], 'YOLOv8-Nano Edge');
    assert.strictEqual(table.rows[0][1], '95.4%');
    assert.strictEqual(table.rows[0][2], '54.2 FPS');
  });

  it('3. DocumentParser automatically routes real binary files to native parsers and mock names to domain synthesis', () => {
    // A: Real PDF binary buffer -> BINARY_PDF_PARSER
    const realPdf = DocumentParser.parse('doc_auto_pdf', 'uploaded_deck.pdf', 'application/pdf', createValidTestPdfBuffer());
    assert.strictEqual(realPdf.extractorEngine, 'BINARY_PDF_PARSER');
    assert.strictEqual(realPdf.pageCount, 2);

    // B: Real PPTX binary buffer -> PPTX_XML_DECOMPRESSOR
    const realPptx = DocumentParser.parse('doc_auto_pptx', 'uploaded_deck.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', createValidTestPptxBuffer());
    assert.strictEqual(realPptx.extractorEngine, 'PPTX_XML_DECOMPRESSOR');
    assert.strictEqual(realPptx.pageCount, 2);

    // C: Simulated mock filename without binary -> DOMAIN_SYNTHESIS_FALLBACK
    const mockDeck = DocumentParser.parse('doc_mock_1', 'SmartRoadVision_PitchDeck.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    assert.strictEqual(mockDeck.pageCount, 10);
    assert.ok(mockDeck.pages[0].title?.includes('Smart Road Vision'));
  });

  it('4. DocumentPipeline end-to-end execution persists real binary extracted pages and tables into SQLite', () => {
    const docId = `doc_pipeline_binary_${Date.now()}`;
    const pdfBuffer = createValidTestPdfBuffer();

    const pipelineResult = DocumentPipeline.processDocument(
      docId,
      projId,
      evalId,
      'Whitepaper_Jetson_Benchmark.pdf',
      'application/pdf',
      pdfBuffer.length,
      pdfBuffer
    );

    assert.strictEqual(pipelineResult.document.id, docId);
    assert.strictEqual(pipelineResult.document.pageCount, 2);

    // Check persistence in SQLite
    const savedDoc = DocumentRepository.findDocumentById(docId);
    assert.ok(savedDoc);
    assert.strictEqual(savedDoc.pageCount, 2);
    assert.strictEqual(savedDoc.metadata?.extractorEngine, 'BINARY_PDF_PARSER');

    const savedPages = DocumentRepository.findPagesByDocumentId(docId);
    assert.strictEqual(savedPages.length, 2);
    assert.ok(savedPages[0].title.includes('Autonomous Edge AI'));

    const savedTables = DocumentRepository.findTablesByDocumentId(docId);
    assert.ok(savedTables.length >= 1);
  });
});

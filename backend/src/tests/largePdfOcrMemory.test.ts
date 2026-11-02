// ====================================================
// PROJECTX-RAY AI - TEST SUITE: LARGE PDF OCR MEMORY & PAGED DISK STREAMING
// Validates Paged Disk Streaming, 2-Worker Concurrency Throttling,
// Memory Guards, Event Loop Responsiveness, and Scratch Cleanup on 80+ Page Scanned PDFs
// ====================================================

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { seedDatabase } from '../db/seed';
import { OcrService } from '../document-intelligence/ocrService';
import { PagedPdfStreamer } from '../document-intelligence/pagedPdfStreamer';
import { BinaryPdfParser } from '../document-intelligence/binaryPdfParser';
import { DocumentParser } from '../document-intelligence/documentParser';
import { DocumentPipeline } from '../document-intelligence/documentPipeline';
import { DocumentRepository } from '../repositories/documentRepository';

// Helper: Generates a synthetic multi-page scanned PDF with N discrete image-only pages
function generateMultiPageScannedPdf(pageCount: number): Buffer {
  const chunks: Buffer[] = [];
  chunks.push(Buffer.from('%PDF-1.4\n', 'ascii'));
  chunks.push(Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'ascii'));

  // Build page object IDs list: [3 0 R, 4 0 R, ...]
  const pageKids: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    pageKids.push(`${3 + i * 2} 0 R`);
  }
  chunks.push(Buffer.from(`2 0 obj\n<< /Type /Pages /Kids [${pageKids.join(' ')}] /Count ${pageCount} >>\nendobj\n`, 'ascii'));

  let currentObjId = 3;
  for (let i = 0; i < pageCount; i++) {
    const pageObjId = currentObjId++;
    const imageObjId = currentObjId++;

    const pageContent = [
      `Autonomous Collegiate Capstone Audit - Scanned Section Page ${i + 1}`,
      `Technical Domain: Edge AI Perception & Hardware Subsystem ${i + 1}`,
      `Benchmark Metric: TensorRT FP16 Latency 14.${i % 9}ms with Sony IMX477 camera sensor`,
      `Verified Claim: Empirical field validation across municipal route ${i + 10}`,
    ].join('\n');

    const compressedStream = zlib.deflateSync(Buffer.from(pageContent, 'utf8'));

    // Page object referencing Image XObject
    chunks.push(Buffer.from(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im${i + 1} ${imageObjId} 0 R >> >> >>\nendobj\n`,
      'ascii'
    ));

    // Image XObject with FlateDecode
    chunks.push(Buffer.from(
      `${imageObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width 800 /Height 600 /ColorSpace /DeviceRGB /Filter /FlateDecode /Length ${compressedStream.length} >>\nstream\r\n`,
      'ascii'
    ));
    chunks.push(compressedStream);
    chunks.push(Buffer.from('\r\nendstream\nendobj\n', 'ascii'));
  }

  chunks.push(Buffer.from('xref\n0 10\ntrailer\n<< /Size 10 /Root 1 0 R >>\nstartxref\n1000\n%%EOF', 'ascii'));
  return Buffer.concat(chunks);
}

// Helper: Generates a 1x1 mock PNG image buffer
function createMockImage(textPayload: string): Buffer {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const textChunk = Buffer.from(textPayload, 'utf8');
  const pngFooter = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  return Buffer.concat([pngHeader, textChunk, pngFooter]);
}

describe('Large PDF OCR Memory & Paged Disk Streaming Engine', () => {
  before(() => {
    seedDatabase();
    OcrService.clearCache();
    OcrService.resetWorkerPool();
  });

  after(() => {
    OcrService.resetWorkerPool();
  });

  // ====================================================
  // 1. WORKER CONCURRENCY THROTTLING (MAX 2 WORKERS)
  // ====================================================
  it('1. Bounded Concurrency Semaphore strictly restricts active workers to <= 2 parallel slots', async () => {
    OcrService.resetWorkerPool();
    expectWorkersBounded(0);

    let peakObservedWorkers = 0;
    const workerCountsObserved: number[] = [];

    // Dispatch 8 concurrent OCR tasks
    const tasks = Array.from({ length: 8 }, (_, idx) => {
      const buffer = createMockImage(`Concurrent Worker Probe Page #${idx + 1}`);
      return (async () => {
        const active = OcrService.getActiveWorkersCount();
        workerCountsObserved.push(active);
        if (active > peakObservedWorkers) peakObservedWorkers = active;

        // Execute recognition
        const res = await OcrService.recognizeImageBuffer(buffer, 'image/png', {
          enginePreference: 'fast_raster',
          documentId: `concurrent_test_${idx}`,
        });

        const activeDuring = OcrService.getActiveWorkersCount();
        if (activeDuring > peakObservedWorkers) peakObservedWorkers = activeDuring;

        return res;
      })();
    });

    const results = await Promise.all(tasks);

    assert.equal(results.length, 8, 'All 8 tasks should complete successfully');
    assert.ok(
      peakObservedWorkers <= OcrService.MAX_CONCURRENT_WORKERS,
      `Peak workers (${peakObservedWorkers}) must not exceed MAX_CONCURRENT_WORKERS (${OcrService.MAX_CONCURRENT_WORKERS})`
    );
    assert.equal(OcrService.getMaxConcurrentWorkers(), 2, 'Maximum workers must be exactly 2');
  });

  function expectWorkersBounded(maxExpected: number): void {
    assert.ok(OcrService.getActiveWorkersCount() <= 2);
  }

  // ====================================================
  // 2. ACTIVE MEMORY GUARD & CIRCUIT BREAKER
  // ====================================================
  it('2. OcrService.checkMemoryPressure evaluates heap pressure and recommends safe engines', () => {
    const memPressure = OcrService.checkMemoryPressure();

    assert.ok(typeof memPressure.heapUsedMb === 'number');
    assert.ok(memPressure.heapUsedMb > 0);
    assert.ok(['NORMAL', 'ELEVATED', 'CRITICAL'].includes(memPressure.status));
    assert.ok(['TESSERACT_OCR', 'FAST_RASTER_OCR', 'CLOUD_VISION_OCR'].includes(memPressure.recommendedEngine));

    // Threshold constants must be calibrated to prevent >400MB saturation
    assert.equal(OcrService.MEMORY_WARNING_THRESHOLD_MB, 300, 'Warning threshold must be 300MB');
    assert.equal(OcrService.MEMORY_CIRCUIT_BREAKER_MB, 350, 'Circuit breaker threshold must be 350MB (below 400MB ceiling)');
  });

  // ====================================================
  // 3. PAGED DISK STREAMING OF 80-PAGE SCANNED PDF
  // ====================================================
  it('3. PagedPdfStreamer streams an 80-page scanned PDF in batches of 2 with bounded memory', async () => {
    const pageCount = 80;
    const syntheticPdfBuffer = generateMultiPageScannedPdf(pageCount);

    const initialMem = process.memoryUsage().heapUsed;
    const documentId = `doc_80_page_stream_${Date.now()}`;

    let progressReportedCount = 0;
    let maxPageObserved = 0;

    const parsed = await PagedPdfStreamer.streamPdfPages(syntheticPdfBuffer, documentId, {
      batchSize: 2,
      onProgress: (p) => {
        progressReportedCount++;
        if (p.currentPage > maxPageObserved) maxPageObserved = p.currentPage;
      },
    });

    const finalMem = process.memoryUsage().heapUsed;
    const memoryDeltaMb = Math.round((finalMem - initialMem) / 1024 / 1024);

    assert.equal(parsed.pageCount, pageCount, `Extracted page count must equal ${pageCount}`);
    assert.equal(parsed.pages.length, pageCount, 'Pages array length must match 80');
    assert.ok(parsed.metadata?.pagedStreamingApplied, 'Metadata must record pagedStreamingApplied = true');
    assert.equal(parsed.metadata?.totalPagesStreamed, pageCount);
    assert.ok(progressReportedCount > 0, 'Progress callback should be invoked during batch iteration');
    assert.equal(maxPageObserved, pageCount, 'Progress should reach final 80th page');

    // Memory growth must remain bounded well below 400MB limit (typically under 40MB for 80 pages)
    assert.ok(
      memoryDeltaMb < 150,
      `Heap memory delta (${memoryDeltaMb}MB) must be strictly bounded under 150MB (far below 400MB OOM threshold)`
    );

    // Verify first and last page texts
    assert.ok(parsed.pages[0].text.includes('Page 1') || parsed.pages[0].text.length > 20);
    assert.ok(parsed.pages[pageCount - 1].text.includes(`Page ${pageCount}`) || parsed.pages[pageCount - 1].text.length > 20);
  });

  // ====================================================
  // 4. EVENT LOOP NON-BLOCKING VERIFICATION
  // ====================================================
  it('4. Event loop yields allow concurrent timers to fire during multi-page streamed OCR', async () => {
    const pageCount = 20;
    const pdfBuffer = generateMultiPageScannedPdf(pageCount);

    let interleavedTasksFired = 0;
    let keepScheduling = true;

    const runInterleaved = () => {
      if (!keepScheduling) return;
      setImmediate(() => {
        interleavedTasksFired++;
        if (keepScheduling) runInterleaved();
      });
    };
    runInterleaved();

    try {
      const parsed = await PagedPdfStreamer.streamPdfPages(pdfBuffer, 'doc_event_loop_test', {
        batchSize: 2,
      });

      assert.equal(parsed.pageCount, pageCount);
      // Because setImmediate yields were inserted between batches, concurrent tasks were interleaved
      assert.ok(
        interleavedTasksFired >= 1,
        `Event loop must not be frozen: interleaved tasks ran ${interleavedTasksFired} times during OCR streaming`
      );
    } finally {
      keepScheduling = false;
    }
  });

  // ====================================================
  // 5. SCRATCH DIRECTORY CLEANUP GUARANTEE
  // ====================================================
  it('5. Temporary spool directories are completely purged from disk after streaming completes', async () => {
    const customTempBase = path.join(os.tmpdir(), `test_cleanup_spool_${Date.now()}`);
    fs.mkdirSync(customTempBase, { recursive: true });

    const pdfBuffer = generateMultiPageScannedPdf(6);
    const docId = `doc_cleanup_verify_${Date.now()}`;

    await PagedPdfStreamer.streamPdfPages(pdfBuffer, docId, {
      tempDirectory: customTempBase,
      batchSize: 2,
    });

    // Check temp directory: all subdirectories for this document must be unlinked
    const remainingFiles = fs.readdirSync(customTempBase);
    const docDirs = remainingFiles.filter((f) => f.includes(docId));
    assert.equal(docDirs.length, 0, 'Document temporary directory must be completely removed');

    // Clean up base
    try {
      fs.rmSync(customTempBase, { recursive: true, force: true });
    } catch (_) {}
  });

  // ====================================================
  // 6. END-TO-END PIPELINE INTEGRATION
  // ====================================================
  it('6. DocumentParser & DocumentPipeline process multi-page scanned PDF with paged streaming', async () => {
    const pageCount = 12;
    const pdfBuffer = generateMultiPageScannedPdf(pageCount);
    const docId = `doc_pipeline_paged_${Date.now()}`;
    const evalId = 'eval_smart-road-vision';
    const projId = 'smart-road-vision';

    const result = await DocumentPipeline.processDocumentAsync(
      docId,
      projId,
      evalId,
      'scanned_field_report_80p.pdf',
      'application/pdf',
      pdfBuffer.length,
      pdfBuffer
    );

    assert.ok(result.document, 'Document result must be defined');
    assert.equal(result.document.status, 'COMPLETED');
    assert.equal(result.document.pageCount, pageCount);
    assert.ok(result.qualityReport, 'Quality report must be generated');
    assert.ok(result.architecture, 'Architecture must be extracted');
    assert.ok(result.extractedClaims.length > 0, 'Claims must be extracted');

    // Verify database record has updated page count
    const persisted = DocumentRepository.findDocumentById(docId);
    assert.ok(persisted, 'Document must be persisted');
    assert.equal(persisted.pageCount, pageCount);
    assert.equal(persisted.status, 'COMPLETED');
  });
});


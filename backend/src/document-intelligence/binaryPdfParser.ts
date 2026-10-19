import fs from 'fs';
import zlib from 'zlib';
import type { DocumentPage, DocumentTable, DocumentImage } from '../models/document';
import type { ParsedDocumentUnit } from './documentParser';
import { OcrService } from './ocrService';

export class BinaryPdfParser {
  /**
   * Validates if buffer begins with PDF signature (%PDF-)
   */
  static isPdf(buffer: Buffer): boolean {
    return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }

  /**
   * Parses binary PDF buffer/file, extracting pages, text streams, and tables
   */
  static parsePdf(bufferOrPath: Buffer | string, documentId: string): ParsedDocumentUnit {
    const buffer = typeof bufferOrPath === 'string' ? fs.readFileSync(bufferOrPath) : bufferOrPath;

    if (!this.isPdf(buffer)) {
      throw new Error('Provided buffer or file is not a valid PDF binary');
    }

    const pdfString = buffer.toString('binary');

    // 1. Locate all indirect objects in the PDF: <id> <gen> obj ... endobj
    const objectMap = this.indexPdfObjects(buffer, pdfString);

    // 2. Identify all /Type /Page objects
    const pageObjIds: number[] = [];
    for (const [objId, objData] of objectMap.entries()) {
      if (/\/Type\s*\/Page\b/.test(objData.header) && !/\/Type\s*\/Pages\b/.test(objData.header)) {
        pageObjIds.push(objId);
      }
    }

    // If no /Type /Page found via standard regex, scan streams directly
    const pages: DocumentPage[] = [];
    const tables: DocumentTable[] = [];
    const images: DocumentImage[] = [];

    let hasOcrApplied = false;

    if (pageObjIds.length > 0) {
      // Process discrete pages in sequence
      for (let i = 0; i < pageObjIds.length; i++) {
        const objId = pageObjIds[i];
        const pageObj = objectMap.get(objId)!;
        const pageNumber = i + 1;
        const pageId = `pg_${documentId}_${pageNumber}`;

        // Find /Contents references: /Contents 5 0 R or /Contents [ 5 0 R 6 0 R ]
        const contentObjIds = this.extractContentRefs(pageObj.header);
        const textParts: string[] = [];

        for (const cId of contentObjIds) {
          const contentObj = objectMap.get(cId);
          if (contentObj && contentObj.stream) {
            const decompressed = this.decompressStream(contentObj.stream, contentObj.header);
            const extracted = this.extractTextFromStream(decompressed);
            if (extracted.trim()) {
              textParts.push(extracted);
            }
          }
        }

        // If page object itself contains an inline stream
        if (pageObj.stream) {
          const decompressed = this.decompressStream(pageObj.stream, pageObj.header);
          const extracted = this.extractTextFromStream(decompressed);
          if (extracted.trim()) {
            textParts.push(extracted);
          }
        }

        let pageRawText = textParts.join('\n').trim();
        let pageConfidence = 0.98;

        // Scanned Document Detection: If text stream is empty or minimal, apply OCR to embedded images
        if (!pageRawText || pageRawText.length < 40) {
          const imageBuffers = this.extractPageImageBuffers(pageObj, objectMap);
          if (imageBuffers.length > 0) {
            for (const imgBuf of imageBuffers) {
              const ocrRes = OcrService.recognizeImageBufferSync(imgBuf, 'image/jpeg', { documentId });
              if (ocrRes.text && ocrRes.text.trim().length > 0) {
                pageRawText = ocrRes.text.trim();
                pageConfidence = ocrRes.confidence;
                tables.push(...ocrRes.tables);
                hasOcrApplied = true;
                break;
              }
            }
          }
        }

        if (!pageRawText) {
          pageRawText = `[Page ${pageNumber}]`;
        }

        const lines = pageRawText.split('\n').map((l) => l.trim()).filter(Boolean);
        const title = lines.length > 0 ? (lines[0].length > 70 ? lines[0].substring(0, 67) + '...' : lines[0]) : `Page ${pageNumber}`;

        // Check for tabular structures in page text
        const pageTables = this.extractTablesFromText(pageRawText, documentId, pageId, pageNumber);
        tables.push(...pageTables);

        // Detect embedded XObject images in page dictionary
        if (/\/XObject\b/.test(pageObj.header) && /\/Image\b/.test(pageObj.header)) {
          images.push({
            id: `img_${documentId}_p${pageNumber}`,
            documentId,
            pageId,
            pageNumber,
            type: 'ARCHITECTURE_DIAGRAM',
            caption: `Embedded visual figure from Page ${pageNumber}: ${title}`,
            identificationState: 'DETECTED',
            confidence: 0.93,
            createdAt: new Date().toISOString(),
          });
        }

        pages.push({
          id: pageId,
          documentId,
          pageNumber,
          title,
          text: pageRawText,
          detectedTopics: this.deriveTopics(title, pageRawText),
          confidence: pageConfidence,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      // Check if this is an image-only / scanned PDF containing /Subtype /Image objects
      const imageObjects: Array<{ id: number; stream: Buffer; header: string }> = [];
      for (const [id, obj] of objectMap.entries()) {
        if (obj.stream && (/\/Subtype\s*\/Image\b/.test(obj.header) || /\/Type\s*\/XObject\b/.test(obj.header))) {
          imageObjects.push({ id, stream: obj.stream, header: obj.header });
        }
      }

      if (imageObjects.length > 0) {
        hasOcrApplied = true;
        for (let i = 0; i < imageObjects.length; i++) {
          const imgObj = imageObjects[i];
          const pageNumber = i + 1;
          const pageId = `pg_${documentId}_${pageNumber}`;
          const decompressed = this.extractRawOrDecompressedImage(imgObj.stream, imgObj.header);
          const ocrRes = OcrService.recognizeImageBufferSync(decompressed, 'image/jpeg', { documentId });

          const text = ocrRes.text.trim() || `[Scanned Page ${pageNumber}]`;
          const lines = text.split('\n').filter((l) => l.trim());
          const title = lines.length > 0 ? (lines[0].length > 70 ? lines[0].substring(0, 67) + '...' : lines[0]) : `Scanned Page ${pageNumber}`;

          tables.push(...ocrRes.tables);
          images.push({
            id: `img_${documentId}_p${pageNumber}`,
            documentId,
            pageId,
            pageNumber,
            type: 'ARCHITECTURE_DIAGRAM',
            caption: `Scanned visual artifact on Page ${pageNumber} (${ocrRes.engine})`,
            identificationState: 'DETECTED',
            confidence: ocrRes.confidence,
            createdAt: new Date().toISOString(),
          });

          pages.push({
            id: pageId,
            documentId,
            pageNumber,
            title,
            text,
            detectedTopics: this.deriveTopics(title, text),
            confidence: ocrRes.confidence,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // Fallback: Extract all streams globally across the PDF
        const globalStreamsText: string[] = [];
        for (const [, obj] of objectMap.entries()) {
          if (obj.stream) {
            try {
              const decompressed = this.decompressStream(obj.stream, obj.header);
              const txt = this.extractTextFromStream(decompressed);
              if (txt.trim()) {
                globalStreamsText.push(txt.trim());
              }
            } catch {
              // ignore non-text streams (e.g. raw fonts or bitmaps)
            }
          }
        }

        const unifiedText = globalStreamsText.join('\n\n') || this.extractAsciiStrings(buffer);
        // Slice into discrete pages (every ~350 words)
        const paragraphs = unifiedText.split(/\n\s*\n/).filter((p) => p.trim());
        const chunks: string[] = [];
        let currentChunk: string[] = [];
        let currentLen = 0;

        for (const p of paragraphs) {
          currentChunk.push(p);
          currentLen += p.length;
          if (currentLen > 1200) {
            chunks.push(currentChunk.join('\n\n'));
            currentChunk = [];
            currentLen = 0;
          }
        }
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join('\n\n'));
        }

        if (chunks.length === 0) {
          chunks.push(unifiedText || 'Document content extracted from binary PDF.');
        }

        for (let i = 0; i < chunks.length; i++) {
          const pageNumber = i + 1;
          const pageId = `pg_${documentId}_${pageNumber}`;
          const text = chunks[i];
          const lines = text.split('\n').filter((l) => l.trim());
          const title = lines.length > 0 ? (lines[0].length > 70 ? lines[0].substring(0, 67) + '...' : lines[0]) : `Section ${pageNumber}`;

          pages.push({
            id: pageId,
            documentId,
            pageNumber,
            title,
            text,
            detectedTopics: this.deriveTopics(title, text),
            confidence: 0.96,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    const extractedText = pages.map((p) => `[Page ${p.pageNumber}: ${p.title}]\n${p.text}`).join('\n\n');

    return {
      pages,
      tables,
      images,
      extractedText,
      pageCount: pages.length,
      extractorEngine: hasOcrApplied ? ('BINARY_PDF_PARSER_WITH_OCR' as any) : 'BINARY_PDF_PARSER',
      metadata: {
        ocrApplied: hasOcrApplied,
      },
    };
  }

  /**
   * Asynchronous PDF parsing with complete Tesseract & Cloud Vision OCR pipeline
   */
  static async parsePdfAsync(bufferOrPath: Buffer | string, documentId: string): Promise<ParsedDocumentUnit> {
    const buffer = typeof bufferOrPath === 'string' ? fs.readFileSync(bufferOrPath) : bufferOrPath;

    if (!this.isPdf(buffer)) {
      throw new Error('Provided buffer or file is not a valid PDF binary');
    }

    const pdfString = buffer.toString('binary');
    const objectMap = this.indexPdfObjects(buffer, pdfString);

    const pageObjIds: number[] = [];
    for (const [objId, objData] of objectMap.entries()) {
      if (/\/Type\s*\/Page\b/.test(objData.header) && !/\/Type\s*\/Pages\b/.test(objData.header)) {
        pageObjIds.push(objId);
      }
    }

    const pages: DocumentPage[] = [];
    const tables: DocumentTable[] = [];
    const images: DocumentImage[] = [];
    let hasOcrApplied = false;

    if (pageObjIds.length > 0) {
      for (let i = 0; i < pageObjIds.length; i++) {
        const objId = pageObjIds[i];
        const pageObj = objectMap.get(objId)!;
        const pageNumber = i + 1;
        const pageId = `pg_${documentId}_${pageNumber}`;

        const contentObjIds = this.extractContentRefs(pageObj.header);
        const textParts: string[] = [];

        for (const cId of contentObjIds) {
          const contentObj = objectMap.get(cId);
          if (contentObj && contentObj.stream) {
            const decompressed = this.decompressStream(contentObj.stream, contentObj.header);
            const extracted = this.extractTextFromStream(decompressed);
            if (extracted.trim()) {
              textParts.push(extracted);
            }
          }
        }

        if (pageObj.stream) {
          const decompressed = this.decompressStream(pageObj.stream, pageObj.header);
          const extracted = this.extractTextFromStream(decompressed);
          if (extracted.trim()) {
            textParts.push(extracted);
          }
        }

        let pageRawText = textParts.join('\n').trim();
        let pageConfidence = 0.98;

        if (!pageRawText || pageRawText.length < 40) {
          const imageBuffers = this.extractPageImageBuffers(pageObj, objectMap);
          if (imageBuffers.length > 0) {
            for (const imgBuf of imageBuffers) {
              const ocrRes = await OcrService.recognizeImageBuffer(imgBuf, 'image/jpeg', { documentId });
              if (ocrRes.text && ocrRes.text.trim().length > 0) {
                pageRawText = ocrRes.text.trim();
                pageConfidence = ocrRes.confidence;
                tables.push(...ocrRes.tables);
                hasOcrApplied = true;
                break;
              }
            }
          }
        }

        if (!pageRawText) {
          pageRawText = `[Page ${pageNumber}]`;
        }

        const lines = pageRawText.split('\n').map((l) => l.trim()).filter(Boolean);
        const title = lines.length > 0 ? (lines[0].length > 70 ? lines[0].substring(0, 67) + '...' : lines[0]) : `Page ${pageNumber}`;

        const pageTables = this.extractTablesFromText(pageRawText, documentId, pageId, pageNumber);
        tables.push(...pageTables);

        if (/\/XObject\b/.test(pageObj.header) && /\/Image\b/.test(pageObj.header)) {
          images.push({
            id: `img_${documentId}_p${pageNumber}`,
            documentId,
            pageId,
            pageNumber,
            type: 'ARCHITECTURE_DIAGRAM',
            caption: `Embedded visual figure from Page ${pageNumber}: ${title}`,
            identificationState: 'DETECTED',
            confidence: 0.93,
            createdAt: new Date().toISOString(),
          });
        }

        pages.push({
          id: pageId,
          documentId,
          pageNumber,
          title,
          text: pageRawText,
          detectedTopics: this.deriveTopics(title, pageRawText),
          confidence: pageConfidence,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      const imageObjects: Array<{ id: number; stream: Buffer; header: string }> = [];
      for (const [id, obj] of objectMap.entries()) {
        if (obj.stream && (/\/Subtype\s*\/Image\b/.test(obj.header) || /\/Type\s*\/XObject\b/.test(obj.header))) {
          imageObjects.push({ id, stream: obj.stream, header: obj.header });
        }
      }

      if (imageObjects.length > 0) {
        hasOcrApplied = true;
        for (let i = 0; i < imageObjects.length; i++) {
          const imgObj = imageObjects[i];
          const pageNumber = i + 1;
          const pageId = `pg_${documentId}_${pageNumber}`;
          const decompressed = this.extractRawOrDecompressedImage(imgObj.stream, imgObj.header);
          const ocrRes = await OcrService.recognizeImageBuffer(decompressed, 'image/jpeg', { documentId });

          const text = ocrRes.text.trim() || `[Scanned Page ${pageNumber}]`;
          const lines = text.split('\n').filter((l) => l.trim());
          const title = lines.length > 0 ? (lines[0].length > 70 ? lines[0].substring(0, 67) + '...' : lines[0]) : `Scanned Page ${pageNumber}`;

          tables.push(...ocrRes.tables);
          images.push({
            id: `img_${documentId}_p${pageNumber}`,
            documentId,
            pageId,
            pageNumber,
            type: 'ARCHITECTURE_DIAGRAM',
            caption: `Scanned visual artifact on Page ${pageNumber} (${ocrRes.engine})`,
            identificationState: 'DETECTED',
            confidence: ocrRes.confidence,
            createdAt: new Date().toISOString(),
          });

          pages.push({
            id: pageId,
            documentId,
            pageNumber,
            title,
            text,
            detectedTopics: this.deriveTopics(title, text),
            confidence: ocrRes.confidence,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        return this.parsePdf(buffer, documentId);
      }
    }

    const extractedText = pages.map((p) => `[Page ${p.pageNumber}: ${p.title}]\n${p.text}`).join('\n\n');

    return {
      pages,
      tables,
      images,
      extractedText,
      pageCount: pages.length,
      extractorEngine: hasOcrApplied ? ('BINARY_PDF_PARSER_WITH_OCR' as any) : 'BINARY_PDF_PARSER',
      metadata: {
        ocrApplied: hasOcrApplied,
      },
    };
  }

  /**
   * Resolves image stream buffers embedded in a page object or its /XObject dictionary
   */
  private static extractPageImageBuffers(
    pageObj: { header: string; stream?: Buffer },
    objectMap: Map<number, { header: string; stream?: Buffer }>
  ): Buffer[] {
    const images: Buffer[] = [];

    if (pageObj.stream && /\/Subtype\s*\/Image\b/.test(pageObj.header)) {
      images.push(this.extractRawOrDecompressedImage(pageObj.stream, pageObj.header));
    }

    const xobjRefs: number[] = [];
    const xobjRegex = /\/([A-Za-z0-9_]+)\s+(\d+)\s+\d+\s+R/g;
    let m;
    while ((m = xobjRegex.exec(pageObj.header)) !== null) {
      xobjRefs.push(parseInt(m[2], 10));
    }

    for (const refId of xobjRefs) {
      const obj = objectMap.get(refId);
      if (obj && obj.stream && (/\/Subtype\s*\/Image\b/.test(obj.header) || /\/Type\s*\/XObject\b/.test(obj.header))) {
        images.push(this.extractRawOrDecompressedImage(obj.stream, obj.header));
      }
    }

    return images;
  }

  /**
   * Decompresses or returns raw image buffer based on PDF filter (DCTDecode / FlateDecode)
   */
  private static extractRawOrDecompressedImage(stream: Buffer, header: string): Buffer {
    if (/\/Filter\s*\/DCTDecode\b/.test(header)) {
      return stream; // Direct JPEG
    }
    if (/\/Filter\s*\/FlateDecode\b/.test(header)) {
      try {
        return zlib.inflateSync(stream);
      } catch {
        try {
          return zlib.inflateRawSync(stream);
        } catch {
          return stream;
        }
      }
    }
    return stream;
  }

  /**
   * Indexes indirect objects in the PDF buffer: id, header dictionary, and raw stream buffer
   */
  private static indexPdfObjects(
    buffer: Buffer,
    pdfString: string
  ): Map<number, { header: string; stream?: Buffer }> {
    const objectMap = new Map<number, { header: string; stream?: Buffer }>();
    const objRegex = /(\d+)\s+(\d+)\s+obj\b/g;

    let match;
    const matches: Array<{ id: number; offset: number }> = [];

    while ((match = objRegex.exec(pdfString)) !== null) {
      matches.push({
        id: parseInt(match[1], 10),
        offset: match.index + match[0].length,
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextOffset = i + 1 < matches.length ? matches[i + 1].offset : buffer.length;
      const objSlice = pdfString.substring(current.offset, nextOffset);

      const endobjIdx = objSlice.indexOf('endobj');
      const content = endobjIdx >= 0 ? objSlice.substring(0, endobjIdx) : objSlice;

      const streamMarker = content.indexOf('stream');
      if (streamMarker >= 0) {
        const header = content.substring(0, streamMarker);
        let streamStart = current.offset + streamMarker + 6;
        // Skip CRLF after stream keyword
        if (buffer[streamStart] === 0x0d && buffer[streamStart + 1] === 0x0a) {
          streamStart += 2;
        } else if (buffer[streamStart] === 0x0a || buffer[streamStart] === 0x0d) {
          streamStart += 1;
        }

        const endstreamMarker = content.indexOf('endstream');
        if (endstreamMarker > streamMarker) {
          const streamEnd = current.offset + endstreamMarker;
          const streamBuf = buffer.subarray(streamStart, streamEnd);
          objectMap.set(current.id, { header, stream: streamBuf });
          continue;
        }
      }

      objectMap.set(current.id, { header: content });
    }

    return objectMap;
  }

  /**
   * Resolves object IDs referenced by /Contents
   */
  private static extractContentRefs(header: string): number[] {
    const refs: number[] = [];
    // Single ref: /Contents 5 0 R
    const singleMatch = header.match(/\/Contents\s+(\d+)\s+\d+\s+R/);
    if (singleMatch) {
      refs.push(parseInt(singleMatch[1], 10));
    }

    // Array ref: /Contents [ 5 0 R 6 0 R ]
    const arrayMatch = header.match(/\/Contents\s*\[\s*([^\]]+)\]/);
    if (arrayMatch) {
      const rRegex = /(\d+)\s+\d+\s+R/g;
      let m;
      while ((m = rRegex.exec(arrayMatch[1])) !== null) {
        refs.push(parseInt(m[1], 10));
      }
    }

    return refs;
  }

  /**
   * Decompresses PDF stream using zlib FlateDecode if filtered, or returns raw buffer
   */
  private static decompressStream(stream: Buffer, header: string): Buffer {
    if (/\/Filter\s*\/FlateDecode\b|\/Filter\s*\[\s*\/FlateDecode\s*\]/.test(header)) {
      try {
        return zlib.inflateSync(stream);
      } catch {
        // Try raw inflate without zlib header if standard inflate fails
        try {
          return zlib.inflateRawSync(stream);
        } catch {
          return stream;
        }
      }
    }
    return stream;
  }

  /**
   * Extracts text from decompressed PDF content stream
   */
  private static extractTextFromStream(stream: Buffer): string {
    const content = stream.toString('latin1');
    const textPieces: string[] = [];

    // Extract strings from (text) Tj
    const tjRegex = /\((.*?)\)\s*Tj/g;
    let m;
    while ((m = tjRegex.exec(content)) !== null) {
      textPieces.push(this.decodePdfString(m[1]));
    }

    // Extract strings from [(text1) -10 (text2)] TJ
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    while ((m = arrayTjRegex.exec(content)) !== null) {
      const arrayContent = m[1];
      const strParts = arrayContent.match(/\((.*?)\)/g);
      if (strParts) {
        const joined = strParts
          .map((s) => this.decodePdfString(s.substring(1, s.length - 1)))
          .join('');
        textPieces.push(joined);
      }
    }

    // Extract strings from ' and " operators
    const quoteRegex = /\((.*?)\)\s*['"]/g;
    while ((m = quoteRegex.exec(content)) !== null) {
      textPieces.push(this.decodePdfString(m[1]));
    }

    return textPieces.join('\n').trim();
  }

  /**
   * Decodes PDF string escapes \(, \), \\, \n, \r, \t, and octal codes
   */
  private static decodePdfString(str: string): string {
    return str
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\b/g, '\b')
      .replace(/\\f/g, '\f')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
  }

  /**
   * Detects and extracts tabular data from plain text
   */
  private static extractTablesFromText(
    text: string,
    documentId: string,
    pageId: string,
    pageNumber: number
  ): DocumentTable[] {
    const tables: DocumentTable[] = [];
    const lines = text.split('\n').filter((l) => l.trim());
    const tableCandidates: string[][] = [];

    for (const line of lines) {
      // Line with pipe separators | or tabs or 3+ spaces separating items
      if (line.includes('|')) {
        const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 2) tableCandidates.push(cells);
      } else if (line.includes('\t')) {
        const cells = line.split('\t').map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 2) tableCandidates.push(cells);
      }
    }

    if (tableCandidates.length >= 2) {
      tables.push({
        id: `tbl_${documentId}_p${pageNumber}_1`,
        documentId,
        pageId,
        pageNumber,
        caption: `Table detected on Page ${pageNumber}`,
        headers: tableCandidates[0],
        rows: tableCandidates.slice(1),
        confidence: 0.95,
        createdAt: new Date().toISOString(),
      });
    }

    return tables;
  }

  /**
   * Fallback for PDFs where stream decompression is un-parseable: extracts printable ASCII runs
   */
  private static extractAsciiStrings(buffer: Buffer): string {
    const str = buffer.toString('latin1');
    const matches = str.match(/[A-Za-z0-9 .,:;!?'"()/\-_%$#@\n]{15,}/g);
    return matches ? matches.join('\n') : '';
  }

  /**
   * Derives topics based on page text keywords
   */
  private static deriveTopics(title: string, content: string): string[] {
    const combined = `${title} ${content}`.toLowerCase();
    const topics: string[] = [];

    if (combined.includes('abstract') || combined.includes('overview') || combined.includes('introduction')) {
      topics.push('Overview & Abstract');
    }
    if (combined.includes('architecture') || combined.includes('system') || combined.includes('pipeline')) {
      topics.push('System Architecture');
    }
    if (combined.includes('benchmark') || combined.includes('accuracy') || combined.includes('results')) {
      topics.push('Empirical Benchmark');
    }
    if (combined.includes('cost') || combined.includes('economic') || combined.includes('feasibility')) {
      topics.push('Feasibility & Impact');
    }

    if (topics.length === 0) {
      topics.push('General Findings');
    }

    return Array.from(new Set(topics));
  }
}

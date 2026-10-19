import fs from 'fs';
import zlib from 'zlib';
import type { DocumentPage, DocumentTable, DocumentImage } from '../models/document';
import type { ParsedDocumentUnit } from './documentParser';

export interface ZipEntry {
  path: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  data: Buffer;
}

export class OpenXmlDecompressor {
  /**
   * Checks if buffer starts with PKZip header (PK\x03\x04)
   */
  static isZip(buffer: Buffer): boolean {
    return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  /**
   * Decompresses an OpenXML (.pptx, .docx, .xlsx) ZIP archive into a map of entry paths -> uncompressed Buffer
   */
  static decompressArchive(bufferOrPath: Buffer | string): Map<string, Buffer> {
    const buffer = typeof bufferOrPath === 'string' ? fs.readFileSync(bufferOrPath) : bufferOrPath;
    const entries = new Map<string, Buffer>();

    if (!this.isZip(buffer)) {
      throw new Error('Provided buffer or file is not a valid ZIP/OpenXML archive');
    }

    // Parse Central Directory or Local File Headers
    // Try Central Directory first (standard, handles compressed sizes accurately)
    let cdOffset = this.findCentralDirectoryOffset(buffer);

    if (cdOffset >= 0) {
      let offset = cdOffset;
      while (offset + 46 <= buffer.length) {
        const sig = buffer.readUInt32LE(offset);
        if (sig !== 0x02014b50) break; // Central directory file header signature

        const method = buffer.readUInt16LE(offset + 10);
        const compSize = buffer.readUInt32LE(offset + 20);
        const uncompSize = buffer.readUInt32LE(offset + 24);
        const nameLen = buffer.readUInt16LE(offset + 28);
        const extraLen = buffer.readUInt16LE(offset + 30);
        const commentLen = buffer.readUInt16LE(offset + 32);
        const localHeaderOffset = buffer.readUInt32LE(offset + 42);

        const fileName = buffer.toString('utf8', offset + 46, offset + 46 + nameLen);
        offset += 46 + nameLen + extraLen + commentLen;

        // Read data using local header offset
        if (localHeaderOffset + 30 <= buffer.length) {
          const locNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
          const locExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
          const dataStart = localHeaderOffset + 30 + locNameLen + locExtraLen;
          const compressedData = buffer.subarray(dataStart, dataStart + compSize);

          try {
            if (method === 0) {
              // Stored (no compression)
              entries.set(fileName, compressedData);
            } else if (method === 8) {
              // Deflate
              const decompressed = zlib.inflateRawSync(compressedData);
              entries.set(fileName, decompressed);
            }
          } catch {
            // Ignore un-parseable individual entries
          }
        }
      }
    } else {
      // Fallback: Scan sequential Local File Headers
      let offset = 0;
      while (offset + 30 <= buffer.length) {
        const sig = buffer.readUInt32LE(offset);
        if (sig !== 0x04034b50) break;

        const method = buffer.readUInt16LE(offset + 8);
        const compSize = buffer.readUInt32LE(offset + 18);
        const nameLen = buffer.readUInt16LE(offset + 26);
        const extraLen = buffer.readUInt16LE(offset + 28);

        const fileName = buffer.toString('utf8', offset + 30, offset + 30 + nameLen);
        const dataStart = offset + 30 + nameLen + extraLen;
        const compressedData = buffer.subarray(dataStart, dataStart + compSize);

        try {
          if (method === 0) {
            entries.set(fileName, compressedData);
          } else if (method === 8) {
            const decompressed = zlib.inflateRawSync(compressedData);
            entries.set(fileName, decompressed);
          }
        } catch {
          // ignore corrupted sub-entry
        }

        offset = dataStart + compSize;
      }
    }

    return entries;
  }

  /**
   * Finds the Central Directory offset by scanning for the End of Central Directory Record (EOCD)
   */
  private static findCentralDirectoryOffset(buffer: Buffer): number {
    const eocdSig = 0x06054b50;
    // EOCD is at least 22 bytes, usually within the last 65KB
    const start = Math.max(0, buffer.length - 65557);
    for (let i = buffer.length - 22; i >= start; i--) {
      if (buffer.readUInt32LE(i) === eocdSig) {
        return buffer.readUInt32LE(i + 16);
      }
    }
    return -1;
  }

  /**
   * Decompresses and parses a PowerPoint (.pptx) presentation into discrete slide units
   */
  static parsePptx(bufferOrPath: Buffer | string, documentId: string): ParsedDocumentUnit {
    const entries = this.decompressArchive(bufferOrPath);

    // Locate slide XML files matching ppt/slides/slide{N}.xml
    const slideEntries: Array<{ slideNum: number; path: string; xml: string }> = [];

    for (const [entryPath, content] of entries.entries()) {
      const match = entryPath.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
      if (match) {
        const slideNum = parseInt(match[1], 10);
        slideEntries.push({
          slideNum,
          path: entryPath,
          xml: content.toString('utf8'),
        });
      }
    }

    // Sort slides in natural presentation sequence (Slide 1, Slide 2, ...)
    slideEntries.sort((a, b) => a.slideNum - b.slideNum);

    const pages: DocumentPage[] = [];
    const tables: DocumentTable[] = [];
    const images: DocumentImage[] = [];

    for (let i = 0; i < slideEntries.length; i++) {
      const slide = slideEntries[i];
      const pageNumber = i + 1;
      const pageId = `pg_${documentId}_${pageNumber}`;

      // Extract slide title and text blocks
      const { title, textBlocks, rawText } = this.extractSlideText(slide.xml, pageNumber);

      // Extract structured tables from <a:tbl>
      const slideTables = this.extractSlideTables(slide.xml, documentId, pageId, pageNumber);
      tables.push(...slideTables);

      // Detect visual elements (charts, diagrams, images)
      if (slide.xml.includes('<p:pic') || slide.xml.includes('image') || slide.xml.includes('<c:chart')) {
        images.push({
          id: `img_${documentId}_${pageNumber}`,
          documentId,
          pageId,
          pageNumber,
          type: slide.xml.includes('<c:chart') ? 'CHART' : 'ARCHITECTURE_DIAGRAM',
          caption: `Visual diagram or chart extracted from Slide ${pageNumber}: ${title}`,
          confidence: 0.94,
          createdAt: new Date().toISOString(),
        });
      }

      // Detect semantic topics based on keywords
      const detectedTopics = this.deriveTopics(title, rawText);

      pages.push({
        id: pageId,
        documentId,
        pageNumber,
        title,
        text: rawText,
        detectedTopics,
        confidence: 0.98,
        createdAt: new Date().toISOString(),
      });
    }

    // Assemble unified extracted presentation text
    const extractedText = pages
      .map((p) => `[Slide ${p.pageNumber}: ${p.title}]\n${p.text}`)
      .join('\n\n');

    return {
      pages,
      tables,
      images,
      extractedText,
      pageCount: pages.length,
      extractorEngine: 'PPTX_XML_DECOMPRESSOR',
    };
  }

  /**
   * Decompresses and parses a Word (.docx) document into discrete paginated sections
   */
  static parseDocx(bufferOrPath: Buffer | string, documentId: string): ParsedDocumentUnit {
    const entries = this.decompressArchive(bufferOrPath);
    const docXmlEntry = entries.get('word/document.xml');

    if (!docXmlEntry) {
      throw new Error('Invalid DOCX: missing word/document.xml entry');
    }

    const xml = docXmlEntry.toString('utf8');

    // Extract paragraphs and headings
    const paragraphRegex = /<w:p\b[^>]*>(.*?)<\/w:p>/gs;
    const textRunRegex = /<w:t\b[^>]*>(.*?)<\/w:t>/g;
    const pageBreakRegex = /<w:br\b[^>]*w:type="page"/;

    const sections: Array<{ title: string; lines: string[] }> = [];
    let currentTitle = 'Section 1: Document Overview';
    let currentLines: string[] = [];

    let pMatch;
    while ((pMatch = paragraphRegex.exec(xml)) !== null) {
      const pXml = pMatch[1];
      const isHeading = pXml.includes('Heading') || pXml.includes('heading') || pXml.includes('w:val="1"');
      const isPageBreak = pageBreakRegex.test(pXml);

      // Collect text in paragraph
      const runs: string[] = [];
      let tMatch;
      while ((tMatch = textRunRegex.exec(pXml)) !== null) {
        runs.push(this.decodeXmlEntities(tMatch[1]));
      }

      const pText = runs.join('').trim();
      if (!pText) continue;

      if ((isHeading && currentLines.length > 0) || isPageBreak) {
        sections.push({ title: currentTitle, lines: currentLines });
        currentTitle = isHeading ? pText : `Section ${sections.length + 1}`;
        currentLines = isHeading ? [] : [pText];
      } else {
        currentLines.push(pText);
      }
    }

    if (currentLines.length > 0) {
      sections.push({ title: currentTitle, lines: currentLines });
    }

    // Construct discrete DocumentPages
    const pages: DocumentPage[] = sections.map((sec, idx) => {
      const pageNumber = idx + 1;
      const text = sec.lines.join('\n');
      return {
        id: `pg_${documentId}_${pageNumber}`,
        documentId,
        pageNumber,
        title: sec.title,
        text,
        detectedTopics: this.deriveTopics(sec.title, text),
        confidence: 0.97,
        createdAt: new Date().toISOString(),
      };
    });

    const tables: DocumentTable[] = [];
    const images: DocumentImage[] = [];

    return {
      pages,
      tables,
      images,
      extractedText: pages.map((p) => `[${p.title}]\n${p.text}`).join('\n\n'),
      pageCount: pages.length,
      extractorEngine: 'DOCX_XML_DECOMPRESSOR',
    };
  }

  /**
   * Extracts text runs and titles from a slide XML string
   */
  private static extractSlideText(
    xml: string,
    slideNum: number
  ): { title: string; textBlocks: string[]; rawText: string } {
    const textBlocks: string[] = [];
    let title = `Slide ${slideNum}`;

    // Extract all paragraphs <a:p>
    const pRegex = /<a:p\b[^>]*>(.*?)<\/a:p>/gs;
    const tRegex = /<a:t\b[^>]*>(.*?)<\/a:t>/g;

    let pMatch;
    let isFirstParagraph = true;

    while ((pMatch = pRegex.exec(xml)) !== null) {
      const pXml = pMatch[1];
      const runs: string[] = [];

      let tMatch;
      while ((tMatch = tRegex.exec(pXml)) !== null) {
        runs.push(this.decodeXmlEntities(tMatch[1]));
      }

      const pText = runs.join('').trim();
      if (pText) {
        textBlocks.push(pText);
        if (isFirstParagraph) {
          title = pText.length > 80 ? pText.substring(0, 77) + '...' : pText;
          isFirstParagraph = false;
        }
      }
    }

    // Check explicit title placeholder: <p:ph type="title".../> or type="ctrTitle"
    const titlePhMatch = xml.match(/<p:sp\b[^>]*>.*?<p:ph\b[^>]*type="(?:title|ctrTitle)"[^>]*>.*?<a:t\b[^>]*>(.*?)<\/a:t>/s);
    if (titlePhMatch) {
      title = this.decodeXmlEntities(titlePhMatch[1]).trim();
    }

    const rawText = textBlocks.join('\n');
    return { title, textBlocks, rawText };
  }

  /**
   * Extracts tables from a slide XML string (<a:tbl>)
   */
  private static extractSlideTables(
    xml: string,
    documentId: string,
    pageId: string,
    pageNumber: number
  ): DocumentTable[] {
    const tables: DocumentTable[] = [];
    const tblRegex = /<a:tbl\b[^>]*>(.*?)<\/a:tbl>/gs;
    const trRegex = /<a:tr\b[^>]*>(.*?)<\/a:tr>/gs;
    const tcRegex = /<a:tc\b[^>]*>(.*?)<\/a:tc>/gs;
    const tRegex = /<a:t\b[^>]*>(.*?)<\/a:t>/g;

    let tblMatch;
    let tblIndex = 1;

    while ((tblMatch = tblRegex.exec(xml)) !== null) {
      const tblXml = tblMatch[1];
      const rows: string[][] = [];

      let trMatch;
      while ((trMatch = trRegex.exec(tblXml)) !== null) {
        const trXml = trMatch[1];
        const cells: string[] = [];

        let tcMatch;
        while ((tcMatch = tcRegex.exec(trXml)) !== null) {
          const tcXml = tcMatch[1];
          const textRuns: string[] = [];

          let tMatch;
          while ((tMatch = tRegex.exec(tcXml)) !== null) {
            textRuns.push(this.decodeXmlEntities(tMatch[1]));
          }
          cells.push(textRuns.join('').trim());
        }

        if (cells.length > 0 && cells.some((c) => c.length > 0)) {
          rows.push(cells);
        }
      }

      if (rows.length >= 2) {
        const headers = rows[0];
        const dataRows = rows.slice(1);
        tables.push({
          id: `tbl_${documentId}_s${pageNumber}_${tblIndex++}`,
          documentId,
          pageId,
          pageNumber,
          caption: `Table extracted from Slide ${pageNumber}`,
          headers,
          rows: dataRows,
          confidence: 0.98,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return tables;
  }

  /**
   * Decodes standard XML entities
   */
  private static decodeXmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  /**
   * Derives semantic topics based on title and content keywords
   */
  private static deriveTopics(title: string, content: string): string[] {
    const combined = `${title} ${content}`.toLowerCase();
    const topics: string[] = [];

    if (combined.includes('problem') || combined.includes('cost') || combined.includes('challenge')) {
      topics.push('Problem Definition');
    }
    if (combined.includes('solution') || combined.includes('architecture') || combined.includes('pipeline')) {
      topics.push('Solution Architecture');
    }
    if (combined.includes('hardware') || combined.includes('sensor') || combined.includes('jetson') || combined.includes('board')) {
      topics.push('Hardware Topology');
    }
    if (combined.includes('benchmark') || combined.includes('accuracy') || combined.includes('fps') || combined.includes('map')) {
      topics.push('Performance Benchmark');
    }
    if (combined.includes('pilot') || combined.includes('roadmap') || combined.includes('feasibility') || combined.includes('cost')) {
      topics.push('Deployment Feasibility');
    }

    if (topics.length === 0) {
      topics.push('Project Overview', 'Technical Details');
    }

    return Array.from(new Set(topics));
  }
}

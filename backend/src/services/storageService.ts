// ====================================================
// PROJECTX-RAY AI - PHASE 12: STORAGE & FILE SECURITY SERVICE
// ====================================================

import path from 'path';

export interface FileValidationResult {
  isValid: boolean;
  sanitizedFilename: string;
  extension: string;
  error?: string;
}

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.pptx',
  '.docx',
  '.txt',
  '.md',
  '.json',
  '.mp4',
  '.mov',
  '.webm',
  '.zip',
  '.tar',
  '.gz'
]);

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export class StorageService {
  /**
   * Validate uploaded file metadata and enforce path traversal defense
   */
  static validateUpload(
    originalFilename: string,
    fileSizeBytes: number,
    mimeType?: string
  ): FileValidationResult {
    // 1. Check size limit
    if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        sanitizedFilename: '',
        extension: '',
        error: `File size exceeds maximum permitted limit (${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB).`
      };
    }

    // 2. Sanitize filename against path traversal attacks (e.g. ../../etc/passwd)
    const baseName = path.basename(originalFilename);
    const sanitizedFilename = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const extension = path.extname(sanitizedFilename).toLowerCase();

    // 3. Check allowed extensions
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return {
        isValid: false,
        sanitizedFilename,
        extension,
        error: `File type '${extension}' is not supported. Supported extensions: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`
      };
    }

    // 4. MIME check
    if (mimeType && mimeType.startsWith('application/x-msdownload')) {
      return {
        isValid: false,
        sanitizedFilename,
        extension,
        error: 'Executable binaries and script installers are strictly prohibited.'
      };
    }

    return {
      isValid: true,
      sanitizedFilename,
      extension
    };
  }
}

// =========================================================================
// PROJECTX-RAY AI - PHASE 12: ENTERPRISE CLOUD OBJECT STORAGE SERVICE
// Multi-Provider Architecture: AWS S3, MinIO, Cloudflare R2 & Local Disk
// Presigned URLs, Path Traversal Defense, SHA-256 Checksums, & DB Registry
// =========================================================================

import path from 'node:path';
import crypto from 'node:crypto';
import { ENV } from '../config/env';
import { db } from '../db/database';
import { createModuleLogger } from '../utils/logger';
import {
  IStorageDriver,
  StorageDriverType,
  StorageObjectMetadata,
  PresignedUploadOptions,
  PresignedUrlResult,
  StorageDriverHealth,
  StoredFileRecord
} from '../storage/types';
import { S3StorageDriver } from '../storage/s3Driver';
import { LocalStorageDriver } from '../storage/localDriver';
import { MemoryStorageDriver } from '../storage/memoryDriver';

const logger = createModuleLogger('StorageService');

export interface FileValidationResult {
  isValid: boolean;
  sanitizedFilename: string;
  extension: string;
  error?: string;
}

export interface SaveFileOptions {
  filename?: string;
  mimeType?: string;
  evaluationId?: string;
  projectId?: string;
  uploadedByUserId?: string;
  customMetadata?: Record<string, string>;
}

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.pptx',
  '.ppt',
  '.docx',
  '.doc',
  '.txt',
  '.md',
  '.json',
  '.mp4',
  '.mov',
  '.webm',
  '.zip',
  '.tar',
  '.gz',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp'
]);

const MAX_FILE_SIZE_BYTES = (ENV.MAX_FILE_SIZE_MB || 500) * 1024 * 1024; // 500 MB default

export class StorageService {
  private static activeDriver: IStorageDriver = StorageService.createInitialDriver();
  private static localDriverInstance: LocalStorageDriver = new LocalStorageDriver();

  /**
   * Initialize the default driver based on ENV settings
   */
  private static createInitialDriver(): IStorageDriver {
    const driverType = ENV.STORAGE_DRIVER;
    return StorageService.instantiateDriver(driverType);
  }

  /**
   * Factory to instantiate a specific storage driver
   */
  static instantiateDriver(driverType: StorageDriverType, customConfig?: any): IStorageDriver {
    switch (driverType) {
      case 's3':
      case 'minio':
      case 'r2':
        return new S3StorageDriver({
          driverType,
          bucket: customConfig?.bucket || ENV.STORAGE_S3_BUCKET,
          region: customConfig?.region || ENV.STORAGE_S3_REGION,
          endpoint: customConfig?.endpoint || ENV.STORAGE_S3_ENDPOINT,
          accessKeyId: customConfig?.accessKeyId || ENV.STORAGE_S3_ACCESS_KEY,
          secretAccessKey: customConfig?.secretAccessKey || ENV.STORAGE_S3_SECRET_KEY,
          forcePathStyle: customConfig?.forcePathStyle ?? ENV.STORAGE_S3_FORCE_PATH_STYLE,
          defaultTtlSeconds: ENV.STORAGE_PRESIGNED_URL_TTL_SECONDS,
          publicUrlBase: customConfig?.publicUrlBase || ENV.STORAGE_PUBLIC_URL_BASE
        });

      case 'memory':
        return new MemoryStorageDriver();

      case 'local':
      default:
        return StorageService.localDriverInstance;
    }
  }

  /**
   * Set active driver programmatically (e.g. for testing or dynamic switching)
   */
  static setDriver(driver: IStorageDriver): void {
    this.activeDriver = driver;
    logger.info('Storage driver switched', { driver: driver.name });
  }

  /**
   * Get currently active driver
   */
  static getDriver(): IStorageDriver {
    return this.activeDriver;
  }

  /**
   * Get local driver instance specifically for local endpoint serving
   */
  static getLocalDriver(): LocalStorageDriver {
    return this.localDriverInstance;
  }

  // =========================================================================
  // FILE VALIDATION & SANITIZATION (Preserves 100% Backwards Compatibility)
  // =========================================================================

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
    if (mimeType && (mimeType.startsWith('application/x-msdownload') || mimeType.includes('executable'))) {
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

  /**
   * Sanitizes a storage key to prevent directory escape or dangerous sequences
   */
  static sanitizeKey(rawKey: string): string {
    const normalized = rawKey.replace(/\\/g, '/').replace(/^\/+/, '');
    const segments = normalized.split('/').filter(Boolean);
    const cleanSegments = segments.map(seg => {
      if (seg === '..' || seg === '.') return '_';
      return seg.replace(/[^a-zA-Z0-9._-]/g, '_');
    });
    return cleanSegments.join('/');
  }

  /**
   * Deterministically generates a standardized unique storage key for an evaluation
   */
  static generateObjectKey(
    evaluationId: string,
    originalFilename: string,
    prefix: string = 'evaluations'
  ): string {
    const validation = this.validateUpload(originalFilename, 0);
    const filename = validation.isValid ? validation.sanitizedFilename : path.basename(originalFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(4).toString('hex');
    const safeEvalId = evaluationId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${prefix}/${safeEvalId}/${timestamp}_${nonce}_${filename}`;
  }

  // =========================================================================
  // CORE CLOUD STORAGE OPERATIONS
  // =========================================================================

  /**
   * Saves a file buffer or string to storage and logs it in the database registry
   */
  static async saveFile(
    key: string,
    data: Buffer | Uint8Array | string,
    options: SaveFileOptions = {}
  ): Promise<StorageObjectMetadata> {
    const cleanKey = this.sanitizeKey(key);
    const buffer = Buffer.isBuffer(data)
      ? data
      : typeof data === 'string'
      ? Buffer.from(data, 'utf8')
      : Buffer.from(data);

    const validation = this.validateUpload(
      options.filename || path.basename(cleanKey),
      buffer.length,
      options.mimeType
    );

    if (!validation.isValid && buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`Upload rejected: ${validation.error}`);
    }

    const metadata: Partial<StorageObjectMetadata> = {
      filename: validation.sanitizedFilename || path.basename(cleanKey),
      mimeType: options.mimeType || 'application/octet-stream',
      customMetadata: options.customMetadata
    };

    // Save to active driver (S3, MinIO, R2, or Local)
    const result = await this.activeDriver.save(cleanKey, buffer, metadata);

    // Record in SQLite registry
    this.recordStoredFile({
      fileKey: cleanKey,
      originalFilename: metadata.filename!,
      mimeType: metadata.mimeType!,
      sizeBytes: buffer.length,
      checksumSha256: result.checksumSha256,
      storageDriver: result.driver,
      storageBucket: result.bucket,
      storagePath: result.url,
      metadata: options.customMetadata,
      evaluationId: options.evaluationId,
      projectId: options.projectId,
      uploadedByUserId: options.uploadedByUserId
    });

    return result;
  }

  /**
   * Downloads a file from storage
   */
  static async getFile(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata }> {
    const cleanKey = this.sanitizeKey(key);
    return this.activeDriver.get(cleanKey);
  }

  /**
   * Deletes a file from storage and cleans up database registry
   */
  static async deleteFile(key: string): Promise<boolean> {
    const cleanKey = this.sanitizeKey(key);
    const success = await this.activeDriver.delete(cleanKey);
    try {
      db.run(`DELETE FROM stored_files WHERE file_key = ?`, cleanKey);
    } catch (err: any) {
      logger.warn('Failed to delete stored file record from database', { key: cleanKey, error: err.message });
    }
    return success;
  }

  /**
   * Checks if a file exists in storage
   */
  static async fileExists(key: string): Promise<boolean> {
    const cleanKey = this.sanitizeKey(key);
    return this.activeDriver.exists(cleanKey);
  }

  /**
   * Retrieves file metadata without downloading the body
   */
  static async getFileMetadata(key: string): Promise<StorageObjectMetadata | null> {
    const cleanKey = this.sanitizeKey(key);
    return this.activeDriver.getMetadata(cleanKey);
  }

  // =========================================================================
  // PRESIGNED URL GENERATION (Upload & Download)
  // =========================================================================

  /**
   * Creates a secure presigned upload URL for direct client-to-bucket transfer
   */
  static async createPresignedUploadUrl(
    key: string,
    options: PresignedUploadOptions = {}
  ): Promise<PresignedUrlResult> {
    const cleanKey = this.sanitizeKey(key);
    const result = await this.activeDriver.createPresignedUploadUrl(cleanKey, options);

    // Pre-register intent in database registry
    if (options.originalFilename) {
      this.recordStoredFile({
        fileKey: cleanKey,
        originalFilename: options.originalFilename,
        mimeType: options.contentType || 'application/octet-stream',
        sizeBytes: 0,
        checksumSha256: 'PENDING_UPLOAD',
        storageDriver: result.driver,
        storageBucket: result.bucket,
        storagePath: result.uploadUrl,
        metadata: options.customMetadata,
        evaluationId: options.evaluationId,
        projectId: options.projectId
      });
    }

    return result;
  }

  /**
   * Creates a secure presigned download URL for private, authenticated read access
   */
  static async createPresignedDownloadUrl(
    key: string,
    expiresInSeconds?: number
  ): Promise<string> {
    const cleanKey = this.sanitizeKey(key);
    return this.activeDriver.createPresignedDownloadUrl(cleanKey, expiresInSeconds);
  }

  // =========================================================================
  // DATABASE REGISTRY & TELEMETRY
  // =========================================================================

  /**
   * Records or updates a file entry in the stored_files database table
   */
  static recordStoredFile(record: Omit<StoredFileRecord, 'id' | 'createdAt'>): StoredFileRecord {
    const id = `file_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    try {
      db.run(
        `INSERT INTO stored_files (
          id, file_key, original_filename, mime_type, size_bytes,
          checksum_sha256, storage_driver, storage_bucket, storage_path,
          metadata_json, evaluation_id, project_id, uploaded_by_user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(file_key) DO UPDATE SET
          size_bytes = excluded.size_bytes,
          checksum_sha256 = excluded.checksum_sha256,
          storage_driver = excluded.storage_driver,
          storage_bucket = excluded.storage_bucket,
          storage_path = excluded.storage_path,
          metadata_json = excluded.metadata_json`,
        id,
        record.fileKey,
        record.originalFilename,
        record.mimeType,
        record.sizeBytes,
        record.checksumSha256,
        record.storageDriver,
        record.storageBucket || null,
        record.storagePath || null,
        record.metadata ? JSON.stringify(record.metadata) : null,
        record.evaluationId || null,
        record.projectId || null,
        record.uploadedByUserId || null,
        now
      );
    } catch (err: any) {
      logger.warn('Failed to insert stored_files database record', { key: record.fileKey, error: err.message });
    }

    return {
      id,
      ...record,
      createdAt: now
    };
  }

  /**
   * Retrieves a stored file record from the database by fileKey
   */
  static getStoredFileByKey(fileKey: string): StoredFileRecord | null {
    try {
      const row = db.get<any>(`SELECT * FROM stored_files WHERE file_key = ?`, fileKey);
      if (!row) return null;
      return {
        id: row.id,
        fileKey: row.file_key,
        originalFilename: row.original_filename,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        checksumSha256: row.checksum_sha256,
        storageDriver: row.storage_driver,
        storageBucket: row.storage_bucket || undefined,
        storagePath: row.storage_path || undefined,
        metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
        evaluationId: row.evaluation_id || undefined,
        projectId: row.project_id || undefined,
        uploadedByUserId: row.uploaded_by_user_id || undefined,
        createdAt: row.created_at
      };
    } catch {
      return null;
    }
  }

  /**
   * Lists stored files, optionally filtered by evaluationId
   */
  static listStoredFiles(evaluationId?: string, limit: number = 50): StoredFileRecord[] {
    try {
      const query = evaluationId
        ? `SELECT * FROM stored_files WHERE evaluation_id = ? ORDER BY created_at DESC LIMIT ?`
        : `SELECT * FROM stored_files ORDER BY created_at DESC LIMIT ?`;
      const rows = evaluationId
        ? db.all<any>(query, evaluationId, limit)
        : db.all<any>(query, limit);

      return rows.map((row: any) => ({
        id: row.id,
        fileKey: row.file_key,
        originalFilename: row.original_filename,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        checksumSha256: row.checksum_sha256,
        storageDriver: row.storage_driver,
        storageBucket: row.storage_bucket || undefined,
        storagePath: row.storage_path || undefined,
        metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
        evaluationId: row.evaluation_id || undefined,
        projectId: row.project_id || undefined,
        uploadedByUserId: row.uploaded_by_user_id || undefined,
        createdAt: row.created_at
      }));
    } catch {
      return [];
    }
  }

  /**
   * Comprehensive health check of active storage system
   */
  static async getHealth(): Promise<StorageDriverHealth & { registeredFilesCount: number; activeDriver: string }> {
    const driverHealth = await this.activeDriver.healthCheck();
    let registeredFilesCount = 0;
    try {
      const countRow = db.get<{ count: number }>(`SELECT COUNT(*) as count FROM stored_files`);
      registeredFilesCount = countRow?.count || 0;
    } catch {
      // Table may not exist yet in test runner
    }

    return {
      ...driverHealth,
      activeDriver: this.activeDriver.name,
      registeredFilesCount
    };
  }
}

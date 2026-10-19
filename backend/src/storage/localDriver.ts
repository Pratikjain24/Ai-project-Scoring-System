// =========================================================================
// PROJECTX-RAY AI - LOCAL DISK STORAGE DRIVER WITH HMAC PRESIGNED URLS
// Sandboxed Path Isolation, Atomic File Writes, & Cryptographic Security
// =========================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  IStorageDriver,
  StorageDriverType,
  StorageObjectMetadata,
  PresignedUploadOptions,
  PresignedUrlResult,
  StorageDriverHealth
} from './types';
import { ENV } from '../config/env';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('LocalStorageDriver');

export interface LocalDriverConfig {
  uploadDir?: string;
  baseUrl?: string;
  signingSecret?: string;
  defaultTtlSeconds?: number;
}

export class LocalStorageDriver implements IStorageDriver {
  readonly name: StorageDriverType = 'local';
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly signingSecret: string;
  private readonly defaultTtlSeconds: number;

  constructor(config: LocalDriverConfig = {}) {
    this.uploadDir = path.resolve(config.uploadDir || ENV.STORAGE_LOCAL_DIR || path.resolve(process.cwd(), 'uploads'));
    this.baseUrl = (config.baseUrl || `http://localhost:${ENV.PORT}`).replace(/\/+$/, '');
    this.signingSecret = config.signingSecret || ENV.JWT_SECRET || 'local-storage-signing-secret';
    this.defaultTtlSeconds = config.defaultTtlSeconds || 900;

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      try {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      } catch (err: any) {
        logger.warn('Failed to create upload directory', { uploadDir: this.uploadDir, error: err.message });
      }
    }
  }

  // --- Path Security & Sandboxing ---

  /**
   * Resolves a storage key to a secure sandboxed filesystem path
   * Strictly prevents path traversal attacks (e.g., ../../../etc/passwd)
   */
  resolvePath(key: string): string {
    const sanitizedKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    
    // Check for traversal segments
    const segments = sanitizedKey.split('/');
    if (segments.some(seg => seg === '..' || seg === '.')) {
      throw new Error(`Security Violation: Path traversal detected in storage key '${key}'`);
    }

    const resolved = path.resolve(this.uploadDir, sanitizedKey);

    // Verify boundary confinement
    const normalizedUploadDir = path.normalize(this.uploadDir) + path.sep;
    const normalizedResolved = path.normalize(resolved);
    if (!normalizedResolved.startsWith(normalizedUploadDir) && normalizedResolved !== path.normalize(this.uploadDir)) {
      throw new Error(`Security Violation: Path '${key}' escapes storage sandbox boundary`);
    }

    return resolved;
  }

  // --- Cryptographic HMAC Presigned URLs ---

  /**
   * Computes an HMAC-SHA256 signature for a key and expiration timestamp
   */
  computeSignature(action: 'upload' | 'download', key: string, expires: number): string {
    const payload = `${action}:${key}:${expires}`;
    return crypto.createHmac('sha256', this.signingSecret).update(payload).digest('hex');
  }

  /**
   * Validates an HMAC-SHA256 signature and expiration
   */
  verifyToken(action: 'upload' | 'download', key: string, expires: number, token: string): boolean {
    if (!token || typeof token !== 'string' || Date.now() > expires) {
      return false; // Token expired or empty
    }
    const expected = this.computeSignature(action, key, expires);
    try {
      const a = Buffer.from(token, 'hex');
      const b = Buffer.from(expected, 'hex');
      if (a.length !== b.length || a.length === 0) {
        return false;
      }
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  // --- IStorageDriver Interface Implementation ---

  async createPresignedUploadUrl(
    key: string,
    options: PresignedUploadOptions = {}
  ): Promise<PresignedUrlResult> {
    const ttl = options.expiresInSeconds || this.defaultTtlSeconds;
    const expires = Date.now() + ttl * 1000;
    const signature = this.computeSignature('upload', key, expires);

    const encodedKey = encodeURIComponent(key);
    const uploadUrl = `${this.baseUrl}/api/storage/file/${encodedKey}?action=upload&expires=${expires}&token=${signature}`;
    const downloadUrl = `${this.baseUrl}/api/storage/file/${encodedKey}?action=download&expires=${expires}&token=${this.computeSignature('download', key, expires)}`;

    return {
      uploadUrl,
      downloadUrl,
      key,
      method: 'PUT',
      headers: {
        ...(options.contentType ? { 'Content-Type': options.contentType } : {})
      },
      expiresAt: new Date(expires).toISOString(),
      expiresInSeconds: ttl,
      driver: 'local'
    };
  }

  async createPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string> {
    const ttl = expiresInSeconds || this.defaultTtlSeconds;
    const expires = Date.now() + ttl * 1000;
    const signature = this.computeSignature('download', key, expires);
    const encodedKey = encodeURIComponent(key);

    return `${this.baseUrl}/api/storage/file/${encodedKey}?action=download&expires=${expires}&token=${signature}`;
  }

  async save(
    key: string,
    data: Buffer | Uint8Array,
    metadata: Partial<StorageObjectMetadata> = {}
  ): Promise<StorageObjectMetadata> {
    const filePath = this.resolvePath(key);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // Atomic write via temp file
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, buffer);
    fs.renameSync(tempPath, filePath);

    const mimeType = metadata.mimeType || 'application/octet-stream';
    const filename = metadata.filename || path.basename(filePath);

    return {
      key,
      filename,
      mimeType,
      sizeBytes: buffer.length,
      checksumSha256,
      driver: 'local',
      uploadedAt: new Date().toISOString(),
      url: `/api/storage/file/${encodeURIComponent(key)}`,
      customMetadata: metadata.customMetadata
    };
  }

  async get(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata }> {
    const filePath = this.resolvePath(key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File '${key}' not found in local storage`);
    }

    const data = fs.readFileSync(filePath);
    const stat = fs.statSync(filePath);
    const checksumSha256 = crypto.createHash('sha256').update(data).digest('hex');

    return {
      data,
      metadata: {
        key,
        filename: path.basename(filePath),
        mimeType: 'application/octet-stream',
        sizeBytes: stat.size,
        checksumSha256,
        driver: 'local',
        uploadedAt: stat.mtime.toISOString(),
        url: `/api/storage/file/${encodeURIComponent(key)}`
      }
    };
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = this.resolvePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (err: any) {
      logger.warn('Failed to delete local file', { key, error: err.message });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const filePath = this.resolvePath(key);
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  async getMetadata(key: string): Promise<StorageObjectMetadata | null> {
    try {
      const filePath = this.resolvePath(key);
      if (!fs.existsSync(filePath)) return null;

      const stat = fs.statSync(filePath);
      return {
        key,
        filename: path.basename(filePath),
        mimeType: 'application/octet-stream',
        sizeBytes: stat.size,
        checksumSha256: '',
        driver: 'local',
        uploadedAt: stat.mtime.toISOString(),
        url: `/api/storage/file/${encodeURIComponent(key)}`
      };
    } catch {
      return null;
    }
  }

  async healthCheck(): Promise<StorageDriverHealth> {
    try {
      const exists = fs.existsSync(this.uploadDir);
      return {
        driver: 'local',
        status: exists ? 'healthy' : 'degraded',
        connected: exists,
        endpoint: this.uploadDir,
        details: {
          uploadDir: this.uploadDir,
          isWritable: exists
        }
      };
    } catch (err: any) {
      return {
        driver: 'local',
        status: 'unhealthy',
        connected: false,
        details: { error: err.message }
      };
    }
  }
}

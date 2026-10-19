// =========================================================================
// PROJECTX-RAY AI - IN-MEMORY STORAGE DRIVER FOR TESTING & EPHEMERAL JOBS
// Zero Disk I/O, Instant Performance, Full IStorageDriver Compliance
// =========================================================================

import crypto from 'node:crypto';
import {
  IStorageDriver,
  StorageDriverType,
  StorageObjectMetadata,
  PresignedUploadOptions,
  PresignedUrlResult,
  StorageDriverHealth
} from './types';

export class MemoryStorageDriver implements IStorageDriver {
  readonly name: StorageDriverType = 'memory';
  private readonly store: Map<string, { data: Buffer; metadata: StorageObjectMetadata }> = new Map();

  clear(): void {
    this.store.clear();
  }

  async save(
    key: string,
    data: Buffer | Uint8Array,
    metadata: Partial<StorageObjectMetadata> = {}
  ): Promise<StorageObjectMetadata> {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const mimeType = metadata.mimeType || 'application/octet-stream';
    const filename = metadata.filename || key.split('/').pop() || 'file';

    const objMeta: StorageObjectMetadata = {
      key,
      filename,
      mimeType,
      sizeBytes: buffer.length,
      checksumSha256,
      driver: 'memory',
      uploadedAt: new Date().toISOString(),
      url: `memory://${key}`,
      customMetadata: metadata.customMetadata
    };

    this.store.set(key, { data: buffer, metadata: objMeta });
    return objMeta;
  }

  async get(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata }> {
    const entry = this.store.get(key);
    if (!entry) {
      throw new Error(`Object '${key}' not found in memory storage`);
    }
    return entry;
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async getMetadata(key: string): Promise<StorageObjectMetadata | null> {
    const entry = this.store.get(key);
    return entry ? entry.metadata : null;
  }

  async createPresignedUploadUrl(
    key: string,
    options: PresignedUploadOptions = {}
  ): Promise<PresignedUrlResult> {
    const ttl = options.expiresInSeconds || 900;
    return {
      uploadUrl: `memory://${key}?action=upload&expires=${Date.now() + ttl * 1000}`,
      downloadUrl: `memory://${key}?action=download&expires=${Date.now() + ttl * 1000}`,
      key,
      method: 'PUT',
      headers: {
        ...(options.contentType ? { 'Content-Type': options.contentType } : {})
      },
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
      expiresInSeconds: ttl,
      driver: 'memory'
    };
  }

  async createPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string> {
    const ttl = expiresInSeconds || 900;
    return `memory://${key}?action=download&expires=${Date.now() + ttl * 1000}`;
  }

  async healthCheck(): Promise<StorageDriverHealth> {
    return {
      driver: 'memory',
      status: 'healthy',
      connected: true,
      endpoint: 'in-memory://virtual-buffer',
      details: {
        storedObjectsCount: this.store.size
      }
    };
  }

  async list(prefix?: string, limit?: number): Promise<StorageObjectMetadata[]> {
    const results: StorageObjectMetadata[] = [];
    for (const [key, entry] of this.store.entries()) {
      if (!prefix || key.startsWith(prefix)) {
        results.push(entry.metadata);
        if (limit && results.length >= limit) break;
      }
    }
    return results;
  }
}

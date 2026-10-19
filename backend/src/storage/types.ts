// =========================================================================
// PROJECTX-RAY AI - CLOUD OBJECT STORAGE ARCHITECTURE: TYPES & INTERFACES
// =========================================================================

export type StorageDriverType = 'local' | 's3' | 'minio' | 'r2' | 'memory';

export interface StorageObjectMetadata {
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  driver: StorageDriverType;
  bucket?: string;
  uploadedAt: string;
  etag?: string;
  url?: string;
  customMetadata?: Record<string, string>;
}

export interface PresignedUploadOptions {
  contentType?: string;
  expiresInSeconds?: number;
  maxSizeBytes?: number;
  originalFilename?: string;
  evaluationId?: string;
  projectId?: string;
  customMetadata?: Record<string, string>;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  downloadUrl?: string;
  key: string;
  method: 'PUT' | 'POST';
  headers: Record<string, string>;
  expiresAt: string;
  expiresInSeconds: number;
  driver: StorageDriverType;
  bucket?: string;
}

export interface StorageDriverHealth {
  driver: StorageDriverType;
  status: 'healthy' | 'degraded' | 'unhealthy';
  connected: boolean;
  bucket?: string;
  region?: string;
  endpoint?: string;
  details?: Record<string, any>;
}

export interface IStorageDriver {
  readonly name: StorageDriverType;

  /**
   * Save a file buffer to storage
   */
  save(
    key: string,
    data: Buffer | Uint8Array,
    metadata?: Partial<StorageObjectMetadata>
  ): Promise<StorageObjectMetadata>;

  /**
   * Retrieve a file buffer and its metadata from storage
   */
  get(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata }>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<boolean>;

  /**
   * Check if a file exists in storage
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get metadata for a file without downloading the full body
   */
  getMetadata(key: string): Promise<StorageObjectMetadata | null>;

  /**
   * Generate a secure presigned upload URL for direct client upload
   */
  createPresignedUploadUrl(
    key: string,
    options?: PresignedUploadOptions
  ): Promise<PresignedUrlResult>;

  /**
   * Generate a secure presigned download URL for authenticated temporary access
   */
  createPresignedDownloadUrl(
    key: string,
    expiresInSeconds?: number
  ): Promise<string>;

  /**
   * Report health and connectivity status of the storage backend
   */
  healthCheck(): Promise<StorageDriverHealth>;

  /**
   * List files matching a prefix
   */
  list?(prefix?: string, limit?: number): Promise<StorageObjectMetadata[]>;
}

export interface StoredFileRecord {
  id: string;
  fileKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  storageDriver: StorageDriverType;
  storageBucket?: string;
  storagePath?: string;
  metadata?: Record<string, any>;
  evaluationId?: string;
  projectId?: string;
  uploadedByUserId?: string;
  createdAt: string;
}

// =========================================================================
// PROJECTX-RAY AI - CLOUD OBJECT STORAGE CONTROLLER
// Presigned Uploads, Presigned Downloads, HMAC Verification & File Serving
// =========================================================================

import type { Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storageService';
import { AppError } from '../middleware/errorHandler';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('StorageController');

export class StorageController {
  /**
   * Generates a presigned upload URL for direct client-to-bucket upload (S3/MinIO/R2/Local)
   * POST /api/storage/presigned-upload
   */
  static async createPresignedUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        filename,
        contentType = 'application/octet-stream',
        fileSizeBytes = 0,
        evaluationId,
        projectId,
        expiresInSeconds
      } = req.body;

      if (!filename) {
        throw new AppError('Filename is required to generate a presigned upload URL', { statusCode: 400 });
      }

      // Validate upload metadata
      const validation = StorageService.validateUpload(filename, fileSizeBytes, contentType);
      if (!validation.isValid) {
        throw new AppError(validation.error || 'File validation failed', { statusCode: 400 });
      }

      const key = StorageService.generateObjectKey(evaluationId || 'common', filename);

      const presigned = await StorageService.createPresignedUploadUrl(key, {
        contentType,
        expiresInSeconds,
        originalFilename: filename,
        evaluationId,
        projectId
      });

      res.status(200).json({
        success: true,
        data: presigned
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Generates a presigned download URL for private, authenticated read access
   * GET /api/storage/presigned-download/:key
   */
  static async createPresignedDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = decodeURIComponent(req.params.key || (req.query.key as string) || '');
      if (!key) {
        throw new AppError('Storage object key is required', { statusCode: 400 });
      }

      const expiresInSeconds = req.query.expiresInSeconds
        ? parseInt(req.query.expiresInSeconds as string, 10)
        : undefined;

      const downloadUrl = await StorageService.createPresignedDownloadUrl(key, expiresInSeconds);

      res.status(200).json({
        success: true,
        data: {
          key,
          downloadUrl,
          expiresInSeconds: expiresInSeconds || 900
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Serves or receives local files via presigned HMAC token or authenticated session
   * GET/PUT /api/storage/file/:key(*)
   */
  static async serveOrReceiveLocalFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawKey = req.params?.key || (req.params as any)?.[0] || req.path.replace(/^\/+/, '') || (req.query.key as string);
      if (!rawKey) {
        throw new AppError('Storage object key is required', { statusCode: 400 });
      }
      const key = decodeURIComponent(rawKey);

      const token = (req.query.token as string) || '';
      const expiresStr = (req.query.expires as string) || '';
      const action = (req.query.action as 'upload' | 'download') || (req.method === 'PUT' ? 'upload' : 'download');

      // Security check: Either valid Presigned Token or valid User Authentication Session
      let isAuthorized = false;

      if (token && expiresStr) {
        const expires = parseInt(expiresStr, 10);
        isAuthorized = StorageService.getLocalDriver().verifyToken(action, key, expires, token);
      }

      // Also allow authenticated users with session
      if (!isAuthorized && (req as any).user) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        throw new AppError('Unauthorized: Invalid or expired storage token', {
          statusCode: 403,
          code: 'INVALID_STORAGE_TOKEN'
        });
      }

      // --- Handle PUT Upload ---
      if (req.method === 'PUT') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const buffer = Buffer.concat(chunks);

        const contentType = req.headers['content-type'] || 'application/octet-stream';
        const saved = await StorageService.saveFile(key, buffer, {
          mimeType: contentType,
          filename: key.split('/').pop()
        });

        res.status(200).json({
          success: true,
          data: saved
        });
        return;
      }

      // --- Handle GET Download ---
      const { data, metadata } = await StorageService.getFile(key);

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Length', data.length);
      if (metadata.checksumSha256) {
        res.setHeader('ETag', `"${metadata.checksumSha256}"`);
      }
      res.setHeader('Cache-Control', 'private, max-age=3600');

      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Direct server-side proxy upload (for base64/buffer payload delivery)
   * POST /api/storage/upload
   */
  static async uploadPayload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        key: requestedKey,
        fileName,
        filename,
        mimeType = 'application/octet-stream',
        fileBase64,
        content,
        evaluationId,
        projectId
      } = req.body;

      const targetFilename = fileName || filename || 'upload.bin';
      const key = requestedKey || StorageService.generateObjectKey(evaluationId || 'common', targetFilename);

      let buffer: Buffer;
      if (fileBase64) {
        const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
        buffer = Buffer.from(cleanBase64, 'base64');
      } else if (content) {
        buffer = Buffer.from(content, 'utf8');
      } else {
        throw new AppError('fileBase64 or content payload is required', { statusCode: 400 });
      }

      const saved = await StorageService.saveFile(key, buffer, {
        filename: targetFilename,
        mimeType,
        evaluationId,
        projectId,
        uploadedByUserId: (req as any).user?.userId
      });

      res.status(201).json({
        success: true,
        data: saved
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves file metadata
   * GET /api/storage/metadata/:key
   */
  static async getMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = decodeURIComponent(req.params.key || '');
      const metadata = await StorageService.getFileMetadata(key);
      const record = StorageService.getStoredFileByKey(key);

      if (!metadata && !record) {
        throw new AppError(`File '${key}' not found`, { statusCode: 404 });
      }

      res.status(200).json({
        success: true,
        data: {
          metadata: metadata || null,
          record: record || null
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deletes a file from storage and registry
   * DELETE /api/storage/file/:key
   */
  static async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = decodeURIComponent(req.params.key || '');
      const success = await StorageService.deleteFile(key);

      res.status(200).json({
        success,
        message: success ? `File '${key}' deleted successfully` : `File '${key}' could not be deleted`
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Returns storage health status
   * GET /api/storage/health
   */
  static async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await StorageService.getHealth();
      res.status(200).json({
        success: true,
        data: health
      });
    } catch (err) {
      next(err);
    }
  }
}

// =========================================================================
// PROJECTX-RAY AI - CLOUD OBJECT STORAGE ROUTES
// =========================================================================

import { Router } from 'express';
import { StorageController } from '../controllers/storageController';
import { authenticate } from '../middleware/auth';

export const storageRouter = Router();

// Public / Token-verified endpoints
storageRouter.get('/health', StorageController.getHealth);

// Local file serving and presigned PUT upload (verified via HMAC token or auth)
storageRouter.use('/file', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'PUT') {
    return StorageController.serveOrReceiveLocalFile(req, res, next);
  }
  next();
});

// Authenticated presigned URL generation & proxy operations
storageRouter.post('/presigned-upload', authenticate, StorageController.createPresignedUpload);
storageRouter.get('/presigned-download', authenticate, StorageController.createPresignedDownload);
storageRouter.get('/presigned-download/:key', authenticate, StorageController.createPresignedDownload);
storageRouter.post('/upload', authenticate, StorageController.uploadPayload);
storageRouter.get('/metadata/:key', authenticate, StorageController.getMetadata);
storageRouter.delete('/file/:key', authenticate, StorageController.deleteFile);

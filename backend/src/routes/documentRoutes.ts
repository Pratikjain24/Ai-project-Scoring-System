import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';

export const documentRouter = Router();

// Document Specific Endpoints
documentRouter.post('/upload', DocumentController.upload);
documentRouter.get('/:id', DocumentController.getById);
documentRouter.get('/:id/pages', DocumentController.getPages);
documentRouter.get('/:id/evidence', DocumentController.getEvidence);
documentRouter.get('/:id/claims', DocumentController.getClaims);
documentRouter.get('/:id/technologies', DocumentController.getTechnologies);
documentRouter.get('/:id/architecture', DocumentController.getArchitecture);

import { Router } from 'express';
import { EvidenceController } from '../controllers/evidenceController';

export const evidenceRouter = Router();

evidenceRouter.get('/:id', EvidenceController.getById);
evidenceRouter.get('/evaluation/:id', EvidenceController.getByEvaluationId);

// Evidence Graph queries
evidenceRouter.get('/graph/:evaluationId/score/:categoryKey', EvidenceController.getScoreLineage);
evidenceRouter.get('/graph/claim/:claimId', EvidenceController.getClaimLineage);
evidenceRouter.get('/graph/originality/:evaluationId', EvidenceController.getOriginalityLineage);
evidenceRouter.get('/graph/:evaluationId/audit', EvidenceController.auditGraph);
evidenceRouter.get('/graph/:evaluationId/claims/:claimId/resolve', EvidenceController.resolveClaim);


import { Router } from 'express';
import { OriginalityIntelligenceController } from '../controllers/originalityIntelligenceController';

const router = Router({ mergeParams: true });

// Evaluation-scoped originality intelligence endpoints:
// Mounted at: /api/evaluations/:id/originality
router.post('/analyze', OriginalityIntelligenceController.analyze);
router.get('/', OriginalityIntelligenceController.getFullBundle);
router.get('/candidates', OriginalityIntelligenceController.getCandidates);
router.get('/dimensions', OriginalityIntelligenceController.getDimensions);
router.get('/evidence', OriginalityIntelligenceController.getEvidence);
router.get('/contributions', OriginalityIntelligenceController.getContributions);
router.get('/report', OriginalityIntelligenceController.getReport);
router.get('/graph', OriginalityIntelligenceController.getGraph);

export default router;

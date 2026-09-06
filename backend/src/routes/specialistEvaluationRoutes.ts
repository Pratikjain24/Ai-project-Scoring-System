import { Router } from 'express';
import { SpecialistEvaluationController } from '../controllers/specialistEvaluationController';

export const specialistRouter = Router({ mergeParams: true });

// Technical endpoints
specialistRouter.post('/technical/analyze', SpecialistEvaluationController.analyzeTechnical);
specialistRouter.get('/technical', SpecialistEvaluationController.getTechnical);
specialistRouter.get('/technical/software', SpecialistEvaluationController.getSoftware);
specialistRouter.get('/technical/hardware', SpecialistEvaluationController.getHardware);
specialistRouter.get('/technical/security', SpecialistEvaluationController.getSecurity);
specialistRouter.get('/technical/performance', SpecialistEvaluationController.getPerformance);
specialistRouter.get('/technical/scalability', SpecialistEvaluationController.getScalability);

// Impact endpoints
specialistRouter.post('/impact/analyze', SpecialistEvaluationController.analyzeImpact);
specialistRouter.get('/impact', SpecialistEvaluationController.getImpact);
specialistRouter.get('/impact/social', SpecialistEvaluationController.getSocial);
specialistRouter.get('/impact/economic', SpecialistEvaluationController.getEconomic);
specialistRouter.get('/impact/environmental', SpecialistEvaluationController.getEnvironmental);

// Feasibility endpoints
specialistRouter.post('/feasibility/analyze', SpecialistEvaluationController.analyzeFeasibility);
specialistRouter.get('/feasibility', SpecialistEvaluationController.getFeasibility);

// Cross-cutting intelligence endpoints
specialistRouter.get('/risks', SpecialistEvaluationController.getRisks);
specialistRouter.get('/evidence-gaps', SpecialistEvaluationController.getEvidenceGaps);
specialistRouter.get('/recommendations', SpecialistEvaluationController.getRecommendations);
specialistRouter.get('/maturity', SpecialistEvaluationController.getMaturity);

// Full summary endpoint
specialistRouter.get('/specialist-summary', SpecialistEvaluationController.getSummary);

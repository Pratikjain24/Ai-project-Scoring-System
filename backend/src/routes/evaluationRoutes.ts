import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluationController';
import { validateBody, CreateEvaluationSchema } from '../middleware/validator';

import { DocumentController } from '../controllers/documentController';
import { VideoController } from '../controllers/videoController';

export const evaluationRouter = Router();

import { juryRouter } from './juryRoutes';
import { JuryController } from '../controllers/juryController';

// Project comparison (placed before /:id)
evaluationRouter.get('/compare', JuryController.compareProjects);

// Scenario 8 Mitigation: Canonical Single Source of Truth Rubric API
evaluationRouter.get('/rubric', EvaluationController.getCanonicalRubric);

// Persistent Queue & Job Resumption Endpoints (BullMQ / SQLite Durable Queue)
evaluationRouter.get('/queue/status', EvaluationController.getQueueStatus);
evaluationRouter.post('/queue/resume-interrupted', EvaluationController.resumeInterrupted);

evaluationRouter.post('/', validateBody(CreateEvaluationSchema), EvaluationController.create);
evaluationRouter.get('/', EvaluationController.getAll);
evaluationRouter.get('/:id', EvaluationController.getById);
evaluationRouter.post('/:id/start', EvaluationController.start);
evaluationRouter.post('/:id/retry', EvaluationController.retry);
evaluationRouter.post('/:id/cancel', EvaluationController.cancel);
evaluationRouter.get('/:id/stream', EvaluationController.streamPipeline);

import originalityRouter from './originalityIntelligenceRoutes';

import { claimRouter } from './claimVerificationRoutes';
import { specialistRouter } from './specialistEvaluationRoutes';

// Phase 9 Master Scoring & AI Jury Engine Sub-Routes
evaluationRouter.use('/', juryRouter);

// Sub-resource assessments
evaluationRouter.get('/:id/status', EvaluationController.getStatus);
evaluationRouter.get('/:id/project', EvaluationController.getProjectDNA);
evaluationRouter.get('/:id/project-dna', DocumentController.getEvaluationProjectDNA);

// Phase 8 Specialist Evaluator Sub-Routes
evaluationRouter.use('/:id', specialistRouter);

evaluationRouter.use('/:id/originality', originalityRouter);
evaluationRouter.use('/:id/claims', claimRouter);
import { reportRouter } from './reportRoutes';
import { liveJuryRouter } from './liveJuryRoutes';
import { orchestratorRoutes } from './orchestratorRoutes';

evaluationRouter.use('/:id/report', reportRouter);
evaluationRouter.use('/:id/live', liveJuryRouter);
evaluationRouter.use('/', orchestratorRoutes);

// Document Intelligence sub-endpoints
evaluationRouter.get('/:id/evidence-gaps', DocumentController.getEvidenceGaps);
evaluationRouter.get('/:id/contradictions', DocumentController.getContradictions);
evaluationRouter.get('/:id/document-quality', DocumentController.getDocumentQuality);
evaluationRouter.get('/:id/documents', DocumentController.getDocumentsForEvaluation);

// Multimodal Video Analysis & Presentation sub-endpoints
evaluationRouter.get('/:id/video-analysis', VideoController.getEvaluationVideoAnalysis);
evaluationRouter.get('/:id/presentation', EvaluationController.getPresentation);

// Research Intelligence Engine sub-endpoints (Phase 5)
import { researchController } from '../controllers/researchIntelligenceController.js';

evaluationRouter.post('/:id/research', (req, res) => researchController.runResearch(req, res));
evaluationRouter.get('/:id/research', (req, res) => researchController.getResearch(req, res));
evaluationRouter.get('/:id/research/questions', (req, res) => researchController.getQuestions(req, res));
evaluationRouter.get('/:id/research/findings', (req, res) => researchController.getFindings(req, res));
evaluationRouter.get('/:id/research/sources', (req, res) => researchController.getSources(req, res));
evaluationRouter.get('/:id/research/evidence', (req, res) => researchController.getEvidence(req, res));
evaluationRouter.get('/:id/research/similar-projects', (req, res) => researchController.getSimilarProjects(req, res));
evaluationRouter.get('/:id/research/products', (req, res) => researchController.getProducts(req, res));
evaluationRouter.get('/:id/research/academic', (req, res) => researchController.getAcademic(req, res));
evaluationRouter.get('/:id/research/patents', (req, res) => researchController.getPatents(req, res));
evaluationRouter.get('/:id/research/benchmarks', (req, res) => researchController.getBenchmarks(req, res));


import { Router } from 'express';
import { researchController } from '../controllers/researchIntelligenceController.js';

const router = Router();

// Evaluation research endpoints
router.post('/evaluations/:id/research', (req, res) => researchController.runResearch(req, res));
router.get('/evaluations/:id/research', (req, res) => researchController.getResearch(req, res));
router.get('/evaluations/:id/research/questions', (req, res) => researchController.getQuestions(req, res));
router.get('/evaluations/:id/research/findings', (req, res) => researchController.getFindings(req, res));
router.get('/evaluations/:id/research/sources', (req, res) => researchController.getSources(req, res));
router.get('/evaluations/:id/research/evidence', (req, res) => researchController.getEvidence(req, res));
router.get('/evaluations/:id/research/similar-projects', (req, res) => researchController.getSimilarProjects(req, res));
router.get('/evaluations/:id/research/products', (req, res) => researchController.getProducts(req, res));
router.get('/evaluations/:id/research/academic', (req, res) => researchController.getAcademic(req, res));
router.get('/evaluations/:id/research/patents', (req, res) => researchController.getPatents(req, res));
router.get('/evaluations/:id/research/benchmarks', (req, res) => researchController.getBenchmarks(req, res));

// Direct source action
router.post('/research/source/:id/refresh', (req, res) => researchController.refreshSource(req, res));

export default router;

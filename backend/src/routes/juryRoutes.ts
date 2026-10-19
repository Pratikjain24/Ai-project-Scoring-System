import { Router } from 'express';
import { JuryController } from '../controllers/juryController';

export const juryRouter = Router();

// --- Standalone Rubric & Comparison Routes ---
export const rubricRouter = Router();
rubricRouter.get('/', JuryController.getRubrics);
rubricRouter.get('/:id/versions', JuryController.getRubricVersions);

// Mountable evaluation sub-routes for Phase 9 Master Scoring & AI Jury
// (mounted on /api/evaluations or /api/evaluations/:id)
juryRouter.post('/:id/score', JuryController.calculateScore);
juryRouter.get('/:id/score', JuryController.getScore);
juryRouter.get('/:id/score/breakdown', JuryController.getScoreBreakdown);
juryRouter.get('/:id/score/confidence', JuryController.getConfidence);
juryRouter.get('/:id/score/evidence-coverage', JuryController.getEvidenceCoverage);
juryRouter.post('/:id/score/simulate', JuryController.simulate);

juryRouter.get('/:id/jury', JuryController.getJury);
juryRouter.post('/:id/jury/finalize', JuryController.finalizeJury);
juryRouter.get('/:id/jury/deliberation', JuryController.getDeliberation);
juryRouter.get('/:id/jury/debate', JuryController.getDeliberation);
juryRouter.post('/:id/jury/deliberate', JuryController.runDeliberation);
juryRouter.post('/:id/jury/debate', JuryController.runDeliberation);
juryRouter.get('/:id/jury/questions', JuryController.getQuestions);
juryRouter.post('/:id/jury/questions/:questionId/interact', JuryController.interactQuestion);
juryRouter.get('/:id/jury/notes', JuryController.getNotes);
juryRouter.post('/:id/jury/notes', JuryController.addNote);
juryRouter.get('/:id/jury/risks', JuryController.getRisks);
juryRouter.get('/:id/jury/recommendations', JuryController.getRecommendations);
juryRouter.post('/:id/jury/simulate', JuryController.simulate);

juryRouter.get('/:id/history', JuryController.getHistory);
juryRouter.post('/:id/human-review', JuryController.addHumanReview);
juryRouter.get('/:id/human-review', JuryController.getHumanReviews);
juryRouter.get('/:id/audit-trail', JuryController.getAuditTrail);

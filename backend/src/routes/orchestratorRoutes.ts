// ====================================================
// PROJECTX-RAY AI - PHASE 12: ORCHESTRATOR ROUTES
// ====================================================

import { Router } from 'express';
import { OrchestratorController } from '../controllers/orchestratorController';

export const orchestratorRoutes = Router();

// Pipeline orchestration
orchestratorRoutes.post('/:id/orchestrate/start', OrchestratorController.startOrchestration);
orchestratorRoutes.get('/:id/orchestrate/status', OrchestratorController.getStatus);
orchestratorRoutes.post('/:id/orchestrate/retry', OrchestratorController.retry);
orchestratorRoutes.post('/:id/orchestrate/transition', OrchestratorController.transition);
orchestratorRoutes.post('/:id/orchestrate/finalize', OrchestratorController.finalize);

// Integrity & Consistency Audit
orchestratorRoutes.get('/:id/integrity', OrchestratorController.checkIntegrity);

// Human Review & Evidence Requests
orchestratorRoutes.post('/:id/evidence-requests', OrchestratorController.createEvidenceRequest);
orchestratorRoutes.get('/:id/evidence-requests', OrchestratorController.getEvidenceRequests);
orchestratorRoutes.patch('/:id/evidence-requests/:reqId', OrchestratorController.updateEvidenceRequest);

// Re-analysis & Revisions
orchestratorRoutes.post('/:id/re-analyze', OrchestratorController.reanalyze);
orchestratorRoutes.get('/:id/revisions', OrchestratorController.getRevisions);

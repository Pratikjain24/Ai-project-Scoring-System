// ====================================================
// PROJECTX-RAY AI - PHASE 12: ORCHESTRATOR CONTROLLER
// ====================================================

import type { Request, Response } from 'express';
import { EvaluationOrchestrator } from '../pipeline/evaluationOrchestrator';
import { EvaluationStateMachine } from '../pipeline/evaluationStateMachine';
import { EvaluationIntegrityChecker } from '../pipeline/evaluationIntegrityChecker';
import { AnalysisImpactResolver } from '../pipeline/analysisImpactResolver';
import { IntegrationRepository } from '../repositories/integrationRepository';
import { AuthorizationService } from '../services/authorizationService';

export class OrchestratorController {
  /**
   * Start or resume complete pipeline execution
   */
  static async startOrchestration(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { skipMedia, skipResearch, fromCheckpoint } = req.body || {};

    try {
      const progress = await EvaluationOrchestrator.run(id, {
        skipMedia: Boolean(skipMedia),
        skipResearch: Boolean(skipResearch),
        fromCheckpoint
      });

      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'ORCHESTRATION_FAILED',
          message: err?.message || 'Pipeline execution failed'
        }
      });
    }
  }

  /**
   * Get current pipeline status and checkpoints
   */
  static getStatus(req: Request, res: Response): void {
    const { id } = req.params;
    try {
      const progress = EvaluationOrchestrator.getProgress(id);
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EVALUATION_NOT_FOUND',
          message: err?.message || 'Evaluation not found'
        }
      });
    }
  }

  /**
   * Retry failed evaluation from checkpoint
   */
  static retry(req: Request, res: Response): void {
    const { id } = req.params;
    const { targetState } = req.body || {};

    try {
      const state = EvaluationStateMachine.retryFromCheckpoint(id, targetState);
      res.status(200).json({
        success: true,
        data: state
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'RETRY_FAILED',
          message: err?.message || 'Failed to retry from checkpoint'
        }
      });
    }
  }

  /**
   * Execute explicit validated state transition
   */
  static transition(req: Request, res: Response): void {
    const { id } = req.params;
    const { targetState, reason } = req.body;

    if (!targetState) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_TARGET_STATE', message: 'targetState is required.' }
      });
      return;
    }

    try {
      const updated = EvaluationStateMachine.transition(id, targetState, reason);
      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: err?.message || 'Illegal state transition'
        }
      });
    }
  }

  /**
   * Finalize evaluation
   */
  static finalize(req: Request, res: Response): void {
    const { id } = req.params;
    const { reviewerNotes } = req.body || {};

    try {
      const progress = EvaluationOrchestrator.finalize(id, reviewerNotes);
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'FINALIZATION_FAILED',
          message: err?.message || 'Failed to finalize evaluation'
        }
      });
    }
  }

  /**
   * Run comprehensive integrity and consistency check
   */
  static checkIntegrity(req: Request, res: Response): void {
    const { id } = req.params;
    try {
      const result = EvaluationIntegrityChecker.check(id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTEGRITY_CHECK_FAILED',
          message: err?.message || 'Failed to verify evaluation integrity'
        }
      });
    }
  }

  /**
   * Create human reviewer evidence request
   */
  static createEvidenceRequest(req: Request, res: Response): void {
    const { id } = req.params;
    const { title, description, priority, requestedBy } = req.body;

    if (!title || !description) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'title and description are required.' }
      });
      return;
    }

    try {
      const created = IntegrationRepository.createEvidenceRequest(
        id,
        title,
        description,
        priority,
        requestedBy
      );
      res.status(201).json({
        success: true,
        data: created
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: err?.message || 'Failed to create evidence request'
        }
      });
    }
  }

  /**
   * List evidence requests for evaluation
   */
  static getEvidenceRequests(req: Request, res: Response): void {
    const { id } = req.params;
    try {
      const list = IntegrationRepository.getEvidenceRequests(id);
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: err?.message || 'Failed to fetch evidence requests'
        }
      });
    }
  }

  /**
   * Update evidence request status
   */
  static updateEvidenceRequest(req: Request, res: Response): void {
    const { reqId } = req.params;
    const { status, responseNotes } = req.body;

    try {
      const updated = IntegrationRepository.updateEvidenceRequest(reqId, status, responseNotes);
      if (!updated) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Evidence request not found.' }
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: err?.message || 'Failed to update evidence request'
        }
      });
    }
  }

  /**
   * Trigger selective re-analysis on newly ingested evidence
   */
  static reanalyze(req: Request, res: Response): void {
    const { id } = req.params;
    const { evidenceType, evidenceId, reason } = req.body;

    if (!evidenceType || !evidenceId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_EVIDENCE_PARAMS', message: 'evidenceType and evidenceId are required.' }
      });
      return;
    }

    try {
      const impact = AnalysisImpactResolver.resolve(id, evidenceType, evidenceId, reason);
      res.status(200).json({
        success: true,
        data: impact
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'REANALYSIS_FAILED',
          message: err?.message || 'Failed to resolve re-analysis impact'
        }
      });
    }
  }

  /**
   * List evaluation revisions
   */
  static getRevisions(req: Request, res: Response): void {
    const { id } = req.params;
    try {
      const revs = IntegrationRepository.getRevisions(id);
      res.status(200).json({
        success: true,
        data: revs
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: err?.message || 'Failed to get evaluation revisions'
        }
      });
    }
  }
}

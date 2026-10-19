import type { Request, Response, NextFunction } from 'express';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { AssessmentRepository } from '../repositories/assessmentRepository';
import { ClaimRepository } from '../repositories/claimRepository';
import { OrchestrationService, pipelineStreamEmitter } from '../pipeline/orchestrationService';
import { EvaluationOrchestrator } from '../pipeline/evaluationOrchestrator';
import { pipelineQueue } from '../pipeline/pipelineQueue';
import { MultimodalRepository } from '../repositories/multimodalRepository';
import { db } from '../db/database';
import { AppError } from '../middleware/errorHandler';
import { SCORING_WEIGHTS, RUBRIC_LABELS, validateWeights } from '../config/scoringWeights';

export class EvaluationController {
  static create(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = req.body.id || `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const executionId = `exec_${Date.now()}`;
      const evaluation = EvaluationRepository.create({
        id,
        projectId: req.body.projectId,
        mode: req.body.mode || 'VIDEO_ANALYSIS',
        status: 'QUEUED',
        executionId,
      });

      res.status(201).json({
        success: true,
        data: evaluation,
      });
    } catch (err) {
      next(err);
    }
  }

  static getAll(_req: Request, res: Response, next: NextFunction): void {
    try {
      const evaluations = EvaluationRepository.findAll();
      res.json({
        success: true,
        data: evaluations,
      });
    } catch (err) {
      next(err);
    }
  }

  static getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const evaluation = EvaluationRepository.findById(req.params.id);
      if (!evaluation) {
        throw new AppError(`Evaluation ${req.params.id} not found`, { statusCode: 404, code: 'NOT_FOUND' });
      }
      res.json({
        success: true,
        data: evaluation,
      });
    } catch (err) {
      next(err);
    }
  }

  static start(req: Request, res: Response, next: NextFunction): void {
    try {
      const { fastMode, stageDelayMs } = req.body || {};
      const result = OrchestrationService.startEvaluation(req.params.id, {
        fastMode: fastMode !== undefined ? Boolean(fastMode) : true,
        stageDelayMs: stageDelayMs !== undefined ? Number(stageDelayMs) : undefined,
      });
      res.status(202).json({
        success: true,
        data: {
          evaluationId: req.params.id,
          message: 'Evaluation pipeline dispatched asynchronously in fast-path demo mode.',
          executionId: result.executionId,
          totalStages: result.totalStages,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static streamPipeline(req: Request, res: Response, _next: NextFunction): void {
    const evaluationId = req.params.id;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in reverse proxies

    // Initial snapshot of jobs and orchestrator progress
    const currentJobs = EvaluationRepository.getJobsByEvaluationId(evaluationId);
    const evalData = EvaluationRepository.findById(evaluationId);
    let orchestratorProgress: any = null;
    try {
      orchestratorProgress = EvaluationOrchestrator.getProgress(evaluationId);
    } catch {
      // Orchestrator state may be uninitialized yet
    }

    res.write(`data: ${JSON.stringify({
      type: 'INIT',
      evaluationId,
      status: evalData?.status || 'PROCESSING',
      overallScore: evalData?.overallScore,
      verdict: evalData?.verdict,
      jobs: currentJobs,
      orchestratorProgress,
      timestamp: new Date().toISOString(),
    })}\n\n`);

    const listener = (eventData: any) => {
      if (eventData.evaluationId === evaluationId) {
        if (!eventData.orchestratorProgress) {
          try {
            eventData.orchestratorProgress = EvaluationOrchestrator.getProgress(evaluationId);
          } catch {
            // Optional
          }
        }
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      }
    };

    pipelineStreamEmitter.on('progress', listener);

    // Keep-alive heartbeat every 15s to keep SSE connection alive across proxies
    const heartbeat = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      pipelineStreamEmitter.off('progress', listener);
    });
  }

  static async getQueueStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await pipelineQueue.getStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  static async resumeInterrupted(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pipelineQueue.autoResumeInterruptedJobs();
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async retry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const success = await pipelineQueue.retryJob(req.params.id);
      if (!success) {
        throw new AppError(`Evaluation ${req.params.id} could not be retried`, { statusCode: 404, code: 'NOT_FOUND' });
      }
      res.json({
        success: true,
        data: { id: req.params.id, message: `Evaluation ${req.params.id} re-enqueued for retry.` },
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await pipelineQueue.cancelJob(req.params.id);
      const updated = EvaluationRepository.update(req.params.id, { status: 'FAILED' });
      if (!updated) {
        throw new AppError(`Evaluation ${req.params.id} not found`, { statusCode: 404, code: 'NOT_FOUND' });
      }
      res.json({
        success: true,
        data: { id: req.params.id, status: 'FAILED', message: 'Evaluation canceled by juror.' },
      });
    } catch (err) {
      next(err);
    }
  }

  static getStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const evaluation = EvaluationRepository.findById(req.params.id);
      if (!evaluation) {
        throw new AppError(`Evaluation ${req.params.id} not found`, { statusCode: 404, code: 'NOT_FOUND' });
      }

      const jobs = EvaluationRepository.getJobsByEvaluationId(req.params.id);
      res.json({
        success: true,
        data: {
          evaluationId: evaluation.id,
          status: evaluation.status,
          overallScore: evaluation.overallScore,
          confidence: evaluation.confidence,
          verdict: evaluation.verdict,
          jobs,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static getProjectDNA(req: Request, res: Response, next: NextFunction): void {
    try {
      const dna = AssessmentRepository.getProjectDNA(req.params.id);
      if (!dna) {
        throw new AppError(`Project DNA for evaluation ${req.params.id} not yet generated`, { statusCode: 404 });
      }
      res.json({ success: true, data: dna });
    } catch (err) {
      next(err);
    }
  }

  static getTechnical(req: Request, res: Response, next: NextFunction): void {
    try {
      const technical = AssessmentRepository.getTechnicalAssessments(req.params.id);
      res.json({ success: true, data: technical });
    } catch (err) {
      next(err);
    }
  }

  static getOriginality(req: Request, res: Response, next: NextFunction): void {
    try {
      const originality = AssessmentRepository.getOriginalityAssessment(req.params.id);
      if (!originality) {
        throw new AppError(`Originality assessment for ${req.params.id} not found`, { statusCode: 404 });
      }
      res.json({ success: true, data: originality });
    } catch (err) {
      next(err);
    }
  }

  static getClaims(req: Request, res: Response, next: NextFunction): void {
    try {
      const claims = ClaimRepository.findByEvaluationId(req.params.id);
      res.json({ success: true, data: claims });
    } catch (err) {
      next(err);
    }
  }

  static getImpact(req: Request, res: Response, next: NextFunction): void {
    try {
      const impact = AssessmentRepository.getImpactAssessment(req.params.id);
      const feasibility = AssessmentRepository.getFeasibilityAssessment(req.params.id);
      res.json({ success: true, data: { impact, feasibility } });
    } catch (err) {
      next(err);
    }
  }

  static getPresentation(req: Request, res: Response, next: NextFunction): void {
    try {
      const evaluationId = req.params.id;
      const presentation = AssessmentRepository.getPresentationAnalysis(evaluationId);
      const demo = AssessmentRepository.getDemoAnalysis(evaluationId);

      // Enrich with multimodal video metrics and segments if video is associated
      let videoMetrics = undefined;
      let videoSegments = undefined;
      const videoRow = db.get<any>(`SELECT id FROM videos WHERE evaluation_id = ? LIMIT 1`, evaluationId);
      if (videoRow?.id) {
        videoMetrics = MultimodalRepository.findPresentationMetricsByVideoId(videoRow.id);
        videoSegments = MultimodalRepository.findSegmentsByVideoId(videoRow.id);
      }

      res.json({
        success: true,
        data: {
          presentation,
          demo,
          metrics: videoMetrics,
          segments: videoSegments,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static getJury(req: Request, res: Response, next: NextFunction): void {
    try {
      const evaluation = EvaluationRepository.findById(req.params.id);
      if (!evaluation) throw new AppError(`Evaluation ${req.params.id} not found`, { statusCode: 404 });

      const scores = AssessmentRepository.getScores(req.params.id);
      const judgeQuestions = AssessmentRepository.getJudgeQuestions(req.params.id);
      const recommendations = AssessmentRepository.getRecommendations(req.params.id);
      const risks = AssessmentRepository.getRisks(req.params.id);

      res.json({
        success: true,
        data: {
          overallScore: evaluation.overallScore,
          confidence: evaluation.confidence,
          verdict: evaluation.verdict,
          executiveSummary: evaluation.executiveSummary,
          categoryScores: scores,
          judgeQuestions,
          recommendations,
          risks,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static getReport(req: Request, res: Response, next: NextFunction): void {
    try {
      const report = AssessmentRepository.getReport(req.params.id);
      if (!report) {
        throw new AppError(`Intelligence report for ${req.params.id} not yet generated`, { statusCode: 404 });
      }
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Scenario 8 Mitigation: Expose Single Source of Truth for scoring rubric weights.
   * Prohibits rubric drift across docs, UI, and external evaluators.
   */
  static getCanonicalRubric(_req: Request, res: Response, next: NextFunction): void {
    try {
      const categories = (Object.keys(SCORING_WEIGHTS) as Array<keyof typeof SCORING_WEIGHTS>).map(key => ({
        key,
        label: RUBRIC_LABELS[key],
        weight: SCORING_WEIGHTS[key],
        percentage: Math.round(SCORING_WEIGHTS[key] * 100),
      }));

      const totalWeight = Object.values(SCORING_WEIGHTS).reduce((acc, w) => acc + w, 0);
      const isValid = validateWeights();

      res.json({
        success: true,
        data: {
          categories,
          totalWeight: Math.round(totalWeight * 1000) / 1000,
          totalPercentage: Math.round(totalWeight * 100),
          isValid,
          singleSourceOfTruth: 'backend/src/config/scoringWeights.ts',
          version: '1.0.0',
        },
      });
    } catch (err) {
      next(err);
    }
  }
}


import type { Request, Response, NextFunction } from 'express';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { AssessmentRepository } from '../repositories/assessmentRepository';
import { ClaimRepository } from '../repositories/claimRepository';
import { OrchestrationService } from '../pipeline/orchestrationService';
import { AppError } from '../middleware/errorHandler';

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
      const result = OrchestrationService.startEvaluation(req.params.id);
      res.status(202).json({
        success: true,
        data: {
          evaluationId: req.params.id,
          message: 'Evaluation pipeline dispatched asynchronously.',
          executionId: result.executionId,
          totalStages: result.totalStages,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static cancel(req: Request, res: Response, next: NextFunction): void {
    try {
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
      const presentation = AssessmentRepository.getPresentationAnalysis(req.params.id);
      const demo = AssessmentRepository.getDemoAnalysis(req.params.id);
      res.json({ success: true, data: { presentation, demo } });
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
}

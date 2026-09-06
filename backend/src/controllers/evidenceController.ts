import type { Request, Response, NextFunction } from 'express';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { EvidenceGraphService } from '../evidence/evidenceGraphService';
import { AppError } from '../middleware/errorHandler';

export class EvidenceController {
  static getByEvaluationId(req: Request, res: Response, next: NextFunction): void {
    try {
      const evidence = EvidenceRepository.findByEvaluationId(req.params.id);
      res.json({
        success: true,
        data: evidence,
      });
    } catch (err) {
      next(err);
    }
  }

  static getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const item = EvidenceRepository.findById(req.params.id);
      if (!item) {
        throw new AppError(`Evidence ${req.params.id} not found`, { statusCode: 404 });
      }
      res.json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  static getScoreLineage(req: Request, res: Response, next: NextFunction): void {
    try {
      const lineage = EvidenceGraphService.getLineageForScore(
        req.params.evaluationId,
        req.params.categoryKey
      );
      if (!lineage) {
        throw new AppError(`Lineage for score category ${req.params.categoryKey} not found`, { statusCode: 404 });
      }
      res.json({
        success: true,
        data: lineage,
      });
    } catch (err) {
      next(err);
    }
  }

  static getClaimLineage(req: Request, res: Response, next: NextFunction): void {
    try {
      const lineage = EvidenceGraphService.getLineageForClaim(req.params.claimId);
      if (!lineage) {
        throw new AppError(`Lineage for claim ${req.params.claimId} not found`, { statusCode: 404 });
      }
      res.json({
        success: true,
        data: lineage,
      });
    } catch (err) {
      next(err);
    }
  }

  static getOriginalityLineage(req: Request, res: Response, next: NextFunction): void {
    try {
      const lineage = EvidenceGraphService.getOriginalitySources(req.params.evaluationId);
      if (!lineage) {
        throw new AppError(`Originality lineage for evaluation ${req.params.evaluationId} not found`, { statusCode: 404 });
      }
      res.json({
        success: true,
        data: lineage,
      });
    } catch (err) {
      next(err);
    }
  }
}

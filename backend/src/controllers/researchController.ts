import type { Request, Response, NextFunction } from 'express';
import { ResearchRepository } from '../repositories/researchRepository';

export class ResearchController {
  static getByEvaluationId(req: Request, res: Response, next: NextFunction): void {
    try {
      const sources = ResearchRepository.findSourcesByEvaluationId(req.params.id);
      const findings = ResearchRepository.findFindingsByEvaluationId(req.params.id);
      res.json({
        success: true,
        data: {
          sources,
          findings,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

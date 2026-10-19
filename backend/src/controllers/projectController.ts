import type { Request, Response, NextFunction } from 'express';
import { ProjectRepository } from '../repositories/projectRepository';
import { AppError } from '../middleware/errorHandler';

export class ProjectController {
  static create(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = req.body.id || req.body.slug || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const project = ProjectRepository.create({
        name: req.body.name || req.body.title || 'Untitled Project',
        architectureType: req.body.architectureType || req.body.type || 'SOFTWARE',
        category: req.body.category || 'AI / Software',
        domain: req.body.domain || 'General Technology',
        tagline: req.body.tagline || '',
        problemStatement: req.body.problemStatement || '',
        solutionDescription: req.body.solutionDescription || req.body.description || '',
        teamName: req.body.teamName || req.body.team || 'Engineering Team',
        ...req.body,
        id,
      });

      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (err) {
      next(err);
    }
  }

  static getAll(_req: Request, res: Response, next: NextFunction): void {
    try {
      const projects = ProjectRepository.findAll();
      res.json({
        success: true,
        data: projects,
      });
    } catch (err) {
      next(err);
    }
  }

  static getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const project = ProjectRepository.findById(req.params.id);
      if (!project) {
        throw new AppError(`Project ${req.params.id} not found`, { statusCode: 404, code: 'NOT_FOUND' });
      }
      res.json({
        success: true,
        data: project,
      });
    } catch (err) {
      next(err);
    }
  }

  static update(req: Request, res: Response, next: NextFunction): void {
    try {
      const updated = ProjectRepository.update(req.params.id, req.body);
      if (!updated) {
        throw new AppError(`Project ${req.params.id} not found`, { statusCode: 404, code: 'NOT_FOUND' });
      }
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static delete(req: Request, res: Response, next: NextFunction): void {
    try {
      const success = ProjectRepository.delete(req.params.id);
      if (!success) {
        throw new AppError(`Project ${req.params.id} not found`, { statusCode: 404, code: 'NOT_FOUND' });
      }
      res.json({
        success: true,
        data: { id: req.params.id, deleted: true },
      });
    } catch (err) {
      next(err);
    }
  }
}

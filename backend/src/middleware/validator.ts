import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';
import { AppError } from './errorHandler';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        next(
          new AppError('Validation Error', {
            statusCode: 400,
            code: 'VALIDATION_FAILED',
            details: error.flatten().fieldErrors,
          })
        );
      } else {
        next(error);
      }
    }
  };
}

export const CreateProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  architectureType: z.enum(['SOFTWARE', 'HARDWARE']),
  category: z.string().min(2),
  domain: z.string().min(2),
  tagline: z.string().optional(),
  problemStatement: z.string().min(10, 'Problem statement must be at least 10 characters'),
  solutionDescription: z.string().min(10, 'Solution description must be at least 10 characters'),
  teamName: z.string().min(2),
});

export const CreateEvaluationSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  mode: z.enum(['LIVE_CAMERA', 'VIDEO_ANALYSIS']).default('VIDEO_ANALYSIS'),
});

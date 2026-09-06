import type { Request, Response, NextFunction } from 'express';

export interface AppErrorOptions {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, options?: AppErrorOptions) {
    super(message);
    this.name = 'AppError';
    this.statusCode = options?.statusCode || 500;
    this.code = options?.code || 'INTERNAL_SERVER_ERROR';
    this.details = options?.details;
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected server error occurred.';

  if (statusCode >= 500) {
    console.error(`[Error Handler] ${code}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || undefined,
    },
  });
}

import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const executionId = req.headers['x-execution-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  (req as any).executionId = executionId;
  res.setHeader('X-Execution-Id', executionId as string);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[API ${req.method}] ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms) [ExecID: ${executionId}]`
    );
  });

  next();
}

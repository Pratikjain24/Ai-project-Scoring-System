// ====================================================
// PROJECTX-RAY AI - ENTERPRISE STRUCTURED LOGGER & TELEMETRY
// Production-grade Winston/Pino-compatible Structured Logger
// Features AsyncLocalStorage Request Tracing, JSON & Pretty Output,
// Child Module Loggers, Error Serialization, and Telemetry Buffering
// ====================================================

import { AsyncLocalStorage } from 'node:async_hooks';
import type { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  executionId?: string;
  userId?: string;
  evaluationId?: string;
  module?: string;
  [key: string]: any;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: string;
  message: string;
  module?: string;
  requestId?: string;
  executionId?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
  };
}

const LOG_LEVEL_HIERARCHY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// AsyncLocalStorage to automatically bind Execution/Request IDs across async contexts
export const loggerContextStorage = new AsyncLocalStorage<LogContext>();

export class StructuredLogger {
  private moduleName?: string;
  private defaultMeta?: Record<string, any>;
  private static recentLogs: StructuredLogEntry[] = [];
  private static maxRecentLogs = 1000;

  constructor(moduleName?: string, defaultMeta?: Record<string, any>) {
    this.moduleName = moduleName;
    this.defaultMeta = defaultMeta;
  }

  /**
   * Spawns a child logger with bound module name and persistent metadata
   */
  child(options: { module?: string; [key: string]: any }): StructuredLogger {
    const { module, ...meta } = options;
    return new StructuredLogger(module || this.moduleName, {
      ...this.defaultMeta,
      ...meta,
    });
  }

  /**
   * Runs an async callback inside an active request/execution context
   */
  runWithContext<T>(context: LogContext, fn: () => T): T {
    return loggerContextStorage.run(context, fn);
  }

  /**
   * Retrieves the current context from AsyncLocalStorage
   */
  getContext(): LogContext | undefined {
    return loggerContextStorage.getStore();
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  error(message: string, errorOrMeta?: any, explicitError?: Error): void {
    let errorObj: Error | undefined;
    let meta: any = undefined;

    if (errorOrMeta instanceof Error) {
      errorObj = errorOrMeta;
    } else if (explicitError instanceof Error) {
      errorObj = explicitError;
      meta = errorOrMeta;
    } else if (typeof errorOrMeta === 'object' && errorOrMeta !== null) {
      if (errorOrMeta.err instanceof Error) {
        errorObj = errorOrMeta.err;
      } else if (errorOrMeta.error instanceof Error) {
        errorObj = errorOrMeta.error;
      } else {
        meta = errorOrMeta;
      }
    } else {
      meta = errorOrMeta;
    }

    this.log('error', message, meta, errorObj);
  }

  private log(level: LogLevel, message: string, meta?: any, err?: Error): void {
    const configuredLevel = (ENV.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
    const minRank = LOG_LEVEL_HIERARCHY[configuredLevel] ?? 1;
    const currentRank = LOG_LEVEL_HIERARCHY[level] ?? 1;

    if (currentRank < minRank) {
      return;
    }

    const context = loggerContextStorage.getStore() || {};
    const executionId = context.executionId || context.requestId || meta?.executionId || meta?.requestId;
    const module = this.moduleName || context.module || meta?.module;

    const combined = { ...this.defaultMeta, ...(meta && typeof meta === 'object' ? meta : {}) };
    let cleanMeta: any = undefined;
    if (Object.keys(combined).length > 0) {
      const { executionId: _e, requestId: _r, module: _m, ...rest } = combined;
      cleanMeta = Object.keys(rest).length > 0 ? rest : undefined;
    }

    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...(module ? { module } : {}),
      ...(executionId ? { executionId, requestId: executionId } : {}),
      ...(cleanMeta ? { metadata: cleanMeta } : {}),
      ...(err
        ? {
            error: {
              name: err.name,
              message: err.message,
              stack: err.stack,
              code: (err as any).code,
            },
          }
        : {}),
    };

    // Keep circular buffer for live telemetry inspection
    StructuredLogger.recentLogs.push(entry);
    if (StructuredLogger.recentLogs.length > StructuredLogger.maxRecentLogs) {
      StructuredLogger.recentLogs.shift();
    }

    const logFormat = process.env.LOG_FORMAT || (ENV.NODE_ENV === 'production' ? 'json' : 'pretty');

    if (logFormat === 'json') {
      const jsonStr = JSON.stringify(entry);
      if (level === 'error') {
        process.stderr.write(jsonStr + '\n');
      } else {
        process.stdout.write(jsonStr + '\n');
      }
    } else {
      // Pretty developer output
      const parts: string[] = [];
      parts.push(`[${entry.timestamp}]`);
      parts.push(`[${entry.level}]`);
      if (entry.module) parts.push(`[${entry.module}]`);
      if (entry.executionId) parts.push(`[ExecID: ${entry.executionId}]`);
      parts.push(message);

      if (cleanMeta && Object.keys(cleanMeta).length > 0) {
        parts.push(JSON.stringify(cleanMeta));
      }

      const line = parts.join(' ');
      if (level === 'error') {
        console.error(line);
        if (err?.stack) console.error(err.stack);
      } else if (level === 'warn') {
        console.warn(line);
      } else {
        console.log(line);
      }
    }
  }

  /**
   * Retrieves recent structured logs for telemetry queries
   */
  static getRecentLogs(filter: {
    level?: string;
    module?: string;
    executionId?: string;
    limit?: number;
  } = {}): StructuredLogEntry[] {
    let result = [...this.recentLogs];

    if (filter.level) {
      const lvl = filter.level.toUpperCase();
      result = result.filter((l) => l.level === lvl);
    }
    if (filter.module) {
      result = result.filter((l) => l.module?.toLowerCase().includes(filter.module!.toLowerCase()));
    }
    if (filter.executionId) {
      result = result.filter((l) => l.executionId === filter.executionId || l.requestId === filter.executionId);
    }

    const limit = filter.limit || 100;
    return result.slice(-limit).reverse();
  }

  /**
   * Clears in-memory telemetry buffer (useful for unit tests)
   */
  static clearRecentLogs(): void {
    this.recentLogs = [];
  }
}

// Global root logger
export const logger = new StructuredLogger();

// Factory helper
export function createModuleLogger(moduleName: string, defaultMeta?: Record<string, any>): StructuredLogger {
  return new StructuredLogger(moduleName, defaultMeta);
}

/**
 * Express HTTP Request Logger Middleware with Execution ID injection & AsyncLocalStorage binding
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const executionId =
    (req.headers['x-execution-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  (req as any).executionId = executionId;
  res.setHeader('X-Execution-Id', executionId);

  const context: LogContext = {
    executionId,
    requestId: executionId,
    module: 'HTTP',
    path: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip,
  };

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 500;
    const isWarn = res.statusCode >= 400 && res.statusCode < 500;
    const logMethod = isError ? logger.error.bind(logger) : isWarn ? logger.warn.bind(logger) : logger.info.bind(logger);

    logMethod(
      `[API ${req.method}] ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms) [ExecID: ${executionId}]`,
      {
        module: 'HTTP',
        executionId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
      }
    );
  });

  loggerContextStorage.run(context, () => {
    next();
  });
}

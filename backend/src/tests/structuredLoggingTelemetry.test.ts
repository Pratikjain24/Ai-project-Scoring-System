import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  StructuredLogger,
  logger,
  createModuleLogger,
  loggerContextStorage,
  requestLogger,
  type StructuredLogEntry,
} from '../utils/logger';
import { app } from '../server';

describe('Phase 12b: Enterprise Structured Logger & Telemetry Test Suite', () => {
  beforeEach(() => {
    StructuredLogger.clearRecentLogs();
  });

  it('1. StructuredLogger logs messages across all levels and records to in-memory telemetry buffer', () => {
    const testLogger = createModuleLogger('TestModule');

    testLogger.debug('Debug message test');
    testLogger.info('Info message test', { key: 'value1', count: 42 });
    testLogger.warn('Warning message test', { warningCode: 'WARN_001' });
    testLogger.error('Error message test', { errorCode: 'ERR_001' }, new Error('Sample error failure'));

    const logs = StructuredLogger.getRecentLogs({ limit: 10 });
    assert.ok(logs.length >= 3, 'Should record logged entries');

    const infoEntry = logs.find((l) => l.message.includes('Info message test'));
    assert.ok(infoEntry, 'Info log should be recorded');
    assert.strictEqual(infoEntry.level, 'INFO');
    assert.strictEqual(infoEntry.module, 'TestModule');
    assert.strictEqual(infoEntry.metadata?.key, 'value1');
    assert.strictEqual(infoEntry.metadata?.count, 42);

    const errorEntry = logs.find((l) => l.message.includes('Error message test'));
    assert.ok(errorEntry, 'Error log should be recorded');
    assert.strictEqual(errorEntry.level, 'ERROR');
    assert.strictEqual(errorEntry.error?.message, 'Sample error failure');
    assert.ok(errorEntry.error?.stack, 'Error stack must be preserved');
  });

  it('2. AsyncLocalStorage automatically propagates Request ID / Execution ID across async tasks', async () => {
    const testExecutionId = 'exec_test_async_storage_999';

    await loggerContextStorage.run(
      { executionId: testExecutionId, requestId: testExecutionId, module: 'AsyncContextTest' },
      async () => {
        logger.info('Message emitted from inside async context');

        // Verify nested child logger inherits context
        const subModuleLogger = createModuleLogger('SubTaskModule');
        subModuleLogger.warn('Warning from nested child logger');
      }
    );

    const logs = StructuredLogger.getRecentLogs({ executionId: testExecutionId });
    assert.strictEqual(logs.length, 2, 'Both logs should inherit the AsyncLocalStorage executionId');
    assert.strictEqual(logs[0].executionId, testExecutionId);
    assert.strictEqual(logs[1].executionId, testExecutionId);
  });

  it('3. StructuredLogger.child creates nested scoped loggers with default metadata', () => {
    const childLogger = logger.child({ module: 'PaymentAudit', tenantId: 'tenant_abc' });
    childLogger.info('Transaction processed', { amount: 1500 });

    const logs = StructuredLogger.getRecentLogs({ module: 'PaymentAudit' });
    assert.ok(logs.length >= 1);
    assert.strictEqual(logs[0].module, 'PaymentAudit');
    assert.strictEqual(logs[0].metadata?.tenantId, 'tenant_abc');
    assert.strictEqual(logs[0].metadata?.amount, 1500);
  });

  it('4. Telemetry filter queries logs by level, module, and limit', () => {
    const logA = createModuleLogger('ModuleA');
    const logB = createModuleLogger('ModuleB');

    logA.info('ModuleA Info 1');
    logA.warn('ModuleA Warn 1');
    logB.info('ModuleB Info 1');
    logB.error('ModuleB Error 1');

    const warnLogs = StructuredLogger.getRecentLogs({ level: 'WARN' });
    assert.ok(warnLogs.every((l) => l.level === 'WARN'));

    const moduleBLogs = StructuredLogger.getRecentLogs({ module: 'ModuleB' });
    assert.ok(moduleBLogs.every((l) => l.module === 'ModuleB'));

    const limitedLogs = StructuredLogger.getRecentLogs({ limit: 2 });
    assert.strictEqual(limitedLogs.length, 2);
  });

  it('5. requestLogger Express middleware generates and injects X-Execution-Id header', async () => {
    let finishHandler: (() => void) | null = null;
    const req: any = {
      headers: {},
      method: 'GET',
      originalUrl: '/api/test/telemetry',
      url: '/api/test/telemetry',
      ip: '127.0.0.1',
    };

    const res: any = {
      headers: {} as Record<string, string>,
      setHeader: (key: string, val: string) => {
        res.headers[key] = val;
      },
      statusCode: 200,
      on: (event: string, callback: () => void) => {
        if (event === 'finish') {
          finishHandler = callback;
        }
      },
    };

    await new Promise<void>((resolve) => {
      requestLogger(req, res, () => {
        resolve();
      });
    });

    assert.ok(req.executionId, 'Execution ID should be attached to request');
    assert.strictEqual(res.headers['X-Execution-Id'], req.executionId);

    // Trigger finish
    if (finishHandler) {
      (finishHandler as () => void)();
    }

    const logs = StructuredLogger.getRecentLogs({ module: 'HTTP' });
    assert.ok(logs.length >= 1, 'HTTP request must be logged on finish');
    assert.strictEqual(logs[0].executionId, req.executionId);
  });

  it('6. Admin telemetry endpoint GET /api/admin/logs returns structured logs with query filters', async () => {
    logger.info('System log for admin test', { adminCheck: true });

    // Simulate Express request / response
    const mockReq: any = {
      query: { limit: '5' },
    };

    let responseData: any = null;
    let responseStatus = 0;

    const mockRes: any = {
      status: (code: number) => {
        responseStatus = code;
        return mockRes;
      },
      json: (data: any) => {
        responseData = data;
      },
    };

    const { AdminController } = await import('../controllers/adminController');
    AdminController.getSystemLogs(mockReq, mockRes);

    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.success, true);
    assert.ok(Array.isArray(responseData.data.logs));
    assert.ok(responseData.data.total >= 1);
  });
});

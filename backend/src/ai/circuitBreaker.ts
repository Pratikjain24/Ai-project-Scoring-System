// ====================================================
// PROJECTX-RAY AI - CIRCUIT BREAKER ENGINE
// Mitigates Scenario 10: Provider Cascades & Fault Isolation
// ====================================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;       // Consecutive failures before opening (default: 3)
  recoveryTimeoutMs?: number;      // Time to wait before attempting half-open probe (default: 15000ms)
  halfOpenMaxProbes?: number;      // Successful probes required to reset to closed (default: 1)
  name?: string;
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  totalExecutions: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  trippedCount: number;
}

export class CircuitBreakerError extends Error {
  constructor(public readonly providerName: string, message: string) {
    super(`[CircuitBreaker: ${providerName}] ${message}`);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private totalExecutions = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private trippedCount = 0;

  private readonly failureThreshold: number;
  private readonly recoveryTimeoutMs: number;
  private readonly halfOpenMaxProbes: number;
  public readonly name: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs ?? 15000;
    this.halfOpenMaxProbes = options.halfOpenMaxProbes ?? 1;
    this.name = options.name ?? 'DefaultCircuitBreaker';
  }

  getState(): CircuitState {
    if (this.state === 'OPEN' && this.lastFailureTime) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.recoveryTimeoutMs) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.getState(),
      failures: this.failureCount,
      successes: this.successCount,
      totalExecutions: this.totalExecutions,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      trippedCount: this.trippedCount,
    };
  }

  trip(): void {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
    this.trippedCount++;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    const currentState = this.getState();
    this.totalExecutions++;

    if (currentState === 'OPEN') {
      const waitTime = Math.max(0, this.recoveryTimeoutMs - (Date.now() - (this.lastFailureTime || 0)));
      throw new CircuitBreakerError(
        this.name,
        `Circuit is OPEN. Requests blocked for recovery (${Math.ceil(waitTime / 1000)}s remaining).`
      );
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (err: any) {
      this.recordFailure(err);
      throw err;
    }
  }

  private recordSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.halfOpenMaxProbes) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private recordFailure(err: any): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;

    // Immediate trip on Rate Limit (HTTP 429) or Authentication (HTTP 401)
    const isRateLimit = err?.status === 429 || err?.statusCode === 429 || String(err?.message).includes('429');
    const isAuthError = err?.status === 401 || err?.statusCode === 401 || String(err?.message).includes('401');

    if (isRateLimit || isAuthError || this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.trip();
    }
  }
}

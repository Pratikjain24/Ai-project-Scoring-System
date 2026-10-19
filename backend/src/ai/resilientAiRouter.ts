// ====================================================
// PROJECTX-RAY AI - RESILIENT AI ROUTER
// Mitigates Scenario 10: False Security & Provider Cascades
// Multi-Tier Circuit-Breaker Routing with Failover & Cost Tracking
// ====================================================

import type {
  AIProvider,
  TextGenerationOptions,
  TranscriptionResult,
  VideoAnalysisResult,
  ModerationResult,
  ProviderPingResult,
  ModelTier,
} from './aiProvider.interface';
import { CircuitBreaker } from './circuitBreaker';
import { MockAIProvider } from './mockAiProvider';
import { UsageTracker } from '../services/usageTracker';

export interface ProviderEntry {
  provider: AIProvider;
  circuitBreaker: CircuitBreaker;
  priority: number;
}

export interface ResilientRouterTelemetry {
  totalRequests: number;
  primarySuccesses: number;
  failoverSuccesses: number;
  mockFallbackCount: number;
  lastUsedProvider: string | null;
  providerStates: {
    name: string;
    tier?: ModelTier;
    state: string;
    failures: number;
    trippedCount: number;
    isConfigured: boolean;
  }[];
}

export class ResilientAiRouter implements AIProvider {
  public readonly name = 'Resilient Multi-Provider AI Router';
  private providers: ProviderEntry[] = [];
  private fallbackProvider: AIProvider;

  private totalRequests = 0;
  private primarySuccesses = 0;
  private failoverSuccesses = 0;
  private mockFallbackCount = 0;
  private lastUsedProvider: string | null = null;

  constructor(providers: AIProvider[] = [], fallbackProvider?: AIProvider) {
    this.fallbackProvider = fallbackProvider || new MockAIProvider();
    providers.forEach((p, idx) => {
      this.providers.push({
        provider: p,
        circuitBreaker: new CircuitBreaker({ name: p.name, failureThreshold: 3, recoveryTimeoutMs: 15000 }),
        priority: idx + 1,
      });
    });
  }

  addProvider(provider: AIProvider, priority?: number): void {
    this.providers.push({
      provider,
      circuitBreaker: new CircuitBreaker({ name: provider.name, failureThreshold: 3, recoveryTimeoutMs: 15000 }),
      priority: priority ?? this.providers.length + 1,
    });
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  getTelemetry(): ResilientRouterTelemetry {
    return {
      totalRequests: this.totalRequests,
      primarySuccesses: this.primarySuccesses,
      failoverSuccesses: this.failoverSuccesses,
      mockFallbackCount: this.mockFallbackCount,
      lastUsedProvider: this.lastUsedProvider,
      providerStates: this.providers.map(p => ({
        name: p.provider.name,
        tier: p.provider.tier,
        state: p.circuitBreaker.getState(),
        failures: p.circuitBreaker.getMetrics().failures,
        trippedCount: p.circuitBreaker.getMetrics().trippedCount,
        isConfigured: typeof p.provider.isConfigured === 'function' ? p.provider.isConfigured() : true,
      })),
    };
  }

  /**
   * Health ping diagnostics across all active and fallback providers
   */
  async testAllProviders(): Promise<ProviderPingResult[]> {
    const probePromises = this.providers.map(async (entry) => {
      if (typeof entry.provider.ping === 'function') {
        try {
          return await entry.provider.ping();
        } catch (err: any) {
          return {
            healthy: false,
            latencyMs: 0,
            provider: entry.provider.name,
            error: err?.message || 'Ping failed',
          };
        }
      }
      return {
        healthy: true,
        latencyMs: 1,
        provider: entry.provider.name,
      };
    });

    if (this.fallbackProvider && typeof this.fallbackProvider.ping === 'function') {
      probePromises.push(
        this.fallbackProvider.ping().catch((err: any) => ({
          healthy: false,
          latencyMs: 0,
          provider: this.fallbackProvider.name,
          error: err?.message || 'Ping failed',
        }))
      );
    }

    return Promise.all(probePromises);
  }

  /**
   * Manual administrative circuit breaker reset
   */
  resetCircuit(providerName: string): boolean {
    if (providerName.toLowerCase() === 'all') {
      this.providers.forEach(p => p.circuitBreaker.reset());
      return true;
    }
    const target = this.providers.find(
      p => p.provider.name.toLowerCase().includes(providerName.toLowerCase())
    );
    if (target) {
      target.circuitBreaker.reset();
      return true;
    }
    return false;
  }

  /**
   * Manual administrative circuit breaker trip (for chaos engineering & testing)
   */
  tripCircuit(providerName: string): boolean {
    const target = this.providers.find(
      p => p.provider.name.toLowerCase().includes(providerName.toLowerCase())
    );
    if (target) {
      target.circuitBreaker.trip();
      return true;
    }
    return false;
  }

  /**
   * Cleans LLM markdown code blocks (```json ... ```) or conversational prefix/suffix
   */
  static sanitizeJsonResponse(rawText: string): string {
    let text = rawText.trim();
    // Remove markdown code fences if present
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // If there is conversational preamble before the first { or [, slice to the boundary
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
    }

    if (startIdx > 0) {
      text = text.slice(startIdx);
    }

    // Slice to the last } or ]
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);
    if (endIdx !== -1 && endIdx < text.length - 1) {
      text = text.slice(0, endIdx + 1);
    }

    return text;
  }

  /**
   * Exponential backoff with full jitter: delay = min(cap, base * 2^attempt + jitter)
   * Mitigates Viva Q3: Mid-evaluation rate limits & transient retries
   */
  static calculateBackoffDelay(attempt: number, baseMs: number = 200, capMs: number = 2000): number {
    const exponential = Math.min(capMs, baseMs * Math.pow(2, attempt));
    const jitter = Math.random() * (exponential * 0.25); // 25% random jitter
    return Math.floor(exponential + jitter);
  }

  private trackUsage(
    providerName: string,
    operation: string,
    promptLen: number,
    outputLen: number,
    durationMs: number,
    evaluationId?: string
  ): void {
    try {
      const tokensIn = Math.max(1, Math.ceil(promptLen / 4));
      const tokensOut = Math.max(1, Math.ceil(outputLen / 4));
      UsageTracker.track(
        evaluationId || 'system',
        providerName,
        operation,
        tokensIn,
        tokensOut,
        durationMs
      );
    } catch {
      // Non-critical telemetry logging should never abort main response
    }
  }

  private getOrderedEntries(requestedTier?: ModelTier): ProviderEntry[] {
    if (!requestedTier) {
      return [...this.providers].sort((a, b) => a.priority - b.priority);
    }
    // Sort preferring requested tier first, then by priority
    return [...this.providers].sort((a, b) => {
      const aMatches = a.provider.tier === requestedTier;
      const bMatches = b.provider.tier === requestedTier;
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return a.priority - b.priority;
    });
  }

  private async executeWithFallback<T>(
    operationName: string,
    action: (provider: AIProvider) => Promise<T>,
    options?: { tier?: ModelTier; evaluationId?: string; promptLength?: number }
  ): Promise<T> {
    this.totalRequests++;
    const errors: string[] = [];
    const orderedEntries = this.getOrderedEntries(options?.tier);

    for (let i = 0; i < orderedEntries.length; i++) {
      const entry = orderedEntries[i];
      if (entry.circuitBreaker.getState() === 'OPEN') {
        continue; // Circuit open, skip to next provider
      }

      // Attempt execution with transient exponential backoff retry (up to 2 attempts)
      for (let attempt = 0; attempt < 2; attempt++) {
        const startTime = Date.now();
        try {
          const result = await entry.circuitBreaker.execute(() => action(entry.provider));
          const durationMs = Date.now() - startTime;
          this.lastUsedProvider = entry.provider.name;
          if (i === 0) {
            this.primarySuccesses++;
          } else {
            this.failoverSuccesses++;
          }

          const resultLen = typeof result === 'string' ? result.length : JSON.stringify(result).length;
          this.trackUsage(
            entry.provider.name,
            operationName,
            options?.promptLength || 100,
            resultLen,
            durationMs,
            options?.evaluationId
          );

          return result;
        } catch (err: any) {
          const isTransient = err?.status === 429 || err?.status === 503 || String(err?.message).includes('429');
          if (isTransient && attempt === 0 && entry.circuitBreaker.getState() !== 'OPEN') {
            const delay = ResilientAiRouter.calculateBackoffDelay(attempt);
            await new Promise(res => setTimeout(res, delay));
            continue; // retry once with backoff
          }
          errors.push(`${entry.provider.name}: ${err?.message || err}`);
          break; // break retry loop and cascade to next provider
        }
      }
    }

    // All active providers failed or all circuits open; use deterministic fallback
    this.mockFallbackCount++;
    this.lastUsedProvider = this.fallbackProvider.name;
    const fallbackStart = Date.now();
    try {
      const result = await action(this.fallbackProvider);
      const durationMs = Date.now() - fallbackStart;
      const resultLen = typeof result === 'string' ? result.length : JSON.stringify(result).length;
      this.trackUsage(
        this.fallbackProvider.name,
        operationName,
        options?.promptLength || 100,
        resultLen,
        durationMs,
        options?.evaluationId
      );
      return result;
    } catch (fallbackErr: any) {
      throw new Error(
        `[ResilientAiRouter] All providers and fallback failed for ${operationName}.\nErrors: ${errors.join('; ')}\nFallback: ${fallbackErr?.message}`
      );
    }
  }

  async generateText(prompt: string, options?: TextGenerationOptions): Promise<string> {
    return this.executeWithFallback(
      options?.operationName || 'generateText',
      async (provider) => {
        const result = await provider.generateText(prompt, options);
        if (options?.jsonMode) {
          return ResilientAiRouter.sanitizeJsonResponse(result);
        }
        return result;
      },
      { tier: options?.tier, evaluationId: options?.evaluationId, promptLength: prompt.length }
    );
  }

  async analyzeImage(imageSource: string | Buffer, prompt: string): Promise<string> {
    return this.executeWithFallback(
      'analyzeImage',
      (p) => p.analyzeImage(imageSource, prompt),
      { promptLength: prompt.length }
    );
  }

  async analyzeVideo(videoSource: string, prompt: string): Promise<VideoAnalysisResult> {
    return this.executeWithFallback(
      'analyzeVideo',
      (p) => p.analyzeVideo(videoSource, prompt),
      { promptLength: prompt.length }
    );
  }

  async transcribeAudio(audioSource: string): Promise<TranscriptionResult> {
    return this.executeWithFallback('transcribeAudio', (p) => p.transcribeAudio(audioSource));
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.executeWithFallback(
      'generateEmbedding',
      (p) => p.generateEmbedding(text),
      { promptLength: text.length }
    );
  }

  async moderateContent(text: string): Promise<ModerationResult> {
    return this.executeWithFallback(
      'moderateContent',
      (p) => p.moderateContent(text),
      { promptLength: text.length }
    );
  }

  async generateStructuredOutput<T>(prompt: string, schema?: any): Promise<T> {
    return this.executeWithFallback(
      'generateStructuredOutput',
      async (p) => {
        if (p.generateStructuredOutput) {
          return p.generateStructuredOutput<T>(prompt, schema);
        }
        const raw = await p.generateText(prompt, { jsonMode: true });
        const sanitized = ResilientAiRouter.sanitizeJsonResponse(raw);
        return JSON.parse(sanitized) as T;
      },
      { promptLength: prompt.length }
    );
  }
}

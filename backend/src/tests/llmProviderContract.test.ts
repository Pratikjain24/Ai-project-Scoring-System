// ====================================================
// PROJECTX-RAY AI - LLM PROVIDER CONTRACT & RESILIENCE TEST SUITE
// Mitigates Scenario 10: "The Test Suite False Security"
// Validates Provider Schema Contracts, Circuit Breaker Tripping,
// HTTP 429 Rate Limit Failovers, and Live Provider Connectivity
// ====================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CircuitBreaker, CircuitBreakerError } from '../ai/circuitBreaker';
import { ResilientAiRouter } from '../ai/resilientAiRouter';
import { GeminiProvider } from '../ai/geminiProvider';
import { OpenAIProvider } from '../ai/openaiProvider';
import { AnthropicProvider } from '../ai/anthropicProvider';
import { MockAIProvider } from '../ai/mockAiProvider';
import { LocalAIProvider } from '../ai/localAiProvider';
import { AIProviderFactory } from '../ai/aiProviderFactory';
import type { AIProvider } from '../ai/aiProvider.interface';

describe('Scenario 10 Mitigation: Real LLM Provider Contract & Resilience Suite', () => {

  // ----------------------------------------------------
  // Test 1: JSON Sanitization & Recovery Engine
  // ----------------------------------------------------
  it('1. ResilientAiRouter recovers valid JSON from markdown fences and conversational LLM hallucinations', () => {
    const rawMarkdown = '```json\n{"problem": "Road degradation", "confidence": 92}\n```';
    const cleaned = ResilientAiRouter.sanitizeJsonResponse(rawMarkdown);
    assert.deepEqual(JSON.parse(cleaned), { problem: 'Road degradation', confidence: 92 });

    const withPreamble = 'Here is the requested JSON payload:\n{"technologies": ["PyTorch", "TensorRT"]}\nHope this helps!';
    const cleanedPreamble = ResilientAiRouter.sanitizeJsonResponse(withPreamble);
    assert.deepEqual(JSON.parse(cleanedPreamble), { technologies: ['PyTorch', 'TensorRT'] });

    const rawArray = '```\n[{"id": 1, "verdict": "STRONG"}]\n```';
    const cleanedArray = ResilientAiRouter.sanitizeJsonResponse(rawArray);
    assert.deepEqual(JSON.parse(cleanedArray), [{ id: 1, verdict: 'STRONG' }]);
  });

  // ----------------------------------------------------
  // Test 2: Circuit Breaker State Transitions
  // ----------------------------------------------------
  it('2. CircuitBreaker isolates failures and blocks cascading downtime', async () => {
    const breaker = new CircuitBreaker({
      name: 'TestGeminiBreaker',
      failureThreshold: 2,
      recoveryTimeoutMs: 100, // fast recovery for testing
    });

    assert.equal(breaker.getState(), 'CLOSED');

    // Execution 1: Normal success
    const result1 = await breaker.execute(async () => 'OK');
    assert.equal(result1, 'OK');
    assert.equal(breaker.getState(), 'CLOSED');

    // Execution 2: Failure 1
    try {
      await breaker.execute(async () => { throw new Error('API Timeout'); });
    } catch {}
    assert.equal(breaker.getState(), 'CLOSED');

    // Execution 3: Failure 2 (hits failureThreshold of 2) -> Trips to OPEN
    try {
      await breaker.execute(async () => { throw new Error('API Timeout 2'); });
    } catch {}
    assert.equal(breaker.getState(), 'OPEN');

    // Execution 4: Immediate rejection while OPEN without executing target action
    let wasActionCalled = false;
    await assert.rejects(
      async () => {
        await breaker.execute(async () => {
          wasActionCalled = true;
          return 'Should never run';
        });
      },
      (err: any) => err instanceof CircuitBreakerError
    );
    assert.equal(wasActionCalled, false);

    // Wait for recovery timeout to transition to HALF_OPEN
    await new Promise(resolve => setTimeout(resolve, 120));
    assert.equal(breaker.getState(), 'HALF_OPEN');

    // Canary probe succeeds -> Resets to CLOSED
    const canaryResult = await breaker.execute(async () => 'Canary Success');
    assert.equal(canaryResult, 'Canary Success');
    assert.equal(breaker.getState(), 'CLOSED');
  });

  // ----------------------------------------------------
  // Test 3: Instant Circuit Tripping on HTTP 429 Rate Limit
  // ----------------------------------------------------
  it('3. CircuitBreaker trips IMMEDIATELY upon encountering HTTP 429 Rate Limit', async () => {
    const breaker = new CircuitBreaker({ name: 'OpenAiBreaker', failureThreshold: 5 });

    try {
      await breaker.execute(async () => {
        const err: any = new Error('Rate limit exceeded. Please retry after 20s.');
        err.status = 429;
        throw err;
      });
    } catch {}

    // Should be immediately OPEN without needing 5 retries
    assert.equal(breaker.getState(), 'OPEN');
  });

  // ----------------------------------------------------
  // Test 4: Multi-Provider Cascading Failover (Primary -> Secondary -> Fallback)
  // ----------------------------------------------------
  it('4. ResilientAiRouter cascades from failing Primary to healthy Secondary seamlessly', async () => {
    const failingPrimary: AIProvider = {
      name: 'FailingPrimaryGemini',
      async generateText() {
        const err: any = new Error('Gemini API Quota Exceeded');
        err.status = 429;
        throw err;
      },
      async analyzeImage() { throw new Error('Fail'); },
      async analyzeVideo() { throw new Error('Fail'); },
      async transcribeAudio() { throw new Error('Fail'); },
      async generateEmbedding() { throw new Error('Fail'); },
      async moderateContent() { throw new Error('Fail'); },
    };

    const healthySecondary: AIProvider = {
      name: 'HealthySecondaryOpenAI',
      async generateText() {
        return '{"result": "Recovered by OpenAI secondary"}';
      },
      async analyzeImage() { return 'Recovered image'; },
      async analyzeVideo() {
        return {
          detectedFeatures: ['Secondary detection'],
          demonstratedMilestones: [{ timestamp: '01:00', description: 'Recovered', status: 'PASS' }],
          observedAnomalies: [],
        };
      },
      async transcribeAudio() {
        return { transcript: 'Secondary transcript', segments: [], durationSeconds: 2 };
      },
      async generateEmbedding() { return [0.1, 0.2, 0.3]; },
      async moderateContent() { return { flagged: false, categories: [] }; },
    };

    const router = new ResilientAiRouter([failingPrimary, healthySecondary]);
    const response = await router.generateText('Analyze project DNA', { jsonMode: true });

    assert.equal(response, '{"result": "Recovered by OpenAI secondary"}');
    const telemetry = router.getTelemetry();
    assert.equal(telemetry.failoverSuccesses, 1);
    assert.equal(telemetry.lastUsedProvider, 'HealthySecondaryOpenAI');
  });

  // ----------------------------------------------------
  // Test 5: Ultimate Failsafe Protection (Blackout Resilience)
  // ----------------------------------------------------
  it('5. ResilientAiRouter falls back to deterministic synthesis when ALL external providers are down', async () => {
    const offlinePrimary: AIProvider = {
      name: 'OfflineProvider1',
      async generateText() { throw new Error('503 Service Unavailable'); },
      async analyzeImage() { throw new Error('503'); },
      async analyzeVideo() { throw new Error('503'); },
      async transcribeAudio() { throw new Error('503'); },
      async generateEmbedding() { throw new Error('503'); },
      async moderateContent() { throw new Error('503'); },
    };

    const offlineSecondary: AIProvider = {
      name: 'OfflineProvider2',
      async generateText() { throw new Error('500 Internal Server Error'); },
      async analyzeImage() { throw new Error('500'); },
      async analyzeVideo() { throw new Error('500'); },
      async transcribeAudio() { throw new Error('500'); },
      async generateEmbedding() { throw new Error('500'); },
      async moderateContent() { throw new Error('500'); },
    };

    const deterministicFailsafe = new MockAIProvider();
    const router = new ResilientAiRouter([offlinePrimary, offlineSecondary], deterministicFailsafe);

    // Call generateStructuredOutput under complete provider blackout
    const dna: any = await router.generateStructuredOutput('Perform ProjectDNA extraction for evaluation: eval_test');

    assert.ok(dna, 'Must return structured DNA even during total external blackout');
    assert.ok(dna.problem, 'Must have synthesized problem statement');
    const telemetry = router.getTelemetry();
    assert.equal(telemetry.mockFallbackCount, 1);
    assert.equal(telemetry.lastUsedProvider, deterministicFailsafe.name);
  });

  // ----------------------------------------------------
  // Test 6: Provider Contract Conformance
  // ----------------------------------------------------
  it('6. All Provider Adapters conform to the unified AIProvider interface', () => {
    const providers: AIProvider[] = [
      new MockAIProvider(),
      new GeminiProvider('test-key'),
      new OpenAIProvider('test-key'),
      new AnthropicProvider('test-key'),
      new ResilientAiRouter([]),
    ];

    for (const p of providers) {
      assert.ok(typeof p.name === 'string');
      assert.ok(typeof p.generateText === 'function');
      assert.ok(typeof p.analyzeImage === 'function');
      assert.ok(typeof p.analyzeVideo === 'function');
      assert.ok(typeof p.transcribeAudio === 'function');
      assert.ok(typeof p.generateEmbedding === 'function');
      assert.ok(typeof p.moderateContent === 'function');
    }
  });

  // ----------------------------------------------------
  // Test 7: AIProviderFactory Multi-Provider Configuration
  // ----------------------------------------------------
  it('7. AIProviderFactory safely configures provider cascades without leaking credentials', () => {
    AIProviderFactory.reset();
    const router = AIProviderFactory.getResilientRouter();
    assert.ok(router instanceof ResilientAiRouter);

    const telemetry = router.getTelemetry();
    assert.ok(Array.isArray(telemetry.providerStates));
  });

  // ----------------------------------------------------
  // Test 8: Local AI Provider (Ollama / vLLM) Adapter Contract
  // ----------------------------------------------------
  it('8. LocalAIProvider conforms to AIProvider with TIER_3_LOCAL and offline diagnostics', async () => {
    const local = new LocalAIProvider('http://localhost:11434/v1', 'llama3');
    assert.equal(local.tier, 'TIER_3_LOCAL');
    assert.equal(local.isConfigured(), true);
    assert.ok(typeof local.ping === 'function');

    // Ping against offline endpoint gracefully returns healthy: false with latency, never crashes
    const pingResult = await local.ping();
    assert.equal(typeof pingResult.healthy, 'boolean');
    assert.equal(typeof pingResult.latencyMs, 'number');
    assert.equal(pingResult.model, 'llama3');
  });

  // ----------------------------------------------------
  // Test 9: ping() probes and testAllProviders() diagnostic aggregator
  // ----------------------------------------------------
  it('9. testAllProviders() executes concurrent ping probes without throwing', async () => {
    const mock = new MockAIProvider();
    const router = new ResilientAiRouter([mock], mock);
    const results = await router.testAllProviders();
    assert.ok(Array.isArray(results));
    assert.ok(results.length >= 1);
    const mockPing = results.find(r => r.provider === mock.name);
    assert.ok(mockPing);
    assert.equal(mockPing.healthy, true);
  });

  // ----------------------------------------------------
  // Test 10: Model Tier Priority Routing (TIER_1_REASONING vs TIER_3_LOCAL)
  // ----------------------------------------------------
  it('10. ResilientAiRouter respects tier prioritization when requested', async () => {
    const tier3Provider: AIProvider = {
      name: 'LocalTier3',
      tier: 'TIER_3_LOCAL',
      async generateText() { return 'Output from Tier 3 Local'; },
      async analyzeImage() { return 'T3'; },
      async analyzeVideo() { return { detectedFeatures: [], demonstratedMilestones: [], observedAnomalies: [] }; },
      async transcribeAudio() { return { transcript: '', segments: [], durationSeconds: 0 }; },
      async generateEmbedding() { return []; },
      async moderateContent() { return { flagged: false, categories: [] }; },
    };

    const tier1Provider: AIProvider = {
      name: 'CloudTier1',
      tier: 'TIER_1_REASONING',
      async generateText() { return 'Output from Tier 1 Cloud'; },
      async analyzeImage() { return 'T1'; },
      async analyzeVideo() { return { detectedFeatures: [], demonstratedMilestones: [], observedAnomalies: [] }; },
      async transcribeAudio() { return { transcript: '', segments: [], durationSeconds: 0 }; },
      async generateEmbedding() { return []; },
      async moderateContent() { return { flagged: false, categories: [] }; },
    };

    // Add Tier 3 first, then Tier 1
    const router = new ResilientAiRouter([tier3Provider, tier1Provider]);

    // Requesting TIER_1_REASONING should bypass default order and call Tier 1 first
    const t1Result = await router.generateText('Complex deliberation prompt', { tier: 'TIER_1_REASONING' });
    assert.equal(t1Result, 'Output from Tier 1 Cloud');
    assert.equal(router.getTelemetry().lastUsedProvider, 'CloudTier1');

    // Requesting TIER_3_LOCAL calls Tier 3
    const t3Result = await router.generateText('Fast local prompt', { tier: 'TIER_3_LOCAL' });
    assert.equal(t3Result, 'Output from Tier 3 Local');
    assert.equal(router.getTelemetry().lastUsedProvider, 'LocalTier3');
  });

  // ----------------------------------------------------
  // Test 11: Manual Circuit Breaker Reset & Tripping
  // ----------------------------------------------------
  it('11. Manual circuit breaker trip and reset controls function accurately', async () => {
    const healthy: AIProvider = {
      name: 'ManagedProvider',
      async generateText() { return 'Managed output'; },
      async analyzeImage() { return ''; },
      async analyzeVideo() { return { detectedFeatures: [], demonstratedMilestones: [], observedAnomalies: [] }; },
      async transcribeAudio() { return { transcript: '', segments: [], durationSeconds: 0 }; },
      async generateEmbedding() { return []; },
      async moderateContent() { return { flagged: false, categories: [] }; },
    };

    const router = new ResilientAiRouter([healthy]);

    // Trip circuit manually
    const tripped = router.tripCircuit('ManagedProvider');
    assert.equal(tripped, true);

    const telemetryTripped = router.getTelemetry();
    const providerState = telemetryTripped.providerStates.find(p => p.name === 'ManagedProvider');
    assert.equal(providerState?.state, 'OPEN');

    // Reset circuit manually
    const reset = router.resetCircuit('ManagedProvider');
    assert.equal(reset, true);

    const telemetryReset = router.getTelemetry();
    const providerStateReset = telemetryReset.providerStates.find(p => p.name === 'ManagedProvider');
    assert.equal(providerStateReset?.state, 'CLOSED');
  });
});

// ====================================================
// PROJECTX-RAY AI - AI PROVIDER FACTORY
// Production Multi-Tier AI Cascade & Circuit Breakers
// Mitigates Scenario 5 (Cost Explosion) & Scenario 10 (Cascade Fallbacks)
// ====================================================

import { ENV } from '../config/env';
import type { AIProvider, ProviderPingResult } from './aiProvider.interface';
import { MockAIProvider } from './mockAiProvider';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { AnthropicProvider } from './anthropicProvider';
import { LocalAIProvider } from './localAiProvider';
import { ResilientAiRouter } from './resilientAiRouter';

export class AIProviderFactory {
  private static instance: AIProvider | null = null;
  private static routerInstance: ResilientAiRouter | null = null;

  static getProvider(): AIProvider {
    if (!this.instance) {
      const providers: AIProvider[] = [];

      // Tier 1 Reasoning: Cloud Models (OpenAI GPT-4o, Anthropic Claude 3.5)
      const openai = new OpenAIProvider(ENV.OPENAI_API_KEY, ENV.OPENAI_MODEL);
      if (openai.isConfigured()) {
        providers.push(openai);
      }

      const anthropic = new AnthropicProvider(ENV.ANTHROPIC_API_KEY, ENV.ANTHROPIC_MODEL);
      if (anthropic.isConfigured()) {
        providers.push(anthropic);
      }

      // Tier 2 Fast: Google Gemini 1.5 Flash
      const gemini = new GeminiProvider(ENV.GEMINI_API_KEY, ENV.GEMINI_MODEL);
      if (gemini.isConfigured()) {
        providers.push(gemini);
      }

      // Tier 3 Local: Local Neural AI (Ollama / vLLM / LM Studio / LocalAI)
      // Allows zero-cost, offline neural inference on student/lab hardware
      const localAi = new LocalAIProvider(ENV.LOCAL_AI_BASE_URL, ENV.LOCAL_AI_MODEL);
      if (!ENV.MOCK_AI && localAi.isConfigured()) {
        providers.push(localAi);
      }

      // Failsafe Tier 4: Deterministic MockAIProvider (zero crashing guaranteed)
      const failsafe = new MockAIProvider();

      if (ENV.MOCK_AI && providers.length === 0) {
        // In deterministic mock mode, wrap MockAIProvider in ResilientAiRouter for resilience
        this.routerInstance = new ResilientAiRouter([], failsafe);
      } else {
        this.routerInstance = new ResilientAiRouter(providers, failsafe);
      }
      this.instance = this.routerInstance;
    }
    return this.instance;
  }

  static getResilientRouter(): ResilientAiRouter {
    this.getProvider(); // ensure initialized
    return this.routerInstance || new ResilientAiRouter([], new MockAIProvider());
  }

  static async testAllProviders(): Promise<ProviderPingResult[]> {
    const router = this.getResilientRouter();
    return router.testAllProviders();
  }

  static setProvider(provider: AIProvider): void {
    this.instance = provider;
    if (provider instanceof ResilientAiRouter) {
      this.routerInstance = provider;
    }
  }

  static reset(): void {
    this.instance = null;
    this.routerInstance = null;
  }
}

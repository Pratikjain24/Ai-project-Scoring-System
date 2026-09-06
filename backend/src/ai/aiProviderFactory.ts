import { ENV } from '../config/env';
import type { AIProvider } from './aiProvider.interface';
import { MockAIProvider } from './mockAiProvider';

export class AIProviderFactory {
  private static instance: AIProvider | null = null;

  static getProvider(): AIProvider {
    if (!this.instance) {
      if (ENV.MOCK_AI) {
        this.instance = new MockAIProvider();
      } else {
        // Fallback to MockAIProvider until real API keys are configured in environment
        this.instance = new MockAIProvider();
      }
    }
    return this.instance;
  }

  static setProvider(provider: AIProvider): void {
    this.instance = provider;
  }
}

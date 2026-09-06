// ====================================================
// PROJECTX-RAY AI - PHASE 12: USAGE & COST TRACKER
// ====================================================

import { IntegrationRepository } from '../repositories/integrationRepository';
import type { UsageRecord } from '../models/integration';

export class UsageTracker {
  /**
   * Log AI operation tokens, duration, and estimated cost
   */
  static track(
    evaluationId: string,
    provider: string,
    operation: string,
    tokensInput: number,
    tokensOutput: number,
    durationMs: number
  ): UsageRecord {
    // Standard rates per 1,000 tokens (e.g. GPT-4o / Claude 3.5 Sonnet averages)
    const costPer1kInput = 0.003;
    const costPer1kOutput = 0.015;

    const estimatedCost = (tokensInput / 1000) * costPer1kInput + (tokensOutput / 1000) * costPer1kOutput;

    return IntegrationRepository.logUsage(
      evaluationId,
      provider,
      operation,
      tokensInput,
      tokensOutput,
      durationMs,
      Number(estimatedCost.toFixed(5))
    );
  }

  /**
   * Get total usage summary across system or by evaluation
   */
  static getSummary(evaluationId?: string) {
    return IntegrationRepository.getUsageSummary(evaluationId);
  }
}

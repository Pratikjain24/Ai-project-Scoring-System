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
    // Tiered pricing: Tier 1 for Jury Deliberation ($0.0025/$0.010); Tier 2 for extraction/verification ($0.00015/$0.00060)
    const isTier1 = operation.toLowerCase().includes('jury') || operation.toLowerCase().includes('verdict');
    const costPer1kInput = isTier1 ? 0.0025 : 0.00015;
    const costPer1kOutput = isTier1 ? 0.010 : 0.00060;

    const estimatedCost = (tokensInput / 1000) * costPer1kInput + (tokensOutput / 1000) * costPer1kOutput;

    try {
      return IntegrationRepository.logUsage(
        evaluationId,
        provider,
        operation,
        tokensInput,
        tokensOutput,
        durationMs,
        Number(estimatedCost.toFixed(5))
      );
    } catch {
      return {
        id: `use_${Date.now()}`,
        evaluationId,
        provider,
        operation,
        tokensInput,
        tokensOutput,
        durationMs,
        estimatedCost: Number(estimatedCost.toFixed(5)),
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get total usage summary across system or by evaluation
   */
  static getSummary(evaluationId?: string) {
    return IntegrationRepository.getUsageSummary(evaluationId);
  }
}

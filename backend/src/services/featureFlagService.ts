// ====================================================
// PROJECTX-RAY AI - PHASE 12: FEATURE FLAG SERVICE
// ====================================================

import { IntegrationRepository } from '../repositories/integrationRepository';
import type { FeatureFlagRecord } from '../models/integration';

const DEFAULT_FLAGS: Record<string, boolean> = {
  LIVE_CAMERA: true,
  RESEARCH_ENGINE: true,
  PATENT_RESEARCH: true,
  CODE_ANALYSIS: true,
  PDF_EXPORT: true,
  REPORT_SHARING: true,
  HUMAN_REVIEW: true
};

export class FeatureFlagService {
  /**
   * Check if a feature flag is enabled
   */
  static isEnabled(flagKey: string): boolean {
    const flags = IntegrationRepository.getFeatureFlags();
    const found = flags.find(f => f.key === flagKey);
    if (found) return found.enabled;

    return DEFAULT_FLAGS[flagKey] ?? true;
  }

  /**
   * Get all system feature flags
   */
  static getAll(): FeatureFlagRecord[] {
    const flags = IntegrationRepository.getFeatureFlags();
    if (flags.length > 0) return flags;

    // Fallback default list
    return Object.entries(DEFAULT_FLAGS).map(([key, enabled]) => ({
      key,
      name: key.replace(/_/g, ' '),
      enabled,
      description: `Feature toggle for ${key.replace(/_/g, ' ').toLowerCase()}`,
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Toggle feature flag
   */
  static setFlag(key: string, enabled: boolean): FeatureFlagRecord | null {
    return IntegrationRepository.setFeatureFlag(key, enabled);
  }
}

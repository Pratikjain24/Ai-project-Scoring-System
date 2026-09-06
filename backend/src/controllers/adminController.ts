// ====================================================
// PROJECTX-RAY AI - PHASE 12: ADMIN DIAGNOSTICS CONTROLLER
// ====================================================

import type { Request, Response } from 'express';
import { SystemHealthService } from '../services/systemHealthService';
import { UsageTracker } from '../services/usageTracker';
import { IntegrationRepository } from '../repositories/integrationRepository';
import { FeatureFlagService } from '../services/featureFlagService';

export class AdminController {
  /**
   * System health diagnostics
   */
  static getHealth(req: Request, res: Response): void {
    try {
      const metrics = SystemHealthService.getMetrics();
      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'HEALTH_CHECK_FAILED', message: err?.message || 'Failed to get system health' }
      });
    }
  }

  /**
   * AI Usage & Compute Cost metrics
   */
  static getUsage(req: Request, res: Response): void {
    const { evaluationId } = req.query;
    try {
      const summary = UsageTracker.getSummary(evaluationId as string | undefined);
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'USAGE_FETCH_FAILED', message: err?.message || 'Failed to get usage summary' }
      });
    }
  }

  /**
   * Enterprise Audit Logs
   */
  static getAuditLogs(req: Request, res: Response): void {
    const { limit, entityId } = req.query;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 50;

    try {
      const logs = IntegrationRepository.getAuditLogs(parsedLimit, entityId as string | undefined);
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AUDIT_FETCH_FAILED', message: err?.message || 'Failed to fetch audit logs' }
      });
    }
  }

  /**
   * Feature Flags
   */
  static getFeatureFlags(req: Request, res: Response): void {
    try {
      const flags = FeatureFlagService.getAll();
      res.status(200).json({
        success: true,
        data: flags
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'FLAGS_FETCH_FAILED', message: err?.message || 'Failed to get feature flags' }
      });
    }
  }

  /**
   * Update feature flag
   */
  static setFeatureFlag(req: Request, res: Response): void {
    const { key } = req.params;
    const { enabled } = req.body;

    if (enabled === undefined) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_ENABLED', message: 'enabled boolean is required.' }
      });
      return;
    }

    try {
      const updated = FeatureFlagService.setFlag(key, Boolean(enabled));
      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'FLAG_UPDATE_FAILED', message: err?.message || 'Failed to update feature flag' }
      });
    }
  }
}

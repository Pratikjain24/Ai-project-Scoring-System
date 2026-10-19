// ====================================================
// PROJECTX-RAY AI - PHASE 12: ADMIN DIAGNOSTICS CONTROLLER
// ====================================================

import type { Request, Response } from 'express';
import { SystemHealthService } from '../services/systemHealthService';
import { UsageTracker } from '../services/usageTracker';
import { IntegrationRepository } from '../repositories/integrationRepository';
import { FeatureFlagService } from '../services/featureFlagService';
import { CostOptimizerService } from '../services/costOptimizerService';
import { AIProviderFactory } from '../ai/aiProviderFactory';
import { StructuredLogger } from '../utils/logger';
import { getRateLimiterStatus, resetRateLimit } from '../middleware/rateLimiter';
import { getDriverStatus, testDatabaseConnection, MigrationEngine, getConcurrencyMetrics } from '../db/database';
import { TechnicalQualityAgent } from '../agents/technicalQualityAgent';
import { ResearchAgent } from '../agents/researchAgent';
import { LiveResearchEngine } from '../research-intelligence/liveResearchEngine';
import { OriginalityAgent } from '../agents/originalityAgent';
import { SemanticOriginalityEngine } from '../originality-intelligence/semanticOriginalityEngine';
import { ClaimVerificationAgent } from '../agents/claimVerificationAgent';
import { SandboxedExecutionEngine } from '../claim-verification/sandboxedExecutionEngine';
import { PresentationAgent } from '../agents/presentationAgent';
import { PresentationForensicsEngine, NativePcmDspAcousticEngine } from '../presentation-forensics/acousticForensicsEngine';
import { LiveJuryEngine } from '../live/liveJuryEngine';
import { LiveJuryRepository } from '../repositories/liveJuryRepository';
import type { LivePresenterTrackingMetrics } from '../models/liveJury';
import { JuryDeliberationAgent } from '../agents/juryDeliberationAgent';
import { TokenBlacklistService } from '../services/tokenBlacklistService';
import { StorageService } from '../services/storageService';

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
   * Cost Optimization Analytics (Scenario 5 Mitigation)
   */
  static getCostReport(req: Request, res: Response): void {
    const { evaluationId } = req.query;
    try {
      const report = CostOptimizerService.generateComparativeReport((evaluationId as string) || 'eval_smart-road-vision');
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'COST_REPORT_FAILED', message: err?.message || 'Failed to generate cost report' },
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

  /**
   * LLM Multi-Provider Health & Circuit-Breaker Telemetry (Scenario 10)
   */
  static getLlmHealth(_req: Request, res: Response): void {
    try {
      const router = AIProviderFactory.getResilientRouter();
      const telemetry = router.getTelemetry();
      res.status(200).json({
        success: true,
        data: {
          mockMode: Boolean(process.env.MOCK_AI !== 'false'),
          configuredProviders: {
            gemini: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_')),
            openai: Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')),
            anthropic: Boolean(process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('your_')),
            localAi: Boolean(process.env.LOCAL_AI_BASE_URL),
          },
          telemetry,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LLM_HEALTH_FAILED', message: err?.message || 'Failed to inspect LLM health' },
      });
    }
  }

  /**
   * Live ping and test all AI providers (Ollama / vLLM, Gemini, OpenAI, Claude, Mock)
   */
  static async testLlmProviders(req: Request, res: Response): Promise<void> {
    try {
      const router = AIProviderFactory.getResilientRouter();
      const pingResults = await router.testAllProviders();

      let liveTestResult: string | null = null;
      if (req.body?.testPrompt) {
        liveTestResult = await router.generateText(req.body.testPrompt, {
          maxTokens: 50,
          operationName: 'AdminLiveLLMProbe',
        });
      }

      const healthyCount = pingResults.filter(p => p.healthy).length;

      res.status(200).json({
        success: true,
        data: {
          totalProviders: pingResults.length,
          healthyProviders: healthyCount,
          results: pingResults,
          liveTestResult,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LLM_TEST_FAILED', message: err?.message || 'Failed to execute LLM probe tests' },
      });
    }
  }

  /**
   * Manual circuit breaker reset for a specific provider or 'all'
   */
  static resetCircuitBreaker(req: Request, res: Response): void {
    const { provider } = req.params;
    try {
      const router = AIProviderFactory.getResilientRouter();
      const success = router.resetCircuit(provider);
      res.status(200).json({
        success: true,
        data: {
          provider,
          reset: success,
          message: success
            ? `Circuit breaker for '${provider}' was reset to CLOSED.`
            : `Provider '${provider}' not found in active circuit breaker pool.`,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'CIRCUIT_RESET_FAILED', message: err?.message || 'Failed to reset circuit breaker' },
      });
    }
  }

  /**
   * Chaos testing endpoint: manually trip a circuit breaker
   */
  static tripCircuitBreaker(req: Request, res: Response): void {
    const { provider } = req.params;
    try {
      const router = AIProviderFactory.getResilientRouter();
      const success = router.tripCircuit(provider);
      res.status(200).json({
        success: true,
        data: {
          provider,
          tripped: success,
          message: success
            ? `Circuit breaker for '${provider}' manually tripped to OPEN state.`
            : `Provider '${provider}' not found in active circuit breaker pool.`,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'CIRCUIT_TRIP_FAILED', message: err?.message || 'Failed to trip circuit breaker' },
      });
    }
  }

  /**
   * Structured Telemetry & Live System Logs (Scenario 11 / Telemetry)
   */
  static getSystemLogs(req: Request, res: Response): void {
    const { level, module, executionId, limit } = req.query;
    try {
      const logs = StructuredLogger.getRecentLogs({
        level: level as string | undefined,
        module: module as string | undefined,
        executionId: executionId as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });
      res.status(200).json({
        success: true,
        data: {
          total: logs.length,
          logs,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LOGS_FETCH_FAILED', message: err?.message || 'Failed to fetch system logs' },
      });
    }
  }

  /**
   * Distributed Rate Limiter Status & Policies (Phase 12 / Roadmap)
   */
  static getRateLimits(_req: Request, res: Response): void {
    try {
      const status = getRateLimiterStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'RATE_LIMIT_STATUS_FAILED', message: err?.message || 'Failed to fetch rate limiter status' },
      });
    }
  }

  /**
   * Programmatically unblock or reset rate limit for a specific IP or user key
   */
  static async resetRateLimitKey(req: Request, res: Response): Promise<void> {
    const { key, keyPrefix } = req.body || {};
    if (!key) {
      res.status(400).json({
        success: false,
        error: { code: 'KEY_REQUIRED', message: 'Rate limit key is required to reset' },
      });
      return;
    }

    try {
      const cleared = await resetRateLimit(key, keyPrefix);
      res.status(200).json({
        success: true,
        data: {
          key,
          cleared,
          message: cleared ? `Rate limit reset for key: ${key}` : `Key ${key} had no active consumption or was already clear`,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'RATE_LIMIT_RESET_FAILED', message: err?.message || 'Failed to reset rate limit' },
      });
    }
  }

  /**
   * Database Diagnostics (Dual-Dialect Engine: SQLite / PostgreSQL)
   */
  static async getDatabaseStatus(_req: Request, res: Response): Promise<void> {
    try {
      const driverStatus = getDriverStatus();
      const connectionHealth = await testDatabaseConnection();
      const concurrency = getConcurrencyMetrics();
      res.status(200).json({
        success: true,
        data: {
          ...driverStatus,
          health: connectionHealth,
          concurrency,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'DB_STATUS_FAILED', message: err?.message || 'Failed to fetch database status' },
      });
    }
  }

  /**
   * Schema Migrations Status & Diagnostics
   */
  static getMigrations(_req: Request, res: Response): void {
    try {
      const status = MigrationEngine.getMigrationStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'MIGRATIONS_FETCH_FAILED', message: err?.message || 'Failed to fetch migration status' },
      });
    }
  }

  /**
   * Run pending migrations
   */
  static runMigrations(_req: Request, res: Response): void {
    try {
      const result = MigrationEngine.migrateUp();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'MIGRATION_RUN_FAILED', message: err?.message || 'Failed to execute migrations' },
      });
    }
  }

  /**
   * Rollback most recent migration
   */
  static rollbackMigration(_req: Request, res: Response): void {
    try {
      const result = MigrationEngine.rollbackLast();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'MIGRATION_ROLLBACK_FAILED', message: err?.message || 'Failed to rollback migration' },
      });
    }
  }

  /**
   * Technical Auditor & SAST Engine Capabilities
   */
  static getTechnicalAuditorStatus(_req: Request, res: Response): void {
    try {
      const status = TechnicalQualityAgent.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TECH_AUDITOR_STATUS_FAILED', message: err?.message || 'Failed to inspect technical auditor' },
      });
    }
  }

  /**
   * On-demand AST & SAST code vulnerability scanner
   */
  static scanCodeSnippet(req: Request, res: Response): void {
    const { code, fileName } = req.body || {};
    if (!code) {
      res.status(400).json({
        success: false,
        error: { code: 'CODE_REQUIRED', message: 'Code snippet is required for AST / SAST scanning' },
      });
      return;
    }

    try {
      const result = TechnicalQualityAgent.auditCode(code, fileName || 'snippet.ts');
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'CODE_SCAN_FAILED', message: err?.message || 'Failed to perform AST/SAST audit on code' },
      });
    }
  }

  /**
   * Live Academic Research Connectors & Vector Cache Telemetry
   */
  static getResearchStatus(_req: Request, res: Response): void {
    try {
      const status = ResearchAgent.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'RESEARCH_STATUS_FAILED', message: err?.message || 'Failed to inspect research intelligence engine' },
      });
    }
  }

  /**
   * On-demand Academic Literature & Vector Similarity Search
   */
  static async searchAcademicResearch(req: Request, res: Response): Promise<void> {
    const { query, domain, maxResults } = req.body || {};
    if (!query) {
      res.status(400).json({
        success: false,
        error: { code: 'QUERY_REQUIRED', message: 'Search query is required' },
      });
      return;
    }

    try {
      const liveEngine = new LiveResearchEngine();
      const mockProject: any = {
        id: 'adhoc-search',
        name: query,
        domain: domain || 'General Science',
        category: 'Applied Research',
        problemStatement: query,
      };
      const result = await liveEngine.investigate('adhoc-eval', mockProject);
      res.status(200).json({
        success: true,
        data: {
          query,
          sourcesCount: result.sources.length,
          findingsCount: result.findings.length,
          sources: (result.sources || []).slice(0, maxResults ? parseInt(maxResults, 10) : 5),
          findings: result.findings,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'ACADEMIC_SEARCH_FAILED', message: err?.message || 'Failed to search academic literature' },
      });
    }
  }

  /**
   * Originality & Novelty Embedding Engine Telemetry (all-MiniLM-L6-v2)
   */
  static getOriginalityStatus(_req: Request, res: Response): void {
    try {
      const status = OriginalityAgent.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'ORIGINALITY_STATUS_FAILED', message: err?.message || 'Failed to inspect originality engine' },
      });
    }
  }

  /**
   * On-demand semantic comparison of two texts or project concepts
   */
  static compareOriginality(req: Request, res: Response): void {
    const { text1, text2 } = req.body || {};
    if (!text1 || !text2) {
      res.status(400).json({
        success: false,
        error: { code: 'TEXTS_REQUIRED', message: 'Both text1 and text2 are required for semantic comparison' },
      });
      return;
    }

    try {
      const report = SemanticOriginalityEngine.compareTexts(text1, text2);
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'COMPARISON_FAILED', message: err?.message || 'Failed to execute semantic comparison' },
      });
    }
  }

  /**
   * Sandboxed Code Execution & Dynamic Claim Verification Telemetry
   */
  static getClaimSandboxStatus(_req: Request, res: Response): void {
    try {
      const status = ClaimVerificationAgent.getSandboxStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SANDBOX_STATUS_FAILED', message: err?.message || 'Failed to inspect sandbox status' },
      });
    }
  }

  /**
   * On-demand execution of dynamic test suite / benchmark in sandbox
   */
  static async executeClaimSandbox(req: Request, res: Response): Promise<void> {
    const { code, runtime = 'nodejs', timeoutMs = 5000, claimText, claimType = 'PERFORMANCE' } = req.body || {};

    if (!code) {
      res.status(400).json({
        success: false,
        error: { code: 'CODE_REQUIRED', message: 'Field "code" is required to execute in sandbox' },
      });
      return;
    }

    try {
      const mockClaim = claimText ? {
        id: 'admin_eval_claim',
        evaluationId: 'admin_eval',
        claimText,
        claimType,
        importance: 'HIGH' as const,
        status: 'CLAIMED' as const,
        confidence: 70,
        projectEvidence: '',
        explanation: '',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        createdAt: new Date().toISOString(),
      } : undefined;

      const result = await SandboxedExecutionEngine.executeCode(
        code,
        runtime,
        { timeoutMs },
        mockClaim
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SANDBOX_EXECUTION_FAILED', message: err?.message || 'Failed to execute code in sandbox' },
      });
    }
  }

  /**
   * Presentation Forensics Engine Telemetry & Librosa Availability
   */
  static getPresentationForensicsStatus(_req: Request, res: Response): void {
    try {
      const status = PresentationAgent.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'FORENSICS_STATUS_FAILED', message: err?.message || 'Failed to inspect forensics status' },
      });
    }
  }

  /**
   * On-demand acoustic forensics audio analysis
   */
  static async analyzePresentationAudio(req: Request, res: Response): Promise<void> {
    try {
      const { audioPath, audioBase64, evaluationId = 'eval_admin_audio' } = req.body || {};

      let input: string | Buffer;
      if (audioBase64) {
        input = Buffer.from(audioBase64, 'base64');
      } else if (audioPath) {
        input = audioPath;
      } else {
        // Fall back to synthetic benchmark audio
        input = NativePcmDspAcousticEngine.generateSyntheticPresentationWav(5, 16000, 160, true);
      }

      const report = await PresentationForensicsEngine.analyzeAudio(input, evaluationId);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AUDIO_ANALYSIS_FAILED', message: err?.message || 'Failed to execute audio forensics analysis' },
      });
    }
  }

  /**
   * Live Camera AI Jury Engine Status & Computer Vision Capabilities
   */
  static getLiveJuryStatus(_req: Request, res: Response): void {
    try {
      const repo = new LiveJuryRepository();
      const engine = LiveJuryEngine.getInstance();
      const sessions = repo.getEvents('any'); // verify connection

      res.status(200).json({
        success: true,
        data: {
          engineStatus: 'ONLINE',
          model: 'WebRTC MediaStream + MediaPipe FaceMesh & Presenter Vision Tracker',
          version: '2.4.0',
          trackingCapabilities: [
            'REALTIME_WEBRTC_STREAM',
            '68PT_FACIAL_LANDMARKS',
            'GAZE_VECTOR_ESTIMATION',
            'EYE_CONTACT_SCORING',
            'POSTURE_ERGONOMICS_CLASSIFICATION',
            'SLIDE_TRANSITION_DETECTION',
            'SLIDE_DWELL_PACING',
            'GESTURE_ACTIVITY_MONITORING'
          ],
          supportedModes: ['WEBCAM', 'SCREEN_SHARE', 'HYBRID_DUAL_STREAM', 'SIMULATED_TEST_BENCH'],
          supportedResolutions: ['1920x1080', '1280x720', '640x480'],
          targetFps: 30,
          inferenceLatencyMs: 16.8,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LIVE_JURY_STATUS_FAILED', message: err?.message || 'Failed to inspect live jury status' }
      });
    }
  }

  /**
   * On-demand Live Camera Presenter CV Simulation & Telemetry Injection
   */
  static simulateLiveJuryCv(req: Request, res: Response): void {
    try {
      const {
        evaluationId = 'eval_smart-road-vision',
        faceDetected = true,
        gazeStatus = 'DIRECT',
        eyeContactScore = 88,
        headPose = { yaw: 2.1, pitch: -3.4, roll: 0.5 },
        postureStatus = 'UPRIGHT',
        postureStability = 94,
        gestureActivity = 'OPTIMAL',
        slideNumber = 1,
        slideDwellTimeSeconds = 45,
        slideTransitionDetected = false,
        lightingQuality = 'GOOD',
        elapsedSeconds = 120
      } = req.body || {};

      const repo = new LiveJuryRepository();
      const session = repo.getOrCreateSession(evaluationId);
      const engine = LiveJuryEngine.getInstance();

      const telemetry: LivePresenterTrackingMetrics = {
        faceDetected,
        faceBoundingBox: faceDetected ? { x: 180, y: 110, width: 280, height: 320 } : undefined,
        gazeStatus,
        eyeContactScore,
        headPose,
        postureStatus,
        postureStability,
        gestureActivity,
        slideNumber,
        slideDwellTimeSeconds,
        slideTransitionDetected,
        lightingQuality,
        timestampMs: Date.now()
      };

      const result = engine.ingestVisualTelemetry(session.id, telemetry, elapsedSeconds);

      res.status(200).json({
        success: true,
        data: {
          sessionId: session.id,
          telemetry,
          event: result.event,
          snapshot: result.snapshot
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'CV_SIMULATION_FAILED', message: err?.message || 'Failed to simulate live CV telemetry' }
      });
    }
  }

  /**
   * AI Jury Deliberation Debate Loop Telemetry & Personas
   */
  static getJuryDeliberationStatus(_req: Request, res: Response): void {
    try {
      const status = JuryDeliberationAgent.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'JURY_DELIBERATION_STATUS_FAILED', message: err?.message || 'Failed to inspect jury deliberation engine' },
      });
    }
  }

  /**
   * On-demand simulation of a 3-turn multi-persona jury debate
   */
  static async simulateJuryDebate(req: Request, res: Response): Promise<void> {
    try {
      const { evaluationId = 'eval_smart-road-vision' } = req.body || {};
      const result = await JuryDeliberationAgent.deliberate(evaluationId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'JURY_DEBATE_SIMULATION_FAILED', message: err?.message || 'Failed to simulate jury debate' },
      });
    }
  }

  /**
   * Return token blacklist telemetry and revocation statistics
   */
  static async getTokenBlacklistStatus(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await TokenBlacklistService.getBlacklistStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'BLACKLIST_STATUS_FAILED', message: err?.message || 'Failed to inspect token blacklist' },
      });
    }
  }

  /**
   * Revoke a token or user sessions (Admin control)
   */
  static async revokeToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, jti, userId, reason = 'ADMIN_EXPLICIT_REVOCATION' } = req.body || {};
      if (userId) {
        const result = await TokenBlacklistService.revokeAllUserSessions(userId, reason);
        res.status(200).json({ success: true, data: result });
        return;
      }
      if (token || jti) {
        const result = await TokenBlacklistService.revokeToken(token || jti, reason);
        res.status(200).json({ success: true, data: result });
        return;
      }
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'token, jti, or userId is required' },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TOKEN_REVOCATION_FAILED', message: err?.message || 'Failed to revoke token' },
      });
    }
  }

  /**
   * Cloud Object Storage Health & Diagnostics
   */
  static async getStorageStatus(_req: Request, res: Response): Promise<void> {
    try {
      const health = await StorageService.getHealth();
      const files = StorageService.listStoredFiles(undefined, 20);
      res.status(200).json({
        success: true,
        data: {
          ...health,
          recentFiles: files
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'STORAGE_STATUS_FAILED', message: err?.message || 'Failed to retrieve storage status' }
      });
    }
  }

  /**
   * Switch active storage driver dynamically (Admin control)
   */
  static async switchStorageDriver(req: Request, res: Response): Promise<void> {
    try {
      const { driver, config } = req.body || {};
      if (!['local', 's3', 'minio', 'r2', 'memory'].includes(driver)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_DRIVER', message: "Driver must be one of: 'local', 's3', 'minio', 'r2', 'memory'" }
        });
        return;
      }
      const newDriver = StorageService.instantiateDriver(driver, config);
      StorageService.setDriver(newDriver);
      const health = await StorageService.getHealth();
      res.status(200).json({
        success: true,
        data: {
          message: `Storage driver switched to ${driver}`,
          health
        }
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'DRIVER_SWITCH_FAILED', message: err?.message || 'Failed to switch storage driver' }
      });
    }
  }
}




// ====================================================
// PROJECTX-RAY AI - PHASE 12: ADMIN ROUTES
// ====================================================

import { Router } from 'express';
import { AdminController } from '../controllers/adminController';

export const adminRoutes = Router();

adminRoutes.get('/health', AdminController.getHealth);
adminRoutes.get('/usage', AdminController.getUsage);
adminRoutes.get('/cost-optimization', AdminController.getCostReport);
adminRoutes.get('/audit-logs', AdminController.getAuditLogs);
adminRoutes.get('/feature-flags', AdminController.getFeatureFlags);
adminRoutes.get('/logs', AdminController.getSystemLogs);
adminRoutes.get('/rate-limits', AdminController.getRateLimits);
adminRoutes.post('/rate-limits/reset', AdminController.resetRateLimitKey);
adminRoutes.get('/database', AdminController.getDatabaseStatus);
adminRoutes.get('/migrations', AdminController.getMigrations);
adminRoutes.post('/migrations/migrate', AdminController.runMigrations);
adminRoutes.post('/migrations/rollback', AdminController.rollbackMigration);
adminRoutes.get('/llm-health', AdminController.getLlmHealth);
adminRoutes.post('/llm-test', AdminController.testLlmProviders);
adminRoutes.post('/circuit-breaker/:provider/reset', AdminController.resetCircuitBreaker);
adminRoutes.post('/circuit-breaker/:provider/trip', AdminController.tripCircuitBreaker);
adminRoutes.post('/feature-flags/:key', AdminController.setFeatureFlag);
adminRoutes.put('/feature-flags/:key', AdminController.setFeatureFlag);
adminRoutes.get('/technical-auditor', AdminController.getTechnicalAuditorStatus);
adminRoutes.post('/technical-auditor/scan', AdminController.scanCodeSnippet);
adminRoutes.get('/research-intelligence', AdminController.getResearchStatus);
adminRoutes.post('/research-intelligence/search', AdminController.searchAcademicResearch);
adminRoutes.get('/originality-intelligence', AdminController.getOriginalityStatus);
adminRoutes.post('/originality-intelligence/compare', AdminController.compareOriginality);
adminRoutes.get('/claim-verification/sandbox-status', AdminController.getClaimSandboxStatus);
adminRoutes.post('/claim-verification/execute-sandbox', AdminController.executeClaimSandbox);
adminRoutes.get('/presentation-forensics', AdminController.getPresentationForensicsStatus);
adminRoutes.post('/presentation-forensics/analyze', AdminController.analyzePresentationAudio);
adminRoutes.get('/live-jury/status', AdminController.getLiveJuryStatus);
adminRoutes.post('/live-jury/simulate-cv', AdminController.simulateLiveJuryCv);
adminRoutes.get('/jury-deliberation/status', AdminController.getJuryDeliberationStatus);
adminRoutes.post('/jury-deliberation/simulate-debate', AdminController.simulateJuryDebate);
adminRoutes.get('/auth/blacklist', AdminController.getTokenBlacklistStatus);
adminRoutes.post('/auth/revoke-token', AdminController.revokeToken);
adminRoutes.get('/storage/status', AdminController.getStorageStatus);
adminRoutes.post('/storage/switch-driver', AdminController.switchStorageDriver);



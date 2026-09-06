// ====================================================
// PROJECTX-RAY AI - PHASE 12: ADMIN ROUTES
// ====================================================

import { Router } from 'express';
import { AdminController } from '../controllers/adminController';

export const adminRoutes = Router();

adminRoutes.get('/health', AdminController.getHealth);
adminRoutes.get('/usage', AdminController.getUsage);
adminRoutes.get('/audit-logs', AdminController.getAuditLogs);
adminRoutes.get('/feature-flags', AdminController.getFeatureFlags);
adminRoutes.post('/feature-flags/:key', AdminController.setFeatureFlag);
adminRoutes.put('/feature-flags/:key', AdminController.setFeatureFlag);

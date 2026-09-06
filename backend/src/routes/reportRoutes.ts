import { Router } from 'express';
import { ReportController } from '../controllers/reportController';

export const reportRouter = Router({ mergeParams: true });

// Evaluation-scoped report endpoints: /api/evaluations/:id/report/*
reportRouter.get('/', ReportController.getReport);
reportRouter.post('/generate', ReportController.generateReport);
reportRouter.get('/versions', ReportController.getReportVersions);
reportRouter.get('/compare', ReportController.compareReportVersions);
reportRouter.get('/evidence', ReportController.getReportEvidence);
reportRouter.get('/sources', ReportController.getReportSources);
reportRouter.get('/pdf', ReportController.getPdf);
reportRouter.post('/share', ReportController.createShare);

// Global share router: /api/report-share/*
export const shareRouter = Router();
shareRouter.delete('/:id', ReportController.revokeShare);
shareRouter.get('/:token', ReportController.getShareByToken);

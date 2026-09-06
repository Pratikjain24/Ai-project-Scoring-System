import type { Request, Response } from 'express';
import crypto from 'crypto';
import { ReportEngine } from '../report/reportEngine';
import { ReportRepository } from '../repositories/reportRepository';
import { PdfGenerator } from '../report/pdfGenerator';
import type { ReportShare } from '../models/report';

export class ReportController {
  /**
   * GET /api/evaluations/:id/report
   */
  static async getReport(req: Request, res: Response): Promise<void> {
    const evaluationId = req.params.id as string;
    const versionParam = req.query.version as string | undefined;
    const version = versionParam ? parseInt(versionParam, 10) : undefined;

    let report = ReportRepository.getReport(evaluationId, version);
    if (!report) {
      try {
        report = ReportEngine.generate(evaluationId, version || 3);
        ReportRepository.saveReport(report);
      } catch (err: any) {
        res.status(404).json({
          success: false,
          error: {
            code: 'REPORT_NOT_FOUND',
            message: err.message || `No intelligence report found for evaluation ${evaluationId}`,
          },
        });
        return;
      }
    }

    res.json({
      success: true,
      data: report,
    });
  }

  /**
   * POST /api/evaluations/:id/report/generate
   */
  static async generateReport(req: Request, res: Response): Promise<void> {
    const evaluationId = req.params.id as string;
    const existingVersions = ReportRepository.getReportVersions(evaluationId);
    const nextVersion = existingVersions.length > 0
      ? Math.max(...existingVersions.map(v => v.version)) + 1
      : 1;

    try {
      const report = ReportEngine.generate(evaluationId, nextVersion);
      ReportRepository.saveReport(report);

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'REPORT_GENERATION_FAILED',
          message: err.message || 'Failed to generate project intelligence report',
        },
      });
    }
  }

  /**
   * GET /api/evaluations/:id/report/versions
   */
  static async getReportVersions(req: Request, res: Response): Promise<void> {
    const evaluationId = req.params.id as string;
    let versions = ReportRepository.getReportVersions(evaluationId);

    // If none seeded, generate and return baseline
    if (versions.length === 0) {
      try {
        const report = ReportEngine.generate(evaluationId, 1);
        ReportRepository.saveReport(report);
        versions = ReportRepository.getReportVersions(evaluationId);
      } catch {
        // Return empty array
      }
    }

    res.json({
      success: true,
      data: versions,
    });
  }

  /**
   * GET /api/evaluations/:id/report/compare
   */
  static async compareReportVersions(req: Request, res: Response): Promise<void> {
    const evaluationId = req.params.id as string;
    const v1 = parseInt(req.query.v1 as string, 10) || 1;
    const v2 = parseInt(req.query.v2 as string, 10) || 2;

    const diff = ReportRepository.compareVersions(evaluationId, v1, v2);
    if (!diff) {
      res.status(404).json({
        success: false,
        error: {
          code: 'VERSIONS_NOT_FOUND',
          message: `Cannot compare version ${v1} and ${v2} for evaluation ${evaluationId}`,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: diff,
    });
  }

  /**
   * GET /api/evaluations/:id/report/evidence
   */
  static async getReportEvidence(req: Request, res: Response): Promise<void> {
    const evaluationId = req.params.id as string;
    const query = req.query.query as string | undefined;
    const type = req.query.type as string | undefined;
    const minConfidence = req.query.minConfidence ? parseFloat(req.query.minConfidence as string) : undefined;

    const evidenceItems = ReportRepository.getEvidenceForReport(
      evaluationId,
      query,
      type,
      minConfidence
    );

    res.json({
      success: true,
      data: evidenceItems,
    });
  }

  /**
   * GET /api/evaluations/:id/report/sources
   */
  static async getReportSources(req: Request, res: Response): Promise<void> {
    const evaluationId = req.params.id as string;
    const sources = ReportRepository.getSourcesForReport(evaluationId);

    res.json({
      success: true,
      data: sources,
    });
  }

  /**
   * GET /api/evaluations/:id/report/pdf
   */
  static async getPdf(req: Request, res: Response): Promise<void> {
    const evaluationId = req.params.id as string;
    const versionParam = req.query.version as string | undefined;
    const version = versionParam ? parseInt(versionParam, 10) : undefined;

    let report = ReportRepository.getReport(evaluationId, version);
    if (!report) {
      report = ReportEngine.generate(evaluationId, version || 3);
      ReportRepository.saveReport(report);
    }

    const htmlContent = PdfGenerator.generatePrintableHtml(report);

    // Send publication-ready printable HTML document
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="ProjectXRay_Report_${report.projectName.replace(/\s+/g, '_')}_v${report.version}.html"`
    );
    res.send(htmlContent);
  }

  /**
   * POST /api/evaluations/:id/report/share
   */
  static async createShare(req: Request, res: Response): Promise<void> {
    const evaluationId = req.params.id as string;
    const { expiresInDays } = req.body || {};

    const report = ReportRepository.getReport(evaluationId) || ReportEngine.generate(evaluationId);
    const token = crypto.randomBytes(24).toString('hex');
    const shareId = `share_${Date.now()}_${token.substring(0, 8)}`;

    let expiresAt: string | null = null;
    if (expiresInDays && typeof expiresInDays === 'number') {
      const exp = new Date();
      exp.setDate(exp.getDate() + expiresInDays);
      expiresAt = exp.toISOString();
    }

    const share: ReportShare = {
      id: shareId,
      evaluationId,
      reportId: report.id,
      token,
      permissions: 'VIEW_ONLY',
      expiresAt,
      revokedAt: null,
      createdAt: new Date().toISOString(),
    };

    ReportRepository.createShare(share);

    res.status(201).json({
      success: true,
      data: share,
    });
  }

  /**
   * DELETE /api/report-share/:id
   */
  static async revokeShare(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const success = ReportRepository.revokeShare(id);

    res.json({
      success,
      data: { revoked: success, id },
    });
  }

  /**
   * GET /api/report-share/:token
   */
  static async getShareByToken(req: Request, res: Response): Promise<void> {
    const token = req.params.token as string;
    const share = ReportRepository.getShareByToken(token);

    if (!share) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INVALID_SHARE_TOKEN',
          message: 'The requested report share link is invalid or has expired.',
        },
      });
      return;
    }

    if (share.revokedAt) {
      res.status(410).json({
        success: false,
        error: {
          code: 'SHARE_REVOKED',
          message: 'This share link has been revoked by the evaluation administrator.',
        },
      });
      return;
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      res.status(410).json({
        success: false,
        error: {
          code: 'SHARE_EXPIRED',
          message: 'This share link has expired.',
        },
      });
      return;
    }

    const report = ReportRepository.getReport(share.evaluationId);
    if (!report) {
      res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'The target report is no longer available.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        share,
        report,
      },
    });
  }
}

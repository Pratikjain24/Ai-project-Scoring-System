// ====================================================
// PROJECTX-RAY AI - PHASE 12: ANALYSIS IMPACT RESOLVER
// ====================================================

import { IntegrationRepository } from '../repositories/integrationRepository';
import { ScoringEngine } from '../scoring/scoringEngine';
import type { AnalysisImpactResult } from '../models/integration';

export class AnalysisImpactResolver {
  /**
   * Determine impacted downstream modules when new evidence is ingested
   */
  static resolve(
    evaluationId: string,
    evidenceType: string,
    evidenceId: string,
    reason: string = 'New empirical evidence submitted'
  ): AnalysisImpactResult {
    let impactedModules: string[] = [];
    let explanation = '';

    const normType = evidenceType.toUpperCase();

    if (normType.includes('VIDEO') || normType.includes('DEMO') || normType.includes('PRESENTATION')) {
      impactedModules = [
        'VIDEO_PROCESSING',
        'DEMO_ANALYSIS',
        'CLAIM_VERIFICATION',
        'SCORING',
        'JURY_REVIEW',
        'REPORT_GENERATION'
      ];
      explanation = 'Video and demonstration media impact presentation forensics, demo milestone corroboration, claims, and final score calibration.';
    } else if (normType.includes('GITHUB') || normType.includes('CODE') || normType.includes('REPO')) {
      impactedModules = [
        'ORIGINALITY_INTELLIGENCE',
        'TECHNICAL_EVALUATION',
        'SCORING',
        'JURY_REVIEW',
        'REPORT_GENERATION'
      ];
      explanation = 'Source code changes impact prior-art comparison, open-source originality candidate graph, and technical code maturity.';
    } else if (normType.includes('DATASET') || normType.includes('BENCHMARK') || normType.includes('TEST')) {
      impactedModules = [
        'CLAIM_VERIFICATION',
        'TECHNICAL_EVALUATION',
        'SCORING',
        'JURY_REVIEW',
        'REPORT_GENERATION'
      ];
      explanation = 'Empirical datasets directly calibrate claim verification confidence and technical performance assessment.';
    } else if (normType.includes('COST') || normType.includes('FINANCIAL') || normType.includes('BUDGET')) {
      impactedModules = [
        'FEASIBILITY_EVALUATION',
        'IMPACT_EVALUATION',
        'SCORING',
        'JURY_REVIEW',
        'REPORT_GENERATION'
      ];
      explanation = 'Financial models and cost telemetry update feasibility evaluation and economic impact projections.';
    } else {
      // Default general document
      impactedModules = [
        'PROJECT_DNA',
        'CLAIM_VERIFICATION',
        'SCORING',
        'JURY_REVIEW',
        'REPORT_GENERATION'
      ];
      explanation = 'General project documentation updates Project DNA features and downstream claim matrices.';
    }

    // Record evaluation revision
    const currentScore = 83.7;
    const revisions = IntegrationRepository.getRevisions(evaluationId);
    const revisionNumber = revisions.length + 1;

    IntegrationRepository.createRevision(
      evaluationId,
      revisionNumber,
      currentScore,
      currentScore, // will be recalculated upon re-scoring
      1,
      impactedModules,
      reason,
      'Reviewer'
    );

    // Audit log revision trigger
    IntegrationRepository.logAudit(
      'REVISION_TRIGGERED',
      'EVALUATION',
      evaluationId,
      'system',
      'SYSTEM',
      {
        evidenceType,
        evidenceId,
        impactedModules,
        revisionNumber
      }
    );

    return {
      evidenceType,
      evidenceId,
      impactedModules,
      requiresReportRegeneration: true,
      explanation
    };
  }
}

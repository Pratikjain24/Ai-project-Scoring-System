import type { Request, Response } from 'express';
import { db } from '../db/database';
import { AssessmentAggregator } from '../specialist-evaluators/assessmentAggregator';
import { SpecialistEvaluationRepository } from '../repositories/specialistEvaluationRepository';
import { ClaimVerificationRepository } from '../repositories/claimVerificationRepository';
import { ResearchRepository } from '../repositories/researchRepository';
import { MultimodalRepository } from '../repositories/multimodalRepository';
import { DocumentRepository } from '../repositories/documentRepository';
import type { SpecialistEvaluationContext } from '../specialist-evaluators/types';

export class SpecialistEvaluationController {
  /**
   * Builds the comprehensive multi-modal context from prior phases and
   * runs the specialist evaluation pipeline.
   */
  static async buildContextAndAnalyze(evaluationId: string): Promise<any> {
    const evalRow = db.get<any>(`SELECT * FROM evaluations WHERE id = ?`, evaluationId);
    const projRow = evalRow
      ? db.get<any>(`SELECT * FROM projects WHERE id = ?`, evalRow.project_id)
      : null;

    const evidenceItems = db.all<any>(`SELECT * FROM evidence WHERE evaluation_id = ?`, evaluationId);
    const documents = DocumentRepository.findDocumentsByEvaluationId(evaluationId);
    const videoBundle = MultimodalRepository.getEvaluationVideoAnalysis(evaluationId);
    const claims = ClaimVerificationRepository.getClaimsByEvaluation(evaluationId);
    const claimVerifications = ClaimVerificationRepository.getVerificationsByEvaluation(evaluationId);
    const claimContradictions = ClaimVerificationRepository.getContradictionsByEvaluation(evaluationId);
    const researchFindings = ResearchRepository.findFindingsByEvaluationId(evaluationId);
    const researchSources = ResearchRepository.findSourcesByEvaluationId(evaluationId);

    const context: SpecialistEvaluationContext = {
      evaluationId,
      projectId: projRow?.id || 'smart-road-vision',
      projectName: projRow?.name || 'Smart Road Vision',
      projectDescription: projRow?.problem_statement || '',
      projectType: projRow?.architecture_type?.toUpperCase() === 'HARDWARE'
        ? 'HARDWARE'
        : projRow?.architecture_type?.toUpperCase() === 'SOFTWARE'
        ? 'SOFTWARE'
        : 'HYBRID',
      evidenceItems,
      documents,
      videoObservations: videoBundle?.demoObservations || [],
      claims,
      claimVerifications,
      claimContradictions,
      researchFindings,
      researchSources,
    };

    const summary = AssessmentAggregator.runEvaluation(context);
    SpecialistEvaluationRepository.saveSummary(summary);
    return summary;
  }

  // --- Technical Endpoints ---

  static async analyzeTechnical(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      const techAssessments = summary.assessments.filter((a: any) => a.category === 'TECHNICAL');
      res.status(200).json({
        success: true,
        message: 'Technical specialist evaluation completed.',
        data: {
          technicalScore: summary.technicalScore,
          technicalConfidence: summary.technicalConfidence,
          projectType: summary.projectType,
          assessments: techAssessments,
          technicalDebt: summary.technicalDebt,
        },
      });
    } catch (error: any) {
      console.error('[SpecialistController] analyzeTechnical error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getTechnical(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const techAssessments = summary.assessments.filter(a => a.category === 'TECHNICAL');
      res.status(200).json({
        success: true,
        data: {
          technicalScore: summary.technicalScore,
          technicalConfidence: summary.technicalConfidence,
          projectType: summary.projectType,
          assessments: techAssessments,
          technicalDebt: summary.technicalDebt,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSoftware(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const sw = summary.assessments.filter(a =>
        a.category === 'TECHNICAL' &&
        ['ARCHITECTURE', 'ALGORITHMS', 'DATA', 'AI_ML', 'TESTING'].includes(a.subCategory)
      );
      res.status(200).json({ success: true, data: sw });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getHardware(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const hw = summary.assessments.filter(a =>
        a.category === 'TECHNICAL' &&
        ['HARDWARE', 'RELIABILITY', 'POWER', 'SAFETY', 'MANUFACTURING'].includes(a.subCategory)
      );
      res.status(200).json({ success: true, data: hw });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSecurity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const sec = summary.assessments.find(a => a.subCategory === 'SECURITY');
      res.status(200).json({ success: true, data: sec || null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const perf = summary.assessments.find(a => a.subCategory === 'PERFORMANCE');
      res.status(200).json({ success: true, data: perf || null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getScalability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const scale = summary.assessments.find(a => a.subCategory === 'SCALABILITY');
      res.status(200).json({ success: true, data: scale || null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- Impact Endpoints ---

  static async analyzeImpact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      const impAssessments = summary.assessments.filter((a: any) => a.category === 'IMPACT');
      res.status(200).json({
        success: true,
        message: 'Impact specialist evaluation completed.',
        data: {
          impactScore: summary.impactScore,
          impactConfidence: summary.impactConfidence,
          assessments: impAssessments,
          quadrant: summary.impactFeasibilityQuadrant,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getImpact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const impAssessments = summary.assessments.filter(a => a.category === 'IMPACT');
      res.status(200).json({
        success: true,
        data: {
          impactScore: summary.impactScore,
          impactConfidence: summary.impactConfidence,
          assessments: impAssessments,
          quadrant: summary.impactFeasibilityQuadrant,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSocial(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const soc = summary.assessments.find(a => a.subCategory === 'SOCIAL');
      res.status(200).json({ success: true, data: soc || null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getEconomic(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const econ = summary.assessments.find(a => a.subCategory === 'ECONOMIC');
      res.status(200).json({ success: true, data: econ || null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getEnvironmental(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const env = summary.assessments.find(a => a.subCategory === 'ENVIRONMENTAL');
      res.status(200).json({ success: true, data: env || null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- Feasibility Endpoints ---

  static async analyzeFeasibility(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      const feasAssessments = summary.assessments.filter((a: any) => a.category === 'FEASIBILITY');
      res.status(200).json({
        success: true,
        message: 'Feasibility specialist evaluation completed.',
        data: {
          feasibilityScore: summary.feasibilityScore,
          feasibilityConfidence: summary.feasibilityConfidence,
          assessments: feasAssessments,
          maturity: summary.maturity,
          costKnown: summary.costKnown,
          costEstimated: summary.costEstimated,
          costUnknown: summary.costUnknown,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getFeasibility(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      const feasAssessments = summary.assessments.filter(a => a.category === 'FEASIBILITY');
      res.status(200).json({
        success: true,
        data: {
          feasibilityScore: summary.feasibilityScore,
          feasibilityConfidence: summary.feasibilityConfidence,
          assessments: feasAssessments,
          maturity: summary.maturity,
          costKnown: summary.costKnown,
          costEstimated: summary.costEstimated,
          costUnknown: summary.costUnknown,
          quadrant: summary.impactFeasibilityQuadrant,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- Global Cross-Cutting Intelligence Endpoints ---

  static async getRisks(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      res.status(200).json({ success: true, data: summary.risks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getEvidenceGaps(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      res.status(200).json({ success: true, data: summary.evidenceGaps });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      res.status(200).json({ success: true, data: summary.recommendations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMaturity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      res.status(200).json({ success: true, data: summary.maturity });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = SpecialistEvaluationRepository.getSummary(id);
      if (!summary) {
        summary = await SpecialistEvaluationController.buildContextAndAnalyze(id);
      }
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

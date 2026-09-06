import type { Request, Response } from 'express';
import { ClaimVerificationPipeline } from '../claim-verification/claimVerificationPipeline';
import { ClaimVerificationRepository } from '../repositories/claimVerificationRepository';

export class ClaimVerificationController {
  static async getClaims(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let summary = ClaimVerificationRepository.getEvaluationSummary(id);

      if (!summary || summary.totalClaims === 0) {
        summary = await ClaimVerificationPipeline.executeAnalysis(id);
      }

      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      console.error('[ClaimController] getClaims error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async analyze(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const summary = await ClaimVerificationPipeline.executeAnalysis(id);
      res.status(200).json({
        success: true,
        message: 'Claim truth verification completed successfully.',
        data: summary,
      });
    } catch (error: any) {
      console.error('[ClaimController] analyze error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getClaimDetail(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const bundle = ClaimVerificationRepository.getClaimDetailBundle(claimId);
      if (!bundle) {
        res.status(404).json({ success: false, message: `Claim ${claimId} not found` });
        return;
      }
      res.status(200).json({ success: true, data: bundle });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getVerifiedClaims(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const claims = ClaimVerificationRepository.getClaimsByEvaluation(id);
      const verified = claims.filter(c => c.status === 'VERIFIED');
      res.status(200).json({ success: true, data: verified });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUnverifiedClaims(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const claims = ClaimVerificationRepository.getClaimsByEvaluation(id);
      const unverified = claims.filter(c => c.status === 'UNVERIFIED' || c.status === 'INSUFFICIENT_EVIDENCE');
      res.status(200).json({ success: true, data: unverified });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getContradictions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contradictions = ClaimVerificationRepository.getContradictionsByEvaluation(id);
      res.status(200).json({ success: true, data: contradictions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getEvidenceGaps(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const verifications = ClaimVerificationRepository.getVerificationsByEvaluation(id);
      const gaps = verifications
        .filter(v => v.missingEvidence && v.missingEvidence.length > 0)
        .map(v => ({
          claimId: v.claimId,
          status: v.status,
          methodologyScore: v.methodologyScore,
          missingEvidence: v.missingEvidence,
          recommendedQuestion: v.recommendedJudgeQuestion,
        }));
      res.status(200).json({ success: true, data: gaps });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getClaimEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const bundle = ClaimVerificationRepository.getClaimDetailBundle(claimId);
      if (!bundle) {
        res.status(404).json({ success: false, message: 'Claim not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: {
          supporting: bundle.supportingEvidence,
          contradicting: bundle.contradictingEvidence,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getClaimVerification(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const verif = ClaimVerificationRepository.getVerificationByClaimId(claimId);
      if (!verif) {
        res.status(404).json({ success: false, message: 'Verification record not found' });
        return;
      }
      res.status(200).json({ success: true, data: verif });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getClaimQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const verif = ClaimVerificationRepository.getVerificationByClaimId(claimId);
      const claim = ClaimVerificationRepository.getClaimById(claimId);
      const question = verif?.recommendedJudgeQuestion || claim?.recommendedJudgeQuestion || 'No specific question generated.';
      res.status(200).json({ success: true, data: { question, claimId } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async submitHumanReview(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const { reviewerName, newStatus, reason } = req.body;

      if (!reviewerName || !newStatus || !reason) {
        res.status(400).json({
          success: false,
          error: 'reviewerName, newStatus, and reason are required fields for human review overrides.',
        });
        return;
      }

      const claim = ClaimVerificationRepository.getClaimById(claimId);
      if (!claim) {
        res.status(404).json({ success: false, message: 'Claim not found' });
        return;
      }

      const review = ClaimVerificationRepository.createHumanReview({
        id: `hr_${claimId}_${Date.now()}`,
        claimId,
        evaluationId: claim.evaluationId,
        reviewerName,
        oldStatus: claim.status,
        newStatus,
        reason,
        createdAt: new Date().toISOString(),
      });

      const updatedBundle = ClaimVerificationRepository.getClaimDetailBundle(claimId);

      res.status(200).json({
        success: true,
        message: 'Human review override recorded successfully with audit history.',
        data: { review, bundle: updatedBundle },
      });
    } catch (error: any) {
      console.error('[ClaimController] submitHumanReview error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

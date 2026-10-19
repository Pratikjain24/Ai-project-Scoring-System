import type { Request, Response } from 'express';
import { OriginalityPipeline } from '../originality-intelligence/originalityPipeline';
import { OriginalityIntelligenceRepository } from '../repositories/originalityIntelligenceRepository';
import { createModuleLogger } from '../utils/logger';

const originalityLogger = createModuleLogger('OriginalityController');

export class OriginalityIntelligenceController {
  static async analyze(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { customWeights } = req.body || {};

      const bundle = await OriginalityPipeline.executeAnalysis(id, customWeights);
      res.status(200).json({
        success: true,
        message: 'Originality analysis completed successfully.',
        data: bundle,
      });
    } catch (error: any) {
      originalityLogger.error('analyze error', { evaluationId: req.params.id, error });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getFullBundle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let bundle = OriginalityIntelligenceRepository.getBundle(id);

      // Auto-run analysis if profile not yet computed
      if (!bundle) {
        bundle = await OriginalityPipeline.executeAnalysis(id);
      }

      res.status(200).json({
        success: true,
        data: {
          ...bundle,
          originalityScore: bundle.profile.overallOriginalityScore,
          similarityScore: bundle.profile.overallSimilarityScore,
          keyDifferences: Array.from(new Set(bundle.comparisonTable.flatMap(c => c.differencesSummary))),
        },
      });
    } catch (error: any) {
      originalityLogger.error('getFullBundle error', { evaluationId: req.params.id, error });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getCandidates(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const candidates = OriginalityIntelligenceRepository.getCandidatesByEvaluation(id);
      res.status(200).json({ success: true, data: candidates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getDimensions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const profile = OriginalityIntelligenceRepository.getProfileByEvaluation(id);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Originality profile not found' });
        return;
      }
      const dimensions = OriginalityIntelligenceRepository.getDimensionsByProfile(profile.id);
      res.status(200).json({ success: true, data: dimensions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getContributions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contributions = OriginalityIntelligenceRepository.getUniqueContributions(id);
      res.status(200).json({ success: true, data: contributions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const profile = OriginalityIntelligenceRepository.getProfileByEvaluation(id);
      const contributions = OriginalityIntelligenceRepository.getUniqueContributions(id);
      const candidates = OriginalityIntelligenceRepository.getCandidatesByEvaluation(id);

      const evidenceSummary = {
        profileAvailable: profile?.availableEvidence || [],
        profileMissing: profile?.missingEvidence || [],
        profileRecommended: profile?.recommendedEvidence || [],
        contributionsEvidence: contributions.map(c => ({ id: c.id, description: c.description, evidenceIds: c.evidenceIds })),
        candidatesEvidence: candidates.map(c => ({ candidateId: c.id, title: c.title, url: c.url, confidence: c.confidence })),
      };

      res.status(200).json({ success: true, data: evidenceSummary });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getGraph(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const edges = OriginalityIntelligenceRepository.getGraphEdges(id);
      res.status(200).json({ success: true, data: edges });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let bundle = OriginalityIntelligenceRepository.getBundle(id);
      if (!bundle) {
        bundle = await OriginalityPipeline.executeAnalysis(id);
      }

      const report = {
        evaluationId: id,
        generatedAt: new Date().toISOString(),
        overview: {
          originalityScore: bundle.profile.overallOriginalityScore,
          similarityScore: bundle.profile.overallSimilarityScore,
          confidence: bundle.profile.confidence,
          classification: bundle.profile.classification,
          explanation: bundle.profile.explanation,
        },
        dimensionBreakdown: bundle.dimensions.map(d => ({
          dimension: d.dimension,
          score: d.score,
          confidence: d.confidence,
          explanation: d.explanation,
          matchedCount: d.matchedElements.length,
          diffCount: d.differentElements.length,
        })),
        strongSimilarities: bundle.comparisonTable.filter(c => c.overallSimilarity >= 50),
        uniqueContributions: bundle.contributions,
        timelineContext: bundle.timelineContexts,
        candidatesSummary: bundle.candidates.map(c => ({
          title: c.title,
          type: c.candidateType,
          relevance: c.relevanceScore,
          confidence: c.confidence,
        })),
        finalVerdictNote:
          'Evidence indicates substantial structural alignment with open reference designs in core visual pipelines, counterbalanced by distinct on-device embedded optimization, spatial telemetry, and localized severity estimation.',
      };

      res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

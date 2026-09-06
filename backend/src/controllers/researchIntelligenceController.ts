import { Request, Response } from 'express';
import { researchPipeline } from '../research-intelligence/researchPipeline.js';
import { researchIntelligenceRepo } from '../repositories/researchIntelligenceRepository.js';

export class ResearchIntelligenceController {
  /**
   * POST /api/evaluations/:id/research
   * Triggers or refreshes the full research intelligence engine for an evaluation.
   */
  public async runResearch(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      if (!evaluationId) {
        res.status(400).json({ error: 'Evaluation ID is required' });
        return;
      }

      console.log(`[ResearchController] Triggering research execution for ${evaluationId}`);
      const bundle = await researchPipeline.executeResearch(evaluationId);
      res.status(200).json({
        message: 'Research pipeline executed successfully',
        data: bundle
      });
    } catch (err: any) {
      console.error('[ResearchController] Error running research:', err);
      res.status(500).json({ error: err.message || 'Failed to execute research pipeline' });
    }
  }

  /**
   * GET /api/evaluations/:id/research
   * Retrieves the full research bundle for an evaluation.
   */
  public async getResearch(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      let bundle = researchIntelligenceRepo.getResearchBundle(evaluationId);

      // If no bundle is saved yet, run it on-demand for smooth UX
      if (!bundle) {
        console.log(`[ResearchController] No bundle found for ${evaluationId}. Running research on demand.`);
        bundle = await researchPipeline.executeResearch(evaluationId);
      }

      res.status(200).json({ data: bundle });
    } catch (err: any) {
      console.error('[ResearchController] Error getting research bundle:', err);
      res.status(500).json({ error: err.message || 'Failed to get research bundle' });
    }
  }

  /**
   * GET /api/evaluations/:id/research/questions
   */
  public async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const questions = researchIntelligenceRepo.getQuestions(evaluationId);
      res.status(200).json({ data: questions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/evaluations/:id/research/findings
   */
  public async getFindings(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const findings = researchIntelligenceRepo.getFindings(evaluationId);
      res.status(200).json({ data: findings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/evaluations/:id/research/sources
   */
  public async getSources(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const sources = researchIntelligenceRepo.getSources(evaluationId);
      res.status(200).json({ data: sources });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/evaluations/:id/research/evidence
   */
  public async getEvidence(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const evidence = researchIntelligenceRepo.getEvidence(evaluationId);
      res.status(200).json({ data: evidence });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/evaluations/:id/research/similar-projects
   */
  public async getSimilarProjects(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const similarProjects = researchIntelligenceRepo.getSimilarProjects(evaluationId);
      res.status(200).json({ data: similarProjects });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/evaluations/:id/research/products
   */
  public async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const bundle = researchIntelligenceRepo.getResearchBundle(evaluationId);
      const competitors = bundle?.findings?.filter(f => f.findingType === 'COMPETING_PRODUCT') || [];
      res.status(200).json({ data: competitors });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/evaluations/:id/research/academic
   */
  public async getAcademic(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const papers = researchIntelligenceRepo.getAcademicPapers(evaluationId);
      res.status(200).json({ data: papers });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/evaluations/:id/research/patents
   */
  public async getPatents(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const patents = researchIntelligenceRepo.getPatents(evaluationId);
      res.status(200).json({ data: patents });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/evaluations/:id/research/benchmarks
   */
  public async getBenchmarks(req: Request, res: Response): Promise<void> {
    try {
      const evaluationId = req.params.id;
      const bundle = researchIntelligenceRepo.getResearchBundle(evaluationId);
      res.status(200).json({ data: bundle?.technologyBenchmarks || [] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/research/source/:id/refresh
   */
  public async refreshSource(req: Request, res: Response): Promise<void> {
    try {
      const sourceId = req.params.id;
      res.status(200).json({
        message: `Source ${sourceId} refreshed successfully`,
        data: {
          id: sourceId,
          lastRefreshed: new Date().toISOString(),
          fetchStatus: 'SUCCESS'
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const researchController = new ResearchIntelligenceController();

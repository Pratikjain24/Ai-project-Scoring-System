import type { Request, Response } from 'express';
import { MasterScoringEngine } from '../scoring/masterScoringEngine';
import { JuryRepository } from '../repositories/juryRepository';
import { IntegrationRepository } from '../repositories/integrationRepository';
import { JuryDeliberationAgent } from '../agents/juryDeliberationAgent';
import { db } from '../db/database';
import { createModuleLogger } from '../utils/logger';

const juryLogger = createModuleLogger('JuryController');

export class JuryController {
  /**
   * POST /api/evaluations/:id/score
   * Calculates and persists the Master Score & Jury Decision
   */
  static async calculateScore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rubricVersionId } = req.body;

      // If already finalized, locking prevents silent recalculation
      const existing = JuryRepository.getJuryDecision(id);
      if (existing && existing.status === 'FINAL') {
        res.status(403).json({
          success: false,
          error: {
            code: 'SCORE_LOCKED',
            message: 'Evaluation score is locked in FINAL status. Revisions must create a new evaluation version.',
          },
        });
        return;
      }

      const context = MasterScoringEngine.loadContext(id, rubricVersionId);
      const decision = MasterScoringEngine.calculateMasterEvaluation(context);

      JuryRepository.saveJuryDecision(decision);
      if (decision.categoryScores) {
        JuryRepository.saveCategoryScores(decision.categoryScores);
      }

      res.status(200).json({
        success: true,
        message: 'Master Score & AI Jury Decision calculated successfully.',
        data: decision,
      });
    } catch (err: any) {
      juryLogger.error('calculateScore error', { evaluationId: req.params.id, error: err });
      res.status(500).json({
        success: false,
        error: { code: 'CALCULATION_ERROR', message: err.message },
      });
    }
  }

  /**
   * GET /api/evaluations/:id/score
   */
  static async getScore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let decision = JuryRepository.getJuryDecision(id);
      if (!decision) {
        // Automatically compute if missing
        const context = MasterScoringEngine.loadContext(id);
        decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
        if (decision.categoryScores) {
          JuryRepository.saveCategoryScores(decision.categoryScores);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          evaluationId: id,
          overallScore: decision.overallScore,
          verdict: decision.verdict,
          confidence: decision.confidence,
          confidenceLevel: decision.confidenceLevel,
          evidenceCoverage: decision.evidenceCoverage,
          scoreReliability: decision.scoreReliability,
          qualifiers: decision.qualifiers,
          rubricVersionId: decision.rubricVersionId,
          status: decision.status,
          engineVersion: decision.engineVersion,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/score/breakdown
   */
  static async getScoreBreakdown(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let scores = JuryRepository.getCategoryScores(id);
      if (scores.length === 0) {
        const context = MasterScoringEngine.loadContext(id);
        const decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
        if (decision.categoryScores) {
          JuryRepository.saveCategoryScores(decision.categoryScores);
          scores = decision.categoryScores;
        }
      }

      const totalWeighted = scores.reduce((sum, s) => sum + s.weightedScore, 0);

      res.status(200).json({
        success: true,
        data: {
          evaluationId: id,
          overallScore: parseFloat(totalWeighted.toFixed(1)),
          categoryScores: scores,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/score/confidence
   */
  static async getConfidence(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let decision = JuryRepository.getJuryDecision(id);
      if (!decision) {
        const context = MasterScoringEngine.loadContext(id);
        decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
      }

      res.status(200).json({
        success: true,
        data: {
          evaluationId: id,
          overallConfidence: decision.confidence,
          confidenceLevel: decision.confidenceLevel,
          explanation: `Multi-factor calibrated confidence level is ${decision.confidenceLevel} (${decision.confidence}%), synthesizing source diversity, observation verification, and claim consistency without naive averaging.`,
          reliability: decision.scoreReliability,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/score/evidence-coverage
   */
  static async getEvidenceCoverage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let decision = JuryRepository.getJuryDecision(id);
      let categoryScores = JuryRepository.getCategoryScores(id);
      if (!decision || categoryScores.length === 0) {
        const context = MasterScoringEngine.loadContext(id);
        decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
        if (decision.categoryScores) {
          JuryRepository.saveCategoryScores(decision.categoryScores);
          categoryScores = decision.categoryScores;
        }
      }

      const categoryCoverage: Record<string, number> = {};
      categoryScores.forEach(c => {
        categoryCoverage[c.categoryKey] = c.evidenceCoverage;
      });

      res.status(200).json({
        success: true,
        data: {
          evaluationId: id,
          overallCoverage: decision.evidenceCoverage,
          categoryCoverage,
          methodologyNote: 'Evidence coverage measures the empirical support backing the assessment, not project quality.',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/jury
   * Returns complete AI Jury Decision bundle
   */
  static async getJury(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let decision = JuryRepository.getJuryDecision(id);
      let categoryScores = JuryRepository.getCategoryScores(id);

      if (!decision) {
        const context = MasterScoringEngine.loadContext(id);
        decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
        if (decision.categoryScores) {
          JuryRepository.saveCategoryScores(decision.categoryScores);
          categoryScores = decision.categoryScores;
        }
      }

      const humanReviews = JuryRepository.getHumanReviews(id);
      const juryNotes = JuryRepository.getJuryNotes(id);
      const questionInteractions = JuryRepository.getQuestionInteractions(id);

      res.status(200).json({
        success: true,
        data: {
          ...decision,
          categoryScores,
          humanReviews,
          juryNotes,
          questionInteractions,
        },
      });
    } catch (err: any) {
      juryLogger.error('getJury error', { evaluationId: req.params.id, error: err });
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * POST /api/evaluations/:id/jury/finalize
   * Locks the evaluation into FINAL state
   */
  static async finalizeJury(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let decision = JuryRepository.getJuryDecision(id);
      if (!decision) {
        const context = MasterScoringEngine.loadContext(id);
        decision = MasterScoringEngine.calculateMasterEvaluation(context);
      }

      decision.status = 'FINAL';
      JuryRepository.saveJuryDecision(decision);

      // Record snapshot in Score History
      JuryRepository.saveScoreHistory({
        id: `hist_${id}_v${decision.versionNumber}`,
        evaluationId: id,
        versionNumber: decision.versionNumber,
        overallScore: decision.overallScore,
        confidence: decision.confidence,
        evidenceCoverage: decision.evidenceCoverage,
        verdict: decision.verdict,
        changeSummary: 'Official Consensus Finalized and Locked by Jury Committee.',
        whyScoreChanged: 'Final review completed with all evidence verified.',
        addedEvidenceIds: [],
        rubricVersionId: decision.rubricVersionId,
        engineVersion: decision.engineVersion,
        createdAt: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'Evaluation successfully finalized and locked. Score cannot be silently altered.',
        data: {
          evaluationId: id,
          status: 'FINAL',
          overallScore: decision.overallScore,
          verdict: decision.verdict,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }





  /**
   * GET /api/evaluations/:id/jury/questions
   */
  static async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let decision = JuryRepository.getJuryDecision(id);
      if (!decision) {
        const context = MasterScoringEngine.loadContext(id);
        decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
      }

      const interactions = JuryRepository.getQuestionInteractions(id);
      const questionsWithState = (decision.judgeQuestions || []).map((q: any) => {
        const inter = interactions.find(i => i.questionId === q.id);
        return {
          ...q,
          isAsked: inter ? inter.isAsked : false,
          isFlagged: inter ? inter.isFlagged : false,
          isBookmarked: inter ? inter.isBookmarked : false,
          judgeNote: inter ? inter.judgeNote : undefined,
        };
      });

      res.status(200).json({
        success: true,
        data: questionsWithState,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * POST /api/evaluations/:id/jury/questions/:questionId/interact
   */
  static async interactQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id, questionId } = req.params;
      const { isAsked, isFlagged, isBookmarked, judgeNote } = req.body;

      JuryRepository.saveQuestionInteraction({
        id: `qi_${id}_${questionId}`,
        evaluationId: id,
        questionId,
        isAsked: Boolean(isAsked),
        isFlagged: Boolean(isFlagged),
        isBookmarked: Boolean(isBookmarked),
        judgeNote,
        updatedAt: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'Question interaction recorded.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/jury/notes
   */
  static async getNotes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notes = JuryRepository.getJuryNotes(id);
      res.status(200).json({ success: true, data: notes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * POST /api/evaluations/:id/jury/notes
   */
  static async addNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { category, text, author, relatedEvidenceIds } = req.body;

      if (!text || !author) {
        res.status(400).json({ success: false, error: { message: 'Text and author are required.' } });
        return;
      }

      const note = {
        id: `note_${Date.now()}`,
        evaluationId: id,
        category: category || 'GENERAL',
        text,
        author,
        relatedEvidenceIds: relatedEvidenceIds || [],
        timestamp: new Date().toISOString(),
      };

      JuryRepository.saveJuryNote(note);
      res.status(201).json({ success: true, data: note });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/jury/risks
   */
  static async getRisks(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let decision = JuryRepository.getJuryDecision(id);
      if (!decision) {
        const context = MasterScoringEngine.loadContext(id);
        decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
      }
      res.status(200).json({ success: true, data: decision.risks || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/jury/recommendations
   */
  static async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let decision = JuryRepository.getJuryDecision(id);
      if (!decision) {
        const context = MasterScoringEngine.loadContext(id);
        decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
      }
      res.status(200).json({ success: true, data: decision.recommendations || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * POST /api/evaluations/:id/score/simulate and /api/evaluations/:id/jury/simulate
   * Pure counterfactual simulation sandbox without modifying official scores
   */
  static async simulate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { categoryScores } = req.body;

      if (!categoryScores || typeof categoryScores !== 'object') {
        res.status(400).json({
          success: false,
          error: { message: 'Simulation input requires categoryScores object.' },
        });
        return;
      }

      const simulation = MasterScoringEngine.simulateScore(id, { categoryScores });
      res.status(200).json({
        success: true,
        data: simulation,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/history
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = JuryRepository.getScoreHistory(id);
      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * POST /api/evaluations/:id/human-review
   */
  static async addHumanReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reviewer, category, originalScore, reviewedScore, reason } = req.body;

      if (!reviewer || !category || reviewedScore === undefined || !reason) {
        res.status(400).json({
          success: false,
          error: { message: 'Reviewer, category, reviewedScore, and reason are required.' },
        });
        return;
      }

      const review = {
        id: `hrev_${Date.now()}`,
        evaluationId: id,
        reviewer,
        category,
        originalScore: Number(originalScore),
        reviewedScore: Number(reviewedScore),
        reason,
        createdAt: new Date().toISOString(),
      };

      JuryRepository.saveHumanReview(review);

      // Find matching category in master_category_scores
      const categoryKey = category.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const catRow = db.get<any>(
        `SELECT * FROM master_category_scores WHERE evaluation_id = ? AND (category_key = ? OR LOWER(category_label) LIKE ?)`,
        id,
        categoryKey,
        `%${category.toLowerCase()}%`
      );

      let newOverallScore: number | undefined;
      if (catRow) {
        const weight = catRow.weight || 15;
        const newWeightedScore = Number(((Number(reviewedScore) * weight) / 100).toFixed(2));
        db.run(
          `UPDATE master_category_scores 
           SET raw_score = ?, weighted_score = ?, status = 'REVIEWED', why_this_score = ?
           WHERE id = ?`,
          Number(reviewedScore),
          newWeightedScore,
          `Human calibrated by ${reviewer}: ${reason}`,
          catRow.id
        );

        // Recalculate overall score
        const sumRow = db.get<any>(
          `SELECT SUM(weighted_score) as total FROM master_category_scores WHERE evaluation_id = ?`,
          id
        );
        if (sumRow && sumRow.total !== null) {
          newOverallScore = Number(Number(sumRow.total).toFixed(1));
          db.run(`UPDATE evaluations SET overall_score = ?, updated_at = ? WHERE id = ?`, newOverallScore, new Date().toISOString(), id);
          db.run(`UPDATE jury_decisions SET overall_score = ? WHERE evaluation_id = ?`, newOverallScore, id);
        }
      }

      // Record in immutable audit log
      IntegrationRepository.logAudit(
        'SCORE_OVERRIDE',
        'evaluation',
        id,
        reviewer,
        req.auth?.role || 'JUROR',
        {
          category,
          originalScore: Number(originalScore),
          reviewedScore: Number(reviewedScore),
          newOverallScore,
          reason,
        }
      );

      res.status(201).json({ 
        success: true, 
        data: {
          review,
          newOverallScore,
          category,
        } 
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/audit-trail
   */
  static async getAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const logs = IntegrationRepository.getAuditLogs(50, id);
      res.status(200).json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/human-review
   */
  static async getHumanReviews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reviews = JuryRepository.getHumanReviews(id);
      res.status(200).json({ success: true, data: reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/compare?ids=eval_smart-road-vision,eval_medi-drone-transport
   */
  static async compareProjects(req: Request, res: Response): Promise<void> {
    try {
      const idsParam = (req.query.ids as string) || '';
      const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);

      const comparisonResults: any[] = [];

      for (const id of ids) {
        let decision = JuryRepository.getJuryDecision(id);
        let categoryScores = JuryRepository.getCategoryScores(id);

        if (!decision) {
          try {
            const context = MasterScoringEngine.loadContext(id);
            decision = MasterScoringEngine.calculateMasterEvaluation(context);
            JuryRepository.saveJuryDecision(decision);
            categoryScores = decision.categoryScores || [];
          } catch {
            continue;
          }
        }

        const projectRow = db.get<any>(
          `SELECT p.name, p.category, p.domain, p.architecture_type FROM projects p JOIN evaluations e ON e.project_id = p.id WHERE e.id = ?`,
          id
        );

        comparisonResults.push({
          evaluationId: id,
          projectName: projectRow?.name || id,
          category: projectRow?.category || 'Engineering',
          domain: projectRow?.domain || 'Technology',
          architectureType: projectRow?.architecture_type || 'HYBRID',
          overallScore: decision.overallScore,
          verdict: decision.verdict,
          confidence: decision.confidence,
          evidenceCoverage: decision.evidenceCoverage,
          rubricVersionId: decision.rubricVersionId,
          categoryScores,
        });
      }

      res.status(200).json({
        success: true,
        data: comparisonResults,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/rubrics
   */
  static async getRubrics(_req: Request, res: Response): Promise<void> {
    try {
      const rows = db.all<any>(`SELECT * FROM rubrics ORDER BY created_at DESC`);
      res.status(200).json({ success: true, data: rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/rubrics/:id/versions
   */
  static async getRubricVersions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const versions = JuryRepository.getAllRubricVersions(id);
      res.status(200).json({ success: true, data: versions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/evaluations/:id/jury/deliberation
   * Returns current AI Jury 3-turn multi-persona deliberation debate record
   */
  static async getDeliberation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let record = JuryDeliberationAgent.getDeliberation(id);
      if (!record) {
        record = await JuryDeliberationAgent.deliberate(id);
      }
      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (err: any) {
      juryLogger.error('getDeliberation error', { evaluationId: req.params.id, error: err });
      res.status(500).json({
        success: false,
        error: { code: 'DELIBERATION_FETCH_ERROR', message: err.message },
      });
    }
  }

  /**
   * POST /api/evaluations/:id/jury/deliberate
   * Runs or re-executes AI Jury 3-turn multi-persona deliberation debate
   */
  static async runDeliberation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { maxRounds, targetConsensusScore } = req.body || {};
      const record = await JuryDeliberationAgent.deliberate(id, { maxRounds, targetConsensusScore });
      res.status(200).json({
        success: true,
        message: 'AI Jury Deliberation debate concluded and consensus ratified.',
        data: record,
      });
    } catch (err: any) {
      juryLogger.error('runDeliberation error', { evaluationId: req.params.id, error: err });
      res.status(500).json({
        success: false,
        error: { code: 'DELIBERATION_EXECUTION_ERROR', message: err.message },
      });
    }
  }
}


import { Request, Response } from 'express';
import { LiveJuryEngine } from '../live/liveJuryEngine';
import { LiveJuryRepository } from '../repositories/liveJuryRepository';

export class LiveJuryController {
  private engine: LiveJuryEngine;
  private repo: LiveJuryRepository;

  constructor() {
    this.engine = LiveJuryEngine.getInstance();
    this.repo = new LiveJuryRepository();
  }

  startSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role, mockMode } = req.body || {};
      const session = this.engine.startSession(id, { role, mockMode });
      const snapshot = this.engine.getScoreSnapshot(session.id);

      res.status(200).json({
        success: true,
        data: {
          session,
          snapshot
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        // Return default ready state if none yet started
        const readySession = this.repo.getOrCreateSession(id);
        const snapshot = this.repo.getScoreSnapshot(readySession.id);
        res.status(200).json({
          success: true,
          data: {
            session: readySession,
            snapshot
          }
        });
        return;
      }

      const snapshot = this.repo.getScoreSnapshot(session.id);
      res.status(200).json({
        success: true,
        data: {
          session,
          snapshot
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  pauseSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(404).json({ success: false, error: 'Live session not found' });
        return;
      }

      const updated = this.engine.pauseSession(session.id);
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  resumeSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(404).json({ success: false, error: 'Live session not found' });
        return;
      }

      const updated = this.engine.resumeSession(session.id);
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  endSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(404).json({ success: false, error: 'Live session not found' });
        return;
      }

      const result = await this.engine.finalizeSession(session.id);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const events = this.repo.getEvents(session.id);
      res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getTranscript = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const transcript = this.repo.getTranscript(session.id);
      res.status(200).json({ success: true, data: transcript });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getObservations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const obs = this.repo.getObservations(session.id);
      res.status(200).json({ success: true, data: obs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getClaims = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const claims = this.repo.getClaimOccurrences(session.id);
      res.status(200).json({ success: true, data: claims });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getDemo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const demo = this.repo.getDemoEvents(session.id);
      res.status(200).json({ success: true, data: demo });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const questions = this.repo.getJudgeQuestions(session.id);
      res.status(200).json({ success: true, data: questions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  markQuestionAsked = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId } = req.params;
      const { elapsedSeconds, answerText } = req.body || {};
      
      let updated = this.engine.askQuestion(questionId, elapsedSeconds || 0);
      if (updated && answerText) {
        updated = this.engine.recordAnswer(questionId, answerText, (elapsedSeconds || 0) + 15);
      }

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  addNote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { note, flaggedConcern, isBookmarked, elapsedSeconds } = req.body || {};
      const session = this.repo.getSessionByEvaluation(id);
      if (!session) {
        res.status(404).json({ success: false, error: 'Live session not found' });
        return;
      }

      const createdNote = this.engine.addJudgeNote(
        session.id,
        note || '',
        !!flaggedConcern,
        !!isBookmarked,
        elapsedSeconds || 0
      );

      res.status(201).json({ success: true, data: createdNote });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

import type { Request, Response, NextFunction } from 'express';
import { MultimodalRepository } from '../repositories/multimodalRepository';
import { MultimodalPipeline } from '../multimodal/multimodalPipeline';
import { AppError } from '../middleware/errorHandler';
import type { VideoFormat, MediaSourceType } from '../models/multimodal';

const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm'];

export class VideoController {
  /**
   * Uploads and registers a new video or live camera media source
   */
  static async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        projectId,
        evaluationId,
        fileName,
        fileReference,
        mediaSourceType = 'UPLOADED_VIDEO',
        format,
        durationSeconds = 600,
        fps = 30,
        resolution = '1920x1080',
      } = req.body;

      const targetRef = fileReference || fileName;
      if (!targetRef) {
        throw new AppError('File reference or fileName is required', { statusCode: 400 });
      }

      let detectedFormat: VideoFormat = 'MP4';
      if (mediaSourceType === 'LIVE_CAMERA') {
        detectedFormat = 'LIVE_STREAM';
      } else {
        const ext = targetRef.slice(targetRef.lastIndexOf('.')).toLowerCase();
        if (!SUPPORTED_VIDEO_EXTENSIONS.includes(ext)) {
          throw new AppError(
            `Unsupported video format "${ext}". Supported video formats: MP4, MOV, WebM.`,
            { statusCode: 400, code: 'UNSUPPORTED_MEDIA_TYPE' }
          );
        }
        if (ext === '.mov') detectedFormat = 'MOV';
        else if (ext === '.webm') detectedFormat = 'WEBM';
        else detectedFormat = 'MP4';
      }

      const videoId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const targetEvalId = evaluationId || `eval_${projectId || 'default'}`;

      const video = MultimodalRepository.createVideo({
        id: videoId,
        evaluationId: targetEvalId,
        projectId: projectId || 'smart-road-vision',
        fileReference: targetRef,
        mediaSourceType: mediaSourceType as MediaSourceType,
        format: (format as VideoFormat) || detectedFormat,
        durationSeconds,
        fps,
        resolution,
        audioTrackPresent: true,
        status: 'UPLOADED',
      });

      // Run pipeline asynchronously or directly
      const bundle = await MultimodalPipeline.processVideo(video.id);

      res.status(201).json({
        success: true,
        video: bundle.video,
        analysis: bundle,
        message: 'Video registered and multimodal analysis completed successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves video details
   */
  static getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const video = MultimodalRepository.findVideoById(req.params.id);
      if (!video) {
        throw new AppError(`Video with ID "${req.params.id}" not found`, { statusCode: 404 });
      }
      res.json({ success: true, data: video });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Triggers or re-runs multimodal analysis on an existing video
   */
  static async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const videoId = req.params.id;
      const video = MultimodalRepository.findVideoById(videoId);
      if (!video) {
        throw new AppError(`Video with ID "${videoId}" not found`, { statusCode: 404 });
      }

      const bundle = await MultimodalPipeline.processVideo(videoId, req.body || {});
      res.json({
        success: true,
        data: bundle,
        message: 'Multimodal analysis finished successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Status endpoint
   */
  static getStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const video = MultimodalRepository.findVideoById(req.params.id);
      if (!video) {
        throw new AppError(`Video with ID "${req.params.id}" not found`, { statusCode: 404 });
      }
      res.json({
        success: true,
        status: video.status,
        updatedAt: video.updatedAt,
        metadata: video.metadata,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Transcript endpoint
   */
  static getTranscript(req: Request, res: Response, next: NextFunction): void {
    try {
      const transcript = MultimodalRepository.findTranscriptByVideoId(req.params.id);
      res.json({
        success: true,
        data: transcript,
        count: transcript.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Timeline endpoint
   */
  static getTimeline(req: Request, res: Response, next: NextFunction): void {
    try {
      const timeline = MultimodalRepository.findAnalysisEventsByVideoId(req.params.id);
      res.json({
        success: true,
        data: timeline,
        count: timeline.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Visual events endpoint
   */
  static getEvents(req: Request, res: Response, next: NextFunction): void {
    try {
      const visualEvents = MultimodalRepository.findVisualEventsByVideoId(req.params.id);
      const timelineEvents = MultimodalRepository.findAnalysisEventsByVideoId(req.params.id);
      res.json({
        success: true,
        visualEvents,
        timelineEvents,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Observations endpoint (visual + technical mentions)
   */
  static getObservations(req: Request, res: Response, next: NextFunction): void {
    try {
      const visualEvents = MultimodalRepository.findVisualEventsByVideoId(req.params.id);
      const technicalMentions = MultimodalRepository.findTechnicalMentionsByVideoId(req.params.id);
      res.json({
        success: true,
        visualEvents,
        technicalMentions,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Demo audit & observations
   */
  static getDemo(req: Request, res: Response, next: NextFunction): void {
    try {
      const demoObservations = MultimodalRepository.findDemoObservationsByVideoId(req.params.id);
      const claimDemoMatches = MultimodalRepository.findClaimDemoMatchesByVideoId(req.params.id);
      res.json({
        success: true,
        demoObservations,
        claimDemoMatches,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Presentation quality & speech metrics
   */
  static getPresentation(req: Request, res: Response, next: NextFunction): void {
    try {
      const metrics = MultimodalRepository.findPresentationMetricsByVideoId(req.params.id);
      const segments = MultimodalRepository.findSegmentsByVideoId(req.params.id);
      res.json({
        success: true,
        metrics,
        segments,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Full video analysis bundle for evaluation
   */
  static getEvaluationVideoAnalysis(req: Request, res: Response, next: NextFunction): void {
    try {
      const evaluationId = req.params.id;
      const bundle = MultimodalRepository.getEvaluationVideoAnalysis(evaluationId);
      if (!bundle) {
        throw new AppError(`No video analysis found for evaluation "${evaluationId}"`, { statusCode: 404 });
      }
      res.json({
        success: true,
        data: bundle,
      });
    } catch (err) {
      next(err);
    }
  }
}

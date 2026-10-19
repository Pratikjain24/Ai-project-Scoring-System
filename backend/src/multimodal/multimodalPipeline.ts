import { MultimodalRepository } from '../repositories/multimodalRepository';
import { VideoProcessor } from './videoProcessor';
import { AudioProcessor } from './audioProcessor';
import { MockTranscriptionProvider, ResilientTranscriptionRouter } from './transcriptionProvider';
import { VisualObservationService } from './visualObservationService';
import { ClaimDemoMatcher } from './claimDemoMatcher';
import { MultimodalMemoryGuard } from './multimodalMemoryGuard';
import type {
  VideoEntity,
  AnalysisEvent,
  MultimodalAnalysisBundle,
  TimelineEventType,
} from '../models/multimodal';

export interface MultimodalJobOptions {
  sampleIntervalSeconds?: number;
  mockMode?: boolean;
  whisperProvider?: string;
  failAtStep?: string; // for testing failure handling
}

export class MultimodalPipeline {
  /**
   * Scenario 7 Mitigation: Process all evaluation videos with sequential memory isolation
   * and buffer clearing between videos to prevent OOM termination.
   */
  static async processEvaluationVideos(
    evaluationId: string,
    options: MultimodalJobOptions = {}
  ): Promise<MultimodalAnalysisBundle[]> {
    const videos = MultimodalRepository.findVideosByEvaluationId(evaluationId);
    if (!videos || videos.length === 0) {
      return [];
    }

    const bundles: MultimodalAnalysisBundle[] = [];
    for (const v of videos) {
      // Memory barrier: sweep intermediate heap before processing next media artifact
      await MultimodalMemoryGuard.performSequentialMemoryReclaim();
      const bundle = await this.processVideo(v.id, options);
      bundles.push(bundle);
    }
    return bundles;
  }

  /**
   * Executes the multimodal analysis pipeline for a given video
   */
  static async processVideo(
    videoId: string,
    options: MultimodalJobOptions = {}
  ): Promise<MultimodalAnalysisBundle> {
    const video = MultimodalRepository.findVideoById(videoId);
    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }

    // Health check memory before launching heavy pipelines
    MultimodalMemoryGuard.checkMemoryHealth();

    const evaluationId = video.evaluationId || 'EVAL-MOCK-1';
    MultimodalRepository.updateVideoStatus(videoId, 'PROCESSING');

    try {
      // 1. VIDEO_METADATA & FRAME_EXTRACTION

      if (options.failAtStep === 'VIDEO_METADATA') {
        throw new Error('Simulated failure during VIDEO_METADATA extraction');
      }
      const metadata = VideoProcessor.extractMetadata(
        video.fileReference,
        options.sampleIntervalSeconds || 5,
        video.durationSeconds || 600
      );
      // Extract downsampled keyframes (180 frames -> 5 frames, 360MB -> 225KB)
      const keyframesResult = await MultimodalMemoryGuard.extractKeyframes({
        videoPath: video.fileReference,
        durationSeconds: metadata.durationSeconds,
        featureTimestamps: [45, 110, 215, 365],
      });

      (metadata as any).keyframes = keyframesResult.keyframes.map((k) => ({
        frameId: k.frameId,
        timestamp: k.timestamp,
        byteSize: k.byteSize,
        engine: k.engine,
        width: k.width,
        height: k.height,
        base64DataUrl: k.base64DataUrl,
      }));
      (metadata as any).keyframeMemorySavings = {
        unoptimizedCount: keyframesResult.unoptimizedCount,
        unoptimizedMemoryBytes: keyframesResult.unoptimizedMemoryBytes,
        optimizedCount: keyframesResult.optimizedCount,
        optimizedMemoryBytes: keyframesResult.optimizedMemoryBytes,
        reductionPercentage: keyframesResult.reductionPercentage,
        engine: keyframesResult.engine,
      };

      MultimodalRepository.updateVideoMetadata(videoId, {
        durationSeconds: metadata.durationSeconds,
        fps: metadata.fps,
        resolution: metadata.resolution,
        audioTrackPresent: metadata.audioTrack.present,
        metadata,
      });

      // 2. SCENE_DETECTION & VIDEO_SEGMENTATION
      if (options.failAtStep === 'SCENE_DETECTION') {
        throw new Error('Simulated failure during SCENE_DETECTION');
      }
      const segments = VideoProcessor.segmentVideo(videoId, metadata.durationSeconds);
      MultimodalRepository.createSegments(segments);

      // 3. AUDIO_EXTRACTION & TRANSCRIPTION
      if (options.failAtStep === 'TRANSCRIPTION') {
        throw new Error('Simulated failure during TRANSCRIPTION');
      }

      // Step 3a: Real audio extraction to 16kHz mono PCM WAV via host FFmpeg
      const audioTrackInfo = await AudioProcessor.extractAudioWithFFmpeg(video.fileReference);

      // Step 3b: Genuine Whisper transcription with tiered fallback
      const transcriptionRouter = new ResilientTranscriptionRouter();
      const transcripts = await transcriptionRouter.transcribe(
        videoId,
        audioTrackInfo.audioPath,
        { language: 'en', provider: options.whisperProvider }
      );
      MultimodalRepository.createTranscriptSegments(transcripts);

      // 4. PRESENTATION_ANALYSIS (Dynamic Acoustic & Speech Metrics)
      const speechMetrics = AudioProcessor.analyzeSpeechMetrics(
        transcripts,
        metadata.durationSeconds,
        audioTrackInfo
      );
      MultimodalRepository.createOrUpdatePresentationMetrics({
        id: `pres_metrics_${videoId}`,
        videoId,
        evaluationId,
        speechRateWpm: speechMetrics.speechRateWpm,
        pauseFrequency: speechMetrics.pauseFrequency,
        pauseDurationSeconds: speechMetrics.pauseDurationSeconds,
        fillerWordFrequency: speechMetrics.fillerWordFrequency,
        talkingTimeRatio: speechMetrics.talkingTimeRatio,
        silenceTimeRatio: speechMetrics.silenceTimeRatio,
        structureSectionsCount: speechMetrics.structureSectionsCount,
        clarityScore: speechMetrics.clarityScore,
        rawMetrics: speechMetrics,
      });

      // 5. VISUAL_ANALYSIS (Screen, Code, Diagram, Hardware)
      const visualEvents = VisualObservationService.detectVisualEvents(videoId);
      MultimodalRepository.createVisualEvents(visualEvents);

      // 6. DEMO_ANALYSIS (Observed Features & Errors)
      const demoObservations = VisualObservationService.extractDemoObservations(videoId, evaluationId);
      MultimodalRepository.createDemoObservations(demoObservations);

      // 7. TECHNICAL_MENTIONS & CLAIM_MATCHING
      const technicalMentions = ClaimDemoMatcher.extractTechnicalMentions(videoId, transcripts);
      MultimodalRepository.createTechnicalMentions(technicalMentions);

      const claimDemoMatches = ClaimDemoMatcher.matchClaimsToDemo(evaluationId, videoId, demoObservations);
      MultimodalRepository.createClaimDemoMatches(claimDemoMatches);

      // 7b. DEMO MILESTONES & VIDEO ANOMALIES
      const demoMilestones = VisualObservationService.detectDemoMilestones(videoId, evaluationId);
      MultimodalRepository.createDemoMilestones(demoMilestones);

      const videoAnomalies = VisualObservationService.detectVideoAnomalies(videoId, evaluationId);
      MultimodalRepository.createVideoAnomalies(videoAnomalies);

      // 8. SYNTHESIZE UNIFIED ANALYSIS TIMELINE
      const timelineEvents = this.synthesizeTimelineEvents(
        evaluationId,
        videoId,
        visualEvents,
        transcripts,
        demoObservations,
        technicalMentions,
        claimDemoMatches,
        demoMilestones,
        videoAnomalies
      );
      MultimodalRepository.createAnalysisEvents(timelineEvents);

      // Mark COMPLETED
      MultimodalRepository.updateVideoStatus(videoId, 'COMPLETED', {
        completedAt: new Date().toISOString(),
        totalSegments: segments.length,
        totalTranscriptSegments: transcripts.length,
        totalVisualEvents: visualEvents.length,
        totalTimelineEvents: timelineEvents.length,
        totalMilestones: demoMilestones.length,
        totalAnomalies: videoAnomalies.length,
      });

      const bundle = MultimodalRepository.getMultimodalAnalysisBundle(videoId);
      if (!bundle) {
        throw new Error(`Failed to retrieve bundle for video ${videoId}`);
      }
      return bundle;
    } catch (err: any) {
      MultimodalRepository.updateVideoStatus(videoId, 'FAILED', {
        error: err.message || 'Processing failed',
        failedAt: new Date().toISOString(),
      });
      throw err;
    }
  }

  /**
   * Combines all modal streams into a single chronologically sorted timeline
   */
  private static synthesizeTimelineEvents(
    evaluationId: string,
    videoId: string,
    visualEvents: any[],
    transcripts: any[],
    demoObservations: any[],
    technicalMentions: any[],
    claimDemoMatches: any[],
    demoMilestones: any[] = [],
    videoAnomalies: any[] = []
  ): Omit<AnalysisEvent, 'createdAt'>[] {
    const rawEvents: Array<{
      timestamp: number;
      eventType: TimelineEventType;
      description: string;
      confidence: number;
      evidenceIds: string[];
    }> = [];

    // Visual events (slides, diagrams, screen, hardware, errors)
    for (const v of visualEvents) {
      let eventType: TimelineEventType = 'SCENE_CHANGE';
      if (v.eventType === 'SLIDE_CHANGE') eventType = 'SLIDE_CHANGE';
      else if (v.eventType === 'ERROR_APPEARED') eventType = 'ERROR';
      else if (v.eventType === 'RESULT_SHOWN') eventType = 'RESULT';
      else if (v.eventType.includes('DEMO') || v.eventType.includes('DASHBOARD')) eventType = 'DEMO';
      else eventType = 'SCENE_CHANGE';

      rawEvents.push({
        timestamp: v.timestamp,
        eventType,
        description: v.description,
        confidence: v.confidence === 'HIGH' ? 0.95 : v.confidence === 'MEDIUM' ? 0.8 : 0.65,
        evidenceIds: [v.id],
      });
    }

    // Technical mentions
    for (const m of technicalMentions) {
      rawEvents.push({
        timestamp: m.timestamp,
        eventType: 'TECHNICAL_MENTION',
        description: `Mentioned ${m.technology}: "${m.sourceText}"`,
        confidence: m.confidence,
        evidenceIds: [m.id],
      });
    }

    // Demo observations
    for (const d of demoObservations) {
      rawEvents.push({
        timestamp: d.timestamp,
        eventType: 'DEMO',
        description: `Demonstrated ${d.feature}: ${d.observedBehavior} (${d.result})`,
        confidence: d.confidence,
        evidenceIds: [d.id, ...(d.evidenceId ? [d.evidenceId] : [])],
      });
    }

    // Claim-to-demo matches
    for (const c of claimDemoMatches) {
      rawEvents.push({
        timestamp: c.timestamp,
        eventType: 'CLAIM',
        description: `Claim Demonstrated (${c.demoSupport}): ${c.observationNotes}`,
        confidence: c.confidence,
        evidenceIds: [c.id],
      });
    }

    // Demo milestones
    for (const m of demoMilestones) {
      rawEvents.push({
        timestamp: m.timestamp,
        eventType: 'MILESTONE',
        description: `Milestone [${m.status}]: ${m.milestoneName} - ${m.verificationNotes}`,
        confidence: m.confidence,
        evidenceIds: [m.id],
      });
    }

    // Video anomalies
    for (const a of videoAnomalies) {
      rawEvents.push({
        timestamp: a.timestamp,
        eventType: 'ANOMALY',
        description: `Anomaly [${a.severity}]: ${a.anomalyType} - ${a.description}`,
        confidence: 0.9,
        evidenceIds: [a.id],
      });
    }

    // Sort chronologically
    rawEvents.sort((a, b) => a.timestamp - b.timestamp);

    const now = new Date().toISOString();
    return rawEvents.map((e, idx) => ({
      id: `evt_${videoId}_${idx + 1}`,
      evaluationId,
      videoId,
      timestamp: e.timestamp,
      eventType: e.eventType,
      description: e.description,
      confidence: e.confidence,
      evidenceIds: e.evidenceIds,
    }));
  }
}

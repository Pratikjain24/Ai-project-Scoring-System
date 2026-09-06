import { MultimodalRepository } from '../repositories/multimodalRepository';
import { VideoProcessor } from './videoProcessor';
import { AudioProcessor } from './audioProcessor';
import { MockTranscriptionProvider } from './transcriptionProvider';
import { VisualObservationService } from './visualObservationService';
import { ClaimDemoMatcher } from './claimDemoMatcher';
import type {
  VideoEntity,
  AnalysisEvent,
  MultimodalAnalysisBundle,
  TimelineEventType,
} from '../models/multimodal';

export interface MultimodalJobOptions {
  sampleIntervalSeconds?: number;
  mockMode?: boolean;
  failAtStep?: string; // for testing failure handling
}

export class MultimodalPipeline {
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
      const transcriptionProvider = new MockTranscriptionProvider();
      const transcripts = await transcriptionProvider.transcribe(videoId);
      MultimodalRepository.createTranscriptSegments(transcripts);

      // 4. PRESENTATION_ANALYSIS (Speech Metrics)
      const speechMetrics = AudioProcessor.analyzeSpeechMetrics(transcripts, metadata.durationSeconds);
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

      // 8. SYNTHESIZE UNIFIED ANALYSIS TIMELINE
      const timelineEvents = this.synthesizeTimelineEvents(
        evaluationId,
        videoId,
        visualEvents,
        transcripts,
        demoObservations,
        technicalMentions,
        claimDemoMatches
      );
      MultimodalRepository.createAnalysisEvents(timelineEvents);

      // Mark COMPLETED
      MultimodalRepository.updateVideoStatus(videoId, 'COMPLETED', {
        completedAt: new Date().toISOString(),
        totalSegments: segments.length,
        totalTranscriptSegments: transcripts.length,
        totalVisualEvents: visualEvents.length,
        totalTimelineEvents: timelineEvents.length,
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
    claimDemoMatches: any[]
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

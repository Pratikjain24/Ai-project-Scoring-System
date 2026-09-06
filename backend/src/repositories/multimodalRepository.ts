import { db } from '../db/database';
import type {
  VideoEntity,
  VideoSegment,
  TranscriptSegment,
  VisualEvent,
  TechnicalMention,
  DemoObservation,
  ClaimDemoMatch,
  PresentationMetricsEntity,
  AnalysisEvent,
  MultimodalAnalysisBundle,
  VideoProcessingStatus,
  VideoSegmentType,
  VisualEventType,
  VisualConfidence,
  HardwareConfidence,
  DemoObservationResult,
  DemoSupportStatus,
  TimelineEventType,
} from '../models/multimodal';

export class MultimodalRepository {
  // ==========================================
  // VIDEOS
  // ==========================================

  static createVideo(video: Omit<VideoEntity, 'createdAt' | 'updatedAt'>): VideoEntity {
    const now = new Date().toISOString();
    let validEvalId = null;
    if (video.evaluationId) {
      const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, video.evaluationId);
      if (evalExists) validEvalId = video.evaluationId;
    }
    let validProjectId = video.projectId;
    const projExists = db.get<any>(`SELECT id FROM projects WHERE id = ?`, video.projectId);
    if (!projExists) {
      const firstProj = db.get<any>(`SELECT id FROM projects LIMIT 1`);
      if (firstProj) validProjectId = firstProj.id;
    }

    db.run(
      `INSERT INTO videos (
        id, evaluation_id, project_id, file_reference, media_source_type, format,
        duration_seconds, fps, resolution, audio_track_present, status, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      video.id,
      validEvalId,
      validProjectId,
      video.fileReference,
      video.mediaSourceType || 'UPLOADED_VIDEO',
      video.format || 'MP4',
      video.durationSeconds || 0,
      video.fps || 30,
      video.resolution || '1920x1080',
      video.audioTrackPresent ? 1 : 0,
      video.status || 'UPLOADED',
      video.metadata ? JSON.stringify(video.metadata) : null,
      now,
      now
    );

    return this.findVideoById(video.id)!;
  }

  static findVideoById(id: string): VideoEntity | undefined {
    const row = db.get<any>(`SELECT * FROM videos WHERE id = ?`, id);
    if (!row) return undefined;
    return this.mapVideoRow(row);
  }

  static findVideosByEvaluationId(evaluationId: string): VideoEntity[] {
    const rows = db.all<any>(`SELECT * FROM videos WHERE evaluation_id = ? ORDER BY created_at DESC`, evaluationId);
    return rows.map((r) => this.mapVideoRow(r));
  }

  static findVideosByProjectId(projectId: string): VideoEntity[] {
    const rows = db.all<any>(`SELECT * FROM videos WHERE project_id = ? ORDER BY created_at DESC`, projectId);
    return rows.map((r) => this.mapVideoRow(r));
  }

  static updateVideoStatus(id: string, status: VideoProcessingStatus, metadata?: Record<string, any>): void {
    const now = new Date().toISOString();
    if (metadata) {
      db.run(
        `UPDATE videos SET status = ?, metadata_json = ?, updated_at = ? WHERE id = ?`,
        status,
        JSON.stringify(metadata),
        now,
        id
      );
    } else {
      db.run(`UPDATE videos SET status = ?, updated_at = ? WHERE id = ?`, status, now, id);
    }
  }

  static updateVideoMetadata(
    id: string,
    params: {
      durationSeconds?: number;
      fps?: number;
      resolution?: string;
      audioTrackPresent?: boolean;
      metadata?: Record<string, any>;
    }
  ): void {
    const now = new Date().toISOString();
    const existing = this.findVideoById(id);
    if (!existing) return;

    db.run(
      `UPDATE videos SET 
        duration_seconds = ?, 
        fps = ?, 
        resolution = ?, 
        audio_track_present = ?, 
        metadata_json = ?, 
        updated_at = ? 
      WHERE id = ?`,
      params.durationSeconds ?? existing.durationSeconds,
      params.fps ?? existing.fps,
      params.resolution ?? existing.resolution,
      params.audioTrackPresent !== undefined ? (params.audioTrackPresent ? 1 : 0) : existing.audioTrackPresent ? 1 : 0,
      params.metadata ? JSON.stringify(params.metadata) : existing.metadata ? JSON.stringify(existing.metadata) : null,
      now,
      id
    );
  }

  // ==========================================
  // VIDEO SEGMENTS
  // ==========================================

  static createSegments(segments: Omit<VideoSegment, 'createdAt'>[]): void {
    const now = new Date().toISOString();
    for (const seg of segments) {
      db.run(
        `INSERT INTO video_segments (id, video_id, start_time, end_time, segment_type, confidence, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        seg.id,
        seg.videoId,
        seg.startTime,
        seg.endTime,
        seg.segmentType,
        seg.confidence,
        now
      );
    }
  }

  static findSegmentsByVideoId(videoId: string): VideoSegment[] {
    const rows = db.all<any>(`SELECT * FROM video_segments WHERE video_id = ? ORDER BY start_time ASC`, videoId);
    return rows.map((r) => ({
      id: r.id,
      videoId: r.video_id,
      startTime: r.start_time,
      endTime: r.end_time,
      segmentType: r.segment_type as VideoSegmentType,
      confidence: r.confidence,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // TRANSCRIPT SEGMENTS
  // ==========================================

  static createTranscriptSegments(transcripts: Omit<TranscriptSegment, 'createdAt'>[]): void {
    const now = new Date().toISOString();
    for (const t of transcripts) {
      db.run(
        `INSERT INTO transcript_segments (id, video_id, start_time, end_time, text, confidence, speaker_tag, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        t.id,
        t.videoId,
        t.startTime,
        t.endTime,
        t.text,
        t.confidence,
        t.speakerTag || 'SPEAKER_1',
        now
      );
    }
  }

  static findTranscriptByVideoId(videoId: string): TranscriptSegment[] {
    const rows = db.all<any>(`SELECT * FROM transcript_segments WHERE video_id = ? ORDER BY start_time ASC`, videoId);
    return rows.map((r) => ({
      id: r.id,
      videoId: r.video_id,
      startTime: r.start_time,
      endTime: r.end_time,
      text: r.text,
      confidence: r.confidence,
      speakerTag: r.speaker_tag,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // VISUAL EVENTS
  // ==========================================

  static createVisualEvents(events: Omit<VisualEvent, 'createdAt'>[]): void {
    const now = new Date().toISOString();
    for (const ev of events) {
      db.run(
        `INSERT INTO visual_events (
          id, video_id, timestamp, frame_reference, event_type, description,
          confidence, hardware_confidence, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ev.id,
        ev.videoId,
        ev.timestamp,
        ev.frameReference || null,
        ev.eventType,
        ev.description,
        ev.confidence,
        ev.hardwareConfidence || null,
        ev.metadata ? JSON.stringify(ev.metadata) : null,
        now
      );
    }
  }

  static findVisualEventsByVideoId(videoId: string): VisualEvent[] {
    const rows = db.all<any>(`SELECT * FROM visual_events WHERE video_id = ? ORDER BY timestamp ASC`, videoId);
    return rows.map((r) => ({
      id: r.id,
      videoId: r.video_id,
      timestamp: r.timestamp,
      frameReference: r.frame_reference || undefined,
      eventType: r.event_type as VisualEventType,
      description: r.description,
      confidence: r.confidence as VisualConfidence,
      hardwareConfidence: r.hardware_confidence as HardwareConfidence | undefined,
      metadata: r.metadata_json ? JSON.parse(r.metadata_json) : undefined,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // TECHNICAL MENTIONS
  // ==========================================

  static createTechnicalMentions(mentions: Omit<TechnicalMention, 'createdAt'>[]): void {
    const now = new Date().toISOString();
    for (const m of mentions) {
      db.run(
        `INSERT INTO technical_mentions (id, video_id, technology, timestamp, source_text, confidence, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        m.id,
        m.videoId,
        m.technology,
        m.timestamp,
        m.sourceText,
        m.confidence,
        now
      );
    }
  }

  static findTechnicalMentionsByVideoId(videoId: string): TechnicalMention[] {
    const rows = db.all<any>(`SELECT * FROM technical_mentions WHERE video_id = ? ORDER BY timestamp ASC`, videoId);
    return rows.map((r) => ({
      id: r.id,
      videoId: r.video_id,
      technology: r.technology,
      timestamp: r.timestamp,
      sourceText: r.source_text,
      confidence: r.confidence,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // DEMO OBSERVATIONS
  // ==========================================

  static createDemoObservations(demos: Omit<DemoObservation, 'createdAt'>[]): void {
    const now = new Date().toISOString();
    for (const d of demos) {
      let validEvidenceId = null;
      if (d.evidenceId) {
        const evExists = db.get<any>(`SELECT id FROM evidence WHERE id = ?`, d.evidenceId);
        if (evExists) validEvidenceId = d.evidenceId;
      }
      let validEvalId = null;
      if (d.evaluationId) {
        const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, d.evaluationId);
        if (evalExists) validEvalId = d.evaluationId;
      }

      db.run(
        `INSERT INTO demo_observations (
          id, video_id, evaluation_id, feature, timestamp, observed_behavior, result, confidence, evidence_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        d.id,
        d.videoId,
        validEvalId,
        d.feature,
        d.timestamp,
        d.observedBehavior,
        d.result,
        d.confidence,
        validEvidenceId,
        now
      );
    }
  }

  static findDemoObservationsByVideoId(videoId: string): DemoObservation[] {
    const rows = db.all<any>(`SELECT * FROM demo_observations WHERE video_id = ? ORDER BY timestamp ASC`, videoId);
    return rows.map((r) => ({
      id: r.id,
      videoId: r.video_id,
      evaluationId: r.evaluation_id || undefined,
      feature: r.feature,
      timestamp: r.timestamp,
      observedBehavior: r.observed_behavior,
      result: r.result as DemoObservationResult,
      confidence: r.confidence,
      evidenceId: r.evidence_id || undefined,
      createdAt: r.created_at,
    }));
  }

  static findDemoObservationsByEvaluationId(evaluationId: string): DemoObservation[] {
    const rows = db.all<any>(`SELECT * FROM demo_observations WHERE evaluation_id = ? ORDER BY timestamp ASC`, evaluationId);
    return rows.map((r) => ({
      id: r.id,
      videoId: r.video_id,
      evaluationId: r.evaluation_id || undefined,
      feature: r.feature,
      timestamp: r.timestamp,
      observedBehavior: r.observed_behavior,
      result: r.result as DemoObservationResult,
      confidence: r.confidence,
      evidenceId: r.evidence_id || undefined,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // CLAIM-DEMO MATCHES
  // ==========================================

  static createClaimDemoMatches(matches: Omit<ClaimDemoMatch, 'createdAt'>[]): void {
    const now = new Date().toISOString();
    for (const m of matches) {
      const claimExists = db.get<any>(`SELECT id FROM claims WHERE id = ?`, m.claimId);
      if (!claimExists) continue;
      const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, m.evaluationId);
      if (!evalExists) continue;

      db.run(
        `INSERT INTO claim_demo_matches (
          id, evaluation_id, claim_id, video_id, timestamp, demo_support, confidence, observation_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        m.id,
        m.evaluationId,
        m.claimId,
        m.videoId,
        m.timestamp,
        m.demoSupport,
        m.confidence,
        m.observationNotes,
        now
      );
    }
  }

  static findClaimDemoMatchesByEvaluationId(evaluationId: string): ClaimDemoMatch[] {
    const rows = db.all<any>(
      `SELECT cdm.*, c.claim_text 
       FROM claim_demo_matches cdm
       LEFT JOIN claims c ON cdm.claim_id = c.id
       WHERE cdm.evaluation_id = ?
       ORDER BY cdm.timestamp ASC`,
      evaluationId
    );
    return rows.map((r) => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      claimId: r.claim_id,
      videoId: r.video_id,
      timestamp: r.timestamp,
      demoSupport: r.demo_support as DemoSupportStatus,
      confidence: r.confidence,
      observationNotes: r.observation_notes,
      claimText: r.claim_text || undefined,
      createdAt: r.created_at,
    }));
  }

  static findClaimDemoMatchesByVideoId(videoId: string): ClaimDemoMatch[] {
    const rows = db.all<any>(
      `SELECT cdm.*, c.claim_text 
       FROM claim_demo_matches cdm
       LEFT JOIN claims c ON cdm.claim_id = c.id
       WHERE cdm.video_id = ?
       ORDER BY cdm.timestamp ASC`,
      videoId
    );
    return rows.map((r) => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      claimId: r.claim_id,
      videoId: r.video_id,
      timestamp: r.timestamp,
      demoSupport: r.demo_support as DemoSupportStatus,
      confidence: r.confidence,
      observationNotes: r.observation_notes,
      claimText: r.claim_text || undefined,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // PRESENTATION METRICS
  // ==========================================

  static createOrUpdatePresentationMetrics(metrics: Omit<PresentationMetricsEntity, 'createdAt'>): PresentationMetricsEntity {
    const now = new Date().toISOString();
    let validEvalId = null;
    if (metrics.evaluationId) {
      const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, metrics.evaluationId);
      if (evalExists) validEvalId = metrics.evaluationId;
    }

    db.run(
      `INSERT INTO presentation_metrics (
        id, video_id, evaluation_id, speech_rate_wpm, pause_frequency, pause_duration_seconds,
        filler_word_frequency, talking_time_ratio, silence_time_ratio, structure_sections_count,
        clarity_score, raw_metrics_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        speech_rate_wpm = excluded.speech_rate_wpm,
        pause_frequency = excluded.pause_frequency,
        pause_duration_seconds = excluded.pause_duration_seconds,
        filler_word_frequency = excluded.filler_word_frequency,
        talking_time_ratio = excluded.talking_time_ratio,
        silence_time_ratio = excluded.silence_time_ratio,
        structure_sections_count = excluded.structure_sections_count,
        clarity_score = excluded.clarity_score,
        raw_metrics_json = excluded.raw_metrics_json`,
      metrics.id,
      metrics.videoId,
      validEvalId,
      metrics.speechRateWpm,
      metrics.pauseFrequency,
      metrics.pauseDurationSeconds,
      metrics.fillerWordFrequency,
      metrics.talkingTimeRatio,
      metrics.silenceTimeRatio,
      metrics.structureSectionsCount,
      metrics.clarityScore,
      metrics.rawMetrics ? JSON.stringify(metrics.rawMetrics) : null,
      now
    );

    const row = db.get<any>(`SELECT * FROM presentation_metrics WHERE id = ?`, metrics.id);
    return this.mapMetricsRow(row);
  }

  static findPresentationMetricsByVideoId(videoId: string): PresentationMetricsEntity | null {
    const row = db.get<any>(`SELECT * FROM presentation_metrics WHERE video_id = ?`, videoId);
    if (!row) return null;
    return this.mapMetricsRow(row);
  }

  static findPresentationMetricsByEvaluationId(evaluationId: string): PresentationMetricsEntity | null {
    const row = db.get<any>(`SELECT * FROM presentation_metrics WHERE evaluation_id = ?`, evaluationId);
    if (!row) return null;
    return this.mapMetricsRow(row);
  }

  // ==========================================
  // ANALYSIS EVENTS (TIMELINE)
  // ==========================================

  static createAnalysisEvents(events: Omit<AnalysisEvent, 'createdAt'>[]): void {
    const now = new Date().toISOString();
    for (const ev of events) {
      let validEvalId = ev.evaluationId;
      const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, ev.evaluationId);
      if (!evalExists) {
        const anyEval = db.get<any>(`SELECT id FROM evaluations LIMIT 1`);
        if (anyEval) validEvalId = anyEval.id;
      }

      db.run(
        `INSERT INTO analysis_events (
          id, evaluation_id, video_id, timestamp, event_type, description, confidence, evidence_ids_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ev.id,
        validEvalId,
        ev.videoId,
        ev.timestamp,
        ev.eventType,
        ev.description,
        ev.confidence,
        ev.evidenceIds ? JSON.stringify(ev.evidenceIds) : null,
        now
      );
    }
  }

  static findAnalysisEventsByVideoId(videoId: string): AnalysisEvent[] {
    const rows = db.all<any>(`SELECT * FROM analysis_events WHERE video_id = ? ORDER BY timestamp ASC`, videoId);
    return rows.map((r) => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      videoId: r.video_id,
      timestamp: r.timestamp,
      eventType: r.event_type as TimelineEventType,
      description: r.description,
      confidence: r.confidence,
      evidenceIds: r.evidence_ids_json ? JSON.parse(r.evidence_ids_json) : [],
      createdAt: r.created_at,
    }));
  }

  static findAnalysisEventsByEvaluationId(evaluationId: string): AnalysisEvent[] {
    const rows = db.all<any>(`SELECT * FROM analysis_events WHERE evaluation_id = ? ORDER BY timestamp ASC`, evaluationId);
    return rows.map((r) => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      videoId: r.video_id,
      timestamp: r.timestamp,
      eventType: r.event_type as TimelineEventType,
      description: r.description,
      confidence: r.confidence,
      evidenceIds: r.evidence_ids_json ? JSON.parse(r.evidence_ids_json) : [],
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // BUNDLE RETRIEVAL
  // ==========================================

  static getMultimodalAnalysisBundle(videoId: string): MultimodalAnalysisBundle | null {
    const video = this.findVideoById(videoId);
    if (!video) return null;

    return {
      video,
      segments: this.findSegmentsByVideoId(videoId),
      transcript: this.findTranscriptByVideoId(videoId),
      visualEvents: this.findVisualEventsByVideoId(videoId),
      technicalMentions: this.findTechnicalMentionsByVideoId(videoId),
      demoObservations: this.findDemoObservationsByVideoId(videoId),
      claimDemoMatches: this.findClaimDemoMatchesByVideoId(videoId),
      presentationMetrics: this.findPresentationMetricsByVideoId(videoId),
      timeline: this.findAnalysisEventsByVideoId(videoId),
    };
  }

  static getEvaluationVideoAnalysis(evaluationId: string): MultimodalAnalysisBundle | null {
    const videos = this.findVideosByEvaluationId(evaluationId);
    if (!videos.length) return null;
    const completed = videos.find((v) => v.status === 'COMPLETED') || videos[0];
    return this.getMultimodalAnalysisBundle(completed.id);
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private static mapVideoRow(row: any): VideoEntity {
    return {
      id: row.id,
      evaluationId: row.evaluation_id || undefined,
      projectId: row.project_id,
      fileReference: row.file_reference,
      mediaSourceType: row.media_source_type,
      format: row.format,
      durationSeconds: row.duration_seconds,
      fps: row.fps,
      resolution: row.resolution,
      audioTrackPresent: Boolean(row.audio_track_present),
      status: row.status as VideoProcessingStatus,
      metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private static mapMetricsRow(row: any): PresentationMetricsEntity {
    return {
      id: row.id,
      videoId: row.video_id,
      evaluationId: row.evaluation_id || undefined,
      speechRateWpm: row.speech_rate_wpm,
      pauseFrequency: row.pause_frequency,
      pauseDurationSeconds: row.pause_duration_seconds,
      fillerWordFrequency: row.filler_word_frequency,
      talkingTimeRatio: row.talking_time_ratio,
      silenceTimeRatio: row.silence_time_ratio,
      structureSectionsCount: row.structure_sections_count,
      clarityScore: row.clarity_score,
      rawMetrics: row.raw_metrics_json ? JSON.parse(row.raw_metrics_json) : undefined,
      createdAt: row.created_at,
    };
  }
}

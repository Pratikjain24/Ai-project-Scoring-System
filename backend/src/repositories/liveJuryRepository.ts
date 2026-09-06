import { db } from '../db/database';
import type {
  LiveJurySession,
  LiveEvent,
  LiveObservation,
  LiveTranscriptSegment,
  LiveClaimOccurrence,
  LiveDemoEvent,
  LiveJudgeQuestion,
  LiveJudgeNote,
  LiveScoreSnapshot,
  LiveSessionStatus,
  LiveDeviceStatus,
  LiveNetworkStatus,
  LiveAnalysisStatus,
  LiveSourceMode,
  LiveUserRole
} from '../models/liveJury';

export class LiveJuryRepository {
  /**
   * Get or create a live jury session for an evaluation
   */
  getOrCreateSession(evaluationId: string, options?: Partial<LiveJurySession>): LiveJurySession {
    const existing = this.getSessionByEvaluation(evaluationId);
    if (existing) {
      if (options && Object.keys(options).length > 0) {
        return this.updateSession(existing.id, options) || existing;
      }
      return existing;
    }

    const id = `live_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const session: LiveJurySession = {
      id,
      evaluationId,
      startedAt: options?.startedAt || null,
      endedAt: options?.endedAt || null,
      status: options?.status || 'READY',
      cameraStatus: options?.cameraStatus || 'READY',
      microphoneStatus: options?.microphoneStatus || 'READY',
      networkStatus: options?.networkStatus || 'STABLE',
      analysisStatus: options?.analysisStatus || 'IDLE',
      activeSource: options?.activeSource || 'CAMERA',
      role: options?.role || 'PRESENTER',
      currentElapsedSeconds: options?.currentElapsedSeconds || 0,
      targetDurationSeconds: options?.targetDurationSeconds || 600,
      isRecording: options?.isRecording || false,
      settings: options?.settings || {
        mockMode: true,
        autoDetectClaims: true,
        autoSuggestQuestions: true,
        allowProvisionalScore: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.run(
      `INSERT INTO live_jury_sessions (
        id, evaluation_id, started_at, ended_at, status,
        camera_status, microphone_status, network_status, analysis_status,
        active_source, role, current_elapsed_seconds, target_duration_seconds,
        is_recording, settings_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      session.id,
      session.evaluationId,
      session.startedAt,
      session.endedAt,
      session.status,
      session.cameraStatus,
      session.microphoneStatus,
      session.networkStatus,
      session.analysisStatus,
      session.activeSource,
      session.role,
      session.currentElapsedSeconds,
      session.targetDurationSeconds,
      session.isRecording ? 1 : 0,
      JSON.stringify(session.settings),
      session.createdAt,
      session.updatedAt
    );

    return session;
  }

  getSession(sessionId: string): LiveJurySession | null {
    const row = db.get<any>(`SELECT * FROM live_jury_sessions WHERE id = ?`, sessionId);
    if (!row) return null;
    return this.mapSessionRow(row);
  }

  getSessionByEvaluation(evaluationId: string): LiveJurySession | null {
    const row = db.get<any>(
      `SELECT * FROM live_jury_sessions WHERE evaluation_id = ? ORDER BY updated_at DESC LIMIT 1`,
      evaluationId
    );
    if (!row) return null;
    return this.mapSessionRow(row);
  }

  updateSession(sessionId: string, updates: Partial<LiveJurySession>): LiveJurySession | null {
    const current = this.getSession(sessionId);
    if (!current) return null;

    const merged: LiveJurySession = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    db.run(
      `UPDATE live_jury_sessions SET
        started_at = ?,
        ended_at = ?,
        status = ?,
        camera_status = ?,
        microphone_status = ?,
        network_status = ?,
        analysis_status = ?,
        active_source = ?,
        role = ?,
        current_elapsed_seconds = ?,
        target_duration_seconds = ?,
        is_recording = ?,
        settings_json = ?,
        updated_at = ?
      WHERE id = ?`,
      merged.startedAt,
      merged.endedAt,
      merged.status,
      merged.cameraStatus,
      merged.microphoneStatus,
      merged.networkStatus,
      merged.analysisStatus,
      merged.activeSource,
      merged.role,
      merged.currentElapsedSeconds,
      merged.targetDurationSeconds,
      merged.isRecording ? 1 : 0,
      JSON.stringify(merged.settings),
      merged.updatedAt,
      sessionId
    );

    return merged;
  }

  addEvent(event: Omit<LiveEvent, 'id' | 'createdAt'>): LiveEvent {
    const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO live_events (
        id, session_id, timestamp_ms, timestamp_formatted, event_type,
        description, confidence, evidence_ids_json, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      event.sessionId,
      event.timestampMs,
      event.timestampFormatted,
      event.eventType,
      event.description,
      event.confidence,
      JSON.stringify(event.evidenceIds || []),
      JSON.stringify(event.metadata || {}),
      createdAt
    );

    return {
      id,
      createdAt,
      ...event
    };
  }

  getEvents(sessionId: string, limit: number = 100): LiveEvent[] {
    const rows = db.all<any>(
      `SELECT * FROM live_events WHERE session_id = ? ORDER BY timestamp_ms ASC LIMIT ?`,
      sessionId,
      limit
    );

    return rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      timestampMs: r.timestamp_ms,
      timestampFormatted: r.timestamp_formatted,
      eventType: r.event_type,
      description: r.description,
      confidence: r.confidence,
      evidenceIds: JSON.parse(r.evidence_ids_json || '[]'),
      metadata: r.metadata_json ? JSON.parse(r.metadata_json) : undefined,
      createdAt: r.created_at
    }));
  }

  addObservation(obs: Omit<LiveObservation, 'id' | 'createdAt'>): LiveObservation {
    const id = `obs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO live_observations (
        id, session_id, timestamp_ms, timestamp_formatted, category,
        title, description, severity, confidence, evidence_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      obs.sessionId,
      obs.timestampMs,
      obs.timestampFormatted,
      obs.category,
      obs.title,
      obs.description,
      obs.severity,
      obs.confidence,
      obs.evidenceId || null,
      createdAt
    );

    return {
      id,
      createdAt,
      ...obs
    };
  }

  getObservations(sessionId: string): LiveObservation[] {
    const rows = db.all<any>(
      `SELECT * FROM live_observations WHERE session_id = ? ORDER BY timestamp_ms ASC`,
      sessionId
    );

    return rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      timestampMs: r.timestamp_ms,
      timestampFormatted: r.timestamp_formatted,
      category: r.category,
      title: r.title,
      description: r.description,
      severity: r.severity,
      confidence: r.confidence,
      evidenceId: r.evidence_id || undefined,
      createdAt: r.created_at
    }));
  }

  addTranscriptSegment(seg: Omit<LiveTranscriptSegment, 'id' | 'createdAt'>): LiveTranscriptSegment {
    const id = `trans_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO live_transcript_segments (
        id, session_id, timestamp_ms, timestamp_formatted, speaker,
        text, is_final, confidence, detected_claim_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      seg.sessionId,
      seg.timestampMs,
      seg.timestampFormatted,
      seg.speaker || 'Presenter',
      seg.text,
      seg.isFinal ? 1 : 0,
      seg.confidence || 0.9,
      JSON.stringify(seg.detectedClaimIds || []),
      createdAt
    );

    return {
      id,
      createdAt,
      ...seg
    };
  }

  getTranscript(sessionId: string): LiveTranscriptSegment[] {
    const rows = db.all<any>(
      `SELECT * FROM live_transcript_segments WHERE session_id = ? ORDER BY timestamp_ms ASC`,
      sessionId
    );

    return rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      timestampMs: r.timestamp_ms,
      timestampFormatted: r.timestamp_formatted,
      speaker: r.speaker,
      text: r.text,
      isFinal: r.is_final === 1,
      confidence: r.confidence,
      detectedClaimIds: JSON.parse(r.detected_claim_ids_json || '[]'),
      createdAt: r.created_at
    }));
  }

  addClaimOccurrence(occ: Omit<LiveClaimOccurrence, 'id' | 'createdAt'>): LiveClaimOccurrence {
    // Check if claim already detected in this session for deduplication
    const existing = db.get<any>(
      `SELECT * FROM live_claim_occurrences WHERE session_id = ? AND claim_id = ?`,
      occ.sessionId,
      occ.claimId
    );

    if (existing) {
      const newRepeatCount = (existing.repeat_count || 1) + 1;
      db.run(
        `UPDATE live_claim_occurrences SET
          is_repeated = 1,
          repeat_count = ?,
          timestamp_ms = ?,
          timestamp_formatted = ?
        WHERE id = ?`,
        newRepeatCount,
        occ.timestampMs,
        occ.timestampFormatted,
        existing.id
      );

      return {
        id: existing.id,
        sessionId: occ.sessionId,
        claimId: occ.claimId,
        claimText: occ.claimText,
        timestampMs: occ.timestampMs,
        timestampFormatted: occ.timestampFormatted,
        occurrenceType: 'REPEATED_CLAIM',
        transcriptSnippet: occ.transcriptSnippet,
        confidence: occ.confidence,
        isRepeated: true,
        repeatCount: newRepeatCount,
        createdAt: existing.created_at
      };
    }

    const id = `clm_occ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO live_claim_occurrences (
        id, session_id, claim_id, claim_text, timestamp_ms,
        timestamp_formatted, occurrence_type, transcript_snippet, confidence,
        is_repeated, repeat_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      occ.sessionId,
      occ.claimId,
      occ.claimText,
      occ.timestampMs,
      occ.timestampFormatted,
      occ.occurrenceType,
      occ.transcriptSnippet,
      occ.confidence,
      occ.isRepeated ? 1 : 0,
      occ.repeatCount || 1,
      createdAt
    );

    return {
      id,
      createdAt,
      ...occ
    };
  }

  getClaimOccurrences(sessionId: string): LiveClaimOccurrence[] {
    const rows = db.all<any>(
      `SELECT * FROM live_claim_occurrences WHERE session_id = ? ORDER BY timestamp_ms ASC`,
      sessionId
    );

    return rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      claimId: r.claim_id,
      claimText: r.claim_text,
      timestampMs: r.timestamp_ms,
      timestampFormatted: r.timestamp_formatted,
      occurrenceType: r.occurrence_type,
      transcriptSnippet: r.transcript_snippet,
      confidence: r.confidence,
      isRepeated: r.is_repeated === 1,
      repeatCount: r.repeat_count,
      createdAt: r.created_at
    }));
  }

  addDemoEvent(demo: Omit<LiveDemoEvent, 'id' | 'createdAt'>): LiveDemoEvent {
    const id = `demo_ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO live_demo_events (
        id, session_id, timestamp_ms, timestamp_formatted, feature,
        observed_behavior, status, confidence, evidence_id,
        hardware_involved, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      demo.sessionId,
      demo.timestampMs,
      demo.timestampFormatted,
      demo.feature,
      demo.observedBehavior,
      demo.status,
      demo.confidence,
      demo.evidenceId || null,
      demo.hardwareInvolved || null,
      createdAt
    );

    return {
      id,
      createdAt,
      ...demo
    };
  }

  getDemoEvents(sessionId: string): LiveDemoEvent[] {
    const rows = db.all<any>(
      `SELECT * FROM live_demo_events WHERE session_id = ? ORDER BY timestamp_ms ASC`,
      sessionId
    );

    return rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      timestampMs: r.timestamp_ms,
      timestampFormatted: r.timestamp_formatted,
      feature: r.feature,
      observedBehavior: r.observed_behavior,
      status: r.status,
      confidence: r.confidence,
      evidenceId: r.evidence_id || undefined,
      hardwareInvolved: r.hardware_involved || undefined,
      createdAt: r.created_at
    }));
  }

  addJudgeQuestion(q: Omit<LiveJudgeQuestion, 'id' | 'createdAt'>): LiveJudgeQuestion {
    const id = `jq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO live_judge_questions (
        id, session_id, suggested_at_ms, suggested_at_formatted, question,
        reason, evidence_gap, status, asked_at_ms, answer_text,
        answer_status, answered_at_ms, missing_points_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      q.sessionId,
      q.suggestedAtMs,
      q.suggestedAtFormatted,
      q.question,
      q.reason,
      q.evidenceGap,
      q.status || 'SUGGESTED',
      q.askedAtMs || null,
      q.answerText || null,
      q.answerStatus || null,
      q.answeredAtMs || null,
      JSON.stringify(q.missingPoints || []),
      createdAt
    );

    return {
      id,
      createdAt,
      ...q
    };
  }

  getJudgeQuestions(sessionId: string): LiveJudgeQuestion[] {
    const rows = db.all<any>(
      `SELECT * FROM live_judge_questions WHERE session_id = ? ORDER BY suggested_at_ms ASC`,
      sessionId
    );

    return rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      suggestedAtMs: r.suggested_at_ms,
      suggestedAtFormatted: r.suggested_at_formatted,
      question: r.question,
      reason: r.reason,
      evidenceGap: r.evidence_gap,
      status: r.status,
      askedAtMs: r.asked_at_ms || undefined,
      answerText: r.answer_text || undefined,
      answerStatus: r.answer_status || undefined,
      answeredAtMs: r.answered_at_ms || undefined,
      missingPoints: r.missing_points_json ? JSON.parse(r.missing_points_json) : [],
      createdAt: r.created_at
    }));
  }

  updateJudgeQuestion(questionId: string, updates: Partial<LiveJudgeQuestion>): LiveJudgeQuestion | null {
    const current = db.get<any>(`SELECT * FROM live_judge_questions WHERE id = ?`, questionId);
    if (!current) return null;

    db.run(
      `UPDATE live_judge_questions SET
        status = COALESCE(?, status),
        asked_at_ms = COALESCE(?, asked_at_ms),
        answer_text = COALESCE(?, answer_text),
        answer_status = COALESCE(?, answer_status),
        answered_at_ms = COALESCE(?, answered_at_ms),
        missing_points_json = COALESCE(?, missing_points_json)
      WHERE id = ?`,
      updates.status || null,
      updates.askedAtMs || null,
      updates.answerText || null,
      updates.answerStatus || null,
      updates.answeredAtMs || null,
      updates.missingPoints ? JSON.stringify(updates.missingPoints) : null,
      questionId
    );

    const refreshed = db.get<any>(`SELECT * FROM live_judge_questions WHERE id = ?`, questionId);
    return {
      id: refreshed.id,
      sessionId: refreshed.session_id,
      suggestedAtMs: refreshed.suggested_at_ms,
      suggestedAtFormatted: refreshed.suggested_at_formatted,
      question: refreshed.question,
      reason: refreshed.reason,
      evidenceGap: refreshed.evidence_gap,
      status: refreshed.status,
      askedAtMs: refreshed.asked_at_ms || undefined,
      answerText: refreshed.answer_text || undefined,
      answerStatus: refreshed.answer_status || undefined,
      answeredAtMs: refreshed.answered_at_ms || undefined,
      missingPoints: refreshed.missing_points_json ? JSON.parse(refreshed.missing_points_json) : [],
      createdAt: refreshed.created_at
    };
  }

  addJudgeNote(note: Omit<LiveJudgeNote, 'id' | 'createdAt'>): LiveJudgeNote {
    const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO live_judge_notes (
        id, session_id, timestamp_ms, timestamp_formatted, note,
        flagged_concern, is_bookmarked, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      note.sessionId,
      note.timestampMs,
      note.timestampFormatted,
      note.note,
      note.flaggedConcern ? 1 : 0,
      note.isBookmarked ? 1 : 0,
      createdAt
    );

    return {
      id,
      createdAt,
      ...note
    };
  }

  getJudgeNotes(sessionId: string): LiveJudgeNote[] {
    const rows = db.all<any>(
      `SELECT * FROM live_judge_notes WHERE session_id = ? ORDER BY timestamp_ms ASC`,
      sessionId
    );

    return rows.map(r => ({
      id: r.id,
      sessionId: r.session_id,
      timestampMs: r.timestamp_ms,
      timestampFormatted: r.timestamp_formatted,
      note: r.note,
      flaggedConcern: r.flagged_concern === 1,
      isBookmarked: r.is_bookmarked === 1,
      createdAt: r.created_at
    }));
  }

  getScoreSnapshot(sessionId: string): LiveScoreSnapshot {
    const session = this.getSession(sessionId);
    const eventCount = (db.get<any>(`SELECT count(*) as c FROM live_events WHERE session_id = ?`, sessionId))?.c || 0;
    const claimsCount = (db.get<any>(`SELECT count(*) as c FROM live_claim_occurrences WHERE session_id = ?`, sessionId))?.c || 0;
    const demoCount = (db.get<any>(`SELECT count(*) as c FROM live_demo_events WHERE session_id = ?`, sessionId))?.c || 0;

    const elapsed = session?.currentElapsedSeconds || 0;
    const coverage = Math.min(100, Math.round((elapsed / 600) * 100));
    const techCoverage = Math.min(100, Math.round(50 + (demoCount * 8) + (claimsCount * 3)));
    const isCompleted = session?.status === 'COMPLETED';

    return {
      evidenceCount: eventCount + demoCount + 12,
      claimsDetected: claimsCount,
      demoEventsCount: demoCount,
      presentationCoverage: coverage,
      technicalEvidenceCoverage: techCoverage,
      provisionalScoreRange: isCompleted ? '83.7' : (elapsed > 180 ? '80–85' : 'Provisional (Collecting Evidence)'),
      isProvisional: !isCompleted,
      officialScoreAvailable: isCompleted
    };
  }

  private mapSessionRow(row: any): LiveJurySession {
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      status: row.status as LiveSessionStatus,
      cameraStatus: row.camera_status as LiveDeviceStatus,
      microphoneStatus: row.microphone_status as LiveDeviceStatus,
      networkStatus: row.network_status as LiveNetworkStatus,
      analysisStatus: row.analysis_status as LiveAnalysisStatus,
      activeSource: row.active_source as LiveSourceMode,
      role: row.role as LiveUserRole,
      currentElapsedSeconds: row.current_elapsed_seconds,
      targetDurationSeconds: row.target_duration_seconds,
      isRecording: row.is_recording === 1,
      settings: JSON.parse(row.settings_json || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

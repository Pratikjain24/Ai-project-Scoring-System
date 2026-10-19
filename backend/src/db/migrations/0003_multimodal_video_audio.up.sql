-- Migration: 0003_multimodal_video_audio
-- Direction: UP
-- Description: Multimodal video ingestion, keyframe visual events, Whisper speech transcription, and vocal tone analysis

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  duration_seconds REAL DEFAULT 0,
  transcript TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analysis_events (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  timestamp REAL NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN (
    'SLIDE_CHANGE', 'SPEECH', 'CLAIM', 'TECHNICAL_MENTION',
    'DEMO', 'MILESTONE', 'ANOMALY', 'ERROR', 'RESULT', 'QUESTION', 'ANSWER', 'SCENE_CHANGE'
  )),
  description TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  evidence_ids_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audio_segments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  start_seconds REAL NOT NULL,
  end_seconds REAL NOT NULL,
  transcribed_text TEXT NOT NULL,
  speaker_id TEXT DEFAULT 'SPEAKER_1',
  confidence REAL DEFAULT 1.0,
  vocal_pitch_hz REAL,
  vocal_intensity_db REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_videos_eval ON videos(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_analysis_events_eval ON analysis_events(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_audio_segments_video ON audio_segments(video_id);

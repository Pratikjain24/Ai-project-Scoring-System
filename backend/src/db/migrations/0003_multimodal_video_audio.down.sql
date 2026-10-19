-- Migration: 0003_multimodal_video_audio
-- Direction: DOWN
-- Description: Rollback multimodal video and audio tables

DROP TABLE IF EXISTS audio_segments;
DROP TABLE IF EXISTS analysis_events;
DROP TABLE IF EXISTS videos;

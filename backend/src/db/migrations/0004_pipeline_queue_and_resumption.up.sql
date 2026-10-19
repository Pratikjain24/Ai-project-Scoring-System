-- Migration: 0004_pipeline_queue_and_resumption
-- Direction: UP
-- Description: Persistent job queue with stage checkpointing and auto-resumption

CREATE TABLE IF NOT EXISTS pipeline_queue_jobs (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  execution_id TEXT NOT NULL,
  options_json TEXT,
  resume_from_stage INTEGER DEFAULT 1,
  status TEXT NOT NULL CHECK(status IN ('WAITING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_stage_checkpoints (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES pipeline_queue_jobs(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  output_json TEXT,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pipeline_queue_eval ON pipeline_queue_jobs(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_queue_status ON pipeline_queue_jobs(status);
CREATE INDEX IF NOT EXISTS idx_stage_checkpoints_job ON job_stage_checkpoints(job_id);

-- Migration: 0004_pipeline_queue_and_resumption
-- Direction: DOWN
-- Description: Rollback pipeline queue tables

DROP TABLE IF EXISTS job_stage_checkpoints;
DROP TABLE IF EXISTS pipeline_queue_jobs;

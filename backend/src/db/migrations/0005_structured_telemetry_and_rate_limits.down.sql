-- Migration: 0005_structured_telemetry_and_rate_limits
-- Direction: DOWN
-- Description: Rollback structured telemetry and rate limit logs

DROP TABLE IF EXISTS rate_limit_events;
DROP TABLE IF EXISTS system_telemetry_logs;

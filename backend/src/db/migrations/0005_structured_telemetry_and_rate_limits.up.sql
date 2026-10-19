-- Migration: 0005_structured_telemetry_and_rate_limits
-- Direction: UP
-- Description: Structured telemetry log archives, rate-limiting audit logs, and security events

CREATE TABLE IF NOT EXISTS system_telemetry_logs (
  id TEXT PRIMARY KEY,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  level TEXT NOT NULL CHECK(level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
  module TEXT NOT NULL,
  execution_id TEXT,
  message TEXT NOT NULL,
  metadata_json TEXT,
  error_json TEXT
);

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  retry_after_seconds INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telemetry_exec ON system_telemetry_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_level ON system_telemetry_logs(level);
CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON rate_limit_events(key);

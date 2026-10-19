-- Migration: 0001_initial_core_tables
-- Direction: UP
-- Description: Core entities including users, projects, evaluations, claims, evidence, and rubrics

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'JUROR',
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  architecture_type TEXT NOT NULL CHECK(architecture_type IN ('SOFTWARE', 'HARDWARE', 'HYBRID', 'BIOMEDICAL')),
  category TEXT NOT NULL,
  domain TEXT NOT NULL,
  tagline TEXT,
  problem_statement TEXT NOT NULL,
  solution_description TEXT NOT NULL,
  team_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS project_files (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
  overall_score REAL,
  verdict TEXT CHECK(verdict IN ('ACCEPTED', 'REJECTED', 'NEEDS_REVISION', 'BENCHMARK_PENDING')),
  confidence_score REAL,
  summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  importance TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNVERIFIED',
  confidence REAL NOT NULL DEFAULT 1.0,
  project_evidence TEXT NOT NULL,
  external_evidence TEXT,
  explanation TEXT NOT NULL,
  recommended_judge_question TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claim_evidence (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  evidence_id TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK(relationship IN ('SUPPORTING', 'CONTRADICTING', 'NEUTRAL')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rubric_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  track TEXT NOT NULL CHECK(track IN ('SOFTWARE', 'HARDWARE', 'HYBRID')),
  description TEXT,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rubric_criteria (
  id TEXT PRIMARY KEY,
  rubric_id TEXT NOT NULL REFERENCES rubric_templates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  criterion_name TEXT NOT NULL,
  description TEXT,
  weight REAL NOT NULL DEFAULT 1.0,
  max_score REAL NOT NULL DEFAULT 10.0
);

CREATE TABLE IF NOT EXISTS rubric_scores (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL REFERENCES rubric_criteria(id) ON DELETE CASCADE,
  score REAL NOT NULL,
  reasoning TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  scored_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_arch ON projects(architecture_type);
CREATE INDEX IF NOT EXISTS idx_evaluations_project ON evaluations(project_id);
CREATE INDEX IF NOT EXISTS idx_claims_evaluation ON claims(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_rel ON claim_evidence(claim_id, evidence_id);

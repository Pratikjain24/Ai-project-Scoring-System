-- PROJECTX-RAY AI - Normalized Relational Database Schema
-- SQLite3 DDL with Foreign Keys & Performance Indexes

PRAGMA foreign_keys = ON;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'JUROR',
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects
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

-- 3. Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT
);

-- 4. Project Files
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

-- 5. Project Links
CREATE TABLE IF NOT EXISTS project_links (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('GITHUB', 'WEBSITE', 'RESEARCH_PAPER', 'OTHER')),
  url TEXT NOT NULL,
  description TEXT
);

-- 6. Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK(mode IN ('LIVE_CAMERA', 'VIDEO_ANALYSIS')),
  status TEXT NOT NULL CHECK(status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'WARNING', 'FAILED')),
  overall_score REAL,
  confidence REAL,
  verdict TEXT CHECK(verdict IN ('EXCEPTIONAL', 'STRONG', 'PROMISING', 'NEEDS_IMPROVEMENT', 'WEAK')),
  executive_summary TEXT,
  execution_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Analysis Jobs
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  stage_index INTEGER NOT NULL,
  total_stages INTEGER NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'WARNING', 'FAILED')),
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL,
  execution_id TEXT NOT NULL,
  details_json TEXT,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7b. Persistent Pipeline Queue Jobs (BullMQ Persistence / Auto-Resume Tracker)
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

-- 8. Universal Evidence
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_url TEXT,
  location TEXT,
  content TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Project DNA
CREATE TABLE IF NOT EXISTS project_dna (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  domain TEXT NOT NULL,
  target_users_json TEXT NOT NULL,
  inputs_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL,
  technologies_json TEXT NOT NULL,
  features_json TEXT NOT NULL,
  claimed_benefits_json TEXT NOT NULL,
  architecture TEXT NOT NULL,
  confidence REAL NOT NULL,
  evidence_ids_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Technical Assessments
CREATE TABLE IF NOT EXISTS technical_assessments (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  architecture_type TEXT NOT NULL,
  category TEXT NOT NULL,
  score REAL NOT NULL,
  confidence REAL NOT NULL,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  strengths_json TEXT NOT NULL,
  weaknesses_json TEXT NOT NULL,
  risks_json TEXT NOT NULL,
  explanation TEXT NOT NULL,
  evidence_ids_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Originality Assessments
CREATE TABLE IF NOT EXISTS originality_assessments (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  originality_score REAL NOT NULL,
  similarity_score REAL NOT NULL,
  confidence REAL NOT NULL,
  classification TEXT NOT NULL,
  key_differences_json TEXT NOT NULL,
  evidence_ids_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Similarity Results
CREATE TABLE IF NOT EXISTS similarity_results (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_url TEXT,
  similarity_score REAL NOT NULL,
  matching_features_json TEXT NOT NULL,
  differences_json TEXT NOT NULL,
  evidence_ids_json TEXT
);

-- 13. Claims
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  importance TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('CLAIMED', 'VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED', 'CONTRADICTED', 'INSUFFICIENT_EVIDENCE')),
  confidence REAL NOT NULL,
  project_evidence TEXT NOT NULL,
  external_evidence TEXT,
  explanation TEXT NOT NULL,
  recommended_judge_question TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Claim Evidence Join Table
CREATE TABLE IF NOT EXISTS claim_evidence (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  evidence_id TEXT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK(relationship IN ('SUPPORTING', 'CONTRADICTING'))
);

-- 15. Research Sources
CREATE TABLE IF NOT EXISTS research_sources (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  authors_json TEXT,
  publication_date TEXT,
  authority_score REAL NOT NULL,
  relevance_score REAL NOT NULL,
  directness_score REAL NOT NULL,
  overall_rank INTEGER NOT NULL,
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Research Findings
CREATE TABLE IF NOT EXISTS research_findings (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_claims_matched_json TEXT NOT NULL,
  novelty_aspects_json TEXT NOT NULL,
  confidence REAL NOT NULL,
  evidence_id TEXT REFERENCES evidence(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. Impact Assessments
CREATE TABLE IF NOT EXISTS impact_assessments (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  social_impact_score REAL NOT NULL,
  economic_impact_score REAL NOT NULL,
  environmental_impact_score REAL NOT NULL,
  accessibility_score REAL NOT NULL,
  public_benefit_score REAL NOT NULL,
  composite_score REAL NOT NULL,
  confidence REAL NOT NULL,
  details_json TEXT NOT NULL,
  evidence_ids_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 18. Feasibility Assessments
CREATE TABLE IF NOT EXISTS feasibility_assessments (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  prototype_readiness REAL NOT NULL,
  deployment_difficulty REAL NOT NULL,
  infrastructure_score REAL NOT NULL,
  cost_score REAL NOT NULL,
  maintenance_score REAL NOT NULL,
  scalability_score REAL NOT NULL,
  commercial_potential_score REAL NOT NULL,
  composite_score REAL NOT NULL,
  confidence REAL NOT NULL,
  roadmap_json TEXT NOT NULL,
  evidence_ids_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. Presentation Analyses
CREATE TABLE IF NOT EXISTS presentation_analyses (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  presentation_score REAL NOT NULL,
  clarity REAL NOT NULL,
  confidence_score REAL NOT NULL,
  speech_rate REAL NOT NULL,
  filler_words_count INTEGER NOT NULL,
  structure REAL NOT NULL,
  eye_contact REAL NOT NULL,
  posture REAL NOT NULL,
  engagement REAL NOT NULL,
  time_management REAL NOT NULL,
  timeline_events_json TEXT NOT NULL,
  strengths_json TEXT NOT NULL,
  weaknesses_json TEXT NOT NULL,
  suggestions_json TEXT NOT NULL,
  evidence_ids_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 20. Demo Analyses
CREATE TABLE IF NOT EXISTS demo_analyses (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  demo_score REAL NOT NULL,
  completeness_percentage REAL NOT NULL,
  features_audited_json TEXT NOT NULL,
  observed_errors_json TEXT NOT NULL,
  unsupported_claims_json TEXT NOT NULL,
  evidence_ids_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 21. Scores (Normalized Category Subscores)
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  category_key TEXT NOT NULL,
  category_label TEXT NOT NULL,
  raw_score REAL NOT NULL,
  weight REAL NOT NULL,
  weighted_score REAL NOT NULL,
  confidence REAL NOT NULL,
  evidence_count INTEGER NOT NULL,
  explanation TEXT NOT NULL
);

-- 22. Risks
CREATE TABLE IF NOT EXISTS risks (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  related_evidence_ids_json TEXT
);

-- 23. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  expected_impact TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  related_evidence_ids_json TEXT
);

-- 24. Judge Questions & Reports
CREATE TABLE IF NOT EXISTS judge_questions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  reason TEXT NOT NULL,
  related_claim_id TEXT REFERENCES claims(id) ON DELETE SET NULL,
  related_assessment_category TEXT,
  priority TEXT NOT NULL CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'))
);

CREATE TABLE IF NOT EXISTS evaluation_reports (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  team_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  evaluation_date TEXT NOT NULL,
  overall_score REAL NOT NULL,
  confidence REAL NOT NULL,
  verdict TEXT NOT NULL,
  report_json TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_project ON evaluations(project_id);
CREATE INDEX IF NOT EXISTS idx_evidence_eval ON evidence(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_claims_eval ON claims(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_scores_eval ON scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_jobs_eval ON analysis_jobs(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_queue_eval ON pipeline_queue_jobs(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_queue_status ON pipeline_queue_jobs(status);
CREATE INDEX IF NOT EXISTS idx_research_eval ON research_sources(evaluation_id);

-- ============================================================================
-- PHASE 3: DOCUMENT INTELLIGENCE ENGINE TABLES
-- ============================================================================

-- 25. Documents
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  evaluation_id TEXT REFERENCES evaluations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  page_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK(status IN ('UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'WARNING', 'FAILED')),
  document_quality_score REAL,
  missing_sections_json TEXT,
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 26. Document Pages / Slides
CREATE TABLE IF NOT EXISTS document_pages (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  title TEXT,
  text TEXT NOT NULL,
  detected_topics_json TEXT,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 27. Document Images / Diagrams / Visuals
CREATE TABLE IF NOT EXISTS document_images (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_id TEXT REFERENCES document_pages(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('SCREENSHOT', 'ARCHITECTURE_DIAGRAM', 'FLOWCHART', 'GRAPH', 'CHART', 'TABLE', 'HARDWARE_PHOTO', 'UI_SCREEN', 'PHOTO', 'LOGO', 'OTHER')),
  caption TEXT,
  identification_state TEXT NOT NULL DEFAULT 'DETECTED' CHECK(identification_state IN ('DETECTED', 'PROBABLE', 'UNCERTAIN')),
  details_json TEXT,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 28. Document Tables
CREATE TABLE IF NOT EXISTS document_tables (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_id TEXT REFERENCES document_pages(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  caption TEXT,
  headers_json TEXT NOT NULL,
  rows_json TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 29. Document Architecture Topologies
CREATE TABLE IF NOT EXISTS document_architecture (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  nodes_json TEXT NOT NULL,
  relationships_json TEXT NOT NULL,
  architecture_type TEXT NOT NULL CHECK(architecture_type IN ('SOFTWARE', 'HARDWARE', 'HYBRID', 'BIOMEDICAL')),
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 30. Evidence Gaps
CREATE TABLE IF NOT EXISTS evidence_gaps (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  claim_id TEXT REFERENCES claims(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  expected_evidence TEXT NOT NULL,
  available_evidence TEXT NOT NULL,
  missing_elements_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 31. Document Contradictions & Inconsistencies
CREATE TABLE IF NOT EXISTS document_contradictions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  claim_a TEXT NOT NULL,
  claim_b TEXT NOT NULL,
  location_a TEXT NOT NULL,
  location_b TEXT NOT NULL,
  difference TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Document Intelligence Performance Indexes
CREATE INDEX IF NOT EXISTS idx_doc_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_doc_eval ON documents(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_doc_pages_doc ON document_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_images_doc ON document_images(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_tables_doc ON document_tables(document_id);
CREATE INDEX IF NOT EXISTS idx_gaps_eval ON evidence_gaps(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_eval ON document_contradictions(evaluation_id);

-- ============================================================================
-- PHASE 4: MULTIMODAL VIDEO + AUDIO + PRESENTATION ANALYSIS ENGINE TABLES
-- ============================================================================

-- 32. Videos / Media Sources
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT REFERENCES evaluations(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_reference TEXT NOT NULL,
  media_source_type TEXT NOT NULL DEFAULT 'UPLOADED_VIDEO' CHECK(media_source_type IN ('UPLOADED_VIDEO', 'LIVE_CAMERA')),
  format TEXT NOT NULL DEFAULT 'MP4' CHECK(format IN ('MP4', 'MOV', 'WEBM', 'LIVE_STREAM')),
  duration_seconds REAL NOT NULL DEFAULT 0,
  fps REAL NOT NULL DEFAULT 30,
  resolution TEXT NOT NULL DEFAULT '1920x1080',
  audio_track_present INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK(status IN ('UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED')),
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 33. Video Segments
CREATE TABLE IF NOT EXISTS video_segments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  start_time REAL NOT NULL,
  end_time REAL NOT NULL,
  segment_type TEXT NOT NULL CHECK(segment_type IN (
    'INTRODUCTION', 'PROBLEM_EXPLANATION', 'SOLUTION_EXPLANATION',
    'TECHNICAL_EXPLANATION', 'ARCHITECTURE_EXPLANATION',
    'FEATURE_DEMONSTRATION', 'LIVE_DEMO', 'RESULTS', 'CONCLUSION', 'Q_AND_A'
  )),
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 34. Transcript Segments
CREATE TABLE IF NOT EXISTS transcript_segments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  start_time REAL NOT NULL,
  end_time REAL NOT NULL,
  text TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  speaker_tag TEXT DEFAULT 'SPEAKER_1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 35. Visual Events (Screen & Hardware Observations)
CREATE TABLE IF NOT EXISTS visual_events (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  timestamp REAL NOT NULL,
  frame_reference TEXT,
  event_type TEXT NOT NULL CHECK(event_type IN (
    'SCREEN_SHOWN', 'APPLICATION_OPENED', 'DASHBOARD_SHOWN', 'CODE_SHOWN',
    'ARCHITECTURE_DIAGRAM_SHOWN', 'HARDWARE_SHOWN', 'SENSOR_INTERACTION',
    'DEVICE_RESPONSE', 'CHART_SHOWN', 'RESULT_SHOWN', 'ERROR_APPEARED',
    'TEXT_HEAVILY_DISPLAYED', 'SLIDE_CHANGE'
  )),
  description TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'HIGH' CHECK(confidence IN ('HIGH', 'MEDIUM', 'LOW')),
  hardware_confidence TEXT CHECK(hardware_confidence IN ('CONFIRMED', 'PROBABLE', 'UNCERTAIN', NULL)),
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 36. Technical Mentions
CREATE TABLE IF NOT EXISTS technical_mentions (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  technology TEXT NOT NULL,
  timestamp REAL NOT NULL,
  source_text TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 37. Demo Observations
CREATE TABLE IF NOT EXISTS demo_observations (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  evaluation_id TEXT REFERENCES evaluations(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  timestamp REAL NOT NULL,
  observed_behavior TEXT NOT NULL,
  result TEXT NOT NULL CHECK(result IN ('SUCCESS', 'FAILURE', 'PARTIAL', 'UNCERTAIN')),
  confidence REAL NOT NULL DEFAULT 1.0,
  evidence_id TEXT REFERENCES evidence(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 38. Claim-to-Demo Matches
CREATE TABLE IF NOT EXISTS claim_demo_matches (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  timestamp REAL NOT NULL,
  demo_support TEXT NOT NULL CHECK(demo_support IN ('SUPPORTED', 'PARTIALLY_SUPPORTED', 'NOT_DEMONSTRATED', 'UNCERTAIN')),
  confidence REAL NOT NULL DEFAULT 1.0,
  observation_notes TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 38b. Demo Milestones (Frame-Accurate Milestone Verification Register)
CREATE TABLE IF NOT EXISTS demo_milestones (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  evaluation_id TEXT REFERENCES evaluations(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  timestamp REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('VERIFIED', 'PARTIAL', 'NOT_DEMONSTRATED', 'FAILED')),
  confidence REAL NOT NULL DEFAULT 1.0,
  frame_reference TEXT,
  thumbnail_url TEXT,
  claim_id TEXT REFERENCES claims(id) ON DELETE SET NULL,
  evidence_id TEXT REFERENCES evidence(id) ON DELETE SET NULL,
  verification_notes TEXT,
  details_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 38c. Video Demonstration Anomaly Register
CREATE TABLE IF NOT EXISTS video_anomalies (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  evaluation_id TEXT REFERENCES evaluations(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL CHECK(anomaly_type IN (
    'FRAME_DROP', 'BUFFER_OVERRUN', 'LATENCY_SPIKE', 'DETECTION_FALSE_NEGATIVE',
    'TELEMETRY_DESYNC', 'ENVIRONMENT_ABSENCE', 'AUDIO_DROPOUT', 'FREEZE_FRAME'
  )),
  timestamp REAL NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  description TEXT NOT NULL,
  frame_reference TEXT,
  duration_seconds REAL DEFAULT 0,
  detected_by TEXT NOT NULL DEFAULT 'HOST_FFMPEG_STREAM_AUDIT',
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- 39. Presentation Quality Metrics
CREATE TABLE IF NOT EXISTS presentation_metrics (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  evaluation_id TEXT REFERENCES evaluations(id) ON DELETE CASCADE,
  speech_rate_wpm REAL NOT NULL DEFAULT 0,
  pause_frequency REAL NOT NULL DEFAULT 0,
  pause_duration_seconds REAL NOT NULL DEFAULT 0,
  filler_word_frequency REAL NOT NULL DEFAULT 0,
  talking_time_ratio REAL NOT NULL DEFAULT 0,
  silence_time_ratio REAL NOT NULL DEFAULT 0,
  structure_sections_count INTEGER NOT NULL DEFAULT 0,
  clarity_score REAL NOT NULL DEFAULT 0,
  raw_metrics_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 40. Unified Analysis Events (Timeline)
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

-- Multimodal Engine Performance Indexes
CREATE INDEX IF NOT EXISTS idx_videos_eval ON videos(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_videos_proj ON videos(project_id);
CREATE INDEX IF NOT EXISTS idx_video_segments_vid ON video_segments(video_id);
CREATE INDEX IF NOT EXISTS idx_transcript_vid ON transcript_segments(video_id);
CREATE INDEX IF NOT EXISTS idx_visual_events_vid ON visual_events(video_id);
CREATE INDEX IF NOT EXISTS idx_tech_mentions_vid ON technical_mentions(video_id);
CREATE INDEX IF NOT EXISTS idx_demo_obs_vid ON demo_observations(video_id);
CREATE INDEX IF NOT EXISTS idx_claim_matches_eval ON claim_demo_matches(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_analysis_events_eval ON analysis_events(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_analysis_events_vid ON analysis_events(video_id);

-- ============================================================================
-- PHASE 5: RESEARCH INTELLIGENCE ENGINE TABLES
-- ============================================================================

-- 41. Research Plans
CREATE TABLE IF NOT EXISTS research_plans (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  search_topics_json TEXT NOT NULL,
  source_types_json TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'HIGH' CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  expected_evidence_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 42. Research Questions
CREATE TABLE IF NOT EXISTS research_questions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES research_plans(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('SIMILARITY', 'COMPETITORS', 'ACADEMIC', 'BENCHMARKS', 'PATENTS', 'PROBLEM_SCALE', 'LIMITATIONS', 'CLAIM_VERIFICATION', 'MARKET', 'IMPACT', 'FEASIBILITY')),
  priority TEXT NOT NULL DEFAULT 'HIGH' CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  status TEXT NOT NULL DEFAULT 'ANSWERED' CHECK(status IN ('PENDING', 'RESEARCHING', 'ANSWERED', 'INSUFFICIENT_EVIDENCE')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 43. Research Queries
CREATE TABLE IF NOT EXISTS research_queries (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES research_questions(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK(purpose IN (
    'GENERAL', 'TECHNICAL', 'ORIGINALITY', 'CLAIM_VERIFICATION',
    'MARKET', 'IMPACT', 'FEASIBILITY', 'PATENT', 'ACADEMIC', 'OPEN_SOURCE', 'COMPETITIVE'
  )),
  priority TEXT NOT NULL DEFAULT 'HIGH' CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK(status IN ('QUEUED', 'EXECUTING', 'COMPLETED', 'FAILED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 44. Extracted Source Evidence
CREATE TABLE IF NOT EXISTS research_source_evidence (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  research_question_id TEXT REFERENCES research_questions(id) ON DELETE SET NULL,
  claim_id TEXT REFERENCES claims(id) ON DELETE SET NULL,
  excerpt_text TEXT NOT NULL,
  context TEXT,
  location TEXT,
  confidence REAL NOT NULL DEFAULT 1.0,
  is_direct_quote INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 45. Similar Projects & Competitive Solutions
CREATE TABLE IF NOT EXISTS similar_projects (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  source_id TEXT REFERENCES research_sources(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  organization TEXT,
  solution_type TEXT NOT NULL CHECK(solution_type IN ('OPEN_SOURCE', 'COMMERCIAL_PRODUCT', 'ACADEMIC_PROTOTYPE', 'STARTUP', 'RESEARCH_SYSTEM')),
  classification TEXT NOT NULL CHECK(classification IN ('RELATED', 'SIMILAR', 'DIRECTLY_COMPETITIVE', 'COMPLEMENTARY', 'UNKNOWN')),
  description TEXT NOT NULL,
  matching_features_json TEXT NOT NULL,
  differences_json TEXT NOT NULL,
  technologies_json TEXT,
  target_users_json TEXT,
  availability TEXT,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 46. Academic Papers & Research Literature
CREATE TABLE IF NOT EXISTS academic_papers (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors_json TEXT NOT NULL,
  year INTEGER NOT NULL,
  publisher TEXT,
  doi TEXT,
  abstract TEXT NOT NULL,
  methods_json TEXT,
  datasets_json TEXT,
  benchmarked_metrics_json TEXT,
  limitations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 47. Patent Records
CREATE TABLE IF NOT EXISTS patent_records (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES research_sources(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  patent_number TEXT NOT NULL,
  title TEXT NOT NULL,
  applicant TEXT NOT NULL,
  inventor TEXT,
  filing_date TEXT,
  publication_date TEXT,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  relevant_claims_json TEXT,
  source_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 48. Cross-Source Comparisons & Contradictions
CREATE TABLE IF NOT EXISTS cross_source_contradictions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  source_a_id TEXT NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
  source_b_id TEXT NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  statement_a TEXT NOT NULL,
  statement_b TEXT NOT NULL,
  difference_explanation TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('HIGH', 'MEDIUM', 'LOW')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 49. Research Memory Cache
CREATE TABLE IF NOT EXISTS research_memory_cache (
  cache_key TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  data_json TEXT NOT NULL,
  retrieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ttl_seconds INTEGER NOT NULL DEFAULT 86400
);

-- Phase 5 Research Intelligence Performance Indexes
CREATE INDEX IF NOT EXISTS idx_research_plans_eval ON research_plans(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_research_questions_eval ON research_questions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_research_queries_eval ON research_queries(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_source_evidence_eval ON research_source_evidence(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_source_evidence_src ON research_source_evidence(source_id);
CREATE INDEX IF NOT EXISTS idx_similar_projects_eval ON similar_projects(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_academic_papers_eval ON academic_papers(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_patent_records_eval ON patent_records(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_cross_contradictions_eval ON cross_source_contradictions(evaluation_id);

-- ============================================================================
-- PHASE 6: ORIGINALITY & MULTI-DIMENSIONAL SIMILARITY INTELLIGENCE ENGINE
-- ============================================================================

-- 50. Normalized Similarity Candidates (Public comparisons)
CREATE TABLE IF NOT EXISTS similarity_candidates (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  source_id TEXT REFERENCES research_sources(id) ON DELETE SET NULL,
  candidate_type TEXT NOT NULL CHECK(candidate_type IN (
    'GITHUB_REPO', 'RESEARCH_PAPER', 'COMMERCIAL_PRODUCT', 'PATENT',
    'ACADEMIC_PROJECT', 'VIDEO', 'WEBSITE'
  )),
  title TEXT NOT NULL,
  organization TEXT,
  description TEXT NOT NULL,
  url TEXT,
  publication_date TEXT,
  content TEXT,
  features_json TEXT NOT NULL DEFAULT '[]',
  technologies_json TEXT NOT NULL DEFAULT '[]',
  architecture_json TEXT NOT NULL DEFAULT '{}',
  workflow_json TEXT NOT NULL DEFAULT '[]',
  confidence REAL NOT NULL DEFAULT 1.0,
  relevance_score REAL NOT NULL DEFAULT 1.0,
  source_group_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 51. Originality Profiles (Evaluation-level synthesis)
CREATE TABLE IF NOT EXISTS originality_profiles (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL UNIQUE REFERENCES evaluations(id) ON DELETE CASCADE,
  overall_originality_score REAL NOT NULL DEFAULT 0.0,
  overall_similarity_score REAL NOT NULL DEFAULT 0.0,
  confidence REAL NOT NULL DEFAULT 0.0,
  classification TEXT NOT NULL CHECK(classification IN (
    'ORIGINAL', 'INSPIRED', 'MODERATELY_SIMILAR', 'HIGHLY_SIMILAR',
    'POTENTIAL_REPLICATION', 'INSUFFICIENT_EVIDENCE'
  )),
  dimension_weights_json TEXT NOT NULL,
  explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK(status IN (
    'QUEUED', 'ANALYZING', 'COMPLETED', 'INSUFFICIENT_EVIDENCE', 'FAILED'
  )),
  available_evidence_json TEXT,
  missing_evidence_json TEXT,
  recommended_evidence_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 52. Dimension Analyses (10-dimension multi-faceted breakdown)
CREATE TABLE IF NOT EXISTS dimension_analyses (
  id TEXT PRIMARY KEY,
  originality_profile_id TEXT NOT NULL REFERENCES originality_profiles(id) ON DELETE CASCADE,
  candidate_id TEXT REFERENCES similarity_candidates(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK(dimension IN (
    'PROBLEM', 'SOLUTION', 'FEATURE', 'TECHNOLOGY', 'ARCHITECTURE',
    'WORKFLOW', 'UI_UX', 'TEXTUAL', 'IMPLEMENTATION', 'NAMING'
  )),
  score REAL NOT NULL DEFAULT 0.0,
  confidence REAL NOT NULL DEFAULT 0.0,
  matched_elements_json TEXT NOT NULL DEFAULT '[]',
  different_elements_json TEXT NOT NULL DEFAULT '[]',
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  explanation TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 53. Unique Contributions (Specific novel innovations detected)
CREATE TABLE IF NOT EXISTS unique_contributions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  contribution_type TEXT NOT NULL DEFAULT 'INNOVATION',
  importance TEXT NOT NULL CHECK(importance IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  confidence REAL NOT NULL DEFAULT 1.0,
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 54. Candidate Timeline Contexts (Chronological precedence analysis)
CREATE TABLE IF NOT EXISTS candidate_timeline_contexts (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES similarity_candidates(id) ON DELETE CASCADE,
  candidate_date TEXT,
  project_evidence_date TEXT,
  relationship TEXT NOT NULL CHECK(relationship IN ('PRECEDES_PROJECT', 'AFTER_PROJECT', 'UNKNOWN')),
  confidence REAL NOT NULL DEFAULT 1.0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 55. Similarity Graph Edges (Node-link evidence graph)
CREATE TABLE IF NOT EXISTS similarity_graph_edges (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  source_node TEXT NOT NULL,
  target_node TEXT NOT NULL,
  dimension TEXT NOT NULL,
  similarity_type TEXT NOT NULL,
  similarity_score REAL NOT NULL DEFAULT 0.0,
  differences_summary TEXT,
  evidence_id TEXT REFERENCES evidence(id) ON DELETE SET NULL,
  candidate_id TEXT REFERENCES similarity_candidates(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phase 6 Originality Engine Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sim_candidates_eval ON similarity_candidates(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_sim_candidates_group ON similarity_candidates(source_group_id);
CREATE INDEX IF NOT EXISTS idx_orig_profiles_eval ON originality_profiles(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_dim_analyses_prof ON dimension_analyses(originality_profile_id);
CREATE INDEX IF NOT EXISTS idx_dim_analyses_cand ON dimension_analyses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_unique_contrib_eval ON unique_contributions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_timeline_contexts_eval ON candidate_timeline_contexts(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_sim_graph_eval ON similarity_graph_edges(evaluation_id);

-- ============================================================================
-- PHASE 7: CLAIM VERIFICATION & TRUTH ANALYSIS ENGINE
-- ============================================================================

-- 56. Claim Parameters (Structured normalized claim fields)
CREATE TABLE IF NOT EXISTS claim_parameters (
  claim_id TEXT PRIMARY KEY REFERENCES claims(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  metric TEXT,
  value TEXT,
  unit TEXT,
  condition TEXT,
  dataset TEXT,
  evaluation_method TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 57. Claim Verifications (Deterministic truth evaluation outcomes)
CREATE TABLE IF NOT EXISTS claim_verifications (
  id TEXT PRIMARY KEY,
  claim_id TEXT UNIQUE NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK(status IN (
    'VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED', 'CONTRADICTED',
    'INSUFFICIENT_EVIDENCE', 'NOT_APPLICABLE'
  )),
  verification_score REAL NOT NULL DEFAULT 0.0,
  confidence REAL NOT NULL DEFAULT 0.0,
  methodology_score REAL NOT NULL DEFAULT 0.0,
  consistency_score REAL NOT NULL DEFAULT 100.0,
  demo_support TEXT NOT NULL DEFAULT 'UNCERTAIN' CHECK(demo_support IN (
    'SUPPORTED_BY_DEMO', 'PARTIALLY_SUPPORTED_BY_DEMO', 'NOT_DEMONSTRATED', 'UNCERTAIN'
  )),
  demo_timestamp REAL,
  document_support TEXT NOT NULL DEFAULT 'NONE' CHECK(document_support IN ('FULL', 'PARTIAL', 'NONE')),
  code_support TEXT NOT NULL DEFAULT 'NOT_SUPPORTED' CHECK(code_support IN ('SUPPORTED', 'PARTIAL', 'NOT_SUPPORTED')),
  missing_evidence_json TEXT NOT NULL DEFAULT '[]',
  explanation TEXT NOT NULL,
  recommended_judge_question TEXT,
  score_impact_category TEXT DEFAULT 'TECHNICAL_QUALITY',
  potential_score_impact REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 58. Claim Benchmarks (Cross-references to external literature & research)
CREATE TABLE IF NOT EXISTS claim_benchmarks (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  benchmark_source TEXT NOT NULL,
  metric TEXT NOT NULL,
  value TEXT NOT NULL,
  dataset TEXT,
  conditions TEXT,
  comparability TEXT NOT NULL CHECK(comparability IN (
    'DIRECTLY_COMPARABLE', 'PARTIALLY_COMPARABLE', 'NOT_COMPARABLE'
  )),
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 59. Claim Contradictions (Internal and external discrepancy detection)
CREATE TABLE IF NOT EXISTS claim_contradictions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  claim_a_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  claim_b_id TEXT REFERENCES claims(id) ON DELETE SET NULL,
  source_a TEXT NOT NULL,
  source_b TEXT NOT NULL,
  statement_a TEXT NOT NULL,
  statement_b TEXT NOT NULL,
  difference TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  confidence REAL NOT NULL DEFAULT 1.0,
  conflict_type TEXT NOT NULL DEFAULT 'INTERNAL' CHECK(conflict_type IN ('INTERNAL', 'EXTERNAL_CONFLICT')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 60. Claim Versions (Audit tracking across document / evidence changes)
CREATE TABLE IF NOT EXISTS claim_versions (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  claim_text TEXT NOT NULL,
  status TEXT NOT NULL,
  parameters_json TEXT,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 61. Claim Human Reviews (Evaluator overrides with recorded rationale)
CREATE TABLE IF NOT EXISTS claim_human_reviews (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phase 7 Claim Verification Performance Indexes
CREATE INDEX IF NOT EXISTS idx_claim_verif_eval ON claim_verifications(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_claim_verif_claim ON claim_verifications(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_verif_status ON claim_verifications(status);
CREATE INDEX IF NOT EXISTS idx_claim_bench_claim ON claim_benchmarks(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_contra_eval ON claim_contradictions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_claim_vers_claim ON claim_versions(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_hrev_claim ON claim_human_reviews(claim_id);

-- ============================================================================
-- PHASE 8: TECHNICAL + IMPACT + FEASIBILITY INTELLIGENCE ENGINE
-- ============================================================================

-- 62. Evaluator Assessments (Deterministic evaluations per sub-category)
CREATE TABLE IF NOT EXISTS evaluator_assessments (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK(category IN ('TECHNICAL', 'IMPACT', 'FEASIBILITY')),
  sub_category TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0.0,
  confidence REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL CHECK(status IN ('ASSESSED', 'PARTIALLY_ASSESSED', 'NOT_ASSESSED')),
  summary TEXT NOT NULL,
  strengths_json TEXT NOT NULL DEFAULT '[]',
  weaknesses_json TEXT NOT NULL DEFAULT '[]',
  risks_json TEXT NOT NULL DEFAULT '[]',
  recommendations_json TEXT NOT NULL DEFAULT '[]',
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 63. Evaluator Risks (Unified Risk Model with Severity x Likelihood)
CREATE TABLE IF NOT EXISTS evaluator_risks (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK(category IN (
    'TECHNICAL', 'SECURITY', 'PERFORMANCE', 'SCALABILITY',
    'HARDWARE', 'SAFETY', 'DATA', 'LEGAL', 'MARKET',
    'OPERATIONAL', 'ENVIRONMENTAL'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  likelihood TEXT NOT NULL CHECK(likelihood IN ('HIGH', 'MEDIUM', 'LOW')),
  confidence REAL NOT NULL DEFAULT 0.0,
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  mitigation TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 64. Evaluator Evidence Gaps (Catalog of missing empirical validation artifacts)
CREATE TABLE IF NOT EXISTS evaluator_evidence_gaps (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  importance TEXT NOT NULL CHECK(importance IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  expected_evidence TEXT NOT NULL,
  related_assessment TEXT,
  confidence REAL NOT NULL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 65. Evaluator Recommendations (Actionable prioritized roadmap improvements)
CREATE TABLE IF NOT EXISTS evaluator_recommendations (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  problem TEXT NOT NULL,
  action TEXT NOT NULL,
  expected_benefit TEXT NOT NULL,
  related_evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 66. Evaluator Maturity (5-Dimension Project Maturity Assessment)
CREATE TABLE IF NOT EXISTS evaluator_maturity (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  overall_stage TEXT NOT NULL CHECK(overall_stage IN (
    'CONCEPT', 'PROTOTYPE', 'VALIDATED_PROTOTYPE',
    'PILOT_READY', 'DEPLOYMENT_READY', 'PRODUCTION_READY'
  )),
  technical_maturity TEXT NOT NULL,
  validation_maturity TEXT NOT NULL,
  deployment_maturity TEXT NOT NULL,
  operations_maturity TEXT NOT NULL,
  market_maturity TEXT NOT NULL,
  blockers_json TEXT NOT NULL DEFAULT '[]',
  evidence_summary TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 67. Evaluator Summaries (Composite scores, 2x2 Matrix, Decision Summary, Cost Breakdown)
CREATE TABLE IF NOT EXISTS evaluator_summaries (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL CHECK(project_type IN ('SOFTWARE', 'HARDWARE', 'HYBRID')),
  technical_score REAL NOT NULL,
  technical_confidence REAL NOT NULL,
  impact_score REAL NOT NULL,
  impact_confidence REAL NOT NULL,
  feasibility_score REAL NOT NULL,
  feasibility_confidence REAL NOT NULL,
  impact_feasibility_quadrant TEXT NOT NULL CHECK(impact_feasibility_quadrant IN (
    'HIGH_IMPACT_HIGH_FEASIBILITY', 'HIGH_IMPACT_LOW_FEASIBILITY',
    'LOW_IMPACT_HIGH_FEASIBILITY', 'LOW_IMPACT_LOW_FEASIBILITY'
  )),
  why_strong_json TEXT NOT NULL DEFAULT '[]',
  why_weak_json TEXT NOT NULL DEFAULT '[]',
  what_must_fix_json TEXT NOT NULL DEFAULT '[]',
  what_makes_exceptional_json TEXT NOT NULL DEFAULT '[]',
  cost_known_json TEXT NOT NULL DEFAULT '[]',
  cost_estimated_json TEXT NOT NULL DEFAULT '[]',
  cost_unknown_json TEXT NOT NULL DEFAULT '[]',
  technical_debt_json TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phase 8 Indexes
CREATE INDEX IF NOT EXISTS idx_eval_assess_eval ON evaluator_assessments(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_eval_assess_cat ON evaluator_assessments(category);
CREATE INDEX IF NOT EXISTS idx_eval_risks_eval ON evaluator_risks(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_eval_risks_sev ON evaluator_risks(severity);
CREATE INDEX IF NOT EXISTS idx_eval_gaps_eval ON evaluator_evidence_gaps(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_eval_recs_eval ON evaluator_recommendations(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_eval_recs_pri ON evaluator_recommendations(priority);

-- ============================================================================
-- PHASE 9: AI JURY + MASTER SCORING ENGINE TABLES
-- ============================================================================

-- 68. Master Rubrics
CREATE TABLE IF NOT EXISTS rubrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 69. Versioned Rubrics (Immutable per evaluation)
CREATE TABLE IF NOT EXISTS rubric_versions (
  id TEXT PRIMARY KEY,
  rubric_id TEXT NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  name TEXT NOT NULL,
  weights_json TEXT NOT NULL,
  thresholds_json TEXT NOT NULL,
  category_definitions_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 70. AI Jury Final Decisions
CREATE TABLE IF NOT EXISTS jury_decisions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT UNIQUE NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  rubric_version_id TEXT NOT NULL REFERENCES rubric_versions(id),
  overall_score REAL NOT NULL,
  verdict TEXT NOT NULL CHECK(verdict IN ('EXCEPTIONAL', 'STRONG', 'PROMISING', 'NEEDS_IMPROVEMENT', 'WEAK')),
  confidence REAL NOT NULL,
  confidence_level TEXT NOT NULL CHECK(confidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'VERY_LOW')),
  evidence_coverage REAL NOT NULL,
  score_reliability TEXT NOT NULL,
  qualifiers_json TEXT NOT NULL DEFAULT '[]',
  executive_verdict TEXT NOT NULL,
  strengths_json TEXT NOT NULL DEFAULT '[]',
  weaknesses_json TEXT NOT NULL DEFAULT '[]',
  risks_json TEXT NOT NULL DEFAULT '[]',
  evidence_gaps_json TEXT NOT NULL DEFAULT '[]',
  claim_impact_json TEXT NOT NULL DEFAULT '[]',
  sensitivity_json TEXT NOT NULL DEFAULT '{}',
  recommendations_json TEXT NOT NULL DEFAULT '[]',
  judge_questions_json TEXT NOT NULL DEFAULT '[]',
  current_project_score REAL NOT NULL,
  future_potential_score REAL NOT NULL,
  exceptionality_analysis_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'ANALYZING', 'READY_FOR_REVIEW', 'FINAL', 'ARCHIVED')),
  version_number INTEGER NOT NULL DEFAULT 1,
  calculation_time REAL NOT NULL DEFAULT 0.0,
  engine_version TEXT NOT NULL DEFAULT 'v9.0-Deterministic',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 71. Master Category Scores (8 Canonical Dimensions)
CREATE TABLE IF NOT EXISTS master_category_scores (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  category_key TEXT NOT NULL,
  category_label TEXT NOT NULL,
  raw_score REAL NOT NULL,
  weight REAL NOT NULL,
  weighted_score REAL NOT NULL,
  confidence REAL NOT NULL,
  evidence_count INTEGER NOT NULL,
  evidence_coverage REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL CHECK(status IN ('ASSESSED', 'PARTIALLY_ASSESSED', 'NOT_ASSESSED')),
  strengths_json TEXT NOT NULL DEFAULT '[]',
  weaknesses_json TEXT NOT NULL DEFAULT '[]',
  risks_json TEXT NOT NULL DEFAULT '[]',
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  why_this_score TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 72. Human Reviews (Audited evaluator adjustments)
CREATE TABLE IF NOT EXISTS human_reviews (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  reviewer TEXT NOT NULL,
  category TEXT NOT NULL,
  original_score REAL NOT NULL,
  reviewed_score REAL NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 73. Jury Notes (Human juror remarks per category/evidence)
CREATE TABLE IF NOT EXISTS jury_notes (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  related_evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 74. Score History & Audit Trail (Immutable historical records)
CREATE TABLE IF NOT EXISTS score_history (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  overall_score REAL NOT NULL,
  confidence REAL NOT NULL,
  evidence_coverage REAL NOT NULL,
  verdict TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  why_score_changed TEXT NOT NULL,
  added_evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  rubric_version_id TEXT NOT NULL REFERENCES rubric_versions(id),
  engine_version TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 75. Jury Question Interactions (Session mode flags & bookmarks)
CREATE TABLE IF NOT EXISTS jury_question_interactions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  is_asked INTEGER NOT NULL DEFAULT 0,
  is_flagged INTEGER NOT NULL DEFAULT 0,
  is_bookmarked INTEGER NOT NULL DEFAULT 0,
  judge_note TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phase 9 Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rubric_vers_rub ON rubric_versions(rubric_id);
CREATE INDEX IF NOT EXISTS idx_jury_dec_eval ON jury_decisions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_master_scores_eval ON master_category_scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_master_scores_cat ON master_category_scores(category_key);
CREATE INDEX IF NOT EXISTS idx_human_rev_eval ON human_reviews(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_jury_notes_eval ON jury_notes(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_score_hist_eval ON score_history(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_jq_inter_eval ON jury_question_interactions(evaluation_id);

-- =========================================================================
-- PHASE 10: FINAL INTELLIGENCE REPORT + EVIDENCE EXPLORER
-- =========================================================================

-- 76. Report Versions (Historical report snapshot archive)
CREATE TABLE IF NOT EXISTS report_versions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  report_id TEXT NOT NULL,
  overall_score REAL NOT NULL,
  verdict TEXT NOT NULL,
  confidence REAL NOT NULL,
  coverage REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'READY',
  changes_summary TEXT NOT NULL,
  new_evidence_count INTEGER NOT NULL DEFAULT 0,
  changed_claims_count INTEGER NOT NULL DEFAULT 0,
  report_json TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 77. Report Shares (Shareable view-only link architecture)
CREATE TABLE IF NOT EXISTS report_shares (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  report_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  permissions TEXT NOT NULL DEFAULT 'VIEW_ONLY',
  expires_at DATETIME,
  revoked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phase 10 Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rep_vers_eval ON report_versions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_rep_vers_ver ON report_versions(evaluation_id, version);
CREATE INDEX IF NOT EXISTS idx_rep_shares_token ON report_shares(token);
CREATE INDEX IF NOT EXISTS idx_rep_shares_eval ON report_shares(evaluation_id);

-- =========================================================================
-- PHASE 11: LIVE CAMERA AI JURY
-- =========================================================================

-- 78. Live Jury Sessions
CREATE TABLE IF NOT EXISTS live_jury_sessions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  started_at DATETIME,
  ended_at DATETIME,
  status TEXT NOT NULL DEFAULT 'READY',
  camera_status TEXT NOT NULL DEFAULT 'READY',
  microphone_status TEXT NOT NULL DEFAULT 'READY',
  network_status TEXT NOT NULL DEFAULT 'STABLE',
  analysis_status TEXT NOT NULL DEFAULT 'IDLE',
  active_source TEXT NOT NULL DEFAULT 'CAMERA',
  role TEXT NOT NULL DEFAULT 'PRESENTER',
  current_elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  target_duration_seconds INTEGER NOT NULL DEFAULT 600,
  is_recording INTEGER NOT NULL DEFAULT 0,
  settings_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 79. Live Events
CREATE TABLE IF NOT EXISTS live_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES live_jury_sessions(id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL,
  timestamp_formatted TEXT NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence REAL NOT NULL,
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 80. Live Observations
CREATE TABLE IF NOT EXISTS live_observations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES live_jury_sessions(id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL,
  timestamp_formatted TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO',
  confidence REAL NOT NULL,
  evidence_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 81. Live Transcript Segments
CREATE TABLE IF NOT EXISTS live_transcript_segments (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES live_jury_sessions(id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL,
  timestamp_formatted TEXT NOT NULL,
  speaker TEXT NOT NULL DEFAULT 'Presenter',
  text TEXT NOT NULL,
  is_final INTEGER NOT NULL DEFAULT 1,
  confidence REAL NOT NULL DEFAULT 0.9,
  detected_claim_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 82. Live Claim Occurrences
CREATE TABLE IF NOT EXISTS live_claim_occurrences (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES live_jury_sessions(id) ON DELETE CASCADE,
  claim_id TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  timestamp_ms INTEGER NOT NULL,
  timestamp_formatted TEXT NOT NULL,
  occurrence_type TEXT NOT NULL,
  transcript_snippet TEXT NOT NULL,
  confidence REAL NOT NULL,
  is_repeated INTEGER NOT NULL DEFAULT 0,
  repeat_count INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 83. Live Demo Events
CREATE TABLE IF NOT EXISTS live_demo_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES live_jury_sessions(id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL,
  timestamp_formatted TEXT NOT NULL,
  feature TEXT NOT NULL,
  observed_behavior TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence REAL NOT NULL,
  evidence_id TEXT,
  hardware_involved TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 84. Live Judge Questions
CREATE TABLE IF NOT EXISTS live_judge_questions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES live_jury_sessions(id) ON DELETE CASCADE,
  suggested_at_ms INTEGER NOT NULL,
  suggested_at_formatted TEXT NOT NULL,
  question TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_gap TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUGGESTED',
  asked_at_ms INTEGER,
  answer_text TEXT,
  answer_status TEXT,
  answered_at_ms INTEGER,
  missing_points_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 85. Live Judge Notes
CREATE TABLE IF NOT EXISTS live_judge_notes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES live_jury_sessions(id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL,
  timestamp_formatted TEXT NOT NULL,
  note TEXT NOT NULL,
  flagged_concern INTEGER NOT NULL DEFAULT 0,
  is_bookmarked INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phase 11 Performance Indexes
CREATE INDEX IF NOT EXISTS idx_live_sess_eval ON live_jury_sessions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_live_events_sess ON live_events(session_id);
CREATE INDEX IF NOT EXISTS idx_live_events_time ON live_events(session_id, timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_live_obs_sess ON live_observations(session_id);
CREATE INDEX IF NOT EXISTS idx_live_trans_sess ON live_transcript_segments(session_id);
CREATE INDEX IF NOT EXISTS idx_live_claims_sess ON live_claim_occurrences(session_id);
CREATE INDEX IF NOT EXISTS idx_live_demo_sess ON live_demo_events(session_id);
CREATE INDEX IF NOT EXISTS idx_live_questions_sess ON live_judge_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_live_notes_sess ON live_judge_notes(session_id);

-- ============================================================================
-- PHASE 12: FULL SYSTEM INTEGRATION + PRODUCTION HARDENING TABLES
-- ============================================================================

-- 86. Evaluation States (Finite State Machine Tracking)
CREATE TABLE IF NOT EXISTS evaluation_states (
  evaluation_id TEXT PRIMARY KEY REFERENCES evaluations(id) ON DELETE CASCADE,
  current_state TEXT NOT NULL DEFAULT 'DRAFT',
  previous_state TEXT,
  latest_checkpoint TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  error_stage TEXT,
  is_locked INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 87. Evaluation Checkpoints (Resumption Snapshots)
CREATE TABLE IF NOT EXISTS evaluation_checkpoints (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  checkpoint_name TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  data_hash TEXT NOT NULL,
  snapshot_data_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 88. Enterprise Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL DEFAULT 'system',
  actor_role TEXT NOT NULL DEFAULT 'SYSTEM',
  event TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata_json TEXT,
  ip_address TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 89. Compute & AI Cost Usage Records
CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  estimated_cost REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 90. Human Reviewer Evidence Requests
CREATE TABLE IF NOT EXISTS evidence_requests (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'HIGH' CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  requested_by TEXT NOT NULL DEFAULT 'Lead Reviewer',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'SUBMITTED', 'REVIEWED', 'CLOSED')),
  response_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 91. Evaluation Revisions (Post-Finalization Version Tracking)
CREATE TABLE IF NOT EXISTS evaluation_revisions (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  previous_score REAL NOT NULL,
  new_score REAL NOT NULL,
  changed_evidence_count INTEGER NOT NULL DEFAULT 0,
  impacted_modules_json TEXT,
  reason TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'Reviewer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 92. Runtime Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phase 12 Indexes
CREATE INDEX IF NOT EXISTS idx_eval_states_curr ON evaluation_states(current_state);
CREATE INDEX IF NOT EXISTS idx_eval_checkpoints_eval ON evaluation_checkpoints(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_usage_records_eval ON usage_records(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evidence_reqs_eval ON evidence_requests(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_eval_revisions_eval ON evaluation_revisions(evaluation_id);

-- =========================================================================
-- PHASE 9/11: AI JURY DELIBERATION (Multi-Persona Cross-Examination)
-- =========================================================================

-- 93. AI Jury Deliberations (Adversarial & Consensus Debate Loop)
CREATE TABLE IF NOT EXISTS jury_deliberations (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  initial_scores_json TEXT NOT NULL,
  final_scores_json TEXT NOT NULL,
  consensus_score REAL NOT NULL,
  ratified_verdict TEXT NOT NULL,
  rounds_json TEXT NOT NULL,
  dissenting_opinions_json TEXT NOT NULL DEFAULT '[]',
  transcript TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jury_delib_eval ON jury_deliberations(evaluation_id);

-- =========================================================================
-- AUTH & SECURITY: TOKEN BLACKLIST & REVOCATION (Redis / SQLite)
-- =========================================================================

-- 94. Token Blacklist
CREATE TABLE IF NOT EXISTS token_blacklist (
  jti TEXT PRIMARY KEY,
  user_id TEXT,
  expires_at INTEGER NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_exp ON token_blacklist(expires_at);

-- 95. User Session Revocations
CREATE TABLE IF NOT EXISTS user_session_revocations (
  user_id TEXT PRIMARY KEY,
  revoked_before INTEGER NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- CLOUD & OBJECT STORAGE: STORED FILES REGISTRY
-- =========================================================================

-- 96. Stored Files Registry
CREATE TABLE IF NOT EXISTS stored_files (
  id TEXT PRIMARY KEY,
  file_key TEXT UNIQUE NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  storage_driver TEXT NOT NULL,
  storage_bucket TEXT,
  storage_path TEXT,
  metadata_json TEXT,
  evaluation_id TEXT,
  project_id TEXT,
  uploaded_by_user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stored_files_key ON stored_files(file_key);
CREATE INDEX IF NOT EXISTS idx_stored_files_eval ON stored_files(evaluation_id);




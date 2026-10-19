// ====================================================
// PROJECTX-RAY AI - DRIZZLE ORM SCHEMA FOR POSTGRESQL & SQLITE
// Provides full TypeScript type safety and multi-dialect schema definitions
// ====================================================

import {
  pgTable,
  varchar,
  text,
  doublePrecision,
  timestamp,
  jsonb,
  bigint,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Core Projects Table
 */
export const projects = pgTable('projects', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  architectureType: varchar('architecture_type', { length: 32 }).notNull(), // 'SOFTWARE' | 'HARDWARE' | 'HYBRID' | 'BIOMEDICAL'
  category: varchar('category', { length: 128 }).notNull(),
  domain: varchar('domain', { length: 128 }).notNull(),
  tagline: text('tagline'),
  problemStatement: text('problem_statement').notNull(),
  solutionDescription: text('solution_description').notNull(),
  teamName: varchar('team_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

/**
 * Evaluations Table
 */
export const evaluations = pgTable('evaluations', {
  id: varchar('id', { length: 64 }).primaryKey(),
  projectId: varchar('project_id', { length: 64 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 32 }).default('PENDING').notNull(),
  overallScore: doublePrecision('overall_score'),
  verdict: varchar('verdict', { length: 64 }),
  confidenceScore: doublePrecision('confidence_score'),
  summary: text('summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  index('idx_evaluations_project').on(table.projectId),
]);

/**
 * Claims Table
 */
export const claims = pgTable('claims', {
  id: varchar('id', { length: 64 }).primaryKey(),
  evaluationId: varchar('evaluation_id', { length: 64 })
    .notNull()
    .references(() => evaluations.id, { onDelete: 'cascade' }),
  claimText: text('claim_text').notNull(),
  claimType: varchar('claim_type', { length: 64 }).notNull(),
  importance: varchar('importance', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).default('UNVERIFIED').notNull(),
  confidence: doublePrecision('confidence').default(1.0).notNull(),
  projectEvidence: text('project_evidence').notNull(),
  externalEvidence: text('external_evidence'),
  explanation: text('explanation').notNull(),
  recommendedJudgeQuestion: text('recommended_judge_question'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_claims_evaluation').on(table.evaluationId),
]);

/**
 * Claim-to-Evidence Bipartite Relational Table
 */
export const claimEvidence = pgTable('claim_evidence', {
  id: varchar('id', { length: 64 }).primaryKey(),
  claimId: varchar('claim_id', { length: 64 })
    .notNull()
    .references(() => claims.id, { onDelete: 'cascade' }),
  evidenceId: varchar('evidence_id', { length: 64 }).notNull(),
  relationship: varchar('relationship', { length: 32 }).notNull(), // 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_claim_evidence_claim').on(table.claimId),
  index('idx_claim_evidence_evidence').on(table.evidenceId),
]);

/**
 * Documents Ingestion Table
 */
export const documents = pgTable('documents', {
  id: varchar('id', { length: 64 }).primaryKey(),
  projectId: varchar('project_id', { length: 64 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  evaluationId: varchar('evaluation_id', { length: 64 })
    .notNull()
    .references(() => evaluations.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 64 }).notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  filePath: text('file_path').notNull(),
  ocrApplied: boolean('ocr_applied').default(false),
  parsedContent: text('parsed_content'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_documents_evaluation').on(table.evaluationId),
]);

/**
 * Document Architecture Table
 */
export const documentArchitecture = pgTable('document_architecture', {
  id: varchar('id', { length: 64 }).primaryKey(),
  documentId: varchar('document_id', { length: 64 })
    .references(() => documents.id, { onDelete: 'cascade' }),
  evaluationId: varchar('evaluation_id', { length: 64 })
    .notNull()
    .references(() => evaluations.id, { onDelete: 'cascade' }),
  nodesJson: jsonb('nodes_json').notNull(),
  relationshipsJson: jsonb('relationships_json').notNull(),
  architectureType: varchar('architecture_type', { length: 32 }).notNull(),
  confidence: doublePrecision('confidence').default(1.0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

/**
 * Multimodal Videos Table
 */
export const videos = pgTable('videos', {
  id: varchar('id', { length: 64 }).primaryKey(),
  projectId: varchar('project_id', { length: 64 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  evaluationId: varchar('evaluation_id', { length: 64 })
    .notNull()
    .references(() => evaluations.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  filePath: text('file_path').notNull(),
  durationSeconds: doublePrecision('duration_seconds').default(0),
  transcript: text('transcript'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_videos_evaluation').on(table.evaluationId),
]);

/**
 * Analysis Timeline Events Table
 */
export const analysisEvents = pgTable('analysis_events', {
  id: varchar('id', { length: 64 }).primaryKey(),
  evaluationId: varchar('evaluation_id', { length: 64 })
    .notNull()
    .references(() => evaluations.id, { onDelete: 'cascade' }),
  videoId: varchar('video_id', { length: 64 })
    .notNull()
    .references(() => videos.id, { onDelete: 'cascade' }),
  timestamp: doublePrecision('timestamp').notNull(),
  eventType: varchar('event_type', { length: 64 }).notNull(),
  description: text('description').notNull(),
  confidence: doublePrecision('confidence').default(1.0).notNull(),
  evidenceIdsJson: jsonb('evidence_ids_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_analysis_events_evaluation').on(table.evaluationId),
]);

/**
 * Persistent Pipeline Queue Jobs Table
 */
export const pipelineQueueJobs = pgTable('pipeline_queue_jobs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  evaluationId: varchar('evaluation_id', { length: 64 })
    .notNull()
    .references(() => evaluations.id, { onDelete: 'cascade' }),
  projectId: varchar('project_id', { length: 64 })
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  executionId: varchar('execution_id', { length: 128 }).notNull(),
  optionsJson: jsonb('options_json'),
  resumeFromStage: integer('resume_from_stage').default(1),
  status: varchar('status', { length: 32 }).notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_pipeline_queue_eval').on(table.evaluationId),
  index('idx_pipeline_queue_status').on(table.status),
]);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type PipelineJob = typeof pipelineQueueJobs.$inferSelect;

-- Migration: 0001_initial_core_tables
-- Direction: DOWN
-- Description: Rollback core entities

DROP TABLE IF EXISTS rubric_scores;
DROP TABLE IF EXISTS rubric_criteria;
DROP TABLE IF EXISTS rubric_templates;
DROP TABLE IF EXISTS claim_evidence;
DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS project_files;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

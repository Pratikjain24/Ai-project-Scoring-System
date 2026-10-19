// =========================================================================
// PROJECTX-RAY AI — DEPLOYMENT & DOCKER COMPOSE VALIDATION SUITE
// Multi-Stage Dockerfile, Docker Compose (App + Redis + PostgreSQL + MinIO)
// =========================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { app } from '../server';

describe('Phase 16: Deployment Setup & Container Orchestration (Dockerfile, Docker Compose, Redis, Postgres)', () => {
  const rootDir = path.resolve(process.cwd());

  // -----------------------------------------------------------------------
  // 1. Multi-Stage Dockerfile Structural & Security Verification
  // -----------------------------------------------------------------------
  it('1. Dockerfile exists and enforces multi-stage Node 22 build with non-root security', () => {
    const dockerfilePath = path.join(rootDir, 'Dockerfile');
    assert.ok(fs.existsSync(dockerfilePath), 'Dockerfile must exist at repository root');

    const content = fs.readFileSync(dockerfilePath, 'utf8');

    // Multi-stage builder & runner
    assert.ok(content.includes('FROM node:22-alpine AS builder'), 'Stage 1 must use node:22-alpine builder');
    assert.ok(content.includes('FROM node:22-alpine AS runner'), 'Stage 2 must use node:22-alpine runner');

    // Build tools & frontend compile
    assert.ok(content.includes('npm run build'), 'Builder stage must compile the Vite React production bundle');

    // System runtime packages
    assert.ok(content.includes('ffmpeg'), 'Runtime stage must install ffmpeg for presentation forensics');
    assert.ok(content.includes('tesseract-ocr'), 'Runtime stage must install tesseract-ocr for document intelligence');
    assert.ok(content.includes('dumb-init'), 'Runtime stage must install dumb-init for PID 1 signal forwarding');
    assert.ok(content.includes('curl'), 'Runtime stage must install curl for container healthcheck');

    // Security & Non-root user compliance (CIS Docker Benchmark)
    assert.ok(content.includes('adduser') || content.includes('appuser'), 'Dockerfile must create a dedicated application user');
    assert.ok(content.includes('USER appuser'), 'Dockerfile must switch to non-root USER appuser');

    // Port & Healthcheck
    assert.ok(content.includes('EXPOSE 3001'), 'Dockerfile must expose container port 3001');
    assert.ok(content.includes('HEALTHCHECK'), 'Dockerfile must declare container HEALTHCHECK');
    assert.ok(content.includes('http://localhost:3001/api/health'), 'Healthcheck must probe /api/health');

    // Entrypoint & Command
    assert.ok(content.includes('ENTRYPOINT ["/usr/bin/dumb-init", "--"]'), 'Entrypoint must use dumb-init');
  });

  // -----------------------------------------------------------------------
  // 2. Production docker-compose.yml Orchestration Verification
  // -----------------------------------------------------------------------
  it('2. docker-compose.yml defines App, PostgreSQL 16, Redis 7, and MinIO S3 object store', () => {
    const composePath = path.join(rootDir, 'docker-compose.yml');
    assert.ok(fs.existsSync(composePath), 'docker-compose.yml must exist at repository root');

    const content = fs.readFileSync(composePath, 'utf8');

    // Services
    assert.ok(content.includes('app:'), 'Must define app service');
    assert.ok(content.includes('postgres:'), 'Must define postgres service');
    assert.ok(content.includes('redis:'), 'Must define redis service');
    assert.ok(content.includes('minio:'), 'Must define minio service');

    // Database Configuration
    assert.ok(content.includes('postgres:16-alpine'), 'Must use PostgreSQL 16 Alpine image');
    assert.ok(content.includes('DATABASE_DIALECT=postgres'), 'App must configure PostgreSQL database dialect');
    assert.ok(content.includes('DATABASE_URL='), 'App must specify PostgreSQL connection string');

    // Redis Configuration
    assert.ok(content.includes('redis:7-alpine'), 'Must use Redis 7 Alpine image');
    assert.ok(content.includes('REDIS_URL='), 'App must configure Redis connection URL');

    // Storage Configuration (MinIO S3)
    assert.ok(content.includes('STORAGE_DRIVER=minio'), 'App must configure MinIO storage driver');
    assert.ok(content.includes('http://minio:9000'), 'App must configure MinIO endpoint URL');

    // Inter-Service Healthcheck Dependencies
    assert.ok(content.includes('condition: service_healthy'), 'App service must depend on service_healthy states');

    // Persistent Volumes & Isolated Networks
    assert.ok(content.includes('postgres-data:'), 'Must define persistent volume for postgres');
    assert.ok(content.includes('redis-data:'), 'Must define persistent volume for redis');
    assert.ok(content.includes('minio-data:'), 'Must define persistent volume for minio');
    assert.ok(content.includes('projectxray-net:'), 'Must define isolated bridge network');
  });

  // -----------------------------------------------------------------------
  // 3. .dockerignore Security & Context Exclusion
  // -----------------------------------------------------------------------
  it('3. .dockerignore prevents sensitive secrets, local databases, and large artifacts from entering build context', () => {
    const dockerignorePath = path.join(rootDir, '.dockerignore');
    assert.ok(fs.existsSync(dockerignorePath), '.dockerignore must exist at repository root');

    const content = fs.readFileSync(dockerignorePath, 'utf8');

    assert.ok(content.includes('node_modules'), 'Must ignore node_modules');
    assert.ok(content.includes('.git'), 'Must ignore git metadata');
    assert.ok(content.includes('.env'), 'Must ignore .env secret files');
    assert.ok(content.includes('*.db'), 'Must ignore local SQLite binary files');
    assert.ok(content.includes('dist'), 'Must ignore local dist folder');
  });

  // -----------------------------------------------------------------------
  // 4. package.json Engine Requirements & Docker Lifecycle Scripts
  // -----------------------------------------------------------------------
  it('4. package.json declares Node >=22.0.0 engine and docker CLI lifecycle scripts', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Node 22 engine requirement (resolves Node Runtime Check roadmap limitation!)
    assert.ok(pkg.engines, 'package.json must contain engines field');
    assert.strictEqual(pkg.engines.node, '>=22.0.0', 'Node engine must require >=22.0.0 for native sqlite');

    // Docker scripts
    assert.ok(pkg.scripts['docker:build'], 'Must contain docker:build script');
    assert.ok(pkg.scripts['docker:up'], 'Must contain docker:up script');
    assert.ok(pkg.scripts['docker:down'], 'Must contain docker:down script');
    assert.ok(pkg.scripts['docker:logs'], 'Must contain docker:logs script');
    assert.ok(pkg.scripts['start'], 'Must contain start script for container startup');
  });

  // -----------------------------------------------------------------------
  // 5. docker-compose.dev.yml Development Hot-Reloading Configuration
  // -----------------------------------------------------------------------
  it('5. docker-compose.dev.yml provides live hot-reloading development environment', () => {
    const devComposePath = path.join(rootDir, 'docker-compose.dev.yml');
    assert.ok(fs.existsSync(devComposePath), 'docker-compose.dev.yml must exist at repository root');

    const content = fs.readFileSync(devComposePath, 'utf8');
    assert.ok(content.includes('NODE_ENV=development'), 'Dev compose must set development environment');
    assert.ok(content.includes('5173:5173'), 'Dev compose must expose Vite dev server port');
    assert.ok(content.includes('3001:3001'), 'Dev compose must expose backend port');
    assert.ok(content.includes('npm run dev:all') || content.includes('dev:all'), 'Dev compose must invoke dev:all script');
  });

  // -----------------------------------------------------------------------
  // 6. Application Healthcheck Endpoint Probing
  // -----------------------------------------------------------------------
  it('6. GET /api/health responds with healthy container status for Docker healthcheck probe', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      assert.strictEqual(res.status, 200, 'Healthcheck must return HTTP 200');

      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.status, 'healthy');
      assert.ok(body.data.platform.includes('PROJECTX-RAY AI'));
      assert.ok(body.data.timestamp);
    } finally {
      await new Promise<void>((resolve) => server.close(resolve));
    }
  });
});

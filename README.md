# ProjectX-Ray AI: Autonomous Multimodal Project Jury & Intelligence Engine

> **"Your Autonomous AI Project Jury"** — High-assurance multimodal intelligence platform for collegiate capstones, hackathon prototypes, incubator defenses, and institutional technical assessment.

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%2F6.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20WAL%20%2F%20PostgreSQL-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Queue](https://img.shields.io/badge/Queue-BullMQ%20%2B%20SQLite%20Durable-DC382D?logo=redis&logoColor=white)](https://bullmq.io/)
[![Security](https://img.shields.io/badge/Security-RS256%20Zero--Trust%20%2B%20Fail--Closed-blueviolet)](https://cve.mitre.org/)
[![Tests](https://img.shields.io/badge/Tests-493%20Passed%20(100%25)-success)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Table of Contents
1. [Executive Overview & Problem Statement](#executive-overview--problem-statement)
2. [End-to-End System Architecture](#end-to-end-system-architecture)
3. [The 15-Stage Multi-Agent Orchestration Pipeline](#the-15-stage-multi-agent-orchestration-pipeline)
4. [Universal Evidence Graph & 5-State Claim Verification](#universal-evidence-graph--5-state-claim-verification)
5. [Specialized Multi-Agent Auditing Ecosystem](#specialized-multi-agent-auditing-ecosystem)
6. [Deterministic 100% Rubric Scoring & Confidence Calibration](#deterministic-100-rubric-scoring--confidence-calibration)
7. [AI Jury Committee & Multi-Persona Deliberation Chamber](#ai-jury-committee--multi-persona-deliberation-chamber)
8. [Live Camera Jury & Presenter Vision Telemetry](#live-camera-jury--presenter-vision-telemetry)
9. [Institutional Export Engine (Native DOCX & Binary PDF)](#institutional-export-engine-native-docx--binary-pdf)
10. [Database Architecture & Relational Schema Matrix](#database-architecture--relational-schema-matrix)
11. [REST API Reference & Versioned Endpoints](#rest-api-reference--versioned-endpoints)
12. [Reference Seed Project Cohorts](#reference-seed-project-cohorts)
13. [Senior Tester Hardening & Anti-Exploitation Policy](#senior-tester-hardening--anti-exploitation-policy)
14. [Environment Variables & Configuration Matrix](#environment-variables--configuration-matrix)
15. [Quick Start & Operational Guide](#quick-start--operational-guide)
16. [Test Suite Execution & Quality Metrics](#test-suite-execution--quality-metrics)

---

## Executive Overview & Problem Statement

Human evaluation of technical capstones, hackathon projects, and early-stage startup demonstrations suffers from inherent structural flaws:
- **Cognitive Judge Fatigue**: Evaluators reviewing 20+ projects in rapid succession suffer severe cognitive degradation.
- **Surface-Level Pitch Bias**: Fluent public speaking frequently conceals fatal code vulnerabilities, nonexistent architectures, and falsified benchmarks.
- **Inability to Verify Code & Claims in Real Time**: Standard judging rounds (3 to 7 minutes) prevent judges from auditing git histories, compiling source trees, or cross-referencing literature.
- **Rubric Drift**: Scores vary drastically between individual judges due to divergent subjective interpretations of vague criteria.

**ProjectX-Ray AI** eliminates evaluation subjectivity by executing an autonomous, multimodal auditing engine. It ingests software repositories, hardware schematics, PDF/PPTX/DOCX presentation decks, and MP4/WebM video demonstrations. The engine processes these artifacts through **10 specialist agents**, builds a **Universal Evidence Graph** connecting raw files to factual claims, enforces a **100% mathematically deterministic scoring rubric**, and synthesizes an institutional **20-section Evaluation Dossier** available in native Microsoft Word (`.docx`) and Adobe PDF (`.pdf`).

---

## End-to-End System Architecture

ProjectX-Ray AI is structured across 7 decoupled operational tiers:

```
[ INPUT & MULTIMODAL INGESTION LAYER ]
  │  ├── GitHub Repositories & Raw Source Trees (.ts, .py, .cpp, .go, .rs)
  │  ├── Documentation & Slides (Binary PDF, OpenXML .pptx, Word .docx)
  │  ├── Demonstration Media (MP4, WebM, MOV, MKV, Audio PCM)
  │  └── Real-Time Live Presenter Hardware (WebRTC Camera, VAD Audio Streams)
  ▼
[ PIPELINE ORCHESTRATION & PERSISTENCE TIER ]
  │  ├── 15-Stage Asynchronous State Machine (DRAFT -> INGESTING -> ... -> FINAL)
  │  ├── BullMQ Redis Queue with SQLite Durable Auto-Resume Disk Engine
  │  └── SSE Real-Time Execution Console (pipelineStreamEmitter)
  ▼
[ SPECIALIZED MULTI-AGENT AUDITING ECOSYSTEM ]
  │  ├── Project Understanding Agent      ├── Originality & Prior Art Agent
  │  ├── AST Syntax & Security Auditor     ├── Feasibility & Cloud Scaling Agent
  │  ├── Multimodal Video & Demo Agent    ├── Societal & Environmental Impact Agent
  │  ├── Autonomous Research Agent        ├── Acoustic & Presentation Forensics Agent
  │  └── Claim Verification Engine        ├── Master Rubric Consensus Agent
  ▼
[ UNIVERSAL EVIDENCE GRAPH & TRUTH VERIFICATION ]
  │  ├── Strict Evidentiary Lineage: Claim <-> Evidence Node <-> Source Artifact
  │  ├── 5-State Veracity Engine: VERIFIED | PARTIAL | UNVERIFIED | CONTRADICTED | INSUFFICIENT
  │  └── Anti-Hallucination Barrier: Zero claims accepted without empirical file backing
  ▼
[ 100% DETERMINISTIC SCORING ENGINE ]
  │  ├── Master Score: Strictly sum(Category_Score * Weight_Percent / 100)
  │  ├── Multi-Factor Confidence Calibration (7 Weighted Information-Theoretic Vectors)
  │  └── Cryptographic Immutability: SHA-256 Consensus Hash Sealed on Finalization
  ▼
[ AI JURY COMMITTEE & DELIBERATION CHAMBER ]
  │  ├── 5 Heterogeneous Juror Personas (Architect, Security, Academic, Commercial, Domain)
  │  ├── 3-Turn Adversarial Debate Loop (Opening Ballots -> Peer Challenge -> Consensus)
  │  └── Reviewer Governance & Evidence Gate (Institutional Human Ratification)
  ▼
[ PUBLICATION DOSSIER & EXPORT LAYER ]
  │  ├── 20-Section Comprehensive Evaluation Dossier
  │  ├── Native Microsoft Word (.DOCX) Generation Engine (docx OpenXML)
  │  └── Authentic Binary Adobe PDF (.PDF) Generation Engine (pdfkit)
```

---

## The 15-Stage Multi-Agent Orchestration Pipeline

When an evaluation is triggered (`POST /api/evaluations/:id/start`), the `OrchestrationService` coordinates the following sequential and concurrent execution stages:

| Stage # | Stage Key | Operational Scope | Target State | Primary Generated Artifacts |
| :---: | :--- | :--- | :--- | :--- |
| **01** | `INGESTION` | Validates file MIME types, sanitizes paths, computes SHA-256 hashes, registers assets | `INGESTING` | `project_files`, disk storage paths |
| **02** | `CONTENT_EXTRACTION` | Decompresses OpenXML (`.pptx`, `.docx`), runs Tesseract WebAssembly OCR on scanned PDFs | `UNDERSTANDING` | `document_pages`, `document_tables`, raw text chunks |
| **03** | `PROJECT_UNDERSTANDING` | Synthesizes Project DNA: problem statement, technical solution, domain classification | `UNDERSTANDING` | `project_dna` record, architecture topology |
| **04** | `CLAIM_EXTRACTION` | Mines explicit quantitative and architectural assertions (speed, accuracy, throughput) | `VERIFYING_CLAIMS` | Raw `claims` tagged as `CLAIMED` |
| **05** | `TECHNICAL_ANALYSIS` | Builds AST syntax tree, audits modularity, runs SAST scanners (CWE-89, CWE-78, secrets) | `ANALYZING_MEDIA` | `technical_assessments`, AST complexity scorecard |
| **06** | `RESEARCH` | Executes autonomous search across OpenAlex, arXiv, CrossRef, and patent databases | `RESEARCHING` | `research_sources`, citations, benchmark datasets |
| **07** | `ORIGINALITY_ANALYSIS` | Vectorizes concept embeddings, computes Jaccard/TF-IDF similarity against prior art | `ANALYZING_ORIGINALITY` | `originality_assessments`, `similar_projects` |
| **08** | `CLAIM_VERIFICATION` | Cross-references claims against AST benchmarks, video frames, and research evidence | `VERIFYING_CLAIMS` | 5-state verified `claims`, `claim_evidence` mapping |
| **09** | `IMPACT_ANALYSIS` | Evaluates real-world utility, UN SDG alignment, addressable demographic scale | `EVALUATING` | `impact_assessments`, market potential models |
| **10** | `FEASIBILITY_ANALYSIS` | Models unit economics, BOM hardware costs, edge thermal dissipation, cloud scaling | `EVALUATING` | `feasibility_assessments`, prototype readiness level |
| **11** | `PRESENTATION_ANALYSIS` | Runs acoustic forensics (pitch F0, cadence WPM, hesitation pauses) and slide visual audit | `ANALYZING_MEDIA` | `presentation_analyses`, vocal delivery metrics |
| **12** | `DEMO_ANALYSIS` | Evaluates video demonstration: UI state transitions, latency proof, visual proof | `ANALYZING_MEDIA` | `demo_analyses`, `claim_demo_matches` |
| **13** | `SCORING` | Computes deterministic category scores, applies penalty cap on unverified claims | `SCORING` | `master_category_scores`, multi-factor confidence |
| **14** | `JURY_VERDICT` | Executes 3-turn debate across 5 juror personas, resolves peer challenges, drafts inquiries | `JURY_REVIEW` | `jury_decisions`, `judge_questions`, `evaluator_risks` |
| **15** | `REPORT_GENERATION` | Synthesizes publication-grade 20-section Evaluation Dossier with verified citations | `READY_FOR_REVIEW` | `evaluation_reports` (JSON, `.docx`, `.pdf`) |

---

## Universal Evidence Graph & 5-State Claim Verification

The Universal Evidence Graph strictly isolates raw project assertions from verified institutional facts:

```
[Raw Project Artifacts] ──────► [Extracted Evidence Nodes] ──────► [Project Claims]
 (Code, PDF, MP4, Logs)           (File, Line, Hash, Snippet)        (Speed, Accuracy, Scale)
                                              │                                  │
                                              ▼                                  ▼
                                  [Rubric Category Score] ◄──────── [5-State Truth Status]
                                  (Technical, Impact, etc.)       (VERIFIED, CONTRADICTED...)
```

### The 5-State Veracity Model

| State | Institutional Criteria | Scoring Impact |
| :--- | :--- | :--- |
| **`VERIFIED`** | Explicitly confirmed by AST code paths, passing tests, video frames, or literature | **Full Score Awarded**; boosts evidence coverage |
| **`PARTIALLY_VERIFIED`** | Core mechanism exists, but empirical metric diverges (e.g. claimed 99% vs observed 85%) | **Proportional Deduction**; flags variance |
| **`UNVERIFIED`** | Stated in presentation deck or README, but zero implementation found in code or demo | **Zero Score Contribution**; confidence penalty applied |
| **`CONTRADICTED`** | Empirical evidence refutes assertion (e.g. claims "pure offline edge" but code calls AWS) | **Severe Category Penalty (-15% to -25%)** |
| **`INSUFFICIENT_EVIDENCE`** | Missing required technical schematics or artifacts to audit assertion | **Evidence Gap Flagged**; generates judge inquiry |

---

## Specialized Multi-Agent Auditing Ecosystem

Each agent operates within a dedicated domain, executing mathematical heuristics and empirical audits:

| Agent Name | Source File | Core Auditing Logic & Heuristics | Rubric Mappings |
| :--- | :--- | :--- | :--- |
| **Project Understanding Agent** | `projectUnderstandingAgent.ts` | AST taxonomy scanning, repository tree parsing, problem-solution mapping | Problem Scope, Alignment |
| **Technical Auditor Agent** | `technicalAuditorAgent.ts` | TypeScript/Babel AST syntax traversal, cyclomatic complexity, SAST CWE scanner | Technical Architecture (25%) |
| **Claim Verification Agent** | `claimVerificationAgent.ts` | Multi-source graph cross-referencing, fail-closed containerized sandbox | Veracity & Evidence (10%) |
| **Originality & Prior Art Agent** | `originalityAgent.ts` | TF-IDF / vector similarity, arXiv patent search, distinguishing delta profiling | Novelty & Originality (10%) |
| **Multimodal Video Agent** | `multimodalVideoAgent.ts` | Keyframe extraction, OpenCV visual feature detection, UI state verification | Demonstration Proof (10%) |
| **Acoustic Presentation Agent** | `presentationForensicsAgent.ts` | Web Audio DSP, fundamental frequency (F0) tracking, hesitation gap classification | Presentation Quality (10%) |
| **Research Intelligence Agent** | `liveResearchEngine.ts` | Semantic Scholar, OpenAlex, CrossRef, and arXiv autonomous citation discovery | Evidentiary Backing |
| **Impact & Value Agent** | `impactFeasibilityAgent.ts` | UN SDG mapping, demographic utility modeling, addressable user sizing | Practical Impact (15%) |
| **Feasibility & Scaling Agent** | `impactFeasibilityAgent.ts` | Bill of Materials (BOM) cost modeling, cloud OPEX scaling, edge thermal envelope | Feasibility & Readiness (10%) |
| **Master Scoring Consensus Agent** | `masterScoringEngine.ts` | Deterministic weighted summation, multi-factor confidence, counterfactual sandbox | Master Consensus Score |

---

## Deterministic 100% Rubric Scoring & Confidence Calibration

ProjectX-Ray AI enforces a strict mathematical invariant: **no score may drift based on external LLM temperature or subjective bias**.

### Canonical 100% Weight Matrix

$$\text{Master Score} = \sum_{i=1}^{n} \left( \text{Raw Score}_i \times \frac{\text{Weight}_i}{100} \right)$$

$$\sum_{i=1}^{n} \text{Weight}_i = 100.0\% \quad (\text{Strict Invariant Checked on Server Boot})$$

| Rubric Category Key | Category Label | Weight | Evaluation Criteria | Penalty Trigger |
| :--- | :--- | :---: | :--- | :--- |
| `technical_depth` | Technical Architecture & Depth | **25%** | Code modularity, AST complexity, design patterns, fault tolerance | High cyclomatic complexity, God functions |
| `practical_impact` | Real-World Impact & Utility | **15%** | Problem significance, demographic reach, UN SDG alignment | Vague problem, unquantifiable user impact |
| `originality_novelty` | Originality & Differentiation | **10%** | Novelty vector vs prior art, defensible architectural deltas | Direct clone of standard GitHub tutorial repos |
| `claim_veracity` | Claim Veracity & Proof | **10%** | Ratio of verified claims to claimed assertions | Unverified claims, empirical contradictions |
| `prototype_readiness` | Prototype Readiness & Feasibility | **10%** | Working execution, cloud/edge viability, Bill of Materials | Incomplete build, missing setup prerequisites |
| `demonstration_execution`| Demonstration & Visual Proof | **10%** | Live or recorded video proof of core features functioning | Fake mock simulations, video stutter/crash |
| `presentation_delivery` | Presentation Clarity & Delivery | **10%** | Vocal pacing (120-160 WPM), pitch modulation, slide legibility | Excessive pauses (>1.5s), dense unreadable slides |
| `security_robustness` | Security & Code Hardening | **10%** | AST vulnerability audit (SQLi, command injection, secret leakage) | Hardcoded private keys, CWE-89 vulnerabilities |
| **Total** | **Canonical Sum** | **100%** | **Strict Mathematical Constraint** | — |

### Multi-Factor Confidence Calibration

Confidence is calculated independently from the score using 7 information-theoretic vectors:
1. **Evidence Source Diversity** (30%): Representation across code, documents, video, and benchmarks.
2. **Claim Verification Ratio** (20%): Percentage of extracted claims formally verified.
3. **AST Code Coverage** (15%): Syntactic depth and test assertion density.
4. **Research Literature Density** (10%): Volume of corroborating academic citations.
5. **Video Demonstration Fidelity** (10%): Visual confirmation of operational claims.
6. **Acoustic Forensics Clarity** (10%): Audio SNR, vocal cadence stability.
7. **Cross-Doc Consistency** (5%): Zero contradictions between slides and codebase.

---

## AI Jury Committee & Multi-Persona Deliberation Chamber

The platform models an elite institutional evaluation jury consisting of 5 distinct personas with adversarial viewpoints:

| Juror Persona | Role Title | Core Evaluation Perspective | Adversarial Focus |
| :--- | :--- | :--- | :--- |
| **Dr. Evelyn Reed** | Jury Chair & Systems Architect | Distributed system resilience, architectural scaling, AST code patterns | Over-engineered architectures, latency bottlenecks |
| **Marcus Vance** | Principal Security & CVE Auditor | Zero-trust boundaries, vulnerability surfaces, cryptographic rigor | Hardcoded secrets, injection vectors, unvalidated inputs |
| **Dr. Aris Thorne** | Principal Research Academician | Theoretical novelty, benchmark reproducibility, mathematical proofs | Baseless accuracy claims, lack of baseline comparisons |
| **Elena Rostova** | Commercialization & Product Director | Unit economics, customer acquisition, operational feasibility | Unsustainable cloud compute OPEX, missing market demand |
| **Kaelen Diaz** | Domain Specialist & Hardware Lead | Sensor latency, edge thermal envelopes, physical deployment constraints | Theoretical simulations failing in physical field environments |

### 3-Turn Adversarial Deliberation Loop
1. **Turn 1 (Opening Ballots)**: Each juror scores independently based on their domain heuristic.
2. **Turn 2 (Peer Challenges)**: Jurors with divergent scores (>15 points apart) exchange adversarial challenges.
3. **Turn 3 (Consensus Ratification)**: Convergence on consensus score with documented dissenting notes.

---

## Live Camera Jury & Presenter Vision Telemetry

For live capstone defenses, pitch competitions, and demo days, ProjectX-Ray AI provides a real-time **Live Jury Chamber** (`/evaluations/:id/live`):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LIVE CAMERA AI JURY CHAMBER                     │
├──────────────────────────────────┬─────────────────────────────────────┤
│  REAL-TIME PRESENTER CAMERA FEED │  LIVE JURY DELIBERATION STREAM      │
│  [ WebRTC Hardware Stream ]      │  Consensus Score: 83.7 / 100        │
│                                  │  Verdict: STRONG (Ratified)         │
│  MediaPipe FaceMesh & BlazePose: ├─────────────────────────────────────┤
│  • Primary Speaker Active        │  DYNAMIC JUDGE INQUIRIES            │
│  • Eye Contact Ratio: 88%        │  1. [Technical] How does the system │
│  • Posture Stability: 92%        │     handle thermal degradation?     │
│  • Audio RMS: -24 dBFS (Speech)  │  2. [Claims] Can you benchmark 45   │
│                                  │     FPS without TensorRT?           │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### Telemetry Ingestion Engine
- **Batched Ingestion Queue (`TelemetryBatchQueue.ts`)**: Buffers visual telemetry frames in memory and flushes snapshots to SQLite in transactions every 5 seconds, eliminating database lock contention (`SQLITE_BUSY`).
- **Fail-Closed Hardware Policy**: If camera access is denied or hardware fails, the system automatically flags `UNVERIFIED_HARDWARE_FAULT` and caps engagement metrics at 50% rather than hallucinating perfect scores.

---

## Institutional Export Engine (Native DOCX & Binary PDF)

ProjectX-Ray AI provides a consolidated **Export Center Modal** generating certified evaluation dossiers in two publication formats:

| Format | Extension | Generation Engine | Primary Characteristics |
| :--- | :---: | :--- | :--- |
| **Microsoft Word** | `.docx` | `DocxGenerator.ts` (`docx`) | Native OpenXML binary document with editable tables, claims matrix, executive scorecard, and audit hash |
| **Adobe PDF** | `.pdf` | `RealPdfGenerator.ts` (`pdfkit`) | Publication-grade binary `%PDF-1.4` document with A4 typography, vector scorecards, and cryptographic seal |
| **Interactive Print** | `.html` | `PdfGenerator.ts` | Clean browser preview against midnight canvas with `@media print` rules for paper printing |

---

## Database Architecture & Relational Schema Matrix

The backend persistence tier uses **Embedded SQLite with Write-Ahead Logging (WAL)** and supports seamless enterprise scaling to **PostgreSQL**:

| Relational Domain | Primary Tables | Functional Purpose |
| :--- | :--- | :--- |
| **Projects & Files** | `projects`, `project_files`, `storage_objects` | Project metadata, file hashes, storage keys |
| **Evaluation State** | `evaluations`, `orchestrator_checkpoints`, `orchestrator_states` | 15-stage state machine progress and job execution |
| **Document Intelligence** | `documents`, `document_pages`, `document_tables`, `document_images` | Decompressed sections, tables, OCR text |
| **Multimodal Video** | `videos`, `video_keyframes`, `video_transcripts`, `speech_metrics` | Transcribed audio, visual events, cadence data |
| **Claims & Evidence** | `claims`, `evidence_nodes`, `claim_evidence`, `evidence_gaps` | Universal Evidence Graph, truth relationships |
| **Research & Originality**| `research_sources`, `academic_citations`, `patent_records`, `similar_projects`| Prior art databases, literature cross-references |
| **Scoring & Rubrics** | `master_evaluations`, `rubric_versions`, `category_scores`, `score_history`| Deterministic scores, audit trails, rubric snapshots |
| **AI Jury Chamber** | `jury_decisions`, `juror_positions`, `peer_challenges`, `judge_questions` | Multi-turn debate logs, juror ballots, Q&A cards |
| **Live Telemetry** | `live_sessions`, `presenter_metrics`, `live_telemetry_events` | 5-second batched camera and speech telemetry |
| **Reports & Shares** | `evaluation_reports`, `report_versions`, `report_shares`, `audit_events` | Published dossiers, view-only secure tokens |

---

## REST API Reference & Versioned Endpoints

All endpoints are mounted under `/api` and versioned under `/api/v1` with RS256 Bearer JWT protection:

| Group | Method | Endpoint Path | Access Level | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticates credentials, issues RS256 JWT |
| **Auth** | `GET` | `/api/auth/personas` | Public | Retrieves quick institutional testing personas |
| **Projects** | `GET` | `/api/projects` | Authenticated | Lists registered projects with metadata |
| **Projects** | `POST` | `/api/projects` | Authenticated | Creates a new project submission |
| **Evaluations** | `POST` | `/api/evaluations` | Authenticated | Initializes evaluation record in `QUEUED` state |
| **Evaluations** | `POST` | `/api/evaluations/:id/start` | Authenticated | Dispatches 15-stage asynchronous pipeline |
| **Evaluations** | `GET` | `/api/evaluations/:id/stream` | Authenticated | Server-Sent Events (SSE) live pipeline feed |
| **Governance** | `POST` | `/api/evaluations/:id/finalize` | Lead / Admin | Ratifies verdict, locks decision, records history snapshot |
| **Reports** | `GET` | `/api/evaluations/:id/report` | Authenticated | Retrieves 20-section JSON Evaluation Dossier |
| **Reports** | `GET` | `/api/evaluations/:id/report/pdf` | Authenticated | Downloads binary `.pdf` file (`?download=true`) |
| **Reports** | `GET` | `/api/evaluations/:id/report/docx`| Authenticated | Downloads native Microsoft Word `.docx` document |
| **Live Jury** | `POST` | `/api/evaluations/:id/live/start`| Authenticated | Activates live camera WebRTC room & telemetry queue |
| **Live Jury** | `POST` | `/api/evaluations/:id/live/telemetry`| Authenticated| Ingests presenter posture and gaze frames |
| **Rubric** | `GET` | `/api/evaluations/rubric` | Public | Exposes Canonical Single Source of Truth weights |

---

## Reference Seed Project Cohorts

The platform includes 5 production-grade reference projects across engineering domains:

| Project Name | Project ID / Slug | Domain | Tech Stack | Ingested Real Artifacts |
| :--- | :--- | :--- | :--- | :--- |
| **Smart Road Vision** | `smart-road-vision` | Smart Cities & Vision | PyTorch, TensorRT, YOLOv8, Jetson Orin | Full code tree, technical deck, Jetson benchmark video |
| **SentinelAI** | `sentinelai-ai-powered-smart-surveillance-threat-detection-system` | Security & Surveillance | PyTorch, DeepStream, WebSockets, Zero-Trust | System architecture, threat models, demo stream |
| **AgroSense Edge** | `agrosense-edge-precision-agriculture` | IoT & Agriculture | C++, FreeRTOS, LoRaWAN, ESP32 | Schematic PCB schematics, power dissipation logs |
| **MediDrone Transport** | `medi-drone-autonomous-medical-delivery` | Robotics & Autonomous | ROS 2, ArduPilot, PX4, C++ | Autonomous flight telemetry, pathing logs |
| **SolarGuard Clean** | `solarguard-smart-solar-panel-cleaning-robot` | Robotics & Energy | Python, OpenCV, STM32 | Mechanical CAD drawings, battery life models |

---

## Senior Tester Hardening & Anti-Exploitation Policy

ProjectX-Ray AI incorporates aggressive hardening against evaluation gaming and false data injection:

| Threat Vector | Attack Scenario | Implemented Mitigation | Verification Mechanism |
| :--- | :--- | :--- | :--- |
| **Silent Score Alteration** | Malicious actor attempts to mutate ratified score | Database trigger and API lock prohibit updates when `status = 'FINAL'` | Unit test verifies HTTP 403 on post-ratification updates |
| **Synthetic Simulation Spoofing** | Attacker disconnects camera to force simulated 100% presentation score | System detects hardware disconnection, flags `UNVERIFIED_HARDWARE_FAULT`, caps score at 50% | `seniorTesterHardening.test.tsx` test 2 |
| **Mute Lead Presenter Exploitation** | Silent presenter standing before camera awarded speaking points | Audio RMS gate correlated with mouth aspect ratio; speaking score zeroed if silent | `seniorTesterHardening.test.tsx` test 1 |
| **Host System Sandbox Escape** | Project executes arbitrary code to tamper with host environment | Fail-closed policy: host execution strictly blocked; Docker container isolation enforced | Dynamic claim synthesis fallback |
| **Token Hijacking & Replay** | Revoked user token used to access institutional audit registry | Distributed Redis token blacklist checked on every request via RS256 middleware | `authSecurity.test.ts` test 7 |

---

## Environment Variables & Configuration Matrix

Copy `.env.example` to `.env` in `final year project/`:

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `3001` | Express backend HTTP port |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_PATH` | Optional | `./projectxray.db` | Local SQLite database file location |
| `STORAGE_DRIVER` | Optional | `local` | Object storage engine (`local`, `s3`, `minio`, `r2`) |
| `JWT_PRIVATE_KEY_PATH` | Optional | `./keys/jwt_rsa_private.pem` | RSA 2048-bit private key for RS256 token signing |
| `JWT_PUBLIC_KEY_PATH` | Optional | `./keys/jwt_rsa_public.pem` | RSA 2048-bit public key for token verification |
| `REDIS_URL` | Optional | `redis://localhost:6379` | Redis connection URL for BullMQ job queue |
| `MOCK_AI` | Optional | `true` | Enables deterministic local AI execution without paid APIs |

---

## Quick Start & Operational Guide

### 1. Prerequisites
- **Node.js**: `>= 22.0.0`
- **npm**: `>= 10.0.0`
- **Operating System**: Windows, macOS, or Linux

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Pratikjain24/Ai-project-Scoring-System.git
cd "Ai-project-Scoring-System/final year project"

# Install dependencies (backend & frontend)
npm install
```

### 3. Database Initialization & Seeding
```bash
# Apply schema migrations
npm run db:migrate

# Seed reference project cohorts and canonical evaluations
npm run db:seed
```

### 4. Running the Development Servers
In two separate terminals:
```bash
# Terminal 1: Launch Backend API Server (Port 3001)
npm run server

# Terminal 2: Launch Frontend Vite App (Port 5173)
npm run dev
```

Open your browser to: **`http://localhost:5173`**

### 5. Running with Docker Compose (Production Deployment)
```bash
# Build and start all services (Backend, Frontend, Redis, SQLite WAL)
docker compose up -d

# View service logs
docker compose logs -f
```

---

## Test Suite Execution & Quality Metrics

ProjectX-Ray AI maintains a comprehensive automated testing suite:

```bash
# Run Frontend Tests (122 Vitest Integration Tests)
npm run test:frontend

# Run Backend Tests (371 Node.js Tests across 32 Suites)
npm run test:backend

# Run Full End-to-End Test Suite (493 Total Assertions)
npm run test

# Run Oxlint Static Analysis (481 Files)
npm run lint

# Run Production TypeScript Build
npm run build
```

### Quality Assurance Benchmark

```
Test Files  : 44 passed (100%)
Total Tests : 493 passed (100%)
Failures    : 0
Build Time  : ~2.1 seconds (Vite 8 + TSX)
Lint Score  : 0 errors across 481 files
```

---

## License & Attribution

Distributed under the **MIT License**. Engineered for academic excellence and unbiased technical evaluation.

# ProjectX-Ray AI — Production Architecture & Engineering Guide

> **"Your AI Project Jury"** — Autonomous multimodal intelligence platform for collegiate, hackathon, and incubator project evaluation.

ProjectX-Ray AI ingests software codebases, hardware schematics, pitch decks, and live/recorded demonstration media. It executes a 15-stage multi-agent evaluation pipeline with strict evidence lineage, deterministic rubric scoring, claim veracity verification, and institutional dossier generation.

---

## Architecture Overview

The platform is engineered with strict separation of concerns across 7 distinct operational layers:

```
[INPUT / INGESTION]  --> PDF, PPTX, DOCX, MP4, WebM, GitHub, Schematics
         ↓
[PIPELINE ORCHESTRATOR] (15-Stage Async Job Execution Engine)
         ↓
[SPECIALIZED AGENTS] (10 Domain-Specific Auditing & Verification Agents)
         ↓
[UNIVERSAL EVIDENCE GRAPH] (Normalized Multi-Source Corroboration Engine)
         ↓
[DETERMINISTIC SCORING ENGINE] (Strict 100% Mathematical Rubric Calibration)
         ↓
[AI JURY ENGINE] (Evidence-Traceable Deliberation, Verdicts & Judge Inquiries)
         ↓
[DOSSIER REPORTING] (20-Section Comprehensive Institutional Evaluation Dossier)
```

---

## Key Principles & Guarantees

1. **Evidence-First Data Model**: No AI conclusion or score is permitted without supporting or contradicting evidence references (`location`, `source`, `confidence`, `content`).
2. **Deterministic Rubric Weights**: Scoring categories strictly sum to 100.0%. AI agents are prohibited from modifying category weights.
3. **Score vs. Confidence Separation**: Raw score reflects merit; confidence is calibrated independently based on evidence depth, claim verification ratios, and penalty deductions.
4. **Provider Neutrality**: Clean `AIProvider` and `ResearchProvider` abstractions allow swapping between deterministic mock mode (`MOCK_AI=true`) and live models (`OpenAI`, `Anthropic`, `Gemini`, `Perplexity`) without altering business logic.

---

## Database Architecture

ProjectX-Ray AI leverages an embedded, zero-dependency SQLite architecture using Node 22's native `DatabaseSync` engine (`node:sqlite`) configured with Write-Ahead Logging (`WAL`), foreign key enforcement, and indexes.

### Normalized Schema (24 Tables)

| Domain | Tables | Description |
| :--- | :--- | :--- |
| **Core** | `projects`, `team_members`, `project_files`, `project_links` | Project registration, team rosters, and uploaded assets. |
| **Lifecycle** | `evaluations`, `analysis_jobs` | Execution tracking across 15 asynchronous pipeline stages. |
| **Evidence** | `evidence`, `claim_evidence` | Universal evidence registry and M:N claim-evidence links. |
| **DNA & Tech** | `project_dna`, `technical_assessments` | Architecture taxonomy, software & hardware rubrics. |
| **Prior Art** | `originality_assessments`, `similarity_results`, `research_sources`, `research_findings` | Prior art investigation, patent scans, similarity vectors. |
| **Claims** | `claims` | Performance & feasibility claims verified across 5 states. |
| **Impact & Feasibility** | `impact_assessments`, `feasibility_assessments` | Socio-economic models and pilot-to-production roadmaps. |
| **Presentation** | `presentation_analyses`, `demo_analyses` | Pitch delivery metrics, demonstrated feature matrices. |
| **Scoring & Jury** | `scores`, `risks`, `recommendations`, `judge_questions`, `evaluation_reports` | Calibrated category scores, jury deliberations, dossiers. |

---

## 15-Stage Analysis Pipeline

When an evaluation is started via `POST /api/evaluations/:id/start`, the `OrchestrationService` coordinates the following sequence:

1. **INGESTION**: Validates file types (PDF, PPTX, DOCX, MP4, MOV, WebM) and registers metadata.
2. **CONTENT EXTRACTION**: Extracts text, schematics, and video frames.
3. **PROJECT UNDERSTANDING**: Synthesizes `ProjectDNA` (problem, solution, tech stack, architecture).
4. **CLAIM EXTRACTION**: Identifies empirical statements (performance, scalability, cost savings).
5. **TECHNICAL ANALYSIS**: Executes software code audit or hardware engineering evaluation.
6. **RESEARCH**: Performs autonomous prior art, academic literature, and patent scans.
7. **ORIGINALITY ANALYSIS**: Analyzes concept, feature, and architectural similarity.
8. **CLAIM VERIFICATION**: Classifies claims (`VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`, `CONTRADICTED`, `INSUFFICIENT_EVIDENCE`).
9. **IMPACT ANALYSIS**: Evaluates social, economic, and environmental impact.
10. **FEASIBILITY ANALYSIS**: Computes prototype readiness, deployment complexity, and commercialization roadmap.
11. **PRESENTATION ANALYSIS**: Analyzes clarity, confidence, pacing, structure, and delivery.
12. **DEMO ANALYSIS**: Correlates demonstrated functionality against claimed features.
13. **SCORING**: Computes deterministic weighted scores and confidence calibrations.
14. **JURY VERDICT**: Deliberates verdict (`EXCEPTIONAL`, `STRONG`, `PROMISING`, `NEEDS_IMPROVEMENT`, `WEAK`).
15. **REPORT GENERATION**: Assembles the master 20-section intelligence report.

---

## Deterministic Scoring Rubric

Rubric weights are mathematically validated to equal 100.0%:

| Rubric Dimension | Weight | Focus Area |
| :--- | :---: | :--- |
| **Problem & Need** | **15%** | Problem urgency, target user alignment, market relevance |
| **Technical Quality** | **20%** | Architecture modularity, code quality, hardware engineering |
| **Innovation & Originality** | **15%** | Differentiation from prior art, novelty classification |
| **Social Impact** | **15%** | Population affected, accessibility, environmental sustainability |
| **Presentation** | **10%** | Delivery clarity, narrative structure, time management |
| **Demonstration** | **10%** | Working prototype completeness, error-free execution |
| **Feasibility & Scalability** | **10%** | Deployment complexity, infrastructure cost, unit economics |
| **Future Potential** | **5%** | Commercial viability, roadmap maturity, moat |
| **Total** | **100%** | $\sum (\text{CategoryScore} \times \text{Weight})$ |

---

## REST API Reference

### Health & System
- `GET /api/health` — Platform status, environment, mock mode status.

### Projects
- `GET /api/projects` — List all registered projects.
- `GET /api/projects/:id` — Retrieve project metadata, files, links, and team roster.
- `POST /api/projects` — Create project submission.
- `PATCH /api/projects/:id` — Update project details.
- `DELETE /api/projects/:id` — Remove project and cascade associated evaluations.

### Evaluations & Pipeline
- `POST /api/evaluations` — Initialize evaluation instance in `QUEUED` state.
- `GET /api/evaluations` — List all evaluation records.
- `GET /api/evaluations/:id` — Get evaluation summary and jury verdict.
- `POST /api/evaluations/:id/start` — Launch 15-stage analysis pipeline asynchronously.
- `POST /api/evaluations/:id/cancel` — Cancel in-progress evaluation jobs.
- `GET /api/evaluations/:id/status` — Real-time job progression across all 15 stages.

### Deep Assessment Modules
- `GET /api/evaluations/:id/project` — ProjectDNA and architectural synthesis.
- `GET /api/evaluations/:id/technical` — Software/hardware rubric assessment.
- `GET /api/evaluations/:id/originality` — Originality scores, prior art similarity matches.
- `GET /api/evaluations/:id/claims` — Extracted claims with corroborating evidence chains.
- `GET /api/evaluations/:id/impact` — Social, economic, and environmental impact assessments.
- `GET /api/evaluations/:id/presentation` — Speech analytics and demonstration feature matrix.
- `GET /api/evaluations/:id/jury` — Final jury verdict, strengths, weaknesses, risks, and recommendations.
- `GET /api/evaluations/:id/report` — Complete 20-section master evaluation dossier.

### Universal Evidence & Graph
- `GET /api/evaluations/:id/evidence` — Retrieve all evidence artifacts ingested for evaluation.
- `GET /api/evidence/:id` — Retrieve specific evidence artifact by ID.
- `GET /api/evidence/graph/:id/score/:categoryKey` — Reverse causal query: explains why a rubric category received a specific score and returns linked evidence.
- `GET /api/evidence/graph/claim/:claimId` — Full corroboration lineage for a specific project claim.

---

## Getting Started

### 1. Prerequisites
- **Node.js 22+** (supports native `node:sqlite`)
- **npm 10+**

### 2. Installation
```bash
# Clone the repository and install dependencies
npm install
```

### 3. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
Default parameters are configured for deterministic mock evaluation (`MOCK_AI=true`).

### 4. Database Setup & Seeding
Populate the database with the pre-configured cohort of 5 reference projects (`Smart Road Vision`, `AgroSense`, `CyberShield`, `MediTrack`, `SolarGuard`):
```bash
npm run db:seed
```

### 5. Running Automated Tests
Execute the comprehensive backend test suite verifying rubric weights, scoring determinism, confidence calibration, and evidence graph queries:
```bash
npm run test:backend
```

### 6. Starting Development Servers
Run the Express backend daemon (port `3001`):
```bash
npm run server
```

In a separate terminal, launch the Vite frontend development server (port `5173`):
```bash
npm run dev
```

The frontend includes a configured reverse proxy in `vite.config.ts` mapping `/api` requests seamlessly to `http://localhost:3001`.

---

## Phase 3: Document Intelligence Engine

ProjectX-Ray AI includes an autonomous document processing pipeline that parses and extracts structured intelligence from project submissions (PDF, PPT, PPTX, DOC, DOCX, PNG, JPG, JPEG).

### Document Intelligence Pipeline
1. **Multimodal Ingestion**: File validation (MIME, extension, size limit 100MB) and status tracking (`UPLOADED`, `QUEUED`, `PROCESSING`, `COMPLETED`, `WARNING`, `FAILED`).
2. **Page & Slide Segmentation**: Treats PowerPoint slides and PDF pages as atomic analysis units, preserving structure (`document` $\rightarrow$ `page/slide` $\rightarrow$ `block` $\rightarrow$ `text`).
3. **Table Extraction**: Preserves tabular headers and row matrices (e.g., accuracy, FPS, power draw) without flattening.
4. **Visual Understanding**: Classifies diagrams (`ARCHITECTURE_DIAGRAM`, `HARDWARE_PHOTO`, `UI_SCREEN`, `CHART`, `FLOWCHART`) with confidence markers (`DETECTED`, `PROBABLE`, `UNCERTAIN`).
5. **Technology Extraction**: Categorizes stack items across 13 domains (Languages, Frameworks, AI Models, Sensors, Protocols, Hardware).
6. **Architecture Graph**: Reconstructs software/hardware node-edge topologies.
7. **Claim Extraction**: Ingests project claims marked strictly as `CLAIMED` until subsequent cross-examination and verification.
8. **Evidence Gap Detection**: Flags empirical claims lacking test split sizes, adverse weather conditions, or experimental baselines.
9. **Contradiction Detection**: Identifies internal numerical or methodological discrepancies across slides (e.g., Slide 7: 95.4% vs Slide 8: 91.2%).
10. **Document Quality Scoring**: Computes `documentQualityScore` (0-100) and detects missing essential sections (limitations, cost, dataset, references).

### Document Intelligence API
- `POST /api/documents/upload` — Ingest document with security sanitization.
- `GET /api/documents/:id` — Metadata, status, quality score.
- `GET /api/documents/:id/pages` — Discrete pages/slides, tables, images.
- `GET /api/documents/:id/evidence` — Linked universal evidence items.
- `GET /api/documents/:id/claims` — Extracted claims (`CLAIMED` status).
- `GET /api/documents/:id/technologies` — Extracted technology stack items.
- `GET /api/documents/:id/architecture` — Directed node-edge architecture topology.
- `GET /api/evaluations/:id/evidence-gaps` — Identified evidence gaps with severity.
- `GET /api/evaluations/:id/contradictions` — Internal and cross-document discrepancies.
- `GET /api/evaluations/:id/document-quality` — Detailed quality scores and missing sections.
- `GET /api/evaluations/:id/documents` — Ingested documents list for an evaluation.

### Frontend 3-Column Viewer
Accessible under the **Doc Intelligence** tab in the Evaluation Workspace (`/evaluations/:id/documents`):
- **Left Column**: Ingested documents selector with slide counts, file sizes, and quality score badges.
- **Center Column**: Interactive slide canvas with slide navigator, segmented text blocks, preserved tables, and classified schematics with bounding cues.
- **Right Column**: AI Intelligence Inspector displaying extracted claims, identified technologies, evidence gaps, contradiction notices, and click-to-highlight source synchronizers.

---

## Seed Dataset Cohorts

| Project Slug | Type | Domain | Seed Overall Score | Verdict |
| :--- | :---: | :--- | :---: | :---: |
| `smart-road-vision` | SOFTWARE | AI / Computer Vision (Edge Transit) | 84.7 | STRONG |
| `agrosense` | HARDWARE | AgriTech / Embedded IoT Soil Rig | 88.2 | EXCEPTIONAL |
| `cybershield` | SOFTWARE | Cybersecurity / Zero-Trust Mesh | 91.5 | EXCEPTIONAL |
| `meditrack` | SOFTWARE | HealthTech / NLP Clinical Triage | 78.4 | PROMISING |
| `solarguard` | HARDWARE | CleanTech / Power Electronics | 82.1 | STRONG |

---

## License & Attribution

Designed and engineered for **ProjectX-Ray AI: Your AI Project Jury**.
Developed with TypeScript, Express, SQLite (`node:sqlite`), React 19, Vite, and Tailwind CSS.
#   A i - p r o j e c t - S c o r i n g - S y s t e m  
 
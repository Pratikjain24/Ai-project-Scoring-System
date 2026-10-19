# ProjectX-Ray AI — Codebase Analysis Report

**Generated:** 2026-09-19
**Repository:** `final year project` (branch `main`, single commit `85c8257`)
**Scope:** Full static + tooling analysis of the frontend, backend, database, tests, and build health.

---

## 1. Executive Summary

**ProjectX-Ray AI** ("Your AI Project Jury") is a full-stack, multi-agent project-evaluation platform aimed at collegiate, hackathon, and incubator judging. It ingests multimodal submissions (documents, decks, code, video) and runs a 15-stage pipeline of specialized AI agents to produce an evidence-backed, deterministically weighted score plus a 20-section institutional dossier.

| Attribute | Value |
| :--- | :--- |
| Total source (TS/TSX/SQL) | ~85,000 LOC |
| Backend (`backend/src`) | 177 files · ~31,600 LOC |
| Frontend (`src`) | 183 TS/TSX files · ~52,300 LOC |
| Frontend components | 31 top-level files across 20 feature directories |
| Database tables | 93 (`CREATE TABLE IF NOT EXISTS`) |
| REST controllers / route modules | 15 / 15 |
| Backend test files | 11 |
| Mock data (frontend fallback) | ~9,100 LOC |

**Overall assessment:** A large, well-organized, feature-complete academic prototype with a genuinely clean layered backend. It is **not production-ready** despite the `PRODUCTION_READINESS.md` checklist claims: authentication is effectively stubbed, several "AI" scores are hardcoded, and the frontend runs on a large mock-data fallback layer. Build, typecheck, and the backend test suite all pass cleanly.

---

## 2. Technology Stack

**Frontend**
- React 19.2 + React DOM 19.2
- Vite 8.2 (dev server, proxy `/api` → `localhost:3001`)
- TypeScript ~6.0 (project references: `tsconfig.app.json`, `tsconfig.node.json`)
- Tailwind CSS 3.4 + PostCSS + Autoprefixer
- `react-router-dom` 7 (14 workspace tabs)
- `framer-motion` 13, `lucide-react` 1.41, `canvas-confetti`
- `zod` 4, `clsx`, `tailwind-merge`

**Backend**
- Node 22.21 (required for native `node:sqlite` `DatabaseSync`)
- Express 5 + `cors` + `dotenv`
- `zod` for validation, `tsx` as the TS runtime
- SQLite embedded DB (WAL mode), no ORM

**Tooling**
- `oxlint` (linter), `tsc -b` (build/typecheck), `tsx --test` (backend tests)
- Custom `scripts/dev.js` launcher (`npm run dev:all`)

---

## 3. Repository Layout

```
final year project/
├── src/                      # React frontend
│   ├── components/           # 20 feature modules + ui/ primitives
│   ├── pages/                # 6 routed pages
│   ├── data/                 # ~9,100 LOC of mock datasets
│   ├── services/api.ts       # 1,401 LOC centralized API client
│   ├── types/                # 16 domain type files
│   ├── context/              # Auth + Theme providers
│   └── App.tsx               # Router
├── backend/
│   ├── src/
│   │   ├── agents/           # 10 pipeline agents
│   │   ├── ai/               # AIProvider abstraction + mock
│   │   ├── controllers/      # 15 controllers
│   │   ├── routes/           # 15 route modules
│   │   ├── repositories/     # 18 data-access modules
│   │   ├── db/               # database.ts, schema.sql (1,548 lines), seed.ts
│   │   ├── pipeline/         # orchestrator, state machine, checkpoints
│   │   ├── scoring/          # scoring engine + validator
│   │   ├── specialist-evaluators/  # SW/HW/AI domain evaluators
│   │   ├── research-intelligence/  # academic/patent/github adapters
│   │   ├── document-intelligence/  # parsing, tables, visual, contradictions
│   │   ├── multimodal/       # video/audio/transcription
│   │   ├── originality-intelligence/
│   │   ├── live/ + live-jury # live camera jury engine
│   │   ├── report/           # dossier + PDF generation
│   │   ├── middleware/       # auth, logger, rateLimiter, validator, errors
│   │   ├── services/         # storage, authz, health, usage, urlSecurity
│   │   └── tests/            # 11 test suites
│   └── projectxray.db        # checked-in SQLite database
├── scripts/dev.js
├── PRODUCTION_READINESS.md
└── README.md
```

---

## 4. Backend Architecture

### 4.1 Layered request flow
`routes → controllers → services/engines → repositories → SQLite`

The separation is consistently respected. Controllers are thin, repositories encapsulate all SQL, and domain engines (scoring, research, originality, document intelligence, claim verification) are independently importable and unit-testable.

### 4.2 Server bootstrap (`backend/src/server.ts`)
- Initializes schema on import via `initSchema()`.
- Strict CORS: in production only configured origins; dev allows localhost regex.
- JSON body limit raised to 50 MB.
- Public `GET /api/health`; all other route groups require `authenticate`.
- Admin routes additionally require `requireRole('ADMIN')`.
- Versioned `/api/v1/*` aliases are mounted for projects, evaluations, admin.
- Server skips `listen()` when a test file is detected (enables in-process testing).

### 4.3 The 15-stage pipeline (`pipeline/orchestrationService.ts`)
Stages 1–15 run asynchronously via `setImmediate`, with per-stage job records persisted so the UI can poll `/status`:

1. Multimodal artifact ingestion
2. Document & schematic content extraction
3. Project DNA synthesis
4. Claim & hypothesis extraction
5. Technical architecture / code audit
6. Autonomous prior-art, literature & patent scan
7. Originality & novelty intelligence
8. Multimodal claim verification
9. Social & economic impact modeling
10. Deployment feasibility & cost
11. Presentation & speech forensics
12. Demonstration & feature validation
13. Deterministic rubric scoring & calibration
14. AI jury deliberation & verdict
15. 20-section dossier assembly

### 4.4 Database
- Native `node:sqlite` `DatabaseSync`, WAL journaling, foreign keys enforced, indexed.
- **93 tables** covering core project data, evidence graph, document intelligence, multimodal analysis, claim verification, originality, research, live-jury sessions, governance (audit logs, reviews, revisions, feature flags, usage records).
- Declarative, idempotent schema (1,548 lines) with `CREATE TABLE IF NOT EXISTS`.
- Seeded with 5 reference projects (Smart Road Vision, AgroSense, CyberShield, MediTrack, SolarGuard).

### 4.5 Scoring rubric (`config/scoringWeights.ts`)
Weights are validated to sum exactly to 1.0 (`validateWeights`):

| Dimension | Weight |
| :--- | :---: |
| Problem & Need | 15% |
| Technical Quality | 20% |
| Innovation & Originality | 15% |
| Social Impact | 15% |
| Presentation | 10% |
| Demonstration | 10% |
| Feasibility & Scalability | 10% |
| Future Potential | 5% |
| **Total** | **100%** |

---

## 5. Frontend Architecture

- **Routing** (`App.tsx`): `/dashboard`, `/new-evaluation`, `/evaluations`, `/evaluations/:id`, `/evaluations/:id/:tab`, `/settings`, `/admin`, plus a 404 fallback.
- **Evaluation workspace** is a tabbed SPA with 14 sub-views (Overview, Project DNA, Technical, Originality, Claims, Evidence Checklist, Research, Impact, Presentation, AI Jury, Live Jury, Doc Intelligence, Report).
- **API client** (`services/api.ts`, 1,401 LOC): a single `ApiService` class wrapping `fetch`, with a mock-fallback branch gated on `VITE_USE_MOCKS`. It returns `MOCK_EVALUATIONS` when the backend is unreachable in mock mode.
- **Component organization** is by feature domain, with a shared `ui/` primitive library (Button, Card, Modal, Drawer, DataTable, charts, etc.) — good reuse discipline.
- **Contexts**: `AuthContext` (roles: student/juror/lead reviewer/admin) and `ThemeContext`.

---

## 6. Build, Test & Quality Health

| Check | Command | Result |
| :--- | :--- | :--- |
| Typecheck | `npx tsc -b` | ✅ Pass (exit 0) |
| Backend tests | `npm run test:backend` | ✅ **115 tests, 115 pass, 0 fail** (7 suites) |
| Lint | `npm run lint` (oxlint) | ⚠️ 0 errors, **129 warnings** (mostly `react-hooks/exhaustive-deps`) |
| Frontend tests | — | ❌ None exist |
| Production build artifacts | `dist/` | ✅ Present |

Backend tests meaningfully cover rubric weights, scoring determinism, confidence calibration, evidence-graph queries, claim verification, document intelligence, originality, research, multimodal, live-camera jury, and full-system integration.

---

## 7. Key Findings & Risks

### 🔴 High severity

1. **Authentication is effectively a stub.** `middleware/auth.ts` does *not* verify JWTs. It parses a raw token, checks for substrings (`includes('admin')`), and defaults to `ADMIN`. `JWT_SECRET` in `.env.example` is never used to sign/verify. Any caller can present a bearer token containing "admin" and receive admin role.
2. **Several "AI" scores are hardcoded in the orchestrator.** In `orchestrationService.ts` Stage 13, `problemNeedRaw: 91`, `futurePotentialRaw: 94`, `rawConfidence: 89`, and the entire `evidenceCounts` object are literal constants, not derived from evidence. The documented "deterministic 83.7 Smart Road Vision" result is therefore substantially fixture-defined rather than computed. This undermines the core "evidence-first / no score without evidence" design principle claimed in the README.
3. **Insecure dev fallback.** When no `Authorization` header is present in non-production, the request is granted the default `ADMIN` context. If `NODE_ENV` is ever misconfigured in a deployed environment, the whole API is open.

### 🟠 Medium severity

4. **Documentation drift on the rubric (RESOLVED).** Formerly, `PRODUCTION_READINESS.md` stated weights of *Problem 10% / Future Potential 10%*, while `scoringWeights.ts` and `README.md` define *Problem 15% / Future Potential 5%*. The readiness documentation has been unified to *Problem 15% / Future Potential 5%* and is permanently locked by automated CI test #18.
5. **Frontend is half-mock, half-live.** 17 frontend modules import mock datasets directly while 25 import the API service. This hybrid makes it easy for UI to display plausible but non-real data, and hides backend regressions.
6. **No frontend test coverage** and no test runner configured for `src/`. All 11 suites are backend-only.
7. **Checked-in SQLite database** (`backend/projectxray.db`) and a populated `dist/` are committed, which invites stale-state bugs and merge conflicts.
8. **`console.log` in 21 backend files** rather than using the structured logger that already exists, weakening observability.

### 🟡 Low severity / hygiene

9. 129 lint warnings (dominated by hook dependency arrays) — cheap to resolve and improves correctness.
10. `node:sqlite` pins the platform to **Node 22+**; this requirement is easy to miss and there is no `engines` field in `package.json` to enforce it.
11. **29 files are currently modified/untracked** in the working tree (including `server.ts`, `auth.ts`, `api.ts`, `App.tsx`, a new `AuthContext`, and `scripts/`). These appear to be in-progress work from another thread and were left untouched; ownership should be confirmed before any commit.

---

## 8. Strengths

- Genuinely clean layering (routes → controllers → engines → repositories) with dependency injection by static class, making engines independently testable.
- Provider-neutral `AIProvider` / `ResearchProvider` abstractions allow mock vs. live swaps without touching business logic.
- Rich evidence-graph model with reverse causal queries (`score → evidence`) — a strong differentiator.
- Broad, passing backend test suite (115 tests) validating determinism and calibration.
- Excellent UI information architecture: 20+ feature modules, consistent `ui/` primitives, 14-tab workspace.
- 93-table schema shows real depth in modeling multimodal evaluation.

---

## 9. Recommendations (prioritized)

1. **Implement real JWT verification** (`jsonwebtoken` or `jose`) using `JWT_SECRET`; remove substring role inference; fail closed when no token in *all* environments except an explicit test flag.
2. **Derive Stage 13 raw scores and evidence counts from actual agent outputs** instead of constants, or clearly flag them as demo fixtures.
3. **Converge the rubric documentation** on the code (`scoringWeights.ts`) and add a test asserting docs match code.
4. **Remove the frontend mock fallback** from production paths, or gate it behind a build-time flag that is stripped from production bundles.
5. **Add frontend tests** (Vitest + React Testing Library) starting with the API client and workspace routing.
6. **Add `engines: { node: ">=22" }`** and stop committing `projectxray.db` / `dist/`.
7. **Replace `console.log` with the structured logger** and wire request IDs end-to-end.
8. **Resolve lint warnings** and consider enabling `--deny-warnings` in CI.

---

## 10. Method

Analysis was performed by static inspection of entry points (`server.ts`, `App.tsx`, `orchestrationService.ts`, `scoringWeights.ts`, `schema.sql`, `auth.ts`, `api.ts`), filesystem enumeration and LOC counting, schema/table counts, and by executing the project's own tooling: `npx tsc -b`, `npm run test:backend`, and `npm run lint`. No application code was modified.

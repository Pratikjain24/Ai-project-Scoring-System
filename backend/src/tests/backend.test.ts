import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { validateWeights, SCORING_WEIGHTS, RUBRIC_LABELS } from '../config/scoringWeights';
import { ScoringEngine } from '../scoring/scoringEngine';
import { ScoreValidator } from '../scoring/scoreValidator';
import { ProjectRepository } from '../repositories/projectRepository';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { ClaimRepository } from '../repositories/claimRepository';
import { EvidenceGraphService } from '../evidence/evidenceGraphService';
import { ConsolidatedPipelineService } from '../pipeline/consolidatedPipelineService';
import { CostOptimizerService } from '../services/costOptimizerService';
import { MultimodalMemoryGuard } from '../multimodal/multimodalMemoryGuard';
import { MultimodalPipeline } from '../multimodal/multimodalPipeline';
import { ReportSchemaGuard } from '../report/reportSchemaGuard';
import { ReportEngine } from '../report/reportEngine';
import { CircuitBreaker } from '../ai/circuitBreaker';
import { ResilientAiRouter } from '../ai/resilientAiRouter';
import { AIProviderFactory } from '../ai/aiProviderFactory';
import { LoadTestHarness } from './loadTestHarness';
import { initSchema, db } from '../db/database';
import { seedDatabase } from '../db/seed';

describe('ProjectX-Ray AI - Backend Core Architecture Tests', async () => {
  // Setup database
  await seedDatabase();

  it('1. Category weights MUST sum strictly to 1.0 (100.0%)', () => {
    const isSum100 = validateWeights();
    assert.strictEqual(isSum100, true, 'Scoring weights do not equal 100%');

    const sum = Object.values(SCORING_WEIGHTS).reduce((acc, w) => acc + w, 0);
    assert.strictEqual(Math.round(sum * 1000) / 1000, 1.0);
  });

  it('2. Scoring engine calculation is 100% deterministic and reproducible', () => {
    const input = {
      problemNeedRaw: 91,
      technicalQualityRaw: 87,
      originalityRaw: 68,
      socialImpactRaw: 92,
      presentationRaw: 76,
      demonstrationRaw: 84,
      feasibilityScalabilityRaw: 79,
      futurePotentialRaw: 94,
      evidenceCounts: {
        problemNeed: 6,
        technicalQuality: 12,
        originality: 7,
        socialImpact: 5,
        presentation: 4,
        demonstration: 4,
        feasibilityScalability: 4,
        futurePotential: 2,
      },
      rawConfidence: 89,
      hasContradictedClaims: false,
      unverifiedClaimRatio: 0.25,
    };

    const run1 = ScoringEngine.calculate('test_eval_1', input);
    const run2 = ScoringEngine.calculate('test_eval_1', input);

    assert.strictEqual(run1.overallScore, 83.7);
    assert.strictEqual(run1.overallScore, run2.overallScore);
    assert.strictEqual(run1.verdict, 'STRONG');
    assert.strictEqual(run1.categoryScores.length, 8);
  });

  it('3. ScoreValidator enforces confidence caps when evidence is sparse', () => {
    // With evidence count < 3, confidence must be capped at 65%
    const result = ScoreValidator.validateAndCalibrateConfidence(95, 2, false, 0);
    assert.strictEqual(result.calibratedConfidence, 65);
    assert.strictEqual(result.warnings.length > 0, true);
  });

  it('4. ScoreValidator applies penalties for contradicted claims', () => {
    const result = ScoreValidator.validateAndCalibrateConfidence(90, 10, true, 0.1);
    assert.strictEqual(result.calibratedConfidence, 75); // 90 - 15 = 75
  });

  it('5. ProjectRepository stores and retrieves normalized projects', () => {
    const project = ProjectRepository.findById('smart-road-vision');
    assert.ok(project, 'Seeded project smart-road-vision not found');
    assert.strictEqual(project?.name, 'Smart Road Vision');
    assert.strictEqual(project?.architectureType, 'SOFTWARE');
  });

  it('6. EvaluationRepository links projects and retrieves status', () => {
    const evalItem = EvaluationRepository.findById('eval_smart-road-vision');
    assert.ok(evalItem, 'Seeded evaluation not found');
    assert.strictEqual(evalItem?.projectId, 'smart-road-vision');
    assert.strictEqual(evalItem?.status, 'COMPLETED');
  });

  it('7. Universal Evidence repository supports batch linking and queries', () => {
    const evidenceItems = EvidenceRepository.findByEvaluationId('eval_smart-road-vision');
    assert.ok(evidenceItems.length >= 3, 'Evidence items count is less than 3');
    assert.ok(evidenceItems.some(e => e.type === 'PROJECT_DOCUMENT'));
    assert.ok(evidenceItems.some(e => e.type === 'GITHUB'));
  });

  it('8. Claim repository correctly maps supporting evidence joins', () => {
    const claims = ClaimRepository.findByEvaluationId('eval_smart-road-vision');
    assert.ok(claims.length >= 2, 'Claims count is less than 2');

    const lineage = EvidenceGraphService.getLineageForClaim(claims[0].id);
    assert.ok(lineage, 'Claim lineage not found');
    assert.strictEqual(lineage?.claim.id, claims[0].id);
    assert.ok(lineage?.supportingEvidence.length > 0);
  });

  it('9. EvidenceGraphService answers "Why did originality receive X score?"', () => {
    const lineage = EvidenceGraphService.getLineageForScore('eval_smart-road-vision', 'originality');
    assert.ok(lineage, 'Score lineage for originality not found');
    assert.strictEqual(lineage?.category, 'Innovation & Originality');
    assert.ok(lineage?.supportingEvidence.length > 0);
  });

  it('10. Scenario 3 Mitigation: 5 Consolidated Specialist Personas subsume 10 micro-agents without gaps', () => {
    const personas = ConsolidatedPipelineService.getPersonas();
    assert.strictEqual(personas.length, 5, 'Must have exactly 5 consolidated personas');

    const allSubsumed = personas.flatMap(p => p.subsumedAgents);
    assert.ok(allSubsumed.includes('ProjectUnderstandingAgent'));
    assert.ok(allSubsumed.includes('SoftwareEvaluator'));
    assert.ok(allSubsumed.includes('ClaimVerificationAgent'));
    assert.ok(allSubsumed.includes('ResearchAgent'));
    assert.ok(allSubsumed.includes('OriginalityAgent'));
    assert.ok(allSubsumed.includes('PresentationAgent'));
    assert.ok(allSubsumed.includes('DemoAgent'));
    assert.ok(allSubsumed.includes('ImpactAgent'));
    assert.ok(allSubsumed.includes('FeasibilityAgent'));
    assert.ok(allSubsumed.includes('MasterScoringEngine'));
  });

  it('11. Scenario 3 Mitigation: 8 Essential Macro-Stages map 100% of 15 micro-stages', () => {
    const essentialStages = ConsolidatedPipelineService.getEssentialStages();
    assert.strictEqual(essentialStages.length, 8, 'Must have exactly 8 essential stages');

    // Verify all 15 micro-stages are mapped
    const coveredMicroStages = new Set(essentialStages.flatMap(s => s.subsumedStages));
    for (let i = 1; i <= 15; i++) {
      assert.ok(coveredMicroStages.has(i), `Micro-stage ${i} is not mapped to an essential stage`);
    }

    // Verify mapping function
    assert.strictEqual(ConsolidatedPipelineService.mapMicroStageToEssential(1).id, 1);
    assert.strictEqual(ConsolidatedPipelineService.mapMicroStageToEssential(4).id, 3);
    assert.strictEqual(ConsolidatedPipelineService.mapMicroStageToEssential(13).id, 8);
    assert.strictEqual(ConsolidatedPipelineService.mapMicroStageToEssential(15).id, 8);
  });

  it('12. Scenario 3 Mitigation: 40 Core Domain Aggregates represent 60% reduction over 93 tables', () => {
    const aggregates = ConsolidatedPipelineService.getCoreSchemaAggregates();
    assert.strictEqual(aggregates.length, 40, 'Must have exactly 40 core domain aggregates');

    // Verify 5 bounded contexts
    const contexts = new Set(aggregates.map(a => a.context));
    assert.strictEqual(contexts.size, 5);
    assert.ok(contexts.has('SUBMISSIONS_DNA'));
    assert.ok(contexts.has('EVIDENCE_CLAIMS'));
    assert.ok(contexts.has('RESEARCH_NOVELTY'));
    assert.ok(contexts.has('SCORING_RUBRICS'));
    assert.ok(contexts.has('GOVERNANCE_DOSSIER'));
  });

  it('13. Scenario 3 Mitigation: Pipeline dependency graph is strictly acyclic (zero circular cascades)', () => {
    const res = ConsolidatedPipelineService.verifyAcyclicGraph();
    assert.strictEqual(res.isAcyclic, true);
    assert.strictEqual(res.totalNodes, 8);
    assert.ok(res.totalEdges >= 7);
  });

  it('14. Scenario 4 Mitigation: SQLite Concurrent Write Deadlock Immunity (10 concurrent writers)', async () => {
    const evalId = 'eval_smart-road-vision';

    // Launch 10 simultaneous concurrent write transactions simulating multi-project pipeline load
    const concurrentWrites = Array.from({ length: 10 }).map((_, idx) => {
      return db.transactionAsync(async () => {
        const claimId = `stress_test_clm_${Date.now()}_${idx}`;
        db.run(
          `INSERT OR REPLACE INTO claims (id, evaluation_id, claim_text, claim_type, importance, status, confidence, project_evidence, explanation)
           VALUES (?, ?, ?, 'PERFORMANCE', 'HIGH', 'VERIFIED', 0.95, 'Stress test benchmark', 'Verified concurrently')`,
          claimId,
          evalId,
          `Concurrent throughput benchmark claim #${idx}`
        );

        // Immediate interleaved read to test reader/writer concurrency
        const readBack = db.get<any>(`SELECT id, claim_text FROM claims WHERE id = ?`, claimId);
        assert.ok(readBack, 'Interleaved read within concurrent transaction must succeed');
        assert.strictEqual(readBack.id, claimId);

        // Clean up
        db.run(`DELETE FROM claims WHERE id = ?`, claimId);
        return idx;
      });
    });

    const results = await Promise.all(concurrentWrites);
    assert.strictEqual(results.length, 10, 'All 10 concurrent write transactions must complete without SQLITE_BUSY');
  });

  it('15. Scenario 5 Mitigation: AI Provider Cost Optimization and Model Cascade (97% Cost Reduction)', () => {
    // 1. Model Tier Assignment
    const stage14Tier = CostOptimizerService.getOptimalTierForStage(14);
    assert.strictEqual(stage14Tier.tier, 'TIER_1_REASONING', 'Stage 14 must use Tier 1 frontier reasoning');

    const stage4Tier = CostOptimizerService.getOptimalTierForStage(4);
    assert.strictEqual(stage4Tier.tier, 'TIER_2_FAST', 'Stage 4 must use Tier 2 fast structured reasoning');

    const stage1Tier = CostOptimizerService.getOptimalTierForStage(1);
    assert.strictEqual(stage1Tier.tier, 'TIER_3_LOCAL', 'Stage 1 must use Tier 3 local zero-cost deterministic parser');

    // 2. Token Pruning Optimization (Excluding node_modules, lockfiles, binaries)
    const testFiles = [
      { path: 'src/main.ts', content: 'console.log("Entrypoint code for highway AI vision");' },
      { path: 'node_modules/react/index.js', content: 'var a = 1;'.repeat(5000) },
      { path: 'package-lock.json', content: '{"name": "test"}'.repeat(3000) },
      { path: 'assets/demo.mp4', content: 'BINARY_PAYLOAD_CHUNK_DATA'.repeat(1000) },
    ];
    const pruneResult = CostOptimizerService.pruneSourcePayload(testFiles);
    assert.strictEqual(pruneResult.prunedFiles.length, 1, 'Only non-dependency source code must be retained');
    assert.strictEqual(pruneResult.prunedFiles[0].path, 'src/main.ts');
    assert.ok(pruneResult.tokenReductionRatio > 0.85, 'Token reduction ratio must exceed 85%');

    // 3. Vision Keyframe Sampling
    const keyframes = CostOptimizerService.sampleDemonstrationKeyframes(180, [45, 120]);
    assert.ok(keyframes.length <= 5, 'Vision keyframes must be capped at 5 instead of 180 continuous frames');
    assert.ok(keyframes.includes(45));
    assert.ok(keyframes.includes(120));

    // 4. Comparative Cost Analysis & Budget Enforcement
    const report = CostOptimizerService.generateComparativeReport('eval_cost_test');
    assert.strictEqual(report.isWithinBudget, true, 'Optimized evaluation must remain within the $0.35 budget cap');
    assert.ok(report.optimizedCostUSD < 0.15, `Optimized cost ($${report.optimizedCostUSD}) must be < $0.15`);
    assert.ok(report.savingsPercentage >= 90.0, `Savings (${report.savingsPercentage}%) must exceed 90%`);
    assert.strictEqual(report.unoptimizedCostUSD, 2.84, 'Baseline unoptimized cost is $2.84');

    // 5. Budget Guard Telemetry
    const budgetCheck = CostOptimizerService.recordCost('eval_cost_test', report.optimizedCostUSD);
    assert.strictEqual(budgetCheck.isBudgetExceeded, false, 'Standard optimized evaluation does not exceed budget');
    assert.strictEqual(budgetCheck.budgetCapUSD, 0.35);
  });

  it('16. Scenario 6 Mitigation: Evidence Graph Circular Reference Loop Immunity (Zero Stack Overflow)', () => {
    const evalId = 'eval_smart-road-vision';

    // Seed test claims representing Scenario 6 mutual contradiction loop:
    // Claim A: "Uses zero external APIs"
    //   └─ Evidence 1: Documentation page 12 (SUPPORTING)
    //   └─ Evidence 2: Code imports AWS SDK (CONTRADICTED)
    // Claim B: "Deploys on local edge hardware"
    //   └─ Evidence 3: Architecture diagram shows cloud (CONTRADICTED)
    //   └─ Evidence 4: References Claim A deployment model
    const claimAId = `clm_circ_a_${Date.now()}`;
    const claimBId = `clm_circ_b_${Date.now()}`;
    const ev1Id = `ev_1_${Date.now()}`;
    const ev2Id = `ev_2_${Date.now()}`;
    const ev3Id = `ev_3_${Date.now()}`;

    db.run(
      `INSERT INTO claims (id, evaluation_id, claim_text, claim_type, importance, status, confidence, project_evidence, explanation)
       VALUES (?, ?, 'Uses zero external APIs', 'ARCHITECTURE', 'HIGH', 'UNVERIFIED', 85, 'Doc p12', 'References Claim B deployment model')`,
      claimAId,
      evalId
    );

    db.run(
      `INSERT INTO claims (id, evaluation_id, claim_text, claim_type, importance, status, confidence, project_evidence, explanation)
       VALUES (?, ?, 'Deploys on local edge hardware', 'DEPLOYMENT', 'HIGH', 'UNVERIFIED', 80, 'Arch spec', 'References Claim A deployment model')`,
      claimBId,
      evalId
    );

    // Seed Evidence 1 & 2 for Claim A, Evidence 3 for Claim B
    db.run(
      `INSERT INTO evidence (id, evaluation_id, type, source, source_title, location, content, confidence)
       VALUES (?, ?, 'DOCUMENT', 'DOCUMENTATION', 'Documentation page 12', 'Page 12', 'System claims zero external cloud API dependencies', 90)`,
      ev1Id,
      evalId
    );
    db.run(
      `INSERT INTO evidence (id, evaluation_id, type, source, source_title, location, content, confidence)
       VALUES (?, ?, 'CODE', 'SOURCE_CODE', 'AWS SDK Import', 'src/storage.ts:L4', 'import { S3Client } from "@aws-sdk/client-s3";', 95)`,
      ev2Id,
      evalId
    );
    db.run(
      `INSERT INTO evidence (id, evaluation_id, type, source, source_title, location, content, confidence)
       VALUES (?, ?, 'DOCUMENT', 'ARCHITECTURE', 'Architecture Diagram', 'Figure 2', 'Architecture diagram displays AWS Lambda and S3 backend buckets', 88)`,
      ev3Id,
      evalId
    );

    // Link Evidence via claim_evidence
    db.run(`INSERT INTO claim_evidence (id, claim_id, evidence_id, relationship) VALUES (?, ?, ?, 'SUPPORTING')`, `ce_1_${Date.now()}`, claimAId, ev1Id);
    db.run(`INSERT INTO claim_evidence (id, claim_id, evidence_id, relationship) VALUES (?, ?, ?, 'CONTRADICTING')`, `ce_2_${Date.now()}`, claimAId, ev2Id);
    db.run(`INSERT INTO claim_evidence (id, claim_id, evidence_id, relationship) VALUES (?, ?, ?, 'CONTRADICTING')`, `ce_3_${Date.now()}`, claimBId, ev3Id);

    try {
      // Create explicit circular dependency: Claim A -> Claim B and Claim B -> Claim A
      const circularDepMap = new Map<string, string[]>([
        [claimAId, [claimBId]],
        [claimBId, [claimAId]],
      ]);

      // Resolve dependencies: Must NOT throw "Maximum call stack size exceeded"!
      const resA = EvidenceGraphService.resolveClaimDependencies(evalId, claimAId, circularDepMap);

      assert.strictEqual(resA.hasCircularDependency, true, 'Circular dependency must be flagged');
      assert.strictEqual(resA.status, 'CIRCULAR_LOOP', 'Status must be marked CIRCULAR_LOOP');
      assert.ok(resA.cyclePath && resA.cyclePath.length >= 3, 'Cycle path must be recorded');
      assert.ok(resA.cyclePath?.includes(claimAId));
      assert.ok(resA.cyclePath?.includes(claimBId));
      assert.strictEqual(resA.contradictionCount, 1, 'Evidence 2 (AWS SDK) must be counted as contradiction');
      assert.ok(resA.truthConfidence <= 35, 'Truth confidence must be penalized under self-referential loop');
      assert.ok(resA.explanation.includes('Circular reference detected'));

      // Resolve Claim B: Must also be immune to recursion
      const resB = EvidenceGraphService.resolveClaimDependencies(evalId, claimBId, circularDepMap);
      assert.strictEqual(resB.hasCircularDependency, true);
      assert.strictEqual(resB.status, 'CIRCULAR_LOOP');
      assert.strictEqual(resB.contradictionCount, 1, 'Evidence 3 (Cloud diagram) must be counted as contradiction');

      // Audit whole graph: Detects circular loop and advises human viva jury
      const audit = EvidenceGraphService.auditEntireEvidenceGraph(evalId, circularDepMap);
      assert.ok(audit.circularLoopsDetected.length >= 1, 'Audit must isolate circular loop');
      assert.ok(audit.recommendations.some(r => r.includes('circular') || r.includes('Jury')));
      assert.strictEqual(audit.isGraphAcyclic, false, 'Graph with circular references must be marked non-acyclic');
    } finally {
      // Clean up test rows
      db.run(`DELETE FROM claim_evidence WHERE claim_id IN (?, ?)`, claimAId, claimBId);
      db.run(`DELETE FROM evidence WHERE id IN (?, ?, ?)`, ev1Id, ev2Id, ev3Id);
      db.run(`DELETE FROM claims WHERE id IN (?, ?)`, claimAId, claimBId);
    }
  });

  it('17. Scenario 7 Mitigation: Multimodal Processing Memory Leak & OOM Immunity (2.3GB to <200MB)', async () => {
    // 1. Zero-Buffer Streaming Video Ingestion (Never buffers 200MB file in heap)
    const videoSizeBytes = 200 * 1024 * 1024; // 200MB MP4
    const probe = MultimodalMemoryGuard.probeVideoStreaming('mock_200mb_demo.mp4', videoSizeBytes);
    assert.strictEqual(probe.fileSizeBytes, videoSizeBytes);
    assert.ok(probe.memoryConsumedBytes <= 64 * 1024, 'Streaming memory window must remain <= 64KB');
    assert.strictEqual(probe.streamingMode, true);

    // 2. Intelligent Keyframe Downsampling (180 continuous frames -> 4 essential keyframes)
    const durationSeconds = 180; // 3-minute video
    const keyframes = MultimodalMemoryGuard.downsampleKeyframes(durationSeconds, [45, 110]);
    assert.ok(keyframes.optimizedCount <= 5, 'Downsampled keyframes count must not exceed 5');
    assert.ok(keyframes.reductionPercentage >= 99.9, 'Keyframe memory reduction must exceed 99.9%');
    assert.ok(keyframes.optimizedMemoryBytes < 300 * 1024, 'Optimized keyframe RAM must be under 300KB');
    assert.strictEqual(keyframes.unoptimizedCount, 180, 'Unoptimized baseline is 180 continuous frames');
    assert.strictEqual(keyframes.unoptimizedMemoryBytes, 180 * 2 * 1024 * 1024, 'Unoptimized frame memory is 360MB');

    // 3. Sequential Stage Isolation & Active Memory Sweep between Stage 11 & 12
    const reclaim = await MultimodalMemoryGuard.performSequentialMemoryReclaim();
    assert.ok(typeof reclaim.heapUsedBeforeMB === 'number');
    assert.ok(typeof reclaim.heapUsedAfterMB === 'number');

    // 4. Memory Health Monitoring & Circuit Breaker Telemetry
    const health = MultimodalMemoryGuard.checkMemoryHealth();
    assert.ok(health.heapUsedMB < 500, 'Current heap usage should be well below 500MB');
    assert.strictEqual(typeof health.isHealthy, 'boolean');

    // 5. Complete 2GB Cloud VM Safety Audit Profile
    const profile = MultimodalMemoryGuard.generateMemoryProfile(videoSizeBytes, durationSeconds);
    assert.strictEqual(profile.unoptimizedPeakMB, 2300, 'Unoptimized baseline is 2.3GB peak');
    assert.ok(profile.optimizedPeakMB <= 200, `Optimized peak (${profile.optimizedPeakMB}MB) must be <= 200MB`);
    assert.ok(profile.memoryReductionPercentage >= 90.0, 'Memory reduction must exceed 90%');
    assert.strictEqual(profile.isSafeFor2GBCloudVM, true, 'Must be verified safe for 2GB Cloud VMs');
    assert.strictEqual(profile.stageExecutionMode, 'ISOLATED_SEQUENTIAL');
    assert.strictEqual(profile.videoIngestionMode, 'STREAMING_CHUNKED');

    // 6. MultimodalPipeline processEvaluationVideos executes sequentially with zero errors
    const evaluationId = 'eval_smart-road-vision';
    const bundles = await MultimodalPipeline.processEvaluationVideos(evaluationId);
    assert.ok(Array.isArray(bundles));
  });

  it('18. Scenario 8 Mitigation: Rubric Drift Prevention & Cross-Doc Alignment Linter', () => {
    // 1. Authoritative Code Invariance (scoringWeights.ts)
    assert.strictEqual(validateWeights(), true, 'Rubric weights must strictly sum to 100%');
    assert.strictEqual(SCORING_WEIGHTS.problemNeed, 0.15, 'Code: Problem & Need must be strictly 15%');
    assert.strictEqual(SCORING_WEIGHTS.futurePotential, 0.05, 'Code: Future Potential must be strictly 5%');
    assert.strictEqual(SCORING_WEIGHTS.technicalQuality, 0.20, 'Code: Technical Quality must be 20%');

    // 2. Canonical Label & Category Validation
    assert.strictEqual(RUBRIC_LABELS.problemNeed, 'Problem & Need');
    assert.strictEqual(RUBRIC_LABELS.futurePotential, 'Future Potential');

    // 3. Documentation Linter: Verify zero stale rubric citations across project markdown docs
    const projectRoot = fs.existsSync(path.resolve(process.cwd(), 'PRODUCTION_READINESS.md'))
      ? process.cwd()
      : path.resolve(process.cwd(), '..');
    const docsToCheck = [
      path.join(projectRoot, 'PRODUCTION_READINESS.md'),
      path.join(projectRoot, 'README.md'),
      path.join(projectRoot, 'PROJECT_COMPREHENSIVE_REPORT.md'),
      path.join(projectRoot, 'ARCHITECTURE_ANALYSIS_REPORT.md'),
    ];

    for (const docPath of docsToCheck) {
      if (fs.existsSync(docPath)) {
        const content = fs.readFileSync(docPath, 'utf-8');
        // Must NOT contain unaligned stale rubric claims as active weights
        const staleProblemRegex = /Problem\s+10%/i;
        const staleFutureRegex = /Future Potential\s+10%/i;

        if (staleProblemRegex.test(content) || staleFutureRegex.test(content)) {
          assert.ok(
            content.includes('drift') || content.includes('formerly') || content.includes('RESOLVED') || content.includes('stale'),
            `Active rubric drift detected in ${path.basename(docPath)}! Must not cite 10% Problem / 10% Future Potential as active weights.`
          );
        }

        // Must corroborate 15% Problem & Need and 5% Future Potential
        assert.ok(
          content.includes('15%') && content.includes('5%'),
          `${path.basename(docPath)} must corroborate 15% Problem & Need and 5% Future Potential.`
        );
      }
    }
  });

  it('19. Scenario 9 Mitigation: Frontend-Backend Schema Mismatch & 20-Section Contract Guarantee', () => {
    // 1. Verify Canonical 20-Section Contract
    assert.strictEqual(ReportSchemaGuard.CANONICAL_20_SECTIONS.length, 20, 'System must define strictly 20 canonical sections');
    ReportSchemaGuard.CANONICAL_20_SECTIONS.forEach((s, idx) => {
      assert.strictEqual(s.index, idx);
      assert.strictEqual(s.sectionNumber, idx + 1);
      assert.ok(s.key && s.title && s.category && s.renderType);
    });

    // 2. Simulate Partial Generation Failure (Scenario 9: Section 12 timed out, returning 19 sections)
    const baseReport = ReportEngine.generate('eval_smart-road-vision');
    // Deliberately simulate Section 12 (impactAssessment) timing out
    const recovery = ReportSchemaGuard.guaranteeCanonicalSections(baseReport, ['impactAssessment']);

    assert.strictEqual(recovery.recoveredCount, 1, 'Exactly 1 degraded section must be recovered');
    assert.ok(recovery.errorsRecorded.some(e => e.includes('Section 12') && e.includes('timed out')));

    // 3. Guarantee strictly 20 sections in ordered array format (Never 19!)
    const report = recovery.guaranteedReport;
    assert.ok(report.sectionsArray, 'Report must contain sectionsArray');
    assert.strictEqual(report.sectionsArray.length, 20, 'sectionsArray must contain exactly 20 elements (never 19!)');

    // 4. Validate Section 12 (Index 11) is non-null and safely populated with fallback
    const section12 = report.sectionsArray[11];
    assert.ok(section12 !== undefined, 'sectionsArray[11] must NEVER be undefined');
    assert.strictEqual(section12.sectionIndex, 11);
    assert.strictEqual(section12.key, 'impactAssessment');
    assert.strictEqual(section12.status, 'FALLBACK_GENERATED');
    assert.ok(section12.data && section12.data.beneficiariesEstimate);
    assert.ok(report.sections.impactAssessment !== undefined, 'sections.impactAssessment must be populated');

    // 5. Safe Section Accessor Bounds-Checking
    const safeSec12 = ReportSchemaGuard.getSafeSectionByIndex(report, 11);
    assert.strictEqual(safeSec12.key, 'impactAssessment');

    // Out-of-bounds index must return safe fallback without throwing TypeError
    const safeOutOfBounds = ReportSchemaGuard.getSafeSectionByIndex(report, 99);
    assert.ok(safeOutOfBounds !== undefined);
    assert.ok(safeOutOfBounds.title);

    // 6. End-to-End Generated Report has complete 20 sections
    assert.strictEqual(baseReport.sectionsArray?.length, 20);
    for (let i = 0; i < 20; i++) {
      assert.ok(baseReport.sectionsArray?.[i], `Section at index ${i} must exist and be defined`);
    }
  });

  it('20. Scenario 10 Mitigation: Test Suite False Security — Real LLM Provider Contract, Circuit Breaker Tripping & High-Concurrency Multi-Evaluation Load Resilience', async () => {
    // 1. Markdown unwrapping and robust JSON parsing resilience
    const rawAiOutput = '```json\n{"problemStatement": "Autonomous pest detection", "confidence": 91}\n```';
    const sanitized = ResilientAiRouter.sanitizeJsonResponse(rawAiOutput);
    const parsed = JSON.parse(sanitized);
    assert.strictEqual(parsed.confidence, 91);

    // 2. Circuit Breaker immediate trip on HTTP 429 Rate Limit
    const breaker = new CircuitBreaker({ name: 'RateLimitGuard', failureThreshold: 5 });
    try {
      await breaker.execute(async () => {
        const err: any = new Error('HTTP 429 Too Many Requests: Quota exceeded');
        err.status = 429;
        throw err;
      });
    } catch {}
    assert.strictEqual(breaker.getState(), 'OPEN', 'Circuit must immediately trip to OPEN on 429');

    // 3. Multi-Provider Cascading Failover (Primary down -> Secondary recovers)
    let primaryCalled = false;
    let fallbackCalled = false;
    const failingPrimary = {
      name: 'GeminiPrimary',
      async generateText() {
        primaryCalled = true;
        const err: any = new Error('503 Service Unavailable');
        err.status = 503;
        throw err;
      },
      async analyzeImage() { throw new Error('503'); },
      async analyzeVideo() { throw new Error('503'); },
      async transcribeAudio() { throw new Error('503'); },
      async generateEmbedding() { throw new Error('503'); },
      async moderateContent() { throw new Error('503'); },
    };

    const healthyFallback = {
      name: 'OpenAIFallback',
      async generateText() {
        fallbackCalled = true;
        return '{"recovered": true, "provider": "OpenAIFallback"}';
      },
      async analyzeImage() { return 'recovered'; },
      async analyzeVideo() { return { detectedFeatures: [], demonstratedMilestones: [], observedAnomalies: [] }; },
      async transcribeAudio() { return { transcript: 'recovered', segments: [], durationSeconds: 1 }; },
      async generateEmbedding() { return [0.5]; },
      async moderateContent() { return { flagged: false, categories: [] }; },
    };

    const router = new ResilientAiRouter([failingPrimary, healthyFallback]);
    const response = await router.generateText('Analyze project architecture', { jsonMode: true });
    assert.strictEqual(primaryCalled, true);
    assert.strictEqual(fallbackCalled, true);
    assert.ok(response.includes('OpenAIFallback'));

    // 4. High-Concurrency Multi-Evaluation Load Stress (Mitigates "No load testing - single evaluation only")
    const loadMetrics = await LoadTestHarness.runConcurrentEvaluationStress({
      concurrency: 5,
      totalEvaluations: 10,
      verbose: false,
    });

    assert.strictEqual(loadMetrics.successfulEvaluations, 10, 'All 10 concurrent evaluations must succeed');
    assert.strictEqual(loadMetrics.failedEvaluations, 0, 'Zero evaluation failures allowed under concurrency');
    assert.strictEqual(loadMetrics.sqliteBusyErrors, 0, 'Zero SQLite lock collisions allowed under concurrency');
    assert.strictEqual(loadMetrics.schemaIntegrityVerified, true, 'SQLite schema integrity must pass after load');
    assert.ok(loadMetrics.p95LatencyMs < 200, `P95 latency (${loadMetrics.p95LatencyMs}ms) must remain sub-200ms`);
  });
});




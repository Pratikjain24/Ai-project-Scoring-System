import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CommonTechnologyAnalyzer } from '../originality-intelligence/commonTechnologyAnalyzer';
import { FeatureMatcher } from '../originality-intelligence/featureMatcher';
import { ArchitectureMatcher } from '../originality-intelligence/architectureMatcher';
import { WorkflowMatcher } from '../originality-intelligence/workflowMatcher';
import { DifferenceEngine } from '../originality-intelligence/differenceEngine';
import { TimelineAnalyzer } from '../originality-intelligence/timelineAnalyzer';
import { OriginalityScorer } from '../originality-intelligence/originalityScorer';
import { DEFAULT_DIMENSION_WEIGHTS, type SimilarityCandidate, type DimensionAnalysis } from '../models/originalityIntelligence';

describe('Phase 6: Originality & Multi-Dimensional Similarity Intelligence Engine', () => {

  // Test 1: Common technology false positive suppression
  test('CommonTechnologyAnalyzer does NOT produce high similarity for common stacks (React + Python + YOLO)', () => {
    const projectTech = ['React', 'Python', 'OpenCV', 'YOLOv8', 'FastAPI', 'SQLite'];
    const candidateTech = ['React', 'Python', 'OpenCV', 'YOLOv5', 'Flask', 'PostgreSQL'];

    const result = CommonTechnologyAnalyzer.compare(projectTech, candidateTech);

    assert.strictEqual(result.isCommonStackOnly, true);
    // Crucial check: Must be capped and strictly <= 35%
    assert.ok(result.score <= 35, `Common stack score ${result.score} should be capped at <= 35`);
    assert.match(result.explanation, /ubiquitous open-source tooling/i);
  });

  // Test 2: Distinctive technology combination detection
  test('CommonTechnologyAnalyzer detects distinctive and specialized hardware/neural combos', () => {
    const projectTech = ['FPGA-Acceleration', 'Quantized-TensorRT-INT8', 'Kalman-Tracker'];
    const candidateTech = ['FPGA-Acceleration', 'Quantized-TensorRT-INT8', 'Kalman-Tracker'];

    const result = CommonTechnologyAnalyzer.compare(projectTech, candidateTech);

    assert.strictEqual(result.isCommonStackOnly, false);
    assert.ok(result.distinctiveMatchedTech.length >= 2);
    assert.ok(result.score >= 70, `Distinctive stack should score high similarity (${result.score})`);
  });

  // Test 3: Feature matching with unique feature isolation
  test('FeatureMatcher isolates matched pairs and uncovers unique project innovations', () => {
    const projectFeatures = [
      'Road image upload',
      'Pothole detection',
      'Severity classification',
      'GPS telemetry tagging',
      'Dual-stream dashboard',
    ];
    const candidateFeatures = [
      'Road image upload',
      'Pothole detection',
      'CSV export',
    ];

    const result = FeatureMatcher.compare(projectFeatures, candidateFeatures);

    assert.strictEqual(result.matchedFeatures.length, 2);
    assert.ok(result.uniqueProjectFeatures.includes('Severity classification'));
    assert.ok(result.uniqueProjectFeatures.includes('GPS telemetry tagging'));
    assert.ok(result.uniqueProjectFeatures.includes('Dual-stream dashboard'));
    assert.strictEqual(result.score, 40); // 2 out of 5
  });

  // Test 4: Architecture graph structural comparison
  test('ArchitectureMatcher performs graph node and relationship matching', () => {
    const projectArch = {
      nodes: ['Camera', 'Preprocessing', 'YOLO', 'API', 'Dashboard'],
      pipeline: ['Camera', 'Preprocessing', 'YOLO', 'API', 'Dashboard'],
      relationships: [
        { from: 'Camera', to: 'Preprocessing' },
        { from: 'Preprocessing', to: 'YOLO' },
        { from: 'YOLO', to: 'API' },
        { from: 'API', to: 'Dashboard' },
      ],
    };

    const identicalCandArch = {
      nodes: ['Camera', 'Preprocessing', 'YOLO', 'API', 'Dashboard'],
      pipeline: ['Camera', 'Preprocessing', 'YOLO', 'API', 'Dashboard'],
      relationships: [
        { from: 'Camera', to: 'Preprocessing' },
        { from: 'Preprocessing', to: 'YOLO' },
        { from: 'YOLO', to: 'API' },
        { from: 'API', to: 'Dashboard' },
      ],
    };

    const matchResult = ArchitectureMatcher.compare(projectArch, identicalCandArch);
    assert.strictEqual(matchResult.score, 100);
    assert.strictEqual(matchResult.matchingNodes.length, 5);
    assert.strictEqual(matchResult.matchingRelationships.length, 4);

    // Disparate cloud architecture
    const cloudArch = {
      nodes: ['Web Upload', 'S3 Bucket', 'Batch Cloud Worker', 'PostgreSQL DB', 'Angular Portal'],
    };
    const disparateResult = ArchitectureMatcher.compare(projectArch, cloudArch);
    assert.ok(disparateResult.score <= 20, `Disparate architecture score (${disparateResult.score}) should be low`);
    assert.ok(disparateResult.uniqueProjectNodes.length >= 4);
  });

  // Test 5: Workflow sequence ordering preservation
  test('WorkflowMatcher verifies step ordering and preserves procedural sequence', () => {
    const projectWorkflow = [
      'Capture road frame',
      'Preprocess image',
      'Run YOLO detection',
      'Assign severity tier',
      'Attach GPS coordinates',
      'Render marker on interactive map',
    ];

    const candidateWorkflow = [
      'Capture road frame',
      'Preprocess image',
      'Run YOLO detection',
      'Render marker on interactive map',
    ];

    const result = WorkflowMatcher.compare(projectWorkflow, candidateWorkflow);
    assert.ok(result.score >= 60);
    assert.strictEqual(result.differentSteps.length, 2);
    assert.ok(result.differentSteps.includes('Assign severity tier'));
  });

  // Test 6: Difference Engine extracts both similarities and differences
  test('DifferenceEngine extracts contrasts and detects verified unique contributions', () => {
    const project = {
      evaluationId: 'eval_test_road',
      problem: 'Road condition assessment and pothole detection',
      features: ['Pothole detection', 'Severity classification', 'GPS telemetry'],
      technologies: ['Python', 'YOLOv8', 'TensorRT'],
      architecture: { nodes: ['Camera', 'YOLO', 'Severity', 'Map'] },
      workflow: ['Capture', 'Detect', 'Severity', 'Map'],
      hardware: ['Jetson Orin Nano'],
    };

    const candidate: SimilarityCandidate = {
      id: 'cand_sample',
      evaluationId: 'eval_test_road',
      candidateType: 'GITHUB_REPO',
      title: 'OpenRoadDetector',
      description: 'Highway road pothole detector',
      features: ['Pothole detection', 'Bounding box export'],
      technologies: ['Python', 'YOLOv8'],
      architecture: { nodes: ['Camera', 'YOLO', 'Map'] },
      workflow: ['Capture', 'Detect', 'Map'],
      confidence: 0.9,
      relevanceScore: 0.9,
    };

    const contrast = DifferenceEngine.extractContrasts(project, candidate);
    assert.ok(contrast.similarities.length >= 2, 'Must extract similarities');
    assert.ok(contrast.differences.length >= 2, 'Must extract differences');

    const contributions = DifferenceEngine.detectUniqueContributions(project, [candidate]);
    assert.ok(contributions.length >= 2, 'Must discover unique project contributions');
    assert.ok(contributions.some(c => c.description.includes('Edge-native') || c.description.includes('severity')));
  });

  // Test 7: Timeline Chronological Context
  test('TimelineAnalyzer correctly classifies chronological relationships without causal claims', () => {
    const candidates: SimilarityCandidate[] = [
      {
        id: 'c1',
        evaluationId: 'eval_test',
        candidateType: 'RESEARCH_PAPER',
        title: 'Prior Paper',
        description: 'Published 2022',
        publicationDate: '2022-05-10',
        features: [],
        technologies: [],
        architecture: {},
        workflow: [],
        confidence: 0.9,
        relevanceScore: 0.8,
      },
      {
        id: 'c2',
        evaluationId: 'eval_test',
        candidateType: 'GITHUB_REPO',
        title: 'Future Repo',
        description: 'Published 2026-06',
        publicationDate: '2026-06-20',
        features: [],
        technologies: [],
        architecture: {},
        workflow: [],
        confidence: 0.85,
        relevanceScore: 0.7,
      },
    ];

    const timeline = TimelineAnalyzer.analyze('eval_test', candidates, '2026-01-15');
    assert.strictEqual(timeline[0].relationship, 'PRECEDES_PROJECT');
    assert.strictEqual(timeline[1].relationship, 'AFTER_PROJECT');
    assert.ok(timeline[0].notes?.includes('precedes project'));
    assert.ok(timeline[1].notes?.includes('Does not establish derivation'));
  });

  // Test 8: Deterministic Originality Scorer
  test('OriginalityScorer computes deterministic scores, respects unique contributions, and avoids LLM hallucination', () => {
    const mockDims: DimensionAnalysis[] = [
      { id: 'd1', originalityProfileId: 'p1', dimension: 'PROBLEM', score: 80, confidence: 0.9, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd2', originalityProfileId: 'p1', dimension: 'SOLUTION', score: 60, confidence: 0.85, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd3', originalityProfileId: 'p1', dimension: 'FEATURE', score: 50, confidence: 0.9, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd4', originalityProfileId: 'p1', dimension: 'TECHNOLOGY', score: 30, confidence: 0.95, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd5', originalityProfileId: 'p1', dimension: 'ARCHITECTURE', score: 70, confidence: 0.88, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd6', originalityProfileId: 'p1', dimension: 'WORKFLOW', score: 65, confidence: 0.88, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd7', originalityProfileId: 'p1', dimension: 'UI_UX', score: 40, confidence: 0.8, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd8', originalityProfileId: 'p1', dimension: 'TEXTUAL', score: 20, confidence: 0.85, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd9', originalityProfileId: 'p1', dimension: 'IMPLEMENTATION', score: 35, confidence: 0.82, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd10', originalityProfileId: 'p1', dimension: 'NAMING', score: 10, confidence: 0.95, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
    ];

    const mockContributions = [
      { id: 'u1', evaluationId: 'eval_test', description: 'Edge optimization', contributionType: 'ARCH', importance: 'HIGH' as const, confidence: 0.9, evidenceIds: [] },
      { id: 'u2', evaluationId: 'eval_test', description: 'Severity model', contributionType: 'ALGO', importance: 'CRITICAL' as const, confidence: 0.95, evidenceIds: [] },
    ];

    const mockCandidate: SimilarityCandidate = {
      id: 'c1',
      evaluationId: 'eval_test',
      candidateType: 'GITHUB_REPO',
      title: 'Candidate 1',
      description: 'Candidate desc',
      features: [],
      technologies: [],
      architecture: {},
      workflow: [],
      confidence: 0.9,
      relevanceScore: 0.9,
    };

    const res = OriginalityScorer.compute('p1', mockDims, DEFAULT_DIMENSION_WEIGHTS, mockContributions, [mockCandidate]);

    // Raw weighted sum is approximately:
    // 80*0.05 + 60*0.15 + 50*0.15 + 30*0.05 + 70*0.20 + 65*0.15 + 40*0.10 + 20*0.05 + 35*0.10 + 10*0
    // = 4 + 9 + 7.5 + 1.5 + 14 + 9.75 + 4 + 1 + 3.5 + 0 = 54.25
    // Unique contribution offset: CRITICAL (6) + HIGH (4.5) = 10.5
    // Final similarity = 54.25 - 10.5 = 43.75 -> 44
    // Originality = 100 - 44 = 56
    assert.strictEqual(typeof res.overallOriginalityScore, 'number');
    assert.strictEqual(typeof res.overallSimilarityScore, 'number');
    assert.strictEqual(res.overallOriginalityScore + res.overallSimilarityScore, 100);
    assert.ok(res.overallOriginalityScore >= 50 && res.overallOriginalityScore <= 65);
    assert.ok(res.classification === 'MODERATELY_SIMILAR' || res.classification === 'INSPIRED');
  });

  // Test 9: Insufficient evidence gracefully handled
  test('OriginalityScorer returns INSUFFICIENT_EVIDENCE status when candidate set is empty', () => {
    const res = OriginalityScorer.compute('p1', [], DEFAULT_DIMENSION_WEIGHTS, [], []);

    assert.strictEqual(res.classification, 'INSUFFICIENT_EVIDENCE');
    assert.strictEqual(res.isInsufficientEvidence, true);
    assert.ok(res.missingEvidence.length > 0);
    assert.ok(res.recommendedEvidence.length > 0);
  });

  // Test 10: Safety Phrasing & Non-Accusatory Language
  test('Explanations and narratives do NOT contain defamatory or accusatory terminology', () => {
    const mockDims: DimensionAnalysis[] = [
      { id: 'd1', originalityProfileId: 'p1', dimension: 'ARCHITECTURE', score: 85, confidence: 0.9, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
      { id: 'd2', originalityProfileId: 'p1', dimension: 'WORKFLOW', score: 80, confidence: 0.9, matchedElements: [], differentElements: [], evidenceIds: [], explanation: '' },
    ];

    const res = OriginalityScorer.compute('p1', mockDims, DEFAULT_DIMENSION_WEIGHTS, [], [
      { id: 'c1', evaluationId: 'eval_test', candidateType: 'GITHUB_REPO', title: 'Ref', description: '', features: [], technologies: [], architecture: {}, workflow: [], confidence: 0.9, relevanceScore: 0.9 }
    ]);

    const prohibitedPhrases = ['cheated', 'stole', 'plagiarized', 'stolen', 'fraud', 'thief', 'copied'];
    for (const phrase of prohibitedPhrases) {
      assert.strictEqual(
        res.explanation.toLowerCase().includes(phrase),
        false,
        `Explanation should never contain accusatory word '${phrase}'`
      );
    }
  });

});

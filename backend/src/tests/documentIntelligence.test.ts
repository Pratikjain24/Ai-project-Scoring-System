import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { initSchema, getDb } from '../db/database';
import { DocumentRepository } from '../repositories/documentRepository';
import { DocumentParser } from '../document-intelligence/documentParser';
import { VisualUnderstandingService } from '../document-intelligence/visualUnderstandingService';
import { TechnologyExtractor } from '../document-intelligence/technologyExtractor';
import { ArchitectureExtractor } from '../document-intelligence/architectureExtractor';
import { EvidenceGapDetector } from '../document-intelligence/evidenceGapDetector';
import { ContradictionDetector } from '../document-intelligence/contradictionDetector';
import { DocumentQualityAnalyzer } from '../document-intelligence/documentQualityAnalyzer';
import { DocumentPipeline } from '../document-intelligence/documentPipeline';
import { seedDatabase } from '../db/seed';
import type { Claim } from '../models/claim';

describe('Phase 3: Document Intelligence Engine Test Suite', () => {
  const evalId = 'eval_smart-road-vision';
  const projId = 'smart-road-vision';

  before(async () => {
    await seedDatabase();
  });

  it('1. DocumentParser segments presentation into discrete slide units with structural preservation', () => {
    const parsed = DocumentParser.parse('doc_test_1', 'SmartRoadVision_PitchDeck.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    
    assert.strictEqual(parsed.pageCount, 10, 'Should extract exactly 10 slides');
    assert.strictEqual(parsed.pages[0].pageNumber, 1);
    assert.ok(parsed.pages[0].title?.includes('Smart Road Vision'));
    assert.ok(parsed.pages[6].text.includes('95.4% mAP50'), 'Slide 7 should contain benchmark text');
  });

  it('2. DocumentParser preserves tabular structures without flattening', () => {
    const parsed = DocumentParser.parse('doc_test_1', 'SmartRoadVision_PitchDeck.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    
    assert.ok(parsed.tables.length >= 2, 'Should extract at least 2 structured tables');
    const modelTable = parsed.tables.find(t => t.pageNumber === 7);
    assert.ok(modelTable, 'Table on slide 7 must exist');
    assert.deepStrictEqual(modelTable?.headers, ['Architecture', 'mAP50 Accuracy', 'Inference FPS', 'Power Draw (W)', 'Model Size']);
    assert.ok(modelTable?.rows.length >= 4, 'Table must contain model benchmark rows');
    assert.strictEqual(modelTable?.rows[0][0], 'YOLOv8-Nano (Ours)');
  });

  it('3. VisualUnderstandingService classifies diagrams and applies cautious identification states', () => {
    const hardwareRes = VisualUnderstandingService.analyzeImageArtifact('IP67_Jetson_Enclosure_Hardware.png', 'Jetson Orin Nano hardware PCB');
    assert.strictEqual(hardwareRes.classifiedType, 'HARDWARE_PHOTO');
    assert.strictEqual(hardwareRes.identificationState, 'DETECTED');
    assert.ok(hardwareRes.sensors?.includes('Sony IMX477 Optical Sensor'));

    const archRes = VisualUnderstandingService.analyzeImageArtifact('Data_Pipeline_Architecture.png', 'System architecture pipeline layers');
    assert.strictEqual(archRes.classifiedType, 'ARCHITECTURE_DIAGRAM');
    assert.strictEqual(archRes.identificationState, 'DETECTED');
    assert.ok(archRes.systemLayers && archRes.systemLayers.length > 0);

    const uncertainRes = VisualUnderstandingService.analyzeImageArtifact('Random_Background_Graphic.png', 'Unlabeled abstract visual background');
    assert.strictEqual(uncertainRes.identificationState, 'UNCERTAIN');
  });

  it('4. TechnologyExtractor identifies and categorizes technologies across slides', () => {
    const pages = [
      { pageNumber: 4, title: 'Stack', text: 'Built with Python, React 19, FastAPI, YOLOv8, PyTorch, and OpenCV on NVIDIA Jetson Orin Nano with SQLite.' },
    ];
    const tech = TechnologyExtractor.extract(pages);
    
    const names = tech.map(t => t.name);
    assert.ok(names.includes('Python'), 'Should extract Python');
    assert.ok(names.includes('React'), 'Should extract React');
    assert.ok(names.includes('FastAPI'), 'Should extract FastAPI');
    assert.ok(names.includes('YOLOv8'), 'Should extract YOLOv8');
    assert.ok(names.includes('NVIDIA Jetson Orin Nano'), 'Should extract Jetson');
    assert.ok(names.includes('SQLite'), 'Should extract SQLite');

    const pythonItem = tech.find(t => t.name === 'Python');
    assert.strictEqual(pythonItem?.category, 'Programming Languages');
    assert.strictEqual(pythonItem?.evidenceLocation, 'Slide 4');
  });

  it('5. ArchitectureExtractor constructs connected node-edge topology', () => {
    const arch = ArchitectureExtractor.extract(evalId, 'doc_test_1', true);
    
    assert.strictEqual(arch.architectureType, 'HARDWARE');
    assert.ok(arch.nodes.length >= 4, 'Should extract multiple architecture nodes');
    assert.ok(arch.relationships.length >= 3, 'Should extract directed topology edges');

    const sensorToCompute = arch.relationships.find(r => r.from === 'node_sensor' && r.to === 'node_compute');
    assert.ok(sensorToCompute, 'Edge from sensor to compute must exist');
    assert.strictEqual(sensorToCompute?.relationshipType, 'MIPI CSI-2 Optical Stream');
  });

  it('6. Claims are strictly extracted with status CLAIMED until verification', () => {
    const pipelineResult = DocumentPipeline.processDocument(
      'doc_claim_test',
      projId,
      evalId,
      'SmartRoadVision_PitchDeck.pptx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      12000000
    );

    assert.ok(pipelineResult.extractedClaims.length > 0);
    for (const claim of pipelineResult.extractedClaims) {
      assert.strictEqual(claim.status, 'CLAIMED', `Claim "${claim.claimText}" must initialize strictly in CLAIMED status`);
      assert.ok(claim.projectEvidence.includes('Slide'), 'Claim must provide slide source reference');
    }
  });

  it('7. EvidenceGapDetector flags unbacked accuracy and cost claims with HIGH severity', () => {
    const claims: Claim[] = [
      {
        id: 'clm_acc',
        evaluationId: evalId,
        claimText: 'Model achieves 95.4% accuracy on municipal asphalt.',
        claimType: 'ACCURACY',
        importance: 'CRITICAL',
        status: 'CLAIMED',
        confidence: 90,
        projectEvidence: 'Slide 7 text',
        explanation: 'Accuracy claim',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'clm_cost',
        evaluationId: evalId,
        claimText: 'Reduces municipal maintenance costs by $4.2M annually.',
        claimType: 'FEASIBILITY',
        importance: 'HIGH',
        status: 'CLAIMED',
        confidence: 75,
        projectEvidence: 'Slide 9 text',
        explanation: 'Cost saving claim',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        createdAt: new Date().toISOString(),
      },
    ];

    const gaps = EvidenceGapDetector.detectGaps(evalId, claims);
    assert.strictEqual(gaps.length, 2);
    assert.strictEqual(gaps[0].severity, 'HIGH');
    assert.ok(gaps[0].missingElements.some(e => e.includes('Test set sample count')));
    assert.strictEqual(gaps[1].severity, 'HIGH');
  });

  it('8. ContradictionDetector flags discrepancy between theoretical benchmark and adverse weather field test', () => {
    const pages = [
      { pageNumber: 7, title: 'Benchmarks', text: 'Model achieves 95.4% mAP50 anomaly detection accuracy across asphalt.' },
      { pageNumber: 8, title: 'Field Trial', text: 'Trial detected 128 pavement fissures with 91.2% detection precision in rain conditions.' },
    ];

    const contradictions = ContradictionDetector.detect(evalId, pages);
    assert.strictEqual(contradictions.length, 1);
    assert.ok(contradictions[0].difference.includes('4.2% discrepancy'));
    assert.strictEqual(contradictions[0].locationA, 'Slide 7: Empirical Performance Benchmark Claims');
    assert.strictEqual(contradictions[0].locationB, 'Slide 8: Preliminary Field Evaluation Results');
  });

  it('9. DocumentQualityAnalyzer computes deterministic score and flags missing limitations', () => {
    const report = DocumentQualityAnalyzer.analyze('doc_test', 'Problem definition. Architecture and benchmarks. Results show 95% accuracy.', 10, 2, 2);
    
    assert.ok(report.documentQualityScore >= 70 && report.documentQualityScore <= 100);
    assert.ok(report.missingSections.some(s => s.includes('Limitations')), 'Should detect missing limitations section');
    assert.ok(report.metrics.structure > 0);
    assert.ok(report.metrics.technicalDepth > 0);
  });
});

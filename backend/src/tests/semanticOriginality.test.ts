import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SemanticEmbeddingEngine,
} from '../originality-intelligence/semanticEmbeddingEngine';
import {
  SemanticOriginalityEngine,
} from '../originality-intelligence/semanticOriginalityEngine';
import { OriginalityAgent } from '../agents/originalityAgent';
import { AdminController } from '../controllers/adminController';
import type { Project } from '../models/project';
import type { ResearchSource } from '../models/research';

describe('Phase 15: Deep Semantic Originality & all-MiniLM-L6-v2 Embeddings Test Suite', () => {
  it('1. SemanticEmbeddingEngine generates dense 384-dimensional unit vectors with L2 normalization', () => {
    const text = 'Autonomous unmanned aerial vehicle for search and rescue operations';
    const vector = SemanticEmbeddingEngine.generateLocalEmbedding(text);

    assert.strictEqual(vector.length, 384, 'Embedding must have exactly 384 dimensions (all-MiniLM-L6-v2 spec)');

    // L2 norm must equal 1.0 (unit vector)
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    assert.ok(Math.abs(norm - 1.0) < 0.001, `Vector must be L2 normalized (norm = ${norm})`);
  });

  it('2. Semantic concept clustering detects high similarity between semantic synonyms with zero word overlap', () => {
    // Both phrases describe the exact same concept without identical keywords:
    const phraseA = 'asphalt pothole and crack detection using convolutional neural networks';
    const phraseB = 'highway surface defect identification via deep learning vision models';
    // Completely unrelated phrase:
    const phraseC = 'photosynthetic enzymatic reactions in marine cyanobacteria cells';

    const vecA = SemanticEmbeddingEngine.generateLocalEmbedding(phraseA);
    const vecB = SemanticEmbeddingEngine.generateLocalEmbedding(phraseB);
    const vecC = SemanticEmbeddingEngine.generateLocalEmbedding(phraseC);

    const simAB = SemanticEmbeddingEngine.cosineSimilarity(vecA, vecB);
    const simAC = SemanticEmbeddingEngine.cosineSimilarity(vecA, vecC);

    assert.ok(simAB > 0.35, `Conceptually synonymous texts should have high similarity, got ${simAB}`);
    assert.ok(simAB > simAC, `Synonymous texts (${simAB}) must score higher than unrelated texts (${simAC})`);
  });

  it('3. SemanticOriginalityEngine.compareTexts provides full novelty breakdown and classification', () => {
    const text1 = 'Real-time road damage detection using YOLOv8 on NVIDIA Jetson embedded platform';
    const text2 = 'Pothole and crack classifier with quantized YOLO models on edge AI hardware';

    const report = SemanticOriginalityEngine.compareTexts(text1, text2);

    assert.ok(typeof report.cosineSimilarity === 'number');
    assert.ok(report.similarityPercentage >= 40, 'Should detect significant conceptual overlap');
    assert.strictEqual(report.noveltyPercentage, 100 - report.similarityPercentage);
    assert.ok(Array.isArray(report.sharedConcepts));
    assert.ok(Array.isArray(report.keyDifferences));
  });

  it('4. Reference Project Catalog contains pre-indexed 384-dimensional project embeddings', () => {
    const status = SemanticOriginalityEngine.getStatus();

    assert.strictEqual(status.dimensions, 384);
    assert.ok(status.catalogSize >= 5, 'Catalog should contain at least 5 benchmark reference projects');
    assert.strictEqual(status.embeddingModel.model, 'all-MiniLM-L6-v2');
    assert.strictEqual(status.embeddingModel.dimensions, 384);
  });

  it('5. SemanticOriginalityEngine.evaluate produces multi-dimensional similarity against catalog and research sources', async () => {
    const mockProject: Project = {
      id: 'proj_smart_road_eval',
      name: 'Smart Road Vision',
      architectureType: 'SOFTWARE',
      category: 'Smart Cities',
      domain: 'Computer Vision',
      problemStatement: 'Automated pothole and pavement distress identification from vehicle cameras',
      solutionDescription: 'Quantized INT8 YOLOv8 model running on edge Jetson hardware',
      teamName: 'VisionFlow',
    };

    const mockSources: ResearchSource[] = [
      {
        id: 'src_rdd_1',
        evaluationId: 'eval_orig_test',
        sourceType: 'RESEARCH_PAPER',
        title: 'RDD2022 Multi-National Road Damage Benchmark',
        url: 'https://doi.org/10.1109/TITS.2022.9842103',
        authorityScore: 95,
        relevanceScore: 92,
        directnessScore: 88,
        overallRank: 1,
        createdAt: new Date().toISOString(),
      },
    ];

    const assessment = await SemanticOriginalityEngine.evaluate(
      'eval_orig_test',
      mockProject,
      mockSources,
      []
    );

    assert.strictEqual(assessment.id, 'orig_eval_orig_test');
    assert.ok(assessment.similarityScore > 0 && assessment.similarityScore < 100);
    assert.strictEqual(assessment.originalityScore, 100 - assessment.similarityScore);
    assert.ok(assessment.similarities.length >= 2, 'Should include source and catalog comparisons');

    // Matching features and differences must be isolated
    const topSimilarity = assessment.similarities[0];
    assert.ok(topSimilarity.matchingFeatures.length > 0);
    assert.ok(topSimilarity.differences.length > 0);
    assert.ok(assessment.keyDifferences.length >= 2);
  });

  it('6. OriginalityAgent.evaluate integrates seamlessly and assigns correct OriginalityClassification', async () => {
    const mockProject: Project = {
      id: 'proj_novel_drone',
      name: 'Autonomous Cryo-Cargo Drone',
      architectureType: 'HARDWARE',
      category: 'Aerospace',
      domain: 'Robotics',
      problemStatement: 'Autonomous cryogenic transport of organ transplants over sub-arctic terrain',
      solutionDescription: 'Carbon-fiber airframe with vacuum insulation and triple redundant flight computers',
      teamName: 'AeroMed',
    };

    const assessment = await OriginalityAgent.evaluate(
      'eval_drone_orig',
      [],
      [],
      mockProject
    );

    assert.ok(typeof assessment.originalityScore === 'number');
    assert.ok(assessment.originalityScore >= 50, 'Highly distinctive project should score high originality');
    assert.ok(
      ['ORIGINAL', 'INSPIRED', 'MODERATELY_SIMILAR'].includes(assessment.classification),
      `Classification must be valid enum, got ${assessment.classification}`
    );
  });

  it('7. AdminController exposes originality embedding status and on-demand semantic comparison API', () => {
    // 1. Status endpoint
    let statusResponse: any = null;
    const mockRes1: any = {
      status: () => mockRes1,
      json: (data: any) => { statusResponse = data; },
    };
    AdminController.getOriginalityStatus({} as any, mockRes1);

    assert.strictEqual(statusResponse.success, true);
    assert.strictEqual(statusResponse.data.dimensions, 384);
    assert.strictEqual(statusResponse.data.embeddingModel.model, 'all-MiniLM-L6-v2');
    assert.ok(statusResponse.data.catalogSize >= 5);

    // 2. Compare endpoint
    let compareResponse: any = null;
    const mockRes2: any = {
      status: () => mockRes2,
      json: (data: any) => { compareResponse = data; },
    };
    const mockReq2: any = {
      body: {
        text1: 'Zero trust microsegmentation with Linux eBPF kernel probes',
        text2: 'Kernel packet inspection using extended Berkeley Packet Filters',
      },
    };
    AdminController.compareOriginality(mockReq2, mockRes2);

    assert.strictEqual(compareResponse.success, true);
    assert.ok(compareResponse.data.cosineSimilarity > 0.35);
    assert.ok(compareResponse.data.similarityPercentage >= 35);
  });
});

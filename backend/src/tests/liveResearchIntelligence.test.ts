import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  VectorEmbeddingService,
  VectorResearchCache,
  VectorDatabaseAdapter,
} from '../research-intelligence/vectorResearchCache';
import {
  SemanticScholarConnector,
  OpenAlexConnector,
  ArxivConnector,
  AcademicFederation,
} from '../research-intelligence/academicApiConnectors';
import { LiveResearchEngine } from '../research-intelligence/liveResearchEngine';
import { ResearchAgent } from '../agents/researchAgent';
import { AdminController } from '../controllers/adminController';
import type { Project } from '../models/project';

describe('Phase 14: Live Academic APIs & Vector Caching Engine Test Suite', () => {
  beforeEach(() => {
    VectorResearchCache.getInstance().clear();
  });

  it('1. VectorEmbeddingService generates 128-dimensional normalized unit vectors and accurate cosine similarity', () => {
    const textA = 'Edge neural networks for road pothole detection using YOLOv8';
    const textB = 'Edge neural networks for road pothole detection using YOLOv8'; // identical
    const textC = 'Neural network architectures for road distress and pothole detection'; // related
    const textD = 'Photosynthetic efficiency in marine phytoplankton chloroplasts'; // unrelated

    const vecA = VectorEmbeddingService.embed(textA);
    const vecB = VectorEmbeddingService.embed(textB);
    const vecC = VectorEmbeddingService.embed(textC);
    const vecD = VectorEmbeddingService.embed(textD);

    assert.strictEqual(vecA.length, 128, 'Vector dimension must be 128');

    // Self-similarity must be exactly 1.0
    const simIdentical = VectorEmbeddingService.cosineSimilarity(vecA, vecB);
    assert.ok(Math.abs(simIdentical - 1.0) < 0.0001, 'Identical text must yield cosine similarity 1.0');

    // Related text must yield moderate-to-high similarity (> 0.35)
    const simRelated = VectorEmbeddingService.cosineSimilarity(vecA, vecC);
    assert.ok(simRelated > 0.35, `Related text should have reasonable similarity, got ${simRelated}`);

    // Unrelated text should have significantly lower similarity
    const simUnrelated = VectorEmbeddingService.cosineSimilarity(vecA, vecD);
    assert.ok(simRelated > simUnrelated, 'Related text must score higher than unrelated text');
  });

  it('2. VectorResearchCache achieves semantic cache hits and indexes papers for nearest neighbor search', () => {
    const cache = VectorResearchCache.getInstance();

    const mockPapers = [
      {
        sourceId: 'paper_1',
        sourceType: 'SEMANTIC_SCHOLAR' as const,
        title: 'Deep Learning for Road Surface Defect Detection',
        authors: ['H. Zhang'],
        year: 2023,
        abstract: 'Benchmark of one-stage detectors on pavement datasets.',
        url: 'https://doi.org/10.1109/TITS.2023.3241098',
        citationCount: 120,
        openAccess: true,
      },
    ];

    // Store query and papers in vector cache
    const query = 'pavement defect detection yolo';
    cache.store(query, mockPapers);

    // Identical query lookup should hit cache
    const lookup1 = cache.lookup('pavement defect detection yolo');
    assert.strictEqual(lookup1.hit, true, 'Identical query must be a cache hit');
    assert.strictEqual(lookup1.results?.length, 1);
    assert.strictEqual(lookup1.results?.[0].title, mockPapers[0].title);

    // Semantically identical query should also hit cache
    const lookup2 = cache.lookup('pavement defect detection yolo');
    assert.strictEqual(lookup2.hit, true, 'Semantically equivalent query must trigger vector cache hit');

    // Unrelated query must miss cache
    const lookup3 = cache.lookup('marine biology phytoplankton genome sequencing');
    assert.strictEqual(lookup3.hit, false, 'Unrelated query must be a cache miss');

    // Nearest-neighbor paper search
    const similar = cache.searchSimilarPapers('road surface crack inspection', 1);
    assert.strictEqual(similar.length, 1);
    assert.ok(similar[0].similarity > 0.2);
  });

  it('3. VectorDatabaseAdapter supports Pinecone and Qdrant configurations with graceful local fallback', () => {
    const adapter = new VectorDatabaseAdapter();
    const mode = adapter.getMode();

    assert.ok(
      mode === 'PINECONE' || mode === 'QDRANT' || mode === 'LOCAL_VECTOR_CACHE',
      'Mode must be Pinecone, Qdrant, or Local Vector Cache'
    );

    const cacheStatus = VectorResearchCache.getInstance().getStatus();
    assert.strictEqual(cacheStatus.vectorDimensions, 128);
    assert.strictEqual(cacheStatus.semanticHitThreshold, 0.85);
    assert.ok(typeof cacheStatus.cacheHits === 'number');
    assert.ok(typeof cacheStatus.cacheMisses === 'number');
  });

  it('4. Academic Federation initializes Semantic Scholar, OpenAlex, and arXiv connectors with deduplication', async () => {
    const federation = new AcademicFederation({ timeoutMs: 1000 });
    assert.ok(federation, 'AcademicFederation must instantiate');

    const s2 = new SemanticScholarConnector({ timeoutMs: 500 });
    const oa = new OpenAlexConnector({ timeoutMs: 500 });
    const arxiv = new ArxivConnector({ timeoutMs: 500 });

    assert.ok(s2, 'SemanticScholarConnector must initialize');
    assert.ok(oa, 'OpenAlexConnector must initialize');
    assert.ok(arxiv, 'ArxivConnector must initialize');
  });

  it('5. LiveResearchEngine.expandQuery enriches queries with domain-specific academic terminology', () => {
    const roadProject: Project = {
      id: 'smart-road-vision',
      name: 'Smart Road Vision',
      architectureType: 'SOFTWARE',
      category: 'Smart Cities',
      domain: 'Computer Vision',
      problemStatement: 'Automated pothole and pavement crack detection',
      solutionDescription: 'Edge inference on embedded cameras',
      teamName: 'VisionFlow',
    };

    const expanded = LiveResearchEngine.expandQuery(roadProject);

    assert.ok(expanded.includes('Smart Road Vision'));
    assert.ok(expanded.includes('Computer Vision'));
    assert.ok(expanded.includes('pavement distress') || expanded.includes('crack'));
    assert.ok(expanded.includes('YOLO') || expanded.includes('benchmark'));
  });

  it('6. LiveResearchEngine.investigate produces ranked ResearchSources with composite metrics and findings', async () => {
    const engine = new LiveResearchEngine({ timeoutMs: 500 });

    const mockProject: Project = {
      id: 'smart-road-vision',
      name: 'Smart Road Vision',
      architectureType: 'SOFTWARE',
      category: 'Smart Cities',
      domain: 'Computer Vision',
      problemStatement: 'Automated road pothole detection',
      solutionDescription: 'Edge AI camera inference',
      teamName: 'VisionFlow',
    };

    const result = await engine.investigate('eval_test_live', mockProject);

    assert.ok(result.sources.length >= 2, 'Should return at least 2 research sources');
    assert.ok(result.findings.length >= 2, 'Should extract corresponding research findings');

    const topSource = result.sources[0];
    assert.strictEqual(topSource.overallRank, 1);
    assert.ok(topSource.authorityScore > 50, 'Authority score must be calculated');
    assert.ok(topSource.relevanceScore > 50, 'Relevance score must be calculated');
    assert.ok(topSource.metadata?.doi || topSource.url, 'Must include DOI or URL');
    assert.strictEqual(typeof topSource.metadata?.semanticSimilarity, 'number');

    const firstFinding = result.findings[0];
    assert.ok(firstFinding.summary.length > 20);
    assert.ok(firstFinding.keyClaimsMatched.length > 0);
    assert.ok(firstFinding.noveltyAspectsHighlighted.length > 0);
    assert.ok(firstFinding.confidence > 50);
  });

  it('7. ResearchAgent.investigate seamlessly operates end-to-end with LiveResearchEngine', async () => {
    const mockProject: Project = {
      id: 'agrisense-lora',
      name: 'AgriSense Soil Mesh',
      architectureType: 'HARDWARE',
      category: 'Agriculture',
      domain: 'IoT & Embedded Sensors',
      problemStatement: 'Soil moisture and nutrient monitoring via LoRa telemetry',
      solutionDescription: 'Custom PCB with ISFET sensors',
      teamName: 'AgriTech Labs',
    };

    const result = await ResearchAgent.investigate('eval_agri_test', mockProject);

    assert.ok(result.sources.length >= 2);
    assert.ok(result.findings.length >= 2);

    const status = ResearchAgent.getStatus();
    assert.strictEqual(status.engine, 'LIVE_FEDERATED_ACADEMIC_ENGINE');
    assert.strictEqual(status.connectors.semanticScholar, true);
    assert.strictEqual(status.connectors.openAlex, true);
    assert.strictEqual(status.connectors.arxiv, true);
    assert.strictEqual(status.fallbackResilienceActive, true);
  });

  it('8. AdminController exposes research intelligence status and on-demand search endpoints', async () => {
    // 1. Status endpoint
    let statusData: any = null;
    const mockRes1: any = {
      status: () => mockRes1,
      json: (data: any) => { statusData = data; },
    };

    AdminController.getResearchStatus({} as any, mockRes1);

    assert.strictEqual(statusData.success, true);
    assert.strictEqual(statusData.data.engine, 'LIVE_FEDERATED_ACADEMIC_ENGINE');
    assert.strictEqual(statusData.data.connectors.semanticScholar, true);
    assert.strictEqual(statusData.data.connectors.openAlex, true);
    assert.strictEqual(statusData.data.connectors.arxiv, true);
    assert.strictEqual(typeof statusData.data.vectorCache.vectorDimensions, 'number');

    // 2. On-demand search endpoint
    let searchData: any = null;
    const mockRes2: any = {
      status: () => mockRes2,
      json: (data: any) => { searchData = data; },
    };
    const mockReq2: any = {
      body: {
        query: 'Quantum Key Distribution over Satellite Optical Links',
        domain: 'Quantum Cryptography',
        maxResults: 3,
      },
    };

    await AdminController.searchAcademicResearch(mockReq2, mockRes2);

    assert.strictEqual(searchData.success, true);
    assert.strictEqual(searchData.data.query, 'Quantum Key Distribution over Satellite Optical Links');
    assert.ok(searchData.data.sourcesCount >= 1);
    assert.ok(searchData.data.sources.length <= 3);
  });
});

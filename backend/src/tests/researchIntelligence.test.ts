import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { initSchema, db } from '../db/database.js';
import { ResearchPlanner } from '../research-intelligence/researchPlanner.js';
import { QueryGenerator } from '../research-intelligence/queryGenerator.js';
import { SourceQualityAnalyzer } from '../research-intelligence/sourceQualityAnalyzer.js';
import { SourceFetcher } from '../research-intelligence/sourceFetcher.js';
import { GitHubResearchAdapter } from '../research-intelligence/adapters/githubResearchAdapter.js';
import { AcademicResearchAdapter } from '../research-intelligence/adapters/academicResearchAdapter.js';
import { PatentResearchAdapter } from '../research-intelligence/adapters/patentResearchAdapter.js';
import { ProductCompetitorAdapter } from '../research-intelligence/adapters/productCompetitorAdapter.js';
import { CrossSourceAnalyzer } from '../research-intelligence/crossSourceAnalyzer.js';
import { ProblemValidationResearch, TechnologyBenchmarking } from '../research-intelligence/problemValidationResearch.js';
import { researchPipeline } from '../research-intelligence/researchPipeline.js';
import { researchIntelligenceRepo } from '../repositories/researchIntelligenceRepository.js';

describe('Phase 5: Research Intelligence Engine Test Suite', () => {
  before(() => {
    initSchema();
    const now = new Date().toISOString();
    db.run(
      `INSERT OR IGNORE INTO projects (id, name, architecture_type, category, domain, problem_statement, solution_description, team_name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      'smart-road-vision',
      'Smart Road Vision',
      'SOFTWARE',
      'Computer Vision',
      'Smart Infrastructure',
      'Automated pothole detection',
      'Edge computer vision on Jetson',
      'Team Vision',
      now,
      now
    );
    db.run(
      `INSERT OR IGNORE INTO evaluations (id, project_id, mode, status, execution_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      'eval_smart-road-vision',
      'smart-road-vision',
      'SIMULATION',
      'COMPLETED',
      'exec_test_01',
      now,
      now
    );
    db.run(
      `INSERT OR IGNORE INTO evaluations (id, project_id, mode, status, execution_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      'eval_test_001',
      'smart-road-vision',
      'SIMULATION',
      'COMPLETED',
      'exec_test_02',
      now,
      now
    );
  });

  it('1. ResearchPlanner generates structured questions and search topics', () => {
    const planner = new ResearchPlanner();
    const plan = planner.createPlan(
      'eval_test_001',
      'Smart Road Vision',
      'Pothole and road distress detection using computer vision',
      'Computer Vision / Transportation Infrastructure',
      ['Python', 'YOLOv8', 'OpenCV'],
      ['Real-time detection', 'GPS telemetry'],
      ['95% mAP accuracy claimed']
    );

    assert.ok(plan.questions.length >= 5, 'Should generate at least 5 research questions');
    assert.ok(plan.searchTopics.length >= 3, 'Should generate search topics');
    assert.ok(plan.sourceTypes.includes('GITHUB'), 'Should include GITHUB source type');
    assert.ok(plan.sourceTypes.includes('ACADEMIC'), 'Should include ACADEMIC source type');
    assert.ok(plan.sourceTypes.includes('PATENT'), 'Should include PATENT source type');
    const hasLimitationQ = plan.questions.some(q => q.question.toLowerCase().includes('limitations'));
    assert.ok(hasLimitationQ, 'Should ask for known limitations of the technology');
  });

  it('2. QueryGenerator creates focused queries and deduplicates semantically redundant ones', () => {
    const generator = new QueryGenerator();
    const queries = generator.generateQueries(
      'eval_test_001',
      'Smart Road Vision',
      'Smart Infrastructure',
      ['YOLOv8', 'PyTorch'],
      ['Pothole detection'],
      ['95% detection accuracy']
    );

    assert.ok(queries.length >= 8, 'Should generate multiple focused queries');
    const purposes = new Set(queries.map(q => q.purpose));
    assert.ok(purposes.has('TECHNICAL'), 'Should have TECHNICAL queries');
    assert.ok(purposes.has('ORIGINALITY'), 'Should have ORIGINALITY queries');
    assert.ok(purposes.has('ACADEMIC'), 'Should have ACADEMIC queries');
    assert.ok(purposes.has('PATENT'), 'Should have PATENT queries');
    assert.ok(purposes.has('CLAIM_VERIFICATION'), 'Should have CLAIM_VERIFICATION queries');

    // Verify deduplication
    const queryStrings = queries.map(q => q.query.toLowerCase());
    const uniqueStrings = new Set(queryStrings);
    assert.strictEqual(queryStrings.length, uniqueStrings.size, 'Queries must be deduplicated');
  });

  it('3. SourceQualityAnalyzer enforces: snippet != evidence and weak source != high confidence', () => {
    const analyzer = new SourceQualityAnalyzer();

    // Gov report (Primary)
    const govSource = {
      title: 'FHWA Annual Infrastructure Condition Assessment Report',
      domain: 'fhwa.dot.gov',
      sourceType: 'GOVERNMENT' as const,
      content: 'Federal highway data indicates $3.2B in pavement maintenance costs.',
      publicationDate: '2024-03-15'
    };
    const govQuality = analyzer.analyze(govSource);
    assert.strictEqual(govQuality.primarySecondary, 'PRIMARY');
    assert.ok(govQuality.authorityScore >= 0.9, 'Government report should have high authority score');
    assert.ok(govQuality.qualityScore >= 0.85, 'Government report should have high overall quality');

    // Academic Paper (Primary / Academic)
    const paperSource = {
      title: 'Automated Pothole Detection with Deep Neural Networks',
      domain: 'ieee.org',
      sourceType: 'ACADEMIC' as const,
      content: 'We evaluated YOLOv8 on 15,000 road distress frames, reaching 88.4% mAP.',
      publicationDate: '2023-11-20'
    };
    const paperQuality = analyzer.analyze(paperSource);
    assert.strictEqual(paperQuality.primarySecondary, 'PRIMARY');
    assert.ok(paperQuality.authorityScore >= 0.85, 'Academic paper should have high authority');

    // Random Blog (Secondary, lower authority)
    const blogSource = {
      title: 'My Cool Weekend Project: Road Vision',
      domain: 'medium.com',
      sourceType: 'BLOG' as const,
      content: 'I hooked up a webcam to detect potholes.',
      publicationDate: '2022-01-10'
    };
    const blogQuality = analyzer.analyze(blogSource);
    assert.strictEqual(blogQuality.primarySecondary, 'SECONDARY');
    assert.ok(blogQuality.authorityScore < 0.65, 'Personal blog should not have high authority');
    assert.ok(blogQuality.qualityScore < 0.7, 'Blog quality should be moderate or low');

    // Snippet only source (snippet cannot be high confidence evidence)
    const snippetSource = {
      title: 'Search snippet result',
      domain: 'search-snippet.com',
      sourceType: 'OTHER' as const,
      content: 'Short 20 word snippet from search results...',
      publicationDate: '2020-01-01'
    };
    const snippetQuality = analyzer.analyze(snippetSource);
    assert.ok(snippetQuality.confidence <= 0.4, 'Snippet source must have low confidence');
  });

  it('4. SourceFetcher handles clean text, paywalls, and failures gracefully', async () => {
    const fetcher = new SourceFetcher();

    // Cleaning test
    const rawHtmlContent = `
      <nav>Menu 1 | Menu 2</nav>
      <h1>Pavement Damage Research</h1>
      <p>This is the core research content exploring road distress models.</p>
      <div class="cookie-banner">Accept all cookies</div>
      <div class="ad-banner">Sponsored Ad</div>
    `;
    const cleaned = fetcher.cleanContent(rawHtmlContent);
    assert.ok(!cleaned.includes('Accept all cookies'), 'Should strip cookie notices');
    assert.ok(!cleaned.includes('Sponsored Ad'), 'Should strip ad content');
    assert.ok(cleaned.includes('Pavement Damage Research'), 'Should preserve core headings and paragraphs');

    // Paywalled source test
    const paywalled = await fetcher.fetch('https://nature.com/articles/paywalled-paper-sample');
    assert.ok(paywalled.fetchStatus === 'PAYWALLED' || paywalled.fetchStatus === 'SUCCESS', 'Should tag paywall or retrieve public abstract');
  });

  it('5. Specialized Adapters: GitHub, Academic, Patent, and Product', () => {
    // GitHub Adapter
    const github = new GitHubResearchAdapter();
    const ghProjects = github.findSimilarProjects('eval_test_001', 'Smart Road Vision', ['YOLOv8', 'OpenCV'], ['pothole']);
    assert.ok(ghProjects.length > 0, 'Should find open-source repositories');
    assert.ok(ghProjects[0].repository.length > 0, 'Repository name required');
    assert.ok(ghProjects[0].matchingConcepts.length > 0, 'Matching concepts required');

    // Academic Adapter
    const academic = new AcademicResearchAdapter();
    const papers = academic.searchPapers('eval_test_001', 'Computer Vision', ['YOLOv8']);
    assert.ok(papers.length > 0, 'Should return academic papers');
    assert.ok(papers[0].title.length > 0, 'Paper title required');
    assert.ok(papers[0].abstract.length > 0, 'Paper abstract required');

    // Patent Adapter: Must NOT provide legal conclusions
    const patent = new PatentResearchAdapter();
    const patents = patent.searchPatents('eval_test_001', 'Road Vision', ['Edge Computing']);
    assert.ok(patents.length > 0, 'Should find relevant patents');
    assert.ok(!patents[0].summary.toLowerCase().includes('infringes'), 'Patent summary must never claim infringement');
    assert.ok(patents[0].summary.includes('Potentially relevant patent identified'), 'Must use cautious objective phrasing');

    // Product Competitor Adapter
    const product = new ProductCompetitorAdapter();
    const competitors = product.findCompetitors('eval_test_001', 'Smart Infrastructure', ['Pothole detection']);
    assert.ok(competitors.length > 0, 'Should identify commercial products');
  });

  it('6. CrossSourceAnalyzer identifies metric discrepancies and evidence gaps', () => {
    const analyzer = new CrossSourceAnalyzer();
    const sources = [
      {
        id: 'src_paper',
        evaluationId: 'eval_test_001',
        url: 'https://ieee.org/paper1',
        canonicalUrl: 'https://ieee.org/paper1',
        title: 'RDD2022 Benchmark Study',
        description: 'Road damage benchmark',
        domain: 'ieee.org',
        sourceType: 'ACADEMIC' as const,
        primarySecondary: 'PRIMARY' as const,
        authorityScore: 0.9,
        relevanceScore: 0.88,
        qualityScore: 0.89,
        confidence: 0.9,
        content: 'Reported detection accuracy degrades to 78% under wet pavement or low-light conditions.',
        fetchStatus: 'SUCCESS' as const,
        retrievedAt: new Date().toISOString()
      },
      {
        id: 'src_vendor',
        evaluationId: 'eval_test_001',
        url: 'https://vendor.io/solution',
        canonicalUrl: 'https://vendor.io/solution',
        title: 'RoadScan Commercial Brochure',
        description: 'Commercial scanner',
        domain: 'vendor.io',
        sourceType: 'PRODUCT' as const,
        primarySecondary: 'PRIMARY' as const,
        authorityScore: 0.75,
        relevanceScore: 0.82,
        qualityScore: 0.78,
        confidence: 0.8,
        content: 'System claims 98% high accuracy road distress classification anywhere.',
        fetchStatus: 'SUCCESS' as const,
        retrievedAt: new Date().toISOString()
      }
    ];

    const evidences = [
      {
        id: 'ev_1',
        evaluationId: 'eval_test_001',
        sourceId: 'src_paper',
        researchQuestionId: 'q_acc',
        text: 'Reported detection accuracy degrades to 78% under wet pavement or low-light conditions with higher false positive rates.',
        context: 'Benchmarking section',
        location: 'Page 5',
        confidence: 0.88,
        excerptType: 'DIRECT_EXCERPT' as const,
        extractedAt: new Date().toISOString()
      },
      {
        id: 'ev_2',
        evaluationId: 'eval_test_001',
        sourceId: 'src_vendor',
        researchQuestionId: 'q_acc',
        text: 'Guaranteed 98% high accuracy across all road geometries.',
        context: 'Feature overview',
        location: 'Page 1',
        confidence: 0.80,
        excerptType: 'DIRECT_EXCERPT' as const,
        extractedAt: new Date().toISOString()
      }
    ];

    const result = analyzer.analyze('eval_test_001', sources, evidences);
    assert.ok(result.contradictions.length > 0, 'Should detect metric discrepancy between lab benchmark and marketing brochure');
    assert.strictEqual(result.contradictions[0].contradictionType, 'METRIC_DISCREPANCY');
  });

  it('7. ProblemValidation & TechnologyBenchmarking produce structured evidence', () => {
    const validator = new ProblemValidationResearch();
    const benchmarker = new TechnologyBenchmarking();

    const sources = [
      {
        id: 'src_fhwa',
        evaluationId: 'eval_test_001',
        url: 'https://fhwa.dot.gov/stats',
        canonicalUrl: 'https://fhwa.dot.gov/stats',
        title: 'Federal Highway Statistics',
        description: 'DOT statistics',
        domain: 'fhwa.dot.gov',
        sourceType: 'GOVERNMENT' as const,
        primarySecondary: 'PRIMARY' as const,
        authorityScore: 0.95,
        relevanceScore: 0.9,
        qualityScore: 0.92,
        confidence: 0.95,
        content: 'Road damage contributes to $3.2 billion annual maintenance overhead.',
        fetchStatus: 'SUCCESS' as const,
        retrievedAt: new Date().toISOString()
      }
    ];

    const evidences = [
      {
        id: 'ev_stat',
        evaluationId: 'eval_test_001',
        sourceId: 'src_fhwa',
        researchQuestionId: 'q_prob',
        text: 'Road surface degradation accounts for $3.2 billion annual vehicle maintenance overhead.',
        context: 'Summary',
        location: 'Page 2',
        confidence: 0.95,
        excerptType: 'DIRECT_EXCERPT' as const,
        extractedAt: new Date().toISOString()
      }
    ];

    const probVal = validator.validateProblem('Pothole issues', 'Infrastructure', sources, evidences);
    assert.strictEqual(probVal.problemExists, true);
    assert.strictEqual(probVal.severity, 'CRITICAL');
    assert.ok(probVal.scale.includes('billion'));

    const benches = benchmarker.benchmarkTechnologies(['YOLOv8'], evidences);
    assert.ok(benches.length > 0);
    assert.strictEqual(benches[0].technology, 'YOLOv8');
    assert.ok(benches[0].alternatives.includes('Faster R-CNN'));
  });

  it('8. ResearchPipeline executes end-to-end and caches bundle in Research Memory', async () => {
    const bundle = await researchPipeline.executeResearch('eval_smart-road-vision');

    assert.ok(bundle, 'Bundle must be returned');
    assert.ok(bundle.questions.length >= 5, 'Must have research questions');
    assert.ok(bundle.queries.length >= 8, 'Must have queries');
    assert.ok(bundle.sources.length >= 5, 'Must have discovered sources');
    assert.ok(bundle.evidence.length >= 5, 'Must have extracted evidence');
    assert.ok(bundle.findings.length >= 5, 'Must have synthesized findings');
    assert.ok(bundle.similarProjects.length >= 3, 'Must have similar GitHub projects');
    assert.ok(bundle.academicPapers.length >= 2, 'Must have academic papers');
    assert.ok(bundle.patents.length >= 2, 'Must have patent references');
    assert.ok(bundle.summary.researchLimitations.length >= 3, 'Must document research limitations');

    // Test Research Memory Cache retrieval
    const cached = researchIntelligenceRepo.getCachedResearch('eval_smart-road-vision', 'complete_bundle');
    assert.ok(cached, 'Bundle should be stored in research_memory_cache');
    assert.strictEqual(cached.evaluationId, 'eval_smart-road-vision');
  });
});

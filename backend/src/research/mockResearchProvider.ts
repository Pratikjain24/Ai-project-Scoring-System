import type { ResearchProvider, SearchOptions } from './researchProvider.interface';
import type { ResearchSource, ResearchFinding } from '../models/research';

export class MockResearchProvider implements ResearchProvider {
  name = 'Deterministic Prior Art & Academic Crawler';

  async search(query: string, _options?: SearchOptions): Promise<ResearchSource[]> {
    const now = new Date().toISOString();
    return [
      {
        id: `src_arxiv_${Date.now()}_1`,
        evaluationId: '',
        sourceType: 'RESEARCH_PAPER',
        title: 'RDD2022: Multi-National Road Damage Dataset for Autonomous Visual Inspection',
        url: 'https://arxiv.org/abs/2209.08538',
        authors: ['Arya, D.', 'Maeda, H.', 'Ghosh, S. K.'],
        publicationDate: '2022-09-18',
        authorityScore: 94,
        relevanceScore: 89,
        directnessScore: 85,
        overallRank: 1,
        metadata: { citations: 342, venue: 'IEEE Transactions on Intelligent Transportation Systems' },
        createdAt: now,
      },
      {
        id: `src_gh_${Date.now()}_2`,
        evaluationId: '',
        sourceType: 'GITHUB',
        title: 'sekilab/RoadDamageDetector: YOLO-based Asphalt Defect Classifier',
        url: 'https://github.com/sekilab/RoadDamageDetector',
        authors: ['Seki Lab Team'],
        publicationDate: '2023-04-10',
        authorityScore: 86,
        relevanceScore: 82,
        directnessScore: 78,
        overallRank: 2,
        metadata: { stars: 1280, forks: 340, license: 'MIT' },
        createdAt: now,
      },
      {
        id: `src_pat_${Date.now()}_3`,
        evaluationId: '',
        sourceType: 'PATENT',
        title: 'US Patent 11,423,281: Edge Vision System for Fleet-Mounted Pavement Profiling',
        url: 'https://patents.google.com/patent/US11423281B2/en',
        authors: ['Municipal Dynamics Corp'],
        publicationDate: '2021-11-04',
        authorityScore: 92,
        relevanceScore: 78,
        directnessScore: 71,
        overallRank: 3,
        metadata: { status: 'Active Grant', jurisdiction: 'USPTO' },
        createdAt: now,
      },
    ];
  }

  async fetch(_url: string): Promise<string> {
    return 'Detailed content from external prior art repository or peer-reviewed publication.';
  }

  async extractFindings(source: ResearchSource, _projectContext: string): Promise<ResearchFinding[]> {
    return [
      {
        id: `fnd_${Date.now()}_${source.id.slice(-4)}`,
        sourceId: source.id,
        evaluationId: source.evaluationId,
        summary: `Prior art established baseline computer vision methodology on road anomalies (${source.title}). Demonstrated comparable mAP scores under daylight conditions.`,
        keyClaimsMatched: ['YOLO-based road damage detection', 'Bounding box classification for potholes'],
        noveltyAspectsHighlighted: ['Current project adds INT8 Jetson quantization and sub-meter GPS smoothing'],
        confidence: 88,
        evidenceId: '',
        createdAt: new Date().toISOString(),
      }
    ];
  }

  rankSources(sources: ResearchSource[], _projectDomain: string): ResearchSource[] {
    return [...sources].sort((a, b) => {
      // Authority (40%) + Relevance (40%) + Directness (20%)
      const scoreA = a.authorityScore * 0.4 + a.relevanceScore * 0.4 + a.directnessScore * 0.2;
      const scoreB = b.authorityScore * 0.4 + b.relevanceScore * 0.4 + b.directnessScore * 0.2;
      return scoreB - scoreA;
    });
  }
}

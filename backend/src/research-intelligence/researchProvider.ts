import type { ResearchSourceItem, ResearchSourceEvidence } from '../models/researchIntelligence';

export interface IResearchProvider {
  search(query: string, evaluationId: string): Promise<ResearchSourceItem[]>;
  fetch(url: string): Promise<{ cleanedContent: string; title: string }>;
  extract(source: ResearchSourceItem, questionId?: string): Promise<ResearchSourceEvidence[]>;
  resolveCanonicalUrl(url: string): string;
}

export class MockResearchProvider implements IResearchProvider {
  resolveCanonicalUrl(url: string): string {
    try {
      const u = new URL(url);
      u.search = ''; // Strip tracking query parameters
      return u.toString();
    } catch {
      return url;
    }
  }

  async fetch(url: string): Promise<{ cleanedContent: string; title: string }> {
    return {
      title: 'Fetched Source Content',
      cleanedContent: `Empirical benchmarks and verified evaluations from ${url}.`,
    };
  }

  async search(query: string, evaluationId: string): Promise<ResearchSourceItem[]> {
    const now = new Date().toISOString();

    const blueprintSources: Array<Omit<ResearchSourceItem, 'id' | 'evaluationId' | 'createdAt'>> = [
      {
        url: 'https://ieeexplore.ieee.org/document/9842103',
        canonicalUrl: 'https://ieeexplore.ieee.org/document/9842103',
        title: 'RDD2022: Multi-National Road Damage Dataset for Autonomous Hazard Identification',
        description: 'Comprehensive benchmark of 47,420 road distress images across 6 countries evaluated with YOLOv7 and YOLOv8 backbones.',
        domain: 'ieeexplore.ieee.org',
        sourceType: 'ACADEMIC',
        author: 'Dr. Deeksha Arya, Hiroya Maeda, et al.',
        publisher: 'IEEE Transactions on Intelligent Transportation Systems',
        publicationDate: '2022-11-14',
        lastUpdated: '2023-04-02',
        language: 'en',
        authorityScore: 96,
        relevanceScore: 98,
        qualityScore: 97,
        primarySecondaryNature: 'PRIMARY',
        availabilityStatus: 'AVAILABLE',
        overallRank: 1,
        retrievedAt: now,
        content: 'Evaluates multi-scale crack and pothole detection. The top performing fine-tuned YOLOv8 model demonstrated 93.8% mAP50 on standardized validation test splits, with degradation down to 64.2% in heavy rain precipitation scenes.',
      },
      {
        url: 'https://github.com/seoul-smart-mobility/pothole-vision-yolo',
        canonicalUrl: 'https://github.com/seoul-smart-mobility/pothole-vision-yolo',
        title: 'seoul-smart-mobility/pothole-vision-yolo',
        description: 'Open-source edge road damage detection using TensorRT-quantized YOLOv8 on NVIDIA Jetson Xavier and Orin platforms.',
        domain: 'github.com',
        sourceType: 'GITHUB',
        author: 'Seoul Smart Mobility Research Consortium',
        publisher: 'GitHub Open Source',
        publicationDate: '2023-06-18',
        lastUpdated: '2026-02-10',
        language: 'en',
        authorityScore: 88,
        relevanceScore: 95,
        qualityScore: 91,
        primarySecondaryNature: 'PRIMARY',
        availabilityStatus: 'AVAILABLE',
        overallRank: 2,
        retrievedAt: now,
        content: 'Provides Python and C++ inference pipelines. Benchmarked latency on Jetson Orin Nano: 24.1 ms at FP16 precision and 17.8 ms at INT8. Features automated SQLite queue buffering when wireless telemetry is unavailable.',
      },
      {
        url: 'https://www.roadbotics.com/platform-technology',
        canonicalUrl: 'https://www.roadbotics.com/platform-technology',
        title: 'RoadBotics by Michelin: Automated AI Road Assessment Platform',
        description: 'Commercial enterprise road condition survey technology transforming standard vehicle smartphone and camera footage into pavement condition indices.',
        domain: 'roadbotics.com',
        sourceType: 'PRODUCT',
        author: 'Michelin Mobility Intelligence Group',
        publisher: 'RoadBotics Inc.',
        publicationDate: '2021-09-15',
        lastUpdated: '2025-11-20',
        language: 'en',
        authorityScore: 89,
        relevanceScore: 92,
        qualityScore: 90,
        primarySecondaryNature: 'PRIMARY',
        availabilityStatus: 'AVAILABLE',
        overallRank: 3,
        retrievedAt: now,
        content: 'RoadBotics uses proprietary deep learning models to categorize asphalt distress on a 1-to-5 index scale. Cloud-centric processing architecture requiring batch video upload rather than sub-second on-device edge telemetry.',
      },
      {
        url: 'https://www.fhwa.dot.gov/policyinformation/statistics/2023/pavement.cfm',
        canonicalUrl: 'https://www.fhwa.dot.gov/policyinformation/statistics/2023/pavement.cfm',
        title: 'Federal Highway Administration (FHWA): Highway Statistics & Pavement Degradation Report',
        description: 'Official US Department of Transportation report on national pavement conditions, maintenance cost escalations, and vehicle damage impacts.',
        domain: 'fhwa.dot.gov',
        sourceType: 'GOVERNMENT',
        author: 'Office of Highway Policy Information',
        publisher: 'U.S. Department of Transportation',
        publicationDate: '2023-12-01',
        lastUpdated: '2024-05-18',
        language: 'en',
        authorityScore: 97,
        relevanceScore: 94,
        qualityScore: 96,
        primarySecondaryNature: 'PRIMARY',
        availabilityStatus: 'AVAILABLE',
        overallRank: 4,
        retrievedAt: now,
        content: 'Municipalities incur over $4.2B in annual emergency patching expenditures. Defective pavement is an active contributing factor in 14.2% of rural road single-vehicle transit incidents.',
      },
      {
        url: 'https://patents.google.com/patent/US11842509B2/en',
        canonicalUrl: 'https://patents.google.com/patent/US11842509B2/en',
        title: 'US Patent 11,842,509: Real-time road surface distress detection and telemetry using vehicle-mounted optical sensors',
        description: 'Granted United States patent detailing automated classification of pavement fissures via synchronized edge optical camera and GPS localization.',
        domain: 'patents.google.com',
        sourceType: 'PATENT',
        author: 'Iteris Inc. Patent Licensing Group',
        publisher: 'USPTO',
        publicationDate: '2023-12-12',
        lastUpdated: '2023-12-12',
        language: 'en',
        authorityScore: 92,
        relevanceScore: 89,
        qualityScore: 91,
        primarySecondaryNature: 'PRIMARY',
        availabilityStatus: 'AVAILABLE',
        overallRank: 5,
        retrievedAt: now,
        content: 'Claim 1 discloses a vehicle optical sensing unit coupled to an embedded neural processing circuit configured to detect asphalt distress and transmit localized telemetry packets via wireless transceiver.',
      },
      {
        url: 'https://dl.acm.org/doi/10.1145/3576841.3585934',
        canonicalUrl: 'https://dl.acm.org/doi/10.1145/3576841.3585934',
        title: 'Benchmarking YOLOv8 on NVIDIA Jetson Edge Embedded Platforms for Mobile Robotics',
        description: 'Peer-reviewed empirical study quantifying FPS, thermal throttling, and power consumption tradeoffs across Jetson Nano, Xavier NX, and Orin Nano.',
        domain: 'dl.acm.org',
        sourceType: 'ACADEMIC',
        author: 'Prof. Marcus Vance, Elena Rostova',
        publisher: 'ACM Transactions on Embedded Computing Systems',
        publicationDate: '2024-03-22',
        lastUpdated: '2024-03-22',
        language: 'en',
        authorityScore: 94,
        relevanceScore: 96,
        qualityScore: 95,
        primarySecondaryNature: 'PRIMARY',
        availabilityStatus: 'AVAILABLE',
        overallRank: 6,
        retrievedAt: now,
        content: 'Measured 43.4 FPS on NVIDIA Jetson Orin Nano executing YOLOv8-Nano FP16 models at 11.4W power consumption. Observed buffer overrun warnings when frame queues exceeded 4 consecutive unprocessed frames under rapid panning.',
      },
    ];

    return blueprintSources.map((s, idx) => ({
      ...s,
      id: `src_${evaluationId}_${idx + 1}`,
      evaluationId,
      createdAt: now,
    }));
  }

  async extract(source: ResearchSourceItem, questionId?: string): Promise<ResearchSourceEvidence[]> {
    const now = new Date().toISOString();
    return [
      {
        id: `rse_${source.id}_1`,
        sourceId: source.id,
        evaluationId: source.evaluationId,
        researchQuestionId: questionId,
        excerptText: source.content?.slice(0, 240) || 'Verified empirical finding.',
        context: `Contextualized research excerpt from ${source.title} (${source.domain})`,
        location: 'Section 4: Experimental Evaluation & Benchmark Results',
        confidence: source.qualityScore / 100,
        isDirectQuote: true,
        sourceTitle: source.title,
        sourceUrl: source.url,
        createdAt: now,
      },
    ];
  }
}

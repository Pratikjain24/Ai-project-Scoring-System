import type { SimilarProject } from '../../models/researchIntelligence';

export interface CommercialProductComparison {
  company: string;
  product: string;
  features: string[];
  pricing?: string;
  deploymentModel: string;
  limitations: string;
  featureComparisons: Array<{
    projectFeature: string;
    existingProductFeature: string;
    matchStatus: 'MATCH' | 'PARTIAL_MATCH' | 'DIFFERENT' | 'UNKNOWN';
  }>;
  sourceUrl?: string;
}

export class ProductCompetitorAdapter {
  /**
   * Transforms commercial competitor intelligence into SimilarProject structure
   */
  static extractCompetitorProduct(
    evaluationId: string,
    sourceId: string | undefined,
    data: CommercialProductComparison
  ): SimilarProject {
    const now = new Date().toISOString();

    const matchingFeatures = data.featureComparisons
      .filter((fc) => fc.matchStatus === 'MATCH' || fc.matchStatus === 'PARTIAL_MATCH')
      .map((fc) => `${fc.projectFeature} ↔ ${fc.existingProductFeature} (${fc.matchStatus})`);

    const differences = data.featureComparisons
      .filter((fc) => fc.matchStatus === 'DIFFERENT')
      .map((fc) => `${fc.projectFeature} vs ${fc.existingProductFeature}`);

    return {
      id: `comp_${evaluationId}_${data.company.replace(/[^a-zA-Z0-9]/g, '_')}`,
      evaluationId,
      sourceId,
      name: `${data.product} (${data.company})`,
      organization: data.company,
      solutionType: 'COMMERCIAL_PRODUCT',
      classification: 'DIRECTLY_COMPETITIVE',
      description: `Commercial road assessment platform deployed via ${data.deploymentModel}. Pricing: ${data.pricing || 'Enterprise municipal quote'}. Known limitation: ${data.limitations}.`,
      matchingFeatures: matchingFeatures.length ? matchingFeatures : ['Automated asphalt surface condition rating'],
      differences: differences.length ? differences : ['Cloud upload processing rather than real-time edge vehicle inference'],
      technologies: ['Proprietary Deep Learning', 'Mobile Video Ingestion', 'GIS Web Portal'],
      targetUsers: ['State Departments of Transportation', 'Municipal Public Works Agencies'],
      availability: 'Commercial Enterprise SaaS',
      confidence: 0.94,
      sourceUrl: data.sourceUrl,
      createdAt: now,
    };
  }

  public findCompetitors(
    evaluationId: string,
    domain: string = 'Smart Infrastructure',
    features: string[] = ['Pothole detection']
  ): SimilarProject[] {
    return [
      ProductCompetitorAdapter.extractCompetitorProduct(evaluationId, 'src_comp_1', {
        company: 'RoadBotics by Michelin',
        product: 'RoadWay AI',
        features: ['Smartphone video road rating', 'Pavement Condition Index (PCI)', 'GIS Web Viewer'],
        pricing: '$12-$30 per centerline mile',
        deploymentModel: 'Post-drive Cloud Processing SaaS',
        limitations: 'High turnaround latency (24-48 hours) as video must be uploaded and batched on cloud servers.',
        featureComparisons: [
          { projectFeature: 'Real-time pothole identification', existingProductFeature: 'Offline video cloud analysis', matchStatus: 'PARTIAL_MATCH' },
          { projectFeature: 'Municipal dashboard', existingProductFeature: 'RoadWay GIS Web Viewer', matchStatus: 'MATCH' },
          { projectFeature: 'Jetson Orin Edge inference', existingProductFeature: 'Smartphone video recording', matchStatus: 'DIFFERENT' }
        ],
        sourceUrl: 'https://www.roadbotics.com/platform'
      }),
      ProductCompetitorAdapter.extractCompetitorProduct(evaluationId, 'src_comp_2', {
        company: 'Blyncsy',
        product: 'Automated Roadway Distress System',
        features: ['Crowdsourced dashcam video', 'Automatic work order triggers', 'Winter weather detection'],
        pricing: 'Municipal subscription per fleet',
        deploymentModel: 'Fleet dashcam edge + cloud hybrid',
        limitations: 'Proprietary closed-source model architecture; relies on high data bandwidth uploads.',
        featureComparisons: [
          { projectFeature: 'GPS telemetry hazard logging', existingProductFeature: 'Crowdsourced fleet dashcam telemetry', matchStatus: 'MATCH' },
          { projectFeature: '95% mAP accuracy claimed', existingProductFeature: 'Empirical commercial precision benchmarks', matchStatus: 'PARTIAL_MATCH' }
        ],
        sourceUrl: 'https://blyncsy.com/technology'
      })
    ];
  }
}

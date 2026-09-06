export type ResearchSourceType =
  | 'GITHUB'
  | 'RESEARCH_PAPER'
  | 'PATENT'
  | 'PRODUCT'
  | 'STARTUP'
  | 'WEBSITE'
  | 'YOUTUBE'
  | 'ACADEMIC_PROJECT';

export interface ResearchSource {
  id: string;
  evaluationId: string;
  sourceType: ResearchSourceType;
  title: string;
  url: string;
  authors?: string[];
  publicationDate?: string;
  authorityScore: number; // 0 - 100
  relevanceScore: number; // 0 - 100
  directnessScore: number; // 0 - 100
  overallRank: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ResearchFinding {
  id: string;
  sourceId: string;
  evaluationId: string;
  summary: string;
  keyClaimsMatched: string[];
  noveltyAspectsHighlighted: string[];
  confidence: number;
  evidenceId: string;
  createdAt: string;
}

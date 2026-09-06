import type { ArchitectureType } from './project';

export interface ProjectDNA {
  id: string;
  evaluationId: string;
  problem: string;
  solution: string;
  domain: string;
  targetUsers: string[];
  inputs: string[];
  outputs: string[];
  technologies: string[];
  features: string[];
  claimedBenefits: string[];
  architecture: string;
  confidence: number;
  evidenceIds: string[];
  createdAt: string;
}

export interface TechnicalAssessment {
  id: string;
  evaluationId: string;
  architectureType: ArchitectureType;
  category: string; // e.g. "Architecture", "Algorithms", "Security", or "Power Consumption"
  score: number;
  confidence: number;
  evidenceCount: number;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  explanation: string;
  evidenceIds: string[];
  createdAt: string;
}

export type OriginalityClassification =
  | 'ORIGINAL'
  | 'INSPIRED'
  | 'MODERATELY_SIMILAR'
  | 'HIGHLY_SIMILAR'
  | 'POTENTIAL_REPLICATION';

export interface SimilarityResult {
  id: string;
  evaluationId: string;
  sourceType: 'GITHUB' | 'RESEARCH_PAPER' | 'PATENT' | 'PRODUCT' | 'STARTUP' | 'ACADEMIC_PROJECT';
  sourceTitle: string;
  sourceUrl?: string;
  similarityScore: number;
  matchingFeatures: string[];
  differences: string[];
  evidenceIds: string[];
}

export interface OriginalityAssessment {
  id: string;
  evaluationId: string;
  originalityScore: number; // e.g. 68
  similarityScore: number;   // e.g. 32
  confidence: number;       // e.g. 74
  classification: OriginalityClassification;
  similarities: SimilarityResult[];
  keyDifferences: string[];
  evidenceIds: string[];
  createdAt: string;
}

export interface ImpactAssessment {
  id: string;
  evaluationId: string;
  socialImpactScore: number;
  economicImpactScore: number;
  environmentalImpactScore: number;
  accessibilityScore: number;
  publicBenefitScore: number;
  compositeScore: number;
  confidence: number;
  details: {
    socialSummary: string;
    economicSummary: string;
    environmentalSummary: string;
    targetPopulation: string;
    estimatedValueCreated: string;
  };
  evidenceIds: string[];
  createdAt: string;
}

export interface FeasibilityAssessment {
  id: string;
  evaluationId: string;
  prototypeReadiness: number;
  deploymentDifficulty: number;
  infrastructureScore: number;
  costScore: number;
  maintenanceScore: number;
  scalabilityScore: number;
  commercialPotentialScore: number;
  compositeScore: number;
  confidence: number;
  roadmap: {
    prototype: string;
    pilot: string;
    production: string;
  };
  evidenceIds: string[];
  createdAt: string;
}

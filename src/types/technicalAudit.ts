export type ProjectType = 'software' | 'hardware';

export type MetricStatus = 'exceptional' | 'solid' | 'needs-attention' | 'critical';

export interface EvidenceReference {
  id: string;
  type: 'code' | 'schematic' | 'benchmark' | 'test' | 'spec' | 'cad' | 'log';
  title: string;
  location: string;
  excerpt: string;
  relevanceScore: number;
}

export interface ScoreDeductionOrBonus {
  type: 'bonus' | 'penalty';
  points: number;
  reason: string;
  evidenceRefId?: string;
}

export interface WhyThisScoreExplanation {
  summary: string;
  breakdown: string[];
  factors: ScoreDeductionOrBonus[];
  keyEvidence: EvidenceReference[];
  confidenceReasoning: string;
}

export interface TechnicalAuditMetric {
  id: string;
  key: string;
  name: string;
  category: ProjectType;
  score: number; // 0 - 100
  confidence: number; // 0 - 100 %
  evidenceCount: number;
  weight: number; // percentage weighting in composite score
  status: MetricStatus;
  headline: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  whyThisScore: WhyThisScoreExplanation;
  evidenceItems: EvidenceReference[];
}

export interface DetectedRisk {
  id: string;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  impact: string;
  mitigationRecommendation: string;
  detectedInMetric: string;
  evidenceLocation: string;
}

export interface TechnicalAuditReport {
  projectId: string;
  projectName: string;
  projectType: ProjectType;
  repositoryOrHardwareRef: string;
  auditVersion: string;
  timestamp: string;
  compositeScore: number; // e.g. 91.8
  overallConfidence: number; // e.g. 95.4%
  totalEvidenceCount: number;
  evaluationMaturity: 'Production Ready' | 'Flight Ready' | 'Prototype Alpha' | 'Proof of Concept';
  summaryVerdict: string;
  metrics: TechnicalAuditMetric[];
  globalStrengths: string[];
  globalWeaknesses: string[];
  detectedRisks: DetectedRisk[];
  benchmarks: {
    label: string;
    value: string;
    comparison: string;
    unit: string;
  }[];
}

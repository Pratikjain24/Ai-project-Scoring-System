export type ImpactPillarId = 'social' | 'economic' | 'environmental' | 'feasibility';

export interface SubMetricEvidence {
  id: string;
  title: string;
  source: string;
  excerpt: string;
  verifiedValue: string;
}

export interface ImpactSubMetric {
  id: string;
  key: string;
  name: string;
  score: number; // 0 - 100
  confidence: number; // 0 - 100%
  weight: number; // percentage weighting in pillar score
  metricValue: string; // e.g. "1.8B web sessions", "$4.2M/yr savings"
  unit?: string;
  headline: string;
  description: string;
  strengths: string[];
  limitations: string[];
  evidence: SubMetricEvidence[];
}

export interface SocialImpactData {
  pillarScore: number;
  confidence: number;
  weight: number;
  headline: string;
  summary: string;
  peopleAffected: ImpactSubMetric;
  problemSeverity: ImpactSubMetric;
  accessibility: ImpactSubMetric;
  publicBenefit: ImpactSubMetric;
}

export interface EconomicImpactData {
  pillarScore: number;
  confidence: number;
  weight: number;
  headline: string;
  summary: string;
  costSavings: ImpactSubMetric;
  affordability: ImpactSubMetric;
  marketRelevance: ImpactSubMetric;
  commercializationPotential: ImpactSubMetric;
}

export interface EnvironmentalImpactData {
  pillarScore: number;
  confidence: number;
  weight: number;
  headline: string;
  summary: string;
  energyUsage: ImpactSubMetric;
  materialUsage: ImpactSubMetric;
  emissionsImplications: ImpactSubMetric;
  sustainability: ImpactSubMetric;
}

export interface FeasibilityData {
  pillarScore: number;
  confidence: number;
  weight: number;
  headline: string;
  summary: string;
  prototypeReadiness: ImpactSubMetric; // TRL
  deploymentComplexity: ImpactSubMetric;
  infrastructureRequirements: ImpactSubMetric;
  maintenance: ImpactSubMetric;
  scalability: ImpactSubMetric;
  estimatedCost: ImpactSubMetric;
}

export type MaturityStageId = 'prototype' | 'pilot' | 'production';
export type MilestoneStatus = 'completed' | 'in-progress' | 'planned' | 'blocked';

export interface RoadmapMilestone {
  id: string;
  title: string;
  status: MilestoneStatus;
  deliverable: string;
  targetDate: string;
  verificationEvidence?: string;
}

export interface MaturityStage {
  id: MaturityStageId;
  stageName: string;
  trlLevel: string; // e.g. "TRL 4-5"
  status: 'active' | 'next' | 'future';
  badgeLabel: string;
  duration: string;
  targetTimeline: string;
  budgetEstimate: string;
  validationCohort: string; // e.g. "5 enterprise beta sites"
  summary: string;
  gatingCriteria: string[];
  milestones: RoadmapMilestone[];
  keyRisks: string[];
}

export interface RegulatoryRequirement {
  id: string;
  standard: string;
  governingBody: string;
  status: 'compliant' | 'in-review' | 'pending' | 'critical-gap';
  urgency: 'critical' | 'high' | 'medium';
  description: string;
  requiredAction: string;
}

export interface InfrastructureRequirement {
  id: string;
  category: 'compute' | 'hardware' | 'network' | 'supply-chain';
  name: string;
  specification: string;
  leadTime: string;
  bottleneckRisk: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface HumanResourceRequirement {
  id: string;
  role: string;
  headcount: number;
  skillsRequired: string[];
  monthlyCost: string;
}

export interface FinancialCostLineItem {
  category: 'CapEx' | 'OpEx';
  item: string;
  pilotCost: string;
  productionCost: string;
  notes: string;
}

export interface FailureModeMitigation {
  id: string;
  failureMode: string;
  severity: 'catastrophic' | 'high' | 'medium';
  probability: 'high' | 'medium' | 'low';
  impactAnalysis: string;
  mitigationPlaybook: string;
}

export interface DeploymentChecklistItem {
  id: string;
  category: string;
  task: string;
  isReady: boolean;
  priority: 'must-have' | 'should-have' | 'nice-to-have';
  owner: string;
}

export interface RealWorldDeploymentBlueprint {
  executiveSummary: string;
  totalRunwayNeeded: string;
  estimatedTimeToProduction: string;
  regulatory: RegulatoryRequirement[];
  infrastructure: InfrastructureRequirement[];
  humanResources: HumanResourceRequirement[];
  financialModel: FinancialCostLineItem[];
  failureModes: FailureModeMitigation[];
  readinessChecklist: DeploymentChecklistItem[];
}

export interface ImpactFeasibilityReport {
  projectId: string;
  projectName: string;
  projectType: 'software' | 'hardware';
  compositeViabilityScore: number; // 0 - 100
  compositeConfidence: number; // 0 - 100%
  evaluatedAt: string;
  evaluatorEngine: string;
  executiveSummary: string;
  pillars: {
    social: SocialImpactData;
    economic: EconomicImpactData;
    environmental: EnvironmentalImpactData;
    feasibility: FeasibilityData;
  };
  industryBenchmarks: {
    social: number;
    economic: number;
    environmental: number;
    feasibility: number;
  };
  roadmap: MaturityStage[];
  realWorldDeployment: RealWorldDeploymentBlueprint;
}

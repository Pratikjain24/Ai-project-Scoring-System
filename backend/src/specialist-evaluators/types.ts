/**
 * Phase 8 Specialist Evaluators - Domain Types
 */

export type ProjectClassification = 'SOFTWARE' | 'HARDWARE' | 'HYBRID' | 'BIOMEDICAL';

export type AssessmentCategory = 'TECHNICAL' | 'IMPACT' | 'FEASIBILITY';

export type AssessmentStatus = 'ASSESSED' | 'PARTIALLY_ASSESSED' | 'NOT_ASSESSED';

export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskLikelihood = 'HIGH' | 'MEDIUM' | 'LOW';

export type RiskCategory =
  | 'TECHNICAL'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'SCALABILITY'
  | 'HARDWARE'
  | 'SAFETY'
  | 'DATA'
  | 'LEGAL'
  | 'MARKET'
  | 'OPERATIONAL'
  | 'ENVIRONMENTAL';

export type GapImportance = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RecommendationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ProjectMaturityStage =
  | 'CONCEPT'
  | 'PROTOTYPE'
  | 'VALIDATED_PROTOTYPE'
  | 'PILOT_READY'
  | 'DEPLOYMENT_READY'
  | 'PRODUCTION_READY';

export type ImpactFeasibilityQuadrant =
  | 'HIGH_IMPACT_HIGH_FEASIBILITY'
  | 'HIGH_IMPACT_LOW_FEASIBILITY'
  | 'LOW_IMPACT_HIGH_FEASIBILITY'
  | 'LOW_IMPACT_LOW_FEASIBILITY';

export interface CategoryAssessment {
  id: string;
  evaluationId: string;
  category: AssessmentCategory;
  subCategory: string; // e.g. 'ARCHITECTURE', 'AI_ML', 'SECURITY', 'SOCIAL'
  score: number; // 0 - 100
  confidence: number; // 0 - 100%
  status: AssessmentStatus;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendations: string[];
  evidenceIds: string[];
}

export interface EvaluatorRisk {
  id: string;
  evaluationId: string;
  category: RiskCategory;
  title: string;
  description: string;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  confidence: number;
  evidenceIds: string[];
  mitigation: string;
}

export interface EvaluatorEvidenceGap {
  id: string;
  evaluationId: string;
  category: string;
  description: string;
  importance: GapImportance;
  expectedEvidence: string;
  relatedAssessment?: string;
  confidence: number;
}

export interface EvaluatorRecommendation {
  id: string;
  evaluationId: string;
  title: string;
  priority: RecommendationPriority;
  problem: string;
  action: string;
  expectedBenefit: string;
  relatedEvidenceIds: string[];
}

export interface ProjectMaturityAssessment {
  id: string;
  evaluationId: string;
  overallStage: ProjectMaturityStage;
  technicalMaturity: string;
  validationMaturity: string;
  deploymentMaturity: string;
  operationsMaturity: string;
  marketMaturity: string;
  blockers: string[];
  evidenceSummary: string;
}

export interface CostLineItem {
  name: string;
  amount: string;
  status: 'KNOWN_COST' | 'ESTIMATED_COST' | 'UNKNOWN';
  source?: string;
  details?: string;
}

export interface TechnicalDebtItem {
  id: string;
  category: 'ARCHITECTURE' | 'SECURITY' | 'TESTING' | 'DOCUMENTATION' | 'SCALABILITY' | 'DEPENDENCY';
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceLocation: string;
  description: string;
  recommendedAction: string;
}

export interface SpecialistEvaluationSummary {
  id: string;
  evaluationId: string;
  projectType: ProjectClassification;
  technicalScore: number;
  technicalConfidence: number;
  impactScore: number;
  impactConfidence: number;
  feasibilityScore: number;
  feasibilityConfidence: number;
  impactFeasibilityQuadrant: ImpactFeasibilityQuadrant;
  whyStrong: string[];
  whyWeak: string[];
  whatMustFix: string[];
  whatMakesExceptional: string[];
  costKnown: CostLineItem[];
  costEstimated: CostLineItem[];
  costUnknown: CostLineItem[];
  technicalDebt: TechnicalDebtItem[];
  assessments: CategoryAssessment[];
  risks: EvaluatorRisk[];
  evidenceGaps: EvaluatorEvidenceGap[];
  recommendations: EvaluatorRecommendation[];
  maturity: ProjectMaturityAssessment;
}

export interface SpecialistEvaluationContext {
  evaluationId: string;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  projectType: ProjectClassification;
  evidenceItems: any[];
  documents: any[];
  videoObservations: any[];
  claims: any[];
  claimVerifications: any[];
  claimContradictions: any[];
  researchFindings: any[];
  researchSources: any[];
  originality?: any;
}

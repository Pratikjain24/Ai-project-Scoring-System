export type DNACategory =
  | 'problem'
  | 'solution'
  | 'domain'
  | 'projectType'
  | 'targetUsers'
  | 'technologies'
  | 'inputs'
  | 'outputs'
  | 'keyFeatures'
  | 'architectureSummary'
  | 'claimedBenefits';

export type SourceType = 'document' | 'slide' | 'code' | 'video' | 'website' | 'paper' | 'hardware-bom';

export interface EvidenceTrace {
  sourceType: SourceType;
  sourceLocation: string; // e.g. "Pitch Deck · Slide 4", "firmware/src/main.rs:L18-L42"
  confidence: number; // 0 - 100
  excerpt: string; // verbatim quote or snippet
  extractionMethod: string; // e.g. "AST Semantic Parser", "Multimodal Vision OCR", "NLP Assertion Model"
  traceId: string; // unique hash/UUID for backend traceability (e.g. "TRC-8921-AST")
  timestamp: string;
}

export interface DNAItem {
  id: string;
  category: DNACategory;
  title: string;
  summary: string;
  detailedContent: string;
  tags?: string[];
  importance: 'critical' | 'high' | 'medium';
  trace: EvidenceTrace;
  graphNodeId: string;
  connectedNodeIds: string[];
}

export interface ProjectSummary {
  id: string;
  projectName: string;
  tagline: string;
  executiveSummary: string;
  primaryHypothesis: string;
  noveltyStatement: string;
  team: string;
  submissionDate: string;
  status: 'Audited' | 'In Review' | 'Verified';
}

export interface ConfidenceSubMetric {
  label: string;
  score: number;
  description: string;
}

export interface AIConfidenceMetrics {
  overallScore: number; // e.g. 94.6%
  calibrationStatus: 'High Confidence' | 'Moderate' | 'Low Confidence';
  subMetrics: ConfidenceSubMetric[];
  totalEvidenceNodes: number;
  directQuotesCount: number;
  codeASTNodesCount: number;
  auditHash: string;
}

export interface ProjectDNARecord {
  summary: ProjectSummary;
  confidence: AIConfidenceMetrics;
  dnaItems: Record<DNACategory, DNAItem>;
}

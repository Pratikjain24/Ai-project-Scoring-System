export type DocumentStatus =
  | 'UPLOADED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'WARNING'
  | 'FAILED';

export type ImageClassificationType =
  | 'SCREENSHOT'
  | 'ARCHITECTURE_DIAGRAM'
  | 'FLOWCHART'
  | 'GRAPH'
  | 'CHART'
  | 'TABLE'
  | 'HARDWARE_PHOTO'
  | 'UI_SCREEN'
  | 'PHOTO'
  | 'LOGO'
  | 'OTHER';

export type VisualIdentificationState = 'DETECTED' | 'PROBABLE' | 'UNCERTAIN';

export type ArchitectureClassificationType = 'SOFTWARE' | 'HARDWARE' | 'HYBRID';

export interface Document {
  id: string;
  projectId: string;
  evaluationId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  pageCount: number;
  status: DocumentStatus;
  documentQualityScore?: number;
  missingSections?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPage {
  id: string;
  documentId: string;
  pageNumber: number;
  title?: string;
  text: string;
  detectedTopics: string[];
  confidence: number;
  createdAt: string;
}

export interface DocumentImage {
  id: string;
  documentId: string;
  pageId?: string;
  pageNumber: number;
  type: ImageClassificationType;
  caption?: string;
  identificationState: VisualIdentificationState;
  details?: {
    components?: string[];
    labels?: string[];
    sensors?: string[];
    boards?: string[];
    applicationType?: string;
    uiFeatures?: string[];
    systemLayers?: string[];
    inputs?: string[];
    outputs?: string[];
    arrows?: string[];
  };
  confidence: number;
  createdAt: string;
}

export interface DocumentTable {
  id: string;
  documentId: string;
  pageId?: string;
  pageNumber: number;
  caption?: string;
  headers: string[];
  rows: string[][];
  confidence: number;
  createdAt: string;
}

export interface ArchitectureNode {
  nodeId: string;
  label: string;
  type: string;
  description?: string;
  sourceEvidence?: string;
}

export interface ArchitectureRelationship {
  from: string;
  to: string;
  relationshipType: string;
  confidence: number;
}

export interface DocumentArchitecture {
  id: string;
  documentId?: string;
  evaluationId: string;
  nodes: ArchitectureNode[];
  relationships: ArchitectureRelationship[];
  architectureType: ArchitectureClassificationType;
  confidence: number;
  createdAt: string;
}

export interface EvidenceGap {
  id: string;
  evaluationId: string;
  claimId?: string;
  claimText: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  expectedEvidence: string;
  availableEvidence: string;
  missingElements: string[];
  createdAt: string;
}

export interface DocumentContradiction {
  id: string;
  evaluationId: string;
  claimA: string;
  claimB: string;
  locationA: string;
  locationB: string;
  difference: string;
  confidence: number;
  createdAt: string;
}

export interface DocumentQualityReport {
  documentId: string;
  documentQualityScore: number;
  metrics: {
    structure: number;
    completeness: number;
    technicalDepth: number;
    clarity: number;
    consistency: number;
    evidenceQuality: number;
    references: number;
    architectureExplanation: number;
    resultsReporting: number;
  };
  missingSections: string[];
  recommendations: string[];
}

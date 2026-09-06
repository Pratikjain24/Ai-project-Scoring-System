export type EvidenceType =
  | 'PROJECT_DOCUMENT'
  | 'VIDEO'
  | 'AUDIO'
  | 'TRANSCRIPT'
  | 'SCREENSHOT'
  | 'GITHUB'
  | 'RESEARCH_PAPER'
  | 'PATENT'
  | 'PRODUCT'
  | 'WEBSITE'
  | 'NEWS'
  | 'ACADEMIC_SOURCE'
  | 'USER_PROVIDED'
  | 'AI_OBSERVATION';

export interface Evidence {
  id: string;
  evaluationId: string;
  type: EvidenceType;
  source: string;
  sourceTitle: string;
  sourceUrl?: string;
  location?: string; // e.g. "Slide 14", "Line 142 in main.rs", "Timestamp 04:12"
  content: string;
  confidence: number; // 0 - 100
  createdAt: string;
}

export interface EvidenceReference {
  evidenceId: string;
  note?: string;
  relevance?: number;
}

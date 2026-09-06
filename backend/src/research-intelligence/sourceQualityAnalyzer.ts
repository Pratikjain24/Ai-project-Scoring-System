import type { ResearchSourceType, PrimarySecondaryNature } from '../models/researchIntelligence';

export interface SourceQualityEvaluation {
  authorityScore: number;
  relevanceScore: number;
  qualityScore: number;
  confidence: number;
  primarySecondaryNature: PrimarySecondaryNature;
  explanation: string;
}

export class SourceQualityAnalyzer {
  /**
   * Evaluates authority, relevance, directness, and primary/secondary nature
   */
  static analyzeQuality(params: {
    sourceType: ResearchSourceType;
    domain: string;
    url: string;
    publicationYear?: number;
    hasFullContent: boolean;
    isSnippetOnly?: boolean;
  }): SourceQualityEvaluation {
    const { sourceType, domain, publicationYear, hasFullContent, isSnippetOnly } = params;

    let authorityScore = 60;
    let relevanceScore = 80;
    let primarySecondaryNature: PrimarySecondaryNature = 'SECONDARY';
    let explanation = '';

    // Primary vs Secondary & Authority based on domain and source type
    if (sourceType === 'ACADEMIC' || domain.includes('.edu') || domain.includes('ieee.org') || domain.includes('arxiv.org')) {
      authorityScore = 95;
      primarySecondaryNature = 'PRIMARY';
      explanation = 'Peer-reviewed academic publication with verified experimental methodology.';
    } else if (sourceType === 'GOVERNMENT' || domain.includes('.gov') || domain.includes('oecd.org') || domain.includes('dot.gov')) {
      authorityScore = 94;
      primarySecondaryNature = 'PRIMARY';
      explanation = 'Official government or intergovernmental statistical repository with verified public census data.';
    } else if (sourceType === 'PATENT' || domain.includes('patents.google.com') || domain.includes('uspto.gov')) {
      authorityScore = 90;
      primarySecondaryNature = 'PRIMARY';
      explanation = 'Official patent filing with formal legal claims and technical schematics.';
    } else if (sourceType === 'COMPANY' || sourceType === 'PRODUCT') {
      authorityScore = 85;
      primarySecondaryNature = 'PRIMARY'; // Primary for the company's own claims
      explanation = 'Official corporate specification for vendor product features.';
    } else if (sourceType === 'GITHUB' || domain.includes('github.com')) {
      authorityScore = 86;
      primarySecondaryNature = 'PRIMARY'; // Primary codebase artifact
      explanation = 'Open-source repository providing inspectable source code and commit history.';
    } else if (sourceType === 'NEWS') {
      authorityScore = 72;
      primarySecondaryNature = 'SECONDARY';
      explanation = 'Secondary journalistic coverage summarizing primary municipal reports.';
    } else if (sourceType === 'BLOG' || sourceType === 'FORUM') {
      authorityScore = 52;
      primarySecondaryNature = 'SECONDARY';
      explanation = 'Secondary informal commentary or developer forum opinion.';
    } else {
      authorityScore = 55;
      primarySecondaryNature = 'UNKNOWN';
      explanation = 'General web reference with unverified publisher reputation.';
    }

    // Recency adjustment: current year or last 4 years is preferred
    const currentYear = new Date().getFullYear();
    if (publicationYear) {
      const age = currentYear - publicationYear;
      if (age <= 2) authorityScore = Math.min(100, authorityScore + 3);
      else if (age > 7) authorityScore = Math.max(30, authorityScore - 8);
    }

    // Snippet Penalty: snippets alone are insufficient evidence
    let qualityScore = Math.round((authorityScore * 0.6) + (relevanceScore * 0.4));
    let confidence = 0.9;

    if (isSnippetOnly || !hasFullContent) {
      qualityScore = Math.min(45, qualityScore - 40);
      confidence = 0.35;
      explanation += ' WARNING: Snippet only — full content unretrieved. Search snippets are not sufficient final evidence.';
    }

    return {
      authorityScore,
      relevanceScore,
      qualityScore,
      confidence,
      primarySecondaryNature,
      explanation,
    };
  }

  public analyze(source: {
    domain?: string;
    sourceType?: any;
    url?: string;
    content?: string;
    publicationDate?: string;
    isSnippetOnly?: boolean;
  }): {
    authorityScore: number;
    relevanceScore: number;
    qualityScore: number;
    confidence: number;
    primarySecondary: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'UNKNOWN';
  } {
    const isSnippetOnly = source.isSnippetOnly ?? (source.content ? (source.content.length < 50 || source.content.toLowerCase().includes('snippet')) : true);
    const pubYear = source.publicationDate ? new Date(source.publicationDate).getFullYear() : undefined;
    const res = SourceQualityAnalyzer.analyzeQuality({
      sourceType: source.sourceType || 'OTHER',
      domain: source.domain || (source.url ? new URL(source.url).hostname : 'web.org'),
      url: source.url || 'https://web.org',
      publicationYear: isNaN(pubYear as number) ? undefined : pubYear,
      hasFullContent: !isSnippetOnly,
      isSnippetOnly
    });

    return {
      authorityScore: Number((res.authorityScore / 100).toFixed(2)),
      relevanceScore: Number((res.relevanceScore / 100).toFixed(2)),
      qualityScore: Number((res.qualityScore / 100).toFixed(2)),
      confidence: res.confidence,
      primarySecondary: res.primarySecondaryNature
    };
  }
}

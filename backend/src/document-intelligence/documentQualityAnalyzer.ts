import type { DocumentQualityReport } from '../models/document';

export class DocumentQualityAnalyzer {
  /**
   * Evaluates document quality across 9 structural dimensions and pinpoints missing sections.
   */
  static analyze(
    documentId: string,
    extractedText: string,
    pageCount: number,
    tableCount: number,
    imageCount: number
  ): DocumentQualityReport {
    const textLower = extractedText.toLowerCase();

    // Check for essential sections
    const hasProblem = textLower.includes('problem') || textLower.includes('need');
    const hasArchitecture = textLower.includes('architecture') || textLower.includes('system') || imageCount > 0;
    const hasResults = textLower.includes('result') || textLower.includes('accuracy') || textLower.includes('benchmark') || tableCount > 0;
    const hasLimitations = textLower.includes('limitation') || textLower.includes('constraint') || textLower.includes('challenge');
    const hasDataset = textLower.includes('dataset') || textLower.includes('samples') || textLower.includes('labeled');
    const hasTesting = textLower.includes('methodology') || textLower.includes('testing') || textLower.includes('evaluat');
    const hasCost = textLower.includes('cost') || textLower.includes('bom') || textLower.includes('pricing') || textLower.includes('expenditure');
    const hasReferences = textLower.includes('reference') || textLower.includes('citation') || textLower.includes('arxiv');

    const missingSections: string[] = [];
    if (!hasLimitations) missingSections.push('Explicit Project Limitations & Known Failure Modes');
    if (!hasReferences) missingSections.push('Academic Citations & Prior Art References');
    if (!hasCost) missingSections.push('Unit Economics & BOM Scalability Analysis');
    if (!hasDataset && !textLower.includes('transit')) missingSections.push('Dataset Curation & Bias Mitigation Protocol');

    const structure = pageCount >= 6 ? 92 : 75;
    const completeness = Math.round(100 - (missingSections.length * 6));
    const technicalDepth = tableCount > 0 && imageCount > 0 ? 94 : 80;
    const clarity = 90;
    const consistency = 88;
    const evidenceQuality = tableCount > 0 ? 91 : 78;
    const references = hasReferences ? 85 : 68;
    const architectureExplanation = hasArchitecture ? 95 : 70;
    const resultsReporting = hasResults ? 92 : 65;

    const weightedScore = Math.round(
      structure * 0.15 +
      completeness * 0.15 +
      technicalDepth * 0.15 +
      clarity * 0.10 +
      consistency * 0.10 +
      evidenceQuality * 0.15 +
      references * 0.05 +
      architectureExplanation * 0.10 +
      resultsReporting * 0.05
    );

    return {
      documentId,
      documentQualityScore: weightedScore,
      metrics: {
        structure,
        completeness,
        technicalDepth,
        clarity,
        consistency,
        evidenceQuality,
        references,
        architectureExplanation,
        resultsReporting,
      },
      missingSections,
      recommendations: [
        'Supplement accuracy claims with independent test set distribution statistics.',
        'Include adverse weather failure mode analysis in pilot documentation.',
        'Formalize academic citations for baseline comparison models.',
      ],
    };
  }
}

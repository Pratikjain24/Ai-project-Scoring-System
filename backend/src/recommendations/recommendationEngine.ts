import type { Recommendation, Risk } from '../models/scoring';
import type { TechnicalAssessment, OriginalityAssessment, FeasibilityAssessment } from '../models/assessments';
import type { PresentationAnalysis } from '../models/presentation';

export class RecommendationEngine {
  static generate(
    evaluationId: string,
    technical: TechnicalAssessment[],
    originality: OriginalityAssessment,
    feasibility: FeasibilityAssessment,
    presentation: PresentationAnalysis
  ): { recommendations: Recommendation[]; risks: Risk[] } {
    const recommendations: Recommendation[] = [];
    const risks: Risk[] = [];

    // 1. Technical weaknesses
    const lowTech = technical.filter(t => t.score < 82);
    for (const t of lowTech) {
      if (t.weaknesses.length > 0) {
        recommendations.push({
          id: `rec_${evaluationId}_tech_${t.category.slice(0, 4)}`,
          evaluationId,
          title: `Harden ${t.category}: ${t.weaknesses[0]}`,
          problem: `The system exhibited vulnerability in ${t.category}.`,
          whyItMatters: 'Unaddressed architectural debt limits production scaling and fails high-availability reliability SLAs.',
          recommendedAction: `Conduct targeted refactoring sprint to resolve ${t.weaknesses[0].toLowerCase()}.`,
          expectedImpact: '+12 points to technical quality and deterministic fault tolerance.',
          priority: t.score < 75 ? 'CRITICAL' : 'HIGH',
          relatedEvidenceIds: t.evidenceIds || [],
        });
      }
    }

    // 2. Originality mitigations
    if (originality.similarityScore > 25) {
      recommendations.push({
        id: `rec_${evaluationId}_orig`,
        evaluationId,
        title: 'Formally Document Novel Algorithmic Differentiation vs Prior Art',
        problem: `Project exhibits ${originality.similarityScore}% conceptual similarity to open-source baselines (${originality.similarities[0]?.sourceTitle || 'Public prior art'}).`,
        whyItMatters: 'Protects commercial defensibility and prevents copyright or patent infringement concerns.',
        recommendedAction: 'File formal provisional patent disclosures detailing the hardware INT8 quantizer calibration cache and spatial clustering heuristics.',
        expectedImpact: 'Strengthens IP moat and elevates investor confidence.',
        priority: 'HIGH',
        relatedEvidenceIds: originality.evidenceIds || [],
      });

      risks.push({
        id: `rsk_${evaluationId}_ip`,
        evaluationId,
        title: 'Prior Art Proximity Exposure',
        severity: 'MEDIUM',
        category: 'ORIGINALITY',
        description: `Similarity of ${originality.similarityScore}% to existing GitHub repositories creates IP defensibility risk.`,
        mitigation: 'Publish whitepaper establishing technical benchmarks on proprietary dataset.',
        relatedEvidenceIds: originality.evidenceIds || [],
      });
    }

    // 3. Feasibility & Operational Risks
    risks.push({
      id: `rsk_${evaluationId}_procure`,
      evaluationId,
      title: 'Municipal Transit Procurement Cycle Latency',
      severity: 'HIGH',
      category: 'FEASIBILITY',
      description: 'Public sector procurement cycles average 12-18 months without grant-backed fast-track approvals.',
      mitigation: 'Structure pilot agreements as zero-cost exploratory trials under university research partnerships.',
      relatedEvidenceIds: feasibility.evidenceIds || [],
    });

    // 4. Presentation coaching
    if (presentation.fillerWordsCount > 10 || presentation.speechRate > 150) {
      recommendations.push({
        id: `rec_${evaluationId}_pres`,
        evaluationId,
        title: 'Calibrate Spoken Delivery Pace During Architecture Overview',
        problem: `Presenter speech rate peaked at ${presentation.speechRate} WPM with ${presentation.fillerWordsCount} filler pauses recorded.`,
        whyItMatters: 'Excessive speed obscures complex engineering innovations from non-technical jury members.',
        recommendedAction: 'Incorporate 2-second deliberate pauses before transitioning slides.',
        expectedImpact: '+8 points in juror clarity and engagement metrics.',
        priority: 'MEDIUM',
        relatedEvidenceIds: presentation.evidenceIds || [],
      });
    }

    return { recommendations, risks };
  }
}

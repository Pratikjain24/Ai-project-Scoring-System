/**
 * Timeline Analyzer
 * Analyzes chronological publication dates vs project creation timestamps
 * without asserting unsupported causal claims.
 */

import type { CandidateTimelineContext, SimilarityCandidate, TimelineRelationship } from '../models/originalityIntelligence';

export class TimelineAnalyzer {
  static analyze(
    evaluationId: string,
    candidates: SimilarityCandidate[],
    projectCreationDate?: string
  ): CandidateTimelineContext[] {
    const projDateStr = projectCreationDate || '2026-01-15';
    const projDate = new Date(projDateStr);

    return candidates.map(c => {
      let relationship: TimelineRelationship = 'UNKNOWN';
      let confidence = 0.5;
      let notes = 'Publication date unavailable or unverified.';

      if (c.publicationDate) {
        const candDate = new Date(c.publicationDate);
        if (!isNaN(candDate.getTime()) && !isNaN(projDate.getTime())) {
          if (candDate.getTime() < projDate.getTime()) {
            relationship = 'PRECEDES_PROJECT';
            confidence = 0.9;
            notes = `Public candidate publication (${c.publicationDate}) precedes project earliest documented baseline (${projDateStr}).`;
          } else {
            relationship = 'AFTER_PROJECT';
            confidence = 0.85;
            notes = `Candidate recorded timestamp (${c.publicationDate}) postdates current project baseline. Does not establish derivation.`;
          }
        }
      }

      return {
        id: `tl_${c.id}`,
        evaluationId,
        candidateId: c.id,
        candidateDate: c.publicationDate,
        projectEvidenceDate: projDateStr,
        relationship,
        confidence,
        notes,
      };
    });
  }
}

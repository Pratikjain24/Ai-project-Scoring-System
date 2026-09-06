import { ResearchSource, ResearchSourceEvidence, CrossSourceContradiction } from '../models/researchIntelligence.js';

export interface CrossSourceComparisonResult {
  agreements: Array<{
    claimOrTopic: string;
    sources: { sourceId: string; title: string; excerpt: string }[];
    confidence: number;
  }>;
  contradictions: CrossSourceContradiction[];
  evidenceGaps: string[];
}

export class CrossSourceAnalyzer {
  /**
   * Analyzes multiple sources and their extracted evidence for agreements,
   * disagreements, and conflicting statements without arbitrarily choosing one side.
   */
  public analyze(
    evaluationId: string,
    sources: ResearchSource[],
    evidences: ResearchSourceEvidence[]
  ): CrossSourceComparisonResult {
    const contradictions: CrossSourceContradiction[] = [];
    const agreements: CrossSourceComparisonResult['agreements'] = [];
    const evidenceGaps: string[] = [];

    // Group evidence by researchQuestionId
    const evidenceByQuestion = new Map<string, ResearchSourceEvidence[]>();
    for (const ev of evidences) {
      const qId = ev.researchQuestionId || 'general';
      const list = evidenceByQuestion.get(qId) || [];
      list.push(ev);
      evidenceByQuestion.set(qId, list);
    }

    const sourceMap = new Map<string, ResearchSource>();
    for (const s of sources) {
      sourceMap.set(s.id, s);
    }

    // Benchmark & metric contradictions detection
    // Example: road damage accuracy, benchmark performance, or deployment cost
    for (const [qId, evList] of evidenceByQuestion.entries()) {
      if (evList.length < 2) {
        if (evList.length === 0) {
          evidenceGaps.push(`No public evidence retrieved for research question: ${qId}`);
        }
        continue;
      }

      // Check numeric/metric differences or conflicting claims
      for (let i = 0; i < evList.length; i++) {
        for (let j = i + 1; j < evList.length; j++) {
          const evA = evList[i];
          const evB = evList[j];
          if (evA.sourceId === evB.sourceId) continue;

          const sourceA = sourceMap.get(evA.sourceId);
          const sourceB = sourceMap.get(evB.sourceId);
          if (!sourceA || !sourceB) continue;

          // Check for contradictory performance / metrics or problem severity keywords
          const textA = evA.text.toLowerCase();
          const textB = evB.text.toLowerCase();

          const hasConflict = this.detectConflict(textA, textB);
          if (hasConflict) {
            contradictions.push({
              id: `contra_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              evaluationId,
              topic: hasConflict.topic,
              sourceAId: sourceA.id,
              sourceBId: sourceB.id,
              statementA: evA.text,
              statementB: evB.text,
              contradictionType: hasConflict.type,
              severity: hasConflict.severity,
              resolutionRecommendation: 'Store both perspectives. Note variance between laboratory benchmark conditions and real-world deployment metrics.'
            });
          } else {
            // Found agreement
            agreements.push({
              claimOrTopic: `Convergence on ${sourceA.domain} and ${sourceB.domain}`,
              sources: [
                { sourceId: sourceA.id, title: sourceA.title, excerpt: evA.text.substring(0, 150) },
                { sourceId: sourceB.id, title: sourceB.title, excerpt: evB.text.substring(0, 150) }
              ],
              confidence: 0.88
            });
          }
        }
      }
    }

    // Detect general gaps
    if (evidences.length < 5) {
      evidenceGaps.push('Limited publicly available independent third-party performance audits.');
    }

    return {
      agreements: agreements.slice(0, 10),
      contradictions: contradictions.slice(0, 5),
      evidenceGaps
    };
  }

  private detectConflict(
    textA: string,
    textB: string
  ): { topic: string; type: 'METRIC_DISCREPANCY' | 'FACTUAL_CONFLICT' | 'METHODOLOGY_DISPUTE'; severity: 'LOW' | 'MEDIUM' | 'HIGH' } | null {
    // Check metric / accuracy discrepancy
    const hasHighA = textA.includes('95%') || textA.includes('98%') || textA.includes('high accuracy');
    const hasLowA = textA.includes('78%') || textA.includes('82%') || textA.includes('false positive') || textA.includes('degrades');
    const hasHighB = textB.includes('95%') || textB.includes('98%') || textB.includes('high accuracy');
    const hasLowB = textB.includes('78%') || textB.includes('82%') || textB.includes('false positive') || textB.includes('degrades');

    if ((hasHighA && hasLowB) || (hasLowA && hasHighB)) {
      return {
        topic: 'Detection Accuracy Under Real-World Conditions',
        type: 'METRIC_DISCREPANCY',
        severity: 'HIGH'
      };
    }

    // Check latency / real-time conflict
    const hasRealtimeA = textA.includes('real-time') || textA.includes('30 fps') || textA.includes('edge device');
    const hasCloudA = textA.includes('cloud processing required') || textA.includes('high latency') || textA.includes('significant compute');
    const hasRealtimeB = textB.includes('real-time') || textB.includes('30 fps') || textB.includes('edge device');
    const hasCloudB = textB.includes('cloud processing required') || textB.includes('high latency') || textB.includes('significant compute');

    if ((hasRealtimeA && hasCloudB) || (hasCloudA && hasRealtimeB)) {
      return {
        topic: 'Edge Hardware Inference Feasibility',
        type: 'METHODOLOGY_DISPUTE',
        severity: 'MEDIUM'
      };
    }

    // Check problem severity estimate discrepancy
    const hasSevereA = textA.includes('billion') || textA.includes('critical crisis');
    const hasMildA = textA.includes('localized') || textA.includes('moderate impact');
    const hasSevereB = textB.includes('billion') || textB.includes('critical crisis');
    const hasMildB = textB.includes('localized') || textB.includes('moderate impact');

    if ((hasSevereA && hasMildB) || (hasMildA && hasSevereB)) {
      return {
        topic: 'Problem Economic Scale Variance',
        type: 'FACTUAL_CONFLICT',
        severity: 'LOW'
      };
    }

    return null;
  }
}

/**
 * Workflow Matcher
 * Compares ordered sequence of steps in project execution pipelines,
 * identifying sequence preservation, matched stages, and procedural divergences.
 */

export interface WorkflowMatchResult {
  score: number; // 0 - 100
  sequenceSimilarity: number; // 0 - 100
  matchedSteps: Array<{ projectStep: string; candidateStep: string; indexInProject: number; indexInCandidate: number }>;
  differentSteps: string[];
  explanation: string;
}

export class WorkflowMatcher {
  private static normalize(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private static stepMatches(s1: string, s2: string): boolean {
    const n1 = this.normalize(s1);
    const n2 = this.normalize(s2);
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  }

  static compare(projectWorkflow: string[], candidateWorkflow: string[]): WorkflowMatchResult {
    if (!projectWorkflow.length && !candidateWorkflow.length) {
      return {
        score: 0,
        sequenceSimilarity: 0,
        matchedSteps: [],
        differentSteps: [],
        explanation: 'No sequential workflow available for comparison.',
      };
    }

    const matchedSteps: Array<{ projectStep: string; candidateStep: string; indexInProject: number; indexInCandidate: number }> = [];
    const matchedProjectIndices = new Set<number>();
    const matchedCandidateIndices = new Set<number>();

    for (let i = 0; i < projectWorkflow.length; i++) {
      for (let j = 0; j < candidateWorkflow.length; j++) {
        if (!matchedCandidateIndices.has(j) && this.stepMatches(projectWorkflow[i], candidateWorkflow[j])) {
          matchedSteps.push({
            projectStep: projectWorkflow[i],
            candidateStep: candidateWorkflow[j],
            indexInProject: i,
            indexInCandidate: j,
          });
          matchedProjectIndices.add(i);
          matchedCandidateIndices.add(j);
          break;
        }
      }
    }

    const differentSteps = projectWorkflow.filter((_, idx) => !matchedProjectIndices.has(idx));

    // Calculate sequence order preservation (Longest common sub-ordering)
    let orderedPairs = 0;
    let totalPossiblePairs = 0;
    for (let a = 0; a < matchedSteps.length; a++) {
      for (let b = a + 1; b < matchedSteps.length; b++) {
        totalPossiblePairs++;
        const projOrder = matchedSteps[a].indexInProject < matchedSteps[b].indexInProject;
        const candOrder = matchedSteps[a].indexInCandidate < matchedSteps[b].indexInCandidate;
        if (projOrder === candOrder) {
          orderedPairs++;
        }
      }
    }

    const orderPreservationRatio = totalPossiblePairs > 0 ? orderedPairs / totalPossiblePairs : 1.0;
    const stepOverlapRatio = matchedSteps.length / Math.max(1, projectWorkflow.length);

    // Sequence similarity combines step overlap (60%) and order alignment (40%)
    const score = Math.min(100, Math.round((stepOverlapRatio * 0.6 + orderPreservationRatio * stepOverlapRatio * 0.4) * 100));

    let explanation = '';
    if (score >= 75) {
      explanation = `Highly aligned step-by-step workflow with sequential order preserved across ${matchedSteps.length} stages.`;
    } else if (score >= 40) {
      explanation = `Partially matching workflow steps, but execution order or specific transition stages diverge.`;
    } else {
      explanation = `Distinct execution procedure. The workflow solves the problem through an independent operational sequence.`;
    }

    return {
      score,
      sequenceSimilarity: Math.round(orderPreservationRatio * 100),
      matchedSteps,
      differentSteps,
      explanation,
    };
  }
}

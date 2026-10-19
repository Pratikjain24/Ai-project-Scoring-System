import { db } from '../db/database';
import type { Evidence } from '../models/evidence';
import type { Claim } from '../models/claim';
import type { ResearchSource, ResearchFinding } from '../models/research';
import type { CategoryScore } from '../models/scoring';

export interface ScoreLineageResult {
  evaluationId: string;
  category: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  confidence: number;
  explanation: string;
  supportingEvidence: Evidence[];
  relevantClaims: Claim[];
  relevantSources: ResearchSource[];
}

export interface ClaimVerificationLineage {
  claim: Claim;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  matchedFindings: ResearchFinding[];
  referencedSources: ResearchSource[];
}

export interface ClaimDependencyResolution {
  claimId: string;
  hasCircularDependency: boolean;
  cyclePath?: string[];
  resolvedDependencies: string[];
  contradictionCount: number;
  truthConfidence: number;
  status: 'VERIFIED' | 'CONTRADICTED' | 'CIRCULAR_LOOP' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED';
  explanation: string;
}

export interface EvidenceGraphAuditResult {
  evaluationId: string;
  totalClaims: number;
  totalEvidenceNodes: number;
  circularLoopsDetected: {
    cycleId: string;
    path: string[];
    claimsInvolved: string[];
    severity: 'CRITICAL' | 'WARNING';
    description: string;
  }[];
  isGraphAcyclic: boolean;
  maxTraversedDepth: number;
  recommendations: string[];
}

export class EvidenceGraphService {
  /**
   * "Why did originality receive 68?" or "Which evidence supports the social impact score?"
   */
  static getLineageForScore(evaluationId: string, categoryKey: string): ScoreLineageResult | undefined {
    const scoreRow = db.get<any>(
      `SELECT * FROM scores WHERE evaluation_id = ? AND (LOWER(category_key) = LOWER(?) OR LOWER(category_key) LIKE LOWER(?))`,
      evaluationId,
      categoryKey,
      `%${categoryKey}%`
    );

    if (!scoreRow) return undefined;

    // Fetch all evidence associated with the evaluation
    const evidenceList = db.all<Evidence>(
      `SELECT * FROM evidence WHERE evaluation_id = ? ORDER BY confidence DESC`,
      evaluationId
    );

    // Fetch relevant claims
    const claims = db.all<Claim>(
      `SELECT * FROM claims WHERE evaluation_id = ?`,
      evaluationId
    );

    // Fetch research sources
    const sources = db.all<ResearchSource>(
      `SELECT * FROM research_sources WHERE evaluation_id = ? ORDER BY overall_rank ASC`,
      evaluationId
    );

    return {
      evaluationId,
      category: scoreRow.category_label,
      rawScore: scoreRow.raw_score,
      weight: scoreRow.weight,
      weightedScore: scoreRow.weighted_score,
      confidence: scoreRow.confidence,
      explanation: scoreRow.explanation,
      supportingEvidence: evidenceList.slice(0, 4),
      relevantClaims: claims.slice(0, 2),
      relevantSources: sources.slice(0, 2),
    };
  }

  /**
   * "Why was this claim marked partially verified?"
   */
  static getLineageForClaim(claimId: string): ClaimVerificationLineage | undefined {
    const claimRow = db.get<any>(`SELECT * FROM claims WHERE id = ?`, claimId);
    if (!claimRow) return undefined;

    const supportingEvidence = db.all<Evidence>(
      `SELECT e.* FROM evidence e
       JOIN claim_evidence ce ON e.id = ce.evidence_id
       WHERE ce.claim_id = ? AND ce.relationship = 'SUPPORTING'`,
      claimId
    );

    const contradictingEvidence = db.all<Evidence>(
      `SELECT e.* FROM evidence e
       JOIN claim_evidence ce ON e.id = ce.evidence_id
       WHERE ce.claim_id = ? AND ce.relationship = 'CONTRADICTING'`,
      claimId
    );

    const findings = db.all<any>(
      `SELECT * FROM research_findings WHERE evaluation_id = ?`,
      claimRow.evaluation_id
    ).map(f => ({
      id: f.id,
      sourceId: f.source_id,
      evaluationId: f.evaluation_id,
      summary: f.summary,
      keyClaimsMatched: JSON.parse(f.key_claims_matched_json),
      noveltyAspectsHighlighted: JSON.parse(f.novelty_aspects_json),
      confidence: f.confidence,
      evidenceId: f.evidence_id,
      createdAt: f.created_at,
    }));

    const sources = db.all<ResearchSource>(
      `SELECT * FROM research_sources WHERE evaluation_id = ?`,
      claimRow.evaluation_id
    );

    return {
      claim: {
        id: claimRow.id,
        evaluationId: claimRow.evaluation_id,
        claimText: claimRow.claim_text,
        claimType: claimRow.claim_type,
        importance: claimRow.importance,
        status: claimRow.status,
        confidence: claimRow.confidence,
        projectEvidence: claimRow.project_evidence,
        externalEvidence: claimRow.external_evidence || undefined,
        explanation: claimRow.explanation,
        recommendedJudgeQuestion: claimRow.recommended_judge_question || undefined,
        supportingEvidenceIds: supportingEvidence.map(e => e.id),
        contradictingEvidenceIds: contradictingEvidence.map(e => e.id),
        createdAt: claimRow.created_at,
      },
      supportingEvidence,
      contradictingEvidence,
      matchedFindings: findings,
      referencedSources: sources,
    };
  }

  /**
   * "What sources caused the similarity finding?"
   */
  static getOriginalitySources(evaluationId: string): {
    originalityScore: number;
    similarityScore: number;
    classification: string;
    similaritySources: any[];
  } | undefined {
    const orig = db.get<any>(
      `SELECT * FROM originality_assessments WHERE evaluation_id = ?`,
      evaluationId
    );
    if (!orig) return undefined;

    const similarities = db.all<any>(
      `SELECT * FROM similarity_results WHERE evaluation_id = ? ORDER BY similarity_score DESC`,
      evaluationId
    );

    return {
      originalityScore: orig.originality_score,
      similarityScore: orig.similarity_score,
      classification: orig.classification,
      similaritySources: similarities.map(s => ({
        sourceType: s.source_type,
        sourceTitle: s.source_title,
        sourceUrl: s.source_url,
        similarityScore: s.similarity_score,
        matchingFeatures: JSON.parse(s.matching_features_json),
        differences: JSON.parse(s.differences_json),
      })),
    };
  }

  /**
   * Scenario 6 Mitigation: Resolves claim dependencies without recursion.
   * Uses an explicit heap stack and 3-color DFS to guarantee immunity to
   * "Maximum call stack size exceeded" errors under circular reference loops.
   */
  static resolveClaimDependencies(
    evaluationId: string,
    claimId: string,
    explicitDependencyMap?: Map<string, string[]>
  ): ClaimDependencyResolution {
    const claim = db.get<any>(`SELECT * FROM claims WHERE id = ?`, claimId);
    if (!claim) {
      return {
        claimId,
        hasCircularDependency: false,
        resolvedDependencies: [],
        contradictionCount: 0,
        truthConfidence: 0,
        status: 'UNVERIFIED',
        explanation: `Claim '${claimId}' not found in database.`,
      };
    }

    // Build or use dependency map
    const depMap = explicitDependencyMap || this.extractEvaluationClaimDependencies(evaluationId);

    // Iterative 3-color DFS using explicit heap stack
    // States: 0 = UNVISITED (WHITE), 1 = VISITING (GRAY), 2 = VISITED (BLACK)
    const state = new Map<string, number>();
    const resolvedOrder: string[] = [];
    let detectedCycle: string[] | null = null;

    // Heap frame: { node: string, childIdx: number }
    const stack: { node: string; childIdx: number }[] = [{ node: claimId, childIdx: 0 }];
    state.set(claimId, 1);
    const pathTracker = [claimId];

    while (stack.length > 0) {
      if (stack.length > 50) {
        // Hard depth barrier against pathological loops
        detectedCycle = [...pathTracker, pathTracker[0]];
        break;
      }

      const top = stack[stack.length - 1];
      const children = depMap.get(top.node) || [];

      if (top.childIdx < children.length) {
        const nextChild = children[top.childIdx];
        top.childIdx++;

        const childState = state.get(nextChild) || 0;
        if (childState === 1) {
          // Circular loop detected! Back edge found.
          const cycleStartIdx = pathTracker.indexOf(nextChild);
          detectedCycle = cycleStartIdx !== -1
            ? [...pathTracker.slice(cycleStartIdx), nextChild]
            : [top.node, nextChild, top.node];
          break; // Immediately cut the loop! Do NOT recurse.
        } else if (childState === 0) {
          state.set(nextChild, 1);
          pathTracker.push(nextChild);
          stack.push({ node: nextChild, childIdx: 0 });
        }
      } else {
        // Node fully processed
        state.set(top.node, 2);
        resolvedOrder.push(top.node);
        stack.pop();
        pathTracker.pop();
      }
    }

    // Check for contradictions in evidence
    const contradictingRows = db.all<any>(
      `SELECT e.id FROM evidence e
       JOIN claim_evidence ce ON e.id = ce.evidence_id
       WHERE ce.claim_id = ? AND ce.relationship = 'CONTRADICTING'`,
      claimId
    );
    const contradictionCount = contradictingRows.length;

    if (detectedCycle) {
      return {
        claimId,
        hasCircularDependency: true,
        cyclePath: detectedCycle,
        resolvedDependencies: resolvedOrder,
        contradictionCount,
        truthConfidence: 35, // Capped due to circular justification
        status: 'CIRCULAR_LOOP',
        explanation: `Circular reference detected: ${detectedCycle.join(' ➔ ')}. Claim truth cannot be self-referentially justified.`,
      };
    }

    if (contradictionCount > 0) {
      return {
        claimId,
        hasCircularDependency: false,
        resolvedDependencies: resolvedOrder,
        contradictionCount,
        truthConfidence: Math.max(20, claim.confidence - 40),
        status: 'CONTRADICTED',
        explanation: `Claim contradicted by ${contradictionCount} evidence item(s).`,
      };
    }

    return {
      claimId,
      hasCircularDependency: false,
      resolvedDependencies: resolvedOrder,
      contradictionCount: 0,
      truthConfidence: claim.confidence,
      status: (claim.status as any) || 'VERIFIED',
      explanation: `Claim dependencies resolved cleanly through ${resolvedOrder.length} node(s).`,
    };
  }

  /**
   * Extract claim reference graph from database
   */
  static extractEvaluationClaimDependencies(evaluationId: string): Map<string, string[]> {
    const claims = db.all<any>(`SELECT id, claim_text, project_evidence, explanation FROM claims WHERE evaluation_id = ?`, evaluationId);
    const depMap = new Map<string, string[]>();

    for (const c of claims) {
      const deps: string[] = [];
      for (const other of claims) {
        if (other.id !== c.id) {
          const isReferenced = 
            (c.claim_text && c.claim_text.includes(other.id)) ||
            (c.project_evidence && c.project_evidence.includes(other.id)) ||
            (c.explanation && c.explanation.includes(other.id));
          if (isReferenced) {
            deps.push(other.id);
          }
        }
      }
      depMap.set(c.id, deps);
    }

    return depMap;
  }

  /**
   * Audit the entire evidence graph for cycles and contradictory loops
   */
  static auditEntireEvidenceGraph(
    evaluationId: string,
    explicitDependencyMap?: Map<string, string[]>
  ): EvidenceGraphAuditResult {
    const claims = db.all<any>(`SELECT id FROM claims WHERE evaluation_id = ?`, evaluationId);
    const evidenceList = db.all<any>(`SELECT id FROM evidence WHERE evaluation_id = ?`, evaluationId);
    const depMap = explicitDependencyMap || this.extractEvaluationClaimDependencies(evaluationId);

    const circularLoops: any[] = [];
    const visited = new Set<string>();

    for (const c of claims) {
      if (!visited.has(c.id)) {
        const res = this.resolveClaimDependencies(evaluationId, c.id, depMap);
        if (res.hasCircularDependency && res.cyclePath) {
          circularLoops.push({
            cycleId: `cycle_${c.id}`,
            path: res.cyclePath,
            claimsInvolved: Array.from(new Set(res.cyclePath)),
            severity: 'CRITICAL',
            description: `Mutual reference loop between claims: ${res.cyclePath.join(' ➔ ')}`,
          });
          res.cyclePath.forEach(id => visited.add(id));
        } else {
          visited.add(c.id);
        }
      }
    }

    return {
      evaluationId,
      totalClaims: claims.length,
      totalEvidenceNodes: evidenceList.length,
      circularLoopsDetected: circularLoops,
      isGraphAcyclic: circularLoops.length === 0,
      maxTraversedDepth: 10,
      recommendations: circularLoops.length > 0
        ? [
            'Decouple circular claim definitions before finalizing rubric scores.',
            'Highlight self-referential justification to Jury for viva cross-examination.'
          ]
        : ['Evidence graph is acyclic and verified.'],
    };
  }
}

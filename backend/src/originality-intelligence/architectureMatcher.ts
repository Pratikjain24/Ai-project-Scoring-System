/**
 * Architecture Matcher
 * Performs graph and pipeline matching across system architectural nodes and relationships.
 */

export interface ArchitectureGraph {
  nodes?: string[];
  pipeline?: string[];
  relationships?: Array<{ from: string; to: string; type?: string }>;
}

export interface ArchitectureMatchResult {
  score: number; // 0 - 100
  matchingNodes: string[];
  uniqueProjectNodes: string[];
  uniqueCandidateNodes: string[];
  matchingRelationships: Array<{ from: string; to: string; type?: string }>;
  uniqueProjectRelationships: Array<{ from: string; to: string; type?: string }>;
  explanation: string;
}

export class ArchitectureMatcher {
  private static normalize(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  static compare(projectArch: ArchitectureGraph, candidateArch: ArchitectureGraph): ArchitectureMatchResult {
    const projNodes = (projectArch.nodes || projectArch.pipeline || []).map(n => n.trim());
    const candNodes = (candidateArch.nodes || candidateArch.pipeline || []).map(n => n.trim());

    const projNormNodes = projNodes.map(n => ({ raw: n, norm: this.normalize(n) }));
    const candNormNodes = candNodes.map(n => ({ raw: n, norm: this.normalize(n) }));

    const matchingNodes: string[] = [];
    const matchedProjNorms = new Set<string>();
    const matchedCandNorms = new Set<string>();

    for (const p of projNormNodes) {
      const match = candNormNodes.find(
        c => !matchedCandNorms.has(c.norm) && (c.norm === p.norm || c.norm.includes(p.norm) || p.norm.includes(c.norm))
      );
      if (match) {
        matchingNodes.push(p.raw);
        matchedProjNorms.add(p.norm);
        matchedCandNorms.add(match.norm);
      }
    }

    const uniqueProjectNodes = projNormNodes.filter(p => !matchedProjNorms.has(p.norm)).map(p => p.raw);
    const uniqueCandidateNodes = candNormNodes.filter(c => !matchedCandNorms.has(c.norm)).map(c => c.raw);

    // Compare relationships / pipeline transitions
    const projRels = projectArch.relationships || [];
    const candRels = candidateArch.relationships || [];

    // Fallback: build implicit pipeline edges if relationships are empty but pipeline exists
    const effectiveProjRels = projRels.length > 0 ? projRels : this.buildPipelineEdges(projNodes);
    const effectiveCandRels = candRels.length > 0 ? candRels : this.buildPipelineEdges(candNodes);

    const matchingRelationships: Array<{ from: string; to: string; type?: string }> = [];
    const matchedProjRelIndices = new Set<number>();

    for (let i = 0; i < effectiveProjRels.length; i++) {
      const pr = effectiveProjRels[i];
      const prFromNorm = this.normalize(pr.from);
      const prToNorm = this.normalize(pr.to);

      const match = effectiveCandRels.find(cr => {
        const crFromNorm = this.normalize(cr.from);
        const crToNorm = this.normalize(cr.to);
        return (
          (crFromNorm === prFromNorm || crFromNorm.includes(prFromNorm) || prFromNorm.includes(crFromNorm)) &&
          (crToNorm === prToNorm || crToNorm.includes(crToNorm) || prToNorm.includes(crToNorm))
        );
      });

      if (match) {
        matchingRelationships.push(pr);
        matchedProjRelIndices.add(i);
      }
    }

    const uniqueProjectRelationships = effectiveProjRels.filter((_, idx) => !matchedProjRelIndices.has(idx));

    // Calculate structural graph score
    const totalNodes = Math.max(1, projNodes.length);
    const nodeOverlapRatio = matchingNodes.length / totalNodes;

    const totalRels = Math.max(1, effectiveProjRels.length);
    const relOverlapRatio = effectiveProjRels.length > 0 ? matchingRelationships.length / totalRels : nodeOverlapRatio;

    // Architecture structural similarity gives 40% weight to nodes and 60% weight to relationships
    const score = Math.min(100, Math.round((nodeOverlapRatio * 0.4 + relOverlapRatio * 0.6) * 100));

    let explanation = '';
    if (score >= 75) {
      explanation = `High structural similarity detected across ${matchingNodes.length} components and ${matchingRelationships.length} data pipeline transitions.`;
    } else if (score >= 40) {
      explanation = `Moderate architectural commonality in core pipeline, but ${uniqueProjectNodes.length} unique nodes differentiate project structure.`;
    } else {
      explanation = `Distinct system topology. Divergent processing components and integration mechanisms.`;
    }

    return {
      score,
      matchingNodes,
      uniqueProjectNodes,
      uniqueCandidateNodes,
      matchingRelationships,
      uniqueProjectRelationships,
      explanation,
    };
  }

  private static buildPipelineEdges(nodes: string[]): Array<{ from: string; to: string }> {
    const edges: Array<{ from: string; to: string }> = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({ from: nodes[i], to: nodes[i + 1] });
    }
    return edges;
  }
}

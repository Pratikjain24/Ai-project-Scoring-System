import { db } from '../db/database';
import type {
  SimilarityCandidate,
  OriginalityProfile,
  DimensionAnalysis,
  UniqueContribution,
  CandidateTimelineContext,
  SimilarityGraphEdge,
  ComparisonTableRow,
  OriginalityBundle,
  DEFAULT_DIMENSION_WEIGHTS,
} from '../models/originalityIntelligence';

export class OriginalityIntelligenceRepository {
  // ==========================================
  // CANDIDATES
  // ==========================================

  static createCandidate(c: SimilarityCandidate): SimilarityCandidate {
    let validEvalId = c.evaluationId;
    const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, c.evaluationId);
    if (!evalExists) {
      const anyEval = db.get<any>(`SELECT id FROM evaluations LIMIT 1`);
      if (anyEval) validEvalId = anyEval.id;
    }

    db.run(
      `INSERT INTO similarity_candidates (
        id, evaluation_id, source_id, candidate_type, title, organization, description,
        url, publication_date, content, features_json, technologies_json,
        architecture_json, workflow_json, confidence, relevance_score, source_group_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        organization = excluded.organization,
        description = excluded.description,
        url = excluded.url,
        publication_date = excluded.publication_date,
        content = excluded.content,
        features_json = excluded.features_json,
        technologies_json = excluded.technologies_json,
        architecture_json = excluded.architecture_json,
        workflow_json = excluded.workflow_json,
        confidence = excluded.confidence,
        relevance_score = excluded.relevance_score,
        source_group_id = excluded.source_group_id`,
      c.id,
      validEvalId,
      c.sourceId || null,
      c.candidateType,
      c.title,
      c.organization || null,
      c.description,
      c.url || null,
      c.publicationDate || null,
      c.content || null,
      JSON.stringify(c.features || []),
      JSON.stringify(c.technologies || []),
      JSON.stringify(c.architecture || {}),
      JSON.stringify(c.workflow || []),
      c.confidence ?? 1.0,
      c.relevanceScore ?? 1.0,
      c.sourceGroupId || null
    );

    return c;
  }

  static getCandidatesByEvaluation(evaluationId: string): SimilarityCandidate[] {
    const rows = db.all<any>(
      `SELECT * FROM similarity_candidates WHERE evaluation_id = ? ORDER BY relevance_score DESC`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      sourceId: r.source_id,
      candidateType: r.candidate_type,
      title: r.title,
      organization: r.organization,
      description: r.description,
      url: r.url,
      publicationDate: r.publication_date,
      content: r.content,
      features: JSON.parse(r.features_json || '[]'),
      technologies: JSON.parse(r.technologies_json || '[]'),
      architecture: JSON.parse(r.architecture_json || '{}'),
      workflow: JSON.parse(r.workflow_json || '[]'),
      confidence: r.confidence,
      relevanceScore: r.relevance_score,
      sourceGroupId: r.source_group_id,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // ORIGINALITY PROFILE
  // ==========================================

  static upsertProfile(p: OriginalityProfile): OriginalityProfile {
    let validEvalId = p.evaluationId;
    const evalExists = db.get<any>(`SELECT id FROM evaluations WHERE id = ?`, p.evaluationId);
    if (!evalExists) {
      const anyEval = db.get<any>(`SELECT id FROM evaluations LIMIT 1`);
      if (anyEval) validEvalId = anyEval.id;
    }

    db.run(
      `INSERT INTO originality_profiles (
        id, evaluation_id, overall_originality_score, overall_similarity_score,
        confidence, classification, dimension_weights_json, explanation, status,
        available_evidence_json, missing_evidence_json, recommended_evidence_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(evaluation_id) DO UPDATE SET
        overall_originality_score = excluded.overall_originality_score,
        overall_similarity_score = excluded.overall_similarity_score,
        confidence = excluded.confidence,
        classification = excluded.classification,
        dimension_weights_json = excluded.dimension_weights_json,
        explanation = excluded.explanation,
        status = excluded.status,
        available_evidence_json = excluded.available_evidence_json,
        missing_evidence_json = excluded.missing_evidence_json,
        recommended_evidence_json = excluded.recommended_evidence_json,
        updated_at = CURRENT_TIMESTAMP`,
      p.id,
      validEvalId,
      p.overallOriginalityScore,
      p.overallSimilarityScore,
      p.confidence,
      p.classification,
      JSON.stringify(p.dimensionWeights),
      p.explanation,
      p.status,
      JSON.stringify(p.availableEvidence || []),
      JSON.stringify(p.missingEvidence || []),
      JSON.stringify(p.recommendedEvidence || [])
    );

    return p;
  }

  static getProfileByEvaluation(evaluationId: string): OriginalityProfile | null {
    const r = db.get<any>(
      `SELECT * FROM originality_profiles WHERE evaluation_id = ?`,
      evaluationId
    );
    if (!r) return null;
    return {
      id: r.id,
      evaluationId: r.evaluation_id,
      overallOriginalityScore: r.overall_originality_score,
      overallSimilarityScore: r.overall_similarity_score,
      confidence: r.confidence,
      classification: r.classification,
      dimensionWeights: JSON.parse(r.dimension_weights_json || '{}'),
      explanation: r.explanation,
      status: r.status,
      availableEvidence: JSON.parse(r.available_evidence_json || '[]'),
      missingEvidence: JSON.parse(r.missing_evidence_json || '[]'),
      recommendedEvidence: JSON.parse(r.recommended_evidence_json || '[]'),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  // ==========================================
  // DIMENSION ANALYSES
  // ==========================================

  static createDimensionAnalysis(d: DimensionAnalysis): DimensionAnalysis {
    db.run(
      `INSERT INTO dimension_analyses (
        id, originality_profile_id, candidate_id, dimension, score, confidence,
        matched_elements_json, different_elements_json, evidence_ids_json, explanation, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        score = excluded.score,
        confidence = excluded.confidence,
        matched_elements_json = excluded.matched_elements_json,
        different_elements_json = excluded.different_elements_json,
        evidence_ids_json = excluded.evidence_ids_json,
        explanation = excluded.explanation`,
      d.id,
      d.originalityProfileId,
      d.candidateId || null,
      d.dimension,
      d.score,
      d.confidence,
      JSON.stringify(d.matchedElements || []),
      JSON.stringify(d.differentElements || []),
      JSON.stringify(d.evidenceIds || []),
      d.explanation
    );
    return d;
  }

  static getDimensionsByProfile(profileId: string): DimensionAnalysis[] {
    const rows = db.all<any>(
      `SELECT * FROM dimension_analyses WHERE originality_profile_id = ? AND candidate_id IS NULL`,
      profileId
    );
    return rows.map(r => ({
      id: r.id,
      originalityProfileId: r.originality_profile_id,
      candidateId: r.candidate_id,
      dimension: r.dimension,
      score: r.score,
      confidence: r.confidence,
      matchedElements: JSON.parse(r.matched_elements_json || '[]'),
      differentElements: JSON.parse(r.different_elements_json || '[]'),
      evidenceIds: JSON.parse(r.evidence_ids_json || '[]'),
      explanation: r.explanation,
      createdAt: r.created_at,
    }));
  }

  static getDimensionsByCandidate(candidateId: string): DimensionAnalysis[] {
    const rows = db.all<any>(
      `SELECT * FROM dimension_analyses WHERE candidate_id = ?`,
      candidateId
    );
    return rows.map(r => ({
      id: r.id,
      originalityProfileId: r.originality_profile_id,
      candidateId: r.candidate_id,
      dimension: r.dimension,
      score: r.score,
      confidence: r.confidence,
      matchedElements: JSON.parse(r.matched_elements_json || '[]'),
      differentElements: JSON.parse(r.different_elements_json || '[]'),
      evidenceIds: JSON.parse(r.evidence_ids_json || '[]'),
      explanation: r.explanation,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // UNIQUE CONTRIBUTIONS
  // ==========================================

  static createUniqueContribution(u: UniqueContribution): UniqueContribution {
    db.run(
      `INSERT INTO unique_contributions (
        id, evaluation_id, description, contribution_type, importance, confidence, evidence_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        description = excluded.description,
        contribution_type = excluded.contribution_type,
        importance = excluded.importance,
        confidence = excluded.confidence,
        evidence_ids_json = excluded.evidence_ids_json`,
      u.id,
      u.evaluationId,
      u.description,
      u.contributionType,
      u.importance,
      u.confidence,
      JSON.stringify(u.evidenceIds || [])
    );
    return u;
  }

  static getUniqueContributions(evaluationId: string): UniqueContribution[] {
    const rows = db.all<any>(
      `SELECT * FROM unique_contributions WHERE evaluation_id = ? ORDER BY CASE importance WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      description: r.description,
      contributionType: r.contribution_type,
      importance: r.importance,
      confidence: r.confidence,
      evidenceIds: JSON.parse(r.evidence_ids_json || '[]'),
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // TIMELINE CONTEXTS
  // ==========================================

  static createTimelineContext(t: CandidateTimelineContext): CandidateTimelineContext {
    db.run(
      `INSERT INTO candidate_timeline_contexts (
        id, evaluation_id, candidate_id, candidate_date, project_evidence_date, relationship, confidence, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        candidate_date = excluded.candidate_date,
        project_evidence_date = excluded.project_evidence_date,
        relationship = excluded.relationship,
        confidence = excluded.confidence,
        notes = excluded.notes`,
      t.id,
      t.evaluationId,
      t.candidateId,
      t.candidateDate || null,
      t.projectEvidenceDate || null,
      t.relationship,
      t.confidence,
      t.notes || null
    );
    return t;
  }

  static getTimelineContexts(evaluationId: string): CandidateTimelineContext[] {
    const rows = db.all<any>(
      `SELECT * FROM candidate_timeline_contexts WHERE evaluation_id = ?`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      candidateId: r.candidate_id,
      candidateDate: r.candidate_date,
      projectEvidenceDate: r.project_evidence_date,
      relationship: r.relationship,
      confidence: r.confidence,
      notes: r.notes,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // GRAPH EDGES
  // ==========================================

  static createGraphEdge(edge: SimilarityGraphEdge): SimilarityGraphEdge {
    db.run(
      `INSERT INTO similarity_graph_edges (
        id, evaluation_id, source_node, target_node, dimension, similarity_type,
        similarity_score, differences_summary, evidence_id, candidate_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        similarity_score = excluded.similarity_score,
        differences_summary = excluded.differences_summary`,
      edge.id,
      edge.evaluationId,
      edge.sourceNode,
      edge.targetNode,
      edge.dimension,
      edge.similarityType,
      edge.similarityScore,
      edge.differencesSummary || null,
      edge.evidenceId || null,
      edge.candidateId || null
    );
    return edge;
  }

  static getGraphEdges(evaluationId: string): SimilarityGraphEdge[] {
    const rows = db.all<any>(
      `SELECT * FROM similarity_graph_edges WHERE evaluation_id = ?`,
      evaluationId
    );
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      sourceNode: r.source_node,
      targetNode: r.target_node,
      dimension: r.dimension,
      similarityType: r.similarity_type,
      similarityScore: r.similarity_score,
      differencesSummary: r.differences_summary,
      evidenceId: r.evidence_id,
      candidateId: r.candidate_id,
      createdAt: r.created_at,
    }));
  }

  // ==========================================
  // FULL BUNDLE
  // ==========================================

  static getBundle(evaluationId: string): OriginalityBundle | null {
    const profile = this.getProfileByEvaluation(evaluationId);
    if (!profile) return null;

    const dimensions = this.getDimensionsByProfile(profile.id);
    const candidates = this.getCandidatesByEvaluation(evaluationId);
    const contributions = this.getUniqueContributions(evaluationId);
    const timelineContexts = this.getTimelineContexts(evaluationId);
    const graphEdges = this.getGraphEdges(evaluationId);

    const candidateDimensions: Record<string, DimensionAnalysis[]> = {};
    const comparisonTable: ComparisonTableRow[] = [];

    for (const c of candidates) {
      const cDims = this.getDimensionsByCandidate(c.id);
      candidateDimensions[c.id] = cDims;

      const probDim = cDims.find(d => d.dimension === 'PROBLEM');
      const techDim = cDims.find(d => d.dimension === 'TECHNOLOGY');
      const archDim = cDims.find(d => d.dimension === 'ARCHITECTURE');
      const featDim = cDims.find(d => d.dimension === 'FEATURE');

      // Calculate candidate overall weighted similarity
      let weightedSum = 0;
      let totalWeight = 0;
      for (const d of cDims) {
        const w = (profile.dimensionWeights as any)[d.dimension] ?? 0.1;
        weightedSum += d.score * w;
        totalWeight += w;
      }
      const overallSim = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

      const diffs: string[] = [];
      const evIds: string[] = [];
      for (const d of cDims) {
        if (d.differentElements && d.differentElements.length > 0) {
          diffs.push(...d.differentElements.slice(0, 2));
        }
        if (d.evidenceIds && d.evidenceIds.length > 0) {
          evIds.push(...d.evidenceIds);
        }
      }

      let sourceQuality: any = 'MODERATE';
      if (c.confidence >= 0.85) sourceQuality = 'VERY_STRONG';
      else if (c.confidence >= 0.70) sourceQuality = 'STRONG';
      else if (c.confidence < 0.40) sourceQuality = 'WEAK';

      comparisonTable.push({
        candidateId: c.id,
        title: c.title,
        candidateType: c.candidateType,
        organization: c.organization,
        url: c.url,
        publicationDate: c.publicationDate,
        sourceQuality,
        problemScore: probDim ? probDim.score : 0,
        technologyScore: techDim ? techDim.score : 0,
        architectureScore: archDim ? archDim.score : 0,
        featureScore: featDim ? featDim.score : 0,
        overallSimilarity: overallSim,
        differencesSummary: Array.from(new Set(diffs)),
        keyEvidenceIds: Array.from(new Set(evIds)),
      });
    }

    return {
      profile,
      dimensions,
      candidates,
      candidateDimensions,
      contributions,
      timelineContexts,
      graphEdges,
      comparisonTable,
    };
  }

  static clearEvaluation(evaluationId: string) {
    db.run(`DELETE FROM similarity_graph_edges WHERE evaluation_id = ?`, evaluationId);
    db.run(`DELETE FROM candidate_timeline_contexts WHERE evaluation_id = ?`, evaluationId);
    db.run(`DELETE FROM unique_contributions WHERE evaluation_id = ?`, evaluationId);
    db.run(`DELETE FROM similarity_candidates WHERE evaluation_id = ?`, evaluationId);
    db.run(`DELETE FROM originality_profiles WHERE evaluation_id = ?`, evaluationId);
  }
}

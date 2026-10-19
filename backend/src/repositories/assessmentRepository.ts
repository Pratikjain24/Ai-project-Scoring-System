import { db } from '../db/database';
import type {
  ProjectDNA,
  TechnicalAssessment,
  OriginalityAssessment,
  SimilarityResult,
  ImpactAssessment,
  FeasibilityAssessment,
} from '../models/assessments';
import type { PresentationAnalysis, DemoAnalysis } from '../models/presentation';
import type { CategoryScore, Risk, Recommendation, JudgeQuestion } from '../models/scoring';
import type { EvaluationReport } from '../models/report';

export class AssessmentRepository {
  // 1. Project DNA
  static saveProjectDNA(dna: ProjectDNA): void {
    db.run(
      `INSERT OR REPLACE INTO project_dna (
        id, evaluation_id, problem, solution, domain, target_users_json,
        inputs_json, outputs_json, technologies_json, features_json, claimed_benefits_json,
        architecture, confidence, evidence_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      dna.id || `dna_${dna.evaluationId}`,
      dna.evaluationId,
      dna.problem,
      dna.solution,
      dna.domain,
      JSON.stringify(dna.targetUsers),
      JSON.stringify(dna.inputs),
      JSON.stringify(dna.outputs),
      JSON.stringify(dna.technologies),
      JSON.stringify(dna.features),
      JSON.stringify(dna.claimedBenefits),
      dna.architecture,
      dna.confidence,
      JSON.stringify(dna.evidenceIds || []),
      dna.createdAt || new Date().toISOString()
    );
  }

  static getProjectDNA(evaluationId: string): ProjectDNA | undefined {
    const row = db.get<any>(`SELECT * FROM project_dna WHERE evaluation_id = ?`, evaluationId);
    if (!row) return undefined;
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      problem: row.problem,
      solution: row.solution,
      domain: row.domain,
      targetUsers: JSON.parse(row.target_users_json),
      inputs: JSON.parse(row.inputs_json),
      outputs: JSON.parse(row.outputs_json),
      technologies: JSON.parse(row.technologies_json),
      features: JSON.parse(row.features_json),
      claimedBenefits: JSON.parse(row.claimed_benefits_json),
      architecture: row.architecture,
      confidence: row.confidence,
      evidenceIds: row.evidence_ids_json ? JSON.parse(row.evidence_ids_json) : [],
      createdAt: row.created_at,
    };
  }

  // 2. Technical Assessments
  static saveTechnicalAssessments(assessments: TechnicalAssessment[]): void {
    db.transaction(() => {
      for (const a of assessments) {
        db.run(
          `INSERT OR REPLACE INTO technical_assessments (
            id, evaluation_id, architecture_type, category, score, confidence,
            evidence_count, strengths_json, weaknesses_json, risks_json, explanation, evidence_ids_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          a.id,
          a.evaluationId,
          a.architectureType,
          a.category,
          a.score,
          a.confidence,
          a.evidenceCount,
          JSON.stringify(a.strengths),
          JSON.stringify(a.weaknesses),
          JSON.stringify(a.risks),
          a.explanation,
          JSON.stringify(a.evidenceIds || []),
          a.createdAt || new Date().toISOString()
        );
      }
    });
  }

  static getTechnicalAssessments(evaluationId: string): TechnicalAssessment[] {
    const rows = db.all<any>(`SELECT * FROM technical_assessments WHERE evaluation_id = ?`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      architectureType: r.architecture_type,
      category: r.category,
      score: r.score,
      confidence: r.confidence,
      evidenceCount: r.evidence_count,
      strengths: JSON.parse(r.strengths_json),
      weaknesses: JSON.parse(r.weaknesses_json),
      risks: JSON.parse(r.risks_json),
      explanation: r.explanation,
      evidenceIds: r.evidence_ids_json ? JSON.parse(r.evidence_ids_json) : [],
      createdAt: r.created_at,
    }));
  }

  // 3. Originality Assessment & Similarity Results
  static saveOriginalityAssessment(orig: OriginalityAssessment): void {
    db.transaction(() => {
      db.run(
        `INSERT OR REPLACE INTO originality_assessments (
          id, evaluation_id, originality_score, similarity_score, confidence,
          classification, key_differences_json, evidence_ids_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        orig.id,
        orig.evaluationId,
        orig.originalityScore,
        orig.similarityScore,
        orig.confidence,
        orig.classification,
        JSON.stringify(orig.keyDifferences),
        JSON.stringify(orig.evidenceIds || []),
        orig.createdAt || new Date().toISOString()
      );

      if (orig.similarities && orig.similarities.length > 0) {
        for (const sim of orig.similarities) {
          db.run(
            `INSERT INTO similarity_results (
              id, evaluation_id, source_type, source_title, source_url,
              similarity_score, matching_features_json, differences_json, evidence_ids_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            sim.id,
            orig.evaluationId,
            sim.sourceType,
            sim.sourceTitle,
            sim.sourceUrl || null,
            sim.similarityScore,
            JSON.stringify(sim.matchingFeatures),
            JSON.stringify(sim.differences),
            JSON.stringify(sim.evidenceIds || [])
          );
        }
      }
    });
  }

  static getOriginalityAssessment(evaluationId: string): OriginalityAssessment | undefined {
    const row = db.get<any>(`SELECT * FROM originality_assessments WHERE evaluation_id = ?`, evaluationId);
    if (!row) return undefined;

    const simRows = db.all<any>(`SELECT * FROM similarity_results WHERE evaluation_id = ?`, evaluationId);
    const similarities: SimilarityResult[] = simRows.map(s => ({
      id: s.id,
      evaluationId: s.evaluation_id,
      sourceType: s.source_type,
      sourceTitle: s.source_title,
      sourceUrl: s.source_url || undefined,
      similarityScore: s.similarity_score,
      matchingFeatures: JSON.parse(s.matching_features_json),
      differences: JSON.parse(s.differences_json),
      evidenceIds: s.evidence_ids_json ? JSON.parse(s.evidence_ids_json) : [],
    }));

    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      originalityScore: row.originality_score,
      similarityScore: row.similarity_score,
      confidence: row.confidence,
      classification: row.classification,
      similarities,
      keyDifferences: JSON.parse(row.key_differences_json),
      evidenceIds: row.evidence_ids_json ? JSON.parse(row.evidence_ids_json) : [],
      createdAt: row.created_at,
    };
  }

  // 4. Impact Assessment
  static saveImpactAssessment(impact: ImpactAssessment): void {
    db.run(
      `INSERT OR REPLACE INTO impact_assessments (
        id, evaluation_id, social_impact_score, economic_impact_score, environmental_impact_score,
        accessibility_score, public_benefit_score, composite_score, confidence, details_json, evidence_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      impact.id,
      impact.evaluationId,
      impact.socialImpactScore,
      impact.economicImpactScore,
      impact.environmentalImpactScore,
      impact.accessibilityScore,
      impact.publicBenefitScore,
      impact.compositeScore,
      impact.confidence,
      JSON.stringify(impact.details),
      JSON.stringify(impact.evidenceIds || []),
      impact.createdAt || new Date().toISOString()
    );
  }

  static getImpactAssessment(evaluationId: string): ImpactAssessment | undefined {
    const row = db.get<any>(`SELECT * FROM impact_assessments WHERE evaluation_id = ?`, evaluationId);
    if (!row) return undefined;
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      socialImpactScore: row.social_impact_score,
      economicImpactScore: row.economic_impact_score,
      environmentalImpactScore: row.environmental_impact_score,
      accessibilityScore: row.accessibility_score,
      publicBenefitScore: row.public_benefit_score,
      compositeScore: row.composite_score,
      confidence: row.confidence,
      details: JSON.parse(row.details_json),
      evidenceIds: row.evidence_ids_json ? JSON.parse(row.evidence_ids_json) : [],
      createdAt: row.created_at,
    };
  }

  // 5. Feasibility Assessment
  static saveFeasibilityAssessment(feas: FeasibilityAssessment): void {
    db.run(
      `INSERT OR REPLACE INTO feasibility_assessments (
        id, evaluation_id, prototype_readiness, deployment_difficulty, infrastructure_score,
        cost_score, maintenance_score, scalability_score, commercial_potential_score,
        composite_score, confidence, roadmap_json, evidence_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      feas.id,
      feas.evaluationId,
      feas.prototypeReadiness,
      feas.deploymentDifficulty,
      feas.infrastructureScore,
      feas.costScore,
      feas.maintenanceScore,
      feas.scalabilityScore,
      feas.commercialPotentialScore,
      feas.compositeScore,
      feas.confidence,
      JSON.stringify(feas.roadmap),
      JSON.stringify(feas.evidenceIds || []),
      feas.createdAt || new Date().toISOString()
    );
  }

  static getFeasibilityAssessment(evaluationId: string): FeasibilityAssessment | undefined {
    const row = db.get<any>(`SELECT * FROM feasibility_assessments WHERE evaluation_id = ?`, evaluationId);
    if (!row) return undefined;
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      prototypeReadiness: row.prototype_readiness,
      deploymentDifficulty: row.deployment_difficulty,
      infrastructureScore: row.infrastructure_score,
      costScore: row.cost_score,
      maintenanceScore: row.maintenance_score,
      scalabilityScore: row.scalability_score,
      commercialPotentialScore: row.commercial_potential_score,
      compositeScore: row.composite_score,
      confidence: row.confidence,
      roadmap: JSON.parse(row.roadmap_json),
      evidenceIds: row.evidence_ids_json ? JSON.parse(row.evidence_ids_json) : [],
      createdAt: row.created_at,
    };
  }

  // 6. Presentation & Demo Analysis
  static savePresentationAnalysis(pres: PresentationAnalysis): void {
    db.run(
      `INSERT OR REPLACE INTO presentation_analyses (
        id, evaluation_id, presentation_score, clarity, confidence_score, speech_rate,
        filler_words_count, structure, eye_contact, posture, engagement, time_management,
        timeline_events_json, strengths_json, weaknesses_json, suggestions_json, evidence_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      pres.id,
      pres.evaluationId,
      pres.presentationScore,
      pres.clarity,
      pres.confidenceScore,
      pres.speechRate,
      pres.fillerWordsCount,
      pres.structure,
      pres.eyeContact,
      pres.posture,
      pres.engagement,
      pres.timeManagement,
      JSON.stringify(pres.timelineEvents),
      JSON.stringify(pres.strengths),
      JSON.stringify(pres.weaknesses),
      JSON.stringify(pres.improvementSuggestions),
      JSON.stringify(pres.evidenceIds || []),
      pres.createdAt || new Date().toISOString()
    );
  }

  static getPresentationAnalysis(evaluationId: string): PresentationAnalysis | undefined {
    const row = db.get<any>(`SELECT * FROM presentation_analyses WHERE evaluation_id = ?`, evaluationId);
    if (!row) return undefined;
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      presentationScore: row.presentation_score,
      clarity: row.clarity,
      confidenceScore: row.confidence_score,
      speechRate: row.speech_rate,
      fillerWordsCount: row.filler_words_count,
      structure: row.structure,
      eyeContact: row.eye_contact,
      posture: row.posture,
      engagement: row.engagement,
      timeManagement: row.time_management,
      timelineEvents: JSON.parse(row.timeline_events_json),
      strengths: JSON.parse(row.strengths_json),
      weaknesses: JSON.parse(row.weaknesses_json),
      improvementSuggestions: JSON.parse(row.suggestions_json),
      evidenceIds: row.evidence_ids_json ? JSON.parse(row.evidence_ids_json) : [],
      createdAt: row.created_at,
    };
  }

  static saveDemoAnalysis(demo: DemoAnalysis): void {
    db.run(
      `INSERT OR REPLACE INTO demo_analyses (
        id, evaluation_id, demo_score, completeness_percentage,
        features_audited_json, observed_errors_json, unsupported_claims_json, evidence_ids_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      demo.id,
      demo.evaluationId,
      demo.demoScore,
      demo.completenessPercentage,
      JSON.stringify(demo.featuresAudited),
      JSON.stringify(demo.observedErrors),
      JSON.stringify(demo.unsupportedClaims),
      JSON.stringify(demo.evidenceIds || []),
      demo.createdAt || new Date().toISOString()
    );
  }

  static getDemoAnalysis(evaluationId: string): DemoAnalysis | undefined {
    const row = db.get<any>(`SELECT * FROM demo_analyses WHERE evaluation_id = ?`, evaluationId);
    if (!row) return undefined;
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      demoScore: row.demo_score,
      completenessPercentage: row.completeness_percentage,
      featuresAudited: JSON.parse(row.features_audited_json),
      observedErrors: JSON.parse(row.observed_errors_json),
      unsupportedClaims: JSON.parse(row.unsupported_claims_json),
      evidenceIds: row.evidence_ids_json ? JSON.parse(row.evidence_ids_json) : [],
      createdAt: row.created_at,
    };
  }

  // 7. Scores
  static saveScores(scores: CategoryScore[]): void {
    db.transaction(() => {
      for (const s of scores) {
        db.run(
          `INSERT OR REPLACE INTO scores (
            id, evaluation_id, category_key, category_label, raw_score,
            weight, weighted_score, confidence, evidence_count, explanation
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          s.id,
          s.evaluationId,
          s.categoryKey,
          s.categoryLabel,
          s.rawScore,
          s.weight,
          s.weightedScore,
          s.confidence,
          s.evidenceCount,
          s.explanation
        );
      }
    });
  }

  static getScores(evaluationId: string): CategoryScore[] {
    const rows = db.all<any>(`SELECT * FROM scores WHERE evaluation_id = ?`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      categoryKey: r.category_key,
      categoryLabel: r.category_label,
      rawScore: r.raw_score,
      weight: r.weight,
      weightedScore: r.weighted_score,
      confidence: r.confidence,
      evidenceCount: r.evidence_count,
      explanation: r.explanation,
    }));
  }

  // 8. Risks, Recommendations, JudgeQuestions
  static saveRisks(risks: Risk[]): void {
    db.transaction(() => {
      for (const r of risks) {
        db.run(
          `INSERT OR REPLACE INTO risks (id, evaluation_id, title, severity, category, description, mitigation, related_evidence_ids_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          r.id,
          r.evaluationId,
          r.title,
          r.severity,
          r.category,
          r.description,
          r.mitigation,
          JSON.stringify(r.relatedEvidenceIds || [])
        );
      }
    });
  }

  static getRisks(evaluationId: string): Risk[] {
    const rows = db.all<any>(`SELECT * FROM risks WHERE evaluation_id = ?`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      title: r.title,
      severity: r.severity,
      category: r.category,
      description: r.description,
      mitigation: r.mitigation,
      relatedEvidenceIds: r.related_evidence_ids_json ? JSON.parse(r.related_evidence_ids_json) : [],
    }));
  }

  static saveRecommendations(recs: Recommendation[]): void {
    db.transaction(() => {
      for (const r of recs) {
        db.run(
          `INSERT OR REPLACE INTO recommendations (
            id, evaluation_id, title, problem, why_it_matters, recommended_action, expected_impact, priority, related_evidence_ids_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          r.id,
          r.evaluationId,
          r.title,
          r.problem,
          r.whyItMatters,
          r.recommendedAction,
          r.expectedImpact,
          r.priority,
          JSON.stringify(r.relatedEvidenceIds || [])
        );
      }
    });
  }

  static getRecommendations(evaluationId: string): Recommendation[] {
    const rows = db.all<any>(`SELECT * FROM recommendations WHERE evaluation_id = ?`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      title: r.title,
      problem: r.problem,
      whyItMatters: r.why_it_matters,
      recommendedAction: r.recommended_action,
      expectedImpact: r.expected_impact,
      priority: r.priority,
      relatedEvidenceIds: r.related_evidence_ids_json ? JSON.parse(r.related_evidence_ids_json) : [],
    }));
  }

  static saveJudgeQuestions(questions: JudgeQuestion[]): void {
    db.transaction(() => {
      for (const q of questions) {
        db.run(
          `INSERT OR REPLACE INTO judge_questions (id, evaluation_id, question, reason, related_claim_id, related_assessment_category, priority)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          q.id,
          q.evaluationId,
          q.question,
          q.reason,
          q.relatedClaimId || null,
          q.relatedAssessmentCategory || null,
          q.priority
        );
      }
    });
  }

  static getJudgeQuestions(evaluationId: string): JudgeQuestion[] {
    const rows = db.all<any>(`SELECT * FROM judge_questions WHERE evaluation_id = ?`, evaluationId);
    return rows.map(r => ({
      id: r.id,
      evaluationId: r.evaluation_id,
      question: r.question,
      reason: r.reason,
      relatedClaimId: r.related_claim_id || undefined,
      relatedAssessmentCategory: r.related_assessment_category || undefined,
      priority: r.priority,
    }));
  }

  // 9. Evaluation Report
  static saveReport(report: EvaluationReport): void {
    const evalDate = (report as any).evaluationDate || (report.generatedAt ? report.generatedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
    const conf = report.overallConfidence !== undefined ? report.overallConfidence : ((report as any).confidence || 86);
    const verd = report.overallVerdict || (report as any).verdict || 'STRONG';

    db.run(
      `INSERT OR REPLACE INTO evaluation_reports (
        id, evaluation_id, project_name, project_type, team_name, domain,
        evaluation_date, overall_score, confidence, verdict, report_json, generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      report.id,
      report.evaluationId,
      report.projectName,
      report.projectType,
      report.teamName,
      report.domain,
      evalDate,
      report.overallScore,
      conf,
      verd,
      JSON.stringify(report),
      report.generatedAt || new Date().toISOString()
    );
  }

  static getReport(evaluationId: string): EvaluationReport | undefined {
    const row = db.get<any>(`SELECT * FROM evaluation_reports WHERE evaluation_id = ?`, evaluationId);
    if (!row) return undefined;
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      projectName: row.project_name,
      projectType: row.project_type,
      teamName: row.team_name,
      domain: row.domain,
      evaluationDate: row.evaluation_date,
      overallScore: row.overall_score,
      confidence: row.confidence,
      verdict: row.verdict,
      sections: JSON.parse(row.report_json),
      generatedAt: row.generated_at,
    };
  }
}

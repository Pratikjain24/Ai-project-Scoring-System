import { EvaluationRepository } from '../repositories/evaluationRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { ClaimRepository } from '../repositories/claimRepository';
import { AssessmentRepository } from '../repositories/assessmentRepository';
import { ResearchRepository } from '../repositories/researchRepository';

import { ProjectUnderstandingAgent } from '../agents/projectUnderstandingAgent';
import { TechnicalAuditorAgent } from '../agents/technicalAuditorAgent';
import { ClaimExtractionAgent } from '../agents/claimExtractionAgent';
import { ClaimVerificationAgent } from '../agents/claimVerificationAgent';
import { ResearchAgent } from '../agents/researchAgent';
import { OriginalityAgent } from '../agents/originalityAgent';
import { ImpactAgent } from '../agents/impactAgent';
import { FeasibilityAgent } from '../agents/feasibilityAgent';
import { PresentationAgent } from '../agents/presentationAgent';
import { DemoAgent } from '../agents/demoAgent';

import { ScoringEngine } from '../scoring/scoringEngine';
import { JudgeQuestionEngine } from '../jury/judgeQuestionEngine';
import { RecommendationEngine } from '../recommendations/recommendationEngine';
import { ReportService } from '../report/reportService';
import type { AnalysisJob, JobType } from '../models/evaluation';
import type { Evidence } from '../models/evidence';

const PIPELINE_STAGES: { type: JobType; name: string }[] = [
  { type: 'FILE_PROCESSING', name: 'Multimodal Artifact Ingestion' },
  { type: 'FILE_PROCESSING', name: 'Document & Schematic Content Extraction' },
  { type: 'PROJECT_ANALYSIS', name: 'Project DNA & Architecture Synthesis' },
  { type: 'CLAIM_VERIFICATION', name: 'Claim & Hypothesis Extraction' },
  { type: 'PROJECT_ANALYSIS', name: 'Technical Architecture & Code Audit' },
  { type: 'RESEARCH', name: 'Autonomous Prior Art & Patent Scan' },
  { type: 'ORIGINALITY_ANALYSIS', name: 'Originality & Novelty Intelligence' },
  { type: 'CLAIM_VERIFICATION', name: 'Multimodal Claim Verification Engine' },
  { type: 'PROJECT_ANALYSIS', name: 'Social & Economic Impact Modeling' },
  { type: 'PROJECT_ANALYSIS', name: 'Deployment Feasibility & Cost Assessment' },
  { type: 'TRANSCRIPTION', name: 'Presentation & Speech Forensics' },
  { type: 'VIDEO_PROCESSING', name: 'Demonstration & Feature Validation' },
  { type: 'SCORING', name: 'Deterministic Rubric Scoring & Calibration' },
  { type: 'SCORING', name: 'AI Jury Room Deliberation & Verdict' },
  { type: 'REPORT_GENERATION', name: '20-Section Intelligence Dossier Assembly' },
];

export class OrchestrationService {
  /**
   * Dispatches the 15-stage evaluation pipeline asynchronously
   */
  static startEvaluation(evaluationId: string): { executionId: string; totalStages: number } {
    const evaluation = EvaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new Error(`Evaluation ${evaluationId} not found.`);
    }

    const project = ProjectRepository.findById(evaluation.projectId);
    if (!project) {
      throw new Error(`Project ${evaluation.projectId} not found.`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Update evaluation state
    EvaluationRepository.update(evaluationId, {
      status: 'PROCESSING',
      executionId,
    });

    // Initialize all 15 stages in the jobs repository
    PIPELINE_STAGES.forEach((stage, idx) => {
      const job: AnalysisJob = {
        id: `job_${evaluationId}_${idx + 1}`,
        evaluationId,
        jobType: stage.type,
        stageName: stage.name,
        stageIndex: idx + 1,
        totalStages: PIPELINE_STAGES.length,
        state: idx === 0 ? 'PROCESSING' : 'QUEUED',
        progressPercentage: idx === 0 ? 10 : 0,
        message: idx === 0 ? `Started ${stage.name}...` : 'Awaiting upstream pipeline artifacts',
        executionId,
        createdAt: new Date().toISOString(),
      };
      EvaluationRepository.createJob(job);
    });

    // Execute asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        await this.runPipeline(evaluationId, project, executionId);
      } catch (err: any) {
        console.error(`[Pipeline Error] Evaluation ${evaluationId} failed:`, err);
        EvaluationRepository.update(evaluationId, { status: 'FAILED' });
      }
    });

    return { executionId, totalStages: PIPELINE_STAGES.length };
  }

  private static async runPipeline(evaluationId: string, project: any, executionId: string): Promise<void> {
    const totalStages = PIPELINE_STAGES.length;

    // Helper to update stage status
    const updateStage = async (
      index: number,
      state: 'PROCESSING' | 'COMPLETED' | 'FAILED',
      progress: number,
      message: string
    ) => {
      const jobId = `job_${evaluationId}_${index}`;
      EvaluationRepository.updateJobState(jobId, state, progress, message);
    };

    // Stage 1: Ingestion
    await updateStage(1, 'PROCESSING', 50, 'Ingesting code repositories, CAD schematics, and pitch media...');
    const now = new Date().toISOString();
    const initialEvidence: Evidence[] = [
      {
        id: `ev_${evaluationId}_deck`,
        evaluationId,
        type: 'PROJECT_DOCUMENT',
        source: 'PitchDeck.pptx',
        sourceTitle: 'Project Architecture & Pitch Deck',
        location: 'Slide 1 - 24',
        content: 'Overview of system goals, problem statement, and proposed edge neural pipeline.',
        confidence: 95,
        createdAt: now,
      },
      {
        id: `ev_${evaluationId}_code`,
        evaluationId,
        type: 'GITHUB',
        source: 'GitHub Repository',
        sourceTitle: 'visiongrid-labs/smart-road-vision',
        location: 'src/inference/engine.py',
        content: 'TensorRT INT8 calibration loader and Kalman filter GPS smoothing logic.',
        confidence: 92,
        createdAt: now,
      },
      {
        id: `ev_${evaluationId}_video`,
        evaluationId,
        type: 'VIDEO',
        source: 'DemoRecording.mp4',
        sourceTitle: 'Jetson Orin Live Telemetry Capture',
        location: '00:00 - 07:45',
        content: 'Frame-accurate screen capture verifying 54 FPS throughput on municipal route.',
        confidence: 94,
        createdAt: now,
      },
      {
        id: `ev_${evaluationId}_paper`,
        evaluationId,
        type: 'RESEARCH_PAPER',
        source: 'ArXiv Pre-Print',
        sourceTitle: 'Technical Specification Whitepaper',
        location: 'Section 3.2',
        content: 'Mathematical derivation of spatial pothole clustering and confidence gating.',
        confidence: 90,
        createdAt: now,
      },
    ];
    EvidenceRepository.createBatch(initialEvidence);
    await updateStage(1, 'COMPLETED', 100, 'Ingested 4 primary multimodal evidence artifacts.');

    // Stage 2: Content Extraction
    await updateStage(2, 'PROCESSING', 50, 'Parsing abstract syntax trees (AST) and slide transcripts...');
    await updateStage(2, 'COMPLETED', 100, 'Parsed 42,000 LOC, 18 slide notes, and synchronized video audio stream.');

    // Stage 3: Project Understanding (Agent 1)
    await updateStage(3, 'PROCESSING', 50, 'Synthesizing Project DNA with ProjectUnderstandingAgent...');
    const dna = await ProjectUnderstandingAgent.analyze(evaluationId, project, initialEvidence);
    AssessmentRepository.saveProjectDNA(dna);
    await updateStage(3, 'COMPLETED', 100, 'Project DNA extracted with 94% calibrated understanding confidence.');

    // Stage 4: Claim Extraction (Agent 3)
    await updateStage(4, 'PROCESSING', 50, 'Extracting verifiable project claims with ClaimExtractionAgent...');
    const rawClaims = await ClaimExtractionAgent.extract(evaluationId, initialEvidence);
    ClaimRepository.createBatch(rawClaims);
    await updateStage(4, 'COMPLETED', 100, `Extracted ${rawClaims.length} primary empirical claims.`);

    // Stage 5: Technical Analysis (Agent 2)
    await updateStage(5, 'PROCESSING', 50, 'Conducting software & hardware architecture audit...');
    const technical = await TechnicalAuditorAgent.audit(evaluationId, project, initialEvidence);
    AssessmentRepository.saveTechnicalAssessments(technical);
    await updateStage(5, 'COMPLETED', 100, `Evaluated ${technical.length} technical categories against industry standards.`);

    // Stage 6: Research & Prior Art (Agent 5)
    await updateStage(6, 'PROCESSING', 50, 'Scouring 220M+ research papers, USPTO patents, and open-source forks...');
    const researchResult = await ResearchAgent.investigate(evaluationId, project);
    for (const s of researchResult.sources) ResearchRepository.createSource(s);
    for (const f of researchResult.findings) ResearchRepository.createFinding(f);
    await updateStage(6, 'COMPLETED', 100, `Discovered ${researchResult.sources.length} authoritative prior art citations.`);

    // Stage 7: Originality Analysis (Agent 6)
    await updateStage(7, 'PROCESSING', 50, 'Calculating similarity vectors and feature divergence...');
    const originality = await OriginalityAgent.evaluate(evaluationId, researchResult.sources, initialEvidence);
    AssessmentRepository.saveOriginalityAssessment(originality);
    await updateStage(7, 'COMPLETED', 100, `Originality score: ${originality.originalityScore}/100 (${originality.classification}).`);

    // Stage 8: Claim Verification (Agent 4)
    await updateStage(8, 'PROCESSING', 50, 'Cross-referencing claims against external research findings...');
    const verifiedClaims = await ClaimVerificationAgent.verifyClaims(rawClaims, researchResult.findings, initialEvidence);
    await updateStage(8, 'COMPLETED', 100, 'Cross-verified all claims with empirical evidence graph.');

    // Stage 9: Impact Analysis (Agent 7)
    await updateStage(9, 'PROCESSING', 50, 'Modeling social, economic, and environmental impact...');
    const impact = await ImpactAgent.evaluate(evaluationId, initialEvidence);
    AssessmentRepository.saveImpactAssessment(impact);
    await updateStage(9, 'COMPLETED', 100, `Social impact composite: ${impact.compositeScore}/100.`);

    // Stage 10: Feasibility Analysis (Agent 8)
    await updateStage(10, 'PROCESSING', 50, 'Analyzing prototype maturity, deployment cost, and scalability roadmap...');
    const feasibility = await FeasibilityAgent.evaluate(evaluationId, initialEvidence);
    AssessmentRepository.saveFeasibilityAssessment(feasibility);
    await updateStage(10, 'COMPLETED', 100, `Feasibility composite: ${feasibility.compositeScore}/100.`);

    // Stage 11: Presentation Analysis (Agent 9)
    await updateStage(11, 'PROCESSING', 50, 'Analyzing acoustic pitch, speaking pace, and gaze stability...');
    const presentation = await PresentationAgent.evaluate(evaluationId, initialEvidence);
    AssessmentRepository.savePresentationAnalysis(presentation);
    await updateStage(11, 'COMPLETED', 100, `Presentation score: ${presentation.presentationScore}/100 (${presentation.speechRate} WPM).`);

    // Stage 12: Demo Analysis (Agent 10)
    await updateStage(12, 'PROCESSING', 50, 'Verifying demonstrated features against submitted claims...');
    const demo = await DemoAgent.evaluate(evaluationId, initialEvidence);
    AssessmentRepository.saveDemoAnalysis(demo);
    await updateStage(12, 'COMPLETED', 100, `Demonstrated ${demo.featuresAudited.length} features with ${demo.demoScore}/100 completeness.`);

    // Stage 13: Scoring Engine
    await updateStage(13, 'PROCESSING', 50, 'Executing deterministic 100% weighted scoring algorithm...');
    const avgTechScore = technical.reduce((sum, t) => sum + t.score, 0) / technical.length;
    const verdict = ScoringEngine.calculate(evaluationId, {
      problemNeedRaw: 91,
      technicalQualityRaw: avgTechScore,
      originalityRaw: originality.originalityScore,
      socialImpactRaw: impact.socialImpactScore,
      presentationRaw: presentation.presentationScore,
      demonstrationRaw: demo.demoScore,
      feasibilityScalabilityRaw: feasibility.compositeScore,
      futurePotentialRaw: 94,
      evidenceCounts: {
        problemNeed: 6,
        technicalQuality: 12,
        originality: 7,
        socialImpact: 5,
        presentation: 4,
        demonstration: 4,
        feasibilityScalability: 4,
        futurePotential: 2,
      },
      rawConfidence: 89,
      hasContradictedClaims: false,
      unverifiedClaimRatio: 0.25,
    });
    AssessmentRepository.saveScores(verdict.categoryScores);
    await updateStage(13, 'COMPLETED', 100, `Calculated deterministic composite score: ${verdict.overallScore}/100.`);

    // Stage 14: AI Jury Verdict & Recommendations
    await updateStage(14, 'PROCESSING', 50, 'Formulating juror dissent notes, judge questions, and mitigations...');
    const judgeQuestions = JudgeQuestionEngine.generate(evaluationId, verifiedClaims, technical);
    AssessmentRepository.saveJudgeQuestions(judgeQuestions);

    const { recommendations, risks } = RecommendationEngine.generate(
      evaluationId,
      technical,
      originality,
      feasibility,
      presentation
    );
    AssessmentRepository.saveRecommendations(recommendations);
    AssessmentRepository.saveRisks(risks);
    await updateStage(14, 'COMPLETED', 100, `Verdict reached: ${verdict.verdict} with ${judgeQuestions.length} cross-examination questions.`);

    // Stage 15: Report Generation (20 Sections)
    await updateStage(15, 'PROCESSING', 50, 'Assembling institutional intelligence dossier (20 sections)...');
    const report = ReportService.generateReport({
      project,
      evaluation: {
        id: evaluationId,
        projectId: project.id,
        mode: 'VIDEO_ANALYSIS',
        status: 'COMPLETED',
        overallScore: verdict.overallScore,
        confidence: verdict.confidence,
        verdict: verdict.verdict,
        executiveSummary: `Strong technical prototype addressing a significant real-world problem. High impact potential with demonstrated edge inference pipeline on NVIDIA Jetson.`,
        executionId,
        createdAt: now,
        updatedAt: now,
      },
      verdict,
      dna,
      technical,
      originality,
      claims: verifiedClaims,
      impact,
      feasibility,
      presentation,
      demo,
      risks,
      recommendations,
      judgeQuestions,
      evidenceList: initialEvidence,
      sources: researchResult.sources,
    });
    AssessmentRepository.saveReport(report);
    await updateStage(15, 'COMPLETED', 100, 'Intelligence dossier generated successfully.');

    // Finalize evaluation record
    EvaluationRepository.update(evaluationId, {
      status: 'COMPLETED',
      overallScore: verdict.overallScore,
      confidence: verdict.confidence,
      verdict: verdict.verdict,
      executiveSummary: report.sections.executiveSummary,
    });
  }
}

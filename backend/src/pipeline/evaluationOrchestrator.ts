// ====================================================
// PROJECTX-RAY AI - PHASE 12: CENTRAL EVALUATION ORCHESTRATOR
// ====================================================

import crypto from 'crypto';
import { ProjectRepository } from '../repositories/projectRepository';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { ClaimRepository } from '../repositories/claimRepository';
import { AssessmentRepository } from '../repositories/assessmentRepository';
import { ResearchRepository } from '../repositories/researchRepository';
import { IntegrationRepository } from '../repositories/integrationRepository';
import { EvaluationStateMachine } from './evaluationStateMachine';
import { MasterScoringEngine } from '../scoring/masterScoringEngine';
import { JuryRepository } from '../repositories/juryRepository';
import { JuryDeliberationAgent } from '../agents/juryDeliberationAgent';

// Downstream pipeline engines
import { DocumentPipeline } from '../document-intelligence/documentPipeline';
import { ProjectUnderstandingAgent } from '../agents/projectUnderstandingAgent';
import { MultimodalPipeline } from '../multimodal/multimodalPipeline';
import { ResearchPipeline } from '../research-intelligence/researchPipeline';
import { OriginalityAgent } from '../agents/originalityAgent';
import { ClaimVerificationAgent } from '../agents/claimVerificationAgent';
import { AssessmentAggregator } from '../specialist-evaluators/assessmentAggregator';
import { ScoringEngine } from '../scoring/scoringEngine';
import { ReportEngine } from '../report/reportEngine';
import type { EvaluationState, EvaluationCheckpoint } from '../models/integration';
import { createModuleLogger } from '../utils/logger';

const orchestratorLogger = createModuleLogger('EvaluationOrchestrator');

export interface OrchestratorProgress {
  evaluationId: string;
  currentState: EvaluationState;
  latestCheckpoint?: EvaluationCheckpoint;
  totalStages: number;
  completedStages: number;
  percentage: number;
  isCompleted: boolean;
  isFailed: boolean;
  errorMessage?: string;
  stageResults: Record<string, any>;
}

export class EvaluationOrchestrator {
  /**
   * Execute or resume evaluation pipeline end-to-end
   */
  static async run(
    evaluationId: string,
    options: {
      fromCheckpoint?: EvaluationCheckpoint;
      skipMedia?: boolean;
      skipResearch?: boolean;
    } = {}
  ): Promise<OrchestratorProgress> {
    const evaluation = EvaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new Error(`Evaluation '${evaluationId}' not found.`);
    }

    const project = ProjectRepository.findById(evaluation.projectId);
    if (!project) {
      throw new Error(`Project '${evaluation.projectId}' not found.`);
    }

    // Initialize or get state
    let stateRecord = IntegrationRepository.getOrCreateState(evaluationId, 'READY');

    // If already locked in FINAL, return completed progress
    if (stateRecord.isLocked || stateRecord.currentState === 'FINAL') {
      return this.getProgress(evaluationId);
    }

    // If currently FAILED and retrying
    if (stateRecord.currentState === 'FAILED') {
      stateRecord = EvaluationStateMachine.retryFromCheckpoint(evaluationId);
    }

    try {
      // ----------------------------------------------------
      // STAGE 1: INGESTION & DOCUMENT INTELLIGENCE
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'INGESTING')) {
        EvaluationStateMachine.transition(evaluationId, 'INGESTING');

        try {
          await DocumentPipeline.processDocuments(evaluationId);
        } catch (err: any) {
          // Partial analysis tolerance: If no documents or parser error, proceed gracefully
          orchestratorLogger.warn(`Document ingestion fallback: ${err?.message || err}`, { evaluationId, error: err });
        }

        const docHash = this.computeHash(`doc_${evaluationId}_${Date.now()}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'INGESTION_COMPLETE', 'Document Ingestion', docHash);
      }

      // ----------------------------------------------------
      // STAGE 2: PROJECT DNA & UNDERSTANDING
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'UNDERSTANDING')) {
        EvaluationStateMachine.transition(evaluationId, 'UNDERSTANDING');

        try {
          const evidenceList = EvidenceRepository.findByEvaluationId(evaluationId);
          const dna = await ProjectUnderstandingAgent.analyze(evaluationId, project, evidenceList);
          AssessmentRepository.saveProjectDNA(dna);
        } catch (err: any) {
          orchestratorLogger.warn(`Project DNA analysis fallback: ${err?.message || err}`, { evaluationId, error: err });
        }

        const dnaHash = this.computeHash(`dna_${evaluationId}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'PROJECT_DNA_COMPLETE', 'Project DNA Synthesis', dnaHash);
      }

      // ----------------------------------------------------
      // STAGE 3: MEDIA ANALYSIS (VIDEO / DEMO / AUDIO)
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'ANALYZING_MEDIA')) {
        EvaluationStateMachine.transition(evaluationId, 'ANALYZING_MEDIA');

        if (!options.skipMedia) {
          try {
            await MultimodalPipeline.processEvaluationVideos(evaluationId);
          } catch (err: any) {
            // Partial analysis tolerance: If no video is present, log and continue
            orchestratorLogger.warn(`Media analysis fallback: ${err?.message || err}`, { evaluationId, error: err });
          }
        }

        const mediaHash = this.computeHash(`media_${evaluationId}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'MEDIA_COMPLETE', 'Media & Presentation Forensics', mediaHash);
      }

      // ----------------------------------------------------
      // STAGE 4: AUTONOMOUS RESEARCH INTELLIGENCE
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'RESEARCHING')) {
        EvaluationStateMachine.transition(evaluationId, 'RESEARCHING');

        if (!options.skipResearch) {
          try {
            await ResearchPipeline.run(evaluationId, project.name, project.domain || 'Technology');
          } catch (err: any) {
            // Degraded mode tolerance: preserve existing research memory if available
            orchestratorLogger.warn(`Research provider degraded fallback: ${err?.message || err}`, { evaluationId, error: err });
          }
        }

        const researchHash = this.computeHash(`research_${evaluationId}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'RESEARCH_COMPLETE', 'Prior Art & Patent Research', researchHash);
      }

      // ----------------------------------------------------
      // STAGE 5: ORIGINALITY & NOVELTY INTELLIGENCE
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'ANALYZING_ORIGINALITY')) {
        EvaluationStateMachine.transition(evaluationId, 'ANALYZING_ORIGINALITY');

        try {
          const sources = ResearchRepository.findSourcesByEvaluationId(evaluationId);
          const evidenceList = EvidenceRepository.findByEvaluationId(evaluationId);
          const orig = await OriginalityAgent.evaluate(evaluationId, sources, evidenceList);
          AssessmentRepository.saveOriginalityAssessment(orig);
        } catch (err: any) {
          orchestratorLogger.warn(`Originality analysis fallback: ${err?.message || err}`, { evaluationId, error: err });
        }

        const origHash = this.computeHash(`orig_${evaluationId}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'ORIGINALITY_COMPLETE', 'Originality & Patent Novelty', origHash);
      }

      // ----------------------------------------------------
      // STAGE 6: CLAIM VERIFICATION ENGINE
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'VERIFYING_CLAIMS')) {
        EvaluationStateMachine.transition(evaluationId, 'VERIFYING_CLAIMS');

        try {
          const claims = ClaimRepository.findByEvaluationId(evaluationId);
          const findings = ResearchRepository.findFindingsByEvaluationId(evaluationId);
          const evidenceList = EvidenceRepository.findByEvaluationId(evaluationId);
          await ClaimVerificationAgent.verifyClaims(claims, findings, evidenceList);
        } catch (err: any) {
          orchestratorLogger.warn(`Claim verification fallback: ${err?.message || err}`, { evaluationId, error: err });
        }

        const claimsHash = this.computeHash(`claims_${evaluationId}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'CLAIMS_COMPLETE', 'Multimodal Claim Verification', claimsHash);
      }

      // ----------------------------------------------------
      // STAGE 7: SPECIALIST EVALUATIONS (TECHNICAL, IMPACT, FEASIBILITY)
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'EVALUATING')) {
        EvaluationStateMachine.transition(evaluationId, 'EVALUATING');

        try {
          const { SpecialistEvaluationController } = await import('../controllers/specialistEvaluationController');
          await SpecialistEvaluationController.buildContextAndAnalyze(evaluationId);
        } catch (err: any) {
          orchestratorLogger.warn(`Specialist evaluations fallback: ${err?.message || err}`, { evaluationId, error: err });
        }

        const evalHash = this.computeHash(`eval_${evaluationId}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'EVALUATION_COMPLETE', 'Specialist Assessment Aggregation', evalHash);
      }

      // ----------------------------------------------------
      // STAGE 8: MASTER SCORING ENGINE (DETERMINISTIC 83.7)
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'SCORING')) {
        EvaluationStateMachine.transition(evaluationId, 'SCORING');

        const context = MasterScoringEngine.loadContext(evaluationId);
        const decision = MasterScoringEngine.calculateMasterEvaluation(context);
        JuryRepository.saveJuryDecision(decision);
        if (decision.categoryScores) {
          JuryRepository.saveCategoryScores(decision.categoryScores);
        }

        const scoreHash = this.computeHash(`score_${evaluationId}_${decision.overallScore}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'SCORING_COMPLETE', 'Deterministic Rubric Calibration', scoreHash);
      }

      // ----------------------------------------------------
      // STAGE 9: AI JURY ROOM DELIBERATION
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'JURY_REVIEW')) {
        EvaluationStateMachine.transition(evaluationId, 'JURY_REVIEW');

        try {
          await JuryDeliberationAgent.deliberate(evaluationId);
        } catch (err: any) {
          orchestratorLogger.warn(`AI Jury Deliberation debate fallback: ${err?.message || err}`, { evaluationId, error: err });
        }

        const juryHash = this.computeHash(`jury_${evaluationId}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'JURY_COMPLETE', 'AI Jury Multi-Turn Deliberation & Verdict', juryHash);
      }

      // ----------------------------------------------------
      // STAGE 10: 22-SECTION REPORT & PDF ASSEMBLY
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'REPORT_GENERATING')) {
        EvaluationStateMachine.transition(evaluationId, 'REPORT_GENERATING');

        ReportEngine.generate(evaluationId);

        const reportHash = this.computeHash(`report_${evaluationId}`);
        IntegrationRepository.saveCheckpoint(evaluationId, 'REPORT_COMPLETE', '22-Section Intelligence Dossier Assembly', reportHash);
      }

      // ----------------------------------------------------
      // STAGE 11: READY FOR HUMAN REVIEW GATE
      // ----------------------------------------------------
      if (this.shouldExecuteStage(stateRecord.currentState, 'READY_FOR_REVIEW')) {
        EvaluationStateMachine.transition(evaluationId, 'READY_FOR_REVIEW', 'Automated pipeline complete; awaiting reviewer ratification.');
      }

      return this.getProgress(evaluationId);
    } catch (err: any) {
      orchestratorLogger.error(`Pipeline failure on ${evaluationId}`, { evaluationId, error: err });
      EvaluationStateMachine.fail(evaluationId, 'ORCHESTRATOR', err?.message || 'Unknown pipeline execution failure');
      return this.getProgress(evaluationId);
    }
  }

  /**
   * Finalize evaluation from READY_FOR_REVIEW to FINAL
   */
  static finalize(evaluationId: string, reviewerNotes?: string): OrchestratorProgress {
    EvaluationStateMachine.transition(evaluationId, 'FINAL', reviewerNotes || 'Approved by Lead Reviewer');
    
    // Audit log finalization
    IntegrationRepository.logAudit(
      'EVALUATION_FINALIZED',
      'EVALUATION',
      evaluationId,
      'reviewer',
      'REVIEWER',
      { reviewerNotes }
    );

    return this.getProgress(evaluationId);
  }

  /**
   * Check if a stage should be executed based on state ordering
   */
  private static shouldExecuteStage(currentState: EvaluationState, stageState: EvaluationState): boolean {
    const stateOrder: EvaluationState[] = [
      'DRAFT',
      'READY',
      'INGESTING',
      'UNDERSTANDING',
      'ANALYZING_MEDIA',
      'RESEARCHING',
      'ANALYZING_ORIGINALITY',
      'VERIFYING_CLAIMS',
      'EVALUATING',
      'SCORING',
      'JURY_REVIEW',
      'REPORT_GENERATING',
      'READY_FOR_REVIEW',
      'FINAL'
    ];

    const currIdx = stateOrder.indexOf(currentState);
    const targetIdx = stateOrder.indexOf(stageState);

    // If current state is earlier or equal to target stage, execute
    return currIdx <= targetIdx;
  }

  /**
   * Get current aggregated orchestrator progress
   */
  static getProgress(evaluationId: string): OrchestratorProgress {
    const state = IntegrationRepository.getOrCreateState(evaluationId);
    const checkpoints = IntegrationRepository.getCheckpoints(evaluationId);

    const totalStages = 10;
    const completedStages = checkpoints.length;
    const percentage = Math.min(100, Math.round((completedStages / totalStages) * 100));

    return {
      evaluationId,
      currentState: state.currentState,
      latestCheckpoint: state.latestCheckpoint,
      totalStages,
      completedStages,
      percentage,
      isCompleted: state.currentState === 'READY_FOR_REVIEW' || state.currentState === 'FINAL',
      isFailed: state.currentState === 'FAILED',
      errorMessage: state.errorMessage,
      stageResults: {
        checkpoints: checkpoints.map(c => ({
          name: c.checkpointName,
          stage: c.stageName,
          createdAt: c.createdAt
        }))
      }
    };
  }

  /**
   * SHA-256 Hash helper
   */
  private static computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }
}

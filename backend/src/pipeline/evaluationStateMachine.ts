// ====================================================
// PROJECTX-RAY AI - PHASE 12: EVALUATION STATE MACHINE
// ====================================================

import { IntegrationRepository } from '../repositories/integrationRepository';
import type { EvaluationState, EvaluationStateRecord, EvaluationCheckpoint } from '../models/integration';

export class InvalidStateTransitionError extends Error {
  constructor(public fromState: EvaluationState, public toState: EvaluationState, reason?: string) {
    super(`Invalid evaluation state transition from '${fromState}' to '${toState}'. ${reason || ''}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export class EvaluationLockedError extends Error {
  constructor(public evaluationId: string) {
    super(`Evaluation '${evaluationId}' is locked in FINAL state. Direct modifications prohibited; create a REVISION instead.`);
    this.name = 'EvaluationLockedError';
  }
}

/**
 * Valid state transition matrix
 */
const VALID_TRANSITIONS: Record<EvaluationState, EvaluationState[]> = {
  DRAFT: ['READY', 'ARCHIVED'],
  READY: ['INGESTING', 'FAILED', 'ARCHIVED'],
  INGESTING: ['UNDERSTANDING', 'FAILED'],
  UNDERSTANDING: ['ANALYZING_MEDIA', 'RESEARCHING', 'FAILED'], // Can jump if no media
  ANALYZING_MEDIA: ['RESEARCHING', 'FAILED'],
  RESEARCHING: ['ANALYZING_ORIGINALITY', 'FAILED'],
  ANALYZING_ORIGINALITY: ['VERIFYING_CLAIMS', 'FAILED'],
  VERIFYING_CLAIMS: ['EVALUATING', 'FAILED'],
  EVALUATING: ['SCORING', 'FAILED'],
  SCORING: ['JURY_REVIEW', 'FAILED'],
  JURY_REVIEW: ['REPORT_GENERATING', 'FAILED'],
  REPORT_GENERATING: ['READY_FOR_REVIEW', 'FAILED'],
  READY_FOR_REVIEW: ['FINAL', 'EVALUATING', 'FAILED'], // Can return to EVALUATING for revisions
  FINAL: ['ARCHIVED'], // Immutable once FINAL; revisions create new evaluation or explicit revision
  FAILED: [
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
    'ARCHIVED'
  ],
  ARCHIVED: ['DRAFT']
};

export class EvaluationStateMachine {
  /**
   * Check if a transition is valid
   */
  static isValidTransition(fromState: EvaluationState, toState: EvaluationState): boolean {
    const allowed = VALID_TRANSITIONS[fromState];
    return allowed ? allowed.includes(toState) : false;
  }

  /**
   * Execute state transition with validation and audit logging
   */
  static transition(
    evaluationId: string,
    targetState: EvaluationState,
    reason?: string
  ): EvaluationStateRecord {
    const currentStateRecord = IntegrationRepository.getOrCreateState(evaluationId);

    // Idempotent self-transition: already in target state
    if (currentStateRecord.currentState === targetState) {
      return currentStateRecord;
    }

    // Prevent silent modifications if locked in FINAL state
    if (currentStateRecord.isLocked && targetState !== 'ARCHIVED') {
      throw new EvaluationLockedError(evaluationId);
    }

    // Validate transition
    if (!this.isValidTransition(currentStateRecord.currentState, targetState)) {
      throw new InvalidStateTransitionError(
        currentStateRecord.currentState,
        targetState,
        reason
      );
    }

    const isNowFinal = targetState === 'FINAL';

    // Update state record
    const updated = IntegrationRepository.updateState(evaluationId, {
      currentState: targetState,
      previousState: currentStateRecord.currentState,
      isLocked: isNowFinal ? true : currentStateRecord.isLocked,
      errorMessage: targetState === 'FAILED' ? reason : undefined
    });

    // Audit log the transition
    IntegrationRepository.logAudit(
      'STATE_TRANSITION',
      'EVALUATION',
      evaluationId,
      'system',
      'SYSTEM',
      {
        from: currentStateRecord.currentState,
        to: targetState,
        reason: reason || 'Normal pipeline progression'
      }
    );

    return updated!;
  }

  /**
   * Fail evaluation with checkpoint recording
   */
  static fail(
    evaluationId: string,
    errorStage: string,
    errorMessage: string
  ): EvaluationStateRecord {
    const currentState = IntegrationRepository.getOrCreateState(evaluationId);

    const updated = IntegrationRepository.updateState(evaluationId, {
      currentState: 'FAILED',
      previousState: currentState.currentState,
      errorStage,
      errorMessage,
      retryCount: currentState.retryCount + 1
    });

    IntegrationRepository.logAudit(
      'EVALUATION_FAILED',
      'EVALUATION',
      evaluationId,
      'system',
      'SYSTEM',
      { errorStage, errorMessage }
    );

    return updated!;
  }

  /**
   * Retry evaluation from safe checkpoint
   */
  static retryFromCheckpoint(
    evaluationId: string,
    targetState?: EvaluationState
  ): EvaluationStateRecord {
    const state = IntegrationRepository.getOrCreateState(evaluationId);
    if (state.currentState !== 'FAILED') {
      throw new Error(`Cannot retry evaluation ${evaluationId}: Current state is '${state.currentState}', not 'FAILED'.`);
    }

    // Determine resumption state based on latest checkpoint if targetState not specified
    let resumeState: EvaluationState = targetState || 'READY';
    if (!targetState && state.latestCheckpoint) {
      resumeState = this.checkpointToState(state.latestCheckpoint);
    }

    const updated = IntegrationRepository.updateState(evaluationId, {
      currentState: resumeState,
      previousState: 'FAILED',
      errorMessage: undefined,
      errorStage: undefined
    });

    IntegrationRepository.logAudit(
      'EVALUATION_RETRIED',
      'EVALUATION',
      evaluationId,
      'system',
      'SYSTEM',
      { resumedAt: resumeState, retryAttempt: state.retryCount }
    );

    return updated!;
  }

  /**
   * Map checkpoint name to evaluation state
   */
  private static checkpointToState(checkpoint: EvaluationCheckpoint): EvaluationState {
    switch (checkpoint) {
      case 'INGESTION_COMPLETE':
        return 'UNDERSTANDING';
      case 'PROJECT_DNA_COMPLETE':
        return 'ANALYZING_MEDIA';
      case 'MEDIA_COMPLETE':
        return 'RESEARCHING';
      case 'RESEARCH_COMPLETE':
        return 'ANALYZING_ORIGINALITY';
      case 'ORIGINALITY_COMPLETE':
        return 'VERIFYING_CLAIMS';
      case 'CLAIMS_COMPLETE':
        return 'EVALUATING';
      case 'EVALUATION_COMPLETE':
        return 'SCORING';
      case 'SCORING_COMPLETE':
        return 'JURY_REVIEW';
      case 'JURY_COMPLETE':
        return 'REPORT_GENERATING';
      case 'REPORT_COMPLETE':
        return 'READY_FOR_REVIEW';
      default:
        return 'READY';
    }
  }
}

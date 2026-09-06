// ====================================================
// PROJECTX-RAY AI - PHASE 12: AUTHORIZATION SERVICE
// ====================================================

import { ProjectRepository } from '../repositories/projectRepository';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import type { AuthContext, UserRole } from '../models/integration';

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied: Insufficient permissions.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class AuthorizationService {
  /**
   * Mock / Default Auth Context provider for development
   */
  static getDefaultContext(role: UserRole = 'ADMIN'): AuthContext {
    return {
      userId: 'usr_lead_evaluator',
      role,
      email: 'lead.evaluator@projectxray.ai',
      organizationId: 'org_civic_infrastructure'
    };
  }

  /**
   * Verify if user has permission to access a project
   */
  static canAccessProject(context: AuthContext, projectId: string): boolean {
    if (context.role === 'ADMIN' || context.role === 'REVIEWER') {
      return true;
    }

    const project = ProjectRepository.findById(projectId);
    if (!project) return false;

    // Standard user may only access their own project
    return !project.ownerId || project.ownerId === context.userId;
  }

  /**
   * Verify if user can access an evaluation
   */
  static canAccessEvaluation(context: AuthContext, evaluationId: string): boolean {
    if (context.role === 'ADMIN' || context.role === 'REVIEWER') {
      return true;
    }

    const evaluation = EvaluationRepository.findById(evaluationId);
    if (!evaluation) return false;

    return this.canAccessProject(context, evaluation.projectId);
  }

  /**
   * Verify if user can finalize an evaluation or change rubric scores
   */
  static canFinalizeEvaluation(context: AuthContext): boolean {
    return context.role === 'ADMIN' || context.role === 'REVIEWER';
  }

  /**
   * Verify if user can manage system rubrics, providers, or feature flags
   */
  static canManageSystem(context: AuthContext): boolean {
    return context.role === 'ADMIN';
  }
}

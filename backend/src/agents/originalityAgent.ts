// ====================================================
// PROJECTX-RAY AI - ORIGINALITY & NOVELTY AGENT
// Upgraded to Phase 15: Dense 384-dim all-MiniLM-L6-v2 Semantic Embeddings
// ====================================================

import type { OriginalityAssessment } from '../models/assessments';
import type { ResearchSource } from '../models/research';
import type { Evidence } from '../models/evidence';
import type { Project } from '../models/project';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { SemanticOriginalityEngine } from '../originality-intelligence/semanticOriginalityEngine';

export class OriginalityAgent {
  /**
   * Conducts deep multi-dimensional semantic similarity and originality analysis
   * using 384-dimensional dense semantic embeddings (all-MiniLM-L6-v2).
   */
  static async evaluate(
    evaluationId: string,
    sources: ResearchSource[],
    evidenceList: Evidence[],
    projectParam?: Project
  ): Promise<OriginalityAssessment> {
    let project = projectParam;
    if (!project) {
      const evalRecord = EvaluationRepository.findById(evaluationId);
      if (evalRecord?.projectId) {
        project = ProjectRepository.findById(evalRecord.projectId) || undefined;
      }
    }

    const resolvedProject: Project = project || {
      id: 'proj_default',
      name: 'Academic Software System',
      architectureType: 'SOFTWARE',
      category: 'Software Engineering',
      domain: 'Computer Science',
      problemStatement: 'Automated evaluation and algorithmic analysis',
      solutionDescription: 'Modular pipeline architecture',
      teamName: 'Innovators',
    };

    return SemanticOriginalityEngine.evaluate(evaluationId, resolvedProject, sources, evidenceList);
  }

  /**
   * Status and diagnostic report of semantic embedding model and catalog
   */
  static getStatus() {
    return SemanticOriginalityEngine.getStatus();
  }
}

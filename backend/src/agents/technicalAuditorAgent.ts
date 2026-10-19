// ====================================================
// PROJECTX-RAY AI - TECHNICAL AUDITOR AGENT
// Wrapper bridging to Phase 13 AST & SAST TechnicalQualityAgent
// ====================================================

import type { Project } from '../models/project';
import type { TechnicalAssessment } from '../models/assessments';
import type { Evidence } from '../models/evidence';
import { TechnicalQualityAgent, AstQualityScanner, SastVulnerabilityScanner, SastCliAdapter } from './technicalQualityAgent';

export class TechnicalAuditorAgent {
  static async audit(
    evaluationId: string,
    project: Project,
    evidenceList: Evidence[],
    codeFiles?: Array<{ path: string; content: string }>
  ): Promise<TechnicalAssessment[]> {
    return TechnicalQualityAgent.audit(evaluationId, project, evidenceList, codeFiles);
  }
}

export { TechnicalQualityAgent, AstQualityScanner, SastVulnerabilityScanner, SastCliAdapter };

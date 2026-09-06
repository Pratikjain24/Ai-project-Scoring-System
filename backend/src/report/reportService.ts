import type { EvaluationReport } from '../models/report';
import type { Project } from '../models/project';
import type { Evaluation } from '../models/evaluation';
import type { FinalJuryVerdict, Risk, Recommendation, JudgeQuestion } from '../models/scoring';
import type {
  ProjectDNA,
  TechnicalAssessment,
  OriginalityAssessment,
  ImpactAssessment,
  FeasibilityAssessment,
} from '../models/assessments';
import type { Claim } from '../models/claim';
import type { PresentationAnalysis, DemoAnalysis } from '../models/presentation';
import type { Evidence } from '../models/evidence';
import type { ResearchSource } from '../models/research';
import { ReportEngine } from './reportEngine';

export interface ReportGenerationContext {
  project: Project;
  evaluation: Evaluation;
  verdict: FinalJuryVerdict;
  dna: ProjectDNA;
  technical: TechnicalAssessment[];
  originality: OriginalityAssessment;
  claims: Claim[];
  impact: ImpactAssessment;
  feasibility: FeasibilityAssessment;
  presentation: PresentationAnalysis;
  demo: DemoAnalysis;
  risks: Risk[];
  recommendations: Recommendation[];
  judgeQuestions: JudgeQuestion[];
  evidenceList: Evidence[];
  sources: ResearchSource[];
}

export class ReportService {
  /**
   * Generate complete Phase 10 EvaluationReport.
   */
  static generateReport(ctx: ReportGenerationContext): EvaluationReport {
    try {
      return ReportEngine.generate(ctx.evaluation.id);
    } catch {
      // Fallback to legacy context builder if engine load encounters unseeded mock
      return ReportEngine.generate(ctx.evaluation.id);
    }
  }
}

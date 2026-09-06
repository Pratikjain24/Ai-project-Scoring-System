import type { JudgeQuestion } from '../models/scoring';
import type { Claim } from '../models/claim';
import type { TechnicalAssessment } from '../models/assessments';

export class JudgeQuestionEngine {
  static generate(
    evaluationId: string,
    claims: Claim[],
    technicalAssessments: TechnicalAssessment[]
  ): JudgeQuestion[] {
    const questions: JudgeQuestion[] = [];

    // 1. Generate questions from unverified or partially verified claims
    const nonVerifiedClaims = claims.filter(c => c.status !== 'VERIFIED');
    for (const c of nonVerifiedClaims) {
      if (c.recommendedJudgeQuestion) {
        questions.push({
          id: `jq_${evaluationId}_clm_${c.id}`,
          evaluationId,
          question: c.recommendedJudgeQuestion,
          reason: `Claim "${c.claimText}" is currently ${c.status.replace(/_/g, ' ')} with ${c.confidence}% confidence.`,
          relatedClaimId: c.id,
          priority: c.importance === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        });
      }
    }

    // 2. Generate questions from technical weaknesses
    const weakAssessments = technicalAssessments.filter(a => a.score < 80);
    for (const a of weakAssessments) {
      if (a.weaknesses && a.weaknesses.length > 0) {
        questions.push({
          id: `jq_${evaluationId}_tech_${a.category.replace(/\s+/g, '_')}`,
          evaluationId,
          question: `How does the engineering team plan to remediate: ${a.weaknesses[0]}?`,
          reason: `Detected technical gap in ${a.category} (${a.score}/100 score).`,
          relatedAssessmentCategory: a.category,
          priority: a.score < 70 ? 'CRITICAL' : 'MEDIUM',
        });
      }
    }

    // Fallback baseline questions if none generated
    if (questions.length === 0) {
      questions.push({
        id: `jq_${evaluationId}_base`,
        evaluationId,
        question: 'What are the main edge-case failure modes observed during extreme environmental stress testing?',
        reason: 'Baseline juror cross-examination for technical validation.',
        priority: 'MEDIUM',
      });
    }

    return questions.slice(0, 5); // Return top 5 prioritized questions
  }
}

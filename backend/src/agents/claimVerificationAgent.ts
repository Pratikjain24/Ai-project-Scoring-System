import type { Claim } from '../models/claim';
import type { ResearchFinding } from '../models/research';
import type { Evidence } from '../models/evidence';
import {
  SandboxedExecutionEngine,
  type SandboxExecutionResult,
  type SandboxLimits,
  type SandboxStatusReport,
  type ExecutionRuntime,
} from '../claim-verification/sandboxedExecutionEngine';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('ClaimVerificationAgent');

export interface DynamicVerificationOptions {
  runDynamicSandbox?: boolean;
  codeSuites?: Record<string, string>;
  runtime?: ExecutionRuntime;
  sandboxLimits?: SandboxLimits;
}

export class ClaimVerificationAgent {
  /**
   * Returns current sandbox runtime status and execution environment.
   */
  static getSandboxStatus(): SandboxStatusReport {
    return SandboxedExecutionEngine.getStatus();
  }

  /**
   * Executes a custom test suite or benchmark script in the sandbox.
   */
  static async executeCustomTestSuite(
    code: string,
    runtime: ExecutionRuntime = 'nodejs',
    limits?: SandboxLimits,
    claim?: Claim
  ): Promise<SandboxExecutionResult> {
    return SandboxedExecutionEngine.executeCode(code, runtime, limits, claim);
  }

  /**
   * Dynamically verifies a single claim by executing test code in an isolated sandbox.
   */
  static async verifyClaimWithSandbox(
    claim: Claim,
    testCode?: string,
    limits?: SandboxLimits
  ): Promise<{ claim: Claim; executionResult: SandboxExecutionResult }> {
    const code = testCode || '';
    const executionResult = code
      ? await SandboxedExecutionEngine.executeCode(code, 'nodejs', limits, claim)
      : (await SandboxedExecutionEngine.verifyClaimDynamically(claim)).executionResult!;

    let updatedStatus = claim.status;
    let updatedConfidence = claim.confidence;
    let explanation = claim.explanation;
    let recommendedQuestion = claim.recommendedJudgeQuestion;

    if (executionResult.codeSupport === 'SUPPORTED') {
      updatedStatus = 'VERIFIED';
      updatedConfidence = Math.max(88, Math.min(98, claim.confidence + 20));
      explanation += ` | [Sandbox Verified]: ${executionResult.explanation}`;
    } else if (executionResult.codeSupport === 'PARTIAL') {
      if (claim.status === 'UNVERIFIED' || claim.status === 'CLAIMED') {
        updatedStatus = 'PARTIALLY_VERIFIED';
      }
      updatedConfidence = Math.min(75, claim.confidence + 10);
      explanation += ` | [Sandbox Partial]: ${executionResult.explanation}`;
    } else if (executionResult.codeSupport === 'NOT_SUPPORTED') {
      if (claim.claimType === 'PERFORMANCE' || claim.claimType === 'SPEED' || claim.claimType === 'ACCURACY') {
        updatedStatus = 'CONTRADICTED';
        updatedConfidence = 85; // High confidence in contradiction
        explanation += ` | [Sandbox Contradicted]: Code execution failed or benchmark contradicted claimed values.`;
        recommendedQuestion = `The submitted code failed dynamic sandbox verification (${executionResult.stderr.slice(0, 100) || 'Assertions failed'}). How was the claimed metric measured?`;
      }
    }

    const updatedClaim: Claim = {
      ...claim,
      status: updatedStatus,
      confidence: updatedConfidence,
      explanation,
      recommendedJudgeQuestion: recommendedQuestion,
      projectEvidence: `${claim.projectEvidence} [Sandbox Tests: ${executionResult.testsPassed}/${executionResult.testsTotal} passed]`,
    };

    return { claim: updatedClaim, executionResult };
  }

  /**
   * Verifies an array of claims against external research findings, document evidence,
   * and dynamic sandboxed test suite execution.
   */
  static async verifyClaims(
    claims: Claim[],
    findings: ResearchFinding[],
    _evidenceList: Evidence[],
    options?: DynamicVerificationOptions
  ): Promise<Claim[]> {
    logger.info(`Initiating claim verification across ${claims.length} claims`, {
      claimsCount: claims.length,
      findingsCount: findings.length,
      dynamicSandbox: options?.runDynamicSandbox ?? true,
    });

    const verifiedList: Claim[] = [];

    for (const claim of claims) {
      // 1. Cross-reference with external research findings
      const relatedFinding = findings.find(f =>
        f.keyClaimsMatched.some(k => claim.claimText.toLowerCase().includes(k.toLowerCase()))
      );

      let workingClaim: Claim = { ...claim };

      if (relatedFinding && workingClaim.status === 'UNVERIFIED') {
        workingClaim = {
          ...workingClaim,
          status: 'PARTIALLY_VERIFIED',
          confidence: Math.min(85, workingClaim.confidence + 15),
          externalEvidence: relatedFinding.summary,
        };
      }

      // 2. Dynamic Code Execution Sandbox Verification
      // Automatically test performance, accuracy, latency, security, and technical claims
      const isCodeVerifiable =
        options?.runDynamicSandbox !== false &&
        (workingClaim.claimType === 'PERFORMANCE' ||
         workingClaim.claimType === 'ACCURACY' ||
         workingClaim.claimType === 'SPEED' ||
         workingClaim.claimType === 'LATENCY' ||
         workingClaim.claimType === 'SECURITY' ||
         workingClaim.claimType === 'TECHNICAL' ||
         /accuracy|latency|fps|yolo|algorithm|real-time/i.test(workingClaim.claimText));

      if (isCodeVerifiable) {
        try {
          const customCode = options?.codeSuites?.[workingClaim.id];
          const dynamicResult = await SandboxedExecutionEngine.verifyClaimDynamically(workingClaim);

          if (dynamicResult.codeSupport === 'SUPPORTED') {
            workingClaim.status = 'VERIFIED';
            workingClaim.confidence = Math.max(90, Math.min(98, workingClaim.confidence + 20));
            workingClaim.projectEvidence = `${workingClaim.projectEvidence} [Dynamic Sandbox Verified: ${dynamicResult.explanation}]`;
          } else if (dynamicResult.codeSupport === 'NOT_SUPPORTED' && workingClaim.status !== 'VERIFIED') {
            workingClaim.status = 'CONTRADICTED';
            workingClaim.recommendedJudgeQuestion = `Submitted codebase did not satisfy claimed performance in dynamic sandboxed tests. Please demonstrate this claim live.`;
          }
        } catch (err: any) {
          logger.warn(`Sandbox verification failed for claim ${workingClaim.id}`, { error: err.message });
        }
      }

      verifiedList.push(workingClaim);
    }

    return verifiedList;
  }
}

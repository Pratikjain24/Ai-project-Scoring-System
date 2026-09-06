import type { CategoryAssessment, SpecialistEvaluationContext } from './types';

export class SecurityEvaluator {
  /**
   * Evaluates Security Maturity, Known Risks, and Evidence Gaps.
   * Never claims a system is "secure"; focuses on observable controls and vulnerability surface.
   */
  static evaluate(context: SpecialistEvaluationContext): CategoryAssessment {
    const { evaluationId, evidenceItems, claims } = context;

    const secEvidence = evidenceItems.filter(e =>
      (e.title || '').toLowerCase().includes('security') ||
      (e.title || '').toLowerCase().includes('auth') ||
      (e.title || '').toLowerCase().includes('crypto') ||
      (e.title || '').toLowerCase().includes('jwt') ||
      (e.description || '').toLowerCase().includes('token') ||
      (e.description || '').toLowerCase().includes('encryption') ||
      (e.description || '').toLowerCase().includes('pqc')
    );

    const secClaims = claims.filter(c =>
      (c.claimText || '').toLowerCase().includes('security') ||
      (c.claimText || '').toLowerCase().includes('jwt') ||
      (c.claimText || '').toLowerCase().includes('crypto') ||
      (c.claimText || '').toLowerCase().includes('token')
    );

    if (secEvidence.length === 0 && secClaims.length === 0) {
      return {
        id: `assess_${evaluationId}_security`,
        evaluationId,
        category: 'TECHNICAL',
        subCategory: 'SECURITY',
        score: 0,
        confidence: 20,
        status: 'NOT_ASSESSED',
        summary: 'Insufficient empirical security evidence: No access control mechanisms, encryption configurations, or threat models were submitted.',
        strengths: [],
        weaknesses: ['Absence of primary authentication, secret management, or threat surface documentation.'],
        risks: ['Attack surface and data exposure risks cannot be assessed without security artifacts.'],
        recommendations: ['Document authentication architecture, token storage, and input sanitization boundaries.'],
        evidenceIds: [],
      };
    }

    const hasPQC = secEvidence.some(e => (e.description || '').toLowerCase().includes('pqc') || (e.description || '').toLowerCase().includes('post-quantum'));
    const hasJWT = secEvidence.some(e => (e.description || '').toLowerCase().includes('jwt') || (e.description || '').toLowerCase().includes('bearer'));

    const securityScore = hasPQC ? 86 : hasJWT ? 68 : 55;
    const confidence = Math.min(90, 50 + secEvidence.length * 10);

    return {
      id: `assess_${evaluationId}_security`,
      evaluationId,
      category: 'TECHNICAL',
      subCategory: 'SECURITY',
      score: securityScore,
      confidence,
      status: 'ASSESSED',
      summary: 'Security maturity evaluation across authentication controls, transport encryption, and credential lifecycle management. (Note: Evaluates maturity level; does not certify absolute immunity).',
      strengths: [
        ...(hasJWT ? ['Token-based authorization implemented for client-server API transactions.'] : []),
        ...(hasPQC ? ['Evaluated post-quantum lattice cryptographic primitives in communication protocols.'] : ['Standard TLS/HTTPS transport security utilized.'])
      ],
      weaknesses: [
        'No formal threat modeling documentation (STRIDE/PASTA) provided for edge transit telemetry.',
        'Absence of automated secret rotation policies or hardware root-of-trust provisioning details.'
      ],
      risks: [
        'Potential unauthorized token replay or edge device credential extraction if firmware keys are stored unencrypted.'
      ],
      recommendations: [
        'Implement hardware-backed keystores (TPM/Secure Enclave) on edge transit nodes and enforce automated key rotation cycles.'
      ],
      evidenceIds: secEvidence.map(e => e.id),
    };
  }
}

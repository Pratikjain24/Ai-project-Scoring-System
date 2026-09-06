import type { Claim } from '../models/claim';
import type { ResearchFinding } from '../models/research';
import type { Evidence } from '../models/evidence';

export class ClaimVerificationAgent {
  static async verifyClaims(
    claims: Claim[],
    findings: ResearchFinding[],
    _evidenceList: Evidence[]
  ): Promise<Claim[]> {
    return claims.map(claim => {
      // Cross-reference with external research findings
      const relatedFinding = findings.find(f =>
        f.keyClaimsMatched.some(k => claim.claimText.toLowerCase().includes(k.toLowerCase()))
      );

      if (claim.status === 'VERIFIED') {
        return claim;
      }

      if (relatedFinding && claim.status === 'UNVERIFIED') {
        return {
          ...claim,
          status: 'PARTIALLY_VERIFIED',
          confidence: Math.min(85, claim.confidence + 15),
          externalEvidence: relatedFinding.summary,
        };
      }

      return claim;
    });
  }
}

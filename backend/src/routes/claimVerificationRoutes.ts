import { Router } from 'express';
import { ClaimVerificationController } from '../controllers/claimVerificationController';

export const claimRouter = Router({ mergeParams: true });

// Evaluation-scoped claim endpoints:
// Mounted at: /api/evaluations/:id/claims
claimRouter.get('/', ClaimVerificationController.getClaims);
claimRouter.post('/analyze', ClaimVerificationController.analyze);
claimRouter.get('/verified', ClaimVerificationController.getVerifiedClaims);
claimRouter.get('/unverified', ClaimVerificationController.getUnverifiedClaims);
claimRouter.get('/contradictions', ClaimVerificationController.getContradictions);
claimRouter.get('/evidence-gaps', ClaimVerificationController.getEvidenceGaps);
claimRouter.get('/:claimId', ClaimVerificationController.getClaimDetail);
claimRouter.post('/:claimId/human-review', ClaimVerificationController.submitHumanReview);

// Direct claim-level router:
// Mounted at: /api/claims
export const singleClaimRouter = Router();
singleClaimRouter.get('/:claimId/evidence', ClaimVerificationController.getClaimEvidence);
singleClaimRouter.get('/:claimId/verification', ClaimVerificationController.getClaimVerification);
singleClaimRouter.get('/:claimId/question', ClaimVerificationController.getClaimQuestion);
singleClaimRouter.post('/:claimId/human-review', ClaimVerificationController.submitHumanReview);

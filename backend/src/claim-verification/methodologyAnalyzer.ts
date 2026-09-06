import type { Claim, ClaimParameters, MethodologyCompleteness } from '../models/claim';

export class MethodologyAnalyzer {
  /**
   * Evaluates empirical documentation completeness for a claim.
   * Checks for 10 foundational scientific / engineering criteria.
   */
  static analyze(
    claim: Claim,
    parameters?: ClaimParameters,
    associatedEvidence: any[] = []
  ): MethodologyCompleteness {
    const present: string[] = [];
    const missing: string[] = [];

    const evidenceContent = associatedEvidence.map(e => `${e.content || ''} ${e.source_title || ''} ${e.location || ''}`).join(' ').toLowerCase();
    const claimText = claim.claimText.toLowerCase();

    // 1. Dataset Specification
    if (parameters?.dataset || /dataset|grddc|coco|kitti|image collection/i.test(evidenceContent)) {
      present.push('Dataset specification');
    } else {
      missing.push('Dataset specification / source origin');
    }

    // 2. Sample Size / Volume
    if (/\b\d{3,}\s*(?:images|samples|frames|records|instances)\b/i.test(evidenceContent)) {
      present.push('Sample size volume');
    } else {
      missing.push('Sample size / test cohort volume');
    }

    // 3. Train / Test / Validation Split
    if (/train.*test|k-fold|cross-validation|80\/20|70\/30|split/i.test(evidenceContent)) {
      present.push('Data split / partition protocol');
    } else {
      missing.push('Train/test/validation split methodology');
    }

    // 4. Evaluation Metric Definition
    if (/mAP|iou|precision|recall|f1|accuracy|confusion matrix/i.test(evidenceContent)) {
      present.push('Formal evaluation metric definition');
    } else {
      missing.push('Explicit mathematical metric formulation');
    }

    // 5. Baseline Comparison
    if (/baseline|compared to|benchmark|state-of-the-art|prior work/i.test(evidenceContent)) {
      present.push('Comparative baseline benchmark');
    } else {
      missing.push('Comparative baseline / reference benchmark');
    }

    // 6. Experimental Conditions
    if (/lighting|resolution|weather|fps|batch size|epoch/i.test(evidenceContent)) {
      present.push('Defined experimental conditions');
    } else {
      missing.push('Controlled experimental conditions');
    }

    // 7. Hardware Environment
    if (/gpu|cpu|jetson|orin|rtx|cuda|ram/i.test(evidenceContent) || /hardware/i.test(evidenceContent)) {
      present.push('Hardware compute environment');
    } else {
      missing.push('Hardware execution specifications');
    }

    // 8. Software Environment / Libraries
    if (/pytorch|yolo|python|opencv|cuda|tensorrt|version/i.test(evidenceContent)) {
      present.push('Software stack & dependencies');
    } else {
      missing.push('Software environment versioning');
    }

    // 9. Validation Procedure
    if (/validation|re-test|independent test|statistical significance/i.test(evidenceContent)) {
      present.push('Empirical validation procedure');
    } else {
      missing.push('Independent validation procedure');
    }

    // 10. Reproducibility Scripts / Code
    if (/github|repo|script|requirements\.txt|reproducible/i.test(evidenceContent)) {
      present.push('Reproducibility code / execution scripts');
    } else {
      missing.push('Public reproducibility artifact or script');
    }

    // Non-quantitative / qualitative claims have different baseline expectations
    const isQuantitative = claim.claimType === 'ACCURACY' ||
      claim.claimType === 'PERFORMANCE' ||
      claim.claimType === 'COST' ||
      claim.claimType === 'SPEED' ||
      claim.claimType === 'LATENCY';

    const totalCriteria = 10;
    const score = Math.round((present.length / totalCriteria) * 100);

    let details = '';
    if (score >= 80) {
      details = `Methodology is comprehensively documented (${present.length}/10 criteria verified). High empirical rigor.`;
    } else if (score >= 50) {
      details = `Methodology is partially specified (${present.length}/10 criteria present). Missing: ${missing.slice(0, 2).join(', ')}.`;
    } else if (isQuantitative) {
      details = `Insufficient experimental documentation for quantitative claim (${present.length}/10 criteria met). Crucial empirical gaps: ${missing.slice(0, 3).join('; ')}.`;
    } else {
      details = `Qualitative or architectural assertion with standard descriptive context (${present.length}/10 scientific factors present).`;
    }

    return {
      score,
      presentElements: present,
      missingElements: missing,
      details,
    };
  }
}

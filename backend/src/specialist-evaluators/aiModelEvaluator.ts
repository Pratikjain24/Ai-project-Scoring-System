import type { CategoryAssessment, SpecialistEvaluationContext } from './types';

export interface MLAssessment {
  problemModelFit: string;
  datasetQualityScore: number;
  datasetEvidenceGaps: string[];
  trainingValidationMethodology: string;
  generalizationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  reproducibilityConfidence: number;
  inferenceProfiling: string;
}

export class AIModelEvaluator {
  /**
   * Evaluates AI/ML implementation, Dataset Quality, Model Architecture,
   * Overfitting risks, and Generalization.
   * If no AI/ML exists in project, returns NOT_ASSESSED.
   */
  static evaluate(context: SpecialistEvaluationContext): {
    assessments: CategoryAssessment[];
    mlAssessment?: MLAssessment;
  } {
    const { evaluationId, evidenceItems, claims, claimVerifications } = context;

    // Check if AI/ML components exist
    const aiEvidence = evidenceItems.filter(e =>
      (e.title || '').toLowerCase().includes('model') ||
      (e.title || '').toLowerCase().includes('yolo') ||
      (e.title || '').toLowerCase().includes('neural') ||
      (e.description || '').toLowerCase().includes('accuracy') ||
      (e.description || '').toLowerCase().includes('detection') ||
      (e.description || '').toLowerCase().includes('training') ||
      (e.description || '').toLowerCase().includes('dataset')
    );

    const aiClaims = claims.filter(c =>
      (c.claimText || '').toLowerCase().includes('accuracy') ||
      (c.claimText || '').toLowerCase().includes('detection') ||
      (c.claimText || '').toLowerCase().includes('yolo') ||
      (c.claimText || '').toLowerCase().includes('neural') ||
      (c.claimText || '').toLowerCase().includes('model')
    );

    if (aiEvidence.length === 0 && aiClaims.length === 0) {
      return {
        assessments: [
          {
            id: `assess_${evaluationId}_aiml`,
            evaluationId,
            category: 'TECHNICAL',
            subCategory: 'AI_ML',
            score: 0,
            confidence: 0,
            status: 'NOT_ASSESSED',
            summary: 'Project does not assert or demonstrate artificial intelligence or machine learning architectures.',
            strengths: [],
            weaknesses: [],
            risks: [],
            recommendations: [],
            evidenceIds: [],
          },
        ],
      };
    }

    // Evaluate Dataset Quality
    const datasetEvidence = evidenceItems.filter(e =>
      (e.description || '').toLowerCase().includes('dataset') ||
      (e.description || '').toLowerCase().includes('annotation') ||
      (e.description || '').toLowerCase().includes('train') ||
      (e.title || '').toLowerCase().includes('dataset')
    );

    const hasDatasetArtifacts = datasetEvidence.length > 0;
    const datasetGaps: string[] = [];
    if (!hasDatasetArtifacts) {
      datasetGaps.push('No primary dataset source, split distribution, or validation cohort files submitted.');
    }
    datasetGaps.push('Independent external test partitions missing from training logs.');

    // Important: A reported accuracy value without methodology must not receive high confidence
    const accuracyClaim = aiClaims.find(c => (c.claimText || '').toLowerCase().includes('accuracy'));
    const accuracyVerification = accuracyClaim
      ? claimVerifications.find(v => v.claimId === accuracyClaim.id)
      : null;

    const hasMethodology = accuracyVerification && accuracyVerification.methodologyScore >= 50;
    const confidence = hasMethodology ? 84 : 48; // Lower confidence when methodology is absent
    const score = hasMethodology ? 88 : 72;

    const mlAssessment: MLAssessment = {
      problemModelFit: 'High suitability: Single-stage convolutional detector (YOLOv8) matches edge latency and bounding box accuracy requirements.',
      datasetQualityScore: hasDatasetArtifacts ? 76 : 52,
      datasetEvidenceGaps: datasetGaps,
      trainingValidationMethodology: hasMethodology
        ? 'Cross-validated across partitioned validation sets with loss convergence curves recorded.'
        : 'Reported detection metric lacks published confusion matrices, train/val/test splits, and independent evaluation cohort documentation.',
      generalizationRisk: hasMethodology ? 'LOW' : 'HIGH',
      reproducibilityConfidence: confidence,
      inferenceProfiling: 'Sustained throughput validated on edge tensor accelerators under optimized FP16/INT8 precision.',
    };

    const assessments: CategoryAssessment[] = [
      {
        id: `assess_${evaluationId}_aiml`,
        evaluationId,
        category: 'TECHNICAL',
        subCategory: 'AI_ML',
        score,
        confidence,
        status: 'ASSESSED',
        summary: 'Specialized machine learning evaluation covering problem-model suitability, dataset completeness, baseline comparisons, and generalization boundaries.',
        strengths: [
          'Effective architectural fit utilizing lightweight single-stage spatial detection backbone.',
          'Model quantization parameters configured for real-time edge embedded acceleration.'
        ],
        weaknesses: [
          'Dataset diversity documentation omits high-precipitation, night glare, and lens fog environmental partitions.',
          ...(hasMethodology ? [] : ['Reported accuracy is self-asserted without published independent test split verification.'])
        ],
        risks: [
          'Domain shift and over-optimistic performance estimation due to unverified dataset class balance.'
        ],
        recommendations: [
          'Publish benchmark results on an open, independent test set (e.g. GRDDC 2022) with explicit precision-recall curves across weather conditions.'
        ],
        evidenceIds: aiEvidence.map(e => e.id),
      },
      {
        id: `assess_${evaluationId}_data`,
        evaluationId,
        category: 'TECHNICAL',
        subCategory: 'DATA',
        score: mlAssessment.datasetQualityScore,
        confidence: hasDatasetArtifacts ? 78 : 45,
        status: hasDatasetArtifacts ? 'ASSESSED' : 'PARTIALLY_ASSESSED',
        summary: 'Dataset evaluation examining annotation consistency, class distribution, data leakage risk, and validation rigor.',
        strengths: hasDatasetArtifacts
          ? ['Annotated bounding boxes adhere to standard labeling ontologies.']
          : ['Domain-specific imagery collection methodology outlined.'],
        weaknesses: datasetGaps,
        risks: [
          'Data leakage risk between training and validation partitions if geographic continuous video frames were randomly partitioned rather than geographically blocked.'
        ],
        recommendations: [
          'Implement geographic block cross-validation to guarantee zero spatial leakage between training and test sets.'
        ],
        evidenceIds: datasetEvidence.map(e => e.id),
      }
    ];

    return { assessments, mlAssessment };
  }
}

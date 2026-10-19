import type { Claim } from '../models/claim';
import type { Evidence } from '../models/evidence';
import type { Project } from '../models/project';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { DomainSynthesisService } from '../services/domainSynthesisService';

export class ClaimExtractionAgent {
  static async extract(
    evaluationId: string,
    evidenceList: Evidence[],
    projectParam?: Project
  ): Promise<Claim[]> {
    const now = new Date().toISOString();
    const evidenceIds = evidenceList.map(e => e.id);

    let project = projectParam;
    if (!project) {
      const evalRecord = EvaluationRepository.findById(evaluationId);
      if (evalRecord?.projectId) {
        project = ProjectRepository.findById(evalRecord.projectId) || undefined;
      }
    }

    if (project && project.id !== 'smart-road-vision' && !project.name.toLowerCase().includes('smart road')) {
      return DomainSynthesisService.synthesizeClaims(evaluationId, project, evidenceList);
    }

    return [
      {
        id: `clm_${evaluationId}_1`,
        evaluationId,
        claimText: 'Model achieves 95.4% mAP50 precision on municipal asphalt anomaly detection.',
        claimType: 'ACCURACY',
        importance: 'CRITICAL',
        status: 'PARTIALLY_VERIFIED',
        confidence: 68,
        projectEvidence: 'Internal benchmark results submitted in Slide 14 of pitch deck and validation table in PDF.',
        externalEvidence: 'Independent third-party validation missing; open-source RDD2022 dataset averages 84% on comparable architectures.',
        explanation: 'Strong internal validation artifacts provided, but missing independent blind cross-validation logs on unseen rainy weather conditions.',
        recommendedJudgeQuestion: 'How was the 95.4% precision verified outside the curated local training split, particularly across unlit rural roadways and rain-slicked pavement?',
        supportingEvidenceIds: evidenceIds.slice(0, 2),
        contradictingEvidenceIds: [],
        createdAt: now,
      },
      {
        id: `clm_${evaluationId}_2`,
        evaluationId,
        claimText: 'Edge inference pipeline sustains 54 FPS throughput on NVIDIA Jetson Orin Nano.',
        claimType: 'PERFORMANCE',
        importance: 'HIGH',
        status: 'VERIFIED',
        confidence: 94,
        projectEvidence: 'Demonstrated in 1080p60 MP4 benchmark capture showing live FPS counter averaging 54.2 FPS with TensorRT INT8 quantization.',
        externalEvidence: 'Consistent with NVIDIA official TensorRT benchmarks for 384x384 YOLO lightweight variants on 20W power envelope.',
        explanation: 'Direct frame-accurate benchmark evidence confirms hardware quantization throughput with sub-20ms frame latency.',
        recommendedJudgeQuestion: undefined,
        supportingEvidenceIds: evidenceIds.slice(2, 4),
        contradictingEvidenceIds: [],
        createdAt: now,
      },
      {
        id: `clm_${evaluationId}_3`,
        evaluationId,
        claimText: 'Reduces municipal reactive road repair expenditures by up to 40% ($4.2M annually).',
        claimType: 'FEASIBILITY',
        importance: 'HIGH',
        status: 'PARTIALLY_VERIFIED',
        confidence: 72,
        projectEvidence: 'Municipal case study cited in whitepaper referencing Department of Transportation road lifecycle decay curve.',
        externalEvidence: 'Econometric models from Federal Highway Administration support 30-45% cost savings for proactive surface sealing vs full milling.',
        explanation: 'Economic rationale is robust and theoretically validated, though actual pilot savings will depend on local contractor renegotiation speeds.',
        recommendedJudgeQuestion: 'What is the minimum municipal transit fleet density required before the predictive maintenance dispatching achieves financial breakeven?',
        supportingEvidenceIds: evidenceIds.slice(0, 1),
        contradictingEvidenceIds: [],
        createdAt: now,
      },
      {
        id: `clm_${evaluationId}_4`,
        evaluationId,
        claimText: 'Zero data packet loss when synchronizing road anomaly GeoJSON over 5G mesh.',
        claimType: 'PERFORMANCE',
        importance: 'MEDIUM',
        status: 'UNVERIFIED',
        confidence: 52,
        projectEvidence: 'Mentioned in architecture bullet point without raw network transmission telemetry dumps.',
        externalEvidence: 'Standard cellular fleet coverage gaps in tunnel zones contradict zero packet loss without store-and-forward disk queuing.',
        explanation: 'Local offline caching mechanism is mentioned in code comments but no simulated cellular dropout tests were submitted.',
        recommendedJudgeQuestion: 'Can you demonstrate how the SQLite ring buffer guarantees idempotent re-transmission when buses transit through cellular dead zones?',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: evidenceIds.slice(3, 4),
        createdAt: now,
      }
    ];
  }
}

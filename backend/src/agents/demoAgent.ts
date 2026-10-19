import type { DemoAnalysis, DemoFeatureAudit } from '../models/presentation';
import type { Evidence } from '../models/evidence';
import type { Project } from '../models/project';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { ProjectRepository } from '../repositories/projectRepository';
import { DomainSynthesisService } from '../services/domainSynthesisService';

export class DemoAgent {
  static async evaluate(
    evaluationId: string,
    evidenceList: Evidence[],
    projectParam?: Project
  ): Promise<DemoAnalysis> {
    const evidenceIds = evidenceList.map(e => e.id);

    let project = projectParam;
    if (!project) {
      const evalRecord = EvaluationRepository.findById(evaluationId);
      if (evalRecord?.projectId) {
        project = ProjectRepository.findById(evalRecord.projectId) || undefined;
      }
    }

    if (project && project.id !== 'smart-road-vision' && !project.name.toLowerCase().includes('smart road')) {
      const res = DomainSynthesisService.synthesizePresentationAndDemo(evaluationId, project, evidenceList);
      return res.demo;
    }

    const featuresAudited: DemoFeatureAudit[] = [
      {
        id: `feat_${evaluationId}_1`,
        featureName: 'Edge Video Defect Detection',
        status: 'SUCCESSFUL',
        observedLatencyMs: 18.4,
        observedOutput: 'Bounding boxes rendered at 54.2 FPS with class confidence > 0.88',
        claimId: `clm_${evaluationId}_2`,
        evidenceId: evidenceIds[1],
        notes: 'Verified live in recorded Jetson Orin Nano benchmark screen capture.',
      },
      {
        id: `feat_${evaluationId}_2`,
        featureName: 'Sub-Meter GPS Trajectory Smoothing',
        status: 'SUCCESSFUL',
        observedLatencyMs: 2.1,
        observedOutput: 'Extended Kalman Filter smoothed GPS drift to < 0.6m radius',
        evidenceId: evidenceIds[0],
        notes: 'Demonstrated against ground truth RTK station baseline telemetry.',
      },
      {
        id: `feat_${evaluationId}_3`,
        featureName: 'Automated 5G Work-Order Dispatch',
        status: 'SUCCESSFUL',
        observedOutput: 'GeoJSON payload successfully pushed to mock municipal dispatch endpoint',
        evidenceId: evidenceIds[2],
        notes: 'HTTP 201 Created response received with generated work-order ticket #4819.',
      },
      {
        id: `feat_${evaluationId}_4`,
        featureName: 'Heavy Rainfall / Night-Time Anomaly Inference',
        status: 'NOT_DEMONSTRATED',
        notes: 'No video or hardware bench run was submitted demonstrating low-light or rain-slicked road surfaces.',
      }
    ];

    return {
      id: `demo_${evaluationId}`,
      evaluationId,
      demoScore: 84,
      completenessPercentage: 75,
      featuresAudited,
      observedErrors: [
        'Frame drop of ~6 frames during transition into dark underpass scene.'
      ],
      unsupportedClaims: [
        'Night-time 95% accuracy claim was not corroborated by active demonstration media.'
      ],
      evidenceIds: evidenceIds.slice(0, 4),
      createdAt: new Date().toISOString(),
    };
  }
}

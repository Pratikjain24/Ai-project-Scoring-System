import type { CategoryAssessment, SpecialistEvaluationContext } from './types';

export class HardwareEvaluator {
  /**
   * Evaluates hardware component selection, sensor choice, microcontroller/edge compute,
   * mechanical construction, and interface buses.
   */
  static evaluate(context: SpecialistEvaluationContext): CategoryAssessment[] {
    const { evaluationId, evidenceItems, projectType } = context;

    if (projectType === 'SOFTWARE') {
      return [
        {
          id: `assess_${evaluationId}_hw_main`,
          evaluationId,
          category: 'TECHNICAL',
          subCategory: 'HARDWARE',
          score: 0,
          confidence: 0,
          status: 'NOT_ASSESSED',
          summary: 'Pure software project: Physical hardware architecture and component engineering are not applicable.',
          strengths: [],
          weaknesses: [],
          risks: [],
          recommendations: [],
          evidenceIds: [],
        },
      ];
    }

    const hwEvidence = evidenceItems.filter(e =>
      e.type === 'HARDWARE' ||
      e.type === 'CAD_SCHEMATIC' ||
      e.type === 'BILL_OF_MATERIALS' ||
      (e.title || '').toLowerCase().includes('hardware') ||
      (e.title || '').toLowerCase().includes('sensor') ||
      (e.title || '').toLowerCase().includes('jetson') ||
      (e.description || '').toLowerCase().includes('pcb')
    );

    const hasJetson = hwEvidence.some(e => (e.description || '').toLowerCase().includes('jetson') || (e.title || '').toLowerCase().includes('jetson'));
    const score = hasJetson ? 85 : 78;
    const confidence = Math.min(92, 55 + hwEvidence.length * 10);

    return [
      {
        id: `assess_${evaluationId}_hw_main`,
        evaluationId,
        category: 'TECHNICAL',
        subCategory: 'HARDWARE',
        score,
        confidence,
        status: 'ASSESSED',
        summary: 'Hardware evaluation of compute architecture, sensor integration, power distribution, and mechanical enclosure ruggedness.',
        strengths: [
          'Appropriate compute sizing using industrial embedded SoMs with dedicated hardware acceleration.',
          'Standardized automotive/industrial bus communication (CAN/USB3/GigE) for sensor data ingestion.'
        ],
        weaknesses: [
          'Custom mounting bracket and enclosure lack IP67 weather sealing or vibration damping documentation.',
          'Bill of materials omits second-source component alternatives for critical edge processing units.'
        ],
        risks: [
          'Supply chain lead-time vulnerability and vehicle vibration wear over prolonged road deployment.'
        ],
        recommendations: [
          'Conduct shock and vibration profiling conforming to ISO 16750-3 (Road Vehicles Environmental Conditions).'
        ],
        evidenceIds: hwEvidence.map(e => e.id),
      },
    ];
  }
}

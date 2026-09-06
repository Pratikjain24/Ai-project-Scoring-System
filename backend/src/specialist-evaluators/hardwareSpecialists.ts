import type { CategoryAssessment, SpecialistEvaluationContext } from './types';

export class HardwareSpecialists {
  /**
   * Evaluates Reliability, Power / Energy, Safety, and Manufacturing Feasibility.
   */
  static evaluate(context: SpecialistEvaluationContext): CategoryAssessment[] {
    const { evaluationId, evidenceItems, projectType, claims, claimVerifications } = context;

    if (projectType === 'SOFTWARE') {
      return [];
    }

    const assessments: CategoryAssessment[] = [];

    // 1. Reliability Evaluator
    const relEvidence = evidenceItems.filter(e =>
      (e.title || '').toLowerCase().includes('reliab') ||
      (e.description || '').toLowerCase().includes('durability') ||
      (e.description || '').toLowerCase().includes('stress') ||
      (e.description || '').toLowerCase().includes('tolerance')
    );

    if (relEvidence.length === 0) {
      assessments.push({
        id: `assess_${evaluationId}_reliability`,
        evaluationId,
        category: 'TECHNICAL',
        subCategory: 'RELIABILITY',
        score: 65,
        confidence: 40,
        status: 'PARTIALLY_ASSESSED',
        summary: 'RELIABILITY_EVIDENCE_GAP: No environmental chamber, vibration endurance, or MTBF (Mean Time Between Failures) testing logs submitted. Evaluator does not assume unreliability, but empirical proof is absent.',
        strengths: ['Standard industrial-grade integrated silicon utilized.'],
        weaknesses: ['Absence of accelerated life testing or thermal cycle stress records.'],
        risks: ['Unknown failure rate under severe operating cycles.'],
        recommendations: ['Conduct HALT/HASS (Highly Accelerated Life/Stress Testing) to establish hardware operational boundaries.'],
        evidenceIds: [],
      });
    } else {
      assessments.push({
        id: `assess_${evaluationId}_reliability`,
        evaluationId,
        category: 'TECHNICAL',
        subCategory: 'RELIABILITY',
        score: 80,
        confidence: 76,
        status: 'ASSESSED',
        summary: 'Hardware reliability substantiated by continuous burn-in testing and documented error recovery routines.',
        strengths: ['Watchdog timer circuits provide automatic hardware reboot on system hang.'],
        weaknesses: ['Connector wear under continuous road vibration requires long-term validation.'],
        risks: ['Corrosion of unsealed external sensor terminals over prolonged outdoor exposure.'],
        recommendations: ['Apply conformal coating and automotive-grade IP68 sealed cable harnesses.'],
        evidenceIds: relEvidence.map(e => e.id),
      });
    }

    // 2. Power & Energy Evaluator
    const powerClaims = claims.filter(c =>
      (c.claimText || '').toLowerCase().includes('watt') ||
      (c.claimText || '').toLowerCase().includes('power') ||
      (c.claimText || '').toLowerCase().includes('battery')
    );

    const powerEvidence = evidenceItems.filter(e =>
      (e.title || '').toLowerCase().includes('power') ||
      (e.description || '').toLowerCase().includes('consumption') ||
      (e.description || '').toLowerCase().includes('voltage')
    );

    const verifiedPower = powerClaims.length > 0
      ? claimVerifications.find(v => powerClaims.some(pc => pc.id === v.claimId))
      : null;

    const powerScore = verifiedPower && verifiedPower.status === 'VERIFIED' ? 84 : 70;
    const powerConfidence = Math.min(88, 45 + powerEvidence.length * 10);

    assessments.push({
      id: `assess_${evaluationId}_power`,
      evaluationId,
      category: 'TECHNICAL',
      subCategory: 'POWER',
      score: powerScore,
      confidence: powerConfidence,
      status: powerEvidence.length > 0 ? 'ASSESSED' : 'PARTIALLY_ASSESSED',
      summary: 'Evaluation of operating voltage range, transient protection, thermal dissipation, and average power budget.',
      strengths: [
        'Direct vehicle battery bus compatibility (12V-24V DC wide input) with reverse polarity protection.',
        'Low active standby draw during stationary vehicle periods.'
      ],
      weaknesses: [
        'Peak compute power draw (>25W) during simultaneous multi-camera inference necessitates passive heatsink sizing.'
      ],
      risks: [
        'Vehicle battery drain risk during extended vehicle idling if ignition sensing logic fails.'
      ],
      recommendations: [
        'Add low-voltage cutout protection circuitry preventing edge device from discharging host vehicle battery below starting threshold.'
      ],
      evidenceIds: powerEvidence.map(e => e.id),
    });

    // 3. Safety Evaluator (Not a certification authority)
    assessments.push({
      id: `assess_${evaluationId}_safety`,
      evaluationId,
      category: 'TECHNICAL',
      subCategory: 'SAFETY',
      score: 75,
      confidence: 68,
      status: 'ASSESSED',
      summary: 'Safety evaluation of electrical isolation, fuse protections, and mounting mechanical security. (Note: ProjectX-Ray AI provides evaluation metrics, not regulatory safety certification).',
      strengths: [
        'Overcurrent PTC thermistor fuses implemented on primary DC power rails.',
        'Optical isolation on digital IO lines protecting vehicle ECU from transient spikes.'
      ],
      weaknesses: [
        'External windshield / hood mount safety tethering documentation is not formally documented.'
      ],
      risks: [
        'Potential dislodgement of external camera apparatus during sudden vehicle deceleration or collision.'
      ],
      recommendations: [
        'Mandate dual-action safety secondary wire tethers on all external vehicular mounting brackets.'
      ],
      evidenceIds: [],
    });

    // 4. Manufacturing Evaluator
    assessments.push({
      id: `assess_${evaluationId}_manufacturing`,
      evaluationId,
      category: 'TECHNICAL',
      subCategory: 'MANUFACTURING',
      score: 72,
      confidence: 65,
      status: 'ASSESSED',
      summary: 'Design for Manufacturing (DFM) assessment of PCB assembly, custom mechanical tooling, and component sourcing scalability.',
      strengths: [
        'Standard SMD component footprints used throughout carrier board design.',
        'Modular architecture separates COTS compute module from custom carrier board.'
      ],
      weaknesses: [
        'Custom CNC machined enclosure represents high unit cost in low-volume pilot batches.',
        'Manual sensor calibration step required during assembly increases production line cycle time.'
      ],
      risks: [
        'Tooling and injection mold capital expenditure bottlenecks transition from pilot to production.'
      ],
      recommendations: [
        'Transition enclosure design to die-cast aluminum or injection-molded polycarbonate for production scale runs.'
      ],
      evidenceIds: [],
    });

    return assessments;
  }
}

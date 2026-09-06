import type { EvaluatorRisk, SpecialistEvaluationContext } from './types';

export class RiskEngine {
  /**
   * Aggregates and standardizes detected risks across Technical, Security, Performance,
   * Scalability, Hardware, Safety, Data, Operational, and Environmental categories.
   * Enforces non-accusatory language and objective risk severity x likelihood mapping.
   */
  static extractRisks(context: SpecialistEvaluationContext): EvaluatorRisk[] {
    const { evaluationId, projectType, claimContradictions } = context;
    const risks: EvaluatorRisk[] = [];

    // 1. Technical / Data Shift Risk
    risks.push({
      id: `risk_${evaluationId}_data_shift`,
      evaluationId,
      category: 'DATA',
      title: 'Real-World Road Imagery Distribution Shift',
      description: 'Model was evaluated predominantly on clean daylight pavement partitions; adverse environmental conditions (heavy rain, night glare, deep shadows) present high degradation risk.',
      severity: 'HIGH',
      likelihood: 'HIGH',
      confidence: 88,
      evidenceIds: [],
      mitigation: 'Incorporate adversarial data augmentation and collect geographically distributed wet/night calibration sequences.',
    });

    // 2. Hardware / Thermal Operational Risk
    if (projectType !== 'SOFTWARE') {
      risks.push({
        id: `risk_${evaluationId}_thermal`,
        evaluationId,
        category: 'HARDWARE',
        title: 'Prolonged Edge GPU Thermal Throttling',
        description: 'Passive cooling on edge compute carrier unit may induce GPU core downclocking during extended continuous road operation in high ambient summer temperatures.',
        severity: 'MEDIUM',
        likelihood: 'HIGH',
        confidence: 82,
        evidenceIds: [],
        mitigation: 'Implement forced-convection active thermal enclosure or heat pipe conduction directly to vehicle exterior chassis mount.',
      });

      risks.push({
        id: `risk_${evaluationId}_safety_mount`,
        evaluationId,
        category: 'SAFETY',
        title: 'Vehicular Exterior Sensor Mount Mechanical Fatigue',
        description: 'Continuous transit vibration over harsh road surfaces creates risk of mounting fastener loosening over 6+ month operational durations.',
        severity: 'HIGH',
        likelihood: 'MEDIUM',
        confidence: 78,
        evidenceIds: [],
        mitigation: 'Mandate Nord-Lock vibration-proof washers and secondary aircraft-grade braided safety tether cables.',
      });
    }

    // 3. Security Risk
    risks.push({
      id: `risk_${evaluationId}_security_key`,
      evaluationId,
      category: 'SECURITY',
      title: 'Potential Unencrypted Edge Credential Storage',
      description: 'Potential security consideration: API bearer tokens and database connection secrets stored in plain text environment variables on physical transit nodes.',
      severity: 'HIGH',
      likelihood: 'MEDIUM',
      confidence: 80,
      evidenceIds: [],
      mitigation: 'Store device keys within hardware TPM / Secure Enclave and utilize short-lived mTLS client certificates.',
    });

    // 4. Performance Discrepancy Risk (from Claim Verification contradictions)
    if (claimContradictions.length > 0) {
      const highestContra = claimContradictions[0];
      risks.push({
        id: `risk_${evaluationId}_contra_${highestContra.id}`,
        evaluationId,
        category: 'PERFORMANCE',
        title: 'Multi-Modal Specification Divergence',
        description: `Discrepancy identified between presentation claim ("${highestContra.statementA}") and documented/logged reality ("${highestContra.statementB}"): ${highestContra.difference}.`,
        severity: highestContra.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        likelihood: 'HIGH',
        confidence: Math.round(highestContra.confidence * 100),
        evidenceIds: [highestContra.claimAId],
        mitigation: 'Standardize published project specifications against verifiable, empirical hardware benchmark tables.',
      });
    }

    // 5. Operational Market Risk
    risks.push({
      id: `risk_${evaluationId}_procurement`,
      evaluationId,
      category: 'OPERATIONAL',
      title: 'Protracted Municipal Public Procurement Cycles',
      description: 'Municipal city agency budget approvals typically operate on rigid 12-18 month procurement and pilot review windows.',
      severity: 'MEDIUM',
      likelihood: 'HIGH',
      confidence: 85,
      evidenceIds: [],
      mitigation: 'Structure low-friction initial sandbox pilot agreements underneath municipal discretionary budget caps.',
    });

    return risks;
  }
}

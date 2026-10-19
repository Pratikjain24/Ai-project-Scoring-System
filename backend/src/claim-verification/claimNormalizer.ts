import type { ClaimParameters, ClaimType, ClaimImportance } from '../models/claim';

export class ClaimNormalizer {
  /**
   * Converts natural language claim text into structured ClaimParameters
   * without hallucinating or inventing missing attributes.
   */
  static normalize(claimText: string, claimType: ClaimType): ClaimParameters {
    const text = claimText.trim();
    let metric: string | undefined;
    let value: string | undefined;
    let unit: string | undefined;
    let dataset: string | undefined;
    let condition: string | undefined;
    let evaluationMethod: string | undefined;

    // Pattern 1: Percentage values (e.g. "95% accuracy", "40% cheaper", "70% reduction")
    const pctMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (pctMatch) {
      value = pctMatch[1];
      unit = 'percent';
    }

    // Pattern 2: Milliseconds / FPS / Latency
    const msMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ms|milliseconds)/i);
    if (msMatch) {
      value = msMatch[1];
      unit = 'ms';
      metric = 'latency';
    }

    const fpsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:fps|frames per second)/i);
    if (fpsMatch) {
      value = fpsMatch[1];
      unit = 'fps';
      metric = 'throughput';
    }

    // Derive metric from claimType or keywords
    if (!metric) {
      if (/accuracy/i.test(text)) metric = 'accuracy';
      else if (/precision/i.test(text)) metric = 'precision';
      else if (/recall/i.test(text)) metric = 'recall';
      else if (/f1/i.test(text)) metric = 'f1_score';
      else if (/cost|cheaper|savings/i.test(text)) metric = 'cost_reduction';
      else if (/speed|throughput/i.test(text)) metric = 'speed';
      else if (/latency|delay/i.test(text)) metric = 'latency';
      else if (/energy|battery|power/i.test(text)) metric = 'energy_consumption';
      else if (/time/i.test(text)) metric = 'time_reduction';
      else metric = claimType.toLowerCase();
    }

    // Check for evaluation method
    if (/benchmark|holdout|k-fold|validation|test\s+split/i.test(text)) {
      evaluationMethod = 'Benchmark Dataset Validation';
    }

    // Check for explicit dataset mentions
    if (/on\s+([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)?\s+(?:dataset|benchmark))/i.test(text)) {
      const match = text.match(/on\s+([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)?\s+(?:dataset|benchmark))/i);
      if (match) dataset = match[1];
    } else if (/grddc/i.test(text)) {
      dataset = 'GRDDC-2022';
    } else if (/coco/i.test(text)) {
      dataset = 'COCO';
    }

    // Extract subject
    let subject = 'System Model / Subsystem';
    if (/pothole|road/i.test(text)) {
      subject = 'Pothole Detection Pipeline';
    } else if (/yolo/i.test(text)) {
      subject = 'YOLOv8 Computer Vision Architecture';
    } else if (/auth|jwt|security/i.test(text)) {
      subject = 'Authentication & Access Control Subsystem';
    } else if (/weather|condition/i.test(text)) {
      subject = 'Environmental Robustness';
    } else if (/cost|price|economy/i.test(text)) {
      subject = 'Financial & Operational Efficiency';
    }

    // Conditions
    if (/real-time/i.test(text)) condition = 'Real-time edge execution';
    if (/all weather/i.test(text)) condition = 'Unconstrained atmospheric conditions';

    return {
      subject,
      metric,
      value,
      unit,
      condition,
      dataset,
      evaluationMethod,
    };
  }

  /**
   * Assigns claim importance based on claim type, quantitativeness, and evaluative criticality.
   */
  static classifyImportance(claimText: string, claimType: ClaimType): ClaimImportance {
    const text = claimText.toLowerCase();

    // Critical: core model accuracy or performance on primary task
    if ((claimType === 'ACCURACY' || claimType === 'PERFORMANCE') && /\d+%/.test(text)) {
      return 'CRITICAL';
    }
    if (claimType === 'SECURITY' || /zero-trust|unauthorized/i.test(text)) {
      return 'HIGH';
    }
    if (
      claimType === 'SPEED' ||
      claimType === 'LATENCY' ||
      claimType === 'COST' ||
      claimType === 'EFFICIENCY' ||
      claimType === 'ENERGY'
    ) {
      return 'HIGH';
    }
    if (claimType === 'TECHNICAL' || claimType === 'INNOVATION') {
      return 'MEDIUM';
    }
    if (/dashboard|ui|interface|pretty|easy/i.test(text)) {
      return 'LOW';
    }

    return 'MEDIUM';
  }

  static inferImportance(claimType: ClaimType, claimText: string): ClaimImportance {
    return ClaimNormalizer.classifyImportance(claimText, claimType);
  }
}

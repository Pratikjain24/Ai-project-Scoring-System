import type { WeightPreset, JuryVerdictLevel } from '../types/aiJuryScoring';

export interface VerdictThreshold {
  level: JuryVerdictLevel;
  minScore: number;
  maxScore: number;
  label: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  glowColor: string;
  description: string;
}

export const VERDICT_THRESHOLDS: VerdictThreshold[] = [
  {
    level: 'Exceptional',
    minScore: 90,
    maxScore: 100,
    label: 'Exceptional (Tier 1 Consensus)',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-400',
    textColor: 'text-emerald-300',
    glowColor: 'shadow-[0_0_20px_rgba(52,211,153,0.35)]',
    description: 'Breakthrough work meeting commercial deployment or peer-reviewed publication standards with unassailable empirical verification.'
  },
  {
    level: 'Strong',
    minScore: 80,
    maxScore: 89,
    label: 'Strong (Tier 2 Recommended)',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-400',
    textColor: 'text-cyan-300',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    description: 'High-caliber execution with robust technical grounding, proven novelty, and clear utility, subject to targeted hardware/software optimizations.'
  },
  {
    level: 'Promising',
    minScore: 70,
    maxScore: 79,
    label: 'Promising (Tier 3 Incubation)',
    badgeBg: 'bg-blue-950/80',
    badgeBorder: 'border-blue-400',
    textColor: 'text-blue-300',
    glowColor: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    description: 'Solid foundational concept with demonstrable promise, but requiring substantial remediation in live reliability or claim verification.'
  },
  {
    level: 'Needs Improvement',
    minScore: 50,
    maxScore: 69,
    label: 'Needs Improvement (Tier 4 Revision)',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-400',
    textColor: 'text-amber-300',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    description: 'Significant gaps observed between oral claims and demonstrated functionality, or high architectural/failure vulnerabilities.'
  },
  {
    level: 'Weak',
    minScore: 0,
    maxScore: 49,
    label: 'Weak (Tier 5 Critical Non-Viable)',
    badgeBg: 'bg-rose-950/80',
    badgeBorder: 'border-rose-400',
    textColor: 'text-rose-300',
    glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    description: 'Unverifiable claims, irreproducible demonstrations, severe safety or IP infringements, or lack of discernible original engineering.'
  }
];

export const WEIGHT_PRESETS: WeightPreset[] = [
  {
    id: 'standard-academic',
    name: 'Standard Academic Defense',
    description: 'Balanced rubric standard for Master’s/Doctoral engineering juries with equal emphasis on theory and demonstration.',
    weights: {
      'problem-need': 10,
      'technical-quality': 20,
      'innovation-originality': 15,
      'social-impact': 10,
      'presentation': 10,
      'demonstration-quality': 15,
      'feasibility-scalability': 10,
      'future-potential': 10
    }
  },
  {
    id: 'venture-commercial',
    name: 'Venture & Commercial Impact',
    description: 'Prioritizes immediate market problem, social impact, unit economics, and production feasibility.',
    weights: {
      'problem-need': 20,
      'technical-quality': 15,
      'innovation-originality': 10,
      'social-impact': 15,
      'presentation': 10,
      'demonstration-quality': 10,
      'feasibility-scalability': 15,
      'future-potential': 5
    }
  },
  {
    id: 'engineering-rigor',
    name: 'Technical & Engineering Rigor',
    description: 'Heavy emphasis on firmware/software quality, live demo proof, and mathematical novelty.',
    weights: {
      'problem-need': 5,
      'technical-quality': 30,
      'innovation-originality': 20,
      'social-impact': 5,
      'presentation': 5,
      'demonstration-quality': 20,
      'feasibility-scalability': 10,
      'future-potential': 5
    }
  },
  {
    id: 'hackathon-showcase',
    name: 'Live Demonstration Showcase',
    description: 'Focuses heavily on live functional proof, presentation clarity, and novelty.',
    weights: {
      'problem-need': 10,
      'technical-quality': 15,
      'innovation-originality': 15,
      'social-impact': 10,
      'presentation': 20,
      'demonstration-quality': 20,
      'feasibility-scalability': 5,
      'future-potential': 5
    }
  }
];

export function getVerdictFromScore(score: number): VerdictThreshold {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 90) return VERDICT_THRESHOLDS[0];
  if (clamped >= 80) return VERDICT_THRESHOLDS[1];
  if (clamped >= 70) return VERDICT_THRESHOLDS[2];
  if (clamped >= 50) return VERDICT_THRESHOLDS[3];
  return VERDICT_THRESHOLDS[4];
}

export function validateWeightsSum(weights: Record<string, number>): boolean {
  const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
  return Math.abs(sum - 100) < 0.01;
}

export function calculateCompositeScore(dimensions: Array<{ score: number; weight: number }>): number {
  if (dimensions.length === 0) return 0;
  const totalWeight = dimensions.reduce((acc, d) => acc + d.weight, 0);
  const weightedSum = dimensions.reduce((acc, d) => acc + d.score * d.weight, 0);
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
}

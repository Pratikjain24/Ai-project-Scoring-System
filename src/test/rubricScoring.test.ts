import { describe, it, expect } from 'vitest';
import { 
  VERDICT_THRESHOLDS, 
  WEIGHT_PRESETS, 
  getVerdictFromScore, 
  validateWeightsSum, 
  calculateCompositeScore 
} from '../config/rubricConstants';

describe('AI Jury Rubric Scoring Engine', () => {
  describe('Verdict Thresholds & Boundaries', () => {
    it('defines non-overlapping and exhaustive tier thresholds between 0 and 100', () => {
      expect(VERDICT_THRESHOLDS.length).toBe(5);

      const exceptional = VERDICT_THRESHOLDS.find(t => t.level === 'Exceptional');
      expect(exceptional).toBeDefined();
      expect(exceptional?.minScore).toBe(90);
      expect(exceptional?.maxScore).toBe(100);

      const strong = VERDICT_THRESHOLDS.find(t => t.level === 'Strong');
      expect(strong).toBeDefined();
      expect(strong?.minScore).toBe(80);
      expect(strong?.maxScore).toBe(89);

      const promising = VERDICT_THRESHOLDS.find(t => t.level === 'Promising');
      expect(promising).toBeDefined();
      expect(promising?.minScore).toBe(70);
      expect(promising?.maxScore).toBe(79);

      const needsImp = VERDICT_THRESHOLDS.find(t => t.level === 'Needs Improvement');
      expect(needsImp).toBeDefined();
      expect(needsImp?.minScore).toBe(50);
      expect(needsImp?.maxScore).toBe(69);

      const weak = VERDICT_THRESHOLDS.find(t => t.level === 'Weak');
      expect(weak).toBeDefined();
      expect(weak?.minScore).toBe(0);
      expect(weak?.maxScore).toBe(49);
    });

    it('accurately resolves verdict level across various boundary scores', () => {
      expect(getVerdictFromScore(98).level).toBe('Exceptional');
      expect(getVerdictFromScore(90).level).toBe('Exceptional');
      expect(getVerdictFromScore(89.4).level).toBe('Strong');
      expect(getVerdictFromScore(80).level).toBe('Strong');
      expect(getVerdictFromScore(75).level).toBe('Promising');
      expect(getVerdictFromScore(70).level).toBe('Promising');
      expect(getVerdictFromScore(69.9).level).toBe('Needs Improvement');
      expect(getVerdictFromScore(50).level).toBe('Needs Improvement');
      expect(getVerdictFromScore(42).level).toBe('Weak');
      expect(getVerdictFromScore(0).level).toBe('Weak');
    });

    it('clamps out-of-range scores gracefully', () => {
      expect(getVerdictFromScore(115).level).toBe('Exceptional');
      expect(getVerdictFromScore(-10).level).toBe('Weak');
    });
  });

  describe('Weight Presets & Normalization', () => {
    it('provides all 4 core evaluation archetypes', () => {
      const presetIds = WEIGHT_PRESETS.map((p) => p.id);
      expect(presetIds).toContain('standard-academic');
      expect(presetIds).toContain('venture-commercial');
      expect(presetIds).toContain('engineering-rigor');
      expect(presetIds).toContain('hackathon-showcase');
    });

    it('ensures each preset sums precisely to 100%', () => {
      WEIGHT_PRESETS.forEach((preset) => {
        const totalWeight = Object.values(preset.weights).reduce((acc: number, w: number) => acc + w, 0);
        expect(totalWeight).toBeCloseTo(100, 1);
        expect(validateWeightsSum(preset.weights)).toBe(true);
      });
    });

    it('correctly calculates weighted composite scores given dimension scores', () => {
      const dimensions = [
        {
          id: 'problem-need',
          name: 'Problem Statement & Need',
          score: 90,
          weight: 20,
        },
        {
          id: 'technical-quality',
          name: 'Technical Depth & Architecture',
          score: 80,
          weight: 30,
        },
        {
          id: 'feasibility-scalability',
          name: 'Feasibility & Production Scalability',
          score: 70,
          weight: 50,
        }
      ];

      // Calculation: (90 * 0.20) + (80 * 0.30) + (70 * 0.50) = 18 + 24 + 35 = 77
      const composite = calculateCompositeScore(dimensions);
      expect(composite).toBe(77);
      expect(getVerdictFromScore(composite).level).toBe('Promising');
    });
  });
});

/**
 * Common Technology Analyzer
 * Prevents false positives by distinguishing ubiquitous baseline technologies
 * (e.g., React, Python, YOLO, OpenCV) from distinctive or proprietary combinations.
 */

const UBIQUITOUS_TECHNOLOGIES = new Set([
  'react',
  'python',
  'opencv',
  'yolo',
  'yolov8',
  'yolov5',
  'node',
  'nodejs',
  'express',
  'sqlite',
  'postgresql',
  'postgres',
  'mongodb',
  'docker',
  'git',
  'html',
  'css',
  'tailwind',
  'typescript',
  'javascript',
  'flask',
  'fastapi',
  'pytorch',
  'tensorflow',
  'rest',
  'api',
  'linux',
  'ubuntu',
]);

export interface TechnologyComparisonResult {
  score: number; // 0 - 100
  isCommonStackOnly: boolean;
  commonMatchedTech: string[];
  distinctiveMatchedTech: string[];
  projectOnlyTech: string[];
  candidateOnlyTech: string[];
  explanation: string;
}

export class CommonTechnologyAnalyzer {
  static isUbiquitous(tech: string): boolean {
    const normalized = tech.toLowerCase().replace(/[\s\-_]/g, '');
    for (const ubi of UBIQUITOUS_TECHNOLOGIES) {
      if (normalized.includes(ubi) || ubi.includes(normalized)) {
        return true;
      }
    }
    return false;
  }

  static compare(projectTech: string[], candidateTech: string[]): TechnologyComparisonResult {
    const projNorm = projectTech.map(t => ({ raw: t, norm: t.toLowerCase().trim() }));
    const candNorm = candidateTech.map(t => ({ raw: t, norm: t.toLowerCase().trim() }));

    const commonMatched: string[] = [];
    const distinctiveMatched: string[] = [];
    const matchedNorms = new Set<string>();

    for (const p of projNorm) {
      const match = candNorm.find(c => c.norm === p.norm || c.norm.includes(p.norm) || p.norm.includes(c.norm));
      if (match) {
        matchedNorms.add(p.norm);
        if (this.isUbiquitous(p.norm)) {
          commonMatched.push(p.raw);
        } else {
          distinctiveMatched.push(p.raw);
        }
      }
    }

    const projectOnly = projNorm.filter(p => !matchedNorms.has(p.norm)).map(p => p.raw);
    const candidateOnly = candNorm.filter(c => !matchedNorms.has(c.norm)).map(c => c.raw);

    const isCommonStackOnly = distinctiveMatched.length === 0 && commonMatched.length > 0;

    let rawScore = 0;
    if (distinctiveMatched.length > 0) {
      // Distinctive matches carry genuine similarity weight
      const totalDistinctive = Math.max(1, (projectTech.length + candidateTech.length) / 2);
      rawScore = Math.min(95, Math.round((distinctiveMatched.length / totalDistinctive) * 80 + commonMatched.length * 4));
    } else if (commonMatched.length > 0) {
      // Guardrail: Common stack alone is strictly capped at 32%
      rawScore = Math.min(32, Math.round(commonMatched.length * 7));
    } else {
      rawScore = 5;
    }

    let explanation = '';
    if (isCommonStackOnly) {
      explanation = `Shared technologies (${commonMatched.join(', ')}) reflect ubiquitous open-source tooling rather than unique architectural derivation. Technology similarity is deliberately bounded.`;
    } else if (distinctiveMatched.length > 0) {
      explanation = `Shared distinctive technologies identified: ${distinctiveMatched.join(', ')}. Additional common components: ${commonMatched.join(', ')}.`;
    } else {
      explanation = `Substantially disjoint technology stacks between project and candidate.`;
    }

    return {
      score: rawScore,
      isCommonStackOnly,
      commonMatchedTech: commonMatched,
      distinctiveMatchedTech: distinctiveMatched,
      projectOnlyTech: projectOnly,
      candidateOnlyTech: candidateOnly,
      explanation,
    };
  }
}

import type { Project } from '../models/project';
import type { ResearchSource, ResearchFinding } from '../models/research';
import { MockResearchProvider } from '../research/mockResearchProvider';

export class ResearchAgent {
  static async investigate(
    evaluationId: string,
    project: Project
  ): Promise<{ sources: ResearchSource[]; findings: ResearchFinding[] }> {
    const provider = new MockResearchProvider();
    const query = `${project.name} ${project.category} ${project.domain}`;

    const rawSources = await provider.search(query);
    const sourcesWithEvalId = rawSources.map(s => ({
      ...s,
      evaluationId,
    }));

    const rankedSources = provider.rankSources(sourcesWithEvalId, project.domain);

    const findings: ResearchFinding[] = [];
    for (const source of rankedSources) {
      const sourceFindings = await provider.extractFindings(source, project.problemStatement);
      findings.push(...sourceFindings.map(f => ({ ...f, evaluationId })));
    }

    return {
      sources: rankedSources,
      findings,
    };
  }
}

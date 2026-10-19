// ====================================================
// PROJECTX-RAY AI - RESEARCH AGENT
// Upgraded to Phase 14: Live Academic APIs & Vector Caching Engine
// ====================================================

import type { Project } from '../models/project';
import type { ResearchSource, ResearchFinding } from '../models/research';
import { LiveResearchEngine, type LiveResearchEngineStatus } from '../research-intelligence/liveResearchEngine';

const liveEngine = new LiveResearchEngine();

export class ResearchAgent {
  /**
   * Conducts live federated prior art investigation across Semantic Scholar, OpenAlex,
   * arXiv, and high-performance vector semantic cache (Pinecone/Qdrant/Local).
   */
  static async investigate(
    evaluationId: string,
    project: Project
  ): Promise<{ sources: ResearchSource[]; findings: ResearchFinding[] }> {
    return liveEngine.investigate(evaluationId, project);
  }

  /**
   * Inspects current academic connector and vector cache status
   */
  static getStatus(): LiveResearchEngineStatus {
    return liveEngine.getStatus();
  }
}

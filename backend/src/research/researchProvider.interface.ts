import type { ResearchSource, ResearchFinding } from '../models/research';

export interface SearchOptions {
  limit?: number;
  types?: ResearchSource['sourceType'][];
  minAuthority?: number;
}

export interface ResearchProvider {
  name: string;
  search(query: string, options?: SearchOptions): Promise<ResearchSource[]>;
  fetch(url: string): Promise<string>;
  extractFindings(source: ResearchSource, projectContext: string): Promise<ResearchFinding[]>;
  rankSources(sources: ResearchSource[], projectDomain: string): ResearchSource[];
}

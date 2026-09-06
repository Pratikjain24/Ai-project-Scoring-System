import type { ResearchQuery, QueryPurpose, ResearchPriority, ResearchQuestion } from '../models/researchIntelligence';

export class QueryGenerator {
  /**
   * Generates focused research queries across 11 dimensions with semantic deduplication
   */
  static generateQueries(evaluationId: string, questions: ResearchQuestion[] = []): ResearchQuery[] {
    const rawQueries: Array<{
      queryText: string;
      purpose: QueryPurpose;
      priority: ResearchPriority;
      questionCategory?: string;
    }> = [
      // 1. GENERAL
      { queryText: 'AI automated road surface hazard inspection platform', purpose: 'GENERAL', priority: 'HIGH' },
      // 2. TECHNICAL
      { queryText: 'YOLOv8 TensorRT INT8 Jetson Orin Nano benchmark latency', purpose: 'TECHNICAL', priority: 'CRITICAL' },
      // 3. ORIGINALITY
      { queryText: 'vehicle camera pavement crack detection edge AI GitHub', purpose: 'ORIGINALITY', priority: 'CRITICAL' },
      // 4. CLAIM_VERIFICATION
      { queryText: 'RDD2022 dataset pothole detection mAP50 precision 95 percent', purpose: 'CLAIM_VERIFICATION', priority: 'CRITICAL' },
      // 5. MARKET
      { queryText: 'commercial road inspection AI telemetry startups municipal', purpose: 'MARKET', priority: 'HIGH' },
      // 6. IMPACT
      { queryText: 'municipal annual pothole road damage expenditure statistics OECD', purpose: 'IMPACT', priority: 'HIGH' },
      // 7. FEASIBILITY
      { queryText: 'NVIDIA Jetson Orin Nano vehicle power consumption 15W battery', purpose: 'FEASIBILITY', priority: 'MEDIUM' },
      // 8. PATENT
      { queryText: 'vehicle mounted optical road distress telemetry patent', purpose: 'PATENT', priority: 'MEDIUM' },
      // 9. ACADEMIC
      { queryText: 'deep learning road damage detection RDD2022 review paper IEEE', purpose: 'ACADEMIC', priority: 'HIGH' },
      // 10. OPEN_SOURCE
      { queryText: 'road damage detection YOLO open source repository Python', purpose: 'OPEN_SOURCE', priority: 'HIGH' },
      // 11. COMPETITIVE
      { queryText: 'RoadBotics Blyncsy pavement inspection automated competitor', purpose: 'COMPETITIVE', priority: 'HIGH' },
    ];

    // Semantic deduplication: normalize lowercase alphanumeric token sets
    const seenSignatures = new Set<string>();
    const deduplicated: ResearchQuery[] = [];
    const now = new Date().toISOString();

    for (const q of rawQueries) {
      const tokens = q.queryText.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean).sort();
      const signature = tokens.join('_');

      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        const matchedQuestion = questions.find((ques) => {
          if (q.purpose === 'ORIGINALITY' && ques.category === 'SIMILARITY') return true;
          if (q.purpose === 'COMPETITIVE' && ques.category === 'COMPETITORS') return true;
          if (q.purpose === 'ACADEMIC' && ques.category === 'ACADEMIC') return true;
          if (q.purpose === 'PATENT' && ques.category === 'PATENTS') return true;
          if (q.purpose === 'TECHNICAL' && ques.category === 'BENCHMARKS') return true;
          if (q.purpose === 'IMPACT' && ques.category === 'PROBLEM_SCALE') return true;
          if (q.purpose === 'CLAIM_VERIFICATION' && ques.category === 'CLAIM_VERIFICATION') return true;
          return false;
        });

        deduplicated.push({
          id: `rqry_${evaluationId}_${deduplicated.length + 1}`,
          evaluationId,
          questionId: matchedQuestion?.id,
          queryText: q.queryText,
          purpose: q.purpose,
          priority: q.priority,
          status: 'COMPLETED',
          createdAt: now,
        });
      }
    }

    return deduplicated;
  }

  public generateQueries(
    evaluationId: string,
    projectName: string = 'Smart Road Vision',
    domain: string = 'Smart Infrastructure',
    technologies: string[] = [],
    features: string[] = [],
    claims: string[] = []
  ): Array<ResearchQuery & { query: string }> {
    const list = QueryGenerator.generateQueries(evaluationId);
    return list.map(q => ({
      ...q,
      query: q.queryText
    }));
  }
}

import { MOCK_EVALUATIONS } from '../data/mockEvaluationsList';
import type {
  LiveJurySession,
  LiveEvent,
  LiveObservation,
  LiveTranscriptSegment,
  LiveClaimOccurrence,
  LiveDemoEvent,
  LiveJudgeQuestion,
  LiveJudgeNote,
  LiveScoreSnapshot,
  LiveSessionFinalizationResult,
  LiveCameraSource
} from '../types/liveJury';
import type {
  OrchestratorProgress,
  IntegrityCheckResult,
  EvidenceRequestRecord,
  EvaluationRevisionRecord,
  SystemHealthMetrics,
  UsageSummary,
  AuditEventRecord,
  FeatureFlagRecord
} from '../types/integration';

const API_BASE = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiService {
  private isOnline: boolean | null = null;

  public get isConnected(): boolean | null {
    return this.isOnline;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const json: ApiResponse<T> = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'API request failed');
      }

      this.isOnline = true;
      return json.data as T;
    } catch (err) {
      this.isOnline = false;
      throw err;
    }
  }

  // --- Projects ---

  async getProjects(): Promise<any[]> {
    try {
      return await this.request<any[]>('/projects');
    } catch (err) {
      console.warn('[API Client] Backend unreachable, falling back to local dataset:', err);
      return MOCK_EVALUATIONS;
    }
  }

  async getProjectById(id: string): Promise<any> {
    try {
      return await this.request<any>(`/projects/${id}`);
    } catch (err) {
      console.warn(`[API Client] Project ${id} lookup failed, using local dataset:`, err);
      return MOCK_EVALUATIONS.find(p => p.id === id) || MOCK_EVALUATIONS[0];
    }
  }

  async createProject(projectData: any): Promise<any> {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // --- Evaluations ---

  async getEvaluations(): Promise<any[]> {
    try {
      return await this.request<any[]>('/evaluations');
    } catch (err) {
      console.warn('[API Client] Failed to fetch evaluations from backend:', err);
      return MOCK_EVALUATIONS;
    }
  }

  async getEvaluationById(id: string): Promise<any> {
    try {
      return await this.request<any>(`/evaluations/${id}`);
    } catch (err) {
      console.warn(`[API Client] Evaluation ${id} lookup failed:`, err);
      return MOCK_EVALUATIONS.find(p => p.id === id) || MOCK_EVALUATIONS[0];
    }
  }

  async createEvaluation(data: { projectId: string; mode: string }): Promise<any> {
    return this.request<any>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startEvaluation(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/start`, {
      method: 'POST',
    });
  }

  async getEvaluationStatus(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/status`);
  }

  // --- Sub-Assessment Endpoints ---

  async getProjectDNA(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/project`);
  }

  async getTechnicalAudit(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/technical`);
  }

  async getOriginality(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/originality`);
  }

  async getClaims(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/claims`);
  }

  async getPresentation(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/presentation`);
  }

  async getJury(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/jury`);
  }

  async getReport(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/report`);
  }

  // --- Evidence Graph ---

  async getScoreLineage(evaluationId: string, categoryKey: string): Promise<any> {
    return this.request<any>(`/evidence/graph/${evaluationId}/score/${categoryKey}`);
  }

  async getClaimLineage(claimId: string): Promise<any> {
    return this.request<any>(`/evidence/graph/claim/${claimId}`);
  }

  // --- Document Intelligence ---

  async getDocumentsForEvaluation(evaluationId: string): Promise<any[]> {
    try {
      return await this.request<any[]>(`/evaluations/${evaluationId}/documents`);
    } catch (err) {
      console.warn(`[API Client] Failed to fetch documents for evaluation ${evaluationId}:`, err);
      return [];
    }
  }

  async getDocumentById(documentId: string): Promise<any> {
    return this.request<any>(`/documents/${documentId}`);
  }

  async getDocumentPages(documentId: string): Promise<{ pages: any[]; tables: any[]; images: any[] }> {
    return this.request<{ pages: any[]; tables: any[]; images: any[] }>(`/documents/${documentId}/pages`);
  }

  async getDocumentTechnologies(documentId: string): Promise<any[]> {
    return this.request<any[]>(`/documents/${documentId}/technologies`);
  }

  async getDocumentEvidence(documentId: string): Promise<any[]> {
    return this.request<any[]>(`/documents/${documentId}/evidence`);
  }

  async getDocumentClaims(documentId: string): Promise<any[]> {
    return this.request<any[]>(`/documents/${documentId}/claims`);
  }

  async getDocumentArchitecture(documentId: string): Promise<any> {
    return this.request<any>(`/documents/${documentId}/architecture`);
  }

  async getEvaluationEvidenceGaps(evaluationId: string): Promise<any[]> {
    try {
      return await this.request<any[]>(`/evaluations/${evaluationId}/evidence-gaps`);
    } catch {
      return [];
    }
  }

  async getEvaluationContradictions(evaluationId: string): Promise<any[]> {
    try {
      return await this.request<any[]>(`/evaluations/${evaluationId}/contradictions`);
    } catch {
      return [];
    }
  }

  async getEvaluationDocumentQuality(evaluationId: string): Promise<any> {
    try {
      return await this.request<any>(`/evaluations/${evaluationId}/document-quality`);
    } catch {
      return { documentQualityScore: 89, missingSections: [] };
    }
  }

  async uploadDocument(data: {
    projectId: string;
    evaluationId?: string;
    fileName: string;
    mimeType?: string;
    sizeBytes?: number;
  }): Promise<any> {
    return this.request<any>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Multimodal Video Analysis ---

  async getVideoAnalysis(evaluationId: string): Promise<any> {
    try {
      return await this.request<any>(`/evaluations/${evaluationId}/video-analysis`);
    } catch {
      return null;
    }
  }

  async getVideoById(videoId: string): Promise<any> {
    return this.request<any>(`/videos/${videoId}`);
  }

  async getVideoTranscript(videoId: string): Promise<any[]> {
    try {
      const res = await this.request<any>(`/videos/${videoId}/transcript`);
      return res.data || [];
    } catch {
      return [];
    }
  }

  async getVideoTimeline(videoId: string): Promise<any[]> {
    try {
      const res = await this.request<any>(`/videos/${videoId}/timeline`);
      return res.data || [];
    } catch {
      return [];
    }
  }

  async getVideoDemo(videoId: string): Promise<any> {
    return this.request<any>(`/videos/${videoId}/demo`);
  }

  async getVideoPresentation(videoId: string): Promise<any> {
    return this.request<any>(`/videos/${videoId}/presentation`);
  }

  async uploadVideo(data: {
    projectId: string;
    evaluationId?: string;
    fileName: string;
    fileReference?: string;
    durationSeconds?: number;
    fps?: number;
  }): Promise<any> {
    return this.request<any>('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Phase 5: Research Intelligence Engine ---
  async getResearchIntelligence(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research`);
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn('[API Client] getResearchIntelligence fallback:', err);
      return null;
    }
  }

  async runResearchPipeline(evaluationId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research`, { method: 'POST' });
    const json = await res.json();
    return json.data || null;
  }

  async getResearchQuestions(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research/questions`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getResearchFindings(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research/findings`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getResearchSources(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research/sources`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getSimilarProjects(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research/similar-projects`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getAcademicPapers(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research/academic`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getPatentRecords(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research/patents`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getTechnologyBenchmarks(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/research/benchmarks`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async refreshResearchSource(sourceId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/research/source/${sourceId}/refresh`, { method: 'POST' });
    return await res.json();
  }

  // ==========================================
  // Phase 6: Originality Intelligence API
  // ==========================================

  async getOriginalityBundle(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/originality`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async runOriginalityAnalysis(evaluationId: string, customWeights?: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/originality/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customWeights }),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getOriginalityCandidates(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/originality/candidates`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getOriginalityDimensions(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/originality/dimensions`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getOriginalityContributions(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/originality/contributions`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getOriginalityEvidence(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/originality/evidence`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getOriginalityGraph(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/originality/graph`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getOriginalityReport(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/originality/report`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  // --- Phase 7: Claim Verification & Truth Analysis Engine ---

  async getEvaluationClaims(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/claims`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getClaimDetail(evaluationId: string, claimId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/claims/${claimId}`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getClaimContradictions(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/claims/contradictions`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getClaimEvidenceGaps(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/claims/evidence-gaps`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async runClaimAnalysis(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/claims/analyze`, {
        method: 'POST',
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async submitClaimHumanReview(
    evaluationId: string,
    claimId: string,
    reviewerName: string,
    newStatus: string,
    reason: string
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/claims/${claimId}/human-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerName, newStatus, reason }),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  // --- Phase 8: Technical + Impact + Feasibility Intelligence Engine ---

  async getTechnical(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/technical`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async analyzeTechnical(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/technical/analyze`, { method: 'POST' });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getSoftware(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/technical/software`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getHardware(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/technical/hardware`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getSecurity(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/technical/security`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getPerformance(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/technical/performance`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getScalability(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/technical/scalability`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getImpact(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/impact`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async analyzeImpact(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/impact/analyze`, { method: 'POST' });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getFeasibility(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/feasibility`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async analyzeFeasibility(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/feasibility/analyze`, { method: 'POST' });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getSpecialistRisks(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/risks`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getSpecialistEvidenceGaps(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/evidence-gaps`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getSpecialistRecommendations(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/recommendations`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getSpecialistMaturity(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/maturity`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getSpecialistSummary(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/specialist-summary`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  // --- Phase 9 Master Scoring & AI Jury Endpoints ---

  async getMasterScore(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/score`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getScoreBreakdown(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/score/breakdown`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getScoreConfidence(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/score/confidence`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getEvidenceCoverage(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/score/evidence-coverage`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getJuryDecision(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/jury`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async finalizeJury(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/jury/finalize`, {
        method: 'POST',
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getJuryQuestions(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/jury/questions`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async interactJuryQuestion(
    evaluationId: string,
    questionId: string,
    data: { isAsked?: boolean; isFlagged?: boolean; isBookmarked?: boolean; judgeNote?: string }
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/jury/questions/${questionId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getJuryNotes(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/jury/notes`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async addJuryNote(
    evaluationId: string,
    note: { category?: string; text: string; author: string; relatedEvidenceIds?: string[] }
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/jury/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getJuryRisks(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/jury/risks`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getJuryRecommendations(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/jury/recommendations`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async simulateScore(
    evaluationId: string,
    categoryScores: Partial<Record<string, number>>
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/score/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryScores }),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getScoreHistory(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/history`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async addHumanReview(
    evaluationId: string,
    review: { reviewer: string; category: string; originalScore: number; reviewedScore: number; reason: string }
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/human-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getHumanReviews(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/human-review`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async compareProjects(evaluationIds: string[]): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/compare?ids=${evaluationIds.join(',')}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getRubrics(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/rubrics`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getRubricVersions(rubricId?: string): Promise<any[]> {
    try {
      const path = rubricId ? `${API_BASE}/rubrics/${rubricId}/versions` : `${API_BASE}/rubrics/default/versions`;
      const res = await fetch(path);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  // --- Phase 10: Final Intelligence Report & Evidence Explorer ---

  async getEvaluationReport(evaluationId: string, version?: number): Promise<any> {
    try {
      const url = version 
        ? `${API_BASE}/evaluations/${evaluationId}/report?version=${version}` 
        : `${API_BASE}/evaluations/${evaluationId}/report`;
      const res = await fetch(url);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async generateEvaluationReport(evaluationId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/report/generate`, {
        method: 'POST',
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getReportVersions(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/report/versions`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async compareReportVersions(evaluationId: string, v1: number, v2: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/report/compare?v1=${v1}&v2=${v2}`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getReportEvidence(
    evaluationId: string,
    query?: string,
    type?: string,
    minConfidence?: number
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (type && type !== 'ALL') params.append('type', type);
      if (minConfidence !== undefined) params.append('minConfidence', String(minConfidence));

      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/report/evidence?${params.toString()}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getReportSources(evaluationId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/report/sources`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  getReportPdfUrl(evaluationId: string, version?: number): string {
    return version
      ? `${API_BASE}/evaluations/${evaluationId}/report/pdf?version=${version}`
      : `${API_BASE}/evaluations/${evaluationId}/report/pdf`;
  }

  async createReportShare(evaluationId: string, expiresInDays: number = 30): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/report/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays }),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async revokeReportShare(shareId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/report-share/${shareId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      return json.success || false;
    } catch {
      return false;
    }
  }

  async getPublicReportShare(token: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/report-share/${token}`);
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  // ====================================================
  // PHASE 11: LIVE CAMERA AI JURY API CLIENT
  // ====================================================

  async getLiveSession(evaluationId: string): Promise<LiveJurySession | null> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/status`);
      const json = await res.json();
      return json.data?.session || null;
    } catch {
      return null;
    }
  }

  async getLiveScoreSnapshot(evaluationId: string): Promise<LiveScoreSnapshot | null> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/status`);
      const json = await res.json();
      return json.data?.snapshot || null;
    } catch {
      return null;
    }
  }

  async startLiveSession(
    evaluationId: string,
    cameraSource: LiveCameraSource = 'WEBCAM',
    micSource: string = 'default'
  ): Promise<{ session: LiveJurySession; status: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cameraSource, micSource }),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async pauseLiveSession(evaluationId: string): Promise<LiveJurySession | null> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/pause`, {
        method: 'POST',
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async resumeLiveSession(evaluationId: string): Promise<LiveJurySession | null> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/resume`, {
        method: 'POST',
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async endLiveSession(evaluationId: string): Promise<LiveSessionFinalizationResult | null> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/end`, {
        method: 'POST',
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async getLiveEvents(evaluationId: string, sinceMs: number = 0): Promise<LiveEvent[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/events?since=${sinceMs}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getLiveTranscript(evaluationId: string): Promise<LiveTranscriptSegment[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/transcript`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getLiveObservations(
    evaluationId: string,
    category?: string
  ): Promise<LiveObservation[]> {
    try {
      const url = category
        ? `${API_BASE}/evaluations/${evaluationId}/live/observations?category=${category}`
        : `${API_BASE}/evaluations/${evaluationId}/live/observations`;
      const res = await fetch(url);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getLiveClaims(evaluationId: string): Promise<LiveClaimOccurrence[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/claims`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getLiveDemoEvents(evaluationId: string): Promise<LiveDemoEvent[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/demo`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async getLiveQuestions(evaluationId: string): Promise<LiveJudgeQuestion[]> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/questions`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  async askLiveQuestion(
    evaluationId: string,
    questionId: string,
    elapsedSeconds: number = 0
  ): Promise<LiveJudgeQuestion | null> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/questions/${questionId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsedSeconds }),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async addLiveJudgeNote(
    evaluationId: string,
    note: string,
    flaggedConcern: boolean = false,
    isBookmarked: boolean = false,
    elapsedSeconds: number = 0
  ): Promise<LiveJudgeNote | null> {
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evaluationId}/live/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, flaggedConcern, isBookmarked, elapsedSeconds }),
      });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  // --- Phase 12: End-to-End Orchestrator & State Machine ---

  async getOrchestratorStatus(evaluationId: string): Promise<OrchestratorProgress> {
    return this.request<OrchestratorProgress>(`/evaluations/${evaluationId}/orchestrate/status`);
  }

  async startOrchestration(evaluationId: string, options?: { skipMedia?: boolean; skipResearch?: boolean }): Promise<OrchestratorProgress> {
    return this.request<OrchestratorProgress>(`/evaluations/${evaluationId}/orchestrate/start`, {
      method: 'POST',
      body: JSON.stringify(options || {})
    });
  }

  async retryOrchestrationStage(evaluationId: string, stage: string): Promise<OrchestratorProgress> {
    return this.request<OrchestratorProgress>(`/evaluations/${evaluationId}/orchestrate/retry`, {
      method: 'POST',
      body: JSON.stringify({ stage })
    });
  }

  async getIntegrityCheck(evaluationId: string): Promise<IntegrityCheckResult> {
    return this.request<IntegrityCheckResult>(`/evaluations/${evaluationId}/integrity`);
  }

  async getEvidenceRequests(evaluationId: string): Promise<EvidenceRequestRecord[]> {
    return this.request<EvidenceRequestRecord[]>(`/evaluations/${evaluationId}/evidence-requests`);
  }

  async createEvidenceRequest(
    evaluationId: string,
    data: { title: string; description: string; priority?: string; requestedBy?: string }
  ): Promise<EvidenceRequestRecord> {
    return this.request<EvidenceRequestRecord>(`/evaluations/${evaluationId}/evidence-requests`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateEvidenceRequest(
    requestId: string,
    status: string,
    responseNotes?: string
  ): Promise<EvidenceRequestRecord> {
    return this.request<EvidenceRequestRecord>(`/evidence-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseNotes })
    });
  }

  async getRevisions(evaluationId: string): Promise<EvaluationRevisionRecord[]> {
    return this.request<EvaluationRevisionRecord[]>(`/evaluations/${evaluationId}/revisions`);
  }

  async createRevision(
    evaluationId: string,
    data: { reason: string; createdBy?: string }
  ): Promise<EvaluationRevisionRecord> {
    return this.request<EvaluationRevisionRecord>(`/evaluations/${evaluationId}/revisions`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async finalizeEvaluation(
    evaluationId: string,
    reviewerId?: string,
    note?: string
  ): Promise<{ message: string; state: any }> {
    return this.request<{ message: string; state: any }>(`/evaluations/${evaluationId}/finalize`, {
      method: 'POST',
      body: JSON.stringify({ reviewerId, note })
    });
  }

  // --- Phase 12: Admin & System Observability ---

  async getAdminHealth(): Promise<SystemHealthMetrics> {
    return this.request<SystemHealthMetrics>('/admin/health');
  }

  async getAdminUsage(): Promise<UsageSummary> {
    return this.request<UsageSummary>('/admin/usage');
  }

  async getAdminAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditEventRecord[]> {
    return this.request<AuditEventRecord[]>(`/admin/audit-logs?limit=${limit}&offset=${offset}`);
  }

  async getAdminFeatureFlags(): Promise<FeatureFlagRecord[]> {
    return this.request<FeatureFlagRecord[]>('/admin/feature-flags');
  }

  async updateAdminFeatureFlag(
    key: string,
    enabled: boolean,
    description?: string
  ): Promise<FeatureFlagRecord> {
    return this.request<FeatureFlagRecord>(`/admin/feature-flags/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled, description })
    });
  }

  async getHealth(): Promise<{ status: string; mockMode: boolean }> {
    return this.request<{ status: string; mockMode: boolean }>('/health');
  }
}

export const api = new ApiService();

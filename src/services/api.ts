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
  LiveCameraSource,
  LivePresenterTrackingMetrics
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

/**
 * Standard structured API Error with status, error code, affected endpoint, and timestamp.
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: any;
  public readonly endpoint?: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'API_ERROR',
    status?: number,
    details?: any,
    endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.endpoint = endpoint;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ConnectionStatusListener = (isOnline: boolean, error?: ApiError) => void;

export class ApiService {
  private isOnline: boolean | null = null;
  private lastError: ApiError | null = null;
  private statusListeners: Set<ConnectionStatusListener> = new Set();

  public get isConnected(): boolean | null {
    return this.isOnline;
  }

  public get currentLastError(): ApiError | null {
    return this.lastError;
  }

  /**
   * Subscribe to network/backend online/offline transitions.
   */
  public subscribe(listener: ConnectionStatusListener): () => void {
    this.statusListeners.add(listener);
    if (this.isOnline !== null) {
      listener(this.isOnline, this.lastError || undefined);
    }
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatusListeners(online: boolean, error?: ApiError): void {
    if (this.isOnline !== online || (error && this.lastError !== error)) {
      this.isOnline = online;
      if (error) this.lastError = error;
      else if (online) this.lastError = null;
      for (const listener of this.statusListeners) {
        try {
          listener(online, error);
        } catch (e) {
          console.error('[ApiService] Listener error:', e);
        }
      }
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('auth_token');
    if (!token || token === 'usr_lead_evaluator_jwt') {
      return null;
    }
    return token;
  }

  /**
   * Checks whether mock fallback is permitted.
   * STRICT POLICY: NEVER allowed in production under any circumstances.
   * Only allowed in development/testing if explicitly enabled via VITE_USE_MOCKS === 'true'.
   */
  public isMockFallbackAllowed(): boolean {
    const isProd =
      import.meta.env?.PROD === true ||
      (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'production');
    if (isProd) {
      return false;
    }
    return import.meta.env?.VITE_USE_MOCKS === 'true';
  }

  public getStreamUrl(evaluationId: string): string {
    const token = this.getAuthToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${API_BASE}/evaluations/${evaluationId}/stream${query}`;
  }

  public createPipelineEventSource(evaluationId: string): EventSource {
    return new EventSource(this.getStreamUrl(evaluationId));
  }

  /**
   * Central request dispatch with authorization headers, timeout aborts,
   * standard error serialization, and connectivity event emissions.
   */
  public async request<T>(endpoint: string, options?: RequestInit & { timeoutMs?: number }): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const timeoutMs = options?.timeoutMs ?? 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const token = this.getAuthToken();
      const res = await fetch(url, {
        signal: options?.signal || controller.signal,
        credentials: options?.credentials || 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...options?.headers,
        },
        ...options,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        // Transparent silent token refresh or persona re-login on 401 Unauthorized
        if (res.status === 401 && !endpoint.startsWith('/auth/') && !(options as any)?._isRetry) {
          const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('auth_refresh_token') : null;
          if (storedRefreshToken) {
            try {
              const refreshed = await this.refreshToken(storedRefreshToken);
              if (refreshed?.token) {
                return await this.request<T>(endpoint, {
                  ...options,
                  _isRetry: true,
                } as any);
              }
            } catch {
              // Refresh token was rejected or expired
            }
          }

          // Fallback in browser: transparently authenticate with current persona if not explicitly logged out
          const isTest = typeof (globalThis as any).vi !== 'undefined' || import.meta.env?.MODE === 'test';
          if (!isTest && typeof window !== 'undefined' && localStorage.getItem('auth_logged_out') !== 'true') {
            try {
              const personaId = localStorage.getItem('auth_persona_id') || 'usr_chair_evelyn';
              const loginRes = await this.login({ personaId });
              if (loginRes?.token) {
                return await this.request<T>(endpoint, {
                  ...options,
                  _isRetry: true,
                } as any);
              }
            } catch {
              // Persona re-login failed
            }
          }
        }

        let errorBody: any = {};
        try {
          errorBody = await res.json();
        } catch {
          // Response body was not JSON
        }

        const message =
          errorBody?.error?.message ||
          errorBody?.message ||
          `HTTP ${res.status}: ${res.statusText || 'Request failed'}`;

        const code =
          errorBody?.error?.code ||
          (res.status === 401
            ? 'UNAUTHORIZED'
            : res.status === 403
            ? 'FORBIDDEN'
            : res.status === 404
            ? 'NOT_FOUND'
            : res.status >= 500
            ? 'SERVER_ERROR'
            : 'HTTP_ERROR');

        throw new ApiError(message, code, res.status, errorBody?.error?.details || errorBody, endpoint);
      }

      const json: ApiResponse<T> = await res.json();
      if (json && typeof json === 'object' && 'success' in json && !json.success) {
        throw new ApiError(
          json.error?.message || 'API operation reported failure',
          json.error?.code || 'API_FAILED',
          res.status,
          json.error?.details,
          endpoint
        );
      }

      this.notifyStatusListeners(true);
      return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T;
    } catch (err: any) {
      clearTimeout(timeoutId);

      let apiError: ApiError;
      if (err instanceof ApiError) {
        apiError = err;
      } else if (err.name === 'AbortError') {
        apiError = new ApiError(
          `Request to ${endpoint} timed out after ${timeoutMs}ms`,
          'TIMEOUT',
          408,
          null,
          endpoint
        );
      } else {
        apiError = new ApiError(
          err.message || `Failed to connect to backend endpoint ${endpoint}`,
          'BACKEND_OFFLINE',
          0,
          { originalError: err.message },
          endpoint
        );
      }

      // Only notify backend offline if network failed (status 0) or explicit BACKEND_OFFLINE
      const isNetworkOffline = apiError.status === 0 || apiError.code === 'BACKEND_OFFLINE';
      if (isNetworkOffline) {
        this.notifyStatusListeners(false, apiError);
      }
      throw apiError;
    }
  }

  // ==========================================
  // Authentication & Session Security
  // ==========================================

  async login(
    credentials: string | { personaId?: string; email?: string; password?: string; role?: string },
    email?: string
  ): Promise<{ token: string; refreshToken?: string; user: any }> {
    const payload = typeof credentials === 'string'
      ? { personaId: credentials, email }
      : credentials;

    const res = await this.request<{ token: string; refreshToken?: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res?.token) {
      localStorage.setItem('auth_token', res.token);
    }
    if (res?.refreshToken) {
      localStorage.setItem('auth_refresh_token', res.refreshToken);
    }
    return res;
  }

  async register(data: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    organization?: string;
    title?: string;
  }): Promise<{ token: string; refreshToken?: string; user: any }> {
    const res = await this.request<{ token: string; refreshToken?: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res?.token) {
      localStorage.setItem('auth_token', res.token);
    }
    if (res?.refreshToken) {
      localStorage.setItem('auth_refresh_token', res.refreshToken);
    }
    return res;
  }

  async refreshToken(token?: string): Promise<{ token: string; refreshToken?: string }> {
    const tokenToUse = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_refresh_token') : null);
    if (!tokenToUse) {
      throw new ApiError('No refresh token available', 'NO_REFRESH_TOKEN', 401, null, '/auth/refresh');
    }

    const res = await this.request<{ token: string; refreshToken?: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokenToUse }),
    });

    if (res?.token) {
      localStorage.setItem('auth_token', res.token);
    }
    if (res?.refreshToken) {
      localStorage.setItem('auth_refresh_token', res.refreshToken);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignored during local teardown
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_persona_id');
      localStorage.removeItem('auth_role');
    }
  }

  async getAuthPersonas(): Promise<any[]> {
    return this.request<any[]>('/auth/personas');
  }

  async getMe(): Promise<any> {
    return this.request<any>('/auth/me');
  }

  // ==========================================
  // Projects
  // ==========================================

  async getProjects(): Promise<any[]> {
    try {
      return await this.request<any[]>('/projects');
    } catch (err) {
      if (this.isMockFallbackAllowed()) {
        console.warn('[ApiService] DEV ONLY: Backend unreachable, falling back to mock projects dataset:', err);
        return MOCK_EVALUATIONS;
      }
      throw err;
    }
  }

  async getProjectById(id: string): Promise<any> {
    try {
      return await this.request<any>(`/projects/${id}`);
    } catch (err) {
      if (this.isMockFallbackAllowed()) {
        const mock = MOCK_EVALUATIONS.find((p) => p.id === id);
        if (mock) {
          console.warn(`[ApiService] DEV ONLY: Falling back to mock project for "${id}":`, err);
          return mock;
        }
      }
      throw err;
    }
  }

  async createProject(projectData: any): Promise<any> {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // ==========================================
  // Evaluations
  // ==========================================

  async getEvaluations(): Promise<any[]> {
    try {
      return await this.request<any[]>('/evaluations');
    } catch (err) {
      if (this.isMockFallbackAllowed()) {
        console.warn('[ApiService] DEV ONLY: Falling back to mock evaluations:', err);
        return MOCK_EVALUATIONS;
      }
      throw err;
    }
  }

  async getEvaluationById(id: string): Promise<any> {
    try {
      return await this.request<any>(`/evaluations/${id}`);
    } catch (err) {
      if (this.isMockFallbackAllowed()) {
        const mock = MOCK_EVALUATIONS.find((p) => p.id === id);
        if (mock) {
          console.warn(`[ApiService] DEV ONLY: Falling back to mock evaluation for "${id}":`, err);
          return mock;
        }
      }
      throw err;
    }
  }

  async createEvaluation(data: { projectId: string; mode: string }): Promise<any> {
    return this.request<any>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startEvaluation(evaluationId: string, options?: { fastMode?: boolean; stageDelayMs?: number }): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/start`, {
      method: 'POST',
      body: JSON.stringify(options || { fastMode: true }),
    });
  }

  async getEvaluationStatus(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/status`);
  }

  async getCanonicalRubric(): Promise<any> {
    return this.request<any>('/evaluations/rubric');
  }

  // ==========================================
  // Sub-Assessment Endpoints
  // ==========================================

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

  // ==========================================
  // Evidence Graph
  // ==========================================

  async getScoreLineage(evaluationId: string, categoryKey: string): Promise<any> {
    return this.request<any>(`/evidence/graph/${evaluationId}/score/${categoryKey}`);
  }

  async getClaimLineage(claimId: string): Promise<any> {
    return this.request<any>(`/evidence/graph/claim/${claimId}`);
  }

  // ==========================================
  // Document Intelligence
  // ==========================================

  async getDocumentsForEvaluation(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/documents`);
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
    return this.request<any[]>(`/evaluations/${evaluationId}/evidence-gaps`);
  }

  async getEvaluationContradictions(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/contradictions`);
  }

  async getEvaluationDocumentQuality(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/document-quality`);
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

  // ==========================================
  // Cloud Object Storage (S3 / MinIO / R2 / Presigned URLs)
  // ==========================================

  async getPresignedUploadUrl(params: {
    filename: string;
    contentType?: string;
    fileSizeBytes?: number;
    evaluationId?: string;
    projectId?: string;
    expiresInSeconds?: number;
  }): Promise<{
    uploadUrl: string;
    downloadUrl?: string;
    key: string;
    method: 'PUT' | 'POST';
    headers: Record<string, string>;
    expiresAt: string;
    expiresInSeconds: number;
    driver: string;
    bucket?: string;
  }> {
    return this.request('/storage/presigned-upload', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<{
    key: string;
    downloadUrl: string;
    expiresInSeconds: number;
  }> {
    const query = expiresInSeconds ? `?expiresInSeconds=${expiresInSeconds}` : '';
    return this.request(`/storage/presigned-download/${encodeURIComponent(key)}${query}`);
  }

  async uploadDirectToPresignedUrl(
    uploadUrl: string,
    file: Blob | File | ArrayBuffer,
    contentType: string = 'application/octet-stream',
    headers: Record<string, string> = {}
  ): Promise<boolean> {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        ...headers,
      },
      body: file,
    });
    return res.ok;
  }

  async getStorageHealth(): Promise<any> {
    return this.request('/storage/health');
  }

  // ==========================================
  // Multimodal Video Analysis
  // ==========================================

  async getVideoAnalysis(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/video-analysis`);
  }

  async getVideoById(videoId: string): Promise<any> {
    return this.request<any>(`/videos/${videoId}`);
  }

  async getVideoTranscript(videoId: string): Promise<any[]> {
    return this.request<any[]>(`/videos/${videoId}/transcript`);
  }

  async getVideoTimeline(videoId: string): Promise<any[]> {
    return this.request<any[]>(`/videos/${videoId}/timeline`);
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

  // ==========================================
  // Research Intelligence Engine
  // ==========================================

  async getResearchIntelligence(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/research`);
  }

  async runResearchPipeline(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/research`, { method: 'POST' });
  }

  async getResearchQuestions(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/research/questions`);
  }

  async getResearchFindings(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/research/findings`);
  }

  async getResearchSources(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/research/sources`);
  }

  async getSimilarProjects(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/research/similar-projects`);
  }

  async getAcademicPapers(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/research/academic`);
  }

  async getPatentRecords(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/research/patents`);
  }

  async getTechnologyBenchmarks(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/research/benchmarks`);
  }

  async refreshResearchSource(sourceId: string): Promise<any> {
    return this.request<any>(`/research/source/${sourceId}/refresh`, { method: 'POST' });
  }

  // ==========================================
  // Originality Intelligence Engine
  // ==========================================

  async getOriginalityBundle(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/originality`);
  }

  async runOriginalityAnalysis(evaluationId: string, customWeights?: any): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/originality/analyze`, {
      method: 'POST',
      body: JSON.stringify({ customWeights }),
    });
  }

  async getOriginalityCandidates(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/originality/candidates`);
  }

  async getOriginalityDimensions(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/originality/dimensions`);
  }

  async getOriginalityContributions(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/originality/contributions`);
  }

  async getOriginalityEvidence(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/originality/evidence`);
  }

  async getOriginalityGraph(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/originality/graph`);
  }

  async getOriginalityReport(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/originality/report`);
  }

  // ==========================================
  // Claim Verification & Truth Engine
  // ==========================================

  async getEvaluationClaims(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/claims`);
  }

  async getClaimDetail(evaluationId: string, claimId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/claims/${claimId}`);
  }

  async getClaimContradictions(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/claims/contradictions`);
  }

  async getClaimEvidenceGaps(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/claims/evidence-gaps`);
  }

  async runClaimAnalysis(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/claims/analyze`, {
      method: 'POST',
    });
  }

  async submitClaimHumanReview(
    evaluationId: string,
    claimId: string,
    reviewerName: string,
    newStatus: string,
    reason: string
  ): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/claims/${claimId}/human-review`, {
      method: 'POST',
      body: JSON.stringify({ reviewerName, newStatus, reason }),
    });
  }

  // ==========================================
  // Technical + Impact + Feasibility Intelligence
  // ==========================================

  async getTechnical(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/technical`);
  }

  async analyzeTechnical(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/technical/analyze`, { method: 'POST' });
  }

  async getSoftware(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/technical/software`);
  }

  async getHardware(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/technical/hardware`);
  }

  async getSecurity(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/technical/security`);
  }

  async getPerformance(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/technical/performance`);
  }

  async getScalability(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/technical/scalability`);
  }

  async getImpact(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/impact`);
  }

  async analyzeImpact(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/impact/analyze`, { method: 'POST' });
  }

  async getSocialImpact(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/impact/social`);
  }

  async getEconomicImpact(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/impact/economic`);
  }

  async getEnvironmentalImpact(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/impact/environmental`);
  }

  async getFeasibility(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/feasibility`);
  }

  async analyzeFeasibility(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/feasibility/analyze`, { method: 'POST' });
  }

  async getSpecialistRisks(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/risks`);
  }

  async getSpecialistEvidenceGaps(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/evidence-gaps`);
  }

  async getSpecialistRecommendations(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/recommendations`);
  }

  async getSpecialistMaturity(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/maturity`);
  }

  async getSpecialistSummary(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/specialist-summary`);
  }

  // ==========================================
  // Master Scoring & AI Jury Engine
  // ==========================================

  async getMasterScore(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/score`);
  }

  async getScoreBreakdown(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/score/breakdown`);
  }

  async getScoreConfidence(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/score/confidence`);
  }

  async getEvidenceCoverage(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/score/evidence-coverage`);
  }

  async getJuryDecision(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/jury`);
  }

  async finalizeJury(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/jury/finalize`, {
      method: 'POST',
    });
  }

  async getJuryQuestions(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/jury/questions`);
  }

  async interactJuryQuestion(
    evaluationId: string,
    questionId: string,
    data: { isAsked?: boolean; isFlagged?: boolean; isBookmarked?: boolean; judgeNote?: string }
  ): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/jury/questions/${questionId}/interact`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJuryNotes(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/jury/notes`);
  }

  async addJuryNote(
    evaluationId: string,
    note: { category?: string; text: string; author: string; relatedEvidenceIds?: string[] }
  ): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/jury/notes`, {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async getJuryRisks(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/jury/risks`);
  }

  async getJuryRecommendations(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/jury/recommendations`);
  }

  async simulateScore(
    evaluationId: string,
    categoryScores: Partial<Record<string, number>>
  ): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/score/simulate`, {
      method: 'POST',
      body: JSON.stringify({ categoryScores }),
    });
  }

  async getScoreHistory(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/history`);
  }

  async addHumanReview(
    evaluationId: string,
    review: { reviewer: string; category: string; originalScore: number; reviewedScore: number; reason: string }
  ): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/human-review`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async getHumanReviews(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/human-review`);
  }

  async compareProjects(evaluationIds: string[]): Promise<any[]> {
    return this.request<any[]>(`/evaluations/compare?ids=${evaluationIds.join(',')}`);
  }

  async getRubrics(): Promise<any[]> {
    return this.request<any[]>('/rubrics');
  }

  async getRubricVersions(rubricId?: string): Promise<any[]> {
    const path = rubricId ? `/rubrics/${rubricId}/versions` : '/rubrics/default/versions';
    return this.request<any[]>(path);
  }

  // ==========================================
  // Report Workspace & Sharing
  // ==========================================

  async getEvaluationReport(evaluationId: string, version?: number): Promise<any> {
    const query = version ? `?version=${version}` : '';
    return this.request<any>(`/evaluations/${evaluationId}/report${query}`);
  }

  async generateEvaluationReport(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/report/generate`, {
      method: 'POST',
    });
  }

  async getReportVersions(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/report/versions`);
  }

  async compareReportVersions(evaluationId: string, v1: number, v2: number): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/report/compare?v1=${v1}&v2=${v2}`);
  }

  async getReportEvidence(
    evaluationId: string,
    query?: string,
    type?: string,
    minConfidence?: number
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (type && type !== 'ALL') params.append('type', type);
    if (minConfidence !== undefined) params.append('minConfidence', String(minConfidence));

    const qs = params.toString();
    return this.request<any[]>(`/evaluations/${evaluationId}/report/evidence${qs ? `?${qs}` : ''}`);
  }

  async getReportSources(evaluationId: string): Promise<any[]> {
    return this.request<any[]>(`/evaluations/${evaluationId}/report/sources`);
  }

  getReportPdfUrl(evaluationId: string, version?: number): string {
    return version
      ? `${API_BASE}/evaluations/${evaluationId}/report/pdf?version=${version}`
      : `${API_BASE}/evaluations/${evaluationId}/report/pdf`;
  }

  async createReportShare(evaluationId: string, expiresInDays: number = 30): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/report/share`, {
      method: 'POST',
      body: JSON.stringify({ expiresInDays }),
    });
  }

  async revokeReportShare(shareId: string): Promise<boolean> {
    const res = await this.request<{ success?: boolean } | boolean>(`/report-share/${shareId}`, {
      method: 'DELETE',
    });
    return typeof res === 'boolean' ? res : Boolean(res?.success);
  }

  async getPublicReportShare(token: string): Promise<any> {
    return this.request<any>(`/report-share/${token}`);
  }

  // ==========================================
  // Live Camera AI Jury
  // ==========================================

  async getLiveSession(evaluationId: string): Promise<LiveJurySession | null> {
    const res = await this.request<{ session: LiveJurySession; snapshot: LiveScoreSnapshot } | LiveJurySession | null>(
      `/evaluations/${evaluationId}/live/status`
    );
    if (res && typeof res === 'object' && 'session' in res) {
      return res.session;
    }
    return res as LiveJurySession | null;
  }

  async getLiveScoreSnapshot(evaluationId: string): Promise<LiveScoreSnapshot | null> {
    return this.request<LiveScoreSnapshot | null>(`/evaluations/${evaluationId}/live/score`);
  }

  async startLiveSession(
    evaluationId: string,
    cameraSources: LiveCameraSource[] | LiveCameraSource = [],
    config?: { audioSamplingRate?: number; cvConfidenceThreshold?: number; autoQuestionTrigger?: boolean }
  ): Promise<{ session: LiveJurySession; snapshot: LiveScoreSnapshot } | any> {
    const sources = Array.isArray(cameraSources) ? cameraSources : [cameraSources];
    return this.request<any>(`/evaluations/${evaluationId}/live/start`, {
      method: 'POST',
      body: JSON.stringify({ cameraSources: sources, config }),
    });
  }

  async pauseLiveSession(evaluationId: string): Promise<LiveJurySession | null> {
    return this.request<LiveJurySession | null>(`/evaluations/${evaluationId}/live/pause`, {
      method: 'POST',
    });
  }

  async resumeLiveSession(evaluationId: string): Promise<LiveJurySession | null> {
    return this.request<LiveJurySession | null>(`/evaluations/${evaluationId}/live/resume`, {
      method: 'POST',
    });
  }

  async endLiveSession(evaluationId: string): Promise<LiveSessionFinalizationResult | null> {
    return this.request<LiveSessionFinalizationResult | null>(`/evaluations/${evaluationId}/live/end`, {
      method: 'POST',
    });
  }

  async getLiveEvents(evaluationId: string, sinceMs: number = 0): Promise<LiveEvent[]> {
    return this.request<LiveEvent[]>(`/evaluations/${evaluationId}/live/events?since=${sinceMs}`);
  }

  async getLiveTranscript(evaluationId: string): Promise<LiveTranscriptSegment[]> {
    return this.request<LiveTranscriptSegment[]>(`/evaluations/${evaluationId}/live/transcript`);
  }

  async getLiveObservations(
    evaluationId: string,
    category?: string
  ): Promise<LiveObservation[]> {
    const url = category
      ? `/evaluations/${evaluationId}/live/observations?category=${category}`
      : `/evaluations/${evaluationId}/live/observations`;
    return this.request<LiveObservation[]>(url);
  }

  async getLiveClaims(evaluationId: string): Promise<LiveClaimOccurrence[]> {
    return this.request<LiveClaimOccurrence[]>(`/evaluations/${evaluationId}/live/claims`);
  }

  async getLiveDemoEvents(evaluationId: string): Promise<LiveDemoEvent[]> {
    return this.request<LiveDemoEvent[]>(`/evaluations/${evaluationId}/live/demo`);
  }

  async getLiveQuestions(evaluationId: string): Promise<LiveJudgeQuestion[]> {
    return this.request<LiveJudgeQuestion[]>(`/evaluations/${evaluationId}/live/questions`);
  }

  async askLiveQuestion(
    evaluationId: string,
    questionId: string,
    elapsedSeconds: number = 0
  ): Promise<LiveJudgeQuestion | null> {
    return this.request<LiveJudgeQuestion | null>(`/evaluations/${evaluationId}/live/questions/${questionId}/ask`, {
      method: 'POST',
      body: JSON.stringify({ elapsedSeconds }),
    });
  }

  async addLiveJudgeNote(
    evaluationId: string,
    note: string,
    flaggedConcern: boolean = false,
    isBookmarked: boolean = false,
    elapsedSeconds: number = 0
  ): Promise<LiveJudgeNote | null> {
    return this.request<LiveJudgeNote | null>(`/evaluations/${evaluationId}/live/notes`, {
      method: 'POST',
      body: JSON.stringify({ note, flaggedConcern, isBookmarked, elapsedSeconds }),
    });
  }

  async sendLiveVisualTelemetry(
    evaluationId: string,
    telemetry: LivePresenterTrackingMetrics,
    elapsedSeconds: number = 0
  ): Promise<{ session: LiveJurySession; event: LiveEvent; snapshot: LiveScoreSnapshot } | null> {
    return this.request<{ session: LiveJurySession; event: LiveEvent; snapshot: LiveScoreSnapshot } | null>(
      `/evaluations/${evaluationId}/live/telemetry`,
      {
        method: 'POST',
        body: JSON.stringify({ telemetry, elapsedSeconds }),
      }
    );
  }

  // ==========================================
  // Orchestrator & State Machine
  // ==========================================

  async getOrchestratorStatus(evaluationId: string): Promise<OrchestratorProgress> {
    return this.request<OrchestratorProgress>(`/evaluations/${evaluationId}/orchestrate/status`);
  }

  async startOrchestration(
    evaluationId: string,
    options?: { skipMedia?: boolean; skipResearch?: boolean }
  ): Promise<OrchestratorProgress> {
    return this.request<OrchestratorProgress>(`/evaluations/${evaluationId}/orchestrate/start`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  async retryOrchestrationStage(evaluationId: string, stage: string): Promise<OrchestratorProgress> {
    return this.request<OrchestratorProgress>(`/evaluations/${evaluationId}/orchestrate/retry`, {
      method: 'POST',
      body: JSON.stringify({ stage }),
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
      body: JSON.stringify(data),
    });
  }

  async updateEvidenceRequest(
    requestId: string,
    status: string,
    responseNotes?: string
  ): Promise<EvidenceRequestRecord> {
    return this.request<EvidenceRequestRecord>(`/evidence-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseNotes }),
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
      body: JSON.stringify(data),
    });
  }

  async finalizeEvaluation(
    evaluationId: string,
    reviewerId?: string,
    note?: string
  ): Promise<{ message: string; state: any }> {
    return this.request<{ message: string; state: any }>(`/evaluations/${evaluationId}/finalize`, {
      method: 'POST',
      body: JSON.stringify({ reviewerId, note }),
    });
  }

  async getAuditTrail(evaluationId: string): Promise<AuditEventRecord[]> {
    return this.request<AuditEventRecord[]>(`/evaluations/${evaluationId}/audit-trail`);
  }

  async saveHumanReview(
    evaluationId: string,
    data: {
      reviewer?: string;
      reviewerId?: string;
      reviewerName?: string;
      reviewerRole?: string;
      category: string;
      originalScore?: number;
      reviewedScore?: number;
      calibratedScore?: number;
      notes?: string;
      reason?: string;
      verdict?: string;
    }
  ): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/human-review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDossier(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/report`);
  }

  // ==========================================
  // AI Jury Deliberation & Multi-Turn Debate
  // ==========================================

  async getJuryDeliberation(evaluationId: string): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/jury/deliberation`);
  }

  async runJuryDeliberation(
    evaluationId: string,
    options?: { maxRounds?: number; targetConsensusScore?: number }
  ): Promise<any> {
    return this.request<any>(`/evaluations/${evaluationId}/jury/deliberate`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  async getJuryDeliberationStatus(): Promise<any> {
    return this.request<any>('/admin/jury-deliberation/status');
  }

  async simulateJuryDebate(evaluationId: string): Promise<any> {
    return this.request<any>('/admin/jury-deliberation/simulate-debate', {
      method: 'POST',
      body: JSON.stringify({ evaluationId }),
    });
  }

  // ==========================================
  // Admin Observability & Health
  // ==========================================

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
      body: JSON.stringify({ enabled, description }),
    });
  }

  async getHealth(): Promise<{ status: string; mockMode: boolean }> {
    return this.request<{ status: string; mockMode: boolean }>('/health');
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.getHealth();
      return true;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService();

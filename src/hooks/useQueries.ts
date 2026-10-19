import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../services/api';

// ==========================================
// Query Keys Factory
// ==========================================
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id?: string) => ['projects', id] as const,
  evaluations: ['evaluations'] as const,
  evaluation: (id?: string) => ['evaluations', id] as const,
  evaluationStatus: (id?: string) => ['evaluations', id, 'status'] as const,
  masterScore: (id?: string) => ['evaluations', id, 'master-score'] as const,
  projectDNA: (id?: string) => ['evaluations', id, 'project-dna'] as const,
  technicalAudit: (id?: string) => ['evaluations', id, 'technical'] as const,
  originality: (id?: string) => ['evaluations', id, 'originality'] as const,
  claims: (id?: string) => ['evaluations', id, 'claims'] as const,
  impact: (id?: string) => ['evaluations', id, 'impact'] as const,
  feasibility: (id?: string) => ['evaluations', id, 'feasibility'] as const,
  presentation: (id?: string) => ['evaluations', id, 'presentation'] as const,
  jury: (id?: string) => ['evaluations', id, 'jury'] as const,
  report: (id?: string) => ['evaluations', id, 'report'] as const,
  health: ['health'] as const,
};

// ==========================================
// Query Hooks
// ==========================================

export function useProjectsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => api.getProjects(),
    enabled: options?.enabled ?? true,
  });
}

export function useProjectQuery(projectId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => {
      if (!projectId) throw new ApiError('Project ID is required', 'INVALID_ARGUMENT');
      return api.getProjectById(projectId);
    },
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  });
}

export function useEvaluationsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.evaluations,
    queryFn: () => api.getEvaluations(),
    enabled: options?.enabled ?? true,
  });
}

export function useEvaluationQuery(evaluationId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.evaluation(evaluationId),
    queryFn: () => {
      if (!evaluationId) throw new ApiError('Evaluation ID is required', 'INVALID_ARGUMENT');
      return api.getEvaluationById(evaluationId);
    },
    enabled: Boolean(evaluationId) && (options?.enabled ?? true),
  });
}

export function useEvaluationStatusQuery(evaluationId?: string, options?: { enabled?: boolean; refetchInterval?: number | false }) {
  return useQuery({
    queryKey: queryKeys.evaluationStatus(evaluationId),
    queryFn: () => {
      if (!evaluationId) throw new ApiError('Evaluation ID is required', 'INVALID_ARGUMENT');
      return api.getEvaluationStatus(evaluationId);
    },
    enabled: Boolean(evaluationId) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useMasterScoreQuery(evaluationId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.masterScore(evaluationId),
    queryFn: () => {
      if (!evaluationId) throw new ApiError('Evaluation ID is required', 'INVALID_ARGUMENT');
      return api.getMasterScore(evaluationId);
    },
    enabled: Boolean(evaluationId) && (options?.enabled ?? true),
  });
}

export function useProjectDNAQuery(evaluationId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.projectDNA(evaluationId),
    queryFn: () => {
      if (!evaluationId) throw new ApiError('Evaluation ID is required', 'INVALID_ARGUMENT');
      return api.getProjectDNA(evaluationId);
    },
    enabled: Boolean(evaluationId) && (options?.enabled ?? true),
  });
}

export function useTechnicalAuditQuery(evaluationId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.technicalAudit(evaluationId),
    queryFn: () => {
      if (!evaluationId) throw new ApiError('Evaluation ID is required', 'INVALID_ARGUMENT');
      return api.getTechnical(evaluationId);
    },
    enabled: Boolean(evaluationId) && (options?.enabled ?? true),
  });
}

export function useOriginalityQuery(evaluationId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.originality(evaluationId),
    queryFn: () => {
      if (!evaluationId) throw new ApiError('Evaluation ID is required', 'INVALID_ARGUMENT');
      return api.getOriginalityBundle(evaluationId);
    },
    enabled: Boolean(evaluationId) && (options?.enabled ?? true),
  });
}

export function useClaimsQuery(evaluationId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.claims(evaluationId),
    queryFn: () => {
      if (!evaluationId) throw new ApiError('Evaluation ID is required', 'INVALID_ARGUMENT');
      return api.getEvaluationClaims(evaluationId);
    },
    enabled: Boolean(evaluationId) && (options?.enabled ?? true),
  });
}

export function useHealthQuery(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.getHealth(),
    refetchInterval: options?.refetchInterval ?? 30000,
  });
}

// ==========================================
// Mutation Hooks
// ==========================================

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectData: any) => api.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useCreateEvaluationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: string; mode: string }) => api.createEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations });
    },
  });
}

export function useStartEvaluationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ evaluationId, options }: { evaluationId: string; options?: { fastMode?: boolean; stageDelayMs?: number } }) =>
      api.startEvaluation(evaluationId, options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluation(variables.evaluationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluationStatus(variables.evaluationId) });
    },
  });
}

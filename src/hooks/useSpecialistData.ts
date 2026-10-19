import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { TechnicalAuditReport } from '../types/technicalAudit';
import type { EvaluationClaimsSummary } from '../types/claimVerification';
import type { JuryDecisionData } from '../types/aiJuryScoring';
import type { SpecialistEvaluationSummary } from '../types/specialistEvaluation';

/**
 * Hook for fetching and synchronizing live Technical Auditor data
 */
export function useTechnicalAudit(evaluationId?: string, initialReport?: TechnicalAuditReport) {
  const [data, setData] = useState<any | null>(initialReport || null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(evaluationId && !initialReport));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!evaluationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getTechnical(evaluationId);
      setData(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    if (!evaluationId) return;

    api.getTechnical(evaluationId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [evaluationId]);

  return { liveData: data, isLoading, error, reload };
}

/**
 * Hook for fetching and synchronizing live Project DNA data
 */
export function useProjectDNA(evaluationId?: string, initialData?: any) {
  const [dna, setDna] = useState<any | null>(initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(evaluationId && !initialData));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!evaluationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getProjectDNA(evaluationId);
      if (res) setDna(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    if (!evaluationId) return;

    api.getProjectDNA(evaluationId)
      .then((res) => {
        if (isMounted) {
          if (res) setDna(res);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [evaluationId]);

  return { dna, isLoading, error, reload };
}

/**
 * Hook for fetching and synchronizing live Claims data & contradictions
 */
export function useClaimVerificationData(evaluationId?: string) {
  const [claimsSummary, setClaimsSummary] = useState<EvaluationClaimsSummary | null>(null);
  const [contradictions, setContradictions] = useState<any[]>([]);
  const [evidenceGaps, setEvidenceGaps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(evaluationId));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!evaluationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, conRes, gapRes] = await Promise.allSettled([
        api.getEvaluationClaims(evaluationId),
        api.getClaimContradictions(evaluationId),
        api.getClaimEvidenceGaps(evaluationId),
      ]);
      if (sumRes.status === 'fulfilled' && sumRes.value) {
        setClaimsSummary(sumRes.value);
      }
      if (conRes.status === 'fulfilled' && Array.isArray(conRes.value)) {
        setContradictions(conRes.value);
      }
      if (gapRes.status === 'fulfilled' && Array.isArray(gapRes.value)) {
        setEvidenceGaps(gapRes.value);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    if (!evaluationId) return;

    Promise.allSettled([
      api.getEvaluationClaims(evaluationId),
      api.getClaimContradictions(evaluationId),
      api.getClaimEvidenceGaps(evaluationId),
    ]).then(([sumRes, conRes, gapRes]) => {
      if (!isMounted) return;
      if (sumRes.status === 'fulfilled' && sumRes.value) {
        setClaimsSummary(sumRes.value);
      }
      if (conRes.status === 'fulfilled' && Array.isArray(conRes.value)) {
        setContradictions(conRes.value);
      }
      if (gapRes.status === 'fulfilled' && Array.isArray(gapRes.value)) {
        setEvidenceGaps(gapRes.value);
      }
      setIsLoading(false);
    }).catch((err: any) => {
      if (isMounted) {
        setError(err);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [evaluationId]);

  return { claimsSummary, contradictions, evidenceGaps, isLoading, error, reload };
}

/**
 * Hook for fetching and synchronizing live Impact & Feasibility data
 */
export function useImpactFeasibilityData(evaluationId?: string) {
  const [summary, setSummary] = useState<SpecialistEvaluationSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(evaluationId));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!evaluationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getSpecialistSummary(evaluationId);
      if (res) setSummary(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    if (!evaluationId) return;

    api.getSpecialistSummary(evaluationId)
      .then((res) => {
        if (isMounted) {
          if (res) setSummary(res);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [evaluationId]);

  return { summary, isLoading, error, reload };
}

/**
 * Hook for fetching and synchronizing live Presentation & Demo analysis
 */
export function usePresentationDemoData(evaluationId?: string) {
  const [videoAnalysis, setVideoAnalysis] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(evaluationId));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!evaluationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getVideoAnalysis(evaluationId);
      if (res) setVideoAnalysis(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    if (!evaluationId) return;

    api.getVideoAnalysis(evaluationId)
      .then((res) => {
        if (isMounted) {
          if (res) setVideoAnalysis(res);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [evaluationId]);

  return { videoAnalysis, isLoading, error, reload };
}

/**
 * Hook for fetching Master Dossier
 */
export function useMasterDossierData(evaluationId?: string, initialDossier?: any) {
  const [dossier, setDossier] = useState<any | null>(initialDossier || null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(evaluationId && !initialDossier));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!evaluationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getDossier(evaluationId);
      if (res) setDossier(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    if (!evaluationId) return;

    api.getDossier(evaluationId)
      .then((res) => {
        if (isMounted) {
          if (res) setDossier(res);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [evaluationId]);

  return { dossier, isLoading, error, reload };
}

/**
 * Hook for fetching AI Jury Decision
 */
export function useAIJuryDecision(evaluationId?: string, initialDecision?: JuryDecisionData) {
  const [decision, setDecision] = useState<JuryDecisionData | null>(initialDecision || null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(evaluationId && !initialDecision));
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!evaluationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getJuryDecision(evaluationId);
      if (res) setDecision(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    if (!evaluationId) return;

    api.getJuryDecision(evaluationId)
      .then((res) => {
        if (isMounted) {
          if (res) setDecision(res);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [evaluationId]);

  return { decision, isLoading, error, reload };
}

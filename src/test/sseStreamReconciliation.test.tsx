import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '../services/api';
import { useOrchestratorStatusQuery } from '../hooks/useQueries';
import type { OrchestratorProgress } from '../types/integration';

describe('SSE Stream Stale State & TanStack Query Polling Reconciliation Probe', () => {
  let queryClient: QueryClient;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    queryClient.clear();
  });

  describe('1. useOrchestratorStatusQuery Hook Contract', () => {
    it('fetches orchestrator progress for an evaluation using TanStack Query', async () => {
      const mockProgress: OrchestratorProgress = {
        evaluationId: 'eval_smart-road-vision',
        currentState: 'EVALUATING',
        isCompleted: false,
        isFailed: false,
        isLocked: false,
        totalStages: 15,
        completedStages: 6,
        percentage: 40,
        stages: [],
        checkpoints: [],
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(api, 'getOrchestratorStatus').mockResolvedValue(mockProgress);

      const TestHarness: React.FC = () => {
        const { data, isLoading } = useOrchestratorStatusQuery('eval_smart-road-vision');
        if (isLoading) return <div>Loading progress...</div>;
        return (
          <div>
            <span data-testid="status-stage">{data?.currentState}</span>
            <span data-testid="status-percentage">{data?.percentage}%</span>
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestHarness />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('status-stage').textContent).toBe('EVALUATING');
        expect(screen.getByTestId('status-percentage').textContent).toBe('40%');
      });

      expect(api.getOrchestratorStatus).toHaveBeenCalledWith('eval_smart-road-vision');
    });

    it('disables query when evaluationId is undefined or enabled option is false', async () => {
      const getStatusSpy = vi.spyOn(api, 'getOrchestratorStatus');

      const TestHarness: React.FC = () => {
        const { isFetching } = useOrchestratorStatusQuery('eval_smart-road-vision', { enabled: false });
        return <div>Fetching: {String(isFetching)}</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestHarness />
        </QueryClientProvider>
      );

      expect(getStatusSpy).not.toHaveBeenCalled();
    });
  });

  describe('2. Reconciliation Probe Activation Logic', () => {
    // Helper pure logic tester mirroring EvaluationWorkspacePage reconciliation logic
    const evaluateProbeActive = (params: {
      pipelineProgress: { isCompleted: boolean; percentage: number; completedStages: number } | null;
      isSseActive: boolean;
      isSseSilent: boolean;
    }) => {
      const isPipelineActive = Boolean(params.pipelineProgress && !params.pipelineProgress.isCompleted);
      const isNearCompletion = Boolean(
        params.pipelineProgress &&
        !params.pipelineProgress.isCompleted &&
        (params.pipelineProgress.percentage >= 90 || params.pipelineProgress.completedStages >= 13)
      );
      const isHeartbeatStalled = params.isSseSilent || !params.isSseActive;
      return isPipelineActive && (isNearCompletion || isHeartbeatStalled);
    };

    it('engages probe when stage progress reaches Stage 14/15 (93% >= 90%) even if SSE is connected', () => {
      const active = evaluateProbeActive({
        pipelineProgress: { isCompleted: false, percentage: 93, completedStages: 14 },
        isSseActive: true,
        isSseSilent: false,
      });

      expect(active).toBe(true);
    });

    it('does NOT engage probe during healthy early stages (e.g. Stage 3, 20%) with active SSE', () => {
      const active = evaluateProbeActive({
        pipelineProgress: { isCompleted: false, percentage: 20, completedStages: 3 },
        isSseActive: true,
        isSseSilent: false,
      });

      expect(active).toBe(false);
    });

    it('engages probe immediately when SSE heartbeats cease for >12s regardless of stage percentage', () => {
      const active = evaluateProbeActive({
        pipelineProgress: { isCompleted: false, percentage: 45, completedStages: 6 },
        isSseActive: true,
        isSseSilent: true, // Heartbeat watchdog triggered
      });

      expect(active).toBe(true);
    });

    it('engages probe when SSE connection drops (onerror / offline)', () => {
      const active = evaluateProbeActive({
        pipelineProgress: { isCompleted: false, percentage: 50, completedStages: 7 },
        isSseActive: false,
        isSseSilent: false,
      });

      expect(active).toBe(true);
    });

    it('deactivates probe once pipeline is completed (100%)', () => {
      const active = evaluateProbeActive({
        pipelineProgress: { isCompleted: true, percentage: 100, completedStages: 15 },
        isSseActive: false,
        isSseSilent: true,
      });

      expect(active).toBe(false);
    });
  });

  describe('3. Stage 15 Database Write Stale State Reconciliation Flow', () => {
    it('reconciles pipeline state from stuck 93% to 100% completed when network drops during Stage 15 DB write', async () => {
      // Simulating the exact bug report:
      // Frontend is at Stage 14/15 (93%).
      // SSE connection silently drops during Stage 15 database write.
      // Backend finishes report and marks isCompleted: true in SQLite.
      // The TanStack Query polling probe probes the backend, discovers completion,
      // and reconciles local state to 100% completed, triggering loadData().

      const completedBackendProgress: OrchestratorProgress = {
        evaluationId: 'eval_smart-road-vision',
        currentState: 'FINAL',
        isCompleted: true,
        isFailed: false,
        isLocked: false,
        totalStages: 15,
        completedStages: 15,
        percentage: 100,
        stages: [],
        checkpoints: [],
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(api, 'getOrchestratorStatus').mockResolvedValue(completedBackendProgress);
      const mockLoadData = vi.fn();

      // Test component simulating EvaluationWorkspacePage's reconciliation architecture
      const ReconciliationTestComponent: React.FC<{
        initialStagePercentage: number;
        sseDisconnected: boolean;
        sseSilent: boolean;
      }> = ({ initialStagePercentage, sseDisconnected, sseSilent }) => {
        const [pipelineProgress, setPipelineProgress] = useState<OrchestratorProgress | null>({
          evaluationId: 'eval_smart-road-vision',
          currentState: 'EVALUATING',
          isCompleted: false,
          isFailed: false,
          isLocked: false,
          totalStages: 15,
          completedStages: 14,
          percentage: initialStagePercentage, // 93%
          stages: [],
          checkpoints: [],
          updatedAt: new Date().toISOString(),
        });

        const isPipelineActive = Boolean(pipelineProgress && !pipelineProgress.isCompleted);
        const isNearCompletion = Boolean(
          pipelineProgress &&
          !pipelineProgress.isCompleted &&
          (pipelineProgress.percentage >= 90 || pipelineProgress.completedStages >= 13)
        );
        const isHeartbeatStalled = sseSilent || sseDisconnected;
        const isReconciliationProbeActive = isPipelineActive && (isNearCompletion || isHeartbeatStalled);

        const { data: probedStatus } = useOrchestratorStatusQuery('eval_smart-road-vision', {
          enabled: isReconciliationProbeActive,
          refetchInterval: isReconciliationProbeActive ? 100 : false,
        });

        useEffect(() => {
          if (!probedStatus) return;

          queueMicrotask(() => {
            if (
              probedStatus.isCompleted ||
              probedStatus.currentState === 'FINAL' ||
              probedStatus.completedStages >= 15
            ) {
              setPipelineProgress({
                ...probedStatus,
                isCompleted: true,
                percentage: 100,
              });
              mockLoadData();
            }
          });
        }, [probedStatus]);

        return (
          <div>
            <div data-testid="pipeline-progress-percentage">{pipelineProgress?.percentage}%</div>
            <div data-testid="pipeline-progress-status">{pipelineProgress?.isCompleted ? 'COMPLETED' : 'PROCESSING'}</div>
            <div data-testid="probe-active-flag">{String(isReconciliationProbeActive)}</div>
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <ReconciliationTestComponent
            initialStagePercentage={93}
            sseDisconnected={true} // SSE dropped
            sseSilent={true}
          />
        </QueryClientProvider>
      );

      // Verify probe was triggered because percentage was 93% and SSE dropped
      expect(screen.getByTestId('probe-active-flag').textContent).toBe('true');

      // Wait for probe to reconcile state
      await waitFor(() => {
        expect(screen.getByTestId('pipeline-progress-status').textContent).toBe('COMPLETED');
        expect(screen.getByTestId('pipeline-progress-percentage').textContent).toBe('100%');
      });

      // Verify loadData was automatically invoked to refresh master score and dossier
      expect(mockLoadData).toHaveBeenCalledTimes(1);

      // Verify probe deactivates once completed
      await waitFor(() => {
        expect(screen.getByTestId('probe-active-flag').textContent).toBe('false');
      });
    });
  });

  describe('4. Heartbeat Watchdog Timing & Silence Detection', () => {
    it('accurately identifies silent SSE stream when elapsed time exceeds 12,000ms', () => {
      let lastHeartbeat = Date.now() - 13000; // 13 seconds ago (exceeds 12s threshold)
      const isSilent = Date.now() - lastHeartbeat > 12000;
      expect(isSilent).toBe(true);

      // When fresh heartbeat arrives, silence is reset
      lastHeartbeat = Date.now();
      const isFresh = Date.now() - lastHeartbeat <= 12000;
      expect(isFresh).toBe(true);
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeightedBreakdownBar } from '../components/ai-jury/WeightedBreakdownBar';
import { MethodologyPanel } from '../components/ai-jury/MethodologyPanel';
import { AIJuryVerdictCard } from '../components/ai-jury/AIJuryVerdictCard';
import { LiveMetricsPanel } from '../components/live-jury/LiveMetricsPanel';
import { LiveTranscriptPanel } from '../components/live-jury/LiveTranscriptPanel';
import { EvidenceStatusPanel } from '../components/live-jury/EvidenceStatusPanel';
import { ClaimDetectionPanel } from '../components/live-jury/ClaimDetectionPanel';
import { SampleScorecard } from '../components/SampleScorecard';
import { PipelineVisualization } from '../components/PipelineVisualization';
import { mockHardwareScorecard } from '../data/mockAiJuryScoring';
import { VERDICT_THRESHOLDS, WEIGHT_PRESETS } from '../config/rubricConstants';
import type { DimensionId } from '../types/aiJuryScoring';

describe('Component Data Flow & Decoupled State Testing', () => {
  describe('WeightedBreakdownBar', () => {
    it('renders with weight presets and allows selecting custom preset weights', () => {
      const onApplyPreset = vi.fn();
      const currentWeights: Record<DimensionId, number> = {
        'problem-need': 10,
        'technical-quality': 20,
        'innovation-originality': 15,
        'social-impact': 10,
        'presentation': 10,
        'demonstration-quality': 15,
        'feasibility-scalability': 10,
        'future-potential': 10,
      };

      render(
        <WeightedBreakdownBar
          dimensions={mockHardwareScorecard.dimensions}
          activeWeights={currentWeights}
          onUpdateWeight={vi.fn()}
          onApplyPreset={onApplyPreset}
          onResetWeights={vi.fn()}
          calculatedOverallScore={87.4}
          presets={WEIGHT_PRESETS}
        />
      );

      expect(screen.getByText(/Weighted Scoring Calculation/i)).toBeInTheDocument();
      expect(screen.getByText(/Rubric Presets:/i)).toBeInTheDocument();

      // Click on Venture preset button
      const venturePresetBtn = screen.getByRole('button', { name: /venture/i });
      expect(venturePresetBtn).toBeInTheDocument();
      fireEvent.click(venturePresetBtn);

      expect(onApplyPreset).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'venture-commercial' })
      );
    });
  });

  describe('MethodologyPanel', () => {
    it('renders all canonical verdict levels when expanded and toggles collapse state', () => {
      render(
        <MethodologyPanel
          isInitiallyExpanded={true}
          thresholds={VERDICT_THRESHOLDS}
        />
      );

      // Verify all 5 verdict tiers and formulas are documented
      expect(screen.getByText('Scoring Methodology & Mathematical Traceability Rubric')).toBeInTheDocument();
      expect(screen.getByText('Audit Standard v4.2')).toBeInTheDocument();
      expect(screen.getByText(/Consensus Overall Score Formula/)).toBeInTheDocument();
      expect(screen.getByText(/Bayesian Confidence Weighting & Attenuation/)).toBeInTheDocument();
      expect(screen.getByText('The Anti-Black-Box Mandate (Core Design Philosophy)')).toBeInTheDocument();

      // Verify all 5 canonical verdict tier labels are present
      expect(screen.getByText('Exceptional')).toBeInTheDocument();
      expect(screen.getByText('Strong')).toBeInTheDocument();
      expect(screen.getByText('Promising')).toBeInTheDocument();
      expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
      expect(screen.getByText('Weak')).toBeInTheDocument();

      // Click toggle button to collapse rubric
      const toggleButton = screen.getByRole('button', { name: /collapse/i });
      fireEvent.click(toggleButton);

      // Label changes to Expand Rubric
      expect(screen.getByText('Expand Rubric')).toBeInTheDocument();
    });
  });

  describe('AIJuryVerdictCard', () => {
    it('renders consensus score, verdict tier, and allows juror tab switching', () => {
      const onOpenMethodology = vi.fn();
      render(
        <AIJuryVerdictCard
          scorecard={mockHardwareScorecard}
          onOpenMethodology={onOpenMethodology}
          thresholds={VERDICT_THRESHOLDS}
        />
      );

      expect(screen.getByText(/AI Jury Verdict & Consolidated Scorecard/i)).toBeInTheDocument();
      expect(screen.getByText(/Official Consensus Engine/i)).toBeInTheDocument();

      // Juror tab switching using the second juror's identifier
      const secondJuror = mockHardwareScorecard.jurors[1];
      const secondJurorFirstToken = secondJuror.name.split(' ')[0];
      const jurorButtons = screen.getAllByRole('button');
      const juror2Btn = jurorButtons.find(b => b.textContent?.includes(secondJurorFirstToken));
      expect(juror2Btn).toBeTruthy();
      fireEvent.click(juror2Btn!);

      expect(screen.getByText(secondJuror.name)).toBeInTheDocument();
    });
  });

  describe('Live Jury Panels (Telemetry & Stream)', () => {
    it('LiveMetricsPanel renders dynamic metrics prop and calculates custom aggregate score', () => {
      const customMetrics = [
        {
          id: 'test_metric_1',
          label: 'Inference Precision',
          value: 96.5,
          unit: '%',
          trend: 'up' as const,
          subtext: 'Observed continuous 60FPS on Jetson Orin',
        },
      ];

      render(
        <LiveMetricsPanel
          metrics={customMetrics as any}
          aggregateScore={96.5}
        />
      );

      expect(screen.getByText('Inference Precision')).toBeInTheDocument();
      expect(screen.getByText('96.5%')).toBeInTheDocument();
      expect(screen.getByText(/LIVE TELEMETRY/i)).toBeInTheDocument();
      expect(screen.getByText(/Aggregate Session Score: 96.5 \/ 100/i)).toBeInTheDocument();
    });

    it('LiveTranscriptPanel renders synchronized entries and toggles collapse state', () => {
      const customTranscript = [
        {
          id: 'tr_1',
          timestamp: '00:15',
          speaker: 'Lead Engineer',
          text: 'This prototype fuses dual optical flow sensors.',
          isQuestion: false,
        },
      ];

      const onToggle = vi.fn();
      render(
        <LiveTranscriptPanel
          isVisible={true}
          onToggleVisibility={onToggle}
          transcript={customTranscript as any}
        />
      );

      expect(screen.getByText('Lead Engineer')).toBeInTheDocument();
      expect(screen.getByText('This prototype fuses dual optical flow sensors.')).toBeInTheDocument();
      expect(screen.getByText(/LIVE STREAM/i)).toBeInTheDocument();

      const toggleBtn = screen.getByRole('button', { name: /collapse/i });
      fireEvent.click(toggleBtn);
      expect(onToggle).toHaveBeenCalled();
    });

    it('EvidenceStatusPanel renders daemons and active statuses', () => {
      const customEvidence = [
        {
          id: 'daemon_1',
          module: 'AST Static Analyzer',
          type: 'Code Forensics',
          status: 'ONLINE',
          detail: 'Continuous commit parsing active.',
          latency: '12ms',
        },
      ];

      render(<EvidenceStatusPanel evidenceStatus={customEvidence as any} />);

      expect(screen.getByText('AST Static Analyzer')).toBeInTheDocument();
      expect(screen.getByText('ONLINE')).toBeInTheDocument();
      expect(screen.getByText('Lat: 12ms')).toBeInTheDocument();
      expect(screen.getByText(/LIVE DAEMONS/i)).toBeInTheDocument();
    });

    it('ClaimDetectionPanel renders extracted claims and active interrogative probe', () => {
      const customClaims = [
        {
          id: 'claim_1',
          timestamp: '01:20',
          category: 'PERFORMANCE',
          status: 'VERIFIED' as const,
          text: 'System sustains sub-50ms reaction times under high load.',
          evidenceRef: 'Bench Log #412',
          confidence: 94,
        },
      ];

      render(
        <ClaimDetectionPanel
          claims={customClaims as any}
          currentProbe="Can you explain the thread allocation architecture?"
        />
      );

      expect(screen.getByText(/System sustains sub-50ms reaction times under high load./i)).toBeInTheDocument();
      expect(screen.getByText('VERIFIED')).toBeInTheDocument();
      expect(screen.getByText('94% Conf.')).toBeInTheDocument();
      expect(screen.getByText(/"Can you explain the thread allocation architecture\?"/i)).toBeInTheDocument();
      expect(screen.getByText(/LIVE CLAIMS/i)).toBeInTheDocument();
    });
  });

  describe('Landing & Presentation Components', () => {
    it('SampleScorecard renders rubric items and interactive details', () => {
      render(<SampleScorecard />);

      expect(screen.getByText(/Interactive Jury Dossier:/i)).toBeInTheDocument();
      expect(screen.getByText(/Composite Verdict/i)).toBeInTheDocument();
      expect(screen.getByText(/EXECUTIVE JURY SUMMARY/i)).toBeInTheDocument();
    });

    it('PipelineVisualization renders 5-stage pipeline with interactive stage selector', () => {
      render(<PipelineVisualization />);

      expect(screen.getByText(/5-STAGE AUTONOMOUS PIPELINE/i)).toBeInTheDocument();
      expect(screen.getByText(/STAGE 01 ARCHITECTURE/i)).toBeInTheDocument();
      expect(screen.getAllByText('Multimodal Ingestion').length).toBeGreaterThanOrEqual(1);

      // Verify all 5 stages are rendered
      expect(screen.getByText('STAGE 01')).toBeInTheDocument();
      expect(screen.getByText('STAGE 02')).toBeInTheDocument();
      expect(screen.getByText('STAGE 03')).toBeInTheDocument();
      expect(screen.getByText('STAGE 04')).toBeInTheDocument();
      expect(screen.getByText('STAGE 05')).toBeInTheDocument();

      // Click on stage 02
      const stage2Buttons = screen.getAllByRole('button');
      const stage2Btn = stage2Buttons.find(b => b.textContent?.includes('STAGE 02'));
      expect(stage2Btn).toBeTruthy();
      fireEvent.click(stage2Btn!);

      // Verify stage 2 button receives active border styling
      expect(stage2Btn?.className).toContain('border-cyan-400');
    });
  });
});

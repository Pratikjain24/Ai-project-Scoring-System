import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MasterEvaluationDossier } from '../components/dossier/MasterEvaluationDossier';
import { ReportHeader } from '../components/dossier/ReportHeader';
import { MOCK_HARDWARE_DOSSIER, MOCK_SOFTWARE_DOSSIER } from '../data/mockMasterDossier';
import type { MasterDossierData } from '../types/masterDossier';

describe('Master Evaluation Dossier & Export Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock window.print
    window.print = vi.fn();
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  describe('Component Rendering & Structure', () => {
    it('renders the complete master evaluation dossier with 20 sections and header', () => {
      render(<MasterEvaluationDossier defaultProjectType="hardware" />);

      // Verify header title and project identification
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(MOCK_HARDWARE_DOSSIER.projectName);
      expect(screen.getAllByText('20 Sections').length).toBeGreaterThanOrEqual(1);

      // Verify key sections are present in Table of Contents or body
      expect(screen.getByText('1. Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('4. Technical Audit')).toBeInTheDocument();
      expect(screen.getByText('6. Claim Verification')).toBeInTheDocument();
      expect(screen.getByText('20. Final AI Jury Verdict')).toBeInTheDocument();
    });

    it('renders with custom initialDossier prop when provided', () => {
      const customDossier: MasterDossierData = {
        ...MOCK_HARDWARE_DOSSIER,
        projectName: 'Autonomous Solar Rover Alpha',
        overallScore: 94.5,
        aiVerdict: 'Exceptional',
      };

      render(
        <MasterEvaluationDossier
          defaultProjectType="hardware"
          initialDossier={customDossier}
        />
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Autonomous Solar Rover Alpha');
      expect(screen.getByText('94.5')).toBeInTheDocument();
      expect(screen.getAllByText(/exceptional/i).length).toBeGreaterThan(0);
    });
  });

  describe('Track Switching & Audience Filtering', () => {
    it('switches between hardware and software tracks', () => {
      render(<MasterEvaluationDossier defaultProjectType="hardware" />);

      // Click Software track button
      const softwareButtons = screen.getAllByRole('button', { name: /^software$/i });
      fireEvent.click(softwareButtons[0]);

      // Expect software project name to be displayed in heading
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(MOCK_SOFTWARE_DOSSIER.projectName);

      // Click Hardware track button
      const hardwareButtons = screen.getAllByRole('button', { name: /^hardware$/i });
      fireEvent.click(hardwareButtons[0]);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(MOCK_HARDWARE_DOSSIER.projectName);
    });

    it('changes audience preset perspective', () => {
      const onAudienceChange = vi.fn();
      render(
        <ReportHeader
          dossier={MOCK_HARDWARE_DOSSIER}
          activeTrack="hardware"
          onSwitchTrack={vi.fn()}
          selectedAudience="university"
          onChangeAudience={onAudienceChange}
        />
      );

      // Select Enterprise Review Panel preset button
      const enterpriseBtn = screen.getByRole('button', { name: /enterprise/i });
      fireEvent.click(enterpriseBtn);

      expect(onAudienceChange).toHaveBeenCalledWith('enterprise');
    });
  });

  describe('Export & Sharing Capabilities', () => {
    it('triggers document print dialog when Print button is clicked', () => {
      render(
        <ReportHeader
          dossier={MOCK_HARDWARE_DOSSIER}
          activeTrack="hardware"
          onSwitchTrack={vi.fn()}
          selectedAudience="university"
          onChangeAudience={vi.fn()}
        />
      );

      const printBtn = screen.getByRole('button', { name: /print report/i });
      fireEvent.click(printBtn);

      expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('copies report link to clipboard when Share button is clicked', async () => {
      render(
        <ReportHeader
          dossier={MOCK_HARDWARE_DOSSIER}
          activeTrack="hardware"
          onSwitchTrack={vi.fn()}
          selectedAudience="university"
          onChangeAudience={vi.fn()}
        />
      );

      const shareBtn = screen.getByRole('button', { name: /share report/i });
      fireEvent.click(shareBtn);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
      await waitFor(() => {
        expect(screen.getByText(/link copied/i)).toBeInTheDocument();
      });
    });

    it('executes JSON download export with full dossier payload', async () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      render(
        <ReportHeader
          dossier={MOCK_HARDWARE_DOSSIER}
          activeTrack="hardware"
          onSwitchTrack={vi.fn()}
          selectedAudience="university"
          onChangeAudience={vi.fn()}
        />
      );

      const downloadBtn = screen.getByRole('button', { name: /download report/i });
      fireEvent.click(downloadBtn);

      expect(clickSpy).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByText(/downloaded!/i)).toBeInTheDocument();
      });
    });
  });
});

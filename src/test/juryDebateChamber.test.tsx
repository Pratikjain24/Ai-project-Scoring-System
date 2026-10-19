import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JuryDebateChamber } from '../components/ai-jury/JuryDebateChamber';
import { api } from '../services/api';

describe('AI Jury Deliberation & 3-Turn Multi-Persona Debate Loop', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the AI Jury Deliberation Chamber header, ratified consensus score, and 5 juror personas', async () => {
    render(<JuryDebateChamber evaluationId="eval_smart-road-vision" projectName="Smart Road Vision" />);

    expect(screen.getByText('AI Jury Deliberation Chamber')).toBeInTheDocument();
    expect(screen.getByText(/Ratified Consensus Score/i)).toBeInTheDocument();
    expect(screen.getAllByText('83.7').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('STRONG').length).toBeGreaterThanOrEqual(1);

    // Verify 5 distinct specialist personas
    expect(screen.getAllByText('Dr. Marcus Vance').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Prof. Elena Rostova').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Eng. Tariq Chen').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Maya Lin').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hon. Arthur Pendelton').length).toBeGreaterThanOrEqual(1);
  });

  it('displays statistical variance audit meter showing standard deviation contraction', () => {
    render(<JuryDebateChamber evaluationId="eval_smart-road-vision" projectName="Smart Road Vision" />);

    expect(screen.getByText('Statistical Variance Audit')).toBeInTheDocument();
    expect(screen.getAllByText(/σ = 2.91/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/σ = 0.42/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/86% Variance Reduction/i)).toBeInTheDocument();
  });

  it('navigates across 3-turn debate rounds and renders adversarial peer challenges in Round 2', () => {
    render(<JuryDebateChamber evaluationId="eval_smart-road-vision" projectName="Smart Road Vision" />);

    // Round 2 is selected by default or clickable
    const r2Button = screen.getByRole('button', { name: /Round 2:/i });
    fireEvent.click(r2Button);

    // Verify peer challenge cards exist
    expect(screen.getByText(/Direct Peer Challenges & Counter-Rebuttals/i)).toBeInTheDocument();
    expect(screen.getByText(/Accuracy Claim Pacing vs Independent Test Split/i)).toBeInTheDocument();
    expect(screen.getByText(/Code Complexity & Hardware Architecture vs Visual Polish/i)).toBeInTheDocument();

    // Verify conceded deltas
    expect(screen.getAllByText(/Conceded:/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays recorded qualified minority dissents', () => {
    render(<JuryDebateChamber evaluationId="eval_smart-road-vision" projectName="Smart Road Vision" />);

    expect(screen.getByText(/Recorded Qualified Minority Dissents & Honours Conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/Severity: QUALIFIED/i)).toBeInTheDocument();
    expect(screen.getByText(/daytime road surveys cannot be extrapolated to adverse weather/i)).toBeInTheDocument();
  });

  it('toggles the executive deliberation transcript accordion', () => {
    render(<JuryDebateChamber evaluationId="eval_smart-road-vision" projectName="Smart Road Vision" />);

    const transcriptButton = screen.getByRole('button', { name: /View Transcript/i });
    fireEvent.click(transcriptButton);

    expect(screen.getByText(/Executive Deliberation Transcript \(Complete Proceedings\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy Markdown/i })).toBeInTheDocument();

    // Toggle hide
    fireEvent.click(screen.getByRole('button', { name: /Hide Transcript/i }));
    expect(screen.queryByText(/Executive Deliberation Transcript \(Complete Proceedings\)/i)).not.toBeInTheDocument();
  });

  it('triggers on-demand debate simulation via API', async () => {
    const runSpy = vi.spyOn(api, 'runJuryDeliberation').mockResolvedValueOnce({
      id: 'delib_simulated',
      evaluationId: 'eval_smart-road-vision',
      projectName: 'Smart Road Vision',
      totalRounds: 3,
      initialMeanScore: 83.1,
      finalConsensusScore: 83.7,
      consensusScore: 83.7,
      ratifiedVerdict: 'STRONG',
      initialStdDev: 2.91,
      finalStdDev: 0.42,
      convergenceAchieved: true,
      dissentingOpinions: [],
      transcript: '# SIMULATED TRANSCRIPT',
      ratifiedAt: new Date().toISOString(),
      rounds: []
    } as any);

    render(<JuryDebateChamber evaluationId="eval_smart-road-vision" projectName="Smart Road Vision" />);

    const reRunBtn = screen.getByRole('button', { name: /Re-run Debate/i });
    fireEvent.click(reRunBtn);

    await waitFor(() => {
      expect(runSpy).toHaveBeenCalledWith('eval_smart-road-vision', { targetConsensusScore: 83.7 });
    });
  });
});

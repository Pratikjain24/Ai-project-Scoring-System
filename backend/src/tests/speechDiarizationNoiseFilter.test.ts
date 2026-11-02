import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  SpeakerDiarizationEngine,
  type DiarizationOptions,
} from '../multimodal/speakerDiarizationEngine';
import {
  PresentationForensicsEngine,
  NativePcmDspAcousticEngine,
} from '../presentation-forensics/acousticForensicsEngine';
import type { TranscriptSegment } from '../models/multimodal';
import type { Claim } from '../models/claim';

describe('Phase 14: Multi-Speaker Diarization & Audio Noise Suppression Test Suite', () => {
  const mockTranscript: TranscriptSegment[] = [
    {
      id: 'seg-1',
      videoId: 'vid-test-1',
      startTime: 0.0,
      endTime: 15.0,
      text: 'Good morning panel. Today we are presenting Project Smart Road Vision.',
      confidence: 0.98,
      speakerTag: 'SPEAKER_01',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seg-2',
      videoId: 'vid-test-1',
      startTime: 15.5,
      endTime: 40.0,
      text: 'Municipal road surveys are slow and prohibitively expensive for cities.',
      confidence: 0.96,
      speakerTag: 'SPEAKER_01',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seg-3',
      videoId: 'vid-test-1',
      startTime: 41.0,
      endTime: 75.0,
      text: 'To solve this, our hardware architecture features a Jetson Orin Nano with 22ms latency.',
      confidence: 0.97,
      speakerTag: 'SPEAKER_02',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seg-4',
      videoId: 'vid-test-1',
      startTime: 76.0,
      endTime: 105.0,
      text: 'Now switching to the live benchmark demo. Bounding boxes are displayed in real-time.',
      confidence: 0.95,
      speakerTag: 'SPEAKER_02',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'seg-5',
      videoId: 'vid-test-1',
      startTime: 106.0,
      endTime: 120.0,
      text: 'In conclusion, the edge system achieved 94.2 percent precision. Thank you.',
      confidence: 0.99,
      speakerTag: 'SPEAKER_01',
      createdAt: new Date().toISOString(),
    },
  ];

  test('1. SpeakerDiarizationEngine clusters segments into distinct presenters with speaking share %', () => {
    const result = SpeakerDiarizationEngine.diarize(mockTranscript);

    assert.strictEqual(result.estimatedSpeakers, 2, 'Should identify exactly 2 distinct presenters');
    assert.strictEqual(result.speakers.length, 2, 'Should build 2 speaker profiles');

    const totalShare = result.speakers.reduce((sum, s) => sum + s.speakingSharePercentage, 0);
    assert.ok(Math.abs(totalShare - 100.0) < 1.0, `Total speaking share percentage should sum to ~100% (got ${totalShare}%)`);

    const spk1 = result.speakers.find((s) => s.speakerId === 'SPEAKER_01');
    const spk2 = result.speakers.find((s) => s.speakerId === 'SPEAKER_02');

    assert.ok(spk1, 'SPEAKER_01 should be present');
    assert.ok(spk2, 'SPEAKER_02 should be present');
    assert.ok(spk1.totalSpeakingSeconds > 0, 'SPEAKER_01 speaking time should be positive');
    assert.ok(spk2.totalSpeakingSeconds > 0, 'SPEAKER_02 speaking time should be positive');
    assert.ok(spk1.wpm > 20, 'SPEAKER_01 WPM should be realistic cadence');
    assert.ok(spk2.wpm > 20, 'SPEAKER_02 WPM should be realistic cadence');
  });

  test('2. calculateTeamBalanceScore accurately detects balanced collaborative delivery vs speaker dominance', () => {
    // 50/50 split -> perfect balance
    const perfectBalance = SpeakerDiarizationEngine.calculateTeamBalanceScore([50, 50], 2);
    assert.strictEqual(perfectBalance.balanceScore, 100, '50/50 split should yield 100% balance score');
    assert.strictEqual(perfectBalance.isBalanced, true);

    // 54/46 split -> healthy collaborative balance
    const healthyBalance = SpeakerDiarizationEngine.calculateTeamBalanceScore([54, 46], 2);
    assert.ok(healthyBalance.balanceScore >= 85, '54/46 split should have high balance score');
    assert.strictEqual(healthyBalance.isBalanced, true);

    // 92/8 split -> heavily skewed / sidelining one student
    const skewedBalance = SpeakerDiarizationEngine.calculateTeamBalanceScore([92, 8], 2);
    assert.ok(skewedBalance.balanceScore < 40, `92/8 split should have low balance score (got ${skewedBalance.balanceScore})`);
    assert.strictEqual(skewedBalance.isBalanced, false);

    // 3 presenters balanced [34, 33, 33]
    const trioBalance = SpeakerDiarizationEngine.calculateTeamBalanceScore([34, 33, 33], 3);
    assert.ok(trioBalance.balanceScore >= 95, 'Equal 3-speaker distribution should have >=95 balance score');
    assert.strictEqual(trioBalance.isBalanced, true);
  });

  test('3. Speaker transition and turn-taking events are detected accurately', () => {
    const result = SpeakerDiarizationEngine.diarize(mockTranscript);

    assert.ok(result.turnsCount >= 2, `Should detect at least 2 speaker hand-offs (got ${result.turnsCount})`);
    assert.strictEqual(result.transitions.length, result.turnsCount);

    const firstTransition = result.transitions[0];
    assert.strictEqual(firstTransition.fromSpeaker, 'SPEAKER_01');
    assert.strictEqual(firstTransition.toSpeaker, 'SPEAKER_02');
    assert.ok(firstTransition.timestamp >= 40.0, 'Transition timestamp should match segment handoff');
  });

  test('4. Empirical claims are attributed to specific presenters', () => {
    const mockClaims: Claim[] = [
      {
        id: 'claim_latency_22ms',
        projectId: 'proj-1',
        claimText: 'Jetson Orin Nano hardware test bench operates with 22ms latency',
        claimType: 'SPEED_EFFICIENCY',
        category: 'PERFORMANCE',
        verificationStatus: 'CLAIMED',
        confidence: 0.95,
        location: { slideNumber: 5 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'claim_accuracy_94pct',
        projectId: 'proj-1',
        claimText: 'Edge system achieved 94.2 percent precision on validation split',
        claimType: 'ACCURACY_BENCHMARK',
        category: 'PERFORMANCE',
        verificationStatus: 'CLAIMED',
        confidence: 0.95,
        location: { slideNumber: 10 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = SpeakerDiarizationEngine.diarize(mockTranscript, { claimsList: mockClaims });

    assert.strictEqual(result.attributedClaims.length, 2, 'Should attribute both claims to presenters');

    const latencyClaim = result.attributedClaims.find((c) => c.claimId === 'claim_latency_22ms');
    const accuracyClaim = result.attributedClaims.find((c) => c.claimId === 'claim_accuracy_94pct');

    assert.ok(latencyClaim, 'Latency claim should be attributed');
    assert.strictEqual(latencyClaim.speakerId, 'SPEAKER_02', 'Latency claim was articulated by SPEAKER_02');

    assert.ok(accuracyClaim, 'Accuracy claim should be attributed');
    assert.strictEqual(accuracyClaim.speakerId, 'SPEAKER_01', 'Accuracy claim was articulated by SPEAKER_01');
  });

  test('5. estimateAmbientNoiseMetrics computes SNR and flags noisy hackathon conditions', () => {
    // Generate clean synthetic audio (loud voice, very quiet floor)
    const cleanSamples = new Float32Array(16000 * 2);
    for (let i = 0; i < cleanSamples.length; i++) {
      const t = i / 16000;
      // Speech bursts (60% active speech, 40% inter-word pauses) with quiet noise
      const isSpeechBurst = (i % 16000) < 9600;
      cleanSamples[i] = (isSpeechBurst ? Math.sin(2 * Math.PI * 150 * t) * 0.4 : 0) + (Math.random() - 0.5) * 0.001;
    }

    const cleanMetrics = SpeakerDiarizationEngine.estimateAmbientNoiseMetrics(cleanSamples, 16000);
    assert.ok(cleanMetrics.estimatedSnrDb > 18.0, `Clean speech SNR should be >18dB (got ${cleanMetrics.estimatedSnrDb}dB)`);
    assert.strictEqual(cleanMetrics.noiseSuppressionRecommended, false);

    // Generate noisy audio (hackathon background murmur with high noise floor)
    const noisySamples = new Float32Array(16000 * 2);
    for (let i = 0; i < noisySamples.length; i++) {
      const t = i / 16000;
      const isSpeechBurst = (i % 16000) < 9600;
      noisySamples[i] = (isSpeechBurst ? Math.sin(2 * Math.PI * 150 * t) * 0.15 : 0) + (Math.random() - 0.5) * 0.12;
    }

    const noisyMetrics = SpeakerDiarizationEngine.estimateAmbientNoiseMetrics(noisySamples, 16000);
    assert.ok(noisyMetrics.backgroundNoiseLevelDbFS > -34.0, 'Noisy background floor should be elevated');
    assert.strictEqual(noisyMetrics.noiseSuppressionRecommended, true, 'Noise suppression should be recommended for noisy hall');
  });

  test('6. PresentationForensicsEngine returns detailed speaker diarization and noise advisories', async () => {
    const syntheticWav = NativePcmDspAcousticEngine.generateSyntheticPresentationWav(6, 16000, 155, true);
    const report = await PresentationForensicsEngine.analyzeAudio(syntheticWav, 'eval_diarization_test');

    assert.ok(report.speakerDiarization, 'Report should include speaker diarization');
    assert.ok(report.speakerDiarization.estimatedSpeakers >= 1);
    assert.ok(report.speakerDiarization.speakingBalanceScore > 0);
    assert.ok(Array.isArray(report.speakerDiarization.speakers));
    assert.ok(report.speakerDiarization.speakers.length >= 1);

    const hasDiarizationFinding = report.diagnosticFindings.some(
      (f) => f.includes('Multi-Speaker Diarization') || f.includes('Solo Presentation')
    );
    assert.ok(hasDiarizationFinding, 'Report diagnostic findings should include speaker diarization details');
  });
});

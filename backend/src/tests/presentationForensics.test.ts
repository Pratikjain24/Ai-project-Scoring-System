import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PresentationForensicsEngine,
  LibrosaAcousticAdapter,
  NativePcmDspAcousticEngine,
} from '../presentation-forensics/acousticForensicsEngine';
import { PresentationAgent } from '../agents/presentationAgent';
import { AdminController } from '../controllers/adminController';
import type { Evidence } from '../models/evidence';

describe('Phase 17: Presentation Forensics & Acoustic Speech Analytics Test Suite', () => {
  it('1. PresentationForensicsEngine.getStatus returns telemetry and acoustic DSP thresholds', () => {
    const status = PresentationForensicsEngine.getStatus();

    assert.strictEqual(typeof status.librosaAvailable, 'boolean');
    assert.ok(['LIBROSA', 'NATIVE_PCM_DSP'].includes(status.activeEngine));
    assert.strictEqual(status.sampleRateHz, 16000);
    assert.deepStrictEqual(status.pitchRangeHz, [60, 400]);
    assert.strictEqual(status.silenceThresholdDbFS, -34.0);
    assert.strictEqual(status.hesitationThresholdSeconds, 1.5);
  });

  it('2. LibrosaAcousticAdapter detects Python Librosa availability', () => {
    const available = LibrosaAcousticAdapter.isAvailable();
    assert.strictEqual(typeof available, 'boolean');
    // On this system, Python with librosa 0.10.0 was verified
    assert.strictEqual(available, true);
  });

  it('3. NativePcmDspAcousticEngine extracts fundamental frequency F0 on calibrated audio', () => {
    // Generate a 4-second WAV buffer with known base pitch 175 Hz
    const targetPitch = 175;
    const wavBuffer = NativePcmDspAcousticEngine.generateSyntheticPresentationWav(
      4,
      16000,
      targetPitch,
      false // No pauses
    );

    const result = NativePcmDspAcousticEngine.analyzeWav(wavBuffer, 16000);

    assert.ok(result.pitch.meanPitchHz > 140 && result.pitch.meanPitchHz < 210, `Expected pitch around 175 Hz, got ${result.pitch.meanPitchHz}`);
    assert.strictEqual(typeof result.pitch.isMonotone, 'boolean');
    assert.ok(result.pitch.pitchStabilityScore >= 50);
  });

  it('4. NativePcmDspAcousticEngine accurately profiles vocal energy, RMS levels, and dynamic range', () => {
    const wavBuffer = NativePcmDspAcousticEngine.generateSyntheticPresentationWav(3, 16000, 150, false);
    const result = NativePcmDspAcousticEngine.analyzeWav(wavBuffer, 16000);

    assert.ok(result.energy.meanRmsDbFS < 0, 'RMS dBFS must be negative');
    assert.ok(result.energy.maxRmsDbFS >= result.energy.meanRmsDbFS);
    assert.ok(result.energy.energyDynamicRangeDb >= 0);
    assert.ok(result.energy.vocalProjectionScore >= 50 && result.energy.vocalProjectionScore <= 100);
  });

  it('5. Acoustic silence detection classifies rhetorical pauses vs hesitation pauses (>1.5s)', () => {
    // Generate 6-second WAV with an inserted 1.8s hesitation pause
    const wavWithPause = NativePcmDspAcousticEngine.generateSyntheticPresentationWav(
      6,
      16000,
      160,
      true // Inserts pause from 2.0s to 3.8s (1.8s duration)
    );

    const result = NativePcmDspAcousticEngine.analyzeWav(wavWithPause, 16000);

    assert.ok(result.pauses.totalPausesCount >= 1, 'Must detect at least 1 pause');
    assert.ok(result.pauses.hesitationPausesCount >= 1, 'Must detect the 1.8s hesitation pause');
    assert.ok(result.pauses.totalPauseDurationSeconds >= 1.5);
    assert.ok(result.pauses.voiceActivityRatio > 0 && result.pauses.voiceActivityRatio < 1.0);

    const hesitationItem = result.pauses.pauseTimeline.find(p => p.type === 'hesitation');
    assert.ok(hesitationItem, 'Pause timeline must record hesitation item');
    assert.ok(hesitationItem?.durationSeconds >= 1.5);
  });

  it('6. PresentationForensicsEngine.analyzeAudio computes composite delivery score and diagnostics', async () => {
    const wavBuffer = NativePcmDspAcousticEngine.generateSyntheticPresentationWav(5, 16000, 165, true);
    const report = await PresentationForensicsEngine.analyzeAudio(wavBuffer, 'eval_forensics_test');

    assert.ok(['LIBROSA', 'NATIVE_PCM_DSP'].includes(report.engineMode));
    assert.ok(report.analyzedDurationSeconds >= 4.5);
    assert.ok(report.overallDeliveryScore >= 40 && report.overallDeliveryScore <= 100);
    assert.ok(report.diagnosticFindings.length >= 2, 'Must yield diagnostic delivery insights');

    const timelineEvents = PresentationForensicsEngine.generateAcousticTimelineEvents(report, 'eval_forensics_test');
    assert.ok(timelineEvents.length >= 1, 'Must generate acoustic timeline events');
    const warningEvent = timelineEvents.find(e => e.type === 'warning');
    assert.ok(warningEvent, 'Must record hesitation warning event');
  });

  it('7. PresentationAgent.evaluate integrates acoustic forensics and calibrates delivery metrics', async () => {
    const mockEvidence: Evidence[] = [
      {
        id: 'ev_slide_opening',
        evaluationId: 'eval_pres_audit',
        type: 'PROJECT_DOCUMENT',
        source: 'Deck.pdf',
        sourceTitle: 'Slide 1',
        location: 'Page 1',
        content: 'Clear problem framing with economic figures.',
        confidence: 90,
      },
      {
        id: 'ev_demo_video',
        evaluationId: 'eval_pres_audit',
        type: 'PROJECT_VIDEO',
        source: 'Demo.mp4',
        sourceTitle: 'Live Edge Demo',
        location: '05:15',
        content: 'Real-time road detection bounding boxes.',
        confidence: 92,
      },
    ];

    const wavBuffer = NativePcmDspAcousticEngine.generateSyntheticPresentationWav(8, 16000, 160, true);
    const analysis = await PresentationAgent.evaluate(
      'eval_pres_audit',
      mockEvidence,
      undefined,
      wavBuffer
    );

    assert.strictEqual(analysis.id, 'pres_eval_pres_audit');
    assert.ok(analysis.presentationScore > 0 && analysis.presentationScore <= 100);
    assert.ok(analysis.clarity > 0 && analysis.clarity <= 100);
    assert.ok(analysis.confidenceScore > 0 && analysis.confidenceScore <= 100);
    assert.ok(analysis.acousticForensics !== undefined, 'Acoustic forensics must be attached');
    assert.ok(analysis.timelineEvents.some(e => e.title.includes('Acoustic') || e.title.includes('Vocal')));
    assert.ok(analysis.strengths.length > 0);
    assert.ok(analysis.weaknesses.length > 0);
  });

  it('8. AdminController exposes presentation forensics status and on-demand audio analysis API', async () => {
    // 1. Status endpoint
    let statusResponse: any = null;
    const mockRes1: any = {
      status: () => mockRes1,
      json: (data: any) => { statusResponse = data; },
    };
    AdminController.getPresentationForensicsStatus({} as any, mockRes1);

    assert.strictEqual(statusResponse.success, true);
    assert.strictEqual(typeof statusResponse.data.librosaAvailable, 'boolean');
    assert.strictEqual(statusResponse.data.sampleRateHz, 16000);

    // 2. Audio Analysis endpoint
    let analysisResponse: any = null;
    const mockRes2: any = {
      status: () => mockRes2,
      json: (data: any) => { analysisResponse = data; },
    };
    const mockReq2: any = {
      body: {
        evaluationId: 'eval_admin_audio_test',
      },
    };

    await AdminController.analyzePresentationAudio(mockReq2, mockRes2);

    assert.strictEqual(analysisResponse.success, true);
    assert.ok(analysisResponse.data.pitch.meanPitchHz > 0);
    assert.ok(analysisResponse.data.energy.meanRmsDbFS < 0);
    assert.ok(analysisResponse.data.overallDeliveryScore > 0);
    assert.ok(Array.isArray(analysisResponse.data.diagnosticFindings));
  });
});

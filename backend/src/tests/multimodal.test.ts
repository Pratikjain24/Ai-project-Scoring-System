import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { seedDatabase } from '../db/seed';
import { MultimodalRepository } from '../repositories/multimodalRepository';
import { VideoProcessor } from '../multimodal/videoProcessor';
import { AudioProcessor } from '../multimodal/audioProcessor';
import { MockTranscriptionProvider } from '../multimodal/transcriptionProvider';
import { VisualObservationService } from '../multimodal/visualObservationService';
import { ClaimDemoMatcher } from '../multimodal/claimDemoMatcher';
import { MultimodalPipeline } from '../multimodal/multimodalPipeline';
import { app } from '../server';

describe('Phase 4: Multimodal Video + Audio + Presentation Analysis Engine Test Suite', () => {
  const evalId = 'eval_smart-road-vision';
  const projId = 'smart-road-vision';

  before(async () => {
    await seedDatabase();
  });

  it('1. VideoProcessor extracts stream metadata and generates configurable frame samples', () => {
    const meta = VideoProcessor.extractMetadata('test_stream.mp4', 5, 600);
    assert.strictEqual(meta.durationSeconds, 600);
    assert.strictEqual(meta.fps, 30);
    assert.strictEqual(meta.resolution, '1920x1080');
    assert.strictEqual(meta.audioTrack.present, true);
    assert.strictEqual(meta.sampleIntervalSeconds, 5);

    const samples = VideoProcessor.generateFrameSamples(600, 10, [45, 215, 365]);
    assert.ok(samples.length > 60);
    assert.ok(samples.some((s) => s.timestamp === 45 && s.isEventTrigger));
    assert.ok(samples.some((s) => s.timestamp === 215 && s.isEventTrigger));
    assert.ok(samples.some((s) => s.isSceneChange));
  });

  it('2. VideoProcessor segments presentation into 10 semantic presentation stages', () => {
    const segments = VideoProcessor.segmentVideo('vid_test_1', 600);
    assert.strictEqual(segments.length, 10);
    assert.strictEqual(segments[0].segmentType, 'INTRODUCTION');
    assert.strictEqual(segments[1].segmentType, 'PROBLEM_EXPLANATION');
    assert.strictEqual(segments[2].segmentType, 'SOLUTION_EXPLANATION');
    assert.strictEqual(segments[3].segmentType, 'ARCHITECTURE_EXPLANATION');
    assert.strictEqual(segments[4].segmentType, 'TECHNICAL_EXPLANATION');
    assert.strictEqual(segments[5].segmentType, 'FEATURE_DEMONSTRATION');
    assert.strictEqual(segments[6].segmentType, 'LIVE_DEMO');
    assert.strictEqual(segments[7].segmentType, 'RESULTS');
    assert.strictEqual(segments[8].segmentType, 'CONCLUSION');
    assert.strictEqual(segments[9].segmentType, 'Q_AND_A');

    for (const seg of segments) {
      assert.ok(seg.startTime >= 0 && seg.endTime <= 600);
      assert.ok(seg.confidence > 0.9);
    }
  });

  it('3. SpeechTranscriptionProvider extracts timestamped speech segments preserving time ranges', async () => {
    const provider = new MockTranscriptionProvider();
    const transcripts = await provider.transcribe('vid_test_1');

    assert.ok(transcripts.length >= 10);
    assert.strictEqual(transcripts[0].startTime, 0);
    assert.ok(transcripts[0].text.includes('Smart Road Vision'));
    assert.ok(transcripts.some((t) => t.text.includes('YOLOv8')));
    assert.ok(transcripts.some((t) => t.text.includes('Jetson Orin Nano')));

    // Ensure timestamps are monotonic
    for (let i = 0; i < transcripts.length - 1; i++) {
      assert.ok(transcripts[i].startTime <= transcripts[i].endTime);
      assert.ok(transcripts[i].endTime <= transcripts[i + 1].startTime);
    }
  });

  it('4. AudioProcessor calculates observable speech pacing, pause intervals, and filler counts without bias', async () => {
    const provider = new MockTranscriptionProvider();
    const transcripts = await provider.transcribe('vid_test_1');
    const metrics = AudioProcessor.analyzeSpeechMetrics(transcripts, 600);

    assert.ok(metrics.speechRateWpm > 100 && metrics.speechRateWpm < 180, 'WPM should fall within standard range');
    assert.ok(metrics.pauseFrequency >= 5, 'Should detect multiple speech pause events');
    assert.ok(metrics.pauseDurationSeconds > 0);
    assert.ok(metrics.talkingTimeRatio > 0.6 && metrics.talkingTimeRatio < 0.9);
    assert.ok(metrics.silenceTimeRatio > 0.1);
    assert.ok(metrics.fillerBreakdown && typeof metrics.fillerBreakdown.um === 'number');
    assert.ok(metrics.fillerBreakdown.like! >= 1);
    assert.ok(metrics.fillerBreakdown.actually! >= 1);
  });

  it('5. VisualObservationService classifies screen and hardware demonstrations with cautious confidence', () => {
    const events = VisualObservationService.detectVisualEvents('vid_test_1');
    assert.ok(events.length >= 10);

    const slideEvent = events.find((e) => e.eventType === 'SLIDE_CHANGE');
    assert.ok(slideEvent);
    assert.strictEqual(slideEvent.confidence, 'HIGH');

    const hardwareEvent = events.find((e) => e.eventType === 'HARDWARE_SHOWN');
    assert.ok(hardwareEvent);
    assert.strictEqual(hardwareEvent.hardwareConfidence, 'CONFIRMED');

    const errorEvent = events.find((e) => e.eventType === 'ERROR_APPEARED');
    assert.ok(errorEvent);
    assert.ok(errorEvent.description.includes('buffer overrun'));
  });

  it('6. ClaimDemoMatcher extracts technical mentions and matches document claims to demo evidence', () => {
    const provider = new MockTranscriptionProvider();
    const demoObs = VisualObservationService.extractDemoObservations('vid_test_1', evalId);

    const mentions = ClaimDemoMatcher.extractTechnicalMentions('vid_test_1', [
      {
        id: 't1',
        videoId: 'vid_test_1',
        startTime: 155,
        endTime: 180,
        text: 'Our model uses YOLOv8-Nano fine-tuned on RDD2022 dataset with TensorRT FP16 quantization on NVIDIA Jetson Orin Nano.',
        confidence: 0.98,
        createdAt: new Date().toISOString(),
      },
    ]);

    assert.ok(mentions.some((m) => m.technology === 'YOLOv8'));
    assert.ok(mentions.some((m) => m.technology === 'TensorRT'));
    assert.ok(mentions.some((m) => m.technology === 'RDD2022 Dataset'));
    assert.ok(mentions.some((m) => m.technology === 'NVIDIA Jetson Orin Nano'));

    const matches = ClaimDemoMatcher.matchClaimsToDemo(evalId, 'vid_test_1', demoObs);
    assert.ok(matches.length > 0);

    const supported = matches.find((m) => m.demoSupport === 'SUPPORTED');
    assert.ok(supported, 'Should find at least one SUPPORTED claim');

    const partiallySupported = matches.find((m) => m.demoSupport === 'PARTIALLY_SUPPORTED');
    assert.ok(partiallySupported, 'Should find at least one PARTIALLY_SUPPORTED claim');
  });

  it('7. MultimodalPipeline executes full pipeline and persists bundle in SQLite repository', async () => {
    const testVidId = `vid_pipeline_test_${Date.now()}`;
    MultimodalRepository.createVideo({
      id: testVidId,
      evaluationId: evalId,
      projectId: projId,
      fileReference: 'test_demo_video.mp4',
      mediaSourceType: 'UPLOADED_VIDEO',
      format: 'MP4',
      durationSeconds: 600,
      fps: 30,
      resolution: '1920x1080',
      audioTrackPresent: true,
      status: 'UPLOADED',
    });

    const bundle = await MultimodalPipeline.processVideo(testVidId);
    assert.strictEqual(bundle.video.status, 'COMPLETED');
    assert.strictEqual(bundle.segments.length, 10);
    assert.ok(bundle.transcript.length >= 10);
    assert.ok(bundle.visualEvents.length >= 10);
    assert.ok(bundle.technicalMentions.length >= 5);
    assert.ok(bundle.demoObservations.length >= 5);
    assert.ok(bundle.claimDemoMatches.length >= 3);
    assert.ok(bundle.presentationMetrics !== null);
    assert.ok(bundle.timeline.length >= 15);
    assert.ok(bundle.demoMilestones && bundle.demoMilestones.length >= 3, 'Demo milestones should be detected');
    assert.ok(bundle.videoAnomalies && bundle.videoAnomalies.length >= 1, 'Video anomalies should be detected');

    // Timeline must be sorted by timestamp
    for (let i = 0; i < bundle.timeline.length - 1; i++) {
      assert.ok(bundle.timeline[i].timestamp <= bundle.timeline[i + 1].timestamp);
    }

    // Check retrieval via repository
    const fetched = MultimodalRepository.getMultimodalAnalysisBundle(testVidId);
    assert.ok(fetched);
    assert.strictEqual(fetched.video.id, testVidId);
    assert.ok(fetched.demoMilestones && fetched.demoMilestones.length >= 3);
    assert.ok(fetched.videoAnomalies && fetched.videoAnomalies.length >= 1);
  });

  it('8. MultimodalPipeline handles simulated step failures cleanly with status FAILED', async () => {
    const failVidId = `vid_fail_test_${Date.now()}`;
    MultimodalRepository.createVideo({
      id: failVidId,
      evaluationId: 'eval_fail_test',
      projectId: projId,
      fileReference: 'corrupt_video.mp4',
      mediaSourceType: 'UPLOADED_VIDEO',
      format: 'MP4',
      durationSeconds: 600,
      fps: 30,
      resolution: '1920x1080',
      audioTrackPresent: true,
      status: 'UPLOADED',
    });

    await assert.rejects(
      async () => {
        await MultimodalPipeline.processVideo(failVidId, { failAtStep: 'TRANSCRIPTION' });
      },
      /TRANSCRIPTION/
    );

    const vid = MultimodalRepository.findVideoById(failVidId);
    assert.strictEqual(vid?.status, 'FAILED');
  });

  it('9. MultimodalRepository retrieves pre-seeded Smart Road Vision video analysis', () => {
    const seeded = MultimodalRepository.findVideoById('vid_smart_road_vision_benchmark');
    assert.ok(seeded, 'Pre-seeded video must exist');
    assert.strictEqual(seeded.status, 'COMPLETED');

    const bundle = MultimodalRepository.getMultimodalAnalysisBundle('vid_smart_road_vision_benchmark');
    assert.ok(bundle, 'Evaluation bundle must exist');
    assert.strictEqual(bundle.video.id, 'vid_smart_road_vision_benchmark');
    assert.strictEqual(bundle.segments.length, 10);
    assert.ok(bundle.timeline.length > 0);
    assert.ok(bundle.claimDemoMatches.length > 0);

    const evalBundle = MultimodalRepository.getEvaluationVideoAnalysis(evalId);
    assert.ok(evalBundle, 'Evaluation bundle must exist');
  });

  it('10. VisualObservationService accurately detects demo milestones and video anomalies', () => {
    const targetVidId = 'vid_smart_road_vision_benchmark';
    const milestones = VisualObservationService.detectDemoMilestones(targetVidId, evalId);
    assert.ok(Array.isArray(milestones));
    assert.ok(milestones.length >= 3);
    const verifiedMilestones = milestones.filter((m) => m.status === 'VERIFIED');
    assert.ok(verifiedMilestones.length >= 2, 'Should have multiple verified milestones');

    const anomalies = VisualObservationService.detectVideoAnomalies(targetVidId, evalId);
    assert.ok(Array.isArray(anomalies));
    assert.ok(anomalies.length >= 1);
    assert.ok(anomalies.some((a) => a.severity === 'HIGH' || a.severity === 'MEDIUM'));
  });
});

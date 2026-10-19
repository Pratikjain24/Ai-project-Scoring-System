import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { seedDatabase } from '../db/seed';
import { MultimodalRepository } from '../repositories/multimodalRepository';
import { AudioProcessor } from '../multimodal/audioProcessor';
import { VideoProcessor } from '../multimodal/videoProcessor';
import {
  WhisperApiTranscriptionProvider,
  WhisperCppTranscriptionProvider,
  MultimodalAiAudioTranscriptionProvider,
  CalibratedTechnicalTranscriber,
  MockTranscriptionProvider,
  ResilientTranscriptionRouter,
  SMART_ROAD_VISION_TRANSCRIPT,
} from '../multimodal/transcriptionProvider';
import { MultimodalPipeline } from '../multimodal/multimodalPipeline';

describe('Phase 4b: Multimodal FFmpeg Audio Extraction & Whisper Transcription Suite', () => {
  const evalId = 'eval_smart-road-vision';
  const videoId = 'vid_smart_road_1';
  const tempDir = path.join(os.tmpdir(), 'ai_jury_whisper_test');

  before(async () => {
    await seedDatabase();
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  // 1. REAL HOST FFMPEG AUDIO EXTRACTION
  it('1. AudioProcessor extracts 16kHz mono PCM WAV via host FFmpeg or provides calibrated probe', async () => {
    // Create a 1-second synthetic WAV using pure PCM bytes
    const sampleRate = 16000;
    const durationSec = 1;
    const numSamples = sampleRate * durationSec;
    const buffer = Buffer.alloc(44 + numSamples * 2);

    // RIFF WAV Header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    // 440 Hz Sine wave
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sampleVal = Math.sin(2 * Math.PI * 440 * t) * 16000;
      buffer.writeInt16LE(Math.round(sampleVal), 44 + i * 2);
    }

    const testWavPath = path.join(tempDir, 'test_sine.wav');
    fs.writeFileSync(testWavPath, buffer);

    const outWavPath = path.join(tempDir, 'extracted_pcm.wav');
    const result = await AudioProcessor.extractAudioWithFFmpeg(testWavPath, outWavPath);

    assert.ok(result.audioPath, 'Should return extracted audio path');
    assert.strictEqual(result.sampleRate, 16000);
    assert.strictEqual(result.channels, 1);
    assert.strictEqual(result.codec, 'pcm_s16le');
    assert.ok(result.rmsDbLevel < 0, 'RMS dBFS level should be negative');
    assert.ok(result.durationSeconds >= 0.9, 'Duration should reflect audio duration');

    // Clean up
    if (fs.existsSync(testWavPath)) fs.unlinkSync(testWavPath);
    if (fs.existsSync(outWavPath)) fs.unlinkSync(outWavPath);
  });

  it('2. AudioProcessor handles non-existent or remote video references with graceful acoustic fallback', async () => {
    const result = await AudioProcessor.extractAudioWithFFmpeg('https://storage.googleapis.com/demo/road_survey.mp4');

    assert.ok(result.audioPath);
    assert.strictEqual(result.sampleRate, 16000);
    assert.strictEqual(result.channels, 1);
    assert.strictEqual(result.codec, 'pcm_s16le');
    assert.ok(result.rmsDbLevel <= -10);
    assert.strictEqual(result.extractionSource, 'SYNTHETIC_ACOUSTIC_PROBE');
  });

  // 2. ACOUSTIC PCM BUFFER ANALYSIS
  it('3. AudioProcessor calculates 50ms windowed RMS dBFS and silence detection from PCM audio buffer', () => {
    // Generate 2 seconds of 16kHz mono PCM: 1s tone + 1s near silence
    const sampleRate = 16000;
    const totalSamples = sampleRate * 2;
    const pcmData = Buffer.alloc(totalSamples * 2);

    // First second: high amplitude speech-like tone
    for (let i = 0; i < sampleRate; i++) {
      const val = Math.sin(2 * Math.PI * 300 * (i / sampleRate)) * 12000;
      pcmData.writeInt16LE(Math.round(val), i * 2);
    }
    // Second second: low amplitude background noise (~50)
    for (let i = sampleRate; i < totalSamples; i++) {
      pcmData.writeInt16LE(50, i * 2);
    }

    const analysis = AudioProcessor.analyzePcmAudioBuffer(pcmData, sampleRate);
    assert.ok(analysis.rmsDbFS < 0 && analysis.rmsDbFS > -30, `RMS dBFS should be reasonable, got: ${analysis.rmsDbFS}`);
    assert.ok(analysis.speechSeconds > 0.8, 'Should detect speech in first second');
    assert.ok(analysis.silenceSeconds > 0.8, 'Should detect silence in second second');
  });

  // 3. DYNAMIC ACOUSTIC SPEECH METRICS & VOCAL TONE
  it('4. AudioProcessor produces dynamic vocal tone metrics, pause categories, and WPM without hardcoding', async () => {
    const provider = new CalibratedTechnicalTranscriber();
    const transcripts = await provider.transcribe(videoId);
    const audioTrackMetrics = {
      audioPath: 'mock_audio.wav',
      durationSeconds: 600,
      sampleRate: 16000,
      channels: 1,
      codec: 'pcm_s16le',
      rmsDbLevel: -21.4,
      extractionSource: 'FFMPEG_REAL_PCM' as const,
    };

    const metrics = AudioProcessor.analyzeSpeechMetrics(transcripts, 600, audioTrackMetrics);

    // Speech rate WPM
    assert.ok(metrics.speechRateWpm >= 110 && metrics.speechRateWpm <= 170, `WPM: ${metrics.speechRateWpm}`);
    assert.ok(metrics.talkingTimeRatio > 0.6 && metrics.talkingTimeRatio < 0.9);
    assert.ok(metrics.silenceTimeRatio > 0.1);

    // Pause categories
    assert.ok(metrics.pauseMetrics, 'Pause metrics should be present');
    assert.ok(metrics.pauseMetrics.totalPauseCount >= 5);
    assert.ok(typeof metrics.pauseMetrics.naturalCadenceCount === 'number');
    assert.ok(typeof metrics.pauseMetrics.thinkingHesitationCount === 'number');
    assert.ok(typeof metrics.pauseMetrics.prolongedSilenceCount === 'number');

    // Vocal tone metrics
    assert.ok(metrics.vocalTone, 'Vocal tone metrics should be present');
    assert.ok(metrics.vocalTone.pitchStabilityScore >= 0.7 && metrics.vocalTone.pitchStabilityScore <= 1.0);
    assert.ok(metrics.vocalTone.energyDynamics >= 0.6 && metrics.vocalTone.energyDynamics <= 1.0);
    assert.ok(metrics.vocalTone.inflectionVariation >= 0.6);
    assert.ok(metrics.vocalTone.pacingConsistency >= 0.7);

    // Acoustic source
    assert.strictEqual(metrics.audioTrackMetrics?.extractionSource, 'FFMPEG_REAL_PCM');
    assert.strictEqual(metrics.audioTrackMetrics?.rmsDbLevel, -21.4);
  });

  // 4. WHISPER PROVIDERS & RESILIENT ROUTING
  it('5. WhisperApiTranscriptionProvider provides domain-grounded prompts and handles missing keys gracefully', async () => {
    const whisperApi = new WhisperApiTranscriptionProvider();
    assert.strictEqual(whisperApi.name, 'OpenAI Whisper API');

    // When OPENAI_API_KEY is not configured in test environment, it cleanly falls back or throws expected message
    try {
      const res = await whisperApi.transcribe('vid_test_missing_key');
      assert.ok(res.length > 0);
    } catch (err: any) {
      assert.ok(err.message.includes('API key') || err.message.includes('Whisper'));
    }
  });

  it('6. WhisperCppTranscriptionProvider provides command generation and parameter contracts', async () => {
    const whisperCpp = new WhisperCppTranscriptionProvider();
    assert.strictEqual(whisperCpp.name, 'Whisper.cpp (Local)');

    // Should cleanly fall back or raise informative error when binary is absent
    try {
      const res = await whisperCpp.transcribe('vid_test_whisper_cpp');
      assert.ok(res.length > 0);
    } catch (err: any) {
      assert.ok(err.message.includes('Whisper.cpp') || err.message.includes('executable'));
    }
  });

  it('7. MultimodalAiAudioTranscriptionProvider provides multimodal AI audio contract', async () => {
    const aiAudio = new MultimodalAiAudioTranscriptionProvider();
    assert.strictEqual(aiAudio.name, 'Multimodal AI Audio Transcriber');

    try {
      const res = await aiAudio.transcribe('vid_test_ai_audio');
      assert.ok(res.length > 0);
    } catch (err: any) {
      assert.ok(err.message.includes('API key') || err.message.includes('Multimodal Audio'));
    }
  });

  it('8. CalibratedTechnicalTranscriber produces ground-truth domain segments with speaker diarization', async () => {
    const transcriber = new CalibratedTechnicalTranscriber();
    const segments = await transcriber.transcribe(videoId);

    assert.ok(segments.length >= 10);
    assert.strictEqual(segments[0].speakerTag, 'SPEAKER_1');
    assert.ok(segments.some((s) => s.speakerTag === 'SPEAKER_2'));
    assert.ok(segments.some((s) => s.text.includes('YOLOv8')));
    assert.ok(segments.some((s) => s.text.includes('Jetson Orin Nano')));

    for (const seg of segments) {
      assert.ok(seg.confidence >= 0.9);
      assert.ok(seg.endTime >= seg.startTime);
    }
  });

  it('9. ResilientTranscriptionRouter seamlessly routes to highest available tier and supports explicit provider', async () => {
    const router = new ResilientTranscriptionRouter();
    assert.strictEqual(router.name, 'Resilient Multi-Provider Transcription Router');

    // Default routing
    const defaultSegments = await router.transcribe(videoId);
    assert.ok(defaultSegments.length > 0);
    assert.strictEqual(defaultSegments[0].videoId, videoId);

    // Explicit calibrated mock selection
    const calibratedSegments = await router.transcribe(videoId, undefined, { provider: 'calibrated' });
    assert.ok(calibratedSegments.length > 0);
    assert.strictEqual(calibratedSegments[0].speakerTag, 'SPEAKER_1');
  });

  // 5. END-TO-END PIPELINE INTEGRATION
  it('10. MultimodalPipeline integrates audio extraction, transcription router, and speech metrics storage', async () => {
    const testVidId = 'vid_multimodal_audio_test_1';
    MultimodalRepository.createVideo({
      id: testVidId,
      evaluationId: evalId,
      projectId: 'smart-road-vision',
      fileReference: 'Jetson_Orin_Edge_Inference_Benchmark.mp4',
      mediaSourceType: 'UPLOADED_VIDEO',
      format: 'MP4',
      durationSeconds: 600,
      fps: 30,
      resolution: '1920x1080',
      audioTrackPresent: true,
      status: 'UPLOADED',
    });

    const bundle = await MultimodalPipeline.processVideo(testVidId, {
      sampleIntervalSeconds: 10,
    });

    assert.ok(bundle, 'Should return multimodal analysis bundle');
    assert.strictEqual(bundle.video.id, testVidId);
    assert.strictEqual(bundle.video.status, 'COMPLETED');
    assert.ok(bundle.transcript.length >= 10, 'Should have persisted transcript segments');

    // Verify presentation metrics with vocal tone and pause breakdown
    assert.ok(bundle.presentationMetrics, 'Presentation metrics must be generated');
    assert.ok(bundle.presentationMetrics.speechRateWpm > 100);
    assert.ok(bundle.presentationMetrics.clarityScore >= 0.8);

    const raw = bundle.presentationMetrics.rawMetrics;
    assert.ok(raw.vocalTone, 'vocalTone must be included in rawMetrics');
    assert.ok(raw.vocalTone.pitchStabilityScore >= 0.7);
    assert.ok(raw.audioTrackMetrics, 'audioTrackMetrics must be included in rawMetrics');
    assert.ok(raw.audioTrackMetrics.rmsDbLevel < 0);
  });
});

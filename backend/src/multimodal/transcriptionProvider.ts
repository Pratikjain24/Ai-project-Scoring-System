import type { TranscriptSegment } from '../models/multimodal';

export interface SpeechTranscriptionProvider {
  transcribe(videoId: string, options?: { language?: string; sampleRate?: number }): Promise<TranscriptSegment[]>;
}

export const SMART_ROAD_VISION_TRANSCRIPT: Array<{
  startTime: number;
  endTime: number;
  text: string;
  speakerTag: string;
  confidence: number;
}> = [
  {
    startTime: 0,
    endTime: 15,
    text: "Good morning esteemed judges and panel. Today we are presenting Project Smart Road Vision: an autonomous edge-AI road hazard and pavement defect telemetry platform.",
    speakerTag: "SPEAKER_1",
    confidence: 0.98,
  },
  {
    startTime: 16,
    endTime: 38,
    text: "Road infrastructure deterioration causes millions in vehicular damages and severe highway accidents annually. Traditional municipal surveys rely on manual inspection trucks which are slow, infrequent, and prohibitively expensive.",
    speakerTag: "SPEAKER_1",
    confidence: 0.97,
  },
  {
    startTime: 39,
    endTime: 68,
    text: "Our core problem statement addresses this gap: municipal authorities require continuous, cost-effective, real-time road condition telemetry with sub-meter GPS defect localization, operating on affordable edge computing units.",
    speakerTag: "SPEAKER_1",
    confidence: 0.96,
  },
  {
    startTime: 69,
    endTime: 105,
    text: "Like, to solve this, we engineered Smart Road Vision. Our system deploys a high-throughput camera pipeline mounted to fleet municipal vehicles, feeding our optimized neural defect classifier running on NVIDIA Jetson Orin Nano hardware.",
    speakerTag: "SPEAKER_2",
    confidence: 0.95,
  },
  {
    startTime: 106,
    endTime: 152,
    text: "Let us examine the system architecture. Um, the architecture consists of three synchronized tiers: the Vehicle Edge Node capturing 1080p 60fps frames, an onboard TensorRT inference engine executing INT8 quantized models, and an offline SQLite telemetry queue that syncs with cloud endpoints over MQTT when LTE connectivity is available.",
    speakerTag: "SPEAKER_2",
    confidence: 0.97,
  },
  {
    startTime: 153,
    endTime: 210,
    text: "From a deep learning perspective, our model uses YOLOv8-Nano fine-tuned on the RDD2022 dataset containing over 40,000 annotated road distress images. We optimized the backbone with TensorRT FP16 quantization to achieve high inference speeds.",
    speakerTag: "SPEAKER_1",
    confidence: 0.98,
  },
  {
    startTime: 211,
    endTime: 255,
    text: "Actually, our project documents claimed our model achieves 95 percent accuracy across pothole, transverse crack, and alligator crack detection. In our validation split, we observed 94.2 percent precision and a mean average precision mAP50 of 91.8 percent.",
    speakerTag: "SPEAKER_1",
    confidence: 0.96,
  },
  {
    startTime: 256,
    endTime: 298,
    text: "You know, another major claim in our engineering submission is that the system operates in real-time under 25 milliseconds per frame on the Jetson Orin Nano. We will demonstrate this live right now on our hardware test bench.",
    speakerTag: "SPEAKER_2",
    confidence: 0.94,
  },
  {
    startTime: 299,
    endTime: 360,
    text: "Now switching to our live demonstration. As you can see on the screen, here is our dashboard connected via USB-C to the Jetson Orin Nano development kit. The camera feed is currently pointed at high-resolution road simulation footage.",
    speakerTag: "SPEAKER_2",
    confidence: 0.98,
  },
  {
    startTime: 361,
    endTime: 420,
    text: "Here the model detects the pothole instantly. Bounding boxes are drawn in real-time with an average latency readout of 22.4 milliseconds. Telemetry coordinates are packaged into JSON payloads and stored locally.",
    speakerTag: "SPEAKER_2",
    confidence: 0.97,
  },
  {
    startTime: 421,
    endTime: 465,
    text: "Notice during the high-speed panning test, at timestamp 07:15, a momentary buffer overflow occurred when frame dropping wasn't enabled, but the watch-dog service quickly recovered without pipeline termination.",
    speakerTag: "SPEAKER_1",
    confidence: 0.92,
  },
  {
    startTime: 466,
    endTime: 510,
    text: "In terms of benchmark results, our system successfully maintained 42.8 frames per second at an average power consumption of 11.2 Watts, confirming our claims regarding edge energy efficiency and battery survivability.",
    speakerTag: "SPEAKER_1",
    confidence: 0.97,
  },
  {
    startTime: 511,
    endTime: 550,
    text: "Regarding limitations, heavy precipitation and night-time unlit roads reduce our model detection confidence to around 68 percent. As future scope, we plan to integrate active infrared illuminators and stereo-depth estimation for volumetric pothole quantification.",
    speakerTag: "SPEAKER_2",
    confidence: 0.95,
  },
  {
    startTime: 551,
    endTime: 600,
    text: "In conclusion, Smart Road Vision provides an autonomous, verifiable, edge-native road telemetry system ready for city pilot testing. Thank you, and we welcome any questions from the panel.",
    speakerTag: "SPEAKER_1",
    confidence: 0.99,
  },
];

export class MockTranscriptionProvider implements SpeechTranscriptionProvider {
  async transcribe(videoId: string): Promise<TranscriptSegment[]> {
    return SMART_ROAD_VISION_TRANSCRIPT.map((t, idx) => ({
      id: `trans_${videoId}_${idx + 1}`,
      videoId,
      startTime: t.startTime,
      endTime: t.endTime,
      text: t.text,
      confidence: t.confidence,
      speakerTag: t.speakerTag,
      createdAt: new Date().toISOString(),
    }));
  }
}

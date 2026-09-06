import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Radio, 
  PlayCircle, 
  Sparkles, 
  HardDrive, 
  Code2, 
  AlertCircle,
  Scale,
  Tv,
  CheckCircle2
} from 'lucide-react';
import type { 
  AnalysisMode, 
  SpeechMetric, 
  PresentationEvent, 
  DemoFeatureItem 
} from '../../types/presentationDemo';
import { 
  MOCK_HARDWARE_PRES_DEMO, 
  MOCK_SOFTWARE_PRES_DEMO 
} from '../../data/mockPresentationDemo';
import { PresentationAnalysisSection } from './PresentationAnalysisSection';
import { DemoAnalysisSection } from './DemoAnalysisSection';
import { EvaluationSynthesisCard } from './EvaluationSynthesisCard';
import { EvidenceTraceModal } from './EvidenceTraceModal';
import { MultimodalVideoAnalyzer } from './MultimodalVideoAnalyzer';
import { ClaimDemoMatchSection } from './ClaimDemoMatchSection';
import { api } from '../../services/api';
import type { MultimodalAnalysisBundle } from '../../types/multimodal';

interface PresentationDemoModuleProps {
  onBackToOverview?: () => void;
  onViewAIJury?: () => void;
  defaultProjectType?: 'software' | 'hardware';
  evaluationId?: string;
}

export const PresentationDemoModule: React.FC<PresentationDemoModuleProps> = ({
  onBackToOverview,
  onViewAIJury,
  defaultProjectType = 'hardware',
  evaluationId = 'eval_smart-road-vision',
}) => {
  const [selectedTrack, setSelectedTrack] = useState<'software' | 'hardware'>(defaultProjectType);
  const [activeMode, setActiveMode] = useState<AnalysisMode>('demo-playback');
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'claims' | 'presentation' | 'demo' | 'synthesis'>('all');
  const [inspectedMetric, setInspectedMetric] = useState<SpeechMetric | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<MultimodalAnalysisBundle | null>(null);
  const [activeSeekTimestamp, setActiveSeekTimestamp] = useState<number>(0);

  const report = selectedTrack === 'hardware' ? MOCK_HARDWARE_PRES_DEMO : MOCK_SOFTWARE_PRES_DEMO;

  // Fetch real/seeded video analysis from backend on mount
  useEffect(() => {
    let isMounted = true;
    api.getVideoAnalysis(evaluationId).then((res) => {
      if (isMounted && res) {
        setVideoAnalysis(res);
      }
    }).catch(() => {
      // Graceful fallback to default mock state
    });
    return () => {
      isMounted = false;
    };
  }, [evaluationId]);

  const handleExportReport = () => {
    setExportNotice(`Exporting Presentation & Demo Analysis Dossier (${report.projectName})...`);
    setTimeout(() => {
      setExportNotice(`✓ Presentation & Demo Dossier downloaded: ${report.projectName}_Presentation_Audit.pdf`);
      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  const handleEventClick = (event: PresentationEvent) => {
    setInspectedMetric({
      id: event.id,
      key: event.type,
      name: `Timeline Event: ${event.title}`,
      score: event.confidenceAtEvent,
      rating: event.confidenceAtEvent > 85 ? 'Exceptional' : 'Strong',
      measuredValue: `@${event.timestamp}`,
      optimalBenchmark: 'N/A',
      headline: event.description,
      detailedAnalysis: `Observed speaker quote: "${event.speakerQuote}" (Slide ${event.slideNumber || 'N/A'}). Evaluated with Whisper-v3 transcript alignment.`,
      evidenceSnippets: [
        {
          id: `ev-${event.id}`,
          type: 'transcript-excerpt',
          timestamp: event.timestamp,
          label: event.title,
          sourceLocation: 'session_recording.mp4',
          snippet: event.speakerQuote,
          metricCorrelation: `Confidence level at event timestamp: ${event.confidenceAtEvent}%`
        }
      ]
    });
  };

  const handleFeatureClick = (feat: DemoFeatureItem) => {
    setInspectedMetric({
      id: feat.id,
      key: feat.category,
      name: `Demo Feature: ${feat.name}`,
      score: feat.status === 'verified' ? 95 : feat.status === 'partial' ? 75 : 30,
      rating: feat.status === 'verified' ? 'Exceptional' : 'Needs Work',
      measuredValue: feat.latencyOrPerformance || feat.status,
      optimalBenchmark: 'Verified live execution',
      headline: feat.observedResult,
      detailedAnalysis: `Claim: "${feat.claimText}". Execution monitored between ${feat.timestampStart} and ${feat.timestampEnd}.`,
      evidenceSnippets: [
        {
          id: feat.evidenceRefId,
          type: 'telemetry-log',
          timestamp: feat.timestampStart,
          label: feat.name,
          sourceLocation: 'telemetry/live_run.log',
          snippet: feat.observedResult,
          metricCorrelation: `Performance: ${feat.latencyOrPerformance || 'Standard'}`
        }
      ]
    });
  };

  const handleSeekToTimestamp = (seconds: number) => {
    setActiveSeekTimestamp(seconds);
    setActiveTab('video');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Default deterministic fallback bundle if network request is still pending
  const fallbackVideoBundle: MultimodalAnalysisBundle = {
    video: {
      id: 'vid_smart_road_vision_benchmark',
      evaluationId: 'eval_smart-road-vision',
      projectId: 'smart-road-vision',
      fileReference: 'Jetson_Orin_Edge_Inference_Benchmark.mp4',
      mediaSourceType: 'UPLOADED_VIDEO',
      format: 'MP4',
      durationSeconds: 600,
      fps: 30,
      resolution: '1920x1080',
      audioTrackPresent: true,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    segments: [
      { id: 's1', videoId: 'v1', startTime: 0, endTime: 45, segmentType: 'INTRODUCTION', confidence: 0.98, createdAt: '' },
      { id: 's2', videoId: 'v1', startTime: 45, endTime: 120, segmentType: 'PROBLEM_EXPLANATION', confidence: 0.96, createdAt: '' },
      { id: 's3', videoId: 'v1', startTime: 120, endTime: 195, segmentType: 'SOLUTION_EXPLANATION', confidence: 0.95, createdAt: '' },
      { id: 's4', videoId: 'v1', startTime: 195, endTime: 270, segmentType: 'ARCHITECTURE_EXPLANATION', confidence: 0.97, createdAt: '' },
      { id: 's5', videoId: 'v1', startTime: 270, endTime: 360, segmentType: 'TECHNICAL_EXPLANATION', confidence: 0.96, createdAt: '' },
      { id: 's6', videoId: 'v1', startTime: 360, endTime: 430, segmentType: 'FEATURE_DEMONSTRATION', confidence: 0.99, createdAt: '' },
      { id: 's7', videoId: 'v1', startTime: 430, endTime: 490, segmentType: 'LIVE_DEMO', confidence: 0.98, createdAt: '' },
      { id: 's8', videoId: 'v1', startTime: 490, endTime: 550, segmentType: 'RESULTS', confidence: 0.95, createdAt: '' },
      { id: 's9', videoId: 'v1', startTime: 550, endTime: 585, segmentType: 'CONCLUSION', confidence: 0.97, createdAt: '' },
      { id: 's10', videoId: 'v1', startTime: 585, endTime: 600, segmentType: 'Q_AND_A', confidence: 0.92, createdAt: '' },
    ],
    transcript: [
      { id: 't1', videoId: 'v1', startTime: 0, endTime: 15, text: "Good morning esteemed judges and panel. Today we present Smart Road Vision: an autonomous edge-AI road hazard telemetry platform.", confidence: 0.98, speakerTag: 'SPEAKER_1', createdAt: '' },
      { id: 't2', videoId: 'v1', startTime: 16, endTime: 38, text: "Road infrastructure deterioration causes millions in vehicular damages and severe highway accidents annually.", confidence: 0.97, speakerTag: 'SPEAKER_1', createdAt: '' },
      { id: 't3', videoId: 'v1', startTime: 39, endTime: 68, text: "Our problem statement addresses this gap: municipal authorities require continuous, cost-effective, real-time road condition telemetry with sub-meter GPS defect localization.", confidence: 0.96, speakerTag: 'SPEAKER_1', createdAt: '' },
      { id: 't4', videoId: 'v1', startTime: 69, endTime: 105, text: "Like, to solve this, we engineered Smart Road Vision. Our system deploys a camera pipeline mounted to fleet vehicles feeding our neural defect classifier running on NVIDIA Jetson Orin Nano.", confidence: 0.95, speakerTag: 'SPEAKER_2', createdAt: '' },
      { id: 't5', videoId: 'v1', startTime: 106, endTime: 152, text: "Let us examine the architecture. Um, the architecture consists of the Vehicle Edge Node capturing 1080p 60fps frames, an onboard TensorRT inference engine executing INT8 quantized models, and an offline SQLite telemetry queue.", confidence: 0.97, speakerTag: 'SPEAKER_2', createdAt: '' },
      { id: 't6', videoId: 'v1', startTime: 153, endTime: 210, text: "From a deep learning perspective, our model uses YOLOv8-Nano fine-tuned on RDD2022 dataset containing over 40,000 annotated distress images. We optimized the backbone with TensorRT FP16 quantization.", confidence: 0.98, speakerTag: 'SPEAKER_1', createdAt: '' },
      { id: 't7', videoId: 'v1', startTime: 211, endTime: 255, text: "Actually, our project documents claimed our model achieves 95 percent accuracy across pothole and crack detection. In our validation split, we observed 94.2 percent precision and mAP50 of 91.8 percent.", confidence: 0.96, speakerTag: 'SPEAKER_1', createdAt: '' },
      { id: 't8', videoId: 'v1', startTime: 256, endTime: 298, text: "You know, another major claim in our submission is that the system operates in real-time under 25 milliseconds per frame on Jetson Orin Nano. We demonstrate this live right now on our test bench.", confidence: 0.94, speakerTag: 'SPEAKER_2', createdAt: '' },
      { id: 't9', videoId: 'v1', startTime: 299, endTime: 360, text: "Now switching to our live demonstration. Here is our dashboard connected via USB-C to the Jetson Orin Nano development kit. The camera feed is currently pointed at road simulation footage.", confidence: 0.98, speakerTag: 'SPEAKER_2', createdAt: '' },
      { id: 't10', videoId: 'v1', startTime: 361, endTime: 420, text: "Here the model detects the pothole instantly. Bounding boxes are drawn in real-time with an average latency readout of 22.4 milliseconds. Telemetry coordinates are packaged into JSON payloads.", confidence: 0.97, speakerTag: 'SPEAKER_2', createdAt: '' },
      { id: 't11', videoId: 'v1', startTime: 421, endTime: 465, text: "Notice at timestamp 07:15, a momentary buffer overflow occurred when frame dropping was disabled, but the watchdog service quickly recovered without pipeline termination.", confidence: 0.92, speakerTag: 'SPEAKER_1', createdAt: '' },
      { id: 't12', videoId: 'v1', startTime: 466, endTime: 510, text: "In terms of benchmark results, our system successfully maintained 42.8 frames per second at an average power consumption of 11.2 Watts, confirming our claims regarding edge energy efficiency.", confidence: 0.97, speakerTag: 'SPEAKER_1', createdAt: '' },
      { id: 't13', videoId: 'v1', startTime: 551, endTime: 600, text: "In conclusion, Smart Road Vision provides an autonomous, verifiable, edge-native road telemetry system ready for city pilot testing. Thank you, and we welcome questions.", confidence: 0.99, speakerTag: 'SPEAKER_1', createdAt: '' },
    ],
    visualEvents: [
      { id: 'v1', videoId: 'v1', timestamp: 4, eventType: 'SLIDE_CHANGE', description: 'Title slide visible: "Smart Road Vision - Autonomous Edge AI Road Inspection Platform".', confidence: 'HIGH', createdAt: '' },
      { id: 'v2', videoId: 'v1', timestamp: 48, eventType: 'CHART_SHOWN', description: 'Slide displays municipal road maintenance expenditure comparison.', confidence: 'HIGH', createdAt: '' },
      { id: 'v3', videoId: 'v1', timestamp: 112, eventType: 'ARCHITECTURE_DIAGRAM_SHOWN', description: 'System architecture topology diagram displayed showing Camera, Jetson Orin Nano, and Cloud.', confidence: 'HIGH', createdAt: '' },
      { id: 'v4', videoId: 'v1', timestamp: 165, eventType: 'CODE_SHOWN', description: 'VS Code displayed with `yolov8_trt_inference.py` demonstrating TensorRT engine invocation.', confidence: 'HIGH', createdAt: '' },
      { id: 'v5', videoId: 'v1', timestamp: 215, eventType: 'RESULT_SHOWN', description: 'Confusion matrix displayed showing 94.2% precision on RDD2022 validation split.', confidence: 'HIGH', createdAt: '' },
      { id: 'v6', videoId: 'v1', timestamp: 295, eventType: 'HARDWARE_SHOWN', description: 'Physical test bench setup visible with NVIDIA Jetson Orin Nano Developer Kit and camera ribbon.', confidence: 'HIGH', hardwareConfidence: 'CONFIRMED', createdAt: '' },
      { id: 'v7', videoId: 'v1', timestamp: 305, eventType: 'SENSOR_INTERACTION', description: 'Presenter connects USB-C interface and powers on Jetson Orin Nano kit. LEDs illuminate green.', confidence: 'HIGH', hardwareConfidence: 'CONFIRMED', createdAt: '' },
      { id: 'v8', videoId: 'v1', timestamp: 320, eventType: 'APPLICATION_OPENED', description: 'Presenter launches Web Telemetry Dashboard in Google Chrome.', confidence: 'HIGH', createdAt: '' },
      { id: 'v9', videoId: 'v1', timestamp: 365, eventType: 'DASHBOARD_SHOWN', description: 'Telemetry dashboard active: live video feed displays bounding boxes around detected hazards with 22.4ms latency counter.', confidence: 'HIGH', createdAt: '' },
      { id: 'v10', videoId: 'v1', timestamp: 425, eventType: 'ERROR_APPEARED', description: 'Warning banner in console: "Warning: Video frame buffer overrun (dropped 2 frames)". Dashboard recovers.', confidence: 'HIGH', createdAt: '' },
      { id: 'v11', videoId: 'v1', timestamp: 480, eventType: 'DEVICE_RESPONSE', description: 'On-device power monitor meter displays 11.2 Watts active draw during 42 FPS continuous inference.', confidence: 'HIGH', hardwareConfidence: 'CONFIRMED', createdAt: '' },
      { id: 'v12', videoId: 'v1', timestamp: 580, eventType: 'SLIDE_CHANGE', description: 'Concluding slide displayed with GitHub repo URL, license, and team contact details.', confidence: 'HIGH', createdAt: '' },
    ],
    technicalMentions: [
      { id: 'm1', videoId: 'v1', technology: 'YOLOv8', timestamp: 153, sourceText: 'Our model uses YOLOv8-Nano fine-tuned on RDD2022 dataset.', confidence: 0.98, createdAt: '' },
      { id: 'm2', videoId: 'v1', technology: 'NVIDIA Jetson Orin Nano', timestamp: 69, sourceText: 'Running on NVIDIA Jetson Orin Nano hardware.', confidence: 0.96, createdAt: '' },
      { id: 'm3', videoId: 'v1', technology: 'TensorRT', timestamp: 106, sourceText: 'Onboard TensorRT inference engine executing INT8 quantized models.', confidence: 0.97, createdAt: '' },
      { id: 'm4', videoId: 'v1', technology: 'SQLite Telemetry Queue', timestamp: 106, sourceText: 'Offline SQLite telemetry queue syncing with cloud endpoints.', confidence: 0.95, createdAt: '' },
    ],
    demoObservations: [
      { id: 'd1', videoId: 'v1', feature: 'Edge Hardware Power-on & Initialization', timestamp: 305, observedBehavior: 'Jetson Orin Nano powered, boot verified, camera module initialized.', result: 'SUCCESS', confidence: 0.98, createdAt: '' },
      { id: 'd2', videoId: 'v1', feature: 'Real-Time Pothole & Crack Bounding Box Detection', timestamp: 365, observedBehavior: 'Simulated road footage processed; green bounding boxes appeared with 22.4ms measured latency.', result: 'SUCCESS', confidence: 0.96, createdAt: '' },
      { id: 'd3', videoId: 'v1', feature: 'GPS Telemetry Packet Synchronization', timestamp: 395, observedBehavior: 'Hazard coordinates logged to local SQLite table and verified in map view.', result: 'SUCCESS', confidence: 0.94, createdAt: '' },
      { id: 'd4', videoId: 'v1', feature: 'High-Throughput Frame Buffer Handling', timestamp: 425, observedBehavior: 'Rapid video stream panning caused a minor frame drop warning; system degraded gracefully.', result: 'PARTIAL', confidence: 0.88, createdAt: '' },
      { id: 'd5', videoId: 'v1', feature: 'Automated Road Authority PDF Work Order Export', timestamp: 510, observedBehavior: 'Mentioned as a feature in project docs, but feature was not opened or demonstrated live.', result: 'UNCERTAIN', confidence: 0.65, createdAt: '' },
    ],
    claimDemoMatches: [
      { id: 'cdm1', evaluationId: 'eval_smart-road-vision', claimId: 'CLAIM-1', videoId: 'v1', timestamp: 365, demoSupport: 'SUPPORTED', confidence: 0.96, observationNotes: 'Presenter demonstrated live inference overlay with on-screen latency counter indicating 22.4ms average on Jetson Orin Nano.', claimText: 'System operates in real-time under 25ms per frame on NVIDIA Jetson hardware.', createdAt: '' },
      { id: 'cdm2', evaluationId: 'eval_smart-road-vision', claimId: 'CLAIM-2', videoId: 'v1', timestamp: 215, demoSupport: 'PARTIALLY_SUPPORTED', confidence: 0.91, observationNotes: 'Validation precision reached 94.2% on standard dataset, but video notes reduced detection performance under heavy precipitation.', claimText: 'AI model achieves 95% detection accuracy on multiple road distress categories.', createdAt: '' },
      { id: 'cdm3', evaluationId: 'eval_smart-road-vision', claimId: 'CLAIM-3', videoId: 'v1', timestamp: 480, demoSupport: 'SUPPORTED', confidence: 0.94, observationNotes: 'Physical power meter demonstrated 11.2 Watts active draw during continuous 42 FPS inference.', claimText: 'Edge device operates under 15W total system power budget for vehicle battery survivability.', createdAt: '' },
      { id: 'cdm4', evaluationId: 'eval_smart-road-vision', claimId: 'CLAIM-4', videoId: 'v1', timestamp: 510, demoSupport: 'NOT_DEMONSTRATED', confidence: 0.85, observationNotes: 'PDF work order generation was mentioned during the verbal presentation but was not demonstrated on screen.', claimText: 'Automated road authority PDF work-order dispatch triggers upon hazard detection.', createdAt: '' },
    ],
    presentationMetrics: {
      id: 'pm1',
      videoId: 'v1',
      speechRateWpm: 142,
      pauseFrequency: 8,
      pauseDurationSeconds: 42,
      fillerWordFrequency: 1.8,
      talkingTimeRatio: 0.78,
      silenceTimeRatio: 0.22,
      structureSectionsCount: 10,
      clarityScore: 0.91,
      createdAt: '',
    },
    timeline: [
      { id: 'e1', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 4, eventType: 'SLIDE_CHANGE', description: 'Title slide: Smart Road Vision Edge Telemetry Platform.', confidence: 0.98, evidenceIds: [], createdAt: '' },
      { id: 'e2', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 48, eventType: 'RESULT', description: 'Municipal cost impact chart displayed.', confidence: 0.95, evidenceIds: [], createdAt: '' },
      { id: 'e3', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 112, eventType: 'TECHNICAL_MENTION', description: 'Topology architecture diagram presented (Camera -> Jetson Orin Nano -> SQLite -> Cloud).', confidence: 0.96, evidenceIds: [], createdAt: '' },
      { id: 'e4', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 165, eventType: 'TECHNICAL_MENTION', description: 'VS Code displayed with yolov8_trt_inference.py.', confidence: 0.96, evidenceIds: [], createdAt: '' },
      { id: 'e5', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 215, eventType: 'CLAIM', description: 'Claim Demonstrated (PARTIALLY_SUPPORTED): Validation split showed 94.2% precision on RDD2022.', confidence: 0.91, evidenceIds: [], createdAt: '' },
      { id: 'e6', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 305, eventType: 'DEMO', description: 'Jetson Orin Nano powered via bench supply, boot sequence verified.', confidence: 0.98, evidenceIds: [], createdAt: '' },
      { id: 'e7', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 365, eventType: 'DEMO', description: 'Live Pothole Detection: 22.4ms measured latency counter active on screen.', confidence: 0.96, evidenceIds: [], createdAt: '' },
      { id: 'e8', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 425, eventType: 'ERROR', description: 'Warning banner: Video frame buffer overrun (dropped 2 frames). Watchdog recovered.', confidence: 0.88, evidenceIds: [], createdAt: '' },
      { id: 'e9', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 480, eventType: 'DEMO', description: 'Bench power meter verified 11.2 Watts active draw during 42 FPS inference.', confidence: 0.94, evidenceIds: [], createdAt: '' },
      { id: 'e10', evaluationId: 'eval_smart-road-vision', videoId: 'v1', timestamp: 580, eventType: 'SLIDE_CHANGE', description: 'Concluding slide with GitHub repository, license, and team contacts.', confidence: 0.98, evidenceIds: [], createdAt: '' },
    ],
  };

  const activeBundle = videoAnalysis || fallbackVideoBundle;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-28">
      {/* Top Sticky Bar */}
      <div className="sticky top-16 z-30 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToOverview && (
              <button
                onClick={onBackToOverview}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Return to overview"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                  Multi-Modal Video & Audio Engine v4.0
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-mono text-slate-400">Phase 4 Active</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                Multimodal Video, Audio & Presentation Analysis
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Track Switcher */}
            <div className="p-1 rounded-xl bg-black/40 border border-white/10 flex items-center">
              <button
                onClick={() => setSelectedTrack('hardware')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedTrack === 'hardware'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Hardware</span>
              </button>
              <button
                onClick={() => setSelectedTrack('software')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedTrack === 'software'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Software</span>
              </button>
            </div>

            {/* AI Jury Quick Action */}
            {onViewAIJury && (
              <button
                onClick={onViewAIJury}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs font-mono font-semibold text-cyan-300 transition-all shadow-md"
                title="Open AI Jury & Scoring Engine"
              >
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">AI Jury</span>
              </button>
            )}

            {/* Export Action */}
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-fadeIn">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-xl">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              {exportNotice}
            </span>
            <button onClick={() => setExportNotice(null)} className="text-cyan-400 hover:text-white">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* Ethical Separation Banner: Demo Mode vs Live Stream Analysis */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-mono uppercase font-bold text-amber-300 tracking-wider">
                Auditing Integrity Standard: Separating Benchmark Demo vs Live Analysis
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Recorded benchmarks and offline demo telemetry are labeled as <strong>Demo Mode (Playback)</strong>. Active webcam and microphone telemetry is labeled as <strong>Live Stream Analysis</strong>. Strictly producing observable data without psychological speculation.
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="p-1 rounded-2xl bg-black/60 border border-white/10 flex items-center shrink-0">
            <button
              onClick={() => setActiveMode('demo-playback')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                activeMode === 'demo-playback'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Demo Mode (Playback)</span>
            </button>

            <button
              onClick={() => setActiveMode('live-stream')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                activeMode === 'live-stream'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-300" />
              <span>Live Analysis (Active Stream)</span>
            </button>
          </div>
        </div>

        {/* Master Score Strip */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0B0F19] to-slate-900/90 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                  {activeMode === 'demo-playback' ? 'Demo Mode · Verified Benchmark Session' : 'Live In-Session Telemetry Stream'}
                </span>
                <span className="text-slate-500 text-xs">·</span>
                <span className="text-xs font-mono text-slate-400">Duration: {report.durationFormatted}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                {report.sessionTitle}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Presenter: <span className="text-slate-200">{report.presenter}</span> · Project: <span className="text-cyan-300">{report.projectName}</span>
              </p>
            </div>

            <div className="flex items-center gap-5 p-4 rounded-2xl bg-black/60 border border-white/10 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                  Presentation & Demo Composite
                </span>
                <div className="text-4xl font-black font-mono text-emerald-400">
                  {report.compositeScore}
                  <span className="text-base text-slate-500 font-normal"> / 100</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold block mt-0.5">
                  Confidence: {report.confidenceLevel}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="p-1.5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-center rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Sections
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 text-center rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Video Analyzer (4-Quadrant)</span>
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 text-center rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'claims'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Claim ↔ Demo Evidence ({activeBundle.claimDemoMatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-4 py-2 text-center rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'presentation'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presentation ({report.presentation.overallScore})
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 text-center rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'demo'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Features ({report.demo.overallScore})
          </button>
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`px-4 py-2 text-center rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === 'synthesis'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Synthesis & Coaching
          </button>
        </div>

        {/* 1. MULTIMODAL VIDEO ANALYZER (4-QUADRANT) */}
        {(activeTab === 'all' || activeTab === 'video') && (
          <MultimodalVideoAnalyzer
            video={activeBundle.video}
            segments={activeBundle.segments}
            transcript={activeBundle.transcript}
            visualEvents={activeBundle.visualEvents}
            timeline={activeBundle.timeline}
            initialTimestamp={activeSeekTimestamp}
            onSeekRequested={(t) => setActiveSeekTimestamp(t)}
          />
        )}

        {/* 2. CLAIM ↔ VIDEO EVIDENCE MATCHING */}
        {(activeTab === 'all' || activeTab === 'claims') && (
          <ClaimDemoMatchSection
            matches={activeBundle.claimDemoMatches}
            onSeekToTimestamp={handleSeekToTimestamp}
          />
        )}

        {/* 3. PRESENTATION ANALYSIS SECTION (Speech Metrics & Overall Observation Summary) */}
        {(activeTab === 'all' || activeTab === 'presentation') && (
          <PresentationAnalysisSection
            presentation={report.presentation}
            onSelectEvent={handleEventClick}
            onSelectMetric={(m) => setInspectedMetric(m)}
          />
        )}

        {/* 4. DEMO ANALYSIS SECTION */}
        {(activeTab === 'all' || activeTab === 'demo') && (
          <DemoAnalysisSection
            demo={report.demo}
            onInspectFeature={handleFeatureClick}
          />
        )}

        {/* 5. EVALUATION SYNTHESIS & COACHING */}
        {(activeTab === 'all' || activeTab === 'synthesis') && (
          <EvaluationSynthesisCard report={report} />
        )}
      </div>

      {/* Evidence Trace Deep-Dive Modal */}
      <EvidenceTraceModal
        metric={inspectedMetric}
        onClose={() => setInspectedMetric(null)}
      />
    </div>
  );
};

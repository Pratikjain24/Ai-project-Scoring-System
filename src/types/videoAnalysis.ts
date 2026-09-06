export type StageStatus = 'Queued' | 'Running' | 'Completed' | 'Warning' | 'Failed';

export interface VideoMetadata {
  id: string;
  name: string;
  sizeBytes: number;
  formattedSize: string;
  durationSeconds: number;
  formattedDuration: string;
  resolution: string;
  fps: number;
  format: 'mp4' | 'mov' | 'webm';
  url?: string;
  uploadStatus: 'idle' | 'uploading' | 'completed' | 'error';
  uploadProgress: number;
  thumbnailUrl?: string;
}

export interface PipelineStage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  status: StageStatus;
  progress: number; // 0 - 100
  timestamp: string;
  durationMs: number;
  summary: string;
  details: {
    telemetryKeys?: { label: string; value: string }[];
    logs?: string[];
    outputSample?: string;
    warningNote?: string;
  };
}

export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'stage_1',
    stageNumber: 1,
    title: 'Video Ingestion',
    subtitle: 'Container demuxing & keyframe indexation',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 420,
    summary: 'Demuxes H.264/AV1 bitstreams, generates I-frame GOP index, and synchronizes PTS/DTS timestamps.',
    details: {
      telemetryKeys: [
        { label: 'Codec', value: 'H.264 High@L4.2' },
        { label: 'Bitrate', value: '18.4 Mbps' },
        { label: 'GOP Structure', value: 'M=3, N=30' },
        { label: 'Color Space', value: 'BT.709 8-bit 4:2:0' },
      ],
      logs: [
        '[ffmpeg-demux] Container unpacked: 14:32 duration at 59.94 FPS',
        '[keyframe-idx] 1,744 I-frames mapped to presentation slides',
        '[sync-check] Audio/Visual skew < 2.1ms (nominal)',
      ],
      outputSample: 'Artifact ID: vid_manifest_8829a.json (Sealed with SHA-256)',
    },
  },
  {
    id: 'stage_2',
    stageNumber: 2,
    title: 'Audio Extraction',
    subtitle: 'Spectral decomposition & voice isolation',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 380,
    summary: 'Splits stereo audio tracks, runs noise suppression, and separates presenter vocal track from background fan noise.',
    details: {
      telemetryKeys: [
        { label: 'Sample Rate', value: '48.0 kHz 24-bit PCM' },
        { label: 'Channels', value: 'Stereo (downmixed to Mono 16k)' },
        { label: 'SNR Ratio', value: '+34.2 dB (Clean speech)' },
      ],
      logs: [
        '[audio-split] Extracted 48kHz audio stream (132 MB PCM)',
        '[denoise-filter] Spectral subtraction removed 120Hz cooling fan hum',
        '[voice-vad] Voice Activity Detection mapped 91.4% speech coverage',
      ],
      outputSample: 'speech_isolated_track.wav (Spectral clarity score: 96.8%)',
    },
  },
  {
    id: 'stage_3',
    stageNumber: 3,
    title: 'Speech Transcription',
    subtitle: 'Word-level timestamping & technical lexicon mapping',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 850,
    summary: 'Converts presentation speech into timestamped tokens with specialized engineering & silicon vocabulary recognition.',
    details: {
      telemetryKeys: [
        { label: 'Model', value: 'Whisper-X v3 Large Turbo' },
        { label: 'Word Error Rate', value: '1.2% (Technical lexicon tuned)' },
        { label: 'Vocabulary Tokens', value: '2,420 words parsed' },
      ],
      logs: [
        '[asr-engine] Recognizing technical terms: "Hailo-8", "ESP32-S3", "DRC routing", "KiCad"',
        '[word-align] 2,420 words aligned to exact video milliseconds',
        '[cadence-calc] Mean speaking rate: 138 words per minute (optimal)',
      ],
      outputSample: 'Transcript manifest: 32 paragraphs, 5 key slides cross-referenced.',
    },
  },
  {
    id: 'stage_4',
    stageNumber: 4,
    title: 'Visual Analysis',
    subtitle: 'OCR slide extraction & prototype tracking',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 920,
    summary: 'Performs OCR on slide text, diagrams, formulas, and detects hardware components on test bench feeds.',
    details: {
      telemetryKeys: [
        { label: 'Slides Detected', value: '14 distinct slide decks' },
        { label: 'Hardware BBoxes', value: '6 physical components classified' },
        { label: 'Gaze Direction', value: '88% camera engagement' },
      ],
      logs: [
        '[ocr-extract] Extracted 14 slide titles, 3 architecture flowcharts, 2 circuit schematics',
        '[cv-hardware] Detected ESP32-S3 MCU, Hailo-8 M.2 carrier, and Tektronix oscilloscope',
        '[screen-dwell] Slide 6 (Architecture diagram) dwell time: 2m 14s',
      ],
      outputSample: 'Visual feature graph: 14 slides + 3 schematic diagrams vector-mapped.',
    },
  },
  {
    id: 'stage_5',
    stageNumber: 5,
    title: 'Project Feature Detection',
    subtitle: 'Subsystem boundary & architecture mapping',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 640,
    summary: 'Correlates speech transcript with visual diagrams to reconstruct the project dependency graph and subsystems.',
    details: {
      telemetryKeys: [
        { label: 'Identified Subsystems', value: 'Firmware, NPU Inference, Power Management, RF Telemetry' },
        { label: 'System Complexity', value: 'Class B Embedded System' },
      ],
      logs: [
        '[subsys-map] Subsystem 1: Dual IR/Optical sensor optical pipeline',
        '[subsys-map] Subsystem 2: Hailo-8 M.2 PCIe edge inference driver',
        '[subsys-map] Subsystem 3: 4-layer power distribution & 3.3V buck regulator',
      ],
      outputSample: 'Reconstructed System Topology: 4 core modules, 2 external buses mapped.',
    },
  },
  {
    id: 'stage_6',
    stageNumber: 6,
    title: 'Claim Extraction',
    subtitle: 'Forensic performance & benchmark isolation',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 780,
    summary: 'Extracts qualitative and quantitative claims made by the presenter for empirical verification.',
    details: {
      telemetryKeys: [
        { label: 'Total Claims Isolated', value: '7 claims' },
        { label: 'Quantitative Benchmarks', value: '4 metrics' },
        { label: 'Qualitative Claims', value: '3 promises' },
      ],
      logs: [
        '[claim-ext] Claim #1: "42 FPS on-device inference on Hailo-8 NPU"',
        '[claim-ext] Claim #2: "Sub-100ms wildfire smoke detection alert"',
        '[claim-ext] Claim #3: "BOM unit cost below $35 at scale"',
      ],
      warningNote: 'Claim #3 flagged as potentially aggressive compared to current component spot pricing.',
      outputSample: 'Claim Manifest: 7 claims parsed into verification test matrices.',
    },
  },
  {
    id: 'stage_7',
    stageNumber: 7,
    title: 'External Research',
    subtitle: '240M+ paper, patent & commercial search',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 1100,
    summary: 'Autonomous crawlers search ArXiv, IEEE Xplore, USPTO patents, and GitHub to check prior art and claimed originality.',
    details: {
      telemetryKeys: [
        { label: 'Literature Search', value: '240M+ papers queried' },
        { label: 'Patent Bases', value: 'USPTO, WIPO, EPO scanned' },
        { label: 'Prior Art Matches', value: '1 partial match (US-2024-00912)' },
      ],
      logs: [
        '[semantic-scholar] Query: "drone wildfire edge detection Hailo-8 infrared fusion"',
        '[patent-crawler] Scanned 184 granted drone vision patents',
        '[match-found] US-2024-00912 shares gimbal mechanics; optical sensor fusion is novel',
      ],
      outputSample: 'Prior Art Dossier: 1 match documented, 0 catastrophic originality infringements.',
    },
  },
  {
    id: 'stage_8',
    stageNumber: 8,
    title: 'Technical Evaluation',
    subtitle: 'Sandbox execution & engineering depth audit',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 1250,
    summary: 'Spins up isolated micro-VM to execute code benchmarks and simulates thermal/impedance traces for circuit designs.',
    details: {
      telemetryKeys: [
        { label: 'Micro-VM Boot', value: 'Firecracker (0.4ms boot)' },
        { label: 'Reproduced Latency', value: '41.8 FPS confirmed' },
        { label: 'AST Vulnerabilities', value: '0 buffer overflows, 2 minor warnings' },
      ],
      logs: [
        '[micro-vm] Mounting isolated Firecracker container with ONNX/Hailo runtime',
        '[bench-run] Executing validation batch: 41.8 FPS sustained @ 2.4W power consumption',
        '[kicad-drc] 90Ω differential pair trace impedance checked: verified within ±2%',
      ],
      outputSample: 'Technical Execution Score: 94/100 (High institutional rigor).',
    },
  },
  {
    id: 'stage_9',
    stageNumber: 9,
    title: 'Originality Analysis',
    subtitle: 'Novelty index computation & delta attribution',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 580,
    summary: 'Calculates the mathematical novelty delta against existing commercial and academic baselines.',
    details: {
      telemetryKeys: [
        { label: 'Novelty Index', value: '89.2 / 100' },
        { label: 'Open-Source Derivative %', value: '14% (Standard libraries)' },
        { label: 'Novel Team IP %', value: '86% Proprietary firmware/PCB' },
      ],
      logs: [
        '[ast-diff] Codebase compared to 40 popular drone GitHub repositories',
        '[novelty-calc] Sensor fusion loop declared genuine custom team contribution',
      ],
      outputSample: 'Originality Index: 89.2% (Distinct architectural advancement).',
    },
  },
  {
    id: 'stage_10',
    stageNumber: 10,
    title: 'Final Scoring',
    subtitle: 'Multi-agent adversarial juror deliberation',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 620,
    summary: 'Three specialized AI juror models vote independently across the weighted rubric to reach consensus without subjective drift.',
    details: {
      telemetryKeys: [
        { label: 'Composite Score', value: '92.4 / 100' },
        { label: 'Juror Agreement', value: '98.7% Consensus' },
        { label: 'Verdict Rank', value: 'Institutional Tier 1 High Distinction' },
      ],
      logs: [
        '[juror-arch] Score: 96/100 (Approved differential routing & memory safety)',
        '[juror-forensic] Score: 91/100 (Replicated 41.8 FPS benchmark)',
        '[juror-patent] Score: 89/100 (Novelty index validated against prior art)',
      ],
      outputSample: 'Consensus Verdict: 92.4 Composite Score with Tier 1 Grant Recommendation.',
    },
  },
  {
    id: 'stage_11',
    stageNumber: 11,
    title: 'Report Generation',
    subtitle: 'Cryptographic proof hash & auditable dossier export',
    status: 'Queued',
    progress: 0,
    timestamp: '00:00.0',
    durationMs: 450,
    summary: 'Compiles the full institutional evaluation dossier with video timestamps, code citations, and cryptographic signatures.',
    details: {
      telemetryKeys: [
        { label: 'Manifest Hash', value: 'sha256:7f83b165...9ac4' },
        { label: 'Total Verified Citations', value: '18 linked citations' },
        { label: 'Format', value: 'Interactive Web Dossier + Auditable PDF' },
      ],
      logs: [
        '[report-builder] Packaging rubric breakdown and line-level citations',
        '[crypto-sign] Manifest signed: sha256:7f83b16528d1e4c7009a24bb188f',
        '[ready] Institutional Dossier finalized and ready for grant review',
      ],
      outputSample: 'Dossier ready: AeroPulse_PX4_Evaluation_Manifest.pdf (Exportable).',
    },
  },
];

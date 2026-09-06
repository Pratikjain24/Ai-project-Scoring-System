export interface PipelineStep {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  sources: string[];
  metrics: { label: string; value: string }[];
  accentColor: 'cyan' | 'emerald' | 'violet' | 'amber';
  verdictSample: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  detail: string;
  metric: string;
  metricLabel: string;
  iconName: string;
  color: 'cyan' | 'emerald' | 'violet' | 'amber';
}

export interface TrackFeature {
  title: string;
  subtitle: string;
  items: {
    label: string;
    description: string;
    verifiedMetric: string;
    severity?: 'pass' | 'warning' | 'info';
  }[];
  telemetryStream: {
    timestamp: string;
    module: string;
    event: string;
    status: string;
  }[];
}

export interface SampleEvaluationDossier {
  projectTitle: string;
  author: string;
  cohort: string;
  compositeScore: number;
  verdictRank: string;
  classification: string;
  summaryVerdict: string;
  confidenceScore: number;
  rubric: {
    id: string;
    category: string;
    score: number;
    maxScore: number;
    weight: string;
    summary: string;
    evidenceCount: number;
    citations: {
      type: 'code' | 'video' | 'paper' | 'benchmark';
      reference: string;
      note: string;
      verified: boolean;
    }[];
  }[];
  juryDissentNotes: string[];
  actionableRoadmap: {
    priority: 'Critical' | 'Recommended' | 'Bonus';
    title: string;
    effort: string;
    impact: string;
  }[];
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'intake',
    number: '01',
    title: 'Multimodal Ingestion',
    subtitle: 'Full-Stack Artifact Intake',
    tagline: 'Code repos, CAD/Gerbers, Pitch video, Live Camera stream',
    description: 'Ingests heterogeneous artifacts simultaneously. Parses abstract syntax trees (AST), bill-of-materials (BOM), KiCAD schematics, and synchronizes audio/visual timestamps with slide decks.',
    sources: ['GitHub / GitLab', 'KiCad / Altium Gerbers', '1080p60 Video Feeds', 'PDF / ArXiv Pitch Decks'],
    metrics: [
      { label: 'Ingestion Latency', value: '< 2.4s' },
      { label: 'Supported Artifacts', value: '38 Formats' },
      { label: 'Multimodal Sync', value: 'Frame-Accurate' },
    ],
    accentColor: 'cyan',
    verdictSample: 'Ingested 44k LOC across 182 files + 4-layer PCB gerbers + 14:32 video demo.',
  },
  {
    id: 'research',
    number: '02',
    title: 'Deep Web & Prior Art Investigation',
    subtitle: 'Autonomous Academic & Patent Scan',
    tagline: 'Cross-verifies originality against ArXiv, USPTO, WIPO & Open Source',
    description: 'Deploys autonomous crawler agents to scour 220M+ research papers, patent grants, GitHub forks, and product launches. Detects whether "novel" claims are re-implementations or genuine breakthroughs.',
    sources: ['Semantic Scholar', 'USPTO / WIPO Patents', 'GitHub Fork Networks', 'HackerNews & TechCrunch'],
    metrics: [
      { label: 'Literature Coverage', value: '240M+ Papers' },
      { label: 'Similarity Resolution', value: 'Sub-Graph AST' },
      { label: 'Novelty Index', value: 'Calculated 0-100' },
    ],
    accentColor: 'violet',
    verdictSample: 'Detected 84% structural overlap with arXiv:2308.11429; flagged novel hardware sensor fusion loop.',
  },
  {
    id: 'verification',
    number: '03',
    title: 'Forensic Claim Verification',
    subtitle: 'Benchmarking & Hyperbole Filter',
    tagline: 'Empirically tests latency, throughput, accuracy & claims against live ground truth',
    description: 'Isolates every qualitative and quantitative claim made in presentations. Replicates benchmark code in isolated micro-VMs, tests mathematical limits, and catches hand-waved figures.',
    sources: ['Sandboxed Micro-VMs', 'Hardware Emulation', 'Audio Pitch Telemetry', 'Unit-Test Replay'],
    metrics: [
      { label: 'Claim Extraction', value: '99.2% Recall' },
      { label: 'Benchmarking Sandbox', value: 'Isolated Firecracker' },
      { label: 'False Claim Penalty', value: 'Deterministic' },
    ],
    accentColor: 'emerald',
    verdictSample: 'Claimed "99.4% precision" verified at 94.2% on out-of-distribution smoke datasets.',
  },
  {
    id: 'rigor',
    number: '04',
    title: 'Technical & Architectural Rigor',
    subtitle: 'Engineering Depth Audit',
    tagline: 'Code smells, PCB thermal margins, state machine deadlock analysis',
    description: 'Goes beyond surface syntax. Audits concurrent locks, memory leaks, ground loop return paths in circuit design, RF decoupling capacitors, and edge-case error recovery mechanisms.',
    sources: ['Static AST Analysis', 'KiCAD DRC & Thermal Sim', 'Formal Verification', 'Cyclomatic Complexity'],
    metrics: [
      { label: 'Hardware DRC Audit', value: '100% Trace Check' },
      { label: 'Concurrency Audit', value: 'Deadlock Scan' },
      { label: 'Maintainability Score', value: 'Class A' },
    ],
    accentColor: 'cyan',
    verdictSample: 'Approved bypass capacitors & differential routing; 2 unhandled Promise rejections flagged.',
  },
  {
    id: 'verdict',
    number: '05',
    title: 'Evidence-Backed Jury Verdict',
    subtitle: 'Granular Auditable Scorecard',
    tagline: 'Every score is linked to a cryptographic citation timestamp or line number',
    description: 'Synthesizes an institutional rubric scorecard. Zero subjective bias. Every critique or recommendation comes with an auditable reference to the video frame, code line, or literature precedent.',
    sources: ['Institutional Rubrics', 'Auditable Cryptographic Proofs', 'Multi-Agent Consensus', 'Interactive Dossier'],
    metrics: [
      { label: 'Subjective Drift', value: '0.00%' },
      { label: 'Citation Traceability', value: '100% Linked' },
      { label: 'Report Format', value: 'Interactive Web + PDF' },
    ],
    accentColor: 'emerald',
    verdictSample: 'Composite Score: 92.4/100. Awarded Tier 1 Institutional Distinction with 3 architectural fixes.',
  },
];

export const FEATURES: FeatureItem[] = [
  {
    id: 'multimodal-vision',
    title: 'Multimodal Video & Live Vision',
    tag: 'Computer Vision',
    description: 'Inspects breadboards, PCB soldering, oscilloscope waveforms, and physical mechanics in real-time or recorded high-definition feeds.',
    detail: 'Detects solder bridges, floating pins, and motor strain with micro-second frame analysis synchronized with spoken voice tracks.',
    metric: '60 FPS',
    metricLabel: 'Synchronized visual inspection',
    iconName: 'Eye',
    color: 'cyan',
  },
  {
    id: 'web-research',
    title: 'Autonomous Deep Web & Patent Search',
    tag: 'Prior Art Scraper',
    description: 'Cross-references claimed breakthroughs with 240M+ research papers, patent filings, GitHub commits, and existing commercial products.',
    detail: 'Verifies whether the team actually authored foundational algorithms or simply re-packaged an open-source Hugging Face model.',
    metric: '240M+',
    metricLabel: 'Academic & patent graph indices',
    iconName: 'Globe',
    color: 'violet',
  },
  {
    id: 'claim-verification',
    title: 'Forensic Claim & Benchmark Verification',
    tag: 'Ground Truth Engine',
    description: 'Flags hand-waving, exaggerated metrics, and impossible physical or computational claims before they pass the jury.',
    detail: 'Spins up isolated micro-VMs to execute team benchmarks directly on canonical datasets, detecting overfitting and cherry-picked tests.',
    metric: '100%',
    metricLabel: 'Reproducibility verification',
    iconName: 'CheckCircle2',
    color: 'emerald',
  },
  {
    id: 'dual-track',
    title: 'Unified Software & Hardware Auditing',
    tag: 'Hybrid Architecture',
    description: 'The first evaluation engine capable of judging pure distributed software microservices and custom silicon/PCB schematics side-by-side.',
    detail: 'Analyzes Gerber design rules, thermal dissipation, BOM supply chain risk, memory safety, and cloud orchestration resilience.',
    metric: '38+',
    metricLabel: 'Software & hardware formats supported',
    iconName: 'Cpu',
    color: 'cyan',
  },
  {
    id: 'presentation-telemetry',
    title: 'Pitch & Presentation Cadence Telemetry',
    tag: 'Presentation AI',
    description: 'Evaluates technical communication, clarity, time allocation across slides, voice confidence, and technical Q&A agility.',
    detail: 'Measures cognitive load of slide schematics and flags when presenters gloss over complex architectural risks.',
    metric: '< 150ms',
    metricLabel: 'Gaze & speech telemetry latency',
    iconName: 'Mic',
    color: 'amber',
  },
  {
    id: 'evidence-chain',
    title: 'Cryptographic Chain of Evidence',
    tag: 'Zero-Bias Audit',
    description: 'No black-box hallucinated opinions. Every single point awarded or deducted links directly to a video second or code line.',
    detail: 'Enables academic juries, grant committees, and hackathon directors to defend their judging decisions with indisputable proof.',
    metric: '0.00%',
    metricLabel: 'Hallucination tolerance threshold',
    iconName: 'ShieldCheck',
    color: 'emerald',
  },
];

export const SOFTWARE_TRACK_DATA: TrackFeature = {
  title: 'Software & Cloud Track',
  subtitle: 'Full-stack repos, smart contracts, ML pipelines, and microservices.',
  items: [
    {
      label: 'AST & Algorithmic Complexity',
      description: 'Parses call graphs, Big-O asymptotic scaling, and detects algorithmic choke points in critical hot paths.',
      verifiedMetric: 'O(N log N) verified vs O(N²) worst-case',
      severity: 'pass',
    },
    {
      label: 'Git Commit Forensics & Author Distribution',
      description: 'Traces commit timing, squashed commits, and AI-generation heuristics to verify true author contribution ratios.',
      verifiedMetric: '94% genuine team-authored codebase',
      severity: 'pass',
    },
    {
      label: 'API Contract & Concurrency Stress',
      description: 'Audits idempotency, race conditions, unhandled WebSocket dropouts, and distributed transaction rollbacks.',
      verifiedMetric: '2 race conditions flagged in worker queue',
      severity: 'warning',
    },
    {
      label: 'Live Benchmark Sandbox Execution',
      description: 'Executes benchmark scripts in ephemeral micro-VMs to verify throughput (req/sec) and p99 latency promises.',
      verifiedMetric: 'Verified 4.8ms p99 vs claimed 5.0ms',
      severity: 'pass',
    },
  ],
  telemetryStream: [
    { timestamp: '10:04:12', module: 'git-forensics', event: '420 commits scanned; 4 contributors mapped', status: 'VERIFIED' },
    { timestamp: '10:04:15', module: 'ast-complexity', event: 'Hot-path latency analysis on /api/v2/ingest', status: 'OPTIMAL' },
    { timestamp: '10:04:19', module: 'concurrency-check', event: 'Simulated 10,000 concurrent mutex locks', status: 'PASS' },
    { timestamp: '10:04:24', module: 'sec-scanner', event: 'Zero hardcoded secrets or exposed JWTs', status: 'CLEAN' },
  ],
};

export const HARDWARE_TRACK_DATA: TrackFeature = {
  title: 'Hardware, Embedded & Robotics Track',
  subtitle: 'KiCad/Altium schematics, Gerber layers, BOM costing, and physical prototypes.',
  items: [
    {
      label: 'PCB DRC & Trace Impedance Verification',
      description: 'Checks high-speed differential pairs, trace widths for current capacity, ground plane returns, and decoupling caps.',
      verifiedMetric: '90Ω differential impedance matched (USB-C & SPI)',
      severity: 'pass',
    },
    {
      label: 'BOM Cost & Component Availability Reality Check',
      description: 'Queries global distributor APIs (DigiKey, Mouser, LCSC) to verify unit manufacturing cost at 1k production volume.',
      verifiedMetric: '$34.20 realistic unit BOM vs claimed $15.00',
      severity: 'warning',
    },
    {
      label: 'Thermal Footprint & Voltage Regulation Audit',
      description: 'Simulates LDO and switching regulator thermals under peak continuous 3.3V / 5V current draw.',
      verifiedMetric: 'Operating temp 48°C within safe 85°C limit',
      severity: 'pass',
    },
    {
      label: 'Oscilloscope Waveform & Physical CV Inspection',
      description: 'Analyzes live camera feeds of oscilloscope ripple, probe points, and physical actuator behavior.',
      verifiedMetric: 'PWM ripple < 14mV p-p at full throttle',
      severity: 'pass',
    },
  ],
  telemetryStream: [
    { timestamp: '10:05:01', module: 'kicad-gerber', event: '4-layer stackup validated: JLC2313 specs', status: 'VERIFIED' },
    { timestamp: '10:05:04', module: 'bom-realizer', event: 'Checking 42 components on DigiKey/LCSC APIs', status: 'AUDITED' },
    { timestamp: '10:05:08', module: 'thermal-model', event: 'MCU heat dissipation steady state @ 48°C', status: 'NOMINAL' },
    { timestamp: '10:05:12', module: 'cv-inspection', event: 'ESP32-S3 solder fillets verified without bridge', status: 'PASS' },
  ],
};

export const SAMPLE_DOSSIER: SampleEvaluationDossier = {
  projectTitle: 'AeroPulse PX-4: Autonomous Drone Edge Wildfire Detection',
  author: 'Stanford BioRobotics & Embedded Systems Lab',
  cohort: 'Global Autonomous Systems Grant Round 2026',
  compositeScore: 92.4,
  verdictRank: 'Institutional Tier 1 High Distinction',
  classification: 'Hardware + Embedded Edge AI (ESP32-S3 + Hailo-8 NPU)',
  summaryVerdict: 'Exceptional engineering execution. Custom 4-layer PCB with dedicated NPU acceleration delivering 42 FPS on-drone infrared smoke inference. The jury independently confirmed the 84ms detection response time in sandboxed emulation.',
  confidenceScore: 98.7,
  rubric: [
    {
      id: 'tech-execution',
      category: 'Technical Architecture & Engineering Rigor',
      score: 96,
      maxScore: 100,
      weight: '30%',
      summary: 'High-speed differential trace routing verified. Embedded C++ firmware shows clean ring-buffer concurrency with zero heap allocations in the critical telemetry loop.',
      evidenceCount: 6,
      citations: [
        { type: 'code', reference: 'firmware/src/sensor_fusion.cpp:118-142', note: 'Lock-free atomic ring buffer for 200Hz IMU reads.', verified: true },
        { type: 'benchmark', reference: 'Micro-VM Run #882', note: 'Hailo-8 NPU inference sustained 41.8 FPS at 2.4 Watts.', verified: true },
      ],
    },
    {
      id: 'claim-veracity',
      category: 'Claim Veracity & Empirical Benchmarks',
      score: 91,
      maxScore: 100,
      weight: '25%',
      summary: 'Team claimed 99.1% flame detection precision. Sandboxed testing verified 94.8% on challenging haze/fog test splits; team acknowledged boundary conditions.',
      evidenceCount: 4,
      citations: [
        { type: 'video', reference: 'Demo Video @ 06:44 - 07:18', note: 'Wind tunnel flame flicker test correctly classified at 92.4%.', verified: true },
        { type: 'benchmark', reference: 'Kaggle Wildfire-V4 Validation Split', note: 'Replication confirmed 94.8% accuracy without synthetic augmentations.', verified: true },
      ],
    },
    {
      id: 'originality',
      category: 'Originality & Prior Art Distinction',
      score: 89,
      maxScore: 100,
      weight: '20%',
      summary: 'Scanned 240M papers. Distinct from IEEE 2024 DroneFire patent due to proprietary dual-spectrum infrared/thermal optical gating.',
      evidenceCount: 3,
      citations: [
        { type: 'paper', reference: 'IEEE Trans. Cybernetics (US-2024-00912)', note: 'Patent overlap isolated to gimbal stabilization; optics are original.', verified: true },
      ],
    },
    {
      id: 'presentation',
      category: 'Presentation Telemetry & Technical Defense',
      score: 93,
      maxScore: 100,
      weight: '15%',
      summary: 'Presenter demonstrated command of RF link budget equations during live interrogative Q&A. Clear slide visual hierarchy.',
      evidenceCount: 4,
      citations: [
        { type: 'video', reference: 'Live Jury Q&A @ 11:20', note: 'Immediate articulate defense of antenna impedance tuning under rotor interference.', verified: true },
      ],
    },
    {
      id: 'impact',
      category: 'Real-World Feasibility & Unit Economics',
      score: 90,
      maxScore: 100,
      weight: '10%',
      summary: 'BOM pricing recalculated at $184/unit in 500-unit batches. Regulatory FAA Part 107 compliance pathway validated.',
      evidenceCount: 3,
      citations: [
        { type: 'code', reference: 'bom/production_quote_rev3.csv', note: 'Component lead times verified via DigiKey Octopart API.', verified: true },
      ],
    },
  ],
  juryDissentNotes: [
    'Juror AI-3 flagged: Team should migrate power buck regulator from TPS54302 to synchronous MP2315 to squeeze additional 8% battery endurance during hover.',
    'Juror AI-1 noted: Optical thermal calibration requires temperature drift compensation curves above 45°C ambient.',
  ],
  actionableRoadmap: [
    { priority: 'Critical', title: 'Implement RTOS Watchdog on Hailo-8 PCIe bus', effort: '2 days', impact: 'Prevents flight telemetry hang upon SPI bus reset' },
    { priority: 'Recommended', title: 'Add Ferrite Beads on 5V Rotor ESC Power Leads', effort: '1 day', impact: 'Eliminates 38mV high-frequency switching hash on analog IMU' },
    { priority: 'Bonus', title: 'Containerize Onnx runtime weights for OTA flash', effort: '3 days', impact: 'Enables in-field model updates over LoRa 915MHz telemetry' },
  ],
};

export interface ProjectEvaluationItem {
  id: string;
  name: string;
  type: 'Software' | 'Hardware';
  domain: string;
  tagline: string;
  overallScore: number;
  confidence: number;
  status: 'Completed' | 'Analyzing' | 'Needs Review' | 'Failed';
  originalityScore: number;
  impactScore: number;
  technicalScore: number;
  presentationScore: number;
  demoScore: number;
  verdict: 'Exceptional' | 'Strong Project' | 'Promising' | 'Needs Improvement' | 'Critical Failure';
  team: string;
  updatedAt: string;
  submittedAt: string;
  problemStatement: string;
  solutionDescription: string;
  executiveSummary: string;
  evidenceCount: number;
  claimsCount: number;
  verifiedClaimsCount: number;
  breakdown: {
    category: string;
    score: number;
    weight: string;
    confidence: number;
    evidenceCount: number;
  }[];
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  nextSteps: string[];
}

export const MOCK_EVALUATIONS: ProjectEvaluationItem[] = [
  {
    id: 'smart-road-vision',
    name: 'Smart Road Vision',
    type: 'Software',
    domain: 'AI & Computer Vision / Smart Mobility',
    tagline: 'Autonomous road surface anomaly detection & predictive maintenance',
    overallScore: 84.7,
    confidence: 89,
    status: 'Completed',
    originalityScore: 68,
    impactScore: 92,
    technicalScore: 87,
    presentationScore: 76,
    demoScore: 84,
    verdict: 'Strong Project',
    team: 'VisionGrid Labs (MIT / Stanford cohort)',
    updatedAt: '12 minutes ago',
    submittedAt: '2026-09-02',
    problemStatement: 'Municipalities waste $4.2B annually repairing potholes reactively after vehicular damage or severe accidents have already transpired.',
    solutionDescription: 'Edge-deployed computer vision model running on municipal transit fleet cameras to detect, classify, and geo-index asphalt degradation with millimeter precision before structural failure.',
    executiveSummary: 'Strong technical prototype addressing a significant real-world problem. High impact potential with demonstrated edge inference pipeline. Main vulnerability lies in dataset diversity across rainy/night conditions and missing third-party accuracy verification for the 95% detection claims.',
    evidenceCount: 42,
    claimsCount: 14,
    verifiedClaimsCount: 11,
    breakdown: [
      { category: 'Problem & Need', score: 91, weight: '15%', confidence: 93, evidenceCount: 6 },
      { category: 'Technical Quality', score: 87, weight: '20%', confidence: 90, evidenceCount: 12 },
      { category: 'Originality', score: 68, weight: '15%', confidence: 84, evidenceCount: 7 },
      { category: 'Social Impact', score: 92, weight: '15%', confidence: 91, evidenceCount: 5 },
      { category: 'Presentation', score: 76, weight: '10%', confidence: 88, evidenceCount: 4 },
      { category: 'Demo Quality', score: 84, weight: '10%', confidence: 86, evidenceCount: 3 },
      { category: 'Feasibility', score: 79, weight: '10%', confidence: 82, evidenceCount: 3 },
      { category: 'Future Potential', score: 94, weight: '5%', confidence: 89, evidenceCount: 2 },
    ],
    strengths: [
      'High-throughput edge inference pipeline running TensorRT INT8 quantization at 54 FPS on Jetson Orin Nano.',
      'Documented social impact with clear $4.2B market relevance and municipal pilot readiness.',
      'Resilient geo-spatial indexing architecture with sub-meter GPS trajectory smoothing.'
    ],
    weaknesses: [
      'High similarity (32%) to open-source YOLO-based road damage benchmarks (RDD2022 dataset).',
      'Speaking pace during architecture slides exceeded 175 wpm with 14 filler pauses detected.',
      'Third-party benchmark confirmation missing for the claimed 95.4% mAP50 precision.'
    ],
    risks: [
      'Edge camera lens occlusion under monsoon rainfall or heavy snow accumulation.',
      'Municipal procurement cycles are notoriously long (12-18 months) without grant underwriting.'
    ],
    nextSteps: [
      'Initiate an independent blind validation run on the Canadian cold-weather road dataset.',
      'Refine pitch pacing to dedicate at least 3 minutes to edge deployment architecture.',
      'Deploy OTA model update mechanism before starting the city bus pilot.'
    ]
  },
  {
    id: 'agrosense',
    name: 'AgroSense Autonomous Soil Rig',
    type: 'Hardware',
    domain: 'AgriTech / IoT Embedded Systems',
    tagline: 'Precision NPK multispectral sensing and automated micro-dosing',
    overallScore: 78.2,
    confidence: 84,
    status: 'Needs Review',
    originalityScore: 74,
    impactScore: 88,
    technicalScore: 73,
    presentationScore: 82,
    demoScore: 76,
    verdict: 'Promising',
    team: 'TerraLogic Agronomics',
    updatedAt: '2 hours ago',
    submittedAt: '2026-08-30',
    problemStatement: 'Excess nitrogen fertilizer runoff pollutes groundwater and accounts for 18% of avoidable commercial farm operational expenses.',
    solutionDescription: 'Autonomous solar-powered field probe equipped with ISFET chemical sensors and LoRaWAN long-range mesh radio transmitting root-zone telemetry every 15 minutes.',
    executiveSummary: 'Promising hardware prototype demonstrating custom 4-layer PCB design and solar power harvesting. Needs review regarding thermal calibration in high humidity soil and field test IP protection.',
    evidenceCount: 36,
    claimsCount: 11,
    verifiedClaimsCount: 8,
    breakdown: [
      { category: 'Problem & Need', score: 88, weight: '15%', confidence: 89, evidenceCount: 5 },
      { category: 'Technical Quality', score: 73, weight: '20%', confidence: 81, evidenceCount: 9 },
      { category: 'Originality', score: 74, weight: '15%', confidence: 83, evidenceCount: 6 },
      { category: 'Social Impact', score: 88, weight: '15%', confidence: 88, evidenceCount: 4 },
      { category: 'Presentation', score: 82, weight: '10%', confidence: 85, evidenceCount: 4 },
      { category: 'Demo Quality', score: 76, weight: '10%', confidence: 80, evidenceCount: 3 },
      { category: 'Feasibility', score: 71, weight: '10%', confidence: 79, evidenceCount: 3 },
      { category: 'Future Potential', score: 84, weight: '5%', confidence: 82, evidenceCount: 2 },
    ],
    strengths: [
      'Custom low-noise ISFET analog front-end with galvanic ground isolation.',
      'Ultra-low sleep current measured at 18µA allowing 14-month battery autonomy.'
    ],
    weaknesses: [
      'Chemical sensor calibration drifts by ~4.8% per month in high salinity soils.',
      'Field casing lacks IP67 certification for flooded agricultural conditions.'
    ],
    risks: [
      'Sensor degradation from aggressive agricultural pesticide wash-down.'
    ],
    nextSteps: [
      'Implement auto-zeroing software calibration routine.',
      'Upgrade potting compound to polyurethane IP68 standard.'
    ]
  },
  {
    id: 'cybershield',
    name: 'CyberShield Zero-Trust Mesh',
    type: 'Software',
    domain: 'Cybersecurity / Distributed Systems',
    tagline: 'Kernel-level eBPF packet inspection with automated lateral movement defense',
    overallScore: 89.1,
    confidence: 92,
    status: 'Completed',
    originalityScore: 81,
    impactScore: 86,
    technicalScore: 94,
    presentationScore: 85,
    demoScore: 91,
    verdict: 'Exceptional',
    team: 'ZeroPoint Labs',
    updatedAt: '5 hours ago',
    submittedAt: '2026-09-01',
    problemStatement: 'Traditional perimeter security fails to prevent lateral traversal once an internal container or node is compromised.',
    solutionDescription: 'Linux eBPF resident monitor enforcing identity-authenticated mutual TLS microsegmentation at wire speed with zero context switches.',
    executiveSummary: 'Outstanding technical execution with production-grade eBPF probes and cryptographic proof of identity. Passed synthetic exploit injection test suite with 99.8% capture rate.',
    evidenceCount: 58,
    claimsCount: 16,
    verifiedClaimsCount: 15,
    breakdown: [
      { category: 'Problem & Need', score: 86, weight: '15%', confidence: 94, evidenceCount: 7 },
      { category: 'Technical Quality', score: 94, weight: '20%', confidence: 96, evidenceCount: 18 },
      { category: 'Originality', score: 81, weight: '15%', confidence: 89, evidenceCount: 8 },
      { category: 'Social Impact', score: 86, weight: '15%', confidence: 90, evidenceCount: 5 },
      { category: 'Presentation', score: 85, weight: '10%', confidence: 91, evidenceCount: 6 },
      { category: 'Demo Quality', score: 91, weight: '10%', confidence: 92, evidenceCount: 5 },
      { category: 'Feasibility', score: 90, weight: '10%', confidence: 89, evidenceCount: 5 },
      { category: 'Future Potential', score: 92, weight: '5%', confidence: 93, evidenceCount: 4 },
    ],
    strengths: [
      'Deterministic kernel-space filtering without user-space buffer duplication.',
      'Verified performance overhead under 1.2% on 10Gbps line rate.'
    ],
    weaknesses: [
      'Kernel dependency requires modern Linux 5.15+ kernel with BTF support enabled.'
    ],
    risks: [
      'Complex debugging workflows when interacting with legacy non-eBPF firewall rules.'
    ],
    nextSteps: [
      'Add support for Windows Server eBPF preview subsystem.'
    ]
  },
  {
    id: 'meditrack',
    name: 'MediTrack AI Clinical Triage',
    type: 'Software',
    domain: 'HealthTech / NLP & LLMs',
    tagline: 'Ambient clinical listening and automated emergency intake triaging',
    overallScore: 71.5,
    confidence: 78,
    status: 'Analyzing',
    originalityScore: 59,
    impactScore: 94,
    technicalScore: 76,
    presentationScore: 69,
    demoScore: 64,
    verdict: 'Promising',
    team: 'NeuroHealth Consortium',
    updatedAt: 'Just now',
    submittedAt: '2026-09-04',
    problemStatement: 'Emergency room physician burnout and transcription bottlenecks cause dangerous diagnostic delay averages of 44 minutes.',
    solutionDescription: 'Multi-speaker acoustic beamforming microphone paired with fine-tuned BioMistral model producing structured HL7/FHIR intake records in real time.',
    executiveSummary: 'High societal impact and clear clinical necessity. Currently undergoing active multimodal transcription validation. Model hallucination safeguards need formal clinical review before pilot approval.',
    evidenceCount: 29,
    claimsCount: 12,
    verifiedClaimsCount: 7,
    breakdown: [
      { category: 'Problem & Need', score: 95, weight: '15%', confidence: 92, evidenceCount: 5 },
      { category: 'Technical Quality', score: 76, weight: '20%', confidence: 77, evidenceCount: 7 },
      { category: 'Originality', score: 59, weight: '15%', confidence: 74, evidenceCount: 4 },
      { category: 'Social Impact', score: 94, weight: '15%', confidence: 95, evidenceCount: 6 },
      { category: 'Presentation', score: 69, weight: '10%', confidence: 72, evidenceCount: 2 },
      { category: 'Demo Quality', score: 64, weight: '10%', confidence: 70, evidenceCount: 2 },
      { category: 'Feasibility', score: 68, weight: '10%', confidence: 75, evidenceCount: 2 },
      { category: 'Future Potential', score: 88, weight: '5%', confidence: 80, evidenceCount: 1 },
    ],
    strengths: [
      'Standardized FHIR JSON output schema compliant with Epic Systems EHR APIs.'
    ],
    weaknesses: [
      'Susceptible to background noise in chaotic emergency room environments.'
    ],
    risks: [
      'Strict HIPAA compliance and patient voice biometric privacy regulations.'
    ],
    nextSteps: [
      'Introduce active acoustic noise cancellation array.'
    ]
  },
  {
    id: 'solarguard',
    name: 'SolarGuard Inverter Telemetry',
    type: 'Hardware',
    domain: 'CleanTech / Power Electronics',
    tagline: 'GaN-based microinverter with real-time arc-fault AI shutdown',
    overallScore: 86.4,
    confidence: 91,
    status: 'Completed',
    originalityScore: 82,
    impactScore: 89,
    technicalScore: 88,
    presentationScore: 83,
    demoScore: 87,
    verdict: 'Strong Project',
    team: 'Helios Power Dynamics',
    updatedAt: 'Yesterday',
    submittedAt: '2026-08-28',
    problemStatement: 'DC arc faults in residential photovoltaic installations cause over 800 structural fires annually across North America.',
    solutionDescription: 'High-speed 100MHz current waveform analyzer executing edge 1D-CNN to disconnect solar string within 1.8 milliseconds of arc detection.',
    executiveSummary: 'Rigorous hardware design verified against UL1699B safety standards. Outstanding 1.8ms cutoff latency demonstrated in high-voltage spark gap test setup.',
    evidenceCount: 48,
    claimsCount: 13,
    verifiedClaimsCount: 12,
    breakdown: [
      { category: 'Problem & Need', score: 89, weight: '15%', confidence: 93, evidenceCount: 6 },
      { category: 'Technical Quality', score: 88, weight: '20%', confidence: 92, evidenceCount: 14 },
      { category: 'Originality', score: 82, weight: '15%', confidence: 88, evidenceCount: 7 },
      { category: 'Social Impact', score: 89, weight: '15%', confidence: 91, evidenceCount: 5 },
      { category: 'Presentation', score: 83, weight: '10%', confidence: 89, evidenceCount: 5 },
      { category: 'Demo Quality', score: 87, weight: '10%', confidence: 91, evidenceCount: 5 },
      { category: 'Feasibility', score: 85, weight: '10%', confidence: 87, evidenceCount: 4 },
      { category: 'Future Potential', score: 90, weight: '5%', confidence: 92, evidenceCount: 2 },
    ],
    strengths: [
      'Sub-2ms solid-state MOSFET disconnect prevents dangerous plasma escalation.',
      'Galvanically isolated PCB layout verified up to 1,500V DC.'
    ],
    weaknesses: [
      'Silicon carbide switch costs currently 30% higher than traditional relays.'
    ],
    risks: [
      'Supply chain single-sourcing for wide-bandgap GaN power stages.'
    ],
    nextSteps: [
      'Apply for certified UL1699B lab stamp.'
    ]
  },
  {
    id: 'aeropulse-px4',
    name: 'AeroPulse PX-4 Drone Engine',
    type: 'Hardware',
    domain: 'Aerospace / Autonomous Robotics',
    tagline: 'Hybrid heavy-lift propulsion with dual-core lockstep failover',
    overallScore: 84.2,
    confidence: 89,
    status: 'Completed',
    originalityScore: 78,
    impactScore: 85,
    technicalScore: 91,
    presentationScore: 81,
    demoScore: 82,
    verdict: 'Strong Project',
    team: 'AeroPulse Flight Technologies',
    updatedAt: '3 days ago',
    submittedAt: '2026-08-25',
    problemStatement: 'Commercial inspection drones lack flight endurance beyond 35 minutes and lack deterministic hardware failover against rotor ESC lockup.',
    solutionDescription: 'Compact multi-fuel turbine generator feeding direct-drive brushless motors controlled via ASIL-D lockstep ARM microcontrollers.',
    executiveSummary: 'Substantial engineering depth shown across mechanical balancing and deterministic firmware. Demonstrated 148-minute hover flight test.',
    evidenceCount: 52,
    claimsCount: 15,
    verifiedClaimsCount: 13,
    breakdown: [
      { category: 'Problem & Need', score: 84, weight: '15%', confidence: 90, evidenceCount: 5 },
      { category: 'Technical Quality', score: 91, weight: '20%', confidence: 94, evidenceCount: 15 },
      { category: 'Originality', score: 78, weight: '15%', confidence: 86, evidenceCount: 8 },
      { category: 'Social Impact', score: 85, weight: '15%', confidence: 87, evidenceCount: 6 },
      { category: 'Presentation', score: 81, weight: '10%', confidence: 88, evidenceCount: 4 },
      { category: 'Demo Quality', score: 82, weight: '10%', confidence: 85, evidenceCount: 5 },
      { category: 'Feasibility', score: 80, weight: '10%', confidence: 84, evidenceCount: 5 },
      { category: 'Future Potential', score: 88, weight: '5%', confidence: 89, evidenceCount: 4 },
    ],
    strengths: [
      'Fault-tolerant dual-bus CAN-FD powertrain communication.',
      'Documented 148-minute continuous tethered flight bench run.'
    ],
    weaknesses: [
      'Acoustic noise signature measures 78 dBA at 10m altitude.'
    ],
    risks: [
      'High thermal dissipation requiring active oil-cooling loop.'
    ],
    nextSteps: [
      'Prototype carbon-composite acoustic shroud.'
    ]
  }
];

export const DASHBOARD_STATS = {
  totalEvaluations: 142,
  evaluationsTrend: '+12% this month',
  averageScore: 82.4,
  scoreTrend: '+2.3 pts vs Q2',
  projectsAnalyzed: {
    total: 142,
    software: 98,
    hardware: 44,
  },
  claimsVerified: {
    total: 1280,
    verifiedPercentage: 91,
    flagged: 114,
  },
  averageConfidence: 86,
};

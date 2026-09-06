import type { 
  AIJuryScorecard, 
  WeightPreset, 
  JuryVerdictLevel 
} from '../types/aiJuryScoring';

export const VERDICT_THRESHOLDS: Array<{
  level: JuryVerdictLevel;
  minScore: number;
  maxScore: number;
  label: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  glowColor: string;
  description: string;
}> = [
  {
    level: 'Exceptional',
    minScore: 90,
    maxScore: 100,
    label: 'Exceptional (Tier 1 Consensus)',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-400',
    textColor: 'text-emerald-300',
    glowColor: 'shadow-[0_0_20px_rgba(52,211,153,0.35)]',
    description: 'Breakthrough work meeting commercial deployment or peer-reviewed publication standards with unassailable empirical verification.'
  },
  {
    level: 'Strong',
    minScore: 80,
    maxScore: 89,
    label: 'Strong (Tier 2 Recommended)',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-400',
    textColor: 'text-cyan-300',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    description: 'High-caliber execution with robust technical grounding, proven novelty, and clear utility, subject to targeted hardware/software optimizations.'
  },
  {
    level: 'Promising',
    minScore: 70,
    maxScore: 79,
    label: 'Promising (Tier 3 Incubation)',
    badgeBg: 'bg-blue-950/80',
    badgeBorder: 'border-blue-400',
    textColor: 'text-blue-300',
    glowColor: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    description: 'Solid foundational concept with demonstrable promise, but requiring substantial remediation in live reliability or claim verification.'
  },
  {
    level: 'Needs Improvement',
    minScore: 50,
    maxScore: 69,
    label: 'Needs Improvement (Tier 4 Revision)',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-400',
    textColor: 'text-amber-300',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    description: 'Significant gaps observed between oral claims and demonstrated functionality, or high architectural/failure vulnerabilities.'
  },
  {
    level: 'Weak',
    minScore: 0,
    maxScore: 49,
    label: 'Weak (Tier 5 Critical Non-Viable)',
    badgeBg: 'bg-rose-950/80',
    badgeBorder: 'border-rose-400',
    textColor: 'text-rose-300',
    glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    description: 'Unverifiable claims, irreproducible demonstrations, severe safety or IP infringements, or lack of discernible original engineering.'
  }
];

export const WEIGHT_PRESETS: WeightPreset[] = [
  {
    id: 'standard-academic',
    name: 'Standard Academic Defense',
    description: 'Balanced rubric standard for Master’s/Doctoral engineering juries with equal emphasis on theory and demonstration.',
    weights: {
      'problem-need': 10,
      'technical-quality': 20,
      'innovation-originality': 15,
      'social-impact': 10,
      'presentation': 10,
      'demonstration-quality': 15,
      'feasibility-scalability': 10,
      'future-potential': 10
    }
  },
  {
    id: 'venture-commercial',
    name: 'Venture & Commercial Impact',
    description: 'Prioritizes immediate market problem, social impact, unit economics, and production feasibility.',
    weights: {
      'problem-need': 20,
      'technical-quality': 15,
      'innovation-originality': 10,
      'social-impact': 15,
      'presentation': 10,
      'demonstration-quality': 10,
      'feasibility-scalability': 15,
      'future-potential': 5
    }
  },
  {
    id: 'engineering-rigor',
    name: 'Technical & Engineering Rigor',
    description: 'Heavy emphasis on firmware/software quality, live demo proof, and mathematical novelty.',
    weights: {
      'problem-need': 5,
      'technical-quality': 30,
      'innovation-originality': 20,
      'social-impact': 5,
      'presentation': 5,
      'demonstration-quality': 20,
      'feasibility-scalability': 10,
      'future-potential': 5
    }
  },
  {
    id: 'hackathon-showcase',
    name: 'Live Demonstration Showcase',
    description: 'Focuses heavily on live functional proof, presentation clarity, and novelty.',
    weights: {
      'problem-need': 10,
      'technical-quality': 15,
      'innovation-originality': 15,
      'social-impact': 10,
      'presentation': 20,
      'demonstration-quality': 20,
      'feasibility-scalability': 5,
      'future-potential': 5
    }
  }
];

export const mockHardwareScorecard: AIJuryScorecard = {
  projectId: 'PRJ-HW-9042',
  projectName: 'AeroPulse PX-4 Subterranean Drone',
  projectTrack: 'hardware',
  tagline: 'Autonomous GPS-Denied Subterranean UAV with EKF Sensor Fusion & Resilient Mesh Telemetry',
  evaluatedAt: '2026-09-04T18:45:00Z',
  evaluationEngineVersion: 'ProjectX-Ray Consensus Engine v4.2.1-prod',
  totalEvidenceCount: 42,
  overallScore: 83,
  verdictLevel: 'Strong',
  verdictHeadline: 'Strong Engineering Validation with Isolated ESC Desync Vulnerability',
  verdictSummary: 'The AeroPulse PX-4 represents an accomplished hardware thesis. The jury confirms genuine sensor fusion innovation and compelling social utility for cave search-and-rescue. However, final commercial clearance is conditioned upon resolving an observed 14.8A transient peak that triggered an ESC timing desync during the 07:18 demo maneuver.',
  juryRecommendation: 'Award Tier-2 Honors. Allocate $15,000 Bridge Grant for ESC commutation firmware refactor and field tunnel testing before mining deployment.',
  
  dimensions: [
    {
      id: 'problem-need',
      name: 'Problem & Need',
      shortName: 'Problem',
      score: 88,
      weight: 10,
      confidence: 94,
      evidenceCount: 5,
      explanation: 'Clear empirical verification of real-world need: 48 subterranean search accidents annually in unmapped boreholes without GPS coverage. Problem definition is backed by National Mine Safety Association incident logs.',
      subDimensions: [
        { name: 'Problem Definition Rigor', score: 92, note: 'Explicit focus on subterranean GPS denial and visual dust obscuration.' },
        { name: 'Target Beneficiary Identification', score: 86, note: 'Direct utility for rescue miners and geotechnical surveyors.' },
        { name: 'Market Void / Severity', score: 87, note: 'Existing commercial drones exceed 2.4kg and lose link at >30m underground.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-PN-01',
          title: 'NMSA 2024 Cave In Report',
          category: 'telemetry',
          source: 'Gov Safety Archive',
          timestampOrRef: 'Ref: #NMSA-2024-88',
          summary: 'Identified 73% of cave fatalities attributable to delayed sensor recon.',
          reliabilityScore: 96
        },
        {
          id: 'EV-PN-02',
          title: 'Slide 3 Problem Context Video Frame',
          category: 'video-timestamp',
          source: 'Presentation Cam 1',
          timestampOrRef: '02:14 - 02:45',
          summary: 'Presenter articulates borehole entrapment dynamics without reliance on vague generalizations.',
          reliabilityScore: 92
        }
      ],
      jurorCritique: 'Dr. Vance: Problem statement is among the cleanest submitted this cycle; avoided buzzword bingo and anchored directly on borehole acoustics.',
      primaryStrength: 'Defines an uncontested, life-critical operational domain with quantitative baseline metrics.',
      primaryRisk: 'Assumes rescue teams have standardized 433MHz relay towers on site.'
    },
    {
      id: 'technical-quality',
      name: 'Technical Quality',
      shortName: 'Tech Quality',
      score: 84,
      weight: 20,
      confidence: 96,
      evidenceCount: 11,
      explanation: 'Exceptional STM32H7 dual-core architecture and custom 6-layer PCB layout with dedicated analog shielding. EKF sensor fusion pipeline operates reliably at 400Hz with <0.04m drift over 12 minutes.',
      subDimensions: [
        { name: 'Architecture & Circuit Topology', score: 89, note: 'Clean impedance matching and differential routing on CAN/SPI lines.' },
        { name: 'Firmware & Algorithm Real-time Guarantee', score: 86, note: 'Hard real-time FreeRTOS tasks meet 2.5ms loop deadline.' },
        { name: 'Thermal & Power Regulation', score: 77, note: 'Buck converter thermals reach 68°C under continuous 14A hover.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-TQ-01',
          title: 'Oscilloscope Waveform Rig Dump',
          category: 'telemetry',
          source: 'Bench Rig Rigol DS1054Z',
          timestampOrRef: 'Channel 1-2 (SPI CLK)',
          summary: 'Measured jitter of 4.2ns on 40MHz SPI bus; excellent signal integrity.',
          reliabilityScore: 98
        },
        {
          id: 'EV-TQ-02',
          title: 'GitHub Commit e8c91a0 Firmware',
          category: 'code-audit',
          source: 'Git Repo: /src/flight_ctrl/ekf.c',
          timestampOrRef: 'Commit e8c91a0',
          summary: 'Static analysis shows zero unbounded loops and MISRA-C 2012 compliance score of 91.4%.',
          reliabilityScore: 95
        }
      ],
      jurorCritique: 'Marcus Chen: Firmware is disciplined. The EKF state matrices are numerically conditioned against singularity; remarkable for a capstone project.',
      primaryStrength: 'Robust dual-core task segregation between 400Hz flight-dynamics loop and LoRa telemetry serialization.',
      primaryRisk: 'ESC commutation timing margins are vulnerable to rapid throttle pulses.'
    },
    {
      id: 'innovation-originality',
      name: 'Innovation & Originality',
      shortName: 'Innovation',
      score: 86,
      weight: 15,
      confidence: 91,
      evidenceCount: 7,
      explanation: 'Originality investigation reveals 78% net novelty. While standard quadrotor frames and ArduPilot forks exist, the dual-band ToF acoustic LiDAR hybrid fusion is unique to this thesis.',
      subDimensions: [
        { name: 'Conceptual Uniqueness', score: 88, note: 'Novel ultrasonic-optical echo integration in heavy dust environments.' },
        { name: 'Differentiation from Prior Art', score: 85, note: 'Clear delta over DJI Matrice 300 and standard PX4 flow modules.' },
        { name: 'Intellectual Property Potential', score: 84, note: 'Acoustic ranging array packaging method is patentable as Utility Model.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-IO-01',
          title: 'USPTO Patent Search Cross-Ref',
          category: 'patent-search',
          source: 'USPTO / Google Patents',
          timestampOrRef: 'Ref: US20210349192A1',
          summary: 'Patent search confirms no prior assignees for hybrid piezo-LiDAR pulse intercalation.',
          reliabilityScore: 94
        }
      ],
      jurorCritique: 'Dr. Finch: Genuine inventive step in the acoustic sensor interleaving. The authors avoided merely repackaging off-the-shelf ArduPilot boards.',
      primaryStrength: 'Novel sensor hybridization overcomes optical LiDAR blackout in smoke and coal dust.',
      primaryRisk: 'Piezo transducer resonant frequency shifts by 4% under extreme cold temperatures.'
    },
    {
      id: 'social-impact',
      name: 'Social Impact',
      shortName: 'Social Impact',
      score: 90,
      weight: 10,
      confidence: 89,
      evidenceCount: 4,
      explanation: 'High humanitarian value: reduces human first-responder hazard in structural collapses and hazardous gas-leak environments. Potential to directly prevent search-and-rescue fatalities.',
      subDimensions: [
        { name: 'Human Safety Enhancement', score: 94, note: 'Eliminates need for human scout entry into unstable mine shafts.' },
        { name: 'Accessibility & Community Benefit', score: 87, note: 'Low BOM cost ($284) enables volunteer rescue teams to build units.' },
        { name: 'Environmental & Safety Compliance', score: 89, note: 'Zero combustible sparks; conformal coating prevents dust ignition.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SI-01',
          title: 'Red Cross First Responder Field Trial Log',
          category: 'telemetry',
          source: 'Field Log #RC-09',
          timestampOrRef: 'Test Run 04',
          summary: 'Reduced initial hazard assessment time from 42 mins to 7 mins 14 secs.',
          reliabilityScore: 92
        }
      ],
      jurorCritique: 'Elena Rostova: The humanitarian utility is undeniable. The low Bill-of-Materials puts this within reach of underserved emergency squads.',
      primaryStrength: 'Direct lifesaving utility verified with real municipal disaster response squads.',
      primaryRisk: 'Requires battery disposal safeguards in ecologically fragile cavern systems.'
    },
    {
      id: 'presentation',
      name: 'Presentation',
      shortName: 'Presentation',
      score: 82,
      weight: 10,
      confidence: 93,
      evidenceCount: 6,
      explanation: 'Articulate delivery with 142 WPM speaking cadence, high vocal intelligibility (18.4 dB SNR), and 78% eye contact. Explanation of Kalman equations was exceptionally lucid.',
      subDimensions: [
        { name: 'Speech Clarity & Cadence', score: 86, note: 'Consistent pace within 130-155 WPM sweet spot; 14 filler words noted.' },
        { name: 'Visual Deck Design & Structure', score: 81, note: 'Architecture slides were clear; schematic slide 8 had small font.' },
        { name: 'Q&A Responsiveness & Composure', score: 79, note: 'Addressed motor thermal query honestly without evasiveness.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-PR-01',
          title: 'Acoustic SNR & Intelligibility Log',
          category: 'speech-metric',
          source: 'Audio Telemetry Channel',
          timestampOrRef: 'Session 00:00 - 09:42',
          summary: 'Mean acoustic SNR of 18.4 dB; pitch variance remained within nominal calm range (124-142 Hz).',
          reliabilityScore: 95
        }
      ],
      jurorCritique: 'Elena Rostova: Presenter maintained composure even when questioned about the ESC desync. Narrative arc was structured logically from need to architecture.',
      primaryStrength: 'Crisp mathematical clarity when walking through state-space covariance updates.',
      primaryRisk: 'Slide 8 font size fell below 10pt for the pinout table.'
    },
    {
      id: 'demonstration-quality',
      name: 'Demonstration Quality',
      shortName: 'Demo Quality',
      score: 74,
      weight: 15,
      confidence: 98,
      evidenceCount: 9,
      explanation: '3 of 5 core features successfully demonstrated in live bench cage (autonomous takeoff, lidar pointcloud mesh, and loss-of-signal loiter). However, rapid yaw maneuver at 07:18 caused Motor 3 ESC timing desync.',
      subDimensions: [
        { name: 'Functional Execution Completeness', score: 76, note: '72% feature verification rate achieved under rigorous testing.' },
        { name: 'Edge Case & Fault Handling', score: 68, note: 'Watchdog timer prevented crash but flight state was compromised for 1.8s.' },
        { name: 'Live Telemetry Transparency', score: 79, note: 'Full raw serial telemetry stream remained visible to jury during anomaly.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-DQ-01',
          title: 'ESC Telemetry Log Dump (07:18)',
          category: 'log-dump',
          source: 'UART Log Buffer',
          timestampOrRef: '07:18.420',
          summary: 'ESC_ERR_DESYNC_04: Back-EMF zero-crossing missed during 14.8A transient pulse.',
          reliabilityScore: 99
        }
      ],
      jurorCritique: 'Marcus Chen: The demo was genuine and unedited. The ESC desync is a real hardware problem, but their fail-safe loiter executed as designed.',
      primaryStrength: 'Zero simulated or prerecorded faking; absolute evidentiary integrity.',
      primaryRisk: 'ESC commutation firmware requires DShot600 timing buffer expansion.'
    },
    {
      id: 'feasibility-scalability',
      name: 'Feasibility & Scalability',
      shortName: 'Feasibility',
      score: 76,
      weight: 10,
      confidence: 88,
      evidenceCount: 5,
      explanation: 'BOM is well budgeted at $284/unit with off-the-shelf components. Prototype readiness is at TRL 5 (tested in relevant tunnel environment). Scale manufacturing will require injection-molded carbon-nylon ducting.',
      subDimensions: [
        { name: 'Bill of Materials & Unit Economics', score: 85, note: '$284 BOM compares favorably against $4,200 commercial alternatives.' },
        { name: 'Production & Manufacturing Readiness', score: 71, note: '3D printed frame takes 14 hours per chassis; needs tooling.' },
        { name: 'Supply Chain Component Sourcing', score: 73, note: 'VL53L5CX ToF sensor has occasional lead time spikes.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-FS-01',
          title: 'BOM Cost Breakdown Spreadsheet',
          category: 'code-audit',
          source: 'Hardware Specs Folder',
          timestampOrRef: 'Doc: AeroPulse_BOM_v2.csv',
          summary: 'Component pricing confirmed across DigiKey and Mouser wholesale quotes.',
          reliabilityScore: 92
        }
      ],
      jurorCritique: 'Dr. Vance: Feasible for batch production of 50-100 units. Scaling to 1,000+ units requires moving away from 3D printing to injection tooling.',
      primaryStrength: 'High component commonality with standard drone supply chains.',
      primaryRisk: 'Frame durability under high-velocity cavern rock collisions requires carbon fiber reinforcement.'
    },
    {
      id: 'future-potential',
      name: 'Future Potential',
      shortName: 'Future Potential',
      score: 85,
      weight: 10,
      confidence: 86,
      evidenceCount: 4,
      explanation: 'Compelling roadmap from single drone to coordinated multi-agent subterranean swarm with collaborative SLAM. Research grant applicability is high with DARPA SubT follow-up.',
      subDimensions: [
        { name: 'Swarm / Multi-Agent Extensibility', score: 88, note: 'Mesh radio protocol already allocates 6-byte node addressing.' },
        { name: 'Academic & Commercial Spinout Viability', score: 84, note: 'High interest from mining inspection consultancies.' },
        { name: 'Technological Moat Defensibility', score: 82, note: 'Proprietary calibration algorithm for thermal drift compensation.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-FP-01',
          title: 'Multi-Agent Mesh Protocol RFC',
          category: 'code-audit',
          source: 'Docs / Architecture',
          timestampOrRef: 'Section 4.1 Swarm Relay',
          summary: 'Specifies decentralized gossip protocol for map tile sharing.',
          reliabilityScore: 90
        }
      ],
      jurorCritique: 'Dr. Finch: The swarm roadmap is technically grounded in existing radio packet budgets rather than science fiction hand-waving.',
      primaryStrength: 'Clean modular radio interface allows dropping in satellite or UWB transceivers.',
      primaryRisk: 'Collaborative SLAM will require an onboard companion computer (e.g. Raspberry Pi CM4), increasing weight.'
    }
  ],

  strongestArea: {
    dimensionId: 'social-impact',
    name: 'Social Impact',
    score: 90,
    weightedContribution: 9.0,
    reason: 'Compelling humanitarian life-safety application in search-and-rescue with verified municipal response partnership and accessible BOM pricing.'
  },
  weakestArea: {
    dimensionId: 'demonstration-quality',
    name: 'Demonstration Quality',
    score: 74,
    weightedContribution: 11.1,
    reason: 'Motor 3 ESC timing desync glitch at 07:18 during high-throttle dynamic yaw maneuver lowered functional execution score.'
  },

  risks: [
    {
      id: 'RSK-01',
      title: 'Motor 3 ESC Commutation Desync Under 14.8A Pulse',
      severity: 'High',
      dimensionId: 'demonstration-quality',
      impactArea: 'Flight Stability & Propulsion Safety',
      detectedFlags: ['Telemetry Error ESC_ERR_DESYNC_04', '1.8s attitude oscillation', 'Current spike to 14.84A'],
      suggestedMitigation: 'Upgrade to 32-bit BLHeli_32 ESCs with active back-EMF filtering and raise DShot commutation timing headroom by 25%.',
      evidenceTrace: 'UART log buffer at timestamp 07:18.420 / INA219 shunt sensor log'
    },
    {
      id: 'RSK-02',
      title: 'Buck Converter Thermal Saturation (68°C)',
      severity: 'Medium',
      dimensionId: 'technical-quality',
      impactArea: 'Electronic Reliability & Enclosure Temperature',
      detectedFlags: ['Thermal camera capture 68.2°C', 'Airflow restriction inside sealed fuselage'],
      suggestedMitigation: 'Install dual aluminum heat slug sinks coupled to propeller downwash ducting.',
      evidenceTrace: 'FLIR thermal frame #289 at 05:42 hover bench test'
    },
    {
      id: 'RSK-03',
      title: 'Ultrasonic Piezo Cold Drift at < 5°C',
      severity: 'Low',
      dimensionId: 'feasibility-scalability',
      impactArea: 'Subterranean Winter Operation',
      detectedFlags: ['Resonance shift +4.2%', 'Temperature compensation coefficient uncalibrated below 0°C'],
      suggestedMitigation: 'Implement lookup table based on onboard thermistor readings to dynamically tune excitation pulse frequency.',
      evidenceTrace: 'Environmental chamber test log #EC-02'
    }
  ],

  jurors: [
    {
      jurorId: 'JR-01',
      name: 'Dr. Evelyn Vance',
      role: 'Chief Technical Juror (Embedded Systems & Avionics)',
      institution: 'MIT Aerospace AI Laboratory',
      avatarColor: 'from-cyan-500 to-blue-600',
      voteScore: 85,
      stance: 'Endorse with Stipulations',
      keyQuote: '“The dual-core FreeRTOS architecture and state-space conditioning are doctoral caliber. Clean the ESC commutation timing jitter, and this is ready for real coal tunnels.”',
      coreCritique: 'The hardware electrical schematic and PCB isolation are genuinely impressive. The only hesitation is the ESC transient current handling, which can be remedied with a firmware buffer.'
    },
    {
      jurorId: 'JR-02',
      name: 'Marcus Chen',
      role: 'Field Deployment & Scalability Lead',
      institution: 'Global Rescue Robotics Initiative',
      avatarColor: 'from-emerald-500 to-teal-600',
      voteScore: 82,
      stance: 'Endorse with Stipulations',
      keyQuote: '“Most student drones smash into walls when dust clouds kick up. Watching AeroPulse transition seamlessly to ultrasonic acoustic ranging was a masterclass in resilient robotics.”',
      coreCritique: 'BOM pricing is realistic, but you cannot field 3D printed arms in collapsed rubble. Switch to molded carbon-polycarbonate before field deployment.'
    },
    {
      jurorId: 'JR-03',
      name: 'Dr. Alistair Finch',
      role: 'Originality & Academic Prior Art Examiner',
      institution: 'IEEE Robotics & Automation Society',
      avatarColor: 'from-purple-500 to-indigo-600',
      voteScore: 87,
      stance: 'Unanimous Endorsement',
      keyQuote: '“This is not an ArduPilot wrapper. The sensor interleaving algorithm represents a patentable contribution to GPS-denied state estimation.”',
      coreCritique: 'Novelty is validated. Prior art in patent databases was thoroughly distinguished. I recommend publication in IEEE ICRA.'
    },
    {
      jurorId: 'JR-04',
      name: 'Elena Rostova',
      role: 'Humanitarian Impact & Regulatory Auditor',
      institution: 'United Nations Disaster Assessment Network',
      avatarColor: 'from-rose-500 to-pink-600',
      voteScore: 80,
      stance: 'Conditional Approval',
      keyQuote: '“The humanitarian impact is the beating heart of this project. But if a drone fails in an active collapse, it becomes a secondary hazard. Fix the desync fail-safe.”',
      coreCritique: 'Commendable presentation clarity and ethical grounding. The team demonstrated poise under pressure during technical cross-examination.'
    }
  ]
};

export const mockSoftwareScorecard: AIJuryScorecard = {
  projectId: 'PRJ-SW-8812',
  projectName: 'QuantumKey TLS v1.3 Hybrid Engine',
  projectTrack: 'software',
  tagline: 'Post-Quantum Lattice Cryptography & Classical ECDH Hybrid Key Exchange for High-Throughput TLS Gateways',
  evaluatedAt: '2026-09-04T19:10:00Z',
  evaluationEngineVersion: 'ProjectX-Ray Consensus Engine v4.2.1-prod',
  totalEvidenceCount: 51,
  overallScore: 88,
  verdictLevel: 'Strong',
  verdictHeadline: 'High-Throughput Cryptographic Engine with Sub-Millisecond Handshake Latency',
  verdictSummary: 'The QuantumKey TLS v1.3 Hybrid Engine achieves exceptional cryptographic fidelity, executing Kyber-768 and X25519 hybrid exchanges at 4,850 handshakes/second with verified constant-time side-channel resistance. Minor latency spikes under 100k simulated concurrent handshakes present the only scalability constraint.',
  juryRecommendation: 'Award Tier-1 Honorable Distinction. Recommend for open-source incubation under Linux Foundation Post-Quantum Cryptography Alliance.',
  
  dimensions: [
    {
      id: 'problem-need',
      name: 'Problem & Need',
      shortName: 'Problem',
      score: 92,
      weight: 10,
      confidence: 96,
      evidenceCount: 6,
      explanation: 'Addresses the urgent "Harvest Now, Decrypt Later" threat vector facing financial and national infrastructure prior to Q-Day. Need is anchored in NIST Post-Quantum Transition Directives.',
      subDimensions: [
        { name: 'Threat Vector Urgency', score: 95, note: 'Direct mitigation against retroactive decryption of encrypted data.' },
        { name: 'Regulatory & Standard Alignment', score: 93, note: 'Strict adherence to NIST FIPS 203 (ML-KEM) recommendations.' },
        { name: 'Target Infrastructure Scope', score: 88, note: 'Immediate drop-in fit for NGINX, Envoy, and Envoy API gateways.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SW-PN-01',
          title: 'NIST Post-Quantum Transition Timeline',
          category: 'telemetry',
          source: 'NIST Special Publication 800-227',
          timestampOrRef: 'Section 3.2',
          summary: 'Mandates classical hybrid deployment across federal systems by 2028.',
          reliabilityScore: 99
        }
      ],
      jurorCritique: 'Dr. Finch: Problem scope is paramount. Unlike synthetic problems, quantum retroactive decryption is already occurring in global SIGINT networks.',
      primaryStrength: 'Direct adherence to NIST FIPS 203 standards without proprietary deviations.',
      primaryRisk: 'Enterprise migration timelines may lag behind algorithmic availability.'
    },
    {
      id: 'technical-quality',
      name: 'Technical Quality',
      shortName: 'Tech Quality',
      score: 89,
      weight: 20,
      confidence: 97,
      evidenceCount: 14,
      explanation: 'Implemented in pure Rust with AVX2 and NEON SIMD intrinsics. Achieved 4,850 handshakes/sec per core. Valgrind and Dudect tests confirm constant-time execution with zero cache timing leaks.',
      subDimensions: [
        { name: 'Code Quality & Rust Memory Safety', score: 94, note: 'Zero unsafe code blocks in core key-exchange modules.' },
        { name: 'Side-Channel Leakage Immunity', score: 91, note: 'Dudect statistical t-test p-value > 0.05 across 10M iterations.' },
        { name: 'SIMD Acceleration & Vectorization', score: 83, note: 'AVX2 vectorized NTT polynomial multiplication operates in 12.4µs.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SW-TQ-01',
          title: 'Dudect Side-Channel Benchmark Run',
          category: 'code-audit',
          source: 'Automated CI Pipeline #391',
          timestampOrRef: 'Commit f42c8e1',
          summary: 'Max t-statistic of 0.82 verifies constant-time polynomial decoding.',
          reliabilityScore: 98
        },
        {
          id: 'EV-SW-TQ-02',
          title: 'Flamegraph Profile Benchmark',
          category: 'telemetry',
          source: 'Criterion.rs Benchmark Suite',
          timestampOrRef: 'Handshake_v13_bench',
          summary: 'Kyber encapsulation consumed 38% CPU cycles; X25519 consumed 21%.',
          reliabilityScore: 97
        }
      ],
      jurorCritique: 'Dr. Vance: The memory safety model and constant-time rigor are world-class. Avoiding C bindings eliminated the usual OpenSSL buffer vulnerability surface.',
      primaryStrength: 'Pure Rust memory-safe implementation with verifiable constant-time mathematical routines.',
      primaryRisk: 'NTT polynomial multiplication uses AVX2; non-x86 fallback without NEON is 3.8x slower.'
    },
    {
      id: 'innovation-originality',
      name: 'Innovation & Originality',
      shortName: 'Innovation',
      score: 91,
      weight: 15,
      confidence: 93,
      evidenceCount: 8,
      explanation: 'Introduces a novel adaptive hybrid negotiator that dynamically scales lattice polynomial degrees based on network jitter and handshake MTU fragmentation boundaries.',
      subDimensions: [
        { name: 'Algorithmic Novelty', score: 93, note: 'Dynamic MTU fragment coalescing prevents packet drops on 1500-byte links.' },
        { name: 'Prior Art Differentiation', score: 90, note: 'Outperforms BoringSSL experimental branch by 18% in tail latency.' },
        { name: 'Open Standards Contribution', score: 90, note: 'Proposed RFC draft submitted to IETF TLS Working Group.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SW-IO-01',
          title: 'IETF Draft Submission Confirmation',
          category: 'code-audit',
          source: 'IETF Datatracker',
          timestampOrRef: 'draft-quantum-hybrid-mtu-01',
          summary: 'Draft accepted for discussion in TLS WG queue.',
          reliabilityScore: 95
        }
      ],
      jurorCritique: 'Dr. Finch: The MTU fragmentation avoidance mechanism is a genuinely innovative contribution to practical post-quantum deployment.',
      primaryStrength: 'Solves the notorious TCP fragmentation penalty inherent to post-quantum public keys.',
      primaryRisk: 'Adoption depends on standardization adoption by major browser vendors.'
    },
    {
      id: 'social-impact',
      name: 'Social Impact',
      shortName: 'Social Impact',
      score: 84,
      weight: 10,
      confidence: 90,
      evidenceCount: 5,
      explanation: 'Secures critical public infrastructure including healthcare records, public key registries, and electrical grid telemetry against catastrophic future decryption.',
      subDimensions: [
        { name: 'Critical Infrastructure Protection', score: 90, note: 'Protects hospital telemetry and power grid SCADA links.' },
        { name: 'Privacy Preservation', score: 88, note: 'Preserves long-term citizen confidentiality against surveillance.' },
        { name: 'Open Source Accessibility', score: 74, note: 'Apache-2.0 license facilitates unrestricted adoption.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SW-SI-01',
          title: 'Power Grid Telemetry Benchmark',
          category: 'telemetry',
          source: 'Simulated SCADA Gateway Testbed',
          timestampOrRef: 'Test Run IEEE-14-Bus',
          summary: 'Zero dropped packets across 48-hour continuous simulated grid sync.',
          reliabilityScore: 92
        }
      ],
      jurorCritique: 'Elena Rostova: Protecting long-term civilian medical records from retrospective exposure is a vital societal necessity.',
      primaryStrength: 'Preserves citizen privacy decades into the future.',
      primaryRisk: 'Cryptographic policy enforcement requires complex sysadmin configuration.'
    },
    {
      id: 'presentation',
      name: 'Presentation',
      shortName: 'Presentation',
      score: 86,
      weight: 10,
      confidence: 94,
      evidenceCount: 6,
      explanation: 'Exemplary technical articulation. Presenter explained complex ring-learning-with-errors (RLWE) mathematics using intuitive geometric lattices with 88% confidence index.',
      subDimensions: [
        { name: 'Theoretical Concept Translation', score: 92, note: 'Made lattice vector reduction comprehensible to multidisciplinary jury.' },
        { name: 'Deck & Architecture Visuals', score: 85, note: 'Handshake packet sequence diagrams were immaculate.' },
        { name: 'Audience & Jury Defense Handling', score: 82, note: 'Handled side-channel query with instant Dudect data invocation.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SW-PR-01',
          title: 'Audio Spectrum & Gaze Telemetry',
          category: 'speech-metric',
          source: 'Session Analytics Recording',
          timestampOrRef: '00:00 - 11:20',
          summary: 'Pacing held steady at 138 WPM; zero defensive gestures during cross-exam.',
          reliabilityScore: 96
        }
      ],
      jurorCritique: 'Elena Rostova: The presenter displayed profound technical mastery. Answering questions by referencing specific line numbers in their open PR won over the room.',
      primaryStrength: 'Masterful pedagogical decomposition of complex lattice algebra.',
      primaryRisk: 'Spent slightly too long on historical RSA factoring background in opening 2 minutes.'
    },
    {
      id: 'demonstration-quality',
      name: 'Demonstration Quality',
      shortName: 'Demo Quality',
      score: 82,
      weight: 15,
      confidence: 95,
      evidenceCount: 8,
      explanation: 'Live load test streamed 10,000 parallel TLS handshakes through local gateway. Handshake latency verified at 0.84ms median. 1 slight socket exhaustion warning observed during 100k ramp.',
      subDimensions: [
        { name: 'Live Throughput Proof', score: 88, note: 'Real-time Grafana dashboard showed 4,850 handshakes/sec sustained.' },
        { name: 'Wireshark Packet Trace Verification', score: 86, note: 'Live packet capture proved Kyber-768 public key in ClientHello.' },
        { name: 'High-Concurrency Stress Resilience', score: 73, note: 'Socket file descriptor limit required manual ulimit raise during test.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SW-DQ-01',
          title: 'Wireshark TLS Packet Dump pcap',
          category: 'log-dump',
          source: 'Network Capture Interface lo0',
          timestampOrRef: 'Packet #48102',
          summary: 'Verified TLS 1.3 KeyShare extension with Group ID 0x6399 (X25519Kyber768Draft00).',
          reliabilityScore: 99
        }
      ],
      jurorCritique: 'Marcus Chen: The Wireshark packet inspection was undeniable evidence. Seeing the raw bytes in the TLS ClientHello verified real implementation.',
      primaryStrength: 'End-to-end cryptographic verification verified via independent packet capture tools.',
      primaryRisk: 'OS file descriptor tuning needed for extreme concurrency loads.'
    },
    {
      id: 'feasibility-scalability',
      name: 'Feasibility & Scalability',
      shortName: 'Feasibility',
      score: 88,
      weight: 10,
      confidence: 92,
      evidenceCount: 6,
      explanation: 'Production ready: compiled as a static library with zero external runtime dependencies. NGINX dynamic module provided with one-line configuration drop-in.',
      subDimensions: [
        { name: 'Drop-in Infrastructure Compatibility', score: 92, note: 'Replaces OpenSSL libssl/libcrypto with ABI-compatible shim.' },
        { name: 'Memory Footprint Under Load', score: 89, note: 'Resident set size remained under 42MB at 10,000 active sessions.' },
        { name: 'Cloud & Container Readiness', score: 83, note: 'Docker scratch container compiles to tiny 8.4MB binary.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SW-FS-01',
          title: 'Docker Image Size & RSS Telemetry',
          category: 'code-audit',
          source: 'Docker Daemon Benchmark',
          timestampOrRef: 'Container: qkey-gateway:latest',
          summary: 'Verified 8.4MB multi-stage musl build with 41.8MB peak RSS.',
          reliabilityScore: 96
        }
      ],
      jurorCritique: 'Marcus Chen: The NGINX dynamic module integration makes enterprise adoption painless. You can drop this into existing reverse proxies in 5 minutes.',
      primaryStrength: 'Frictionless drop-in ABI compatibility with existing enterprise web gateways.',
      primaryRisk: 'Non-x86 architectures (e.g. legacy MIPS/RISC-V IoT) lack hardware acceleration.'
    },
    {
      id: 'future-potential',
      name: 'Future Potential',
      shortName: 'Future Potential',
      score: 90,
      weight: 10,
      confidence: 91,
      evidenceCount: 5,
      explanation: 'Poised to become the standard hybrid TLS engine for web servers. Roadmap includes support for Dilithium post-quantum digital signatures and hardware security module (HSM) offloading.',
      subDimensions: [
        { name: 'Signature Algorithm Roadmap (ML-DSA)', score: 91, note: 'Architecture allows plugging in Dilithium authentication without rewrite.' },
        { name: 'Ecosystem & Consortium Adoption', score: 90, note: 'Direct interest from OpenQuantumSafe consortium.' },
        { name: 'HSM & Hardware Offload Path', score: 89, note: 'Clear abstraction for PCIe cryptographic acceleration cards.' }
      ],
      evidenceReferences: [
        {
          id: 'EV-SW-FP-01',
          title: 'ML-DSA Dilithium Architecture Blueprint',
          category: 'code-audit',
          source: 'Docs / RFC / SignatureExtension.md',
          timestampOrRef: 'PR #42',
          summary: 'Specifies trait-based signer interface ready for FIPS 204 signature integration.',
          reliabilityScore: 94
        }
      ],
      jurorCritique: 'Dr. Vance: This project is positioned at the exact historical inflection point of global cybersecurity. The future ceiling is immense.',
      primaryStrength: 'Forward-compatible architecture accommodates both KEM encryption and DSA signatures.',
      primaryRisk: 'Future changes in NIST final parameter drafts could necessitate re-tuning constants.'
    }
  ],

  strongestArea: {
    dimensionId: 'problem-need',
    name: 'Problem & Need',
    score: 92,
    weightedContribution: 9.2,
    reason: 'Addresses the urgent post-quantum cryptographic transition required by global standards bodies to prevent retroactive data exploitation.'
  },
  weakestArea: {
    dimensionId: 'demonstration-quality',
    name: 'Demonstration Quality',
    score: 82,
    weightedContribution: 12.3,
    reason: 'Occasional file-descriptor socket exhaustion occurred during the extreme 100k concurrency stress ramp before ulimit adjustment.'
  },

  risks: [
    {
      id: 'RSK-SW-01',
      title: 'OS Socket File Descriptor Exhaustion at >50k Concurrency',
      severity: 'Medium',
      dimensionId: 'demonstration-quality',
      impactArea: 'High-Throughput Gateway Reliability',
      detectedFlags: ['ulimit warning EMFILE (Too many open files)', 'Connection timeout on 0.4% of packets at 100k RPS'],
      suggestedMitigation: 'Bundle automated sysctl.conf kernel optimization scripts (fs.file-max and somaxconn) into the standard Helm chart deployment.',
      evidenceTrace: 'Live load testing stderr buffer at 09:12'
    },
    {
      id: 'RSK-SW-02',
      title: 'Performance Degradation on Non-Vectorized CPU Architectures',
      severity: 'Low',
      dimensionId: 'technical-quality',
      impactArea: 'Edge / Legacy Server Throughput',
      detectedFlags: ['Throughput falls from 4,850 to 1,280 handshakes/sec when AVX2 is disabled'],
      suggestedMitigation: 'Implement auto-vectorized scalar fallback routines using auto-loop unrolling macros.',
      evidenceTrace: 'Criterion benchmark suite run: --no-default-features'
    }
  ],

  jurors: [
    {
      jurorId: 'JR-01',
      name: 'Dr. Evelyn Vance',
      role: 'Chief Technical Juror (Cryptographic Systems)',
      institution: 'MIT Aerospace AI Laboratory',
      avatarColor: 'from-cyan-500 to-blue-600',
      voteScore: 90,
      stance: 'Unanimous Endorsement',
      keyQuote: '“Clean Rust, zero unsafe memory violations in core cryptographic paths, and constant-time execution confirmed by statistical t-tests. Outstanding work.”',
      coreCritique: 'The constant-time implementation is validated down to the assembly level. My highest rating of the semester.'
    },
    {
      jurorId: 'JR-02',
      name: 'Marcus Chen',
      role: 'Field Deployment & Scalability Lead',
      institution: 'Global Enterprise Infrastructure Guild',
      avatarColor: 'from-emerald-500 to-teal-600',
      voteScore: 87,
      stance: 'Unanimous Endorsement',
      keyQuote: '“The NGINX drop-in module was the clincher. Too many student projects write algorithms in a void; these authors packaged it for instant production drop-in.”',
      coreCritique: 'Ensure production deployment guidelines emphasize operating system socket limits.'
    },
    {
      jurorId: 'JR-03',
      name: 'Dr. Alistair Finch',
      role: 'Originality & Academic Prior Art Examiner',
      institution: 'IACR (International Association for Cryptologic Research)',
      avatarColor: 'from-purple-500 to-indigo-600',
      voteScore: 89,
      stance: 'Unanimous Endorsement',
      keyQuote: '“Their adaptive MTU fragment coalescing solves the biggest barrier to practical post-quantum TLS adoption. A clear patent and publication candidate.”',
      coreCritique: 'The algorithmic novelty is evident and mathematically sound. Ready for peer-reviewed archival publication.'
    },
    {
      jurorId: 'JR-04',
      name: 'Elena Rostova',
      role: 'Digital Human Rights & Privacy Auditor',
      institution: 'Electronic Frontier Research Foundation',
      avatarColor: 'from-rose-500 to-pink-600',
      voteScore: 86,
      stance: 'Unanimous Endorsement',
      keyQuote: '“Securing long-term citizen health and civil identity data against state-level retrospective decryption is a fundamental human rights imperative.”',
      coreCritique: 'I commend the open-source Apache 2.0 licensing, which guarantees that non-governmental and developing-nation servers can access this protection.'
    }
  ]
};

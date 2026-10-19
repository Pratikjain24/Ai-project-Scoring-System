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
  },
  {
    id: 'aquapurify-osmo',
    name: 'AquaPurify Autonomous Desal',
    type: 'Hardware',
    domain: 'CleanTech / Microfluidics',
    tagline: 'Solar-thermal membrane distillation with automated anti-fouling flush',
    overallScore: 88.5,
    confidence: 90,
    status: 'Completed',
    originalityScore: 84,
    impactScore: 93,
    technicalScore: 89,
    presentationScore: 84,
    demoScore: 86,
    verdict: 'Strong Project',
    team: 'AquaPurify Technologies',
    updatedAt: '4 days ago',
    submittedAt: '2026-08-20',
    problemStatement: 'Over 2.2B people lack safe potable drinking water in coastal arid regions where commercial reverse osmosis plants require prohibitive grid power.',
    solutionDescription: 'Photovoltaic-thermal driven membrane distillation module with ultrasonic transducer scale mitigation producing 450 liters/day off-grid.',
    executiveSummary: 'Compelling CleanTech prototype addressing global freshwater scarcity. Verified 99.4% salt rejection and 450L/day continuous flow on Mediterranean seawater.',
    evidenceCount: 44,
    claimsCount: 14,
    verifiedClaimsCount: 13,
    breakdown: [
      { category: 'Problem & Need', score: 96, weight: '15%', confidence: 94, evidenceCount: 6 },
      { category: 'Technical Quality', score: 89, weight: '20%', confidence: 92, evidenceCount: 12 },
      { category: 'Originality', score: 84, weight: '15%', confidence: 88, evidenceCount: 7 },
      { category: 'Social Impact', score: 93, weight: '15%', confidence: 95, evidenceCount: 6 },
      { category: 'Presentation', score: 84, weight: '10%', confidence: 86, evidenceCount: 4 },
      { category: 'Demo Quality', score: 86, weight: '10%', confidence: 89, evidenceCount: 4 },
      { category: 'Feasibility', score: 82, weight: '10%', confidence: 85, evidenceCount: 3 },
      { category: 'Future Potential', score: 90, weight: '5%', confidence: 91, evidenceCount: 2 },
    ],
    strengths: [
      'Self-cleaning ultrasonic anti-fouling piezoceramic transducer prevents mineral scaling.',
      'Demonstrated 450L/day off-grid yield using passive solar-thermal collectors.'
    ],
    weaknesses: [
      'Membrane hydrophobic coating degrades after 1,800 hours under heavy hydrocarbon sheen.'
    ],
    risks: [
      'Brine disposal regulations in fragile marine coastal ecosystems.'
    ],
    nextSteps: [
      'Integrate electro-dialysis crystallizer for zero-liquid discharge (ZLD).'
    ]
  },
  {
    id: 'bioprint-osteo',
    name: 'BioPrint OsteoScaffold',
    type: 'Hardware',
    domain: 'BioTech / 3D Biomaterial Printing',
    tagline: 'Patient-specific 3D bio-ceramic scaffold with osteoinductive microporosity',
    overallScore: 91.8,
    confidence: 94,
    status: 'Completed',
    originalityScore: 92,
    impactScore: 95,
    technicalScore: 93,
    presentationScore: 88,
    demoScore: 90,
    verdict: 'Exceptional',
    team: 'OsteoForm Biomechanics',
    updatedAt: '5 days ago',
    submittedAt: '2026-08-18',
    problemStatement: 'Severe bone fracture defects exceeding 5cm fail to heal spontaneously and autografts cause secondary donor-site morbidity in 28% of patients.',
    solutionDescription: 'Extrusion 3D bioprinter fabricating hydroxyapatite/polycaprolactone bioresorbable lattices with pore gradients matching trabecular bone.',
    executiveSummary: 'Exceptional biomedical engineering demonstrating sub-15 micron print accuracy, 92% cell adhesion at 14 days, and compressive yield strength matching human cortical bone.',
    evidenceCount: 62,
    claimsCount: 16,
    verifiedClaimsCount: 15,
    breakdown: [
      { category: 'Problem & Need', score: 95, weight: '15%', confidence: 96, evidenceCount: 8 },
      { category: 'Technical Quality', score: 93, weight: '20%', confidence: 95, evidenceCount: 18 },
      { category: 'Originality', score: 92, weight: '15%', confidence: 94, evidenceCount: 10 },
      { category: 'Social Impact', score: 95, weight: '15%', confidence: 96, evidenceCount: 8 },
      { category: 'Presentation', score: 88, weight: '10%', confidence: 92, evidenceCount: 6 },
      { category: 'Demo Quality', score: 90, weight: '10%', confidence: 93, evidenceCount: 6 },
      { category: 'Feasibility', score: 86, weight: '10%', confidence: 88, evidenceCount: 4 },
      { category: 'Future Potential', score: 95, weight: '5%', confidence: 96, evidenceCount: 2 },
    ],
    strengths: [
      'Voronoi pore distribution achieves 142 MPa compressive strength.',
      'In-vitro osteoblast proliferation confirmed via confocal fluorescent microscopy.'
    ],
    weaknesses: [
      'Requires cleanroom ISO Class 7 environment for sterile implant fabrication.'
    ],
    risks: [
      'Lengthy 24-month FDA 510(k) Class II medical device clearance pathway.'
    ],
    nextSteps: [
      'Initiate 12-month in-vivo sheep femoral defect trials with university medical hospital.'
    ]
  },
  {
    id: 'finguard-gnn',
    name: 'FinGuard Fraud Graph',
    type: 'Software',
    domain: 'FinTech / Graph Neural Networks',
    tagline: 'Real-time multi-hop anti-money-laundering syndicate detection',
    overallScore: 79.4,
    confidence: 86,
    status: 'Completed',
    originalityScore: 76,
    impactScore: 82,
    technicalScore: 84,
    presentationScore: 78,
    demoScore: 75,
    verdict: 'Promising',
    team: 'FinGuard Systems',
    updatedAt: '1 week ago',
    submittedAt: '2026-08-15',
    problemStatement: 'Sophisticated money-laundering syndicates layer illicit capital across hundreds of synthetic mule accounts, bypassing traditional rule-based threshold filters.',
    solutionDescription: 'Graph Neural Network (PyTorch Geometric) analyzing streaming financial transaction graphs to classify cyclic structuring patterns within 12 milliseconds.',
    executiveSummary: 'Solid graph analytics implementation capable of detecting 8-hop structuring cycles in sub-15ms. False-positive rate requires refinement to avoid investigator fatigue.',
    evidenceCount: 38,
    claimsCount: 12,
    verifiedClaimsCount: 10,
    breakdown: [
      { category: 'Problem & Need', score: 86, weight: '15%', confidence: 88, evidenceCount: 5 },
      { category: 'Technical Quality', score: 84, weight: '20%', confidence: 87, evidenceCount: 10 },
      { category: 'Originality', score: 76, weight: '15%', confidence: 84, evidenceCount: 6 },
      { category: 'Social Impact', score: 82, weight: '15%', confidence: 86, evidenceCount: 5 },
      { category: 'Presentation', score: 78, weight: '10%', confidence: 82, evidenceCount: 4 },
      { category: 'Demo Quality', score: 75, weight: '10%', confidence: 80, evidenceCount: 3 },
      { category: 'Feasibility', score: 74, weight: '10%', confidence: 81, evidenceCount: 3 },
      { category: 'Future Potential', score: 84, weight: '5%', confidence: 85, evidenceCount: 2 },
    ],
    strengths: [
      'Sub-15ms dynamic graph inference on Kafka transactional payment stream.',
      'Explainable subgraph generation visualizing exact mule syndicate connectivity.'
    ],
    weaknesses: [
      'High false-positive rate on high-volume holiday shopping merchant accounts.'
    ],
    risks: [
      'Privacy regulations (GDPR/GLBA) regarding cross-institutional graph pooling.'
    ],
    nextSteps: [
      'Implement federated graph neural learning across multiple participating banks.'
    ]
  },
  {
    id: 'neuroflex-bci',
    name: 'NeuroFlex Prosthetic BCI',
    type: 'Hardware',
    domain: 'NeuroTech / EMG Neural Interface',
    tagline: 'Continuous intent-decoding upper-limb myoelectric prosthesis',
    overallScore: 85.0,
    confidence: 88,
    status: 'Completed',
    originalityScore: 82,
    impactScore: 91,
    technicalScore: 88,
    presentationScore: 82,
    demoScore: 84,
    verdict: 'Strong Project',
    team: 'NeuroFlex Robotics',
    updatedAt: '1 week ago',
    submittedAt: '2026-08-12',
    problemStatement: 'Upper-limb amputees abandon motorized prosthetics at a 44% rate due to unintuitive dual-muscle switching and unnatural latency (>150ms).',
    solutionDescription: '32-channel high-density surface EMG armband running temporal convolutional network to predict individual finger kinematics with 22ms latency.',
    executiveSummary: 'Strong bio-mechatronic engineering demonstrating real-time grasping control with 94.6% gesture intent accuracy and low 22ms input-to-actuation latency.',
    evidenceCount: 46,
    claimsCount: 14,
    verifiedClaimsCount: 12,
    breakdown: [
      { category: 'Problem & Need', score: 92, weight: '15%', confidence: 93, evidenceCount: 6 },
      { category: 'Technical Quality', score: 88, weight: '20%', confidence: 90, evidenceCount: 12 },
      { category: 'Originality', score: 82, weight: '15%', confidence: 86, evidenceCount: 7 },
      { category: 'Social Impact', score: 91, weight: '15%', confidence: 92, evidenceCount: 6 },
      { category: 'Presentation', score: 82, weight: '10%', confidence: 85, evidenceCount: 5 },
      { category: 'Demo Quality', score: 84, weight: '10%', confidence: 87, evidenceCount: 4 },
      { category: 'Feasibility', score: 80, weight: '10%', confidence: 83, evidenceCount: 4 },
      { category: 'Future Potential', score: 88, weight: '5%', confidence: 89, evidenceCount: 2 },
    ],
    strengths: [
      'Deterministic 22ms latency eliminates cognitive sensory-motor lag.',
      'Active capacitive electrode shielding reduces 50/60Hz mains interference.'
    ],
    weaknesses: [
      'Skin perspiration causes electrode impedance shift during prolonged vigorous use.'
    ],
    risks: [
      'Electrode gel drying out during 8+ hour continuous daily wear.'
    ],
    nextSteps: [
      'Deploy dry gold-plated microneedle contact sensors for zero-gel operation.'
    ]
  },
  {
    id: 'quantumsafe-kms',
    name: 'QuantumSafe Key Exchange',
    type: 'Software',
    domain: 'Cryptography / Post-Quantum Systems',
    tagline: 'Hardware-backed ML-KEM lattice key exchange with hybrid TLS 1.3',
    overallScore: 82.6,
    confidence: 89,
    status: 'Completed',
    originalityScore: 78,
    impactScore: 85,
    technicalScore: 89,
    presentationScore: 80,
    demoScore: 81,
    verdict: 'Strong Project',
    team: 'QuantumLattice Labs',
    updatedAt: '2 weeks ago',
    submittedAt: '2026-08-08',
    problemStatement: 'Harvest-now-decrypt-later attacks threaten all RSA and Elliptic Curve encrypted communications ahead of cryptanalytically relevant quantum computers.',
    solutionDescription: 'Drop-in OpenSSL 3.3 engine implementing NIST FIPS 203 (ML-KEM/Kyber-768) and FIPS 204 (ML-DSA) hybrid post-quantum cipher suites.',
    executiveSummary: 'Rigorous cryptographic engineering verifying constant-time assembly implementations and protection against side-channel timing leakage.',
    evidenceCount: 42,
    claimsCount: 13,
    verifiedClaimsCount: 12,
    breakdown: [
      { category: 'Problem & Need', score: 88, weight: '15%', confidence: 92, evidenceCount: 5 },
      { category: 'Technical Quality', score: 89, weight: '20%', confidence: 93, evidenceCount: 12 },
      { category: 'Originality', score: 78, weight: '15%', confidence: 85, evidenceCount: 6 },
      { category: 'Social Impact', score: 85, weight: '15%', confidence: 88, evidenceCount: 5 },
      { category: 'Presentation', score: 80, weight: '10%', confidence: 84, evidenceCount: 5 },
      { category: 'Demo Quality', score: 81, weight: '10%', confidence: 86, evidenceCount: 4 },
      { category: 'Feasibility', score: 82, weight: '10%', confidence: 87, evidenceCount: 3 },
      { category: 'Future Potential', score: 86, weight: '5%', confidence: 88, evidenceCount: 2 },
    ],
    strengths: [
      'AVX-512 vector acceleration achieves 18,200 key encapsulations/second per core.',
      'Valgrind constant-time memory analysis verifies zero timing side-channel leakage.'
    ],
    weaknesses: [
      'Public key and ciphertext payload size (1,184 bytes) increases TLS packet fragmentation.'
    ],
    risks: [
      'NIST standardization algorithmic tweak requiring backwards-incompatible firmware updates.'
    ],
    nextSteps: [
      'Publish formal verification proofs using the Coq interactive theorem prover.'
    ]
  },
  {
    id: 'eduadaptive-ai',
    name: 'EduAdaptive Cognitive Tutor',
    type: 'Software',
    domain: 'EdTech / Multimodal Learning Analytics',
    tagline: 'Personalized STEM mastery tutoring with real-time cognitive load detection',
    overallScore: 64.5,
    confidence: 76,
    status: 'Needs Review',
    originalityScore: 48,
    impactScore: 78,
    technicalScore: 68,
    presentationScore: 72,
    demoScore: 65,
    verdict: 'Needs Improvement',
    team: 'CognitivePath EdTech',
    updatedAt: '2 weeks ago',
    submittedAt: '2026-08-01',
    problemStatement: 'Standardized mass instruction fails to adapt to individual student knowledge gaps and cognitive fatigue in foundational high school mathematics.',
    solutionDescription: 'Web-based interactive tutoring platform using Bayesian Knowledge Tracing and webcam eye-tracking to dynamically modulate problem difficulty.',
    executiveSummary: 'Demonstrates clear educational motivation, but originality analysis flagged 52% architectural overlap with open-source Bayesian Knowledge Tracing engines. Retention efficacy claims unverified.',
    evidenceCount: 24,
    claimsCount: 11,
    verifiedClaimsCount: 5,
    breakdown: [
      { category: 'Problem & Need', score: 85, weight: '15%', confidence: 86, evidenceCount: 4 },
      { category: 'Technical Quality', score: 68, weight: '20%', confidence: 74, evidenceCount: 6 },
      { category: 'Originality', score: 48, weight: '15%', confidence: 71, evidenceCount: 3 },
      { category: 'Social Impact', score: 78, weight: '15%', confidence: 80, evidenceCount: 4 },
      { category: 'Presentation', score: 72, weight: '10%', confidence: 76, evidenceCount: 3 },
      { category: 'Demo Quality', score: 65, weight: '10%', confidence: 70, evidenceCount: 2 },
      { category: 'Feasibility', score: 62, weight: '10%', confidence: 72, evidenceCount: 1 },
      { category: 'Future Potential', score: 70, weight: '5%', confidence: 75, evidenceCount: 1 },
    ],
    strengths: [
      'Engaging interactive step-by-step math solver interface.'
    ],
    weaknesses: [
      '52% algorithmic similarity to open-source BKT-py framework without attribution.',
      'Webcam gaze estimation fails under common ambient room backlighting conditions.',
      'Controlled learning retention trial has only 12 participants (statistically underpowered).'
    ],
    risks: [
      'Student biometric privacy concerns (COPPA/FERPA) regarding webcam eye-gaze tracking.'
    ],
    nextSteps: [
      'Clarify open-source foundational codebase attribution in thesis documentation.',
      'Conduct statistically validated blind control trial with at least 150 students.'
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

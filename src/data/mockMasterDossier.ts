import type { MasterDossierData } from '../types/masterDossier';

export const MOCK_HARDWARE_DOSSIER: MasterDossierData = {
  projectId: 'dossier-aeropulse-px4',
  projectName: 'AeroPulse PX-4 Autonomous Subterranean UAV',
  projectType: 'hardware',
  tagline: 'Autonomous GPS-Denied Subterranean UAV with EKF Sensor Fusion & Resilient Mesh Telemetry',
  author: 'Team AeroPulse (Autonomous Robotics Lab)',
  institution: 'Imperial College London & Colorado School of Mines',
  evaluatedAt: '2026-09-04T19:45:00Z',
  evaluationEngineVersion: 'ProjectX-Ray Consensus Engine v4.2.1-prod',
  overallScore: 89,
  aiVerdict: 'Strong',
  confidenceScore: 97,
  grade: 'A+ (Exemplary Defense)',
  percentile: 'Top 2.4% of Global Submissions',
  juryPanel: [
    'Dr. Evelyn Vance (Avionics & Embedded AI, MIT)',
    'Marcus Thorne (Field Robotics Safety, FEMA)',
    'Dr. Alistair Finch (Prior Art & Patents, IEEE)',
    'Elena Rostova (Humanitarian Impact, UN OCHA)'
  ],

  // 1. Executive Summary
  executiveSummary: {
    headline: 'High-viability autonomous subterranean search-and-rescue UAV verified across 34 GPS-denied sorties.',
    verdict: 'Approved for pilot commercialization and advanced field deployment grants subject to ESC commutation timing refactor and injection-molded carbon-polycarbonate arm retooling.',
    keyFindings: [
      'Sub-centimeter drift-free visual-inertial odometry verified via rock-cavern telemetry logs (0.04m drift over 12 mins).',
      'Ballistic supercapacitor parachute deploys in 12ms during simulated motor failure.',
      'Contradiction detected in oral pitch: 4.2mA claim represented idle MCU sleep draw, whereas hover draw was verified at 12.84A (190W).',
      'High originality (84.8%) with clear architectural differentiation from COTS Pixhawk reference designs.'
    ],
    juryRecommendation: 'Recommend immediate transition into TRL 6-7 pilot testing with municipal search-and-rescue squads and West Virginia mine safety task forces.',
    groundedConclusions: [
      {
        statement: 'The vehicle operates stably in total GPS denial and visual dust obscuration.',
        evidence: 'Cavern test run #14 pointcloud telemetry log (400Hz EKF2 updates)',
        confidence: 98,
        source: 'Flight Computer Blackbox /dev/ttyACM0'
      },
      {
        statement: 'Hover current is 12.84A average, requiring realistic battery reserve accounting.',
        evidence: 'INA219 current shunt sensor logged 190.2W average at 05:38',
        confidence: 99,
        source: 'Bench Dynamometer Log #BM-401'
      }
    ]
  },

  // 2. Project DNA
  projectDNA: {
    domain: 'Autonomous Aerospace & Subterranean Robotics',
    projectType: 'Confined-Space Hardware UAV Platform',
    targetAudience: 'Municipal Fire Departments, Mine Safety Inspectors, FEMA Urban Search & Rescue',
    coreStack: ['STM32H753 MCU (Dual-Core)', 'Nvidia Jetson Orin Nano', 'PX4 Autopilot', 'CAN-FD Bus', 'Thermal LWIR SLAM', '77GHz Radar'],
    inputs: ['Thermal FLIR LWIR Stream', 'Optical Flow Downward Sensor', 'Triple Redundant IMUs', 'CO/CH4 Gas Telemetry'],
    outputs: ['Real-time 3D Subterranean Point Clouds', 'Thermal Survivor Coordinates', 'Gas Hazard Heatmaps', 'Autonomous Waypoint Return'],
    architecturalTopology: 'Distributed multi-MCU avionics connected via redundant aerospace CAN-FD bus with localized edge AI compute and 433MHz LoRa mesh repeater.',
    groundedConclusions: [
      {
        statement: 'Architectural segregation ensures flight-critical control loop never starves from edge AI vision overhead.',
        evidence: 'Zero task deadline misses recorded in FreeRTOS trace analyzer over 48 hours',
        confidence: 97,
        source: 'FreeRTOS SystemView Trace Dump #TR-08'
      }
    ]
  },

  // 3. Problem Analysis
  problemAnalysis: {
    problemStatement: 'Human emergency responders face lethal secondary collapses and toxic methane gas during the critical 42-minute golden hour in mine disasters.',
    severityLevel: 'Critical',
    baselineContext: 'Conventional rescue teams take 3.5 to 6 hours to clear entrance safety; existing commercial drones lose telemetry or crash without GPS.',
    targetPainPoints: [
      'Zero-visibility dust clouds blind standard RGB optical drone cameras.',
      'Dense subterranean rock strata severs 2.4GHz/5.8GHz video signals.',
      'Magnetic ore anomalies cause compass yaw divergence and uncontrolled crashes.'
    ],
    marketDeficiency: 'Commercial tactical drones cost $85,000+ and lack confined-space collision avoidance algorithms.',
    groundedConclusions: [
      {
        statement: 'Problem severity is supported by global mine safety mortality statistics.',
        evidence: '73% of cave fatalities attributable to delayed sensor recon',
        confidence: 96,
        source: 'National Mine Safety Association Report #NMSA-2024-88'
      }
    ]
  },

  // 4. Technical Audit
  technicalAudit: {
    score: 88,
    auditStatus: 'Architecturally Sound & Empirically Validated',
    subscores: [
      { category: 'Circuit & System Architecture', score: 92, confidence: 98, verdict: 'Split analog/digital ground planes minimize sensor noise' },
      { category: 'Sensors & Fusion Algorithms', score: 94, confidence: 97, verdict: 'EKF2 VIO fusion handles magnetic anomalies gracefully' },
      { category: 'Mechanical & Safety Design', score: 86, confidence: 96, verdict: 'Ballistic parachute operates reliably on supercapacitors' },
      { category: 'Power & Battery Architecture', score: 80, confidence: 98, verdict: 'Accurately profiled at 190W continuous hover power' }
    ],
    strengths: [
      'Custom 4-layer PCB with thermal dissipation vias under motor driver FETs.',
      'Redundant IMU sensors mounted on silicone vibration isolation dampeners.',
      'MISRA-C 2012 compliance score of 91.4% on flight-control algorithms.'
    ],
    architecturalCritique: 'Current SLS 3D printed nylon frame lacks IP67 waterproof certification; requires carbon-polycarbonate injection tooling for commercialization.',
    groundedConclusions: [
      {
        statement: 'Signal integrity on SPI flight sensor bus exceeds aerospace capstone benchmarks.',
        evidence: 'Measured jitter of 4.2ns on 40MHz SPI bus with zero packet corruptions',
        confidence: 98,
        source: 'Rigol DS1054Z Channel 1-2 Waveform Capture'
      }
    ]
  },

  // 5. Innovation & Originality
  originalityInvestigation: {
    originalityScore: 84.8,
    similarityScore: 15.2,
    tier: 'Inspired',
    priorArtHighlights: [
      { source: 'Pixhawk 6X Reference Design (PX4)', similarity: 14.8, category: 'Open Hardware', differentiation: 'Custom PCB layout with CAN-FD and integrated parachute trigger' },
      { source: 'IEEE ICRA 2022 Mine Navigation Paper', similarity: 18.4, category: 'Academic Research', differentiation: 'Embedded real-time multi-state constraint Kalman filter on low-power MCU' },
      { source: 'DJI Ballistic Deployer (Patent US11453492B1)', similarity: 12.1, category: 'Patents', differentiation: 'Purely electrical supercapacitor ignition bypassing pyrotechnic charges' }
    ],
    groundedConclusions: [
      {
        statement: 'Acoustic-optical sensor pulse interleaving represents genuine patentable novelty.',
        evidence: 'Zero prior assignees discovered across USPTO & Google Patents database search',
        confidence: 94,
        source: 'USPTO Automated Cross-Reference Query Ref #US20210349192A1'
      }
    ]
  },

  // 6. Claim Verification
  claimVerification: {
    verifiedCount: 5,
    totalClaims: 7,
    verificationRate: 71.4,
    contradictions: 1,
    auditedClaims: [
      { claim: 'Sub-centimeter drift-free navigation in GPS denial', status: 'Verified', confidence: 97, finding: 'EKF2 odometry held ±0.04m drift over 12 minutes in test tunnel', evidenceRef: 'EV-HW-01' },
      { claim: 'Ultralow 4.2mA power draw enables 45-minute flight', status: 'Contradicted', confidence: 99, finding: '4.2mA was deep-sleep MCU draw; actual motor hover draw is 12.84A (190W)', evidenceRef: 'EV-HW-03' },
      { claim: '12ms ballistic parachute emergency ejection', status: 'Verified', confidence: 98, finding: 'High-speed camera confirmed parachute canopy deployment at 11.8ms', evidenceRef: 'EV-HW-02' },
      { claim: 'Subterranean 433MHz LoRa mesh link to surface', status: 'Partially Verified', confidence: 82, finding: 'Link verified through 32m bedrock; longer distances unproven', evidenceRef: 'EV-HW-04' }
    ],
    groundedConclusions: [
      {
        statement: 'Battery flight duration claim must be officially revised from 45 min to 18 min in documentation.',
        evidence: 'Direct power analyzer shunt logs under 1.2kg payload load',
        confidence: 99,
        source: 'Yokogawa WT310E Digital Power Analyzer'
      }
    ]
  },

  // 7. Presentation Analysis
  presentationAnalysis: {
    score: 82,
    clarityScore: 89,
    paceWPM: 138,
    confidenceScore: 88,
    fillerWordsPerMin: 1.7,
    structureScore: 90,
    eyeContactGaze: 84,
    postureScore: 85,
    audienceEngagement: 83,
    timeManagement: '08:14 / 08:00 (+14s)',
    keyObservations: [
      'Presenters effectively demonstrated composure during the motor desync anomaly query.',
      'Acoustic signal-to-noise ratio averaged 18.4 dB with lucid speech modulation.',
      'Slide 8 pinout schematic font was slightly under 10pt font threshold.'
    ],
    groundedConclusions: [
      {
        statement: 'Verbal delivery was disciplined, professional, and clear of rhetorical evasion.',
        evidence: 'Acoustic pitch stability index held within calm range (124-142 Hz)',
        confidence: 95,
        source: 'Audio Telemetry Channel 1 SNR Analysis'
      }
    ]
  },

  // 8. Demo Analysis
  demoAnalysis: {
    score: 74,
    completenessRate: 72,
    demonstratedFeaturesCount: 5,
    successfulFeaturesCount: 3,
    failedFeaturesCount: 1,
    unsupportedClaimsCount: 1,
    observedErrors: [
      {
        timestamp: '07:18.420',
        errorType: 'ESC_ERR_DESYNC_04',
        logSnippet: 'Back-EMF zero-crossing missed on Motor 3 during rapid yaw acceleration (14.8A peak)',
        consequence: 'Temporary 1.8s attitude oscillation before fail-safe loiter restabilized flight'
      }
    ],
    featuresDemonstrated: [
      { feature: 'Autonomous Takeoff & Hover in Dark Tunnel', status: 'verified', timestamp: '01:10', note: 'VIO lock established in 1.4s' },
      { feature: 'Live Pointcloud Generation via 77GHz Radar', status: 'verified', timestamp: '03:40', note: 'Mapped 14m cavern corridor accurately' },
      { feature: 'High-G Dynamic Yaw Maneuver', status: 'failed', timestamp: '07:18', note: 'Triggered Motor 3 ESC timing desync' },
      { feature: 'Loss-of-Signal Autonomous Return-to-Home', status: 'verified', timestamp: '08:45', note: 'Navigated back through last 3 breadcrumbs' },
      { feature: 'Multi-Kilometer Mesh Relay Swarm', status: 'partial', timestamp: '09:20', note: 'Deferred to pre-recorded bench simulation' }
    ],
    groundedConclusions: [
      {
        statement: 'Live flight execution proved core autonomy, but revealed ESC timing headroom deficiency under extreme transient pulses.',
        evidence: 'UART log buffer timestamp 07:18.420 showing back-EMF missed pulse',
        confidence: 98,
        source: 'Onboard Telemetry Serial Buffer'
      }
    ]
  },

  // 9. Social Impact
  socialImpact: {
    score: 90,
    headlineMetric: '42-Minute Golden Hour Rescue Accelerator',
    peopleAffected: '14,000+ underground miners and first responders globally per annum',
    problemSeverity: 'Critical life-safety hazard in collapsed and hazardous gas environments',
    accessibilityBenefit: 'Open-source telemetry protocol enables low-resource municipal fire squads to build units',
    humanitarianValue: 'Eliminates requirement for human scouts to enter unstable secondary-collapse zones before atmospheric clearance',
    groundedConclusions: [
      {
        statement: 'Reconnaissance time reduced from 42 minutes to under 8 minutes in municipal trials.',
        evidence: 'Red Cross First Responder Field Trial Log #RC-09',
        confidence: 94,
        source: 'Colorado Urban Search & Rescue Joint Exercise'
      }
    ]
  },

  // 10. Economic Impact
  economicImpact: {
    score: 86,
    headlineMetric: '$284 Bill of Materials vs. $85,000 Commercial Units',
    costSavings: '96.6% reduction in equipment acquisition cost for volunteer rescue departments',
    affordabilityIndex: 'Accessible to rural volunteer fire brigades with under $10,000 annual equipment budgets',
    marketRelevance: 'Immediate market fit across mining compliance, industrial sewer inspection, and utility conduit inspection',
    roiEstimate: 'Payback in a single prevented mine-shaft downtime incident ($2.4M saved per avoided shutdown day)',
    groundedConclusions: [
      {
        statement: 'Component bill of materials is realistic and substantiated by commercial distributor quotes.',
        evidence: 'Verified component pricing across DigiKey and Mouser wholesale quotes in BOM spreadsheet',
        confidence: 95,
        source: 'AeroPulse_BOM_v2.csv'
      }
    ]
  },

  // 11. Environmental Impact
  environmentalImpact: {
    score: 83,
    headlineMetric: 'Zero Combustible Spark Hazard & Non-Toxic LiFePO4 Chemistry',
    energyUsageProfile: 'High electrical efficiency (190W continuous draw, 4S 4500mAh pack)',
    materialUsageAndRecyclability: 'Frame utilizes recyclable bio-polyamide nylon; zero hazardous beryllium alloys',
    emissionsImplications: 'Directly replaces two-stroke gasoline-powered rescue ventilation fans during initial entry recon',
    sustainabilityLifecycle: 'Modular modular arms allow rapid swap-out of broken propellers without discarding the fuselage',
    groundedConclusions: [
      {
        statement: 'Spark-free conformal coating meets ATEX Zone 2 explosive dust safety standards.',
        evidence: 'Conformal silicone coating insulation impedance > 500 MOhm at 500V test',
        confidence: 92,
        source: 'Safety Certificate ISO-13849 Test Bench'
      }
    ]
  },

  // 12. Feasibility
  feasibility: {
    score: 76,
    trlLevel: 'TRL 5 (Validated in Relevant Mine Tunnel Environment)',
    deploymentComplexity: 'Moderate',
    infrastructureRequirements: [
      '433MHz portable surface receiver antenna mast',
      '24V DC field battery charging bank or rescue truck inverter',
      'Ruggedized Android tablet for map visualization'
    ],
    estimatedCapEx: '$18,500 (Tooling for injection mold tooling)',
    estimatedOpEx: '$420 / yr (Replacement props and battery cell retirement)',
    maintenanceProfile: 'Field-serviceable with standard M3 hex drivers in under 15 minutes',
    scalabilityBottleneck: '3D printed SLS frame takes 14 hours per chassis; transition to injection molding is prerequisite for batch production',
    groundedConclusions: [
      {
        statement: 'TRL 5 status is empirically confirmed by video and log records in genuine mine caverns.',
        evidence: '14 test flights completed at Colorado School of Mines Edgar Experimental Mine',
        confidence: 96,
        source: 'Edgar Mine Facility Access & Sortie Log'
      }
    ]
  },

  // 13. Risks
  risks: [
    {
      id: 'RSK-01',
      title: 'Motor 3 ESC Commutation Desync Under 14.8A Pulse',
      severity: 'High',
      probability: 'Medium',
      category: 'Technical',
      impactArea: 'Flight Stability & Propulsion Safety',
      detectedEvidence: 'ESC_ERR_DESYNC_04 logged at 07:18.420 during high-throttle yaw maneuver',
      mitigation: 'Upgrade to 32-bit BLHeli_32 ESCs with active back-EMF filtering and expand DShot commutation timing headroom by 25%.',
      confidence: 98
    },
    {
      id: 'RSK-02',
      title: 'Buck Converter Thermal Saturation (68°C)',
      severity: 'Medium',
      probability: 'Medium',
      category: 'Technical',
      impactArea: 'Electronic Reliability & Enclosure Temperature',
      detectedEvidence: 'FLIR thermal camera frame #289 registered 68.2°C at 05:42 hover bench test',
      mitigation: 'Install dual aluminum heat sinks coupled to propeller downwash ducting.',
      confidence: 94
    },
    {
      id: 'RSK-03',
      title: 'Ultrasonic Piezo Resonant Drift at Temperatures < 5°C',
      severity: 'Low',
      probability: 'Low',
      category: 'Regulatory',
      impactArea: 'Subterranean Winter Operation',
      detectedEvidence: 'Environmental chamber test log #EC-02 showed +4.2% resonance shift at -2°C',
      mitigation: 'Implement dynamic frequency-tuning lookup table keyed to onboard thermistor telemetry.',
      confidence: 91
    }
  ],

  // 14. Recommended Improvements
  improvements: [
    {
      id: 'IMP-01',
      priority: 'P0 (Must Fix)',
      recommendation: 'Refactor ESC commutation timing firmware and transition to BLHeli_32 or KISS ESCs.',
      rationale: 'Eliminates the transient current desync glitch that compromised yaw stability at 07:18.',
      effort: 'Low',
      evidenceTrigger: 'ESC_ERR_DESYNC_04 UART trace',
      confidence: 98
    },
    {
      id: 'IMP-02',
      priority: 'P1 (High Priority)',
      recommendation: 'Replace 3D-printed SLS nylon arms with injection-molded carbon-polycarbonate.',
      rationale: 'Increases torsional rigidity by 3.4x and reduces arm fabrication time from 14 hours to 45 seconds.',
      effort: 'Medium',
      evidenceTrigger: 'Vibration spectrogram showing 24Hz frame flex resonance',
      confidence: 95
    },
    {
      id: 'IMP-03',
      priority: 'P2 (Optimization)',
      recommendation: 'Incorporate onboard dual-band UWB ranging transceivers for multi-drone cooperative localization.',
      rationale: 'Paves the way for simultaneous multi-drone subterranean mapping without central relay reliance.',
      effort: 'High',
      evidenceTrigger: 'Future scope swarm roadmap',
      confidence: 89
    }
  ],

  // 15. Future Scope
  futureScope: {
    shortTermRoadmap: [
      'Complete field trials with West Virginia Coal Mine Safety Task Force (Q4 2026).',
      'Obtain MSHA Part 23 explosion-proof intrinsic safety certification.',
      'Release open-source ROS2 driver package for pointcloud streaming to QGIS.'
    ],
    longTermVision: 'Fully autonomous subterranean swarm system deploying from a self-recharging tactical rover to map multi-mile cavern labyrinths.',
    ipAndPatentPotential: 'High patentability for the acoustic-optical hybrid pulse interleaving method and supercapacitor ejection circuitry.',
    groundedConclusions: [
      {
        statement: 'The research trajectory aligns directly with upcoming DARPA SubT 2.0 operational solicitations.',
        evidence: 'Published DARPA Subterranean Challenge technical specifications Section 4.2',
        confidence: 92,
        source: 'DARPA SubT BAA-24-09'
      }
    ]
  },

  // 16. Commercialization Potential
  commercializationPotential: {
    score: 84,
    marketMaturity: 'Rapidly Growing Industrial & Defense Robotics ($4.8B TAM)',
    targetBuyerPersona: 'Mine Safety Directors, Municipal Fire Chiefs, Infrastructure Inspection Contractors',
    go_to_market_strategy: 'Direct pilot sales to mining conglomerates, followed by GSA Schedule listing for federal emergency response agencies.',
    competitiveMoat: 'Proprietary dust-penetrating acoustic-optical state estimator + ultra-low BOM unit economics ($284).',
    regulatoryPath: 'FAA Part 107 operations; MSHA Title 30 CFR intrinsically safe classification for underground gassy mines.',
    unitEconomics: {
      bomOrHostingCost: '$284 / unit',
      targetSellingPrice: '$4,200 / unit (with tactical ground station tablet)',
      projectedGrossMargin: '93.2% hardware gross margin'
    },
    groundedConclusions: [
      {
        statement: 'Unit economics provide ample margin headroom to support warranty, sensor calibration, and customer success.',
        evidence: 'DigiKey/Mouser wholesale volume quotes in verified BOM ledger',
        confidence: 96,
        source: 'AeroPulse Finance Model v1.4'
      }
    ]
  },

  // 17. Judge Questions
  judgeQuestions: [
    {
      id: 'JQ-01',
      question: 'Your oral pitch claimed a 4.2mA power draw enabling 45 minutes of flight, but bench telemetry registered 12.84A (190W) in hover. What is your true flight endurance with a 4S 4500mAh pack under standard subterranean payload?',
      targetVulnerability: 'Unsubstantiated power claim in pitch deck confusing idle MCU draw with full motor hover consumption.',
      rationale: 'Essential for evaluating mission viability in life-critical rescue operations.',
      requiredProof: 'Submit continuous dynamometer test log showing battery discharge curve from 16.8V to 14.0V under 1.2kg payload.'
    },
    {
      id: 'JQ-02',
      question: 'During the high-speed yaw maneuver at 07:18, an ESC desync occurred on Motor 3. How do you guarantee the vehicle will not enter an irrecoverable death-roll when executing evasive maneuvers in confined mine shafts?',
      targetVulnerability: 'Propulsion reliability edge cases under transient current spikes.',
      rationale: 'Confined spaces leave zero margin for attitude oscillations.',
      requiredProof: 'Provide oscilloscope capture of ESC back-EMF commutation zero-crossing signals during 0-to-100% throttle step response.'
    },
    {
      id: 'JQ-03',
      question: 'In heavy coal dust or smoke obscuration, optical cameras fail completely. What is your verified odometry drift when operating exclusively on 77GHz radar and acoustic ultrasound without optical flow?',
      targetVulnerability: 'Over-reliance on downward optical flow camera in degraded visual environments.',
      rationale: 'Validates primary novelty thesis of all-weather subterranean autonomy.',
      requiredProof: 'Submit black-box flight logs from blackout smoke chamber test with downward optical camera physically occluded.'
    }
  ],

  // 18. Evidence
  evidenceLocker: [
    {
      id: 'EV-HW-01',
      title: 'Tunnel EKF2 Odometry Telemetry Log (400Hz)',
      type: 'Hardware Telemetry',
      source: 'Flight Computer Blackbox /dev/ttyACM0',
      location: 'telemetry/flight_runs/run_14_tunnel.ulg',
      reliabilityScore: 98,
      excerpt: 'EKF2 state covariance held stable at sigma_x = 0.038m, sigma_y = 0.041m across 720 seconds in total GPS denial.'
    },
    {
      id: 'EV-HW-02',
      title: 'Ballistic Parachute Supercapacitor Discharge Trace',
      type: 'Sensor Log',
      source: 'Internal Parachute Controller MCU ADC',
      location: 'avionics/logs/chute_deploy_03.csv',
      reliabilityScore: 99,
      excerpt: '16.0V supercapacitor pack discharged into solenoid trigger in 11.8ms; canopy reached full drag inflation in 84ms.'
    },
    {
      id: 'EV-HW-03',
      title: 'INA219 High-Side Power & Current Shunt Log',
      type: 'Sensor Log',
      source: 'Bench Dynamometer Rigol DS1054Z',
      location: 'power/bench_tests/hover_draw_190w.csv',
      reliabilityScore: 99,
      excerpt: 'Continuous hover current averaged 12.84A at 14.81V (190.2W); transient peak during dynamic yaw reached 14.84A.'
    },
    {
      id: 'EV-HW-04',
      title: '433MHz LoRa Bedrock Penetration RSSI Log',
      type: 'Hardware Telemetry',
      source: 'Surface Receiver Mast Station',
      location: 'rf/penetration/bedrock_test_edgar.csv',
      reliabilityScore: 92,
      excerpt: 'Packet reception rate held at 94.2% through 32m solid granite; packet loss climbed to 38% past 48m without repeater.'
    }
  ],

  // 19. External Sources
  sourcesAndCitations: [
    {
      id: 'SRC-HW-01',
      title: 'NMSA Subterranean Mine Emergency Search Protocol 2024',
      type: 'Gov Safety Archive',
      citation: 'National Mine Safety Association, Technical Bulletin 2024-88, Washington D.C., 2024.',
      relevanceToEvaluation: 'Establishes the 42-minute golden hour benchmark and necessity for autonomous scout entry.'
    },
    {
      id: 'SRC-HW-02',
      title: 'Autonomous Navigation in GPS-Denied Environments Using EKF Sensor Fusion',
      type: 'Research Paper',
      citation: 'IEEE Transactions on Robotics, Vol. 38, No. 4, pp. 2105-2121, August 2022.',
      relevanceToEvaluation: 'Baseline academic benchmark for visual-inertial odometry drift limits.'
    },
    {
      id: 'SRC-HW-03',
      title: 'USPTO Patent US11453492B1: Ballistic Recovery System for Unmanned Aerial Vehicles',
      type: 'Patent',
      citation: 'United States Patent and Trademark Office, Issued September 2022.',
      relevanceToEvaluation: 'Prior art for parachute deployer comparison; AeroPulse distinguished via supercapacitor activation.'
    },
    {
      id: 'SRC-HW-04',
      title: 'PX4 Autopilot Open Source Firmware Repository',
      type: 'GitHub Repository',
      citation: 'github.com/PX4/PX4-Autopilot, v1.14.0 release.',
      relevanceToEvaluation: 'Base flight control firmware stack utilized for low-level motor commutation and FreeRTOS tasks.'
    }
  ],

  // 20. Final AI Jury Verdict
  finalVerdictConsensus: {
    score: 89,
    tier: 'Strong',
    verdictStatement: 'Exceptional engineering validation and lifesaving utility, conditioned upon ESC firmware optimization and injection tooling transition.',
    juryConsensusText: 'The autonomous jury panel unanimously confirms that AeroPulse PX-4 represents an accomplished, doctoral-caliber robotics thesis. The EKF sensor fusion operates reliably in unmapped subterranean chambers, and the $284 BOM unit economics democratize search-and-rescue autonomy. Clearance for commercial deployment is approved once the ESC timing desync is refactored.',
    votingBreakdown: [
      {
        jurorName: 'Dr. Evelyn Vance',
        role: 'Chief Technical Juror (MIT)',
        voteScore: 90,
        verdictStance: 'Endorse with Stipulations',
        quote: '“The dual-core FreeRTOS architecture and state-space conditioning are doctoral caliber. Clean the ESC timing jitter, and this is ready for real coal tunnels.”'
      },
      {
        jurorName: 'Marcus Thorne',
        role: 'Field Robotics Safety (FEMA)',
        voteScore: 88,
        verdictStance: 'Endorse with Stipulations',
        quote: '“Watching AeroPulse maintain subterranean hover in dense dust clouds proved the viability of acoustic-optical fusion.”'
      },
      {
        jurorName: 'Dr. Alistair Finch',
        role: 'Patents & Prior Art (IEEE)',
        voteScore: 91,
        verdictStance: 'Unanimous Endorsement',
        quote: '“This is not an ArduPilot wrapper. The sensor interleaving algorithm represents an inventive contribution to GPS-denied robotics.”'
      },
      {
        jurorName: 'Elena Rostova',
        role: 'Humanitarian Impact (UN OCHA)',
        voteScore: 87,
        verdictStance: 'Conditional Approval',
        quote: '“The lifesaving humanitarian impact is undeniable. The team showed exemplary composure under rigorous jury cross-examination.”'
      }
    ],
    weightDistribution: [
      { dimension: 'Problem & Need', weight: 10, score: 88, contribution: 8.8 },
      { dimension: 'Technical Quality', weight: 20, score: 84, contribution: 16.8 },
      { dimension: 'Innovation & Originality', weight: 15, score: 86, contribution: 12.9 },
      { dimension: 'Social Impact', weight: 10, score: 90, contribution: 9.0 },
      { dimension: 'Presentation', weight: 10, score: 82, contribution: 8.2 },
      { dimension: 'Demonstration Quality', weight: 15, score: 74, contribution: 11.1 },
      { dimension: 'Feasibility & Scalability', weight: 10, score: 76, contribution: 7.6 },
      { dimension: 'Future Potential', weight: 10, score: 85, contribution: 8.5 }
    ],
    groundedConclusions: [
      {
        statement: 'Weighted consensus score of 89 reflects empirical rigor across all 20 evaluated dimensions.',
        evidence: 'Mathematical sum of 8 dimension weights strictly totaling 100%',
        confidence: 97,
        source: 'Consensus Formula Engine v4.2'
      }
    ]
  }
};

export const MOCK_SOFTWARE_DOSSIER: MasterDossierData = {
  projectId: 'dossier-quantumkey-tls',
  projectName: 'QuantumKey TLS v1.3 Post-Quantum Gateway',
  projectType: 'software',
  tagline: 'Post-Quantum Lattice Cryptography & Classical ECDH Hybrid Key Exchange for High-Throughput TLS Gateways',
  author: 'Team QuantumKey (Applied Cryptography Laboratory)',
  institution: 'ETH Zurich & Technical University of Munich',
  evaluatedAt: '2026-09-04T20:15:00Z',
  evaluationEngineVersion: 'ProjectX-Ray Consensus Engine v4.2.1-prod',
  overallScore: 92,
  aiVerdict: 'Exceptional',
  confidenceScore: 98,
  grade: 'A+ (Summa Cum Laude)',
  percentile: 'Top 0.8% of Global Submissions',
  juryPanel: [
    'Dr. Evelyn Vance (Applied Cryptography, MIT)',
    'Marcus Thorne (High-Scale Systems, Cloudflare)',
    'Dr. Alistair Finch (Formal Verification, INRIA)',
    'Elena Rostova (Digital Privacy & Policy, EFF)'
  ],

  // 1. Executive Summary
  executiveSummary: {
    headline: 'High-throughput hybrid post-quantum TLS gateway sustaining 104,200 handshakes/sec with verified side-channel immunity.',
    verdict: 'Approved for immediate open-source standardization and Linux Foundation Post-Quantum Alliance incubation.',
    keyFindings: [
      'Sub-millisecond hybrid key exchange (13.8μs ML-KEM-768 + 18.2μs X25519) operating on pure Rust with zero unsafe memory violations.',
      'Valgrind and dudect statistical t-tests confirm constant-time execution with zero cache-timing leakage.',
      'Middlebox MTU fragmentation avoidance mechanism dynamically coalesces ClientHello packets to prevent TCP stall.',
      'Drop-in NGINX dynamic module compiles to an ultra-compact 8.4MB container image with under 42MB peak RAM.'
    ],
    juryRecommendation: 'Recommend immediate submission to IETF TLS Working Group and engagement with financial sector pilot gateways.',
    groundedConclusions: [
      {
        statement: 'Cryptographic execution is strictly constant-time down to compiler assembly.',
        evidence: 'Dudect statistical t-test p-value > 0.05 across 10M continuous iterations',
        confidence: 99,
        source: 'CI Automated Side-Channel Test Suite'
      }
    ]
  },

  // 2. Project DNA
  projectDNA: {
    domain: 'Enterprise Cybersecurity & Post-Quantum Cryptography',
    projectType: 'Cryptographic TLS Ingress Gateway',
    targetAudience: 'Banking API Gateways, Cloudflare / Fastly Edge Proxies, Defense Communications',
    coreStack: ['Pure Rust (2024 Edition)', 'AVX-512 & NEON SIMD', 'Tokio Asynchronous Runtime', 'eBPF / XDP', 'ML-KEM-768', 'X25519'],
    inputs: ['Raw TLS 1.3 ClientHello Packets', 'PKCS#11 Hardware Security Module Keys', 'X.509 Certificate Chains'],
    outputs: ['Negotiated Hybrid TLS 1.3 Sessions', 'Decrypted HTTP/2 & HTTP/3 Upstream Streams', 'Prometheus Security Telemetry'],
    architecturalTopology: 'Kernel-bypass eBPF packet filter directing incoming TLS connections to an asynchronous pure-Rust cryptographic thread pool.',
    groundedConclusions: [
      {
        statement: 'Zero unsafe code blocks exist in core lattice polynomial arithmetic.',
        evidence: 'cargo-geiger audit confirmed 0 unsafe Rust blocks in crypto modules',
        confidence: 100,
        source: 'Cargo Geiger Security Report'
      }
    ]
  },

  // 3. Problem Analysis
  problemAnalysis: {
    problemStatement: 'Nation-state adversaries are currently executing "Harvest Now, Decrypt Later" operations, intercepting confidential encrypted traffic to decrypt once quantum cryptanalysis becomes viable.',
    severityLevel: 'Critical',
    baselineContext: 'Classical RSA-2048 and ECDH-256 will be compromised on Q-Day; legacy software wrappers introduce severe 8x latency penalties.',
    targetPainPoints: [
      'Lattice public keys are 800x larger than classical keys, causing TCP packet fragmentation.',
      'Software OpenSSL wrappers add 18ms of CPU overhead per connection.',
      'Lack of drop-in compatibility prevents existing enterprise microservices from adopting PQC.'
    ],
    marketDeficiency: 'Commercial appliance solutions require $120,000 hardware appliances and cannot be deployed in cloud-native containers.',
    groundedConclusions: [
      {
        statement: 'Need is mandated by global government and defense cybersecurity directives.',
        evidence: 'NIST Special Publication 800-227 Section 3.2 mandates transition by 2028',
        confidence: 99,
        source: 'NIST Post-Quantum Directive SP-800-227'
      }
    ]
  },

  // 4. Technical Audit
  technicalAudit: {
    score: 94,
    auditStatus: 'Architecturally Flawless & Production Ready',
    subscores: [
      { category: 'Cryptographic Algorithm Fidelity', score: 98, confidence: 99, verdict: 'Strict compliance with NIST FIPS 203 (ML-KEM)' },
      { category: 'Memory Safety & Concurrency', score: 96, confidence: 98, verdict: 'Zero unsafe blocks, linear Tokio core scaling' },
      { category: 'Performance & SIMD Optimization', score: 92, confidence: 97, verdict: 'AVX-512 NTT polynomial reducer operates in 12.4μs' },
      { category: 'Side-Channel Resistance', score: 94, confidence: 98, verdict: 'Verified constant-time execution via dudect suite' }
    ],
    strengths: [
      'Constant-time AVX-512 Montgomery arithmetic vectorization.',
      'Automated memory scrubbing on drop using sodium_memzero equivalents.',
      'Linear multi-core throughput scaling (R^2 = 0.994 up to 16 cores).'
    ],
    architecturalCritique: 'Fallback scalar routines on older non-AVX2 hardware run 3.8x slower; should implement auto-vectorized unrolled loops.',
    groundedConclusions: [
      {
        statement: 'Zero memory leaks detected across 72-hour continuous stress test.',
        evidence: 'Resident set size held steady at 38.4MB over 2.59 billion completed handshakes',
        confidence: 99,
        source: 'Valgrind Massif Memory Soak Log #VAL-72H'
      }
    ]
  },

  // 5. Innovation & Originality
  originalityInvestigation: {
    originalityScore: 89.2,
    similarityScore: 10.8,
    tier: 'Original',
    priorArtHighlights: [
      { source: 'OpenQuantumSafe (OQS) liboqs', similarity: 18.2, category: 'Open Source', differentiation: 'Pure Rust zero-allocation pipeline vs C-wrapper interface' },
      { source: 'Cloudflare CIRCL Cryptography Library', similarity: 14.5, category: 'Industry Library', differentiation: 'Adaptive MTU middlebox fragment coalescing engine' },
      { source: 'BoringSSL Experimental PQC Branch', similarity: 11.0, category: 'Browser Engine', differentiation: '18% lower tail latency (p99) under packet fragmentation' }
    ],
    groundedConclusions: [
      {
        statement: 'Adaptive MTU fragment coalescing mechanism represents an inventive step accepted in IETF queue.',
        evidence: 'IETF Datatracker accepted draft draft-quantum-hybrid-mtu-01',
        confidence: 95,
        source: 'IETF TLS Working Group Submission Confirmation'
      }
    ]
  },

  // 6. Claim Verification
  claimVerification: {
    verifiedCount: 6,
    totalClaims: 6,
    verificationRate: 100,
    contradictions: 0,
    auditedClaims: [
      { claim: 'Sub-millisecond hybrid handshake cryptographic latency', status: 'Verified', confidence: 98, finding: 'Cryptographic encapsulation measured at 13.8μs; total local proxy overhead 0.42ms', evidenceRef: 'EV-SW-01' },
      { claim: '100,000 requests/second sustained throughput', status: 'Verified', confidence: 96, finding: 'Sustained 104,200 req/sec across 16 CPU cores on AWS c6i.4xlarge testbed', evidenceRef: 'EV-SW-02' },
      { claim: 'Zero cache-timing side-channel leakage', status: 'Verified', confidence: 99, finding: 'Dudect max t-statistic = 1.14 (< 4.5 critical threshold)', evidenceRef: 'EV-SW-03' },
      { claim: 'Drop-in binary compatibility with existing NGINX installations', status: 'Verified', confidence: 97, finding: 'Loaded as standard dynamic module with 1-line configuration directive', evidenceRef: 'EV-SW-04' }
    ],
    groundedConclusions: [
      {
        statement: 'All performance and security claims are empirically validated under independent benchmarks.',
        evidence: 'Independent Criterion.rs test harness and Wireshark packet dumps',
        confidence: 98,
        source: 'Automated CI Test Harness #RUN-391'
      }
    ]
  },

  // 7. Presentation Analysis
  presentationAnalysis: {
    score: 86,
    clarityScore: 94,
    paceWPM: 142,
    confidenceScore: 96,
    fillerWordsPerMin: 0.8,
    structureScore: 94,
    eyeContactGaze: 89,
    postureScore: 88,
    audienceEngagement: 90,
    timeManagement: '07:42 / 08:00 (-18s)',
    keyObservations: [
      'Presenters effectively demystified Learning With Errors (LWE) lattice mathematics.',
      'Live code walkthrough demonstrated how sodium_memzero scrubs session keys.',
      'Clear articulation of business value for non-cryptographic enterprise judges.'
    ],
    groundedConclusions: [
      {
        statement: 'Presentation exhibited exceptional technical pedagogical clarity.',
        evidence: 'Zero defensive hesitations; instant code line citation during jury cross-examination',
        confidence: 96,
        source: 'Session Analytics Recording 00:00-11:20'
      }
    ]
  },

  // 8. Demo Analysis
  demoAnalysis: {
    score: 82,
    completenessRate: 100,
    demonstratedFeaturesCount: 5,
    successfulFeaturesCount: 5,
    failedFeaturesCount: 0,
    unsupportedClaimsCount: 0,
    observedErrors: [
      {
        timestamp: '09:12.100',
        errorType: 'WARN_OS_EMFILE',
        logSnippet: 'Too many open files warning emitted during 100k concurrency ramp before ulimit adjustment',
        consequence: '0.4% connection latency elongation before kernel socket buffer was expanded'
      }
    ],
    featuresDemonstrated: [
      { feature: 'Hybrid X25519+ML-KEM Key Negotiation', status: 'verified', timestamp: '01:30', note: 'Group ID 0x6399 confirmed in ClientHello' },
      { feature: 'Wireshark Packet Trace Inspection', status: 'verified', timestamp: '03:15', note: 'Public key bytes verified on wire' },
      { feature: 'Automated Legacy Client ECDH Fallback', status: 'verified', timestamp: '05:00', note: 'Fallback completed in 0.2ms' },
      { feature: 'Live 10,000 Parallel Handshake Load Test', status: 'verified', timestamp: '07:30', note: 'Median latency 0.84ms' },
      { feature: 'NGINX Reverse Proxy SSL Termination', status: 'verified', timestamp: '09:40', note: 'Zero dropped connections' }
    ],
    groundedConclusions: [
      {
        statement: 'Live Wireshark packet capture verified cryptographic payload integrity on the wire.',
        evidence: 'TLS 1.3 KeyShare extension inspection at Packet #48102',
        confidence: 99,
        source: 'Wireshark PCAP Network Capture Dump'
      }
    ]
  },

  // 9. Social Impact
  socialImpact: {
    score: 84,
    headlineMetric: 'Protects 1.8 Billion Citizens Against Mass Retrospective Decryption',
    peopleAffected: 'Entire global internet userbase interacting with secured financial & healthcare web gateways',
    problemSeverity: 'Catastrophic loss of digital privacy and state infrastructure trust upon quantum supremacy',
    accessibilityBenefit: 'Open-source Apache-2.0 licensing ensures non-governmental and developing-nation servers can deploy protection for free',
    humanitarianValue: 'Preserves confidential human rights disclosures and medical telemetry indefinitely',
    groundedConclusions: [
      {
        statement: 'Securing medical records against retrospective exposure is an urgent societal imperative.',
        evidence: 'Simulated 48-hour continuous SCADA telemetry sync with zero data corruption',
        confidence: 92,
        source: 'IEEE 14-Bus Testbed Evaluation'
      }
    ]
  },

  // 10. Economic Impact
  economicImpact: {
    score: 91,
    headlineMetric: '$4.2M Saved Per Enterprise by Avoiding Microservice Rewrites',
    costSavings: 'Eliminates requirement to re-architect internal legacy microservices by acting as drop-in reverse proxy',
    affordabilityIndex: 'Free open-source software license; minimal cloud compute overhead ($18/month AWS t4g instance)',
    marketRelevance: 'High demand across commercial banking, healthcare HIPAA gateways, and SaaS cloud providers',
    roiEstimate: 'Immediate ROI upon deployment; prevents catastrophic future regulatory fines ($20M+ GDPR penalties)',
    groundedConclusions: [
      {
        statement: 'Drop-in proxy model drastically cuts enterprise migration friction and deployment capital expenditure.',
        evidence: 'Verified 5-minute setup in benchmark Docker environment',
        confidence: 96,
        source: 'Enterprise Gateway Cost Model Report'
      }
    ]
  },

  // 11. Environmental Impact
  environmentalImpact: {
    score: 88,
    headlineMetric: '34% Lower CPU Wattage Than Legacy OpenSSL Wrapper Shims',
    energyUsageProfile: 'AVX-512 vectorization reduces active CPU cycles by 38% compared to reference C implementations',
    materialUsageAndRecyclability: 'Zero hardware footprint; runs entirely in virtualized cloud environments',
    emissionsImplications: 'Saves an estimated 3.4 Joules per 10,000 handshake operations in high-density data centers',
    sustainabilityLifecycle: 'Extends the operational lifespan of existing web server hardware without requiring PCIe crypto accelerators',
    groundedConclusions: [
      {
        statement: 'Algorithmic efficiency directly lowers server carbon emissions across high-scale cloud clusters.',
        evidence: 'Intel RAPL energy counter logged 0.34mJ per handshake vs 0.52mJ for OpenSSL baseline',
        confidence: 94,
        source: 'Intel Running Average Power Limit (RAPL) Power Benchmark'
      }
    ]
  },

  // 12. Feasibility
  feasibility: {
    score: 88,
    trlLevel: 'TRL 6 (Tested in Representative High-Scale Cloud Environment)',
    deploymentComplexity: 'Low',
    infrastructureRequirements: [
      'Linux kernel 5.8+ (for eBPF/XDP)',
      'x86_64 CPU with AVX2/AVX-512 or ARM64 with NEON',
      'Standard container runtime (Docker / Containerd / Kubernetes)'
    ],
    estimatedCapEx: '$0 (Open source drop-in)',
    estimatedOpEx: '$18,400 / yr (Enterprise support and monitoring)',
    maintenanceProfile: 'Automated CI/CD security scanning; zero external dynamic runtime dependencies',
    scalabilityBottleneck: 'Linux ephemeral socket file descriptor exhaustion at extreme concurrency (> 65k concurrent sessions per egress IP)',
    groundedConclusions: [
      {
        statement: 'Production readiness confirmed by tiny 8.4MB container image and low memory footprint.',
        evidence: 'Docker multi-stage musl build size confirmed at 8.4MB',
        confidence: 97,
        source: 'Docker Daemon Benchmark'
      }
    ]
  },

  // 13. Risks
  risks: [
    {
      id: 'RSK-SW-01',
      title: 'OS Socket File Descriptor Exhaustion at >50k Concurrency',
      severity: 'Medium',
      probability: 'Medium',
      category: 'Technical',
      impactArea: 'High-Throughput Gateway Reliability',
      detectedEvidence: 'EMFILE warning observed in stderr buffer during extreme 100k load ramp',
      mitigation: 'Bundle automated sysctl.conf kernel optimization scripts (fs.file-max and somaxconn) into the standard Helm chart deployment.',
      confidence: 96
    },
    {
      id: 'RSK-SW-02',
      title: 'Performance Degradation on Non-Vectorized CPU Architectures',
      severity: 'Low',
      probability: 'Low',
      category: 'Technical',
      impactArea: 'Edge / Legacy Server Throughput',
      detectedEvidence: 'Throughput drops from 4,850 to 1,280 handshakes/sec per core when AVX2 is disabled',
      mitigation: 'Implement auto-vectorized scalar fallback routines using auto-loop unrolling macros.',
      confidence: 94
    }
  ],

  // 14. Recommended Improvements
  improvements: [
    {
      id: 'IMP-SW-01',
      priority: 'P0 (Must Fix)',
      recommendation: 'Bundle automated Linux kernel sysctl optimization profile into standard Docker and Helm charts.',
      rationale: 'Prevents socket exhaustion warnings when handling sudden 50k+ connection spikes.',
      effort: 'Low',
      evidenceTrigger: 'EMFILE stderr warning at 09:12',
      confidence: 97
    },
    {
      id: 'IMP-SW-02',
      priority: 'P1 (High Priority)',
      recommendation: 'Integrate native PKCS#11 HSM driver for hardware root-of-trust private keys.',
      rationale: 'Required for Tier-1 commercial banking and FIPS 140-3 compliance.',
      effort: 'Medium',
      evidenceTrigger: 'Enterprise financial security review inquiry',
      confidence: 95
    },
    {
      id: 'IMP-SW-03',
      priority: 'P2 (Optimization)',
      recommendation: 'Implement Linux io_uring for kernel-bypass zero-copy socket I/O.',
      rationale: 'Further reduces edge gateway CPU overhead by an estimated 12%.',
      effort: 'Medium',
      evidenceTrigger: 'Tokio event loop profiling',
      confidence: 90
    }
  ],

  // 15. Future Scope
  futureScope: {
    shortTermRoadmap: [
      'Complete third-party cryptographic audit with Trail of Bits (Q3 2026).',
      'Publish official AWS Marketplace and Kubernetes Helm 1-click ingress controller.',
      'Integrate NIST FIPS 204 (ML-DSA Dilithium) digital signature authentication.'
    ],
    longTermVision: 'Universal cryptographic mesh managing hybrid post-quantum key governance across multi-cloud enterprise Kubernetes clusters.',
    ipAndPatentPotential: 'High patentability for the dynamic TCP MSS middlebox recovery algorithm and zero-alloc AVX-512 polynomial reducer.',
    groundedConclusions: [
      {
        statement: 'Forward-compatible architecture allows seamless addition of post-quantum signatures without rewrite.',
        evidence: 'Trait-based signer blueprint verified in PR #42',
        confidence: 94,
        source: 'Architecture Doc SignatureExtension.md'
      }
    ]
  },

  // 16. Commercialization Potential
  commercializationPotential: {
    score: 92,
    marketMaturity: 'High Urgency Regulatory Compliance ($14.2B Global Market by 2028)',
    targetBuyerPersona: 'Chief Information Security Officers (CISOs), VP of Infrastructure, Cloud Security Architects',
    go_to_market_strategy: 'Open-core model: free open-source gateway for standard TLS, paid enterprise edition with HSM integration and multi-cluster policy orchestration.',
    competitiveMoat: 'Pure Rust memory-safe engine with verified 104k RPS performance and zero-allocation SIMD vectorization.',
    regulatoryPath: 'NIST FIPS 140-3 CAVP cryptographic validation; Common Criteria EAL4+ compliance.',
    unitEconomics: {
      bomOrHostingCost: '$0.000004 / 1,000 handshakes on AWS Graviton',
      targetSellingPrice: '$48,000 / year / enterprise cluster license',
      projectedGrossMargin: '96.5% software gross margin'
    },
    groundedConclusions: [
      {
        statement: 'Enterprise willingness to pay is exceptionally high due to impending federal compliance deadlines.',
        evidence: 'NIST Post-Quantum Cryptography transition guidance for financial systems',
        confidence: 96,
        source: 'Financial Services Information Sharing and Analysis Center (FS-ISAC)'
      }
    ]
  },

  // 17. Judge Questions
  judgeQuestions: [
    {
      id: 'JQ-SW-01',
      question: 'Your 104,200 req/sec benchmark was conducted on a local 16-core cluster with minimal network latency. What is your verified handshake throughput under 45ms transatlantic RTT with 0.5% packet loss?',
      targetVulnerability: 'Benchmarking in local network conceals middlebox TCP fragmentation penalties.',
      rationale: 'Post-quantum public keys are large; packet fragmentation over real-world WAN links can degrade user experience.',
      requiredProof: 'Submit Grafana dashboard telemetry from multi-region AWS WAN stress test.'
    },
    {
      id: 'JQ-SW-02',
      question: 'How do you guarantee that constant-time AVX-512 instructions are not optimized away by LLVM into variable-time branch instructions during release compilation?',
      targetVulnerability: 'Compiler optimizations compromising cryptographic constant-time execution.',
      rationale: 'Subtle compiler optimizations can re-introduce timing side channels.',
      requiredProof: 'Provide dudect t-statistic distribution plot proving null hypothesis of zero timing leakage across 10M samples.'
    },
    {
      id: 'JQ-SW-03',
      question: 'What is your operational failover protocol if the NIST ML-KEM lattice parameters are mathematically compromised by future cryptanalytic advances?',
      targetVulnerability: 'Cryptographic primitive fragility.',
      rationale: 'Agility is a core requirement of post-quantum readiness.',
      requiredProof: 'Demonstrate zero-downtime hot-reloading of alternative KEM algorithms (e.g. HQC or FrodoKEM).'
    }
  ],

  // 18. Evidence
  evidenceLocker: [
    {
      id: 'EV-SW-01',
      title: 'AVX-512 Montgomery Arithmetic Implementation',
      type: 'Code Audit',
      source: 'src/crypto/mlkem.rs:L142-L195',
      location: 'src/crypto/mlkem.rs',
      reliabilityScore: 99,
      excerpt: 'Zero-heap-allocation AVX-512 SIMD vectorization with inline assembly constant-time reduction.'
    },
    {
      id: 'EV-SW-02',
      title: '72-Hour Continuous Memory & Latency Soak Test',
      type: 'Benchmark',
      source: 'Automated CI Test Pipeline #391',
      location: 'tests/soak/72h_valgrind_soak_report.pdf',
      reliabilityScore: 99,
      excerpt: 'Zero memory leaks detected across 2.59 billion completed TLS sessions. Resident Set Size stayed at 38.4MB.'
    },
    {
      id: 'EV-SW-03',
      title: 'Dudect Statistical Timing Leakage Analysis',
      type: 'Benchmark',
      source: 'Dudect Test Suite Release Build',
      location: 'tests/crypto/dudect_timing_analysis.csv',
      reliabilityScore: 98,
      excerpt: 'Max t-statistic = 1.14 (< 4.5 critical threshold); confirms constant-time execution under 10M samples.'
    },
    {
      id: 'EV-SW-04',
      title: 'NGINX Dynamic Module Drop-in ABI Verification',
      type: 'Code Audit',
      source: 'modules/ngx_http_quantum_module.c',
      location: 'modules/ngx_http_quantum_module.c',
      reliabilityScore: 97,
      excerpt: 'Clean dynamic module ABI integration with NGINX 1.25+ mainline without modifying core source.'
    }
  ],

  // 19. External Sources
  sourcesAndCitations: [
    {
      id: 'SRC-SW-01',
      title: 'NIST FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard',
      type: 'RFC / Standard',
      citation: 'National Institute of Standards and Technology, FIPS 203 Standard, August 2024.',
      relevanceToEvaluation: 'The official international standard for post-quantum key encapsulation (ML-KEM).'
    },
    {
      id: 'SRC-SW-02',
      title: 'Faster Post-Quantum Cryptography on AVX-512 Architectures',
      type: 'Research Paper',
      citation: 'IACR Cryptology ePrint Archive, Report 2023/1288, CRYPTO 2023.',
      relevanceToEvaluation: 'Academic foundation for vectorized NTT polynomial multiplication.'
    },
    {
      id: 'SRC-SW-03',
      title: 'RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3',
      type: 'RFC / Standard',
      citation: 'Internet Engineering Task Force (IETF), RFC 8446, August 2018.',
      relevanceToEvaluation: 'Underlying protocol standard for TLS 1.3 key share extensions.'
    },
    {
      id: 'SRC-SW-04',
      title: 'Open Quantum Safe (OQS) liboqs-rust Repository',
      type: 'GitHub Repository',
      citation: 'github.com/open-quantum-safe/liboqs-rust, 2024.',
      relevanceToEvaluation: 'Open-source benchmark reference against which QuantumKey was compared.'
    }
  ],

  // 20. Final AI Jury Verdict
  finalVerdictConsensus: {
    score: 92,
    tier: 'Exceptional',
    verdictStatement: 'World-class cryptographic implementation delivering sub-millisecond post-quantum security with proven memory safety and zero side channels.',
    juryConsensusText: 'The autonomous AI jury panel awards Tier-1 Exceptional Honors to the QuantumKey TLS v1.3 Hybrid Engine. The project delivers unmatched performance, memory safety, and empirical constant-time side-channel resistance. Its drop-in NGINX compatibility and dynamic MTU fragment coalescing solve the hardest operational roadblocks to real-world post-quantum deployment.',
    votingBreakdown: [
      {
        jurorName: 'Dr. Evelyn Vance',
        role: 'Chief Technical Juror (MIT)',
        voteScore: 94,
        verdictStance: 'Unanimous Endorsement',
        quote: '“Clean Rust, zero unsafe memory violations in core cryptographic paths, and constant-time execution confirmed by statistical t-tests. Outstanding work.”'
      },
      {
        jurorName: 'Marcus Thorne',
        role: 'High-Scale Systems (Cloudflare)',
        voteScore: 92,
        verdictStance: 'Unanimous Endorsement',
        quote: '“The NGINX drop-in module was the clincher. Too many student projects write algorithms in a void; these authors packaged it for instant production drop-in.”'
      },
      {
        jurorName: 'Dr. Alistair Finch',
        role: 'Formal Verification (INRIA)',
        voteScore: 93,
        verdictStance: 'Unanimous Endorsement',
        quote: '“Their adaptive MTU fragment coalescing solves the biggest barrier to practical post-quantum TLS adoption. A clear patent and publication candidate.”'
      },
      {
        jurorName: 'Elena Rostova',
        role: 'Digital Privacy & Policy (EFF)',
        voteScore: 89,
        verdictStance: 'Unanimous Endorsement',
        quote: '“Securing long-term citizen health and civil identity data against state-level retrospective decryption is a fundamental human rights imperative.”'
      }
    ],
    weightDistribution: [
      { dimension: 'Problem & Need', weight: 10, score: 92, contribution: 9.2 },
      { dimension: 'Technical Quality', weight: 20, score: 89, contribution: 17.8 },
      { dimension: 'Innovation & Originality', weight: 15, score: 91, contribution: 13.65 },
      { dimension: 'Social Impact', weight: 10, score: 84, contribution: 8.4 },
      { dimension: 'Presentation', weight: 10, score: 86, contribution: 8.6 },
      { dimension: 'Demonstration Quality', weight: 15, score: 82, contribution: 12.3 },
      { dimension: 'Feasibility & Scalability', weight: 10, score: 88, contribution: 8.8 },
      { dimension: 'Future Potential', weight: 10, score: 90, contribution: 9.0 }
    ],
    groundedConclusions: [
      {
        statement: 'Weighted consensus score of 92 qualifies for Tier-1 Summa Cum Laude distinction.',
        evidence: 'Mathematical sum of 8 dimension weights strictly totaling 100%',
        confidence: 99,
        source: 'Consensus Formula Engine v4.2'
      }
    ]
  }
};

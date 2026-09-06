import type { PresentationDemoReport } from '../types/presentationDemo';

export const MOCK_HARDWARE_PRES_DEMO: PresentationDemoReport = {
  projectId: 'pres-hw-aeropulse-px4',
  projectName: 'AeroPulse PX-4 Autonomous Search & Rescue UAV',
  projectType: 'hardware',
  sessionTitle: 'Live Jury Final Defense & Dark Tunnel Flight Demo',
  presenter: 'Alex Mercer (Lead Avionics & Robotics)',
  evaluatedAt: '2026-09-04T19:55:00Z',
  durationSeconds: 494, // 8 min 14 sec
  durationFormatted: '08:14',
  compositeScore: 88.5,
  confidenceLevel: 97.2,
  mode: 'demo-playback',

  presentation: {
    overallScore: 86.8,

    // 1. Clarity
    clarity: {
      id: 'sp-1',
      key: 'clarity',
      name: 'Vocal Clarity & Intelligibility',
      score: 89,
      rating: 'Strong',
      measuredValue: '28.4 dB SNR',
      optimalBenchmark: '> 25.0 dB SNR',
      headline: 'Crisp articulation of complex sensor fusion concepts with minimal acoustic muffling',
      detailedAnalysis: 'Audio spectrum shows consistent fundamental formant frequencies (120-180 Hz) with sharp consonant enunciation. No clipping or microphone breathing pops detected during high-intensity demo.',
      evidenceSnippets: [
        {
          id: 'ev-cl-1',
          type: 'audio-waveform',
          timestamp: '01:24',
          label: 'Acoustic Clarity Peak',
          sourceLocation: 'session_audio_ch1.wav',
          snippet: 'Explained Extended Kalman Filter (EKF2) state propagation equations with 94.2% speech-to-text recognition confidence.',
          metricCorrelation: 'Directly corroborated by automated Whisper-v3 transcript accuracy.'
        }
      ]
    },

    // 2. Speaking Pace
    speakingPace: {
      id: 'sp-2',
      key: 'speakingPace',
      name: 'Speaking Pace & Cadence',
      score: 92,
      rating: 'Exceptional',
      measuredValue: '138 WPM',
      optimalBenchmark: '130 - 145 WPM',
      headline: 'Balanced cadence maintaining steady listener comprehension throughout technical segments',
      detailedAnalysis: 'Speaker maintained a steady 134-142 WPM over 8 slides. Brief acceleration to 154 WPM was observed only during the emergency parachute sequence (06:05), matching the dramatic urgency of the drop test.',
      evidenceSnippets: [
        {
          id: 'ev-pace-1',
          type: 'transcript-excerpt',
          timestamp: '03:10',
          label: 'Pacing Distribution',
          sourceLocation: 'telemetry/speech_cadence_histogram.json',
          snippet: 'Slide 4 (Avionics CAN-FD Bus): 136 words delivered in 59.2 seconds = 137.8 WPM.',
          metricCorrelation: 'Matches optimal instructional comprehension bracket.'
        }
      ]
    },

    // 3. Confidence
    confidence: {
      id: 'sp-3',
      key: 'confidence',
      name: 'Vocal Confidence & Conviction',
      score: 88,
      rating: 'Strong',
      measuredValue: '88% Conviction Index',
      optimalBenchmark: '> 80%',
      headline: 'Assertive technical delivery with minimal vocal hesitation or rising uptalk inflection',
      detailedAnalysis: 'Pitch variance remained controlled (standard deviation: 18 Hz). Only 2 instances of hesitant trailing-off detected when addressing battery hover current.',
      evidenceSnippets: [
        {
          id: 'ev-conf-1',
          type: 'audio-waveform',
          timestamp: '05:40',
          label: 'Pitch Stability Trace',
          sourceLocation: 'telemetry/pitch_contour.csv',
          snippet: 'Flat assertive sentence completions during Q&A cross-examination on optical flow drift rates.',
          metricCorrelation: 'Demonstrates deep domain mastery.'
        }
      ]
    },

    // 4. Filler Words
    fillerWords: {
      id: 'sp-4',
      key: 'fillerWords',
      name: 'Filler Words & Verbal Crutches',
      score: 82,
      rating: 'Strong',
      measuredValue: '14 Fillers (1.7/min)',
      optimalBenchmark: '< 3.0 / min',
      headline: 'Low filler frequency overall, with localized clustering during difficult transition slides',
      detailedAnalysis: 'Detected 14 filler utterances across 8 minutes. Significant cluster of 5 fillers ("uh", "um") occurred between 01:38 and 02:05 when transitioning to the power consumption slide.',
      totalCount: 14,
      perMinute: 1.7,
      breakdown: [
        { word: 'uh', count: 7, timestamps: ['01:42', '01:50', '02:01', '03:45', '04:12', '06:30', '07:14'] },
        { word: 'um', count: 4, timestamps: ['01:48', '02:04', '04:30', '07:45'] },
        { word: 'basically', count: 2, timestamps: ['03:12', '05:18'] },
        { word: 'like', count: 1, timestamps: ['05:22'] }
      ],
      evidenceSnippets: [
        {
          id: 'ev-fill-1',
          type: 'transcript-excerpt',
          timestamp: '01:48',
          label: 'Filler Word Cluster',
          sourceLocation: 'session_transcript.vtt',
          snippet: '"And, uh, as you can see, the battery, um, basically maintains..."',
          metricCorrelation: 'Marks hesitation during the contested 4.2mA claim.'
        }
      ]
    },

    // 5. Explanation Structure
    explanationStructure: {
      id: 'sp-5',
      key: 'explanationStructure',
      name: 'Explanation Structure & Logic',
      score: 90,
      rating: 'Exceptional',
      measuredValue: '90 / 100 Flow Index',
      optimalBenchmark: '> 85 / 100',
      headline: 'Classic Problem → Sensor Architecture → Confined Demo → Impact narrative',
      detailedAnalysis: 'Seamless transitions between slides with clear signposting ("First we examine subterranean blindness, next our 77GHz radar solution, followed by the flight proof").',
      evidenceSnippets: [
        {
          id: 'ev-struct-1',
          type: 'transcript-excerpt',
          timestamp: '00:45',
          label: 'Structural Signpost',
          sourceLocation: 'session_transcript.vtt',
          snippet: '"Before showing the live chamber flight, let us inspect the underlying hardware reason standard drones crash underground."',
          metricCorrelation: 'Clear rhetorical roadmap for jury.'
        }
      ]
    },

    // 6. Eye Contact
    eyeContact: {
      id: 'sp-6',
      key: 'eyeContact',
      name: 'Eye Contact & Gaze Engagement',
      score: 84,
      rating: 'Strong',
      measuredValue: '84% Camera / Jury Gaze',
      optimalBenchmark: '> 75%',
      headline: 'High forward camera orientation; brief gaze drops to physical flight controller on table',
      detailedAnalysis: 'Gaze tracking shows 84% time looking directly at audience/camera. 12% directed down to point at physical Pelican case hardware, 4% glancing at slide notes.',
      evidenceSnippets: [
        {
          id: 'ev-gaze-1',
          type: 'gaze-heatmap',
          timestamp: '02:40',
          label: 'Gaze Tracking Vector',
          sourceLocation: 'vision/gaze_vectors.json',
          snippet: 'Centroid gaze vector centered on primary jury camera lens for 48 consecutive seconds.',
          metricCorrelation: 'Demonstrates conversational connection.'
        }
      ]
    },

    // 7. Posture
    posture: {
      id: 'sp-7',
      key: 'posture',
      name: 'Physical Posture & Gestures',
      score: 85,
      rating: 'Strong',
      measuredValue: 'Open & Grounded Stance',
      optimalBenchmark: 'Minimal swaying / open gestures',
      headline: 'Open palms with purposeful physical demonstrations holding the custom 4-layer PCB',
      detailedAnalysis: 'No nervous pacing or weight-shifting detected by pose estimator. Natural hand gestures synchronized with slide bullet points.',
      evidenceSnippets: [
        {
          id: 'ev-pos-1',
          type: 'video-frame',
          timestamp: '03:15',
          label: 'Pose Skeletal Estimation',
          sourceLocation: 'vision/pose_keypoints.json',
          snippet: 'Upright torso (88 degrees), two-handed presentation of Pelican charging dock.',
          metricCorrelation: 'High professional stage presence.'
        }
      ]
    },

    // 8. Audience Engagement
    audienceEngagement: {
      id: 'sp-8',
      key: 'audienceEngagement',
      name: 'Audience Engagement & Hooks',
      score: 83,
      rating: 'Strong',
      measuredValue: '3 Rhetorical Hooks',
      optimalBenchmark: '> 2 Hooks',
      headline: 'Used relatable miner rescue analogies and interactive live chamber telemetry checks',
      detailedAnalysis: 'Presenter invited judges to observe the real-time thermal stream while turning off the room lights, creating a memorable visceral demonstration.',
      evidenceSnippets: [
        {
          id: 'ev-eng-1',
          type: 'transcript-excerpt',
          timestamp: '02:10',
          label: 'Engagement Hook',
          sourceLocation: 'session_transcript.vtt',
          snippet: '"Imagine entering an abandoned coal shaft in complete darkness—let us turn off the studio lights and see what AeroPulse sees."',
          metricCorrelation: 'High-impact presentation theater.'
        }
      ]
    },

    // 9. Time Management
    timeManagement: {
      id: 'sp-9',
      key: 'timeManagement',
      name: 'Time Management & Allocation',
      score: 88,
      rating: 'Strong',
      measuredValue: '08:14 / 08:00 Target',
      optimalBenchmark: '± 30 seconds',
      headline: 'Within 14 seconds of target 8-minute window; left ample 4-minute jury Q&A reserve',
      detailedAnalysis: 'Allotted 8 minutes. Completed at 8 minutes 14 seconds (+14s overtime, well within acceptable ±30s margin). Slide pacing averaged 55 seconds per slide.',
      allocatedMinutes: 8,
      actualMinutes: 8.23,
      overtimeSeconds: 14,
      evidenceSnippets: [
        {
          id: 'ev-time-1',
          type: 'video-frame',
          timestamp: '08:14',
          label: 'Session Conclusion Timestamp',
          sourceLocation: 'session_recording.mp4',
          snippet: 'Concluding slide reached at 08:14:02. Handed off to jury Q&A smoothly.',
          metricCorrelation: 'Disciplined time allocation.'
        }
      ]
    },

    timeline: [
      {
        id: 'pe-1',
        timestamp: '00:00',
        seconds: 0,
        type: 'slide-transition',
        title: 'Title Slide: AeroPulse Introduction',
        description: 'Session commenced; presenter welcomed the jury panel and stated the subterranean rescue mission.',
        speakerQuote: 'Good morning jury panel. We present AeroPulse PX-4, the autonomous UAV engineered for GPS-denied mine rescues.',
        slideNumber: 1,
        confidenceAtEvent: 95
      },
      {
        id: 'pe-2',
        timestamp: '01:15',
        seconds: 75,
        type: 'key-assertion',
        title: 'Problem Formulation: Confined Space Fatality Rates',
        description: 'Outlined NIOSH statistics on secondary collapses during human rescue.',
        speakerQuote: 'Eighty-two percent of trapped miner fatalities occur not in the blast, but from delayed air reconnaissance.',
        slideNumber: 2,
        confidenceAtEvent: 96
      },
      {
        id: 'pe-3',
        timestamp: '01:48',
        seconds: 108,
        type: 'filler-cluster',
        title: 'Hesitation Spike on Power Slide',
        description: 'Brief clustering of "uh" and "um" when discussing hover battery draw.',
        speakerQuote: 'And, uh, as you can see, the battery, um, basically maintains four point two milliamps...',
        slideNumber: 3,
        confidenceAtEvent: 74,
        evidenceRefId: 'ev-fill-1'
      },
      {
        id: 'pe-4',
        timestamp: '02:14',
        seconds: 134,
        type: 'slide-transition',
        title: 'Transition to Live Flight Chamber Demo',
        description: 'Dimmed studio lights to 0 lux; switched primary feed to UAV thermal FLIR camera.',
        speakerQuote: 'Now, let us turn off the lights and watch AeroPulse enter the darkened test tunnel autonomously.',
        slideNumber: 4,
        confidenceAtEvent: 94
      },
      {
        id: 'pe-5',
        timestamp: '04:48',
        seconds: 288,
        type: 'key-assertion',
        title: 'Thermal Survivor Signature Acquired',
        description: 'Highlighted real-time 37.2°C thermal heat signature bounding box on tablet.',
        speakerQuote: 'At 18 meters depth, the thermal SLAM locks onto our heated mannequin with sub-centimeter waypoint accuracy.',
        slideNumber: 5,
        confidenceAtEvent: 98
      },
      {
        id: 'pe-6',
        timestamp: '06:12',
        seconds: 372,
        type: 'key-assertion',
        title: 'Ballistic Parachute Emergency Ejection',
        description: 'Triggered simulated brushless motor failure; supercapacitor parachute deployed.',
        speakerQuote: 'Watch as motor two is cut—in twelve milliseconds, the supercapacitor fires the recovery chute.',
        slideNumber: 6,
        confidenceAtEvent: 97
      },
      {
        id: 'pe-7',
        timestamp: '08:14',
        seconds: 494,
        type: 'q-and-a',
        title: 'Presentation Concluded & Jury Q&A Initiated',
        description: 'Thanked the jury and opened floor for technical defense inquiries.',
        speakerQuote: 'Thank you. We are now open for technical defense questions.',
        slideNumber: 8,
        confidenceAtEvent: 93
      }
    ]
  },

  demo: {
    overallScore: 90.2,
    completenessPercentage: 85.7, // 6 of 7 features demonstrated
    successfulFeaturesCount: 5,
    failedFeaturesCount: 1,
    unsupportedClaimsCount: 1,

    features: [
      {
        id: 'df-1',
        name: 'Autonomous 0-Lux Tunnel Navigation',
        category: 'Autonomy & SLAM',
        status: 'verified',
        claimText: 'Navigates subterranean rock tunnels in total darkness without GPS or manual joystick input.',
        observedResult: 'UAV autonomously traversed 22 meters of dark simulated tunnel at 2.8 m/s without touching walls.',
        timestampStart: '02:14',
        timestampEnd: '03:40',
        latencyOrPerformance: '0.84cm drift / 2.8 m/s',
        evidenceRefId: 'ev-demo-1'
      },
      {
        id: 'df-2',
        name: 'Real-Time Thermal Heat Signature Tracking',
        category: 'Perception AI',
        status: 'verified',
        claimText: 'Detects trapped human body heat at > 15m in heavy airborne dust.',
        observedResult: 'Identified 37.2°C thermal mannequin target in 42ms; overlaid green bounding box and GPS-denied coordinates.',
        timestampStart: '04:45',
        timestampEnd: '05:15',
        latencyOrPerformance: '42ms inference on Jetson Orin',
        evidenceRefId: 'ev-demo-2'
      },
      {
        id: 'df-3',
        name: 'Supercapacitor Ballistic Parachute Ejection',
        category: 'Safety & Fail-Safe',
        status: 'verified',
        claimText: 'Fires recovery chute in < 15ms upon free-fall detection.',
        observedResult: 'Chute deployed in 12.4ms upon cutting motor power; airframe soft-landed safely on tether.',
        timestampStart: '06:10',
        timestampEnd: '06:35',
        latencyOrPerformance: '12.4ms ejection actuation',
        evidenceRefId: 'ev-demo-3'
      },
      {
        id: 'df-4',
        name: 'CAN-FD Bus Real-Time Telemetry Streaming',
        category: 'Avionics',
        status: 'verified',
        claimText: 'Streams 5Mbps telemetry packet bus with zero dropped frames.',
        observedResult: 'CAN-FD bus logged 1,240 frames/sec; zero cyclic redundancy check (CRC) errors observed.',
        timestampStart: '03:45',
        timestampEnd: '04:20',
        latencyOrPerformance: '0 CRC errors / 1.24k fps',
        evidenceRefId: 'ev-demo-4'
      },
      {
        id: 'df-5',
        name: 'One-Button Autonomous Home Base Return',
        category: 'Autonomy',
        status: 'verified',
        claimText: 'Single button press initiates backtrack along exact ingress path.',
        observedResult: 'UAV executed 180-degree yaw turn and returned to Pelican launch pad within 2.1cm accuracy.',
        timestampStart: '07:10',
        timestampEnd: '07:50',
        latencyOrPerformance: '2.1cm landing precision',
        evidenceRefId: 'ev-demo-5'
      },
      {
        id: 'df-6',
        name: 'High-Current Battery Shunt Power Profile',
        category: 'Power Subsystem',
        status: 'failed',
        claimText: 'Operates hover at 4.2mA continuous draw as asserted in pitch deck slide 3.',
        observedResult: 'Live shunt oscilloscope registered 12.84A (190W) continuous hover draw. The 4.2mA figure was only idle MCU standby.',
        timestampStart: '05:25',
        timestampEnd: '05:45',
        latencyOrPerformance: '12.84A actual vs 4.2mA claimed',
        evidenceRefId: 'ev-demo-6'
      },
      {
        id: 'df-7',
        name: 'Multi-Kilometer Subterranean RF Relay Penetration',
        category: 'Communications',
        status: 'unsupported',
        claimText: 'Penetrates > 1.5km of subterranean granite rock via dropped RF relay pods.',
        observedResult: 'Not demonstrated during live session. Presenter deferred to lab simulation reports due to indoor testing facility constraints.',
        timestampStart: '07:55',
        timestampEnd: '08:05',
        latencyOrPerformance: 'Deferred to slides',
        evidenceRefId: 'ev-demo-7'
      }
    ],

    observedErrors: [
      {
        id: 'err-1',
        timestamp: '05:32',
        severity: 'medium',
        title: 'Motor 3 Voltage Transient Spike on Fast Yaw',
        description: 'Rapid 180-degree yaw maneuver caused 18.2V back-EMF spike on ESC bus, causing a momentary 120ms telemetry packet freeze.',
        logSnippet: '[WARN] ESC3: Voltage transient +3.4V over threshold (18.2V). Telemetry buffer suppressed 2 frames.',
        impactOnDemo: 'Screen telemetry flickered briefly, but flight attitude remained stable with zero altitude loss.',
        recovered: true
      },
      {
        id: 'err-2',
        timestamp: '05:38',
        severity: 'high',
        title: 'Power Shunt Discrepancy Flagged by Telemetry HUD',
        description: 'Telemetry overlay broadcast 190.4W consumption while slide bullet asserted 4.2mA.',
        logSnippet: '[METRIC] INA219_SHUNT: Current=12.84A, BusVoltage=14.82V, Power=190.28W.',
        impactOnDemo: 'Jury noted contradiction in real-time chat log.',
        recovered: false
      }
    ],

    timeline: [
      {
        id: 'de-1',
        timestamp: '02:14',
        seconds: 134,
        action: 'Launch Command Initiated on Pelican Case',
        targetComponent: 'Avionics Master Switch',
        outcome: 'success',
        systemResponse: 'STM32 arming tone sounded; quad motors spooled to 4,200 RPM hover idle.',
        latencyMs: 120,
        telemetrySnippet: 'ARM_STATUS: OK, SENSORS_READY: TRUE'
      },
      {
        id: 'de-2',
        timestamp: '02:40',
        seconds: 160,
        action: 'Tunnel Entrance Optical Ingress',
        targetComponent: 'Downward Optical Flow & 77GHz Radar',
        outcome: 'success',
        systemResponse: 'Ambient light dropped to 0 lux; radar obstacle avoidance took over lateral position hold.',
        latencyMs: 14,
        telemetrySnippet: 'LUX=0.0, RADAR_LOCK=TRUE, DRIFT=0.84cm'
      },
      {
        id: 'de-3',
        timestamp: '04:48',
        seconds: 288,
        action: 'Thermal Target Acquisition',
        targetComponent: 'Nvidia Jetson Orin Nano + FLIR Boson',
        outcome: 'success',
        systemResponse: 'Target identified with 96.8% confidence. Coordinate streamed to surface tablet.',
        latencyMs: 42,
        telemetrySnippet: 'TARGET_FOUND: TRUE, TEMP=37.2C, COORD=[14.2, 8.1, -1.2]'
      },
      {
        id: 'de-4',
        timestamp: '05:32',
        seconds: 332,
        action: 'Rapid Backtrack Yaw Maneuver',
        targetComponent: 'Brushless Motor ESCs',
        outcome: 'warning',
        systemResponse: 'Voltage spike transient recorded; 2 telemetry frames suppressed.',
        latencyMs: 120,
        telemetrySnippet: 'VOLT_SPIKE: 18.2V, RETRY_SUCCESS: TRUE'
      },
      {
        id: 'de-5',
        timestamp: '06:12',
        seconds: 372,
        action: 'Manual Motor Cut Triggered (Simulated Failure)',
        targetComponent: 'Ballistic Supercapacitor Circuit',
        outcome: 'success',
        systemResponse: 'Supercapacitor fired coil; recovery parachute ejected in 12.4ms.',
        latencyMs: 12,
        telemetrySnippet: 'FREEFALL_DETECTED: TRUE, CHUTE_FIRED: 12.4ms'
      },
      {
        id: 'de-6',
        timestamp: '07:45',
        seconds: 465,
        action: 'Autonomous Landing on Launch Pad',
        targetComponent: 'Optical Fiducial Tracker',
        outcome: 'success',
        systemResponse: 'Touched down squarely on Pelican docking bay (offset 2.1cm).',
        latencyMs: 18,
        telemetrySnippet: 'LANDED: TRUE, TOUCHDOWN_OFFSET=2.1cm'
      }
    ]
  },

  strengths: [
    'Superb live flight stability under true zero-lux conditions in front of the jury panel.',
    'Flawless demonstration of ballistic supercapacitor parachute ejection with verified 12.4ms response.',
    'Clear, articulate presentation cadence (138 WPM) with high forward eye contact (84%).',
    'Open-hardware architecture and clean 4-layer PCB design shown physically on camera.'
  ],

  weaknesses: [
    'Contradiction in power consumption claim (asserted 4.2mA in deck vs verified 12.84A / 190W on live telemetry).',
    'Filler word spike ("uh", "um") specifically clustered around the controversial battery power slide.',
    'Did not demonstrate the claimed multi-kilometer RF relay penetration capability live, deferring to simulation.'
  ],

  improvementSuggestions: [
    {
      priority: 'P0',
      category: 'Technical Defense',
      recommendation: 'Update slide 3 to state "4.2mA standby MCU sleep / 190W hover flight" to prevent jury credibility penalties.',
      evidenceDerivedFrom: 'Telemetry log INA219_SHUNT (05:38) vs speech transcript (01:48).'
    },
    {
      priority: 'P1',
      category: 'Live Demo',
      recommendation: 'Add TVS transient absorption diodes on ESC power rails to suppress 18.2V back-EMF spikes during high-speed yaw reversals.',
      evidenceDerivedFrom: 'Observed error log [WARN] ESC3: Voltage transient +3.4V (05:32).'
    },
    {
      priority: 'P2',
      category: 'Presentation',
      recommendation: 'Rehearse transition from problem formulation to technical telemetry to eliminate the 5-filler cluster between 01:38 and 02:05.',
      evidenceDerivedFrom: 'Audio filler word breakdown (7 "uh" and 4 "um" recorded).'
    }
  ]
};

export const MOCK_SOFTWARE_PRES_DEMO: PresentationDemoReport = {
  projectId: 'pres-sw-quantumkey-tls',
  projectName: 'QuantumKey TLS v1.3 Post-Quantum Proxy',
  projectType: 'software',
  sessionTitle: 'Live Post-Quantum Handshake Defense & Reverse-Proxy Stress Test',
  presenter: 'Dr. Elena Rostova (Cryptographic Systems Architect)',
  evaluatedAt: '2026-09-04T20:00:00Z',
  durationSeconds: 462, // 7 min 42 sec
  durationFormatted: '07:42',
  compositeScore: 93.2,
  confidenceLevel: 98.4,
  mode: 'demo-playback',

  presentation: {
    overallScore: 92.4,

    clarity: {
      id: 'sp-sw-1',
      key: 'clarity',
      name: 'Vocal Clarity & Intelligibility',
      score: 95,
      rating: 'Exceptional',
      measuredValue: '31.2 dB SNR',
      optimalBenchmark: '> 25.0 dB SNR',
      headline: 'Crystal-clear delivery of complex post-quantum lattice mathematics and AVX-512 SIMD pipelines',
      detailedAnalysis: 'Exceptional vocal modulation with high clarity on specialized mathematical terminology (e.g. Number Theoretic Transform, Kyber-768 decapsulation, Montgomery reductions).',
      evidenceSnippets: [
        {
          id: 'ev-sw-cl-1',
          type: 'audio-waveform',
          timestamp: '01:45',
          label: 'Acoustic Clarity Peak',
          sourceLocation: 'session_audio_sw.wav',
          snippet: 'Explained zero-allocation SIMD vectorization with 98.6% speech recognition accuracy.',
          metricCorrelation: 'Corroborated by transcript alignment logs.'
        }
      ]
    },

    speakingPace: {
      id: 'sp-sw-2',
      key: 'speakingPace',
      name: 'Speaking Pace & Cadence',
      score: 94,
      rating: 'Exceptional',
      measuredValue: '142 WPM',
      optimalBenchmark: '130 - 145 WPM',
      headline: 'Dynamic and controlled pacing adapted to technical complexity',
      detailedAnalysis: 'Averaged 142 WPM; decelerated to 128 WPM on polynomial reduction slides and accelerated to 148 WPM during live load bench.',
      evidenceSnippets: [
        {
          id: 'ev-sw-pace-1',
          type: 'transcript-excerpt',
          timestamp: '02:30',
          label: 'Pacing Log',
          sourceLocation: 'telemetry/sw_pacing.json',
          snippet: 'Slide 3 (Lattice Math): 128 WPM for complex modular reductions.',
          metricCorrelation: 'Demonstrates pedagogical mastery.'
        }
      ]
    },

    confidence: {
      id: 'sp-sw-3',
      key: 'confidence',
      name: 'Vocal Confidence & Conviction',
      score: 96,
      rating: 'Exceptional',
      measuredValue: '96% Conviction Index',
      optimalBenchmark: '> 80%',
      headline: 'Unwavering technical authority during live code walkthrough and memory safety defense',
      detailedAnalysis: 'Zero rising inflection at statement ends; pitch stability standard deviation under 12 Hz.',
      evidenceSnippets: [
        {
          id: 'ev-sw-conf-1',
          type: 'audio-waveform',
          timestamp: '04:15',
          label: 'Pitch Stability',
          sourceLocation: 'telemetry/sw_pitch.csv',
          snippet: 'Firm assertions during live GDB core dump inspection proving zero memory leaks.',
          metricCorrelation: 'High juror confidence.'
        }
      ]
    },

    fillerWords: {
      id: 'sp-sw-4',
      key: 'fillerWords',
      name: 'Filler Words & Verbal Crutches',
      score: 92,
      rating: 'Exceptional',
      measuredValue: '6 Fillers (0.78/min)',
      optimalBenchmark: '< 3.0 / min',
      headline: 'Minimal filler frequency, far below competitive academic presentation averages',
      detailedAnalysis: 'Only 6 fillers detected over 7 minutes 42 seconds (0.78 fillers/min). Highly disciplined rehearsal evidence.',
      totalCount: 6,
      perMinute: 0.78,
      breakdown: [
        { word: 'um', count: 3, timestamps: ['02:14', '04:50', '06:10'] },
        { word: 'uh', count: 2, timestamps: ['03:20', '05:45'] },
        { word: 'basically', count: 1, timestamps: ['01:12'] }
      ],
      evidenceSnippets: [
        {
          id: 'ev-sw-fill-1',
          type: 'transcript-excerpt',
          timestamp: '02:14',
          label: 'Isolated Filler',
          sourceLocation: 'session_transcript_sw.vtt',
          snippet: '"...which, um, ensures zero heap allocations inside the hot crypto loop."',
          metricCorrelation: 'Negligible impact on clarity.'
        }
      ]
    },

    explanationStructure: {
      id: 'sp-sw-5',
      key: 'explanationStructure',
      name: 'Explanation Structure & Logic',
      score: 95,
      rating: 'Exceptional',
      measuredValue: '95 / 100 Flow Index',
      optimalBenchmark: '> 85 / 100',
      headline: 'Flawless logical progression from threat model to SIMD mathematics and live Wireshark traces',
      detailedAnalysis: 'Structured around 4 clear pillars: 1. Threat Model (Harvest Now Decrypt Later), 2. AVX-512 Montgomery Arithmetic, 3. Live Wireshark Handshake Proof, 4. Enterprise Savings.',
      evidenceSnippets: [
        {
          id: 'ev-sw-struct-1',
          type: 'transcript-excerpt',
          timestamp: '00:30',
          label: 'Structural Overview',
          sourceLocation: 'session_transcript_sw.vtt',
          snippet: '"Today we demonstrate that post-quantum TLS 1.3 does not require a trade-off between security and enterprise throughput."',
          metricCorrelation: 'Strong opening thesis.'
        }
      ]
    },

    eyeContact: {
      id: 'sp-sw-6',
      key: 'eyeContact',
      name: 'Eye Contact & Gaze Engagement',
      score: 89,
      rating: 'Strong',
      measuredValue: '89% Screen / Jury Gaze',
      optimalBenchmark: '> 75%',
      headline: 'Consistent camera connection; balanced split between terminal code view and jury eye contact',
      detailedAnalysis: 'Maintained 89% forward gaze; naturally shifted eyes to terminal code lines when explaining memory safety.',
      evidenceSnippets: [
        {
          id: 'ev-sw-gaze-1',
          type: 'gaze-heatmap',
          timestamp: '03:40',
          label: 'Gaze Heatmap',
          sourceLocation: 'vision/sw_gaze.json',
          snippet: 'Gaze focused directly on camera during threat summary; shifted smoothly to terminal editor at 03:42.',
          metricCorrelation: 'Natural technical presenter flow.'
        }
      ]
    },

    posture: {
      id: 'sp-sw-7',
      key: 'posture',
      name: 'Physical Posture & Gestures',
      score: 88,
      rating: 'Strong',
      measuredValue: 'Upright & Professional',
      optimalBenchmark: 'Minimal swaying / open gestures',
      headline: 'Composed seated delivery with precise hand emphasis during key algorithmic claims',
      detailedAnalysis: 'Maintained erect posture with open chest; hands visible on desk emphasizing cryptographic boundaries.',
      evidenceSnippets: [
        {
          id: 'ev-sw-pos-1',
          type: 'video-frame',
          timestamp: '02:00',
          label: 'Pose Estimation',
          sourceLocation: 'vision/sw_pose.json',
          snippet: 'Slight forward lean (85 degrees) denoting active technical engagement.',
          metricCorrelation: 'Authoritative physical presence.'
        }
      ]
    },

    audienceEngagement: {
      id: 'sp-sw-8',
      key: 'audienceEngagement',
      name: 'Audience Engagement & Hooks',
      score: 90,
      rating: 'Exceptional',
      measuredValue: 'Live Terminal Interactive Inspection',
      optimalBenchmark: '> 2 Hooks',
      headline: 'Invited judges to submit curl requests live to the test proxy endpoint during demo',
      detailedAnalysis: 'High interactive engagement by displaying public URL where judges verified the hybrid post-quantum TLS certificate in real time.',
      evidenceSnippets: [
        {
          id: 'ev-sw-eng-1',
          type: 'transcript-excerpt',
          timestamp: '03:15',
          label: 'Interactive Hook',
          sourceLocation: 'session_transcript_sw.vtt',
          snippet: '"Judges may point their browser to test.quantumkey.dev right now to inspect the ML-KEM-768 key share in their browser DevTools."',
          metricCorrelation: 'Highest tier interactive proof.'
        }
      ]
    },

    timeManagement: {
      id: 'sp-sw-9',
      key: 'timeManagement',
      name: 'Time Management & Allocation',
      score: 93,
      rating: 'Exceptional',
      measuredValue: '07:42 / 08:00 Target',
      optimalBenchmark: '± 30 seconds',
      headline: 'Finished 18 seconds under target; reserved generous 4+ minutes for jury cross-examination',
      detailedAnalysis: 'Allotted 8 minutes. Completed presentation in 7 minutes 42 seconds with zero rushed pacing.',
      allocatedMinutes: 8,
      actualMinutes: 7.7,
      overtimeSeconds: 0,
      evidenceSnippets: [
        {
          id: 'ev-sw-time-1',
          type: 'video-frame',
          timestamp: '07:42',
          label: 'Finish Time',
          sourceLocation: 'session_recording_sw.mp4',
          snippet: 'Presentation concluded at 07:42:15 with full agenda covered.',
          metricCorrelation: 'Optimal pacing control.'
        }
      ]
    },

    timeline: [
      {
        id: 'pe-sw-1',
        timestamp: '00:00',
        seconds: 0,
        type: 'slide-transition',
        title: 'Title Slide: QuantumKey Architecture',
        description: 'Introduced the threat of harvest-now-decrypt-later quantum attacks.',
        speakerQuote: 'QuantumKey is a pure-Rust drop-in reverse proxy providing hybrid post-quantum TLS 1.3 without microservice rewrites.',
        slideNumber: 1,
        confidenceAtEvent: 96
      },
      {
        id: 'pe-sw-2',
        timestamp: '01:30',
        seconds: 90,
        type: 'key-assertion',
        title: 'Lattice Cryptography AVX-512 SIMD Vectorization',
        description: 'Walked through Montgomery polynomial arithmetic and zero heap allocation guarantee.',
        speakerQuote: 'By vectorizing NTT butterfly operations across 512-bit ZMM registers, decapsulation completes in 13.8 microseconds.',
        slideNumber: 2,
        confidenceAtEvent: 98
      },
      {
        id: 'pe-sw-3',
        timestamp: '03:15',
        seconds: 195,
        type: 'slide-transition',
        title: 'Switch to Live Wireshark Packet Capture',
        description: 'Initiated real Firefox Nightly handshake against proxy endpoint.',
        speakerQuote: 'Notice Wireshark packet 42: the ClientHello payload carries the 1,184-byte hybrid ML-KEM key share.',
        slideNumber: 3,
        confidenceAtEvent: 97
      },
      {
        id: 'pe-sw-4',
        timestamp: '05:00',
        seconds: 300,
        type: 'key-assertion',
        title: 'Memory Scrubbing Proof via GDB Core Dump',
        description: 'Demonstrated sodium_memzero wiping session secrets from RAM.',
        speakerQuote: 'Even under an unprivileged kernel core dump, memory scanning reveals zero private key fragments in swap.',
        slideNumber: 4,
        confidenceAtEvent: 99
      },
      {
        id: 'pe-sw-5',
        timestamp: '07:42',
        seconds: 462,
        type: 'q-and-a',
        title: 'Presentation Concluded',
        description: 'Opened floor for cryptographic jury panel inquiries.',
        speakerQuote: 'We thank the jury and welcome inquiries regarding our constant-time verification.',
        slideNumber: 5,
        confidenceAtEvent: 95
      }
    ]
  },

  demo: {
    overallScore: 94.0,
    completenessPercentage: 100, // 5 of 5 demonstrated
    successfulFeaturesCount: 5,
    failedFeaturesCount: 0,
    unsupportedClaimsCount: 0,

    features: [
      {
        id: 'df-sw-1',
        name: 'Hybrid X25519 + ML-KEM-768 TLS 1.3 Key Exchange',
        category: 'Cryptography',
        status: 'verified',
        claimText: 'Negotiates hybrid post-quantum key shares in compliance with draft NIST FIPS 203.',
        observedResult: 'Wireshark packet trace confirmed dual key shares negotiated successfully with standard browser client.',
        timestampStart: '03:10',
        timestampEnd: '03:45',
        latencyOrPerformance: '13.8μs crypto decapsulation',
        evidenceRefId: 'ev-sw-demo-1'
      },
      {
        id: 'df-sw-2',
        name: 'Zero Private Key Leakage (sodium_memzero & mlock)',
        category: 'Memory Security',
        status: 'verified',
        claimText: 'Wipes all ephemeral key materials from RAM upon session closure.',
        observedResult: 'Executed GDB string search over process heap dump; zero lattice secret coefficients found.',
        timestampStart: '04:50',
        timestampEnd: '05:30',
        latencyOrPerformance: '0 bytes leaked in heap/swap',
        evidenceRefId: 'ev-sw-demo-2'
      },
      {
        id: 'df-sw-3',
        name: 'High-Concurrency Ingress Stress Test',
        category: 'Performance',
        status: 'verified',
        claimText: 'Sustains 100k requests/sec throughput on 16-core server.',
        observedResult: 'Locust bench achieved 104,200 RPS over loopback with mean latency of 0.42ms.',
        timestampStart: '05:40',
        timestampEnd: '06:30',
        latencyOrPerformance: '104,200 RPS / 0.42ms latency',
        evidenceRefId: 'ev-sw-demo-3'
      },
      {
        id: 'df-sw-4',
        name: 'Automatic Fallback for Classical TLS Clients',
        category: 'Interoperability',
        status: 'verified',
        claimText: 'Transparently falls back to standard ECDHE if client lacks PQC capabilities.',
        observedResult: 'Legacy curl 7.68 client connected smoothly with standard X25519 cipher suite without handshake failure.',
        timestampStart: '06:35',
        timestampEnd: '07:05',
        latencyOrPerformance: '100% fallback connection success',
        evidenceRefId: 'ev-sw-demo-4'
      },
      {
        id: 'df-sw-5',
        name: 'Prometheus Grafana Telemetry Exporter',
        category: 'Observability',
        status: 'verified',
        claimText: 'Exports real-time latency histograms and PQC negotiation ratios.',
        observedResult: 'Live Grafana dashboard displayed real-time RPS, CPU TDP wattage, and cipher breakdown.',
        timestampStart: '07:10',
        timestampEnd: '07:35',
        latencyOrPerformance: 'Sub-second metrics refresh',
        evidenceRefId: 'ev-sw-demo-5'
      }
    ],

    observedErrors: [
      {
        id: 'err-sw-1',
        timestamp: '03:22',
        severity: 'low',
        title: 'TCP MTU Segmentation Warning on Synthetic 1280 Byte Link',
        description: 'ClientHello packet size of 1,184 bytes triggered single TCP segment split on simulated strict mobile MTU link.',
        logSnippet: '[DEBUG] TCP_MSS: ClientHello fragmented into 2 IP packets (890B + 294B). Traversal succeeded in 1.4ms.',
        impactOnDemo: 'Zero connection loss; transparently reassembled by Linux TCP stack.',
        recovered: true
      }
    ],

    timeline: [
      {
        id: 'de-sw-1',
        timestamp: '03:10',
        seconds: 190,
        action: 'Initiate Firefox PQC Handshake against Proxy',
        targetComponent: 'rustls Edge Ingress Engine',
        outcome: 'success',
        systemResponse: 'Handshake completed; TLS 1.3 negotiated with ML-KEM-768.',
        latencyMs: 14,
        telemetrySnippet: 'CIPHER: TLS_AES_256_GCM_SHA384, GROUP: X25519MLKEM768'
      },
      {
        id: 'de-sw-2',
        timestamp: '04:55',
        seconds: 295,
        action: 'Trigger Process Core Dump to Inspect Memory',
        targetComponent: 'GDB Memory Inspector',
        outcome: 'success',
        systemResponse: 'Process memory scanned; sodium_memzero scrub confirmed.',
        latencyMs: 380,
        telemetrySnippet: 'GREP_SECRET_RESULT: 0 MATCHES FOUND'
      },
      {
        id: 'de-sw-3',
        timestamp: '05:45',
        seconds: 345,
        action: 'Spin Up 100k RPS Locust Concurrency Bench',
        targetComponent: 'Tokio Async Event Loop',
        outcome: 'success',
        systemResponse: 'Throughput peaked at 104,200 RPS across 16 CPU cores.',
        latencyMs: 0.42,
        telemetrySnippet: 'RPS=104200, CPU_LOAD=68%, RAM=38.4MB'
      }
    ]
  },

  strengths: [
    'Outstanding vocal authority and pedagogical clarity explaining complex lattice math.',
    'Flawless live demonstration verifying both hybrid post-quantum TLS and memory wiping in GDB.',
    'Very disciplined time management finishing under target with only 6 filler words total.',
    'Strong interactive audience engagement inviting judges to verify the endpoint live.'
  ],

  weaknesses: [
    '100k RPS benchmark demonstrated over loopback; lacks transatlantic WAN latency test under 45ms RTT.',
    'Minor TCP fragmentation observed on 1280-byte MTU link, which should be addressed with adaptive MSS clamping.'
  ],

  improvementSuggestions: [
    {
      priority: 'P0',
      category: 'Live Demo',
      recommendation: 'Run WAN benchmark across AWS multi-region instances to empirically validate throughput under real packet jitter.',
      evidenceDerivedFrom: 'Locust bench conducted over localhost loopback interface (05:45).'
    },
    {
      priority: 'P1',
      category: 'Technical Defense',
      recommendation: 'Add adaptive TCP MSS clamping to avoid ClientHello fragmentation on strict mobile networks.',
      evidenceDerivedFrom: 'Observed warning [DEBUG] TCP_MSS: ClientHello fragmented (03:22).'
    }
  ]
};

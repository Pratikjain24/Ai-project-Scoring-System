import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Cpu, 
  Terminal, 
  Scale, 
  Mic, 
  CheckCircle, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Sliders, 
  HelpCircle, 
  Zap, 
  TrendingUp, 
  History, 
  AlertTriangle,
  Users
} from 'lucide-react';
import type { 
  AIJuryScorecard, 
  DimensionId, 
  WeightPreset, 
  ScoringDimension, 
  JuryVerdictLevel, 
  JuryDecisionData, 
  JuryQuestionItem, 
  JuryNote, 
  HumanReview, 
  ScoreHistoryEntry 
} from '../../types/aiJuryScoring';
import { 
  mockHardwareScorecard, 
  mockSoftwareScorecard 
} from '../../data/mockAiJuryScoring';
import { api } from '../../services/api';

// Subcomponents
import { AIJuryVerdictCard } from './AIJuryVerdictCard';
import { RadarChart } from './RadarChart';
import { WeightedBreakdownBar } from './WeightedBreakdownBar';
import { HighlightsAndRisks } from './HighlightsAndRisks';
import { DimensionsGrid } from './DimensionsGrid';
import { MethodologyPanel } from './MethodologyPanel';
import { DimensionDetailModal } from './DimensionDetailModal';

// Phase 9 Dedicated Subcomponents
import { CategoryBreakdownPanel } from './CategoryBreakdownPanel';
import { ConfidenceCoverageAudit } from './ConfidenceCoverageAudit';
import { CounterfactualSandbox } from './CounterfactualSandbox';
import { JurySessionMode } from './JurySessionMode';
import { SensitivityAndClaims } from './SensitivityAndClaims';
import { ExceptionalityPanel } from './ExceptionalityPanel';
import { GovernanceAndHistory } from './GovernanceAndHistory';
import { ProjectComparisonModal } from './ProjectComparisonModal';
import { JuryDebateChamber } from './JuryDebateChamber';

export interface AIJuryModuleProps {
  evaluationId?: string;
  projectId?: string;
  onBackToOverview: () => void;
  onViewDossier?: () => void;
  onViewPresentationDemo?: () => void;
  initialScorecard?: AIJuryScorecard;
  initialDecision?: JuryDecisionData;
  softwareScorecard?: AIJuryScorecard;
  hardwareScorecard?: AIJuryScorecard;
}

type JuryTab = 
  | 'overview'
  | 'debate'
  | 'breakdown'
  | 'audit'
  | 'sandbox'
  | 'session'
  | 'sensitivity'
  | 'future'
  | 'governance';

export const AIJuryModule: React.FC<AIJuryModuleProps> = ({
  evaluationId = 'eval_smart-road-vision',
  projectId = 'smart-road-vision',
  onBackToOverview,
  onViewDossier,
  onViewPresentationDemo,
  initialScorecard,
  initialDecision,
  softwareScorecard,
  hardwareScorecard,
}) => {
  const navigate = useNavigate();
  const activeProj = projectId || evaluationId?.replace(/^eval_/, '') || 'smart-road-vision';

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<JuryTab>('overview');

  // Comparison Modal state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Active Project Track: Hardware vs Software
  const [activeTrack, setActiveTrack] = useState<'hardware' | 'software'>('hardware');

  // Selected dimension for detail modal
  const [selectedDimension, setSelectedDimension] = useState<ScoringDimension | null>(null);
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);

  // Base scorecard for visualization
  const baseScorecard: AIJuryScorecard = useMemo(() => {
    if (activeTrack === 'hardware') {
      return hardwareScorecard || initialScorecard || mockHardwareScorecard;
    }
    return softwareScorecard || initialScorecard || mockSoftwareScorecard;
  }, [activeTrack, hardwareScorecard, softwareScorecard, initialScorecard]);

  // Dynamic weights dictionary for legacy simulator
  const [customWeights, setCustomWeights] = useState<Record<DimensionId, number>>(() => {
    const initial: Record<string, number> = {};
    const refScorecard = hardwareScorecard || initialScorecard || mockHardwareScorecard;
    refScorecard.dimensions.forEach(d => {
      initial[d.id] = d.weight;
    });
    return initial as Record<DimensionId, number>;
  });

  // Export JSON state
  const [isExported, setIsExported] = useState(false);

  // Loading and real decision state
  const [isLoading, setIsLoading] = useState(true);
  const [decision, setDecision] = useState<JuryDecisionData | null>(initialDecision || null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>([]);
  const [humanReviews, setHumanReviews] = useState<HumanReview[]>([]);
  const [juryQuestions, setJuryQuestions] = useState<JuryQuestionItem[]>([]);
  const [juryNotes, setJuryNotes] = useState<JuryNote[]>([]);

  // Default deterministic fallback decision for Smart Road Vision (Score: 83.7, Confidence: 86%, Coverage: 81%)
  const fallbackDecision: JuryDecisionData = useMemo(() => ({
    id: 'decision_eval_smart-road-vision',
    evaluationId: 'eval_smart-road-vision',
    rubricVersionId: 'rubric_v1_canonical',
    overallScore: 83.7,
    verdict: 'STRONG',
    confidence: 86,
    confidenceLevel: 'HIGH',
    evidenceCoverage: 81.0,
    scoreReliability: 'HIGH_RELIABILITY_OBSERVED',
    status: 'READY_FOR_REVIEW',
    versionNumber: 3,
    calculationTime: 42,
    engineVersion: 'v9.0-Deterministic',
    createdAt: '2026-09-04T18:30:00Z',
    updatedAt: new Date().toISOString(),
    executiveVerdict: 'Smart Road Vision qualifies for Tier-2 Honors (STRONG). The AI Jury confirms reliable edge inference on Jetson Orin (42.4 FPS sustained) and compelling municipal social utility. Conditions for full production deployment require formal 5G cellular pooled roaming tariff agreements and night-time rain validation.',
    qualifiers: [
      {
        type: 'DEPLOYMENT_BARRIER',
        label: 'Procurement Backhaul Dependency',
        reason: '5G cellular data bandwidth tariffs in municipal fleet deployments require bulk roaming agreements before city-wide scale-up.',
      },
      {
        type: 'HIGH_RISK',
        label: 'Adverse Weather Edge Case',
        reason: 'Nighttime rainfall and wet asphalt glare show potential detection degradation without thermal or active LiDAR augmentation.',
      }
    ],
    strengths: [
      {
        rank: 1,
        assessment: 'Hardware-Accelerated TensorRT Detection',
        score: 87.0,
        category: 'Technical Quality',
        evidenceIds: ['ev_video_srv_orin_01', 'ev_srv_01'],
      },
      {
        rank: 2,
        assessment: 'Quantifiable Municipal Casualty Reduction',
        score: 92.0,
        category: 'Social Impact',
        evidenceIds: ['ev_srv_05', 'ev_doc_srv_pitchdeck_p8'],
      },
      {
        rank: 3,
        assessment: 'Broad Empirical Coverage & Verifiability',
        score: 81.0,
        category: 'Empirical Support',
        evidenceIds: ['ev_doc_srv_whitepaper_p4'],
      }
    ],
    weaknesses: [
      {
        rank: 1,
        weakness: 'Prior Art Overlap on Standard Object Detectors',
        scoreDeficit: 12.0,
        severity: 'MEDIUM',
        category: 'Originality',
        evidenceConfidence: 84,
      },
      {
        rank: 2,
        weakness: 'Adverse Weather Testing Gap',
        scoreDeficit: 9.0,
        severity: 'HIGH',
        category: 'Demonstration Quality',
        evidenceConfidence: 78,
      }
    ],
    risks: [
      {
        id: 'r_01',
        title: 'Municipal Fleet Bandwidth Cost Inflation',
        category: 'FEASIBILITY',
        severity: 'HIGH',
        likelihood: 'MEDIUM',
        confidence: 85,
        description: 'Uncompressed raw 1080p telemetry uploads over cellular networks would impose prohibitive monthly municipal operating costs.',
        mitigation: 'Implement edge geofence filtering: only transmit 150-byte JSON coordinates and 64x64 bounding-box crops of confirmed anomalies.',
        relatedEvidenceIds: ['ev_feas_cost_01'],
      }
    ],
    evidenceGaps: [
      {
        id: 'eg_01',
        category: 'Demonstration Quality',
        description: 'Empirical video benchmark under heavy rain / night-time glare conditions.',
        importance: 'HIGH',
        expectedEvidence: 'Jetson Orin telemetry logs in precipitation >10mm/hr.',
        impactOnEvaluation: 'Validates 42 FPS claim persists under low-light sensor noise.',
      }
    ],
    claimImpact: [
      {
        claimId: 'claim_edge_latency_01',
        claimText: 'Sustains 42.4 FPS on NVIDIA Jetson Orin Nano at 15W TDP with zero frame drops.',
        affectedCategory: 'technicalQuality',
        potentialImportance: 'CRITICAL',
        currentStatus: 'VERIFIED',
        potentialScoreImpact: 5.2,
        notes: 'Directly corroborated by video oscilloscope telemetry and TensorRT profiling logs.',
      },
      {
        claimId: 'claim_cost_reduction_02',
        claimText: 'Reduces municipal pothole inspection dispatch overhead by 40%.',
        affectedCategory: 'socialImpact',
        potentialImportance: 'HIGH',
        currentStatus: 'PLAUSIBLE',
        potentialScoreImpact: 3.4,
        notes: 'Supported by municipal budget projection case study in Whitepaper Section 4.',
      }
    ],
    sensitivity: {
      currentScore: 83.7,
      highSensitivityAreas: [
        {
          category: 'technicalQuality',
          label: 'Technical Quality',
          weight: 20,
          sensitivityLevel: 'HIGH',
          potentialImpactDescription: 'A 10-point swing in edge model latency shifts overall project score by ±2.00 points.',
        },
        {
          category: 'problemNeed',
          label: 'Problem & Need',
          weight: 15,
          sensitivityLevel: 'HIGH',
          potentialImpactDescription: 'A 10-point swing in road safety need shifts overall project score by ±1.50 points.',
        }
      ],
      methodologyNote: 'Linear partial derivative ∂Score/∂Category = Weight / 100.',
    },
    recommendations: [
      {
        rank: 1,
        title: 'Edge Bounding-Box Telemetry Compression',
        problem: 'Cellular network costs for video transmission.',
        action: 'Enforce telemetry transmission exclusively for metadata and localized anomaly crops.',
        expectedBenefit: 'Reduces monthly SIM carrier operating cost by 94%.',
        feasibility: 'HIGH',
        severity: 'HIGH',
        relatedEvidenceIds: ['ev_feas_cost_01'],
      },
      {
        rank: 2,
        title: 'Night & Rain Optical Conditioning Filter',
        problem: 'Glare from wet roadway asphalt degrades detection precision.',
        action: 'Integrate circular polarizing camera lens and histogram equalization pre-processing.',
        expectedBenefit: 'Maintains detection recall above 88% in adverse weather.',
        feasibility: 'HIGH',
        severity: 'HIGH',
        relatedEvidenceIds: ['ev_demo_02'],
      },
      {
        rank: 3,
        title: 'Independent Municipal DOT Pilot Trial',
        problem: 'Current tests limited to campus roadways.',
        action: 'Execute 30-day trial on public transit buses with city Department of Transportation.',
        expectedBenefit: 'Elevates Evidence Coverage from 81% to >95% and unlocks Tier 1 Exceptional.',
        feasibility: 'MEDIUM',
        severity: 'MEDIUM',
        relatedEvidenceIds: ['ev_srv_05'],
      },
      {
        rank: 4,
        title: 'Dynamic Geo-Clustering Backend Pipeline',
        problem: 'Duplicate distress reports for identical road sections.',
        action: 'Deploy spatial DBSCAN clustering on backend ingestion API.',
        expectedBenefit: 'Prevents redundant maintenance ticket dispatches.',
        feasibility: 'HIGH',
        severity: 'LOW',
        relatedEvidenceIds: ['ev_code_03'],
      },
      {
        rank: 5,
        title: 'CAN-Bus Vehicle Speed Ingestion',
        problem: 'Speed variations affect pothole depth optical estimation.',
        action: 'Read vehicle OBD-II / CAN-bus speed pulses into Kalman filter.',
        expectedBenefit: 'Improves distress severity grading accuracy by 18%.',
        feasibility: 'MEDIUM',
        severity: 'LOW',
        relatedEvidenceIds: ['ev_telemetry_04'],
      }
    ],
    judgeQuestions: [
      {
        id: 'jq_01',
        question: 'How does the Jetson Orin edge model handle sudden transitions from bright sunlight into roadway tunnel shade?',
        reason: 'HDR sensor response and auto-exposure settling time can cause 500ms blindness on roadway obstacles.',
        category: 'TECHNICAL',
        priority: 'CRITICAL',
        isAsked: true,
        isBookmarked: true,
        judgeNote: 'Team confirmed dynamic exposure bracket adjustment is integrated in v2 firmware.',
      },
      {
        id: 'jq_02',
        question: 'What is the recurring monthly SIM card cellular data cost per municipal bus under peak operating hours?',
        reason: 'Operational expenses determine commercial scalability for transit agency adoption.',
        category: 'FEASIBILITY',
        priority: 'HIGH',
        isAsked: false,
        isFlagged: true,
      },
      {
        id: 'jq_03',
        question: 'How do you prevent malicious spoofing of road distress GPS alerts by bad actors?',
        reason: 'Security of municipal dispatch infrastructure is critical against automated denial-of-service.',
        category: 'SECURITY',
        priority: 'HIGH',
        isAsked: false,
      },
      {
        id: 'jq_04',
        question: 'Has the system been verified against asphalt cracks vs. cast tree branch shadows?',
        reason: 'Shadow misclassification is the primary source of false positives in roadway vision systems.',
        category: 'VALIDATION',
        priority: 'MEDIUM',
        isAsked: true,
      },
      {
        id: 'jq_05',
        question: 'What differentiates your neural architecture from standard open-source YOLO road datasets?',
        reason: 'Evaluates novelty and intellectual property defense beyond commodity open-source models.',
        category: 'ORIGINALITY',
        priority: 'MEDIUM',
        isAsked: false,
      }
    ],
    currentProjectScore: 83.7,
    futurePotentialScore: 94.0,
    exceptionalityAnalysis: {
      separatorsFromAverage: [
        'Hardware execution demonstrated on physical edge silicon (NVIDIA Jetson Orin) rather than cloud simulation.',
        'High frame throughput (42.4 FPS sustained) under a strict 15W power envelope.',
        'Direct alignment with measurable municipal safety cost metrics ($4.2M estimated city savings).',
      ],
      gapToExceptional: [
        'Absence of multi-weather field trials (current benchmarks are dry asphalt daylight only).',
        'Reliance on standard off-the-shelf backbone architecture limits novelty claims.',
        'Pending formal municipal institutional deployment memorandum of understanding.',
      ],
      roadmapToTier1: [
        'Deploy 10 edge nodes across active city transit buses for a 60-day trial.',
        'Publish peer-reviewed benchmark on multi-spectral adverse weather road distress detection.',
        'File utility patent for edge spatial geo-temporal distress clustering.',
      ],
    },
    categoryScores: [
      {
        id: 'cs_1',
        evaluationId: 'eval_smart-road-vision',
        categoryKey: 'problemNeed',
        categoryLabel: 'Problem & Need',
        rawScore: 88.0,
        weight: 15,
        weightedScore: 13.20,
        confidence: 94,
        evidenceCount: 4,
        evidenceCoverage: 88,
        status: 'ASSESSED',
        strengths: ['Identifies concrete $4.2M municipal cost burden of delayed pavement rehabilitation'],
        weaknesses: ['Focus is primarily urban; rural unpaved infrastructure omitted'],
        risks: ['Municipal budget cycles may delay adoption'],
        evidenceIds: ['ev_doc_srv_pitchdeck_p2', 'ev_srv_01'],
        whyThisScore: 'Problem urgency is verified by Department of Transportation infrastructure aging statistics.',
      },
      {
        id: 'cs_2',
        evaluationId: 'eval_smart-road-vision',
        categoryKey: 'technicalQuality',
        categoryLabel: 'Technical Quality',
        rawScore: 87.0,
        weight: 20,
        weightedScore: 17.40,
        confidence: 92,
        evidenceCount: 7,
        evidenceCoverage: 86,
        status: 'ASSESSED',
        strengths: ['TensorRT FP16 pipeline achieves 42.4 FPS at 15W TDP with MISRA-C compliant firmware wrappers'],
        weaknesses: ['Lack of multi-thread CPU watchdog recovery implementation'],
        risks: ['Thermal throttling under 50°C summer vehicle dashboard enclosure'],
        evidenceIds: ['ev_video_srv_orin_01', 'ev_video_srv_orin_02'],
        whyThisScore: 'Hardware execution benchmark on Jetson Orin proves real-time viability under rigorous power bounds.',
      },
      {
        id: 'cs_3',
        evaluationId: 'eval_smart-road-vision',
        categoryKey: 'originality',
        categoryLabel: 'Innovation & Originality',
        rawScore: 68.0,
        weight: 15,
        weightedScore: 10.20,
        confidence: 82,
        evidenceCount: 3,
        evidenceCoverage: 70,
        status: 'ASSESSED',
        strengths: ['Novel edge geospatial clustering and localized patch delta compression'],
        weaknesses: ['YOLOv8 convolutional backbone is standard prior art without architectural novelty'],
        risks: ['Competitors can replicate detector within 60 days using public weights'],
        evidenceIds: ['ev_orig_srv_01'],
        whyThisScore: 'Originality score reflects solid system-level engineering but derivative core computer vision model.',
      },
      {
        id: 'cs_4',
        evaluationId: 'eval_smart-road-vision',
        categoryKey: 'socialImpact',
        categoryLabel: 'Social Impact',
        rawScore: 92.0,
        weight: 15,
        weightedScore: 13.80,
        confidence: 90,
        evidenceCount: 4,
        evidenceCoverage: 89,
        status: 'ASSESSED',
        strengths: ['Proactively prevents two-wheeler motorcycle pothole accidents and public transit delays'],
        weaknesses: ['Requires municipal authority willingness to share open telemetry with citizens'],
        risks: ['Potential privacy concerns if pedestrian faces or license plates are inadvertently captured'],
        evidenceIds: ['ev_srv_05', 'ev_doc_srv_pitchdeck_p8'],
        whyThisScore: 'Exceptional public safety utility with direct casualty reduction potential across urban commuters.',
      },
      {
        id: 'cs_5',
        evaluationId: 'eval_smart-road-vision',
        categoryKey: 'presentation',
        categoryLabel: 'Presentation Quality',
        rawScore: 76.0,
        weight: 10,
        weightedScore: 7.60,
        confidence: 88,
        evidenceCount: 3,
        evidenceCoverage: 78,
        status: 'ASSESSED',
        strengths: ['Clear delivery, confident slide pacing, and concise technical explanations'],
        weaknesses: ['Presenter exhibited vocal filler rate of 14 ums/minute in Q&A section'],
        risks: ['Q&A responses rushed when answering edge hardware thermal questions'],
        evidenceIds: ['ev_pres_srv_01'],
        whyThisScore: 'Solid, well-structured presentation; minor pacing and verbal filler deductions.',
      },
      {
        id: 'cs_6',
        evaluationId: 'eval_smart-road-vision',
        categoryKey: 'demonstration',
        categoryLabel: 'Demonstration Quality',
        rawScore: 84.0,
        weight: 10,
        weightedScore: 8.40,
        confidence: 89,
        evidenceCount: 5,
        evidenceCoverage: 84,
        status: 'ASSESSED',
        strengths: ['Live edge hardware execution captured on video with real-time HUD latency overlay'],
        weaknesses: ['Recorded video benchmark rather than live interactive hardware bench demo'],
        risks: ['Pre-recorded footage does not prove resilience to edge thermal drift over 8 hours'],
        evidenceIds: ['ev_demo_srv_01'],
        whyThisScore: 'High demonstration fidelity corroborated by hardware telemetry logs and video timestamps.',
      },
      {
        id: 'cs_7',
        evaluationId: 'eval_smart-road-vision',
        categoryKey: 'feasibilityScalability',
        categoryLabel: 'Feasibility & Scalability',
        rawScore: 79.0,
        weight: 10,
        weightedScore: 7.90,
        confidence: 82,
        evidenceCount: 4,
        evidenceCoverage: 76,
        status: 'ASSESSED',
        strengths: ['Uses low-cost $499 Jetson Orin Nano modules readily mountable on municipal vehicles'],
        weaknesses: ['Cellular data uplink roaming tariffs require bulk transit agreements'],
        risks: ['Supply chain availability for Jetson modules during industrial shortage'],
        evidenceIds: ['ev_feas_srv_01'],
        whyThisScore: 'Strong unit economic viability conditional on negotiating municipal bulk cellular contracts.',
      },
      {
        id: 'cs_8',
        evaluationId: 'eval_smart-road-vision',
        categoryKey: 'futurePotential',
        categoryLabel: 'Future Potential',
        rawScore: 83.0,
        weight: 5,
        weightedScore: 4.15,
        confidence: 80,
        evidenceCount: 2,
        evidenceCoverage: 68,
        status: 'ASSESSED',
        strengths: ['Natural extension into autonomous vehicle digital twin road condition maps'],
        weaknesses: ['Depends on commercial automotive OEM data exchange standards'],
        risks: ['High-definition mapping giants (Google, Here, TomTom) launching native crowd-sensing'],
        evidenceIds: ['ev_future_srv_01'],
        whyThisScore: 'Clear expansion roadmap to autonomous driving infrastructure layers.',
      }
    ]
  }), []);

  // Fallback History
  const fallbackHistory: ScoreHistoryEntry[] = useMemo(() => [
    {
      id: 'hist_srv_v1',
      evaluationId: 'eval_smart-road-vision',
      versionNumber: 1,
      overallScore: 76.3,
      confidence: 72,
      evidenceCoverage: 64,
      verdict: 'PROMISING',
      changeSummary: 'Initial automated ingestion of pitch deck and technical whitepaper.',
      whyScoreChanged: 'Baseline evaluation derived from document extraction prior to live hardware bench tests.',
      addedEvidenceIds: ['ev_doc_srv_pitchdeck_p2', 'ev_srv_01'],
      rubricVersionId: 'rubric_v1_canonical',
      engineVersion: 'v9.0-Deterministic',
      createdAt: '2026-09-02T10:15:00Z',
    },
    {
      id: 'hist_srv_v2',
      evaluationId: 'eval_smart-road-vision',
      versionNumber: 2,
      overallScore: 81.1,
      confidence: 81,
      evidenceCoverage: 74,
      verdict: 'STRONG',
      changeSummary: 'Ingested Jetson Orin live hardware video benchmarks and speech cadence telemetry.',
      whyScoreChanged: 'Technical Quality upgraded from 78 to 85 following verified 42 FPS TensorRT demonstration.',
      addedEvidenceIds: ['ev_video_srv_orin_01', 'ev_video_srv_orin_02'],
      rubricVersionId: 'rubric_v1_canonical',
      engineVersion: 'v9.0-Deterministic',
      createdAt: '2026-09-03T16:45:00Z',
    },
    {
      id: 'hist_srv_v3',
      evaluationId: 'eval_smart-road-vision',
      versionNumber: 3,
      overallScore: 83.7,
      confidence: 86,
      evidenceCoverage: 81,
      verdict: 'STRONG',
      changeSummary: 'Consolidated Phase 8 specialist audits across AI model, security, and municipal impact.',
      whyScoreChanged: 'Social Impact elevated to 92 based on verified casualty reduction literature; overall Master Score finalized at 83.7.',
      addedEvidenceIds: ['ev_srv_05', 'ev_doc_srv_pitchdeck_p8'],
      rubricVersionId: 'rubric_v1_canonical',
      engineVersion: 'v9.0-Deterministic',
      createdAt: '2026-09-04T18:30:00Z',
    }
  ], []);

  // Fallback Reviews
  const fallbackReviews: HumanReview[] = useMemo(() => [
    {
      id: 'hrev_srv_01',
      evaluationId: 'eval_smart-road-vision',
      reviewer: 'Dr. Marcus Vance (Chief Jury Chair)',
      category: 'Technical Quality',
      originalScore: 87.0,
      reviewedScore: 89.0,
      reason: 'Hardware bench trial on Jetson Orin demonstrated exceptional frame stability (42.4 FPS sustained with zero thermal throttling over 600s test).',
      createdAt: '2026-09-04T19:00:00Z',
    }
  ], []);

  // Fetch from backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        decisionRes,
        historyRes,
        reviewsRes,
        questionsRes,
        notesRes
      ] = await Promise.allSettled([
        api.getJuryDecision(evaluationId),
        api.getScoreHistory(evaluationId),
        api.getHumanReviews(evaluationId),
        api.getJuryQuestions(evaluationId),
        api.getJuryNotes(evaluationId)
      ]);

      if (decisionRes.status === 'fulfilled' && decisionRes.value) {
        setDecision(decisionRes.value);
      } else {
        setDecision(fallbackDecision);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value && historyRes.value.length > 0) {
        setScoreHistory(historyRes.value);
      } else {
        setScoreHistory(fallbackHistory);
      }

      if (reviewsRes.status === 'fulfilled' && reviewsRes.value && reviewsRes.value.length > 0) {
        setHumanReviews(reviewsRes.value);
      } else {
        setHumanReviews(fallbackReviews);
      }

      if (questionsRes.status === 'fulfilled' && questionsRes.value && questionsRes.value.length > 0) {
        setJuryQuestions(questionsRes.value);
      } else {
        setJuryQuestions(fallbackDecision.judgeQuestions || []);
      }

      if (notesRes.status === 'fulfilled' && notesRes.value && notesRes.value.length > 0) {
        setJuryNotes(notesRes.value);
      } else {
        setJuryNotes([
          {
            id: 'jnote_srv_01',
            evaluationId: 'eval_smart-road-vision',
            category: 'TECHNICAL',
            text: 'TensorRT FP16 quantization maintains detection mAP within 1.2% of FP32 baseline. Architecture is sound.',
            author: 'Elena Rostova (Senior AI Systems Juror)',
            relatedEvidenceIds: ['ev_video_srv_orin_01'],
            timestamp: '2026-09-04T18:50:00Z',
          },
          {
            id: 'jnote_srv_02',
            evaluationId: 'eval_smart-road-vision',
            category: 'FEASIBILITY',
            text: 'Cellular 5G backhaul operating costs must be negotiated under bulk municipal data pooled contracts before pilot scale-up.',
            author: 'David K. Chen (Infrastructure & Procurement Juror)',
            relatedEvidenceIds: ['ev_feas_cost_01'],
            timestamp: '2026-09-04T18:55:00Z',
          }
        ]);
      }
    } catch {
      setDecision(fallbackDecision);
      setScoreHistory(fallbackHistory);
      setHumanReviews(fallbackReviews);
      setJuryQuestions(fallbackDecision.judgeQuestions || []);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId, fallbackDecision, fallbackHistory, fallbackReviews]);

  useEffect(() => {
    let isMounted = true;
    const fetchAsync = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    fetchAsync();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Active decision data
  const currentDecision = decision || fallbackDecision;

  // Question interaction handlers
  const handleToggleQuestionAsked = async (questionId: string, newState: boolean) => {
    setJuryQuestions(prev => prev.map(q => q.id === questionId ? { ...q, isAsked: newState } : q));
    await api.interactJuryQuestion(evaluationId, questionId, { isAsked: newState });
  };

  const handleToggleQuestionFlagged = async (questionId: string, newState: boolean) => {
    setJuryQuestions(prev => prev.map(q => q.id === questionId ? { ...q, isFlagged: newState } : q));
    await api.interactJuryQuestion(evaluationId, questionId, { isFlagged: newState });
  };

  const handleToggleQuestionBookmarked = async (questionId: string, newState: boolean) => {
    setJuryQuestions(prev => prev.map(q => q.id === questionId ? { ...q, isBookmarked: newState } : q));
    await api.interactJuryQuestion(evaluationId, questionId, { isBookmarked: newState });
  };

  const handleAddJuryNote = async (note: { category: string; text: string; author: string }) => {
    const saved = await api.addJuryNote(evaluationId, note);
    if (saved) {
      setJuryNotes(prev => [saved, ...prev]);
    } else {
      setJuryNotes(prev => [{
        id: `note_${Date.now()}`,
        evaluationId,
        category: note.category,
        text: note.text,
        author: note.author,
        relatedEvidenceIds: [],
        timestamp: new Date().toISOString(),
      }, ...prev]);
    }
  };

  // Export scorecard JSON
  const handleExportScorecard = () => {
    const exportData = {
      decision: currentDecision,
      history: scoreHistory,
      humanReviews,
      notes: juryNotes,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ProjectXRay_MasterScorecard_${projectId}_${currentDecision.evaluationId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  };

  // Legacy scorecard handlers
  const handleSwitchTrack = (track: 'hardware' | 'software') => {
    setActiveTrack(track);
    const target = track === 'hardware' ? mockHardwareScorecard : mockSoftwareScorecard;
    const weights: Record<string, number> = {};
    target.dimensions.forEach(d => {
      weights[d.id] = d.weight;
    });
    setCustomWeights(weights as Record<DimensionId, number>);
    setSelectedDimensionId(null);
  };

  const handleUpdateWeight = (dimId: DimensionId, newWeight: number) => {
    setCustomWeights(prev => ({
      ...prev,
      [dimId]: newWeight
    }));
  };

  const handleApplyPreset = (preset: WeightPreset) => {
    setCustomWeights(preset.weights);
  };

  const handleResetWeights = () => {
    const weights: Record<string, number> = {};
    baseScorecard.dimensions.forEach(d => {
      weights[d.id] = d.weight;
    });
    setCustomWeights(weights as Record<DimensionId, number>);
  };

  const calculatedOverallScore = useMemo(() => {
    const totalWeight = Object.values(customWeights).reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return 0;
    
    let weightedSum = 0;
    baseScorecard.dimensions.forEach(dim => {
      const w = customWeights[dim.id] ?? dim.weight;
      weightedSum += (dim.score * w);
    });

    return Math.round(weightedSum / totalWeight);
  }, [baseScorecard, customWeights]);

  const dynamicVerdictLevel: JuryVerdictLevel = useMemo(() => {
    if (calculatedOverallScore >= 90) return 'Exceptional';
    if (calculatedOverallScore >= 80) return 'Strong';
    if (calculatedOverallScore >= 70) return 'Promising';
    if (calculatedOverallScore >= 50) return 'Needs Improvement';
    return 'Weak';
  }, [calculatedOverallScore]);

  const currentScorecard: AIJuryScorecard = useMemo(() => {
    return {
      ...baseScorecard,
      overallScore: calculatedOverallScore,
      verdictLevel: dynamicVerdictLevel,
      dimensions: baseScorecard.dimensions.map(dim => ({
        ...dim,
        weight: customWeights[dim.id] ?? dim.weight
      }))
    };
  }, [baseScorecard, calculatedOverallScore, dynamicVerdictLevel, customWeights]);

  const handleOpenMethodology = () => {
    setActiveTab('governance');
  };

  const handleOpenDimensionDetail = (dim: ScoringDimension) => {
    setSelectedDimension(dim);
    setSelectedDimensionId(dim.id);
  };

  const handleSelectDimensionFromChart = (dimId: string) => {
    setSelectedDimensionId(dimId);
    const found = currentScorecard.dimensions.find(d => d.id === dimId);
    if (found) {
      setSelectedDimension(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-24 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Breadcrumb & Quick Controls */}
      <div className="sticky top-16 z-30 bg-[#07090E]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToOverview}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Phase 9: AI Jury & Master Scoring Engine
              </span>
              <span className="hidden md:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                8 Canonical Categories • Deterministic
              </span>
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin ml-1" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Track Switcher */}
            <div className="p-1 rounded-xl bg-slate-900 border border-white/10 flex items-center text-xs font-mono">
              <button
                onClick={() => handleSwitchTrack('hardware')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTrack === 'hardware'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Hardware Drone</span>
              </button>
              <button
                onClick={() => handleSwitchTrack('software')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTrack === 'software'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Software TLS</span>
              </button>
            </div>

            {/* Compare Projects Button */}
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-xs font-mono font-semibold text-indigo-300 transition-all flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compare Projects</span>
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportScorecard}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs font-mono font-semibold text-cyan-300 transition-all flex items-center gap-1.5"
              title="Download machine-readable JSON scorecard"
            >
              {isExported ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Export Scorecard</span>
                </>
              )}
            </button>

            {/* Pres & Demo Quick Link */}
            {onViewPresentationDemo && (
              <button
                onClick={onViewPresentationDemo}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs font-mono font-semibold text-cyan-300 transition-all flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Pres & Demo</span>
              </button>
            )}

            {/* Dossier Quick Link */}
            {onViewDossier && (
              <button
                onClick={onViewDossier}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs font-mono font-semibold text-emerald-300 transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">View Dossier</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* MASTER COCKPIT BANNER (Deterministic Score, Multi-Factor Confidence, Coverage) */}
        {/* ========================================================================= */}
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B101E] to-slate-900 border border-cyan-500/30 p-6 shadow-2xl overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            
            {/* Left: Project Title & Verdict Summary */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                  {currentDecision.rubricVersionId}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Engine: {currentDecision.engineVersion}
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                  currentDecision.status === 'FINAL' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  Status: {currentDecision.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Smart Road Vision — Consensus Deliberation
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {currentDecision.executiveVerdict}
              </p>

              {/* Qualifiers Pill Strip */}
              {currentDecision.qualifiers && currentDecision.qualifiers.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-mono text-slate-400">Automated Qualifiers:</span>
                  {currentDecision.qualifiers.map((q, idx) => (
                    <span 
                      key={idx}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 flex items-center gap-1"
                      title={q.reason}
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>{q.label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Key Deterministic Score Gauges */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0 bg-slate-950/70 border border-white/10 p-4 rounded-xl">
              
              {/* Master Score Dial */}
              <div className="text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Master Score
                </div>
                <div className="text-4xl font-black text-cyan-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  {currentDecision.overallScore.toFixed(1)}
                  <span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <div className="mt-1">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400">
                    {currentDecision.verdict}
                  </span>
                </div>
              </div>

              <div className="h-14 w-px bg-white/10" />

              {/* Multi-factor Confidence */}
              <div className="text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Confidence
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {currentDecision.confidence}%
                </div>
                <div className="text-[10px] font-mono text-emerald-300">
                  {currentDecision.confidenceLevel} (7 Factors)
                </div>
              </div>

              <div className="h-14 w-px bg-white/10" />

              {/* Evidence Coverage */}
              <div className="text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Coverage
                </div>
                <div className="text-2xl font-bold text-indigo-400 font-mono">
                  {currentDecision.evidenceCoverage.toFixed(1)}%
                </div>
                <div className="text-[10px] font-mono text-indigo-300">
                  Empirical Support
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB NAVIGATION BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Deliberation Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('debate')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'debate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Jury Chamber & Debate</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              3-Turn Loop
            </span>
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'breakdown'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>8-Category Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confidence & Coverage Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sandbox'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulation Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'session'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Jury Session Mode</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              {juryQuestions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sensitivity'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sensitivity & Claims</span>
          </button>

          <button
            onClick={() => setActiveTab('future')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'future'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Exceptionality & Future</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'governance'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Governance & Audit</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30">
              {currentDecision.status}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB CONTENT PANELS */}
        {/* ========================================================================= */}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <AIJuryVerdictCard
              scorecard={currentScorecard}
              onOpenMethodology={handleOpenMethodology}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 flex">
                <div className="w-full">
                  <RadarChart
                    dimensions={currentScorecard.dimensions}
                    selectedDimensionId={selectedDimensionId}
                    onSelectDimension={handleSelectDimensionFromChart}
                    showBenchmark={true}
                  />
                </div>
              </div>

              <div className="lg:col-span-7 flex">
                <div className="w-full">
                  <WeightedBreakdownBar
                    dimensions={currentScorecard.dimensions}
                    activeWeights={customWeights}
                    onUpdateWeight={handleUpdateWeight}
                    onApplyPreset={handleApplyPreset}
                    onResetWeights={handleResetWeights}
                    calculatedOverallScore={calculatedOverallScore}
                  />
                </div>
              </div>
            </div>

            <HighlightsAndRisks
              scorecard={currentScorecard}
              onInspectEvidence={(_trace) => {
                navigate(`/evaluations/${activeProj}/checklist`);
              }}
              onSelectDimension={handleSelectDimensionFromChart}
            />

            <DimensionsGrid
              dimensions={currentScorecard.dimensions}
              onOpenDimensionDetail={handleOpenDimensionDetail}
              selectedDimensionId={selectedDimensionId}
            />

            <div id="methodology-section">
              <MethodologyPanel isInitiallyExpanded={false} />
            </div>
          </div>
        )}

        {/* 2. AI JURY CHAMBER & MULTI-TURN DEBATE TAB */}
        {activeTab === 'debate' && (
          <JuryDebateChamber
            evaluationId={evaluationId}
            projectName={currentScorecard.projectName || 'Smart Road Vision'}
          />
        )}

        {/* 2. 8-CATEGORY BREAKDOWN TAB */}
        {activeTab === 'breakdown' && (
          <CategoryBreakdownPanel
            categoryScores={currentDecision.categoryScores || []}
            onSelectEvidence={(_evidenceId) => {
              navigate(`/evaluations/${activeProj}/documents`);
            }}
          />
        )}

        {/* 3. CONFIDENCE & EVIDENCE COVERAGE AUDIT TAB */}
        {activeTab === 'audit' && (
          <ConfidenceCoverageAudit
            confidence={currentDecision.confidence}
            confidenceLevel={currentDecision.confidenceLevel}
            evidenceCoverage={currentDecision.evidenceCoverage}
            scoreReliability={currentDecision.scoreReliability}
            categoryScores={currentDecision.categoryScores || []}
          />
        )}

        {/* 4. COUNTERFACTUAL SIMULATION SANDBOX TAB */}
        {activeTab === 'sandbox' && (
          <CounterfactualSandbox
            initialScores={currentDecision.categoryScores || []}
            officialOverallScore={currentDecision.overallScore}
          />
        )}

        {/* 5. JURY SESSION MODE TAB */}
        {activeTab === 'session' && (
          <JurySessionMode
            questions={juryQuestions}
            notes={juryNotes}
            onToggleAsked={handleToggleQuestionAsked}
            onToggleFlagged={handleToggleQuestionFlagged}
            onToggleBookmarked={handleToggleQuestionBookmarked}
            onAddNote={handleAddJuryNote}
          />
        )}

        {/* 6. SENSITIVITY & CLAIM IMPACT TAB */}
        {activeTab === 'sensitivity' && (
          <SensitivityAndClaims
            sensitivity={currentDecision.sensitivity}
            claimImpact={currentDecision.claimImpact}
          />
        )}

        {/* 7. EXCEPTIONALITY & FUTURE POTENTIAL TAB */}
        {activeTab === 'future' && (
          <ExceptionalityPanel
            currentScore={currentDecision.currentProjectScore}
            futureScore={currentDecision.futurePotentialScore}
            exceptionalityAnalysis={currentDecision.exceptionalityAnalysis}
          />
        )}

        {/* 8. GOVERNANCE, HUMAN REVIEW & SCORE HISTORY TAB */}
        {activeTab === 'governance' && (
          <GovernanceAndHistory
            evaluationId={evaluationId}
            decision={currentDecision}
            history={scoreHistory}
            reviews={humanReviews}
            onRefresh={loadData}
          />
        )}

      </div>

      {/* Cross-Project Comparison Modal */}
      <ProjectComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        activeDecision={currentDecision}
        activeProjectName="Smart Road Vision"
      />

      {/* Dimension Detail Modal */}
      <DimensionDetailModal
        dimension={selectedDimension}
        onClose={() => setSelectedDimension(null)}
      />

    </div>
  );
};

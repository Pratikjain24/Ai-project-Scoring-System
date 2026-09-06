import { initSchema, getDb } from './database';
import { ProjectRepository } from '../repositories/projectRepository';
import { EvaluationRepository } from '../repositories/evaluationRepository';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { ClaimRepository } from '../repositories/claimRepository';
import { ResearchRepository } from '../repositories/researchRepository';
import { AssessmentRepository } from '../repositories/assessmentRepository';
import { ScoringEngine } from '../scoring/scoringEngine';
import { JudgeQuestionEngine } from '../jury/judgeQuestionEngine';
import { RecommendationEngine } from '../recommendations/recommendationEngine';
import { ReportService } from '../report/reportService';

import { DocumentRepository } from '../repositories/documentRepository';
import { DocumentPipeline } from '../document-intelligence/documentPipeline';
import { MultimodalRepository } from '../repositories/multimodalRepository';
import { MultimodalPipeline } from '../multimodal/multimodalPipeline';

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Initializing schema & seeding database...');
  initSchema();

  const database = getDb();
  // Clear existing tables for clean deterministic seed
  database.exec(`
    DELETE FROM jury_question_interactions;
    DELETE FROM score_history;
    DELETE FROM jury_notes;
    DELETE FROM human_reviews;
    DELETE FROM master_category_scores;
    DELETE FROM jury_decisions;
    DELETE FROM rubric_versions;
    DELETE FROM rubrics;
    DELETE FROM analysis_events;
    DELETE FROM evaluator_summaries;
    DELETE FROM evaluator_maturity;
    DELETE FROM evaluator_recommendations;
    DELETE FROM evaluator_evidence_gaps;
    DELETE FROM evaluator_risks;
    DELETE FROM evaluator_assessments;
    DELETE FROM presentation_metrics;
    DELETE FROM claim_demo_matches;
    DELETE FROM demo_observations;
    DELETE FROM technical_mentions;
    DELETE FROM visual_events;
    DELETE FROM transcript_segments;
    DELETE FROM video_segments;
    DELETE FROM videos;
    DELETE FROM research_memory_cache;
    DELETE FROM cross_source_contradictions;
    DELETE FROM patent_records;
    DELETE FROM academic_papers;
    DELETE FROM similar_projects;
    DELETE FROM research_source_evidence;
    DELETE FROM research_queries;
    DELETE FROM research_questions;
    DELETE FROM research_plans;
    DELETE FROM document_contradictions;
    DELETE FROM evidence_gaps;
    DELETE FROM document_architecture;
    DELETE FROM document_tables;
    DELETE FROM document_images;
    DELETE FROM document_pages;
    DELETE FROM documents;
    DELETE FROM claim_human_reviews;
    DELETE FROM claim_versions;
    DELETE FROM claim_contradictions;
    DELETE FROM claim_benchmarks;
    DELETE FROM claim_verifications;
    DELETE FROM claim_parameters;
    DELETE FROM similarity_graph_edges;
    DELETE FROM candidate_timeline_contexts;
    DELETE FROM unique_contributions;
    DELETE FROM dimension_analyses;
    DELETE FROM originality_profiles;
    DELETE FROM similarity_candidates;
    DELETE FROM evaluation_reports;
    DELETE FROM judge_questions;
    DELETE FROM recommendations;
    DELETE FROM risks;
    DELETE FROM scores;
    DELETE FROM demo_analyses;
    DELETE FROM presentation_analyses;
    DELETE FROM feasibility_assessments;
    DELETE FROM impact_assessments;
    DELETE FROM research_findings;
    DELETE FROM research_sources;
    DELETE FROM claim_evidence;
    DELETE FROM claims;
    DELETE FROM similarity_results;
    DELETE FROM originality_assessments;
    DELETE FROM technical_assessments;
    DELETE FROM project_dna;
    DELETE FROM evidence;
    DELETE FROM analysis_jobs;
    DELETE FROM evaluations;
    DELETE FROM project_links;
    DELETE FROM project_files;
    DELETE FROM team_members;
    DELETE FROM projects;
  `);

  const sampleProjects = [
    {
      id: 'smart-road-vision',
      name: 'Smart Road Vision',
      architectureType: 'SOFTWARE' as const,
      category: 'AI / Computer Vision',
      domain: 'Smart Mobility & Municipal Transit Infrastructure',
      tagline: 'Autonomous road surface anomaly detection & predictive maintenance',
      problemStatement: 'Municipalities waste $4.2B annually repairing potholes reactively after vehicular damage or severe accidents have already transpired.',
      solutionDescription: 'Edge-deployed computer vision model running on municipal transit fleet cameras to detect, classify, and geo-index asphalt degradation with millimeter precision before structural failure.',
      teamName: 'VisionGrid Labs (MIT / Stanford cohort)',
      teamMembers: [
        { id: 'tm_1', projectId: 'smart-road-vision', name: 'Dr. Elena Rostova', role: 'Chief AI Architect' },
        { id: 'tm_2', projectId: 'smart-road-vision', name: 'Marcus Vance', role: 'Embedded Edge Systems Lead' }
      ],
      links: [
        { id: 'lk_1', projectId: 'smart-road-vision', type: 'GITHUB' as const, url: 'https://github.com/visiongrid-labs/smart-road-vision' },
        { id: 'lk_2', projectId: 'smart-road-vision', type: 'RESEARCH_PAPER' as const, url: 'https://arxiv.org/abs/2403.18920' }
      ]
    },
    {
      id: 'agrosense',
      name: 'AgroSense Autonomous Soil Rig',
      architectureType: 'HARDWARE' as const,
      category: 'AgriTech / Embedded IoT',
      domain: 'Precision Agriculture & Soil Health Telemetry',
      tagline: 'Precision NPK multispectral sensing and automated micro-dosing',
      problemStatement: 'Excess nitrogen fertilizer runoff pollutes groundwater and accounts for 18% of avoidable commercial farm operational expenses.',
      solutionDescription: 'Autonomous solar-powered field probe equipped with ISFET chemical sensors and LoRaWAN long-range mesh radio transmitting root-zone telemetry every 15 minutes.',
      teamName: 'TerraLogic Agronomics',
      teamMembers: [
        { id: 'tm_3', projectId: 'agrosense', name: 'Siddharth Rao', role: 'Hardware & Sensor Engineer' },
        { id: 'tm_4', projectId: 'agrosense', name: 'Clara Oswald', role: 'Agronomic Chemist' }
      ]
    },
    {
      id: 'cybershield',
      name: 'CyberShield Zero-Trust Mesh',
      architectureType: 'SOFTWARE' as const,
      category: 'Cybersecurity / Distributed Systems',
      domain: 'Cloud Native Infrastructure Defense',
      tagline: 'Kernel-level eBPF packet inspection with automated lateral movement defense',
      problemStatement: 'Traditional perimeter security fails to prevent lateral traversal once an internal container or node is compromised.',
      solutionDescription: 'Linux eBPF resident monitor enforcing identity-authenticated mutual TLS microsegmentation at wire speed with zero context switches.',
      teamName: 'ZeroPoint Labs'
    },
    {
      id: 'meditrack',
      name: 'MediTrack AI Clinical Triage',
      architectureType: 'SOFTWARE' as const,
      category: 'HealthTech / NLP & LLMs',
      domain: 'Emergency Room Intake Forensics',
      tagline: 'Ambient clinical listening and automated emergency intake triaging',
      problemStatement: 'Emergency room physician burnout and transcription bottlenecks cause dangerous diagnostic delay averages of 44 minutes.',
      solutionDescription: 'Multi-speaker acoustic beamforming microphone paired with fine-tuned BioMistral model producing structured HL7/FHIR intake records in real time.',
      teamName: 'NeuroHealth Consortium'
    },
    {
      id: 'solarguard',
      name: 'SolarGuard Inverter Telemetry',
      architectureType: 'HARDWARE' as const,
      category: 'CleanTech / Power Electronics',
      domain: 'Solar Photovoltaic Safety Systems',
      tagline: 'GaN-based microinverter with real-time arc-fault AI shutdown',
      problemStatement: 'DC arc faults in residential photovoltaic installations cause over 800 structural fires annually across North America.',
      solutionDescription: 'High-speed 100MHz current waveform analyzer executing edge 1D-CNN to disconnect solar string within 1.8 milliseconds of arc detection.',
      teamName: 'Helios Power Dynamics'
    }
  ];

  for (const p of sampleProjects) {
    ProjectRepository.create(p);

    // Create Evaluation for each project
    const evaluationId = `eval_${p.id}`;
    const executionId = `exec_seed_${p.id}`;

    EvaluationRepository.create({
      id: evaluationId,
      projectId: p.id,
      mode: p.architectureType === 'HARDWARE' ? 'LIVE_CAMERA' : 'VIDEO_ANALYSIS',
      status: 'COMPLETED',
      executionId,
      overallScore: p.id === 'smart-road-vision' ? 84.7 : p.id === 'cybershield' ? 89.1 : p.id === 'solarguard' ? 86.4 : p.id === 'agrosense' ? 78.2 : 71.5,
      confidence: p.id === 'smart-road-vision' ? 89 : p.id === 'cybershield' ? 92 : 84,
      verdict: p.id === 'cybershield' ? 'EXCEPTIONAL' : p.id === 'meditrack' ? 'PROMISING' : 'STRONG',
      executiveSummary: `Strong technical prototype addressing a significant real-world problem. High impact potential with demonstrated edge inference pipeline on NVIDIA Jetson.`,
    });

    // Seed Evidence
    const evidenceList = [
      {
        id: `ev_${evaluationId}_deck`,
        evaluationId,
        type: 'PROJECT_DOCUMENT' as const,
        source: `${p.name}_PitchDeck.pptx`,
        sourceTitle: `${p.name} Architecture & Pitch Deck`,
        location: 'Slide 1 - 24',
        content: `Comprehensive technical specification and problem validation data for ${p.name}.`,
        confidence: 95,
        createdAt: new Date().toISOString(),
      },
      {
        id: `ev_${evaluationId}_code`,
        evaluationId,
        type: 'GITHUB' as const,
        source: 'GitHub Repository',
        sourceTitle: `${p.id}/core-engine`,
        location: 'src/main',
        content: 'Core algorithm implementation with benchmark test suite.',
        confidence: 92,
        createdAt: new Date().toISOString(),
      },
      {
        id: `ev_${evaluationId}_bench`,
        evaluationId,
        type: 'VIDEO' as const,
        source: 'Benchmark_Run.mp4',
        sourceTitle: 'Live Telemetry Benchmark Recording',
        location: '00:00 - 06:30',
        content: 'Demonstrated throughput, latency telemetry, and error rates.',
        confidence: 94,
        createdAt: new Date().toISOString(),
      }
    ];
    EvidenceRepository.createBatch(evidenceList);

    // Seed Claims (For Smart Road Vision, use Phase 7 benchmark claims)
    const claims = p.id === 'smart-road-vision' ? [] : [
      {
        id: `clm_${evaluationId}_1`,
        evaluationId,
        claimText: `The core ${p.name} algorithm sustains deterministic real-time latency under peak load.`,
        claimType: 'PERFORMANCE' as const,
        importance: 'CRITICAL' as const,
        status: 'VERIFIED' as const,
        confidence: 91,
        projectEvidence: 'Verified in benchmark log table and recorded video telemetry.',
        externalEvidence: 'Matches standard baseline bounds in IEEE Transactions.',
        explanation: 'Empirical verification passed without packet drop.',
        supportingEvidenceIds: [evidenceList[1].id, evidenceList[2].id],
        contradictingEvidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: `clm_${evaluationId}_2`,
        evaluationId,
        claimText: `Reduces operational lifecycle maintenance costs by 35-45% in production deployments.`,
        claimType: 'FEASIBILITY' as const,
        importance: 'HIGH' as const,
        status: 'PARTIALLY_VERIFIED' as const,
        confidence: 72,
        projectEvidence: 'Econometric case study submitted in whitepaper.',
        externalEvidence: 'Field validation requires full 12-month commercial pilot.',
        explanation: 'Theoretical cost savings models are robust; field pilot verification pending.',
        recommendedJudgeQuestion: `What specific operational dependencies could degrade the 35% cost reduction during first-year pilot deployment?`,
        supportingEvidenceIds: [evidenceList[0].id],
        contradictingEvidenceIds: [],
        createdAt: new Date().toISOString(),
      }
    ];
    if (claims.length > 0) {
      ClaimRepository.createBatch(claims);
    }

    // Seed Research Sources & Findings
    const researchSource = ResearchRepository.createSource({
      id: `src_${evaluationId}_1`,
      evaluationId,
      sourceType: 'RESEARCH_PAPER',
      title: `Prior Art Study in ${p.category}`,
      url: 'https://arxiv.org/abs/2301.09412',
      authors: ['Chen et al.'],
      publicationDate: '2023-01-15',
      authorityScore: 92,
      relevanceScore: 86,
      directnessScore: 81,
      overallRank: 1,
      metadata: { citations: 210 },
      createdAt: new Date().toISOString(),
    });

    ResearchRepository.createFinding({
      id: `fnd_${evaluationId}_1`,
      sourceId: researchSource.id,
      evaluationId,
      summary: `Established foundational benchmarks in ${p.category} literature with comparative error analysis.`,
      keyClaimsMatched: ['Latency benchmarks', 'Sensor calibration'],
      noveltyAspectsHighlighted: ['Novel edge quantization technique'],
      confidence: 89,
      evidenceId: evidenceList[0].id,
      createdAt: new Date().toISOString(),
    });

    // Seed ProjectDNA
    AssessmentRepository.saveProjectDNA({
      id: `dna_${evaluationId}`,
      evaluationId,
      problem: p.problemStatement,
      solution: p.solutionDescription,
      domain: p.domain,
      targetUsers: ['Enterprise Operators', 'Domain Engineers', 'Public Stakeholders'],
      inputs: ['Multimodal sensor streams', 'Telemetry feeds', 'Configuration parameters'],
      outputs: ['Structured diagnostic records', 'Alert dispatches', 'Interactive visualizations'],
      technologies: p.architectureType === 'SOFTWARE' ? ['TypeScript', 'Python', 'PyTorch', 'Docker'] : ['FreeRTOS', 'KiCad', 'CAN-FD', 'GaN Switches'],
      features: ['Real-time telemetry HUD', 'Automated anomaly detection', 'Fail-safe fallback routines'],
      claimedBenefits: ['95% anomaly capture rate', '40% operational cost savings'],
      architecture: p.architectureType === 'SOFTWARE' ? 'Ingestion -> Microservice Pipeline -> PostGIS / TimescaleDB -> UI HUD' : 'Sensors -> Signal Conditioning -> STM32 / FreeRTOS -> CAN-FD -> Power Stage',
      confidence: 94,
      evidenceIds: evidenceList.map(e => e.id),
      createdAt: new Date().toISOString(),
    });

    // Seed Technical Assessments
    const technicalAssessments = [
      {
        id: `tech_${evaluationId}_1`,
        evaluationId,
        architectureType: p.architectureType,
        category: p.architectureType === 'SOFTWARE' ? 'Architecture & Modularity' : 'System Architecture',
        score: p.id === 'smart-road-vision' ? 87 : 85,
        confidence: 90,
        evidenceCount: 12,
        strengths: ['Clean architectural separation of concerns with fault isolation.'],
        weaknesses: ['Shared state in session caching layer.'],
        risks: ['Scaling bottlenecks under 10k concurrent nodes.'],
        explanation: 'Evaluated against commercial enterprise standards with AST static analysis.',
        evidenceIds: evidenceList.map(e => e.id),
        createdAt: new Date().toISOString(),
      }
    ];
    AssessmentRepository.saveTechnicalAssessments(technicalAssessments);

    // Seed Originality
    AssessmentRepository.saveOriginalityAssessment({
      id: `orig_${evaluationId}`,
      evaluationId,
      originalityScore: p.id === 'smart-road-vision' ? 68 : p.id === 'cybershield' ? 81 : 78,
      similarityScore: p.id === 'smart-road-vision' ? 32 : 19,
      confidence: 74,
      classification: p.id === 'smart-road-vision' ? 'INSPIRED' : 'ORIGINAL',
      similarities: [
        {
          id: `sim_${evaluationId}_1`,
          evaluationId,
          sourceType: 'GITHUB',
          sourceTitle: 'OpenSource Baseline Model',
          sourceUrl: 'https://github.com/prior-art/baseline',
          similarityScore: 32,
          matchingFeatures: ['Convolutional feature extraction pipeline'],
          differences: ['Hardware INT8 quantizer calibration cache and spatial clustering heuristics'],
          evidenceIds: [evidenceList[1].id],
        }
      ],
      keyDifferences: ['Custom edge quantizer', 'Proprietary trajectory smoothing algorithm'],
      evidenceIds: evidenceList.map(e => e.id),
      createdAt: new Date().toISOString(),
    });

    // Seed Impact & Feasibility
    AssessmentRepository.saveImpactAssessment({
      id: `imp_${evaluationId}`,
      evaluationId,
      socialImpactScore: 92,
      economicImpactScore: 78,
      environmentalImpactScore: 71,
      accessibilityScore: 88,
      publicBenefitScore: 94,
      compositeScore: 92,
      confidence: 91,
      details: {
        socialSummary: 'High societal necessity and public utility benefit.',
        economicSummary: 'Demonstrated direct budget optimization for commercial/public operators.',
        environmentalSummary: 'Reduces unnecessary machinery emissions and material waste.',
        targetPopulation: 'Municipal transit commuters, delivery fleets, and public works crews.',
        estimatedValueCreated: '$4.2M estimated annual budget optimization.',
      },
      evidenceIds: evidenceList.map(e => e.id),
      createdAt: new Date().toISOString(),
    });

    AssessmentRepository.saveFeasibilityAssessment({
      id: `feas_${evaluationId}`,
      evaluationId,
      prototypeReadiness: 84,
      deploymentDifficulty: 72,
      infrastructureScore: 81,
      costScore: 76,
      maintenanceScore: 78,
      scalabilityScore: 85,
      commercialPotentialScore: 83,
      compositeScore: 79,
      confidence: 82,
      roadmap: {
        prototype: 'Benchtop validation completed with hardware telemetry recording.',
        pilot: '10-vehicle municipal transit trial underway.',
        production: 'Fleet-wide rollout with IP67 automotive packaging.',
      },
      evidenceIds: evidenceList.map(e => e.id),
      createdAt: new Date().toISOString(),
    });

    // Seed Presentation & Demo
    AssessmentRepository.savePresentationAnalysis({
      id: `pres_${evaluationId}`,
      evaluationId,
      presentationScore: 76,
      clarity: 89,
      confidenceScore: 74,
      speechRate: 142,
      fillerWordsCount: 14,
      structure: 79,
      eyeContact: 72,
      posture: 81,
      engagement: 75,
      timeManagement: 63,
      timelineEvents: [
        {
          id: `pe_${evaluationId}_1`,
          timestamp: '00:45',
          title: 'Compelling Problem Framing',
          description: 'Presenter established high stakeholder urgency with empirical data.',
          type: 'positive',
        },
        {
          id: `pe_${evaluationId}_2`,
          timestamp: '03:10',
          title: 'Accelerated Speech Cadence',
          description: 'Speaking pace peaked at 178 WPM on architecture slide.',
          type: 'warning',
        }
      ],
      strengths: ['Clear opening thesis', 'Good alignment between narrative and demo screen'],
      weaknesses: ['Speaking pace accelerated on slide 6', 'Exceeded allocated Q&A buffer'],
      improvementSuggestions: ['Pace technical slides at ~130 WPM', 'Structure direct edge-case failure answers'],
      evidenceIds: evidenceList.map(e => e.id),
      createdAt: new Date().toISOString(),
    });

    AssessmentRepository.saveDemoAnalysis({
      id: `demo_${evaluationId}`,
      evaluationId,
      demoScore: 84,
      completenessPercentage: 75,
      featuresAudited: [
        {
          id: `feat_${evaluationId}_1`,
          featureName: 'Core Real-Time Inference',
          status: 'SUCCESSFUL',
          observedLatencyMs: 18.4,
          notes: 'Demonstrated live in benchmark recording.',
        }
      ],
      observedErrors: ['Minor frame drop during dark underpass scene.'],
      unsupportedClaims: ['Night-time 95% accuracy was not demonstrated on active video.'],
      evidenceIds: evidenceList.map(e => e.id),
      createdAt: new Date().toISOString(),
    });

    // Calculate deterministic scores
    const verdict = ScoringEngine.calculate(evaluationId, {
      problemNeedRaw: 91,
      technicalQualityRaw: 87,
      originalityRaw: p.id === 'smart-road-vision' ? 68 : 81,
      socialImpactRaw: 92,
      presentationRaw: 76,
      demonstrationRaw: 84,
      feasibilityScalabilityRaw: 79,
      futurePotentialRaw: 94,
      evidenceCounts: {
        problemNeed: 6,
        technicalQuality: 12,
        originality: 7,
        socialImpact: 5,
        presentation: 4,
        demonstration: 4,
        feasibilityScalability: 4,
        futurePotential: 2,
      },
      rawConfidence: 89,
      hasContradictedClaims: false,
      unverifiedClaimRatio: 0.25,
    });
    AssessmentRepository.saveScores(verdict.categoryScores);

    // Seed Judge Questions & Recommendations
    const judgeQuestions = JudgeQuestionEngine.generate(evaluationId, claims, technicalAssessments);
    AssessmentRepository.saveJudgeQuestions(judgeQuestions);

    const { recommendations, risks } = RecommendationEngine.generate(
      evaluationId,
      technicalAssessments,
      {
        id: `orig_${evaluationId}`,
        evaluationId,
        originalityScore: 68,
        similarityScore: 32,
        confidence: 74,
        classification: 'INSPIRED',
        similarities: [],
        keyDifferences: [],
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: `feas_${evaluationId}`,
        evaluationId,
        prototypeReadiness: 84,
        deploymentDifficulty: 72,
        infrastructureScore: 81,
        costScore: 76,
        maintenanceScore: 78,
        scalabilityScore: 85,
        commercialPotentialScore: 83,
        compositeScore: 79,
        confidence: 82,
        roadmap: { prototype: '', pilot: '', production: '' },
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: `pres_${evaluationId}`,
        evaluationId,
        presentationScore: 76,
        clarity: 89,
        confidenceScore: 74,
        speechRate: 142,
        fillerWordsCount: 14,
        structure: 79,
        eyeContact: 72,
        posture: 81,
        engagement: 75,
        timeManagement: 63,
        timelineEvents: [],
        strengths: [],
        weaknesses: [],
        improvementSuggestions: [],
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      }
    );
    AssessmentRepository.saveRecommendations(recommendations);
    AssessmentRepository.saveRisks(risks);

    // Save complete 20-section report
    const report = ReportService.generateReport({
      project: p as any,
      evaluation: {
        id: evaluationId,
        projectId: p.id,
        mode: 'VIDEO_ANALYSIS',
        status: 'COMPLETED',
        overallScore: verdict.overallScore,
        confidence: verdict.confidence,
        verdict: verdict.verdict,
        executionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      verdict,
      dna: {
        id: `dna_${evaluationId}`,
        evaluationId,
        problem: p.problemStatement,
        solution: p.solutionDescription,
        domain: p.domain,
        targetUsers: ['Enterprise Operators', 'Domain Engineers'],
        inputs: ['Sensor feeds'],
        outputs: ['GeoJSON alerts'],
        technologies: ['PyTorch', 'TensorRT'],
        features: ['Real-time HUD'],
        claimedBenefits: ['40% cost reduction'],
        architecture: 'Sensors -> Inference -> Storage -> UI',
        confidence: 94,
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      technical: technicalAssessments,
      originality: {
        id: `orig_${evaluationId}`,
        evaluationId,
        originalityScore: 68,
        similarityScore: 32,
        confidence: 74,
        classification: 'INSPIRED',
        similarities: [],
        keyDifferences: [],
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      claims,
      impact: {
        id: `imp_${evaluationId}`,
        evaluationId,
        socialImpactScore: 92,
        economicImpactScore: 78,
        environmentalImpactScore: 71,
        accessibilityScore: 88,
        publicBenefitScore: 94,
        compositeScore: 92,
        confidence: 91,
        details: {
          socialSummary: 'High public safety benefit.',
          economicSummary: '$4.2M estimated annual budget optimization.',
          environmentalSummary: 'Bitumen repaving emissions reduction.',
          targetPopulation: 'Municipal transit commuters.',
          estimatedValueCreated: '$4.2M budget reduction.',
        },
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      feasibility: {
        id: `feas_${evaluationId}`,
        evaluationId,
        prototypeReadiness: 84,
        deploymentDifficulty: 72,
        infrastructureScore: 81,
        costScore: 76,
        maintenanceScore: 78,
        scalabilityScore: 85,
        commercialPotentialScore: 83,
        compositeScore: 79,
        confidence: 82,
        roadmap: { prototype: '', pilot: '', production: '' },
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      presentation: {
        id: `pres_${evaluationId}`,
        evaluationId,
        presentationScore: 76,
        clarity: 89,
        confidenceScore: 74,
        speechRate: 142,
        fillerWordsCount: 14,
        structure: 79,
        eyeContact: 72,
        posture: 81,
        engagement: 75,
        timeManagement: 63,
        timelineEvents: [],
        strengths: [],
        weaknesses: [],
        improvementSuggestions: [],
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      demo: {
        id: `demo_${evaluationId}`,
        evaluationId,
        demoScore: 84,
        completenessPercentage: 75,
        featuresAudited: [],
        observedErrors: [],
        unsupportedClaims: [],
        evidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      risks,
      recommendations,
      judgeQuestions,
      evidenceList,
      sources: [researchSource],
    });
    AssessmentRepository.saveReport(report);
  }

  // --- Seed Phase 7 Canonical Claims for Smart Road Vision (Used across Multimodal & Truth Analysis) ---
  const { ClaimVerificationPipeline } = await import('../claim-verification/claimVerificationPipeline.js');
  ClaimVerificationPipeline.seedBenchmarkClaims('eval_smart-road-vision');

  // --- Seed Phase 3: Document Intelligence for Smart Road Vision ---
  console.log('  📄 Seeding Phase 3 Document Intelligence artifacts...');
  const srvDeck = DocumentRepository.createDocument({
    id: 'doc_srv_pitchdeck',
    projectId: 'smart-road-vision',
    evaluationId: 'eval_smart-road-vision',
    fileName: 'SmartRoadVision_PitchDeck.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    sizeBytes: 14200000,
    pageCount: 10,
    status: 'UPLOADED',
  });

  DocumentPipeline.processDocument(
    srvDeck.id,
    srvDeck.projectId,
    srvDeck.evaluationId!,
    srvDeck.fileName,
    srvDeck.mimeType,
    srvDeck.sizeBytes
  );

  const srvWhitepaper = DocumentRepository.createDocument({
    id: 'doc_srv_whitepaper',
    projectId: 'smart-road-vision',
    evaluationId: 'eval_smart-road-vision',
    fileName: 'SmartRoadVision_Technical_Whitepaper.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 4800000,
    pageCount: 4,
    status: 'UPLOADED',
  });

  DocumentPipeline.processDocument(
    srvWhitepaper.id,
    srvWhitepaper.projectId,
    srvWhitepaper.evaluationId!,
    srvWhitepaper.fileName,
    srvWhitepaper.mimeType,
    srvWhitepaper.sizeBytes
  );

  // --- Seed Phase 4: Multimodal Video Analysis for Smart Road Vision ---
  console.log('  🎥 Seeding Phase 4 Multimodal Video Analysis artifacts...');
  const srvVideo = MultimodalRepository.createVideo({
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
    status: 'UPLOADED',
  });

  await MultimodalPipeline.processVideo(srvVideo.id);

  // --- Seed Phase 5: Research Intelligence Engine for Smart Road Vision ---
  console.log('  🔬 Seeding Phase 5 Research Intelligence Engine artifacts...');
  const { researchPipeline } = await import('../research-intelligence/researchPipeline.js');
  await researchPipeline.executeResearch('eval_smart-road-vision');

  // --- Seed Phase 6: Originality & Multi-Dimensional Similarity Intelligence Engine ---
  console.log('  🔍 Seeding Phase 6 Originality & Multi-Dimensional Similarity Intelligence artifacts...');
  const { OriginalityPipeline } = await import('../originality-intelligence/originalityPipeline.js');
  await OriginalityPipeline.executeAnalysis('eval_smart-road-vision');

  // --- Seed Phase 7: Claim Verification & Truth Analysis Engine ---
  console.log('  ⚖️ Seeding Phase 7 Claim Verification & Truth Analysis artifacts...');
  await ClaimVerificationPipeline.executeAnalysis('eval_smart-road-vision');

  // --- Seed Phase 8: Technical + Impact + Feasibility Intelligence Engine ---
  console.log('  📊 Seeding Phase 8 Technical + Impact + Feasibility Intelligence Engine artifacts...');
  const { SpecialistEvaluationController } = await import('../controllers/specialistEvaluationController');
  for (const p of sampleProjects) {
    await SpecialistEvaluationController.buildContextAndAnalyze(`eval_${p.id}`);
  }

  // --- Seed Phase 9: AI Jury + Master Scoring Engine ---
  console.log('  ⚖️ Seeding Phase 9 AI Jury + Master Scoring Engine artifacts...');
  const { MasterScoringEngine } = await import('../scoring/masterScoringEngine');
  const { JuryRepository } = await import('../repositories/juryRepository');
  const {
    CANONICAL_RUBRIC_CATEGORIES,
    DEFAULT_WEIGHTS,
    DEFAULT_VERDICT_THRESHOLDS,
  } = await import('../config/rubrics');

  // 1. Seed Master Rubric and Version
  JuryRepository.createOrUpdateRubric({
    id: 'rubric_standard_institutional',
    name: 'ProjectX-Ray Consensus Rubric',
    description: 'Standard 8-dimension weighted evaluation rubric for academic, defense, and venture evaluations.',
    isDefault: true,
    createdAt: new Date().toISOString(),
  });

  JuryRepository.createRubricVersion({
    id: 'rubric_v1_canonical',
    rubricId: 'rubric_standard_institutional',
    version: '1.0.0',
    name: 'Consensus Rubric v1.0.0 (Canonical)',
    weights: DEFAULT_WEIGHTS,
    thresholds: DEFAULT_VERDICT_THRESHOLDS,
    categoryDefinitions: CANONICAL_RUBRIC_CATEGORIES,
    createdAt: new Date().toISOString(),
  });

  // 2. Compute and seed Master Evaluations for all sample projects
  for (const p of sampleProjects) {
    const evalId = `eval_${p.id}`;
    const context = MasterScoringEngine.loadContext(evalId, 'rubric_v1_canonical');
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);
    JuryRepository.saveJuryDecision(decision);
    if (decision.categoryScores) {
      JuryRepository.saveCategoryScores(decision.categoryScores);
    }
  }

  // 3. Seed canonical score history for Smart Road Vision (v1: 76.3, v2: 81.1, v3: 83.7)
  JuryRepository.saveScoreHistory({
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
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  });

  JuryRepository.saveScoreHistory({
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
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  });

  JuryRepository.saveScoreHistory({
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
    createdAt: new Date().toISOString(),
  });

  // 4. Seed Human Review and Jury Notes for Smart Road Vision
  JuryRepository.saveHumanReview({
    id: 'hrev_srv_01',
    evaluationId: 'eval_smart-road-vision',
    reviewer: 'Dr. Marcus Vance (Chief Jury Chair)',
    category: 'Technical Quality',
    originalScore: 87.0,
    reviewedScore: 89.0,
    reason: 'Hardware bench trial on Jetson Orin demonstrated exceptional frame stability (42.4 FPS sustained with zero thermal throttling over 600s test).',
    createdAt: new Date().toISOString(),
  });

  JuryRepository.saveJuryNote({
    id: 'jnote_srv_01',
    evaluationId: 'eval_smart-road-vision',
    category: 'TECHNICAL',
    text: 'TensorRT FP16 quantization maintains detection mAP within 1.2% of FP32 baseline. Architecture is sound.',
    author: 'Elena Rostova (Senior AI Systems Juror)',
    relatedEvidenceIds: ['ev_video_srv_orin_01'],
    timestamp: new Date().toISOString(),
  });

  JuryRepository.saveJuryNote({
    id: 'jnote_srv_02',
    evaluationId: 'eval_smart-road-vision',
    category: 'FEASIBILITY',
    text: 'Cellular 5G backhaul operating costs must be negotiated under bulk municipal data pooled contracts before pilot scale-up.',
    author: 'David K. Chen (Infrastructure & Procurement Juror)',
    relatedEvidenceIds: ['ev_feas_cost_01'],
    timestamp: new Date().toISOString(),
  });

  // 5. Seed sample Question Interactions
  JuryRepository.saveQuestionInteraction({
    id: 'qi_eval_smart-road-vision_jq_01',
    evaluationId: 'eval_smart-road-vision',
    questionId: 'jq_01',
    isAsked: true,
    isFlagged: false,
    isBookmarked: true,
    judgeNote: 'Team confirmed independent evaluation is planned for Q4 at Munich test center.',
    updatedAt: new Date().toISOString(),
  });

  // --- Seed Phase 10: Final Intelligence Report + Evidence Explorer ---
  console.log('  📑 Seeding Phase 10 Final Intelligence Report + Evidence Explorer artifacts...');
  const { ReportEngine } = await import('../report/reportEngine');
  const { ReportRepository } = await import('../repositories/reportRepository');

  // Generate and save canonical v3 report for Smart Road Vision
  const reportV3 = ReportEngine.generate('eval_smart-road-vision', 3);
  ReportRepository.saveReport(reportV3);

  // Seed historical versions v1 and v2 for comparison
  const reportV1 = {
    ...reportV3,
    id: 'rep_eval_smart-road-vision_v1',
    version: 1,
    overallScore: 76.3,
    overallVerdict: 'PROMISING',
    overallConfidence: 72,
    evidenceCoverage: 64,
    generatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  };
  ReportRepository.saveReportVersion({
    id: 'ver_srv_v1',
    evaluationId: 'eval_smart-road-vision',
    version: 1,
    reportId: 'rep_eval_smart-road-vision_v1',
    overallScore: 76.3,
    verdict: 'PROMISING',
    confidence: 72,
    coverage: 64,
    status: 'READY',
    changesSummary: 'Initial automated ingestion of pitch deck and technical whitepaper.',
    newEvidenceCount: 8,
    changedClaimsCount: 16,
    reportJson: JSON.stringify(reportV1),
    generatedAt: reportV1.generatedAt,
  });

  const reportV2 = {
    ...reportV3,
    id: 'rep_eval_smart-road-vision_v2',
    version: 2,
    overallScore: 81.1,
    overallVerdict: 'STRONG',
    overallConfidence: 81,
    evidenceCoverage: 74,
    generatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  };
  ReportRepository.saveReportVersion({
    id: 'ver_srv_v2',
    evaluationId: 'eval_smart-road-vision',
    version: 2,
    reportId: 'rep_eval_smart-road-vision_v2',
    overallScore: 81.1,
    verdict: 'STRONG',
    confidence: 81,
    coverage: 74,
    status: 'READY',
    changesSummary: 'Ingested Jetson Orin live hardware video benchmarks and speech cadence telemetry.',
    newEvidenceCount: 11,
    changedClaimsCount: 20,
    reportJson: JSON.stringify(reportV2),
    generatedAt: reportV2.generatedAt,
  });

  // Seed default share link
  ReportRepository.createShare({
    id: 'share_srv_institutional_demo',
    evaluationId: 'eval_smart-road-vision',
    reportId: reportV3.id,
    token: 'srv-share-token-2026-audit',
    permissions: 'VIEW_ONLY',
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    revokedAt: null,
    createdAt: new Date().toISOString(),
  });

  // =========================================================================
  // PHASE 11: LIVE CAMERA AI JURY SEEDING
  // =========================================================================
  const { LiveJuryEngine } = await import('../live/liveJuryEngine');
  const liveEngine = LiveJuryEngine.getInstance();
  liveEngine.startSession('eval_smart-road-vision', {
    role: 'PRESENTER',
    mockMode: true
  });

  // =========================================================================
  // PHASE 12: INTEGRATION & PRODUCTION HARDENING SEEDING
  // =========================================================================
  const { IntegrationRepository } = await import('../repositories/integrationRepository');
  
  // 1. Seed State for Smart Road Vision
  IntegrationRepository.getOrCreateState('eval_smart-road-vision', 'READY_FOR_REVIEW');
  IntegrationRepository.updateState('eval_smart-road-vision', {
    currentState: 'READY_FOR_REVIEW',
    previousState: 'REPORT_GENERATING',
    latestCheckpoint: 'REPORT_COMPLETE',
    isLocked: false
  });

  // 2. Seed Checkpoints
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'INGESTION_COMPLETE', 'Document Ingestion', 'hash_srv_ingest');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'PROJECT_DNA_COMPLETE', 'Project DNA Synthesis', 'hash_srv_dna');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'MEDIA_COMPLETE', 'Media & Presentation Forensics', 'hash_srv_media');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'RESEARCH_COMPLETE', 'Prior Art & Patent Research', 'hash_srv_research');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'ORIGINALITY_COMPLETE', 'Originality & Novelty Intelligence', 'hash_srv_orig');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'CLAIMS_COMPLETE', 'Multimodal Claim Verification', 'hash_srv_claims');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'EVALUATION_COMPLETE', 'Specialist Assessment Aggregation', 'hash_srv_eval');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'SCORING_COMPLETE', 'Deterministic Rubric Calibration', 'hash_srv_score');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'JURY_COMPLETE', 'AI Jury Deliberation & Verdict', 'hash_srv_jury');
  IntegrationRepository.saveCheckpoint('eval_smart-road-vision', 'REPORT_COMPLETE', '22-Section Intelligence Dossier Assembly', 'hash_srv_report');

  // 3. Seed Feature Flags
  database.exec(`
    INSERT OR REPLACE INTO feature_flags (key, name, enabled, description) VALUES
    ('LIVE_CAMERA', 'Live Camera AI Jury', 1, 'Real-time camera & speech jury deliberation room'),
    ('RESEARCH_ENGINE', 'Autonomous Research Engine', 1, 'Autonomous multi-source research intelligence and prior-art search'),
    ('PATENT_RESEARCH', 'Patent Intelligence Engine', 1, 'Autonomous patent claims and IPC classification search'),
    ('CODE_ANALYSIS', 'Technical Code Auditor', 1, 'Deep AST code inspection and security audit'),
    ('PDF_EXPORT', 'Institutional PDF Export', 1, 'Publication-grade A4 PDF dossier generator'),
    ('REPORT_SHARING', 'Public Report Sharing', 1, 'Cryptographic read-only public dossier share links'),
    ('HUMAN_REVIEW', 'Human Review Workflow', 1, 'Reviewer gate and evidence request management');
  `);

  // 4. Seed Audit Logs
  IntegrationRepository.logAudit(
    'SYSTEM_SEEDED',
    'SYSTEM',
    'eval_smart-road-vision',
    'system',
    'SYSTEM',
    { status: 'INITIAL_SEED_COMPLETE', version: 'Phase 12 Production Build' }
  );

  // 5. Seed Usage Record
  IntegrationRepository.logUsage(
    'eval_smart-road-vision',
    'Anthropic Claude 3.5 Sonnet',
    'PIPELINE_ORCHESTRATION',
    28500,
    9400,
    3420,
    0.2265
  );

  // 6. Seed Sample Evidence Request
  IntegrationRepository.createEvidenceRequest(
    'eval_smart-road-vision',
    'Adverse Weather Nighttime Precipitation Dataset',
    'Please submit empirical precision/recall test logs under heavy nighttime rain with windshield glare.',
    'MEDIUM',
    'Senior Transportation Auditor'
  );

  console.log(`✅ Database successfully seeded with Phase 1-12 end-to-end integration artifacts.`);
}

// Run seed if executed directly
if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase().catch(err => {
    console.error('❌ Database seed error:', err);
    process.exit(1);
  });
}

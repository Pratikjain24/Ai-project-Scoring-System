export type AudiencePreset = 'university' | 'hackathon' | 'incubator' | 'enterprise';

export interface GroundedConclusion {
  statement: string;
  evidence: string;
  confidence: number; // 0-100%
  source: string;
}

export interface MasterDossierSectionMeta {
  id: string;
  num: number;
  title: string;
  category: 'core' | 'technical' | 'impact' | 'execution' | 'verdict';
}

export interface MasterDossierData {
  // Top Header Metadata
  projectId: string;
  projectName: string;
  projectType: 'hardware' | 'software';
  tagline: string;
  author: string;
  institution: string;
  evaluatedAt: string;
  evaluationEngineVersion: string;
  overallScore: number; // 0-100
  aiVerdict: 'Exceptional' | 'Strong' | 'Promising' | 'Needs Improvement' | 'Weak';
  confidenceScore: number; // 0-100%
  grade: string;
  percentile: string;
  juryPanel: string[];

  // 1. Executive Summary
  executiveSummary: {
    headline: string;
    verdict: string;
    keyFindings: string[];
    juryRecommendation: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 2. Project DNA
  projectDNA: {
    domain: string;
    projectType: string;
    targetAudience: string;
    coreStack: string[];
    inputs: string[];
    outputs: string[];
    architecturalTopology: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 3. Problem Analysis
  problemAnalysis: {
    problemStatement: string;
    severityLevel: 'Critical' | 'High' | 'Moderate';
    baselineContext: string;
    targetPainPoints: string[];
    marketDeficiency: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 4. Technical Audit
  technicalAudit: {
    score: number;
    auditStatus: string;
    subscores: Array<{ category: string; score: number; confidence: number; verdict: string }>;
    strengths: string[];
    architecturalCritique: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 5. Innovation & Originality
  originalityInvestigation: {
    originalityScore: number;
    similarityScore: number;
    tier: 'Original' | 'Inspired' | 'Moderately Similar' | 'Highly Similar' | 'Potential Replication';
    priorArtHighlights: Array<{ source: string; similarity: number; category: string; differentiation: string }>;
    groundedConclusions: GroundedConclusion[];
  };

  // 6. Claim Verification
  claimVerification: {
    verifiedCount: number;
    totalClaims: number;
    verificationRate: number;
    contradictions: number;
    auditedClaims: Array<{ claim: string; status: string; confidence: number; finding: string; evidenceRef: string }>;
    groundedConclusions: GroundedConclusion[];
  };

  // 7. Presentation Analysis
  presentationAnalysis: {
    score: number;
    clarityScore: number;
    paceWPM: number;
    confidenceScore: number;
    fillerWordsPerMin: number;
    structureScore: number;
    eyeContactGaze: number;
    postureScore: number;
    audienceEngagement: number;
    timeManagement: string;
    keyObservations: string[];
    groundedConclusions: GroundedConclusion[];
  };

  // 8. Demo Analysis
  demoAnalysis: {
    score: number;
    completenessRate: number;
    demonstratedFeaturesCount: number;
    successfulFeaturesCount: number;
    failedFeaturesCount: number;
    unsupportedClaimsCount: number;
    observedErrors: Array<{ timestamp: string; errorType: string; logSnippet: string; consequence: string }>;
    featuresDemonstrated: Array<{ feature: string; status: 'verified' | 'partial' | 'failed'; timestamp: string; note: string }>;
    groundedConclusions: GroundedConclusion[];
  };

  // 9. Social Impact
  socialImpact: {
    score: number;
    headlineMetric: string;
    peopleAffected: string;
    problemSeverity: string;
    accessibilityBenefit: string;
    humanitarianValue: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 10. Economic Impact
  economicImpact: {
    score: number;
    headlineMetric: string;
    costSavings: string;
    affordabilityIndex: string;
    marketRelevance: string;
    roiEstimate: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 11. Environmental Impact
  environmentalImpact: {
    score: number;
    headlineMetric: string;
    energyUsageProfile: string;
    materialUsageAndRecyclability: string;
    emissionsImplications: string;
    sustainabilityLifecycle: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 12. Feasibility
  feasibility: {
    score: number;
    trlLevel: string;
    deploymentComplexity: 'Low' | 'Moderate' | 'High';
    infrastructureRequirements: string[];
    estimatedCapEx: string;
    estimatedOpEx: string;
    maintenanceProfile: string;
    scalabilityBottleneck: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 13. Risks
  risks: Array<{
    id: string;
    title: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    probability: 'High' | 'Medium' | 'Low';
    category: 'Technical' | 'Regulatory' | 'Supply Chain' | 'Security';
    impactArea: string;
    detectedEvidence: string;
    mitigation: string;
    confidence: number;
  }>;

  // 14. Recommended Improvements
  improvements: Array<{
    id: string;
    priority: 'P0 (Must Fix)' | 'P1 (High Priority)' | 'P2 (Optimization)';
    recommendation: string;
    rationale: string;
    effort: 'Low' | 'Medium' | 'High';
    evidenceTrigger: string;
    confidence: number;
  }>;

  // 15. Future Scope
  futureScope: {
    shortTermRoadmap: string[];
    longTermVision: string;
    ipAndPatentPotential: string;
    groundedConclusions: GroundedConclusion[];
  };

  // 16. Commercialization Potential
  commercializationPotential: {
    score: number;
    marketMaturity: string;
    targetBuyerPersona: string;
    go_to_market_strategy: string;
    competitiveMoat: string;
    regulatoryPath: string;
    unitEconomics: {
      bomOrHostingCost: string;
      targetSellingPrice: string;
      projectedGrossMargin: string;
    };
    groundedConclusions: GroundedConclusion[];
  };

  // 17. Judge Questions
  judgeQuestions: Array<{
    id: string;
    question: string;
    targetVulnerability: string;
    rationale: string;
    requiredProof: string;
  }>;

  // 18. Evidence
  evidenceLocker: Array<{
    id: string;
    title: string;
    type: 'Hardware Telemetry' | 'Code Audit' | 'Benchmark' | 'Video Timestamp' | 'Schematic' | 'Sensor Log';
    source: string;
    location: string;
    reliabilityScore: number;
    excerpt: string;
  }>;

  // 19. External Sources
  sourcesAndCitations: Array<{
    id: string;
    title: string;
    type: 'Research Paper' | 'Patent' | 'RFC / Standard' | 'GitHub Repository' | 'Industry Benchmark' | 'Gov Safety Archive';
    citation: string;
    url?: string;
    relevanceToEvaluation: string;
  }>;

  // 20. Final AI Jury Verdict
  finalVerdictConsensus: {
    score: number;
    tier: 'Exceptional' | 'Strong' | 'Promising' | 'Needs Improvement' | 'Weak';
    verdictStatement: string;
    juryConsensusText: string;
    votingBreakdown: Array<{
      jurorName: string;
      role: string;
      voteScore: number;
      verdictStance: string;
      quote: string;
    }>;
    weightDistribution: Array<{
      dimension: string;
      weight: number;
      score: number;
      contribution: number;
    }>;
    groundedConclusions: GroundedConclusion[];
  };
}

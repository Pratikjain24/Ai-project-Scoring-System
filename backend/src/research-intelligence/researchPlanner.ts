import type { ResearchPlan, ResearchQuestion } from '../models/researchIntelligence';

export class ResearchPlanner {
  /**
   * Generates structured research plan and key research questions
   */
  static planResearch(
    evaluationId: string,
    projectId: string,
    projectName: string = 'Smart Road Vision',
    domain: string = 'Smart Mobility & Municipal Transit Infrastructure',
    technologies: string[] = ['YOLOv8', 'NVIDIA Jetson Orin Nano', 'TensorRT', 'SQLite', 'MQTT']
  ): { plan: ResearchPlan; questions: ResearchQuestion[] } {
    const planId = `plan_${evaluationId}`;
    const now = new Date().toISOString();

    const plan: ResearchPlan = {
      id: planId,
      evaluationId,
      projectId,
      searchTopics: [
        'Autonomous Road Distress Detection and Pothole Telemetry',
        'NVIDIA Jetson Edge Inference Computer Vision Benchmarks',
        'Municipal Asphalt Degradation Statistics and Maintenance Costs',
        'Commercial and Open-Source Pavement Inspection Solutions',
        'RDD2022 Dataset Precision and Real-Time Latency Standards',
      ],
      sourceTypes: ['ACADEMIC', 'GITHUB', 'PATENT', 'COMPANY', 'PRODUCT', 'GOVERNMENT'],
      priority: 'HIGH',
      expectedEvidence: [
        'Peer-reviewed computer vision benchmark metrics',
        'Public open-source edge YOLO road hazard repositories',
        'Municipal infrastructure expenditure reports',
        'Active commercial telemetry fleet patents and commercial competitors',
      ],
      createdAt: now,
    };

    const questions: ResearchQuestion[] = [
      {
        id: `rq_${evaluationId}_1`,
        evaluationId,
        planId,
        questionText: `What open-source or commercial edge computer vision systems already exist for road hazard detection?`,
        category: 'SIMILARITY',
        priority: 'CRITICAL',
        status: 'ANSWERED',
        createdAt: now,
      },
      {
        id: `rq_${evaluationId}_2`,
        evaluationId,
        planId,
        questionText: `What commercial startups or enterprise products offer automated municipal road surface inspection?`,
        category: 'COMPETITORS',
        priority: 'HIGH',
        status: 'ANSWERED',
        createdAt: now,
      },
      {
        id: `rq_${evaluationId}_3`,
        evaluationId,
        planId,
        questionText: `What academic literature and peer-reviewed benchmarks exist for YOLO-based defect detection on the RDD2022 dataset?`,
        category: 'ACADEMIC',
        priority: 'HIGH',
        status: 'ANSWERED',
        createdAt: now,
      },
      {
        id: `rq_${evaluationId}_4`,
        evaluationId,
        planId,
        questionText: `What are established real-time latency and accuracy benchmarks for quantized neural models running on NVIDIA Jetson Orin?`,
        category: 'BENCHMARKS',
        priority: 'HIGH',
        status: 'ANSWERED',
        createdAt: now,
      },
      {
        id: `rq_${evaluationId}_5`,
        evaluationId,
        planId,
        questionText: `What patents exist around vehicle-mounted optical road distress classification and telemetry?`,
        category: 'PATENTS',
        priority: 'MEDIUM',
        status: 'ANSWERED',
        createdAt: now,
      },
      {
        id: `rq_${evaluationId}_6`,
        evaluationId,
        planId,
        questionText: `How large is the municipal expenditure and public safety impact resulting from untreated pavement degradation?`,
        category: 'PROBLEM_SCALE',
        priority: 'HIGH',
        status: 'ANSWERED',
        createdAt: now,
      },
      {
        id: `rq_${evaluationId}_7`,
        evaluationId,
        planId,
        questionText: `What are the known operational limitations of optical road hazard detection under adverse weather and night-time conditions?`,
        category: 'LIMITATIONS',
        priority: 'HIGH',
        status: 'ANSWERED',
        createdAt: now,
      },
      {
        id: `rq_${evaluationId}_8`,
        evaluationId,
        planId,
        questionText: `Does external research substantiate the feasibility of 95% accuracy in mixed crack and pothole classification?`,
        category: 'CLAIM_VERIFICATION',
        priority: 'CRITICAL',
        status: 'ANSWERED',
        createdAt: now,
      },
    ];

    return { plan, questions };
  }

  public createPlan(
    evaluationId: string,
    projectName: string = 'Smart Road Vision',
    problem: string = 'Automated road hazard detection',
    domain: string = 'Smart Infrastructure',
    technologies: string[] = ['YOLOv8', 'Python'],
    features: string[] = ['Pothole detection'],
    claims: string[] = []
  ): ResearchPlan & { questions: ResearchQuestion[] } {
    const { plan, questions } = ResearchPlanner.planResearch(
      evaluationId,
      `proj_${evaluationId}`,
      projectName,
      domain,
      technologies
    );
    return {
      ...plan,
      questions: questions.map(q => ({
        ...q,
        question: q.questionText
      }))
    };
  }
}

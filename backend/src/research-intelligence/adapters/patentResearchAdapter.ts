import type { PatentRecord } from '../../models/researchIntelligence';

export class PatentResearchAdapter {
  /**
   * Stores patent record without drawing legal conclusions
   */
  static extractPatentRecord(
    evaluationId: string,
    sourceId: string | undefined,
    data: {
      patentNumber: string;
      title: string;
      applicant: string;
      inventor?: string;
      filingDate?: string;
      publicationDate?: string;
      status: string;
      summary: string;
      relevantClaims: string[];
      sourceUrl?: string;
    }
  ): PatentRecord {
    const now = new Date().toISOString();

    // Guardrail: Ensure summary uses neutral non-infringing phrasing
    const sanitizedSummary = data.summary.includes('infringes')
      ? data.summary.replace(/infringes/gi, 'shares conceptual similarity with')
      : data.summary;

    return {
      id: `pat_${evaluationId}_${data.patentNumber.replace(/[^a-zA-Z0-9]/g, '_')}`,
      sourceId,
      evaluationId,
      patentNumber: data.patentNumber,
      title: data.title,
      applicant: data.applicant,
      inventor: data.inventor,
      filingDate: data.filingDate,
      publicationDate: data.publicationDate,
      status: data.status,
      summary: `Potentially relevant patent identified: ${sanitizedSummary}`,
      relevantClaims: data.relevantClaims,
      sourceUrl: data.sourceUrl,
      createdAt: now,
    };
  }

  public searchPatents(
    evaluationId: string,
    domain: string = 'Road Vision',
    technologies: string[] = ['Edge Computing']
  ): PatentRecord[] {
    return [
      PatentResearchAdapter.extractPatentRecord(evaluationId, 'src_patent_1', {
        patentNumber: 'US-11245892-B2',
        title: 'Vehicle-Mounted Optical Sensing System for Dynamic Road Surface Distress Telemetry',
        applicant: 'Blyncsy Inc.',
        inventor: 'M. Pack, A. Smith',
        filingDate: '2019-06-14',
        publicationDate: '2022-02-08',
        status: 'GRANTED',
        summary: 'A method for capturing real-time roadway distress images using a calibrated vehicular forward-facing camera and transmitting bounding-box coordinates to municipal geographic dispatching servers.',
        relevantClaims: [
          'Claim 1: A method of automated road anomaly notification comprising capturing optical frame sequences from a moving vehicle...',
          'Claim 8: The method of claim 1 wherein an edge processor executes local inference filtering prior to cellular data packet transmission...'
        ],
        sourceUrl: 'https://patents.google.com/patent/US11245892B2/en'
      }),
      PatentResearchAdapter.extractPatentRecord(evaluationId, 'src_patent_2', {
        patentNumber: 'US-20230186542-A1',
        title: 'Real-Time Edge Neural Network Pavement Crack Classification With Geo-Spatial Mapping',
        applicant: 'RoadBotics Inc. / Michelin Mobility',
        inventor: 'C. Hendrickson, B. Wilson',
        filingDate: '2021-12-10',
        publicationDate: '2023-06-15',
        status: 'PENDING_APPLICATION',
        summary: 'Deep neural network architectures configured for embedded vehicle processing to index asphalt pothole severity indices with high-precision GNSS telemetry.',
        relevantClaims: [
          'Claim 1: An in-vehicle edge computing device comprising a machine vision camera and neural accelerator running object detection...'
        ],
        sourceUrl: 'https://patents.google.com/patent/US20230186542A1/en'
      })
    ];
  }
}

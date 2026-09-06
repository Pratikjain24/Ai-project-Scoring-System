import type { PresentationAnalysis, PresentationEvent } from '../models/presentation';
import type { Evidence } from '../models/evidence';

export class PresentationAgent {
  static async evaluate(
    evaluationId: string,
    evidenceList: Evidence[]
  ): Promise<PresentationAnalysis> {
    const evidenceIds = evidenceList.map(e => e.id);

    const timelineEvents: PresentationEvent[] = [
      {
        id: `pe_${evaluationId}_1`,
        timestamp: '00:45',
        title: 'Problem Framing & Municipal Loss Data',
        description: 'Compelling presentation of annual road infrastructure damage statistics with clear stakeholder urgency.',
        type: 'positive',
        evidenceId: evidenceIds[0],
      },
      {
        id: `pe_${evaluationId}_2`,
        timestamp: '02:30',
        title: 'Accelerated Speech Cadence on Slide 6',
        description: 'Speaking pace surged above 178 words per minute while explaining INT8 quantization mathematics.',
        type: 'warning',
      },
      {
        id: `pe_${evaluationId}_3`,
        timestamp: '05:15',
        title: 'Effective Edge Video Demonstration',
        description: 'Presenter smoothly walked through real-time bounding box detections and latency telemetry with steady gaze.',
        type: 'positive',
        evidenceId: evidenceIds[1],
      },
      {
        id: `pe_${evaluationId}_4`,
        timestamp: '08:40',
        title: 'Vague Response on Cold-Weather Generalization',
        description: 'Hedging language ("we assume", "probably fine") detected when addressing snow and ice accumulation.',
        type: 'warning',
      }
    ];

    return {
      id: `pres_${evaluationId}`,
      evaluationId,
      presentationScore: 76,
      clarity: 89,
      confidenceScore: 74,
      speechRate: 142, // average WPM
      fillerWordsCount: 14,
      structure: 79,
      eyeContact: 72,
      posture: 81,
      engagement: 75,
      timeManagement: 63,
      timelineEvents,
      strengths: [
        'Lucid, data-driven opening establishing high municipal urgency.',
        'Seamless integration between spoken narrative and live edge telemetry overlay.'
      ],
      weaknesses: [
        'Rapid speaking cadence when describing hardware quantizer trade-offs.',
        'Exceeded allocated Q&A response time buffer by 90 seconds.'
      ],
      improvementSuggestions: [
        'Pace technical architecture slides at ~130 WPM to improve juror absorption.',
        'Standardize direct answers for seasonal weather failure-mode edge cases.'
      ],
      evidenceIds: evidenceIds.slice(0, 4),
      createdAt: new Date().toISOString(),
    };
  }
}

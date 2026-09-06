import type {
  AIProvider,
  TextGenerationOptions,
  TranscriptionResult,
  VideoAnalysisResult,
  ModerationResult,
} from './aiProvider.interface';

export class MockAIProvider implements AIProvider {
  name = 'Deterministic Mock AI Jury Provider';

  async generateText(prompt: string, options?: TextGenerationOptions): Promise<string> {
    // If jsonMode is requested, return structured JSON based on keywords
    if (options?.jsonMode) {
      if (prompt.includes('ProjectDNA')) {
        return JSON.stringify({
          problem: 'Infrastructure damage reactively detected after vehicular damage.',
          solution: 'Edge-deployed computer vision model running on municipal transit fleet cameras.',
          domain: 'AI & Computer Vision / Smart Mobility',
          targetUsers: ['Municipal transit authorities', 'City civil engineers', 'Public works directors'],
          inputs: ['1080p60 forward-facing camera feeds', 'GPS NMEA streams', 'IMU 6-axis telemetry'],
          outputs: ['Geo-indexed pothole damage GeoJSON', 'Severity classifications', 'Repair work orders'],
          technologies: ['PyTorch', 'TensorRT', 'YOLOv9', 'FastAPI', 'PostGIS', 'Docker'],
          features: ['Real-time 54 FPS inference', 'Sub-meter GPS smoothing', 'Automated work-order ticketing'],
          claimedBenefits: ['40% reduction in municipal road maintenance costs', '95% anomaly detection accuracy'],
          architecture: 'Camera -> Hardware Quantizer (Jetson Orin) -> Local Buffer -> 5G Sync -> PostGIS DB',
          confidence: 94,
        });
      }

      if (prompt.includes('ClaimExtraction')) {
        return JSON.stringify({
          claims: [
            {
              claimText: 'Model achieves 95.4% mAP50 anomaly detection accuracy on municipal asphalt.',
              claimType: 'ACCURACY',
              importance: 'CRITICAL',
              confidence: 91,
            },
            {
              claimText: 'Edge inference pipeline sustains 54 FPS throughput on NVIDIA Jetson Orin Nano.',
              claimType: 'PERFORMANCE',
              importance: 'HIGH',
              confidence: 94,
            },
            {
              claimText: 'Reduces municipal reactive repair expenditure by up to $4.2M annually.',
              claimType: 'FEASIBILITY',
              importance: 'HIGH',
              confidence: 76,
            }
          ]
        });
      }
    }

    return `Synthesized AI Analysis: Strong technical prototype addressing significant real-world problem with verified edge inference architecture.`;
  }

  async analyzeImage(_imageSource: string | Buffer, _prompt: string): Promise<string> {
    return 'Detected 4-layer PCB schematic with Texas Instruments buck converter and galvanic isolation barrier.';
  }

  async analyzeVideo(_videoSource: string, _prompt: string): Promise<VideoAnalysisResult> {
    return {
      detectedFeatures: [
        'Live edge inference bounding box overlay',
        'Sub-meter GPS trajectory mapping',
        'Model inference latency telemetry HUD'
      ],
      demonstratedMilestones: [
        { timestamp: '01:14', description: 'Real-time road surface defect bounding box overlay', status: 'PASS' },
        { timestamp: '03:42', description: 'Asphalt degradation severity classification (Class 3 pothole)', status: 'PASS' },
        { timestamp: '06:18', description: '5G work order push to municipal dispatch API', status: 'PASS' }
      ],
      observedAnomalies: [
        'Minor frame drop observed when transit vehicle transitioned into dark underpass at 04:22.'
      ]
    };
  }

  async transcribeAudio(_audioSource: string): Promise<TranscriptionResult> {
    return {
      transcript: 'Welcome everyone. Today we present Smart Road Vision, an edge computer vision system that runs on municipal transit fleets to predictively detect asphalt degradation before structural road failure occurs.',
      segments: [
        { startTimeMs: 0, endTimeMs: 4200, text: 'Welcome everyone.', confidence: 0.98 },
        { startTimeMs: 4200, endTimeMs: 12500, text: 'Today we present Smart Road Vision, an edge computer vision system...', confidence: 0.95 }
      ],
      durationSeconds: 420
    };
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    // Generate deterministic 64-dimension embedding
    return Array.from({ length: 64 }, (_, i) => Math.sin(i + 1) * 0.5);
  }

  async moderateContent(_text: string): Promise<ModerationResult> {
    return {
      flagged: false,
      categories: []
    };
  }

  async extractText(
    _documentSource: string | Buffer,
    _mimeType: string
  ): Promise<{ text: string; pages: { pageNumber: number; text: string; title?: string }[] }> {
    return {
      text: 'Smart Road Vision Architectural Specification and Evaluation Report.',
      pages: [
        {
          pageNumber: 1,
          title: 'Title & Executive Scope',
          text: 'Smart Road Vision: Real-time autonomous asphalt degradation telemetry on municipal transit fleets.'
        }
      ]
    };
  }

  async analyzeDocument(_documentSource: string | Buffer, _mimeType: string, _prompt: string): Promise<any> {
    return {
      qualityScore: 88,
      detectedTopics: ['Edge AI', 'Computer Vision', 'Municipal Transit', 'Predictive Maintenance'],
      completeness: 92
    };
  }

  async generateStructuredOutput<T>(prompt: string, _schema?: any): Promise<T> {
    const raw = await this.generateText(prompt, { jsonMode: true });
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {} as T;
    }
  }
}

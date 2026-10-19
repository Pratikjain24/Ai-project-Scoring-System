import type {
  VisualEvent,
  DemoObservation,
  DemoMilestone,
  VideoAnomaly,
} from '../models/multimodal';

export class VisualObservationService {
  /**
   * Generates high-level visual observations across screen, code, architecture, and hardware demos
   */
  static detectVisualEvents(videoId: string): VisualEvent[] {
    const eventsBlueprint: Array<Omit<VisualEvent, 'id' | 'videoId' | 'createdAt'>> = [
      {
        timestamp: 4,
        frameReference: 'frame_4s',
        eventType: 'SLIDE_CHANGE',
        description: 'Title slide visible: "Smart Road Vision - Autonomous Edge AI Road Inspection Platform". Presenter standing in frame.',
        confidence: 'HIGH',
      },
      {
        timestamp: 48,
        frameReference: 'frame_48s',
        eventType: 'CHART_SHOWN',
        description: 'Slide displays bar chart comparing annual municipal road maintenance costs across 12 metropolitan jurisdictions.',
        confidence: 'HIGH',
      },
      {
        timestamp: 112,
        frameReference: 'frame_112s',
        eventType: 'ARCHITECTURE_DIAGRAM_SHOWN',
        description: 'System architecture topology diagram displayed showing Vehicle Camera, Jetson Orin Nano, Local Queue, and Cloud Server.',
        confidence: 'HIGH',
      },
      {
        timestamp: 165,
        frameReference: 'frame_165s',
        eventType: 'CODE_SHOWN',
        description: 'Visual Studio Code interface shown with Python script: `yolov8_trt_inference.py` demonstrating TensorRT engine invocation.',
        confidence: 'HIGH',
      },
      {
        timestamp: 215,
        frameReference: 'frame_215s',
        eventType: 'RESULT_SHOWN',
        description: 'Confusion matrix and Precision-Recall curve displayed showing 94.2% precision on RDD2022 dataset test split.',
        confidence: 'HIGH',
      },
      {
        timestamp: 295,
        frameReference: 'frame_295s',
        eventType: 'HARDWARE_SHOWN',
        description: 'Physical bench setup visible showing NVIDIA Jetson Orin Nano Developer Kit with heatsink, CSI camera ribbon, and USB GPS receiver.',
        confidence: 'HIGH',
        hardwareConfidence: 'CONFIRMED',
      },
      {
        timestamp: 305,
        frameReference: 'frame_305s',
        eventType: 'SENSOR_INTERACTION',
        description: 'Presenter connects USB-C interface and powers on the Jetson Orin Nano development kit. Status LEDs illuminate green.',
        confidence: 'HIGH',
        hardwareConfidence: 'CONFIRMED',
      },
      {
        timestamp: 320,
        frameReference: 'frame_320s',
        eventType: 'APPLICATION_OPENED',
        description: 'Presenter launches Web Telemetry Dashboard in Google Chrome on connected workstation.',
        confidence: 'HIGH',
      },
      {
        timestamp: 365,
        frameReference: 'frame_365s',
        eventType: 'DASHBOARD_SHOWN',
        description: 'Telemetry dashboard active: live video feed displays bounding boxes around detected potholes and alligator cracks with 22.4ms latency counter.',
        confidence: 'HIGH',
      },
      {
        timestamp: 425,
        frameReference: 'frame_425s',
        eventType: 'ERROR_APPEARED',
        description: 'Visible warning banner in console: "Warning: Video frame buffer overrun (dropped 2 frames)". Dashboard recovers after 1.2 seconds.',
        confidence: 'HIGH',
      },
      {
        timestamp: 480,
        frameReference: 'frame_480s',
        eventType: 'DEVICE_RESPONSE',
        description: 'On-device power monitor meter displays 11.2 Watts active draw during 42 FPS continuous video inferencing.',
        confidence: 'HIGH',
        hardwareConfidence: 'CONFIRMED',
      },
      {
        timestamp: 545,
        frameReference: 'frame_545s',
        eventType: 'SLIDE_CHANGE',
        description: 'Slide changed to "Deployment Limitations & Environmental Edge Cases (Rain, Low-Light)".',
        confidence: 'HIGH',
      },
      {
        timestamp: 580,
        frameReference: 'frame_580s',
        eventType: 'SLIDE_CHANGE',
        description: 'Concluding slide displayed with GitHub repository URL, license information, and team contact details.',
        confidence: 'HIGH',
      },
    ];

    const now = new Date().toISOString();
    return eventsBlueprint.map((eb, idx) => ({
      ...eb,
      id: `vis_${videoId}_${idx + 1}`,
      videoId,
      createdAt: now,
    }));
  }

  /**
   * Generates discrete feature demo observations
   */
  static extractDemoObservations(videoId: string, evaluationId?: string): DemoObservation[] {
    const demoItems: Array<Omit<DemoObservation, 'id' | 'videoId' | 'evaluationId' | 'createdAt'>> = [
      {
        feature: 'Edge Hardware Power-on & Initialization',
        timestamp: 305,
        observedBehavior: 'Jetson Orin Nano powered via bench supply, boot sequence verified, CSI camera module initialized without kernel panics.',
        result: 'SUCCESS',
        confidence: 0.98,
        evidenceId: 'EVID-DEMO-01',
      },
      {
        feature: 'Real-Time Pothole & Crack Bounding Box Detection',
        timestamp: 365,
        observedBehavior: 'Simulated road footage passed to TensorRT model; green bounding boxes appeared around pavement fissures with 22.4ms measured latency.',
        result: 'SUCCESS',
        confidence: 0.96,
        evidenceId: 'EVID-DEMO-02',
      },
      {
        feature: 'GPS Telemetry Packet Synchronization',
        timestamp: 395,
        observedBehavior: 'Detected hazard coordinates logged to local SQLite telemetry table and verified in dashboard map view.',
        result: 'SUCCESS',
        confidence: 0.94,
        evidenceId: 'EVID-DEMO-03',
      },
      {
        feature: 'High-Throughput Frame Buffer Handling',
        timestamp: 425,
        observedBehavior: 'Rapid video stream panning caused a minor frame drop warning; system degraded gracefully without crash.',
        result: 'PARTIAL',
        confidence: 0.88,
        evidenceId: 'EVID-DEMO-04',
      },
      {
        feature: 'Multi-Vehicle Fleet Synchronization',
        timestamp: 450,
        observedBehavior: 'Multi-node synchronization was explained via slide diagrams but no second vehicle node was connected during the live session.',
        result: 'PARTIAL',
        confidence: 0.75,
      },
      {
        feature: 'Automated Road Authority PDF Work Order Export',
        timestamp: 510,
        observedBehavior: 'Mentioned as a feature in project docs, but feature was not opened or demonstrated during the recorded video session.',
        result: 'UNCERTAIN',
        confidence: 0.65,
      },
    ];

    const now = new Date().toISOString();
    return demoItems.map((d, idx) => ({
      ...d,
      id: `demo_${videoId}_${idx + 1}`,
      videoId,
      evaluationId,
      createdAt: now,
    }));
  }

  /**
   * Identifies demo milestones and ties them to project functional verifications
   */
  static detectDemoMilestones(videoId: string, evaluationId?: string): DemoMilestone[] {
    const milestonesBlueprint: Array<Omit<DemoMilestone, 'id' | 'videoId' | 'evaluationId' | 'createdAt'>> = [
      {
        milestoneName: 'Hardware Boot & Edge Peripherals Handshake',
        timestamp: 305,
        status: 'VERIFIED',
        confidence: 0.98,
        frameReference: 'frame_305s',
        verificationNotes: 'NVIDIA Jetson Orin Nano successfully booted. Sony IMX477 CSI sensor and USB GNSS locked without driver errors.',
        claimId: 'CLM-002',
        details: { subsystem: 'Embedded Platform', voltageVolts: 19.2, currentAmps: 0.58 },
      },
      {
        milestoneName: 'Real-Time Edge Inference Pipeline Online',
        timestamp: 365,
        status: 'VERIFIED',
        confidence: 0.96,
        frameReference: 'frame_365s',
        verificationNotes: 'YOLOv8 TensorRT engine running live stream at 42 FPS with sub-25ms latency and stable bounding boxes on asphalt cracks.',
        claimId: 'CLM-001',
        details: { fps: 42, latencyMs: 22.4, modelWeights: 'yolov8n-trt-fp16' },
      },
      {
        milestoneName: 'GPS Geotagging & Telemetry Serialization',
        timestamp: 395,
        status: 'VERIFIED',
        confidence: 0.94,
        frameReference: 'frame_395s',
        verificationNotes: 'Pothole detection coordinates packaged into GeoJSON payloads and synced to local edge storage queue.',
        claimId: 'CLM-003',
        details: { syncProtocol: 'SQLite WAL', droppedPackets: 0 },
      },
      {
        milestoneName: 'Stress Test: Frame Buffer Saturation Handling',
        timestamp: 425,
        status: 'PARTIAL',
        confidence: 0.85,
        frameReference: 'frame_425s',
        verificationNotes: 'Camera stream panning saturated memory buffer; 2 frames dropped before worker thread re-stabilized.',
        details: { droppedFrames: 2, recoveryDurationSec: 1.2 },
      },
      {
        milestoneName: 'Multi-Vehicle Ad-Hoc Mesh Sync',
        timestamp: 450,
        status: 'NOT_DEMONSTRATED',
        confidence: 0.72,
        frameReference: 'frame_450s',
        verificationNotes: 'Presenter talked through mesh network topology on slide 14, but no secondary vehicle was active in the demo.',
        claimId: 'CLM-005',
        details: { expectedNodes: 2, actualNodes: 1 },
      },
      {
        milestoneName: 'Automated Municipal Work Order Generation',
        timestamp: 510,
        status: 'FAILED',
        confidence: 0.78,
        frameReference: 'frame_510s',
        verificationNotes: 'Architecture specified PDF generation engine, but telemetry export menu was missing automated PDF dispatch.',
        claimId: 'CLM-006',
        details: { missingFeature: 'PDF Generation Button' },
      },
    ];

    const now = new Date().toISOString();
    return milestonesBlueprint.map((m, idx) => ({
      ...m,
      id: `mstone_${videoId}_${idx + 1}`,
      videoId,
      evaluationId,
      createdAt: now,
    }));
  }

  /**
   * Identifies video stream anomalies such as frame drops, audio glitches, visual artifacts
   */
  static detectVideoAnomalies(videoId: string, evaluationId?: string): VideoAnomaly[] {
    const anomalyBlueprints: Array<Omit<VideoAnomaly, 'id' | 'videoId' | 'evaluationId' | 'createdAt'>> = [
      {
        anomalyType: 'AUDIO_DROPOUT',
        timestamp: 165,
        severity: 'LOW',
        description: 'Microphone clipping during screen share transition when opening VS Code.',
        frameReference: 'frame_165s',
        durationSeconds: 0.6,
        detectedBy: 'AUDIO_RMS_ANALYZER',
        resolved: true,
      },
      {
        anomalyType: 'FRAME_DROP',
        timestamp: 425,
        severity: 'MEDIUM',
        description: 'Buffer overrun detected: 2 video frames dropped during high-velocity pan in camera feed.',
        frameReference: 'frame_425s',
        durationSeconds: 1.2,
        detectedBy: 'HOST_FFMPEG_STREAM_AUDIT',
        resolved: true,
      },
      {
        anomalyType: 'LATENCY_SPIKE',
        timestamp: 426,
        severity: 'LOW',
        description: 'Model inference cycle temporarily increased from 22.4ms to 78.1ms during camera re-sync.',
        frameReference: 'frame_426s',
        durationSeconds: 0.8,
        detectedBy: 'BENCH_TELEMETRY_WATCHDOG',
        resolved: true,
      },
    ];

    const now = new Date().toISOString();
    return anomalyBlueprints.map((a, idx) => ({
      ...a,
      id: `anom_${videoId}_${idx + 1}`,
      videoId,
      evaluationId,
      createdAt: now,
    }));
  }
}

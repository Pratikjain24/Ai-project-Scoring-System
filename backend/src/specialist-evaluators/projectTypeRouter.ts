import type { ProjectClassification } from './types';

export class ProjectTypeRouter {
  /**
   * Classify project into SOFTWARE, HARDWARE, or HYBRID based on evidence AST,
   * documents, architecture metadata, and hardware components.
   */
  static classify(
    projectData: {
      name?: string;
      category?: string;
      architectureType?: string;
      problemStatement?: string;
      solutionDescription?: string;
    },
    evidence: any[] = [],
    documents: any[] = []
  ): ProjectClassification {
    const textBlob = [
      projectData.name || '',
      projectData.category || '',
      projectData.architectureType || '',
      projectData.problemStatement || '',
      projectData.solutionDescription || '',
      ...evidence.map(e => `${e.title || ''} ${e.description || ''} ${e.source || ''}`),
      ...documents.map(d => `${d.fileName || ''} ${d.documentType || ''}`)
    ].join(' ').toLowerCase();

    // Hardware signals
    const hasHardwareSignals =
      textBlob.includes('jetson') ||
      textBlob.includes('raspberry pi') ||
      textBlob.includes('sensor') ||
      textBlob.includes('microcontroller') ||
      textBlob.includes('arduino') ||
      textBlob.includes('pcb') ||
      textBlob.includes('schematic') ||
      textBlob.includes('lora') ||
      textBlob.includes('camera hardware') ||
      textBlob.includes('gpio') ||
      textBlob.includes('inverter') ||
      textBlob.includes('photovoltaic') ||
      textBlob.includes('actuator') ||
      projectData.architectureType?.toUpperCase() === 'HARDWARE';

    // Software signals
    const hasSoftwareSignals =
      textBlob.includes('react') ||
      textBlob.includes('typescript') ||
      textBlob.includes('python') ||
      textBlob.includes('rest api') ||
      textBlob.includes('neural') ||
      textBlob.includes('yolo') ||
      textBlob.includes('fastapi') ||
      textBlob.includes('express') ||
      textBlob.includes('ast') ||
      textBlob.includes('jwt') ||
      textBlob.includes('git') ||
      textBlob.includes('algorithm') ||
      projectData.architectureType?.toUpperCase() === 'SOFTWARE';

    if (hasHardwareSignals && hasSoftwareSignals) {
      return 'HYBRID';
    } else if (hasHardwareSignals) {
      return 'HARDWARE';
    } else {
      return 'SOFTWARE';
    }
  }
}

export interface TextGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  systemPrompt?: string;
}

export interface TranscriptionResult {
  transcript: string;
  segments: {
    startTimeMs: number;
    endTimeMs: number;
    text: string;
    confidence: number;
  }[];
  durationSeconds: number;
}

export interface VideoAnalysisResult {
  detectedFeatures: string[];
  demonstratedMilestones: {
    timestamp: string;
    description: string;
    status: 'PASS' | 'FAIL' | 'UNCERTAIN';
  }[];
  observedAnomalies: string[];
}

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
}

export interface AIProvider {
  name: string;
  generateText(prompt: string, options?: TextGenerationOptions): Promise<string>;
  analyzeImage(imageSource: string | Buffer, prompt: string): Promise<string>;
  analyzeVideo(videoSource: string, prompt: string): Promise<VideoAnalysisResult>;
  transcribeAudio(audioSource: string): Promise<TranscriptionResult>;
  generateEmbedding(text: string): Promise<number[]>;
  moderateContent(text: string): Promise<ModerationResult>;
  extractText?(documentSource: string | Buffer, mimeType: string): Promise<{ text: string; pages: { pageNumber: number; text: string; title?: string }[] }>;
  analyzeDocument?(documentSource: string | Buffer, mimeType: string, prompt: string): Promise<any>;
  generateStructuredOutput?<T>(prompt: string, schema?: any): Promise<T>;
}


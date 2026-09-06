export type ProjectCategory = 'software' | 'hardware' | 'hybrid' | 'biomedical';
export type EvaluationModeType = 'live_camera' | 'upload_video';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'deck' | 'doc' | 'screenshot';
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  errorMessage?: string;
}

export interface SubmissionDraft {
  // Step 1: Project Information
  projectName: string;
  projectType: ProjectCategory;
  problemStatement: string;
  projectDescription: string;
  teamName: string;
  leadName: string;
  institution: string;
  teamMembers: string;

  // Step 2: Evidence
  files: UploadedFileItem[];
  githubUrl: string;
  projectWebsite: string;
  researchPaperUrl: string;

  // Step 3: Evaluation Mode
  evaluationMode: EvaluationModeType;
  customInstructions?: string;

  // Metadata
  lastSaved?: string;
  step: number;
}

export const INITIAL_SUBMISSION_DRAFT: SubmissionDraft = {
  projectName: '',
  projectType: 'software',
  problemStatement: '',
  projectDescription: '',
  teamName: '',
  leadName: '',
  institution: '',
  teamMembers: '',
  files: [],
  githubUrl: '',
  projectWebsite: '',
  researchPaperUrl: '',
  evaluationMode: 'live_camera',
  customInstructions: '',
  step: 1,
};

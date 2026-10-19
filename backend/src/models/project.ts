export type ArchitectureType = 'SOFTWARE' | 'HARDWARE' | 'HYBRID' | 'BIOMEDICAL';

export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  email?: string;
  avatarUrl?: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  fileType: 'pdf' | 'ppt' | 'pptx' | 'doc' | 'docx' | 'png' | 'jpg' | 'mp4' | 'mov' | 'webm' | 'zip' | 'other';
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;
  uploadedAt: string;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  type: 'GITHUB' | 'WEBSITE' | 'RESEARCH_PAPER' | 'OTHER';
  url: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  architectureType: ArchitectureType;
  category: string;
  domain: string;
  tagline?: string;
  problemStatement: string;
  solutionDescription: string;
  teamName: string;
  teamMembers?: TeamMember[];
  files?: ProjectFile[];
  links?: ProjectLink[];
  createdAt: string;
  updatedAt: string;
}

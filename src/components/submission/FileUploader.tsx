import React, { useState, useRef } from 'react';
import { 
  FileText, 
  FileCode, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  GitBranch, 
  Globe, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Paperclip
} from 'lucide-react';
import type { SubmissionDraft, UploadedFileItem } from '../../types/submission';

interface FileUploaderProps {
  draft: SubmissionDraft;
  onChange: (fields: Partial<SubmissionDraft>) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  draft,
  onChange,
  onNext,
  onBack,
  errors,
}) => {
  const [dragActiveCategory, setDragActiveCategory] = useState<string | null>(null);
  const deckInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const simulateFileUpload = (file: File, category: 'deck' | 'doc' | 'screenshot') => {
    // Validate size (max 50MB for deck/doc, max 15MB for screenshots)
    const maxSize = category === 'screenshot' ? 15 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File "${file.name}" exceeds the maximum allowed size of ${category === 'screenshot' ? '15MB' : '50MB'}.`);
      return;
    }

    const newId = 'file_' + Math.random().toString(36).substring(2, 9);
    const newFileItem: UploadedFileItem = {
      id: newId,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      category,
      progress: 0,
      status: 'uploading',
    };

    // Add to state
    const currentFiles = [...draft.files, newFileItem];
    onChange({ files: currentFiles });

    // Simulate progressive chunk upload
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        onChange({
          files: currentFiles.map((f) =>
            f.id === newId ? { ...f, progress: 100, status: 'complete' } : f
          ),
        });
      } else {
        onChange({
          files: currentFiles.map((f) =>
            f.id === newId ? { ...f, progress: currentProgress } : f
          ),
        });
      }
    }, 200);
  };

  const handleFiles = (files: FileList | null, category: 'deck' | 'doc' | 'screenshot') => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((f) => simulateFileUpload(f, category));
  };

  const removeFile = (id: string) => {
    onChange({
      files: draft.files.filter((f) => f.id !== id),
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const deckFiles = draft.files.filter((f) => f.category === 'deck');
  const docFiles = draft.files.filter((f) => f.category === 'doc');
  const imageFiles = draft.files.filter((f) => f.category === 'screenshot');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP 02 // MULTIMODAL EVIDENCE INTAKE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Evidence & Technical Artifacts
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Provide raw presentations, schematics, prototypes, and repository links. ProjectX-Ray AI isolates claims from these files and verifies them in ephemeral sandboxes.
        </p>
      </div>

      {/* 3 Drag-and-Drop Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Zone 1: Presentation Slides (PPT / PDF) */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between font-semibold">
            <span>Pitch Deck / Slides</span>
            <span className="text-[10px] text-slate-400 font-mono">PDF, PPTX (max 50MB)</span>
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActiveCategory('deck'); }}
            onDragLeave={() => setDragActiveCategory(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveCategory(null);
              handleFiles(e.dataTransfer.files, 'deck');
            }}
            onClick={() => deckInputRef.current?.click()}
            className={`h-40 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActiveCategory === 'deck'
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={deckInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, 'deck')}
            />
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-200">Drop presentation slides</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click to browse or drag file</p>
          </div>

          {/* Uploaded deck list */}
          {deckFiles.map((file) => (
            <div
              key={file.id}
              className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate text-slate-200">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{formatFileSize(file.size)}</span>
                {file.status === 'uploading' ? (
                  <span className="text-cyan-400">{file.progress}%</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
              {file.status === 'uploading' && (
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-200"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zone 2: Documentation & Schematics */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between font-semibold">
            <span>Tech Specs & Schematics</span>
            <span className="text-[10px] text-slate-400 font-mono">PDF, ZIP, Gerbers</span>
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActiveCategory('doc'); }}
            onDragLeave={() => setDragActiveCategory(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveCategory(null);
              handleFiles(e.dataTransfer.files, 'doc');
            }}
            onClick={() => docInputRef.current?.click()}
            className={`h-40 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActiveCategory === 'doc'
                ? 'border-emerald-400 bg-emerald-950/20'
                : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.zip,.kicad_sch,.kicad_pcb,.md,.txt"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, 'doc')}
            />
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <FileCode className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-200">Drop documentation or CAD</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Gerbers, KiCAD, Architecture</p>
          </div>

          {/* Uploaded doc list */}
          {docFiles.map((file) => (
            <div
              key={file.id}
              className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate text-slate-200">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{formatFileSize(file.size)}</span>
                {file.status === 'uploading' ? (
                  <span className="text-emerald-400">{file.progress}%</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
              {file.status === 'uploading' && (
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-200"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zone 3: Hardware Screenshots & Prototype Photos */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between font-semibold">
            <span>Visual Evidence & Photos</span>
            <span className="text-[10px] text-slate-400 font-mono">PNG, JPG (max 15MB)</span>
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActiveCategory('screenshot'); }}
            onDragLeave={() => setDragActiveCategory(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveCategory(null);
              handleFiles(e.dataTransfer.files, 'screenshot');
            }}
            onClick={() => imageInputRef.current?.click()}
            className={`h-40 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActiveCategory === 'screenshot'
                ? 'border-violet-400 bg-violet-950/20'
                : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, 'screenshot')}
            />
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-200">Drop prototype captures</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Breadboards, UI, wave probes</p>
          </div>

          {/* Uploaded image list */}
          {imageFiles.map((file) => (
            <div
              key={file.id}
              className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <ImageIcon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="truncate text-slate-200">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{formatFileSize(file.size)}</span>
                {file.status === 'uploading' ? (
                  <span className="text-violet-400">{file.progress}%</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External Repository & Research URLs */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <Paperclip className="w-4 h-4 text-cyan-400" />
          <span>External Repositories & Verification Endpoints</span>
        </h3>

        <div className="space-y-4">
          {/* GitHub / GitLab URL */}
          <div className="space-y-1.5">
            <label htmlFor="githubUrl" className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                <span>GitHub / GitLab Repository URL <span className="text-cyan-400">*</span></span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">AST & commit forensics</span>
            </label>
            <input
              id="githubUrl"
              type="url"
              value={draft.githubUrl}
              onChange={(e) => onChange({ githubUrl: e.target.value })}
              placeholder="https://github.com/organization/project-core"
              className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none transition-all ${
                errors.githubUrl
                  ? 'border-rose-500 bg-rose-950/10'
                  : 'border-white/10 focus:border-cyan-400'
              }`}
            />
            {errors.githubUrl && (
              <p className="text-[11px] font-mono text-rose-400">{errors.githubUrl}</p>
            )}
          </div>

          {/* Live Website URL */}
          <div className="space-y-1.5">
            <label htmlFor="projectWebsite" className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Project / Production Website</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Automated uptime & latency check</span>
            </label>
            <input
              id="projectWebsite"
              type="url"
              value={draft.projectWebsite}
              onChange={(e) => onChange({ projectWebsite: e.target.value })}
              placeholder="https://aeropulse.org or https://demo.mysystem.app"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Research Paper / ArXiv URL */}
          <div className="space-y-1.5">
            <label htmlFor="researchPaperUrl" className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                <span>Optional Research Paper / ArXiv DOI / Patent URL</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Academic prior art verification</span>
            </label>
            <input
              id="researchPaperUrl"
              type="url"
              value={draft.researchPaperUrl}
              onChange={(e) => onChange({ researchPaperUrl: e.target.value })}
              placeholder="https://arxiv.org/abs/2403.01824 or DOI reference"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Info</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2 text-xs group"
        >
          <span>Continue to Jury Modality</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

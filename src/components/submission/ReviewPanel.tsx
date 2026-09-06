import React from 'react';
import { 
  CheckCircle2, 
  FileText, 
  GitBranch, 
  Globe, 
  BookOpen, 
  Camera, 
  Video, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Edit3,
  Award,
  Layers,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import type { SubmissionDraft } from '../../types/submission';

interface ReviewPanelProps {
  draft: SubmissionDraft;
  onBack: () => void;
  onEditStep: (step: number) => void;
  onStartEvaluation: () => void;
  isStarting: boolean;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  draft,
  onBack,
  onEditStep,
  onStartEvaluation,
  isStarting,
}) => {
  // Calculate simulated ingestion readiness score
  const hasDeck = draft.files.some((f) => f.category === 'deck');
  const hasDoc = draft.files.some((f) => f.category === 'doc');
  const hasImages = draft.files.some((f) => f.category === 'screenshot');
  const hasGithub = Boolean(draft.githubUrl);
  const hasWebsite = Boolean(draft.projectWebsite);
  const hasPaper = Boolean(draft.researchPaperUrl);

  let readiness = 60;
  if (hasGithub) readiness += 15;
  if (hasDeck) readiness += 10;
  if (hasDoc) readiness += 5;
  if (hasImages) readiness += 5;
  if (hasWebsite || hasPaper) readiness += 5;
  if (readiness > 100) readiness = 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>STEP 04 // PRE-FLIGHT VERIFICATION & LAUNCH</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Review Submission Dossier
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Review your project metadata, uploaded artifacts, and selected jury protocol. Once initiated, the autonomous AI jury begins sandboxed verification immediately.
        </p>
      </div>

      {/* Ingestion Readiness Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0B101D] to-emerald-950/30 border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              AI Jury Ingestion Readiness
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            Artifact Manifest Complete & Validated
          </h3>
          <p className="text-xs text-slate-300 max-w-md font-sans">
            High-density telemetry ready. All code repositories and presentation files will be audited with cryptographic citations.
          </p>
        </div>

        <div className="text-center sm:text-right shrink-0 p-4 rounded-xl bg-black/60 border border-white/10">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Readiness Index
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-gradient-emerald">
            {readiness}%
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
            {readiness >= 90 ? 'OPTIMAL DILIGENCE' : 'STANDARD INTAKE'}
          </span>
        </div>
      </div>

      {/* Summary Review Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Identity & Team */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Project Identity */}
          <div className="p-6 rounded-2xl bg-[#0B0F17] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Project Identity
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Project Name</span>
                <span className="text-base font-bold text-white font-display">{draft.projectName || 'Untitled Project'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Category</span>
                <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded text-[11px] font-mono uppercase font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {draft.projectType}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Problem Statement</span>
                <p className="text-slate-200 line-clamp-2 mt-0.5">{draft.problemStatement || 'No problem statement provided.'}</p>
              </div>

              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">Team & Affiliation</span>
                <p className="text-slate-200 mt-0.5">
                  <span className="font-semibold text-white">{draft.teamName}</span> • Lead: {draft.leadName}
                  {draft.institution && ` (${draft.institution})`}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Chosen Modality */}
          <div className="p-6 rounded-2xl bg-[#0B0F17] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                {draft.evaluationMode === 'live_camera' ? (
                  <Camera className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Video className="w-4 h-4 text-emerald-400" />
                )}
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Evaluation Modality
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-sm">
                  {draft.evaluationMode === 'live_camera'
                    ? 'Mode A: Live Camera Jury (Synchronous)'
                    : 'Mode B: Asynchronous Deep Video Jury'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  ACTIVE
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {draft.evaluationMode === 'live_camera'
                  ? 'Real-time WebRTC session with 60FPS computer vision analysis and adaptive interrogative questions.'
                  : 'Overnight synthetic multi-agent trial with micro-VM benchmark execution and prior art cross-matching.'}
              </p>
              {draft.customInstructions && (
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-slate-300 font-mono">
                  <span className="text-slate-400">Jury Focus:</span> {draft.customInstructions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Ingested Evidence Checklist */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0B0F17] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Attached Evidence & Manifest
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Repositories */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Verification Endpoints
              </span>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate text-slate-200">{draft.githubUrl || 'No GitHub URL provided'}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold shrink-0">READY</span>
              </div>

              {draft.projectWebsite && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate text-slate-200">{draft.projectWebsite}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold shrink-0">RESOLVED</span>
                </div>
              )}

              {draft.researchPaperUrl && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <BookOpen className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="truncate text-slate-200">{draft.researchPaperUrl}</span>
                  </div>
                  <span className="text-[10px] text-violet-400 font-semibold shrink-0">ARXIV</span>
                </div>
              )}
            </div>

            {/* Uploaded Files Count */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Ingested File Artifacts:</span>
                <span className="text-white font-bold">{draft.files.length} Files</span>
              </div>

              {draft.files.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No files attached yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {draft.files.map((f) => (
                    <div
                      key={f.id}
                      className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {f.category === 'deck' && <FileText className="w-3 h-3 text-cyan-400 shrink-0" />}
                        {f.category === 'doc' && <FileCode className="w-3 h-3 text-emerald-400 shrink-0" />}
                        {f.category === 'screenshot' && <ImageIcon className="w-3 h-3 text-violet-400 shrink-0" />}
                        <span className="truncate text-slate-300">{f.name}</span>
                      </div>
                      <span className="text-emerald-400 shrink-0 flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Ingested
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button Bar */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Modality</span>
        </button>

        <button
          type="button"
          onClick={onStartEvaluation}
          disabled={isStarting}
          className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 text-sm group disabled:opacity-70"
        >
          {isStarting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Spinning Up AI Jury Cluster...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-100" />
              <span>Initiate AI Jury Diligence</span>
              <Award className="w-4 h-4 text-cyan-100 group-hover:scale-110 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

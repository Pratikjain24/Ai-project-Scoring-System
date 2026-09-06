import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Share2, 
  Check, 
  Award, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import type { MasterDossierData, AudiencePreset } from '../../types/masterDossier';

interface ReportHeaderProps {
  dossier: MasterDossierData;
  activeTrack: 'hardware' | 'software';
  onSwitchTrack: (track: 'hardware' | 'software') => void;
  selectedAudience: AudiencePreset;
  onChangeAudience: (audience: AudiencePreset) => void;
  onBackToOverview?: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  dossier,
  activeTrack,
  onSwitchTrack,
  selectedAudience,
  onChangeAudience,
  onBackToOverview
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dossier.overallScore / 100) * circumference;

  const getVerdictStyle = (verdict: MasterDossierData['aiVerdict']) => {
    switch (verdict) {
      case 'Exceptional':
        return 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.35)]';
      case 'Strong':
        return 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)]';
      case 'Promising':
        return 'bg-blue-950/80 border-blue-400 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]';
      case 'Needs Improvement':
        return 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
      default:
        return 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.35)]';
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossier, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ProjectX-Ray_Intelligence_Report_${dossier.projectId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Bar & Quick Action Controls (Hidden when printing) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 print:hidden">
        
        {/* Left: Back + Dossier Branding */}
        <div className="flex items-center gap-3">
          {onBackToOverview && (
            <button
              onClick={onBackToOverview}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">
              ProjectX-Ray AI • Official Forensic Intelligence Report
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
              20 Sections
            </span>
          </div>
        </div>

        {/* Right: Track Switcher + Download / Print / Share */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Track Switcher */}
          <div className="p-1 rounded-xl bg-slate-900 border border-white/10 flex items-center text-xs font-mono">
            <button
              onClick={() => onSwitchTrack('hardware')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTrack === 'hardware'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware</span>
            </button>
            <button
              onClick={() => onSwitchTrack('software')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTrack === 'software'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Software</span>
            </button>
          </div>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs font-mono font-semibold text-cyan-300 transition-all flex items-center gap-1.5 shadow"
            title="Download complete 20-section JSON dossier"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Report</span>
              </>
            )}
          </button>

          {/* Print Action */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow"
            title="Print or export to PDF via browser print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Report</span>
          </button>

          {/* Share Action */}
          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow"
            title="Copy shareable link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-300" />
                <span>Share Report</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Audience Preset Switcher (University Jury, Hackathon, Incubator, Professional Review) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs font-mono print:hidden">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            Review Panel Lens:
          </span>
          <span className="text-slate-400 hidden lg:inline">
            Tailor evaluation presentation and focus
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['university', 'hackathon', 'incubator', 'enterprise'] as AudiencePreset[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeAudience(mode)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize font-semibold ${
                selectedAudience === mode
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {mode === 'university' && '🏛️ University Jury'}
              {mode === 'hackathon' && '⚡ Hackathon Showcase'}
              {mode === 'incubator' && '🚀 Incubator / Venture'}
              {mode === 'enterprise' && '🏢 Enterprise Review Panel'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Editorial Hero Banner (Matches User Spec Exactly) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#0E1626] to-[#0A101D] border border-cyan-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Metadata Col (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider">
                {dossier.projectType.toUpperCase()} CAPSTONE
              </span>
              <span className="text-xs font-mono text-slate-400">
                Evaluation Date: {new Date(dossier.evaluatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                • {dossier.evaluationEngineVersion}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                {dossier.projectName}
              </h1>
              <p className="text-sm text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
                {dossier.tagline}
              </p>
            </div>

            {/* Author, Institution, Percentile */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-white/10 text-xs font-mono text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Author / Team</span>
                <span className="text-white font-bold">{dossier.author}</span>
              </div>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Institution</span>
                <span className="text-cyan-300 font-bold">{dossier.institution}</span>
              </div>
              <div className="h-6 w-px bg-white/10 hidden sm:block" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Class Percentile</span>
                <span className="text-emerald-300 font-bold">{dossier.percentile}</span>
              </div>
            </div>

          </div>

          {/* Right Col: Overall Score HUD + Verdict + Confidence (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center relative overflow-hidden">
            
            {/* Radial Score HUD */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="9"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={dossier.overallScore >= 90 ? '#34d399' : '#22d3ee'}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-extrabold text-4xl text-white tracking-tighter">
                  {dossier.overallScore}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  OVERALL SCORE
                </span>
              </div>
            </div>

            {/* AI Verdict Level */}
            <div className="mt-3 w-full space-y-2">
              <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full border text-xs font-mono font-bold uppercase tracking-wider ${getVerdictStyle(dossier.aiVerdict)}`}>
                <Award className="w-3.5 h-3.5" />
                <span>Verdict: {dossier.aiVerdict}</span>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Empirical Confidence: <strong className="text-white">{dossier.confidenceScore}%</strong></span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

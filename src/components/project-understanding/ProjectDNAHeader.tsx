import React from 'react';
import { Dna, ArrowLeft, Download, ShieldCheck, Sparkles, Database } from 'lucide-react';
import type { ProjectSummary } from '../../types/projectUnderstanding';

interface ProjectDNAHeaderProps {
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  projectSummary: ProjectSummary;
  onBackToOverview: () => void;
  onExportJSON: () => void;
}

export const ProjectDNAHeader: React.FC<ProjectDNAHeaderProps> = ({
  selectedProjectId,
  onSelectProject,
  projectSummary,
  onBackToOverview,
  onExportJSON,
}) => {
  return (
    <div className="relative border-b border-white/10 bg-[#0A0D14]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-5">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-24 bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Breadcrumbs & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Return to Platform Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Dna className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold text-white tracking-tight">
                  Project DNA Dashboard
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-semibold uppercase tracking-wider">
                  Knowledge Graph v4.2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                <span>Multi-modal Knowledge Extraction & Traceability Enclave</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Zero Ambiguity Standard
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Project Switcher & Export */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Project Preset Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono text-slate-400 uppercase">Preset:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-transparent text-xs font-mono text-cyan-200 border-none outline-none cursor-pointer focus:ring-0"
            >
              <option value="aeropulse-px4" className="bg-[#0B0F17] text-white">
                AeroPulse PX-4 (Autonomous Drone)
              </option>
              <option value="quantumkey-tls" className="bg-[#0B0F17] text-white">
                QuantumKey TLS (Post-Quantum KEM)
              </option>
              <option value="neuralmesh-bci" className="bg-[#0B0F17] text-white">
                NeuralMesh BCI (Neuromorphic FPGA)
              </option>
            </select>
          </div>

          {/* Export JSON Button */}
          <button
            onClick={onExportJSON}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
            title="Download full JSON with raw evidence trace coordinates"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export DNA Manifest</span>
          </button>

          {/* Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{projectSummary.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

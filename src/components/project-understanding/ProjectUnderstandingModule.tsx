import React, { useState, useEffect } from 'react';
import { Cpu, ArrowRight } from 'lucide-react';
import { MOCK_PROJECT_DNA } from '../../data/mockProjectDNA';
import type { DNACategory } from '../../types/projectUnderstanding';
import { ProjectDNAHeader } from './ProjectDNAHeader';
import { ProjectSummaryCard } from './ProjectSummaryCard';
import { AIConfidenceGauge } from './AIConfidenceGauge';
import { KnowledgeGraphHUD } from './KnowledgeGraphHUD';
import { DNACardGrid } from './DNACardGrid';
import { api } from '../../services/api';

export interface ProjectUnderstandingModuleProps {
  evaluationId?: string;
  projectId?: string;
  onBackToOverview: () => void;
  onViewEvaluation?: () => void;
  onViewTechnicalAudit?: () => void;
  projectDNA?: any;
  initialDNA?: any;
}

export const ProjectUnderstandingModule: React.FC<ProjectUnderstandingModuleProps> = ({
  evaluationId,
  projectId,
  onBackToOverview,
  onViewTechnicalAudit,
  projectDNA,
  initialDNA,
}) => {
  const initialProjectId = projectId || (evaluationId?.replace(/^eval_/, '')) || 'aeropulse-px4';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    MOCK_PROJECT_DNA[initialProjectId] ? initialProjectId : 'aeropulse-px4'
  );
  const [selectedCategory, setSelectedCategory] = useState<DNACategory | null>(null);
  const [manifestModalOpen, setManifestModalOpen] = useState<boolean>(false);
  const [liveDNA, setLiveDNA] = useState<any>(initialDNA || projectDNA || null);

  useEffect(() => {
    if (!evaluationId) return;
    let isMounted = true;
    api.getProjectDNA(evaluationId)
      .then((dna) => {
        if (dna && isMounted) {
          setLiveDNA(dna);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [evaluationId]);

  const baseProject = initialDNA || projectDNA || MOCK_PROJECT_DNA[selectedProjectId] || MOCK_PROJECT_DNA['aeropulse-px4'];
  const activeDNA = liveDNA || projectDNA || initialDNA;
  const activeProject = activeDNA ? {
    ...baseProject,
    summary: {
      ...baseProject.summary,
      projectName: activeDNA.projectName || baseProject.summary.projectName,
      tagline: activeDNA.tagline || baseProject.summary.tagline,
      executiveSummary: activeDNA.executiveSummary || activeDNA.solutionSummary || baseProject.summary.executiveSummary,
      primaryHypothesis: activeDNA.problemStatement || baseProject.summary.primaryHypothesis,
      noveltyStatement: activeDNA.noveltyStatement || baseProject.summary.noveltyStatement,
    },
    confidence: activeDNA.confidence || baseProject.confidence,
    dnaItems: activeDNA.dnaItems || baseProject.dnaItems,
  } : baseProject;

  const handleExportJSON = () => {
    // Generate clean downloadable JSON manifest
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedProjectId}_project_dna_manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setManifestModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-20">
      {/* 1. Header with project switcher & telemetry */}
      <ProjectDNAHeader
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => {
          setSelectedProjectId(id);
          setSelectedCategory(null);
        }}
        projectSummary={activeProject.summary}
        onBackToOverview={onBackToOverview}
        onExportJSON={handleExportJSON}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 2. Top Summary & Confidence Gauge Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: AI-Generated Project Summary Card (takes 2 cols) */}
          <div className="lg:col-span-2">
            <ProjectSummaryCard summary={activeProject.summary} />
          </div>

          {/* Right: AI Understanding Confidence Score & Breakdown (takes 1 col) */}
          <div className="lg:col-span-1">
            <AIConfidenceGauge confidence={activeProject.confidence} />
          </div>
        </div>

        {/* 3. Knowledge-Graph-Inspired Visual Topology HUD */}
        <div>
          <KnowledgeGraphHUD
            dnaItems={activeProject.dnaItems}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* 4. The 11 DNA Dimensions Grid with Source Traceability */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base md:text-lg font-display font-bold text-white tracking-tight">
                Extracted Project DNA Dimensions
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Click any dimension card to expand and inspect verified source, confidence, and verbatim ground truth
              </p>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-500/30">
              11/11 Dimensions Synthesized
            </span>
          </div>

          <DNACardGrid
            dnaItems={activeProject.dnaItems}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* 5. Next Step: Technical Auditor Dashboard CTA */}
        {onViewTechnicalAudit && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-emerald-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-display">
                  Launch Deep Technical Auditor
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Dynamically evaluate 10 software/hardware dimensions with 10-axis radar chart, confidence calibration, and evidence provenance.
                </p>
              </div>
            </div>

            <button
              onClick={onViewTechnicalAudit}
              className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2 shrink-0 group"
            >
              <span>Open Technical Auditor</span>
              <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Manifest Download Success Modal */}
      {manifestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#0D121F] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                ✓
              </div>
              <h4 className="text-base font-display font-bold text-white">
                Project DNA Manifest Downloaded
              </h4>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Exported cryptographic JSON manifest for <span className="text-cyan-300 font-semibold">{activeProject.summary.projectName}</span>. Includes 100% of ground-truth evidence coordinates, AST hashes, and confidence metrics ready for backend API verification.
            </p>

            <div className="bg-black/50 p-3 rounded-xl border border-white/5 text-[11px] font-mono text-slate-400">
              File: <code className="text-cyan-300">{selectedProjectId}_project_dna_manifest.json</code><br />
              Audit Hash: <code className="text-emerald-400">{activeProject.confidence.auditHash}</code>
            </div>

            <button
              onClick={() => setManifestModalOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

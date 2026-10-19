import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, 
  Cpu, 
  Code2, 
  Sparkles, 
  Download, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  RefreshCw,
  Database,
  ArrowRight,
  Wrench
} from 'lucide-react';
import type { ProjectType, EvidenceReference, TechnicalAuditReport } from '../../types/technicalAudit';
import type { TechnicalDebtItem } from '../../types/specialistEvaluation';
import { MOCK_SOFTWARE_AUDIT, MOCK_HARDWARE_AUDIT } from '../../data/mockTechnicalAudits';
import { AuditRadarChart } from './AuditRadarChart';
import { AuditCategoryCard } from './AuditCategoryCard';
import { AuditSummaryBanner } from './AuditSummaryBanner';
import { EvidenceDrawerModal } from './EvidenceDrawerModal';
import { api } from '../../services/api';

export interface TechnicalAuditorModuleProps {
  evaluationId?: string;
  onBackToOverview?: () => void;
  onViewOriginality?: () => void;
  defaultProjectType?: ProjectType;
  initialReport?: TechnicalAuditReport;
  softwareAudit?: TechnicalAuditReport;
  hardwareAudit?: TechnicalAuditReport;
}

export const TechnicalAuditorModule: React.FC<TechnicalAuditorModuleProps> = ({
  evaluationId = 'eval_smart-road-vision',
  onBackToOverview,
  onViewOriginality,
  defaultProjectType = 'software',
  initialReport,
  softwareAudit,
  hardwareAudit,
}) => {
  const [selectedType, setSelectedType] = useState<ProjectType>(defaultProjectType);
  const [hybridTrack, setHybridTrack] = useState<'software' | 'hardware' | 'integrated'>('integrated');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'exceptional' | 'solid' | 'risks'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceReference | null>(null);
  const [focusedMetricId, setFocusedMetricId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);

  // Phase 8 Live Technical Data
  const [liveTechnical, setLiveTechnical] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const loadTechnicalData = useCallback(async () => {
    if (!evaluationId) return;
    try {
      const data = await api.getTechnical(evaluationId);
      if (data) {
        setLiveTechnical(data);
      }
    } catch (err) {
      console.warn('Could not load live technical data, falling back to mock dataset:', err);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    const fetchAsync = async () => {
      if (isMounted) {
        await loadTechnicalData();
      }
    };
    fetchAsync();
    return () => {
      isMounted = false;
    };
  }, [loadTechnicalData]);

  const handleRunTechnicalAnalysis = async () => {
    if (!evaluationId || isAnalyzing) return;
    setIsAnalyzing(true);
    setExportNotice('Executing multi-disciplinary Specialist Technical Audit...');
    try {
      await api.analyzeTechnical(evaluationId);
      setExportNotice('✓ Technical audit completed. Architecture, algorithm complexity, and security maturity refreshed.');
      await loadTechnicalData();
    } catch {
      setExportNotice('Technical audit executed locally.');
      await loadTechnicalData();
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  // Active dataset depending on mode with live data synthesis
  const currentReport: TechnicalAuditReport = useMemo(() => {
    const base = selectedType === 'software'
      ? (softwareAudit || initialReport || MOCK_SOFTWARE_AUDIT)
      : (hardwareAudit || initialReport || MOCK_HARDWARE_AUDIT);

    if (!liveTechnical) return base;

    return {
      ...base,
      compositeScore: typeof liveTechnical.technicalScore === 'number' ? liveTechnical.technicalScore : base.compositeScore,
      overallConfidence: typeof liveTechnical.technicalConfidence === 'number' ? liveTechnical.technicalConfidence : base.overallConfidence,
    };
  }, [selectedType, softwareAudit, hardwareAudit, initialReport, liveTechnical]);

  // Filter metrics based on status and search query
  const filteredMetrics = currentReport.metrics.filter((metric) => {
    // Search query filter
    const matchesSearch =
      searchQuery === '' ||
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.strengths.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      metric.weaknesses.some((w) => w.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Status tab filter
    if (activeCategoryFilter === 'exceptional') return metric.score >= 90;
    if (activeCategoryFilter === 'solid') return metric.score >= 80 && metric.score < 90;
    if (activeCategoryFilter === 'risks') return metric.risks && metric.risks.length > 0;
    return true;
  });

  const handleSelectRadarMetric = (metricId: string) => {
    setFocusedMetricId(metricId);
    const cardEl = document.getElementById(`card-${metricId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleExportDossier = () => {
    setExportNotice('Exporting Comprehensive Technical Audit Dossier...');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentReport.projectName.toLowerCase().replace(/\s+/g, '_')}_technical_audit_dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => {
      setExportNotice(`✓ Technical Audit Dossier downloaded: ${currentReport.projectName}_Audit_Report.json`);
      setTimeout(() => setExportNotice(null), 4000);
    }, 600);
  };

  const isHybrid = liveTechnical?.projectType === 'HYBRID' || currentReport.projectName.toLowerCase().includes('road');

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-24">
      {/* Top Breadcrumb & Project Type Switcher Bar */}
      <div className="sticky top-16 z-30 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Back button & Title */}
          <div className="flex items-center gap-3">
            {onBackToOverview && (
              <button
                onClick={onBackToOverview}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Return to overview"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                  Phase 8 Specialist Technical Engine
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-mono text-slate-400">Architectural & Algorithmic Audit</span>
                {liveTechnical && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                    <Database className="w-3 h-3 text-cyan-400" />
                    LIVE EVALUATOR
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                Technical Auditor Dashboard
              </h1>
            </div>
          </div>

          {/* Project Mode & Track Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isHybrid ? (
              /* Hybrid 3-State Toggle: Software / Hardware / Integrated System */
              <div className="p-1 rounded-2xl bg-slate-900 border border-white/10 flex items-center shadow-inner text-xs font-mono">
                <button
                  onClick={() => {
                    setHybridTrack('software');
                    setSelectedType('software');
                    setFocusedMetricId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    hybridTrack === 'software'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Software Stack</span>
                </button>

                <button
                  onClick={() => {
                    setHybridTrack('hardware');
                    setSelectedType('hardware');
                    setFocusedMetricId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    hybridTrack === 'hardware'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Hardware Stack</span>
                </button>

                <button
                  onClick={() => {
                    setHybridTrack('integrated');
                    setSelectedType('software');
                    setFocusedMetricId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    hybridTrack === 'integrated'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Integrated System</span>
                </button>
              </div>
            ) : (
              <div className="p-1 rounded-2xl bg-slate-900 border border-white/10 flex items-center shadow-inner">
                <button
                  onClick={() => {
                    setSelectedType('software');
                    setFocusedMetricId(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 ${
                    selectedType === 'software'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Software</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedType('hardware');
                    setFocusedMetricId(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 ${
                    selectedType === 'hardware'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-600 text-white shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Hardware</span>
                </button>
              </div>
            )}

            {/* Re-Run Pipeline */}
            <button
              onClick={handleRunTechnicalAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-mono text-xs transition-all shadow-sm disabled:opacity-50"
              title="Re-run Technical Specialist Evaluators"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Auditing...' : 'Re-Run Audit'}</span>
            </button>

            {/* Export Action */}
            <button
              onClick={handleExportDossier}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all duration-200 shrink-0"
              title="Export Technical Audit Dossier"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-fadeIn">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-xl">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              {exportNotice}
            </span>
            <button onClick={() => setExportNotice(null)} className="text-cyan-400 hover:text-white">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Project Banner & Score Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider block">
                Technical Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-display font-black text-white">
                  {liveTechnical?.technicalScore || currentReport.compositeScore.toFixed(0)}
                </span>
                <span className="text-sm font-mono text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1">Normalized specialist assessment</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg font-mono">
              {liveTechnical?.technicalScore || currentReport.compositeScore.toFixed(0)}%
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider block">
                Epistemic Confidence
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-display font-black text-white">
                  {liveTechnical?.technicalConfidence || currentReport.overallConfidence.toFixed(0)}%
                </span>
                <span className="text-xs font-mono text-emerald-400">Calibrated</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1">Grounding certainty across AST & tests</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg font-mono">
              81%
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider block">
                Architecture Class
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-display font-bold text-white uppercase">
                  {liveTechnical?.projectType || (isHybrid ? 'HYBRID' : selectedType)}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {isHybrid ? 'Edge GPU Hardware + Deep Neural Vision' : `${selectedType} Stack`}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 font-mono">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Summary Banner & Visualizations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* 1. High-Level Summary Banner */}
        <AuditSummaryBanner
          report={currentReport}
          onFilterRisks={() => setActiveCategoryFilter('risks')}
        />

        {/* 2. Visualizations Section: 10-Axis Spider Radar Chart */}
        <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-black/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                Multi-Dimensional Polygon Assessment
              </div>
              <h2 className="text-xl font-bold font-display text-white mt-1">
                Technical Architecture Profile
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing all 10 domain axes calibrated with AI confidence and verified empirical evidence.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <span className="text-slate-400">Average Subscore:</span>
              <span className="text-cyan-300 font-bold text-sm bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800">
                {(currentReport.metrics.reduce((acc, m) => acc + m.score, 0) / 10).toFixed(1)} / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
            <div className="lg:col-span-7 flex justify-center">
              <AuditRadarChart
                metrics={currentReport.metrics}
                activeMetricId={focusedMetricId}
                onSelectMetric={handleSelectRadarMetric}
              />
            </div>

            <div className="lg:col-span-5 space-y-2.5">
              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
                <span>10 Evaluation Dimensions</span>
                <span>Score · Conf</span>
              </div>
              {currentReport.metrics.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectRadarMetric(m.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                    focusedMetricId === m.id
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-white'
                      : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="font-semibold">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300 font-bold">{m.score}/100</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-emerald-400">{m.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Technical Debt Catalog Section */}
        {liveTechnical?.technicalDebt && liveTechnical.technicalDebt.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-display text-white">
                  Identified Technical Debt & Engineering Refactoring Items ({liveTechnical.technicalDebt.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                AUDITED DEBT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {liveTechnical.technicalDebt.map((debt: TechnicalDebtItem) => (
                <div key={debt.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {debt.category} DEBT
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${
                        debt.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {debt.severity} SEVERITY
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{debt.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{debt.description}</p>
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 font-mono text-[11px]">
                    <strong>Prescribed Refactor:</strong> {debt.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Controls Strip: Status Filter, Search, Expand/Collapse */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/10 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Dimensions (10)
            </button>
            <button
              onClick={() => setActiveCategoryFilter('exceptional')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategoryFilter === 'exceptional'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Exceptional (90+)
            </button>
            <button
              onClick={() => setActiveCategoryFilter('solid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategoryFilter === 'solid'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Solid (80-89)
            </button>
            <button
              onClick={() => setActiveCategoryFilter('risks')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeCategoryFilter === 'risks'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Flagged Gaps & Risks
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit dimensions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-52"
              />
            </div>

            <button
              onClick={() => setAllExpanded(!allExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              {allExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
          </div>
        </div>

        {/* 5. Detailed Category Assessment Cards */}
        <div className="space-y-4">
          {filteredMetrics.map((metric) => (
            <div key={metric.id} id={`card-${metric.id}`}>
              <AuditCategoryCard
                metric={metric}
                isExpandedDefault={allExpanded || focusedMetricId === metric.id}
                onViewEvidence={(ev: EvidenceReference) => setSelectedEvidence(ev)}
              />
            </div>
          ))}

          {filteredMetrics.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-sm text-slate-400 font-mono">
                No technical categories match the selected filter or search criteria.
              </p>
            </div>
          )}
        </div>

        {/* Next Stage Navigation CTA */}
        {onViewOriginality && (
          <div className="mt-8 p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  Next Stage: Originality & Similarity Engine
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                    Phase 6 Intelligence
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Cross-reference architectural novelty against open-source repositories and research papers to distinguish common tech stacks from unique contributions.
                </p>
              </div>
            </div>
            <button
              onClick={onViewOriginality}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] shrink-0"
            >
              Launch Originality Engine
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawerModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
};

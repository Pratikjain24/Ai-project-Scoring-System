import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Users, 
  DollarSign, 
  Leaf, 
  Wrench, 
  GitBranch, 
  Rocket, 
  Layers,
  Compass,
  RefreshCw,
  ShieldAlert,
  Database
} from 'lucide-react';
import type { ImpactPillarId } from '../../types/impactFeasibility';
import type { SpecialistEvaluationSummary } from '../../types/specialistEvaluation';
import { 
  MOCK_SOFTWARE_IMPACT_FEASIBILITY, 
  MOCK_HARDWARE_IMPACT_FEASIBILITY 
} from '../../data/mockImpactFeasibility';
import { ImpactScoreOverview } from './ImpactScoreOverview';
import { PillarRadarChart } from './PillarRadarChart';
import { PillarDetailCard } from './PillarDetailCard';
import { MaturityRoadmapTimeline } from './MaturityRoadmapTimeline';
import { RealWorldDeploymentBlueprint } from './RealWorldDeploymentBlueprint';
import { ImpactFeasibilityMatrix2x2 } from './ImpactFeasibilityMatrix2x2';
import { RiskMatrixAndRecommendations } from './RiskMatrixAndRecommendations';
import { api } from '../../services/api';

interface ImpactFeasibilityModuleProps {
  evaluationId?: string;
  onBackToOverview?: () => void;
  defaultProjectType?: 'software' | 'hardware';
}

export const ImpactFeasibilityModule: React.FC<ImpactFeasibilityModuleProps> = ({
  evaluationId = 'eval_smart-road-vision',
  onBackToOverview,
  defaultProjectType = 'software',
}) => {
  const [selectedTrack, setSelectedTrack] = useState<'software' | 'hardware'>(defaultProjectType);
  const [activeTab, setActiveTab] = useState<ImpactPillarId | 'all' | 'matrix' | 'risks' | 'roadmap' | 'blueprint'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allExpanded, setAllExpanded] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Phase 8 Live Specialist Data
  const [specialistSummary, setSpecialistSummary] = useState<SpecialistEvaluationSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const loadSpecialistData = useCallback(async () => {
    if (!evaluationId) return;
    setIsLoading(true);
    try {
      const summary = await api.getSpecialistSummary(evaluationId);
      if (summary) {
        setSpecialistSummary(summary);
      }
    } catch (err) {
      console.warn('Could not load specialist summary, falling back to mock dataset:', err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    loadSpecialistData();
  }, [loadSpecialistData]);

  const handleRunAnalysis = async () => {
    if (!evaluationId || isAnalyzing) return;
    setIsAnalyzing(true);
    setExportNotice('Executing Specialist Impact & Feasibility Intelligence Engine...');
    try {
      await Promise.all([
        api.analyzeImpact(evaluationId),
        api.analyzeFeasibility(evaluationId),
      ]);
      setExportNotice('✓ Specialist evaluation completed. Strategic matrix, TRL roadmap, and risks updated.');
      await loadSpecialistData();
    } catch {
      setExportNotice('Analysis pipeline completed with local fallback.');
      await loadSpecialistData();
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const report = selectedTrack === 'software' 
    ? MOCK_SOFTWARE_IMPACT_FEASIBILITY 
    : MOCK_HARDWARE_IMPACT_FEASIBILITY;

  const handleExportReport = () => {
    setExportNotice(`Exporting Comprehensive Impact & Feasibility Dossier (${report.projectName})...`);
    setTimeout(() => {
      setExportNotice(`✓ Impact & Feasibility Dossier downloaded: ${report.projectName}_Viability_Audit.pdf`);
      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  const navTabs: Array<{
    id: ImpactPillarId | 'all' | 'matrix' | 'risks' | 'roadmap' | 'blueprint';
    label: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    { id: 'all', label: 'Complete Matrix', icon: Layers },
    { id: 'matrix', label: 'Strategic 2×2 Matrix', icon: Compass },
    { id: 'risks', label: 'Risks & Recommendations', icon: ShieldAlert, badge: `${specialistSummary?.risks?.length || 5}` },
    { id: 'social', label: 'Social Impact', icon: Users, badge: `${specialistSummary?.impactScore || report.pillars.social.pillarScore}` },
    { id: 'economic', label: 'Economic Impact', icon: DollarSign, badge: `${report.pillars.economic.pillarScore}` },
    { id: 'environmental', label: 'Environmental', icon: Leaf, badge: `${report.pillars.environmental.pillarScore}` },
    { id: 'feasibility', label: 'Feasibility & TRL', icon: Wrench, badge: `${specialistSummary?.feasibilityScore || report.pillars.feasibility.pillarScore}` },
    { id: 'roadmap', label: 'Maturity Roadmap', icon: GitBranch, badge: specialistSummary?.maturity?.overallStage || report.roadmap[0].trlLevel },
    { id: 'blueprint', label: 'Real-World Blueprint', icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-28">
      {/* Top Sticky Bar */}
      <div className="sticky top-16 z-30 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                  Phase 8 Specialist Engine v4.2
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-mono text-slate-400">Impact & Feasibility Intelligence</span>
                {specialistSummary && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                    <Database className="w-3 h-3 text-cyan-400" />
                    LIVE ENGINE
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                Impact & Feasibility Evaluation Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
            <span>Project: <strong className="text-white">{report.projectName}</strong></span>
            <span>·</span>
            <span className="text-cyan-400 font-bold">
              Impact: {specialistSummary?.impactScore || 81}/100
            </span>
            <span>·</span>
            <span className="text-emerald-400 font-bold">
              Feasibility: {specialistSummary?.feasibilityScore || 78}/100
            </span>
            {isLoading && (
              <span className="text-cyan-400 font-mono text-[10px] animate-pulse">
                Syncing Engine...
              </span>
            )}
            <span>·</span>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow-cyan-900/40 disabled:opacity-50"
              title="Run multi-dimensional specialist evaluation across impact and deployment domains"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Evaluating...' : 'Re-Run Specialists'}</span>
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* 1. Header Scorecard & Metrics Strip */}
        <ImpactScoreOverview
          report={report}
          selectedTrack={selectedTrack}
          onTrackChange={setSelectedTrack}
          activePillarFilter={activeTab as any}
          onPillarSelect={(pillar) => setActiveTab(pillar)}
          onExportReport={handleExportReport}
        />

        {/* 2. Impact vs Feasibility 2x2 Strategic Matrix */}
        {(activeTab === 'all' || activeTab === 'matrix') && (
          <ImpactFeasibilityMatrix2x2
            projectName={report.projectName}
            impactScore={specialistSummary?.impactScore || 81}
            feasibilityScore={specialistSummary?.feasibilityScore || 78}
            quadrant={specialistSummary?.impactFeasibilityQuadrant || 'HIGH_IMPACT_HIGH_FEASIBILITY'}
          />
        )}

        {/* 3. Polar Radar Chart vs Industry Benchmarks */}
        {(activeTab === 'all' || activeTab === 'feasibility') && (
          <PillarRadarChart report={report} />
        )}

        {/* 4. Sub-Navigation Tabs & Search Controls */}
        <div className="p-2 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 backdrop-blur-md">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search & Expand Controls */}
          <div className="flex items-center gap-2.5 shrink-0 px-2 lg:px-0">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search metrics & evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-full sm:w-56"
              />
            </div>

            <button
              onClick={() => setAllExpanded(!allExpanded)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors shrink-0"
            >
              {allExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{allExpanded ? 'Collapse' : 'Expand'}</span>
            </button>
          </div>
        </div>

        {/* 5. Section Renderers */}

        {/* RISK MATRIX & RECOMMENDATION CENTER SECTION */}
        {(activeTab === 'all' || activeTab === 'risks') && specialistSummary && (
          <RiskMatrixAndRecommendations
            risks={specialistSummary.risks}
            evidenceGaps={specialistSummary.evidenceGaps}
            recommendations={specialistSummary.recommendations}
            costKnown={specialistSummary.costKnown}
            costEstimated={specialistSummary.costEstimated}
            costUnknown={specialistSummary.costUnknown}
            whyStrong={specialistSummary.whyStrong}
            whyWeak={specialistSummary.whyWeak}
            whatMustFix={specialistSummary.whatMustFix}
            whatMakesExceptional={specialistSummary.whatMakesExceptional}
          />
        )}

        {/* SOCIAL IMPACT SECTION */}
        {(activeTab === 'all' || activeTab === 'social') && (
          <PillarDetailCard
            pillarTitle="Social Impact Matrix"
            pillarColor="#06b6d4"
            pillarBorderColor="border-cyan-500/40"
            pillarBgColor="bg-cyan-950/20"
            subMetrics={[
              report.pillars.social.peopleAffected,
              report.pillars.social.problemSeverity,
              report.pillars.social.accessibility,
              report.pillars.social.publicBenefit,
            ]}
            searchQuery={searchQuery}
            allExpanded={allExpanded}
          />
        )}

        {/* ECONOMIC IMPACT SECTION */}
        {(activeTab === 'all' || activeTab === 'economic') && (
          <PillarDetailCard
            pillarTitle="Economic Impact & Commercialization"
            pillarColor="#10b981"
            pillarBorderColor="border-emerald-500/40"
            pillarBgColor="bg-emerald-950/20"
            subMetrics={[
              report.pillars.economic.costSavings,
              report.pillars.economic.affordability,
              report.pillars.economic.marketRelevance,
              report.pillars.economic.commercializationPotential,
            ]}
            searchQuery={searchQuery}
            allExpanded={allExpanded}
          />
        )}

        {/* ENVIRONMENTAL IMPACT SECTION */}
        {(activeTab === 'all' || activeTab === 'environmental') && (
          <PillarDetailCard
            pillarTitle="Environmental Impact & Sustainability"
            pillarColor="#34d399"
            pillarBorderColor="border-teal-500/40"
            pillarBgColor="bg-teal-950/20"
            subMetrics={[
              report.pillars.environmental.energyUsage,
              report.pillars.environmental.materialUsage,
              report.pillars.environmental.emissionsImplications,
              report.pillars.environmental.sustainability,
            ]}
            searchQuery={searchQuery}
            allExpanded={allExpanded}
          />
        )}

        {/* FEASIBILITY SECTION */}
        {(activeTab === 'all' || activeTab === 'feasibility') && (
          <PillarDetailCard
            pillarTitle="Technical Feasibility & Readiness (TRL)"
            pillarColor="#a855f7"
            pillarBorderColor="border-purple-500/40"
            pillarBgColor="bg-purple-950/20"
            subMetrics={[
              report.pillars.feasibility.prototypeReadiness,
              report.pillars.feasibility.deploymentComplexity,
              report.pillars.feasibility.infrastructureRequirements,
              report.pillars.feasibility.maintenance,
              report.pillars.feasibility.scalability,
              report.pillars.feasibility.estimatedCost,
            ]}
            searchQuery={searchQuery}
            allExpanded={allExpanded}
          />
        )}

        {/* MATURITY ROADMAP SECTION */}
        {(activeTab === 'all' || activeTab === 'roadmap') && (
          <MaturityRoadmapTimeline stages={report.roadmap} />
        )}

        {/* REAL-WORLD DEPLOYMENT BLUEPRINT SECTION */}
        {(activeTab === 'all' || activeTab === 'blueprint') && (
          <RealWorldDeploymentBlueprint blueprint={report.realWorldDeployment} />
        )}
      </div>
    </div>
  );
};

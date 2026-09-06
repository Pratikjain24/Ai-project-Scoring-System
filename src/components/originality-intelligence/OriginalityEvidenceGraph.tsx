import React, { useState } from 'react';
import { 
  GitBranch, 
  BookOpen, 
  FileText, 
  Package, 
  Rocket, 
  Globe, 
  Video, 
  GraduationCap, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import type { OriginalityReport, PriorArtSourceCategory } from '../../types/originalityIntelligence';

interface OriginalityEvidenceGraphProps {
  report: OriginalityReport;
  selectedCategory: PriorArtSourceCategory | 'all';
  onSelectCategory: (category: PriorArtSourceCategory | 'all') => void;
  onSelectPriorArtItem?: (itemId: string) => void;
}

export const OriginalityEvidenceGraph: React.FC<OriginalityEvidenceGraphProps> = ({
  report,
  selectedCategory,
  onSelectCategory,
  onSelectPriorArtItem,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<PriorArtSourceCategory | null>(null);

  const categories: { key: PriorArtSourceCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'github', label: 'GitHub Similarity', icon: <GitBranch className="w-4 h-4 text-cyan-400" /> },
    { key: 'research-papers', label: 'Research Papers Similarity', icon: <BookOpen className="w-4 h-4 text-indigo-400" /> },
    { key: 'patents', label: 'Patents Similarity', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
    { key: 'products', label: 'Products Similarity', icon: <Package className="w-4 h-4 text-blue-400" /> },
    { key: 'startups', label: 'Startups Similarity', icon: <Rocket className="w-4 h-4 text-amber-400" /> },
    { key: 'websites', label: 'Websites Similarity', icon: <Globe className="w-4 h-4 text-teal-400" /> },
    { key: 'youtube', label: 'YouTube Similarity', icon: <Video className="w-4 h-4 text-rose-400" /> },
    { key: 'academic-projects', label: 'Academic Projects Similarity', icon: <GraduationCap className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-black/40">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Multi-Source Knowledge Graph</span>
          </div>
          <h3 className="text-xl font-bold font-display text-white mt-1">
            Prior Art Evidence Tree Graph
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any branch node to filter discovered prior art by source category.
          </p>
        </div>

        {/* Graph Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Show All 8 Branches
          </button>
        </div>
      </div>

      {/* The Evidence Tree Graph Container */}
      <div className="mt-8 relative overflow-x-auto pb-4">
        <div className="min-w-[760px] flex flex-col md:flex-row items-start gap-8">
          {/* ROOT NODE: Current Project */}
          <div className="w-full md:w-64 shrink-0 p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/50 shadow-xl shadow-cyan-950/40 relative group">
            <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-cyan-500 text-black shadow-md">
              Evaluated Root
            </div>

            <div className="flex items-center gap-3 mt-1 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-mono text-cyan-300 font-semibold">Current Project</div>
                <div className="text-sm font-bold text-white font-display truncate max-w-[140px]" title={report.projectName}>
                  {report.projectName}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-300 border-t border-white/10 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Originality:</span>
                <span className="text-emerald-400 font-bold">{report.originalityScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Aggregate Similarity:</span>
                <span className="text-cyan-400 font-bold">{report.similarityScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="text-indigo-400 font-bold">{report.confidenceScore}%</span>
              </div>
            </div>
          </div>

          {/* TREE BRANCHES: 8 Sources Connected via Visual Connectors */}
          <div className="flex-1 w-full space-y-3 relative pl-6 border-l-2 border-dashed border-cyan-500/30">
            {categories.map((cat) => {
              const stats = report.categoryStats[cat.key];
              const isSelected = selectedCategory === cat.key;
              const isHovered = hoveredCategory === cat.key;
              const matchingItems = report.priorArtItems.filter((i) => i.sourceCategory === cat.key);

              return (
                <div
                  key={cat.key}
                  onMouseEnter={() => setHoveredCategory(cat.key)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="relative group"
                >
                  {/* Branch Horizontal Connector Line */}
                  <div 
                    className={`absolute -left-6 top-6 w-6 h-0.5 transition-colors duration-200 ${
                      isSelected || isHovered ? 'bg-cyan-400' : 'bg-white/20'
                    }`} 
                  />

                  {/* Branch Category Card */}
                  <div
                    onClick={() => onSelectCategory(isSelected ? 'all' : cat.key)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                        : isHovered
                        ? 'bg-white/[0.05] border-cyan-500/40'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Category icon & label */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {cat.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono text-white">
                              {cat.label}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/5 border border-white/10 text-slate-300">
                              {stats?.itemCount || 0} discovered
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Top: {stats?.topMatches?.slice(0, 2).join(' · ') || 'None'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Similarity meter & pills */}
                      <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase">Avg Similarity</div>
                          <span className="text-cyan-300 font-bold text-sm">
                            {stats?.averageSimilarity?.toFixed(1) || 0}%
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase">Max Peak</div>
                          <span className="text-white font-bold text-sm">
                            {stats?.maxSimilarity?.toFixed(1) || 0}%
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-cyan-400 transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                      </div>
                    </div>

                    {/* Sub-leaf items if expanded or selected */}
                    {matchingItems.length > 0 && (isSelected || isHovered) && (
                      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn">
                        {matchingItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPriorArtItem?.(item.id);
                            }}
                            className="p-2 rounded-xl bg-black/40 hover:bg-cyan-950/50 border border-white/5 hover:border-cyan-500/30 text-xs flex items-center justify-between gap-2 transition-colors"
                          >
                            <span className="text-slate-200 truncate font-mono text-[11px]">
                              {item.title}
                            </span>
                            <span className="shrink-0 font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {item.similarityPercentage}% sim
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Graph Footer Note */}
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>8 Active Crawl Channels · 100% Cryptographically Hashed Provenance</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <span>Click any category to filter prior art cards below</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

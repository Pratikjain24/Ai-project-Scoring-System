import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  ShieldCheck, 
  GitBranch, 
  BookOpen, 
  FileText, 
  Package, 
  Rocket, 
  Globe, 
  Video, 
  GraduationCap,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import type { PriorArtItem, PriorArtSourceCategory } from '../../types/originalityIntelligence';

interface PriorArtItemCardProps {
  item: PriorArtItem;
  isExpandedDefault?: boolean;
  isHighlighted?: boolean;
}

const getCategoryIcon = (category: PriorArtSourceCategory) => {
  switch (category) {
    case 'github': return <GitBranch className="w-4 h-4 text-cyan-400" />;
    case 'research-papers': return <BookOpen className="w-4 h-4 text-indigo-400" />;
    case 'patents': return <FileText className="w-4 h-4 text-emerald-400" />;
    case 'products': return <Package className="w-4 h-4 text-blue-400" />;
    case 'startups': return <Rocket className="w-4 h-4 text-amber-400" />;
    case 'websites': return <Globe className="w-4 h-4 text-teal-400" />;
    case 'youtube': return <Video className="w-4 h-4 text-rose-400" />;
    case 'academic-projects': return <GraduationCap className="w-4 h-4 text-purple-400" />;
  }
};

const getTierBadge = (tier: PriorArtItem['label']) => {
  const norm = tier.toLowerCase().replace(/\s+/g, '-');
  if (norm === 'original') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Original Synthesis
      </span>
    );
  }
  if (norm === 'inspired') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        Inspired Lineage
      </span>
    );
  }
  if (norm === 'moderately-similar') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Moderately Similar
      </span>
    );
  }
  if (norm === 'highly-similar') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-orange-500/10 border border-orange-500/30 text-orange-300 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        Highly Similar Pattern
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
      Potential Replication Flag
    </span>
  );
};

const getParityBadge = (parity: PriorArtItem['matchingComponents'][0]['parityLevel']) => {
  switch (parity) {
    case 'exact-match':
      return <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono uppercase font-semibold bg-rose-950/60 text-rose-300 border border-rose-800">Exact Spec</span>;
    case 'algorithmic':
      return <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono uppercase font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">Algorithmic Math</span>;
    case 'structural':
      return <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono uppercase font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800">Structural Topo</span>;
    case 'conceptual':
      return <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono uppercase font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800">Conceptual</span>;
  }
};

export const PriorArtItemCard: React.FC<PriorArtItemCardProps> = ({
  item,
  isExpandedDefault = false,
  isHighlighted = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);
  const [copied, setCopied] = useState(false);

  const handleCopyExcerpt = () => {
    navigator.clipboard.writeText(item.verbatimExcerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`prior-art-${item.id}`}
      className={`rounded-2xl transition-all duration-300 bg-slate-900/60 backdrop-blur-md border ${
        isHighlighted
          ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
          : 'border-white/10 hover:border-white/20 shadow-xl shadow-black/40'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-200">
              {getCategoryIcon(item.sourceCategory)}
              <span className="capitalize">{item.sourceCategory.replace('-', ' ')}</span>
            </div>
            {getTierBadge(item.label)}
            <span className="text-xs font-mono text-slate-400">
              Released {item.releaseDate}
            </span>
          </div>

          {/* Scores Strip: Similarity + Confidence */}
          <div className="flex items-center gap-3 shrink-0 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5">
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400">Similarity</div>
              <span className="text-base font-bold font-mono text-cyan-300">
                {item.similarityPercentage}%
              </span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-mono text-slate-400">Confidence</div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-bold font-mono text-emerald-300">
                  {item.confidenceScore}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Title and Entity */}
        <div className="mt-3">
          <h4 className="text-base font-bold text-white font-display tracking-tight flex items-center gap-2">
            <span>{item.title}</span>
            <span className="text-xs font-mono text-slate-500 font-normal">
              · {item.entityOrAuthors}
            </span>
          </h4>
          <div className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>Source Ref:</span>
            <code className="text-cyan-300/90">{item.sourceUrl}</code>
            <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
          </div>
        </div>

        {/* Matching Components / Features */}
        <div className="mt-4">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Matching Components & Sub-Architectures ({item.matchingComponents.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {item.matchingComponents.map((comp, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-1 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200 font-mono text-[11.5px]">
                    {comp.name}
                  </span>
                  {getParityBadge(comp.parityLevel)}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {comp.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Expand / Collapse Accordion for Similarity Explanation & Differentiation */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>{isExpanded ? 'Hide Similarity Analysis' : 'Expand Similarity & Differentiation Analysis'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            Audit ID: {item.id}
          </span>
        </div>
      </div>

      {/* Expanded Deep Dive Panel */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-cyan-500/20 bg-cyan-950/20 rounded-b-2xl space-y-4 animate-fadeIn">
          {/* 1. Technical Similarity Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30">
            <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1">
              Technical Similarity Explanation
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {item.similarityExplanation}
            </p>
          </div>

          {/* 2. Evaluated Project Differentiation */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider mb-1">
              Novelty & Technical Differentiation Factor
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-sans">
              {item.differentiationSummary}
            </p>
          </div>

          {/* 3. Verbatim Excerpt / Citation */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              <span>Ground Truth Prior Art Citation / Excerpt</span>
              <button
                onClick={handleCopyExcerpt}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {item.verbatimExcerpt}
            </pre>
            <div className="mt-1.5 text-[10.5px] font-mono text-slate-500">
              Provenance Citation: {item.provenanceRef}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

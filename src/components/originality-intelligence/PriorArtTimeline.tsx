import React from 'react';
import { Calendar, GitBranch, BookOpen, FileText, Package, Rocket, Globe, Video, GraduationCap, ChevronRight } from 'lucide-react';
import type { PriorArtItem, PriorArtSourceCategory } from '../../types/originalityIntelligence';

interface PriorArtTimelineProps {
  items: PriorArtItem[];
  onSelectItem?: (itemId: string) => void;
}

const getCategoryIcon = (category: PriorArtSourceCategory) => {
  switch (category) {
    case 'github': return <GitBranch className="w-3.5 h-3.5 text-cyan-400" />;
    case 'research-papers': return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
    case 'patents': return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
    case 'products': return <Package className="w-3.5 h-3.5 text-blue-400" />;
    case 'startups': return <Rocket className="w-3.5 h-3.5 text-amber-400" />;
    case 'websites': return <Globe className="w-3.5 h-3.5 text-teal-400" />;
    case 'youtube': return <Video className="w-3.5 h-3.5 text-rose-400" />;
    case 'academic-projects': return <GraduationCap className="w-3.5 h-3.5 text-purple-400" />;
    default: return <GitBranch className="w-3.5 h-3.5 text-cyan-400" />;
  }
};

const getLabelBadge = (label: PriorArtItem['label']) => {
  const norm = label.toLowerCase().replace(/\s+/g, '-');
  if (norm === 'original') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">Original</span>;
  }
  if (norm === 'inspired') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">Inspired</span>;
  }
  if (norm === 'moderately-similar') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">Moderately Similar</span>;
  }
  if (norm === 'highly-similar') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-300 border border-orange-500/30">Highly Similar</span>;
  }
  return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">Potential Replication</span>;
};

export const PriorArtTimeline: React.FC<PriorArtTimelineProps> = ({
  items,
  onSelectItem,
}) => {
  // Sort items chronologically by releaseDate ascending
  const sortedItems = [...items].sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-black/40 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chronological Prior Art Horizon</span>
          </div>
          <h3 className="text-xl font-bold font-display text-white mt-1">
            Evolution Timeline of Discovered Prior Work (2021 – 2026)
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing {sortedItems.length} milestone prior art discoveries
        </div>
      </div>

      {/* Timeline Track */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-emerald-500">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem?.(item.id)}
            className="relative group cursor-pointer"
          >
            {/* Timeline Node Point */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#07090E] group-hover:scale-125 transition-transform" />

            {/* Timeline Card Content */}
            <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-cyan-500/40 transition-all duration-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {item.releaseDate}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                    {getCategoryIcon(item.sourceCategory)}
                    <span className="capitalize">{item.sourceCategory.replace('-', ' ')}</span>
                  </div>
                  {getLabelBadge(item.label)}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>Similarity: <strong className="text-cyan-300">{item.similarityPercentage}%</strong></span>
                  <span>·</span>
                  <span>Confidence: <strong className="text-emerald-300">{item.confidenceScore}%</strong></span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors font-display">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                By {item.entityOrAuthors}
              </p>

              <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {item.similarityExplanation}
              </p>

              {/* Matching components preview */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Matches:</span>
                  {item.matchingComponents.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-black/40 text-[10.5px] font-mono text-slate-300 border border-white/5"
                    >
                      {comp.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

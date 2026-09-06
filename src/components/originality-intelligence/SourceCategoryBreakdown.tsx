import React from 'react';
import { 
  GitBranch, 
  BookOpen, 
  FileText, 
  Package, 
  Rocket, 
  Globe, 
  Video, 
  GraduationCap, 
  ArrowUpRight 
} from 'lucide-react';
import type { OriginalityReport, PriorArtSourceCategory } from '../../types/originalityIntelligence';

interface SourceCategoryBreakdownProps {
  report: OriginalityReport;
  selectedCategory: PriorArtSourceCategory | 'all';
  onSelectCategory: (category: PriorArtSourceCategory | 'all') => void;
}

export const SourceCategoryBreakdown: React.FC<SourceCategoryBreakdownProps> = ({
  report,
  selectedCategory,
  onSelectCategory,
}) => {
  const categoryCards: { key: PriorArtSourceCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'github', label: 'GitHub', icon: <GitBranch className="w-4 h-4 text-cyan-400" />, desc: 'Open-source codebases, algorithmic repos, and forks' },
    { key: 'research-papers', label: 'Research Papers', icon: <BookOpen className="w-4 h-4 text-indigo-400" />, desc: 'Peer-reviewed arXiv, IEEE, ACM & Springer papers' },
    { key: 'patents', label: 'Patents', icon: <FileText className="w-4 h-4 text-emerald-400" />, desc: 'USPTO, EPO & WIPO intellectual property filings' },
    { key: 'products', label: 'Products', icon: <Package className="w-4 h-4 text-blue-400" />, desc: 'Commercial enterprise products & SaaS offerings' },
    { key: 'startups', label: 'Startups', icon: <Rocket className="w-4 h-4 text-amber-400" />, desc: 'Emerging tech ventures & venture-backed products' },
    { key: 'websites', label: 'Websites', icon: <Globe className="w-4 h-4 text-teal-400" />, desc: 'Developer docs, official specs, and engineering blogs' },
    { key: 'youtube', label: 'YouTube', icon: <Video className="w-4 h-4 text-rose-400" />, desc: 'Keynotes, developer talks, and demo walk-throughs' },
    { key: 'academic-projects', label: 'Academic Projects', icon: <GraduationCap className="w-4 h-4 text-purple-400" />, desc: 'Master theses, dissertations, and university labs' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-display text-white">
            8-Channel Intelligence Spectrum
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Granular similarity distributions across all evaluated public domains
          </p>
        </div>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
          >
            Clear Filter (Showing {selectedCategory})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {categoryCards.map((cat) => {
          const stats = report.categoryStats[cat.key];
          const isSelected = selectedCategory === cat.key;

          return (
            <div
              key={cat.key}
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.key)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-bold font-mono text-white">
                    {cat.label}
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-1 mb-3">
                {cat.desc}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Avg Sim</div>
                  <span className="text-cyan-300 font-bold">
                    {stats?.averageSimilarity?.toFixed(1) || 0}%
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Discovered</div>
                  <span className="text-white font-bold">
                    {stats?.itemCount || 0} items
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

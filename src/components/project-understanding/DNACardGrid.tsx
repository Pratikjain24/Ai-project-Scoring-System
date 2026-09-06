import React, { useState } from 'react';
import { Search, SlidersHorizontal, CheckCircle2, Layers } from 'lucide-react';
import type { DNACategory, DNAItem } from '../../types/projectUnderstanding';
import { DNACardItem } from './DNACardItem';

interface DNACardGridProps {
  dnaItems: Record<DNACategory, DNAItem>;
  selectedCategory: DNACategory | null;
  onSelectCategory: (category: DNACategory | null) => void;
}

// Ordered list of all 11 required dimensions
const ORDERED_CATEGORIES: { key: DNACategory; label: string }[] = [
  { key: 'problem', label: '1. Problem' },
  { key: 'solution', label: '2. Proposed Solution' },
  { key: 'domain', label: '3. Domain' },
  { key: 'projectType', label: '4. Project Type' },
  { key: 'targetUsers', label: '5. Target Users' },
  { key: 'technologies', label: '6. Technologies' },
  { key: 'inputs', label: '7. Inputs' },
  { key: 'outputs', label: '8. Outputs' },
  { key: 'keyFeatures', label: '9. Key Features' },
  { key: 'architectureSummary', label: '10. Architecture Summary' },
  { key: 'claimedBenefits', label: '11. Claimed Benefits' },
];

export const DNACardGrid: React.FC<DNACardGridProps> = ({
  dnaItems,
  selectedCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Filter items based on active category, search text, and source type
  const filteredCategories = ORDERED_CATEGORIES.filter(({ key }) => {
    const item = dnaItems[key];
    if (!item) return false;

    // Category filter
    if (selectedCategory && selectedCategory !== key) {
      return false;
    }

    // Source filter
    if (filterSource !== 'all' && item.trace.sourceType !== filterSource) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchContent = item.detailedContent.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
      return matchTitle || matchSummary || matchContent || matchTags;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090C15] border border-white/10">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across extracted DNA dimensions, features, or tags..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Source Type Filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-mono text-slate-400">Source:</span>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0B0F17] text-white">All Sources (100% Attributed)</option>
            <option value="code" className="bg-[#0B0F17] text-white">Code AST / Repos</option>
            <option value="slide" className="bg-[#0B0F17] text-white">Pitch Deck Slides</option>
            <option value="paper" className="bg-[#0B0F17] text-white">Academic Papers / Whitepapers</option>
            <option value="video" className="bg-[#0B0F17] text-white">Video Demonstration Transcripts</option>
            <option value="hardware-bom" className="bg-[#0B0F17] text-white">Hardware BOM / Schematics</option>
          </select>
        </div>
      </div>

      {/* Category Pills Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          All 11 Dimensions ({ORDERED_CATEGORIES.length})
        </button>

        {ORDERED_CATEGORIES.map(({ key, label }) => {
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => onSelectCategory(isSelected ? null : key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid of DNA Dimension Cards */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map(({ key }) => {
            const item = dnaItems[key];
            const isFocused = selectedCategory === key;
            return (
              <DNACardItem
                key={item.id}
                item={item}
                isFocused={isFocused}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#090C15] border border-white/10">
          <Layers className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h4 className="text-sm font-mono text-white mb-1">No DNA Dimensions Match Current Filter</h4>
          <p className="text-xs text-slate-400 font-mono mb-4">
            Try clearing your search query or switching the source filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterSource('all');
              onSelectCategory(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/40"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Footer Audit Verification Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-blue-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 text-cyan-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Every extracted claim is cryptographically linked to original evidence and ready for backend API resolvers.</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          Audited by ProjectX-Ray Knowledge Engine
        </span>
      </div>
    </div>
  );
};

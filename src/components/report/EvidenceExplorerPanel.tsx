import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Quote, 
  CheckCircle2, 
  Database,
  X,
  Clock,
  Layers,
  Link2
} from 'lucide-react';
import type { ReportEvidenceIndexItem, ReportSourceCitation } from '../../types/report';

interface EvidenceExplorerPanelProps {
  evidenceItems: ReportEvidenceIndexItem[];
  sources: ReportSourceCitation[];
  selectedEvidenceId?: string | null;
  onSelectEvidence?: (item: ReportEvidenceIndexItem) => void;
  onClose?: () => void;
  onJumpToTimestamp?: (timestamp: string) => void;
}

export const EvidenceExplorerPanel: React.FC<EvidenceExplorerPanelProps> = ({
  evidenceItems = [],
  sources = [],
  selectedEvidenceId,
  onSelectEvidence,
  onClose,
  onJumpToTimestamp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'evidence' | 'sources'>('evidence');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(selectedEvidenceId || null);

  // Sync external selection
  React.useEffect(() => {
    if (selectedEvidenceId) {
      const timer = setTimeout(() => {
        setInternalSelectedId(selectedEvidenceId);
        setActiveTab('evidence');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedEvidenceId]);

  // Distinct types for filtering
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    evidenceItems.forEach(item => {
      if (item.type) types.add(item.type);
    });
    return ['ALL', ...Array.from(types)];
  }, [evidenceItems]);

  // Filtered evidence items
  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter(item => {
      const matchesType = selectedType === 'ALL' || item.type === selectedType;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.directSourceContent && item.directSourceContent.toLowerCase().includes(q)) ||
        (item.aiInterpretation && item.aiInterpretation.toLowerCase().includes(q)) ||
        (item.relatedCategory && item.relatedCategory.toLowerCase().includes(q)) ||
        (item.source && item.source.toLowerCase().includes(q));
      return matchesType && matchesSearch;
    });
  }, [evidenceItems, selectedType, searchQuery]);

  // Filtered sources
  const filteredSources = useMemo(() => {
    if (!searchQuery) return sources;
    const q = searchQuery.toLowerCase();
    return sources.filter(s => 
      s.title.toLowerCase().includes(q) ||
      (s.publisher && s.publisher.toLowerCase().includes(q)) ||
      (s.relatedFinding && s.relatedFinding.toLowerCase().includes(q))
    );
  }, [sources, searchQuery]);

  // Active item detail
  const activeItem = useMemo(() => {
    return evidenceItems.find(i => i.id === internalSelectedId) || filteredEvidence[0] || null;
  }, [evidenceItems, internalSelectedId, filteredEvidence]);

  return (
    <aside className="h-full flex flex-col bg-slate-900/95 border-l border-slate-800 backdrop-blur-md w-full max-w-full lg:max-w-md xl:max-w-lg shadow-2xl rounded-r-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              Evidence Explorer
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {evidenceItems.length} items
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Direct source quotes segregated from AI findings
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/30 px-3 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'evidence'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Evidence Index ({filteredEvidence.length})
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
            activeTab === 'sources'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          Sources ({sources.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/50 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'evidence' ? "Search evidence quotes, metrics, files..." : "Search sources, publishers, DOIs..."}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {activeTab === 'evidence' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] no-scrollbar">
            <Filter className="w-3 h-3 text-slate-500 flex-shrink-0" />
            {availableTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap font-mono transition-colors ${
                  selectedType === t
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-300 border border-slate-700/60'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'evidence' ? (
          <>
            {/* Selected Evidence Inspector Card */}
            {activeItem && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 shadow-lg space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {activeItem.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {activeItem.id}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">
                      {activeItem.source}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    {Math.round(activeItem.confidence * 100)}%
                  </div>
                </div>

                {/* Direct Source Content (Raw Quote) */}
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-amber-400" />
                      Direct Source Content
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Verbatim</span>
                  </div>
                  <blockquote className="text-xs text-slate-200 font-mono italic leading-relaxed pl-2 border-l-2 border-amber-500/70">
                    "{activeItem.directSourceContent}"
                  </blockquote>
                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                    <span>Source: {activeItem.source}</span>
                    {activeItem.location && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        {activeItem.location.includes(':') ? (
                          <button 
                            onClick={() => onJumpToTimestamp?.(activeItem.location)}
                            className="hover:underline flex items-center gap-1 text-sky-400"
                          >
                            <Clock className="w-3 h-3" />
                            {activeItem.location}
                          </button>
                        ) : (
                          activeItem.location
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Interpretation & Synthesis */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    AI Jury Interpretation & Finding
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeItem.aiInterpretation}
                  </p>
                </div>

                {/* Metadata tags */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono border-t border-slate-900">
                  <span>Category: {activeItem.relatedCategory}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED EVIDENCE
                  </span>
                </div>
              </div>
            )}

            {/* List of other evidence items */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block px-1">
                All Captured Evidence ({filteredEvidence.length})
              </span>
              {filteredEvidence.map(item => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setInternalSelectedId(item.id);
                      onSelectEvidence?.(item);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {Math.round(item.confidence * 100)}% conf
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {item.source} ({item.id})
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic font-mono">
                      "{item.directSourceContent}"
                    </div>
                  </div>
                );
              })}

              {filteredEvidence.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No evidence matched your search query.
                </div>
              )}
            </div>
          </>
        ) : (
          /* Sources Tab */
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block px-1">
              External & Academic Citations ({filteredSources.length})
            </span>
            {filteredSources.map(s => (
              <div 
                key={s.citationId || s.sourceId}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      {s.citationId}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {s.publisher}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    {s.quality}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-100">
                  {s.title}
                </h4>

                <p className="text-[11px] text-slate-400">
                  {s.publisher} {s.publicationDate ? `• ${s.publicationDate}` : ''}
                </p>

                <div className="p-2 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Key Finding:</span>
                  {s.relatedFinding}
                </div>

                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 hover:underline pt-1 font-mono"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit Source Document
                  </a>
                )}
              </div>
            ))}

            {filteredSources.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No citations found matching "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-center">
        <p className="text-[10px] text-slate-500 font-mono">
          ProjectX-Ray Evidence Provenance Engine • Direct Source Segregation
        </p>
      </div>
    </aside>
  );
};

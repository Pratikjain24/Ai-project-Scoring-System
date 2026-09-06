import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  ShieldCheck, 
  FileCode, 
  FileText, 
  Video, 
  Globe, 
  BookOpen, 
  Cpu, 
  Copy, 
  Check, 
  ExternalLink,
  Fingerprint
} from 'lucide-react';
import type { DNAItem, SourceType } from '../../types/projectUnderstanding';

interface DNACardItemProps {
  item: DNAItem;
  isFocused?: boolean;
}

export const DNACardItem: React.FC<DNACardItemProps> = ({ item, isFocused = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedTrace, setCopiedTrace] = useState<boolean>(false);

  const handleCopyTraceId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.trace.traceId);
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  const getSourceIcon = (sourceType: SourceType) => {
    switch (sourceType) {
      case 'code':
        return <FileCode className="w-3.5 h-3.5 text-purple-400" />;
      case 'slide':
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'paper':
        return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
      case 'website':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'hardware-bom':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-semibold uppercase">
            Critical Vector
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold uppercase">
            High Priority
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 uppercase">
            Standard
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isFocused
          ? 'bg-[#0E1424] border-cyan-400/80 ring-2 ring-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
          : isExpanded
          ? 'bg-[#0B0F19] border-cyan-500/40 shadow-xl'
          : 'bg-[#090C15] border-white/10 hover:border-white/20 hover:bg-[#0B0F19]/80'
      }`}
    >
      {/* Top Header Clickable Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
      >
        <div className="flex-1">
          {/* Tag & Importance row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-cyan-400">
              {item.title}
            </span>
            {getImportanceBadge(item.importance)}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" /> {item.trace.confidence}% Confidence
            </span>
          </div>

          {/* Core Extracted Summary */}
          <h4 className="text-sm md:text-base font-medium text-white mb-2 leading-snug">
            {item.summary}
          </h4>

          {/* Quick Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expand/Collapse Chevron & Source Pin */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
            {getSourceIcon(item.trace.sourceType)}
            <span className="capitalize hidden sm:inline">{item.trace.sourceType}</span>
          </div>

          <button
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Deep Trace Inspection Drawer */}
      {isExpanded && (
        <div className="border-t border-white/10 bg-black/40 p-5 space-y-4 animate-in fade-in duration-200">
          {/* 1. Extracted Information Deep-dive */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              <span>Extracted Technical Synthesis</span>
            </div>
            <div className="bg-[#080B12] rounded-xl p-3.5 border border-white/5 text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {item.detailedContent}
            </div>
          </div>

          {/* 2. Source Attribution & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#080B12] rounded-xl p-3 border border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Verified Source Location
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                {getSourceIcon(item.trace.sourceType)}
                <span className="font-semibold">{item.trace.sourceLocation}</span>
              </div>
            </div>

            <div className="bg-[#080B12] rounded-xl p-3 border border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Extraction Pipeline Model
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{item.trace.extractionMethod}</span>
              </div>
            </div>
          </div>

          {/* 3. Original Evidence Box (Verbatim Quote / Code Snippet) */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <div className="flex items-center gap-1.5 text-amber-400">
                <FileText className="w-3.5 h-3.5" />
                <span>Original Unaltered Evidence (Ground Truth)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Extracted: {new Date(item.trace.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="relative group bg-[#05070D] rounded-xl p-3.5 border border-amber-500/20 font-mono text-xs text-amber-100/90 leading-relaxed overflow-x-auto">
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] text-amber-400/80 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                  VERBATIM GROUND TRUTH
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] md:text-xs text-amber-200/90">
                {item.trace.excerpt}
              </pre>
            </div>
          </div>

          {/* 4. Backend Traceability Identifier & API Hook */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span>Trace Hash:</span>
              <code className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                {item.trace.traceId}
              </code>
              <button
                onClick={handleCopyTraceId}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Copy Trace ID for API queries"
              >
                {copiedTrace ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <span>Ready for GraphQL / REST resolver</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-600" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

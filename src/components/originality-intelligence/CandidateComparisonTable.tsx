import React, { useState } from 'react';
import {
  ExternalLink,
  Code2,
  BookOpen,
  Building,
  GraduationCap,
  Calendar,
  Layers,
} from 'lucide-react';
import type { ComparisonTableRow } from '../../types/originalityIntelligence';

interface CandidateComparisonTableProps {
  rows: ComparisonTableRow[];
}

type SortField = 'similarity' | 'quality' | 'date';

export const CandidateComparisonTable: React.FC<CandidateComparisonTableProps> = ({ rows }) => {
  const [sortField, setSortField] = useState<SortField>('similarity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    let diff = 0;
    if (sortField === 'similarity') {
      diff = a.overallSimilarity - b.overallSimilarity;
    } else if (sortField === 'quality') {
      const qScore: Record<string, number> = { VERY_STRONG: 4, STRONG: 3, MODERATE: 2, WEAK: 1, VERY_WEAK: 0 };
      diff = (qScore[a.sourceQuality] || 0) - (qScore[b.sourceQuality] || 0);
    } else if (sortField === 'date') {
      const d1 = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
      const d2 = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
      diff = d1 - d2;
    }
    return sortOrder === 'asc' ? diff : -diff;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GITHUB_REPO':
        return <Code2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'RESEARCH_PAPER':
        return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'COMMERCIAL_PRODUCT':
        return <Building className="w-3.5 h-3.5 text-amber-400" />;
      case 'ACADEMIC_PROJECT':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <span>Candidate Project Comparison Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cross-dimensional benchmark against publicly discovered reference solutions
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Sort by:</span>
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <button
              onClick={() => handleSort('similarity')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                sortField === 'similarity' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Similarity {sortField === 'similarity' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('quality')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                sortField === 'quality' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quality {sortField === 'quality' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('date')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                sortField === 'date' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-mono uppercase text-[10px]">
              <th className="p-3.5">Candidate / Project</th>
              <th className="p-3.5">Source Type</th>
              <th className="p-3.5">Problem</th>
              <th className="p-3.5">Technology</th>
              <th className="p-3.5">Architecture</th>
              <th className="p-3.5">Features</th>
              <th className="p-3.5 text-right">Similarity</th>
              <th className="p-3.5">Identified Differences</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {sortedRows.map((row) => (
              <tr key={row.candidateId} className="hover:bg-white/[0.02] transition-colors">
                {/* Title & Org */}
                <td className="p-3.5 max-w-xs">
                  <div className="font-semibold text-white font-display text-sm">{row.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>{row.organization || 'Independent'}</span>
                    {row.publicationDate && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" /> {row.publicationDate}
                      </span>
                    )}
                  </div>
                  {row.url && (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:underline mt-1"
                    >
                      <span>Public Source</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </td>

                {/* Candidate Type */}
                <td className="p-3.5 whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
                    {getTypeIcon(row.candidateType)}
                    <span>{row.candidateType.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Quality: {row.sourceQuality}
                  </div>
                </td>

                {/* Problem */}
                <td className="p-3.5 font-mono">
                  <span className={`font-bold ${row.problemScore >= 70 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {row.problemScore}%
                  </span>
                </td>

                {/* Technology */}
                <td className="p-3.5 font-mono">
                  <span className={`font-bold ${row.technologyScore >= 60 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {row.technologyScore}%
                  </span>
                </td>

                {/* Architecture */}
                <td className="p-3.5 font-mono">
                  <span className={`font-bold ${row.architectureScore >= 70 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {row.architectureScore}%
                  </span>
                </td>

                {/* Features */}
                <td className="p-3.5 font-mono">
                  <span className={`font-bold ${row.featureScore >= 70 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {row.featureScore}%
                  </span>
                </td>

                {/* Overall Similarity */}
                <td className="p-3.5 text-right font-mono whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                      row.overallSimilarity >= 70
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-700/50'
                        : row.overallSimilarity >= 45
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                    }`}
                  >
                    {row.overallSimilarity}%
                  </span>
                </td>

                {/* Identified Differences */}
                <td className="p-3.5 max-w-sm">
                  {row.differencesSummary.length > 0 ? (
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {row.differencesSummary.map((diff, idx) => (
                        <li key={idx} className="line-clamp-1 text-emerald-300/90 font-mono text-[10px]">
                          &bull; {diff}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500 font-mono text-[10px]">No substantive differences</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

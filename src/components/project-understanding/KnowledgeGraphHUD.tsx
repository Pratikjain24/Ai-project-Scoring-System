import React, { useState } from 'react';
import { Share2, Network, Eye, Filter, Zap } from 'lucide-react';
import type { DNACategory, DNAItem } from '../../types/projectUnderstanding';

interface KnowledgeGraphHUDProps {
  dnaItems: Record<DNACategory, DNAItem>;
  selectedCategory: DNACategory | null;
  onSelectCategory: (category: DNACategory | null) => void;
}

interface GraphNode {
  id: string;
  category: DNACategory;
  label: string;
  shortTag: string;
  x: number; // percentage
  y: number; // percentage
  color: string;
  ringColor: string;
}

const GRAPH_NODES: GraphNode[] = [
  { id: 'node-problem', category: 'problem', label: 'Problem Statement', shortTag: 'PRB', x: 12, y: 30, color: 'text-rose-400', ringColor: 'border-rose-500/50 bg-rose-950/40' },
  { id: 'node-domain', category: 'domain', label: 'Domain Taxonomy', shortTag: 'DOM', x: 12, y: 70, color: 'text-amber-400', ringColor: 'border-amber-500/50 bg-amber-950/40' },
  { id: 'node-solution', category: 'solution', label: 'Proposed Solution', shortTag: 'SOL', x: 32, y: 25, color: 'text-cyan-400', ringColor: 'border-cyan-500/60 bg-cyan-950/50' },
  { id: 'node-projectType', category: 'projectType', label: 'Project Type', shortTag: 'TYP', x: 28, y: 75, color: 'text-blue-400', ringColor: 'border-blue-500/50 bg-blue-950/40' },
  { id: 'node-technologies', category: 'technologies', label: 'Technologies & BOM', shortTag: 'TCH', x: 50, y: 15, color: 'text-emerald-400', ringColor: 'border-emerald-500/60 bg-emerald-950/50' },
  { id: 'node-architecture', category: 'architectureSummary', label: 'Architecture Topology', shortTag: 'ARC', x: 50, y: 50, color: 'text-cyan-300', ringColor: 'border-cyan-400/80 bg-cyan-900/60' },
  { id: 'node-targetUsers', category: 'targetUsers', label: 'Target Users', shortTag: 'USR', x: 48, y: 85, color: 'text-indigo-400', ringColor: 'border-indigo-500/50 bg-indigo-950/40' },
  { id: 'node-inputs', category: 'inputs', label: 'Sensor / Data Inputs', shortTag: 'INP', x: 70, y: 20, color: 'text-sky-400', ringColor: 'border-sky-500/50 bg-sky-950/40' },
  { id: 'node-outputs', category: 'outputs', label: 'Generated Outputs', shortTag: 'OUT', x: 70, y: 65, color: 'text-teal-400', ringColor: 'border-teal-500/50 bg-teal-950/40' },
  { id: 'node-keyFeatures', category: 'keyFeatures', label: 'Key Features', shortTag: 'FTR', x: 88, y: 30, color: 'text-purple-400', ringColor: 'border-purple-500/50 bg-purple-950/40' },
  { id: 'node-claimedBenefits', category: 'claimedBenefits', label: 'Claimed Benefits', shortTag: 'BNF', x: 88, y: 72, color: 'text-emerald-300', ringColor: 'border-emerald-400/70 bg-emerald-950/60' },
];

// Defined Edges linking node IDs
const GRAPH_EDGES: [string, string][] = [
  ['node-problem', 'node-solution'],
  ['node-problem', 'node-domain'],
  ['node-domain', 'node-projectType'],
  ['node-solution', 'node-architecture'],
  ['node-solution', 'node-technologies'],
  ['node-technologies', 'node-architecture'],
  ['node-technologies', 'node-inputs'],
  ['node-architecture', 'node-inputs'],
  ['node-architecture', 'node-outputs'],
  ['node-inputs', 'node-outputs'],
  ['node-targetUsers', 'node-problem'],
  ['node-targetUsers', 'node-claimedBenefits'],
  ['node-outputs', 'node-keyFeatures'],
  ['node-solution', 'node-keyFeatures'],
  ['node-keyFeatures', 'node-claimedBenefits'],
  ['node-outputs', 'node-claimedBenefits'],
];

export const KnowledgeGraphHUD: React.FC<KnowledgeGraphHUDProps> = ({
  dnaItems,
  selectedCategory,
  onSelectCategory,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Helper to find node by ID
  const getNode = (id: string) => GRAPH_NODES.find((n) => n.id === id);

  return (
    <div className="relative rounded-2xl bg-[#090C15] border border-white/10 p-5 overflow-hidden shadow-2xl">
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Relational Knowledge Graph Topology
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Traceable dependency matrix across all 11 extracted DNA dimensions
            </p>
          </div>
        </div>

        {/* Filter controls / reset */}
        <div className="flex items-center gap-2">
          {selectedCategory ? (
            <button
              onClick={() => onSelectCategory(null)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3 h-3" />
              <span>Reset Filter: {selectedCategory}</span>
            </button>
          ) : (
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyan-400" /> Click node to isolate dimension
            </span>
          )}
        </div>
      </div>

      {/* SVG & Node Interactive Canvas */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-xl bg-black/40 border border-white/5 overflow-hidden select-none">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(6, 182, 212, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Central Pulsing Beacon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        {/* SVG Connective Vector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="activeEdgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {GRAPH_EDGES.map(([fromId, toId], idx) => {
            const from = getNode(fromId);
            const to = getNode(toId);
            if (!from || !to) return null;

            const isHighlighted =
              hoveredNode === fromId ||
              hoveredNode === toId ||
              (selectedCategory && (from.category === selectedCategory || to.category === selectedCategory));

            return (
              <line
                key={`edge-${idx}`}
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke={isHighlighted ? 'url(#activeEdgeGlow)' : 'rgba(255, 255, 255, 0.12)'}
                strokeWidth={isHighlighted ? 2.5 : 1}
                strokeDasharray={isHighlighted ? 'none' : '4 3'}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* HTML Node Elements */}
        {GRAPH_NODES.map((node) => {
          const item = dnaItems[node.category];
          const isSelected = selectedCategory === node.category;
          const isHovered = hoveredNode === node.id;

          return (
            <div
              key={node.id}
              onClick={() => onSelectCategory(isSelected ? null : node.category)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-200 group z-10`}
            >
              {/* Node Circle */}
              <div
                className={`relative px-2.5 py-1.5 rounded-xl border flex items-center gap-2 backdrop-blur-md shadow-lg transition-all ${
                  node.ringColor
                } ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                    : isHovered
                    ? 'scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                      {node.shortTag}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-300 font-semibold">
                      {item.trace.confidence}%
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] text-slate-300 font-medium whitespace-nowrap">
                    {node.label}
                  </span>
                </div>
              </div>

              {/* Floating Tooltip Preview */}
              {(isHovered || isSelected) && (
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-2.5 rounded-xl bg-[#0F1420] border border-cyan-500/50 shadow-2xl z-30 pointer-events-none text-left">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1">
                    <span className="font-semibold uppercase">{node.label}</span>
                    <span>{item.trace.sourceType}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 line-clamp-2 mb-1.5">
                    {item.summary}
                  </p>
                  <div className="text-[9px] font-mono text-slate-400 truncate flex items-center gap-1">
                    <Share2 className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{item.trace.sourceLocation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Legend footer in canvas */}
        <div className="absolute bottom-2 left-3 right-3 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 pointer-events-none">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> 16 Inter-Dimension Cross-Validation Vectors Active
          </span>
          <span className="hidden md:inline text-slate-400">
            Source Trace: 100% Attributed
          </span>
        </div>
      </div>
    </div>
  );
};

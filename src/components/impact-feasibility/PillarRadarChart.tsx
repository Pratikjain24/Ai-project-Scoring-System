import React, { useState } from 'react';
import { Target, Info } from 'lucide-react';
import type { ImpactFeasibilityReport } from '../../types/impactFeasibility';

interface PillarRadarChartProps {
  report: ImpactFeasibilityReport;
}

export const PillarRadarChart: React.FC<PillarRadarChartProps> = ({ report }) => {
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

  // 4 Axes representing the 4 pillars
  const axes = [
    {
      key: 'social',
      name: 'Social Impact',
      score: report.pillars.social.pillarScore,
      benchmark: report.industryBenchmarks.social,
      angle: -Math.PI / 2, // 12 o'clock (top)
      color: '#06b6d4',
    },
    {
      key: 'economic',
      name: 'Economic Impact',
      score: report.pillars.economic.pillarScore,
      benchmark: report.industryBenchmarks.economic,
      angle: 0, // 3 o'clock (right)
      color: '#10b981',
    },
    {
      key: 'environmental',
      name: 'Environmental',
      score: report.pillars.environmental.pillarScore,
      benchmark: report.industryBenchmarks.environmental,
      angle: Math.PI / 2, // 6 o'clock (bottom)
      color: '#34d399',
    },
    {
      key: 'feasibility',
      name: 'Feasibility & TRL',
      score: report.pillars.feasibility.pillarScore,
      benchmark: report.industryBenchmarks.feasibility,
      angle: Math.PI, // 9 o'clock (left)
      color: '#a855f7',
    },
  ];

  // SVG Radar Dimensions
  const size = 320;
  const center = size / 2;
  const maxRadius = 110;

  // Grid concentric rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (value: number, angle: number) => {
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points for project scores
  const projectPoints = axes
    .map((axis) => {
      const { x, y } = getCoordinates(axis.score, axis.angle);
      return `${x},${y}`;
    })
    .join(' ');

  // Generate polygon points for industry benchmark
  const benchmarkPoints = axes
    .map((axis) => {
      const { x, y } = getCoordinates(axis.benchmark, axis.angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-6">
      {/* Radar SVG */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="overflow-visible"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Concentric Rings */}
          {rings.map((ring, idx) => {
            const r = ring * maxRadius;
            return (
              <g key={idx}>
                <polygon
                  points={axes
                    .map((a) => {
                      const x = center + r * Math.cos(a.angle);
                      const y = center + r * Math.sin(a.angle);
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                  strokeDasharray={idx < 3 ? '2 2' : 'none'}
                />
                {/* Ring percentage label */}
                <text
                  x={center + 4}
                  y={center - r + 10}
                  fill="rgba(148, 163, 184, 0.4)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {ring * 100}%
                </text>
              </g>
            );
          })}

          {/* Radial Spokes */}
          {axes.map((axis, i) => {
            const edge = getCoordinates(100, axis.angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={edge.x}
                y2={edge.y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
            );
          })}

          {/* Benchmark Polygon */}
          <polygon
            points={benchmarkPoints}
            fill="rgba(148, 163, 184, 0.08)"
            stroke="rgba(148, 163, 184, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Project Score Polygon */}
          <polygon
            points={projectPoints}
            fill="url(#radarGradient)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            className="transition-all duration-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          />

          {/* Radar Fill Gradient */}
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Axis Vertex Dots */}
          {axes.map((axis) => {
            const { x, y } = getCoordinates(axis.score, axis.angle);
            const isHovered = hoveredPillar === axis.key;
            return (
              <g
                key={axis.key}
                onMouseEnter={() => setHoveredPillar(axis.key)}
                onMouseLeave={() => setHoveredPillar(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : 4.5}
                  fill={axis.color}
                  stroke="#07090E"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="none"
                    stroke={axis.color}
                    strokeWidth="1.5"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Axis Labels */}
          {axes.map((axis) => {
            const labelDist = maxRadius + 24;
            const x = center + labelDist * Math.cos(axis.angle);
            const y = center + labelDist * Math.sin(axis.angle);

            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.abs(axis.angle - 0) < 0.1) textAnchor = 'start';
            else if (Math.abs(axis.angle - Math.PI) < 0.1) textAnchor = 'end';

            return (
              <text
                key={axis.key}
                x={x}
                y={y + 4}
                textAnchor={textAnchor}
                fill={hoveredPillar === axis.key ? axis.color : '#cbd5e1'}
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
                className="transition-colors duration-200"
              >
                {axis.name}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Right Column: Comparative Legend & Strategic Balance Diagnosis */}
      <div className="flex-1 space-y-4 w-full">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Pillar Balance & Benchmark Analysis
            </h4>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
              <span className="text-cyan-300">Project Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-slate-400" />
              <span className="text-slate-400">Industry Avg</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Comparison Matrix */}
        <div className="grid grid-cols-2 gap-3">
          {axes.map((axis) => {
            const delta = (axis.score - axis.benchmark).toFixed(1);
            const isPositive = axis.score >= axis.benchmark;

            return (
              <div
                key={axis.key}
                onMouseEnter={() => setHoveredPillar(axis.key)}
                onMouseLeave={() => setHoveredPillar(null)}
                className={`p-3 rounded-xl border transition-all ${
                  hoveredPillar === axis.key
                    ? 'border-cyan-500/50 bg-cyan-950/20'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-medium">
                    {axis.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {axis.score}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                  <span className="text-slate-500">Benchmark: {axis.benchmark}</span>
                  <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                    {isPositive ? `+${delta}` : delta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Balance Diagnosis Advice */}
        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-cyan-200 block">
              AI Dimensional Balance Diagnosis
            </span>
            <p className="text-slate-400 leading-relaxed">
              All 4 evaluated dimensions exceed target baseline averages by a mean delta of{' '}
              <strong className="text-emerald-400">
                +{(
                  (report.compositeViabilityScore -
                    (report.industryBenchmarks.social +
                      report.industryBenchmarks.economic +
                      report.industryBenchmarks.environmental +
                      report.industryBenchmarks.feasibility) /
                      4)
                ).toFixed(1)} pts
              </strong>
              . Social impact remains the strongest vector, while feasibility requires execution of the TRL 7 pilot milestone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

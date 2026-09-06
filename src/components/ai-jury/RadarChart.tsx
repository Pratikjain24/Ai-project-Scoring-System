import React, { useState } from 'react';
import type { ScoringDimension } from '../../types/aiJuryScoring';

interface RadarChartProps {
  dimensions: ScoringDimension[];
  selectedDimensionId?: string | null;
  onSelectDimension?: (id: string) => void;
  showBenchmark?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  dimensions,
  selectedDimensionId,
  onSelectDimension,
  showBenchmark = true
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const size = 380;
  const center = size / 2;
  const radius = 135;
  const levels = [20, 40, 60, 80, 100];
  const numDimensions = dimensions.length;

  // Calculate polar coordinates
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / numDimensions) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Build polygon points string
  const projectPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.score);
      return `${x},${y}`;
    })
    .join(' ');

  // Standard benchmark baseline points (e.g. 75 across all dimensions)
  const benchmarkValues = [80, 80, 75, 75, 75, 75, 70, 75];
  const benchmarkPoints = dimensions
    .map((_, i) => {
      const bVal = benchmarkValues[i] || 75;
      const { x, y } = getCoordinates(i, bVal);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0B0F19]/90 border border-white/10 backdrop-blur-md shadow-xl">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            8-Axis Competency Radar
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-3 h-1 rounded bg-cyan-400" />
            <span>Observed Score</span>
          </div>
          {showBenchmark && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
              <span>Jury Baseline (75)</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          className="overflow-visible select-none"
        >
          <defs>
            <linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
            </linearGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric grid webs */}
          {levels.map((level) => {
            const levelPoints = dimensions
              .map((_, i) => {
                const { x, y } = getCoordinates(i, level);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <g key={level}>
                <polygon
                  points={levelPoints}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeWidth="1"
                />
                <text
                  x={center + 4}
                  y={center - (level / 100) * radius + 3}
                  fill="rgba(148, 163, 184, 0.4)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Radial axis lines */}
          {dimensions.map((dim, i) => {
            const { x, y } = getCoordinates(i, 100);
            const isSelected = selectedDimensionId === dim.id;
            const isHovered = hoveredIndex === i;

            return (
              <line
                key={dim.id}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={isSelected || isHovered ? 'rgba(6, 182, 212, 0.6)' : 'rgba(255, 255, 255, 0.12)'}
                strokeWidth={isSelected || isHovered ? '1.5' : '1'}
                strokeDasharray={isSelected || isHovered ? 'none' : '2,2'}
              />
            );
          })}

          {/* Benchmark polygon */}
          {showBenchmark && (
            <polygon
              points={benchmarkPoints}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.2"
              strokeDasharray="4,3"
              opacity="0.6"
            />
          )}

          {/* Observed Project Polygon */}
          <polygon
            points={projectPoints}
            fill="url(#radarFillGradient)"
            stroke="#22d3ee"
            strokeWidth="2.5"
            filter="url(#radarGlow)"
            className="transition-all duration-300"
          />

          {/* Vertices & interactive hit targets */}
          {dimensions.map((dim, i) => {
            const { x, y } = getCoordinates(i, dim.score);
            const isSelected = selectedDimensionId === dim.id;
            const isHovered = hoveredIndex === i;

            return (
              <g 
                key={dim.id} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectDimension && onSelectDimension(dim.id)}
              >
                {/* Confidence aura ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected || isHovered ? 12 : 7}
                  fill={isSelected ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.15)'}
                  className="transition-all duration-200"
                />
                
                {/* Solid center dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected || isHovered ? 5 : 3.5}
                  fill={isSelected || isHovered ? '#ffffff' : '#22d3ee'}
                  stroke="#0891b2"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Score badge at vertex */}
                {(isSelected || isHovered) && (
                  <g>
                    <rect
                      x={x - 16}
                      y={y - 24}
                      width="32"
                      height="18"
                      rx="4"
                      fill="#0e1726"
                      stroke="#06b6d4"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {dim.score}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Axis Labels positioned outside radius */}
          {dimensions.map((dim, i) => {
            const { angle } = getCoordinates(i, 100);
            const labelRadius = radius + 22;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);
            const isSelected = selectedDimensionId === dim.id;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={`label-${dim.id}`}
                className="cursor-pointer transition-opacity"
                onClick={() => onSelectDimension && onSelectDimension(dim.id)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <text
                  x={lx}
                  y={ly + 3}
                  textAnchor="middle"
                  fill={isSelected ? '#22d3ee' : isHovered ? '#ffffff' : '#94a3b8'}
                  fontSize={isSelected || isHovered ? '11' : '10'}
                  fontWeight={isSelected || isHovered ? 'bold' : '500'}
                  fontFamily="system-ui, sans-serif"
                >
                  {dim.shortName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered details tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-500/40 text-xs font-mono shadow-2xl pointer-events-none flex items-center gap-3">
            <span className="text-white font-semibold">
              {dimensions[hoveredIndex].name}
            </span>
            <span className="text-cyan-400 font-bold">
              Score: {dimensions[hoveredIndex].score}/100
            </span>
            <span className="text-slate-400">
              Weight: {dimensions[hoveredIndex].weight}%
            </span>
            <span className="text-emerald-400">
              Confidence: {dimensions[hoveredIndex].confidence}%
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-slate-400 font-mono text-center flex items-center gap-2">
        <span className="text-cyan-400">💡 Tip:</span>
        <span>Click any axis or vertex to inspect underlying empirical evidence</span>
      </div>
    </div>
  );
};

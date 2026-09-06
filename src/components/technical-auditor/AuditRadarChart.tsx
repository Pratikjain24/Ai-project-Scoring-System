import React, { useState } from 'react';
import type { TechnicalAuditMetric } from '../../types/technicalAudit';

interface AuditRadarChartProps {
  metrics: TechnicalAuditMetric[];
  activeMetricId?: string | null;
  onSelectMetric?: (metricId: string) => void;
  className?: string;
}

export const AuditRadarChart: React.FC<AuditRadarChartProps> = ({
  metrics,
  activeMetricId,
  onSelectMetric,
  className = '',
}) => {
  const [hoveredMetric, setHoveredMetric] = useState<TechnicalAuditMetric | null>(null);

  // SVG dimensions & geometry
  const size = 520;
  const center = size / 2;
  const maxRadius = 180;
  const totalAxes = metrics.length; // 10 axes

  // Concentric levels (20%, 40%, 60%, 80%, 100%)
  const levels = [20, 40, 60, 80, 100];

  // Helper to compute (x, y) coordinates for an angle and radius
  const getCoordinates = (angleRad: number, radius: number) => {
    // Start at top (-PI/2)
    const x = center + radius * Math.cos(angleRad - Math.PI / 2);
    const y = center + radius * Math.sin(angleRad - Math.PI / 2);
    return { x, y };
  };

  // Compute vertices for the metric scores
  const scorePoints = metrics.map((metric, index) => {
    const angleRad = (index / totalAxes) * 2 * Math.PI;
    const radius = (metric.score / 100) * maxRadius;
    const { x, y } = getCoordinates(angleRad, radius);
    return { x, y, metric, angleRad };
  });

  // SVG path string for the polygon
  const polygonPointsStr = scorePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Compute level polygons for background grid
  const levelPolygons = levels.map((lvl) => {
    const radius = (lvl / 100) * maxRadius;
    const points = Array.from({ length: totalAxes }).map((_, index) => {
      const angleRad = (index / totalAxes) * 2 * Math.PI;
      const { x, y } = getCoordinates(angleRad, radius);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return { level: lvl, pointsStr: points.join(' ') };
  });

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer Radar Container */}
      <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible drop-shadow-2xl"
        >
          <defs>
            {/* Linear and Radial Gradients */}
            <radialGradient id="radarRadialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.28)" />
              <stop offset="65%" stopColor="rgba(16, 185, 129, 0.12)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0.0)" />
            </radialGradient>

            <linearGradient id="polyStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            <filter id="radarGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Radial Glow */}
          <circle cx={center} cy={center} r={maxRadius * 1.15} fill="url(#radarRadialGlow)" />

          {/* Web grid rings */}
          {levelPolygons.map(({ level, pointsStr }) => (
            <g key={`level-${level}`}>
              <polygon
                points={pointsStr}
                fill="none"
                stroke="rgba(255, 255, 255, 0.09)"
                strokeWidth={level === 100 ? '1.5' : '1'}
                strokeDasharray={level === 100 ? 'none' : '3, 4'}
              />
              {/* Level value tag on top axis */}
              <text
                x={center}
                y={center - (level / 100) * maxRadius - 4}
                textAnchor="middle"
                className="text-[9px] fill-slate-500 font-mono select-none"
              >
                {level}
              </text>
            </g>
          ))}

          {/* Axis lines and outer labels */}
          {metrics.map((metric, index) => {
            const angleRad = (index / totalAxes) * 2 * Math.PI;
            const outerCoord = getCoordinates(angleRad, maxRadius);
            const labelCoord = getCoordinates(angleRad, maxRadius + 34);
            const isHovered = hoveredMetric?.id === metric.id;
            const isActive = activeMetricId === metric.id;

            return (
              <g key={`axis-${metric.id}`} className="cursor-pointer" onClick={() => onSelectMetric?.(metric.id)}>
                {/* Axis Ray */}
                <line
                  x1={center}
                  y1={center}
                  x2={outerCoord.x}
                  y2={outerCoord.y}
                  stroke={isHovered || isActive ? 'rgba(6, 182, 212, 0.7)' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={isHovered || isActive ? '1.8' : '1'}
                  className="transition-colors duration-200"
                />

                {/* Outer Axis Label */}
                <g
                  transform={`translate(${labelCoord.x}, ${labelCoord.y})`}
                  onMouseEnter={() => setHoveredMetric(metric)}
                  onMouseLeave={() => setHoveredMetric(null)}
                >
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[11px] font-mono tracking-tight transition-all duration-200 ${
                      isHovered || isActive
                        ? 'fill-cyan-300 font-bold scale-105'
                        : 'fill-slate-300 hover:fill-white font-medium'
                    }`}
                  >
                    {metric.name}
                  </text>
                  <text
                    x={0}
                    y={13}
                    textAnchor="middle"
                    className="text-[9.5px] fill-cyan-400/90 font-bold font-mono"
                  >
                    {metric.score}
                  </text>
                </g>
              </g>
            );
          })}

          {/* The Data Polygon Fill & Stroke */}
          <polygon
            points={polygonPointsStr}
            fill="rgba(6, 182, 212, 0.22)"
            stroke="url(#polyStrokeGradient)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#radarGlowFilter)"
            className="transition-all duration-500 ease-out"
          />

          {/* Interactive Vertices */}
          {scorePoints.map(({ x, y, metric }) => {
            const isHovered = hoveredMetric?.id === metric.id;
            const isActive = activeMetricId === metric.id;

            return (
              <g
                key={`vertex-${metric.id}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredMetric(metric)}
                onMouseLeave={() => setHoveredMetric(null)}
                onClick={() => onSelectMetric?.(metric.id)}
              >
                {/* Outer Glow Ring on Hover */}
                {(isHovered || isActive) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill="rgba(6, 182, 212, 0.35)"
                    className="animate-pulse"
                  />
                )}
                {/* Vertex Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isActive ? 6.5 : 4.5}
                  fill={isHovered || isActive ? '#22d3ee' : '#38bdf8'}
                  stroke="#07090e"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Floating Tooltip */}
        {hoveredMetric && (
          <div className="absolute z-20 pointer-events-none -top-4 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl shadow-cyan-950/60 rounded-xl px-4 py-2.5 min-w-[200px] text-center transform -translate-y-full transition-all duration-200">
            <div className="text-[11px] uppercase tracking-wider font-mono text-cyan-400 font-semibold mb-0.5">
              {hoveredMetric.name}
            </div>
            <div className="flex items-center justify-center gap-3 my-1">
              <div>
                <span className="text-xl font-mono font-bold text-white">{hoveredMetric.score}</span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
              </div>
              <div className="h-5 w-px bg-white/15" />
              <div className="text-left">
                <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                  {hoveredMetric.confidence}% Conf.
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {hoveredMetric.evidenceCount} Evidences
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-300 line-clamp-1 italic mt-0.5">
              {hoveredMetric.headline}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Radar Meta Indicator */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-400/50" />
          <span>Evaluation Polygon</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-slate-500 inline-block" />
          <span>20% Interval Grid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400 font-semibold">10 Axes</span>
          <span>Adaptive Framework</span>
        </div>
      </div>
    </div>
  );
};

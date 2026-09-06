import React from 'react';

interface RadarDataPoint {
  category: string;
  score: number;
}

interface OverviewRadarChartProps {
  data: RadarDataPoint[];
  size?: number;
}

export const OverviewRadarChart: React.FC<OverviewRadarChartProps> = ({
  data,
  size = 320,
}) => {
  const center = size / 2;
  const radius = center - 50;
  const numPoints = data.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Concentric polygon grids (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  // Data polygon points
  const polygonPoints = data
    .map((point, i) => {
      const { x, y } = getCoordinates(i, point.score / 100);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid Polygons */}
        {gridLevels.map((level, lvlIdx) => {
          const gridPoints = data
            .map((_, i) => {
              const { x, y } = getCoordinates(i, level);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={lvlIdx}
              points={gridPoints}
              fill="none"
              stroke="#1E293B"
              strokeWidth="1"
              strokeDasharray={lvlIdx < 4 ? '3,3' : 'none'}
            />
          );
        })}

        {/* Radial Axis Lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Data Polygon with Glow */}
        <polygon
          points={polygonPoints}
          fill="rgba(6, 182, 212, 0.25)"
          stroke="#06B6D4"
          strokeWidth="2.5"
          style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.4))' }}
        />

        {/* Data Vertices */}
        {data.map((point, i) => {
          const { x, y } = getCoordinates(i, point.score / 100);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#06B6D4"
                stroke="#07090E"
                strokeWidth="2"
              />
              <circle
                cx={x}
                cy={y}
                r="7"
                fill="none"
                stroke="rgba(6, 182, 212, 0.5)"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Labels */}
        {data.map((point, i) => {
          const labelDist = 1.18;
          const { x, y } = getCoordinates(i, labelDist);

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] font-mono fill-slate-300 select-none"
            >
              {point.category} ({point.score})
            </text>
          );
        })}
      </svg>
    </div>
  );
};

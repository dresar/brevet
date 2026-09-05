'use client';

import React, { useMemo, useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

export interface TaxDomainScore {
  key: string;
  name: string;
  shortName: string;
  score: number;
}

interface CompetencyRadarChartProps {
  categoryProficiency?: Record<string, number>;
  avgQuizScore?: number;
}

const DEFAULT_DOMAINS = [
  { key: 'kup', name: 'KUP & Prosedur Perpajakan', shortName: 'KUP & Prosedur' },
  { key: 'pph_op', name: 'PPh Orang Pribadi', shortName: 'PPh OP' },
  { key: 'pph_badan', name: 'PPh Badan & Pemotongan', shortName: 'PPh Badan & Potput' },
  { key: 'ppn', name: 'PPN & PPnBM', shortName: 'PPN & PPnBM' },
  { key: 'potput', name: 'PBB, BPHTB & Pajak Daerah', shortName: 'PBB & BPHTB' },
  { key: 'coretax', name: 'Coretax & Akuntansi Perpajakan', shortName: 'Coretax & Akuntansi' },
];

export function CompetencyRadarChart({
  categoryProficiency = {},
  avgQuizScore = 0,
}: CompetencyRadarChartProps) {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const radius = 100;
  const center = 140;
  const totalAxes = DEFAULT_DOMAINS.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  // Compute points and polygon
  const { points, polygonSvgPoints } = useMemo(() => {
    const calculatedPoints = DEFAULT_DOMAINS.map((domain, index) => {
      const rawScore = categoryProficiency[domain.key] ?? (avgQuizScore > 0 ? avgQuizScore : 0);
      const clampedScore = Math.max(0, Math.min(100, Number(rawScore) || 0));
      const r = (clampedScore / 100) * radius;
      const angle = index * angleStep - Math.PI / 2;
      const x = Math.round((center + r * Math.cos(angle)) * 100) / 100;
      const y = Math.round((center + r * Math.sin(angle)) * 100) / 100;

      // Axis end point (100%)
      const endX = Math.round((center + radius * Math.cos(angle)) * 100) / 100;
      const endY = Math.round((center + radius * Math.sin(angle)) * 100) / 100;

      // Label coordinate (120%)
      const labelRadius = radius + 26;
      const labelX = Math.round((center + labelRadius * Math.cos(angle)) * 100) / 100;
      const labelY = Math.round((center + labelRadius * Math.sin(angle)) * 100) / 100;

      return {
        key: domain.key,
        name: domain.name,
        shortName: domain.shortName,
        score: clampedScore,
        x,
        y,
        endX,
        endY,
        labelX,
        labelY,
        angle,
      };
    });

    const svgString = calculatedPoints.map((p) => `${p.x},${p.y}`).join(' ');
    return { points: calculatedPoints, polygonSvgPoints: svgString };
  }, [categoryProficiency, avgQuizScore, radius, center, angleStep]);

  // Concentric polygon grid levels: 20%, 40%, 60%, 80%, 100%
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const averageProficiency = useMemo(() => {
    if (points.length === 0) return 0;
    const total = points.reduce((acc, p) => acc + p.score, 0);
    return Math.round(total / points.length);
  }, [points]);

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-white">Radar Kompetensi Perpajakan</h3>
          </div>
          <p className="text-xs text-slate-400">Peta penguasaan materi 6 domain perpajakan Brevet AB & DJP</p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-right">
          <span className="text-[10px] text-blue-300 font-semibold block uppercase tracking-wider">Rata-Rata</span>
          <span className="text-sm sm:text-base font-mono font-black text-blue-400">{averageProficiency}%</span>
        </div>
      </div>

      {/* Spider Chart SVG */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 280 280" className="w-full h-full overflow-visible">
            <defs>
              {/* Radial gradient for the filled radar polygon */}
              <radialGradient id="radarAreaGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
              </radialGradient>
              <linearGradient id="radarStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>

            {/* Concentric Web Grid Polygons */}
            {gridLevels.map((level) => {
              const gridPoints = points
                .map((p) => {
                  const r = level * radius;
                  const gx = Math.round((center + r * Math.cos(p.angle)) * 100) / 100;
                  const gy = Math.round((center + r * Math.sin(p.angle)) * 100) / 100;
                  return `${gx},${gy}`;
                })
                .join(' ');

              return (
                <polygon
                  key={level}
                  points={gridPoints}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray={level === 1.0 ? 'none' : '3 3'}
                  className="opacity-40"
                />
              );
            })}

            {/* Axis Lines from Center to Perimeter */}
            {points.map((p) => (
              <line
                key={`axis-${p.key}`}
                x1={center}
                y1={center}
                x2={p.endX}
                y2={p.endY}
                stroke="#334155"
                strokeWidth="1"
                className="opacity-50"
              />
            ))}

            {/* Data Polygon Fill & Stroke */}
            <polygon
              points={polygonSvgPoints}
              fill="url(#radarAreaGradient)"
              stroke="url(#radarStrokeGradient)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all duration-700 ease-out drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
            />

            {/* Data Nodes & Interaction Targets */}
            {points.map((p) => (
              <g
                key={`node-${p.key}`}
                onMouseEnter={() => setHoveredDomain(p.key)}
                onMouseLeave={() => setHoveredDomain(null)}
                className="cursor-pointer group"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  className="fill-blue-500 stroke-white stroke-2 transition-transform duration-300 group-hover:scale-150"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  fill="transparent"
                  className="hover:stroke-blue-400/40 hover:stroke-4"
                />
              </g>
            ))}

            {/* Domain Labels */}
            {points.map((p) => {
              const isHovered = hoveredDomain === p.key;
              let textAnchor: 'middle' | 'start' | 'end' = 'middle';
              if (p.labelX > center + 10) textAnchor = 'start';
              if (p.labelX < center - 10) textAnchor = 'end';

              return (
                <text
                  key={`label-${p.key}`}
                  x={p.labelX}
                  y={p.labelY}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className={`text-[9px] sm:text-[10px] font-sans transition-colors duration-200 ${
                    isHovered ? 'fill-blue-300 font-bold' : 'fill-slate-400 font-medium'
                  }`}
                >
                  {p.shortName} ({p.score}%)
                </text>
              );
            })}
          </svg>
        </div>

        {/* Breakdown List */}
        <div className="w-full space-y-2.5 flex-1">
          {points.map((p) => {
            const isHovered = hoveredDomain === p.key;
            return (
              <div
                key={p.key}
                onMouseEnter={() => setHoveredDomain(p.key)}
                onMouseLeave={() => setHoveredDomain(null)}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                  isHovered
                    ? 'bg-blue-950/40 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <p className="text-xs font-bold text-white truncate">{p.name}</p>
                  <div className="w-36 xs:w-48 sm:w-56 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-400 shrink-0">{p.score}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

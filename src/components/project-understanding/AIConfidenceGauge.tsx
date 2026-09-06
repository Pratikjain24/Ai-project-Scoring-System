import React from 'react';
import { Gauge, CheckCircle2, FileText, Code2, Hash, ArrowUpRight } from 'lucide-react';
import type { AIConfidenceMetrics } from '../../types/projectUnderstanding';

interface AIConfidenceGaugeProps {
  confidence: AIConfidenceMetrics;
}

export const AIConfidenceGauge: React.FC<AIConfidenceGaugeProps> = ({ confidence }) => {
  // Compute SVG circle parameters for a radial dial
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence.overallScore / 100) * circumference;

  return (
    <div className="rounded-2xl bg-[#0B0F19] border border-white/10 p-6 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Gauge className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            AI Understanding Confidence
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold">
          {confidence.calibrationStatus}
        </span>
      </div>

      {/* Radial Gauge and Primary Score */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
            {/* Background Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Value Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="url(#confidenceGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-display font-bold text-white tracking-tight">
              {confidence.overallScore}%
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Epistemic Fit
            </span>
          </div>
        </div>

        {/* Breakdown Sub-metrics */}
        <div className="flex-1 w-full space-y-3">
          {confidence.subMetrics.map((metric) => (
            <div key={metric.label} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-slate-300 group-hover:text-cyan-300 transition-colors">
                  {metric.label}
                </span>
                <span className="font-mono font-semibold text-emerald-400">
                  {metric.score}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry & Audit Evidence Bar */}
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center font-mono">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            <span>Nodes</span>
          </div>
          <div className="text-sm font-semibold text-white">{confidence.totalEvidenceNodes}</div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>Quotes</span>
          </div>
          <div className="text-sm font-semibold text-white">{confidence.directQuotesCount}</div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <Code2 className="w-3 h-3 text-purple-400" />
            <span>AST Refs</span>
          </div>
          <div className="text-sm font-semibold text-white">{confidence.codeASTNodesCount}</div>
        </div>
      </div>

      {/* Cryptographic Trace Proof */}
      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
        <span className="flex items-center gap-1 truncate max-w-[200px]">
          <Hash className="w-3 h-3 text-slate-600" />
          <span>Audit Hash: {confidence.auditHash.slice(0, 14)}...</span>
        </span>
        <span className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer">
          Trace Enclave <ArrowUpRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
};

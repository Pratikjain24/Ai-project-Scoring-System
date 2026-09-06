import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Binary, 
  CheckCircle2, 
  Scale, 
  BookOpen 
} from 'lucide-react';
import { VERDICT_THRESHOLDS } from '../../data/mockAiJuryScoring';

interface MethodologyPanelProps {
  isInitiallyExpanded?: boolean;
}

export const MethodologyPanel: React.FC<MethodologyPanelProps> = ({
  isInitiallyExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  return (
    <div className="rounded-2xl bg-[#090D17] border border-cyan-500/30 overflow-hidden shadow-2xl transition-all duration-300">
      {/* Header / Clickable Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-6 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-transparent to-blue-950/30 hover:bg-white/[0.03] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                Scoring Methodology & Mathematical Traceability Rubric
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold">
                Audit Standard v4.2
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Transparent, explainable mathematical formulas governing AI verdict levels, weights, and confidence thresholds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
          <span>{isExpanded ? 'Collapse' : 'Expand Rubric'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 border-t border-white/10 space-y-6 text-slate-300 text-xs font-sans">
          
          {/* Core Formula Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Formula 1: Weighted Consensus */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
                <Binary className="w-4 h-4" />
                <span>1. Consensus Overall Score Formula</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-500/30 font-mono text-center text-sm text-cyan-200">
                Score = ∑<sub>i=1</sub><sup>8</sup> ( S<sub>i</sub> × W<sub>i</sub> ) ÷ 100
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Where <strong className="text-slate-200">S<sub>i</sub></strong> is the observed empirical subscore (0–100) and <strong className="text-slate-200">W<sub>i</sub></strong> is the committee weight percentage. The sum of all weights strictly equals 100%.
              </p>
            </div>

            {/* Formula 2: Confidence Attenuation */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Bayesian Confidence Weighting & Attenuation</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/30 font-mono text-center text-sm text-emerald-200">
                W<sub>eff</sub> = W<sub>i</sub> × √( C<sub>i</sub> ÷ 100 )
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                If evidentiary support is deficient (Confidence <strong className="text-slate-200">C<sub>i</sub> &lt; 70%</strong>), the dimension weight undergoes square-root shrinkage, dampening ungrounded speculative boosts.
              </p>
            </div>

          </div>

          {/* Verdict Levels Table */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>AI Verdict Tiers & Score Bands</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2 px-3">Verdict Tier</th>
                    <th className="py-2 px-3">Score Range</th>
                    <th className="py-2 px-3">Minimum Criteria & Evidentiary Thresholds</th>
                    <th className="py-2 px-3">Action Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {VERDICT_THRESHOLDS.map((tier) => (
                    <tr key={tier.level} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${tier.badgeBg} ${tier.badgeBorder} ${tier.textColor}`}>
                          {tier.level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {tier.minScore} – {tier.maxScore}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {tier.description}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">
                        {tier.level === 'Exceptional' && 'Direct deployment / Tier-1 honors clearance'}
                        {tier.level === 'Strong' && 'Recommended for honors subject to targeted optimizations'}
                        {tier.level === 'Promising' && 'Incubation grant with telemetry remediation review'}
                        {tier.level === 'Needs Improvement' && 'Resubmission requested with complete fault resolution'}
                        {tier.level === 'Weak' && 'Non-viable thesis; reject or fundamental redesign'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anti-Black-Box Guarantee Box */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>The Anti-Black-Box Mandate (Core Design Philosophy)</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              ProjectX-Ray AI strictly forbids opaque numerical scoring. Every single score point assigned by the jury engine must satisfy three immutable conditions:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-sans">
              <li className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-1">
                <strong className="text-cyan-300 font-mono block">1. Provenance Requirement</strong>
                <span className="text-slate-400">Linked to raw video timestamp, physical sensor packet, code commit, or patent database ID.</span>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-1">
                <strong className="text-cyan-300 font-mono block">2. Reproducibility Proof</strong>
                <span className="text-slate-400">Independent scripts and benchmarking suites must be able to reproduce test assertions within ±5%.</span>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-1">
                <strong className="text-cyan-300 font-mono block">3. Multi-Perspective Peer Review</strong>
                <span className="text-slate-400">Deliberated across 4 distinct AI jury personas with dissenting opinions recorded in the dossier.</span>
              </li>
            </ul>
          </div>

        </div>
      )}
    </div>
  );
};

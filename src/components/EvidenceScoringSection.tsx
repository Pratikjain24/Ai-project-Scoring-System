import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  GitCommit, 
  Scale, 
  AlertOctagon, 
  Check, 
  Hash,
  Fingerprint,
  Layers
} from 'lucide-react';

export const EvidenceScoringSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Multimodal Observation',
      desc: 'Isolates qualitative speech, visual demonstration, and stated performance metrics.',
      icon: <Layers className="w-4 h-4 text-cyan-400" />
    },
    {
      num: '02',
      title: 'Deep Web Cross-Check',
      desc: 'Searches 240M+ papers and USPTO patents to verify originality of algorithm or circuit.',
      icon: <Search className="w-4 h-4 text-violet-400" />
    },
    {
      num: '03',
      title: 'Sandbox Replication',
      desc: 'Executes benchmark code in isolated micro-VMs to verify throughput, memory, and latency.',
      icon: <GitCommit className="w-4 h-4 text-emerald-400" />
    },
    {
      num: '04',
      title: 'Deterministic Rubric',
      desc: 'Applies institutional weighted grading with zero subjective or mood-based scoring drift.',
      icon: <Scale className="w-4 h-4 text-amber-400" />
    },
    {
      num: '05',
      title: 'Cryptographic Citation',
      desc: 'Every point earned or deducted is linked to a video second, code line, or literature DOI.',
      icon: <Fingerprint className="w-4 h-4 text-cyan-400" />
    }
  ];

  return (
    <section id="evidence-scoring" className="py-24 relative bg-[#080B12] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>THE CHAIN OF EVIDENCE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            Why Generic LLMs Fail, and Why <span className="text-gradient-cyan">Evidence-Backed Scoring</span> Wins.
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Standard AI models hallucinate plausible-sounding critique, accept marketing hyperbole, and lack real-world verification sandboxes. ProjectX-Ray AI enforces an unbroken chain of forensic proof.
          </p>
        </div>

        {/* Comparison: Generic AI vs ProjectX-Ray AI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Flawed Generic LLM */}
          <div className="p-7 rounded-2xl bg-rose-950/10 border border-rose-500/20 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-bold font-mono">
                <AlertOctagon className="w-4 h-4" />
                <span>GENERIC LLM / UNVERIFIED SCORING</span>
              </div>
              <span className="text-rose-400 font-mono text-[10px] uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded">
                Unreliable
              </span>
            </div>
            <ul className="space-y-3 font-sans text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Believes hand-waved performance claims (e.g., "99.9% accuracy") without verifying underlying test splits or code execution.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Vulnerable to presentation charisma, slide graphic gloss, and persuasive phrasing over engineering rigor.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Subject to prompt drift: rating changes wildly if asked the same question in a different temperature or context window.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Produces vague platitudes like "Great project, consider improving scalability" with no actionable line-level guidance.</span>
              </li>
            </ul>
          </div>

          {/* ProjectX-Ray AI */}
          <div className="p-7 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>PROJECTX-RAY AI FORENSIC JURY</span>
              </div>
              <span className="text-cyan-300 font-mono text-[10px] uppercase tracking-wider bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                Institutional Standard
              </span>
            </div>
            <ul className="space-y-3 font-sans text-slate-200">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Runs code inside Firecracker micro-VMs to empirically reproduce latency, throughput, and accuracy claims.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Scans 240M+ papers and patent databases to verify if the architecture is novel or a cloned tutorial.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Every single grade is anchored to an auditable citation: video timestamp [MM:SS] or source code line number.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Generates an engineering-first remediation roadmap with effort estimates and precise architectural fixes.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5-Step Chain of Evidence Flow */}
        <div className="p-8 rounded-2xl bg-[#0B0F17] border border-white/10 relative overflow-hidden">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display">
              The 5-Step Chain of Evidence Verification
            </h3>
            <span className="text-xs font-mono text-cyan-400">UNBROKEN AUDIT TRAIL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] relative space-y-2 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    {step.num}
                  </span>
                  {step.icon}
                </div>
                <h4 className="text-sm font-bold text-white font-display pt-1">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Cryptographic Hash Guarantee Footnote */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jury Evaluation Manifest Hash: <span className="text-slate-200">sha256:7f83b165...9ac4</span></span>
            </div>
            <span className="text-emerald-400 font-semibold">FERPA & Institutional Audit Compliant</span>
          </div>
        </div>
      </div>
    </section>
  );
};

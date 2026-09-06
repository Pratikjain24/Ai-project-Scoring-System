import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070B] border-t border-white/[0.08] text-slate-400 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 p-1.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <div className="absolute w-4 h-[1px] bg-cyan-400/80" />
                <div className="absolute h-4 w-[1px] bg-cyan-400/80" />
              </div>
              <span className="font-display font-bold text-base text-white tracking-tight">
                ProjectX-Ray<span className="text-cyan-400">.AI</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The institutional-grade autonomous project jury for software, hardware, and deep tech. Auditing code, schematics, and claims with empirical cryptographic citations.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">
                Jury Cluster v4.2 Online • 99.98% Verification Uptime
              </span>
            </div>
          </div>

          {/* Links Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-white font-mono uppercase tracking-wider text-[11px] font-bold">
              Jury Engine
            </h4>
            <ul className="space-y-2">
              <li><a href="#pipeline" className="hover:text-cyan-300 transition-colors">Analysis Pipeline</a></li>
              <li><a href="#dual-track" className="hover:text-cyan-300 transition-colors">Software AST Audit</a></li>
              <li><a href="#dual-track" className="hover:text-cyan-300 transition-colors">Hardware & KiCad DRC</a></li>
              <li><a href="#modalities" className="hover:text-cyan-300 transition-colors">Live Camera Telemetry</a></li>
              <li><a href="#evidence-scoring" className="hover:text-cyan-300 transition-colors">Chain of Evidence</a></li>
            </ul>
          </div>

          {/* Links Col 2: Institutional */}
          <div className="space-y-3">
            <h4 className="text-white font-mono uppercase tracking-wider text-[11px] font-bold">
              Solutions
            </h4>
            <ul className="space-y-2">
              <li><a href="#scorecard" className="hover:text-cyan-300 transition-colors">Hackathon Organizers</a></li>
              <li><a href="#scorecard" className="hover:text-cyan-300 transition-colors">University Capstone Juries</a></li>
              <li><a href="#scorecard" className="hover:text-cyan-300 transition-colors">Grant & Angel Due Diligence</a></li>
              <li><a href="#scorecard" className="hover:text-cyan-300 transition-colors">Enterprise Innovation Labs</a></li>
              <li><a href="#scorecard" className="hover:text-cyan-300 transition-colors">Accreditation Auditing</a></li>
            </ul>
          </div>

          {/* Links Col 3: Compliance & Research */}
          <div className="space-y-3">
            <h4 className="text-white font-mono uppercase tracking-wider text-[11px] font-bold">
              Research & Trust
            </h4>
            <ul className="space-y-2">
              <li><span className="text-slate-300">FERPA & SOC2 Ready</span></li>
              <li><span className="text-slate-300">ArXiv & USPTO Integration</span></li>
              <li><span className="text-slate-300">Zero-Hallucination Sandbox</span></li>
              <li><span className="text-slate-300">Cryptographic Citations</span></li>
              <li><span className="text-slate-300">Adversarial Juror Consensus</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} ProjectX-Ray AI, Inc. All rights reserved. Built for institutional project evaluation.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Diligence</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

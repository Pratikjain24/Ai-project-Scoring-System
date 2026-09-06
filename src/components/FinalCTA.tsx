import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  CheckCircle2
} from 'lucide-react';

interface FinalCTAProps {
  onStartEvaluation: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartEvaluation }) => {
  const [projectUrl, setProjectUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onStartEvaluation();
    }, 600);
  };

  return (
    <section className="py-24 relative bg-[#080C14] border-t border-white/[0.06] overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL DEPLOYMENT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight mb-6 leading-tight">
            Elevate Your Hackathon, Incubator, or Defense to <span className="text-gradient-cyan">Institutional Grade</span>.
          </h2>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace subjective grading fatigue with objective, auditable truth. Evaluate code, circuits, and presentations with zero human bias.
          </p>

          {/* Quick Input Bar */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl focus-within:border-cyan-500/50 transition-all">
              <div className="flex items-center gap-2 px-3 text-slate-400 w-full sm:w-auto flex-1">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="github.com/org/repo or pitch video URL..."
                  className="w-full bg-transparent border-none outline-none text-white text-xs sm:text-sm font-mono placeholder:text-slate-500 py-2"
                />
              </div>
              <button
                type="submit"
                disabled={analyzing}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
              >
                {analyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Start Evaluation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Human Fatigue</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Full Patent & ArXiv Cross-Check</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
              <span>Instant Auditable Scorecard</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

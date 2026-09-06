import React from 'react';
import { 
  Award, 
  X, 
  ArrowRight, 
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EvaluationVerdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionDuration: number;
  onViewDossier: () => void;
}

export const EvaluationVerdictModal: React.FC<EvaluationVerdictModalProps> = ({
  isOpen,
  onClose,
  sessionDuration,
  onViewDossier,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mins = Math.floor(sessionDuration / 60);
  const secs = sessionDuration % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#090D16] border border-white/10 shadow-2xl overflow-hidden my-8 p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Demo Disclaimer */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Info className="w-3.5 h-3.5" />
          <span>DEMO EVALUATION COMPLETE // SIMULATED VERDICT</span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white">
            Live Jury Evaluation Concluded
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Session Duration: {timeFormatted} • Ingestion Manifest Sealed
          </p>
        </div>

        {/* Score Highlight Box */}
        <div className="p-5 rounded-2xl bg-black/60 border border-white/10 text-center space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            Live Deliberation Verdict
          </span>
          <div className="text-4xl font-extrabold font-mono text-gradient-emerald">
            91.8 / 100
          </div>
          <p className="text-xs font-mono text-emerald-400 font-bold">
            Institutional Tier 1 High Distinction Recommended
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto font-sans">
            5 of 6 presentation claims verified in isolated micro-VM. Technical explanation and physical probe evidence confirmed.
          </p>
        </div>

        {/* Quick Highlights list */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 text-[10px]">Presentation Clarity</span>
            <p className="text-white font-bold text-sm">88% (Optimal)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 text-[10px]">Speech Cadence</span>
            <p className="text-white font-bold text-sm">138 WPM</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 text-[10px]">Technical Rigor</span>
            <p className="text-white font-bold text-sm">94% (High)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="text-slate-400 text-[10px]">Claim Accuracy</span>
            <p className="text-white font-bold text-sm">91% Verified</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onViewDossier}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Inspect Full Evidence Dossier</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <span>Return to Live Feed</span>
          </button>
        </div>
      </div>
    </div>
  );
};

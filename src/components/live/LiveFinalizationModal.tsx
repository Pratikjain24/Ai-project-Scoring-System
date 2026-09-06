import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Loader2
} from 'lucide-react';
import type { LiveSessionFinalizationResult } from '../../types/liveJury';

interface LiveFinalizationModalProps {
  finalResult: LiveSessionFinalizationResult | null;
  isProcessing: boolean;
  onViewReport: () => void;
  onClose: () => void;
}

export const LiveFinalizationModal: React.FC<LiveFinalizationModalProps> = ({
  finalResult,
  isProcessing,
  onViewReport,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    if (!isProcessing) {
      setActiveStep(4);
      return;
    }

    const t1 = setTimeout(() => setActiveStep(2), 600);
    const t2 = setTimeout(() => setActiveStep(3), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isProcessing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {isProcessing || !finalResult ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-white">Finalizing Live AI Jury Evaluation</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Aggregating live transcript, demo events, and claims into the ProjectX-Ray Master Scoring Engine.
            </p>

            {/* Stepper */}
            <div className="mt-8 space-y-3 text-left max-w-md mx-auto">
              <div className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition ${
                activeStep >= 1 ? 'bg-slate-950/80 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
              }`}>
                {activeStep > 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
                <span>1. Correlating spoken claims with Project DNA</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition ${
                activeStep >= 2 ? 'bg-slate-950/80 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
              }`}>
                {activeStep > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : activeStep === 2 ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                <span>2. Ingesting live hardware demo telemetry</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition ${
                activeStep >= 3 ? 'bg-slate-950/80 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
              }`}>
                {activeStep > 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : activeStep === 3 ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                <span>3. Ratifying Master Scoring Engine baseline (83.7)</span>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition ${
                activeStep >= 4 ? 'bg-slate-950/80 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
              }`}>
                {activeStep === 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                <span>4. Generating Final Phase 10 Intelligence Report</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Live AI Jury Evaluation Ratified
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Official deterministic score calculated and verified by ProjectX-Ray AI.
              </p>
            </div>

            {/* Score Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden shadow-inner">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Final Official Master Score
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
                  {finalResult.finalScore.toFixed(1)}
                </span>
                <span className="text-xl text-slate-500 font-light">/ 100</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERDICT: {finalResult.verdict}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500">Evidence Confidence</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {finalResult.confidence > 1 ? `${finalResult.confidence}%` : `${Math.round(finalResult.confidence * 100)}%`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500">Evidence Indexed</div>
                <div className="text-base font-bold text-cyan-400 mt-0.5">
                  {finalResult.totalEvidenceCount} Citations
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500">Live Claims Corroborated</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {finalResult.verifiedClaimsCount} Verified
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500">Flagged Gaps</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {finalResult.unverifiedClaimsCount} Unverified
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={onViewReport}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <FileText className="w-4 h-4" />
                Open Full Project Intelligence Report
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Return to Live Room Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

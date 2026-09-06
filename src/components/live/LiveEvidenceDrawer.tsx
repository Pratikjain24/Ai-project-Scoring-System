import React from 'react';
import { 
  X, 
  FileText, 
  Cpu, 
  Target,
  Sparkles
} from 'lucide-react';
import type { LiveObservation, LiveClaimOccurrence, LiveDemoEvent, LiveJudgeQuestion } from '../../types/liveJury';

interface LiveEvidenceDrawerProps {
  item: LiveObservation | LiveClaimOccurrence | LiveDemoEvent | LiveJudgeQuestion | null;
  type: 'OBSERVATION' | 'CLAIM' | 'DEMO' | 'QUESTION' | null;
  onClose: () => void;
}

export const LiveEvidenceDrawer: React.FC<LiveEvidenceDrawerProps> = ({
  item,
  type,
  onClose
}) => {
  if (!item || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                {type === 'OBSERVATION' && <Sparkles className="w-4 h-4" />}
                {type === 'CLAIM' && <Target className="w-4 h-4" />}
                {type === 'DEMO' && <Cpu className="w-4 h-4" />}
                {type === 'QUESTION' && <FileText className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {type} Evidence Detail
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {'timestampFormatted' in item ? item.timestampFormatted : 'suggestedAtFormatted' in item ? item.suggestedAtFormatted : '00:00'}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="py-6 space-y-5">
            {type === 'OBSERVATION' && (
              <>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Observation Title
                  </div>
                  <div className="text-base font-bold text-white">
                    {(item as LiveObservation).title}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Detailed Findings</div>
                  <div className="text-sm text-slate-200 leading-relaxed">
                    {(item as LiveObservation).description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-xs text-slate-500">Category</div>
                    <div className="text-sm font-semibold text-cyan-400 mt-0.5">
                      {(item as LiveObservation).category}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-xs text-slate-500">Confidence Score</div>
                    <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                      {Math.round((item as LiveObservation).confidence * 100)}%
                    </div>
                  </div>
                </div>
              </>
            )}

            {type === 'CLAIM' && (
              <>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Verbal Claim Statement
                  </div>
                  <div className="text-base font-bold text-cyan-300">
                    "{(item as LiveClaimOccurrence).claimText}"
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Spoken Snippet</div>
                  <div className="text-sm text-slate-300 italic">
                    "{(item as LiveClaimOccurrence).transcriptSnippet}"
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Occurrence Classification:</span>
                    <span className="font-semibold text-white">
                      {(item as LiveClaimOccurrence).occurrenceType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Repetition Frequency:</span>
                    <span className="font-semibold text-white">
                      {(item as LiveClaimOccurrence).repeatCount}x spoken
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Corroboration Confidence:</span>
                    <span className="font-semibold text-emerald-400">
                      {Math.round((item as LiveClaimOccurrence).confidence * 100)}%
                    </span>
                  </div>
                </div>
              </>
            )}

            {type === 'DEMO' && (
              <>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Demonstrated Feature
                  </div>
                  <div className="text-base font-bold text-white">
                    {(item as LiveDemoEvent).feature}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Observed Telemetry</div>
                  <div className="text-sm text-slate-200">
                    {(item as LiveDemoEvent).observedBehavior}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                  <div className="text-slate-400">Physical Hardware:</div>
                  <div className="font-semibold text-cyan-400">
                    {(item as LiveDemoEvent).hardwareInvolved || 'NVIDIA Jetson Orin Nano Edge Unit'}
                  </div>
                </div>
              </>
            )}

            {type === 'QUESTION' && (
              <>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Judge Inquiry
                  </div>
                  <div className="text-base font-bold text-amber-300">
                    {(item as LiveJudgeQuestion).question}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Why This Was Asked (Evidence Gap)</div>
                  <div className="text-sm text-slate-200">
                    {(item as LiveJudgeQuestion).reason}
                  </div>
                </div>

                {(item as LiveJudgeQuestion).answerText && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-900/40">
                    <div className="text-xs font-semibold text-cyan-400 mb-1">Presenter Response</div>
                    <div className="text-sm text-slate-300 italic">
                      "{(item as LiveJudgeQuestion).answerText}"
                    </div>
                    {(item as LiveJudgeQuestion).answerCompleteness && (
                      <div className="mt-2 text-xs font-semibold text-emerald-400">
                        Completeness: {(item as LiveJudgeQuestion).answerCompleteness?.replace(/_/g, ' ')}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

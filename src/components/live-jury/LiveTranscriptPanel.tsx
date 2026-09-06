import React from 'react';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Bot 
} from 'lucide-react';
import { INITIAL_TRANSCRIPT } from '../../data/liveJuryData';

interface LiveTranscriptPanelProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const LiveTranscriptPanel: React.FC<LiveTranscriptPanelProps> = ({
  isVisible,
  onToggleVisibility,
}) => {
  return (
    <div className="rounded-3xl bg-[#090D16] border border-white/10 p-5 shadow-2xl space-y-3">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">
            Live Synchronized Audio Transcript
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            DEMO DATA
          </span>
        </div>

        <button
          onClick={onToggleVisibility}
          className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
        >
          <span>{isVisible ? 'Collapse' : 'Expand'}</span>
          {isVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Transcript Body */}
      {isVisible && (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {INITIAL_TRANSCRIPT.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-xl border text-xs font-sans space-y-1 ${
                entry.isQuestion
                  ? 'bg-amber-500/10 border-amber-500/30 text-white'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 font-bold">
                  {entry.speaker === 'AI Juror Core' ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300">{entry.speaker}</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300">{entry.speaker}</span>
                    </>
                  )}
                </div>
                <span className="text-slate-400">{entry.timestamp}</span>
              </div>
              <p className="leading-relaxed">{entry.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

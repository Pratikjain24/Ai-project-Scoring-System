import React, { useState } from 'react';
import { 
  Mic, 
  MessageSquareWarning, 
  Clock, 
  FileText
} from 'lucide-react';
import type { 
  PresentationAnalysisData, 
  SpeechMetric, 
  PresentationEvent 
} from '../../types/presentationDemo';
import { SpeechMetricCards } from './SpeechMetricCards';

interface PresentationAnalysisSectionProps {
  presentation: PresentationAnalysisData;
  onSelectEvent: (event: PresentationEvent) => void;
  onSelectMetric: (metric: SpeechMetric) => void;
}

export const PresentationAnalysisSection: React.FC<PresentationAnalysisSectionProps> = ({
  presentation,
  onSelectEvent,
  onSelectMetric,
}) => {
  const [selectedTimelineFilter, setSelectedTimelineFilter] = useState<'all' | 'slide-transition' | 'key-assertion' | 'filler-cluster'>('all');

  const speechMetricsList: SpeechMetric[] = [
    presentation.clarity,
    presentation.speakingPace,
    presentation.confidence,
    presentation.fillerWords,
    presentation.explanationStructure,
    presentation.eyeContact,
    presentation.posture,
    presentation.audienceEngagement,
    presentation.timeManagement,
  ];

  const filteredTimeline = presentation.timeline.filter((event) => {
    if (selectedTimelineFilter === 'all') return true;
    return event.type === selectedTimelineFilter;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'slide-transition':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'key-assertion':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'filler-cluster':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'q-and-a':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Speech & Delivery Metrics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Presentation & Speech Delivery Analysis (9 Dimensions)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Evaluated via multi-modal speech spectrograms, Whisper transcription, and gaze vector tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Delivery Score:</span>
          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
            {presentation.overallScore} / 100
          </span>
        </div>
      </div>

      {/* Overall Observation Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider block">
            Speech Rate
          </span>
          <div className="text-xl font-bold font-mono text-cyan-400">142 WPM</div>
          <span className="text-[10px] font-mono text-slate-400">Optimal (130-150)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider block">
            Filler Frequency
          </span>
          <div className="text-xl font-bold font-mono text-amber-400">Moderate</div>
          <span className="text-[10px] font-mono text-slate-400">1.8 / minute</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider block">
            Talking Time
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">78%</div>
          <span className="text-[10px] font-mono text-slate-400">Active articulation</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider block">
            Pause Time
          </span>
          <div className="text-xl font-bold font-mono text-indigo-400">22%</div>
          <span className="text-[10px] font-mono text-slate-400">Cadence pauses</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider block">
            Structure
          </span>
          <div className="text-xl font-bold font-mono text-purple-400">7 Sections</div>
          <span className="text-[10px] font-mono text-slate-400">Full lifecycle</span>
        </div>
      </div>
      <SpeechMetricCards
        metrics={speechMetricsList}
        onInspectEvidence={onSelectMetric}
      />

      {/* 3. Deep Dive: Filler Word Analysis Strip */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <MessageSquareWarning className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Filler Word & Verbal Hesitation Breakdown
            </h4>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">
              Total Detected: <strong className="text-white">{presentation.fillerWords.totalCount}</strong>
            </span>
            <span className="text-slate-400">
              Frequency: <strong className="text-amber-400">{presentation.fillerWords.perMinute} / min</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presentation.fillerWords.breakdown.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-amber-300">
                  "{item.word}"
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                  {item.count} occurrences
                </span>
              </div>

              <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-400">
                {item.timestamps.map((ts, tIdx) => (
                  <span key={tIdx} className="bg-amber-950/40 border border-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                    {ts}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Timeline of Presentation Events */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Second-by-Second Presentation Narrative Timeline
            </h4>
          </div>

          {/* Timeline filter pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {(['all', 'slide-transition', 'key-assertion', 'filler-cluster'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedTimelineFilter(filter)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedTimelineFilter === filter
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Events' : filter.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="space-y-3 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
          {filteredTimeline.map((event) => (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className="relative pl-14 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
            >
              {/* Timeline marker */}
              <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    [{event.timestamp}]
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {event.title}
                  </span>
                  {event.slideNumber && (
                    <span className="text-[10px] font-mono text-slate-500">
                      (Slide {event.slideNumber})
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold shrink-0 ${getEventBadge(event.type)}`}>
                  {event.type}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {event.description}
              </p>

              {/* Speaker quote box */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2 text-[11px] font-mono text-slate-400 italic">
                <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>"{event.speakerQuote}"</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

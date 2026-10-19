import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  AlertTriangle,
  Layers,
  Cpu,
  Tv,
  Search,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import type {
  VideoEntity,
  VideoSegment,
  TranscriptSegment,
  VisualEvent,
  AnalysisEvent,
  TimelineEventType,
} from '../../types/multimodal';

interface MultimodalVideoAnalyzerProps {
  video: VideoEntity;
  segments: VideoSegment[];
  transcript: TranscriptSegment[];
  visualEvents: VisualEvent[];
  timeline: AnalysisEvent[];
  initialTimestamp?: number;
  onSeekRequested?: (timestamp: number) => void;
}

export const MultimodalVideoAnalyzer: React.FC<MultimodalVideoAnalyzerProps> = ({
  video,
  segments,
  transcript,
  visualEvents,
  timeline,
  initialTimestamp = 0,
  onSeekRequested,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(initialTimestamp);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [transcriptSearch, setTranscriptSearch] = useState<string>('');

  const duration = video?.durationSeconds || 600;
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeTranscriptRef = useRef<HTMLDivElement>(null);

  // Derive active segment and transcript segment directly from currentTime
  const activeSegment = useMemo(() => {
    return (segments || []).find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    ) || null;
  }, [currentTime, segments]);

  const activeTranscript = useMemo(() => {
    return (transcript || []).find(
      (t) => currentTime >= t.startTime && currentTime <= t.endTime
    ) || null;
  }, [currentTime, transcript]);

  // Playback timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return Math.min(duration, prev + 0.25 * playbackSpeed);
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, duration]);

  // Handle external seek requests
  useEffect(() => {
    if (initialTimestamp > 0) {
      const timer = setTimeout(() => {
        setCurrentTime(initialTimestamp);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialTimestamp]);

  const seekTo = (seconds: number) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(clamped);
    onSeekRequested?.(clamped);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getEventBadge = (type: TimelineEventType) => {
    switch (type) {
      case 'DEMO':
        return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'DEMO' };
      case 'CLAIM':
        return { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', label: 'CLAIM' };
      case 'TECHNICAL_MENTION':
        return { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', label: 'TECH' };
      case 'ERROR':
        return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: 'ERROR' };
      case 'RESULT':
        return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'RESULT' };
      case 'SLIDE_CHANGE':
        return { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', label: 'SLIDE' };
      default:
        return { bg: 'bg-slate-700/40 text-slate-300 border-slate-600/40', label: type };
    }
  };

  const filteredTimeline = selectedEventType === 'ALL'
    ? timeline
    : timeline.filter((e) => e.eventType === selectedEventType);

  const filteredTranscript = transcriptSearch.trim()
    ? transcript.filter((t) => t.text.toLowerCase().includes(transcriptSearch.toLowerCase()))
    : transcript;

  // Determine demo overlays at specific timestamps
  const isPotholeDetectionDemo = currentTime >= 360 && currentTime <= 430;
  const isHardwareInteraction = currentTime >= 295 && currentTime <= 325;
  const isBufferOverrunWarning = currentTime >= 420 && currentTime <= 440;
  const isPowerMeterObservation = currentTime >= 465 && currentTime <= 495;

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification and Ethics status */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-900/60 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Multimodal Video Analysis Engine
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                ANALYSIS COMPLETE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                DEMO DATA
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Source: <span className="text-slate-200">{video.fileReference}</span> · Resolution: {video.resolution} @ {video.fps}fps · Format: {video.format}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSegment && (
            <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                {activeSegment.segmentType.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          <span className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Main 2-Column Quad Layout: Left (Video Player) & Right (AI Observations) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Video Player & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-3xl bg-black/90 border border-white/15 overflow-hidden shadow-2xl flex flex-col justify-between group">
            {/* Simulated Live Frame Viewport with Dynamic Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-10" />

            {/* Video Viewport Background Art / Feed Simulation */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px]" />

              {/* Dynamic Viewport Display depending on stage */}
              <div className="text-center p-6 space-y-3 z-0">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Tv className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold font-mono text-slate-200">
                    {activeSegment?.segmentType.replace(/_/g, ' ') || 'PRESENTATION RECORDING'}
                  </h4>
                  <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                    {activeTranscript?.text.slice(0, 95) || 'Audio telemetry streaming & timestamped playback.'}...
                  </p>
                </div>
              </div>

              {/* Real-time Simulated Bounding Box HUD when in Feature Demo */}
              {isPotholeDetectionDemo && (
                <div className="absolute top-1/4 left-1/3 w-48 h-32 border-2 border-emerald-400 rounded-lg bg-emerald-500/10 backdrop-blur-[1px] animate-pulse pointer-events-none z-20 flex flex-col justify-between p-1.5 shadow-lg shadow-emerald-500/20">
                  <span className="text-[9px] font-mono font-bold text-black bg-emerald-400 px-1 py-0.5 rounded self-start">
                    POTHOLE: 94.2% conf (22.4ms)
                  </span>
                  <div className="flex justify-between items-end text-[8px] font-mono text-emerald-300">
                    <span>LAT: 40.7128° N</span>
                    <span>LNG: 74.0060° W</span>
                  </div>
                </div>
              )}

              {/* Hardware Connection Overlay */}
              {isHardwareInteraction && (
                <div className="absolute bottom-16 left-6 p-2 rounded-xl bg-black/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono flex items-center gap-2 z-20 shadow-xl">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Jetson Orin Nano USB-C Initialized · 1280 CUDA Cores Active</span>
                </div>
              )}

              {/* Buffer Overrun Warning Overlay */}
              {isBufferOverrunWarning && (
                <div className="absolute top-6 right-6 p-2.5 rounded-xl bg-amber-950/90 border border-amber-500/50 text-amber-200 text-[10px] font-mono flex items-center gap-2 z-20 shadow-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Frame buffer overrun: dropped 2 frames (Recovered)</span>
                </div>
              )}

              {/* Power Meter Readout Overlay */}
              {isPowerMeterObservation && (
                <div className="absolute bottom-16 right-6 p-2 rounded-xl bg-black/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center gap-2 z-20 shadow-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Active Power: 11.2W @ 42.8 FPS</span>
                </div>
              )}
            </div>

            {/* Top Viewport Status Bar */}
            <div className="relative z-20 p-4 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-black/60 border border-white/10 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Synchronized Video Stream
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-300">
                  {playbackSpeed}x
                </span>
              </div>
            </div>

            {/* Bottom In-Video Control Bar */}
            <div className="relative z-20 p-4 space-y-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
              {/* Scrub Bar */}
              <div className="space-y-1">
                <div
                  className="relative h-2 rounded-full bg-white/20 cursor-pointer overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    seekTo(pct * duration);
                  }}
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Button Strip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-md"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => seekTo(currentTime - 10)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => seekTo(currentTime + 10)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
                    title="Forward 10s"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        playbackSpeed === spd
                          ? 'bg-cyan-500 text-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                  <button
                    onClick={() => seekTo(0)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                    title="Reset to 00:00"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Observations Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl flex flex-col h-[400px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
                  AI Observations & Visual Events
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {visualEvents.length} Observable Events
              </span>
            </div>

            {/* Observable Events Scroll Area */}
            <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1 scrollbar-thin">
              {visualEvents.map((v) => {
                const isActive = Math.abs(currentTime - v.timestamp) < 15;
                return (
                  <div
                    key={v.id}
                    onClick={() => seekTo(v.timestamp)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                        <Clock className="w-3 h-3" />
                        {formatTime(v.timestamp)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {v.hardwareConfidence && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                            HW: {v.hardwareConfidence}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 text-[9px]">
                          {v.confidence} CONF
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                        {v.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER / FULL WIDTH: Unified Analysis Timeline */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Unified Multimodal Analysis Timeline
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Correlated stream combining scenes, speech, technical claims, demo events, and system errors.
            </p>
          </div>

          {/* Event Type Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'DEMO', 'CLAIM', 'TECHNICAL_MENTION', 'ERROR', 'SLIDE_CHANGE'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedEventType(f)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  selectedEventType === f
                    ? 'bg-cyan-500 text-black'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Visual Timeline Rail */}
        <div className="relative pt-6 pb-2">
          {/* Horizontal Base Bar */}
          <div className="h-2 rounded-full bg-white/10 relative">
            {/* Scrubber indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg pointer-events-none transition-all z-20"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />

            {/* Event Pins */}
            {timeline.map((evt) => {
              const leftPct = (evt.timestamp / duration) * 100;
              const badge = getEventBadge(evt.eventType);
              const isSelected = Math.abs(currentTime - evt.timestamp) < 5;

              return (
                <button
                  key={evt.id}
                  onClick={() => seekTo(evt.timestamp)}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border transition-all z-10 ${
                    badge.bg
                  } ${isSelected ? 'scale-150 ring-2 ring-cyan-400' : 'hover:scale-125'}`}
                  style={{ left: `${leftPct}%` }}
                  title={`${formatTime(evt.timestamp)} - ${evt.eventType}: ${evt.description}`}
                />
              );
            })}
          </div>

          {/* Time markers */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>00:00 (Intro)</span>
            <span>02:30</span>
            <span>05:00 (Tech)</span>
            <span>07:30 (Demo)</span>
            <span>10:00 (Q&A)</span>
          </div>
        </div>

        {/* Timeline Event Chips Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
          {filteredTimeline.map((evt) => {
            const badge = getEventBadge(evt.eventType);
            const isNear = Math.abs(currentTime - evt.timestamp) < 10;
            return (
              <div
                key={evt.id}
                onClick={() => seekTo(evt.timestamp)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isNear
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md'
                    : 'bg-black/30 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded border ${badge.bg} font-bold`}>
                    {badge.label}
                  </span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(evt.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-2 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: Interactive Synchronized Transcript */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Tv className="w-4 h-4 text-cyan-400" />
              Synchronized Presentation Speech Transcript
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Click any spoken sentence to instantly seek video and view evidence alignment.
            </p>
          </div>

          {/* Transcript Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={transcriptSearch}
              onChange={(e) => setTranscriptSearch(e.target.value)}
              placeholder="Search transcript keywords..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Timestamped Transcript Flow */}
        <div
          ref={transcriptContainerRef}
          className="max-h-72 overflow-y-auto space-y-2 pr-2 scrollbar-thin"
        >
          {filteredTranscript.map((t) => {
            const isCurrentlySpoken = currentTime >= t.startTime && currentTime <= t.endTime;
            return (
              <div
                key={t.id}
                ref={isCurrentlySpoken ? activeTranscriptRef : null}
                onClick={() => seekTo(t.startTime)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isCurrentlySpoken
                    ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                    : 'bg-black/20 border-white/5 hover:border-white/15 hover:bg-black/40'
                }`}
              >
                <div className="shrink-0 text-right space-y-1">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-400 font-bold block">
                    {formatTime(t.startTime)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    {t.speakerTag || 'SPEAKER'}
                  </span>
                </div>

                <div className="flex-1">
                  <p
                    className={`text-xs leading-relaxed ${
                      isCurrentlySpoken
                        ? 'text-cyan-200 font-medium'
                        : 'text-slate-300'
                    }`}
                  >
                    "{t.text}"
                  </p>
                </div>

                <div className="shrink-0 flex items-center text-slate-500 hover:text-cyan-400">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

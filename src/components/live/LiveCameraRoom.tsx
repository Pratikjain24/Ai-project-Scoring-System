import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Pause, 
  Play, 
  StopCircle, 
  Clock, 
  Sparkles, 
  Send, 
  Bookmark, 
  Flag, 
  MessageSquare, 
  Target, 
  LogOut
} from 'lucide-react';
import type { 
  LiveJurySession, 
  LiveEvent, 
  LiveObservation, 
  LiveTranscriptSegment, 
  LiveClaimOccurrence, 
  LiveDemoEvent, 
  LiveJudgeQuestion, 
  LiveJudgeNote, 
  LiveScoreSnapshot, 
  LiveSessionFinalizationResult,
  LiveCameraSource
} from '../../types/liveJury';
import { api } from '../../services/api';
import { LiveEvidenceDrawer } from './LiveEvidenceDrawer';
import { LiveFinalizationModal } from './LiveFinalizationModal';

interface LiveCameraRoomProps {
  evaluationId: string;
  projectName: string;
  cameraSource: LiveCameraSource;
  onViewReport: () => void;
  onLeaveRoom: () => void;
}

export const LiveCameraRoom: React.FC<LiveCameraRoomProps> = ({
  evaluationId,
  projectName,
  cameraSource,
  onViewReport,
  onLeaveRoom,
}) => {
  // Session State
  const [session, setSession] = useState<LiveJurySession | null>(null);
  const [snapshot, setSnapshot] = useState<LiveScoreSnapshot | null>(null);
  const [role, setRole] = useState<'PRESENTER' | 'JUDGE'>('JUDGE');
  const [layoutMode, setLayoutMode] = useState<'CAMERA' | 'SCREEN' | 'SPLIT'>('SPLIT');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);

  // Time tracking
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(240); // 04:00
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Live Streams
  const [transcriptSegments, setTranscriptSegments] = useState<LiveTranscriptSegment[]>([]);
  const [observations, setObservations] = useState<LiveObservation[]>([]);
  const [claims, setClaims] = useState<LiveClaimOccurrence[]>([]);
  const [demoEvents, setDemoEvents] = useState<LiveDemoEvent[]>([]);
  const [judgeQuestions, setJudgeQuestions] = useState<LiveJudgeQuestion[]>([]);
  const [judgeNotes, setJudgeNotes] = useState<LiveJudgeNote[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);

  // Interactive Note Input
  const [noteInput, setNoteInput] = useState<string>('');
  const [isFlaggingConcern, setIsFlaggingConcern] = useState<boolean>(false);

  // Drawer & Modal State
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<'OBSERVATION' | 'CLAIM' | 'DEMO' | 'QUESTION' | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [finalizationResult, setFinalizationResult] = useState<LiveSessionFinalizationResult | null>(null);

  // References
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const canvasElemRef = useRef<HTMLCanvasElement>(null);

  // Initialize Session
  useEffect(() => {
    async function init() {
      try {
        const startRes = await api.startLiveSession(evaluationId, cameraSource);
        if (startRes?.session) {
          setSession(startRes.session);
          setElapsedSeconds(startRes.session.durationSeconds || 240);
        }
        refreshData();
      } catch (err) {
        console.error('Failed to init live jury session:', err);
      }
    }
    init();
  }, [evaluationId, cameraSource]);

  // Periodic Refresh
  const refreshData = async () => {
    try {
      const [
        sess,
        snap,
        trans,
        obs,
        clms,
        demos,
        quests,
        evs
      ] = await Promise.all([
        api.getLiveSession(evaluationId),
        api.getLiveScoreSnapshot(evaluationId),
        api.getLiveTranscript(evaluationId),
        api.getLiveObservations(evaluationId),
        api.getLiveClaims(evaluationId),
        api.getLiveDemoEvents(evaluationId),
        api.getLiveQuestions(evaluationId),
        api.getLiveEvents(evaluationId)
      ]);

      if (sess) setSession(sess);
      if (snap) setSnapshot(snap);
      if (trans) setTranscriptSegments(trans);
      if (obs) setObservations(obs);
      if (clms) setClaims(clms);
      if (demos) setDemoEvents(demos);
      if (quests) setJudgeQuestions(quests);
      if (evs) setEvents(evs);
    } catch (err) {
      console.error('Failed polling live room data:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [evaluationId]);

  // Session clock
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptSegments]);

  // Edge-AI Video Canvas Simulation Animation
  useEffect(() => {
    const canvas = canvasElemRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let angle = 0;

    const render = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw simulated road perspective
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.45, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.1, canvas.height);
      ctx.moveTo(canvas.width * 0.55, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.9, canvas.height);
      ctx.stroke();

      // Road dash line
      ctx.setLineDash([12, 16]);
      ctx.strokeStyle = '#38bdf840';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.5, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.5, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pothole Detection Bounding Box
      const boxX = canvas.width * 0.38 + Math.sin(angle) * 10;
      const boxY = canvas.height * 0.62;
      const boxW = 110;
      const boxH = 65;

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Corner tags
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(boxX - 2, boxY - 2, 8, 4);
      ctx.fillRect(boxX - 2, boxY - 2, 4, 8);
      ctx.fillRect(boxX + boxW - 6, boxY - 2, 8, 4);
      ctx.fillRect(boxX + boxW - 2, boxY - 2, 4, 8);

      // Label
      ctx.fillStyle = '#06b6d4ee';
      ctx.fillRect(boxX, boxY - 20, 110, 18);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('POTHOLE_01 96.4%', boxX + 4, boxY - 7);

      // Telemetry HUD
      ctx.fillStyle = '#0f172ae0';
      ctx.fillRect(16, 16, 170, 72);
      ctx.strokeStyle = '#0ea5e940';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, 170, 72);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('JETSON ORIN NANO', 24, 32);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('INFERENCE: 23.4 ms', 24, 48);
      ctx.fillText('THROUGHPUT: 42.6 FPS', 24, 62);
      ctx.fillText('TENSORRT FP16: OK', 24, 76);

      angle += 0.02;
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Format Timer
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Actions
  const handleTogglePause = async () => {
    if (isPaused) {
      await api.resumeLiveSession(evaluationId);
      setIsPaused(false);
    } else {
      await api.pauseLiveSession(evaluationId);
      setIsPaused(true);
    }
  };

  const handleAskQuestion = async (qId: string) => {
    await api.askLiveQuestion(evaluationId, qId, elapsedSeconds);
    await refreshData();
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    const added = await api.addLiveJudgeNote(
      evaluationId,
      noteInput.trim(),
      isFlaggingConcern,
      false,
      elapsedSeconds
    );

    if (added) {
      setJudgeNotes(prev => [added, ...prev]);
      setNoteInput('');
      setIsFlaggingConcern(false);
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      const res = await api.endLiveSession(evaluationId);
      setFinalizationResult(res);
    } catch (err) {
      console.error('Finalize error:', err);
      setIsFinalizing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* 1. TOP STATUS BAR */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-black tracking-widest text-red-400 uppercase">
              LIVE JURY ROOM
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="text-xs font-bold text-white">{projectName}</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
              ORIN NANO EDGE HUD
            </span>
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-sm font-bold text-white tracking-wider">
            {formatTimer(elapsedSeconds)}
          </span>
          <span className="text-xs font-mono text-slate-500">/ 10:00</span>
          {isPaused && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
              PAUSED
            </span>
          )}
        </div>

        {/* Right: Controls & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Toggle */}
          <div className="hidden sm:flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setRole('PRESENTER')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                role === 'PRESENTER' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Presenter
            </button>
            <button
              onClick={() => setRole('JUDGE')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                role === 'JUDGE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Judge
            </button>
          </div>

          {/* Quick Media Controls */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg border transition ${
              isMuted ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-2 rounded-lg border transition ${
              isVideoOff ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          <button
            onClick={handleTogglePause}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
            title={isPaused ? 'Resume Evaluation' : 'Pause Evaluation'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Finalize Button */}
          <button
            onClick={handleFinalize}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition active:scale-95"
          >
            <StopCircle className="w-4 h-4" />
            Finalize Evaluation
          </button>

          {/* Leave Room Button */}
          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Leave Evaluation Room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN SPLIT STAGE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT / CENTER: Video & Presentation Stage (7 or 8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 p-4 border-r border-slate-800/80 overflow-hidden">
          {/* Video Container */}
          <div className="relative flex-1 bg-black rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Edge AI Simulated or Actual Video */}
            <canvas 
              ref={canvasElemRef} 
              width={1280} 
              height={720} 
              className="w-full h-full object-contain"
            />

            {/* Floating Live Claim Banner */}
            {claims.length > 0 && (
              <div className="absolute top-4 left-4 right-4 sm:right-auto max-w-md bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md rounded-xl p-3 shadow-2xl animate-fadeIn">
                <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Correlated Verbal Claim
                </div>
                <div className="text-xs font-semibold text-white">
                  "{claims[claims.length - 1].claimText}"
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Classification: <strong className="text-cyan-300">{claims[claims.length - 1].occurrenceType}</strong></span>
                  <span>•</span>
                  <span>Confidence: <strong className="text-emerald-400">92%</strong></span>
                </div>
              </div>
            )}

            {/* Layout Toggle Overlay */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setLayoutMode('CAMERA')}
                className={`px-2 py-1 text-[11px] rounded font-medium ${
                  layoutMode === 'CAMERA' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Camera
              </button>
              <button
                onClick={() => setLayoutMode('SCREEN')}
                className={`px-2 py-1 text-[11px] rounded font-medium ${
                  layoutMode === 'SCREEN' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                HUD Feed
              </button>
              <button
                onClick={() => setLayoutMode('SPLIT')}
                className={`px-2 py-1 text-[11px] rounded font-medium ${
                  layoutMode === 'SPLIT' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                PiP Telemetry
              </button>
            </div>
          </div>

          {/* Bottom Dock: Live Streaming Transcript & Event Timeline */}
          <div className="h-48 mt-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-xl">
            {/* Timeline Scrub Indicators */}
            <div className="pb-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Live Event Markers ({events.length})
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Claims</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Demos</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Inquiries</span>
              </div>
            </div>

            {/* Streaming Transcript Log */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-2">
              {transcriptSegments.map((seg) => (
                <div key={seg.id} className="text-xs leading-relaxed flex items-start gap-2">
                  <span className="font-mono text-[10px] text-slate-500 shrink-0 mt-0.5">
                    {seg.timestampFormatted}
                  </span>
                  <span className="font-semibold text-cyan-400 shrink-0">
                    {seg.speaker}:
                  </span>
                  <span className={seg.isFinal ? 'text-slate-200' : 'text-slate-400 italic'}>
                    {seg.text}
                  </span>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: AI Jury Observations, Adaptive Questions, & Judge Controls (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 flex flex-col h-full overflow-y-auto border-l border-slate-800/80 p-4 space-y-4">
          {/* 1. Provisional Score Snapshot Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Real-Time Provisional Range
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                STABLE
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                {snapshot?.provisionalScoreRange || '80–85'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>

            <div className="mt-1 text-[11px] text-slate-500 leading-tight">
              Provisional live indicators. Deterministic Master Score ratified upon session finalization.
            </div>

            {/* Indicator Meters */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-400">Evidence Coverage:</span>
                <span className="float-right font-bold text-cyan-400">88%</span>
              </div>
              <div>
                <span className="text-slate-400">Claim Validation:</span>
                <span className="float-right font-bold text-emerald-400">84%</span>
              </div>
              <div>
                <span className="text-slate-400">Demos ({demoEvents.length}):</span>
                <span className="float-right font-bold text-cyan-400">92%</span>
              </div>
              <div>
                <span className="text-slate-400">Session Status:</span>
                <span className="float-right font-bold text-emerald-400">{session?.status || 'LIVE'}</span>
              </div>
            </div>
          </div>

          {/* 2. Adaptive Judge Inquiries ("ASK NOW") */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Adaptive Judge Questions ({judgeQuestions.length})
              </h3>
              <span className="text-[10px] text-slate-500">Auto-suggested</span>
            </div>

            <div className="space-y-3">
              {judgeQuestions.map((q) => (
                <div key={q.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-amber-300 leading-snug">
                    "{q.question}"
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Reason: </span>{q.reason}
                  </div>

                  {q.status === 'SUGGESTED' ? (
                    <button
                      onClick={() => handleAskQuestion(q.id)}
                      className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Ask Presenter Now
                    </button>
                  ) : q.status === 'ASKED' ? (
                    <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                      <span className="animate-pulse">●</span> Question presented — listening for answer...
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                      <div className="text-emerald-400 font-semibold">
                        Status: {q.answerCompleteness?.replace(/_/g, ' ')}
                      </div>
                      <div className="text-slate-400 italic">
                        "{q.answerText}"
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Prioritized AI Observations Stream */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Prioritized Observations ({observations.length})
            </h3>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 max-h-56">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  onClick={() => {
                    setDrawerItem(obs);
                    setDrawerType('OBSERVATION');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500">{obs.timestampFormatted}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      obs.severity === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                      obs.severity === 'ALERT' ? 'bg-red-500/10 text-red-400' :
                      obs.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {obs.category}
                    </span>
                  </div>
                  <div className="font-bold text-white line-clamp-1">{obs.title}</div>
                  <div className="text-slate-400 text-[11px] line-clamp-2">{obs.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Judge Controls & Private Notes */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
              Judge Private Notes
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Log private note, flagged risk, or question for deliberations..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none h-16"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsFlaggingConcern(!isFlaggingConcern)}
                  className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded transition ${
                    isFlaggingConcern ? 'bg-red-500/20 text-red-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  Flag Concern
                </button>

                <button
                  type="submit"
                  disabled={!noteInput.trim()}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition"
                >
                  Log Note
                </button>
              </div>
            </form>

            {/* Past notes */}
            {judgeNotes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 max-h-24 overflow-y-auto">
                {judgeNotes.map(n => (
                  <div key={n.id} className="text-[11px] p-1.5 rounded bg-slate-900/60 border border-slate-800/60 text-slate-300 flex items-start gap-1.5">
                    <span className="font-mono text-slate-500 text-[10px]">{n.timestampFormatted}</span>
                    <span className="flex-1">{n.note}</span>
                    {n.flaggedConcern && <Flag className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Evidence Inspection Drawer */}
      <LiveEvidenceDrawer
        item={drawerItem}
        type={drawerType}
        onClose={() => {
          setDrawerItem(null);
          setDrawerType(null);
        }}
      />

      {/* 4. Finalization Modal */}
      {isFinalizing && (
        <LiveFinalizationModal
          finalResult={finalizationResult}
          isProcessing={!finalizationResult}
          onViewReport={onViewReport}
          onClose={() => {
            setIsFinalizing(false);
          }}
        />
      )}
    </div>
  );
};

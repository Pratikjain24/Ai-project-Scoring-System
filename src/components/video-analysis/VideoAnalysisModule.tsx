import React, { useState, useEffect, useRef } from 'react';
import { VideoUploader } from './VideoUploader';
import { ProcessingTimeline } from './ProcessingTimeline';
import { AnalysisControls } from './AnalysisControls';
import { AnalysisSummaryDossier } from './AnalysisSummaryDossier';
import { 
  INITIAL_PIPELINE_STAGES, 
  type PipelineStage, 
  type VideoMetadata 
} from '../../types/videoAnalysis';
import { ArrowLeft, Sparkles, ShieldCheck, Video as VideoIcon } from 'lucide-react';

interface VideoAnalysisModuleProps {
  onBackToOverview: () => void;
  onViewDossier: () => void;
  onViewProjectDNA?: () => void;
}

export const VideoAnalysisModule: React.FC<VideoAnalysisModuleProps> = ({
  onBackToOverview,
  onViewDossier,
  onViewProjectDNA,
}) => {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_PIPELINE_STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Calculate overall progress across 11 stages
  const completedStages = stages.filter((s) => s.status === 'Completed' || s.status === 'Warning').length;
  const runningStage = stages.find((s) => s.status === 'Running');
  const runningProgress = runningStage ? runningStage.progress / 11 : 0;
  const overallProgress = Math.min(100, Math.round((completedStages / 11) * 100 + runningProgress));

  // Step runner for the 11 stages
  useEffect(() => {
    if (!isProcessing || isPaused || isCompleted) return;

    if (currentStageIndex === -1) {
      setCurrentStageIndex(0);
      setStages((prev) =>
        prev.map((s, idx) => (idx === 0 ? { ...s, status: 'Running', progress: 10 } : s))
      );
      return;
    }

    if (currentStageIndex >= stages.length) {
      setIsProcessing(false);
      setIsCompleted(true);
      return;
    }

    const stage = stages[currentStageIndex];
    if (stage.progress < 100) {
      timerRef.current = window.setTimeout(() => {
        setStages((prev) =>
          prev.map((s, idx) => {
            if (idx === currentStageIndex) {
              const nextP = Math.min(100, s.progress + 25);
              return { ...s, progress: nextP };
            }
            return s;
          })
        );
      }, 250);
    } else {
      // Stage is 100%, mark as Completed (or Warning for stage 6 claim check for realism)
      const finalStatus = currentStageIndex === 5 ? 'Warning' : 'Completed';
      setStages((prev) =>
        prev.map((s, idx) =>
          idx === currentStageIndex ? { ...s, status: finalStatus, progress: 100 } : s
        )
      );

      // Advance to next stage
      const nextIndex = currentStageIndex + 1;
      if (nextIndex < stages.length) {
        timerRef.current = window.setTimeout(() => {
          setCurrentStageIndex(nextIndex);
          setStages((prev) =>
            prev.map((s, idx) => (idx === nextIndex ? { ...s, status: 'Running', progress: 15 } : s))
          );
        }, 300);
      } else {
        setIsProcessing(false);
        setIsCompleted(true);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isProcessing, isPaused, isCompleted, currentStageIndex, stages]);

  const handleStartAnalysis = () => {
    if (!video) return;
    setIsProcessing(true);
    setIsPaused(false);
    setIsCompleted(false);
    setCurrentStageIndex(0);
    setStages(INITIAL_PIPELINE_STAGES.map((s, idx) => (idx === 0 ? { ...s, status: 'Running', progress: 15 } : s)));
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleFastForward = () => {
    setIsProcessing(false);
    setIsPaused(false);
    setIsCompleted(true);
    setCurrentStageIndex(stages.length);
    setStages(
      stages.map((s, idx) => ({
        ...s,
        status: idx === 5 ? 'Warning' : 'Completed',
        progress: 100,
      }))
    );
  };

  const handleReset = () => {
    setIsProcessing(false);
    setIsPaused(false);
    setIsCompleted(false);
    setCurrentStageIndex(-1);
    setStages(INITIAL_PIPELINE_STAGES);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-24">
      {/* Top Bar */}
      <div className="w-full border-b border-white/10 bg-[#080B12]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 font-mono text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Platform Overview</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <VideoIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Deep Video & Artifact Analysis Engine</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Agent Consensus Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Module Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ASYNCHRONOUS DEEP TRIAL // MODE B</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Video & Presentation Analysis Engine
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            Upload a recorded presentation, product demo, or defense pitch deck. The AI jury executes an 11-stage forensic workflow across speech, visual diagrams, code benchmarks, and prior art databases.
          </p>
        </div>

        {/* 1. Drag & Drop Video Uploader */}
        <VideoUploader
          video={video}
          onVideoSelected={(meta) => {
            setVideo(meta);
            handleReset();
          }}
          onRemoveVideo={() => {
            setVideo(null);
            handleReset();
          }}
          isProcessing={isProcessing}
        />

        {/* 2. Analysis Execution Controls & Global Progress */}
        <AnalysisControls
          isProcessing={isProcessing}
          isPaused={isPaused}
          isCompleted={isCompleted}
          overallProgress={overallProgress}
          currentStageNumber={currentStageIndex >= 0 ? Math.min(11, currentStageIndex + 1) : 1}
          totalStages={11}
          onStart={handleStartAnalysis}
          onPauseToggle={handlePauseToggle}
          onFastForward={handleFastForward}
          onReset={handleReset}
          hasVideo={Boolean(video)}
        />

        {/* 3. Completed Final Summary Dossier (shown when 11 stages complete) */}
        {isCompleted && (
          <AnalysisSummaryDossier 
            onViewFullDossier={onViewDossier} 
            onViewProjectDNA={onViewProjectDNA}
          />
        )}

        {/* 4. 11-Stage Processing Timeline */}
        <ProcessingTimeline
          stages={stages}
          currentStageIndex={currentStageIndex}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

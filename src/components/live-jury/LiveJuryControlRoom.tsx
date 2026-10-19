import React, { useState, useEffect } from 'react';
import { ControlRoomHeader } from './ControlRoomHeader';
import { CameraFeedPanel } from './CameraFeedPanel';
import { LiveMetricsPanel } from './LiveMetricsPanel';
import { ClaimDetectionPanel } from './ClaimDetectionPanel';
import { LiveTranscriptPanel } from './LiveTranscriptPanel';
import { EvidenceStatusPanel } from './EvidenceStatusPanel';
import { EvaluationVerdictModal } from './EvaluationVerdictModal';

export interface LiveJuryControlRoomProps {
  onBackToOverview: () => void;
  onViewDossier: () => void;
  evaluationId?: string;
  transcript?: any;
  metrics?: any;
  claims?: any;
  evidenceStatus?: any;
}

export const LiveJuryControlRoom: React.FC<LiveJuryControlRoomProps> = ({
  onBackToOverview,
  onViewDossier,
  transcript,
  metrics,
  claims,
  evidenceStatus,
}) => {
  const [timerSeconds, setTimerSeconds] = useState(272); // Starts at 04:32 for realism
  const [isPaused, setIsPaused] = useState(false);
  const [isExpandedCamera, setIsExpandedCamera] = useState(false);
  const [transcriptVisible, setTranscriptVisible] = useState(true);
  const [showVerdictModal, setShowVerdictModal] = useState(false);

  // Timer interval
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleToggleExpandCamera = () => {
    setIsExpandedCamera((prev) => !prev);
  };

  const handleToggleTranscript = () => {
    setTranscriptVisible((prev) => !prev);
  };

  const handleEndEvaluation = () => {
    setIsPaused(true);
    setShowVerdictModal(true);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between">
      {/* Control Room Top Status Header */}
      <ControlRoomHeader
        timerSeconds={timerSeconds}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onEndEvaluation={handleEndEvaluation}
        onBackToOverview={onBackToOverview}
        isExpandedCamera={isExpandedCamera}
        onToggleExpandCamera={handleToggleExpandCamera}
      />

      {/* Main Control Room Grid Workspace */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Main Grid: Left Video / Right Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Large Camera Feed Panel */}
          <div className={isExpandedCamera ? 'lg:col-span-12' : 'lg:col-span-7'}>
            <CameraFeedPanel
              isExpanded={isExpandedCamera}
              onToggleExpand={handleToggleExpandCamera}
            />
          </div>

          {/* Small AI Analysis & Metrics Panel */}
          {!isExpandedCamera && (
            <div className="lg:col-span-5">
              <LiveMetricsPanel metrics={metrics} />
            </div>
          )}
        </div>

        {/* Secondary Grid: Claims & Streaming Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Current Claim Detection Panel */}
          <div className="lg:col-span-6">
            <ClaimDetectionPanel claims={claims} />
          </div>

          {/* Live Audio Transcript Panel */}
          <div className="lg:col-span-6">
            <LiveTranscriptPanel
              isVisible={transcriptVisible}
              onToggleVisibility={handleToggleTranscript}
              transcript={transcript}
            />
          </div>
        </div>

        {/* Evidence Status Panel */}
        <div>
          <EvidenceStatusPanel evidenceStatus={evidenceStatus} />
        </div>
      </div>

      {/* Evaluation Verdict Summary Modal */}
      <EvaluationVerdictModal
        isOpen={showVerdictModal}
        onClose={() => setShowVerdictModal(false)}
        sessionDuration={timerSeconds}
        onViewDossier={onViewDossier}
      />
    </div>
  );
};

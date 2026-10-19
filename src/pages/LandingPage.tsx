import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { DualTrackSection } from '../components/DualTrackSection';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { EvidenceScoringSection } from '../components/EvidenceScoringSection';
import { ModalitiesSection } from '../components/ModalitiesSection';
import { PipelineVisualization } from '../components/PipelineVisualization';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartEvaluation = () => {
    navigate('/new-evaluation');
  };

  const handleSeeHowItWorks = () => {
    const el = document.getElementById('pipeline');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Marketing Navigation Bar */}
      <Navbar
        activeView="landing"
        onOpenEvaluationModal={() => navigate('/new-evaluation')}
        onOpenSubmissionCenter={() => navigate('/new-evaluation')}
        onOpenLiveJury={() => navigate('/evaluations/smart-road-vision/live')}
        onOpenVideoAnalysis={() => navigate('/evaluations/smart-road-vision/presentation')}
        onOpenProjectDNA={() => navigate('/evaluations/smart-road-vision/project')}
        onOpenTechnicalAudit={() => navigate('/evaluations/smart-road-vision/technical')}
        onOpenOriginality={() => navigate('/evaluations/smart-road-vision/originality')}
        onOpenClaimVerification={() => navigate('/evaluations/smart-road-vision/claims')}
        onOpenImpactFeasibility={() => navigate('/evaluations/smart-road-vision/impact')}
        onOpenPresentationDemo={() => navigate('/evaluations/smart-road-vision/presentation')}
        onOpenAIJury={() => navigate('/evaluations/smart-road-vision/jury')}
        onOpenDossier={() => navigate('/evaluations/smart-road-vision/report')}
        onOpenCommandPalette={() => {
          const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
          window.dispatchEvent(event);
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with interactive live HUD preview */}
        <Hero
          onStartEvaluation={handleStartEvaluation}
          onSeeHowItWorks={handleSeeHowItWorks}
        />

        {/* Dual Track Architecture (Software vs Hardware Rigs) */}
        <DualTrackSection />

        {/* Multimodal Jury Ingestion Capabilities */}
        <ModalitiesSection />

        {/* 11-Stage Pipeline Visualization */}
        <div id="pipeline">
          <PipelineVisualization />
        </div>

        {/* 6-Dimension Feature Grid */}
        <FeaturesGrid />

        {/* Evidence Scoring & Proof Pillars */}
        <EvidenceScoringSection />

        {/* Final Call to Action */}
        <FinalCTA onStartEvaluation={handleStartEvaluation} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;

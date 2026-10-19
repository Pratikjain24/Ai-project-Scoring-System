import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Video,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Cpu,
  Code2,
  Layers,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StepIndicator } from '../components/ui/StepIndicator';
import type { Step } from '../components/ui/StepIndicator';
import { UploadZone } from '../components/ui/UploadZone';
import type { UploadedFile } from '../components/ui/UploadZone';
import { api } from '../services/api';
import { EvaluationStreamView } from '../components/pipeline/EvaluationStreamView';

export const NewEvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Streaming State for Fast-Path Demo Mode
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingData, setStreamingData] = useState<{
    evalId: string;
    projectId: string;
    projectName: string;
    domain: string;
    architectureType: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    projectName: 'Smart Road Vision',
    projectType: 'Software' as 'Software' | 'Hardware' | 'Hybrid' | 'Biomedical',
    category: 'AI / Computer Vision',
    domain: 'Smart Cities & Municipal Transit Mobility',
    problemStatement: 'Municipalities waste $4.2B annually repairing potholes reactively after vehicular damage or severe accidents have already transpired.',
    projectDescription: 'Edge-deployed computer vision model running on municipal transit fleet cameras to detect, classify, and geo-index asphalt degradation with millimeter precision before structural failure.',
    teamName: 'VisionGrid Labs (MIT / Stanford cohort)',
  });


  const [files, setFiles] = useState<UploadedFile[]>([
    { id: '1', name: 'SmartRoadVision_Architecture_PitchDeck.pptx', size: '14.2 MB', type: 'ppt', progress: 100 },
    { id: '2', name: 'Field_Evaluation_Telemetry_Results.pdf', size: '4.8 MB', type: 'pdf', progress: 100 },
    { id: '3', name: 'Jetson_Orin_Edge_Inference_Benchmark.mp4', size: '48.5 MB', type: 'video', progress: 100 },
  ]);

  const [evalMode, setEvalMode] = useState<'live-camera' | 'video-analysis'>('video-analysis');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const steps: Step[] = [
    { id: 1, name: 'Project Info', description: 'Core details & scope' },
    { id: 2, name: 'Evidence', description: 'Decks, code, papers' },
    { id: 3, name: 'Evaluation Mode', description: 'Camera or video' },
    { id: 4, name: 'Review & Launch', description: 'Multi-agent check' },
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const PRESETS = [
    {
      id: 'cybershield',
      name: 'CyberShield Zero-Trust Mesh',
      type: 'Software' as const,
      category: 'Cybersecurity / Distributed Systems',
      domain: 'Cloud Native Infrastructure Defense',
      problem: 'Traditional perimeter security fails to prevent lateral traversal once an internal container or node is compromised.',
      solution: 'Linux eBPF resident monitor enforcing identity-authenticated mutual TLS microsegmentation at wire speed with zero context switches.',
      team: 'ZeroPoint Labs',
      filePrefix: 'CyberShield_eBPF'
    },
    {
      id: 'bioprint-osteo',
      name: 'BioPrint OsteoScaffold',
      type: 'Hardware' as const,
      category: 'BioTech / 3D Biomaterial Printing',
      domain: 'Orthopedic Regenerative Implants',
      problem: 'Severe bone fracture defects exceeding 5cm fail to heal spontaneously and autografts cause secondary donor-site morbidity in 28% of patients.',
      solution: 'Extrusion 3D bioprinter fabricating hydroxyapatite/polycaprolactone bioresorbable lattices with pore gradients matching trabecular bone.',
      team: 'OsteoForm Biomechanics',
      filePrefix: 'BioPrint_Tissue'
    },
    {
      id: 'agrosense',
      name: 'AgroSense Autonomous Soil Rig',
      type: 'Hardware' as const,
      category: 'AgriTech / Embedded IoT',
      domain: 'Precision Agriculture & Soil Health Telemetry',
      problem: 'Excess nitrogen fertilizer runoff pollutes groundwater and accounts for 18% of avoidable commercial farm operational expenses.',
      solution: 'Autonomous solar-powered field probe equipped with ISFET chemical sensors and LoRaWAN long-range mesh radio transmitting root-zone telemetry every 15 minutes.',
      team: 'TerraLogic Agronomics',
      filePrefix: 'AgroSense_LoRa'
    },
    {
      id: 'aeropulse-px4',
      name: 'AeroPulse PX-4 Drone Engine',
      type: 'Hardware' as const,
      category: 'Aerospace / Autonomous Robotics',
      domain: 'Heavy-Lift UAV Hybrid Propulsion',
      problem: 'Commercial inspection drones lack flight endurance beyond 35 minutes and lack deterministic hardware failover against rotor ESC lockup.',
      solution: 'Compact multi-fuel turbine generator feeding direct-drive brushless motors controlled via ASIL-D lockstep ARM microcontrollers.',
      team: 'AeroPulse Flight Technologies',
      filePrefix: 'AeroPulse_UAV'
    },
    {
      id: 'smart-road-vision',
      name: 'Smart Road Vision',
      type: 'Software' as const,
      category: 'AI / Computer Vision',
      domain: 'Smart Cities & Municipal Transit Mobility',
      problem: 'Municipalities waste $4.2B annually repairing potholes reactively after vehicular damage or severe accidents have already transpired.',
      solution: 'Edge-deployed computer vision model running on municipal transit fleet cameras to detect, classify, and geo-index asphalt degradation with millimeter precision before structural failure.',
      team: 'VisionGrid Labs (MIT / Stanford cohort)',
      filePrefix: 'SmartRoadVision'
    }
  ];

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData({
      projectName: preset.name,
      projectType: preset.type,
      category: preset.category,
      domain: preset.domain,
      problemStatement: preset.problem,
      projectDescription: preset.solution,
      teamName: preset.team,
    });
    setFiles([
      { id: '1', name: `${preset.filePrefix}_Architecture_Specification.pdf`, size: '8.4 MB', type: 'pdf', progress: 100 },
      { id: '2', name: `${preset.filePrefix}_Source_Repo_Archive.zip`, size: '24.1 MB', type: 'doc', progress: 100 },
      { id: '3', name: `${preset.filePrefix}_Telemetry_Benchmark.mp4`, size: '36.8 MB', type: 'video', progress: 100 },
    ]);
  };

  const handleStartEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const baseSlug = formData.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `new-proj-${Date.now()}`;
      const slug = baseSlug;
      const createdProj = await api.createProject({
        id: slug,
        name: formData.projectName,
        architectureType: formData.projectType.toUpperCase(),
        category: formData.category,
        domain: formData.domain,
        problemStatement: formData.problemStatement,
        solutionDescription: formData.projectDescription,
        teamName: formData.teamName,
      }).catch(() => ({ id: slug }));

      const projectId = createdProj?.id || slug;
      const createdEval = await api.createEvaluation({
        projectId,
        mode: evalMode === 'live-camera' ? 'LIVE_CAMERA' : 'VIDEO_ANALYSIS',
      }).catch(() => ({ id: `eval_${projectId}` }));

      const evalId = createdEval?.id || `eval_${projectId}`;
      await api.startEvaluation(evalId, { fastMode: true, stageDelayMs: 1400 }).catch(() => {});

      // Switch to real-time animated streaming progress UI
      setStreamingData({
        evalId,
        projectId,
        projectName: formData.projectName,
        domain: formData.domain,
        architectureType: formData.projectType,
      });
      setIsStreaming(true);
    } catch (err) {
      console.warn('[NewEvaluationPage] Starting streaming view with local state:', err);
      const evalId = `eval_${Date.now()}`;
      setStreamingData({
        evalId,
        projectId: 'smart-road-vision',
        projectName: formData.projectName,
        domain: formData.domain,
        architectureType: formData.projectType,
      });
      setIsStreaming(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isStreaming && streamingData) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStreaming(false)}
            className="text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Return to Form</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/evaluations/${streamingData.projectId}`)}
            className="text-xs"
          >
            <span>Open Evaluation Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <EvaluationStreamView
          evaluationId={streamingData.evalId}
          projectId={streamingData.projectId}
          projectName={streamingData.projectName}
          projectDomain={streamingData.domain}
          architectureType={streamingData.architectureType}
          onCompleted={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New ProjectX-Ray Evaluation Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
          Initialize AI Evaluation Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Submit software repos, hardware schematics, pitch decks, and presentation media for autonomous jury scrutiny.
        </p>

        {/* Demo Day Presets Bar */}
        <div className="pt-2">
          <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center justify-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Demo Day Fast Presets (1-Click Real-Time Scrutiny):</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-all ${
                  formData.projectName === p.name
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Step Indicator */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={(s) => s <= currentStep && setCurrentStep(s)}
        />
      </div>

      {/* Step Content */}
      <div className="min-h-[420px]">
        {/* STEP 1: Project Information */}
        {currentStep === 1 && (
          <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                Step 1: Project Metadata & Problem Definition
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide foundational context so the AI Jury understands target domain constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g. Smart Road Vision"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-1">
                  Project Architecture Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: 'Software' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                      formData.projectType === 'Software'
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Software</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: 'Hardware' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                      formData.projectType === 'Hardware'
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 shrink-0" />
                    <span>Hardware</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: 'Hybrid' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                      formData.projectType === 'Hybrid'
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>Hybrid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: 'Biomedical' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                      formData.projectType === 'Biomedical'
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    <span>Biomedical</span>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-1">
                  Primary Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. AI / Computer Vision, Embedded IoT"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-1">
                  Target Domain / Industry *
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="e.g. Smart Cities, Healthcare, Aerospace"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Team Name */}
              <div>
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-1">
                  Team Name / Affiliation *
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="e.g. VisionGrid Labs (MIT / Stanford cohort)"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Problem Statement */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-1">
                  Problem Statement *
                </label>
                <textarea
                  rows={2}
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  placeholder="What severe problem does this project address?"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Project Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-1">
                  Detailed Solution Description *
                </label>
                <textarea
                  rows={3}
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="How does your architecture solve this problem?"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>
            </div>
          </Card>
        )}

        {/* STEP 2: Evidence Upload */}
        {currentStep === 2 && (
          <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                Step 2: Evidence & Artifact Intake
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload pitch decks, technical whitepapers, architectural schematics, or video demonstrations.
              </p>
            </div>

            <UploadZone
              onFilesChange={(f) => setFiles(f)}
            />
          </Card>
        )}

        {/* STEP 3: Evaluation Mode */}
        {currentStep === 3 && (
          <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                Step 3: Choose Evaluation Modality
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select whether ProjectX-Ray will judge a live camera presentation stream or an uploaded recording.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* LIVE CAMERA */}
              <div
                onClick={() => setEvalMode('live-camera')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  evalMode === 'live-camera'
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 mb-4">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-slate-100">
                      LIVE CAMERA
                    </h4>
                    {evalMode === 'live-camera' && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evaluate a live presentation and demonstration in real time with acoustic pitch tracking and posture analysis.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Real-time speech & eye contact</span>
                  </div>
                  <div className="text-slate-400">Synchronized slide-to-speech alignment</div>
                </div>
              </div>

              {/* VIDEO ANALYSIS */}
              <div
                onClick={() => setEvalMode('video-analysis')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  evalMode === 'video-analysis'
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 mb-4">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-slate-100">
                      VIDEO ANALYSIS
                    </h4>
                    {evalMode === 'video-analysis' && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Upload a recorded project presentation. AI processes frame-accurate demo milestones and speech cadence.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Deep frame-by-frame forensics</span>
                  </div>
                  <div className="text-slate-400">Automated transcript & claim linking</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 4: Review & Start */}
        {currentStep === 4 && (
          <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                Step 4: Review Evaluation Scope & Dispatch Jury
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Confirm staged artifacts, evaluation dimensions, and autonomous verification engines.
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px] block">Project Name</span>
                <span className="font-bold text-slate-200 text-sm">{formData.projectName}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px] block">Architecture</span>
                <span className="font-mono text-cyan-400">{formData.projectType} • {formData.category}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px] block">Domain & Team</span>
                <span className="text-slate-300">{formData.domain} ({formData.teamName})</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px] block">Selected Evaluation Mode</span>
                <span className="font-mono uppercase font-semibold text-emerald-400">
                  {evalMode === 'live-camera' ? 'Live Camera Forensics' : 'Asynchronous Video Forensics'}
                </span>
              </div>
            </div>

            {/* Staged Artifacts */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block mb-2">
                Staged Ingestion Artifacts ({files.length} items)
              </span>
              <div className="flex flex-wrap gap-2">
                {files.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate max-w-xs">{f.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Enabled Evaluation Dimensions */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block mb-2">
                Active AI Jury Rubric Categories
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['Technical Architecture', 'Originality Scans', 'Claim Verification', 'Presentation Forensics', 'Impact & Feasibility', 'Demo Validation', 'Judge Cross-Exam', 'Master Dossier'].map((dim, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300 truncate">{dim}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-cyan-300">Evidence-Backed Guarantee: </span>
                Every score generated during this run will trace directly back to verified AST code tokens, timestamped presentation markers, and external patent/paper citations.
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          size="md"
          onClick={handleBack}
          disabled={currentStep === 1 || isEvaluating}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        {currentStep < 4 ? (
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            className="flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleStartEvaluation}
            isLoading={isEvaluating}
            className="flex items-center gap-2 shadow-xl shadow-cyan-500/30 px-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start AI Evaluation</span>
          </Button>
        )}
      </div>
    </div>
  );
};

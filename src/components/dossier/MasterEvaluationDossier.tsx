import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Dna, 
  AlertTriangle, 
  Cpu, 
  Fingerprint, 
  CheckCircle2, 
  Mic, 
  Video, 
  HeartHandshake, 
  DollarSign, 
  Leaf, 
  Wrench, 
  ShieldAlert, 
  Lightbulb, 
  Compass, 
  TrendingUp, 
  Gavel, 
  FileText, 
  BookOpen, 
  Scale, 
  Copy, 
  Check, 
  Sparkles
} from 'lucide-react';
import type { AudiencePreset, MasterDossierData } from '../../types/masterDossier';
import { MOCK_HARDWARE_DOSSIER, MOCK_SOFTWARE_DOSSIER } from '../../data/mockMasterDossier';
import { ReportHeader } from './ReportHeader';
import { EditorialSectionCard } from './EditorialSectionCard';
import { api } from '../../services/api';

export interface MasterEvaluationDossierProps {
  evaluationId?: string;
  onBackToOverview?: () => void;
  defaultProjectType?: 'software' | 'hardware';
  initialDossier?: Partial<MasterDossierData>;
  softwareDossier?: MasterDossierData;
  hardwareDossier?: MasterDossierData;
}

// The 20 explicit canonical sections (static module constant)
const DOSSIER_SECTIONS = [
  { id: 'sec-01-exec-summary', num: 1, title: 'Executive Summary', category: 'Overview', icon: Award },
  { id: 'sec-02-dna', num: 2, title: 'Project DNA', category: 'Architecture', icon: Dna },
  { id: 'sec-03-problem', num: 3, title: 'Problem Analysis', category: 'Foundation', icon: AlertTriangle },
  { id: 'sec-04-tech-audit', num: 4, title: 'Technical Audit', category: 'Engineering', icon: Cpu },
  { id: 'sec-05-originality', num: 5, title: 'Innovation & Originality', category: 'Intellectual Property', icon: Fingerprint },
  { id: 'sec-06-claims', num: 6, title: 'Claim Verification', category: 'Empirical Proof', icon: CheckCircle2 },
  { id: 'sec-07-presentation', num: 7, title: 'Presentation Analysis', category: 'Communication', icon: Mic },
  { id: 'sec-08-demo', num: 8, title: 'Demo Analysis', category: 'Execution', icon: Video },
  { id: 'sec-09-social-impact', num: 9, title: 'Social Impact', category: 'Humanitarian', icon: HeartHandshake },
  { id: 'sec-10-economic-impact', num: 10, title: 'Economic Impact', category: 'Market Value', icon: DollarSign },
  { id: 'sec-11-environmental-impact', num: 11, title: 'Environmental Impact', category: 'Sustainability', icon: Leaf },
  { id: 'sec-12-feasibility', num: 12, title: 'Feasibility & Readiness', category: 'TRL & Maturity', icon: Wrench },
  { id: 'sec-13-risks', num: 13, title: 'Risk Matrix', category: 'Vulnerabilities', icon: ShieldAlert },
  { id: 'sec-14-improvements', num: 14, title: 'Recommended Improvements', category: 'Coaching', icon: Lightbulb },
  { id: 'sec-15-future-scope', num: 15, title: 'Future Scope', category: 'Roadmap', icon: Compass },
  { id: 'sec-16-commercialization', num: 16, title: 'Commercialization Potential', category: 'Business Model', icon: TrendingUp },
  { id: 'sec-17-judge-questions', num: 17, title: 'Judge Questions', category: 'Defense Inquiries', icon: Gavel },
  { id: 'sec-18-evidence', num: 18, title: 'Evidence Locker', category: 'Provenance', icon: FileText },
  { id: 'sec-19-sources', num: 19, title: 'External Sources', category: 'Citations', icon: BookOpen },
  { id: 'sec-20-verdict', num: 20, title: 'Final AI Jury Verdict', category: 'Consensus', icon: Scale },
];

export const MasterEvaluationDossier: React.FC<MasterEvaluationDossierProps> = ({
  evaluationId,
  onBackToOverview,
  defaultProjectType = 'hardware',
  initialDossier,
  softwareDossier,
  hardwareDossier,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<'software' | 'hardware'>(defaultProjectType);
  const [selectedAudience, setSelectedAudience] = useState<AudiencePreset>('university');
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-01-exec-summary');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [liveDossier, setLiveDossier] = useState<any>(initialDossier || null);

  useEffect(() => {
    if (!evaluationId) return;
    let isMounted = true;
    api.getDossier(evaluationId)
      .then((data) => {
        if (data && isMounted) {
          setLiveDossier(data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [evaluationId]);

  const dossier: MasterDossierData = useMemo(() => {
    const base: MasterDossierData = selectedTrack === 'hardware'
      ? (hardwareDossier || (initialDossier as MasterDossierData) || MOCK_HARDWARE_DOSSIER)
      : (softwareDossier || (initialDossier as MasterDossierData) || MOCK_SOFTWARE_DOSSIER);

    if (!liveDossier) return base;

    return {
      ...base,
      ...liveDossier,
    };
  }, [selectedTrack, hardwareDossier, softwareDossier, initialDossier, liveDossier]);

  // Scrollspy observer to highlight active section in table of contents
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (let i = DOSSIER_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(DOSSIER_SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSectionId(DOSSIER_SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyQuestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(id);
    setTimeout(() => setCopiedQuestionId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-32 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Sticky Table of Contents Header for Mobile & Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Header Section (Project Name, Type, Date, Score, Verdict, Confidence, Actions) */}
        <ReportHeader
          dossier={dossier}
          activeTrack={selectedTrack}
          onSwitchTrack={setSelectedTrack}
          selectedAudience={selectedAudience}
          onChangeAudience={setSelectedAudience}
          onBackToOverview={onBackToOverview}
        />

        {/* Layout Grid: Sticky Sidebar Index (Desktop) + 20 Editorial Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* Left Column: Sticky Editorial Table of Contents (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 p-4 rounded-3xl bg-[#0B0F19]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
                <span className="font-bold text-white uppercase tracking-wider">
                  Table of Contents
                </span>
                <span className="text-cyan-400">
                  20 Sections
                </span>
              </div>

              {/* Navigation List */}
              <nav className="space-y-1">
                {DOSSIER_SECTIONS.map((sec) => {
                  const isActive = activeSectionId === sec.id;
                  const Icon = sec.icon;

                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-200 shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className="truncate">{sec.num}. {sec.title}</span>
                      </div>
                      <span className={`text-[10px] ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                        {sec.num < 10 ? `0${sec.num}` : sec.num}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Jury Panel Badge */}
              <div className="pt-3 border-t border-white/10 text-[11px] font-mono space-y-1 text-slate-400">
                <span className="text-slate-200 font-semibold block">Jury Panel:</span>
                {dossier.juryPanel.slice(0, 3).map((juror, idx) => (
                  <div key={idx} className="truncate text-slate-400">• {juror}</div>
                ))}
              </div>

            </div>
          </aside>

          {/* Right Column: 20 Full Editorial Sections (9 cols) */}
          <main className="lg:col-span-9 space-y-10">

            {/* 1. Executive Summary */}
            <EditorialSectionCard
              id="sec-01-exec-summary"
              num={1}
              title="Executive Summary"
              category="Overview"
              icon={Award}
              conclusions={dossier.executiveSummary.groundedConclusions}
            >
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <h3 className="text-base font-bold text-white leading-snug">
                  {dossier.executiveSummary.headline}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {dossier.executiveSummary.verdict}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Key Findings
                </h4>
                <ul className="grid grid-cols-1 gap-2">
                  {dossier.executiveSummary.keyFindings.map((finding, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-200 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                <strong className="font-mono font-bold uppercase tracking-wider block">Official Panel Recommendation:</strong>
                <p className="text-slate-300 font-sans">{dossier.executiveSummary.juryRecommendation}</p>
              </div>
            </EditorialSectionCard>

            {/* 2. Project DNA */}
            <EditorialSectionCard
              id="sec-02-dna"
              num={2}
              title="Project DNA"
              category="Architecture"
              icon={Dna}
              conclusions={dossier.projectDNA.groundedConclusions}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Domain</span>
                  <span className="text-white font-bold">{dossier.projectDNA.domain}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Project Type</span>
                  <span className="text-cyan-300 font-bold">{dossier.projectDNA.projectType}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Target Audience</span>
                  <span className="text-emerald-300 font-bold">{dossier.projectDNA.targetAudience}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Core Technology Stack</span>
                <div className="flex flex-wrap gap-2">
                  {dossier.projectDNA.coreStack.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Verified Inputs</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {dossier.projectDNA.inputs.map((inp, idx) => <li key={idx}>{inp}</li>)}
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Engineered Outputs</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {dossier.projectDNA.outputs.map((out, idx) => <li key={idx}>{out}</li>)}
                  </ul>
                </div>
              </div>
            </EditorialSectionCard>

            {/* 3. Problem Analysis */}
            <EditorialSectionCard
              id="sec-03-problem"
              num={3}
              title="Problem Analysis"
              category="Foundation"
              icon={AlertTriangle}
              conclusions={dossier.problemAnalysis.groundedConclusions}
            >
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">Core Problem Statement</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300 uppercase">
                    Severity: {dossier.problemAnalysis.severityLevel}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {dossier.problemAnalysis.problemStatement}
                </p>
                <div className="pt-2 text-xs text-slate-400 font-sans">
                  <strong className="text-slate-300">Baseline Deficiencies: </strong>
                  {dossier.problemAnalysis.baselineContext}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {dossier.problemAnalysis.targetPainPoints.map((pain, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">Pain Point #{idx + 1}</span>
                    <p className="font-sans leading-relaxed">{pain}</p>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 4. Technical Audit */}
            <EditorialSectionCard
              id="sec-04-tech-audit"
              num={4}
              title="Technical Audit"
              category="Engineering"
              icon={Cpu}
              conclusions={dossier.technicalAudit.groundedConclusions}
            >
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase">Audit Assessment</span>
                  <h4 className="text-base font-bold text-white">{dossier.technicalAudit.auditStatus}</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold font-mono text-cyan-400">{dossier.technicalAudit.score}</span>
                  <span className="text-xs font-mono text-slate-400"> / 100</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dossier.technicalAudit.subscores.map((sub, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{sub.category}</span>
                      <span className="font-mono font-bold text-cyan-400">{sub.score}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${sub.score}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{sub.verdict}</p>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 5. Innovation & Originality */}
            <EditorialSectionCard
              id="sec-05-originality"
              num={5}
              title="Innovation & Originality"
              category="Intellectual Property"
              icon={Fingerprint}
              conclusions={dossier.originalityInvestigation.groundedConclusions}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Originality Score</span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">{dossier.originalityInvestigation.originalityScore}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Similarity Index</span>
                  <span className="text-2xl font-extrabold text-slate-300 font-mono">{dossier.originalityInvestigation.similarityScore}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Prior Art Tier</span>
                  <span className="text-base font-bold text-cyan-300 font-mono block mt-1">{dossier.originalityInvestigation.tier}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Prior Art Differentiation</h4>
                {dossier.originalityInvestigation.priorArtHighlights.map((art, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{art.source}</span>
                      <span className="font-mono text-slate-400">{art.similarity}% match • {art.category}</span>
                    </div>
                    <p className="text-slate-300 font-sans"><strong className="text-cyan-300 font-mono">Inventive Step: </strong>{art.differentiation}</p>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 6. Claim Verification */}
            <EditorialSectionCard
              id="sec-06-claims"
              num={6}
              title="Claim Verification"
              category="Empirical Proof"
              icon={CheckCircle2}
              conclusions={dossier.claimVerification.groundedConclusions}
            >
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono">
                <span>Verified: <strong className="text-emerald-400">{dossier.claimVerification.verifiedCount}/{dossier.claimVerification.totalClaims} claims</strong></span>
                <span>•</span>
                <span>Verification Rate: <strong className="text-cyan-300">{dossier.claimVerification.verificationRate}%</strong></span>
                <span>•</span>
                <span>Flagged Contradictions: <strong className={dossier.claimVerification.contradictions > 0 ? 'text-amber-400' : 'text-slate-400'}>{dossier.claimVerification.contradictions}</strong></span>
              </div>

              <div className="space-y-2.5">
                {dossier.claimVerification.auditedClaims.map((claim, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">"{claim.claim}"</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        claim.status === 'Verified' ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' :
                        claim.status === 'Contradicted' ? 'bg-rose-950/80 border-rose-500/40 text-rose-300' :
                        'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-slate-400 font-sans"><strong className="text-slate-300 font-mono">Finding: </strong>{claim.finding}</p>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 7. Presentation Analysis */}
            <EditorialSectionCard
              id="sec-07-presentation"
              num={7}
              title="Presentation Analysis"
              category="Communication"
              icon={Mic}
              conclusions={dossier.presentationAnalysis.groundedConclusions}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Clarity Score</span>
                  <span className="text-xl font-bold text-cyan-300">{dossier.presentationAnalysis.clarityScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Speaking Pace</span>
                  <span className="text-xl font-bold text-white">{dossier.presentationAnalysis.paceWPM} WPM</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Confidence Index</span>
                  <span className="text-xl font-bold text-emerald-400">{dossier.presentationAnalysis.confidenceScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block">Filler Words / Min</span>
                  <span className="text-xl font-bold text-slate-300">{dossier.presentationAnalysis.fillerWordsPerMin}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Key Delivery Observations</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 font-sans">
                  {dossier.presentationAnalysis.keyObservations.map((obs, idx) => <li key={idx}>{obs}</li>)}
                </ul>
              </div>
            </EditorialSectionCard>

            {/* 8. Demo Analysis */}
            <EditorialSectionCard
              id="sec-08-demo"
              num={8}
              title="Demo Analysis"
              category="Execution"
              icon={Video}
              conclusions={dossier.demoAnalysis.groundedConclusions}
            >
              <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 uppercase block text-[10px]">Demo Completeness</span>
                  <span className="text-xl font-bold text-cyan-300">{dossier.demoAnalysis.completenessRate}% Execution</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase block text-[10px]">Demonstrated</span>
                  <span className="text-base font-bold text-white">{dossier.demoAnalysis.demonstratedFeaturesCount} Features</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase block text-[10px]">Passed Live</span>
                  <span className="text-base font-bold text-emerald-400">{dossier.demoAnalysis.successfulFeaturesCount} Passed</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase block text-[10px]">Observed Anomalies</span>
                  <span className="text-base font-bold text-amber-400">{dossier.demoAnalysis.observedErrors.length} Flags</span>
                </div>
              </div>

              {/* Observed Errors Console if any */}
              {dossier.demoAnalysis.observedErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-xs space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Observed Anomaly Trace:</span>
                  {dossier.demoAnalysis.observedErrors.map((err, idx) => (
                    <div key={idx} className="text-slate-300 text-[11px] leading-relaxed">
                      <span className="text-cyan-400">[{err.timestamp}]</span> <span className="text-amber-300">{err.errorType}:</span> {err.logSnippet}
                    </div>
                  ))}
                </div>
              )}
            </EditorialSectionCard>

            {/* 9. Social Impact */}
            <EditorialSectionCard
              id="sec-09-social-impact"
              num={9}
              title="Social Impact"
              category="Humanitarian"
              icon={HeartHandshake}
              conclusions={dossier.socialImpact.groundedConclusions}
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 to-[#0B0F19] border border-rose-500/30 space-y-2">
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">Core Humanitarian Metric</span>
                <h4 className="text-lg font-bold text-white">{dossier.socialImpact.headlineMetric}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{dossier.socialImpact.humanitarianValue}</p>
                <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-rose-500/20">
                  <span>Scope: {dossier.socialImpact.peopleAffected}</span>
                  <span className="text-rose-300 font-bold">Score: {dossier.socialImpact.score}/100</span>
                </div>
              </div>
            </EditorialSectionCard>

            {/* 10. Economic Impact */}
            <EditorialSectionCard
              id="sec-10-economic-impact"
              num={10}
              title="Economic Impact"
              category="Market Value"
              icon={DollarSign}
              conclusions={dossier.economicImpact.groundedConclusions}
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-[#0B0F19] border border-cyan-500/30 space-y-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">Cost Reduction & Financial Metric</span>
                <h4 className="text-lg font-bold text-white">{dossier.economicImpact.headlineMetric}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{dossier.economicImpact.costSavings}</p>
                <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-cyan-500/20">
                  <span>ROI: {dossier.economicImpact.roiEstimate}</span>
                  <span className="text-cyan-300 font-bold">Score: {dossier.economicImpact.score}/100</span>
                </div>
              </div>
            </EditorialSectionCard>

            {/* 11. Environmental Impact */}
            <EditorialSectionCard
              id="sec-11-environmental-impact"
              num={11}
              title="Environmental Impact"
              category="Sustainability"
              icon={Leaf}
              conclusions={dossier.environmentalImpact.groundedConclusions}
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-[#0B0F19] border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Lifecycle & Emissions Profile</span>
                <h4 className="text-lg font-bold text-white">{dossier.environmentalImpact.headlineMetric}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{dossier.environmentalImpact.energyUsageProfile}</p>
                <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-emerald-500/20">
                  <span>Materials: {dossier.environmentalImpact.materialUsageAndRecyclability}</span>
                  <span className="text-emerald-300 font-bold">Score: {dossier.environmentalImpact.score}/100</span>
                </div>
              </div>
            </EditorialSectionCard>

            {/* 12. Feasibility */}
            <EditorialSectionCard
              id="sec-12-feasibility"
              num={12}
              title="Feasibility & Readiness"
              category="TRL & Maturity"
              icon={Wrench}
              conclusions={dossier.feasibility.groundedConclusions}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Maturity Level</span>
                  <span className="text-cyan-300 font-bold text-sm">{dossier.feasibility.trlLevel}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Estimated CapEx</span>
                  <span className="text-white font-bold text-sm">{dossier.feasibility.estimatedCapEx}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Estimated OpEx</span>
                  <span className="text-emerald-300 font-bold text-sm">{dossier.feasibility.estimatedOpEx}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Scalability Bottleneck:</span>
                <p className="text-slate-300 font-sans">{dossier.feasibility.scalabilityBottleneck}</p>
              </div>
            </EditorialSectionCard>

            {/* 13. Risks */}
            <EditorialSectionCard
              id="sec-13-risks"
              num={13}
              title="Risk Matrix"
              category="Vulnerabilities"
              icon={ShieldAlert}
            >
              <div className="space-y-3">
                {dossier.risks.map((risk) => (
                  <div key={risk.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 border border-rose-500/40 text-rose-300 uppercase">
                          {risk.severity} Severity
                        </span>
                        <h5 className="font-bold text-white">{risk.title}</h5>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{risk.category}</span>
                    </div>
                    <p className="text-slate-300 font-sans"><strong className="text-cyan-300 font-mono">Mitigation Strategy: </strong>{risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 14. Recommended Improvements */}
            <EditorialSectionCard
              id="sec-14-improvements"
              num={14}
              title="Recommended Improvements"
              category="Coaching"
              icon={Lightbulb}
            >
              <div className="space-y-3">
                {dossier.improvements.map((imp) => (
                  <div key={imp.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                        {imp.priority}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Effort: {imp.effort}</span>
                    </div>
                    <h5 className="font-bold text-white">{imp.recommendation}</h5>
                    <p className="text-slate-300 font-sans">{imp.rationale}</p>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 15. Future Scope */}
            <EditorialSectionCard
              id="sec-15-future-scope"
              num={15}
              title="Future Scope"
              category="Roadmap"
              icon={Compass}
              conclusions={dossier.futureScope.groundedConclusions}
            >
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">Next-Stage Milestones</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 font-sans">
                  {dossier.futureScope.shortTermRoadmap.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">IP & Patent Ceiling</span>
                <p className="text-slate-300 font-sans">{dossier.futureScope.ipAndPatentPotential}</p>
              </div>
            </EditorialSectionCard>

            {/* 16. Commercialization Potential */}
            <EditorialSectionCard
              id="sec-16-commercialization"
              num={16}
              title="Commercialization Potential"
              category="Business Model"
              icon={TrendingUp}
              conclusions={dossier.commercializationPotential.groundedConclusions}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">BOM / Hosting Unit Cost</span>
                  <span className="text-white font-bold">{dossier.commercializationPotential.unitEconomics.bomOrHostingCost}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Target Selling Price</span>
                  <span className="text-cyan-300 font-bold">{dossier.commercializationPotential.unitEconomics.targetSellingPrice}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Projected Gross Margin</span>
                  <span className="text-emerald-300 font-bold">{dossier.commercializationPotential.unitEconomics.projectedGrossMargin}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">Competitive Moat & Barrier-to-Entry</span>
                <p className="text-slate-300 font-sans">{dossier.commercializationPotential.competitiveMoat}</p>
              </div>
            </EditorialSectionCard>

            {/* 17. Judge Questions */}
            <EditorialSectionCard
              id="sec-17-judge-questions"
              num={17}
              title="Judge Questions & Inquiries"
              category="Defense Inquiries"
              icon={Gavel}
            >
              <div className="space-y-4">
                {dossier.judgeQuestions.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="font-bold text-white text-sm leading-snug">"{q.question}"</h5>
                      <button
                        onClick={() => handleCopyQuestion(q.question, q.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1 shrink-0"
                        title="Copy question text"
                      >
                        {copiedQuestionId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedQuestionId === q.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-slate-400 font-sans">
                      <strong className="text-slate-300 font-mono">Target Vulnerability: </strong>{q.targetVulnerability}
                    </div>
                    <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-200 text-[11px] font-mono">
                      <strong>Required Proof: </strong>{q.requiredProof}
                    </div>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 18. Evidence Locker */}
            <EditorialSectionCard
              id="sec-18-evidence"
              num={18}
              title="Evidence Locker"
              category="Provenance"
              icon={FileText}
            >
              <div className="space-y-3">
                {dossier.evidenceLocker.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{ev.id}</span>
                        <span className="text-white font-bold font-sans">{ev.title}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400">Reliability: {ev.reliabilityScore}%</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{ev.excerpt}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                      <span>Source: {ev.source}</span>
                      <span className="text-slate-500 truncate">{ev.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 19. External Sources */}
            <EditorialSectionCard
              id="sec-19-sources"
              num={19}
              title="External Sources & Citations"
              category="Citations"
              icon={BookOpen}
            >
              <div className="space-y-3">
                {dossier.sourcesAndCitations.map((src) => (
                  <div key={src.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white">{src.title}</h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">{src.type}</span>
                    </div>
                    <p className="text-slate-300 italic font-sans">{src.citation}</p>
                    <div className="text-[11px] text-cyan-400 font-sans pt-1">
                      <strong>Relevance to Evaluation: </strong>{src.relevanceToEvaluation}
                    </div>
                  </div>
                ))}
              </div>
            </EditorialSectionCard>

            {/* 20. Final AI Jury Verdict */}
            <EditorialSectionCard
              id="sec-20-verdict"
              num={20}
              title="Final AI Jury Verdict"
              category="Consensus"
              icon={Scale}
              conclusions={dossier.finalVerdictConsensus.groundedConclusions}
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0B0F19] to-blue-950/40 border border-cyan-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">Consensus Result</span>
                    <h3 className="text-xl font-bold text-white leading-tight">{dossier.finalVerdictConsensus.verdictStatement}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold font-mono text-cyan-400">{dossier.finalVerdictConsensus.score}</span>
                    <span className="text-xs font-mono text-slate-400"> / 100</span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {dossier.finalVerdictConsensus.juryConsensusText}
                </p>

                {/* Voting breakdown */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">Juror Consensus Ballots:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {dossier.finalVerdictConsensus.votingBreakdown.map((juror, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{juror.jurorName}</span>
                          <span className="font-mono font-bold text-cyan-400">{juror.voteScore}/100</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 block">{juror.verdictStance}</span>
                        <p className="text-slate-300 italic font-sans text-[11px]">{juror.quote}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </EditorialSectionCard>

          </main>

        </div>

      </div>

    </div>
  );
};

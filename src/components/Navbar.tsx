import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight,
  UploadCloud,
  Layers,
  Camera,
  Film,
  Dna,
  Cpu,
  Fingerprint,
  CheckCircle2,
  TrendingUp,
  FileText,
  Mic,
  Scale,
  Search,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  onOpenEvaluationModal: () => void;
  onOpenSubmissionCenter: () => void;
  onOpenLiveJury: () => void;
  onOpenVideoAnalysis: () => void;
  onOpenProjectDNA: () => void;
  onOpenTechnicalAudit: () => void;
  onOpenOriginality: () => void;
  onOpenClaimVerification: () => void;
  onOpenImpactFeasibility: () => void;
  onOpenPresentationDemo?: () => void;
  onOpenAIJury?: () => void;
  onOpenDossier?: () => void;
  onOpenCommandPalette?: () => void;
  activeView: 'landing' | 'submission' | 'live-jury' | 'video-analysis' | 'project-dna' | 'technical-audit' | 'originality' | 'claim-verification' | 'impact-feasibility' | 'presentation-demo' | 'ai-jury' | 'dossier';
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSubmissionCenter,
  onOpenLiveJury,
  onOpenVideoAnalysis,
  onOpenProjectDNA,
  onOpenTechnicalAudit,
  onOpenOriginality,
  onOpenClaimVerification,
  onOpenImpactFeasibility,
  onOpenPresentationDemo,
  onOpenAIJury,
  onOpenDossier,
  onOpenCommandPalette,
  activeView
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModulesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Capabilities', href: '#features' },
    { label: 'Dual-Track', href: '#dual-track' },
    { label: 'Modalities', href: '#modalities' },
    { label: 'Evidence Scoring', href: '#evidence-scoring' },
    { label: 'Sample Scorecard', href: '#scorecard' },
  ];

  const moduleGroups = [
    {
      group: 'Live Ingestion & Telemetry',
      items: [
        { label: 'Live Camera Jury Room', icon: Camera, color: 'text-rose-400', action: onOpenLiveJury, desc: 'Real-time camera feed & speech cadence' },
        { label: '11-Stage Video Analysis', icon: Film, color: 'text-cyan-400', action: onOpenVideoAnalysis, desc: 'Multimodal extraction & visual forensics' },
        { label: 'Submission Cockpit', icon: UploadCloud, color: 'text-blue-400', action: onOpenSubmissionCenter, desc: 'Code repository, BOM, and demo upload' },
      ]
    },
    {
      group: 'Deep Forensic Audits',
      items: [
        { label: 'Project DNA Graph', icon: Dna, color: 'text-cyan-400', action: onOpenProjectDNA, desc: 'Architecture, stack, and topological ontology' },
        { label: 'Technical Auditor', icon: Cpu, color: 'text-emerald-400', action: onOpenTechnicalAudit, desc: 'Firmware, circuits, and cryptographic audit' },
        { label: 'Originality Intelligence', icon: Fingerprint, color: 'text-purple-400', action: onOpenOriginality, desc: 'Prior art lineage across patents & papers' },
        { label: 'Claim Verification Engine', icon: CheckCircle2, color: 'text-emerald-400', action: onOpenClaimVerification, desc: 'Factual evidence chain verification' },
      ]
    },
    {
      group: 'Scoring & Synthesis',
      items: [
        { label: 'Impact & Feasibility Matrix', icon: TrendingUp, color: 'text-cyan-400', action: onOpenImpactFeasibility, desc: 'Social, economic, environmental & TRL' },
        { label: 'Presentation & Demo Analysis', icon: Mic, color: 'text-cyan-400', action: onOpenPresentationDemo, desc: '9 speech metrics and feature verification' },
        { label: 'AI Jury & Scoring Engine', icon: Scale, color: 'text-cyan-400', action: onOpenAIJury, desc: '8-axis radar chart & dynamic weighted rubric' },
        { label: '20-Section Intelligence Report', icon: FileText, color: 'text-emerald-400', action: onOpenDossier, desc: 'Comprehensive institutional forensic report' },
      ]
    }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#07090E]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/40 py-3' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <a 
            href="#" 
            onClick={(e) => { 
              if (activeView !== 'landing') { 
                e.preventDefault(); 
                window.location.hash = ''; 
                window.location.reload(); 
              } 
            }} 
            className="flex items-center gap-3 group select-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 p-2 flex items-center justify-center group-hover:border-cyan-400 transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="absolute w-5 h-[1.5px] bg-cyan-400/80" />
              <div className="absolute h-5 w-[1.5px] bg-cyan-400/80" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  ProjectX-Ray<span className="text-cyan-400">.AI</span>
                </span>
                <span className="hidden sm:inline-flex text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-700/40 text-cyan-300 font-semibold">
                  Jury Core
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                Autonomous Project Jury
              </span>
            </div>
          </a>

          {/* Center Navigation: Links on landing, Breadcrumb when inside module */}
          {activeView === 'landing' ? (
            <nav className="hidden xl:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] px-3 py-1 rounded-full backdrop-blur-md">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white rounded-full hover:bg-white/[0.06] transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="capitalize">{activeView.replace('-', ' ')} Active View</span>
            </div>
          )}

          {/* Right Header Controls: Linear/Stripe Enterprise Style */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Quick Command Palette Button (⌘K) */}
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-xs font-mono text-slate-400 hover:text-slate-200 transition-all shadow-sm"
                title="Search evaluation modules (Cmd+K / Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Quick Jump</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Modules Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 border shadow-sm ${
                  modulesDropdownOpen
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 ring-1 ring-cyan-500/30'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Modules</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${modulesDropdownOpen ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
              </button>

              {/* Categorized Dropdown Panel */}
              {modulesDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[480px] rounded-2xl bg-[#090D17]/95 border border-white/[0.12] shadow-2xl p-3 backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {moduleGroups.map((grp, gIdx) => (
                      <div key={gIdx} className={`space-y-1.5 ${gIdx === 2 ? 'sm:col-span-2 pt-2 border-t border-white/[0.06]' : ''}`}>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2">
                          {grp.group}
                        </div>
                        <div className={gIdx === 2 ? 'grid grid-cols-2 gap-1.5' : 'space-y-1'}>
                          {grp.items.map((item, iIdx) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={iIdx}
                                onClick={() => {
                                  setModulesDropdownOpen(false);
                                  item.action?.();
                                }}
                                className="w-full text-left p-2 rounded-xl hover:bg-white/[0.05] transition-colors flex items-start gap-2.5 group"
                              >
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} />
                                <div className="truncate">
                                  <span className="text-xs font-medium text-white group-hover:text-cyan-300 block truncate">
                                    {item.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-sans block truncate">
                                    {item.desc}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
                    <span>Autonomous Project Jury v4.2</span>
                    <span className="text-cyan-400">11 Full Engine Modules</span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Link: Report */}
            {onOpenDossier && (
              <button
                onClick={onOpenDossier}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center gap-1.5 shadow-sm"
                title="View 20-Section Final Intelligence Report"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Report</span>
              </button>
            )}

            {/* Direct Link: AI Jury */}
            {onOpenAIJury && (
              <button
                onClick={onOpenAIJury}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center gap-1.5 shadow-sm"
                title="View AI Jury & Scoring Engine"
              >
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Jury</span>
              </button>
            )}

            {/* Primary CTA: Submit */}
            <button
              onClick={onOpenSubmissionCenter}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-200 flex items-center gap-1.5 active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-[#07090E]/95 backdrop-blur-2xl border-b border-white/10 p-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-in fade-in duration-150">
          <div className="space-y-4">
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Quick Navigation</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDossier?.();
                  }}
                  className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300 text-left flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">20-Sec Report</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAIJury?.();
                  }}
                  className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 text-left flex items-center gap-2"
                >
                  <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">AI Jury Core</span>
                </button>
              </div>
            </div>

            {moduleGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-1">
                  {grp.group}
                </div>
                <div className="space-y-1">
                  {grp.items.map((item, iIdx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={iIdx}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          item.action?.();
                        }}
                        className="w-full text-left p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between text-xs text-slate-200"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSubmissionCenter();
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Submit Project for AI Defense</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

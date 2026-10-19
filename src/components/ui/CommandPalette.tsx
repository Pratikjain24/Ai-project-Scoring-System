import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Dna, 
  Cpu, 
  Fingerprint, 
  CheckCircle2, 
  TrendingUp, 
  Mic, 
  Film, 
  Camera, 
  UploadCloud, 
  FileText, 
  Scale, 
  Home,
  ArrowRight
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Live Ingestion' | 'Deep Audit' | 'Impact & Scoring' | 'Navigation';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = [
    {
      id: 'landing',
      title: 'Platform Overview & Landing',
      category: 'Navigation',
      icon: Home,
      description: 'System architectural overview, dual-track modality, and pipeline breakdown',
      action: () => onSelectView('landing')
    },
    {
      id: 'submission',
      title: 'Project Submission Cockpit',
      category: 'Live Ingestion',
      icon: UploadCloud,
      description: 'Upload repo, project artifacts, bill of materials, and demo video',
      action: () => onSelectView('submission')
    },
    {
      id: 'live-jury',
      title: 'Live Camera Jury Control Room',
      category: 'Live Ingestion',
      icon: Camera,
      description: 'Real-time camera feed, live transcript, speech cadence, and oral claim extraction',
      action: () => onSelectView('live-jury')
    },
    {
      id: 'video-analysis',
      title: '11-Stage Video Analysis Pipeline',
      category: 'Live Ingestion',
      icon: Film,
      description: 'Multimodal video processing, audio separation, and frame forensics',
      action: () => onSelectView('video-analysis')
    },
    {
      id: 'project-dna',
      title: 'Project DNA Knowledge Graph',
      category: 'Deep Audit',
      icon: Dna,
      description: 'Extracted problem, target users, hardware/software stack, and topological graph',
      action: () => onSelectView('project-dna')
    },
    {
      id: 'technical-audit',
      title: 'Technical Auditor Dashboard',
      category: 'Deep Audit',
      icon: Cpu,
      description: 'Hardware circuit & firmware audit / Software architecture & cryptography analysis',
      action: () => onSelectView('technical-audit')
    },
    {
      id: 'originality',
      title: 'Originality Intelligence Dashboard',
      category: 'Deep Audit',
      icon: Fingerprint,
      description: 'Prior art investigation across GitHub, IEEE research papers, and USPTO patents',
      action: () => onSelectView('originality')
    },
    {
      id: 'claim-verification',
      title: 'Claim Verification Engine',
      category: 'Deep Audit',
      icon: CheckCircle2,
      description: 'Factual verification chains, contradiction detection, and Ask the Judge questions',
      action: () => onSelectView('claim-verification')
    },
    {
      id: 'impact-feasibility',
      title: 'Impact & Feasibility Matrix',
      category: 'Impact & Scoring',
      icon: TrendingUp,
      description: 'Social, economic, environmental impact scoring and TRL 1-9 maturity roadmap',
      action: () => onSelectView('impact-feasibility')
    },
    {
      id: 'presentation-demo',
      title: 'Presentation & Demonstration Analysis',
      category: 'Impact & Scoring',
      icon: Mic,
      description: '9 speech metrics, filler words breakdown, and feature-by-feature demo verification',
      action: () => onSelectView('presentation-demo')
    },
    {
      id: 'ai-jury',
      title: 'AI Jury & Scoring Engine',
      category: 'Impact & Scoring',
      icon: Scale,
      description: '8-axis radar chart, weighted score breakdown simulator, and 4-juror ballots',
      action: () => onSelectView('ai-jury')
    },
    {
      id: 'dossier',
      title: '20-Section Final Intelligence Report',
      category: 'Impact & Scoring',
      icon: FileText,
      description: 'Comprehensive institutional forensic dossier with provenance links, print, and download',
      action: () => onSelectView('dossier')
    }
  ];

  const filteredItems = commandItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard navigation: Escape, ArrowDown, ArrowUp, Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          // Toggle command palette
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-[#090D17] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3 bg-white/[0.02]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search evaluation modules, deep audits, or reports... (↑↓ to navigate, Enter to select)"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 font-sans focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              No matching modules or actions found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-white shadow-sm'
                      : 'hover:bg-white/[0.03] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-tight">{item.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans truncate">{item.description}</p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
                  }`} />
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="p-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">↵</kbd> Open</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">ESC</kbd> Close</span>
          </div>
          <span className="text-cyan-400">ProjectX-Ray AI Core</span>
        </div>
      </div>
    </div>
  );
};

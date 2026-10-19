import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from '../ui/CommandPalette';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandPaletteSelect = (view: string) => {
    setIsCommandPaletteOpen(false);
    const match = location.pathname.match(/\/evaluations\/([^/]+)/);
    const activeEvalId = (match && match[1] !== 'new') ? match[1] : 'smart-road-vision';

    switch (view) {
      case 'landing':
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'submission':
        navigate('/new-evaluation');
        break;
      case 'project-dna':
        navigate(`/evaluations/${activeEvalId}/project`);
        break;
      case 'technical-audit':
        navigate(`/evaluations/${activeEvalId}/technical`);
        break;
      case 'originality':
        navigate(`/evaluations/${activeEvalId}/originality`);
        break;
      case 'claim-verification':
        navigate(`/evaluations/${activeEvalId}/claims`);
        break;
      case 'impact-feasibility':
        navigate(`/evaluations/${activeEvalId}/impact`);
        break;
      case 'presentation-demo':
        navigate(`/evaluations/${activeEvalId}/presentation`);
        break;
      case 'ai-jury':
        navigate(`/evaluations/${activeEvalId}/jury`);
        break;
      case 'dossier':
        navigate(`/evaluations/${activeEvalId}/report`);
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#07090E] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onToggleMobileMenu={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectView={handleCommandPaletteSelect}
      />
    </div>
  );
};

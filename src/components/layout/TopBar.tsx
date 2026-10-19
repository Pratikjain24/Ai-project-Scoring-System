import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  ChevronRight,
  Shield,
  ChevronDown,
  Check,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobileMenu,
}) => {
  const location = useLocation();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const { currentUser, allPersonas, switchPersona, openAuthModal, logout, isAuthenticated } = useAuth();
  const personaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(event.target as Node)) {
        setShowPersonaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate breadcrumbs from location path
  const pathParts = location.pathname.split('/').filter(Boolean);

  const getPageTitle = () => {
    if (location.pathname === '/' || location.pathname === '/dashboard') return 'Command Center';
    if (location.pathname === '/new-evaluation') return 'New AI Evaluation';
    if (location.pathname === '/evaluations') return 'Evaluation Catalog';
    if (location.pathname === '/settings') return 'System Settings';
    if (location.pathname.startsWith('/evaluations/')) {
      return 'Project Workspace';
    }
    return 'ProjectX-Ray AI';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-mono">
            <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">
              X-Ray
            </Link>
            {pathParts.map((part, index) => {
              const url = `/${pathParts.slice(0, index + 1).join('/')}`;
              const isLast = index === pathParts.length - 1;
              const formatted = part.replace(/-/g, ' ');

              return (
                <React.Fragment key={url}>
                  <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  {isLast ? (
                    <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-semibold truncate capitalize">
                      {formatted}
                    </span>
                  ) : (
                    <Link to={url} className="hover:text-cyan-400 transition-colors truncate capitalize">
                      {formatted}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <h1 className="text-sm sm:text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: User menu and actions */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Institutional Persona / Role Switcher */}
        <div className="relative" ref={personaRef}>
          <button
            type="button"
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all text-left"
            title="Switch Reviewer Persona"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${currentUser.badgeColor}`}>
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {currentUser.roleLabel}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn space-y-2">
              <div className="px-2 py-1.5 border-b border-slate-800/80">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>User Authentication</span>
                  </p>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isAuthenticated ? 'Authenticated' : 'Demo Session'}</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">HS256 JWT • HttpOnly 7-Day Refresh</p>
              </div>

              {/* Action Buttons for Sign In / Register */}
              <div className="grid grid-cols-2 gap-1.5 px-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openAuthModal('LOGIN');
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-xs h-8 justify-center gap-1.5 border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-slate-200"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openAuthModal('REGISTER');
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-xs h-8 justify-center gap-1.5 border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-slate-200"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Register</span>
                </Button>
              </div>

              {/* Institutional Persona Switcher */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Switch Viva Persona:
                </div>
                <div className="space-y-1">
                  {allPersonas.map((p) => {
                    const isSelected = p.id === currentUser.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          switchPersona(p.id);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-slate-800/90 border border-cyan-500/30'
                            : 'hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                            {p.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-200 truncate">{p.name}</span>
                              <span className={`text-[8px] px-1 py-0.2 rounded font-mono border ${p.badgeColor}`}>
                                {p.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">{p.organization}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sign Out CTA */}
              <div className="pt-2 border-t border-slate-800/80 px-1">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setShowPersonaMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Current Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* New Evaluation CTA shortcut */}
        <Link to="/new-evaluation">
          <Button variant="primary" size="sm" className="hidden sm:inline-flex shadow-sm">
            + New Evaluation
          </Button>
        </Link>
      </div>
    </header>
  );
};

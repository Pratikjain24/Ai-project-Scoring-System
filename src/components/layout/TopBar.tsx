import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Command,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommandPalette,
  onToggleMobileMenu,
}) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

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

  const notifications = [
    {
      id: '1',
      title: 'Smart Road Vision audit completed',
      time: '12m ago',
      type: 'success',
      read: false,
    },
    {
      id: '2',
      title: 'MediTrack flagged 3 unverified clinical claims',
      time: '1h ago',
      type: 'warning',
      read: false,
    },
    {
      id: '3',
      title: 'CyberShield benchmark telemetry verified',
      time: '4h ago',
      type: 'info',
      read: true,
    },
  ];

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

      {/* Right: Quick Global Search, Notifications, Demo Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Search projects, claims...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 border border-slate-700/60 flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900"
        >
          <Search className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Subtle Demo Data Label */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[10px] font-mono text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Demo Intelligence Mode</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <span>Evaluation Notifications</span>
                <span className="text-[10px] font-mono text-cyan-400">3 New</span>
              </div>

              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg text-xs transition-colors ${
                      n.read ? 'bg-slate-950/40 opacity-70' : 'bg-slate-800/60 border border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />}
                      {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />}
                      {n.type === 'info' && <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-200 leading-tight">{n.title}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
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

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  SearchCode,
  FileCheck2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Tooltip } from '../ui/Tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Evaluation', path: '/new-evaluation', icon: PlusCircle, badge: 'New' },
    { label: 'Evaluations', path: '/evaluations', icon: FolderKanban },
    { label: 'Research', path: '/evaluations/smart-road-vision/originality', icon: SearchCode },
    { label: 'Reports', path: '/evaluations/smart-road-vision/report', icon: FileCheck2 },
  ];

  const secondaryNavItems = [
    { label: 'Admin Panel', path: '/admin', icon: ShieldCheck },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const renderNavLink = (item: { label: string; path: string; icon: any; badge?: string }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/' && location.pathname.startsWith(item.path));

    const content = (
      <NavLink
        to={item.path}
        onClick={onCloseMobile}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
          isActive
            ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
        } ${collapsed ? 'justify-center px-2' : ''}`}
      >
        {/* Active Route Indicator Bar */}
        {isActive && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#06B6D4]" />
        )}

        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />

        {!collapsed && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path} content={item.label} position="right">
          {content}
        </Tooltip>
      );
    }

    return <div key={item.path}>{content}</div>;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen flex flex-col justify-between bg-slate-950/95 dark:bg-slate-950/95 light:bg-white border-r border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top Branding */}
        <div>
          <div className={`h-16 flex items-center border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] flex-shrink-0">
                XR
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="font-extrabold tracking-tight text-sm text-slate-100 dark:text-slate-100 light:text-slate-900 block leading-tight">
                    PROJECT<span className="text-cyan-400">X-RAY</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono block">
                    AI Project Jury
                  </span>
                </div>
              )}
            </NavLink>

            {!collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Primary Navigation */}
          <div className="p-3 space-y-1">
            <div className={`px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-500 ${collapsed ? 'text-center' : ''}`}>
              {!collapsed ? 'Evaluation Hub' : '•'}
            </div>
            {navItems.map(renderNavLink)}
          </div>

          {/* Secondary Divider */}
          <div className="my-2 px-4">
            <div className="h-px bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-200" />
          </div>

          {/* System Settings */}
          <div className="p-3 space-y-1">
            <div className={`px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-500 ${collapsed ? 'text-center' : ''}`}>
              {!collapsed ? 'Configuration' : '•'}
            </div>
            {secondaryNavItems.map(renderNavLink)}
          </div>
        </div>

        {/* Bottom User & System Controls */}
        <div className="p-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 space-y-2">
          {/* Collapse expand button if collapsed on desktop */}
          {collapsed && (
            <div className="hidden md:flex justify-center pb-2">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors border border-transparent ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            )}
            {!collapsed && (
              <span className="flex-1 text-left truncate">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 ${
              collapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-cyan-500/20">
              MC
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-900 truncate">
                    Dr. Maya Chen
                  </p>
                  <ShieldCheck className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  Senior AI Juror
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

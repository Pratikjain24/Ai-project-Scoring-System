import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: 'pill' | 'underline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  size = 'md',
  className = ''
}: TabsProps<T>) {
  if (variant === 'underline') {
    return (
      <div className={`flex items-center border-b border-white/[0.08] gap-6 ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`pb-3 text-xs font-mono font-medium transition-all relative flex items-center gap-2 ${
                isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant (Linear-style segmented control)
  return (
    <div className={`p-1 rounded-xl bg-slate-900/90 border border-white/[0.08] inline-flex items-center gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`rounded-lg transition-all duration-200 flex items-center gap-2 font-mono ${
              size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-xs px-3.5 py-1.5'
            } ${
              isActive
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-cyan-950 text-cyan-300' : 'bg-white/10 text-slate-400'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

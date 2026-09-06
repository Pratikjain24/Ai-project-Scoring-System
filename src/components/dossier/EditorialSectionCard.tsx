import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { GroundedConclusion } from '../../types/masterDossier';
import { GroundedConclusionBadge } from './GroundedConclusionBadge';

interface EditorialSectionCardProps {
  id: string;
  num: number;
  title: string;
  category: string;
  icon: LucideIcon;
  children: React.ReactNode;
  conclusions?: GroundedConclusion[];
  actionSlot?: React.ReactNode;
}

export const EditorialSectionCard: React.FC<EditorialSectionCardProps> = ({
  id,
  num,
  title,
  category,
  icon: Icon,
  children,
  conclusions,
  actionSlot
}) => {
  return (
    <section
      id={id}
      className="scroll-mt-32 rounded-3xl bg-[#0B0F19]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-white/20 relative group"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                Section {num < 10 ? `0${num}` : num}
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                • {category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mt-0.5">
              {title}
            </h2>
          </div>
        </div>

        {actionSlot && (
          <div className="shrink-0">
            {actionSlot}
          </div>
        )}
      </div>

      {/* Main Section Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Grounded Evidence Provenance */}
      {conclusions && conclusions.length > 0 && (
        <GroundedConclusionBadge
          conclusions={conclusions}
          sectionTitle={title}
        />
      )}
    </section>
  );
};

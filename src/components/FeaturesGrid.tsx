import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Globe, 
  CheckCircle2, 
  Cpu, 
  Mic, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { FEATURES } from '../data/mockData';

export const FeaturesGrid: React.FC = () => {
  const getFeatureIcon = (name: string) => {
    switch (name) {
      case 'Eye': return <Eye className="w-5 h-5 text-cyan-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-violet-400" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Mic': return <Mic className="w-5 h-5 text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getBorderColor = (color: string) => {
    switch (color) {
      case 'cyan': return 'group-hover:border-cyan-500/40 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]';
      case 'emerald': return 'group-hover:border-emerald-500/40 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]';
      case 'violet': return 'group-hover:border-violet-500/40 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]';
      case 'amber': return 'group-hover:border-amber-500/40 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]';
      default: return 'group-hover:border-cyan-500/40';
    }
  };

  return (
    <section id="features" className="py-24 relative bg-[#07090E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>UNCOMPROMISING EVALUATION CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            Engineered For Truth. Built To Eliminate <span className="text-gradient-cyan">Evaluation Bias</span>.
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Traditional hackathons, academic panels, and grant boards rely on tired human judges who can't review 50,000 lines of code or test 4-layer PCB impedance in a 5-minute presentation. ProjectX-Ray AI performs institutional forensic diligence in seconds.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative rounded-2xl bg-white/[0.02] border border-white/[0.08] p-7 transition-all duration-300 hover:bg-white/[0.04] flex flex-col justify-between ${getBorderColor(feature.color)}`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getFeatureIcon(feature.iconName)}
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06]">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white font-display mb-2.5 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>{feature.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {feature.description}
                </p>

                <p className="text-xs text-slate-400 leading-normal border-l-2 border-white/10 pl-3 py-0.5 mb-6 font-mono">
                  {feature.detail}
                </p>
              </div>

              {/* Metric Callout */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono">
                <span className="text-[11px] text-slate-400">{feature.metricLabel}</span>
                <span className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {feature.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const STORAGE_KEY = 'xray_system_settings';

  const [preset, setPreset] = useState<'academic' | 'vc' | 'hackathon'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).preset || 'academic' : 'academic';
    } catch {
      return 'academic';
    }
  });

  const [model, setModel] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).model || 'gemini-1.5-pro' : 'gemini-1.5-pro';
    } catch {
      return 'gemini-1.5-pro';
    }
  });

  const [confidenceThreshold, setConfidenceThreshold] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).confidenceThreshold || 70 : 70;
    } catch {
      return 70;
    }
  });

  const [enablePriorArtCrawler, setEnablePriorArtCrawler] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).enablePriorArtCrawler ?? true : true;
    } catch {
      return true;
    }
  });

  const [enableAcousticPitch, setEnableAcousticPitch] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).enableAcousticPitch ?? true : true;
    } catch {
      return true;
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).apiKeys || {
        github: 'ghp_••••••••••••••••••••••••••••••••••••',
        semanticScholar: 'sec_••••••••••••••••••••••••••••••••',
        uspto: 'pat_••••••••••••••••••••••••••••••••',
      } : {
        github: 'ghp_••••••••••••••••••••••••••••••••••••',
        semanticScholar: 'sec_••••••••••••••••••••••••••••••••',
        uspto: 'pat_••••••••••••••••••••••••••••••••',
      };
    } catch {
      return {
        github: 'ghp_••••••••••••••••••••••••••••••••••••',
        semanticScholar: 'sec_••••••••••••••••••••••••••••••••',
        uspto: 'pat_••••••••••••••••••••••••••••••••',
      };
    }
  });

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        preset,
        model,
        confidenceThreshold,
        enablePriorArtCrawler,
        enableAcousticPitch,
        apiKeys,
      }));
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
            System & Juror Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Configure evaluation rubrics, autonomous multimodal models, confidence thresholds, and institutional styling.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully. All future evaluation runs will respect these parameters.</span>
        </div>
      )}

      {/* 1. Appearance & Theme */}
      <Card className="p-6 space-y-4 border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Appearance & Design Theme
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch between institutional dark theme and high-contrast light theme
            </p>
          </div>
          <Badge variant="cyan">Instant Switch</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              theme === 'dark'
                ? 'border-cyan-400 bg-cyan-950/20 shadow-md'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Deep Cyber Dark (Default)</span>
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tailored for command center operations with restrained neon accents, dark gray panels, and luminous data viz.
            </p>
          </div>

          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              theme === 'light'
                ? 'border-cyan-500 bg-cyan-50 shadow-md light:bg-slate-100'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Editorial Light</span>
              </div>
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-cyan-500" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Clean paper-like white backgrounds and crisp slate borders, ideal for printing and academic committees.
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Evaluation Strictness Presets */}
      <Card className="p-6 space-y-4 border-slate-800">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Evaluation Strictness Preset
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate how rigorously claims and originality scans are weighted
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'academic',
              name: 'Academic Jury',
              desc: 'High emphasis on prior art citation, statistical rigor, and methodology reproducibility.',
            },
            {
              id: 'vc',
              name: 'VC Due Diligence',
              desc: 'Prioritizes total addressable market, defensible IP moats, and prototype traction.',
            },
            {
              id: 'hackathon',
              name: 'Hackathon Fast-Track',
              desc: 'Emphasis on working demo completeness, novel ideation, and rapid engineering execution.',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setPreset(item.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                preset === item.id
                  ? 'border-cyan-400 bg-cyan-950/20'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200">{item.name}</span>
                {preset === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. AI Jury Model & Thresholds */}
      <Card className="p-6 space-y-5 border-slate-800">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Multimodal Intelligence Engine
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select foundation models and confidence gating for claim auditing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-slate-300 mb-1">
              Primary Multimodal Evaluator
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="gemini-1.5-pro">DeepMind Gemini 1.5 Pro (2M Context + Native Video)</option>
              <option value="gpt-4o">OpenAI GPT-4o Vision & Audio</option>
              <option value="claude-3-5">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-300">
                Unverified Claim Flagging Threshold
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-cyan-400 mt-2"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Claims with confidence below {confidenceThreshold}% are automatically routed to Judge Cross-Examination.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enablePriorArtCrawler}
              onChange={(e) => setEnablePriorArtCrawler(e.target.checked)}
              className="rounded accent-cyan-400 w-4 h-4"
            />
            <span className="text-xs text-slate-300">
              Autonomous Deep Web & ArXiv crawler enabled during intake
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableAcousticPitch}
              onChange={(e) => setEnableAcousticPitch(e.target.checked)}
              className="rounded accent-cyan-400 w-4 h-4"
            />
            <span className="text-xs text-slate-300">
              Acoustic pitch tracking & filler word detector active on live microphone feeds
            </span>
          </label>
        </div>
      </Card>

      {/* 4. External API Keys (Simulated) */}
      <Card className="p-6 space-y-4 border-slate-800">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            External Crawler & Database Connectors
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure read tokens for autonomous external verification lookups
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              GitHub Personal Access Token (for AST code analysis)
            </label>
            <input
              type="password"
              value={apiKeys.github}
              onChange={(e) => setApiKeys({ ...apiKeys, github: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Semantic Scholar API Key (for 220M+ research papers scan)
            </label>
            <input
              type="password"
              value={apiKeys.semanticScholar}
              onChange={(e) => setApiKeys({ ...apiKeys, semanticScholar: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              USPTO Patent Bulk Data API
            </label>
            <input
              type="password"
              value={apiKeys.uspto}
              onChange={(e) => setApiKeys({ ...apiKeys, uspto: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" size="md" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSave} className="flex items-center gap-2 shadow-lg shadow-cyan-500/20">
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </Button>
      </div>
    </div>
  );
};

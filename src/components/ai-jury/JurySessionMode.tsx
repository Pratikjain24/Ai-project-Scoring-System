import React, { useState } from 'react';
import { 
  CheckSquare, 
  Bookmark, 
  Flag, 
  Plus, 
  MessageSquare, 
  ShieldAlert 
} from 'lucide-react';
import type { JuryQuestionItem, JuryNote } from '../../types/aiJuryScoring';

interface JurySessionModeProps {
  questions: JuryQuestionItem[];
  notes: JuryNote[];
  onToggleAsked: (questionId: string, newState: boolean) => void;
  onToggleFlagged: (questionId: string, newState: boolean) => void;
  onToggleBookmarked: (questionId: string, newState: boolean) => void;
  onAddNote: (note: { category: string; text: string; author: string }) => void;
}

export const JurySessionMode: React.FC<JurySessionModeProps> = ({
  questions,
  notes,
  onToggleAsked,
  onToggleFlagged,
  onToggleBookmarked,
  onAddNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [authorName, setAuthorName] = useState<string>('Prof. Sarah Jenkins');
  const [noteCategory, setNoteCategory] = useState<string>('TECHNICAL');
  const [newNoteText, setNewNoteText] = useState<string>('');

  const categories = ['ALL', 'TECHNICAL', 'VALIDATION', 'ORIGINALITY', 'FEASIBILITY', 'SECURITY'];

  const filteredQuestions = selectedCategory === 'ALL'
    ? questions
    : questions.filter(q => q.category?.toUpperCase() === selectedCategory);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote({
      author: authorName,
      category: noteCategory,
      text: newNoteText.trim(),
    });
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Interactive Deliberation Console
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Live Jury Session Mode
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Jury Committee Defense & Deliberation Station
          </h2>
          <p className="text-xs text-slate-400">
            Track oral defense cross-examinations, mark questions as asked, bookmark critical evidence, and record human juror commentary.
          </p>
        </div>

        {/* Segregation Note */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 max-w-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 inline mr-1.5" />
          <span>Human juror notes are strictly segregated from AI consensus logic.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Ranked Judge Questions */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Question Cards */}
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border transition-all ${
                  q.isAsked
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : q.isFlagged
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          q.priority === 'CRITICAL'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                            : q.priority === 'HIGH'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {q.priority} PRIORITY
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {q.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                      "{q.question}"
                    </h4>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      <strong className="text-slate-300 font-mono text-[11px]">Evaluation Context: </strong>
                      {q.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => onToggleAsked(q.id, !q.isAsked)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                        q.isAsked
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{q.isAsked ? 'Asked' : 'Mark Asked'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFlagged(q.id, !q.isFlagged)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          q.isFlagged
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                        }`}
                        title="Flag concern"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleBookmarked(q.id, !q.isBookmarked)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          q.isBookmarked
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                        }`}
                        title="Bookmark evidence"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Judge Notes Drawer */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                  Juror Remarks
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>

            {/* Note Creation Form */}
            <form onSubmit={handleCreateNote} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Juror Name"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="TECHNICAL">TECHNICAL</option>
                  <option value="FEASIBILITY">FEASIBILITY</option>
                  <option value="ORIGINALITY">ORIGINALITY</option>
                  <option value="VALIDATION">VALIDATION</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type private jury deliberation remark..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />

              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="w-full py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Juror Note</span>
              </button>
            </form>

            {/* Existing Notes Feed */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {notes.map((n, i) => (
                <div key={n.id || i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-slate-300">{n.author}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {n.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Lock, 
  Trash2, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import type { ReportShare } from '../../types/report';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  reportId?: string;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  evaluationId,
}) => {
  const [shares, setShares] = useState<ReportShare[]>([]);
  const [recipient, setRecipient] = useState('');
  const [expiryDays, setExpiryDays] = useState<number | null>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing shares
  const loadExistingShares = React.useCallback(async () => {
    try {
      const existing = (window as any).__projectXRayShares?.[evaluationId] || [];
      setShares(existing);
    } catch (e) {
      console.error(e);
    }
  }, [evaluationId]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchAsync = async () => {
      if (isOpen && isMounted) {
        await loadExistingShares();
      }
    };
    fetchAsync();
    return () => {
      isMounted = false;
    };
  }, [isOpen, loadExistingShares]);

  if (!isOpen) return null;

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const share = await api.createReportShare(evaluationId, expiryDays !== null ? expiryDays : 365);
      if (share) {
        const updated = [share, ...shares];
        setShares(updated);
        (window as any).__projectXRayShares = {
          ...((window as any).__projectXRayShares || {}),
          [evaluationId]: updated
        };
        setRecipient('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await api.revokeReportShare(shareId);
      const updated = shares.filter(s => s.id !== shareId);
      setShares(updated);
      (window as any).__projectXRayShares = {
        ...((window as any).__projectXRayShares || {}),
        [evaluationId]: updated
      };
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to revoke share link');
    }
  };

  const copyShareLink = (token: string) => {
    const fullUrl = `${window.location.origin}/share/report/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Institutional Report Sharing
              </h2>
              <p className="text-xs text-slate-400">
                Generate secure, audit-compliant view-only tokens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCreateShare} className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Create New Access Token
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Recipient / Grantee Name (Optional)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. City Innovation Committee, Prof. Alistair"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Access Expiration
              </label>
              <select
                value={expiryDays === null ? 'never' : expiryDays.toString()}
                onChange={(e) => setExpiryDays(e.target.value === 'never' ? null : parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days (Recommended)</option>
                <option value="90">90 Days</option>
                <option value="never">Never (Persistent)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              {isLoading ? 'Generating Token...' : 'Generate View-Only Share Link'}
            </button>
          </form>

          {/* Active Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Active Share Links ({shares.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Encrypted View-Only</span>
            </h3>

            {shares.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No active share links. Generate one above to grant read-only external access.
              </div>
            ) : (
              <div className="space-y-2.5">
                {shares.map((share) => {
                  const isCopied = copiedToken === share.token;
                  return (
                    <div
                      key={share.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200 truncate">
                            Institutional View Token
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400">
                            Active
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm">
                          Token: {share.token.slice(0, 16)}...
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                          <span>
                            {share.expiresAt 
                              ? `Expires: ${new Date(share.expiresAt).toLocaleDateString()}` 
                              : 'No expiration'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => copyShareLink(share.token)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                          title="Copy Link"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRevokeShare(share.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Recipients cannot edit scores or submit evaluations
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

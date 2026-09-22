import React from 'react';
import { Key, CheckCircle2, AlertCircle, History } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  onOpenKeyModal: () => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiKey,
  onOpenKeyModal,
  historyCount,
  onOpenHistory,
}) => {
  const hasKey = apiKey.trim().length > 0;

  return (
    <header className="sticky top-0 z-40 bg-[#f0f4f9]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-[#e1e3e1]/60">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-[#1f1f1f]">
              Agnes Video AI
            </h1>
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#c2e7ff] text-[#001d35]">
              v2.0
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* API Key Status Pill */}
          <button
            onClick={onOpenKeyModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm ${
              hasKey
                ? 'bg-[#c4eed0] text-[#072711] hover:bg-[#a6e6b8]'
                : 'bg-[#ffdad6] text-[#410002] hover:bg-[#ffb4ab]'
            }`}
            title="Gérer la clé API Agnes AI"
          >
            <Key className="w-3.5 h-3.5" />
            {hasKey ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#0a6627]" />
                <span>Clé configurée</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-[#ba1a1a]" />
                <span>Renseigner ma clé API</span>
              </span>
            )}
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#1f1f1f] text-xs font-medium border border-[#e1e3e1]/70 shadow-sm hover:bg-[#f0f4f9] transition-all"
            title="Historique des générations de la session"
          >
            <History className="w-3.5 h-3.5 text-[#444746]" />
            <span className="hidden sm:inline">Historique</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#00639b] text-white text-[10px] flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

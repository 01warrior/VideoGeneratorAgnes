import React from 'react';
import { Key, CheckCircle2, AlertCircle, History, Cpu } from 'lucide-react';
import { ProviderKey } from '../types/video';
import { ProviderInfo } from '../services/providers/factory';

interface HeaderProps {
  apiKey: string;
  onOpenKeyModal: () => void;
  selectedProvider: ProviderKey;
  providers: ProviderInfo[];
  onSelectProvider: (key: ProviderKey) => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiKey,
  onOpenKeyModal,
  selectedProvider,
  providers,
  onSelectProvider,
  historyCount,
  onOpenHistory,
}) => {
  const hasKey = apiKey.trim().length > 0;
  const currentProvider = providers.find((p) => p.key === selectedProvider);

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
          <p className="text-xs text-[#444746] hidden sm:block">
            Architecture Adapter multi-provider & Polling adaptatif
          </p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Provider selector pill */}
          <div className="relative inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-[#e1e3e1]/70">
            <Cpu className="w-3.5 h-3.5 text-[#00639b] ml-2.5 mr-1.5" />
            <select
              value={selectedProvider}
              onChange={(e) => onSelectProvider(e.target.value as ProviderKey)}
              className="bg-transparent text-xs font-semibold text-[#1f1f1f] pr-6 py-1 focus:outline-none cursor-pointer"
            >
              {providers.map((p) => (
                <option key={p.key} value={p.key} disabled={!p.isReady}>
                  {p.displayName} {!p.isReady ? '(Bientôt)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* API Key Status Pill */}
          <button
            onClick={onOpenKeyModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm ${
              selectedProvider === 'mock'
                ? 'bg-[#e8def8] text-[#1d192b] hover:bg-[#d0bcff]/40'
                : hasKey
                ? 'bg-[#c4eed0] text-[#072711] hover:bg-[#a6e6b8]'
                : 'bg-[#ffdad6] text-[#410002] hover:bg-[#ffb4ab]'
            }`}
            title="Gérer la clé API Agnes AI"
          >
            <Key className="w-3.5 h-3.5" />
            {selectedProvider === 'mock' ? (
              <span>Mode Sandbox (Sans clé)</span>
            ) : hasKey ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#0a6627]" />
                <span>Clé configurée</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-[#ba1a1a]" />
                <span>Clé API manquante</span>
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

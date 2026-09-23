import React from 'react';
import { X, Play, Download, Trash2, Clock, Film, ExternalLink, Sparkles } from 'lucide-react';
import { GenerationHistoryItem } from '../types/video';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationHistoryItem[];
  onSelectVideo: (item: GenerationHistoryItem) => void;
  onReusePrompt: (prompt: string, aspectRatio?: '16:9' | '9:16' | '1:1') => void;
  onClearHistory: () => void;
  onResumeTask?: (item: GenerationHistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectVideo,
  onReusePrompt,
  onClearHistory,
  onResumeTask,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e1e3e1]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#c2e7ff] text-[#001d35] flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1f1f1f]">Historique Vidéo</h2>
              <p className="text-xs text-[#444746]">{history.length} génération(s) enregistrée(s)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#f0f4f9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-[#747775] space-y-2">
              <Film className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">Aucune vidéo générée pour le moment.</p>
              <p className="text-[11px]">Lancez votre première création avec Agnes AI v2.0 !</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#f0f4f9] border border-[#e1e3e1] hover:border-[#00639b]/40 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-[#c4eed0] text-[#072711]'
                          : item.status === 'failed'
                          ? 'bg-[#ffdad6] text-[#410002]'
                          : 'bg-[#c2e7ff] text-[#001d35]'
                      }`}
                    >
                      {item.status === 'completed'
                        ? 'Terminé'
                        : item.status === 'failed'
                        ? 'Échoué'
                        : 'En cours'}
                    </span>
                    <span className="text-[10px] font-mono text-[#444746]">
                      {item.params.aspectRatio || '16:9'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#747775]">{formatDate(item.createdAt)}</span>
                </div>

                <p className="text-xs text-[#1f1f1f] line-clamp-2 leading-relaxed italic">
                  "{item.params.prompt}"
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[#e1e3e1]/60">
                  <button
                    type="button"
                    onClick={() => {
                      onReusePrompt(item.params.prompt, item.params.aspectRatio);
                      onClose();
                    }}
                    className="text-[11px] font-medium text-[#00639b] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Réutiliser prompt
                  </button>

                  {(item.status === 'pending' || item.status === 'processing') && onResumeTask && (
                    <button
                      type="button"
                      onClick={() => {
                        onResumeTask(item);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#00639b] text-white text-[11px] font-semibold hover:bg-[#004a77] transition-all shadow-xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>Suivre en direct</span>
                    </button>
                  )}

                  {item.videoUrl && item.status === 'completed' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectVideo(item);
                          onClose();
                        }}
                        className="p-1.5 rounded-full bg-white text-[#1f1f1f] hover:bg-[#c2e7ff]/40 shadow-xs border border-[#e1e3e1]"
                        title="Visionner dans le lecteur principal"
                      >
                        <Play className="w-3.5 h-3.5 text-[#00639b]" />
                      </button>
                      <a
                        href={item.videoUrl}
                        download="agnes-video.mp4"
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-full bg-white text-[#1f1f1f] hover:bg-[#c2e7ff]/40 shadow-xs border border-[#e1e3e1]"
                        title="Télécharger MP4"
                      >
                        <Download className="w-3.5 h-3.5 text-[#444746]" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-[#e1e3e1] flex items-center justify-between">
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1 text-xs text-[#ba1a1a] hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Effacer tout l'historique
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#f0f4f9] text-xs font-semibold text-[#1f1f1f] hover:bg-[#e1e3e1]"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

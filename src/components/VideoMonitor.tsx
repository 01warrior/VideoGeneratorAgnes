import React from 'react';
import {
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  XCircle,
  WifiOff,
} from 'lucide-react';
import { VideoTaskResult } from '../types/video';

interface RetryState {
  attempt: number;
  maxAttempts: number;
  nextDelayMs: number;
  error: string;
}

interface VideoMonitorProps {
  taskId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  elapsedMs: number;
  retryState?: RetryState | null;
  error?: string;
  progress?: number;
  onRetry: () => void;
  onCancel: () => void;
}

export const VideoMonitor: React.FC<VideoMonitorProps> = ({
  status,
  elapsedMs,
  retryState,
  error,
  progress,
  onRetry,
  onCancel,
}) => {
  const formatTimer = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // State labels and styling
  const isFailed = status === 'failed';
  const isPending = status === 'pending';
  const isProcessing = status === 'processing';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#e1e3e1]/80 space-y-5 animate-in fade-in duration-300">
      {/* Top status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Animated Spinner or Error icon */}
          {isFailed ? (
            <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          ) : (
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-[#c2e7ff] animate-ping opacity-25" />
              <div className="w-10 h-10 rounded-2xl bg-[#00639b] text-white flex items-center justify-center relative shadow-sm">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#1f1f1f]">
                {isFailed
                  ? 'Échec de la génération'
                  : isPending
                  ? 'Tâche en attente dans la file...'
                  : 'Calcul du modèle agnes-video-v2.0...'}
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  isFailed
                    ? 'bg-[#ffdad6] text-[#410002]'
                    : isPending
                    ? 'bg-[#fedfd8] text-[#3e1d16]'
                    : 'bg-[#c2e7ff] text-[#001d35]'
                }`}
              >
                {isFailed ? 'Erreur' : isPending ? 'En file d’attente' : 'Rendu en cours'}
              </span>
            </div>
            <p className="text-[11px] text-[#444746] mt-0.5">
              Génération haute définition en 121 frames @ 24fps
            </p>
          </div>
        </div>

        {/* Live Stopwatch & Cancel */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0f4f9] text-[#1f1f1f] text-xs font-mono font-semibold border border-[#e1e3e1]">
            <Clock className="w-3.5 h-3.5 text-[#00639b]" />
            <span>{formatTimer(elapsedMs)}</span>
          </div>

          {!isFailed && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
            >
              Interrompre
            </button>
          )}
        </div>
      </div>

      {/* Progress Estimation Bar */}
      {!isFailed && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#444746]">
            <span>Synthèse des 121 frames (24 fps)</span>
            <span className="font-mono text-[11px]">
              {typeof progress === 'number'
                ? `${progress}%`
                : isPending
                ? 'Assignation GPU...'
                : 'Diffusion spatio-temporelle...'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#e1e3e1] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00639b] to-[#004a77] rounded-full transition-all duration-500 ease-out"
              style={{
                width:
                  typeof progress === 'number'
                    ? `${progress}%`
                    : isPending
                    ? '15%'
                    : `${Math.min(92, Math.floor(15 + (elapsedMs / 180000) * 75))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Retry Backoff Banner if Network Transient */}
      {retryState && (
        <div className="bg-[#fff8f6] rounded-2xl p-3 border border-[#ffdad6] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#410002]">
            <WifiOff className="w-4 h-4 text-[#ba1a1a] shrink-0" />
            <span>
              Problème réseau temporaire. Reconnexion automatique (essai {retryState.attempt}/{retryState.maxAttempts}) dans{' '}
              {Math.round(retryState.nextDelayMs / 1000)}s...
            </span>
          </div>
        </div>
      )}

      {/* Error state alert & Retry action */}
      {isFailed && (
        <div className="bg-[#ffdad6] rounded-2xl p-4 text-xs text-[#410002] space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#ba1a1a]">Détail du problème :</p>
              <p className="mt-0.5 text-xs text-[#410002] leading-relaxed">
                {error || "Une erreur est survenue lors de la communication avec l'API Agnes AI."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ba1a1a] text-white text-xs font-semibold hover:bg-[#93000a] transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réessayer la tâche</span>
            </button>
          </div>
        </div>
      )}

      {/* Reassuring timing helper note */}
      {!isFailed && (
        <div className="bg-[#f0f4f9] rounded-2xl p-3.5 text-xs text-[#444746] flex items-start gap-2.5 border border-[#e1e3e1]">
          <Info className="w-4 h-4 text-[#00639b] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#1f1f1f]">Temps de traitement habituel :</strong> Le modèle
            haute fidélité <code className="font-mono text-[#004a77]">agnes-video-v2.0</code> requiert
            généralement <strong>2 à 5 minutes</strong> pour calculer l’ensemble des 121 images avec
            cohérence physique et temporelle. Notre service de polling adaptatif interroge l'API à
            intervalles réguliers jusqu'à la finalisation.
          </p>
        </div>
      )}
    </div>
  );
};

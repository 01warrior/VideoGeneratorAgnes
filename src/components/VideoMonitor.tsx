import React from 'react';
import {
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  XCircle,
  WifiOff,
  Square,
  Maximize2,
  Smartphone,
  Layers,
  Cpu,
  Zap,
} from 'lucide-react';

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
  aspectRatio?: '16:9' | '9:16' | '1:1';
  imageUrl?: string;
  model?: string;
  durationSeconds?: number;
  resolution?: string;
  prompt?: string;
  onRetry: () => void;
  onCancel: () => void;
}

export const VideoMonitor: React.FC<VideoMonitorProps> = ({
  status,
  elapsedMs,
  retryState,
  error,
  progress,
  aspectRatio = '16:9',
  imageUrl,
  model = 'agnes-video-2.5',
  durationSeconds = 5,
  resolution = '720p',
  prompt,
  onRetry,
  onCancel,
}) => {
  const formatTimer = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isFailed = status === 'failed';
  const isPending = status === 'pending';
  const isProcessing = status === 'processing';

  // Dynamic phase calculation for Gemini-style synthesis stages
  const getStageInfo = () => {
    const secs = Math.floor(elapsedMs / 1000);
    if (isPending) {
      return {
        title: 'Attribution GPU & Mise en file',
        subtitle: 'Réservation des ressources neuronales sur le cluster Agnes',
        step: 1,
      };
    }
    if (secs < 10) {
      return {
        title: 'Encodage sémantique du prompt',
        subtitle: `Initialisation des tenseurs du modèle ${model}`,
        step: 1,
      };
    }
    if (secs < 30) {
      return {
        title: 'Diffusion spatio-temporelle',
        subtitle: `Calcul de cohérence cinématique à 24 images/seconde`,
        step: 2,
      };
    }
    if (secs < 60) {
      return {
        title: 'Interpolation dynamique & Lumière',
        subtitle: `Ajustement de la trajectoire et de la fluidité temporelle`,
        step: 3,
      };
    }
    return {
      title: 'Rendu final & Encodage MP4',
      subtitle: `Exportation haute fidélité (${resolution.toUpperCase()})`,
      step: 4,
    };
  };

  const stage = getStageInfo();

  // Aspect ratio styling for the generative card container
  const getRatioClasses = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'w-full max-w-[280px] sm:max-w-[310px] mx-auto aspect-[9/16]';
      case '1:1':
        return 'w-full max-w-[340px] sm:max-w-[380px] mx-auto aspect-square';
      case '16:9':
      default:
        return 'w-full aspect-video';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-[#e1e3e1]/80 space-y-4 animate-in fade-in duration-300">
      {/* 1. Header Information Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#e1e3e1]/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00639b] animate-ping" />
          <span className="font-bold text-xs sm:text-sm text-[#1f1f1f]">
            {isFailed ? 'Génération interrompue' : 'Synthèse vidéo en direct'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#c2e7ff] text-[#001d35] font-semibold">
            {model}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f4f9] text-[#1f1f1f] text-xs font-mono font-semibold border border-[#e1e3e1]">
            <Clock className="w-3.5 h-3.5 text-[#00639b]" />
            <span>{formatTimer(elapsedMs)}</span>
          </div>

          {!isFailed && (
            <button
              type="button"
              onClick={onCancel}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
            >
              Interrompre
            </button>
          )}
        </div>
      </div>

      {/* 2. GEMINI-STYLE RATIO-ADAPTIVE GENERATIVE CARD */}
      {!isFailed ? (
        <div className="relative flex justify-center items-center py-1">
          <div
            className={`relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-500 bg-[#041628] flex flex-col justify-between p-4 sm:p-5 select-none ${getRatioClasses()}`}
          >
            {/* Optional Image Background if Image-to-Video mode */}
            {imageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-md scale-105 pointer-events-none"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            )}

            {/* Generative Aurora Fluid Mesh (Couleur d'accent du site #00639b et Blanc lumineux - Zéro violet) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Aurora Orb 1 (Couleur d'accent du site #00639b / Bleu profond) */}
              <div className="absolute -top-1/4 -left-1/4 w-[120%] h-[120%] rounded-full bg-gradient-to-br from-[#00639b]/65 via-[#0284c7]/40 to-transparent filter blur-3xl animate-aurora-1" />

              {/* Aurora Orb 2 (Blanc éclatant & Dégradé d'accent - Aucun violet) */}
              <div className="absolute -bottom-1/4 -right-1/4 w-[120%] h-[120%] rounded-full bg-gradient-to-tl from-white/35 via-[#00639b]/50 to-transparent filter blur-3xl animate-aurora-2" />

              {/* Aurora Orb 3 (Halo Blanc pur & Lueur azur claire) */}
              <div className="absolute top-1/4 left-1/3 w-[85%] h-[85%] rounded-full bg-gradient-to-r from-white/40 via-[#c2e7ff]/35 to-[#00639b]/30 filter blur-2xl animate-aurora-3" />

              {/* Subtle Scanning Light Beam (Faisceau blanc pur) */}
              <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-scan-beam" />

              {/* Subtle Grid & Particle Texture */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />
            </div>

            {/* Top Floating Badges (Glassmorphism) */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-semibold text-white/90 shadow-sm">
                {aspectRatio === '16:9' ? (
                  <Maximize2 className="w-3 h-3 text-[#38bdf8]" />
                ) : aspectRatio === '9:16' ? (
                  <Smartphone className="w-3 h-3 text-[#c2e7ff]" />
                ) : (
                  <Square className="w-3 h-3 text-[#34d399]" />
                )}
                <span>{aspectRatio}</span>
                <span className="text-white/40">•</span>
                <span className="font-mono text-white/80">{resolution.toUpperCase()}</span>
                <span className="text-white/40">•</span>
                <span>{durationSeconds}s</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-semibold text-cyan-300">
                <Sparkles className="w-3 h-3 animate-spin text-cyan-300" />
                <span>{typeof progress === 'number' ? `${progress}%` : '24 FPS'}</span>
              </div>
            </div>

            {/* Center Synthesis Indicator (Épuré avec le texte uniquement) */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-4 space-y-2">
              {/* Dynamic Stage Info */}
              <div className="space-y-1.5 max-w-[85%]">
                <h4 className="text-sm sm:text-base font-bold text-white tracking-wide drop-shadow-md">
                  {stage.title}
                </h4>
                <p className="text-xs text-white/75 leading-relaxed font-normal">
                  {stage.subtitle}
                </p>
              </div>
            </div>

            {/* Bottom Card Footer: Live Prompt Snippet */}
            <div className="relative z-10 pt-2">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                <p className="text-[10px] sm:text-[11px] text-white/90 italic truncate">
                  {prompt ? `"${prompt}"` : 'Synthèse cinématique Agnes 2.5 en cours...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Error state view inside card */
        <div className="bg-[#fff8f6] rounded-3xl p-6 border border-[#ffdad6] space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#410002]">Échec de la génération</h4>
              <p className="text-xs text-[#ba1a1a] leading-relaxed">
                {error || 'Une erreur est survenue lors de la communication avec les serveurs Agnes.'}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onRetry}
              className="px-5 py-2.5 rounded-full bg-[#ba1a1a] text-white text-xs font-semibold hover:bg-[#93000a] transition-all shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réessayer la génération</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Retry Backoff Banner if Transient Network Issue */}
      {retryState && (
        <div className="bg-[#fff8f6] rounded-2xl p-3 border border-[#ffdad6] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#410002]">
            <WifiOff className="w-4 h-4 text-[#ba1a1a] shrink-0" />
            <span>
              Problème réseau temporaire. Reconnexion automatique ({retryState.attempt}/
              {retryState.maxAttempts}) dans {Math.round(retryState.nextDelayMs / 1000)}s...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

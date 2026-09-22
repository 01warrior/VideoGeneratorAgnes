import React, { useEffect, useRef } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Download, Copy, Check, ExternalLink, Play, Square } from 'lucide-react';
import { VideoMonitor } from './VideoMonitor';
import { VideoPlayer } from './VideoPlayer';

interface MobileResultBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  taskId: string | null;
  videoUrl: string | null;
  prompt: string;
  durationMs?: number | null;
  aspectRatio: '16:9' | '9:16' | '1:1';
  elapsedMs: number;
  progress?: number;
  errorMessage?: string | null;
  retryState?: {
    attempt: number;
    maxAttempts: number;
    nextDelayMs: number;
    error: string;
  } | null;
  onRetry: () => void;
  onCancel: () => void;
}

export const MobileResultBottomSheet: React.FC<MobileResultBottomSheetProps> = ({
  isOpen,
  onClose,
  status,
  taskId,
  videoUrl,
  prompt,
  durationMs,
  aspectRatio,
  elapsedMs,
  progress,
  errorMessage,
  retryState,
  onRetry,
  onCancel,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Prevent background scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="flex-1 w-full" onClick={onClose} />

      {/* Bottom Sheet Modal Container */}
      <div
        ref={sheetRef}
        className="w-full bg-white rounded-t-[32px] shadow-2xl border-t border-[#e1e3e1] max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Drag Handle Bar & Header */}
        <div className="pt-3 pb-2 px-5 border-b border-[#e1e3e1]/60 flex flex-col items-center shrink-0">
          <div className="w-12 h-1.5 bg-[#c7c7c7] rounded-full mb-3" />
          
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'completed' && (
                <div className="w-7 h-7 rounded-full bg-[#c4eed0] text-[#0a6627] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {(status === 'pending' || status === 'processing') && (
                <div className="w-7 h-7 rounded-full bg-[#c2e7ff] text-[#004a77] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
              )}
              {status === 'failed' && (
                <div className="w-7 h-7 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-[#1f1f1f]">
                  {status === 'completed' && 'Résultat de la vidéo'}
                  {(status === 'pending' || status === 'processing') && 'Génération en direct'}
                  {status === 'failed' && 'Erreur de génération'}
                </h3>
                <p className="text-[11px] text-[#444746]">
                  {status === 'completed' && 'Votre vidéo est prête à être visionnée'}
                  {(status === 'pending' || status === 'processing') && 'Modèle agnes-video-v2.0 en cours de calcul'}
                  {status === 'failed' && 'Une anomalie est survenue lors du calcul'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f0f4f9] text-[#444746] hover:text-[#1f1f1f] flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Bottom Sheet Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* 1. Monitoring during processing / pending */}
          {(status === 'pending' || status === 'processing') && taskId && (
            <VideoMonitor
              taskId={taskId}
              status={status}
              elapsedMs={elapsedMs}
              retryState={retryState}
              progress={progress}
              error={errorMessage || undefined}
              onRetry={onRetry}
              onCancel={onCancel}
            />
          )}

          {/* 2. Error state */}
          {status === 'failed' && taskId && (
            <VideoMonitor
              taskId={taskId}
              status="failed"
              elapsedMs={elapsedMs}
              error={errorMessage || undefined}
              onRetry={onRetry}
              onCancel={onCancel}
            />
          )}

          {/* 3. Completed Video Player */}
          {status === 'completed' && videoUrl && (
            <VideoPlayer
              videoUrl={videoUrl}
              prompt={prompt}
              durationMs={durationMs || elapsedMs}
              aspectRatio={aspectRatio}
            />
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Prevent background scroll ONLY on actual mobile screens (< 1024px)
  // On PC / Desktop, body scroll must NEVER be blocked!
  useEffect(() => {
    const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024;

    if (isOpen && isMobile()) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    const handleResize = () => {
      if (!isMobile()) {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      } else if (isOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Touch swipe-to-dismiss handlers on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    const diff = touchCurrentY.current - touchStartY.current;
    if (diff > 80) {
      setDragOffset(0);
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  if (!isOpen || status === 'idle') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Résultat vidéo mobile"
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop tap to close */}
      <div className="flex-1 w-full" onClick={onClose} aria-hidden="true" />

      {/* Bottom Sheet Modal Container */}
      <div
        ref={sheetRef}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: dragOffset === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
        className="w-full bg-white rounded-t-[32px] shadow-2xl border-t border-[#e1e3e1] max-h-[92dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 pb-6"
      >
        {/* Drag Handle Bar & Header with Touch swipe down */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="pt-3 pb-3 px-5 border-b border-[#e1e3e1]/60 flex flex-col items-center shrink-0 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-12 h-1.5 bg-[#c7c7c7] rounded-full mb-3" />

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {status === 'completed' && (
                <div className="w-8 h-8 rounded-full bg-[#c4eed0] text-[#0a6627] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {(status === 'pending' || status === 'processing') && (
                <div className="w-8 h-8 rounded-full bg-[#c2e7ff] text-[#004a77] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
              )}
              {status === 'failed' && (
                <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#1f1f1f] truncate">
                  {status === 'completed' && 'Résultat de la vidéo'}
                  {(status === 'pending' || status === 'processing') && 'Génération en direct'}
                  {status === 'failed' && 'Erreur de génération'}
                </h3>
                <p className="text-[11px] text-[#444746] truncate">
                  {status === 'completed' && 'Votre vidéo est prête'}
                  {(status === 'pending' || status === 'processing') && 'Calcul du modèle Agnes Video 2.5...'}
                  {status === 'failed' && 'Une anomalie est survenue'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f0f4f9] text-[#444746] hover:text-[#1f1f1f] active:bg-[#e1e3e1] flex items-center justify-center transition-colors shrink-0 ml-2"
              aria-label="Fermer le panneau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Bottom Sheet Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 overscroll-contain">
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

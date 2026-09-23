import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  Sparkles,
  Play,
  Film,
  AlertCircle,
  Key,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PromptComposer } from './components/PromptComposer';
import { GenerationSettings } from './components/GenerationSettings';
import { VideoMonitor } from './components/VideoMonitor';
import { VideoPlayer } from './components/VideoPlayer';
import { MobileResultBottomSheet } from './components/MobileResultBottomSheet';
import { HistoryDrawer } from './components/HistoryDrawer';
import { videoProviderFactory } from './services/providers/factory';
import { VideoPollingService } from './services/pollingService';
import {
  ProviderKey,
  VideoGenerationParams,
  GenerationHistoryItem,
} from './types/video';

const DEFAULT_PROMPT =
  'Un léopard des neiges au pelage épais s’avance à pas feutrés sur une crête rocheuse escarpée dans l’Himalaya. Des cristaux de neige poudreuse tourbillonnent sous ses pattes. Gros plan en travelling latéral stabilisé, objectif téléobjectif 200mm, lumière dorée d’aube hivernale rasante, 24fps.';

export default function App() {
  // 1. API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('agnes_api_key') || '';
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // 2. Form Parameters
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [selectedModel, setSelectedModel] = useState<
    'agnes-video-2.5' | 'agnes-video-2.5-flash' | 'agnes-video-v2.0'
  >('agnes-video-2.5');
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  const [resolution, setResolution] = useState<'720p' | '1080p' | '2k'>('720p');

  // 4. Generation & Polling State
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<
    'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  >('idle');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationDurationMs, setGenerationDurationMs] = useState<number | null>(null);
  const [retryState, setRetryState] = useState<{
    attempt: number;
    maxAttempts: number;
    nextDelayMs: number;
    error: string;
  } | null>(null);

  // 5. History State
  const [history, setHistory] = useState<GenerationHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('agnes_video_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileResultOpen, setIsMobileResultOpen] = useState(false);

  // Responsive desktop detection (to prevent mounting hidden background video players on mobile)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (e.matches) {
        setIsMobileResultOpen(false);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Active polling reference
  const pollingServiceRef = useRef<VideoPollingService | null>(null);

  // Persist API key
  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('agnes_api_key', newKey);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollingServiceRef.current?.stop();
    };
  }, []);

  // Update history in localStorage
  const saveHistoryItem = (item: GenerationHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 30);
      localStorage.setItem('agnes_video_history', JSON.stringify(updated));
      return updated;
    });
  };

  const updateHistoryStatus = (
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    videoUrl?: string,
    error?: string,
    durationMs?: number
  ) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              videoUrl: videoUrl || item.videoUrl,
              error: error || item.error,
              completedAt: status === 'completed' || status === 'failed' ? Date.now() : item.completedAt,
              durationMs: durationMs || item.durationMs,
            }
          : item
      );
      localStorage.setItem('agnes_video_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Shared Polling Engine (Used for new generation, reload recovery, and history resume)
  const attachPollingService = (
    taskId: string,
    effectiveKey: string,
    historyId: string,
    startedAt: number
  ) => {
    pollingServiceRef.current?.stop();

    const providerInstance = videoProviderFactory.getProvider('agnes');
    const poller = new VideoPollingService(
      taskId,
      providerInstance,
      effectiveKey,
      {
        onStatusUpdate: (result, elapsed) => {
          setTaskStatus(result.status);
          setElapsedMs(elapsed);
          if (typeof result.progress === 'number') {
            setProgress(result.progress);
          }
          updateHistoryStatus(historyId, result.status);
        },
        onSuccess: (videoUrl, elapsed) => {
          setTaskStatus('completed');
          setVideoResultUrl(videoUrl);
          setGenerationDurationMs(elapsed);
          if (!isDesktop) {
            setIsMobileResultOpen(true);
          }
          updateHistoryStatus(historyId, 'completed', videoUrl, undefined, elapsed);
          localStorage.removeItem('agnes_active_generation');
        },
        onError: (errorText, elapsed) => {
          setTaskStatus('failed');
          setErrorMessage(errorText);
          setGenerationDurationMs(elapsed);
          updateHistoryStatus(historyId, 'failed', undefined, errorText, elapsed);
          localStorage.removeItem('agnes_active_generation');
        },
        onRetry: (attempt, maxAttempts, nextDelayMs, error) => {
          setRetryState({ attempt, maxAttempts, nextDelayMs, error });
        },
        onTick: (elapsed) => {
          setElapsedMs(elapsed);
        },
      },
      {
        initialIntervalMs: 6000,
        maxIntervalMs: 15000,
        intervalStepMs: 1500,
        maxRetries: 5,
        globalTimeoutMs: 15 * 60 * 1000,
        initialStartTime: startedAt,
      }
    );

    pollingServiceRef.current = poller;
    poller.start();
  };

  // Restore Active Generation after page reload & Clean up expired pending records
  useEffect(() => {
    try {
      const now = Date.now();

      // 1. Clean up stale tasks in history that were left pending for > 20 minutes
      setHistory((prev) => {
        let modified = false;
        const cleaned = prev.map((item) => {
          if (
            (item.status === 'pending' || item.status === 'processing') &&
            now - item.createdAt > 20 * 60 * 1000
          ) {
            modified = true;
            return {
              ...item,
              status: 'failed' as const,
              error: 'Session interrompue ou délai dépassé',
              completedAt: now,
            };
          }
          return item;
        });
        if (modified) {
          localStorage.setItem('agnes_video_history', JSON.stringify(cleaned));
        }
        return cleaned;
      });

      // 2. Check active generation in progress
      const rawActive = localStorage.getItem('agnes_active_generation');
      if (!rawActive) return;

      const active = JSON.parse(rawActive) as {
        historyId: string;
        taskId: string;
        params: VideoGenerationParams;
        effectiveKey: string;
        startedAt: number;
      };

      const age = now - (active.startedAt || 0);

      // If active task is > 15 minutes, expire it
      if (age >= 15 * 60 * 1000) {
        localStorage.removeItem('agnes_active_generation');
        updateHistoryStatus(
          active.historyId,
          'failed',
          undefined,
          "Délai d'attente dépassé après rafraîchissement (15 min)"
        );
        return;
      }

      // Resume state smoothly
      setCurrentTaskId(active.taskId);
      setTaskStatus('processing');
      setElapsedMs(age);

      if (active.params) {
        if (active.params.prompt) setPrompt(active.params.prompt);
        if (active.params.aspectRatio) setAspectRatio(active.params.aspectRatio);
        if (active.params.model) setSelectedModel(active.params.model);
        if (active.params.durationSeconds) setDurationSeconds(active.params.durationSeconds);
        if (active.params.resolution) setResolution(active.params.resolution);
      }

      // Only open mobile result sheet if actually on mobile
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        setIsMobileResultOpen(true);
      }

      // Resume polling
      attachPollingService(
        active.taskId,
        active.effectiveKey || '',
        active.historyId,
        active.startedAt
      );
    } catch (err) {
      console.warn('Could not restore in-progress generation:', err);
      localStorage.removeItem('agnes_active_generation');
    }
  }, []);

  // Launch Video Generation (supports optional useServerKey flag)
  const handleGenerate = async (options?: { useServerKey?: boolean }) => {
    if (!prompt.trim()) return;

    const useServer = options?.useServerKey === true;

    // Check if key is set (unless user explicitly chose server key test)
    if (!apiKey.trim() && !useServer) {
      setIsKeyModalOpen(true);
      return;
    }

    // Stop any existing polling
    pollingServiceRef.current?.stop();

    const effectiveKey = useServer ? '' : apiKey.trim();
    const providerInstance = videoProviderFactory.getProvider('agnes');
    const params: VideoGenerationParams = {
      prompt: prompt.trim(),
      imageUrl: imageUrl.trim() || undefined,
      aspectRatio,
      durationSeconds,
      model: selectedModel,
      resolution,
    };

    setTaskStatus('pending');
    setErrorMessage(null);
    setVideoResultUrl(null);
    setProgress(undefined);
    setElapsedMs(0);
    setRetryState(null);

    // Open bottom sheet ONLY on mobile device
    if (!isDesktop) {
      setIsMobileResultOpen(true);
    } else {
      setIsMobileResultOpen(false);
    }

    const historyId = 'gen_' + Date.now();
    const startedAt = Date.now();

    try {
      // 1. Create task via Provider Adapter
      const taskId = await providerInstance.createTask(params, effectiveKey);
      setCurrentTaskId(taskId);

      const historyRecord: GenerationHistoryItem = {
        id: historyId,
        taskId,
        provider: 'agnes',
        params,
        status: 'pending',
        createdAt: startedAt,
      };
      saveHistoryItem(historyRecord);

      // Persist active generation so reloading never leaves a task abandoned
      localStorage.setItem(
        'agnes_active_generation',
        JSON.stringify({
          historyId,
          taskId,
          params,
          effectiveKey,
          startedAt,
        })
      );

      // 2. Launch Polling Service
      attachPollingService(taskId, effectiveKey, historyId, startedAt);
    } catch (err: unknown) {
      localStorage.removeItem('agnes_active_generation');
      const msg = err instanceof Error ? err.message : 'Erreur inconnue lors du démarrage';
      setTaskStatus('failed');
      setErrorMessage(msg);
      updateHistoryStatus(historyId, 'failed', undefined, msg);
    }
  };

  const handleCancelGeneration = () => {
    pollingServiceRef.current?.stop();
    localStorage.removeItem('agnes_active_generation');
    if (currentTaskId) {
      const item = history.find((h) => h.taskId === currentTaskId);
      if (item) {
        updateHistoryStatus(item.id, 'failed', undefined, 'Génération annulée par l’utilisateur');
      }
    }
    setTaskStatus('idle');
    setCurrentTaskId(null);
    setRetryState(null);
    setIsMobileResultOpen(false);
  };

  const handleResumeTask = (item: GenerationHistoryItem) => {
    if (!item.taskId) return;
    setCurrentTaskId(item.taskId);
    setTaskStatus(item.status);
    setPrompt(item.params.prompt);
    if (item.params.aspectRatio) setAspectRatio(item.params.aspectRatio);
    if (item.params.model) setSelectedModel(item.params.model);
    if (item.params.durationSeconds) setDurationSeconds(item.params.durationSeconds);
    if (item.params.resolution) setResolution(item.params.resolution);

    if (!isDesktop) {
      setIsMobileResultOpen(true);
    }

    const startedAt = item.createdAt || Date.now();
    const age = Math.max(0, Date.now() - startedAt);
    setElapsedMs(age);

    const effectiveKey = apiKey.trim();
    attachPollingService(item.taskId, effectiveKey, item.id, startedAt);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('agnes_video_history');
    localStorage.removeItem('agnes_active_generation');
  };

  const isGenerating = taskStatus === 'pending' || taskStatus === 'processing';

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-[#1f1f1f] flex flex-col font-sans selection:bg-[#c2e7ff] selection:text-[#001d35]">
      {/* 1. Top Bar */}
      <Header
        apiKey={apiKey}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Missing API Key Guidance Banner */}
        {!apiKey && (
          <div className="bg-[#fff8f6] rounded-3xl p-4 sm:p-5 border border-[#ffdad6] shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#410002]">
                  Clé API Agnes AI requise
                </h3>
                <p className="text-xs text-[#444746]">
                  Renseignez votre clé d'API <code className="font-mono text-[#004a77]">sk-...</code> pour lancer la synthèse vidéo sur la nouvelle série officielle agnes-video-2.5.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#00639b] text-white text-xs font-semibold hover:bg-[#004a77] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Renseigner ma clé API</span>
            </button>
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT COLUMN: Input Controls (Cols 1-7) */}
          <section className="lg:col-span-7 flex flex-col space-y-6">
            {/* Prompt Composer */}
            <PromptComposer
              prompt={prompt}
              onChangePrompt={setPrompt}
              onSelectAspectRatio={setAspectRatio}
              disabled={isGenerating}
              className="h-full justify-between"
            />

            {/* Generation Settings */}
            <GenerationSettings
              aspectRatio={aspectRatio}
              onSelectAspectRatio={setAspectRatio}
              imageUrl={imageUrl}
              onChangeImageUrl={setImageUrl}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              durationSeconds={durationSeconds}
              onChangeDuration={setDurationSeconds}
              resolution={resolution}
              onChangeResolution={setResolution}
              disabled={isGenerating}
            />
          </section>

          {/* RIGHT COLUMN: Output, Live Monitor & Showcase (Cols 8-12) */}
          <section className="lg:col-span-5 flex flex-col space-y-6">
            {/* Live Monitoring state (Desktop uniquement - Mobile géré par le BottomSheet) */}
            {isDesktop && isGenerating && currentTaskId && (
              <VideoMonitor
                taskId={currentTaskId}
                status={taskStatus}
                elapsedMs={elapsedMs}
                retryState={retryState}
                progress={progress}
                error={errorMessage || undefined}
                onRetry={handleGenerate}
                onCancel={handleCancelGeneration}
              />
            )}

            {/* Error State Banner (Desktop uniquement - Mobile géré par le BottomSheet) */}
            {isDesktop && taskStatus === 'failed' && currentTaskId && (
              <VideoMonitor
                taskId={currentTaskId}
                status="failed"
                elapsedMs={elapsedMs}
                error={errorMessage || undefined}
                onRetry={handleGenerate}
                onCancel={handleCancelGeneration}
              />
            )}

            {/* Completed HTML5 Video Player (Monté UNIQUEMENT sur Desktop pour éviter tout son/vidéo fantôme en arrière-plan) */}
            {isDesktop && taskStatus === 'completed' && videoResultUrl && (
              <VideoPlayer
                videoUrl={videoResultUrl}
                prompt={prompt}
                durationMs={generationDurationMs || elapsedMs}
                aspectRatio={aspectRatio}
              />
            )}

            {/* Idle Welcome / Showcase Card */}
            {((isDesktop && taskStatus === 'idle') || !isDesktop) && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#e1e3e1]/80 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Image d'illustration Agnes AI */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-inner border border-[#e1e3e1]/80 bg-[#1f1f1f]">
                    <img
                      src="https://i.ytimg.com/vi/W7KVCWVTadI/maxresdefault.jpg"
                      alt="Studio Vidéo Agnes AI 2.5"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#c2e7ff]" />
                      Moteur Agnes Video 2.5
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#1f1f1f]">
                        Studio Vidéo Agnes AI 2.5
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c4eed0] text-[#072711] font-semibold">
                        Série 2.5
                      </span>
                    </div>
                    <p className="text-xs text-[#444746] mt-1 leading-relaxed">
                      Plateforme de synthèse vidéo par intelligence artificielle propulsée par la nouvelle série officielle <strong className="text-[#1f1f1f]">agnes-video-2.5</strong> (+165 Elo, dynamique spatio-temporelle de pointe).
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-start gap-2.5 text-xs text-[#444746]">
                      <CheckCircle2 className="w-4 h-4 text-[#0a6627] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1f1f1f]">Modèles 2.5 & 2.5-Flash :</strong> Rendu de 4 à 12 secondes avec contrôle temporel précis et physique cinématique.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#444746]">
                      <CheckCircle2 className="w-4 h-4 text-[#0a6627] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1f1f1f]">Résolutions HD / 2K :</strong> Formats 16:9, 9:16 et 1:1 adaptés à la diffusion professionnelle et aux réseaux sociaux.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#444746]">
                      <CheckCircle2 className="w-4 h-4 text-[#0a6627] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1f1f1f]">Polling Adaptatif & Backoff :</strong> Intervalle dynamique optimisé avec reconnexion automatique en cas de surcharge.
                      </span>
                    </div>
                  </div>
                </div>

                {/* If history exists, show quick link to latest video */}
                {history.length > 0 && history[0].videoUrl && (
                  <div className="pt-3 border-t border-[#e1e3e1]">
                    <p className="text-[11px] font-semibold text-[#444746] mb-2">
                      Dernière vidéo enregistrée :
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoResultUrl(history[0].videoUrl || null);
                        setTaskStatus('completed');
                        setPrompt(history[0].params.prompt);
                        setAspectRatio(history[0].params.aspectRatio || '16:9');
                        setIsMobileResultOpen(true);
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-[#f0f4f9] hover:bg-[#c2e7ff]/30 border border-[#e1e3e1] transition-all flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Play className="w-4 h-4 text-[#00639b] shrink-0" />
                        <span className="text-xs text-[#1f1f1f] truncate italic">
                          "{history[0].params.prompt}"
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#00639b] shrink-0">
                        Ouvrir
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Generate Action Card (positionné juste en bas de Studio Vidéo) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#e1e3e1]/80 flex flex-col gap-4">
              {/* Informations techniques en haut */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[#e1e3e1]/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1f1f1f] text-sm">{selectedModel}</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#c2e7ff] text-[#004a77] font-mono font-semibold">
                    {durationSeconds}s • {resolution.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#444746]">
                  Format :{' '}
                  <span className="font-semibold text-[#1f1f1f]">
                    {aspectRatio} ({aspectRatio === '16:9' ? '1152×768' : aspectRatio === '9:16' ? '768×1152' : '768×768'})
                  </span>
                </p>
              </div>

              {/* Bouton Générer la vidéo pleine largeur en bas */}
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                className={`w-full py-4 rounded-2xl font-bold text-base tracking-wide shadow-md transition-all flex items-center justify-center gap-2.5 ${
                  isGenerating
                    ? 'bg-[#e1e3e1] text-[#747775] cursor-not-allowed'
                    : 'bg-[#00639b] hover:bg-[#004a77] text-white active:scale-99 hover:shadow-lg'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin text-[#00639b]" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>Générer la vidéo</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* 3. API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
        onClose={() => setIsKeyModalOpen(false)}
        onUseServerKey={() => handleGenerate({ useServerKey: true })}
      />

      {/* 4. History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onResumeTask={handleResumeTask}
        onSelectVideo={(item) => {
          if (item.videoUrl) {
            setVideoResultUrl(item.videoUrl);
            setTaskStatus('completed');
            setPrompt(item.params.prompt);
            setAspectRatio(item.params.aspectRatio || '16:9');
            setGenerationDurationMs(item.durationMs || null);
            if (!isDesktop) {
              setIsMobileResultOpen(true);
            }
          }
        }}
        onReusePrompt={(newPrompt, newRatio) => {
          setPrompt(newPrompt);
          if (newRatio) setAspectRatio(newRatio);
        }}
        onClearHistory={handleClearHistory}
      />

      {/* 5. Mobile Result & Live Monitor BottomSheet (Monté STRICTEMENT sur Mobile pour protéger à 100% le scroll PC) */}
      {!isDesktop && (
        <MobileResultBottomSheet
          isOpen={isMobileResultOpen}
          onClose={() => setIsMobileResultOpen(false)}
          status={taskStatus}
          taskId={currentTaskId}
          videoUrl={videoResultUrl}
          prompt={prompt}
          durationMs={generationDurationMs || elapsedMs}
          aspectRatio={aspectRatio}
          elapsedMs={elapsedMs}
          progress={progress}
          errorMessage={errorMessage}
          retryState={retryState}
          onRetry={handleGenerate}
          onCancel={handleCancelGeneration}
        />
      )}

      {/* 6. Floating Action Pill on Mobile (if bottom sheet is closed but task is active or completed) */}
      {!isDesktop && taskStatus !== 'idle' && !isMobileResultOpen && (
        <aside
          aria-label="Statut mobile"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden w-auto max-w-[92%]"
        >
          <button
            type="button"
            onClick={() => setIsMobileResultOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#001d35] hover:bg-[#003355] text-white font-semibold text-xs shadow-2xl border border-white/20 active:scale-95 transition-all whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-[#c2e7ff]" />
                <span>En cours ({Math.round(elapsedMs / 1000)}s) • Voir le direct</span>
              </>
            ) : taskStatus === 'completed' ? (
              <>
                <Play className="w-4 h-4 text-[#c4eed0]" />
                <span>Vidéo prête • Ouvrir le résultat 🎉</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-[#ffdad6]" />
                <span>Erreur de calcul • Voir détails</span>
              </>
            )}
          </button>
        </aside>
      )}
    </div>
  );
}

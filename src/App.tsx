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

  // Launch Video Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check if key is set
    if (!apiKey.trim()) {
      setIsKeyModalOpen(true);
      return;
    }

    // Stop any existing polling
    pollingServiceRef.current?.stop();

    const providerInstance = videoProviderFactory.getProvider('agnes');
    const params: VideoGenerationParams = {
      prompt: prompt.trim(),
      imageUrl: imageUrl.trim() || undefined,
      aspectRatio,
      durationSeconds: 5,
    };

    setTaskStatus('pending');
    setErrorMessage(null);
    setVideoResultUrl(null);
    setProgress(undefined);
    setElapsedMs(0);
    setRetryState(null);

    const historyId = 'gen_' + Date.now();

    try {
      // 1. Create task via Provider Adapter
      const taskId = await providerInstance.createTask(params, apiKey);
      setCurrentTaskId(taskId);

      const historyRecord: GenerationHistoryItem = {
        id: historyId,
        taskId,
        provider: 'agnes',
        params,
        status: 'pending',
        createdAt: Date.now(),
      };
      saveHistoryItem(historyRecord);

      // 2. Launch Polling Service
      const poller = new VideoPollingService(
        taskId,
        providerInstance,
        apiKey,
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
            updateHistoryStatus(historyId, 'completed', videoUrl, undefined, elapsed);
          },
          onError: (errorText, elapsed) => {
            setTaskStatus('failed');
            setErrorMessage(errorText);
            setGenerationDurationMs(elapsed);
            updateHistoryStatus(historyId, 'failed', undefined, errorText, elapsed);
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
        }
      );

      pollingServiceRef.current = poller;
      poller.start();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue lors du démarrage';
      setTaskStatus('failed');
      setErrorMessage(msg);
      updateHistoryStatus(historyId, 'failed', undefined, msg);
    }
  };

  const handleCancelGeneration = () => {
    pollingServiceRef.current?.stop();
    setTaskStatus('idle');
    setCurrentTaskId(null);
    setRetryState(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('agnes_video_history');
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
                  Renseignez votre clé d'API <code className="font-mono text-[#004a77]">sk-...</code> pour lancer la synthèse vidéo sur le moteur officiel agnes-video-v2.0.
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
              disabled={isGenerating}
            />
          </section>

          {/* RIGHT COLUMN: Output, Live Monitor & Showcase (Cols 8-12) */}
          <section className="lg:col-span-5 flex flex-col space-y-6">
            {/* Live Monitoring state */}
            {isGenerating && currentTaskId && (
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

            {/* Error State Banner */}
            {taskStatus === 'failed' && currentTaskId && (
              <VideoMonitor
                taskId={currentTaskId}
                status="failed"
                elapsedMs={elapsedMs}
                error={errorMessage || undefined}
                onRetry={handleGenerate}
                onCancel={handleCancelGeneration}
              />
            )}

            {/* Completed HTML5 Video Player */}
            {taskStatus === 'completed' && videoResultUrl && (
              <VideoPlayer
                videoUrl={videoResultUrl}
                prompt={prompt}
                durationMs={generationDurationMs || elapsedMs}
                aspectRatio={aspectRatio}
              />
            )}

            {/* Idle Welcome / Showcase Card */}
            {taskStatus === 'idle' && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#e1e3e1]/80 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Image d'illustration Agnes AI */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-inner border border-[#e1e3e1]/80 bg-[#1f1f1f]">
                    <img
                      src="https://i.ytimg.com/vi/W7KVCWVTadI/maxresdefault.jpg"
                      alt="Studio Vidéo Agnes AI v2.0"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      Moteur Agnes AI 2.0
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1f1f1f]">
                      Studio Vidéo Agnes AI v2.0
                    </h3>
                    <p className="text-xs text-[#444746] mt-1 leading-relaxed">
                      Plateforme de synthèse vidéo par intelligence artificielle propulsée par le modèle officiel <strong className="text-[#1f1f1f]">agnes-video-v2.0</strong>.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-start gap-2.5 text-xs text-[#444746]">
                      <CheckCircle2 className="w-4 h-4 text-[#0a6627] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1f1f1f]">Modèle agnes-video-v2.0 :</strong> Rendu de
                        121 images consécutives à 24 images par seconde pour une fluidité naturelle.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#444746]">
                      <CheckCircle2 className="w-4 h-4 text-[#0a6627] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1f1f1f]">Résolution Cinématographique :</strong> Formats
                        16:9 (1152×768), 9:16 (768×1152) et 1:1 optimisés pour la production vidéo.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#444746]">
                      <CheckCircle2 className="w-4 h-4 text-[#0a6627] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#1f1f1f]">Polling Adaptatif & Backoff :</strong>{' '}
                        Intervalle dynamique de 6s à 15s avec reconnexion automatique en cas d'erreur
                        réseau.
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
                  <span className="font-bold text-[#1f1f1f] text-sm">agnes-video-v2.0</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f0f4f9] text-[#004a77] font-mono font-semibold">
                    121 frames @ 24fps
                  </span>
                </div>
                <p className="text-xs text-[#444746]">
                  Résolution normalisée :{' '}
                  <span className="font-semibold text-[#1f1f1f]">
                    {aspectRatio === '16:9'
                      ? '1152×768 px'
                      : aspectRatio === '9:16'
                      ? '768×1152 px'
                      : '768×768 px'}
                  </span>
                </p>
              </div>

              {/* Bouton Générer la vidéo pleine largeur en bas */}
              <button
                type="button"
                onClick={handleGenerate}
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
      />

      {/* 4. History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectVideo={(item) => {
          if (item.videoUrl) {
            setVideoResultUrl(item.videoUrl);
            setTaskStatus('completed');
            setPrompt(item.params.prompt);
            setAspectRatio(item.params.aspectRatio || '16:9');
            setGenerationDurationMs(item.durationMs || null);
          }
        }}
        onReusePrompt={(newPrompt, newRatio) => {
          setPrompt(newPrompt);
          if (newRatio) setAspectRatio(newRatio);
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}

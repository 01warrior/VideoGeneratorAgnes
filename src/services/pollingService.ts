import { IVideoProvider, VideoTaskResult } from '../types/video';

export interface PollingCallbacks {
  onStatusUpdate: (result: VideoTaskResult, elapsedMs: number) => void;
  onSuccess: (videoUrl: string, elapsedMs: number) => void;
  onError: (errorMessage: string, elapsedMs: number) => void;
  onRetry?: (attempt: number, maxAttempts: number, nextDelayMs: number, error: string) => void;
  onTick?: (elapsedMs: number) => void;
}

export interface PollingOptions {
  initialIntervalMs?: number; // 6000ms (6s)
  maxIntervalMs?: number; // 15000ms (15s)
  intervalStepMs?: number; // 1500ms
  maxRetries?: number; // 5 retries on transient errors
  globalTimeoutMs?: number; // 15 minutes (900000ms)
}

export class VideoPollingService {
  private taskId: string;
  private provider: IVideoProvider;
  private apiKey: string;
  private callbacks: PollingCallbacks;
  private options: Required<PollingOptions>;

  private isRunning: boolean = false;
  private startTime: number = 0;
  private currentInterval: number;
  private timerId: NodeJS.Timeout | null = null;
  private tickIntervalId: NodeJS.Timeout | null = null;
  private consecutiveErrors: number = 0;

  constructor(
    taskId: string,
    provider: IVideoProvider,
    apiKey: string,
    callbacks: PollingCallbacks,
    options?: PollingOptions
  ) {
    this.taskId = taskId;
    this.provider = provider;
    this.apiKey = apiKey;
    this.callbacks = callbacks;

    this.options = {
      initialIntervalMs: options?.initialIntervalMs ?? 6000, // 6s initial
      maxIntervalMs: options?.maxIntervalMs ?? 15000, // 15s max
      intervalStepMs: options?.intervalStepMs ?? 1500, // +1.5s per poll
      maxRetries: options?.maxRetries ?? 5, // 5 retries
      globalTimeoutMs: options?.globalTimeoutMs ?? 15 * 60 * 1000, // 15 minutes
    };

    this.currentInterval = this.options.initialIntervalMs;
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();
    this.consecutiveErrors = 0;
    this.currentInterval = this.options.initialIntervalMs;

    // Start 1-second interval for UI live timer
    this.tickIntervalId = setInterval(() => {
      if (!this.isRunning) return;
      const elapsed = Date.now() - this.startTime;

      // Check global timeout
      if (elapsed >= this.options.globalTimeoutMs) {
        this.stop();
        this.callbacks.onError(
          `Délai d'attente global dépassé (15 minutes). La tâche ${this.taskId} est peut-être toujours en cours de calcul sur les serveurs Agnes. Vous pouvez réessayer de vérifier le statut.`,
          elapsed
        );
        return;
      }

      this.callbacks.onTick?.(elapsed);
    }, 1000);

    // Initial check after short grace delay
    this.scheduleNextPoll(1000);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  private scheduleNextPoll(delayMs: number): void {
    if (!this.isRunning) return;

    this.timerId = setTimeout(async () => {
      await this.pollOnce();
    }, delayMs);
  }

  private async pollOnce(): Promise<void> {
    if (!this.isRunning) return;

    const elapsed = Date.now() - this.startTime;

    try {
      const result: VideoTaskResult = await this.provider.checkStatus(this.taskId, this.apiKey);

      if (!this.isRunning) return;

      // If network call succeeded, reset transient error counter
      this.consecutiveErrors = 0;

      // Notify status update
      this.callbacks.onStatusUpdate(result, elapsed);

      if (result.status === 'completed' && result.videoUrl) {
        this.stop();
        this.callbacks.onSuccess(result.videoUrl, elapsed);
        return;
      }

      if (result.status === 'failed') {
        this.stop();
        this.callbacks.onError(
          result.error || 'La génération vidéo a échoué côté serveur Agnes.',
          elapsed
        );
        return;
      }

      // If pending or processing: adapt interval (increase by step until max)
      this.currentInterval = Math.min(
        this.options.maxIntervalMs,
        this.currentInterval + this.options.intervalStepMs
      );

      this.scheduleNextPoll(this.currentInterval);
    } catch (err: unknown) {
      if (!this.isRunning) return;

      this.consecutiveErrors += 1;
      const errorMsg = err instanceof Error ? err.message : 'Erreur réseau inattendue';

      // Check if max retries exceeded
      if (this.consecutiveErrors > this.options.maxRetries) {
        this.stop();
        this.callbacks.onError(
          `Échec après ${this.options.maxRetries} tentatives consécutives (${errorMsg}). Vérifiez votre connexion ou l'état de l'API.`,
          elapsed
        );
        return;
      }

      // Exponential backoff delay: 2000 * 2^(errors - 1)
      const backoffDelay = Math.min(30000, 2000 * Math.pow(2, this.consecutiveErrors - 1));

      this.callbacks.onRetry?.(
        this.consecutiveErrors,
        this.options.maxRetries,
        backoffDelay,
        errorMsg
      );

      this.scheduleNextPoll(backoffDelay);
    }
  }

  public getElapsedTime(): number {
    return this.startTime > 0 ? Date.now() - this.startTime : 0;
  }
}

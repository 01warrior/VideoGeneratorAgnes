import { IVideoProvider, VideoGenerationParams, VideoTaskResult } from '../../types/video';

export class AgnesVideoProvider implements IVideoProvider {
  public readonly name = 'agnes';
  public readonly displayName = 'Agnes AI (agnes-video-v2.0)';
  public readonly description = 'Moteur haute fidélité Agnes v2.0 (121 frames @ 24fps) avec rendu cinématique.';

  /**
   * Normalisation stricte des dimensions selon le ratio demandé:
   * 16:9 -> 1152x768
   * 9:16 -> 768x1152
   * 1:1  -> 768x768
   */
  private getNormalizedDimensions(aspectRatio?: '16:9' | '9:16' | '1:1'): { width: number; height: number } {
    switch (aspectRatio) {
      case '9:16':
        return { width: 768, height: 1152 };
      case '1:1':
        return { width: 768, height: 768 };
      case '16:9':
      default:
        return { width: 1152, height: 768 };
    }
  }

  /**
   * Crée une nouvelle tâche de génération de vidéo via l'API Agnes AI.
   * Utilise notre route proxy /api/videos/create pour garantir la sécurité et éliminer les blocages CORS.
   */
  public async createTask(params: VideoGenerationParams, apiKey: string): Promise<string> {
    const { width, height } = this.getNormalizedDimensions(params.aspectRatio);

    const payload = {
      provider: this.name,
      apiKey: apiKey?.trim() || undefined,
      params: {
        prompt: params.prompt,
        imageUrl: params.imageUrl?.trim() || undefined,
        aspectRatio: params.aspectRatio || '16:9',
        width,
        height,
        num_frames: 121,
        frame_rate: 24,
      },
    };

    const res = await fetch('/api/videos/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey.trim()}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Erreur de création Agnes (${res.status})`);
    }

    if (!data.taskId) {
      throw new Error("L'API Agnes n'a pas retourné d'identifiant de vidéo valide (video_id).");
    }

    return data.taskId;
  }

  /**
   * Vérifie le statut d'une tâche de génération vidéo en cours.
   */
  public async checkStatus(taskId: string, apiKey: string): Promise<VideoTaskResult> {
    const params = new URLSearchParams({
      taskId,
      provider: this.name,
    });

    const res = await fetch(`/api/videos/status?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey.trim()}` } : {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        status: 'failed',
        error: data.error || `Erreur de récupération du statut (${res.status})`,
      };
    }

    return {
      status: data.status || 'processing',
      videoUrl: data.videoUrl,
      error: data.error,
      progress: data.progress,
    };
  }
}

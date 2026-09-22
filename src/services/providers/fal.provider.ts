import { IVideoProvider, VideoGenerationParams, VideoTaskResult } from '../../types/video';

/**
 * Adaptateur Fal.ai (Luma / CogVideoX / Fast-SVD)
 * Découplé et prêt à être étendu sans impacter l'UI.
 */
export class FalVideoProvider implements IVideoProvider {
  public readonly name = 'fal';
  public readonly displayName = 'Fal.ai (Fast Video Pipeline)';
  public readonly description = 'Infrastructure serverless GPU ultra-rapide pour modèles vidéo ouverts.';

  public async createTask(_params: VideoGenerationParams, _apiKey: string): Promise<string> {
    throw new Error(
      "L'intégration directe du provider Fal.ai est en cours de déploiement. Utilisez le provider Agnes AI ou le simulateur."
    );
  }

  public async checkStatus(_taskId: string, _apiKey: string): Promise<VideoTaskResult> {
    return {
      status: 'failed',
      error: 'Provider Fal.ai non configuré.',
    };
  }
}

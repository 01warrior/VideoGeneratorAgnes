import { IVideoProvider, VideoGenerationParams, VideoTaskResult } from '../../types/video';

/**
 * Adaptateur Kling AI (Kling v1.5 / v2.0)
 * Découplé et prêt à être raccordé sans impacter l'UI.
 */
export class KlingVideoProvider implements IVideoProvider {
  public readonly name = 'kling';
  public readonly displayName = 'Kling AI (Kling-v1.5/2.0)';
  public readonly description = 'Moteur vidéo haute cohérence spatio-temporelle Kling AI.';

  public async createTask(_params: VideoGenerationParams, _apiKey: string): Promise<string> {
    throw new Error(
      "L'intégration directe du provider Kling AI est en cours de déploiement. Utilisez le provider Agnes AI ou le simulateur."
    );
  }

  public async checkStatus(_taskId: string, _apiKey: string): Promise<VideoTaskResult> {
    return {
      status: 'failed',
      error: 'Provider Kling non configuré.',
    };
  }
}

import { IVideoProvider, VideoGenerationParams, VideoTaskResult } from '../../types/video';

interface MockTaskRecord {
  createdAt: number;
  prompt: string;
}

const mockTaskStore = new Map<string, MockTaskRecord>();

const SAMPLE_DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
];

/**
 * Simulateur / Démo Sandbox
 * Permet de tester le workflow sans consommer de crédits d'API réels.
 */
export class MockVideoProvider implements IVideoProvider {
  public readonly name = 'mock';
  public readonly displayName = 'Simulateur Sandbox (Démo sans clé)';
  public readonly description = 'Environnement de simulation pour tester le polling adaptatif, les statuts et le lecteur sans clé API.';

  public async createTask(params: VideoGenerationParams, _apiKey: string): Promise<string> {
    const taskId = 'sim_' + Math.random().toString(36).substring(2, 9);
    mockTaskStore.set(taskId, {
      createdAt: Date.now(),
      prompt: params.prompt,
    });
    return taskId;
  }

  public async checkStatus(taskId: string, _apiKey: string): Promise<VideoTaskResult> {
    const record = mockTaskStore.get(taskId);
    const elapsedSeconds = record ? (Date.now() - record.createdAt) / 1000 : 20;

    // Simulate 12 seconds total generation time
    if (elapsedSeconds < 4) {
      return {
        status: 'pending',
        progress: Math.min(25, Math.floor((elapsedSeconds / 4) * 25)),
      };
    } else if (elapsedSeconds < 14) {
      const progress = Math.min(95, Math.floor(25 + ((elapsedSeconds - 4) / 10) * 70));
      return {
        status: 'processing',
        progress,
      };
    } else {
      const sampleIndex = Math.abs(taskId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % SAMPLE_DEMO_VIDEOS.length;
      return {
        status: 'completed',
        progress: 100,
        videoUrl: SAMPLE_DEMO_VIDEOS[sampleIndex],
      };
    }
  }
}

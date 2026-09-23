export interface VideoGenerationParams {
  prompt: string;
  imageUrl?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  durationSeconds?: number;
  model?: 'agnes-video-2.5' | 'agnes-video-2.5-flash' | 'agnes-video-v2.0';
  resolution?: '720p' | '1080p' | '2k';
}

export interface VideoTaskResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  progress?: number;
}

export interface IVideoProvider {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  createTask(params: VideoGenerationParams, apiKey: string): Promise<string>; // retourne videoId / taskId
  checkStatus(taskId: string, apiKey: string): Promise<VideoTaskResult>;
}

export type ProviderKey = 'agnes' | 'kling' | 'fal' | 'mock';

export interface GenerationHistoryItem {
  id: string;
  taskId: string;
  provider: ProviderKey;
  params: VideoGenerationParams;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
  durationMs?: number;
}

export interface AspectRatioOption {
  value: '16:9' | '9:16' | '1:1';
  label: string;
  sublabel: string;
  width: number;
  height: number;
  iconRatioClass: string;
}

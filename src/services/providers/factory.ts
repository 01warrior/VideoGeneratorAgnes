import { IVideoProvider, ProviderKey } from '../../types/video';
import { AgnesVideoProvider } from './agnes.provider';
import { KlingVideoProvider } from './kling.provider';
import { FalVideoProvider } from './fal.provider';
import { MockVideoProvider } from './mock.provider';

export interface ProviderInfo {
  key: ProviderKey;
  name: string;
  displayName: string;
  description: string;
  isReady: boolean;
  requiresKey: boolean;
  badge?: string;
}

export class VideoProviderFactory {
  private static instance: VideoProviderFactory;
  private providers: Map<ProviderKey, IVideoProvider> = new Map();

  private constructor() {
    this.registerProvider('agnes', new AgnesVideoProvider());
    this.registerProvider('mock', new MockVideoProvider());
    this.registerProvider('kling', new KlingVideoProvider());
    this.registerProvider('fal', new FalVideoProvider());
  }

  public static getInstance(): VideoProviderFactory {
    if (!VideoProviderFactory.instance) {
      VideoProviderFactory.instance = new VideoProviderFactory();
    }
    return VideoProviderFactory.instance;
  }

  public registerProvider(key: ProviderKey, provider: IVideoProvider): void {
    this.providers.set(key, provider);
  }

  public getProvider(key: ProviderKey = 'agnes'): IVideoProvider {
    const provider = this.providers.get(key);
    if (!provider) {
      throw new Error(`Aucun fournisseur de vidéo enregistré pour la clé: '${key}'`);
    }
    return provider;
  }

  public listProviders(): ProviderInfo[] {
    return [
      {
        key: 'agnes',
        name: 'agnes',
        displayName: 'Agnes AI (agnes-video-v2.0)',
        description: 'Moteur vidéo principal : 1152x768 / 768x1152, 121 frames @ 24fps.',
        isReady: true,
        requiresKey: true,
        badge: 'Actif & Recommandé',
      },
      {
        key: 'mock',
        name: 'mock',
        displayName: 'Simulateur Sandbox',
        description: 'Tester l’UI, le lecteur et le polling sans clé ni consommation de crédits.',
        isReady: true,
        requiresKey: false,
        badge: 'Test Gratuit',
      },
      {
        key: 'kling',
        name: 'kling',
        displayName: 'Kling AI (v1.5 / v2.0)',
        description: 'Architecture prête (Adapter Pattern plug-and-play).',
        isReady: false,
        requiresKey: true,
        badge: 'Adapter Prêt',
      },
      {
        key: 'fal',
        name: 'fal',
        displayName: 'Fal.ai (Luma / CogVideo)',
        description: 'Architecture prête (Adapter Pattern plug-and-play).',
        isReady: false,
        requiresKey: true,
        badge: 'Adapter Prêt',
      },
    ];
  }
}

export const videoProviderFactory = VideoProviderFactory.getInstance();

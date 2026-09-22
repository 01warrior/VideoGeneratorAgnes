import { IVideoProvider, ProviderKey } from '../../types/video';
import { AgnesVideoProvider } from './agnes.provider';

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
    const provider = this.providers.get(key) || this.providers.get('agnes');
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
        badge: 'Actif & Officiel',
      },
    ];
  }
}

export const videoProviderFactory = VideoProviderFactory.getInstance();

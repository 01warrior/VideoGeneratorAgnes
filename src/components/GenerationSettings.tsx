import React, { useState } from 'react';
import {
  Maximize,
  Smartphone,
  Square,
  Image as ImageIcon,
  Check,
  Film,
  Link,
  X,
  Sparkles,
  Zap,
  Clock,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface GenerationSettingsProps {
  aspectRatio: '16:9' | '9:16' | '1:1';
  onSelectAspectRatio: (ratio: '16:9' | '9:16' | '1:1') => void;
  imageUrl: string;
  onChangeImageUrl: (url: string) => void;
  selectedModel?: 'agnes-video-2.5' | 'agnes-video-2.5-flash' | 'agnes-video-v2.0';
  onSelectModel?: (model: 'agnes-video-2.5' | 'agnes-video-2.5-flash' | 'agnes-video-v2.0') => void;
  durationSeconds?: number;
  onChangeDuration?: (secs: number) => void;
  resolution?: '720p' | '1080p' | '2k';
  onChangeResolution?: (res: '720p' | '1080p' | '2k') => void;
  disabled?: boolean;
}

export const GenerationSettings: React.FC<GenerationSettingsProps> = ({
  aspectRatio,
  onSelectAspectRatio,
  imageUrl,
  onChangeImageUrl,
  selectedModel = 'agnes-video-2.5',
  onSelectModel,
  durationSeconds = 5,
  onChangeDuration,
  resolution = '720p',
  onChangeResolution,
  disabled = false,
}) => {
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const RATIOS: {
    id: '16:9' | '9:16' | '1:1';
    label: string;
    sublabel: string;
    dimensions: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: '16:9',
      label: 'Paysage (16:9)',
      sublabel: 'Cinéma, YouTube, Web',
      dimensions: '1152 × 768 px',
      icon: <Maximize className="w-4 h-4" />,
    },
    {
      id: '9:16',
      label: 'Portrait (9:16)',
      sublabel: 'Reels, TikTok, Shorts',
      dimensions: '768 × 1152 px',
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      id: '1:1',
      label: 'Carré (1:1)',
      sublabel: 'Instagram, Showcase',
      dimensions: '768 × 768 px',
      icon: <Square className="w-4 h-4" />,
    },
  ];

  const DURATIONS = [4, 5, 8, 10, 12];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#e1e3e1]/80 space-y-6">
      {/* 1. Model Selector (Agnes Video 2.5 Series) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-[#1f1f1f] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#00639b]" />
            Modèle Agnes AI (Série 2.5)
          </label>
          <span className="text-[10px] font-semibold text-[#0a6627] bg-[#c4eed0]/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Série 2.5 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* agnes-video-2.5 */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectModel?.('agnes-video-2.5')}
            className={`p-3.5 rounded-2xl text-left border transition-all relative ${
              selectedModel === 'agnes-video-2.5'
                ? 'border-[#00639b] bg-[#c2e7ff]/20 shadow-xs'
                : 'border-[#e1e3e1] bg-[#f0f4f9]/50 hover:bg-[#f0f4f9]'
            } disabled:opacity-50`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    selectedModel === 'agnes-video-2.5'
                      ? 'bg-[#00639b] text-white'
                      : 'bg-white text-[#444746] shadow-xs'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[#1f1f1f]">agnes-video-2.5</span>
              </div>
              {selectedModel === 'agnes-video-2.5' ? (
                <span className="w-5 h-5 rounded-full bg-[#00639b] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e1e3e1] text-[#444746] font-semibold">
                  Pro
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#444746] leading-relaxed">
              Moteur principal de référence. Dynamique physique ultra-réaliste (+165 Elo) et fidélité cinématique.
            </p>
          </button>

          {/* agnes-video-2.5-flash */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectModel?.('agnes-video-2.5-flash')}
            className={`p-3.5 rounded-2xl text-left border transition-all relative ${
              selectedModel === 'agnes-video-2.5-flash'
                ? 'border-[#00639b] bg-[#c2e7ff]/20 shadow-xs'
                : 'border-[#e1e3e1] bg-[#f0f4f9]/50 hover:bg-[#f0f4f9]'
            } disabled:opacity-50`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    selectedModel === 'agnes-video-2.5-flash'
                      ? 'bg-[#00639b] text-white'
                      : 'bg-white text-[#444746] shadow-xs'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[#1f1f1f]">agnes-video-2.5-flash</span>
              </div>
              {selectedModel === 'agnes-video-2.5-flash' ? (
                <span className="w-5 h-5 rounded-full bg-[#00639b] text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c2e7ff] text-[#004a77] font-semibold">
                  Rapide
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#444746] leading-relaxed">
              Vitesse de synthèse accélérée, génération instantanée pour itérations et prévisualisations.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Format & Ratio Selector */}
      <div className="pt-2 border-t border-[#e1e3e1]/60">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-[#1f1f1f] flex items-center gap-1.5">
            <Film className="w-4 h-4 text-[#00639b]" />
            Format & Ratio de Sortie
          </label>
          <span className="text-[11px] font-mono text-[#00639b] bg-[#c2e7ff]/40 px-2 py-0.5 rounded-full font-medium">
            {durationSeconds}s ({durationSeconds * 24} frames @ 24fps)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {RATIOS.map((item) => {
            const isSelected = aspectRatio === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectAspectRatio(item.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all relative ${
                  isSelected
                    ? 'border-[#00639b] bg-[#c2e7ff]/20 shadow-xs'
                    : 'border-[#e1e3e1] bg-[#f0f4f9]/50 hover:bg-[#f0f4f9]'
                } disabled:opacity-50`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-[#00639b] text-white' : 'bg-white text-[#444746] shadow-xs'
                    }`}
                  >
                    {item.icon}
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#00639b] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="font-semibold text-xs text-[#1f1f1f]">{item.label}</div>
                <div className="text-[10px] text-[#444746]">{item.sublabel}</div>
                <div className="text-[10px] font-mono text-[#004a77] mt-1 font-medium">
                  {item.dimensions}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Duration & Resolution Selectors */}
      <div className="pt-2 border-t border-[#e1e3e1]/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Duration Selection */}
        <div>
          <label className="text-xs font-bold text-[#1f1f1f] flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-[#00639b]" />
            Durée de la vidéo (secondes)
          </label>
          <div className="flex items-center gap-1.5">
            {DURATIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                disabled={disabled}
                onClick={() => onChangeDuration?.(dur)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  durationSeconds === dur
                    ? 'bg-[#00639b] text-white shadow-xs'
                    : 'bg-[#f0f4f9] text-[#444746] hover:bg-[#e1e3e1]'
                } disabled:opacity-50`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Selection */}
        <div>
          <label className="text-xs font-bold text-[#1f1f1f] flex items-center gap-1.5 mb-2">
            <Sliders className="w-4 h-4 text-[#00639b]" />
            Niveau de Résolution
          </label>
          <div className="flex items-center gap-1.5">
            {(['720p', '1080p', '2k'] as const).map((res) => (
              <button
                key={res}
                type="button"
                disabled={disabled}
                onClick={() => onChangeResolution?.(res)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase transition-all ${
                  resolution === res
                    ? 'bg-[#00639b] text-white shadow-xs'
                    : 'bg-[#f0f4f9] text-[#444746] hover:bg-[#e1e3e1]'
                } disabled:opacity-50`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Image to Video (Optional) */}
      <div className="pt-2 border-t border-[#e1e3e1]/60">
        <label className="text-xs font-bold text-[#1f1f1f] flex items-center gap-1.5 mb-1.5">
          <ImageIcon className="w-4 h-4 text-[#00639b]" />
          Mode Image-to-Video (Optionnel)
        </label>
        <p className="text-[11px] text-[#444746] mb-3">
          Renseignez l'URL publique d'une image pour animer le premier plan avec le moteur Agnes 2.5.
        </p>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link className="w-4 h-4 text-[#747775] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={imageUrl}
              disabled={disabled}
              onChange={(e) => {
                setImagePreviewError(false);
                onChangeImageUrl(e.target.value);
              }}
              placeholder="https://example.com/ma-photo-de-reference.jpg"
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#f0f4f9] border border-transparent focus:border-[#00639b] focus:bg-white text-xs text-[#1f1f1f] placeholder:text-[#747775] focus:outline-none transition-all"
            />
            {imageUrl && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChangeImageUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#747775] hover:text-[#1f1f1f]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Thumbnail Preview if URL provided */}
        {imageUrl && !imagePreviewError && (
          <div className="mt-3 flex items-center gap-3 p-2.5 rounded-2xl bg-[#f0f4f9] border border-[#e1e3e1]">
            <img
              src={imageUrl}
              alt="Aperçu référence"
              referrerPolicy="no-referrer"
              onError={() => setImagePreviewError(true)}
              className="w-14 h-14 rounded-xl object-cover border border-[#e1e3e1] bg-white shadow-xs"
            />
            <div className="text-xs flex-1 min-w-0">
              <span className="font-semibold text-[#1f1f1f] block truncate">Image de référence liée</span>
              <span className="text-[10px] text-[#444746] block truncate">{imageUrl}</span>
              <span className="text-[10px] text-[#0a6627] font-medium flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3" /> Image prête pour l’animation
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

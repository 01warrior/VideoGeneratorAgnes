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
} from 'lucide-react';

interface GenerationSettingsProps {
  aspectRatio: '16:9' | '9:16' | '1:1';
  onSelectAspectRatio: (ratio: '16:9' | '9:16' | '1:1') => void;
  imageUrl: string;
  onChangeImageUrl: (url: string) => void;
  disabled?: boolean;
}

export const GenerationSettings: React.FC<GenerationSettingsProps> = ({
  aspectRatio,
  onSelectAspectRatio,
  imageUrl,
  onChangeImageUrl,
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
      sublabel: 'Cinéma, YouTube',
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

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#e1e3e1]/80 space-y-6">
      {/* 1. Format & Ratio Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-[#1f1f1f] flex items-center gap-1.5">
            <Film className="w-4 h-4 text-[#00639b]" />
            Format & Ratio de Sortie
          </label>
          <span className="text-[11px] font-mono text-[#00639b] bg-[#c2e7ff]/40 px-2 py-0.5 rounded-full font-medium">
            121 frames @ 24fps (~5 sec)
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

      {/* 2. Image to Video (Optional) */}
      <div className="pt-2 border-t border-[#e1e3e1]/60">
        <label className="text-xs font-bold text-[#1f1f1f] flex items-center gap-1.5 mb-1.5">
          <ImageIcon className="w-4 h-4 text-[#00639b]" />
          Mode Image-to-Video (Optionnel)
        </label>
        <p className="text-[11px] text-[#444746] mb-3">
          Renseignez l'URL publique d'une image pour animer un plan fixe avec le moteur Agnes.
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

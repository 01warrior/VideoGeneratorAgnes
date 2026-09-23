import React, { useRef, useState, useEffect } from 'react';
import { Download, Copy, Check, Play, Pause, RotateCcw, ExternalLink, Sparkles } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  prompt?: string;
  durationMs?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  prompt,
  durationMs,
  aspectRatio = '16:9',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Clean up and pause video whenever component is unmounted
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Determine aspect ratio container class
  const getContainerAspectClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'max-w-xs mx-auto aspect-[9/16]';
      case '1:1':
        return 'max-w-md mx-auto aspect-square';
      case '16:9':
      default:
        return 'w-full aspect-[16/9]';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return null;
    const totalSecs = Math.round(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#e1e3e1]/80 space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#c4eed0] text-[#072711] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#0a6627]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1f1f1f]">
              Génération réussie
            </h3>
            {durationMs && (
              <p className="text-[11px] text-[#444746]">
                Rendu complet en {formatDuration(durationMs)} (121 frames @ 24fps)
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={videoUrl}
            download="agnes-video.mp4"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00639b] text-white text-xs font-semibold shadow-sm hover:bg-[#004a77] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger MP4</span>
          </a>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#f0f4f9] text-[#1f1f1f] text-xs font-medium hover:bg-[#e1e3e1] transition-all"
            title="Copier l'URL directe du fichier MP4"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#0a6627]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Lien copié !' : 'Copier lien'}</span>
          </button>

          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-full text-[#444746] hover:bg-[#f0f4f9] transition-colors"
            title="Ouvrir la vidéo dans un nouvel onglet"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Video Container */}
      <div className={`relative rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center ${getContainerAspectClass()}`}>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Prompt breakdown card */}
      {prompt && (
        <div className="bg-[#f0f4f9] rounded-2xl p-4 border border-[#e1e3e1] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1f1f1f]">Prompt utilisé :</span>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="text-[#00639b] hover:underline flex items-center gap-1 font-medium text-[11px]"
            >
              {copiedPrompt ? <Check className="w-3 h-3 text-[#0a6627]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPrompt ? 'Copié' : 'Copier le prompt'}</span>
            </button>
          </div>
          <p className="text-[#444746] leading-relaxed italic">
            "{prompt}"
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  Dices,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Camera,
  Sun,
  Palette,
} from 'lucide-react';
import { PROMPT_CATEGORIES, PROMPT_STRUCTURE_GUIDE } from '../data/promptSuggestions';

interface PromptComposerProps {
  prompt: string;
  onChangePrompt: (newPrompt: string) => void;
  onSelectAspectRatio?: (ratio: '16:9' | '9:16' | '1:1') => void;
  disabled?: boolean;
}

export const PromptComposer: React.FC<PromptComposerProps> = ({
  prompt,
  onChangePrompt,
  onSelectAspectRatio,
  disabled = false,
}) => {
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('cinematic');

  // Insert structured fragment
  const handleAppendFragment = (prefix: string, example: string) => {
    const separator = prompt.trim().length > 0 ? (prompt.trim().endsWith('.') ? ' ' : ', ') : '';
    onChangePrompt(`${prompt.trim()}${separator}${example}`);
  };

  // Random prompt picker
  const handleRandomPrompt = () => {
    const allPrompts = PROMPT_CATEGORIES.flatMap((c) => c.prompts);
    const randomItem = allPrompts[Math.floor(Math.random() * allPrompts.length)];
    if (randomItem) {
      onChangePrompt(randomItem.prompt);
      onSelectAspectRatio?.(randomItem.aspectRatio);
    }
  };

  const currentCategory =
    PROMPT_CATEGORIES.find((c) => c.id === activeCategoryTab) || PROMPT_CATEGORIES[0];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#e1e3e1]/80 space-y-4 transition-all">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#1f1f1f]">
            Prompt Vidéo Cinématographique
          </h2>
          <p className="text-[11px] text-[#444746]">
            Optimisé pour le moteur agnes-video-v2.0 (121 frames @ 24fps)
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowFormulaGuide(!showFormulaGuide)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showFormulaGuide
                ? 'bg-[#00639b] text-white'
                : 'bg-[#f0f4f9] text-[#00639b] hover:bg-[#c2e7ff]/40'
            }`}
            title="Afficher la formule recommandée Agnes (Sujet + Action + Caméra + Lumière + Style)"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Formule Agnes</span>
            {showFormulaGuide ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRandomPrompt}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f0f4f9] text-[#1f1f1f] text-xs font-medium hover:bg-[#e1e3e1] transition-colors disabled:opacity-50"
            title="Insérer un prompt cinématographique aléatoire"
          >
            <Dices className="w-3.5 h-3.5 text-[#00639b]" />
            <span className="hidden sm:inline">Inspiration</span>
          </button>

          {prompt && (
            <button
              type="button"
              onClick={() => onChangePrompt('')}
              disabled={disabled}
              className="p-1.5 rounded-full text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
              title="Effacer le prompt"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Formula Guide */}
      {showFormulaGuide && (
        <div className="bg-[#f0f4f9] rounded-2xl p-4 border border-[#c2e7ff] text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-[#004a77] font-semibold">
            <Info className="w-4 h-4" />
            <span>Structure optimale Agnes : Sujet + Action + Mouvement de Caméra + Lumière + Rendu 24fps</span>
          </div>

          <p className="text-[#444746] leading-relaxed text-[11px]">
            Cliquez sur un élément ci-dessous pour insérer des descripteurs clés dans votre prompt :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                handleAppendFragment(
                  'Caméra',
                  'Travelling avant fluide cinématographique au ras du sol'
                )
              }
              className="text-left p-2.5 rounded-xl bg-white hover:bg-[#c2e7ff]/30 border border-[#e1e3e1] transition-all flex items-start gap-2"
            >
              <Camera className="w-3.5 h-3.5 text-[#00639b] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[#1f1f1f]">+ Mouvement Caméra</span>
                <span className="text-[10px] text-[#444746]">Travelling avant fluide au ras du sol</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppendFragment(
                  'Lumière',
                  'Éclairage cinématique dramatique, lueurs volumétriques dorées et reflets spéculaires'
                )
              }
              className="text-left p-2.5 rounded-xl bg-white hover:bg-[#c2e7ff]/30 border border-[#e1e3e1] transition-all flex items-start gap-2"
            >
              <Sun className="w-3.5 h-3.5 text-[#00639b] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[#1f1f1f]">+ Lumière Cinématographique</span>
                <span className="text-[10px] text-[#444746]">Lueurs volumétriques dorées & reflets</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppendFragment(
                  'Style',
                  'Objectif anamorphique 50mm, texture de film 35mm avec grain fin, 24fps'
                )
              }
              className="text-left p-2.5 rounded-xl bg-white hover:bg-[#c2e7ff]/30 border border-[#e1e3e1] transition-all flex items-start gap-2"
            >
              <Palette className="w-3.5 h-3.5 text-[#00639b] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-[#1f1f1f]">+ Rendu & Cadence 24fps</span>
                <span className="text-[10px] text-[#444746]">Objectif anamorphique, grain 35mm, 24fps</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="Décrivez précisément votre scène vidéo (ex: Un léopard des neiges s’avance à pas feutrés sur une crête rocheuse escarpée dans l’Himalaya, travelling latéral stabilisé, lumière dorée d’aube hivernale rasante, 24fps...)"
          className="w-full p-4 rounded-2xl bg-[#f0f4f9] border border-transparent focus:border-[#00639b] focus:bg-white text-sm text-[#1f1f1f] placeholder:text-[#747775] focus:outline-none transition-all resize-y leading-relaxed font-normal"
        />

        <div className="flex items-center justify-between text-[11px] text-[#444746] px-1 mt-1">
          <span>Conseil : Incluez des indications de mouvement et de caméra pour un rendu dynamique</span>
          <span className={prompt.length > 500 ? 'text-[#ba1a1a] font-semibold' : ''}>
            {prompt.length} caractères
          </span>
        </div>
      </div>

      {/* Suggested Prompts Tabs & Chips */}
      <div className="space-y-2 pt-1 border-t border-[#e1e3e1]/60">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-semibold text-[#1f1f1f] mr-1 shrink-0 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#00639b]" />
            Idées :
          </span>
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryTab(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategoryTab === cat.id
                  ? 'bg-[#00639b] text-white shadow-xs'
                  : 'bg-[#f0f4f9] text-[#444746] hover:bg-[#e1e3e1]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Selected category prompt cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {currentCategory.prompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => {
                onChangePrompt(item.prompt);
                onSelectAspectRatio?.(item.aspectRatio);
              }}
              className="text-left p-3 rounded-2xl bg-[#f0f4f9]/70 hover:bg-[#c2e7ff]/30 border border-[#e1e3e1]/70 hover:border-[#00639b]/40 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-xs text-[#1f1f1f] group-hover:text-[#00639b] transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#004a77] font-mono border border-[#e1e3e1]">
                  {item.aspectRatio}
                </span>
              </div>
              <p className="text-[11px] text-[#444746] line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

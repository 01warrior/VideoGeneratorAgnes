import React, { useState } from 'react';
import { Key, Eye, EyeOff, X, CheckCircle, ShieldAlert, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  apiKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
  onUseServerKey?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  apiKey,
  onSave,
  onClose,
  onUseServerKey,
}) => {
  const [inputVal, setInputVal] = useState(apiKey);
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSave(inputVal.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setInputVal('');
    onSave('');
  };

  const handleQuickTest = () => {
    onClose();
    if (onUseServerKey) {
      onUseServerKey();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#e1e3e1] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#444746] hover:bg-[#f0f4f9] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#c2e7ff] text-[#001d35] flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1f1f1f]">Clé API Agnes AI</h2>
            <p className="text-xs text-[#444746]">
              Authentification pour le modèle agnes-video-v2.0
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-[#f0f4f9] rounded-2xl p-4 mb-4 text-xs text-[#444746] leading-relaxed">
          <p className="mb-2">
            Votre clé personnelle est transmise de façon sécurisée (
            <code className="text-[#004a77] font-mono bg-white px-1.5 py-0.5 rounded">
              Authorization: Bearer sk-...
            </code>
            ) et conservée dans votre navigateur.
          </p>
          <div className="flex items-center gap-1.5 text-[#00639b] font-medium">
            <ExternalLink className="w-3.5 h-3.5" />
            <a
              href="https://apihub.agnes-ai.com"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Obtenir ou recharger une clé sur apihub.agnes-ai.com
            </a>
          </div>
        </div>

        {/* Option d'accès rapide avec la clé préconfigurée / savadogo */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#d3e3fd]/60 to-[#c2e7ff]/40 border border-[#c2e7ff] flex flex-col gap-2.5">
          <div className="text-xs text-[#1f1f1f]">
            <span className="font-semibold text-[#004a77]">Mode Découverte disponible :</span>{' '}
            Vous pouvez tester l'application directement sans saisir de clé grâce à la clé préconfigurée.
          </div>
          <button
            type="button"
            onClick={handleQuickTest}
            className="w-full py-2.5 px-4 rounded-xl bg-[#00639b] hover:bg-[#004a77] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center active:scale-98"
          >
            <span>Tester rapidement avec la clé de savadogo</span>
          </button>
        </div>

        {/* Formulaire clé personnalisée */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1f1f1f] mb-1.5">
              Ou utiliser votre propre clé (sk-...)
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="sk-agnes-..."
                className="w-full px-4 py-3 rounded-2xl bg-[#f0f4f9] border border-transparent focus:border-[#00639b] focus:bg-white text-sm text-[#1f1f1f] pr-12 focus:outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1.5 text-[#444746] hover:text-[#1f1f1f] transition-colors"
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {inputVal && !inputVal.startsWith('sk-') && (
              <p className="text-[11px] text-[#ba1a1a] mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Les clés Agnes AI commencent généralement par
                "sk-".
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-[#ba1a1a] hover:underline px-2 py-1.5 text-center sm:text-left"
            >
              Effacer ma clé
            </button>
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-medium text-[#444746] hover:bg-[#f0f4f9] transition-colors text-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-[#1f1f1f] text-white text-xs font-semibold hover:bg-black shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Enregistrée !
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from '../Button.jsx';

/** Frase-desafio de 3 palavras que o usuário deve digitar para confirmar desativação */
export const DEACTIVATE_CHALLENGE_PHRASE = 'SIM DESATIVAR MÓDULO';

/**
 * Modal para desativar o módulo: exige digitar a frase-desafio para confirmar.
 * Layout harmonioso com bloco único de confirmação (frase + campo).
 */
export default function ModuleDeactivationModal({
  isOpen,
  onClose,
  moduleType,
  onConfirm,
  moduleLabel,
}) {
  const [inputPhrase, setInputPhrase] = useState('');
  const isObjectives = moduleType === 'objectives';

  const normalizedInput = inputPhrase.trim().toUpperCase().replace(/\s+/g, ' ');
  const isMatch = normalizedInput === DEACTIVATE_CHALLENGE_PHRASE.toUpperCase().replace(/\s+/g, ' ');

  const handleConfirm = () => {
    if (!isMatch) return;
    onConfirm();
    setInputPhrase('');
    onClose();
  };

  const handleClose = () => {
    setInputPhrase('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-2xl shadow-slate-900/25 animate-in zoom-in-95 duration-300 border border-slate-200/80"
        role="dialog"
        aria-labelledby="deactivate-title"
        aria-modal="true"
      >
        {/* Barra de acento por tema */}
        <div
          className="h-1 w-full shrink-0"
          style={{
            background: isObjectives
              ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
              : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
          }}
        />

        <div className="p-6 sm:p-8">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shrink-0 ${
                isObjectives ? 'bg-amber-50 text-amber-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <AlertTriangle size={24} strokeWidth={2} />
            </div>
            <h2 id="deactivate-title" className="text-xl font-bold text-slate-800 text-center mb-2">
              Desativar {moduleLabel}
            </h2>
            <div className="text-slate-600 text-sm text-center leading-relaxed mb-5 max-w-sm space-y-3">
              {isObjectives ? (
                <p>
                  Tudo será perdido. Caso o módulo seja reativado, nada voltará a aparecer — objetivos, áreas e atividades vinculadas não serão recuperados.
                </p>
              ) : (
                <p>
                  Todas as classes e todos os requisitos serão excluídos (alocados ou não). Nenhuma configuração será recuperada se o módulo for reativado.
                </p>
              )}
              <p className="text-slate-700 font-medium">
                Para confirmar, digite a frase abaixo:
              </p>
            </div>

            {/* Bloco unificado: frase + campo — agrupamento visual claro */}
            <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 text-center">
                Frase de confirmação
              </p>
              <p
                className="text-base font-semibold text-slate-800 text-center mb-4 tracking-wide select-all"
                style={{ fontFamily: 'ui-monospace, monospace' }}
              >
                {DEACTIVATE_CHALLENGE_PHRASE}
              </p>
              <input
                type="text"
                value={inputPhrase}
                onChange={(e) => setInputPhrase(e.target.value)}
                placeholder="Cole ou digite a frase acima"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-800 text-center font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                autoComplete="off"
                autoFocus
                {...(inputPhrase.trim() && !isMatch && { 'aria-describedby': 'confirm-hint' })}
              />
              {inputPhrase.trim() && !isMatch && (
                <p id="confirm-hint" className="text-xs text-amber-600 mt-2 text-center font-medium">
                  O texto não confere. Digite exatamente como mostrado.
                </p>
              )}
            </div>

            <div className="flex gap-3 w-full">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!isMatch}
                variant="danger"
                className="flex-1"
              >
                Desativar módulo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

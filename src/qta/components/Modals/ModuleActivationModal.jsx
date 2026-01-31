import { X } from 'lucide-react';
import Button from '../Button.jsx';

/**
 * Modal para ativar um módulo (Objetivos Maiores ou Gerenciador de Classes) pela primeira vez.
 * Design harmonizado com o modal de desativação.
 */
export default function ModuleActivationModal({ isOpen, onClose, moduleType, onActivate, Icon, title, subtitle }) {
  if (!isOpen) return null;
  const isObjectives = moduleType === 'objectives';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-2xl shadow-slate-900/25 animate-in zoom-in-95 duration-300 border border-slate-200/80"
        role="dialog"
        aria-labelledby="activate-title"
        aria-modal="true"
      >
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
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center mb-5 shrink-0 ${
                isObjectives ? 'bg-indigo-50' : 'bg-blue-50'
              }`}
            >
              <Icon
                size={32}
                className={isObjectives ? 'text-indigo-600' : 'text-blue-600'}
                strokeWidth={1.8}
              />
            </div>
            <h2 id="activate-title" className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-sm">{subtitle}</p>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Agora não
              </Button>
              <Button
                onClick={() => {
                  onActivate();
                  onClose();
                }}
                className={`flex-1 ${isObjectives ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg`}
              >
                Ativar e turbinar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

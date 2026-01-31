import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', compact = false }) {
  if (!isOpen) return null;
  const maxW = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';
  const contentPad = compact ? 'p-4' : 'p-6';
  const footerPad = compact ? 'px-4 py-3' : 'px-6 py-4';
  const headerPad = compact ? 'px-4 py-3' : 'px-6 py-4';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl shadow-2xl shadow-slate-900/20 w-full ${maxW} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/80`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className={`flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 shrink-0 ${headerPad}`}>
          <h3 id="modal-title" className="text-lg font-bold text-slate-800 truncate min-w-0 flex-1" title={title}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200/80 transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <div className={`${contentPad} overflow-y-auto flex-1 min-h-0`}>
          {children}
        </div>
        {footer && (
          <div className={`${footerPad} flex justify-end gap-2 border-t border-slate-200 bg-slate-50/30 shrink-0`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

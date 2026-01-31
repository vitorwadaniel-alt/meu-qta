import { useState, useRef, useLayoutEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ICON_MAP, ICON_KEYS, IconFallback } from '../constants/icons.js';

const DROPDOWN_WIDTH = 272;
const DROPDOWN_MAX_HEIGHT = 280;

/**
 * Seletor de ícone: clica para abrir grade. Dropdown com position fixed para não desalinhar em modais.
 * Posição só é aplicada após cálculo (useLayoutEffect) para evitar flash no canto da tela.
 */
export default function IconPicker({ selectedIcon, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceAbove >= spaceBelow;
    setPosition({
      bottom: openAbove ? window.innerHeight - rect.top + 8 : undefined,
      top: !openAbove ? rect.bottom + 8 : undefined,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - DROPDOWN_WIDTH - 8)),
    });
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 pl-2 pr-2 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 bg-white text-gray-600 transition-colors shrink-0"
        title="Clique para escolher ícone"
      >
        {(() => {
          const Icon = (selectedIcon && ICON_MAP[selectedIcon]) || IconFallback;
          return <Icon size={18} className="shrink-0" />;
        })()}
        <ChevronDown size={14} className={isOpen ? 'rotate-180 text-gray-500' : 'text-gray-500 shrink-0'} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} aria-hidden />
          {position !== null && (
          <div
            className="fixed z-[120] p-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto"
            style={{
              left: position.left,
              top: position.top,
              bottom: position.bottom,
              width: DROPDOWN_WIDTH,
              maxHeight: DROPDOWN_MAX_HEIGHT,
            }}
          >
            <div className="grid grid-cols-6 gap-1.5">
              {ICON_KEYS.map((iconKey) => {
                const Icon = ICON_MAP[iconKey];
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => { onSelect(iconKey); setIsOpen(false); }}
                    className={`p-2 rounded-lg flex justify-center items-center transition-colors ${
                      selectedIcon === iconKey
                        ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={iconKey}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}

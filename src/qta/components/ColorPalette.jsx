import { useState, useRef, useLayoutEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { COLOR_PALETTE } from '../constants/colors.js';

const DROPDOWN_WIDTH = 260;
const DROPDOWN_MAX_HEIGHT = 280;

/**
 * Seletor de cor: clica para abrir paleta. Dropdown com position fixed para não desalinhar em modais.
 * Posição só é aplicada após cálculo (useLayoutEffect) para evitar flash no canto da tela.
 */
export default function ColorPalette({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
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
      right: undefined,
    });
  }, [isOpen]);

  const handleSelect = (color) => {
    onChange(color);
    setIsOpen(false);
    setCustomOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 pl-2 pr-2 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 bg-white transition-colors shrink-0"
        title="Clique para escolher cor"
      >
        <span className="w-5 h-5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: value || '#e5e7eb' }} />
        <ChevronDown size={14} className={isOpen ? 'rotate-180 text-gray-500' : 'text-gray-500'} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[110]"
            onClick={() => { setIsOpen(false); setCustomOpen(false); }}
            aria-hidden
          />
          {position !== null && (
          <div
            className="fixed z-[120] p-3 bg-white border border-gray-200 rounded-xl shadow-xl"
            style={{
              left: position.left,
              right: position.right,
              top: position.top,
              bottom: position.bottom,
              width: DROPDOWN_WIDTH,
              maxHeight: DROPDOWN_MAX_HEIGHT,
            }}
          >
            <div className="flex flex-wrap gap-2 items-center overflow-y-auto max-h-[240px]">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelect(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all shrink-0 ${
                    value === color ? 'border-gray-800 scale-110 ring-2 ring-offset-1 ring-gray-400' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCustomOpen(!customOpen)}
                  className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center shrink-0 text-gray-400"
                  title="Cor personalizada"
                >
                  +
                </button>
                {customOpen && (
                  <>
                    <div className="fixed inset-0 z-[130]" onClick={() => setCustomOpen(false)} aria-hidden />
                    <div className="absolute left-0 top-full mt-1 z-[140]">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleSelect(e.target.value)}
                        className="w-10 h-10 cursor-pointer border-0 rounded p-0 block"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}

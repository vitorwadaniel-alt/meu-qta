import { ChevronDown } from 'lucide-react';

/**
 * Dropdown de filtro reutilizável (categoria, tag, departamento, classe).
 */
export default function FilterDropdown({
  type,
  label,
  items,
  getItemId,
  getItemLabel,
  getItemColor,
  selectedIds,
  onToggle,
  Icon,
  isOpen,
  onOpenChange,
  lockedPageFilterId,
  lockedPageFilterType,
}) {
  const isLockedType =
    (type === 'category' && lockedPageFilterType === 'category') ||
    (type === 'tag' && lockedPageFilterType === 'tag');
  const thisLockedId = isLockedType ? lockedPageFilterId : null;
  const count = new Set([...(thisLockedId ? [thisLockedId] : []), ...selectedIds]).size;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(isOpen ? null : type)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
          count > 0 ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        {Icon && <Icon size={16} />}
        {label}
        {count > 0 && (
          <span className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded text-xs">{count}</span>
        )}
        <ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(null)} />
          <div className="absolute left-0 top-full mt-1 w-56 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
            {thisLockedId && (
              <div className="px-4 py-2 border-b border-gray-100 bg-amber-50 flex items-center gap-2">
                <span className="text-xs text-amber-800 font-medium">Página atual (não pode remover)</span>
              </div>
            )}
            {items.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">Nenhuma opção</div>
            ) : (
              items.map((item) => {
                const id = getItemId(item);
                const sel = selectedIds.includes(id) || id === thisLockedId;
                const isLocked = id === thisLockedId;
                const color = getItemColor?.(item);
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${
                      isLocked ? 'cursor-default bg-amber-50/50' : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sel}
                      onChange={() => !isLocked && onToggle(id, sel)}
                      disabled={isLocked}
                      className="rounded border-gray-300 text-blue-600 disabled:opacity-70"
                    />
                    {color && (
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    {Icon && !color && <Icon size={14} className="text-gray-400 flex-shrink-0" />}
                    <span className="text-sm truncate flex-1">{getItemLabel(item)}</span>
                    {isLocked && <span className="text-[10px] text-amber-600 font-medium">Página</span>}
                  </label>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

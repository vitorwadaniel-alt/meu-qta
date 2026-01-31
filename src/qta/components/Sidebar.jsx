import { Calendar, LayoutGrid, List, Plus, RefreshCcw, Settings, Trash2 } from 'lucide-react';
import { VIEW_MODES } from '../constants/viewModes.js';
import { ICON_MAP, Tag as TagIcon } from '../constants/icons.js';
import Button from './Button.jsx';

export default function Sidebar({
  sidebarOpen,
  viewMode,
  pageFilter,
  setViewMode,
  setPageFilter,
  onNewActivity,
  onCategorySettings,
  onTagSettings,
  categories,
  tags,
  counters,
}) {
  const systemCats = [...categories].filter((c) => c.isSystem).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const userCats = categories.filter((c) => !c.isSystem);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-60 md:w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 flex flex-col shrink-0`}
    >
      <div className="h-14 shrink-0 flex items-center justify-center gap-2 px-4 border-b border-slate-200 text-blue-600 font-bold text-lg leading-none">
        <LayoutGrid className="shrink-0" size={20} strokeWidth={2.25} />
        <span className="tracking-tight">MEU QTA</span>
      </div>
      <div className="py-4 px-4 border-b border-slate-100 shrink-0">
        <Button onClick={onNewActivity} className="w-full h-10 gap-2 text-sm rounded-lg">
          <Plus size={18} /> Nova Atividade
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 min-h-0">
        <div className="space-y-1">
          {[
            { mode: VIEW_MODES.CALENDAR, label: 'Visão Geral', icon: Calendar, count: counters.all },
            { mode: VIEW_MODES.UNALLOCATED, label: 'Não Alocados', icon: List, count: counters.unallocated },
            { mode: VIEW_MODES.TRASH, label: 'Lixeira', icon: Trash2, count: counters.trash },
          ].map((item) => (
            <button
              key={item.mode}
              onClick={() => {
                setViewMode(item.mode);
                setPageFilter(null);
              }}
              className={`w-full flex justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === item.mode ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex gap-3 items-center">
                <item.icon size={18} /> {item.label}
              </div>
              <span className="bg-slate-100 text-slate-600 px-2 rounded-full text-xs">{item.count}</span>
            </button>
          ))}
        </div>
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Categorias</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCategorySettings();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              title="Configurar categorias"
            >
              <Settings size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {systemCats.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Padrão
                </div>
                {systemCats.map((cat) => {
                  const IconC = ICON_MAP[cat.icon] || TagIcon;
                  const isActive = pageFilter?.type === 'category' && pageFilter?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setPageFilter({ type: 'category', id: cat.id });
                        setViewMode(VIEW_MODES.FILTERED_PAGE);
                      }}
                      className={`w-full flex gap-3 px-3 py-2 rounded-lg text-sm transition-colors items-center ${
                        isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <IconC size={14} style={{ color: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Minhas
              </div>
              {userCats.map((cat) => {
                const IconC = ICON_MAP[cat.icon] || TagIcon;
                const isActive = pageFilter?.type === 'category' && pageFilter?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setPageFilter({ type: 'category', id: cat.id });
                      setViewMode(VIEW_MODES.FILTERED_PAGE);
                    }}
                    className={`w-full flex gap-3 px-3 py-2 rounded-lg text-sm transition-colors items-center ${
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconC size={14} style={{ color: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
              {userCats.length === 0 && (
                <div className="px-3 text-xs text-slate-400 italic py-1">Nenhuma personalizada</div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTagSettings();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              title="Configurar tags"
            >
              <Settings size={14} />
            </button>
          </div>
          {tags.length === 0 ? (
            <div className="px-3 text-xs text-slate-400 italic py-1">
              Nenhuma tag. Clique na engrenagem para criar.
            </div>
          ) : (
            <div className="space-y-1">
              {tags.map((t) => {
                const isActive = pageFilter?.type === 'tag' && pageFilter?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setPageFilter({ type: 'tag', id: t.id });
                      setViewMode(VIEW_MODES.FILTERED_PAGE);
                    }}
                    className={`w-full flex gap-3 px-3 py-2 rounded-lg text-sm transition-colors items-center ${
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="py-2 shrink-0 flex items-center justify-center px-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium leading-none">
          <RefreshCcw className="shrink-0" size={14} />
          <span>Sincronizado</span>
        </div>
      </div>
    </aside>
  );
}
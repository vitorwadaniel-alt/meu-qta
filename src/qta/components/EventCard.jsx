import { BookOpen, ChevronRight, Clock, Edit3, FolderOpen, Target, Trash2, AlertCircle } from 'lucide-react';
import { ICON_MAP, Tag as TagIcon } from '../constants/icons.js';

/**
 * Card padronizado para atividade/requisito - usado em Categoria, Tag, Não Alocados e Lixeira.
 */
export default function EventCard({
  event: ev,
  getCategory,
  getTag,
  isUnallocated,
  isTrash,
  showCategory = true,
  showClassInfo = true,
  objectives = [],
  allAreas = [],
  onView,
  onEdit,
  onDelete,
}) {
  const cat = getCategory(ev.categoryId);
  const displayColor = ev.color || cat.color;
  const CatIcon = ICON_MAP[cat.icon] || TagIcon;
  const unallocated = isUnallocated ?? !ev.start;
  const objective = ev.objectiveId ? objectives.find((o) => o.id === ev.objectiveId) : null;
  const area = objective ? allAreas.find((a) => a.id === objective.areaId) : null;
  const cardBase =
    'bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col w-full';
  const cardMuted = unallocated ? 'border-gray-200 bg-gray-50/50' : '';
  const cardTrash = isTrash ? 'border-red-100 bg-red-50/30' : '';
  const accentColor = isTrash ? '#dc2626' : unallocated ? '#9ca3af' : displayColor;
  // Chip único: mesma altura em todos os cards (categoria e tags)
  const chipClass =
    'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md text-[11px] font-medium box-border';

  const handleEdit = (e) => {
    e.stopPropagation();
    if (isTrash) onView?.(ev);
    else onEdit?.(ev);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(ev);
  };

  if (ev.isRequirement) {
    return (
      <div
        key={ev.id}
        className={`group ${cardBase} ${cardMuted} ${cardTrash} border-l-4`}
        style={{ borderLeftColor: accentColor }}
        onClick={() => onView?.(ev)}
      >
        <div
          className="px-3 py-2 flex justify-between items-center shrink-0"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <div
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
            style={{ color: accentColor }}
          >
            <BookOpen size={14} /> Requisito
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg hover:bg-white/80 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-white/80 text-gray-400 hover:text-red-600 transition-colors"
              title={isTrash ? 'Excluir' : 'Excluir'}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 flex-1 flex flex-col min-h-0">
          {objective && area && (
            <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
              <Target size={12} className="shrink-0 text-indigo-600" />
              <span className="text-[11px] font-semibold truncate" title={`Objetivo: ${objective.title} · Área: ${area.name}`}>
                {objective.title} <ChevronRight size={10} className="inline opacity-70" /> {area.name}
              </span>
            </div>
          )}
          {showClassInfo && ev.originClassName && ev.chapter && (
            <div
              className="text-xs font-medium mb-2 flex items-center gap-1"
              style={{ color: ev.color || '#6b7280' }}
            >
              <FolderOpen size={12} className="shrink-0" style={{ color: ev.color || '#6b7280' }} />
              {ev.originClassName} <ChevronRight size={10} className="opacity-80 shrink-0" /> {ev.chapter}
            </div>
          )}
          <h3 className="font-bold text-gray-800 leading-tight mb-2 text-base line-clamp-2">{ev.title}</h3>
          <div className="flex flex-wrap gap-1.5 mb-2 flex-1 min-h-0">
            {showCategory && (
              <span className={`${chipClass} text-white shrink-0`} style={{ backgroundColor: cat.color }}>
                <CatIcon size={10} className="shrink-0" />
                <span className="truncate">{cat.name}</span>
              </span>
            )}
            {(ev.tagIds || [])
              .map((id) => getTag(id))
              .filter(Boolean)
              .map((t) => (
                <span key={t.id} className={`${chipClass} text-white shrink-0`} style={{ backgroundColor: t.color }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                  <span className="truncate">{t.name}</span>
                </span>
              ))}
          </div>
          <div
            className={`text-xs flex items-center gap-1.5 pt-2 mt-auto border-t shrink-0 ${
              unallocated ? 'text-gray-400 border-gray-200' : 'text-gray-500 border-gray-100'
            }`}
          >
            {ev.start ? (
              <>
                <Clock size={14} className="text-blue-500 shrink-0" /> {ev.start.toLocaleDateString('pt-BR')} às{' '}
                {ev.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </>
            ) : (
              <>
                <AlertCircle size={14} className="text-gray-400 shrink-0" />{' '}
                <span className={unallocated ? 'font-medium text-gray-500' : ''}>Não Alocado</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      key={ev.id}
      className={`group ${cardBase} ${cardMuted} ${cardTrash} border-l-4`}
      style={{ borderLeftColor: accentColor }}
      onClick={() => onView?.(ev)}
    >
      <div className="px-3 pt-3 pb-3 flex-1 flex flex-col min-h-0">
        {(objective && area) && (
          <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
            <Target size={12} className="shrink-0 text-indigo-600" />
            <span className="text-[11px] font-semibold truncate" title={`Objetivo: ${objective.title} · Área: ${area.name}`}>
              {objective.title} <ChevronRight size={10} className="inline opacity-70" /> {area.name}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center gap-2 mb-2">
          {showCategory && (
            <span
              className={`${chipClass} w-fit shrink-0 uppercase tracking-wide font-bold`}
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <CatIcon size={10} className="shrink-0" />
              <span className="truncate">{cat.name}</span>
            </span>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <h3 className="font-bold text-gray-800 leading-tight mb-2 text-base line-clamp-2">{ev.title}</h3>
        {ev.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-1 min-h-0">{ev.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(ev.tagIds || [])
            .map((id) => getTag(id))
            .filter(Boolean)
            .map((t) => (
              <span key={t.id} className={`${chipClass} text-white shrink-0`} style={{ backgroundColor: t.color }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                <span className="truncate">{t.name}</span>
              </span>
            ))}
        </div>
        <div
          className={`text-xs flex items-center gap-1.5 pt-2 mt-auto border-t shrink-0 ${
            unallocated ? 'text-gray-400 border-gray-200' : 'text-gray-500 border-gray-100'
          }`}
        >
          {ev.start ? (
            <>
              <Clock size={14} className="text-blue-500 shrink-0" /> {ev.start.toLocaleDateString('pt-BR')} às{' '}
              {ev.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </>
          ) : (
            <>
              <AlertCircle size={14} className="text-gray-400 shrink-0" />{' '}
              <span className={unallocated ? 'font-medium text-gray-500' : ''}>Não Alocado</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

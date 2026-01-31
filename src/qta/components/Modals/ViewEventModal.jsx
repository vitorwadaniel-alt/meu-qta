import { BookOpen, Calendar, Clock, Edit3, FolderOpen, List, RefreshCcw, Target, Trash2, Undo2 } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';

export default function ViewEventModal({
  isOpen,
  onClose,
  event,
  getCategory,
  getTag,
  objectives = [],
  allAreas = [],
  showRestoreMenu,
  onToggleRestoreMenu,
  onRestore,
  onEdit,
  onDelete,
}) {
  if (!event) return null;

  const objective = event.objectiveId ? objectives.find((o) => o.id === event.objectiveId) : null;
  const area = objective ? allAreas.find((a) => a.id === objective.areaId) : null;
  const tags = (event.tagIds || []).map(id => getTag(id)).filter(Boolean);
  const category = getCategory(event.categoryId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Atividade"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <div className="flex gap-2">
            {event.type === 'trash' ? (
              <>
                <div className="relative">
                  <Button
                    variant="secondary"
                    onClick={() => onToggleRestoreMenu(!showRestoreMenu)}
                    className="text-green-600 bg-green-50 hover:bg-green-100 border-green-200"
                  >
                    <Undo2 size={14} className="mr-1.5" /> Restaurar
                  </Button>
                  {showRestoreMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <button onClick={() => onRestore('original', event)} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <RefreshCcw size={12} /> Data Original
                      </button>
                      <button onClick={() => { onClose(); onEdit(event); onToggleRestoreMenu(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Calendar size={12} /> Nova Data
                      </button>
                      <button onClick={() => onRestore('unallocated', event)} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <List size={12} /> Não Alocado
                      </button>
                    </div>
                  )}
                </div>
                <Button variant="danger" onClick={() => { onClose(); onDelete(event); }}>
                  <Trash2 size={16} className="mr-2" /> Excluir
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => { onClose(); onEdit(event); }}>
                  <Edit3 size={16} className="mr-2" /> Editar
                </Button>
                <Button variant="danger" onClick={() => { onClose(); onDelete(event); }}>
                  <Trash2 size={16} className="mr-2" /> {event?.isRequirement ? 'Desagendar' : 'Excluir'}
                </Button>
              </>
            )}
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {event.type === 'trash' && event.deletedAt && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
            <Trash2 size={14} className="shrink-0" />
            <span>Excluído em {event.deletedAt?.toDate ? event.deletedAt.toDate().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span>
          </div>
        )}

        {/* 1. Título — o quê */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug">{event.title}</h3>

        {/* 2. Contexto — onde se encaixa (objetivo, classe, categoria) */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-200/60 bg-slate-100/50">
            <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wide">Contexto</span>
          </div>
          <div className="divide-y divide-slate-200/60">
            {event.isRequirement && event.originClassName && (
              <div className="flex items-start gap-2.5 px-3 py-2.5">
                <BookOpen size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-amber-600">Requisito de classe</span>
                  <span className="block text-sm font-medium text-slate-800">{event.originClassName}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Capítulo: {event.chapter || 'Gerais'}</span>
                </div>
              </div>
            )}
            {objective && area && (
              <div className="flex items-start gap-2.5 px-3 py-2.5">
                <Target size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-indigo-600">Parte do objetivo</span>
                  <span className="block text-sm font-medium text-slate-800">{objective.title}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Área: {area.name}</span>
                </div>
              </div>
            )}
            {!event.isRequirement && (
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-slate-500">Categoria</span>
                  <span className="block text-sm font-medium text-slate-800">{category.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Agendamento — quando */}
        <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg border border-slate-200/80 bg-white">
          <span className="flex items-center gap-2 text-sm text-slate-700">
            <Calendar size={16} className="text-slate-400" />
            {event.start
              ? event.start.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
              : 'Não agendado'}
          </span>
          {event.start && (
            <span className="flex items-center gap-2 text-sm text-slate-700 border-l border-slate-200 pl-4">
              <Clock size={16} className="text-slate-400" />
              {event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* 4. Conteúdo — descrição, observação, tags */}
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] font-semibold uppercase text-slate-400 tracking-wide mb-1.5">Descrição</span>
            {event.description ? (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            ) : (
              <p className="text-slate-400 italic text-sm">Sem descrição.</p>
            )}
          </div>
          {event.observation && (
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2.5">
              <span className="block text-[11px] font-semibold uppercase text-amber-600 tracking-wide mb-1">Observação</span>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{event.observation}</p>
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white" style={{ backgroundColor: t.color }}>
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

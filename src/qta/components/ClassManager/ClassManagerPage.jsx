import { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, RotateCcw, Trash2, Star, Download } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';

/**
 * Página Gerenciador de Classes: abas por departamento, lista compacta de classes.
 * Cada classe é uma linha; ao expandir, mostra progresso e capítulos.
 */
export default function ClassManagerPage({
  allDepartments,
  curriculumClasses,
  events,
  alreadyImportedClassNames,
  onImportClasses,
  onResetClass,
  onRemoveClassFromCalendar,
  showToast,
  isModuleActive,
  onDeactivateModule,
}) {
  const [activeDeptId, setActiveDeptId] = useState(allDepartments[0]?.id || '');
  const [selectedImportClassIds, setSelectedImportClassIds] = useState([]);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, class: null });
  const [confirmKeyword, setConfirmKeyword] = useState('');

  const deptClasses = useMemo(
    () =>
      curriculumClasses
        .filter((c) => c.department === activeDeptId)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [curriculumClasses, activeDeptId]
  );

  // Eventos que são requisitos (por originClassName e por capítulo)
  const classEventsMap = useMemo(() => {
    const reqEvents = events.filter((e) => e.type !== 'trash' && e.isRequirement && e.originClassName);
    const byClass = new Map();
    for (const e of reqEvents) {
      if (!byClass.has(e.originClassName)) byClass.set(e.originClassName, []);
      byClass.get(e.originClassName).push(e);
    }
    return byClass;
  }, [events]);

  const getClassStats = (cls) => {
    const classEvs = classEventsMap.get(cls.name) || [];
    const total = classEvs.length;
    const allocated = classEvs.filter((e) => e.start).length;
    const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;
    return { total, allocated, pct };
  };

  const getChapterStats = (cls, chapter) => {
    const classEvs = classEventsMap.get(cls.name) || [];
    const chapterEvs = classEvs.filter((e) => (e.chapter || 'Gerais') === chapter);
    const total = chapterEvs.length;
    const allocated = chapterEvs.filter((e) => e.start).length;
    const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;
    return { total, allocated, pct };
  };

  const handleImportSelected = async () => {
    if (selectedImportClassIds.length === 0) {
      showToast?.('Selecione pelo menos uma classe para importar.', 'error');
      return;
    }
    await onImportClasses(selectedImportClassIds);
    setSelectedImportClassIds([]);
  };

  const openConfirm = (type, cls) => {
    setConfirmModal({ open: true, type, class: cls });
    setConfirmKeyword('');
  };
  const closeConfirm = () => {
    setConfirmModal({ open: false, type: null, class: null });
    setConfirmKeyword('');
  };

  const requiredKeyword = confirmModal.type === 'zerar' ? 'ZERAR' : confirmModal.type === 'remove' ? 'REMOVER' : '';
  const keywordMatches = confirmModal.class && requiredKeyword && confirmKeyword.trim().toUpperCase() === requiredKeyword;

  const handleConfirmZerar = async () => {
    if (!confirmModal.class) return;
    await onResetClass(confirmModal.class.name);
    closeConfirm();
  };

  const handleConfirmRemove = async () => {
    if (!confirmModal.class) return;
    await onRemoveClassFromCalendar(confirmModal.class.name);
    closeConfirm();
  };

  if (allDepartments.length === 0) {
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center p-8">
        <p className="text-slate-500 italic">Carregando departamentos...</p>
      </div>
    );
  }

  const headerTextClasses = isModuleActive
    ? {
        label: 'text-cyan-200/95 text-sm',
        labelIcon: 'text-cyan-300',
        title: 'text-white font-bold',
        description: 'text-slate-200/90 text-sm',
      }
    : {
        label: 'text-slate-700 text-sm',
        labelIcon: 'text-indigo-500',
        title: 'text-slate-800',
        description: 'text-slate-600 text-sm',
      };

  const classManagerHeader = (
    <>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className={`flex items-center gap-2 ${headerTextClasses.label} mb-1`}>
            <BookOpen className={`${headerTextClasses.labelIcon} shrink-0`} size={18} />
            <span>Currículo</span>
          </div>
          <h1 className={`text-xl ${headerTextClasses.title}`}>Gerenciador de Classes</h1>
          <p className={`${headerTextClasses.description} mt-1`}>
            Importe classes por departamento, acompanhe o progresso dos requisitos e gerencie datas no calendário.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-shrink-0">
          {deptClasses.some((c) => !alreadyImportedClassNames.has(c.name)) && (
            <>
              <Button
                onClick={handleImportSelected}
                disabled={selectedImportClassIds.length === 0}
                className="gap-2 h-10 px-4 text-sm"
              >
                <Download size={16} /> Importar {selectedImportClassIds.length > 0 ? `(${selectedImportClassIds.length})` : ''}
              </Button>
              {selectedImportClassIds.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setSelectedImportClassIds([])}
                  className="gap-2 h-10 px-4 text-sm"
                >
                  Desmarcar
                </Button>
              )}
            </>
          )}
          {isModuleActive && (
            <button
              onClick={onDeactivateModule}
              className="btn-ambient-glow-red h-10 px-4 text-sm font-semibold"
              type="button"
            >
              Desativar Módulo
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation por departamento */}
      <div className={isModuleActive ? 'border-t border-cyan-500/30 pt-2 -mx-1 overflow-x-auto' : 'border-b border-slate-200 bg-slate-50/50 overflow-x-auto'}>
        <nav className={`flex gap-0 min-w-0 ${isModuleActive ? 'px-5' : 'px-5'}`} role="tablist">
          {allDepartments.map((dept) => {
            const isActive = activeDeptId === dept.id;
            const count = curriculumClasses.filter((c) => c.department === dept.id).length;
            return (
              <button
                key={dept.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveDeptId(dept.id);
                  setSelectedImportClassIds([]);
                  setExpandedClassId(null);
                }}
                className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? isModuleActive
                      ? 'border-cyan-400 text-cyan-200 bg-cyan-500/25'
                      : 'border-blue-600 text-blue-600 bg-white'
                    : isModuleActive
                      ? 'border-transparent text-slate-300 hover:text-white hover:bg-white/10'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100/80'
                }`}
              >
                {dept.name}
                <span className={`ml-2 font-normal ${isActive && isModuleActive ? 'text-cyan-100/90' : isModuleActive ? 'text-slate-400' : 'text-slate-400'}`}>({count})</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );

  const classManagerContent = (
    <>
      <div className="flex-1 overflow-y-auto p-5">
        {deptClasses.length === 0 ? (
          <div className="text-center py-12 text-slate-500 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-base font-medium">Nenhuma classe neste departamento</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {deptClasses.map((cls) => {
              const isImported = alreadyImportedClassNames.has(cls.name);
              const { total, allocated, pct } = getClassStats(cls);
              const isComplete = total > 0 && pct === 100;
              const isInProgress = isImported && total > 0 && pct > 0 && pct < 100; // Em movimento
              const chapters = cls.chapters || [];
              const isSelected = selectedImportClassIds.includes(cls.id);
              const isExpanded = expandedClassId === cls.id;
              const hasDetail = isImported && (total > 0 || chapters.length > 0);

              return (
                <li
                  key={cls.id}
                  className={`rounded-xl border-2 transition-colors ${
                    isComplete
                      ? 'border-amber-200/80 bg-amber-50/40'
                      : isInProgress
                        ? 'border-indigo-200/90 bg-indigo-50/30 shadow-sm'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50/70'
                  }`}
                >
                  {/* Linha: nome | barra (usa espaço horizontal) | % | badge/importar | ações — clique expande */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => hasDetail && setExpandedClassId(isExpanded ? null : cls.id)}
                    onKeyDown={(e) => hasDetail && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setExpandedClassId((id) => (id === cls.id ? null : cls.id)))}
                    className={`flex items-center gap-4 py-3 px-4 min-h-0 ${hasDetail ? 'cursor-pointer' : ''}`}
                    aria-expanded={isExpanded}
                    aria-label={hasDetail ? (isExpanded ? 'Recolher detalhes' : 'Ver detalhes da classe') : undefined}
                  >
                    <span className={`shrink-0 p-0.5 rounded text-slate-500 ${!hasDetail ? 'invisible' : ''}`} aria-hidden>
                      {hasDetail ? (isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />) : <span className="w-5 block" />}
                    </span>
                    <span className="font-semibold text-slate-800 truncate text-base w-36 shrink-0" title={cls.name}>
                      {cls.name}
                    </span>
                    {/* Barra de progresso: sempre visível — importadas mostram %, não importadas mostram placeholder */}
                    <div className="flex-1 min-w-[100px] flex items-center gap-2">
                      <div className={`flex-1 min-w-[60px] h-2.5 rounded-full overflow-hidden ${isImported ? 'bg-slate-200' : 'bg-slate-100 border border-dashed border-slate-300'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-amber-500' : isImported ? 'bg-indigo-500' : 'bg-transparent'
                          } ${isInProgress ? 'animate-pulse' : ''}`}
                          style={{ width: isImported ? `${pct}%` : '0%' }}
                        />
                      </div>
                      <span className={`text-sm font-semibold shrink-0 w-12 text-right ${isComplete ? 'text-amber-600' : isImported ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isImported ? `${pct}%` : '—'}
                      </span>
                    </div>
                    {isImported && (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-md shrink-0 ${isInProgress ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                        {isInProgress ? 'Em andamento' : 'Importada'}
                      </span>
                    )}
                    {!isImported && (
                      <label
                        className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedImportClassIds((prev) => [...prev, cls.id]);
                            else setSelectedImportClassIds((prev) => prev.filter((id) => id !== cls.id));
                          }}
                          className="rounded border-gray-300 text-blue-600 w-4 h-4"
                        />
                        Importar
                      </label>
                    )}
                    {isImported && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          onClick={(e) => { e.stopPropagation(); openConfirm('zerar', cls); }}
                          className="gap-2 h-10 px-4 text-sm"
                          title="Zerar alocações"
                        >
                          <RotateCcw size={16} /> Zerar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={(e) => { e.stopPropagation(); openConfirm('remove', cls); }}
                          className="gap-2 h-10 px-4 text-sm"
                          title="Remover do calendário"
                        >
                          <Trash2 size={16} /> Remover
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo expandido: progresso + capítulos em boa largura */}
                  {isExpanded && hasDetail && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-200 bg-white/60 rounded-b-xl">
                      {isImported && total > 0 && (
                        <div className={`rounded-xl border p-4 mb-4 ${isComplete ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-semibold ${isComplete ? 'text-amber-800' : 'text-slate-700'}`}>Progresso da classe</span>
                            <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${isComplete ? 'text-amber-600' : 'text-indigo-600'}`}>
                              {pct}% {isComplete && <Star className="text-amber-500 fill-amber-400" size={16} strokeWidth={2} />}
                            </span>
                          </div>
                          <div className={`h-3 rounded-full overflow-hidden ${isComplete ? 'bg-amber-200' : 'bg-slate-200'}`}>
                            <div
                              className={`h-full rounded-full transition-all ${isComplete ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-indigo-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className={`text-sm mt-1.5 ${isComplete ? 'text-amber-700/90' : 'text-slate-500'}`}>
                            {allocated} de {total} requisitos com data definida.
                          </p>
                        </div>
                      )}
                      {chapters.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Capítulos</span>
                          <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                            {chapters.map((chapter) => {
                              const ch = getChapterStats(cls, chapter);
                              const chComplete = ch.total > 0 && ch.pct === 100;
                              return (
                                <div key={chapter} className="flex items-center gap-3 min-w-0">
                                  <span className="text-sm text-slate-700 truncate shrink-0 w-36" title={chapter}>{chapter}</span>
                                  <div className={`flex-1 min-w-0 h-2 rounded-full overflow-hidden ${chComplete ? 'bg-amber-200' : 'bg-slate-100'}`}>
                                    <div
                                      className={`h-full rounded-full ${chComplete ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                      style={{ width: `${ch.pct}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-medium shrink-0 w-12 text-right ${chComplete ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {ch.allocated}/{ch.total}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className={`h-full shadow-sm border border-slate-200 flex flex-col overflow-hidden ${isModuleActive ? 'page-glow-classmanager rounded-none' : 'bg-white rounded-xl'}`}>
      {isModuleActive ? (
        <>
          <div className="ambient-blobs classmanager" aria-hidden>
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>
          <div className={`page-header-glass shrink-0 ${isModuleActive ? 'nitro-readable' : ''}`}>
            <div className="flex items-start justify-between gap-5 min-w-0">
              <div className="flex-1 min-w-0">{classManagerHeader}</div>
              <div className="nitro-badge nitro-badge-inline classmanager shrink-0">TURBO</div>
            </div>
          </div>
          <div className="page-content-panel flex flex-col">{classManagerContent}</div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-5 border-b border-slate-100 shrink-0">{classManagerHeader}</div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{classManagerContent}</div>
        </div>
      )}

      {/* Modal de confirmação: Zerar ou Remover — layout em duas colunas (ícone | informações) */}
      <Modal
        isOpen={confirmModal.open}
        onClose={closeConfirm}
        title={confirmModal.type === 'zerar' ? 'Zerar classe' : 'Remover classe do calendário'}
        footer={
          <>
            <Button variant="ghost" onClick={closeConfirm}>
              Cancelar
            </Button>
            {confirmModal.type === 'zerar' && (
              <Button onClick={handleConfirmZerar} className="gap-1.5" disabled={!keywordMatches}>
                <RotateCcw size={14} /> Zerar
              </Button>
            )}
            {confirmModal.type === 'remove' && (
              <Button variant="danger" onClick={handleConfirmRemove} className="gap-1.5" disabled={!keywordMatches}>
                <Trash2 size={14} /> Remover
              </Button>
            )}
          </>
        }
      >
        {confirmModal.class && (
          <div className="flex flex-col sm:flex-row gap-6 min-h-[200px]">
            <div className="flex flex-col items-center justify-start sm:justify-center shrink-0 w-full sm:w-28">
              {confirmModal.type === 'zerar' ? (
                <div className="rounded-xl bg-amber-50 p-4 flex items-center justify-center border border-amber-100" aria-hidden>
                  <RotateCcw size={48} className="text-amber-600" strokeWidth={1.8} />
                </div>
              ) : (
                <div className="rounded-xl bg-red-50 p-4 flex items-center justify-center border border-red-100" aria-hidden>
                  <Trash2 size={48} className="text-red-600" strokeWidth={1.8} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <p className="text-slate-600 text-sm leading-relaxed">
                {confirmModal.type === 'zerar' && (
                  <>
                    Ao zerar, todos os requisitos da classe <strong className="text-slate-800">&quot;{confirmModal.class.name}&quot;</strong> voltarão para
                    &quot;Não alocado&quot; e serão removidas todas as configurações personalizadas: datas, tags, vínculos com objetivos e observações. Os requisitos continuarão no calendário, apenas limpos.
                  </>
                )}
                {confirmModal.type === 'remove' && (
                  <>
                    Ao remover a classe <strong className="text-slate-800">&quot;{confirmModal.class.name}&quot;</strong> do calendário, todos os requisitos desta classe
                    serão removidos permanentemente. Para utilizá-los novamente, será necessário importar a classe de novo.
                    Uma nova importação não recupera nada do que foi removido: tags, observações, vínculos com objetivos e demais personalizações virão vazios.
                  </>
                )}
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label htmlFor="confirm-keyword" className="block text-sm font-medium text-slate-700 mb-2">
                  Para confirmar, digite: <strong className="text-slate-800">{requiredKeyword}</strong>
                </label>
                <input
                  id="confirm-keyword"
                  type="text"
                  value={confirmKeyword}
                  onChange={(e) => setConfirmKeyword(e.target.value)}
                  placeholder={requiredKeyword}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
                  autoComplete="off"
                />
                {confirmKeyword.trim() && !keywordMatches && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">O texto digitado não confere.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

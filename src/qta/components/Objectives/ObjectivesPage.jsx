import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ChevronRight,
  FolderOpen,
  Link2,
  Plus,
  Star,
  Target,
  Lock,
  Trash2,
  Link2Off,
  X,
} from 'lucide-react';
import { ICON_MAP, Tag as TagIcon } from '../../constants/icons.js';
import Button from '../Button.jsx';
import EventCard from '../EventCard.jsx';

/**
 * Página Objetivos Maiores: áreas do clube → objetivos → detalhe com progresso.
 * Áreas padrão (admin) não editáveis; usuário pode criar suas áreas.
 * Objetivos agregam atividades/requisitos; progresso = % alocados (com data).
 */
export default function ObjectivesPage({
  allAreas,
  objectives,
  events,
  getCategory,
  getTag,
  canEditArea,
  onAddArea,
  onAddObjective,
  onEditObjective,
  onDeleteObjective,
  onRemoveEventFromObjective,
  onOpenAddActivity,
  onOpenLinkToObjective,
  onViewEvent,
  onEditEvent,
  onDeleteEvent,
  isModuleActive,
  onDeactivateModule,
}) {
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(null);
  const [congratsPopupOpen, setCongratsPopupOpen] = useState(false);
  const previousProgressRef = useRef(null);

  const area = selectedAreaId ? allAreas.find((a) => a.id === selectedAreaId) : null;
  const objective = selectedObjectiveId
    ? objectives.find((o) => o.id === selectedObjectiveId)
    : null;
  const areaObjectives = area
    ? objectives.filter((o) => o.areaId === area.id)
    : [];
  const objectiveEvents = objective
    ? events.filter((e) => e.type !== 'trash' && e.objectiveId === objective.id)
    : [];
  const allocatedCount = objectiveEvents.filter((e) => e.start).length;
  const totalCount = objectiveEvents.length;
  const progressPercent = totalCount > 0 ? Math.round((allocatedCount / totalCount) * 100) : 0;

  // Ao trocar de objetivo, sincronizar "progresso anterior" com o atual (evita confete ao entrar em objetivo já 100%)
  useEffect(() => {
    if (objective?.id != null) {
      previousProgressRef.current = progressPercent;
    }
  }, [objective?.id]);

  // Confetes + popup só quando a barra *atinge* 100% após uma alocação (transição <100% → 100%)
  useEffect(() => {
    if (objective?.id == null || totalCount === 0) {
      return;
    }
    if (progressPercent !== 100 || previousProgressRef.current >= 100) {
      previousProgressRef.current = progressPercent;
      return;
    }

    previousProgressRef.current = 100;

    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const zIndex = 120; // Acima do popup (z-[110]) para os confetes aparecerem por cima

    confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 }, colors, zIndex });
    confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 }, colors, zIndex });

    const t1 = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.55, x: 0.5 },
        colors,
        startVelocity: 30,
        zIndex,
      });
    }, 150);
    const t2 = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 120,
        origin: { y: 0.5, x: 0.5 },
        colors,
        scalar: 1.1,
        zIndex,
      });
    }, 400);

    setCongratsPopupOpen(true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [progressPercent, totalCount, objective?.id]);

  const handleBackToAreas = () => {
    setSelectedAreaId(null);
    setSelectedObjectiveId(null);
    setCongratsPopupOpen(false);
  };
  const handleBackToObjectives = () => {
    setSelectedObjectiveId(null);
    setCongratsPopupOpen(false);
  };

  const headerTextClasses = isModuleActive
    ? { label: 'text-indigo-200/95 text-sm', labelIcon: 'text-indigo-300', title: 'text-white font-bold', description: 'text-slate-200/90 text-sm', nav: 'text-slate-300' }
    : { label: 'text-slate-700 text-sm', labelIcon: 'text-indigo-500', title: 'text-slate-800', description: 'text-slate-600 text-sm', nav: 'text-slate-600' };

  /* Botões legíveis no header TURBO (fundo escuro) */
  const nitroBtnOutline = isModuleActive
    ? '!border-white/50 !text-white hover:!bg-white/20 hover:!border-white/70'
    : '';
  const nitroBtnGhost = isModuleActive
    ? '!text-red-300 hover:!bg-red-500/25 hover:!text-red-200'
    : '';

  // Padrão do projeto: h-10 px-4 text-sm (igual Sidebar "Nova Atividade")
  const headerBtnClass = 'gap-2 h-10 px-4 text-sm';

  // Vista: lista de áreas
  if (!selectedAreaId) {
    const areasHeader = (
      <div className="flex flex-wrap items-start gap-4 w-full">
        <div className="min-w-0 flex-1">
          <div className={`flex items-center gap-2 ${headerTextClasses.label} mb-1`}>
            <Target className={`${headerTextClasses.labelIcon} shrink-0`} size={18} />
            <span>Objetivos Maiores</span>
          </div>
          <h1 className={`text-xl ${headerTextClasses.title}`}>Áreas do clube</h1>
          <p className={`${headerTextClasses.description} mt-1 max-w-xl`}>
            Escolha uma área e crie objetivos para organizar metas em passos concretos.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isModuleActive && (
            <>
              <button
                onClick={onDeactivateModule}
                className="btn-ambient-glow-red h-10 px-4 text-sm font-semibold"
                type="button"
              >
                Desativar Módulo
              </button>
              <div className="nitro-badge nitro-badge-inline">TURBO</div>
            </>
          )}
        </div>
      </div>
    );

    const areasContent = (
      <>
        <div className="flex-1 overflow-y-auto p-4 md:p-5 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {allAreas.map((a) => {
              const IconC = ICON_MAP[a.icon] || TagIcon;
              const count = objectives.filter((o) => o.areaId === a.id).length;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAreaId(a.id)}
                  className="group text-left p-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="p-2.5 rounded-xl shrink-0"
                      style={{ backgroundColor: `${a.color || '#6366f1'}20`, color: a.color || '#6366f1' }}
                    >
                      <IconC size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 truncate">{a.name}</span>
                        {a.isSystem && (
                          <Lock size={12} className="text-slate-400 shrink-0" title="Área padrão (apenas leitura)" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{count} objetivo(s)</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-500 shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
          {canEditArea && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={onAddArea} className="gap-2 h-10 px-4 text-sm">
                <Plus size={18} /> Criar minha área
              </Button>
            </div>
          )}
          {allAreas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-40" />
              <p className="font-medium">Nenhuma área ainda</p>
              <p className="text-sm mt-1">O administrador pode criar áreas padrão no painel Admin.</p>
              {canEditArea && (
                <Button variant="outline" onClick={onAddArea} className="mt-4 gap-2 h-10 px-4 text-sm">
                  <Plus size={18} /> Criar minha primeira área
                </Button>
              )}
            </div>
          )}
        </div>
      </>
    );

    return (
      <div className={`h-full shadow-sm border border-slate-200 flex flex-col overflow-hidden ${isModuleActive ? 'page-glow-objectives rounded-none' : 'bg-white rounded-xl'}`}>
        {isModuleActive ? (
          <>
            <div className="ambient-blobs objectives" aria-hidden>
              <div className="blob blob-1" />
              <div className="blob blob-2" />
              <div className="blob blob-3" />
            </div>
            <div className={`page-header-glass shrink-0 ${isModuleActive ? 'nitro-readable' : ''}`}>
              {areasHeader}
            </div>
            <div className="page-content-panel flex flex-col">{areasContent}</div>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-4 md:p-5 border-b border-slate-100 shrink-0">{areasHeader}</div>
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{areasContent}</div>
          </div>
        )}
      </div>
    );
  }

  // Vista: lista de objetivos da área
  if (!selectedObjectiveId) {
    const objectivesListHeader = (
      <>
        <nav className={`flex items-center gap-2 text-sm ${headerTextClasses.nav} mb-2`}>
          <button type="button" onClick={handleBackToAreas} className="hover:text-indigo-300 flex items-center gap-1">
            <ArrowLeft size={16} /> Áreas
          </button>
          <ChevronRight size={14} />
          <span className={`font-medium ${isModuleActive ? 'text-slate-200' : 'text-slate-700'}`}>{area?.name}</span>
        </nav>
        <div className="flex flex-wrap items-start gap-4 w-full">
          <div className="min-w-0 flex-1">
            <h1 className={`text-xl ${headerTextClasses.title}`}>Objetivos</h1>
            <p className={`${headerTextClasses.description} mt-0.5 max-w-xl`}>Crie objetivos e vincule atividades ou requisitos para acompanhar o progresso.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={() => onAddObjective(area.id)} className={headerBtnClass}>
              <Plus size={16} /> Novo objetivo
            </Button>
            {isModuleActive && <div className="nitro-badge nitro-badge-inline">TURBO</div>}
          </div>
        </div>
      </>
    );

    const objectivesListContent = (
      <>
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          <div className="space-y-3">
            {areaObjectives.map((obj) => {
              const evs = events.filter((e) => e.type !== 'trash' && e.objectiveId === obj.id);
              const alloc = evs.filter((e) => e.start).length;
              const total = evs.length;
              const pct = total > 0 ? Math.round((alloc / total) * 100) : 0;
              const isComplete = pct === 100;
              return (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObjectiveId(obj.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    isComplete
                      ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-50'
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-800 truncate">{obj.title}</h3>
                      {obj.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{obj.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden max-w-[120px] transition-colors duration-300 ${isComplete ? 'bg-amber-200' : 'bg-slate-100'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 shadow-sm' : 'bg-indigo-500'}`}
                            style={{
                              width: `${pct}%`,
                              ...(isComplete && { boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)' }),
                            }}
                          />
                        </div>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${isComplete ? 'text-amber-600' : 'text-slate-600'}`}>
                          {pct}%
                          {isComplete && <Star className="text-amber-500 fill-amber-400 shrink-0" size={14} strokeWidth={2} />}
                        </span>
                        <span className={`text-xs ${isComplete ? 'text-amber-600/80' : 'text-slate-400'}`}>{alloc}/{total} alocados</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
          {areaObjectives.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Target size={48} className="mx-auto mb-4 opacity-40" />
              <p className="font-medium">Nenhum objetivo nesta área</p>
              <p className="text-sm mt-1">Crie um objetivo e comece a vincular atividades ou requisitos.</p>
              <Button onClick={() => onAddObjective(area.id)} className="mt-4 gap-2 h-10 px-4 text-sm">
                <Plus size={18} /> Criar primeiro objetivo
              </Button>
            </div>
          )}
        </div>
      </>
    );

    return (
      <div className={`h-full shadow-sm border border-slate-200 flex flex-col overflow-hidden ${isModuleActive ? 'page-glow-objectives rounded-none' : 'bg-white rounded-xl'}`}>
        {isModuleActive ? (
          <>
            <div className="ambient-blobs objectives" aria-hidden>
              <div className="blob blob-1" />
              <div className="blob blob-2" />
              <div className="blob blob-3" />
            </div>
            <div className={`page-header-glass shrink-0 ${isModuleActive ? 'nitro-readable' : ''}`}>
              {objectivesListHeader}
            </div>
            <div className="page-content-panel flex flex-col">{objectivesListContent}</div>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-4 md:p-5 border-b border-slate-100 shrink-0">{objectivesListHeader}</div>
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{objectivesListContent}</div>
          </div>
        )}
      </div>
    );
  }

  // Vista: detalhe do objetivo — layout compacto, botões padronizados
  const objectiveDetailHeader = (
    <div className="space-y-4">
      <nav className={`flex items-center gap-2 text-sm ${headerTextClasses.nav}`}>
        <button type="button" onClick={handleBackToAreas} className="hover:text-indigo-300 flex items-center gap-1">
          <ArrowLeft size={16} /> Áreas
        </button>
        <ChevronRight size={14} />
        <button type="button" onClick={handleBackToObjectives} className="hover:text-indigo-300">
          {area?.name}
        </button>
        <ChevronRight size={14} />
        <span className={`font-medium truncate ${isModuleActive ? 'text-slate-200' : 'text-slate-700'}`}>{objective?.title}</span>
      </nav>

      <div className="flex flex-col gap-4">
        {/* Título (flex-1 preenche) + ações + TURBO colados à direita */}
        <div className="flex flex-wrap items-start gap-4 w-full">
          <div className="min-w-0 flex-1 max-w-2xl">
            <h1 className={`text-xl font-bold truncate ${headerTextClasses.title}`}>{objective?.title}</h1>
            {objective?.description && (
              <p className={`text-sm mt-1 line-clamp-2 ${isModuleActive ? 'text-slate-200/80' : 'text-slate-500'}`}>{objective.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button variant="outline" onClick={() => onEditObjective(objective)} className={`${headerBtnClass} ${nitroBtnOutline}`}>
              Editar objetivo
            </Button>
            <Button variant="ghost" onClick={() => onDeleteObjective(objective)} className={`${headerBtnClass} ${nitroBtnGhost} ${!isModuleActive ? '!text-red-600 hover:!bg-red-50' : ''}`}>
              <Trash2 size={16} /> Excluir
            </Button>
            <span className={`hidden sm:inline w-px h-8 self-center ${isModuleActive ? 'bg-white/40' : 'bg-slate-300/60'}`} aria-hidden />
            <Button variant="outline" onClick={() => onOpenLinkToObjective(objective.id)} className={`${headerBtnClass} ${nitroBtnOutline}`}>
              <Link2 size={16} /> Vincular existente
            </Button>
            <Button onClick={() => onOpenAddActivity(objective.id)} className={headerBtnClass}>
              <Plus size={16} /> Nova atividade
            </Button>
            {isModuleActive && <div className="nitro-badge nitro-badge-inline">TURBO</div>}
          </div>
        </div>

        {/* Card de progresso */}
        <div className={`rounded-xl border p-4 transition-colors duration-300 ${progressPercent === 100 ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${progressPercent === 100 ? 'text-amber-800' : 'text-slate-700'}`}>Progresso (planejado)</span>
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${progressPercent === 100 ? 'text-amber-600' : 'text-indigo-600'}`}>
              {progressPercent}%
              {progressPercent === 100 && (
                <Star className="text-amber-500 fill-amber-400 drop-shadow-sm" size={18} strokeWidth={2} />
              )}
            </span>
          </div>
          <div className={`h-3 rounded-full overflow-hidden transition-colors duration-300 ${progressPercent === 100 ? 'bg-amber-200' : 'bg-slate-200'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 shadow-sm' : 'bg-indigo-500'}`}
              style={{
                width: `${progressPercent}%`,
                ...(progressPercent === 100 && { boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)' }),
              }}
            />
          </div>
          <p className={`text-xs mt-1.5 ${progressPercent === 100 ? 'text-amber-700/90' : 'text-slate-500'}`}>
            {allocatedCount} de {totalCount} itens com data definida. Quando todos estiverem alocados, o objetivo estará planejado.
          </p>
        </div>
      </div>
    </div>
  );

  const objectiveDetailContent = (
    <>
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Atividades e requisitos vinculados</h2>
        {objectiveEvents.length === 0 ? (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <Target size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="font-semibold text-slate-700">Nenhum item ainda</p>
            <p className="text-sm mt-1.5 text-slate-600 max-w-sm mx-auto">Crie uma nova atividade ou vincule requisitos/atividades já existentes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5 md:content-start md:auto-rows-min">
            {objectiveEvents.map((ev) => (
              <div key={ev.id} className="relative group/card shrink-0">
                <EventCard
                  event={ev}
                  getCategory={getCategory}
                  getTag={getTag}
                  isUnallocated={!ev.start}
                  isTrash={false}
                  showCategory
                  showClassInfo
                  objectives={objectives}
                  allAreas={allAreas}
                  onView={onViewEvent}
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                />
                <button
                  type="button"
                  onClick={() => onRemoveEventFromObjective(ev)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/90 shadow border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 opacity-0 group-hover/card:opacity-100 transition-opacity"
                  title="Desvincular do objetivo"
                >
                  <Link2Off size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
  );

  return (
    <>
    <div className={`h-full shadow-sm border border-slate-200 flex flex-col overflow-hidden ${isModuleActive ? 'page-glow-objectives rounded-none' : 'bg-white rounded-xl'}`}>
      {isModuleActive ? (
        <>
          <div className="ambient-blobs objectives" aria-hidden>
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>
          <div className={`page-header-glass shrink-0 ${isModuleActive ? 'nitro-readable' : ''}`}>
            {objectiveDetailHeader}
          </div>
          <div className="page-content-panel flex flex-col">{objectiveDetailContent}</div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-5 border-b border-slate-100 shrink-0">{objectiveDetailHeader}</div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{objectiveDetailContent}</div>
        </div>
      )}
    </div>

    {congratsPopupOpen && (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-amber-950/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setCongratsPopupOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="congrats-title"
      >
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300"
          style={{
            background: 'linear-gradient(145deg, rgba(254, 243, 199, 0.9) 0%, rgba(253, 230, 138, 0.9) 35%, rgba(251, 191, 36, 0.85) 70%, rgba(217, 119, 6, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 191, 36, 0.6)',
            boxShadow: '0 8px 32px rgba(120, 53, 15, 0.25), 0 0 0 1px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-30" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.9) 0%, transparent 70%)' }} />
          <div className="relative p-8 text-center">
            <button
              type="button"
              onClick={() => setCongratsPopupOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full text-amber-900/80 hover:bg-amber-200/60 hover:text-amber-950 transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            <div className="flex justify-center mb-5">
              <div
                className="p-4 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  border: '2px solid rgba(217, 119, 6, 0.5)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 8px rgba(120, 53, 15, 0.2)',
                }}
              >
                <Star size={52} className="text-amber-700 fill-amber-600" strokeWidth={1.5} />
              </div>
            </div>
            <h2 id="congrats-title" className="text-xl font-bold text-amber-950 mb-2">
              Parabéns!
            </h2>
            <p className="text-amber-900/95 font-medium text-base leading-snug mb-6">
              Seu objetivo foi planejado por completo.
            </p>
            <Button
              onClick={() => setCongratsPopupOpen(false)}
              className="bg-amber-800 hover:bg-amber-900 text-amber-50 border border-amber-700/50 shadow-lg"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

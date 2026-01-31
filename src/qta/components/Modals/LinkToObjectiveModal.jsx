import { useMemo, useState } from 'react';
import { BookOpen, Calendar, ChevronDown, Link2, Search, Tag } from 'lucide-react';
import { ICON_MAP, Tag as TagIcon } from '../../constants/icons.js';
import Button from '../Button.jsx';
import FilterDropdown from '../FilterDropdown.jsx';
import Modal from '../Modal.jsx';

/**
 * Modal para vincular ao objetivo atividades ou requisitos já existentes (já importados ou criados).
 * Busca e filtros no mesmo modelo da busca padrão (texto, categoria, tag, departamento, classe).
 */
export default function LinkToObjectiveModal({
  isOpen,
  onClose,
  objective,
  events,
  categories,
  tags,
  allDepartments = [],
  curriculumClasses = [],
  getCategory,
  getTag,
  onLink,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterCategoryIds, setSearchFilterCategoryIds] = useState([]);
  const [searchFilterTagIds, setSearchFilterTagIds] = useState([]);
  const [searchFilterDepartmentIds, setSearchFilterDepartmentIds] = useState([]);
  const [searchFilterClassIds, setSearchFilterClassIds] = useState([]);
  const [searchFilterOpen, setSearchFilterOpen] = useState(null);
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [linking, setLinking] = useState(false);

  const selectedDepartmentClassNames = useMemo(() => {
    if (!searchFilterDepartmentIds?.length) return null;
    return new Set(
      curriculumClasses
        .filter((c) => searchFilterDepartmentIds.includes(c.department))
        .map((c) => c.name)
    );
  }, [curriculumClasses, searchFilterDepartmentIds]);

  const selectedClassNames = useMemo(() => {
    if (!searchFilterClassIds?.length) return null;
    return new Set(
      curriculumClasses
        .filter((c) => searchFilterClassIds.includes(c.id))
        .map((c) => c.name)
    );
  }, [curriculumClasses, searchFilterClassIds]);

  const candidateEvents = useMemo(() => {
    if (!objective?.id || !events) return [];
    return events.filter(
      (e) => e.type !== 'trash' && (e.objectiveId !== objective.id || !e.objectiveId)
    );
  }, [events, objective?.id]);

  const filteredEvents = useMemo(() => {
    let list = candidateEvents;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (e) =>
          (e.title || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
      );
    }
    if (searchFilterCategoryIds.length > 0) {
      list = list.filter((e) => searchFilterCategoryIds.includes(e.categoryId));
    }
    if (searchFilterTagIds.length > 0) {
      list = list.filter((e) =>
        (e.tagIds || []).some((id) => searchFilterTagIds.includes(id))
      );
    }
    if (selectedDepartmentClassNames) {
      list = list.filter(
        (e) =>
          e.isRequirement &&
          e.originClassName &&
          selectedDepartmentClassNames.has(e.originClassName)
      );
    }
    if (selectedClassNames) {
      list = list.filter(
        (e) =>
          e.isRequirement &&
          e.originClassName &&
          selectedClassNames.has(e.originClassName)
      );
    }
    return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }, [
    candidateEvents,
    searchQuery,
    searchFilterCategoryIds,
    searchFilterTagIds,
    selectedDepartmentClassNames,
    selectedClassNames,
  ]);

  const toggleEvent = (id) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedEventIds.length >= filteredEvents.length) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(filteredEvents.map((e) => e.id));
    }
  };

  const handleLink = async () => {
    if (selectedEventIds.length === 0) return;
    setLinking(true);
    try {
      await onLink(selectedEventIds);
      setSelectedEventIds([]);
      setSearchQuery('');
      setSearchFilterCategoryIds([]);
      setSearchFilterTagIds([]);
      setSearchFilterDepartmentIds([]);
      setSearchFilterClassIds([]);
      onClose();
    } finally {
      setLinking(false);
    }
  };

  const handleClose = () => {
    setSelectedEventIds([]);
    setSearchQuery('');
    setSearchFilterCategoryIds([]);
    setSearchFilterTagIds([]);
    setSearchFilterDepartmentIds([]);
    setSearchFilterClassIds([]);
    setSearchFilterOpen(null);
    onClose();
  };

  if (!objective) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Vincular ao objetivo"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleLink}
            disabled={selectedEventIds.length === 0 || linking}
            className="gap-2"
          >
            <Link2 size={16} />
            {linking ? 'Vinculando…' : `Vincular ${selectedEventIds.length} item(ns)`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Busque e selecione <strong>requisitos já importados</strong> ou <strong>atividades já criadas</strong> (alocadas ou não) para vincular ao objetivo &quot;{objective.title}&quot;.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border-2 border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
            />
          </div>
          <FilterDropdown
            type="category"
            label="Categoria"
            items={categories || []}
            getItemId={(c) => c.id}
            getItemLabel={(c) => c.name}
            getItemColor={(c) => c.color}
            selectedIds={searchFilterCategoryIds}
            onToggle={(id, sel) =>
              setSearchFilterCategoryIds((prev) =>
                sel ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            isOpen={searchFilterOpen === 'category'}
            onOpenChange={setSearchFilterOpen}
            lockedPageFilterId={null}
            lockedPageFilterType={null}
          />
          <FilterDropdown
            type="tag"
            label="Tag"
            items={tags || []}
            getItemId={(t) => t.id}
            getItemLabel={(t) => t.name}
            getItemColor={(t) => t.color}
            selectedIds={searchFilterTagIds}
            onToggle={(id, sel) =>
              setSearchFilterTagIds((prev) =>
                sel ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            Icon={Tag}
            isOpen={searchFilterOpen === 'tag'}
            onOpenChange={setSearchFilterOpen}
            lockedPageFilterId={null}
            lockedPageFilterType={null}
          />
          <FilterDropdown
            type="department"
            label="Departamento"
            items={allDepartments}
            getItemId={(d) => d.id}
            getItemLabel={(d) => d.name}
            selectedIds={searchFilterDepartmentIds}
            onToggle={(id, sel) =>
              setSearchFilterDepartmentIds((prev) =>
                sel ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            isOpen={searchFilterOpen === 'department'}
            onOpenChange={setSearchFilterOpen}
            lockedPageFilterId={null}
            lockedPageFilterType={null}
          />
          <FilterDropdown
            type="class"
            label="Classe"
            items={[...curriculumClasses].sort((a, b) => (a.order || 0) - (b.order || 0))}
            getItemId={(c) => c.id}
            getItemLabel={(c) => c.name}
            getItemColor={(c) => c.color}
            selectedIds={searchFilterClassIds}
            onToggle={(id, sel) =>
              setSearchFilterClassIds((prev) =>
                sel ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            Icon={BookOpen}
            isOpen={searchFilterOpen === 'class'}
            onOpenChange={setSearchFilterOpen}
            lockedPageFilterId={null}
            lockedPageFilterType={null}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {filteredEvents.length} item(ns) encontrado(s)
            {candidateEvents.length !== filteredEvents.length &&
              ` (de ${candidateEvents.length} disponíveis)`}
          </span>
          {filteredEvents.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-indigo-600 hover:underline font-medium"
            >
              {selectedEventIds.length >= filteredEvents.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          )}
        </div>

        <div className="border-2 border-slate-200 rounded-xl overflow-hidden max-h-[360px] overflow-y-auto bg-slate-50/50">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              {candidateEvents.length === 0
                ? 'Não há atividades ou requisitos disponíveis para vincular (todos já estão neste objetivo ou não há itens no calendário).'
                : 'Nenhum item corresponde à busca ou aos filtros.'}
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {filteredEvents.map((ev) => {
                const cat = getCategory(ev.categoryId);
                const CatIcon = ICON_MAP[cat?.icon] || TagIcon;
                const isSelected = selectedEventIds.includes(ev.id);
                return (
                  <li key={ev.id}>
                    <label
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50' : 'hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleEvent(ev.id)}
                        className="rounded border-gray-300 text-indigo-600 shrink-0"
                      />
                      <div
                        className="p-1.5 rounded shrink-0"
                        style={{
                          backgroundColor: ev.isRequirement ? 'rgba(249,115,22,0.15)' : 'rgba(59,130,246,0.15)',
                          color: ev.isRequirement ? '#ea580c' : '#2563eb',
                        }}
                      >
                        {ev.isRequirement ? <BookOpen size={16} /> : <Calendar size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-slate-800 block truncate">{ev.title}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <CatIcon size={12} style={{ color: cat?.color }} />
                            {cat?.name || 'Geral'}
                          </span>
                          {ev.isRequirement && ev.originClassName && (
                            <span>· {ev.originClassName}</span>
                          )}
                          {ev.start ? (
                            <span>· Alocado</span>
                          ) : (
                            <span>· Não alocado</span>
                          )}
                        </span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400 rotate-[270deg] shrink-0" />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

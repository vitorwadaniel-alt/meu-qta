import { useState, useMemo } from 'react';
import { Calendar, Target, BookOpen, Printer } from 'lucide-react';
import Modal from '../Modal.jsx';
import Button from '../Button.jsx';

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function getMonthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/**
 * Modal de opções antes de imprimir. Exibe filtros conforme o tipo de relatório.
 */
export default function PrintOptionsModal({
  isOpen,
  onClose,
  reportType,
  onConfirm,
  events = [],
  categories = [],
  tags = [],
  allAreas = [],
  allDepartments = [],
  alreadyImportedClassNames = new Set(),
  curriculumClasses = [],
}) {
  // null = todos, [] = nenhum, [...] = seleção
  const [monthKeys, setMonthKeys] = useState(null);
  const [categoryIds, setCategoryIds] = useState(null);
  const [tagIds, setTagIds] = useState(null);
  const [includeRequirements, setIncludeRequirements] = useState(true);
  const [areaIds, setAreaIds] = useState(null);
  const [departmentIds, setDepartmentIds] = useState(null);
  const [classFilter, setClassFilter] = useState('all');

  const availableMonths = useMemo(() => {
    const keys = new Set();
    (events || []).forEach((e) => {
      if (e.type !== 'trash' && e.start) keys.add(getMonthKey(e.start));
    });
    return [...keys].sort();
  }, [events]);

  const toggleMonth = (key) => {
    setMonthKeys((prev) => {
      const list = prev === null ? [...availableMonths] : prev;
      const next = list.filter((k) => k !== key);
      if (next.length === 0) return [];
      if (next.length === availableMonths.length) return null;
      return next;
    });
  };
  const toggleCategory = (id) => {
    setCategoryIds((prev) => {
      const list = prev === null ? categories.map((c) => c.id) : prev;
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      if (next.length === 0) return [];
      if (next.length === categories.length) return null;
      return next;
    });
  };
  const toggleTag = (id) => {
    setTagIds((prev) => {
      const list = prev === null ? tags.map((t) => t.id) : prev;
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      if (next.length === 0) return [];
      if (next.length === tags.length) return null;
      return next;
    });
  };
  const toggleArea = (id) => {
    setAreaIds((prev) => {
      const list = prev === null ? allAreas.map((a) => a.id) : prev;
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      if (next.length === 0) return [];
      if (next.length === allAreas.length) return null;
      return next;
    });
  };
  const toggleDepartment = (id) => {
    setDepartmentIds((prev) => {
      const list = prev === null ? allDepartments.map((d) => d.id) : prev;
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      if (next.length === 0) return [];
      if (next.length === allDepartments.length) return null;
      return next;
    });
  };

  const selectAllMonths = () => setMonthKeys(null);
  const clearMonths = () => setMonthKeys([]);
  const selectAllCategories = () => setCategoryIds(null);
  const clearCategories = () => setCategoryIds([]);
  const selectAllTags = () => setTagIds(null);
  const clearTags = () => setTagIds([]);
  const selectAllAreas = () => setAreaIds(null);
  const clearAreas = () => setAreaIds([]);
  const selectAllDepartments = () => setDepartmentIds(null);
  const clearDepartments = () => setDepartmentIds([]);

  const isMonthChecked = (key) =>
    monthKeys === null ? true : Array.isArray(monthKeys) && monthKeys.includes(key);
  const isCategoryChecked = (id) =>
    categoryIds === null ? true : Array.isArray(categoryIds) && categoryIds.includes(id);
  const isTagChecked = (id) => (tagIds === null ? true : Array.isArray(tagIds) && tagIds.includes(id));
  const isAreaChecked = (id) => (areaIds === null ? true : Array.isArray(areaIds) && areaIds.includes(id));
  const isDepartmentChecked = (id) =>
    departmentIds === null ? true : Array.isArray(departmentIds) && departmentIds.includes(id);

  const handleConfirm = () => {
    const options = {};
    if (reportType === 'calendar') {
      options.monthKeys = monthKeys === null ? null : monthKeys;
      options.categoryIds = categoryIds === null ? null : categoryIds;
      options.tagIds = tagIds === null ? null : tagIds;
      options.includeRequirements = includeRequirements;
    } else if (reportType === 'objectives') {
      options.areaIds = areaIds === null ? null : areaIds;
    } else if (reportType === 'classManager') {
      options.departmentIds = departmentIds === null ? null : departmentIds;
      options.classFilter = classFilter;
    }
    onConfirm(options);
    onClose();
  };

  const title =
    reportType === 'calendar'
      ? 'Opções de impressão – Calendário'
      : reportType === 'objectives'
        ? 'Opções de impressão – Objetivos'
        : 'Opções de impressão – Gerenciador de Classes';

  const Icon = reportType === 'calendar' ? Calendar : reportType === 'objectives' ? Target : BookOpen;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="gap-2">
            <Printer size={16} />
            Imprimir
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-600 flex items-center gap-2">
          <Icon size={18} className="text-slate-500" />
          Escolha o que incluir no relatório. Deixe em branco para incluir tudo.
        </p>

        {reportType === 'calendar' && (
          <>
            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-800">Meses</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllMonths}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Todos
                  </button>
                  <button type="button" onClick={clearMonths} className="text-xs text-slate-500 hover:underline">
                    Nenhum
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
                {availableMonths.length === 0 ? (
                  <span className="text-xs text-slate-500">Nenhum evento com data no calendário.</span>
                ) : (
                  availableMonths.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-200/50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={isMonthChecked(key)}
                        onChange={() => toggleMonth(key)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      {getMonthLabel(key)}
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Vazio = todos os meses com eventos</p>
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-800">Categorias</label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllCategories} className="text-xs text-indigo-600 hover:underline">
                    Todas
                  </button>
                  <button type="button" onClick={clearCategories} className="text-xs text-slate-500 hover:underline">
                    Nenhuma
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
                {categories.length === 0 ? (
                  <span className="text-xs text-slate-500">Nenhuma categoria cadastrada.</span>
                ) : (
                  categories.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-200/50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={isCategoryChecked(c.id)}
                        onChange={() => toggleCategory(c.id)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: c.color || '#94a3b8' }}
                      />
                      {c.name}
                    </label>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-800">Tags</label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllTags} className="text-xs text-indigo-600 hover:underline">
                    Todas
                  </button>
                  <button type="button" onClick={clearTags} className="text-xs text-slate-500 hover:underline">
                    Nenhuma
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
                {tags.length === 0 ? (
                  <span className="text-xs text-slate-500">Nenhuma tag cadastrada.</span>
                ) : (
                  tags.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-200/50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={isTagChecked(t.id)}
                        onChange={() => toggleTag(t.id)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      {t.name}
                    </label>
                  ))
                )}
              </div>
            </section>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRequirements}
                onChange={(e) => setIncludeRequirements(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span className="text-sm text-slate-700">Incluir requisitos (REQ) no calendário</span>
            </label>
          </>
        )}

        {reportType === 'objectives' && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-800">Áreas</label>
              <div className="flex gap-2">
                <button type="button" onClick={selectAllAreas} className="text-xs text-indigo-600 hover:underline">
                  Todas
                </button>
                <button type="button" onClick={clearAreas} className="text-xs text-slate-500 hover:underline">
                  Nenhuma
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
              {allAreas.length === 0 ? (
                <span className="text-xs text-slate-500">Nenhuma área cadastrada.</span>
              ) : (
                allAreas.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-200/50 rounded px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={isAreaChecked(a.id)}
                      onChange={() => toggleArea(a.id)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: a.color || '#6366f1' }}
                    />
                    {a.name}
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Vazio = todas as áreas</p>
          </section>
        )}

        {reportType === 'classManager' && (
          <>
            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-800">Departamentos</label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllDepartments} className="text-xs text-indigo-600 hover:underline">
                    Todos
                  </button>
                  <button type="button" onClick={clearDepartments} className="text-xs text-slate-500 hover:underline">
                    Nenhum
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
                {allDepartments.length === 0 ? (
                  <span className="text-xs text-slate-500">Nenhum departamento.</span>
                ) : (
                  allDepartments.map((d) => (
                    <label
                      key={d.id}
                      className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-200/50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={isDepartmentChecked(d.id)}
                        onChange={() => toggleDepartment(d.id)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      {d.name}
                    </label>
                  ))
                )}
              </div>
            </section>

            <section>
              <label className="text-sm font-semibold text-slate-800 block mb-2">Classes</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="classFilter"
                    checked={classFilter === 'all'}
                    onChange={() => setClassFilter('all')}
                    className="border-slate-300 text-indigo-600"
                  />
                  Todas (importadas e não importadas)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="classFilter"
                    checked={classFilter === 'imported'}
                    onChange={() => setClassFilter('imported')}
                    className="border-slate-300 text-indigo-600"
                  />
                  Apenas importadas
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="classFilter"
                    checked={classFilter === 'not_imported'}
                    onChange={() => setClassFilter('not_imported')}
                    className="border-slate-300 text-indigo-600"
                  />
                  Apenas não importadas
                </label>
              </div>
            </section>
          </>
        )}
      </div>
    </Modal>
  );
}

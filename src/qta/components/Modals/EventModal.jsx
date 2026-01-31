import { Save, Target } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';
import { RECURRENCE_FREQ, RECURRENCE_END, RECURRENCE_INTERVAL_LABEL, WEEKDAY_LABELS } from '../../constants/recurrence.js';

export default function EventModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  editingEvent,
  categories,
  tags,
  objectives = [],
  allAreas = [],
  onSave,
}) {
  const objectiveId = editingEvent?.objectiveId || formData.objectiveId;
  const objective = objectiveId ? objectives.find((o) => o.id === objectiveId) : null;
  const area = objective ? allAreas.find((a) => a.id === objective.areaId) : null;
  const sortedCategories = [...(categories || [])].sort((a, b) => {
    if (a.isSystem && b.isSystem) return (a.order ?? 999) - (b.order ?? 999);
    if (a.isSystem) return -1;
    if (b.isSystem) return 1;
    return 0;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEvent ? (editingEvent.isRequirement ? 'Editar Requisito' : 'Editar Evento') : 'Nova Atividade'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave}><Save size={16} className="mr-2" /> Salvar</Button>
        </>
      }
    >
      <div className="space-y-4">
        {objective && area && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
              <Target size={20} />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold uppercase text-indigo-600 tracking-wider">Parte do objetivo</span>
              <span className="block font-semibold text-indigo-900 truncate">{objective.title}</span>
              <span className="block text-xs text-indigo-600 mt-0.5">Área: {area.name}</span>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border disabled:bg-gray-100"
            placeholder="Ex: Reunião Regular"
            disabled={editingEvent?.isRequirement}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              {sortedCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agendamento</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="unallocated"
                checked={formData.isUnallocated}
                onChange={e => setFormData({ ...formData, isUnallocated: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="unallocated" className="text-sm text-gray-600 select-none">Não alocado</label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <p className="text-xs text-gray-500 mb-2">Opcional. Escolha quantas quiser para organizar e buscar. Crie tags em Configurações.</p>
          {tags.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nenhuma tag. Clique na engrenagem ao lado de Tags na barra lateral para criar.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map(t => {
                const sel = (formData.tagIds || []).includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      tagIds: sel ? (formData.tagIds || []).filter(id => id !== t.id) : [...(formData.tagIds || []), t.id]
                    })}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-sm transition-colors ${sel ? 'border-transparent text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    style={sel ? { backgroundColor: t.color } : {}}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sel ? 'rgba(255,255,255,0.6)' : t.color }}
                    />
                    {t.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {!formData.isUnallocated && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-md border-gray-300 text-sm p-1.5 border"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Hora</label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full rounded-md border-gray-300 text-sm p-1.5 border"
              />
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Este evento repete?</label>
                <p className="text-xs text-gray-500 mb-2">Ex.: reunião toda segunda, culto todo domingo.</p>
                <select
                  value={formData.recurrence}
                  onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                  className="w-full rounded-md border-gray-300 text-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  aria-label="Com que frequência o evento repete"
                >
                  {RECURRENCE_FREQ.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              {formData.recurrence !== 'none' && (
                <>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-600 mb-1">De quanto em quanto tempo?</label>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm text-gray-600">De</span>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={formData.recurrenceInterval ?? 1}
                        onChange={e => setFormData({ ...formData, recurrenceInterval: parseInt(e.target.value) || 1 })}
                        className="w-14 rounded-md border-gray-300 text-sm p-1.5 border text-center"
                        aria-label="Intervalo numérico"
                      />
                      <span className="text-sm text-gray-600">em</span>
                      <span className="text-sm font-medium text-gray-700">{formData.recurrenceInterval ?? 1}</span>
                      <span className="text-sm text-gray-600">
                        {(RECURRENCE_INTERVAL_LABEL[formData.recurrence] || { other: 'dias' })[formData.recurrenceInterval === 1 ? '1' : 'other']}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Ex.: de 1 em 1 dia = todo dia. De 2 em 2 semanas = a cada duas semanas.</p>
                  </div>
                  {formData.recurrence === 'weekly' && (
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <label className="block text-xs font-medium text-gray-600 mb-2">Em que dias da semana?</label>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAY_LABELS.map((lbl, i) => (
                          <label
                            key={i}
                            className={`inline-flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-md border transition-colors ${(formData.recurrenceWeekdays || []).includes(i) ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                          >
                            <input
                              type="checkbox"
                              checked={(formData.recurrenceWeekdays || []).includes(i)}
                              onChange={e => {
                                const w = formData.recurrenceWeekdays || [];
                                setFormData({
                                  ...formData,
                                  recurrenceWeekdays: e.target.checked ? [...w, i].sort((a, b) => a - b) : w.filter(x => x !== i)
                                });
                              }}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm">{lbl}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-600 mb-2">Quando deve parar de repetir?</label>
                    <div className="flex flex-col gap-3">
                      {RECURRENCE_END.map(opt => (
                        <label key={opt.value} className="flex flex-wrap items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="recurrenceEnd"
                            checked={(formData.recurrenceEnd || 'never') === opt.value}
                            onChange={() => setFormData({ ...formData, recurrenceEnd: opt.value })}
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                          {opt.value === 'on_date' && (
                            <input
                              type="date"
                              value={formData.recurrenceEndDate || ''}
                              onChange={e => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                              className="rounded-md border border-gray-300 text-sm p-1.5"
                              aria-label="Data em que a repetição termina"
                            />
                          )}
                          {opt.value === 'after' && (
                            <>
                              <input
                                type="number"
                                min="2"
                                max="730"
                                value={formData.recurrenceEndCount ?? 10}
                                onChange={e => setFormData({ ...formData, recurrenceEndCount: parseInt(e.target.value) || 2 })}
                                className="w-16 rounded-md border border-gray-300 text-sm p-1.5 text-center"
                                aria-label="Número de vezes"
                              />
                              <span className="text-sm text-gray-600">vezes</span>
                            </>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            disabled={editingEvent?.isRequirement}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
          <p className="text-xs text-gray-500 mb-2">Campo livre para suas anotações sobre esta atividade. Pode ser editado a qualquer momento.</p>
          <textarea
            rows={2}
            value={formData.observation ?? ''}
            onChange={e => setFormData({ ...formData, observation: e.target.value })}
            className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="Ex: lembrar de levar material, observações do diretor..."
          />
        </div>
      </div>
    </Modal>
  );
}

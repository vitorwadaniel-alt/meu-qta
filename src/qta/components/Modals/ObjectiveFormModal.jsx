import { Save, Target } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';

export default function ObjectiveFormModal({
  isOpen,
  onClose,
  areaId,
  areaName,
  editingObjective,
  formData,
  setFormData,
  onSave,
}) {
  const isEditing = !!editingObjective;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar objetivo' : 'Novo objetivo'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={!formData.title?.trim()} className="gap-1.5">
            <Save size={14} /> {isEditing ? 'Atualizar' : 'Criar objetivo'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col sm:flex-row gap-6 min-h-[200px]">
        <div className="flex justify-center sm:justify-start shrink-0">
          <div className="rounded-xl bg-indigo-50 p-4 flex items-center justify-center border border-indigo-100" aria-hidden>
            <Target size={48} className="text-indigo-600" strokeWidth={1.8} />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-4">
          {areaName && !isEditing && (
            <p className="text-slate-600 text-sm leading-relaxed">
              Área: <strong className="text-slate-800">{areaName}</strong>
            </p>
          )}
          <div>
            <label htmlFor="objective-title" className="block text-sm font-medium text-slate-700 mb-1.5">
              Título
            </label>
            <input
              id="objective-title"
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-colors"
              placeholder="Ex: Implementar programa de discipulado"
            />
          </div>
          <div>
            <label htmlFor="objective-desc" className="block text-sm font-medium text-slate-700 mb-1.5">
              Descrição (opcional)
            </label>
            <textarea
              id="objective-desc"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none transition-colors"
              placeholder="Descreva o que você quer alcançar com este objetivo."
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

import { Folder, Save } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';
import ColorPalette from '../ColorPalette.jsx';
import IconPicker from '../IconPicker.jsx';
import { DEFAULT_COLOR } from '../../constants/colors.js';

export default function AddAreaModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova área (minha)"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={!formData.name?.trim()} className="gap-1.5">
            <Save size={14} /> Criar área
          </Button>
        </>
      }
    >
      <div className="flex flex-col sm:flex-row gap-6 min-h-[200px]">
        <div className="flex justify-center sm:justify-start shrink-0">
          <div className="rounded-xl bg-indigo-50 p-4 flex items-center justify-center border border-indigo-100" aria-hidden>
            <Folder size={48} className="text-indigo-600" strokeWidth={1.8} />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-4">
          <div>
            <label htmlFor="area-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nome
            </label>
            <input
              id="area-name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-colors"
              placeholder="Ex: Juventude, Louvor..."
            />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cor
              </label>
              <ColorPalette value={formData.color || DEFAULT_COLOR} onChange={(color) => setFormData({ ...formData, color })} />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Ícone
              </label>
              <IconPicker selectedIcon={formData.icon || 'Folder'} onSelect={(icon) => setFormData({ ...formData, icon })} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

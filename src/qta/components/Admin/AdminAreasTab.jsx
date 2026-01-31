import { Edit3, Trash2 } from 'lucide-react';
import { ICON_MAP, Tag as TagIcon } from '../../constants/icons.js';
import { DEFAULT_COLOR } from '../../constants/colors.js';
import Button from '../Button.jsx';
import IconPicker from '../IconPicker.jsx';
import ColorPalette from '../ColorPalette.jsx';

export default function AdminAreasTab({
  sortedAreas,
  areaForm,
  onAreaFormChange,
  isEditingArea,
  onCancelEdit,
  onSave,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
      <h2 className="text-base font-bold text-gray-800 mb-4 shrink-0">Áreas padrão do clube (Objetivos Maiores)</h2>
      <form onSubmit={onSave} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 sm:items-end flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="area-name" className="block text-xs font-semibold text-gray-600 mb-1">Nome</label>
            <input
              id="area-name"
              value={areaForm.name}
              onChange={(e) => onAreaFormChange({ ...areaForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Juventude, Louvor..."
              required
            />
          </div>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cor</label>
              <ColorPalette value={areaForm.color} onChange={(color) => onAreaFormChange({ ...areaForm, color })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ícone</label>
              <IconPicker selectedIcon={areaForm.icon} onSelect={(icon) => onAreaFormChange({ ...areaForm, icon })} />
            </div>
          </div>
          <div className="flex gap-2">
            {isEditingArea && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancelar
              </Button>
            )}
            <Button type="submit" size="sm">{isEditingArea ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </div>
      </form>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-2">
          {sortedAreas.map((area) => {
            const IconA = ICON_MAP[area.icon] || TagIcon;
            const color = area.color || DEFAULT_COLOR;
            return (
              <div
                key={area.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <IconA size={18} />
                  </div>
                  <span className="font-medium text-gray-800 truncate">{area.name}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(area)}
                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    title="Editar"
                    aria-label="Editar área"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(area.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Excluir"
                    aria-label="Excluir área"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {sortedAreas.length === 0 && (
            <p className="text-gray-500 italic text-center py-4">Nenhuma área padrão. Crie áreas para os usuários em Objetivos Maiores.</p>
          )}
        </div>
      </div>
    </div>
  );
}

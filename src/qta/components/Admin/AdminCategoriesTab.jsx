import { ChevronDown, ChevronUp, Edit3, Trash2 } from 'lucide-react';
import { ICON_MAP, Tag as TagIcon } from '../../constants/icons.js';
import { DEFAULT_COLOR } from '../../constants/colors.js';
import Button from '../Button.jsx';
import IconPicker from '../IconPicker.jsx';
import ColorPalette from '../ColorPalette.jsx';

export default function AdminCategoriesTab({
  sortedCategories,
  catForm,
  onCatFormChange,
  isEditingCat,
  onCancelEdit,
  onSave,
  onEdit,
  onDelete,
  onMove,
}) {
  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
      <h2 className="text-base font-bold text-gray-800 mb-4 shrink-0">Gerenciar Categorias Globais</h2>
      <form onSubmit={onSave} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 sm:items-end flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="cat-name" className="block text-xs font-semibold text-gray-600 mb-1">Nome</label>
            <input
              id="cat-name"
              value={catForm.name}
              onChange={(e) => onCatFormChange({ ...catForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Eventos, Reuniões..."
              required
            />
          </div>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cor</label>
              <ColorPalette value={catForm.color} onChange={(color) => onCatFormChange({ ...catForm, color })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ícone</label>
              <IconPicker selectedIcon={catForm.icon} onSelect={(icon) => onCatFormChange({ ...catForm, icon })} />
            </div>
          </div>
          <div className="flex gap-2">
            {isEditingCat && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancelar
              </Button>
            )}
            <Button type="submit" size="sm">{isEditingCat ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </div>
      </form>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-2">
          {sortedCategories.map((cat, index) => {
            const Icon = ICON_MAP[cat.icon] || TagIcon;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onMove(cat.id, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none"
                      title="Subir"
                      aria-label="Subir categoria"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(cat.id, 'down')}
                      disabled={index === sortedCategories.length - 1}
                      className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none"
                      title="Descer"
                      aria-label="Descer categoria"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="font-medium text-gray-800 truncate">{cat.name}</span>
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(cat)}
                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    title="Editar"
                    aria-label="Editar categoria"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(cat.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Excluir"
                    aria-label="Excluir categoria"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {sortedCategories.length === 0 && (
            <p className="text-gray-500 italic text-center py-4">Nenhuma categoria do sistema definida.</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Save, Trash2, Edit3 } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';
import IconPicker from '../IconPicker.jsx';
import ColorPalette from '../ColorPalette.jsx';
import { ICON_MAP, Tag as TagIcon } from '../../constants/icons.js';
import { DEFAULT_COLOR } from '../../constants/colors.js';

const DEFAULT_ICON = 'Folder';

export default function CategorySettingsModal({
  isOpen,
  onClose,
  categories,
  onDelete,
  onAdd,
  onUpdate,
}) {
  const [catForm, setCatForm] = useState({ name: '', color: DEFAULT_COLOR, icon: DEFAULT_ICON });
  const [editingCatId, setEditingCatId] = useState(null);

  const sortedCategories = [...(categories || [])].sort((a, b) => {
    if (a.isSystem && b.isSystem) return (a.order ?? 999) - (b.order ?? 999);
    if (a.isSystem) return -1;
    if (b.isSystem) return 1;
    return 0;
  });

  const resetForm = () => {
    setCatForm({ name: '', color: DEFAULT_COLOR, icon: DEFAULT_ICON });
    setEditingCatId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const name = e.target.catName?.value?.trim();
    if (name) {
      await onAdd({ name, color: catForm.color, icon: catForm.icon });
      setCatForm({ name: '', color: DEFAULT_COLOR, icon: DEFAULT_ICON });
      e.target.reset();
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!editingCatId) return;
    await onUpdate(editingCatId, { name: catForm.name, color: catForm.color, icon: catForm.icon });
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Configurar Categorias">
      <div className="space-y-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          Categorias ajudam a organizar suas atividades. As padrão vêm do sistema e não podem ser editadas; você pode adicionar as suas e escolher ícone e cor.
        </p>

        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Categorias existentes</h4>
          <ul className="space-y-2">
            {sortedCategories.map((cat) => {
              const IconC = ICON_MAP[cat.icon] || TagIcon;
              const isEditing = editingCatId === cat.id;
              const isSystem = cat.isSystem;
              return (
                <li
                  key={cat.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <IconC size={20} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 truncate">{cat.name}</span>
                    {isSystem && (
                      <span className="text-[10px] font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md flex-shrink-0">
                        Sistema
                      </span>
                    )}
                  </div>
                  {!isSystem && !isEditing && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setCatForm({
                            name: cat.name,
                            color: cat.color || DEFAULT_COLOR,
                            icon: cat.icon || DEFAULT_ICON,
                          });
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar categoria"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(cat.id)}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {editingCatId && (
          <section className="pt-4 border-t border-gray-200 bg-blue-50/30 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Editar categoria</h4>
            <form onSubmit={handleSubmitUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cor</label>
                  <ColorPalette value={catForm.color} onChange={(color) => setCatForm((f) => ({ ...f, color }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ícone</label>
                  <IconPicker selectedIcon={catForm.icon} onSelect={(icon) => setCatForm((f) => ({ ...f, icon }))} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit"><Save size={16} className="mr-2" /> Atualizar</Button>
                </div>
              </div>
            </form>
          </section>
        )}

        {!editingCatId && (
          <section className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Adicionar nova categoria</h4>
            <form onSubmit={handleSubmitAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome</label>
                <input
                  name="catName"
                  placeholder="Nome da Categoria"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cor</label>
                  <ColorPalette value={catForm.color} onChange={(color) => setCatForm((f) => ({ ...f, color }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ícone</label>
                  <IconPicker selectedIcon={catForm.icon} onSelect={(icon) => setCatForm((f) => ({ ...f, icon }))} />
                </div>
                <Button type="submit">
                  <Plus size={16} className="mr-2" /> Adicionar
                </Button>
              </div>
            </form>
          </section>
        )}
      </div>
    </Modal>
  );
}

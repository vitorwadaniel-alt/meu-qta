import { Edit3, Plus, Save, Trash2 } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';
import ColorPalette from '../ColorPalette.jsx';
import { DEFAULT_COLOR } from '../../constants/colors.js';

export default function TagSettingsModal({
  isOpen,
  onClose,
  tags,
  tagForm,
  setTagForm,
  isEditingTag,
  setIsEditingTag,
  onSave,
  onDelete,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setIsEditingTag(null);
        setTagForm({ name: '', color: DEFAULT_COLOR });
      }}
      title="Configurar Tags"
    >
      <div className="space-y-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          Tags são criadas por si. Escolha nome e cor para organizar e filtrar atividades.
        </p>

        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags existentes</h4>
          <ul className="space-y-2">
            {tags.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
                    style={{ backgroundColor: t.color || DEFAULT_COLOR }}
                  />
                  <span className="text-sm font-semibold text-gray-800">{t.name}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setTagForm({ name: t.name, color: t.color || DEFAULT_COLOR });
                      setIsEditingTag(t.id);
                    }}
                    className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Editar tag"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(t.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {tags.length === 0 && (
            <p className="text-sm text-gray-400 italic py-4 text-center">Nenhuma tag. Crie abaixo.</p>
          )}
        </section>

        <section className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-800 mb-3">{isEditingTag ? 'Editar tag' : 'Criar tag'}</h4>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!tagForm.name) return;
              await onSave({ name: tagForm.name, color: tagForm.color }, isEditingTag);
            }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome</label>
                <input
                  value={tagForm.name}
                  onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  placeholder="Ex: Urgente, Classe A"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cor</label>
                <ColorPalette value={tagForm.color} onChange={(color) => setTagForm({ ...tagForm, color })} />
              </div>
              <div className="flex gap-2">
                {isEditingTag && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingTag(null);
                      setTagForm({ name: '', color: DEFAULT_COLOR });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit">
                  {isEditingTag ? <><Save size={16} className="mr-2" /> Atualizar</> : <><Plus size={16} className="mr-2" /> Criar</>}
                </Button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </Modal>
  );
}

import Modal from '../Modal.jsx';
import Button from '../Button.jsx';

export default function AdminReqFormModal({
  isOpen,
  onClose,
  reqForm,
  chapters,
  onFormChange,
  onSave,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Requisito"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Salvar</Button>
        </>
      }
    >
      <div className="space-y-2">
        <select
          value={reqForm.chapter || chapters[0] || ''}
          onChange={(e) => onFormChange({ ...reqForm, chapter: e.target.value })}
          className="w-full border rounded p-2 text-sm"
          aria-label="Capítulo"
        >
          {chapters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={reqForm.title}
          onChange={(e) => onFormChange({ ...reqForm, title: e.target.value })}
          className="w-full border rounded p-2 text-sm"
          placeholder="Título"
        />
        <textarea
          value={reqForm.description}
          onChange={(e) => onFormChange({ ...reqForm, description: e.target.value })}
          className="w-full border rounded p-2 text-sm"
          rows={2}
          placeholder="Descrição"
        />
      </div>
    </Modal>
  );
}

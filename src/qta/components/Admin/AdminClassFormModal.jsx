import Modal from '../Modal.jsx';
import Button from '../Button.jsx';

export default function AdminClassFormModal({
  isOpen,
  onClose,
  selectedClass,
  classFormName,
  classFormColor,
  currentDeptConfig,
  activeDept,
  onNameChange,
  onColorChange,
  onSave,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedClass ? 'Editar Classe' : 'Nova Classe'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={!selectedClass && !activeDept}>
            Salvar
          </Button>
        </>
      }
    >
      {!selectedClass && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Departamento</label>
          <div className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded border">
            {currentDeptConfig?.name || 'Nenhum selecionado'}
          </div>
          {!activeDept && <p className="text-xs text-red-500 mt-1">Selecione um departamento primeiro</p>}
        </div>
      )}
      <input
        value={classFormName}
        onChange={(e) => onNameChange(e.target.value)}
        className="w-full border rounded p-2 mb-2"
        placeholder="Nome da classe"
      />
      <div className="flex items-center gap-2 mb-4">
        <input
          type="color"
          value={classFormColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-8 w-12 border rounded"
          aria-label="Cor da classe"
        />
        <span className="text-xs text-gray-500">Cor</span>
      </div>
    </Modal>
  );
}

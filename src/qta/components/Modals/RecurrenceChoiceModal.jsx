import Button from '../Button.jsx';
import Modal from '../Modal.jsx';

export default function RecurrenceChoiceModal({
  isOpen,
  onClose,
  choiceType,
  onThisOnly,
  onAllSeries,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={choiceType === 'edit' ? 'Editar Evento Recorrente' : 'Excluir Evento Recorrente'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="secondary" onClick={onThisOnly}>Apenas este evento</Button>
          <Button onClick={onAllSeries}>Toda a série</Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-gray-600">
          {choiceType === 'edit'
            ? 'Este evento faz parte de uma série recorrente. O que deseja editar?'
            : 'Este evento faz parte de uma série recorrente. O que deseja excluir?'}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 font-medium mb-1">Apenas este evento</p>
          <p className="text-xs text-blue-700">
            {choiceType === 'edit'
              ? 'Apenas esta ocorrência será modificada. As outras ocorrências da série permanecerão inalteradas.'
              : 'Apenas esta ocorrência será excluída. As outras ocorrências da série permanecerão.'}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800 font-medium mb-1">Toda a série</p>
          <p className="text-xs text-orange-700">
            {choiceType === 'edit'
              ? 'Todas as ocorrências desta série serão modificadas com as mesmas alterações.'
              : 'Todas as ocorrências desta série serão excluídas.'}
          </p>
        </div>
      </div>
    </Modal>
  );
}

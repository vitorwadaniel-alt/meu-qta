import Button from '../Button.jsx';
import Modal from '../Modal.jsx';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  target,
  deleteScope,
  onConfirm,
}) {
  const isRequirement = target?.isRequirement;
  const isAllSeries = deleteScope === 'all';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRequirement ? 'Desagendar' : 'Confirmar Exclusão'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>
            {isRequirement ? 'Desagendar' : (isAllSeries ? 'Excluir Série Completa' : 'Excluir')}
          </Button>
        </>
      }
    >
      <p className="text-gray-600">
        {isRequirement
          ? 'Requisitos obrigatórios não podem ser excluídos. Deseja remover a data e movê-lo para "Não Alocados"?'
          : isAllSeries
          ? 'Tem certeza que deseja excluir toda a série? Todas as ocorrências serão excluídas.'
          : 'Tem certeza que deseja excluir?'}
      </p>
    </Modal>
  );
}

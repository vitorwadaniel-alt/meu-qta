import Modal from '../Modal.jsx';
import Button from '../Button.jsx';

export default function AdminConfirmModal({ isOpen, onClose, title, message, onConfirm, confirmLabel = 'Excluir' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}

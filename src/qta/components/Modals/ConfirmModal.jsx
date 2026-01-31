import Button from '../Button.jsx';
import Modal from '../Modal.jsx';

export default function ConfirmModal({ isOpen, onClose, title, message, onConfirm, confirmLabel = 'Excluir' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}

import Modal from '../Modal.jsx';

export default function AdminModal({ isOpen, onClose, children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Painel do Super Usuário (Gestão de Currículo)" size="lg">
      <div className="flex flex-col min-h-[400px] h-full">
        {children}
      </div>
    </Modal>
  );
}

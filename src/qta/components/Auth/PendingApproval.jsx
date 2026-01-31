import { Clock, LayoutGrid, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase.js';
import Button from '../Button.jsx';

export default function PendingApproval() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mb-6">
          <Clock className="w-8 h-8" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Cadastro realizado</h1>
        <p className="text-slate-600 mb-6">
          Seu cadastro foi recebido e está <strong>pendente de aprovação</strong>. Este é um sistema em versão beta e apenas usuários autorizados podem acessar.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Quando um administrador aprovar seu acesso, você poderá entrar normalmente no próximo login. Você pode sair e voltar depois para verificar.
        </p>
        <Button variant="outline" className="gap-2" onClick={() => signOut(auth)}>
          <LogOut size={18} /> Sair
        </Button>
      </div>
    </div>
  );
}

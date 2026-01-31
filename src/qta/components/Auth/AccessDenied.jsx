import { ShieldOff, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase.js';
import Button from '../Button.jsx';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-red-700 mb-6">
          <ShieldOff className="w-8 h-8" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesso não autorizado</h1>
        <p className="text-slate-600 mb-6">
          Este é um sistema em versão beta. Seu acesso ainda não foi aprovado ou sua solicitação foi negada.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Nada impede que você faça um novo cadastro e aguarde nova apreciação por um administrador.
        </p>
        <Button variant="outline" className="gap-2" onClick={() => signOut(auth)}>
          <LogOut size={18} /> Sair
        </Button>
      </div>
    </div>
  );
}

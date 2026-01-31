import { Loader2 } from 'lucide-react';
import { QtaProvider, useQta } from './qta/context/QtaContext.jsx';
import { AuthPage, PendingApproval, AccessDenied } from './qta/components/Auth/index.js';
import QtaApp from './qta/QtaApp.jsx';

function AuthGate() {
  const { user, loading, loadingApproval, isApproved, isPending, isAdmin } = useQta();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Carregando…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (loadingApproval) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-3 text-sm text-slate-500">Verificando acesso…</p>
      </div>
    );
  }

  if (!isApproved && !isAdmin) {
    if (isPending) return <PendingApproval />;
    return <AccessDenied />;
  }

  return <QtaApp />;
}

export default function App() {
  return (
    <QtaProvider>
      <AuthGate />
    </QtaProvider>
  );
}

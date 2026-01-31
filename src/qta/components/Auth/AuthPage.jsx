import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white shadow-lg mb-4">
            <LayoutGrid className="w-8 h-8" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MEU QTA</h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === 'login' ? 'Entre para acessar seu calendário' : 'Crie sua conta e comece a planejar'}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          {mode === 'login' ? (
            <Login onSwitchToSignUp={() => setMode('signup')} />
          ) : (
            <SignUp onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}

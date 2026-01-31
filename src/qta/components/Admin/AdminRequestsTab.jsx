import { useState, useMemo } from 'react';
import { Search, UserCheck, UserX, Loader2, Mail, User } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { usePendingUsers } from '../../hooks/usePendingUsers.js';
import { useQta } from '../../context/QtaContext.jsx';
import Button from '../Button.jsx';
import { firebaseApp } from '../../services/firebase.js';

export default function AdminRequestsTab() {
  const { db, appId, showToast, checkDemo } = useQta();
  const pendingUsers = usePendingUsers(db, appId);
  const [searchEmail, setSearchEmail] = useState('');
  const [actioningId, setActioningId] = useState(null);

  const filtered = useMemo(() => {
    if (!searchEmail.trim()) return pendingUsers;
    const lower = searchEmail.trim().toLowerCase();
    return pendingUsers.filter(
      (u) =>
        (u.email && u.email.toLowerCase().includes(lower)) ||
        (u.displayName && u.displayName.toLowerCase().includes(lower))
    );
  }, [pendingUsers, searchEmail]);

  const handleApprove = async (userRow) => {
    if (checkDemo?.()) return;
    const uid = userRow.uid;
    setActioningId(uid);
    try {
      const approvedRef = doc(db, 'artifacts', appId, 'config', 'approved');
      const approvedSnap = await getDoc(approvedRef);
      const currentUids = approvedSnap.exists() ? approvedSnap.data().uids || [] : [];
      if (currentUids.includes(uid)) {
        showToast('Usuário já está aprovado.', 'error');
        setActioningId(null);
        return;
      }
      if (approvedSnap.exists()) {
        await updateDoc(approvedRef, { uids: arrayUnion(uid) });
      } else {
        await setDoc(approvedRef, { uids: [uid] });
      }
      const pendingRef = doc(db, 'artifacts', appId, 'pending_users', uid);
      await deleteDoc(pendingRef);
      showToast('Acesso autorizado. O usuário poderá entrar no próximo login.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao autorizar.', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const handleDeny = async (userRow) => {
    if (checkDemo?.()) return;
    const uid = userRow.uid;
    setActioningId(uid);
    const pendingRef = doc(db, 'artifacts', appId, 'pending_users', uid);
    try {
      const functions = getFunctions(firebaseApp, 'southamerica-east1');
      const denyUserFn = httpsCallable(functions, 'denyUser');
      await denyUserFn({ uid, appId });
      showToast('Solicitação negada. O cadastro foi excluído; o usuário pode se cadastrar novamente.');
    } catch (fnErr) {
      console.warn('Cloud Function denyUser não disponível ou erro:', fnErr);
      try {
        await deleteDoc(pendingRef);
        showToast(
          'Solicitação negada (removido da fila). Para o usuário poder se cadastrar de novo com o mesmo e-mail, faça o deploy da Cloud Function denyUser ou exclua a conta em Authentication no Firebase Console.',
          'error'
        );
      } catch (delErr) {
        showToast('Erro ao negar.', 'error');
      }
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 mb-4">
        <p className="text-sm text-slate-600 mb-3">
          Usuários que se cadastraram e aguardam aprovação para acessar o sistema (versão beta).
        </p>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Buscar por e-mail ou nome..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {pendingUsers.length === 0
              ? 'Nenhuma solicitação pendente.'
              : 'Nenhum resultado para a busca.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-700">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">Data</th>
                <th className="text-right px-4 py-3 font-medium text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    {u.email || '—'}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <User size={14} className="text-slate-400 shrink-0" />
                    {u.displayName || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {u.createdAt
                      ? u.createdAt.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={actioningId !== null}
                        onClick={() => handleApprove(u)}
                      >
                        {actioningId === u.uid ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserCheck size={14} />
                        )}
                        Autorizar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="gap-1.5"
                        disabled={actioningId !== null}
                        onClick={() => handleDeny(u)}
                      >
                        {actioningId === u.uid ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserX size={14} />
                        )}
                        Negar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

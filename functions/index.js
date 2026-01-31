import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore();
const auth = getAuth();

const DEFAULT_APP_ID = 'sistema-qta-web';

/**
 * Callable: nega acesso e exclui o cadastro do usuário (remove do Auth e da fila).
 * Apenas admins podem chamar. O cliente envia { uid, appId? }.
 */
export const denyUser = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Precisa estar logado.');
    }
    const callerUid = request.auth.uid;
    const { uid, appId = DEFAULT_APP_ID } = request.data || {};
    if (!uid || typeof uid !== 'string') {
      throw new HttpsError('invalid-argument', 'uid é obrigatório.');
    }

    const adminsRef = db.doc(`artifacts/${appId}/config/admins`);
    const adminsSnap = await adminsRef.get();
    if (!adminsSnap.exists) {
      throw new HttpsError('permission-denied', 'Configuração de admins não encontrada.');
    }
    const uids = adminsSnap.data().uids || [];
    if (!Array.isArray(uids) || !uids.includes(callerUid)) {
      throw new HttpsError('permission-denied', 'Apenas administradores podem negar solicitações.');
    }

    const pendingRef = db.doc(`artifacts/${appId}/pending_users/${uid}`);
    const pendingSnap = await pendingRef.get();
    if (!pendingSnap.exists) {
      throw new HttpsError('not-found', 'Solicitação não encontrada ou já processada.');
    }

    try {
      await auth.deleteUser(uid);
    } catch (authErr) {
      if (authErr.code === 'auth/user-not-found') {
        // Usuário já foi removido; só removemos o doc pendente
      } else {
        throw new HttpsError('internal', authErr.message || 'Erro ao excluir usuário.');
      }
    }

    await pendingRef.delete();
    return { ok: true };
  }
);

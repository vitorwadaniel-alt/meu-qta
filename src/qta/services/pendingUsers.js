import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from './firebase.js';

/**
 * Registra o usuário na fila de aprovação (pending_users).
 * Chamado após sign-up (e-mail ou Google) para novos usuários.
 */
export async function addPendingUser(user) {
  const ref = doc(db, 'artifacts', appId, 'pending_users', user.uid);
  await setDoc(ref, {
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || null,
    createdAt: serverTimestamp(),
  });
}

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';

/**
 * Lista de usuários pendentes de aprovação (admin).
 * Caminho: artifacts/{appId}/pending_users
 * @param {Object} options - { skip: boolean } - quando true (ex: modo demo), não subscreve
 */
export function usePendingUsers(db, appId, options = {}) {
  const { skip = false } = options;
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    if (!db || !appId || skip) {
      setPendingUsers([]);
      return;
    }
    const q = query(collection(db, 'artifacts', appId, 'pending_users'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            uid: d.id,
            email: data.email || '',
            displayName: data.displayName || '',
            photoURL: data.photoURL || null,
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        });
        setPendingUsers(list);
      },
      (e) => {
        console.error('Error fetching pending users:', e);
        setPendingUsers([]);
      }
    );
    return () => {
      try {
        unsub();
      } catch (_) {
        // Ignora erro de cleanup do Firestore emulador (INTERNAL ASSERTION FAILED)
      }
    };
  }, [db, appId, skip]);

  return pendingUsers;
}

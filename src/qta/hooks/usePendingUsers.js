import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';

/**
 * Lista de usuários pendentes de aprovação (admin).
 * Caminho: artifacts/{appId}/pending_users
 */
export function usePendingUsers(db, appId) {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    if (!db || !appId) {
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
    return () => unsub();
  }, [db, appId]);

  return pendingUsers;
}

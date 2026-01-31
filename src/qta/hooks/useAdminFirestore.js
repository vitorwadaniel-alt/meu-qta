import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query } from 'firebase/firestore';

const BASE_PATH = ['artifacts', null, 'public', 'data'];
const COLLECTION_NAMES = {
  classes: [...BASE_PATH, 'classes'],
  system_categories: [...BASE_PATH, 'system_categories'],
  areas: [...BASE_PATH, 'areas'],
};

/** Caminho base para coleções do admin. Ex: collection(db, ...adminPath(appId, 'classes')) */
export function adminPath(appId, collectionName) {
  const path = ['artifacts', appId, 'public', 'data', collectionName];
  return path;
}

function buildPath(appId, name) {
  const p = COLLECTION_NAMES[name];
  return ['artifacts', appId, ...p.slice(2)];
}

/**
 * Hook que gerencia subscriptions do Firestore para o painel admin.
 * Retorna classes, categorias e áreas, além de um setter para manter
 * selectedClass sincronizado quando os dados forem atualizados.
 */
export function useAdminFirestore(db, appId, setSelectedClass) {
  const [classes, setClasses] = useState([]);
  const [sysCategories, setSysCategories] = useState([]);
  const [sysAreas, setSysAreas] = useState([]);

  useEffect(() => {
    const qClasses = query(
      collection(db, ...buildPath(appId, 'classes'))
    );
    const unsubClasses = onSnapshot(
      qClasses,
      (snapshot) => {
        const loadedClasses = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            chapters: data.chapters || [
              ...new Set((data.requirements || []).map((r) => r.chapter || 'Gerais')),
            ],
          };
        });
        setClasses(loadedClasses);
        setSelectedClass((prev) => {
          if (!prev) return prev;
          const updated = loadedClasses.find((c) => c.id === prev.id);
          return updated || prev;
        });
      },
      (err) => console.error('Admin Classes Error:', err)
    );

    const qCats = query(
      collection(db, ...buildPath(appId, 'system_categories'))
    );
    const unsubCats = onSnapshot(
      qCats,
      (snapshot) => setSysCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Admin Sys Cats Error:', err)
    );

    const qAreas = query(
      collection(db, ...buildPath(appId, 'areas'))
    );
    const unsubAreas = onSnapshot(
      qAreas,
      (snapshot) => setSysAreas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Admin Areas Error:', err)
    );

    return () => {
      unsubClasses();
      unsubCats();
      unsubAreas();
    };
  }, [db, appId, setSelectedClass]);

  return { classes, sysCategories, sysAreas };
}

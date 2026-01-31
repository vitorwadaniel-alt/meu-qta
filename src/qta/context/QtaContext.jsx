import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, doc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db, appId } from '../services/firebase.js';
import { DEFAULT_DEPARTMENTS } from '../constants/departments.js';
import { getAllDemoData } from '../utils/demoData.js';

/** Normaliza um snapshot de eventos para o formato usado no estado. */
function eventsFromSnap(snap) {
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, start: data.start ? data.start.toDate() : null };
  });
}

const QtaContext = createContext(null);

export function QtaProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [approvedUids, setApprovedUids] = useState(null);
  const [pendingExists, setPendingExists] = useState(null);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [curriculumClasses, setCurriculumClasses] = useState([]);
  const [systemAreas, setSystemAreas] = useState([]);
  const [userAreas, setUserAreas] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [toast, setToast] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const demoData = useMemo(() => (isDemoMode ? getAllDemoData() : null), [isDemoMode]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Verifica se o usuário está na lista de admins (Firestore: artifacts/{appId}/config/admins)
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const adminsRef = doc(db, 'artifacts', appId, 'config', 'admins');
    const unsub = onSnapshot(
      adminsRef,
      (snap) => {
        const uids = snap.exists() ? (snap.data().uids || []) : [];
        setIsAdmin(Array.isArray(uids) && uids.includes(user.uid));
      },
      (e) => {
        console.error('Error fetching admins:', e);
        setIsAdmin(false);
      }
    );
    return () => {
      try {
        unsub();
      } catch (_) {
        // Ignora erro de cleanup do Firestore emulador (INTERNAL ASSERTION FAILED)
      }
    };
  }, [user, db, appId]);

  // Beta: lista de aprovados e se o usuário está pendente (pending_users)
  useEffect(() => {
    if (!user) {
      setApprovedUids(null);
      setPendingExists(null);
      return;
    }
    const approvedRef = doc(db, 'artifacts', appId, 'config', 'approved');
    const pendingRef = doc(db, 'artifacts', appId, 'pending_users', user.uid);
    const unsubApproved = onSnapshot(
      approvedRef,
      (snap) => setApprovedUids(snap.exists() ? (snap.data().uids || []) : []),
      (e) => {
        console.error('Error fetching approved:', e);
        setApprovedUids([]);
      }
    );
    const unsubPending = onSnapshot(
      pendingRef,
      (snap) => setPendingExists(snap.exists()),
      (e) => {
        console.error('Error fetching pending:', e);
        setPendingExists(false);
      }
    );
    return () => {
      try {
        unsubApproved();
        unsubPending();
      } catch (_) {
        // Ignora erro de cleanup do Firestore emulador (INTERNAL ASSERTION FAILED)
      }
    };
  }, [user, db, appId]);

  // Dev + emuladores: teste@teste.com é sempre aprovado (não afeta produção nem Firestore)
  const isDevWithEmulators =
    import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true';
  const isApproved = useMemo(() => {
    if (isDevWithEmulators && user?.email === 'teste@teste.com') return true;
    return approvedUids !== null && Array.isArray(approvedUids) && approvedUids.includes(user?.uid);
  }, [approvedUids, user?.uid, user?.email, isDevWithEmulators]);
  const isPending = pendingExists === true;
  const loadingApproval = user && (approvedUids === null || pendingExists === null);

  // Carrega dados do calendário apenas se usuário aprovado ou admin (admin sempre acessa)
  const canLoadUserData = isApproved || isAdmin;

  useEffect(() => {
    if (!user || !canLoadUserData || isDemoMode) return;

    const catQuery = query(collection(db, 'artifacts', appId, 'users', user.uid, 'categories'));
    const unsubCat = onSnapshot(
      catQuery,
      (snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error('Error fetching user categories:', e)
    );

    const sysCatQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'system_categories'));
    const unsubSys = onSnapshot(
      sysCatQuery,
      async (sysSnap) => {
        const publicSysCats = sysSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const userCatSnap = await getDocs(catQuery);
        const userCats = userCatSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const batch = writeBatch(db);
        let hasUpdates = false;
        publicSysCats.forEach((pubCat) => {
          const existing = userCats.find((uc) => uc.systemId === pubCat.id);
          const order = pubCat.order ?? 999;
          if (!existing) {
            batch.set(
              doc(collection(db, 'artifacts', appId, 'users', user.uid, 'categories')),
              { name: pubCat.name, color: pubCat.color, icon: pubCat.icon || 'Tag', isSystem: true, systemId: pubCat.id, order }
            );
            hasUpdates = true;
          } else if (existing.name !== pubCat.name || existing.order !== order) {
            batch.update(
              doc(db, 'artifacts', appId, 'users', user.uid, 'categories', existing.id),
              { name: pubCat.name, order }
            );
            hasUpdates = true;
          }
        });
        if (hasUpdates) await batch.commit();
      },
      (e) => console.error('Error fetching system categories:', e)
    );

    const tagQuery = query(collection(db, 'artifacts', appId, 'users', user.uid, 'tags'));
    const unsubTag = onSnapshot(
      tagQuery,
      (snap) => setTags(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error('Error fetching tags:', e)
    );

    const eventQuery = query(collection(db, 'artifacts', appId, 'users', user.uid, 'events'));
    const unsubEvent = onSnapshot(
      eventQuery,
      (snap) => setEvents(eventsFromSnap(snap)),
      (e) => console.error('Error fetching events:', e)
    );

    const currQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'classes'));
    const unsubCurr = onSnapshot(
      currQuery,
      (snap) => setCurriculumClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error('Error fetching classes:', e)
    );

    const deptQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'departments'));
    const unsubDept = onSnapshot(
      deptQuery,
      (snap) => setDepartments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error('Error fetching departments:', e)
    );

    const systemAreasQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'areas'));
    const unsubSysAreas = onSnapshot(
      systemAreasQuery,
      (snap) => setSystemAreas(snap.docs.map((d) => ({ id: d.id, ...d.data(), isSystem: true }))),
      (e) => console.error('Error fetching system areas:', e)
    );

    const userAreasQuery = query(collection(db, 'artifacts', appId, 'users', user.uid, 'areas'));
    const unsubUserAreas = onSnapshot(
      userAreasQuery,
      (snap) => setUserAreas(snap.docs.map((d) => ({ id: d.id, ...d.data(), isSystem: false }))),
      (e) => console.error('Error fetching user areas:', e)
    );

    const objectivesQuery = query(collection(db, 'artifacts', appId, 'users', user.uid, 'objectives'));
    const unsubObjectives = onSnapshot(
      objectivesQuery,
      (snap) => setObjectives(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.(), updatedAt: d.data().updatedAt?.toDate?.() }))),
      (e) => console.error('Error fetching objectives:', e)
    );

    return () => {
      try {
        unsubCat();
        unsubSys();
        unsubTag();
        unsubEvent();
        unsubCurr();
        unsubDept();
        unsubSysAreas();
        unsubUserAreas();
        unsubObjectives();
      } catch (_) {
        // Ignora erro de cleanup do Firestore emulador (INTERNAL ASSERTION FAILED)
      }
    };
  }, [user, canLoadUserData, isDemoMode]);

  const refetchEvents = useCallback(async () => {
    if (!user || isDemoMode) return;
    try {
      const eventQuery = query(collection(db, 'artifacts', appId, 'users', user.uid, 'events'));
      const snap = await getDocs(eventQuery);
      setEvents(eventsFromSnap(snap));
    } catch (e) {
      console.error('Error refetching events:', e);
    }
  }, [user, appId, db, isDemoMode]);

  const allDepartments = useMemo(() => {
    const firestoreDeptsMap = new Map();
    departments.forEach((dept) => firestoreDeptsMap.set(dept.name, dept));
    const merged = DEFAULT_DEPARTMENTS.map((defaultDept) => {
      const firestoreDept = firestoreDeptsMap.get(defaultDept.name);
      if (firestoreDept) return { ...firestoreDept, order: defaultDept.order };
      return defaultDept;
    });
    departments.forEach((dept) => {
      if (!DEFAULT_DEPARTMENTS.some((d) => d.name === dept.name)) merged.push(dept);
    });
    return [...merged].sort((a, b) => (a.order || 999) - (b.order || 999));
  }, [departments]);

  const allAreas = useMemo(() => {
    const sys = (systemAreas || []).map((a) => ({ ...a, order: a.order ?? 999 }));
    const usr = (userAreas || []).map((a) => ({ ...a, order: a.order ?? 999 + sys.length }));
    return [...sys, ...usr].slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [systemAreas, userAreas]);

  const effectiveData = useMemo(() => {
    if (isDemoMode && demoData) {
      return {
        events: demoData.events,
        categories: demoData.categories,
        tags: demoData.tags,
        departments: demoData.departments,
        curriculumClasses: demoData.curriculumClasses,
        allDepartments: demoData.allDepartments,
        systemAreas: demoData.systemAreas,
        userAreas: demoData.userAreas,
        allAreas: demoData.allAreas,
        objectives: demoData.objectives,
        systemCategories: demoData.systemCategories,
      };
    }
    return {
      events,
      categories,
      tags,
      departments,
      curriculumClasses,
      allDepartments,
      systemAreas,
      userAreas,
      allAreas,
      objectives,
      systemCategories: undefined,
    };
  }, [
    isDemoMode,
    demoData,
    events,
    categories,
    tags,
    departments,
    curriculumClasses,
    allDepartments,
    systemAreas,
    userAreas,
    allAreas,
    objectives,
  ]);

  const value = useMemo(
    () => ({
      user,
      loading,
      loadingApproval,
      isApproved,
      isPending,
      isAdmin,
      isDemoMode,
      setDemoMode: setIsDemoMode,
      ...effectiveData,
      showToast,
      toast,
      setToast,
      appId,
      db,
      refetchEvents,
    }),
    [user, loading, loadingApproval, isApproved, isPending, isAdmin, isDemoMode, effectiveData, showToast, toast, appId, db, refetchEvents]
  );

  return <QtaContext.Provider value={value}>{children}</QtaContext.Provider>;
}

export function useQta() {
  const ctx = useContext(QtaContext);
  if (!ctx) throw new Error('useQta must be used within QtaProvider');
  return ctx;
}

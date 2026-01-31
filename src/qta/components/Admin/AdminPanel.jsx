import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play } from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { DEFAULT_COLOR } from '../../constants/colors.js';
import Button from '../Button.jsx';
import { useQta } from '../../context/QtaContext.jsx';
import { useAdminFirestore, adminPath } from '../../hooks/useAdminFirestore.js';
import AdminTabNav from './AdminTabNav.jsx';
import AdminRequestsTab from './AdminRequestsTab.jsx';
import AdminCategoriesTab from './AdminCategoriesTab.jsx';
import AdminAreasTab from './AdminAreasTab.jsx';
import AdminClassesTab from './AdminClassesTab.jsx';
import AdminClassFormModal from './AdminClassFormModal.jsx';
import AdminReqFormModal from './AdminReqFormModal.jsx';
import AdminConfirmModal from './AdminConfirmModal.jsx';

export default function AdminPanel() {
  const { showToast, allDepartments, db, appId, isDemoMode, setDemoMode, curriculumClasses, systemAreas, systemCategories } = useQta();

  const [activeTab, setActiveTab] = useState('requests');
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeDept, setActiveDept] = useState(allDepartments[0]?.id || '');

  const { classes, sysCategories, sysAreas } = useAdminFirestore(db, appId, setSelectedClass, { skip: isDemoMode });

  const [isEditingClass, setIsEditingClass] = useState(false);
  const [classFormName, setClassFormName] = useState('');
  const [classFormColor, setClassFormColor] = useState('#3b82f6');

  const [isEditingReq, setIsEditingReq] = useState(false);
  const [reqForm, setReqForm] = useState({ title: '', chapter: '', description: '' });
  const [editingReqIndex, setEditingReqIndex] = useState(-1);

  const [newChapterName, setNewChapterName] = useState('');

  const [catForm, setCatForm] = useState({ name: '', color: DEFAULT_COLOR, icon: 'Folder' });
  const [isEditingCat, setIsEditingCat] = useState(null);

  const [areaForm, setAreaForm] = useState({ name: '', color: DEFAULT_COLOR, icon: 'Folder', order: 0 });
  const [isEditingArea, setIsEditingArea] = useState(null);

  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    if (!activeDept && allDepartments.length > 0) setActiveDept(allDepartments[0].id);
  }, [allDepartments, activeDept]);

  const effectiveClasses = isDemoMode ? curriculumClasses || [] : classes;
  const effectiveSysCategories = isDemoMode ? systemCategories || [] : sysCategories;
  const effectiveSysAreas = isDemoMode ? systemAreas || [] : sysAreas;

  const sortedSysCategories = useMemo(() =>
    [...effectiveSysCategories].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [effectiveSysCategories]
  );
  const sortedSysAreas = useMemo(() =>
    [...effectiveSysAreas].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [effectiveSysAreas]
  );

  const filteredClasses = effectiveClasses
    .filter((c) => !activeDept || c.department === activeDept)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentDeptConfig = allDepartments.find((d) => d.id === activeDept);

  const checkDemo = useCallback(() => {
    if (isDemoMode) {
      showToast('Modo DEMO: alterações não são salvas no banco.', 'error');
      return true;
    }
    return false;
  }, [isDemoMode, showToast]);

  const handleSaveCategory = useCallback(async (e) => {
    e.preventDefault();
    if (!catForm.name) return;
    if (checkDemo()) return;
    try {
      const sorted = [...effectiveSysCategories].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      const maxOrder = sorted.length ? Math.max(...sorted.map((c, i) => c.order ?? i)) : -1;
      if (isEditingCat) {
        await updateDoc(doc(db, ...adminPath(appId, 'system_categories'), isEditingCat), {
          name: catForm.name,
          color: catForm.color,
          icon: catForm.icon,
        });
        showToast('Categoria atualizada!');
        setIsEditingCat(null);
      } else {
        await addDoc(collection(db, ...adminPath(appId, 'system_categories')), {
          name: catForm.name,
          color: catForm.color,
          icon: catForm.icon,
          order: maxOrder + 1,
        });
        showToast('Categoria criada!');
      }
      setCatForm({ name: '', color: DEFAULT_COLOR, icon: 'Folder' });
    } catch (err) {
      showToast('Erro ao salvar categoria.', 'error');
    }
  }, [catForm, isEditingCat, effectiveSysCategories, checkDemo, showToast, db, appId]);

  const handleDeleteCategory = useCallback(async (id) => {
    if (checkDemo()) return;
    setConfirmModal({
      title: 'Excluir categoria',
      message: 'Excluir esta categoria do sistema? Isso não afetará dados antigos dos usuários, mas a removerá para novos.',
      onConfirm: async () => {
        await deleteDoc(doc(db, ...adminPath(appId, 'system_categories'), id));
        setConfirmModal(null);
      },
    });
  }, [checkDemo, db, appId]);

  const handleEditCategory = useCallback((cat) => {
    setCatForm({ name: cat.name, color: cat.color || DEFAULT_COLOR, icon: cat.icon || 'Folder' });
    setIsEditingCat(cat.id);
  }, []);

  const handleMoveCategory = useCallback(async (id, direction) => {
    if (checkDemo()) return;
    const idx = sortedSysCategories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= sortedSysCategories.length) return;
    const curr = sortedSysCategories[idx];
    const next = sortedSysCategories[nextIdx];
    const currOrder = curr.order ?? idx;
    const nextOrder = next.order ?? nextIdx;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, ...adminPath(appId, 'system_categories'), curr.id), { order: nextOrder });
      batch.update(doc(db, ...adminPath(appId, 'system_categories'), next.id), { order: currOrder });
      await batch.commit();
      showToast('Ordem atualizada.');
    } catch (err) {
      showToast('Erro ao reordenar.', 'error');
    }
  }, [sortedSysCategories, checkDemo, showToast, db, appId]);

  const handleSaveArea = useCallback(async (e) => {
    e?.preventDefault();
    if (!areaForm.name?.trim()) return;
    if (checkDemo()) return;
    try {
      if (isEditingArea) {
        await updateDoc(doc(db, ...adminPath(appId, 'areas'), isEditingArea), {
          name: areaForm.name.trim(),
          color: areaForm.color || DEFAULT_COLOR,
          icon: areaForm.icon || 'Folder',
          order: areaForm.order ?? 0,
        });
        showToast('Área atualizada!');
        setIsEditingArea(null);
      } else {
        await addDoc(collection(db, ...adminPath(appId, 'areas')), {
          name: areaForm.name.trim(),
          color: areaForm.color || DEFAULT_COLOR,
          icon: areaForm.icon || 'Folder',
          order: areaForm.order ?? effectiveSysAreas.length,
        });
        showToast('Área criada!');
      }
      setAreaForm({ name: '', color: DEFAULT_COLOR, icon: 'Folder', order: effectiveSysAreas.length });
    } catch (err) {
      showToast('Erro ao salvar área.', 'error');
    }
  }, [areaForm, isEditingArea, effectiveSysAreas, checkDemo, showToast, db, appId]);

  const handleDeleteArea = useCallback(async (id) => {
    if (checkDemo()) return;
    setConfirmModal({
      title: 'Excluir área',
      message: 'Excluir esta área do clube? Os objetivos dos usuários nesta área não serão excluídos, mas a área deixará de aparecer como padrão.',
      onConfirm: async () => {
        await deleteDoc(doc(db, ...adminPath(appId, 'areas'), id));
        showToast('Área removida.');
        setConfirmModal(null);
      },
    });
  }, [checkDemo, showToast, db, appId]);

  const handleEditArea = useCallback((a) => {
    setAreaForm({ name: a.name, color: a.color || DEFAULT_COLOR, icon: a.icon || 'Folder', order: a.order ?? 0 });
    setIsEditingArea(a.id);
  }, []);

  const handleSaveClass = useCallback(async () => {
    if (checkDemo()) return;
    if (!classFormName) return;
    if (!selectedClass && !activeDept) {
      showToast('Selecione um departamento para criar a classe.', 'error');
      return;
    }
    try {
      if (selectedClass) {
        await updateDoc(doc(db, ...adminPath(appId, 'classes'), selectedClass.id), {
          name: classFormName,
          color: classFormColor,
        });
      } else {
        const deptClasses = effectiveClasses.filter((c) => c.department === activeDept);
        const maxOrder = deptClasses.reduce((max, c) => Math.max(max, c.order || 0), -1);
        await addDoc(collection(db, ...adminPath(appId, 'classes')), {
          name: classFormName,
          department: activeDept,
          color: classFormColor,
          order: maxOrder + 1,
          requirements: [],
          chapters: ['Gerais'],
        });
      }
      setIsEditingClass(false);
      setClassFormName('');
      showToast('Classe salva!');
    } catch (e) {
      showToast('Erro', 'error');
    }
  }, [classFormName, classFormColor, selectedClass, activeDept, effectiveClasses, checkDemo, showToast, db, appId]);

  const handleDeleteClass = useCallback(async (id) => {
    if (checkDemo()) return;
    setConfirmModal({
      title: 'Excluir classe',
      message: 'Tem certeza que deseja excluir esta classe?',
      onConfirm: async () => {
        await deleteDoc(doc(db, ...adminPath(appId, 'classes'), id));
        setSelectedClass(null);
        setConfirmModal(null);
      },
    });
  }, [checkDemo, db, appId]);

  const handleAddChapter = useCallback(async () => {
    if (checkDemo()) return;
    if (!newChapterName || !selectedClass) return;
    await updateDoc(doc(db, ...adminPath(appId, 'classes'), selectedClass.id), {
      chapters: [...(selectedClass.chapters || []), newChapterName],
    });
    setNewChapterName('');
  }, [newChapterName, selectedClass, checkDemo, db, appId]);

  const handleDeleteChapter = useCallback(async (chap) => {
    if (checkDemo()) return;
    setConfirmModal({
      title: 'Excluir capítulo',
      message: 'Excluir este capítulo?',
      onConfirm: async () => {
        await updateDoc(doc(db, ...adminPath(appId, 'classes'), selectedClass.id), {
          chapters: selectedClass.chapters.filter((c) => c !== chap),
        });
        setConfirmModal(null);
      },
    });
  }, [selectedClass, checkDemo, db, appId]);

  const handleSaveReq = useCallback(async () => {
    if (checkDemo()) return;
    if (!reqForm.title || !selectedClass) return;
    const newReqs = [...(selectedClass.requirements || [])];
    const reqData = {
      ...reqForm,
      chapter: reqForm.chapter || selectedClass.chapters[0] || 'Gerais',
      isRequirement: true,
    };
    if (editingReqIndex >= 0) newReqs[editingReqIndex] = reqData;
    else newReqs.push(reqData);
    await updateDoc(doc(db, ...adminPath(appId, 'classes'), selectedClass.id), { requirements: newReqs });
    setIsEditingReq(false);
    setReqForm({ title: '', chapter: '', description: '' });
    setEditingReqIndex(-1);
  }, [reqForm, selectedClass, editingReqIndex, checkDemo, db, appId]);

  const handleDeleteReq = useCallback(async (idx) => {
    if (checkDemo()) return;
    setConfirmModal({
      title: 'Excluir requisito',
      message: 'Excluir este requisito?',
      onConfirm: async () => {
        const newReqs = selectedClass.requirements.filter((_, i) => i !== idx);
        await updateDoc(doc(db, ...adminPath(appId, 'classes'), selectedClass.id), { requirements: newReqs });
        setConfirmModal(null);
      },
    });
  }, [selectedClass, checkDemo, db, appId]);

  const handleAddClass = useCallback(() => {
    if (!activeDept) {
      showToast('Selecione um departamento primeiro.', 'error');
      return;
    }
    setSelectedClass(null);
    setClassFormName('');
    setClassFormColor('#3b82f6');
    setIsEditingClass(true);
  }, [activeDept, showToast]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl mb-4 shrink-0 ${isDemoMode ? 'bg-amber-100 border border-amber-300' : 'bg-slate-100 border border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <Play size={18} className={isDemoMode ? 'text-amber-600' : 'text-slate-500'} aria-hidden />
          <span className={`font-medium ${isDemoMode ? 'text-amber-800' : 'text-slate-700'}`}>
            {isDemoMode ? 'Modo DEMO ativo – dados fictícios para testes' : 'Simular ambiente com dados de demonstração'}
          </span>
        </div>
        <Button
          variant={isDemoMode ? 'danger' : 'secondary'}
          size="sm"
          onClick={() => {
            setDemoMode(!isDemoMode);
            showToast(isDemoMode ? 'Modo normal restaurado.' : 'Modo DEMO ativado – dados fictícios carregados.');
          }}
        >
          {isDemoMode ? 'Desativar DEMO' : 'Ativar DEMO'}
        </Button>
      </div>

      <div className="flex h-full gap-6 min-h-0 flex-1 overflow-hidden">
        <AdminTabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'requests' && <AdminRequestsTab />}
          {activeTab === 'categories' && (
            <AdminCategoriesTab
              sortedCategories={sortedSysCategories}
              catForm={catForm}
              onCatFormChange={setCatForm}
              isEditingCat={isEditingCat}
              onCancelEdit={() => {
                setIsEditingCat(null);
                setCatForm({ name: '', color: DEFAULT_COLOR, icon: 'Folder' });
              }}
              onSave={handleSaveCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onMove={handleMoveCategory}
            />
          )}

          {activeTab === 'areas' && (
            <AdminAreasTab
              sortedAreas={sortedSysAreas}
              areaForm={areaForm}
              onAreaFormChange={setAreaForm}
              isEditingArea={isEditingArea}
              onCancelEdit={() => {
                setIsEditingArea(null);
                setAreaForm({ name: '', color: DEFAULT_COLOR, icon: 'Folder', order: effectiveSysAreas.length });
              }}
              onSave={handleSaveArea}
              onEdit={handleEditArea}
              onDelete={handleDeleteArea}
            />
          )}

          {activeTab === 'classes' && (
            <AdminClassesTab
              allDepartments={allDepartments}
              activeDept={activeDept}
              currentDeptConfig={currentDeptConfig}
              filteredClasses={filteredClasses}
              selectedClass={selectedClass}
              newChapterName={newChapterName}
              onDeptSelect={(deptId) => {
                setActiveDept(deptId);
                setSelectedClass(null);
              }}
              onAddClass={handleAddClass}
              onClassSelect={setSelectedClass}
              onEditClass={(cls) => {
                setClassFormName(cls.name);
                setClassFormColor(cls.color);
                setIsEditingClass(true);
              }}
              onDeleteClass={handleDeleteClass}
              onChapterAdd={handleAddChapter}
              onChapterDelete={handleDeleteChapter}
              onChapterNameChange={setNewChapterName}
              onReqAdd={() => {
                setReqForm({ title: '', chapter: '', description: '' });
                setEditingReqIndex(-1);
                setIsEditingReq(true);
              }}
              onReqEdit={(r, i) => {
                setReqForm(r);
                setEditingReqIndex(i);
                setIsEditingReq(true);
              }}
              onReqDelete={handleDeleteReq}
            />
          )}
        </div>
      </div>

      <AdminClassFormModal
        isOpen={isEditingClass}
        onClose={() => setIsEditingClass(false)}
        selectedClass={selectedClass}
        classFormName={classFormName}
        classFormColor={classFormColor}
        currentDeptConfig={currentDeptConfig}
        activeDept={activeDept}
        onNameChange={setClassFormName}
        onColorChange={setClassFormColor}
        onSave={handleSaveClass}
      />

      <AdminReqFormModal
        isOpen={isEditingReq}
        onClose={() => {
          setIsEditingReq(false);
          setReqForm({ title: '', chapter: '', description: '' });
          setEditingReqIndex(-1);
        }}
        reqForm={reqForm}
        chapters={selectedClass?.chapters || ['Gerais']}
        onFormChange={setReqForm}
        onSave={handleSaveReq}
      />

      {confirmModal && (
        <AdminConfirmModal
          isOpen
          onClose={() => setConfirmModal(null)}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
        />
      )}
    </div>
  );
}

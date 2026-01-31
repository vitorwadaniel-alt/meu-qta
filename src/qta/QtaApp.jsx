import { lazy, Suspense, useState, useEffect } from 'react';
import { BookOpen, Loader2, Menu, Printer, Shield, Target, Undo2, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { collection, doc, addDoc, deleteDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth } from './services/firebase.js';
import { formatDate, generateRecurrenceDates } from './utils/dateUtils.js';
import { VIEW_MODES, CALENDAR_VIEWS } from './constants/viewModes.js';
import { useQta } from './context/QtaContext.jsx';
import { useFilteredEvents } from './hooks/useFilteredEvents.js';
import Button from './components/Button.jsx';
import Toast from './components/Toast.jsx';
import Sidebar from './components/Sidebar.jsx';
import SearchBar from './components/SearchBar.jsx';
import MainContent from './components/MainContent.jsx';
import {
  EventModal,
  ViewEventModal,
  RecurrenceChoiceModal,
  DeleteConfirmModal,
  CategorySettingsModal,
  TagSettingsModal,
  AdminModal,
  ObjectiveFormModal,
  AddAreaModal,
  LinkToObjectiveModal,
  ModuleActivationModal,
  ModuleDeactivationModal,
} from './components/Modals/index.js';
import ObjectivesPage from './components/Objectives/ObjectivesPage.jsx';
import ClassManagerPage from './components/ClassManager/ClassManagerPage.jsx';
import PrintPage from './components/Print/PrintPage.jsx';

const AdminPanel = lazy(() => import('./components/Admin/AdminPanel.jsx'));

export default function QtaApp() {
  const {
    user,
    loading,
    events,
    categories,
    tags,
    curriculumClasses,
    allDepartments,
    allAreas,
    objectives,
    showToast,
    toast,
    setToast,
    db,
    appId,
    isDemoMode,
    refetchEvents,
  } = useQta();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(VIEW_MODES.CALENDAR);
  const [calendarView, setCalendarView] = useState(CALENDAR_VIEWS.MONTH);
  const [pageFilter, setPageFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterCategoryIds, setSearchFilterCategoryIds] = useState([]);
  const [searchFilterTagIds, setSearchFilterTagIds] = useState([]);
  const [searchFilterDepartmentIds, setSearchFilterDepartmentIds] = useState([]);
  const [searchFilterClassIds, setSearchFilterClassIds] = useState([]);
  const [searchFilterOpen, setSearchFilterOpen] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCategorySettingsOpen, setIsCategorySettingsOpen] = useState(false);
  const [isTagSettingsOpen, setIsTagSettingsOpen] = useState(false);
  const [tagForm, setTagForm] = useState({ name: '', color: '#6366f1' });
  const [isEditingTag, setIsEditingTag] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showRestoreMenu, setShowRestoreMenu] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [recurrenceChoiceOpen, setRecurrenceChoiceOpen] = useState(false);
  const [recurrenceChoiceType, setRecurrenceChoiceType] = useState(null);
  const [recurrenceChoiceCallback, setRecurrenceChoiceCallback] = useState(null);
  const [editRecurrenceScope, setEditRecurrenceScope] = useState(null);
  const [deleteRecurrenceScope, setDeleteRecurrenceScope] = useState(null);
  const [isObjectiveFormOpen, setIsObjectiveFormOpen] = useState(false);
  const [objectiveFormData, setObjectiveFormData] = useState({ title: '', description: '' });
  const [editingObjective, setEditingObjective] = useState(null);
  const [objectiveAreaId, setObjectiveAreaId] = useState(null);
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  const [areaFormData, setAreaFormData] = useState({ name: '', color: '#6366f1', icon: 'Folder' });
  const [linkToObjectiveId, setLinkToObjectiveId] = useState(null);
  const [isLinkToObjectiveOpen, setIsLinkToObjectiveOpen] = useState(false);

  const storageKeyObjectives = `qta_glow_objectives_${appId || 'default'}`;
  const storageKeyClassManager = `qta_glow_classmanager_${appId || 'default'}`;
  const [objectivesGlowActive, setObjectivesGlowActive] = useState(false);
  const [classManagerGlowActive, setClassManagerGlowActive] = useState(false);
  const [activationModalModule, setActivationModalModule] = useState(null);
  const [deactivationModalModule, setDeactivationModalModule] = useState(null);

  useEffect(() => {
    if (!appId) return;
    const keyObj = `qta_glow_objectives_${appId}`;
    const keyCls = `qta_glow_classmanager_${appId}`;
    try {
      setObjectivesGlowActive(JSON.parse(localStorage.getItem(keyObj) || 'false'));
      setClassManagerGlowActive(JSON.parse(localStorage.getItem(keyCls) || 'false'));
    } catch (_) {}
  }, [appId]);

  const setObjectivesGlow = (value) => {
    setObjectivesGlowActive(value);
    try { localStorage.setItem(storageKeyObjectives, JSON.stringify(value)); } catch (_) {}
  };
  const setClassManagerGlow = (value) => {
    setClassManagerGlowActive(value);
    try { localStorage.setItem(storageKeyClassManager, JSON.stringify(value)); } catch (_) {}
  };

  const {
    filteredEvents,
    counters,
    alreadyImportedClassNames,
    lockedPageFilterId,
    lockedPageFilterType,
  } = useFilteredEvents({
    events,
    viewMode,
    pageFilter,
    searchQuery,
    searchFilterCategoryIds,
    searchFilterTagIds,
    searchFilterDepartmentIds,
    searchFilterClassIds,
    curriculumClasses,
  });

  const getCategory = (id) =>
    categories.find((c) => c.id === id) || { name: 'Geral', color: '#9ca3af', icon: 'Tag' };
  const getTag = (id) => tags.find((t) => t.id === id) || null;

  const openViewModal = (event) => {
    setViewingEvent(event);
    setShowRestoreMenu(false);
    setIsViewModalOpen(true);
  };

  const openEventModal = (event = null, dateOverride = null, objectiveId = null) => {
    const defaultCatId = categories.length > 0 ? categories[0].id : '';
    if (event) {
      // Se o evento faz parte de uma série recorrente, perguntar se quer editar apenas este ou toda a série
      if (event.recurrenceGroupId) {
        setEditingEvent(event);
        setRecurrenceChoiceType('edit');
        setRecurrenceChoiceCallback(() => () => {
          const startDay = event.start ? event.start.getDay() : new Date().getDay();
          setFormData({ 
            title: event.title, 
            description: event.description || '', 
            observation: event.observation || '',
            categoryId: event.categoryId || defaultCatId, 
            tagIds: event.tagIds || [], 
            date: event.start ? formatDate(event.start) : '', 
            time: event.start ? event.start.toTimeString().slice(0, 5) : '', 
            isUnallocated: !event.start, 
            recurrence: 'none',
            recurrenceInterval: 1, 
            recurrenceEnd: 'never', 
            recurrenceEndDate: '', 
            recurrenceEndCount: 10, 
            recurrenceWeekdays: [startDay], 
            isRequirement: event.isRequirement || false 
          });
          setIsEventModalOpen(true);
        });
        setRecurrenceChoiceOpen(true);
        return;
      }
      
      setEditingEvent(event);
      const startDay = event.start ? event.start.getDay() : new Date().getDay();
      setFormData({ 
        title: event.title, 
        description: event.description || '', 
        observation: event.observation || '',
        categoryId: event.categoryId || defaultCatId, 
        tagIds: event.tagIds || [], 
        date: event.start ? formatDate(event.start) : '', 
        time: event.start ? event.start.toTimeString().slice(0, 5) : '', 
        isUnallocated: !event.start, 
        recurrence: 'none',
        recurrenceInterval: 1, 
        recurrenceEnd: 'never', 
        recurrenceEndDate: '', 
        recurrenceEndCount: 10, 
        recurrenceWeekdays: [startDay], 
        isRequirement: event.isRequirement || false 
      });
    } else {
      setEditingEvent(null);
      setEditRecurrenceScope(null);
      const startD = dateOverride || new Date();
      const defaultUnallocated = !dateOverride && viewMode === VIEW_MODES.UNALLOCATED;
      setFormData({
        title: '',
        description: '',
        observation: '',
        categoryId: defaultCatId,
        tagIds: [],
        date: formatDate(startD),
        time: '09:00',
        isUnallocated: defaultUnallocated,
        recurrence: 'none',
        recurrenceInterval: 1,
        recurrenceEnd: 'never',
        recurrenceEndDate: '',
        recurrenceEndCount: 10,
        recurrenceWeekdays: [startD.getDay()],
        isRequirement: false,
        objectiveId: objectiveId ?? undefined,
      });
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user) { showToast('Utilizador não autenticado. Tente recarregar a página.', 'error'); return; }
    if (!formData.title) return showToast('Título obrigatório', 'error');
    const defaultCatId = categories.length > 0 ? categories[0].id : 'uncategorized';
    const finalCategoryId = formData.categoryId || defaultCatId;
    let startDate = null;
    if (!formData.isUnallocated && formData.date) startDate = new Date(`${formData.date}T${formData.time || '00:00'}`);

    const baseEvent = { title: formData.title, description: formData.description || '', observation: formData.observation ?? '', categoryId: finalCategoryId, tagIds: formData.tagIds || [], isRequirement: formData.isRequirement || false, updatedAt: serverTimestamp(), type: 'event', deletedAt: null };
    if (editingEvent?.isRequirement) { baseEvent.chapter = editingEvent.chapter || 'Gerais'; baseEvent.originClassName = editingEvent.originClassName || 'Classe'; baseEvent.color = editingEvent.color || '#10b981'; }
    if (formData.objectiveId) baseEvent.objectiveId = formData.objectiveId;
    if (editingEvent?.objectiveId) baseEvent.objectiveId = editingEvent.objectiveId;

    try {
      const batch = writeBatch(db);
      if (editingEvent) {
        // Verificar se está editando um evento que faz parte de uma série recorrente
        const isRecurringEvent = editingEvent.recurrenceGroupId && editRecurrenceScope === 'all';
        
        if (isRecurringEvent) {
          // Editar toda a série: atualizar todos os eventos do grupo
          const seriesEvents = events.filter(e => e.recurrenceGroupId === editingEvent.recurrenceGroupId);
          seriesEvents.forEach(ev => {
            // Manter a data original de cada evento, apenas atualizar os outros campos
            batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', ev.id), {
              ...baseEvent,
              start: ev.start, // Manter a data original
              recurrenceGroupId: ev.recurrenceGroupId,
              recurrenceIndex: ev.recurrenceIndex
            });
          });
        } else if (formData.recurrence !== 'none' && !formData.isUnallocated && startDate) {
          // Se configurou recorrência na edição, criar novo grupo de recorrência
          const groupId = crypto.randomUUID();
          const dates = generateRecurrenceDates(startDate, {
            freq: formData.recurrence,
            interval: formData.recurrenceInterval || 1,
            endType: formData.recurrenceEnd || 'never',
            endDate: formData.recurrenceEndDate || null,
            endCount: formData.recurrenceEndCount || 10,
            weekdays: formData.recurrenceWeekdays
          });
          // Se estava em um grupo antigo, remover dele primeiro
          if (editingEvent.recurrenceGroupId && editRecurrenceScope === 'this') {
            // Remover do grupo antigo (já será feito ao atualizar)
          }
          // Atualizar o evento atual e criar as novas ocorrências
          batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', editingEvent.id), { 
            ...baseEvent, 
            start: dates[0], 
            recurrenceGroupId: groupId, 
            recurrenceIndex: 0 
          });
          // Criar as demais ocorrências
          dates.slice(1).forEach((d, i) => {
            batch.set(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'events')), { 
              ...baseEvent, 
              start: d, 
              recurrenceGroupId: groupId, 
              recurrenceIndex: i + 1, 
              createdAt: serverTimestamp() 
            });
          });
        } else {
          // Editar apenas este evento (ou evento sem recorrência)
          const updateData = { ...baseEvent, start: startDate };
          // Se tinha recurrenceGroupId e está editando apenas este, remover do grupo
          if (editingEvent.recurrenceGroupId && editRecurrenceScope === 'this') {
            updateData.recurrenceGroupId = null;
            updateData.recurrenceIndex = null;
          }
          batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', editingEvent.id), updateData);
        }
      } else {
        if (formData.recurrence !== 'none' && !formData.isUnallocated) {
          const groupId = crypto.randomUUID();
          const dates = generateRecurrenceDates(startDate, {
            freq: formData.recurrence,
            interval: formData.recurrenceInterval || 1,
            endType: formData.recurrenceEnd || 'never',
            endDate: formData.recurrenceEndDate || null,
            endCount: formData.recurrenceEndCount || 10,
            weekdays: formData.recurrenceWeekdays
          });
          dates.forEach((d, i) => {
            batch.set(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'events')), { ...baseEvent, start: d, recurrenceGroupId: groupId, recurrenceIndex: i, createdAt: serverTimestamp() });
          });
        } else {
          batch.set(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'events')), { ...baseEvent, start: startDate, createdAt: serverTimestamp() });
        }
      }
      await batch.commit();
      setIsEventModalOpen(false);
      setEditRecurrenceScope(null);
      showToast(editingEvent ? 'Atividade atualizada!' : 'Atividade criada!');
    } catch (e) { console.error('Erro ao salvar:', e); showToast('Erro ao salvar. Verifique a consola.', 'error'); }
  };

  const handleDeleteRequest = (event) => {
    if (event.isRequirement && !event.start && event.type !== 'trash') { showToast('Requisitos obrigatórios não podem ser excluídos.', 'error'); return; }
    
    // Se o evento faz parte de uma série recorrente, perguntar se quer excluir apenas este ou toda a série
    if (event.recurrenceGroupId) {
      setDeleteTarget(event);
      setRecurrenceChoiceType('delete');
      setRecurrenceChoiceCallback(() => () => {
        setIsDeleteConfirmOpen(true);
      });
      setRecurrenceChoiceOpen(true);
      return;
    }
    
    setDeleteTarget(event);
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user) return;
    const batch = writeBatch(db);
    
    // Verificar se está excluindo uma série recorrente
    const isRecurringEvent = deleteTarget.recurrenceGroupId && deleteRecurrenceScope === 'all';
    
    if (isRecurringEvent) {
      // Excluir toda a série: excluir todos os eventos do grupo
      const seriesEvents = events.filter(e => e.recurrenceGroupId === deleteTarget.recurrenceGroupId);
      seriesEvents.forEach(ev => {
        if (ev.isRequirement && ev.type !== 'trash') {
          batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', ev.id), { start: null });
        } else if (ev.type === 'trash') {
          batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'events', ev.id));
        } else {
          batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', ev.id), { type: 'trash', deletedAt: serverTimestamp() });
        }
      });
      showToast(`Série completa excluída (${seriesEvents.length} evento(s)).`);
    } else {
      // Excluir apenas este evento
      if (deleteTarget.isRequirement && deleteTarget.type !== 'trash') { 
        batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', deleteTarget.id), { start: null }); 
        showToast('Desagendado'); 
      }
      else if (deleteTarget.type === 'trash') { 
        batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'events', deleteTarget.id)); 
        showToast('Excluído permanentemente.'); 
      }
      else { 
        batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', deleteTarget.id), { type: 'trash', deletedAt: serverTimestamp() }); 
        showToast('Movido para a lixeira.'); 
      }
    }
    
    await batch.commit();
    setIsDeleteConfirmOpen(false);
    setDeleteRecurrenceScope(null);
  };

  const executeRestore = async (mode, event) => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'events', event.id);
      if (mode === 'original') batch.update(ref, { type: 'event', deletedAt: null });
      else if (mode === 'unallocated') batch.update(ref, { type: 'event', deletedAt: null, start: null });
      await batch.commit();
      setIsViewModalOpen(false);
      setShowRestoreMenu(false);
      showToast(mode === 'original' ? 'Restaurado para a data original.' : 'Restaurado para "Não Alocados".');
    } catch (e) { showToast('Erro ao restaurar', 'error'); }
  };

  const handleRemoveEventFromObjective = async (event) => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'events', event.id), { objectiveId: null, updatedAt: serverTimestamp() });
      showToast('Desvinculado do objetivo.');
    } catch (e) {
      showToast('Erro ao desvincular.', 'error');
    }
  };

  const handleLinkToObjective = async (selectedEventIds) => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user || !linkToObjectiveId || !selectedEventIds?.length) return;
    try {
      const batch = writeBatch(db);
      selectedEventIds.forEach((eventId) => {
        batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', eventId), {
          objectiveId: linkToObjectiveId,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      showToast(`${selectedEventIds.length} item(ns) vinculado(s) ao objetivo.`);
    } catch (e) {
      showToast('Erro ao vincular.', 'error');
    }
  };

  const handleAddObjective = (areaId) => {
    setObjectiveAreaId(areaId);
    setEditingObjective(null);
    setObjectiveFormData({ title: '', description: '' });
    setIsObjectiveFormOpen(true);
  };

  const handleSaveObjective = async () => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user || !objectiveFormData.title?.trim()) return;
    try {
      if (editingObjective) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'objectives', editingObjective.id), {
          title: objectiveFormData.title.trim(),
          description: objectiveFormData.description?.trim() || '',
          updatedAt: serverTimestamp(),
        });
        showToast('Objetivo atualizado!');
      } else {
        if (!objectiveAreaId) { showToast('Selecione uma área.', 'error'); return; }
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'objectives'), {
          areaId: objectiveAreaId,
          title: objectiveFormData.title.trim(),
          description: objectiveFormData.description?.trim() || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('Objetivo criado!');
      }
      setIsObjectiveFormOpen(false);
      setObjectiveFormData({ title: '', description: '' });
      setEditingObjective(null);
      setObjectiveAreaId(null);
    } catch (e) {
      showToast('Erro ao salvar objetivo.', 'error');
    }
  };

  const handleDeleteObjective = async (obj) => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user || !obj) return;
    if (!confirm('Excluir este objetivo? As atividades e requisitos vinculados não serão excluídos, apenas desvinculados.')) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'objectives', obj.id));
      events.filter((e) => e.objectiveId === obj.id).forEach((ev) => {
        batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', ev.id), { objectiveId: null, updatedAt: serverTimestamp() });
      });
      await batch.commit();
      showToast('Objetivo excluído.');
    } catch (e) {
      showToast('Erro ao excluir objetivo.', 'error');
    }
  };

  const handleEditObjective = (obj) => {
    setEditingObjective(obj);
    setObjectiveAreaId(obj.areaId);
    setObjectiveFormData({ title: obj.title || '', description: obj.description || '' });
    setIsObjectiveFormOpen(true);
  };

  const handleAddArea = () => {
    setAreaFormData({ name: '', color: '#6366f1', icon: 'Folder' });
    setIsAddAreaModalOpen(true);
  };

  const handleSaveArea = async () => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user || !areaFormData.name?.trim()) return;
    try {
      const order = (allAreas?.filter((a) => !a.isSystem)?.length ?? 0);
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'areas'), {
        name: areaFormData.name.trim(),
        color: areaFormData.color || '#6366f1',
        icon: areaFormData.icon || 'Folder',
        order,
      });
      showToast('Área criada!');
      setIsAddAreaModalOpen(false);
      setAreaFormData({ name: '', color: '#6366f1', icon: 'Folder' });
    } catch (e) {
      showToast('Erro ao criar área.', 'error');
    }
  };

  const handleImportClasses = async (classIds) => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user) { showToast('Utilizador não autenticado.', 'error'); return; }
    if (!classIds?.length) {
      showToast('Selecione pelo menos uma classe.', 'error');
      return;
    }
    const toImport = classIds.filter(id => {
      const cls = curriculumClasses.find(c => c.id === id);
      return cls && !alreadyImportedClassNames.has(cls.name);
    });
    if (toImport.length === 0) {
      showToast('Nenhuma classe nova para importar. As selecionadas já foram importadas.', 'info');
      return;
    }
    try {
      const batch = writeBatch(db);
      const classCat = categories.find(c => c.name === 'Classes') || categories[0];
      const safeCategoryId = classCat ? classCat.id : 'uncategorized';
      let totalReqs = 0;
      for (const id of toImport) {
        const cls = curriculumClasses.find(c => c.id === id);
        if (!cls) continue;
        for (const r of (cls.requirements || [])) {
          const eventData = {
            title: r.title || 'Sem título',
            description: r.description || '',
            observation: '',
            categoryId: safeCategoryId,
            isRequirement: true,
            chapter: r.chapter || 'Gerais',
            originClassName: cls.name || 'Classe',
            color: cls.color || '#10b981',
            type: 'event',
            start: null,
            createdAt: serverTimestamp(),
            tagIds: [],
          };
          batch.set(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'events')), eventData);
          totalReqs++;
        }
      }
      await batch.commit();
      if (typeof refetchEvents === 'function') await refetchEvents();
      showToast(`${totalReqs} requisito(s) de ${toImport.length} classe(s) importado(s) com sucesso!`);
    } catch (e) {
      console.error('Erro na importação:', e);
      showToast('Erro ao importar requisitos.', 'error');
    }
  };

  const handleResetClass = async (className) => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user) { showToast('Utilizador não autenticado.', 'error'); return; }
    const toReset = events.filter(
      (e) => e.type !== 'trash' && e.isRequirement && e.originClassName === className
    );
    if (toReset.length === 0) {
      showToast('Nenhum requisito desta classe no calendário.', 'info');
      return;
    }
    try {
      const batch = writeBatch(db);
      for (const ev of toReset) {
        batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'events', ev.id), {
          start: null,
          tagIds: [],
          objectiveId: null,
          observation: '',
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
      showToast(`${toReset.length} requisito(s) zerado(s) — datas, tags, vínculos com objetivos e observações removidos.`);
    } catch (e) {
      console.error('Erro ao zerar:', e);
      showToast('Erro ao zerar classe.', 'error');
    }
  };

  const handleRemoveClassFromCalendar = async (className) => {
    if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
    if (!user) { showToast('Utilizador não autenticado.', 'error'); return; }
    const toRemove = events.filter(
      (e) => e.type !== 'trash' && e.isRequirement && e.originClassName === className
    );
    if (toRemove.length === 0) {
      showToast('Nenhum requisito desta classe no calendário.', 'info');
      return;
    }
    try {
      const batch = writeBatch(db);
      for (const ev of toRemove) {
        batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'events', ev.id));
      }
      await batch.commit();
      showToast(`Classe "${className}" removida do calendário (${toRemove.length} requisito(s) excluído(s)).`);
    } catch (e) {
      console.error('Erro ao remover classe:', e);
      showToast('Erro ao remover classe do calendário.', 'error');
    }
  };


  if (loading)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <Sidebar
        sidebarOpen={sidebarOpen}
        viewMode={viewMode}
        pageFilter={pageFilter}
        setViewMode={setViewMode}
        setPageFilter={setPageFilter}
        onNewActivity={() => openEventModal()}
        onCategorySettings={() => setIsCategorySettingsOpen(true)}
        onTagSettings={() => setIsTagSettingsOpen(true)}
        categories={categories}
        tags={tags}
        counters={counters}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-5 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 -ml-1 text-slate-600 rounded-lg hover:bg-slate-100"
            type="button"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1 min-w-2" />
          <div className="flex items-center gap-2 md:gap-3 h-9">
            <button
              onClick={() => {
                if (!objectivesGlowActive) {
                  setActivationModalModule('objectives');
                  return;
                }
                setViewMode(VIEW_MODES.OBJECTIVES);
                setPageFilter(null);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 transition-colors ${
                objectivesGlowActive
                  ? 'btn-ambient-glow-objectives py-1.5 h-auto'
                  : viewMode === VIEW_MODES.OBJECTIVES
                    ? 'bg-indigo-100 text-indigo-700 rounded-lg py-2 h-9'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg py-2 h-9'
              }`}
              type="button"
            >
              <Target size={14} className="shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span>Objetivos Maiores</span>
                {objectivesGlowActive && (
                  <span className="text-[9px] font-bold tracking-wider opacity-70 uppercase">
                    Módulo Ativo
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                if (!classManagerGlowActive) {
                  setActivationModalModule('classManager');
                  return;
                }
                setViewMode(VIEW_MODES.CLASS_MANAGER);
                setPageFilter(null);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 transition-colors ${
                classManagerGlowActive
                  ? 'btn-ambient-glow-classmanager py-1.5 h-auto'
                  : viewMode === VIEW_MODES.CLASS_MANAGER
                    ? 'bg-blue-100 text-blue-700 rounded-lg py-2 h-9'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg py-2 h-9'
              }`}
              type="button"
            >
              <BookOpen size={14} className="shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span>Gerenciador de Classes</span>
                {classManagerGlowActive && (
                  <span className="text-[9px] font-bold tracking-wider opacity-70 uppercase">
                    Módulo Ativo
                  </span>
                )}
              </div>
            </button>
            <div className="w-px h-6 bg-slate-200 shrink-0" aria-hidden />
            {isDemoMode && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg bg-amber-200 text-amber-800 border border-amber-300">
                DEMO
              </span>
            )}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-lg transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200 h-9"
              type="button"
            >
              <Shield size={14} className="shrink-0" /> Admin
            </button>
            <button
              onClick={() => {
                setViewMode(VIEW_MODES.PRINT);
                setPageFilter(null);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-lg transition-colors h-9 ${
                viewMode === VIEW_MODES.PRINT
                  ? 'bg-slate-200 text-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              type="button"
            >
              <Printer size={14} className="shrink-0" /> Impressão
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-200 h-9">
              <div className="flex flex-col justify-center text-left leading-tight">
                <span className="text-sm font-semibold text-slate-800 block">Diretor</span>
                <span className="text-xs text-slate-500">UID: {user?.uid ? `${user.uid.slice(0, 5)}...` : '—'}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <User size={16} />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut(auth)} title="Sair" className="h-9 w-9 shrink-0">
              <Undo2 className="rotate-180" size={18} />
            </Button>
          </div>
        </header>
        {viewMode !== VIEW_MODES.OBJECTIVES && viewMode !== VIEW_MODES.CLASS_MANAGER && viewMode !== VIEW_MODES.PRINT && (
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchFilterCategoryIds={searchFilterCategoryIds}
          setSearchFilterCategoryIds={setSearchFilterCategoryIds}
          searchFilterTagIds={searchFilterTagIds}
          setSearchFilterTagIds={setSearchFilterTagIds}
          searchFilterDepartmentIds={searchFilterDepartmentIds}
          setSearchFilterDepartmentIds={setSearchFilterDepartmentIds}
          searchFilterClassIds={searchFilterClassIds}
          setSearchFilterClassIds={setSearchFilterClassIds}
          searchFilterOpen={searchFilterOpen}
          setSearchFilterOpen={setSearchFilterOpen}
          lockedPageFilterId={lockedPageFilterId}
          lockedPageFilterType={lockedPageFilterType}
          getCategory={getCategory}
          getTag={getTag}
          categories={categories}
          tags={tags}
          allDepartments={allDepartments}
          curriculumClasses={curriculumClasses}
        />
        )}
        <div
          className={`flex-1 overflow-hidden relative ${
            viewMode === VIEW_MODES.OBJECTIVES && objectivesGlowActive
              ? 'p-0 nitro-page-bg-objectives'
              : viewMode === VIEW_MODES.CLASS_MANAGER && classManagerGlowActive
                ? 'p-0 nitro-page-bg-classmanager'
                : 'p-3 md:p-4'
          }`}
        >
          {viewMode === VIEW_MODES.PRINT ? (
            <PrintPage
              events={events}
              objectives={objectives}
              allAreas={allAreas}
              curriculumClasses={curriculumClasses}
              allDepartments={allDepartments}
              alreadyImportedClassNames={alreadyImportedClassNames}
              categories={categories}
              tags={tags}
              getCategory={getCategory}
              getTag={getTag}
            />
          ) : viewMode === VIEW_MODES.CLASS_MANAGER ? (
            <div className={`h-full overflow-hidden ${classManagerGlowActive ? 'rounded-none' : 'rounded-xl'}`}>
              <ClassManagerPage
                  allDepartments={allDepartments || []}
                  curriculumClasses={curriculumClasses || []}
                  events={events}
                  alreadyImportedClassNames={alreadyImportedClassNames}
                  onImportClasses={handleImportClasses}
                  onResetClass={handleResetClass}
                  onRemoveClassFromCalendar={handleRemoveClassFromCalendar}
                  showToast={showToast}
                  isModuleActive={classManagerGlowActive}
                  onDeactivateModule={() => setDeactivationModalModule('classManager')}
                />
            </div>
          ) : viewMode === VIEW_MODES.OBJECTIVES ? (
            <div className={`h-full overflow-hidden ${objectivesGlowActive ? 'rounded-none' : 'rounded-xl'}`}>
              <ObjectivesPage
                  allAreas={allAreas || []}
                  objectives={objectives || []}
                  events={events}
                  getCategory={getCategory}
                  getTag={getTag}
                  canEditArea
                  onAddArea={handleAddArea}
                  onAddObjective={handleAddObjective}
                  onEditObjective={handleEditObjective}
                  onDeleteObjective={handleDeleteObjective}
                  onRemoveEventFromObjective={handleRemoveEventFromObjective}
                  onOpenAddActivity={(objectiveId) => openEventModal(null, null, objectiveId)}
                  onOpenLinkToObjective={(objectiveId) => {
                    setLinkToObjectiveId(objectiveId);
                    setIsLinkToObjectiveOpen(true);
                  }}
                  onViewEvent={openViewModal}
                  onEditEvent={openEventModal}
                  onDeleteEvent={handleDeleteRequest}
                  isModuleActive={objectivesGlowActive}
                  onDeactivateModule={() => setDeactivationModalModule('objectives')}
                />
            </div>
          ) : (
            <MainContent
              viewMode={viewMode}
              pageFilter={pageFilter}
              filteredEvents={filteredEvents}
              getCategory={getCategory}
              getTag={getTag}
              objectives={objectives || []}
              allAreas={allAreas || []}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              calendarView={calendarView}
              setCalendarView={setCalendarView}
              onViewEvent={openViewModal}
              onEditEvent={openEventModal}
              onDeleteEvent={handleDeleteRequest}
              onAddEvent={openEventModal}
            />
          )}
        </div>
      </main>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => { setIsEventModalOpen(false); setEditRecurrenceScope(null); }}
        formData={formData}
        setFormData={setFormData}
        editingEvent={editingEvent}
        categories={categories}
        tags={tags}
        objectives={objectives || []}
        allAreas={allAreas || []}
        onSave={handleSaveEvent}
      />

      <ViewEventModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        event={viewingEvent}
        getCategory={getCategory}
        getTag={getTag}
        objectives={objectives || []}
        allAreas={allAreas || []}
        showRestoreMenu={showRestoreMenu}
        onToggleRestoreMenu={setShowRestoreMenu}
        onRestore={executeRestore}
        onEdit={openEventModal}
        onDelete={handleDeleteRequest}
      />

      <RecurrenceChoiceModal
        isOpen={recurrenceChoiceOpen}
        onClose={() => {
          setRecurrenceChoiceOpen(false);
          setRecurrenceChoiceType(null);
          setRecurrenceChoiceCallback(null);
        }}
        choiceType={recurrenceChoiceType}
        onThisOnly={() => {
          if (recurrenceChoiceType === 'edit') setEditRecurrenceScope('this');
          else setDeleteRecurrenceScope('this');
          setRecurrenceChoiceOpen(false);
          recurrenceChoiceCallback?.();
          setRecurrenceChoiceCallback(null);
        }}
        onAllSeries={() => {
          if (recurrenceChoiceType === 'edit') setEditRecurrenceScope('all');
          else setDeleteRecurrenceScope('all');
          setRecurrenceChoiceOpen(false);
          recurrenceChoiceCallback?.();
          setRecurrenceChoiceCallback(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setDeleteRecurrenceScope(null); }}
        target={deleteTarget}
        deleteScope={deleteRecurrenceScope}
        onConfirm={executeDelete}
      />

      <CategorySettingsModal
        isOpen={isCategorySettingsOpen}
        onClose={() => setIsCategorySettingsOpen(false)}
        categories={categories}
        onDelete={async (catId) => {
          if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
          await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'categories', catId));
          showToast('Categoria removida.');
        }}
        onAdd={async ({ name, color, icon }) => {
          if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'categories'), { name, color, icon: icon || 'Folder', isSystem: false });
          showToast('Categoria criada!');
        }}
        onUpdate={async (catId, { name, color, icon }) => {
          if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'categories', catId), { name, color, icon });
          showToast('Categoria atualizada!');
        }}
      />

      <TagSettingsModal
        isOpen={isTagSettingsOpen}
        onClose={() => setIsTagSettingsOpen(false)}
        tags={tags}
        tagForm={tagForm}
        setTagForm={setTagForm}
        isEditingTag={isEditingTag}
        setIsEditingTag={setIsEditingTag}
        onSave={async (tagFormData, editingId) => {
          if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
          try {
            const { name, color } = tagFormData;
            const data = { name, color };
            if (editingId) {
              await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tags', editingId), data);
              showToast('Tag atualizada!');
            } else {
              await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tags'), data);
              showToast('Tag criada!');
            }
            setTagForm({ name: '', color: '#6366f1' });
            setIsEditingTag(null);
          } catch (err) {
            showToast('Erro ao salvar tag.', 'error');
          }
        }}
        onDelete={async (tagId) => {
          if (isDemoMode) { showToast('Modo DEMO: alterações não são salvas no banco.', 'error'); return; }
          if (confirm('Excluir esta tag? Será removida das atividades.')) {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tags', tagId));
            showToast('Tag removida.');
          }
        }}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      >
        <Suspense fallback={
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          </div>
        }>
          <AdminPanel />
        </Suspense>
      </AdminModal>

      <ObjectiveFormModal
        isOpen={isObjectiveFormOpen}
        onClose={() => {
          setIsObjectiveFormOpen(false);
          setObjectiveFormData({ title: '', description: '' });
          setEditingObjective(null);
          setObjectiveAreaId(null);
        }}
        areaId={objectiveAreaId}
        areaName={objectiveAreaId ? allAreas?.find((a) => a.id === objectiveAreaId)?.name : null}
        editingObjective={editingObjective}
        formData={objectiveFormData}
        setFormData={setObjectiveFormData}
        onSave={handleSaveObjective}
      />

      <AddAreaModal
        isOpen={isAddAreaModalOpen}
        onClose={() => { setIsAddAreaModalOpen(false); setAreaFormData({ name: '', color: '#6366f1', icon: 'Folder' }); }}
        formData={areaFormData}
        setFormData={setAreaFormData}
        onSave={handleSaveArea}
      />

      <LinkToObjectiveModal
        isOpen={isLinkToObjectiveOpen}
        onClose={() => { setIsLinkToObjectiveOpen(false); setLinkToObjectiveId(null); }}
        objective={linkToObjectiveId ? { id: linkToObjectiveId, title: objectives?.find((o) => o.id === linkToObjectiveId)?.title } : null}
        events={events}
        categories={categories}
        tags={tags}
        allDepartments={allDepartments || []}
        curriculumClasses={curriculumClasses || []}
        getCategory={getCategory}
        getTag={getTag}
        onLink={handleLinkToObjective}
      />

      <ModuleActivationModal
        isOpen={activationModalModule !== null}
        onClose={() => setActivationModalModule(null)}
        moduleType={activationModalModule || 'objectives'}
        Icon={activationModalModule === 'classManager' ? BookOpen : Target}
        title={activationModalModule === 'classManager' ? 'Turbinar Gerenciador de Classes' : 'Turbinar Objetivos Maiores'}
        subtitle={activationModalModule === 'classManager'
          ? 'Ative este módulo para desbloquear o gerenciamento de classes por departamento com visual especial.'
          : 'Ative este módulo para desbloquear objetivos maiores por área com visual especial.'}
        onActivate={() => {
          if (activationModalModule === 'objectives') {
            setObjectivesGlow(true);
            setViewMode(VIEW_MODES.OBJECTIVES);
            setPageFilter(null);
          } else if (activationModalModule === 'classManager') {
            setClassManagerGlow(true);
            setViewMode(VIEW_MODES.CLASS_MANAGER);
            setPageFilter(null);
          }
          setActivationModalModule(null);
        }}
      />

      <ModuleDeactivationModal
        isOpen={deactivationModalModule !== null}
        onClose={() => setDeactivationModalModule(null)}
        moduleType={deactivationModalModule || 'objectives'}
        moduleLabel={deactivationModalModule === 'classManager' ? 'Gerenciador de Classes' : 'Objetivos Maiores'}
        onConfirm={() => {
          if (deactivationModalModule === 'objectives') {
            setObjectivesGlow(false);
            setViewMode(VIEW_MODES.CALENDAR);
          } else if (deactivationModalModule === 'classManager') {
            setClassManagerGlow(false);
            setViewMode(VIEW_MODES.CALENDAR);
          }
          setDeactivationModalModule(null);
        }}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

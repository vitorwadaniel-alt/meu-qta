import { useCallback } from 'react';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useQta } from '../context/QtaContext.jsx';
import { userEventsPath } from '../utils/firestorePaths.js';
import { generateRecurrenceDates } from '../utils/dateUtils.js';

/**
 * Hook que encapsula as operações de mutação de eventos no Firestore.
 * Retorna funções assíncronas que executam as operações e retornam
 * um resultado para o caller gerenciar o estado da UI.
 */
export function useEventMutations() {
  const { db, appId, user, isDemoMode, showToast } = useQta();

  const checkAndGetUserId = useCallback(() => {
    if (isDemoMode) {
      showToast('Modo DEMO: alterações não são salvas no banco.', 'error');
      return null;
    }
    if (!user) {
      showToast('Utilizador não autenticado. Tente recarregar a página.', 'error');
      return null;
    }
    return user.uid;
  }, [isDemoMode, user, showToast]);

  const saveEvent = useCallback(
    async ({
      formData,
      editingEvent,
      editRecurrenceScope,
      events,
      categories,
    }) => {
      const uid = checkAndGetUserId();
      if (!uid) return { success: false };
      if (!formData.title) {
        showToast('Título obrigatório', 'error');
        return { success: false };
      }

      const defaultCatId = categories?.length > 0 ? categories[0].id : 'uncategorized';
      const finalCategoryId = formData.categoryId || defaultCatId;
      let startDate = null;
      if (!formData.isUnallocated && formData.date) {
        startDate = new Date(`${formData.date}T${formData.time || '00:00'}`);
      }

      const baseEvent = {
        title: formData.title,
        description: formData.description || '',
        observation: formData.observation ?? '',
        categoryId: finalCategoryId,
        tagIds: formData.tagIds || [],
        isRequirement: formData.isRequirement || false,
        updatedAt: serverTimestamp(),
        type: 'event',
        deletedAt: null,
      };
      if (editingEvent?.isRequirement) {
        baseEvent.chapter = editingEvent.chapter || 'Gerais';
        baseEvent.originClassName = editingEvent.originClassName || 'Classe';
        baseEvent.color = editingEvent.color || '#10b981';
      }
      if (formData.objectiveId) baseEvent.objectiveId = formData.objectiveId;
      if (editingEvent?.objectiveId) baseEvent.objectiveId = editingEvent.objectiveId;

      const basePath = userEventsPath(appId, uid);
      const eventRef = (id) => doc(db, ...basePath, id);
      const eventsCol = () => collection(db, ...basePath);

      try {
        const batch = writeBatch(db);
        if (editingEvent) {
          const isRecurringEvent = editingEvent.recurrenceGroupId && editRecurrenceScope === 'all';

          if (isRecurringEvent) {
            const seriesEvents = events.filter((e) => e.recurrenceGroupId === editingEvent.recurrenceGroupId);
            seriesEvents.forEach((ev) => {
              batch.update(eventRef(ev.id), {
                ...baseEvent,
                start: ev.start,
                recurrenceGroupId: ev.recurrenceGroupId,
                recurrenceIndex: ev.recurrenceIndex,
              });
            });
          } else if (formData.recurrence !== 'none' && !formData.isUnallocated && startDate) {
            const groupId = crypto.randomUUID();
            const dates = generateRecurrenceDates(startDate, {
              freq: formData.recurrence,
              interval: formData.recurrenceInterval || 1,
              endType: formData.recurrenceEnd || 'never',
              endDate: formData.recurrenceEndDate || null,
              endCount: formData.recurrenceEndCount || 10,
              weekdays: formData.recurrenceWeekdays,
            });
            batch.update(eventRef(editingEvent.id), {
              ...baseEvent,
              start: dates[0],
              recurrenceGroupId: groupId,
              recurrenceIndex: 0,
            });
            dates.slice(1).forEach((d, i) => {
              batch.set(doc(eventsCol()), {
                ...baseEvent,
                start: d,
                recurrenceGroupId: groupId,
                recurrenceIndex: i + 1,
                createdAt: serverTimestamp(),
              });
            });
          } else {
            const updateData = { ...baseEvent, start: startDate };
            if (editingEvent.recurrenceGroupId && editRecurrenceScope === 'this') {
              updateData.recurrenceGroupId = null;
              updateData.recurrenceIndex = null;
            }
            batch.update(eventRef(editingEvent.id), updateData);
          }
        } else {
          if (formData.recurrence !== 'none' && !formData.isUnallocated && startDate) {
            const groupId = crypto.randomUUID();
            const dates = generateRecurrenceDates(startDate, {
              freq: formData.recurrence,
              interval: formData.recurrenceInterval || 1,
              endType: formData.recurrenceEnd || 'never',
              endDate: formData.recurrenceEndDate || null,
              endCount: formData.recurrenceEndCount || 10,
              weekdays: formData.recurrenceWeekdays,
            });
            dates.forEach((d, i) => {
              batch.set(doc(eventsCol()), {
                ...baseEvent,
                start: d,
                recurrenceGroupId: groupId,
                recurrenceIndex: i,
                createdAt: serverTimestamp(),
              });
            });
          } else {
            batch.set(doc(eventsCol()), {
              ...baseEvent,
              start: startDate,
              createdAt: serverTimestamp(),
            });
          }
        }
        await batch.commit();
        return { success: true, closeModal: true, toastMessage: editingEvent ? 'Atividade atualizada!' : 'Atividade criada!' };
      } catch (e) {
        console.error('Erro ao salvar:', e);
        showToast('Erro ao salvar. Verifique a consola.', 'error');
        return { success: false };
      }
    },
    [db, appId, checkAndGetUserId, showToast]
  );

  const deleteEvent = useCallback(
    async ({ deleteTarget, deleteRecurrenceScope, events }) => {
      const uid = checkAndGetUserId();
      if (!uid || !deleteTarget) return { success: false };

      const basePath = userEventsPath(appId, uid);
      const eventRef = (id) => doc(db, ...basePath, id);

      try {
        const batch = writeBatch(db);
        const isRecurringEvent = deleteTarget.recurrenceGroupId && deleteRecurrenceScope === 'all';

        if (isRecurringEvent) {
          const seriesEvents = events.filter((e) => e.recurrenceGroupId === deleteTarget.recurrenceGroupId);
          seriesEvents.forEach((ev) => {
            if (ev.isRequirement && ev.type !== 'trash') {
              batch.update(eventRef(ev.id), { start: null });
            } else if (ev.type === 'trash') {
              batch.delete(eventRef(ev.id));
            } else {
              batch.update(eventRef(ev.id), { type: 'trash', deletedAt: serverTimestamp() });
            }
          });
          await batch.commit();
          showToast(`Série completa excluída (${seriesEvents.length} evento(s)).`);
        } else {
          if (deleteTarget.isRequirement && deleteTarget.type !== 'trash') {
            batch.update(eventRef(deleteTarget.id), { start: null });
            showToast('Desagendado');
          } else if (deleteTarget.type === 'trash') {
            batch.delete(eventRef(deleteTarget.id));
            showToast('Excluído permanentemente.');
          } else {
            batch.update(eventRef(deleteTarget.id), { type: 'trash', deletedAt: serverTimestamp() });
            showToast('Movido para a lixeira.');
          }
          await batch.commit();
        }
        return { success: true, closeModal: true };
      } catch (e) {
        showToast('Erro ao excluir.', 'error');
        return { success: false };
      }
    },
    [db, appId, checkAndGetUserId, showToast]
  );

  const restoreEvent = useCallback(
    async (mode, event) => {
      const uid = checkAndGetUserId();
      if (!uid) return { success: false };

      try {
        const ref = doc(db, ...userEventsPath(appId, uid), event.id);
        const batch = writeBatch(db);
        if (mode === 'original') batch.update(ref, { type: 'event', deletedAt: null });
        else if (mode === 'unallocated') batch.update(ref, { type: 'event', deletedAt: null, start: null });
        await batch.commit();
        showToast(mode === 'original' ? 'Restaurado para a data original.' : 'Restaurado para "Não Alocados".');
        return { success: true, closeViewModal: true };
      } catch (e) {
        showToast('Erro ao restaurar', 'error');
        return { success: false };
      }
    },
    [db, appId, checkAndGetUserId, showToast]
  );

  return { saveEvent, deleteEvent, restoreEvent };
}

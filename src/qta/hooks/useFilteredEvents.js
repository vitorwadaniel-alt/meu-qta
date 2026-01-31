import { useMemo } from 'react';
import { VIEW_MODES } from '../constants/viewModes.js';

/**
 * Hook que calcula eventos filtrados, contadores e dados derivados para a aplicação.
 */
export function useFilteredEvents({
  events,
  viewMode,
  pageFilter,
  searchQuery,
  searchFilterCategoryIds,
  searchFilterTagIds,
  searchFilterDepartmentIds,
  searchFilterClassIds,
  curriculumClasses,
}) {
  const selectedDepartmentClassNames = useMemo(() => {
    if (!searchFilterDepartmentIds?.length) return null;
    return new Set(
      curriculumClasses
        .filter((c) => searchFilterDepartmentIds.includes(c.department))
        .map((c) => c.name)
    );
  }, [curriculumClasses, searchFilterDepartmentIds]);

  const selectedClassNames = useMemo(() => {
    if (!searchFilterClassIds?.length) return null;
    return new Set(curriculumClasses.filter((c) => searchFilterClassIds.includes(c.id)).map((c) => c.name));
  }, [curriculumClasses, searchFilterClassIds]);

  const lockedPageFilterId = useMemo(
    () => (viewMode === VIEW_MODES.FILTERED_PAGE && pageFilter ? pageFilter.id : null),
    [viewMode, pageFilter]
  );
  const lockedPageFilterType = useMemo(
    () => (viewMode === VIEW_MODES.FILTERED_PAGE && pageFilter ? pageFilter.type : null),
    [viewMode, pageFilter]
  );

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (viewMode === VIEW_MODES.TRASH) filtered = filtered.filter((e) => e.type === 'trash');
    else if (viewMode === VIEW_MODES.UNALLOCATED)
      filtered = filtered.filter((e) => e.type !== 'trash' && !e.start);
    else if (viewMode === VIEW_MODES.FILTERED_PAGE) {
      filtered = filtered.filter((e) => e.type !== 'trash');
      if (pageFilter?.type === 'category') filtered = filtered.filter((e) => e.categoryId === pageFilter.id);
      else if (pageFilter?.type === 'tag')
        filtered = filtered.filter((e) => (e.tagIds || []).includes(pageFilter.id));
    } else filtered = filtered.filter((e) => e.type !== 'trash' && e.start);

    if (searchQuery?.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.title || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)
      );
    }
    // Na lixeira, não aplicar filtros de categoria/tag/departamento/classe (só busca por texto)
    if (viewMode !== VIEW_MODES.TRASH) {
      const effectiveCategoryIds = [
        ...(lockedPageFilterType === 'category' && lockedPageFilterId ? [lockedPageFilterId] : []),
        ...searchFilterCategoryIds,
      ].filter((v, i, a) => a.indexOf(v) === i);
      if (effectiveCategoryIds.length > 0)
        filtered = filtered.filter((e) => effectiveCategoryIds.includes(e.categoryId));
      const effectiveTagIds = [
        ...(lockedPageFilterType === 'tag' && lockedPageFilterId ? [lockedPageFilterId] : []),
        ...searchFilterTagIds,
      ].filter((v, i, a) => a.indexOf(v) === i);
      if (effectiveTagIds.length > 0)
        filtered = filtered.filter((e) => (e.tagIds || []).some((id) => effectiveTagIds.includes(id)));
      if (selectedDepartmentClassNames) {
        filtered = filtered.filter(
          (e) => e.isRequirement && e.originClassName && selectedDepartmentClassNames.has(e.originClassName)
        );
      }
      if (selectedClassNames) {
        filtered = filtered.filter(
          (e) => e.isRequirement && e.originClassName && selectedClassNames.has(e.originClassName)
        );
      }
    }
    return filtered;
  }, [
    events,
    viewMode,
    pageFilter,
    searchQuery,
    searchFilterCategoryIds,
    searchFilterTagIds,
    selectedDepartmentClassNames,
    selectedClassNames,
    lockedPageFilterId,
    lockedPageFilterType,
  ]);

  const counters = useMemo(
    () => ({
      all: events.filter((e) => e.type !== 'trash' && e.start).length,
      unallocated: events.filter((e) => e.type !== 'trash' && !e.start).length,
      trash: events.filter((e) => e.type === 'trash').length,
    }),
    [events]
  );

  const alreadyImportedClassNames = useMemo(
    () => new Set(events.filter((e) => e.isRequirement && e.originClassName).map((e) => e.originClassName)),
    [events]
  );

  return {
    filteredEvents,
    counters,
    alreadyImportedClassNames,
    selectedDepartmentClassNames,
    selectedClassNames,
    lockedPageFilterId,
    lockedPageFilterType,
  };
}

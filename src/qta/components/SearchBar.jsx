import { BookOpen, Filter, Search, X } from 'lucide-react';
import { ICON_MAP, Tag as TagIcon } from '../constants/icons.js';
import FilterDropdown from './FilterDropdown.jsx';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  searchFilterCategoryIds,
  setSearchFilterCategoryIds,
  searchFilterTagIds,
  setSearchFilterTagIds,
  searchFilterDepartmentIds,
  setSearchFilterDepartmentIds,
  searchFilterClassIds,
  setSearchFilterClassIds,
  searchFilterOpen,
  setSearchFilterOpen,
  lockedPageFilterId,
  lockedPageFilterType,
  getCategory,
  getTag,
  categories,
  tags,
  allDepartments,
  curriculumClasses,
}) {
  const hasActiveSearchFilters =
    searchQuery.trim() ||
    searchFilterCategoryIds.length > 0 ||
    searchFilterTagIds.length > 0 ||
    searchFilterDepartmentIds.length > 0 ||
    searchFilterClassIds.length > 0 ||
    lockedPageFilterId;

  const clearSearchFilters = () => {
    setSearchQuery('');
    setSearchFilterCategoryIds([]);
    setSearchFilterTagIds([]);
    setSearchFilterDepartmentIds([]);
    setSearchFilterClassIds([]);
    setSearchFilterOpen(null);
  };

  const toggleCategory = (id, sel) =>
    setSearchFilterCategoryIds((prev) => (sel ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleTag = (id, sel) =>
    setSearchFilterTagIds((prev) => (sel ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleDepartment = (id, sel) =>
    setSearchFilterDepartmentIds((prev) => (sel ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleClass = (id, sel) =>
    setSearchFilterClassIds((prev) => (sel ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="py-4 px-4 md:px-5 bg-white border-b border-slate-200 flex flex-wrap items-center gap-2 shrink-0">
      {lockedPageFilterId && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium border border-amber-200">
          {lockedPageFilterType === 'category' && (() => {
            const c = getCategory(lockedPageFilterId);
            const IconC = ICON_MAP[c.icon] || TagIcon;
            return (
              <>
                <IconC size={14} style={{ color: c.color }} /> {c.name}
              </>
            );
          })()}
          {lockedPageFilterType === 'tag' && (() => {
            const t = getTag(lockedPageFilterId);
            return t ? (
              <>
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} /> {t.name}
              </>
            ) : null;
          })()}
          <span className="text-amber-600 text-xs">(página atual)</span>
        </span>
      )}
      <div className="flex-1 min-w-[200px] relative h-10">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por nome ou descrição..."
          className="w-full h-full pl-9 pr-3 py-0 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-slate-500 hidden sm:block shrink-0" />
        <FilterDropdown
          type="category"
          label="Categoria"
          items={categories}
          getItemId={(c) => c.id}
          getItemLabel={(c) => c.name}
          getItemColor={(c) => c.color}
          selectedIds={searchFilterCategoryIds}
          onToggle={toggleCategory}
          Icon={TagIcon}
          isOpen={searchFilterOpen === 'category'}
          onOpenChange={setSearchFilterOpen}
          lockedPageFilterId={lockedPageFilterId}
          lockedPageFilterType={lockedPageFilterType}
        />
        <FilterDropdown
          type="tag"
          label="Tag"
          items={tags}
          getItemId={(t) => t.id}
          getItemLabel={(t) => t.name}
          getItemColor={(t) => t.color}
          selectedIds={searchFilterTagIds}
          onToggle={toggleTag}
          Icon={TagIcon}
          isOpen={searchFilterOpen === 'tag'}
          onOpenChange={setSearchFilterOpen}
          lockedPageFilterId={lockedPageFilterId}
          lockedPageFilterType={lockedPageFilterType}
        />
        <FilterDropdown
          type="department"
          label="Departamento"
          items={allDepartments}
          getItemId={(d) => d.id}
          getItemLabel={(d) => d.name}
          selectedIds={searchFilterDepartmentIds}
          onToggle={toggleDepartment}
          isOpen={searchFilterOpen === 'department'}
          onOpenChange={setSearchFilterOpen}
          lockedPageFilterId={lockedPageFilterId}
          lockedPageFilterType={lockedPageFilterType}
        />
        <FilterDropdown
          type="class"
          label="Classe"
          items={[...curriculumClasses].sort((a, b) => (a.order || 0) - (b.order || 0))}
          getItemId={(c) => c.id}
          getItemLabel={(c) => c.name}
          getItemColor={(c) => c.color}
          selectedIds={searchFilterClassIds}
          onToggle={toggleClass}
          Icon={BookOpen}
          isOpen={searchFilterOpen === 'class'}
          onOpenChange={setSearchFilterOpen}
          lockedPageFilterId={lockedPageFilterId}
          lockedPageFilterType={lockedPageFilterType}
        />
        {hasActiveSearchFilters && (
          <button
            onClick={clearSearchFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          >
            <X size={16} />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}

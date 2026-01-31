import { lazy, Suspense } from 'react';
import { Calendar, FolderOpen, List, Loader2, Trash2 } from 'lucide-react';
import { VIEW_MODES } from '../constants/viewModes.js';
import EventCard from './EventCard.jsx';

const CalendarViews = lazy(() => import('./Calendar/CalendarViews.jsx'));

/**
 * Área principal que alterna entre calendário, página de categoria/tag, não alocados e lixeira.
 */
export default function MainContent({
  viewMode,
  pageFilter,
  filteredEvents,
  getCategory,
  getTag,
  objectives = [],
  allAreas = [],
  currentDate,
  setCurrentDate,
  calendarView,
  setCalendarView,
  onViewEvent,
  onEditEvent,
  onDeleteEvent,
  onAddEvent,
}) {
  if (viewMode === VIEW_MODES.CALENDAR) {
    const eventsWithStart = filteredEvents.filter((e) => e.start);
    return (
      <Suspense fallback={
        <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
      }>
        <CalendarViews
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          calendarView={calendarView}
          setCalendarView={setCalendarView}
          eventsWithStart={eventsWithStart}
          getCategory={getCategory}
          getTag={getTag}
          onViewEvent={onViewEvent}
          onAddEvent={onAddEvent}
        />
      </Suspense>
    );
  }

  if (viewMode === VIEW_MODES.FILTERED_PAGE && pageFilter) {
    const pageTitle =
      pageFilter.type === 'category'
        ? getCategory(pageFilter.id).name
        : getTag(pageFilter.id)?.name || 'Tag';
    const sorted = [...filteredEvents].sort((a, b) => (a.start || 0) - (b.start || 0));
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{pageTitle}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5 md:content-start md:auto-rows-min">
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-slate-500 md:col-span-full">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-base">
                Nenhuma atividade ou requisito nesta {pageFilter.type === 'category' ? 'categoria' : 'tag'}.
              </p>
              <button
                onClick={() => onAddEvent()}
                className="mt-3 text-blue-600 hover:underline font-medium"
              >
                Criar atividade
              </button>
            </div>
          ) : (
            sorted.map((ev) => (
              <div key={ev.id} className="shrink-0 md:contents">
                <EventCard
                  event={ev}
                  getCategory={getCategory}
                  getTag={getTag}
                  isUnallocated={!ev.start}
                  isTrash={false}
                  showCategory
                  showClassInfo
                  objectives={objectives}
                  allAreas={allAreas}
                  onView={onViewEvent}
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const sorted = [...filteredEvents].sort((a, b) => (a.start || 0) - (b.start || 0));
  const isTrash = viewMode === VIEW_MODES.TRASH;
  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-100 shrink-0">
        <h2 className="text-lg font-bold text-slate-800">
          {viewMode === VIEW_MODES.UNALLOCATED ? 'Não Alocados' : 'Lixeira'}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5 md:content-start md:auto-rows-min">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-500 md:col-span-full">
            {viewMode === VIEW_MODES.UNALLOCATED ? (
              <>
                <List size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-base">Nenhum item não alocado.</p>
                <button
                  onClick={() => onAddEvent()}
                  className="mt-3 text-blue-600 hover:underline font-medium"
                >
                  Criar atividade
                </button>
              </>
            ) : (
              <>
                <Trash2 size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-base">Lixeira vazia.</p>
              </>
            )}
          </div>
        ) : (
          sorted.map((ev) => (
            <div key={ev.id} className="shrink-0 md:contents">
              <EventCard
                event={ev}
                getCategory={getCategory}
                getTag={getTag}
                isUnallocated={viewMode === VIEW_MODES.UNALLOCATED || !ev.start}
                isTrash={isTrash}
                showCategory
                showClassInfo
                objectives={objectives}
                allAreas={allAreas}
                onView={onViewEvent}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

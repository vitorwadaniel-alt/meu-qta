import { useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CALENDAR_VIEWS } from '../../constants/viewModes.js';
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  getStartOfWeek,
  isSameDay,
  getPeriodLabel,
  formatDate,
} from '../../utils/dateUtils.js';
import EventChip from '../EventChip.jsx';

const VIEW_OPTIONS = [
  [CALENDAR_VIEWS.DAY, 'Dia', 'D'],
  [CALENDAR_VIEWS.THREE_DAYS, '3 dias', 'X'],
  [CALENDAR_VIEWS.WEEK, 'Semana', 'S'],
  [CALENDAR_VIEWS.MONTH, 'Mês', 'M'],
  [CALENDAR_VIEWS.YEAR, 'Ano', 'A'],
  [CALENDAR_VIEWS.SCHEDULE, 'Programação', 'P'],
];

const VIEW_LABELS = {
  [CALENDAR_VIEWS.DAY]: 'Dia',
  [CALENDAR_VIEWS.THREE_DAYS]: '3 dias',
  [CALENDAR_VIEWS.WEEK]: 'Semana',
  [CALENDAR_VIEWS.MONTH]: 'Mês',
  [CALENDAR_VIEWS.YEAR]: 'Ano',
  [CALENDAR_VIEWS.SCHEDULE]: 'Programação',
};

export default function CalendarViews({
  currentDate,
  setCurrentDate,
  calendarView,
  setCalendarView,
  eventsWithStart,
  getCategory,
  getTag,
  onViewEvent,
  onAddEvent,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const navigate = (direction) => {
    const n = direction === 'next' ? 1 : -1;
    if (calendarView === CALENDAR_VIEWS.DAY) setCurrentDate(addDays(currentDate, n));
    else if (calendarView === CALENDAR_VIEWS.THREE_DAYS) setCurrentDate(addDays(currentDate, n));
    else if (calendarView === CALENDAR_VIEWS.WEEK) setCurrentDate(addWeeks(currentDate, n));
    else if (calendarView === CALENDAR_VIEWS.MONTH) setCurrentDate(addMonths(currentDate, n));
    else if (calendarView === CALENDAR_VIEWS.YEAR) setCurrentDate(addYears(currentDate, n));
    else if (calendarView === CALENDAR_VIEWS.SCHEDULE) setCurrentDate(addMonths(currentDate, n));
  };

  const calendarHeader = (
    <div className="p-3 md:p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
        >
          Hoje
        </button>
        <div className="flex bg-slate-100 rounded-lg overflow-hidden">
          <button onClick={() => navigate('prev')} className="p-2 hover:bg-slate-200 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => navigate('next')} className="p-2 hover:bg-slate-200 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        <h2 className="text-lg font-bold capitalize text-slate-800">{getPeriodLabel(calendarView, currentDate)}</h2>
      </div>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium"
        >
          {VIEW_LABELS[calendarView]}
          <ChevronDown size={16} />
        </button>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              {VIEW_OPTIONS.map(([key, label, shortcut]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCalendarView(key);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center hover:bg-gray-50 ${
                    calendarView === key ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {label}
                  <span className="text-xs text-gray-400">{shortcut}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderChip = (ev, compact = true) => (
    <EventChip
      key={ev.id}
      event={ev}
      getCategory={getCategory}
      getTag={getTag}
      compact={compact}
      onClick={onViewEvent}
    />
  );

  if (calendarView === CALENDAR_VIEWS.DAY) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    const dayEvents = eventsWithStart
      .filter((e) => e.start >= dayStart && e.start <= dayEnd)
      .sort((a, b) => (a.start || 0) - (b.start || 0));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {calendarHeader}
        <div className="flex-1 overflow-y-auto flex">
          <div className="w-16 flex-shrink-0 border-r text-right text-xs text-gray-500 pr-2 py-1">
            {hours.map((h) => (
              <div key={h} className="h-16">
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          <div className="flex-1 relative min-h-[600px]">
            {hours.map((h) => (
              <div
                key={h}
                className="h-16 border-b border-gray-100 cursor-pointer hover:bg-blue-50/50 transition-colors"
                onClick={() =>
                  onAddEvent(
                    null,
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), h)
                  )
                }
              />
            ))}
            {dayEvents.map((ev) => {
              const top = ((ev.start.getHours() + ev.start.getMinutes() / 60) / 24) * 100;
              const height = Math.max((1 / 24) * 100, 4);
              return (
                <div
                  key={ev.id}
                  className="absolute left-2 right-2 pointer-events-auto z-10"
                  style={{ top: `${top}%`, height: `${height}%`, minHeight: 32 }}
                >
                  {renderChip(ev, true)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (calendarView === CALENDAR_VIEWS.THREE_DAYS) {
    const dayCols = [0, 1, 2].map((i) => addDays(currentDate, i));
    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {calendarHeader}
        <div className="flex-1 overflow-y-auto flex">
          <div className="w-14 flex-shrink-0 border-r text-right text-xs text-gray-500 pr-1 py-2">
            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
              <div key={h} className="h-12">
                {h.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-3">
            {dayCols.map((day) => {
              const dayStart = new Date(day);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(day);
              dayEnd.setHours(23, 59, 59, 999);
              const dayEvs = eventsWithStart
                .filter((e) => e.start >= dayStart && e.start <= dayEnd)
                .sort((a, b) => (a.start || 0) - (b.start || 0));
              const dayIsToday = isSameDay(day, today);
              return (
                <div key={day.getTime()} className="border-r last:border-r-0 flex flex-col">
                  <div
                    className={`p-2 text-center border-b ${
                      dayIsToday ? 'bg-blue-50 font-bold text-blue-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-gray-500">{weekDays[day.getDay()]}</div>
                    <div className={`text-lg ${dayIsToday ? 'text-blue-600' : 'text-gray-800'}`}>
                      {day.getDate()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1 relative min-h-[400px] p-1">
                    {dayEvs.map((ev) => renderChip(ev, true))}
                    <button
                      onClick={() => onAddEvent(null, day)}
                      className="mt-2 w-full py-2 border-2 border-dashed border-gray-200 rounded text-gray-400 text-xs hover:border-blue-300 hover:text-blue-500"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (calendarView === CALENDAR_VIEWS.WEEK) {
    const weekStart = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {calendarHeader}
        <div className="flex-1 overflow-y-auto flex">
          <div className="w-14 flex-shrink-0 border-r text-right text-xs text-gray-500 pr-1 py-2">
            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
              <div key={h} className="h-12">
                {h.toString().padStart(2, '0')}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day) => {
              const dayStart = new Date(day);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(day);
              dayEnd.setHours(23, 59, 59, 999);
              const dayEvs = eventsWithStart
                .filter((e) => e.start >= dayStart && e.start <= dayEnd)
                .sort((a, b) => (a.start || 0) - (b.start || 0));
              const dayIsToday = isSameDay(day, today);
              return (
                <div key={day.getTime()} className="border-r last:border-r-0 flex flex-col">
                  <div
                    className={`p-2 text-center border-b flex-shrink-0 ${
                      dayIsToday ? 'bg-blue-50 font-bold text-blue-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-gray-500">{weekDayLabels[day.getDay()]}</div>
                    <div className={`text-lg ${dayIsToday ? 'text-blue-600' : 'text-gray-800'}`}>
                      {day.getDate()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {day.toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1 relative min-h-[400px] p-1">
                    {dayEvs.map((ev) => renderChip(ev, true))}
                    <button
                      onClick={() => onAddEvent(null, day)}
                      className="mt-2 w-full py-2 border-2 border-dashed border-gray-200 rounded text-gray-400 text-xs hover:border-blue-300 hover:text-blue-500"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (calendarView === CALENDAR_VIEWS.MONTH) {
    const days = Array.from(
      { length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() },
      (_, i) => i + 1
    );
    const blanks = Array.from(
      { length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() },
      (_, i) => i
    );
    const eventsInMonth = eventsWithStart.filter(
      (e) => e.start.getMonth() === currentDate.getMonth() && e.start.getFullYear() === currentDate.getFullYear()
    );
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {calendarHeader}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 border-b bg-gray-50 text-center text-xs font-bold text-gray-500 py-2">
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[500px] auto-rows-fr">
            {blanks.map((i) => (
              <div key={`b-${i}`} className="bg-gray-50/50 border-b border-r" />
            ))}
            {days.map((d) => {
              const dayEvs = eventsInMonth.filter((e) => e.start.getDate() === d);
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
              const dayIsToday = isSameDay(dateObj, today);
              return (
                <div
                  key={d}
                  className="min-h-[100px] border-b border-r p-1 hover:bg-gray-50 cursor-pointer group"
                  onClick={() => onAddEvent(null, dateObj)}
                >
                  <div className="flex justify-between">
                    <span
                      className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        dayIsToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                      }`}
                    >
                      {d}
                    </span>
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                  </div>
                  <div className="flex flex-col gap-1 mt-1">{dayEvs.map((ev) => renderChip(ev, true))}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (calendarView === CALENDAR_VIEWS.YEAR) {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      name: new Date(year, i).toLocaleDateString('pt-BR', { month: 'long' }),
    }));
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {calendarHeader}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {months.map(({ month, name }) => {
              const monthStart = new Date(year, month, 1);
              const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
              const monthEvents = eventsWithStart.filter(
                (e) => e.start >= monthStart && e.start <= monthEnd
              );
              return (
                <div key={month} className="border rounded-lg p-3 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 mb-2 capitalize">{name}</h3>
                  <div className="space-y-1 min-h-[80px]">
                    {monthEvents.slice(0, 5).map((ev) => renderChip(ev, true))}
                    {monthEvents.length > 5 && (
                      <div className="text-xs text-gray-500">+{monthEvents.length - 5} mais</div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setCalendarView(CALENDAR_VIEWS.MONTH);
                      setCurrentDate(new Date(year, month));
                    }}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    Ver mês →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (calendarView === CALENDAR_VIEWS.SCHEDULE) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    const scheduleEvents = eventsWithStart
      .filter((e) => e.start >= monthStart && e.start <= monthEnd)
      .sort((a, b) => (a.start || 0) - (b.start || 0));
    const byDate = {};
    scheduleEvents.forEach((ev) => {
      const key = formatDate(ev.start);
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(ev);
    });
    const sortedDates = Object.keys(byDate).sort();
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {calendarHeader}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0">
          <div className="space-y-6 max-w-2xl w-full mx-auto">
            {sortedDates.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-16 text-slate-500">
                <Calendar size={48} className="mb-4 opacity-50 shrink-0" aria-hidden />
                <p className="text-base">Nenhum evento neste mês</p>
                <button onClick={() => onAddEvent()} className="mt-3 text-blue-600 hover:underline font-medium">
                  Criar atividade
                </button>
              </div>
            ) : (
              sortedDates.map((dateKey) => {
                const d = new Date(dateKey + 'T12:00:00');
                const dayEvs = byDate[dateKey];
                const dayIsToday = isSameDay(d, today);
                return (
                  <div key={dateKey} className="flex gap-4">
                    <div
                      className={`w-20 flex-shrink-0 text-center ${
                        dayIsToday ? 'text-blue-600 font-bold' : 'text-gray-600'
                      }`}
                    >
                      <div className="text-2xl">{d.getDate()}</div>
                      <div className="text-xs uppercase">
                        {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className="text-xs">{d.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                    </div>
                    <div className="flex-1 border-l pl-4 space-y-2">
                      {dayEvs.map((ev) => (
                        <div key={ev.id} className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 flex-shrink-0 mt-1">
                            {ev.start.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <div className="flex-1 min-w-0">{renderChip(ev, false)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

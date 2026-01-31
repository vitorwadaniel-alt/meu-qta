/**
 * Utilitários de data
 */

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date, weeks) => addDays(date, weeks * 7);

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Adiciona meses preservando o dia do mês (ou último dia se o mês tiver menos dias).
 * Ex.: 31 jan + 1 mês → 29 fev (ano bissexto) ou 28 fev.
 */
export const addMonthsPreserveDay = (date, months) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
};

const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);

/**
 * Adiciona anos. 29/fev em ano não bissexto vira 28/fev.
 */
export const addYears = (date, years) => {
  const d = new Date(date);
  const wasFeb29 = d.getDate() === 29 && d.getMonth() === 1;
  d.setFullYear(d.getFullYear() + years);
  if (wasFeb29 && !isLeapYear(d.getFullYear())) d.setDate(28);
  return d;
};

const MAX_OCC = 730;

/**
 * Gera as datas de ocorrência para um evento recorrente (estilo Google Calendar).
 * @param {Date} start - data/hora da primeira ocorrência
 * @param {Object} opts - freq, interval (1+), endType ('never'|'on_date'|'after'), endDate (ISO), endCount, weekdays ([0-6] para weekly)
 * @returns {Date[]}
 */
export function generateRecurrenceDates(start, opts) {
  const { freq, interval = 1, endType = 'never', endDate, endCount = 10, weekdays } = opts;
  if (!freq || freq === 'none') return [new Date(start)];

  const list = [];
  const endMs = endType === 'on_date' && endDate ? new Date(endDate + 'T23:59:59.999').getTime() : null;
  const maxN = endType === 'after' ? Math.min(endCount, MAX_OCC) : MAX_OCC;
  const wdays = (freq === 'weekly' && weekdays && weekdays.length) ? weekdays : [start.getDay()];

  if (freq === 'daily') {
    let d = new Date(start);
    while (list.length < maxN) {
      if (endMs != null && d.getTime() > endMs) break;
      list.push(new Date(d));
      d = addDays(d, interval);
    }
    return list;
  }

  if (freq === 'weekly') {
    let d = new Date(start.getTime());
    const startMs = start.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    while (list.length < maxN) {
      if (endMs != null && d.getTime() > endMs) break;
      const daysSince = Math.floor((d.getTime() - startMs) / dayMs);
      const weekIndex = Math.floor(daysSince / 7);
      if (wdays.includes(d.getDay()) && weekIndex % interval === 0) list.push(new Date(d));
      d = addDays(d, 1);
    }
    return list;
  }

  if (freq === 'monthly') {
    let d = new Date(start);
    while (list.length < maxN) {
      if (endMs != null && d.getTime() > endMs) break;
      list.push(new Date(d));
      d = addMonthsPreserveDay(d, interval);
    }
    return list;
  }

  if (freq === 'yearly') {
    let d = new Date(start);
    while (list.length < maxN) {
      if (endMs != null && d.getTime() > endMs) break;
      list.push(new Date(d));
      d = addYears(d, interval);
    }
    return list;
  }

  return [new Date(start)];
}

/** Retorna o início da semana (domingo) */
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Retorna o fim da semana (sábado 23:59:59) */
export const getEndOfWeek = (date) => {
  const start = getStartOfWeek(date);
  const end = addDays(start, 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

/** Verifica se duas datas são do mesmo dia */
export const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

/** Retorna label do período atual para exibição (ex: "Jan. - nov. 2026") */
export const getPeriodLabel = (view, currentDate) => {
  const d = new Date(currentDate);
  const locale = 'pt-BR';
  if (view === 'day') return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  if (view === 'week') {
    const start = getStartOfWeek(d);
    const end = addDays(start, 6);
    return `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  if (view === 'threeDays') {
    const end = addDays(d, 2);
    return `${d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  if (view === 'month') return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  if (view === 'year') return d.getFullYear().toString();
  if (view === 'schedule') return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  return d.toLocaleDateString(locale);
};

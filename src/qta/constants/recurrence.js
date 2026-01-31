/** Com que frequência o evento repete (linguagem simples) */
export const RECURRENCE_FREQ = [
  { value: 'none', label: 'Não repetir' },
  { value: 'daily', label: 'Todo dia' },
  { value: 'weekly', label: 'Toda semana' },
  { value: 'monthly', label: 'Todo mês' },
  { value: 'yearly', label: 'Todo ano' }
];

/** Quando a repetição para */
export const RECURRENCE_END = [
  { value: 'never', label: 'Nunca (sem data para acabar)' },
  { value: 'on_date', label: 'Numa data' },
  { value: 'after', label: 'Depois de' }
];

/** Unidade para "De X em X [unidade]" (singular e plural) */
export const RECURRENCE_INTERVAL_LABEL = {
  daily: { 1: 'dia', other: 'dias' },
  weekly: { 1: 'semana', other: 'semanas' },
  monthly: { 1: 'mês', other: 'meses' },
  yearly: { 1: 'ano', other: 'anos' }
};

/** Dias da semana (0=Dom) para repetição semanal */
export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Limite de ocorrências (como no Google Calendar) */
export const RECURRENCE_MAX_OCCURRENCES = 730;

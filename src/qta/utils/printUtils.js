/**
 * Utilitários para geração de HTML de impressão em formato A4.
 * Identidade visual: Meu QTA, ícones e cores do projeto.
 */

import { formatDate } from './dateUtils.js';
import { DEFAULT_COLOR } from '../constants/colors.js';
import { getIconSvg } from './printIcons.js';
import { RECURRENCE_FREQ, RECURRENCE_INTERVAL_LABEL, WEEKDAY_LABELS } from '../constants/recurrence.js';

/** Identidade visual do projeto para impressão (nome + cor primária do projeto) */
const PRINT_BRAND = {
  name: 'Meu QTA',
  primary: DEFAULT_COLOR,   // indigo-500 – mesmo que categorias/áreas
  primaryDark: '#4f46e5',   // indigo-600
  primaryLight: '#eef2ff',  // indigo-50 – fundo de destaque
};

/** Ícone em SVG (grid 2x2, alusivo ao LayoutGrid da sidebar) – cor primária */
const PRINT_LOGO_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${PRINT_BRAND.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;

function getPrintHeader(subtitle) {
  const sub = subtitle ? `<span class="print-brand-subtitle">${escapeHtml(subtitle)}</span>` : '';
  return `<header class="print-brand-header">
    <div class="print-brand-row">
      <span class="print-brand-logo">${PRINT_LOGO_SVG}</span>
      <span class="print-brand-name">${PRINT_BRAND.name}</span>
    </div>
    ${sub}
    <div class="print-brand-bar"></div>
  </header>`;
}

const A4_STYLES = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #1e293b; line-height: 1.5; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 12mm; page-break-after: always; background: #fff; }
  .page:last-child { page-break-after: auto; }
  .print-brand-header { margin-bottom: 14px; }
  .print-brand-row { display: flex; align-items: center; gap: 8px; }
  .print-brand-logo { display: inline-flex; align-items: center; justify-content: center; }
  .print-brand-name { font-size: 18px; font-weight: 700; color: ${PRINT_BRAND.primary}; letter-spacing: -0.02em; }
  .print-brand-subtitle { font-size: 12px; color: #64748b; display: block; margin-top: 2px; }
  .print-brand-bar { height: 3px; background: ${PRINT_BRAND.primary}; border-radius: 2px; margin-top: 6px; width: 48px; }
  h1 { font-size: 18px; margin: 0 0 12px 0; color: #0f172a; border-bottom: 2px solid ${PRINT_BRAND.primary}; padding-bottom: 8px; }
  h2 { font-size: 14px; margin: 14px 0 8px 0; color: ${PRINT_BRAND.primaryDark}; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: ${PRINT_BRAND.primaryLight}; color: ${PRINT_BRAND.primaryDark}; font-weight: 600; }
  tr:nth-child(even) { background: #f8fafc; }
  .meta { color: #64748b; font-size: 11px; margin-bottom: 12px; }
  .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .badge-imported { background: ${PRINT_BRAND.primaryLight}; color: ${PRINT_BRAND.primaryDark}; }
  .badge-pending { background: #f1f5f9; color: #475569; }
  .pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; color: #fff; margin-right: 4px; margin-bottom: 2px; }
  .event-detail { font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.4; }
  .event-req { font-weight: 700; font-size: 10px; color: #6366f1; margin-right: 4px; }
  ul.compact { margin: 0; padding-left: 18px; }
  .compact li { margin: 5px 0; line-height: 1.45; font-size: 11px; }
  .area-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .area-icon { display: inline-flex; align-items: center; justify-content: center; }
  .obj-block { margin-bottom: 16px; padding-left: 10px; border-left: 3px solid ${PRINT_BRAND.primaryLight}; }
  .chapter-row { display: flex; align-items: center; gap: 8px; margin: 5px 0; font-size: 11px; }
  .chapter-bar { flex: 1; max-width: 140px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .chapter-fill { height: 100%; border-radius: 4px; background: ${PRINT_BRAND.primary}; }
  /* Gerenciador de Classes – cards por classe com barra geral */
  .class-card { margin-bottom: 16px; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafafa; page-break-inside: avoid; }
  .class-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
  .class-card-name { font-weight: 700; font-size: 13px; color: #1e293b; }
  .class-card-badge { font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
  .class-overall { margin-bottom: 10px; }
  .class-overall-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 5px; }
  .class-overall-bar-wrap { display: flex; align-items: center; gap: 10px; }
  .class-overall-bar { flex: 1; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
  .class-overall-pct { font-size: 12px; font-weight: 700; color: #334155; min-width: 2.5em; text-align: right; display: inline-flex; align-items: center; justify-content: flex-end; gap: 4px; }
  .class-overall-pct.done { color: #b45309; }
  .class-overall-pct.pending { color: ${PRINT_BRAND.primaryDark}; }
  .class-overall-pct .star-icon { display: inline-flex; }
  .class-overall-fill { height: 100%; border-radius: 6px; transition: width 0.2s; }
  .class-overall-fill.done { background: linear-gradient(90deg, #f59e0b, #eab308); }
  .class-overall-fill.pending { background: ${PRINT_BRAND.primary}; }
  .class-overall-fill.empty { background: #cbd5e1; }
  .class-overall-meta { font-size: 11px; color: #64748b; margin-top: 4px; }
  .chapter-pct { font-size: 11px; font-weight: 600; color: #475569; min-width: 2.5em; text-align: right; }
  .class-chapters { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0; }
  .class-chapters-title { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
  /* Calendário visual por mês */
  .month-section { margin-bottom: 22px; page-break-inside: avoid; }
  .month-divider { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 18px 0 14px 0; }
  .month-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, ${PRINT_BRAND.primary}40, transparent); }
  .month-divider-icon { width: 10px; height: 10px; background: ${PRINT_BRAND.primary}; transform: rotate(45deg); }
  .month-title { font-size: 15px; font-weight: 700; color: ${PRINT_BRAND.primary}; letter-spacing: 0.08em; text-transform: uppercase; padding: 0 8px; }
  .day-row { display: flex; gap: 14px; margin-bottom: 14px; align-items: flex-start; }
  .day-label { flex: 0 0 100px; font-size: 12px; font-weight: 700; color: #334155; line-height: 1.35; padding-top: 8px; }
  .calendar-date-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: #fff;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    margin-right: 12px;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .calendar-date-month {
    width: 100%;
    background-color: #f1f5f9;
    font-size: 0.6rem;
    text-transform: uppercase;
    color: #64748b;
    text-align: center;
    font-weight: 700;
    padding: 2px 0;
    border-bottom: 1px solid #e2e8f0;
  }
  .calendar-date-day { font-size: 1.15rem; font-weight: 700; color: #0f172a; line-height: 1; padding-top: 1px; }
  .day-events { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
  .event-block {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    border-left: 5px solid;
  }
  .event-block-bar {
    display: flex;
    align-items: center;
    gap: 8px 14px;
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 500;
    color: #fff;
    flex-wrap: wrap;
  }
  .event-block-bar .event-bar-icon { display: inline-flex; align-items: center; flex-shrink: 0; }
  .event-block-bar .event-bar-sep { margin: 0 4px; opacity: 0.85; }
  .event-block-body { padding: 12px 14px; font-size: 11px; line-height: 1.5; color: #475569; }
  .event-block-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px; line-height: 1.3; }
  .event-block-sub { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; font-size: 10px; color: #64748b; margin-bottom: 10px; }
  .event-block-sub .event-time-wrap { display: inline-flex; align-items: center; gap: 4px; }
  .event-block-sub .event-time-wrap svg { flex-shrink: 0; }
  .event-type-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 6px; border-radius: 4px; }
  .event-type-activity { background: #e0f2fe; color: #0369a1; }
  .event-type-requirement { background: #fef3c7; color: #b45309; }
  .event-recurrence-line { font-size: 10px; color: #0c4a6e; margin-bottom: 8px; padding: 5px 8px; background: #f0f9ff; border-radius: 4px; }
  .event-desc-block { margin-bottom: 8px; }
  .event-desc-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 3px; }
  .event-desc-text { font-size: 11px; color: #334155; line-height: 1.5; white-space: pre-wrap; }
  .event-observation-block { margin-bottom: 8px; padding: 6px 8px; background: #fffbeb; border-radius: 4px; border-left: 3px solid #f59e0b; }
  .event-observation-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #b45309; margin-bottom: 3px; }
  .event-observation-text { font-size: 11px; color: #475569; line-height: 1.5; white-space: pre-wrap; }
  .event-tags-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9; font-size: 10px; color: #64748b; }
  .event-tags-row .event-tags-label { font-weight: 600; margin-right: 2px; }
  .event-tag-pill { font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 4px; color: #fff; }
`;

/** Estilos específicos do relatório de Objetivos (layout cards + impressão A4) */
const OBJECTIVES_PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { background-color: #fff; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background-color: #f8fafc;
    color: #0f172a;
    padding: 30px 20px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }
  .print-brand-header { margin-bottom: 14px; }
  .print-brand-row { display: flex; align-items: center; gap: 8px; }
  .print-brand-logo { display: inline-flex; align-items: center; justify-content: center; }
  .print-brand-name { font-size: 18px; font-weight: 700; color: ${PRINT_BRAND.primary}; letter-spacing: -0.02em; }
  .print-brand-subtitle { font-size: 12px; color: #64748b; display: block; margin-top: 2px; }
  .print-brand-bar { height: 3px; background: ${PRINT_BRAND.primary}; border-radius: 2px; margin-top: 6px; width: 48px; }
  .obj-report-container { max-width: 1200px; margin: 0 auto; }
  .obj-report-title { font-size: 18px; margin: 0 0 12px 0; color: #0f172a; border-bottom: 2px solid ${PRINT_BRAND.primary}; padding-bottom: 8px; }
  .obj-report-meta { color: #64748b; font-size: 11px; margin-bottom: 12px; }
  .obj-stats-summary {
    display: flex;
    gap: 12px;
    margin-bottom: 25px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .obj-stat-card {
    background: #fff;
    padding: 12px 20px;
    border-radius: 10px;
    min-width: 140px;
    text-align: center;
    border: 1px solid #e2e8f0;
    border-bottom-width: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .obj-stat-number { font-size: 1.5rem; font-weight: 800; line-height: 1.2; }
  .obj-stat-label { font-size: 0.8rem; color: #64748b; font-weight: 500; }
  .obj-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
  .obj-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
    border: 1px solid #e2e8f0;
    border-top-width: 5px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .obj-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .obj-area-badge {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    color: #fff;
    display: inline-block;
    margin-bottom: 4px;
    letter-spacing: 0.05em;
  }
  .obj-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
  .obj-card .obj-icon { opacity: 0.3; }
  .obj-progress-container { margin-bottom: 16px; }
  .obj-progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 4px;
    font-weight: 500;
  }
  .obj-progress-bg {
    height: 8px;
    background-color: #f1f5f9;
    border-radius: 99px;
    overflow: hidden;
  }
  .obj-progress-fill { height: 100%; border-radius: 99px; }
  .obj-activities {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
  }
  @media (min-width: 768px) {
    .obj-activities { grid-template-columns: 1fr 1fr; }
  }
  .obj-activity-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    background-color: #fcfcfc;
  }
  .obj-date-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background-color: #fff;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    margin-right: 12px;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .obj-date-month {
    width: 100%;
    background-color: #f1f5f9;
    font-size: 0.55rem;
    text-transform: uppercase;
    color: #64748b;
    text-align: center;
    font-weight: 700;
    padding: 1px 0;
    border-bottom: 1px solid #e2e8f0;
  }
  .obj-date-day { font-size: 1rem; font-weight: 700; color: #0f172a; line-height: 1; padding-top: 1px; }
  .obj-date-box.no-date .obj-date-day { font-size: 0.8rem; color: #64748b; padding: 0; }
  .obj-date-box.no-date .obj-date-month { display: none; }
  .obj-date-box.no-date { background-color: #f8fafc; }
  .obj-activity-info { flex-grow: 1; }
  .obj-activity-name { font-weight: 600; font-size: 0.85rem; margin-bottom: 0; }
  .obj-tag {
    background-color: #f1f5f9;
    color: #64748b;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 600;
    display: inline-block;
  }
  @media print {
    @page { size: A4; margin: 1cm; }
    html, body {
      background-color: #fff !important;
      background: #fff !important;
      padding: 0;
      font-size: 10pt;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .obj-report-container { max-width: none; width: 100%; margin: 0; }
    .obj-report-title { font-size: 16pt; margin: 0 0 10px 0; }
    .obj-report-meta { font-size: 9pt; color: #444; }
    .obj-card .obj-icon { display: none; }
    .obj-grid { display: block; column-count: 1; }
    .obj-card {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 15px;
      width: 100%;
      box-shadow: none;
      border: 1px solid #ccc;
      border-top-width: 5px;
      padding: 15px;
    }
    .obj-activities { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .obj-activity-item { border: 1px solid #ddd; padding: 6px; }
    .obj-stats-summary { justify-content: space-between; gap: 8px; margin-bottom: 20px; }
    .obj-stat-card { padding: 8px; border: 1px solid #ddd; box-shadow: none; flex: 1; }
    .obj-stat-number { font-size: 12pt; }
    .obj-stat-label { font-size: 7pt; }
    .obj-date-box { border-color: #999; }
    .obj-date-month { background-color: #eee; border-bottom-color: #999; color: #000; }
    .obj-tag { border: 1px solid #ccc; background: none; }
  }
`;

function openPrintWindow(html, title = 'Impressão QTA') {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.document.title = title;
}

const MONTH_NAMES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const MONTH_SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getDayLabel(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const weekday = WEEKDAY_SHORT[d.getDay()];
  return `${day} ${month} ${weekday}`;
}

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Retorna texto legível da recorrência (ex.: "Toda semana (Seg, Qua)", "Todo mês"). */
function getRecurrenceLabel(e) {
  const freq = e.recurrence || 'none';
  if (freq === 'none') return '';
  const freqEntry = RECURRENCE_FREQ.find((f) => f.value === freq);
  const baseLabel = freqEntry ? freqEntry.label : freq;
  const interval = e.recurrenceInterval || 1;
  const intervalLabels = RECURRENCE_INTERVAL_LABEL[freq] || { 1: 'dia', other: 'dias' };
  const unit = interval === 1 ? (intervalLabels[1] || intervalLabels.other) : (intervalLabels.other || 'dias');
  let text = interval === 1 ? baseLabel : `A cada ${interval} ${unit}`;
  if (freq === 'weekly' && (e.recurrenceWeekdays || []).length > 0) {
    const days = (e.recurrenceWeekdays || [])
      .sort((a, b) => a - b)
      .map((i) => WEEKDAY_LABELS[i])
      .join(', ');
    text += ` (${days})`;
  }
  if (e.recurrenceEnd === 'on_date' && e.recurrenceEndDate) {
    const d = typeof e.recurrenceEndDate === 'string' ? e.recurrenceEndDate : (e.recurrenceEndDate.toDate ? e.recurrenceEndDate.toDate() : e.recurrenceEndDate);
    text += ` • até ${typeof d === 'string' ? d : new Date(d).toLocaleDateString('pt-BR')}`;
  } else if (e.recurrenceEnd === 'after' && e.recurrenceEndCount) {
    text += ` • ${e.recurrenceEndCount} ocorrência(s)`;
  }
  return text;
}

/**
 * Exporta eventos do calendário em layout visual por mês: seções mensais, datas à esquerda, cards à direita.
 * options: { monthKeys?, categoryIds?, tagIds?, includeRequirements? }
 * objectives: lista opcional para exibir nome do objetivo no card (event.objectiveId → objective.title).
 */
export function buildCalendarPrintHtml(events, getCategory, getTag, options = {}, objectives = []) {
  let withStart = (events || [])
    .filter((e) => e.type !== 'trash' && e.start)
    .sort((a, b) => (a.start?.getTime?.() ?? 0) - (b.start?.getTime?.() ?? 0));

  if (options.includeRequirements === false) {
    withStart = withStart.filter((e) => !e.isRequirement);
  }
  if (options.categoryIds != null && options.categoryIds.length > 0) {
    withStart = withStart.filter((e) => e.categoryId && options.categoryIds.includes(e.categoryId));
  }
  if (options.tagIds != null && options.tagIds.length > 0) {
    withStart = withStart.filter((e) => (e.tagIds || []).some((tid) => options.tagIds.includes(tid)));
  }
  if (options.monthKeys != null && options.monthKeys.length > 0) {
    withStart = withStart.filter((e) => options.monthKeys.includes(getMonthKey(e.start)));
  }

  const byMonth = new Map();
  for (const e of withStart) {
    const key = getMonthKey(e.start);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(e);
  }

  const monthSections = [];
  const sortedKeys = [...byMonth.keys()].sort();
  for (const key of sortedKeys) {
    const monthEvents = byMonth.get(key);
    const [y, m] = key.split('-').map(Number);
    const monthTitle = `${MONTH_NAMES[m - 1]} ${y}`;

    const byDay = new Map();
    for (const e of monthEvents) {
      const dayKey = formatDate(e.start);
      if (!byDay.has(dayKey)) byDay.set(dayKey, []);
      byDay.get(dayKey).push(e);
    }
    const sortedDays = [...byDay.keys()].sort();

    const dayRows = sortedDays.map((dayKey) => {
      const dayEvents = byDay.get(dayKey);
      const firstDate = dayEvents[0].start;
      const d = firstDate instanceof Date ? firstDate : new Date(firstDate);
      const monthShort = MONTH_SHORT[d.getMonth()];
      const dayNum = d.getDate();
      const dateBoxHtml = `<div class="calendar-date-box"><span class="calendar-date-month">${monthShort}</span><span class="calendar-date-day">${dayNum}</span></div>`;

      const blocks = dayEvents.map((e) => {
        const cat = getCategory(e.categoryId);
        const catColor = cat?.color || '#94a3b8';
        const catName = escapeHtml(cat?.name || '—');
        const catIconSvg = getIconSvg(cat?.icon || 'Tag', '#fff', 14);
        const obj = (objectives || []).find((o) => o.id === e.objectiveId);
        const hasObjective = obj && e.objectiveId;
        const objName = obj ? escapeHtml(obj.title || '—') : '—';
        const objIconSvg = getIconSvg('Target', '#fff', 14);
        const timeStr = e.start ? e.start.toTimeString().slice(0, 5) : '';
        const clockIconSvg = getIconSvg('Clock', '#64748b', 12);
        const typeBadgeClass = e.isRequirement ? 'event-type-requirement' : 'event-type-activity';
        const typeLabel = e.isRequirement ? 'Requisito' : 'Atividade';
        const recurrenceLabel = getRecurrenceLabel(e);
        const recurrenceHtml =
          recurrenceLabel
            ? `<div class="event-recurrence-line">↻ ${escapeHtml(recurrenceLabel)}</div>`
            : '';
        const descHtml =
          e.description
            ? `<div class="event-desc-block"><div class="event-desc-label">Descrição</div><div class="event-desc-text">${escapeHtml(e.description)}</div></div>`
            : '';
        const obsHtml =
          e.observation
            ? `<div class="event-observation-block"><div class="event-observation-label">Observação</div><div class="event-observation-text">${escapeHtml(e.observation)}</div></div>`
            : '';
        const tagPills = (e.tagIds || [])
          .map((id) => getTag(id))
          .filter(Boolean)
          .map((t) => `<span class="event-tag-pill" style="background: ${t.color || '#64748b'};">${escapeHtml(t.name)}</span>`)
          .join('');
        const tagsHtml = tagPills ? `<div class="event-tags-row"><span class="event-tags-label">Tags:</span>${tagPills}</div>` : '';

        const barContent = hasObjective
          ? `<span class="event-bar-icon">${catIconSvg}</span><span>Categoria: ${catName}</span><span class="event-bar-sep">|</span><span class="event-bar-icon">${objIconSvg}</span><span>Objetivo Maior: ${objName}</span>`
          : `<span class="event-bar-icon">${catIconSvg}</span><span>Categoria: ${catName}</span>`;
        const subParts = [`<span class="event-type-badge ${typeBadgeClass}">${typeLabel}</span>`];
        if (timeStr) subParts.push(`<span class="event-time-wrap">${clockIconSvg}<span>${timeStr}</span></span>`);
        if (e.isRequirement && (e.originClassName || e.chapter)) subParts.push(`<span>${escapeHtml(e.originClassName || '')}${e.chapter ? ' › ' + escapeHtml(e.chapter) : ''}</span>`);
        const subLine = subParts.join('');

        return `
          <div class="event-block" style="border-left-color: ${catColor};">
            <div class="event-block-bar" style="background: ${catColor};">${barContent}</div>
            <div class="event-block-body">
              <div class="event-block-title">${escapeHtml(e.title || '—')}</div>
              <div class="event-block-sub">${subLine}</div>
              ${recurrenceHtml}
              ${descHtml}
              ${obsHtml}
              ${tagsHtml}
            </div>
          </div>`;
      });

      return `
        <div class="day-row">
          ${dateBoxHtml}
          <div class="day-events">${blocks.join('')}</div>
        </div>`;
    });

    monthSections.push(`
      <section class="month-section">
        <div class="month-divider">
          <span class="month-divider-line"></span>
          <span class="month-divider-icon"></span>
          <span class="month-title">${monthTitle}</span>
          <span class="month-divider-icon"></span>
          <span class="month-divider-line"></span>
        </div>
        ${dayRows.join('')}
      </section>
    `);
  }

  const content =
    monthSections.length > 0
      ? monthSections.join('')
      : '<p style="color:#64748b;text-align:center;padding:24px;">Nenhum evento com data no calendário.</p>';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Calendário – ${PRINT_BRAND.name}</title><style>${A4_STYLES}</style></head>
<body>
  <div class="page">
    ${getPrintHeader('Calendário')}
    <p class="meta">Exportado em ${new Date().toLocaleString('pt-BR')}</p>
    <h1>Atividades e requisitos por mês</h1>
    ${content}
  </div>
</body>
</html>`;

  openPrintWindow(html, `Calendário – ${PRINT_BRAND.name}`);
}

/**
 * Exporta objetivos por área no layout do exemplo: header, resumo por área (stats), cards por objetivo
 * com barra de progresso e atividades em grid (caixa de data + nome + tag).
 * options: { areaIds? }
 */
export function buildObjectivesPrintHtml(objectives, allAreas, events, getCategory, getTag, options = {}) {
  let areas = allAreas || [];
  let objectivesList = objectives || [];
  const eventsList = (events || []).filter((e) => e.type !== 'trash');

  if (options.areaIds != null && options.areaIds.length > 0) {
    areas = areas.filter((a) => options.areaIds.includes(a.id));
    objectivesList = objectivesList.filter((o) => options.areaIds.includes(o.areaId));
  }

  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const areasWithObjectives = areas.filter((a) => objectivesList.some((o) => o.areaId === a.id));
  const statsHtml =
    areasWithObjectives.length > 0
      ? areasWithObjectives
          .map((area) => {
            const count = objectivesList.filter((o) => o.areaId === area.id).length;
            const color = area.color || PRINT_BRAND.primary;
            return `<div class="obj-stat-card" style="border-bottom-color: ${color};">
              <div class="obj-stat-number" style="color: ${color};">${count}</div>
              <div class="obj-stat-label">${escapeHtml(area.name || 'Área')}</div>
            </div>`;
          })
          .join('')
      : '';

  const cards = [];
  for (const area of areas) {
    const areaObjectives = objectivesList.filter((o) => o.areaId === area.id);
    const areaColor = area.color || PRINT_BRAND.primary;
    const areaIconSvg = getIconSvg(area.icon || 'Folder', areaColor, 18);

    for (const obj of areaObjectives) {
      const linkedEvents = eventsList
        .filter((e) => e.objectiveId === obj.id)
        .sort((a, b) => (a.start?.getTime?.() ?? 0) - (b.start?.getTime?.() ?? 0));
      const alloc = linkedEvents.filter((e) => e.start).length;
      const total = linkedEvents.length;
      const pct = total > 0 ? Math.round((alloc / total) * 100) : 0;

      const activityItems = linkedEvents.map((e) => {
        const hasDate = e.start;
        const d = hasDate ? (e.start instanceof Date ? e.start : new Date(e.start)) : null;
        const monthShort = d ? MONTH_SHORT[d.getMonth()] : '';
        const day = d ? d.getDate() : '';
        const dateBoxClass = hasDate ? '' : ' no-date';
        const dateBoxInner = hasDate
          ? `<span class="obj-date-month">${monthShort}</span><span class="obj-date-day">${day}</span>`
          : '<span class="obj-date-day">N/A</span>';
        const cat = getCategory(e.categoryId);
        const tagName = cat?.name || (e.tagIds?.length && getTag(e.tagIds[0])?.name) || '—';
        return `<li class="obj-activity-item">
          <div class="obj-date-box${dateBoxClass}">${dateBoxInner}</div>
          <div class="obj-activity-info">
            <div class="obj-activity-name">${escapeHtml(e.title || '—')}</div>
            <div class="obj-activity-meta"><span class="obj-tag">${escapeHtml(tagName)}</span></div>
          </div>
        </li>`;
      });

      const activitiesHtml =
        activityItems.length > 0
          ? `<ul class="obj-activities">${activityItems.join('')}</ul>`
          : '<p style="color:#64748b;font-size:0.85rem;">Nenhuma atividade vinculada.</p>';

      cards.push(`
        <div class="obj-card" style="border-top-color: ${areaColor};">
          <div class="obj-card-header">
            <div>
              <span class="obj-area-badge" style="background-color: ${areaColor};">${escapeHtml(area.name || 'Área')}</span>
              <h3 class="obj-title">${escapeHtml(obj.title || 'Objetivo')}</h3>
            </div>
            <div class="obj-icon">${areaIconSvg}</div>
          </div>
          <div class="obj-progress-container">
            <div class="obj-progress-labels">
              <span>Progresso</span>
              <span><strong>${pct}%</strong> (${alloc}/${total})</span>
            </div>
            <div class="obj-progress-bg">
              <div class="obj-progress-fill" style="width: ${pct}%; background-color: ${areaColor};"></div>
            </div>
          </div>
          ${activitiesHtml}
        </div>`);
    }
  }

  const content =
    cards.length > 0
      ? `<div class="obj-stats-summary">${statsHtml}</div><div class="obj-grid">${cards.join('')}</div>`
      : '<p style="color:#64748b;text-align:center;padding:24px;">Nenhuma área ou objetivo cadastrado.</p>';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Objetivos – ${PRINT_BRAND.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${OBJECTIVES_PRINT_STYLES}</style>
</head>
<body>
  <div class="obj-report-container">
    ${getPrintHeader('Objetivos Maiores')}
    <p class="obj-report-meta">Exportado em ${new Date().toLocaleString('pt-BR')}</p>
    <h1 class="obj-report-title">Painel de Objetivos</h1>
    ${content}
  </div>
</body>
</html>`;

  openPrintWindow(html, `Objetivos – ${PRINT_BRAND.name}`);
}

/**
 * Exporta Gerenciador de Classes: por departamento, classes importadas e não importadas.
 * options: { departmentIds?, classFilter?: 'all' | 'imported' | 'not_imported' }
 */
export function buildClassManagerPrintHtml(
  curriculumClasses,
  allDepartments,
  alreadyImportedClassNames,
  events,
  options = {}
) {
  let classes = curriculumClasses || [];
  let departments = allDepartments || [];
  const importedSet = alreadyImportedClassNames || new Set();

  if (options.departmentIds != null && options.departmentIds.length > 0) {
    departments = departments.filter((d) => options.departmentIds.includes(d.id));
    classes = classes.filter((c) => c.department && options.departmentIds.includes(c.department));
  }
  if (options.classFilter === 'imported') {
    classes = classes.filter((c) => importedSet.has(c.name));
  } else if (options.classFilter === 'not_imported') {
    classes = classes.filter((c) => !importedSet.has(c.name));
  }

  const reqEvents = (events || []).filter((e) => e.type !== 'trash' && e.isRequirement && e.originClassName);
  const byClass = new Map();
  for (const e of reqEvents) {
    if (!byClass.has(e.originClassName)) byClass.set(e.originClassName, []);
    byClass.get(e.originClassName).push(e);
  }

  const getClassStats = (cls) => {
    const classEvs = byClass.get(cls.name) || [];
    const total = classEvs.length;
    const allocated = classEvs.filter((e) => e.start).length;
    const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;
    return { total, allocated, pct };
  };

  const getChapterStats = (cls, chapter) => {
    const classEvs = byClass.get(cls.name) || [];
    const chapterEvs = classEvs.filter((e) => (e.chapter || 'Gerais') === chapter);
    const total = chapterEvs.length;
    const allocated = chapterEvs.filter((e) => e.start).length;
    const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;
    return { total, allocated, pct };
  };

  const deptSections = departments.map((dept) => {
    const deptClasses = classes
      .filter((c) => c.department === dept.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    if (deptClasses.length === 0) return '';

    const classCards = deptClasses.map((cls) => {
      const isImported = importedSet.has(cls.name);
      const { total, allocated, pct } = getClassStats(cls);
      const isComplete = isImported && total > 0 && pct === 100;
      const badgeClass = isImported ? 'badge-imported' : 'badge-pending';
      const badgeLabel = isImported ? (isComplete ? 'Concluída' : 'Importada') : 'Não importada';

      const overallBarFillClass = !isImported || total === 0 ? 'empty' : isComplete ? 'done' : 'pending';
      const overallBarWidth = !isImported || total === 0 ? 0 : pct;
      const overallPctClass = !isImported || total === 0 ? '' : isComplete ? 'done' : 'pending';
      const overallPctText = !isImported || total === 0 ? '—' : `${pct}%`;
      const starSvg = isComplete ? `<span class="star-icon">${getIconSvg('Star', '#d97706', 14)}</span>` : '';
      const overallMeta = isImported && total > 0 ? `${allocated} de ${total} com data` : isImported ? 'Nenhum requisito importado' : 'Não importada';

      const chapters = cls.chapters || [];
      const chapterRows =
        isImported && chapters.length > 0
          ? chapters
            .map((ch) => {
              const chStats = getChapterStats(cls, ch);
              const chPct = chStats.total > 0 ? `${chStats.pct}%` : '—';
              return `<div class="chapter-row"><span style="min-width:100px;">${escapeHtml(ch)}</span><div class="chapter-bar"><div class="chapter-fill" style="width:${chStats.pct}%;"></div></div><span class="chapter-pct">${chPct}</span><span>${chStats.allocated}/${chStats.total}</span></div>`;
            })
            .join('')
          : '';

      const chaptersBlock =
        chapterRows
          ? `<div class="class-chapters"><div class="class-chapters-title">Capítulos</div>${chapterRows}</div>`
          : '';

      return `
        <div class="class-card">
          <div class="class-card-header">
            <span class="area-icon">${getIconSvg('BookOpen', isImported ? PRINT_BRAND.primary : '#94a3b8', 16)}</span>
            <span class="class-card-name">${escapeHtml(cls.name)}</span>
            <span class="class-card-badge ${badgeClass}">${badgeLabel}</span>
          </div>
          <div class="class-overall">
            <div class="class-overall-label">Progresso geral de planejamento</div>
            <div class="class-overall-bar-wrap">
              <div class="class-overall-bar">
                <div class="class-overall-fill ${overallBarFillClass}" style="width:${overallBarWidth}%;"></div>
              </div>
              <span class="class-overall-pct ${overallPctClass}">${overallPctText}${starSvg}</span>
            </div>
            <div class="class-overall-meta">${overallMeta}</div>
          </div>
          ${chaptersBlock}
        </div>`;
    });

    return `
      <h1><span class="area-header"><span class="area-icon">${getIconSvg('FolderOpen', PRINT_BRAND.primary, 16)}</span> ${escapeHtml(dept.name || 'Departamento')}</span></h1>
      <div class="class-cards-list">${classCards.join('')}</div>
    `;
  }).filter(Boolean);

  const content =
    deptSections.length > 0
      ? deptSections.join('')
      : '<p style="color:#64748b;">Nenhum departamento ou classe cadastrada.</p>';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Gerenciador de Classes – ${PRINT_BRAND.name}</title><style>${A4_STYLES}</style></head>
<body>
  <div class="page">
    ${getPrintHeader('Gerenciador de Classes')}
    <p class="meta">Exportado em ${new Date().toLocaleString('pt-BR')}</p>
    <h1>Classes importadas e não importadas</h1>
    ${content}
  </div>
</body>
</html>`;

  openPrintWindow(html, `Gerenciador de Classes – ${PRINT_BRAND.name}`);
}

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

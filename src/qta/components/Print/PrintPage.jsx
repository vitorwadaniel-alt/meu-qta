import { useState } from 'react';
import { Calendar, Target, BookOpen, FileDown } from 'lucide-react';
import {
  buildCalendarPrintHtml,
  buildObjectivesPrintHtml,
  buildClassManagerPrintHtml,
} from '../../utils/printUtils.js';
import PrintOptionsModal from './PrintOptionsModal.jsx';

/**
 * Módulo de impressão – estilo padrão do projeto (sem nitro/turbo).
 * Exporta para HTML em estrutura A4 para impressão e distribuição à equipe.
 * Antes de imprimir, abre modal para o usuário personalizar (meses, categorias, áreas, etc.).
 */
export default function PrintPage({
  events,
  objectives,
  allAreas,
  curriculumClasses,
  allDepartments,
  alreadyImportedClassNames,
  categories,
  tags,
  getCategory,
  getTag,
}) {
  const [printModalType, setPrintModalType] = useState(null);

  const handleOpenPrintOptions = (reportType) => {
    setPrintModalType(reportType);
  };

  const handleConfirmPrint = (reportType, options = {}) => {
    if (reportType === 'calendar') {
      buildCalendarPrintHtml(events || [], getCategory, getTag, options, objectives || []);
    } else if (reportType === 'objectives') {
      buildObjectivesPrintHtml(objectives || [], allAreas || [], events || [], getCategory, getTag, options);
    } else if (reportType === 'classManager') {
      buildClassManagerPrintHtml(
        curriculumClasses || [],
        allDepartments || [],
        alreadyImportedClassNames || new Set(),
        events || [],
        options
      );
    }
    setPrintModalType(null);
  };

  const handleClosePrintModal = () => setPrintModalType(null);

  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      {/* Header estilo padrão – sem nitro/turbo */}
      <div className="p-4 md:p-5 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2 text-slate-700 text-sm mb-1">
          <FileDown size={18} className="text-slate-500 shrink-0" />
          <span>Impressão</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800">Módulo de impressão</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-xl">
          Exporte o conteúdo em HTML formatado para impressão em A4. Use para imprimir e distribuir à equipe do clube.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          {/* Opção: Calendário */}
          <button
            type="button"
            onClick={() => handleOpenPrintOptions('calendar')}
            className="flex flex-col items-start gap-3 p-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800">Calendário</h2>
                <p className="text-xs text-slate-500 mt-0.5">Atividades e requisitos com data</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Lista em tabela: data, hora, título, categoria e tags. Ideal para agenda impressa.
            </p>
          </button>

          {/* Opção: Objetivos */}
          <button
            type="button"
            onClick={() => handleOpenPrintOptions('objectives')}
            className="flex flex-col items-start gap-3 p-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Target className="text-indigo-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800">Objetivos Maiores</h2>
                <p className="text-xs text-slate-500 mt-0.5">Áreas, objetivos e atividades vinculadas</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Por área: objetivos com descrição e lista de atividades vinculadas e progresso.
            </p>
          </button>

          {/* Opção: Gerenciador de Classes */}
          <button
            type="button"
            onClick={() => handleOpenPrintOptions('classManager')}
            className="flex flex-col items-start gap-3 p-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                <BookOpen className="text-cyan-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800">Gerenciador de Classes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Classes importadas e não importadas</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Por departamento: lista de classes, status (importada ou não) e progresso dos requisitos.
            </p>
          </button>
        </div>

        <p className="mt-6 text-xs text-slate-500 max-w-xl">
          Cada opção abre um popup para você escolher o que incluir na impressão (meses, categorias, áreas, etc.).
          Depois, uma nova aba é aberta com o HTML pronto para impressão (Ctrl+P / Cmd+P). O layout é otimizado para
          papel A4.
        </p>
      </div>

      <PrintOptionsModal
        isOpen={printModalType != null}
        onClose={handleClosePrintModal}
        reportType={printModalType}
        onConfirm={(options) => handleConfirmPrint(printModalType, options)}
        events={events}
        categories={categories || []}
        tags={tags || []}
        allAreas={allAreas || []}
        allDepartments={allDepartments || []}
        alreadyImportedClassNames={alreadyImportedClassNames}
        curriculumClasses={curriculumClasses || []}
      />
    </div>
  );
}

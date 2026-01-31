import { ChevronRight } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from '../Modal.jsx';

export default function ImportClassesModal({
  isOpen,
  onClose,
  importStep,
  setImportStep,
  selectedImportDept,
  setSelectedImportDept,
  selectedImportClasses,
  setSelectedImportClasses,
  allDepartments,
  curriculumClasses,
  alreadyImportedClassNames,
  onImport,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Requisitos de Classe"
      footer={
        importStep === 'class' && selectedImportClasses.length > 0 ? (
          <>
            <Button variant="ghost" onClick={() => { setImportStep('dept'); setSelectedImportClasses([]); }}>Voltar</Button>
            <Button onClick={onImport}>
              Importar {selectedImportClasses.length} classe(s)
            </Button>
          </>
        ) : null
      }
    >
      {allDepartments.length === 0 ? (
        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Carregando departamentos...
        </div>
      ) : (
        <div className="space-y-5">
          {importStep === 'class' && selectedImportDept && (
            <div className="flex items-center gap-2 text-sm text-slate-600 pb-3 border-b border-slate-200">
              <button
                onClick={() => { setImportStep('dept'); setSelectedImportClasses([]); }}
                className="hover:text-blue-600 font-medium transition-colors"
              >
                Departamentos
              </button>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="font-medium text-slate-800">{allDepartments.find(d => d.id === selectedImportDept)?.name}</span>
            </div>
          )}

          {importStep === 'dept' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 mb-3">Escolha o departamento:</p>
              <div className="space-y-2">
                {allDepartments.map(dept => {
                  const deptClasses = curriculumClasses.filter(c => c.department === dept.id);
                  const totalReqs = deptClasses.reduce((sum, c) => sum + (c.requirements?.length || 0), 0);
                  return (
                    <button
                      key={dept.id}
                      onClick={() => {
                        setSelectedImportDept(dept.id);
                        setImportStep('class');
                        setSelectedImportClasses([]);
                      }}
                      className="w-full text-left p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                        <span className="text-xs text-slate-500">{deptClasses.length} classe(s) · {totalReqs} requisito(s)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {importStep === 'class' && selectedImportDept && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-slate-700">Selecione as classes:</p>
                {selectedImportClasses.length > 0 && (
                  <button
                    onClick={() => setSelectedImportClasses([])}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Desmarcar todas
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {curriculumClasses
                  .filter(c => c.department === selectedImportDept)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(cls => {
                    const isSelected = selectedImportClasses.includes(cls.id);
                    const isAlreadyImported = alreadyImportedClassNames.has(cls.name);
                    const chapters = cls.chapters || [];
                    const totalReqs = (cls.requirements || []).length;
                    return (
                      <label
                        key={cls.id}
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50/70' : isAlreadyImported ? 'border-slate-200 bg-slate-50/80 opacity-70' : 'border-slate-200 hover:bg-slate-50/80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isAlreadyImported}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedImportClasses([...selectedImportClasses, cls.id]);
                            } else {
                              setSelectedImportClasses(selectedImportClasses.filter(id => id !== cls.id));
                            }
                          }}
                          className="mt-0.5 h-4 w-4 text-blue-600 rounded border-slate-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <div>
                              <h3 className="font-semibold text-slate-800">{cls.name}</h3>
                              {isAlreadyImported && (
                                <span className="text-xs text-orange-600 font-medium">Já importada</span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 shrink-0">{chapters.length} cap. · {totalReqs} req.</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {chapters.slice(0, 5).map(chap => {
                              const reqsInChap = (cls.requirements || []).filter(r => r.chapter === chap).length;
                              return (
                                <span key={chap} className="text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                                  {chap} ({reqsInChap})
                                </span>
                              );
                            })}
                            {chapters.length > 5 && <span className="text-xs text-slate-400">+{chapters.length - 5}</span>}
                          </div>
                        </div>
                      </label>
                    );
                  })}
              </div>
              {curriculumClasses.filter(c => c.department === selectedImportDept).length === 0 && (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhuma classe neste departamento.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

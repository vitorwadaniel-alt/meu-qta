import { Edit3, Folder, Plus, Trash2, X } from 'lucide-react';
import Button from '../Button.jsx';

export default function AdminClassesTab({
  allDepartments,
  activeDept,
  currentDeptConfig,
  filteredClasses,
  selectedClass,
  newChapterName,
  onDeptSelect,
  onAddClass,
  onClassSelect,
  onEditClass,
  onDeleteClass,
  onChapterAdd,
  onChapterDelete,
  onChapterNameChange,
  onReqAdd,
  onReqEdit,
  onReqDelete,
}) {
  return (
    <div className="flex h-full gap-4">
      <div className="w-64 border-r border-gray-100 pr-2 flex flex-col">
        <div className="mb-4">
          <div className="text-xs font-bold uppercase text-gray-500 mb-2 px-1">Departamentos</div>
          <div className="flex flex-col gap-1">
            {allDepartments.length === 0 ? (
              <div className="text-xs text-gray-400 italic p-2">Carregando departamentos...</div>
            ) : (
              allDepartments.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => onDeptSelect(dept.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeDept === dept.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {dept.name}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase text-gray-600">
            {currentDeptConfig?.name || 'Selecione um departamento'}
          </span>
          {activeDept && (
            <Button size="sm" onClick={onAddClass}>
              <Plus size={14} aria-hidden />
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {!activeDept ? (
            <div className="text-xs text-gray-400 italic p-2 text-center">Selecione um departamento para ver as classes</div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-xs text-gray-400 italic p-2 text-center">Nenhuma classe neste departamento</div>
          ) : (
            filteredClasses.map((cls) => (
              <div
                key={cls.id}
                role="button"
                tabIndex={0}
                onClick={() => onClassSelect(cls)}
                onKeyDown={(e) => e.key === 'Enter' && onClassSelect(cls)}
                className={`p-2 rounded border cursor-pointer text-sm ${
                  selectedClass?.id === cls.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cls.color || '#ccc' }} />
                  <span className="truncate flex-1">{cls.name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedClass ? (
          <>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-gray-800">{selectedClass.name}</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => onEditClass(selectedClass)}>
                  <Edit3 size={14} aria-hidden />
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDeleteClass(selectedClass.id)}>
                  <Trash2 size={14} aria-hidden />
                </Button>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex gap-2 mb-2 items-center">
                <Folder size={14} className="text-gray-400 shrink-0" aria-hidden />
                <span className="text-xs font-bold text-gray-500 uppercase">Capítulos</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(selectedClass.chapters || []).map((c) => (
                  <span key={c} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1 group">
                    {c}{' '}
                    <button
                      type="button"
                      onClick={() => onChapterDelete(c)}
                      className="hidden group-hover:block text-red-500"
                      aria-label={`Excluir capítulo ${c}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    className="border rounded text-xs p-1 w-24"
                    placeholder="Novo..."
                    value={newChapterName}
                    onChange={(e) => onChapterNameChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onChapterAdd()}
                  />
                  <button type="button" onClick={onChapterAdd} className="text-blue-600" aria-label="Adicionar capítulo">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Requisitos</span>
                <button
                  type="button"
                  onClick={onReqAdd}
                  className="text-blue-600 text-xs font-bold"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1">
                {(selectedClass.requirements || []).map((r, i) => (
                  <div key={`${r.chapter}-${r.title}-${i}`} className="text-sm border p-2 rounded flex justify-between group hover:bg-gray-50">
                    <div>
                      <div className="text-xs text-gray-400">{r.chapter}</div>
                      <div className="font-medium">{r.title}</div>
                    </div>
                    <div className="hidden group-hover:flex gap-1">
                      <button
                        type="button"
                        onClick={() => onReqEdit(r, i)}
                        aria-label="Editar requisito"
                      >
                        <Edit3 size={14} className="text-gray-400 hover:text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onReqDelete(i)}
                        aria-label="Excluir requisito"
                      >
                        <Trash2 size={14} className="text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Selecione uma classe</div>
        )}
      </div>
    </div>
  );
}

import { BookOpen, FolderTree, Tag, UserPlus } from 'lucide-react';

const TABS = [
  { id: 'requests', label: 'Solicitações', icon: UserPlus },
  { id: 'classes', label: 'Currículo / Classes', icon: BookOpen },
  { id: 'categories', label: 'Categorias do Sistema', icon: Tag },
  { id: 'areas', label: 'Áreas do Clube', icon: FolderTree },
];

export default function AdminTabNav({ activeTab, onTabChange }) {
  return (
    <nav className="w-52 min-w-[180px] border-r border-gray-200 pr-4 flex flex-col gap-1 shrink-0">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${
            activeTab === id ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Icon size={18} className="shrink-0" aria-hidden />
          {label}
        </button>
      ))}
    </nav>
  );
}

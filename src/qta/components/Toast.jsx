import { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`fixed bottom-4 right-4 ${bgColors[type] || 'bg-gray-800'} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[60] animate-in slide-in-from-bottom-5`}>
      {type === 'success' && <CheckCircle size={18} />}
      {type === 'error' && <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

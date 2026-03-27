import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
  };

  const Icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <XCircle className="text-rose-500" size={20} />,
  };

  return (
    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-in slide-in-from-right-10 duration-300 ${styles[type]}`}>
      {Icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button 
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Toast, type ToastType } from '../../components/admin/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
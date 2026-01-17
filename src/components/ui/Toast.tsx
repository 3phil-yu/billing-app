import { useState, useEffect, type ReactNode, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // 自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 使用 setTimeout 来避免直接在 effect 中调用 setState
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const getColorClass = (type: ToastType) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-blue-500';
    }
  };

  const renderIcon = () => {
    switch (toast.type) {
      case 'success': 
        return <CheckCircle className={`w-5 h-5 mt-0.5 ${getColorClass(toast.type)}`} />;
      case 'error': 
        return <AlertCircle className={`w-5 h-5 mt-0.5 ${getColorClass(toast.type)}`} />;
      case 'warning': 
        return <AlertCircle className={`w-5 h-5 mt-0.5 ${getColorClass(toast.type)}`} />;
      case 'info': 
        return <Info className={`w-5 h-5 mt-0.5 ${getColorClass(toast.type)}`} />;
      default: 
        return <Info className={`w-5 h-5 mt-0.5 ${getColorClass(toast.type)}`} />;
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full bg-card border border-border rounded-lg shadow-lg p-4
        transform transition-all duration-200 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        {renderIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-card-foreground">{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-muted-foreground mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="关闭通知"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
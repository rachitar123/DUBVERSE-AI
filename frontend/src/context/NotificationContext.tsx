import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  // ── Listen for window-level toast events (e.g. from Axios 401 interceptor) ──
  React.useEffect(() => {
    const handler = (e: Event) => {
      const { title, message, type } = (e as CustomEvent).detail;
      showToast(title, message, type ?? 'error');
    };
    window.addEventListener('dubverse:show-toast', handler);
    return () => window.removeEventListener('dubverse:show-toast', handler);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-2xl border glass-card transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'border-rose-500/40 text-rose-300'
                : 'border-indigo-500/40 text-indigo-300'
            }`}
          >
            <div className="mr-3 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
            </div>
            <div className="flex-1 mr-2">
              <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};

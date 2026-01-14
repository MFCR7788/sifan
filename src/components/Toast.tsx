'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message }]);

    // 3秒后自动关闭
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-white rounded-xl shadow-lg border border-gray-100 px-6 py-4 min-w-[320px] max-w-md animate-in slide-in-from-right-full fade-in duration-300"
          >
            {toast.type === 'success' ? (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex-1 text-sm font-medium text-gray-900">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

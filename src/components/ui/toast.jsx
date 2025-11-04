import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      ...toast,
      duration: toast.duration || 3000,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // 自动移除Toast
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value = {
    toast: addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const { title, description, variant = 'default' } = toast;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          title: 'text-green-800 dark:text-green-200',
          description: 'text-green-700 dark:text-green-300',
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          title: 'text-red-800 dark:text-red-200',
          description: 'text-red-700 dark:text-red-300',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          title: 'text-yellow-800 dark:text-yellow-200',
          description: 'text-yellow-700 dark:text-yellow-300',
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          title: 'text-blue-800 dark:text-blue-200',
          description: 'text-blue-700 dark:text-blue-300',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`max-w-sm w-full ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 animate-in slide-in-from-top-5 duration-300`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {styles.icon}
        <div className="flex-1">
          {title && (
            <h3 className={`font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          {description && (
            <p className={`text-sm mt-1 ${styles.description}`}>
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

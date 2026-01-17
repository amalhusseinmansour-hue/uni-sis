import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ToastItemProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onRemove: (id: string) => void;
  isRTL: boolean;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, type, message, duration = 5000, onRemove, isRTL }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          handleRemove();
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(id), 300);
  };

  const getIcon = () => {
    const iconClasses = 'w-5 h-5';
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-500`} />;
      case 'error':
        return <XCircle className={`${iconClasses} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-amber-500`} />;
      case 'info':
        return <Info className={`${iconClasses} text-blue-500`} />;
      default:
        return <Info className={`${iconClasses} text-blue-500`} />;
    }
  };

  const getStyles = () => {
    const base = 'bg-white dark:bg-slate-800 border shadow-lg';
    switch (type) {
      case 'success':
        return `${base} border-green-200 dark:border-green-800`;
      case 'error':
        return `${base} border-red-200 dark:border-red-800`;
      case 'warning':
        return `${base} border-amber-200 dark:border-amber-800`;
      case 'info':
        return `${base} border-blue-200 dark:border-blue-800`;
      default:
        return `${base} border-slate-200 dark:border-slate-700`;
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success': return 'bg-green-100 dark:bg-green-900/30';
      case 'error': return 'bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/30';
      default: return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl ${getStyles()}
        transform transition-all duration-300 ease-out
        ${isExiting
          ? `opacity-0 ${isRTL ? '-translate-x-full' : 'translate-x-full'}`
          : `opacity-100 translate-x-0 ${isRTL ? 'animate-slide-in-left' : 'animate-slide-in-right'}`
        }
      `}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 p-2 rounded-lg ${getIconBg()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {message}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 start-0 end-0 h-1 bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Standalone Toast function for use outside React components
export const toast = {
  _showToast: null as ((type: 'success' | 'error' | 'warning' | 'info', message: string) => void) | null,

  success: (message: string) => toast._showToast?.('success', message),
  error: (message: string) => toast._showToast?.('error', message),
  warning: (message: string) => toast._showToast?.('warning', message),
  info: (message: string) => toast._showToast?.('info', message),
};

const Toast: React.FC = () => {
  const { state, dispatch, showToast } = useApp();
  const { toasts } = state;
  const isRTL = state.language === 'ar';

  // Register the showToast function for standalone use
  useEffect(() => {
    toast._showToast = showToast;
    return () => {
      toast._showToast = null;
    };
  }, [showToast]);

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed bottom-4 z-50 flex flex-col gap-3 max-w-md w-full px-4 ${isRTL ? 'start-4' : 'end-4'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          id={t.id}
          type={t.type}
          message={t.message}
          duration={t.duration}
          onRemove={removeToast}
          isRTL={isRTL}
        />
      ))}
    </div>
  );
};

// Export a ToastProvider wrapper that includes the Toast component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toast />
    </>
  );
};

export default Toast;

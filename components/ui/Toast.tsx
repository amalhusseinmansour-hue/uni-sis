import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import {
  ToastProvider as BaseToastProvider,
  useToast,
  toast,
  ToastContext,
  type ToastItem,
  type ToastPosition,
  type ToastType,
  type ToastOptions,
  type ToastContextType,
} from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';

// ============================================================================
// Toast Item Component
// ============================================================================

interface ToastItemComponentProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
  isRTL: boolean;
  position: ToastPosition;
}

const ToastItemComponent: React.FC<ToastItemComponentProps> = ({
  toast: toastItem,
  onRemove,
  isRTL,
  position,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [progress, setProgress] = useState(100);

  const { id, type, message, title, duration = 5000, dismissible = true } = toastItem;

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss timer with progress
  useEffect(() => {
    if (duration <= 0) return;

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
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  // Animation classes based on position and direction
  const getAnimationClass = () => {
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    const isCenter = position.includes('center');

    if (isExiting) {
      if (isCenter) {
        return 'opacity-0 scale-95';
      }
      if (isRTL) {
        return isLeft ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full';
      }
      return isRight ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full';
    }

    if (isEntering) {
      if (isCenter) {
        return 'opacity-0 scale-95';
      }
      if (isRTL) {
        return isLeft ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full';
      }
      return isRight ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full';
    }

    return 'opacity-100 translate-x-0 scale-100';
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl ${getStyles()}
        transform transition-all duration-300 ease-out
        ${getAnimationClass()}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 p-2 rounded-lg ${getIconBg()}`}>{getIcon()}</div>
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
              {title}
            </p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
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

// ============================================================================
// Toast Container
// ============================================================================

interface ToastContainerProps {
  toasts: ToastItem[];
  position: ToastPosition;
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, position, onRemove }) => {
  // Detect RTL
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const checkRTL = () => {
      setIsRTL(document.documentElement.dir === 'rtl');
    };

    checkRTL();

    // Watch for direction changes
    const observer = new MutationObserver(checkRTL);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });

    return () => observer.disconnect();
  }, []);

  if (toasts.length === 0) return null;

  const getPositionClasses = () => {
    const base = 'fixed z-50 flex flex-col gap-3 max-w-md w-full px-4';

    switch (position) {
      case 'top-left':
        return `${base} top-4 start-4`;
      case 'top-center':
        return `${base} top-4 left-1/2 -translate-x-1/2`;
      case 'top-right':
        return `${base} top-4 end-4`;
      case 'bottom-left':
        return `${base} bottom-4 start-4`;
      case 'bottom-center':
        return `${base} bottom-4 left-1/2 -translate-x-1/2`;
      case 'bottom-right':
      default:
        return `${base} bottom-4 end-4`;
    }
  };

  // Reverse order for top positions so newest appears at top
  const orderedToasts = position.startsWith('top') ? [...toasts].reverse() : toasts;

  return (
    <div className={getPositionClasses()} dir={isRTL ? 'rtl' : 'ltr'}>
      {orderedToasts.map((t) => (
        <ToastItemComponent
          key={t.id}
          toast={t}
          onRemove={onRemove}
          isRTL={isRTL}
          position={position}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Toast Provider (with Container)
// ============================================================================

interface ToastProviderProps {
  children: React.ReactNode;
  /** Default position for toasts (default: 'bottom-right') */
  defaultPosition?: ToastPosition;
  /** Maximum number of toasts to show at once (default: 5) */
  defaultMaxToasts?: number;
  /** Default duration in milliseconds (default: 5000). Set to 0 for no auto-dismiss */
  defaultDuration?: number;
}

/**
 * Toast Provider component that wraps your app to provide toast functionality
 *
 * @example
 * ```tsx
 * import { ToastProvider } from './components/ui/Toast';
 *
 * function App() {
 *   return (
 *     <ToastProvider defaultPosition="bottom-right" defaultDuration={5000}>
 *       <YourApp />
 *     </ToastProvider>
 *   );
 * }
 * ```
 */
const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'bottom-right',
  defaultMaxToasts = 5,
  defaultDuration = 5000,
}) => {
  return (
    <BaseToastProvider
      defaultPosition={defaultPosition}
      defaultMaxToasts={defaultMaxToasts}
      defaultDuration={defaultDuration}
    >
      <ToastProviderInner>{children}</ToastProviderInner>
    </BaseToastProvider>
  );
};

// Inner component to access the toast context
const ToastProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, position, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </>
  );
};

// ============================================================================
// Legacy Toast Component (for backward compatibility with AppContext)
// ============================================================================

/**
 * Legacy Toast component that integrates with AppContext
 * Use this if you're using the existing AppContext-based toast system
 */
const LegacyToast: React.FC = () => {
  const { state, dispatch, showToast } = useApp();
  const { toasts } = state;
  const isRTL = state.language === 'ar';

  // Register the showToast function for standalone use (legacy)
  useEffect(() => {
    // Only register if the new toast system isn't available
    if (!toast._addToast) {
      toast._addToast = (type, message, options) => {
        showToast(type, message, options?.duration);
        return `legacy-${Date.now()}`;
      };
    }
    return () => {
      if (toast._addToast) {
        toast._addToast = null;
      }
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
        <ToastItemComponent
          key={t.id}
          toast={{
            ...t,
            dismissible: true,
          }}
          onRemove={removeToast}
          isRTL={isRTL}
          position={isRTL ? 'bottom-left' : 'bottom-right'}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

// Default export for backward compatibility
export default LegacyToast;

// Named exports
export {
  ToastProvider,
  ToastContainer,
  ToastItemComponent,
  ToastContext,
  useToast,
  toast,
};

// Re-export types
export type { ToastItem, ToastPosition, ToastType, ToastOptions, ToastContextType };

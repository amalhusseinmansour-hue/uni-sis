import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import Button from './Button';

// Types
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  icon?: ReactNode;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  isLoading: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// Context
const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

// Default translations
const defaultTranslations = {
  confirm: { en: 'Confirm', ar: 'تأكيد' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  close: { en: 'Close', ar: 'إغلاق' },
};

// Hook to detect RTL
function useRTL(): boolean {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Check document direction
    const checkRTL = () => {
      setIsRTL(document.documentElement.dir === 'rtl');
    };

    checkRTL();

    // Observe changes to the dir attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'dir') {
          checkRTL();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });

    return () => observer.disconnect();
  }, []);

  return isRTL;
}

// Dialog Component
interface ConfirmDialogInternalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  icon?: ReactNode;
  isLoading?: boolean;
  isRTL?: boolean;
}

const ConfirmDialogInternal: React.FC<ConfirmDialogInternalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  danger = false,
  variant = 'info',
  icon,
  isLoading = false,
  isRTL = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonContainerRef = useRef<HTMLDivElement>(null);

  // Determine the actual variant (danger prop takes precedence)
  const effectiveVariant = danger ? 'danger' : variant;

  // Default texts based on variant
  const defaultConfirmText = effectiveVariant === 'danger'
    ? (isRTL ? defaultTranslations.delete.ar : defaultTranslations.delete.en)
    : (isRTL ? defaultTranslations.confirm.ar : defaultTranslations.confirm.en);
  const defaultCancelText = isRTL ? defaultTranslations.cancel.ar : defaultTranslations.cancel.en;

  // Get icon based on variant
  const getIcon = () => {
    if (icon) return icon;

    const iconClass = 'w-6 h-6';
    switch (effectiveVariant) {
      case 'danger':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      case 'info':
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  // Get icon background based on variant
  const getIconBg = () => {
    switch (effectiveVariant) {
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30';
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  // Get confirm button variant
  const getButtonVariant = (): 'danger' | 'primary' => {
    switch (effectiveVariant) {
      case 'danger':
        return 'danger';
      case 'warning':
      case 'info':
      default:
        return 'primary';
    }
  };

  // Handle close with animation
  const handleClose = useCallback(() => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose, isLoading]);

  // Handle confirm
  const handleConfirm = useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        handleClose();
      } else if (e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, handleClose, handleConfirm]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus the confirm button on open
  useEffect(() => {
    if (isOpen && confirmButtonContainerRef.current) {
      const timer = setTimeout(() => {
        const button = confirmButtonContainerRef.current?.querySelector('button');
        button?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        ${isClosing ? 'pointer-events-none' : ''}
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Overlay */}
      <div
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm
          transition-opacity duration-200 ease-out
          ${isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in'}
        `}
        onClick={handleOverlayClick}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`
          relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
          transition-all duration-200 ease-out
          ${isClosing
            ? 'opacity-0 scale-95'
            : 'opacity-100 scale-100 animate-in zoom-in-95 fade-in'
          }
        `}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className={`
            absolute top-4 ${isRTL ? 'left-4' : 'right-4'}
            p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl
            transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={isRTL ? defaultTranslations.close.ar : defaultTranslations.close.en}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${getIconBg()} flex items-center justify-center mb-4`}>
            {getIcon()}
          </div>

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="confirm-dialog-description"
            className="text-slate-600 dark:text-slate-300 leading-relaxed"
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div
          className={`
            flex items-center gap-3 p-4 border-t border-slate-100 dark:border-slate-700
            bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl
            ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}
          `}
        >
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {cancelText || defaultCancelText}
          </Button>
          <div ref={confirmButtonContainerRef}>
            <Button
              variant={getButtonVariant()}
              onClick={handleConfirm}
              loading={isLoading}
            >
              {confirmText || defaultConfirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Provider Component
interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    isLoading: false,
    title: '',
    message: '',
    resolve: null,
  });

  const isRTL = useRTL();

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        isLoading: false,
        resolve,
        ...options,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({
      ...prev,
      isOpen: false,
      isLoading: false,
      resolve: null,
    }));
  }, [state.resolve]);

  const handleConfirm = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 100));

    state.resolve?.(true);
    setState((prev) => ({
      ...prev,
      isOpen: false,
      isLoading: false,
      resolve: null,
    }));
  }, [state.resolve]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialogInternal
        isOpen={state.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        danger={state.danger}
        variant={state.variant}
        icon={state.icon}
        isLoading={state.isLoading}
        isRTL={isRTL}
      />
    </ConfirmContext.Provider>
  );
};

// Hook
export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const context = useContext(ConfirmContext);

  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }

  return context.confirm;
}

// Standalone ConfirmDialog component for direct usage
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  icon?: ReactNode;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  danger = false,
  variant = 'info',
  icon,
  loading = false,
}) => {
  const isRTL = useRTL();
  const [internalLoading, setInternalLoading] = useState(false);

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <ConfirmDialogInternal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      danger={danger}
      variant={variant}
      icon={icon}
      isLoading={loading || internalLoading}
      isRTL={isRTL}
    />
  );
};

export default ConfirmDialog;

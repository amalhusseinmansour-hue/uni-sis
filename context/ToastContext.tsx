import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

// ============================================================================
// Toast State & Reducer
// ============================================================================

interface ToastState {
  toasts: ToastItem[];
  position: ToastPosition;
  maxToasts: number;
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: ToastItem }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_POSITION'; payload: ToastPosition }
  | { type: 'SET_MAX_TOASTS'; payload: number };

const initialState: ToastState = {
  toasts: [],
  position: 'bottom-right',
  maxToasts: 5,
};

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      const newToasts = [...state.toasts, action.payload];
      // Keep only the latest maxToasts
      return {
        ...state,
        toasts: newToasts.slice(-state.maxToasts),
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        toasts: [],
      };

    case 'SET_POSITION':
      return {
        ...state,
        position: action.payload,
      };

    case 'SET_MAX_TOASTS':
      return {
        ...state,
        maxToasts: action.payload,
      };

    default:
      return state;
  }
}

// ============================================================================
// Context Type
// ============================================================================

export interface ToastContextType {
  toasts: ToastItem[];
  position: ToastPosition;
  // Core methods
  addToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  // Configuration
  setPosition: (position: ToastPosition) => void;
  setMaxToasts: (max: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================================================
// Standalone Toast API (for use outside React components)
// ============================================================================

export const toast = {
  _addToast: null as ((type: ToastType, message: string, options?: ToastOptions) => string) | null,
  _removeToast: null as ((id: string) => void) | null,

  /**
   * Show a success toast notification
   * @param message - The message to display
   * @param options - Optional configuration (title, duration, dismissible)
   * @returns Toast ID for programmatic dismissal
   */
  success: (message: string, options?: ToastOptions) =>
    toast._addToast?.('success', message, options),

  /**
   * Show an error toast notification
   * @param message - The message to display
   * @param options - Optional configuration (title, duration, dismissible)
   * @returns Toast ID for programmatic dismissal
   */
  error: (message: string, options?: ToastOptions) =>
    toast._addToast?.('error', message, options),

  /**
   * Show a warning toast notification
   * @param message - The message to display
   * @param options - Optional configuration (title, duration, dismissible)
   * @returns Toast ID for programmatic dismissal
   */
  warning: (message: string, options?: ToastOptions) =>
    toast._addToast?.('warning', message, options),

  /**
   * Show an info toast notification
   * @param message - The message to display
   * @param options - Optional configuration (title, duration, dismissible)
   * @returns Toast ID for programmatic dismissal
   */
  info: (message: string, options?: ToastOptions) =>
    toast._addToast?.('info', message, options),

  /**
   * Programmatically dismiss a toast by ID
   * @param id - The toast ID to dismiss
   */
  dismiss: (id: string) => toast._removeToast?.(id),
};

// ============================================================================
// Toast Provider
// ============================================================================

interface ToastProviderProps {
  children: ReactNode;
  /** Default position for toasts (default: 'bottom-right') */
  defaultPosition?: ToastPosition;
  /** Maximum number of toasts to show at once (default: 5) */
  defaultMaxToasts?: number;
  /** Default duration in milliseconds (default: 5000). Set to 0 for no auto-dismiss */
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'bottom-right',
  defaultMaxToasts = 5,
  defaultDuration = 5000,
}) => {
  const [state, dispatch] = useReducer(toastReducer, {
    ...initialState,
    position: defaultPosition,
    maxToasts: defaultMaxToasts,
  });

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions): string => {
      const id = generateId();
      const toastItem: ToastItem = {
        id,
        type,
        message,
        title: options?.title,
        duration: options?.duration ?? defaultDuration,
        dismissible: options?.dismissible ?? true,
      };
      dispatch({ type: 'ADD_TOAST', payload: toastItem });
      return id;
    },
    [defaultDuration, generateId]
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const success = useCallback(
    (message: string, options?: ToastOptions) => addToast('success', message, options),
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => addToast('error', message, options),
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => addToast('warning', message, options),
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => addToast('info', message, options),
    [addToast]
  );

  const setPosition = useCallback((position: ToastPosition) => {
    dispatch({ type: 'SET_POSITION', payload: position });
  }, []);

  const setMaxToasts = useCallback((max: number) => {
    dispatch({ type: 'SET_MAX_TOASTS', payload: max });
  }, []);

  // Register global toast function
  useEffect(() => {
    toast._addToast = addToast;
    toast._removeToast = removeToast;
    return () => {
      toast._addToast = null;
      toast._removeToast = null;
    };
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts: state.toasts,
        position: state.position,
        addToast,
        removeToast,
        clearAll,
        success,
        error,
        warning,
        info,
        setPosition,
        setMaxToasts,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

// ============================================================================
// useToast Hook
// ============================================================================

/**
 * Hook to access toast notification functionality
 * Must be used within a ToastProvider
 *
 * @example
 * ```tsx
 * const { success, error, warning, info } = useToast();
 *
 * // Show a success toast
 * success('Operation completed successfully!');
 *
 * // Show an error toast with title
 * error('Failed to save changes', { title: 'Error' });
 *
 * // Show a persistent toast (no auto-dismiss)
 * info('Important message', { duration: 0 });
 * ```
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;

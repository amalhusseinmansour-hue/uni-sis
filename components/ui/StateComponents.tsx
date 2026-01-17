import React from 'react';
import {
  AlertCircle, RefreshCw, WifiOff, ServerCrash, FileQuestion,
  Lock, Clock, CheckCircle, XCircle, Loader2, Search, Inbox,
  Database, CloudOff, ShieldAlert, AlertTriangle
} from 'lucide-react';
import Button from './Button';

interface StateComponentProps {
  lang?: 'en' | 'ar';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
}

// Loading Spinner Component
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'text-blue-600', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${color} animate-spin`} />
    </div>
  );
};

// Full Page Loading
export const PageLoading: React.FC<{
  lang?: 'en' | 'ar';
  message?: string;
  className?: string;
}> = ({ lang = 'ar', message, className = '' }) => (
  <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
    <div className="relative">
      <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full"></div>
      <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
    <p className="mt-4 text-slate-600 animate-pulse">
      {message || (lang === 'ar' ? 'جاري التحميل...' : 'Loading...')}
    </p>
  </div>
);

// Skeleton Loading for Cards
export const CardSkeleton: React.FC<{
  lines?: number;
  hasImage?: boolean;
  className?: string;
}> = ({ lines = 3, hasImage = false, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 p-4 animate-pulse ${className}`}>
    {hasImage && (
      <div className="w-full h-32 bg-slate-200 rounded-lg mb-4"></div>
    )}
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="h-3 bg-slate-200 rounded w-full"></div>
      ))}
      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded flex-1"></div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b border-slate-100 flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-slate-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Stats Skeleton
export const StatsSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 4, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${count} gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Error State Component
export const ErrorState: React.FC<StateComponentProps & {
  errorCode?: string | number;
  errorType?: 'network' | 'server' | 'notFound' | 'unauthorized' | 'timeout' | 'general';
}> = ({
  lang = 'ar',
  title,
  message,
  onRetry,
  onBack,
  className = '',
  errorCode,
  errorType = 'general',
}) => {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: WifiOff,
          color: 'text-orange-600',
          bg: 'bg-orange-100',
          defaultTitle: lang === 'ar' ? 'لا يوجد اتصال بالإنترنت' : 'No Internet Connection',
          defaultMessage: lang === 'ar' ? 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى' : 'Check your internet connection and try again',
        };
      case 'server':
        return {
          icon: ServerCrash,
          color: 'text-red-600',
          bg: 'bg-red-100',
          defaultTitle: lang === 'ar' ? 'خطأ في الخادم' : 'Server Error',
          defaultMessage: lang === 'ar' ? 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً' : 'A server error occurred. Please try again later',
        };
      case 'notFound':
        return {
          icon: FileQuestion,
          color: 'text-slate-600',
          bg: 'bg-slate-100',
          defaultTitle: lang === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found',
          defaultMessage: lang === 'ar' ? 'الصفحة التي تبحث عنها غير موجودة' : 'The page you are looking for does not exist',
        };
      case 'unauthorized':
        return {
          icon: Lock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          defaultTitle: lang === 'ar' ? 'غير مصرح' : 'Unauthorized',
          defaultMessage: lang === 'ar' ? 'ليس لديك صلاحية الوصول لهذه الصفحة' : 'You do not have permission to access this page',
        };
      case 'timeout':
        return {
          icon: Clock,
          color: 'text-purple-600',
          bg: 'bg-purple-100',
          defaultTitle: lang === 'ar' ? 'انتهى وقت الطلب' : 'Request Timeout',
          defaultMessage: lang === 'ar' ? 'استغرق الطلب وقتاً طويلاً. يرجى المحاولة مرة أخرى' : 'The request took too long. Please try again',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          defaultTitle: lang === 'ar' ? 'حدث خطأ' : 'Something went wrong',
          defaultMessage: lang === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى' : 'An unexpected error occurred. Please try again',
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className={`w-16 h-16 rounded-full ${config.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${config.color}`} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 text-center">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-slate-500 text-center mt-2 max-w-md">
        {message || config.defaultMessage}
      </p>
      {errorCode && (
        <p className="text-xs text-slate-400 mt-2">
          {lang === 'ar' ? `رمز الخطأ: ${errorCode}` : `Error Code: ${errorCode}`}
        </p>
      )}
      <div className="flex gap-3 mt-6">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            {lang === 'ar' ? 'رجوع' : 'Go Back'}
          </Button>
        )}
        {onRetry && (
          <Button variant="primary" icon={RefreshCw} onClick={onRetry}>
            {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        )}
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState: React.FC<StateComponentProps & {
  emptyType?: 'noData' | 'noResults' | 'noItems' | 'noMessages';
  actionLabel?: string;
  onAction?: () => void;
}> = ({
  lang = 'ar',
  title,
  message,
  className = '',
  emptyType = 'noData',
  actionLabel,
  onAction,
}) => {
  const getEmptyConfig = () => {
    switch (emptyType) {
      case 'noResults':
        return {
          icon: Search,
          defaultTitle: lang === 'ar' ? 'لا توجد نتائج' : 'No Results Found',
          defaultMessage: lang === 'ar' ? 'حاول تغيير معايير البحث' : 'Try adjusting your search criteria',
        };
      case 'noItems':
        return {
          icon: Inbox,
          defaultTitle: lang === 'ar' ? 'لا توجد عناصر' : 'No Items',
          defaultMessage: lang === 'ar' ? 'لم يتم إضافة أي عناصر بعد' : 'No items have been added yet',
        };
      case 'noMessages':
        return {
          icon: Inbox,
          defaultTitle: lang === 'ar' ? 'لا توجد رسائل' : 'No Messages',
          defaultMessage: lang === 'ar' ? 'صندوق الوارد فارغ' : 'Your inbox is empty',
        };
      default:
        return {
          icon: Database,
          defaultTitle: lang === 'ar' ? 'لا توجد بيانات' : 'No Data Available',
          defaultMessage: lang === 'ar' ? 'لا توجد بيانات لعرضها حالياً' : 'There is no data to display at this time',
        };
    }
  };

  const config = getEmptyConfig();
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 text-center">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-slate-500 text-center mt-2 max-w-md">
        {message || config.defaultMessage}
      </p>
      {onAction && actionLabel && (
        <Button variant="primary" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Success State Component
export const SuccessState: React.FC<StateComponentProps & {
  actionLabel?: string;
  onAction?: () => void;
}> = ({
  lang = 'ar',
  title,
  message,
  className = '',
  actionLabel,
  onAction,
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
      <CheckCircle className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 text-center">
      {title || (lang === 'ar' ? 'تمت العملية بنجاح' : 'Success!')}
    </h3>
    <p className="text-sm text-slate-500 text-center mt-2 max-w-md">
      {message || (lang === 'ar' ? 'تمت العملية المطلوبة بنجاح' : 'The operation was completed successfully')}
    </p>
    {onAction && actionLabel && (
      <Button variant="primary" className="mt-6" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

// Offline State Component
export const OfflineState: React.FC<StateComponentProps> = ({
  lang = 'ar',
  onRetry,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <CloudOff className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 text-center">
      {lang === 'ar' ? 'أنت غير متصل بالإنترنت' : "You're Offline"}
    </h3>
    <p className="text-sm text-slate-500 text-center mt-2 max-w-md">
      {lang === 'ar'
        ? 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
        : 'Check your internet connection and try again'}
    </p>
    {onRetry && (
      <Button variant="primary" icon={RefreshCw} className="mt-6" onClick={onRetry}>
        {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
      </Button>
    )}
  </div>
);

// Maintenance State Component
export const MaintenanceState: React.FC<StateComponentProps> = ({
  lang = 'ar',
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
      <ShieldAlert className="w-8 h-8 text-yellow-600" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 text-center">
      {lang === 'ar' ? 'صيانة مجدولة' : 'Scheduled Maintenance'}
    </h3>
    <p className="text-sm text-slate-500 text-center mt-2 max-w-md">
      {lang === 'ar'
        ? 'النظام قيد الصيانة حالياً. يرجى العودة لاحقاً'
        : 'The system is currently under maintenance. Please check back later'}
    </p>
  </div>
);

// Warning State Component
export const WarningState: React.FC<StateComponentProps & {
  actionLabel?: string;
  onAction?: () => void;
}> = ({
  lang = 'ar',
  title,
  message,
  className = '',
  actionLabel,
  onAction,
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
      <AlertTriangle className="w-8 h-8 text-yellow-600" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 text-center">
      {title || (lang === 'ar' ? 'تحذير' : 'Warning')}
    </h3>
    <p className="text-sm text-slate-500 text-center mt-2 max-w-md">
      {message || (lang === 'ar' ? 'يرجى الانتباه لهذه الملاحظة' : 'Please pay attention to this notice')}
    </p>
    {onAction && actionLabel && (
      <Button variant="warning" className="mt-6" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

// Inline Loading Component
export const InlineLoading: React.FC<{
  text?: string;
  className?: string;
}> = ({ text, className = '' }) => (
  <div className={`flex items-center gap-2 text-slate-500 ${className}`}>
    <Loader2 className="w-4 h-4 animate-spin" />
    {text && <span className="text-sm">{text}</span>}
  </div>
);

// Inline Error Component
export const InlineError: React.FC<{
  message: string;
  onRetry?: () => void;
  className?: string;
}> = ({ message, onRetry, className = '' }) => (
  <div className={`flex items-center gap-2 text-red-600 ${className}`}>
    <AlertCircle className="w-4 h-4 flex-shrink-0" />
    <span className="text-sm">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm underline hover:no-underline ms-2"
      >
        <RefreshCw className="w-3 h-3 inline" />
      </button>
    )}
  </div>
);

export default {
  LoadingSpinner,
  PageLoading,
  CardSkeleton,
  TableSkeleton,
  StatsSkeleton,
  ErrorState,
  EmptyState,
  SuccessState,
  OfflineState,
  MaintenanceState,
  WarningState,
  InlineLoading,
  InlineError,
};

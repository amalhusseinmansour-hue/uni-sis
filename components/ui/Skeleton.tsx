import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  animation = 'pulse',
  width,
  height,
}) => {
  const baseClasses = 'bg-slate-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  if (variant === 'text' && !height) style.height = '1em';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton variant="text" width="100%" height={14} />
      <Skeleton variant="text" width="80%" height={14} />
      <Skeleton variant="text" width="90%" height={14} />
    </div>
  </div>
);

// Stat Card Skeleton
export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
    <div className="flex items-center gap-3">
      <Skeleton variant="rounded" width={40} height={40} />
      <div className="space-y-2">
        <Skeleton variant="text" width={60} height={12} />
        <Skeleton variant="text" width={40} height={20} />
      </div>
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    <div className="p-4 border-b border-slate-100">
      <Skeleton variant="text" width={150} height={20} />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton variant="text" width="80%" height={14} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="p-4">
                  <Skeleton variant="text" width={colIndex === 0 ? '90%' : '70%'} height={14} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({
  items = 5,
  className = '',
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="p-4 flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={14} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
        <Skeleton variant="rounded" width={60} height={24} />
      </div>
    ))}
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC<{ type?: 'bar' | 'line' | 'pie'; className?: string }> = ({
  type = 'bar',
  className = '',
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
    <Skeleton variant="text" width={150} height={20} className="mb-4" />
    {type === 'bar' && (
      <div className="flex items-end justify-around h-48 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={30}
            height={Math.random() * 120 + 40}
            className="flex-1"
          />
        ))}
      </div>
    )}
    {type === 'line' && (
      <div className="h-48 flex items-center justify-center">
        <Skeleton variant="rounded" width="100%" height="100%" />
      </div>
    )}
    {type === 'pie' && (
      <div className="h-48 flex items-center justify-center">
        <Skeleton variant="circular" width={180} height={180} />
      </div>
    )}
  </div>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
    <div className="flex items-center gap-6 mb-6">
      <Skeleton variant="circular" width={96} height={96} />
      <div className="space-y-3">
        <Skeleton variant="text" width={200} height={24} />
        <Skeleton variant="text" width={150} height={16} />
        <Skeleton variant="text" width={100} height={14} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width={80} height={12} />
          <Skeleton variant="text" width="90%" height={14} />
        </div>
      ))}
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({
  fields = 4,
  className = '',
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 ${className}`}>
    <Skeleton variant="text" width={200} height={24} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width={100} height={14} />
          <Skeleton variant="rounded" width="100%" height={40} />
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-3">
      <Skeleton variant="rounded" width={100} height={40} />
      <Skeleton variant="rounded" width={120} height={40} />
    </div>
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    {/* Stats Row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton type="bar" />
      <ChartSkeleton type="pie" />
    </div>

    {/* Table */}
    <TableSkeleton rows={5} columns={5} />
  </div>
);

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC<{ type?: 'dashboard' | 'table' | 'form' | 'profile' }> = ({
  type = 'dashboard',
}) => {
  switch (type) {
    case 'table':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width={200} height={28} />
            <Skeleton variant="rounded" width={120} height={40} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex gap-4">
              <Skeleton variant="rounded" width={200} height={40} />
              <Skeleton variant="rounded" width={120} height={40} />
              <Skeleton variant="rounded" width={120} height={40} />
            </div>
          </div>
          <TableSkeleton rows={8} columns={6} />
        </div>
      );
    case 'form':
      return (
        <div className="space-y-6 max-w-2xl mx-auto">
          <Skeleton variant="text" width={250} height={32} />
          <FormSkeleton fields={6} />
        </div>
      );
    case 'profile':
      return (
        <div className="space-y-6">
          <ProfileSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      );
    default:
      return <DashboardSkeleton />;
  }
};

// Inline Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Full Page Loading
export const FullPageLoading: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <LoadingSpinner size="lg" />
    {message && <p className="mt-4 text-slate-600 font-medium">{message}</p>}
  </div>
);

// Button Loading State
export const ButtonLoading: React.FC<{
  children: React.ReactNode;
  loading: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ children, loading, className = '', disabled, onClick }) => (
  <button
    className={`relative ${className}`}
    disabled={loading || disabled}
    onClick={onClick}
  >
    <span className={loading ? 'invisible' : ''}>{children}</span>
    {loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </span>
    )}
  </button>
);

export default Skeleton;

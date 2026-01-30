import React from 'react';
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// Linear Progress Bar
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gradient';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-600',
  gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {showLabel && <span className="text-sm text-slate-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`
            ${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500
            ${animated ? 'animate-pulse' : ''}
            ${striped ? 'bg-stripes' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular Progress
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  trackColor = '#E2E8F0',
  showValue = true,
  label,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-slate-500 mt-1">{label}</span>}
        </div>
      )}
    </div>
  );
};

// Stats Card
interface StatProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'slate';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const statColorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  purple: 'bg-purple-100 text-purple-600',
  slate: 'bg-slate-100 text-slate-600',
};

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  trend,
  className = '',
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 ${className}`}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className={`p-2 rounded-lg ${statColorClasses[color]}`}>
            {icon}
          </div>
        )}
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
        {changeLabel && (
          <p className="text-xs text-slate-400 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
};

// Mini Stats Row
interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export const MiniStat: React.FC<MiniStatProps> = ({
  label,
  value,
  icon,
  color = 'text-blue-600',
}) => (
  <div className="flex items-center gap-3">
    {icon && <div className={color}>{icon}</div>}
    <div>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

// Progress Steps
interface Step {
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressStepsProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  orientation = 'horizontal',
  className = '',
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`${isHorizontal ? 'flex items-start' : 'space-y-4'} ${className}`}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`
            flex ${isHorizontal ? 'flex-col items-center flex-1' : 'items-start gap-4'}
            ${index < steps.length - 1 && isHorizontal ? 'relative' : ''}
          `}
        >
          {/* Connector line (horizontal) */}
          {index < steps.length - 1 && isHorizontal && (
            <div
              className={`
                absolute top-4 start-1/2 w-full h-0.5
                ${step.status === 'completed' ? 'bg-blue-600' : 'bg-slate-200'}
              `}
            />
          )}

          {/* Step indicator */}
          <div
            className={`
              relative z-10 w-8 h-8 rounded-full flex items-center justify-center
              ${step.status === 'completed' ? 'bg-blue-600 text-white' : ''}
              ${step.status === 'current' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
              ${step.status === 'upcoming' ? 'bg-slate-200 text-slate-500' : ''}
            `}
          >
            {step.status === 'completed' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>

          {/* Connector line (vertical) */}
          {index < steps.length - 1 && !isHorizontal && (
            <div
              className={`
                absolute start-4 top-10 w-0.5 h-8 -translate-x-1/2
                ${step.status === 'completed' ? 'bg-blue-600' : 'bg-slate-200'}
              `}
            />
          )}

          {/* Step content */}
          <div className={`${isHorizontal ? 'mt-2 text-center' : ''}`}>
            <p className={`text-sm font-medium ${step.status === 'upcoming' ? 'text-slate-500' : 'text-slate-800'}`}>
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Goal Progress
interface GoalProgressProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  className?: string;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  title,
  current,
  target,
  unit = '',
  icon,
  color = 'blue',
  className = '',
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className={statColorClasses[color]}>{icon}</div>}
          <h4 className="font-medium text-slate-800">{title}</h4>
        </div>
        {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-slate-800">
          {current.toLocaleString()}{unit}
        </span>
        <span className="text-sm text-slate-500">
          / {target.toLocaleString()}{unit}
        </span>
      </div>
      <ProgressBar value={percentage} color={color} size="sm" />
    </div>
  );
};

// Metric Card with Trend
interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  change,
  status = 'neutral',
  icon,
  footer,
  className = '',
}) => {
  const statusConfig = {
    success: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle },
    error: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle },
    neutral: { color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        {icon ? (
          <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>{icon}</div>
        ) : (
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
          </div>
        )}
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold text-slate-800">{value}</span>
        {previousValue && (
          <span className="text-sm text-slate-400 ms-2">from {previousValue}</span>
        )}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(change)}% from last period</span>
        </div>
      )}
      {footer && <div className="mt-4 pt-4 border-t border-slate-100">{footer}</div>}
    </div>
  );
};

export default ProgressBar;

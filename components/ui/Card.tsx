import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hover = false }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden
        ${hover ? 'hover:shadow-md hover:border-slate-300 transition-all cursor-pointer' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600 bg-blue-50',
  action,
  className = '',
}) => {
  return (
    <div className={`p-3 sm:p-5 border-b border-slate-100 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {Icon && (
            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl flex-shrink-0 ${iconColor}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">{title}</h3>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};

interface CardBodyProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '', noPadding = false }) => {
  return <div className={`${noPadding ? '' : 'p-5'} ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-5 py-4 bg-slate-50 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  );
};

// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600 bg-blue-50',
  trend,
  className = '',
}) => {
  return (
    <Card className={className}>
      <CardBody className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5 sm:mt-1">{value}</p>
            {subtitle && <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                <span className="text-slate-400 font-normal hidden sm:inline">vs last period</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${iconColor}`}>
              <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Gradient Card
interface GradientCardProps {
  children: ReactNode;
  gradient?: string;
  className?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  gradient = 'from-blue-600 to-indigo-600',
  className = '',
}) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-4 sm:p-6 text-white ${className}`}>
      {children}
    </div>
  );
};

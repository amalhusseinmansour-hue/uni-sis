import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  Bell,
  Megaphone,
  ArrowRight,
} from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    iconColor: 'text-yellow-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  action,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        flex gap-3 p-4 rounded-xl border
        ${config.bg} ${config.border}
        ${className}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        {icon || <Icon className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-medium mb-1 ${config.text}`}>{title}</h4>
        )}
        <div className={`text-sm ${config.text} opacity-90`}>{children}</div>
        {action && (
          <button
            onClick={action.onClick}
            className={`mt-3 text-sm font-medium ${config.text} hover:underline flex items-center gap-1`}
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ${config.iconColor} hover:opacity-70`}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

// Inline Alert (smaller, for forms)
interface InlineAlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = 'error',
  children,
  className = '',
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 text-sm ${config.text} ${className}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
};

// Banner (full-width, sticky)
interface BannerProps {
  variant?: AlertVariant | 'primary' | 'dark';
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top' | 'bottom';
  sticky?: boolean;
  className?: string;
}

const bannerVariants = {
  info: 'bg-blue-600 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-500 text-yellow-900',
  error: 'bg-red-600 text-white',
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
  dark: 'bg-slate-800 text-white',
};

export const Banner: React.FC<BannerProps> = ({
  variant = 'primary',
  children,
  icon,
  dismissible = false,
  onDismiss,
  action,
  position = 'top',
  sticky = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${bannerVariants[variant]}
        ${sticky ? `fixed ${position}-0 start-0 end-0 z-50` : ''}
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            {icon || <Megaphone className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm font-medium">{children}</p>
          </div>
          <div className="flex items-center gap-3">
            {action && (
              <button
                onClick={action.onClick}
                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                {action.label}
              </button>
            )}
            {dismissible && (
              <button onClick={handleDismiss} className="hover:opacity-70">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Callout (highlighted info box)
interface CalloutProps {
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'info' | 'tip' | 'warning' | 'danger';
  className?: string;
}

const calloutConfig = {
  default: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: Info,
    iconBg: 'bg-slate-200',
    iconColor: 'text-slate-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  tip: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
};

export const Callout: React.FC<CalloutProps> = ({
  title,
  children,
  icon,
  variant = 'default',
  className = '',
}) => {
  const config = calloutConfig[variant];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-4 ${className}`}>
      <div className="flex gap-4">
        <div className={`p-2 rounded-lg ${config.iconBg} ${config.iconColor} flex-shrink-0 h-fit`}>
          {icon || <Icon className="w-5 h-5" />}
        </div>
        <div>
          {title && (
            <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
          )}
          <div className="text-sm text-slate-600">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Notification Badge Alert
interface NotificationAlertProps {
  title: string;
  message: string;
  time?: string;
  avatar?: React.ReactNode;
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
}

export const NotificationAlert: React.FC<NotificationAlertProps> = ({
  title,
  message,
  time,
  avatar,
  onClose,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`
        flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-slate-200
        ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {avatar || (
        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-800 truncate">{title}</h4>
        <p className="text-sm text-slate-500 line-clamp-2">{message}</p>
        {time && <p className="text-xs text-slate-400 mt-1">{time}</p>}
      </div>
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

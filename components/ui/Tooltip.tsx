import React, { useState, useRef, useEffect } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipVariant = 'dark' | 'light';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  variant = 'dark',
  delay = 200,
  disabled = false,
  className = '',
  contentClassName = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - padding;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + padding;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - padding;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + padding;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Keep tooltip within viewport
    x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

    setCoords({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  const variantClasses = {
    dark: 'bg-slate-800 text-white',
    light: 'bg-white text-slate-800 shadow-lg border border-slate-200',
  };

  const arrowClasses = {
    dark: 'border-slate-800',
    light: 'border-white',
  };

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 start-1/2 -translate-x-1/2 translate-y-full border-t-8 border-x-8 border-x-transparent border-b-0';
      case 'bottom':
        return 'top-0 start-1/2 -translate-x-1/2 -translate-y-full border-b-8 border-x-8 border-x-transparent border-t-0';
      case 'left':
        return 'end-0 top-1/2 -translate-y-1/2 translate-x-full border-l-8 border-y-8 border-y-transparent border-r-0';
      case 'right':
        return 'start-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-8 border-y-8 border-y-transparent border-l-0';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: coords.x,
            top: coords.y,
            zIndex: 9999,
          }}
          className={`
            px-3 py-2 text-sm rounded-lg
            ${variantClasses[variant]}
            animate-in fade-in-0 zoom-in-95 duration-150
            ${contentClassName}
          `}
        >
          {content}
          <div className={`absolute w-0 h-0 ${getArrowPosition()} ${arrowClasses[variant]}`} />
        </div>
      )}
    </>
  );
};

// Info Tooltip (with icon)
interface InfoTooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  iconClassName?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  position = 'top',
  variant = 'dark',
  iconClassName = '',
}) => (
  <Tooltip content={content} position={position} variant={variant}>
    <button className={`text-slate-400 hover:text-slate-600 ${iconClassName}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  </Tooltip>
);

// Popover (click-based tooltip)
interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
  contentClassName?: string;
  closeOnClickOutside?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({
  content,
  children,
  position = 'bottom',
  className = '',
  contentClassName = '',
  closeOnClickOutside = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeOnClickOutside]);

  const positionClasses = {
    top: 'bottom-full mb-2 start-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 start-1/2 -translate-x-1/2',
    left: 'right-full me-2 top-1/2 -translate-y-1/2',
    right: 'left-full ms-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {children}
      </div>
      {isOpen && (
        <div
          className={`
            absolute z-50 min-w-[200px]
            bg-white rounded-xl shadow-lg border border-slate-200
            p-4 ${positionClasses[position]}
            animate-in fade-in-0 zoom-in-95 duration-150
            ${contentClassName}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Hover Card
interface HoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom';
  delay?: number;
  className?: string;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  trigger,
  content,
  position = 'bottom',
  delay = 300,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      {isOpen && (
        <div
          className={`
            absolute start-0 z-50 w-80
            bg-white rounded-xl shadow-xl border border-slate-200
            ${positionClasses[position]}
            animate-in fade-in-0 slide-in-from-top-2 duration-200
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;

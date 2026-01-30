import React, { useState, createContext, useContext, useRef, useEffect } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: 'default' | 'pills' | 'underline' | 'boxed';
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
};

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'boxed';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  orientation = 'horizontal',
  className = '',
  children,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  const activeTab = value !== undefined ? value : internalValue;
  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant, orientation }}>
      <div className={`${orientation === 'vertical' ? 'flex gap-6' : ''} ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className = '', children }) => {
  const { variant, orientation } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const baseClasses = orientation === 'vertical' ? 'flex flex-col' : 'flex';

  const variantClasses = {
    default: orientation === 'vertical'
      ? 'border-r border-slate-200 pe-4 gap-1'
      : 'border-b border-slate-200 gap-1',
    pills: 'bg-slate-100 p-1 rounded-lg gap-1',
    underline: 'gap-4 relative',
    boxed: 'border border-slate-200 rounded-lg p-1 gap-1',
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  disabled = false,
  icon,
  badge,
  className = '',
  children,
}) => {
  const { activeTab, setActiveTab, variant, orientation } = useTabsContext();
  const isActive = activeTab === value;

  const baseClasses = 'flex items-center gap-2 font-medium transition-all duration-200 whitespace-nowrap';

  const sizeClasses = orientation === 'vertical'
    ? 'px-4 py-2 w-full justify-start'
    : 'px-4 py-2';

  const variantClasses = {
    default: `${
      isActive
        ? `text-blue-600 ${orientation === 'vertical' ? 'border-r-2 border-blue-600 -me-px' : 'border-b-2 border-blue-600 -mb-px'}`
        : 'text-slate-600 hover:text-slate-800'
    }`,
    pills: `rounded-md ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`,
    underline: `pb-3 ${
      isActive
        ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
        : 'text-slate-600 hover:text-slate-800 border-b-2 border-transparent'
    }`,
    boxed: `rounded-md ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`,
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={`
        ${baseClasses}
        ${sizeClasses}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge && <span className="flex-shrink-0">{badge}</span>}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  forceMount?: boolean;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className = '',
  children,
  forceMount = false,
}) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!forceMount && !isActive) return null;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      className={`
        ${isActive ? 'animate-in fade-in-0 duration-200' : 'hidden'}
        focus:outline-none
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Simple Tab component for standalone use
interface SimpleTabsProps {
  tabs: {
    value: string;
    label: string;
    labelAr?: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
  defaultValue?: string;
  lang?: 'en' | 'ar';
  variant?: 'default' | 'pills' | 'underline' | 'boxed';
  className?: string;
  contentClassName?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
  tabs,
  defaultValue,
  lang = 'en',
  variant = 'default',
  className = '',
  contentClassName = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value || '');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} variant={variant} className={className}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            icon={tab.icon}
            badge={tab.badge}
          >
            {lang === 'ar' && tab.labelAr ? tab.labelAr : tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className={contentClassName}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Scrollable tabs for mobile
interface ScrollableTabsProps {
  tabs: {
    value: string;
    label: string;
    labelAr?: string;
    icon?: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  lang?: 'en' | 'ar';
  className?: string;
}

export const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  lang = 'en',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      const containerWidth = container.offsetWidth;
      const activeLeft = active.offsetLeft;
      const activeWidth = active.offsetWidth;

      const scrollTo = activeLeft - containerWidth / 2 + activeWidth / 2;
      container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className={`flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mx-4 px-4 ${className}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            ref={isActive ? activeRef : null}
            onClick={() => onTabChange(tab.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
            `}
          >
            {tab.icon}
            <span>{lang === 'ar' && tab.labelAr ? tab.labelAr : tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;

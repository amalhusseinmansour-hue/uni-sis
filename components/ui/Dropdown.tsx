import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedValue?: string;
  onSelect?: (value: string) => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown component');
  }
  return context;
};

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  className = '',
  asChild = false,
}) => {
  const { isOpen, setIsOpen } = useDropdownContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => setIsOpen(!isOpen),
      'aria-expanded': isOpen,
    });
  }

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      className={className}
    >
      {children}
    </button>
  );
};

interface DropdownMenuProps {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  align = 'start',
  className = '',
}) => {
  const { isOpen } = useDropdownContext();

  if (!isOpen) return null;

  const alignClasses = {
    start: 'start-0',
    end: 'end-0',
    center: 'start-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`
        absolute top-full mt-1 z-50 min-w-[160px]
        bg-white rounded-lg shadow-lg border border-slate-200
        py-1 animate-in fade-in-0 zoom-in-95 duration-150
        ${alignClasses[align]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  icon,
  onClick,
  disabled = false,
  destructive = false,
  className = '',
}) => {
  const { setIsOpen } = useDropdownContext();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      setIsOpen(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-2 text-sm text-start transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${destructive ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0 w-4 h-4">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
};

export const DropdownSeparator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`my-1 border-t border-slate-200 ${className}`} />
);

interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownLabel: React.FC<DropdownLabelProps> = ({ children, className = '' }) => (
  <div className={`px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide ${className}`}>
    {children}
  </div>
);

// Simple Select Dropdown
interface SelectOption {
  value: string;
  label: string;
  labelAr?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectDropdownProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  placeholderAr?: string;
  lang?: 'en' | 'ar';
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  placeholderAr = 'اختر...',
  lang = 'en',
  disabled = false,
  className = '',
  triggerClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRTL = lang === 'ar';
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption
    ? lang === 'ar' && selectedOption.labelAr
      ? selectedOption.labelAr
      : selectedOption.label
    : lang === 'ar'
    ? placeholderAr
    : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-2
          bg-white border border-slate-300 rounded-lg
          text-sm text-start transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          ${triggerClassName}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>{displayText}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`
            absolute top-full mt-1 z-50 w-full
            bg-white rounded-lg shadow-lg border border-slate-200
            py-1 max-h-60 overflow-auto
            animate-in fade-in-0 zoom-in-95 duration-150
          `}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                if (!option.disabled) {
                  onChange?.(option.value);
                  setIsOpen(false);
                }
              }}
              disabled={option.disabled}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-2 text-sm text-start transition-colors
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}
                ${value === option.value ? 'bg-blue-50 text-blue-600' : 'text-slate-700'}
              `}
            >
              <div className="flex items-center gap-2">
                {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                <span>{lang === 'ar' && option.labelAr ? option.labelAr : option.label}</span>
              </div>
              {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Action Menu (for table actions, etc.)
interface ActionMenuItem {
  label: string;
  labelAr?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
  lang?: 'en' | 'ar';
  align?: 'start' | 'end';
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  trigger,
  lang = 'en',
  align = 'end',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        {trigger || (
          <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className={`
            absolute top-full mt-1 z-50 min-w-[160px]
            bg-white rounded-lg shadow-lg border border-slate-200
            py-1 animate-in fade-in-0 zoom-in-95 duration-150
            ${align === 'end' ? 'end-0' : 'start-0'}
          `}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-sm text-start transition-colors
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${item.destructive ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}
              `}
            >
              {item.icon && <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>}
              <span>{lang === 'ar' && item.labelAr ? item.labelAr : item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  titleAr?: string;
  date: Date;
  endDate?: Date;
  color?: string;
  type?: string;
  location?: string;
  description?: string;
}

interface CalendarProps {
  lang?: 'en' | 'ar';
  events?: CalendarEvent[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const t = {
  months: {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  },
  weekdays: {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ar: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
  },
  today: { en: 'Today', ar: 'اليوم' },
  noEvents: { en: 'No events', ar: 'لا توجد أحداث' },
};

export const Calendar: React.FC<CalendarProps> = ({
  lang = 'en',
  events = [],
  selectedDate,
  onDateSelect,
  onEventClick,
  minDate,
  maxDate,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const isRTL = lang === 'ar';

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = useMemo(() => getDaysInMonth(viewDate), [viewDate]);

  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setViewDate(new Date());
    onDateSelect?.(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <button
          onClick={isRTL ? goToNextMonth : goToPreviousMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {t.months[lang][viewDate.getMonth()]} {viewDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {t.today[lang]}
          </button>
        </div>
        <button
          onClick={isRTL ? goToPreviousMonth : goToNextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {t.weekdays[lang].map((day, index) => (
          <div
            key={index}
            className="py-3 text-center text-sm font-medium text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 p-2">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayEvents = getEventsForDate(date);
          const disabled = isDisabled(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && onDateSelect?.(date)}
              disabled={disabled}
              className={`
                aspect-square p-1 m-0.5 rounded-lg flex flex-col items-center justify-start
                transition-colors relative
                ${isToday(date) ? 'bg-blue-600 text-white' : ''}
                ${isSelected(date) && !isToday(date) ? 'bg-blue-100 text-blue-600' : ''}
                ${!isToday(date) && !isSelected(date) && !disabled ? 'hover:bg-slate-100' : ''}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className={`text-sm font-medium ${isToday(date) ? '' : 'text-slate-700'}`}>
                {date.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: event.color || '#3B82F6' }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Mini Calendar (compact version)
interface MiniCalendarProps {
  lang?: 'en' | 'ar';
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  lang = 'en',
  selectedDate,
  onDateSelect,
  className = '',
}) => {
  return (
    <Calendar
      lang={lang}
      selectedDate={selectedDate}
      onDateSelect={onDateSelect}
      className={`text-xs ${className}`}
    />
  );
};

// Event List
interface EventListProps {
  events: CalendarEvent[];
  lang?: 'en' | 'ar';
  onEventClick?: (event: CalendarEvent) => void;
  emptyMessage?: string;
  className?: string;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  lang = 'en',
  onEventClick,
  emptyMessage,
  className = '',
}) => {
  if (events.length === 0) {
    return (
      <div className={`text-center py-8 text-slate-500 ${className}`}>
        {emptyMessage || t.noEvents[lang]}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {events.map((event) => (
        <button
          key={event.id}
          onClick={() => onEventClick?.(event)}
          className="w-full flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors text-start"
        >
          <div
            className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
            style={{ backgroundColor: event.color || '#3B82F6' }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-800 truncate">
              {lang === 'ar' && event.titleAr ? event.titleAr : event.title}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {event.date.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {event.location && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Date Picker
interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  placeholderAr?: string;
  lang?: 'en' | 'ar';
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  placeholderAr = 'اختر التاريخ',
  lang = 'en',
  minDate,
  maxDate,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = lang === 'ar';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`relative ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-2.5
          bg-white border border-slate-300 rounded-lg text-sm
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>
          {value ? formatDate(value) : (lang === 'ar' ? placeholderAr : placeholder)}
        </span>
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 z-50">
            <Calendar
              lang={lang}
              selectedDate={value}
              onDateSelect={(date) => {
                onChange?.(date);
                setIsOpen(false);
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Date Range Picker
interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onRangeChange?: (start: Date, end: Date) => void;
  lang?: 'en' | 'ar';
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onRangeChange,
  lang = 'en',
  className = '',
}) => {
  const [start, setStart] = useState<Date | undefined>(startDate);
  const [end, setEnd] = useState<Date | undefined>(endDate);

  const handleStartChange = (date: Date) => {
    setStart(date);
    if (end && date <= end) {
      onRangeChange?.(date, end);
    }
  };

  const handleEndChange = (date: Date) => {
    setEnd(date);
    if (start && date >= start) {
      onRangeChange?.(start, date);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <DatePicker
        value={start}
        onChange={handleStartChange}
        placeholder="Start date"
        placeholderAr="تاريخ البدء"
        lang={lang}
        maxDate={end}
        className="flex-1"
      />
      <span className="text-slate-400">—</span>
      <DatePicker
        value={end}
        onChange={handleEndChange}
        placeholder="End date"
        placeholderAr="تاريخ الانتهاء"
        lang={lang}
        minDate={start}
        className="flex-1"
      />
    </div>
  );
};

export default Calendar;

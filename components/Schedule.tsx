import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, BookOpen } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  titleAr?: string;
  instructor: string;
  location: string;
  startTime: string;
  endTime: string;
  day: number; // 0 = Sunday, 1 = Monday, etc.
  color: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'exam' | 'office_hours';
}

interface ScheduleProps {
  lang: 'en' | 'ar';
  events: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ lang, events, onEventClick }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });

  const days = lang === 'ar'
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysShort = lang === 'ar'
    ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  const formatTime = (hour: number) => {
    if (lang === 'ar') {
      const period = hour >= 12 ? 'م' : 'ص';
      const h = hour > 12 ? hour - 12 : hour;
      return `${h}:00 ${period}`;
    }
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour > 12 ? hour - 12 : hour;
    return `${h}:00 ${period}`;
  };

  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventPosition = (event: ScheduleEvent) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);

    const top = ((startHour - 7) * 60 + startMin) * (60 / 60); // 60px per hour
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (60 / 60);

    return { top, height };
  };

  const getEventsByDay = (dayIndex: number) => {
    return events.filter(event => event.day === dayIndex);
  };

  const typeLabels: Record<string, { en: string; ar: string }> = {
    lecture: { en: 'Lecture', ar: 'محاضرة' },
    lab: { en: 'Lab', ar: 'معمل' },
    tutorial: { en: 'Tutorial', ar: 'تمارين' },
    exam: { en: 'Exam', ar: 'اختبار' },
    office_hours: { en: 'Office Hours', ar: 'ساعات مكتبية' },
  };

  const monthNames = lang === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === 'ar' ? 'الجدول الأسبوعي' : 'Weekly Schedule'}
          </h2>
          <span className="text-sm text-slate-500">{formatDateRange()}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {lang === 'ar' ? 'اليوم' : 'Today'}
          </button>
          <button
            onClick={prevWeek}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-slate-200">
            <div className="p-3 bg-slate-50"></div>
            {weekDates.map((date, index) => (
              <div
                key={index}
                className={`p-3 text-center border-l border-slate-200 ${
                  isToday(date) ? 'bg-blue-50' : 'bg-slate-50'
                }`}
              >
                <div className="text-xs font-medium text-slate-500 uppercase">{days[index]}</div>
                <div
                  className={`text-lg font-bold mt-1 ${
                    isToday(date) ? 'text-blue-600' : 'text-slate-800'
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-slate-100">
                <div className="p-2 text-xs text-slate-400 text-end pe-3 bg-slate-50">
                  {formatTime(hour)}
                </div>
                {weekDates.map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`h-[60px] border-l border-slate-100 relative ${
                      isToday(weekDates[dayIndex]) ? 'bg-blue-50/30' : ''
                    }`}
                  />
                ))}
              </div>
            ))}

            {/* Events */}
            {weekDates.map((_, dayIndex) => (
              <React.Fragment key={dayIndex}>
                {getEventsByDay(dayIndex).map((event) => {
                  const { top, height } = getEventPosition(event);
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`absolute rounded-lg p-2 mx-1 overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${event.color}`}
                      style={{
                        top: `${top + 45}px`, // Offset for header
                        height: `${height - 4}px`,
                        left: `calc(${(dayIndex + 1) * 12.5}% + 4px)`,
                        width: 'calc(12.5% - 12px)',
                      }}
                    >
                      <div className="text-xs font-bold truncate">
                        {lang === 'ar' && event.titleAr ? event.titleAr : event.title}
                      </div>
                      <div className="text-xs opacity-80 truncate mt-0.5">
                        {event.startTime} - {event.endTime}
                      </div>
                      {height > 50 && (
                        <div className="text-xs opacity-70 truncate mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-xs text-slate-600">{typeLabels.lecture[lang]}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs text-slate-600">{typeLabels.lab[lang]}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-xs text-slate-600">{typeLabels.tutorial[lang]}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-slate-600">{typeLabels.exam[lang]}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-xs text-slate-600">{typeLabels.office_hours[lang]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini Calendar for sidebar
interface MiniCalendarProps {
  lang: 'en' | 'ar';
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  highlightedDates?: Date[];
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  lang,
  selectedDate = new Date(),
  onDateSelect,
  highlightedDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysShort = lang === 'ar'
    ? ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const monthNames = lang === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isHighlighted = (date: Date | null) => {
    if (!date) return false;
    return highlightedDates.some(d => d.toDateString() === date.toDateString());
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm font-bold text-slate-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysShort.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <button
            key={index}
            onClick={() => date && onDateSelect?.(date)}
            disabled={!date}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
              ${!date ? 'invisible' : ''}
              ${isToday(date) ? 'bg-blue-100 text-blue-700 font-bold' : ''}
              ${isSelected(date) && !isToday(date) ? 'bg-blue-600 text-white font-bold' : ''}
              ${isHighlighted(date) && !isToday(date) && !isSelected(date) ? 'bg-green-100 text-green-700' : ''}
              ${!isToday(date) && !isSelected(date) && !isHighlighted(date) ? 'text-slate-700 hover:bg-slate-100' : ''}
            `}
          >
            {date?.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Schedule;

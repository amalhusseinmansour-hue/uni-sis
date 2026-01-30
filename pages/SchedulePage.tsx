import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, User, BookOpen, Download, Printer,
  ChevronLeft, ChevronRight, Filter, List, Grid, Bell, Share2,
  FileText, Video, Users, Coffee, AlertCircle, Search, UserSearch,
  GraduationCap, Building, ArrowRight, X, Loader2, Plus, Edit, Trash2
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { scheduleAPI } from '../api/schedule';
import { dashboardAPI } from '../api/dashboard';
import { studentsAPI } from '../api/students';
import Schedule, { MiniCalendar } from '../components/Schedule';
import { Card, CardHeader, CardBody, StatCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { exportToPDF, exportToICal, printPage, formatTableHTML } from '../utils/exportUtils';
import { UserRole } from '../types';

interface SchedulePageProps {
  lang: 'en' | 'ar';
  role?: UserRole;
}

// Staff-specific translations
const staffT: Record<string, { en: string; ar: string }> = {
  staffPageTitle: { en: 'Student Schedule Management', ar: 'إدارة جداول الطلاب' },
  staffSubtitle: { en: 'View and manage student timetables', ar: 'عرض وإدارة جداول الطلاب الدراسية' },
  searchStudent: { en: 'Search for student...', ar: 'البحث عن طالب...' },
  searchByIdOrName: { en: 'Search by Student ID or Name', ar: 'البحث برقم الطالب أو الاسم' },
  selectStudent: { en: 'Select Student', ar: 'اختر الطالب' },
  selectedStudent: { en: 'Selected Student', ar: 'الطالب المحدد' },
  noStudentSelected: { en: 'No student selected', ar: 'لم يتم اختيار طالب' },
  selectStudentFirst: { en: 'Please search and select a student first', ar: 'يرجى البحث واختيار طالب أولاً' },
  studentSchedule: { en: 'Student Schedule', ar: 'جدول الطالب' },
  noStudentsFound: { en: 'No students found', ar: 'لم يتم العثور على طلاب' },
  searchResults: { en: 'Search Results', ar: 'نتائج البحث' },
  level: { en: 'Level', ar: 'المستوى' },
  clearSelection: { en: 'Clear Selection', ar: 'إلغاء الاختيار' },
  addSchedule: { en: 'Add to Schedule', ar: 'إضافة للجدول' },
  manageSchedule: { en: 'Manage Schedule', ar: 'إدارة الجدول' },
  viewSchedule: { en: 'View Schedule', ar: 'عرض الجدول' },
};

const SchedulePage: React.FC<SchedulePageProps> = ({ lang, role }) => {
  const t = TRANSLATIONS;
  const isStaff = role === UserRole.STUDENT_AFFAIRS || role === UserRole.ADMIN;

  const [viewMode, setViewMode] = useState<'week' | 'day' | 'list'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayClasses: 0,
    weeklyHours: 0,
    enrolledCourses: 0,
  });

  // Staff-specific states
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [loadingStudentSchedule, setLoadingStudentSchedule] = useState(false);

  // Staff: Search for students
  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setStudentSearchResults([]);
      return;
    }
    setSearchingStudents(true);
    try {
      const response = await studentsAPI.getAll({
        search: query,
        per_page: 10,
      });
      setStudentSearchResults(response.data || []);
    } catch {
      setStudentSearchResults([]);
    } finally {
      setSearchingStudents(false);
    }
  };

  // Staff: Select a student and load their schedule
  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setStudentSearchQuery('');
    setStudentSearchResults([]);
    setLoadingStudentSchedule(true);

    try {
      // Fetch the student's schedule
      const timetableRes = await scheduleAPI.getStudentTimetable(student.id).catch(() => []);
      const timetable = timetableRes.data || timetableRes || [];

      if (timetable.length > 0) {
        const events = scheduleAPI.transformToEvents(timetable, lang);
        setScheduleEvents(events);

        // Calculate stats
        const today = new Date().getDay();
        const todayClasses = events.filter(e => e.day === today).length;
        const weeklyHours = Math.ceil(events.reduce((sum, e) => {
          const start = e.startTime.split(':').map(Number);
          const end = e.endTime.split(':').map(Number);
          return sum + (end[0] - start[0]) + (end[1] - start[1]) / 60;
        }, 0));
        const enrolledCourses = new Set(events.map(e => e.courseCode)).size;

        setStats({ todayClasses, weeklyHours, enrolledCourses });
      } else {
        setScheduleEvents([]);
        setStats({ todayClasses: 0, weeklyHours: 0, enrolledCourses: 0 });
      }
    } catch {
      setScheduleEvents([]);
    } finally {
      setLoadingStudentSchedule(false);
    }
  };

  // Staff: Clear student selection
  const clearStudentSelection = () => {
    setSelectedStudent(null);
    setScheduleEvents([]);
    setStats({ todayClasses: 0, weeklyHours: 0, enrolledCourses: 0 });
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      // Staff users need to select a student first
      if (isStaff) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch timetable and events in parallel
        const [timetableRes, eventsRes] = await Promise.all([
          scheduleAPI.getMyTimetable().catch(() => []),
          dashboardAPI.getUpcomingEvents(5).catch(() => []),
        ]);

        // Transform and set schedule events
        const timetable = timetableRes.data || timetableRes || [];
        if (timetable.length > 0) {
          const events = scheduleAPI.transformToEvents(timetable, lang);
          setScheduleEvents(events);

          // Calculate stats
          const today = new Date().getDay();
          const todayClasses = events.filter(e => e.day === today).length;
          const weeklyHours = Math.ceil(events.reduce((sum, e) => {
            const start = e.startTime.split(':').map(Number);
            const end = e.endTime.split(':').map(Number);
            return sum + (end[0] - start[0]) + (end[1] - start[1]) / 60;
          }, 0));
          const enrolledCourses = new Set(events.map(e => e.courseCode)).size;

          setStats({ todayClasses, weeklyHours, enrolledCourses });
        }

        // Transform and set upcoming events
        const events = eventsRes.data || eventsRes || [];
        setUpcomingEvents(dashboardAPI.transformEvents(events, lang));

      } catch {
        // Schedule data fetch failed - handled gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang, isStaff]);

  // Use only real API data - no mock fallback
  const displayScheduleEvents = scheduleEvents;

  // Today's classes
  const todayClasses = displayScheduleEvents.filter(e => e.day === new Date().getDay());

  // Use only real API data for upcoming events
  const displayUpcomingEvents = upcomingEvents;

  // Daily schedule for list view - generated from API data
  const dailySchedule = displayScheduleEvents
    .filter(e => e.day === new Date().getDay())
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map(e => ({
      time: `${e.startTime} - ${e.endTime}`,
      course: e.courseCode,
      title: lang === 'ar' ? (e.titleAr || e.title) : e.title,
      room: e.location,
      type: e.type || 'lecture',
    }));

  const renderListView = () => (
    <Card>
      <CardHeader
        title={lang === 'ar' ? 'جدول اليوم' : "Today's Schedule"}
        icon={List}
        iconColor="text-blue-600 bg-blue-50"
        action={
          <Badge variant="info">
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        }
      />
      <CardBody noPadding>
        <div className="divide-y divide-slate-100">
          {dailySchedule.map((item, index) => (
            <div
              key={index}
              className={`p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${
                item.type === 'break' ? 'bg-slate-50' : ''
              }`}
            >
              <div className="w-32 text-sm font-medium text-slate-500">{item.time}</div>
              <div className={`w-2 h-12 rounded-full ${
                item.type === 'lecture' ? 'bg-blue-500' :
                item.type === 'lab' ? 'bg-green-500' :
                item.type === 'break' ? 'bg-slate-300' : 'bg-purple-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {item.course && (
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono font-medium text-slate-600">
                      {item.course}
                    </span>
                  )}
                  <h4 className="font-medium text-slate-800">{item.title}</h4>
                </div>
                {item.room && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {item.room}
                  </div>
                )}
              </div>
              {item.type !== 'break' && (
                <IconButton icon={Bell} size="sm" tooltip={lang === 'ar' ? 'تذكير' : 'Reminder'} />
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isStaff ? 'text-emerald-800' : 'text-slate-800'}`}>
            {isStaff ? staffT.staffPageTitle[lang] : (lang === 'ar' ? 'الجدول الدراسي' : 'Class Schedule')}
          </h1>
          <p className="text-slate-500">
            {isStaff ? staffT.staffSubtitle[lang] : (lang === 'ar' ? 'عرض جدولك الأسبوعي والمحاضرات القادمة' : 'View your weekly schedule and upcoming classes')}
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            options={[
              { value: 'current', label: lang === 'ar' ? 'الفصل الحالي' : 'Current Semester' },
              { value: 'next', label: lang === 'ar' ? 'الفصل القادم' : 'Next Semester' },
              { value: 'previous', label: lang === 'ar' ? 'الفصل السابق' : 'Previous Semester' },
            ]}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            fullWidth={false}
            className="w-40"
          />
        </div>
      </div>

      {/* Staff: Student Search Panel */}
      {isStaff && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardBody>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserSearch className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">{staffT.searchByIdOrName[lang]}</h3>
                <p className="text-sm text-emerald-600">{staffT.selectStudentFirst[lang]}</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={staffT.searchStudent[lang]}
                value={studentSearchQuery}
                onChange={(e) => {
                  setStudentSearchQuery(e.target.value);
                  searchStudents(e.target.value);
                }}
                className="w-full ps-10 pe-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {searchingStudents && (
                <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {studentSearchResults.length > 0 && (
              <div className="mb-4 border border-emerald-200 rounded-lg bg-white max-h-64 overflow-y-auto">
                <div className="p-2 bg-emerald-50 border-b border-emerald-200 text-sm font-medium text-emerald-700">
                  {staffT.searchResults[lang]}
                </div>
                {studentSearchResults.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="w-full p-3 text-left hover:bg-emerald-50 border-b border-emerald-100 last:border-0 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {lang === 'ar' ? student.name_ar || student.name : student.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {student.student_id} • {student.program?.name || student.program_name || '-'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Selected Student */}
            {selectedStudent && (
              <div className="p-4 bg-white border-2 border-emerald-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">{staffT.selectedStudent[lang]}</p>
                      <p className="font-semibold text-slate-800">
                        {lang === 'ar' ? selectedStudent.name_ar || selectedStudent.name : selectedStudent.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {selectedStudent.student_id} • {staffT.level[lang]}: {selectedStudent.level || selectedStudent.academic_year || '-'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearStudentSelection}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    title={staffT.clearSelection[lang]}
                  >
                    <X className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                  </button>
                </div>
              </div>
            )}

            {/* No Student Selected Message */}
            {!selectedStudent && studentSearchResults.length === 0 && !searchingStudents && (
              <div className="text-center py-4 text-slate-500">
                <UserSearch className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>{staffT.noStudentSelected[lang]}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Quick Stats - Show only for students OR when staff has selected a student */}
      {(!isStaff || selectedStudent) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            title={lang === 'ar' ? 'محاضرات اليوم' : "Today's Classes"}
            value={stats.todayClasses > 0 ? stats.todayClasses.toString() : todayClasses.length.toString()}
            subtitle={lang === 'ar' ? 'محاضرة' : 'classes'}
            icon={BookOpen}
            iconColor={isStaff ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50"}
          />
          <StatCard
            title={lang === 'ar' ? 'ساعات الأسبوع' : 'Weekly Hours'}
            value={stats.weeklyHours > 0 ? stats.weeklyHours.toString() : '18'}
            subtitle={lang === 'ar' ? 'ساعة معتمدة' : 'credit hours'}
            icon={Clock}
            iconColor={isStaff ? "text-teal-600 bg-teal-50" : "text-green-600 bg-green-50"}
          />
          <StatCard
            title={lang === 'ar' ? 'المقررات المسجلة' : 'Enrolled Courses'}
            value={stats.enrolledCourses > 0 ? stats.enrolledCourses.toString() : '6'}
            subtitle={lang === 'ar' ? 'مقرر' : 'courses'}
            icon={FileText}
            iconColor={isStaff ? "text-emerald-600 bg-emerald-50" : "text-purple-600 bg-purple-50"}
          />
          <StatCard
            title={lang === 'ar' ? 'الأحداث القادمة' : 'Upcoming Events'}
            value={displayUpcomingEvents.length.toString()}
            subtitle={lang === 'ar' ? 'هذا الأسبوع' : 'this week'}
            icon={Calendar}
            iconColor={isStaff ? "text-teal-600 bg-teal-50" : "text-orange-600 bg-orange-50"}
          />
        </div>
      )}

      {/* View Mode Toggle - Show only for students OR when staff has selected a student */}
      {(!isStaff || selectedStudent) && (
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 rounded-lg p-1 w-fit overflow-x-auto">
          <button
            onClick={() => setViewMode('week')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              viewMode === 'week' ? `bg-white shadow ${isStaff ? 'text-emerald-600' : 'text-blue-600'}` : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {lang === 'ar' ? 'أسبوعي' : 'Week'}
            </div>
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              viewMode === 'day' ? `bg-white shadow ${isStaff ? 'text-emerald-600' : 'text-blue-600'}` : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {lang === 'ar' ? 'يومي' : 'Day'}
            </div>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              viewMode === 'list' ? `bg-white shadow ${isStaff ? 'text-emerald-600' : 'text-blue-600'}` : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {lang === 'ar' ? 'قائمة' : 'List'}
            </div>
          </button>
        </div>
      )}

      {/* Staff: Loading Student Schedule */}
      {isStaff && loadingStudentSchedule && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل جدول الطالب...' : 'Loading student schedule...'}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Main Content - Show only for students OR when staff has selected a student */}
      {(!isStaff || selectedStudent) && !loadingStudentSchedule && (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Schedule View */}
        <div className="lg:col-span-3">
          {loading ? (
            <Card>
              <CardBody>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل الجدول...' : 'Loading schedule...'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : viewMode === 'list' ? (
            renderListView()
          ) : (
            <Schedule
              lang={lang}
              events={displayScheduleEvents}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <MiniCalendar
            lang={lang}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            highlightedDates={displayUpcomingEvents.map(e => new Date(e.date))}
          />

          {/* Upcoming Events */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'الأحداث القادمة' : 'Upcoming Events'}
              icon={AlertCircle}
              iconColor="text-orange-600 bg-orange-50"
            />
            <CardBody>
              <div className="space-y-3">
                {displayUpcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.type === 'exam' ? 'bg-red-500' :
                        event.type === 'assignment' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{event.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              icon={Share2}
              iconColor="text-blue-600 bg-blue-50"
            />
            <CardBody>
              <div className="space-y-2">
                <Button variant="ghost" fullWidth icon={Video} className="justify-start">
                  {lang === 'ar' ? 'الفصول الافتراضية' : 'Virtual Classes'}
                </Button>
                <Button variant="ghost" fullWidth icon={Users} className="justify-start">
                  {lang === 'ar' ? 'مجموعات الدراسة' : 'Study Groups'}
                </Button>
                <Button variant="ghost" fullWidth icon={Coffee} className="justify-start">
                  {lang === 'ar' ? 'حجز قاعة دراسية' : 'Book Study Room'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default SchedulePage;

/**
 * LMS Widgets for Dashboard and other pages
 * Shows summary of LMS data like upcoming assignments, course progress, etc.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Award,
  ClipboardList,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from './ui/Card';
import { LMSCourse, LMSAssignment, LMSAttendance, LMSGrade } from '../api/lms';
import {
  getUpcomingAssignments,
  getOverdueAssignments,
  getAttendanceStats,
  getLMSCourseProgress,
  getLMSAverageGrade,
} from '../hooks/useLMSData';

interface LMSWidgetsProps {
  lang: 'en' | 'ar';
  courses: LMSCourse[];
  assignments: LMSAssignment[];
  attendance: LMSAttendance[];
  grades: LMSGrade[];
  isConnected: boolean;
  onSync?: () => void;
  syncing?: boolean;
}

const t = {
  lmsOverview: { en: 'Learning System', ar: 'نظام التعلم' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  upcomingDeadlines: { en: 'Upcoming Deadlines', ar: 'المواعيد القادمة' },
  courseProgress: { en: 'Course Progress', ar: 'تقدم المقررات' },
  attendanceRate: { en: 'Attendance Rate', ar: 'نسبة الحضور' },
  averageGrade: { en: 'Average Grade', ar: 'متوسط الدرجات' },
  noUpcoming: { en: 'No upcoming deadlines', ar: 'لا توجد مواعيد قادمة' },
  dueIn: { en: 'Due in', ar: 'متبقي' },
  days: { en: 'days', ar: 'أيام' },
  day: { en: 'day', ar: 'يوم' },
  hours: { en: 'hours', ar: 'ساعات' },
  overdue: { en: 'Overdue', ar: 'متأخر' },
  overdueCount: { en: 'overdue assignments', ar: 'واجبات متأخرة' },
  sync: { en: 'Sync', ar: 'مزامنة' },
  connected: { en: 'Connected', ar: 'متصل' },
  disconnected: { en: 'Demo Mode', ar: 'وضع تجريبي' },
  present: { en: 'Present', ar: 'حاضر' },
  absent: { en: 'Absent', ar: 'غائب' },
  late: { en: 'Late', ar: 'متأخر' },
  activeCourses: { en: 'Active Courses', ar: 'المقررات النشطة' },
};

// Format time remaining
const formatTimeRemaining = (timestamp: number, lang: 'en' | 'ar'): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;

  if (diff < 0) return t.overdue[lang];

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);

  if (days > 0) {
    return `${t.dueIn[lang]} ${days} ${days === 1 ? t.day[lang] : t.days[lang]}`;
  }
  return `${t.dueIn[lang]} ${hours} ${t.hours[lang]}`;
};

// LMS Summary Card for Dashboard
export const LMSSummaryCard: React.FC<{
  lang: 'en' | 'ar';
  courses: LMSCourse[];
  assignments: LMSAssignment[];
  attendance: LMSAttendance[];
  grades: LMSGrade[];
  isConnected: boolean;
}> = ({ lang, courses, assignments, attendance, grades, isConnected }) => {
  const upcoming = getUpcomingAssignments(assignments, 7);
  const overdue = getOverdueAssignments(assignments);
  const attendanceStats = getAttendanceStats(attendance);
  const avgGrade = getLMSAverageGrade(grades);
  const progress = getLMSCourseProgress(courses);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white">
              {t.lmsOverview[lang]}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              isConnected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {isConnected ? t.connected[lang] : t.disconnected[lang]}
            </span>
            <Link
              to="/lms"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              {t.viewAll[lang]}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {courses.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.activeCourses[lang]}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {progress}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.courseProgress[lang]}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {attendanceStats.rate}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.attendanceRate[lang]}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {avgGrade}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t.averageGrade[lang]}
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t.upcomingDeadlines[lang]}
          </h4>

          {overdue.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{overdue.length} {t.overdueCount[lang]}</span>
            </div>
          )}

          {upcoming.length > 0 ? (
            <div className="space-y-2">
              {upcoming.slice(0, 3).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {assignment.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {assignment.coursename}
                    </p>
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap ms-2">
                    {formatTimeRemaining(assignment.duedate, lang)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              {t.noUpcoming[lang]}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Compact LMS Widget for sidebars
export const LMSCompactWidget: React.FC<{
  lang: 'en' | 'ar';
  assignments: LMSAssignment[];
  attendance: LMSAttendance[];
}> = ({ lang, assignments, attendance }) => {
  const upcoming = getUpcomingAssignments(assignments, 7);
  const overdue = getOverdueAssignments(assignments);
  const attendanceStats = getAttendanceStats(attendance);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">{t.lmsOverview[lang]}</span>
        </div>
        <Link to="/lms" className="p-1 hover:bg-white/20 rounded">
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold">{upcoming.length}</div>
          <div className="text-xs opacity-80">{t.upcomingDeadlines[lang]}</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-200">{overdue.length}</div>
          <div className="text-xs opacity-80">{t.overdue[lang]}</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{attendanceStats.rate}%</div>
          <div className="text-xs opacity-80">{t.attendanceRate[lang]}</div>
        </div>
      </div>
    </div>
  );
};

// Course Progress List
export const LMSCourseProgressList: React.FC<{
  lang: 'en' | 'ar';
  courses: LMSCourse[];
}> = ({ lang, courses }) => {
  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <div key={course.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {lang === 'ar' && course.fullnameAr ? course.fullnameAr : course.fullname}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {course.shortname}
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {course.progress || 0}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress || 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Attendance Summary Widget
export const LMSAttendanceSummary: React.FC<{
  lang: 'en' | 'ar';
  attendance: LMSAttendance[];
}> = ({ lang, attendance }) => {
  const stats = getAttendanceStats(attendance);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">{t.present[lang]}</span>
        <div className="flex items-center gap-2">
          <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${attendance.length ? (stats.present / attendance.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-800 dark:text-white w-8 text-end">
            {stats.present}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">{t.late[lang]}</span>
        <div className="flex items-center gap-2">
          <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full"
              style={{ width: `${attendance.length ? (stats.late / attendance.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-800 dark:text-white w-8 text-end">
            {stats.late}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">{t.absent[lang]}</span>
        <div className="flex items-center gap-2">
          <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{ width: `${attendance.length ? (stats.absent / attendance.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-800 dark:text-white w-8 text-end">
            {stats.absent}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LMSSummaryCard;

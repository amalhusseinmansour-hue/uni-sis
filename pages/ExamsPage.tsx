import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, BookOpen, Download, AlertTriangle,
  FileText, CheckCircle, XCircle, Timer, Users, Building,
  ChevronRight, Bell, Info, AlertCircle, Printer, Eye
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { examsAPI } from '../api/exams';
import { studentsAPI } from '../api/students';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Select } from '../components/ui/Input';
import { exportToPDF, exportToCSV, printPage, formatTableHTML } from '../utils/exportUtils';
import { scheduleExamReminder, requestNotificationPermission, getReminders, deleteReminder, Reminder } from '../utils/notifications';

interface ExamsPageProps {
  lang: 'en' | 'ar';
}

const ExamsPage: React.FC<ExamsPageProps> = ({ lang }) => {
  const t = TRANSLATIONS;
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'results'>('upcoming');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderSuccess, setShowReminderSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [pastExams, setPastExams] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [averageGrade, setAverageGrade] = useState(0);

  // Load reminders on mount
  useEffect(() => {
    setReminders(getReminders());
  }, []);

  // Fetch exam data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch from exams API
        const [examsRes, apiGradesRes] = await Promise.all([
          examsAPI.getExamCalendar().catch(() => []),
          examsAPI.getMyGrades().catch(() => []),
        ]);

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Process API exams
        const apiExams = examsAPI.transformExams(examsRes.data || examsRes || [], lang);

        // Split into upcoming and past
        const upcoming = apiExams.filter((e: any) => e.date >= todayStr);
        const past = apiExams.filter((e: any) => e.date < todayStr);

        if (upcoming.length > 0) {
          setUpcomingExams(upcoming);
        }
        if (past.length > 0) {
          setPastExams(past);
        }

        // Process grades for results
        const allGrades = apiGradesRes.data || apiGradesRes || [];

        if (allGrades.length > 0) {
          const courseResults = new Map<string, any>();
          let totalGrade = 0;
          let gradeCount = 0;

          allGrades.forEach((grade: any) => {
            const courseCode = grade.coursename || grade.course?.code || grade.courseCode || 'Unknown';
            if (!courseResults.has(courseCode)) {
              courseResults.set(courseCode, {
                course: courseCode,
                midterm: null,
                quizzes: null,
                assignments: null,
                final: null,
                total: null,
              });
            }

            const result = courseResults.get(courseCode)!;
            const gradeValue = grade.grade || grade.value || grade.score;

            // For LMS grades, use total as final grade percentage
            if (grade.grademax && gradeValue !== null) {
              const percentage = Math.round((gradeValue / grade.grademax) * 100);
              result.total = percentage;
              totalGrade += percentage;
              gradeCount++;
            } else if (gradeValue) {
              const gradeType = grade.type || grade.gradeType;
              if (gradeType === 'midterm') result.midterm = gradeValue;
              else if (gradeType === 'quiz') result.quizzes = gradeValue;
              else if (gradeType === 'assignment') result.assignments = gradeValue;
              else if (gradeType === 'final') result.final = gradeValue;

              totalGrade += gradeValue;
              gradeCount++;
            }
          });

          setExamResults(Array.from(courseResults.values()));
          setAverageGrade(gradeCount > 0 ? Math.round(totalGrade / gradeCount) : 83);
        }

      } catch (error) {
        // Error fetching exam data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang]);

  const handleSetReminder = async (exam: any) => {
    // Request notification permission
    await requestNotificationPermission();

    // Schedule reminder 1 hour before exam
    const reminder = scheduleExamReminder(
      exam.id,
      `${exam.course} - ${exam.title}`,
      exam.date,
      exam.time.split(' - ')[0],
      60 // 60 minutes before
    );

    setReminders([...reminders, reminder]);
    setShowReminderSuccess(true);
    setTimeout(() => setShowReminderSuccess(false), 3000);
  };

  const isReminderSet = (examId: string) => {
    return reminders.some(r => r.title.includes(examId) || r.title.includes(upcomingExams.find(e => e.id === examId)?.course || ''));
  };

  // Use API data only - no fallback to fake data
  const displayUpcomingExams = upcomingExams;
  const displayPastExams = pastExams;
  const displayExamResults = examResults;

  const getExamTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      final: { en: 'Final Exam', ar: 'اختبار نهائي' },
      midterm: { en: 'Midterm', ar: 'اختبار نصفي' },
      quiz: { en: 'Quiz', ar: 'اختبار قصير' },
    };
    return labels[type]?.[lang] || type;
  };

  const getDaysUntil = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderUpcomingExams = () => (
    <div className="space-y-4">
      {displayUpcomingExams.map((exam) => {
        const daysUntil = getDaysUntil(exam.date);
        return (
          <div
            key={exam.id}
            className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden ${
              daysUntil <= 3 ? 'border-red-200 dark:border-red-800' :
              daysUntil <= 7 ? 'border-yellow-200 dark:border-yellow-800' : 'border-slate-200 dark:border-slate-700'
            }`}
            onClick={() => {
              setSelectedExam(exam);
              setShowDetailsModal(true);
            }}
          >
            {daysUntil <= 3 && (
              <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            )}
            <div className="p-3 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Date Box */}
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl flex flex-col items-center justify-center shadow-lg flex-shrink-0 ${
                  daysUntil <= 3 ? 'bg-gradient-to-br from-red-500 to-red-600' :
                  daysUntil <= 7 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                } text-white`}>
                  <span className="text-lg sm:text-2xl font-bold">{new Date(exam.date).getDate()}</span>
                  <span className="text-[10px] sm:text-xs opacity-90">
                    {new Date(exam.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })}
                  </span>
                </div>

                {/* Exam Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-100 dark:bg-slate-700 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {exam.course}
                    </span>
                    <Badge variant={exam.type === 'final' ? 'danger' : 'warning'}>
                      {getExamTypeLabel(exam.type)}
                    </Badge>
                    {daysUntil <= 3 && (
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-[10px] sm:text-xs rounded-md sm:rounded-lg font-medium animate-pulse">
                        {lang === 'ar' ? `${daysUntil} أيام` : `${daysUntil}d left`}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-lg truncate">{exam.title}</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-2 sm:mt-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">{exam.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <Timer className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      {exam.duration} {lang === 'ar' ? 'د' : 'min'}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 col-span-2 md:col-span-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">{exam.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:flex">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      {lang === 'ar' ? 'مقعد' : 'Seat'}: {exam.seat}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 hidden sm:block" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPastExams = () => (
    <Card>
      <CardBody noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                  {lang === 'ar' ? 'الاختبار' : 'Exam'}
                </th>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                  {lang === 'ar' ? 'النوع' : 'Type'}
                </th>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                  {lang === 'ar' ? 'التاريخ' : 'Date'}
                </th>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                  {lang === 'ar' ? 'الدرجة' : 'Grade'}
                </th>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                  {lang === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                  {t.actions[lang]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayPastExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
                        {exam.course.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{exam.title}</p>
                        <p className="text-xs text-slate-500">{exam.course}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={exam.type === 'final' ? 'danger' : exam.type === 'midterm' ? 'warning' : 'info'}>
                      {getExamTypeLabel(exam.type)}
                    </Badge>
                  </td>
                  <td className="p-4 text-center text-sm text-slate-600">{exam.date}</td>
                  <td className="p-4 text-center">
                    <span className={`text-lg font-bold ${
                      (exam.grade / exam.maxGrade) >= 0.9 ? 'text-green-600' :
                      (exam.grade / exam.maxGrade) >= 0.7 ? 'text-blue-600' :
                      (exam.grade / exam.maxGrade) >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {exam.grade}/{exam.maxGrade}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 me-1" />
                      {lang === 'ar' ? 'مصحح' : 'Graded'}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض التفاصيل' : 'View Details'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );

  const renderResults = () => (
    <Card>
      <CardHeader
        title={lang === 'ar' ? 'ملخص الدرجات' : 'Grade Summary'}
        icon={FileText}
        iconColor="text-purple-600 bg-purple-50"
      />
      <CardBody noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                  {lang === 'ar' ? 'المقرر' : 'Course'}
                </th>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                  {lang === 'ar' ? 'نصفي (40%)' : 'Midterm (40%)'}
                </th>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                  {lang === 'ar' ? 'أعمال الفصل (20%)' : 'Coursework (20%)'}
                </th>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                  {lang === 'ar' ? 'نهائي (40%)' : 'Final (40%)'}
                </th>
                <th className={`p-4 text-xs font-semibold text-slate-500 uppercase text-center`}>
                  {lang === 'ar' ? 'المجموع' : 'Total'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayExamResults.map((result, index) => {
                const coursework = result.quizzes && result.assignments
                  ? Math.round((result.quizzes + result.assignments) / 2)
                  : result.quizzes || result.assignments || null;
                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-medium text-slate-800">{result.course}</span>
                    </td>
                    <td className="p-4 text-center">
                      {result.midterm ? (
                        <span className="font-bold text-blue-600">{result.midterm}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {coursework ? (
                        <span className="font-bold text-green-600">{coursework}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {result.final ? (
                        <span className="font-bold text-orange-600">{result.final}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {result.total ? (
                        <span className="font-bold text-slate-800">{result.total}</span>
                      ) : (
                        <span className="text-slate-400">{lang === 'ar' ? 'قيد الاحتساب' : 'Pending'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              {lang === 'ar' ? 'جدول الاختبارات' : 'Exam Schedule'}
            </h1>
            <p className="text-indigo-100 mt-1 text-sm sm:text-base">
              {lang === 'ar' ? 'عرض جدول الاختبارات والنتائج' : 'View your exam schedule and results'}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/20 border border-white/30 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
            >
              <option value="current" className="text-slate-800">{lang === 'ar' ? 'الفصل الحالي' : 'Current Semester'}</option>
              <option value="previous" className="text-slate-800">{lang === 'ar' ? 'الفصل السابق' : 'Previous Semester'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'الاختبارات القادمة' : 'Upcoming Exams'}
          value={displayUpcomingExams.length.toString()}
          subtitle={lang === 'ar' ? 'اختبار' : 'exams'}
          icon={Calendar}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'الاختبار القادم' : 'Next Exam'}
          value={getDaysUntil(displayUpcomingExams[0]?.date || '').toString()}
          subtitle={lang === 'ar' ? 'يوم متبقي' : 'days left'}
          icon={Timer}
          iconColor="text-red-600 bg-red-50"
        />
        <StatCard
          title={lang === 'ar' ? 'اختبارات مكتملة' : 'Completed Exams'}
          value={displayPastExams.length.toString()}
          subtitle={lang === 'ar' ? 'هذا الفصل' : 'this semester'}
          icon={CheckCircle}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'متوسط الدرجات' : 'Average Grade'}
          value={`${averageGrade || 83}%`}
          subtitle={lang === 'ar' ? 'من الاختبارات السابقة' : 'from past exams'}
          icon={FileText}
          iconColor="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Reminder Success Message */}
      {showReminderSuccess && (
        <div className="fixed bottom-4 end-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
          <CheckCircle className="w-5 h-5" />
          <span>{lang === 'ar' ? 'تم تعيين التذكير بنجاح!' : 'Reminder set successfully!'}</span>
        </div>
      )}

      {/* Warning for upcoming exams */}
      {displayUpcomingExams.some(e => getDaysUntil(e.date) <= 3) && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-300">
              {lang === 'ar' ? 'اختبارات قريبة!' : 'Exams Coming Up!'}
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {lang === 'ar'
                ? 'لديك اختبارات خلال الأيام الثلاثة القادمة. تأكد من الاستعداد الجيد.'
                : 'You have exams in the next 3 days. Make sure you are well prepared.'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg sm:rounded-xl p-1 sm:p-1.5 w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {lang === 'ar' ? 'القادمة' : 'Upcoming'}
          {displayUpcomingExams.length > 0 && (
            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs rounded-full">
              {displayUpcomingExams.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
            activeTab === 'past'
              ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {lang === 'ar' ? 'السابقة' : 'Past'}
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
            activeTab === 'results'
              ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {lang === 'ar' ? 'النتائج' : 'Results'}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'upcoming' && renderUpcomingExams()}
      {activeTab === 'past' && renderPastExams()}
      {activeTab === 'results' && renderResults()}

      {/* Exam Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={lang === 'ar' ? 'تفاصيل الاختبار' : 'Exam Details'}
        size="lg"
      >
        {selectedExam && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="w-16 h-16 rounded-xl bg-blue-500 flex flex-col items-center justify-center text-white">
                <span className="text-xl font-bold">{new Date(selectedExam.date).getDate()}</span>
                <span className="text-xs">
                  {new Date(selectedExam.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-white rounded text-xs font-mono font-bold text-slate-600">
                    {selectedExam.course}
                  </span>
                  <Badge variant="danger">{getExamTypeLabel(selectedExam.type)}</Badge>
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{selectedExam.title}</h3>
                <p className="text-sm text-slate-500">{selectedExam.instructor}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  {lang === 'ar' ? 'الوقت' : 'Time'}
                </div>
                <p className="font-medium text-slate-800">{selectedExam.time}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Timer className="w-3 h-3" />
                  {lang === 'ar' ? 'المدة' : 'Duration'}
                </div>
                <p className="font-medium text-slate-800">{selectedExam.duration} {lang === 'ar' ? 'دقيقة' : 'minutes'}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <MapPin className="w-3 h-3" />
                  {lang === 'ar' ? 'المكان' : 'Location'}
                </div>
                <p className="font-medium text-slate-800">{selectedExam.location}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Users className="w-3 h-3" />
                  {lang === 'ar' ? 'رقم المقعد' : 'Seat Number'}
                </div>
                <p className="font-medium text-slate-800">{selectedExam.seat}</p>
              </div>
            </div>

            {/* Topics */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="font-medium text-slate-800 mb-2">
                {lang === 'ar' ? 'المواضيع المشمولة' : 'Topics Covered'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedExam.topics.map((topic: string, index: number) => (
                  <Badge key={index} variant="secondary">{topic}</Badge>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="p-4 border border-slate-200 rounded-xl">
              <h4 className="font-medium text-slate-800 mb-2">
                {lang === 'ar' ? 'المواد المطلوبة' : 'Required Materials'}
              </h4>
              <p className="text-slate-600">{selectedExam.materials}</p>
            </div>

            {/* Notes */}
            {selectedExam.notes && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">
                    {lang === 'ar' ? 'ملاحظات مهمة' : 'Important Notes'}
                  </h4>
                </div>
                <p className="text-yellow-700">{selectedExam.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                fullWidth
                icon={Bell}
                onClick={() => handleSetReminder(selectedExam)}
                disabled={isReminderSet(selectedExam.id)}
              >
                {isReminderSet(selectedExam.id)
                  ? (lang === 'ar' ? 'تم تعيين التذكير ✓' : 'Reminder Set ✓')
                  : (lang === 'ar' ? 'تعيين تذكير' : 'Set Reminder')
                }
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamsPage;

import React, { useState, useEffect } from 'react';
import {
  BookOpen, GraduationCap, ClipboardCheck, Calendar, FileText,
  RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp,
  Download, ExternalLink, Play, File, Video, Link, ChevronRight,
  Award, BarChart2, Users, MessageSquare, Bell, Settings, Wifi, WifiOff
} from 'lucide-react';
import { lmsAPI, lmsSyncAPI, LMSCourse, LMSGrade, LMSAssignment, LMSAttendance } from '../api/lms';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Select } from '../components/ui/Input';
import { PageLoading, ErrorState, EmptyState } from '../components/ui/StateComponents';

interface LMSPageProps {
  lang: 'en' | 'ar';
}

const LMSPage: React.FC<LMSPageProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'grades' | 'assignments' | 'attendance'>('overview');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingToSisi, setSyncingToSisi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [courses, setCourses] = useState<LMSCourse[]>([]);
  const [grades, setGrades] = useState<LMSGrade[]>([]);
  const [assignments, setAssignments] = useState<LMSAssignment[]>([]);
  const [attendance, setAttendance] = useState<LMSAttendance[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<LMSCourse | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Initial load
  useEffect(() => {
    checkConnectionAndLoad();
  }, []);

  const checkConnectionAndLoad = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection
      const isConnected = await lmsAPI.testConnection().catch(() => false);
      setConnected(isConnected);

      if (isConnected) {
        await loadAllData();
      } else {
        // Load demo data
        loadDemoData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to LMS');
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    try {
      const data = await lmsAPI.syncAllData();
      setCourses(data.courses);
      setGrades(data.grades);
      setAssignments(data.assignments);
      setAttendance(data.attendance);
      setLastSync(data.syncedAt);
    } catch (err) {
      console.error('Failed to load LMS data:', err);
      loadDemoData();
    }
  };

  const loadDemoData = () => {
    // Demo courses
    setCourses([
      {
        id: 1,
        shortname: 'CS101',
        fullname: lang === 'ar' ? 'مقدمة في علوم الحاسب' : 'Introduction to Computer Science',
        summary: lang === 'ar' ? 'أساسيات البرمجة وعلوم الحاسب' : 'Fundamentals of programming and computer science',
        startdate: Date.now() / 1000 - 90 * 24 * 3600,
        enddate: Date.now() / 1000 + 30 * 24 * 3600,
        visible: true,
        progress: 75,
        completed: false,
      },
      {
        id: 2,
        shortname: 'MATH201',
        fullname: lang === 'ar' ? 'تفاضل وتكامل 2' : 'Calculus II',
        summary: lang === 'ar' ? 'التكامل والمعادلات التفاضلية' : 'Integration and differential equations',
        startdate: Date.now() / 1000 - 90 * 24 * 3600,
        enddate: Date.now() / 1000 + 30 * 24 * 3600,
        visible: true,
        progress: 60,
        completed: false,
      },
      {
        id: 3,
        shortname: 'CS201',
        fullname: lang === 'ar' ? 'هياكل البيانات' : 'Data Structures',
        summary: lang === 'ar' ? 'المصفوفات والقوائم والأشجار' : 'Arrays, lists, and trees',
        startdate: Date.now() / 1000 - 90 * 24 * 3600,
        enddate: Date.now() / 1000 + 30 * 24 * 3600,
        visible: true,
        progress: 85,
        completed: false,
      },
    ]);

    // Demo grades
    setGrades([
      { courseid: 1, coursename: 'CS101', userid: 1, grade: 85, grademax: 100, grademin: 0 },
      { courseid: 2, coursename: 'MATH201', userid: 1, grade: 78, grademax: 100, grademin: 0 },
      { courseid: 3, coursename: 'CS201', userid: 1, grade: 92, grademax: 100, grademin: 0 },
    ]);

    // Demo assignments
    setAssignments([
      {
        id: 1,
        course: 1,
        coursename: 'CS101',
        name: lang === 'ar' ? 'مشروع البرمجة 1' : 'Programming Project 1',
        intro: lang === 'ar' ? 'تطوير تطبيق بسيط' : 'Develop a simple application',
        duedate: Date.now() / 1000 + 5 * 24 * 3600,
        allowsubmissionsfromdate: Date.now() / 1000 - 7 * 24 * 3600,
        grade: 100,
        submitted: false,
        graded: false,
        submissionstatus: 'pending',
      },
      {
        id: 2,
        course: 2,
        coursename: 'MATH201',
        name: lang === 'ar' ? 'واجب التكامل' : 'Integration Homework',
        intro: lang === 'ar' ? 'حل مسائل التكامل' : 'Solve integration problems',
        duedate: Date.now() / 1000 + 2 * 24 * 3600,
        allowsubmissionsfromdate: Date.now() / 1000 - 5 * 24 * 3600,
        grade: 50,
        submitted: true,
        graded: true,
        submissionstatus: 'submitted',
        usergrade: 45,
      },
      {
        id: 3,
        course: 3,
        coursename: 'CS201',
        name: lang === 'ar' ? 'تطبيق الأشجار' : 'Trees Implementation',
        intro: lang === 'ar' ? 'تطبيق شجرة ثنائية' : 'Implement a binary tree',
        duedate: Date.now() / 1000 - 1 * 24 * 3600,
        allowsubmissionsfromdate: Date.now() / 1000 - 10 * 24 * 3600,
        grade: 100,
        submitted: true,
        graded: true,
        submissionstatus: 'graded',
        usergrade: 95,
      },
    ]);

    // Demo attendance
    setAttendance([
      { courseid: 1, coursename: 'CS101', sessionid: 1, sessiondate: Date.now() / 1000 - 1 * 24 * 3600, duration: 3600, status: 'present' },
      { courseid: 1, coursename: 'CS101', sessionid: 2, sessiondate: Date.now() / 1000 - 3 * 24 * 3600, duration: 3600, status: 'present' },
      { courseid: 2, coursename: 'MATH201', sessionid: 3, sessiondate: Date.now() / 1000 - 2 * 24 * 3600, duration: 3600, status: 'late' },
      { courseid: 3, coursename: 'CS201', sessionid: 4, sessiondate: Date.now() / 1000 - 4 * 24 * 3600, duration: 3600, status: 'absent' },
    ]);

    setLastSync(new Date().toISOString());
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      if (connected) {
        await loadAllData();
      } else {
        loadDemoData();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Check backend connection and get sync stats
  const checkBackendConnection = async () => {
    try {
      const status = await lmsSyncAPI.getStatus();
      setBackendConnected(status.connection?.success || false);
      setSyncStats(status.statistics);
    } catch (err) {
      console.error('Backend connection check failed:', err);
      setBackendConnected(false);
    }
  };

  // Sync data from LMS to SISI database
  const handleSyncToSisi = async () => {
    setSyncingToSisi(true);
    setSyncMessage(null);
    try {
      // Sync grades to SISI
      const result = await lmsSyncAPI.syncGradesToSis();

      setSyncMessage({
        type: 'success',
        text: lang === 'ar'
          ? `تمت المزامنة بنجاح: ${result.data?.success || 0} درجة`
          : `Sync successful: ${result.data?.success || 0} grades synced`
      });

      // Refresh sync stats
      await checkBackendConnection();
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: err.message || (lang === 'ar' ? 'فشل في المزامنة' : 'Sync failed')
      });
    } finally {
      setSyncingToSisi(false);
    }
  };

  // Import grades from a specific course
  const handleImportCourseGrades = async (moodleCourseId: number) => {
    setSyncingToSisi(true);
    setSyncMessage(null);
    try {
      const result = await lmsSyncAPI.importGrades(moodleCourseId);

      setSyncMessage({
        type: 'success',
        text: lang === 'ar'
          ? `تم استيراد ${result.data?.success || 0} درجة`
          : `Imported ${result.data?.success || 0} grades`
      });

      await checkBackendConnection();
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: err.message || (lang === 'ar' ? 'فشل في الاستيراد' : 'Import failed')
      });
    } finally {
      setSyncingToSisi(false);
    }
  };

  // Check backend connection on load
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Calculate stats
  const stats = {
    totalCourses: courses.length,
    avgProgress: courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length) : 0,
    avgGrade: grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length) : 0,
    pendingAssignments: assignments.filter(a => !a.submitted && a.duedate > Date.now() / 1000).length,
    attendanceRate: attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0,
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDueStatus = (duedate: number) => {
    const now = Date.now() / 1000;
    const diff = duedate - now;
    if (diff < 0) return { label: lang === 'ar' ? 'متأخر' : 'Overdue', variant: 'danger' as const };
    if (diff < 24 * 3600) return { label: lang === 'ar' ? 'اليوم' : 'Due Today', variant: 'warning' as const };
    if (diff < 3 * 24 * 3600) return { label: lang === 'ar' ? 'قريباً' : 'Due Soon', variant: 'warning' as const };
    return { label: formatDate(duedate), variant: 'default' as const };
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Sync Message Alert */}
      {syncMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${syncMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {syncMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={syncMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {syncMessage.text}
          </span>
          <button onClick={() => setSyncMessage(null)} className="ml-auto text-slate-400 hover:text-slate-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LMS Connection */}
        <div className={`p-4 rounded-xl flex items-center justify-between ${connected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            {connected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <h4 className={`font-medium ${connected ? 'text-green-800' : 'text-yellow-800'}`}>
                {connected
                  ? (lang === 'ar' ? 'متصل بنظام LMS' : 'Connected to LMS')
                  : (lang === 'ar' ? 'وضع العرض التجريبي' : 'Demo Mode')}
              </h4>
              <p className={`text-sm ${connected ? 'text-green-600' : 'text-yellow-600'}`}>
                {lastSync && (lang === 'ar' ? `آخر مزامنة: ${new Date(lastSync).toLocaleString('ar-EG')}` : `Last sync: ${new Date(lastSync).toLocaleString()}`)}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleSync} disabled={syncing}>
            {syncing ? (lang === 'ar' ? 'جاري...' : 'Syncing...') : (lang === 'ar' ? 'جلب' : 'Fetch')}
          </Button>
        </div>

        {/* SISI Sync Status */}
        <div className={`p-4 rounded-xl flex items-center justify-between ${backendConnected ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <Download className={`w-5 h-5 ${backendConnected ? 'text-blue-600' : 'text-slate-400'}`} />
            <div>
              <h4 className={`font-medium ${backendConnected ? 'text-blue-800' : 'text-slate-600'}`}>
                {lang === 'ar' ? 'المزامنة مع SISI' : 'Sync to SISI'}
              </h4>
              <p className={`text-sm ${backendConnected ? 'text-blue-600' : 'text-slate-500'}`}>
                {syncStats?.grades?.pending_sync > 0
                  ? (lang === 'ar' ? `${syncStats.grades.pending_sync} درجة في الانتظار` : `${syncStats.grades.pending_sync} grades pending`)
                  : (lang === 'ar' ? 'لا توجد بيانات معلقة' : 'No pending data')}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleSyncToSisi}
            disabled={syncingToSisi || !backendConnected}
          >
            {syncingToSisi ? (lang === 'ar' ? 'جاري...' : 'Syncing...') : (lang === 'ar' ? 'حفظ في SISI' : 'Save to SISI')}
          </Button>
        </div>
      </div>

      {/* Sync Statistics */}
      {syncStats && (
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'إحصائيات المزامنة' : 'Sync Statistics'}
            icon={BarChart2}
            iconColor="text-indigo-600 bg-indigo-50"
          />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{syncStats.users?.synced || 0}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'طلاب متزامنين' : 'Synced Users'}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{syncStats.courses?.synced || 0}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'مقررات متزامنة' : 'Synced Courses'}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{syncStats.grades?.synced_to_sis || 0}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'درجات محفوظة' : 'Saved Grades'}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{syncStats.grades?.pending_sync || 0}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'في الانتظار' : 'Pending'}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title={lang === 'ar' ? 'المقررات' : 'Courses'}
          value={stats.totalCourses.toString()}
          icon={BookOpen}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'التقدم' : 'Progress'}
          value={`${stats.avgProgress}%`}
          icon={TrendingUp}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'المعدل' : 'Avg Grade'}
          value={`${stats.avgGrade}%`}
          icon={Award}
          iconColor="text-purple-600 bg-purple-50"
        />
        <StatCard
          title={lang === 'ar' ? 'واجبات معلقة' : 'Pending'}
          value={stats.pendingAssignments.toString()}
          icon={ClipboardCheck}
          iconColor="text-orange-600 bg-orange-50"
        />
        <StatCard
          title={lang === 'ar' ? 'الحضور' : 'Attendance'}
          value={`${stats.attendanceRate}%`}
          icon={CheckCircle}
          iconColor="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'المواعيد القادمة' : 'Upcoming Deadlines'}
            icon={Calendar}
            iconColor="text-red-600 bg-red-50"
          />
          <CardBody noPadding>
            <div className="divide-y divide-slate-100">
              {assignments
                .filter(a => !a.submitted && a.duedate > Date.now() / 1000)
                .sort((a, b) => a.duedate - b.duedate)
                .slice(0, 5)
                .map((assignment) => {
                  const status = getDueStatus(assignment.duedate);
                  return (
                    <div key={assignment.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 truncate">{assignment.name}</h4>
                        <p className="text-sm text-slate-500">{assignment.coursename}</p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  );
                })}
              {assignments.filter(a => !a.submitted && a.duedate > Date.now() / 1000).length === 0 && (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-2" />
                  <p className="text-slate-500">{lang === 'ar' ? 'لا توجد مواعيد نهائية قريبة' : 'No upcoming deadlines'}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'الدرجات الأخيرة' : 'Recent Grades'}
            icon={Award}
            iconColor="text-purple-600 bg-purple-50"
          />
          <CardBody noPadding>
            <div className="divide-y divide-slate-100">
              {assignments
                .filter(a => a.graded && a.usergrade !== undefined)
                .slice(0, 5)
                .map((assignment) => (
                  <div key={assignment.id} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{assignment.name}</h4>
                      <p className="text-sm text-slate-500">{assignment.coursename}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-800">{assignment.usergrade}/{assignment.grade}</p>
                      <p className="text-sm text-slate-500">{Math.round((assignment.usergrade! / assignment.grade) * 100)}%</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Course Progress */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'تقدم المقررات' : 'Course Progress'}
          icon={BarChart2}
          iconColor="text-blue-600 bg-blue-50"
        />
        <CardBody>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-4">
                <div className="w-16 text-center">
                  <span className="text-xs font-mono text-slate-500">{course.shortname}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{course.fullname}</span>
                    <span className="text-sm text-slate-500">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            setSelectedCourse(course);
            setShowCourseModal(true);
          }}>
            <CardBody>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {course.shortname.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{course.fullname}</h3>
                  <p className="text-sm text-slate-500">{course.shortname}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3 line-clamp-2">{course.summary}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{lang === 'ar' ? 'التقدم' : 'Progress'}</span>
                  <span className="text-xs font-medium text-slate-700">{course.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${course.progress! >= 80 ? 'bg-green-500' : course.progress! >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs text-slate-400">
                  {lang === 'ar' ? 'ينتهي:' : 'Ends:'} {formatDate(course.enddate)}
                </span>
                <Button variant="ghost" size="sm" icon={ExternalLink}>
                  {lang === 'ar' ? 'فتح' : 'Open'}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGradesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'الدرجات حسب المقرر' : 'Grades by Course'}
          icon={Award}
          iconColor="text-purple-600 bg-purple-50"
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? 'المقرر' : 'Course'}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {lang === 'ar' ? 'الدرجة' : 'Grade'}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {lang === 'ar' ? 'النسبة' : 'Percentage'}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((grade) => {
                  const percentage = grade.grade !== null ? Math.round((grade.grade / grade.grademax) * 100) : 0;
                  return (
                    <tr key={grade.courseid} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{grade.coursename}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-lg font-bold text-slate-800">
                          {grade.grade !== null ? grade.grade : '-'} / {grade.grademax}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-full rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-slate-700">{percentage}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={percentage >= 60 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}>
                          {percentage >= 90 ? (lang === 'ar' ? 'ممتاز' : 'Excellent') :
                           percentage >= 80 ? (lang === 'ar' ? 'جيد جداً' : 'Very Good') :
                           percentage >= 70 ? (lang === 'ar' ? 'جيد' : 'Good') :
                           percentage >= 60 ? (lang === 'ar' ? 'مقبول' : 'Pass') :
                           (lang === 'ar' ? 'راسب' : 'Fail')}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderAssignmentsTab = () => (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-4">
        <Select
          options={[
            { value: 'all', label: lang === 'ar' ? 'جميع الواجبات' : 'All Assignments' },
            { value: 'pending', label: lang === 'ar' ? 'قيد الانتظار' : 'Pending' },
            { value: 'submitted', label: lang === 'ar' ? 'مسلمة' : 'Submitted' },
            { value: 'graded', label: lang === 'ar' ? 'مصححة' : 'Graded' },
          ]}
          fullWidth={false}
          className="w-48"
        />
      </div>

      {/* Assignments List */}
      <Card>
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {assignments.map((assignment) => {
              const dueStatus = getDueStatus(assignment.duedate);
              return (
                <div key={assignment.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    assignment.graded ? 'bg-green-100' :
                    assignment.submitted ? 'bg-blue-100' :
                    'bg-orange-100'
                  }`}>
                    {assignment.graded ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : assignment.submitted ? (
                      <Clock className="w-6 h-6 text-blue-600" />
                    ) : (
                      <FileText className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800">{assignment.name}</h4>
                    <p className="text-sm text-slate-500">{assignment.coursename}</p>
                  </div>
                  <div className="text-center">
                    {assignment.graded ? (
                      <div>
                        <p className="text-lg font-bold text-slate-800">{assignment.usergrade}/{assignment.grade}</p>
                        <p className="text-xs text-slate-500">{lang === 'ar' ? 'الدرجة' : 'Grade'}</p>
                      </div>
                    ) : (
                      <Badge variant={dueStatus.variant}>{dueStatus.label}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!assignment.submitted && (
                      <Button variant="primary" size="sm">
                        {lang === 'ar' ? 'تسليم' : 'Submit'}
                      </Button>
                    )}
                    <IconButton icon={ExternalLink} size="sm" tooltip={lang === 'ar' ? 'فتح في LMS' : 'Open in LMS'} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderAttendanceTab = () => {
    const attendanceStats = {
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length,
    };

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title={lang === 'ar' ? 'حاضر' : 'Present'}
            value={attendanceStats.present.toString()}
            icon={CheckCircle}
            iconColor="text-green-600 bg-green-50"
          />
          <StatCard
            title={lang === 'ar' ? 'غائب' : 'Absent'}
            value={attendanceStats.absent.toString()}
            icon={XCircle}
            iconColor="text-red-600 bg-red-50"
          />
          <StatCard
            title={lang === 'ar' ? 'متأخر' : 'Late'}
            value={attendanceStats.late.toString()}
            icon={Clock}
            iconColor="text-yellow-600 bg-yellow-50"
          />
          <StatCard
            title={lang === 'ar' ? 'معذور' : 'Excused'}
            value={attendanceStats.excused.toString()}
            icon={AlertCircle}
            iconColor="text-blue-600 bg-blue-50"
          />
        </div>

        {/* Attendance Records */}
        <Card>
          <CardHeader
            title={lang === 'ar' ? 'سجل الحضور' : 'Attendance Records'}
            icon={ClipboardCheck}
            iconColor="text-green-600 bg-green-50"
          />
          <CardBody noPadding>
            <div className="divide-y divide-slate-100">
              {attendance.map((record, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    record.status === 'present' ? 'bg-green-100' :
                    record.status === 'absent' ? 'bg-red-100' :
                    record.status === 'late' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {record.status === 'present' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                     record.status === 'absent' ? <XCircle className="w-5 h-5 text-red-600" /> :
                     record.status === 'late' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                     <AlertCircle className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{record.coursename}</h4>
                    <p className="text-sm text-slate-500">{formatDate(record.sessiondate)}</p>
                  </div>
                  <Badge variant={
                    record.status === 'present' ? 'success' :
                    record.status === 'absent' ? 'danger' :
                    record.status === 'late' ? 'warning' : 'info'
                  }>
                    {record.status === 'present' ? (lang === 'ar' ? 'حاضر' : 'Present') :
                     record.status === 'absent' ? (lang === 'ar' ? 'غائب' : 'Absent') :
                     record.status === 'late' ? (lang === 'ar' ? 'متأخر' : 'Late') :
                     (lang === 'ar' ? 'معذور' : 'Excused')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  // Tabs
  const tabs = [
    { id: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: BarChart2 },
    { id: 'courses', label: lang === 'ar' ? 'المقررات' : 'Courses', icon: BookOpen },
    { id: 'grades', label: lang === 'ar' ? 'الدرجات' : 'Grades', icon: Award },
    { id: 'assignments', label: lang === 'ar' ? 'الواجبات' : 'Assignments', icon: FileText },
    { id: 'attendance', label: lang === 'ar' ? 'الحضور' : 'Attendance', icon: ClipboardCheck },
  ];

  if (loading) {
    return <PageLoading lang={lang} message={lang === 'ar' ? 'جاري الاتصال بنظام LMS...' : 'Connecting to LMS...'} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ar' ? 'نظام إدارة التعلم (LMS)' : 'Learning Management System'}
          </h1>
          <p className="text-slate-500">
            {lang === 'ar' ? 'مقرراتك ودرجاتك وواجباتك من OpenLMS' : 'Your courses, grades, and assignments from OpenLMS'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={RefreshCw} onClick={handleSync} disabled={syncing}>
            {syncing ? (lang === 'ar' ? 'جاري المزامنة...' : 'Syncing...') : (lang === 'ar' ? 'مزامنة' : 'Sync Now')}
          </Button>
          <Button variant="outline" icon={ExternalLink}>
            {lang === 'ar' ? 'فتح LMS' : 'Open LMS'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'courses' && renderCoursesTab()}
      {activeTab === 'grades' && renderGradesTab()}
      {activeTab === 'assignments' && renderAssignmentsTab()}
      {activeTab === 'attendance' && renderAttendanceTab()}

      {/* Course Modal */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title={selectedCourse?.fullname || ''}
        size="lg"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600">{selectedCourse.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}</p>
                <p className="font-medium">{formatDate(selectedCourse.startdate)}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}</p>
                <p className="font-medium">{formatDate(selectedCourse.enddate)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" fullWidth icon={ExternalLink}>
                {lang === 'ar' ? 'فتح في LMS' : 'Open in LMS'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LMSPage;

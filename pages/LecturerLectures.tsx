import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Play,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Eye,
  Upload,
  Download,
  Search,
  RefreshCw,
  BookOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Paperclip,
  MessageSquare,
  Star,
  UserCheck,
  UserX,
} from 'lucide-react';

interface Lecture {
  id: number;
  course_id: number;
  title_en: string;
  title_ar: string;
  lecture_date: string;
  start_time: string;
  end_time: string;
  room: string | null;
  building: string | null;
  type: string;
  mode: string;
  status: string;
  online_meeting_url: string | null;
  lecture_number: number;
  expected_students: number | null;
  actual_attendance: number;
  course?: {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
  };
}

interface AttendanceRecord {
  id: number;
  student_id: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'LEFT_EARLY';
  check_in_time: string | null;
  notes: string | null;
  student?: {
    id: number;
    student_id: string;
    full_name_en: string;
    full_name_ar: string;
  };
}

interface LectureMaterial {
  id: number;
  type: string;
  title_en: string;
  title_ar: string;
  file_name: string | null;
  is_visible_to_students: boolean;
  download_count: number;
}

const API_BASE = '/api';

const LecturerLectures: React.FC = () => {
  const { t, language } = useTranslation();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [todayLectures, setTodayLectures] = useState<Lecture[]>([]);
  const [upcomingLectures, setUpcomingLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected lecture for details/attendance
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [materials, setMaterials] = useState<LectureMaterial[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<'today' | 'upcoming' | 'all'>('today');

  // Filters
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [courses, setCourses] = useState<{ id: number; code: string; name_en: string; name_ar: string }[]>([]);

  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    POSTPONED: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const statusLabels: Record<string, { en: string; ar: string }> = {
    SCHEDULED: { en: 'Scheduled', ar: 'مجدولة' },
    IN_PROGRESS: { en: 'In Progress', ar: 'جارية' },
    COMPLETED: { en: 'Completed', ar: 'مكتملة' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغاة' },
    POSTPONED: { en: 'Postponed', ar: 'مؤجلة' },
  };

  const attendanceStatusColors: Record<string, string> = {
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    LATE: 'bg-yellow-100 text-yellow-800',
    EXCUSED: 'bg-blue-100 text-blue-800',
    LEFT_EARLY: 'bg-orange-100 text-orange-800',
  };

  const attendanceStatusLabels: Record<string, { en: string; ar: string }> = {
    PRESENT: { en: 'Present', ar: 'حاضر' },
    ABSENT: { en: 'Absent', ar: 'غائب' },
    LATE: { en: 'Late', ar: 'متأخر' },
    EXCUSED: { en: 'Excused', ar: 'بعذر' },
    LEFT_EARLY: { en: 'Left Early', ar: 'انصرف مبكراً' },
  };

  useEffect(() => {
    fetchData();
    fetchCourses();
  }, [viewMode, selectedCourse]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch based on view mode
      if (viewMode === 'today') {
        const response = await fetch(`${API_BASE}/lectures/today`, { headers });
        if (!response.ok) throw new Error('Failed to fetch today lectures');
        const data = await response.json();
        setTodayLectures(data);
        setLectures(data);
      } else if (viewMode === 'upcoming') {
        const params = new URLSearchParams();
        params.append('limit', '20');
        if (selectedCourse) params.append('course_id', selectedCourse.toString());

        const response = await fetch(`${API_BASE}/lectures/upcoming?${params}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch upcoming lectures');
        const data = await response.json();
        setUpcomingLectures(data);
        setLectures(data);
      } else {
        const params = new URLSearchParams();
        params.append('per_page', '50');
        if (selectedCourse) params.append('course_id', selectedCourse.toString());

        const response = await fetch(`${API_BASE}/lecturer/lectures?${params}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch lectures');
        const data = await response.json();
        setLectures(data.lectures || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lecturer/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || data || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchAttendance = async (lectureId: number) => {
    setAttendanceLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${lectureId}/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      setAttendance(data.attendance || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const initializeAttendance = async (lectureId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${lectureId}/attendance/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to initialize attendance');
      await fetchAttendance(lectureId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateAttendance = async (lectureId: number, studentId: number, status: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${lectureId}/attendance/record`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId, status }),
      });
      if (!response.ok) throw new Error('Failed to update attendance');
      await fetchAttendance(lectureId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleStartLecture = async (lecture: Lecture) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${lecture.id}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to start lecture');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCompleteLecture = async (lecture: Lecture) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${lecture.id}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to complete lecture');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const openAttendanceModal = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    fetchAttendance(lecture.id);
    setShowAttendanceModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString?.slice(0, 5) || '';
  };

  const getAttendanceStats = () => {
    const stats = {
      present: attendance.filter((a) => a.status === 'PRESENT').length,
      absent: attendance.filter((a) => a.status === 'ABSENT').length,
      late: attendance.filter((a) => a.status === 'LATE').length,
      excused: attendance.filter((a) => a.status === 'EXCUSED').length,
    };
    return stats;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'محاضراتي' : 'My Lectures'}
        </h1>
        <p className="text-gray-600 mt-1">
          {language === 'ar' ? 'إدارة المحاضرات وتسجيل الحضور' : 'Manage lectures and record attendance'}
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {language === 'ar' ? 'اليوم' : 'Today'}
        </button>
        <button
          onClick={() => setViewMode('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {language === 'ar' ? 'القادمة' : 'Upcoming'}
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {language === 'ar' ? 'الكل' : 'All'}
        </button>
      </div>

      {/* Course Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : '')}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{language === 'ar' ? 'كل المقررات' : 'All Courses'}</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {language === 'ar' ? course.name_ar : course.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Lectures List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : lectures.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {viewMode === 'today'
              ? language === 'ar'
                ? 'لا توجد محاضرات اليوم'
                : 'No lectures today'
              : language === 'ar'
              ? 'لا توجد محاضرات'
              : 'No lectures found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Lecture Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-16 rounded-full ${
                          lecture.status === 'IN_PROGRESS'
                            ? 'bg-yellow-500'
                            : lecture.status === 'COMPLETED'
                            ? 'bg-green-500'
                            : lecture.status === 'CANCELLED'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500">#{lecture.lecture_number}</span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[lecture.status]}`}
                          >
                            {statusLabels[lecture.status]?.[language]}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {language === 'ar' ? lecture.title_ar : lecture.title_en}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {lecture.course?.code} -{' '}
                          {language === 'ar' ? lecture.course?.name_ar : lecture.course?.name_en}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(lecture.lecture_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(lecture.start_time)} - {formatTime(lecture.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{lecture.room || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {lecture.actual_attendance}/{lecture.expected_students || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {lecture.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleStartLecture(lecture)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Play className="w-4 h-4" />
                        {language === 'ar' ? 'بدء' : 'Start'}
                      </button>
                    )}
                    {lecture.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleCompleteLecture(lecture)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {language === 'ar' ? 'إنهاء' : 'Complete'}
                      </button>
                    )}
                    <button
                      onClick={() => openAttendanceModal(lecture)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      {language === 'ar' ? 'الحضور' : 'Attendance'}
                    </button>
                    {lecture.online_meeting_url && (
                      <a
                        href={lecture.online_meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm"
                      >
                        <Video className="w-4 h-4" />
                        {language === 'ar' ? 'رابط' : 'Link'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {language === 'ar' ? 'تسجيل الحضور' : 'Record Attendance'}
                </h2>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? selectedLecture.title_ar : selectedLecture.title_en}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  setSelectedLecture(null);
                  setAttendance([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-6">
                {(() => {
                  const stats = getAttendanceStats();
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">
                          {language === 'ar' ? 'حاضر' : 'Present'}: {stats.present}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">
                          {language === 'ar' ? 'غائب' : 'Absent'}: {stats.absent}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">
                          {language === 'ar' ? 'متأخر' : 'Late'}: {stats.late}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm">
                          {language === 'ar' ? 'بعذر' : 'Excused'}: {stats.excused}
                        </span>
                      </div>
                    </>
                  );
                })()}
                <button
                  onClick={() => initializeAttendance(selectedLecture.id)}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                >
                  {language === 'ar' ? 'تهيئة الحضور' : 'Initialize Attendance'}
                </button>
              </div>
            </div>

            {/* Attendance List */}
            <div className="flex-1 overflow-y-auto p-4">
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {language === 'ar'
                      ? 'لا توجد سجلات حضور. اضغط "تهيئة الحضور" للبدء.'
                      : 'No attendance records. Click "Initialize Attendance" to start.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'ar'
                            ? record.student?.full_name_ar
                            : record.student?.full_name_en}
                        </p>
                        <p className="text-sm text-gray-500">{record.student?.student_id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              updateAttendance(selectedLecture.id, record.student_id, status)
                            }
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                              record.status === status
                                ? attendanceStatusColors[status]
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {attendanceStatusLabels[status]?.[language]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerLectures;

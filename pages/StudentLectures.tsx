import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  BookOpen,
  FileText,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  User,
  Paperclip,
  Play,
  Star,
  QrCode,
} from 'lucide-react';

interface Lecture {
  id: number;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  lecture_date: string;
  start_time: string;
  end_time: string;
  room: string | null;
  building: string | null;
  type: string;
  mode: string;
  status: string;
  online_meeting_url: string | null;
  recording_url: string | null;
  lecture_number: number;
  topics_covered: string | null;
  course?: {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
  };
  lecturer?: {
    id: number;
    name: string;
  };
  materials_count?: number;
}

interface LectureMaterial {
  id: number;
  type: string;
  title_en: string;
  title_ar: string;
  description: string | null;
  file_name: string | null;
  external_url: string | null;
  is_downloadable: boolean;
}

interface AttendanceRecord {
  id: number;
  lecture_id: number;
  status: string;
  check_in_time: string | null;
  lecture?: Lecture;
}

const API_BASE = '/api';

interface StudentLecturesProps {
  lang: 'en' | 'ar';
}

const StudentLectures: React.FC<StudentLecturesProps> = ({ lang }) => {
  const toast = useToast();
  const language = lang;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [todayLectures, setTodayLectures] = useState<Lecture[]>([]);
  const [upcomingLectures, setUpcomingLectures] = useState<Lecture[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);

  // Selected lecture for details
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lectureMaterials, setLectureMaterials] = useState<LectureMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [courses, setCourses] = useState<{ id: number; code: string; name_en: string; name_ar: string }[]>([]);

  // Active tab
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'attendance'>('today');

  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    POSTPONED: 'bg-purple-100 text-purple-800',
  };

  const statusLabels: Record<string, { en: string; ar: string }> = {
    SCHEDULED: { en: 'Scheduled', ar: 'مجدولة' },
    IN_PROGRESS: { en: 'In Progress', ar: 'جارية الآن' },
    COMPLETED: { en: 'Completed', ar: 'انتهت' },
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

  const materialTypeIcons: Record<string, React.ReactNode> = {
    SLIDES: <FileText className="w-4 h-4 text-orange-500" />,
    PDF: <FileText className="w-4 h-4 text-red-500" />,
    VIDEO: <Play className="w-4 h-4 text-purple-500" />,
    LINK: <Eye className="w-4 h-4 text-blue-500" />,
    DOCUMENT: <FileText className="w-4 h-4 text-gray-500" />,
  };

  useEffect(() => {
    fetchData();
    fetchCourses();
  }, [selectedCourse]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch today's lectures
      const todayParams = new URLSearchParams();
      if (selectedCourse) todayParams.append('course_id', selectedCourse.toString());
      const todayResponse = await fetch(`${API_BASE}/lectures/today?${todayParams}`, { headers });
      if (todayResponse.ok) {
        const data = await todayResponse.json();
        setTodayLectures(data);
      }

      // Fetch upcoming lectures
      const upcomingParams = new URLSearchParams();
      upcomingParams.append('limit', '10');
      if (selectedCourse) upcomingParams.append('course_id', selectedCourse.toString());
      const upcomingResponse = await fetch(`${API_BASE}/lectures/upcoming?${upcomingParams}`, { headers });
      if (upcomingResponse.ok) {
        const data = await upcomingResponse.json();
        setUpcomingLectures(data);
      }

      // Fetch my attendance
      const attendanceResponse = await fetch(`${API_BASE}/my-attendance?per_page=20`, { headers });
      if (attendanceResponse.ok) {
        const data = await attendanceResponse.json();
        setMyAttendance(data.attendance?.data || data.attendance || []);
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
      const response = await fetch(`${API_BASE}/my-enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const enrolledCourses = (data.data || data || []).map((e: any) => e.course).filter(Boolean);
        setCourses(enrolledCourses);
      }
    } catch {
      // Courses fetch failed - handled gracefully
    }
  };

  const fetchLectureMaterials = async (lectureId: number) => {
    setMaterialsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${lectureId}/materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLectureMaterials(data);
      }
    } catch {
      // Materials fetch failed - handled gracefully
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleCheckIn = async (lectureId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${lectureId}/check-in`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check in');
      }
      toast.success(language === 'ar' ? 'تم تسجيل حضورك بنجاح!' : 'Check-in successful!');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const openDetailsModal = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    fetchLectureMaterials(lecture.id);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return language === 'ar' ? 'اليوم' : 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return language === 'ar' ? 'غداً' : 'Tomorrow';
    }

    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString?.slice(0, 5) || '';
  };

  const LectureCard: React.FC<{ lecture: Lecture; showDate?: boolean }> = ({ lecture, showDate = false }) => (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => openDetailsModal(lecture)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-500">#{lecture.lecture_number}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[lecture.status]}`}>
              {statusLabels[lecture.status]?.[language]}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">
            {language === 'ar' ? lecture.title_ar : lecture.title_en}
          </h3>
          <p className="text-sm text-gray-600">
            {lecture.course?.code} - {language === 'ar' ? lecture.course?.name_ar : lecture.course?.name_en}
          </p>
        </div>
        {lecture.status === 'IN_PROGRESS' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCheckIn(lecture.id);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            <QrCode className="w-4 h-4" />
            {language === 'ar' ? 'تسجيل الحضور' : 'Check In'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {showDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(lecture.lecture_date)}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            {formatTime(lecture.start_time)} - {formatTime(lecture.end_time)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>
            {lecture.building && lecture.room
              ? `${lecture.building} - ${lecture.room}`
              : lecture.room || (lecture.mode === 'ONLINE' ? (language === 'ar' ? 'أونلاين' : 'Online') : '-')}
          </span>
        </div>
        {lecture.lecturer && (
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{lecture.lecturer.name}</span>
          </div>
        )}
      </div>

      {lecture.online_meeting_url && lecture.status === 'IN_PROGRESS' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={lecture.online_meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Video className="w-4 h-4" />
            {language === 'ar' ? 'انضم للمحاضرة' : 'Join Lecture'}
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'المحاضرات' : 'Lectures'}
        </h1>
        <p className="text-gray-600 mt-1">
          {language === 'ar' ? 'عرض المحاضرات والمواد الدراسية' : 'View lectures and course materials'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'today'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {language === 'ar' ? 'اليوم' : 'Today'}
          {todayLectures.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
              {todayLectures.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {language === 'ar' ? 'القادمة' : 'Upcoming'}
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'attendance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {language === 'ar' ? 'سجل الحضور' : 'Attendance'}
        </button>
      </div>

      {/* Course Filter */}
      <div className="mb-6">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : '')}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Today's Lectures */}
          {activeTab === 'today' && (
            <div>
              {todayLectures.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {language === 'ar' ? 'لا توجد محاضرات اليوم' : 'No lectures today'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayLectures.map((lecture) => (
                    <LectureCard key={lecture.id} lecture={lecture} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Lectures */}
          {activeTab === 'upcoming' && (
            <div>
              {upcomingLectures.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {language === 'ar' ? 'لا توجد محاضرات قادمة' : 'No upcoming lectures'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingLectures.map((lecture) => (
                    <LectureCard key={lecture.id} lecture={lecture} showDate />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attendance Records */}
          {activeTab === 'attendance' && (
            <div>
              {myAttendance.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {language === 'ar' ? 'لا توجد سجلات حضور' : 'No attendance records'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          {language === 'ar' ? 'المحاضرة' : 'Lecture'}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          {language === 'ar' ? 'التاريخ' : 'Date'}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          {language === 'ar' ? 'الحالة' : 'Status'}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          {language === 'ar' ? 'وقت الحضور' : 'Check-in Time'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {myAttendance.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {language === 'ar' ? record.lecture?.title_ar : record.lecture?.title_en}
                            </p>
                            <p className="text-sm text-gray-500">
                              {record.lecture?.course?.code}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.lecture?.lecture_date
                              ? formatDate(record.lecture.lecture_date)
                              : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                attendanceStatusColors[record.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {attendanceStatusLabels[record.status]?.[language] || record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.check_in_time
                              ? new Date(record.check_in_time).toLocaleTimeString(
                                  language === 'ar' ? 'ar-SA' : 'en-US',
                                  { hour: '2-digit', minute: '2-digit' }
                                )
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Lecture Details Modal */}
      {showDetailsModal && selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">
                    #{selectedLecture.lecture_number}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[selectedLecture.status]}`}>
                    {statusLabels[selectedLecture.status]?.[language]}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'ar' ? selectedLecture.title_ar : selectedLecture.title_en}
                </h2>
                <p className="text-gray-600">
                  {selectedLecture.course?.code} -{' '}
                  {language === 'ar' ? selectedLecture.course?.name_ar : selectedLecture.course?.name_en}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLecture(null);
                  setLectureMaterials([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedLecture.lecture_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(selectedLecture.start_time)} - {formatTime(selectedLecture.end_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {selectedLecture.building && selectedLecture.room
                      ? `${selectedLecture.building} - ${selectedLecture.room}`
                      : selectedLecture.room || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{selectedLecture.lecturer?.name || '-'}</span>
                </div>
              </div>

              {/* Description */}
              {(selectedLecture.description_en || selectedLecture.description_ar) && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'ar' ? selectedLecture.description_ar : selectedLecture.description_en}
                  </p>
                </div>
              )}

              {/* Topics Covered */}
              {selectedLecture.topics_covered && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {language === 'ar' ? 'المواضيع المغطاة' : 'Topics Covered'}
                  </h3>
                  <p className="text-gray-600 text-sm">{selectedLecture.topics_covered}</p>
                </div>
              )}

              {/* Online Meeting */}
              {selectedLecture.online_meeting_url && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <a
                    href={selectedLecture.online_meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-800"
                  >
                    <Video className="w-5 h-5" />
                    <span className="font-medium">
                      {language === 'ar' ? 'رابط المحاضرة الإلكترونية' : 'Online Meeting Link'}
                    </span>
                  </a>
                </div>
              )}

              {/* Recording */}
              {selectedLecture.recording_url && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <a
                    href={selectedLecture.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-700 hover:text-purple-800"
                  >
                    <Play className="w-5 h-5" />
                    <span className="font-medium">
                      {language === 'ar' ? 'تسجيل المحاضرة' : 'Lecture Recording'}
                    </span>
                  </a>
                </div>
              )}

              {/* Materials */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  {language === 'ar' ? 'المواد والملفات' : 'Materials & Files'}
                </h3>
                {materialsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                ) : lectureMaterials.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    {language === 'ar' ? 'لا توجد مواد متاحة' : 'No materials available'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lectureMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {materialTypeIcons[material.type] || (
                            <Paperclip className="w-4 h-4 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {language === 'ar' ? material.title_ar : material.title_en}
                            </p>
                            {material.file_name && (
                              <p className="text-xs text-gray-500">{material.file_name}</p>
                            )}
                          </div>
                        </div>
                        {material.is_downloadable && (
                          <a
                            href={
                              material.external_url ||
                              `${API_BASE}/lectures/${selectedLecture.id}/materials/${material.id}/download`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLectures;

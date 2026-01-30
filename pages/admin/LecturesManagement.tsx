import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
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
  Trash2,
  Eye,
  Upload,
  Download,
  Copy,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  User,
  FileText,
  Link as LinkIcon,
  MoreVertical,
  ChevronDown,
  AlertCircle,
  Pause,
} from 'lucide-react';

interface Lecture {
  id: number;
  course_id: number;
  lecturer_id: number;
  semester_id: number | null;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  lecture_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  room: string | null;
  building: string | null;
  type: 'REGULAR' | 'MAKEUP' | 'EXTRA' | 'EXAM_REVIEW' | 'WORKSHOP' | 'LAB' | 'ONLINE';
  mode: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  online_meeting_url: string | null;
  recording_url: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  topics_covered: string | null;
  notes: string | null;
  lecture_number: number;
  expected_students: number | null;
  actual_attendance: number;
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
}

interface Course {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
}

interface Lecturer {
  id: number;
  name: string;
  email: string;
}

interface LectureMaterial {
  id: number;
  lecture_id: number;
  type: string;
  title_en: string;
  title_ar: string;
  file_name: string | null;
  external_url: string | null;
  is_visible_to_students: boolean;
  is_downloadable: boolean;
  download_count: number;
}

const API_BASE = '/api';

const LecturesManagement: React.FC = () => {
  const { t, language } = useTranslation();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Lecture>>({
    type: 'REGULAR',
    mode: 'IN_PERSON',
    status: 'SCHEDULED',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    POSTPONED: 'bg-purple-100 text-purple-800',
  };

  const statusLabels: Record<string, { en: string; ar: string }> = {
    SCHEDULED: { en: 'Scheduled', ar: 'مجدولة' },
    IN_PROGRESS: { en: 'In Progress', ar: 'جارية' },
    COMPLETED: { en: 'Completed', ar: 'مكتملة' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغاة' },
    POSTPONED: { en: 'Postponed', ar: 'مؤجلة' },
  };

  const typeLabels: Record<string, { en: string; ar: string }> = {
    REGULAR: { en: 'Regular', ar: 'عادية' },
    MAKEUP: { en: 'Makeup', ar: 'تعويضية' },
    EXTRA: { en: 'Extra', ar: 'إضافية' },
    EXAM_REVIEW: { en: 'Exam Review', ar: 'مراجعة امتحان' },
    WORKSHOP: { en: 'Workshop', ar: 'ورشة عمل' },
    LAB: { en: 'Lab', ar: 'معمل' },
    ONLINE: { en: 'Online', ar: 'أونلاين' },
  };

  const modeLabels: Record<string, { en: string; ar: string }> = {
    IN_PERSON: { en: 'In Person', ar: 'حضوري' },
    ONLINE: { en: 'Online', ar: 'عن بُعد' },
    HYBRID: { en: 'Hybrid', ar: 'مختلط' },
  };

  useEffect(() => {
    fetchLectures();
    fetchCourses();
    fetchLecturers();
  }, [currentPage, selectedCourse, selectedStatus, selectedType, dateFrom, dateTo, searchQuery]);

  const fetchLectures = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('per_page', perPage.toString());
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCourse) params.append('course_id', selectedCourse.toString());
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedType) params.append('type', selectedType);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch lectures');

      const data = await response.json();
      setLectures(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/courses?per_page=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lecturers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch lecturers');

      const data = await response.json();
      setLecturers(data || []);
    } catch (err) {
      console.error('Error fetching lecturers:', err);
      setLecturers([]);
    }
  };

  const handleCreateLecture = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lecture');
      }

      setShowCreateModal(false);
      setFormData({ type: 'REGULAR', mode: 'IN_PERSON', status: 'SCHEDULED' });
      fetchLectures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateLecture = async () => {
    if (!selectedLecture) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${selectedLecture.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update lecture');
      }

      setShowEditModal(false);
      setSelectedLecture(null);
      setFormData({ type: 'REGULAR', mode: 'IN_PERSON', status: 'SCHEDULED' });
      fetchLectures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteLecture = async (id: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المحاضرة؟' : 'Are you sure you want to delete this lecture?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete lecture');
      }

      fetchLectures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleStartLecture = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${id}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to start lecture');
      fetchLectures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCompleteLecture = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${id}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to complete lecture');
      fetchLectures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancelLecture = async (id: number) => {
    const reason = prompt(language === 'ar' ? 'أدخل سبب الإلغاء:' : 'Enter cancellation reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/lectures/${id}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to cancel lecture');
      fetchLectures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const openEditModal = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setFormData(lecture);
    setShowEditModal(true);
  };

  const openViewModal = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setShowViewModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString?.slice(0, 5) || '';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'إدارة المحاضرات' : 'Lectures Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'ar' ? 'إدارة وجدولة المحاضرات ومتابعة الحضور' : 'Manage and schedule lectures, track attendance'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة محاضرة' : 'Add Lecture'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{language === 'ar' ? 'كل المقررات' : 'All Courses'}</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {language === 'ar' ? course.name_ar : course.name_en}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{language === 'ar' ? 'كل الحالات' : 'All Status'}</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {language === 'ar' ? label.ar : label.en}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{language === 'ar' ? 'كل الأنواع' : 'All Types'}</option>
            {Object.entries(typeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {language === 'ar' ? label.ar : label.en}
              </option>
            ))}
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={language === 'ar' ? 'من تاريخ' : 'From date'}
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={language === 'ar' ? 'إلى تاريخ' : 'To date'}
          />
        </div>
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

      {/* Lectures Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : lectures.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{language === 'ar' ? 'لا توجد محاضرات' : 'No lectures found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'العنوان' : 'Title'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'المقرر' : 'Course'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'الوقت' : 'Time'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'القاعة' : 'Room'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'الحضور' : 'Attendance'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{lecture.lecture_number}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {language === 'ar' ? lecture.title_ar : lecture.title_en}
                      </div>
                      {lecture.mode !== 'IN_PERSON' && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                          <Video className="w-3 h-3" />
                          {modeLabels[lecture.mode]?.[language] || lecture.mode}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{lecture.course?.code}</div>
                      <div className="text-xs text-gray-500">
                        {language === 'ar' ? lecture.course?.name_ar : lecture.course?.name_en}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(lecture.lecture_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatTime(lecture.start_time)} - {formatTime(lecture.end_time)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {lecture.building && lecture.room
                        ? `${lecture.building} - ${lecture.room}`
                        : lecture.room || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {typeLabels[lecture.type]?.[language] || lecture.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[lecture.status]}`}>
                        {statusLabels[lecture.status]?.[language] || lecture.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {lecture.actual_attendance} / {lecture.expected_students || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openViewModal(lecture)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title={language === 'ar' ? 'عرض' : 'View'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {lecture.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() => openEditModal(lecture)}
                              className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                              title={language === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStartLecture(lecture.id)}
                              className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                              title={language === 'ar' ? 'بدء' : 'Start'}
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {lecture.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleCompleteLecture(lecture.id)}
                            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                            title={language === 'ar' ? 'إنهاء' : 'Complete'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(lecture.status === 'SCHEDULED' || lecture.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => handleCancelLecture(lecture.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {lecture.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleDeleteLecture(lecture.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title={language === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <span className="text-sm text-gray-600">
              {language === 'ar'
                ? `صفحة ${currentPage} من ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreateModal
                  ? language === 'ar'
                    ? 'إضافة محاضرة جديدة'
                    : 'Add New Lecture'
                  : language === 'ar'
                  ? 'تعديل المحاضرة'
                  : 'Edit Lecture'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Course and Lecturer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'المقرر' : 'Course'} *
                  </label>
                  <select
                    value={formData.course_id || ''}
                    onChange={(e) => setFormData({ ...formData, course_id: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{language === 'ar' ? 'اختر المقرر' : 'Select Course'}</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {language === 'ar' ? course.name_ar : course.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'المحاضر' : 'Lecturer'} *
                  </label>
                  <select
                    value={formData.lecturer_id || ''}
                    onChange={(e) => setFormData({ ...formData, lecturer_id: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{language === 'ar' ? 'اختر المحاضر' : 'Select Lecturer'}</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title_ar || ''}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'التاريخ' : 'Date'} *
                  </label>
                  <input
                    type="date"
                    value={formData.lecture_date || ''}
                    onChange={(e) => setFormData({ ...formData, lecture_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'وقت البداية' : 'Start Time'} *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'وقت النهاية' : 'End Time'} *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'المبنى' : 'Building'}
                  </label>
                  <input
                    type="text"
                    value={formData.building || ''}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'القاعة' : 'Room'}
                  </label>
                  <input
                    type="text"
                    value={formData.room || ''}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type and Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </label>
                  <select
                    value={formData.type || 'REGULAR'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Lecture['type'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {language === 'ar' ? label.ar : label.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'طريقة الحضور' : 'Mode'}
                  </label>
                  <select
                    value={formData.mode || 'IN_PERSON'}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as Lecture['mode'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(modeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {language === 'ar' ? label.ar : label.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Online Meeting URL */}
              {(formData.mode === 'ONLINE' || formData.mode === 'HYBRID') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'رابط الاجتماع' : 'Meeting URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.online_meeting_url || ''}
                    onChange={(e) => setFormData({ ...formData, online_meeting_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Lecture Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'رقم المحاضرة' : 'Lecture Number'}
                </label>
                <input
                  type="number"
                  value={formData.lecture_number || ''}
                  onChange={(e) => setFormData({ ...formData, lecture_number: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedLecture(null);
                  setFormData({ type: 'REGULAR', mode: 'IN_PERSON', status: 'SCHEDULED' });
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={showCreateModal ? handleCreateLecture : handleUpdateLecture}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showCreateModal
                  ? language === 'ar'
                    ? 'إضافة'
                    : 'Add'
                  : language === 'ar'
                  ? 'حفظ التغييرات'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'ar' ? 'تفاصيل المحاضرة' : 'Lecture Details'}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedLecture(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {language === 'ar' ? selectedLecture.title_ar : selectedLecture.title_en}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[selectedLecture.status]}`}>
                  {statusLabels[selectedLecture.status]?.[language]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {selectedLecture.course?.code} -{' '}
                    {language === 'ar' ? selectedLecture.course?.name_ar : selectedLecture.course?.name_en}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{selectedLecture.lecturer?.name}</span>
                </div>
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
                  <Users className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'الحضور:' : 'Attendance:'} {selectedLecture.actual_attendance} /{' '}
                    {selectedLecture.expected_students || '-'}
                  </span>
                </div>
              </div>

              {selectedLecture.online_meeting_url && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Video className="w-5 h-5" />
                    <a
                      href={selectedLecture.online_meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800"
                    >
                      {language === 'ar' ? 'رابط الاجتماع' : 'Meeting Link'}
                    </a>
                  </div>
                </div>
              )}

              {selectedLecture.topics_covered && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {language === 'ar' ? 'المواضيع المغطاة' : 'Topics Covered'}
                  </h4>
                  <p className="text-gray-600 text-sm">{selectedLecture.topics_covered}</p>
                </div>
              )}

              {selectedLecture.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </h4>
                  <p className="text-gray-600 text-sm">{selectedLecture.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturesManagement;

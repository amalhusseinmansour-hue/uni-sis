import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  Lock,
  Unlock,
  CalendarDays,
  Clock,
  Users,
  BookOpen,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

interface SemesterManagementProps {
  lang: 'en' | 'ar';
}

interface Semester {
  id: number;
  name_en: string;
  name_ar: string;
  code?: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  add_drop_start?: string;
  add_drop_end?: string;
  is_current: boolean;
  is_closed: boolean;
  enrollments_count?: number;
}

const t = {
  title: { en: 'Semester Management', ar: 'إدارة الفصول الدراسية' },
  subtitle: { en: 'Manage academic semesters, dates and registration periods', ar: 'إدارة الفصول الدراسية والتواريخ وفترات التسجيل' },
  addSemester: { en: 'Add Semester', ar: 'إضافة فصل' },
  editSemester: { en: 'Edit Semester', ar: 'تعديل الفصل' },
  semesterName: { en: 'Semester Name', ar: 'اسم الفصل' },
  semesterNameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  semesterNameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  academicYear: { en: 'Academic Year', ar: 'السنة الأكاديمية' },
  startDate: { en: 'Start Date', ar: 'تاريخ البداية' },
  endDate: { en: 'End Date', ar: 'تاريخ النهاية' },
  registrationStart: { en: 'Registration Start', ar: 'بداية التسجيل' },
  registrationEnd: { en: 'Registration End', ar: 'نهاية التسجيل' },
  addDropStart: { en: 'Add/Drop Start', ar: 'بداية الإضافة والحذف' },
  addDropEnd: { en: 'Add/Drop End', ar: 'نهاية الإضافة والحذف' },
  isCurrent: { en: 'Current Semester', ar: 'الفصل الحالي' },
  isClosed: { en: 'Closed', ar: 'مغلق' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  close: { en: 'Close Semester', ar: 'إغلاق الفصل' },
  reopen: { en: 'Reopen Semester', ar: 'إعادة فتح الفصل' },
  setCurrent: { en: 'Set as Current', ar: 'تعيين كفصل حالي' },
  confirmDelete: { en: 'Are you sure you want to delete this semester?', ar: 'هل أنت متأكد من حذف هذا الفصل؟' },
  confirmClose: { en: 'Are you sure you want to close this semester?', ar: 'هل أنت متأكد من إغلاق هذا الفصل؟' },
  noSemesters: { en: 'No semesters found', ar: 'لا توجد فصول دراسية' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  saved: { en: 'Saved successfully', ar: 'تم الحفظ بنجاح' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },
  registrationOpen: { en: 'Registration Open', ar: 'التسجيل مفتوح' },
  registrationClosed: { en: 'Registration Closed', ar: 'التسجيل مغلق' },
  semesterDates: { en: 'Semester Dates', ar: 'تواريخ الفصل' },
  registrationPeriod: { en: 'Registration Period', ar: 'فترة التسجيل' },
  addDropPeriod: { en: 'Add/Drop Period', ar: 'فترة الإضافة والحذف' },
  students: { en: 'Students', ar: 'الطلاب' },
  courses: { en: 'Courses', ar: 'المقررات' },
  active: { en: 'Active', ar: 'نشط' },
  closed: { en: 'Closed', ar: 'مغلق' },
  upcoming: { en: 'Upcoming', ar: 'قادم' },
  past: { en: 'Past', ar: 'سابق' },
};

const API_BASE = '/api';

export default function SemesterManagement({ lang }: SemesterManagementProps) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    academic_year: '',
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: '',
    add_drop_start: '',
    add_drop_end: '',
    is_current: false,
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/semesters`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSemesters(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      setError(t.error[lang]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingSemester
        ? `${API_BASE}/semesters/${editingSemester.id}`
        : `${API_BASE}/semesters`;

      const response = await fetch(url, {
        method: editingSemester ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(t.saved[lang]);
        setShowModal(false);
        setEditingSemester(null);
        resetForm();
        fetchSemesters();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.message || t.error[lang]);
      }
    } catch (err) {
      setError(t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/semesters/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchSemesters();
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      setError(t.error[lang]);
    }
  };

  const handleSetCurrent = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/semesters/${id}/set-current`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchSemesters();
        setSuccess(t.saved[lang]);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(t.error[lang]);
    }
  };

  const handleToggleClosed = async (semester: Semester) => {
    try {
      const action = semester.is_closed ? 'reopen' : 'close';
      const response = await fetch(`${API_BASE}/semesters/${semester.id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchSemesters();
        setSuccess(t.saved[lang]);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(t.error[lang]);
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ar: '',
      academic_year: '',
      start_date: '',
      end_date: '',
      registration_start: '',
      registration_end: '',
      add_drop_start: '',
      add_drop_end: '',
      is_current: false,
    });
  };

  const openEditModal = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name_en: semester.name_en,
      name_ar: semester.name_ar,
      academic_year: semester.academic_year,
      start_date: semester.start_date?.split('T')[0] || '',
      end_date: semester.end_date?.split('T')[0] || '',
      registration_start: semester.registration_start?.split('T')[0] || '',
      registration_end: semester.registration_end?.split('T')[0] || '',
      add_drop_start: semester.add_drop_start?.split('T')[0] || '',
      add_drop_end: semester.add_drop_end?.split('T')[0] || '',
      is_current: semester.is_current,
    });
    setShowModal(true);
  };

  const getSemesterStatus = (semester: Semester) => {
    const now = new Date();
    const start = new Date(semester.start_date);
    const end = new Date(semester.end_date);

    if (semester.is_closed) return 'closed';
    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'active';
  };

  const isRegistrationOpen = (semester: Semester) => {
    if (semester.is_closed) return false;
    const now = new Date();
    const start = new Date(semester.registration_start);
    const end = new Date(semester.registration_end);
    return now >= start && now <= end;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t.loading[lang]}</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            {t.title[lang]}
          </h1>
          <p className="text-gray-600 mt-1">{t.subtitle[lang]}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSemester(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t.addSemester[lang]}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Semesters Grid */}
      {semesters.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">{t.noSemesters[lang]}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {semesters.map((semester) => {
            const status = getSemesterStatus(semester);
            const regOpen = isRegistrationOpen(semester);

            return (
              <div
                key={semester.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                  semester.is_current
                    ? 'border-blue-500'
                    : semester.is_closed
                    ? 'border-gray-300 opacity-75'
                    : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {lang === 'ar' ? semester.name_ar : semester.name_en}
                      </h3>
                      <p className="text-sm text-gray-500">{semester.academic_year}</p>
                    </div>
                    <div className="flex gap-1">
                      {semester.is_current && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {t.isCurrent[lang]}
                        </span>
                      )}
                      {semester.is_closed && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {t.closed[lang]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="p-4 space-y-3">
                  {/* Semester Period */}
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{t.semesterDates[lang]}:</span>
                    <span className="font-medium">
                      {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                    </span>
                  </div>

                  {/* Registration Period */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{t.registrationPeriod[lang]}:</span>
                    <span className={`font-medium ${regOpen ? 'text-green-600' : 'text-gray-500'}`}>
                      {formatDate(semester.registration_start)} - {formatDate(semester.registration_end)}
                    </span>
                    {regOpen && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        {t.registrationOpen[lang]}
                      </span>
                    )}
                  </div>

                  {/* Add/Drop Period */}
                  {(semester.add_drop_start || semester.add_drop_end) && (
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{t.addDropPeriod[lang]}:</span>
                      <span className="font-medium">
                        {formatDate(semester.add_drop_start || '')} - {formatDate(semester.add_drop_end || '')}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  {semester.enrollments_count !== undefined && (
                    <div className="flex items-center gap-4 pt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{semester.enrollments_count} {t.students[lang]}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(semester)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t.editSemester[lang]}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(semester.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t.delete[lang]}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {!semester.is_current && !semester.is_closed && (
                      <button
                        onClick={() => handleSetCurrent(semester.id)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {t.setCurrent[lang]}
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleClosed(semester)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        semester.is_closed
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {semester.is_closed ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          {t.reopen[lang]}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          {t.close[lang]}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === semester.id && (
                  <div className="p-4 bg-red-50 border-t border-red-200">
                    <p className="text-sm text-red-700 mb-3">{t.confirmDelete[lang]}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(semester.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        {t.delete[lang]}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        {t.cancel[lang]}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSemester ? t.editSemester[lang] : t.addSemester[lang]}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.semesterNameEn[lang]}
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.semesterNameAr[lang]}
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dir="rtl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.academicYear[lang]}
                  </label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2024-2025"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.startDate[lang]}
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.endDate[lang]}
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.registrationStart[lang]}
                    </label>
                    <input
                      type="date"
                      value={formData.registration_start}
                      onChange={(e) => setFormData({ ...formData, registration_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.registrationEnd[lang]}
                    </label>
                    <input
                      type="date"
                      value={formData.registration_end}
                      onChange={(e) => setFormData({ ...formData, registration_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.addDropStart[lang]}
                    </label>
                    <input
                      type="date"
                      value={formData.add_drop_start}
                      onChange={(e) => setFormData({ ...formData, add_drop_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.addDropEnd[lang]}
                    </label>
                    <input
                      type="date"
                      value={formData.add_drop_end}
                      onChange={(e) => setFormData({ ...formData, add_drop_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={formData.is_current}
                    onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_current" className="text-sm text-gray-700">
                    {t.isCurrent[lang]}
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSemester(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t.cancel[lang]}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.loading[lang]}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {t.save[lang]}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

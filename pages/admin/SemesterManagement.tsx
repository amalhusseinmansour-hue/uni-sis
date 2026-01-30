import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Search, Edit2, Trash2, X, Save, Loader2,
  RefreshCw, CheckCircle, XCircle, Clock, PlayCircle, PauseCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';

interface SemesterManagementProps {
  lang: 'en' | 'ar';
}

interface Semester {
  id: number;
  name: string;
  name_en: string;
  name_ar: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  add_drop_start: string | null;
  add_drop_end: string | null;
  is_current: boolean;
  is_closed: boolean;
}

const t = {
  title: { en: 'Semester Management', ar: 'إدارة الفصول الدراسية' },
  subtitle: { en: 'Manage academic semesters and registration periods', ar: 'إدارة الفصول الدراسية وفترات التسجيل' },
  addSemester: { en: 'Add Semester', ar: 'إضافة فصل دراسي' },
  editSemester: { en: 'Edit Semester', ar: 'تعديل الفصل' },
  search: { en: 'Search semesters...', ar: 'البحث في الفصول...' },
  name: { en: 'Semester Name', ar: 'اسم الفصل' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  academicYear: { en: 'Academic Year', ar: 'السنة الأكاديمية' },
  startDate: { en: 'Start Date', ar: 'تاريخ البداية' },
  endDate: { en: 'End Date', ar: 'تاريخ النهاية' },
  registrationStart: { en: 'Registration Start', ar: 'بداية التسجيل' },
  registrationEnd: { en: 'Registration End', ar: 'نهاية التسجيل' },
  addDropStart: { en: 'Add/Drop Start', ar: 'بداية الإضافة والحذف' },
  addDropEnd: { en: 'Add/Drop End', ar: 'نهاية الإضافة والحذف' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  current: { en: 'Current', ar: 'الحالي' },
  closed: { en: 'Closed', ar: 'مغلق' },
  open: { en: 'Open', ar: 'مفتوح' },
  upcoming: { en: 'Upcoming', ar: 'قادم' },
  past: { en: 'Past', ar: 'سابق' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  confirmDelete: { en: 'Are you sure you want to delete this semester?', ar: 'هل أنت متأكد من حذف هذا الفصل؟' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  noSemesters: { en: 'No semesters found', ar: 'لا توجد فصول دراسية' },
  totalSemesters: { en: 'Total Semesters', ar: 'إجمالي الفصول' },
  activeSemesters: { en: 'Active', ar: 'نشط' },
  closedSemesters: { en: 'Closed', ar: 'مغلق' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  setCurrent: { en: 'Set as Current', ar: 'تعيين كالحالي' },
  closeSemester: { en: 'Close Semester', ar: 'إغلاق الفصل' },
  reopenSemester: { en: 'Reopen Semester', ar: 'إعادة فتح الفصل' },
  registrationOpen: { en: 'Registration Open', ar: 'التسجيل مفتوح' },
  registrationClosed: { en: 'Registration Closed', ar: 'التسجيل مغلق' },
  dates: { en: 'Dates', ar: 'التواريخ' },
  registrationPeriod: { en: 'Registration Period', ar: 'فترة التسجيل' },
  addDropPeriod: { en: 'Add/Drop Period', ar: 'فترة الإضافة والحذف' },
  semesterPeriod: { en: 'Semester Period', ar: 'فترة الفصل' },
  page: { en: 'Page', ar: 'صفحة' },
  of: { en: 'of', ar: 'من' },
  showing: { en: 'Showing', ar: 'عرض' },
  to: { en: 'to', ar: 'إلى' },
  entries: { en: 'entries', ar: 'سجل' },
  first: { en: 'First', ar: 'الأولى' },
  last: { en: 'Last', ar: 'الأخيرة' },
  previous: { en: 'Previous', ar: 'السابق' },
  next: { en: 'Next', ar: 'التالي' },
  itemsPerPage: { en: 'Items per page', ar: 'عناصر في الصفحة' },
  currentSemester: { en: 'Current Semester', ar: 'الفصل الحالي' },
  none: { en: 'None', ar: 'لا يوجد' },
};

const SemesterManagement: React.FC<SemesterManagementProps> = ({ lang }) => {
  const toast = useToast();
  const isRTL = lang === 'ar';
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
  });

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/semesters');
      setSemesters(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const filteredSemesters = semesters.filter(semester => {
    const matchesSearch =
      (semester.name_en || semester.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (semester.name_ar || '').includes(searchQuery) ||
      (semester.academic_year || '').includes(searchQuery);
    return matchesSearch;
  });

  const totalItems = filteredSemesters.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedSemesters = filteredSemesters.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const stats = {
    total: semesters.length,
    active: semesters.filter(s => !s.is_closed).length,
    closed: semesters.filter(s => s.is_closed).length,
    current: semesters.find(s => s.is_current),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        name: formData.name_en,
        add_drop_start: formData.add_drop_start || null,
        add_drop_end: formData.add_drop_end || null,
      };

      if (editingSemester) {
        await apiClient.put(`/semesters/${editingSemester.id}`, payload);
      } else {
        await apiClient.post('/semesters', payload);
      }
      fetchSemesters();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving semester:', error);
      toast.error(lang === 'ar' ? 'فشل حفظ الفصل الدراسي' : 'Failed to save semester');
    } finally {
      setSaving(false);
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
    });
    setEditingSemester(null);
  };

  const openEditModal = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name_en: semester.name_en || semester.name || '',
      name_ar: semester.name_ar || semester.name || '',
      academic_year: semester.academic_year || '',
      start_date: semester.start_date?.split('T')[0] || '',
      end_date: semester.end_date?.split('T')[0] || '',
      registration_start: semester.registration_start?.split('T')[0] || '',
      registration_end: semester.registration_end?.split('T')[0] || '',
      add_drop_start: semester.add_drop_start?.split('T')[0] || '',
      add_drop_end: semester.add_drop_end?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete[lang])) return;
    try {
      await apiClient.delete(`/semesters/${id}`);
      fetchSemesters();
    } catch (error) {
      console.error('Error deleting semester:', error);
      toast.error(lang === 'ar' ? 'فشل حذف الفصل الدراسي' : 'Failed to delete semester');
    }
  };

  const setAsCurrent = async (id: number) => {
    try {
      await apiClient.post(`/semesters/${id}/set-current`);
      fetchSemesters();
    } catch (error) {
      console.error('Error setting current semester:', error);
      toast.error(lang === 'ar' ? 'فشل تعيين الفصل الحالي' : 'Failed to set current semester');
    }
  };

  const toggleSemesterStatus = async (semester: Semester) => {
    try {
      if (semester.is_closed) {
        await apiClient.post(`/semesters/${semester.id}/reopen`);
      } else {
        await apiClient.post(`/semesters/${semester.id}/close`);
      }
      fetchSemesters();
    } catch (error) {
      console.error('Error toggling semester status:', error);
      toast.error(lang === 'ar' ? 'فشل تحديث حالة الفصل' : 'Failed to update semester status');
    }
  };

  const getStatusBadge = (semester: Semester) => {
    if (semester.is_current) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          {t.current[lang]}
        </span>
      );
    }
    if (semester.is_closed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          {t.closed[lang]}
        </span>
      );
    }
    const now = new Date();
    const startDate = new Date(semester.start_date);
    const endDate = new Date(semester.end_date);

    if (now < startDate) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Clock className="w-3 h-3" />
          {t.upcoming[lang]}
        </span>
      );
    }
    if (now > endDate) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          <AlertCircle className="w-3 h-3" />
          {t.past[lang]}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <PlayCircle className="w-3 h-3" />
        {t.open[lang]}
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            {t.title[lang]}
          </h1>
          <p className="text-slate-500 mt-1">{t.subtitle[lang]}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSemesters}
            className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title={t.refresh[lang]}
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t.addSemester[lang]}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-sm text-slate-500">{t.totalSemesters[lang]}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.active}</p>
              <p className="text-sm text-slate-500">{t.activeSemesters[lang]}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.closed}</p>
              <p className="text-sm text-slate-500">{t.closedSemesters[lang]}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <PlayCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 truncate">
                {stats.current ? (lang === 'ar' ? stats.current.name_ar : stats.current.name_en) : t.none[lang]}
              </p>
              <p className="text-sm text-slate-500">{t.currentSemester[lang]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 start-3" />
            <input
              type="text"
              placeholder={t.search[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 ps-10 pe-4"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-slate-500">{t.loading[lang]}</p>
          </div>
        ) : filteredSemesters.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t.noSemesters[lang]}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-start text-sm font-semibold text-slate-600">{t.name[lang]}</th>
                  <th className="px-6 py-3 text-start text-sm font-semibold text-slate-600">{t.academicYear[lang]}</th>
                  <th className="px-6 py-3 text-start text-sm font-semibold text-slate-600">{t.semesterPeriod[lang]}</th>
                  <th className="px-6 py-3 text-start text-sm font-semibold text-slate-600">{t.registrationPeriod[lang]}</th>
                  <th className="px-6 py-3 text-start text-sm font-semibold text-slate-600">{t.status[lang]}</th>
                  <th className="px-6 py-3 text-start text-sm font-semibold text-slate-600">{t.actions[lang]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSemesters.map((semester) => (
                  <tr key={semester.id} className={`hover:bg-slate-50 ${semester.is_current ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {lang === 'ar' ? (semester.name_ar || semester.name) : (semester.name_en || semester.name)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {lang === 'ar' ? (semester.name_en || semester.name) : (semester.name_ar || semester.name)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-700">{semester.academic_year}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-600">{formatDate(semester.start_date)}</p>
                        <p className="text-slate-400">→ {formatDate(semester.end_date)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-600">{formatDate(semester.registration_start)}</p>
                        <p className="text-slate-400">→ {formatDate(semester.registration_end)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(semester)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {!semester.is_current && (
                          <button
                            onClick={() => setAsCurrent(semester.id)}
                            className="p-2 hover:bg-green-100 rounded-lg text-slate-600 hover:text-green-600 transition-colors"
                            title={t.setCurrent[lang]}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleSemesterStatus(semester)}
                          className={`p-2 rounded-lg transition-colors ${
                            semester.is_closed
                              ? 'hover:bg-green-100 text-slate-600 hover:text-green-600'
                              : 'hover:bg-amber-100 text-slate-600 hover:text-amber-600'
                          }`}
                          title={semester.is_closed ? t.reopenSemester[lang] : t.closeSemester[lang]}
                        >
                          {semester.is_closed ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(semester)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(semester.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredSemesters.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{t.itemsPerPage[lang]}:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <span className="text-sm text-slate-500">
                  {t.showing[lang]} {startIndex + 1} {t.to[lang]} {endIndex} {t.of[lang]} {totalItems} {t.entries[lang]}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRTL ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRTL ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingSemester ? t.editSemester[lang] : t.addSemester[lang]}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameEn[lang]}</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Fall 2025"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameAr[lang]}</label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="الفصل الأول 2025"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.academicYear[lang]}</label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="2025-2026"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-700 mb-3">{t.semesterPeriod[lang]}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.startDate[lang]}</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.endDate[lang]}</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-700 mb-3">{t.registrationPeriod[lang]}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.registrationStart[lang]}</label>
                    <input
                      type="date"
                      value={formData.registration_start}
                      onChange={(e) => setFormData({ ...formData, registration_start: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.registrationEnd[lang]}</label>
                    <input
                      type="date"
                      value={formData.registration_end}
                      onChange={(e) => setFormData({ ...formData, registration_end: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="font-medium text-amber-700 mb-3">{t.addDropPeriod[lang]}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.addDropStart[lang]}</label>
                    <input
                      type="date"
                      value={formData.add_drop_start}
                      onChange={(e) => setFormData({ ...formData, add_drop_start: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t.addDropEnd[lang]}</label>
                    <input
                      type="date"
                      value={formData.add_drop_end}
                      onChange={(e) => setFormData({ ...formData, add_drop_end: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {t.cancel[lang]}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t.save[lang]}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterManagement;

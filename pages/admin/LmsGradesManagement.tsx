import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit2, Trash2, RefreshCw, Loader2, BookOpen,
  Search, Filter, Download, Upload, Check, X, Save, AlertCircle,
  GraduationCap, Users, Calendar
} from 'lucide-react';
import apiClient from '../../api/client';
import { lmsAPI } from '../../api/lms';
import { useToast } from '../../hooks/useToast';

interface LmsGradesManagementProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'LMS Grades Management', ar: 'إدارة درجات نظام التعلم' },
  subtitle: { en: 'Manage and import grades from Learning Management System', ar: 'إدارة واستيراد الدرجات من نظام إدارة التعلم' },
  back: { en: 'Back', ar: 'رجوع' },
  addGrade: { en: 'Add Grade', ar: 'إضافة درجة' },
  importFromLms: { en: 'Import from LMS', ar: 'استيراد من LMS' },
  syncToSis: { en: 'Sync to SIS', ar: 'مزامنة مع SIS' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  student: { en: 'Student', ar: 'الطالب' },
  course: { en: 'Course', ar: 'المادة' },
  semester: { en: 'Semester', ar: 'الفصل الدراسي' },
  grade: { en: 'Grade', ar: 'الدرجة' },
  maxGrade: { en: 'Max Grade', ar: 'الدرجة القصوى' },
  percentage: { en: 'Percentage', ar: 'النسبة المئوية' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  inProgress: { en: 'In Progress', ar: 'قيد التقدم' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  failed: { en: 'Failed', ar: 'راسب' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  edit: { en: 'Edit', ar: 'تعديل' },
  confirmDelete: { en: 'Are you sure you want to delete this grade?', ar: 'هل أنت متأكد من حذف هذه الدرجة؟' },
  noData: { en: 'No LMS grades found', ar: 'لا توجد درجات LMS' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  gradeAdded: { en: 'Grade added successfully', ar: 'تمت إضافة الدرجة بنجاح' },
  gradeUpdated: { en: 'Grade updated successfully', ar: 'تم تحديث الدرجة بنجاح' },
  gradeDeleted: { en: 'Grade deleted successfully', ar: 'تم حذف الدرجة بنجاح' },
  importSuccess: { en: 'Grades imported successfully', ar: 'تم استيراد الدرجات بنجاح' },
  syncSuccess: { en: 'Grades synced to SIS successfully', ar: 'تمت مزامنة الدرجات مع SIS بنجاح' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },
  selectEnrollment: { en: 'Select Enrollment', ar: 'اختر التسجيل' },
  filterBySemester: { en: 'Filter by Semester', ar: 'تصفية حسب الفصل' },
  filterByCourse: { en: 'Filter by Course', ar: 'تصفية حسب المادة' },
  allSemesters: { en: 'All Semesters', ar: 'جميع الفصول' },
  allCourses: { en: 'All Courses', ar: 'جميع المواد' },
  synced: { en: 'Synced', ar: 'متزامن' },
  notSynced: { en: 'Not Synced', ar: 'غير متزامن' },
  totalGrades: { en: 'Total Grades', ar: 'إجمالي الدرجات' },
  syncedGrades: { en: 'Synced Grades', ar: 'الدرجات المتزامنة' },
  pendingSync: { en: 'Pending Sync', ar: 'بانتظار المزامنة' },
};

const LmsGradesManagement: React.FC<LmsGradesManagementProps> = ({ lang }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  const [semesterFilter, setSemesterFilter] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [formData, setFormData] = useState({
    enrollment_id: '',
    moodle_grade: '',
    moodle_grade_max: '100',
    completion_status: 'IN_PROGRESS' as 'IN_PROGRESS' | 'COMPLETED' | 'FAILED',
  });

  useEffect(() => {
    fetchData();
  }, [semesterFilter, courseFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch grades
      const params: any = {};
      if (semesterFilter) params.semester_id = semesterFilter;
      if (courseFilter) params.course_id = courseFilter;

      const gradesRes = await lmsAPI.getAdminLmsGrades(params);
      setGrades(gradesRes.data || []);

      // Fetch semesters and courses for filters
      const [semestersRes, coursesRes, enrollmentsRes] = await Promise.all([
        apiClient.get('/semesters').catch(() => ({ data: [] })),
        apiClient.get('/courses').catch(() => ({ data: [] })),
        apiClient.get('/enrollments?per_page=1000').catch(() => ({ data: { data: [] } })),
      ]);

      setSemesters(semestersRes.data?.data || semestersRes.data || []);
      setCourses(coursesRes.data?.data || coursesRes.data || []);
      setEnrollments(enrollmentsRes.data?.data || enrollmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromLms = async () => {
    try {
      setSaving(true);
      await lmsAPI.importGrades();
      toast.success(t.importSuccess[lang]);
      fetchData();
    } catch (error) {
      console.error('Error importing grades:', error);
      toast.error(t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToSis = async () => {
    try {
      setSaving(true);
      await lmsAPI.syncGradesToSIS();
      toast.success(t.syncSuccess[lang]);
      fetchData();
    } catch (error) {
      console.error('Error syncing grades:', error);
      toast.error(t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const openModal = (grade?: any) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        enrollment_id: grade.enrollment_id?.toString() || '',
        moodle_grade: grade.moodle_grade?.toString() || '',
        moodle_grade_max: grade.moodle_grade_max?.toString() || '100',
        completion_status: grade.completion_status || 'IN_PROGRESS',
      });
    } else {
      setEditingGrade(null);
      setFormData({
        enrollment_id: '',
        moodle_grade: '',
        moodle_grade_max: '100',
        completion_status: 'IN_PROGRESS',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGrade(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (editingGrade) {
        await lmsAPI.updateLmsGrade(editingGrade.id, {
          moodle_grade: parseFloat(formData.moodle_grade),
          moodle_grade_max: parseFloat(formData.moodle_grade_max),
          completion_status: formData.completion_status,
        });
        toast.success(t.gradeUpdated[lang]);
      } else {
        await lmsAPI.addLmsGrade({
          enrollment_id: parseInt(formData.enrollment_id),
          moodle_grade: parseFloat(formData.moodle_grade),
          moodle_grade_max: parseFloat(formData.moodle_grade_max),
          completion_status: formData.completion_status,
        });
        toast.success(t.gradeAdded[lang]);
      }

      closeModal();
      fetchData();
    } catch (error: any) {
      console.error('Error saving grade:', error);
      toast.error(error?.response?.data?.message || t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete[lang])) return;

    try {
      await lmsAPI.deleteLmsGrade(id);
      toast.success(t.gradeDeleted[lang]);
      fetchData();
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast.error(t.error[lang]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return t.completed[lang];
      case 'FAILED': return t.failed[lang];
      default: return t.inProgress[lang];
    }
  };

  // Stats
  const totalGrades = grades.length;
  const syncedGrades = grades.filter(g => g.synced_to_sis).length;
  const pendingSync = totalGrades - syncedGrades;

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back[lang]}
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.title[lang]}</h1>
              <p className="text-green-100">{t.subtitle[lang]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t.totalGrades[lang]}</p>
                <p className="text-2xl font-bold text-slate-800">{totalGrades}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t.syncedGrades[lang]}</p>
                <p className="text-2xl font-bold text-green-600">{syncedGrades}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t.pendingSync[lang]}</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingSync}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.addGrade[lang]}
          </button>
          <button
            onClick={handleImportFromLms}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t.importFromLms[lang]}
          </button>
          <button
            onClick={handleSyncToSis}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {t.syncToSis[lang]}
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t.refresh[lang]}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.filterBySemester[lang]}</label>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t.allSemesters[lang]}</option>
                {semesters.map((sem: any) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name || sem.name_en} - {sem.academic_year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.filterByCourse[lang]}</label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t.allCourses[lang]}</option>
                {courses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {lang === 'ar' ? course.name_ar : course.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600 mb-4" />
              <p className="text-slate-500">{t.loading[lang]}</p>
            </div>
          ) : grades.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{t.noData[lang]}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{t.student[lang]}</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{t.course[lang]}</th>
                    <th className="text-start px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{t.semester[lang]}</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{t.grade[lang]}</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{t.percentage[lang]}</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{t.status[lang]}</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{t.synced[lang]}</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{t.actions[lang]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((grade) => {
                    const percentage = grade.moodle_grade_max > 0
                      ? ((grade.moodle_grade / grade.moodle_grade_max) * 100).toFixed(1)
                      : 0;
                    return (
                      <tr key={grade.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">
                            {lang === 'ar' ? grade.student_name_ar : grade.student_name_en}
                          </p>
                          <p className="text-xs text-slate-500">{grade.student_number}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-sm text-blue-600">{grade.course_code}</p>
                          <p className="text-sm text-slate-600">
                            {lang === 'ar' ? grade.course_name_ar : grade.course_name_en}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-600">{grade.semester_name || grade.semester_name_en}</p>
                          <p className="text-xs text-slate-400">{grade.academic_year}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-lg">{grade.moodle_grade}</span>
                          <span className="text-slate-400">/{grade.moodle_grade_max}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${
                            Number(percentage) >= 90 ? 'text-green-600' :
                            Number(percentage) >= 80 ? 'text-blue-600' :
                            Number(percentage) >= 70 ? 'text-yellow-600' :
                            Number(percentage) >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(grade.completion_status)}`}>
                            {getStatusLabel(grade.completion_status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {grade.synced_to_sis ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <X className="w-4 h-4" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal(grade)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(grade.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {editingGrade ? t.edit[lang] : t.addGrade[lang]}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {!editingGrade && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.selectEnrollment[lang]}
                  </label>
                  <select
                    value={formData.enrollment_id}
                    onChange={(e) => setFormData({ ...formData, enrollment_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">{t.selectEnrollment[lang]}</option>
                    {enrollments.map((enr: any) => (
                      <option key={enr.id} value={enr.id}>
                        {enr.student?.name_ar || enr.student?.name_en} - {enr.course?.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.grade[lang]}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.moodle_grade}
                    onChange={(e) => setFormData({ ...formData, moodle_grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.maxGrade[lang]}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.moodle_grade_max}
                    onChange={(e) => setFormData({ ...formData, moodle_grade_max: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.status[lang]}</label>
                <select
                  value={formData.completion_status}
                  onChange={(e) => setFormData({ ...formData, completion_status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="IN_PROGRESS">{t.inProgress[lang]}</option>
                  <option value="COMPLETED">{t.completed[lang]}</option>
                  <option value="FAILED">{t.failed[lang]}</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LmsGradesManagement;

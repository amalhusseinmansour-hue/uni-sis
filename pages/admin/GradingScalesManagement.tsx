import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
  Award,
  Check,
  X,
  Save,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';

interface GradingScalesManagementProps {
  lang: 'en' | 'ar';
}

type ProgramType = 'BACHELOR' | 'GRADUATE';

const t = {
  title: { en: 'Grading Scale Management', ar: 'إدارة سلم التقدير' },
  subtitle: { en: 'Configure grade letters, points and score ranges', ar: 'إعداد التقديرات والنقاط ونطاقات الدرجات' },
  back: { en: 'Back', ar: 'رجوع' },
  addGrade: { en: 'Add Grade', ar: 'إضافة تقدير' },
  editGrade: { en: 'Edit Grade', ar: 'تعديل التقدير' },
  resetToDefault: { en: 'Reset to Default', ar: 'إعادة للافتراضي' },
  letterGrade: { en: 'Letter Grade', ar: 'التقدير' },
  minScore: { en: 'Min Score', ar: 'أقل درجة' },
  maxScore: { en: 'Max Score', ar: 'أعلى درجة' },
  gradePoints: { en: 'Grade Points', ar: 'النقاط' },
  description: { en: 'Description', ar: 'الوصف' },
  descriptionEn: { en: 'Description (English)', ar: 'الوصف (إنجليزي)' },
  descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (عربي)' },
  isPassing: { en: 'Passing', ar: 'ناجح' },
  isActive: { en: 'Active', ar: 'فعال' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  confirmDelete: { en: 'Are you sure you want to delete this grade?', ar: 'هل أنت متأكد من حذف هذا التقدير؟' },
  confirmReset: { en: 'This will reset all grades to default values. Continue?', ar: 'سيتم إعادة جميع التقديرات للقيم الافتراضية. متابعة؟' },
  gradeUpdated: { en: 'Grade updated successfully', ar: 'تم تحديث التقدير بنجاح' },
  gradeAdded: { en: 'Grade added successfully', ar: 'تم إضافة التقدير بنجاح' },
  gradeDeleted: { en: 'Grade deleted successfully', ar: 'تم حذف التقدير بنجاح' },
  gradesReset: { en: 'Grades reset to default', ar: 'تم إعادة التقديرات للافتراضي' },
  noData: { en: 'No grading scales found', ar: 'لا توجد تقديرات' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  error: { en: 'Error saving grade', ar: 'خطأ في حفظ التقدير' },
  yes: { en: 'Yes', ar: 'نعم' },
  no: { en: 'No', ar: 'لا' },
  bachelor: { en: 'Bachelor', ar: 'البكالوريوس' },
  graduate: { en: 'Graduate Studies', ar: 'الدراسات العليا' },
  bachelorDesc: { en: 'Undergraduate program grading scale', ar: 'سلم تقدير برنامج البكالوريوس' },
  graduateDesc: { en: 'Master & PhD program grading scale', ar: 'سلم تقدير برنامج الماجستير والدكتوراه' },
  programType: { en: 'Program Type', ar: 'نوع البرنامج' },
};

const GradingScalesManagement: React.FC<GradingScalesManagementProps> = ({ lang }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gradingScales, setGradingScales] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingScale, setEditingScale] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ProgramType>('BACHELOR');
  const [formData, setFormData] = useState({
    letter_grade: '',
    min_score: '',
    max_score: '',
    grade_points: '',
    description_en: '',
    description_ar: '',
    is_passing: true,
    is_active: true,
    program_type: 'BACHELOR' as ProgramType,
  });

  useEffect(() => {
    fetchGradingScales();
  }, [activeTab]);

  const fetchGradingScales = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/grading-scales', {
        params: { program_type: activeTab }
      });
      const data = response.data.data || response.data || [];
      // Sort by min_score descending (highest first)
      const sorted = [...data].sort((a, b) => (b.min_score || 0) - (a.min_score || 0));
      setGradingScales(sorted);
    } catch (error: any) {
      console.error('Error fetching grading scales:', error);
      // If table doesn't exist, show helpful message
      if (error?.response?.status === 500) {
        toast.error('جدول التقديرات غير موجود. يرجى فتح الرابط التالي أولاً: /api/seed-grading-scales');
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = (scale?: any) => {
    if (scale) {
      setEditingScale(scale);
      setFormData({
        letter_grade: scale.letter_grade || '',
        min_score: scale.min_score?.toString() || '',
        max_score: scale.max_score?.toString() || '',
        grade_points: scale.grade_points?.toString() || '',
        description_en: scale.description_en || '',
        description_ar: scale.description_ar || '',
        is_passing: scale.is_passing ?? true,
        is_active: scale.is_active ?? true,
        program_type: scale.program_type || activeTab,
      });
    } else {
      setEditingScale(null);
      setFormData({
        letter_grade: '',
        min_score: '',
        max_score: '',
        grade_points: '',
        description_en: '',
        description_ar: '',
        is_passing: true,
        is_active: true,
        program_type: activeTab,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingScale(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = {
        letter_grade: formData.letter_grade,
        min_score: parseFloat(formData.min_score),
        max_score: parseFloat(formData.max_score),
        grade_points: parseFloat(formData.grade_points),
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        is_passing: formData.is_passing,
        is_active: formData.is_active,
        program_type: formData.program_type,
      };

      if (editingScale) {
        await apiClient.put(`/grading-scales/${editingScale.id}`, data);
        toast.success(t.gradeUpdated[lang]);
      } else {
        await apiClient.post('/grading-scales', data);
        toast.success(t.gradeAdded[lang]);
      }

      closeModal();
      fetchGradingScales();
    } catch (error: any) {
      console.error('Error saving grading scale:', error);
      const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || t.error[lang];
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete[lang])) return;

    try {
      await apiClient.delete(`/grading-scales/${id}`);
      toast.success(t.gradeDeleted[lang]);
      fetchGradingScales();
    } catch (error) {
      console.error('Error deleting grading scale:', error);
    }
  };

  const handleReset = async () => {
    if (!confirm(t.confirmReset[lang])) return;

    try {
      await apiClient.post('/grading-scales/reset', { program_type: activeTab });
      toast.success(t.gradesReset[lang]);
      fetchGradingScales();
    } catch (error) {
      console.error('Error resetting grading scales:', error);
    }
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'bg-green-100 text-green-700 border-green-200';
    if (['B+', 'B', 'B-'].includes(grade)) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (['C+', 'C', 'C-'].includes(grade)) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (['D+', 'D'].includes(grade)) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{t.title[lang]}</h1>
                <p className="text-sm text-slate-500">{t.subtitle[lang]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                {t.resetToDefault[lang]}
              </button>
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {t.addGrade[lang]}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('BACHELOR')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              activeTab === 'BACHELOR'
                ? 'bg-blue-50 border-blue-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${activeTab === 'BACHELOR' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <BookOpen className={`w-6 h-6 ${activeTab === 'BACHELOR' ? 'text-blue-600' : 'text-slate-500'}`} />
              </div>
              <div className="text-start">
                <h3 className={`font-bold ${activeTab === 'BACHELOR' ? 'text-blue-700' : 'text-slate-700'}`}>
                  {t.bachelor[lang]}
                </h3>
                <p className="text-sm text-slate-500">{t.bachelorDesc[lang]}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('GRADUATE')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              activeTab === 'GRADUATE'
                ? 'bg-purple-50 border-purple-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${activeTab === 'GRADUATE' ? 'bg-purple-100' : 'bg-slate-100'}`}>
                <GraduationCap className={`w-6 h-6 ${activeTab === 'GRADUATE' ? 'text-purple-600' : 'text-slate-500'}`} />
              </div>
              <div className="text-start">
                <h3 className={`font-bold ${activeTab === 'GRADUATE' ? 'text-purple-700' : 'text-slate-700'}`}>
                  {t.graduate[lang]}
                </h3>
                <p className="text-sm text-slate-500">{t.graduateDesc[lang]}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ms-2 text-slate-600">{t.loading[lang]}</span>
          </div>
        ) : gradingScales.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">{t.noData[lang]}</p>
            <button
              onClick={() => openModal()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t.addGrade[lang]}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.letterGrade[lang]}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.minScore[lang]}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.maxScore[lang]}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.gradePoints[lang]}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.description[lang]}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.isPassing[lang]}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.isActive[lang]}</th>
                    <th className="px-4 py-3 text-start text-sm font-medium text-slate-600">{t.actions[lang]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gradingScales.map((scale) => (
                    <tr key={scale.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(scale.letter_grade)}`}>
                          {scale.letter_grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{scale.min_score}</td>
                      <td className="px-4 py-3 text-sm font-medium">{scale.max_score}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">{scale.grade_points}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {lang === 'ar' ? scale.description_ar : scale.description_en}
                      </td>
                      <td className="px-4 py-3">
                        {scale.is_passing ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Check className="w-4 h-4" /> {t.yes[lang]}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <X className="w-4 h-4" /> {t.no[lang]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {scale.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{t.yes[lang]}</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">{t.no[lang]}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(scale)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title={t.editGrade[lang]}
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(scale.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title={t.delete[lang]}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {gradingScales.map((scale) => (
                <div key={scale.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-4 py-2 rounded-full text-lg font-bold border ${getGradeColor(scale.letter_grade)}`}>
                      {scale.letter_grade}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(scale)}
                        className="p-2 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(scale.id)}
                        className="p-2 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">{t.minScore[lang]}</p>
                      <p className="font-bold">{scale.min_score}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">{t.maxScore[lang]}</p>
                      <p className="font-bold">{scale.max_score}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-blue-500">{t.gradePoints[lang]}</p>
                      <p className="font-bold text-blue-700">{scale.grade_points}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {lang === 'ar' ? scale.description_ar : scale.description_en}
                    </span>
                    <div className="flex items-center gap-2">
                      {scale.is_passing ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{t.isPassing[lang]}</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">F</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {editingScale ? t.editGrade[lang] : t.addGrade[lang]}
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.letterGrade[lang]} *</label>
                <input
                  type="text"
                  value={formData.letter_grade}
                  onChange={(e) => setFormData({ ...formData, letter_grade: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="A+, A, B+, ..."
                  maxLength={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.minScore[lang]} *</label>
                  <input
                    type="number"
                    value={formData.min_score}
                    onChange={(e) => setFormData({ ...formData, min_score: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.maxScore[lang]} *</label>
                  <input
                    type="number"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.gradePoints[lang]} *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.grade_points}
                  onChange={(e) => setFormData({ ...formData, grade_points: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.descriptionEn[lang]}</label>
                <input
                  type="text"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Excellent, Very Good, ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.descriptionAr[lang]}</label>
                <input
                  type="text"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ممتاز، جيد جداً، ..."
                  dir="rtl"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_passing}
                    onChange={(e) => setFormData({ ...formData, is_passing: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">{t.isPassing[lang]}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">{t.isActive[lang]}</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.letter_grade || !formData.min_score || !formData.max_score || !formData.grade_points}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingScalesManagement;

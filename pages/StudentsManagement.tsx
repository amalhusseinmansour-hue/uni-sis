import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Filter, Download, Upload, Eye, Edit2, Trash2,
  Mail, Phone, Calendar, MapPin, GraduationCap, CreditCard, FileText,
  ChevronDown, X, Check, RefreshCw, MoreVertical, AlertCircle, CheckCircle,
  User, Building, BookOpen, Clock, ArrowRight, Save, Loader2, IdCard
} from 'lucide-react';
import { studentsAPI } from '../api/students';
import { exportToCSV } from '../utils/exportUtils';

interface StudentsManagementProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'Students Management', ar: 'إدارة الطلاب' },
  subtitle: { en: 'Manage student records, documents, and academic information', ar: 'إدارة سجلات الطلاب والمستندات والمعلومات الأكاديمية' },
  addStudent: { en: 'Add Student', ar: 'إضافة طالب' },
  search: { en: 'Search students...', ar: 'بحث عن طالب...' },
  filterByStatus: { en: 'Status', ar: 'الحالة' },
  filterByProgram: { en: 'Program', ar: 'البرنامج' },
  all: { en: 'All', ar: 'الكل' },
  active: { en: 'Active', ar: 'نشط' },
  suspended: { en: 'Suspended', ar: 'موقوف' },
  graduated: { en: 'Graduated', ar: 'متخرج' },
  withdrawn: { en: 'Withdrawn', ar: 'منسحب' },
  export: { en: 'Export', ar: 'تصدير' },
  import: { en: 'Import', ar: 'استيراد' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  studentId: { en: 'Student ID', ar: 'الرقم الجامعي' },
  name: { en: 'Name', ar: 'الاسم' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  phone: { en: 'Phone', ar: 'الهاتف' },
  program: { en: 'Program', ar: 'البرنامج' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  viewProfile: { en: 'View Profile', ar: 'عرض الملف' },
  editStudent: { en: 'Edit', ar: 'تعديل' },
  sendEmail: { en: 'Send Email', ar: 'إرسال بريد' },
  noStudents: { en: 'No students found', ar: 'لا يوجد طلاب' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  personalInfo: { en: 'Personal Information', ar: 'المعلومات الشخصية' },
  academicInfo: { en: 'Academic Information', ar: 'المعلومات الأكاديمية' },
  contactInfo: { en: 'Contact Information', ar: 'معلومات الاتصال' },
  documents: { en: 'Documents', ar: 'المستندات' },
  enrollments: { en: 'Enrollments', ar: 'التسجيلات' },
  financials: { en: 'Financials', ar: 'المالية' },
  close: { en: 'Close', ar: 'إغلاق' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  totalStudents: { en: 'Total Students', ar: 'إجمالي الطلاب' },
  activeStudents: { en: 'Active', ar: 'نشط' },
  newThisMonth: { en: 'New This Month', ar: 'جديد هذا الشهر' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  nationalId: { en: 'National ID', ar: 'رقم الهوية' },
  dateOfBirth: { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  gender: { en: 'Gender', ar: 'الجنس' },
  male: { en: 'Male', ar: 'ذكر' },
  female: { en: 'Female', ar: 'أنثى' },
  nationality: { en: 'Nationality', ar: 'الجنسية' },
  admissionDate: { en: 'Admission Date', ar: 'تاريخ القبول' },
  address: { en: 'Address', ar: 'العنوان' },
  personalEmail: { en: 'Personal Email', ar: 'البريد الشخصي' },
  universityEmail: { en: 'University Email', ar: 'البريد الجامعي' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  generating: { en: 'Generating...', ar: 'جاري الإنشاء...' },
};

const StudentsManagement: React.FC<StudentsManagementProps> = ({ lang }) => {
  const isRTL = lang === 'ar';
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0 });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    student_id: '',
    national_id: '',
    date_of_birth: '',
    gender: 'MALE',
    nationality: '',
    phone: '',
    personal_email: '',
    university_email: '',
    program_id: '',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    password: '',
  });

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 100 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await studentsAPI.getAll(params);
      const studentsList = response?.data || response || [];
      setStudents(studentsList);

      // Calculate stats
      const active = studentsList.filter((s: any) => s.status === 'ACTIVE').length;
      const thisMonth = studentsList.filter((s: any) => {
        const admDate = new Date(s.admission_date || s.created_at);
        const now = new Date();
        return admDate.getMonth() === now.getMonth() && admDate.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        total: studentsList.length,
        active,
        newThisMonth: thisMonth
      });
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle add student
  const handleAddStudent = async () => {
    try {
      setSaving(true);
      const response = await studentsAPI.create(formData);
      setShowAddModal(false);
      setFormData({
        name_en: '', name_ar: '', student_id: '', national_id: '', date_of_birth: '',
        gender: 'MALE', nationality: '', phone: '', personal_email: '', university_email: '',
        program_id: '', admission_date: new Date().toISOString().split('T')[0], status: 'ACTIVE', password: ''
      });
      fetchStudents();

      // Show credentials
      const credentials = response?.credentials || response?.data?.credentials;
      if (credentials) {
        alert(
          lang === 'ar'
            ? `تم إضافة الطالب بنجاح!\n\nبيانات الدخول:\nالرقم الجامعي: ${credentials.student_id}\nالبريد الجامعي: ${credentials.email}`
            : `Student added successfully!\n\nCredentials:\nStudent ID: ${credentials.student_id}\nUniversity Email: ${credentials.email}`
        );
      } else {
        alert(lang === 'ar' ? 'تم إضافة الطالب بنجاح' : 'Student added successfully');
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    } finally {
      setSaving(false);
    }
  };

  // Handle view profile
  const handleViewProfile = async (student: any) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
    setActiveTab('personal');
  };

  // Handle CSV file upload for import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase().replace(/['"]/g, ''));

      const parsedData = lines.slice(1)
        .filter((line: string) => line.trim())
        .map((line: string, index: number) => {
          const values = line.split(',').map((v: string) => v.trim().replace(/['"]/g, ''));
          const row: any = { _index: index + 1 };

          headers.forEach((header: string, i: number) => {
            // Map common header variations to our field names
            const fieldMap: { [key: string]: string } = {
              'name': 'name_en',
              'name_en': 'name_en',
              'name_ar': 'name_ar',
              'english name': 'name_en',
              'arabic name': 'name_ar',
              'national_id': 'national_id',
              'national id': 'national_id',
              'id number': 'national_id',
              'email': 'personal_email',
              'personal_email': 'personal_email',
              'phone': 'phone',
              'mobile': 'phone',
              'gender': 'gender',
              'nationality': 'nationality',
              'date_of_birth': 'date_of_birth',
              'dob': 'date_of_birth',
              'birth date': 'date_of_birth',
              'password': 'password',
            };

            const mappedField = fieldMap[header] || header.replace(/\s+/g, '_');
            row[mappedField] = values[i] || '';
          });

          // Generate password if not provided
          if (!row.password) {
            row.password = Math.random().toString(36).slice(-8) + 'A1!';
          }

          // Default gender
          if (row.gender) {
            row.gender = row.gender.toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE';
          } else {
            row.gender = 'MALE';
          }

          return row;
        });

      setImportData(parsedData);
    };
    reader.readAsText(file);
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    if (importData.length === 0) return;

    setImportLoading(true);
    setImportProgress({ current: 0, total: importData.length, success: 0, failed: 0 });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < importData.length; i++) {
      const student = importData[i];
      try {
        await studentsAPI.create({
          name_en: student.name_en,
          name_ar: student.name_ar || student.name_en,
          national_id: student.national_id,
          personal_email: student.personal_email || `${student.name_en?.toLowerCase().replace(/\s/g, '.')}@temp.com`,
          phone: student.phone,
          gender: student.gender,
          nationality: student.nationality,
          date_of_birth: student.date_of_birth,
          password: student.password,
        });
        success++;
      } catch (error: any) {
        console.error(`Error importing student ${student.name_en}:`, error);
        failed++;
      }
      setImportProgress({ current: i + 1, total: importData.length, success, failed });
    }

    setImportLoading(false);

    if (failed === 0) {
      alert(
        lang === 'ar'
          ? `تم استيراد ${success} طالب بنجاح!`
          : `Successfully imported ${success} students!`
      );
      setShowImportModal(false);
      setImportData([]);
      fetchStudents();
    } else {
      alert(
        lang === 'ar'
          ? `تم استيراد ${success} طالب. فشل استيراد ${failed} طالب.`
          : `Imported ${success} students. Failed to import ${failed} students.`
      );
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = 'name_en,name_ar,national_id,personal_email,phone,gender,nationality,date_of_birth,password\nJohn Doe,جون دو,1234567890,john@email.com,+1234567890,MALE,Saudi,1995-01-01,';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_import_template.csv';
    a.click();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'SUSPENDED': return 'bg-red-100 text-red-700';
      case 'GRADUATED': return 'bg-blue-100 text-blue-700';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            {t.title[lang]}
          </h1>
          <p className="text-slate-500 mt-1">{t.subtitle[lang]}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700"
          >
            <Upload className="w-4 h-4" />
            {t.import[lang]}
          </button>
          <button
            onClick={() => exportToCSV(students, 'students-export')}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700"
          >
            <Download className="w-4 h-4" />
            {t.export[lang]}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            {t.addStudent[lang]}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.totalStudents[lang]}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.activeStudents[lang]}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.newThisMonth[lang]}</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.newThisMonth}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search[lang]}
                className="w-full ps-10 pe-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t.all[lang]} {t.status[lang]}</option>
            <option value="ACTIVE">{t.active[lang]}</option>
            <option value="SUSPENDED">{t.suspended[lang]}</option>
            <option value="GRADUATED">{t.graduated[lang]}</option>
            <option value="WITHDRAWN">{t.withdrawn[lang]}</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchStudents}
            className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50"
            title={t.refresh[lang]}
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-slate-500">{t.loading[lang]}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t.noStudents[lang]}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-end' : 'text-start'}`}>
                    {t.studentId[lang]}
                  </th>
                  <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-end' : 'text-start'}`}>
                    {t.name[lang]}
                  </th>
                  <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-end' : 'text-start'}`}>
                    {t.email[lang]}
                  </th>
                  <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-end' : 'text-start'}`}>
                    {t.program[lang]}
                  </th>
                  <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-end' : 'text-start'}`}>
                    {t.status[lang]}
                  </th>
                  <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-end' : 'text-start'}`}>
                    {t.actions[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-blue-600 font-medium">{student.student_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {(student.name_en || student.name_ar || 'S')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {lang === 'ar' ? student.name_en : student.name_ar}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {student.university_email || student.personal_email || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {student.program ? (lang === 'ar' ? student.program.name_ar : student.program.name_en) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>
                        {student.status === 'ACTIVE' ? t.active[lang] :
                         student.status === 'SUSPENDED' ? t.suspended[lang] :
                         student.status === 'GRADUATED' ? t.graduated[lang] :
                         student.status === 'WITHDRAWN' ? t.withdrawn[lang] : student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewProfile(student)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                          title={t.viewProfile[lang]}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-green-100 rounded-lg text-slate-600 hover:text-green-600 transition-colors"
                          title={t.editStudent[lang]}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-purple-100 rounded-lg text-slate-600 hover:text-purple-600 transition-colors"
                          title={t.sendEmail[lang]}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {t.addStudent[lang]}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameEn[lang]} *</label>
                  <input
                    type="text"
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameAr[lang]}</label>
                  <input
                    type="text"
                    name="name_ar"
                    value={formData.name_ar}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.studentId[lang]}</label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    placeholder={lang === 'ar' ? 'سيتم إنشاؤه تلقائياً' : 'Auto-generated if empty'}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.nationalId[lang]} *</label>
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.dateOfBirth[lang]}</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.gender[lang]}</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="MALE">{t.male[lang]}</option>
                    <option value="FEMALE">{t.female[lang]}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.nationality[lang]}</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.phone[lang]}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.personalEmail[lang]} *</label>
                  <input
                    type="email"
                    name="personal_email"
                    value={formData.personal_email}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.password[lang]} *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.admissionDate[lang]}</label>
                  <input
                    type="date"
                    name="admission_date"
                    value={formData.admission_date}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.status[lang]}</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="ACTIVE">{t.active[lang]}</option>
                    <option value="SUSPENDED">{t.suspended[lang]}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleAddStudent}
                disabled={saving || !formData.name_en || !formData.national_id || !formData.personal_email || !formData.password}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t.generating[lang] : t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white relative">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 end-4 p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
                  {(selectedStudent.name_en || selectedStudent.name_ar || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {lang === 'ar' ? (selectedStudent.name_ar || selectedStudent.name_en) : (selectedStudent.name_en || selectedStudent.name_ar)}
                  </h2>
                  <p className="text-white/80">{selectedStudent.student_id}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedStudent.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex overflow-x-auto">
                {[
                  { id: 'personal', label: t.personalInfo[lang], icon: User },
                  { id: 'academic', label: t.academicInfo[lang], icon: GraduationCap },
                  { id: 'contact', label: t.contactInfo[lang], icon: Phone },
                  { id: 'documents', label: t.documents[lang], icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label={t.nameEn[lang]} value={selectedStudent.name_en} />
                  <InfoRow label={t.nameAr[lang]} value={selectedStudent.name_ar} />
                  <InfoRow label={t.nationalId[lang]} value={selectedStudent.national_id} />
                  <InfoRow label={t.dateOfBirth[lang]} value={selectedStudent.date_of_birth} />
                  <InfoRow label={t.gender[lang]} value={selectedStudent.gender === 'MALE' ? t.male[lang] : t.female[lang]} />
                  <InfoRow label={t.nationality[lang]} value={selectedStudent.nationality} />
                  <InfoRow label={t.admissionDate[lang]} value={selectedStudent.admission_date} />
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label={t.studentId[lang]} value={selectedStudent.student_id} />
                  <InfoRow label={t.program[lang]} value={selectedStudent.program?.name_en || selectedStudent.program?.name_ar} />
                  <InfoRow label={t.status[lang]} value={selectedStudent.status} />
                  <InfoRow label={lang === 'ar' ? 'المستوى' : 'Level'} value={selectedStudent.current_level} />
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label={t.phone[lang]} value={selectedStudent.phone} icon={Phone} />
                  <InfoRow label={t.personalEmail[lang]} value={selectedStudent.personal_email} icon={Mail} />
                  <InfoRow label={t.universityEmail[lang]} value={selectedStudent.university_email} icon={Mail} />
                  <InfoRow label={t.address[lang]} value={selectedStudent.address_city} icon={MapPin} />
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>{lang === 'ar' ? 'لا توجد مستندات' : 'No documents uploaded'}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                {t.close[lang]}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                {t.editStudent[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Students Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {lang === 'ar' ? 'استيراد الطلاب' : 'Import Students'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {lang === 'ar' ? 'رفع ملف CSV لاستيراد الطلاب بكميات كبيرة' : 'Upload a CSV file to bulk import students'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData([]);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {importData.length === 0 ? (
                <div className="space-y-6">
                  {/* Download Template */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">
                          {lang === 'ar' ? 'تحميل القالب' : 'Download Template'}
                        </h4>
                        <p className="text-sm text-blue-600 mt-1">
                          {lang === 'ar'
                            ? 'قم بتحميل قالب CSV وملئه ببيانات الطلاب'
                            : 'Download the CSV template and fill it with student data'}
                        </p>
                        <button
                          onClick={downloadTemplate}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {lang === 'ar' ? 'تحميل القالب' : 'Download Template'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="font-medium text-slate-700">
                      {lang === 'ar' ? 'اسحب الملف هنا أو' : 'Drag file here or'}
                    </h3>
                    <label className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {lang === 'ar' ? 'اختر ملف' : 'Choose File'}
                    </label>
                    <p className="text-sm text-slate-500 mt-3">
                      {lang === 'ar' ? 'الصيغ المدعومة: CSV' : 'Supported formats: CSV'}
                    </p>
                  </div>

                  {/* Required Fields */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-medium text-slate-700 mb-2">
                      {lang === 'ar' ? 'الحقول المطلوبة:' : 'Required Fields:'}
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      <li>name_en - {lang === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</li>
                      <li>national_id - {lang === 'ar' ? 'رقم الهوية' : 'National ID'}</li>
                      <li>personal_email - {lang === 'ar' ? 'البريد الشخصي' : 'Personal Email'}</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">
                      {lang === 'ar' ? `معاينة (${importData.length} طالب)` : `Preview (${importData.length} students)`}
                    </h3>
                    <button
                      onClick={() => setImportData([])}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {lang === 'ar' ? 'مسح وإعادة الاختيار' : 'Clear & Re-select'}
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="max-h-80 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-start font-medium text-slate-600">#</th>
                            <th className="px-4 py-3 text-start font-medium text-slate-600">{t.name[lang]}</th>
                            <th className="px-4 py-3 text-start font-medium text-slate-600">{t.nationalId[lang]}</th>
                            <th className="px-4 py-3 text-start font-medium text-slate-600">{t.email[lang]}</th>
                            <th className="px-4 py-3 text-start font-medium text-slate-600">{t.gender[lang]}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {importData.slice(0, 20).map((student, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-500">{student._index}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{student.name_en}</td>
                              <td className="px-4 py-3 text-slate-600">{student.national_id}</td>
                              <td className="px-4 py-3 text-slate-600">{student.personal_email}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  student.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {student.gender === 'FEMALE' ? (lang === 'ar' ? 'أنثى' : 'Female') : (lang === 'ar' ? 'ذكر' : 'Male')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {importData.length > 20 && (
                      <div className="px-4 py-2 bg-slate-50 text-sm text-slate-500 text-center">
                        {lang === 'ar' ? `... و ${importData.length - 20} آخرين` : `... and ${importData.length - 20} more`}
                      </div>
                    )}
                  </div>

                  {/* Import Progress */}
                  {importLoading && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">
                          {lang === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}
                        </span>
                        <span className="text-sm text-blue-600">
                          {importProgress.current}/{importProgress.total}
                        </span>
                      </div>
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-green-600">✓ {lang === 'ar' ? 'نجح:' : 'Success:'} {importProgress.success}</span>
                        {importProgress.failed > 0 && (
                          <span className="text-red-600">✗ {lang === 'ar' ? 'فشل:' : 'Failed:'} {importProgress.failed}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData([]);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                disabled={importLoading}
              >
                {t.cancel[lang]}
              </button>
              {importData.length > 0 && (
                <button
                  onClick={handleBulkImport}
                  disabled={importLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {importLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {importLoading
                    ? (lang === 'ar' ? 'جاري الاستيراد...' : 'Importing...')
                    : (lang === 'ar' ? `استيراد ${importData.length} طالب` : `Import ${importData.length} Students`)
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for info rows
const InfoRow: React.FC<{ label: string; value?: string | number; icon?: any }> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3">
    {Icon && (
      <div className="p-2 bg-slate-100 rounded-lg">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
    )}
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="font-medium text-slate-800 mt-0.5">{value || '-'}</p>
    </div>
  </div>
);

export default StudentsManagement;

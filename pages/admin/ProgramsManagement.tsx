import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Plus, Search, Edit2, Trash2, Eye, X, Save, Loader2,
  BookOpen, Users, Building, RefreshCw, Filter, Download, Layers,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';

interface ProgramsManagementProps {
  lang: 'en' | 'ar';
}

interface Program {
  id: number;
  department_id: number;
  college_id?: number;
  name_en: string;
  name_ar: string;
  code: string;
  type: 'BACHELOR' | 'MASTER' | 'PHD' | 'DIPLOMA';
  total_credits: number;
  description: string | null;
  department?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  college?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  students_count?: number;
}

interface ProgramCourse {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  credits: number;
  semester: number;
  type: 'REQUIRED' | 'ELECTIVE' | 'UNIVERSITY' | 'COLLEGE' | 'MAJOR';
  is_common: boolean;
  order: number;
}

interface Department {
  id: number;
  name_en: string;
  name_ar: string;
  college_id: number;
}

interface College {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
}

interface Course {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  credits: number;
}

const t = {
  title: { en: 'Programs Management', ar: 'إدارة البرامج الأكاديمية' },
  subtitle: { en: 'Manage academic programs and degrees', ar: 'إدارة البرامج والدرجات الأكاديمية' },
  addProgram: { en: 'Add Program', ar: 'إضافة برنامج' },
  editProgram: { en: 'Edit Program', ar: 'تعديل البرنامج' },
  search: { en: 'Search programs...', ar: 'البحث في البرامج...' },
  code: { en: 'Code', ar: 'الرمز' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  type: { en: 'Degree Type', ar: 'نوع الدرجة' },
  credits: { en: 'Credits', ar: 'الساعات' },
  durationYears: { en: 'Duration (Years)', ar: 'المدة (سنوات)' },
  department: { en: 'College', ar: 'الكلية' },
  description: { en: 'Description', ar: 'الوصف' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  bachelor: { en: 'Bachelor', ar: 'بكالوريوس' },
  master: { en: 'Master', ar: 'ماجستير' },
  phd: { en: 'PhD', ar: 'دكتوراه' },
  diploma: { en: 'Diploma', ar: 'دبلوم' },
  all: { en: 'All Types', ar: 'جميع الأنواع' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  confirmDelete: { en: 'Are you sure you want to delete this program?', ar: 'هل أنت متأكد من حذف هذا البرنامج؟' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  noPrograms: { en: 'No programs found', ar: 'لا توجد برامج' },
  totalPrograms: { en: 'Total Programs', ar: 'إجمالي البرامج' },
  bachelorPrograms: { en: 'Bachelor Programs', ar: 'برامج البكالوريوس' },
  masterPrograms: { en: 'Master Programs', ar: 'برامج الماجستير' },
  phdPrograms: { en: 'PhD Programs', ar: 'برامج الدكتوراه' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  export: { en: 'Export', ar: 'تصدير' },
  students: { en: 'Students', ar: 'الطلاب' },
  selectDepartment: { en: 'Select College', ar: 'اختر الكلية' },
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
  selectProgram: { en: 'Select Program', ar: 'اختر البرنامج' },
  allPrograms: { en: 'All Programs', ar: 'جميع البرامج' },
  creditDistribution: { en: 'Credit Distribution', ar: 'توزيع الساعات المعتمدة' },
  courseCount: { en: 'courses', ar: 'مادة' },
  courses: { en: 'Courses', ar: 'المواد الدراسية' },
  viewCourses: { en: 'View Courses', ar: 'عرض المواد' },
  studyPlan: { en: 'Study Plan', ar: 'الخطة الدراسية' },
  semester: { en: 'Semester', ar: 'الفصل' },
  courseName: { en: 'Course Name', ar: 'اسم المادة' },
  courseCode: { en: 'Course Code', ar: 'رمز المادة' },
  courseType: { en: 'Type', ar: 'النوع' },
  addCourse: { en: 'Add Course', ar: 'إضافة مادة' },
  removeCourse: { en: 'Remove', ar: 'حذف' },
  noCourses: { en: 'No courses in this program', ar: 'لا توجد مواد في هذا البرنامج' },
  totalCredits: { en: 'Total Credits', ar: 'إجمالي الساعات' },
  required: { en: 'Required', ar: 'إجباري' },
  elective: { en: 'Elective', ar: 'اختياري' },
  university: { en: 'University', ar: 'متطلب جامعة' },
  college: { en: 'College', ar: 'متطلب كلية' },
  major: { en: 'Major', ar: 'تخصص' },
  selectCourse: { en: 'Select Course', ar: 'اختر المادة' },
  selectSemester: { en: 'Select Semester', ar: 'اختر الفصل' },
  common: { en: 'Common', ar: 'مشترك' },
  editCourse: { en: 'Edit Course', ar: 'تعديل المادة' },
  courseCredits: { en: 'Credit Hours', ar: 'عدد الساعات' },
  updateSuccess: { en: 'Course updated successfully', ar: 'تم تحديث المادة بنجاح' },
  universityReq: { en: 'University Requirements', ar: 'متطلبات الجامعة' },
  collegeReq: { en: 'College Requirements', ar: 'متطلبات الكلية' },
  majorReq: { en: 'Major Requirements', ar: 'متطلبات التخصص' },
  graduationProject: { en: 'Graduation Project', ar: 'مشروع التخرج' },
  viewByType: { en: 'View by Type', ar: 'عرض حسب النوع' },
  viewBySemester: { en: 'View by Semester', ar: 'عرض حسب الفصل' },
  programsByCollege: { en: 'Programs by College', ar: 'التخصصات حسب الكلية' },
  bachelorDegree: { en: 'Bachelor Programs', ar: 'تخصصات البكالوريوس' },
  graduateDegree: { en: 'Graduate Programs', ar: 'تخصصات الدراسات العليا' },
  businessCollege: { en: 'College of Business Administration', ar: 'كلية إدارة الأعمال' },
  engineeringCollege: { en: 'College of Engineering and IT', ar: 'كلية الهندسة وتكنولوجيا المعلومات' },
  healthCollege: { en: 'College of Health and Environmental Sciences', ar: 'كلية العلوم الصحية والبيئية' },
  otherPrograms: { en: 'Other Programs', ar: 'برامج أخرى' },
  noCollege: { en: 'Unassigned Programs', ar: 'برامج غير مصنفة' },
};

const ProgramsManagement: React.FC<ProgramsManagementProps> = ({ lang }) => {
  const toast = useToast();
  const isRTL = lang === 'ar';
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Courses state
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [programCourses, setProgramCourses] = useState<ProgramCourse[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([1]);
  const [viewMode, setViewMode] = useState<'type' | 'semester'>('type');
  const [expandedTypes, setExpandedTypes] = useState<string[]>(['UNIVERSITY', 'COLLEGE', 'MAJOR', 'GRADUATION']);
  const [newCourseData, setNewCourseData] = useState({
    course_id: '',
    semester: 1,
    type: 'REQUIRED',
  });
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ProgramCourse | null>(null);
  const [editCourseData, setEditCourseData] = useState({
    credits: 3,
    name_en: '',
    name_ar: '',
  });

  // Program filter for credit distribution display
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');
  const [filterProgramCourses, setFilterProgramCourses] = useState<ProgramCourse[]>([]);
  const [loadingFilterCourses, setLoadingFilterCourses] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name_en: '',
    name_ar: '',
    type: 'BACHELOR',
    total_credits: 132,
    duration_years: 4,
    college_id: '',
    description: '',
  });

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/programs');
      setPrograms(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get('/departments');
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch colleges
  const fetchColleges = async () => {
    try {
      const response = await apiClient.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  // Fetch all courses (for adding to programs)
  const fetchAllCourses = async () => {
    try {
      const response = await apiClient.get('/courses');
      setAllCourses(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch courses for selected program filter (credit distribution)
  const fetchFilterProgramCourses = async (programId: string) => {
    if (programId === 'all') {
      setFilterProgramCourses([]);
      return;
    }
    try {
      setLoadingFilterCourses(true);
      const response = await apiClient.get(`/programs/${programId}/courses`);
      setFilterProgramCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching program courses for filter:', error);
      setFilterProgramCourses([]);
    } finally {
      setLoadingFilterCourses(false);
    }
  };

  // Handle program filter change
  const handleProgramFilterChange = (programId: string) => {
    setSelectedProgramFilter(programId);
    fetchFilterProgramCourses(programId);
  };

  // Fetch courses for a specific program
  const fetchProgramCourses = async (programId: number) => {
    try {
      setLoadingCourses(true);
      const response = await apiClient.get(`/programs/${programId}/courses`);
      setProgramCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching program courses:', error);
      setProgramCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  // View program courses
  const viewProgramCourses = (program: Program) => {
    setSelectedProgram(program);
    setShowCoursesModal(true);
    fetchProgramCourses(program.id);
    fetchAllCourses();
  };

  // Add course to program
  const addCourseToProgram = async () => {
    if (!selectedProgram || !newCourseData.course_id) return;
    try {
      setSaving(true);
      await apiClient.post(`/programs/${selectedProgram.id}/courses`, {
        course_id: parseInt(newCourseData.course_id),
        semester: newCourseData.semester,
        type: newCourseData.type,
      });
      fetchProgramCourses(selectedProgram.id);
      setShowAddCourseModal(false);
      setNewCourseData({ course_id: '', semester: 1, type: 'REQUIRED' });
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast.error(error.response?.data?.error || (lang === 'ar' ? 'فشل إضافة المادة' : 'Failed to add course'));
    } finally {
      setSaving(false);
    }
  };

  // Remove course from program
  const removeCourseFromProgram = async (courseId: number) => {
    if (!selectedProgram || !confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه المادة؟' : 'Are you sure you want to remove this course?')) return;
    try {
      await apiClient.delete(`/programs/${selectedProgram.id}/courses/${courseId}`);
      fetchProgramCourses(selectedProgram.id);
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error(lang === 'ar' ? 'فشل حذف المادة' : 'Failed to remove course');
    }
  };

  // Open edit course modal
  const openEditCourseModal = (course: ProgramCourse) => {
    setEditingCourse(course);
    setEditCourseData({
      credits: course.credits,
      name_en: course.name_en,
      name_ar: course.name_ar,
    });
    setShowEditCourseModal(true);
  };

  // Update course
  const updateCourse = async () => {
    if (!editingCourse) return;
    try {
      setSaving(true);
      await apiClient.put(`/courses/${editingCourse.id}`, {
        credits: editCourseData.credits,
        name_en: editCourseData.name_en,
        name_ar: editCourseData.name_ar,
      });
      if (selectedProgram) {
        fetchProgramCourses(selectedProgram.id);
      }
      setShowEditCourseModal(false);
      setEditingCourse(null);
      toast.success(t.updateSuccess[lang]);
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(lang === 'ar' ? 'فشل تحديث المادة' : 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  // Toggle semester expansion
  const toggleSemester = (semester: number) => {
    setExpandedSemesters(prev =>
      prev.includes(semester)
        ? prev.filter(s => s !== semester)
        : [...prev, semester]
    );
  };

  // Toggle type expansion
  const toggleType = (type: string) => {
    setExpandedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Get course type label
  const getCourseTypeLabel = (type: string) => {
    switch (type) {
      case 'REQUIRED': return t.required[lang];
      case 'ELECTIVE': return t.elective[lang];
      case 'UNIVERSITY': return t.university[lang];
      case 'COLLEGE': return t.college[lang];
      case 'MAJOR': return t.major[lang];
      default: return type;
    }
  };

  // Get course type badge color
  const getCourseTypeBadge = (type: string) => {
    switch (type) {
      case 'REQUIRED': return 'bg-red-100 text-red-700';
      case 'ELECTIVE': return 'bg-green-100 text-green-700';
      case 'UNIVERSITY': return 'bg-blue-100 text-blue-700';
      case 'COLLEGE': return 'bg-purple-100 text-purple-700';
      case 'MAJOR': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Group courses by semester
  const coursesBySemester = programCourses.reduce((acc, course) => {
    const sem = course.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(course);
    return acc;
  }, {} as Record<number, ProgramCourse[]>);

  // Group courses by type (for type view)
  const coursesByType = programCourses.reduce((acc, course) => {
    // Graduation project detection (code contains 'P' or is graduation project type)
    const isGraduation = course.code.includes('P01') || course.name_en.toLowerCase().includes('graduation') || course.name_ar.includes('تخرج');
    const typeKey = isGraduation ? 'GRADUATION' : course.type;
    if (!acc[typeKey]) acc[typeKey] = [];
    acc[typeKey].push(course);
    return acc;
  }, {} as Record<string, ProgramCourse[]>);

  // Group filter courses by type (for credit distribution display)
  const filterCoursesByType = filterProgramCourses.reduce((acc, course) => {
    const isGraduation = course.code.includes('P0') || course.name_en.toLowerCase().includes('graduation') || course.name_ar.includes('تخرج');
    const typeKey = isGraduation ? 'GRADUATION' : course.type;
    if (!acc[typeKey]) acc[typeKey] = [];
    acc[typeKey].push(course);
    return acc;
  }, {} as Record<string, ProgramCourse[]>);

  // Get selected program info
  const selectedProgramInfo = programs.find(p => p.id.toString() === selectedProgramFilter);

  // Type order and labels
  const typeOrder = ['UNIVERSITY', 'COLLEGE', 'MAJOR', 'GRADUATION'];
  const getTypeHeading = (type: string) => {
    switch (type) {
      case 'UNIVERSITY': return t.universityReq[lang];
      case 'COLLEGE': return t.collegeReq[lang];
      case 'MAJOR': return t.majorReq[lang];
      case 'GRADUATION': return t.graduationProject[lang];
      default: return type;
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'UNIVERSITY': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'COLLEGE': return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'MAJOR': return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      case 'GRADUATION': return 'bg-green-50 border-green-200 hover:bg-green-100';
      default: return 'bg-slate-50 border-slate-200 hover:bg-slate-100';
    }
  };
  const getTypeHeaderColor = (type: string) => {
    switch (type) {
      case 'UNIVERSITY': return 'bg-blue-100 text-blue-800';
      case 'COLLEGE': return 'bg-purple-100 text-purple-800';
      case 'MAJOR': return 'bg-amber-100 text-amber-800';
      case 'GRADUATION': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
    fetchColleges();
  }, []);

  // Filter programs
  const filteredPrograms = programs.filter(program => {
    const matchesSearch =
      program.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.name_ar.includes(searchQuery) ||
      program.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || program.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Pagination calculations
  const totalItems = filteredPrograms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedPrograms = filteredPrograms.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, itemsPerPage]);

  // Stats
  const stats = {
    total: programs.length,
    bachelor: programs.filter(p => p.type === 'BACHELOR').length,
    master: programs.filter(p => p.type === 'MASTER').length,
    phd: programs.filter(p => p.type === 'PHD').length,
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingProgram) {
        await apiClient.put(`/programs/${editingProgram.id}`, formData);
      } else {
        await apiClient.post('/programs', formData);
      }
      fetchPrograms();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error(lang === 'ar' ? 'فشل حفظ البرنامج' : 'Failed to save program');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete[lang])) return;
    try {
      await apiClient.delete(`/programs/${id}`);
      fetchPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error(lang === 'ar' ? 'فشل حذف البرنامج' : 'Failed to delete program');
    }
  };

  // Open edit modal
  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      code: program.code,
      name_en: program.name_en,
      name_ar: program.name_ar,
      type: program.type,
      total_credits: program.total_credits,
      duration_years: (program as any).duration_years || 4,
      college_id: String(program.college_id || ''),
      description: program.description || '',
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingProgram(null);
    setFormData({
      code: '',
      name_en: '',
      name_ar: '',
      type: 'BACHELOR',
      total_credits: 132,
      duration_years: 4,
      college_id: '',
      description: '',
    });
  };

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BACHELOR':
        return 'bg-blue-100 text-blue-700';
      case 'MASTER':
        return 'bg-purple-100 text-purple-700';
      case 'PHD':
        return 'bg-amber-100 text-amber-700';
      case 'DIPLOMA':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BACHELOR': return t.bachelor[lang];
      case 'MASTER': return t.master[lang];
      case 'PHD': return t.phd[lang];
      case 'DIPLOMA': return t.diploma[lang];
      default: return type;
    }
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            {t.title[lang]}
          </h1>
          <p className="text-slate-500 mt-1">{t.subtitle[lang]}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t.addProgram[lang]}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.totalPrograms[lang]}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.bachelorPrograms[lang]}</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.bachelor}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.masterPrograms[lang]}</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.master}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.phdPrograms[lang]}</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{stats.phd}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Programs by College Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              {t.programsByCollege[lang]}
            </h3>
            <button
              onClick={fetchPrograms}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 sm:hidden"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.search[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">{t.all[lang]}</option>
              <option value="BACHELOR">{t.bachelor[lang]}</option>
              <option value="MASTER">{t.master[lang]}</option>
              <option value="PHD">{t.phd[lang]}</option>
            </select>
            <button
              onClick={fetchPrograms}
              className="hidden sm:flex items-center justify-center p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Dynamic display by college */}
          {colleges.map((college, index) => {
            const collegePrograms = filteredPrograms.filter(p => p.college_id === college.id || p.college?.id === college.id);
            const bachelorPrograms = collegePrograms.filter(p => p.type === 'BACHELOR' || p.type === 'DIPLOMA');
            const graduatePrograms = collegePrograms.filter(p => p.type === 'MASTER' || p.type === 'PHD');

            if (collegePrograms.length === 0) return null;

            const colors = [
              { bg: 'from-blue-600 to-blue-700', light: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
              { bg: 'from-rose-600 to-rose-700', light: 'bg-rose-50', text: 'text-rose-600', hover: 'hover:bg-rose-100' },
              { bg: 'from-emerald-600 to-emerald-700', light: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-100' },
              { bg: 'from-amber-600 to-amber-700', light: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:bg-amber-100' },
              { bg: 'from-purple-600 to-purple-700', light: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
              { bg: 'from-cyan-600 to-cyan-700', light: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
            ];
            const color = colors[index % colors.length];

            return (
              <div key={college.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${color.bg} px-5 py-4`}>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {lang === 'ar' ? college.name_ar : college.name_en}
                    <span className="text-sm font-normal opacity-80">({collegePrograms.length} {lang === 'ar' ? 'برنامج' : 'programs'})</span>
                  </h4>
                </div>
                <div className="grid md:grid-cols-2 gap-0 md:divide-x md:divide-slate-200 divide-y md:divide-y-0 divide-slate-200">
                  {/* Bachelor Programs */}
                  <div className="p-4">
                    <h5 className={`font-semibold ${color.text} mb-3 flex items-center gap-2`}>
                      <GraduationCap className="w-4 h-4" />
                      {t.bachelorDegree[lang]}
                    </h5>
                    <ul className="space-y-2">
                      {bachelorPrograms.map(p => (
                        <li key={p.id} className={`flex items-center justify-between gap-2 py-1.5 px-3 ${color.light} rounded-lg group`}>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs ${color.text} font-semibold`}>{p.code}</span>
                            <span className="text-slate-700 text-sm">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                            {p.type === 'DIPLOMA' && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{t.diploma[lang]}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => viewProgramCourses(p)} className={`p-1 ${color.hover} rounded ${color.text}`} title={t.viewCourses[lang]}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEditModal(p)} className={`p-1 ${color.hover} rounded ${color.text}`} title={t.editProgram[lang]}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title={t.delete[lang]}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                      {bachelorPrograms.length === 0 && (
                        <li className="text-slate-400 text-sm italic py-2">
                          {lang === 'ar' ? 'لا توجد برامج بكالوريوس' : 'No bachelor programs'}
                        </li>
                      )}
                    </ul>
                  </div>
                  {/* Graduate Programs */}
                  <div className="p-4 bg-slate-50">
                    <h5 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {t.graduateDegree[lang]}
                    </h5>
                    <ul className="space-y-2">
                      {graduatePrograms.map(p => (
                        <li key={p.id} className="flex items-center justify-between gap-2 py-1.5 px-3 bg-purple-50 rounded-lg group">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-purple-600 font-semibold">{p.code}</span>
                            <span className="text-slate-700 text-sm">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${p.type === 'MASTER' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                              {p.type === 'MASTER' ? t.master[lang] : t.phd[lang]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => viewProgramCourses(p)} className="p-1 hover:bg-purple-100 rounded text-purple-600" title={t.viewCourses[lang]}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEditModal(p)} className="p-1 hover:bg-purple-200 rounded text-purple-700" title={t.editProgram[lang]}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title={t.delete[lang]}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                      {graduatePrograms.length === 0 && (
                        <li className="text-slate-400 text-sm italic py-2">
                          {lang === 'ar' ? 'لا توجد برامج دراسات عليا' : 'No graduate programs'}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Programs without college */}
          {(() => {
            const unassignedPrograms = filteredPrograms.filter(p => !p.college_id && !p.college);
            if (unassignedPrograms.length === 0) return null;

            return (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-5 py-4">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {t.noCollege[lang]}
                    <span className="text-sm font-normal opacity-80">({unassignedPrograms.length} {lang === 'ar' ? 'برنامج' : 'programs'})</span>
                  </h4>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {unassignedPrograms.map(p => (
                      <li key={p.id} className="flex items-center justify-between gap-2 py-1.5 px-3 bg-slate-50 rounded-lg group">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-600 font-semibold">{p.code}</span>
                          <span className="text-slate-700 text-sm">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            p.type === 'BACHELOR' ? 'bg-blue-100 text-blue-700' :
                            p.type === 'MASTER' ? 'bg-purple-100 text-purple-700' :
                            p.type === 'PHD' ? 'bg-amber-100 text-amber-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {p.type === 'BACHELOR' ? t.bachelor[lang] :
                             p.type === 'MASTER' ? t.master[lang] :
                             p.type === 'PHD' ? t.phd[lang] : t.diploma[lang]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => viewProgramCourses(p)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title={t.viewCourses[lang]}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEditModal(p)} className="p-1 hover:bg-slate-200 rounded text-slate-700" title={t.editProgram[lang]}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title={t.delete[lang]}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}

          {filteredPrograms.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">{t.noPrograms[lang]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingProgram ? t.editProgram[lang] : t.addProgram[lang]}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.code[lang]}</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.type[lang]}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BACHELOR">{t.bachelor[lang]}</option>
                    <option value="MASTER">{t.master[lang]}</option>
                    <option value="PHD">{t.phd[lang]}</option>
                    <option value="DIPLOMA">{t.diploma[lang]}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameEn[lang]}</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
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
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.credits[lang]}</label>
                  <input
                    type="number"
                    value={formData.total_credits}
                    onChange={(e) => setFormData({ ...formData, total_credits: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.durationYears[lang]}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.duration_years}
                    onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.department[lang]}</label>
                  <select
                    value={formData.college_id}
                    onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t.selectDepartment[lang]}</option>
                    {colleges.map((college) => (
                      <option key={college.id} value={college.id}>
                        {lang === 'ar' ? college.name_ar : college.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.description[lang]}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
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

      {/* Courses Modal */}
      {showCoursesModal && selectedProgram && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {t.studyPlan[lang]}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {lang === 'ar' ? selectedProgram.name_ar : selectedProgram.name_en} ({selectedProgram.code})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t.addCourse[lang]}
                </button>
                <button
                  onClick={() => { setShowCoursesModal(false); setSelectedProgram(null); setProgramCourses([]); }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {loadingCourses ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
                  <p className="text-slate-500">{t.loading[lang]}</p>
                </div>
              ) : programCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t.noCourses[lang]}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary with credits by type */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-6">
                        <span className="text-slate-700 font-medium">
                          {t.totalCredits[lang]}: <strong className="text-blue-600 text-lg">{programCourses.reduce((sum, c) => sum + c.credits, 0)}</strong>
                        </span>
                        <span className="text-slate-600">
                          {t.courses[lang]}: <strong className="text-blue-600">{programCourses.length}</strong>
                        </span>
                      </div>
                      {/* View Toggle */}
                      <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
                        <button
                          onClick={() => setViewMode('type')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'type' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          {t.viewByType[lang]}
                        </button>
                        <button
                          onClick={() => setViewMode('semester')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'semester' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                          {t.viewBySemester[lang]}
                        </button>
                      </div>
                    </div>
                    {/* Credits by type summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {typeOrder.map(type => {
                        const courses = coursesByType[type] || [];
                        const credits = courses.reduce((sum, c) => sum + c.credits, 0);
                        return (
                          <div key={type} className={`px-3 py-2 rounded-lg text-center ${getTypeHeaderColor(type)}`}>
                            <div className="text-xs font-medium opacity-80">{getTypeHeading(type)}</div>
                            <div className="text-lg font-bold">{credits}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* View by Type */}
                  {viewMode === 'type' && typeOrder.map(type => {
                    const courses = coursesByType[type] || [];
                    if (courses.length === 0) return null;
                    return (
                      <div key={type} className={`border rounded-xl overflow-hidden ${getTypeColor(type)}`}>
                        <button
                          onClick={() => toggleType(type)}
                          className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${getTypeHeaderColor(type)}`}
                        >
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${expandedTypes.includes(type) ? 'rotate-180' : ''}`}
                            />
                            <span className="font-bold">
                              {getTypeHeading(type)}
                            </span>
                            <span className="text-sm opacity-80">
                              ({courses.length} {t.courses[lang]})
                            </span>
                          </div>
                          <span className="font-semibold">
                            {courses.reduce((sum, c) => sum + c.credits, 0)} {t.credits[lang]}
                          </span>
                        </button>

                        {expandedTypes.includes(type) && (
                          <div className="divide-y divide-slate-100 bg-white">
                            {courses.map(course => (
                              <div key={course.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                  <span className="font-mono text-sm text-blue-600 font-semibold w-28">
                                    {course.code}
                                  </span>
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {lang === 'ar' ? course.name_ar : course.name_en}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                        {t.semester[lang]} {course.semester}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-slate-700">
                                    {course.credits} {t.credits[lang]}
                                  </span>
                                  <button
                                    onClick={() => openEditCourseModal(course)}
                                    className="p-1.5 hover:bg-blue-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                                    title={t.editCourse[lang]}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removeCourseFromProgram(course.id)}
                                    className="p-1.5 hover:bg-red-100 rounded text-slate-400 hover:text-red-600 transition-colors"
                                    title={t.removeCourse[lang]}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* View by Semester */}
                  {viewMode === 'semester' && Object.keys(coursesBySemester).sort((a, b) => parseInt(a) - parseInt(b)).map(semesterNum => (
                    <div key={semesterNum} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSemester(parseInt(semesterNum))}
                        className="w-full px-4 py-3 bg-slate-100 flex items-center justify-between hover:bg-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedSemesters.includes(parseInt(semesterNum)) ? 'rotate-180' : ''}`}
                          />
                          <span className="font-semibold text-slate-700">
                            {t.semester[lang]} {semesterNum}
                          </span>
                          <span className="text-sm text-slate-500">
                            ({coursesBySemester[parseInt(semesterNum)].length} {t.courses[lang]})
                          </span>
                        </div>
                        <span className="text-sm text-slate-500">
                          {coursesBySemester[parseInt(semesterNum)].reduce((sum, c) => sum + c.credits, 0)} {t.credits[lang]}
                        </span>
                      </button>

                      {expandedSemesters.includes(parseInt(semesterNum)) && (
                        <div className="divide-y divide-slate-100">
                          {coursesBySemester[parseInt(semesterNum)].map(course => (
                            <div key={course.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                              <div className="flex items-center gap-4">
                                <span className="font-mono text-sm text-blue-600 font-semibold w-24">
                                  {course.code}
                                </span>
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {lang === 'ar' ? course.name_ar : course.name_en}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCourseTypeBadge(course.type)}`}>
                                      {getCourseTypeLabel(course.type)}
                                    </span>
                                    {course.is_common && (
                                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                        {t.common[lang]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600">
                                  {course.credits} {t.credits[lang]}
                                </span>
                                <button
                                  onClick={() => openEditCourseModal(course)}
                                  className="p-1.5 hover:bg-blue-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                                  title={t.editCourse[lang]}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeCourseFromProgram(course.id)}
                                  className="p-1.5 hover:bg-red-100 rounded text-slate-400 hover:text-red-600 transition-colors"
                                  title={t.removeCourse[lang]}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t.addCourse[lang]}</h3>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.selectCourse[lang]}</label>
                <select
                  value={newCourseData.course_id}
                  onChange={(e) => setNewCourseData({ ...newCourseData, course_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.selectCourse[lang]}</option>
                  {allCourses
                    .filter(c => !programCourses.find(pc => pc.id === c.id))
                    .map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {lang === 'ar' ? course.name_ar : course.name_en} ({course.credits} {t.credits[lang]})
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.semester[lang]}</label>
                  <select
                    value={newCourseData.semester}
                    onChange={(e) => setNewCourseData({ ...newCourseData, semester: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>{t.semester[lang]} {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.courseType[lang]}</label>
                  <select
                    value={newCourseData.type}
                    onChange={(e) => setNewCourseData({ ...newCourseData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="REQUIRED">{t.required[lang]}</option>
                    <option value="ELECTIVE">{t.elective[lang]}</option>
                    <option value="UNIVERSITY">{t.university[lang]}</option>
                    <option value="COLLEGE">{t.college[lang]}</option>
                    <option value="MAJOR">{t.major[lang]}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {t.cancel[lang]}
                </button>
                <button
                  onClick={addCourseToProgram}
                  disabled={saving || !newCourseData.course_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {t.addCourse[lang]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditCourseModal && editingCourse && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t.editCourse[lang]}</h3>
              <button
                onClick={() => { setShowEditCourseModal(false); setEditingCourse(null); }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-500">{t.courseCode[lang]}</p>
                <p className="font-mono font-semibold text-blue-600">{editingCourse.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameEn[lang]}</label>
                <input
                  type="text"
                  value={editCourseData.name_en}
                  onChange={(e) => setEditCourseData({ ...editCourseData, name_en: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameAr[lang]}</label>
                <input
                  type="text"
                  value={editCourseData.name_ar}
                  onChange={(e) => setEditCourseData({ ...editCourseData, name_ar: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.courseCredits[lang]}</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={editCourseData.credits}
                  onChange={(e) => setEditCourseData({ ...editCourseData, credits: parseInt(e.target.value) || 3 })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditCourseModal(false); setEditingCourse(null); }}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {t.cancel[lang]}
                </button>
                <button
                  onClick={updateCourse}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t.save[lang]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsManagement;

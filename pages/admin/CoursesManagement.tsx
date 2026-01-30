import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Search, Edit2, Trash2, X, Save, Loader2,
  Users, Building, RefreshCw, Filter, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Link2, Unlink,
  Cloud, CloudOff, Eye, GraduationCap, Award, FileText
} from 'lucide-react';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';

interface CoursesManagementProps {
  lang: 'en' | 'ar';
}

interface Course {
  id: number;
  department_id: number | null;
  code: string;
  name_en: string;
  name_ar: string;
  credits: number;
  capacity: number;
  enrolled: number;
  description_en: string | null;
  description_ar: string | null;
  is_active: boolean;
  department?: {
    id: number;
    name_en: string;
    name_ar: string;
  };
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

interface Prerequisite {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  credits: number;
  min_grade: string | null;
  is_required: boolean;
}

interface Program {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  type: string;
  total_credits: number;
  college_id?: number;
  department_id?: number;
  college?: { id: number; name_en: string; name_ar: string };
  department?: { id: number; name_en: string; name_ar: string; college_id?: number };
}

interface ProgramCourse {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  credits: number;
  type: string;
  semester: number;
}

const t = {
  title: { en: 'Courses Management', ar: 'إدارة المواد الدراسية' },
  subtitle: { en: 'Manage courses and subjects', ar: 'إدارة المقررات والمواد الدراسية' },
  addCourse: { en: 'Add Course', ar: 'إضافة مادة' },
  edit: { en: 'Edit', ar: 'تعديل' },
  editCourse: { en: 'Edit Course', ar: 'تعديل المادة' },
  search: { en: 'Search courses...', ar: 'البحث في المواد...' },
  code: { en: 'Code', ar: 'الرمز' },
  nameEn: { en: 'Name (English)', ar: 'الاسم (إنجليزي)' },
  nameAr: { en: 'Name (Arabic)', ar: 'الاسم (عربي)' },
  credits: { en: 'Credits', ar: 'الساعات' },
  capacity: { en: 'Enrolled Students', ar: 'عدد الطلاب المسجلين' },
  enrolled: { en: 'Enrolled', ar: 'المسجلون' },
  department: { en: 'Department', ar: 'القسم' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  active: { en: 'Active', ar: 'فعّال' },
  inactive: { en: 'Inactive', ar: 'غير فعّال' },
  all: { en: 'All', ar: 'الكل' },
  allDepartments: { en: 'All Departments', ar: 'جميع الأقسام' },
  college: { en: 'College', ar: 'الكلية' },
  allColleges: { en: 'All Colleges', ar: 'جميع الكليات' },
  selectCollege: { en: 'Select College', ar: 'اختر الكلية' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  confirmDelete: { en: 'Are you sure you want to delete this course?', ar: 'هل أنت متأكد من حذف هذه المادة؟' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  noCourses: { en: 'No courses found', ar: 'لا توجد مواد' },
  totalCourses: { en: 'Total Courses', ar: 'إجمالي المواد' },
  activeCourses: { en: 'Active Courses', ar: 'المواد الفعّالة' },
  inactiveCourses: { en: 'Inactive Courses', ar: 'المواد غير الفعّالة' },
  totalCapacity: { en: 'Total Enrolled', ar: 'إجمالي المسجلين' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  selectDepartment: { en: 'Select Department', ar: 'اختر القسم' },
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
  descriptionEn: { en: 'Description (English)', ar: 'الوصف (إنجليزي)' },
  descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (عربي)' },
  prerequisites: { en: 'Prerequisites', ar: 'المتطلبات السابقة' },
  managePrerequisites: { en: 'Manage Prerequisites', ar: 'إدارة المتطلبات السابقة' },
  addPrerequisite: { en: 'Add Prerequisite', ar: 'إضافة متطلب سابق' },
  removePrerequisite: { en: 'Remove', ar: 'حذف' },
  noPrerequisites: { en: 'No prerequisites', ar: 'لا توجد متطلبات سابقة' },
  selectCourse: { en: 'Select Course', ar: 'اختر المادة' },
  minGrade: { en: 'Min Grade', ar: 'الحد الأدنى للدرجة' },
  required: { en: 'Required', ar: 'إجباري' },
  optional: { en: 'Optional', ar: 'اختياري' },
  activate: { en: 'Activate', ar: 'تفعيل' },
  deactivate: { en: 'Deactivate', ar: 'إلغاء التفعيل' },
  cannotDelete: { en: 'Cannot delete course with active enrollments', ar: 'لا يمكن حذف مادة بها طلاب مسجلون' },
  creditDistribution: { en: 'Credit Distribution', ar: 'توزيع الساعات المعتمدة' },
  universityReq: { en: 'University Requirements', ar: 'متطلبات الجامعة' },
  collegeReq: { en: 'College Requirements', ar: 'متطلبات الكلية' },
  majorReq: { en: 'Major Requirements', ar: 'متطلبات التخصص' },
  graduationProject: { en: 'Graduation Project', ar: 'مشروع التخرج' },
  totalCredits: { en: 'Total Credits', ar: 'إجمالي الساعات' },
  healthSciences: { en: 'Health & Environmental Sciences', ar: 'العلوم الصحية والبيئية' },
  healthAdmin: { en: 'Health Administration', ar: 'الإدارة الصحية' },
  selectProgram: { en: 'Select Program', ar: 'اختر البرنامج' },
  allPrograms: { en: 'All Programs', ar: 'جميع البرامج' },
  programCredits: { en: 'Program Credit Distribution', ar: 'توزيع ساعات البرنامج' },
  syncToLms: { en: 'Sync to LMS', ar: 'مزامنة مع LMS' },
  syncingToLms: { en: 'Syncing...', ar: 'جاري المزامنة...' },
  syncSuccess: { en: 'Courses synced to LMS successfully', ar: 'تمت مزامنة المواد مع LMS بنجاح' },
  syncError: { en: 'Failed to sync courses to LMS', ar: 'فشل مزامنة المواد مع LMS' },
  synced: { en: 'Synced', ar: 'تمت المزامنة' },
  failed: { en: 'Failed', ar: 'فشل' },
  courseType: { en: 'Course Type', ar: 'نوع المادة' },
  viewEnrollments: { en: 'View Enrollments', ar: 'عرض التسجيلات' },
  courseEnrollments: { en: 'Course Enrollments', ar: 'الطلاب المسجلين' },
  studentId: { en: 'Student ID', ar: 'الرقم الجامعي' },
  studentName: { en: 'Student Name', ar: 'اسم الطالب' },
  grade: { en: 'Grade', ar: 'الدرجة' },
  midterm: { en: 'Midterm', ar: 'منتصف الفصل' },
  final: { en: 'Final', ar: 'النهائي' },
  assignments: { en: 'Assignments', ar: 'الواجبات' },
  noEnrollments: { en: 'No students enrolled in this course', ar: 'لا يوجد طلاب مسجلين في هذه المادة' },
  exportGrades: { en: 'Export Grades', ar: 'تصدير الدرجات' },
  semester: { en: 'Semester', ar: 'الفصل' },
  addStudent: { en: 'Add Student', ar: 'إضافة طالب' },
  addStudentToCourse: { en: 'Add Student to Course', ar: 'إضافة طالب للمادة' },
  selectStudent: { en: 'Select Student', ar: 'اختر الطالب' },
  selectSemester: { en: 'Select Semester', ar: 'اختر الفصل الدراسي' },
  searchStudents: { en: 'Search students...', ar: 'البحث عن طالب...' },
  enrollmentAdded: { en: 'Student enrolled successfully', ar: 'تم تسجيل الطالب بنجاح' },
  enrollmentError: { en: 'Failed to enroll student', ar: 'فشل في تسجيل الطالب' },
  alreadyEnrolled: { en: 'Student is already enrolled in this course', ar: 'الطالب مسجل بالفعل في هذه المادة' },
  removeStudent: { en: 'Remove', ar: 'إزالة' },
  confirmRemoveStudent: { en: 'Are you sure you want to remove this student from the course?', ar: 'هل أنت متأكد من إزالة هذا الطالب من المادة؟' },
  studentRemoved: { en: 'Student removed successfully', ar: 'تم إزالة الطالب بنجاح' },
};

const CoursesManagement: React.FC<CoursesManagementProps> = ({ lang }) => {
  const toast = useToast();
  const isRTL = lang === 'ar';
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Prerequisites state
  const [showPrereqModal, setShowPrereqModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [loadingPrereqs, setLoadingPrereqs] = useState(false);
  const [showAddPrereqModal, setShowAddPrereqModal] = useState(false);
  const [newPrereqData, setNewPrereqData] = useState({
    prerequisite_id: '',
    min_grade: '',
    is_required: true,
  });

  // Program filter state for credit distribution
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [programCourses, setProgramCourses] = useState<ProgramCourse[]>([]);
  const [loadingProgramCourses, setLoadingProgramCourses] = useState(false);

  // LMS sync state
  const [syncingToLms, setSyncingToLms] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Course Enrollments Modal state
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [courseEnrollments, setCourseEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentsCourse, setEnrollmentsCourse] = useState<Course | null>(null);

  // Add Student to Course state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [addingEnrollment, setAddingEnrollment] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [newEnrollmentData, setNewEnrollmentData] = useState({
    student_id: '',
    semester_id: '',
  });

  const [formData, setFormData] = useState({
    code: '',
    name_en: '',
    name_ar: '',
    credits: 3,
    capacity: 30,
    college_ids: [] as string[],
    program_ids: [] as string[],
    course_type: 'MAJOR' as 'UNIVERSITY' | 'COLLEGE' | 'MAJOR' | 'GRADUATION',
    description: '',
    is_active: true,
  });

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/courses', {
        params: { per_page: 1000 }
      });
      const data = response.data.data || response.data || [];
      setCourses(data);
      setAllCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  // Fetch programs
  const fetchPrograms = async () => {
    try {
      const response = await apiClient.get('/programs');
      setPrograms(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  // Fetch program courses for credit distribution
  const fetchProgramCourses = async (programId: string) => {
    if (programId === 'all') {
      setProgramCourses([]);
      return;
    }
    try {
      setLoadingProgramCourses(true);
      const response = await apiClient.get(`/programs/${programId}/courses`);
      setProgramCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching program courses:', error);
      setProgramCourses([]);
    } finally {
      setLoadingProgramCourses(false);
    }
  };

  // Sync courses to LMS
  const syncCoursesToLms = async () => {
    try {
      setSyncingToLms(true);
      setSyncMessage(null);
      // Use longer timeout (3 minutes) for syncing many courses
      const response = await apiClient.post('/moodle/sync/courses', {}, {
        timeout: 180000 // 3 minutes
      });
      const data = response.data;
      setSyncMessage({
        type: 'success',
        text: `${t.syncSuccess[lang]} (${t.synced[lang]}: ${data.success || 0}, ${t.failed[lang]}: ${data.failed || 0})`
      });
    } catch (error: any) {
      console.error('Error syncing to LMS:', error);
      setSyncMessage({
        type: 'error',
        text: error.response?.data?.message || t.syncError[lang]
      });
    } finally {
      setSyncingToLms(false);
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Handle program filter change
  const handleProgramChange = (programId: string) => {
    setSelectedProgram(programId);
    fetchProgramCourses(programId);
  };

  // Fetch prerequisites for a course
  const fetchPrerequisites = async (courseId: number) => {
    try {
      setLoadingPrereqs(true);
      const response = await apiClient.get(`/courses/${courseId}/prerequisites`);
      setPrerequisites(response.data || []);
    } catch (error) {
      console.error('Error fetching prerequisites:', error);
      setPrerequisites([]);
    } finally {
      setLoadingPrereqs(false);
    }
  };

  // View prerequisites
  const viewPrerequisites = (course: Course) => {
    setSelectedCourse(course);
    setShowPrereqModal(true);
    fetchPrerequisites(course.id);
  };

  // Add prerequisite
  const addPrerequisite = async () => {
    if (!selectedCourse || !newPrereqData.prerequisite_id) return;
    try {
      setSaving(true);
      await apiClient.post(`/courses/${selectedCourse.id}/prerequisites`, {
        prerequisite_id: parseInt(newPrereqData.prerequisite_id),
        min_grade: newPrereqData.min_grade || null,
        is_required: newPrereqData.is_required,
      });
      fetchPrerequisites(selectedCourse.id);
      setShowAddPrereqModal(false);
      setNewPrereqData({ prerequisite_id: '', min_grade: '', is_required: true });
    } catch (error: any) {
      console.error('Error adding prerequisite:', error);
      toast.error(error.response?.data?.error || (lang === 'ar' ? 'فشل إضافة المتطلب' : 'Failed to add prerequisite'));
    } finally {
      setSaving(false);
    }
  };

  // Remove prerequisite
  const removePrerequisite = async (prereqId: number) => {
    if (!selectedCourse || !confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المتطلب؟' : 'Are you sure you want to remove this prerequisite?')) return;
    try {
      await apiClient.delete(`/courses/${selectedCourse.id}/prerequisites/${prereqId}`);
      fetchPrerequisites(selectedCourse.id);
    } catch (error) {
      console.error('Error removing prerequisite:', error);
      toast.error(lang === 'ar' ? 'فشل حذف المتطلب' : 'Failed to remove prerequisite');
    }
  };

  // Toggle course status
  const toggleCourseStatus = async (course: Course) => {
    try {
      if (course.is_active) {
        await apiClient.post(`/courses/${course.id}/deactivate`);
      } else {
        await apiClient.post(`/courses/${course.id}/activate`);
      }
      fetchCourses();
    } catch (error) {
      console.error('Error toggling course status:', error);
      toast.error(lang === 'ar' ? 'فشل تحديث حالة المادة' : 'Failed to update course status');
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchColleges();
    fetchPrograms();
  }, []);

  // Filter programs by selected college
  const filteredProgramsByCollege = collegeFilter === 'all'
    ? programs
    : programs.filter(p => {
        // Check college_id directly, or through college object, or through department's college_id
        const programCollegeId = p.college_id || p.college?.id || p.department?.college_id;
        return programCollegeId?.toString() === collegeFilter;
      });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (course.name_en || '').toLowerCase().includes(query) ||
      (course.name_ar || '').includes(searchQuery) ||
      (course.code || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && course.is_active) ||
      (statusFilter === 'inactive' && !course.is_active);
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, collegeFilter, itemsPerPage]);

  // Reset program filter when college changes
  useEffect(() => {
    setSelectedProgram('all');
    setProgramCourses([]);
  }, [collegeFilter]);

  // Stats
  const stats = {
    total: courses.length,
    active: courses.filter(c => c.is_active).length,
    inactive: courses.filter(c => !c.is_active).length,
    totalCapacity: courses.reduce((sum, c) => sum + (c.enrolled || 0), 0),
  };

  // Filter program courses based on search query
  const filteredProgramCourses = programCourses.filter(course => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (course.name_en || '').toLowerCase().includes(query) ||
      (course.name_ar || '').includes(searchQuery) ||
      (course.code || '').toLowerCase().includes(query);
    return matchesSearch;
  });

  // Credit distribution by type - calculated from filtered program courses
  const programCoursesByType = filteredProgramCourses.reduce((acc, course) => {
    const isGraduation = (course.code || '').includes('P0') || (course.name_en || '').toLowerCase().includes('graduation') || (course.name_ar || '').includes('تخرج');
    const typeKey = isGraduation ? 'GRADUATION' : (course.type || 'MAJOR');
    if (!acc[typeKey]) acc[typeKey] = [];
    acc[typeKey].push(course);
    return acc;
  }, {} as Record<string, ProgramCourse[]>);

  const creditsByType = {
    university: (programCoursesByType['UNIVERSITY'] || []).reduce((sum, c) => sum + c.credits, 0),
    college: (programCoursesByType['COLLEGE'] || []).reduce((sum, c) => sum + c.credits, 0),
    major: (programCoursesByType['MAJOR'] || []).reduce((sum, c) => sum + c.credits, 0),
    graduation: (programCoursesByType['GRADUATION'] || []).reduce((sum, c) => sum + c.credits, 0),
    total: filteredProgramCourses.reduce((sum, c) => sum + c.credits, 0),
    universityCount: (programCoursesByType['UNIVERSITY'] || []).length,
    collegeCount: (programCoursesByType['COLLEGE'] || []).length,
    majorCount: (programCoursesByType['MAJOR'] || []).length,
    graduationCount: (programCoursesByType['GRADUATION'] || []).length,
  };

  // Get selected program info
  const selectedProgramInfo = programs.find(p => p.id.toString() === selectedProgram);

  // Show credit distribution only when a program is selected OR when showing all courses
  const showCreditDistribution = selectedProgram !== 'all' && programCourses.length > 0;

  // Group all courses by type when 'all' is selected - use filteredCourses to respect search
  const allCoursesByType = selectedProgram === 'all' ? filteredCourses.reduce((acc, course) => {
    const isGraduation = (course.code || '').includes('P0') || (course.name_en || '').toLowerCase().includes('graduation') || (course.name_ar || '').includes('تخرج');
    const typeKey = isGraduation ? 'GRADUATION' : (course.course_type || 'MAJOR');
    if (!acc[typeKey]) acc[typeKey] = [];
    acc[typeKey].push(course);
    return acc;
  }, {} as Record<string, Course[]>) : {};

  const allCreditsByType = selectedProgram === 'all' ? {
    university: (allCoursesByType['UNIVERSITY'] || []).reduce((sum, c) => sum + (c.credits || 0), 0),
    college: (allCoursesByType['COLLEGE'] || []).reduce((sum, c) => sum + (c.credits || 0), 0),
    major: (allCoursesByType['MAJOR'] || []).reduce((sum, c) => sum + (c.credits || 0), 0),
    graduation: (allCoursesByType['GRADUATION'] || []).reduce((sum, c) => sum + (c.credits || 0), 0),
    total: allCourses.reduce((sum, c) => sum + (c.credits || 0), 0),
    universityCount: (allCoursesByType['UNIVERSITY'] || []).length,
    collegeCount: (allCoursesByType['COLLEGE'] || []).length,
    majorCount: (allCoursesByType['MAJOR'] || []).length,
    graduationCount: (allCoursesByType['GRADUATION'] || []).length,
  } : creditsByType;

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        name_en: formData.name_en,
        name_ar: formData.name_ar,
        credits: formData.credits,
        capacity: formData.capacity,
        is_active: formData.is_active,
        course_type: formData.course_type,
      };

      // Only include code if it's a new course OR if the code has changed
      if (!editingCourse || formData.code !== editingCourse.code) {
        payload.code = formData.code;
      }

      // Only include optional fields if they have values
      if (formData.description) {
        payload.description = formData.description;
      }
      // Send first college_id for backward compatibility, but also send all college_ids
      if (formData.college_ids.length > 0) {
        payload.college_id = parseInt(formData.college_ids[0]);
        payload.college_ids = formData.college_ids.map(id => parseInt(id));
      }
      if (formData.program_ids.length > 0) {
        payload.program_ids = formData.program_ids.map(id => parseInt(id));
      }

      if (editingCourse) {
        await apiClient.put(`/courses/${editingCourse.id}`, payload);
      } else {
        await apiClient.post('/courses', payload);
      }
      fetchCourses();
      // Refresh program courses if a program is selected
      if (selectedProgram !== 'all') {
        fetchProgramCourses(selectedProgram);
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving course:', error);
      const errorMsg = error.response?.data?.message ||
                       error.response?.data?.error ||
                       (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : null) ||
                       (lang === 'ar' ? 'فشل في حفظ المادة' : 'Failed to save course');
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete[lang])) return;
    try {
      await apiClient.delete(`/courses/${id}`);
      fetchCourses();
      // Refresh program courses if a program is selected
      if (selectedProgram !== 'all') {
        fetchProgramCourses(selectedProgram);
      }
    } catch (error: any) {
      console.error('Error deleting course:', error);
      if (error.response?.status === 422) {
        toast.error(t.cannotDelete[lang]);
      } else {
        toast.error(lang === 'ar' ? 'فشل حذف المادة' : 'Failed to delete course');
      }
    }
  };

  // Fetch course enrollments with grades
  const fetchCourseEnrollments = async (course: Course) => {
    try {
      setLoadingEnrollments(true);
      setEnrollmentsCourse(course);
      setShowEnrollmentsModal(true);

      // Fetch enrollments for this course
      const response = await apiClient.get(`/enrollments`, {
        params: { course_id: course.id, per_page: 500 }
      });
      const enrollmentsData = response.data.data || response.data || [];

      // Fetch grades for this course
      const gradesResponse = await apiClient.get(`/grades`, {
        params: { course_id: course.id, per_page: 500 }
      }).catch(() => ({ data: { data: [] } }));
      const gradesData = gradesResponse.data.data || gradesResponse.data || [];

      // Merge enrollments with grades
      const enrollmentsWithGrades = enrollmentsData.map((enrollment: any) => {
        const grade = gradesData.find((g: any) =>
          g.student_id === enrollment.student_id ||
          g.enrollment_id === enrollment.id
        );
        return {
          ...enrollment,
          grade: grade?.grade || null,
          grade_points: grade?.grade_points || null,
          midterm_score: grade?.midterm_score || null,
          final_score: grade?.final_score || null,
          assignments_score: grade?.assignments_score || null,
          grade_status: grade?.status || null,
        };
      });

      setCourseEnrollments(enrollmentsWithGrades);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setCourseEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Fetch students for enrollment
  const fetchStudentsForEnrollment = async () => {
    try {
      setLoadingStudents(true);
      const response = await apiClient.get('/students', { params: { per_page: 1000 } });
      setAllStudents(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setAllStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch semesters
  const fetchSemesters = async () => {
    try {
      const response = await apiClient.get('/semesters');
      setSemesters(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setSemesters([]);
    }
  };

  // Open add student modal
  const openAddStudentModal = () => {
    setShowAddStudentModal(true);
    setNewEnrollmentData({ student_id: '', semester_id: '' });
    setStudentSearchQuery('');
    if (allStudents.length === 0) {
      fetchStudentsForEnrollment();
    }
    if (semesters.length === 0) {
      fetchSemesters();
    }
  };

  // Add student enrollment
  const addStudentEnrollment = async () => {
    if (!enrollmentsCourse || !newEnrollmentData.student_id || !newEnrollmentData.semester_id) {
      return;
    }

    // Check if student is already enrolled
    const isAlreadyEnrolled = courseEnrollments.some(
      e => String(e.student_id) === String(newEnrollmentData.student_id)
    );
    if (isAlreadyEnrolled) {
      toast.warning(t.alreadyEnrolled[lang]);
      return;
    }

    try {
      setAddingEnrollment(true);
      await apiClient.post('/enrollments', {
        student_id: parseInt(newEnrollmentData.student_id),
        course_id: enrollmentsCourse.id,
        semester_id: parseInt(newEnrollmentData.semester_id),
        status: 'ENROLLED',
      });
      toast.success(t.enrollmentAdded[lang]);
      setShowAddStudentModal(false);
      // Refresh enrollments
      fetchCourseEnrollments(enrollmentsCourse);
    } catch (error: any) {
      console.error('Error adding enrollment:', error);
      toast.error(error.response?.data?.message || t.enrollmentError[lang]);
    } finally {
      setAddingEnrollment(false);
    }
  };

  // Remove student enrollment
  const removeStudentEnrollment = async (enrollmentId: number) => {
    if (!confirm(t.confirmRemoveStudent[lang])) {
      return;
    }
    try {
      await apiClient.delete(`/enrollments/${enrollmentId}`);
      toast.success(t.studentRemoved[lang]);
      if (enrollmentsCourse) {
        fetchCourseEnrollments(enrollmentsCourse);
      }
    } catch (error) {
      console.error('Error removing enrollment:', error);
      toast.error(t.enrollmentError[lang]);
    }
  };

  // Filter students based on search
  const filteredStudents = allStudents.filter(student => {
    const query = studentSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (student.student_id || '').toLowerCase().includes(query) ||
      (student.name_en || '').toLowerCase().includes(query) ||
      (student.name_ar || '').includes(studentSearchQuery) ||
      (student.email || '').toLowerCase().includes(query)
    );
  });

  // Open edit modal
  const openEditModal = async (course: Course | ProgramCourse) => {
    try {
      // Fetch full course data with relationships
      const response = await apiClient.get(`/courses/${course.id}`);
      const fullCourse = response.data.data || response.data;

      setEditingCourse(fullCourse);
      const programIds = fullCourse.programs?.map((p: any) => String(p.id)) ||
                         (fullCourse.program_id ? [String(fullCourse.program_id)] : []);
      const courseType = fullCourse.programs?.[0]?.pivot?.type || 'MAJOR';
      // Get college_ids from programs if available
      const collegeIds = fullCourse.college_id
        ? [String(fullCourse.college_id)]
        : fullCourse.programs?.map((p: any) => {
            const collegeId = p.college_id || p.college?.id || p.department?.college_id;
            return collegeId ? String(collegeId) : null;
          }).filter((id: string | null): id is string => id !== null) || [];
      // Remove duplicates
      const uniqueCollegeIds = [...new Set(collegeIds)];
      setFormData({
        code: fullCourse.code,
        name_en: fullCourse.name_en,
        name_ar: fullCourse.name_ar,
        credits: fullCourse.credits,
        capacity: fullCourse.capacity || 30,
        college_ids: uniqueCollegeIds,
        program_ids: programIds,
        course_type: courseType,
        description: fullCourse.description || '',
        is_active: fullCourse.is_active ?? true,
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error(lang === 'ar' ? 'فشل في جلب بيانات المادة' : 'Failed to fetch course details');
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name_en: '',
      name_ar: '',
      credits: 3,
      capacity: 30,
      college_ids: [],
      program_ids: [],
      course_type: 'MAJOR',
      description: '',
      is_active: true,
    });
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            {t.title[lang]}
          </h1>
          <p className="text-slate-500 mt-1">{t.subtitle[lang]}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={syncCoursesToLms}
            disabled={syncingToLms}
            className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {syncingToLms ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{syncingToLms ? t.syncingToLms[lang] : t.syncToLms[lang]}</span>
            <span className="sm:hidden">LMS</span>
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addCourse[lang]}</span>
          </button>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          syncMessage.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {syncMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <CloudOff className="w-5 h-5 text-red-600" />
          )}
          <span>{syncMessage.text}</span>
          <button onClick={() => setSyncMessage(null)} className="ms-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.totalCourses[lang]}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.activeCourses[lang]}</p>
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
              <p className="text-sm text-slate-500">{t.inactiveCourses[lang]}</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t.totalCapacity[lang]}</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalCapacity}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Credit Distribution Summary - Dynamic for All Programs */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t.creditDistribution[lang]}
            </h3>
            <button
              onClick={fetchCourses}
              className="p-2 border border-blue-200 rounded-lg hover:bg-blue-100 bg-white sm:hidden"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.search[lang]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">{t.all[lang]}</option>
              <option value="active">{t.active[lang]}</option>
              <option value="inactive">{t.inactive[lang]}</option>
            </select>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">{t.allColleges[lang]}</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {lang === 'ar' ? college.name_ar : college.name_en}
                </option>
              ))}
            </select>
            <select
              value={selectedProgram}
              onChange={(e) => handleProgramChange(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="all">{t.allPrograms[lang]}</option>
              {filteredProgramsByCollege.map(program => (
                <option key={program.id} value={program.id.toString()}>
                  {lang === 'ar' ? program.name_ar : program.name_en} ({program.code})
                </option>
              ))}
            </select>
            <button
              onClick={fetchCourses}
              className="hidden sm:flex items-center justify-center p-2 border border-blue-200 rounded-lg hover:bg-blue-100 bg-white"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {selectedProgram === 'all' ? (
          <>
            {/* All Courses Header */}
            <div className="mb-4 p-3 bg-white/60 rounded-lg border border-blue-100">
              <p className="font-semibold text-blue-800">{lang === 'ar' ? 'جميع المواد الدراسية' : 'All Courses'}</p>
              <p className="text-sm text-blue-600">{lang === 'ar' ? 'إجمالي المواد' : 'Total Courses'}: {allCourses.length}</p>
            </div>

            {/* Credit Distribution Cards for All Courses */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs font-medium text-purple-700">{t.universityReq[lang]}</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{allCreditsByType.university}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({allCreditsByType.universityCount} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-medium text-blue-700">{t.collegeReq[lang]}</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{allCreditsByType.college}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({allCreditsByType.collegeCount} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-medium text-emerald-700">{t.majorReq[lang]}</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{allCreditsByType.major}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({allCreditsByType.majorCount} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-medium text-amber-700">{t.graduationProject[lang]}</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{allCreditsByType.graduation}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({allCreditsByType.graduationCount} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 shadow-sm text-white">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-medium">{t.totalCredits[lang]}</span>
                </div>
                <p className="text-2xl font-bold">{allCreditsByType.total}</p>
                <p className="text-xs text-blue-100">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({allCourses.length} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>
            </div>

            {/* All Courses Lists by Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* University Requirements List */}
              {(allCoursesByType['UNIVERSITY'] || []).length > 0 && (
                <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                    <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      {t.universityReq[lang]} ({allCreditsByType.university} {lang === 'ar' ? 'ساعة' : 'cr'})
                    </h4>
                  </div>
                  <div className="divide-y divide-purple-100 max-h-64 overflow-y-auto">
                    {(allCoursesByType['UNIVERSITY'] || []).map(course => (
                      <div key={course.id} className="px-4 py-3 hover:bg-purple-50/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-purple-600 font-semibold w-24">{course.code}</span>
                          <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 bg-purple-100 px-2 py-1 rounded">{course.credits} {lang === 'ar' ? 'س' : 'cr'}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button onClick={() => fetchCourseEnrollments(course)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title={t.viewEnrollments[lang]}><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openEditModal(course)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title={t.edit[lang]}><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(course.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title={t.delete[lang]}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* College Requirements List */}
              {(allCoursesByType['COLLEGE'] || []).length > 0 && (
                <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      {t.collegeReq[lang]} ({allCreditsByType.college} {lang === 'ar' ? 'ساعة' : 'cr'})
                    </h4>
                  </div>
                  <div className="divide-y divide-blue-100 max-h-64 overflow-y-auto">
                    {(allCoursesByType['COLLEGE'] || []).map(course => (
                      <div key={course.id} className="px-4 py-3 hover:bg-blue-50/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-blue-600 font-semibold w-24">{course.code}</span>
                          <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 bg-blue-100 px-2 py-1 rounded">{course.credits} {lang === 'ar' ? 'س' : 'cr'}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button onClick={() => fetchCourseEnrollments(course)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title={t.viewEnrollments[lang]}><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openEditModal(course)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title={t.edit[lang]}><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(course.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title={t.delete[lang]}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Major Requirements List */}
              {(allCoursesByType['MAJOR'] || []).length > 0 && (
                <div className="bg-white rounded-lg border border-emerald-200 overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      {t.majorReq[lang]} ({allCreditsByType.major} {lang === 'ar' ? 'ساعة' : 'cr'})
                    </h4>
                  </div>
                  <div className="divide-y divide-emerald-100 max-h-64 overflow-y-auto">
                    {(allCoursesByType['MAJOR'] || []).map(course => (
                      <div key={course.id} className="px-4 py-3 hover:bg-emerald-50/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-emerald-600 font-semibold w-24">{course.code}</span>
                          <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 bg-emerald-100 px-2 py-1 rounded">{course.credits} {lang === 'ar' ? 'س' : 'cr'}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button onClick={() => fetchCourseEnrollments(course)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title={t.viewEnrollments[lang]}><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openEditModal(course)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title={t.edit[lang]}><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(course.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title={t.delete[lang]}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Graduation Project List */}
              {(allCoursesByType['GRADUATION'] || []).length > 0 && (
                <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                  <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                    <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      {t.graduationProject[lang]} ({allCreditsByType.graduation} {lang === 'ar' ? 'ساعة' : 'cr'})
                    </h4>
                  </div>
                  <div className="divide-y divide-amber-100 max-h-64 overflow-y-auto">
                    {(allCoursesByType['GRADUATION'] || []).map(course => (
                      <div key={course.id} className="px-4 py-3 hover:bg-amber-50/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-amber-600 font-semibold w-24">{course.code}</span>
                          <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 bg-amber-100 px-2 py-1 rounded">{course.credits} {lang === 'ar' ? 'س' : 'cr'}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button onClick={() => fetchCourseEnrollments(course)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title={t.viewEnrollments[lang]}><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openEditModal(course)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title={t.edit[lang]}><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(course.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title={t.delete[lang]}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : loadingProgramCourses ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-slate-500">{t.loading[lang]}</p>
          </div>
        ) : (
          <>
            {/* Program Info */}
            {selectedProgramInfo && (
              <div className="mb-4 p-3 bg-white/60 rounded-lg border border-blue-100">
                <p className="font-semibold text-blue-800">{lang === 'ar' ? selectedProgramInfo.name_ar : selectedProgramInfo.name_en}</p>
                <p className="text-sm text-blue-600">{selectedProgramInfo.code} - {t.totalCredits[lang]}: {selectedProgramInfo.total_credits}</p>
              </div>
            )}

            {/* Credit Distribution Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {/* University Requirements */}
              <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs font-medium text-purple-700">{t.universityReq[lang]}</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{creditsByType.university}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({creditsByType.universityCount} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>

              {/* College Requirements */}
              <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-medium text-blue-700">{t.collegeReq[lang]}</span>
                </div>
                {selectedProgramInfo?.college && (
                  <p className="text-xs text-blue-600 mb-1">({lang === 'ar' ? selectedProgramInfo.college.name_ar : selectedProgramInfo.college.name_en})</p>
                )}
                <p className="text-2xl font-bold text-blue-600">{creditsByType.college}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({creditsByType.collegeCount} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>

              {/* Major Requirements */}
              <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-medium text-emerald-700">{t.majorReq[lang]}</span>
                </div>
                {selectedProgramInfo && (
                  <p className="text-xs text-emerald-600 mb-1">({lang === 'ar' ? selectedProgramInfo.name_ar : selectedProgramInfo.name_en})</p>
                )}
                <p className="text-2xl font-bold text-emerald-600">{creditsByType.major}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({creditsByType.majorCount} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>

              {/* Graduation Project */}
              <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-medium text-amber-700">{t.graduationProject[lang]}</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{creditsByType.graduation}</p>
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({creditsByType.graduationCount} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>

              {/* Total */}
              <div className="bg-blue-600 rounded-lg p-4 text-white shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <span className="text-xs font-medium">{t.totalCredits[lang]}</span>
                </div>
                <p className="text-2xl font-bold">{creditsByType.total}</p>
                <p className="text-xs text-blue-100">{lang === 'ar' ? 'ساعة معتمدة' : 'credits'} ({filteredProgramCourses.length} {lang === 'ar' ? 'مادة' : 'courses'})</p>
              </div>
            </div>

            {/* Course Lists by Type */}
            <div className="space-y-4">
              {/* University Requirements List */}
              {(programCoursesByType['UNIVERSITY'] || []).length > 0 && (
                <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                    <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      {t.universityReq[lang]} ({creditsByType.university} {lang === 'ar' ? 'ساعة' : 'cr'})
                    </h4>
                  </div>
                  <div className="divide-y divide-purple-100">
                    {(programCoursesByType['UNIVERSITY'] || []).map(course => (
                      <div key={course.id} className="px-4 py-3 hover:bg-purple-50/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-purple-600 font-semibold w-24">{course.code}</span>
                          <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 bg-purple-100 px-2 py-1 rounded">{course.credits} {lang === 'ar' ? 'س' : 'cr'}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={() => fetchCourseEnrollments(course as any)}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title={t.viewEnrollments[lang]}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title={t.edit[lang]}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title={t.delete[lang]}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* College Requirements List */}
              {(programCoursesByType['COLLEGE'] || []).length > 0 && (
                <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      {t.collegeReq[lang]} ({creditsByType.college} {lang === 'ar' ? 'ساعة' : 'cr'})
                    </h4>
                  </div>
                  <div className="divide-y divide-blue-100">
                    {(programCoursesByType['COLLEGE'] || []).map(course => (
                      <div key={course.id} className="px-4 py-3 hover:bg-blue-50/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-blue-600 font-semibold w-24">{course.code}</span>
                          <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 bg-blue-100 px-2 py-1 rounded">{course.credits} {lang === 'ar' ? 'س' : 'cr'}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={() => fetchCourseEnrollments(course as any)}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title={t.viewEnrollments[lang]}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title={t.edit[lang]}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title={t.delete[lang]}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Major Requirements List */}
              {(programCoursesByType['MAJOR'] || []).length > 0 && (
                <div className="bg-white rounded-lg border border-emerald-200 overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      {t.majorReq[lang]} ({creditsByType.major} {lang === 'ar' ? 'ساعة' : 'cr'})
                    </h4>
                  </div>
                  <div className="divide-y divide-emerald-100">
                    {(programCoursesByType['MAJOR'] || []).map(course => (
                      <div key={course.id} className="px-4 py-3 hover:bg-emerald-50/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-emerald-600 font-semibold w-24">{course.code}</span>
                          <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 bg-emerald-100 px-2 py-1 rounded">{course.credits} {lang === 'ar' ? 'س' : 'cr'}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={() => fetchCourseEnrollments(course as any)}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title={t.viewEnrollments[lang]}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title={t.edit[lang]}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title={t.delete[lang]}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Graduation Project List */}
              {(programCoursesByType['GRADUATION'] || []).length > 0 && (
                <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                  <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
                    <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      {t.graduationProject[lang]} ({creditsByType.graduation} {lang === 'ar' ? 'ساعة' : 'cr'})
                    </h4>
                  </div>
                  <div className="divide-y divide-amber-100">
                    {(programCoursesByType['GRADUATION'] || []).map(course => (
                      <div key={course.id} className="px-4 py-3 hover:bg-amber-50/50 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-amber-600 font-semibold w-24">{course.code}</span>
                          <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 bg-amber-100 px-2 py-1 rounded">{course.credits} {lang === 'ar' ? 'س' : 'cr'}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={() => fetchCourseEnrollments(course as any)}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title={t.viewEnrollments[lang]}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(course)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title={t.edit[lang]}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title={t.delete[lang]}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCourse ? t.editCourse[lang] : t.addCourse[lang]}
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.credits[lang]}</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameEn[lang]}</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameAr[lang]}</label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  dir="rtl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.capacity[lang]}</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.college[lang]}</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                  {colleges.map((college) => (
                    <label key={college.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.college_ids.includes(String(college.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, college_ids: [...formData.college_ids, String(college.id)] });
                          } else {
                            // Remove college and its programs
                            const newCollegeIds = formData.college_ids.filter(id => id !== String(college.id));
                            const collegePrograms = programs.filter(p => {
                              const pCollegeId = p.college_id || p.college?.id || p.department?.college_id;
                              return pCollegeId?.toString() === String(college.id);
                            }).map(p => String(p.id));
                            const newProgramIds = formData.program_ids.filter(id => !collegePrograms.includes(id));
                            setFormData({ ...formData, college_ids: newCollegeIds, program_ids: newProgramIds });
                          }
                        }}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-700">
                        {lang === 'ar' ? college.name_ar : college.name_en}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.college_ids.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {lang === 'ar' ? `تم اختيار ${formData.college_ids.length} كلية` : `${formData.college_ids.length} college(s) selected`}
                  </p>
                )}
              </div>
              {formData.college_ids.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.selectProgram[lang]}</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                    {programs
                      .filter(p => {
                        const programCollegeId = p.college_id || p.college?.id || p.department?.college_id;
                        return formData.college_ids.includes(programCollegeId?.toString() || '');
                      })
                      .map((program) => {
                        const programCollege = colleges.find(c => {
                          const pCollegeId = program.college_id || program.college?.id || program.department?.college_id;
                          return c.id === pCollegeId;
                        });
                        return (
                          <label key={program.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={formData.program_ids.includes(String(program.id))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, program_ids: [...formData.program_ids, String(program.id)] });
                                } else {
                                  setFormData({ ...formData, program_ids: formData.program_ids.filter(id => id !== String(program.id)) });
                                }
                              }}
                              className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-slate-700">
                              {lang === 'ar' ? program.name_ar : program.name_en} ({program.code})
                              {programCollege && formData.college_ids.length > 1 && (
                                <span className="text-xs text-slate-400 ms-1">
                                  - {lang === 'ar' ? programCollege.name_ar : programCollege.name_en}
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    {programs.filter(p => {
                      const programCollegeId = p.college_id || p.college?.id || p.department?.college_id;
                      return formData.college_ids.includes(programCollegeId?.toString() || '');
                    }).length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-2">
                        {lang === 'ar' ? 'لا توجد برامج للكليات المختارة' : 'No programs for selected colleges'}
                      </p>
                    )}
                  </div>
                  {formData.program_ids.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      {lang === 'ar' ? `تم اختيار ${formData.program_ids.length} برنامج` : `${formData.program_ids.length} program(s) selected`}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.courseType[lang]}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'UNIVERSITY', label: t.universityReq },
                    { value: 'COLLEGE', label: t.collegeReq },
                    { value: 'MAJOR', label: t.majorReq },
                    { value: 'GRADUATION', label: t.graduationProject },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.course_type === type.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="course_type"
                        value={type.value}
                        checked={formData.course_type === type.value}
                        onChange={(e) => setFormData({ ...formData, course_type: e.target.value as any })}
                        className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">{type.label[lang]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{lang === 'ar' ? 'الوصف' : 'Description'}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                  {t.active[lang]}
                </label>
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t.save[lang]}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prerequisites Modal */}
      {showPrereqModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-600" />
                  {t.managePrerequisites[lang]}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedCourse.code} - {lang === 'ar' ? selectedCourse.name_ar : selectedCourse.name_en}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddPrereqModal(true)}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t.addPrerequisite[lang]}
                </button>
                <button
                  onClick={() => { setShowPrereqModal(false); setSelectedCourse(null); setPrerequisites([]); }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {loadingPrereqs ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-3" />
                  <p className="text-slate-500">{t.loading[lang]}</p>
                </div>
              ) : prerequisites.length === 0 ? (
                <div className="text-center py-12">
                  <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t.noPrerequisites[lang]}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prerequisites.map(prereq => (
                    <div key={prereq.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm text-purple-600 font-semibold w-24">
                          {prereq.code}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">
                            {lang === 'ar' ? prereq.name_ar : prereq.name_en}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {prereq.credits} {t.credits[lang]}
                            </span>
                            {prereq.min_grade && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                {t.minGrade[lang]}: {prereq.min_grade}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              prereq.is_required ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {prereq.is_required ? t.required[lang] : t.optional[lang]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removePrerequisite(prereq.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        title={t.removePrerequisite[lang]}
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Prerequisite Modal */}
      {showAddPrereqModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t.addPrerequisite[lang]}</h3>
              <button
                onClick={() => setShowAddPrereqModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.selectCourse[lang]}</label>
                <select
                  value={newPrereqData.prerequisite_id}
                  onChange={(e) => setNewPrereqData({ ...newPrereqData, prerequisite_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t.selectCourse[lang]}</option>
                  {allCourses
                    .filter(c => c.id !== selectedCourse?.id && !prerequisites.find(p => p.id === c.id))
                    .map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {lang === 'ar' ? course.name_ar : course.name_en}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.minGrade[lang]}</label>
                  <select
                    value={newPrereqData.min_grade}
                    onChange={(e) => setNewPrereqData({ ...newPrereqData, min_grade: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={newPrereqData.is_required}
                    onChange={(e) => setNewPrereqData({ ...newPrereqData, is_required: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="is_required" className="ms-2 text-sm font-medium text-slate-700">
                    {t.required[lang]}
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPrereqModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {t.cancel[lang]}
                </button>
                <button
                  onClick={addPrerequisite}
                  disabled={saving || !newPrereqData.prerequisite_id}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {t.addPrerequisite[lang]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Enrollments Modal */}
      {showEnrollmentsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.courseEnrollments[lang]}</h3>
                {enrollmentsCourse && (
                  <p className="text-sm text-slate-500">
                    {enrollmentsCourse.code} - {lang === 'ar' ? enrollmentsCourse.name_ar : enrollmentsCourse.name_en}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openAddStudentModal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t.addStudent[lang]}
                </button>
                <button
                  onClick={() => {
                    setShowEnrollmentsModal(false);
                    setEnrollmentsCourse(null);
                    setCourseEnrollments([]);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {loadingEnrollments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : courseEnrollments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>{t.noEnrollments[lang]}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-3 text-start text-sm font-semibold text-slate-700">{t.studentId[lang]}</th>
                        <th className="px-4 py-3 text-start text-sm font-semibold text-slate-700">{t.studentName[lang]}</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.midterm[lang]}</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.final[lang]}</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.assignments[lang]}</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.grade[lang]}</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.status[lang]}</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.actions[lang]}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {courseEnrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-slate-600">
                              {enrollment.student?.student_id || enrollment.student_id || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-slate-800">
                              {lang === 'ar'
                                ? (enrollment.student?.name_ar || enrollment.student?.name_en || '-')
                                : (enrollment.student?.name_en || enrollment.student?.name_ar || '-')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm ${enrollment.midterm_score !== null ? 'text-slate-800' : 'text-slate-400'}`}>
                              {enrollment.midterm_score !== null ? enrollment.midterm_score : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm ${enrollment.final_score !== null ? 'text-slate-800' : 'text-slate-400'}`}>
                              {enrollment.final_score !== null ? enrollment.final_score : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm ${enrollment.assignments_score !== null ? 'text-slate-800' : 'text-slate-400'}`}>
                              {enrollment.assignments_score !== null ? enrollment.assignments_score : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {enrollment.grade ? (
                              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                enrollment.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                enrollment.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                enrollment.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                                enrollment.grade.startsWith('D') ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {enrollment.grade}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              enrollment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              enrollment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              enrollment.status === 'DROPPED' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {enrollment.status || 'ENROLLED'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeStudentEnrollment(enrollment.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title={t.removeStudent[lang]}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-sm text-slate-500 text-center">
                    {lang === 'ar'
                      ? `إجمالي الطلاب: ${courseEnrollments.length}`
                      : `Total Students: ${courseEnrollments.length}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Student to Course Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t.addStudentToCourse[lang]}</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.selectSemester[lang]}</label>
                <select
                  value={newEnrollmentData.semester_id}
                  onChange={(e) => setNewEnrollmentData({ ...newEnrollmentData, semester_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t.selectSemester[lang]}</option>
                  {semesters.map((semester: any) => (
                    <option key={semester.id} value={semester.id}>
                      {lang === 'ar' ? semester.name_ar : semester.name_en} - {semester.academic_year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.selectStudent[lang]}</label>
                <div className="relative mb-2">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder={t.searchStudents[lang]}
                    className="w-full ps-10 pe-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {loadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">
                        {lang === 'ar' ? 'لا يوجد طلاب' : 'No students found'}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredStudents.slice(0, 50).map((student: any) => {
                          const isEnrolled = courseEnrollments.some(
                            e => String(e.student_id) === String(student.id)
                          );
                          return (
                            <label
                              key={student.id}
                              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 ${
                                isEnrolled ? 'opacity-50 cursor-not-allowed' : ''
                              } ${newEnrollmentData.student_id === String(student.id) ? 'bg-green-50' : ''}`}
                            >
                              <input
                                type="radio"
                                name="student_selection"
                                value={student.id}
                                checked={newEnrollmentData.student_id === String(student.id)}
                                onChange={(e) => setNewEnrollmentData({ ...newEnrollmentData, student_id: e.target.value })}
                                disabled={isEnrolled}
                                className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800 truncate">
                                  {lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {student.student_id} {student.email && `• ${student.email}`}
                                </p>
                              </div>
                              {isEnrolled && (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                                  {t.alreadyEnrolled[lang]}
                                </span>
                              )}
                            </label>
                          );
                        })}
                        {filteredStudents.length > 50 && (
                          <div className="p-3 text-center text-sm text-slate-500 bg-slate-50">
                            {lang === 'ar'
                              ? `يظهر 50 من ${filteredStudents.length} طالب. استخدم البحث لتصفية النتائج.`
                              : `Showing 50 of ${filteredStudents.length} students. Use search to filter.`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={addStudentEnrollment}
                disabled={addingEnrollment || !newEnrollmentData.student_id || !newEnrollmentData.semester_id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingEnrollment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t.addStudent[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;

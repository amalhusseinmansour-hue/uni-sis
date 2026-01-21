import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Filter, Download, Upload, Eye, Edit2, Trash2,
  Mail, Phone, Calendar, MapPin, GraduationCap, CreditCard, FileText,
  ChevronDown, X, Check, RefreshCw, MoreVertical, AlertCircle, CheckCircle,
  User, Building, BookOpen, Clock, ArrowRight, Save, Loader2, IdCard, Cloud,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, Key, Camera,
  ClipboardList, Plus, MinusCircle, XCircle
} from 'lucide-react';
import { studentsAPI } from '../api/students';
import { lmsAPI, LmsStudent } from '../api/lms';
import { programsAPI, collegesAPI } from '../api/programs';
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
  academicDegree: { en: 'Academic Degree', ar: 'الدرجة العلمية' },
  college: { en: 'College', ar: 'الكلية' },
  selectCollege: { en: 'Select College', ar: 'اختر الكلية' },
  selectProgram: { en: 'Select Program', ar: 'اختر البرنامج' },
  selectDegree: { en: 'Select Degree', ar: 'اختر الدرجة' },
  bachelor: { en: 'Bachelor', ar: 'بكالوريوس' },
  master: { en: 'Master', ar: 'ماجستير' },
  phd: { en: 'PhD', ar: 'دكتوراه' },
  diploma: { en: 'Diploma', ar: 'دبلوم' },
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
  importFromLms: { en: 'Import from LMS', ar: 'استيراد من LMS' },
  importingFromLms: { en: 'Importing from LMS...', ar: 'جاري الاستيراد من LMS...' },
  lmsImportSuccess: { en: 'Students imported from LMS successfully', ar: 'تم استيراد الطلاب من LMS بنجاح' },
  lmsImportError: { en: 'Failed to import students from LMS', ar: 'فشل استيراد الطلاب من LMS' },
  imported: { en: 'Imported', ar: 'تم استيراد' },
  updated: { en: 'Updated', ar: 'تم تحديث' },
  skipped: { en: 'Skipped', ar: 'تم تخطي' },
  failed: { en: 'Failed', ar: 'فشل' },
  sisStudents: { en: 'SIS Students', ar: 'طلاب SIS' },
  lmsStudents: { en: 'LMS Students', ar: 'طلاب LMS' },
  loadingLmsStudents: { en: 'Loading LMS students...', ar: 'جاري تحميل طلاب LMS...' },
  lmsLoadError: { en: 'Failed to load LMS students', ar: 'فشل تحميل طلاب LMS' },
  existsInSis: { en: 'Exists in SIS', ar: 'موجود في SIS' },
  notInSis: { en: 'Not in SIS', ar: 'غير موجود في SIS' },
  lastAccess: { en: 'Last Access', ar: 'آخر دخول' },
  username: { en: 'Username', ar: 'اسم المستخدم' },
  noLmsStudents: { en: 'No students found in LMS', ar: 'لا يوجد طلاب في LMS' },
  lmsConnectionError: { en: 'Could not connect to LMS. Please check the LMS configuration.', ar: 'تعذر الاتصال بـ LMS. يرجى التحقق من إعدادات LMS.' },
  deleteStudent: { en: 'Delete Student', ar: 'حذف الطالب' },
  deleteConfirm: { en: 'Are you sure you want to delete this student?', ar: 'هل أنت متأكد من حذف هذا الطالب؟' },
  deleteSuccess: { en: 'Student deleted successfully', ar: 'تم حذف الطالب بنجاح' },
  deleteError: { en: 'Failed to delete student', ar: 'فشل حذف الطالب' },
  deleting: { en: 'Deleting...', ar: 'جاري الحذف...' },
  page: { en: 'Page', ar: 'صفحة' },
  of: { en: 'of', ar: 'من' },
  showing: { en: 'Showing', ar: 'عرض' },
  to: { en: 'to', ar: 'إلى' },
  entries: { en: 'entries', ar: 'سجل' },
  perPage: { en: 'Per page', ar: 'لكل صفحة' },
  first: { en: 'First', ar: 'الأولى' },
  last: { en: 'Last', ar: 'الأخيرة' },
  previous: { en: 'Previous', ar: 'السابق' },
  next: { en: 'Next', ar: 'التالي' },
  loginCredentials: { en: 'Login Credentials', ar: 'بيانات الدخول' },
  loginUsername: { en: 'Username (Student ID)', ar: 'اسم المستخدم (الرقم الجامعي)' },
  loginPassword: { en: 'Password', ar: 'كلمة المرور' },
  copyToClipboard: { en: 'Copy', ar: 'نسخ' },
  copied: { en: 'Copied!', ar: 'تم النسخ!' },
  defaultPasswordNote: { en: 'Default password format: Vtx@{National ID/Passport}', ar: 'صيغة كلمة المرور الافتراضية: Vtx@{رقم الهوية/الجواز}' },
  syncProfilePictures: { en: 'Sync Photos from LMS', ar: 'مزامنة الصور من LMS' },
  syncingPhotos: { en: 'Syncing photos...', ar: 'جاري مزامنة الصور...' },
  syncPhotosSuccess: { en: 'Profile pictures synced successfully', ar: 'تم مزامنة الصور الشخصية بنجاح' },
  syncPhotosError: { en: 'Failed to sync profile pictures', ar: 'فشل مزامنة الصور الشخصية' },
  updateStudent: { en: 'Update Student', ar: 'تحديث بيانات الطالب' },
  updateSuccess: { en: 'Student updated successfully', ar: 'تم تحديث بيانات الطالب بنجاح' },
  updateError: { en: 'Failed to update student', ar: 'فشل تحديث بيانات الطالب' },
  updating: { en: 'Updating...', ar: 'جاري التحديث...' },
  firstNameEn: { en: 'First Name (English)', ar: 'الاسم الأول (إنجليزي)' },
  lastNameEn: { en: 'Last Name (English)', ar: 'اسم العائلة (إنجليزي)' },
  firstNameAr: { en: 'First Name (Arabic)', ar: 'الاسم الأول (عربي)' },
  lastNameAr: { en: 'Last Name (Arabic)', ar: 'اسم العائلة (عربي)' },
  profilePicture: { en: 'Profile Picture', ar: 'الصورة الشخصية' },
  uploadPhoto: { en: 'Upload Photo', ar: 'رفع صورة' },
  changePhoto: { en: 'Change Photo', ar: 'تغيير الصورة' },
  uploadDocument: { en: 'Upload Document', ar: 'رفع مستند' },
  documentType: { en: 'Document Type', ar: 'نوع المستند' },
  documentTitle: { en: 'Document Title', ar: 'عنوان المستند' },
  nationalIdDoc: { en: 'National ID / Passport', ar: 'الهوية الوطنية / جواز السفر' },
  highSchoolCert: { en: 'High School Certificate', ar: 'شهادة الثانوية' },
  birthCert: { en: 'Birth Certificate', ar: 'شهادة الميلاد' },
  medicalReport: { en: 'Medical Report', ar: 'تقرير طبي' },
  otherDoc: { en: 'Other', ar: 'أخرى' },
  uploading: { en: 'Uploading...', ar: 'جاري الرفع...' },
  uploadSuccess: { en: 'File uploaded successfully', ar: 'تم رفع الملف بنجاح' },
  uploadError: { en: 'Failed to upload file', ar: 'فشل رفع الملف' },
  noDocuments: { en: 'No documents uploaded', ar: 'لا توجد مستندات' },
  deleteDoc: { en: 'Delete', ar: 'حذف' },
  downloadDoc: { en: 'Download', ar: 'تحميل' },
  viewDoc: { en: 'View', ar: 'عرض' },
  filesAndDocs: { en: 'Files & Documents', ar: 'الملفات والمستندات' },
  selectFile: { en: 'Select file', ar: 'اختر ملف' },
  maxFileSize: { en: 'Max file size: 5MB for photos, 10MB for documents', ar: 'الحد الأقصى: 5MB للصور، 10MB للمستندات' },
  studyPlan: { en: 'Study Plan', ar: 'الخطة الدراسية' },
  programCourses: { en: 'Program Courses', ar: 'مواد البرنامج' },
  noProgramAssigned: { en: 'No program assigned to this student', ar: 'لا يوجد برنامج مسجل لهذا الطالب' },
  universityReq: { en: 'University Requirements', ar: 'متطلبات الجامعة' },
  collegeReq: { en: 'College Requirements', ar: 'متطلبات الكلية' },
  majorReq: { en: 'Major Requirements', ar: 'متطلبات التخصص' },
  totalCredits: { en: 'Total Credits', ar: 'إجمالي الساعات' },
  credits: { en: 'Credits', ar: 'ساعات' },
  semester: { en: 'Semester', ar: 'الفصل' },
  courseCode: { en: 'Code', ar: 'الرمز' },
  courseName: { en: 'Course Name', ar: 'اسم المادة' },
  courseType: { en: 'Type', ar: 'النوع' },
  // Enrollments Management
  currentEnrollments: { en: 'Current Enrollments', ar: 'المواد المسجلة حالياً' },
  addCourse: { en: 'Add Course', ar: 'إضافة مادة' },
  withdrawCourse: { en: 'Withdraw', ar: 'سحب' },
  dropCourse: { en: 'Drop', ar: 'حذف' },
  editEnrollment: { en: 'Edit', ar: 'تعديل' },
  enrollmentStatus: { en: 'Status', ar: 'الحالة' },
  enrolled: { en: 'Enrolled', ar: 'مسجل' },
  dropped: { en: 'Dropped', ar: 'محذوف' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  section: { en: 'Section', ar: 'الشعبة' },
  noEnrollments: { en: 'No enrollments found', ar: 'لا توجد مواد مسجلة' },
  selectCourse: { en: 'Select Course', ar: 'اختر المادة' },
  selectSemester: { en: 'Select Semester', ar: 'اختر الفصل الدراسي' },
  addEnrollment: { en: 'Add Enrollment', ar: 'إضافة تسجيل' },
  confirmWithdraw: { en: 'Are you sure you want to withdraw this course?', ar: 'هل أنت متأكد من سحب هذه المادة؟' },
  confirmDrop: { en: 'Are you sure you want to drop this course?', ar: 'هل أنت متأكد من حذف هذه المادة؟' },
  enrollmentAdded: { en: 'Enrollment added successfully', ar: 'تمت إضافة التسجيل بنجاح' },
  enrollmentUpdated: { en: 'Enrollment updated successfully', ar: 'تم تحديث التسجيل بنجاح' },
  enrollmentDropped: { en: 'Course dropped successfully', ar: 'تم حذف المادة بنجاح' },
  enrollmentWithdrawn: { en: 'Course withdrawn successfully', ar: 'تم سحب المادة بنجاح' },
  allSemesters: { en: 'All Semesters', ar: 'جميع الفصول' },
  currentSemester: { en: 'Current Semester', ar: 'الفصل الحالي' },
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
    college_id: '',
    program_id: '',
    degree: 'BACHELOR',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    password: '',
  });

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });

  // LMS Import state
  const [lmsImportLoading, setLmsImportLoading] = useState(false);
  const [photoSyncLoading, setPhotoSyncLoading] = useState(false);

  // LMS Students view state
  const [viewMode, setViewMode] = useState<'sis' | 'lms'>('sis');
  const [lmsStudents, setLmsStudents] = useState<LmsStudent[]>([]);
  const [lmsLoading, setLmsLoading] = useState(false);
  const [lmsError, setLmsError] = useState<string | null>(null);

  // LMS Search and filter state
  const [lmsSearchQuery, setLmsSearchQuery] = useState('');
  const [lmsStatusFilter, setLmsStatusFilter] = useState<'all' | 'in_sis' | 'not_in_sis'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Credentials modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentialsStudent, setCredentialsStudent] = useState<any>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name_en: '',
    name_ar: '',
    first_name_en: '',
    last_name_en: '',
    first_name_ar: '',
    last_name_ar: '',
    national_id: '',
    date_of_birth: '',
    gender: 'MALE',
    nationality: '',
    phone: '',
    personal_email: '',
    university_email: '',
    address: '',
    status: 'ACTIVE',
    program_id: '',
    degree: 'BACHELOR',
    current_level: 1,
    admission_type: 'DIRECT',
    college: '',
  });
  const [updating, setUpdating] = useState(false);
  const [editActiveTab, setEditActiveTab] = useState<'personal' | 'academic' | 'files'>('personal');
  const [programs, setPrograms] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [studentDocuments, setStudentDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [programCourses, setProgramCourses] = useState<any[]>([]);
  const [loadingProgramCourses, setLoadingProgramCourses] = useState(false);
  const [newDocumentType, setNewDocumentType] = useState('ID_PASSPORT');
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Key to force re-render of file input
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Enrollments management state
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [showAddEnrollmentModal, setShowAddEnrollmentModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    course_id: '',
    semester_id: '',
    section: '',
    status: 'ENROLLED',
  });
  const [enrollmentSemesterFilter, setEnrollmentSemesterFilter] = useState('all');
  const [savingEnrollment, setSavingEnrollment] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<any>(null);
  const documentInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 1000 }; // Get all students
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

  // Fetch LMS students
  const fetchLmsStudents = async () => {
    try {
      setLmsLoading(true);
      setLmsError(null);
      const response = await lmsAPI.getLmsStudents();
      if (response.success) {
        setLmsStudents(response.students || []);
      } else {
        setLmsError(response.error || t.lmsLoadError[lang]);
      }
    } catch (error: any) {
      console.error('Error fetching LMS students:', error);
      setLmsError(error?.response?.data?.error || error?.message || t.lmsConnectionError[lang]);
    } finally {
      setLmsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  // Fetch programs and colleges for dropdown
  useEffect(() => {
    const fetchProgramsAndColleges = async () => {
      try {
        const [programsData, collegesData] = await Promise.all([
          programsAPI.getAll(),
          collegesAPI.getAll(),
        ]);
        setPrograms(programsData || []);
        setColleges(collegesData || []);
      } catch (error) {
        console.error('Error fetching programs/colleges:', error);
      }
    };
    fetchProgramsAndColleges();
  }, []);

  // Fetch LMS students when switching to LMS view
  useEffect(() => {
    if (viewMode === 'lms' && lmsStudents.length === 0 && !lmsLoading) {
      fetchLmsStudents();
    }
  }, [viewMode]);

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
        college_id: '', program_id: '', degree: 'BACHELOR', admission_date: new Date().toISOString().split('T')[0], status: 'ACTIVE', password: ''
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

  // Track if documents have been fetched for current student in profile view
  const [profileDocsFetched, setProfileDocsFetched] = useState(false);

  // Handle view profile
  const handleViewProfile = async (student: any) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
    setActiveTab('personal');
    setStudentDocuments([]); // Reset documents
    setLoadingDocuments(false);
    setProfileDocsFetched(false); // Reset fetch flag for new student
    setProgramCourses([]); // Reset program courses
    setLoadingProgramCourses(false);
    // Reset enrollments state for new student
    setStudentEnrollments([]);
    setLoadingEnrollments(false);
    setEnrollmentSemesterFilter('all');
  };

  // Fetch documents when documents tab is clicked in profile view
  const handleProfileTabChange = async (tabId: string) => {
    setActiveTab(tabId);

    // Fetch documents when documents tab is selected (only once per student)
    if (tabId === 'documents' && selectedStudent && !profileDocsFetched && !loadingDocuments) {
      setLoadingDocuments(true);
      setProfileDocsFetched(true); // Mark as fetched to prevent re-fetching
      try {
        const docs = await studentsAPI.getDocuments(selectedStudent.id);
        console.log('Documents tab - API Response:', docs);
        const docsArray = Array.isArray(docs) ? docs : (docs?.data || []);
        setStudentDocuments(docsArray);
      } catch (error: any) {
        console.error('Error fetching documents:', error);
        setProfileDocsFetched(false); // Allow retry on error
      } finally {
        setLoadingDocuments(false);
      }
    }

    // Fetch program courses when study plan tab is selected
    if (tabId === 'studyplan' && selectedStudent?.program_id && programCourses.length === 0 && !loadingProgramCourses) {
      setLoadingProgramCourses(true);
      try {
        console.log('[StudyPlan] Fetching courses for program:', selectedStudent.program_id);
        // Use the public endpoint that doesn't require authentication
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
        const response = await fetch(`${baseUrl}/programs-courses-public.php?program_id=${selectedStudent.program_id}`, {
          headers: {
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        console.log('[StudyPlan] API Response:', data);
        console.log('[StudyPlan] Courses count:', data.courses?.length || 0, 'Total courses:', data.total_courses);
        setProgramCourses(data.courses || data || []);
      } catch (error: any) {
        console.error('[StudyPlan] Error fetching program courses:', error);
      } finally {
        setLoadingProgramCourses(false);
      }
    }

    // Fetch enrollments when study plan tab is selected (for enrollment management)
    if (tabId === 'studyplan' && selectedStudent && studentEnrollments.length === 0 && !loadingEnrollments) {
      await fetchStudentEnrollments(selectedStudent.id);
      // Also fetch semesters for add enrollment modal
      if (semesters.length === 0) {
        await fetchSemesters();
      }
    }
  };

  // Fetch student enrollments
  const fetchStudentEnrollments = async (studentId: number) => {
    setLoadingEnrollments(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/enrollments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      setStudentEnrollments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Fetch semesters
  const fetchSemesters = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/semesters`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      setSemesters(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  // Fetch available courses
  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      setAvailableCourses(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Add enrollment
  const handleAddEnrollment = async () => {
    if (!selectedStudent || !enrollmentFormData.course_id || !enrollmentFormData.semester_id) return;

    setSavingEnrollment(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: enrollmentFormData.course_id,
          semester_id: enrollmentFormData.semester_id,
          section: enrollmentFormData.section || null,
          status: enrollmentFormData.status,
        }),
      });

      if (response.ok) {
        await fetchStudentEnrollments(selectedStudent.id);
        setShowAddEnrollmentModal(false);
        setEnrollmentFormData({ course_id: '', semester_id: '', section: '', status: 'ENROLLED' });
        alert(t.enrollmentAdded[lang]);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add enrollment');
      }
    } catch (error) {
      console.error('Error adding enrollment:', error);
      alert('Failed to add enrollment');
    } finally {
      setSavingEnrollment(false);
    }
  };

  // Update enrollment status
  const handleUpdateEnrollment = async (enrollmentId: number, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchStudentEnrollments(selectedStudent.id);
        setEditingEnrollment(null);
        alert(t.enrollmentUpdated[lang]);
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
    }
  };

  // Drop enrollment
  const handleDropEnrollment = async (enrollmentId: number) => {
    if (!confirm(t.confirmDrop[lang])) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/enrollments/${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        await fetchStudentEnrollments(selectedStudent.id);
        alert(t.enrollmentDropped[lang]);
      }
    } catch (error) {
      console.error('Error dropping enrollment:', error);
    }
  };

  // Withdraw enrollment
  const handleWithdrawEnrollment = async (enrollmentId: number) => {
    if (!confirm(t.confirmWithdraw[lang])) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/enrollments/${enrollmentId}/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        await fetchStudentEnrollments(selectedStudent.id);
        alert(t.enrollmentWithdrawn[lang]);
      }
    } catch (error) {
      console.error('Error withdrawing enrollment:', error);
    }
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

  // Import students from LMS
  const handleImportFromLms = async () => {
    try {
      setLmsImportLoading(true);
      const response = await lmsAPI.importStudentsFromLms();

      if (response.success) {
        const { data } = response;
        alert(
          lang === 'ar'
            ? `${t.lmsImportSuccess[lang]}\n\n${t.imported[lang]}: ${data.imported}\n${t.updated[lang]}: ${data.updated}\n${t.skipped[lang]}: ${data.skipped}\n${t.failed[lang]}: ${data.failed}`
            : `${t.lmsImportSuccess[lang]}\n\n${t.imported[lang]}: ${data.imported}\n${t.updated[lang]}: ${data.updated}\n${t.skipped[lang]}: ${data.skipped}\n${t.failed[lang]}: ${data.failed}`
        );
        fetchStudents(); // Refresh student list
      } else {
        alert(t.lmsImportError[lang]);
      }
    } catch (error: any) {
      console.error('LMS import error:', error);
      alert(error?.response?.data?.message_ar || error?.response?.data?.message || t.lmsImportError[lang]);
    } finally {
      setLmsImportLoading(false);
    }
  };

  // Handle delete student
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setDeleting(true);
      await studentsAPI.delete(studentToDelete.id);
      alert(t.deleteSuccess[lang]);
      setShowDeleteModal(false);
      setStudentToDelete(null);
      fetchStudents(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting student:', error);
      alert(error?.response?.data?.message || t.deleteError[lang]);
    } finally {
      setDeleting(false);
    }
  };

  // Confirm delete
  const confirmDelete = (student: any) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Show credentials
  const showCredentials = (student: any) => {
    setCredentialsStudent(student);
    setShowCredentialsModal(true);
  };

  // Handle edit student - open modal and populate form
  const handleEditStudent = async (student: any) => {
    setEditingStudent(student);
    setEditFormData({
      name_en: student.name_en || '',
      name_ar: student.name_ar || '',
      first_name_en: student.first_name_en || '',
      last_name_en: student.last_name_en || '',
      first_name_ar: student.first_name_ar || '',
      last_name_ar: student.last_name_ar || '',
      national_id: student.national_id || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || 'MALE',
      nationality: student.nationality || '',
      phone: student.phone || '',
      personal_email: student.personal_email || '',
      university_email: student.university_email || '',
      address: student.address || '',
      status: student.status || 'ACTIVE',
      program_id: student.program_id || '',
      degree: student.degree || student.program?.type || 'BACHELOR',
      current_level: student.current_level || 1,
      admission_type: student.admission_type || 'DIRECT',
      college: student.program?.college_id || '',
    });
    setEditActiveTab('personal');
    setPreviewPhoto(student.profile_picture_url || null);
    setStudentDocuments([]);
    setLoadingDocuments(true);
    setNewDocumentType('ID_PASSPORT');
    setNewDocumentTitle('');
    setShowEditModal(true);

    // Fetch student documents
    try {
      const docs = await studentsAPI.getDocuments(student.id);
      console.log('Edit - Fetched documents:', docs); // Debug log
      const docsArray = Array.isArray(docs) ? docs : (docs?.data || []);
      setStudentDocuments(docsArray);
      console.log('Edit - Documents set:', docsArray);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Handle edit form input change
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle update student
  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    try {
      setUpdating(true);
      await studentsAPI.update(editingStudent.id, editFormData);
      alert(t.updateSuccess[lang]);
      setShowEditModal(false);
      setEditingStudent(null);
      fetchStudents(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating student:', error);
      alert(error?.response?.data?.message || t.updateError[lang]);
    } finally {
      setUpdating(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingStudent || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 5MB)' : 'File too large (max 5MB)');
      return;
    }

    try {
      setUploadingPhoto(true);
      const result = await studentsAPI.uploadProfilePicture(editingStudent.id, file);
      setPreviewPhoto(result.profile_picture_url);
      setEditingStudent({ ...editingStudent, profile_picture_url: result.profile_picture_url });
      alert(t.uploadSuccess[lang]);
      fetchStudents(); // Refresh list to show new photo
    } catch (error: any) {
      console.error('Photo upload error:', error);
      alert(error?.response?.data?.message || t.uploadError[lang]);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Get default document title based on type
  const getDefaultDocumentTitle = (type: string, fileName?: string) => {
    const titles: Record<string, { en: string; ar: string }> = {
      ID_PASSPORT: { en: 'National ID / Passport', ar: 'الهوية الوطنية / جواز السفر' },
      HIGH_SCHOOL_CERTIFICATE: { en: 'High School Certificate', ar: 'شهادة الثانوية' },
      PHOTO: { en: 'Personal Photo', ar: 'صورة شخصية' },
      OTHER: { en: 'Document', ar: 'مستند' },
    };
    const baseTitle = titles[type]?.[lang] || titles['OTHER'][lang];
    // If we have a filename, append it for better identification
    if (fileName) {
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
      return `${baseTitle} - ${nameWithoutExt}`;
    }
    return baseTitle;
  };

  // Handle document upload (supports multiple files)
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingStudent || !e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Validate all files first
    const oversizedFiles = files.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(
        lang === 'ar'
          ? `الملفات التالية كبيرة جداً (الحد الأقصى 10MB):\n${oversizedFiles.map(f => f.name).join('\n')}`
          : `The following files are too large (max 10MB):\n${oversizedFiles.map(f => f.name).join('\n')}`
      );
      return;
    }

    try {
      setUploadingDocument(true);
      const uploadedDocs: any[] = [];
      const failedFiles: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Use entered title for first file, or generate from filename for multiple files
        const documentTitle = files.length === 1
          ? (newDocumentTitle.trim() || getDefaultDocumentTitle(newDocumentType))
          : getDefaultDocumentTitle(newDocumentType, file.name);

        try {
          const result = await studentsAPI.uploadDocument(editingStudent.id, file, newDocumentType, documentTitle);
          console.log('Upload result:', result); // Debug log
          if (result.document) {
            uploadedDocs.push(result.document);
          } else if (result.data?.document) {
            // Handle wrapped response
            uploadedDocs.push(result.data.document);
          } else {
            console.warn('No document in response:', result);
          }
        } catch (err: any) {
          console.error(`Failed to upload ${file.name}:`, err);
          console.error('Error details:', err?.response?.data);
          failedFiles.push(file.name);
        }
      }

      // Update documents list using functional update to ensure we have latest state
      if (uploadedDocs.length > 0) {
        setStudentDocuments(prevDocs => [...uploadedDocs, ...prevDocs]);
      }

      // Reset form
      setNewDocumentTitle('');
      setNewDocumentType('ID_PASSPORT');
      setFileInputKey(Date.now()); // Force re-render of file input to allow selecting same files again

      // Show result message
      if (failedFiles.length === 0) {
        alert(
          lang === 'ar'
            ? `تم رفع ${uploadedDocs.length} ملف بنجاح`
            : `Successfully uploaded ${uploadedDocs.length} file(s)`
        );
      } else if (uploadedDocs.length > 0) {
        alert(
          lang === 'ar'
            ? `تم رفع ${uploadedDocs.length} ملف. فشل رفع: ${failedFiles.join(', ')}`
            : `Uploaded ${uploadedDocs.length} file(s). Failed: ${failedFiles.join(', ')}`
        );
      } else {
        alert(
          lang === 'ar'
            ? `فشل رفع الملفات: ${failedFiles.join(', ')}`
            : `Failed to upload: ${failedFiles.join(', ')}`
        );
      }
    } catch (error: any) {
      console.error('Document upload error:', error);
      alert(error?.response?.data?.message || t.uploadError[lang]);
    } finally {
      setUploadingDocument(false);
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (documentId: number) => {
    if (!editingStudent) return;
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?')) return;

    try {
      await studentsAPI.deleteDocument(editingStudent.id, documentId);
      setStudentDocuments(studentDocuments.filter(doc => doc.id !== documentId));
      alert(lang === 'ar' ? 'تم حذف المستند' : 'Document deleted');
    } catch (error: any) {
      console.error('Delete document error:', error);
      alert(error?.response?.data?.message || t.uploadError[lang]);
    }
  };

  // Handle document download
  const handleDownloadDocument = async (doc: any) => {
    const fileName = doc.name || doc.title || 'document';
    await studentsAPI.downloadDocument(doc.file_path, fileName);
  };

  // Handle document view (open in new tab)
  const handleViewDocument = (doc: any) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
    const url = `${baseUrl}/storage/${doc.file_path}`;
    window.open(url, '_blank');
  };

  // Get document type label
  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, { en: string; ar: string }> = {
      ID_PASSPORT: t.nationalIdDoc,
      HIGH_SCHOOL_CERTIFICATE: t.highSchoolCert,
      PHOTO: { en: 'Photo', ar: 'صورة شخصية' },
      OTHER: t.otherDoc,
    };
    return types[type]?.[lang] || type;
  };

  // Sync profile pictures from LMS
  const handleSyncProfilePictures = async () => {
    try {
      setPhotoSyncLoading(true);
      const response = await lmsAPI.syncProfilePictures();

      if (response.success) {
        const data = response.data;
        alert(
          lang === 'ar'
            ? `${t.syncPhotosSuccess[lang]}\n\nنجح: ${data?.success || 0}\nفشل: ${data?.failed || 0}\nتم تخطي: ${data?.skipped || 0}`
            : `${t.syncPhotosSuccess[lang]}\n\nSuccess: ${data?.success || 0}\nFailed: ${data?.failed || 0}\nSkipped: ${data?.skipped || 0}`
        );
        fetchStudents(); // Refresh to show updated photos
      } else {
        alert(response.message_ar || response.message || t.syncPhotosError[lang]);
      }
    } catch (error: any) {
      console.error('Photo sync error:', error);
      alert(error?.response?.data?.message_ar || error?.response?.data?.message || t.syncPhotosError[lang]);
    } finally {
      setPhotoSyncLoading(false);
    }
  };

  // Filter LMS students based on search and status filter
  const filteredLmsStudents = lmsStudents.filter(student => {
    // Search filter
    const searchLower = lmsSearchQuery.toLowerCase();
    const matchesSearch = !lmsSearchQuery ||
      student.name_en?.toLowerCase().includes(searchLower) ||
      student.username?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.first_name?.toLowerCase().includes(searchLower) ||
      student.last_name?.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus =
      lmsStatusFilter === 'all' ||
      (lmsStatusFilter === 'in_sis' && student.exists_in_sis) ||
      (lmsStatusFilter === 'not_in_sis' && !student.exists_in_sis);

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations for SIS students
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = students.slice(startIndex, endIndex);

  // Pagination calculations for LMS students
  const lmsTotalPages = Math.ceil(filteredLmsStudents.length / itemsPerPage);
  const lmsStartIndex = (currentPage - 1) * itemsPerPage;
  const lmsEndIndex = lmsStartIndex + itemsPerPage;
  const paginatedLmsStudents = filteredLmsStudents.slice(lmsStartIndex, lmsEndIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, lmsSearchQuery, lmsStatusFilter, itemsPerPage, viewMode]);

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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-sm sm:text-base"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">{t.import[lang]}</span>
          </button>
          <button
            onClick={() => exportToCSV(students, 'students-export')}
            className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t.export[lang]}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm text-sm sm:text-base"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.addStudent[lang]}</span>
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
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {paginatedStudents.map((student) => (
                <div key={student.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {student.profile_picture_url ? (
                        <img
                          src={student.profile_picture_url}
                          alt={student.name_en}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold ${student.profile_picture_url ? 'hidden' : ''}`}>
                        {(student.name_en || student.name_ar || 'S')[0].toUpperCase()}
                      </div>
                    </div>

                    {/* Info */}
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center justify-between gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <p className="font-semibold text-slate-800 truncate">
                          {lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(student.status)}`}>
                          {student.status === 'ACTIVE' ? t.active[lang] :
                           student.status === 'SUSPENDED' ? t.suspended[lang] :
                           student.status === 'GRADUATED' ? t.graduated[lang] :
                           student.status === 'WITHDRAWN' ? t.withdrawn[lang] : student.status}
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 font-mono mb-1" dir="ltr">{student.student_id}</p>
                      <p className="text-xs text-slate-500 truncate mb-2">
                        {student.program ? (lang === 'ar' ? student.program.name_ar : student.program.name_en) : '-'}
                      </p>

                      {/* Actions */}
                      <div className={`flex items-center gap-1 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button
                          onClick={() => handleViewProfile(student)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => showCredentials(student)}
                          className="p-2 hover:bg-amber-100 rounded-lg text-slate-500 hover:text-amber-600 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="p-2 hover:bg-green-100 rounded-lg text-slate-500 hover:text-green-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-purple-100 rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(student)}
                          className="p-2 hover:bg-red-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full table-fixed">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px] ${isRTL ? 'text-end' : 'text-start'}`}>
                      {t.studentId[lang]}
                    </th>
                    <th className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-end' : 'text-start'}`}>
                      {t.name[lang]}
                    </th>
                    <th className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell ${isRTL ? 'text-end' : 'text-start'}`}>
                      {t.email[lang]}
                    </th>
                    <th className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell ${isRTL ? 'text-end' : 'text-start'}`}>
                      {t.program[lang]}
                    </th>
                    <th className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell ${isRTL ? 'text-end' : 'text-start'}`}>
                      {t.academicDegree[lang]}
                    </th>
                    <th className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[90px] ${isRTL ? 'text-end' : 'text-start'}`}>
                      {t.status[lang]}
                    </th>
                    <th className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[140px] ${isRTL ? 'text-end' : 'text-start'}`}>
                      {t.actions[lang]}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3">
                        <span className="font-mono text-blue-600 font-medium text-sm">{student.student_id}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {student.profile_picture_url && (
                            <img
                              src={student.profile_picture_url}
                              alt={student.name_en}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                            />
                          )}
                          <div className={`w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${student.profile_picture_url ? 'hidden' : ''}`}>
                            {(student.name_en || student.name_ar || 'S')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate">
                              {lang === 'ar' ? (student.name_ar || student.name_en) : (student.name_en || student.name_ar)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-sm hidden xl:table-cell">
                        <span className="truncate block">{student.university_email || student.personal_email || '-'}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-sm hidden xl:table-cell">
                        <span className="truncate block">{student.program ? (lang === 'ar' ? student.program.name_ar : student.program.name_en) : '-'}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-sm hidden xl:table-cell">
                        {(() => {
                          const degreeType = student.degree || student.program?.type;
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              degreeType === 'BACHELOR' ? 'bg-blue-100 text-blue-700' :
                              degreeType === 'MASTER' ? 'bg-purple-100 text-purple-700' :
                              degreeType === 'PHD' ? 'bg-amber-100 text-amber-700' :
                              degreeType === 'DIPLOMA' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {degreeType === 'BACHELOR' ? t.bachelor[lang] :
                               degreeType === 'MASTER' ? t.master[lang] :
                               degreeType === 'PHD' ? t.phd[lang] :
                               degreeType === 'DIPLOMA' ? t.diploma[lang] :
                               '-'}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>
                          {student.status === 'ACTIVE' ? t.active[lang] :
                           student.status === 'SUSPENDED' ? t.suspended[lang] :
                           student.status === 'GRADUATED' ? t.graduated[lang] :
                           student.status === 'WITHDRAWN' ? t.withdrawn[lang] : student.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleViewProfile(student)}
                            className="p-1.5 hover:bg-blue-100 rounded text-slate-600 hover:text-blue-600 transition-colors"
                            title={t.viewProfile[lang]}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => showCredentials(student)}
                            className="p-1.5 hover:bg-amber-100 rounded text-slate-600 hover:text-amber-600 transition-colors"
                            title={t.loginCredentials[lang]}
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-1.5 hover:bg-green-100 rounded text-slate-600 hover:text-green-600 transition-colors"
                            title={t.editStudent[lang]}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(student)}
                            className="p-1.5 hover:bg-red-100 rounded text-slate-600 hover:text-red-600 transition-colors"
                            title={t.deleteStudent[lang]}
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
          </>
        )}

        {/* Pagination Controls */}
        {students.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info */}
            <div className="text-sm text-slate-500">
              {t.showing[lang]} {startIndex + 1} {t.to[lang]} {Math.min(endIndex, students.length)} {t.of[lang]} {students.length} {t.entries[lang]}
            </div>

            {/* Per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{t.perPage[lang]}:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.first[lang]}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.previous[lang]}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 text-sm text-slate-600">
                {t.page[lang]} {currentPage} {t.of[lang]} {totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.next[lang]}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.last[lang]}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.college[lang]} *</label>
                  <select
                    name="college_id"
                    value={formData.college_id}
                    onChange={(e) => {
                      setFormData({ ...formData, college_id: e.target.value, program_id: '' });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    required
                  >
                    <option value="">{t.selectCollege[lang]}</option>
                    {colleges.map((college: any) => (
                      <option key={college.id} value={college.id}>
                        {lang === 'ar' ? college.name_ar : college.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.program[lang]} *</label>
                  <select
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    required
                    disabled={!formData.college_id}
                  >
                    <option value="">{t.selectProgram[lang]}</option>
                    {programs
                      .filter((program: any) => formData.college_id && String(program.college_id) === formData.college_id)
                      .map((program: any) => (
                        <option key={program.id} value={program.id}>
                          {lang === 'ar' ? program.name_ar : program.name_en}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.academicDegree[lang]} *</label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    required
                  >
                    <option value="BACHELOR">{t.bachelor[lang]}</option>
                    <option value="MASTER">{t.master[lang]}</option>
                    <option value="PHD">{t.phd[lang]}</option>
                    <option value="DIPLOMA">{t.diploma[lang]}</option>
                  </select>
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
                disabled={saving || !formData.name_en || !formData.national_id || !formData.personal_email || !formData.password || !formData.college_id || !formData.program_id}
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
                {selectedStudent.profile_picture_url ? (
                  <img
                    src={selectedStudent.profile_picture_url}
                    alt={selectedStudent.name_en}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
                    {(selectedStudent.name_en || selectedStudent.name_ar || 'S')[0].toUpperCase()}
                  </div>
                )}
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

            {/* Tabs - Same as Edit Modal */}
            <div className="border-b border-slate-200">
              <div className="flex overflow-x-auto">
                {[
                  { id: 'personal', label: t.personalInfo[lang], icon: User },
                  { id: 'academic', label: t.academicInfo[lang], icon: GraduationCap },
                  { id: 'studyplan', label: t.studyPlan[lang], icon: BookOpen },
                  { id: 'login', label: t.loginCredentials[lang], icon: Key },
                  { id: 'documents', label: t.documents[lang], icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleProfileTabChange(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'documents' && studentDocuments.length > 0 && (
                      <span className="ms-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {studentDocuments.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content - Same fields as Edit Modal */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label={t.nameEn[lang]} value={selectedStudent.name_en} />
                  <InfoRow label={t.nameAr[lang]} value={selectedStudent.name_ar} />
                  <InfoRow label={t.nationalId[lang]} value={selectedStudent.national_id} />
                  <InfoRow label={t.dateOfBirth[lang]} value={selectedStudent.date_of_birth?.split('T')[0]} />
                  <InfoRow label={t.gender[lang]} value={selectedStudent.gender === 'MALE' ? t.male[lang] : t.female[lang]} />
                  <InfoRow label={t.nationality[lang]} value={selectedStudent.nationality} />
                  <InfoRow label={t.phone[lang]} value={selectedStudent.phone} />
                  <InfoRow label={t.personalEmail[lang]} value={selectedStudent.personal_email} />
                  <InfoRow label={t.universityEmail[lang]} value={selectedStudent.university_email} />
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label={t.studentId[lang]} value={selectedStudent.student_id} />
                  <InfoRow label={t.program[lang]} value={selectedStudent.program?.name_en || selectedStudent.program?.name_ar || '-'} />
                  <InfoRow label={t.academicDegree[lang]} value={
                    (() => {
                      const degreeType = selectedStudent.degree || selectedStudent.program?.type;
                      return degreeType === 'BACHELOR' ? t.bachelor[lang] :
                        degreeType === 'MASTER' ? t.master[lang] :
                        degreeType === 'PHD' ? t.phd[lang] :
                        degreeType === 'DIPLOMA' ? t.diploma[lang] :
                        degreeType || '-';
                    })()
                  } />
                  <InfoRow label={t.status[lang]} value={
                    selectedStudent.status === 'ACTIVE' ? (lang === 'ar' ? 'نشط' : 'Active') :
                    selectedStudent.status === 'SUSPENDED' ? (lang === 'ar' ? 'موقوف' : 'Suspended') :
                    selectedStudent.status === 'GRADUATED' ? (lang === 'ar' ? 'متخرج' : 'Graduated') :
                    selectedStudent.status === 'WITHDRAWN' ? (lang === 'ar' ? 'منسحب' : 'Withdrawn') :
                    selectedStudent.status
                  } />
                  <InfoRow label={lang === 'ar' ? 'المستوى' : 'Level'} value={selectedStudent.current_level || selectedStudent.level || 1} />
                  <InfoRow label={lang === 'ar' ? 'نوع القبول' : 'Admission Type'} value={
                    selectedStudent.admission_type === 'DIRECT' ? (lang === 'ar' ? 'مباشر' : 'Direct') :
                    selectedStudent.admission_type === 'TRANSFER' ? (lang === 'ar' ? 'تحويل' : 'Transfer') :
                    selectedStudent.admission_type === 'SCHOLARSHIP' ? (lang === 'ar' ? 'منحة' : 'Scholarship') :
                    selectedStudent.admission_type === 'BRIDGE' ? (lang === 'ar' ? 'تجسير' : 'Bridge') :
                    selectedStudent.admission_type === 'READMISSION' ? (lang === 'ar' ? 'إعادة قبول' : 'Readmission') :
                    selectedStudent.admission_type === 'VISITING' ? (lang === 'ar' ? 'زائر' : 'Visiting') :
                    selectedStudent.admission_type || '-'
                  } />
                  <InfoRow label={lang === 'ar' ? 'الكلية' : 'College'} value={selectedStudent.college || '-'} />
                </div>
              )}

              {activeTab === 'studyplan' && (
                <div>
                  {!selectedStudent.program_id ? (
                    <div className="text-center py-8 text-slate-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>{t.noProgramAssigned[lang]}</p>
                    </div>
                  ) : loadingProgramCourses ? (
                    <div className="text-center py-8 text-slate-500">
                      <Loader2 className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
                      <p>{t.loading[lang]}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Program Info */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-blue-800">
                              {lang === 'ar' ? selectedStudent.program?.name_ar : selectedStudent.program?.name_en}
                            </h3>
                            <p className="text-sm text-blue-600 mt-1">
                              {selectedStudent.program?.code} - {t.totalCredits[lang]}: {selectedStudent.program?.total_credits || programCourses.reduce((sum: number, c: any) => sum + (c.credits || 0), 0)} {t.credits[lang]}
                            </p>
                          </div>
                          {studentEnrollments.length > 0 && (
                            <div className="text-right">
                              <span className="text-xs text-slate-500">{t.currentEnrollments[lang]}</span>
                              <p className="font-bold text-blue-700">{studentEnrollments.filter((e: any) => e.status === 'ENROLLED').length} {lang === 'ar' ? 'مادة' : 'courses'}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Courses by Type */}
                      {(() => {
                        const coursesByType = programCourses.reduce((acc: any, course: any) => {
                          const type = course.type || 'MAJOR';
                          if (!acc[type]) acc[type] = [];
                          acc[type].push(course);
                          return acc;
                        }, {});

                        const typeLabels: any = {
                          'UNIVERSITY': { label: t.universityReq[lang], color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-600' },
                          'COLLEGE': { label: t.collegeReq[lang], color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-600' },
                          'MAJOR': { label: t.majorReq[lang], color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-600' },
                        };

                        // Check if a course is enrolled
                        const isEnrolled = (courseId: number) => studentEnrollments.some((e: any) => e.course_id === courseId && e.status === 'ENROLLED');
                        const isCompleted = (courseId: number) => studentEnrollments.some((e: any) => e.course_id === courseId && e.status === 'COMPLETED');
                        const getEnrollment = (courseId: number) => studentEnrollments.find((e: any) => e.course_id === courseId);

                        return Object.entries(coursesByType).map(([type, courses]: [string, any]) => (
                          <div key={type} className={`bg-white rounded-xl border ${typeLabels[type]?.border || 'border-slate-200'} overflow-hidden`}>
                            <div className={`${typeLabels[type]?.bg || 'bg-slate-50'} px-4 py-3 border-b ${typeLabels[type]?.border || 'border-slate-200'}`}>
                              <h4 className={`font-semibold ${typeLabels[type]?.text || 'text-slate-800'} flex items-center justify-between`}>
                                <span>{typeLabels[type]?.label || type}</span>
                                <span className="text-sm font-normal">
                                  {(courses as any[]).reduce((sum, c) => sum + (c.credits || 0), 0)} {t.credits[lang]} ({(courses as any[]).length} {lang === 'ar' ? 'مادة' : 'courses'})
                                </span>
                              </h4>
                            </div>
                            <div className="divide-y divide-slate-100">
                              {(courses as any[]).map((course: any) => {
                                const enrolled = isEnrolled(course.id);
                                const completed = isCompleted(course.id);
                                const enrollment = getEnrollment(course.id);

                                return (
                                  <div key={course.id} className={`px-4 py-3 hover:bg-slate-50 flex items-center justify-between ${completed ? 'bg-green-50' : enrolled ? 'bg-blue-50' : ''}`}>
                                    <div className="flex items-center gap-4">
                                      <span className={`font-mono text-sm font-semibold w-24 ${typeLabels[type]?.badge || 'bg-slate-100 text-slate-600'} px-2 py-1 rounded`}>{course.code}</span>
                                      <span className="text-slate-800">{lang === 'ar' ? course.name_ar : course.name_en}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {course.semester && (
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                          {t.semester[lang]} {course.semester}
                                        </span>
                                      )}
                                      <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded font-medium">
                                        {course.credits} {lang === 'ar' ? 'س' : 'cr'}
                                      </span>

                                      {/* Enrollment Status/Actions */}
                                      {completed ? (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                          <CheckCircle className="w-3 h-3" />
                                          {t.completed[lang]}
                                        </span>
                                      ) : enrolled ? (
                                        <div className="flex items-center gap-1">
                                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {t.enrolled[lang]}
                                          </span>
                                          <button
                                            onClick={() => enrollment && handleWithdrawEnrollment(enrollment.id)}
                                            className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                                            title={t.withdrawCourse[lang]}
                                          >
                                            <MinusCircle className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => enrollment && handleDropEnrollment(enrollment.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title={t.dropCourse[lang]}
                                          >
                                            <XCircle className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEnrollmentFormData({ ...enrollmentFormData, course_id: course.id.toString() });
                                            setShowAddEnrollmentModal(true);
                                          }}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                          {t.addCourse[lang]}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ));
                      })()}

                      {programCourses.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p>{lang === 'ar' ? 'لا توجد مواد في هذا البرنامج' : 'No courses in this program'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'login' && (
                <div className="space-y-6">
                  {/* Login Credentials Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-600 rounded-xl">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{t.loginCredentials[lang]}</h3>
                        <p className="text-sm text-slate-500">{t.defaultPasswordNote[lang]}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Username */}
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          {t.loginUsername[lang]}
                        </label>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xl font-bold text-blue-600">{selectedStudent.student_id}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedStudent.student_id || '');
                              alert(t.copied[lang]);
                            }}
                            className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1.5 text-sm font-medium transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            {t.copyToClipboard[lang]}
                          </button>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          {t.loginPassword[lang]}
                        </label>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xl font-bold text-purple-600">
                            Vtx@{selectedStudent.national_id || '***'}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`Vtx@${selectedStudent.national_id || ''}`);
                              alert(t.copied[lang]);
                            }}
                            className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 flex items-center gap-1.5 text-sm font-medium transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            {t.copyToClipboard[lang]}
                          </button>
                        </div>
                      </div>

                      {/* University Email */}
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          {t.universityEmail[lang]}
                        </label>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-lg text-slate-700">
                            {selectedStudent.university_email || '-'}
                          </span>
                          {selectedStudent.university_email && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedStudent.university_email || '');
                                alert(t.copied[lang]);
                              }}
                              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 flex items-center gap-1.5 text-sm font-medium transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              {t.copyToClipboard[lang]}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <AlertCircle className="w-4 h-4 inline-block me-1.5" />
                      {lang === 'ar'
                        ? 'ملاحظة: إذا قام الطالب بتغيير كلمة المرور، فلن يتم عرض كلمة المرور الجديدة هنا.'
                        : 'Note: If the student has changed their password, the new password will not be shown here.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  {loadingDocuments ? (
                    <div className="text-center py-8 text-slate-500">
                      <Loader2 className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
                      <p>{lang === 'ar' ? 'جاري تحميل المستندات...' : 'Loading documents...'}</p>
                    </div>
                  ) : studentDocuments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>{lang === 'ar' ? 'لا توجد مستندات' : 'No documents uploaded'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate">{doc.name || doc.title}</p>
                              <p className="text-sm text-slate-500">{getDocumentTypeLabel(doc.type)}</p>
                              {doc.upload_date && (
                                <p className="text-xs text-slate-400 mt-1">
                                  {lang === 'ar' ? 'تاريخ الرفع: ' : 'Uploaded: '}
                                  {new Date(doc.upload_date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              doc.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                              doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {doc.status === 'ACCEPTED' ? (lang === 'ar' ? 'مقبول' : 'Accepted') :
                               doc.status === 'REJECTED' ? (lang === 'ar' ? 'مرفوض' : 'Rejected') :
                               (lang === 'ar' ? 'قيد المراجعة' : 'Under Review')}
                            </span>
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                              title={lang === 'ar' ? 'عرض' : 'View'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                              title={lang === 'ar' ? 'تحميل' : 'Download'}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* Credentials Modal */}
      {showCredentialsModal && credentialsStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{t.loginCredentials[lang]}</h2>
                    <p className="text-white/80 text-sm">
                      {lang === 'ar' ? (credentialsStudent.name_ar || credentialsStudent.name_en) : (credentialsStudent.name_en || credentialsStudent.name_ar)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCredentialsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Student ID / Username */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <label className="block text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
                  {t.loginUsername[lang]}
                </label>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-2xl font-bold text-blue-700">{credentialsStudent.student_id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(credentialsStudent.student_id || '');
                      alert(t.copied[lang]);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {t.copyToClipboard[lang]}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <label className="block text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">
                  {t.loginPassword[lang]}
                </label>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-2xl font-bold text-purple-700">
                    Vtx@{credentialsStudent.national_id || '***'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Vtx@${credentialsStudent.national_id || ''}`);
                      alert(t.copied[lang]);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {t.copyToClipboard[lang]}
                  </button>
                </div>
              </div>

              {/* University Email */}
              {credentialsStudent.university_email && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                    {t.universityEmail[lang]}
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-lg text-slate-700 truncate">{credentialsStudent.university_email}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(credentialsStudent.university_email || '');
                        alert(t.copied[lang]);
                      }}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 text-sm font-medium transition-colors shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      {t.copyToClipboard[lang]}
                    </button>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  <AlertCircle className="w-3.5 h-3.5 inline-block me-1" />
                  {t.defaultPasswordNote[lang]}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium"
              >
                {t.close[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Enrollment Modal */}
      {showAddEnrollmentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.addEnrollment[lang]}</h3>
                    <p className="text-white/80 text-sm">{selectedStudent.name_en || selectedStudent.name_ar}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddEnrollmentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.selectCourse[lang]} *
                </label>
                <select
                  value={enrollmentFormData.course_id}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, course_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">{t.selectCourse[lang]}</option>
                  {availableCourses.map((course: any) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {lang === 'ar' ? (course.name_ar || course.name_en) : (course.name_en || course.name_ar)} ({course.credits} {t.credits[lang]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.selectSemester[lang]} *
                </label>
                <select
                  value={enrollmentFormData.semester_id}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, semester_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">{t.selectSemester[lang]}</option>
                  {semesters.map((sem: any) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name_en || sem.name_ar || `${sem.year} - ${sem.term}`}
                      {sem.is_current && ` (${t.currentSemester[lang]})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.section[lang]}
                </label>
                <input
                  type="text"
                  value={enrollmentFormData.section}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, section: e.target.value })}
                  placeholder="A, B, C..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.enrollmentStatus[lang]}
                </label>
                <select
                  value={enrollmentFormData.status}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="ENROLLED">{t.enrolled[lang]}</option>
                  <option value="COMPLETED">{t.completed[lang]}</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowAddEnrollmentModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleAddEnrollment}
                disabled={savingEnrollment || !enrollmentFormData.course_id || !enrollmentFormData.semester_id}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingEnrollment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t.addEnrollment[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t.deleteStudent[lang]}
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {(studentToDelete.name_en || studentToDelete.name_ar || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg text-slate-800">
                    {lang === 'ar' ? (studentToDelete.name_ar || studentToDelete.name_en) : (studentToDelete.name_en || studentToDelete.name_ar)}
                  </p>
                  <p className="text-slate-500">{studentToDelete.student_id}</p>
                  <p className="text-sm text-slate-400">{studentToDelete.university_email || studentToDelete.personal_email}</p>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 inline-block me-1" />
                  {t.deleteConfirm[lang]}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 disabled:opacity-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? t.deleting[lang] : t.deleteStudent[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal - Responsive */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-600 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t.updateStudent[lang]}</span>
                <span className="sm:hidden">{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info Header - Compact on mobile */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative group">
                  {previewPhoto ? (
                    <img
                      src={previewPhoto}
                      alt={editingStudent.name_en}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                      {(editingStudent.name_en || editingStudent.name_ar || 'S')[0].toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base sm:text-lg text-slate-800 truncate">
                    {lang === 'ar' ? (editingStudent.name_ar || editingStudent.name_en) : (editingStudent.name_en || editingStudent.name_ar)}
                  </p>
                  <p className="text-slate-500 font-mono text-sm">{editingStudent.student_id}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 sm:px-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex gap-1">
                <button
                  onClick={() => setEditActiveTab('personal')}
                  className={`px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    editActiveTab === 'personal'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <User className="w-4 h-4 inline-block me-1.5" />
                  <span className="hidden sm:inline">{t.personalInfo[lang]}</span>
                  <span className="sm:hidden">{lang === 'ar' ? 'البيانات' : 'Info'}</span>
                </button>
                <button
                  onClick={() => setEditActiveTab('academic')}
                  className={`px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    editActiveTab === 'academic'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 inline-block me-1.5" />
                  <span className="hidden sm:inline">{t.academicInfo[lang]}</span>
                  <span className="sm:hidden">{lang === 'ar' ? 'الأكاديمية' : 'Academic'}</span>
                </button>
                <button
                  onClick={() => setEditActiveTab('files')}
                  className={`px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    editActiveTab === 'files'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline-block me-1.5" />
                  <span className="hidden sm:inline">{t.filesAndDocs[lang]}</span>
                  <span className="sm:hidden">{lang === 'ar' ? 'الملفات' : 'Files'}</span>
                  {studentDocuments.length > 0 && (
                    <span className="ms-1.5 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      {studentDocuments.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Personal Info Tab */}
              {editActiveTab === 'personal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.nameEn[lang]}</label>
                    <input
                      type="text"
                      name="name_en"
                      value={editFormData.name_en}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.nameAr[lang]}</label>
                    <input
                      type="text"
                      name="name_ar"
                      value={editFormData.name_ar}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.nationalId[lang]}</label>
                    <input
                      type="text"
                      name="national_id"
                      value={editFormData.national_id}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.dateOfBirth[lang]}</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editFormData.date_of_birth}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.gender[lang]}</label>
                    <select
                      name="gender"
                      value={editFormData.gender}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      <option value="MALE">{t.male[lang]}</option>
                      <option value="FEMALE">{t.female[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.nationality[lang]}</label>
                    <input
                      type="text"
                      name="nationality"
                      value={editFormData.nationality}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.phone[lang]}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.personalEmail[lang]}</label>
                    <input
                      type="email"
                      name="personal_email"
                      value={editFormData.personal_email}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.universityEmail[lang]}</label>
                    <input
                      type="email"
                      name="university_email"
                      value={editFormData.university_email}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.status[lang]}</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      <option value="ACTIVE">{t.active[lang]}</option>
                      <option value="SUSPENDED">{t.suspended[lang]}</option>
                      <option value="GRADUATED">{t.graduated[lang]}</option>
                      <option value="WITHDRAWN">{t.withdrawn[lang]}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.address[lang]}</label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Academic Info Tab */}
              {editActiveTab === 'academic' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{lang === 'ar' ? 'الكلية' : 'College'}</label>
                    <select
                      name="college"
                      value={editFormData.college}
                      onChange={(e) => {
                        const newCollege = e.target.value;
                        setEditFormData(prev => ({
                          ...prev,
                          college: newCollege,
                          program_id: '' // Reset program when college changes
                        }));
                      }}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      <option value="">{lang === 'ar' ? 'اختر الكلية' : 'Select College'}</option>
                      {colleges.map((college: any) => (
                        <option key={college.id} value={college.id}>
                          {lang === 'ar' ? college.name_ar || college.name_en : college.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.program[lang]}</label>
                    <select
                      name="program_id"
                      value={editFormData.program_id}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                      disabled={!editFormData.college}
                    >
                      <option value="">{lang === 'ar' ? 'اختر البرنامج' : 'Select Program'}</option>
                      {programs
                        .filter((program: any) => !editFormData.college || program.college_id === parseInt(editFormData.college))
                        .map((program: any) => (
                          <option key={program.id} value={program.id}>
                            {lang === 'ar' ? program.name_ar || program.name_en : program.name_en}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.academicDegree[lang]}</label>
                    <select
                      name="degree"
                      value={editFormData.degree}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      <option value="BACHELOR">{t.bachelor[lang]}</option>
                      <option value="MASTER">{t.master[lang]}</option>
                      <option value="PHD">{t.phd[lang]}</option>
                      <option value="DIPLOMA">{t.diploma[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{lang === 'ar' ? 'المستوى الحالي' : 'Current Level'}</label>
                    <select
                      name="current_level"
                      value={editFormData.current_level}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
                        <option key={level} value={level}>
                          {lang === 'ar' ? `المستوى ${level}` : `Level ${level}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.status[lang]}</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      <option value="ACTIVE">{t.active[lang]}</option>
                      <option value="SUSPENDED">{t.suspended[lang]}</option>
                      <option value="GRADUATED">{t.graduated[lang]}</option>
                      <option value="WITHDRAWN">{t.withdrawn[lang]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{lang === 'ar' ? 'نوع القبول' : 'Admission Type'}</label>
                    <select
                      name="admission_type"
                      value={editFormData.admission_type}
                      onChange={handleEditInputChange}
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      <option value="DIRECT">{lang === 'ar' ? 'مباشر' : 'Direct'}</option>
                      <option value="TRANSFER">{lang === 'ar' ? 'تحويل' : 'Transfer'}</option>
                      <option value="SCHOLARSHIP">{lang === 'ar' ? 'منحة' : 'Scholarship'}</option>
                      <option value="BRIDGE">{lang === 'ar' ? 'تجسير' : 'Bridge'}</option>
                      <option value="READMISSION">{lang === 'ar' ? 'إعادة قبول' : 'Readmission'}</option>
                      <option value="VISITING">{lang === 'ar' ? 'زائر' : 'Visiting'}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">{t.studentId[lang]}</label>
                    <input
                      type="text"
                      value={editingStudent?.student_id || ''}
                      disabled
                      className="w-full p-2 sm:p-2.5 text-sm border border-slate-300 rounded-lg bg-slate-100 text-slate-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'الرقم الجامعي لا يمكن تغييره' : 'Student ID cannot be changed'}</p>
                  </div>
                </div>
              )}

              {/* Files Tab */}
              {editActiveTab === 'files' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Profile Picture Section */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-green-600" />
                      {t.profilePicture[lang]}
                    </h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative">
                        {previewPhoto ? (
                          <img
                            src={previewPhoto}
                            alt="Profile"
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-200 rounded-xl flex items-center justify-center">
                            <User className="w-10 h-10 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {uploadingPhoto ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {previewPhoto ? t.changePhoto[lang] : t.uploadPhoto[lang]}
                        </button>
                        <p className="text-xs text-slate-500 mt-2">
                          {lang === 'ar' ? 'الحد الأقصى: 5MB - JPG, PNG, GIF, WEBP' : 'Max: 5MB - JPG, PNG, GIF, WEBP'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      {t.documents[lang]}
                    </h4>

                    {/* Upload Form */}
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 mb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">{t.documentType[lang]}</label>
                          <select
                            value={newDocumentType}
                            onChange={(e) => setNewDocumentType(e.target.value)}
                            className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                          >
                            <option value="ID_PASSPORT">{t.nationalIdDoc[lang]}</option>
                            <option value="HIGH_SCHOOL_CERTIFICATE">{t.highSchoolCert[lang]}</option>
                            <option value="PHOTO">{lang === 'ar' ? 'صورة شخصية' : 'Photo'}</option>
                            <option value="OTHER">{t.otherDoc[lang]}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            {t.documentTitle[lang]} <span className="text-slate-400 font-normal">({lang === 'ar' ? 'اختياري' : 'optional'})</span>
                          </label>
                          <input
                            type="text"
                            value={newDocumentTitle}
                            onChange={(e) => setNewDocumentTitle(e.target.value)}
                            placeholder={lang === 'ar' ? 'سيستخدم نوع المستند كعنوان' : 'Will use document type as title'}
                            className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                          />
                        </div>
                        <div className="flex items-end">
                          <input
                            key={fileInputKey}
                            id="document-upload-input"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleDocumentUpload}
                            multiple
                            className="hidden"
                          />
                          <label
                            htmlFor="document-upload-input"
                            className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm cursor-pointer ${uploadingDocument ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {uploadingDocument ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            {uploadingDocument ? t.uploading[lang] : (lang === 'ar' ? 'رفع مستندات' : 'Upload Files')}
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {lang === 'ar'
                          ? 'يمكنك اختيار عدة ملفات دفعة واحدة • الحد الأقصى لكل ملف: 10MB • PDF, DOC, DOCX, JPG, PNG'
                          : 'You can select multiple files at once • Max per file: 10MB • PDF, DOC, DOCX, JPG, PNG'}
                      </p>
                    </div>

                    {/* Documents List */}
                    {loadingDocuments ? (
                      <div className="text-center py-8 text-slate-500">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
                        <p>{lang === 'ar' ? 'جاري تحميل المستندات...' : 'Loading documents...'}</p>
                      </div>
                    ) : studentDocuments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p>{t.noDocuments[lang]}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {studentDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-slate-800 truncate">{doc.name || doc.title}</p>
                                <p className="text-xs text-slate-500">{getDocumentTypeLabel(doc.type)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleViewDocument(doc)}
                                className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                                title={t.viewDoc[lang]}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadDocument(doc)}
                                className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                                title={t.downloadDoc[lang]}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                                title={t.deleteDoc[lang]}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 bg-slate-50 flex-shrink-0">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                disabled={updating}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleUpdateStudent}
                disabled={updating}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {updating ? t.updating[lang] : t.save[lang]}
              </button>
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

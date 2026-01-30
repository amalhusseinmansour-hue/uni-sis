import React, { useState, useEffect } from 'react';
import {
  Clock, Users, MapPin, CheckCircle, BookOpen, Calendar, GraduationCap,
  Loader2, Info, Building, CreditCard, Plus, Trash2, AlertCircle, Search,
  Filter, X, ShoppingCart, Check, Lock, AlertTriangle, RefreshCw, UserSearch,
  FileText, ArrowRight, User
} from 'lucide-react';
import { enrollmentsAPI } from '../api/enrollments';
import { settingsAPI } from '../api/settings';
import { coursesAPI } from '../api/courses';
import { studentsAPI } from '../api/students';
import { UserRole } from '../types';

interface CourseRegistrationProps {
  lang: 'en' | 'ar';
  role?: UserRole;
}

// Translations
const t: Record<string, { en: string; ar: string }> = {
  pageTitle: { en: 'Course Registration', ar: 'تسجيل المقررات' },
  subtitle: { en: 'Register and manage your courses for this semester', ar: 'تسجيل وإدارة مقرراتك لهذا الفصل' },
  credits: { en: 'Credits', ar: 'ساعات' },
  section: { en: 'Section', ar: 'الشعبة' },
  instructor: { en: 'Instructor', ar: 'المدرس' },
  schedule: { en: 'Schedule', ar: 'الجدول' },
  location: { en: 'Location', ar: 'القاعة' },
  loading: { en: 'Loading courses...', ar: 'جاري تحميل المقررات...' },
  myEnrollments: { en: 'My Registered Courses', ar: 'مقرراتي المسجلة' },
  availableCourses: { en: 'Available Courses', ar: 'المقررات المتاحة' },
  currentSemester: { en: 'Current Semester', ar: 'الفصل الحالي' },
  totalCredits: { en: 'Total Credits', ar: 'إجمالي الساعات' },
  registeredCredits: { en: 'Registered Credits', ar: 'الساعات المسجلة' },
  enrolled: { en: 'Enrolled', ar: 'مسجل' },
  noEnrollments: { en: 'No courses registered yet', ar: 'لا توجد مقررات مسجلة بعد' },
  startRegistering: { en: 'Start registering courses from the available list below', ar: 'ابدأ بتسجيل المقررات من القائمة المتاحة أدناه' },
  courseCode: { en: 'Course Code', ar: 'رمز المقرر' },
  courseName: { en: 'Course Name', ar: 'اسم المقرر' },
  status: { en: 'Status', ar: 'الحالة' },
  grade: { en: 'Grade', ar: 'الدرجة' },
  pending: { en: 'In Progress', ar: 'قيد الدراسة' },
  addCourse: { en: 'Add Course', ar: 'إضافة مقرر' },
  dropCourse: { en: 'Drop Course', ar: 'حذف المقرر' },
  register: { en: 'Register', ar: 'تسجيل' },
  drop: { en: 'Drop', ar: 'حذف' },
  confirmDrop: { en: 'Are you sure you want to drop this course?', ar: 'هل أنت متأكد من حذف هذا المقرر؟' },
  registering: { en: 'Registering...', ar: 'جاري التسجيل...' },
  dropping: { en: 'Dropping...', ar: 'جاري الحذف...' },
  registered: { en: 'Registered successfully', ar: 'تم التسجيل بنجاح' },
  dropped: { en: 'Dropped successfully', ar: 'تم الحذف بنجاح' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },
  searchCourses: { en: 'Search courses...', ar: 'البحث عن مقررات...' },
  noAvailableCourses: { en: 'No available courses found', ar: 'لا توجد مقررات متاحة' },
  seats: { en: 'Seats', ar: 'المقاعد' },
  available: { en: 'available', ar: 'متاح' },
  full: { en: 'Full', ar: 'ممتلئ' },
  maxCredits: { en: 'Maximum credits', ar: 'الحد الأقصى للساعات' },
  minCredits: { en: 'Minimum credits', ar: 'الحد الأدنى للساعات' },
  prerequisites: { en: 'Prerequisites', ar: 'المتطلبات السابقة' },
  registrationOpen: { en: 'Registration Open', ar: 'التسجيل مفتوح' },
  registrationClosed: { en: 'Registration Closed', ar: 'التسجيل مغلق' },
  alreadyRegistered: { en: 'Already Registered', ar: 'مسجل مسبقاً' },
  cart: { en: 'Registration Cart', ar: 'سلة التسجيل' },
  addToCart: { en: 'Add to Cart', ar: 'أضف للسلة' },
  removeFromCart: { en: 'Remove', ar: 'إزالة' },
  confirmRegistration: { en: 'Confirm Registration', ar: 'تأكيد التسجيل' },
  emptyCart: { en: 'Your cart is empty', ar: 'السلة فارغة' },
  capacity: { en: 'Capacity', ar: 'السعة' },
  prerequisitesRequired: { en: 'Prerequisites Required', ar: 'متطلبات سابقة مطلوبة' },
  prerequisitesNotMet: { en: 'You must complete the following courses first', ar: 'يجب إكمال المقررات التالية أولاً' },
  checkingEligibility: { en: 'Checking eligibility...', ar: 'جاري التحقق من الأهلية...' },
  eligible: { en: 'Eligible', ar: 'مؤهل' },
  notEligible: { en: 'Not Eligible', ar: 'غير مؤهل' },
  connectionError: { en: 'Connection error. Showing cached data.', ar: 'خطأ في الاتصال. عرض البيانات المخزنة.' },
  retry: { en: 'Retry', ar: 'إعادة المحاولة' },
  noConnection: { en: 'Unable to connect to server', ar: 'تعذر الاتصال بالخادم' },
  usingCachedData: { en: 'Using cached data', ar: 'استخدام البيانات المخزنة' },
  maxCreditsReached: { en: 'Maximum credits limit reached', ar: 'تم الوصول للحد الأقصى من الساعات' },
  minCreditsWarning: { en: 'Minimum credits not met', ar: 'الحد الأدنى من الساعات غير مستوفى' },
  // Staff-specific translations
  staffPageTitle: { en: 'Student Registration Management', ar: 'إدارة تسجيل الطلاب' },
  staffSubtitle: { en: 'Manage course registration for students', ar: 'إدارة تسجيل المقررات للطلاب' },
  searchStudent: { en: 'Search for student...', ar: 'البحث عن طالب...' },
  searchByIdOrName: { en: 'Search by Student ID or Name', ar: 'البحث برقم الطالب أو الاسم' },
  selectStudent: { en: 'Select Student', ar: 'اختر الطالب' },
  selectedStudent: { en: 'Selected Student', ar: 'الطالب المحدد' },
  studentId: { en: 'Student ID', ar: 'رقم الطالب' },
  studentName: { en: 'Student Name', ar: 'اسم الطالب' },
  program: { en: 'Program', ar: 'البرنامج' },
  noStudentSelected: { en: 'No student selected', ar: 'لم يتم اختيار طالب' },
  selectStudentFirst: { en: 'Please search and select a student first', ar: 'يرجى البحث واختيار طالب أولاً' },
  studentEnrollments: { en: 'Student Enrollments', ar: 'تسجيلات الطالب' },
  addCourseForStudent: { en: 'Add Course for Student', ar: 'إضافة مقرر للطالب' },
  dropCourseForStudent: { en: 'Drop Course for Student', ar: 'حذف مقرر للطالب' },
  lateRegistration: { en: 'Late Registration', ar: 'تسجيل متأخر' },
  changeSection: { en: 'Change Section', ar: 'تغيير الشعبة' },
  registrationActions: { en: 'Registration Actions', ar: 'إجراءات التسجيل' },
  noStudentsFound: { en: 'No students found', ar: 'لم يتم العثور على طلاب' },
  searchResults: { en: 'Search Results', ar: 'نتائج البحث' },
  level: { en: 'Level', ar: 'المستوى' },
  college: { en: 'College', ar: 'الكلية' },
  clearSelection: { en: 'Clear Selection', ar: 'إلغاء الاختيار' },
  firstSemester: { en: 'First Semester', ar: 'الفصل الأول' },
  secondSemester: { en: 'Second Semester', ar: 'الفصل الثاني' },
  semesterCourses: { en: 'courses', ar: 'مقررات' },
};

// Helper function to determine semester from course code
// Odd last digit = Semester 1, Even last digit = Semester 2
const getSemesterFromCourseCode = (courseCode: string): 1 | 2 => {
  if (!courseCode) return 1;
  const match = courseCode.match(/(\d)$/);
  if (match) {
    const lastDigit = parseInt(match[1], 10);
    return lastDigit % 2 === 1 ? 1 : 2;
  }
  return 1; // Default to semester 1
};

// Group enrollments by semester
const groupEnrollmentsBySemester = (enrollments: any[]) => {
  const semester1: any[] = [];
  const semester2: any[] = [];

  enrollments.forEach(enrollment => {
    const course = enrollment.course || enrollment;
    const courseCode = course.code || enrollment.course_code || enrollment.code || '';
    const semester = getSemesterFromCourseCode(courseCode);

    if (semester === 1) {
      semester1.push(enrollment);
    } else {
      semester2.push(enrollment);
    }
  });

  return { semester1, semester2 };
};

const CourseRegistration: React.FC<CourseRegistrationProps> = ({ lang, role }) => {
  const isRTL = lang === 'ar';
  // Only staff members (Student Affairs, Admin, Registrar) can register courses for students
  // Students must submit registration requests through Student Affairs
  const isStaff = role === UserRole.STUDENT_AFFAIRS || role === UserRole.ADMIN || role === UserRole.REGISTRAR;
  const isStudent = role === UserRole.STUDENT;
  const [loading, setLoading] = useState(true);

  // Staff-specific states
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [currentSemester, setCurrentSemester] = useState<string>('');
  const [semesterNameAr, setSemesterNameAr] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [registering, setRegistering] = useState(false);
  const [dropping, setDropping] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
  const [isOffline, setIsOffline] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState<string | null>(null);
  const [eligibilityCache, setEligibilityCache] = useState<Record<string, { eligible: boolean; missingPrerequisites?: string[] }>>({});
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [selectedCoursePrerequisites, setSelectedCoursePrerequisites] = useState<{ course: any; prerequisites: string[] } | null>(null);
  const [maxCredits] = useState(21); // Maximum credits per semester
  const [minCredits] = useState(12); // Minimum credits per semester

  // Fetch data
  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setIsOffline(false);

    try {
      const [enrollmentsData, semesterData, coursesData] = await Promise.all([
        enrollmentsAPI.getMyEnrollments().catch(() => null),
        settingsAPI.getCurrentSemester().catch(() => null),
        enrollmentsAPI.getAvailableSections().catch(() =>
          coursesAPI.getAll().catch(() => null)
        ),
      ]);

      // Check if we got any data from API
      const hasApiData = enrollmentsData !== null || coursesData !== null;

      if (!hasApiData) {
        setIsOffline(true);
        setMessage({ type: 'warning', text: t.connectionError[lang] });
      }

      const enrollmentsList = enrollmentsData?.data || enrollmentsData || [];
      setEnrollments(enrollmentsList);

      // Get available courses that student is not already enrolled in
      const enrolledCourseIds = enrollmentsList.map((e: any) =>
        e.course_id || e.course?.id || e.id
      );

      let coursesList = coursesData?.data || coursesData || [];
      // Filter out already enrolled courses
      coursesList = coursesList.filter((c: any) =>
        !enrolledCourseIds.includes(c.id) && !enrolledCourseIds.includes(c.course_id)
      );
      setAvailableCourses(coursesList);

      if (semesterData) {
        setCurrentSemester(semesterData.name_en || semesterData.name || '');
        setSemesterNameAr(semesterData.name_ar || semesterData.name || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsOffline(true);
      setMessage({ type: 'error', text: t.noConnection[lang] });
      setEnrollments([]);
      setAvailableCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only auto-fetch for students, staff needs to select a student first
    if (!isStaff) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [lang, isStaff]);

  // Staff: Search for students
  const searchStudents = async (query: string) => {
    if (!query || query.length < 2) {
      setStudentSearchResults([]);
      return;
    }

    setSearchingStudents(true);
    try {
      const response = await studentsAPI.getAll({ search: query, per_page: 10 });
      const students = response?.data || response || [];
      setStudentSearchResults(students);
    } catch (error) {
      console.error('Error searching students:', error);
      setStudentSearchResults([]);
    } finally {
      setSearchingStudents(false);
    }
  };

  // Staff: Select a student and load their enrollments
  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setStudentSearchResults([]);
    setStudentSearchQuery('');
    setLoading(true);

    try {
      // Fetch enrollments for the selected student
      const [enrollmentsData, semesterData, coursesData] = await Promise.all([
        enrollmentsAPI.getStudentEnrollments(student.id).catch(() => []),
        settingsAPI.getCurrentSemester().catch(() => null),
        enrollmentsAPI.getAvailableSections().catch(() =>
          coursesAPI.getAll().catch(() => [])
        ),
      ]);

      const enrollmentsList = enrollmentsData?.data || enrollmentsData || [];
      setEnrollments(enrollmentsList);

      // Get available courses
      const enrolledCourseIds = enrollmentsList.map((e: any) =>
        e.course_id || e.course?.id || e.id
      );

      let coursesList = coursesData?.data || coursesData || [];
      coursesList = coursesList.filter((c: any) =>
        !enrolledCourseIds.includes(c.id) && !enrolledCourseIds.includes(c.course_id)
      );
      setAvailableCourses(coursesList);

      if (semesterData) {
        setCurrentSemester(semesterData.name_en || semesterData.name || '');
        setSemesterNameAr(semesterData.name_ar || semesterData.name || '');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setMessage({ type: 'error', text: t.error[lang] });
    } finally {
      setLoading(false);
    }
  };

  // Staff: Clear selected student
  const clearSelectedStudent = () => {
    setSelectedStudent(null);
    setEnrollments([]);
    setAvailableCourses([]);
    setCart([]);
  };

  // Debounce student search
  useEffect(() => {
    if (!isStaff) return;
    const timer = setTimeout(() => {
      if (studentSearchQuery) {
        searchStudents(studentSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearchQuery, isStaff]);

  // Check course eligibility (prerequisites)
  const checkCourseEligibility = async (courseId: string): Promise<{ eligible: boolean; missingPrerequisites?: string[] }> => {
    // Check cache first
    if (eligibilityCache[courseId]) {
      return eligibilityCache[courseId];
    }

    setCheckingEligibility(courseId);

    try {
      const result = await coursesAPI.checkEligibility(courseId);
      const eligibility = {
        eligible: result.eligible ?? true,
        missingPrerequisites: result.missing_prerequisites || result.missingPrerequisites || [],
      };

      // Cache the result
      setEligibilityCache(prev => ({ ...prev, [courseId]: eligibility }));
      return eligibility;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      // Default to eligible if API fails (to not block registration)
      return { eligible: true };
    } finally {
      setCheckingEligibility(null);
    }
  };

  // Calculate total credits
  const totalCredits = enrollments.reduce((sum, e) => {
    const credits = e.credits || e.course?.credits || 0;
    return sum + credits;
  }, 0);

  const cartCredits = cart.reduce((sum, c) => {
    return sum + (c.credits || 3);
  }, 0);

  // Add to cart with prerequisites check
  const addToCart = async (course: any) => {
    if (cart.find(c => c.id === course.id)) return;

    // Check if adding this course would exceed max credits
    const courseCredits = course.credits || 3;
    if (totalCredits + cartCredits + courseCredits > maxCredits) {
      setMessage({ type: 'warning', text: t.maxCreditsReached[lang] });
      return;
    }

    // Check prerequisites
    const eligibility = await checkCourseEligibility(course.id);

    if (!eligibility.eligible && eligibility.missingPrerequisites && eligibility.missingPrerequisites.length > 0) {
      // Show prerequisites modal
      setSelectedCoursePrerequisites({
        course,
        prerequisites: eligibility.missingPrerequisites,
      });
      setShowPrerequisiteModal(true);
      return;
    }

    setCart([...cart, course]);
    setMessage({ type: 'success', text: `${lang === 'ar' ? 'تمت إضافة' : 'Added'} ${course.code} ${lang === 'ar' ? 'للسلة' : 'to cart'}` });
  };

  // Remove from cart
  const removeFromCart = (courseId: string) => {
    setCart(cart.filter(c => c.id !== courseId));
  };

  // Check if course is in cart
  const isInCart = (courseId: string) => {
    return cart.some(c => c.id === courseId);
  };

  // Register courses from cart
  const registerCourses = async () => {
    if (cart.length === 0) return;

    setRegistering(true);
    setMessage(null);

    try {
      // Get current semester
      const semesterRes = await settingsAPI.getCurrentSemester().catch(() => null);
      const semesterId = semesterRes?.id || semesterRes?.data?.id;

      // Register each course
      for (const course of cart) {
        if (isStaff && selectedStudent) {
          // Staff registering for a student - use admin endpoint
          await enrollmentsAPI.create({
            student_id: selectedStudent.id,
            course_id: course.id,
            semester_id: semesterId,
            section: course.section || 'A',
            status: 'ENROLLED'
          });
        } else {
          // Student self-registration
          await enrollmentsAPI.enroll(course.section_id || course.id);
        }
      }

      // Refresh enrollments
      let enrollmentsData;
      if (isStaff && selectedStudent) {
        enrollmentsData = await enrollmentsAPI.getStudentEnrollments(selectedStudent.id);
      } else {
        enrollmentsData = await enrollmentsAPI.getMyEnrollments();
      }
      const enrollmentsList = enrollmentsData?.data || enrollmentsData || [];
      setEnrollments(enrollmentsList);

      // Remove registered courses from available list
      const registeredIds = cart.map(c => c.id);
      setAvailableCourses(availableCourses.filter(c => !registeredIds.includes(c.id)));

      // Clear cart
      setCart([]);
      setMessage({ type: 'success', text: t.registered[lang] });
      setActiveTab('enrolled');
    } catch (error: any) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || t.error[lang] });
    } finally {
      setRegistering(false);
    }
  };

  // Drop a course
  const dropCourse = async (enrollmentId: string) => {
    if (!confirm(t.confirmDrop[lang])) return;

    setDropping(enrollmentId);
    setMessage(null);

    try {
      if (isStaff && selectedStudent) {
        // Staff dropping for a student - use admin endpoint
        await enrollmentsAPI.drop(enrollmentId);
      } else {
        // Student self-dropping
        await enrollmentsAPI.dropMyCourse(enrollmentId);
      }

      // Remove from enrollments list
      const droppedEnrollment = enrollments.find(e => e.id === enrollmentId);
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));

      // Add back to available courses if we have the course data
      if (droppedEnrollment?.course) {
        setAvailableCourses([...availableCourses, droppedEnrollment.course]);
      }

      setMessage({ type: 'success', text: t.dropped[lang] });
    } catch (error: any) {
      console.error('Drop error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || t.error[lang] });
    } finally {
      setDropping(null);
    }
  };

  // Filter available courses by search
  const filteredCourses = availableCourses.filter(course => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const code = (course.code || '').toLowerCase();
    const nameEn = (course.name_en || '').toLowerCase();
    const nameAr = (course.name_ar || '').toLowerCase();
    return code.includes(query) || nameEn.includes(query) || nameAr.includes(query);
  });

  // Students can now self-register for courses

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{t.loading[lang]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isStaff ? 'from-emerald-600 via-teal-600 to-cyan-600' : 'from-blue-600 via-indigo-600 to-purple-600'} rounded-2xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                {isStaff ? <UserSearch className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
              </div>
              {isStaff ? t.staffPageTitle[lang] : t.pageTitle[lang]}
            </h1>
            <p className="text-blue-100 mt-1">{isStaff ? t.staffSubtitle[lang] : t.subtitle[lang]}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {(currentSemester || semesterNameAr) && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                <p className="text-xs text-blue-100">{t.currentSemester[lang]}</p>
                <p className="font-semibold">{lang === 'ar' ? semesterNameAr : currentSemester}</p>
              </div>
            )}
            {(selectedStudent || !isStaff) && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                <p className="text-xs text-blue-100">{t.registeredCredits[lang]}</p>
                <p className="font-semibold text-xl">
                  {totalCredits + cartCredits}
                  <span className="text-sm font-normal text-blue-200"> / {maxCredits}</span>
                </p>
                {totalCredits + cartCredits < minCredits && (
                  <p className="text-xs text-amber-300 mt-1">{t.minCreditsWarning[lang]}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff: Student Search Panel */}
      {isStaff && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <UserSearch className="w-5 h-5 text-emerald-600" />
            {t.searchByIdOrName[lang]}
          </h2>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              placeholder={t.searchStudent[lang]}
              className="w-full ps-10 pe-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            {searchingStudents && (
              <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {studentSearchResults.length > 0 && !selectedStudent && (
            <div className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.searchResults[lang]}</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {studentSearchResults.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 text-start">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {lang === 'ar' ? student.full_name_ar || student.full_name_en : student.full_name_en || student.full_name_ar}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {student.student_id} • {student.program?.name_en || student.program?.name_ar || '-'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {studentSearchQuery.length >= 2 && studentSearchResults.length === 0 && !searchingStudents && !selectedStudent && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <UserSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t.noStudentsFound[lang]}</p>
            </div>
          )}

          {/* Selected Student Card */}
          {selectedStudent && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-emerald-800 dark:text-emerald-300">{t.selectedStudent[lang]}</h3>
                <button
                  onClick={clearSelectedStudent}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {t.clearSelection[lang]}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <User className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {lang === 'ar' ? selectedStudent.full_name_ar || selectedStudent.full_name_en : selectedStudent.full_name_en || selectedStudent.full_name_ar}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {selectedStudent.student_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {selectedStudent.program?.name_en || selectedStudent.program?.name_ar || '-'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {t.level[lang]}: {selectedStudent.level || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Student Selected Message */}
          {!selectedStudent && studentSearchQuery.length < 2 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <UserSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">{t.noStudentSelected[lang]}</p>
              <p className="text-sm mt-1">{t.selectStudentFirst[lang]}</p>
            </div>
          )}
        </div>
      )}

      {/* Show course registration only if student is selected (for staff) or always (for students) */}
      {(!isStaff || selectedStudent) && (
        <>
        {/* Connection Warning */}
        {isOffline && (
          <div className="p-4 rounded-xl flex items-center justify-between gap-3 bg-amber-50 text-amber-800 border border-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <span>{t.connectionError[lang]}</span>
            </div>
            <button
              onClick={() => isStaff && selectedStudent ? handleSelectStudent(selectedStudent) : fetchData(false)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t.retry[lang]}
            </button>
          </div>
        )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : message.type === 'warning'
            ? 'bg-amber-50 text-amber-800 border border-amber-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : message.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className={isRTL ? 'me-auto' : 'ms-auto'}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Prerequisites Modal - Only for staff */}
      {isStaff && showPrerequisiteModal && selectedCoursePrerequisites && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t.prerequisitesRequired[lang]}</h3>
                <p className="text-sm text-slate-500">{selectedCoursePrerequisites.course.code}</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4">{t.prerequisitesNotMet[lang]}:</p>

            <ul className="space-y-2 mb-6">
              {selectedCoursePrerequisites.prerequisites.map((prereq, idx) => (
                <li key={idx} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 dark:text-red-300 font-medium">{prereq}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                setShowPrerequisiteModal(false);
                setSelectedCoursePrerequisites(null);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
            >
              {lang === 'ar' ? 'حسناً' : 'OK'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs - Show both tabs only for staff, students see only enrolled courses */}
      {isStaff && (
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'enrolled'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {t.myEnrollments[lang]}
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {enrollments.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'available'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t.availableCourses[lang]}
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                {availableCourses.length}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* Cart (if has items) - Only for staff */}
      {isStaff && cart.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {t.cart[lang]}
              <span className="text-sm font-normal">({cart.length} {lang === 'ar' ? 'مقرر' : 'course(s)'} - {cartCredits} {t.credits[lang]})</span>
            </h3>
            <button
              onClick={registerCourses}
              disabled={registering}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {registering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.registering[lang]}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t.confirmRegistration[lang]}
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cart.map(course => (
              <div key={course.id} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-700">
                <span className="font-mono text-sm font-semibold text-amber-800 dark:text-amber-300">{course.code}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {lang === 'ar' ? course.name_ar : course.name_en}
                </span>
                <button
                  onClick={() => removeFromCart(course.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content - Students always see enrolled, staff sees based on activeTab */}
      {(!isStaff || activeTab === 'enrolled') ? (
        /* Enrolled Courses */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {t.myEnrollments[lang]}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CreditCard className="w-4 h-4" />
              {totalCredits} {t.credits[lang]}
            </div>
          </div>

          {enrollments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{t.noEnrollments[lang]}</p>
              {isStaff ? (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">{t.startRegistering[lang]}</p>
                  <button
                    onClick={() => setActiveTab('available')}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addCourse[lang]}
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  {lang === 'ar' ? 'لم يتم تسجيل أي مقررات لك حتى الآن. يرجى التواصل مع شؤون الطلاب.' : 'No courses have been registered for you yet. Please contact Student Affairs.'}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group enrollments by semester */}
              {(() => {
                const { semester1, semester2 } = groupEnrollmentsBySemester(enrollments);

                const renderEnrollmentCard = (enrollment: any, index: number) => {
                  const course = enrollment.course || enrollment;
                  const courseCode = course.code || enrollment.course_code || enrollment.code;
                  const courseName = lang === 'ar'
                    ? (course.name_ar || enrollment.name_ar || course.name_en || enrollment.name_en)
                    : (course.name_en || enrollment.name_en || course.name_ar || enrollment.name_ar);
                  const credits = course.credits || enrollment.credits || 3;
                  const instructor = course.instructor || enrollment.instructor || course.instructor_name || '';
                  const schedule = course.schedule || enrollment.schedule || '';
                  const location = course.location || enrollment.location || course.room || '';
                  const section = course.section || enrollment.section || 'A';
                  const grade = enrollment.grade || enrollment.final_grade;

                  return (
                    <div
                      key={enrollment.id || index}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {courseCode?.slice(0, 2) || 'CS'}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-mono rounded font-semibold">
                                {courseCode}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">
                                {t.section[lang]} {section}
                              </span>
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded">
                                {credits} {t.credits[lang]}
                              </span>
                            </div>

                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
                              {courseName}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                              {instructor && (
                                <span className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  {instructor}
                                </span>
                              )}
                              {schedule && (
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  {schedule}
                                </span>
                              )}
                              {location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  {location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {grade ? (
                            <div className="text-center">
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.grade[lang]}</p>
                              <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-bold rounded-lg">
                                {grade}
                              </span>
                            </div>
                          ) : (
                            <>
                              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-lg">
                                <CheckCircle className="w-4 h-4" />
                                {t.pending[lang]}
                              </span>
                              {/* Drop button only for staff */}
                              {isStaff && (
                                <button
                                  onClick={() => dropCourse(enrollment.id)}
                                  disabled={dropping === enrollment.id}
                                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {dropping === enrollment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                  {t.drop[lang]}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                };

                const semester1Credits = semester1.reduce((sum, e) => sum + (e.credits || e.course?.credits || 3), 0);
                const semester2Credits = semester2.reduce((sum, e) => sum + (e.credits || e.course?.credits || 3), 0);

                return (
                  <>
                    {/* First Semester Courses */}
                    {semester1.length > 0 && (
                      <div className="border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                            {t.firstSemester[lang]}
                          </h3>
                          <span className="bg-white/20 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm self-start sm:self-auto">
                            {semester1.length} {t.semesterCourses[lang]} • {semester1Credits} {t.credits[lang]}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                          {semester1.map((enrollment, index) => renderEnrollmentCard(enrollment, index))}
                        </div>
                      </div>
                    )}

                    {/* Second Semester Courses */}
                    {semester2.length > 0 && (
                      <div className="border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                            {t.secondSemester[lang]}
                          </h3>
                          <span className="bg-white/20 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm self-start sm:self-auto">
                            {semester2.length} {t.semesterCourses[lang]} • {semester2Credits} {t.credits[lang]}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                          {semester2.map((enrollment, index) => renderEnrollmentCard(enrollment, index))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {enrollments.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {lang === 'ar' ? `إجمالي المقررات: ${enrollments.length} مقرر` : `Total Courses: ${enrollments.length} courses`}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t.totalCredits[lang]}: {totalCredits} {t.credits[lang]}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Available Courses */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                {t.availableCourses[lang]}
              </h2>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.searchCourses[lang]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 ps-10 pe-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{t.noAvailableCourses[lang]}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredCourses.map((course, index) => {
                const courseCode = course.code;
                const courseName = lang === 'ar' ? (course.name_ar || course.name_en) : (course.name_en || course.name_ar);
                const credits = course.credits || 3;
                const instructor = course.instructor || course.instructor_name || '';
                const schedule = course.schedule || '';
                const location = course.location || course.room || '';
                const capacity = course.capacity || 30;
                const enrolled = course.enrolled || course.students_count || 0;
                const availableSeats = capacity - enrolled;
                const isFull = availableSeats <= 0;
                const inCart = isInCart(course.id);

                return (
                  <div
                    key={course.id || index}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isFull ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                          isFull
                            ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                            : 'bg-gradient-to-br from-green-500 to-emerald-600'
                        }`}>
                          {courseCode?.slice(0, 2) || 'CS'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-mono rounded font-semibold">
                              {courseCode}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded">
                              {credits} {t.credits[lang]}
                            </span>
                            {isFull ? (
                              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs rounded">
                                {t.full[lang]}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded">
                                {availableSeats} {t.available[lang]}
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
                            {courseName}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                            {instructor && (
                              <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-slate-400" />
                                {instructor}
                              </span>
                            )}
                            {schedule && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {schedule}
                              </span>
                            )}
                            {location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {location}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-slate-400" />
                              {enrolled}/{capacity} {t.seats[lang]}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {inCart ? (
                          <button
                            onClick={() => removeFromCart(course.id)}
                            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            {t.removeFromCart[lang]}
                          </button>
                        ) : checkingEligibility === course.id ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-slate-200 text-slate-500 rounded-lg font-medium flex items-center gap-2 cursor-wait"
                          >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.checkingEligibility[lang]}
                          </button>
                        ) : eligibilityCache[course.id]?.eligible === false ? (
                          <button
                            onClick={() => {
                              setSelectedCoursePrerequisites({
                                course,
                                prerequisites: eligibilityCache[course.id].missingPrerequisites || [],
                              });
                              setShowPrerequisiteModal(true);
                            }}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium flex items-center gap-2"
                          >
                            <Lock className="w-4 h-4" />
                            {t.prerequisitesRequired[lang]}
                          </button>
                        ) : (
                          <button
                            onClick={() => addToCart(course)}
                            disabled={isFull}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex items-center gap-2 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                            {t.addToCart[lang]}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default CourseRegistration;

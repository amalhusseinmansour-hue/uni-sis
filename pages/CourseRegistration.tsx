import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, X, ClipboardList, Plus, Minus, Clock, Users, MapPin,
  CheckCircle, AlertCircle, BookOpen, Calendar, GraduationCap, ChevronDown,
  ChevronUp, Trash2, ArrowRight, Info, AlertTriangle, Loader2, Check
} from 'lucide-react';
import { enrollmentsAPI } from '../api/enrollments';
import { coursesAPI } from '../api/courses';
import { studentsAPI } from '../api/students';
import { settingsAPI } from '../api/settings';

interface CourseRegistrationProps {
  lang: 'en' | 'ar';
}

// Translations
const t: Record<string, { en: string; ar: string }> = {
  pageTitle: { en: 'Course Registration', ar: 'تسجيل المساقات' },
  subtitle: { en: 'Register for your courses this semester', ar: 'سجّل في مساقاتك لهذا الفصل' },
  searchPlaceholder: { en: 'Search courses...', ar: 'ابحث عن المساقات...' },
  availableCourses: { en: 'Available Courses', ar: 'المساقات المتاحة' },
  myCart: { en: 'Selected Courses', ar: 'المقررات المختارة' },
  myEnrollments: { en: 'My Enrollments', ar: 'تسجيلاتي' },
  credits: { en: 'Credits', ar: 'ساعات' },
  section: { en: 'Section', ar: 'الشعبة' },
  instructor: { en: 'Instructor', ar: 'المدرس' },
  schedule: { en: 'Schedule', ar: 'الجدول' },
  location: { en: 'Location', ar: 'القاعة' },
  capacity: { en: 'Capacity', ar: 'السعة' },
  seats: { en: 'seats available', ar: 'مقعد متاح' },
  addToCart: { en: 'Select', ar: 'اختيار' },
  removeFromCart: { en: 'Remove', ar: 'إزالة' },
  registerAll: { en: 'Confirm Registration', ar: 'تأكيد التسجيل' },
  clearCart: { en: 'Clear All', ar: 'مسح الكل' },
  totalCredits: { en: 'Total Credits', ar: 'إجمالي الساعات' },
  maxCredits: { en: 'Max Credits', ar: 'الحد الأقصى' },
  currentCredits: { en: 'Current Credits', ar: 'الساعات الحالية' },
  prerequisite: { en: 'Prerequisite', ar: 'المتطلب السابق' },
  prerequisites: { en: 'Prerequisites', ar: 'المتطلبات السابقة' },
  noPrerequisites: { en: 'No prerequisites', ar: 'لا يوجد متطلبات' },
  filters: { en: 'Filters', ar: 'الفلاتر' },
  department: { en: 'Department', ar: 'القسم' },
  allDepartments: { en: 'All Departments', ar: 'جميع الأقسام' },
  allInstructors: { en: 'All Instructors', ar: 'جميع المدرسين' },
  allTimes: { en: 'All Times', ar: 'جميع الأوقات' },
  morning: { en: 'Morning', ar: 'صباحي' },
  afternoon: { en: 'Afternoon', ar: 'مسائي' },
  clearFilters: { en: 'Clear Filters', ar: 'مسح الفلاتر' },
  loading: { en: 'Loading courses...', ar: 'جاري تحميل المساقات...' },
  noCourses: { en: 'No courses found', ar: 'لا توجد مساقات' },
  emptyCart: { en: 'No courses selected', ar: 'لم يتم اختيار مقررات' },
  addCourses: { en: 'Select courses to register', ar: 'اختر مقررات للتسجيل' },
  registrationSuccess: { en: 'Registration successful!', ar: 'تم التسجيل بنجاح!' },
  registrationError: { en: 'Registration failed', ar: 'فشل التسجيل' },
  conflictWarning: { en: 'Time conflict detected', ar: 'تعارض في الوقت' },
  alreadyEnrolled: { en: 'Already enrolled', ar: 'مسجل مسبقاً' },
  courseFull: { en: 'Course is full', ar: 'المساق ممتلئ' },
  prerequisiteNotMet: { en: 'Prerequisites not met', ar: 'المتطلبات غير مستوفاة' },
  registrationPeriod: { en: 'Registration Period', ar: 'فترة التسجيل' },
  currentSemester: { en: 'Current Semester', ar: 'الفصل الحالي' },
  confirming: { en: 'Confirming...', ar: 'جاري التأكيد...' },
  yes: { en: 'Yes', ar: 'نعم' },
  no: { en: 'No', ar: 'لا' },
  courseDetails: { en: 'Course Details', ar: 'تفاصيل المساق' },
  description: { en: 'Description', ar: 'الوصف' },
};

// Default mock data
const defaultCourses = [
  { id: '1', code: 'CS201', name_en: 'Data Structures', name_ar: 'هياكل البيانات', credits: 3, section: 'A', instructor: 'Dr. Ahmed Ali', schedule: 'Sun, Tue 10:00-11:30', location: 'Building A, Room 101', capacity: 35, enrolled: 28, prerequisites: ['CS101'], department: 'Computer Science' },
  { id: '2', code: 'CS202', name_en: 'Database Systems', name_ar: 'قواعد البيانات', credits: 3, section: 'A', instructor: 'Dr. Sarah Hassan', schedule: 'Mon, Wed 14:00-15:30', location: 'Building B, Room 205', capacity: 30, enrolled: 25, prerequisites: ['CS101'], department: 'Computer Science' },
  { id: '3', code: 'MATH301', name_en: 'Linear Algebra', name_ar: 'الجبر الخطي', credits: 3, section: 'B', instructor: 'Dr. Mohammed Nasser', schedule: 'Sun, Tue 08:00-09:30', location: 'Building C, Room 102', capacity: 40, enrolled: 35, prerequisites: ['MATH201'], department: 'Mathematics' },
  { id: '4', code: 'CS301', name_en: 'Algorithms', name_ar: 'الخوارزميات', credits: 3, section: 'A', instructor: 'Dr. Fatima Al-Zahra', schedule: 'Mon, Wed 10:00-11:30', location: 'Building A, Room 203', capacity: 30, enrolled: 22, prerequisites: ['CS201'], department: 'Computer Science' },
  { id: '5', code: 'ENG201', name_en: 'Technical Writing', name_ar: 'الكتابة التقنية', credits: 2, section: 'A', instructor: 'Dr. Layla Ibrahim', schedule: 'Thu 12:00-14:00', location: 'Building D, Room 101', capacity: 25, enrolled: 18, prerequisites: [], department: 'English' },
  { id: '6', code: 'CS303', name_en: 'Computer Networks', name_ar: 'شبكات الحاسب', credits: 3, section: 'A', instructor: 'Dr. Khaled Omar', schedule: 'Sun, Tue 14:00-15:30', location: 'Building A, Room 305', capacity: 30, enrolled: 30, prerequisites: ['CS201'], department: 'Computer Science' },
];

const defaultEnrollments = [
  { id: 'e1', code: 'CS101', name_en: 'Introduction to Programming', name_ar: 'مقدمة في البرمجة', credits: 3, section: 'A', instructor: 'Dr. Ali Hassan', schedule: 'Sun, Tue 12:00-13:30', status: 'ENROLLED' },
];

const CourseRegistration: React.FC<CourseRegistrationProps> = ({ lang }) => {
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    instructor: '',
    time: '',
    credits: '',
  });
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentSemester, setCurrentSemester] = useState<string>('Fall 2024');
  const [maxCredits] = useState(18);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch available courses
        const [coursesData, enrollmentsData, semesterData] = await Promise.all([
          coursesAPI.getAvailableSections().catch(() => []),
          enrollmentsAPI.getMyEnrollments().catch(() => []),
          settingsAPI.getCurrentSemester().catch(() => null),
        ]);

        setCourses(coursesData?.data || coursesData?.length > 0 ? coursesData : defaultCourses);
        setEnrollments(enrollmentsData?.data || enrollmentsData?.length > 0 ? enrollmentsData : defaultEnrollments);
        if (semesterData?.name) {
          setCurrentSemester(lang === 'ar' ? semesterData.name_ar : semesterData.name);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCourses(defaultCourses);
        setEnrollments(defaultEnrollments);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang]);

  // Get unique values for filters
  const departments = useMemo(() => [...new Set(courses.map(c => c.department || 'Other'))], [courses]);
  const instructors = useMemo(() => [...new Set(courses.map(c => c.instructor))], [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        course.code?.toLowerCase().includes(searchLower) ||
        course.name_en?.toLowerCase().includes(searchLower) ||
        course.name_ar?.includes(searchQuery) ||
        course.instructor?.toLowerCase().includes(searchLower);

      const matchesDepartment = !filters.department || course.department === filters.department;
      const matchesInstructor = !filters.instructor || course.instructor === filters.instructor;
      const matchesCredits = !filters.credits || course.credits === parseInt(filters.credits);

      return matchesSearch && matchesDepartment && matchesInstructor && matchesCredits;
    });
  }, [courses, searchQuery, filters]);

  // Calculate credits
  const currentEnrolledCredits = enrollments.reduce((sum, e) => sum + (e.credits || 0), 0);
  const cartCredits = cart.reduce((sum, c) => sum + (c.credits || 0), 0);
  const totalCredits = currentEnrolledCredits + cartCredits;

  // Check if course is in cart
  const isInCart = (courseId: string) => cart.some(c => c.id === courseId);

  // Check if already enrolled
  const isEnrolled = (courseCode: string) => enrollments.some(e => e.code === courseCode);

  // Check if course is full
  const isFull = (course: any) => (course.enrolled || 0) >= (course.capacity || 30);

  // Add to cart
  const addToCart = (course: any) => {
    if (!isInCart(course.id) && !isEnrolled(course.code) && !isFull(course)) {
      setCart([...cart, course]);
    }
  };

  // Remove from cart
  const removeFromCart = (courseId: string) => {
    setCart(cart.filter(c => c.id !== courseId));
  };

  // Clear cart
  const clearCart = () => setCart([]);

  // Register all courses in cart
  const registerAll = async () => {
    if (cart.length === 0) return;

    setRegistering(true);
    setMessage(null);

    try {
      for (const course of cart) {
        await enrollmentsAPI.enroll(course.id);
      }

      // Refresh enrollments
      const newEnrollments = await enrollmentsAPI.getMyEnrollments();
      setEnrollments(newEnrollments?.data || newEnrollments || [...enrollments, ...cart]);
      setCart([]);
      setMessage({ type: 'success', text: t.registrationSuccess[lang] });
    } catch (error: any) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: error.message || t.registrationError[lang] });
    } finally {
      setRegistering(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ department: '', instructor: '', time: '', credits: '' });
    setSearchQuery('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">{t.loading[lang]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              {t.pageTitle[lang]}
            </h1>
            <p className="text-blue-100 mt-1">{t.subtitle[lang]}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <p className="text-xs text-blue-100">{t.currentSemester[lang]}</p>
              <p className="font-semibold">{currentSemester}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <p className="text-xs text-blue-100">{t.currentCredits[lang]}</p>
              <p className="font-semibold">{totalCredits} / {maxCredits}</p>
              <div className="mt-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${totalCredits > maxCredits ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${Math.min((totalCredits / maxCredits) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className={`${isRTL ? 'mr-auto' : 'ml-auto'} hover:opacity-70 transition-opacity`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder[lang]}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  showFilters
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                {t.filters[lang]}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in slide-in-from-top duration-200">
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.allDepartments[lang]}</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  value={filters.instructor}
                  onChange={(e) => setFilters({ ...filters, instructor: e.target.value })}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.allInstructors[lang]}</option>
                  {instructors.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
                <select
                  value={filters.credits}
                  onChange={(e) => setFilters({ ...filters, credits: e.target.value })}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.credits[lang]}: All</option>
                  <option value="2">2 {t.credits[lang]}</option>
                  <option value="3">3 {t.credits[lang]}</option>
                  <option value="4">4 {t.credits[lang]}</option>
                </select>
                {(filters.department || filters.instructor || filters.credits || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t.clearFilters[lang]}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Courses */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {t.availableCourses[lang]}
                <span className="text-sm text-slate-500 dark:text-slate-400">({filteredCourses.length})</span>
              </h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredCourses.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t.noCourses[lang]}</p>
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const enrolled = isEnrolled(course.code);
                  const inCart = isInCart(course.id);
                  const full = isFull(course);
                  const expanded = expandedCourse === course.id;

                  return (
                    <div key={course.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-mono rounded">
                              {course.code}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">
                              {t.section[lang]} {course.section}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded">
                              {course.credits} {t.credits[lang]}
                            </span>
                            {full && (
                              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs rounded">
                                {t.courseFull[lang]}
                              </span>
                            )}
                            {enrolled && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {t.alreadyEnrolled[lang]}
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mt-2">
                            {lang === 'ar' ? course.name_ar : course.name_en}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {course.instructor}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.schedule}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {course.location}
                            </span>
                          </div>

                          {/* Capacity bar */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <span>{course.enrolled || 0} / {course.capacity}</span>
                              <span>{(course.capacity || 30) - (course.enrolled || 0)} {t.seats[lang]}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${full ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(((course.enrolled || 0) / (course.capacity || 30)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Expandable details */}
                          {expanded && (
                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-in slide-in-from-top duration-200">
                              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{t.prerequisites[lang]}</h4>
                              {course.prerequisites?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {course.prerequisites.map((prereq: string) => (
                                    <span key={prereq} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs rounded">
                                      {prereq}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t.noPrerequisites[lang]}</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => setExpandedCourse(expanded ? null : course.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {!enrolled && !inCart && !full && (
                            <button
                              onClick={() => addToCart(course)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all hover:scale-105"
                            >
                              <Plus className="w-4 h-4" />
                              {t.addToCart[lang]}
                            </button>
                          )}

                          {inCart && (
                            <button
                              onClick={() => removeFromCart(course.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                            >
                              <Minus className="w-4 h-4" />
                              {t.removeFromCart[lang]}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-4">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                {t.myCart[lang]}
                {cart.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full animate-in zoom-in duration-200">
                    {cart.length}
                  </span>
                )}
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  {t.clearCart[lang]}
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t.emptyCart[lang]}</p>
                <p className="text-xs mt-1">{t.addCourses[lang]}</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                  {cart.map((course) => (
                    <div key={course.id} className="p-3 flex items-center justify-between gap-2 animate-in slide-in-from-right duration-200">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {course.code} - {lang === 'ar' ? course.name_ar : course.name_en}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{course.credits} {t.credits[lang]}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(course.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{t.totalCredits[lang]}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{cartCredits}</span>
                  </div>

                  {totalCredits > maxCredits && (
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-lg flex items-center gap-2 animate-in shake duration-300">
                      <AlertTriangle className="w-4 h-4" />
                      {lang === 'ar' ? 'تجاوزت الحد الأقصى للساعات' : 'Exceeded maximum credits'}
                    </div>
                  )}

                  <button
                    onClick={registerAll}
                    disabled={registering || totalCredits > maxCredits}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {registering ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.confirming[lang]}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t.registerAll[lang]}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Current Enrollments */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                {t.myEnrollments[lang]}
                <span className="text-xs text-slate-500 dark:text-slate-400">({currentEnrolledCredits} {t.credits[lang]})</span>
              </h2>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{lang === 'ar' ? 'لا توجد تسجيلات' : 'No enrollments yet'}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[250px] overflow-y-auto">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {enrollment.code}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {lang === 'ar' ? enrollment.name_ar : enrollment.name_en}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {enrollment.schedule}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded">
                        {lang === 'ar' ? 'مسجل' : 'Enrolled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistration;

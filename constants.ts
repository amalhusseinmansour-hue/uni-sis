
import { UserRole, Student, Grade, Course, FinancialRecord, Announcement, Translation, AdmissionApplication, EnrolledStudent, ServiceRequest } from './types';

export const MOCK_STUDENT: Student = {
  // Base User Info
  id: 'u1',
  name: 'Ahmed Al-Mansour',
  email: 'ahmed.m@university.edu',
  role: UserRole.STUDENT,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',

  // Student Card Info
  studentId: '20231045',
  nameAr: 'أحمد المنصور',
  nameEn: 'Ahmed Al-Mansour',
  status: 'ACTIVE',
  programType: 'BACHELOR',

  // Personal Data
  nationalId: '1098765432',
  passportNumber: 'A12345678',
  dateOfBirth: '2001-05-15',
  placeOfBirth: {
    city: 'Riyadh',
    country: 'Saudi Arabia'
  },
  gender: 'MALE',
  nationality: 'Saudi',
  maritalStatus: 'SINGLE',
  admissionDate: '2023-09-01',

  // Contact Information
  phone: '+966 55 123 4567',
  alternativePhone: '+966 50 987 6543',
  personalEmail: 'ahmed.personal@gmail.com',
  universityEmail: 'ahmed.m@university.edu',
  address: {
    country: 'Saudi Arabia',
    city: 'Riyadh',
    street: 'King Fahd Road, Building 45, Apt 12',
    postalCode: '12345'
  },

  // Guardian & Emergency
  guardian: {
    name: 'Mohammed Al-Mansour',
    relationship: 'FATHER',
    phone: '+966 55 111 2222',
    email: 'mohammed.mansour@email.com',
    address: 'Riyadh, King Abdullah District'
  },
  emergencyContact: {
    name: 'Khalid Al-Mansour',
    phone: '+966 55 333 4444',
    relationship: 'BROTHER'
  },

  // Academic Information
  college: 'College of Computer Science',
  department: 'Computer Science',
  major: 'Computer Science',
  degree: 'BSc',
  studyPlanCode: 'CS-2023-01',
  studyPlanName: 'Computer Science Plan 2023',
  cohort: '2023',
  level: 3,
  currentSemester: 'Spring 2024',
  academicStatus: 'REGULAR',
  advisor: {
    name: 'Dr. Sarah Smith',
    email: 'sarah.smith@university.edu',
    department: 'Computer Science'
  },

  // Academic Summary
  totalRequiredCredits: 130,
  completedCredits: 45,
  registeredCredits: 15,
  remainingCredits: 70,
  termGpa: 3.70,
  gpa: 3.55,

  // Financial Summary
  totalFees: 15000,
  paidAmount: 14550,
  currentBalance: -450,
  previousBalance: 0,
  scholarships: 2000,
  financialStatus: 'CLEARED',

  // Systems & Accounts
  sisUsername: 'ahmed.m',
  accountStatus: 'ACTIVE',
  lastLogin: '2024-02-15 10:30:00',

  // Documents
  documents: [
    {
      id: 'doc1',
      type: 'HIGH_SCHOOL_CERTIFICATE',
      name: 'High School Certificate',
      uploadDate: '2023-08-15',
      status: 'ACCEPTED'
    },
    {
      id: 'doc2',
      type: 'ID_PASSPORT',
      name: 'National ID Copy',
      uploadDate: '2023-08-15',
      status: 'ACCEPTED'
    },
    {
      id: 'doc3',
      type: 'PHOTO',
      name: 'Personal Photo',
      uploadDate: '2023-08-15',
      status: 'ACCEPTED'
    }
  ]
};

export const MOCK_GRADES: Grade[] = [
  { code: 'ENG101', title: 'English I', grade: 'A', points: 4.0, credits: 3, semester: 'Fall 2022', midterm: 36, coursework: 18, final: 38 },
  { code: 'MATH101', title: 'Calculus I', grade: 'B+', points: 3.30, credits: 4, semester: 'Fall 2022', midterm: 32, coursework: 17, final: 35 },
  { code: 'CS100', title: 'Intro to Programming', grade: 'A-', points: 3.70, credits: 3, semester: 'Spring 2023', midterm: 35, coursework: 18, final: 36 },
  { code: 'HIST100', title: 'World History', grade: 'B', points: 3.0, credits: 3, semester: 'Spring 2023', midterm: 30, coursework: 15, final: 32 },
];

// Vertex University Grading Scale for Bachelor's Program
export const VERTEX_GRADE_SCALE = {
  'A':  { points: 4.00, minPercent: 95, maxPercent: 100, label: { en: 'Excellent', ar: 'ممتاز' } },
  'A-': { points: 3.70, minPercent: 90, maxPercent: 94.99, label: { en: 'Excellent', ar: 'ممتاز' } },
  'B+': { points: 3.30, minPercent: 85, maxPercent: 89.99, label: { en: 'Very Good (High)', ar: 'جيد جدًا مرتفع' } },
  'B':  { points: 3.00, minPercent: 80, maxPercent: 84.99, label: { en: 'Very Good', ar: 'جيد جدًا' } },
  'C+': { points: 2.30, minPercent: 75, maxPercent: 79.99, label: { en: 'Good (High)', ar: 'جيد مرتفع' } },
  'C':  { points: 2.00, minPercent: 70, maxPercent: 74.99, label: { en: 'Good', ar: 'جيد' } },
  'D+': { points: 1.30, minPercent: 65, maxPercent: 69.99, label: { en: 'Acceptable (High)', ar: 'مقبول مرتفع' } },
  'D':  { points: 1.00, minPercent: 60, maxPercent: 64.99, label: { en: 'Acceptable', ar: 'مقبول' } },
  'F':  { points: 0.00, minPercent: 0, maxPercent: 59.99, label: { en: 'Fail', ar: 'راسب' } },
  'FA': { points: 0.00, minPercent: 0, maxPercent: 0, label: { en: 'Fail (Absence)', ar: 'راسب بسبب الغياب' } },
  'I':  { points: null, minPercent: null, maxPercent: null, label: { en: 'Incomplete', ar: 'غير مكتمل' }, excluded: true },
  'P':  { points: null, minPercent: 60, maxPercent: 100, label: { en: 'Pass', ar: 'ناجح فقط' }, excluded: true },
  'NP': { points: null, minPercent: 0, maxPercent: 59.99, label: { en: 'No Pass', ar: 'راسب فقط' }, excluded: true },
  'CC': { points: null, minPercent: null, maxPercent: null, label: { en: 'Continuing', ar: 'مستمر' }, excluded: true },
  'CX': { points: null, minPercent: null, maxPercent: null, label: { en: 'Challenge Exam Pass', ar: 'نجاح عبر اختبار تحدي' }, excluded: true },
  'S':  { points: null, minPercent: null, maxPercent: null, label: { en: 'Satisfactory', ar: 'مرض' }, excluded: true },
  'AW': { points: null, minPercent: null, maxPercent: null, label: { en: 'Administrative Withdrawal', ar: 'منسحب إداريًا' }, excluded: true },
  'W':  { points: null, minPercent: null, maxPercent: null, label: { en: 'Withdrawn', ar: 'منسحب' }, excluded: true },
};

// Helper function to convert letter grade to GPA points
export const gradeToPoints = (grade: string): number => {
  const gradeInfo = VERTEX_GRADE_SCALE[grade as keyof typeof VERTEX_GRADE_SCALE];
  return gradeInfo?.points ?? 0;
};

// Helper function to check if grade is excluded from GPA calculation
export const isGradeExcluded = (grade: string): boolean => {
  const gradeInfo = VERTEX_GRADE_SCALE[grade as keyof typeof VERTEX_GRADE_SCALE];
  return gradeInfo?.excluded === true || gradeInfo?.points === null;
};

// Helper function to convert percentage to letter grade
export const percentToGrade = (percent: number): string => {
  if (percent >= 95) return 'A';
  if (percent >= 90) return 'A-';
  if (percent >= 85) return 'B+';
  if (percent >= 80) return 'B';
  if (percent >= 75) return 'C+';
  if (percent >= 70) return 'C';
  if (percent >= 65) return 'D+';
  if (percent >= 60) return 'D';
  return 'F';
};

// Helper function to get grade label
export const getGradeLabel = (grade: string, lang: 'en' | 'ar'): string => {
  const gradeInfo = VERTEX_GRADE_SCALE[grade as keyof typeof VERTEX_GRADE_SCALE];
  return gradeInfo?.label?.[lang] || grade;
};

// Helper function to get grade color
export const getGradeColor = (grade: string): string => {
  if (grade === 'A' || grade === 'A-') return 'text-green-600 bg-green-100';
  if (grade === 'B+' || grade === 'B') return 'text-blue-600 bg-blue-100';
  if (grade === 'C+' || grade === 'C') return 'text-yellow-600 bg-yellow-100';
  if (grade === 'D+' || grade === 'D') return 'text-orange-600 bg-orange-100';
  if (grade === 'F' || grade === 'FA') return 'text-red-600 bg-red-100';
  if (grade === 'P' || grade === 'S' || grade === 'CX') return 'text-green-600 bg-green-100';
  if (grade === 'NP') return 'text-red-600 bg-red-100';
  return 'text-slate-600 bg-slate-100';
};

export const MOCK_COURSES: Course[] = [
  { id: 'c1', code: 'CS101', name_en: 'Intro to Computer Science', name_ar: 'مقدمة في علم الحاسوب', credits: 3, schedule: 'Mon/Wed 10:00', instructor: 'Dr. Sarah Smith', enrolled: 45, capacity: 50, description: 'Fundamentals of programming and algorithms.' },
  { id: 'c2', code: 'MATH201', name_en: 'Calculus II', name_ar: 'تفاضل وتكامل ٢', credits: 4, schedule: 'Sun/Tue 08:30', instructor: 'Dr. John Doe', enrolled: 30, capacity: 40, description: 'Integration techniques and sequences.' },
  { id: 'c3', code: 'PHYS101', name_en: 'General Physics', name_ar: 'فيزياء عامة', credits: 3, schedule: 'Thu 13:00', instructor: 'Dr. Ali Hassan', enrolled: 50, capacity: 60, description: 'Mechanics and thermodynamics.' },
  { id: 'c4', code: 'ENG102', name_en: 'Academic Writing', name_ar: 'الكتابة الأكاديمية', credits: 2, schedule: 'Mon 14:00', instructor: 'Ms. Emily White', enrolled: 25, capacity: 25, description: 'Research papers and critical thinking.' },
  { id: 'c5', code: 'CS202', name_en: 'Data Structures', name_ar: 'تراكيب البيانات', credits: 3, schedule: 'Tue/Thu 11:00', instructor: 'Dr. Sarah Smith', enrolled: 20, capacity: 45, description: 'Trees, Graphs, and Hash Maps.' },
];

export const MOCK_FINANCIALS: FinancialRecord[] = [
  { id: 'f1', date: '2023-09-01', description: 'Fall 2023 Tuition', amount: 1200, type: 'DEBIT', status: 'PAID', studentName: 'Ahmed Al-Mansour' },
  { id: 'f2', date: '2023-09-15', description: 'Student Activity Fee', amount: 50, type: 'DEBIT', status: 'PAID', studentName: 'Ahmed Al-Mansour' },
  { id: 'f3', date: '2024-01-10', description: 'Spring 2024 Tuition', amount: 1200, type: 'DEBIT', status: 'PENDING', studentName: 'Ahmed Al-Mansour' },
  { id: 'f4', date: '2024-01-11', description: 'Scholarship Grant', amount: 750, type: 'CREDIT', status: 'PAID', studentName: 'Ahmed Al-Mansour' },
  { id: 'f5', date: '2024-01-12', description: 'Library Fine', amount: 15, type: 'DEBIT', status: 'OVERDUE', studentName: 'Sara Ali' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Midterm Exam Schedule', date: '2023-10-20', content: 'The schedule has been published. Please check your dashboard.', type: 'ACADEMIC', sender: 'Registrar' },
  { id: 'a2', title: 'Tuition Deadline', date: '2023-11-01', content: 'Please settle your balance before Nov 15 to avoid penalties.', type: 'FINANCIAL', sender: 'Finance Dept' },
  { id: 'a3', title: 'Campus Maintenance', date: '2023-11-05', content: 'Library closed for maintenance on Friday.', type: 'GENERAL', sender: 'Facilities' },
];

export const MOCK_APPLICATIONS: AdmissionApplication[] = [
  { id: 'app1', fullName: 'Layla Mahmoud', nationalId: '987654321', program: 'Computer Science', highSchoolScore: 92.5, status: 'PENDING', date: '2024-02-01', email: 'layla.m@email.com' },
  { id: 'app2', fullName: 'Omar Khalid', nationalId: '123456789', program: 'Medicine', highSchoolScore: 98.0, status: 'APPROVED', date: '2024-01-28', email: 'omar.k@email.com' },
  { id: 'app3', fullName: 'Zaid Amjad', nationalId: '564738291', program: 'Engineering', highSchoolScore: 75.0, status: 'REJECTED', date: '2024-01-25', email: 'zaid.a@email.com' },
];

export const MOCK_ENROLLED_STUDENTS: EnrolledStudent[] = [
  { id: 's1', name: 'Ahmed Al-Mansour', studentId: '20231045', attendance: 92, midterm: 25, final: undefined },
  { id: 's2', name: 'Maha Abdullah', studentId: '20231046', attendance: 85, midterm: 22, final: undefined },
  { id: 's3', name: 'Sami Yusuf', studentId: '20231047', attendance: 70, midterm: 18, final: undefined },
  { id: 's4', name: 'Noor Ali', studentId: '20231048', attendance: 95, midterm: 28, final: undefined },
  { id: 's5', name: 'Kareem Jabbar', studentId: '20231049', attendance: 60, midterm: 15, final: undefined },
];

export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [
  { id: 'sr1', requestType: 'Official Transcript', date: '2023-12-01', status: 'COMPLETED', comments: 'Picked up at registrar' },
  { id: 'sr2', requestType: 'Identification Letter', date: '2024-02-10', status: 'PENDING' },
  { id: 'sr3', requestType: 'Exam Excuse', date: '2024-01-05', status: 'REJECTED', comments: 'Insufficient documentation' },
];

export const MOCK_ATTENDANCE_RECORDS = [
  { id: 'att1', date: '2024-11-25', courseId: 'c1', courseName: 'Intro to Computer Science', courseNameAr: 'مقدمة في علم الحاسوب', status: 'present' as const, time: '10:00 AM', duration: 90, instructor: 'Dr. Sarah Smith' },
  { id: 'att2', date: '2024-11-25', courseId: 'c2', courseName: 'Calculus II', courseNameAr: 'تفاضل وتكامل ٢', status: 'present' as const, time: '08:30 AM', duration: 90, instructor: 'Dr. John Doe' },
  { id: 'att3', date: '2024-11-24', courseId: 'c1', courseName: 'Intro to Computer Science', courseNameAr: 'مقدمة في علم الحاسوب', status: 'late' as const, time: '10:00 AM', duration: 90, instructor: 'Dr. Sarah Smith', notes: 'Arrived 15 minutes late' },
  { id: 'att4', date: '2024-11-24', courseId: 'c3', courseName: 'General Physics', courseNameAr: 'فيزياء عامة', status: 'present' as const, time: '01:00 PM', duration: 90, instructor: 'Dr. Ali Hassan' },
  { id: 'att5', date: '2024-11-21', courseId: 'c1', courseName: 'Intro to Computer Science', courseNameAr: 'مقدمة في علم الحاسوب', status: 'present' as const, time: '10:00 AM', duration: 90, instructor: 'Dr. Sarah Smith' },
  { id: 'att6', date: '2024-11-21', courseId: 'c2', courseName: 'Calculus II', courseNameAr: 'تفاضل وتكامل ٢', status: 'absent' as const, time: '08:30 AM', duration: 90, instructor: 'Dr. John Doe' },
  { id: 'att7', date: '2024-11-20', courseId: 'c4', courseName: 'Academic Writing', courseNameAr: 'الكتابة الأكاديمية', status: 'present' as const, time: '02:00 PM', duration: 60, instructor: 'Ms. Emily White' },
  { id: 'att8', date: '2024-11-20', courseId: 'c1', courseName: 'Intro to Computer Science', courseNameAr: 'مقدمة في علم الحاسوب', status: 'present' as const, time: '10:00 AM', duration: 90, instructor: 'Dr. Sarah Smith' },
  { id: 'att9', date: '2024-11-18', courseId: 'c2', courseName: 'Calculus II', courseNameAr: 'تفاضل وتكامل ٢', status: 'excused' as const, time: '08:30 AM', duration: 90, instructor: 'Dr. John Doe', notes: 'Medical excuse provided' },
  { id: 'att10', date: '2024-11-17', courseId: 'c3', courseName: 'General Physics', courseNameAr: 'فيزياء عامة', status: 'present' as const, time: '01:00 PM', duration: 90, instructor: 'Dr. Ali Hassan' },
  { id: 'att11', date: '2024-11-14', courseId: 'c1', courseName: 'Intro to Computer Science', courseNameAr: 'مقدمة في علم الحاسوب', status: 'present' as const, time: '10:00 AM', duration: 90, instructor: 'Dr. Sarah Smith' },
  { id: 'att12', date: '2024-11-14', courseId: 'c2', courseName: 'Calculus II', courseNameAr: 'تفاضل وتكامل ٢', status: 'present' as const, time: '08:30 AM', duration: 90, instructor: 'Dr. John Doe' },
];

export const MOCK_COURSE_ATTENDANCE = [
  { courseId: 'c1', courseName: 'Intro to Computer Science', courseNameAr: 'مقدمة في علم الحاسوب', totalClasses: 24, attended: 22, absent: 1, late: 1, excused: 0, percentage: 92, lastAttendance: '2024-11-25', instructor: 'Dr. Sarah Smith' },
  { courseId: 'c2', courseName: 'Calculus II', courseNameAr: 'تفاضل وتكامل ٢', totalClasses: 24, attended: 19, absent: 3, late: 0, excused: 2, percentage: 79, lastAttendance: '2024-11-25', instructor: 'Dr. John Doe' },
  { courseId: 'c3', courseName: 'General Physics', courseNameAr: 'فيزياء عامة', totalClasses: 12, attended: 11, absent: 1, late: 0, excused: 0, percentage: 92, lastAttendance: '2024-11-24', instructor: 'Dr. Ali Hassan' },
  { courseId: 'c4', courseName: 'Academic Writing', courseNameAr: 'الكتابة الأكاديمية', totalClasses: 12, attended: 8, absent: 3, late: 1, excused: 0, percentage: 67, lastAttendance: '2024-11-20', instructor: 'Ms. Emily White' },
  { courseId: 'c5', courseName: 'Data Structures', courseNameAr: 'تراكيب البيانات', totalClasses: 24, attended: 24, absent: 0, late: 0, excused: 0, percentage: 100, lastAttendance: '2024-11-26', instructor: 'Dr. Sarah Smith' },
];

export const TRANSLATIONS: Translation = {
  // Navigation & Global
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  academic: { en: 'Academic', ar: 'الشؤون الأكاديمية' },
  finance: { en: 'Finance', ar: 'المالية' },
  admissions: { en: 'Admissions', ar: 'القبول والتسجيل' },
  lecturer: { en: 'Lecturer Portal', ar: 'بوابة المحاضر' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  welcome: { en: 'Welcome back', ar: 'مرحباً بك' },
  search: { en: 'Search...', ar: 'بحث...' },
  viewStudent: { en: 'View: Student', ar: 'عرض: طالب' },
  viewLecturer: { en: 'View: Lecturer', ar: 'عرض: محاضر' },
  viewAdmin: { en: 'View: Admin', ar: 'عرض: مسؤول' },
  viewFinance: { en: 'View: Finance', ar: 'عرض: مالية' },
  poweredBy: { en: 'Powered by Gemini', ar: 'مدعوم من Gemini' },
  
  // Login
  login: { en: 'Sign In', ar: 'تسجيل الدخول' },
  loginSubtitle: { en: 'Access your academic portal', ar: 'الدخول إلى بوابتك الأكاديمية' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  forgotPassword: { en: 'Forgot Password?', ar: 'نسيت كلمة المرور؟' },
  rememberMe: { en: 'Remember me', ar: 'تذكرني' },
  loginButton: { en: 'Sign In', ar: 'دخول' },
  universityName: { en: 'VERTEX UNIVERSITY', ar: 'جامعة فيرتكس' },
  welcomeBack: { en: 'Welcome Back!', ar: 'أهلاً بعودتك!' },

  // Search
  noResults: { en: 'No results found', ar: 'لا توجد نتائج' },
  resultsCourses: { en: 'Courses', ar: 'المساقات' },
  resultsStudents: { en: 'Students', ar: 'الطلاب' },
  resultsAnnouncements: { en: 'Announcements', ar: 'الإعلانات' },

  // Dashboard
  gpa: { en: 'GPA', ar: 'المعدل التراكمي' },
  credits: { en: 'Credits', ar: 'الساعات المعتمدة' },
  level: { en: 'Level', ar: 'المستوى' },
  balance: { en: 'Balance', ar: 'الرصيد المالي' },
  attendance: { en: 'Attendance', ar: 'الحضور' },
  nextClass: { en: 'Next Class', ar: 'الحصة القادمة' },
  courses: { en: 'My Courses', ar: 'مساقاتي' },
  schedule: { en: 'Weekly Schedule', ar: 'الجدول الأسبوعي' },
  announcements: { en: 'Announcements', ar: 'الإعلانات' },
  payNow: { en: 'Pay Now', ar: 'ادفع الآن' },
  switchRole: { en: 'Switch Role', ar: 'تغيير الدور' },
  aiAssistant: { en: 'AI Assistant', ar: 'المساعد الذكي' },
  askMe: { en: 'Ask me anything about your academic status...', ar: 'اسألني أي شيء عن وضعك الأكاديمي...' },
  courseReg: { en: 'Course Registration', ar: 'تسجيل المساقات' },
  studentWelcomeMsg: { en: 'Keep up the good work this semester.', ar: 'حافظ على هذا الأداء الجيد هذا الفصل.' },
  adminWelcomeMsg: { en: 'Here is what is happening today.', ar: 'إليك ملخص أحداث اليوم.' },
  totalStudents: { en: 'Total Students', ar: 'مجموع الطلاب' },
  pendingApps: { en: 'Pending Applications', ar: 'طلبات قيد الانتظار' },
  monthlyRevenue: { en: 'Revenue (Monthly)', ar: 'الإيرادات (شهري)' },
  lecturerCourses: { en: 'My Courses', ar: 'مساقاتي' },
  assignmentsToGrade: { en: 'Assignments to Grade', ar: 'واجبات للتصحيح' },
  present: { en: 'Present', ar: 'حضور' },
  absent: { en: 'Absent', ar: 'غياب' },
  appsTrend: { en: 'Applications Trend', ar: 'مؤشر الطلبات' },
  chartPlaceholderApps: { en: 'Chart Placeholder: Applications per Month', ar: 'مخطط: الطلبات لكل شهر' },
  coursePerf: { en: 'Course Performance', ar: 'أداء المساق' },
  chartPlaceholderGrades: { en: 'Chart Placeholder: Average Grade Distribution', ar: 'مخطط: توزيع معدل الدرجات' },

  // Academic
  transcripts: { en: 'Transcripts', ar: 'كشف الدرجات' },
  register: { en: 'Register', ar: 'تسجيل' },
  drop: { en: 'Drop', ar: 'سحب' },
  availableCourses: { en: 'Available Courses', ar: 'المساقات المتاحة' },
  myRecord: { en: 'My Record', ar: 'سجلي الأكاديمي' },
  myGrades: { en: 'My Grades', ar: 'درجاتي' },
  registration: { en: 'Registration', ar: 'التسجيل' },
  springRegOpen: { en: 'Spring 2024 Registration Open', ar: 'تسجيل ربيع 2024 مفتوح' },
  regClosesMsg: { en: 'Registration closes on Feb 15, 2024. Ensure no time conflicts exist.', ar: 'يغلق التسجيل في 15 فبراير 2024. تأكد من عدم وجود تعارض في الأوقات.' },
  code: { en: 'Course Code', ar: 'رمز المساق' },
  courseTitle: { en: 'Course Title', ar: 'اسم المساق' },
  semester: { en: 'Semester', ar: 'الفصل الدراسي' },
  grade: { en: 'Grade', ar: 'الدرجة' },
  points: { en: 'Points', ar: 'النقاط' },
  syncedMoodle: { en: 'Synced with Moodle', ar: 'متزامن مع مودل' },
  cumulativeGpa: { en: 'Cumulative GPA', ar: 'المعدل التراكمي' },
  totalPointsLabel: { en: 'Total Points', ar: 'مجموع النقاط' },
  attemptedCredits: { en: 'Attempted Credits', ar: 'الساعات المنجزة' },
  cr: { en: 'Cr', ar: 'س.م' },
  
  // New Academic Screens
  requests: { en: 'Service Requests', ar: 'الطلبات الخدمية' },
  studyPlan: { en: 'Study Plan', ar: 'الخطة الدراسية' },
  createRequest: { en: 'Create Request', ar: 'إنشاء طلب' },
  requestType: { en: 'Request Type', ar: 'نوع الطلب' },
  comments: { en: 'Comments', ar: 'ملاحظات' },
  prerequisites: { en: 'Prerequisites', ar: 'المتطلبات السابقة' },
  statusCompleted: { en: 'Completed', ar: 'مكتمل' },
  statusInProgress: { en: 'In Progress', ar: 'قيد الدراسة' },
  statusNotStarted: { en: 'Not Started', ar: 'لم يبدأ' },

  // Filters
  filterBy: { en: 'Filter by', ar: 'تصفية حسب' },
  instructorLabel: { en: 'Instructor', ar: 'المحاضر' },
  clearFilters: { en: 'Clear Filters', ar: 'مسح الفلاتر' },
  all: { en: 'All', ar: 'الكل' },

  // Lecturer
  manageGrades: { en: 'Manage Grades', ar: 'إدارة الدرجات' },
  studentList: { en: 'Student List', ar: 'قائمة الطلبة' },
  syncMoodle: { en: 'Sync from Moodle', ar: 'مزامنة مع مودل' },
  saveChanges: { en: 'Save Changes', ar: 'حفظ التغييرات' },
  backToCourses: { en: 'Back to Courses', ar: 'عودة للمساقات' },
  enrolledCount: { en: 'Enrolled', ar: 'مسجل' },
  studentName: { en: 'Student Name', ar: 'اسم الطالب' },
  studentId: { en: 'ID', ar: 'الرقم الجامعي' },
  attendancePct: { en: 'Attendance %', ar: 'نسبة الحضور' },
  midterm: { en: 'Midterm', ar: 'نصفي' },
  final: { en: 'Final', ar: 'نهائي' },
  total: { en: 'Total', ar: 'المجموع' },

  // Admissions
  applications: { en: 'Applications', ar: 'طلبات القبول' },
  approve: { en: 'Approve', ar: 'قبول' },
  reject: { en: 'Reject', ar: 'رفض' },
  pendingReview: { en: 'Pending Review', ar: 'قيد المراجعة' },
  accepted: { en: 'Accepted', ar: 'مقبول' },
  totalApps: { en: 'Total Applications', ar: 'مجموع الطلبات' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  applicant: { en: 'Applicant', ar: 'المتقدم' },
  nationalId: { en: 'National ID', ar: 'رقم الهوية' },
  score: { en: 'Score', ar: 'المعدل' },
  program: { en: 'Program', ar: 'البرنامج' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'إجراءات' },
  statusPending: { en: 'PENDING', ar: 'قيد الانتظار' },
  statusApproved: { en: 'APPROVED', ar: 'مقبول' },
  statusRejected: { en: 'REJECTED', ar: 'مرفوض' },
  
  // New Registration Form
  registerNewStudent: { en: 'Register New Student', ar: 'تسجيل طالب جديد' },
  personalInfo: { en: 'Personal Info', ar: 'المعلومات الشخصية' },
  academicDetails: { en: 'Academic Details', ar: 'التفاصيل الأكاديمية' },
  financialPrereq: { en: 'Financial Prerequisites', ar: 'المتطلبات المالية' },
  next: { en: 'Next', ar: 'التالي' },
  previous: { en: 'Previous', ar: 'السابق' },
  submitApplication: { en: 'Submit Application', ar: 'تقديم الطلب' },
  dob: { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  address: { en: 'Address', ar: 'العنوان' },
  highSchool: { en: 'High School', ar: 'المدرسة الثانوية' },
  scholarship: { en: 'Apply for Scholarship', ar: 'تقديم لمنحة' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
  initialDeposit: { en: 'Initial Deposit', ar: 'الدفعة الأولية' },
  terms: { en: 'I agree to the terms and conditions', ar: 'أوافق على الشروط والأحكام' },
  registrationSuccess: { en: 'Registration submitted successfully!', ar: 'تم تسجيل الطلب بنجاح!' },
  backToApps: { en: 'Back to Applications', ar: 'عودة للطلبات' },
  step: { en: 'Step', ar: 'خطوة' },
  review: { en: 'Review', ar: 'مراجعة' },
  cash: { en: 'Cash', ar: 'نقدي' },
  card: { en: 'Card', ar: 'بطاقة' },
  transfer: { en: 'Bank Transfer', ar: 'تحويل بنكي' },

  // Finance
  invoice: { en: 'Create Invoice', ar: 'إنشاء فاتورة' },
  debtors: { en: 'Debtors Report', ar: 'تقرير الذمم المالية' },
  transHistory: { en: 'Transaction History', ar: 'سجل المعاملات' },
  downloadPdf: { en: 'PDF', ar: 'PDF' },
  amountToPay: { en: 'Amount to pay', ar: 'المبلغ للدفع' },
  cardNumber: { en: 'Card Number', ar: 'رقم البطاقة' },
  expiry: { en: 'Expiry', ar: 'تاريخ الانتهاء' },
  cvc: { en: 'CVC', ar: 'رمز التحقق' },
  confirmPayment: { en: 'Confirm Payment', ar: 'تأكيد الدفع' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  totalRevenue: { en: 'Total Revenue (YTD)', ar: 'إجمالي الإيرادات (منذ بداية العام)' },
  outstandingDebts: { en: 'Outstanding Debts', ar: 'الديون المستحقة' },
  recentPayments: { en: 'Recent Payments (Today)', ar: 'الدفعات الحديثة (اليوم)' },
  recentActivities: { en: 'Recent Financial Activities', ar: 'الأنشطة المالية الحديثة' },
  date: { en: 'Date', ar: 'التاريخ' },
  description: { en: 'Description', ar: 'الوصف' },
  type: { en: 'Type', ar: 'النوع' },
  amount: { en: 'Amount', ar: 'المبلغ' },
  paymentSuccess: { en: 'Payment Successful!', ar: 'تم الدفع بنجاح!' },
  totalOutBalance: { en: 'Total Outstanding Balance', ar: 'إجمالي الرصيد المستحق' },
  dueDate: { en: 'Due Date: Dec 15, 2023', ar: 'تاريخ الاستحقاق: 15 ديسمبر 2023' },

  // Settings
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  general: { en: 'General', ar: 'عام' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  security: { en: 'Security', ar: 'الأمان' },
  language: { en: 'Language', ar: 'اللغة' },
  darkMode: { en: 'Dark Mode', ar: 'الوضع الداكن' },
  emailNotif: { en: 'Email Notifications', ar: 'إشعارات البريد' },
  smsNotif: { en: 'SMS Notifications', ar: 'رسائل SMS' },
  changePassword: { en: 'Change Password', ar: 'تغيير كلمة المرور' },
  currentPass: { en: 'Current Password', ar: 'كلمة المرور الحالية' },
  newPass: { en: 'New Password', ar: 'كلمة المرور الجديدة' },
  confirmPass: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  updateProfile: { en: 'Update Profile', ar: 'تحديث الملف' },
  phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
  email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  changeAvatar: { en: 'Change Avatar', ar: 'تغيير الصورة الرمزية' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  emailUpdates: { en: 'Receive academic updates via email', ar: 'استلام التحديثات الأكاديمية عبر البريد' },
  smsUpdates: { en: 'Receive urgent alerts via SMS', ar: 'استلام التنبيهات العاجلة عبر SMS' },

  // Profile Page
  contactDetails: { en: 'Contact Details', ar: 'معلومات الاتصال' },
  enrollmentStatus: { en: 'Enrollment Status', ar: 'حالة القيد' },
  activeStatus: { en: 'Active', ar: 'نشط' },
  advisor: { en: 'Academic Advisor', ar: 'المرشد الأكاديمي' },
  progress: { en: 'Progress', ar: 'التقدم' },
  major: { en: 'Major', ar: 'التخصص' },

  // Student Card Section
  studentCard: { en: 'Student Card', ar: 'بطاقة الطالب' },
  studentPhoto: { en: 'Student Photo', ar: 'صورة الطالب' },
  nameArabic: { en: 'Name (Arabic)', ar: 'الاسم بالعربي' },
  nameEnglish: { en: 'Name (English)', ar: 'الاسم بالإنجليزي' },
  studentStatus: { en: 'Student Status', ar: 'حالة الطالب' },
  programTypeLabel: { en: 'Program Type', ar: 'نوع البرنامج' },
  statusActive: { en: 'Active', ar: 'نشط' },
  statusSuspended: { en: 'Suspended', ar: 'موقوف' },
  statusGraduated: { en: 'Graduated', ar: 'متخرج' },
  statusWithdrawn: { en: 'Withdrawn', ar: 'منسحب' },
  bachelor: { en: 'Bachelor', ar: 'بكالوريوس' },
  master: { en: 'Master', ar: 'ماجستير' },
  phd: { en: 'PhD', ar: 'دكتوراه' },

  // Personal Data Section
  personalData: { en: 'Personal Data', ar: 'البيانات الشخصية' },
  nationalIdPassport: { en: 'National ID / Passport', ar: 'رقم الهوية / جواز السفر' },
  dateOfBirth: { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  placeOfBirth: { en: 'Place of Birth', ar: 'مكان الميلاد' },
  genderLabel: { en: 'Gender', ar: 'الجنس' },
  male: { en: 'Male', ar: 'ذكر' },
  female: { en: 'Female', ar: 'أنثى' },
  nationalityLabel: { en: 'Nationality', ar: 'الجنسية' },
  maritalStatusLabel: { en: 'Marital Status', ar: 'الحالة الاجتماعية' },
  single: { en: 'Single', ar: 'أعزب' },
  married: { en: 'Married', ar: 'متزوج' },
  divorced: { en: 'Divorced', ar: 'مطلق' },
  widowed: { en: 'Widowed', ar: 'أرمل' },
  admissionDate: { en: 'Admission Date', ar: 'تاريخ الالتحاق' },

  // Contact & Address Section
  contactAddress: { en: 'Contact & Address Information', ar: 'معلومات الاتصال والعنوان' },
  mobilePhone: { en: 'Mobile Phone', ar: 'رقم الجوال' },
  alternativePhone: { en: 'Alternative Phone', ar: 'رقم جوال بديل' },
  personalEmail: { en: 'Personal Email', ar: 'البريد الإلكتروني الشخصي' },
  universityEmail: { en: 'University Email', ar: 'البريد الإلكتروني الجامعي' },
  country: { en: 'Country', ar: 'الدولة' },
  cityProvince: { en: 'City / Province', ar: 'المحافظة / المدينة' },
  streetAddress: { en: 'Street Address', ar: 'العنوان التفصيلي' },
  postalCode: { en: 'Postal Code', ar: 'الكود البريدي' },

  // Guardian & Emergency Section
  guardianEmergency: { en: 'Guardian & Emergency Contact', ar: 'ولي الأمر وجهة اتصال الطوارئ' },
  guardianName: { en: 'Guardian Name', ar: 'اسم ولي الأمر' },
  relationship: { en: 'Relationship', ar: 'صلة القرابة' },
  guardianPhone: { en: 'Guardian Phone', ar: 'رقم جوال ولي الأمر' },
  guardianEmail: { en: 'Guardian Email', ar: 'بريد ولي الأمر' },
  guardianAddress: { en: 'Guardian Address', ar: 'عنوان ولي الأمر' },
  emergencyContactTitle: { en: 'Emergency Contact', ar: 'جهة اتصال للطوارئ' },
  emergencyName: { en: 'Contact Name', ar: 'اسم الشخص' },
  emergencyPhone: { en: 'Contact Phone', ar: 'رقم الجوال' },
  father: { en: 'Father', ar: 'أب' },
  mother: { en: 'Mother', ar: 'أم' },
  brother: { en: 'Brother', ar: 'أخ' },
  sister: { en: 'Sister', ar: 'أخت' },
  spouse: { en: 'Spouse', ar: 'زوج/زوجة' },
  guardianRelation: { en: 'Guardian', ar: 'ولي أمر' },
  other: { en: 'Other', ar: 'آخر' },

  // Academic Information Section
  academicInformation: { en: 'Academic Information', ar: 'المعلومات الأكاديمية' },
  college: { en: 'College', ar: 'الكلية' },
  departmentLabel: { en: 'Department', ar: 'القسم' },
  degreeLabel: { en: 'Degree', ar: 'الدرجة العلمية' },
  studyPlanLabel: { en: 'Study Plan', ar: 'الخطة الدراسية' },
  cohortBatch: { en: 'Cohort / Batch', ar: 'سنة الدفعة' },
  currentLevel: { en: 'Current Level', ar: 'المستوى الحالي' },
  academicStatusLabel: { en: 'Academic Status', ar: 'الحالة الأكاديمية' },
  regular: { en: 'Regular', ar: 'منتظم' },
  onProbation: { en: 'On Probation', ar: 'إنذار أكاديمي' },
  dismissed: { en: 'Dismissed', ar: 'مفصول' },
  completedRequirements: { en: 'Completed Requirements', ar: 'مكتمل المتطلبات' },
  advisorName: { en: 'Advisor Name', ar: 'اسم المرشد' },
  advisorEmail: { en: 'Advisor Email', ar: 'بريد المرشد' },

  // Academic Summary Section
  academicSummary: { en: 'Academic Summary', ar: 'الملخص الأكاديمي' },
  totalRequiredCredits: { en: 'Total Required Credits', ar: 'إجمالي الساعات المطلوبة' },
  earnedCredits: { en: 'Earned Credits', ar: 'الساعات المنجزة' },
  registeredCredits: { en: 'Registered Credits (Current)', ar: 'الساعات المسجّلة حالياً' },
  remainingCredits: { en: 'Remaining Credits', ar: 'الساعات المتبقية' },
  termGpa: { en: 'Term GPA', ar: 'المعدل الفصلي' },
  cumulativeGpaLabel: { en: 'Cumulative GPA', ar: 'المعدل التراكمي' },

  // Financial Summary Section
  financialSummary: { en: 'Financial Summary', ar: 'الملخص المالي' },
  totalFeesThisTerm: { en: 'Total Fees (This Term)', ar: 'إجمالي الرسوم لهذا الفصل' },
  amountPaid: { en: 'Amount Paid', ar: 'المبلغ المدفوع' },
  currentBalanceLabel: { en: 'Current Balance', ar: 'الرصيد المتبقي' },
  previousBalanceLabel: { en: 'Previous Balance', ar: 'رصيد سابق' },
  scholarshipsDiscounts: { en: 'Scholarships / Discounts', ar: 'المنح / الخصومات' },
  financialStatusLabel: { en: 'Financial Status', ar: 'حالة الطالب المالية' },
  financiallyCleared: { en: 'Financially Cleared', ar: 'مخلص مالياً' },
  financialOnHold: { en: 'On Hold', ar: 'موقوف مالياً' },

  // Systems & Accounts Section
  systemsAccounts: { en: 'Systems & Accounts', ar: 'الأنظمة والحسابات' },
  sisUsername: { en: 'Username', ar: 'اسم المستخدم' },
  accountStatusLabel: { en: 'Account Status', ar: 'حالة الحساب' },
  accountActive: { en: 'Active', ar: 'نشط' },
  accountLocked: { en: 'Locked', ar: 'مقفل' },
  lastLogin: { en: 'Last Login', ar: 'آخر تسجيل دخول' },

  // Documents Section
  documentsAttachments: { en: 'Documents & Attachments', ar: 'المستندات والمرفقات' },
  highSchoolCertificate: { en: 'High School Certificate', ar: 'شهادة الثانوية العامة' },
  idPassportCopy: { en: 'ID / Passport Copy', ar: 'صورة الهوية / جواز السفر' },
  personalPhoto: { en: 'Personal Photo', ar: 'صورة شخصية' },
  additionalDocuments: { en: 'Additional Documents', ar: 'مستندات إضافية' },
  documentType: { en: 'Document Type', ar: 'نوع المستند' },
  uploadDate: { en: 'Upload Date', ar: 'تاريخ الرفع' },
  documentStatus: { en: 'Status', ar: 'الحالة' },
  docAccepted: { en: 'Accepted', ar: 'مقبول' },
  docRejected: { en: 'Rejected', ar: 'مرفوض' },
  docUnderReview: { en: 'Under Review', ar: 'قيد المراجعة' },
};

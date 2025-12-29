import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Calendar,
  TrendingUp,
  Check,
  X,
  Clock,
  GraduationCap,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { reportCardAPI, ReportCardData, ReportCardListItem, downloadReportCard } from '../api/reportCard';
import { studentsAPI } from '../api/students';
import { printPage } from '../utils/exportUtils';

interface TranscriptPageProps {
  lang: 'en' | 'ar';
}

// Translations
const t = {
  title: { en: 'Academic Transcript', ar: 'السجل الأكاديمي' },
  subtitle: { en: 'View your complete academic record', ar: 'عرض سجلك الأكاديمي الكامل' },
  downloadTranscript: { en: 'Download Full Transcript', ar: 'تحميل السجل الكامل' },
  printTranscript: { en: 'Print', ar: 'طباعة' },
  academicSummary: { en: 'Academic Summary', ar: 'الملخص الأكاديمي' },
  cumulativeGPA: { en: 'Cumulative GPA', ar: 'المعدل التراكمي' },
  totalCredits: { en: 'Total Credits', ar: 'إجمالي الساعات' },
  earnedCredits: { en: 'Earned Credits', ar: 'الساعات المكتسبة' },
  remainingCredits: { en: 'Remaining Credits', ar: 'الساعات المتبقية' },
  completedCourses: { en: 'Completed Courses', ar: 'المقررات المكتملة' },
  academicStanding: { en: 'Academic Standing', ar: 'الحالة الأكاديمية' },
  semesterRecords: { en: 'Semester Records', ar: 'سجلات الفصول' },
  semester: { en: 'Semester', ar: 'الفصل الدراسي' },
  courseCode: { en: 'Course Code', ar: 'رمز المقرر' },
  courseName: { en: 'Course Name', ar: 'اسم المقرر' },
  credits: { en: 'Credits', ar: 'الساعات' },
  grade: { en: 'Grade', ar: 'الدرجة' },
  points: { en: 'Points', ar: 'النقاط' },
  status: { en: 'Status', ar: 'الحالة' },
  semesterGPA: { en: 'Semester GPA', ar: 'معدل الفصل' },
  passed: { en: 'Passed', ar: 'ناجح' },
  failed: { en: 'Failed', ar: 'راسب' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  inProgress: { en: 'In Progress', ar: 'قيد التقدم' },
  downloadSemester: { en: 'Download Semester Report', ar: 'تحميل تقرير الفصل' },
  noRecords: { en: 'No academic records found', ar: 'لا توجد سجلات أكاديمية' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  error: { en: 'Error loading data', ar: 'خطأ في تحميل البيانات' },
  outOf: { en: 'out of', ar: 'من' },
  programInfo: { en: 'Program Information', ar: 'معلومات البرنامج' },
  program: { en: 'Program', ar: 'البرنامج' },
  degree: { en: 'Degree', ar: 'الدرجة العلمية' },
  department: { en: 'Department', ar: 'القسم' },
  college: { en: 'College', ar: 'الكلية' },
  currentLevel: { en: 'Current Level', ar: 'المستوى الحالي' },
  expectedGraduation: { en: 'Expected Graduation', ar: 'التخرج المتوقع' },
  classRank: { en: 'Class Rank', ar: 'الترتيب' },
  percentile: { en: 'Percentile', ar: 'المئوية' },
  attendanceRate: { en: 'Attendance Rate', ar: 'نسبة الحضور' },
};

// Default mock data for fallback
const defaultTranscriptData = {
  student: {
    id: 1,
    student_id: 'STU-2024-001',
    name_en: 'Ahmed Mohammed',
    name_ar: 'أحمد محمد',
    level: 3,
    gpa: 3.67,
    academic_standing: 'Good Standing',
    academic_standing_ar: 'وضع جيد',
    total_credits_required: 132,
    credits_earned: 84,
    expected_graduation: '2026-05',
  },
  program: {
    name_en: 'Computer Science',
    name_ar: 'علوم الحاسب',
    degree: 'Bachelor',
    department: 'Computer Science',
    department_ar: 'علوم الحاسب',
    college: 'College of Engineering',
    college_ar: 'كلية الهندسة',
  },
  semesters: [
    {
      id: 1,
      name: 'Fall 2024',
      name_ar: 'خريف 2024',
      academic_year: '2024-2025',
      gpa: 3.75,
      courses: [
        { code: 'CS301', name_en: 'Data Structures', name_ar: 'هياكل البيانات', credits: 3, grade: 'A', points: 4.0, passed: true },
        { code: 'CS302', name_en: 'Algorithms', name_ar: 'الخوارزميات', credits: 3, grade: 'A-', points: 3.7, passed: true },
        { code: 'CS303', name_en: 'Database Systems', name_ar: 'أنظمة قواعد البيانات', credits: 3, grade: 'B+', points: 3.3, passed: true },
        { code: 'MATH301', name_en: 'Linear Algebra', name_ar: 'الجبر الخطي', credits: 3, grade: 'B', points: 3.0, passed: true },
        { code: 'ENG301', name_en: 'Technical Writing', name_ar: 'الكتابة الفنية', credits: 2, grade: 'A', points: 4.0, passed: true },
      ],
      total_credits: 14,
      earned_credits: 14,
    },
    {
      id: 2,
      name: 'Spring 2024',
      name_ar: 'ربيع 2024',
      academic_year: '2023-2024',
      gpa: 3.58,
      courses: [
        { code: 'CS201', name_en: 'Object-Oriented Programming', name_ar: 'البرمجة الكائنية', credits: 3, grade: 'A-', points: 3.7, passed: true },
        { code: 'CS202', name_en: 'Computer Networks', name_ar: 'شبكات الحاسب', credits: 3, grade: 'B+', points: 3.3, passed: true },
        { code: 'CS203', name_en: 'Operating Systems', name_ar: 'أنظمة التشغيل', credits: 3, grade: 'B+', points: 3.3, passed: true },
        { code: 'MATH201', name_en: 'Calculus II', name_ar: 'التفاضل والتكامل 2', credits: 3, grade: 'B', points: 3.0, passed: true },
      ],
      total_credits: 12,
      earned_credits: 12,
    },
    {
      id: 3,
      name: 'Fall 2023',
      name_ar: 'خريف 2023',
      academic_year: '2023-2024',
      gpa: 3.45,
      courses: [
        { code: 'CS101', name_en: 'Introduction to Programming', name_ar: 'مقدمة في البرمجة', credits: 3, grade: 'A', points: 4.0, passed: true },
        { code: 'CS102', name_en: 'Computer Fundamentals', name_ar: 'أساسيات الحاسب', credits: 3, grade: 'B+', points: 3.3, passed: true },
        { code: 'MATH101', name_en: 'Calculus I', name_ar: 'التفاضل والتكامل 1', credits: 3, grade: 'B', points: 3.0, passed: true },
        { code: 'PHY101', name_en: 'Physics I', name_ar: 'الفيزياء 1', credits: 3, grade: 'B-', points: 2.7, passed: true },
        { code: 'ENG101', name_en: 'English I', name_ar: 'اللغة الإنجليزية 1', credits: 2, grade: 'A-', points: 3.7, passed: true },
      ],
      total_credits: 14,
      earned_credits: 14,
    },
  ],
};

const TranscriptPage: React.FC<TranscriptPageProps> = ({ lang }) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadingFull, setDownloadingFull] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([]);
  const [transcriptData, setTranscriptData] = useState<typeof defaultTranscriptData>(defaultTranscriptData);
  const [reportCards, setReportCards] = useState<ReportCardListItem[]>([]);

  const isRTL = lang === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch from API
        const [transcriptResponse, reportCardsResponse] = await Promise.all([
          studentsAPI.getMyTranscript().catch(() => null),
          reportCardAPI.getMyReportCards().catch(() => null),
        ]);

        if (transcriptResponse) {
          setTranscriptData(transcriptResponse);
        }
        if (reportCardsResponse) {
          setReportCards(reportCardsResponse.report_cards || []);
        }
      } catch (err) {
        console.error('Error fetching transcript data:', err);
        // Use default data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSemester = (semesterId: number) => {
    setExpandedSemesters((prev) =>
      prev.includes(semesterId)
        ? prev.filter((id) => id !== semesterId)
        : [...prev, semesterId]
    );
  };

  const handleDownloadSemester = async (semesterId: number) => {
    setDownloading(semesterId);
    try {
      const blob = await reportCardAPI.downloadMyReportCard(semesterId, lang);
      downloadReportCard(blob, transcriptData.student.student_id, semesterId, lang);
    } catch (err) {
      console.error('Error downloading report card:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadFullTranscript = async () => {
    setDownloadingFull(true);
    try {
      // Download all semester reports as one combined PDF
      const blob = await reportCardAPI.downloadMyReportCard(0, lang); // 0 = full transcript
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${transcriptData.student.student_id}_${lang}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading full transcript:', err);
    } finally {
      setDownloadingFull(false);
    }
  };

  const handlePrint = () => {
    printPage(undefined, 'Academic Transcript', 'السجل الأكاديمي', lang);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    if (gpa >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">{t.loading[lang]}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const student = transcriptData.student;
  const program = transcriptData.program;
  const semesters = transcriptData.semesters;

  return (
    <div className={`p-4 md:p-6 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            {t.title[lang]}
          </h1>
          <p className="text-slate-600 mt-1">{t.subtitle[lang]}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{t.printTranscript[lang]}</span>
          </button>
          <button
            onClick={handleDownloadFullTranscript}
            disabled={downloadingFull}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {downloadingFull ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{t.downloadTranscript[lang]}</span>
          </button>
        </div>
      </div>

      {/* Program Info & Academic Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            {t.programInfo[lang]}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">{t.program[lang]}</span>
              <span className="font-medium text-slate-800">
                {lang === 'ar' ? program.name_ar : program.name_en}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{t.degree[lang]}</span>
              <span className="font-medium text-slate-800">{program.degree}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{t.department[lang]}</span>
              <span className="font-medium text-slate-800">
                {lang === 'ar' ? program.department_ar : program.department}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{t.college[lang]}</span>
              <span className="font-medium text-slate-800">
                {lang === 'ar' ? program.college_ar : program.college}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{t.currentLevel[lang]}</span>
              <span className="font-medium text-slate-800">{student.level}</span>
            </div>
            {student.expected_graduation && (
              <div className="flex justify-between">
                <span className="text-slate-600">{t.expectedGraduation[lang]}</span>
                <span className="font-medium text-slate-800">{student.expected_graduation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Academic Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            {t.academicSummary[lang]}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Cumulative GPA */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${getGPAColor(student.gpa)}`}>
                {student.gpa.toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 mt-1">{t.cumulativeGPA[lang]}</div>
              <div className="text-xs text-slate-500 mt-1">{t.outOf[lang]} 4.00</div>
            </div>

            {/* Credits Progress */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {student.credits_earned}
              </div>
              <div className="text-sm text-slate-600 mt-1">{t.earnedCredits[lang]}</div>
              <div className="text-xs text-slate-500 mt-1">
                {t.outOf[lang]} {student.total_credits_required}
              </div>
            </div>

            {/* Remaining Credits */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {student.total_credits_required - student.credits_earned}
              </div>
              <div className="text-sm text-slate-600 mt-1">{t.remainingCredits[lang]}</div>
            </div>

            {/* Completed Courses */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {semesters.reduce((acc, sem) => acc + sem.courses.length, 0)}
              </div>
              <div className="text-sm text-slate-600 mt-1">{t.completedCourses[lang]}</div>
            </div>
          </div>

          {/* Academic Standing */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{t.academicStanding[lang]}</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {lang === 'ar' ? student.academic_standing_ar : student.academic_standing}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Records */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {t.semesterRecords[lang]}
          </h2>
        </div>

        {semesters.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            {t.noRecords[lang]}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {semesters.map((semester) => {
              const isExpanded = expandedSemesters.includes(semester.id);
              return (
                <div key={semester.id}>
                  {/* Semester Header */}
                  <button
                    onClick={() => toggleSemester(semester.id)}
                    className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="font-semibold text-slate-800">
                          {lang === 'ar' ? semester.name_ar : semester.name}
                        </h3>
                        <p className="text-sm text-slate-500">{semester.academic_year}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`hidden md:block ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`text-lg font-bold ${getGPAColor(semester.gpa)}`}>
                          {semester.gpa.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">{t.semesterGPA[lang]}</div>
                      </div>
                      <div className={`hidden md:block ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className="font-medium text-slate-800">
                          {semester.earned_credits} / {semester.total_credits}
                        </div>
                        <div className="text-xs text-slate-500">{t.credits[lang]}</div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Semester Details */}
                  {isExpanded && (
                    <div className="px-4 md:px-6 pb-6">
                      {/* Mobile Summary */}
                      <div className="md:hidden flex gap-4 mb-4">
                        <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center">
                          <div className={`text-lg font-bold ${getGPAColor(semester.gpa)}`}>
                            {semester.gpa.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">{t.semesterGPA[lang]}</div>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-medium text-slate-800">
                            {semester.earned_credits} / {semester.total_credits}
                          </div>
                          <div className="text-xs text-slate-500">{t.credits[lang]}</div>
                        </div>
                      </div>

                      {/* Course Table */}
                      <div className="bg-slate-50 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="px-4 py-3 text-sm font-medium text-slate-600 text-start">
                                  {t.courseCode[lang]}
                                </th>
                                <th className="px-4 py-3 text-sm font-medium text-slate-600 text-start">
                                  {t.courseName[lang]}
                                </th>
                                <th className="px-4 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.credits[lang]}
                                </th>
                                <th className="px-4 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.grade[lang]}
                                </th>
                                <th className="px-4 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.points[lang]}
                                </th>
                                <th className="px-4 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.status[lang]}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {semester.courses.map((course, idx) => (
                                <tr key={idx} className="bg-white hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                    {course.code}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {lang === 'ar' ? course.name_ar : course.name_en}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600 text-center">
                                    {course.credits}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getGradeColor(course.grade)}`}>
                                      {course.grade}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600 text-center">
                                    {course.points.toFixed(1)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {course.passed ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                        <Check className="w-3 h-3" />
                                        {t.passed[lang]}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                        <X className="w-3 h-3" />
                                        {t.failed[lang]}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Download Button */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleDownloadSemester(semester.id)}
                          disabled={downloading === semester.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {downloading === semester.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {t.downloadSemester[lang]}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GPA Trend Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          GPA Trend
        </h2>
        <div className="flex items-end justify-around h-40 px-4">
          {semesters.slice().reverse().map((semester, idx) => {
            const heightPercent = (semester.gpa / 4) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="text-xs font-medium text-slate-600">{semester.gpa.toFixed(2)}</div>
                <div
                  className={`w-12 rounded-t-lg ${getGPAColor(semester.gpa).replace('text-', 'bg-').replace('600', '500')}`}
                  style={{ height: `${heightPercent}%` }}
                />
                <div className="text-xs text-slate-500 text-center max-w-[60px] truncate">
                  {lang === 'ar' ? semester.name_ar?.split(' ')[0] : semester.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TranscriptPage;

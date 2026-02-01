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
  Search,
  Users,
} from 'lucide-react';
import { reportCardAPI, ReportCardData, ReportCardListItem, downloadReportCard } from '../api/reportCard';
import { studentsAPI } from '../api/students';
import { settingsAPI } from '../api/settings';
import { exportToPDF } from '../utils/exportUtils';
import { UserRole } from '../types';
import apiClient from '../api/client';

interface TranscriptPageProps {
  lang: 'en' | 'ar';
  role?: UserRole;
}

// Helper to safely format GPA values (standalone for use in template literals)
const safeFormatGPA = (gpa: number | string | undefined | null): string => {
  if (gpa === undefined || gpa === null) return '0.00';
  const numGpa = Number(gpa);
  return isNaN(numGpa) ? '0.00' : numGpa.toFixed(2);
};

// Helper to get GPA color class (standalone for use in template literals)
const safeGetGPAColor = (gpa: number | string | undefined | null): string => {
  const numGpa = Number(gpa) || 0;
  if (numGpa >= 3.5) return '#059669'; // green
  if (numGpa >= 3.0) return '#2563eb'; // blue
  if (numGpa >= 2.5) return '#d97706'; // yellow
  if (numGpa >= 2.0) return '#ea580c'; // orange
  return '#dc2626'; // red
};

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
  semesterRecords: { en: 'Grade Report', ar: 'كشف الدرجات' },
  semester: { en: 'Semester', ar: 'الفصل الدراسي' },
  courseCode: { en: 'Course Code', ar: 'رمز المساق' },
  courseName: { en: 'Course Name', ar: 'اسم المساق' },
  semesterCol: { en: 'Semester', ar: 'الفصل الدراسي' },
  credits: { en: 'Credit Hours', ar: 'الساعات المعتمدة' },
  coursework: { en: 'Coursework (20)', ar: 'أعمال الفصل (20)' },
  midterm: { en: 'Midterm (40)', ar: 'النصفي (40)' },
  final: { en: 'Final (40)', ar: 'النهائي (40)' },
  total: { en: 'Total', ar: 'المجموع' },
  grade: { en: 'Grade', ar: 'التقدير' },
  points: { en: 'Points', ar: 'النقاط' },
  status: { en: 'Status', ar: 'الحالة' },
  semesterGPA: { en: 'Semester GPA', ar: 'معدل الفصل' },
  passed: { en: 'Passed', ar: 'ناجح' },
  failed: { en: 'Failed', ar: 'راسب' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  inProgress: { en: 'In Progress', ar: 'قيد التقدم' },
  downloadSemester: { en: 'Download Grade Report', ar: 'تحميل كشف الدرجات' },
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

// Transcript data type
interface TranscriptData {
  student: {
    id: number;
    student_id: string;
    name_en: string;
    name_ar: string;
    level: number;
    gpa: number;
    academic_standing: string;
    academic_standing_ar: string;
    total_credits_required: number;
    credits_earned: number;
    expected_graduation: string;
  };
  program: {
    name_en: string;
    name_ar: string;
    degree: string;
    department: string;
    department_ar: string;
    college: string;
    college_ar: string;
  };
  semesters: Array<{
    id: number;
    name: string;
    name_ar: string;
    academic_year: string;
    gpa: number;
    courses: Array<{
      code: string;
      name_en: string;
      name_ar: string;
      credits: number;
      grade: string;
      points: number;
      passed: boolean;
      coursework: number;
      midterm: number;
      final: number;
      total: number;
    }>;
    total_credits: number;
    earned_credits: number;
  }>;
}

const TranscriptPage: React.FC<TranscriptPageProps> = ({ lang, role }) => {
  const isStaff = role === UserRole.STUDENT_AFFAIRS || role === UserRole.ADMIN;

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadingFull, setDownloadingFull] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([]);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [reportCards, setReportCards] = useState<ReportCardListItem[]>([]);

  // Staff-specific state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allTranscriptStats, setAllTranscriptStats] = useState({
    totalStudents: 0,
    averageGPA: 0,
    highGPAStudents: 0,
    lowGPAStudents: 0,
  });

  const isRTL = lang === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch semesters from admin module
        let semestersFromAdmin: any[] = [];
        try {
          const semestersRes = await apiClient.get('/semesters');
          const semData = semestersRes.data?.data || semestersRes.data;
          if (Array.isArray(semData)) {
            semestersFromAdmin = semData;
          }
        } catch {
          // Silently fail - semesters endpoint is optional
        }

        // Fetch from API - different endpoint for staff vs student
        let transcriptResponse: any = null;
        let reportCardsResponse: any = null;
        let gradesResponse: any = null;
        let studentProfile: any = null;

        if (isStaff && selectedStudent) {
          // Staff viewing specific student's transcript
          try {
            transcriptResponse = await studentsAPI.getStudentTranscript(selectedStudent.id);
          } catch { /* Silently fail */ }
          try {
            reportCardsResponse = await reportCardAPI.getStudentReportCards?.(selectedStudent.id);
          } catch { /* Silently fail */ }
          try {
            gradesResponse = await studentsAPI.getGrades(selectedStudent.id);
          } catch { /* Silently fail */ }
        } else if (!isStaff) {
          // Student viewing own transcript - fetch from multiple sources
          const results = await Promise.allSettled([
            studentsAPI.getMyTranscript(),
            reportCardAPI.getMyReportCards(),
            studentsAPI.getMyGrades(),
            studentsAPI.getMyProfile(),
          ]);

          transcriptResponse = results[0].status === 'fulfilled' ? results[0].value : null;
          reportCardsResponse = results[1].status === 'fulfilled' ? results[1].value : null;
          gradesResponse = results[2].status === 'fulfilled' ? results[2].value : null;
          const profileResult = results[3].status === 'fulfilled' ? results[3].value : null;

          // Extract student data from profile response
          const profileData = profileResult?.data || profileResult;
          studentProfile = profileData?.student || profileData;

          // Try to get full student data from admin module using student ID
          const studentId = studentProfile?.id || studentProfile?.student_id;
          if (studentId) {
            try {
              const fullStudentData = await studentsAPI.getById(studentId);
              const fullData = fullStudentData?.data || fullStudentData;
              if (fullData) {
                studentProfile = { ...studentProfile, ...fullData };
              }
            } catch {
              // Admin endpoint not accessible - use profile data
            }
          }
        }

        // Build transcript data from available sources
        const apiData = transcriptResponse || {};
        const studentData = apiData.student || studentProfile?.student || studentProfile || {};

        // Ensure gradesData is an array
        let gradesData: any[] = [];
        if (Array.isArray(gradesResponse?.data)) {
          gradesData = gradesResponse.data;
        } else if (Array.isArray(gradesResponse)) {
          gradesData = gradesResponse;
        } else if (gradesResponse?.grades && Array.isArray(gradesResponse.grades)) {
          gradesData = gradesResponse.grades;
        }

        // Ensure semestersFromAdmin is an array
        if (!Array.isArray(semestersFromAdmin)) {
          semestersFromAdmin = [];
        }

        // If we have student data, build the transcript
        if (studentData.id || studentData.student_id) {
          // Group grades by semester
          const gradesBySemester: Record<number, any[]> = {};
          if (Array.isArray(gradesData)) {
            gradesData.forEach((grade: any) => {
              const semId = grade.semester_id || grade.semester?.id || 0;
              if (!gradesBySemester[semId]) {
                gradesBySemester[semId] = [];
              }
              gradesBySemester[semId].push(grade);
            });
          }

          // Build semesters array - use API semesters or admin semesters
          let semestersArray: any[] = [];
          if (Array.isArray(apiData.semesters)) {
            semestersArray = apiData.semesters;
          }

          // If no semesters from transcript API, build from grades + admin semesters
          if (semestersArray.length === 0 && (Object.keys(gradesBySemester).length > 0 || semestersFromAdmin.length > 0)) {
            // Use admin semesters that have grades
            semestersArray = semestersFromAdmin
              .filter((sem: any) => gradesBySemester[sem.id] || sem.is_current)
              .map((sem: any) => ({
                semester: sem,
                courses: gradesBySemester[sem.id] || [],
                semester_gpa: 0, // Will be calculated
              }));
          }

          // Transform data to match UI expected structure
          // Map backend snake_case fields to expected format
          const transformedData: TranscriptData = {
            student: {
              id: studentData.id,
              student_id: studentData.student_id || studentData.studentId || '',
              name_en: studentData.name_en || studentData.nameEn || studentData.name || '',
              name_ar: studentData.name_ar || studentData.nameAr || studentData.name || '',
              level: studentData.level || studentData.current_level || 1,
              gpa: apiData.summary?.cumulative_gpa || studentData.gpa || studentData.cumulative_gpa || 0,
              academic_standing: apiData.summary?.academic_standing || studentData.academic_standing || studentData.academicStatus || 'Good Standing',
              academic_standing_ar: (() => {
                const status = apiData.summary?.academic_standing || studentData.academic_standing || studentData.academicStatus || 'Good Standing';
                if (status === 'Good Standing' || status === 'REGULAR') return 'وضع جيد';
                if (status === 'ON_PROBATION' || status === 'Probation') return 'إنذار أكاديمي';
                if (status === 'SUSPENDED') return 'موقوف';
                if (status === 'GRADUATED') return 'متخرج';
                return status;
              })(),
              total_credits_required: studentData.total_required_credits || studentData.total_credits_required || studentData.totalRequiredCredits || studentData.program?.total_credits || 132,
              credits_earned: apiData.summary?.total_credits || studentData.credits_earned || studentData.completed_credits || studentData.completedCredits || 0,
              expected_graduation: studentData.expected_graduation || studentData.expectedGraduation || '',
            },
            program: {
              name_en: studentData.program?.name_en || apiData.program?.name_en || studentData.program_name || '',
              name_ar: studentData.program?.name_ar || apiData.program?.name_ar || studentData.program_name_ar || '',
              degree: studentData.program?.degree || apiData.program?.degree || studentData.degree || 'Bachelor',
              department: studentData.program?.department?.nameEn || studentData.program?.department?.name_en || studentData.department?.name_en || apiData.department?.name_en || studentData.department_name || studentData.department || '',
              department_ar: studentData.program?.department?.nameAr || studentData.program?.department?.name_ar || studentData.department?.name_ar || apiData.department?.name_ar || studentData.department_name_ar || '',
              college: studentData.program?.department?.college?.nameEn || studentData.program?.department?.college?.name_en || studentData.college?.name_en || studentData.faculty?.name_en || apiData.college?.name_en || studentData.college_name || studentData.college || '',
              college_ar: studentData.program?.department?.college?.nameAr || studentData.program?.department?.college?.name_ar || studentData.college?.name_ar || studentData.faculty?.name_ar || apiData.college?.name_ar || studentData.college_name_ar || '',
            },
            semesters: semestersArray.map((sem: any) => {
              const semesterInfo = sem.semester || sem;
              const courses = sem.courses || gradesBySemester[semesterInfo.id] || [];

              // Calculate semester GPA from courses
              let totalPoints = 0;
              let totalCredits = 0;
              courses.forEach((c: any) => {
                const credits = c.credits || c.credit_hours || 3;
                const points = c.grade_points || c.points || 0;
                totalCredits += credits;
                totalPoints += points * credits;
              });
              const calculatedGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

              return {
                id: semesterInfo.id,
                name: semesterInfo.name_en || semesterInfo.name,
                name_ar: semesterInfo.name_ar || semesterInfo.name,
                academic_year: semesterInfo.academic_year || semesterInfo.year || '',
                gpa: sem.semester_gpa || calculatedGPA || 0,
                courses: courses.map((course: any) => ({
                  code: course.code || course.course_code || course.course?.code,
                  name_en: course.name_en || course.course_name_en || course.course?.name_en || course.name,
                  name_ar: course.name_ar || course.course_name_ar || course.course?.name_ar || course.name,
                  credits: course.credits || course.credit_hours || course.course?.credits || 3,
                  grade: course.grade || course.letter_grade || '-',
                  points: course.grade_points || (course.points ? (course.points / (course.credits || 1)) : 0),
                  passed: !['F', 'D-', 'W', 'I'].includes(course.grade || course.letter_grade || ''),
                  coursework: course.coursework || course.assignments_score || 0,
                  midterm: course.midterm || course.midterm_score || 0,
                  final: course.final || course.final_score || 0,
                  total: course.total || course.total_score || ((course.coursework || 0) + (course.midterm || 0) + (course.final || 0)),
                })),
                total_credits: sem.semester_credits || totalCredits || 0,
                earned_credits: sem.earned_credits || totalCredits || 0,
              };
            }),
          };
          setTranscriptData(transformedData);
        } else if (!isStaff) {
          // No data found for student
          setError(lang === 'ar' ? 'لا توجد بيانات أكاديمية متاحة' : 'No academic data available');
        }

        if (reportCardsResponse) {
          setReportCards(reportCardsResponse.report_cards || []);
        }
      } catch {
        setError(lang === 'ar' ? 'خطأ في تحميل البيانات من الخادم' : 'Error loading data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStudent, isStaff, lang]);

  // Staff: Fetch all students
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!isStaff) return;
      try {
        const studentsRes = await studentsAPI.getAll({ per_page: 100 });
        const students = studentsRes.data || studentsRes || [];
        setStudentList(students);

        // Calculate stats - only count students with actual GPA data
        let totalGPA = 0;
        let highGPA = 0;
        let lowGPA = 0;
        let studentsWithGPA = 0;

        students.forEach((s: any) => {
          const gpa = parseFloat(s.gpa) || parseFloat(s.cumulative_gpa) || 0;
          if (gpa > 0) {
            studentsWithGPA++;
            totalGPA += gpa;
            if (gpa >= 3.5) highGPA++;
            if (gpa < 2.0) lowGPA++;
          }
        });

        setAllTranscriptStats({
          totalStudents: students.length,
          averageGPA: studentsWithGPA > 0 ? totalGPA / studentsWithGPA : 0,
          highGPAStudents: highGPA,
          lowGPAStudents: lowGPA,
        });
      } catch {
        // Silently fail - staff data is optional
      }
    };
    fetchStaffData();
  }, [isStaff]);

  // Staff: Search students
  useEffect(() => {
    const searchStudents = async () => {
      if (!isStaff || !studentSearch.trim()) return;
      setSearchLoading(true);
      try {
        const res = await studentsAPI.getAll({ search: studentSearch, per_page: 20 });
        setStudentList(res.data || res || []);
      } catch {
        // Silently fail - search failed
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [studentSearch, isStaff]);

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
    } catch {
      // Download failed
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadFullTranscript = async () => {
    if (!transcriptData) return;
    setDownloadingFull(true);
    try {
      // Use transcriptData directly since local variables are defined later
      const studentData = transcriptData.student;
      const programData = transcriptData.program;
      const semestersData = transcriptData.semesters;
      const currentDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Generate a full transcript PDF locally since we have all the data
      const printContent = `
        <!-- Student Information Card -->
        <div class="content-section" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px;">
          <h3 class="section-title" style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            ${lang === 'ar' ? 'بيانات الطالب' : 'Student Information'}
          </h3>
          <div class="info-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
            <div class="info-item">
              <label style="font-size: 11px; color: #64748b; text-transform: uppercase;">${lang === 'ar' ? 'الاسم' : 'Full Name'}</label>
              <span style="font-size: 16px; font-weight: 600; color: #1e293b;">${lang === 'ar' ? studentData.name_ar : studentData.name_en}</span>
            </div>
            <div class="info-item">
              <label style="font-size: 11px; color: #64748b; text-transform: uppercase;">${lang === 'ar' ? 'الرقم الجامعي' : 'Student ID'}</label>
              <span style="font-size: 16px; font-weight: 600; color: #3b82f6;">${studentData.student_id}</span>
            </div>
            <div class="info-item">
              <label style="font-size: 11px; color: #64748b; text-transform: uppercase;">${lang === 'ar' ? 'البرنامج' : 'Program'}</label>
              <span style="font-size: 14px; font-weight: 500; color: #1e293b;">${lang === 'ar' ? programData.name_ar : programData.name_en}</span>
            </div>
            <div class="info-item">
              <label style="font-size: 11px; color: #64748b; text-transform: uppercase;">${lang === 'ar' ? 'المستوى الحالي' : 'Current Level'}</label>
              <span style="font-size: 14px; font-weight: 500; color: #1e293b;">${studentData.level}</span>
            </div>
          </div>
        </div>

        <!-- Academic Summary Box -->
        <div class="content-section" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin-top: 20px;">
          <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <div style="font-size: 32px; font-weight: bold; color: ${safeGetGPAColor(studentData.gpa)};">${safeFormatGPA(studentData.gpa)}</div>
              <div style="font-size: 12px; color: #64748b;">${lang === 'ar' ? 'المعدل التراكمي' : 'Cumulative GPA'}</div>
              <div style="font-size: 10px; color: #94a3b8;">${lang === 'ar' ? 'من 4.00' : 'out of 4.00'}</div>
            </div>
            <div style="border-left: 2px solid #86efac; padding-left: 30px;">
              <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${studentData.credits_earned}</div>
              <div style="font-size: 12px; color: #64748b;">${lang === 'ar' ? 'الساعات المكتسبة' : 'Credits Earned'}</div>
              <div style="font-size: 10px; color: #94a3b8;">${lang === 'ar' ? `من ${studentData.total_credits_required}` : `of ${studentData.total_credits_required}`}</div>
            </div>
            <div style="border-left: 2px solid #86efac; padding-left: 30px;">
              <div style="font-size: 18px; font-weight: bold; color: #059669; padding: 8px 16px; background: #d1fae5; border-radius: 20px;">${lang === 'ar' ? studentData.academic_standing_ar : studentData.academic_standing}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 5px;">${lang === 'ar' ? 'الحالة الأكاديمية' : 'Academic Standing'}</div>
            </div>
          </div>
        </div>

        <!-- Semester Records -->
        ${semestersData.map((semester, idx) => `
          <div class="content-section" style="margin-top: 25px; page-break-inside: avoid;">
            <h3 class="section-title" style="background: #1e40af; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
              ${lang === 'ar' ? semester.name_ar : semester.name} - ${semester.academic_year}
              <span style="float: ${lang === 'ar' ? 'left' : 'right'}; font-size: 14px; background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 10px;">
                GPA: ${safeFormatGPA(semester.gpa)}
              </span>
            </h3>
            <table class="data-table" style="border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="width: 12%;">${lang === 'ar' ? 'الرمز' : 'Code'}</th>
                  <th style="width: 28%;">${lang === 'ar' ? 'اسم المساق' : 'Course Name'}</th>
                  <th class="center" style="width: 8%;">${lang === 'ar' ? 'س.م' : 'CR'}</th>
                  <th class="center" style="width: 10%;">${lang === 'ar' ? 'أعمال' : 'CW'}</th>
                  <th class="center" style="width: 10%;">${lang === 'ar' ? 'نصفي' : 'Mid'}</th>
                  <th class="center" style="width: 10%;">${lang === 'ar' ? 'نهائي' : 'Final'}</th>
                  <th class="center" style="width: 10%;">${lang === 'ar' ? 'المجموع' : 'Total'}</th>
                  <th class="center" style="width: 12%;">${lang === 'ar' ? 'التقدير' : 'Grade'}</th>
                </tr>
              </thead>
              <tbody>
                ${semester.courses.map((course: any, cIdx: number) => `
                  <tr style="background: ${cIdx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                    <td style="font-weight: 600; color: #3b82f6;">${course.code}</td>
                    <td>${lang === 'ar' ? course.name_ar : course.name_en}</td>
                    <td class="center">${course.credits}</td>
                    <td class="center">${course.coursework || '-'}</td>
                    <td class="center">${course.midterm || '-'}</td>
                    <td class="center">${course.final || '-'}</td>
                    <td class="center" style="font-weight: bold;">${course.total || '-'}</td>
                    <td class="center">
                      <span style="font-weight: bold; padding: 3px 8px; border-radius: 4px; background: ${
                        course.grade.startsWith('A') ? '#d1fae5' :
                        course.grade.startsWith('B') ? '#dbeafe' :
                        course.grade.startsWith('C') ? '#fef3c7' : '#fee2e2'
                      }; color: ${
                        course.grade.startsWith('A') ? '#059669' :
                        course.grade.startsWith('B') ? '#2563eb' :
                        course.grade.startsWith('C') ? '#d97706' : '#dc2626'
                      };">${course.grade}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background: #f1f5f9; font-weight: bold;">
                  <td colspan="2" style="text-align: ${lang === 'ar' ? 'right' : 'left'};">${lang === 'ar' ? 'مجموع الفصل' : 'Semester Total'}</td>
                  <td class="center">${semester.total_credits}</td>
                  <td colspan="4"></td>
                  <td class="center" style="color: #1e40af; font-size: 14px;">${safeFormatGPA(semester.gpa)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        `).join('')}

        <!-- Footer with Signature Area -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #cbd5e1; margin-bottom: 5px; height: 40px;"></div>
              <div style="font-size: 11px; color: #64748b;">${lang === 'ar' ? 'توقيع المسجل' : 'Registrar Signature'}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 11px; color: #64748b;">${lang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</div>
              <div style="font-weight: 600; color: #1e293b;">${currentDate}</div>
            </div>
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #cbd5e1; margin-bottom: 5px; height: 40px;"></div>
              <div style="font-size: 11px; color: #64748b;">${lang === 'ar' ? 'الختم الرسمي' : 'Official Stamp'}</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #94a3b8;">
            ${lang === 'ar'
              ? 'هذه الوثيقة صادرة إلكترونياً وتعتبر صالحة بدون توقيع أو ختم'
              : 'This document is electronically generated and is valid without signature or stamp'}
          </div>
        </div>
      `;

      // Use the exportToPDF function to generate the transcript
      exportToPDF(
        'Official Academic Transcript',
        printContent,
        `transcript_${studentData.student_id}`,
        lang,
        'السجل الأكاديمي الرسمي'
      );
    } catch {
      // Generation failed
    } finally {
      setDownloadingFull(false);
    }
  };

  const handlePrint = () => {
    if (!transcriptData) return;
    // Use transcriptData directly since local variables are defined later
    const studentData = transcriptData.student;
    const programData = transcriptData.program;
    const semestersData = transcriptData.semesters;

    // Create a printable version with all transcript data
    const printContent = `
      <div class="content-section">
        <h3 class="section-title">${lang === 'ar' ? 'بيانات الطالب' : 'Student Information'}</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>${lang === 'ar' ? 'الاسم' : 'Name'}</label>
            <span>${lang === 'ar' ? studentData.name_ar : studentData.name_en}</span>
          </div>
          <div class="info-item">
            <label>${lang === 'ar' ? 'الرقم الجامعي' : 'Student ID'}</label>
            <span>${studentData.student_id}</span>
          </div>
          <div class="info-item">
            <label>${lang === 'ar' ? 'البرنامج' : 'Program'}</label>
            <span>${lang === 'ar' ? programData.name_ar : programData.name_en}</span>
          </div>
          <div class="info-item">
            <label>${lang === 'ar' ? 'المعدل التراكمي' : 'GPA'}</label>
            <span style="color: ${safeGetGPAColor(studentData.gpa)}; font-weight: bold;">${safeFormatGPA(studentData.gpa)}</span>
          </div>
        </div>
      </div>
      ${semestersData.map(semester => `
        <div class="content-section">
          <h3 class="section-title">${lang === 'ar' ? semester.name_ar : semester.name} (${semester.academic_year})</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>${lang === 'ar' ? 'رمز المساق' : 'Code'}</th>
                <th>${lang === 'ar' ? 'اسم المساق' : 'Course'}</th>
                <th class="center">${lang === 'ar' ? 'الساعات المعتمدة' : 'Credits'}</th>
                <th class="center">${lang === 'ar' ? 'أعمال الفصل (20)' : 'Coursework'}</th>
                <th class="center">${lang === 'ar' ? 'النصفي (40)' : 'Midterm'}</th>
                <th class="center">${lang === 'ar' ? 'النهائي (40)' : 'Final'}</th>
                <th class="center">${lang === 'ar' ? 'المجموع' : 'Total'}</th>
                <th class="center">${lang === 'ar' ? 'التقدير' : 'Grade'}</th>
              </tr>
            </thead>
            <tbody>
              ${semester.courses.map((course: any) => `
                <tr>
                  <td>${course.code}</td>
                  <td>${lang === 'ar' ? course.name_ar : course.name_en}</td>
                  <td class="center">${course.credits}</td>
                  <td class="center">${course.coursework || '-'}</td>
                  <td class="center">${course.midterm || '-'}</td>
                  <td class="center">${course.final || '-'}</td>
                  <td class="center" style="font-weight: bold;">${course.total || '-'}</td>
                  <td class="center" style="font-weight: bold; color: ${course.grade.startsWith('A') ? '#059669' : course.grade.startsWith('B') ? '#3b82f6' : '#d97706'};">${course.grade}</td>
                </tr>
              `).join('')}
              <tr style="background: #f1f5f9; font-weight: bold;">
                <td colspan="2">${lang === 'ar' ? 'معدل الفصل' : 'Semester GPA'}</td>
                <td class="center">${semester.total_credits}</td>
                <td class="center" colspan="4"></td>
                <td class="center">${safeFormatGPA(semester.gpa)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `).join('')}
      <div class="content-section">
        <div class="info-grid">
          <div class="info-item">
            <label>${lang === 'ar' ? 'إجمالي الساعات المكتسبة' : 'Total Credits Earned'}</label>
            <span>${studentData.credits_earned}</span>
          </div>
          <div class="info-item">
            <label>${lang === 'ar' ? 'المعدل التراكمي النهائي' : 'Cumulative GPA'}</label>
            <span style="font-size: 18px; color: ${safeGetGPAColor(studentData.gpa)}; font-weight: bold;">${safeFormatGPA(studentData.gpa)}</span>
          </div>
        </div>
      </div>
    `;

    // Use the exportToPDF function with the generated content
    exportToPDF(
      'Academic Transcript',
      printContent,
      `transcript_${studentData.student_id}`,
      lang,
      'السجل الأكاديمي'
    );
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getGPAColor = (gpa: number | string) => {
    const numGpa = Number(gpa) || 0;
    if (numGpa >= 3.5) return 'text-green-600';
    if (numGpa >= 3.0) return 'text-blue-600';
    if (numGpa >= 2.5) return 'text-yellow-600';
    if (numGpa >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  // Helper to safely format GPA values
  const formatGPA = (gpa: number | string | undefined | null): string => {
    if (gpa === undefined || gpa === null) return '0.00';
    const numGpa = Number(gpa);
    return isNaN(numGpa) ? '0.00' : numGpa.toFixed(2);
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

  if (error && !isStaff) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const student = transcriptData?.student;
  const program = transcriptData?.program;
  const semesters = transcriptData?.semesters || [];

  return (
    <div className={`p-4 md:p-6 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Staff Header Banner */}
      {isStaff && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {lang === 'ar' ? 'إدارة السجلات الأكاديمية' : 'Academic Records Management'}
              </h1>
              <p className="text-emerald-100 mt-1">
                {lang === 'ar' ? 'عرض وإدارة سجلات الطلاب الأكاديمية' : 'View and manage student academic records'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{allTranscriptStats.totalStudents}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{allTranscriptStats.averageGPA.toFixed(2)}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'متوسط المعدل' : 'Avg GPA'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-300">{allTranscriptStats.highGPAStudents}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'معدل عالي' : 'High GPA'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-300">{allTranscriptStats.lowGPAStudents}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'معدل منخفض' : 'Low GPA'}</p>
              </div>
            </div>
          </div>

          {/* Student Search */}
          <div className="mt-4 relative">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <Search className="w-5 h-5 text-emerald-200" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن طالب بالاسم أو الرقم الجامعي...' : 'Search student by name or ID...'}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-emerald-200 outline-none"
              />
              {searchLoading && (
                <div className="w-5 h-5 border-2 border-emerald-200 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {studentSearch && studentList.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto z-50">
                {studentList.map((student: any) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setStudentSearch('');
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {(student.name || student.name_en || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{student.name || student.name_en || student.name_ar}</p>
                      <p className="text-sm text-slate-500">{student.student_id || student.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Student */}
          {selectedStudent && (
            <div className="mt-4 bg-white/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-xl">
                  {(selectedStudent.name || selectedStudent.name_en || 'S').charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{selectedStudent.name || selectedStudent.name_en || selectedStudent.name_ar}</p>
                  <p className="text-sm text-emerald-100">
                    {lang === 'ar' ? 'الرقم الجامعي: ' : 'Student ID: '}{selectedStudent.student_id || selectedStudent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header - Student View */}
      {!isStaff && (
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
      )}

      {/* No Data Message */}
      {!transcriptData && !loading && !error && (
        <div className="p-4 rounded-xl flex items-center gap-3 bg-blue-50 text-blue-800 border border-blue-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {lang === 'ar' ? 'لا توجد بيانات' : 'No Data Available'}
            </p>
            <p className="text-sm text-blue-600">
              {lang === 'ar'
                ? 'لا توجد سجلات أكاديمية متاحة حالياً.'
                : 'No academic records are currently available.'}
            </p>
          </div>
        </div>
      )}

      {/* Program Info & Academic Summary */}
      {student && program && (
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* المعدل التراكمي من 100 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${getGPAColor(student.gpa)}`}>
                {Math.round((Number(student.gpa) / 4) * 100)}
              </div>
              <div className="text-sm text-slate-600 mt-1">{lang === 'ar' ? 'المعدل التراكمي' : 'Cumulative GPA'}</div>
              <div className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'من 100' : 'out of 100'}</div>
            </div>

            {/* الساعات التي تم دراستها */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {(student.credits_earned || 0) + (semesters[0]?.total_credits || 0)}
              </div>
              <div className="text-sm text-slate-600 mt-1">{lang === 'ar' ? 'ساعات مدروسة' : 'Studied Hours'}</div>
              <div className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'ساعة' : 'credits'}</div>
            </div>

            {/* الساعات التي تم اعتمادها */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {student.credits_earned || 0}
              </div>
              <div className="text-sm text-slate-600 mt-1">{lang === 'ar' ? 'ساعات معتمدة' : 'Earned Credits'}</div>
              <div className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'ساعة' : 'credits'}</div>
            </div>

            {/* الساعات المتبقية */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {(student.total_credits_required || 0) - (student.credits_earned || 0)}
              </div>
              <div className="text-sm text-slate-600 mt-1">{lang === 'ar' ? 'ساعات متبقية' : 'Remaining'}</div>
              <div className="text-xs text-slate-500 mt-1">/ {student.total_credits_required || 0} {lang === 'ar' ? 'ساعة' : 'credits'}</div>
            </div>

            {/* الحالة الأكاديمية */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-purple-600">
                {student.academic_standing === 'Good Standing' || !student.academic_standing ? (lang === 'ar' ? 'نظامي' : 'Regular') :
                 student.academic_standing === 'Bridging' ? (lang === 'ar' ? 'تجسير' : 'Bridging') :
                 student.academic_standing === 'Deferred' ? (lang === 'ar' ? 'مؤجل' : 'Deferred') :
                 student.academic_standing === 'Probation' ? (lang === 'ar' ? 'إنذار أكاديمي' : 'Probation') :
                 student.academic_standing === 'Suspended' ? (lang === 'ar' ? 'موقوف' : 'Suspended') :
                 student.academic_standing === 'Graduated' ? (lang === 'ar' ? 'متخرج' : 'Graduated') :
                 (lang === 'ar' ? 'نظامي' : 'Regular')}
              </div>
              <div className="text-sm text-slate-600 mt-1">{lang === 'ar' ? 'الحالة الأكاديمية' : 'Academic Status'}</div>
              <div className="text-xs text-slate-500 mt-1">{lang === 'ar' ? 'المستوى' : 'Level'} {student.level}</div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Semester Records */}
      {transcriptData && (
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
                      <div className={isRTL ? 'text-end' : 'text-start'}>
                        <h3 className="font-semibold text-slate-800">
                          {lang === 'ar' ? semester.name_ar : semester.name}
                        </h3>
                        <p className="text-sm text-slate-500">{semester.academic_year}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`hidden md:block ${isRTL ? 'text-start' : 'text-end'}`}>
                        <div className={`text-lg font-bold ${getGPAColor(semester.gpa)}`}>
                          {Math.round((Number(semester.gpa) / 4) * 100)}%
                        </div>
                        <div className="text-xs text-slate-500">{t.semesterGPA[lang]}</div>
                      </div>
                      <div className={`hidden md:block ${isRTL ? 'text-start' : 'text-end'}`}>
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
                            {Math.round((Number(semester.gpa) / 4) * 100)}%
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
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-start">
                                  {t.courseCode[lang]}
                                </th>
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-start">
                                  {t.courseName[lang]}
                                </th>
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.semesterCol[lang]}
                                </th>
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.credits[lang]}
                                </th>
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.coursework[lang]}
                                </th>
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.midterm[lang]}
                                </th>
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.final[lang]}
                                </th>
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.total[lang]}
                                </th>
                                <th className="px-3 py-3 text-sm font-medium text-slate-600 text-center">
                                  {t.grade[lang]}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {semester.courses.map((course: any, idx: number) => (
                                <tr key={idx} className="bg-white hover:bg-slate-50">
                                  <td className="px-3 py-3 text-sm font-medium text-slate-800">
                                    {course.code}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-slate-600">
                                    {lang === 'ar' ? course.name_ar : course.name_en}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-slate-600 text-center">
                                    {lang === 'ar' ? semester.name_ar : semester.name}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-slate-600 text-center">
                                    {course.credits}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-slate-600 text-center">
                                    {course.coursework || '-'}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-slate-600 text-center">
                                    {course.midterm || '-'}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-slate-600 text-center">
                                    {course.final || '-'}
                                  </td>
                                  <td className="px-3 py-3 text-sm font-medium text-slate-800 text-center">
                                    {course.total || '-'}
                                  </td>
                                  <td className="px-3 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getGradeColor(course.grade)}`}>
                                      {course.grade}
                                    </span>
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
      )}

      {/* GPA Trend Chart Placeholder */}
      {transcriptData && semesters.length > 0 && (
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
                <div className="text-xs font-medium text-slate-600">{Math.round((Number(semester.gpa) / 4) * 100)}%</div>
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
      )}
    </div>
  );
};

export default TranscriptPage;

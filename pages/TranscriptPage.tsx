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
import { exportToPDF } from '../utils/exportUtils';

interface TranscriptPageProps {
  lang: 'en' | 'ar';
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
  semesterRecords: { en: 'Semester Records', ar: 'سجلات الفصول' },
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
        { code: 'CS301', name_en: 'Data Structures', name_ar: 'هياكل البيانات', credits: 3, grade: 'A', points: 4.0, passed: true, coursework: 18, midterm: 36, final: 38, total: 92 },
        { code: 'CS302', name_en: 'Algorithms', name_ar: 'الخوارزميات', credits: 3, grade: 'A-', points: 3.7, passed: true, coursework: 17, midterm: 35, final: 36, total: 88 },
        { code: 'CS303', name_en: 'Database Systems', name_ar: 'أنظمة قواعد البيانات', credits: 3, grade: 'B+', points: 3.3, passed: true, coursework: 16, midterm: 32, final: 35, total: 83 },
        { code: 'MATH301', name_en: 'Linear Algebra', name_ar: 'الجبر الخطي', credits: 3, grade: 'B', points: 3.0, passed: true, coursework: 15, midterm: 30, final: 32, total: 77 },
        { code: 'ENG301', name_en: 'Technical Writing', name_ar: 'الكتابة الفنية', credits: 2, grade: 'A', points: 4.0, passed: true, coursework: 19, midterm: 38, final: 37, total: 94 },
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
        { code: 'CS201', name_en: 'Object-Oriented Programming', name_ar: 'البرمجة الكائنية', credits: 3, grade: 'A-', points: 3.7, passed: true, coursework: 17, midterm: 35, final: 36, total: 88 },
        { code: 'CS202', name_en: 'Computer Networks', name_ar: 'شبكات الحاسب', credits: 3, grade: 'B+', points: 3.3, passed: true, coursework: 16, midterm: 33, final: 34, total: 83 },
        { code: 'CS203', name_en: 'Operating Systems', name_ar: 'أنظمة التشغيل', credits: 3, grade: 'B+', points: 3.3, passed: true, coursework: 16, midterm: 32, final: 35, total: 83 },
        { code: 'MATH201', name_en: 'Calculus II', name_ar: 'التفاضل والتكامل 2', credits: 3, grade: 'B', points: 3.0, passed: true, coursework: 15, midterm: 30, final: 32, total: 77 },
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
        { code: 'CS101', name_en: 'Introduction to Programming', name_ar: 'مقدمة في البرمجة', credits: 3, grade: 'A', points: 4.0, passed: true, coursework: 18, midterm: 38, final: 36, total: 92 },
        { code: 'CS102', name_en: 'Computer Fundamentals', name_ar: 'أساسيات الحاسب', credits: 3, grade: 'B+', points: 3.3, passed: true, coursework: 16, midterm: 33, final: 34, total: 83 },
        { code: 'MATH101', name_en: 'Calculus I', name_ar: 'التفاضل والتكامل 1', credits: 3, grade: 'B', points: 3.0, passed: true, coursework: 14, midterm: 30, final: 33, total: 77 },
        { code: 'PHY101', name_en: 'Physics I', name_ar: 'الفيزياء 1', credits: 3, grade: 'B-', points: 2.7, passed: true, coursework: 13, midterm: 28, final: 32, total: 73 },
        { code: 'ENG101', name_en: 'English I', name_ar: 'اللغة الإنجليزية 1', credits: 2, grade: 'A-', points: 3.7, passed: true, coursework: 17, midterm: 35, final: 36, total: 88 },
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
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

  const isRTL = lang === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setIsUsingFallbackData(false);

      try {
        // Try to fetch from API
        const [transcriptResponse, reportCardsResponse] = await Promise.all([
          studentsAPI.getMyTranscript().catch(() => null),
          reportCardAPI.getMyReportCards().catch(() => null),
        ]);

        if (transcriptResponse && transcriptResponse.student) {
          // Transform API response to match UI expected structure
          const apiData = transcriptResponse;
          const transformedData = {
            student: {
              id: apiData.student?.id,
              student_id: apiData.student?.student_id,
              name_en: apiData.student?.name_en,
              name_ar: apiData.student?.name_ar,
              level: apiData.student?.level || 1,
              gpa: apiData.summary?.cumulative_gpa || 0,
              academic_standing: apiData.summary?.academic_standing || 'Good Standing',
              academic_standing_ar: apiData.summary?.academic_standing === 'Good Standing' ? 'وضع جيد' : apiData.summary?.academic_standing,
              total_credits_required: apiData.student?.total_credits_required || 132,
              credits_earned: apiData.summary?.total_credits || 0,
              expected_graduation: apiData.student?.expected_graduation || '',
            },
            program: {
              name_en: apiData.student?.program?.name_en || 'Bachelor Program',
              name_ar: apiData.student?.program?.name_ar || 'برنامج البكالوريوس',
              degree: 'Bachelor',
              department: apiData.student?.department?.name_en || '',
              department_ar: apiData.student?.department?.name_ar || '',
              college: '',
              college_ar: '',
            },
            semesters: (apiData.semesters || []).map((sem: any) => ({
              id: sem.semester?.id,
              name: sem.semester?.name_en || sem.semester?.name,
              name_ar: sem.semester?.name_ar || sem.semester?.name,
              academic_year: sem.semester?.year || '',
              gpa: sem.semester_gpa || 0,
              courses: (sem.courses || []).map((course: any) => ({
                code: course.code,
                name_en: course.name_en,
                name_ar: course.name_ar,
                credits: course.credits,
                grade: course.grade,
                points: course.points / (course.credits || 1), // Convert total points to GPA points
                passed: !['F', 'D-'].includes(course.grade),
                coursework: course.coursework || 0,
                midterm: course.midterm || 0,
                final: course.final || 0,
                total: course.total || (course.coursework || 0) + (course.midterm || 0) + (course.final || 0),
              })),
              total_credits: sem.semester_credits || 0,
              earned_credits: sem.semester_credits || 0,
            })),
          };
          setTranscriptData(transformedData);
          setIsUsingFallbackData(false);
        } else {
          // Using fallback data
          setIsUsingFallbackData(true);
        }

        if (reportCardsResponse) {
          setReportCards(reportCardsResponse.report_cards || []);
        }
      } catch (err) {
        console.error('Error fetching transcript data:', err);
        // Use default data on error
        setIsUsingFallbackData(true);
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
    } catch (err) {
      console.error('Error generating full transcript:', err);
    } finally {
      setDownloadingFull(false);
    }
  };

  const handlePrint = () => {
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

      {/* Fallback Data Warning */}
      {isUsingFallbackData && (
        <div className="p-4 rounded-xl flex items-center gap-3 bg-amber-50 text-amber-800 border border-amber-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {lang === 'ar' ? 'بيانات تجريبية' : 'Demo Data'}
            </p>
            <p className="text-sm text-amber-600">
              {lang === 'ar'
                ? 'هذه البيانات تجريبية للعرض فقط. سيتم عرض بياناتك الحقيقية عند الاتصال بالخادم.'
                : 'This is demo data for display purposes. Your real data will be shown when connected to the server.'}
            </p>
          </div>
        </div>
      )}

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
                {formatGPA(student.gpa)}
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
                          {formatGPA(semester.gpa)}
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
                            {formatGPA(semester.gpa)}
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
                <div className="text-xs font-medium text-slate-600">{formatGPA(semester.gpa)}</div>
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

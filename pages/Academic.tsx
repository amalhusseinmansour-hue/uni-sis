
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  CheckCircle, PlusCircle, XCircle, Clock, Award, Filter, X, Search,
  User, FileText, Plus, AlertCircle, BookOpen, Calendar, Target,
  TrendingUp, Download, Eye, ChevronRight, GraduationCap, MapPin,
  Users, Star, Info, CheckSquare, Square, Layers, BarChart2
} from 'lucide-react';
import { Course, ServiceRequest } from '../types';
import { TRANSLATIONS, VERTEX_GRADE_SCALE, gradeToPoints, getGradeLabel, getGradeColor, isGradeExcluded } from '../constants';
import { studentsAPI } from '../api/students';
import { coursesAPI } from '../api/courses';
import { enrollmentsAPI } from '../api/enrollments';
import { lmsAPI } from '../api/lms';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Modal, { ConfirmDialog } from '../components/ui/Modal';
import Input, { Select, SearchInput, Textarea } from '../components/ui/Input';
import { generateTranscriptPDF, GradeRecord, StudentInfo } from '../utils/exportUtils';

interface AcademicProps {
  lang: 'en' | 'ar';
}

const Academic: React.FC<AcademicProps> = ({ lang }) => {
  const t = TRANSLATIONS;
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'record' | 'grades' | 'plan'>('record');

  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string>('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  // Cart functionality removed - students can only view enrolled courses
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradesSemesterFilter, setGradesSemesterFilter] = useState<string>('current'); // 'all', 'current', or semester name
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>(''); // Search by course code

  // Request form state
  const [requestType, setRequestType] = useState<string>('');
  const [requestDetails, setRequestDetails] = useState<string>('');
  const [selectedCoursesForRequest, setSelectedCoursesForRequest] = useState<string[]>([]);
  const [requestReason, setRequestReason] = useState<string>('');

  // Student profile data
  const [student, setStudent] = useState<any>(null);

  // Real study plan data from API
  const [realStudyPlan, setRealStudyPlan] = useState<any[]>([]);
  const [studyPlanLoading, setStudyPlanLoading] = useState(false);
  const [programInfo, setProgramInfo] = useState<any>(null);

  // Active semesters from admin module
  const [activeSemesters, setActiveSemesters] = useState<any[]>([]);

  // LMS Grades
  const [lmsGrades, setLmsGrades] = useState<any[]>([]);
  const [lmsLoading, setLmsLoading] = useState(false);

  // LMS Courses
  const [lmsCourses, setLmsCourses] = useState<any[]>([]);
  const [lmsCoursesLoading, setLmsCoursesLoading] = useState(false);
  const [coursesSource, setCoursesSource] = useState<'SIS' | 'LMS'>('SIS');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        try {
          const profile = await studentsAPI.getMyProfile();
          setStudentId(profile.student?.id || profile.id);
          setStudent({ ...profile.student || profile, postponementCount: profile.postponementCount || 0 });

          const [enrollmentsData, gradesData] = await Promise.all([
            studentsAPI.getEnrollments(profile.student?.id || profile.id).catch(() => []),
            studentsAPI.getGrades(profile.student?.id || profile.id).catch(() => []),
          ]);

          // Map enrollments with semester info
          const enrollmentsList = enrollmentsData.data || enrollmentsData || [];
          const mappedEnrollments = enrollmentsList.map((e: any) => {
            const semesterObj = e.semester_record || e.semesterRecord || e.semester;
            return {
              ...e,
              semester_id: e.semester_id,
              semester: typeof semesterObj === 'object' ? semesterObj : null,
              semester_name: typeof semesterObj === 'object' ? (semesterObj?.name || semesterObj?.name_en) : (e.semester_name || e.semester || semesterObj),
              academic_year: typeof semesterObj === 'object' ? semesterObj?.academic_year : e.academic_year,
            };
          });

          setMyCourses(mappedEnrollments);
          setGrades(gradesData.data || gradesData || []);

          // Fetch LMS grades
          try {
            setLmsLoading(true);
            const lmsData = await lmsAPI.getMyLmsGrades();
            if (lmsData.success) {
              setLmsGrades(lmsData.data || []);
            }
          } catch (lmsError) {
            // LMS grades not available - silently continue
          } finally {
            setLmsLoading(false);
          }

          // Fetch LMS courses
          try {
            setLmsCoursesLoading(true);
            const lmsCoursesData = await lmsAPI.getMyLmsCourses();
            if (lmsCoursesData.success && lmsCoursesData.data.length > 0) {
              setLmsCourses(lmsCoursesData.data);
              setCoursesSource(lmsCoursesData.source);
            }
          } catch (lmsCoursesError) {
            // LMS courses not available - silently continue
          } finally {
            setLmsCoursesLoading(false);
          }

          // Fetch study plan if student has a program
          const studentData = profile.student || profile;
          const programId = studentData.program_id || studentData.program?.id;
          if (programId) {
            setStudyPlanLoading(true);
            try {
              const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || '';
              const token = sessionStorage.getItem('token') || localStorage.getItem('token');
              const response = await fetch(`${baseUrl}/programs-courses.php?program_id=${programId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              const data = await response.json();
              if (data.success) {
                // Store program info
                if (data.program) {
                  setProgramInfo(data.program);
                }
                // Convert to study plan format
                if (data.by_semester && Object.keys(data.by_semester).length > 0) {
                  const planBySemester = Object.entries(data.by_semester).map(([sem, courses]: [string, any]) => ({
                    semester: parseInt(sem),
                    name: lang === 'ar' ? `الفصل ${sem}` : `Semester ${sem}`,
                    courses: courses.map((c: any) => ({
                      id: c.id,
                      code: c.code,
                      title: lang === 'ar' ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar),
                      cred: c.credits,
                      type: c.type,
                      status: gradesData.data?.find((g: any) => g.course_id === c.id)?.grade ? 'COMPLETED' :
                             enrollmentsList.find((e: any) => e.course_id === c.id) ? 'IN_PROGRESS' : 'NOT_STARTED',
                      grade: gradesData.data?.find((g: any) => g.course_id === c.id)?.grade || '-',
                    }))
                  }));
                  setRealStudyPlan(planBySemester);
                }
              }
            } catch (err) {
              // Error fetching study plan - silently continue
            } finally {
              setStudyPlanLoading(false);
            }
          }

          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          const currentSemester = currentMonth >= 8 ? 'FALL' : currentMonth >= 1 && currentMonth <= 5 ? 'SPRING' : 'SUMMER';
          const coursesData = await coursesAPI.getAvailableSections(currentSemester, currentYear, profile.student?.id || profile.id).catch(() => []);
          setAvailableCourses(coursesData.data || coursesData || []);

          // Fetch current semester from admin module
          try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || '';
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const semestersResponse = await fetch(`${baseUrl}/semesters.php`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const semestersData = await semestersResponse.json();
            if (semestersData.success && semestersData.semesters) {
              // Filter to only the current semester (is_current = true)
              const currentOnly = semestersData.semesters.filter((s: any) => s.is_current);
              setActiveSemesters(currentOnly);
            }
          } catch (err) {
            // Error fetching semesters - silently continue
          }
        } catch (apiError: any) {
          // Error fetching academic data
        }
      } catch (err: any) {
        // Academic fetch error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lang]);

  // Registration filters and cart functions have been removed
  // Students can only view enrolled courses through this page
  // For course registration requests, use the service request modal

  // GPA calculations (using Vertex University grading scale)
  // Filter out excluded grades (I, P, NP, CC, CX, S, AW, W)
  const gpaGrades = grades.filter(g => !isGradeExcluded(g.grade));
  const totalCredits = gpaGrades.reduce((sum, grade) => sum + (grade.credits || 0), 0);
  const totalPoints = gpaGrades.reduce((sum, grade) => {
    const points = grade.points ?? gradeToPoints(grade.grade);
    return sum + (points * (grade.credits || 0));
  }, 0);
  const calculatedGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  // Chart data
  const gradeDistribution = [
    { grade: 'A/A-', count: grades.filter(g => g.grade === 'A' || g.grade === 'A-').length, color: '#22c55e' },
    { grade: 'B+/B', count: grades.filter(g => g.grade === 'B+' || g.grade === 'B').length, color: '#3b82f6' },
    { grade: 'C+/C', count: grades.filter(g => g.grade === 'C+' || g.grade === 'C').length, color: '#f59e0b' },
    { grade: 'D+/D', count: grades.filter(g => g.grade === 'D+' || g.grade === 'D').length, color: '#f97316' },
    { grade: 'F/FA', count: grades.filter(g => g.grade === 'F' || g.grade === 'FA').length, color: '#ef4444' },
  ];

  // Calculate semester GPA from actual grades
  const semesterGPAData = (() => {
    // Group grades by semester
    const semesterMap = new Map<string, { totalPoints: number; totalCredits: number }>();

    gpaGrades.forEach(g => {
      if (!g.semester) return;
      const existing = semesterMap.get(g.semester) || { totalPoints: 0, totalCredits: 0 };
      const points = g.points ?? gradeToPoints(g.grade);
      existing.totalPoints += points * (g.credits || 0);
      existing.totalCredits += g.credits || 0;
      semesterMap.set(g.semester, existing);
    });

    // Convert to array and calculate GPA
    const result = Array.from(semesterMap.entries())
      .filter(([_, data]) => data.totalCredits > 0)
      .map(([semester, data]) => ({
        semester: semester.length > 12 ? semester.substring(0, 12) : semester,
        gpa: parseFloat((data.totalPoints / data.totalCredits).toFixed(2)),
      }))
      .sort((a, b) => {
        // Sort by semester (Fall/Spring + Year)
        const parseOrder = (s: string) => {
          const match = s.match(/(\d{2,4})/);
          const year = match ? parseInt(match[1]) : 0;
          const isFall = s.toLowerCase().includes('fall') || s.includes('خريف');
          const isSpring = s.toLowerCase().includes('spring') || s.includes('ربيع');
          const isSummer = s.toLowerCase().includes('summer') || s.includes('صيف');
          // Fall = 0.3, Summer = 0.2, Spring = 0.1
          const termOrder = isFall ? 0.3 : (isSummer ? 0.2 : 0.1);
          return year + termOrder;
        };
        return parseOrder(a.semester) - parseOrder(b.semester);
      });

    return result;
  })();

  // Use real study plan from admin module
  const studyPlan = realStudyPlan;

  const completedCredits = studyPlan.length > 0
    ? studyPlan.flatMap(s => s.courses).filter(c => c.status === 'COMPLETED').reduce((sum, c) => sum + c.cred, 0)
    : 0;
  const totalRequiredCredits = programInfo?.total_credits || student?.program?.total_credits ||
    (studyPlan.length > 0 ? studyPlan.flatMap(s => s.courses).reduce((sum, c) => sum + c.cred, 0) : 120);

  // Download Transcript Function
  const handleDownloadTranscript = () => {
    // Prepare student info
    const studentInfo: StudentInfo = {
      name: student.name || 'Student',
      nameAr: student.nameAr,
      studentId: studentId || student.studentId || 'N/A',
      major: student.major || 'Computer Science',
      majorAr: student.majorAr || 'علوم الحاسب',
      level: student.level || 3,
      gpa: parseFloat(calculatedGPA),
      totalCredits: totalRequiredCredits,
      completedCredits: completedCredits,
    };

    // Prepare grades data
    const gradesData: GradeRecord[] = grades.map(g => ({
      code: g.code,
      title: g.title,
      semester: g.semester,
      credits: g.credits,
      grade: g.grade,
      points: g.points,
    }));

    // Generate and download PDF
    generateTranscriptPDF(studentInfo, gradesData, lang);
  };

  const tabs = [
    { id: 'record', label: t.myRecord[lang], icon: BookOpen },
    { id: 'grades', label: t.myGrades[lang], icon: Award },
    { id: 'plan', label: t.studyPlan[lang], icon: Target },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium">{lang === 'en' ? 'Loading academic data...' : 'جاري تحميل البيانات الأكاديمية...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lang === 'ar' ? 'الشؤون الأكاديمية' : 'Academic Affairs'}</h1>
          <p className="text-slate-500">{lang === 'ar' ? 'إدارة مساقاتك وسجلك الأكاديمي' : 'Manage your courses and academic record'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-1.5 sm:p-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* My Record Tab */}
      {activeTab === 'record' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <StatCard
              title={lang === 'ar' ? 'المساقات المسجلة' : 'Enrolled Courses'}
              value={myCourses.length.toString()}
              subtitle={lang === 'ar' ? 'هذا الفصل' : 'This semester'}
              icon={BookOpen}
              iconColor="text-blue-600 bg-blue-50"
            />
            <StatCard
              title={lang === 'ar' ? 'الساعات المسجلة' : 'Registered Credits'}
              value={myCourses.reduce((sum, c) => sum + (c.credits || 3), 0).toString()}
              subtitle={lang === 'ar' ? 'ساعة معتمدة' : 'Credit hours'}
              icon={Clock}
              iconColor="text-purple-600 bg-purple-50"
            />
            <StatCard
              title={t.gpa[lang]}
              value={calculatedGPA}
              subtitle={lang === 'ar' ? 'المعدل التراكمي' : 'Cumulative'}
              icon={Award}
              iconColor="text-green-600 bg-green-50"
            />
            <StatCard
              title={lang === 'ar' ? 'نسبة الإنجاز' : 'Progress'}
              value={`${Math.round((completedCredits / totalRequiredCredits) * 100)}%`}
              subtitle={`${completedCredits}/${totalRequiredCredits} ${lang === 'ar' ? 'ساعة' : 'credits'}`}
              icon={Target}
              iconColor="text-orange-600 bg-orange-50"
            />
          </div>

          {/* Search by Course Code */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'البحث برمز المادة...' : 'Search by course code...'}
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
                />
                {courseSearchQuery && (
                  <button
                    onClick={() => setCourseSearchQuery('')}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Current Courses - Current Semester Only */}
          {(() => {
            // Filter enrollments to current semester only
            const currentSemesterName = activeSemesters.length > 0
              ? (lang === 'ar' ? activeSemesters[0].name_ar : activeSemesters[0].name_en)
              : null;

            let filteredCourses = currentSemesterName
              ? myCourses.filter((enrollment: any) => {
                  const semesterName = enrollment.semester_name ||
                                       (enrollment.semester?.name || enrollment.semester?.name_en || enrollment.semester?.name_ar) ||
                                       '';
                  return semesterName === currentSemesterName ||
                         semesterName === activeSemesters[0].name_en ||
                         semesterName === activeSemesters[0].name_ar;
                })
              : myCourses;

            // Filter by course code search
            if (courseSearchQuery.trim()) {
              filteredCourses = filteredCourses.filter((enrollment: any) => {
                const code = (enrollment.code || enrollment.course?.code || '').toLowerCase();
                return code.includes(courseSearchQuery.toLowerCase().trim());
              });
            }

            // Group enrollments by semester
            const enrollmentsBySemester = filteredCourses.reduce((acc: any, enrollment: any) => {
              const semesterName = enrollment.semester_name ||
                                   (enrollment.semester?.name || enrollment.semester?.name_en) ||
                                   (lang === 'ar' ? 'فصل غير محدد' : 'Unknown Semester');
              const academicYear = enrollment.academic_year || enrollment.semester?.academic_year || '';
              const semesterKey = `${semesterName}${academicYear ? ` ${academicYear}` : ''}`;

              if (!acc[semesterKey]) {
                acc[semesterKey] = {
                  name: semesterKey,
                  academicYear,
                  enrollments: [],
                  totalCredits: 0,
                };
              }
              acc[semesterKey].enrollments.push(enrollment);
              acc[semesterKey].totalCredits += enrollment.credits || enrollment.course?.credits || 3;
              return acc;
            }, {});

            const semesterGroups = Object.values(enrollmentsBySemester) as any[];

            if (semesterGroups.length === 0) {
              return (
                <Card>
                  <CardHeader
                    title={lang === 'ar' ? 'المساقات المسجلة حالياً' : 'Currently Enrolled Courses'}
                    icon={BookOpen}
                    iconColor="text-blue-600 bg-blue-50"
                  />
                  <CardBody>
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        {lang === 'ar' ? 'لا توجد مواد مسجلة' : 'No enrolled courses'}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              );
            }

            return semesterGroups.map((group: any, groupIdx: number) => (
              <Card key={groupIdx}>
                <CardHeader
                  title={group.name}
                  subtitle={`${group.totalCredits} ${lang === 'ar' ? 'ساعة معتمدة' : 'credit hours'} • ${group.enrollments.length} ${lang === 'ar' ? 'مواد' : 'courses'}`}
                  icon={Calendar}
                  iconColor="text-blue-600 bg-blue-50"
                />
                <CardBody noPadding>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                    {group.enrollments.map((course: any) => (
                      <div
                        key={course.id}
                        className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => { setSelectedCourse(course); setShowCourseModal(true); }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="primary">{course.code || course.course?.code}</Badge>
                          <Badge variant="default">{course.credits || course.course?.credits || 3} {t.cr[lang]}</Badge>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                          {lang === 'en' ? (course.name_en || course.course?.name_en) : (course.name_ar || course.course?.name_ar)}
                        </h3>
                        <div className="space-y-2 text-sm">
                          {(course.instructor || course.course?.instructor) && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <User className="w-4 h-4" />
                              <span>{course.instructor || course.course?.instructor}</span>
                            </div>
                          )}
                          {(course.schedule || course.course?.schedule) && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <Clock className="w-4 h-4" />
                              <span>{course.schedule || course.course?.schedule}</span>
                            </div>
                          )}
                          {(course.location || course.course?.location) && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <MapPin className="w-4 h-4" />
                              <span>{course.location || course.course?.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${course.status === 'COMPLETED' ? 'bg-green-500' : course.status === 'DROPPED' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <span className={`text-xs font-medium ${course.status === 'COMPLETED' ? 'text-green-600' : course.status === 'DROPPED' ? 'text-red-600' : 'text-blue-600'}`}>
                              {course.status === 'COMPLETED' ? (lang === 'ar' ? 'مكتمل' : 'Completed') :
                               course.status === 'DROPPED' ? (lang === 'ar' ? 'محذوف' : 'Dropped') :
                               (lang === 'ar' ? 'نشط' : 'Active')}
                            </span>
                          </div>
                          {course.grade && course.grade !== '-' && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${getGradeColor(course.grade)}`}>
                              {course.grade}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ));
          })()}

          {/* LMS Enrolled Courses Section */}
          {lmsCourses.length > 0 && (
            <Card>
              <CardHeader
                title={lang === 'ar' ? 'المساقات المسجلة في نظام إدارة التعلم (LMS)' : 'LMS Enrolled Courses'}
                subtitle={coursesSource === 'LMS' ? (lang === 'ar' ? 'من منصة موودل' : 'From Moodle Platform') : ''}
                icon={BookOpen}
                iconColor="text-green-600 bg-green-50"
              />
              <CardBody noPadding>
                {lmsCoursesLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل المساقات...' : 'Loading courses...'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                    {lmsCourses.map((course, idx) => (
                      <div
                        key={course.moodle_course_id || idx}
                        className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-200 hover:border-green-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="success">{course.course_code || course.shortname}</Badge>
                          <Badge variant="default">{course.credits || 3} {t.cr[lang]}</Badge>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2 group-hover:text-green-600 transition-colors">
                          {lang === 'en' ? (course.course_name_en || course.fullname) : (course.course_name_ar || course.fullname)}
                        </h3>
                        <div className="space-y-2 text-sm">
                          {course.semester_name && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar className="w-4 h-4" />
                              <span>{course.semester_name} {course.academic_year || ''}</span>
                            </div>
                          )}
                          {course.startdate && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <Clock className="w-4 h-4" />
                              <span>
                                {lang === 'ar' ? 'بداية: ' : 'Start: '}
                                {new Date(course.startdate).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-100 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${course.completed ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            <span className={`text-xs font-medium ${course.completed ? 'text-green-600' : 'text-blue-600'}`}>
                              {course.completed ? (lang === 'ar' ? 'مكتمل' : 'Completed') : (lang === 'ar' ? 'قيد الدراسة' : 'In Progress')}
                            </span>
                          </div>
                          {course.progress !== null && course.progress !== undefined && (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full transition-all"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-green-600">{course.progress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          {/* GPA Card */}
          <GradientCard gradient="from-blue-600 via-indigo-600 to-purple-600" className="relative overflow-hidden">
            <div className="absolute top-0 end-0 w-32 sm:w-64 h-32 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <Award className="absolute -end-4 -bottom-4 w-24 sm:w-40 h-24 sm:h-40 text-white/10" />
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="text-center md:text-start">
                <p className="text-blue-100 text-xs sm:text-sm mb-1 uppercase tracking-wider">{t.cumulativeGpa[lang]}</p>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">{calculatedGPA}</h2>
                <p className="text-blue-200 mt-2 text-sm">{lang === 'ar' ? 'من 4.00' : 'out of 4.00'}</p>
              </div>
              <div className="flex gap-3 sm:gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-blue-100 text-[10px] sm:text-xs uppercase tracking-wider mb-1">{t.attemptedCredits[lang]}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{totalCredits}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-blue-100 text-[10px] sm:text-xs uppercase tracking-wider mb-1">{t.totalPointsLabel[lang]}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{totalPoints.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </GradientCard>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader
                title={lang === 'ar' ? 'تطور المعدل' : 'GPA Trend'}
                icon={TrendingUp}
                iconColor="text-green-600 bg-green-50"
              />
              <CardBody>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <BarChart data={semesterGPAData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="semester" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 4]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="gpa" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={lang === 'ar' ? 'توزيع الدرجات' : 'Grade Distribution'}
                icon={BarChart2}
                iconColor="text-purple-600 bg-purple-50"
              />
              <CardBody>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <PieChart>
                      <Pie
                        data={gradeDistribution.filter(g => g.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="count"
                        label={({ grade, count }) => `${grade}: ${count}`}
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* LMS Grades Section */}
          {lmsGrades.length > 0 && (
            <Card>
              <CardHeader
                title={lang === 'ar' ? 'درجات نظام إدارة التعلم (LMS)' : 'LMS Grades'}
                icon={BookOpen}
                iconColor="text-green-600 bg-green-50"
              />
              <CardBody noPadding>
                {lmsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">{lang === 'ar' ? 'جاري تحميل درجات LMS...' : 'Loading LMS grades...'}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-start px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            {lang === 'ar' ? 'رمز المادة' : 'Course Code'}
                          </th>
                          <th className="text-start px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            {lang === 'ar' ? 'اسم المادة' : 'Course Name'}
                          </th>
                          <th className="text-start px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            {lang === 'ar' ? 'الفصل الدراسي' : 'Semester'}
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            {lang === 'ar' ? 'الدرجة' : 'Grade'}
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            {lang === 'ar' ? 'النسبة المئوية' : 'Percentage'}
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            {lang === 'ar' ? 'الحالة' : 'Status'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lmsGrades.map((grade, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-medium text-blue-600">{grade.course_code}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-800">
                                {lang === 'ar' ? grade.course_name_ar : grade.course_name_en}
                              </p>
                              <p className="text-xs text-slate-500">{grade.credits} {lang === 'ar' ? 'ساعات' : 'credits'}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600">{grade.semester_name}</span>
                              {grade.academic_year && (
                                <p className="text-xs text-slate-400">{grade.academic_year}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-bold text-lg text-slate-800">
                                {grade.moodle_grade !== null ? grade.moodle_grade.toFixed(1) : '-'}
                              </span>
                              <span className="text-sm text-slate-400">/{grade.moodle_grade_max}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {grade.percentage !== null ? (
                                <span className={`font-semibold ${
                                  grade.percentage >= 90 ? 'text-green-600' :
                                  grade.percentage >= 80 ? 'text-blue-600' :
                                  grade.percentage >= 70 ? 'text-yellow-600' :
                                  grade.percentage >= 60 ? 'text-orange-600' :
                                  'text-red-600'
                                }`}>
                                  {grade.percentage}%
                                </span>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                grade.completion_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                grade.completion_status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {grade.completion_status === 'COMPLETED' ? (lang === 'ar' ? 'مكتمل' : 'Completed') :
                                 grade.completion_status === 'FAILED' ? (lang === 'ar' ? 'راسب' : 'Failed') :
                                 (lang === 'ar' ? 'قيد التقدم' : 'In Progress')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Grades Table */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'سجل الدرجات' : 'Grade Record'}
              icon={Award}
              iconColor="text-blue-600 bg-blue-50"
              action={
                <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadTranscript}>
                  {lang === 'ar' ? 'تحميل الكشف' : 'Download Transcript'}
                </Button>
              }
            />
            <CardBody noPadding>
              {/* Search and Semester Filter */}
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Search by Course Code */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? 'البحث برمز المادة...' : 'Search by course code...'}
                        value={courseSearchQuery}
                        onChange={(e) => setCourseSearchQuery(e.target.value)}
                        className="w-full ps-10 pe-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {courseSearchQuery && (
                        <button
                          onClick={() => setCourseSearchQuery('')}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Current Semester Display */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">{lang === 'ar' ? 'الفصل الدراسي:' : 'Semester:'}</span>
                    {activeSemesters.length > 0 ? (
                      <span className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white">
                        {lang === 'ar' ? activeSemesters[0].name_ar : activeSemesters[0].name_en}
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 text-sm rounded-lg bg-slate-200 text-slate-600">
                        {lang === 'ar' ? 'لم يتم تحديد فصل' : 'No semester selected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.code[lang]}</th>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.courseTitle[lang]}</th>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>{t.semester[lang]}</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.credits[lang]}</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'أعمال الفصل' : 'Coursework'} (20)</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'النصفي' : 'Midterm'} (40)</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'النهائي' : 'Final'} (40)</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'المجموع' : 'Total'}</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'التقدير' : 'Grade'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grades
                      .filter(g => {
                        // Filter by course code search
                        if (courseSearchQuery) {
                          const searchLower = courseSearchQuery.toLowerCase();
                          const courseCode = g.code || g.course?.code || '';
                          const courseTitle = g.title || g.course?.name_en || g.course?.name_ar || g.name_en || g.name_ar || '';
                          const codeMatch = courseCode.toLowerCase().includes(searchLower);
                          const titleMatch = courseTitle.toLowerCase().includes(searchLower);
                          if (!codeMatch && !titleMatch) return false;
                        }
                        // Filter by current semester only
                        if (activeSemesters.length === 0) return true;
                        const currentSemName = activeSemesters[0].name_en;
                        const currentSemNameAr = activeSemesters[0].name_ar;
                        const currentSemId = activeSemesters[0].id;
                        const gradeSemName = g.semester || g.semesterRecord?.name_en || g.semesterRecord?.name_ar || g.semester_record?.name_en;
                        const gradeSemId = g.semester_id || g.semesterRecord?.id || g.semester_record?.id;
                        return gradeSemName === currentSemName || gradeSemName === currentSemNameAr || gradeSemId === currentSemId;
                      })
                      .map((g, i) => {
                      // Extract course and semester info from nested objects or direct fields
                      const courseCode = g.code || g.course?.code || '-';
                      const courseTitle = g.title || g.course?.name_en || g.course?.name_ar || g.name_en || '-';
                      const semesterName = g.semester || g.semesterRecord?.name_en || g.semester_record?.name_en || g.semester_record?.name_ar || '-';
                      const credits = g.credits || g.course?.credits || '-';
                      const total = g.total || g.total_score || ((g.coursework || 0) + (g.midterm || 0) + (g.final || 0));
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <Badge variant="primary">{courseCode}</Badge>
                          </td>
                          <td className="p-4 font-medium text-slate-800">{courseTitle}</td>
                          <td className="p-4 text-slate-500">{semesterName}</td>
                          <td className="p-4 text-center text-slate-600">{credits}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg text-sm font-medium ${
                              (g.coursework || 0) >= 17 ? 'bg-green-100 text-green-700' :
                              (g.coursework || 0) >= 14 ? 'bg-blue-100 text-blue-700' :
                              (g.coursework || 0) >= 10 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {g.coursework ?? '-'}/20
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg text-sm font-medium ${
                              (g.midterm || 0) >= 34 ? 'bg-green-100 text-green-700' :
                              (g.midterm || 0) >= 28 ? 'bg-blue-100 text-blue-700' :
                              (g.midterm || 0) >= 20 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {g.midterm ?? '-'}/40
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg text-sm font-medium ${
                              (g.final || 0) >= 34 ? 'bg-green-100 text-green-700' :
                              (g.final || 0) >= 28 ? 'bg-blue-100 text-blue-700' :
                              (g.final || 0) >= 20 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {g.final ?? '-'}/40
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[50px] px-3 py-1.5 rounded-lg text-sm font-bold ${
                              total >= 90 ? 'bg-green-100 text-green-700' :
                              total >= 80 ? 'bg-blue-100 text-blue-700' :
                              total >= 70 ? 'bg-yellow-100 text-yellow-700' :
                              total >= 60 ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {total}/100
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${getGradeColor(g.grade)}`}>
                                {g.grade}
                              </span>
                              <span className="text-xs text-slate-500">
                                {getGradeLabel(g.grade, lang)}
                              </span>
                              {!isGradeExcluded(g.grade) && (
                                <span className="text-xs text-slate-400">
                                  {gradeToPoints(g.grade).toFixed(2)} {lang === 'ar' ? 'نقطة' : 'pts'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Study Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {/* Loading State */}
          {studyPlanLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-500 font-medium">{lang === 'ar' ? 'جاري تحميل الخطة الدراسية...' : 'Loading study plan...'}</p>
              </div>
            </div>
          )}

          {/* Program Info Header */}
          {!studyPlanLoading && programInfo && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">
                      {lang === 'ar' ? programInfo.name_ar : programInfo.name_en}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                      <span>{lang === 'ar' ? 'الكود: ' : 'Code: '}{programInfo.code}</span>
                      <span>•</span>
                      <span>{lang === 'ar' ? 'النوع: ' : 'Type: '}{programInfo.type}</span>
                      <span>•</span>
                      <span>{lang === 'ar' ? 'إجمالي الساعات: ' : 'Total Credits: '}{programInfo.total_credits}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Progress Overview */}
          {!studyPlanLoading && (
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {lang === 'ar' ? 'تقدم الخطة الدراسية' : 'Study Plan Progress'}
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(completedCredits / totalRequiredCredits) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-800">
                      {Math.round((completedCredits / totalRequiredCredits) * 100)}%
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-600">{lang === 'ar' ? 'مكتمل' : 'Completed'}: {completedCredits} {lang === 'ar' ? 'ساعة' : 'credits'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-slate-600">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <span className="text-slate-600">{lang === 'ar' ? 'لم يبدأ' : 'Not Started'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white text-center">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-80" />
                  <p className="text-blue-100 text-sm">{lang === 'ar' ? 'المتبقي للتخرج' : 'To Graduate'}</p>
                  <p className="text-3xl font-bold">{totalRequiredCredits - completedCredits}</p>
                  <p className="text-blue-200 text-sm">{lang === 'ar' ? 'ساعة' : 'credits'}</p>
                </div>
              </div>
            </CardBody>
          </Card>
          )}

          {/* No Program Assigned Message */}
          {!studyPlanLoading && !(student?.program_id || student?.program?.id) && (
            <Card className="border-amber-200 bg-amber-50">
              <CardBody>
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {lang === 'ar' ? 'لم يتم تحديد البرنامج' : 'No Program Assigned'}
                  </h3>
                  <p className="text-slate-600">
                    {lang === 'ar'
                      ? 'يرجى التواصل مع شؤون الطلاب لتحديد برنامجك الأكاديمي'
                      : 'Please contact student affairs to assign your academic program'}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* No Courses in Study Plan Message */}
          {!studyPlanLoading && (student?.program_id || student?.program?.id) && studyPlan.length === 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardBody>
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {lang === 'ar' ? 'لا توجد مواد في الخطة الدراسية' : 'No Courses in Study Plan'}
                  </h3>
                  <p className="text-slate-600">
                    {lang === 'ar'
                      ? 'الخطة الدراسية لبرنامجك قيد الإعداد من قبل الإدارة الأكاديمية'
                      : 'The study plan for your program is being prepared by academic administration'}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Filters - Only show when there are courses */}
          {!studyPlanLoading && studyPlan.length > 0 && (
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Filter className="w-4 h-4 text-blue-600" />
                  {lang === 'ar' ? 'تصفية حسب' : 'Filter by'}
                </div>
                <div className="flex flex-wrap gap-3 flex-1">
                  {/* Current Semester Display */}
                  {activeSemesters.length > 0 && (
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm text-blue-700 font-medium">
                        {lang === 'ar' ? 'الفصل الحالي: ' : 'Current Semester: '}
                        {lang === 'ar' ? activeSemesters[0].name_ar : activeSemesters[0].name_en}
                      </span>
                    </div>
                  )}
                  {/* Status Filter */}
                  <Select
                    options={[
                      { value: 'all', label: lang === 'ar' ? 'جميع الحالات' : 'All Statuses' },
                      { value: 'COMPLETED', label: lang === 'ar' ? 'مكتمل' : 'Completed' },
                      { value: 'IN_PROGRESS', label: lang === 'ar' ? 'قيد التنفيذ' : 'In Progress' },
                      { value: 'NOT_STARTED', label: lang === 'ar' ? 'لم يبدأ' : 'Not Started' },
                    ]}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  />
                </div>
                {/* Clear Filters */}
                {statusFilter !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all');
                    }}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" /> {lang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
          )}

          {/* Semesters */}
          {studyPlan.length > 0 && (studyPlan
            .filter(term => semesterFilter === 'all' || String(term.semester) === semesterFilter)
            .filter(term => statusFilter === 'all' || term.courses.some(c => c.status === statusFilter))
            .length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                {lang === 'ar' ? 'لا توجد نتائج مطابقة للفلتر' : 'No results match the filter'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                }}
                className="mt-4"
              >
                {lang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {studyPlan
              .filter(term => semesterFilter === 'all' || String(term.semester) === semesterFilter)
              .filter(term => statusFilter === 'all' || term.courses.some(c => c.status === statusFilter))
              .map((term, idx) => (
              <Card key={idx}>
                <CardHeader
                  title={term.name}
                  subtitle={`${term.courses.reduce((acc, c) => acc + c.cred, 0)} ${lang === 'ar' ? 'ساعة' : 'credits'}`}
                  icon={Layers}
                  iconColor={
                    term.courses.every(c => c.status === 'COMPLETED') ? 'text-green-600 bg-green-50' :
                    term.courses.some(c => c.status === 'IN_PROGRESS') ? 'text-blue-600 bg-blue-50' :
                    'text-slate-600 bg-slate-50'
                  }
                />
                <CardBody noPadding>
                  <div className="divide-y divide-slate-100">
                    {term.courses
                      .filter(course => statusFilter === 'all' || course.status === statusFilter)
                      .map((course, cIdx) => (
                      <div key={cIdx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            course.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                            course.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {course.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> :
                             course.status === 'IN_PROGRESS' ? <Clock className="w-5 h-5" /> :
                             <Square className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800">{course.code}</p>
                              <span className="text-xs text-slate-400">{course.cred} {t.cr[lang]}</span>
                            </div>
                            <p className="text-sm text-slate-500">{course.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {course.grade !== '-' && (
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              course.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                              course.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {course.grade.charAt(0)}
                            </span>
                          )}
                          <Badge
                            variant={
                              course.status === 'COMPLETED' ? 'success' :
                              course.status === 'IN_PROGRESS' ? 'primary' : 'default'
                            }
                            size="sm"
                          >
                            {course.status === 'COMPLETED' ? (lang === 'ar' ? 'مكتمل' : 'Done') :
                             course.status === 'IN_PROGRESS' ? (lang === 'ar' ? 'جاري' : 'Active') :
                             (lang === 'ar' ? 'لاحقاً' : 'Later')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          )
          )}
        </div>
      )}



      {/* Course Details Modal */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title={selectedCourse ? (lang === 'en' ? (selectedCourse.name_en || selectedCourse.course?.name_en) : (selectedCourse.name_ar || selectedCourse.course?.name_ar)) : ''}
        size="lg"
      >
        {selectedCourse && (
          <div className="space-y-4">
            {/* Header with code and badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="lg">{selectedCourse.code || selectedCourse.course?.code}</Badge>
              <Badge variant="default" size="lg">{selectedCourse.credits || selectedCourse.course?.credits || 3} {t.credits[lang]}</Badge>
              {selectedCourse.status && (
                <Badge
                  variant={selectedCourse.status === 'ENROLLED' ? 'success' : selectedCourse.status === 'COMPLETED' ? 'primary' : 'warning'}
                  size="lg"
                >
                  {selectedCourse.status === 'ENROLLED' ? (lang === 'ar' ? 'مسجل' : 'Enrolled') :
                   selectedCourse.status === 'COMPLETED' ? (lang === 'ar' ? 'مكتمل' : 'Completed') :
                   selectedCourse.status === 'DROPPED' ? (lang === 'ar' ? 'منسحب' : 'Dropped') :
                   selectedCourse.status}
                </Badge>
              )}
              {selectedCourse.course?.type && (
                <Badge
                  variant={selectedCourse.course.type === 'REQUIRED' ? 'danger' : 'default'}
                  size="lg"
                >
                  {selectedCourse.course.type === 'REQUIRED' ? (lang === 'ar' ? 'إجباري' : 'Required') :
                   selectedCourse.course.type === 'ELECTIVE' ? (lang === 'ar' ? 'اختياري' : 'Elective') :
                   selectedCourse.course.type}
                </Badge>
              )}
            </div>

            {/* Course Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Semester */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-600 font-medium">{lang === 'ar' ? 'الفصل الدراسي' : 'Semester'}</p>
                </div>
                <p className="font-bold text-slate-800">
                  {selectedCourse.semester_name || selectedCourse.semester?.name || selectedCourse.semester?.name_en || (lang === 'ar' ? 'غير محدد' : 'Not specified')}
                </p>
                {(selectedCourse.academic_year || selectedCourse.semester?.academic_year) && (
                  <p className="text-sm text-slate-500 mt-1">{selectedCourse.academic_year || selectedCourse.semester?.academic_year}</p>
                )}
              </div>

              {/* Credits */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600 font-medium">{lang === 'ar' ? 'الساعات المعتمدة' : 'Credit Hours'}</p>
                </div>
                <p className="font-bold text-slate-800 text-2xl">
                  {selectedCourse.credits || selectedCourse.course?.credits || 3}
                </p>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'ساعة' : 'hours'}</p>
              </div>

              {/* Instructor */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <p className="text-sm text-purple-600 font-medium">{t.instructorLabel[lang]}</p>
                </div>
                <p className="font-bold text-slate-800">
                  {selectedCourse.instructor || selectedCourse.course?.instructor || (lang === 'ar' ? 'غير محدد' : 'TBA')}
                </p>
              </div>

              {/* Schedule */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-600 font-medium">{t.schedule[lang]}</p>
                </div>
                <p className="font-bold text-slate-800">
                  {selectedCourse.schedule || selectedCourse.course?.schedule || (lang === 'ar' ? 'غير محدد' : 'TBA')}
                </p>
              </div>
            </div>

            {/* Grade Section (if available) */}
            {(selectedCourse.grade || selectedCourse.grade_points) && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-slate-600" />
                  <p className="text-sm text-slate-600 font-medium">{lang === 'ar' ? 'الدرجة' : 'Grade'}</p>
                </div>
                <div className="flex items-center gap-4">
                  {selectedCourse.grade && (
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-800">{selectedCourse.grade}</p>
                      <p className="text-sm text-slate-500">{lang === 'ar' ? 'الدرجة' : 'Grade'}</p>
                    </div>
                  )}
                  {selectedCourse.grade_points && (
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{selectedCourse.grade_points}</p>
                      <p className="text-sm text-slate-500">{lang === 'ar' ? 'نقاط' : 'Points'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section Info */}
            {selectedCourse.section && (
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <p className="text-sm text-slate-500 font-medium">{lang === 'ar' ? 'الشعبة' : 'Section'}</p>
                </div>
                <p className="font-semibold text-slate-800">{selectedCourse.section}</p>
              </div>
            )}

            {/* Description */}
            {(selectedCourse.description || selectedCourse.course?.description) && (
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <p className="text-sm text-slate-500 font-medium">{lang === 'ar' ? 'الوصف' : 'Description'}</p>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {selectedCourse.description || selectedCourse.course?.description}
                </p>
              </div>
            )}

            {/* Prerequisites (if any) */}
            {(selectedCourse.prerequisites || selectedCourse.course?.prerequisites) && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600 font-medium">{lang === 'ar' ? 'المتطلبات السابقة' : 'Prerequisites'}</p>
                </div>
                <p className="text-slate-700">
                  {selectedCourse.prerequisites || selectedCourse.course?.prerequisites}
                </p>
              </div>
            )}

            {/* Course Name in other language */}
            <div className="pt-2 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                {lang === 'ar' ? 'Course Name (English):' : 'اسم المادة (بالعربية):'}
              </p>
              <p className="text-slate-700">
                {lang === 'ar'
                  ? (selectedCourse.name_en || selectedCourse.course?.name_en || '-')
                  : (selectedCourse.name_ar || selectedCourse.course?.name_ar || '-')}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* New Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setRequestType('');
          setRequestDetails('');
          setSelectedCoursesForRequest([]);
          setRequestReason('');
        }}
        title={t.createRequest[lang]}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={t.requestType[lang]}
            options={[
              { value: '', label: lang === 'ar' ? 'اختر نوع الطلب' : 'Select request type' },
              { value: 'transcript', label: lang === 'ar' ? 'طلب كشف درجات' : 'Transcript Request' },
              { value: 'enrollment', label: lang === 'ar' ? 'شهادة قيد' : 'Enrollment Certificate' },
              { value: 'academic_standing', label: lang === 'ar' ? 'خطاب الوضع الأكاديمي' : 'Academic Standing Letter' },
              { value: 'exceptional_registration', label: lang === 'ar' ? 'تسجيل استثنائي' : 'Exceptional Registration' },
              { value: 'course_equivalence', label: lang === 'ar' ? 'معادلة مساق' : 'Course Equivalence' },
              { value: 'excuse', label: lang === 'ar' ? 'عذر غياب' : 'Absence Excuse' },
              { value: 'postponement', label: lang === 'ar' ? 'تأجيل دراسي' : 'Study Postponement' },
              { value: 'freeze', label: lang === 'ar' ? 'تجميد فصل' : 'Semester Freeze' },
              { value: 're_enrollment', label: lang === 'ar' ? 'إعادة القيد' : 'Re-enrollment' },
              { value: 'other', label: lang === 'ar' ? 'أخرى' : 'Other' },
            ]}
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          />

          {/* Exceptional Registration - Courses Dropdown */}
          {requestType === 'exceptional_registration' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'المساقات المطلوب تسجيلها' : 'Courses to Register'}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <div className="border border-slate-300 rounded-xl max-h-48 overflow-y-auto">
                  {availableCourses.map(course => (
                    <label
                      key={course.id}
                      className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 ${
                        selectedCoursesForRequest.includes(course.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCoursesForRequest.includes(course.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCoursesForRequest([...selectedCoursesForRequest, course.id]);
                          } else {
                            setSelectedCoursesForRequest(selectedCoursesForRequest.filter(id => id !== course.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{course.code}</span>
                          <span className="text-xs text-slate-500">{course.credits} {t.cr[lang]}</span>
                        </div>
                        <p className="text-sm text-slate-600">{lang === 'en' ? course.name_en : course.name_ar}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedCoursesForRequest.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {lang === 'ar' ? `تم اختيار ${selectedCoursesForRequest.length} مساق` : `${selectedCoursesForRequest.length} course(s) selected`}
                  </p>
                )}
              </div>
              <Select
                label={lang === 'ar' ? 'سبب التسجيل الاستثنائي' : 'Reason for Exceptional Registration'}
                options={[
                  { value: '', label: lang === 'ar' ? 'اختر السبب' : 'Select reason' },
                  { value: 'schedule_conflict', label: lang === 'ar' ? 'تعارض في الجدول سابقاً' : 'Previous Schedule Conflict' },
                  { value: 'late_registration', label: lang === 'ar' ? 'تأخر في التسجيل' : 'Late Registration' },
                  { value: 'course_closed', label: lang === 'ar' ? 'المساق كان مغلقاً' : 'Course Was Closed' },
                  { value: 'graduation', label: lang === 'ar' ? 'متطلب تخرج' : 'Graduation Requirement' },
                  { value: 'other', label: lang === 'ar' ? 'أخرى' : 'Other' },
                ]}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
            </>
          )}

          {/* Course Equivalence */}
          {requestType === 'course_equivalence' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {lang === 'ar' ? 'المساق المراد معادلته' : 'Course to Equate'}
                </label>
                <Select
                  options={[
                    { value: '', label: lang === 'ar' ? 'اختر المساق' : 'Select course' },
                    ...availableCourses.map(c => ({ value: c.id, label: `${c.code} - ${lang === 'en' ? c.name_en : c.name_ar}` }))
                  ]}
                  value={selectedCoursesForRequest[0] || ''}
                  onChange={(e) => setSelectedCoursesForRequest([e.target.value])}
                />
              </div>
              <Input
                label={lang === 'ar' ? 'اسم المساق من الجامعة السابقة' : 'Course Name from Previous University'}
                placeholder={lang === 'ar' ? 'أدخل اسم المساق' : 'Enter course name'}
              />
            </>
          )}

          {/* Excuse - Date Selection */}
          {requestType === 'excuse' && (
            <>
              <Input
                type="date"
                label={lang === 'ar' ? 'تاريخ الغياب' : 'Absence Date'}
              />
              <Select
                label={lang === 'ar' ? 'سبب الغياب' : 'Reason for Absence'}
                options={[
                  { value: '', label: lang === 'ar' ? 'اختر السبب' : 'Select reason' },
                  { value: 'medical', label: lang === 'ar' ? 'سبب طبي' : 'Medical Reason' },
                  { value: 'family', label: lang === 'ar' ? 'ظروف عائلية' : 'Family Circumstances' },
                  { value: 'official', label: lang === 'ar' ? 'مهمة رسمية' : 'Official Duty' },
                  { value: 'other', label: lang === 'ar' ? 'أخرى' : 'Other' },
                ]}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
            </>
          )}

          {/* Study Postponement */}
          {requestType === 'postponement' && (
            <>
              <Select
                label={lang === 'ar' ? 'الفصل المراد تأجيله' : 'Semester to Postpone'}
                options={[
                  { value: '', label: lang === 'ar' ? 'اختر الفصل' : 'Select semester' },
                  ...(activeSemesters.length > 0
                    ? activeSemesters.map(s => ({
                        value: s.id?.toString() || s.name_en,
                        label: lang === 'ar' ? s.name_ar : s.name_en
                      }))
                    : [
                        { value: 'current', label: lang === 'ar' ? 'الفصل الحالي' : 'Current Semester' },
                        { value: 'next', label: lang === 'ar' ? 'الفصل القادم' : 'Next Semester' },
                      ])
                ]}
              />
              <Select
                label={lang === 'ar' ? 'سبب التأجيل' : 'Reason for Postponement'}
                options={[
                  { value: '', label: lang === 'ar' ? 'اختر السبب' : 'Select reason' },
                  { value: 'health', label: lang === 'ar' ? 'أسباب صحية' : 'Health Reasons' },
                  { value: 'financial', label: lang === 'ar' ? 'أسباب مالية' : 'Financial Reasons' },
                  { value: 'personal', label: lang === 'ar' ? 'أسباب شخصية' : 'Personal Reasons' },
                  { value: 'work', label: lang === 'ar' ? 'ظروف العمل' : 'Work Circumstances' },
                  { value: 'other', label: lang === 'ar' ? 'أخرى' : 'Other' },
                ]}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
            </>
          )}

          {/* Semester Freeze Request */}
          {requestType === 'freeze' && (
            <>
              {/* Previous Postponements - Read Only from Database */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-slate-600">
                      {lang === 'ar' ? 'عدد مرات التأجيل السابقة' : 'Previous Postponements'}
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'ar' ? 'الحد الأقصى المسموح: 4 فصول' : 'Maximum allowed: 4 semesters'}
                    </p>
                  </div>
                  <div className={`text-3xl font-bold ${(student?.postponementCount || 0) >= 4 ? 'text-red-600' : (student?.postponementCount || 0) >= 2 ? 'text-amber-600' : 'text-green-600'}`}>
                    {student?.postponementCount || 0}
                  </div>
                </div>
                {(student?.postponementCount || 0) >= 4 && (
                  <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      {lang === 'ar' ? '⚠️ لقد استنفدت الحد الأقصى لمرات التأجيل' : '⚠️ You have reached the maximum postponement limit'}
                    </p>
                  </div>
                )}
              </div>

              <Select
                label={lang === 'ar' ? 'الفصل المراد تجميده' : 'Semester to Freeze'}
                options={[
                  { value: '', label: lang === 'ar' ? 'اختر الفصل' : 'Select semester' },
                  ...(activeSemesters.length > 0
                    ? activeSemesters.map(s => ({
                        value: s.id?.toString() || s.name_en,
                        label: lang === 'ar' ? s.name_ar : s.name_en
                      }))
                    : [
                        { value: 'current', label: lang === 'ar' ? 'الفصل الحالي' : 'Current Semester' },
                        { value: 'next', label: lang === 'ar' ? 'الفصل القادم' : 'Next Semester' },
                      ])
                ]}
              />
              <Select
                label={lang === 'ar' ? 'سبب التجميد' : 'Reason for Freeze'}
                options={[
                  { value: '', label: lang === 'ar' ? 'اختر السبب' : 'Select reason' },
                  { value: 'health', label: lang === 'ar' ? 'أسباب صحية' : 'Health Reasons' },
                  { value: 'financial', label: lang === 'ar' ? 'أسباب مالية' : 'Financial Reasons' },
                  { value: 'personal', label: lang === 'ar' ? 'أسباب شخصية' : 'Personal Reasons' },
                  { value: 'work', label: lang === 'ar' ? 'ظروف العمل' : 'Work Circumstances' },
                  { value: 'military', label: lang === 'ar' ? 'خدمة عسكرية' : 'Military Service' },
                  { value: 'travel', label: lang === 'ar' ? 'سفر' : 'Travel' },
                  { value: 'other', label: lang === 'ar' ? 'أخرى' : 'Other' },
                ]}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
              />
            </>
          )}

          {/* Re-enrollment - Simple message only */}
          {requestType === 're_enrollment' && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <p className="text-blue-800">
                {lang === 'ar'
                  ? 'سيتم إرسال طلب إعادة القيد للمراجعة من قبل إدارة القبول والتسجيل.'
                  : 'Your re-enrollment request will be sent for review by the Admissions and Registration Office.'}
              </p>
            </div>
          )}

          {/* Details for all request types (except re_enrollment) */}
          {requestType && requestType !== 're_enrollment' && (
            <Textarea
              label={lang === 'ar' ? 'تفاصيل إضافية (اختياري)' : 'Additional Details (optional)'}
              placeholder={lang === 'ar' ? 'اكتب أي تفاصيل إضافية هنا...' : 'Write any additional details here...'}
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              rows={3}
            />
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => {
              setShowRequestModal(false);
              setRequestType('');
              setRequestDetails('');
              setSelectedCoursesForRequest([]);
              setRequestReason('');
            }}>
              {t.cancel[lang]}
            </Button>
            <Button
              variant="primary"
              fullWidth
              icon={CheckCircle}
              disabled={!requestType || (requestType === 'exceptional_registration' && selectedCoursesForRequest.length === 0)}
              onClick={() => {
                const requestTypeLabels: Record<string, { en: string; ar: string }> = {
                  transcript: { en: 'Transcript Request', ar: 'طلب كشف درجات' },
                  enrollment: { en: 'Enrollment Certificate', ar: 'شهادة قيد' },
                  academic_standing: { en: 'Academic Standing Letter', ar: 'خطاب الوضع الأكاديمي' },
                  exceptional_registration: { en: 'Exceptional Registration', ar: 'تسجيل استثنائي' },
                  course_equivalence: { en: 'Course Equivalence', ar: 'معادلة مساق' },
                  excuse: { en: 'Absence Excuse', ar: 'عذر غياب' },
                  postponement: { en: 'Study Postponement', ar: 'تأجيل دراسي' },
                  freeze: { en: 'Semester Freeze', ar: 'تجميد فصل' },
                  re_enrollment: { en: 'Re-enrollment', ar: 'إعادة القيد' },
                  other: { en: 'Other', ar: 'أخرى' },
                };
                const selectedCourseNames = selectedCoursesForRequest
                  .map(id => availableCourses.find(c => c.id === id)?.code)
                  .filter(Boolean)
                  .join(', ');

                const newReq: ServiceRequest = {
                  id: `sr${Date.now()}`,
                  requestType: lang === 'ar' ? requestTypeLabels[requestType].ar : requestTypeLabels[requestType].en,
                  date: new Date().toISOString().split('T')[0],
                  status: 'PENDING',
                  comments: requestType === 'exceptional_registration' && selectedCourseNames
                    ? `${lang === 'ar' ? 'المساقات:' : 'Courses:'} ${selectedCourseNames}`
                    : requestDetails || undefined
                };
                setRequests([newReq, ...requests]);
                setShowRequestModal(false);
                setRequestType('');
                setRequestDetails('');
                setSelectedCoursesForRequest([]);
                setRequestReason('');
              }}
            >
              {lang === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        isOpen={showRequestDetailsModal}
        onClose={() => setShowRequestDetailsModal(false)}
        title={lang === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Request Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">{selectedRequest.requestType}</h3>
                <p className="text-sm text-slate-500">{lang === 'ar' ? 'رقم الطلب' : 'Request ID'}: {selectedRequest.id}</p>
              </div>
              <Badge
                variant={
                  selectedRequest.status === 'COMPLETED' ? 'success' :
                  selectedRequest.status === 'REJECTED' ? 'danger' :
                  selectedRequest.status === 'PENDING' ? 'warning' : 'default'
                }
                size="lg"
              >
                {selectedRequest.status === 'COMPLETED' ? (lang === 'ar' ? 'مكتمل' : 'Completed') :
                 selectedRequest.status === 'REJECTED' ? (lang === 'ar' ? 'مرفوض' : 'Rejected') :
                 selectedRequest.status === 'PENDING' ? (lang === 'ar' ? 'قيد المراجعة' : 'Pending') :
                 selectedRequest.status}
              </Badge>
            </div>

            {/* Request Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  {lang === 'ar' ? 'تاريخ الطلب' : 'Request Date'}
                </div>
                <p className="font-semibold text-slate-800">{selectedRequest.date}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  {lang === 'ar' ? 'الحالة' : 'Status'}
                </div>
                <p className="font-semibold text-slate-800">
                  {selectedRequest.status === 'COMPLETED' ? (lang === 'ar' ? 'مكتمل' : 'Completed') :
                   selectedRequest.status === 'REJECTED' ? (lang === 'ar' ? 'مرفوض' : 'Rejected') :
                   selectedRequest.status === 'PENDING' ? (lang === 'ar' ? 'قيد المراجعة' : 'Pending') :
                   selectedRequest.status}
                </p>
              </div>
            </div>

            {/* Comments/Notes */}
            {selectedRequest.comments && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-2">
                  <AlertCircle className="w-4 h-4" />
                  {lang === 'ar' ? 'ملاحظات' : 'Notes'}
                </div>
                <p className="text-slate-700">{selectedRequest.comments}</p>
              </div>
            )}

            {/* Status Timeline */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                {lang === 'ar' ? 'مراحل الطلب' : 'Request Timeline'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{lang === 'ar' ? 'تم تقديم الطلب' : 'Request Submitted'}</p>
                    <p className="text-xs text-slate-500">{selectedRequest.date}</p>
                  </div>
                </div>
                {selectedRequest.status !== 'PENDING' && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedRequest.status === 'COMPLETED' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {selectedRequest.status === 'COMPLETED' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        {selectedRequest.status === 'COMPLETED'
                          ? (lang === 'ar' ? 'تم إنجاز الطلب' : 'Request Completed')
                          : (lang === 'ar' ? 'تم رفض الطلب' : 'Request Rejected')}
                      </p>
                    </div>
                  </div>
                )}
                {selectedRequest.status === 'PENDING' && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{lang === 'ar' ? 'قيد المراجعة' : 'Under Review'}</p>
                      <p className="text-xs text-slate-500">{lang === 'ar' ? 'في انتظار الرد' : 'Waiting for response'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowRequestDetailsModal(false)}
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
              {selectedRequest.status === 'PENDING' && (
                <Button
                  variant="danger"
                  fullWidth
                  icon={XCircle}
                  onClick={() => {
                    setRequests(requests.map(r =>
                      r.id === selectedRequest.id ? { ...r, status: 'CANCELLED' as any } : r
                    ));
                    setShowRequestDetailsModal(false);
                  }}
                >
                  {lang === 'ar' ? 'إلغاء الطلب' : 'Cancel Request'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Academic;

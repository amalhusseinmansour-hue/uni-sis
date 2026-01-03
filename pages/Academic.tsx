
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
import { TRANSLATIONS } from '../constants';
import { studentsAPI } from '../api/students';
import { coursesAPI } from '../api/courses';
import { enrollmentsAPI } from '../api/enrollments';
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

  const initialTab = (location.state as any)?.tab === 'register' ? 'register' : 'record';
  const [activeTab, setActiveTab] = useState<'record' | 'register' | 'grades' | 'plan' | 'requests'>(initialTab as any);

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
  const [cart, setCart] = useState<any[]>([]);
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Request form state
  const [requestType, setRequestType] = useState<string>('');
  const [requestDetails, setRequestDetails] = useState<string>('');
  const [selectedCoursesForRequest, setSelectedCoursesForRequest] = useState<string[]>([]);
  const [requestReason, setRequestReason] = useState<string>('');

  // Student profile data
  const [student, setStudent] = useState<any>(null);

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

          setMyCourses(enrollmentsData.data || enrollmentsData || []);
          setGrades(gradesData.data || gradesData || []);

          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          const currentSemester = currentMonth >= 8 ? 'FALL' : currentMonth >= 1 && currentMonth <= 5 ? 'SPRING' : 'SUMMER';
          const coursesData = await coursesAPI.getAvailableSections(currentSemester, currentYear, profile.student?.id || profile.id).catch(() => []);
          setAvailableCourses(coursesData.data || coursesData || []);
        } catch (apiError: any) {
          console.error('Error fetching academic data:', apiError);
        }
      } catch (err: any) {
        console.error('Academic fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter State
  const [filters, setFilters] = useState({ instructor: '', credits: '', schedule: '', search: '' });

  const instructorOptions = Array.from(new Set(availableCourses.map(c => c.instructor))).sort().map(inst => ({
    value: inst, count: availableCourses.filter(c => c.instructor === inst).length
  }));

  const creditOptions = Array.from(new Set(availableCourses.map(c => c.credits))).sort((a: number, b: number) => a - b).map(cred => ({
    value: cred, count: availableCourses.filter(c => c.credits === cred).length
  }));

  const scheduleOptions = Array.from(new Set(availableCourses.map(c => c.schedule))).sort().map(sch => ({
    value: sch, count: availableCourses.filter(c => c.schedule === sch).length
  }));

  const filteredCourses = availableCourses.filter(course => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = filters.search === '' ||
      course.name_en.toLowerCase().includes(searchLower) ||
      course.name_ar.includes(filters.search) ||
      course.code.toLowerCase().includes(searchLower) ||
      course.instructor.toLowerCase().includes(searchLower);
    return (
      matchesSearch &&
      (filters.instructor === '' || course.instructor === filters.instructor) &&
      (filters.credits === '' || course.credits === parseInt(filters.credits)) &&
      (filters.schedule === '' || course.schedule === filters.schedule)
    );
  });

  const clearFilters = () => setFilters({ instructor: '', credits: '', schedule: '', search: '' });

  // Cart functions
  const addToCart = (course: any) => {
    if (!cart.find(c => c.id === course.id)) {
      setCart([...cart, course]);
    }
  };

  const removeFromCart = (courseId: string) => {
    setCart(cart.filter(c => c.id !== courseId));
  };

  const getTotalCartCredits = () => cart.reduce((sum, c) => sum + c.credits, 0);

  const handleRegisterAll = async () => {
    for (const course of cart) {
      try {
        await enrollmentsAPI.enroll(course.id);
      } catch (err) {
        console.error('Error enrolling:', err);
      }
    }
    const enrollmentsData = await studentsAPI.getEnrollments(studentId);
    setMyCourses(enrollmentsData);
    setCart([]);
  };

  // GPA calculations
  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
  const totalPoints = grades.reduce((sum, grade) => sum + (grade.points * grade.credits), 0);
  const calculatedGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  // Chart data
  const gradeDistribution = [
    { grade: 'A', count: grades.filter(g => g.grade.startsWith('A')).length, color: '#22c55e' },
    { grade: 'B', count: grades.filter(g => g.grade.startsWith('B')).length, color: '#3b82f6' },
    { grade: 'C', count: grades.filter(g => g.grade.startsWith('C')).length, color: '#f59e0b' },
    { grade: 'D', count: grades.filter(g => g.grade.startsWith('D')).length, color: '#f97316' },
    { grade: 'F', count: grades.filter(g => g.grade === 'F').length, color: '#ef4444' },
  ];

  const semesterGPAData = [
    { semester: 'Fall 22', gpa: 3.2 },
    { semester: 'Spring 23', gpa: 3.4 },
    { semester: 'Fall 23', gpa: 3.55 },
    { semester: 'Spring 24', gpa: 3.7 },
  ];

  const studyPlan = [
    { semester: 1, name: lang === 'ar' ? 'الفصل الأول' : 'Semester 1', courses: [
      { code: 'CS101', title: lang === 'ar' ? 'مقدمة في الحاسب' : 'Intro to CS', cred: 3, status: 'COMPLETED', grade: 'A' },
      { code: 'MATH101', title: lang === 'ar' ? 'التفاضل والتكامل 1' : 'Calculus I', cred: 4, status: 'COMPLETED', grade: 'B+' },
      { code: 'ENG101', title: lang === 'ar' ? 'اللغة الانجليزية 1' : 'English I', cred: 3, status: 'COMPLETED', grade: 'A-' }
    ]},
    { semester: 2, name: lang === 'ar' ? 'الفصل الثاني' : 'Semester 2', courses: [
      { code: 'CS102', title: lang === 'ar' ? 'البرمجة 2' : 'Programming II', cred: 3, status: 'COMPLETED', grade: 'A' },
      { code: 'MATH201', title: lang === 'ar' ? 'التفاضل والتكامل 2' : 'Calculus II', cred: 4, status: 'COMPLETED', grade: 'B' },
      { code: 'PHYS101', title: lang === 'ar' ? 'الفيزياء 1' : 'Physics I', cred: 4, status: 'COMPLETED', grade: 'B+' }
    ]},
    { semester: 3, name: lang === 'ar' ? 'الفصل الثالث' : 'Semester 3', courses: [
      { code: 'CS201', title: lang === 'ar' ? 'هياكل البيانات' : 'Data Structures', cred: 3, status: 'IN_PROGRESS', grade: '-' },
      { code: 'CS202', title: lang === 'ar' ? 'المنطق الرقمي' : 'Digital Logic', cred: 3, status: 'IN_PROGRESS', grade: '-' },
      { code: 'STAT101', title: lang === 'ar' ? 'الإحصاء' : 'Statistics', cred: 3, status: 'IN_PROGRESS', grade: '-' }
    ]},
    { semester: 4, name: lang === 'ar' ? 'الفصل الرابع' : 'Semester 4', courses: [
      { code: 'CS301', title: lang === 'ar' ? 'الخوارزميات' : 'Algorithms', cred: 3, status: 'NOT_STARTED', grade: '-' },
      { code: 'CS302', title: lang === 'ar' ? 'قواعد البيانات' : 'Databases', cred: 3, status: 'NOT_STARTED', grade: '-' },
      { code: 'CS303', title: lang === 'ar' ? 'شبكات الحاسب' : 'Computer Networks', cred: 3, status: 'NOT_STARTED', grade: '-' }
    ]}
  ];

  const completedCredits = studyPlan.flatMap(s => s.courses).filter(c => c.status === 'COMPLETED').reduce((sum, c) => sum + c.cred, 0);
  const totalRequiredCredits = studyPlan.flatMap(s => s.courses).reduce((sum, c) => sum + c.cred, 0);

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
    { id: 'register', label: t.registration[lang], icon: PlusCircle },
    { id: 'requests', label: t.requests[lang], icon: FileText },
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* My Record Tab */}
      {activeTab === 'record' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Current Courses */}
          <Card>
            <CardHeader
              title={lang === 'ar' ? 'المساقات المسجلة حالياً' : 'Currently Enrolled Courses'}
              icon={BookOpen}
              iconColor="text-blue-600 bg-blue-50"
            />
            <CardBody noPadding>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                {myCourses.map(course => (
                  <div
                    key={course.id}
                    className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => { setSelectedCourse(course); setShowCourseModal(true); }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="primary">{course.code}</Badge>
                      <Badge variant="default">{course.credits} {t.cr[lang]}</Badge>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {lang === 'en' ? course.name_en : course.name_ar}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User className="w-4 h-4" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span>{course.location || 'Room 201'}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-green-600 font-medium">{lang === 'ar' ? 'نشط' : 'Active'}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          {/* GPA Card */}
          <GradientCard gradient="from-blue-600 via-indigo-600 to-purple-600" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <Award className="absolute -right-4 -bottom-4 w-40 h-40 text-white/10" />
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-blue-100 text-sm mb-1 uppercase tracking-wider">{t.cumulativeGpa[lang]}</p>
                <h2 className="text-6xl font-bold">{calculatedGPA}</h2>
                <p className="text-blue-200 mt-2">{lang === 'ar' ? 'من 4.00' : 'out of 4.00'}</p>
              </div>
              <div className="flex gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">{t.attemptedCredits[lang]}</p>
                  <p className="text-3xl font-bold">{totalCredits}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <p className="text-blue-100 text-xs uppercase tracking-wider mb-1">{t.totalPointsLabel[lang]}</p>
                  <p className="text-3xl font-bold">{totalPoints.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </GradientCard>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.code[lang]}</th>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.courseTitle[lang]}</th>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.semester[lang]}</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.credits[lang]}</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'أعمال الفصل' : 'Coursework'} (20)</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'النصفي' : 'Midterm'} (40)</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'النهائي' : 'Final'} (40)</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{lang === 'ar' ? 'المجموع' : 'Total'}</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.grade[lang]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grades.map((g, i) => {
                      const total = (g.coursework || 0) + (g.midterm || 0) + (g.final || 0);
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <Badge variant="primary">{g.code}</Badge>
                          </td>
                          <td className="p-4 font-medium text-slate-800">{g.title}</td>
                          <td className="p-4 text-slate-500">{g.semester}</td>
                          <td className="p-4 text-center text-slate-600">{g.credits}</td>
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
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                              g.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                              g.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                              g.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                              g.grade.startsWith('D') ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {g.grade}
                            </span>
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
          {/* Progress Overview */}
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

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Filter className="w-4 h-4 text-blue-600" />
                  {lang === 'ar' ? 'تصفية حسب' : 'Filter by'}
                </div>
                <div className="flex flex-wrap gap-3 flex-1">
                  {/* Semester Filter */}
                  <Select
                    options={[
                      { value: 'all', label: lang === 'ar' ? 'جميع الفصول' : 'All Semesters' },
                      ...studyPlan.map(s => ({ value: String(s.semester), label: s.name }))
                    ]}
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                  />
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
                {(semesterFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSemesterFilter('all');
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

          {/* Semesters */}
          {studyPlan
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
                  setSemesterFilter('all');
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
          )}
        </div>
      )}

      {/* Registration Tab */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          {/* Registration Alert */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-blue-800">{t.springRegOpen[lang]}</h3>
              <p className="text-sm text-blue-600">{t.regClosesMsg[lang]}</p>
            </div>
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardBody>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{lang === 'ar' ? 'سلة التسجيل' : 'Registration Cart'}</h3>
                      <p className="text-sm text-slate-500">
                        {cart.length} {lang === 'ar' ? 'مساق' : 'course(s)'} • {getTotalCartCredits()} {lang === 'ar' ? 'ساعة' : 'credits'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCart([])}>
                      {lang === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
                    </Button>
                    <Button variant="primary" icon={CheckCircle} onClick={handleRegisterAll}>
                      {lang === 'ar' ? 'تأكيد التسجيل' : 'Confirm Registration'}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {cart.map(course => (
                    <Badge key={course.id} variant="primary" size="lg" className="flex items-center gap-2">
                      {course.code}
                      <button onClick={() => removeFromCart(course.id)} className="hover:bg-blue-200 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Filter className="w-4 h-4 text-blue-600" />
                  {t.filterBy[lang]}
                </div>
                {(filters.instructor || filters.credits || filters.schedule || filters.search) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600">
                    <X className="w-4 h-4" /> {t.clearFilters[lang]}
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SearchInput
                  placeholder={t.search[lang]}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <Select
                  options={[
                    { value: '', label: `${t.instructorLabel[lang]}: ${t.all[lang]}` },
                    ...instructorOptions.map(opt => ({ value: opt.value, label: `${opt.value} (${opt.count})` }))
                  ]}
                  value={filters.instructor}
                  onChange={(e) => setFilters({ ...filters, instructor: e.target.value })}
                />
                <Select
                  options={[
                    { value: '', label: `${t.credits[lang]}: ${t.all[lang]}` },
                    ...creditOptions.map(opt => ({ value: String(opt.value), label: `${opt.value} ${t.credits[lang]} (${opt.count})` }))
                  ]}
                  value={filters.credits}
                  onChange={(e) => setFilters({ ...filters, credits: e.target.value })}
                />
                <Select
                  options={[
                    { value: '', label: `${t.schedule[lang]}: ${t.all[lang]}` },
                    ...scheduleOptions.map(opt => ({ value: opt.value, label: `${opt.value} (${opt.count})` }))
                  ]}
                  value={filters.schedule}
                  onChange={(e) => setFilters({ ...filters, schedule: e.target.value })}
                />
              </div>
            </CardBody>
          </Card>

          {/* Courses List */}
          <div className="space-y-4">
            {filteredCourses.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">{t.noResults[lang]}</p>
              </div>
            )}
            {filteredCourses.map(course => {
              const isEnrolled = myCourses.some(c => c.id === course.id);
              const inCart = cart.some(c => c.id === course.id);
              return (
                <Card key={course.id} className={`transition-all ${isEnrolled ? 'border-green-200 bg-green-50/30' : inCart ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                  <CardBody>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-800">{lang === 'en' ? course.name_en : course.name_ar}</h3>
                          <Badge variant="default">{course.code}</Badge>
                          {isEnrolled && <Badge variant="success" dot>{lang === 'ar' ? 'مسجل' : 'Enrolled'}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                            <User className="w-4 h-4" />
                            {course.instructor}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.schedule}
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {course.credits} {t.credits[lang]}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.enrolled || 25}/{course.capacity || 30}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isEnrolled ? (
                          <Badge variant="success">{lang === 'ar' ? 'مسجل' : 'Enrolled'}</Badge>
                        ) : inCart ? (
                          <Button variant="outline" icon={X} onClick={() => removeFromCart(course.id)}>
                            {lang === 'ar' ? 'إزالة' : 'Remove'}
                          </Button>
                        ) : (
                          <Button variant="primary" icon={PlusCircle} onClick={() => addToCart(course)}>
                            {lang === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
                          </Button>
                        )}
                        <IconButton
                          icon={Eye}
                          variant="outline"
                          onClick={() => { setSelectedCourse(course); setShowCourseModal(true); }}
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{t.requests[lang]}</h2>
              <p className="text-slate-500">{lang === 'ar' ? 'إدارة طلباتك الأكاديمية' : 'Manage your academic requests'}</p>
            </div>
            <Button icon={Plus} onClick={() => setShowRequestModal(true)}>
              {t.createRequest[lang]}
            </Button>
          </div>

          <Card>
            <CardBody noPadding>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.requestType[lang]}</th>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.date[lang]}</th>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.status[lang]}</th>
                      <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.comments[lang]}</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.actions[lang]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-slate-800">{req.requestType}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">{req.date}</td>
                        <td className="p-4">
                          <StatusBadge
                            status={req.status === 'COMPLETED' ? 'completed' : req.status === 'REJECTED' ? 'rejected' : 'pending'}
                          />
                        </td>
                        <td className="p-4 text-slate-500">{req.comments || '-'}</td>
                        <td className="p-4 text-center">
                          <IconButton
                            icon={Eye}
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowRequestDetailsModal(true);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Course Details Modal */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title={selectedCourse ? (lang === 'en' ? selectedCourse.name_en : selectedCourse.name_ar) : ''}
        size="lg"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="primary" size="lg">{selectedCourse.code}</Badge>
              <Badge variant="default" size="lg">{selectedCourse.credits} {t.credits[lang]}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">{t.instructorLabel[lang]}</p>
                <p className="font-semibold text-slate-800">{selectedCourse.instructor}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">{t.schedule[lang]}</p>
                <p className="font-semibold text-slate-800">{selectedCourse.schedule}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">{lang === 'ar' ? 'الوصف' : 'Description'}</p>
              <p className="text-slate-700">{selectedCourse.description || 'No description available.'}</p>
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
                  { value: 'current', label: lang === 'ar' ? 'الفصل الحالي' : 'Current Semester' },
                  { value: 'next', label: lang === 'ar' ? 'الفصل القادم' : 'Next Semester' },
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
                  { value: 'current', label: lang === 'ar' ? 'الفصل الحالي' : 'Current Semester' },
                  { value: 'next', label: lang === 'ar' ? 'الفصل القادم' : 'Next Semester' },
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

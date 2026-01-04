import React, { useState, useEffect } from 'react';
import {
  User, Calendar, Clock, MessageSquare, FileText, CheckCircle,
  AlertTriangle, Star, TrendingUp, BookOpen, Target, Phone,
  Mail, Video, MapPin, ChevronRight, Send, Paperclip, Eye,
  Download, CalendarPlus, Bell, Award, BarChart2, Users,
  GraduationCap, Lightbulb, ClipboardList, ExternalLink
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { studentsAPI } from '../api/students';
import { exportToPDF } from '../utils/exportUtils';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Textarea, Select } from '../components/ui/Input';

interface AdvisingPageProps {
  lang: 'en' | 'ar';
}

const AdvisingPage: React.FC<AdvisingPageProps> = ({ lang }) => {
  const t = TRANSLATIONS;
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'messages' | 'plan'>('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await studentsAPI.getMyProfile().catch(() => null);
        setStudent(profile);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Advisor info
  const advisor = {
    id: '1',
    name: lang === 'ar' ? 'د. أحمد محمد الفهد' : 'Dr. Ahmed Al-Fahad',
    title: lang === 'ar' ? 'أستاذ مشارك - قسم علوم الحاسب' : 'Associate Professor - Computer Science',
    email: 'a.alfahad@university.edu',
    phone: '+966 11 123 4567',
    office: lang === 'ar' ? 'مبنى الحاسب، مكتب 215' : 'CS Building, Office 215',
    officeHours: lang === 'ar' ? 'الأحد والثلاثاء 10:00 - 12:00' : 'Sun & Tue 10:00 - 12:00',
    avatar: null,
    rating: 4.8,
    studentsCount: 45,
    responseTime: lang === 'ar' ? 'خلال 24 ساعة' : 'Within 24 hours',
  };

  // Academic status
  const academicStatus = {
    gpa: 3.45,
    credits: 96,
    requiredCredits: 132,
    level: 4,
    status: 'good', // good, warning, probation
    warningsCount: 0,
    maxWarnings: 3,
    expectedGraduation: lang === 'ar' ? 'الفصل الثاني 2025' : 'Spring 2025',
  };

  // Upcoming appointments
  const appointments = [
    {
      id: '1',
      date: '2024-12-15',
      time: '10:00',
      type: 'in-person',
      status: 'confirmed',
      reason: lang === 'ar' ? 'مناقشة الخطة الدراسية' : 'Study plan discussion',
    },
    {
      id: '2',
      date: '2024-12-01',
      time: '11:00',
      type: 'online',
      status: 'completed',
      reason: lang === 'ar' ? 'استفسار عن التسجيل' : 'Registration inquiry',
    },
  ];

  // Available time slots
  const availableSlots = [
    { date: '2024-12-17', time: '10:00', available: true },
    { date: '2024-12-17', time: '10:30', available: true },
    { date: '2024-12-17', time: '11:00', available: false },
    { date: '2024-12-19', time: '10:00', available: true },
    { date: '2024-12-19', time: '11:00', available: true },
  ];

  // Messages
  const messages = [
    {
      id: '1',
      from: 'advisor',
      content: lang === 'ar'
        ? 'مرحباً، أرجو مراجعة الخطة الدراسية المرفقة والتأكد من اختيار المقررات المناسبة للفصل القادم.'
        : 'Hello, please review the attached study plan and ensure you select appropriate courses for next semester.',
      date: '2024-11-28',
      time: '14:30',
      hasAttachment: true,
    },
    {
      id: '2',
      from: 'student',
      content: lang === 'ar'
        ? 'شكراً لك دكتور، هل يمكنني إضافة مقرر CS305 بدلاً من CS302؟'
        : 'Thank you, doctor. Can I add CS305 instead of CS302?',
      date: '2024-11-28',
      time: '15:45',
      hasAttachment: false,
    },
    {
      id: '3',
      from: 'advisor',
      content: lang === 'ar'
        ? 'نعم يمكنك ذلك، لكن تأكد من استيفاء المتطلب السابق CS201.'
        : 'Yes you can, but make sure you have completed the prerequisite CS201.',
      date: '2024-11-29',
      time: '09:15',
      hasAttachment: false,
    },
  ];

  // Study plan recommendations
  const recommendations = [
    {
      id: '1',
      type: 'course',
      priority: 'high',
      title: lang === 'ar' ? 'تسجيل مقرر CS401 - مشروع التخرج' : 'Register CS401 - Graduation Project',
      description: lang === 'ar'
        ? 'يجب تسجيل هذا المقرر في الفصل القادم لضمان التخرج في الموعد المحدد'
        : 'Must register this course next semester to ensure on-time graduation',
    },
    {
      id: '2',
      type: 'gpa',
      priority: 'medium',
      title: lang === 'ar' ? 'تحسين المعدل التراكمي' : 'Improve GPA',
      description: lang === 'ar'
        ? 'المعدل الحالي جيد. حاول الحصول على A في مقررين على الأقل لرفع المعدل'
        : 'Current GPA is good. Try to get A in at least 2 courses to raise GPA',
    },
    {
      id: '3',
      type: 'skill',
      priority: 'low',
      title: lang === 'ar' ? 'تدريب صيفي' : 'Summer Internship',
      description: lang === 'ar'
        ? 'يُنصح بالتقدم للتدريب الصيفي في الشركات التقنية'
        : 'Recommended to apply for summer internship at tech companies',
    },
  ];

  // Progress milestones
  const milestones = [
    { id: '1', name: lang === 'ar' ? 'السنة التحضيرية' : 'Foundation Year', completed: true, credits: 30 },
    { id: '2', name: lang === 'ar' ? 'متطلبات الكلية' : 'College Requirements', completed: true, credits: 24 },
    { id: '3', name: lang === 'ar' ? 'متطلبات التخصص الإجبارية' : 'Major Core', completed: false, progress: 75, credits: 48 },
    { id: '4', name: lang === 'ar' ? 'متطلبات التخصص الاختيارية' : 'Major Electives', completed: false, progress: 50, credits: 18 },
    { id: '5', name: lang === 'ar' ? 'مشروع التخرج' : 'Graduation Project', completed: false, progress: 0, credits: 12 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'probation': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return lang === 'ar' ? 'وضع أكاديمي جيد' : 'Good Standing';
      case 'warning': return lang === 'ar' ? 'إنذار أكاديمي' : 'Academic Warning';
      case 'probation': return lang === 'ar' ? 'تحت المراقبة' : 'Academic Probation';
      default: return status;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Advisor Card */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Advisor Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {advisor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">{advisor.name}</h3>
                  <p className="text-slate-500 mt-1">{advisor.title}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.floor(advisor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                    <span className="text-sm text-slate-600 ml-2">{advisor.rating}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                    <p className="text-sm font-medium text-slate-800">{advisor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-slate-500">{lang === 'ar' ? 'الهاتف' : 'Phone'}</p>
                    <p className="text-sm font-medium text-slate-800">{advisor.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-slate-500">{lang === 'ar' ? 'المكتب' : 'Office'}</p>
                    <p className="text-sm font-medium text-slate-800">{advisor.office}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-slate-500">{lang === 'ar' ? 'الساعات المكتبية' : 'Office Hours'}</p>
                    <p className="text-sm font-medium text-slate-800">{advisor.officeHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3 md:w-64">
              <Button variant="primary" icon={CalendarPlus} fullWidth onClick={() => setShowBookingModal(true)}>
                {lang === 'ar' ? 'حجز موعد' : 'Book Appointment'}
              </Button>
              <Button variant="outline" icon={MessageSquare} fullWidth onClick={() => setShowMessageModal(true)}>
                {lang === 'ar' ? 'إرسال رسالة' : 'Send Message'}
              </Button>
              <Button variant="ghost" icon={Video} fullWidth>
                {lang === 'ar' ? 'اجتماع افتراضي' : 'Virtual Meeting'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Academic Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={lang === 'ar' ? 'المعدل التراكمي' : 'GPA'}
          value={academicStatus.gpa.toFixed(2)}
          subtitle={lang === 'ar' ? 'من 4.0' : 'out of 4.0'}
          icon={TrendingUp}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'الساعات المكتسبة' : 'Credits Earned'}
          value={`${academicStatus.credits}/${academicStatus.requiredCredits}`}
          subtitle={`${Math.round((academicStatus.credits / academicStatus.requiredCredits) * 100)}%`}
          icon={BookOpen}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'المستوى الدراسي' : 'Academic Level'}
          value={academicStatus.level.toString()}
          subtitle={lang === 'ar' ? 'السنة الرابعة' : 'Senior Year'}
          icon={GraduationCap}
          iconColor="text-purple-600 bg-purple-50"
        />
        <StatCard
          title={lang === 'ar' ? 'التخرج المتوقع' : 'Expected Graduation'}
          value={academicStatus.expectedGraduation}
          icon={Target}
          iconColor="text-orange-600 bg-orange-50"
        />
      </div>

      {/* Academic Standing Alert */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${getStatusColor(academicStatus.status)}`}>
        {academicStatus.status === 'good' ? (
          <CheckCircle className="w-5 h-5 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 mt-0.5" />
        )}
        <div>
          <h4 className="font-semibold">{getStatusLabel(academicStatus.status)}</h4>
          <p className="text-sm mt-1 opacity-80">
            {academicStatus.status === 'good'
              ? (lang === 'ar' ? 'أداؤك الأكاديمي ممتاز. استمر في هذا المستوى!' : 'Your academic performance is excellent. Keep it up!')
              : (lang === 'ar' ? 'يرجى مراجعة مرشدك الأكاديمي لتحسين وضعك' : 'Please consult your advisor to improve your standing')}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'توصيات المرشد' : 'Advisor Recommendations'}
          icon={Lightbulb}
          iconColor="text-yellow-600 bg-yellow-50"
        />
        <CardBody>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-800">{rec.title}</h4>
                      <Badge variant={
                        rec.priority === 'high' ? 'danger' :
                        rec.priority === 'medium' ? 'warning' : 'success'
                      } size="sm">
                        {rec.priority === 'high' ? (lang === 'ar' ? 'مهم' : 'High') :
                         rec.priority === 'medium' ? (lang === 'ar' ? 'متوسط' : 'Medium') :
                         (lang === 'ar' ? 'اقتراح' : 'Low')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{rec.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Progress Milestones */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'تقدم الخطة الدراسية' : 'Study Plan Progress'}
          icon={ClipboardList}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <CardBody>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.completed ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">{milestone.name}</span>
                    <span className="text-sm text-slate-500">{milestone.credits} {lang === 'ar' ? 'ساعة' : 'credits'}</span>
                  </div>
                  {!milestone.completed && (
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${milestone.progress || 0}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderAppointmentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">
          {lang === 'ar' ? 'مواعيد الإرشاد' : 'Advising Appointments'}
        </h2>
        <Button variant="primary" icon={CalendarPlus} onClick={() => setShowBookingModal(true)}>
          {lang === 'ar' ? 'حجز موعد جديد' : 'Book New Appointment'}
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'المواعيد القادمة' : 'Upcoming Appointments'}
          icon={Calendar}
          iconColor="text-blue-600 bg-blue-50"
        />
        <CardBody>
          {appointments.filter(a => a.status === 'confirmed').length > 0 ? (
            <div className="space-y-4">
              {appointments.filter(a => a.status === 'confirmed').map((apt) => (
                <div key={apt.id} className="p-4 border border-slate-200 rounded-xl flex items-center gap-4">
                  <div className="w-16 text-center">
                    <p className="text-2xl font-bold text-blue-600">{new Date(apt.date).getDate()}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(apt.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{apt.reason}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </span>
                      <Badge variant={apt.type === 'online' ? 'info' : 'success'}>
                        {apt.type === 'online' ? (lang === 'ar' ? 'افتراضي' : 'Online') : (lang === 'ar' ? 'حضوري' : 'In-person')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {apt.type === 'online' && (
                      <Button variant="primary" size="sm" icon={Video}>
                        {lang === 'ar' ? 'انضمام' : 'Join'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{lang === 'ar' ? 'لا توجد مواعيد قادمة' : 'No upcoming appointments'}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'المواعيد السابقة' : 'Past Appointments'}
          icon={Clock}
          iconColor="text-slate-600 bg-slate-100"
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {appointments.filter(a => a.status === 'completed').map((apt) => (
              <div key={apt.id} className="p-4 flex items-center gap-4">
                <div className="w-12 text-center">
                  <p className="text-lg font-bold text-slate-600">{new Date(apt.date).getDate()}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(apt.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })}
                  </p>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-700">{apt.reason}</h4>
                  <p className="text-sm text-slate-400">{apt.time}</p>
                </div>
                <Badge variant="default">{lang === 'ar' ? 'مكتمل' : 'Completed'}</Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderMessagesTab = () => (
    <div className="space-y-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader
          title={lang === 'ar' ? 'المحادثات مع المرشد' : 'Advisor Messages'}
          icon={MessageSquare}
          iconColor="text-blue-600 bg-blue-50"
        />
        <CardBody className="flex-1 overflow-hidden flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${
                  msg.from === 'student'
                    ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-md'
                } p-4`}>
                  <p className="text-sm">{msg.content}</p>
                  {msg.hasAttachment && (
                    <div className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${
                      msg.from === 'student' ? 'bg-blue-400/30' : 'bg-white'
                    }`}>
                      <FileText className="w-4 h-4" />
                      <span className="text-xs">{lang === 'ar' ? 'الخطة_الدراسية.pdf' : 'study_plan.pdf'}</span>
                      <Download className="w-4 h-4 cursor-pointer hover:text-blue-600" onClick={() => {
                        exportToPDF([{ file: lang === 'ar' ? 'الخطة_الدراسية' : 'study_plan' }], 'study_plan');
                      }} />
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${msg.from === 'student' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.date} • {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <IconButton icon={Paperclip} tooltip={lang === 'ar' ? 'إرفاق ملف' : 'Attach file'} />
              <Input
                placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" icon={Send}>
                {lang === 'ar' ? 'إرسال' : 'Send'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderPlanTab = () => (
    <div className="space-y-6">
      {/* Study Plan Overview */}
      <GradientCard gradient="from-indigo-600 via-purple-600 to-pink-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{lang === 'ar' ? 'الخطة الدراسية' : 'Study Plan'}</h2>
            <p className="text-white/80 mt-1">
              {lang === 'ar' ? 'بكالوريوس علوم الحاسب - 132 ساعة' : 'BSc Computer Science - 132 Credits'}
            </p>
          </div>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" icon={Download} onClick={() => {
            const data = [{
              program: lang === 'ar' ? 'بكالوريوس علوم الحاسب' : 'BSc Computer Science',
              totalCredits: 132,
              completedCredits: 96,
              inProgressCredits: 18,
              remainingCredits: 18
            }];
            exportToPDF(data, 'study-plan');
          }}>
            {lang === 'ar' ? 'تحميل الخطة' : 'Download Plan'}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">96</p>
            <p className="text-sm text-white/70">{lang === 'ar' ? 'ساعات مكتملة' : 'Completed'}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">18</p>
            <p className="text-sm text-white/70">{lang === 'ar' ? 'قيد التسجيل' : 'In Progress'}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">18</p>
            <p className="text-sm text-white/70">{lang === 'ar' ? 'متبقية' : 'Remaining'}</p>
          </div>
        </div>
      </GradientCard>

      {/* Semester by Semester */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'المقررات المتبقية' : 'Remaining Courses'}
          icon={BookOpen}
          iconColor="text-blue-600 bg-blue-50"
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {[
              { code: 'CS401', name: lang === 'ar' ? 'مشروع التخرج 1' : 'Graduation Project 1', credits: 3, semester: lang === 'ar' ? 'الفصل القادم' : 'Next Semester', required: true },
              { code: 'CS402', name: lang === 'ar' ? 'مشروع التخرج 2' : 'Graduation Project 2', credits: 3, semester: lang === 'ar' ? 'الفصل الأخير' : 'Final Semester', required: true },
              { code: 'CS4XX', name: lang === 'ar' ? 'اختياري تخصص 1' : 'Major Elective 1', credits: 3, semester: lang === 'ar' ? 'الفصل القادم' : 'Next Semester', required: false },
              { code: 'CS4XX', name: lang === 'ar' ? 'اختياري تخصص 2' : 'Major Elective 2', credits: 3, semester: lang === 'ar' ? 'الفصل القادم' : 'Next Semester', required: false },
              { code: 'FREE', name: lang === 'ar' ? 'مقرر حر' : 'Free Elective', credits: 3, semester: lang === 'ar' ? 'الفصل الأخير' : 'Final Semester', required: false },
              { code: 'COOP', name: lang === 'ar' ? 'التدريب التعاوني' : 'Cooperative Training', credits: 3, semester: lang === 'ar' ? 'صيفي' : 'Summer', required: true },
            ].map((course, index) => (
              <div key={index} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {course.code.substring(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-800">{course.name}</h4>
                    {course.required && (
                      <Badge variant="danger" size="sm">{lang === 'ar' ? 'إجباري' : 'Required'}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{course.code} • {course.credits} {lang === 'ar' ? 'ساعات' : 'credits'}</p>
                </div>
                <Badge variant="info">{course.semester}</Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: User },
    { id: 'appointments', label: lang === 'ar' ? 'المواعيد' : 'Appointments', icon: Calendar },
    { id: 'messages', label: lang === 'ar' ? 'الرسائل' : 'Messages', icon: MessageSquare },
    { id: 'plan', label: lang === 'ar' ? 'الخطة الدراسية' : 'Study Plan', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ar' ? 'الإرشاد الأكاديمي' : 'Academic Advising'}
          </h1>
          <p className="text-slate-500">
            {lang === 'ar' ? 'تواصل مع مرشدك الأكاديمي واحصل على التوجيه' : 'Connect with your advisor and get guidance'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'appointments' && renderAppointmentsTab()}
      {activeTab === 'messages' && renderMessagesTab()}
      {activeTab === 'plan' && renderPlanTab()}

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title={lang === 'ar' ? 'حجز موعد مع المرشد' : 'Book Advisor Appointment'}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={lang === 'ar' ? 'سبب الموعد' : 'Appointment Reason'}
            options={[
              { value: '', label: lang === 'ar' ? 'اختر السبب' : 'Select reason' },
              { value: 'plan', label: lang === 'ar' ? 'مناقشة الخطة الدراسية' : 'Study plan discussion' },
              { value: 'registration', label: lang === 'ar' ? 'مساعدة في التسجيل' : 'Registration help' },
              { value: 'academic', label: lang === 'ar' ? 'استشارة أكاديمية' : 'Academic consultation' },
              { value: 'graduation', label: lang === 'ar' ? 'متطلبات التخرج' : 'Graduation requirements' },
              { value: 'other', label: lang === 'ar' ? 'أخرى' : 'Other' },
            ]}
            value={appointmentReason}
            onChange={(e) => setAppointmentReason(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {lang === 'ar' ? 'اختر الموعد المتاح' : 'Select Available Slot'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.filter(s => s.available).map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTimeSlot(`${slot.date}-${slot.time}`)}
                  className={`p-3 rounded-lg border text-sm transition-all ${
                    selectedTimeSlot === `${slot.date}-${slot.time}`
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <p className="font-medium">{new Date(slot.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-slate-500">{slot.time}</p>
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label={lang === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
            placeholder={lang === 'ar' ? 'اكتب أي ملاحظات تريد إضافتها...' : 'Add any notes you want to include...'}
            rows={3}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowBookingModal(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" fullWidth icon={CheckCircle}>
              {lang === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Message Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={lang === 'ar' ? 'إرسال رسالة للمرشد' : 'Send Message to Advisor'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={lang === 'ar' ? 'الموضوع' : 'Subject'}
            placeholder={lang === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
          />
          <Textarea
            label={lang === 'ar' ? 'الرسالة' : 'Message'}
            placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
            rows={5}
          />
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors">
            <Paperclip className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-500">
              {lang === 'ar' ? 'انقر لإرفاق ملف أو اسحب الملف هنا' : 'Click to attach file or drag here'}
            </span>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowMessageModal(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" fullWidth icon={Send}>
              {lang === 'ar' ? 'إرسال' : 'Send'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdvisingPage;

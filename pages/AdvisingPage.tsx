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
import { advisingAPI } from '../api/advising';
import { exportToPDF } from '../utils/exportUtils';
import { useToast } from '../hooks/useToast';
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
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'messages' | 'plan'>('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [remainingCourses, setRemainingCourses] = useState<any[]>([]);
  const [studyPlanStats, setStudyPlanStats] = useState({ completed: 0, inProgress: 0, remaining: 0, total: 132 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await studentsAPI.getMyProfile().catch(() => null);
        setStudent(profile);

        // Fetch advising data (appointments, messages, recommendations, milestones)
        try {
          const [appointmentsData, messagesData, recommendationsData, milestonesData] = await Promise.all([
            advisingAPI.getMyAppointments().catch(() => []),
            advisingAPI.getMessages().catch(() => []),
            advisingAPI.getMyRecommendations().catch(() => []),
            advisingAPI.getMilestones().catch(() => []),
          ]);
          setAppointments(appointmentsData.data || appointmentsData || []);
          setMessages(messagesData.data || messagesData || []);
          setRecommendations(recommendationsData.data || recommendationsData || []);
          setMilestones(milestonesData.data || milestonesData || []);

          // Fetch available slots if advisor exists
          if (profile?.advisor?.id) {
            const slotsData = await advisingAPI.getAvailableSlots(profile.advisor.id).catch(() => []);
            setAvailableSlots(slotsData.data || slotsData || []);
          }
        } catch (err) {
          // Error fetching advising data
        }

        // Fetch study plan / remaining courses
        if (profile?.program_id || profile?.student?.program_id || profile?.student?.program?.id) {
          const programId = profile.program_id || profile.student?.program_id || profile.student?.program?.id;
          try {
            const apiBase = (window as any).API_BASE_URL || import.meta.env.VITE_API_URL || 'https://sis.vertexuniversity.edu.eu/api';
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const res = await fetch(`${apiBase.replace('/api', '')}/programs-courses.php?program_id=${programId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await res.json();

            if (data.courses) {
              // Get enrolled/completed course codes
              const enrollments = await studentsAPI.getEnrollments(profile.id || profile.student?.id).catch(() => []);
              const enrolledCodes = new Set((enrollments.data || enrollments || []).map((e: any) => e.course?.code || e.courseCode));

              // Filter for remaining courses
              const remaining = data.courses.filter((c: any) => !enrolledCodes.has(c.code));
              setRemainingCourses(remaining.slice(0, 10)); // Show first 10 remaining

              // Calculate stats
              const totalCredits = data.program?.total_credits || 132;
              const completedCredits = profile.completed_credits || profile.student?.completed_credits || 0;
              const inProgressCredits = (enrollments.data || enrollments || []).reduce((sum: number, e: any) => sum + (e.course?.credits || 3), 0);

              setStudyPlanStats({
                completed: completedCredits,
                inProgress: inProgressCredits,
                remaining: totalCredits - completedCredits - inProgressCredits,
                total: totalCredits
              });
            }
          } catch (err) {
            // Error fetching study plan
          }
        }
      } catch (error) {
        // Error fetching data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Advisor info - from student profile or empty
  const advisor = student?.advisor ? {
    id: student.advisor.id || '',
    name: lang === 'ar' ? (student.advisor.name_ar || student.advisor.name) : (student.advisor.name || student.advisor.name_en),
    title: lang === 'ar' ? (student.advisor.title_ar || student.advisor.title) : (student.advisor.title || ''),
    email: student.advisor.email || '',
    phone: student.advisor.phone || '',
    office: student.advisor.office || '',
    officeHours: student.advisor.office_hours || '',
    avatar: student.advisor.avatar,
    rating: student.advisor.rating || 0,
    studentsCount: student.advisor.students_count || 0,
    responseTime: lang === 'ar' ? 'خلال 24 ساعة' : 'Within 24 hours',
  } : null;

  // Academic status - from student profile
  const academicStatus = student ? {
    gpa: student.gpa || student.student?.gpa || 0,
    credits: student.completed_credits || student.student?.completed_credits || 0,
    requiredCredits: student.program?.total_credits || student.student?.program?.total_credits || 132,
    level: student.level || student.student?.level || 1,
    status: student.academic_status || student.student?.academic_status || 'good',
    warningsCount: student.warnings_count || 0,
    maxWarnings: 3,
    expectedGraduation: student.expected_graduation || '',
  } : null;

  // Book appointment handler
  const handleBookAppointment = async () => {
    if (!selectedTimeSlot || !appointmentReason) {
      toast.warning(lang === 'ar' ? 'يرجى اختيار الوقت والسبب' : 'Please select time and reason');
      return;
    }
    try {
      setBookingLoading(true);
      const [date, time] = selectedTimeSlot.split('-');
      await advisingAPI.bookAppointment({
        advisor_id: advisor?.id,
        date,
        time,
        reason: appointmentReason,
        type: 'in_person',
      });
      toast.success(lang === 'ar' ? 'تم حجز الموعد بنجاح' : 'Appointment booked successfully');
      setShowBookingModal(false);
      setSelectedTimeSlot('');
      setAppointmentReason('');
      // Refresh appointments
      const appointmentsData = await advisingAPI.getMyAppointments().catch(() => []);
      setAppointments(appointmentsData.data || appointmentsData || []);
    } catch (error) {
      toast.error(lang === 'ar' ? 'حدث خطأ في حجز الموعد' : 'Error booking appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel appointment handler
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await advisingAPI.cancelAppointment(appointmentId);
      toast.success(lang === 'ar' ? 'تم إلغاء الموعد' : 'Appointment cancelled');
      // Refresh appointments
      const appointmentsData = await advisingAPI.getMyAppointments().catch(() => []);
      setAppointments(appointmentsData.data || appointmentsData || []);
    } catch (error) {
      toast.error(lang === 'ar' ? 'حدث خطأ في إلغاء الموعد' : 'Error cancelling appointment');
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.warning(lang === 'ar' ? 'يرجى كتابة رسالة' : 'Please enter a message');
      return;
    }
    try {
      setSendingMessage(true);
      await advisingAPI.sendMessage({
        advisor_id: advisor?.id,
        subject: messageSubject || (lang === 'ar' ? 'رسالة جديدة' : 'New Message'),
        content: newMessage,
      });
      toast.success(lang === 'ar' ? 'تم إرسال الرسالة' : 'Message sent');
      setNewMessage('');
      setMessageSubject('');
      setShowMessageModal(false);
      // Refresh messages
      const messagesData = await advisingAPI.getMessages().catch(() => []);
      setMessages(messagesData.data || messagesData || []);
    } catch (error) {
      toast.error(lang === 'ar' ? 'حدث خطأ في إرسال الرسالة' : 'Error sending message');
    } finally {
      setSendingMessage(false);
    }
  };

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
      {advisor ? (
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Advisor Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {advisor.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">{advisor.name || (lang === 'ar' ? 'غير محدد' : 'Not assigned')}</h3>
                  <p className="text-slate-500 mt-1">{advisor.title}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.floor(advisor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                    <span className="text-sm text-slate-600 ms-2">{advisor.rating}</span>
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
      ) : (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{lang === 'ar' ? 'لم يتم تعيين مرشد أكاديمي بعد' : 'No academic advisor assigned yet'}</p>
          </div>
        </CardBody>
      </Card>
      )}

      {/* Academic Status */}
      {academicStatus && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <StatCard
              title={lang === 'ar' ? 'المعدل التراكمي' : 'GPA'}
              value={Number(academicStatus.gpa || 0).toFixed(2)}
              subtitle={lang === 'ar' ? 'من 4.0' : 'out of 4.0'}
              icon={TrendingUp}
              iconColor="text-green-600 bg-green-50"
            />
            <StatCard
              title={lang === 'ar' ? 'الساعات المكتسبة' : 'Credits Earned'}
              value={`${academicStatus.credits || 0}/${academicStatus.requiredCredits || 132}`}
              subtitle={`${Math.round(((academicStatus.credits || 0) / (academicStatus.requiredCredits || 132)) * 100)}%`}
              icon={BookOpen}
              iconColor="text-blue-600 bg-blue-50"
            />
            <StatCard
              title={lang === 'ar' ? 'المستوى الدراسي' : 'Academic Level'}
              value={(academicStatus.level || 1).toString()}
              subtitle={lang === 'ar' ? 'السنة الرابعة' : 'Senior Year'}
              icon={GraduationCap}
              iconColor="text-purple-600 bg-purple-50"
            />
            <StatCard
              title={lang === 'ar' ? 'التخرج المتوقع' : 'Expected Graduation'}
              value={academicStatus.expectedGraduation || '--'}
              icon={Target}
              iconColor="text-orange-600 bg-orange-50"
            />
          </div>

          {/* Academic Standing Alert */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${getStatusColor(academicStatus.status || 'good')}`}>
            {(academicStatus.status || 'good') === 'good' ? (
              <CheckCircle className="w-5 h-5 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold">{getStatusLabel(academicStatus.status || 'good')}</h4>
              <p className="text-sm mt-1 opacity-80">
                {(academicStatus.status || 'good') === 'good'
                  ? (lang === 'ar' ? 'أداؤك الأكاديمي ممتاز. استمر في هذا المستوى!' : 'Your academic performance is excellent. Keep it up!')
                  : (lang === 'ar' ? 'يرجى مراجعة مرشدك الأكاديمي لتحسين وضعك' : 'Please consult your advisor to improve your standing')}
              </p>
            </div>
          </div>
        </>
      )}

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
                    {apt.type === 'online' && apt.meeting_url && (
                      <Button variant="primary" size="sm" icon={Video} onClick={() => window.open(apt.meeting_url, '_blank')}>
                        {lang === 'ar' ? 'انضمام' : 'Join'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleCancelAppointment(apt.id)}>
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

  const renderPlanTab = () => {
    const programName = student?.program?.name || student?.student?.program?.name || (lang === 'ar' ? 'البرنامج الدراسي' : 'Academic Program');
    const programNameAr = student?.program?.name_ar || student?.student?.program?.name_ar || '';

    return (
    <div className="space-y-6">
      {/* Study Plan Overview */}
      <GradientCard gradient="from-indigo-600 via-purple-600 to-pink-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{lang === 'ar' ? 'الخطة الدراسية' : 'Study Plan'}</h2>
            <p className="text-white/80 mt-1">
              {lang === 'ar' ? programNameAr || programName : programName} - {studyPlanStats.total} {lang === 'ar' ? 'ساعة' : 'Credits'}
            </p>
          </div>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" icon={Download} onClick={() => {
            const data = [{
              program: lang === 'ar' ? programNameAr || programName : programName,
              totalCredits: studyPlanStats.total,
              completedCredits: studyPlanStats.completed,
              inProgressCredits: studyPlanStats.inProgress,
              remainingCredits: studyPlanStats.remaining
            }];
            exportToPDF(data, 'study-plan');
          }}>
            {lang === 'ar' ? 'تحميل الخطة' : 'Download Plan'}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{studyPlanStats.completed}</p>
            <p className="text-sm text-white/70">{lang === 'ar' ? 'ساعات مكتملة' : 'Completed'}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{studyPlanStats.inProgress}</p>
            <p className="text-sm text-white/70">{lang === 'ar' ? 'قيد التسجيل' : 'In Progress'}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{studyPlanStats.remaining}</p>
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
            {remainingCourses.length > 0 ? remainingCourses.map((course, index) => (
              <div key={index} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {(course.code || 'XX').substring(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-800">{lang === 'ar' ? (course.name_ar || course.name) : (course.name || course.name_en)}</h4>
                    {course.type === 'required' && (
                      <Badge variant="danger" size="sm">{lang === 'ar' ? 'إجباري' : 'Required'}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{course.code} • {course.credits || 3} {lang === 'ar' ? 'ساعات' : 'credits'}</p>
                </div>
                <Badge variant="info">{lang === 'ar' ? `الفصل ${course.semester || ''}` : `Semester ${course.semester || ''}`}</Badge>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>{lang === 'ar' ? 'لا توجد مقررات متبقية أو جاري تحميل البيانات' : 'No remaining courses or loading data'}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
  };

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
            <Button variant="primary" fullWidth icon={CheckCircle} onClick={handleBookAppointment} disabled={!selectedTimeSlot || bookingLoading}>
              {bookingLoading ? (lang === 'ar' ? 'جاري الحجز...' : 'Booking...') : (lang === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking')}
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
            value={messageSubject}
            onChange={(e) => setMessageSubject(e.target.value)}
          />
          <Textarea
            label={lang === 'ar' ? 'الرسالة' : 'Message'}
            placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
            rows={5}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
            <Button variant="primary" fullWidth icon={Send} onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}>
              {sendingMessage ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إرسال' : 'Send')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdvisingPage;

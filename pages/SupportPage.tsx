import React, { useState } from 'react';
import {
  MessageCircle, Phone, Mail, Clock, Search, Plus, Send,
  CheckCircle, XCircle, AlertCircle, HelpCircle, FileText,
  ChevronRight, ExternalLink, Book, Video, Users, Headphones,
  MessageSquare, Calendar, MapPin, Star, ThumbsUp, Eye
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Select, SearchInput, Textarea } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';

interface SupportPageProps {
  lang: 'en' | 'ar';
}

const SupportPage: React.FC<SupportPageProps> = ({ lang }) => {
  const t = TRANSLATIONS;
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'contact'>('tickets');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showTicketDetailsModal, setShowTicketDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [faqCategory, setFaqCategory] = useState('all');

  const [ticketForm, setTicketForm] = useState({
    category: 'academic',
    subject: '',
    priority: 'medium',
    description: '',
  });

  // Tickets data - empty until backend API is implemented
  // TODO: Replace with API call to fetch real tickets
  const myTickets: Array<{
    id: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    createdAt: string;
    lastUpdate: string;
    messages: number;
  }> = [];

  // FAQ data
  const faqCategories = [
    { id: 'registration', label: lang === 'ar' ? 'التسجيل' : 'Registration', icon: Book },
    { id: 'financial', label: lang === 'ar' ? 'المالية' : 'Financial', icon: FileText },
    { id: 'academic', label: lang === 'ar' ? 'الأكاديمية' : 'Academic', icon: Users },
    { id: 'technical', label: lang === 'ar' ? 'التقنية' : 'Technical', icon: HelpCircle },
  ];

  const faqItems = [
    {
      id: '1',
      category: 'registration',
      question: lang === 'ar' ? 'كيف أسجل في المقررات الدراسية؟' : 'How do I register for courses?',
      answer: lang === 'ar'
        ? 'يمكنك التسجيل عبر صفحة الشؤون الأكاديمية > التسجيل. اختر المقررات المتاحة وأضفها إلى سلة التسجيل ثم قم بتأكيد التسجيل.'
        : 'You can register through the Academic Affairs page > Registration. Select available courses, add them to your cart, and confirm registration.',
    },
    {
      id: '2',
      category: 'registration',
      question: lang === 'ar' ? 'ما هي فترة الحذف والإضافة؟' : 'What is the add/drop period?',
      answer: lang === 'ar'
        ? 'فترة الحذف والإضافة تكون خلال الأسبوعين الأولين من بداية الفصل الدراسي.'
        : 'The add/drop period is during the first two weeks of the semester.',
    },
    {
      id: '3',
      category: 'financial',
      question: lang === 'ar' ? 'كيف أدفع الرسوم الدراسية؟' : 'How do I pay tuition fees?',
      answer: lang === 'ar'
        ? 'يمكنك الدفع عبر صفحة المالية باستخدام بطاقة الائتمان أو التحويل البنكي. كما يمكنك الدفع نقداً في مكتب الشؤون المالية.'
        : 'You can pay through the Finance page using credit card or bank transfer. You can also pay in cash at the Financial Affairs office.',
    },
    {
      id: '4',
      category: 'financial',
      question: lang === 'ar' ? 'هل يمكنني تقسيط الرسوم؟' : 'Can I pay fees in installments?',
      answer: lang === 'ar'
        ? 'نعم، يمكنك التقدم بطلب خطة تقسيط من خلال مكتب الشؤون المالية.'
        : 'Yes, you can apply for an installment plan through the Financial Affairs office.',
    },
    {
      id: '5',
      category: 'academic',
      question: lang === 'ar' ? 'كيف أحسب معدلي التراكمي؟' : 'How is my GPA calculated?',
      answer: lang === 'ar'
        ? 'المعدل التراكمي = مجموع (درجة المقرر × عدد الساعات) / إجمالي الساعات المكتملة'
        : 'GPA = Sum of (Course Grade × Credit Hours) / Total Completed Credit Hours',
    },
    {
      id: '6',
      category: 'technical',
      question: lang === 'ar' ? 'نسيت كلمة المرور، ماذا أفعل؟' : 'I forgot my password, what should I do?',
      answer: lang === 'ar'
        ? 'انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول وأدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين.'
        : 'Click "Forgot Password" on the login page and enter your email to receive a reset link.',
    },
  ];

  // Contact info
  const contactInfo = [
    {
      title: lang === 'ar' ? 'عمادة شؤون الطلبة' : 'Student Affairs',
      description: lang === 'ar' ? 'للخدمات الطلابية والدعم الأكاديمي' : 'For student services and academic support',
      phone: '+966 11 123 4567',
      email: 'students@vertexuniversity.edu.eu',
      hours: lang === 'ar' ? 'السبت - الخميس بتوقيت مكة المكرمة' : 'Sat - Thu (Makkah Time)',
      icon: Headphones,
    },
    {
      title: lang === 'ar' ? 'عمادة القبول والتسجيل' : 'Admissions & Registration',
      description: lang === 'ar' ? 'التسجيل وإدارة السجلات الأكاديمية' : 'Registration and academic records management',
      phone: '+966 11 123 4568',
      email: 'admissions@vertexuniversity.edu.eu',
      hours: lang === 'ar' ? 'السبت - الخميس بتوقيت مكة المكرمة' : 'Sat - Thu (Makkah Time)',
      icon: Users,
    },
    {
      title: lang === 'ar' ? 'إدارة الشؤون المالية' : 'Financial Affairs',
      description: lang === 'ar' ? 'للرسوم الدراسية والمعاملات المالية' : 'For tuition fees and financial transactions',
      phone: '+966 11 123 4569',
      email: 'finance@university.edu',
      hours: lang === 'ar' ? 'السبت - الخميس بتوقيت مكة المكرمة' : 'Sat - Thu (Makkah Time)',
      icon: FileText,
    },
    {
      title: lang === 'ar' ? 'إدارة تقنية المعلومات' : 'IT Department',
      description: lang === 'ar' ? 'لدعم الأنظمة والمنصات التعليمية' : 'For systems and educational platforms support',
      email: 'it@vertexuniversity.edu.eu',
      hours: lang === 'ar' ? 'على مدار الساعة' : '24/7',
      icon: HelpCircle,
    },
  ];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      academic: { en: 'Academic', ar: 'أكاديمي' },
      financial: { en: 'Financial', ar: 'مالي' },
      technical: { en: 'Technical', ar: 'تقني' },
      documents: { en: 'Documents', ar: 'وثائق' },
      other: { en: 'Other', ar: 'أخرى' },
    };
    return labels[category]?.[lang] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      open: { en: 'Open', ar: 'مفتوح' },
      in_progress: { en: 'In Progress', ar: 'قيد المعالجة' },
      resolved: { en: 'Resolved', ar: 'تم الحل' },
      closed: { en: 'Closed', ar: 'مغلق' },
    };
    return labels[status]?.[lang] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      high: { en: 'High', ar: 'عالي' },
      medium: { en: 'Medium', ar: 'متوسط' },
      low: { en: 'Low', ar: 'منخفض' },
    };
    return labels[priority]?.[lang] || priority;
  };

  const handleSubmitTicket = () => {
    console.log('Submitting ticket:', ticketForm);
    setShowNewTicketModal(false);
    setTicketForm({
      category: 'academic',
      subject: '',
      priority: 'medium',
      description: '',
    });
  };

  const renderTicketsTab = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" icon={Plus} onClick={() => setShowNewTicketModal(true)}>
          {lang === 'ar' ? 'تذكرة جديدة' : 'New Ticket'}
        </Button>
        <SearchInput
          placeholder={lang === 'ar' ? 'بحث في التذاكر...' : 'Search tickets...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth={false}
          className="w-64"
        />
        <Select
          options={[
            { value: 'all', label: lang === 'ar' ? 'جميع الحالات' : 'All Status' },
            { value: 'open', label: lang === 'ar' ? 'مفتوح' : 'Open' },
            { value: 'in_progress', label: lang === 'ar' ? 'قيد المعالجة' : 'In Progress' },
            { value: 'resolved', label: lang === 'ar' ? 'تم الحل' : 'Resolved' },
            { value: 'closed', label: lang === 'ar' ? 'مغلق' : 'Closed' },
          ]}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          fullWidth={false}
          className="w-40"
        />
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'}
          icon={MessageCircle}
          iconColor="text-blue-600 bg-blue-50"
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {myTickets
              .filter(ticket => {
                // Filter by status
                if (selectedStatus !== 'all' && ticket.status !== selectedStatus) return false;
                // Filter by search query
                if (searchQuery && !ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !ticket.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
              })
              .map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowTicketDetailsModal(true);
                }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  ticket.status === 'open' ? 'bg-blue-100 text-blue-600' :
                  ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                  ticket.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{ticket.id}</span>
                    <Badge variant={getStatusVariant(ticket.status) as any}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                    {ticket.priority === 'high' && (
                      <Badge variant="danger">{getPriorityLabel(ticket.priority)}</Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-slate-800">{ticket.subject}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ticket.lastUpdate}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.messages} {lang === 'ar' ? 'رسائل' : 'messages'}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
            {myTickets.filter(ticket => {
              if (selectedStatus !== 'all' && ticket.status !== selectedStatus) return false;
              if (searchQuery && !ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  !ticket.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
              return true;
            }).length === 0 && (
              myTickets.length === 0 ? (
                <EmptyState
                  type="no-data"
                  lang={lang}
                  title={lang === 'ar' ? 'لا توجد تذاكر' : 'No Tickets'}
                  description={lang === 'ar' ? 'لم تقم بإنشاء أي تذاكر دعم بعد' : "You haven't created any support tickets yet"}
                  action={{
                    label: lang === 'ar' ? 'إنشاء تذكرة' : 'Create Ticket',
                    onClick: () => setShowNewTicketModal(true)
                  }}
                />
              ) : (
                <EmptyState
                  type="no-results"
                  lang={lang}
                  action={{
                    label: lang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters',
                    onClick: () => {
                      setSearchQuery('');
                      setSelectedStatus('all');
                    }
                  }}
                />
              )
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderFaqTab = () => (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFaqCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            faqCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {lang === 'ar' ? 'الكل' : 'All'}
        </button>
        {faqCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFaqCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              faqCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <SearchInput
        placeholder={lang === 'ar' ? 'ابحث في الأسئلة الشائعة...' : 'Search FAQs...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
      />

      {/* FAQ List */}
      <div className="space-y-4">
        {faqItems
          .filter(item => faqCategory === 'all' || item.category === faqCategory)
          .filter(item =>
            searchQuery === '' ||
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => (
            <Card key={item.id}>
              <CardBody>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <h4 className="font-medium text-slate-800">{item.question}</h4>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="mt-4 ps-11 text-slate-600">
                    {item.answer}
                  </div>
                  <div className="mt-4 ps-11 flex items-center gap-4">
                    <span className="text-sm text-slate-500">{lang === 'ar' ? 'هل كان هذا مفيداً؟' : 'Was this helpful?'}</span>
                    <button className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
                      <ThumbsUp className="w-4 h-4" />
                      {lang === 'ar' ? 'نعم' : 'Yes'}
                    </button>
                  </div>
                </details>
              </CardBody>
            </Card>
          ))}
      </div>

      {/* Still need help? */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">
                {lang === 'ar' ? 'لم تجد إجابتك؟' : "Didn't find your answer?"}
              </h4>
              <p className="text-sm text-slate-600">
                {lang === 'ar' ? 'تواصل مع فريق الدعم مباشرة' : 'Contact our support team directly'}
              </p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setShowNewTicketModal(true)}>
              {lang === 'ar' ? 'فتح تذكرة' : 'Open Ticket'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-6">
      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactInfo.map((info, index) => (
          <Card key={index}>
            <CardBody>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <info.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{info.title}</h4>
                  <p className="text-sm text-slate-500 mb-3">{info.description}</p>

                  <div className="space-y-2">
                    <a
                      href={`tel:${info.phone}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                    >
                      <Phone className="w-4 h-4" />
                      {info.phone}
                    </a>
                    <a
                      href={`mailto:${info.email}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                    >
                      <Mail className="w-4 h-4" />
                      {info.email}
                    </a>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      {info.hours}
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'روابط مفيدة' : 'Useful Links'}
          icon={ExternalLink}
          iconColor="text-purple-600 bg-purple-50"
        />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="#" className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center">
              <Book className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-700">
                {lang === 'ar' ? 'دليل الطالب' : 'Student Guide'}
              </span>
            </a>
            <a href="#" className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center">
              <Video className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-700">
                {lang === 'ar' ? 'فيديوهات تعليمية' : 'Tutorial Videos'}
              </span>
            </a>
            <a href="#" className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center">
              <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-700">
                {lang === 'ar' ? 'النماذج والوثائق' : 'Forms & Docs'}
              </span>
            </a>
            <a href="#" className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-slate-700">
                {lang === 'ar' ? 'التقويم الأكاديمي' : 'Academic Calendar'}
              </span>
            </a>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ar' ? 'مركز الدعم' : 'Support Center'}
          </h1>
          <p className="text-slate-500">
            {lang === 'ar' ? 'احصل على المساعدة وتواصل مع فريق الدعم' : 'Get help and contact our support team'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowNewTicketModal(true)}>
          {lang === 'ar' ? 'تذكرة جديدة' : 'New Ticket'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'تذاكر مفتوحة' : 'Open Tickets'}
          value={myTickets.filter(t => t.status === 'open').length.toString()}
          icon={MessageCircle}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'قيد المعالجة' : 'In Progress'}
          value={myTickets.filter(t => t.status === 'in_progress').length.toString()}
          icon={Clock}
          iconColor="text-yellow-600 bg-yellow-50"
        />
        <StatCard
          title={lang === 'ar' ? 'تم حلها' : 'Resolved'}
          value={myTickets.filter(t => t.status === 'resolved').length.toString()}
          icon={CheckCircle}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'متوسط الاستجابة' : 'Avg Response'}
          value="2h"
          subtitle={lang === 'ar' ? 'ساعات' : 'hours'}
          icon={Star}
          iconColor="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'tickets' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {lang === 'ar' ? 'تذاكري' : 'My Tickets'}
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'faq' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'contact' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tickets' && renderTicketsTab()}
      {activeTab === 'faq' && renderFaqTab()}
      {activeTab === 'contact' && renderContactTab()}

      {/* New Ticket Modal */}
      <Modal
        isOpen={showNewTicketModal}
        onClose={() => setShowNewTicketModal(false)}
        title={lang === 'ar' ? 'إنشاء تذكرة جديدة' : 'Create New Ticket'}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label={lang === 'ar' ? 'التصنيف' : 'Category'}
            options={[
              { value: 'academic', label: lang === 'ar' ? 'أكاديمي' : 'Academic' },
              { value: 'financial', label: lang === 'ar' ? 'مالي' : 'Financial' },
              { value: 'technical', label: lang === 'ar' ? 'تقني' : 'Technical' },
              { value: 'documents', label: lang === 'ar' ? 'وثائق' : 'Documents' },
              { value: 'other', label: lang === 'ar' ? 'أخرى' : 'Other' },
            ]}
            value={ticketForm.category}
            onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
          />

          <Input
            label={lang === 'ar' ? 'الموضوع' : 'Subject'}
            placeholder={lang === 'ar' ? 'أدخل موضوع التذكرة' : 'Enter ticket subject'}
            value={ticketForm.subject}
            onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
          />

          <Select
            label={lang === 'ar' ? 'الأولوية' : 'Priority'}
            options={[
              { value: 'low', label: lang === 'ar' ? 'منخفض' : 'Low' },
              { value: 'medium', label: lang === 'ar' ? 'متوسط' : 'Medium' },
              { value: 'high', label: lang === 'ar' ? 'عالي' : 'High' },
            ]}
            value={ticketForm.priority}
            onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
          />

          <Textarea
            label={lang === 'ar' ? 'الوصف' : 'Description'}
            placeholder={lang === 'ar' ? 'اشرح مشكلتك أو استفسارك بالتفصيل...' : 'Describe your issue or inquiry in detail...'}
            value={ticketForm.description}
            onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
            rows={5}
          />

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" fullWidth onClick={() => setShowNewTicketModal(false)}>
              {t.cancel[lang]}
            </Button>
            <Button variant="primary" fullWidth onClick={handleSubmitTicket} icon={Send}>
              {lang === 'ar' ? 'إرسال التذكرة' : 'Submit Ticket'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal
        isOpen={showTicketDetailsModal}
        onClose={() => setShowTicketDetailsModal(false)}
        title={lang === 'ar' ? 'تفاصيل التذكرة' : 'Ticket Details'}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Header */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedTicket.status === 'open' ? 'bg-blue-100 text-blue-600' :
                selectedTicket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500">{selectedTicket.id}</span>
                  <Badge variant={getStatusVariant(selectedTicket.status) as any}>
                    {getStatusLabel(selectedTicket.status)}
                  </Badge>
                  {selectedTicket.priority === 'high' && (
                    <Badge variant="danger">{getPriorityLabel(selectedTicket.priority)}</Badge>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{selectedTicket.subject}</h3>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'التصنيف' : 'Category'}</p>
                <p className="font-medium text-slate-800">{getCategoryLabel(selectedTicket.category)}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'الأولوية' : 'Priority'}</p>
                <p className="font-medium text-slate-800">{getPriorityLabel(selectedTicket.priority)}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</p>
                <p className="font-medium text-slate-800">{selectedTicket.createdAt}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'آخر تحديث' : 'Last Update'}</p>
                <p className="font-medium text-slate-800">{selectedTicket.lastUpdate}</p>
              </div>
            </div>

            {/* Messages Preview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">
                  {lang === 'ar' ? 'الرسائل' : 'Messages'}
                </h4>
              </div>
              <p className="text-blue-700">
                {selectedTicket.messages} {lang === 'ar' ? 'رسائل في هذه المحادثة' : 'messages in this conversation'}
              </p>
            </div>

            {/* Sample Reply Area */}
            <div className="space-y-3">
              <Textarea
                label={lang === 'ar' ? 'إضافة رد' : 'Add Reply'}
                placeholder={lang === 'ar' ? 'اكتب ردك هنا...' : 'Type your reply here...'}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" fullWidth onClick={() => setShowTicketDetailsModal(false)}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
              <Button variant="primary" fullWidth icon={Send}>
                {lang === 'ar' ? 'إرسال الرد' : 'Send Reply'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportPage;

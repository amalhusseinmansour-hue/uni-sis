import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle,
  Plus, Filter, Search, Calendar, Printer, Mail, Building, Award,
  GraduationCap, CreditCard, BookOpen, Shield, Star, Hash, User,
  ChevronRight, ExternalLink, RefreshCw, Truck, QrCode
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { studentsAPI } from '../api/students';
import { exportToPDF } from '../utils/exportUtils';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Select, SearchInput, Textarea } from '../components/ui/Input';

interface CertificatesPageProps {
  lang: 'en' | 'ar';
}

const CertificatesPage: React.FC<CertificatesPageProps> = ({ lang }) => {
  const t = TRANSLATIONS;
  const [activeTab, setActiveTab] = useState<'available' | 'requests' | 'documents'>('available');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Request form state
  const [requestForm, setRequestForm] = useState({
    certificateType: '',
    purpose: '',
    language: 'ar',
    copies: '1',
    deliveryMethod: 'pickup',
    notes: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Available certificates
  const availableCertificates = [
    {
      id: '1',
      type: 'enrollment',
      name: lang === 'ar' ? 'شهادة قيد' : 'Enrollment Certificate',
      description: lang === 'ar' ? 'تثبت أنك طالب مسجل حالياً في الجامعة' : 'Proves you are currently enrolled at the university',
      icon: GraduationCap,
      fee: 0,
      processingTime: lang === 'ar' ? 'فوري' : 'Instant',
      available: true,
      popular: true,
    },
    {
      id: '2',
      type: 'transcript',
      name: lang === 'ar' ? 'السجل الأكاديمي' : 'Academic Transcript',
      description: lang === 'ar' ? 'سجل رسمي يحتوي جميع درجاتك ومقرراتك' : 'Official record of all your grades and courses',
      icon: BookOpen,
      fee: 50,
      processingTime: lang === 'ar' ? '1-2 يوم عمل' : '1-2 business days',
      available: true,
      popular: true,
    },
    {
      id: '3',
      type: 'gpa',
      name: lang === 'ar' ? 'شهادة المعدل التراكمي' : 'GPA Certificate',
      description: lang === 'ar' ? 'شهادة رسمية بمعدلك التراكمي الحالي' : 'Official certificate of your current GPA',
      icon: Award,
      fee: 30,
      processingTime: lang === 'ar' ? 'فوري' : 'Instant',
      available: true,
      popular: false,
    },
    {
      id: '4',
      type: 'good_conduct',
      name: lang === 'ar' ? 'شهادة حسن سيرة وسلوك' : 'Good Conduct Certificate',
      description: lang === 'ar' ? 'تثبت التزامك بقواعد وأنظمة الجامعة' : 'Proves your compliance with university rules',
      icon: Shield,
      fee: 30,
      processingTime: lang === 'ar' ? '2-3 أيام عمل' : '2-3 business days',
      available: true,
      popular: false,
    },
    {
      id: '5',
      type: 'expected_graduation',
      name: lang === 'ar' ? 'شهادة التخرج المتوقع' : 'Expected Graduation Certificate',
      description: lang === 'ar' ? 'تثبت موعد تخرجك المتوقع' : 'Confirms your expected graduation date',
      icon: Calendar,
      fee: 30,
      processingTime: lang === 'ar' ? '3-5 أيام عمل' : '3-5 business days',
      available: true,
      popular: false,
    },
    {
      id: '6',
      type: 'ranking',
      name: lang === 'ar' ? 'شهادة الترتيب' : 'Ranking Certificate',
      description: lang === 'ar' ? 'توضح ترتيبك بين طلاب دفعتك' : 'Shows your rank among peers',
      icon: Star,
      fee: 50,
      processingTime: lang === 'ar' ? '3-5 أيام عمل' : '3-5 business days',
      available: false,
      popular: false,
    },
    {
      id: '7',
      type: 'course_completion',
      name: lang === 'ar' ? 'شهادة إتمام مقرر' : 'Course Completion Certificate',
      description: lang === 'ar' ? 'شهادة بإتمام مقرر معين بنجاح' : 'Certificate of successful course completion',
      icon: CheckCircle,
      fee: 20,
      processingTime: lang === 'ar' ? '1-2 يوم عمل' : '1-2 business days',
      available: true,
      popular: false,
    },
    {
      id: '8',
      type: 'financial_clearance',
      name: lang === 'ar' ? 'براءة ذمة مالية' : 'Financial Clearance',
      description: lang === 'ar' ? 'تثبت خلوك من أي مستحقات مالية' : 'Proves you have no financial obligations',
      icon: CreditCard,
      fee: 0,
      processingTime: lang === 'ar' ? 'فوري' : 'Instant',
      available: true,
      popular: false,
    },
  ];

  // My certificate requests
  const myRequests = [
    {
      id: 'REQ-2024-001',
      type: 'enrollment',
      name: lang === 'ar' ? 'شهادة قيد' : 'Enrollment Certificate',
      requestDate: '2024-11-25',
      status: 'ready',
      language: 'ar',
      copies: 2,
      fee: 0,
      trackingNumber: 'TRK-12345',
    },
    {
      id: 'REQ-2024-002',
      type: 'transcript',
      name: lang === 'ar' ? 'السجل الأكاديمي' : 'Academic Transcript',
      requestDate: '2024-11-28',
      status: 'processing',
      language: 'en',
      copies: 1,
      fee: 50,
      trackingNumber: 'TRK-12346',
    },
    {
      id: 'REQ-2024-003',
      type: 'gpa',
      name: lang === 'ar' ? 'شهادة المعدل' : 'GPA Certificate',
      requestDate: '2024-11-20',
      status: 'delivered',
      language: 'ar',
      copies: 1,
      fee: 30,
      trackingNumber: 'TRK-12340',
    },
    {
      id: 'REQ-2024-004',
      type: 'good_conduct',
      name: lang === 'ar' ? 'شهادة حسن سيرة' : 'Good Conduct',
      requestDate: '2024-11-15',
      status: 'rejected',
      language: 'ar',
      copies: 1,
      fee: 30,
      rejectReason: lang === 'ar' ? 'يوجد مخالفة سلوكية قيد المراجعة' : 'Pending disciplinary review',
    },
  ];

  // My uploaded documents
  const myDocuments = [
    {
      id: '1',
      name: lang === 'ar' ? 'صورة الهوية الوطنية' : 'National ID Copy',
      type: 'id',
      uploadDate: '2024-09-01',
      status: 'verified',
      expiryDate: '2028-05-15',
    },
    {
      id: '2',
      name: lang === 'ar' ? 'شهادة الثانوية العامة' : 'High School Certificate',
      type: 'education',
      uploadDate: '2024-09-01',
      status: 'verified',
      expiryDate: null,
    },
    {
      id: '3',
      name: lang === 'ar' ? 'صورة جواز السفر' : 'Passport Copy',
      type: 'id',
      uploadDate: '2024-09-15',
      status: 'pending',
      expiryDate: '2029-03-20',
    },
    {
      id: '4',
      name: lang === 'ar' ? 'إثبات عنوان السكن' : 'Address Proof',
      type: 'address',
      uploadDate: '2024-10-01',
      status: 'verified',
      expiryDate: null,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
      case 'verified':
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return lang === 'ar' ? 'جاهز للاستلام' : 'Ready for Pickup';
      case 'processing': return lang === 'ar' ? 'قيد المعالجة' : 'Processing';
      case 'delivered': return lang === 'ar' ? 'تم التسليم' : 'Delivered';
      case 'rejected': return lang === 'ar' ? 'مرفوض' : 'Rejected';
      case 'verified': return lang === 'ar' ? 'موثق' : 'Verified';
      case 'pending': return lang === 'ar' ? 'بانتظار التحقق' : 'Pending Verification';
      default: return status;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status) {
      case 'ready':
      case 'verified':
      case 'delivered':
        return 'success';
      case 'processing':
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleRequestSubmit = () => {
    console.log('Submitting request:', requestForm);
    setShowRequestModal(false);
    setRequestForm({
      certificateType: '',
      purpose: '',
      language: 'ar',
      copies: '1',
      deliveryMethod: 'pickup',
      notes: '',
    });
  };

  const renderAvailableTab = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-4">
        <SearchInput
          placeholder={lang === 'ar' ? 'ابحث عن شهادة...' : 'Search certificates...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Popular Certificates */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          {lang === 'ar' ? 'الأكثر طلباً' : 'Most Requested'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableCertificates.filter(c => c.popular).map((cert) => (
            <div
              key={cert.id}
              className="p-4 border border-blue-200 bg-blue-50/50 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                setSelectedCertificate(cert);
                setRequestForm({ ...requestForm, certificateType: cert.type });
                setShowRequestModal(true);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <cert.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800">{cert.name}</h4>
                    <Badge variant="info" size="sm">{lang === 'ar' ? 'شائع' : 'Popular'}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{cert.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-green-600 font-medium">
                      {cert.fee === 0 ? '-' : `${cert.fee} USD`}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {cert.processingTime}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Certificates */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'جميع الشهادات المتاحة' : 'All Available Certificates'}
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {availableCertificates
              .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((cert) => (
              <div
                key={cert.id}
                className={`p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${!cert.available ? 'opacity-50' : 'cursor-pointer'}`}
                onClick={() => {
                  if (cert.available) {
                    setSelectedCertificate(cert);
                    setRequestForm({ ...requestForm, certificateType: cert.type });
                    setShowRequestModal(true);
                  }
                }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  cert.available ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <cert.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">{cert.name}</h4>
                  <p className="text-sm text-slate-500">{cert.description}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${cert.fee === 0 ? 'text-green-600' : 'text-slate-800'}`}>
                    {cert.fee === 0 ? '-' : `${cert.fee} USD`}
                  </p>
                  <p className="text-xs text-slate-500">{cert.processingTime}</p>
                </div>
                {cert.available ? (
                  <Button variant="outline" size="sm" icon={Plus}>
                    {lang === 'ar' ? 'طلب' : 'Request'}
                  </Button>
                ) : (
                  <Badge variant="default">{lang === 'ar' ? 'غير متاح' : 'Unavailable'}</Badge>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={lang === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}
          value={myRequests.length.toString()}
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'جاهزة للاستلام' : 'Ready for Pickup'}
          value={myRequests.filter(r => r.status === 'ready').length.toString()}
          icon={CheckCircle}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'قيد المعالجة' : 'Processing'}
          value={myRequests.filter(r => r.status === 'processing').length.toString()}
          icon={Clock}
          iconColor="text-yellow-600 bg-yellow-50"
        />
        <StatCard
          title={lang === 'ar' ? 'تم التسليم' : 'Delivered'}
          value={myRequests.filter(r => r.status === 'delivered').length.toString()}
          icon={Truck}
          iconColor="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Ready for Pickup Alert */}
      {myRequests.filter(r => r.status === 'ready').length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-800">
              {lang === 'ar' ? 'لديك شهادات جاهزة للاستلام!' : 'You have certificates ready for pickup!'}
            </h4>
            <p className="text-sm text-green-600 mt-1">
              {lang === 'ar'
                ? 'يمكنك استلام شهاداتك من مكتب شؤون الطلاب خلال ساعات العمل'
                : 'You can collect your certificates from the Student Affairs office during working hours'}
            </p>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'طلباتي' : 'My Requests'}
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
          action={
            <div className="flex gap-3">
              <Select
                options={[
                  { value: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
                  { value: 'ready', label: lang === 'ar' ? 'جاهز' : 'Ready' },
                  { value: 'processing', label: lang === 'ar' ? 'قيد المعالجة' : 'Processing' },
                  { value: 'delivered', label: lang === 'ar' ? 'تم التسليم' : 'Delivered' },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth={false}
                className="w-36"
              />
              <Button variant="primary" icon={Plus} onClick={() => setShowRequestModal(true)}>
                {lang === 'ar' ? 'طلب جديد' : 'New Request'}
              </Button>
            </div>
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? 'رقم الطلب' : 'Request #'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? 'نوع الشهادة' : 'Certificate Type'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? 'تاريخ الطلب' : 'Request Date'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? 'اللغة' : 'Language'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests
                  .filter(r => filterStatus === 'all' || r.status === filterStatus)
                  .map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-sm font-medium text-blue-600">{request.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{request.name}</p>
                      <p className="text-xs text-slate-500">
                        {request.copies} {lang === 'ar' ? 'نسخة' : 'copies'}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{request.requestDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={request.language === 'ar' ? 'info' : 'default'}>
                        {request.language === 'ar' ? (lang === 'ar' ? 'عربي' : 'Arabic') : (lang === 'ar' ? 'إنجليزي' : 'English')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className={`text-sm font-medium ${
                          request.status === 'ready' || request.status === 'delivered' ? 'text-green-600' :
                          request.status === 'processing' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </div>
                      {request.status === 'rejected' && request.rejectReason && (
                        <p className="text-xs text-red-500 mt-1">{request.rejectReason}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        {request.status === 'ready' && (
                          <>
                            <IconButton icon={Download} size="sm" tooltip={lang === 'ar' ? 'تحميل' : 'Download'} onClick={() => {
                              const data = [{
                                id: request.id,
                                type: request.name,
                                date: request.requestDate,
                                language: request.language,
                                copies: request.copies,
                                status: getStatusLabel(request.status)
                              }];
                              exportToPDF(data, `certificate-${request.id}`);
                            }} />
                            <IconButton icon={QrCode} size="sm" tooltip={lang === 'ar' ? 'رمز الاستلام' : 'Pickup QR'} onClick={() => {
                              setSelectedCertificate(request);
                              setShowPreviewModal(true);
                            }} />
                          </>
                        )}
                        {request.status === 'delivered' && (
                          <IconButton icon={Download} size="sm" tooltip={lang === 'ar' ? 'تحميل' : 'Download'} onClick={() => {
                            const data = [{
                              id: request.id,
                              type: request.name,
                              date: request.requestDate,
                              language: request.language,
                              copies: request.copies,
                              status: getStatusLabel(request.status)
                            }];
                            exportToPDF(data, `certificate-${request.id}`);
                          }} />
                        )}
                        <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض' : 'View'} onClick={() => {
                          setSelectedCertificate(request);
                          setShowPreviewModal(true);
                        }} />
                        <IconButton icon={Printer} size="sm" tooltip={lang === 'ar' ? 'طباعة' : 'Print'} onClick={() => {
                          const printContent = `
                            <html dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
                            <head>
                              <title>${request.name}</title>
                              <style>
                                body { font-family: Arial, sans-serif; padding: 40px; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                                .info { margin: 10px 0; }
                                .label { font-weight: bold; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <div class="title">${request.name}</div>
                              </div>
                              <div class="info"><span class="label">${lang === 'ar' ? 'رقم الطلب:' : 'Request #:'}</span> ${request.id}</div>
                              <div class="info"><span class="label">${lang === 'ar' ? 'تاريخ الطلب:' : 'Request Date:'}</span> ${request.requestDate}</div>
                              <div class="info"><span class="label">${lang === 'ar' ? 'اللغة:' : 'Language:'}</span> ${request.language === 'ar' ? 'العربية' : 'English'}</div>
                              <div class="info"><span class="label">${lang === 'ar' ? 'عدد النسخ:' : 'Copies:'}</span> ${request.copies}</div>
                              <div class="info"><span class="label">${lang === 'ar' ? 'الحالة:' : 'Status:'}</span> ${getStatusLabel(request.status)}</div>
                            </body>
                            </html>
                          `;
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            printWindow.document.write(printContent);
                            printWindow.document.close();
                            printWindow.print();
                          }
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'وثائقي المرفوعة' : 'My Uploaded Documents'}
          icon={FileText}
          iconColor="text-purple-600 bg-purple-50"
          action={
            <Button variant="primary" icon={Plus}>
              {lang === 'ar' ? 'رفع وثيقة' : 'Upload Document'}
            </Button>
          }
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {myDocuments.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  doc.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">{doc.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span>{lang === 'ar' ? 'تاريخ الرفع:' : 'Uploaded:'} {doc.uploadDate}</span>
                    {doc.expiryDate && (
                      <span>{lang === 'ar' ? 'تنتهي:' : 'Expires:'} {doc.expiryDate}</span>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusVariant(doc.status)}>
                  {getStatusLabel(doc.status)}
                </Badge>
                <div className="flex gap-1">
                  <IconButton icon={Eye} size="sm" tooltip={lang === 'ar' ? 'عرض' : 'View'} />
                  <IconButton icon={Download} size="sm" tooltip={lang === 'ar' ? 'تحميل' : 'Download'} onClick={() => {
                    const data = [{
                      id: doc.id,
                      name: doc.name,
                      type: doc.type,
                      uploadDate: doc.uploadDate,
                      status: getStatusLabel(doc.status),
                      expiryDate: doc.expiryDate || 'N/A'
                    }];
                    exportToPDF(data, `document-${doc.id}`);
                  }} />
                  <IconButton icon={RefreshCw} size="sm" tooltip={lang === 'ar' ? 'تحديث' : 'Update'} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Required Documents Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-2">
          {lang === 'ar' ? 'ملاحظة' : 'Note'}
        </h4>
        <p className="text-sm text-blue-600">
          {lang === 'ar'
            ? 'تأكد من تحديث وثائقك المنتهية الصلاحية لتجنب أي تأخير في إصدار الشهادات.'
            : 'Make sure to update expired documents to avoid delays in certificate issuance.'}
        </p>
      </div>
    </div>
  );

  // Tabs configuration
  const tabs = [
    { id: 'available', label: lang === 'ar' ? 'الشهادات المتاحة' : 'Available Certificates', icon: FileText },
    { id: 'requests', label: lang === 'ar' ? 'طلباتي' : 'My Requests', icon: Clock },
    // Documents tab hidden temporarily until backend is ready
    // { id: 'documents', label: lang === 'ar' ? 'وثائقي' : 'My Documents', icon: Building },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ar' ? 'الشهادات والوثائق' : 'Certificates & Documents'}
          </h1>
          <p className="text-slate-500">
            {lang === 'ar' ? 'طلب وإدارة الشهادات والوثائق الرسمية' : 'Request and manage official certificates and documents'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowRequestModal(true)}>
          {lang === 'ar' ? 'طلب شهادة جديدة' : 'Request New Certificate'}
        </Button>
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
      {activeTab === 'available' && renderAvailableTab()}
      {activeTab === 'requests' && renderRequestsTab()}
      {activeTab === 'documents' && renderDocumentsTab()}

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={lang === 'ar' ? 'طلب شهادة جديدة' : 'Request New Certificate'}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label={lang === 'ar' ? 'نوع الشهادة' : 'Certificate Type'}
            options={[
              { value: '', label: lang === 'ar' ? 'اختر نوع الشهادة' : 'Select certificate type' },
              ...availableCertificates.filter(c => c.available).map(c => ({
                value: c.type,
                label: `${c.name}${c.fee > 0 ? ` (${c.fee} USD)` : ''}`
              }))
            ]}
            value={requestForm.certificateType}
            onChange={(e) => setRequestForm({ ...requestForm, certificateType: e.target.value })}
          />

          <Input
            label={lang === 'ar' ? 'الغرض من الشهادة' : 'Purpose of Certificate'}
            placeholder={lang === 'ar' ? 'مثال: للتقديم على وظيفة' : 'E.g., Job application'}
            value={requestForm.purpose}
            onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={lang === 'ar' ? 'لغة الشهادة' : 'Certificate Language'}
              options={[
                { value: 'ar', label: lang === 'ar' ? 'العربية' : 'Arabic' },
                { value: 'en', label: lang === 'ar' ? 'الإنجليزية' : 'English' },
                { value: 'both', label: lang === 'ar' ? 'كلاهما' : 'Both' },
              ]}
              value={requestForm.language}
              onChange={(e) => setRequestForm({ ...requestForm, language: e.target.value })}
            />

            <Select
              label={lang === 'ar' ? 'عدد النسخ' : 'Number of Copies'}
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
              ]}
              value={requestForm.copies}
              onChange={(e) => setRequestForm({ ...requestForm, copies: e.target.value })}
            />
          </div>

          <Select
            label={lang === 'ar' ? 'طريقة التسليم' : 'Delivery Method'}
            options={[
              { value: 'pickup', label: lang === 'ar' ? 'استلام شخصي من الجامعة' : 'Pickup from university' },
              { value: 'email', label: lang === 'ar' ? 'نسخة إلكترونية بالبريد' : 'Electronic copy via email' },
              { value: 'both', label: lang === 'ar' ? 'كلاهما' : 'Both' },
            ]}
            value={requestForm.deliveryMethod}
            onChange={(e) => setRequestForm({ ...requestForm, deliveryMethod: e.target.value })}
          />

          <Textarea
            label={lang === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
            placeholder={lang === 'ar' ? 'أي ملاحظات أو متطلبات خاصة' : 'Any notes or special requirements'}
            rows={3}
            value={requestForm.notes}
            onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
          />

          {/* Fee Summary */}
          {requestForm.certificateType && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{lang === 'ar' ? 'الرسوم:' : 'Fee:'}</span>
                <span className="font-bold text-slate-800">
                  {availableCertificates.find(c => c.type === requestForm.certificateType)?.fee === 0
                    ? '-'
                    : `${(availableCertificates.find(c => c.type === requestForm.certificateType)?.fee || 0) * parseInt(requestForm.copies)} USD`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-slate-600">{lang === 'ar' ? 'وقت المعالجة:' : 'Processing Time:'}</span>
                <span className="text-slate-800">
                  {availableCertificates.find(c => c.type === requestForm.certificateType)?.processingTime}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowRequestModal(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" fullWidth icon={CheckCircle} onClick={handleRequestSubmit}>
              {lang === 'ar' ? 'تأكيد الطلب' : 'Confirm Request'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview/QR Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={lang === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}
        size="md"
      >
        {selectedCertificate && (
          <div className="space-y-6">
            {/* Certificate Info */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'ar' ? 'رقم الطلب:' : 'Request #:'}</span>
                <span className="font-mono font-semibold text-blue-600">{selectedCertificate.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'ar' ? 'نوع الشهادة:' : 'Certificate:'}</span>
                <span className="font-medium">{selectedCertificate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'ar' ? 'تاريخ الطلب:' : 'Request Date:'}</span>
                <span>{selectedCertificate.requestDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'ar' ? 'الحالة:' : 'Status:'}</span>
                <Badge variant={getStatusVariant(selectedCertificate.status)}>
                  {getStatusLabel(selectedCertificate.status)}
                </Badge>
              </div>
              {selectedCertificate.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'ar' ? 'رقم التتبع:' : 'Tracking #:'}</span>
                  <span className="font-mono">{selectedCertificate.trackingNumber}</span>
                </div>
              )}
            </div>

            {/* QR Code for Pickup */}
            {selectedCertificate.status === 'ready' && (
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-4">
                  {lang === 'ar' ? 'رمز الاستلام' : 'Pickup QR Code'}
                </h4>
                <div className="inline-block p-4 bg-white rounded-xl shadow-sm">
                  {/* Simple QR placeholder - can be replaced with actual QR library */}
                  <div className="w-40 h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-white" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  {lang === 'ar'
                    ? 'قدم هذا الرمز عند الاستلام من مكتب شؤون الطلاب'
                    : 'Present this code when picking up from Student Affairs'}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowPreviewModal(false)}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
              {selectedCertificate.status === 'ready' && (
                <Button variant="primary" fullWidth icon={Download} onClick={() => {
                  const data = [{
                    id: selectedCertificate.id,
                    type: selectedCertificate.name,
                    date: selectedCertificate.requestDate,
                    language: selectedCertificate.language,
                    copies: selectedCertificate.copies,
                    status: getStatusLabel(selectedCertificate.status)
                  }];
                  exportToPDF(data, `certificate-${selectedCertificate.id}`);
                }}>
                  {lang === 'ar' ? 'تحميل' : 'Download'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CertificatesPage;

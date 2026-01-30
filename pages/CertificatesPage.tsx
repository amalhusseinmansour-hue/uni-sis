import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle,
  Plus, Filter, Search, Calendar, Printer, Mail, Building, Award,
  GraduationCap, CreditCard, BookOpen, Shield, Star, Hash, User,
  ChevronRight, ExternalLink, RefreshCw, Truck, QrCode, Users
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { studentsAPI } from '../api/students';
import { certificatesAPI } from '../api/certificates';
import { exportToPDF } from '../utils/exportUtils';
import { Card, CardHeader, CardBody, StatCard, GradientCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Select, SearchInput, Textarea } from '../components/ui/Input';
import { UserRole } from '../types';

interface CertificatesPageProps {
  lang: 'en' | 'ar';
  role?: UserRole;
}

const CertificatesPage: React.FC<CertificatesPageProps> = ({ lang, role }) => {
  const isStaff = role === UserRole.STUDENT_AFFAIRS || role === UserRole.ADMIN;
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
    language: 'ar',
    notes: '',
    costConfirmed: false,
  });

  // Certificate requests state
  const [myCertRequests, setMyCertRequests] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Staff-specific state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allCertStats, setAllCertStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    readyRequests: 0,
    deliveredRequests: 0,
  });

  // Fetch certificate requests for student
  useEffect(() => {
    const fetchMyCertificates = async () => {
      if (isStaff) return;
      setLoading(true);
      try {
        const data = await certificatesAPI.getMyRequests();
        setMyCertRequests(data?.data || data || []);
      } catch (err) {
        // API might not be implemented yet - show empty list
        setMyCertRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCertificates();
  }, [isStaff]);

  // Staff: Fetch all students
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!isStaff) return;
      try {
        const studentsRes = await studentsAPI.getAll({ per_page: 100 });
        setStudentList(studentsRes.data || studentsRes || []);

        // Mock stats for now
        setAllCertStats({
          totalRequests: 45,
          pendingRequests: 12,
          readyRequests: 8,
          deliveredRequests: 25,
        });
      } catch (error) {
        console.error('Error fetching staff data:', error);
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
      } catch (error) {
        console.error('Error searching students:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [studentSearch, isStaff]);

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

  // My certificate requests - use API data from myCertRequests state

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

  const handleRequestSubmit = async () => {
    if (!requestForm.certificateType || !requestForm.costConfirmed) return;

    setSubmitting(true);
    try {
      const result = await certificatesAPI.createRequest({
        certificateType: requestForm.certificateType,
        purpose: requestForm.notes || 'General purpose',
        language: requestForm.language as 'ar' | 'en' | 'both',
        copies: 1,
        deliveryMethod: 'pickup',
        notes: requestForm.notes,
      });

      // Add to local list
      if (result) {
        setMyCertRequests(prev => [result, ...prev]);
      }

      setShowRequestModal(false);
      setRequestForm({
        certificateType: '',
        language: 'ar',
        notes: '',
        costConfirmed: false,
      });
    } catch (err) {
      // Show error to user - for now just close modal
      alert(lang === 'ar' ? 'فشل في إرسال الطلب. يرجى المحاولة لاحقاً.' : 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
                <div className="text-end">
                  <p className="text-xs text-slate-500">{cert.processingTime}</p>
                </div>
                {cert.available ? (
                  <Button variant="outline" size="sm" icon={Plus}>
                    {lang === 'ar' ? 'تقديم طلب' : 'Submit Request'}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}
          value={myCertRequests.length.toString()}
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          title={lang === 'ar' ? 'جاهزة للاستلام' : 'Ready for Pickup'}
          value={myCertRequests.filter(r => r.status === 'ready').length.toString()}
          icon={CheckCircle}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'قيد المعالجة' : 'Processing'}
          value={myCertRequests.filter(r => r.status === 'processing').length.toString()}
          icon={Clock}
          iconColor="text-yellow-600 bg-yellow-50"
        />
        <StatCard
          title={lang === 'ar' ? 'تم التسليم' : 'Delivered'}
          value={myCertRequests.filter(r => r.status === 'delivered').length.toString()}
          icon={Truck}
          iconColor="text-purple-600 bg-purple-50"
        />
      </div>

      {/* Ready for Pickup Alert */}
      {myCertRequests.filter(r => r.status === 'ready').length > 0 && (
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
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'رقم الطلب' : 'Request #'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'نوع الشهادة' : 'Certificate Type'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'تاريخ الطلب' : 'Request Date'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'اللغة' : 'Language'}
                  </th>
                  <th className={`p-4 text-xs font-semibold text-slate-500 uppercase ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                    {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myCertRequests
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
      {/* Staff Header Banner */}
      {isStaff && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {lang === 'ar' ? 'إدارة الشهادات' : 'Certificates Management'}
              </h1>
              <p className="text-emerald-100 mt-1">
                {lang === 'ar' ? 'معالجة وإصدار الشهادات للطلاب' : 'Process and issue certificates for students'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{allCertStats.totalRequests}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-300">{allCertStats.pendingRequests}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'قيد المعالجة' : 'Processing'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-300">{allCertStats.readyRequests}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'جاهزة' : 'Ready'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-300">{allCertStats.deliveredRequests}</p>
                <p className="text-xs text-emerald-100">{lang === 'ar' ? 'تم التسليم' : 'Delivered'}</p>
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
      )}

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
                label: c.name
              }))
            ]}
            value={requestForm.certificateType}
            onChange={(e) => setRequestForm({ ...requestForm, certificateType: e.target.value })}
          />

          <Select
            label={lang === 'ar' ? 'اللغة' : 'Language'}
            options={[
              { value: 'ar', label: lang === 'ar' ? 'العربية' : 'Arabic' },
              { value: 'en', label: lang === 'ar' ? 'الإنجليزية' : 'English' },
              { value: 'both', label: lang === 'ar' ? 'كلاهما' : 'Both' },
            ]}
            value={requestForm.language}
            onChange={(e) => setRequestForm({ ...requestForm, language: e.target.value })}
          />

          <Textarea
            label={lang === 'ar' ? 'ملاحظات' : 'Notes'}
            placeholder={lang === 'ar' ? 'أي ملاحظات إضافية (اختياري)' : 'Any additional notes (optional)'}
            rows={3}
            value={requestForm.notes}
            onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowRequestModal(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              fullWidth
              icon={CheckCircle}
              onClick={handleRequestSubmit}
              disabled={!requestForm.certificateType}
            >
              {lang === 'ar' ? 'تقديم طلب' : 'Submit Request'}
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

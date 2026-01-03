import React, { useState, useEffect } from 'react';
import {
  CreditCard, Download, QrCode, Printer, Share2, RefreshCw,
  Check, AlertCircle, User, GraduationCap, Calendar, Shield,
  Loader2, Camera, Building, Clock, CheckCircle, XCircle,
  Mail, Phone, MapPin, Hash, Award, BookOpen
} from 'lucide-react';
import { idCardAPI, DigitalIdCard, downloadBlobAsFile } from '../api/idCard';
import { brandingAPI, BrandingSettings } from '../api/branding';

interface IDCardPageProps {
  lang: 'en' | 'ar';
}

// Translations
const t: Record<string, { en: string; ar: string }> = {
  pageTitle: { en: 'University ID Card', ar: 'البطاقة الجامعية' },
  subtitle: { en: 'Your digital university identity card', ar: 'بطاقتك الجامعية الرقمية' },
  studentId: { en: 'Student ID', ar: 'الرقم الجامعي' },
  program: { en: 'Program', ar: 'البرنامج' },
  college: { en: 'College', ar: 'الكلية' },
  level: { en: 'Level', ar: 'المستوى' },
  semester: { en: 'Semester', ar: 'الفصل' },
  year: { en: 'Year', ar: 'السنة' },
  gpa: { en: 'GPA', ar: 'المعدل التراكمي' },
  status: { en: 'Status', ar: 'الحالة' },
  validUntil: { en: 'Valid Until', ar: 'صالحة حتى' },
  issuedOn: { en: 'Issued On', ar: 'تاريخ الإصدار' },
  downloadPdf: { en: 'Download PDF', ar: 'تحميل PDF' },
  printCard: { en: 'Print Card', ar: 'طباعة البطاقة' },
  shareCard: { en: 'Share', ar: 'مشاركة' },
  renewCard: { en: 'Request Renewal', ar: 'طلب تجديد' },
  loading: { en: 'Loading your ID card...', ar: 'جاري تحميل البطاقة...' },
  error: { en: 'Failed to load ID card', ar: 'فشل تحميل البطاقة' },
  retry: { en: 'Retry', ar: 'إعادة المحاولة' },
  active: { en: 'Active', ar: 'نشط' },
  graduated: { en: 'Graduated', ar: 'متخرج' },
  suspended: { en: 'Suspended', ar: 'موقوف' },
  withdrawn: { en: 'Withdrawn', ar: 'منسحب' },
  expired: { en: 'Expired', ar: 'منتهية الصلاحية' },
  needsRenewal: { en: 'Card Expires Soon', ar: 'البطاقة تنتهي قريباً' },
  cardFront: { en: 'Front', ar: 'الواجهة' },
  cardBack: { en: 'Back', ar: 'الخلف' },
  scanQr: { en: 'Scan QR code to verify student identity', ar: 'امسح رمز QR للتحقق من هوية الطالب' },
  barcode: { en: 'Barcode', ar: 'الباركود' },
  universityName: { en: 'Universe University', ar: 'جامعة يونيفرس' },
  academicYear: { en: 'Academic Year', ar: 'العام الدراسي' },
  downloading: { en: 'Downloading...', ar: 'جاري التحميل...' },
  downloadSuccess: { en: 'Downloaded successfully!', ar: 'تم التحميل بنجاح!' },
  downloadError: { en: 'Download failed. Please try again.', ar: 'فشل التحميل. يرجى المحاولة مرة أخرى.' },
  cardDetails: { en: 'Card Details', ar: 'تفاصيل البطاقة' },
  academicInfo: { en: 'Academic Information', ar: 'المعلومات الأكاديمية' },
  validityInfo: { en: 'Validity Information', ar: 'معلومات الصلاحية' },
  verificationCode: { en: 'Verification Code', ar: 'رمز التحقق' },
};

// Default mock data for testing
const defaultIdCard: DigitalIdCard = {
  student: {
    id: 1,
    student_id: 'STU-2024-001',
    name_en: 'Ahmed Mohammed Al-Mansour',
    name_ar: 'أحمد محمد المنصور',
    profile_picture_url: undefined,
    status: 'ACTIVE',
  },
  program: {
    name_en: 'Computer Science',
    name_ar: 'علوم الحاسب',
    degree: 'Bachelor',
  },
  academic: {
    level: 3,
    semester: 1,
    gpa: 3.75,
    academic_status: 'Good Standing',
  },
  validity: {
    current_semester: {
      name: 'Fall 2024',
      name_ar: 'الفصل الأول 2024',
      start_date: '2024-09-01',
      end_date: '2025-01-15',
    },
    issue_date: '2024-09-01',
    expiry_date: '2025-01-31',
  },
  verification: {
    qr_data: 'STU-2024-001-VERIFY-2024',
    barcode: 'UNI2024STU001',
  },
  needs_renewal: false,
};

const IDCardPage: React.FC<IDCardPageProps> = ({ lang }) => {
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idCard, setIdCard] = useState<DigitalIdCard | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);

  // Fetch branding settings and ID card data
  useEffect(() => {
    const loadData = async () => {
      try {
        const brandingData = await brandingAPI.getSettings();
        setBranding(brandingData);
      } catch (err) {
        console.warn('Using default branding');
      }
    };
    loadData();
    fetchIdCard();
  }, []);

  const fetchIdCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await idCardAPI.getMyIdCard();
      setIdCard(data);
    } catch (err: any) {
      console.error('Error fetching ID card:', err);
      // Use default data on error for demo
      setIdCard(defaultIdCard);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const handleDownload = async () => {
    setDownloading(true);
    setNotification(null);
    try {
      const blob = await idCardAPI.downloadMyIdCard();
      downloadBlobAsFile(blob, `university-id-card-${idCard?.student.student_id || 'card'}.pdf`);
      setNotification({ type: 'success', message: t.downloadSuccess[lang] });
    } catch (err) {
      console.error('Error downloading ID card:', err);
      setNotification({ type: 'error', message: t.downloadError[lang] });
    } finally {
      setDownloading(false);
    }
  };

  // Print card
  const handlePrint = () => {
    window.print();
  };

  // Share card
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.pageTitle[lang],
          text: `${idCard?.student.name_en || ''} - ${idCard?.student.student_id || ''}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  // Format date (Gregorian calendar)
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; bgColor: string; label: { en: string; ar: string } }> = {
      'ACTIVE': { color: 'text-green-700', bgColor: 'bg-green-100', label: { en: 'Active', ar: 'نشط' } },
      'GRADUATED': { color: 'text-blue-700', bgColor: 'bg-blue-100', label: { en: 'Graduated', ar: 'متخرج' } },
      'SUSPENDED': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: { en: 'Suspended', ar: 'موقوف' } },
      'WITHDRAWN': { color: 'text-red-700', bgColor: 'bg-red-100', label: { en: 'Withdrawn', ar: 'منسحب' } },
    };
    return statusMap[status] || { color: 'text-gray-700', bgColor: 'bg-gray-100', label: { en: status, ar: status } };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-slate-600">{t.loading[lang]}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !idCard) {
    return (
      <div className="flex items-center justify-center min-h-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-800 font-medium mb-2">{t.error[lang]}</p>
          <button
            onClick={fetchIdCard}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t.retry[lang]}
          </button>
        </div>
      </div>
    );
  }

  const card = idCard || defaultIdCard;
  const isExpired = new Date(card.validity.expiry_date) < new Date();
  const statusInfo = getStatusInfo(card.student.status);

  return (
    <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-in slide-in-from-top ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {notification.message}
          </span>
          <button onClick={() => setNotification(null)} className="ml-auto">
            <XCircle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.pageTitle[lang]}</h1>
                <p className="text-slate-300 text-sm">{t.subtitle[lang]}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-medium rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloading ? t.downloading[lang] : t.downloadPdf[lang]}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl transition-colors"
              >
                <Printer className="w-4 h-4" />
                {t.printCard[lang]}
              </button>
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {t.shareCard[lang]}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Warning */}
      {(card.needs_renewal || isExpired) && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          isExpired ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isExpired ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <AlertCircle className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <div className="flex-1">
            <p className={`font-medium ${isExpired ? 'text-red-800' : 'text-amber-800'}`}>
              {isExpired ? t.expired[lang] : t.needsRenewal[lang]}
            </p>
            <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
              {isExpired
                ? (lang === 'ar' ? 'انتهت صلاحية البطاقة. يرجى تقديم طلب تجديد.' : 'Your card has expired. Please request a renewal.')
                : (lang === 'ar' ? 'ستنتهي صلاحية بطاقتك قريباً.' : 'Your card will expire soon.')
              }
            </p>
          </div>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
            isExpired
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-amber-600 text-white hover:bg-amber-700'
          } transition-colors`}>
            {t.renewCard[lang]}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Preview */}
        <div className="space-y-4">
          {/* Toggle Buttons */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setShowBack(false)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                !showBack
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.cardFront[lang]}
            </button>
            <button
              onClick={() => setShowBack(true)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                showBack
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.cardBack[lang]}
            </button>
          </div>

          {/* The Card */}
          <div className="relative" style={{ perspective: '1000px' }}>
            <div
              className={`relative transition-transform duration-700 ${showBack ? 'rotate-y-180' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front Side */}
              {!showBack && (
                <div
                  className="rounded-2xl shadow-2xl overflow-hidden print:break-inside-avoid"
                  style={{
                    aspectRatio: '1.586',
                    background: branding?.idCardTemplate === 'minimal'
                      ? '#f8fafc'
                      : `linear-gradient(135deg, ${branding?.idCardPrimaryColor || '#1e3a5f'}, ${branding?.idCardSecondaryColor || '#2563eb'})`
                  }}>
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: `${branding?.accentColor || '#f59e0b'}20` }} />
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl" style={{ backgroundColor: `${branding?.idCardSecondaryColor || '#2563eb'}20` }} />
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${branding?.accentColor || '#f59e0b'}, ${branding?.accentColor || '#f59e0b'}80, ${branding?.accentColor || '#f59e0b'})` }} />
                  </div>

                  {/* Header */}
                  <div className="bg-black/30 p-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      {branding?.logoLight || branding?.logo ? (
                        <img
                          src={branding.logoLight || branding.logo}
                          alt="Logo"
                          className="h-10 w-auto object-contain"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-slate-900 font-bold text-lg">U</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: branding?.accentColor || '#fbbf24' }}>
                          {branding?.universityNameAr || t.universityName['ar']}
                        </h3>
                        <p className="text-xs" style={{ color: `${branding?.idCardTextColor || '#ffffff'}b3` }}>
                          {branding?.universityName || t.universityName['en']}
                        </p>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: `linear-gradient(to right, ${branding?.accentColor || '#f59e0b'}, ${branding?.accentColor || '#f59e0b'}dd)`,
                        color: branding?.idCardTemplate === 'minimal' ? '#ffffff' : '#1e293b'
                      }}
                    >
                      بطاقة طالب | Student ID
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex gap-4 relative z-10">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-20 h-24 bg-white rounded-lg overflow-hidden shadow-lg"
                        style={{ borderWidth: '2px', borderColor: `${branding?.accentColor || '#f59e0b'}80` }}
                      >
                        {card.student.profile_picture_url ? (
                          <img
                            src={card.student.profile_picture_url}
                            alt={card.student.name_en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1" style={{ color: branding?.idCardTextColor || '#ffffff' }}>
                      <h2 className="font-bold text-lg leading-tight mb-0.5">
                        {lang === 'ar' ? card.student.name_ar : card.student.name_en}
                      </h2>
                      <p className="text-sm italic mb-2" style={{ color: `${branding?.idCardTextColor || '#ffffff'}b3` }}>
                        {lang === 'ar' ? card.student.name_en : card.student.name_ar}
                      </p>

                      <div className="mb-2">
                        <p className="text-xs uppercase tracking-wider" style={{ color: `${branding?.accentColor || '#f59e0b'}cc` }}>{t.studentId[lang]}</p>
                        <p className="font-bold text-lg font-mono tracking-wide" style={{ color: branding?.accentColor || '#f59e0b' }}>
                          {card.student.student_id}
                        </p>
                      </div>

                      <div className="space-y-0.5 text-sm">
                        <p style={{ color: `${branding?.idCardTextColor || '#ffffff'}cc` }}>
                          <span style={{ color: `${branding?.idCardTextColor || '#ffffff'}80` }}>{t.program[lang]}:</span> {lang === 'ar' ? card.program?.name_ar : card.program?.name_en}
                        </p>
                        <p style={{ color: `${branding?.idCardTextColor || '#ffffff'}cc` }}>
                          <span style={{ color: `${branding?.idCardTextColor || '#ffffff'}80` }}>{t.level[lang]}:</span> {card.academic.level} - {t.semester[lang]} {card.academic.semester}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-16 left-4 px-2 py-0.5 rounded text-xs font-bold ${
                    card.student.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                    card.student.status === 'GRADUATED' ? 'bg-blue-500 text-white' :
                    card.student.status === 'SUSPENDED' ? 'bg-yellow-500 text-slate-900' :
                    'bg-red-500 text-white'
                  }`}>
                    {statusInfo.label[lang]}
                  </div>

                  {/* Footer */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-2 px-4 flex justify-between items-center text-xs" style={{ color: `${branding?.idCardTextColor || '#ffffff'}b3` }}>
                    <div className="flex gap-4">
                      <span>{t.issuedOn[lang]}: {formatDate(card.validity.issue_date)}</span>
                      <span>{t.validUntil[lang]}: {formatDate(card.validity.expiry_date)}</span>
                    </div>
                    <span className="font-mono" style={{ color: branding?.accentColor || '#f59e0b' }}>{card.verification.barcode}</span>
                  </div>
                </div>
              )}

              {/* Back Side */}
              {showBack && (
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                     style={{ aspectRatio: '1.586' }}>
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    {/* QR Code */}
                    {branding?.showQRCode !== false && (
                      <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                        <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                          <QrCode className="w-24 h-24" style={{ color: branding?.idCardPrimaryColor || '#1e293b' }} />
                        </div>
                      </div>
                    )}
                    <p className="text-slate-600 text-sm text-center mb-4">{t.scanQr[lang]}</p>

                    {/* Barcode */}
                    {branding?.showBarcode !== false && (
                      <div className="bg-white px-6 py-3 rounded-lg shadow">
                        <div className="flex gap-0.5 mb-1 justify-center">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: Math.random() > 0.5 ? '2px' : '1px',
                                height: '30px',
                                backgroundColor: branding?.idCardPrimaryColor || '#1e293b'
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-center text-xs text-slate-500 font-mono">
                          {card.verification.barcode}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="absolute bottom-4 text-center">
                      <p className="text-xs" style={{ color: branding?.idCardPrimaryColor || '#64748b' }}>
                        {lang === 'ar' ? branding?.universityNameAr : branding?.universityName || t.universityName[lang]}
                      </p>
                      {branding?.universityWebsite && (
                        <p className="text-xs text-slate-400">{branding.universityWebsite}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div className="space-y-4">
          {/* Student Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                {t.cardDetails[lang]}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <DetailRow
                icon={User}
                label={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                value={lang === 'ar' ? card.student.name_ar : card.student.name_en}
                subValue={lang === 'ar' ? card.student.name_en : card.student.name_ar}
              />
              <DetailRow
                icon={Hash}
                label={t.studentId[lang]}
                value={card.student.student_id}
                mono
              />
              <DetailRow
                icon={Shield}
                label={t.status[lang]}
                value={statusInfo.label[lang]}
                badge
                badgeColor={statusInfo.bgColor}
                textColor={statusInfo.color}
              />
            </div>
          </div>

          {/* Academic Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                {t.academicInfo[lang]}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <DetailRow
                icon={BookOpen}
                label={t.program[lang]}
                value={lang === 'ar' ? card.program?.name_ar : card.program?.name_en}
              />
              <DetailRow
                icon={Building}
                label={lang === 'ar' ? 'الدرجة' : 'Degree'}
                value={card.program?.degree}
              />
              <DetailRow
                icon={Award}
                label={t.level[lang]}
                value={`${t.year[lang]} ${card.academic.level} - ${t.semester[lang]} ${card.academic.semester}`}
              />
              <DetailRow
                icon={Award}
                label={t.gpa[lang]}
                value={card.academic.gpa?.toFixed(2) || '-'}
                highlight={card.academic.gpa && card.academic.gpa >= 3.5}
                highlightColor="text-green-600"
              />
            </div>
          </div>

          {/* Validity Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                {t.validityInfo[lang]}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <DetailRow
                icon={Calendar}
                label={t.issuedOn[lang]}
                value={formatDate(card.validity.issue_date)}
              />
              <DetailRow
                icon={Clock}
                label={t.validUntil[lang]}
                value={formatDate(card.validity.expiry_date)}
                highlight={isExpired}
                highlightColor="text-red-600"
              />
              <DetailRow
                icon={Hash}
                label={t.verificationCode[lang]}
                value={card.verification.barcode}
                mono
              />
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:break-inside-avoid,
          .print\\:break-inside-avoid * {
            visibility: visible;
          }
          .print\\:break-inside-avoid {
            position: absolute;
            left: 0;
            top: 0;
            width: 85.6mm;
            height: 54mm;
          }
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes slide-in-from-top {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Detail Row Component
const DetailRow: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  value?: string;
  subValue?: string;
  mono?: boolean;
  highlight?: boolean;
  highlightColor?: string;
  badge?: boolean;
  badgeColor?: string;
  textColor?: string;
}> = ({ icon: Icon, label, value, subValue, mono, highlight, highlightColor, badge, badgeColor, textColor }) => (
  <div className={`flex items-center gap-3 p-4 ${highlight ? 'bg-red-50' : 'hover:bg-slate-50'} transition-colors`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-red-100' : 'bg-slate-100'}`}>
      <Icon className={`w-5 h-5 ${highlight ? 'text-red-500' : 'text-slate-500'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      {badge ? (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor} ${textColor}`}>
          {value || '-'}
        </span>
      ) : (
        <>
          <p className={`text-sm font-medium truncate ${mono ? 'font-mono' : ''} ${highlight ? highlightColor : textColor || 'text-slate-800'}`}>
            {value || '-'}
          </p>
          {subValue && (
            <p className="text-xs text-slate-400 truncate">{subValue}</p>
          )}
        </>
      )}
    </div>
  </div>
);

export default IDCardPage;

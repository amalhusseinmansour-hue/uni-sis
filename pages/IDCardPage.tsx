import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard, Download, Printer, Share2, RefreshCw,
  AlertCircle, User, Loader2, CheckCircle, XCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { idCardAPI, DigitalIdCard } from '../api/idCard';

interface IDCardPageProps {
  lang: 'en' | 'ar';
}

const t: Record<string, { en: string; ar: string }> = {
  pageTitle: { en: 'University ID Card', ar: 'البطاقة الجامعية' },
  subtitle: { en: 'Your digital university identity card', ar: 'بطاقتك الجامعية الرقمية' },
  downloadPdf: { en: 'Download Card', ar: 'تحميل البطاقة' },
  printCard: { en: 'Print Card', ar: 'طباعة البطاقة' },
  shareCard: { en: 'Share', ar: 'مشاركة' },
  loading: { en: 'Loading your ID card...', ar: 'جاري تحميل البطاقة...' },
  error: { en: 'Failed to load ID card', ar: 'فشل تحميل البطاقة' },
  retry: { en: 'Retry', ar: 'إعادة المحاولة' },
  cardFront: { en: 'Front', ar: 'الواجهة' },
  cardBack: { en: 'Back', ar: 'الخلف' },
  downloading: { en: 'Downloading...', ar: 'جاري التحميل...' },
  downloadSuccess: { en: 'Downloaded successfully!', ar: 'تم التحميل بنجاح!' },
  downloadError: { en: 'Download failed. Please try again.', ar: 'فشل التحميل. يرجى المحاولة مرة أخرى.' },
};

const generateDynamicDates = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let academicYear: number;
  if (currentMonth >= 8) {
    academicYear = currentYear;
  } else {
    academicYear = currentYear - 1;
  }

  return {
    issue_date: `${academicYear}-09-01`,
    expiry_date: `${academicYear + 1}-08-31`,
    academicYear: `${academicYear}/${academicYear + 1}`,
  };
};

const getDefaultIdCard = (): DigitalIdCard => {
  const dates = generateDynamicDates();
  return {
    student: {
      id: 1,
      student_id: '25302064',
      name_en: 'ZAID O. A. ALBALAWI',
      name_ar: 'زيد عبدالله البلوي',
      profile_picture_url: undefined,
      status: 'ACTIVE',
      passport_no: '5951162',
      nationality: 'PALESTINE',
    },
    program: {
      name_en: 'Business Administration',
      name_ar: 'إدارة الأعمال',
      degree: 'MASTER',
    },
    college: {
      name_en: 'Business Administration',
      name_ar: 'إدارة الأعمال',
    },
    department: {
      name_en: 'Business Administration',
      name_ar: 'إدارة الأعمال',
    },
    academic: {
      level: 1,
      semester: 1,
      gpa: 3.75,
      academic_status: 'Good Standing',
      academic_year: dates.academicYear,
    },
    validity: {
      current_semester: { name: 'Spring 2025-2026', name_ar: 'الفصل الثاني' },
      issue_date: dates.issue_date,
      expiry_date: dates.expiry_date,
    },
    verification: {
      qr_data: `https://sis.vertexuniversity.edu.eu/verify/25302064`,
      barcode: 'VTX25302064',
    },
    needs_renewal: false,
  };
};

const IDCardPage: React.FC<IDCardPageProps> = ({ lang }) => {
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idCard, setIdCard] = useState<DigitalIdCard | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchIdCard();
  }, []);

  const fetchIdCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await idCardAPI.getMyIdCard();
      if (data && data.student) {
        setIdCard({ ...getDefaultIdCard(), ...data });
      } else {
        setIdCard(getDefaultIdCard());
      }
    } catch (err) {
      console.error('Error fetching ID card:', err);
      setIdCard(getDefaultIdCard());
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setNotification(null);

    try {
      const cardElement = showBack ? cardBackRef.current : cardFrontRef.current;
      if (!cardElement) throw new Error('Card element not found');

      const html2canvas = (await import('html2canvas')).default;
      const clone = cardElement.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(clone);

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `vertex-id-card-${idCard?.student.student_id || 'card'}-${showBack ? 'back' : 'front'}.png`;
      link.href = dataUrl;
      link.click();

      setNotification({ type: 'success', message: t.downloadSuccess[lang] });
    } catch (err) {
      console.error('Error downloading ID card:', err);
      setNotification({ type: 'error', message: t.downloadError[lang] });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vertex University ID Card',
          text: `${idCard?.student.name_en || ''} - ${idCard?.student.student_id || ''}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-800 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-blue-800 mx-auto mb-2" />
          <p className="text-slate-600">{t.loading[lang]}</p>
        </div>
      </div>
    );
  }

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
            className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            {t.retry[lang]}
          </button>
        </div>
      </div>
    );
  }

  const card = idCard || getDefaultIdCard();

  return (
    <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Notification */}
      {notification && (
        <div className={`no-print fixed top-4 right-4 left-4 md:left-auto md:w-96 p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
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
      <div className="no-print bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-7 h-7 text-blue-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.pageTitle[lang]}</h1>
                <p className="text-blue-200 text-sm">{t.subtitle[lang]}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-blue-900 font-medium rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? t.downloading[lang] : t.downloadPdf[lang]}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl"
              >
                <Printer className="w-4 h-4" />
                {t.printCard[lang]}
              </button>
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl"
                >
                  <Share2 className="w-4 h-4" />
                  {t.shareCard[lang]}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="no-print flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mx-auto">
        <button
          onClick={() => setShowBack(false)}
          className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${
            !showBack ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.cardFront[lang]}
        </button>
        <button
          onClick={() => setShowBack(true)}
          className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${
            showBack ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.cardBack[lang]}
        </button>
      </div>

      {/* Card Container */}
      <div className="flex justify-center">
        {/* Front Side */}
        {!showBack && (
          <div
            ref={cardFrontRef}
            className="id-card-print bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: '450px', minHeight: '580px' }}
          >
            {/* Card Content */}
            <div className="relative p-6" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f0f0 100%)' }}>
              {/* Watermark Pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003366' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Top Section - Photo and Logo */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                {/* Student Photo */}
                <div className="relative">
                  <div
                    className="w-32 h-40 bg-white rounded-lg overflow-hidden shadow-lg"
                    style={{ border: '4px solid #1e3a5f' }}
                  >
                    {card.student.profile_picture_url ? (
                      <img
                        src={card.student.profile_picture_url}
                        alt={card.student.name_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <User className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* University Logo */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-2 relative">
                    {/* Logo Circle */}
                    <div className="w-full h-full rounded-full border-4 border-blue-900 flex items-center justify-center bg-white relative overflow-hidden">
                      <div className="absolute inset-1 rounded-full border-2 border-yellow-500" />
                      <div className="text-center z-10">
                        <div className="text-[8px] text-blue-900 font-bold tracking-wider" style={{ transform: 'rotate(-15deg)', marginTop: '-8px' }}>VERTEX UNIVERSITY</div>
                        <div className="text-3xl font-bold text-blue-900 my-1">V</div>
                        <div className="text-[8px] text-blue-900 font-bold tracking-wider" style={{ transform: 'rotate(15deg)', marginBottom: '-8px' }}>INTERNATIONAL</div>
                      </div>
                      {/* Stars */}
                      <div className="absolute top-1 right-2 text-yellow-500 text-xs">★</div>
                      <div className="absolute top-1 left-2 text-yellow-500 text-xs">★</div>
                    </div>
                  </div>
                  <div className="text-blue-900 font-bold text-lg tracking-wide">
                    <span className="text-yellow-600">V</span>ERTEX <span className="text-yellow-600">U</span>NIVERSITY
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-3 relative z-10 text-sm">
                <div className="flex">
                  <span className="font-bold text-blue-900 w-40">NAME</span>
                  <span className="text-slate-800">: {card.student.name_en}</span>
                </div>
                <div className="flex">
                  <span className="font-bold text-blue-900 w-40">STUDENT NO.</span>
                  <span className="text-slate-800">: {card.student.student_id}</span>
                </div>
                <div className="flex flex-wrap">
                  <div className="flex flex-1">
                    <span className="font-bold text-blue-900 w-40">PASSPORT NO.</span>
                    <span className="text-slate-800">: {card.student.passport_no || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-blue-900 ml-4">NATIONALITY</span>
                    <span className="text-slate-800 ml-2">: {card.student.nationality || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex">
                  <span className="font-bold text-blue-900 w-40">FACULTY</span>
                  <span className="text-slate-800">: {card.college?.name_en?.toUpperCase() || card.program?.name_en?.toUpperCase()}</span>
                </div>
                <div className="flex">
                  <span className="font-bold text-blue-900 w-40">DEPARTMENT</span>
                  <span className="text-slate-800">: {card.department?.name_en?.toUpperCase() || card.program?.name_en?.toUpperCase()}</span>
                </div>
                <div className="flex flex-wrap">
                  <div className="flex flex-1">
                    <span className="font-bold text-blue-900 w-40">DEGREE PROGRAM</span>
                    <span className="text-slate-800">: {card.program?.degree || 'BACHELOR'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-blue-900 ml-4">ACADEMIC YEAR</span>
                    <span className="text-slate-800 ml-2">: {card.academic?.academic_year || '2025/2026'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Elements */}
              <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
                {/* Golden wave on left */}
                <svg className="absolute bottom-0 left-0" width="150" height="60" viewBox="0 0 150 60">
                  <path d="M0 60 L0 30 Q30 0 60 30 Q90 60 120 30 L150 30 L150 60 Z" fill="#c9a227" opacity="0.9"/>
                  <path d="M0 60 L0 40 Q30 15 60 40 Q90 60 120 40 L150 40 L150 60 Z" fill="#1e3a5f"/>
                </svg>
                {/* Blue bar */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-blue-900" />
              </div>
            </div>
          </div>
        )}

        {/* Back Side */}
        {showBack && (
          <div
            ref={cardBackRef}
            className="id-card-print bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: '450px', minHeight: '580px' }}
          >
            <div className="relative p-6 h-full" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f0f0 100%)' }}>
              {/* Watermark Pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003366' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Top Section - Logo and QR */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                {/* University Logo */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 relative">
                    <div className="w-full h-full rounded-full border-3 border-blue-900 flex items-center justify-center bg-white relative overflow-hidden">
                      <div className="absolute inset-1 rounded-full border border-yellow-500" />
                      <div className="text-center z-10">
                        <div className="text-[6px] text-blue-900 font-bold">VERTEX UNIVERSITY</div>
                        <div className="text-2xl font-bold text-blue-900">V</div>
                        <div className="text-[6px] text-blue-900 font-bold">INTERNATIONAL</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-900 font-bold text-base tracking-wide">
                    <span className="text-yellow-600">V</span>ERTEX <span className="text-yellow-600">U</span>NIVERSITY
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-2 rounded-lg shadow-md">
                  <QRCodeSVG
                    value={card.verification?.qr_data || `https://sis.vertexuniversity.edu.eu/verify/${card.student.student_id}`}
                    size={80}
                    level="H"
                    fgColor="#1e3a5f"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="relative z-10 mb-8">
                <h3 className="font-bold text-blue-900 text-center mb-4 text-sm">
                  TERMS AND CONDITIONS – STUDENT ID CARD
                </h3>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-blue-900 flex-shrink-0 mt-0.5" />
                    <p>This card certifies that the holder is officially enrolled as a student at Vertex University.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-blue-900 flex-shrink-0 mt-0.5" />
                    <p>It is strictly non-transferable and must not be used or shared with any other person under any circumstance, including on the university's website or digital platforms.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-blue-900 flex-shrink-0 mt-0.5" />
                    <p>In case of loss, please contact the Student Affairs Department immediately via the email or address provided below.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-blue-900 flex-shrink-0 mt-0.5" />
                    <p>This ID card is valid only during the student's active enrollment period in their registered academic program.</p>
                  </div>
                </div>
              </div>

              {/* Capitol Building Image Placeholder */}
              <div className="absolute bottom-20 right-6 w-24 h-20 opacity-30">
                <svg viewBox="0 0 100 80" className="w-full h-full text-blue-900">
                  <rect x="35" y="30" width="30" height="50" fill="currentColor" opacity="0.3"/>
                  <rect x="20" y="45" width="15" height="35" fill="currentColor" opacity="0.3"/>
                  <rect x="65" y="45" width="15" height="35" fill="currentColor" opacity="0.3"/>
                  <ellipse cx="50" cy="30" rx="20" ry="15" fill="currentColor" opacity="0.3"/>
                  <rect x="45" y="10" width="10" height="20" fill="currentColor" opacity="0.3"/>
                </svg>
              </div>

              {/* Bottom Section - Contact Info */}
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
                {/* Golden wave on left */}
                <svg className="absolute bottom-8 left-0" width="120" height="50" viewBox="0 0 120 50">
                  <path d="M0 50 L0 25 Q25 0 50 25 Q75 50 100 25 L120 25 L120 50 Z" fill="#c9a227" opacity="0.9"/>
                </svg>

                {/* Contact Info Bar */}
                <div className="bg-blue-900 text-white py-3 px-4 relative z-10">
                  <div className="flex items-center justify-center gap-1 text-xs mb-1">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    <span>1401 21st Street, Sacramento, CA 95811, California, USA</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/>
                      </svg>
                      <span>vertexuniversity.edu.eu</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      <span>info@vertexuniversity.edu.eu</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                      <span>+1 (984) 382-6080</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .id-card-print, .id-card-print * {
            visibility: visible;
          }
          .id-card-print {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 85.6mm !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page {
            size: 90mm 130mm;
            margin: 2mm;
          }
        }
      `}</style>
    </div>
  );
};

export default IDCardPage;

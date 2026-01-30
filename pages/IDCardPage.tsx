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

// Helper to fill in default dates if not provided by API
const fillDefaultDates = (data: DigitalIdCard): DigitalIdCard => {
  const dates = generateDynamicDates();
  return {
    ...data,
    academic: {
      ...data.academic,
      academic_year: data.academic?.academic_year || dates.academicYear,
    },
    validity: {
      ...data.validity,
      issue_date: data.validity?.issue_date || dates.issue_date,
      expiry_date: data.validity?.expiry_date || dates.expiry_date,
    },
  };
};

const IDCardPage: React.FC<IDCardPageProps> = ({ lang }) => {
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idCard, setIdCard] = useState<DigitalIdCard | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchIdCard();
  }, []);

  const fetchIdCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await idCardAPI.getMyIdCard();
      if (data && data.student && data.student.student_id) {
        // Fill in default dates if not provided
        setIdCard(fillDefaultDates(data));
      } else {
        setError(lang === 'ar' ? 'لم يتم العثور على بيانات البطاقة' : 'ID card data not found');
        setIdCard(null);
      }
    } catch (err) {
      setError(lang === 'ar' ? 'فشل في تحميل البطاقة الجامعية' : 'Failed to load ID card');
      setIdCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setNotification(null);

    try {
      const cardElement = cardsContainerRef.current;
      if (!cardElement) throw new Error('Card element not found');

      const html2canvas = (await import('html2canvas')).default;
      const clone = cardElement.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '450px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f1f5f9',
      });

      document.body.removeChild(clone);

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `vertex-id-card-${idCard?.student.student_id || 'card'}.png`;
      link.href = dataUrl;
      link.click();

      setNotification({ type: 'success', message: t.downloadSuccess[lang] });
    } catch (err) {
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
        // Share cancelled
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
    <div className="space-y-4 sm:space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
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
          <button onClick={() => setNotification(null)} className="ms-auto">
            <XCircle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="no-print bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-blue-900" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{t.pageTitle[lang]}</h1>
                <p className="text-blue-200 text-xs sm:text-sm">{t.subtitle[lang]}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-blue-900 font-medium rounded-lg sm:rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? t.downloading[lang] : t.downloadPdf[lang]}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg sm:rounded-xl text-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{t.printCard[lang]}</span>
              </button>
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg sm:rounded-xl text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.shareCard[lang]}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Container - Both Front and Back */}
      <div ref={cardsContainerRef} className="flex flex-col items-center gap-6 sm:gap-8 p-2 sm:p-4 id-card-print bg-slate-100 rounded-xl">
        {/* Front Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden relative w-full max-w-[420px]" style={{ border: '1px solid #e2e8f0' }}>
          {/* Watermark Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z' fill='%23003366'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }} />

          <div className="relative p-3 sm:p-5">
            {/* Top Section - Photo and Logo */}
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              {/* Student Photo */}
              <div
                className="w-[70px] h-[90px] sm:w-[90px] sm:h-[115px] bg-white rounded overflow-hidden flex-shrink-0"
                style={{ border: '3px solid #1e3a5f' }}
              >
                {card.student.profile_picture_url ? (
                  <img
                    src={card.student.profile_picture_url}
                    alt={card.student.name_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                  </div>
                )}
              </div>

              {/* University Logo */}
              <div className="text-center flex-shrink-0">
                <div className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] mx-auto mb-1">
                  <img
                    src="/logo-color.png"
                    alt="Vertex University Logo"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-0.5 sm:space-y-1 text-[9px] sm:text-[11px] relative z-10 mb-8 sm:mb-10">
              <div className="flex flex-wrap">
                <span className="font-bold text-[#1e3a5f] w-[90px] sm:w-[120px]">NAME</span>
                <span className="text-slate-800">: {card.student.name_en}</span>
              </div>
              <div className="flex">
                <span className="font-bold text-[#1e3a5f] w-[90px] sm:w-[120px]">STUDENT NO.</span>
                <span className="text-slate-800">: {card.student.student_id}</span>
              </div>
              <div className="flex flex-wrap gap-x-4">
                <div className="flex">
                  <span className="font-bold text-[#1e3a5f] w-[90px] sm:w-[120px]">PASSPORT NO.</span>
                  <span className="text-slate-800">: {card.student.passport_no || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold text-[#1e3a5f]">NATIONALITY</span>
                  <span className="text-slate-800 ms-1">: {card.student.nationality || 'N/A'}</span>
                </div>
              </div>
              <div className="flex flex-wrap">
                <span className="font-bold text-[#1e3a5f] w-[90px] sm:w-[120px]">FACULTY</span>
                <span className="text-slate-800 break-all">: {(card.college?.name_en || card.program?.name_en || '').toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="font-bold text-[#1e3a5f] w-[90px] sm:w-[120px]">DEPARTMENT</span>
                <span className="text-slate-800 break-all">: {(card.department?.name_en || card.program?.name_en || '').toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap gap-x-4">
                <div className="flex">
                  <span className="font-bold text-[#1e3a5f] w-[90px] sm:w-[120px]">DEGREE PROGRAM</span>
                  <span className="text-slate-800">: {card.program?.degree || 'BACHELOR'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold text-[#1e3a5f]">ACADEMIC YEAR</span>
                  <span className="text-slate-800 ms-1">: {card.academic?.academic_year || '2025/2026'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Decorative */}
            <div className="absolute bottom-0 left-0 right-0 h-[25px] sm:h-[30px] overflow-hidden">
              <svg className="absolute bottom-0 left-0 w-[80px] sm:w-[100px]" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d="M0 30 L0 15 Q15 0 30 15 Q45 30 60 15 Q75 0 90 15 L100 15 L100 30 Z" fill="#c9a227"/>
              </svg>
              <div className="absolute bottom-0 left-0 right-0 h-[12px] sm:h-[14px] bg-[#1e3a5f]" />
            </div>
          </div>
        </div>

        {/* Back Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden relative w-full max-w-[420px]" style={{ border: '1px solid #e2e8f0' }}>
          {/* Watermark Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z' fill='%23003366'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }} />

          <div className="relative p-3 sm:p-5">
            {/* Top Section - Logo and QR */}
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              {/* University Logo */}
              <div className="text-center flex-shrink-0">
                <div className="w-[50px] h-[50px] sm:w-[65px] sm:h-[65px] mx-auto mb-1">
                  <img
                    src="/logo-color.png"
                    alt="Vertex University Logo"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-1 sm:p-1.5 rounded shadow-sm border border-slate-200">
                <QRCodeSVG
                  value={card.verification?.qr_data || `https://sis.vertexuniversity.edu.eu/verify/${card.student.student_id}`}
                  size={50}
                  level="H"
                  fgColor="#1e3a5f"
                  bgColor="#ffffff"
                  className="sm:hidden"
                />
                <QRCodeSVG
                  value={card.verification?.qr_data || `https://sis.vertexuniversity.edu.eu/verify/${card.student.student_id}`}
                  size={65}
                  level="H"
                  fgColor="#1e3a5f"
                  bgColor="#ffffff"
                  className="hidden sm:block"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="relative z-10 mb-2">
              <h3 className="font-bold text-[#1e3a5f] text-center mb-1.5 sm:mb-2 text-[9px] sm:text-[11px]">
                TERMS AND CONDITIONS – STUDENT ID CARD
              </h3>
              <div className="space-y-1 sm:space-y-1.5 text-[7px] sm:text-[9px] text-slate-700">
                <div className="flex items-start gap-1 sm:gap-1.5">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-[1px] sm:border-[1.5px] border-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p>This card certifies that the holder is officially enrolled as a student at Vertex University.</p>
                </div>
                <div className="flex items-start gap-1 sm:gap-1.5">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-[1px] sm:border-[1.5px] border-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p>It is strictly non-transferable and must not be used or shared with any other person under any circumstance.</p>
                </div>
                <div className="flex items-start gap-1 sm:gap-1.5">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-[1px] sm:border-[1.5px] border-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p>In case of loss, please contact the Student Affairs Department immediately.</p>
                </div>
                <div className="flex items-start gap-1 sm:gap-1.5">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-[1px] sm:border-[1.5px] border-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p>This ID card is valid only during the student's active enrollment period.</p>
                </div>
              </div>
            </div>

            {/* Bottom Section - Contact Info */}
            <div className="mt-3 sm:mt-4">
              {/* Golden wave */}
              <div className="relative h-4 sm:h-5 mb-0">
                <svg className="absolute bottom-0 left-0 w-[70px] sm:w-[90px]" height="20" viewBox="0 0 90 20" preserveAspectRatio="none">
                  <path d="M0 20 L0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 L90 10 L90 20 Z" fill="#c9a227"/>
                </svg>
              </div>

              {/* Contact Info Bar */}
              <div className="bg-[#1e3a5f] text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-b-lg -mx-3 sm:-mx-5 -mb-3 sm:-mb-5">
                <div className="flex items-center justify-center gap-1 text-[6px] sm:text-[8px] mb-0.5">
                  <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span className="truncate">1401 21st Street, Sacramento, CA 95811, USA</span>
                </div>
                <div className="flex items-center justify-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-0.5 text-[6px] sm:text-[8px]">
                  <div className="flex items-center gap-0.5">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16z" clipRule="evenodd"/>
                    </svg>
                    <span>vertexuniversity.edu.eu</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span>info@vertexuniversity.edu.eu</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <span>+1 (984) 382-6080</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            top: 0;
            transform: translateX(-50%);
            padding: 10mm !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
        }
      `}</style>
    </div>
  );
};

export default IDCardPage;

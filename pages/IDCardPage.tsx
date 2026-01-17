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
      const cardElement = cardsContainerRef.current;
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

      {/* Cards Container - Both Front and Back */}
      <div ref={cardsContainerRef} className="flex flex-col items-center gap-8 p-4 id-card-print" style={{ backgroundColor: '#f1f5f9' }}>
        {/* Front Card */}
        <div
          className="bg-white rounded-lg shadow-xl overflow-hidden relative"
          style={{ width: '420px', height: '270px', border: '1px solid #e2e8f0' }}
        >
          {/* Watermark Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z' fill='%23003366'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }} />

          <div className="relative p-5 h-full flex flex-col">
            {/* Top Section - Photo and Logo */}
            <div className="flex justify-between items-start mb-3">
              {/* Student Photo */}
              <div
                className="w-[90px] h-[115px] bg-white rounded overflow-hidden flex-shrink-0"
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
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                )}
              </div>

              {/* University Logo */}
              <div className="text-center flex-shrink-0">
                <div className="w-[72px] h-[72px] mx-auto mb-1 relative">
                  <div className="w-full h-full rounded-full border-[3px] border-[#1e3a5f] flex items-center justify-center bg-white relative">
                    <div className="absolute inset-[3px] rounded-full border-2 border-[#c9a227]" />
                    <div className="text-center z-10">
                      <div className="text-[5px] text-[#1e3a5f] font-bold tracking-wider" style={{ marginTop: '-4px' }}>VERTEX UNIVERSITY</div>
                      <div className="text-xl font-bold text-[#1e3a5f] leading-none my-0.5">V</div>
                      <div className="text-[5px] text-[#1e3a5f] font-bold tracking-wider" style={{ marginBottom: '-4px' }}>INTERNATIONAL</div>
                    </div>
                    <div className="absolute top-0.5 right-1.5 text-[#c9a227] text-[8px]">★</div>
                    <div className="absolute top-0.5 left-1.5 text-[#c9a227] text-[8px]">★</div>
                  </div>
                </div>
                <div className="text-[#1e3a5f] font-bold text-sm tracking-wide whitespace-nowrap">
                  <span className="text-[#c9a227]">V</span>ERTEX <span className="text-[#c9a227]">U</span>NIVERSITY
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-1 text-[11px] flex-grow relative z-10">
              <div className="flex">
                <span className="font-bold text-[#1e3a5f] w-[120px]">NAME</span>
                <span className="text-slate-800">: {card.student.name_en}</span>
              </div>
              <div className="flex">
                <span className="font-bold text-[#1e3a5f] w-[120px]">STUDENT NO.</span>
                <span className="text-slate-800">: {card.student.student_id}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-[#1e3a5f] w-[120px]">PASSPORT NO.</span>
                <span className="text-slate-800">: {card.student.passport_no || 'N/A'}</span>
                <span className="font-bold text-[#1e3a5f] ml-6">NATIONALITY</span>
                <span className="text-slate-800 ml-2">: {card.student.nationality || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-bold text-[#1e3a5f] w-[120px]">FACULTY</span>
                <span className="text-slate-800">: {(card.college?.name_en || card.program?.name_en || '').toUpperCase()}</span>
              </div>
              <div className="flex">
                <span className="font-bold text-[#1e3a5f] w-[120px]">DEPARTMENT</span>
                <span className="text-slate-800">: {(card.department?.name_en || card.program?.name_en || '').toUpperCase()}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-[#1e3a5f] w-[120px]">DEGREE PROGRAM</span>
                <span className="text-slate-800">: {card.program?.degree || 'BACHELOR'}</span>
                <span className="font-bold text-[#1e3a5f] ml-6">ACADEMIC YEAR</span>
                <span className="text-slate-800 ml-2">: {card.academic?.academic_year || '2025/2026'}</span>
              </div>
            </div>

            {/* Bottom Decorative */}
            <div className="absolute bottom-0 left-0 right-0 h-[30px] overflow-hidden">
              <svg className="absolute bottom-0 left-0" width="100" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d="M0 30 L0 15 Q15 0 30 15 Q45 30 60 15 Q75 0 90 15 L100 15 L100 30 Z" fill="#c9a227"/>
              </svg>
              <div className="absolute bottom-0 left-0 right-0 h-[14px] bg-[#1e3a5f]" />
            </div>
          </div>
        </div>

        {/* Back Card */}
        <div
          className="bg-white rounded-lg shadow-xl overflow-hidden relative"
          style={{ width: '420px', height: '270px', border: '1px solid #e2e8f0' }}
        >
          {/* Watermark Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z' fill='%23003366'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }} />

          <div className="relative p-5 h-full flex flex-col">
            {/* Top Section - Logo and QR */}
            <div className="flex justify-between items-start mb-3">
              {/* University Logo */}
              <div className="text-center flex-shrink-0">
                <div className="w-[60px] h-[60px] mx-auto mb-1 relative">
                  <div className="w-full h-full rounded-full border-[2px] border-[#1e3a5f] flex items-center justify-center bg-white relative">
                    <div className="absolute inset-[2px] rounded-full border border-[#c9a227]" />
                    <div className="text-center z-10">
                      <div className="text-[4px] text-[#1e3a5f] font-bold">VERTEX UNIVERSITY</div>
                      <div className="text-base font-bold text-[#1e3a5f] leading-none">V</div>
                      <div className="text-[4px] text-[#1e3a5f] font-bold">INTERNATIONAL</div>
                    </div>
                  </div>
                </div>
                <div className="text-[#1e3a5f] font-bold text-xs tracking-wide whitespace-nowrap">
                  <span className="text-[#c9a227]">V</span>ERTEX <span className="text-[#c9a227]">U</span>NIVERSITY
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-1.5 rounded shadow-sm border border-slate-200">
                <QRCodeSVG
                  value={card.verification?.qr_data || `https://sis.vertexuniversity.edu.eu/verify/${card.student.student_id}`}
                  size={65}
                  level="H"
                  fgColor="#1e3a5f"
                  bgColor="#ffffff"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex-grow relative z-10">
              <h3 className="font-bold text-[#1e3a5f] text-center mb-2 text-[11px]">
                TERMS AND CONDITIONS – STUDENT ID CARD
              </h3>
              <div className="space-y-1.5 text-[9px] text-slate-700 pr-20">
                <div className="flex items-start gap-1.5">
                  <span className="w-3 h-3 rounded-full border-[1.5px] border-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p>This card certifies that the holder is officially enrolled as a student at Vertex University.</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-3 h-3 rounded-full border-[1.5px] border-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p>It is strictly non-transferable and must not be used or shared with any other person under any circumstance, including on the university's website or digital platforms.</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-3 h-3 rounded-full border-[1.5px] border-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p>In case of loss, please contact the Student Affairs Department immediately via the email or address provided below.</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-3 h-3 rounded-full border-[1.5px] border-[#1e3a5f] flex-shrink-0 mt-0.5" />
                  <p>This ID card is valid only during the student's active enrollment period in their registered academic program.</p>
                </div>
              </div>
            </div>

            {/* Capitol Building */}
            <div className="absolute bottom-12 right-4 w-16 h-14 opacity-20">
              <svg viewBox="0 0 100 80" className="w-full h-full text-[#1e3a5f]">
                <rect x="35" y="30" width="30" height="50" fill="currentColor"/>
                <rect x="20" y="45" width="15" height="35" fill="currentColor"/>
                <rect x="65" y="45" width="15" height="35" fill="currentColor"/>
                <ellipse cx="50" cy="30" rx="20" ry="15" fill="currentColor"/>
                <rect x="45" y="10" width="10" height="20" fill="currentColor"/>
              </svg>
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
              <svg className="absolute bottom-[36px] left-0" width="90" height="25" viewBox="0 0 90 25" preserveAspectRatio="none">
                <path d="M0 25 L0 12 Q12 0 24 12 Q36 25 48 12 Q60 0 72 12 L90 12 L90 25 Z" fill="#c9a227"/>
              </svg>

              {/* Contact Info Bar */}
              <div className="bg-[#1e3a5f] text-white py-2 px-3 relative z-10">
                <div className="flex items-center justify-center gap-1 text-[8px] mb-0.5">
                  <svg className="w-2.5 h-2.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>1401 21st Street, Sacramento, CA 95811, California, USA</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-[8px]">
                  <div className="flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16z" clipRule="evenodd"/>
                    </svg>
                    <span>vertexuniversity.edu.eu</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span>info@vertexuniversity.edu.eu</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
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

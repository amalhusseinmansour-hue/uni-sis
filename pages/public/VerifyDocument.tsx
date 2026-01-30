import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  FileText,
  User,
  Calendar,
  GraduationCap,
  Building,
  QrCode,
  ExternalLink,
} from 'lucide-react';

interface VerifyDocumentProps {
  lang: 'en' | 'ar';
}

interface VerificationResult {
  valid: boolean;
  document?: {
    type: string;
    type_ar: string;
    issue_date: string;
    expiry_date?: string;
    reference_number: string;
    student: {
      name_en: string;
      name_ar: string;
      student_id: string;
      program_en: string;
      program_ar: string;
    };
    university: {
      name_en: string;
      name_ar: string;
      logo?: string;
    };
  };
  message?: string;
}

const t = {
  title: { en: 'Document Verification', ar: 'التحقق من الوثائق' },
  subtitle: { en: 'Verify the authenticity of university documents', ar: 'تحقق من صحة الوثائق الجامعية' },
  enterCode: { en: 'Enter verification code', ar: 'أدخل رمز التحقق' },
  placeholder: { en: 'Enter the code from the document or scan QR', ar: 'أدخل الرمز من الوثيقة أو امسح QR' },
  verify: { en: 'Verify', ar: 'تحقق' },
  verifying: { en: 'Verifying...', ar: 'جاري التحقق...' },
  validDocument: { en: 'Valid Document', ar: 'وثيقة صالحة' },
  invalidDocument: { en: 'Invalid Document', ar: 'وثيقة غير صالحة' },
  documentType: { en: 'Document Type', ar: 'نوع الوثيقة' },
  issuedTo: { en: 'Issued To', ar: 'صادرة لـ' },
  studentId: { en: 'Student ID', ar: 'الرقم الجامعي' },
  program: { en: 'Program', ar: 'البرنامج' },
  issueDate: { en: 'Issue Date', ar: 'تاريخ الإصدار' },
  expiryDate: { en: 'Expiry Date', ar: 'تاريخ الانتهاء' },
  referenceNumber: { en: 'Reference Number', ar: 'الرقم المرجعي' },
  university: { en: 'University', ar: 'الجامعة' },
  tryAnother: { en: 'Verify Another', ar: 'تحقق من وثيقة أخرى' },
  scanQR: { en: 'Scan QR Code', ar: 'امسح رمز QR' },
  or: { en: 'or', ar: 'أو' },
  secureVerification: { en: 'Secure Verification', ar: 'تحقق آمن' },
  secureDesc: { en: 'This service verifies the authenticity of official university documents', ar: 'هذه الخدمة تتحقق من صحة الوثائق الجامعية الرسمية' },
  howTo: { en: 'How to verify', ar: 'كيفية التحقق' },
  step1: { en: 'Find the verification code or QR code on the document', ar: 'ابحث عن رمز التحقق أو رمز QR على الوثيقة' },
  step2: { en: 'Enter the code in the field above or scan the QR', ar: 'أدخل الرمز في الحقل أعلاه أو امسح QR' },
  step3: { en: 'Click Verify to check the document authenticity', ar: 'اضغط تحقق للتأكد من صحة الوثيقة' },
  noExpiry: { en: 'No Expiry', ar: 'لا ينتهي' },
  error: { en: 'An error occurred. Please try again.', ar: 'حدث خطأ. يرجى المحاولة مرة أخرى.' },
};

const API_BASE = '/api';

export default function VerifyDocument({ lang }: VerifyDocumentProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/verify/document/${encodeURIComponent(code.trim())}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else if (response.status === 404) {
        setResult({ valid: false, message: t.invalidDocument[lang] });
      } else {
        setError(t.error[lang]);
      }
    } catch (err) {
      setError(t.error[lang]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setResult(null);
    setError(null);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title[lang]}</h1>
          <p className="text-gray-600">{t.subtitle[lang]}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Verification Form */}
          {!result && (
            <div className="p-6 md:p-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.enterCode[lang]}
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <QrCode className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder={t.placeholder[lang]}
                    className="w-full ps-12 pe-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={loading || !code.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.verifying[lang]}
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      {t.verify[lang]}
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* How to verify */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">{t.howTo[lang]}</h3>
                <div className="space-y-3">
                  {[t.step1, t.step2, t.step3].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-gray-600">{step[lang]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div>
              {/* Status Header */}
              <div
                className={`p-6 ${
                  result.valid
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                } text-white`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    {result.valid ? (
                      <CheckCircle className="w-10 h-10" />
                    ) : (
                      <XCircle className="w-10 h-10" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {result.valid ? t.validDocument[lang] : t.invalidDocument[lang]}
                    </h2>
                    {result.valid && result.document && (
                      <p className="text-white/80 mt-1">
                        {lang === 'ar' ? result.document.type_ar : result.document.type}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Details */}
              {result.valid && result.document && (
                <div className="p-6 md:p-8 space-y-6">
                  {/* Student Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{t.issuedTo[lang]}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{lang === 'ar' ? 'الاسم' : 'Name'}</p>
                        <p className="font-semibold text-gray-900">
                          {lang === 'ar'
                            ? result.document.student.name_ar
                            : result.document.student.name_en}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.studentId[lang]}</p>
                        <p className="font-mono font-semibold text-gray-900">
                          {result.document.student.student_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Program */}
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                    <GraduationCap className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">{t.program[lang]}</p>
                      <p className="font-semibold text-gray-900">
                        {lang === 'ar'
                          ? result.document.student.program_ar
                          : result.document.student.program_en}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                      <Calendar className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">{t.issueDate[lang]}</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(result.document.issue_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                      <Calendar className="w-8 h-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-500">{t.expiryDate[lang]}</p>
                        <p className="font-semibold text-gray-900">
                          {result.document.expiry_date
                            ? formatDate(result.document.expiry_date)
                            : t.noExpiry[lang]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reference Number */}
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-blue-600">{t.referenceNumber[lang]}</p>
                      <p className="font-mono font-bold text-blue-900 text-lg">
                        {result.document.reference_number}
                      </p>
                    </div>
                  </div>

                  {/* University */}
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                    <Building className="w-8 h-8 text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-500">{t.university[lang]}</p>
                      <p className="font-semibold text-gray-900">
                        {lang === 'ar'
                          ? result.document.university.name_ar
                          : result.document.university.name_en}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Invalid Document Message */}
              {!result.valid && (
                <div className="p-6 md:p-8">
                  <div className="text-center py-8">
                    <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {result.message || t.invalidDocument[lang]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {lang === 'ar'
                        ? 'الرمز الذي أدخلته غير صحيح أو الوثيقة غير موجودة'
                        : 'The code you entered is incorrect or the document does not exist'}
                    </p>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {t.tryAnother[lang]}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-500" />
            {t.secureVerification[lang]}
          </div>
        </div>
      </div>
    </div>
  );
}

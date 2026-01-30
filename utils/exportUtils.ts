// Export and Print Utilities for Universe SIS

// ==========================================
// UNIVERSITY PDF TEMPLATE SYSTEM
// ==========================================

/**
 * Get branding settings from localStorage
 */
const getBrandingSettings = () => {
  try {
    const stored = localStorage.getItem('university_branding_settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading branding settings:', e);
  }
  return null;
};

/**
 * University Information - Can be configured from backend/admin panel
 */
export const getUniversityInfo = () => {
  const branding = getBrandingSettings();
  return {
    name_en: branding?.universityName || 'VERTEX UNIVERSITY',
    name_ar: branding?.universityNameAr || 'جامعة فيرتكس',
    // For reports, prioritize reportHeaderLogo over the main logo
    logo: branding?.reportHeaderLogo || branding?.logo || '',
    logoLight: branding?.logoLight || '',
    slogan_en: branding?.universitySlogan || 'Excellence in Education',
    slogan_ar: branding?.universitySloganAr || 'التميز في التعليم',
    address_en: branding?.universityAddress || 'P.O. Box 12345, Riyadh, Saudi Arabia',
    address_ar: branding?.universityAddressAr || 'ص.ب 12345، الرياض، المملكة العربية السعودية',
    phone: branding?.universityPhone || '+966 11 123 4567',
    email: branding?.universityEmail || 'info@vertix.edu.sa',
    website: branding?.universityWebsite || 'www.vertix.edu.sa',
    // Colors
    primaryColor: branding?.reportPrimaryColor || branding?.primaryColor || '#1e40af',
    secondaryColor: branding?.reportSecondaryColor || branding?.secondaryColor || '#3b82f6',
    accentColor: branding?.accentColor || '#f59e0b',
    // Report settings
    footerText: branding?.reportFooterText || 'This is an official document issued by the university',
    footerTextAr: branding?.reportFooterTextAr || 'هذه وثيقة رسمية صادرة من الجامعة',
    showWatermark: branding?.showReportWatermark !== false,
  };
};

// Keep for backward compatibility
export const UNIVERSITY_INFO = {
  name_en: 'VERTEX UNIVERSITY',
  name_ar: 'جامعة فيرتكس',
  logo: 'VU',
  slogan_en: 'Excellence in Education',
  slogan_ar: 'التميز في التعليم',
  address_en: 'P.O. Box 12345, Riyadh, Saudi Arabia',
  address_ar: 'ص.ب 12345، الرياض، المملكة العربية السعودية',
  phone: '+966 11 123 4567',
  email: 'info@vertix.edu.sa',
  website: 'www.vertix.edu.sa',
};

/**
 * Generate University Header HTML
 */
export const generateUniversityHeader = (
  documentTitle: string,
  documentTitleAr: string,
  lang: 'en' | 'ar' = 'en'
): string => {
  const isRTL = lang === 'ar';
  const info = getUniversityInfo();
  const currentDate = new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate logo HTML - either image or text fallback
  const logoHTML = info.logo
    ? `<img src="${info.logo}" alt="Logo" style="height: 60px; width: auto; object-fit: contain;" />`
    : `<div class="university-logo">${info.name_en.substring(0, 2).toUpperCase()}</div>`;

  return `
    <div class="official-header" style="background: linear-gradient(135deg, ${info.primaryColor} 0%, ${info.secondaryColor} 50%, ${info.primaryColor} 100%);">
      <div class="header-content">
        <div class="university-info">
          ${logoHTML}
          <div class="university-name">
            <h1>${isRTL ? info.name_ar : info.name_en}</h1>
            <p class="slogan">${isRTL ? info.slogan_ar : info.slogan_en}</p>
          </div>
        </div>
        <div class="document-info">
          <h2 class="document-title">${isRTL ? documentTitleAr : documentTitle}</h2>
          <p class="document-date">${currentDate}</p>
          <p class="document-number">${isRTL ? 'رقم الوثيقة:' : 'Doc No:'} ${Date.now().toString(36).toUpperCase()}</p>
        </div>
      </div>
      <div class="header-decoration" style="background: linear-gradient(90deg, ${info.accentColor} 0%, ${info.accentColor}80 50%, ${info.accentColor} 100%);"></div>
    </div>
  `;
};

/**
 * Generate University Footer HTML
 */
export const generateUniversityFooter = (lang: 'en' | 'ar' = 'en'): string => {
  const isRTL = lang === 'ar';
  const info = getUniversityInfo();

  return `
    <div class="official-footer">
      <div class="footer-content">
        <div class="stamp-section">
          <div class="stamp-circle">
            <span>${isRTL ? 'الختم الرسمي' : 'Official Seal'}</span>
          </div>
          <p class="stamp-label">${isRTL ? 'ختم الجامعة' : 'University Seal'}</p>
        </div>
        <div class="signature-section">
          <div class="signature-line"></div>
          <p class="signature-label">${isRTL ? 'التوقيع المعتمد' : 'Authorized Signature'}</p>
        </div>
        <div class="qr-section">
          <div class="qr-placeholder">QR</div>
          <p class="qr-label">${isRTL ? 'رمز التحقق' : 'Verify'}</p>
        </div>
      </div>
      <div class="footer-info" style="border-top-color: ${info.primaryColor}; border-bottom-color: ${info.primaryColor};">
        <p>${isRTL ? info.address_ar : info.address_en}</p>
        <p>${info.phone} | ${info.email} | ${info.website}</p>
      </div>
      <div class="footer-note">
        ${isRTL ? info.footerTextAr : info.footerText}
      </div>
    </div>
  `;
};

/**
 * Base CSS Styles for all university documents
 */
export const getUniversityDocumentStyles = (lang: 'en' | 'ar' = 'en'): string => {
  const isRTL = lang === 'ar';

  return `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Cairo', 'Segoe UI', 'Arial', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      direction: ${isRTL ? 'rtl' : 'ltr'};
      line-height: 1.6;
    }
    .document-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    /* Official Header Styles */
    .official-header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%);
      color: white;
      padding: 25px 40px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .university-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .university-logo {
      width: 70px;
      height: 70px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }
    .university-name h1 {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .university-name .slogan {
      font-size: 11px;
      opacity: 0.85;
      font-style: italic;
    }
    .document-info {
      text-align: ${isRTL ? 'left' : 'right'};
    }
    .document-title {
      font-size: 16px;
      font-weight: bold;
      border-bottom: 2px solid rgba(255,255,255,0.5);
      padding-bottom: 5px;
      margin-bottom: 5px;
    }
    .document-date, .document-number {
      font-size: 11px;
      opacity: 0.9;
    }
    .header-decoration {
      height: 4px;
      background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
      margin-top: 15px;
      border-radius: 2px;
    }

    /* Content Area */
    .document-content {
      padding: 30px 40px;
      min-height: 400px;
    }
    .content-section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 18px;
      background: #3b82f6;
      border-radius: 2px;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-grid.three-cols {
      grid-template-columns: repeat(3, 1fr);
    }
    .info-item {
      padding: 10px;
    }
    .info-item label {
      display: block;
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .info-item span {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin: 15px 0;
    }
    .data-table th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: ${isRTL ? 'right' : 'left'};
      font-weight: 600;
      color: #475569;
      font-size: 10px;
      text-transform: uppercase;
      border: 1px solid #e2e8f0;
    }
    .data-table td {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
    }
    .data-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .data-table .center {
      text-align: center;
    }

    /* Official Footer Styles */
    .official-footer {
      background: #f8fafc;
      padding: 25px 40px;
      border-top: 3px solid #3b82f6;
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
    }
    .stamp-section, .signature-section, .qr-section {
      text-align: center;
    }
    .stamp-circle {
      width: 80px;
      height: 80px;
      border: 2px dashed #94a3b8;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 9px;
      margin: 0 auto 8px;
    }
    .stamp-label, .signature-label, .qr-label {
      font-size: 10px;
      color: #64748b;
    }
    .signature-line {
      width: 150px;
      border-bottom: 1px solid #1e293b;
      margin: 0 auto 8px;
      height: 40px;
    }
    .qr-placeholder {
      width: 60px;
      height: 60px;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: #64748b;
      margin: 0 auto 8px;
      border-radius: 4px;
    }
    .footer-info {
      text-align: center;
      font-size: 10px;
      color: #64748b;
      padding: 10px 0;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .footer-info p {
      margin: 3px 0;
    }
    .footer-note {
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
      margin-top: 15px;
      font-style: italic;
    }

    /* Print Styles */
    @media print {
      body { background: white; }
      .document-container { box-shadow: none; }
      @page { size: A4; margin: 0; }
    }
  `;
};

/**
 * Generate Complete PDF Document
 */
export const generateUniversityDocument = (
  documentTitle: string,
  documentTitleAr: string,
  content: string,
  lang: 'en' | 'ar' = 'en'
): void => {
  const isRTL = lang === 'ar';

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>${isRTL ? documentTitleAr : documentTitle}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>${getUniversityDocumentStyles(lang)}</style>
    </head>
    <body>
      <div class="document-container">
        ${generateUniversityHeader(documentTitle, documentTitleAr, lang)}
        <div class="document-content">
          ${content}
        </div>
        ${generateUniversityFooter(lang)}
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

// ==========================================
// DOCUMENT TYPE GENERATORS
// ==========================================

/**
 * Generate Enrollment Certificate
 */
export const generateEnrollmentCertificate = (
  student: {
    name: string;
    nameAr?: string;
    studentId: string;
    major: string;
    majorAr?: string;
    level: number;
    semester: string;
  },
  lang: 'en' | 'ar' = 'en'
): void => {
  const isRTL = lang === 'ar';

  const content = `
    <div class="content-section">
      <h3 class="section-title">${isRTL ? 'شهادة قيد وانتساب' : 'Enrollment Certificate'}</h3>
      <div style="text-align: center; padding: 30px 0;">
        <p style="font-size: 14px; line-height: 2; max-width: 600px; margin: 0 auto;">
          ${isRTL
            ? `نشهد بأن الطالب/ة <strong>${student.nameAr || student.name}</strong> والذي يحمل الرقم الجامعي <strong>${student.studentId}</strong> مقيد لدينا في الفصل الدراسي <strong>${student.semester}</strong> في تخصص <strong>${student.majorAr || student.major}</strong> - المستوى <strong>${student.level}</strong>.`
            : `This is to certify that <strong>${student.name}</strong>, Student ID: <strong>${student.studentId}</strong>, is currently enrolled for the <strong>${student.semester}</strong> semester in the <strong>${student.major}</strong> program - Level <strong>${student.level}</strong>.`
          }
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
          ${isRTL
            ? 'وقد أعطيت له/ها هذه الشهادة بناءً على طلبه/ها دون أدنى مسؤولية على الجامعة.'
            : 'This certificate is issued upon request without any liability on the university.'
          }
        </p>
      </div>
    </div>
    <div class="content-section">
      <h3 class="section-title">${isRTL ? 'بيانات الطالب' : 'Student Information'}</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>${isRTL ? 'الاسم' : 'Name'}</label>
          <span>${isRTL && student.nameAr ? student.nameAr : student.name}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'الرقم الجامعي' : 'Student ID'}</label>
          <span>${student.studentId}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'التخصص' : 'Major'}</label>
          <span>${isRTL && student.majorAr ? student.majorAr : student.major}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'المستوى' : 'Level'}</label>
          <span>${student.level}</span>
        </div>
      </div>
    </div>
  `;

  generateUniversityDocument('Enrollment Certificate', 'شهادة قيد وانتساب', content, lang);
};

/**
 * Generate Letter to Whom It May Concern
 */
export const generateToWhomItMayConcernLetter = (
  student: {
    name: string;
    nameAr?: string;
    studentId: string;
    major: string;
    majorAr?: string;
    status: string;
  },
  purpose: string,
  purposeAr: string,
  lang: 'en' | 'ar' = 'en'
): void => {
  const isRTL = lang === 'ar';

  const content = `
    <div class="content-section">
      <h3 style="text-align: center; font-size: 16px; margin-bottom: 30px;">
        ${isRTL ? 'إلى من يهمه الأمر' : 'To Whom It May Concern'}
      </h3>
      <div style="padding: 20px 0; line-height: 2;">
        <p style="font-size: 14px;">
          ${isRTL
            ? `نفيد بأن الطالب/ة <strong>${student.nameAr || student.name}</strong> والذي يحمل الرقم الجامعي <strong>${student.studentId}</strong> هو طالب منتظم في جامعة فيرتكس، تخصص <strong>${student.majorAr || student.major}</strong>.`
            : `This is to confirm that <strong>${student.name}</strong>, Student ID: <strong>${student.studentId}</strong>, is a regular student at Vertex University, majoring in <strong>${student.major}</strong>.`
          }
        </p>
        <p style="font-size: 14px; margin-top: 15px;">
          ${isRTL
            ? `صدرت هذه الشهادة بناءً على طلب الطالب/ة لغرض: <strong>${purposeAr || purpose}</strong>.`
            : `This letter is issued at the student's request for the purpose of: <strong>${purpose}</strong>.`
          }
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
          ${isRTL
            ? 'وقد أعطيت هذه الشهادة دون أدنى مسؤولية على الجامعة.'
            : 'This certificate is issued without any liability on the university.'
          }
        </p>
      </div>
    </div>
  `;

  generateUniversityDocument('To Whom It May Concern', 'إلى من يهمه الأمر', content, lang);
};

/**
 * Generate Academic Standing Letter
 */
export const generateAcademicStandingLetter = (
  student: {
    name: string;
    nameAr?: string;
    studentId: string;
    major: string;
    majorAr?: string;
    gpa: number;
    completedCredits: number;
    totalCredits: number;
    academicStatus: string;
    academicStatusAr?: string;
  },
  lang: 'en' | 'ar' = 'en'
): void => {
  const isRTL = lang === 'ar';

  const content = `
    <div class="content-section">
      <h3 class="section-title">${isRTL ? 'بيانات الطالب' : 'Student Information'}</h3>
      <div class="info-grid three-cols">
        <div class="info-item">
          <label>${isRTL ? 'الاسم' : 'Name'}</label>
          <span>${isRTL && student.nameAr ? student.nameAr : student.name}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'الرقم الجامعي' : 'Student ID'}</label>
          <span>${student.studentId}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'التخصص' : 'Major'}</label>
          <span>${isRTL && student.majorAr ? student.majorAr : student.major}</span>
        </div>
      </div>
    </div>
    <div class="content-section">
      <h3 class="section-title">${isRTL ? 'الوضع الأكاديمي' : 'Academic Standing'}</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>${isRTL ? 'المعدل التراكمي' : 'Cumulative GPA'}</label>
          <span style="color: ${student.gpa >= 3.0 ? '#059669' : student.gpa >= 2.0 ? '#d97706' : '#dc2626'}; font-size: 18px;">
            ${student.gpa.toFixed(2)} / 4.00
          </span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'الحالة الأكاديمية' : 'Academic Status'}</label>
          <span style="color: #059669;">${isRTL && student.academicStatusAr ? student.academicStatusAr : student.academicStatus}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'الساعات المكتملة' : 'Completed Credits'}</label>
          <span>${student.completedCredits} / ${student.totalCredits}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'نسبة الإنجاز' : 'Progress'}</label>
          <span>${Math.round((student.completedCredits / student.totalCredits) * 100)}%</span>
        </div>
      </div>
    </div>
  `;

  generateUniversityDocument('Academic Standing Letter', 'خطاب الوضع الأكاديمي', content, lang);
};

/**
 * Generate Payment Receipt
 */
export const generatePaymentReceipt = (
  student: {
    name: string;
    nameAr?: string;
    studentId: string;
  },
  payment: {
    receiptNumber: string;
    date: string;
    amount: number;
    description: string;
    descriptionAr?: string;
    method: string;
  },
  lang: 'en' | 'ar' = 'en'
): void => {
  const isRTL = lang === 'ar';

  const content = `
    <div class="content-section">
      <h3 class="section-title">${isRTL ? 'بيانات الطالب' : 'Student Information'}</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>${isRTL ? 'الاسم' : 'Name'}</label>
          <span>${isRTL && student.nameAr ? student.nameAr : student.name}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'الرقم الجامعي' : 'Student ID'}</label>
          <span>${student.studentId}</span>
        </div>
      </div>
    </div>
    <div class="content-section">
      <h3 class="section-title">${isRTL ? 'تفاصيل الدفع' : 'Payment Details'}</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>${isRTL ? 'رقم الإيصال' : 'Receipt Number'}</label>
          <span>${payment.receiptNumber}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'التاريخ' : 'Date'}</label>
          <span>${payment.date}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'الوصف' : 'Description'}</label>
          <span>${isRTL && payment.descriptionAr ? payment.descriptionAr : payment.description}</span>
        </div>
        <div class="info-item">
          <label>${isRTL ? 'طريقة الدفع' : 'Payment Method'}</label>
          <span>${payment.method}</span>
        </div>
      </div>
      <div style="text-align: center; padding: 30px; background: #ecfdf5; border-radius: 8px; margin-top: 20px;">
        <p style="font-size: 12px; color: #64748b;">${isRTL ? 'المبلغ المدفوع' : 'Amount Paid'}</p>
        <p style="font-size: 32px; font-weight: bold; color: #059669;">${payment.amount.toLocaleString()} ${isRTL ? 'دولار' : 'USD'}</p>
      </div>
    </div>
  `;

  generateUniversityDocument('Payment Receipt', 'إيصال دفع', content, lang);
};

// ==========================================
// EXISTING FUNCTIONS (Updated)
// ==========================================

/**
 * Print the current page or specific element with university header
 */
export const printPage = (elementId?: string, title?: string, titleAr?: string, lang: 'en' | 'ar' = 'en'): void => {
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="${lang === 'ar' ? 'rtl' : 'ltr'}" lang="${lang}">
          <head>
            <meta charset="UTF-8">
            <title>${lang === 'ar' ? (titleAr || 'طباعة') : (title || 'Print')}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>${getUniversityDocumentStyles(lang)}</style>
          </head>
          <body>
            <div class="document-container">
              ${generateUniversityHeader(title || 'Document', titleAr || 'مستند', lang)}
              <div class="document-content">
                ${element.innerHTML}
              </div>
              ${generateUniversityFooter(lang)}
            </div>
            <script>window.onload = function() { window.print(); };</script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  } else {
    window.print();
  }
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string, headers?: string[]): void => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = [
    csvHeaders.join(','),
    ...data.map(row =>
      csvHeaders.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

/**
 * Generate and download a PDF-like report (HTML-based) with official university header
 * For proper PDF, you would need a library like jsPDF or html2pdf
 */
export const exportToPDF = (
  title: string,
  content: string,
  filename: string,
  lang: 'en' | 'ar' = 'en',
  titleAr?: string
): void => {
  const isRTL = lang === 'ar';
  const documentTitle = isRTL ? (titleAr || title) : title;

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>${documentTitle}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>${getUniversityDocumentStyles(lang)}</style>
    </head>
    <body>
      <div class="document-container">
        ${generateUniversityHeader(title, titleAr || title, lang)}
        <div class="document-content">
          ${content}
        </div>
        ${generateUniversityFooter(lang)}
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

/**
 * Download a file
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export schedule to iCal format
 */
export const exportToICal = (events: {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
}[], filename: string): void => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icalEvents = events.map(event => `
BEGIN:VEVENT
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
SUMMARY:${event.title}
LOCATION:${event.location || ''}
DESCRIPTION:${event.description || ''}
END:VEVENT`).join('\n');

  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Universe SIS//Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${icalEvents}
END:VCALENDAR`;

  downloadFile(icalContent, `${filename}.ics`, 'text/calendar');
};

/**
 * Format data for table display in PDF/Print
 */
export const formatTableHTML = (
  headers: string[],
  rows: any[][],
  lang: 'en' | 'ar' = 'en'
): string => {
  const headerHTML = headers.map(h => `<th>${h}</th>`).join('');
  const rowsHTML = rows.map(row =>
    `<tr>${row.map(cell => `<td>${cell ?? '-'}</td>`).join('')}</tr>`
  ).join('');

  return `
    <table>
      <thead><tr>${headerHTML}</tr></thead>
      <tbody>${rowsHTML}</tbody>
    </table>
  `;
};

/**
 * Send data via email (opens email client)
 */
export const sendViaEmail = (
  subject: string,
  body: string,
  recipient?: string
): void => {
  const mailtoLink = `mailto:${recipient || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
};

/**
 * Generate and download official university transcript/grade report
 */
export interface GradeRecord {
  code: string;
  title: string;
  semester: string;
  credits: number;
  grade: string;
  points: number;
}

export interface StudentInfo {
  name: string;
  nameAr?: string;
  studentId: string;
  major: string;
  majorAr?: string;
  level: number;
  gpa: number;
  totalCredits: number;
  completedCredits: number;
}

export const generateTranscriptPDF = (
  student: StudentInfo,
  grades: GradeRecord[],
  lang: 'en' | 'ar' = 'en'
): void => {
  const isRTL = lang === 'ar';
  const info = getUniversityInfo(); // Get branding settings
  const currentDate = new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Group grades by semester
  const gradesBySemester = grades.reduce((acc, grade) => {
    if (!acc[grade.semester]) {
      acc[grade.semester] = [];
    }
    acc[grade.semester].push(grade);
    return acc;
  }, {} as Record<string, GradeRecord[]>);

  // Calculate semester GPAs
  const semesterStats = Object.entries(gradesBySemester).map(([semester, semGrades]) => {
    const totalCredits = semGrades.reduce((sum, g) => sum + g.credits, 0);
    const totalPoints = semGrades.reduce((sum, g) => sum + (g.points * g.credits), 0);
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    return { semester, grades: semGrades, totalCredits, gpa };
  });

  // Generate semester tables
  const semesterTablesHTML = semesterStats.map(({ semester, grades: semGrades, totalCredits, gpa }) => `
    <div class="semester-section">
      <div class="semester-header">
        <h3>${semester}</h3>
        <div class="semester-stats">
          <span>${isRTL ? 'الساعات:' : 'Credits:'} ${totalCredits}</span>
          <span>${isRTL ? 'المعدل:' : 'GPA:'} ${gpa}</span>
        </div>
      </div>
      <table class="grades-table">
        <thead>
          <tr>
            <th>${isRTL ? 'رمز المقرر' : 'Code'}</th>
            <th>${isRTL ? 'اسم المقرر' : 'Course Name'}</th>
            <th>${isRTL ? 'الساعات' : 'Credits'}</th>
            <th>${isRTL ? 'الدرجة' : 'Grade'}</th>
            <th>${isRTL ? 'النقاط' : 'Points'}</th>
          </tr>
        </thead>
        <tbody>
          ${semGrades.map(g => `
            <tr>
              <td class="code">${g.code}</td>
              <td>${g.title}</td>
              <td class="center">${g.credits}</td>
              <td class="center grade-${g.grade.charAt(0).toLowerCase()}">${g.grade}</td>
              <td class="center">${g.points.toFixed(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>${isRTL ? 'كشف الدرجات الرسمي' : 'Official Transcript'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Cairo', 'Segoe UI', 'Arial', sans-serif;
          background: #f8fafc;
          color: #1e293b;
          direction: ${isRTL ? 'rtl' : 'ltr'};
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        /* Header */
        .header {
          background: linear-gradient(135deg, ${info.primaryColor} 0%, ${info.secondaryColor} 50%, ${info.primaryColor} 100%);
          color: white;
          padding: 30px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .university-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .university-logo {
          width: 70px;
          height: 70px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: ${info.primaryColor};
        }
        .university-logo img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .university-name h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .university-name p {
          font-size: 12px;
          opacity: 0.9;
        }
        .document-type {
          text-align: ${isRTL ? 'left' : 'right'};
        }
        .document-type h2 {
          font-size: 18px;
          border-bottom: 2px solid rgba(255,255,255,0.5);
          padding-bottom: 5px;
          margin-bottom: 5px;
        }
        .document-type .date {
          font-size: 12px;
          opacity: 0.9;
        }

        /* Student Info */
        .student-info {
          padding: 25px 40px;
          background: #f1f5f9;
          border-bottom: 3px solid ${info.secondaryColor};
        }
        .student-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .info-item label {
          display: block;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .info-item span {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        /* Summary Stats */
        .summary-stats {
          padding: 20px 40px;
          display: flex;
          justify-content: space-around;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }
        .stat-box {
          text-align: center;
          padding: 15px 25px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
        .stat-box.gpa {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: ${info.primaryColor};
        }
        .stat-box.gpa .stat-value {
          color: #059669;
        }
        .stat-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* Grades Section */
        .grades-section {
          padding: 30px 40px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid ${info.secondaryColor};
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-title::before {
          content: '';
          width: 4px;
          height: 20px;
          background: ${info.secondaryColor};
          border-radius: 2px;
        }

        .semester-section {
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .semester-header {
          background: #f8fafc;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        .semester-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: ${info.primaryColor};
        }
        .semester-stats {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #64748b;
        }
        .semester-stats span {
          background: white;
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .grades-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .grades-table th {
          background: #f8fafc;
          padding: 10px 12px;
          text-align: ${isRTL ? 'right' : 'left'};
          font-weight: 600;
          color: #475569;
          font-size: 11px;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }
        .grades-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .grades-table tr:last-child td {
          border-bottom: none;
        }
        .grades-table tr:hover {
          background: #f8fafc;
        }
        .grades-table .code {
          font-weight: 600;
          color: ${info.secondaryColor};
        }
        .grades-table .center {
          text-align: center;
        }
        .grades-table .grade-a {
          color: #059669;
          font-weight: bold;
        }
        .grades-table .grade-b {
          color: #3b82f6;
          font-weight: bold;
        }
        .grades-table .grade-c {
          color: #d97706;
          font-weight: bold;
        }
        .grades-table .grade-d {
          color: #ea580c;
          font-weight: bold;
        }
        .grades-table .grade-f {
          color: #dc2626;
          font-weight: bold;
        }

        /* Footer */
        .footer {
          padding: 25px 40px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .official-stamp {
          text-align: center;
        }
        .stamp-box {
          width: 100px;
          height: 100px;
          border: 2px dashed #94a3b8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 10px;
          margin-bottom: 8px;
        }
        .stamp-label {
          font-size: 10px;
          color: #64748b;
        }
        .signature-section {
          text-align: center;
        }
        .signature-line {
          width: 150px;
          border-bottom: 1px solid #1e293b;
          margin-bottom: 8px;
        }
        .signature-label {
          font-size: 10px;
          color: #64748b;
        }
        .footer-note {
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }

        /* Print Styles */
        @media print {
          body {
            background: white;
          }
          .container {
            box-shadow: none;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="university-info">
            <div class="university-logo">${info.logo ? `<img src="${info.logo}" alt="Logo" />` : info.name_en.substring(0, 2).toUpperCase()}</div>
            <div class="university-name">
              <h1>${isRTL ? info.name_ar : info.name_en}</h1>
              <p>${isRTL ? info.slogan_ar : info.slogan_en}</p>
            </div>
          </div>
          <div class="document-type">
            <h2>${isRTL ? 'كشف الدرجات الرسمي' : 'Official Transcript'}</h2>
            <p class="date">${currentDate}</p>
          </div>
        </div>

        <!-- Student Info -->
        <div class="student-info">
          <div class="student-info-grid">
            <div class="info-item">
              <label>${isRTL ? 'اسم الطالب' : 'Student Name'}</label>
              <span>${isRTL && student.nameAr ? student.nameAr : student.name}</span>
            </div>
            <div class="info-item">
              <label>${isRTL ? 'الرقم الجامعي' : 'Student ID'}</label>
              <span>${student.studentId}</span>
            </div>
            <div class="info-item">
              <label>${isRTL ? 'التخصص' : 'Major'}</label>
              <span>${isRTL && student.majorAr ? student.majorAr : student.major}</span>
            </div>
            <div class="info-item">
              <label>${isRTL ? 'المستوى' : 'Level'}</label>
              <span>${student.level}</span>
            </div>
            <div class="info-item">
              <label>${isRTL ? 'الساعات المكتملة' : 'Credits Completed'}</label>
              <span>${student.completedCredits} / ${student.totalCredits}</span>
            </div>
            <div class="info-item">
              <label>${isRTL ? 'الحالة الأكاديمية' : 'Academic Status'}</label>
              <span style="color: #059669;">${isRTL ? 'منتظم' : 'Active'}</span>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="summary-stats">
          <div class="stat-box gpa">
            <div class="stat-value">${student.gpa.toFixed(2)}</div>
            <div class="stat-label">${isRTL ? 'المعدل التراكمي' : 'Cumulative GPA'}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${student.completedCredits}</div>
            <div class="stat-label">${isRTL ? 'الساعات المكتسبة' : 'Credits Earned'}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${grades.length}</div>
            <div class="stat-label">${isRTL ? 'المقررات المكتملة' : 'Courses Completed'}</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${student.totalCredits - student.completedCredits}</div>
            <div class="stat-label">${isRTL ? 'الساعات المتبقية' : 'Credits Remaining'}</div>
          </div>
        </div>

        <!-- Grades Section -->
        <div class="grades-section">
          <h2 class="section-title">${isRTL ? 'السجل الأكاديمي التفصيلي' : 'Detailed Academic Record'}</h2>
          ${semesterTablesHTML}
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <div class="official-stamp">
              <div class="stamp-box">${isRTL ? 'الختم الرسمي' : 'Official Stamp'}</div>
              <div class="stamp-label">${isRTL ? 'ختم الجامعة' : 'University Seal'}</div>
            </div>
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-label">${isRTL ? 'توقيع المسجل' : 'Registrar Signature'}</div>
            </div>
          </div>
          <div class="footer-note">
            ${isRTL ? info.footerTextAr : info.footerText}
          </div>
          <div class="footer-contact" style="text-align: center; font-size: 10px; color: #64748b; margin-top: 10px;">
            ${info.phone} | ${info.email} | ${info.website}
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  // Create blob and open in new window for printing/saving
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');

  if (printWindow) {
    printWindow.onafterprint = () => {
      URL.revokeObjectURL(url);
    };
  }
};

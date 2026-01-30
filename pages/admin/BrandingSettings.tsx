import React, { useState, useEffect, useRef } from 'react';
import {
  Palette, Upload, Image, Eye, Save, RotateCcw, Check, AlertCircle,
  CreditCard, FileText, Building2, Globe, Mail, Phone, MapPin,
  Loader2, X, Settings, Paintbrush, Layout, QrCode, Barcode, DollarSign
} from 'lucide-react';
import { brandingAPI, BrandingSettings } from '../../api/branding';
import { useBranding } from '../../context/BrandingContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button, { IconButton } from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface BrandingSettingsPageProps {
  lang: 'en' | 'ar';
}

const t: Record<string, { en: string; ar: string }> = {
  pageTitle: { en: 'Branding Settings', ar: 'إعدادات العلامة التجارية' },
  pageSubtitle: { en: 'Customize university branding for ID cards, reports, and documents', ar: 'تخصيص العلامة التجارية للجامعة للبطاقات والتقارير والوثائق' },

  // Tabs
  generalTab: { en: 'General', ar: 'عام' },
  idCardTab: { en: 'ID Card', ar: 'البطاقة الجامعية' },
  reportsTab: { en: 'Reports & Documents', ar: 'التقارير والوثائق' },
  contactTab: { en: 'Contact Info', ar: 'معلومات الاتصال' },
  financeTab: { en: 'Finance', ar: 'المالية' },

  // General Settings
  universityInfo: { en: 'University Information', ar: 'معلومات الجامعة' },
  universityName: { en: 'University Name (English)', ar: 'اسم الجامعة (إنجليزي)' },
  universityNameAr: { en: 'University Name (Arabic)', ar: 'اسم الجامعة (عربي)' },
  universitySlogan: { en: 'Slogan (English)', ar: 'الشعار (إنجليزي)' },
  universitySloganAr: { en: 'Slogan (Arabic)', ar: 'الشعار (عربي)' },

  // Logos
  logos: { en: 'Logos', ar: 'الشعارات' },
  mainLogo: { en: 'Main Logo', ar: 'الشعار الرئيسي' },
  lightLogo: { en: 'Light Logo (for dark backgrounds)', ar: 'الشعار الفاتح (للخلفيات الداكنة)' },
  favicon: { en: 'Favicon', ar: 'أيقونة الموقع' },
  uploadLogo: { en: 'Upload Logo', ar: 'رفع الشعار' },
  removeLogo: { en: 'Remove', ar: 'إزالة' },
  logoHint: { en: 'Recommended: PNG with transparent background, 512x512px', ar: 'مُوصى به: PNG بخلفية شفافة، 512×512 بكسل' },

  // Colors
  colors: { en: 'Brand Colors', ar: 'ألوان العلامة التجارية' },
  primaryColor: { en: 'Primary Color', ar: 'اللون الرئيسي' },
  secondaryColor: { en: 'Secondary Color', ar: 'اللون الثانوي' },
  accentColor: { en: 'Accent Color', ar: 'لون التمييز' },

  // ID Card Settings
  idCardSettings: { en: 'ID Card Design', ar: 'تصميم البطاقة الجامعية' },
  idCardTemplate: { en: 'Card Template', ar: 'قالب البطاقة' },
  templateModern: { en: 'Modern', ar: 'عصري' },
  templateClassic: { en: 'Classic', ar: 'كلاسيكي' },
  templateMinimal: { en: 'Minimal', ar: 'بسيط' },
  templateCustom: { en: 'Custom Template', ar: 'قالب مخصص' },
  uploadFrontTemplate: { en: 'Upload Front Template', ar: 'رفع قالب الوجه الأمامي' },
  uploadBackTemplate: { en: 'Upload Back Template', ar: 'رفع قالب الوجه الخلفي' },
  frontTemplate: { en: 'Front Side', ar: 'الوجه الأمامي' },
  backTemplate: { en: 'Back Side', ar: 'الوجه الخلفي' },
  customTemplateHint: { en: 'Upload a blank card template (86mm × 54mm recommended)', ar: 'ارفع قالب بطاقة فارغ (يُنصح بـ 86مم × 54مم)' },
  fieldPositions: { en: 'Field Positions', ar: 'مواقع الحقول' },
  photoPosition: { en: 'Photo Position', ar: 'موقع الصورة' },
  namePosition: { en: 'Name Position', ar: 'موقع الاسم' },
  studentIdPosition: { en: 'Student ID Position', ar: 'موقع رقم الطالب' },
  downloadSampleTemplate: { en: 'Download Sample Template', ar: 'تحميل نموذج قالب' },
  idCardColors: { en: 'Card Colors', ar: 'ألوان البطاقة' },
  idCardPrimary: { en: 'Primary Color', ar: 'اللون الرئيسي' },
  idCardSecondary: { en: 'Secondary Color', ar: 'اللون الثانوي' },
  idCardText: { en: 'Text Color', ar: 'لون النص' },
  showQRCode: { en: 'Show QR Code', ar: 'إظهار رمز QR' },
  showBarcode: { en: 'Show Barcode', ar: 'إظهار الباركود' },
  previewIdCard: { en: 'Preview ID Card', ar: 'معاينة البطاقة' },

  // Report Settings
  reportSettings: { en: 'Report & Document Settings', ar: 'إعدادات التقارير والوثائق' },
  reportHeader: { en: 'Report Header Logo', ar: 'شعار ترويسة التقارير' },
  reportFooter: { en: 'Footer Text (English)', ar: 'نص التذييل (إنجليزي)' },
  reportFooterAr: { en: 'Footer Text (Arabic)', ar: 'نص التذييل (عربي)' },
  reportColors: { en: 'Report Colors', ar: 'ألوان التقارير' },
  showWatermark: { en: 'Show Watermark', ar: 'إظهار العلامة المائية' },
  previewReport: { en: 'Preview Report', ar: 'معاينة التقرير' },

  // Contact Info
  contactInfo: { en: 'Contact Information', ar: 'معلومات الاتصال' },
  address: { en: 'Address (English)', ar: 'العنوان (إنجليزي)' },
  addressAr: { en: 'Address (Arabic)', ar: 'العنوان (عربي)' },
  phone: { en: 'Phone', ar: 'الهاتف' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  website: { en: 'Website', ar: 'الموقع الإلكتروني' },

  // Currency Settings
  currencySettings: { en: 'Currency Settings', ar: 'إعدادات العملة' },
  currency: { en: 'Currency', ar: 'العملة' },
  currencySymbol: { en: 'Currency Symbol', ar: 'رمز العملة' },
  currencyPosition: { en: 'Symbol Position', ar: 'موضع الرمز' },
  currencyBefore: { en: 'Before amount ($100)', ar: 'قبل المبلغ ($100)' },
  currencyAfter: { en: 'After amount (100$)', ar: 'بعد المبلغ (100$)' },
  currencyPreview: { en: 'Preview', ar: 'معاينة' },

  // Actions
  save: { en: 'Save Changes', ar: 'حفظ التغييرات' },
  saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
  reset: { en: 'Reset to Defaults', ar: 'إعادة للافتراضي' },
  preview: { en: 'Preview', ar: 'معاينة' },
  saved: { en: 'Settings saved successfully', ar: 'تم حفظ الإعدادات بنجاح' },
  error: { en: 'Error saving settings', ar: 'خطأ في حفظ الإعدادات' },
  loading: { en: 'Loading settings...', ar: 'جاري تحميل الإعدادات...' },
};

const BrandingSettingsPage: React.FC<BrandingSettingsPageProps> = ({ lang }) => {
  const isRTL = lang === 'ar';
  const { refreshBranding } = useBranding();
  const [activeTab, setActiveTab] = useState<'general' | 'idcard' | 'reports' | 'contact' | 'finance'>('general');
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showIdCardPreview, setShowIdCardPreview] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const lightLogoInputRef = useRef<HTMLInputElement>(null);
  const reportLogoInputRef = useRef<HTMLInputElement>(null);
  const frontTemplateInputRef = useRef<HTMLInputElement>(null);
  const backTemplateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await brandingAPI.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading branding settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await brandingAPI.updateSettings(settings);
      // Refresh branding context so changes are reflected everywhere
      await refreshBranding();
      setMessage({ type: 'success', text: t.saved[lang] });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: t.error[lang] });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من إعادة الإعدادات للقيم الافتراضية؟' : 'Are you sure you want to reset to defaults?')) {
      const defaults = await brandingAPI.resetToDefaults();
      setSettings(defaults);
      // Refresh branding context so changes are reflected everywhere
      await refreshBranding();
      setMessage({ type: 'success', text: lang === 'ar' ? 'تمت إعادة الإعدادات' : 'Settings reset' });
    }
  };

  const handleLogoUpload = async (file: File, type: 'logo' | 'logoLight' | 'reportHeaderLogo') => {
    try {
      const base64 = await brandingAPI.uploadLogo(file, type);
      setSettings(prev => prev ? { ...prev, [type]: base64 } : prev);
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const handleTemplateUpload = async (file: File, type: 'idCardCustomTemplateFront' | 'idCardCustomTemplateBack') => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setSettings(prev => prev ? { ...prev, [type]: base64 } : prev);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading template:', error);
    }
  };

  const downloadSampleTemplate = () => {
    // Create a sample blank template
    const canvas = document.createElement('canvas');
    canvas.width = 1016; // 86mm at 300dpi
    canvas.height = 638; // 54mm at 300dpi
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header area
      ctx.fillStyle = '#0f2740';
      ctx.fillRect(0, 0, canvas.width, 120);

      // Guide lines (dashed)
      ctx.setLineDash([10, 5]);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;

      // Photo area guide
      ctx.strokeRect(40, 160, 240, 300);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(40, 160, 240, 300);

      // Text guides
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '24px Arial';
      ctx.fillText('← Photo Area', 300, 310);
      ctx.fillText('← Name / الاسم', 300, 200);
      ctx.fillText('← Student ID', 300, 250);
      ctx.fillText('← College', 300, 350);

      // QR code area
      ctx.strokeRect(40, 500, 120, 120);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(40, 500, 120, 120);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '18px Arial';
      ctx.fillText('QR', 80, 565);

      // Barcode area
      ctx.strokeRect(180, 540, 300, 60);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(180, 540, 300, 60);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('Barcode', 280, 575);

      // Header text placeholder
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('UNIVERSITY NAME', 350, 70);
      ctx.font = '24px Arial';
      ctx.fillText('اسم الجامعة', 500, 100);
    }

    // Download
    const link = document.createElement('a');
    link.download = 'id-card-template.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const updateSetting = (key: keyof BrandingSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ms-2 text-gray-600">{t.loading[lang]}</span>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: t.generalTab[lang], icon: Settings },
    { id: 'idcard', label: t.idCardTab[lang], icon: CreditCard },
    { id: 'reports', label: t.reportsTab[lang], icon: FileText },
    { id: 'contact', label: t.contactTab[lang], icon: Building2 },
    { id: 'finance', label: t.financeTab[lang], icon: DollarSign },
  ];

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-7 h-7 text-blue-600" />
            {t.pageTitle[lang]}
          </h1>
          <p className="text-gray-500 mt-1">{t.pageSubtitle[lang]}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            {t.reset[lang]}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t.saving[lang] : t.save[lang]}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              {/* University Info */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    {t.universityInfo[lang]}
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t.universityName[lang]}
                      value={settings.universityName}
                      onChange={(e) => updateSetting('universityName', e.target.value)}
                    />
                    <Input
                      label={t.universityNameAr[lang]}
                      value={settings.universityNameAr}
                      onChange={(e) => updateSetting('universityNameAr', e.target.value)}
                      dir="rtl"
                    />
                    <Input
                      label={t.universitySlogan[lang]}
                      value={settings.universitySlogan || ''}
                      onChange={(e) => updateSetting('universitySlogan', e.target.value)}
                    />
                    <Input
                      label={t.universitySloganAr[lang]}
                      value={settings.universitySloganAr || ''}
                      onChange={(e) => updateSetting('universitySloganAr', e.target.value)}
                      dir="rtl"
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Logos */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Image className="w-5 h-5 text-blue-600" />
                    {t.logos[lang]}
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Logo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.mainLogo[lang]}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {settings.logo ? (
                          <div className="relative inline-block">
                            <img src={settings.logo} alt="Logo" className="max-h-24 mx-auto" />
                            <button
                              onClick={() => updateSetting('logo', '')}
                              className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => logoInputRef.current?.click()}
                            className="cursor-pointer py-4"
                          >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">{t.uploadLogo[lang]}</p>
                          </div>
                        )}
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'logo')}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{t.logoHint[lang]}</p>
                    </div>

                    {/* Light Logo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.lightLogo[lang]}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-800">
                        {settings.logoLight ? (
                          <div className="relative inline-block">
                            <img src={settings.logoLight} alt="Light Logo" className="max-h-24 mx-auto" />
                            <button
                              onClick={() => updateSetting('logoLight', '')}
                              className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => lightLogoInputRef.current?.click()}
                            className="cursor-pointer py-4"
                          >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">{t.uploadLogo[lang]}</p>
                          </div>
                        )}
                        <input
                          ref={lightLogoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'logoLight')}
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Colors */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Paintbrush className="w-5 h-5 text-blue-600" />
                    {t.colors[lang]}
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.primaryColor[lang]}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.secondaryColor[lang]}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.accentColor[lang]}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.accentColor}
                          onChange={(e) => updateSetting('accentColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={settings.accentColor}
                          onChange={(e) => updateSetting('accentColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {/* ID Card Tab */}
          {activeTab === 'idcard' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Layout className="w-5 h-5 text-blue-600" />
                    {t.idCardSettings[lang]}
                  </h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t.idCardTemplate[lang]}
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                      {(['modern', 'classic', 'minimal', 'custom'] as const).map((template) => (
                        <button
                          key={template}
                          onClick={() => updateSetting('idCardTemplate', template)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            settings.idCardTemplate === template
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`h-16 rounded mb-2 flex items-center justify-center ${
                            template === 'modern' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                            template === 'classic' ? 'bg-gradient-to-b from-gray-700 to-gray-900' :
                            template === 'minimal' ? 'bg-gray-100 border border-gray-300' :
                            'bg-gradient-to-br from-purple-500 to-pink-500'
                          }`}>
                            {template === 'custom' && <Upload className="w-6 h-6 text-white" />}
                          </div>
                          <span className="text-sm font-medium">
                            {template === 'modern' ? t.templateModern[lang] :
                             template === 'classic' ? t.templateClassic[lang] :
                             template === 'minimal' ? t.templateMinimal[lang] :
                             t.templateCustom[lang]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Template Upload - Only show when custom is selected */}
                  {settings.idCardTemplate === 'custom' && (
                    <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 bg-purple-50/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Upload className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-900">{t.templateCustom[lang]}</h4>
                      </div>
                      <p className="text-sm text-purple-700 mb-4">{t.customTemplateHint[lang]}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Front Template */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.frontTemplate[lang]}
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white">
                            {settings.idCardCustomTemplateFront ? (
                              <div className="relative">
                                <img
                                  src={settings.idCardCustomTemplateFront}
                                  alt="Front Template"
                                  className="max-h-40 mx-auto rounded shadow-sm"
                                />
                                <button
                                  onClick={() => updateSetting('idCardCustomTemplateFront', '')}
                                  className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => frontTemplateInputRef.current?.click()}
                                className="cursor-pointer py-6 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">{t.uploadFrontTemplate[lang]}</p>
                              </div>
                            )}
                            <input
                              ref={frontTemplateInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleTemplateUpload(e.target.files[0], 'idCardCustomTemplateFront')}
                            />
                          </div>
                        </div>

                        {/* Back Template */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.backTemplate[lang]}
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white">
                            {settings.idCardCustomTemplateBack ? (
                              <div className="relative">
                                <img
                                  src={settings.idCardCustomTemplateBack}
                                  alt="Back Template"
                                  className="max-h-40 mx-auto rounded shadow-sm"
                                />
                                <button
                                  onClick={() => updateSetting('idCardCustomTemplateBack', '')}
                                  className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => backTemplateInputRef.current?.click()}
                                className="cursor-pointer py-6 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">{t.uploadBackTemplate[lang]}</p>
                              </div>
                            )}
                            <input
                              ref={backTemplateInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleTemplateUpload(e.target.files[0], 'idCardCustomTemplateBack')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Download Sample Template */}
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadSampleTemplate}
                          className="text-purple-700 border-purple-300 hover:bg-purple-100"
                        >
                          <FileText className="w-4 h-4" />
                          {t.downloadSampleTemplate[lang]}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t.idCardColors[lang]}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.idCardPrimary[lang]}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.idCardPrimaryColor}
                            onChange={(e) => updateSetting('idCardPrimaryColor', e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.idCardPrimaryColor}
                            onChange={(e) => updateSetting('idCardPrimaryColor', e.target.value)}
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.idCardSecondary[lang]}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.idCardSecondaryColor}
                            onChange={(e) => updateSetting('idCardSecondaryColor', e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.idCardSecondaryColor}
                            onChange={(e) => updateSetting('idCardSecondaryColor', e.target.value)}
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.idCardText[lang]}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.idCardTextColor}
                            onChange={(e) => updateSetting('idCardTextColor', e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.idCardTextColor}
                            onChange={(e) => updateSetting('idCardTextColor', e.target.value)}
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showQRCode}
                        onChange={(e) => updateSetting('showQRCode', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <QrCode className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{t.showQRCode[lang]}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showBarcode}
                        onChange={(e) => updateSetting('showBarcode', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Barcode className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{t.showBarcode[lang]}</span>
                    </label>
                  </div>

                  <Button variant="outline" onClick={() => setShowIdCardPreview(true)}>
                    <Eye className="w-4 h-4" />
                    {t.previewIdCard[lang]}
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {t.reportSettings[lang]}
                  </h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Report Header Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.reportHeader[lang]}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {settings.reportHeaderLogo ? (
                        <div className="relative inline-block">
                          <img src={settings.reportHeaderLogo} alt="Report Header" className="max-h-20 mx-auto" />
                          <button
                            onClick={() => updateSetting('reportHeaderLogo', '')}
                            className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => reportLogoInputRef.current?.click()}
                          className="cursor-pointer py-4"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">{t.uploadLogo[lang]}</p>
                        </div>
                      )}
                      <input
                        ref={reportLogoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'reportHeaderLogo')}
                      />
                    </div>
                  </div>

                  {/* Footer Text */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea
                      label={t.reportFooter[lang]}
                      value={settings.reportFooterText || ''}
                      onChange={(e) => updateSetting('reportFooterText', e.target.value)}
                      rows={2}
                    />
                    <Textarea
                      label={t.reportFooterAr[lang]}
                      value={settings.reportFooterTextAr || ''}
                      onChange={(e) => updateSetting('reportFooterTextAr', e.target.value)}
                      rows={2}
                      dir="rtl"
                    />
                  </div>

                  {/* Report Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t.reportColors[lang]}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.primaryColor[lang]}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.reportPrimaryColor}
                            onChange={(e) => updateSetting('reportPrimaryColor', e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.reportPrimaryColor}
                            onChange={(e) => updateSetting('reportPrimaryColor', e.target.value)}
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t.secondaryColor[lang]}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.reportSecondaryColor}
                            onChange={(e) => updateSetting('reportSecondaryColor', e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer"
                          />
                          <Input
                            value={settings.reportSecondaryColor}
                            onChange={(e) => updateSetting('reportSecondaryColor', e.target.value)}
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Watermark */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showReportWatermark}
                      onChange={(e) => updateSetting('showReportWatermark', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">{t.showWatermark[lang]}</span>
                  </label>

                  <Button variant="outline" onClick={() => setShowReportPreview(true)}>
                    <Eye className="w-4 h-4" />
                    {t.previewReport[lang]}
                  </Button>
                </CardBody>
              </Card>
            </>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  {t.contactInfo[lang]}
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label={t.address[lang]}
                    value={settings.universityAddress || ''}
                    onChange={(e) => updateSetting('universityAddress', e.target.value)}
                    rows={2}
                  />
                  <Textarea
                    label={t.addressAr[lang]}
                    value={settings.universityAddressAr || ''}
                    onChange={(e) => updateSetting('universityAddressAr', e.target.value)}
                    rows={2}
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t.phone[lang]}
                    value={settings.universityPhone || ''}
                    onChange={(e) => updateSetting('universityPhone', e.target.value)}
                    icon={Phone}
                  />
                  <Input
                    label={t.email[lang]}
                    value={settings.universityEmail || ''}
                    onChange={(e) => updateSetting('universityEmail', e.target.value)}
                    icon={Mail}
                  />
                  <Input
                    label={t.website[lang]}
                    value={settings.universityWebsite || ''}
                    onChange={(e) => updateSetting('universityWebsite', e.target.value)}
                    icon={Globe}
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  {t.currencySettings[lang]}
                </h3>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Currency Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.currency[lang]}
                    </label>
                    <select
                      value={settings.currency || 'USD'}
                      onChange={(e) => {
                        const currency = e.target.value;
                        const currencyData: Record<string, { symbol: string; position: 'before' | 'after' }> = {
                          'USD': { symbol: '$', position: 'before' },
                          'EUR': { symbol: '€', position: 'before' },
                          'GBP': { symbol: '£', position: 'before' },
                          'SAR': { symbol: 'ر.س', position: 'after' },
                          'AED': { symbol: 'د.إ', position: 'after' },
                          'KWD': { symbol: 'د.ك', position: 'after' },
                          'QAR': { symbol: 'ر.ق', position: 'after' },
                          'BHD': { symbol: 'د.ب', position: 'after' },
                          'OMR': { symbol: 'ر.ع', position: 'after' },
                          'EGP': { symbol: 'ج.م', position: 'after' },
                          'JOD': { symbol: 'د.أ', position: 'after' },
                          'LBP': { symbol: 'ل.ل', position: 'after' },
                          'TRY': { symbol: '₺', position: 'after' },
                          'INR': { symbol: '₹', position: 'before' },
                          'CNY': { symbol: '¥', position: 'before' },
                          'JPY': { symbol: '¥', position: 'before' },
                        };
                        const data = currencyData[currency] || { symbol: currency, position: 'before' };
                        updateSetting('currency', currency);
                        updateSetting('currencySymbol', data.symbol);
                        updateSetting('currencyPosition', data.position);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <optgroup label={lang === 'ar' ? 'العملات الرئيسية' : 'Major Currencies'}>
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                      </optgroup>
                      <optgroup label={lang === 'ar' ? 'عملات الخليج' : 'Gulf Currencies'}>
                        <option value="SAR">SAR - Saudi Riyal (ر.س)</option>
                        <option value="AED">AED - UAE Dirham (د.إ)</option>
                        <option value="KWD">KWD - Kuwaiti Dinar (د.ك)</option>
                        <option value="QAR">QAR - Qatari Riyal (ر.ق)</option>
                        <option value="BHD">BHD - Bahraini Dinar (د.ب)</option>
                        <option value="OMR">OMR - Omani Rial (ر.ع)</option>
                      </optgroup>
                      <optgroup label={lang === 'ar' ? 'عملات عربية أخرى' : 'Other Arab Currencies'}>
                        <option value="EGP">EGP - Egyptian Pound (ج.م)</option>
                        <option value="JOD">JOD - Jordanian Dinar (د.أ)</option>
                        <option value="LBP">LBP - Lebanese Pound (ل.ل)</option>
                      </optgroup>
                      <optgroup label={lang === 'ar' ? 'عملات أخرى' : 'Other Currencies'}>
                        <option value="TRY">TRY - Turkish Lira (₺)</option>
                        <option value="INR">INR - Indian Rupee (₹)</option>
                        <option value="CNY">CNY - Chinese Yuan (¥)</option>
                        <option value="JPY">JPY - Japanese Yen (¥)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.currencySymbol[lang]}
                    </label>
                    <Input
                      value={settings.currencySymbol || '$'}
                      onChange={(e) => updateSetting('currencySymbol', e.target.value)}
                      placeholder="$"
                    />
                  </div>
                </div>

                {/* Symbol Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t.currencyPosition[lang]}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="currencyPosition"
                        value="before"
                        checked={settings.currencyPosition === 'before'}
                        onChange={(e) => updateSetting('currencyPosition', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{t.currencyBefore[lang]}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="currencyPosition"
                        value="after"
                        checked={settings.currencyPosition === 'after'}
                        onChange={(e) => updateSetting('currencyPosition', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{t.currencyAfter[lang]}</span>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.currencyPreview[lang]}
                  </label>
                  <div className="flex items-center gap-4 text-lg font-semibold text-gray-800">
                    <span>1,000.00 → </span>
                    <span className="text-green-600">
                      {settings.currencyPosition === 'before'
                        ? `${settings.currencySymbol || '$'}1,000.00`
                        : `1,000.00 ${settings.currencySymbol || '$'}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-lg font-semibold text-gray-800 mt-2">
                    <span>-500.00 → </span>
                    <span className="text-red-600">
                      {settings.currencyPosition === 'before'
                        ? `${settings.currencySymbol || '$'}500.00`
                        : `500.00 ${settings.currencySymbol || '$'}`
                      }
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  {t.preview[lang]}
                </h3>
              </CardHeader>
              <CardBody>
                {/* Color Preview */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: settings.accentColor }}
                    />
                  </div>

                  {/* Logo Preview */}
                  {settings.logo && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <img src={settings.logo} alt="Logo" className="max-h-16 mx-auto" />
                    </div>
                  )}

                  {/* Mini ID Card Preview */}
                  <div
                    className="rounded-lg p-3 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${settings.idCardPrimaryColor}, ${settings.idCardSecondaryColor})`
                    }}
                  >
                    <div className="text-xs opacity-80">{settings.universityNameAr}</div>
                    <div className="text-sm font-bold">{settings.universityName}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-8 h-10 bg-white/20 rounded" />
                      <div>
                        <div className="text-xs opacity-80">Student ID</div>
                        <div className="text-sm font-medium">2024-001</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* ID Card Preview Modal */}
      <Modal
        isOpen={showIdCardPreview}
        onClose={() => setShowIdCardPreview(false)}
        title={t.previewIdCard[lang]}
        size="lg"
      >
        <div className="p-4">
          <IDCardPreview settings={settings} lang={lang} />
        </div>
      </Modal>

      {/* Report Preview Modal */}
      <Modal
        isOpen={showReportPreview}
        onClose={() => setShowReportPreview(false)}
        title={t.previewReport[lang]}
        size="lg"
      >
        <div className="p-4">
          <ReportPreview settings={settings} lang={lang} />
        </div>
      </Modal>
    </div>
  );
};

// ID Card Preview Component
const IDCardPreview: React.FC<{ settings: BrandingSettings; lang: 'en' | 'ar' }> = ({ settings, lang }) => {
  const [showBack, setShowBack] = useState(false);

  // Custom template view
  if (settings.idCardTemplate === 'custom') {
    const templateImage = showBack ? settings.idCardCustomTemplateBack : settings.idCardCustomTemplateFront;

    return (
      <div className="space-y-4">
        {/* Toggle Front/Back */}
        {(settings.idCardCustomTemplateFront || settings.idCardCustomTemplateBack) && (
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setShowBack(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showBack ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang === 'ar' ? 'الوجه الأمامي' : 'Front'}
            </button>
            <button
              onClick={() => setShowBack(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showBack ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang === 'ar' ? 'الوجه الخلفي' : 'Back'}
            </button>
          </div>
        )}

        <div className="flex justify-center">
          <div className="w-[340px] h-[215px] rounded-xl overflow-hidden shadow-xl relative bg-gray-100">
            {templateImage ? (
              <>
                {/* Custom Template Background */}
                <img
                  src={templateImage}
                  alt="ID Card Template"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay Content (only on front) */}
                {!showBack && (
                  <div className="absolute inset-0 p-3">
                    {/* Sample overlay - Photo area */}
                    <div
                      className="absolute bg-white/80 rounded-lg flex items-center justify-center border-2 border-white/50"
                      style={{
                        left: '6%',
                        top: '30%',
                        width: '24%',
                        height: '47%',
                      }}
                    >
                      <span className="text-3xl">👤</span>
                    </div>
                    {/* Sample overlay - Name */}
                    <div
                      className="absolute text-white drop-shadow-md"
                      style={{ left: '35%', top: '30%' }}
                    >
                      <div className="text-sm font-bold">أحمد محمد المنصور</div>
                      <div className="text-xs opacity-90">Ahmed M. Al-Mansour</div>
                    </div>
                    {/* Sample overlay - ID */}
                    <div
                      className="absolute text-white drop-shadow-md text-xs"
                      style={{ left: '35%', top: '52%' }}
                    >
                      <span className="opacity-70">ID: </span>
                      <span className="font-medium">STU-2024-001</span>
                    </div>
                    {/* QR Code */}
                    {settings.showQRCode && (
                      <div
                        className="absolute bg-white rounded p-1"
                        style={{ left: '6%', bottom: '8%', width: '48px', height: '48px' }}
                      >
                        <div className="w-full h-full bg-gray-200 rounded grid grid-cols-4 gap-0.5">
                          {[...Array(16)].map((_, i) => (
                            <div key={i} className={`${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'}`} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Image className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">{lang === 'ar' ? 'لم يتم رفع قالب' : 'No template uploaded'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default templates (modern, classic, minimal)
  return (
    <div className="flex justify-center">
      <div
        className="w-[340px] h-[215px] rounded-xl overflow-hidden shadow-xl relative"
        style={{
          background: settings.idCardTemplate === 'minimal'
            ? '#f8fafc'
            : `linear-gradient(135deg, ${settings.idCardPrimaryColor}, ${settings.idCardSecondaryColor})`
        }}
      >
        {/* Header */}
        <div className="p-3 flex items-center justify-between">
          {settings.logo || settings.logoLight ? (
            <img
              src={settings.idCardTemplate === 'minimal' ? settings.logo : (settings.logoLight || settings.logo)}
              alt="Logo"
              className="h-10 object-contain"
            />
          ) : (
            <div className="text-xs" style={{ color: settings.idCardTemplate === 'minimal' ? settings.idCardPrimaryColor : settings.idCardTextColor }}>
              {lang === 'ar' ? settings.universityNameAr : settings.universityName}
            </div>
          )}
          <div className="text-end" style={{ color: settings.idCardTemplate === 'minimal' ? settings.idCardPrimaryColor : settings.idCardTextColor }}>
            <div className="text-[10px] opacity-80">{settings.universityNameAr}</div>
            <div className="text-xs font-semibold">{settings.universityName}</div>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 flex gap-3">
          {/* Photo */}
          <div className="w-20 h-24 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30">
            <span className="text-2xl" style={{ color: settings.idCardTemplate === 'minimal' ? '#64748b' : 'rgba(255,255,255,0.5)' }}>
              👤
            </span>
          </div>
          {/* Info */}
          <div className="flex-1" style={{ color: settings.idCardTemplate === 'minimal' ? '#1e293b' : settings.idCardTextColor }}>
            <div className="text-sm font-bold">أحمد محمد المنصور</div>
            <div className="text-xs opacity-80">Ahmed M. Al-Mansour</div>
            <div className="mt-2 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="opacity-70">ID:</span>
                <span className="font-medium">STU-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">College:</span>
                <span className="font-medium">Computer Science</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Valid:</span>
                <span className="font-medium">2024-2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with QR/Barcode */}
        <div className="absolute bottom-0 start-0 end-0 p-2 flex justify-between items-end bg-black/10">
          {settings.showQRCode && (
            <div className="w-12 h-12 bg-white rounded p-1">
              <div className="w-full h-full bg-gray-200 rounded grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'}`} />
                ))}
              </div>
            </div>
          )}
          {settings.showBarcode && (
            <div className="flex-1 mx-2 h-8 flex items-end justify-center gap-px">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800"
                  style={{ width: Math.random() > 0.5 ? '2px' : '1px', height: `${16 + Math.random() * 12}px` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Report Preview Component
const ReportPreview: React.FC<{ settings: BrandingSettings; lang: 'en' | 'ar' }> = ({ settings, lang }) => {
  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="p-4 text-white"
        style={{ backgroundColor: settings.reportPrimaryColor }}
      >
        <div className="flex items-center justify-between">
          {settings.reportHeaderLogo ? (
            <img src={settings.reportHeaderLogo} alt="Header Logo" className="h-12 object-contain" />
          ) : settings.logo ? (
            <img src={settings.logoLight || settings.logo} alt="Logo" className="h-12 object-contain brightness-0 invert" />
          ) : (
            <div className="font-bold">{settings.universityName}</div>
          )}
          <div className="text-end">
            <div className="text-sm">{settings.universityNameAr}</div>
            <div className="text-lg font-bold">{settings.universityName}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 min-h-[200px] relative">
        {/* Watermark */}
        {settings.showReportWatermark && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-5 text-6xl font-bold pointer-events-none"
            style={{ color: settings.reportPrimaryColor }}
          >
            {settings.universityName}
          </div>
        )}

        <h2 className="text-lg font-bold text-center mb-4" style={{ color: settings.reportPrimaryColor }}>
          {lang === 'ar' ? 'السجل الأكاديمي' : 'Academic Transcript'}
        </h2>

        {/* Sample Content */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between border-b pb-1">
            <span>{lang === 'ar' ? 'اسم الطالب:' : 'Student Name:'}</span>
            <span className="font-medium">Ahmed Al-Mansour</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span>{lang === 'ar' ? 'رقم الطالب:' : 'Student ID:'}</span>
            <span className="font-medium">STU-2024-001</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span>{lang === 'ar' ? 'المعدل التراكمي:' : 'GPA:'}</span>
            <span className="font-medium">3.75</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-3 text-center text-xs"
        style={{ backgroundColor: settings.reportSecondaryColor, color: 'white' }}
      >
        {lang === 'ar' ? settings.reportFooterTextAr : settings.reportFooterText}
        <div className="mt-1 opacity-80">
          {settings.universityPhone} | {settings.universityEmail}
        </div>
      </div>
    </div>
  );
};

export default BrandingSettingsPage;

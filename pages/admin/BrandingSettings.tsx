import React, { useState, useEffect, useRef } from 'react';
import {
  Palette, Upload, Image, Eye, Save, RotateCcw, Check, AlertCircle,
  CreditCard, FileText, Building2, Globe, Mail, Phone, MapPin,
  Loader2, X, Settings, Paintbrush, Layout, QrCode, Barcode
} from 'lucide-react';
import { brandingAPI, BrandingSettings } from '../../api/branding';
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
  const [activeTab, setActiveTab] = useState<'general' | 'idcard' | 'reports' | 'contact'>('general');
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showIdCardPreview, setShowIdCardPreview] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const lightLogoInputRef = useRef<HTMLInputElement>(null);
  const reportLogoInputRef = useRef<HTMLInputElement>(null);

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

  const updateSetting = (key: keyof BrandingSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t.loading[lang]}</span>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: t.generalTab[lang], icon: Settings },
    { id: 'idcard', label: t.idCardTab[lang], icon: CreditCard },
    { id: 'reports', label: t.reportsTab[lang], icon: FileText },
    { id: 'contact', label: t.contactTab[lang], icon: Building2 },
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
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
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
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
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
                    <div className="grid grid-cols-3 gap-4">
                      {(['modern', 'classic', 'minimal'] as const).map((template) => (
                        <button
                          key={template}
                          onClick={() => updateSetting('idCardTemplate', template)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            settings.idCardTemplate === template
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`h-16 rounded mb-2 ${
                            template === 'modern' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                            template === 'classic' ? 'bg-gradient-to-b from-gray-700 to-gray-900' :
                            'bg-gray-100 border border-gray-300'
                          }`} />
                          <span className="text-sm font-medium">
                            {template === 'modern' ? t.templateModern[lang] :
                             template === 'classic' ? t.templateClassic[lang] :
                             t.templateMinimal[lang]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

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
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
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
                    icon={<Phone className="w-4 h-4" />}
                  />
                  <Input
                    label={t.email[lang]}
                    value={settings.universityEmail || ''}
                    onChange={(e) => updateSetting('universityEmail', e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                  />
                  <Input
                    label={t.website[lang]}
                    value={settings.universityWebsite || ''}
                    onChange={(e) => updateSetting('universityWebsite', e.target.value)}
                    icon={<Globe className="w-4 h-4" />}
                  />
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
          <div className="text-right" style={{ color: settings.idCardTemplate === 'minimal' ? settings.idCardPrimaryColor : settings.idCardTextColor }}>
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
        <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end bg-black/10">
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
          <div className="text-right">
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

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  Globe,
  Bell,
  Shield,
  Mail,
  Database,
  Save,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Upload,
  Image,
} from 'lucide-react';
import * as configApi from '../../api/admin/config';
import type { SystemSetting, UiTheme } from '../../api/admin/config';

interface SystemSettingsProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'System Settings', ar: 'إعدادات النظام' },
  subtitle: { en: 'Configure system settings, themes, and preferences', ar: 'تكوين إعدادات النظام والثيمات والتفضيلات' },
  general: { en: 'General', ar: 'عام' },
  appearance: { en: 'Appearance', ar: 'المظهر' },
  email: { en: 'Email', ar: 'البريد' },
  security: { en: 'Security', ar: 'الأمان' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  database: { en: 'Database', ar: 'قاعدة البيانات' },
  save: { en: 'Save Changes', ar: 'حفظ التغييرات' },
  saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
  saved: { en: 'Changes saved successfully', ar: 'تم حفظ التغييرات بنجاح' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },

  // General settings
  siteName: { en: 'Site Name', ar: 'اسم الموقع' },
  siteDescription: { en: 'Site Description', ar: 'وصف الموقع' },
  supportEmail: { en: 'Support Email', ar: 'بريد الدعم' },
  supportPhone: { en: 'Support Phone', ar: 'هاتف الدعم' },
  timezone: { en: 'Timezone', ar: 'المنطقة الزمنية' },
  defaultLanguage: { en: 'Default Language', ar: 'اللغة الافتراضية' },
  dateFormat: { en: 'Date Format', ar: 'تنسيق التاريخ' },
  academicYear: { en: 'Current Academic Year', ar: 'السنة الأكاديمية الحالية' },
  semester: { en: 'Current Semester', ar: 'الفصل الحالي' },
  logo: { en: 'Logo', ar: 'الشعار' },
  favicon: { en: 'Favicon', ar: 'أيقونة الموقع' },

  // Theme settings
  themes: { en: 'Themes', ar: 'الثيمات' },
  addTheme: { en: 'Add Theme', ar: 'إضافة ثيم' },
  editTheme: { en: 'Edit Theme', ar: 'تعديل الثيم' },
  themeName: { en: 'Theme Name', ar: 'اسم الثيم' },
  themeCode: { en: 'Theme Code', ar: 'كود الثيم' },
  isDark: { en: 'Dark Theme', ar: 'ثيم داكن' },
  isDefault: { en: 'Default Theme', ar: 'الثيم الافتراضي' },
  colors: { en: 'Colors', ar: 'الألوان' },
  primary: { en: 'Primary', ar: 'الأساسي' },
  secondary: { en: 'Secondary', ar: 'الثانوي' },
  accent: { en: 'Accent', ar: 'التمييز' },
  background: { en: 'Background', ar: 'الخلفية' },
  surface: { en: 'Surface', ar: 'السطح' },
  text: { en: 'Text', ar: 'النص' },
  border: { en: 'Border', ar: 'الحدود' },
  success: { en: 'Success', ar: 'نجاح' },
  warning: { en: 'Warning', ar: 'تحذير' },
  errorColor: { en: 'Error', ar: 'خطأ' },
  info: { en: 'Info', ar: 'معلومات' },
  noThemes: { en: 'No themes found', ar: 'لا توجد ثيمات' },
  confirmDeleteTheme: { en: 'Are you sure you want to delete this theme?', ar: 'هل أنت متأكد من حذف هذا الثيم؟' },

  // Email settings
  smtpHost: { en: 'SMTP Host', ar: 'خادم SMTP' },
  smtpPort: { en: 'SMTP Port', ar: 'منفذ SMTP' },
  smtpUsername: { en: 'SMTP Username', ar: 'اسم مستخدم SMTP' },
  smtpPassword: { en: 'SMTP Password', ar: 'كلمة مرور SMTP' },
  smtpEncryption: { en: 'Encryption', ar: 'التشفير' },
  fromAddress: { en: 'From Address', ar: 'عنوان المرسل' },
  fromName: { en: 'From Name', ar: 'اسم المرسل' },

  // Security settings
  sessionTimeout: { en: 'Session Timeout (minutes)', ar: 'مهلة الجلسة (دقائق)' },
  maxLoginAttempts: { en: 'Max Login Attempts', ar: 'الحد الأقصى لمحاولات الدخول' },
  passwordMinLength: { en: 'Min Password Length', ar: 'الحد الأدنى لطول كلمة المرور' },
  requireStrongPassword: { en: 'Require Strong Password', ar: 'طلب كلمة مرور قوية' },
  enableTwoFactor: { en: 'Enable Two-Factor Auth', ar: 'تفعيل التحقق بخطوتين' },
  allowRememberMe: { en: 'Allow Remember Me', ar: 'السماح بتذكرني' },

  // Notification settings
  enableEmailNotifications: { en: 'Email Notifications', ar: 'إشعارات البريد' },
  enableSmsNotifications: { en: 'SMS Notifications', ar: 'إشعارات الرسائل' },
  enablePushNotifications: { en: 'Push Notifications', ar: 'الإشعارات الفورية' },
  notifyOnNewStudent: { en: 'Notify on New Student', ar: 'إشعار عند طالب جديد' },
  notifyOnPayment: { en: 'Notify on Payment', ar: 'إشعار عند الدفع' },
  notifyOnGrade: { en: 'Notify on Grade Posted', ar: 'إشعار عند نشر الدرجة' },

  // Database settings
  backupEnabled: { en: 'Auto Backup', ar: 'النسخ الاحتياطي التلقائي' },
  backupFrequency: { en: 'Backup Frequency', ar: 'تكرار النسخ الاحتياطي' },
  backupRetention: { en: 'Backup Retention (days)', ar: 'الاحتفاظ بالنسخ (أيام)' },
  lastBackup: { en: 'Last Backup', ar: 'آخر نسخة احتياطية' },

  // Values
  daily: { en: 'Daily', ar: 'يومي' },
  weekly: { en: 'Weekly', ar: 'أسبوعي' },
  monthly: { en: 'Monthly', ar: 'شهري' },
  english: { en: 'English', ar: 'الإنجليزية' },
  arabic: { en: 'Arabic', ar: 'العربية' },
  none: { en: 'None', ar: 'بدون' },
  tls: { en: 'TLS', ar: 'TLS' },
  ssl: { en: 'SSL', ar: 'SSL' },

  cancel: { en: 'Cancel', ar: 'إلغاء' },
  active: { en: 'Active', ar: 'نشط' },
};

const settingsTabs = [
  { key: 'general', icon: Settings, label: t.general },
  { key: 'appearance', icon: Palette, label: t.appearance },
  { key: 'email', icon: Mail, label: t.email },
  { key: 'security', icon: Shield, label: t.security },
  { key: 'notifications', icon: Bell, label: t.notifications },
  { key: 'database', icon: Database, label: t.database },
];

const SystemSettings: React.FC<SystemSettingsProps> = ({ lang }) => {
  const isRTL = lang === 'ar';

  // State
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings state
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [themes, setThemes] = useState<UiTheme[]>([]);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [editingTheme, setEditingTheme] = useState<UiTheme | null>(null);
  const [themeFormData, setThemeFormData] = useState<Partial<UiTheme>>({});

  // Load settings
  useEffect(() => {
    loadSettings();
    loadThemes();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await configApi.getSettings();
      if (response.success) {
        // Flatten grouped settings
        const flatSettings: Record<string, any> = {};
        Object.values(response.data).forEach((group: any) => {
          if (Array.isArray(group)) {
            group.forEach((setting: SystemSetting) => {
              flatSettings[setting.key] = setting.value;
            });
          }
        });
        setSettings(flatSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThemes = async () => {
    try {
      const response = await configApi.getThemes();
      if (response.success) {
        setThemes(response.data);
      }
    } catch (error) {
      console.error('Error loading themes:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await configApi.updateSettings(settings);
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Theme management
  const handleAddTheme = () => {
    setEditingTheme(null);
    setThemeFormData({
      code: '',
      name_en: '',
      name_ar: '',
      is_dark: false,
      is_default: false,
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#8B5CF6',
        background: '#FFFFFF',
        surface: '#F3F4F6',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6',
      },
    });
    setShowThemeEditor(true);
  };

  const handleEditTheme = (theme: UiTheme) => {
    setEditingTheme(theme);
    setThemeFormData({ ...theme });
    setShowThemeEditor(true);
  };

  const handleDeleteTheme = async (theme: UiTheme) => {
    if (theme.is_default) {
      showMessage('error', lang === 'ar' ? 'لا يمكن حذف الثيم الافتراضي' : 'Cannot delete default theme');
      return;
    }
    if (!confirm(t.confirmDeleteTheme[lang])) return;

    try {
      await configApi.deleteTheme(theme.code);
      setThemes(prev => prev.filter(t => t.code !== theme.code));
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error deleting theme:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleSaveTheme = async () => {
    if (!themeFormData.code || !themeFormData.name_en || !themeFormData.name_ar) {
      showMessage('error', 'Please fill in required fields');
      return;
    }

    try {
      const response = await configApi.saveTheme(themeFormData);
      if (response.success) {
        if (editingTheme) {
          setThemes(prev => prev.map(t => t.code === editingTheme.code ? response.data : t));
        } else {
          setThemes(prev => [...prev, response.data]);
        }
        setShowThemeEditor(false);
        showMessage('success', t.saved[lang]);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const renderInput = (key: string, label: { en: string; ar: string }, type: 'text' | 'number' | 'password' | 'email' = 'text', placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label[lang]}
      </label>
      <input
        type={type}
        value={settings[key] || ''}
        onChange={(e) => updateSetting(key, type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
      />
    </div>
  );

  const renderToggle = (key: string, label: { en: string; ar: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label[lang]}</span>
      <button
        onClick={() => updateSetting(key, !settings[key])}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          settings[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
        }`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
          settings[key] ? (isRTL ? 'left-0.5' : 'left-5') : (isRTL ? 'left-5' : 'left-0.5')
        }`} />
      </button>
    </div>
  );

  const renderSelect = (key: string, label: { en: string; ar: string }, options: Array<{ value: string; label: { en: string; ar: string } }>) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label[lang]}
      </label>
      <select
        value={settings[key] || ''}
        onChange={(e) => updateSetting(key, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label[lang]}</option>
        ))}
      </select>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {renderInput('site_name_en', { en: 'Site Name (English)', ar: 'اسم الموقع (إنجليزي)' })}
        {renderInput('site_name_ar', { en: 'Site Name (Arabic)', ar: 'اسم الموقع (عربي)' })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderInput('site_description_en', { en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
        {renderInput('site_description_ar', { en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderInput('support_email', t.supportEmail, 'email')}
        {renderInput('support_phone', t.supportPhone, 'text')}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderSelect('default_language', t.defaultLanguage, [
          { value: 'en', label: t.english },
          { value: 'ar', label: t.arabic },
        ])}
        {renderSelect('timezone', t.timezone, [
          { value: 'UTC', label: { en: 'UTC', ar: 'UTC' } },
          { value: 'Asia/Riyadh', label: { en: 'Asia/Riyadh', ar: 'آسيا/الرياض' } },
          { value: 'Asia/Dubai', label: { en: 'Asia/Dubai', ar: 'آسيا/دبي' } },
          { value: 'Europe/London', label: { en: 'Europe/London', ar: 'أوروبا/لندن' } },
        ])}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderInput('academic_year', t.academicYear, 'text', '2024-2025')}
        {renderSelect('current_semester', t.semester, [
          { value: 'fall', label: { en: 'Fall', ar: 'الخريف' } },
          { value: 'spring', label: { en: 'Spring', ar: 'الربيع' } },
          { value: 'summer', label: { en: 'Summer', ar: 'الصيف' } },
        ])}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.logo[lang]}
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {lang === 'ar' ? 'رفع شعار' : 'Upload Logo'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.favicon[lang]}
          </label>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              {settings.favicon ? (
                <img src={settings.favicon} alt="Favicon" className="w-full h-full object-contain" />
              ) : (
                <Image className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {lang === 'ar' ? 'رفع أيقونة' : 'Upload Favicon'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.themes[lang]}</h3>
        <button
          onClick={handleAddTheme}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addTheme[lang]}
        </button>
      </div>

      {themes.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noThemes[lang]}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.code}
              className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-600"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme.is_dark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                    {theme.is_dark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {lang === 'ar' ? theme.name_ar : theme.name_en}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono">{theme.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {theme.is_default && (
                    <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full">
                      {t.isDefault[lang]}
                    </span>
                  )}
                  <button
                    onClick={() => handleEditTheme(theme)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  {!theme.is_default && (
                    <button
                      onClick={() => handleDeleteTheme(theme)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Color preview */}
              <div className="flex gap-1">
                {Object.entries(theme.colors || {}).slice(0, 8).map(([key, value]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded-full border border-gray-200 dark:border-slate-600"
                    style={{ backgroundColor: value }}
                    title={key}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Theme Editor Modal */}
      {showThemeEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTheme ? t.editTheme[lang] : t.addTheme[lang]}
              </h2>
              <button onClick={() => setShowThemeEditor(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.themeCode[lang]}
                  </label>
                  <input
                    type="text"
                    value={themeFormData.code || ''}
                    onChange={(e) => setThemeFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 font-mono"
                    disabled={!!editingTheme}
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={themeFormData.is_dark ?? false}
                      onChange={(e) => setThemeFormData(prev => ({ ...prev, is_dark: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">{t.isDark[lang]}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={themeFormData.is_default ?? false}
                      onChange={(e) => setThemeFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">{t.isDefault[lang]}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.themeName[lang]} (EN)
                  </label>
                  <input
                    type="text"
                    value={themeFormData.name_en || ''}
                    onChange={(e) => setThemeFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.themeName[lang]} (AR)
                  </label>
                  <input
                    type="text"
                    value={themeFormData.name_ar || ''}
                    onChange={(e) => setThemeFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">{t.colors[lang]}</h4>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { key: 'primary', label: t.primary },
                    { key: 'secondary', label: t.secondary },
                    { key: 'accent', label: t.accent },
                    { key: 'background', label: t.background },
                    { key: 'surface', label: t.surface },
                    { key: 'text', label: t.text },
                    { key: 'border', label: t.border },
                    { key: 'success', label: t.success },
                    { key: 'warning', label: t.warning },
                    { key: 'error', label: t.errorColor },
                    { key: 'info', label: t.info },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{label[lang]}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(themeFormData.colors as any)?.[key] || '#000000'}
                          onChange={(e) => setThemeFormData(prev => ({
                            ...prev,
                            colors: { ...prev.colors, [key]: e.target.value } as any
                          }))}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={(themeFormData.colors as any)?.[key] || ''}
                          onChange={(e) => setThemeFormData(prev => ({
                            ...prev,
                            colors: { ...prev.colors, [key]: e.target.value } as any
                          }))}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowThemeEditor(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleSaveTheme}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEmailTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {renderInput('smtp_host', t.smtpHost, 'text', 'smtp.example.com')}
        {renderInput('smtp_port', t.smtpPort, 'number', '587')}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderInput('smtp_username', t.smtpUsername)}
        {renderInput('smtp_password', t.smtpPassword, 'password')}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderSelect('smtp_encryption', t.smtpEncryption, [
          { value: 'none', label: t.none },
          { value: 'tls', label: t.tls },
          { value: 'ssl', label: t.ssl },
        ])}
        {renderInput('from_address', t.fromAddress, 'email', 'noreply@university.edu')}
      </div>

      {renderInput('from_name', t.fromName, 'text', 'University SIS')}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {renderInput('session_timeout', t.sessionTimeout, 'number')}
        {renderInput('max_login_attempts', t.maxLoginAttempts, 'number')}
      </div>

      {renderInput('password_min_length', t.passwordMinLength, 'number')}

      <div className="grid grid-cols-2 gap-4">
        {renderToggle('require_strong_password', t.requireStrongPassword)}
        {renderToggle('enable_two_factor', t.enableTwoFactor)}
        {renderToggle('allow_remember_me', t.allowRememberMe)}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900 dark:text-white">{lang === 'ar' ? 'قنوات الإشعارات' : 'Notification Channels'}</h4>
      <div className="grid grid-cols-2 gap-4">
        {renderToggle('enable_email_notifications', t.enableEmailNotifications)}
        {renderToggle('enable_sms_notifications', t.enableSmsNotifications)}
        {renderToggle('enable_push_notifications', t.enablePushNotifications)}
      </div>

      <h4 className="font-medium text-gray-900 dark:text-white pt-4">{lang === 'ar' ? 'أحداث الإشعارات' : 'Notification Events'}</h4>
      <div className="grid grid-cols-2 gap-4">
        {renderToggle('notify_on_new_student', t.notifyOnNewStudent)}
        {renderToggle('notify_on_payment', t.notifyOnPayment)}
        {renderToggle('notify_on_grade', t.notifyOnGrade)}
      </div>
    </div>
  );

  const renderDatabaseTab = () => (
    <div className="space-y-6">
      {renderToggle('backup_enabled', t.backupEnabled)}

      <div className="grid grid-cols-2 gap-6">
        {renderSelect('backup_frequency', t.backupFrequency, [
          { value: 'daily', label: t.daily },
          { value: 'weekly', label: t.weekly },
          { value: 'monthly', label: t.monthly },
        ])}
        {renderInput('backup_retention', t.backupRetention, 'number')}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <p className="text-sm text-gray-500">{t.lastBackup[lang]}: {settings.last_backup || 'N/A'}</p>
      </div>

      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        {lang === 'ar' ? 'إنشاء نسخة احتياطية الآن' : 'Create Backup Now'}
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'appearance': return renderAppearanceTab();
      case 'email': return renderEmailTab();
      case 'security': return renderSecurityTab();
      case 'notifications': return renderNotificationsTab();
      case 'database': return renderDatabaseTab();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Settings className="w-7 h-7 text-gray-600" />
                {t.title[lang]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle[lang]}</p>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t.saving[lang] : t.save[lang]}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-2">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label[lang]}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

export default SystemSettings;

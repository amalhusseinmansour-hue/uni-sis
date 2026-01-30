import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { TRANSLATIONS } from '../constants';
import { settingsAPI, UserSettings } from '../api/settings';
import { studentsAPI } from '../api/students';
import { exportToCSV } from '../utils/exportUtils';
import {
  UserCircle,
  Bell,
  Shield,
  Globe,
  Moon,
  Save,
  Camera,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Calendar,
  Clock,
  Key,
  Fingerprint,
  History,
  LogOut,
  Trash2,
  Download,
  Check,
  AlertTriangle,
  Info,
  ChevronRight,
  Monitor,
  Palette,
  Volume2,
  FileText,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

interface SettingsProps {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  user: User;
}

const t: Record<string, { en: string; ar: string }> = {
  ...TRANSLATIONS,
  // Additional translations for Settings
  appearance: { en: 'Appearance', ar: 'المظهر' },
  accessibility: { en: 'Accessibility', ar: 'إمكانية الوصول' },
  privacyData: { en: 'Privacy & Data', ar: 'الخصوصية والبيانات' },
  helpSupport: { en: 'Help & Support', ar: 'المساعدة والدعم' },
  accountSettings: { en: 'Account Settings', ar: 'إعدادات الحساب' },
  personalInfo: { en: 'Personal Information', ar: 'المعلومات الشخصية' },
  changePhoto: { en: 'Change Photo', ar: 'تغيير الصورة' },
  removePhoto: { en: 'Remove', ar: 'إزالة' },
  twoFactorAuth: { en: 'Two-Factor Authentication', ar: 'المصادقة الثنائية' },
  twoFactorDesc: { en: 'Add an extra layer of security to your account', ar: 'أضف طبقة أمان إضافية لحسابك' },
  enableTwoFactor: { en: 'Enable 2FA', ar: 'تفعيل المصادقة الثنائية' },
  activeSessions: { en: 'Active Sessions', ar: 'الجلسات النشطة' },
  activeSessionsDesc: { en: 'Manage your logged in devices', ar: 'إدارة الأجهزة المسجلة' },
  viewSessions: { en: 'View All Sessions', ar: 'عرض كل الجلسات' },
  loginHistory: { en: 'Login History', ar: 'سجل تسجيل الدخول' },
  loginHistoryDesc: { en: 'View your recent login activity', ar: 'عرض نشاط تسجيل الدخول الأخير' },
  viewHistory: { en: 'View History', ar: 'عرض السجل' },
  passwordStrength: { en: 'Password Strength', ar: 'قوة كلمة المرور' },
  weak: { en: 'Weak', ar: 'ضعيفة' },
  medium: { en: 'Medium', ar: 'متوسطة' },
  strong: { en: 'Strong', ar: 'قوية' },
  passwordRequirements: { en: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character', ar: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل مع حرف كبير وصغير ورقم ورمز خاص' },
  emailNotifications: { en: 'Email Notifications', ar: 'إشعارات البريد الإلكتروني' },
  pushNotifications: { en: 'Push Notifications', ar: 'الإشعارات الفورية' },
  academicAlerts: { en: 'Academic Alerts', ar: 'التنبيهات الأكاديمية' },
  academicAlertsDesc: { en: 'Grades, registration, and academic announcements', ar: 'الدرجات والتسجيل والإعلانات الأكاديمية' },
  financialAlerts: { en: 'Financial Alerts', ar: 'التنبيهات المالية' },
  financialAlertsDesc: { en: 'Payment reminders and financial updates', ar: 'تذكيرات الدفع والتحديثات المالية' },
  eventReminders: { en: 'Event Reminders', ar: 'تذكيرات الأحداث' },
  eventRemindersDesc: { en: 'Class schedules and upcoming events', ar: 'جداول الحصص والأحداث القادمة' },
  systemNotifications: { en: 'System Notifications', ar: 'إشعارات النظام' },
  systemNotificationsDesc: { en: 'Maintenance and system updates', ar: 'الصيانة وتحديثات النظام' },
  theme: { en: 'Theme', ar: 'السمة' },
  light: { en: 'Light', ar: 'فاتح' },
  dark: { en: 'Dark', ar: 'داكن' },
  system: { en: 'System', ar: 'النظام' },
  colorScheme: { en: 'Color Scheme', ar: 'نظام الألوان' },
  fontSize: { en: 'Font Size', ar: 'حجم الخط' },
  small: { en: 'Small', ar: 'صغير' },
  normal: { en: 'Normal', ar: 'عادي' },
  large: { en: 'Large', ar: 'كبير' },
  reducedMotion: { en: 'Reduced Motion', ar: 'تقليل الحركة' },
  reducedMotionDesc: { en: 'Minimize animations throughout the interface', ar: 'تقليل الرسوم المتحركة في الواجهة' },
  highContrast: { en: 'High Contrast', ar: 'تباين عالي' },
  highContrastDesc: { en: 'Increase contrast for better visibility', ar: 'زيادة التباين للرؤية الأفضل' },
  screenReader: { en: 'Screen Reader Optimized', ar: 'محسّن لقارئ الشاشة' },
  screenReaderDesc: { en: 'Optimize content for screen readers', ar: 'تحسين المحتوى لقارئات الشاشة' },
  downloadData: { en: 'Download My Data', ar: 'تحميل بياناتي' },
  downloadDataDesc: { en: 'Get a copy of your personal data', ar: 'احصل على نسخة من بياناتك الشخصية' },
  deleteAccount: { en: 'Delete Account', ar: 'حذف الحساب' },
  deleteAccountDesc: { en: 'Permanently delete your account and all data', ar: 'حذف حسابك وجميع بياناتك نهائياً' },
  dataRetention: { en: 'Data Retention', ar: 'الاحتفاظ بالبيانات' },
  dataRetentionDesc: { en: 'Your data is retained for the duration of your enrollment', ar: 'يتم الاحتفاظ ببياناتك طوال فترة قيدك' },
  faq: { en: 'FAQ', ar: 'الأسئلة الشائعة' },
  faqDesc: { en: 'Find answers to common questions', ar: 'ابحث عن إجابات للأسئلة الشائعة' },
  contactSupport: { en: 'Contact Support', ar: 'تواصل مع الدعم' },
  contactSupportDesc: { en: 'Get help from our support team', ar: 'احصل على مساعدة من فريق الدعم' },
  documentation: { en: 'Documentation', ar: 'الوثائق' },
  documentationDesc: { en: 'Read the user guide', ar: 'اقرأ دليل المستخدم' },
  feedbackSuggestions: { en: 'Feedback & Suggestions', ar: 'الملاحظات والاقتراحات' },
  feedbackSuggestionsDesc: { en: 'Share your ideas with us', ar: 'شاركنا أفكارك' },
  currentDevice: { en: 'Current Device', ar: 'الجهاز الحالي' },
  lastActive: { en: 'Last Active', ar: 'آخر نشاط' },
  signOutAll: { en: 'Sign Out All Devices', ar: 'تسجيل الخروج من جميع الأجهزة' },
  saveChanges: { en: 'Save Changes', ar: 'حفظ التغييرات' },
  changesSaved: { en: 'Changes saved successfully', ar: 'تم حفظ التغييرات بنجاح' },
  timezone: { en: 'Timezone', ar: 'المنطقة الزمنية' },
  dateFormat: { en: 'Date Format', ar: 'تنسيق التاريخ' },
  soundEffects: { en: 'Sound Effects', ar: 'المؤثرات الصوتية' },
  soundEffectsDesc: { en: 'Play sounds for notifications', ar: 'تشغيل أصوات للإشعارات' },
};

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const MOCK_SESSIONS: Session[] = [
  { id: 's1', device: 'Windows PC', browser: 'Chrome 120', location: 'Riyadh, Saudi Arabia', lastActive: 'Now', isCurrent: true },
  { id: 's2', device: 'iPhone 14', browser: 'Safari', location: 'Riyadh, Saudi Arabia', lastActive: '2 hours ago', isCurrent: false },
  { id: 's3', device: 'MacBook Pro', browser: 'Firefox', location: 'Jeddah, Saudi Arabia', lastActive: 'Yesterday', isCurrent: false },
];

const Settings: React.FC<SettingsProps> = ({ lang, setLang, user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance' | 'privacy' | 'help'>('profile');
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Profile states
  const [formData, setFormData] = useState({
    fullName: user.name,
    email: user.email,
    phone: '+966 50 123 4567',
    alternativeEmail: '',
  });

  // Notification states
  const [notifications, setNotifications] = useState({
    emailNotif: true,
    pushNotif: true,
    academicAlerts: true,
    financialAlerts: true,
    eventReminders: true,
    systemNotifications: false,
    soundEffects: true,
  });

  // Fetch user settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await settingsAPI.getUserSettings();
        if (settings) {
          setUserSettings(settings);
          // Update local state with API data
          setNotifications({
            emailNotif: settings.notifications?.email ?? true,
            pushNotif: settings.notifications?.push ?? true,
            academicAlerts: settings.notifications?.academic ?? true,
            financialAlerts: settings.notifications?.financial ?? true,
            eventReminders: settings.notifications?.announcements ?? true,
            systemNotifications: false,
            soundEffects: settings.notifications?.soundEffects ?? true,
          });
          // Update appearance settings
          if (settings.theme) {
            setTheme(settings.theme as 'light' | 'dark' | 'system');
          }
          if (settings.accessibility?.fontSize) {
            setFontSize(settings.accessibility.fontSize as 'small' | 'normal' | 'large');
          }
          if (settings.accessibility?.highContrast !== undefined) {
            setAccessibility(prev => ({
              ...prev,
              highContrast: settings.accessibility?.highContrast ?? false,
              reducedMotion: settings.accessibility?.reducedMotion ?? false,
            }));
          }
        }
      } catch (error) {
        // Error fetching settings
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Security states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSessions, setShowSessions] = useState(false);

  // Appearance states
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [colorScheme, setColorScheme] = useState('blue');

  // Accessibility states
  const [accessibility, setAccessibility] = useState({
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
  });

  // Save notification
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; percentage: number } => {
    if (password.length < 6) return { strength: 'weak', percentage: 25 };
    if (password.length < 8) return { strength: 'weak', percentage: 40 };

    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 2) return { strength: 'weak', percentage: 40 };
    if (score < 4) return { strength: 'medium', percentage: 70 };
    return { strength: 'strong', percentage: 100 };
  };

  const passwordStrength = getPasswordStrength(passwords.new);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare settings data
      const settingsData: Partial<UserSettings> = {
        theme: theme as 'light' | 'dark' | 'auto',
        notifications: {
          email: notifications.emailNotif,
          sms: false,
          push: notifications.pushNotif,
          academic: notifications.academicAlerts,
          financial: notifications.financialAlerts,
          announcements: notifications.eventReminders,
          soundEffects: notifications.soundEffects,
        },
        accessibility: {
          fontSize: fontSize as 'small' | 'medium' | 'large',
          highContrast: accessibility.highContrast,
          reducedMotion: accessibility.reducedMotion,
        },
      };

      await settingsAPI.updateUserSettings(settingsData);
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (error) {
      // Error saving settings
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t.profile[lang], icon: UserCircle },
    { id: 'notifications', label: t.notifications[lang], icon: Bell },
    { id: 'security', label: t.security[lang], icon: Shield },
    { id: 'appearance', label: t.appearance[lang], icon: Palette },
    { id: 'privacy', label: t.privacyData[lang], icon: FileText },
    { id: 'help', label: t.helpSupport[lang], icon: HelpCircle },
  ] as const;

  const colorSchemes = [
    { id: 'blue', color: '#3b82f6' },
    { id: 'purple', color: '#8b5cf6' },
    { id: 'green', color: '#22c55e' },
    { id: 'orange', color: '#f97316' },
    { id: 'pink', color: '#ec4899' },
    { id: 'teal', color: '#14b8a6' },
  ];

  const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );

  return (
    <div className={`space-y-6 animate-in fade-in duration-300 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Save Notification */}
      {showSaveNotification && (
        <div className="fixed top-4 end-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{t.changesSaved[lang]}</span>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-800">{t.settings[lang]}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:sticky lg:top-4">
            {/* Mobile: Horizontal scroll tabs */}
            <div className="lg:hidden flex overflow-x-auto no-scrollbar border-b border-slate-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap min-w-[80px] ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Desktop: Vertical tabs */}
            <div className="hidden lg:block">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isRTL ? 'ms-3' : 'me-3'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full bg-slate-100 object-cover ring-4 ring-slate-100"
                    />
                    <button className="absolute bottom-0 end-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">{user.name}</h3>
                    <p className="text-slate-500">{user.email}</p>
                    <p className="text-sm text-slate-400 mt-1">{user.role}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="text-sm text-blue-600 font-medium hover:underline">
                        {t.changePhoto[lang]}
                      </button>
                      <span className="text-slate-300">|</span>
                      <button className="text-sm text-red-600 font-medium hover:underline">
                        {t.removePhoto[lang]}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-6">{t.personalInfo[lang]}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.fullName[lang]}
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.email[lang]}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.phone[lang]}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.studentId[lang]}
                    </label>
                    <input
                      type="text"
                      value="20231045"
                      disabled
                      className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* General Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-6">{t.general[lang]}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-700 font-medium">{t.language[lang]}</span>
                      </div>
                      <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => {
                            setLang('en');
                            document.documentElement.dir = 'ltr';
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                            lang === 'en'
                              ? 'bg-white shadow text-blue-600'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => {
                            setLang('ar');
                            document.documentElement.dir = 'rtl';
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                            lang === 'ar'
                              ? 'bg-white shadow text-blue-600'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          العربية
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-700 font-medium">{t.timezone[lang]}</span>
                      </div>
                      <select className="px-3 py-1.5 bg-slate-100 border-0 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500">
                        <option>Asia/Riyadh (GMT+3)</option>
                        <option>Asia/Dubai (GMT+4)</option>
                        <option>Europe/London (GMT+0)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-700 font-medium">{t.dateFormat[lang]}</span>
                      </div>
                      <select className="px-3 py-1.5 bg-slate-100 border-0 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500">
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {t.saveChanges[lang]}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-slate-800">{t.emailNotifications[lang]}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'academicAlerts', label: t.academicAlerts[lang], desc: t.academicAlertsDesc[lang] },
                    { key: 'financialAlerts', label: t.financialAlerts[lang], desc: t.financialAlertsDesc[lang] },
                    { key: 'eventReminders', label: t.eventReminders[lang], desc: t.eventRemindersDesc[lang] },
                    { key: 'systemNotifications', label: t.systemNotifications[lang], desc: t.systemNotificationsDesc[lang] },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-800">{item.label}</h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <Toggle
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={() =>
                          setNotifications({
                            ...notifications,
                            [item.key]: !notifications[item.key as keyof typeof notifications],
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-slate-800">{t.pushNotifications[lang]}</h3>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-800">{t.pushNotifications[lang]}</h4>
                    <p className="text-sm text-slate-500">
                      {lang === 'en' ? 'Receive push notifications on your device' : 'استلم إشعارات فورية على جهازك'}
                    </p>
                  </div>
                  <Toggle
                    checked={notifications.pushNotif}
                    onChange={() => setNotifications({ ...notifications, pushNotif: !notifications.pushNotif })}
                  />
                </div>
              </div>

              {/* Sound Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-slate-800">{t.soundEffects[lang]}</h3>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-800">{t.soundEffects[lang]}</h4>
                    <p className="text-sm text-slate-500">{t.soundEffectsDesc[lang]}</p>
                  </div>
                  <Toggle
                    checked={notifications.soundEffects}
                    onChange={() => setNotifications({ ...notifications, soundEffects: !notifications.soundEffects })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {t.saveChanges[lang]}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Key className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-slate-800">{t.changePassword[lang]}</h3>
                </div>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t.currentPass[lang]}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pe-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t.newPass[lang]}</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pe-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwords.new && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500">{t.passwordStrength[lang]}:</span>
                          <span
                            className={`text-xs font-medium ${
                              passwordStrength.strength === 'weak'
                                ? 'text-red-600'
                                : passwordStrength.strength === 'medium'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {t[passwordStrength.strength][lang]}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.strength === 'weak'
                                ? 'bg-red-500'
                                : passwordStrength.strength === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${passwordStrength.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t.confirmPass[lang]}</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pe-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwords.confirm && passwords.new !== passwords.confirm && (
                      <p className="text-xs text-red-600 mt-1">
                        {lang === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة'}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{t.passwordRequirements[lang]}</p>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Fingerprint className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{t.twoFactorAuth[lang]}</h4>
                      <p className="text-sm text-slate-500">{t.twoFactorDesc[lang]}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      twoFactorEnabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {twoFactorEnabled ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {lang === 'en' ? 'Enabled' : 'مفعّل'}
                      </span>
                    ) : (
                      t.enableTwoFactor[lang]
                    )}
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg text-slate-800">{t.activeSessions[lang]}</h3>
                  </div>
                  <button
                    onClick={() => setShowSessions(!showSessions)}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    {t.viewSessions[lang]}
                    <ChevronRight className={`w-4 h-4 transition-transform ${showSessions ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {showSessions && (
                  <div className="space-y-3">
                    {MOCK_SESSIONS.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border ${
                          session.isCurrent ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{session.device}</span>
                              {session.isCurrent && (
                                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                  {t.currentDevice[lang]}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              {session.browser} • {session.location}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {t.lastActive[lang]}: {session.lastActive}
                            </p>
                          </div>
                          {!session.isCurrent && (
                            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" />
                      {t.signOutAll[lang]}
                    </button>
                  </div>
                )}
              </div>

              {/* Login History */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <History className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{t.loginHistory[lang]}</h4>
                      <p className="text-sm text-slate-500">{t.loginHistoryDesc[lang]}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 font-medium text-sm hover:underline flex items-center gap-1">
                    {t.viewHistory[lang]}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {t.saveChanges[lang]}
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-6">{t.theme[lang]}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: t.light[lang], icon: '☀️' },
                    { id: 'dark', label: t.dark[lang], icon: '🌙' },
                    { id: 'system', label: t.system[lang], icon: '💻' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id as typeof theme)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <span className={`font-medium ${theme === option.id ? 'text-blue-600' : 'text-slate-700'}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-6">{t.colorScheme[lang]}</h3>
                <div className="flex flex-wrap gap-3">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => setColorScheme(scheme.id)}
                      className={`w-12 h-12 rounded-full transition-all ${
                        colorScheme === scheme.id ? 'ring-4 ring-offset-2 ring-slate-300' : ''
                      }`}
                      style={{ backgroundColor: scheme.color }}
                    >
                      {colorScheme === scheme.id && <Check className="w-6 h-6 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-6">{t.fontSize[lang]}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">A</span>
                  <div className="flex-1 flex gap-2">
                    {(['small', 'normal', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          fontSize === size
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t[size][lang]}
                      </button>
                    ))}
                  </div>
                  <span className="text-lg text-slate-500">A</span>
                </div>
              </div>

              {/* Accessibility */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-6">{t.accessibility[lang]}</h3>
                <div className="space-y-4">
                  {[
                    { key: 'reducedMotion', label: t.reducedMotion[lang], desc: t.reducedMotionDesc[lang] },
                    { key: 'highContrast', label: t.highContrast[lang], desc: t.highContrastDesc[lang] },
                    { key: 'screenReader', label: t.screenReader[lang], desc: t.screenReaderDesc[lang] },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-800">{item.label}</h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <Toggle
                        checked={accessibility[item.key as keyof typeof accessibility]}
                        onChange={() =>
                          setAccessibility({
                            ...accessibility,
                            [item.key]: !accessibility[item.key as keyof typeof accessibility],
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {t.saveChanges[lang]}
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Data Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Data Retention Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">{t.dataRetention[lang]}</h4>
                  <p className="text-sm text-blue-600 mt-1">{t.dataRetentionDesc[lang]}</p>
                </div>
              </div>

            </div>
          )}

          {/* Help & Support Tab */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: HelpCircle, label: t.faq[lang], desc: t.faqDesc[lang], color: 'blue' },
                  { icon: MessageSquare, label: t.contactSupport[lang], desc: t.contactSupportDesc[lang], color: 'green' },
                  { icon: FileText, label: t.documentation[lang], desc: t.documentationDesc[lang], color: 'purple' },
                  { icon: Mail, label: t.feedbackSuggestions[lang], desc: t.feedbackSuggestionsDesc[lang], color: 'orange' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  const colorClasses = {
                    blue: 'bg-blue-100 text-blue-600',
                    green: 'bg-green-100 text-green-600',
                    purple: 'bg-purple-100 text-purple-600',
                    orange: 'bg-orange-100 text-orange-600',
                  };
                  return (
                    <button
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-start hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 flex items-center justify-between">
                            {item.label}
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Warning Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    {lang === 'en' ? 'Need immediate help?' : 'تحتاج مساعدة فورية؟'}
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {lang === 'en'
                      ? 'Contact the IT Help Desk at ext. 1234 or visit the Student Services Center'
                      : 'تواصل مع مكتب المساعدة التقنية على الرقم الداخلي 1234 أو قم بزيارة مركز خدمات الطلاب'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

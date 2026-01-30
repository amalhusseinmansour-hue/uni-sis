import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, Loader2, Users, UserPlus, Check, X,
  Search, CheckSquare, Square, AlertCircle,
  GraduationCap, Building, Mail, Clock, Eye, Copy, Key, User,
  Globe, MapPin, Calendar, Shield
} from 'lucide-react';
import { lmsAPI, LmsUser } from '../../api/lms';
import { useToast } from '../../hooks/useToast';

interface LmsLecturersManagementProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'LMS Lecturers', ar: 'محاضرين نظام التعلم' },
  subtitle: { en: 'Import lecturers from Learning Management System', ar: 'استيراد المحاضرين من نظام إدارة التعلم' },
  back: { en: 'Back', ar: 'رجوع' },
  refresh: { en: 'Refresh', ar: 'تحديث' },
  importSelected: { en: 'Import', ar: 'استيراد' },
  importAll: { en: 'Import All', ar: 'استيراد الكل' },
  selectAll: { en: 'Select All', ar: 'تحديد الكل' },
  deselectAll: { en: 'Deselect', ar: 'إلغاء' },
  name: { en: 'Name', ar: 'الاسم' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  username: { en: 'Username', ar: 'اسم المستخدم' },
  department: { en: 'Department', ar: 'القسم' },
  lastAccess: { en: 'Last Access', ar: 'آخر دخول' },
  status: { en: 'Status', ar: 'الحالة' },
  existsInSis: { en: 'In SIS', ar: 'موجود' },
  notInSis: { en: 'Not in SIS', ar: 'غير موجود' },
  noData: { en: 'No users found in LMS', ar: 'لا يوجد مستخدمين في LMS' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  importing: { en: 'Importing...', ar: 'جاري الاستيراد...' },
  importSuccess: { en: 'Lecturers imported successfully', ar: 'تم استيراد المحاضرين بنجاح' },
  importError: { en: 'Error importing lecturers', ar: 'خطأ في استيراد المحاضرين' },
  fetchError: { en: 'Error fetching data from LMS', ar: 'خطأ في جلب البيانات من LMS' },
  totalUsers: { en: 'Total', ar: 'الإجمالي' },
  inSis: { en: 'In SIS', ar: 'في النظام' },
  notInSisCount: { en: 'Not in SIS', ar: 'غير موجود' },
  selected: { en: 'Selected', ar: 'محدد' },
  searchPlaceholder: { en: 'Search...', ar: 'بحث...' },
  showAll: { en: 'All', ar: 'الكل' },
  showNotInSis: { en: 'New', ar: 'جديد' },
  users: { en: 'users', ar: 'مستخدم' },
  // Modal translations
  userDetails: { en: 'User Details', ar: 'تفاصيل المستخدم' },
  lmsInfo: { en: 'LMS Information', ar: 'معلومات نظام التعلم' },
  sisAccount: { en: 'SIS Account', ar: 'حساب النظام' },
  createAccount: { en: 'Create SIS Account', ar: 'إنشاء حساب' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  copied: { en: 'Copied!', ar: 'تم النسخ!' },
  copyEmail: { en: 'Copy Email', ar: 'نسخ البريد' },
  copyPassword: { en: 'Copy Password', ar: 'نسخ كلمة المرور' },
  close: { en: 'Close', ar: 'إغلاق' },
  country: { en: 'Country', ar: 'البلد' },
  city: { en: 'City', ar: 'المدينة' },
  moodleId: { en: 'Moodle ID', ar: 'رقم Moodle' },
  role: { en: 'Role', ar: 'الدور' },
  accountCreated: { en: 'Account created successfully!', ar: 'تم إنشاء الحساب بنجاح!' },
  defaultPassword: { en: 'Default Password', ar: 'كلمة المرور الافتراضية' },
  noAccount: { en: 'No SIS account yet', ar: 'لا يوجد حساب بعد' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
};

const LmsLecturersManagement: React.FC<LmsLecturersManagementProps> = ({ lang }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [users, setUsers] = useState<LmsUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<LmsUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'not_in_sis'>('all');
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({ total: 0, inSis: 0, notInSis: 0 });

  // Modal state
  const [selectedUser, setSelectedUser] = useState<LmsUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { filterUsers(); }, [users, searchQuery, filterMode]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await lmsAPI.getLmsUsers();
      if (result.success) {
        setUsers(result.users || []);
        const inSis = (result.users || []).filter(u => u.exists_in_sis).length;
        setStats({ total: result.total || 0, inSis, notInSis: (result.total || 0) - inSis });
      } else {
        setError(result.error || t.fetchError[lang]);
      }
    } catch (err: any) {
      setError(err.message || t.fetchError[lang]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name_en.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query)
      );
    }
    if (filterMode === 'not_in_sis') {
      filtered = filtered.filter(u => !u.exists_in_sis);
    }
    setFilteredUsers(filtered);
  };

  const handleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredUsers.length ? [] : filteredUsers.map(u => u.moodle_id));
  };

  const handleSelectUser = (moodleId: number) => {
    setSelectedIds(prev => prev.includes(moodleId) ? prev.filter(id => id !== moodleId) : [...prev, moodleId]);
  };

  const handleImport = async (importAll = false) => {
    const idsToImport = importAll
      ? filteredUsers.filter(u => !u.exists_in_sis).map(u => u.moodle_id)
      : selectedIds;

    if (idsToImport.length === 0) {
      toast.warning(lang === 'ar' ? 'يرجى تحديد محاضرين للاستيراد' : 'Please select lecturers to import');
      return;
    }

    try {
      setImporting(true);
      const result = await lmsAPI.importLecturersFromLms(idsToImport);
      if (result.success) {
        toast.success(lang === 'ar'
          ? `تم استيراد ${result.data.imported} محاضر، تحديث ${result.data.updated}، فشل ${result.data.failed}`
          : `Imported ${result.data.imported}, Updated ${result.data.updated}, Failed ${result.data.failed}`);
        setSelectedIds([]);
        fetchUsers();
      } else {
        toast.error(result.message || t.importError[lang]);
      }
    } catch (err: any) {
      toast.error(err.message || t.importError[lang]);
    } finally {
      setImporting(false);
    }
  };

  // Open user details modal
  const handleViewUser = (user: LmsUser, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedUser(user);
    setGeneratedPassword(null);
    setShowModal(true);
  };

  // Create account for single user
  const handleCreateSingleAccount = async () => {
    if (!selectedUser) return;

    try {
      setCreatingAccount(true);
      const result = await lmsAPI.importLecturersFromLms([selectedUser.moodle_id]);

      if (result.success) {
        // Generate the default password based on the pattern used in backend
        const today = new Date();
        const dateStr = today.getFullYear().toString() +
          (today.getMonth() + 1).toString().padStart(2, '0') +
          today.getDate().toString().padStart(2, '0');
        const defaultPwd = `LMS${dateStr}!`;
        setGeneratedPassword(defaultPwd);

        // Update user in list
        setUsers(prev => prev.map(u =>
          u.moodle_id === selectedUser.moodle_id
            ? { ...u, exists_in_sis: true, sis_role: 'LECTURER' }
            : u
        ));
        setSelectedUser(prev => prev ? { ...prev, exists_in_sis: true, sis_role: 'LECTURER' } : null);

        // Update stats
        setStats(prev => ({ ...prev, inSis: prev.inSis + 1, notInSis: prev.notInSis - 1 }));

        toast.success(t.accountCreated[lang]);
      } else {
        toast.error(result.message || t.importError[lang]);
      }
    } catch (err: any) {
      toast.error(err.message || t.importError[lang]);
    } finally {
      setCreatingAccount(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getRoleBadge = (role?: string | null) => {
    if (!role) return null;
    const config: Record<string, { bg: string; label: string }> = {
      ADMIN: { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: lang === 'ar' ? 'مدير' : 'Admin' },
      LECTURER: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: lang === 'ar' ? 'محاضر' : 'Lecturer' },
      STUDENT: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: lang === 'ar' ? 'طالب' : 'Student' },
    };
    const c = config[role] || { bg: 'bg-gray-100 text-gray-800', label: role };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>{c.label}</span>;
  };

  // Mobile Card Component
  const UserCard = ({ user }: { user: LmsUser }) => (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
        selectedIds.includes(user.moodle_id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selectedIds.includes(user.moodle_id)}
          onChange={() => handleSelectUser(user.moodle_id)}
          className="w-5 h-5 mt-1 rounded border-gray-300 dark:border-gray-600"
        />
        <div className="flex-1 min-w-0" onClick={() => handleViewUser(user)}>
          <div className="flex items-center gap-3 mb-2">
            {user.profile_url ? (
              <img src={user.profile_url} alt={user.name_en} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user.name_en}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.username}</p>
            </div>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.department && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Building className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{user.department}</span>
              </div>
            )}
            {user.last_access && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{new Date(user.last_access).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {user.exists_in_sis ? (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <Check className="w-3 h-3" />
                  {t.existsInSis[lang]}
                </span>
                {getRoleBadge(user.sis_role)}
              </>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                <X className="w-3 h-3" />
                {t.notInSis[lang]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back[lang]}
        </button>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              {t.title[lang]}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">{t.subtitle[lang]}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t.refresh[lang]}</span>
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={() => handleImport(false)}
                disabled={importing}
                className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {importing ? '' : `${t.importSelected[lang]} (${selectedIds.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards - Compact on Mobile */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {[
          { icon: Users, label: t.totalUsers[lang], value: stats.total, color: 'blue' },
          { icon: Check, label: t.inSis[lang], value: stats.inSis, color: 'green' },
          { icon: X, label: t.notInSisCount[lang], value: stats.notInSis, color: 'yellow' },
          { icon: CheckSquare, label: t.selected[lang], value: selectedIds.length, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className={`hidden sm:flex p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Filters - Stacked on Mobile */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 sm:mb-6 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t.showAll[lang]} ({stats.total})
            </button>
            <button
              onClick={() => setFilterMode('not_in_sis')}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filterMode === 'not_in_sis'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t.showNotInSis[lang]} ({stats.notInSis})
            </button>
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex items-center justify-center gap-1"
            >
              {selectedIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {selectedIds.length === filteredUsers.length ? t.deselectAll[lang] : t.selectAll[lang]}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">{t.loading[lang]}</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mb-4 opacity-50" />
            <p>{t.noData[lang]}</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card View */}
            <div className="sm:hidden">
              {filteredUsers.map((user) => (
                <UserCard key={user.moodle_id} user={user} />
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t.name[lang]}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t.email[lang]}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t.department[lang]}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t.lastAccess[lang]}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t.status[lang]}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.moodle_id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedIds.includes(user.moodle_id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.moodle_id)}
                          onChange={() => handleSelectUser(user.moodle_id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {user.profile_url ? (
                            <img src={user.profile_url} alt={user.name_en} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div>
                            <span className="text-gray-900 dark:text-white font-medium block">{user.name_en}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300 text-sm">{user.email}</td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300 text-sm">{user.department || '-'}</td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300 text-sm">
                        {user.last_access ? new Date(user.last_access).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {user.exists_in_sis ? (
                            <>
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <Check className="w-3 h-3" />
                                {t.existsInSis[lang]}
                              </span>
                              {getRoleBadge(user.sis_role)}
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                              <X className="w-3 h-3" />
                              {t.notInSis[lang]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => handleViewUser(user, e)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title={t.viewDetails[lang]}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Import All Button - Fixed on Mobile */}
      {filteredUsers.filter(u => !u.exists_in_sis).length > 0 && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            onClick={() => handleImport(true)}
            disabled={importing}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg font-medium"
          >
            {importing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {importing
              ? t.importing[lang]
              : `${t.importAll[lang]} (${filteredUsers.filter(u => !u.exists_in_sis).length} ${t.users[lang]})`}
          </button>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.userDetails[lang]}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-6">
              {/* User Profile */}
              <div className="flex items-center gap-4">
                {selectedUser.profile_url ? (
                  <img src={selectedUser.profile_url} alt={selectedUser.name_en} className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-100 dark:border-gray-700">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name_en}</h3>
                  <p className="text-gray-500 dark:text-gray-400">@{selectedUser.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedUser.exists_in_sis ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <Check className="w-3 h-3" />
                          {t.existsInSis[lang]}
                        </span>
                        {getRoleBadge(selectedUser.sis_role)}
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <X className="w-3 h-3" />
                        {t.notInSis[lang]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* LMS Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {t.lmsInfo[lang]}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300 flex-1 truncate">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 dark:text-gray-400">{t.moodleId[lang]}:</span>
                    <span className="text-gray-900 dark:text-white font-mono">{selectedUser.moodle_id}</span>
                  </div>
                  {selectedUser.department && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{selectedUser.department}</span>
                    </div>
                  )}
                  {selectedUser.country && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{selectedUser.country}</span>
                      {selectedUser.city && <span className="text-gray-400">• {selectedUser.city}</span>}
                    </div>
                  )}
                  {selectedUser.last_access && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500 dark:text-gray-400">{t.lastAccess[lang]}:</span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {new Date(selectedUser.last_access).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SIS Account Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t.sisAccount[lang]}
                </h4>

                {selectedUser.exists_in_sis || generatedPassword ? (
                  <div className="space-y-3">
                    {/* Email Field */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.email[lang]}</p>
                        <p className="font-mono text-gray-900 dark:text-white text-sm break-all">{selectedUser.email}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedUser.email, 'email')}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title={t.copyEmail[lang]}
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    {/* Password Field */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.defaultPassword[lang]}</p>
                        <p className="font-mono text-gray-900 dark:text-white text-sm">
                          {generatedPassword || 'LMS' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '!'}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(generatedPassword || 'LMS' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '!', 'password')}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title={t.copyPassword[lang]}
                      >
                        {copiedField === 'password' ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    {generatedPassword && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-2">
                        <Check className="w-4 h-4" />
                        {t.accountCreated[lang]}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t.noAccount[lang]}</p>
                    <button
                      onClick={handleCreateSingleAccount}
                      disabled={creatingAccount}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto font-medium"
                    >
                      {creatingAccount ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                      {creatingAccount ? t.importing[lang] : t.createAccount[lang]}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                {t.close[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LmsLecturersManagement;

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserCheck,
  UserX,
  GraduationCap,
  Briefcase,
  Shield,
  DollarSign,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  Calculator,
  ClipboardList,
  UserPlus,
  Phone,
  Camera,
  Image,
} from 'lucide-react';
import { usersAPI, User, CreateUserData, UserFilters } from '../../api/users';
import { rolesAPI, Role, DEFAULT_ROLES } from '../../api/roles';

interface Props {
  lang: 'en' | 'ar';
}

const translations = {
  title: { en: 'User Management', ar: 'إدارة المستخدمين' },
  subtitle: { en: 'Create and manage user accounts', ar: 'إنشاء وإدارة حسابات المستخدمين' },
  addUser: { en: 'Add New User', ar: 'إضافة مستخدم جديد' },
  search: { en: 'Search users...', ar: 'البحث عن المستخدمين...' },
  allRoles: { en: 'All Roles', ar: 'كل الأدوار' },
  allStatus: { en: 'All Status', ar: 'كل الحالات' },
  admin: { en: 'Admin', ar: 'مدير النظام' },
  student: { en: 'Student', ar: 'طالب' },
  lecturer: { en: 'Lecturer', ar: 'محاضر' },
  finance: { en: 'Finance', ar: 'مالية' },
  student_affairs: { en: 'Student Affairs', ar: 'شؤون الطلاب' },
  accountant: { en: 'Accountant', ar: 'محاسب' },
  registrar: { en: 'Registrar', ar: 'التسجيل' },
  admissions: { en: 'Admissions', ar: 'القبول' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  confirmPassword: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  firstName: { en: 'First Name (English)', ar: 'الاسم الأول (إنجليزي)' },
  lastName: { en: 'Last Name (English)', ar: 'اسم العائلة (إنجليزي)' },
  firstNameAr: { en: 'First Name (Arabic)', ar: 'الاسم الأول (عربي)' },
  lastNameAr: { en: 'Last Name (Arabic)', ar: 'اسم العائلة (عربي)' },
  role: { en: 'Role', ar: 'الدور' },
  studentId: { en: 'Student ID', ar: 'رقم الطالب' },
  department: { en: 'Department', ar: 'القسم' },
  program: { en: 'Program', ar: 'البرنامج' },
  phone: { en: 'Phone', ar: 'رقم الجوال' },
  status: { en: 'Status', ar: 'الحالة' },
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  suspended: { en: 'Suspended', ar: 'موقوف' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  createUser: { en: 'Create User', ar: 'إنشاء مستخدم' },
  editUser: { en: 'Edit User', ar: 'تعديل مستخدم' },
  userCreated: { en: 'User created successfully!', ar: 'تم إنشاء المستخدم بنجاح!' },
  userUpdated: { en: 'User updated successfully!', ar: 'تم تحديث المستخدم بنجاح!' },
  userDeleted: { en: 'User deleted successfully!', ar: 'تم حذف المستخدم بنجاح!' },
  confirmDelete: { en: 'Are you sure you want to delete this user?', ar: 'هل أنت متأكد من حذف هذا المستخدم؟' },
  passwordMismatch: { en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' },
  requiredField: { en: 'This field is required', ar: 'هذا الحقل مطلوب' },
  invalidEmail: { en: 'Invalid email format', ar: 'صيغة البريد الإلكتروني غير صحيحة' },
  generatePassword: { en: 'Generate Password', ar: 'توليد كلمة مرور' },
  showPassword: { en: 'Show Password', ar: 'إظهار كلمة المرور' },
  hidePassword: { en: 'Hide Password', ar: 'إخفاء كلمة المرور' },
  createdAt: { en: 'Created At', ar: 'تاريخ الإنشاء' },
  lastLogin: { en: 'Last Login', ar: 'آخر دخول' },
  noUsers: { en: 'No users found', ar: 'لا يوجد مستخدمين' },
  totalUsers: { en: 'Total Users', ar: 'إجمالي المستخدمين' },
  quickStats: { en: 'Quick Stats', ar: 'إحصائيات سريعة' },
  exportUsers: { en: 'Export', ar: 'تصدير' },
  importUsers: { en: 'Import', ar: 'استيراد' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  error: { en: 'Error loading data', ar: 'خطأ في تحميل البيانات' },
  retry: { en: 'Retry', ar: 'إعادة المحاولة' },
  profilePicture: { en: 'Profile Picture', ar: 'الصورة الشخصية' },
  uploadPhoto: { en: 'Upload Photo', ar: 'رفع صورة' },
  changePhoto: { en: 'Change Photo', ar: 'تغيير الصورة' },
  photoHint: { en: 'This photo will be used for the student ID card', ar: 'سيتم استخدام هذه الصورة في البطاقة الجامعية' },
  selected: { en: 'selected', ar: 'محدد' },
  bulkDelete: { en: 'Delete Selected', ar: 'حذف المحدد' },
  bulkDeleteConfirm: { en: 'Are you sure you want to delete the selected users?', ar: 'هل أنت متأكد من حذف المستخدمين المحددين؟' },
  bulkDeleteSuccess: { en: 'Users deleted successfully', ar: 'تم حذف المستخدمين بنجاح' },
  selectAll: { en: 'Select All', ar: 'تحديد الكل' },
  deselectAll: { en: 'Deselect All', ar: 'إلغاء التحديد' },
};

const t = (key: keyof typeof translations, lang: 'en' | 'ar') => translations[key][lang];

const roleConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  admin: { icon: Shield, color: 'text-purple-700', bgColor: 'bg-purple-100' },
  student: { icon: GraduationCap, color: 'text-blue-700', bgColor: 'bg-blue-100' },
  lecturer: { icon: Briefcase, color: 'text-green-700', bgColor: 'bg-green-100' },
  finance: { icon: DollarSign, color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  student_affairs: { icon: Users, color: 'text-pink-700', bgColor: 'bg-pink-100' },
  accountant: { icon: Calculator, color: 'text-teal-700', bgColor: 'bg-teal-100' },
  registrar: { icon: ClipboardList, color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  admissions: { icon: UserPlus, color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  active: { color: 'text-green-700', bgColor: 'bg-green-100' },
  inactive: { color: 'text-gray-700', bgColor: 'bg-gray-100' },
  suspended: { color: 'text-red-700', bgColor: 'bg-red-100' },
};

const UserManagement: React.FC<Props> = ({ lang }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [stats, setStats] = useState({ total: 0, byRole: {} as Record<string, number>, byStatus: {} as Record<string, number> });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    role: 'student',
    studentId: '',
    department: '',
    program: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load users
    try {
      const usersData = await usersAPI.getAll();
      const userList = usersData.data || [];
      setUsers(userList);

      // Calculate stats
      const byRole: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      userList.forEach((u: User) => {
        const roleName = u.role?.toLowerCase() || 'unknown';
        byRole[roleName] = (byRole[roleName] || 0) + 1;
        byStatus[u.status] = (byStatus[u.status] || 0) + 1;
      });
      setStats({ total: userList.length, byRole, byStatus });
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }

    // Load roles separately
    try {
      const rolesData = await rolesAPI.getAll();
      setRoles(rolesData || []);
    } catch (error) {
      // Use default roles if API fails
      setRoles(DEFAULT_ROLES.map((r, i) => ({ ...r, id: i + 1, permissions: [], createdAt: new Date().toISOString() })) as Role[]);
    }

    setLoading(false);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password, confirmPassword: password });
  };

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const num = String(users.filter(u => u.role?.toLowerCase() === 'student').length + 1).padStart(4, '0');
    return `${year}${num}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t('requiredField', lang);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail', lang);
    }

    if (!editingUser && !formData.password) {
      newErrors.password = t('requiredField', lang);
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch', lang);
    }

    if (!formData.firstName) {
      newErrors.firstName = t('requiredField', lang);
    }

    if (!formData.lastName) {
      newErrors.lastName = t('requiredField', lang);
    }

    if (formData.role === 'student' && !formData.studentId) {
      newErrors.studentId = t('requiredField', lang);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const userData: any = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        firstNameAr: formData.firstNameAr,
        lastNameAr: formData.lastNameAr,
        role: formData.role.toUpperCase(),
        studentId: formData.role === 'student' ? formData.studentId : undefined,
        department: formData.department,
        program: formData.program,
        phone: formData.phone,
        status: formData.status,
      };

      // Add profile picture if provided (for students)
      if (formData.role === 'student' && profilePicturePreview) {
        userData.profilePicture = profilePicturePreview;
      }

      if (editingUser) {
        if (formData.password) {
          userData.password = formData.password;
        }
        await usersAPI.update(editingUser.id, userData);
        showNotification('success', t('userUpdated', lang));
      } else {
        userData.password = formData.password;
        await usersAPI.create(userData);
        showNotification('success', t('userCreated', lang));
      }
      loadData();
      resetForm();
      setShowModal(false);
    } catch (error: any) {
      showNotification('error', error.response?.data?.message || 'Error saving user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      confirmPassword: '',
      firstName: user.firstName,
      lastName: user.lastName,
      firstNameAr: user.firstNameAr || '',
      lastNameAr: user.lastNameAr || '',
      role: user.role?.toLowerCase() || 'student',
      studentId: user.studentId || '',
      department: user.department || '',
      program: user.program || '',
      phone: user.phone || '',
      status: user.status,
    });
    // Load existing profile picture if available
    if (user.avatar) {
      setProfilePicturePreview(user.avatar);
    } else {
      setProfilePicturePreview(null);
    }
    setProfilePicture(null);
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    try {
      await usersAPI.delete(userId);
      showNotification('success', t('userDeleted', lang));
      loadData();
    } catch (error) {
      showNotification('error', 'Error deleting user');
    }
    setDeleteConfirm(null);
  };

  // Toggle single user selection
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle all users selection
  const toggleAllSelection = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    setBulkDeleting(true);
    try {
      // Delete users one by one
      for (const userId of selectedUsers) {
        await usersAPI.delete(userId);
      }
      showNotification('success', t('bulkDeleteSuccess', lang));
      setSelectedUsers([]);
      loadData();
    } catch (error) {
      showNotification('error', 'Error deleting users');
    } finally {
      setBulkDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      role: 'student',
      studentId: '',
      department: '',
      program: '',
      phone: '',
      status: 'active',
    });
    setEditingUser(null);
    setErrors({});
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const openCreateModal = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      studentId: generateStudentId(),
    }));
    setShowModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const exportUsers = () => {
    // Create CSV content
    const headers = ['Email', 'First Name', 'Last Name', 'First Name (Arabic)', 'Last Name (Arabic)', 'Role', 'Student ID', 'Phone', 'Department', 'Program', 'Status', 'Created At'];
    const rows = filteredUsers.map(user => [
      user.email || '',
      user.firstName || '',
      user.lastName || '',
      user.firstNameAr || '',
      user.lastNameAr || '',
      user.role || '',
      user.studentId || '',
      user.phone || '',
      user.department || '',
      user.program || '',
      user.status || '',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
    ]);

    // Add BOM for proper Arabic encoding in Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('success', lang === 'ar' ? 'تم تصدير المستخدمين بنجاح' : 'Users exported successfully');
  };

  const getRoleDisplay = (role: string) => {
    const roleLower = role?.toLowerCase() || 'unknown';
    const config = roleConfig[roleLower] || roleConfig.student;
    const Icon = config.icon;
    const roleKey = roleLower as keyof typeof translations;
    const label = translations[roleKey]?.[lang] || role;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getStatusDisplay = (status: string) => {
    const config = statusConfig[status] || statusConfig.inactive;
    const statusKey = status as keyof typeof translations;
    const label = translations[statusKey]?.[lang] || status;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        {status === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading', lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 end-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            {t('title', lang)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('subtitle', lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t('bulkDelete', lang)} ({selectedUsers.length})
            </button>
          )}
          <button
            onClick={exportUsers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('exportUsers', lang)}
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('addUser', lang)}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalUsers', lang)}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        {Object.entries(roleConfig).slice(0, 5).map(([role, config]) => {
          const Icon = config.icon;
          const count = stats.byRole[role] || 0;
          const roleKey = role as keyof typeof translations;
          return (
            <div key={role} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${config.bgColor} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translations[roleKey]?.[lang] || role}</p>
                  <p className={`text-xl font-bold ${config.color}`}>{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search', lang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          >
            <option value="all">{t('allRoles', lang)}</option>
            <option value="admin">{t('admin', lang)}</option>
            <option value="student">{t('student', lang)}</option>
            <option value="lecturer">{t('lecturer', lang)}</option>
            <option value="finance">{t('finance', lang)}</option>
            <option value="student_affairs">{t('student_affairs', lang)}</option>
            <option value="accountant">{t('accountant', lang)}</option>
            <option value="registrar">{t('registrar', lang)}</option>
            <option value="admissions">{t('admissions', lang)}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          >
            <option value="all">{t('allStatus', lang)}</option>
            <option value="active">{t('active', lang)}</option>
            <option value="inactive">{t('inactive', lang)}</option>
            <option value="suspended">{t('suspended', lang)}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={toggleAllSelection}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('email', lang)}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-gray-600 dark:text-gray-300">
                  {lang === 'ar' ? 'الاسم' : 'Name'}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('role', lang)}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('status', lang)}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('createdAt', lang)}
                </th>
                <th className="px-4 py-3 text-start text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('actions', lang)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('noUsers', lang)}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.firstNameAr && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.firstNameAr} {user.lastNameAr}
                          </p>
                        )}
                        {user.studentId && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">{user.studentId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRoleDisplay(user.role)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusDisplay(user.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={t('edit', lang)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t('delete', lang)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingUser ? t('editUser', lang) : t('createUser', lang)}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('role', lang)} *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(roleConfig).map(([role, config]) => {
                    const Icon = config.icon;
                    const roleKey = role as keyof typeof translations;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            role,
                            studentId: role === 'student' ? generateStudentId() : '',
                          });
                        }}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                          formData.role === role
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                        }`}
                      >
                        <span className={`${config.bgColor} p-2 rounded-full`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{translations[roleKey]?.[lang] || role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('email', lang)} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full ps-10 pe-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('password', lang)} {!editingUser && '*'}
                  </label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={editingUser ? (lang === 'ar' ? 'اتركه فارغاً للإبقاء' : 'Leave empty to keep') : ''}
                        className={`w-full ps-10 pe-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                      title={t('generatePassword', lang)}
                    >
                      <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>

              {/* Confirm Password */}
              {formData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('confirmPassword', lang)} *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('firstName', lang)} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                      errors.firstName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('lastName', lang)} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                      errors.lastName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Arabic Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('firstNameAr', lang)}
                  </label>
                  <input
                    type="text"
                    value={formData.firstNameAr}
                    onChange={(e) => setFormData({ ...formData, firstNameAr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('lastNameAr', lang)}
                  </label>
                  <input
                    type="text"
                    value={formData.lastNameAr}
                    onChange={(e) => setFormData({ ...formData, lastNameAr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('phone', lang)}
                </label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full ps-10 pe-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              {formData.role === 'student' && (
                <>
                  {/* Profile Picture Upload */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('profilePicture', lang)}
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {profilePicturePreview ? (
                          <img
                            src={profilePicturePreview}
                            alt="Preview"
                            className="w-24 h-24 rounded-xl object-cover border-2 border-blue-300"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        {profilePicturePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfilePicture(null);
                              setProfilePicturePreview(null);
                            }}
                            className="absolute -top-2 -end-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                          />
                          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit">
                            <Image className="w-4 h-4" />
                            <span>{profilePicturePreview ? t('changePhoto', lang) : t('uploadPhoto', lang)}</span>
                          </div>
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {t('photoHint', lang)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('studentId', lang)} *
                      </label>
                      <input
                        type="text"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                          errors.studentId ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('program', lang)}
                      </label>
                      <select
                        value={formData.program}
                        onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      >
                        <option value="">-- {lang === 'ar' ? 'اختر البرنامج' : 'Select Program'} --</option>
                        <option value="Computer Science">{lang === 'ar' ? 'علوم الحاسوب' : 'Computer Science'}</option>
                        <option value="Information Technology">{lang === 'ar' ? 'تقنية المعلومات' : 'Information Technology'}</option>
                        <option value="Business Administration">{lang === 'ar' ? 'إدارة الأعمال' : 'Business Administration'}</option>
                        <option value="Engineering">{lang === 'ar' ? 'الهندسة' : 'Engineering'}</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {(formData.role === 'lecturer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('department', lang)}
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="">-- {lang === 'ar' ? 'اختر القسم' : 'Select Department'} --</option>
                    <option value="Computer Science">{lang === 'ar' ? 'علوم الحاسوب' : 'Computer Science'}</option>
                    <option value="Mathematics">{lang === 'ar' ? 'الرياضيات' : 'Mathematics'}</option>
                    <option value="Physics">{lang === 'ar' ? 'الفيزياء' : 'Physics'}</option>
                    <option value="Business">{lang === 'ar' ? 'إدارة الأعمال' : 'Business'}</option>
                    <option value="Engineering">{lang === 'ar' ? 'الهندسة' : 'Engineering'}</option>
                  </select>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('status', lang)}
                </label>
                <div className="flex gap-4">
                  {(['active', 'inactive', 'suspended'] as const).map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={formData.status === status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status].bgColor} ${statusConfig[status].color}`}>
                        {t(status, lang)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('save', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('bulkDelete', lang)}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('bulkDeleteConfirm', lang)}
              <br />
              <span className="font-semibold text-red-600">
                {selectedUsers.length} {t('selected', lang)}
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkDeleting}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {lang === 'ar' ? 'جاري الحذف...' : 'Deleting...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t('delete', lang)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

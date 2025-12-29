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
} from 'lucide-react';

interface Props {
  lang: 'en' | 'ar';
}

interface UserAccount {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  role: 'admin' | 'student' | 'lecturer' | 'finance';
  studentId?: string;
  department?: string;
  program?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

const translations = {
  title: { en: 'User Management', ar: 'إدارة المستخدمين' },
  subtitle: { en: 'Create and manage user accounts', ar: 'إنشاء وإدارة حسابات المستخدمين' },
  addUser: { en: 'Add New User', ar: 'إضافة مستخدم جديد' },
  search: { en: 'Search users...', ar: 'البحث عن المستخدمين...' },
  allRoles: { en: 'All Roles', ar: 'كل الأدوار' },
  admin: { en: 'Admin', ar: 'مدير النظام' },
  student: { en: 'Student', ar: 'طالب' },
  lecturer: { en: 'Lecturer', ar: 'محاضر' },
  finance: { en: 'Finance', ar: 'مالية' },
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
};

const t = (key: keyof typeof translations, lang: 'en' | 'ar') => translations[key][lang];

// Initial mock users
const initialUsers: UserAccount[] = [
  {
    id: '1',
    email: 'admin@university.edu',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01',
    lastLogin: '2024-12-25',
  },
  {
    id: '2',
    email: 'ahmed.mansour@student.university.edu',
    firstName: 'Ahmed',
    lastName: 'Mansour',
    firstNameAr: 'أحمد',
    lastNameAr: 'منصور',
    role: 'student',
    studentId: 'STU-2024-001',
    program: 'Computer Science',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-12-24',
  },
  {
    id: '3',
    email: 'sarah.smith@university.edu',
    firstName: 'Sarah',
    lastName: 'Smith',
    role: 'lecturer',
    department: 'Computer Science',
    status: 'active',
    createdAt: '2024-01-10',
    lastLogin: '2024-12-23',
  },
  {
    id: '4',
    email: 'finance@university.edu',
    firstName: 'Finance',
    lastName: 'Officer',
    role: 'finance',
    status: 'active',
    createdAt: '2024-01-05',
    lastLogin: '2024-12-22',
  },
];

const UserManagement: React.FC<Props> = ({ lang }) => {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    role: 'student' as 'admin' | 'student' | 'lecturer' | 'finance',
    studentId: '',
    department: '',
    program: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const num = String(users.filter(u => u.role === 'student').length + 1).padStart(3, '0');
    return `STU-${year}-${num}`;
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

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingUser) {
      // Update existing user
      setUsers(users.map(u =>
        u.id === editingUser.id
          ? {
              ...u,
              ...formData,
              password: formData.password || u.password
            }
          : u
      ));
      showNotification('success', t('userUpdated', lang));
    } else {
      // Create new user
      const newUser: UserAccount = {
        id: String(Date.now()),
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        firstNameAr: formData.firstNameAr,
        lastNameAr: formData.lastNameAr,
        role: formData.role,
        studentId: formData.role === 'student' ? formData.studentId : undefined,
        department: formData.role === 'lecturer' ? formData.department : undefined,
        program: formData.role === 'student' ? formData.program : undefined,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      showNotification('success', t('userCreated', lang));
    }

    resetForm();
    setShowModal(false);
  };

  const handleEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      confirmPassword: '',
      firstName: user.firstName,
      lastName: user.lastName,
      firstNameAr: user.firstNameAr || '',
      lastNameAr: user.lastNameAr || '',
      role: user.role,
      studentId: user.studentId || '',
      department: user.department || '',
      program: user.program || '',
      status: user.status,
    });
    setShowModal(true);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    setDeleteConfirm(null);
    showNotification('success', t('userDeleted', lang));
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
      status: 'active',
    });
    setEditingUser(null);
    setErrors({});
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
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.studentId?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'lecturer': return <Briefcase className="w-4 h-4" />;
      case 'finance': return <DollarSign className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'student': return 'bg-blue-100 text-blue-700';
      case 'lecturer': return 'bg-green-100 text-green-700';
      case 'finance': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    students: users.filter(u => u.role === 'student').length,
    lecturers: users.filter(u => u.role === 'lecturer').length,
    finance: users.filter(u => u.role === 'finance').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title', lang)}</h1>
          <p className="text-gray-600">{t('subtitle', lang)}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('addUser', lang)}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('totalUsers', lang)}</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('admin', lang)}</p>
              <p className="text-xl font-bold text-purple-600">{stats.admins}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('student', lang)}</p>
              <p className="text-xl font-bold text-blue-600">{stats.students}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('lecturer', lang)}</p>
              <p className="text-xl font-bold text-green-600">{stats.lecturers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('finance', lang)}</p>
              <p className="text-xl font-bold text-yellow-600">{stats.finance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
            <input
              type="text"
              placeholder={t('search', lang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{t('allRoles', lang)}</option>
            <option value="admin">{t('admin', lang)}</option>
            <option value="student">{t('student', lang)}</option>
            <option value="lecturer">{t('lecturer', lang)}</option>
            <option value="finance">{t('finance', lang)}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-4 py-3 ${lang === 'ar' ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>
                  {t('email', lang)}
                </th>
                <th className={`px-4 py-3 ${lang === 'ar' ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>
                  {lang === 'ar' ? 'الاسم' : 'Name'}
                </th>
                <th className={`px-4 py-3 ${lang === 'ar' ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>
                  {t('role', lang)}
                </th>
                <th className={`px-4 py-3 ${lang === 'ar' ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>
                  {t('status', lang)}
                </th>
                <th className={`px-4 py-3 ${lang === 'ar' ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>
                  {t('createdAt', lang)}
                </th>
                <th className={`px-4 py-3 ${lang === 'ar' ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>
                  {t('actions', lang)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {t('noUsers', lang)}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.firstNameAr && (
                          <p className="text-xs text-gray-500">
                            {user.firstNameAr} {user.lastNameAr}
                          </p>
                        )}
                        {user.studentId && (
                          <p className="text-xs text-blue-600">{user.studentId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {t(user.role, lang)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {t(user.status, lang)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('edit', lang)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingUser ? t('editUser', lang) : t('createUser', lang)}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('role', lang)} *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['admin', 'student', 'lecturer', 'finance'] as const).map((role) => (
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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={getRoleColor(role) + ' p-2 rounded-full'}>
                        {getRoleIcon(role)}
                      </span>
                      <span className="text-sm font-medium">{t(role, lang)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email', lang)} *
                  </label>
                  <div className="relative">
                    <Mail className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('password', lang)} {!editingUser && '*'}
                  </label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <Lock className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={editingUser ? (lang === 'ar' ? 'اتركه فارغاً للإبقاء' : 'Leave empty to keep') : ''}
                        className={`w-full ${lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title={t('generatePassword', lang)}
                    >
                      <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>

              {/* Confirm Password */}
              {formData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('confirmPassword', lang)} *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('firstName', lang)} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('lastName', lang)} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Arabic Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('firstNameAr', lang)}
                  </label>
                  <input
                    type="text"
                    value={formData.firstNameAr}
                    onChange={(e) => setFormData({ ...formData, firstNameAr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('lastNameAr', lang)}
                  </label>
                  <input
                    type="text"
                    value={formData.lastNameAr}
                    onChange={(e) => setFormData({ ...formData, lastNameAr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              {formData.role === 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('studentId', lang)} *
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.studentId ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('program', lang)}
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- {lang === 'ar' ? 'اختر البرنامج' : 'Select Program'} --</option>
                      <option value="Computer Science">{lang === 'ar' ? 'علوم الحاسوب' : 'Computer Science'}</option>
                      <option value="Information Technology">{lang === 'ar' ? 'تقنية المعلومات' : 'Information Technology'}</option>
                      <option value="Business Administration">{lang === 'ar' ? 'إدارة الأعمال' : 'Business Administration'}</option>
                      <option value="Engineering">{lang === 'ar' ? 'الهندسة' : 'Engineering'}</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.role === 'lecturer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('department', lang)}
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- {lang === 'ar' ? 'اختر القسم' : 'Select Department'} --</option>
                    <option value="Computer Science">{lang === 'ar' ? 'علوم الحاسوب' : 'Computer Science'}</option>
                    <option value="Mathematics">{lang === 'ar' ? 'الرياضيات' : 'Mathematics'}</option>
                    <option value="Physics">{lang === 'ar' ? 'الفيزياء' : 'Physics'}</option>
                    <option value="Business">{lang === 'ar' ? 'إدارة الأعمال' : 'Business'}</option>
                  </select>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {t(status, lang)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
    </div>
  );
};

export default UserManagement;

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Users,
  Key,
  Copy,
  Search,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calculator,
  ClipboardList,
  Settings,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react';
import { rolesAPI, Role, Permission, SYSTEM_MODULES, DEFAULT_ROLES } from '../../api/roles';

interface Props {
  lang: 'en' | 'ar';
}

const translations = {
  title: { en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' },
  subtitle: { en: 'Manage user roles and their permissions', ar: 'إدارة أدوار المستخدمين وصلاحياتهم' },
  roles: { en: 'Roles', ar: 'الأدوار' },
  permissions: { en: 'Permissions', ar: 'الصلاحيات' },
  addRole: { en: 'Add New Role', ar: 'إضافة دور جديد' },
  editRole: { en: 'Edit Role', ar: 'تعديل الدور' },
  deleteRole: { en: 'Delete Role', ar: 'حذف الدور' },
  duplicateRole: { en: 'Duplicate Role', ar: 'نسخ الدور' },
  roleName: { en: 'Role Name (English)', ar: 'اسم الدور (إنجليزي)' },
  roleNameAr: { en: 'Role Name (Arabic)', ar: 'اسم الدور (عربي)' },
  description: { en: 'Description', ar: 'الوصف' },
  descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (عربي)' },
  color: { en: 'Color', ar: 'اللون' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  systemRole: { en: 'System Role', ar: 'دور نظامي' },
  customRole: { en: 'Custom Role', ar: 'دور مخصص' },
  usersCount: { en: 'Users', ar: 'المستخدمين' },
  noRoles: { en: 'No roles found', ar: 'لا توجد أدوار' },
  confirmDelete: { en: 'Are you sure you want to delete this role?', ar: 'هل أنت متأكد من حذف هذا الدور؟' },
  cannotDeleteSystem: { en: 'System roles cannot be deleted', ar: 'لا يمكن حذف الأدوار النظامية' },
  roleCreated: { en: 'Role created successfully', ar: 'تم إنشاء الدور بنجاح' },
  roleUpdated: { en: 'Role updated successfully', ar: 'تم تحديث الدور بنجاح' },
  roleDeleted: { en: 'Role deleted successfully', ar: 'تم حذف الدور بنجاح' },
  selectPermissions: { en: 'Select Permissions', ar: 'اختر الصلاحيات' },
  allPermissions: { en: 'All Permissions', ar: 'كل الصلاحيات' },
  noPermissions: { en: 'No permissions assigned', ar: 'لا توجد صلاحيات' },
  module: { en: 'Module', ar: 'الوحدة' },
  search: { en: 'Search roles...', ar: 'البحث عن الأدوار...' },
  view: { en: 'View', ar: 'عرض' },
  create: { en: 'Create', ar: 'إنشاء' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  manage: { en: 'Manage', ar: 'إدارة' },
  approve: { en: 'Approve', ar: 'موافقة' },
  reject: { en: 'Reject', ar: 'رفض' },
  export: { en: 'Export', ar: 'تصدير' },
  reports: { en: 'Reports', ar: 'التقارير' },
  record: { en: 'Record', ar: 'تسجيل' },
  grades: { en: 'Grades', ar: 'الدرجات' },
};

const t = (key: keyof typeof translations, lang: 'en' | 'ar') => translations[key][lang];

// Module translations
const moduleTranslations: Record<string, { en: string; ar: string }> = {
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  students: { en: 'Students', ar: 'الطلاب' },
  courses: { en: 'Courses', ar: 'المقررات' },
  registration: { en: 'Registration', ar: 'التسجيل' },
  finance: { en: 'Finance', ar: 'المالية' },
  admissions: { en: 'Admissions', ar: 'القبول' },
  study_plans: { en: 'Study Plans', ar: 'الخطط الدراسية' },
  exams: { en: 'Exams', ar: 'الاختبارات' },
  attendance: { en: 'Attendance', ar: 'الحضور' },
  schedule: { en: 'Schedule', ar: 'الجدول' },
  reports: { en: 'Reports', ar: 'التقارير' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  users: { en: 'Users', ar: 'المستخدمين' },
  roles: { en: 'Roles', ar: 'الأدوار' },
};

// Permission translations
const permissionTranslations: Record<string, { en: string; ar: string }> = {
  view: { en: 'View', ar: 'عرض' },
  create: { en: 'Create', ar: 'إنشاء' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  manage: { en: 'Manage', ar: 'إدارة' },
  approve: { en: 'Approve', ar: 'موافقة' },
  reject: { en: 'Reject', ar: 'رفض' },
  export: { en: 'Export', ar: 'تصدير' },
  reports: { en: 'Reports', ar: 'التقارير' },
  record: { en: 'Record', ar: 'تسجيل' },
  grades: { en: 'Grades', ar: 'الدرجات' },
  // Student permissions
  upload_documents: { en: 'Upload Documents', ar: 'رفع المستندات' },
  fix_errors: { en: 'Fix Errors', ar: 'تصحيح الأخطاء' },
  // Registration permissions
  add_course: { en: 'Add Course', ar: 'إضافة مساق' },
  drop_course: { en: 'Drop Course', ar: 'حذف مساق' },
  change_section: { en: 'Change Section', ar: 'تغيير الشعبة' },
  late_registration: { en: 'Late Registration', ar: 'التسجيل المتأخر' },
  open_close_registration: { en: 'Open/Close Registration', ar: 'فتح/إغلاق التسجيل' },
  // Admissions permissions
  set_admission_year: { en: 'Set Admission Year', ar: 'تحديد سنة القبول' },
  set_admission_type: { en: 'Set Admission Type', ar: 'تحديد نوع القبول' },
  // Study plans permissions
  assign: { en: 'Assign Plan', ar: 'ربط الخطة' },
  transfer_major: { en: 'Transfer Major', ar: 'تحويل التخصص' },
  restructure: { en: 'Restructure', ar: 'إعادة الهيكلة' },
  track_progress: { en: 'Track Progress', ar: 'متابعة الإنجاز' },
};

const getRoleIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Shield': return Shield;
    case 'GraduationCap': return GraduationCap;
    case 'BookOpen': return BookOpen;
    case 'DollarSign': return DollarSign;
    case 'Users': return Users;
    case 'Calculator': return Calculator;
    case 'ClipboardList': return ClipboardList;
    case 'Settings': return Settings;
    default: return Key;
  }
};

const ROLE_COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899',
  '#14B8A6', '#6366F1', '#EF4444', '#84CC16', '#06B6D4',
];

const RolesPermissions: React.FC<Props> = ({ lang }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    color: ROLE_COLORS[0],
    icon: 'Key',
    permissions: {} as Record<string, string[]>,
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await rolesAPI.getAll();
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0]);
      }
    } catch (error) {
      // If API fails, use default roles for display
      const defaultRoles = DEFAULT_ROLES.map((role, index) => ({
        ...role,
        id: index + 1,
        permissions: [],
        usersCount: 0,
        createdAt: new Date().toISOString(),
      })) as Role[];
      setRoles(defaultRoles);
      if (defaultRoles.length > 0) {
        setSelectedRole(defaultRoles[0]);
      }
    }
    setLoading(false);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      color: ROLE_COLORS[Math.floor(Math.random() * ROLE_COLORS.length)],
      icon: 'Key',
      permissions: {},
    });
    setShowModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    // Convert permissions array to module-based object
    const permissionsMap: Record<string, string[]> = {};
    role.permissions.forEach(p => {
      const [module, action] = p.name.split('.');
      if (!permissionsMap[module]) permissionsMap[module] = [];
      permissionsMap[module].push(action);
    });

    setFormData({
      name: role.name,
      nameAr: role.nameAr,
      description: role.description || '',
      descriptionAr: role.descriptionAr || '',
      color: role.color || ROLE_COLORS[0],
      icon: role.icon || 'Key',
      permissions: permissionsMap,
    });
    setShowModal(true);
  };

  const handleSaveRole = async () => {
    if (!formData.name || !formData.nameAr) {
      showNotification('error', lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      // Convert permissions object to flat array of IDs (mock for now)
      const permissionIds: number[] = [];
      Object.entries(formData.permissions).forEach(([module, actions]) => {
        actions.forEach((action, idx) => {
          permissionIds.push(parseInt(`${SYSTEM_MODULES.findIndex(m => m.id === module)}${idx}`));
        });
      });

      if (editingRole) {
        await rolesAPI.update(editingRole.id, {
          name: formData.name,
          nameAr: formData.nameAr,
          description: formData.description,
          descriptionAr: formData.descriptionAr,
          color: formData.color,
          icon: formData.icon,
          permissionIds,
        });
        showNotification('success', t('roleUpdated', lang));
      } else {
        await rolesAPI.create({
          name: formData.name,
          nameAr: formData.nameAr,
          description: formData.description,
          descriptionAr: formData.descriptionAr,
          color: formData.color,
          icon: formData.icon,
          permissionIds,
        });
        showNotification('success', t('roleCreated', lang));
      }
      loadRoles();
      setShowModal(false);
    } catch (error) {
      // For demo, just update local state
      if (editingRole) {
        setRoles(roles.map(r => r.id === editingRole.id ? {
          ...r,
          name: formData.name,
          nameAr: formData.nameAr,
          description: formData.description,
          descriptionAr: formData.descriptionAr,
          color: formData.color,
          icon: formData.icon,
        } : r));
        showNotification('success', t('roleUpdated', lang));
      } else {
        const newRole: Role = {
          id: Date.now(),
          name: formData.name,
          nameAr: formData.nameAr,
          description: formData.description,
          descriptionAr: formData.descriptionAr,
          color: formData.color,
          icon: formData.icon,
          isSystem: false,
          permissions: [],
          usersCount: 0,
        };
        setRoles([...roles, newRole]);
        showNotification('success', t('roleCreated', lang));
      }
      setShowModal(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      showNotification('error', t('cannotDeleteSystem', lang));
      return;
    }

    try {
      await rolesAPI.delete(roleId);
      showNotification('success', t('roleDeleted', lang));
      loadRoles();
    } catch (error) {
      // For demo, just update local state
      setRoles(roles.filter(r => r.id !== roleId));
      showNotification('success', t('roleDeleted', lang));
    }
    setDeleteConfirm(null);
    if (selectedRole?.id === roleId) {
      setSelectedRole(roles.find(r => r.id !== roleId) || null);
    }
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const togglePermission = (moduleId: string, permission: string) => {
    setFormData(prev => {
      const modulePermissions = prev.permissions[moduleId] || [];
      const newPermissions = modulePermissions.includes(permission)
        ? modulePermissions.filter(p => p !== permission)
        : [...modulePermissions, permission];

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: newPermissions,
        },
      };
    });
  };

  const toggleAllModulePermissions = (moduleId: string, allPermissions: string[]) => {
    setFormData(prev => {
      const currentPermissions = prev.permissions[moduleId] || [];
      const allSelected = allPermissions.every(p => currentPermissions.includes(p));

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: allSelected ? [] : allPermissions,
        },
      };
    });
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.nameAr.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 ${lang === 'ar' ? 'start-4' : 'end-4'} z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
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
            <Shield className="w-7 h-7 text-purple-600" />
            {t('title', lang)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('subtitle', lang)}</p>
        </div>
        <button
          onClick={handleCreateRole}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('addRole', lang)}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <Search className={`absolute ${lang === 'ar' ? 'end-3' : 'start-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
              <input
                type="text"
                placeholder={t('search', lang)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${lang === 'ar' ? 'pe-10 ps-4' : 'ps-10 pe-4'} py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
            {filteredRoles.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {t('noRoles', lang)}
              </div>
            ) : (
              filteredRoles.map((role) => {
                const IconComponent = getRoleIcon(role.icon);
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRole?.id === role.id
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-r-4 border-purple-600'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${role.color}20` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: role.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {lang === 'ar' ? role.nameAr : role.name}
                          </h3>
                          {role.isSystem && (
                            <Lock className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            <Users className="w-3 h-3 inline me-1" />
                            {role.usersCount || 0} {t('usersCount', lang)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Role Details */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          {selectedRole ? (
            <>
              <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedRole.color}20` }}
                    >
                      {React.createElement(getRoleIcon(selectedRole.icon), {
                        className: 'w-7 h-7',
                        style: { color: selectedRole.color },
                      })}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {lang === 'ar' ? selectedRole.nameAr : selectedRole.name}
                        {selectedRole.isSystem && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full">
                            {t('systemRole', lang)}
                          </span>
                        )}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {lang === 'ar' ? selectedRole.descriptionAr : selectedRole.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditRole(selectedRole)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={t('edit', lang)}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {/* Duplicate logic */}}
                      className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title={t('duplicateRole', lang)}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    {!selectedRole.isSystem && (
                      deleteConfirm === selectedRole.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteRole(selectedRole.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(selectedRole.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('delete', lang)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  {t('permissions', lang)}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SYSTEM_MODULES.map((module) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {moduleTranslations[module.id]?.[lang] || module.name}
                      </div>
                      <div className="p-3 flex flex-wrap gap-2">
                        {module.permissions.map((perm) => {
                          const hasPermission = selectedRole.permissions.some(
                            p => p.name === `${module.id}.${perm}`
                          ) || selectedRole.name === 'admin';

                          return (
                            <span
                              key={perm}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                hasPermission
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-400 dark:bg-slate-600 dark:text-gray-500'
                              }`}
                            >
                              {hasPermission ? (
                                <Check className="w-3 h-3 inline me-1" />
                              ) : (
                                <X className="w-3 h-3 inline me-1" />
                              )}
                              {permissionTranslations[perm]?.[lang] || perm}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>{lang === 'ar' ? 'اختر دوراً لعرض التفاصيل' : 'Select a role to view details'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingRole ? t('editRole', lang) : t('addRole', lang)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Role Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('roleName', lang)} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="e.g. student_affairs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('roleNameAr', lang)} *
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    dir="rtl"
                    placeholder="مثال: شؤون الطلاب"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('description', lang)}
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('descriptionAr', lang)}
                  </label>
                  <input
                    type="text"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('color', lang)}
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Permissions Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectPermissions', lang)}
                </label>
                <div className="border border-gray-200 dark:border-slate-600 rounded-lg divide-y divide-gray-200 dark:divide-slate-600">
                  {SYSTEM_MODULES.map((module) => {
                    const modulePermissions = formData.permissions[module.id] || [];
                    const allSelected = module.permissions.every(p => modulePermissions.includes(p));
                    const someSelected = module.permissions.some(p => modulePermissions.includes(p));
                    const isExpanded = expandedModules.includes(module.id);

                    return (
                      <div key={module.id}>
                        <div
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                          onClick={() => toggleModuleExpand(module.id)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {moduleTranslations[module.id]?.[lang] || module.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {modulePermissions.length}/{module.permissions.length}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAllModulePermissions(module.id, module.permissions);
                              }}
                              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                                allSelected
                                  ? 'bg-purple-600 text-white'
                                  : someSelected
                                  ? 'bg-purple-200 text-purple-600'
                                  : 'bg-gray-200 dark:bg-slate-600'
                              }`}
                            >
                              {allSelected && <Check className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 flex flex-wrap gap-2">
                            {module.permissions.map((perm) => {
                              const isSelected = modulePermissions.includes(perm);
                              return (
                                <button
                                  key={perm}
                                  onClick={() => togglePermission(module.id, perm)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    isSelected
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-500 hover:border-purple-400'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 inline me-1" />}
                                  {permissionTranslations[perm]?.[lang] || perm}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

export default RolesPermissions;

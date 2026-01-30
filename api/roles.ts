import apiClient from './client';

export interface Permission {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  module: string;
  createdAt?: string;
}

export interface Role {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  color?: string;
  icon?: string;
  isSystem: boolean;
  permissions: Permission[];
  usersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleData {
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  color?: string;
  icon?: string;
  permissionIds: number[];
}

export interface UpdateRoleData {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  color?: string;
  icon?: string;
  permissionIds?: number[];
}

// System modules and their permissions
export const SYSTEM_MODULES = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    nameAr: 'لوحة التحكم',
    permissions: ['view'],
  },
  {
    id: 'students',
    name: 'Students',
    nameAr: 'الطلاب',
    permissions: ['view', 'create', 'edit', 'delete', 'export', 'upload_documents', 'fix_errors'],
  },
  {
    id: 'courses',
    name: 'Courses',
    nameAr: 'المقررات',
    permissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'registration',
    name: 'Registration',
    nameAr: 'التسجيل',
    permissions: ['view', 'manage', 'approve', 'add_course', 'drop_course', 'change_section', 'late_registration', 'open_close_registration'],
  },
  {
    id: 'finance',
    name: 'Finance',
    nameAr: 'المالية',
    permissions: ['view', 'create', 'edit', 'delete', 'approve', 'reports'],
  },
  {
    id: 'admissions',
    name: 'Admissions',
    nameAr: 'القبول',
    permissions: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'set_admission_year', 'set_admission_type'],
  },
  {
    id: 'study_plans',
    name: 'Study Plans',
    nameAr: 'الخطط الدراسية',
    permissions: ['view', 'assign', 'edit', 'transfer_major', 'restructure', 'track_progress'],
  },
  {
    id: 'exams',
    name: 'Exams',
    nameAr: 'الاختبارات',
    permissions: ['view', 'create', 'edit', 'delete', 'grades'],
  },
  {
    id: 'attendance',
    name: 'Attendance',
    nameAr: 'الحضور',
    permissions: ['view', 'record', 'edit', 'reports'],
  },
  {
    id: 'schedule',
    name: 'Schedule',
    nameAr: 'الجدول',
    permissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'reports',
    name: 'Reports',
    nameAr: 'التقارير',
    permissions: ['view', 'create', 'export'],
  },
  {
    id: 'settings',
    name: 'Settings',
    nameAr: 'الإعدادات',
    permissions: ['view', 'edit'],
  },
  {
    id: 'users',
    name: 'Users',
    nameAr: 'المستخدمين',
    permissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'roles',
    name: 'Roles',
    nameAr: 'الأدوار',
    permissions: ['view', 'create', 'edit', 'delete'],
  },
];

// Default permissions for student_affairs role
export const STUDENT_AFFAIRS_PERMISSIONS = {
  students: ['view', 'create', 'edit', 'upload_documents', 'fix_errors'],
  admissions: ['view', 'create', 'edit', 'approve', 'reject', 'set_admission_year', 'set_admission_type'],
  registration: ['view', 'manage', 'approve', 'add_course', 'drop_course', 'change_section', 'late_registration', 'open_close_registration'],
  study_plans: ['view', 'assign', 'edit', 'transfer_major', 'restructure', 'track_progress'],
  dashboard: ['view'],
  reports: ['view', 'export'],
};

// Default system roles
export const DEFAULT_ROLES: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'admin',
    nameAr: 'مدير النظام',
    description: 'Full system access',
    descriptionAr: 'صلاحيات كاملة للنظام',
    color: '#8B5CF6',
    icon: 'Shield',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'student',
    nameAr: 'طالب',
    description: 'Student access',
    descriptionAr: 'صلاحيات الطالب',
    color: '#3B82F6',
    icon: 'GraduationCap',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'lecturer',
    nameAr: 'محاضر',
    description: 'Lecturer/Faculty access',
    descriptionAr: 'صلاحيات المحاضر',
    color: '#10B981',
    icon: 'BookOpen',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'finance',
    nameAr: 'المالية',
    description: 'Finance department access',
    descriptionAr: 'صلاحيات القسم المالي',
    color: '#F59E0B',
    icon: 'DollarSign',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'student_affairs',
    nameAr: 'شؤون الطلاب',
    description: 'Student affairs - Manage student records, admissions, registration, and study plans',
    descriptionAr: 'شؤون الطلاب - إدارة ملفات الطلاب، القبول، التسجيل، والخطط الدراسية',
    color: '#EC4899',
    icon: 'Users',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'accountant',
    nameAr: 'محاسب',
    description: 'Accountant access',
    descriptionAr: 'صلاحيات المحاسب',
    color: '#14B8A6',
    icon: 'Calculator',
    isSystem: false,
    permissions: [],
  },
  {
    name: 'registrar',
    nameAr: 'مسجل',
    description: 'Registrar access',
    descriptionAr: 'صلاحيات المسجل',
    color: '#6366F1',
    icon: 'ClipboardList',
    isSystem: false,
    permissions: [],
  },
];

export const rolesAPI = {
  // Get all roles
  getAll: async (): Promise<Role[]> => {
    const response = await apiClient.get('/roles');
    return response.data;
  },

  // Get single role
  getById: async (id: number): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  // Create new role
  create: async (data: CreateRoleData): Promise<Role> => {
    const response = await apiClient.post('/roles', {
      name: data.name,
      name_ar: data.nameAr,
      description: data.description,
      description_ar: data.descriptionAr,
      color: data.color,
      icon: data.icon,
      permission_ids: data.permissionIds,
    });
    return response.data;
  },

  // Update role
  update: async (id: number, data: UpdateRoleData): Promise<Role> => {
    const payload: any = {};
    if (data.name) payload.name = data.name;
    if (data.nameAr) payload.name_ar = data.nameAr;
    if (data.description !== undefined) payload.description = data.description;
    if (data.descriptionAr !== undefined) payload.description_ar = data.descriptionAr;
    if (data.color) payload.color = data.color;
    if (data.icon) payload.icon = data.icon;
    if (data.permissionIds) payload.permission_ids = data.permissionIds;

    const response = await apiClient.put(`/roles/${id}`, payload);
    return response.data;
  },

  // Delete role
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  // Get all permissions
  getPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get('/permissions');
    return response.data;
  },

  // Get permissions by module
  getPermissionsByModule: async (module: string): Promise<Permission[]> => {
    const response = await apiClient.get(`/permissions?module=${module}`);
    return response.data;
  },

  // Assign permissions to role
  assignPermissions: async (roleId: number, permissionIds: number[]): Promise<Role> => {
    const response = await apiClient.post(`/roles/${roleId}/permissions`, {
      permission_ids: permissionIds,
    });
    return response.data;
  },

  // Remove permissions from role
  removePermissions: async (roleId: number, permissionIds: number[]): Promise<Role> => {
    const response = await apiClient.delete(`/roles/${roleId}/permissions`, {
      data: { permission_ids: permissionIds },
    });
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (roleId: number): Promise<any[]> => {
    const response = await apiClient.get(`/roles/${roleId}/users`);
    return response.data;
  },

  // Duplicate role
  duplicate: async (id: number, newName: string, newNameAr: string): Promise<Role> => {
    const response = await apiClient.post(`/roles/${id}/duplicate`, {
      name: newName,
      name_ar: newNameAr,
    });
    return response.data;
  },
};

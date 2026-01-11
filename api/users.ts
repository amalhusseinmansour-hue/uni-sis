import apiClient from './client';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  role: string;
  roleId?: number;
  studentId?: string;
  department?: string;
  program?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  role: string;
  roleId?: number;
  studentId?: string;
  department?: string;
  program?: string;
  status?: 'active' | 'inactive' | 'suspended';
  phone?: string;
  profilePicture?: string; // Base64 encoded image for student ID card
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  role?: string;
  roleId?: number;
  studentId?: string;
  department?: string;
  program?: string;
  status?: 'active' | 'inactive' | 'suspended';
  phone?: string;
  profilePicture?: string; // Base64 encoded image for student ID card
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  perPage: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export const usersAPI = {
  // Get all users with filters
  getAll: async (filters?: UserFilters): Promise<UsersResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.perPage) params.append('per_page', String(filters.perPage));

    const response = await apiClient.get(`/users?${params.toString()}`);
    return response.data;
  },

  // Get single user
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  create: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post('/users', {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      first_name_ar: data.firstNameAr,
      last_name_ar: data.lastNameAr,
      role: data.role,
      role_id: data.roleId,
      student_id: data.studentId,
      department: data.department,
      program: data.program,
      status: data.status || 'active',
      phone: data.phone,
      avatar: data.profilePicture,
    });
    return response.data;
  },

  // Update user
  update: async (id: number, data: UpdateUserData): Promise<User> => {
    const payload: any = {};
    if (data.email) payload.email = data.email;
    if (data.password) payload.password = data.password;
    if (data.firstName) payload.first_name = data.firstName;
    if (data.lastName) payload.last_name = data.lastName;
    if (data.firstNameAr !== undefined) payload.first_name_ar = data.firstNameAr;
    if (data.lastNameAr !== undefined) payload.last_name_ar = data.lastNameAr;
    if (data.role) payload.role = data.role;
    if (data.roleId) payload.role_id = data.roleId;
    if (data.studentId !== undefined) payload.student_id = data.studentId;
    if (data.department !== undefined) payload.department = data.department;
    if (data.program !== undefined) payload.program = data.program;
    if (data.status) payload.status = data.status;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.profilePicture) payload.avatar = data.profilePicture;

    const response = await apiClient.put(`/users/${id}`, payload);
    return response.data;
  },

  // Delete user
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Bulk delete users
  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.post('/users/bulk-delete', { ids });
  },

  // Change user status
  changeStatus: async (id: number, status: 'active' | 'inactive' | 'suspended'): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  // Reset user password
  resetPassword: async (id: number, newPassword: string): Promise<void> => {
    await apiClient.post(`/users/${id}/reset-password`, { password: newPassword });
  },

  // Get user statistics
  getStats: async (): Promise<{
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    recentlyActive: number;
  }> => {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },

  // Export users to Excel
  export: async (filters?: UserFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`/users/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Import users from Excel
  import: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

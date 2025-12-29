import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Mock users for testing when backend is not available
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@university.edu',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    avatar: null,
  },
  {
    id: '2',
    email: 'ahmed.mansour@student.university.edu',
    password: 'student123',
    firstName: 'Ahmed',
    lastName: 'Mansour',
    firstNameAr: 'أحمد',
    lastNameAr: 'منصور',
    role: 'STUDENT',
    studentId: 'STU-2024-001',
    program: 'Computer Science',
    level: 3,
    gpa: 3.75,
    avatar: null,
  },
  {
    id: '3',
    email: 'sarah.smith@university.edu',
    password: 'lecturer123',
    firstName: 'Sarah',
    lastName: 'Smith',
    role: 'LECTURER',
    department: 'Computer Science',
    avatar: null,
  },
  {
    id: '4',
    email: 'finance@university.edu',
    password: 'finance123',
    firstName: 'Finance',
    lastName: 'Officer',
    role: 'FINANCE',
    avatar: null,
  },
];

// Check if we should use mock data (when backend is unavailable)
const USE_MOCK = true; // Set to true only for testing without backend

export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials) => {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = MOCK_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!user) {
        throw { response: { data: { error: 'Invalid email or password' } } };
      }

      const { password, ...userWithoutPassword } = user;
      const token = 'mock-jwt-token-' + user.id;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      return { user: userWithoutPassword, token };
    }

    const response = await apiClient.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register (not available in backend yet)
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/user');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/change-password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      // Ignore errors during logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

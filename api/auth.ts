import apiClient from './client';

export interface LoginCredentials {
  username: string; // Can be email or student_id
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authAPI = {
  // Login - connects to real backend
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/login', credentials);

    // Handle response - might be string or object
    let data = response.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        // Keep as is if parsing fails
      }
    }

    if (data && data.token) {
      // SECURITY: Store token in sessionStorage instead of localStorage
      // sessionStorage is cleared when tab closes, reducing attack window
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      // Also keep in localStorage for persistence (user preference)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
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
    // SECURITY: Clear both storage types
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Then try to invalidate token on server (mandatory for security)
    try {
      await apiClient.post('/logout');
    } catch {
      // Server logout failed but local storage is cleared
    }
  },
};

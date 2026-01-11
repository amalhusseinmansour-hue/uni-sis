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
    console.log('[Auth] ========== LOGIN START ==========');
    console.log('[Auth] Login request for:', credentials.username);
    console.log('[Auth] API URL:', import.meta.env.VITE_API_URL);

    try {
      const response = await apiClient.post('/login', credentials);
      console.log('[Auth] Raw axios response:', response);
      console.log('[Auth] response.status:', response.status);
      console.log('[Auth] response.data type:', typeof response.data);
      console.log('[Auth] response.data value:', response.data);
      console.log('[Auth] response.data stringified:', JSON.stringify(response.data));

      // Handle response - might be string or object
      let data = response.data;
      if (typeof data === 'string') {
        console.log('[Auth] Data is string, parsing...');
        try {
          data = JSON.parse(data);
          console.log('[Auth] Parsed JSON:', data);
        } catch (e) {
          console.error('[Auth] JSON parse error:', e);
        }
      }

      console.log('[Auth] Final data object:', data);
      console.log('[Auth] data.token exists:', !!data?.token);
      console.log('[Auth] data.user exists:', !!data?.user);

      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('[Auth] SUCCESS: Stored token and user in localStorage');
        console.log('[Auth] Returning data with user:', data.user?.name || data.user?.email);
      } else {
        console.error('[Auth] FAILED: No token in response!');
        console.error('[Auth] data:', data);
        console.error('[Auth] Object.keys(data):', data ? Object.keys(data) : 'data is null/undefined');
      }
      console.log('[Auth] ========== LOGIN END ==========');
      return data;
    } catch (error: any) {
      console.error('[Auth] ========== LOGIN ERROR ==========');
      console.error('[Auth] Error object:', error);
      console.error('[Auth] Error message:', error.message);
      console.error('[Auth] Error response:', error.response);
      console.error('[Auth] Error response data:', error.response?.data);
      throw error;
    }
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
    // Clear local storage first to ensure immediate logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Then try to invalidate token on server (optional, ignore errors)
    try {
      await apiClient.post('/logout');
    } catch (error) {
      // Ignore errors during logout - user is already logged out locally
    }
  },
};

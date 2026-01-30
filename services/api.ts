import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admission APIs
export const admissionApi = {
  // Submit application
  submitApplication: async (data: {
    fullName: string;
    email: string;
    phone: string;
    nationalId: string;
    dateOfBirth: string;
    address: string;
    highSchoolScore: number;
    programId?: string;
  }) => {
    const response = await api.post('/admissions/apply', data);
    return response.data;
  },

  // Get all applications (admin only)
  getAllApplications: async (status?: string) => {
    const response = await api.get('/admissions', { params: { status } });
    return response.data;
  },

  // Get application by ID
  getApplicationById: async (id: string) => {
    const response = await api.get(`/admissions/${id}`);
    return response.data;
  },

  // Update application status
  updateStatus: async (id: string, status: string, comments?: string) => {
    const response = await api.patch(`/admissions/${id}/status`, {
      status,
      comments,
    });
    return response.data;
  },

  // Get application stats
  getStats: async () => {
    const response = await api.get('/admissions/stats');
    return response.data;
  },
};

// Payment APIs
export const paymentApi = {
  // Create admission payment
  createAdmissionPayment: async (applicationId: string) => {
    const response = await api.post('/payments/admission/create', {
      applicationId,
    });
    return response.data;
  },

  // Create tuition payment
  createTuitionPayment: async (amount: number, semester: string) => {
    const response = await api.post('/payments/tuition/create', {
      amount,
      semester,
    });
    return response.data;
  },

  // Get payment history
  getHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },

  // Check balance
  checkBalance: async () => {
    const response = await api.get('/payments/balance');
    return response.data;
  },
};

// Student APIs
export const studentApi = {
  // Get my profile
  getMyProfile: async () => {
    const response = await api.get('/students/me');
    return response.data;
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },

  // Get all students (admin)
  getAllStudents: async (params?: { programId?: string; level?: number; search?: string }) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Get student by ID
  getStudentById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Update student
  updateStudent: async (id: string, data: any) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  // Get enrollments
  getEnrollments: async (studentId: string, semester?: string, year?: number) => {
    const response = await api.get(`/students/${studentId}/enrollments`, {
      params: { semester, year },
    });
    return response.data;
  },

  // Get grades
  getGrades: async (studentId: string) => {
    const response = await api.get(`/students/${studentId}/grades`);
    return response.data;
  },
};

// Auth APIs
export const authApi = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

// Notification APIs
export const notificationApi = {
  // Get my notifications
  getMyNotifications: async () => {
    const response = await api.get('/notifications/me');
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },
};

// Course APIs
export const courseApi = {
  // Get available courses
  getAvailableCourses: async (programId?: string) => {
    const response = await api.get('/courses/available', { params: { programId } });
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
};

// Enrollment APIs
export const enrollmentApi = {
  // Enroll in course
  enroll: async (sectionId: string) => {
    const response = await api.post('/enrollments', { sectionId });
    return response.data;
  },

  // Drop course
  drop: async (enrollmentId: string) => {
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    return response.data;
  },
};

export default api;

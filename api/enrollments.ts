import apiClient from './client';

export const enrollmentsAPI = {
  // ========== Student Self-Service Methods ==========

  // Get my current enrollments (for students)
  getMyEnrollments: async (semester?: string) => {
    const response = await apiClient.get('/my-enrollments', { params: { semester } });
    return response.data;
  },

  // Enroll in a course section (for students)
  enroll: async (sectionId: string) => {
    const response = await apiClient.post('/my-enrollments', { section_id: sectionId });
    return response.data;
  },

  // Drop a course (for students)
  dropMyCourse: async (enrollmentId: string) => {
    const response = await apiClient.delete(`/my-enrollments/${enrollmentId}`);
    return response.data;
  },

  // Get available sections for registration
  getAvailableSections: async (semesterId?: string) => {
    const response = await apiClient.get('/available-sections', { params: { semester_id: semesterId } });
    return response.data;
  },

  // Check if can register for a section
  checkRegistration: async (sectionId: string) => {
    const response = await apiClient.post('/check-registration', { section_id: sectionId });
    return response.data;
  },

  // Get registration summary
  getRegistrationSummary: async () => {
    const response = await apiClient.get('/registration-summary');
    return response.data;
  },

  // ========== Admin/Staff Methods ==========

  // Get enrollments for a specific student (staff/admin)
  getStudentEnrollments: async (studentId: number | string, semester?: string) => {
    const response = await apiClient.get('/enrollments', {
      params: {
        student_id: studentId,
        semester,
        status: 'ENROLLED'
      }
    });
    return response.data;
  },

  // Get all enrollments (admin)
  getAll: async (filters?: {
    student_id?: string;
    course_id?: string;
    semester_id?: string;
    status?: 'ENROLLED' | 'DROPPED' | 'WITHDRAWN' | 'COMPLETED';
    per_page?: number;
  }) => {
    const response = await apiClient.get('/enrollments', { params: filters });
    return response.data;
  },

  // Get enrollment details
  getById: async (id: string) => {
    const response = await apiClient.get(`/enrollments/${id}`);
    return response.data;
  },

  // Create enrollment (admin)
  create: async (data: {
    student_id: string;
    course_id: string;
    semester_id: string;
    section?: string;
    status: 'ENROLLED' | 'DROPPED' | 'WITHDRAWN' | 'COMPLETED';
  }) => {
    const response = await apiClient.post('/enrollments', data);
    return response.data;
  },

  // Update enrollment (admin)
  update: async (id: string, data: {
    section?: string;
    status?: 'ENROLLED' | 'DROPPED' | 'WITHDRAWN' | 'COMPLETED';
  }) => {
    const response = await apiClient.put(`/enrollments/${id}`, data);
    return response.data;
  },

  // Delete enrollment (admin)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/enrollments/${id}`);
    return response.data;
  },

  // Drop enrollment (admin)
  drop: async (id: string) => {
    const response = await apiClient.post(`/enrollments/${id}/drop`);
    return response.data;
  },

  // Withdraw from enrollment (admin)
  withdraw: async (id: string) => {
    const response = await apiClient.post(`/enrollments/${id}/withdraw`);
    return response.data;
  },

  // Get enrollment attendance
  getAttendance: async (id: string) => {
    const response = await apiClient.get(`/enrollments/${id}/attendance`);
    return response.data;
  },

  // Update enrollment attendance (lecturer/admin)
  updateAttendance: async (id: string, data: any) => {
    const response = await apiClient.post(`/enrollments/${id}/attendance`, data);
    return response.data;
  },
};

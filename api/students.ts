import apiClient from './client';

export const studentsAPI = {
  // Get all students (admin only)
  getAll: async (filters?: { programId?: string; level?: number; search?: string; status?: string; per_page?: number }) => {
    const response = await apiClient.get('/students', { params: filters });
    return response.data;
  },

  // Get student by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  // Get my profile (for students) - uses /user endpoint which returns student data
  getMyProfile: async () => {
    try {
      const response = await apiClient.get('/user');
      return response.data;
    } catch (error: any) {
      console.warn('[Students API] Profile fetch failed:', error?.message);
      return null;
    }
  },

  // Update student (admin only)
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data;
  },

  // Create student (admin only)
  create: async (data: any) => {
    const response = await apiClient.post('/students', data);
    return response.data;
  },

  // Delete student (admin only)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  // Get student enrollments
  getEnrollments: async (id: string, semester?: string, year?: number) => {
    try {
      const response = await apiClient.get(`/students/${id}/enrollments`, {
        params: { semester, year },
      });
      return response.data;
    } catch (error: any) {
      console.warn('[Students API] Enrollments fetch failed:', error?.message);
      return [];
    }
  },

  // Get student grades
  getGrades: async (id: string) => {
    try {
      const response = await apiClient.get(`/students/${id}/grades`);
      return response.data;
    } catch (error: any) {
      console.warn('[Students API] Grades fetch failed:', error?.message);
      return [];
    }
  },

  // Get student financial records
  getFinancialRecords: async (id: string) => {
    const response = await apiClient.get(`/students/${id}/financial-records`);
    return response.data;
  },

  // Get student documents
  getDocuments: async (id: string) => {
    const response = await apiClient.get(`/students/${id}/documents`);
    return response.data;
  },

  // Get student balance
  getBalance: async (id: string) => {
    const response = await apiClient.get(`/students/${id}/balance`);
    return response.data;
  },

  // Get my transcript (for students)
  getMyTranscript: async () => {
    const response = await apiClient.get('/my-transcript');
    return response.data;
  },

  // Get student transcript (for staff/admin)
  getStudentTranscript: async (studentId: string | number) => {
    const response = await apiClient.get(`/students/${studentId}/transcript`);
    return response.data;
  },

  // Get student study plan (for staff/admin)
  getStudentStudyPlan: async (studentId: string | number) => {
    const response = await apiClient.get(`/students/${studentId}/study-plan`);
    return response.data;
  },

  // Get my grades (for students)
  getMyGrades: async () => {
    try {
      const response = await apiClient.get('/my-grades');
      return response.data;
    } catch (error: any) {
      console.warn('[Students API] My grades fetch failed:', error?.message);
      return null;
    }
  },

  // Get my academic summary (for students)
  getMyAcademicSummary: async () => {
    const response = await apiClient.get('/my-academic-summary');
    return response.data;
  },

  // Get my timetable (for students)
  getMyTimetable: async () => {
    const response = await apiClient.get('/my-timetable');
    return response.data;
  },
};

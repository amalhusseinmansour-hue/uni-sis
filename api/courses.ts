import apiClient from './client';

export const coursesAPI = {
  // ========== Student Methods ==========

  // Get available sections for current semester
  getAvailableSections: async (semester?: string, year?: number, studentId?: string) => {
    const response = await apiClient.get('/available-sections', {
      params: { semester, year, student_id: studentId }
    });
    return response.data;
  },

  // Get section details
  getSectionDetails: async (sectionId: string) => {
    const response = await apiClient.get(`/sections/${sectionId}`);
    return response.data;
  },

  // ========== General Methods ==========

  // Get all courses
  getAll: async (filters?: {
    active?: boolean;
    department_id?: string;
    search?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/courses', { params: filters });
    return response.data;
  },

  // Get course by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  // Get course statistics
  getStatistics: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}/statistics`);
    return response.data;
  },

  // Get course enrollments (lecturer/admin)
  getEnrollments: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}/enrollments`);
    return response.data;
  },

  // Get course prerequisites
  getPrerequisites: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}/prerequisites`);
    return response.data;
  },

  // Get courses requiring this course
  getCoursesRequiringThis: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}/required-for`);
    return response.data;
  },

  // Check eligibility for a course
  checkEligibility: async (courseId: string, studentId?: string) => {
    const response = await apiClient.post(`/courses/${courseId}/check-eligibility`, { student_id: studentId });
    return response.data;
  },

  // Get course schedule
  getSchedule: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}/schedule`);
    return response.data;
  },

  // Create course (admin)
  create: async (data: {
    code: string;
    name_en: string;
    name_ar: string;
    description_en?: string;
    description_ar?: string;
    credits: number;
    capacity: number;
    department_id?: string;
    is_active?: boolean;
  }) => {
    const response = await apiClient.post('/courses', data);
    return response.data;
  },

  // Update course (admin)
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },

  // Delete course (admin)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/courses/${id}`);
    return response.data;
  },

  // Activate course (admin)
  activate: async (id: string) => {
    const response = await apiClient.post(`/courses/${id}/activate`);
    return response.data;
  },

  // Deactivate course (admin)
  deactivate: async (id: string) => {
    const response = await apiClient.post(`/courses/${id}/deactivate`);
    return response.data;
  },

  // Add prerequisite (admin)
  addPrerequisite: async (courseId: string, prerequisiteId: string, data?: any) => {
    const response = await apiClient.post(`/courses/${courseId}/prerequisites`, {
      prerequisite_id: prerequisiteId,
      ...data
    });
    return response.data;
  },

  // Remove prerequisite (admin)
  removePrerequisite: async (courseId: string, prerequisiteId: string) => {
    const response = await apiClient.delete(`/courses/${courseId}/prerequisites/${prerequisiteId}`);
    return response.data;
  },
};

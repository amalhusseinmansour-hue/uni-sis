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
    } catch {
      return null;
    }
  },

  // Get my student profile with full details
  getMyStudentProfile: async () => {
    try {
      const response = await apiClient.get('/my-student-profile');
      return response.data;
    } catch {
      return null;
    }
  },

  // Update my profile (students can only update personal data)
  updateMyProfile: async (data: any) => {
    const response = await apiClient.put('/my-student-profile', data);
    return response.data;
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
    } catch {
      return [];
    }
  },

  // Get student grades
  getGrades: async (id: string) => {
    try {
      const response = await apiClient.get(`/students/${id}/grades`);
      return response.data;
    } catch {
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
    try {
      const response = await apiClient.get('/my-transcript');
      return response.data;
    } catch {
      return null;
    }
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
    } catch {
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

  // Upload profile picture
  uploadProfilePicture: async (studentId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await apiClient.post(`/students/${studentId}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload document
  uploadDocument: async (studentId: string | number, file: File, documentType: string, title: string) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);
    formData.append('title', title);
    const response = await apiClient.post(`/students/${studentId}/upload-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (studentId: string | number, documentId: number) => {
    const response = await apiClient.delete(`/students/${studentId}/documents/${documentId}`);
    return response.data;
  },

  // Download document securely via API (not direct URL)
  downloadDocument: async (documentId: number | string, fileName: string) => {
    try {
      // SECURITY: Use authenticated API endpoint for document download
      const response = await apiClient.get(`/student-documents/${documentId}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to download document');
    }
  },
};

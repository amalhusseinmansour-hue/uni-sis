import apiClient from './client';

export type GraduationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'GRADUATED';

export interface GraduationApplication {
  id: number;
  student_id: number;
  status: GraduationStatus;
  application_date: string;
  expected_graduation_date?: string;
  actual_graduation_date?: string;
  gpa?: number;
  total_credits?: number;
  completed_credits?: number;
  remaining_credits?: number;
  notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    student_id: string;
    name_en: string;
    name_ar: string;
    email: string;
    program?: {
      id: number;
      code: string;
      name_en: string;
      name_ar: string;
      total_credits: number;
    };
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface GraduationFilters {
  status?: GraduationStatus;
  student_id?: string | number;
  program_id?: string | number;
  academic_year?: string;
  per_page?: number;
  page?: number;
}

export interface GraduationRequirement {
  id: number;
  type: 'CREDIT' | 'COURSE' | 'GPA' | 'OTHER';
  name_en: string;
  name_ar: string;
  required_value: number | string;
  current_value: number | string;
  is_met: boolean;
  details?: string;
}

export interface EligibilityResult {
  is_eligible: boolean;
  gpa: number;
  total_credits: number;
  completed_credits: number;
  remaining_credits: number;
  requirements: GraduationRequirement[];
  missing_courses: {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
    credits: number;
  }[];
}

export interface GraduationStatistics {
  total_applications: number;
  by_status: Record<GraduationStatus, number>;
  this_semester: number;
  avg_processing_time_days: number;
  total_graduated_this_year: number;
  avg_gpa: number;
}

export const graduationAPI = {
  // Get all graduation applications
  getApplications: async (filters?: GraduationFilters) => {
    const response = await apiClient.get('/graduation/applications', { params: filters });
    return response.data;
  },

  // Get a specific application
  getApplication: async (id: number | string) => {
    const response = await apiClient.get(`/graduation/applications/${id}`);
    return response.data;
  },

  // Create a new graduation application
  createApplication: async (data: {
    student_id: number | string;
    expected_graduation_date?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/graduation/applications', data);
    return response.data;
  },

  // Approve a graduation application
  approve: async (id: number | string, data?: { notes?: string }) => {
    const response = await apiClient.post(`/graduation/applications/${id}/approve`, data);
    return response.data;
  },

  // Reject a graduation application
  reject: async (id: number | string, data: { reason: string; notes?: string }) => {
    const response = await apiClient.post(`/graduation/applications/${id}/reject`, data);
    return response.data;
  },

  // Start review of application
  startReview: async (id: number | string) => {
    const response = await apiClient.post(`/graduation/applications/${id}/review`);
    return response.data;
  },

  // Mark student as graduated
  markGraduated: async (id: number | string, data?: {
    actual_graduation_date?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post(`/graduation/applications/${id}/graduate`, data);
    return response.data;
  },

  // Check student eligibility for graduation
  checkEligibility: async (studentId: number | string): Promise<EligibilityResult> => {
    const response = await apiClient.get(`/graduation/eligibility/${studentId}`);
    return response.data;
  },

  // Get graduation requirements for a program
  getRequirements: async (programId: number | string) => {
    const response = await apiClient.get(`/graduation/requirements/${programId}`);
    return response.data;
  },

  // Issue graduation document
  issueDocument: async (
    applicationId: number | string,
    documentType: 'transcript' | 'certificate' | 'letter'
  ) => {
    const response = await apiClient.post(`/graduation/applications/${applicationId}/documents`, {
      document_type: documentType,
    });
    return response.data;
  },

  // Download document
  downloadDocument: async (applicationId: number | string, documentId: number | string) => {
    const response = await apiClient.get(
      `/graduation/applications/${applicationId}/documents/${documentId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Get graduation statistics
  getStatistics: async (): Promise<GraduationStatistics> => {
    const response = await apiClient.get('/graduation/statistics');
    return response.data;
  },

  // Get graduation history for a student
  getStudentHistory: async (studentId: number | string) => {
    const response = await apiClient.get(`/graduation/student/${studentId}/history`);
    return response.data;
  },

  // Bulk approve applications
  bulkApprove: async (applicationIds: (number | string)[]) => {
    const response = await apiClient.post('/graduation/applications/bulk-approve', {
      application_ids: applicationIds,
    });
    return response.data;
  },

  // Export applications to Excel/PDF
  exportApplications: async (filters?: GraduationFilters, format: 'excel' | 'pdf' = 'excel') => {
    const response = await apiClient.get('/graduation/applications/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },
};

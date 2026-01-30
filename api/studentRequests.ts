import apiClient from './client';

// Helper APIs for form data
export const formDataApi = {
  getPrograms: async () => {
    const response = await apiClient.get('/programs');
    return response.data.data || response.data;
  },
  getDepartments: async () => {
    const response = await apiClient.get('/departments');
    return response.data.data || response.data;
  },
  getSemesters: async () => {
    const response = await apiClient.get('/semesters');
    return response.data.data || response.data;
  },
  getCourses: async () => {
    const response = await apiClient.get('/courses');
    return response.data.data || response.data;
  },
};

// Types
export interface RequestType {
  code: string;
  name_ar: string;
  name_en: string;
  workflow: {
    role: string;
    name_ar: string;
    name_en: string;
  }[];
}

export interface FormField {
  name: string;
  type: string;
  required: boolean;
  label_ar: string;
  label_en: string;
  options?: {
    value: string;
    label_ar: string;
    label_en: string;
  }[];
  step?: string;
  min?: number;
  max?: number;
}

export interface FormSchema {
  request_type: string;
  name_ar: string;
  name_en: string;
  fields: FormField[];
  required_attachments: string[];
  optional_attachments: string[];
  workflow: string[];
}

export interface StudentRequest {
  id: number;
  student_id: number;
  request_number: string;
  request_type: string;
  program_id?: number;
  department_id?: number;
  semester_id?: number;
  phone?: string;
  reason?: string;
  status: string;
  current_approval_step: number;
  approval_workflow?: any[];
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  student?: any;
  department?: any;
  program?: any;
  semester?: any;
  attachments?: any[];
  approvals?: any[];
}

export interface CreateRequestData {
  student_id: number;
  request_type: string;
  program_id?: number;
  department_id?: number;
  semester_id?: number;
  phone?: string;
  reason?: string;
  fees_paid?: boolean;
  previous_postponements_count?: number;
  postponement_reason_type?: string;
  previous_withdrawals_count?: number;
  return_next_semester?: boolean;
  postponement_date?: string;
  return_semester_id?: number;
  previous_institution?: string;
  course_id?: number;
  exam_type?: string;
  absence_reason?: string;
  objection_reason?: string;
  current_department_id?: number;
  requested_department_id?: number;
  earned_credits?: number;
  current_gpa?: number;
  current_study_plan?: string;
  requested_study_plan?: string;
  student_notes?: string;
  submit?: boolean;
  courses?: any[];
  equivalencies?: any[];
}

// API Functions
export const studentRequestsApi = {
  // Get all request types
  getRequestTypes: async (): Promise<RequestType[]> => {
    const response = await apiClient.get('/request-forms/types');
    return response.data.data;
  },

  // Staff: Get all requests (for staff/admin)
  getAllRequests: async (params?: {
    status?: string;
    type?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<{ data: StudentRequest[]; meta: any }> => {
    const response = await apiClient.get('/student-requests', { params });
    return response.data.data || response.data;
  },

  // Staff: Review request (approve/reject/forward)
  reviewRequest: async (id: number, data: {
    decision: 'APPROVED' | 'REJECTED' | 'FORWARDED';
    level: 'ADVISOR' | 'DEPARTMENT' | 'DEAN' | 'STUDENT_AFFAIRS';
    notes?: string;
  }): Promise<StudentRequest> => {
    const response = await apiClient.post(`/student-requests/${id}/review`, data);
    return response.data.data;
  },

  // Staff: Execute approved request
  executeRequest: async (id: number, data?: {
    execution_notes?: string;
    execution_result?: any;
  }): Promise<StudentRequest> => {
    const response = await apiClient.post(`/student-requests/${id}/execute`, data);
    return response.data.data;
  },

  // Staff: Add comment to request
  addComment: async (id: number, data: {
    comment: string;
    is_internal?: boolean;
    attachments?: string[];
  }): Promise<any> => {
    const response = await apiClient.post(`/student-requests/${id}/comments`, data);
    return response.data.data;
  },

  // Staff: Get request statistics
  getRequestStatistics: async (semesterId?: number): Promise<any> => {
    const response = await apiClient.get('/student-requests/statistics', {
      params: { semester_id: semesterId },
    });
    return response.data.data;
  },

  // Get form schema for a specific request type
  getFormSchema: async (requestType: string): Promise<FormSchema> => {
    const response = await apiClient.get(`/request-forms/schema/${requestType}`);
    return response.data.data;
  },

  // Get student's requests
  getRequests: async (params?: {
    student_id?: number;
    type?: string;
    status?: string;
    per_page?: number;
  }): Promise<{ data: StudentRequest[]; meta: any }> => {
    const response = await apiClient.get('/request-forms', { params });
    return response.data.data;
  },

  // Get request details
  getRequest: async (id: number): Promise<StudentRequest> => {
    const response = await apiClient.get(`/request-forms/${id}`);
    return response.data.data;
  },

  // Create new request
  createRequest: async (data: CreateRequestData): Promise<StudentRequest> => {
    const response = await apiClient.post('/request-forms', data);
    return response.data.data;
  },

  // Update request (draft only)
  updateRequest: async (id: number, data: Partial<CreateRequestData>): Promise<StudentRequest> => {
    const response = await apiClient.put(`/request-forms/${id}`, data);
    return response.data.data;
  },

  // Submit request
  submitRequest: async (id: number): Promise<StudentRequest> => {
    const response = await apiClient.post(`/request-forms/${id}/submit`);
    return response.data.data;
  },

  // Upload attachment
  uploadAttachment: async (
    requestId: number,
    file: File,
    attachmentType: string,
    description?: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachment_type', attachmentType);
    if (description) {
      formData.append('description', description);
    }
    const response = await apiClient.post(`/request-forms/${requestId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Delete attachment
  deleteAttachment: async (requestId: number, attachmentId: number): Promise<void> => {
    await apiClient.delete(`/request-forms/${requestId}/attachments/${attachmentId}`);
  },

  // Cancel request
  cancelRequest: async (id: number): Promise<void> => {
    await apiClient.post(`/request-forms/${id}/cancel`);
  },

  // Admin: Approve request
  approveRequest: async (id: number, comments?: string): Promise<StudentRequest> => {
    const response = await apiClient.post(`/admin/request-forms/${id}/approve`, { comments });
    return response.data.data;
  },

  // Admin: Reject request
  rejectRequest: async (id: number, reason: string, comments?: string): Promise<StudentRequest> => {
    const response = await apiClient.post(`/admin/request-forms/${id}/reject`, { reason, comments });
    return response.data.data;
  },

  // Admin: Return for revision
  returnForRevision: async (id: number, comments: string): Promise<StudentRequest> => {
    const response = await apiClient.post(`/admin/request-forms/${id}/return`, { comments });
    return response.data.data;
  },

  // Admin: Get pending requests for role
  getPendingForRole: async (role: string, departmentId?: number): Promise<StudentRequest[]> => {
    const response = await apiClient.get('/admin/request-forms/pending', {
      params: { role, department_id: departmentId },
    });
    return response.data.data;
  },

  // Admin: Get statistics
  getStatistics: async (departmentId?: number): Promise<any> => {
    const response = await apiClient.get('/admin/request-forms/statistics', {
      params: { department_id: departmentId },
    });
    return response.data.data;
  },
};

export default studentRequestsApi;

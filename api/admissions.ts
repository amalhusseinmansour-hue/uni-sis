import apiClient from './client';

// Types
export interface AdmissionApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  national_id: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  nationality: string;
  country?: string;
  city?: string;
  residence?: string;
  address?: string;
  program_id?: number;
  program?: {
    id: number;
    name_en: string;
    name_ar: string;
    code: string;
  };
  college?: string;
  degree?: string;
  high_school_name?: string;
  high_school_score?: number;
  high_school_year?: number;
  scholarship_percentage?: number;
  payment_method?: string;
  source?: string;
  status: AdmissionStatus;
  student_id?: string;
  registration_fee?: number;
  date: string;
  documents_verified_at?: string;
  payment_requested_at?: string;
  payment_received_at?: string;
  approved_at?: string;
  reviewer_notes?: string;
  reviewed_by?: number;
  approved_by?: number;
  acceptance_letter_path?: string;
  university_card_path?: string;
  created_at: string;
  updated_at: string;
  payments?: AdmissionPayment[];
  workflow_logs?: WorkflowLog[];
}

export type AdmissionStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_VERIFIED'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_RECEIVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITLISTED';

export interface AdmissionPayment {
  id: number;
  transaction_id: string;
  amount: number;
  payment_method: string;
  status: string;
  bank_name?: string;
  receipt_number?: string;
  paid_at: string;
  verified_at?: string;
}

export interface WorkflowLog {
  id: number;
  action: string;
  from_status?: string;
  to_status?: string;
  performed_by?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AdmissionStatistics {
  total: number;
  pending: number;
  under_review: number;
  documents_verified: number;
  pending_payment: number;
  payment_received: number;
  approved: number;
  rejected: number;
  waitlisted: number;
  awaiting_action: number;
}

// Status labels and colors
export const statusConfig: Record<AdmissionStatus, { labelEn: string; labelAr: string; color: string; bgColor: string }> = {
  PENDING: { labelEn: 'Pending', labelAr: 'قيد الانتظار', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  UNDER_REVIEW: { labelEn: 'Under Review', labelAr: 'قيد المراجعة', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  DOCUMENTS_VERIFIED: { labelEn: 'Documents Verified', labelAr: 'تم التحقق من المستندات', color: 'text-indigo-800', bgColor: 'bg-indigo-100' },
  PENDING_PAYMENT: { labelEn: 'Pending Payment', labelAr: 'في انتظار الدفع', color: 'text-orange-800', bgColor: 'bg-orange-100' },
  PAYMENT_RECEIVED: { labelEn: 'Payment Received', labelAr: 'تم الدفع', color: 'text-teal-800', bgColor: 'bg-teal-100' },
  APPROVED: { labelEn: 'Approved', labelAr: 'مقبول', color: 'text-green-800', bgColor: 'bg-green-100' },
  REJECTED: { labelEn: 'Rejected', labelAr: 'مرفوض', color: 'text-red-800', bgColor: 'bg-red-100' },
  WAITLISTED: { labelEn: 'Waitlisted', labelAr: 'قائمة الانتظار', color: 'text-gray-800', bgColor: 'bg-gray-100' },
};

// API Functions
export const admissionsApi = {
  // Get all applications
  getAll: async (params?: {
    status?: AdmissionStatus;
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<{ data: AdmissionApplication[]; meta: { total: number; current_page: number; last_page: number } }> => {
    const response = await apiClient.get('/admission-applications', { params });
    return response.data;
  },

  // Get single application
  getById: async (id: number): Promise<AdmissionApplication> => {
    const response = await apiClient.get(`/admission-applications/${id}`);
    return response.data.data;
  },

  // Get statistics
  getStatistics: async (): Promise<AdmissionStatistics> => {
    const response = await apiClient.get('/admission-applications-statistics');
    return response.data;
  },

  // Get pending payment applications (for finance)
  getPendingPayment: async (): Promise<AdmissionApplication[]> => {
    const response = await apiClient.get('/admission-applications-pending-payment');
    return response.data.data;
  },

  // Workflow actions
  startReview: async (id: number): Promise<AdmissionApplication> => {
    const response = await apiClient.post(`/admission-applications/${id}/start-review`);
    return response.data.data;
  },

  verifyDocuments: async (id: number, notes?: string): Promise<AdmissionApplication> => {
    const response = await apiClient.post(`/admission-applications/${id}/verify-documents`, { notes });
    return response.data.data;
  },

  requestPayment: async (id: number, registrationFee: number): Promise<AdmissionApplication> => {
    const response = await apiClient.post(`/admission-applications/${id}/request-payment`, { registration_fee: registrationFee });
    return response.data.data;
  },

  recordPayment: async (id: number, paymentData: {
    amount: number;
    payment_method: string;
    bank_name?: string;
    receipt_number?: string;
    notes?: string;
  }): Promise<AdmissionPayment> => {
    const response = await apiClient.post(`/admission-applications/${id}/record-payment`, paymentData);
    return response.data.data;
  },

  approve: async (id: number): Promise<{ application: AdmissionApplication; student_id: string; documents: { acceptance_letter_path: string; university_card_path: string } }> => {
    const response = await apiClient.post(`/admission-applications/${id}/approve`);
    return response.data.data;
  },

  // Direct status update (fallback if workflow endpoints don't work)
  updateStatus: async (id: number, status: string, data?: any): Promise<AdmissionApplication> => {
    const response = await apiClient.put(`/admission-applications/${id}`, { status, ...data });
    return response.data.data || response.data;
  },

  // Full approval with all steps in one call (alternative endpoint)
  fullApprove: async (id: number, paymentData: { amount: number; payment_method: string; notes?: string }): Promise<any> => {
    // Try different endpoint variations
    try {
      const response = await apiClient.post(`/admission-applications/${id}/full-approve`, paymentData);
      return response.data.data || response.data;
    } catch {
      // Try alternative endpoint
      try {
        const response = await apiClient.post(`/admission-applications/${id}/quick-approve`, paymentData);
        return response.data.data || response.data;
      } catch {
        // Try PATCH to update status directly
        const response = await apiClient.patch(`/admission-applications/${id}`, {
          status: 'APPROVED',
          payment_received: true,
          registration_fee: paymentData.amount,
          payment_method: paymentData.payment_method
        });
        return response.data.data || response.data;
      }
    }
  },

  reject: async (id: number, notes: string): Promise<AdmissionApplication> => {
    const response = await apiClient.post(`/admission-applications/${id}/reject`, { reviewer_notes: notes });
    return response.data.data;
  },

  waitlist: async (id: number, notes?: string): Promise<AdmissionApplication> => {
    const response = await apiClient.post(`/admission-applications/${id}/waitlist`, { reviewer_notes: notes });
    return response.data.data;
  },

  // Get workflow logs
  getWorkflowLogs: async (id: number): Promise<WorkflowLog[]> => {
    const response = await apiClient.get(`/admission-applications/${id}/workflow-logs`);
    return response.data.data;
  },

  // Download documents
  downloadAcceptanceLetter: async (id: number): Promise<void> => {
    const response = await apiClient.get(`/admission-applications/${id}/acceptance-letter`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `acceptance-letter-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadUniversityCard: async (id: number): Promise<void> => {
    const response = await apiClient.get(`/admission-applications/${id}/university-card`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `university-card-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Check if applicant already exists (by email, national_id, or passport)
  checkDuplicate: async (data: { email?: string; national_id?: string; passport_number?: string }): Promise<{ exists: boolean; message?: string; application_id?: number }> => {
    try {
      const response = await apiClient.post('/admission-applications/check-duplicate', data);
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist, check manually by searching
      if (error?.response?.status === 404) {
        // Fallback: search in existing applications
        const searchParams: any = {};
        if (data.email) searchParams.search = data.email;
        const apps = await admissionsApi.getAll(searchParams);
        const existingApp = (apps.data || []).find((app: AdmissionApplication) =>
          app.email === data.email ||
          app.national_id === data.national_id ||
          (data.passport_number && app.national_id === data.passport_number)
        );
        if (existingApp) {
          return {
            exists: true,
            message: 'Application already exists',
            application_id: existingApp.id
          };
        }
      }
      return { exists: false };
    }
  },

  // Delete application
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admission-applications/${id}`);
  },

  // Submit new application
  submitApplication: async (data: {
    full_name: string;
    full_name_ar?: string;
    email: string;
    phone: string;
    whatsapp?: string;
    national_id: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    nationality?: string;
    country?: string;
    city?: string;
    residence?: string;
    address?: string;
    program_id?: number;
    program_name?: string;
    high_school_name?: string;
    high_school_score?: number;
    high_school_year?: number;
    scholarship_percentage?: number;
    payment_method?: string;
    source?: string;
  }): Promise<AdmissionApplication> => {
    const response = await apiClient.post('/admission-applications', data);
    return response.data.data || response.data;
  },
};

export default admissionsApi;

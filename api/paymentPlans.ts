/**
 * Payment Plans and Scholarships API
 * Uses real data from Laravel backend
 */
import apiClient from './client';

// Types
export interface PaymentPlan {
  id: string;
  student_id: string;
  student_name?: string;
  student_number?: string;
  name: string;
  name_ar: string;
  total_amount: number;
  down_payment: number;
  installments_count: number;
  installments: Installment[];
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DEFAULTED';
  created_at: string;
  start_date: string;
  end_date: string;
  notes?: string;
  progress_percentage?: number;
}

export interface Installment {
  id: string;
  plan_id: string;
  number: number;
  amount: number;
  due_date: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  paid_amount: number;
  paid_date?: string;
  payment_method?: string;
}

export interface Scholarship {
  id: string;
  code: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  type: 'FULL' | 'PARTIAL' | 'TUITION' | 'MERIT' | 'NEED_BASED' | 'ATHLETIC' | 'EXTERNAL';
  coverage_percentage: number;
  coverage_amount?: number;
  max_semesters?: number;
  requirements?: string;
  requirements_ar?: string;
  is_active: boolean;
  application_deadline?: string;
  academic_year: string;
}

export interface StudentScholarship {
  id: string;
  student_id: string;
  scholarship_id: string;
  scholarship: Scholarship;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'SUSPENDED' | 'COMPLETED';
  applied_date: string;
  approved_date?: string;
  start_semester: string;
  end_semester?: string;
  total_awarded: number;
  total_disbursed: number;
  gpa_requirement?: number;
  notes?: string;
}

export interface ScholarshipApplication {
  scholarship_id: string;
  reason?: string;
  documents?: string[];
}

export const paymentPlansAPI = {
  // ============== Payment Plans ==============

  // Get student's payment plans
  getMyPaymentPlans: async (): Promise<PaymentPlan[]> => {
    try {
      const response = await apiClient.get('/my-payment-plans');
      return response.data;
    } catch {
      // Return empty array if no payment plans exist
      return [];
    }
  },

  // Get payment plan by ID
  getPaymentPlan: async (id: string): Promise<PaymentPlan> => {
    const response = await apiClient.get(`/payment-plans/${id}`);
    return response.data;
  },

  // Get all payment plans (admin)
  getAllPaymentPlans: async (filters?: {
    status?: string;
    student_id?: string;
  }): Promise<PaymentPlan[]> => {
    try {
      const response = await apiClient.get('/payment-plans', { params: filters });
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // Create payment plan (admin)
  createPaymentPlan: async (data: {
    student_id: string;
    name: string;
    name_ar: string;
    total_amount: number;
    down_payment: number;
    installments_count: number;
    start_date: string;
    notes?: string;
  }): Promise<PaymentPlan> => {
    const response = await apiClient.post('/payment-plans', {
      student_id: data.student_id,
      total_amount: data.total_amount,
      down_payment: data.down_payment,
      number_of_installments: data.installments_count,
      start_date: data.start_date,
      notes: data.notes,
    });
    return response.data;
  },

  // Update payment plan (admin)
  updatePaymentPlan: async (id: string, data: Partial<PaymentPlan>): Promise<PaymentPlan> => {
    const response = await apiClient.put(`/payment-plans/${id}`, data);
    return response.data;
  },

  // Pay installment
  payInstallment: async (installmentId: string, data: {
    amount: number;
    payment_method: string;
  }): Promise<Installment> => {
    const response = await apiClient.post(`/installments/${installmentId}/pay`, data);
    return response.data;
  },

  // ============== Scholarships ==============

  // Get available scholarships
  getAvailableScholarships: async (): Promise<Scholarship[]> => {
    try {
      const response = await apiClient.get('/scholarships/available');
      return response.data;
    } catch {
      return [];
    }
  },

  // Get all scholarships (admin)
  getAllScholarships: async (): Promise<Scholarship[]> => {
    try {
      const response = await apiClient.get('/scholarships');
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // Get scholarship by ID
  getScholarship: async (id: string): Promise<Scholarship> => {
    const response = await apiClient.get(`/scholarships/${id}`);
    return response.data;
  },

  // Create scholarship (admin)
  createScholarship: async (data: Omit<Scholarship, 'id'>): Promise<Scholarship> => {
    const response = await apiClient.post('/scholarships', data);
    return response.data;
  },

  // Update scholarship (admin)
  updateScholarship: async (id: string, data: Partial<Scholarship>): Promise<Scholarship> => {
    const response = await apiClient.put(`/scholarships/${id}`, data);
    return response.data;
  },

  // Delete scholarship (admin)
  deleteScholarship: async (id: string): Promise<void> => {
    await apiClient.delete(`/scholarships/${id}`);
  },

  // ============== Student Scholarships ==============

  // Get my scholarships
  getMyScholarships: async (): Promise<StudentScholarship[]> => {
    try {
      const response = await apiClient.get('/my-scholarships');
      return response.data;
    } catch {
      return [];
    }
  },

  // Apply for scholarship
  applyForScholarship: async (data: ScholarshipApplication): Promise<StudentScholarship> => {
    const response = await apiClient.post('/scholarships/apply', data);
    return response.data;
  },

  // Get all student scholarships (admin)
  getAllStudentScholarships: async (filters?: {
    status?: string;
    scholarship_id?: string;
    student_id?: string;
  }): Promise<StudentScholarship[]> => {
    try {
      const response = await apiClient.get('/student-scholarships', { params: filters });
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // Update student scholarship status (admin)
  updateStudentScholarshipStatus: async (id: string, data: {
    status: StudentScholarship['status'];
    notes?: string;
  }): Promise<StudentScholarship> => {
    const response = await apiClient.put(`/student-scholarships/${id}/status`, data);
    return response.data;
  },

  // Get scholarship statistics (admin)
  getScholarshipStatistics: async (): Promise<{
    total_scholarships: number;
    active_recipients: number;
    total_awarded: number;
    total_disbursed: number;
    pending_applications: number;
    by_type: { type: string; count: number; amount: number }[];
  }> => {
    try {
      const response = await apiClient.get('/scholarships/statistics');
      return response.data;
    } catch {
      return {
        total_scholarships: 0,
        active_recipients: 0,
        total_awarded: 0,
        total_disbursed: 0,
        pending_applications: 0,
        by_type: [],
      };
    }
  },

  // Get payment plan statistics (admin)
  getPaymentPlanStatistics: async (): Promise<{
    total_plans: number;
    active_plans: number;
    total_amount: number;
    collected_amount: number;
    pending_amount: number;
    overdue_count: number;
    overdue_amount: number;
  }> => {
    try {
      const response = await apiClient.get('/payment-plans/statistics');
      return response.data;
    } catch {
      return {
        total_plans: 0,
        active_plans: 0,
        total_amount: 0,
        collected_amount: 0,
        pending_amount: 0,
        overdue_count: 0,
        overdue_amount: 0,
      };
    }
  },
};

export default paymentPlansAPI;

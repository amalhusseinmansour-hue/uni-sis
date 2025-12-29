/**
 * Payment Plans and Scholarships API
 */
import apiClient from './client';

// Types
export interface PaymentPlan {
  id: string;
  student_id: string;
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

// Demo data for payment plans
const DEMO_PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'PP-2024-001',
    student_id: 'STU-2024-001',
    name: 'Semester Payment Plan',
    name_ar: 'خطة دفع الفصل الدراسي',
    total_amount: 15000,
    down_payment: 3000,
    installments_count: 4,
    installments: [
      { id: 'INS-001', plan_id: 'PP-2024-001', number: 1, amount: 3000, due_date: '2024-09-15', status: 'PAID', paid_amount: 3000, paid_date: '2024-09-10' },
      { id: 'INS-002', plan_id: 'PP-2024-001', number: 2, amount: 3000, due_date: '2024-10-15', status: 'PAID', paid_amount: 3000, paid_date: '2024-10-12' },
      { id: 'INS-003', plan_id: 'PP-2024-001', number: 3, amount: 3000, due_date: '2024-11-15', status: 'PAID', paid_amount: 3000, paid_date: '2024-11-14' },
      { id: 'INS-004', plan_id: 'PP-2024-001', number: 4, amount: 3000, due_date: '2024-12-15', status: 'PENDING', paid_amount: 0 },
    ],
    status: 'ACTIVE',
    created_at: '2024-08-20',
    start_date: '2024-09-01',
    end_date: '2024-12-31',
  },
];

// Demo scholarships
const DEMO_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'SCH-001',
    code: 'MERIT-2024',
    name: 'Academic Excellence Scholarship',
    name_ar: 'منحة التفوق الأكاديمي',
    description: 'For students with GPA above 3.75',
    description_ar: 'للطلاب الحاصلين على معدل تراكمي أعلى من 3.75',
    type: 'MERIT',
    coverage_percentage: 50,
    max_semesters: 8,
    requirements: 'Maintain GPA above 3.5',
    requirements_ar: 'الحفاظ على معدل تراكمي أعلى من 3.5',
    is_active: true,
    application_deadline: '2025-01-15',
    academic_year: '2024-2025',
  },
  {
    id: 'SCH-002',
    code: 'NEED-2024',
    name: 'Financial Need Scholarship',
    name_ar: 'منحة الحاجة المالية',
    description: 'For students demonstrating financial need',
    description_ar: 'للطلاب الذين يظهرون حاجة مالية',
    type: 'NEED_BASED',
    coverage_percentage: 75,
    max_semesters: 8,
    requirements: 'Submit financial documents',
    requirements_ar: 'تقديم المستندات المالية',
    is_active: true,
    application_deadline: '2025-02-01',
    academic_year: '2024-2025',
  },
  {
    id: 'SCH-003',
    code: 'FULL-2024',
    name: 'Full Tuition Scholarship',
    name_ar: 'منحة الرسوم الكاملة',
    description: 'Complete tuition coverage for exceptional students',
    description_ar: 'تغطية كاملة للرسوم للطلاب المتميزين',
    type: 'FULL',
    coverage_percentage: 100,
    max_semesters: 8,
    requirements: 'Top 5% of class, community service',
    requirements_ar: 'ضمن أفضل 5% من الدفعة، خدمة مجتمعية',
    is_active: true,
    application_deadline: '2025-01-31',
    academic_year: '2024-2025',
  },
  {
    id: 'SCH-004',
    code: 'ATHLETIC-2024',
    name: 'Athletic Scholarship',
    name_ar: 'منحة رياضية',
    description: 'For outstanding athletes representing the university',
    description_ar: 'للرياضيين المتميزين الممثلين للجامعة',
    type: 'ATHLETIC',
    coverage_percentage: 50,
    max_semesters: 8,
    requirements: 'Active participation in university sports',
    requirements_ar: 'المشاركة الفعالة في رياضات الجامعة',
    is_active: true,
    application_deadline: '2025-03-01',
    academic_year: '2024-2025',
  },
];

// Demo student scholarships
const DEMO_STUDENT_SCHOLARSHIPS: StudentScholarship[] = [
  {
    id: 'SS-001',
    student_id: 'STU-2024-001',
    scholarship_id: 'SCH-001',
    scholarship: DEMO_SCHOLARSHIPS[0],
    status: 'ACTIVE',
    applied_date: '2024-07-15',
    approved_date: '2024-08-01',
    start_semester: 'Fall 2024',
    total_awarded: 7500,
    total_disbursed: 5000,
    gpa_requirement: 3.5,
  },
];

export const paymentPlansAPI = {
  // ============== Payment Plans ==============

  // Get student's payment plans
  getMyPaymentPlans: async (): Promise<PaymentPlan[]> => {
    try {
      const response = await apiClient.get('/my-payment-plans');
      return response.data;
    } catch {
      return DEMO_PAYMENT_PLANS;
    }
  },

  // Get payment plan by ID
  getPaymentPlan: async (id: string): Promise<PaymentPlan> => {
    try {
      const response = await apiClient.get(`/payment-plans/${id}`);
      return response.data;
    } catch {
      const plan = DEMO_PAYMENT_PLANS.find(p => p.id === id);
      if (!plan) throw new Error('Payment plan not found');
      return plan;
    }
  },

  // Get all payment plans (admin)
  getAllPaymentPlans: async (filters?: {
    status?: string;
    student_id?: string;
  }): Promise<PaymentPlan[]> => {
    try {
      const response = await apiClient.get('/payment-plans', { params: filters });
      return response.data;
    } catch {
      return DEMO_PAYMENT_PLANS;
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
    const response = await apiClient.post('/payment-plans', data);
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
      return DEMO_SCHOLARSHIPS.filter(s => s.is_active);
    }
  },

  // Get all scholarships (admin)
  getAllScholarships: async (): Promise<Scholarship[]> => {
    try {
      const response = await apiClient.get('/scholarships');
      return response.data;
    } catch {
      return DEMO_SCHOLARSHIPS;
    }
  },

  // Get scholarship by ID
  getScholarship: async (id: string): Promise<Scholarship> => {
    try {
      const response = await apiClient.get(`/scholarships/${id}`);
      return response.data;
    } catch {
      const scholarship = DEMO_SCHOLARSHIPS.find(s => s.id === id);
      if (!scholarship) throw new Error('Scholarship not found');
      return scholarship;
    }
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
      return DEMO_STUDENT_SCHOLARSHIPS;
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
      return response.data;
    } catch {
      return DEMO_STUDENT_SCHOLARSHIPS;
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
        total_scholarships: 4,
        active_recipients: 45,
        total_awarded: 225000,
        total_disbursed: 180000,
        pending_applications: 12,
        by_type: [
          { type: 'MERIT', count: 20, amount: 75000 },
          { type: 'NEED_BASED', count: 15, amount: 90000 },
          { type: 'FULL', count: 5, amount: 45000 },
          { type: 'ATHLETIC', count: 5, amount: 15000 },
        ],
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
        total_plans: 85,
        active_plans: 62,
        total_amount: 1250000,
        collected_amount: 890000,
        pending_amount: 280000,
        overdue_count: 8,
        overdue_amount: 80000,
      };
    }
  },
};

export default paymentPlansAPI;

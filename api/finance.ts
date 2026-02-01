import apiClient from './client';

export interface FinancialRecord {
  id: number;
  student_id: number;
  date: string;
  description: string;
  description_ar?: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  reference_number?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeeStructure {
  id: number;
  type: string;
  name: string;
  name_ar?: string;
  amount: number;
  currency: string;
  is_mandatory: boolean;
  is_recurring: boolean;
  description?: string;
}

export interface StudentBalance {
  student_id: number;
  student_name: string;
  total_debit: number;
  total_credit: number;
  balance: number;
  pending_amount: number;
  overdue_amount: number;
  paid_amount: number;
  current_semester_fees: number;
  has_outstanding_balance: boolean;
}

export const financeAPI = {
  // ============== Student Endpoints ==============

  // Get my financial records (student)
  getMyFinancials: async (): Promise<{
    records: FinancialRecord[];
    balance: number;
    total_debit: number;
    total_credit: number;
  }> => {
    try {
      const response = await apiClient.get('/my-financial-records');
      return response.data;
    } catch (error: any) {
      console.warn('[Finance API] My financials fetch failed:', error?.message);
      return { records: [], balance: 0, total_debit: 0, total_credit: 0 };
    }
  },

  // Get my balance (student)
  getMyBalance: async (): Promise<StudentBalance> => {
    try {
      const response = await apiClient.get('/my-balance');
      return response.data;
    } catch (error: any) {
      console.warn('[Finance API] My balance fetch failed:', error?.message);
      return {
        student_id: 0,
        student_name: '',
        total_debit: 0,
        total_credit: 0,
        balance: 0,
        pending_amount: 0,
        overdue_amount: 0,
        paid_amount: 0,
        current_semester_fees: 0,
        has_outstanding_balance: false,
      };
    }
  },

  // Get fee structure (student view)
  getFeeStructure: async (): Promise<{
    fees: FeeStructure[];
    mandatory_total: number;
    optional_total: number;
    total: number;
  }> => {
    try {
      const response = await apiClient.get('/fee-structure');
      return response.data;
    } catch (error: any) {
      console.warn('[Finance API] Fee structure fetch failed:', error?.message);
      return { fees: [], mandatory_total: 0, optional_total: 0, total: 0 };
    }
  },

  // ============== Legacy Student Endpoints (with ID) ==============

  // Get student financial records (for admin viewing student data)
  getStudentFinancials: async (studentId: string | number) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/financial-records`);
      return response.data;
    } catch (error: any) {
      console.warn('[Finance API] Student financials fetch failed:', error?.message);
      return null;
    }
  },

  // Get student balance (for admin viewing student data)
  getStudentBalance: async (studentId: string | number) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/balance`);
      return response.data;
    } catch (error: any) {
      console.warn('[Finance API] Student balance fetch failed:', error?.message);
      return { balance: 0, total_debits: 0, total_credits: 0 };
    }
  },

  // ============== Admin Endpoints ==============

  // Get all financial records (admin/finance)
  getAllRecords: async (filters?: {
    type?: 'DEBIT' | 'CREDIT';
    status?: 'PAID' | 'PENDING' | 'OVERDUE';
    student_id?: string | number;
    from_date?: string;
    to_date?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/financial-records', { params: filters });
    return response.data;
  },

  // Get financial record by ID
  getById: async (id: string | number) => {
    const response = await apiClient.get(`/financial-records/${id}`);
    return response.data;
  },

  // Create financial record (admin/finance)
  createRecord: async (data: {
    student_id: string | number;
    date: string;
    description: string;
    description_ar?: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    status: 'PAID' | 'PENDING' | 'OVERDUE';
    reference_number?: string;
    due_date?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/financial-records', data);
    return response.data;
  },

  // Update financial record (admin/finance)
  updateRecord: async (id: string | number, data: Partial<FinancialRecord>) => {
    const response = await apiClient.put(`/financial-records/${id}`, data);
    return response.data;
  },

  // Delete financial record (admin/finance)
  deleteRecord: async (id: string | number) => {
    const response = await apiClient.delete(`/financial-records/${id}`);
    return response.data;
  },

  // Mark record as paid (admin/finance)
  markPaid: async (id: string | number, data?: {
    payment_date?: string;
    payment_method?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post(`/financial-records/${id}/mark-paid`, data || {});
    return response.data;
  },

  // Mark record as overdue (admin/finance)
  markOverdue: async (id: string | number) => {
    const response = await apiClient.post(`/financial-records/${id}/mark-overdue`);
    return response.data;
  },

  // Get financial statistics (admin/finance)
  getStatistics: async () => {
    const response = await apiClient.get('/financial-records-statistics');
    return response.data;
  },

  // Get overdue records (admin/finance)
  getOverdueRecords: async () => {
    const response = await apiClient.get('/financial-records', {
      params: { status: 'OVERDUE' }
    });
    return response.data;
  },

  // ============== Fee Structure Admin Endpoints ==============

  // Get all fee structures (admin)
  getAllFeeStructures: async (filters?: {
    program_id?: number;
    fee_type?: string;
    active?: boolean;
    per_page?: number;
  }) => {
    try {
      const response = await apiClient.get('/fee-structures', { params: filters });
      return response.data;
    } catch {
      return { data: [] };
    }
  },

  // Get fee types
  getFeeTypes: async () => {
    try {
      const response = await apiClient.get('/fee-types');
      return response.data;
    } catch {
      return {};
    }
  },

  // Create fee structure (admin)
  createFeeStructure: async (data: {
    program_id?: number;
    semester_id?: number;
    fee_type: string;
    name_en: string;
    name_ar?: string;
    amount: number;
    currency?: string;
    is_mandatory?: boolean;
    is_recurring?: boolean;
    applies_to?: string;
    applicable_levels?: number[];
    effective_from: string;
    effective_to?: string;
    is_active?: boolean;
    description?: string;
  }) => {
    const response = await apiClient.post('/fee-structures', data);
    return response.data;
  },

  // Update fee structure (admin)
  updateFeeStructure: async (id: number, data: Partial<FeeStructure>) => {
    const response = await apiClient.put(`/fee-structures/${id}`, data);
    return response.data;
  },

  // Delete fee structure (admin)
  deleteFeeStructure: async (id: number) => {
    const response = await apiClient.delete(`/fee-structures/${id}`);
    return response.data;
  },

  // ============== Payment Methods ==============

  // Create payment intent (for online payment)
  createPaymentIntent: async (data: {
    record_id?: string;
    amount: number;
    currency?: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/payments/create-intent', data);
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (data: {
    payment_intent_id: string;
    payment_method?: string;
  }) => {
    const response = await apiClient.post('/payments/confirm', data);
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/payment-methods');
      return response.data;
    } catch {
      return [];
    }
  },
};

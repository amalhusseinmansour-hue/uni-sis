import apiClient from './client';

export const financeAPI = {
  // Get student financial records
  getStudentFinancials: async (studentId: string) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/financial-records`);
      return response.data;
    } catch (error: any) {
      console.warn('[Finance API] Student financials fetch failed:', error?.message);
      return null;
    }
  },

  // Get student balance
  getStudentBalance: async (studentId: string) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/balance`);
      return response.data;
    } catch (error: any) {
      console.warn('[Finance API] Student balance fetch failed:', error?.message);
      return { balance: 0, total_debits: 0, total_credits: 0 };
    }
  },

  // Get all financial records (admin/finance)
  getAllRecords: async (filters?: {
    type?: 'DEBIT' | 'CREDIT';
    status?: 'PAID' | 'PENDING' | 'OVERDUE';
    student_id?: string;
    from_date?: string;
    to_date?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/financial-records', { params: filters });
    return response.data;
  },

  // Get financial record by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/financial-records/${id}`);
    return response.data;
  },

  // Create financial record (admin/finance)
  createRecord: async (data: {
    student_id: string;
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
  updateRecord: async (id: string, data: any) => {
    const response = await apiClient.put(`/financial-records/${id}`, data);
    return response.data;
  },

  // Delete financial record (admin/finance)
  deleteRecord: async (id: string) => {
    const response = await apiClient.delete(`/financial-records/${id}`);
    return response.data;
  },

  // Mark record as paid (admin/finance)
  markPaid: async (id: string, data?: {
    payment_date?: string;
    payment_method?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post(`/financial-records/${id}/mark-paid`, data || {});
    return response.data;
  },

  // Mark record as overdue (admin/finance)
  markOverdue: async (id: string) => {
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

  // Get my balance (student)
  getMyBalance: async () => {
    const response = await apiClient.get('/my-balance');
    return response.data;
  },

  // Get my financial records (student)
  getMyFinancials: async () => {
    const response = await apiClient.get('/my-financial-records');
    return response.data;
  },

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
    const response = await apiClient.get('/payment-methods');
    return response.data;
  },
};

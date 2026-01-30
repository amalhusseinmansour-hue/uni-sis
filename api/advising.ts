import apiClient from './client';

export const advisingAPI = {
  // Get student's assigned advisor
  getMyAdvisor: async () => {
    const response = await apiClient.get('/my-advisor');
    return response.data;
  },

  // Get advisor by ID
  getAdvisorById: async (advisorId: string) => {
    const response = await apiClient.get(`/advisors/${advisorId}`);
    return response.data;
  },

  // Get available appointment slots
  getAvailableSlots: async (advisorId: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get(`/advisors/${advisorId}/slots`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  // Book an appointment
  bookAppointment: async (data: {
    advisorId: string;
    date: string;
    time: string;
    type: 'in-person' | 'online';
    reason: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/advising/appointments', data);
    return response.data;
  },

  // Get my appointments
  getMyAppointments: async (status?: 'upcoming' | 'completed' | 'cancelled') => {
    const response = await apiClient.get('/my-appointments', {
      params: { status },
    });
    return response.data;
  },

  // Get advisor's appointments (for advisors to see their schedule)
  getAdvisorAppointments: async (params?: {
    status?: 'upcoming' | 'completed' | 'cancelled';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/advising/advisor/appointments', {
      params: {
        status: params?.status,
        start_date: params?.startDate,
        end_date: params?.endDate,
        page: params?.page,
        limit: params?.limit,
      },
    });
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string, reason?: string) => {
    const response = await apiClient.post(`/advising/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId: string, newDate: string, newTime: string) => {
    const response = await apiClient.put(`/advising/appointments/${appointmentId}/reschedule`, {
      date: newDate,
      time: newTime,
    });
    return response.data;
  },

  // Get messages with advisor (advisorId optional - returns all messages if not provided)
  getMessages: async (advisorId?: string, page?: number, limit?: number) => {
    const url = advisorId ? `/advising/messages/${advisorId}` : '/advising/messages';
    const response = await apiClient.get(url, {
      params: { page, limit },
    });
    return response.data;
  },

  // Send message to advisor
  sendMessage: async (data: {
    advisorId: string;
    content: string;
    subject?: string;
    attachments?: File[];
  }) => {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('advisor_id', data.advisorId);
    if (data.subject) {
      formData.append('subject', data.subject);
    }
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }
    const response = await apiClient.post('/advising/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Mark message as read
  markAsRead: async (messageId: string) => {
    const response = await apiClient.post(`/advising/messages/${messageId}/read`);
    return response.data;
  },

  // Get study plan recommendations (alias: getMyRecommendations)
  getRecommendations: async () => {
    const response = await apiClient.get('/my-recommendations');
    return response.data;
  },

  // Get my recommendations (alias for getRecommendations)
  getMyRecommendations: async () => {
    const response = await apiClient.get('/my-recommendations');
    return response.data;
  },

  // Get study plan milestones
  getMilestones: async () => {
    const response = await apiClient.get('/advising/milestones');
    return response.data;
  },

  // Get study plan progress
  getStudyPlanProgress: async () => {
    const response = await apiClient.get('/my-study-plan-progress');
    return response.data;
  },

  // Get remaining courses
  getRemainingCourses: async () => {
    const response = await apiClient.get('/my-remaining-courses');
    return response.data;
  },

  // Request study plan change
  requestStudyPlanChange: async (data: {
    type: 'add_course' | 'remove_course' | 'change_major' | 'other';
    details: string;
    courses?: string[];
  }) => {
    const response = await apiClient.post('/advising/plan-change-request', data);
    return response.data;
  },

  // Mark recommendation as read/acknowledged
  acknowledgeRecommendation: async (recommendationId: string) => {
    const response = await apiClient.post(`/advising/recommendations/${recommendationId}/acknowledge`);
    return response.data;
  },
};

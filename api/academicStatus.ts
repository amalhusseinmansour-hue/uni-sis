import apiClient from './client';

export const academicStatusAPI = {
  // Get my academic status
  getMyStatus: async () => {
    const response = await apiClient.get('/my-academic-status');
    return response.data;
  },

  // Get my warnings
  getMyWarnings: async (status?: 'active' | 'resolved' | 'all') => {
    const response = await apiClient.get('/my-warnings', {
      params: { status },
    });
    return response.data;
  },

  // Get warning details
  getWarningById: async (warningId: string) => {
    const response = await apiClient.get(`/warnings/${warningId}`);
    return response.data;
  },

  // Acknowledge warning
  acknowledgeWarning: async (warningId: string) => {
    const response = await apiClient.post(`/warnings/${warningId}/acknowledge`);
    return response.data;
  },

  // Get improvement plan
  getImprovementPlan: async () => {
    const response = await apiClient.get('/my-improvement-plan');
    return response.data;
  },

  // Get GPA projection
  getGPAProjection: async () => {
    const response = await apiClient.get('/my-gpa-projection');
    return response.data;
  },

  // Get GPA history
  getGPAHistory: async () => {
    const response = await apiClient.get('/my-gpa-history');
    return response.data;
  },

  // Get support resources
  getSupportResources: async () => {
    const response = await apiClient.get('/academic-support-resources');
    return response.data;
  },

  // Request academic appeal
  submitAppeal: async (data: {
    warningId: string;
    reason: string;
    evidence?: File[];
    supportingDocuments?: string[];
  }) => {
    const formData = new FormData();
    formData.append('warning_id', data.warningId);
    formData.append('reason', data.reason);
    if (data.evidence) {
      data.evidence.forEach((file, index) => {
        formData.append(`evidence[${index}]`, file);
      });
    }
    if (data.supportingDocuments) {
      data.supportingDocuments.forEach((docId, index) => {
        formData.append(`supporting_documents[${index}]`, docId);
      });
    }
    const response = await apiClient.post('/academic-appeals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get my appeals
  getMyAppeals: async () => {
    const response = await apiClient.get('/my-academic-appeals');
    return response.data;
  },

  // Calculate required GPA to remove warning
  calculateRequiredGPA: async (targetCredits: number) => {
    const response = await apiClient.get('/calculate-required-gpa', {
      params: { credits: targetCredits },
    });
    return response.data;
  },

  // Get graduation eligibility check
  checkGraduationEligibility: async () => {
    const response = await apiClient.get('/my-graduation-eligibility');
    return response.data;
  },

  // Get dean's list eligibility
  checkDeansListEligibility: async () => {
    const response = await apiClient.get('/my-deans-list-eligibility');
    return response.data;
  },

  // Get honors eligibility
  checkHonorsEligibility: async () => {
    const response = await apiClient.get('/my-honors-eligibility');
    return response.data;
  },
};

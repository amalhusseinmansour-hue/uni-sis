import apiClient from './client';

export const certificatesAPI = {
  // Get available certificate types
  getAvailableTypes: async () => {
    const response = await apiClient.get('/certificates/types');
    return response.data;
  },

  // Get my certificate requests
  getMyRequests: async (status?: 'pending' | 'processing' | 'ready' | 'delivered' | 'rejected') => {
    const response = await apiClient.get('/my-certificate-requests', {
      params: { status },
    });
    return response.data;
  },

  // Get request by ID
  getRequestById: async (requestId: string) => {
    const response = await apiClient.get(`/certificate-requests/${requestId}`);
    return response.data;
  },

  // Create certificate request
  createRequest: async (data: {
    certificateType: string;
    purpose: string;
    language: 'ar' | 'en' | 'both';
    copies: number;
    deliveryMethod: 'pickup' | 'email' | 'both';
    notes?: string;
  }) => {
    const response = await apiClient.post('/certificate-requests', data);
    return response.data;
  },

  // Cancel request
  cancelRequest: async (requestId: string, reason?: string) => {
    const response = await apiClient.post(`/certificate-requests/${requestId}/cancel`, { reason });
    return response.data;
  },

  // Download certificate
  downloadCertificate: async (requestId: string) => {
    const response = await apiClient.get(`/certificate-requests/${requestId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get pickup QR code
  getPickupQR: async (requestId: string) => {
    const response = await apiClient.get(`/certificate-requests/${requestId}/qr`);
    return response.data;
  },

  // Verify certificate (public endpoint)
  verifyCertificate: async (verificationCode: string) => {
    const response = await apiClient.get(`/certificates/verify/${verificationCode}`);
    return response.data;
  },

  // Get my documents
  getMyDocuments: async () => {
    const response = await apiClient.get('/my-documents');
    return response.data;
  },

  // Upload document
  uploadDocument: async (file: File, type: string, expiryDate?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (expiryDate) {
      formData.append('expiry_date', expiryDate);
    }
    const response = await apiClient.post('/my-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update document
  updateDocument: async (documentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.put(`/my-documents/${documentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId: string) => {
    const response = await apiClient.delete(`/my-documents/${documentId}`);
    return response.data;
  },

  // Get document types
  getDocumentTypes: async () => {
    const response = await apiClient.get('/documents/types');
    return response.data;
  },

  // Check if student has pending financial obligations
  checkFinancialClearance: async () => {
    const response = await apiClient.get('/my-financial-clearance');
    return response.data;
  },
};

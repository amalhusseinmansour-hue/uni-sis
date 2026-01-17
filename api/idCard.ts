import apiClient from './client';

// Types
export interface DigitalIdCard {
  student: {
    id: number;
    student_id: string;
    name_en: string;
    name_ar?: string;
    profile_picture_url?: string;
    status: string;
    passport_no?: string;
    nationality?: string;
  };
  program?: {
    name_en: string;
    name_ar?: string;
    degree: string;
  };
  college?: {
    name_en: string;
    name_ar?: string;
  };
  department?: {
    name_en: string;
    name_ar?: string;
  };
  academic: {
    level: number;
    semester: number;
    gpa: number;
    academic_status: string;
    academic_year?: string;
  };
  validity: {
    current_semester?: {
      name: string;
      name_ar?: string;
      start_date?: string;
      end_date?: string;
    };
    issue_date: string;
    expiry_date: string;
  };
  verification: {
    qr_data: string;
    barcode: string;
  };
  needs_renewal?: boolean;
}

export interface StudentVerification {
  valid: boolean;
  message: string;
  message_ar: string;
  student?: {
    student_id: string;
    name_en: string;
    name_ar?: string;
    program?: string;
    program_ar?: string;
    level: number;
    status: string;
    profile_picture_url?: string;
  };
  valid_until?: string;
  expired_on?: string;
  student_status?: string;
}

export const idCardAPI = {
  // ==========================================
  // STUDENT ENDPOINTS
  // ==========================================

  // Get my digital ID card
  getMyIdCard: async (): Promise<DigitalIdCard> => {
    const response = await apiClient.get('/my-id-card');
    return response.data;
  },

  // Download my ID card PDF
  downloadMyIdCard: async (): Promise<Blob> => {
    const response = await apiClient.get('/my-id-card/download', {
      responseType: 'blob',
    });
    return response.data;
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  // Get student ID card data
  getStudentIdCard: async (studentId: number): Promise<DigitalIdCard> => {
    const response = await apiClient.get(`/id-cards/students/${studentId}`);
    return response.data;
  },

  // Generate student ID card PDF
  generateIdCardPdf: async (studentId: number): Promise<{
    message: string;
    message_ar: string;
    download_url: string;
    path: string;
  }> => {
    const response = await apiClient.post(`/id-cards/students/${studentId}/generate`);
    return response.data;
  },

  // Download student ID card PDF
  downloadIdCardPdf: async (studentId: number): Promise<Blob> => {
    const response = await apiClient.get(`/id-cards/students/${studentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Upload student photo
  uploadStudentPhoto: async (studentId: number, photo: File): Promise<{
    message: string;
    message_ar: string;
    photo_url: string;
    path: string;
  }> => {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await apiClient.post(`/id-cards/students/${studentId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Generate bulk ID cards
  generateBulkIdCards: async (studentIds: number[]): Promise<{
    message: string;
    message_ar: string;
    download_url: string;
    path: string;
    count: number;
  }> => {
    const response = await apiClient.post('/id-cards/bulk-generate', { student_ids: studentIds });
    return response.data;
  },

  // Download bulk ID cards PDF
  downloadBulkIdCards: async (studentIds: number[]): Promise<Blob> => {
    const response = await apiClient.post('/id-cards/bulk-download', { student_ids: studentIds }, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ==========================================
  // PUBLIC VERIFICATION
  // ==========================================

  // Verify student from QR code data
  verifyStudent: async (qrData: string): Promise<StudentVerification> => {
    const response = await apiClient.post('/verify/student', { qr_data: qrData });
    return response.data;
  },
};

// Helper function to download blob as file
export const downloadBlobAsFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

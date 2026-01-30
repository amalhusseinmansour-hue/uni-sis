import apiClient from './client';

export interface Program {
  id: number;
  code: string;
  name_en: string;
  name_ar?: string;
  type: 'BACHELOR' | 'MASTER' | 'PHD' | 'DIPLOMA';
  total_credits: number;
  department?: {
    id: number;
    name_en: string;
    name_ar?: string;
    college?: {
      id: number;
      name_en: string;
      name_ar?: string;
    };
  };
}

export interface College {
  id: number;
  code: string;
  name_en: string;
  name_ar?: string;
  departments?: Department[];
}

export interface Department {
  id: number;
  code: string;
  name_en: string;
  name_ar?: string;
  college_id: number;
  programs?: Program[];
}

export const programsAPI = {
  // Get all programs
  getAll: async (): Promise<Program[]> => {
    const response = await apiClient.get('/programs');
    return response.data?.data || response.data || [];
  },

  // Get program by ID
  getById: async (id: number): Promise<Program> => {
    const response = await apiClient.get(`/programs/${id}`);
    return response.data;
  },

  // Get programs by college
  getByCollege: async (collegeId: number): Promise<Program[]> => {
    const response = await apiClient.get(`/colleges/${collegeId}/programs`);
    return response.data?.data || response.data || [];
  },
};

export const collegesAPI = {
  // Get all colleges
  getAll: async (): Promise<College[]> => {
    const response = await apiClient.get('/colleges');
    return response.data?.data || response.data || [];
  },

  // Get college with programs
  getWithPrograms: async (id: number): Promise<College> => {
    const response = await apiClient.get(`/colleges/${id}/programs`);
    return response.data;
  },
};

export const departmentsAPI = {
  // Get all departments
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get('/departments');
    return response.data?.data || response.data || [];
  },
};

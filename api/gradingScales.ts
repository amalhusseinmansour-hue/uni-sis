import apiClient from './client';

export interface GradingScale {
  id: number;
  letter_grade: string;
  min_score: number;
  max_score: number;
  grade_points: number;
  description_en: string | null;
  description_ar: string | null;
  is_passing: boolean;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface GradingScaleInput {
  letter_grade: string;
  min_score: number;
  max_score: number;
  grade_points: number;
  description_en?: string;
  description_ar?: string;
  is_passing?: boolean;
  is_active?: boolean;
  order?: number;
}

export interface GradeCalculationResult {
  score: number;
  letter_grade: string;
  grade_points: number;
  is_passing: boolean;
  description_en: string | null;
  description_ar: string | null;
}

export const gradingScalesAPI = {
  // Get all grading scales
  getAll: async (active?: boolean): Promise<{ data: GradingScale[]; total: number }> => {
    const params = active !== undefined ? { active } : {};
    const response = await apiClient.get('/grading-scales', { params });
    return response.data;
  },

  // Get grading scale by ID
  getById: async (id: number | string): Promise<{ data: GradingScale }> => {
    const response = await apiClient.get(`/grading-scales/${id}`);
    return response.data;
  },

  // Create a new grading scale
  create: async (data: GradingScaleInput): Promise<{ message: string; data: GradingScale }> => {
    const response = await apiClient.post('/grading-scales', data);
    return response.data;
  },

  // Update grading scale
  update: async (id: number | string, data: Partial<GradingScaleInput>): Promise<{ message: string; data: GradingScale }> => {
    const response = await apiClient.put(`/grading-scales/${id}`, data);
    return response.data;
  },

  // Delete grading scale
  delete: async (id: number | string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/grading-scales/${id}`);
    return response.data;
  },

  // Reorder grading scales
  reorder: async (scales: { id: number; order: number }[]): Promise<{ message: string }> => {
    const response = await apiClient.post('/grading-scales/reorder', { scales });
    return response.data;
  },

  // Calculate grade for a score
  calculateGrade: async (score: number): Promise<GradeCalculationResult> => {
    const response = await apiClient.post('/grading-scales/calculate', { score });
    return response.data;
  },

  // Reset to default grading scale
  resetToDefault: async (): Promise<{ message: string; data: GradingScale[] }> => {
    const response = await apiClient.post('/grading-scales/reset');
    return response.data;
  },
};

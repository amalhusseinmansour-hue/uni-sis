import apiClient from './client';

export interface Grade {
  id: number;
  student_id: number;
  course_id: number;
  semester_id: number;
  midterm_score?: number;
  final_score?: number;
  assignments_score?: number;
  total_score?: number;
  letter_grade?: string;
  grade_points?: number;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'CONTESTED';
  remarks?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    student_id: string;
    name_en: string;
    name_ar: string;
  };
  course?: {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
    credits: number;
  };
  semester?: {
    id: number;
    name_en: string;
    name_ar: string;
    academic_year: string;
  };
}

export interface GradeFilters {
  student_id?: string | number;
  course_id?: string | number;
  semester_id?: string | number;
  status?: Grade['status'];
  per_page?: number;
  page?: number;
}

export interface GradeInput {
  student_id: number | string;
  course_id: number | string;
  semester_id: number | string;
  midterm_score?: number;
  final_score?: number;
  assignments_score?: number;
  total_score?: number;
  letter_grade?: string;
  grade_points?: number;
  status: Grade['status'];
  remarks?: string;
}

export interface GradeUpdateInput {
  midterm_score?: number;
  final_score?: number;
  assignments_score?: number;
  total_score?: number;
  letter_grade?: string;
  grade_points?: number;
  status?: Grade['status'];
  remarks?: string;
}

export interface GPAResult {
  gpa: number;
  total_credits: number;
  courses_completed: number;
}

export const gradesAPI = {
  // Get all grades with filters
  getAll: async (filters?: GradeFilters) => {
    const response = await apiClient.get('/grades', { params: filters });
    return response.data;
  },

  // Get grade by ID
  getById: async (id: number | string) => {
    const response = await apiClient.get(`/grades/${id}`);
    return response.data;
  },

  // Create a new grade
  create: async (data: GradeInput) => {
    const response = await apiClient.post('/grades', data);
    return response.data;
  },

  // Update grade
  update: async (id: number | string, data: GradeUpdateInput) => {
    const response = await apiClient.put(`/grades/${id}`, data);
    return response.data;
  },

  // Delete grade
  delete: async (id: number | string) => {
    const response = await apiClient.delete(`/grades/${id}`);
    return response.data;
  },

  // Approve a grade
  approve: async (id: number | string) => {
    const response = await apiClient.post(`/grades/${id}/approve`);
    return response.data;
  },

  // Calculate GPA for a student
  calculateGPA: async (studentId: number | string): Promise<GPAResult> => {
    const response = await apiClient.post('/grades/calculate-gpa', { student_id: studentId });
    return response.data;
  },

  // Bulk approve grades
  bulkApprove: async (gradeIds: (number | string)[]) => {
    const response = await apiClient.post('/bulk/grades/approve', { grade_ids: gradeIds });
    return response.data;
  },

  // Bulk update grades
  bulkUpdate: async (grades: { id: number | string; data: GradeUpdateInput }[]) => {
    const response = await apiClient.post('/bulk/grades', { grades });
    return response.data;
  },

  // Get grades for a specific student
  getStudentGrades: async (studentId: number | string, semesterId?: number | string) => {
    const params: GradeFilters = { student_id: studentId };
    if (semesterId) params.semester_id = semesterId;
    const response = await apiClient.get('/grades', { params });
    return response.data;
  },

  // Get grades for a specific course
  getCourseGrades: async (courseId: number | string, semesterId?: number | string) => {
    const params: GradeFilters = { course_id: courseId };
    if (semesterId) params.semester_id = semesterId;
    const response = await apiClient.get('/grades', { params });
    return response.data;
  },

  // Get grades statistics for a course
  getCourseStatistics: async (courseId: number | string, semesterId?: number | string) => {
    const grades = await gradesAPI.getCourseGrades(courseId, semesterId);
    const gradesList = grades.data || [];

    if (gradesList.length === 0) {
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        passing: 0,
        failing: 0,
        distribution: {},
      };
    }

    const scores = gradesList.map((g: Grade) => g.total_score || 0);
    const letterGrades = gradesList.map((g: Grade) => g.letter_grade || 'N/A');

    const distribution: Record<string, number> = {};
    letterGrades.forEach((grade: string) => {
      distribution[grade] = (distribution[grade] || 0) + 1;
    });

    return {
      total: gradesList.length,
      average: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passing: gradesList.filter((g: Grade) => (g.total_score || 0) >= 60).length,
      failing: gradesList.filter((g: Grade) => (g.total_score || 0) < 60).length,
      distribution,
    };
  },
};

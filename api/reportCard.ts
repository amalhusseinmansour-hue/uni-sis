import apiClient from './client';

// Types
export interface CourseGrade {
  course_code: string;
  course_name_en: string;
  course_name_ar?: string;
  credits: number;
  type: string;
  grade: string;
  grade_points: number;
  status: 'PENDING' | 'APPROVED' | 'FINAL';
  passed: boolean;
  midterm_score?: number;
  final_score?: number;
  total_score?: number;
  attendance_percentage?: number;
}

export interface ReportCardSummary {
  total_courses: number;
  total_credits: number;
  earned_credits: number;
  semester_gpa: number;
  cumulative_gpa: number;
  academic_standing: string;
  academic_standing_ar: string;
}

export interface AttendanceSummary {
  total_classes: number;
  attended_classes: number;
  missed_classes: number;
  attendance_percentage: number;
}

export interface RankingInfo {
  rank: number;
  total_students: number;
  percentile: number;
}

export interface ReportCardData {
  student: {
    id: number;
    student_id: string;
    name_en: string;
    name_ar?: string;
    profile_picture_url?: string;
    level: number;
    gpa: number;
    academic_standing: string;
    academic_standing_ar: string;
  };
  program?: {
    name_en: string;
    name_ar?: string;
    degree: string;
    department?: string;
    department_ar?: string;
    college?: string;
    college_ar?: string;
  };
  semester: {
    id: number;
    name: string;
    name_ar?: string;
    academic_year: string;
    start_date: string;
    end_date: string;
  };
  courses: CourseGrade[];
  summary: ReportCardSummary;
  attendance: AttendanceSummary;
  ranking: RankingInfo;
  generated_at: string;
}

export interface ReportCardListItem {
  semester: {
    id: number;
    name: string;
    name_ar?: string;
    academic_year: string;
  };
  summary: {
    total_courses: number;
    total_credits: number;
    earned_credits: number;
    semester_gpa: number;
    has_pending_grades: boolean;
  };
}

export const reportCardAPI = {
  // ==========================================
  // STUDENT ENDPOINTS
  // ==========================================

  // Get my report cards list
  getMyReportCards: async (): Promise<{
    student: any;
    report_cards: ReportCardListItem[];
  }> => {
    const response = await apiClient.get('/my-report-cards');
    return response.data;
  },

  // Get my report card for specific semester
  getMyReportCard: async (semesterId: number): Promise<ReportCardData> => {
    const response = await apiClient.get(`/my-report-cards/${semesterId}`);
    return response.data;
  },

  // Download my report card PDF
  downloadMyReportCard: async (semesterId: number, lang: 'en' | 'ar' = 'en'): Promise<Blob> => {
    const response = await apiClient.get(`/my-report-cards/${semesterId}/download`, {
      params: { lang },
      responseType: 'blob',
    });
    return response.data;
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  // Get all report cards for a student
  getStudentReportCards: async (studentId: number): Promise<{
    student: any;
    report_cards: ReportCardListItem[];
  }> => {
    const response = await apiClient.get(`/report-cards/students/${studentId}`);
    return response.data;
  },

  // Get student report card for specific semester
  getStudentReportCard: async (studentId: number, semesterId: number): Promise<ReportCardData> => {
    const response = await apiClient.get(`/report-cards/students/${studentId}/semesters/${semesterId}`);
    return response.data;
  },

  // Generate report card PDF
  generateReportCardPdf: async (studentId: number, semesterId: number, lang: 'en' | 'ar' = 'en'): Promise<{
    message: string;
    message_ar: string;
    download_url: string;
    path: string;
  }> => {
    const response = await apiClient.post(
      `/report-cards/students/${studentId}/semesters/${semesterId}/generate`,
      {},
      { params: { lang } }
    );
    return response.data;
  },

  // Download report card PDF
  downloadReportCardPdf: async (studentId: number, semesterId: number, lang: 'en' | 'ar' = 'en'): Promise<Blob> => {
    const response = await apiClient.get(
      `/report-cards/students/${studentId}/semesters/${semesterId}/download`,
      {
        params: { lang },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // Generate bulk report cards
  generateBulkReportCards: async (
    studentIds: number[],
    semesterId: number,
    lang: 'en' | 'ar' = 'en'
  ): Promise<{
    message: string;
    message_ar: string;
    download_url: string;
    path: string;
    count: number;
  }> => {
    const response = await apiClient.post('/report-cards/bulk-generate', {
      student_ids: studentIds,
      semester_id: semesterId,
      lang,
    });
    return response.data;
  },

  // Download bulk report cards PDF
  downloadBulkReportCards: async (
    studentIds: number[],
    semesterId: number,
    lang: 'en' | 'ar' = 'en'
  ): Promise<Blob> => {
    const response = await apiClient.post(
      '/report-cards/bulk-download',
      {
        student_ids: studentIds,
        semester_id: semesterId,
        lang,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

// Helper function to download blob as file
export const downloadReportCard = (blob: Blob, studentId: string, semesterId: number, lang: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report_card_${studentId}_${semesterId}_${lang}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

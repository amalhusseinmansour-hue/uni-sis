// Export all API modules
export { authAPI } from './auth';
export { studentsAPI } from './students';
export { coursesAPI } from './courses';
export { enrollmentsAPI } from './enrollments';
export { financeAPI } from './finance';
export { studentRequestsApi, formDataApi } from './studentRequests';
export { disciplineAPI } from './discipline';
export { idCardAPI, downloadBlobAsFile } from './idCard';
export { reportCardAPI, downloadReportCard } from './reportCard';
export { scheduleAPI } from './schedule';
export { attendanceAPI } from './attendance';
export { dashboardAPI } from './dashboard';
export { examsAPI } from './exams';
export { settingsAPI } from './settings';
export { advisingAPI } from './advising';
export { certificatesAPI } from './certificates';
export { academicStatusAPI } from './academicStatus';
export { paymentPlansAPI } from './paymentPlans';
export { brandingAPI } from './branding';
export { usersAPI } from './users';
export { rolesAPI, SYSTEM_MODULES, DEFAULT_ROLES } from './roles';
export { lmsAPI } from './lms';
export { default as apiClient } from './client';

// Dynamic Configuration APIs
export { dynamicFormsApi } from './dynamicForms';
export { dynamicTablesApi } from './dynamicTables';
export { dynamicReportsApi } from './dynamicReports';

// Admin APIs
export * as adminConfigApi from './admin/config';
export * as adminTableBuilderApi from './admin/tableBuilder';
export * as adminFormBuilderApi from './admin/formBuilder';
export * as adminReportBuilderApi from './admin/reportBuilder';

// Type exports
export type {
  DynamicForm,
  DynamicFormField,
  DynamicFormSection,
  DynamicFormSubmission,
} from './dynamicForms';

export type {
  DynamicTable,
  DynamicTableColumn,
  DynamicTableFilter,
  DynamicTableSettings,
  TableDataRow,
  TableDataResponse,
  TableView,
} from './dynamicTables';

export type {
  DynamicReport,
  DynamicReportField,
  DynamicReportParameter,
  DynamicReportChart,
  ReportGenerationResult,
  ReportSchedule,
  ReportStats,
} from './dynamicReports';

export type {
  PaymentPlan,
  Installment,
  Scholarship,
  StudentScholarship,
  ScholarshipApplication,
} from './paymentPlans';

// Reports
export const reportsAPI = {
  // Download transcript PDF
  downloadTranscript: async (studentId: string) => {
    // SECURITY: Check sessionStorage first
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reports/students/${studentId}/transcript/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${studentId}.pdf`;
    a.click();
  },

  // Download financial report
  downloadFinancialReport: async (studentId: string) => {
    // SECURITY: Check sessionStorage first
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reports/students/${studentId}/financial`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-${studentId}.xlsx`;
    a.click();
  },

  // Get student transcript data
  getTranscript: async (studentId: string) => {
    const response = await (await import('./client')).default.get(`/reports/students/${studentId}/transcript`);
    return response.data;
  },

  // Get grade report
  getGradeReport: async (studentId: string) => {
    const response = await (await import('./client')).default.get(`/reports/students/${studentId}/grades`);
    return response.data;
  },

  // Get academic summary
  getAcademicSummary: async (studentId: string) => {
    const response = await (await import('./client')).default.get(`/reports/students/${studentId}/academic-summary`);
    return response.data;
  },

  // Get attendance report
  getAttendanceReport: async (studentId: string) => {
    const response = await (await import('./client')).default.get(`/reports/students/${studentId}/attendance`);
    return response.data;
  },

  // Get enrollment report
  getEnrollmentReport: async (studentId: string) => {
    const response = await (await import('./client')).default.get(`/reports/students/${studentId}/enrollments`);
    return response.data;
  },
};

// Notifications
export const notificationsAPI = {
  // Get all notifications
  getAll: async () => {
    const response = await (await import('./client')).default.get('/notifications');
    return response.data;
  },

  // Get unread notifications
  getUnread: async () => {
    const response = await (await import('./client')).default.get('/notifications/unread');
    return response.data;
  },

  // Get unread count
  getCount: async () => {
    const response = await (await import('./client')).default.get('/notifications/count');
    return response.data;
  },

  // Get notification by ID
  getById: async (id: string) => {
    const response = await (await import('./client')).default.get(`/notifications/${id}`);
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (id: string) => {
    const response = await (await import('./client')).default.post(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await (await import('./client')).default.post('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  delete: async (id: string) => {
    const response = await (await import('./client')).default.delete(`/notifications/${id}`);
    return response.data;
  },

  // Delete all notifications
  deleteAll: async () => {
    const response = await (await import('./client')).default.delete('/notifications/delete-all');
    return response.data;
  },

  // Send test notifications (for testing)
  sendTestNotifications: async () => {
    const response = await (await import('./client')).default.post('/notifications/test');
    return response.data;
  },

  // Send notification (Admin only)
  send: async (data: {
    title: string;
    title_ar?: string;
    message: string;
    message_ar?: string;
    type?: string;
    user_ids?: number[];
    broadcast?: boolean;
  }) => {
    const response = await (await import('./client')).default.post('/notifications/send', data);
    return response.data;
  },
};

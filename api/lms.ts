import apiClient from './client';

// =========================================================================
// LMS INTEGRATION API
// =========================================================================

export interface LmsStatus {
  connected: boolean;
  lms_url: string;
  last_sync: string | null;
  sync_enabled: boolean;
  statistics: {
    users_synced: number;
    courses_synced: number;
    enrollments_synced: number;
    grades_synced: number;
    pending_syncs: number;
    failed_syncs: number;
  };
}

export interface SyncStatistics {
  users: {
    total: number;
    synced: number;
    pending: number;
    failed: number;
  };
  courses: {
    total: number;
    synced: number;
    pending: number;
    failed: number;
  };
  enrollments: {
    total: number;
    synced: number;
    pending: number;
    failed: number;
  };
  grades: {
    total: number;
    synced: number;
    pending: number;
    failed: number;
  };
}

export interface SyncLog {
  id: number;
  type: string;
  action: string;
  entity_type: string;
  entity_id: number;
  status: 'success' | 'failed' | 'pending';
  message: string;
  data: any;
  created_at: string;
}

export const lmsAPI = {
  // Get LMS connection status and statistics
  getStatus: async (): Promise<LmsStatus> => {
    const response = await apiClient.get('/moodle/status');
    return response.data;
  },

  // Get detailed sync statistics
  getSyncStatus: async (): Promise<SyncStatistics> => {
    const response = await apiClient.get('/moodle/sync/status');
    return response.data;
  },

  // Test LMS connection
  testConnection: async (config?: {
    url?: string;
    token?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/moodle/test-connection', config);
    return response.data;
  },

  // Sync students to LMS
  syncStudents: async (studentIds?: number[]): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> => {
    const response = await apiClient.post('/moodle/sync/students', { student_ids: studentIds });
    return response.data;
  },

  // Sync lecturers to LMS
  syncLecturers: async (lecturerIds?: number[]): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> => {
    const response = await apiClient.post('/moodle/sync/lecturers', { lecturer_ids: lecturerIds });
    return response.data;
  },

  // Sync courses to LMS
  syncCourses: async (courseIds?: number[]): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> => {
    const response = await apiClient.post('/moodle/sync/courses', { course_ids: courseIds });
    return response.data;
  },

  // Sync enrollments to LMS
  syncEnrollments: async (enrollmentIds?: number[]): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> => {
    const response = await apiClient.post('/moodle/sync/enrollments', { enrollment_ids: enrollmentIds });
    return response.data;
  },

  // Import grades from LMS
  importGrades: async (courseId?: number): Promise<{
    success: boolean;
    imported: number;
    failed: number;
    errors: string[];
  }> => {
    const response = await apiClient.post('/moodle/import/grades', { course_id: courseId });
    return response.data;
  },

  // Sync grades back to SIS
  syncGradesToSIS: async (): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> => {
    const response = await apiClient.post('/moodle/sync/grades-to-sis');
    return response.data;
  },

  // Retry failed sync operations
  retryFailed: async (type?: string): Promise<{
    success: boolean;
    retried: number;
    succeeded: number;
    failed: number;
  }> => {
    const response = await apiClient.post('/moodle/retry-failed', { type });
    return response.data;
  },

  // Get sync logs
  getLogs: async (params?: {
    type?: string;
    status?: string;
    entity_type?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: SyncLog[];
    meta: {
      total: number;
      current_page: number;
      last_page: number;
      per_page: number;
    };
  }> => {
    const response = await apiClient.get('/moodle/logs', { params });
    return response.data;
  },

  // Full sync - all data types
  fullSync: async (): Promise<{
    success: boolean;
    results: {
      students: { synced: number; failed: number };
      lecturers: { synced: number; failed: number };
      courses: { synced: number; failed: number };
      enrollments: { synced: number; failed: number };
    };
    errors: string[];
  }> => {
    const response = await apiClient.post('/moodle/sync/all');
    return response.data;
  },
};

export default lmsAPI;

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

export interface LmsStudent {
  id: number;
  moodle_id: number;
  student_id: string | null;
  username: string;
  name_en: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  city: string;
  department: string;
  profile_url: string | null;
  last_access: string | null;
  exists_in_sis: boolean;
  source: 'LMS';
}

export interface LmsUser {
  id: number;
  moodle_id: number;
  username: string;
  name_en: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  city: string;
  department: string;
  profile_url: string | null;
  last_access: string | null;
  exists_in_sis: boolean;
  sis_role?: string | null;
  source: 'LMS';
}

export interface LmsLecturer extends LmsUser {}

export const lmsAPI = {
  // Get all students from LMS (view only)
  getLmsStudents: async (): Promise<{
    success: boolean;
    total: number;
    students: LmsStudent[];
    error?: string;
  }> => {
    const response = await apiClient.get('/moodle/students');
    return response.data;
  },

  // Get all users from LMS (for admin selection)
  getLmsUsers: async (): Promise<{
    success: boolean;
    total: number;
    users: LmsUser[];
    error?: string;
  }> => {
    const response = await apiClient.get('/moodle/users');
    return response.data;
  },

  // Get lecturers from LMS (auto-detected)
  getLmsLecturers: async (): Promise<{
    success: boolean;
    total: number;
    lecturers: LmsLecturer[];
    error?: string;
  }> => {
    const response = await apiClient.get('/moodle/lecturers');
    return response.data;
  },

  // Import lecturers from LMS to SIS
  importLecturersFromLms: async (moodleUserIds: number[]): Promise<{
    success: boolean;
    message: string;
    data: {
      imported: number;
      updated: number;
      skipped: number;
      failed: number;
      lecturers: Array<{
        id: number;
        name: string;
        email: string;
        status: 'imported' | 'updated' | 'updated_to_lecturer';
      }>;
      errors: Array<{
        moodle_user_id: number;
        username: string;
        error: string;
      }>;
    };
  }> => {
    const response = await apiClient.post('/moodle/import/lecturers', {
      moodle_user_ids: moodleUserIds
    }, {
      timeout: 180000 // 3 minutes
    });
    return response.data;
  },

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

  // Import students from LMS to SIS
  importStudentsFromLms: async (): Promise<{
    success: boolean;
    message: string;
    message_ar: string;
    data: {
      imported: number;
      updated: number;
      skipped: number;
      failed: number;
      students: Array<{
        id: number;
        student_id: string;
        name: string;
        email: string;
        status: 'imported' | 'updated';
      }>;
      errors: string[];
    };
  }> => {
    // Use longer timeout (3 minutes) for importing many students
    const response = await apiClient.post('/moodle/import/students', {}, {
      timeout: 180000 // 3 minutes
    });
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

  // Sync profile pictures from LMS
  syncProfilePictures: async (studentId?: number): Promise<{
    success: boolean;
    message: string;
    message_ar: string;
    data?: {
      success: number;
      failed: number;
      skipped: number;
      errors: Array<{ student: string; error: string }>;
    };
  }> => {
    const response = await apiClient.post('/moodle/sync/profile-pictures',
      studentId ? { student_id: studentId } : {},
      { timeout: 300000 } // 5 minutes for syncing all photos
    );
    return response.data;
  },

  // Admin: Get all LMS grades
  getAdminLmsGrades: async (params?: {
    semester_id?: number;
    course_id?: number;
    student_id?: number;
  }): Promise<{
    success: boolean;
    data: any[];
    count: number;
  }> => {
    const response = await apiClient.get('/moodle/grades', { params });
    return response.data;
  },

  // Admin: Add LMS grade
  addLmsGrade: async (data: {
    enrollment_id: number;
    moodle_grade: number;
    moodle_grade_max: number;
    completion_status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    grade_items?: any;
  }): Promise<{ success: boolean; message: string; id?: number }> => {
    const response = await apiClient.post('/moodle/grades', data);
    return response.data;
  },

  // Admin: Update LMS grade
  updateLmsGrade: async (id: number, data: {
    moodle_grade?: number;
    moodle_grade_max?: number;
    completion_status?: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    grade_items?: any;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put(`/moodle/grades/${id}`, data);
    return response.data;
  },

  // Admin: Delete LMS grade
  deleteLmsGrade: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/moodle/grades/${id}`);
    return response.data;
  },

  // Get student's enrolled courses from LMS
  getMyLmsCourses: async (): Promise<{
    success: boolean;
    source: 'LMS' | 'SIS';
    data: Array<{
      moodle_course_id: number;
      shortname: string;
      fullname: string;
      startdate: string | null;
      enddate: string | null;
      progress: number | null;
      completed: boolean;
      sis_course_id: number | null;
      course_code: string;
      course_name_en: string;
      course_name_ar: string | null;
      credits: number;
      semester_name: string | null;
      academic_year: string | null;
    }>;
    count: number;
    message?: string;
  }> => {
    const response = await apiClient.get('/my-lms-courses');
    return response.data;
  },

  // Get student's own LMS grades
  getMyLmsGrades: async (): Promise<{
    success: boolean;
    data: Array<{
      enrollment_id: number;
      course_id: number;
      course_code: string;
      course_name_en: string;
      course_name_ar: string;
      credits: number;
      semester_id: number;
      semester_name: string;
      academic_year: string;
      moodle_grade: number | null;
      moodle_grade_max: number;
      percentage: number | null;
      completion_status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
      completed_at: string | null;
      grade_items: any;
      synced_to_sis: boolean;
      received_at: string | null;
    }>;
    count: number;
  }> => {
    const response = await apiClient.get('/my-lms-grades');
    return response.data;
  },

  // Get student's LMS profile with all data
  getMyLmsProfile: async (): Promise<{
    success: boolean;
    connected: boolean;
    moodle_user_id?: number;
    username?: string;
    last_synced_at?: string;
    message?: string;
    message_ar?: string;
    profile?: {
      id: number;
      username: string;
      firstname: string;
      lastname: string;
      fullname: string;
      email: string;
      department: string;
      country: string;
      city: string;
      profile_image: string | null;
      profile_image_small: string | null;
      last_access: string | null;
      first_access: string | null;
    };
    statistics?: {
      enrolled_courses: number;
      completed_courses: number;
      in_progress_courses: number;
      average_progress: number;
      grades_received: number;
    };
    courses?: Array<{
      moodle_course_id: number;
      shortname: string;
      fullname: string;
      startdate: string | null;
      enddate: string | null;
      progress: number | null;
      completed: boolean;
      sis_course_id: number | null;
      course_code: string;
      credits: number;
    }>;
    grades?: Array<{
      course_code: string;
      course_name_en: string;
      course_name_ar: string | null;
      credits: number;
      semester: string;
      academic_year: string;
      moodle_grade: number | null;
      moodle_grade_max: number;
      percentage: number | null;
      completion_status: string;
      completed_at: string | null;
    }>;
  }> => {
    const response = await apiClient.get('/my-lms-profile');
    return response.data;
  },
};

export default lmsAPI;

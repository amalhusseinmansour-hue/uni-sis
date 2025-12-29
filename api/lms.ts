/**
 * OpenLMS/Moodle API Integration
 *
 * This module provides integration with OpenLMS (based on Moodle) to fetch:
 * - Student courses and enrollments
 * - Grades and assignments
 * - Attendance records
 * - Course content and resources
 *
 * Configuration:
 * - LMS_BASE_URL: The base URL of your OpenLMS instance
 * - LMS_TOKEN: Web service token for API access
 */

import axios, { AxiosInstance } from 'axios';
import apiClient from './client';

// Configuration - should be moved to environment variables
const LMS_CONFIG = {
  baseUrl: import.meta.env.VITE_LMS_URL || 'https://lms.vertexuniversity.edu.eu',
  token: import.meta.env.VITE_LMS_TOKEN || '',
  wsPath: '/webservice/rest/server.php',
};

// Create axios instance for LMS
const lmsClient: AxiosInstance = axios.create({
  baseURL: LMS_CONFIG.baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// Types for LMS data
export interface LMSCourse {
  id: number;
  shortname: string;
  fullname: string;
  fullnameAr?: string;
  summary: string;
  startdate: number;
  enddate: number;
  visible: boolean;
  progress?: number;
  completed?: boolean;
  lastaccess?: number;
}

export interface LMSGrade {
  courseid: number;
  coursename: string;
  userid: number;
  grade: number | null;
  grademax: number;
  grademin: number;
  feedback?: string;
  timecreated?: number;
  timemodified?: number;
}

export interface LMSAssignment {
  id: number;
  course: number;
  coursename: string;
  name: string;
  intro: string;
  duedate: number;
  allowsubmissionsfromdate: number;
  grade: number;
  submitted: boolean;
  graded: boolean;
  submissionstatus?: string;
  gradingstatus?: string;
  usergrade?: number;
}

export interface LMSAttendance {
  courseid: number;
  coursename: string;
  sessionid: number;
  sessiondate: number;
  duration: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface LMSActivity {
  id: number;
  course: number;
  name: string;
  modname: string;
  modicon: string;
  instance: number;
  url: string;
  visible: boolean;
  completion?: number;
  completionstate?: number;
}

export interface LMSUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  profileimageurl?: string;
  roles?: string[];
}

// Helper function to make API calls
const callLMSFunction = async <T>(wsfunction: string, params: Record<string, any> = {}): Promise<T> => {
  const formData = new URLSearchParams();
  formData.append('wstoken', LMS_CONFIG.token);
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', wsfunction);

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === 'object') {
          Object.entries(v).forEach(([k, val]) => {
            formData.append(`${key}[${i}][${k}]`, String(val));
          });
        } else {
          formData.append(`${key}[${i}]`, String(v));
        }
      });
    } else {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await lmsClient.post(LMS_CONFIG.wsPath, formData);

    // Check for Moodle errors
    if (response.data && response.data.exception) {
      throw new Error(response.data.message || 'LMS API Error');
    }

    return response.data as T;
  } catch (error: any) {
    console.error(`LMS API Error (${wsfunction}):`, error);
    throw error;
  }
};

// Main LMS API module
export const lmsAPI = {
  /**
   * Get site information
   */
  getSiteInfo: async () => {
    return callLMSFunction<{
      sitename: string;
      username: string;
      firstname: string;
      lastname: string;
      fullname: string;
      userid: number;
      userpictureurl: string;
      functions: { name: string; version: string }[];
    }>('core_webservice_get_site_info');
  },

  /**
   * Get current user's enrolled courses
   */
  getMyCourses: async (userid?: number): Promise<LMSCourse[]> => {
    const courses = await callLMSFunction<any[]>('core_enrol_get_users_courses', {
      userid: userid || 0,
    });

    return courses.map(course => ({
      id: course.id,
      shortname: course.shortname,
      fullname: course.fullname,
      summary: course.summary || '',
      startdate: course.startdate,
      enddate: course.enddate,
      visible: course.visible === 1,
      progress: course.progress,
      completed: course.completed,
      lastaccess: course.lastaccess,
    }));
  },

  /**
   * Get user grades for all courses
   */
  getMyGrades: async (userid?: number): Promise<LMSGrade[]> => {
    const response = await callLMSFunction<{ grades: any[] }>('gradereport_overview_get_course_grades', {
      userid: userid || 0,
    });

    return response.grades.map(grade => ({
      courseid: grade.courseid,
      coursename: grade.coursename || '',
      userid: grade.userid,
      grade: grade.grade !== null ? parseFloat(grade.grade) : null,
      grademax: grade.grademax || 100,
      grademin: grade.grademin || 0,
    }));
  },

  /**
   * Get course grades (detailed)
   */
  getCourseGrades: async (courseid: number, userid?: number) => {
    return callLMSFunction<{ usergrades: any[] }>('gradereport_user_get_grade_items', {
      courseid,
      userid: userid || 0,
    });
  },

  /**
   * Get assignments for user
   */
  getMyAssignments: async (courseids?: number[]): Promise<LMSAssignment[]> => {
    const params: Record<string, any> = {};
    if (courseids && courseids.length > 0) {
      params.courseids = courseids;
    }

    const response = await callLMSFunction<{ courses: any[] }>('mod_assign_get_assignments', params);

    const assignments: LMSAssignment[] = [];
    response.courses?.forEach(course => {
      course.assignments?.forEach((assign: any) => {
        assignments.push({
          id: assign.id,
          course: course.id,
          coursename: course.fullname || course.shortname,
          name: assign.name,
          intro: assign.intro || '',
          duedate: assign.duedate,
          allowsubmissionsfromdate: assign.allowsubmissionsfromdate,
          grade: assign.grade,
          submitted: false,
          graded: false,
        });
      });
    });

    return assignments;
  },

  /**
   * Get assignment submission status
   */
  getAssignmentStatus: async (assignmentid: number, userid?: number) => {
    return callLMSFunction<{
      lastattempt?: {
        submission?: any;
        submissiongroupmemberswhoneedtosubmit?: any[];
      };
      feedback?: any;
      warnings?: any[];
    }>('mod_assign_get_submission_status', {
      assignid: assignmentid,
      userid: userid || 0,
    });
  },

  /**
   * Get course content (sections and activities)
   */
  getCourseContent: async (courseid: number): Promise<{ sections: any[]; activities: LMSActivity[] }> => {
    const sections = await callLMSFunction<any[]>('core_course_get_contents', {
      courseid,
    });

    const activities: LMSActivity[] = [];
    sections.forEach(section => {
      section.modules?.forEach((module: any) => {
        activities.push({
          id: module.id,
          course: courseid,
          name: module.name,
          modname: module.modname,
          modicon: module.modicon || '',
          instance: module.instance,
          url: module.url || '',
          visible: module.visible === 1,
          completion: module.completion,
          completionstate: module.completionstate,
        });
      });
    });

    return { sections, activities };
  },

  /**
   * Get activity completion status
   */
  getActivityCompletion: async (courseid: number, userid?: number) => {
    return callLMSFunction<{
      statuses: {
        cmid: number;
        modname: string;
        instance: number;
        state: number;
        timecompleted: number;
        tracking: number;
      }[];
    }>('core_completion_get_activities_completion_status', {
      courseid,
      userid: userid || 0,
    });
  },

  /**
   * Get user's course completion status
   */
  getCourseCompletion: async (courseid: number, userid?: number) => {
    return callLMSFunction<{
      completionstatus: {
        completed: boolean;
        aggregation: number;
        completions: any[];
      };
    }>('core_completion_get_course_completion_status', {
      courseid,
      userid: userid || 0,
    });
  },

  /**
   * Get attendance sessions for course
   */
  getAttendanceSessions: async (courseid: number): Promise<LMSAttendance[]> => {
    try {
      // Attendance plugin API (mod_attendance)
      const response = await callLMSFunction<{ sessions: any[] }>('mod_attendance_get_sessions', {
        courseid,
      });

      return response.sessions?.map(session => ({
        courseid,
        coursename: '',
        sessionid: session.id,
        sessiondate: session.sessdate,
        duration: session.duration,
        status: mapAttendanceStatus(session.statusid),
        remarks: session.remarks,
      })) || [];
    } catch (error) {
      console.warn('Attendance module may not be installed:', error);
      return [];
    }
  },

  /**
   * Get user attendance record
   */
  getUserAttendance: async (userid?: number): Promise<LMSAttendance[]> => {
    try {
      const response = await callLMSFunction<{ attendance: any[] }>('mod_attendance_get_user_attendance', {
        userid: userid || 0,
      });

      return response.attendance?.map(record => ({
        courseid: record.courseid,
        coursename: record.coursename || '',
        sessionid: record.sessionid,
        sessiondate: record.sessdate,
        duration: record.duration,
        status: mapAttendanceStatus(record.statusid),
        remarks: record.remarks,
      })) || [];
    } catch (error) {
      console.warn('Could not fetch attendance:', error);
      return [];
    }
  },

  /**
   * Get calendar events (upcoming deadlines)
   */
  getCalendarEvents: async (options?: {
    timestart?: number;
    timeend?: number;
    courseids?: number[];
  }) => {
    const now = Math.floor(Date.now() / 1000);
    return callLMSFunction<{
      events: {
        id: number;
        name: string;
        description: string;
        courseid: number;
        timestart: number;
        timeduration: number;
        eventtype: string;
        modulename?: string;
        instance?: number;
        url?: string;
      }[];
    }>('core_calendar_get_calendar_events', {
      events: {
        courseids: options?.courseids || [],
        timestart: options?.timestart || now,
        timeend: options?.timeend || now + 30 * 24 * 60 * 60, // 30 days
      },
    });
  },

  /**
   * Get forum discussions
   */
  getForumDiscussions: async (forumid: number) => {
    return callLMSFunction<{
      discussions: {
        id: number;
        name: string;
        subject: string;
        message: string;
        created: number;
        modified: number;
        numreplies: number;
        userfullname: string;
      }[];
    }>('mod_forum_get_forum_discussions', {
      forumid,
    });
  },

  /**
   * Get quiz attempts
   */
  getQuizAttempts: async (quizid: number, userid?: number) => {
    return callLMSFunction<{
      attempts: {
        id: number;
        quiz: number;
        userid: number;
        attempt: number;
        state: string;
        timestart: number;
        timefinish: number;
        sumgrades: number;
      }[];
    }>('mod_quiz_get_user_attempts', {
      quizid,
      userid: userid || 0,
      status: 'all',
    });
  },

  /**
   * Get notifications/messages
   */
  getNotifications: async (userid?: number, limit: number = 20) => {
    return callLMSFunction<{
      notifications: {
        id: number;
        useridfrom: number;
        userfromfullname: string;
        subject: string;
        fullmessage: string;
        fullmessagehtml: string;
        timecreated: number;
        read: boolean;
      }[];
    }>('core_message_get_messages', {
      useridto: userid || 0,
      useridfrom: 0,
      type: 'notifications',
      limitnum: limit,
    });
  },

  /**
   * Get recent course activity
   */
  getRecentActivity: async (courseid: number, since?: number) => {
    return callLMSFunction<{
      events: any[];
    }>('core_course_get_recent_courses', {
      courseid,
      since: since || Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60, // Last 7 days
    });
  },

  /**
   * Check connection to LMS
   */
  testConnection: async (): Promise<boolean> => {
    try {
      const info = await lmsAPI.getSiteInfo();
      return !!info.sitename;
    } catch (error) {
      console.error('LMS connection test failed:', error);
      return false;
    }
  },

  /**
   * Sync all data for a user
   */
  syncAllData: async (userid?: number) => {
    try {
      const [courses, grades, assignments, attendance] = await Promise.all([
        lmsAPI.getMyCourses(userid),
        lmsAPI.getMyGrades(userid),
        lmsAPI.getMyAssignments(),
        lmsAPI.getUserAttendance(userid),
      ]);

      return {
        courses,
        grades,
        assignments,
        attendance,
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to sync LMS data:', error);
      throw error;
    }
  },
};

// Helper function to map attendance status
const mapAttendanceStatus = (statusid: number): LMSAttendance['status'] => {
  switch (statusid) {
    case 1: return 'present';
    case 2: return 'absent';
    case 3: return 'late';
    case 4: return 'excused';
    default: return 'absent';
  }
};

// ==========================================
// SISI Backend Sync Functions
// These functions sync LMS data to the SISI database
// ==========================================

export const lmsSyncAPI = {
  /**
   * Get Moodle connection status from backend
   */
  getStatus: async () => {
    const response = await apiClient.get('/moodle/status');
    return response.data;
  },

  /**
   * Test Moodle connection through backend
   */
  testConnection: async () => {
    const response = await apiClient.post('/moodle/test-connection');
    return response.data;
  },

  /**
   * Get sync statistics from backend
   */
  getSyncStatus: async () => {
    const response = await apiClient.get('/moodle/sync/status');
    return response.data;
  },

  /**
   * Sync students to Moodle
   */
  syncStudents: async (options?: { student_ids?: number[]; only_pending?: boolean }) => {
    const response = await apiClient.post('/moodle/sync/students', options);
    return response.data;
  },

  /**
   * Sync courses to Moodle
   */
  syncCourses: async (options?: { course_ids?: number[]; only_pending?: boolean }) => {
    const response = await apiClient.post('/moodle/sync/courses', options);
    return response.data;
  },

  /**
   * Sync enrollments to Moodle
   */
  syncEnrollments: async (options?: { enrollment_ids?: number[]; semester_id?: number; only_pending?: boolean }) => {
    const response = await apiClient.post('/moodle/sync/enrollments', options);
    return response.data;
  },

  /**
   * Import grades from Moodle to SISI
   * This fetches grades from Moodle and stores them in the SISI database
   */
  importGrades: async (moodle_course_id: number) => {
    const response = await apiClient.post('/moodle/import/grades', { moodle_course_id });
    return response.data;
  },

  /**
   * Sync pending grades to SISI
   * This syncs already received Moodle grades to the main Grade table in SISI
   */
  syncGradesToSis: async () => {
    const response = await apiClient.post('/moodle/sync/grades-to-sis');
    return response.data;
  },

  /**
   * Retry failed syncs
   */
  retryFailed: async (type: 'users' | 'courses' | 'enrollments') => {
    const response = await apiClient.post('/moodle/retry-failed', { type });
    return response.data;
  },

  /**
   * Get sync logs
   */
  getLogs: async (options?: {
    type?: 'USER' | 'COURSE' | 'ENROLLMENT' | 'GRADE';
    direction?: 'TO_MOODLE' | 'FROM_MOODLE';
    status?: 'SUCCESS' | 'FAILED';
    days?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/moodle/logs', { params: options });
    return response.data;
  },

  /**
   * Full sync: Import all data from LMS to SISI
   * This function fetches data from LMS and syncs it to the SISI backend
   */
  fullSyncToSisi: async (userId?: number) => {
    // First get data from LMS
    const lmsData = await lmsAPI.syncAllData(userId);

    // Then sync grades to SISI backend
    const syncResult = await lmsSyncAPI.syncGradesToSis();

    return {
      lmsData,
      syncResult,
      syncedAt: new Date().toISOString(),
    };
  },
};

export default lmsAPI;

import apiClient from './client';

export interface DashboardStats {
  // Student stats
  gpa?: number;
  completedCredits?: number;
  totalRequiredCredits?: number;
  currentBalance?: number;
  attendanceRate?: number;
  enrolledCourses?: number;
  currentSemester?: string;

  // Admin stats
  totalStudents?: number;
  pendingApplications?: number;
  monthlyRevenue?: number;
  activeCourses?: number;

  // Lecturer stats
  myCourses?: number;
  totalStudentsInCourses?: number;
  assignmentsToGrade?: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  titleAr?: string;
  date: string;
  type: 'exam' | 'assignment' | 'deadline' | 'holiday' | 'event';
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  type: 'ACADEMIC' | 'FINANCIAL' | 'GENERAL' | 'URGENT';
  date: string;
  sender?: string;
  isRead?: boolean;
}

export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      // Handle nested data structure if present
      const data = response.data?.data || response.data;
      return data;
    } catch (error: any) {
      console.warn('[Dashboard API] Stats fetch failed:', error?.message);
      // Return default stats matching backend structure
      return {
        students: { total: 0, active: 0, graduated: 0, suspended: 0 },
        courses: { total: 0, active: 0 },
        enrollments: { total: 0, enrolled: 0, completed: 0, dropped: 0 },
        admissions: { total: 0, pending: 0, approved: 0, rejected: 0 },
        service_requests: { total: 0, pending: 0, in_progress: 0, completed: 0 },
      };
    }
  },

  // Get academic calendar events
  getUpcomingEvents: async (limit: number = 5) => {
    try {
      const response = await apiClient.get('/academic-calendar/upcoming', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      console.warn('[Dashboard API] Upcoming events fetch failed:', error?.message);
      return [];
    }
  },

  // Get current month calendar
  getCurrentMonthCalendar: async () => {
    try {
      const response = await apiClient.get('/academic-calendar/month');
      return response.data;
    } catch (error: any) {
      console.warn('[Dashboard API] Calendar fetch failed:', error?.message);
      return [];
    }
  },

  // Get holidays
  getHolidays: async () => {
    try {
      const response = await apiClient.get('/academic-calendar/holidays');
      return response.data;
    } catch (error: any) {
      console.warn('[Dashboard API] Holidays fetch failed:', error?.message);
      return [];
    }
  },

  // Get exam dates
  getExamDates: async () => {
    try {
      const response = await apiClient.get('/academic-calendar/exams');
      return response.data;
    } catch (error: any) {
      console.warn('[Dashboard API] Exams fetch failed:', error?.message);
      return [];
    }
  },

  // Get deadlines
  getDeadlines: async () => {
    try {
      const response = await apiClient.get('/academic-calendar/deadlines');
      return response.data;
    } catch (error: any) {
      console.warn('[Dashboard API] Deadlines fetch failed:', error?.message);
      return [];
    }
  },

  // Get published announcements
  getAnnouncements: async (limit: number = 5) => {
    try {
      const response = await apiClient.get('/announcements/published', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      console.warn('[Dashboard API] Announcements fetch failed:', error?.message);
      return [];
    }
  },

  // Get all announcements (authenticated)
  getAllAnnouncements: async () => {
    try {
      const response = await apiClient.get('/announcements');
      return response.data;
    } catch (error: any) {
      console.warn('[Dashboard API] All announcements fetch failed:', error?.message);
      return [];
    }
  },

  // Get current semester
  getCurrentSemester: async () => {
    try {
      const response = await apiClient.get('/semesters/current');
      return response.data;
    } catch (error: any) {
      console.warn('[Dashboard API] Semester fetch failed:', error?.message);
      return null;
    }
  },

  // Transform announcements to frontend format
  transformAnnouncements: (data: any[], lang: 'en' | 'ar' = 'en'): Announcement[] => {
    return data.map((ann: any) => ({
      id: ann.id?.toString() || String(Math.random()),
      title: lang === 'ar' ? (ann.title_ar || ann.title) : ann.title,
      titleAr: ann.title_ar,
      content: lang === 'ar' ? (ann.content_ar || ann.content) : ann.content,
      contentAr: ann.content_ar,
      type: ann.type || 'GENERAL',
      date: ann.published_at || ann.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      sender: ann.author?.name || ann.sender || 'Administration',
      isRead: ann.is_read || false,
    }));
  },

  // Transform calendar events to frontend format
  transformEvents: (data: any[], lang: 'en' | 'ar' = 'en'): UpcomingEvent[] => {
    return data.map((event: any) => ({
      id: event.id?.toString() || String(Math.random()),
      title: lang === 'ar' ? (event.title_ar || event.title) : event.title,
      titleAr: event.title_ar,
      date: event.start_date || event.date,
      type: event.event_type || event.type || 'event',
      description: lang === 'ar' ? (event.description_ar || event.description) : event.description,
    }));
  },
};

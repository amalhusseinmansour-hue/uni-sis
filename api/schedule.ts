import apiClient from './client';

export interface ScheduleEvent {
  id: string;
  title: string;
  titleAr?: string;
  instructor: string;
  location: string;
  startTime: string;
  endTime: string;
  day: number; // 0-6 (Sunday-Saturday)
  color: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'office_hours' | 'exam';
  courseCode: string;
  courseId?: string;
}

export const scheduleAPI = {
  // Get all schedules
  getAll: async (filters?: {
    semester_id?: string;
    course_id?: string;
    day?: number;
  }) => {
    const response = await apiClient.get('/schedules', { params: filters });
    return response.data;
  },

  // Get schedule by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/schedules/${id}`);
    return response.data;
  },

  // Get weekly view
  getWeeklyView: async (semesterId?: string) => {
    const response = await apiClient.get('/schedules/weekly', {
      params: { semester_id: semesterId }
    });
    return response.data;
  },

  // Get student's timetable (for students)
  getMyTimetable: async () => {
    try {
      const response = await apiClient.get('/my-timetable');
      return response.data;
    } catch (error: any) {
      console.warn('[Schedule API] Timetable fetch failed:', error?.message);
      return [];
    }
  },

  // Get student's timetable by student ID (for staff/admin)
  getStudentTimetable: async (studentId: number | string) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/timetable`);
      return response.data;
    } catch (error: any) {
      console.warn('[Schedule API] Student timetable fetch failed:', error?.message);
      return [];
    }
  },

  // Get course schedule
  getCourseSchedule: async (courseId: string) => {
    const response = await apiClient.get(`/courses/${courseId}/schedule`);
    return response.data;
  },

  // Create schedule (admin)
  create: async (data: {
    course_id: string;
    semester_id: string;
    day: number;
    start_time: string;
    end_time: string;
    room?: string;
    building?: string;
    type?: string;
  }) => {
    const response = await apiClient.post('/schedules', data);
    return response.data;
  },

  // Update schedule (admin)
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/schedules/${id}`, data);
    return response.data;
  },

  // Delete schedule (admin)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/schedules/${id}`);
    return response.data;
  },

  // Transform backend schedule to frontend format
  transformToEvents: (schedules: any[], lang: 'en' | 'ar' = 'en'): ScheduleEvent[] => {
    const colors: Record<string, string> = {
      lecture: 'bg-blue-500 text-white',
      lab: 'bg-green-500 text-white',
      tutorial: 'bg-purple-500 text-white',
      office_hours: 'bg-amber-500 text-white',
      exam: 'bg-red-500 text-white',
    };

    return schedules.map((schedule: any) => ({
      id: schedule.id?.toString() || String(Math.random()),
      title: lang === 'ar' ? (schedule.course?.name_ar || schedule.title) : (schedule.course?.name_en || schedule.title),
      titleAr: schedule.course?.name_ar || schedule.title_ar,
      instructor: schedule.course?.instructor?.name || schedule.instructor || 'TBA',
      location: schedule.room ? `${schedule.room}${schedule.building ? ', ' + schedule.building : ''}` : 'TBA',
      startTime: schedule.start_time?.substring(0, 5) || schedule.startTime,
      endTime: schedule.end_time?.substring(0, 5) || schedule.endTime,
      day: schedule.day || 0,
      color: colors[schedule.type || 'lecture'] || colors.lecture,
      type: schedule.type || 'lecture',
      courseCode: schedule.course?.code || schedule.courseCode || '',
      courseId: schedule.course_id || schedule.courseId,
    }));
  },
};

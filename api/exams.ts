import apiClient from './client';

export interface Exam {
  id: string;
  courseCode: string;
  courseName: string;
  courseNameAr?: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  building?: string;
  duration: number; // in minutes
  instructor?: string;
  notes?: string;
  notesAr?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface ExamSchedule {
  semester: string;
  semesterId: string;
  examPeriodStart: string;
  examPeriodEnd: string;
  exams: Exam[];
}

export const examsAPI = {
  // Get exam calendar
  getExamCalendar: async () => {
    const response = await apiClient.get('/academic-calendar/exams');
    return response.data;
  },

  // Get all academic calendar events
  getAcademicCalendar: async (semesterId?: string) => {
    const response = await apiClient.get('/academic-calendar', {
      params: { semester_id: semesterId }
    });
    return response.data;
  },

  // Get semester calendar
  getSemesterCalendar: async (semesterId: string) => {
    const response = await apiClient.get(`/academic-calendar/semester/${semesterId}`);
    return response.data;
  },

  // Get deadlines
  getDeadlines: async () => {
    const response = await apiClient.get('/academic-calendar/deadlines');
    return response.data;
  },

  // Get my grades (student)
  getMyGrades: async () => {
    const response = await apiClient.get('/my-grades');
    return response.data;
  },

  // Get student grades
  getStudentGrades: async (studentId: string) => {
    const response = await apiClient.get(`/students/${studentId}/grades`);
    return response.data;
  },

  // Transform exam data to frontend format
  transformExams: (data: any[], lang: 'en' | 'ar' = 'en'): Exam[] => {
    return data
      .filter((event: any) => event.event_type === 'exam' || event.type === 'exam')
      .map((exam: any) => ({
        id: exam.id?.toString() || String(Math.random()),
        courseCode: exam.course?.code || exam.courseCode || '',
        courseName: lang === 'ar'
          ? (exam.course?.name_ar || exam.courseName || exam.title)
          : (exam.course?.name_en || exam.courseName || exam.title),
        courseNameAr: exam.course?.name_ar || exam.courseNameAr,
        type: exam.exam_type || exam.type || 'midterm',
        date: exam.start_date || exam.date,
        startTime: exam.start_time || '09:00',
        endTime: exam.end_time || '11:00',
        location: exam.location || exam.room || 'TBA',
        building: exam.building,
        duration: exam.duration || 120,
        instructor: exam.instructor?.name || exam.instructor,
        notes: lang === 'ar' ? (exam.notes_ar || exam.notes) : exam.notes,
        notesAr: exam.notes_ar,
        status: getExamStatus(exam.start_date || exam.date, exam.start_time, exam.end_time),
      }));
  },
};

// Helper function to determine exam status
function getExamStatus(date: string, startTime?: string, endTime?: string): 'upcoming' | 'ongoing' | 'completed' {
  const now = new Date();
  const examDate = new Date(date);

  if (startTime && endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const examStart = new Date(examDate);
    examStart.setHours(startHour, startMin, 0);

    const examEnd = new Date(examDate);
    examEnd.setHours(endHour, endMin, 0);

    if (now < examStart) return 'upcoming';
    if (now >= examStart && now <= examEnd) return 'ongoing';
    return 'completed';
  }

  // Simple date comparison if no time provided
  const todayStr = now.toISOString().split('T')[0];
  const examDateStr = examDate.toISOString().split('T')[0];

  if (examDateStr > todayStr) return 'upcoming';
  if (examDateStr === todayStr) return 'ongoing';
  return 'completed';
}

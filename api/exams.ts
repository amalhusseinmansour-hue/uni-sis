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
  // Get exam calendar (student's exams only)
  getExamCalendar: async () => {
    try {
      // Try to get student-specific exams first
      const response = await apiClient.get('/my-exams');
      return response.data?.data || response.data || [];
    } catch {
      // Fallback to all exams
      const response = await apiClient.get('/academic-calendar/exams');
      return response.data;
    }
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
      .filter((event: any) => {
        const eventType = (event.event_type || event.type || '').toLowerCase();
        return eventType === 'exam';
      })
      .map((exam: any) => {
        // Parse title to extract exam type and course name
        // Format: "Midterm Exam: Course Name" or "Final Exam: Course Name"
        const titleEn = exam.title_en || exam.title || '';
        const titleAr = exam.title_ar || '';

        let examType: 'midterm' | 'final' | 'quiz' | 'practical' = 'midterm';
        let courseName = titleEn;
        let courseNameAr = titleAr;

        if (titleEn.toLowerCase().includes('midterm')) {
          examType = 'midterm';
          courseName = titleEn.replace(/midterm\s*exam[:\s]*/i, '').trim();
          courseNameAr = titleAr.replace(/امتحان منتصف الفصل[:\s]*/i, '').trim();
        } else if (titleEn.toLowerCase().includes('final')) {
          examType = 'final';
          courseName = titleEn.replace(/final\s*exam[:\s]*/i, '').trim();
          courseNameAr = titleAr.replace(/الامتحان النهائي[:\s]*/i, '').trim();
        } else if (titleEn.toLowerCase().includes('quiz')) {
          examType = 'quiz';
        } else if (titleEn.toLowerCase().includes('practical')) {
          examType = 'practical';
        }

        // Extract location from description
        const descEn = exam.description_en || exam.description || '';
        const locationMatch = descEn.match(/Location:\s*([^.]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : (exam.location || exam.room || 'TBA');

        // Extract duration from description
        const durationMatch = descEn.match(/Duration:\s*(\d+)/i);
        const duration = durationMatch ? parseInt(durationMatch[1]) * 60 : (exam.duration || 120);

        return {
          id: exam.id?.toString() || String(Math.random()),
          courseCode: exam.course?.code || exam.courseCode || '',
          courseName: lang === 'ar' ? (courseNameAr || courseName) : courseName,
          courseNameAr: courseNameAr,
          type: examType,
          date: exam.start_date || exam.date,
          startTime: exam.start_time || '09:00',
          endTime: exam.end_time || '11:00',
          location: location,
          building: exam.building,
          duration: duration,
          instructor: exam.instructor?.name || exam.instructor,
          notes: lang === 'ar' ? (exam.description_ar || exam.notes_ar || exam.notes) : (exam.description_en || exam.notes),
          notesAr: exam.description_ar || exam.notes_ar,
          status: getExamStatus(exam.start_date || exam.date, exam.start_time, exam.end_time),
        };
      });
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

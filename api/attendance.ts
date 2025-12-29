import apiClient from './client';

export interface AttendanceRecord {
  id: string;
  date: string;
  course: string;
  courseCode: string;
  title: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  time: string;
  excuse?: string;
}

export interface CourseAttendance {
  id: string;
  code: string;
  name: string;
  total: number;
  attended: number;
  absent: number;
  excused: number;
  late: number;
  rate: number;
}

export interface AttendanceStats {
  totalClasses: number;
  attended: number;
  absent: number;
  excused: number;
  late: number;
  rate: number;
}

export const attendanceAPI = {
  // Get enrollment attendance
  getEnrollmentAttendance: async (enrollmentId: string) => {
    const response = await apiClient.get(`/enrollments/${enrollmentId}/attendance`);
    return response.data;
  },

  // Get course attendance (lecturer/admin)
  getCourseAttendance: async (courseId: string) => {
    const response = await apiClient.get(`/courses/${courseId}/attendance`);
    return response.data;
  },

  // Update attendance (lecturer/admin)
  updateAttendance: async (enrollmentId: string, data: {
    date: string;
    status: 'present' | 'absent' | 'excused' | 'late';
    notes?: string;
  }) => {
    const response = await apiClient.post(`/enrollments/${enrollmentId}/attendance`, data);
    return response.data;
  },

  // Bulk update attendance (lecturer/admin)
  bulkUpdateAttendance: async (courseId: string, data: {
    date: string;
    attendance: Array<{
      student_id: string;
      status: 'present' | 'absent' | 'excused' | 'late';
    }>;
  }) => {
    const response = await apiClient.post(`/courses/${courseId}/attendance/bulk`, data);
    return response.data;
  },

  // Get my attendance report (for students)
  getMyAttendanceReport: async (studentId: string) => {
    const response = await apiClient.get(`/reports/students/${studentId}/attendance`);
    return response.data;
  },

  // Calculate attendance stats from records
  calculateStats: (records: any[]): AttendanceStats => {
    const totalClasses = records.length;
    const attended = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const late = records.filter(r => r.status === 'late').length;
    const rate = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;

    return { totalClasses, attended, absent, excused, late, rate };
  },

  // Calculate course-wise attendance
  calculateCourseAttendance: (enrollments: any[], lang: 'en' | 'ar' = 'en'): CourseAttendance[] => {
    const courseMap = new Map<string, CourseAttendance>();

    enrollments.forEach((enrollment: any) => {
      const courseCode = enrollment.course?.code || enrollment.courseCode;
      const courseName = lang === 'ar'
        ? (enrollment.course?.name_ar || enrollment.courseName)
        : (enrollment.course?.name_en || enrollment.courseName);

      if (!courseMap.has(courseCode)) {
        courseMap.set(courseCode, {
          id: enrollment.course_id || enrollment.id,
          code: courseCode,
          name: courseName,
          total: 0,
          attended: 0,
          absent: 0,
          excused: 0,
          late: 0,
          rate: 0,
        });
      }

      const course = courseMap.get(courseCode)!;
      const records = enrollment.attendance_records || enrollment.attendanceRecords || [];

      records.forEach((record: any) => {
        course.total++;
        switch (record.status) {
          case 'present':
            course.attended++;
            break;
          case 'absent':
            course.absent++;
            break;
          case 'excused':
            course.excused++;
            break;
          case 'late':
            course.late++;
            break;
        }
      });

      course.rate = course.total > 0 ? Math.round((course.attended / course.total) * 100) : 0;
    });

    return Array.from(courseMap.values());
  },

  // Transform backend records to frontend format
  transformToRecords: (data: any[], lang: 'en' | 'ar' = 'en'): AttendanceRecord[] => {
    return data.map((record: any) => ({
      id: record.id?.toString() || String(Math.random()),
      date: record.date || record.created_at?.split('T')[0],
      course: record.course?.code || record.courseCode || '',
      courseCode: record.course?.code || record.courseCode || '',
      title: lang === 'ar'
        ? (record.course?.name_ar || record.courseName)
        : (record.course?.name_en || record.courseName),
      status: record.status || 'present',
      time: record.time || `${record.start_time || '00:00'} - ${record.end_time || '00:00'}`,
      excuse: record.excuse || record.notes,
    }));
  },
};

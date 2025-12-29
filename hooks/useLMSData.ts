/**
 * Custom hook for fetching and managing LMS data
 * Can be used across multiple pages to show LMS-related information
 */

import { useState, useEffect, useCallback } from 'react';
import { lmsAPI, LMSCourse, LMSGrade, LMSAssignment, LMSAttendance } from '../api/lms';

interface LMSData {
  courses: LMSCourse[];
  grades: LMSGrade[];
  assignments: LMSAssignment[];
  attendance: LMSAttendance[];
  isConnected: boolean;
  syncedAt: string | null;
}

interface UseLMSDataResult {
  data: LMSData;
  loading: boolean;
  error: string | null;
  sync: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

// Demo data for when LMS is not connected
const DEMO_COURSES: LMSCourse[] = [
  {
    id: 1,
    shortname: 'CS101',
    fullname: 'Introduction to Computer Science',
    fullnameAr: 'مقدمة في علوم الحاسب',
    summary: 'Fundamental concepts of programming and computer science',
    startdate: Math.floor(Date.now() / 1000) - 86400 * 30,
    enddate: Math.floor(Date.now() / 1000) + 86400 * 60,
    visible: true,
    progress: 75,
    completed: false,
  },
  {
    id: 2,
    shortname: 'MATH201',
    fullname: 'Calculus II',
    fullnameAr: 'التفاضل والتكامل ٢',
    summary: 'Advanced calculus concepts',
    startdate: Math.floor(Date.now() / 1000) - 86400 * 30,
    enddate: Math.floor(Date.now() / 1000) + 86400 * 60,
    visible: true,
    progress: 60,
    completed: false,
  },
  {
    id: 3,
    shortname: 'ENG102',
    fullname: 'Technical Writing',
    fullnameAr: 'الكتابة التقنية',
    summary: 'Academic and technical writing skills',
    startdate: Math.floor(Date.now() / 1000) - 86400 * 30,
    enddate: Math.floor(Date.now() / 1000) + 86400 * 60,
    visible: true,
    progress: 90,
    completed: false,
  },
];

const DEMO_GRADES: LMSGrade[] = [
  { courseid: 1, coursename: 'Introduction to Computer Science', userid: 1, grade: 88, grademax: 100, grademin: 0 },
  { courseid: 2, coursename: 'Calculus II', userid: 1, grade: 75, grademax: 100, grademin: 0 },
  { courseid: 3, coursename: 'Technical Writing', userid: 1, grade: 92, grademax: 100, grademin: 0 },
];

const DEMO_ASSIGNMENTS: LMSAssignment[] = [
  {
    id: 1,
    course: 1,
    coursename: 'Introduction to Computer Science',
    name: 'Programming Assignment 3',
    intro: 'Implement a sorting algorithm',
    duedate: Math.floor(Date.now() / 1000) + 86400 * 3,
    allowsubmissionsfromdate: Math.floor(Date.now() / 1000) - 86400 * 7,
    grade: 100,
    submitted: false,
    graded: false,
  },
  {
    id: 2,
    course: 2,
    coursename: 'Calculus II',
    name: 'Problem Set 5',
    intro: 'Integration techniques practice',
    duedate: Math.floor(Date.now() / 1000) + 86400 * 5,
    allowsubmissionsfromdate: Math.floor(Date.now() / 1000) - 86400 * 5,
    grade: 50,
    submitted: false,
    graded: false,
  },
  {
    id: 3,
    course: 3,
    coursename: 'Technical Writing',
    name: 'Research Paper Draft',
    intro: 'First draft of research paper',
    duedate: Math.floor(Date.now() / 1000) + 86400 * 7,
    allowsubmissionsfromdate: Math.floor(Date.now() / 1000) - 86400 * 14,
    grade: 100,
    submitted: true,
    graded: false,
  },
];

const DEMO_ATTENDANCE: LMSAttendance[] = [
  { courseid: 1, coursename: 'Introduction to Computer Science', sessionid: 1, sessiondate: Math.floor(Date.now() / 1000) - 86400 * 2, duration: 3600, status: 'present' },
  { courseid: 1, coursename: 'Introduction to Computer Science', sessionid: 2, sessiondate: Math.floor(Date.now() / 1000) - 86400 * 4, duration: 3600, status: 'present' },
  { courseid: 2, coursename: 'Calculus II', sessionid: 3, sessiondate: Math.floor(Date.now() / 1000) - 86400 * 1, duration: 3600, status: 'late' },
  { courseid: 2, coursename: 'Calculus II', sessionid: 4, sessiondate: Math.floor(Date.now() / 1000) - 86400 * 3, duration: 3600, status: 'present' },
  { courseid: 3, coursename: 'Technical Writing', sessionid: 5, sessiondate: Math.floor(Date.now() / 1000) - 86400 * 2, duration: 3600, status: 'absent' },
];

export const useLMSData = (): UseLMSDataResult => {
  const [data, setData] = useState<LMSData>({
    courses: [],
    grades: [],
    assignments: [],
    attendance: [],
    isConnected: false,
    syncedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const connected = await lmsAPI.testConnection();
      setData(prev => ({ ...prev, isConnected: connected }));
      return connected;
    } catch {
      setData(prev => ({ ...prev, isConnected: false }));
      return false;
    }
  }, []);

  const sync = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const isConnected = await testConnection();

      if (isConnected) {
        const result = await lmsAPI.syncAllData();
        setData({
          courses: result.courses,
          grades: result.grades,
          assignments: result.assignments,
          attendance: result.attendance,
          isConnected: true,
          syncedAt: result.syncedAt,
        });
      } else {
        // Use demo data when not connected
        setData({
          courses: DEMO_COURSES,
          grades: DEMO_GRADES,
          assignments: DEMO_ASSIGNMENTS,
          attendance: DEMO_ATTENDANCE,
          isConnected: false,
          syncedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn('LMS sync failed, using demo data:', err.message);
      setData({
        courses: DEMO_COURSES,
        grades: DEMO_GRADES,
        assignments: DEMO_ASSIGNMENTS,
        attendance: DEMO_ATTENDANCE,
        isConnected: false,
        syncedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [testConnection]);

  // Initial load
  useEffect(() => {
    sync();
  }, []);

  return {
    data,
    loading,
    error,
    sync,
    testConnection,
  };
};

// Helper functions for LMS data
export const getLMSCourseProgress = (courses: LMSCourse[]): number => {
  if (courses.length === 0) return 0;
  const totalProgress = courses.reduce((sum, c) => sum + (c.progress || 0), 0);
  return Math.round(totalProgress / courses.length);
};

export const getUpcomingAssignments = (assignments: LMSAssignment[], days: number = 7): LMSAssignment[] => {
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now + (days * 86400);
  return assignments
    .filter(a => a.duedate > now && a.duedate <= cutoff && !a.submitted)
    .sort((a, b) => a.duedate - b.duedate);
};

export const getOverdueAssignments = (assignments: LMSAssignment[]): LMSAssignment[] => {
  const now = Math.floor(Date.now() / 1000);
  return assignments
    .filter(a => a.duedate < now && !a.submitted)
    .sort((a, b) => b.duedate - a.duedate);
};

export const getAttendanceStats = (attendance: LMSAttendance[]): {
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
} => {
  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length,
    rate: 0,
  };

  const total = attendance.length;
  if (total > 0) {
    stats.rate = Math.round(((stats.present + stats.late + stats.excused) / total) * 100);
  }

  return stats;
};

export const getLMSAverageGrade = (grades: LMSGrade[]): number => {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, g) => {
    if (g.grade !== null && g.grademax > 0) {
      return sum + ((g.grade / g.grademax) * 100);
    }
    return sum;
  }, 0);
  return Math.round(total / grades.length);
};

export default useLMSData;


export enum UserRole {
  STUDENT = 'STUDENT',
  LECTURER = 'LECTURER',
  ADMIN = 'ADMIN', // System Administrator - Full Access
  FINANCE = 'FINANCE', // Finance Department
  STUDENT_AFFAIRS = 'STUDENT_AFFAIRS', // Student Affairs
  ACCOUNTANT = 'ACCOUNTANT', // Accountant
  REGISTRAR = 'REGISTRAR', // Registrar Office
  ADMISSIONS = 'ADMISSIONS', // Admissions Office
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
}

// Student Status Types
export type StudentStatus = 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'WITHDRAWN';
export type ProgramType = 'BACHELOR' | 'MASTER' | 'PHD';
export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type AcademicStatus = 'REGULAR' | 'ON_PROBATION' | 'DISMISSED' | 'COMPLETED_REQUIREMENTS';
export type FinancialStatus = 'CLEARED' | 'ON_HOLD';
export type AccountStatus = 'ACTIVE' | 'LOCKED';
export type DocumentStatus = 'ACCEPTED' | 'REJECTED' | 'UNDER_REVIEW';
export type RelationshipType = 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'SPOUSE' | 'GUARDIAN' | 'OTHER';

// Guardian & Emergency Contact
export interface Guardian {
  name: string;
  relationship: RelationshipType;
  phone: string;
  email?: string;
  address?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: RelationshipType;
}

// Academic Advisor
export interface Advisor {
  name: string;
  email: string;
  department: string;
}

// Document/Attachment
export interface StudentDocument {
  id: string;
  type: 'HIGH_SCHOOL_CERTIFICATE' | 'ID_PASSPORT' | 'PHOTO' | 'OTHER';
  name: string;
  uploadDate: string;
  status: DocumentStatus;
}

// Address Information
export interface Address {
  country: string;
  city: string;
  street?: string;
  postalCode?: string;
}

export interface Student extends User {
  // Student Card Info
  studentId: string;
  nameAr: string;
  nameEn: string;
  status: StudentStatus;
  programType: ProgramType;

  // Personal Data
  nationalId: string;
  passportNumber?: string;
  dateOfBirth: string;
  placeOfBirth: {
    city: string;
    country: string;
  };
  gender: Gender;
  nationality: string;
  maritalStatus: MaritalStatus;
  admissionDate: string;

  // Contact Information
  phone: string;
  alternativePhone?: string;
  personalEmail: string;
  universityEmail: string;
  address: Address;

  // Guardian & Emergency
  guardian: Guardian;
  emergencyContact?: EmergencyContact;

  // Academic Information
  college: string;
  department: string;
  major: string;
  degree: string;
  studyPlanCode: string;
  studyPlanName: string;
  cohort: string;
  level: number;
  currentSemester: string;
  academicStatus: AcademicStatus;
  advisor: Advisor;

  // Academic Summary
  totalRequiredCredits: number;
  completedCredits: number;
  registeredCredits: number;
  remainingCredits: number;
  termGpa: number;
  gpa: number;
  postponementCount?: number; // Number of previous semester freezes/postponements
  withdrawalCount?: number; // Number of previous full semester withdrawals

  // Financial Summary
  totalFees: number;
  paidAmount: number;
  currentBalance: number;
  previousBalance: number;
  scholarships: number;
  financialStatus: FinancialStatus;

  // Systems & Accounts
  sisUsername: string;
  lmsUsername: string;
  accountStatus: AccountStatus;
  lastLogin?: string;

  // Documents
  documents: StudentDocument[];
}

export interface Grade {
  code: string;
  title: string;
  grade: string;
  points: number;
  credits: number;
  semester: string;
  midterm?: number;
  coursework?: number;
  final?: number;
}

export interface Course {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
  credits: number;
  schedule: string;
  instructor: string;
  enrolled: number;
  capacity: number;
  description?: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  studentName?: string; // For Finance Admin view
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'ACADEMIC' | 'FINANCIAL' | 'GENERAL';
  sender?: string;
}

export interface AdmissionApplication {
  id: string;
  fullName: string;
  nationalId: string;
  program: string;
  highSchoolScore: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
  email: string;
}

export interface EnrolledStudent {
  id: string;
  name: string;
  studentId: string;
  attendance: number;
  midterm?: number;
  final?: number;
}

export interface ServiceRequest {
  id: string;
  requestType: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  comments?: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  }
}

// ==========================================
// LECTURE TYPES - أنواع المحاضرات
// ==========================================

export type LectureType = 'REGULAR' | 'MAKEUP' | 'EXTRA' | 'EXAM_REVIEW' | 'WORKSHOP' | 'LAB' | 'ONLINE';
export type LectureMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID';
export type LectureStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'LEFT_EARLY';
export type MaterialType = 'SLIDES' | 'PDF' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LINK' | 'IMAGE' | 'CODE' | 'OTHER';

export interface Lecture {
  id: number;
  course_id: number;
  lecturer_id: number;
  semester_id: number | null;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  lecture_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  room: string | null;
  building: string | null;
  type: LectureType;
  mode: LectureMode;
  online_meeting_url: string | null;
  online_meeting_id: string | null;
  online_meeting_password: string | null;
  recording_url: string | null;
  status: LectureStatus;
  cancellation_reason: string | null;
  rescheduled_to: string | null;
  topics_covered: string | null;
  notes: string | null;
  homework_assigned: string | null;
  lecture_number: number;
  week_number: number | null;
  expected_students: number | null;
  actual_attendance: number;
  created_at: string;
  updated_at: string;
  // Relations
  course?: Course;
  lecturer?: User;
  semester?: Semester;
  materials?: LectureMaterial[];
  attendance?: LectureAttendance[];
}

export interface LectureMaterial {
  id: number;
  lecture_id: number;
  uploaded_by: number;
  type: MaterialType;
  title_en: string;
  title_ar: string;
  description: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: string | null;
  mime_type: string | null;
  external_url: string | null;
  is_downloadable: boolean;
  is_visible_to_students: boolean;
  download_count: number;
  view_count: number;
  order: number;
  created_at: string;
  updated_at: string;
  // Relations
  lecture?: Lecture;
  uploader?: User;
}

export interface LectureAttendance {
  id: number;
  lecture_id: number;
  student_id: number;
  enrollment_id: number | null;
  recorded_by: number | null;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  minutes_late: number;
  minutes_present: number | null;
  ip_address: string | null;
  device_info: string | null;
  verified_by_qr: boolean;
  verified_by_location: boolean;
  notes: string | null;
  excuse_reason: string | null;
  excuse_document_path: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  lecture?: Lecture;
  student?: Student;
  recorder?: User;
}

export interface LectureComment {
  id: number;
  lecture_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  is_question: boolean;
  is_answered: boolean;
  is_pinned: boolean;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  lecture?: Lecture;
  user?: User;
  parent?: LectureComment;
  replies?: LectureComment[];
}

export interface LectureRating {
  id: number;
  lecture_id: number;
  student_id: number;
  overall_rating: number;
  content_rating: number | null;
  delivery_rating: number | null;
  materials_rating: number | null;
  feedback: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  lecture?: Lecture;
  student?: Student;
}

export interface LectureStatistics {
  total: number;
  by_status: Record<LectureStatus, number>;
  by_type: Record<LectureType, number>;
  by_mode: Record<LectureMode, number>;
  completed: number;
  cancelled: number;
  upcoming: number;
  average_attendance_rate: number;
}

export interface AttendanceStatistics {
  total_lectures: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  left_early: number;
  attendance_rate: number;
}

export interface Semester {
  id: number;
  name_en: string;
  name_ar: string;
  code: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

// ==========================================
// DISCIPLINE TYPES
// ==========================================

export type DisciplineIncidentType =
  | 'TARDINESS'
  | 'ABSENCE'
  | 'ACADEMIC_DISHONESTY'
  | 'MISCONDUCT'
  | 'DRESS_CODE'
  | 'PROPERTY_DAMAGE'
  | 'BULLYING'
  | 'SUBSTANCE_ABUSE'
  | 'VIOLENCE'
  | 'HARASSMENT'
  | 'THEFT'
  | 'OTHER';

export type DisciplineSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';

export type DisciplineIncidentStatus =
  | 'REPORTED'
  | 'INVESTIGATING'
  | 'CONFIRMED'
  | 'DISMISSED'
  | 'RESOLVED'
  | 'APPEALED';

export type DisciplineActionType =
  | 'VERBAL_WARNING'
  | 'WRITTEN_WARNING'
  | 'PARENT_CONFERENCE'
  | 'DETENTION'
  | 'COMMUNITY_SERVICE'
  | 'SUSPENSION'
  | 'PROBATION'
  | 'RESTRICTION'
  | 'COUNSELING'
  | 'EXPULSION'
  | 'OTHER';

export type DisciplineActionStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type DisciplineAppealType =
  | 'INCIDENT_DISPUTE'
  | 'ACTION_REDUCTION'
  | 'POINTS_REDUCTION'
  | 'FULL_DISMISSAL';

export type DisciplineAppealStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type DisciplinePointsStatus =
  | 'GOOD_STANDING'
  | 'WARNING_1'
  | 'WARNING_2'
  | 'PROBATION'
  | 'CRITICAL';

export interface DisciplineIncident {
  id: number;
  student_id: number;
  incident_number: string;
  type: DisciplineIncidentType;
  type_other?: string;
  severity: DisciplineSeverity;
  points: number;
  incident_date: string;
  incident_time?: string;
  location?: string;
  description: string;
  description_ar?: string;
  status: DisciplineIncidentStatus;
  created_at: string;
}

export interface DisciplineAction {
  id: number;
  incident_id: number;
  student_id: number;
  action_type: DisciplineActionType;
  action_type_other?: string;
  action_date: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  description: string;
  description_ar?: string;
  status: DisciplineActionStatus;
  is_appealable: boolean;
  appeal_deadline?: string;
}

export interface DisciplineAppeal {
  id: number;
  incident_id?: number;
  action_id?: number;
  student_id: number;
  appeal_number: string;
  appeal_type: DisciplineAppealType;
  reason: string;
  reason_ar?: string;
  status: DisciplineAppealStatus;
  decision?: string;
  points_reduced: number;
  created_at: string;
}

export interface DisciplinePoints {
  total_points: number;
  active_points: number;
  status: DisciplinePointsStatus;
  status_display: string;
  status_display_ar: string;
  status_color: string;
}

// ==========================================
// ID CARD TYPES
// ==========================================

export interface DigitalIdCard {
  student: {
    id: number;
    student_id: string;
    name_en: string;
    name_ar?: string;
    profile_picture_url?: string;
    status: string;
  };
  program?: {
    name_en: string;
    name_ar?: string;
    degree: string;
  };
  validity: {
    issue_date: string;
    expiry_date: string;
  };
  verification: {
    qr_data: string;
    barcode: string;
  };
  needs_renewal?: boolean;
}

// ==========================================
// REPORT CARD TYPES
// ==========================================

export interface ReportCardCourse {
  course_code: string;
  course_name_en: string;
  course_name_ar?: string;
  credits: number;
  grade: string;
  grade_points: number;
  passed: boolean;
  midterm_score?: number;
  final_score?: number;
}

export interface ReportCardSummary {
  total_courses: number;
  total_credits: number;
  earned_credits: number;
  semester_gpa: number;
  cumulative_gpa: number;
  academic_standing: string;
  academic_standing_ar: string;
}

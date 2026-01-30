import React, { useState, useEffect } from 'react';
import {
  Mail, Hash, BookOpen, Award, Calendar, Phone, MapPin, CheckCircle, User,
  CreditCard, Building, GraduationCap, FileText, Shield, Clock, AlertCircle,
  Users, Heart, Globe, Briefcase, FolderOpen, Download, Eye, ChevronDown, ChevronUp,
  Edit, Camera, Flag, Home, UserCheck, Stethoscope, Laptop, Tag,
  Upload, Check, X, BookMarked, Target, TrendingUp, BarChart2, ClipboardList,
  MessageSquare, Printer, ExternalLink, Lock, Unlock, History, FileCheck,
  AlertTriangle, Star, Activity, Layers, Play, Pause, XCircle, Loader2
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { studentsAPI } from '../api/students';
import { financeAPI } from '../api/finance';
import { attendanceAPI } from '../api/attendance';
import { printPage, exportToPDF } from '../utils/exportUtils';
import { useBranding } from '../context/BrandingContext';
import { UserRole } from '../types';

interface ProfileProps {
  lang: 'en' | 'ar';
  student: any;
  role?: UserRole;
}

// Comprehensive Translations
const t: Record<string, { en: string; ar: string }> = {
  // Main Sections
  profile: { en: 'Student Profile', ar: 'ملف الطالب' },
  studentCard: { en: 'Student Card', ar: 'بطاقة الطالب' },
  personalInfo: { en: 'Personal Information', ar: 'المعلومات الشخصية' },
  legalResidency: { en: 'Legal & Residency Info', ar: 'معلومات قانونية / إقامة' },
  contactInfo: { en: 'Contact Information', ar: 'بيانات التواصل' },
  addressInfo: { en: 'Address Information', ar: 'العنوان' },
  guardianFamily: { en: 'Guardian & Family Info', ar: 'ولي الأمر والعائلة' },
  emergencyContacts: { en: 'Emergency Contacts', ar: 'جهات الاتصال للطوارئ' },
  previousEducation: { en: 'Previous Education', ar: 'التعليم السابق' },
  specialNeeds: { en: 'Special Needs & Medical Info', ar: 'الاحتياجات الخاصة / المعلومات الطبية' },
  systemAccounts: { en: 'System Accounts', ar: 'حسابات الأنظمة' },
  notesTags: { en: 'Notes & Tags', ar: 'ملاحظات وتصنيفات' },
  documentsAttachments: { en: 'Documents & Attachments', ar: 'المرفقات والوثائق' },

  // Academic Sections
  academicData: { en: 'Academic Data', ar: 'البيانات الأكاديمية' },
  programRegistration: { en: 'Program & Registration', ar: 'بيانات البرنامج والتسجيل' },
  studyPlan: { en: 'Study Plan', ar: 'الخطة الدراسية' },
  currentRegistration: { en: 'Current Semester Registration', ar: 'تسجيل الفصل الحالي' },
  academicRecord: { en: 'Academic Record', ar: 'السجل الأكاديمي' },
  gpaStatus: { en: 'GPA & Academic Status', ar: 'المعدلات والحالة الأكاديمية' },
  registrationHistory: { en: 'Registration History', ar: 'تاريخ التسجيل وإجراءات الطالب' },
  examsAssessments: { en: 'Exams & Assessments', ar: 'الامتحانات والتقييمات' },
  attendanceSummary: { en: 'Attendance Summary', ar: 'ملخص الحضور' },
  academicAdvising: { en: 'Academic Advising', ar: 'الإرشاد الأكاديمي' },
  graduationTracking: { en: 'Graduation Tracking', ar: 'تتبّع التخرج' },

  // Tabs
  tabPersonal: { en: 'Personal', ar: 'شخصي' },
  tabAcademic: { en: 'Academic', ar: 'أكاديمي' },
  tabFinancial: { en: 'Financial', ar: 'مالي' },
  tabDocuments: { en: 'Documents', ar: 'المستندات' },

  // Level
  level: { en: 'Level', ar: 'المستوى' },

  // Personal Information Fields
  firstNameAr: { en: 'First Name (Arabic)', ar: 'الاسم الأول بالعربي' },
  middleNameAr: { en: 'Middle Name (Arabic)', ar: 'اسم الأب بالعربي' },
  lastNameAr: { en: 'Last Name (Arabic)', ar: 'اسم العائلة بالعربي' },
  firstNameEn: { en: 'First Name (English)', ar: 'الاسم الأول بالإنجليزي' },
  middleNameEn: { en: 'Middle Name (English)', ar: 'اسم الأب بالإنجليزي' },
  lastNameEn: { en: 'Last Name (English)', ar: 'اسم العائلة بالإنجليزي' },
  studentIdNumber: { en: 'Student ID', ar: 'الرقم الجامعي' },
  nationalId: { en: 'National ID / Passport', ar: 'رقم الهوية / جواز السفر' },
  idType: { en: 'ID Type', ar: 'نوع الهوية' },
  nationalIdCard: { en: 'National ID Card', ar: 'هوية وطنية' },
  passport: { en: 'Passport', ar: 'جواز سفر' },
  otherDocument: { en: 'Other Document', ar: 'وثيقة أخرى' },
  dateOfBirth: { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  placeOfBirth: { en: 'Place of Birth', ar: 'مكان الميلاد' },
  gender: { en: 'Gender', ar: 'الجنس' },
  male: { en: 'Male', ar: 'ذكر' },
  female: { en: 'Female', ar: 'أنثى' },
  primaryNationality: { en: 'Primary Nationality', ar: 'الجنسية الأساسية' },
  secondaryNationality: { en: 'Secondary Nationality', ar: 'جنسية ثانية' },
  maritalStatus: { en: 'Marital Status', ar: 'الحالة الاجتماعية' },
  single: { en: 'Single', ar: 'أعزب' },
  married: { en: 'Married', ar: 'متزوج' },
  divorced: { en: 'Divorced', ar: 'مطلق' },
  widowed: { en: 'Widowed', ar: 'أرمل' },
  religion: { en: 'Religion', ar: 'الديانة' },
  primaryLanguage: { en: 'Primary Language', ar: 'اللغة الأساسية' },

  // Legal & Residency
  residencyType: { en: 'Residency Type', ar: 'نوع الإقامة' },
  resident: { en: 'Resident', ar: 'مقيم' },
  refugee: { en: 'Refugee', ar: 'لاجئ' },
  foreigner: { en: 'Foreigner', ar: 'أجنبي' },
  residencyNumber: { en: 'Residency / Refugee Card Number', ar: 'رقم الإقامة / كرت اللاجئ' },
  currentResidenceCountry: { en: 'Current Residence Country', ar: 'بلد الإقامة الحالي' },
  residencyExpiry: { en: 'Residency Expiry Date', ar: 'تاريخ انتهاء الإقامة' },

  // Contact Information
  primaryMobile: { en: 'Primary Mobile', ar: 'رقم الجوال الأساسي' },
  secondaryMobile: { en: 'Secondary Mobile', ar: 'رقم جوال ثانوي' },
  landline: { en: 'Landline Phone', ar: 'رقم هاتف أرضي' },
  personalEmail: { en: 'Personal Email', ar: 'البريد الإلكتروني الشخصي' },
  universityEmail: { en: 'University Email', ar: 'البريد الإلكتروني الجامعي' },
  linkedIn: { en: 'LinkedIn', ar: 'لينكد إن' },
  telegram: { en: 'Telegram', ar: 'تيليجرام' },

  // Address
  country: { en: 'Country', ar: 'الدولة' },
  governorate: { en: 'Governorate / Region', ar: 'المحافظة / المنطقة' },
  city: { en: 'City / Village / Camp', ar: 'المدينة / القرية / المخيم' },
  neighborhood: { en: 'Neighborhood / Street', ar: 'الحي / الشارع' },
  addressDescription: { en: 'Address Description', ar: 'وصف إضافي للعنوان' },
  postalCode: { en: 'Postal Code', ar: 'الرمز البريدي' },
  currentAddress: { en: 'Current Address', ar: 'العنوان الحالي' },
  permanentAddress: { en: 'Permanent Address', ar: 'العنوان الدائم' },

  // Guardian
  guardianName: { en: 'Guardian Name', ar: 'اسم ولي الأمر' },
  relationship: { en: 'Relationship', ar: 'صلة القرابة' },
  father: { en: 'Father', ar: 'الأب' },
  mother: { en: 'Mother', ar: 'الأم' },
  brother: { en: 'Brother', ar: 'الأخ' },
  sister: { en: 'Sister', ar: 'الأخت' },
  spouse: { en: 'Spouse', ar: 'الزوج/الزوجة' },
  legalGuardian: { en: 'Legal Guardian', ar: 'الوصي القانوني' },
  guardianMobile: { en: 'Guardian Mobile', ar: 'رقم جوال ولي الأمر' },
  guardianPhone: { en: 'Guardian Other Phone', ar: 'رقم هاتف آخر' },
  guardianEmail: { en: 'Guardian Email', ar: 'بريد ولي الأمر' },
  guardianOccupation: { en: 'Occupation', ar: 'المهنة' },
  guardianWorkplace: { en: 'Workplace', ar: 'مكان العمل' },
  guardianAddress: { en: 'Guardian Address', ar: 'عنوان ولي الأمر' },
  motherName: { en: 'Mother Name', ar: 'اسم الأم' },
  motherMobile: { en: 'Mother Mobile', ar: 'رقم جوال الأم' },
  familyMembers: { en: 'Number of Family Members', ar: 'عدد أفراد الأسرة' },
  siblingsInUniversity: { en: 'Siblings in University', ar: 'الإخوة الملتحقين في الجامعة' },

  // Emergency Contact
  emergencyName: { en: 'Emergency Contact Name', ar: 'اسم جهة الاتصال للطوارئ' },
  emergencyPhone: { en: 'Emergency Phone', ar: 'هاتف الطوارئ' },
  emergencyNote: { en: 'Notes', ar: 'ملاحظة' },
  preferredContact: { en: 'Preferred to contact first', ar: 'يفضّل الاتصال به أولًا' },

  // Previous Education
  certificateType: { en: 'Certificate Type', ar: 'نوع الشهادة' },
  tawjihi: { en: 'Tawjihi', ar: 'توجيهي' },
  equivalent: { en: 'Equivalent', ar: 'معادلة' },
  international: { en: 'International', ar: 'دولية' },
  highSchoolBranch: { en: 'High School Branch', ar: 'فرع الثانوية' },
  scientific: { en: 'Scientific', ar: 'علمي' },
  literary: { en: 'Literary', ar: 'أدبي' },
  sharia: { en: 'Sharia', ar: 'شرعي' },
  technology: { en: 'Technology', ar: 'تكنولوجيا' },
  highSchoolCountry: { en: 'Country', ar: 'الدولة' },
  highSchool: { en: 'High School', ar: 'المدرسة' },
  graduationYear: { en: 'Graduation Year', ar: 'سنة التخرّج' },
  highSchoolGPA: { en: 'High School GPA (%)', ar: 'معدل الثانوية العامة (%)' },
  seatNumber: { en: 'Seat Number', ar: 'رقم الجلوس' },
  previousUniversity: { en: 'Previous University', ar: 'الجامعة السابقة' },
  previousDegree: { en: 'Previous Degree', ar: 'الدرجة السابقة' },
  previousMajor: { en: 'Previous Major', ar: 'التخصص السابق' },
  previousGPA: { en: 'Previous GPA', ar: 'المعدل السابق' },

  // Special Needs
  hasSpecialNeeds: { en: 'Has Special Needs', ar: 'لديه احتياجات خاصة' },
  yes: { en: 'Yes', ar: 'نعم' },
  no: { en: 'No', ar: 'لا' },
  specialNeedsType: { en: 'Type of Special Need', ar: 'نوع الاحتياج' },
  hearing: { en: 'Hearing', ar: 'سمعي' },
  visual: { en: 'Visual', ar: 'بصري' },
  mobility: { en: 'Mobility', ar: 'حركي' },
  psychological: { en: 'Psychological', ar: 'نفسي' },
  other: { en: 'Other', ar: 'آخر' },
  conditionDescription: { en: 'Condition Description', ar: 'وصف مختصر للحالة' },
  requiredAccommodations: { en: 'Required Accommodations', ar: 'تسهيلات مطلوبة' },
  extraTime: { en: 'Extra exam time', ar: 'وقت إضافي بالامتحان' },
  specialSeating: { en: 'Special seating', ar: 'مقعد خاص' },
  chronicIllnesses: { en: 'Chronic Illnesses', ar: 'أمراض مزمنة مهمة' },
  drugAllergies: { en: 'Drug Allergies', ar: 'حساسية لأدوية معينة' },

  // System Accounts
  sisUsername: { en: 'SIS Username', ar: 'اسم مستخدم SIS' },
  lmsUsername: { en: 'LMS Username', ar: 'اسم مستخدم LMS' },
  officialEmail: { en: 'Official University Email', ar: 'البريد الجامعي الرسمي' },
  sisAccountStatus: { en: 'SIS Account Status', ar: 'حالة حساب SIS' },
  lmsAccountStatus: { en: 'LMS Account Status', ar: 'حالة حساب LMS' },
  active: { en: 'Active', ar: 'نشط' },
  locked: { en: 'Locked', ar: 'مقفل' },
  lastLogin: { en: 'Last Login', ar: 'آخر تسجيل دخول' },

  // Notes & Tags
  tags: { en: 'Tags', ar: 'التصنيفات' },
  excellent: { en: 'Excellent', ar: 'متفوق' },
  needsSupport: { en: 'Needs Support', ar: 'محتاج' },
  specialNeedsTag: { en: 'Special Needs', ar: 'ذوي احتياجات خاصة' },
  scholarshipStudent: { en: 'Scholarship Student', ar: 'طالب منحة' },
  admissionNotes: { en: 'Admission & Registration Notes', ar: 'ملاحظات عمادة القبول والتسجيل' },
  studentAffairsNotes: { en: 'Student Affairs Notes', ar: 'ملاحظات شؤون الطلبة' },
  advisorNotes: { en: 'Academic Advisor Notes', ar: 'ملاحظات المرشد الأكاديمي' },

  // Documents
  documentType: { en: 'Document Type', ar: 'نوع المستند' },
  highSchoolCertificate: { en: 'High School Certificate', ar: 'شهادة ثانوية' },
  transcript: { en: 'Transcript', ar: 'كشف درجات' },
  idCopy: { en: 'ID Copy', ar: 'صورة هوية' },
  passportCopy: { en: 'Passport Copy', ar: 'جواز سفر' },
  personalPhoto: { en: 'Personal Photo', ar: 'صورة شخصية' },
  scholarshipLetter: { en: 'Scholarship Letter', ar: 'كتاب منحة' },
  otherDocuments: { en: 'Other Documents', ar: 'مستندات أخرى' },
  uploadDate: { en: 'Upload Date', ar: 'تاريخ الرفع' },
  uploadedBy: { en: 'Uploaded By', ar: 'من قام بالرفع' },
  reviewStatus: { en: 'Review Status', ar: 'حالة المراجعة' },
  approved: { en: 'Approved', ar: 'مقبول' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  pending: { en: 'Pending', ar: 'قيد المراجعة' },
  documentNotes: { en: 'Document Notes', ar: 'ملاحظات على المستند' },

  // Academic - Program
  college: { en: 'College', ar: 'الكلية' },
  department: { en: 'Department', ar: 'القسم' },
  program: { en: 'Program', ar: 'التخصص' },
  degree: { en: 'Degree', ar: 'الدرجة العلمية' },
  bachelor: { en: 'Bachelor', ar: 'بكالوريوس' },
  master: { en: 'Master', ar: 'ماجستير' },
  phd: { en: 'PhD', ar: 'دكتوراه' },
  diploma: { en: 'Diploma', ar: 'دبلوم' },
  studyType: { en: 'Study Type', ar: 'نوع الدراسة' },
  regular: { en: 'Regular', ar: 'منتظم' },
  partTime: { en: 'Part-time', ar: 'جزئي' },
  online: { en: 'Online', ar: 'عن بعد' },
  studyPlanId: { en: 'Study Plan', ar: 'الخطة الدراسية' },
  cohort: { en: 'Cohort / Batch', ar: 'سنة الدفعة' },
  firstEnrollmentTerm: { en: 'First Enrollment Term', ar: 'الفصل الأول للطالب' },
  academicStatus: { en: 'Academic Status', ar: 'الحالة الأكاديمية' },
  regularStatus: { en: 'Regular', ar: 'منتظم' },
  onProbation: { en: 'On Probation', ar: 'إنذار أكاديمي' },
  dismissed: { en: 'Dismissed', ar: 'مفصول' },
  completedReqs: { en: 'Completed Requirements', ar: 'أنهى المتطلبات' },
  administrativeStatus: { en: 'Administrative Status', ar: 'الحالة الإدارية' },
  activeStatus: { en: 'Active', ar: 'نشط' },
  suspended: { en: 'Suspended', ar: 'موقوف' },
  withdrawn: { en: 'Withdrawn', ar: 'منسحب' },
  graduated: { en: 'Graduated', ar: 'متخرج' },
  advisorName: { en: 'Academic Advisor', ar: 'المرشد الأكاديمي' },
  advisorEmail: { en: 'Advisor Email', ar: 'بريد المرشد' },

  // Study Plan
  totalPlanCredits: { en: 'Total Credits', ar: 'عدد الساعات الكلي' },
  planLevels: { en: 'Plan Levels/Years', ar: 'عدد مستويات/سنوات الخطة' },
  courseCode: { en: 'Course Code', ar: 'كود المساق' },
  courseName: { en: 'Course Name', ar: 'اسم المساق' },
  credits: { en: 'Credits', ar: 'عدد الساعات' },
  courseType: { en: 'Course Type', ar: 'نوع المساق' },
  mandatory: { en: 'Mandatory', ar: 'إجباري' },
  elective: { en: 'Elective', ar: 'اختياري' },
  universityReq: { en: 'University Requirement', ar: 'متطلب جامعة' },
  collegeReq: { en: 'College Requirement', ar: 'متطلب كلية' },
  prerequisite: { en: 'Prerequisite', ar: 'المتطلب السابق' },
  courseStatus: { en: 'Course Status', ar: 'حالة المساق' },
  notTaken: { en: 'Not Taken', ar: 'لم يُدرس' },
  inProgress: { en: 'In Progress', ar: 'قيد الدراسة' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  exempt: { en: 'Exempt / Transferred', ar: 'معفى / محول' },

  // Current Registration
  currentTerm: { en: 'Current Term', ar: 'الفصل الحالي' },
  registrationStatus: { en: 'Registration Status', ar: 'حالة التسجيل' },
  registered: { en: 'Registered', ar: 'مسجل' },
  deferred: { en: 'Deferred', ar: 'مؤجل' },
  section: { en: 'Section', ar: 'الشعبة' },
  instructor: { en: 'Instructor', ar: 'اسم الدكتور' },
  schedule: { en: 'Schedule', ar: 'أيام وأوقات المحاضرة' },

  // Academic Record
  termName: { en: 'Term', ar: 'الفصل' },
  termStatus: { en: 'Term Status', ar: 'حالة الفصل' },
  finalGrade: { en: 'Final Grade', ar: 'الدرجة النهائية' },
  letterGrade: { en: 'Letter Grade', ar: 'التقدير' },
  notes: { en: 'Notes', ar: 'ملاحظات' },
  retake: { en: 'Retake', ar: 'إعادة' },
  transfer: { en: 'Transfer', ar: 'معادلة' },
  removed: { en: 'Removed', ar: 'محذوف' },
  termGpa: { en: 'Term GPA', ar: 'المعدل الفصلي' },
  cumulativeGpa: { en: 'Cumulative GPA', ar: 'المعدل التراكمي' },

  // GPA Status
  totalRequiredCredits: { en: 'Total Required Credits', ar: 'إجمالي الساعات المطلوبة للتخرج' },
  earnedCredits: { en: 'Earned Credits', ar: 'الساعات المنجزة' },
  currentCredits: { en: 'Current Credits', ar: 'الساعات قيد الدراسة الآن' },
  remainingCredits: { en: 'Remaining Credits', ar: 'الساعات المتبقية للتخرج' },
  lastTermGpa: { en: 'Last Term GPA', ar: 'آخر معدل فصلي' },
  academicWarnings: { en: 'Academic Warnings', ar: 'عدد الإنذارات الأكاديمية' },
  currentStatus: { en: 'Current Status', ar: 'الحالة الحالية' },
  goodStanding: { en: 'Good Standing', ar: 'حالة جيدة' },
  firstProbation: { en: 'First Probation', ar: 'إنذار أول' },
  finalProbation: { en: 'Final Probation', ar: 'إنذار نهائي' },

  // Registration History
  initialCredits: { en: 'Initial Registered Credits', ar: 'عدد الساعات المسجّلة في البداية' },
  afterChanges: { en: 'Credits After Changes', ar: 'عدد الساعات بعد السحب والإضافة' },
  actionType: { en: 'Action Type', ar: 'نوع الإجراء' },
  drop: { en: 'Drop', ar: 'سحب مساق' },
  add: { en: 'Add', ar: 'إضافة مساق' },
  sectionChange: { en: 'Section Change', ar: 'تغيير شعبة' },
  fullWithdrawal: { en: 'Full Withdrawal', ar: 'انسحاب من الفصل كاملًا' },
  deferral: { en: 'Deferral', ar: 'تأجيل فصل' },
  actionDate: { en: 'Action Date', ar: 'التاريخ' },
  approvedBy: { en: 'Approved By', ar: 'من وافق' },

  // Exams
  assessmentType: { en: 'Assessment Type', ar: 'نوع التقييم' },
  assignment: { en: 'Assignment', ar: 'واجب' },
  quiz: { en: 'Quiz', ar: 'اختبار قصير' },
  project: { en: 'Project', ar: 'مشروع' },
  midterm: { en: 'Midterm', ar: 'اختبار نصفي' },
  final: { en: 'Final', ar: 'اختبار نهائي' },
  makeup: { en: 'Make-up / Retake', ar: 'إعادة الاختبار' },
  score: { en: 'Score', ar: 'الدرجة المحصّلة' },
  maxScore: { en: 'Max Score', ar: 'الدرجة من' },
  weight: { en: 'Weight (%)', ar: 'الوزن النسبي (%)' },

  // Attendance
  attendanceRate: { en: 'Attendance Rate', ar: 'نسبة الحضور' },
  absences: { en: 'Absences', ar: 'عدد الغيابات' },
  warningReached: { en: 'Warning Reached', ar: 'وصل حد الإنذار' },
  examBan: { en: 'Exam Ban', ar: 'ممنوع من الامتحان النهائي' },

  // Advising
  meetingDate: { en: 'Meeting Date', ar: 'تاريخ الجلسة' },
  meetingType: { en: 'Meeting Type', ar: 'نوع اللقاء' },
  inPerson: { en: 'In Person', ar: 'حضوري' },
  onlineSession: { en: 'Online', ar: 'أونلاين' },
  meetingSummary: { en: 'Meeting Summary', ar: 'ملخص ما تم الاتفاق عليه' },
  recommendations: { en: 'Recommendations', ar: 'توصيات الأكاديمية' },

  // Graduation
  creditsCompleted: { en: 'Credits Completed?', ar: 'استوفى الساعات المطلوبة؟' },
  coreCoursesCompleted: { en: 'Core Courses Completed?', ar: 'استوفى المواد الأساسية؟' },
  electivesCompleted: { en: 'Electives Completed?', ar: 'استوفى المواد الاختيارية؟' },
  graduationProject: { en: 'Graduation Project', ar: 'مشروع تخرج' },
  projectTitle: { en: 'Project Title', ar: 'عنوان المشروع' },
  projectSupervisor: { en: 'Project Supervisor', ar: 'مشرف المشروع' },
  projectStatus: { en: 'Project Status', ar: 'حالة المشروع' },
  ongoing: { en: 'Ongoing', ar: 'مستمر' },
  projectGrade: { en: 'Project Grade', ar: 'درجة المشروع' },
  internship: { en: 'Field Training / Internship', ar: 'تدريب ميداني' },
  internshipOrg: { en: 'Organization', ar: 'اسم الجهة' },
  internshipDuration: { en: 'Duration', ar: 'عدد الساعات/الأسابيع' },
  graduationRequest: { en: 'Graduation Request Status', ar: 'حالة طلب التخرج' },
  notSubmitted: { en: 'Not Submitted', ar: 'لم يقدّم' },
  underProcessing: { en: 'Under Processing', ar: 'طلب تحت المعالجة' },
  approvedGrad: { en: 'Approved', ar: 'موافق عليه' },

  // Financial
  financialSummary: { en: 'Financial Summary', ar: 'الملخص المالي' },
  totalFees: { en: 'Total Fees This Term', ar: 'إجمالي رسوم الفصل' },
  amountPaid: { en: 'Amount Paid', ar: 'المبلغ المدفوع' },
  currentBalance: { en: 'Current Balance', ar: 'الرصيد الحالي' },
  previousBalance: { en: 'Previous Balance', ar: 'الرصيد السابق' },
  scholarships: { en: 'Scholarships & Discounts', ar: 'المنح والخصومات' },
  financialStatus: { en: 'Financial Status', ar: 'الحالة المالية' },
  cleared: { en: 'Cleared', ar: 'مسددة' },
  onHold: { en: 'On Hold', ar: 'معلقة' },

  // Actions
  editProfile: { en: 'Edit Profile', ar: 'تعديل الملف' },
  print: { en: 'Print', ar: 'طباعة' },
  download: { en: 'Download', ar: 'تحميل' },
  view: { en: 'View', ar: 'عرض' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },

  // Student Status
  statusActive: { en: 'Active', ar: 'نشط' },
  statusSuspended: { en: 'Suspended', ar: 'موقوف' },
  statusGraduated: { en: 'Graduated', ar: 'متخرج' },
  statusWithdrawn: { en: 'Withdrawn', ar: 'منسحب' },
  statusApplicant: { en: 'Applicant', ar: 'متقدم' },

  // Staff Profile Translations
  staffProfile: { en: 'Staff Profile', ar: 'ملف الموظف' },
  staffInfo: { en: 'Staff Information', ar: 'معلومات الموظف' },
  employeeId: { en: 'Employee ID', ar: 'رقم الموظف' },
  jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي' },
  departmentName: { en: 'Department', ar: 'القسم' },
  hireDate: { en: 'Hire Date', ar: 'تاريخ التعيين' },
  workEmail: { en: 'Work Email', ar: 'البريد الإلكتروني للعمل' },
  workPhone: { en: 'Work Phone', ar: 'هاتف العمل' },
  officeLocation: { en: 'Office Location', ar: 'موقع المكتب' },
  employmentStatus: { en: 'Employment Status', ar: 'حالة التوظيف' },
  fullTime: { en: 'Full-time', ar: 'دوام كامل' },
  partTimeJob: { en: 'Part-time', ar: 'دوام جزئي' },
  studentAffairsOfficer: { en: 'Student Affairs Officer', ar: 'موظف شؤون الطلبة' },
  roleLabel: { en: 'Role', ar: 'الدور' },
  permissions: { en: 'Permissions', ar: 'الصلاحيات' },
  accountInfo: { en: 'Account Information', ar: 'معلومات الحساب' },
  lastLoginDate: { en: 'Last Login', ar: 'آخر تسجيل دخول' },
  accountCreated: { en: 'Account Created', ar: 'تاريخ إنشاء الحساب' },
};

const Profile: React.FC<ProfileProps> = ({ lang, student: propStudent, role }) => {
  const toast = useToast();
  const { branding } = useBranding();

  // Currency formatting helper
  const formatCurrency = (amount: number) => {
    const symbol = branding?.currencySymbol || '$';
    const position = branding?.currencyPosition || 'before';
    const formattedAmount = Math.abs(amount).toLocaleString();
    return position === 'before'
      ? `${symbol}${formattedAmount}`
      : `${formattedAmount} ${symbol}`;
  };

  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'financial' | 'documents'>('personal');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [academicData, setAcademicData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    legal: false,
    contact: true,
    address: false,
    guardian: true,
    emergency: false,
    education: false,
    specialNeeds: false,
    systems: false,
    notes: false,
    program: true,
    studyPlan: false,
    currentReg: true,
    academicRecord: true,
    gpaStatus: true,
    regHistory: false,
    exams: false,
    attendance: true,
    advising: false,
    graduation: false,
    financial: true,
    documents: true
  });

  const isRTL = lang === 'ar';
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Photo upload handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(lang === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setShowPhotoUpload(true);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;
    setUploadingPhoto(true);
    try {
      // Simulate upload - in real app, call API
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Update profile with new photo
      if (profileData) {
        setProfileData({ ...profileData, avatar: photoPreview });
      }
      setShowPhotoUpload(false);
      setSelectedPhoto(null);
    } catch (error) {
      // Error uploading photo
    } finally {
      setUploadingPhoto(false);
    }
  };

  const cancelPhotoUpload = () => {
    setShowPhotoUpload(false);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Print handler
  const handlePrint = () => {
    printPage(undefined, 'Student Profile', 'الملف الشخصي للطالب', lang);
  };

  // Fetch all profile data from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch profile data
        const profile = await studentsAPI.getMyProfile();
        setProfileData(profile);

        const studentId = profile?.student?.id || profile?.id;

        if (studentId) {
          // Fetch additional data in parallel
          const [financial, academic, documents] = await Promise.all([
            financeAPI.getMyBalance().catch(() => null),
            studentsAPI.getMyAcademicSummary().catch(() => null),
            studentsAPI.getDocuments(studentId).catch(() => []),
          ]);

          setFinancialData(financial);
          setAcademicData(academic);
          setDocumentsData(documents?.data || documents || []);
        }
      } catch (error) {
        // Error fetching profile data
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Use API data with fallback to props
  const student = profileData?.student || profileData || propStudent;

  // Safe access helper
  const safeGet = (obj: any, path: string, defaultValue: any = '-') => {
    try {
      const value = path.split('.').reduce((o, k) => (o || {})[k], obj);
      return value !== undefined && value !== null ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-green-500',
      'SUSPENDED': 'bg-yellow-500',
      'GRADUATED': 'bg-blue-500',
      'WITHDRAWN': 'bg-red-500',
      'APPLICANT': 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
      'SUSPENDED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'GRADUATED': 'bg-blue-100 text-blue-700 border-blue-200',
      'WITHDRAWN': 'bg-red-100 text-red-700 border-red-200',
      'APPLICANT': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { en: string; ar: string }> = {
      'ACTIVE': t.statusActive,
      'SUSPENDED': t.statusSuspended,
      'GRADUATED': t.statusGraduated,
      'WITHDRAWN': t.statusWithdrawn,
      'APPLICANT': t.statusApplicant
    };
    return statusMap[status]?.[lang] || status;
  };

  // Display names
  const displayNameAr = `${safeGet(student, 'firstNameAr', '')} ${safeGet(student, 'middleNameAr', '')} ${safeGet(student, 'lastNameAr', '')}`.trim() || safeGet(student, 'nameAr', safeGet(student, 'name', ''));
  const displayNameEn = `${safeGet(student, 'firstNameEn', safeGet(student, 'firstName', ''))} ${safeGet(student, 'middleNameEn', '')} ${safeGet(student, 'lastNameEn', safeGet(student, 'lastName', ''))}`.trim() || safeGet(student, 'nameEn', '');
  const displayName = lang === 'ar' ? displayNameAr : displayNameEn;
  const altName = lang === 'ar' ? displayNameEn : displayNameAr;

  // Section Header Component
  const SectionHeader = ({ title, icon: Icon, section, colorClass = 'bg-blue-50 text-blue-600', badge }: {
    title: string;
    icon: any;
    section: string;
    colorClass?: string;
    badge?: string;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 rounded-t-xl border-b dark:border-slate-600 hover:opacity-90 transition-all ${colorClass.includes('bg-') ? colorClass.split(' ')[0] : 'bg-blue-50'} dark:bg-slate-700/50`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass} dark:opacity-90`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        {badge && <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">{badge}</span>}
      </div>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
    </button>
  );

  // Info Item Component
  const InfoItem = ({ label, value, icon: Icon, fullWidth = false }: { label: string; value: any; icon?: any; fullWidth?: boolean }) => (
    <div className={`flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 ${fullWidth ? 'col-span-2' : ''}`}>
      {Icon && <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-1 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 break-words">{value || '-'}</p>
      </div>
    </div>
  );

  // Stat Card Component
  const StatCard = ({ label, value, color, icon: Icon }: { label: string; value: string | number; color: string; icon?: any }) => (
    <div className={`${color} dark:opacity-90 rounded-xl p-4 text-center transition-transform hover:scale-105 duration-200`}>
      {Icon && <Icon className="w-5 h-5 mx-auto mb-2 opacity-70" />}
      <p className="text-xs font-medium mb-1 opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  // Transform API data to display format
  const transformCourses = (apiCourses: any[]) => {
    return apiCourses.map((c: any) => ({
      code: c.course?.code || c.code || '',
      name: lang === 'ar' ? (c.course?.name_ar || c.name_ar || c.name) : (c.course?.name || c.name || ''),
      credits: c.course?.credit_hours || c.credit_hours || c.credits || 3,
      section: c.section || 'A',
      instructor: c.instructor?.name || c.instructor_name || 'TBA',
      schedule: c.schedule_display || c.schedule || '-',
      type: c.course?.type || c.type || 'mandatory',
      status: c.status || 'inProgress',
      grade: c.final_grade || c.letter_grade || c.grade || '-',
      prerequisite: c.course?.prerequisite || c.prerequisite || '-',
    }));
  };

  const transformDocuments = (apiDocs: any[]) => {
    return apiDocs.map((d: any) => ({
      id: d.id?.toString() || Math.random().toString(),
      type: d.type || d.document_type || 'other',
      name: lang === 'ar' ? (d.name_ar || d.name || d.title) : (d.name || d.title || 'Document'),
      uploadDate: d.created_at || d.upload_date || new Date().toISOString().split('T')[0],
      uploadedBy: d.uploaded_by || 'student',
      status: d.status?.toLowerCase() || 'pending',
    }));
  };

  // Use API data only (no demo fallback)
  const displayStudyPlanCourses = academicData?.courses?.length > 0
    ? transformCourses(academicData.courses)
    : [];

  const displayCurrentCourses = academicData?.currentEnrollments?.length > 0
    ? transformCourses(academicData.currentEnrollments)
    : [];

  const displayAttendance = attendanceData?.length > 0
    ? attendanceData.map((a: any) => ({
        course: a.course?.code || a.course_code || '',
        rate: a.attendance_rate || a.rate || 0,
        absences: a.absences || 0,
        warning: a.warning || a.absences > 3,
      }))
    : [];

  const displayDocuments = documentsData?.length > 0
    ? transformDocuments(documentsData)
    : [];

  // Financial summary from API
  const displayFinancial = financialData ? {
    totalFees: financialData.total_fees || financialData.totalFees || 0,
    amountPaid: financialData.amount_paid || financialData.amountPaid || 0,
    balance: financialData.balance || financialData.current_balance || 0,
    previousBalance: financialData.previous_balance || 0,
    status: financialData.status || 'pending',
  } : null;

  // GPA History Data for Chart (API data only)
  const gpaHistoryData = academicData?.gpaHistory || [];

  // Credit distribution for Pie Chart
  const creditDistribution = [
    { name: lang === 'ar' ? 'مكتمل' : 'Completed', value: safeGet(student, 'completedCredits', 45), color: '#22c55e' },
    { name: lang === 'ar' ? 'قيد الدراسة' : 'In Progress', value: safeGet(student, 'registeredCredits', 15), color: '#6366f1' },
    { name: lang === 'ar' ? 'متبقي' : 'Remaining', value: safeGet(student, 'remainingCredits', 70), color: '#e5e7eb' },
  ];

  // Tabs
  const tabs = [
    { id: 'personal', label: t.tabPersonal[lang], icon: User },
    { id: 'academic', label: t.tabAcademic[lang], icon: GraduationCap },
    { id: 'financial', label: t.tabFinancial[lang], icon: CreditCard },
    { id: 'documents', label: t.tabDocuments[lang], icon: FolderOpen },
  ];

  // Loading state
  if (loading && !propStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">{lang === 'ar' ? 'جاري تحميل الملف الشخصي...' : 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  // Check if user is staff (not student)
  const isStaff = role && role !== UserRole.STUDENT;

  // Staff Profile Render
  if (isStaff) {
    const staffName = propStudent?.name || propStudent?.full_name_en || propStudent?.fullName || 'Staff Member';
    const staffEmail = propStudent?.email || '';
    const staffAvatar = propStudent?.avatar || propStudent?.profile_picture_url || null;

    const getRoleLabel = (r: UserRole) => {
      const labels: Record<string, { en: string; ar: string }> = {
        STUDENT_AFFAIRS: { en: 'Student Affairs Officer', ar: 'موظف شؤون الطلبة' },
        ADMIN: { en: 'System Administrator', ar: 'مدير النظام' },
        FINANCE: { en: 'Finance Officer', ar: 'موظف مالية' },
        LECTURER: { en: 'Lecturer', ar: 'محاضر' },
        REGISTRAR: { en: 'Registrar Officer', ar: 'موظف القبول والتسجيل' },
        ADMISSIONS: { en: 'Admissions Officer', ar: 'موظف القبول' },
        ACCOUNTANT: { en: 'Accountant', ar: 'محاسب' },
      };
      return labels[r]?.[lang] || r;
    };

    const getRolePermissions = (r: UserRole) => {
      const permissions: Record<string, { en: string[]; ar: string[] }> = {
        STUDENT_AFFAIRS: {
          en: ['View Students', 'Create Students', 'Edit Students', 'Upload Documents', 'Manage Admissions', 'Course Registration', 'Study Plans'],
          ar: ['عرض الطلاب', 'إضافة طلاب', 'تعديل الطلاب', 'رفع المستندات', 'إدارة القبول', 'تسجيل المساقات', 'الخطط الدراسية']
        },
        ADMIN: {
          en: ['Full System Access', 'User Management', 'System Settings', 'All Modules'],
          ar: ['صلاحيات كاملة', 'إدارة المستخدمين', 'إعدادات النظام', 'جميع الوحدات']
        },
        FINANCE: {
          en: ['Financial Records', 'Payments', 'Reports', 'Student Balances'],
          ar: ['السجلات المالية', 'المدفوعات', 'التقارير', 'أرصدة الطلاب']
        },
        LECTURER: {
          en: ['View Courses', 'Grade Management', 'Attendance', 'Student Grades'],
          ar: ['عرض المساقات', 'إدارة الدرجات', 'الحضور', 'درجات الطلاب']
        },
      };
      return permissions[r]?.[lang] || [];
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Staff Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative">
            <div className="absolute inset-0 opacity-30"></div>
            <div className="absolute top-4 end-4 flex gap-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-6">
            <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-end -mt-14 mb-4 gap-4">
              {/* Avatar & Basic Info */}
              <div className="flex items-end gap-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
                    {staffAvatar ? (
                      <img src={staffAvatar} alt={staffName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                        {staffName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -end-1 bg-emerald-500 w-7 h-7 rounded-full border-4 border-white dark:border-slate-700 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="pb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{staffName}</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{staffEmail}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-wrap items-center gap-3 lg:pb-1">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
                  {getRoleLabel(role)}
                </span>
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                  {t.active[lang]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Information Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            {t.staffInfo[lang]}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.roleLabel[lang]}</p>
                <p className="font-medium text-slate-900 dark:text-white">{getRoleLabel(role)}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.workEmail[lang]}</p>
                <p className="font-medium text-slate-900 dark:text-white">{staffEmail || '-'}</p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.departmentName[lang]}</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {role === UserRole.STUDENT_AFFAIRS ? (lang === 'ar' ? 'شؤون الطلبة' : 'Student Affairs') :
                   role === UserRole.FINANCE ? (lang === 'ar' ? 'الشؤون المالية' : 'Finance') :
                   role === UserRole.ADMIN ? (lang === 'ar' ? 'إدارة النظام' : 'System Administration') :
                   role === UserRole.LECTURER ? (lang === 'ar' ? 'الشؤون الأكاديمية' : 'Academic Affairs') :
                   (lang === 'ar' ? 'الإدارة' : 'Administration')}
                </p>
              </div>
            </div>

            {/* Employment Status */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.employmentStatus[lang]}</p>
                <p className="font-medium text-slate-900 dark:text-white">{t.fullTime[lang]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            {t.permissions[lang]}
          </h2>

          <div className="flex flex-wrap gap-2">
            {getRolePermissions(role).map((permission, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>

        {/* Account Information Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            {t.accountInfo[lang]}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Status */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.sisAccountStatus[lang]}</p>
                <p className="font-medium text-green-600 dark:text-green-400">{t.active[lang]}</p>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.lastLoginDate[lang]}</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'ar' ? 'تحديث صورة الملف الشخصي' : 'Update Profile Photo'}
              </h3>
              {photoPreview && (
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-600">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                {lang === 'ar' ? 'تأكد من أن الصورة واضحة ومناسبة' : 'Make sure the photo is clear and appropriate'}
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
              <button
                onClick={cancelPhotoUpload}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-500 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {lang === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {lang === 'ar' ? 'حفظ الصورة' : 'Save Photo'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== STUDENT HEADER CARD ========== */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-slate-300">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative print:bg-blue-600">
          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,...')]"></div>
          <div className="absolute top-4 end-4 flex gap-2 print:hidden">
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 md:px-8 pb-6">
          <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-end -mt-14 mb-4 gap-4">
            {/* Avatar & Basic Info */}
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  {(photoPreview || safeGet(student, 'avatar') || safeGet(student, 'profile_picture_url') || safeGet(student, 'profilePicture')) ? (
                    <img src={photoPreview || student.avatar || student.profile_picture_url || student.profilePicture} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-1 -end-1 ${getStatusColor(safeGet(student, 'status', 'ACTIVE'))} w-7 h-7 rounded-full border-4 border-white dark:border-slate-700 flex items-center justify-center`}>
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -start-1 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-all shadow-lg hover:scale-110 print:hidden"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="pb-1">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
                {altName && <p className="text-slate-500 dark:text-slate-400 text-sm">{altName}</p>}
              </div>
            </div>

            {/* Status & QR */}
            <div className="flex flex-wrap items-center gap-3 lg:pb-1">
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getStatusBadgeColor(safeGet(student, 'status', 'ACTIVE'))}`}>
                {getStatusLabel(safeGet(student, 'status', 'ACTIVE'))}
              </span>
              <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-bold border border-purple-100">
                {`${t.level[lang]} ${safeGet(student, 'level', 3)}`}
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                {safeGet(student, 'currentSemester', '2024/2025 - Sem 1')}
              </span>
              <div className="p-2 bg-white border border-slate-200 rounded-lg">
                <QRCodeSVG
                  value={`https://sistest.vertexuniversity.edu.eu/#/profile`}
                  size={32}
                  level="M"
                  fgColor="#1e293b"
                />
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.studentIdNumber[lang]}</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{safeGet(student, 'studentId', 'STU-2024-001')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.college[lang]}</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{safeGet(student, 'college', 'Engineering')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.program[lang]}</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{safeGet(student, 'major', 'Computer Science')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== TABS ========== */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 print:hidden">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========== PERSONAL TAB ========== */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.personalInfo[lang]} icon={User} section="personal" colorClass="bg-blue-100 text-blue-600" />
            {expandedSections.personal && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoItem label={t.firstNameAr[lang]} value={safeGet(student, 'firstNameAr', safeGet(student, 'firstNameAr', 'أحمد'))} />
                <InfoItem label={t.firstNameEn[lang]} value={safeGet(student, 'firstNameEn', safeGet(student, 'firstName', 'Ahmed'))} />
                <InfoItem label={t.middleNameAr[lang]} value={safeGet(student, 'middleNameAr', 'محمد')} />
                <InfoItem label={t.middleNameEn[lang]} value={safeGet(student, 'middleNameEn', 'Mohammed')} />
                <InfoItem label={t.lastNameAr[lang]} value={safeGet(student, 'lastNameAr', 'منصور')} />
                <InfoItem label={t.lastNameEn[lang]} value={safeGet(student, 'lastNameEn', safeGet(student, 'lastName', 'Mansour'))} />
                <InfoItem label={t.nationalId[lang]} value={safeGet(student, 'nationalId', '4XXXXXXXXX')} icon={CreditCard} />
                <InfoItem label={t.idType[lang]} value={t.nationalIdCard[lang]} icon={FileText} />
                <InfoItem label={t.dateOfBirth[lang]} value={safeGet(student, 'dateOfBirth', '2000-05-15')} icon={Calendar} />
                <InfoItem label={t.placeOfBirth[lang]} value={`${safeGet(student, 'birthCity', 'Gaza')}, ${safeGet(student, 'birthCountry', 'Palestine')}`} icon={MapPin} />
                <InfoItem label={t.gender[lang]} value={safeGet(student, 'gender', 'MALE') === 'MALE' ? t.male[lang] : t.female[lang]} icon={User} />
                <InfoItem label={t.primaryNationality[lang]} value={safeGet(student, 'nationality', 'Palestinian')} icon={Flag} />
                <InfoItem label={t.secondaryNationality[lang]} value={safeGet(student, 'secondaryNationality', '-')} icon={Flag} />
                <InfoItem label={t.maritalStatus[lang]} value={t.single[lang]} icon={Heart} />
                <InfoItem label={t.religion[lang]} value={safeGet(student, 'religion', 'Islam')} />
                <InfoItem label={t.primaryLanguage[lang]} value={safeGet(student, 'primaryLanguage', 'Arabic')} icon={Globe} />
              </div>
            )}
          </div>

          {/* Legal & Residency */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.legalResidency[lang]} icon={Shield} section="legal" colorClass="bg-amber-100 text-amber-600" />
            {expandedSections.legal && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoItem label={t.residencyType[lang]} value={t.resident[lang]} icon={Home} />
                <InfoItem label={t.residencyNumber[lang]} value={safeGet(student, 'residencyNumber', '-')} icon={CreditCard} />
                <InfoItem label={t.currentResidenceCountry[lang]} value={safeGet(student, 'residenceCountry', 'Palestine')} icon={Globe} />
                <InfoItem label={t.residencyExpiry[lang]} value={safeGet(student, 'residencyExpiry', '-')} icon={Calendar} />
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.contactInfo[lang]} icon={Phone} section="contact" colorClass="bg-green-100 text-green-600" />
            {expandedSections.contact && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoItem label={t.primaryMobile[lang]} value={safeGet(student, 'phone', '+970 59 XXX XXXX')} icon={Phone} />
                <InfoItem label={t.secondaryMobile[lang]} value={safeGet(student, 'secondaryPhone', '-')} icon={Phone} />
                <InfoItem label={t.landline[lang]} value={safeGet(student, 'landline', '-')} icon={Phone} />
                <InfoItem label={t.personalEmail[lang]} value={safeGet(student, 'personalEmail', 'ahmed@gmail.com')} icon={Mail} />
                <InfoItem label={t.linkedIn[lang]} value={safeGet(student, 'linkedin', '-')} icon={ExternalLink} />
                <InfoItem label={t.telegram[lang]} value={safeGet(student, 'telegram', '-')} icon={MessageSquare} />
              </div>
            )}
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.addressInfo[lang]} icon={MapPin} section="address" colorClass="bg-orange-100 text-orange-600" />
            {expandedSections.address && (
              <div className="p-6">
                {/* Current Address */}
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  {t.currentAddress[lang]}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                  <InfoItem label={t.country[lang]} value={safeGet(student, 'address.country', 'Palestine')} icon={Globe} />
                  <InfoItem label={t.governorate[lang]} value={safeGet(student, 'address.governorate', 'Gaza')} icon={MapPin} />
                  <InfoItem label={t.city[lang]} value={safeGet(student, 'address.city', 'Gaza City')} icon={Building} />
                  <InfoItem label={t.neighborhood[lang]} value={safeGet(student, 'address.neighborhood', 'Al-Rimal')} icon={Home} />
                  <InfoItem label={t.postalCode[lang]} value={safeGet(student, 'address.postalCode', '00970')} icon={Hash} />
                  <InfoItem label={t.addressDescription[lang]} value={safeGet(student, 'address.description', 'Near the main square')} fullWidth />
                </div>

                {/* Permanent Address */}
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t.permanentAddress[lang]}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <InfoItem label={t.country[lang]} value={safeGet(student, 'permanentAddress.country', safeGet(student, 'address.country', 'Palestine'))} icon={Globe} />
                  <InfoItem label={t.governorate[lang]} value={safeGet(student, 'permanentAddress.governorate', safeGet(student, 'address.governorate', 'Gaza'))} icon={MapPin} />
                  <InfoItem label={t.city[lang]} value={safeGet(student, 'permanentAddress.city', safeGet(student, 'address.city', 'Gaza City'))} icon={Building} />
                  <InfoItem label={t.neighborhood[lang]} value={safeGet(student, 'permanentAddress.neighborhood', safeGet(student, 'address.neighborhood', 'Al-Rimal'))} icon={Home} />
                  <InfoItem label={t.postalCode[lang]} value={safeGet(student, 'permanentAddress.postalCode', safeGet(student, 'address.postalCode', '00970'))} icon={Hash} />
                  <InfoItem label={t.addressDescription[lang]} value={safeGet(student, 'permanentAddress.description', safeGet(student, 'address.description', '-'))} fullWidth />
                </div>
              </div>
            )}
          </div>

          {/* Guardian & Family */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.guardianFamily[lang]} icon={Users} section="guardian" colorClass="bg-purple-100 text-purple-600" />
            {expandedSections.guardian && (
              <div className="p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t.father[lang]}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-slate-50 rounded-lg p-4 mb-4">
                  <InfoItem label={t.guardianName[lang]} value={safeGet(student, 'guardian.name', 'Mohammed Mansour')} />
                  <InfoItem label={t.relationship[lang]} value={t.father[lang]} />
                  <InfoItem label={t.guardianMobile[lang]} value={safeGet(student, 'guardian.phone', '+970 59 XXX XXXX')} icon={Phone} />
                  <InfoItem label={t.guardianPhone[lang]} value={safeGet(student, 'guardian.altPhone', '-')} icon={Phone} />
                  <InfoItem label={t.guardianEmail[lang]} value={safeGet(student, 'guardian.email', 'father@email.com')} icon={Mail} />
                  <InfoItem label={t.guardianOccupation[lang]} value={safeGet(student, 'guardian.occupation', 'Engineer')} icon={Briefcase} />
                  <InfoItem label={t.guardianWorkplace[lang]} value={safeGet(student, 'guardian.workplace', '-')} icon={Building} />
                  <InfoItem label={t.guardianAddress[lang]} value={safeGet(student, 'guardian.address', 'Same as student')} icon={MapPin} />
                </div>

                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  {t.mother[lang]}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-pink-50 rounded-lg p-4 mb-4">
                  <InfoItem label={t.motherName[lang]} value={safeGet(student, 'mother.name', 'Fatima Ahmed')} />
                  <InfoItem label={t.motherMobile[lang]} value={safeGet(student, 'mother.phone', '+970 59 XXX XXXX')} icon={Phone} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">{t.familyMembers[lang]}</p>
                    <p className="text-2xl font-bold text-blue-700">{safeGet(student, 'familyMembers', 5)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-purple-600 font-medium mb-1">{t.siblingsInUniversity[lang]}</p>
                    <p className="text-2xl font-bold text-purple-700">{safeGet(student, 'siblingsInUniversity', 1)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.emergencyContacts[lang]} icon={AlertCircle} section="emergency" colorClass="bg-red-100 text-red-600" />
            {expandedSections.emergency && (
              <div className="p-6">
                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-red-800">{t.emergencyContacts[lang]} 1</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">{t.preferredContact[lang]}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <InfoItem label={t.emergencyName[lang]} value={safeGet(student, 'emergencyContact.name', 'Mohammed Mansour')} />
                    <InfoItem label={t.relationship[lang]} value={t.father[lang]} />
                    <InfoItem label={t.emergencyPhone[lang]} value={safeGet(student, 'emergencyContact.phone', '+970 59 XXX XXXX')} icon={Phone} />
                    <InfoItem label={t.emergencyNote[lang]} value={safeGet(student, 'emergencyContact.note', '-')} />
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <span className="text-sm font-semibold text-orange-800 block mb-3">{t.emergencyContacts[lang]} 2</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <InfoItem label={t.emergencyName[lang]} value={safeGet(student, 'emergencyContact2.name', 'Uncle Ahmed')} />
                    <InfoItem label={t.relationship[lang]} value={t.other[lang]} />
                    <InfoItem label={t.emergencyPhone[lang]} value={safeGet(student, 'emergencyContact2.phone', '+970 59 XXX XXXX')} icon={Phone} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Previous Education */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.previousEducation[lang]} icon={BookOpen} section="education" colorClass="bg-indigo-100 text-indigo-600" />
            {expandedSections.education && (
              <div className="p-6">
                {/* High School / Tawjihi Section */}
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {lang === 'ar' ? 'الثانوية العامة' : 'High School'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                  <InfoItem label={t.certificateType[lang]} value={safeGet(student, 'certificateType', t.tawjihi[lang])} />
                  <InfoItem label={t.highSchoolBranch[lang]} value={safeGet(student, 'highSchoolBranch', t.scientific[lang])} />
                  <InfoItem label={t.highSchoolCountry[lang]} value={safeGet(student, 'highSchoolCountry', 'Palestine')} icon={Globe} />
                  <InfoItem label={t.highSchool[lang]} value={safeGet(student, 'highSchool', 'Gaza Secondary School')} icon={Building} />
                  <InfoItem label={t.graduationYear[lang]} value={safeGet(student, 'highSchoolGradYear', '2022')} icon={Calendar} />
                  <InfoItem label={t.highSchoolGPA[lang]} value={`${safeGet(student, 'highSchoolGPA', 92)}%`} icon={Award} />
                  <InfoItem label={t.seatNumber[lang]} value={safeGet(student, 'seatNumber', '12345')} icon={Hash} />
                </div>

                {/* Previous University Section (for Master/PhD) */}
                {(safeGet(student, 'degreeType', '') === 'MASTER' || safeGet(student, 'degreeType', '') === 'PHD' || safeGet(student, 'previousUniversity', '')) && (
                  <>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {lang === 'ar' ? 'الدراسة الجامعية السابقة' : 'Previous University Education'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
                      <InfoItem label={t.previousUniversity[lang]} value={safeGet(student, 'previousUniversity', '-')} icon={Building} />
                      <InfoItem label={t.previousDegree[lang]} value={safeGet(student, 'previousDegree', '-')} icon={Award} />
                      <InfoItem label={t.previousMajor[lang]} value={safeGet(student, 'previousMajor', '-')} icon={BookOpen} />
                      <InfoItem label={t.graduationYear[lang]} value={safeGet(student, 'previousGradYear', '-')} icon={Calendar} />
                      <InfoItem label={t.previousGPA[lang]} value={safeGet(student, 'previousGPA', '-')} icon={TrendingUp} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Special Needs & Medical */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.specialNeeds[lang]} icon={Stethoscope} section="specialNeeds" colorClass="bg-teal-100 text-teal-600" />
            {expandedSections.specialNeeds && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoItem label={t.hasSpecialNeeds[lang]} value={safeGet(student, 'hasSpecialNeeds', false) ? t.yes[lang] : t.no[lang]} icon={AlertCircle} />
                <InfoItem label={t.specialNeedsType[lang]} value={safeGet(student, 'specialNeedsType', '-')} />
                <InfoItem label={t.conditionDescription[lang]} value={safeGet(student, 'conditionDescription', '-')} fullWidth />
                <InfoItem label={t.requiredAccommodations[lang]} value={safeGet(student, 'accommodations', '-')} fullWidth />
                <InfoItem label={t.chronicIllnesses[lang]} value={safeGet(student, 'chronicIllnesses', '-')} />
                <InfoItem label={t.drugAllergies[lang]} value={safeGet(student, 'drugAllergies', '-')} />
              </div>
            )}
          </div>

          {/* System Accounts */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.systemAccounts[lang]} icon={Laptop} section="systems" colorClass="bg-slate-200 text-slate-600" />
            {expandedSections.systems && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t.sisUsername[lang]}</p>
                      <p className="font-mono font-bold text-slate-800">{safeGet(student, 'studentId', 'STU-2024-001')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        {t.active[lang]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t.lmsUsername[lang]}</p>
                      <p className="font-mono font-bold text-slate-800">{safeGet(student, 'lmsUsername', safeGet(student, 'studentId', 'STU-2024-001'))}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        {t.active[lang]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-blue-600 mb-0.5">{t.lastLogin[lang]}</p>
                      <p className="text-sm font-medium text-blue-800">{safeGet(student, 'lastLogin', '2024-03-15 10:30 AM')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes & Tags */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.notesTags[lang]} icon={Tag} section="notes" colorClass="bg-pink-100 text-pink-600" />
            {expandedSections.notes && (
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">{t.tags[lang]}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {t.excellent[lang]}
                    </span>
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {t.scholarshipStudent[lang]}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-600 uppercase tracking-wide mb-2">{t.admissionNotes[lang]}</p>
                    <p className="text-sm text-slate-700">{safeGet(student, 'admissionNotes', 'No notes available')}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-green-600 uppercase tracking-wide mb-2">{t.studentAffairsNotes[lang]}</p>
                    <p className="text-sm text-slate-700">{safeGet(student, 'studentAffairsNotes', 'No notes available')}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-xs text-purple-600 uppercase tracking-wide mb-2">{t.advisorNotes[lang]}</p>
                    <p className="text-sm text-slate-700">{safeGet(student, 'advisorNotes', 'No notes available')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== ACADEMIC TAB ========== */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          {/* GPA & Status Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <SectionHeader title={t.gpaStatus[lang]} icon={Award} section="gpaStatus" colorClass="bg-emerald-100 text-emerald-600" />
            {expandedSections.gpaStatus && (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <StatCard label={t.totalRequiredCredits[lang]} value={safeGet(student, 'totalRequiredCredits', 130)} color="bg-blue-50 text-blue-700" icon={BookOpen} />
                  <StatCard label={t.earnedCredits[lang]} value={safeGet(student, 'completedCredits', 45)} color="bg-green-50 text-green-700" icon={CheckCircle} />
                  <StatCard label={t.currentCredits[lang]} value={safeGet(student, 'registeredCredits', 15)} color="bg-purple-50 text-purple-700" icon={Play} />
                  <StatCard label={t.remainingCredits[lang]} value={safeGet(student, 'remainingCredits', 70)} color="bg-orange-50 text-orange-700" icon={Target} />
                  <StatCard label={t.cumulativeGpa[lang]} value={Number(safeGet(student, 'gpa', 3.55)).toFixed(2)} color="bg-indigo-50 text-indigo-700" icon={Award} />
                  <StatCard label={t.lastTermGpa[lang]} value={Number(safeGet(student, 'termGpa', 3.70)).toFixed(2)} color="bg-cyan-50 text-cyan-700" icon={TrendingUp} />
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">{t.earnedCredits[lang]}</span>
                    <span className="font-bold text-slate-800">
                      {safeGet(student, 'completedCredits', 45)} / {safeGet(student, 'totalRequiredCredits', 130)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((safeGet(student, 'completedCredits', 45) / safeGet(student, 'totalRequiredCredits', 130)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Academic Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.academicStatus[lang]}</p>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">{t.goodStanding[lang]}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.academicWarnings[lang]}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{safeGet(student, 'academicWarnings', 0)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.cohort[lang]}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{safeGet(student, 'cohort', '2022/2023')}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.firstEnrollmentTerm[lang]}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{safeGet(student, 'firstEnrollmentTerm', 'Fall 2022')}</p>
                  </div>
                </div>

                {/* GPA Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* GPA History Bar Chart */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" />
                      {lang === 'ar' ? 'تاريخ المعدل التراكمي' : 'GPA History'}
                    </h4>
                    <div className="h-48 w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={150}>
                        <BarChart data={gpaHistoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="term" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Bar dataKey="gpa" fill="#6366f1" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'معدل الفصل' : 'Term GPA'} />
                          <Bar dataKey="cumulative" fill="#22c55e" radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'المعدل التراكمي' : 'Cumulative'} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-indigo-500"></span>
                        {lang === 'ar' ? 'معدل الفصل' : 'Term GPA'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-green-500"></span>
                        {lang === 'ar' ? 'المعدل التراكمي' : 'Cumulative'}
                      </span>
                    </div>
                  </div>

                  {/* Credit Distribution Pie Chart */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      {lang === 'ar' ? 'توزيع الساعات' : 'Credit Distribution'}
                    </h4>
                    <div className="h-48 w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={150}>
                        <PieChart>
                          <Pie
                            data={creditDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {creditDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs flex-wrap">
                      {creditDistribution.map((item, index) => (
                        <span key={index} className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></span>
                          {item.name}: {item.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Program & Registration */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.programRegistration[lang]} icon={GraduationCap} section="program" colorClass="bg-indigo-100 text-indigo-600" />
            {expandedSections.program && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                <InfoItem label={t.college[lang]} value={safeGet(student, 'college', 'Faculty of Engineering')} icon={Building} />
                <InfoItem label={t.department[lang]} value={safeGet(student, 'department', 'Computer Engineering')} icon={Briefcase} />
                <InfoItem label={t.program[lang]} value={safeGet(student, 'major', 'Computer Science')} icon={BookOpen} />
                <InfoItem label={t.degree[lang]} value={t.bachelor[lang]} icon={Award} />
                <InfoItem label={t.studyType[lang]} value={t.regular[lang]} icon={Clock} />
                <InfoItem label={t.studyPlanId[lang]} value={safeGet(student, 'studyPlanName', 'CS-2022')} icon={ClipboardList} />
                <InfoItem label={t.academicStatus[lang]} value={<span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">{t.regularStatus[lang]}</span>} />
                <InfoItem label={t.administrativeStatus[lang]} value={<span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">{t.activeStatus[lang]}</span>} />

                {/* Advisor Card */}
                <div className="md:col-span-2 lg:col-span-3 mt-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl text-white">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{t.advisorName[lang]}</p>
                    <p className="font-bold text-lg">{safeGet(student, 'advisor.name', 'Dr. Sarah Smith')}</p>
                    <p className="text-slate-400 text-sm">{safeGet(student, 'advisor.department', 'Computer Science')}</p>
                    <p className="text-slate-300 text-sm mt-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {safeGet(student, 'advisor.email', 'sarah.smith@university.edu')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Registration */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.currentRegistration[lang]} icon={BookMarked} section="currentReg" colorClass="bg-blue-100 text-blue-600" badge={`${displayCurrentCourses.reduce((sum, c) => sum + c.credits, 0)} ${t.credits[lang]}`} />
            {expandedSections.currentReg && (
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <p className="text-xs text-blue-600 mb-0.5">{t.currentTerm[lang]}</p>
                    <p className="font-bold text-blue-700">{safeGet(student, 'currentSemester', '2024/2025 - Sem 1')}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold">{t.registered[lang]}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.courseCode[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.courseName[lang]}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.section[lang]}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.credits[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.instructor[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.schedule[lang]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayCurrentCourses.map((course, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono font-bold">{course.code}</span></td>
                          <td className="py-3 px-4 font-medium text-slate-800">{course.name}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{course.section}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{course.credits}</td>
                          <td className="py-3 px-4 text-slate-600">{course.instructor}</td>
                          <td className="py-3 px-4 text-slate-500 text-sm">{course.schedule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Study Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.studyPlan[lang]} icon={ClipboardList} section="studyPlan" colorClass="bg-violet-100 text-violet-600" badge={`${safeGet(student, 'totalRequiredCredits', 130)} ${t.credits[lang]}`} />
            {expandedSections.studyPlan && (
              <div className="p-6">
                {/* Plan Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-violet-50 dark:bg-violet-900/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-violet-600 dark:text-violet-300 mb-1">{t.totalPlanCredits[lang]}</p>
                    <p className="text-2xl font-bold text-violet-700 dark:text-violet-200">{safeGet(student, 'totalRequiredCredits', 130)}</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-indigo-600 dark:text-indigo-300 mb-1">{t.planLevels[lang]}</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-200">{safeGet(student, 'planLevels', 4)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-green-600 dark:text-green-300 mb-1">{t.completed[lang]}</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-200">{displayStudyPlanCourses.filter(c => c.status === 'completed').length}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-300 mb-1">{t.inProgress[lang]}</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{displayStudyPlanCourses.filter(c => c.status === 'inProgress').length}</p>
                  </div>
                </div>

                {/* Course Legend */}
                <div className="flex flex-wrap gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    {t.completed[lang]}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    {t.inProgress[lang]}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-500"></span>
                    {t.notTaken[lang]}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    {t.exempt[lang]}
                  </span>
                </div>

                {/* Courses Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.courseCode[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.courseName[lang]}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-center">{t.credits[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.courseType[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.prerequisite[lang]}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-center">{t.courseStatus[lang]}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-center">{t.letterGrade[lang]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayStudyPlanCourses.map((course, index) => (
                        <tr key={index} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-sm font-mono font-bold">{course.code}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{course.name}</td>
                          <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">{course.credits}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              course.type === 'mandatory' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                              course.type === 'elective' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                              course.type === 'university' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                              'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                            }`}>
                              {course.type === 'mandatory' ? t.mandatory[lang] :
                               course.type === 'elective' ? t.elective[lang] :
                               course.type === 'university' ? t.universityReq[lang] : t.collegeReq[lang]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-sm">{course.prerequisite || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              course.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                              course.status === 'inProgress' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                              course.status === 'exempt' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                              'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                            }`}>
                              {course.status === 'completed' && <Check className="w-3 h-3" />}
                              {course.status === 'inProgress' && <Play className="w-3 h-3" />}
                              {course.status === 'completed' ? t.completed[lang] :
                               course.status === 'inProgress' ? t.inProgress[lang] :
                               course.status === 'exempt' ? t.exempt[lang] : t.notTaken[lang]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {course.grade && course.grade !== '-' ? (
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                                course.grade.startsWith('A') ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                                course.grade.startsWith('B') ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                                course.grade.startsWith('C') ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                                'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                              }`}>{course.grade}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.attendanceSummary[lang]} icon={UserCheck} section="attendance" colorClass="bg-green-100 text-green-600" />
            {expandedSections.attendance && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayAttendance.map((item, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${item.warning ? 'border-yellow-200 bg-yellow-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-800">{item.course}</span>
                        {item.warning && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {t.warningReached[lang]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500">{t.attendanceRate[lang]}</span>
                            <span className={`font-bold ${item.rate >= 90 ? 'text-green-600' : item.rate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>{item.rate}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className={`h-full rounded-full ${item.rate >= 90 ? 'bg-green-500' : item.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.rate}%` }} />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-800">{item.absences}</p>
                          <p className="text-xs text-slate-500">{t.absences[lang]}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Academic Record */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.academicRecord[lang]} icon={History} section="academicRecord" colorClass="bg-purple-100 text-purple-600" />
            {expandedSections.academicRecord && (
              <div className="p-6">
                {/* Term Example */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800">2023/2024 - {lang === 'ar' ? 'الفصل الأول' : 'Fall Semester'}</h4>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">{t.regularStatus[lang]}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">{t.termGpa[lang]}: <span className="font-bold text-slate-800">3.70</span></span>
                      <span className="text-slate-500">{t.cumulativeGpa[lang]}: <span className="font-bold text-slate-800">3.55</span></span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.courseCode[lang]}</th>
                          <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.courseName[lang]}</th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.credits[lang]}</th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.finalGrade[lang]}</th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">{t.letterGrade[lang]}</th>
                          <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.notes[lang]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayStudyPlanCourses.filter(c => c.status === 'completed').map((course, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono font-bold">{course.code}</span></td>
                            <td className="py-3 px-4 font-medium text-slate-800">{course.name}</td>
                            <td className="py-3 px-4 text-center text-slate-600">{course.credits}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-800">88</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                                course.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                course.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>{course.grade}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Registration History */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.registrationHistory[lang]} icon={History} section="regHistory" colorClass="bg-amber-100 text-amber-600" />
            {expandedSections.regHistory && (
              <div className="p-6">
                {/* Term Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-300 mb-1">{t.initialCredits[lang]}</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">18</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-green-600 dark:text-green-300 mb-1">{t.afterChanges[lang]}</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-200">15</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-orange-600 dark:text-orange-300 mb-1">{t.drop[lang]}</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-200">1</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-purple-600 dark:text-purple-300 mb-1">{t.add[lang]}</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">0</p>
                  </div>
                </div>

                {/* Actions Log */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    {lang === 'ar' ? 'سجل العمليات' : 'Action Log'}
                  </h4>

                  {/* Sample Action Items */}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-red-800 dark:text-red-200">{t.drop[lang]}</p>
                          <p className="text-xs text-red-600 dark:text-red-400">CS301 - {lang === 'ar' ? 'الخوارزميات' : 'Algorithms'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-red-600 dark:text-red-400">2024-02-15</span>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {t.approvedBy[lang]}: Dr. Ahmed Hassan
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-200">{t.sectionChange[lang]}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">CS201: A → B</p>
                        </div>
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400">2024-02-10</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {t.approvedBy[lang]}: System
                    </p>
                  </div>

                  {safeGet(student, 'registrationActions', []).length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      {lang === 'ar' ? 'لا توجد عمليات إضافية مسجلة' : 'No additional actions recorded'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Exams & Assessments */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.examsAssessments[lang]} icon={FileCheck} section="exams" colorClass="bg-rose-100 text-rose-600" />
            {expandedSections.exams && (
              <div className="p-6">
                {/* Course Assessment Details */}
                {displayCurrentCourses.map((course, courseIndex) => (
                  <div key={courseIndex} className={`${courseIndex > 0 ? 'mt-6 pt-6 border-t border-slate-200 dark:border-slate-600' : ''}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-mono font-bold">{course.code}</span>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200">{course.name}</h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                            <th className={`py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.assessmentType[lang]}</th>
                            <th className="py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-center">{t.score[lang]}</th>
                            <th className="py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-center">{t.maxScore[lang]}</th>
                            <th className="py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-center">{t.weight[lang]}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                                <FileText className="w-3 h-3 text-slate-400" />
                                {t.assignment[lang]} 1
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-medium text-green-600 dark:text-green-400">18</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">20</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">5%</td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                                <ClipboardList className="w-3 h-3 text-slate-400" />
                                {t.quiz[lang]} 1
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-medium text-green-600 dark:text-green-400">8</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">10</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">5%</td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                                <Target className="w-3 h-3 text-slate-400" />
                                {t.project[lang]}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-medium text-blue-600 dark:text-blue-400">-</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">20</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">10%</td>
                          </tr>
                          <tr className="border-b border-slate-100 dark:border-slate-700 bg-orange-50/50 dark:bg-orange-900/10">
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center gap-1 text-orange-700 dark:text-orange-300 font-medium">
                                <BookMarked className="w-3 h-3" />
                                {t.midterm[lang]}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-orange-600 dark:text-orange-400">35</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">40</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">30%</td>
                          </tr>
                          <tr className="bg-purple-50/50 dark:bg-purple-900/10">
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300 font-medium">
                                <Award className="w-3 h-3" />
                                {t.final[lang]}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-400 dark:text-slate-500">-</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">50</td>
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">50%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Course Progress */}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'الدرجات المحصلة' : 'Points Earned'}</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">61/100 (61%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: '61%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Advising */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.academicAdvising[lang]} icon={MessageSquare} section="advising" colorClass="bg-sky-100 text-sky-600" />
            {expandedSections.advising && (
              <div className="p-6">
                {/* Current Advisor */}
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                      {safeGet(student, 'advisor.name', 'Dr. Sarah Smith').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{safeGet(student, 'advisor.name', 'Dr. Sarah Smith')}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{safeGet(student, 'advisor.department', 'Computer Science Department')}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <a href={`mailto:${safeGet(student, 'advisor.email', 'sarah.smith@university.edu')}`}
                           className="text-sm text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {safeGet(student, 'advisor.email', 'sarah.smith@university.edu')}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advising Sessions */}
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {lang === 'ar' ? 'جلسات الإرشاد' : 'Advising Sessions'}
                </h4>

                <div className="space-y-4">
                  {/* Session 1 */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                          {t.inPerson[lang]}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{t.meetingDate[lang]}: 2024-02-20</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      <span className="font-medium">{t.meetingSummary[lang]}:</span> {lang === 'ar'
                        ? 'مناقشة الخطة الدراسية للفصل القادم. تم الاتفاق على تسجيل 15 ساعة معتمدة.'
                        : 'Discussed study plan for next semester. Agreed to register 15 credit hours.'}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mt-2">
                      <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-1">{t.recommendations[lang]}:</p>
                      <ul className="text-xs text-blue-700 dark:text-blue-200 list-disc list-inside space-y-0.5">
                        <li>{lang === 'ar' ? 'التركيز على مشروع التخرج' : 'Focus on graduation project'}</li>
                        <li>{lang === 'ar' ? 'عدم تجاوز 15 ساعة معتمدة' : 'Do not exceed 15 credit hours'}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Session 2 */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                          {t.onlineSession[lang]}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{t.meetingDate[lang]}: 2024-01-15</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{t.meetingSummary[lang]}:</span> {lang === 'ar'
                        ? 'مراجعة الأداء الأكاديمي. المعدل التراكمي جيد جداً.'
                        : 'Academic performance review. GPA is very good.'}
                    </p>
                  </div>
                </div>

                {safeGet(student, 'advisingSessions', []).length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 mt-4">
                    {lang === 'ar' ? 'لا توجد جلسات إرشاد مسجلة' : 'No advising sessions recorded'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Graduation Tracking */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.graduationTracking[lang]} icon={GraduationCap} section="graduation" colorClass="bg-cyan-100 text-cyan-600" />
            {expandedSections.graduation && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t.creditsCompleted[lang]}</p>
                      <p className="font-bold text-green-700">{t.yes[lang]} (45/130)</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t.coreCoursesCompleted[lang]}</p>
                      <p className="font-bold text-yellow-700">{t.inProgress[lang]}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <X className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t.electivesCompleted[lang]}</p>
                      <p className="font-bold text-slate-600">{t.no[lang]} (0/6)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h5 className="font-bold text-indigo-800 mb-3">{t.graduationProject[lang]}</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-indigo-600">{t.projectTitle[lang]}:</span>
                        <span className="font-medium text-indigo-800">{safeGet(student, 'projectTitle', '-')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-600">{t.projectSupervisor[lang]}:</span>
                        <span className="font-medium text-indigo-800">{safeGet(student, 'projectSupervisor', '-')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-600">{t.projectStatus[lang]}:</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">{t.notSubmitted[lang]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4">
                    <h5 className="font-bold text-orange-800 mb-3">{t.internship[lang]}</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-orange-600">{t.internshipOrg[lang]}:</span>
                        <span className="font-medium text-orange-800">{safeGet(student, 'internshipOrg', '-')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">{t.internshipDuration[lang]}:</span>
                        <span className="font-medium text-orange-800">{safeGet(student, 'internshipDuration', '-')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">{t.courseStatus[lang]}:</span>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">{t.notTaken[lang]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-100 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-700">{t.graduationRequest[lang]}</span>
                  <span className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold">{t.notSubmitted[lang]}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== FINANCIAL TAB ========== */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.financialSummary[lang]} icon={CreditCard} section="financial" colorClass="bg-amber-100 text-amber-600" />
            {expandedSections.financial && (
              <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard label={t.totalFees[lang]} value={formatCurrency(Number(safeGet(student, 'totalFees', 0)))} color="bg-slate-100 text-slate-700" />
                  <StatCard label={t.amountPaid[lang]} value={formatCurrency(Number(safeGet(student, 'paidAmount', 0)))} color="bg-green-50 text-green-700" />
                  <StatCard
                    label={t.currentBalance[lang]}
                    value={formatCurrency(Number(safeGet(student, 'currentBalance', 0)))}
                    color={safeGet(student, 'currentBalance', 0) < 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}
                  />
                  <StatCard label={t.scholarships[lang]} value={formatCurrency(Number(safeGet(student, 'scholarships', 0)))} color="bg-purple-50 text-purple-700" icon={Award} />
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <span className="text-sm text-slate-600">{t.financialStatus[lang]}</span>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                    safeGet(student, 'financialStatus', 'ON_HOLD') === 'CLEARED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {safeGet(student, 'financialStatus', 'ON_HOLD') === 'CLEARED' ? t.cleared[lang] : t.onHold[lang]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== DOCUMENTS TAB ========== */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <SectionHeader title={t.documentsAttachments[lang]} icon={FolderOpen} section="documents" colorClass="bg-teal-100 text-teal-600" />
            {expandedSections.documents && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-500">{displayDocuments.length} {lang === 'ar' ? 'مستند' : 'documents'}</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {lang === 'ar' ? 'رفع مستند جديد' : 'Upload New Document'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.documentType[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.uploadDate[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.uploadedBy[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-end' : 'text-start'}`}>{t.reviewStatus[lang]}</th>
                        <th className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase ${isRTL ? 'text-start' : 'text-end'}`}>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayDocuments.map((doc) => (
                        <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 rounded-lg">
                                <FileText className="w-4 h-4 text-slate-500" />
                              </div>
                              <span className="font-medium text-slate-700">{doc.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600">{doc.uploadDate}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{doc.uploadedBy === 'student' ? (lang === 'ar' ? 'الطالب' : 'Student') : (lang === 'ar' ? 'موظف' : 'Staff')}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {doc.status === 'approved' ? t.approved[lang] : doc.status === 'rejected' ? t.rejected[lang] : t.pending[lang]}
                            </span>
                          </td>
                          <td className={`py-4 px-4 ${isRTL ? 'text-start' : 'text-end'}`}>
                            <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title={t.view[lang]}>
                                <Eye className="w-4 h-4 text-slate-500" />
                              </button>
                              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title={t.download[lang]} onClick={() => {
                                exportToPDF([{ name: doc.name, type: doc.type, status: doc.status, date: doc.date }], `document-${doc.id}`);
                              }}>
                                <Download className="w-4 h-4 text-slate-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

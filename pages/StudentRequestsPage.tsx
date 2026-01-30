import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronRight, Send, Upload, Trash2, Eye, Filter,
  RefreshCw, Calendar, Building, BookOpen, User,
  GraduationCap, ClipboardList, FileCheck, ArrowRight, Download, Loader2, Search, Users
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { useToast } from '../hooks/useToast';
import { Card, CardHeader, CardBody, StatCard } from '../components/ui/Card';
import Button, { IconButton } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Select, SearchInput, Textarea } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { studentRequestsApi, formDataApi, dynamicFormsApi, studentsAPI } from '../api';
import { DynamicForm } from '../api/dynamicForms';
import DynamicFormRenderer, { validateDynamicForm } from '../components/DynamicFormRenderer';
import { UserRole } from '../types';

interface StudentRequestsPageProps {
  lang: 'en' | 'ar';
  role?: UserRole;
}

// Request Types with Arabic/English names
const REQUEST_TYPES = {
  EXCEPTIONAL_REGISTRATION: {
    name_ar: 'طلب تسجيل استثنائي / متأخر',
    name_en: 'Exceptional/Late Registration',
    icon: BookOpen,
    color: 'blue',
  },
  SEMESTER_POSTPONE: {
    name_ar: 'طلب تأجيل فصل',
    name_en: 'Semester Postponement',
    icon: Calendar,
    color: 'yellow',
  },
  SEMESTER_FREEZE: {
    name_ar: 'طلب تجميد فصل',
    name_en: 'Semester Freeze',
    icon: Clock,
    color: 'orange',
  },
  RE_ENROLLMENT: {
    name_ar: 'إعادة القيد',
    name_en: 'Re-enrollment',
    icon: RefreshCw,
    color: 'green',
  },
  COURSE_EQUIVALENCY: {
    name_ar: 'طلب معادلة مواد',
    name_en: 'Course Equivalency',
    icon: FileCheck,
    color: 'purple',
  },
  EXAM_RETAKE: {
    name_ar: 'طلب إعادة امتحان',
    name_en: 'Exam Retake',
    icon: ClipboardList,
    color: 'indigo',
  },
  GRADE_REVIEW: {
    name_ar: 'طلب مراجعة علامة',
    name_en: 'Grade Review',
    icon: FileText,
    color: 'pink',
  },
  MAJOR_CHANGE: {
    name_ar: 'طلب تغيير تخصص',
    name_en: 'Major Change',
    icon: Building,
    color: 'cyan',
  },
  STUDY_PLAN_EXTENSION: {
    name_ar: 'طلب تمديد فصول دراسية',
    name_en: 'Study Plan Extension',
    icon: GraduationCap,
    color: 'teal',
  },
};

// Approval Roles
const APPROVAL_ROLES: Record<string, { name_ar: string; name_en: string }> = {
  DEPT_HEAD: { name_ar: 'رئيس القسم', name_en: 'Department Head' },
  CURRENT_DEPT_HEAD: { name_ar: 'رئيس القسم الحالي', name_en: 'Current Dept Head' },
  NEW_DEPT_HEAD: { name_ar: 'رئيس القسم الجديد', name_en: 'New Dept Head' },
  DEAN: { name_ar: 'عميد الكلية', name_en: 'College Dean' },
  ACADEMIC_AFFAIRS: { name_ar: 'الشؤون الأكاديمية', name_en: 'Academic Affairs' },
  STUDENT_AFFAIRS: { name_ar: 'شؤون الطلبة', name_en: 'Student Affairs' },
  FINANCE: { name_ar: 'المالية', name_en: 'Finance' },
  ADMISSIONS: { name_ar: 'القبول والتسجيل', name_en: 'Admissions' },
  COURSE_INSTRUCTOR: { name_ar: 'مدرس المساق', name_en: 'Course Instructor' },
};

// Workflows for each request type
const REQUEST_WORKFLOWS: Record<string, string[]> = {
  EXCEPTIONAL_REGISTRATION: ['DEPT_HEAD', 'DEAN'],
  SEMESTER_POSTPONE: ['STUDENT_AFFAIRS', 'DEPT_HEAD', 'FINANCE', 'ACADEMIC_AFFAIRS'],
  SEMESTER_FREEZE: ['STUDENT_AFFAIRS', 'DEPT_HEAD', 'FINANCE', 'ACADEMIC_AFFAIRS'],
  RE_ENROLLMENT: ['ADMISSIONS', 'ACADEMIC_AFFAIRS'],
  COURSE_EQUIVALENCY: ['ACADEMIC_AFFAIRS', 'FINANCE', 'DEAN'],
  EXAM_RETAKE: ['COURSE_INSTRUCTOR', 'STUDENT_AFFAIRS'],
  GRADE_REVIEW: ['COURSE_INSTRUCTOR', 'DEPT_HEAD'],
  MAJOR_CHANGE: ['CURRENT_DEPT_HEAD', 'NEW_DEPT_HEAD', 'ACADEMIC_AFFAIRS', 'STUDENT_AFFAIRS', 'FINANCE'],
  STUDY_PLAN_EXTENSION: ['DEPT_HEAD', 'ACADEMIC_AFFAIRS'],
};

// Attachment Types
const ATTACHMENT_TYPES: Record<string, { name_ar: string; name_en: string }> = {
  INSTRUCTOR_SUPPORT_LETTER: { name_ar: 'كتاب من المدرس', name_en: 'Instructor Support Letter' },
  DEPARTMENT_SUPPORT_LETTER: { name_ar: 'كتاب من القسم', name_en: 'Department Support Letter' },
  PAYMENT_RECEIPT: { name_ar: 'إيصال دفع', name_en: 'Payment Receipt' },
  MEDICAL_REPORT: { name_ar: 'تقرير طبي', name_en: 'Medical Report' },
  OFFICIAL_DOCUMENT: { name_ar: 'وثيقة رسمية', name_en: 'Official Document' },
  TRANSCRIPT: { name_ar: 'كشف درجات معتمد', name_en: 'Transcript' },
  COURSE_DESCRIPTION: { name_ar: 'وصف المساقات', name_en: 'Course Description' },
  OTHER: { name_ar: 'أخرى', name_en: 'Other' },
};

// Postponement Reason Types
const POSTPONEMENT_REASONS = [
  { value: 'MEDICAL', label_ar: 'صحي', label_en: 'Medical' },
  { value: 'SOCIAL', label_ar: 'اجتماعي', label_en: 'Social' },
  { value: 'FINANCIAL', label_ar: 'مالي', label_en: 'Financial' },
  { value: 'MILITARY', label_ar: 'عسكري', label_en: 'Military' },
  { value: 'WORK', label_ar: 'عمل', label_en: 'Work' },
  { value: 'OTHER', label_ar: 'أخرى', label_en: 'Other' },
];

// Exam Types
const EXAM_TYPES = [
  { value: 'QUIZ', label_ar: 'كويز', label_en: 'Quiz' },
  { value: 'FIRST', label_ar: 'أول', label_en: 'First' },
  { value: 'MIDTERM', label_ar: 'نصفي / ميد', label_en: 'Midterm' },
  { value: 'FINAL', label_ar: 'نهائي / فاينال', label_en: 'Final' },
];

// Status Colors and Labels
const STATUS_CONFIG: Record<string, { label_ar: string; label_en: string; variant: string; color: string }> = {
  DRAFT: { label_ar: 'مسودة', label_en: 'Draft', variant: 'secondary', color: 'slate' },
  SUBMITTED: { label_ar: 'مقدم', label_en: 'Submitted', variant: 'info', color: 'blue' },
  UNDER_REVIEW: { label_ar: 'قيد المراجعة', label_en: 'Under Review', variant: 'warning', color: 'yellow' },
  PENDING_DEPT: { label_ar: 'بانتظار القسم', label_en: 'Pending Dept', variant: 'warning', color: 'yellow' },
  PENDING_DEAN: { label_ar: 'بانتظار العميد', label_en: 'Pending Dean', variant: 'warning', color: 'orange' },
  PENDING_ACADEMIC: { label_ar: 'بانتظار الأكاديمية', label_en: 'Pending Academic', variant: 'warning', color: 'amber' },
  PENDING_FINANCE: { label_ar: 'بانتظار المالية', label_en: 'Pending Finance', variant: 'warning', color: 'yellow' },
  PENDING_STUDENT_AFFAIRS: { label_ar: 'بانتظار شؤون الطلبة', label_en: 'Pending Student Affairs', variant: 'warning', color: 'yellow' },
  PENDING_ADMISSIONS: { label_ar: 'بانتظار القبول', label_en: 'Pending Admissions', variant: 'warning', color: 'yellow' },
  APPROVED: { label_ar: 'موافق عليه', label_en: 'Approved', variant: 'success', color: 'green' },
  REJECTED: { label_ar: 'مرفوض', label_en: 'Rejected', variant: 'danger', color: 'red' },
  CANCELLED: { label_ar: 'ملغي', label_en: 'Cancelled', variant: 'secondary', color: 'slate' },
  COMPLETED: { label_ar: 'منجز', label_en: 'Completed', variant: 'success', color: 'emerald' },
};

// Fallback Mock Data (used when API is unavailable)
const fallbackPrograms = [
  { id: 1, name_ar: 'بكالوريوس', name_en: 'Bachelor' },
  { id: 2, name_ar: 'ماجستير', name_en: 'Master' },
  { id: 3, name_ar: 'دكتوراه', name_en: 'PhD' },
];

const fallbackDepartments = [
  { id: 1, name_ar: 'علوم الحاسوب', name_en: 'Computer Science' },
  { id: 2, name_ar: 'هندسة البرمجيات', name_en: 'Software Engineering' },
  { id: 3, name_ar: 'نظم المعلومات', name_en: 'Information Systems' },
  { id: 4, name_ar: 'إدارة الأعمال', name_en: 'Business Administration' },
  { id: 5, name_ar: 'المحاسبة', name_en: 'Accounting' },
];

const fallbackSemesters = [
  { id: 1, name_ar: 'الفصل الأول 2024-2025', name_en: 'First Semester 2024-2025' },
  { id: 2, name_ar: 'الفصل الثاني 2024-2025', name_en: 'Second Semester 2024-2025' },
  { id: 3, name_ar: 'الفصل الصيفي 2025', name_en: 'Summer 2025' },
];

const fallbackCourses = [
  { id: 1, code: 'CS101', name_ar: 'مقدمة في البرمجة', name_en: 'Introduction to Programming' },
  { id: 2, code: 'CS201', name_ar: 'هياكل البيانات', name_en: 'Data Structures' },
  { id: 3, code: 'CS301', name_ar: 'قواعد البيانات', name_en: 'Databases' },
  { id: 4, code: 'MATH101', name_ar: 'رياضيات 1', name_en: 'Mathematics 1' },
];

const StudentRequestsPage: React.FC<StudentRequestsPageProps> = ({ lang, role }) => {
  const toast = useToast();
  const t = TRANSLATIONS;
  const isStaff = role === UserRole.STUDENT_AFFAIRS || role === UserRole.ADMIN;

  const [activeTab, setActiveTab] = useState<'my-requests' | 'new-request'>('my-requests');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedRequestType, setSelectedRequestType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  // Staff-specific state
  const [studentSearch, setStudentSearch] = useState('');
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allRequestsStats, setAllRequestsStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });

  // Form state for new request
  const [formData, setFormData] = useState<any>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  // Data from API
  const [programs, setPrograms] = useState<any[]>(fallbackPrograms);
  const [departments, setDepartments] = useState<any[]>(fallbackDepartments);
  const [semesters, setSemesters] = useState<any[]>(fallbackSemesters);
  const [courses, setCourses] = useState<any[]>(fallbackCourses);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Forms state
  const [dynamicForms, setDynamicForms] = useState<Record<string, DynamicForm>>({});
  const [currentDynamicForm, setCurrentDynamicForm] = useState<DynamicForm | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Map request types to form codes (forms created in FormBuilder)
  const REQUEST_TYPE_TO_FORM_CODE: Record<string, string> = {
    'EXCEPTIONAL_REGISTRATION': 'exceptional_registration',
    'SEMESTER_POSTPONE': 'semester_postpone',
    'SEMESTER_FREEZE': 'semester_freeze',
    'RE_ENROLLMENT': 're_enrollment',
    'COURSE_EQUIVALENCY': 'course_equivalency',
    'EXAM_RETAKE': 'exam_retake',
    'GRADE_REVIEW': 'grade_review',
    'MAJOR_CHANGE': 'major_change',
    'STUDY_PLAN_EXTENSION': 'study_plan_extension',
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch requests
        const requestsData = await studentRequestsApi.getRequests();
        setRequests(Array.isArray(requestsData) ? requestsData : requestsData?.data || []);

        // Fetch form data and dynamic forms in parallel
        const [programsData, departmentsData, semestersData, coursesData, formsData] = await Promise.all([
          formDataApi.getPrograms().catch(() => fallbackPrograms),
          formDataApi.getDepartments().catch(() => fallbackDepartments),
          formDataApi.getSemesters().catch(() => fallbackSemesters),
          formDataApi.getCourses().catch(() => fallbackCourses),
          dynamicFormsApi.getAll('student_requests').catch(() => []),
        ]);

        setPrograms(Array.isArray(programsData) ? programsData : fallbackPrograms);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : fallbackDepartments);
        setSemesters(Array.isArray(semestersData) ? semestersData : fallbackSemesters);
        setCourses(Array.isArray(coursesData) ? coursesData : fallbackCourses);

        // Store dynamic forms by code
        if (Array.isArray(formsData)) {
          const formsMap: Record<string, DynamicForm> = {};
          formsData.forEach((form: DynamicForm) => {
            formsMap[form.code] = form;
          });
          setDynamicForms(formsMap);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        // Use fallback data
        setPrograms(fallbackPrograms);
        setDepartments(fallbackDepartments);
        setSemesters(fallbackSemesters);
        setCourses(fallbackCourses);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedStudent]);

  // Staff action states
  const [actionLoading, setActionLoading] = useState(false);
  const [staffComment, setStaffComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [allRequests, setAllRequests] = useState<any[]>([]);

  // Staff: Fetch all students for search
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!isStaff) return;
      try {
        const studentsRes = await studentsAPI.getAll({ per_page: 100 });
        setStudentList(studentsRes.data || studentsRes || []);

        // Fetch all requests for staff
        const requestsRes = await studentRequestsApi.getAllRequests?.({ per_page: 100 }).catch(() => []) || [];
        const requestsArr = Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || [];
        setAllRequests(requestsArr);
        setAllRequestsStats({
          totalRequests: requestsArr.length,
          pendingRequests: requestsArr.filter((r: any) => !['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(r.status)).length,
          approvedRequests: requestsArr.filter((r: any) => r.status === 'APPROVED' || r.status === 'COMPLETED').length,
          rejectedRequests: requestsArr.filter((r: any) => r.status === 'REJECTED').length,
        });
      } catch (error) {
        // Error fetching staff data
      }
    };
    fetchStaffData();
  }, [isStaff]);

  // Staff: Search students
  useEffect(() => {
    const searchStudents = async () => {
      if (!isStaff || !studentSearch.trim()) return;
      setSearchLoading(true);
      try {
        const res = await studentsAPI.getAll({ search: studentSearch, per_page: 20 });
        setStudentList(res.data || res || []);
      } catch (error) {
        // Error searching students
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [studentSearch, isStaff]);

  // Reset form and load dynamic form when request type changes
  useEffect(() => {
    setFormData({
      reason: '',
    });
    setAttachments([]);
    setFormErrors({});

    // Check if there's a dynamic form for this request type
    if (selectedRequestType) {
      const formCode = REQUEST_TYPE_TO_FORM_CODE[selectedRequestType];
      const dynamicForm = dynamicForms[formCode];
      setCurrentDynamicForm(dynamicForm || null);

      // If dynamic form exists, set default values
      if (dynamicForm) {
        const defaultData: Record<string, any> = {};
        dynamicForm.fields?.forEach((field) => {
          if (field.default_value !== undefined) {
            defaultData[field.field_key] = field.default_value;
          }
        });
        setFormData(defaultData);
      }
    } else {
      setCurrentDynamicForm(null);
    }
  }, [selectedRequestType, dynamicForms]);

  const getStatusLabel = (status: string) => {
    return STATUS_CONFIG[status]?.[lang === 'ar' ? 'label_ar' : 'label_en'] || status;
  };

  const getStatusVariant = (status: string) => {
    return STATUS_CONFIG[status]?.variant || 'secondary';
  };

  const getRequestTypeName = (type: string) => {
    const requestType = REQUEST_TYPES[type as keyof typeof REQUEST_TYPES];
    return requestType ? (lang === 'ar' ? requestType.name_ar : requestType.name_en) : type;
  };

  const getRequestTypeIcon = (type: string) => {
    return REQUEST_TYPES[type as keyof typeof REQUEST_TYPES]?.icon || FileText;
  };

  const getRequestTypeColor = (type: string) => {
    return REQUEST_TYPES[type as keyof typeof REQUEST_TYPES]?.color || 'blue';
  };

  const handleSubmitRequest = async () => {
    // Validate dynamic form if using one
    if (currentDynamicForm) {
      const errors = validateDynamicForm(currentDynamicForm, formData, lang);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Get student ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const studentId = user?.student_id || user?.id;

      // Security check: Don't submit if we don't have a valid student ID
      if (!studentId) {
        setFormErrors({ general: lang === 'ar' ? 'خطأ في جلسة المستخدم. يرجى تسجيل الدخول مرة أخرى.' : 'User session error. Please log in again.' });
        setIsSubmitting(false);
        return;
      }

      // Prepare request data
      const requestData = {
        student_id: studentId,
        request_type: selectedRequestType,
        form_code: currentDynamicForm?.code, // Include form code if using dynamic form
        ...formData,
        submit: true, // Submit immediately
      };

      // Create request via API
      const newRequest = await studentRequestsApi.createRequest(requestData);

      // Upload attachments if any
      if (attachments.length > 0 && newRequest.id) {
        for (const file of attachments) {
          await studentRequestsApi.uploadAttachment(newRequest.id, file, 'OTHER');
        }
      }

      // Refresh requests list
      const updatedRequests = await studentRequestsApi.getRequests();
      setRequests(Array.isArray(updatedRequests) ? updatedRequests : updatedRequests?.data || []);

      setShowNewRequestModal(false);
      setSelectedRequestType('');
      setFormData({});
      setAttachments([]);
    } catch (err: any) {
      // Fallback to local state update for demo
      const newRequest = {
        id: requests.length + 1,
        request_number: `${selectedRequestType.substring(0, 2).toUpperCase()}-2024-${String(requests.length + 1).padStart(5, '0')}`,
        request_type: selectedRequestType,
        status: 'SUBMITTED',
        current_approval_step: 1,
        ...formData,
        created_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        semester: semesters.find(s => s.id === formData.semester_id),
        course: courses.find(c => c.id === formData.course_id),
        approvals: REQUEST_WORKFLOWS[selectedRequestType]?.map((role, idx) => ({
          step_number: idx + 1,
          approver_role: role,
          status: 'PENDING',
        })) || [],
      };
      setRequests([newRequest, ...requests]);
      setShowNewRequestModal(false);
      setSelectedRequestType('');
      setFormData({});
      setAttachments([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await studentRequestsApi.cancelRequest(requestId);
      // Refresh requests list
      const updatedRequests = await studentRequestsApi.getRequests();
      setRequests(Array.isArray(updatedRequests) ? updatedRequests : updatedRequests?.data || []);
    } catch (err) {
      // Fallback to local state update
      setRequests(requests.map(r =>
        r.id === requestId ? { ...r, status: 'CANCELLED' } : r
      ));
    }
    setShowRequestDetailsModal(false);
  };

  // Staff: Approve request
  const handleApproveRequest = async (requestId: number) => {
    if (!isStaff) return;
    setActionLoading(true);
    try {
      await studentRequestsApi.reviewRequest(requestId, {
        decision: 'APPROVED',
        level: 'STUDENT_AFFAIRS',
        notes: staffComment || undefined,
      });

      // Refresh requests
      const requestsRes = await studentRequestsApi.getAllRequests?.({ per_page: 100 }).catch(() => []) || [];
      const requestsArr = Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || [];
      setAllRequests(requestsArr);

      toast.success(lang === 'ar' ? 'تمت الموافقة على الطلب بنجاح!' : 'Request approved successfully!');
      setShowRequestDetailsModal(false);
      setStaffComment('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ أثناء الموافقة' : 'Error approving request'));
    } finally {
      setActionLoading(false);
    }
  };

  // Staff: Reject request
  const handleRejectRequest = async (requestId: number) => {
    if (!isStaff || !rejectionReason.trim()) {
      toast.warning(lang === 'ar' ? 'يرجى إدخال سبب الرفض' : 'Please enter rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await studentRequestsApi.reviewRequest(requestId, {
        decision: 'REJECTED',
        level: 'STUDENT_AFFAIRS',
        notes: rejectionReason,
      });

      // Refresh requests
      const requestsRes = await studentRequestsApi.getAllRequests?.({ per_page: 100 }).catch(() => []) || [];
      const requestsArr = Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || [];
      setAllRequests(requestsArr);

      toast.success(lang === 'ar' ? 'تم رفض الطلب' : 'Request rejected');
      setShowRejectModal(false);
      setShowRequestDetailsModal(false);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ أثناء الرفض' : 'Error rejecting request'));
    } finally {
      setActionLoading(false);
    }
  };

  // Staff: Execute approved request
  const handleExecuteRequest = async (requestId: number) => {
    if (!isStaff) return;
    setActionLoading(true);
    try {
      await studentRequestsApi.executeRequest(requestId, {
        execution_notes: staffComment || undefined,
      });

      // Refresh requests
      const requestsRes = await studentRequestsApi.getAllRequests?.({ per_page: 100 }).catch(() => []) || [];
      const requestsArr = Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || [];
      setAllRequests(requestsArr);

      toast.success(lang === 'ar' ? 'تم تنفيذ الطلب بنجاح!' : 'Request executed successfully!');
      setShowRequestDetailsModal(false);
      setStaffComment('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ أثناء التنفيذ' : 'Error executing request'));
    } finally {
      setActionLoading(false);
    }
  };

  // Staff: Add comment
  const handleAddComment = async (requestId: number) => {
    if (!isStaff || !staffComment.trim()) return;
    setActionLoading(true);
    try {
      await studentRequestsApi.addComment(requestId, {
        comment: staffComment,
        is_internal: false,
      });

      toast.success(lang === 'ar' ? 'تم إضافة التعليق' : 'Comment added');
      setStaffComment('');

      // Refresh request details
      if (selectedRequest) {
        const updated = await studentRequestsApi.getAllRequests?.({ per_page: 100 }).catch(() => []) || [];
        const updatedArr = Array.isArray(updated) ? updated : updated?.data || [];
        const updatedRequest = updatedArr.find((r: any) => r.id === selectedRequest.id);
        if (updatedRequest) {
          setSelectedRequest(updatedRequest);
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'Error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Determine which requests to show based on role
  const displayRequests = isStaff && !selectedStudent ? allRequests : requests;

  const filteredRequests = displayRequests.filter(request => {
    if (selectedStatus !== 'all' && request.status !== selectedStatus) return false;
    if (selectedTypeFilter !== 'all' && request.request_type !== selectedTypeFilter) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const typeName = getRequestTypeName(request.request_type).toLowerCase();
      const studentName = (request.student?.name_en || request.student?.name_ar || '').toLowerCase();
      const studentId = (request.student?.student_id || '').toLowerCase();
      return (
        (request.request_number || '').toLowerCase().includes(searchLower) ||
        typeName.includes(searchLower) ||
        studentName.includes(searchLower) ||
        studentId.includes(searchLower)
      );
    }
    return true;
  });

  const renderRequestTypeSelector = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {Object.entries(REQUEST_TYPES).map(([key, type]) => {
        const Icon = type.icon;
        const isSelected = selectedRequestType === key;
        return (
          <button
            key={key}
            onClick={() => setSelectedRequestType(key)}
            className={`p-4 rounded-xl border-2 text-${lang === 'ar' ? 'right' : 'left'} transition-all ${
              isSelected
                ? `border-${type.color}-500 bg-${type.color}-50`
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isSelected ? `bg-${type.color}-500 text-white` : `bg-${type.color}-100 text-${type.color}-600`
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${isSelected ? `text-${type.color}-700` : 'text-slate-800'}`}>
                  {lang === 'ar' ? type.name_ar : type.name_en}
                </h4>
              </div>
              {isSelected && (
                <CheckCircle className={`w-5 h-5 text-${type.color}-500`} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderFormFields = () => {
    if (!selectedRequestType) return null;

    // Check if there's a dynamic form for this request type
    if (currentDynamicForm) {
      return (
        <div className="space-y-4">
          <DynamicFormRenderer
            form={currentDynamicForm}
            data={formData}
            onChange={setFormData}
            lang={lang}
            errors={formErrors}
          />
          {/* Attachments section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="font-medium text-slate-700 mb-2">
              {lang === 'ar' ? 'المرفقات' : 'Attachments'}
            </h4>
            <p className="text-sm text-slate-500 mb-3">
              {lang === 'ar' ? 'أرفق أي مستندات داعمة للطلب' : 'Attach any supporting documents'}
            </p>
            <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm text-slate-600 bg-white p-2 rounded">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Fallback to hardcoded forms if no dynamic form exists
    switch (selectedRequestType) {
      case 'EXCEPTIONAL_REGISTRATION':
        return (
          <div className="space-y-4">
            <Select
              label={lang === 'ar' ? 'الفصل الدراسي الحالي' : 'Current Semester'}
              options={semesters.map(s => ({ value: s.id.toString(), label: lang === 'ar' ? s.name_ar : s.name_en }))}
              value={formData.semester_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, semester_id: parseInt(e.target.value) })}
              required
            />
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-medium text-blue-800 mb-2">
                {lang === 'ar' ? 'المساقات المطلوب تسجيلها بشكل استثنائي' : 'Courses for Exceptional Registration'}
              </h4>
              <Textarea
                placeholder={lang === 'ar' ? 'أدخل المساقات المطلوب تسجيلها (مساق واحد في كل سطر)' : 'Enter courses to register (one per line)'}
                value={formData.requested_courses || ''}
                onChange={(e) => setFormData({ ...formData, requested_courses: e.target.value })}
                rows={3}
              />
            </div>
            <Textarea
              label={lang === 'ar' ? 'سبب الطلب' : 'Reason'}
              placeholder={lang === 'ar' ? 'اشرح سبب طلب التسجيل الاستثنائي' : 'Explain the reason for exceptional registration'}
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />
            <Select
              label={lang === 'ar' ? 'هل تم دفع الرسوم؟' : 'Fees Paid?'}
              options={[
                { value: 'true', label: lang === 'ar' ? 'نعم' : 'Yes' },
                { value: 'false', label: lang === 'ar' ? 'لا' : 'No' },
              ]}
              value={formData.fees_paid?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, fees_paid: e.target.value === 'true' })}
              required
            />
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-medium text-slate-700 mb-2">
                {lang === 'ar' ? 'المرفقات (اختياري)' : 'Attachments (Optional)'}
              </h4>
              <p className="text-sm text-slate-500 mb-3">
                {lang === 'ar'
                  ? 'كتاب من المدرس أو القسم يدعم الطلب (إن وجد) - إيصال دفع'
                  : 'Instructor or department support letter (if available) - Payment receipt'}
              </p>
              <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
            </div>
          </div>
        );

      case 'SEMESTER_POSTPONE':
      case 'SEMESTER_FREEZE':
        return (
          <div className="space-y-4">
            <Select
              label={lang === 'ar'
                ? (selectedRequestType === 'SEMESTER_POSTPONE' ? 'الفصل المطلوب تأجيله' : 'الفصل المطلوب تجميده')
                : (selectedRequestType === 'SEMESTER_POSTPONE' ? 'Semester to Postpone' : 'Semester to Freeze')}
              options={semesters.map(s => ({ value: s.id.toString(), label: lang === 'ar' ? s.name_ar : s.name_en }))}
              value={formData.semester_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, semester_id: parseInt(e.target.value) })}
              required
            />
            <Input
              label={lang === 'ar' ? 'عدد مرات التأجيل السابقة' : 'Previous Postponements'}
              type="number"
              min={0}
              value={formData.previous_postponements_count || ''}
              onChange={(e) => setFormData({ ...formData, previous_postponements_count: parseInt(e.target.value) })}
              required
            />
            <Select
              label={lang === 'ar' ? 'نوع السبب' : 'Reason Type'}
              options={POSTPONEMENT_REASONS.map(r => ({ value: r.value, label: lang === 'ar' ? r.label_ar : r.label_en }))}
              value={formData.postponement_reason_type || ''}
              onChange={(e) => setFormData({ ...formData, postponement_reason_type: e.target.value })}
              required
            />
            <Textarea
              label={lang === 'ar'
                ? (selectedRequestType === 'SEMESTER_POSTPONE' ? 'سبب التأجيل' : 'سبب التجميد')
                : (selectedRequestType === 'SEMESTER_POSTPONE' ? 'Postponement Reason' : 'Freeze Reason')}
              placeholder={lang === 'ar' ? 'اشرح السبب بالتفصيل' : 'Explain the reason in detail'}
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-medium text-slate-700 mb-2">
                {lang === 'ar' ? 'المرفقات' : 'Attachments'}
              </h4>
              <p className="text-sm text-slate-500 mb-3">
                {lang === 'ar'
                  ? 'تكون حسب نوع الطلب (صحي: إثباتات صحية، اجتماعي: إثباتات إن وجدت)'
                  : 'Based on reason type (Medical: medical proof, Social: proof if available)'}
              </p>
              <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} />
            </div>
          </div>
        );

      case 'RE_ENROLLMENT':
        return (
          <div className="space-y-4">
            <Select
              label={lang === 'ar' ? 'الفصل المطلوب العودة فيه' : 'Return Semester'}
              options={semesters.map(s => ({ value: s.id.toString(), label: lang === 'ar' ? s.name_ar : s.name_en }))}
              value={formData.return_semester_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, return_semester_id: parseInt(e.target.value) })}
              required
            />
            <Input
              label={lang === 'ar' ? 'تاريخ التأجيل / التجميد' : 'Postponement/Freeze Date'}
              type="date"
              value={formData.postponement_date || ''}
              onChange={(e) => setFormData({ ...formData, postponement_date: e.target.value })}
              required
            />
          </div>
        );

      case 'COURSE_EQUIVALENCY':
        return (
          <div className="space-y-4">
            <Input
              label={lang === 'ar' ? 'الجامعة/الجهة التي درس بها سابقًا' : 'Previous Institution'}
              placeholder={lang === 'ar' ? 'أدخل اسم الجامعة أو الجهة' : 'Enter institution name'}
              value={formData.previous_institution || ''}
              onChange={(e) => setFormData({ ...formData, previous_institution: e.target.value })}
              required
            />
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <h4 className="font-medium text-purple-800 mb-2">
                {lang === 'ar' ? 'قائمة المواد المطلوب معادلتها' : 'Courses to Equate'}
              </h4>
              <Textarea
                placeholder={lang === 'ar'
                  ? 'أدخل المواد المطلوب معادلتها (اسم المادة - عدد الساعات - العلامة)'
                  : 'Enter courses to equate (Course name - Credit hours - Grade)'}
                value={formData.courses_to_equate || ''}
                onChange={(e) => setFormData({ ...formData, courses_to_equate: e.target.value })}
                rows={4}
              />
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h4 className="font-medium text-red-800 mb-2">
                {lang === 'ar' ? 'المرفقات المطلوبة (إجباري)' : 'Required Attachments'}
              </h4>
              <ul className="text-sm text-red-700 mb-3 list-disc list-inside">
                <li>{lang === 'ar' ? 'كشف درجات معتمد' : 'Official Transcript'}</li>
                <li>{lang === 'ar' ? 'وصف للمساقات معتمد من الجامعة' : 'Course descriptions from university'}</li>
              </ul>
              <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} required />
            </div>
          </div>
        );

      case 'EXAM_RETAKE':
        return (
          <div className="space-y-4">
            <Select
              label={lang === 'ar' ? 'المساق' : 'Course'}
              options={courses.map(c => ({
                value: c.id.toString(),
                label: `${c.code} - ${lang === 'ar' ? c.name_ar : c.name_en}`
              }))}
              value={formData.course_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
              required
            />
            <Select
              label={lang === 'ar' ? 'نوع الامتحان' : 'Exam Type'}
              options={EXAM_TYPES.filter(e => e.value !== 'QUIZ').map(e => ({ value: e.value, label: lang === 'ar' ? e.label_ar : e.label_en }))}
              value={formData.exam_type || ''}
              onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
              required
            />
            <Textarea
              label={lang === 'ar' ? 'سبب عدم التقديم' : 'Absence Reason'}
              placeholder={lang === 'ar' ? 'اشرح سبب غيابك عن الامتحان' : 'Explain why you missed the exam'}
              value={formData.absence_reason || ''}
              onChange={(e) => setFormData({ ...formData, absence_reason: e.target.value })}
              rows={3}
              required
            />
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h4 className="font-medium text-red-800 mb-2">
                {lang === 'ar' ? 'المرفقات (إجباري)' : 'Attachments (Required)'}
              </h4>
              <p className="text-sm text-red-700 mb-3">
                {lang === 'ar' ? 'إثبات طبي أو رسمي' : 'Medical or official proof'}
              </p>
              <Input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} required />
            </div>
          </div>
        );

      case 'GRADE_REVIEW':
        return (
          <div className="space-y-4">
            <Select
              label={lang === 'ar' ? 'المساق' : 'Course'}
              options={courses.map(c => ({
                value: c.id.toString(),
                label: `${c.code} - ${lang === 'ar' ? c.name_ar : c.name_en}`
              }))}
              value={formData.course_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
              required
            />
            <Select
              label={lang === 'ar' ? 'نوع الامتحان' : 'Exam Type'}
              options={EXAM_TYPES.map(e => ({ value: e.value, label: lang === 'ar' ? e.label_ar : e.label_en }))}
              value={formData.exam_type || ''}
              onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
              required
            />
            <Textarea
              label={lang === 'ar' ? 'سبب الاعتراض' : 'Objection Reason'}
              placeholder={lang === 'ar' ? 'اشرح سبب اعتراضك على العلامة' : 'Explain why you are objecting to the grade'}
              value={formData.objection_reason || ''}
              onChange={(e) => setFormData({ ...formData, objection_reason: e.target.value })}
              rows={4}
              required
            />
          </div>
        );

      case 'MAJOR_CHANGE':
        return (
          <div className="space-y-4">
            <Select
              label={lang === 'ar' ? 'التخصص الحالي' : 'Current Major'}
              options={departments.map(d => ({ value: d.id.toString(), label: lang === 'ar' ? d.name_ar : d.name_en }))}
              value={formData.current_department_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, current_department_id: parseInt(e.target.value) })}
              required
            />
            <Select
              label={lang === 'ar' ? 'التخصص المطلوب' : 'Requested Major'}
              options={departments.map(d => ({ value: d.id.toString(), label: lang === 'ar' ? d.name_ar : d.name_en }))}
              value={formData.requested_department_id?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, requested_department_id: parseInt(e.target.value) })}
              required
            />
            <Textarea
              label={lang === 'ar' ? 'سبب التغيير' : 'Reason for Change'}
              placeholder={lang === 'ar' ? 'اشرح سبب رغبتك في تغيير التخصص' : 'Explain why you want to change major'}
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={lang === 'ar' ? 'عدد الساعات المكتسبة' : 'Earned Credits'}
                type="number"
                min={0}
                value={formData.earned_credits || ''}
                onChange={(e) => setFormData({ ...formData, earned_credits: parseInt(e.target.value) })}
                required
              />
              <Input
                label={lang === 'ar' ? 'المعدل الحالي' : 'Current GPA'}
                type="number"
                step="0.01"
                min={0}
                max={4}
                value={formData.current_gpa || ''}
                onChange={(e) => setFormData({ ...formData, current_gpa: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
        );

      case 'STUDY_PLAN_EXTENSION':
        return (
          <div className="space-y-4">
            <Input
              label={lang === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
              placeholder={lang === 'ar' ? 'مثال: 4 سنوات' : 'Example: 4 years'}
              value={formData.current_study_plan || ''}
              onChange={(e) => setFormData({ ...formData, current_study_plan: e.target.value })}
              required
            />
            <Input
              label={lang === 'ar' ? 'الخطة المطلوبة' : 'Requested Plan'}
              placeholder={lang === 'ar' ? 'مثال: 5 سنوات' : 'Example: 5 years'}
              value={formData.requested_study_plan || ''}
              onChange={(e) => setFormData({ ...formData, requested_study_plan: e.target.value })}
              required
            />
            <Textarea
              label={lang === 'ar' ? 'سبب التغيير' : 'Reason'}
              placeholder={lang === 'ar' ? 'اشرح سبب طلب التمديد' : 'Explain the reason for extension'}
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderWorkflowNote = () => {
    if (!selectedRequestType) return null;

    const workflow = REQUEST_WORKFLOWS[selectedRequestType];
    if (!workflow) return null;

    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {lang === 'ar' ? 'مسار الموافقة' : 'Approval Workflow'}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          {workflow.map((role, idx) => (
            <React.Fragment key={role}>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                {APPROVAL_ROLES[role]?.[lang === 'ar' ? 'name_ar' : 'name_en'] || role}
              </span>
              {idx < workflow.length - 1 && (
                <ArrowRight className="w-4 h-4 text-amber-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderMyRequests = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
        <Button variant="primary" icon={Plus} onClick={() => setShowNewRequestModal(true)} className="w-full sm:w-auto">
          {lang === 'ar' ? 'تقديم طلب' : 'New Request'}
        </Button>
        <SearchInput
          placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth={false}
          className="w-full sm:w-64"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            options={[
              { value: 'all', label: lang === 'ar' ? 'الحالة' : 'Status' },
              ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                value: key,
                label: lang === 'ar' ? config.label_ar : config.label_en,
              })),
            ]}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            fullWidth={false}
            className="flex-1 sm:w-40"
          />
          <Select
            options={[
              { value: 'all', label: lang === 'ar' ? 'النوع' : 'Type' },
              ...Object.entries(REQUEST_TYPES).map(([key, type]) => ({
                value: key,
                label: lang === 'ar' ? type.name_ar : type.name_en,
              })),
            ]}
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            fullWidth={false}
            className="flex-1 sm:w-48"
          />
        </div>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader
          title={lang === 'ar' ? 'طلباتي' : 'My Requests'}
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
        />
        <CardBody noPadding>
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((request) => {
              const Icon = getRequestTypeIcon(request.request_type);
              const color = getRequestTypeColor(request.request_type);
              return (
                <div
                  key={request.id}
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowRequestDetailsModal(true);
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-100 text-${color}-600`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">{request.request_number}</span>
                      <Badge variant={getStatusVariant(request.status) as any}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-slate-800">
                      {getRequestTypeName(request.request_type)}
                    </h4>
                    {/* Student Info for Staff View */}
                    {isStaff && request.student && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-blue-600">
                          {request.student.name_en || request.student.name_ar}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({request.student.student_id})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                      {request.department && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {lang === 'ar' ? request.department.name_ar : request.department.name_en}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-sm text-slate-500 mb-1">
                      {lang === 'ar' ? 'مرحلة الموافقة' : 'Approval Step'}
                    </div>
                    <div className="text-lg font-bold text-slate-700">
                      {request.current_approval_step}/{request.approvals?.length || 0}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              );
            })}
            {filteredRequests.length === 0 && (
              <EmptyState
                type="no-results"
                lang={lang}
                action={{
                  label: lang === 'ar' ? 'إنشاء تقديم طلب' : 'Create New Request',
                  onClick: () => setShowNewRequestModal(true),
                }}
              />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Staff Header Banner */}
      {isStaff && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {lang === 'ar' ? 'إدارة الطلبات الأكاديمية' : 'Academic Requests Management'}
              </h1>
              <p className="text-emerald-100 mt-1 text-sm sm:text-base">
                {lang === 'ar' ? 'معالجة ومتابعة طلبات الطلاب' : 'Process and track student requests'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold">{allRequestsStats.totalRequests}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100">{lang === 'ar' ? 'الطلبات' : 'Total'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-yellow-300">{allRequestsStats.pendingRequests}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-300">{allRequestsStats.approvedRequests}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100">{lang === 'ar' ? 'موافق' : 'Approved'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-red-300">{allRequestsStats.rejectedRequests}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</p>
              </div>
            </div>
          </div>

          {/* Student Search */}
          <div className="mt-4 relative">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <Search className="w-5 h-5 text-emerald-200" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن طالب بالاسم أو الرقم الجامعي...' : 'Search student by name or ID...'}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-emerald-200 outline-none"
              />
              {searchLoading && (
                <div className="w-5 h-5 border-2 border-emerald-200 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {studentSearch && studentList.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto z-50">
                {studentList.map((student: any) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setStudentSearch('');
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {(student.name || student.name_en || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{student.name || student.name_en || student.name_ar}</p>
                      <p className="text-sm text-slate-500">{student.student_id || student.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Student */}
          {selectedStudent && (
            <div className="mt-4 bg-white/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-xl">
                  {(selectedStudent.name || selectedStudent.name_en || 'S').charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{selectedStudent.name || selectedStudent.name_en || selectedStudent.name_ar}</p>
                  <p className="text-sm text-emerald-100">
                    {lang === 'ar' ? 'الرقم الجامعي: ' : 'Student ID: '}{selectedStudent.student_id || selectedStudent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                {lang === 'ar' ? 'مسح' : 'Clear'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header - Student View */}
      {!isStaff && (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ar' ? 'الطلبات الأكاديمية' : 'Academic Requests'}
          </h1>
          <p className="text-slate-500">
            {lang === 'ar' ? 'قدم طلباتك الأكاديمية وتابع حالتها' : 'Submit and track your academic requests'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowNewRequestModal(true)}>
          {lang === 'ar' ? 'تقديم طلب' : 'New Request'}
        </Button>
      </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title={lang === 'ar' ? 'طلبات قيد المعالجة' : 'Pending Requests'}
          value={requests.filter(r => !['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(r.status)).length.toString()}
          icon={Clock}
          iconColor="text-yellow-600 bg-yellow-50"
        />
        <StatCard
          title={lang === 'ar' ? 'طلبات موافق عليها' : 'Approved'}
          value={requests.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED').length.toString()}
          icon={CheckCircle}
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          title={lang === 'ar' ? 'طلبات مرفوضة' : 'Rejected'}
          value={requests.filter(r => r.status === 'REJECTED').length.toString()}
          icon={XCircle}
          iconColor="text-red-600 bg-red-50"
        />
        <StatCard
          title={lang === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}
          value={requests.length.toString()}
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Main Content */}
      {renderMyRequests()}

      {/* New Request Modal */}
      <Modal
        isOpen={showNewRequestModal}
        onClose={() => {
          setShowNewRequestModal(false);
          setSelectedRequestType('');
          setFormData({});
          setAttachments([]);
        }}
        title={lang === 'ar' ? 'إنشاء تقديم طلب' : 'Create New Request'}
        size="xl"
      >
        <div className="space-y-6">
          {!selectedRequestType ? (
            <>
              <p className="text-slate-600">
                {lang === 'ar' ? 'اختر نوع الطلب:' : 'Select request type:'}
              </p>
              {renderRequestTypeSelector()}
            </>
          ) : (
            <>
              {/* Selected Type Header */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                {(() => {
                  const Icon = getRequestTypeIcon(selectedRequestType);
                  const color = getRequestTypeColor(selectedRequestType);
                  return (
                    <>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-100 text-${color}-600`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-800">
                          {getRequestTypeName(selectedRequestType)}
                        </h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequestType('')}
                      >
                        {lang === 'ar' ? 'تغيير' : 'Change'}
                      </Button>
                    </>
                  );
                })()}
              </div>

              {/* Workflow Note */}
              {renderWorkflowNote()}

              {/* Form Fields */}
              {renderFormFields()}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowNewRequestModal(false);
                    setSelectedRequestType('');
                    setFormData({});
                  }}
                >
                  {t.cancel[lang]}
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmitRequest}
                  icon={Send}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? (lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
                    : (lang === 'ar' ? 'تقديم الطلب' : 'Submit Request')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        isOpen={showRequestDetailsModal}
        onClose={() => setShowRequestDetailsModal(false)}
        title={lang === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Request Header */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              {(() => {
                const Icon = getRequestTypeIcon(selectedRequest.request_type);
                const color = getRequestTypeColor(selectedRequest.request_type);
                return (
                  <>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-100 text-${color}-600`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500">{selectedRequest.request_number}</span>
                        <Badge variant={getStatusVariant(selectedRequest.status) as any}>
                          {getStatusLabel(selectedRequest.status)}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {getRequestTypeName(selectedRequest.request_type)}
                      </h3>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Request Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</p>
                <p className="font-medium text-slate-800">
                  {new Date(selectedRequest.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                </p>
              </div>
              {selectedRequest.semester && (
                <div className="p-3 border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">{lang === 'ar' ? 'الفصل' : 'Semester'}</p>
                  <p className="font-medium text-slate-800">
                    {lang === 'ar' ? selectedRequest.semester.name_ar : selectedRequest.semester.name_en}
                  </p>
                </div>
              )}
            </div>

            {/* Reason */}
            {selectedRequest.reason && (
              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="font-medium text-slate-700 mb-2">{lang === 'ar' ? 'السبب' : 'Reason'}</h4>
                <p className="text-slate-600">{selectedRequest.reason}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedRequest.status === 'REJECTED' && selectedRequest.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {lang === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}
                </h4>
                <p className="text-red-700">{selectedRequest.rejection_reason}</p>
              </div>
            )}

            {/* Approval Steps */}
            {selectedRequest.approvals && selectedRequest.approvals.length > 0 && (
              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="font-medium text-slate-700 mb-3">{lang === 'ar' ? 'مراحل الموافقة' : 'Approval Steps'}</h4>
                <div className="space-y-2">
                  {selectedRequest.approvals.map((approval: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        approval.status === 'APPROVED'
                          ? 'bg-green-100 text-green-600'
                          : approval.status === 'REJECTED'
                          ? 'bg-red-100 text-red-600'
                          : approval.status === 'PENDING' && approval.step_number === selectedRequest.current_approval_step
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {approval.status === 'APPROVED' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : approval.status === 'REJECTED' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          approval.step_number
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">
                          {APPROVAL_ROLES[approval.approver_role]?.[lang === 'ar' ? 'name_ar' : 'name_en'] || approval.approver_role}
                        </p>
                      </div>
                      <Badge variant={
                        approval.status === 'APPROVED' ? 'success' :
                        approval.status === 'REJECTED' ? 'danger' :
                        approval.status === 'PENDING' && approval.step_number === selectedRequest.current_approval_step ? 'warning' :
                        'secondary'
                      }>
                        {approval.status === 'APPROVED' ? (lang === 'ar' ? 'تمت الموافقة' : 'Approved') :
                         approval.status === 'REJECTED' ? (lang === 'ar' ? 'مرفوض' : 'Rejected') :
                         approval.status === 'PENDING' ? (lang === 'ar' ? 'بانتظار' : 'Pending') :
                         approval.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Comment Section */}
            {isStaff && !['REJECTED', 'CANCELLED', 'COMPLETED'].includes(selectedRequest.status) && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h4 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {lang === 'ar' ? 'ملاحظات الموظف' : 'Staff Notes'}
                </h4>
                <Textarea
                  placeholder={lang === 'ar' ? 'أدخل ملاحظاتك هنا...' : 'Enter your notes here...'}
                  value={staffComment}
                  onChange={(e) => setStaffComment(e.target.value)}
                  rows={2}
                />
                {staffComment.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleAddComment(selectedRequest.id)}
                    disabled={actionLoading}
                  >
                    {lang === 'ar' ? 'إضافة تعليق' : 'Add Comment'}
                  </Button>
                )}
              </div>
            )}

            {/* Student Info for Staff */}
            {isStaff && selectedRequest.student && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {lang === 'ar' ? 'بيانات الطالب' : 'Student Info'}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-600">{lang === 'ar' ? 'الاسم: ' : 'Name: '}</span>
                    <span className="font-medium">{selectedRequest.student.name_en || selectedRequest.student.name_ar}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">{lang === 'ar' ? 'الرقم الجامعي: ' : 'ID: '}</span>
                    <span className="font-medium">{selectedRequest.student.student_id}</span>
                  </div>
                  {selectedRequest.student.phone && (
                    <div>
                      <span className="text-blue-600">{lang === 'ar' ? 'الهاتف: ' : 'Phone: '}</span>
                      <span className="font-medium">{selectedRequest.student.phone}</span>
                    </div>
                  )}
                  {selectedRequest.student.university_email && (
                    <div>
                      <span className="text-blue-600">{lang === 'ar' ? 'البريد: ' : 'Email: '}</span>
                      <span className="font-medium text-xs">{selectedRequest.student.university_email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              {/* Staff Actions */}
              {isStaff && !['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(selectedRequest.status) && (
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                    icon={CheckCircle}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading ? (lang === 'ar' ? 'جاري...' : 'Processing...') : (lang === 'ar' ? 'موافقة' : 'Approve')}
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setShowRejectModal(true)}
                    icon={XCircle}
                    disabled={actionLoading}
                  >
                    {lang === 'ar' ? 'رفض' : 'Reject'}
                  </Button>
                </div>
              )}

              {/* Execute Approved Request */}
              {isStaff && selectedRequest.status === 'APPROVED' && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleExecuteRequest(selectedRequest.id)}
                  icon={CheckCircle}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {actionLoading ? (lang === 'ar' ? 'جاري التنفيذ...' : 'Executing...') : (lang === 'ar' ? 'تنفيذ الطلب' : 'Execute Request')}
                </Button>
              )}

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setShowRequestDetailsModal(false)}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
                {!isStaff && !['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(selectedRequest.status) && (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => handleCancelRequest(selectedRequest.id)}
                    icon={XCircle}
                  >
                    {lang === 'ar' ? 'إلغاء الطلب' : 'Cancel Request'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title={lang === 'ar' ? 'رفض الطلب' : 'Reject Request'}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">
              {lang === 'ar'
                ? 'سيتم إخطار الطالب بسبب الرفض. يرجى إدخال سبب واضح.'
                : 'The student will be notified with the rejection reason. Please enter a clear reason.'}
            </p>
          </div>
          <Textarea
            label={lang === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}
            placeholder={lang === 'ar' ? 'أدخل سبب رفض الطلب...' : 'Enter rejection reason...'}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            required
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => selectedRequest && handleRejectRequest(selectedRequest.id)}
              disabled={actionLoading || !rejectionReason.trim()}
              icon={XCircle}
            >
              {actionLoading ? (lang === 'ar' ? 'جاري...' : 'Processing...') : (lang === 'ar' ? 'تأكيد الرفض' : 'Confirm Reject')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentRequestsPage;

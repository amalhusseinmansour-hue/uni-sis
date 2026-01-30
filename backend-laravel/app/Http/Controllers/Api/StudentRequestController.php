<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentRequest;
use App\Models\StudentRequestComment;
use App\Models\Semester;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentRequestController extends Controller
{
    /**
     * قائمة طلبات الطالب
     * GET /api/student-requests
     */
    public function index(Request $request): JsonResponse
    {
        $query = StudentRequest::query()
            ->with(['student:id,student_id,name_en,name_ar', 'course:id,code,name_en', 'semester:id,name_en']);

        // Filter by student (for student role)
        if ($request->user()->role === 'STUDENT') {
            $studentId = $request->user()->student?->id;
            $query->where('student_id', $studentId);
        }

        // Filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('request_type')) {
            $query->where('request_type', $request->request_type);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhereHas('student', fn($sq) => $sq->where('name_en', 'like', "%{$search}%")
                        ->orWhere('name_ar', 'like', "%{$search}%")
                        ->orWhere('student_id', 'like', "%{$search}%"));
            });
        }

        // SECURITY: Validate sorting parameters to prevent SQL injection
        $allowedSortFields = ['created_at', 'updated_at', 'status', 'request_type', 'submitted_at'];
        $sortBy = in_array($request->get('sort_by'), $allowedSortFields)
            ? $request->get('sort_by') : 'created_at';
        $sortDir = in_array(strtolower($request->get('sort_dir', 'desc')), ['asc', 'desc'])
            ? $request->get('sort_dir') : 'desc';
        $query->orderBy($sortBy, $sortDir);

        // SECURITY: Limit per_page to prevent DoS
        $perPage = min(max((int)$request->get('per_page', 15), 1), 100);
        $requests = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * عرض تفاصيل طلب
     * GET /api/student-requests/{id}
     */
    public function show(int $id): JsonResponse
    {
        $request = StudentRequest::with([
            'student:id,student_id,name_en,name_ar,phone,university_email',
            'course:id,code,name_en,name_ar',
            'semester:id,name_en,academic_year',
            'advisorReviewer:id,name,email',
            'departmentReviewer:id,name,email',
            'deanReviewer:id,name,email',
            'logs',
            'comments' => fn($q) => $q->orderBy('created_at', 'desc'),
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $request,
        ]);
    }

    /**
     * إنشاء طلب جديد
     * POST /api/student-requests
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|in:REGISTRATION,SEMESTER,ACADEMIC,FINANCIAL,GRADUATION,DOCUMENTS,OTHER',
            'request_type' => 'required|string',
            'request_type_other' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'reason' => 'required|string',
            'request_data' => 'nullable|array',
            'course_id' => 'nullable|exists:courses,id',
            'section' => 'nullable|string|max:10',
            'priority' => 'nullable|in:LOW,NORMAL,HIGH,URGENT',
            'attachments' => 'nullable|array',
            'is_urgent' => 'nullable|boolean',
        ]);

        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Only students can create requests',
            ], 403);
        }

        $currentSemester = Semester::where('is_current', true)->first();

        DB::beginTransaction();
        try {
            $studentRequest = StudentRequest::create([
                'student_id' => $student->id,
                'semester_id' => $currentSemester?->id,
                'request_date' => now()->toDateString(),
                'category' => $validated['category'],
                'request_type' => $validated['request_type'],
                'request_type_other' => $validated['request_type_other'] ?? null,
                'description' => $validated['description'] ?? null,
                'reason' => $validated['reason'],
                'request_data' => $validated['request_data'] ?? null,
                'course_id' => $validated['course_id'] ?? null,
                'section' => $validated['section'] ?? null,
                'status' => 'SUBMITTED',
                'priority' => $validated['priority'] ?? 'NORMAL',
                'attachments' => $validated['attachments'] ?? null,
                'is_urgent' => $validated['is_urgent'] ?? false,
            ]);

            // Log creation
            $studentRequest->logAction(
                $user->id,
                'SUBMITTED',
                null,
                'SUBMITTED',
                'Request submitted by student'
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Request submitted successfully',
                'data' => $studentRequest->load(['student', 'course', 'semester']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * تحديث طلب
     * PUT /api/student-requests/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $studentRequest = StudentRequest::findOrFail($id);

        // Check if can be edited
        if (!$studentRequest->canBeEdited()) {
            return response()->json([
                'success' => false,
                'message' => 'This request cannot be edited',
            ], 403);
        }

        $validated = $request->validate([
            'description' => 'nullable|string',
            'reason' => 'sometimes|string',
            'request_data' => 'nullable|array',
            'attachments' => 'nullable|array',
        ]);

        $studentRequest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Request updated successfully',
            'data' => $studentRequest,
        ]);
    }

    /**
     * إلغاء طلب
     * POST /api/student-requests/{id}/cancel
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $studentRequest = StudentRequest::findOrFail($id);

        if (!$studentRequest->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'This request cannot be cancelled',
            ], 403);
        }

        $oldStatus = $studentRequest->status;
        $studentRequest->update(['status' => 'CANCELLED']);

        $studentRequest->logAction(
            Auth::id(),
            'CANCELLED',
            $oldStatus,
            'CANCELLED',
            $request->input('reason', 'Cancelled by user')
        );

        return response()->json([
            'success' => true,
            'message' => 'Request cancelled successfully',
        ]);
    }

    /**
     * مراجعة الطلب (للموظفين)
     * POST /api/student-requests/{id}/review
     */
    public function review(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'decision' => 'required|in:APPROVED,REJECTED,FORWARDED',
            'level' => 'required|in:ADVISOR,DEPARTMENT,DEAN,STUDENT_AFFAIRS,FINANCE,ACADEMIC_AFFAIRS',
            'notes' => 'nullable|string',
        ]);

        $studentRequest = StudentRequest::findOrFail($id);
        $user = Auth::user();
        $oldStatus = $studentRequest->status;

        $updateData = [];
        $newStatus = $studentRequest->status;

        switch ($validated['level']) {
            case 'ADVISOR':
                $updateData = [
                    'advisor_reviewed_by' => $user->id,
                    'advisor_reviewed_at' => now(),
                    'advisor_decision' => $validated['decision'],
                    'advisor_notes' => $validated['notes'],
                ];
                if ($validated['decision'] === 'REJECTED') {
                    $newStatus = 'REJECTED';
                    $updateData['rejection_reason'] = $validated['notes'];
                } elseif ($validated['decision'] === 'FORWARDED') {
                    $newStatus = 'PENDING_APPROVAL';
                } else {
                    $newStatus = 'APPROVED';
                }
                break;

            case 'DEPARTMENT':
                $updateData = [
                    'department_reviewed_by' => $user->id,
                    'department_reviewed_at' => now(),
                    'department_decision' => $validated['decision'],
                    'department_notes' => $validated['notes'],
                ];
                if ($validated['decision'] === 'REJECTED') {
                    $newStatus = 'REJECTED';
                    $updateData['rejection_reason'] = $validated['notes'];
                } elseif ($validated['decision'] === 'FORWARDED') {
                    $newStatus = 'PENDING_APPROVAL';
                } else {
                    $newStatus = 'APPROVED';
                }
                break;

            case 'DEAN':
                $updateData = [
                    'dean_reviewed_by' => $user->id,
                    'dean_reviewed_at' => now(),
                    'dean_decision' => $validated['decision'],
                    'dean_notes' => $validated['notes'],
                    'final_decision_by' => $user->id,
                    'final_decision_at' => now(),
                ];
                $newStatus = $validated['decision'] === 'APPROVED' ? 'APPROVED' : 'REJECTED';
                if ($validated['decision'] === 'REJECTED') {
                    $updateData['rejection_reason'] = $validated['notes'];
                }
                break;

            case 'STUDENT_AFFAIRS':
            case 'FINANCE':
            case 'ACADEMIC_AFFAIRS':
                $updateData = [
                    'department_reviewed_by' => $user->id,
                    'department_reviewed_at' => now(),
                    'department_decision' => $validated['decision'],
                    'department_notes' => $validated['notes'],
                    'final_decision_by' => $user->id,
                    'final_decision_at' => now(),
                ];
                $newStatus = $validated['decision'] === 'APPROVED' ? 'APPROVED' : 'REJECTED';
                if ($validated['decision'] === 'REJECTED') {
                    $updateData['rejection_reason'] = $validated['notes'];
                }
                break;
        }

        $updateData['status'] = $newStatus;
        $studentRequest->update($updateData);

        $studentRequest->logAction(
            $user->id,
            strtoupper($validated['level']) . '_REVIEW',
            $oldStatus,
            $newStatus,
            $validated['notes']
        );

        // Send notification to student
        $student = $studentRequest->student;
        if ($student && $student->user) {
            NotificationService::notifyServiceRequestStatus(
                $student->user,
                $studentRequest->request_type,
                $newStatus
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Request reviewed successfully',
            'data' => $studentRequest->fresh(),
        ]);
    }

    /**
     * تنفيذ الطلب
     * POST /api/student-requests/{id}/execute
     */
    public function execute(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'execution_notes' => 'nullable|string',
            'execution_result' => 'nullable|array',
        ]);

        $studentRequest = StudentRequest::findOrFail($id);

        if ($studentRequest->status !== 'APPROVED') {
            return response()->json([
                'success' => false,
                'message' => 'Only approved requests can be executed',
            ], 403);
        }

        $oldStatus = $studentRequest->status;

        $studentRequest->update([
            'status' => 'COMPLETED',
            'executed_by' => Auth::id(),
            'executed_at' => now(),
            'execution_notes' => $validated['execution_notes'] ?? null,
            'execution_result' => $validated['execution_result'] ?? null,
        ]);

        $studentRequest->logAction(
            Auth::id(),
            'EXECUTED',
            $oldStatus,
            'COMPLETED',
            $validated['execution_notes'] ?? 'Request executed'
        );

        // Send notification to student
        $student = $studentRequest->student;
        if ($student && $student->user) {
            NotificationService::notifyServiceRequestStatus(
                $student->user,
                $studentRequest->request_type,
                'COMPLETED'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Request executed successfully',
            'data' => $studentRequest->fresh(),
        ]);
    }

    /**
     * إضافة تعليق
     * POST /api/student-requests/{id}/comments
     */
    public function addComment(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'comment' => 'required|string',
            'is_internal' => 'nullable|boolean',
            'attachments' => 'nullable|array',
        ]);

        $studentRequest = StudentRequest::findOrFail($id);
        $user = Auth::user();

        $comment = $studentRequest->addComment(
            $user->id,
            $validated['comment'],
            $validated['is_internal'] ?? false,
            $validated['attachments'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'data' => $comment->load('user:id,name,email'),
        ]);
    }

    /**
     * إحصائيات الطلبات
     * GET /api/student-requests/statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $semesterId = $request->query('semester_id') ?? Semester::where('is_current', true)->value('id');

        $stats = [
            'total' => StudentRequest::where('semester_id', $semesterId)->count(),
            'by_status' => StudentRequest::where('semester_id', $semesterId)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
            'by_category' => StudentRequest::where('semester_id', $semesterId)
                ->select('category', DB::raw('count(*) as count'))
                ->groupBy('category')
                ->pluck('count', 'category'),
            'by_type' => StudentRequest::where('semester_id', $semesterId)
                ->select('request_type', DB::raw('count(*) as count'))
                ->groupBy('request_type')
                ->orderByDesc('count')
                ->limit(10)
                ->pluck('count', 'request_type'),
            'pending_count' => StudentRequest::where('semester_id', $semesterId)->pending()->count(),
            'urgent_count' => StudentRequest::where('semester_id', $semesterId)->urgent()->count(),
            'overdue_count' => StudentRequest::where('semester_id', $semesterId)->overdue()->count(),
            'average_processing_days' => round(StudentRequest::where('semester_id', $semesterId)
                ->whereNotNull('final_decision_at')
                ->avg('days_pending'), 1),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * أنواع الطلبات المتاحة
     * GET /api/student-requests/types
     */
    public function getRequestTypes(): JsonResponse
    {
        $types = [
            'REGISTRATION' => [
                ['type' => 'SECTION_CHANGE', 'label_en' => 'Section Change', 'label_ar' => 'تغيير شعبة'],
                ['type' => 'LATE_REGISTRATION', 'label_en' => 'Late Registration', 'label_ar' => 'تسجيل متأخر'],
                ['type' => 'EXCEPTIONAL_REGISTRATION', 'label_en' => 'Exceptional Registration', 'label_ar' => 'تسجيل استثنائي'],
                ['type' => 'OVERLOAD_REQUEST', 'label_en' => 'Course Overload', 'label_ar' => 'زيادة ساعات'],
                ['type' => 'UNDERLOAD_REQUEST', 'label_en' => 'Course Underload', 'label_ar' => 'تخفيض ساعات'],
            ],
            'SEMESTER' => [
                ['type' => 'SEMESTER_POSTPONE', 'label_en' => 'Semester Postpone', 'label_ar' => 'تأجيل فصل'],
                ['type' => 'SEMESTER_WITHDRAWAL', 'label_en' => 'Semester Withdrawal', 'label_ar' => 'انسحاب من فصل'],
                ['type' => 'STUDY_FREEZE', 'label_en' => 'Study Freeze', 'label_ar' => 'تجميد دراسة'],
                ['type' => 'RE_ENROLLMENT', 'label_en' => 'Re-enrollment', 'label_ar' => 'إعادة قيد'],
            ],
            'ACADEMIC' => [
                ['type' => 'COURSE_EQUIVALENCY', 'label_en' => 'Course Equivalency', 'label_ar' => 'معادلة مواد'],
                ['type' => 'EXAM_RETAKE', 'label_en' => 'Exam Retake', 'label_ar' => 'إعادة امتحان'],
                ['type' => 'GRADE_REVIEW', 'label_en' => 'Grade Review', 'label_ar' => 'مراجعة علامة'],
                ['type' => 'GRADE_APPEAL', 'label_en' => 'Grade Appeal', 'label_ar' => 'استئناف درجة'],
                ['type' => 'GRADUATION_PROJECT', 'label_en' => 'Graduation Project', 'label_ar' => 'مشروع تخرج'],
                ['type' => 'MAJOR_CHANGE', 'label_en' => 'Major Change', 'label_ar' => 'تغيير تخصص'],
                ['type' => 'STUDY_PLAN_CHANGE', 'label_en' => 'Study Plan Change', 'label_ar' => 'تغيير خطة'],
                ['type' => 'COURSE_WITHDRAWAL', 'label_en' => 'Course Withdrawal', 'label_ar' => 'انسحاب من مادة'],
                ['type' => 'ACADEMIC_EXCUSE', 'label_en' => 'Academic Excuse', 'label_ar' => 'عذر أكاديمي'],
            ],
            'FINANCIAL' => [
                ['type' => 'FEE_INSTALLMENT', 'label_en' => 'Fee Installment', 'label_ar' => 'تقسيط رسوم'],
                ['type' => 'SCHOLARSHIP_REQUEST', 'label_en' => 'Scholarship Request', 'label_ar' => 'طلب منحة'],
                ['type' => 'DISCOUNT_REQUEST', 'label_en' => 'Discount Request', 'label_ar' => 'طلب خصم'],
                ['type' => 'FINANCIAL_STATEMENT', 'label_en' => 'Financial Statement', 'label_ar' => 'كشف حساب'],
                ['type' => 'REFUND_REQUEST', 'label_en' => 'Refund Request', 'label_ar' => 'طلب استرداد'],
            ],
            'GRADUATION' => [
                ['type' => 'GRADUATION_APPLICATION', 'label_en' => 'Graduation Application', 'label_ar' => 'طلب تخرج'],
                ['type' => 'CREDIT_CALCULATION', 'label_en' => 'Credit Calculation', 'label_ar' => 'احتساب ساعات'],
                ['type' => 'GRADUATION_CERTIFICATE', 'label_en' => 'Graduation Certificate', 'label_ar' => 'شهادة تخرج'],
                ['type' => 'WHOM_IT_MAY_CONCERN', 'label_en' => 'To Whom It May Concern', 'label_ar' => 'لمن يهمه الأمر'],
            ],
            'DOCUMENTS' => [
                ['type' => 'OFFICIAL_TRANSCRIPT', 'label_en' => 'Official Transcript', 'label_ar' => 'كشف درجات رسمي'],
                ['type' => 'ENROLLMENT_CERTIFICATE', 'label_en' => 'Enrollment Certificate', 'label_ar' => 'شهادة قيد'],
                ['type' => 'STUDENT_ID_CARD', 'label_en' => 'Student ID Card', 'label_ar' => 'بطاقة طالب'],
                ['type' => 'CERTIFIED_COPY', 'label_en' => 'Certified Copy', 'label_ar' => 'صورة طبق الأصل'],
                ['type' => 'RECOMMENDATION_LETTER', 'label_en' => 'Recommendation Letter', 'label_ar' => 'خطاب توصية'],
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }
}

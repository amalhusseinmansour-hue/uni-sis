<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdmissionApplication;
use App\Services\AdmissionWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdmissionApplicationController extends Controller
{
    public function __construct(
        protected AdmissionWorkflowService $workflowService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = AdmissionApplication::with(['program', 'reviewedBy', 'approvedBy', 'payments']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        // فلتر للطلبات التي تحتاج إجراء
        if ($request->boolean('awaiting_action')) {
            $query->awaitingAction();
        }

        $applications = $query->latest()->paginate($request->get('per_page', 15));
        return response()->json($applications);
    }

    public function show(AdmissionApplication $admissionApplication): JsonResponse
    {
        return response()->json(
            $admissionApplication->load(['program', 'reviewedBy', 'approvedBy', 'payments', 'workflowLogs'])
        );
    }

    /**
     * الخطوة 1: تقديم طلب جديد من موقع الجامعة (زر الالتحاق)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:MALE,FEMALE',
            'nationality' => 'required|string|max:100',
            'national_id' => 'required|string|max:50',
            'address' => 'required|string',
            'high_school_name' => 'required|string|max:255',
            'high_school_score' => 'required|numeric|min:0|max:100',
            'high_school_year' => 'required|integer|min:2000|max:' . date('Y'),
            'documents' => 'nullable|array',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        try {
            // استخدام الـ workflow service لتقديم الطلب وإرسال الإيميل
            $application = $this->workflowService->submitApplication($validated);

            return response()->json([
                'success' => true,
                'message' => 'تم تقديم طلبك بنجاح. سيصلك إيميل تأكيد قريباً.',
                'data' => $application->load('program'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تقديم الطلب: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'sometimes|exists:programs,id',
            'full_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:20',
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|in:MALE,FEMALE',
            'nationality' => 'sometimes|string|max:100',
            'national_id' => 'sometimes|string|max:50',
            'address' => 'sometimes|string',
            'high_school_name' => 'sometimes|string|max:255',
            'high_school_score' => 'sometimes|numeric|min:0|max:100',
            'high_school_year' => 'sometimes|integer|min:2000|max:' . date('Y'),
            'documents' => 'nullable|array',
            'reviewer_notes' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $admissionApplication->update($validated);
        return response()->json($admissionApplication);
    }

    public function destroy(AdmissionApplication $admissionApplication): JsonResponse
    {
        $admissionApplication->delete();
        return response()->json(null, 204);
    }

    /**
     * الخطوة 2: بدء المراجعة من قسم القبول والتسجيل
     */
    public function startReview(AdmissionApplication $admissionApplication): JsonResponse
    {
        try {
            $application = $this->workflowService->startReview(
                $admissionApplication,
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'تم بدء مراجعة الطلب',
                'data' => $application,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * الخطوة 3: التحقق من المستندات
     */
    public function verifyDocuments(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        try {
            $application = $this->workflowService->verifyDocuments(
                $admissionApplication,
                auth()->id(),
                $validated['notes'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'تم التحقق من المستندات بنجاح',
                'data' => $application,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * الخطوة 4: طلب دفع الرسوم (إحالة للقسم المالي)
     */
    public function requestPayment(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $validated = $request->validate([
            'registration_fee' => 'required|numeric|min:0',
        ]);

        try {
            $application = $this->workflowService->requestPayment(
                $admissionApplication,
                $validated['registration_fee'],
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال طلب الدفع للطالب',
                'data' => $application,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * الخطوة 5: تسجيل دفع الرسوم (من القسم المالي)
     */
    public function recordPayment(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:BANK_TRANSFER,CREDIT_CARD,CASH,ONLINE',
            'bank_name' => 'nullable|string|max:255',
            'receipt_number' => 'nullable|string|max:255',
            'receipt_path' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $payment = $this->workflowService->recordPayment(
                $admissionApplication,
                $validated['amount'],
                $validated['payment_method'],
                auth()->id(),
                [
                    'bank_name' => $validated['bank_name'] ?? null,
                    'receipt_number' => $validated['receipt_number'] ?? null,
                    'receipt_path' => $validated['receipt_path'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الدفع بنجاح. تم إشعار قسم القبول والتسجيل.',
                'data' => [
                    'payment' => $payment,
                    'application' => $admissionApplication->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * الخطوة 6: الموافقة النهائية (إنشاء الرقم الجامعي + خطاب القبول + بطاقة الجامعة)
     */
    public function approve(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        try {
            $result = $this->workflowService->approveApplication(
                $admissionApplication,
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'تمت الموافقة على الطلب بنجاح. تم إنشاء حساب الطالب وإرسال بيانات الدخول.',
                'data' => [
                    'application' => $result['application'],
                    'student_id' => $result['application']->student_id,
                    'documents' => $result['documents'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * رفض الطلب
     */
    public function reject(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $validated = $request->validate([
            'reviewer_notes' => 'required|string',
        ]);

        try {
            $application = $this->workflowService->rejectApplication(
                $admissionApplication,
                auth()->id(),
                $validated['reviewer_notes']
            );

            return response()->json([
                'success' => true,
                'message' => 'تم رفض الطلب',
                'data' => $application,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * إضافة لقائمة الانتظار
     */
    public function waitlist(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $validated = $request->validate([
            'reviewer_notes' => 'nullable|string',
        ]);

        try {
            $application = $this->workflowService->waitlistApplication(
                $admissionApplication,
                auth()->id(),
                $validated['reviewer_notes'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة الطلب لقائمة الانتظار',
                'data' => $application,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * الحصول على سجل workflow الطلب
     */
    public function workflowLogs(AdmissionApplication $admissionApplication): JsonResponse
    {
        $logs = $admissionApplication->workflowLogs()
            ->with('performedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }

    /**
     * إحصائيات طلبات القبول مع workflow
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->workflowService->getWorkflowStatistics();
        return response()->json($stats);
    }
}

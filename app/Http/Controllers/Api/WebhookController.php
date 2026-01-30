<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdmissionWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WebhookController extends Controller
{
    protected AdmissionWorkflowService $workflowService;

    public function __construct(AdmissionWorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    /**
     * Webhook لاستقبال طلبات القبول من WordPress
     *
     * يُستخدم هذا الـ endpoint لربط نموذج الالتحاق في موقع WordPress
     * مع نظام إدارة الطلاب
     *
     * POST /api/webhook/admission
     */
    public function admissionApplication(Request $request): JsonResponse
    {
        // التحقق من مفتاح الـ API
        $apiKey = $request->header('X-API-Key') ?? $request->header('Authorization');
        if (!$this->validateApiKey($apiKey)) {
            Log::warning('Webhook: Invalid API key attempt', [
                'ip' => $request->ip(),
                'headers' => $request->headers->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // التحقق من البيانات
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'full_name_ar' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'national_id' => 'required|string|max:20|unique:admission_applications,national_id',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female',
            'nationality' => 'required|string|max:100',
            'country' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'program_id' => 'required|exists:programs,id',
            'program_code' => 'nullable|string', // بديل للـ program_id
            'high_school_name' => 'nullable|string|max:255',
            'high_school_score' => 'nullable|numeric|min:0|max:100',
            'high_school_year' => 'nullable|string|max:10',
            'degree_type' => 'nullable|string|in:BACHELOR,MASTER,PHD',
            'previous_university' => 'nullable|string|max:255',
            'previous_degree' => 'nullable|string|max:255',
            'previous_gpa' => 'nullable|numeric|min:0|max:4',
            'documents' => 'nullable|array',
            'source' => 'nullable|string|max:100',
            'utm_source' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
        ], [
            'national_id.unique' => 'يوجد طلب سابق بنفس رقم الهوية',
            'program_id.exists' => 'البرنامج المحدد غير موجود',
        ]);

        if ($validator->fails()) {
            Log::info('Webhook: Validation failed', [
                'errors' => $validator->errors()->toArray(),
                'data' => $request->except(['documents']),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // إذا تم إرسال program_code بدلاً من program_id
            $programId = $request->program_id;
            if (!$programId && $request->program_code) {
                $program = \App\Models\Program::where('code', $request->program_code)->first();
                if ($program) {
                    $programId = $program->id;
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Program not found',
                        'errors' => ['program_code' => ['البرنامج المحدد غير موجود']],
                    ], 422);
                }
            }

            // تجهيز البيانات
            $applicationData = [
                'full_name' => $request->full_name,
                'full_name_ar' => $request->full_name_ar ?? $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'national_id' => $request->national_id,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'nationality' => $request->nationality,
                'country' => $request->country,
                'city' => $request->city,
                'address' => $request->address,
                'program_id' => $programId,
                'high_school_name' => $request->high_school_name,
                'high_school_score' => $request->high_school_score,
                'high_school_year' => $request->high_school_year,
                'degree_type' => $request->degree_type ?? 'BACHELOR',
                'previous_university' => $request->previous_university,
                'previous_degree' => $request->previous_degree,
                'previous_gpa' => $request->previous_gpa,
                'source' => $request->source ?? 'wordpress',
                'metadata' => [
                    'utm_source' => $request->utm_source,
                    'utm_campaign' => $request->utm_campaign,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'submitted_at' => now()->toIso8601String(),
                ],
            ];

            // إنشاء الطلب
            $application = $this->workflowService->submitApplication($applicationData);

            Log::info('Webhook: Application submitted successfully', [
                'application_id' => $application->id,
                'email' => $application->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم استلام طلبك بنجاح. سيتم التواصل معك قريباً.',
                'message_en' => 'Your application has been received successfully. We will contact you soon.',
                'data' => [
                    'application_id' => $application->id,
                    'reference_number' => 'APP-' . str_pad($application->id, 6, '0', STR_PAD_LEFT),
                    'status' => $application->status,
                    'submitted_at' => $application->created_at->toIso8601String(),
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Webhook: Application submission failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->except(['documents']),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء معالجة الطلب',
                'message_en' => 'An error occurred while processing the application',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * الحصول على قائمة البرامج المتاحة
     *
     * GET /api/webhook/programs
     */
    public function getPrograms(Request $request): JsonResponse
    {
        $apiKey = $request->header('X-API-Key') ?? $request->header('Authorization');
        if (!$this->validateApiKey($apiKey)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $programs = \App\Models\Program::where('is_active', true)
            ->with('department:id,name_en,name_ar')
            ->select('id', 'code', 'name_en', 'name_ar', 'degree_type', 'department_id', 'duration_years')
            ->orderBy('name_en')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }

    /**
     * التحقق من حالة طلب القبول
     *
     * GET /api/webhook/admission/status/{reference}
     */
    public function checkStatus(Request $request, string $reference): JsonResponse
    {
        $apiKey = $request->header('X-API-Key') ?? $request->header('Authorization');
        if (!$this->validateApiKey($apiKey)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // استخراج الـ ID من الرقم المرجعي
        $id = (int) ltrim(str_replace('APP-', '', $reference), '0');

        $application = \App\Models\AdmissionApplication::find($id);

        if (!$application) {
            // محاولة البحث بالبريد الإلكتروني أو رقم الهوية
            $application = \App\Models\AdmissionApplication::where('email', $reference)
                ->orWhere('national_id', $reference)
                ->latest()
                ->first();
        }

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        $statusLabels = [
            'PENDING' => ['en' => 'Pending Review', 'ar' => 'قيد الانتظار'],
            'UNDER_REVIEW' => ['en' => 'Under Review', 'ar' => 'قيد المراجعة'],
            'DOCUMENTS_VERIFIED' => ['en' => 'Documents Verified', 'ar' => 'تم التحقق من المستندات'],
            'PENDING_PAYMENT' => ['en' => 'Pending Payment', 'ar' => 'في انتظار الدفع'],
            'PAYMENT_RECEIVED' => ['en' => 'Payment Received', 'ar' => 'تم استلام الدفع'],
            'APPROVED' => ['en' => 'Approved', 'ar' => 'تم القبول'],
            'REJECTED' => ['en' => 'Rejected', 'ar' => 'مرفوض'],
            'WAITLISTED' => ['en' => 'Waitlisted', 'ar' => 'في قائمة الانتظار'],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'reference_number' => 'APP-' . str_pad($application->id, 6, '0', STR_PAD_LEFT),
                'applicant_name' => $application->full_name,
                'status' => $application->status,
                'status_label' => $statusLabels[$application->status] ?? ['en' => $application->status, 'ar' => $application->status],
                'program' => $application->program?->name_en,
                'submitted_at' => $application->created_at->toIso8601String(),
                'last_updated' => $application->updated_at->toIso8601String(),
                'student_id' => $application->student_id, // فقط إذا تم القبول
            ],
        ]);
    }

    /**
     * التحقق من مفتاح API
     */
    protected function validateApiKey(?string $apiKey): bool
    {
        if (!$apiKey) {
            return false;
        }

        // إزالة "Bearer " إذا كان موجوداً
        $apiKey = str_replace('Bearer ', '', $apiKey);

        // مفتاح API المخزن في .env
        $validKey = config('services.webhook.api_key');

        // إذا لم يتم تعيين مفتاح، السماح في بيئة التطوير فقط
        if (!$validKey && config('app.env') === 'local') {
            return true;
        }

        return hash_equals($validKey ?? '', $apiKey);
    }
}

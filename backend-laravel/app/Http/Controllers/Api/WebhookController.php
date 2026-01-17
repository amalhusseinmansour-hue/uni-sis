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
        // Ensure UTF-8 encoding for all string inputs
        $input = $request->all();
        array_walk_recursive($input, function (&$value) {
            if (is_string($value)) {
                if (!mb_check_encoding($value, 'UTF-8')) {
                    $value = mb_convert_encoding($value, 'UTF-8', 'auto');
                }
                $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
            }
        });
        $request->replace($input);

        // التحقق من مفتاح الـ API
        $apiKey = $request->header('X-API-Key') ?? $request->header('Authorization');
        if (!$this->validateApiKey($apiKey)) {
            Log::warning('Webhook: Invalid API key attempt', [
                'ip' => $request->ip(),
            ]);
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Map WordPress field names to SIS field names
        $fieldMapping = [
            'passport_number' => 'national_id',
            'residence_country' => 'country',
            'degree_text' => 'degree',
            'college_text' => 'college',
            'major_text' => 'program_name',
            'whatsapp_number' => 'whatsapp',
        ];

        foreach ($fieldMapping as $wpField => $sisField) {
            if ($request->has($wpField) && !$request->has($sisField)) {
                $request->merge([$sisField => $request->input($wpField)]);
            }
        }

        // معالجة تاريخ الميلاد - تحويل من DD/MM/YYYY إلى YYYY-MM-DD
        $dateOfBirth = $request->input('date_of_birth');
        if ($dateOfBirth) {
            // Convert DD/MM/YYYY or D/M/YYYY to YYYY-MM-DD
            if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $dateOfBirth, $matches)) {
                $dateOfBirth = sprintf('%04d-%02d-%02d', $matches[3], $matches[2], $matches[1]);
                $request->merge(['date_of_birth' => $dateOfBirth]);
            }
            // Also handle DD-MM-YYYY format
            elseif (preg_match('/^(\d{1,2})-(\d{1,2})-(\d{4})$/', $dateOfBirth, $matches)) {
                $dateOfBirth = sprintf('%04d-%02d-%02d', $matches[3], $matches[2], $matches[1]);
                $request->merge(['date_of_birth' => $dateOfBirth]);
            }
        }

        // التحقق من البيانات - مرونة أكثر
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'national_id' => 'nullable|string|max:50',
            'passport_number' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
            'nationality' => 'nullable|string|max:100',
        ]);

        // national_id أو passport_number مطلوب
        $nationalId = $request->input('national_id') ?? $request->input('passport_number');
        if (empty($nationalId)) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => ['national_id' => ['رقم الهوية أو جواز السفر مطلوب']],
            ], 422);
        }

        // التحقق من عدم وجود طلب سابق
        $existingApp = \App\Models\AdmissionApplication::where('national_id', $nationalId)->first();
        if ($existingApp) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => ['national_id' => ['يوجد طلب سابق بنفس رقم الهوية - ' . $nationalId]],
            ], 422);
        }

        if ($validator->fails()) {
            Log::info('Webhook: Validation failed', [
                'errors' => $validator->errors()->toArray(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // معالجة البرنامج
            $programId = null;
            $programName = $request->input('program_name') ?? $request->input('major_text');

            // محاولة إيجاد البرنامج بالـ ID
            if ($request->input('program_id')) {
                $program = \App\Models\Program::find($request->input('program_id'));
                $programId = $program?->id;
            }

            // محاولة إيجاد البرنامج بالـ code
            if (!$programId && $request->input('program_code')) {
                $program = \App\Models\Program::where('code', $request->input('program_code'))->first();
                $programId = $program?->id;
            }

            // محاولة إيجاد البرنامج بالاسم
            if (!$programId && $programName) {
                $program = \App\Models\Program::where('name_en', 'like', '%' . $programName . '%')
                    ->orWhere('name_ar', 'like', '%' . $programName . '%')
                    ->first();
                $programId = $program?->id;
            }

            // معالجة الجنس
            $gender = $request->input('gender');
            if ($gender) {
                $gender = strtolower($gender);
                if (in_array($gender, ['ذكر', 'male', 'm'])) {
                    $gender = 'male';
                } elseif (in_array($gender, ['أنثى', 'انثى', 'female', 'f'])) {
                    $gender = 'female';
                }
            }

            // معالجة الدرجة
            $degree = $request->input('degree') ?? $request->input('degree_text') ?? 'Bachelor';
            $degreeMap = [
                'بكالوريوس' => 'Bachelor',
                'ماجستير' => 'Master',
                'دكتوراه' => 'PhD',
                'دبلوم' => 'Diploma',
            ];
            $degree = $degreeMap[$degree] ?? $degree;

            // جمع روابط الملفات
            $attachments = $request->input('attachments', []);
            $photoUrl = $request->input('photo_url') ?? $request->input('field_35') ?? $request->input('field_33') ?? $request->input('field_38');
            $passportUrl = $request->input('passport_url') ?? $request->input('field_36') ?? $request->input('field_32') ?? $request->input('field_39');
            $bachelorCertUrl = $request->input('bachelor_cert_url') ?? $request->input('field_34') ?? $request->input('field_40');
            $highSchoolCertUrl = $request->input('high_school_cert_url') ?? $request->input('field_37') ?? $request->input('field_41');

            // تجهيز البيانات
            $applicationData = [
                'full_name' => $request->input('full_name'),
                'full_name_ar' => $request->input('full_name_ar') ?? $request->input('full_name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'whatsapp' => $request->input('whatsapp') ?? $request->input('whatsapp_number') ?? $request->input('phone'),
                'national_id' => $nationalId,
                'date_of_birth' => $request->input('date_of_birth'),
                'gender' => $gender ?? 'male',
                'nationality' => $request->input('nationality'),
                'country' => $request->input('country') ?? $request->input('residence_country'),
                'city' => $request->input('city'),
                'residence' => $request->input('residence'),
                'address' => $request->input('address'),
                'program_id' => $programId,
                'program_name' => $programName,
                'college' => $request->input('college') ?? $request->input('college_text'),
                'degree' => $degree,
                'high_school_name' => $request->input('high_school_name'),
                'high_school_score' => $request->input('high_school_score'),
                'high_school_year' => $request->input('high_school_year'),
                'scholarship_percentage' => $request->input('scholarship_percentage', 0),
                'payment_method' => $request->input('payment_method'),
                'source' => $request->input('source', 'wordpress'),
                'metadata' => [
                    'form_id' => $request->input('form_id'),
                    'entry_id' => $request->input('entry_id'),
                    'site_url' => $request->input('site_url'),
                    'submitted_at' => $request->input('submitted_at', now()->toIso8601String()),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'utm_source' => $request->input('utm_source'),
                    'utm_campaign' => $request->input('utm_campaign'),
                    'attachments' => $attachments,
                    'photo_url' => $photoUrl,
                    'passport_url' => $passportUrl,
                    'bachelor_cert_url' => $bachelorCertUrl,
                    'high_school_cert_url' => $highSchoolCertUrl,
                    'degree_id' => $request->input('degree_id'),
                    'college_id' => $request->input('college_id'),
                    'major_id' => $request->input('major_id'),
                    'raw_data' => $request->except(['attachments']),
                ],
            ];

            // إنشاء الطلب
            $application = $this->workflowService->submitApplication($applicationData);

            Log::info('Webhook: Application submitted successfully', [
                'application_id' => $application->id,
                'email' => $application->email,
                'source' => $applicationData['source'],
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

        $programs = \App\Models\Program::with('department:id,name_en,name_ar')
            ->select('id', 'code', 'name_en', 'name_ar', 'type', 'department_id')
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

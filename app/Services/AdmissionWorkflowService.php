<?php

namespace App\Services;

use App\Models\AdmissionApplication;
use App\Models\AdmissionPayment;
use App\Models\AdmissionWorkflowLog;
use App\Models\Student;
use App\Models\User;
use App\Models\Notification;
use App\Mail\ApplicationSubmitted;
use App\Mail\ApplicationUnderReview;
use App\Mail\DocumentsVerified;
use App\Mail\PaymentRequested;
use App\Mail\PaymentReceived;
use App\Mail\ApplicationApproved;
use App\Mail\ApplicationRejected;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdmissionWorkflowService
{
    /**
     * الخطوة 1: تقديم طلب جديد
     * يتم استدعاؤها عند تقديم الطالب من موقع الجامعة
     */
    public function submitApplication(array $data): AdmissionApplication
    {
        return DB::transaction(function () use ($data) {
            $data['status'] = AdmissionApplication::STATUS_PENDING;
            $data['date'] = now();

            $application = AdmissionApplication::create($data);

            // تسجيل في سجل workflow
            $application->logWorkflow(
                'APPLICATION_SUBMITTED',
                AdmissionApplication::STATUS_PENDING,
                null,
                'تم تقديم طلب الالتحاق من موقع الجامعة'
            );

            // إرسال إيميل تأكيد للطالب
            $this->sendApplicationSubmittedEmail($application);

            // إرسال إشعار لقسم القبول والتسجيل
            $this->notifyAdmissionDepartment($application, 'طلب التحاق جديد', 'تم تقديم طلب التحاق جديد من: ' . $application->full_name);

            return $application;
        });
    }

    /**
     * الخطوة 2: بدء مراجعة الطلب من قسم القبول والتسجيل
     */
    public function startReview(AdmissionApplication $application, int $reviewerId): AdmissionApplication
    {
        if (!$application->canProceedToReview()) {
            throw new \Exception('لا يمكن بدء المراجعة. الحالة الحالية: ' . $application->status);
        }

        return DB::transaction(function () use ($application, $reviewerId) {
            $oldStatus = $application->status;

            $application->update([
                'status' => AdmissionApplication::STATUS_UNDER_REVIEW,
                'reviewed_by' => $reviewerId,
            ]);

            $application->logWorkflow(
                'UNDER_REVIEW',
                AdmissionApplication::STATUS_UNDER_REVIEW,
                $reviewerId,
                'تم بدء مراجعة الطلب'
            );

            // إرسال إيميل للطالب
            $this->sendUnderReviewEmail($application);

            return $application->fresh();
        });
    }

    /**
     * الخطوة 3: التحقق من المستندات
     */
    public function verifyDocuments(AdmissionApplication $application, int $reviewerId, ?string $notes = null): AdmissionApplication
    {
        if (!$application->canVerifyDocuments()) {
            throw new \Exception('لا يمكن التحقق من المستندات. الحالة الحالية: ' . $application->status);
        }

        return DB::transaction(function () use ($application, $reviewerId, $notes) {
            $application->update([
                'status' => AdmissionApplication::STATUS_DOCUMENTS_VERIFIED,
                'documents_verified_at' => now(),
                'reviewer_notes' => $notes,
            ]);

            $application->logWorkflow(
                'DOCUMENTS_VERIFIED',
                AdmissionApplication::STATUS_DOCUMENTS_VERIFIED,
                $reviewerId,
                $notes ?? 'تم التحقق من جميع المستندات'
            );

            // إرسال إيميل للطالب
            $this->sendDocumentsVerifiedEmail($application);

            return $application->fresh();
        });
    }

    /**
     * الخطوة 4: طلب دفع رسوم التسجيل (إرسال للقسم المالي)
     */
    public function requestPayment(AdmissionApplication $application, float $registrationFee, int $reviewerId): AdmissionApplication
    {
        if (!$application->canRequestPayment()) {
            throw new \Exception('لا يمكن طلب الدفع. الحالة الحالية: ' . $application->status);
        }

        return DB::transaction(function () use ($application, $registrationFee, $reviewerId) {
            $application->update([
                'status' => AdmissionApplication::STATUS_PENDING_PAYMENT,
                'registration_fee' => $registrationFee,
                'payment_requested_at' => now(),
            ]);

            $application->logWorkflow(
                'PAYMENT_REQUESTED',
                AdmissionApplication::STATUS_PENDING_PAYMENT,
                $reviewerId,
                'تم طلب دفع رسوم التسجيل: ' . $registrationFee . ' دولار'
            );

            // إرسال إيميل للطالب مع تفاصيل الدفع
            $this->sendPaymentRequestedEmail($application);

            // إرسال إشعار للقسم المالي
            $this->notifyFinanceDepartment($application, 'طلب دفع رسوم تسجيل', 'طلب دفع رسوم تسجيل للطالب: ' . $application->full_name);

            return $application->fresh();
        });
    }

    /**
     * الخطوة 5: تسجيل دفع الرسوم (من القسم المالي)
     */
    public function recordPayment(
        AdmissionApplication $application,
        float $amount,
        string $paymentMethod,
        int $verifiedBy,
        ?array $paymentDetails = []
    ): AdmissionPayment {
        if (!$application->canReceivePayment()) {
            throw new \Exception('لا يمكن تسجيل الدفع. الحالة الحالية: ' . $application->status);
        }

        return DB::transaction(function () use ($application, $amount, $paymentMethod, $verifiedBy, $paymentDetails) {
            // إنشاء سجل الدفع
            $payment = AdmissionPayment::create([
                'admission_application_id' => $application->id,
                'transaction_id' => AdmissionPayment::generateTransactionId(),
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'status' => 'COMPLETED',
                'bank_name' => $paymentDetails['bank_name'] ?? null,
                'receipt_number' => $paymentDetails['receipt_number'] ?? null,
                'receipt_path' => $paymentDetails['receipt_path'] ?? null,
                'paid_at' => now(),
                'verified_by' => $verifiedBy,
                'verified_at' => now(),
                'notes' => $paymentDetails['notes'] ?? null,
            ]);

            // تحديث حالة الطلب
            $application->update([
                'status' => AdmissionApplication::STATUS_PAYMENT_RECEIVED,
                'payment_received_at' => now(),
            ]);

            $application->logWorkflow(
                'PAYMENT_RECEIVED',
                AdmissionApplication::STATUS_PAYMENT_RECEIVED,
                $verifiedBy,
                'تم استلام رسوم التسجيل: ' . $amount . ' دولار',
                ['payment_id' => $payment->id, 'transaction_id' => $payment->transaction_id]
            );

            // إرسال إيميل تأكيد الدفع للطالب
            $this->sendPaymentReceivedEmail($application, $payment);

            // إرسال إشعار لقسم القبول والتسجيل
            $this->notifyAdmissionDepartment(
                $application,
                'تم دفع رسوم التسجيل',
                'تم دفع رسوم التسجيل للطالب: ' . $application->full_name . ' - جاهز للموافقة النهائية'
            );

            return $payment;
        });
    }

    /**
     * الخطوة 6: الموافقة النهائية وإنشاء حساب الطالب
     */
    public function approveApplication(AdmissionApplication $application, int $approverId): array
    {
        if (!$application->canApprove()) {
            throw new \Exception('لا يمكن الموافقة على الطلب. الحالة الحالية: ' . $application->status);
        }

        return DB::transaction(function () use ($application, $approverId) {
            // توليد رقم جامعي
            $studentId = AdmissionApplication::generateStudentId($application->program_id);

            // تحديث الطلب
            $application->update([
                'status' => AdmissionApplication::STATUS_APPROVED,
                'student_id' => $studentId,
                'approved_at' => now(),
                'approved_by' => $approverId,
            ]);

            $application->logWorkflow(
                'APPLICATION_APPROVED',
                AdmissionApplication::STATUS_APPROVED,
                $approverId,
                'تمت الموافقة على الطلب - الرقم الجامعي: ' . $studentId
            );

            // إنشاء حساب المستخدم والطالب
            $result = $this->createStudentAccount($application, $studentId);

            // إنشاء خطاب القبول وبطاقة الجامعة
            $documents = $this->generateAcceptanceDocuments($application);

            // تحديث مسارات الوثائق
            $application->update([
                'acceptance_letter_path' => $documents['acceptance_letter_path'],
                'university_card_path' => $documents['university_card_path'],
            ]);

            // إرسال إيميل القبول للطالب مع الوثائق
            $this->sendApprovalEmail($application, $result['user'], $documents);

            return [
                'application' => $application->fresh(),
                'student' => $result['student'],
                'user' => $result['user'],
                'documents' => $documents,
            ];
        });
    }

    /**
     * رفض الطلب
     */
    public function rejectApplication(AdmissionApplication $application, int $reviewerId, string $reason): AdmissionApplication
    {
        return DB::transaction(function () use ($application, $reviewerId, $reason) {
            $application->update([
                'status' => AdmissionApplication::STATUS_REJECTED,
                'reviewer_notes' => $reason,
            ]);

            $application->logWorkflow(
                'APPLICATION_REJECTED',
                AdmissionApplication::STATUS_REJECTED,
                $reviewerId,
                $reason
            );

            // إرسال إيميل للطالب
            $this->sendRejectionEmail($application, $reason);

            return $application->fresh();
        });
    }

    /**
     * إضافة للقائمة الانتظار
     */
    public function waitlistApplication(AdmissionApplication $application, int $reviewerId, ?string $notes = null): AdmissionApplication
    {
        return DB::transaction(function () use ($application, $reviewerId, $notes) {
            $application->update([
                'status' => AdmissionApplication::STATUS_WAITLISTED,
                'reviewer_notes' => $notes,
            ]);

            $application->logWorkflow(
                'APPLICATION_WAITLISTED',
                AdmissionApplication::STATUS_WAITLISTED,
                $reviewerId,
                $notes ?? 'تم إضافة الطلب لقائمة الانتظار'
            );

            return $application->fresh();
        });
    }

    /**
     * إنشاء حساب المستخدم والطالب
     */
    protected function createStudentAccount(AdmissionApplication $application, string $studentId): array
    {
        // إنشاء بريد جامعي
        $universityEmail = $this->generateUniversityEmail($application->full_name, $studentId);

        // كلمة مرور مؤقتة
        $temporaryPassword = Str::random(12);

        // إنشاء المستخدم
        $user = User::create([
            'name' => $application->full_name,
            'email' => $universityEmail,
            'password' => bcrypt($temporaryPassword),
            'role' => 'STUDENT',
            'phone' => $application->phone,
        ]);

        // إنشاء سجل الطالب
        $student = Student::create([
            'user_id' => $user->id,
            'program_id' => $application->program_id,
            'student_id' => $studentId,
            'name_ar' => $application->full_name,
            'name_en' => $application->full_name,
            'status' => 'ACTIVE',
            'national_id' => $application->national_id,
            'date_of_birth' => $application->date_of_birth,
            'gender' => $application->gender,
            'nationality' => $application->nationality,
            'admission_date' => now(),
            'phone' => $application->phone,
            'personal_email' => $application->email,
            'university_email' => $universityEmail,
            'sis_username' => $studentId,
        ]);

        $application->logWorkflow(
            'STUDENT_CREATED',
            null,
            null,
            'تم إنشاء حساب الطالب',
            ['student_id' => $student->id, 'user_id' => $user->id]
        );

        // حفظ كلمة المرور المؤقتة للإرسال
        $user->temporary_password = $temporaryPassword;

        return [
            'user' => $user,
            'student' => $student,
        ];
    }

    /**
     * توليد بريد جامعي
     */
    protected function generateUniversityEmail(string $fullName, string $studentId): string
    {
        // تنظيف الاسم وتحويله لحروف صغيرة
        $cleanName = preg_replace('/[^a-zA-Z]/', '', Str::ascii($fullName));
        $cleanName = strtolower($cleanName);

        // استخدام أول 3 حروف من الاسم + الرقم الجامعي
        $prefix = substr($cleanName, 0, 3) ?: 'stu';

        // نطاق البريد الجامعي لجامعة فيرتكس
        $domain = config('university.email_domain', 'vertexuniversity.edu.eu');

        return $prefix . $studentId . '@' . $domain;
    }

    /**
     * إنشاء وثائق القبول (خطاب القبول وبطاقة الجامعة)
     */
    protected function generateAcceptanceDocuments(AdmissionApplication $application): array
    {
        $pdfService = app(PdfGeneratorService::class);

        $acceptanceLetterPath = $pdfService->generateAcceptanceLetter($application);
        $universityCardPath = $pdfService->generateUniversityCard($application);

        $application->logWorkflow(
            'ACCEPTANCE_LETTER_GENERATED',
            null,
            null,
            'تم إنشاء خطاب القبول'
        );

        $application->logWorkflow(
            'UNIVERSITY_CARD_GENERATED',
            null,
            null,
            'تم إنشاء بطاقة الجامعة'
        );

        return [
            'acceptance_letter_path' => $acceptanceLetterPath,
            'university_card_path' => $universityCardPath,
        ];
    }

    // ============ دوال إرسال الإيميلات ============

    protected function sendApplicationSubmittedEmail(AdmissionApplication $application): void
    {
        try {
            Mail::to($application->email)->queue(new ApplicationSubmitted($application));

            $application->logWorkflow('EMAIL_SENT', null, null, 'تم إرسال إيميل تأكيد التقديم');
        } catch (\Exception $e) {
            Log::error('Failed to send application submitted email: ' . $e->getMessage());
        }
    }

    protected function sendUnderReviewEmail(AdmissionApplication $application): void
    {
        try {
            Mail::to($application->email)->queue(new ApplicationUnderReview($application));

            $application->logWorkflow('EMAIL_SENT', null, null, 'تم إرسال إيميل بدء المراجعة');
        } catch (\Exception $e) {
            Log::error('Failed to send under review email: ' . $e->getMessage());
        }
    }

    protected function sendDocumentsVerifiedEmail(AdmissionApplication $application): void
    {
        try {
            Mail::to($application->email)->queue(new DocumentsVerified($application));

            $application->logWorkflow('EMAIL_SENT', null, null, 'تم إرسال إيميل التحقق من المستندات');
        } catch (\Exception $e) {
            Log::error('Failed to send documents verified email: ' . $e->getMessage());
        }
    }

    protected function sendPaymentRequestedEmail(AdmissionApplication $application): void
    {
        try {
            Mail::to($application->email)->queue(new PaymentRequested($application));

            $application->logWorkflow('EMAIL_SENT', null, null, 'تم إرسال إيميل طلب الدفع');
        } catch (\Exception $e) {
            Log::error('Failed to send payment requested email: ' . $e->getMessage());
        }
    }

    protected function sendPaymentReceivedEmail(AdmissionApplication $application, AdmissionPayment $payment): void
    {
        try {
            Mail::to($application->email)->queue(new PaymentReceived($application, $payment));

            $application->logWorkflow('EMAIL_SENT', null, null, 'تم إرسال إيميل تأكيد الدفع');
        } catch (\Exception $e) {
            Log::error('Failed to send payment received email: ' . $e->getMessage());
        }
    }

    protected function sendApprovalEmail(AdmissionApplication $application, User $user, array $documents): void
    {
        try {
            Mail::to($application->email)->queue(new ApplicationApproved($application, $user, $documents));

            $application->logWorkflow('EMAIL_SENT', null, null, 'تم إرسال إيميل القبول مع الوثائق');
        } catch (\Exception $e) {
            Log::error('Failed to send approval email: ' . $e->getMessage());
        }
    }

    protected function sendRejectionEmail(AdmissionApplication $application, string $reason): void
    {
        try {
            Mail::to($application->email)->queue(new ApplicationRejected($application, $reason));

            $application->logWorkflow('EMAIL_SENT', null, null, 'تم إرسال إيميل الرفض');
        } catch (\Exception $e) {
            Log::error('Failed to send rejection email: ' . $e->getMessage());
        }
    }

    // ============ دوال الإشعارات الداخلية ============

    protected function notifyAdmissionDepartment(AdmissionApplication $application, string $title, string $message): void
    {
        // الحصول على مستخدمي قسم القبول والتسجيل (ADMIN)
        $adminUsers = User::where('role', 'ADMIN')->pluck('id')->toArray();

        if (!empty($adminUsers)) {
            Notification::sendToMany($adminUsers, $title, $message, 'INFO', [
                'icon' => 'academic-cap',
                'link' => '/admission-applications/' . $application->id,
                'data' => ['application_id' => $application->id],
            ]);
        }
    }

    protected function notifyFinanceDepartment(AdmissionApplication $application, string $title, string $message): void
    {
        // الحصول على مستخدمي القسم المالي
        $financeUsers = User::where('role', 'FINANCE')->pluck('id')->toArray();

        if (!empty($financeUsers)) {
            Notification::sendToMany($financeUsers, $title, $message, 'INFO', [
                'icon' => 'currency-dollar',
                'link' => '/admission-applications/' . $application->id,
                'data' => ['application_id' => $application->id],
            ]);
        }
    }

    /**
     * الحصول على إحصائيات workflow
     */
    public function getWorkflowStatistics(): array
    {
        return [
            'total' => AdmissionApplication::count(),
            'pending' => AdmissionApplication::pending()->count(),
            'under_review' => AdmissionApplication::underReview()->count(),
            'documents_verified' => AdmissionApplication::documentsVerified()->count(),
            'pending_payment' => AdmissionApplication::pendingPayment()->count(),
            'payment_received' => AdmissionApplication::paymentReceived()->count(),
            'approved' => AdmissionApplication::approved()->count(),
            'rejected' => AdmissionApplication::rejected()->count(),
            'waitlisted' => AdmissionApplication::waitlisted()->count(),
            'awaiting_action' => AdmissionApplication::awaitingAction()->count(),
        ];
    }
}

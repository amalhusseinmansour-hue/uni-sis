<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send notification to a single user
     */
    public static function send(
        User $user,
        string $titleEn,
        string $titleAr,
        string $messageEn,
        string $messageAr,
        string $type = 'INFO',
        ?string $icon = null,
        ?string $link = null,
        ?array $data = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'title' => $titleEn,
            'title_ar' => $titleAr,
            'message' => $messageEn,
            'message_ar' => $messageAr,
            'type' => $type,
            'icon' => $icon ?? self::getDefaultIcon($type),
            'link' => $link,
            'data' => $data,
        ]);
    }

    /**
     * Send notification to multiple users
     */
    public static function sendToMany(
        array $userIds,
        string $titleEn,
        string $titleAr,
        string $messageEn,
        string $messageAr,
        string $type = 'INFO',
        ?string $icon = null,
        ?string $link = null,
        ?array $data = null
    ): int {
        $count = 0;
        foreach ($userIds as $userId) {
            Notification::create([
                'user_id' => $userId,
                'title' => $titleEn,
                'title_ar' => $titleAr,
                'message' => $messageEn,
                'message_ar' => $messageAr,
                'type' => $type,
                'icon' => $icon ?? self::getDefaultIcon($type),
                'link' => $link,
                'data' => $data,
            ]);
            $count++;
        }
        return $count;
    }

    /**
     * Send notification to users by role
     */
    public static function sendToRole(
        string $role,
        string $titleEn,
        string $titleAr,
        string $messageEn,
        string $messageAr,
        string $type = 'INFO',
        ?string $icon = null,
        ?string $link = null,
        ?array $data = null
    ): int {
        $userIds = User::where('role', $role)->pluck('id')->toArray();
        return self::sendToMany($userIds, $titleEn, $titleAr, $messageEn, $messageAr, $type, $icon, $link, $data);
    }

    /**
     * Send notification to all users
     */
    public static function broadcast(
        string $titleEn,
        string $titleAr,
        string $messageEn,
        string $messageAr,
        string $type = 'ANNOUNCEMENT',
        ?string $icon = null,
        ?string $link = null,
        ?array $data = null
    ): int {
        $userIds = User::pluck('id')->toArray();
        return self::sendToMany($userIds, $titleEn, $titleAr, $messageEn, $messageAr, $type, $icon, $link, $data);
    }

    // ========================================
    // ACADEMIC NOTIFICATIONS
    // ========================================

    /**
     * Notify student about new grade
     */
    public static function notifyNewGrade(User $student, string $courseName, string $gradeValue): Notification
    {
        return self::send(
            $student,
            "New Grade Posted",
            "تم رصد درجة جديدة",
            "Your grade for {$courseName} has been posted: {$gradeValue}",
            "تم رصد درجتك في مادة {$courseName}: {$gradeValue}",
            'GRADE',
            'award',
            '/academic?tab=grades'
        );
    }

    /**
     * Notify student about enrollment status
     */
    public static function notifyEnrollmentStatus(User $student, string $courseName, string $status): Notification
    {
        $statusMessages = [
            'ENROLLED' => [
                'en' => "You have been successfully enrolled in {$courseName}",
                'ar' => "تم تسجيلك بنجاح في مادة {$courseName}"
            ],
            'DROPPED' => [
                'en' => "You have been dropped from {$courseName}",
                'ar' => "تم حذفك من مادة {$courseName}"
            ],
            'WITHDRAWN' => [
                'en' => "You have withdrawn from {$courseName}",
                'ar' => "تم انسحابك من مادة {$courseName}"
            ],
        ];

        $msg = $statusMessages[$status] ?? [
            'en' => "Your enrollment status for {$courseName} has been updated to {$status}",
            'ar' => "تم تحديث حالة تسجيلك في {$courseName} إلى {$status}"
        ];

        return self::send(
            $student,
            "Enrollment Update",
            "تحديث التسجيل",
            $msg['en'],
            $msg['ar'],
            'ENROLLMENT',
            'book-open',
            '/academic?tab=courses'
        );
    }

    /**
     * Notify about upcoming exam
     */
    public static function notifyUpcomingExam(User $student, string $courseName, string $examDate, string $examType): Notification
    {
        return self::send(
            $student,
            "Upcoming Exam",
            "امتحان قادم",
            "You have a {$examType} exam for {$courseName} on {$examDate}",
            "لديك امتحان {$examType} في مادة {$courseName} بتاريخ {$examDate}",
            'ACADEMIC',
            'calendar',
            '/exams'
        );
    }

    /**
     * Notify about attendance warning
     */
    public static function notifyAttendanceWarning(User $student, string $courseName, int $absences, int $maxAbsences): Notification
    {
        return self::send(
            $student,
            "Attendance Warning",
            "تحذير الحضور",
            "You have {$absences} absences in {$courseName}. Maximum allowed: {$maxAbsences}",
            "لديك {$absences} غيابات في مادة {$courseName}. الحد الأقصى المسموح: {$maxAbsences}",
            'WARNING',
            'alert-triangle',
            '/attendance',
            ['absences' => $absences, 'max_absences' => $maxAbsences]
        );
    }

    // ========================================
    // FINANCIAL NOTIFICATIONS
    // ========================================

    /**
     * Notify about new invoice
     */
    public static function notifyNewInvoice(User $student, float $amount, string $dueDate): Notification
    {
        return self::send(
            $student,
            "New Invoice",
            "فاتورة جديدة",
            "A new invoice of " . number_format($amount, 2) . " USD has been created. Due date: {$dueDate}",
            "تم إنشاء فاتورة جديدة بمبلغ " . number_format($amount, 2) . " دولار. تاريخ الاستحقاق: {$dueDate}",
            'FINANCIAL',
            'file-text',
            '/finance?tab=invoices'
        );
    }

    /**
     * Notify about payment received
     */
    public static function notifyPaymentReceived(User $student, float $amount, string $reference): Notification
    {
        return self::send(
            $student,
            "Payment Received",
            "تم استلام الدفعة",
            "Your payment of " . number_format($amount, 2) . " USD has been received. Reference: {$reference}",
            "تم استلام دفعتك بمبلغ " . number_format($amount, 2) . " دولار. رقم المرجع: {$reference}",
            'SUCCESS',
            'check-circle',
            '/finance?tab=payments'
        );
    }

    /**
     * Notify about overdue payment
     */
    public static function notifyOverduePayment(User $student, float $amount, int $daysPastDue): Notification
    {
        return self::send(
            $student,
            "Overdue Payment",
            "دفعة متأخرة",
            "You have an overdue payment of " . number_format($amount, 2) . " USD. {$daysPastDue} days past due.",
            "لديك دفعة متأخرة بمبلغ " . number_format($amount, 2) . " دولار. متأخرة {$daysPastDue} أيام.",
            'ERROR',
            'alert-circle',
            '/finance?tab=payments'
        );
    }

    // ========================================
    // SERVICE REQUEST NOTIFICATIONS
    // ========================================

    /**
     * Notify about service request status
     */
    public static function notifyServiceRequestStatus(User $student, string $requestType, string $status): Notification
    {
        $statusMessages = [
            'SUBMITTED' => [
                'title_en' => 'Request Submitted',
                'title_ar' => 'تم تقديم الطلب',
                'en' => "Your {$requestType} request has been submitted successfully",
                'ar' => "تم تقديم طلب {$requestType} بنجاح"
            ],
            'IN_REVIEW' => [
                'title_en' => 'Request Under Review',
                'title_ar' => 'الطلب قيد المراجعة',
                'en' => "Your {$requestType} request is being reviewed",
                'ar' => "طلب {$requestType} قيد المراجعة"
            ],
            'APPROVED' => [
                'title_en' => 'Request Approved',
                'title_ar' => 'تم الموافقة على الطلب',
                'en' => "Your {$requestType} request has been approved",
                'ar' => "تمت الموافقة على طلب {$requestType}"
            ],
            'REJECTED' => [
                'title_en' => 'Request Rejected',
                'title_ar' => 'تم رفض الطلب',
                'en' => "Your {$requestType} request has been rejected",
                'ar' => "تم رفض طلب {$requestType}"
            ],
            'COMPLETED' => [
                'title_en' => 'Request Completed',
                'title_ar' => 'تم إكمال الطلب',
                'en' => "Your {$requestType} request has been completed",
                'ar' => "تم إكمال طلب {$requestType}"
            ],
        ];

        $msg = $statusMessages[$status] ?? [
            'title_en' => 'Request Update',
            'title_ar' => 'تحديث الطلب',
            'en' => "Your {$requestType} request status has been updated to {$status}",
            'ar' => "تم تحديث حالة طلب {$requestType} إلى {$status}"
        ];

        $type = match($status) {
            'APPROVED', 'COMPLETED' => 'SUCCESS',
            'REJECTED' => 'ERROR',
            default => 'SERVICE_REQUEST'
        };

        return self::send(
            $student,
            $msg['title_en'],
            $msg['title_ar'],
            $msg['en'],
            $msg['ar'],
            $type,
            'file-text',
            '/requests'
        );
    }

    // ========================================
    // ADMISSION NOTIFICATIONS
    // ========================================

    /**
     * Notify applicant about admission status
     */
    public static function notifyAdmissionStatus(User $user, string $applicationRef, string $status): Notification
    {
        $statusMessages = [
            'SUBMITTED' => [
                'title_en' => 'Application Submitted',
                'title_ar' => 'تم تقديم الطلب',
                'en' => "Your admission application ({$applicationRef}) has been submitted",
                'ar' => "تم تقديم طلب القبول الخاص بك ({$applicationRef})"
            ],
            'UNDER_REVIEW' => [
                'title_en' => 'Application Under Review',
                'title_ar' => 'الطلب قيد المراجعة',
                'en' => "Your admission application ({$applicationRef}) is being reviewed",
                'ar' => "طلب القبول ({$applicationRef}) قيد المراجعة"
            ],
            'DOCUMENTS_VERIFIED' => [
                'title_en' => 'Documents Verified',
                'title_ar' => 'تم التحقق من المستندات',
                'en' => "Documents for your application ({$applicationRef}) have been verified",
                'ar' => "تم التحقق من مستندات طلب القبول ({$applicationRef})"
            ],
            'PENDING_PAYMENT' => [
                'title_en' => 'Payment Required',
                'title_ar' => 'مطلوب الدفع',
                'en' => "Payment is required to complete your admission ({$applicationRef})",
                'ar' => "مطلوب الدفع لإكمال طلب القبول ({$applicationRef})"
            ],
            'APPROVED' => [
                'title_en' => 'Application Approved',
                'title_ar' => 'تم قبول الطلب',
                'en' => "Congratulations! Your admission application ({$applicationRef}) has been approved",
                'ar' => "تهانينا! تم قبول طلب القبول ({$applicationRef})"
            ],
            'REJECTED' => [
                'title_en' => 'Application Rejected',
                'title_ar' => 'تم رفض الطلب',
                'en' => "Your admission application ({$applicationRef}) has been rejected",
                'ar' => "تم رفض طلب القبول ({$applicationRef})"
            ],
        ];

        $msg = $statusMessages[$status] ?? [
            'title_en' => 'Admission Update',
            'title_ar' => 'تحديث القبول',
            'en' => "Your admission application ({$applicationRef}) status: {$status}",
            'ar' => "حالة طلب القبول ({$applicationRef}): {$status}"
        ];

        $type = match($status) {
            'APPROVED' => 'SUCCESS',
            'REJECTED' => 'ERROR',
            'PENDING_PAYMENT' => 'WARNING',
            default => 'INFO'
        };

        return self::send(
            $user,
            $msg['title_en'],
            $msg['title_ar'],
            $msg['en'],
            $msg['ar'],
            $type,
            'user-check',
            '/admissions'
        );
    }

    // ========================================
    // ANNOUNCEMENT NOTIFICATIONS
    // ========================================

    /**
     * Notify about new announcement
     */
    public static function notifyAnnouncement(User $user, string $title, string $titleAr): Notification
    {
        return self::send(
            $user,
            "New Announcement",
            "إعلان جديد",
            "New announcement: {$title}",
            "إعلان جديد: {$titleAr}",
            'ANNOUNCEMENT',
            'megaphone',
            '/'
        );
    }

    // ========================================
    // SYSTEM NOTIFICATIONS
    // ========================================

    /**
     * Notify about password change
     */
    public static function notifyPasswordChanged(User $user): Notification
    {
        return self::send(
            $user,
            "Password Changed",
            "تم تغيير كلمة المرور",
            "Your password has been changed successfully",
            "تم تغيير كلمة المرور بنجاح",
            'INFO',
            'lock',
            '/settings'
        );
    }

    /**
     * Notify about profile update
     */
    public static function notifyProfileUpdated(User $user): Notification
    {
        return self::send(
            $user,
            "Profile Updated",
            "تم تحديث الملف الشخصي",
            "Your profile has been updated successfully",
            "تم تحديث ملفك الشخصي بنجاح",
            'SUCCESS',
            'user',
            '/profile'
        );
    }

    /**
     * Welcome notification for new users
     */
    public static function sendWelcomeNotification(User $user): Notification
    {
        return self::send(
            $user,
            "Welcome to VERTIX University",
            "مرحباً بك في جامعة فيرتكس",
            "Welcome to VERTIX University. Learn from anywhere, lead everywhere! Explore your dashboard to get started.",
            "مرحباً بك في جامعة فيرتكس. تعلم من أي مكان وكن قائداً في كل مكان! استكشف لوحة التحكم للبدء.",
            'SUCCESS',
            'sparkles',
            '/'
        );
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    /**
     * Get default icon for notification type
     */
    private static function getDefaultIcon(string $type): string
    {
        return match($type) {
            'SUCCESS' => 'check-circle',
            'WARNING' => 'alert-triangle',
            'ERROR' => 'x-circle',
            'ACADEMIC' => 'graduation-cap',
            'FINANCIAL' => 'credit-card',
            'GRADE' => 'award',
            'ENROLLMENT' => 'book-open',
            'ANNOUNCEMENT' => 'megaphone',
            'SERVICE_REQUEST' => 'file-text',
            'DISCIPLINE_INCIDENT' => 'alert-octagon',
            'DISCIPLINE_ACTION' => 'shield',
            'DISCIPLINE_APPEAL_DECISION' => 'gavel',
            default => 'bell',
        };
    }

    /**
     * Clean old read notifications (older than 30 days)
     */
    public static function cleanOldNotifications(int $daysOld = 30): int
    {
        return Notification::whereNotNull('read_at')
            ->where('read_at', '<', now()->subDays($daysOld))
            ->delete();
    }
}

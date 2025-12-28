<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmissionWorkflowLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_application_id',
        'from_status',
        'to_status',
        'action',
        'performed_by',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    // العلاقات
    public function admissionApplication(): BelongsTo
    {
        return $this->belongsTo(AdmissionApplication::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    // إنشاء سجل جديد
    public static function log(
        int $applicationId,
        string $action,
        ?string $fromStatus = null,
        ?string $toStatus = null,
        ?int $performedBy = null,
        ?string $notes = null,
        ?array $metadata = null
    ): self {
        return self::create([
            'admission_application_id' => $applicationId,
            'action' => $action,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'performed_by' => $performedBy,
            'notes' => $notes,
            'metadata' => $metadata,
        ]);
    }

    // Scopes
    public function scopeForApplication($query, int $applicationId)
    {
        return $query->where('admission_application_id', $applicationId);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // الحصول على وصف الإجراء بالعربي
    public function getActionDescriptionAttribute(): string
    {
        return match ($this->action) {
            'APPLICATION_SUBMITTED' => 'تم تقديم طلب الالتحاق',
            'UNDER_REVIEW' => 'الطلب قيد المراجعة',
            'DOCUMENTS_VERIFIED' => 'تم التحقق من المستندات',
            'PAYMENT_REQUESTED' => 'تم طلب دفع رسوم التسجيل',
            'PAYMENT_RECEIVED' => 'تم استلام رسوم التسجيل',
            'APPLICATION_APPROVED' => 'تمت الموافقة على الطلب',
            'APPLICATION_REJECTED' => 'تم رفض الطلب',
            'STUDENT_CREATED' => 'تم إنشاء حساب الطالب',
            'ACCEPTANCE_LETTER_GENERATED' => 'تم إنشاء خطاب القبول',
            'UNIVERSITY_CARD_GENERATED' => 'تم إنشاء بطاقة الجامعة',
            'NOTIFICATION_SENT' => 'تم إرسال إشعار',
            'EMAIL_SENT' => 'تم إرسال بريد إلكتروني',
            default => $this->action,
        };
    }
}

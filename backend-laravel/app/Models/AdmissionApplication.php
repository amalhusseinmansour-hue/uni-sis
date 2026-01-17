<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AdmissionApplication extends Model
{
    use HasFactory;

    // حالات طلب القبول
    const STATUS_PENDING = 'PENDING'; // تم التقديم
    const STATUS_UNDER_REVIEW = 'UNDER_REVIEW'; // قيد المراجعة
    const STATUS_DOCUMENTS_VERIFIED = 'DOCUMENTS_VERIFIED'; // تم التحقق من المستندات
    const STATUS_PENDING_PAYMENT = 'PENDING_PAYMENT'; // في انتظار الدفع
    const STATUS_PAYMENT_RECEIVED = 'PAYMENT_RECEIVED'; // تم استلام الدفع
    const STATUS_APPROVED = 'APPROVED'; // تمت الموافقة النهائية
    const STATUS_REJECTED = 'REJECTED'; // مرفوض
    const STATUS_WAITLISTED = 'WAITLISTED'; // قائمة الانتظار

    protected $fillable = [
        'program_id',
        'full_name',
        'national_id',
        'email',
        'phone',
        'whatsapp',
        'date_of_birth',
        'gender',
        'nationality',
        'country',
        'city',
        'residence',
        'address',
        'program_name',
        'college',
        'degree',
        'high_school_name',
        'high_school_score',
        'high_school_year',
        'documents',
        'emergency_contact_name',
        'emergency_contact_phone',
        'status',
        'date',
        'notes',
        'reviewer_notes',
        // حقول workflow الجديدة
        'student_id',
        'registration_fee',
        'scholarship_percentage',
        'payment_method',
        'documents_verified_at',
        'payment_requested_at',
        'payment_received_at',
        'approved_at',
        'acceptance_letter_path',
        'university_card_path',
        'reviewed_by',
        'approved_by',
        'source',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'date_of_birth' => 'date',
            'high_school_score' => 'decimal:2',
            'high_school_year' => 'integer',
            'documents' => 'array',
            'registration_fee' => 'decimal:2',
            'scholarship_percentage' => 'decimal:2',
            'documents_verified_at' => 'datetime',
            'payment_requested_at' => 'datetime',
            'payment_received_at' => 'datetime',
            'approved_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    // العلاقات
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(AdmissionPayment::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(AdmissionPayment::class)->latestOfMany();
    }

    public function completedPayment(): HasOne
    {
        return $this->hasOne(AdmissionPayment::class)->where('status', 'COMPLETED');
    }

    public function workflowLogs(): HasMany
    {
        return $this->hasMany(AdmissionWorkflowLog::class)->orderBy('created_at', 'desc');
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class, 'student_id', 'student_id');
    }

    // فحص الحالات
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isUnderReview(): bool
    {
        return $this->status === self::STATUS_UNDER_REVIEW;
    }

    public function isDocumentsVerified(): bool
    {
        return $this->status === self::STATUS_DOCUMENTS_VERIFIED;
    }

    public function isPendingPayment(): bool
    {
        return $this->status === self::STATUS_PENDING_PAYMENT;
    }

    public function isPaymentReceived(): bool
    {
        return $this->status === self::STATUS_PAYMENT_RECEIVED;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function isWaitlisted(): bool
    {
        return $this->status === self::STATUS_WAITLISTED;
    }

    // هل يمكن المتابعة في workflow
    public function canProceedToReview(): bool
    {
        return $this->isPending();
    }

    public function canVerifyDocuments(): bool
    {
        return $this->isUnderReview();
    }

    public function canRequestPayment(): bool
    {
        return $this->isDocumentsVerified();
    }

    public function canReceivePayment(): bool
    {
        return $this->isPendingPayment();
    }

    public function canApprove(): bool
    {
        return $this->isPaymentReceived();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeUnderReview($query)
    {
        return $query->where('status', self::STATUS_UNDER_REVIEW);
    }

    public function scopeDocumentsVerified($query)
    {
        return $query->where('status', self::STATUS_DOCUMENTS_VERIFIED);
    }

    public function scopePendingPayment($query)
    {
        return $query->where('status', self::STATUS_PENDING_PAYMENT);
    }

    public function scopePaymentReceived($query)
    {
        return $query->where('status', self::STATUS_PAYMENT_RECEIVED);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeWaitlisted($query)
    {
        return $query->where('status', self::STATUS_WAITLISTED);
    }

    public function scopeAwaitingAction($query)
    {
        return $query->whereIn('status', [
            self::STATUS_PENDING,
            self::STATUS_UNDER_REVIEW,
            self::STATUS_DOCUMENTS_VERIFIED,
            self::STATUS_PENDING_PAYMENT,
            self::STATUS_PAYMENT_RECEIVED,
        ]);
    }

    // توليد رقم جامعي
    public static function generateStudentId(int $programId): string
    {
        $year = date('Y');
        $program = Program::find($programId);
        $programCode = $program ? str_pad($program->id, 2, '0', STR_PAD_LEFT) : '00';

        // الحصول على آخر رقم جامعي لهذه السنة والبرنامج
        $lastStudent = self::where('student_id', 'like', "{$year}{$programCode}%")
            ->orderBy('student_id', 'desc')
            ->first();

        if ($lastStudent && $lastStudent->student_id) {
            $lastNumber = (int) substr($lastStudent->student_id, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $year . $programCode . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    // تسجيل حدث في سجل workflow
    public function logWorkflow(
        string $action,
        ?string $toStatus = null,
        ?int $performedBy = null,
        ?string $notes = null,
        ?array $metadata = null
    ): AdmissionWorkflowLog {
        return AdmissionWorkflowLog::log(
            $this->id,
            $action,
            $this->status,
            $toStatus ?? $this->status,
            $performedBy,
            $notes,
            $metadata
        );
    }

    // الحصول على وصف الحالة بالعربي
    public function getStatusDescriptionAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'تم تقديم الطلب',
            self::STATUS_UNDER_REVIEW => 'قيد المراجعة',
            self::STATUS_DOCUMENTS_VERIFIED => 'تم التحقق من المستندات',
            self::STATUS_PENDING_PAYMENT => 'في انتظار دفع الرسوم',
            self::STATUS_PAYMENT_RECEIVED => 'تم استلام الدفع',
            self::STATUS_APPROVED => 'تمت الموافقة',
            self::STATUS_REJECTED => 'مرفوض',
            self::STATUS_WAITLISTED => 'قائمة الانتظار',
            default => $this->status,
        };
    }

    // التحقق من وجود دفع مكتمل
    public function hasCompletedPayment(): bool
    {
        return $this->payments()->where('status', 'COMPLETED')->exists();
    }

    // الحصول على مبلغ الدفع المكتمل
    public function getPaidAmountAttribute(): float
    {
        return (float) $this->payments()
            ->where('status', 'COMPLETED')
            ->sum('amount');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnrollmentAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'semester_id',
        'enrollment_id',
        'course_id',
        'action_type',
        'course_code',
        'course_name',
        'old_section',
        'new_section',
        'credit_hours',
        'action_date',
        'is_late_action',
        'academic_period',
        'initial_credits',
        'final_credits',
        'approval_status',
        'requested_by',
        'approved_by',
        'approval_date',
        'approval_chain',
        'reason',
        'rejection_reason',
        'has_financial_impact',
        'refund_amount',
        'fee_amount',
        'refund_status',
        'supporting_documents',
        'notes',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'action_date' => 'datetime',
            'approval_date' => 'datetime',
            'is_late_action' => 'boolean',
            'has_financial_impact' => 'boolean',
            'refund_amount' => 'decimal:2',
            'fee_amount' => 'decimal:2',
            'approval_chain' => 'array',
            'supporting_documents' => 'array',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getActionTypeLabelAttribute(): string
    {
        return match ($this->action_type) {
            'COURSE_ADD' => 'Course Add / إضافة مساق',
            'COURSE_DROP' => 'Course Drop / سحب مساق',
            'SECTION_CHANGE' => 'Section Change / تغيير شعبة',
            'SEMESTER_WITHDRAWAL' => 'Semester Withdrawal / انسحاب من الفصل',
            'SEMESTER_POSTPONE' => 'Semester Postpone / تأجيل فصل',
            'LATE_REGISTRATION' => 'Late Registration / تسجيل متأخر',
            'COURSE_RETAKE' => 'Course Retake / إعادة مساق',
            'CREDIT_TRANSFER' => 'Credit Transfer / معادلة ساعات',
            'EXEMPTION' => 'Exemption / إعفاء',
            'AUDIT' => 'Audit / مستمع',
            'OVERRIDE' => 'Override / تجاوز',
            'WAITLIST_ADD' => 'Add to Waitlist / قائمة انتظار',
            'WAITLIST_REMOVE' => 'Remove from Waitlist / إزالة من الانتظار',
            'CAPACITY_OVERRIDE' => 'Capacity Override / تجاوز السعة',
            'PREREQUISITE_OVERRIDE' => 'Prerequisite Override / تجاوز المتطلب',
            'OTHER' => 'Other / أخرى',
            default => $this->action_type,
        };
    }

    public function getApprovalStatusLabelAttribute(): string
    {
        return match ($this->approval_status) {
            'PENDING' => 'Pending / قيد الانتظار',
            'APPROVED' => 'Approved / موافق عليه',
            'REJECTED' => 'Rejected / مرفوض',
            'AUTO_APPROVED' => 'Auto Approved / موافق تلقائياً',
            default => $this->approval_status,
        };
    }

    public function getRefundStatusLabelAttribute(): string
    {
        return match ($this->refund_status) {
            'NOT_APPLICABLE' => 'N/A',
            'PENDING' => 'Pending / قيد الانتظار',
            'PROCESSED' => 'Processed / تم المعالجة',
            'DENIED' => 'Denied / مرفوض',
            default => $this->refund_status ?? 'N/A',
        };
    }

    public function getCreditChangeAttribute(): int
    {
        if ($this->initial_credits !== null && $this->final_credits !== null) {
            return $this->final_credits - $this->initial_credits;
        }
        return 0;
    }

    public function isPending(): bool
    {
        return $this->approval_status === 'PENDING';
    }

    public function isApproved(): bool
    {
        return in_array($this->approval_status, ['APPROVED', 'AUTO_APPROVED']);
    }

    public function isRejected(): bool
    {
        return $this->approval_status === 'REJECTED';
    }

    public function scopePending($query)
    {
        return $query->where('approval_status', 'PENDING');
    }

    public function scopeApproved($query)
    {
        return $query->whereIn('approval_status', ['APPROVED', 'AUTO_APPROVED']);
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'REJECTED');
    }

    public function scopeForSemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    public function scopeByActionType($query, string $type)
    {
        return $query->where('action_type', $type);
    }

    public function scopeLateActions($query)
    {
        return $query->where('is_late_action', true);
    }

    public function scopeWithFinancialImpact($query)
    {
        return $query->where('has_financial_impact', true);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('action_date', '>=', now()->subDays($days));
    }
}

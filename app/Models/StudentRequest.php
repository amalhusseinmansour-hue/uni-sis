<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'semester_id',
        'request_number',
        'request_date',
        'category',
        'request_type',
        'request_type_other',
        'description',
        'reason',
        'request_data',
        'course_id',
        'section',
        'status',
        // Advisor Review
        'advisor_reviewed_by',
        'advisor_reviewed_at',
        'advisor_decision',
        'advisor_notes',
        // Department Review
        'department_reviewed_by',
        'department_reviewed_at',
        'department_decision',
        'department_notes',
        // Dean Review
        'dean_reviewed_by',
        'dean_reviewed_at',
        'dean_decision',
        'dean_notes',
        // Final Decision
        'final_decision_by',
        'final_decision_at',
        'final_notes',
        'rejection_reason',
        // Priority
        'priority',
        'deadline',
        'is_urgent',
        // Documents
        'attachments',
        'documents_required',
        'required_documents',
        'documents_complete',
        // Financial
        'has_fee',
        'fee_amount',
        'fee_paid',
        'payment_reference',
        // Execution
        'executed_by',
        'executed_at',
        'execution_notes',
        'execution_result',
        // Communication
        'student_notified',
        'notification_sent_at',
        'student_feedback',
        // Tracking
        'days_pending',
        'reminder_count',
        'last_reminder_at',
    ];

    protected function casts(): array
    {
        return [
            'request_date' => 'date',
            'deadline' => 'date',
            'advisor_reviewed_at' => 'datetime',
            'department_reviewed_at' => 'datetime',
            'dean_reviewed_at' => 'datetime',
            'final_decision_at' => 'datetime',
            'executed_at' => 'datetime',
            'notification_sent_at' => 'datetime',
            'last_reminder_at' => 'datetime',
            'is_urgent' => 'boolean',
            'documents_required' => 'boolean',
            'documents_complete' => 'boolean',
            'has_fee' => 'boolean',
            'fee_paid' => 'boolean',
            'student_notified' => 'boolean',
            'fee_amount' => 'decimal:2',
            'request_data' => 'array',
            'attachments' => 'array',
            'required_documents' => 'array',
            'execution_result' => 'array',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->request_number)) {
                $model->request_number = self::generateRequestNumber();
            }
            if (empty($model->request_date)) {
                $model->request_date = now()->toDateString();
            }
        });
    }

    public static function generateRequestNumber(): string
    {
        $year = now()->year;
        $lastRequest = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastRequest ? intval(substr($lastRequest->request_number, -5)) + 1 : 1;

        return sprintf('REQ-%d-%05d', $year, $sequence);
    }

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function advisorReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'advisor_reviewed_by');
    }

    public function departmentReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'department_reviewed_by');
    }

    public function deanReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dean_reviewed_by');
    }

    public function finalDecisionMaker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'final_decision_by');
    }

    public function executor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'executed_by');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(StudentRequestLog::class)->orderBy('created_at', 'desc');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(StudentRequestComment::class)->orderBy('created_at', 'desc');
    }

    public function publicComments(): HasMany
    {
        return $this->comments()->where('is_internal', false);
    }

    // Labels
    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            'REGISTRATION' => 'Registration / طلبات التسجيل',
            'SEMESTER' => 'Semester / طلبات الفصل',
            'ACADEMIC' => 'Academic / طلبات أكاديمية',
            'FINANCIAL' => 'Financial / طلبات مالية',
            'GRADUATION' => 'Graduation / طلبات التخرج',
            'DOCUMENTS' => 'Documents / طلبات وثائق',
            'OTHER' => 'Other / أخرى',
            default => $this->category,
        };
    }

    public function getRequestTypeLabelAttribute(): string
    {
        if ($this->request_type === 'OTHER') {
            return $this->request_type_other ?? 'Other';
        }

        return match ($this->request_type) {
            // Registration
            'SECTION_CHANGE' => 'Section Change / تغيير شعبة',
            'LATE_REGISTRATION' => 'Late Registration / تسجيل متأخر',
            'EXCEPTIONAL_REGISTRATION' => 'Exceptional Registration / تسجيل استثنائي',
            'OVERLOAD_REQUEST' => 'Course Overload / زيادة ساعات',
            'UNDERLOAD_REQUEST' => 'Course Underload / تخفيض ساعات',
            // Semester
            'SEMESTER_POSTPONE' => 'Semester Postpone / تأجيل فصل',
            'SEMESTER_WITHDRAWAL' => 'Semester Withdrawal / انسحاب من فصل',
            'STUDY_FREEZE' => 'Study Freeze / تجميد دراسة',
            'RE_ENROLLMENT' => 'Re-enrollment / إعادة قيد',
            // Academic
            'COURSE_EQUIVALENCY' => 'Course Equivalency / معادلة مواد',
            'EXAM_RETAKE' => 'Exam Retake / إعادة امتحان',
            'GRADE_REVIEW' => 'Grade Review / مراجعة علامة',
            'GRADE_APPEAL' => 'Grade Appeal / استئناف درجة',
            'GRADUATION_PROJECT' => 'Graduation Project / مشروع تخرج',
            'MAJOR_CHANGE' => 'Major Change / تغيير تخصص',
            'STUDY_PLAN_CHANGE' => 'Study Plan Change / تغيير خطة',
            'COURSE_WITHDRAWAL' => 'Course Withdrawal / انسحاب من مادة',
            'INCOMPLETE_EXTENSION' => 'Incomplete Extension / تمديد غير مكتمل',
            'ACADEMIC_EXCUSE' => 'Academic Excuse / عذر أكاديمي',
            // Financial
            'FEE_INSTALLMENT' => 'Fee Installment / تقسيط رسوم',
            'SCHOLARSHIP_REQUEST' => 'Scholarship Request / طلب منحة',
            'DISCOUNT_REQUEST' => 'Discount Request / طلب خصم',
            'FINANCIAL_STATEMENT' => 'Financial Statement / كشف حساب',
            'REFUND_REQUEST' => 'Refund Request / طلب استرداد',
            'PAYMENT_EXTENSION' => 'Payment Extension / تمديد دفع',
            // Graduation
            'GRADUATION_APPLICATION' => 'Graduation Application / طلب تخرج',
            'CREDIT_CALCULATION' => 'Credit Calculation / احتساب ساعات',
            'GRADUATION_CERTIFICATE' => 'Graduation Certificate / شهادة تخرج',
            'WHOM_IT_MAY_CONCERN' => 'To Whom It May Concern / لمن يهمه الأمر',
            // Documents
            'OFFICIAL_TRANSCRIPT' => 'Official Transcript / كشف درجات رسمي',
            'ENROLLMENT_CERTIFICATE' => 'Enrollment Certificate / شهادة قيد',
            'STUDENT_ID_CARD' => 'Student ID Card / بطاقة طالب',
            'CERTIFIED_COPY' => 'Certified Copy / صورة طبق الأصل',
            'RECOMMENDATION_LETTER' => 'Recommendation Letter / خطاب توصية',
            'EXPERIENCE_LETTER' => 'Experience Letter / خطاب خبرة',
            default => $this->request_type,
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'DRAFT' => 'Draft / مسودة',
            'SUBMITTED' => 'Submitted / تم التقديم',
            'UNDER_REVIEW' => 'Under Review / قيد المراجعة',
            'PENDING_DOCUMENTS' => 'Pending Documents / بانتظار مستندات',
            'PENDING_PAYMENT' => 'Pending Payment / بانتظار الدفع',
            'PENDING_APPROVAL' => 'Pending Approval / بانتظار الموافقة',
            'APPROVED' => 'Approved / موافق عليه',
            'PARTIALLY_APPROVED' => 'Partially Approved / موافق جزئياً',
            'REJECTED' => 'Rejected / مرفوض',
            'CANCELLED' => 'Cancelled / ملغي',
            'COMPLETED' => 'Completed / مكتمل',
            'ON_HOLD' => 'On Hold / موقوف',
            default => $this->status,
        };
    }

    public function getPriorityLabelAttribute(): string
    {
        return match ($this->priority) {
            'LOW' => 'Low / منخفض',
            'NORMAL' => 'Normal / عادي',
            'HIGH' => 'High / عالي',
            'URGENT' => 'Urgent / عاجل',
            default => $this->priority,
        };
    }

    // Status Checks
    public function isPending(): bool
    {
        return in_array($this->status, [
            'SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS',
            'PENDING_PAYMENT', 'PENDING_APPROVAL', 'ON_HOLD'
        ]);
    }

    public function isApproved(): bool
    {
        return in_array($this->status, ['APPROVED', 'PARTIALLY_APPROVED', 'COMPLETED']);
    }

    public function isRejected(): bool
    {
        return $this->status === 'REJECTED';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'CANCELLED';
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, ['DRAFT', 'PENDING_DOCUMENTS']);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW']);
    }

    public function requiresPayment(): bool
    {
        return $this->has_fee && !$this->fee_paid;
    }

    public function getCurrentApprovalLevel(): string
    {
        if ($this->dean_decision) {
            return 'COMPLETED';
        }
        if ($this->department_decision) {
            return 'DEAN';
        }
        if ($this->advisor_decision) {
            return 'DEPARTMENT';
        }
        return 'ADVISOR';
    }

    // Actions
    public function logAction(int $userId, string $action, ?string $fromStatus, string $toStatus, ?string $notes = null, ?array $changes = null): StudentRequestLog
    {
        return $this->logs()->create([
            'user_id' => $userId,
            'action' => $action,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'notes' => $notes,
            'changes' => $changes,
        ]);
    }

    public function addComment(int $userId, string $comment, bool $isInternal = false, ?array $attachments = null): StudentRequestComment
    {
        return $this->comments()->create([
            'user_id' => $userId,
            'comment' => $comment,
            'is_internal' => $isInternal,
            'is_from_student' => $this->student->user_id === $userId,
            'attachments' => $attachments,
        ]);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->whereIn('status', [
            'SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS',
            'PENDING_PAYMENT', 'PENDING_APPROVAL', 'ON_HOLD'
        ]);
    }

    public function scopeApproved($query)
    {
        return $query->whereIn('status', ['APPROVED', 'PARTIALLY_APPROVED', 'COMPLETED']);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'REJECTED');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('request_type', $type);
    }

    public function scopeUrgent($query)
    {
        return $query->where(function ($q) {
            $q->where('priority', 'URGENT')
                ->orWhere('is_urgent', true);
        });
    }

    public function scopeOverdue($query)
    {
        return $query->where('deadline', '<', now())
            ->pending();
    }

    public function scopeForSemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    public function scopeNeedingAttention($query)
    {
        return $query->pending()
            ->where(function ($q) {
                $q->where('days_pending', '>', 3)
                    ->orWhere('priority', 'URGENT')
                    ->orWhere('deadline', '<', now()->addDays(2));
            });
    }
}

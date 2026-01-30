<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GraduationApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'semester_id',
        'application_date',
        'graduation_term',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'approved_by',
        'approved_at',
        'approval_notes',
        'rejection_reason',
        'missing_requirements',
        'graduation_date',
        'graduation_ceremony',
        'diploma_number',
        'final_gpa',
        'honors',
        'class_rank',
        'total_graduates',
        'transcript_issued',
        'diploma_issued',
        'certificate_issued',
        'documents_issued',
    ];

    protected function casts(): array
    {
        return [
            'application_date' => 'date',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
            'graduation_date' => 'date',
            'final_gpa' => 'decimal:2',
            'transcript_issued' => 'boolean',
            'diploma_issued' => 'boolean',
            'certificate_issued' => 'boolean',
            'missing_requirements' => 'array',
            'documents_issued' => 'array',
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

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'SUBMITTED' => 'Submitted / تم التقديم',
            'UNDER_REVIEW' => 'Under Review / قيد المراجعة',
            'PENDING_DOCUMENTS' => 'Pending Documents / بانتظار مستندات',
            'PENDING_FEES' => 'Pending Fees / بانتظار رسوم',
            'APPROVED' => 'Approved / موافق عليه',
            'REJECTED' => 'Rejected / مرفوض',
            'GRADUATED' => 'Graduated / تخرّج',
            'CANCELLED' => 'Cancelled / ملغي',
            default => $this->status,
        };
    }

    public function getHonorsLabelAttribute(): ?string
    {
        if (!$this->honors) {
            return null;
        }

        return match ($this->honors) {
            'EXCELLENT' => 'Excellent with Honors / امتياز مع مرتبة الشرف',
            'EXCELLENT' => 'Excellent / امتياز',
            'VERY_GOOD' => 'Very Good / جيد جداً',
            'GOOD' => 'Good / جيد',
            'PASS' => 'Pass / مقبول',
            default => $this->honors,
        };
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'PENDING_FEES']);
    }

    public function isApproved(): bool
    {
        return in_array($this->status, ['APPROVED', 'GRADUATED']);
    }

    public function isRejected(): bool
    {
        return $this->status === 'REJECTED';
    }

    public function isGraduated(): bool
    {
        return $this->status === 'GRADUATED';
    }

    public function hasAllDocumentsIssued(): bool
    {
        return $this->transcript_issued && $this->diploma_issued && $this->certificate_issued;
    }

    public function getRankPercentileAttribute(): ?float
    {
        if ($this->class_rank && $this->total_graduates) {
            return round((1 - ($this->class_rank / $this->total_graduates)) * 100, 1);
        }
        return null;
    }

    // Scopes
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'SUBMITTED');
    }

    public function scopeUnderReview($query)
    {
        return $query->where('status', 'UNDER_REVIEW');
    }

    public function scopePendingDocuments($query)
    {
        return $query->where('status', 'PENDING_DOCUMENTS');
    }

    public function scopePendingFees($query)
    {
        return $query->where('status', 'PENDING_FEES');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'APPROVED');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'REJECTED');
    }

    public function scopeGraduated($query)
    {
        return $query->where('status', 'GRADUATED');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'PENDING_FEES']);
    }

    public function scopeForSemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    public function scopeForTerm($query, string $term)
    {
        return $query->where('graduation_term', $term);
    }

    public function scopeWithHonors($query)
    {
        return $query->whereIn('honors', ['EXCELLENT', 'EXCELLENT_HONORS']);
    }
}

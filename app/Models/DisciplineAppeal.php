<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DisciplineAppeal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'incident_id',
        'action_id',
        'student_id',
        'submitted_by',
        'appeal_number',
        'appeal_type',
        'reason',
        'reason_ar',
        'supporting_documents',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'review_notes_ar',
        'decision',
        'decision_ar',
        'points_reduced',
        'action_modified',
        'modified_action_details',
        'submission_deadline',
        'submitted_on_time',
    ];

    protected function casts(): array
    {
        return [
            'supporting_documents' => 'array',
            'reviewed_at' => 'datetime',
            'submission_deadline' => 'date',
            'submitted_on_time' => 'boolean',
            'action_modified' => 'boolean',
        ];
    }

    // ==========================================
    // Relationships
    // ==========================================

    public function incident(): BelongsTo
    {
        return $this->belongsTo(DisciplineIncident::class, 'incident_id');
    }

    public function action(): BelongsTo
    {
        return $this->belongsTo(DisciplineAction::class, 'action_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['SUBMITTED', 'UNDER_REVIEW']);
    }

    public function scopeResolved($query)
    {
        return $query->whereIn('status', ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'WITHDRAWN']);
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getAppealTypeDisplayAttribute(): string
    {
        return match ($this->appeal_type) {
            'INCIDENT_DISPUTE' => 'Dispute Incident',
            'ACTION_REDUCTION' => 'Reduce Action',
            'POINTS_REDUCTION' => 'Reduce Points',
            'FULL_DISMISSAL' => 'Full Dismissal',
            default => $this->appeal_type,
        };
    }

    public function getAppealTypeDisplayArAttribute(): string
    {
        return match ($this->appeal_type) {
            'INCIDENT_DISPUTE' => 'نزاع على المخالفة',
            'ACTION_REDUCTION' => 'تخفيف الإجراء',
            'POINTS_REDUCTION' => 'تخفيف النقاط',
            'FULL_DISMISSAL' => 'إلغاء كامل',
            default => $this->appeal_type,
        };
    }

    public function getStatusDisplayAttribute(): string
    {
        return match ($this->status) {
            'SUBMITTED' => 'Submitted',
            'UNDER_REVIEW' => 'Under Review',
            'APPROVED' => 'Approved',
            'PARTIALLY_APPROVED' => 'Partially Approved',
            'REJECTED' => 'Rejected',
            'WITHDRAWN' => 'Withdrawn',
            default => $this->status,
        };
    }

    public function getStatusDisplayArAttribute(): string
    {
        return match ($this->status) {
            'SUBMITTED' => 'تم التقديم',
            'UNDER_REVIEW' => 'قيد المراجعة',
            'APPROVED' => 'موافق عليه',
            'PARTIALLY_APPROVED' => 'موافق عليه جزئياً',
            'REJECTED' => 'مرفوض',
            'WITHDRAWN' => 'تم السحب',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'SUBMITTED' => 'blue',
            'UNDER_REVIEW' => 'yellow',
            'APPROVED' => 'green',
            'PARTIALLY_APPROVED' => 'lime',
            'REJECTED' => 'red',
            'WITHDRAWN' => 'gray',
            default => 'gray',
        };
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    public static function generateAppealNumber(): string
    {
        $year = date('Y');
        $count = self::whereYear('created_at', $year)->count() + 1;
        return sprintf('APL-%s-%04d', $year, $count);
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['SUBMITTED', 'UNDER_REVIEW']);
    }

    public function isResolved(): bool
    {
        return in_array($this->status, ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'WITHDRAWN']);
    }

    public function approve(int $reviewerId, string $decision, int $pointsReduced = 0, string $notes = null): void
    {
        $this->update([
            'status' => 'APPROVED',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'decision' => $decision,
            'review_notes' => $notes,
            'points_reduced' => $pointsReduced,
        ]);

        // Update incident status
        if ($this->incident) {
            $this->incident->update(['status' => 'APPEALED']);
        }

        // Reduce points if applicable
        if ($pointsReduced > 0) {
            $points = DisciplinePoints::getOrCreateForStudent($this->student_id);
            $points->reducePoints($pointsReduced, "Appeal #{$this->appeal_number} approved");
        }
    }

    public function partiallyApprove(int $reviewerId, string $decision, int $pointsReduced = 0, bool $actionModified = false, string $modifiedDetails = null, string $notes = null): void
    {
        $this->update([
            'status' => 'PARTIALLY_APPROVED',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'decision' => $decision,
            'review_notes' => $notes,
            'points_reduced' => $pointsReduced,
            'action_modified' => $actionModified,
            'modified_action_details' => $modifiedDetails,
        ]);

        if ($pointsReduced > 0) {
            $points = DisciplinePoints::getOrCreateForStudent($this->student_id);
            $points->reducePoints($pointsReduced, "Appeal #{$this->appeal_number} partially approved");
        }
    }

    public function reject(int $reviewerId, string $decision, string $notes = null): void
    {
        $this->update([
            'status' => 'REJECTED',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'decision' => $decision,
            'review_notes' => $notes,
        ]);
    }

    public function withdraw(): void
    {
        $this->update(['status' => 'WITHDRAWN']);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($appeal) {
            if (empty($appeal->appeal_number)) {
                $appeal->appeal_number = self::generateAppealNumber();
            }

            // Check if submitted on time
            if ($appeal->submission_deadline && now()->gt($appeal->submission_deadline)) {
                $appeal->submitted_on_time = false;
            }
        });
    }
}

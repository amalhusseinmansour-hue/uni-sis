<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DisciplineAction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'incident_id',
        'student_id',
        'assigned_by',
        'action_type',
        'action_type_other',
        'action_date',
        'start_date',
        'end_date',
        'duration_days',
        'description',
        'description_ar',
        'status',
        'completion_notes',
        'completed_at',
        'completed_by',
        'guardian_acknowledged',
        'guardian_acknowledged_at',
        'guardian_signature',
        'is_appealable',
        'appeal_deadline',
    ];

    protected function casts(): array
    {
        return [
            'action_date' => 'date',
            'start_date' => 'date',
            'end_date' => 'date',
            'appeal_deadline' => 'date',
            'completed_at' => 'datetime',
            'guardian_acknowledged_at' => 'datetime',
            'guardian_acknowledged' => 'boolean',
            'is_appealable' => 'boolean',
        ];
    }

    // ==========================================
    // Relationships
    // ==========================================

    public function incident(): BelongsTo
    {
        return $this->belongsTo(DisciplineIncident::class, 'incident_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function appeals(): HasMany
    {
        return $this->hasMany(DisciplineAppeal::class, 'action_id');
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

    public function scopeByType($query, $type)
    {
        return $query->where('action_type', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    public function scopeCurrentlyInEffect($query)
    {
        return $query->where('status', 'ACTIVE')
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getActionTypeDisplayAttribute(): string
    {
        return match ($this->action_type) {
            'VERBAL_WARNING' => 'Verbal Warning',
            'WRITTEN_WARNING' => 'Written Warning',
            'PARENT_CONFERENCE' => 'Parent Conference',
            'DETENTION' => 'Detention',
            'COMMUNITY_SERVICE' => 'Community Service',
            'SUSPENSION' => 'Suspension',
            'PROBATION' => 'Probation',
            'RESTRICTION' => 'Restriction',
            'COUNSELING' => 'Counseling',
            'EXPULSION' => 'Expulsion',
            'OTHER' => $this->action_type_other ?? 'Other',
            default => $this->action_type,
        };
    }

    public function getActionTypeDisplayArAttribute(): string
    {
        return match ($this->action_type) {
            'VERBAL_WARNING' => 'إنذار شفهي',
            'WRITTEN_WARNING' => 'إنذار كتابي',
            'PARENT_CONFERENCE' => 'اجتماع ولي الأمر',
            'DETENTION' => 'احتجاز',
            'COMMUNITY_SERVICE' => 'خدمة مجتمعية',
            'SUSPENSION' => 'إيقاف',
            'PROBATION' => 'مراقبة',
            'RESTRICTION' => 'تقييد امتيازات',
            'COUNSELING' => 'إرشاد',
            'EXPULSION' => 'فصل',
            'OTHER' => $this->action_type_other ?? 'أخرى',
            default => $this->action_type,
        };
    }

    public function getStatusDisplayAttribute(): string
    {
        return match ($this->status) {
            'PENDING' => 'Pending',
            'ACTIVE' => 'Active',
            'COMPLETED' => 'Completed',
            'CANCELLED' => 'Cancelled',
            default => $this->status,
        };
    }

    public function getStatusDisplayArAttribute(): string
    {
        return match ($this->status) {
            'PENDING' => 'قيد الانتظار',
            'ACTIVE' => 'نشط',
            'COMPLETED' => 'مكتمل',
            'CANCELLED' => 'ملغي',
            default => $this->status,
        };
    }

    public function getRemainingDaysAttribute(): ?int
    {
        if (!$this->end_date || $this->status !== 'ACTIVE') {
            return null;
        }
        return max(0, now()->diffInDays($this->end_date, false));
    }

    public function getIsExpiredAttribute(): bool
    {
        if (!$this->end_date) {
            return false;
        }
        return $this->end_date->isPast();
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    public function canBeAppealed(): bool
    {
        if (!$this->is_appealable) {
            return false;
        }
        if ($this->appeal_deadline && $this->appeal_deadline->isPast()) {
            return false;
        }
        return in_array($this->status, ['PENDING', 'ACTIVE']);
    }

    public function markAsCompleted(?int $completedBy = null, ?string $notes = null): void
    {
        $this->update([
            'status' => 'COMPLETED',
            'completed_at' => now(),
            'completed_by' => $completedBy ?? auth()->id(),
            'completion_notes' => $notes,
        ]);
    }

    public function activate(): void
    {
        $this->update(['status' => 'ACTIVE']);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'CANCELLED']);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($action) {
            // Set appeal deadline if not set (14 days from action date)
            if ($action->is_appealable && !$action->appeal_deadline) {
                $action->appeal_deadline = $action->action_date->addDays(14);
            }
        });
    }
}

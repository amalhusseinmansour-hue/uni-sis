<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class MoodleGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'moodle_user_id',
        'moodle_course_id',
        'moodle_grade',
        'moodle_grade_max',
        'completion_status',
        'completed_at',
        'synced_to_sis',
        'received_at',
        'grade_items',
    ];

    protected $casts = [
        'moodle_grade' => 'decimal:2',
        'moodle_grade_max' => 'decimal:2',
        'completed_at' => 'datetime',
        'received_at' => 'datetime',
        'synced_to_sis' => 'boolean',
        'grade_items' => 'array',
        'moodle_user_id' => 'integer',
        'moodle_course_id' => 'integer',
    ];

    // Completion status constants
    const STATUS_IN_PROGRESS = 'IN_PROGRESS';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_FAILED = 'FAILED';

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function moodleUser(): BelongsTo
    {
        return $this->belongsTo(MoodleUser::class, 'moodle_user_id', 'moodle_user_id');
    }

    public function moodleCourse(): BelongsTo
    {
        return $this->belongsTo(MoodleCourse::class, 'moodle_course_id', 'moodle_course_id');
    }

    public function moodleEnrollment(): BelongsTo
    {
        return $this->belongsTo(MoodleEnrollment::class, 'enrollment_id', 'enrollment_id');
    }

    public function syncLogs(): MorphMany
    {
        return $this->morphMany(MoodleSyncLog::class, 'syncable');
    }

    // Scopes
    public function scopePendingSync($query)
    {
        return $query->where('synced_to_sis', false);
    }

    public function scopeSyncedToSis($query)
    {
        return $query->where('synced_to_sis', true);
    }

    public function scopeCompleted($query)
    {
        return $query->where('completion_status', self::STATUS_COMPLETED);
    }

    public function scopeFailed($query)
    {
        return $query->where('completion_status', self::STATUS_FAILED);
    }

    public function scopeInProgress($query)
    {
        return $query->where('completion_status', self::STATUS_IN_PROGRESS);
    }

    // Helper methods
    public function markAsSyncedToSis(): void
    {
        $this->update(['synced_to_sis' => true]);
    }

    public function isCompleted(): bool
    {
        return $this->completion_status === self::STATUS_COMPLETED;
    }

    public function isFailed(): bool
    {
        return $this->completion_status === self::STATUS_FAILED;
    }

    public function needsSisSync(): bool
    {
        return !$this->synced_to_sis;
    }

    // Calculate percentage grade
    public function getPercentageGradeAttribute(): ?float
    {
        if ($this->moodle_grade === null || $this->moodle_grade_max == 0) {
            return null;
        }

        return ($this->moodle_grade / $this->moodle_grade_max) * 100;
    }

    // Get scaled grade (0-100)
    public function getScaledGradeAttribute(): ?float
    {
        return $this->percentage_grade;
    }

    // Map Moodle completion status to SIS enrollment status
    public function getSisEnrollmentStatus(): string
    {
        return match ($this->completion_status) {
            self::STATUS_COMPLETED => 'COMPLETED',
            self::STATUS_FAILED => 'FAILED',
            default => 'ENROLLED',
        };
    }

    // Update from Moodle webhook data
    public static function updateFromMoodle(array $data): self
    {
        return self::updateOrCreate(
            [
                'moodle_user_id' => $data['user_id'],
                'moodle_course_id' => $data['course_id'],
            ],
            [
                'moodle_grade' => $data['grade'] ?? null,
                'moodle_grade_max' => $data['grade_max'] ?? 100,
                'completion_status' => self::mapMoodleStatus($data['status'] ?? 'in_progress'),
                'completed_at' => isset($data['completed_at']) ? now()->parse($data['completed_at']) : null,
                'received_at' => now(),
                'synced_to_sis' => false,
                'grade_items' => $data['grade_items'] ?? null,
            ]
        );
    }

    // Map Moodle status string to our enum
    public static function mapMoodleStatus(string $status): string
    {
        return match (strtolower($status)) {
            'completed', 'complete' => self::STATUS_COMPLETED,
            'failed', 'fail' => self::STATUS_FAILED,
            default => self::STATUS_IN_PROGRESS,
        };
    }
}

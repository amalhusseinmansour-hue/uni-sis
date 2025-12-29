<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class MoodleEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'moodle_user_id',
        'moodle_course_id',
        'role',
        'sync_status',
        'last_synced_at',
        'sync_error',
    ];

    protected $casts = [
        'last_synced_at' => 'datetime',
        'moodle_user_id' => 'integer',
        'moodle_course_id' => 'integer',
    ];

    // Sync status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_SYNCED = 'SYNCED';
    const STATUS_FAILED = 'FAILED';
    const STATUS_UNENROLLED = 'UNENROLLED';

    // Role constants
    const ROLE_STUDENT = 'student';
    const ROLE_TEACHER = 'editingteacher';

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

    public function moodleGrade(): HasOne
    {
        return $this->hasOne(MoodleGrade::class, 'enrollment_id', 'enrollment_id');
    }

    public function syncLogs(): MorphMany
    {
        return $this->morphMany(MoodleSyncLog::class, 'syncable');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('sync_status', self::STATUS_PENDING);
    }

    public function scopeSynced($query)
    {
        return $query->where('sync_status', self::STATUS_SYNCED);
    }

    public function scopeFailed($query)
    {
        return $query->where('sync_status', self::STATUS_FAILED);
    }

    public function scopeUnenrolled($query)
    {
        return $query->where('sync_status', self::STATUS_UNENROLLED);
    }

    public function scopeStudents($query)
    {
        return $query->where('role', self::ROLE_STUDENT);
    }

    public function scopeTeachers($query)
    {
        return $query->where('role', self::ROLE_TEACHER);
    }

    // Helper methods
    public function markAsSynced(): void
    {
        $this->update([
            'sync_status' => self::STATUS_SYNCED,
            'last_synced_at' => now(),
            'sync_error' => null,
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'sync_status' => self::STATUS_FAILED,
            'sync_error' => $error,
        ]);
    }

    public function markAsUnenrolled(): void
    {
        $this->update([
            'sync_status' => self::STATUS_UNENROLLED,
            'last_synced_at' => now(),
        ]);
    }

    public function isSynced(): bool
    {
        return $this->sync_status === self::STATUS_SYNCED;
    }

    public function isUnenrolled(): bool
    {
        return $this->sync_status === self::STATUS_UNENROLLED;
    }

    public function needsSync(): bool
    {
        return in_array($this->sync_status, [self::STATUS_PENDING, self::STATUS_FAILED]);
    }
}

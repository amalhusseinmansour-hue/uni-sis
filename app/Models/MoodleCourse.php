<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class MoodleCourse extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'moodle_course_id',
        'shortname',
        'category_id',
        'sync_status',
        'last_synced_at',
        'sync_error',
    ];

    protected $casts = [
        'last_synced_at' => 'datetime',
        'moodle_course_id' => 'integer',
        'category_id' => 'integer',
    ];

    // Sync status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_SYNCED = 'SYNCED';
    const STATUS_FAILED = 'FAILED';

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(MoodleEnrollment::class, 'moodle_course_id', 'moodle_course_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(MoodleGrade::class, 'moodle_course_id', 'moodle_course_id');
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

    // Helper methods
    public function markAsSynced(int $moodleCourseId, ?int $categoryId = null): void
    {
        $this->update([
            'moodle_course_id' => $moodleCourseId,
            'category_id' => $categoryId ?? $this->category_id,
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

    public function isSynced(): bool
    {
        return $this->sync_status === self::STATUS_SYNCED;
    }

    public function needsSync(): bool
    {
        return in_array($this->sync_status, [self::STATUS_PENDING, self::STATUS_FAILED]);
    }

    // Generate Moodle shortname from course
    public static function generateShortname(Course $course): string
    {
        return $course->code ?? 'COURSE-' . $course->id;
    }
}

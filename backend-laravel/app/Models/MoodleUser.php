<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class MoodleUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_type',
        'student_id',
        'user_id',
        'moodle_user_id',
        'username',
        'sync_status',
        'last_synced_at',
        'sync_error',
    ];

    protected $casts = [
        'last_synced_at' => 'datetime',
        'moodle_user_id' => 'integer',
    ];

    // Sync status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_SYNCED = 'SYNCED';
    const STATUS_FAILED = 'FAILED';
    const STATUS_UPDATED = 'UPDATED';

    // User type constants
    const TYPE_STUDENT = 'STUDENT';
    const TYPE_LECTURER = 'LECTURER';

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(MoodleEnrollment::class, 'moodle_user_id', 'moodle_user_id');
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

    public function scopeStudents($query)
    {
        return $query->where('user_type', self::TYPE_STUDENT);
    }

    public function scopeLecturers($query)
    {
        return $query->where('user_type', self::TYPE_LECTURER);
    }

    // Helper methods
    public function markAsSynced(int $moodleUserId): void
    {
        $this->update([
            'moodle_user_id' => $moodleUserId,
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

    public function markAsUpdated(): void
    {
        $this->update([
            'sync_status' => self::STATUS_UPDATED,
        ]);
    }

    public function isSynced(): bool
    {
        return $this->sync_status === self::STATUS_SYNCED;
    }

    public function needsSync(): bool
    {
        return in_array($this->sync_status, [self::STATUS_PENDING, self::STATUS_UPDATED, self::STATUS_FAILED]);
    }

    // Get the related entity (Student or User)
    public function getRelatedEntity(): Student|User|null
    {
        return $this->user_type === self::TYPE_STUDENT
            ? $this->student
            : $this->user;
    }

    // Get Moodle role based on user type
    public function getMoodleRole(): string
    {
        return $this->user_type === self::TYPE_STUDENT ? 'student' : 'editingteacher';
    }
}

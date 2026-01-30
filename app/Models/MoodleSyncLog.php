<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MoodleSyncLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'sync_type',
        'direction',
        'syncable_type',
        'syncable_id',
        'status',
        'request_data',
        'response_data',
        'error_message',
        'retry_count',
        'synced_at',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'synced_at' => 'datetime',
        'retry_count' => 'integer',
    ];

    // Sync type constants
    const TYPE_USER = 'USER';
    const TYPE_COURSE = 'COURSE';
    const TYPE_ENROLLMENT = 'ENROLLMENT';
    const TYPE_GRADE = 'GRADE';

    // Direction constants
    const DIRECTION_TO_MOODLE = 'TO_MOODLE';
    const DIRECTION_FROM_MOODLE = 'FROM_MOODLE';

    // Status constants
    const STATUS_SUCCESS = 'SUCCESS';
    const STATUS_FAILED = 'FAILED';

    public function syncable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function scopeToMoodle($query)
    {
        return $query->where('direction', self::DIRECTION_TO_MOODLE);
    }

    public function scopeFromMoodle($query)
    {
        return $query->where('direction', self::DIRECTION_FROM_MOODLE);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('sync_type', $type);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('synced_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public static function logSuccess(
        Model $syncable,
        string $syncType,
        string $direction,
        ?array $requestData = null,
        ?array $responseData = null
    ): self {
        return self::create([
            'syncable_type' => get_class($syncable),
            'syncable_id' => $syncable->id,
            'sync_type' => $syncType,
            'direction' => $direction,
            'status' => self::STATUS_SUCCESS,
            'request_data' => $requestData,
            'response_data' => $responseData,
            'synced_at' => now(),
        ]);
    }

    public static function logFailure(
        Model $syncable,
        string $syncType,
        string $direction,
        string $errorMessage,
        ?array $requestData = null,
        ?array $responseData = null,
        int $retryCount = 0
    ): self {
        return self::create([
            'syncable_type' => get_class($syncable),
            'syncable_id' => $syncable->id,
            'sync_type' => $syncType,
            'direction' => $direction,
            'status' => self::STATUS_FAILED,
            'request_data' => $requestData,
            'response_data' => $responseData,
            'error_message' => $errorMessage,
            'retry_count' => $retryCount,
            'synced_at' => now(),
        ]);
    }

    public function isSuccessful(): bool
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }
}

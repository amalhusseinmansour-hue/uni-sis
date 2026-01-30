<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicReportLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'dynamic_report_id',
        'user_id',
        'schedule_id',
        'parameters',
        'row_count',
        'execution_time',
        'export_format',
        'file_path',
        'file_size',
        'status',
        'error_message',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'parameters' => 'array',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function dynamicReport(): BelongsTo
    {
        return $this->belongsTo(DynamicReport::class, 'dynamic_report_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(DynamicReportSchedule::class, 'schedule_id');
    }

    public function scopeByReport($query, $reportId)
    {
        return $query->where('dynamic_report_id', $reportId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public static function logGeneration(
        int $reportId,
        ?int $userId,
        array $parameters,
        int $rowCount,
        int $executionTime,
        string $status = 'completed',
        ?string $errorMessage = null,
        ?string $exportFormat = null,
        ?string $filePath = null,
        ?int $fileSize = null,
        ?int $scheduleId = null
    ): self {
        return self::create([
            'dynamic_report_id' => $reportId,
            'user_id' => $userId,
            'schedule_id' => $scheduleId,
            'parameters' => $parameters,
            'row_count' => $rowCount,
            'execution_time' => $executionTime,
            'export_format' => $exportFormat,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'status' => $status,
            'error_message' => $errorMessage,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public static function getReportStats(int $reportId, int $days = 30): array
    {
        $logs = self::byReport($reportId)->recent($days)->get();

        return [
            'total_runs' => $logs->count(),
            'successful_runs' => $logs->where('status', 'completed')->count(),
            'failed_runs' => $logs->where('status', 'failed')->count(),
            'avg_execution_time' => round($logs->avg('execution_time')),
            'avg_row_count' => round($logs->avg('row_count')),
            'total_exports' => $logs->whereNotNull('export_format')->count(),
            'most_used_format' => $logs->whereNotNull('export_format')
                ->groupBy('export_format')
                ->map->count()
                ->sortDesc()
                ->keys()
                ->first(),
        ];
    }

    public static function getUserActivity(int $userId, int $days = 30): array
    {
        $logs = self::byUser($userId)->recent($days)
            ->with('report:id,name_en,name_ar')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return $logs->map(function ($log) {
            return [
                'report_id' => $log->report_id,
                'report_name' => $log->report?->name,
                'parameters' => $log->parameters,
                'row_count' => $log->row_count,
                'execution_time' => $log->execution_time,
                'status' => $log->status,
                'created_at' => $log->created_at->toIso8601String(),
            ];
        })->toArray();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Lecture extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'lecturer_id',
        'semester_id',
        'title_en',
        'title_ar',
        'description_en',
        'description_ar',
        'lecture_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'room',
        'building',
        'type',
        'mode',
        'online_meeting_url',
        'online_meeting_id',
        'online_meeting_password',
        'recording_url',
        'status',
        'cancellation_reason',
        'rescheduled_to',
        'topics_covered',
        'notes',
        'homework_assigned',
        'lecture_number',
        'week_number',
        'expected_students',
        'actual_attendance',
    ];

    protected function casts(): array
    {
        return [
            'lecture_date' => 'date',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'rescheduled_to' => 'date',
            'duration_minutes' => 'integer',
            'lecture_number' => 'integer',
            'week_number' => 'integer',
            'expected_students' => 'integer',
            'actual_attendance' => 'integer',
        ];
    }

    // ==========================================
    // العلاقات
    // ==========================================

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(LectureMaterial::class)->orderBy('order');
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(LectureAttendance::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(LectureComment::class)->whereNull('parent_id')->orderByDesc('is_pinned')->orderByDesc('created_at');
    }

    public function allComments(): HasMany
    {
        return $this->hasMany(LectureComment::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(LectureRating::class);
    }

    // ==========================================
    // الخصائص المحسوبة (Accessors)
    // ==========================================

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->title_ar : $this->title_en;
    }

    public function getDescriptionAttribute(): ?string
    {
        return app()->getLocale() === 'ar' ? $this->description_ar : $this->description_en;
    }

    public function getFormattedDateAttribute(): string
    {
        return $this->lecture_date->format('Y-m-d');
    }

    public function getFormattedTimeAttribute(): string
    {
        return Carbon::parse($this->start_time)->format('H:i') . ' - ' . Carbon::parse($this->end_time)->format('H:i');
    }

    public function getLocationAttribute(): string
    {
        $parts = [];
        if ($this->building) $parts[] = $this->building;
        if ($this->room) $parts[] = $this->room;
        return implode(' - ', $parts) ?: 'TBD';
    }

    public function getAttendanceRateAttribute(): float
    {
        if (!$this->expected_students || $this->expected_students === 0) {
            return 0;
        }
        return round(($this->actual_attendance / $this->expected_students) * 100, 2);
    }

    public function getAverageRatingAttribute(): ?float
    {
        $avg = $this->ratings()->avg('overall_rating');
        return $avg ? round($avg, 2) : null;
    }

    public function getRatingsCountAttribute(): int
    {
        return $this->ratings()->count();
    }

    public function getIsOnlineAttribute(): bool
    {
        return in_array($this->mode, ['ONLINE', 'HYBRID']);
    }

    public function getIsUpcomingAttribute(): bool
    {
        return $this->lecture_date->isFuture() ||
               ($this->lecture_date->isToday() && Carbon::parse($this->start_time)->isFuture());
    }

    public function getIsInProgressAttribute(): bool
    {
        if (!$this->lecture_date->isToday()) {
            return false;
        }
        $now = Carbon::now();
        $start = Carbon::parse($this->start_time);
        $end = Carbon::parse($this->end_time);
        return $now->between($start, $end);
    }

    public function getIsPastAttribute(): bool
    {
        return $this->lecture_date->isPast() ||
               ($this->lecture_date->isToday() && Carbon::parse($this->end_time)->isPast());
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeForLecturer($query, int $lecturerId)
    {
        return $query->where('lecturer_id', $lecturerId);
    }

    public function scopeForSemester($query, int $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('lecture_date', '>=', now()->toDateString())
                    ->where('status', '!=', 'CANCELLED')
                    ->orderBy('lecture_date')
                    ->orderBy('start_time');
    }

    public function scopePast($query)
    {
        return $query->where('lecture_date', '<', now()->toDateString())
                    ->orWhere(function ($q) {
                        $q->where('lecture_date', now()->toDateString())
                          ->whereTime('end_time', '<', now()->format('H:i:s'));
                    })
                    ->orderByDesc('lecture_date')
                    ->orderByDesc('start_time');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('lecture_date', now()->toDateString())
                    ->orderBy('start_time');
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('lecture_date', [
            now()->startOfWeek()->toDateString(),
            now()->endOfWeek()->toDateString()
        ])->orderBy('lecture_date')->orderBy('start_time');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByMode($query, string $mode)
    {
        return $query->where('mode', $mode);
    }

    // ==========================================
    // الدوال المساعدة
    // ==========================================

    /**
     * تحديث حالة المحاضرة تلقائياً
     */
    public function updateStatusAutomatically(): void
    {
        if ($this->status === 'CANCELLED') {
            return;
        }

        if ($this->is_in_progress && $this->status !== 'IN_PROGRESS') {
            $this->update(['status' => 'IN_PROGRESS']);
        } elseif ($this->is_past && $this->status === 'SCHEDULED') {
            $this->update(['status' => 'COMPLETED']);
        }
    }

    /**
     * حساب نسبة الحضور الفعلية
     */
    public function calculateAttendance(): void
    {
        $present = $this->attendance()
            ->whereIn('status', ['PRESENT', 'LATE'])
            ->count();

        $this->update(['actual_attendance' => $present]);
    }

    /**
     * إلغاء المحاضرة
     */
    public function cancel(string $reason = null): bool
    {
        return $this->update([
            'status' => 'CANCELLED',
            'cancellation_reason' => $reason
        ]);
    }

    /**
     * تأجيل المحاضرة
     */
    public function postpone(string $newDate, string $reason = null): bool
    {
        return $this->update([
            'status' => 'POSTPONED',
            'rescheduled_to' => $newDate,
            'cancellation_reason' => $reason
        ]);
    }

    /**
     * بدء المحاضرة
     */
    public function start(): bool
    {
        return $this->update(['status' => 'IN_PROGRESS']);
    }

    /**
     * إنهاء المحاضرة
     */
    public function complete(string $topicsCovered = null, string $notes = null): bool
    {
        $data = ['status' => 'COMPLETED'];
        if ($topicsCovered) $data['topics_covered'] = $topicsCovered;
        if ($notes) $data['notes'] = $notes;

        return $this->update($data);
    }

    /**
     * التحقق من إمكانية تعديل المحاضرة
     */
    public function canBeEdited(): bool
    {
        return !in_array($this->status, ['COMPLETED', 'CANCELLED']);
    }

    /**
     * التحقق من إمكانية تسجيل الحضور
     */
    public function canRecordAttendance(): bool
    {
        return in_array($this->status, ['SCHEDULED', 'IN_PROGRESS']) &&
               ($this->lecture_date->isToday() || $this->lecture_date->isPast());
    }

    /**
     * الحصول على إحصائيات الحضور
     */
    public function getAttendanceStats(): array
    {
        $stats = $this->attendance()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'present' => $stats['PRESENT'] ?? 0,
            'absent' => $stats['ABSENT'] ?? 0,
            'late' => $stats['LATE'] ?? 0,
            'excused' => $stats['EXCUSED'] ?? 0,
            'left_early' => $stats['LEFT_EARLY'] ?? 0,
            'total' => array_sum($stats),
        ];
    }

    /**
     * إنشاء محاضرات متكررة
     */
    public static function createRecurring(array $baseData, array $dates): array
    {
        $lectures = [];
        $number = 1;

        foreach ($dates as $date) {
            $data = array_merge($baseData, [
                'lecture_date' => $date,
                'lecture_number' => $number++,
            ]);
            $lectures[] = self::create($data);
        }

        return $lectures;
    }

    /**
     * نسخ المحاضرة لتاريخ جديد
     */
    public function duplicate(string $newDate): self
    {
        $data = $this->toArray();
        unset($data['id'], $data['created_at'], $data['updated_at']);

        $data['lecture_date'] = $newDate;
        $data['status'] = 'SCHEDULED';
        $data['actual_attendance'] = 0;

        return self::create($data);
    }
}

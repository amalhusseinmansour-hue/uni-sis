<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class LectureAttendance extends Model
{
    use HasFactory;

    protected $table = 'lecture_attendance';

    protected $fillable = [
        'lecture_id',
        'student_id',
        'enrollment_id',
        'recorded_by',
        'status',
        'check_in_time',
        'check_out_time',
        'minutes_late',
        'minutes_present',
        'ip_address',
        'device_info',
        'verified_by_qr',
        'verified_by_location',
        'notes',
        'excuse_reason',
        'excuse_document_path',
    ];

    protected function casts(): array
    {
        return [
            'check_in_time' => 'datetime',
            'check_out_time' => 'datetime',
            'minutes_late' => 'integer',
            'minutes_present' => 'integer',
            'verified_by_qr' => 'boolean',
            'verified_by_location' => 'boolean',
        ];
    }

    // ==========================================
    // العلاقات
    // ==========================================

    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'PRESENT' => 'حاضر',
            'ABSENT' => 'غائب',
            'LATE' => 'متأخر',
            'EXCUSED' => 'غياب بعذر',
            'LEFT_EARLY' => 'انصرف مبكراً',
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'PRESENT' => 'green',
            'ABSENT' => 'red',
            'LATE' => 'yellow',
            'EXCUSED' => 'blue',
            'LEFT_EARLY' => 'orange',
            default => 'gray',
        };
    }

    public function getIsVerifiedAttribute(): bool
    {
        return $this->verified_by_qr || $this->verified_by_location;
    }

    public function getDurationAttribute(): ?string
    {
        if (!$this->check_in_time || !$this->check_out_time) {
            return null;
        }

        $diff = $this->check_in_time->diff($this->check_out_time);
        return $diff->format('%H:%I');
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopePresent($query)
    {
        return $query->where('status', 'PRESENT');
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', 'ABSENT');
    }

    public function scopeLate($query)
    {
        return $query->where('status', 'LATE');
    }

    public function scopeExcused($query)
    {
        return $query->where('status', 'EXCUSED');
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForLecture($query, int $lectureId)
    {
        return $query->where('lecture_id', $lectureId);
    }

    // ==========================================
    // الدوال المساعدة
    // ==========================================

    /**
     * تسجيل الحضور
     */
    public function checkIn(bool $verifiedByQr = false, bool $verifiedByLocation = false): bool
    {
        $lecture = $this->lecture;
        $now = Carbon::now();
        $lectureStart = Carbon::parse($lecture->start_time);

        $minutesLate = 0;
        $status = 'PRESENT';

        if ($now->gt($lectureStart)) {
            $minutesLate = $now->diffInMinutes($lectureStart);
            if ($minutesLate > 15) { // أكثر من 15 دقيقة تأخير
                $status = 'LATE';
            }
        }

        return $this->update([
            'status' => $status,
            'check_in_time' => $now,
            'minutes_late' => $minutesLate,
            'verified_by_qr' => $verifiedByQr,
            'verified_by_location' => $verifiedByLocation,
            'ip_address' => request()->ip(),
            'device_info' => request()->userAgent(),
        ]);
    }

    /**
     * تسجيل الانصراف
     */
    public function checkOut(): bool
    {
        $now = Carbon::now();
        $lecture = $this->lecture;
        $lectureEnd = Carbon::parse($lecture->end_time);

        $minutesPresent = null;
        if ($this->check_in_time) {
            $minutesPresent = $this->check_in_time->diffInMinutes($now);
        }

        // إذا انصرف قبل نهاية المحاضرة بأكثر من 10 دقائق
        $status = $this->status;
        if ($now->lt($lectureEnd->subMinutes(10))) {
            $status = 'LEFT_EARLY';
        }

        return $this->update([
            'check_out_time' => $now,
            'minutes_present' => $minutesPresent,
            'status' => $status,
        ]);
    }

    /**
     * تسجيل غياب بعذر
     */
    public function markExcused(string $reason, string $documentPath = null): bool
    {
        return $this->update([
            'status' => 'EXCUSED',
            'excuse_reason' => $reason,
            'excuse_document_path' => $documentPath,
        ]);
    }

    /**
     * إنشاء سجلات حضور لجميع الطلاب المسجلين
     */
    public static function initializeForLecture(Lecture $lecture): int
    {
        $course = $lecture->course;
        $enrollments = $course->enrollments()
            ->where('status', 'ENROLLED')
            ->with('student')
            ->get();

        $created = 0;
        foreach ($enrollments as $enrollment) {
            $exists = self::where('lecture_id', $lecture->id)
                ->where('student_id', $enrollment->student_id)
                ->exists();

            if (!$exists) {
                self::create([
                    'lecture_id' => $lecture->id,
                    'student_id' => $enrollment->student_id,
                    'enrollment_id' => $enrollment->id,
                    'status' => 'ABSENT', // افتراضياً غائب
                ]);
                $created++;
            }
        }

        return $created;
    }

    /**
     * حساب معدل الحضور للطالب في مقرر معين
     */
    public static function getStudentAttendanceRate(int $studentId, int $courseId): float
    {
        $lectureIds = Lecture::where('course_id', $courseId)
            ->where('status', 'COMPLETED')
            ->pluck('id');

        if ($lectureIds->isEmpty()) {
            return 100;
        }

        $totalLectures = $lectureIds->count();
        $presentCount = self::where('student_id', $studentId)
            ->whereIn('lecture_id', $lectureIds)
            ->whereIn('status', ['PRESENT', 'LATE', 'EXCUSED'])
            ->count();

        return round(($presentCount / $totalLectures) * 100, 2);
    }
}

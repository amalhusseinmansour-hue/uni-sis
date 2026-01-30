<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicAdvisingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'advisor_id',
        'semester_id',
        'session_date',
        'session_time',
        'duration_minutes',
        'session_type',
        'purpose',
        'status',
        'topics_discussed',
        'summary',
        'agreements',
        'recommendations',
        'recommend_reduce_load',
        'recommend_tutoring',
        'recommend_counseling',
        'courses_recommended',
        'courses_not_recommended',
        'next_session_date',
        'follow_up_notes',
        'student_acknowledged',
        'acknowledged_at',
        'student_comments',
        'attachments',
        'is_confidential',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
            'session_time' => 'datetime:H:i',
            'next_session_date' => 'date',
            'acknowledged_at' => 'datetime',
            'recommend_reduce_load' => 'boolean',
            'recommend_tutoring' => 'boolean',
            'recommend_counseling' => 'boolean',
            'student_acknowledged' => 'boolean',
            'is_confidential' => 'boolean',
            'courses_recommended' => 'array',
            'courses_not_recommended' => 'array',
            'attachments' => 'array',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function advisor(): BelongsTo
    {
        return $this->belongsTo(Advisor::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function getSessionTypeLabelAttribute(): string
    {
        return match ($this->session_type) {
            'IN_PERSON' => 'In Person / حضوري',
            'ONLINE' => 'Online / أونلاين',
            'PHONE' => 'Phone / هاتفي',
            'EMAIL' => 'Email / بريد إلكتروني',
            'DROP_IN' => 'Drop In / زيارة عفوية',
            'SCHEDULED' => 'Scheduled / مجدولة',
            'GROUP' => 'Group Session / جماعي',
            default => $this->session_type,
        };
    }

    public function getPurposeLabelAttribute(): string
    {
        return match ($this->purpose) {
            'REGISTRATION' => 'Registration / تسجيل',
            'ACADEMIC_PLAN' => 'Academic Plan / خطة دراسية',
            'GRADE_REVIEW' => 'Grade Review / مراجعة درجات',
            'PROBATION' => 'Academic Probation / إنذار أكاديمي',
            'COURSE_SELECTION' => 'Course Selection / اختيار مواد',
            'CAREER' => 'Career Counseling / إرشاد مهني',
            'GRADUATION' => 'Graduation / تخرج',
            'DROP_ADD' => 'Drop/Add / سحب وإضافة',
            'GENERAL' => 'General / عام',
            'FOLLOW_UP' => 'Follow Up / متابعة',
            'COMPLAINT' => 'Complaint / شكوى',
            'OTHER' => 'Other / أخرى',
            default => $this->purpose,
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'SCHEDULED' => 'Scheduled / مجدول',
            'COMPLETED' => 'Completed / مكتمل',
            'CANCELLED' => 'Cancelled / ملغي',
            'NO_SHOW' => 'No Show / لم يحضر',
            'RESCHEDULED' => 'Rescheduled / أعيد جدولته',
            default => $this->status,
        };
    }

    public function getRecommendationsSummaryAttribute(): array
    {
        $recommendations = [];

        if ($this->recommend_reduce_load) {
            $recommendations[] = 'Reduce course load';
        }
        if ($this->recommend_tutoring) {
            $recommendations[] = 'Seek tutoring';
        }
        if ($this->recommend_counseling) {
            $recommendations[] = 'Counseling recommended';
        }

        return $recommendations;
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'COMPLETED');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'SCHEDULED');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'SCHEDULED')
            ->where('session_date', '>=', now()->toDateString());
    }

    public function scopeForSemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    public function scopeByAdvisor($query, $advisorId)
    {
        return $query->where('advisor_id', $advisorId);
    }

    public function scopeByPurpose($query, string $purpose)
    {
        return $query->where('purpose', $purpose);
    }

    public function scopeConfidential($query)
    {
        return $query->where('is_confidential', true);
    }

    public function scopeAcknowledged($query)
    {
        return $query->where('student_acknowledged', true);
    }
}

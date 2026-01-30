<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentStudyPlanCourse extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'study_plan_code',
        'plan_year',
        'plan_semester',
        'course_type',
        'status',
        'semester_id',
        'grade',
        'grade_points',
        'credit_hours',
        'attempt_count',
        'transfer_source',
        'transfer_course_code',
        'exemption_reason',
    ];

    protected function casts(): array
    {
        return [
            'grade_points' => 'decimal:2',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function getCourseTypeLabelAttribute(): string
    {
        return match ($this->course_type) {
            'UNIVERSITY_REQUIRED' => 'University Required / متطلب جامعة إجباري',
            'UNIVERSITY_ELECTIVE' => 'University Elective / متطلب جامعة اختياري',
            'COLLEGE_REQUIRED' => 'College Required / متطلب كلية إجباري',
            'COLLEGE_ELECTIVE' => 'College Elective / متطلب كلية اختياري',
            'MAJOR_REQUIRED' => 'Major Required / متطلب تخصص إجباري',
            'MAJOR_ELECTIVE' => 'Major Elective / متطلب تخصص اختياري',
            'SPECIALIZATION' => 'Specialization / تخصص دقيق',
            'FREE_ELECTIVE' => 'Free Elective / اختياري حر',
            'GRADUATION_PROJECT' => 'Graduation Project / مشروع تخرج',
            'INTERNSHIP' => 'Internship / تدريب ميداني',
            'THESIS' => 'Thesis / رسالة',
            'OTHER' => 'Other / أخرى',
            default => $this->course_type,
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'NOT_TAKEN' => 'Not Taken / لم يدرس',
            'IN_PROGRESS' => 'In Progress / قيد الدراسة',
            'COMPLETED' => 'Completed / مكتمل',
            'FAILED' => 'Failed / راسب',
            'EXEMPT' => 'Exempt / معفى',
            'TRANSFERRED' => 'Transferred / معادل',
            'WITHDRAWN' => 'Withdrawn / منسحب',
            'INCOMPLETE' => 'Incomplete / غير مكتمل',
            default => $this->status,
        };
    }

    public function isCompleted(): bool
    {
        return in_array($this->status, ['COMPLETED', 'EXEMPT', 'TRANSFERRED']);
    }

    public function isInProgress(): bool
    {
        return $this->status === 'IN_PROGRESS';
    }

    public function needsRetake(): bool
    {
        return $this->status === 'FAILED';
    }

    public function isPending(): bool
    {
        return $this->status === 'NOT_TAKEN';
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['COMPLETED', 'EXEMPT', 'TRANSFERRED']);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'IN_PROGRESS');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'NOT_TAKEN');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'FAILED');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('course_type', $type);
    }

    public function scopeRequired($query)
    {
        return $query->whereIn('course_type', [
            'UNIVERSITY_REQUIRED',
            'COLLEGE_REQUIRED',
            'MAJOR_REQUIRED'
        ]);
    }

    public function scopeElective($query)
    {
        return $query->whereIn('course_type', [
            'UNIVERSITY_ELECTIVE',
            'COLLEGE_ELECTIVE',
            'MAJOR_ELECTIVE',
            'FREE_ELECTIVE'
        ]);
    }

    public function scopeForYear($query, int $year)
    {
        return $query->where('plan_year', $year);
    }

    public function scopeForSemester($query, int $semester)
    {
        return $query->where('plan_semester', $semester);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentRequestEquivalency extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_request_form_id',
        'target_course_id',
        'source_course_code',
        'source_course_name_ar',
        'source_course_name_en',
        'source_credits',
        'source_grade',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function requestForm(): BelongsTo
    {
        return $this->belongsTo(StudentRequestForm::class, 'student_request_form_id');
    }

    public function targetCourse(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'target_course_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentRequestCourse extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_request_form_id',
        'course_id',
        'section',
        'reason',
        'status',
        'rejection_reason',
    ];

    public function requestForm(): BelongsTo
    {
        return $this->belongsTo(StudentRequestForm::class, 'student_request_form_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}

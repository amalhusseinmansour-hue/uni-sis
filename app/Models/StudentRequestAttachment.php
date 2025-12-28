<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentRequestAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_request_form_id',
        'attachment_type',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'description',
        'is_verified',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public const ATTACHMENT_TYPES = [
        'INSTRUCTOR_SUPPORT_LETTER' => [
            'name_ar' => 'كتاب من المدرس',
            'name_en' => 'Instructor Support Letter',
        ],
        'DEPARTMENT_SUPPORT_LETTER' => [
            'name_ar' => 'كتاب من القسم',
            'name_en' => 'Department Support Letter',
        ],
        'PAYMENT_RECEIPT' => [
            'name_ar' => 'إيصال دفع',
            'name_en' => 'Payment Receipt',
        ],
        'MEDICAL_REPORT' => [
            'name_ar' => 'تقرير طبي',
            'name_en' => 'Medical Report',
        ],
        'OFFICIAL_DOCUMENT' => [
            'name_ar' => 'وثيقة رسمية',
            'name_en' => 'Official Document',
        ],
        'TRANSCRIPT' => [
            'name_ar' => 'كشف درجات معتمد',
            'name_en' => 'Certified Transcript',
        ],
        'COURSE_DESCRIPTION' => [
            'name_ar' => 'وصف مساقات معتمد',
            'name_en' => 'Certified Course Description',
        ],
        'ID_COPY' => [
            'name_ar' => 'صورة هوية',
            'name_en' => 'ID Copy',
        ],
        'OTHER' => [
            'name_ar' => 'أخرى',
            'name_en' => 'Other',
        ],
    ];

    // Required attachments per request type
    public const REQUIRED_ATTACHMENTS = [
        'EXCEPTIONAL_REGISTRATION' => ['PAYMENT_RECEIPT'],
        'SEMESTER_POSTPONE' => [], // يعتمد على نوع السبب
        'SEMESTER_FREEZE' => [],
        'SEMESTER_WITHDRAWAL' => [],
        'RE_ENROLLMENT' => [],
        'COURSE_EQUIVALENCY' => ['TRANSCRIPT', 'COURSE_DESCRIPTION'],
        'EXAM_RETAKE' => ['MEDICAL_REPORT'], // أو وثيقة رسمية
        'GRADE_REVIEW' => [],
        'MAJOR_CHANGE' => [],
        'STUDY_PLAN_EXTENSION' => [],
    ];

    public function requestForm(): BelongsTo
    {
        return $this->belongsTo(StudentRequestForm::class, 'student_request_form_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}

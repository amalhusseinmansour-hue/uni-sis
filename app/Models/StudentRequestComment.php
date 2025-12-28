<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentRequestComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_request_id',
        'user_id',
        'comment',
        'is_internal',
        'is_from_student',
        'attachments',
    ];

    protected function casts(): array
    {
        return [
            'is_internal' => 'boolean',
            'is_from_student' => 'boolean',
            'attachments' => 'array',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(StudentRequest::class, 'student_request_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublic($query)
    {
        return $query->where('is_internal', false);
    }

    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }

    public function scopeFromStudent($query)
    {
        return $query->where('is_from_student', true);
    }

    public function scopeFromStaff($query)
    {
        return $query->where('is_from_student', false);
    }
}

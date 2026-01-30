<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentRequestApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_request_form_id',
        'step_number',
        'approver_role',
        'approver_title_ar',
        'approver_title_en',
        'approver_id',
        'status',
        'comments',
        'rejection_reason',
        'action_at',
    ];

    protected $casts = [
        'action_at' => 'datetime',
    ];

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_APPROVED = 'APPROVED';
    public const STATUS_REJECTED = 'REJECTED';
    public const STATUS_RETURNED = 'RETURNED';
    public const STATUS_SKIPPED = 'SKIPPED';

    public function requestForm(): BelongsTo
    {
        return $this->belongsTo(StudentRequestForm::class, 'student_request_form_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function approve(int $approverId, ?string $comments = null): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approver_id' => $approverId,
            'comments' => $comments,
            'action_at' => now(),
        ]);
    }

    public function reject(int $approverId, string $reason, ?string $comments = null): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'approver_id' => $approverId,
            'rejection_reason' => $reason,
            'comments' => $comments,
            'action_at' => now(),
        ]);
    }

    public function returnForRevision(int $approverId, string $comments): void
    {
        $this->update([
            'status' => self::STATUS_RETURNED,
            'approver_id' => $approverId,
            'comments' => $comments,
            'action_at' => now(),
        ]);
    }
}

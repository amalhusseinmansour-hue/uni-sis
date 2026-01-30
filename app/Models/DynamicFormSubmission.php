<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicFormSubmission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'form_id',
        'user_id',
        'reference_id',
        'reference_type',
        'data',
        'files',
        'status',
        'workflow_state',
        'workflow_history',
        'submitted_at',
        'processed_at',
        'processed_by',
        'notes',
    ];

    protected $casts = [
        'data' => 'array',
        'files' => 'array',
        'workflow_history' => 'array',
        'submitted_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(DynamicForm::class, 'form_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function approve(int $userId, ?string $notes = null): void
    {
        $this->addWorkflowHistory('approved', $userId, $notes);
        $this->status = 'approved';
        $this->processed_at = now();
        $this->processed_by = $userId;
        $this->notes = $notes;
        $this->save();
    }

    public function reject(int $userId, ?string $notes = null): void
    {
        $this->addWorkflowHistory('rejected', $userId, $notes);
        $this->status = 'rejected';
        $this->processed_at = now();
        $this->processed_by = $userId;
        $this->notes = $notes;
        $this->save();
    }

    public function addWorkflowHistory(string $action, int $userId, ?string $notes = null): void
    {
        $history = $this->workflow_history ?? [];
        $history[] = [
            'action' => $action,
            'user_id' => $userId,
            'notes' => $notes,
            'timestamp' => now()->toIso8601String(),
        ];
        $this->workflow_history = $history;
    }

    public function getFieldValue(string $fieldKey)
    {
        return $this->data[$fieldKey] ?? null;
    }

    public function setFieldValue(string $fieldKey, $value): void
    {
        $data = $this->data ?? [];
        $data[$fieldKey] = $value;
        $this->data = $data;
        $this->save();
    }
}

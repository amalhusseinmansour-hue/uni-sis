<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'request_type',
        'type', // alias for request_type
        'subject',
        'description',
        'priority',
        'date',
        'request_date',
        'completion_date',
        'status',
        'comments',
        'admin_notes',
        'attachments',
        'handled_by',
        'handled_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'request_date' => 'date',
            'completion_date' => 'date',
            'handled_at' => 'datetime',
            'attachments' => 'array',
        ];
    }

    // Accessor for API compatibility - type maps to request_type
    public function getTypeAttribute()
    {
        return $this->request_type;
    }

    public function setTypeAttribute($value)
    {
        $this->attributes['request_type'] = $value;
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'PENDING';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'IN_PROGRESS';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'COMPLETED';
    }

    public function isRejected(): bool
    {
        return $this->status === 'REJECTED';
    }

    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'IN_PROGRESS');
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }
}

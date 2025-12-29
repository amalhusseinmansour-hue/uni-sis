<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentScholarship extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'scholarship_id',
        'approved_by',
        'status',
        'start_date',
        'end_date',
        'awarded_amount',
        'disbursed_amount',
        'semesters_used',
        'application_notes',
        'approval_notes',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'awarded_amount' => 'decimal:2',
            'disbursed_amount' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    // Status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_APPROVED = 'APPROVED';
    const STATUS_REJECTED = 'REJECTED';
    const STATUS_ACTIVE = 'ACTIVE';
    const STATUS_SUSPENDED = 'SUSPENDED';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_CANCELLED = 'CANCELLED';

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function scholarship(): BelongsTo
    {
        return $this->belongsTo(Scholarship::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function getRemainingAmountAttribute(): float
    {
        return ($this->awarded_amount ?? 0) - ($this->disbursed_amount ?? 0);
    }

    public function approve(User $approver, ?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'approval_notes' => $notes,
        ]);
    }

    public function activate(): void
    {
        $this->update([
            'status' => self::STATUS_ACTIVE,
            'start_date' => $this->start_date ?? now(),
        ]);

        // Increment scholarship recipients count
        $this->scholarship->increment('current_recipients');
    }

    public function suspend(?string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_SUSPENDED,
            'approval_notes' => $reason,
        ]);
    }

    public function complete(): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'end_date' => now(),
        ]);

        // Decrement scholarship recipients count
        $this->scholarship->decrement('current_recipients');
    }

    public function disburse(float $amount): void
    {
        $this->increment('disbursed_amount', $amount);
        $this->increment('semesters_used');
    }
}

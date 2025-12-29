<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fine extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'invoice_id',
        'fine_type',
        'description',
        'amount',
        'currency',
        'status',
        'issue_date',
        'due_date',
        'paid_date',
        'issued_by',
        'waived_by',
        'waived_at',
        'waiver_reason',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'issue_date' => 'date',
            'due_date' => 'date',
            'paid_date' => 'date',
            'waived_at' => 'datetime',
        ];
    }

    // Fine Types
    const TYPE_LATE_PAYMENT = 'LATE_PAYMENT';
    const TYPE_LIBRARY = 'LIBRARY';
    const TYPE_DAMAGE = 'DAMAGE';
    const TYPE_DISCIPLINARY = 'DISCIPLINARY';
    const TYPE_LATE_REGISTRATION = 'LATE_REGISTRATION';
    const TYPE_PARKING = 'PARKING';
    const TYPE_OTHER = 'OTHER';

    // Status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_PAID = 'PAID';
    const STATUS_WAIVED = 'WAIVED';
    const STATUS_APPEALED = 'APPEALED';

    public static function getFineTypes(): array
    {
        return [
            self::TYPE_LATE_PAYMENT => 'Late Payment',
            self::TYPE_LIBRARY => 'Library Fine',
            self::TYPE_DAMAGE => 'Property Damage',
            self::TYPE_DISCIPLINARY => 'Disciplinary Fine',
            self::TYPE_LATE_REGISTRATION => 'Late Registration',
            self::TYPE_PARKING => 'Parking Violation',
            self::TYPE_OTHER => 'Other',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function waivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'waived_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where('due_date', '<', now());
    }

    // Status checks
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isWaived(): bool
    {
        return $this->status === self::STATUS_WAIVED;
    }

    // Actions
    public function markAsPaid(): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_date' => now(),
        ]);
    }

    public function waive(User $user, string $reason): void
    {
        $this->update([
            'status' => self::STATUS_WAIVED,
            'waived_by' => $user->id,
            'waived_at' => now(),
            'waiver_reason' => $reason,
        ]);
    }

    public function appeal(): void
    {
        $this->update(['status' => self::STATUS_APPEALED]);
    }
}

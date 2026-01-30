<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'payment_id',
        'invoice_id',
        'refund_number',
        'amount',
        'currency',
        'reason',
        'reason_details',
        'method',
        'status',
        'bank_name',
        'bank_account',
        'cheque_number',
        'requested_by',
        'approved_by',
        'processed_by',
        'requested_at',
        'approved_at',
        'processed_at',
        'approval_notes',
        'processing_notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'requested_at' => 'datetime',
            'approved_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    // Reason constants
    const REASON_WITHDRAWAL = 'WITHDRAWAL';
    const REASON_COURSE_DROP = 'COURSE_DROP';
    const REASON_OVERPAYMENT = 'OVERPAYMENT';
    const REASON_SCHOLARSHIP_ADJUSTMENT = 'SCHOLARSHIP_ADJUSTMENT';
    const REASON_ERROR_CORRECTION = 'ERROR_CORRECTION';
    const REASON_OTHER = 'OTHER';

    // Method constants
    const METHOD_ORIGINAL = 'ORIGINAL_METHOD';
    const METHOD_BANK_TRANSFER = 'BANK_TRANSFER';
    const METHOD_CHEQUE = 'CHEQUE';
    const METHOD_CASH = 'CASH';
    const METHOD_CREDIT = 'CREDIT_TO_ACCOUNT';

    // Status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_APPROVED = 'APPROVED';
    const STATUS_PROCESSING = 'PROCESSING';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_REJECTED = 'REJECTED';
    const STATUS_CANCELLED = 'CANCELLED';

    public static function getReasons(): array
    {
        return [
            self::REASON_WITHDRAWAL => 'Withdrawal',
            self::REASON_COURSE_DROP => 'Course Drop',
            self::REASON_OVERPAYMENT => 'Overpayment',
            self::REASON_SCHOLARSHIP_ADJUSTMENT => 'Scholarship Adjustment',
            self::REASON_ERROR_CORRECTION => 'Error Correction',
            self::REASON_OTHER => 'Other',
        ];
    }

    public static function getMethods(): array
    {
        return [
            self::METHOD_ORIGINAL => 'Original Payment Method',
            self::METHOD_BANK_TRANSFER => 'Bank Transfer',
            self::METHOD_CHEQUE => 'Cheque',
            self::METHOD_CASH => 'Cash',
            self::METHOD_CREDIT => 'Credit to Account',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($refund) {
            if (empty($refund->refund_number)) {
                $refund->refund_number = self::generateRefundNumber();
            }
            $refund->requested_at = $refund->requested_at ?? now();
        });
    }

    public static function generateRefundNumber(): string
    {
        $year = now()->format('Y');
        $lastRefund = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastRefund ? (int) substr($lastRefund->refund_number, -6) + 1 : 1;

        return 'REF-' . $year . '-' . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    // Status checks
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    // Actions
    public function approve(User $approver, ?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'approval_notes' => $notes,
        ]);
    }

    public function reject(User $rejecter, string $reason): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'approved_by' => $rejecter->id,
            'approved_at' => now(),
            'approval_notes' => $reason,
        ]);
    }

    public function process(User $processor, ?string $notes = null): void
    {
        $this->update([
            'status' => self::STATUS_PROCESSING,
            'processed_by' => $processor->id,
            'processing_notes' => $notes,
        ]);
    }

    public function complete(User $processor): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'processed_by' => $processor->id,
            'processed_at' => now(),
        ]);

        // Update payment status if linked
        if ($this->payment) {
            $this->payment->markAsRefunded();
        }

        // Update student balance
        $this->updateStudentBalance();
    }

    protected function updateStudentBalance(): void
    {
        $student = $this->student;
        if ($student && $this->method !== self::METHOD_CREDIT) {
            $student->decrement('paid_amount', $this->amount);
            $student->current_balance = $student->total_fees - $student->paid_amount;
            $student->save();
        }
    }
}

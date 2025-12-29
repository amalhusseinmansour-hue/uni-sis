<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'invoice_id',
        'transaction_id',
        'reference_number',
        'amount',
        'currency',
        'payment_method',
        'status',
        'bank_name',
        'cheque_number',
        'cheque_date',
        'card_last_four',
        'gateway_reference',
        'gateway_response',
        'receipt_number',
        'receipt_path',
        'payment_date',
        'received_by',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'gateway_response' => 'array',
            'payment_date' => 'datetime',
            'cheque_date' => 'date',
            'verified_at' => 'datetime',
        ];
    }

    // Payment Methods
    const METHOD_CASH = 'CASH';
    const METHOD_BANK_TRANSFER = 'BANK_TRANSFER';
    const METHOD_CREDIT_CARD = 'CREDIT_CARD';
    const METHOD_DEBIT_CARD = 'DEBIT_CARD';
    const METHOD_CHEQUE = 'CHEQUE';
    const METHOD_ONLINE = 'ONLINE';
    const METHOD_MOBILE_PAYMENT = 'MOBILE_PAYMENT';
    const METHOD_SCHOLARSHIP = 'SCHOLARSHIP';
    const METHOD_SPONSOR = 'SPONSOR';

    // Status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_PROCESSING = 'PROCESSING';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_FAILED = 'FAILED';
    const STATUS_CANCELLED = 'CANCELLED';
    const STATUS_REFUNDED = 'REFUNDED';

    public static function getPaymentMethods(): array
    {
        return [
            self::METHOD_CASH => 'Cash',
            self::METHOD_BANK_TRANSFER => 'Bank Transfer',
            self::METHOD_CREDIT_CARD => 'Credit Card',
            self::METHOD_DEBIT_CARD => 'Debit Card',
            self::METHOD_CHEQUE => 'Cheque',
            self::METHOD_ONLINE => 'Online Payment',
            self::METHOD_MOBILE_PAYMENT => 'Mobile Payment',
            self::METHOD_SCHOLARSHIP => 'Scholarship',
            self::METHOD_SPONSOR => 'Sponsor',
        ];
    }

    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_PROCESSING => 'Processing',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_REFUNDED => 'Refunded',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->transaction_id)) {
                $payment->transaction_id = self::generateTransactionId();
            }
        });
    }

    public static function generateTransactionId(): string
    {
        return 'TXN-' . now()->format('Ymd') . '-' . strtoupper(Str::random(8));
    }

    public static function generateReceiptNumber(): string
    {
        $year = now()->format('Y');
        $lastReceipt = self::whereYear('created_at', $year)
            ->whereNotNull('receipt_number')
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastReceipt ? (int) substr($lastReceipt->receipt_number, -6) + 1 : 1;

        return 'RCP-' . $year . '-' . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(PaymentPlanInstallment::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function scopeByMethod($query, string $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('payment_date', [$from, $to]);
    }

    // Status checks
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    public function isRefunded(): bool
    {
        return $this->status === self::STATUS_REFUNDED;
    }

    // Actions
    public function markAsCompleted(?User $verifier = null): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'payment_date' => $this->payment_date ?? now(),
            'receipt_number' => $this->receipt_number ?? self::generateReceiptNumber(),
            'verified_by' => $verifier?->id,
            'verified_at' => $verifier ? now() : null,
        ]);

        // Update invoice if linked
        if ($this->invoice) {
            $this->invoice->recordPayment($this->amount);
        }

        // Update student balance
        $this->updateStudentBalance();
    }

    public function markAsFailed(?string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'notes' => $reason ? ($this->notes . "\nFailed: " . $reason) : $this->notes,
        ]);
    }

    public function markAsRefunded(): void
    {
        $this->update(['status' => self::STATUS_REFUNDED]);
    }

    protected function updateStudentBalance(): void
    {
        $student = $this->student;
        if ($student) {
            $student->increment('paid_amount', $this->amount);
            $student->current_balance = $student->total_fees - $student->paid_amount;
            $student->save();
        }
    }

    public function getRefundableAmountAttribute(): float
    {
        $refundedAmount = $this->refunds()->where('status', 'COMPLETED')->sum('amount');
        return $this->amount - $refundedAmount;
    }
}

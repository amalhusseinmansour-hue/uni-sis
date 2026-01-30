<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FinancialTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'transaction_type',
        'reference_type',
        'reference_id',
        'debit',
        'credit',
        'balance_after',
        'currency',
        'description',
        'created_by',
        'transaction_date',
    ];

    protected function casts(): array
    {
        return [
            'debit' => 'decimal:2',
            'credit' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'transaction_date' => 'datetime',
        ];
    }

    // Transaction Types
    const TYPE_CHARGE = 'CHARGE';
    const TYPE_PAYMENT = 'PAYMENT';
    const TYPE_REFUND = 'REFUND';
    const TYPE_ADJUSTMENT = 'ADJUSTMENT';
    const TYPE_SCHOLARSHIP = 'SCHOLARSHIP';
    const TYPE_FINE = 'FINE';
    const TYPE_WAIVER = 'WAIVER';
    const TYPE_TRANSFER = 'TRANSFER';

    public static function getTypes(): array
    {
        return [
            self::TYPE_CHARGE => 'Charge',
            self::TYPE_PAYMENT => 'Payment',
            self::TYPE_REFUND => 'Refund',
            self::TYPE_ADJUSTMENT => 'Adjustment',
            self::TYPE_SCHOLARSHIP => 'Scholarship',
            self::TYPE_FINE => 'Fine',
            self::TYPE_WAIVER => 'Waiver',
            self::TYPE_TRANSFER => 'Transfer',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo('reference', 'reference_type', 'reference_id');
    }

    // Scopes
    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeDebits($query)
    {
        return $query->where('debit', '>', 0);
    }

    public function scopeCredits($query)
    {
        return $query->where('credit', '>', 0);
    }

    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('transaction_date', [$from, $to]);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('transaction_type', $type);
    }

    // Helpers
    public function getNetAmountAttribute(): float
    {
        return $this->credit - $this->debit;
    }

    public function isDebit(): bool
    {
        return $this->debit > 0;
    }

    public function isCredit(): bool
    {
        return $this->credit > 0;
    }

    // Static creators for different transaction types
    public static function recordCharge(Student $student, float $amount, string $description, $reference = null, ?User $user = null): self
    {
        return self::createTransaction($student, self::TYPE_CHARGE, $amount, 0, $description, $reference, $user);
    }

    public static function recordPayment(Student $student, float $amount, string $description, $reference = null, ?User $user = null): self
    {
        return self::createTransaction($student, self::TYPE_PAYMENT, 0, $amount, $description, $reference, $user);
    }

    public static function recordRefund(Student $student, float $amount, string $description, $reference = null, ?User $user = null): self
    {
        return self::createTransaction($student, self::TYPE_REFUND, $amount, 0, $description, $reference, $user);
    }

    public static function recordScholarship(Student $student, float $amount, string $description, $reference = null, ?User $user = null): self
    {
        return self::createTransaction($student, self::TYPE_SCHOLARSHIP, 0, $amount, $description, $reference, $user);
    }

    public static function recordFine(Student $student, float $amount, string $description, $reference = null, ?User $user = null): self
    {
        return self::createTransaction($student, self::TYPE_FINE, $amount, 0, $description, $reference, $user);
    }

    public static function recordWaiver(Student $student, float $amount, string $description, $reference = null, ?User $user = null): self
    {
        return self::createTransaction($student, self::TYPE_WAIVER, 0, $amount, $description, $reference, $user);
    }

    protected static function createTransaction(
        Student $student,
        string $type,
        float $debit,
        float $credit,
        string $description,
        $reference = null,
        ?User $user = null
    ): self {
        // Get current balance
        $lastTransaction = self::where('student_id', $student->id)
            ->orderBy('id', 'desc')
            ->first();

        $balanceBefore = $lastTransaction ? $lastTransaction->balance_after : 0;
        $balanceAfter = $balanceBefore + $debit - $credit;

        return self::create([
            'student_id' => $student->id,
            'transaction_type' => $type,
            'reference_type' => $reference ? get_class($reference) : null,
            'reference_id' => $reference?->id,
            'debit' => $debit,
            'credit' => $credit,
            'balance_after' => $balanceAfter,
            'currency' => 'USD',
            'description' => $description,
            'created_by' => $user?->id,
            'transaction_date' => now(),
        ]);
    }

    public static function getStudentBalance(int $studentId): float
    {
        $lastTransaction = self::where('student_id', $studentId)
            ->orderBy('id', 'desc')
            ->first();

        return $lastTransaction ? $lastTransaction->balance_after : 0;
    }

    public static function getStudentStatement(int $studentId, ?string $from = null, ?string $to = null): array
    {
        $query = self::where('student_id', $studentId)
            ->orderBy('transaction_date', 'asc');

        if ($from) {
            $query->where('transaction_date', '>=', $from);
        }
        if ($to) {
            $query->where('transaction_date', '<=', $to);
        }

        $transactions = $query->get();

        return [
            'transactions' => $transactions,
            'total_debits' => $transactions->sum('debit'),
            'total_credits' => $transactions->sum('credit'),
            'closing_balance' => $transactions->last()?->balance_after ?? 0,
        ];
    }
}

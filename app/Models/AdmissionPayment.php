<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmissionPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_application_id',
        'transaction_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'bank_name',
        'receipt_number',
        'receipt_path',
        'paid_at',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    // العلاقات
    public function admissionApplication(): BelongsTo
    {
        return $this->belongsTo(AdmissionApplication::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // الحالات
    public function isPending(): bool
    {
        return $this->status === 'PENDING';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'COMPLETED';
    }

    public function isFailed(): bool
    {
        return $this->status === 'FAILED';
    }

    public function isRefunded(): bool
    {
        return $this->status === 'REFUNDED';
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'COMPLETED');
    }

    public function scopeByPaymentMethod($query, string $method)
    {
        return $query->where('payment_method', $method);
    }

    // توليد رقم معاملة فريد
    public static function generateTransactionId(): string
    {
        $prefix = 'ADM';
        $timestamp = now()->format('YmdHis');
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        return "{$prefix}-{$timestamp}-{$random}";
    }

    // تأكيد الدفع
    public function markAsCompleted(?int $verifiedBy = null): void
    {
        $this->update([
            'status' => 'COMPLETED',
            'paid_at' => now(),
            'verified_by' => $verifiedBy,
            'verified_at' => now(),
        ]);
    }

    // فشل الدفع
    public function markAsFailed(?string $notes = null): void
    {
        $this->update([
            'status' => 'FAILED',
            'notes' => $notes,
        ]);
    }

    // استرداد الدفع
    public function markAsRefunded(?string $notes = null): void
    {
        $this->update([
            'status' => 'REFUNDED',
            'notes' => $notes,
        ]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentPlanInstallment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_plan_id',
        'payment_id',
        'installment_number',
        'amount',
        'paid_amount',
        'late_fee',
        'due_date',
        'paid_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'late_fee' => 'decimal:2',
            'due_date' => 'date',
            'paid_date' => 'date',
        ];
    }

    // Status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_PAID = 'PAID';
    const STATUS_PARTIALLY_PAID = 'PARTIALLY_PAID';
    const STATUS_OVERDUE = 'OVERDUE';
    const STATUS_WAIVED = 'WAIVED';

    public function paymentPlan(): BelongsTo
    {
        return $this->belongsTo(PaymentPlan::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_OVERDUE);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where('due_date', '>=', now())
            ->orderBy('due_date');
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

    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_OVERDUE;
    }

    // Actions
    public function getTotalDueAttribute(): float
    {
        return $this->amount + $this->late_fee - $this->paid_amount;
    }

    public function checkOverdue(): void
    {
        if ($this->isPending() && $this->due_date < now()) {
            $this->calculateLateFee();
            $this->update(['status' => self::STATUS_OVERDUE]);
        }
    }

    public function calculateLateFee(): void
    {
        $plan = $this->paymentPlan;
        if ($plan->late_fee_percentage > 0 && $this->due_date < now()) {
            $gracePeriodEnd = $this->due_date->copy()->addDays($plan->grace_period_days);
            if (now() > $gracePeriodEnd) {
                $this->late_fee = round($this->amount * ($plan->late_fee_percentage / 100), 2);
                $this->save();
            }
        }
    }

    public function recordPayment(float $amount, Payment $payment): void
    {
        $this->increment('paid_amount', $amount);
        $this->payment_id = $payment->id;

        if ($this->paid_amount >= ($this->amount + $this->late_fee)) {
            $this->status = self::STATUS_PAID;
            $this->paid_date = now();
        } else {
            $this->status = self::STATUS_PARTIALLY_PAID;
        }

        $this->save();

        // Update payment plan
        $this->paymentPlan->recordPayment($amount);
    }

    public function waive(?string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_WAIVED,
            'notes' => $reason,
        ]);

        // Update payment plan remaining amount
        $this->paymentPlan->decrement('remaining_amount', $this->total_due);
    }
}

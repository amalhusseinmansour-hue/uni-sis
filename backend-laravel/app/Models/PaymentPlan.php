<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'invoice_id',
        'semester_id',
        'plan_number',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'number_of_installments',
        'frequency',
        'status',
        'start_date',
        'end_date',
        'down_payment',
        'late_fee_percentage',
        'grace_period_days',
        'approved_by',
        'approved_at',
        'terms',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'down_payment' => 'decimal:2',
            'late_fee_percentage' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    // Status constants
    const STATUS_DRAFT = 'DRAFT';
    const STATUS_ACTIVE = 'ACTIVE';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_DEFAULTED = 'DEFAULTED';
    const STATUS_CANCELLED = 'CANCELLED';

    // Frequency constants
    const FREQUENCY_WEEKLY = 'WEEKLY';
    const FREQUENCY_BI_WEEKLY = 'BI_WEEKLY';
    const FREQUENCY_MONTHLY = 'MONTHLY';
    const FREQUENCY_CUSTOM = 'CUSTOM';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($plan) {
            if (empty($plan->plan_number)) {
                $plan->plan_number = self::generatePlanNumber();
            }
            $plan->remaining_amount = $plan->total_amount - ($plan->down_payment ?? 0);
        });
    }

    public static function generatePlanNumber(): string
    {
        $year = now()->format('Y');
        $lastPlan = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastPlan ? (int) substr($lastPlan->plan_number, -6) + 1 : 1;

        return 'PP-' . $year . '-' . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function installments(): HasMany
    {
        return $this->hasMany(PaymentPlanInstallment::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeDefaulted($query)
    {
        return $query->where('status', self::STATUS_DEFAULTED);
    }

    // Status checks
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isDefaulted(): bool
    {
        return $this->status === self::STATUS_DEFAULTED;
    }

    // Actions
    public function activate(): void
    {
        $this->update(['status' => self::STATUS_ACTIVE]);
    }

    public function generateInstallments(): void
    {
        $amountAfterDownPayment = $this->total_amount - ($this->down_payment ?? 0);
        $installmentAmount = round($amountAfterDownPayment / $this->number_of_installments, 2);

        $currentDate = $this->start_date->copy();

        for ($i = 1; $i <= $this->number_of_installments; $i++) {
            // Adjust last installment for rounding differences
            $amount = ($i === $this->number_of_installments)
                ? $amountAfterDownPayment - ($installmentAmount * ($this->number_of_installments - 1))
                : $installmentAmount;

            $this->installments()->create([
                'installment_number' => $i,
                'amount' => $amount,
                'due_date' => $currentDate->copy(),
                'status' => 'PENDING',
            ]);

            // Move to next due date based on frequency
            switch ($this->frequency) {
                case self::FREQUENCY_WEEKLY:
                    $currentDate->addWeek();
                    break;
                case self::FREQUENCY_BI_WEEKLY:
                    $currentDate->addWeeks(2);
                    break;
                case self::FREQUENCY_MONTHLY:
                default:
                    $currentDate->addMonth();
                    break;
            }
        }
    }

    public function recordPayment(float $amount): void
    {
        $this->increment('paid_amount', $amount);
        $this->decrement('remaining_amount', $amount);

        if ($this->remaining_amount <= 0) {
            $this->update(['status' => self::STATUS_COMPLETED]);
        }
    }

    public function checkForDefault(): void
    {
        $overdueCount = $this->installments()
            ->where('status', 'OVERDUE')
            ->count();

        // Default after 3 missed installments
        if ($overdueCount >= 3) {
            $this->update(['status' => self::STATUS_DEFAULTED]);
        }
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->total_amount <= 0) return 0;
        return round(($this->paid_amount / $this->total_amount) * 100, 2);
    }

    public function getNextInstallmentAttribute(): ?PaymentPlanInstallment
    {
        return $this->installments()
            ->where('status', 'PENDING')
            ->orderBy('due_date')
            ->first();
    }
}

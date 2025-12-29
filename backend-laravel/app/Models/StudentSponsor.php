<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSponsor extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'sponsor_id',
        'coverage_type',
        'coverage_percentage',
        'max_amount',
        'covered_fees',
        'start_date',
        'end_date',
        'status',
        'sponsor_student_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'coverage_percentage' => 'decimal:2',
            'max_amount' => 'decimal:2',
            'covered_fees' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    // Coverage Types
    const COVERAGE_FULL = 'FULL';
    const COVERAGE_PARTIAL = 'PARTIAL';
    const COVERAGE_SPECIFIC = 'SPECIFIC_FEES';

    // Status constants
    const STATUS_ACTIVE = 'ACTIVE';
    const STATUS_SUSPENDED = 'SUSPENDED';
    const STATUS_ENDED = 'ENDED';

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(Sponsor::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function calculateCoverage(float $feeAmount, ?string $feeType = null): float
    {
        if (!$this->isActive()) return 0;

        // Check if this fee type is covered
        if ($this->coverage_type === self::COVERAGE_SPECIFIC) {
            if ($feeType && !in_array($feeType, $this->covered_fees ?? [])) {
                return 0;
            }
        }

        // Calculate coverage amount
        switch ($this->coverage_type) {
            case self::COVERAGE_FULL:
                $amount = $feeAmount;
                break;
            case self::COVERAGE_PARTIAL:
            case self::COVERAGE_SPECIFIC:
                $amount = $feeAmount * (($this->coverage_percentage ?? 100) / 100);
                break;
            default:
                $amount = 0;
        }

        // Apply max amount limit if set
        if ($this->max_amount && $amount > $this->max_amount) {
            $amount = $this->max_amount;
        }

        return $amount;
    }

    public function suspend(?string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_SUSPENDED,
            'notes' => $reason ? ($this->notes . "\nSuspended: " . $reason) : $this->notes,
        ]);
    }

    public function end(): void
    {
        $this->update([
            'status' => self::STATUS_ENDED,
            'end_date' => now(),
        ]);
    }
}

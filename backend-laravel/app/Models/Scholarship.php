<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Scholarship extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'type',
        'coverage_type',
        'coverage_value',
        'max_amount',
        'currency',
        'min_gpa',
        'max_recipients',
        'current_recipients',
        'application_start',
        'application_end',
        'is_renewable',
        'max_semesters',
        'is_active',
        'eligibility_criteria',
        'terms_conditions',
    ];

    protected function casts(): array
    {
        return [
            'coverage_value' => 'decimal:2',
            'max_amount' => 'decimal:2',
            'min_gpa' => 'decimal:2',
            'is_renewable' => 'boolean',
            'is_active' => 'boolean',
            'application_start' => 'date',
            'application_end' => 'date',
        ];
    }

    // Scholarship Types
    const TYPE_MERIT = 'MERIT';
    const TYPE_NEED_BASED = 'NEED_BASED';
    const TYPE_ATHLETIC = 'ATHLETIC';
    const TYPE_GOVERNMENT = 'GOVERNMENT';
    const TYPE_CORPORATE = 'CORPORATE';
    const TYPE_FULL = 'FULL';
    const TYPE_PARTIAL = 'PARTIAL';

    public static function getTypes(): array
    {
        return [
            self::TYPE_MERIT => 'Merit-Based',
            self::TYPE_NEED_BASED => 'Need-Based',
            self::TYPE_ATHLETIC => 'Athletic',
            self::TYPE_GOVERNMENT => 'Government',
            self::TYPE_CORPORATE => 'Corporate',
            self::TYPE_FULL => 'Full Scholarship',
            self::TYPE_PARTIAL => 'Partial Scholarship',
        ];
    }

    public function studentScholarships(): HasMany
    {
        return $this->hasMany(StudentScholarship::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_scholarships')
            ->withPivot(['status', 'start_date', 'end_date', 'awarded_amount', 'disbursed_amount'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAcceptingApplications($query)
    {
        $today = now()->toDateString();
        return $query->where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('application_start')
                    ->orWhere('application_start', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('application_end')
                    ->orWhere('application_end', '>=', $today);
            });
    }

    public function scopeHasAvailableSlots($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('max_recipients')
                ->orWhereColumn('current_recipients', '<', 'max_recipients');
        });
    }

    public function hasAvailableSlots(): bool
    {
        return $this->max_recipients === null || $this->current_recipients < $this->max_recipients;
    }

    public function isAcceptingApplications(): bool
    {
        $today = now()->toDateString();
        return $this->is_active
            && ($this->application_start === null || $this->application_start <= $today)
            && ($this->application_end === null || $this->application_end >= $today);
    }

    public function calculateAmount(float $totalFees): float
    {
        if ($this->coverage_type === 'PERCENTAGE') {
            $amount = $totalFees * ($this->coverage_value / 100);
            return $this->max_amount ? min($amount, $this->max_amount) : $amount;
        }

        return $this->coverage_value;
    }

    public function isStudentEligible(Student $student): bool
    {
        // Check GPA requirement
        if ($this->min_gpa && $student->gpa < $this->min_gpa) {
            return false;
        }

        // Check available slots
        if (!$this->hasAvailableSlots()) {
            return false;
        }

        return true;
    }
}

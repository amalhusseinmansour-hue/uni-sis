<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'semester_id',
        'fee_type',
        'name_en',
        'name_ar',
        'amount',
        'currency',
        'is_mandatory',
        'is_recurring',
        'applies_to',
        'applicable_levels',
        'effective_from',
        'effective_to',
        'is_active',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_mandatory' => 'boolean',
            'is_recurring' => 'boolean',
            'is_active' => 'boolean',
            'applicable_levels' => 'array',
            'effective_from' => 'date',
            'effective_to' => 'date',
        ];
    }

    // Fee Types
    const TYPE_TUITION = 'TUITION';
    const TYPE_REGISTRATION = 'REGISTRATION';
    const TYPE_LAB = 'LAB';
    const TYPE_LIBRARY = 'LIBRARY';
    const TYPE_SPORTS = 'SPORTS';
    const TYPE_INSURANCE = 'INSURANCE';
    const TYPE_TECHNOLOGY = 'TECHNOLOGY';
    const TYPE_GRADUATION = 'GRADUATION';
    const TYPE_TRANSCRIPT = 'TRANSCRIPT';
    const TYPE_OTHER = 'OTHER';

    public static function getFeeTypes(): array
    {
        return [
            self::TYPE_TUITION => 'Tuition Fee',
            self::TYPE_REGISTRATION => 'Registration Fee',
            self::TYPE_LAB => 'Lab Fee',
            self::TYPE_LIBRARY => 'Library Fee',
            self::TYPE_SPORTS => 'Sports Fee',
            self::TYPE_INSURANCE => 'Insurance Fee',
            self::TYPE_TECHNOLOGY => 'Technology Fee',
            self::TYPE_GRADUATION => 'Graduation Fee',
            self::TYPE_TRANSCRIPT => 'Transcript Fee',
            self::TYPE_OTHER => 'Other Fee',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeEffective($query)
    {
        $today = now()->toDateString();
        return $query->where('effective_from', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $today);
            });
    }

    public function scopeForProgram($query, int $programId)
    {
        return $query->where(function ($q) use ($programId) {
            $q->where('program_id', $programId)
                ->orWhereNull('program_id');
        });
    }

    public function scopeMandatory($query)
    {
        return $query->where('is_mandatory', true);
    }

    public function isEffective(): bool
    {
        $today = now()->toDateString();
        return $this->effective_from <= $today
            && ($this->effective_to === null || $this->effective_to >= $today);
    }

    public function appliesToStudent(Student $student): bool
    {
        // Check program
        if ($this->program_id && $this->program_id !== $student->program_id) {
            return false;
        }

        // Check applies_to
        switch ($this->applies_to) {
            case 'NEW_STUDENTS':
                return $student->level === 1;
            case 'CONTINUING':
                return $student->level > 1;
            case 'SPECIFIC_LEVELS':
                return in_array($student->level, $this->applicable_levels ?? []);
            default:
                return true;
        }
    }
}

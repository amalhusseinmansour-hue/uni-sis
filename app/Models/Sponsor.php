<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Sponsor extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'type',
        'contact_person',
        'email',
        'phone',
        'address',
        'tax_id',
        'credit_limit',
        'current_balance',
        'payment_terms',
        'is_active',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'current_balance' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    // Sponsor Types
    const TYPE_GOVERNMENT = 'GOVERNMENT';
    const TYPE_CORPORATE = 'CORPORATE';
    const TYPE_EMBASSY = 'EMBASSY';
    const TYPE_FAMILY = 'FAMILY';
    const TYPE_NGO = 'NGO';
    const TYPE_OTHER = 'OTHER';

    public static function getTypes(): array
    {
        return [
            self::TYPE_GOVERNMENT => 'Government',
            self::TYPE_CORPORATE => 'Corporate',
            self::TYPE_EMBASSY => 'Embassy',
            self::TYPE_FAMILY => 'Family',
            self::TYPE_NGO => 'NGO',
            self::TYPE_OTHER => 'Other',
        ];
    }

    public function studentSponsors(): HasMany
    {
        return $this->hasMany(StudentSponsor::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_sponsors')
            ->withPivot(['coverage_type', 'coverage_percentage', 'max_amount', 'status', 'start_date', 'end_date'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getAvailableCreditAttribute(): ?float
    {
        if ($this->credit_limit === null) return null;
        return $this->credit_limit - $this->current_balance;
    }

    public function hasAvailableCredit(float $amount): bool
    {
        if ($this->credit_limit === null) return true;
        return ($this->credit_limit - $this->current_balance) >= $amount;
    }

    public function charge(float $amount): void
    {
        $this->increment('current_balance', $amount);
    }

    public function credit(float $amount): void
    {
        $this->decrement('current_balance', $amount);
    }
}

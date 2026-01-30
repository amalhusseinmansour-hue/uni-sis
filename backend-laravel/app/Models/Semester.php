<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_en',
        'name_ar',
        'academic_year',
        'start_date',
        'end_date',
        'registration_start',
        'registration_end',
        'add_drop_start',
        'add_drop_end',
        'is_current',
        'is_closed',
    ];

    protected $appends = ['is_registration_open'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'registration_start' => 'date',
            'registration_end' => 'date',
            'add_drop_start' => 'date',
            'add_drop_end' => 'date',
            'is_current' => 'boolean',
            'is_closed' => 'boolean',
        ];
    }

    public function getIsRegistrationOpenAttribute(): bool
    {
        return $this->isRegistrationOpen();
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public static function getCurrentSemester(): ?self
    {
        return self::where('is_current', true)->first();
    }

    public function isRegistrationOpen(): bool
    {
        if ($this->is_closed) {
            return false;
        }
        $now = now();
        return $this->registration_start <= $now && $now <= $this->registration_end;
    }

    public function isAddDropOpen(): bool
    {
        if ($this->is_closed) {
            return false;
        }
        $now = now();
        // If add_drop dates are not set, use registration dates
        $start = $this->add_drop_start ?? $this->registration_start;
        $end = $this->add_drop_end ?? $this->registration_end;
        return $start <= $now && $now <= $end;
    }

    public function close(): void
    {
        $this->update(['is_closed' => true]);
    }

    public function reopen(): void
    {
        $this->update(['is_closed' => false]);
    }

    public function isClosed(): bool
    {
        return $this->is_closed ?? false;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class College extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_ar',
        'code',
        'description',
        'dean_name',
        'email',
        'phone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function programs(): HasManyThrough
    {
        return $this->hasManyThrough(Program::class, Department::class);
    }

    public function courses(): HasManyThrough
    {
        return $this->hasManyThrough(Course::class, Department::class);
    }

    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(
            Student::class,
            Program::class,
            'department_id', // Foreign key on programs table
            'program_id',    // Foreign key on students table
            'id',            // Local key on colleges table
            'id'             // Local key on programs table
        );
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getStudentCountAttribute(): int
    {
        return $this->students()->count();
    }

    public function getDepartmentCountAttribute(): int
    {
        return $this->departments()->count();
    }
}

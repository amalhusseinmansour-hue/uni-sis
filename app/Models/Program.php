<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'name_en',
        'name_ar',
        'code',
        'type',
        'total_credits',
        'description',
        'duration_years',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'duration_years' => 'integer',
            'total_credits' => 'integer',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function college(): HasOneThrough
    {
        return $this->hasOneThrough(
            College::class,
            Department::class,
            'id',           // Foreign key on departments table
            'id',           // Foreign key on colleges table
            'department_id', // Local key on programs table
            'college_id'    // Local key on departments table
        );
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function admissionApplications(): HasMany
    {
        return $this->hasMany(AdmissionApplication::class);
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'program_courses')
            ->withPivot(['semester', 'type', 'is_common', 'order'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getActiveStudentCountAttribute(): int
    {
        return $this->students()->where('status', 'ACTIVE')->count();
    }

    public function getCompletionRateAttribute(): float
    {
        $totalStudents = $this->students()->count();
        if ($totalStudents === 0) return 0;

        $graduatedStudents = $this->students()->where('status', 'GRADUATED')->count();
        return round(($graduatedStudents / $totalStudents) * 100, 2);
    }
}

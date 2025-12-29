<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentTag extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'tag_name',
        'tag_name_en',
        'tag_category',
        'tag_color',
        'description',
        'valid_from',
        'valid_until',
        'is_active',
        'added_by',
    ];

    protected function casts(): array
    {
        return [
            'valid_from' => 'date',
            'valid_until' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function getCategoryLabelAttribute(): string
    {
        return match ($this->tag_category) {
            'ACADEMIC' => 'Academic / أكاديمي',
            'FINANCIAL' => 'Financial / مالي',
            'SPECIAL_NEEDS' => 'Special Needs / احتياجات خاصة',
            'SCHOLARSHIP' => 'Scholarship / منحة',
            'BEHAVIORAL' => 'Behavioral / سلوكي',
            'ACHIEVEMENT' => 'Achievement / إنجاز',
            'RISK' => 'At Risk / خطر',
            'CLUB' => 'Club/Activity / نادي/نشاط',
            'ATHLETE' => 'Athlete / رياضي',
            'INTERNATIONAL' => 'International / دولي',
            'OTHER' => 'Other / أخرى',
            default => $this->tag_category,
        };
    }

    public function isExpired(): bool
    {
        return $this->valid_until && $this->valid_until->isPast();
    }

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->valid_from && $this->valid_from->isFuture()) {
            return false;
        }

        if ($this->valid_until && $this->valid_until->isPast()) {
            return false;
        }

        return true;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now());
            });
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('tag_category', $category);
    }

    public function scopeByName($query, string $name)
    {
        return $query->where('tag_name', $name);
    }

    // Common tag checks
    public static function isScholarshipStudent(Student $student): bool
    {
        return $student->studentTags()
            ->valid()
            ->byCategory('SCHOLARSHIP')
            ->exists();
    }

    public static function isAtRisk(Student $student): bool
    {
        return $student->studentTags()
            ->valid()
            ->byCategory('RISK')
            ->exists();
    }

    public static function isAthlete(Student $student): bool
    {
        return $student->studentTags()
            ->valid()
            ->byCategory('ATHLETE')
            ->exists();
    }
}

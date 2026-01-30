<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradingScale extends Model
{
    use HasFactory;

    protected $fillable = [
        'letter_grade',
        'min_score',
        'max_score',
        'grade_points',
        'description_en',
        'description_ar',
        'is_passing',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_score' => 'decimal:2',
            'max_score' => 'decimal:2',
            'grade_points' => 'decimal:2',
            'is_passing' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get active grading scales ordered by min_score descending
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('min_score', 'desc');
    }

    /**
     * Get the grading scale for a given score
     */
    public static function getGradeForScore(float $score): ?self
    {
        return static::active()
            ->where('min_score', '<=', $score)
            ->where('max_score', '>=', $score)
            ->first();
    }

    /**
     * Calculate grade and points for a given score
     */
    public static function calculateGrade(float $score): array
    {
        $scale = static::getGradeForScore($score);

        if ($scale) {
            return [
                'grade' => $scale->letter_grade,
                'points' => (float) $scale->grade_points,
                'is_passing' => $scale->is_passing,
                'description_en' => $scale->description_en,
                'description_ar' => $scale->description_ar,
            ];
        }

        // Fallback if no scale found
        return [
            'grade' => 'F',
            'points' => 0.0,
            'is_passing' => false,
            'description_en' => 'Fail',
            'description_ar' => 'راسب',
        ];
    }
}

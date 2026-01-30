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
        'program_type', // BACHELOR, GRADUATE (Master/PhD)
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

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForBachelor($query)
    {
        return $query->where('program_type', 'BACHELOR');
    }

    public function scopeForGraduate($query)
    {
        return $query->where('program_type', 'GRADUATE');
    }

    public static function getForScore(float $score, string $programType = 'BACHELOR'): ?self
    {
        return self::where('program_type', $programType)
            ->where('is_active', true)
            ->where('min_score', '<=', $score)
            ->where('max_score', '>=', $score)
            ->first();
    }

    public static function getDefaultScales(string $programType = 'BACHELOR'): array
    {
        $bachelorScales = [
            ['letter_grade' => 'A+', 'min_score' => 96, 'max_score' => 100, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => true],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 95.99, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => true],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.70, 'description_en' => 'Very Good', 'description_ar' => 'جيد جداً', 'is_passing' => true],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.30, 'description_en' => 'Very Good', 'description_ar' => 'جيد جداً', 'is_passing' => true],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.00, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => true],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.70, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => true],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.00, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.70, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true],
            ['letter_grade' => 'D+', 'min_score' => 50, 'max_score' => 54.99, 'grade_points' => 1.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true],
            ['letter_grade' => 'D', 'min_score' => 45, 'max_score' => 49.99, 'grade_points' => 1.00, 'description_en' => 'Poor', 'description_ar' => 'ضعيف', 'is_passing' => true],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 44.99, 'grade_points' => 0.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => false],
        ];

        // Graduate scales have higher passing threshold (typically C or above = 2.0 GPA)
        $graduateScales = [
            ['letter_grade' => 'A+', 'min_score' => 96, 'max_score' => 100, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => true],
            ['letter_grade' => 'A', 'min_score' => 90, 'max_score' => 95.99, 'grade_points' => 4.00, 'description_en' => 'Excellent', 'description_ar' => 'ممتاز', 'is_passing' => true],
            ['letter_grade' => 'A-', 'min_score' => 85, 'max_score' => 89.99, 'grade_points' => 3.70, 'description_en' => 'Very Good', 'description_ar' => 'جيد جداً', 'is_passing' => true],
            ['letter_grade' => 'B+', 'min_score' => 80, 'max_score' => 84.99, 'grade_points' => 3.30, 'description_en' => 'Very Good', 'description_ar' => 'جيد جداً', 'is_passing' => true],
            ['letter_grade' => 'B', 'min_score' => 75, 'max_score' => 79.99, 'grade_points' => 3.00, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => true],
            ['letter_grade' => 'B-', 'min_score' => 70, 'max_score' => 74.99, 'grade_points' => 2.70, 'description_en' => 'Good', 'description_ar' => 'جيد', 'is_passing' => true],
            ['letter_grade' => 'C+', 'min_score' => 65, 'max_score' => 69.99, 'grade_points' => 2.30, 'description_en' => 'Satisfactory', 'description_ar' => 'مقبول', 'is_passing' => true],
            ['letter_grade' => 'C', 'min_score' => 60, 'max_score' => 64.99, 'grade_points' => 2.00, 'description_en' => 'Pass', 'description_ar' => 'مقبول', 'is_passing' => true],
            ['letter_grade' => 'C-', 'min_score' => 55, 'max_score' => 59.99, 'grade_points' => 1.70, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => false],
            ['letter_grade' => 'D+', 'min_score' => 50, 'max_score' => 54.99, 'grade_points' => 1.30, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => false],
            ['letter_grade' => 'D', 'min_score' => 45, 'max_score' => 49.99, 'grade_points' => 1.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => false],
            ['letter_grade' => 'F', 'min_score' => 0, 'max_score' => 44.99, 'grade_points' => 0.00, 'description_en' => 'Fail', 'description_ar' => 'راسب', 'is_passing' => false],
        ];

        return $programType === 'GRADUATE' ? $graduateScales : $bachelorScales;
    }
}

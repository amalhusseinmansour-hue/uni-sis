<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LectureRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'lecture_id',
        'student_id',
        'overall_rating',
        'content_rating',
        'delivery_rating',
        'materials_rating',
        'feedback',
        'is_anonymous',
    ];

    protected function casts(): array
    {
        return [
            'overall_rating' => 'integer',
            'content_rating' => 'integer',
            'delivery_rating' => 'integer',
            'materials_rating' => 'integer',
            'is_anonymous' => 'boolean',
        ];
    }

    // ==========================================
    // العلاقات
    // ==========================================

    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getAverageRatingAttribute(): float
    {
        $ratings = array_filter([
            $this->overall_rating,
            $this->content_rating,
            $this->delivery_rating,
            $this->materials_rating,
        ]);

        if (empty($ratings)) return 0;
        return round(array_sum($ratings) / count($ratings), 2);
    }

    public function getRatingStarsAttribute(): string
    {
        return str_repeat('★', $this->overall_rating) . str_repeat('☆', 5 - $this->overall_rating);
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeHighRated($query, int $minRating = 4)
    {
        return $query->where('overall_rating', '>=', $minRating);
    }

    public function scopeLowRated($query, int $maxRating = 2)
    {
        return $query->where('overall_rating', '<=', $maxRating);
    }

    public function scopeWithFeedback($query)
    {
        return $query->whereNotNull('feedback')->where('feedback', '!=', '');
    }

    // ==========================================
    // الدوال المساعدة
    // ==========================================

    /**
     * الحصول على إحصائيات التقييم لمحاضرة
     */
    public static function getLectureStats(int $lectureId): array
    {
        $ratings = self::where('lecture_id', $lectureId)->get();

        if ($ratings->isEmpty()) {
            return [
                'total_ratings' => 0,
                'average_overall' => null,
                'average_content' => null,
                'average_delivery' => null,
                'average_materials' => null,
                'distribution' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0],
            ];
        }

        $distribution = $ratings->groupBy('overall_rating')
            ->map(fn($group) => $group->count())
            ->toArray();

        return [
            'total_ratings' => $ratings->count(),
            'average_overall' => round($ratings->avg('overall_rating'), 2),
            'average_content' => round($ratings->avg('content_rating'), 2),
            'average_delivery' => round($ratings->avg('delivery_rating'), 2),
            'average_materials' => round($ratings->avg('materials_rating'), 2),
            'distribution' => array_merge([1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0], $distribution),
        ];
    }

    /**
     * الحصول على إحصائيات تقييم المحاضر
     */
    public static function getLecturerStats(int $lecturerId): array
    {
        $lectureIds = Lecture::where('lecturer_id', $lecturerId)->pluck('id');
        $ratings = self::whereIn('lecture_id', $lectureIds)->get();

        if ($ratings->isEmpty()) {
            return [
                'total_ratings' => 0,
                'average_overall' => null,
                'total_lectures_rated' => 0,
            ];
        }

        return [
            'total_ratings' => $ratings->count(),
            'average_overall' => round($ratings->avg('overall_rating'), 2),
            'average_content' => round($ratings->avg('content_rating'), 2),
            'average_delivery' => round($ratings->avg('delivery_rating'), 2),
            'average_materials' => round($ratings->avg('materials_rating'), 2),
            'total_lectures_rated' => $ratings->pluck('lecture_id')->unique()->count(),
        ];
    }
}

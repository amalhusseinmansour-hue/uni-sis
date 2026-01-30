<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'semester_id',
        'title_en',
        'title_ar',
        'description_en',
        'description_ar',
        'type',
        'start_date',
        'end_date',
        'is_all_day',
        'start_time',
        'end_time',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'is_all_day' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>=', now()->toDateString());
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForSemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }

    public function isOngoing(): bool
    {
        $today = now()->toDateString();
        return $this->start_date <= $today && ($this->end_date ?? $this->start_date) >= $today;
    }

    public function isPast(): bool
    {
        return ($this->end_date ?? $this->start_date) < now()->toDateString();
    }

    public function isFuture(): bool
    {
        return $this->start_date > now()->toDateString();
    }
}

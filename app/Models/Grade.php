<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'enrollment_id',
        'semester_id',
        'semester',
        'midterm',
        'final',
        'coursework',
        'total',
        'grade',
        'points',
        'status',
        'remarks',
        // API aliases
        'midterm_score',
        'final_score',
        'assignments_score',
        'total_score',
        'letter_grade',
        'grade_points',
    ];

    // Include accessors in JSON output for API compatibility
    protected $appends = [
        'midterm_score',
        'final_score',
        'assignments_score',
        'total_score',
        'letter_grade',
        'grade_points',
    ];

    protected function casts(): array
    {
        return [
            'midterm' => 'decimal:2',
            'final' => 'decimal:2',
            'coursework' => 'decimal:2',
            'total' => 'decimal:2',
            'points' => 'decimal:2',
        ];
    }

    // Accessors for API compatibility
    public function getMidtermScoreAttribute()
    {
        return $this->midterm;
    }

    public function setMidtermScoreAttribute($value)
    {
        $this->attributes['midterm'] = $value;
    }

    public function getFinalScoreAttribute()
    {
        return $this->final;
    }

    public function setFinalScoreAttribute($value)
    {
        $this->attributes['final'] = $value;
    }

    public function getAssignmentsScoreAttribute()
    {
        return $this->coursework;
    }

    public function setAssignmentsScoreAttribute($value)
    {
        $this->attributes['coursework'] = $value;
    }

    public function getTotalScoreAttribute()
    {
        return $this->total;
    }

    public function setTotalScoreAttribute($value)
    {
        $this->attributes['total'] = $value;
    }

    public function getLetterGradeAttribute()
    {
        return $this->grade;
    }

    public function setLetterGradeAttribute($value)
    {
        $this->attributes['grade'] = $value;
    }

    public function getGradePointsAttribute()
    {
        return $this->points;
    }

    public function setGradePointsAttribute($value)
    {
        $this->attributes['points'] = $value;
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public static function calculateGrade(float $total): array
    {
        if ($total >= 90) return ['grade' => 'A', 'points' => 4.0];
        if ($total >= 85) return ['grade' => 'A-', 'points' => 3.7];
        if ($total >= 80) return ['grade' => 'B+', 'points' => 3.3];
        if ($total >= 75) return ['grade' => 'B', 'points' => 3.0];
        if ($total >= 70) return ['grade' => 'B-', 'points' => 2.7];
        if ($total >= 65) return ['grade' => 'C+', 'points' => 2.3];
        if ($total >= 60) return ['grade' => 'C', 'points' => 2.0];
        if ($total >= 55) return ['grade' => 'C-', 'points' => 1.7];
        if ($total >= 50) return ['grade' => 'D', 'points' => 1.0];
        return ['grade' => 'F', 'points' => 0.0];
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'APPROVED');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }
}

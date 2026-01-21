<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'college_id',
        'department_id',
        'code',
        'name_en',
        'name_ar',
        'credits',
        'schedule',
        'instructor',
        'enrolled',
        'capacity',
        'description',
        'description_en',
        'description_ar',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function college(): BelongsTo
    {
        return $this->belongsTo(College::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function moodleCourse(): HasOne
    {
        return $this->hasOne(MoodleCourse::class);
    }

    /**
     * Programs that include this course in their study plan
     */
    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'program_courses')
            ->withPivot('semester', 'type', 'is_common', 'order')
            ->withTimestamps();
    }

    // Prerequisites: courses that must be taken before this course
    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_prerequisites', 'course_id', 'prerequisite_id')
            ->withPivot(['min_grade', 'is_required'])
            ->withTimestamps();
    }

    // Courses that require this course as a prerequisite
    public function prerequisiteFor(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_prerequisites', 'prerequisite_id', 'course_id')
            ->withPivot(['min_grade', 'is_required'])
            ->withTimestamps();
    }

    public function getAvailableSlotsAttribute(): int
    {
        return $this->capacity - ($this->enrolled ?? $this->enrollments()->where('status', 'ENROLLED')->count());
    }

    public function isAvailable(): bool
    {
        return $this->is_active && $this->available_slots > 0;
    }

    public function hasPrerequisite(int $prerequisiteId): bool
    {
        return $this->prerequisites()->where('prerequisite_id', $prerequisiteId)->exists();
    }

    public function getPrerequisitesList(): array
    {
        return $this->prerequisites->map(function ($course) {
            return [
                'id' => $course->id,
                'code' => $course->code,
                'name_en' => $course->name_en,
                'name_ar' => $course->name_ar,
                'min_grade' => $course->pivot->min_grade,
                'is_required' => $course->pivot->is_required,
            ];
        })->toArray();
    }

    /**
     * Check if a student can enroll in this course
     */
    public function canStudentEnroll(Student $student): array
    {
        $result = ['can_enroll' => true, 'reasons' => []];

        // Check if course is available
        if (!$this->isAvailable()) {
            $result['can_enroll'] = false;
            $result['reasons'][] = 'Course is not available or full';
        }

        // Check prerequisites
        foreach ($this->prerequisites as $prerequisite) {
            $grade = Grade::where('student_id', $student->id)
                ->where('course_id', $prerequisite->id)
                ->where('status', 'APPROVED')
                ->first();

            if (!$grade) {
                if ($prerequisite->pivot->is_required) {
                    $result['can_enroll'] = false;
                    $result['reasons'][] = "Prerequisite not met: {$prerequisite->code} - {$prerequisite->name_en}";
                }
            } elseif ($prerequisite->pivot->min_grade) {
                // Check if grade meets minimum requirement
                $gradeOrder = ['A+' => 12, 'A' => 11, 'A-' => 10, 'B+' => 9, 'B' => 8, 'B-' => 7,
                              'C+' => 6, 'C' => 5, 'C-' => 4, 'D+' => 3, 'D' => 2, 'F' => 0];
                $studentGradeValue = $gradeOrder[$grade->grade] ?? 0;
                $requiredGradeValue = $gradeOrder[$prerequisite->pivot->min_grade] ?? 0;

                if ($studentGradeValue < $requiredGradeValue) {
                    $result['can_enroll'] = false;
                    $result['reasons'][] = "Minimum grade {$prerequisite->pivot->min_grade} required in {$prerequisite->code}";
                }
            }
        }

        // Check if already enrolled
        $existingEnrollment = Enrollment::where('student_id', $student->id)
            ->where('course_id', $this->id)
            ->whereIn('status', ['ENROLLED'])
            ->exists();

        if ($existingEnrollment) {
            $result['can_enroll'] = false;
            $result['reasons'][] = 'Already enrolled in this course';
        }

        return $result;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
            ->whereColumn('enrolled', '<', 'capacity');
    }
}

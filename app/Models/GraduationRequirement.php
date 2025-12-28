<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GraduationRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        // Overall Credits
        'total_credits_required',
        'total_credits_completed',
        'total_credits_in_progress',
        'total_credits_remaining',
        'completion_percentage',
        // University Requirements
        'university_required_credits',
        'university_required_completed',
        'university_elective_credits',
        'university_elective_completed',
        // College Requirements
        'college_required_credits',
        'college_required_completed',
        'college_elective_credits',
        'college_elective_completed',
        // Major Requirements
        'major_required_credits',
        'major_required_completed',
        'major_elective_credits',
        'major_elective_completed',
        // Free Electives
        'free_elective_credits',
        'free_elective_completed',
        // Special Requirements
        'internship_required',
        'internship_completed',
        'internship_hours_required',
        'internship_hours_completed',
        'graduation_project_required',
        'graduation_project_completed',
        'thesis_required',
        'thesis_completed',
        'comprehensive_exam_required',
        'comprehensive_exam_passed',
        // Language Requirements
        'english_requirement_met',
        'english_test_type',
        'english_test_score',
        'arabic_requirement_met',
        // GPA Requirements
        'minimum_gpa_required',
        'gpa_requirement_met',
        // Deficiencies
        'missing_required_courses',
        'deficiencies',
        'notes',
        // Eligibility
        'is_eligible_to_graduate',
        'eligibility_checked_at',
        'eligibility_checked_by',
    ];

    protected function casts(): array
    {
        return [
            'completion_percentage' => 'decimal:2',
            'minimum_gpa_required' => 'decimal:2',
            'internship_required' => 'boolean',
            'internship_completed' => 'boolean',
            'graduation_project_required' => 'boolean',
            'graduation_project_completed' => 'boolean',
            'thesis_required' => 'boolean',
            'thesis_completed' => 'boolean',
            'comprehensive_exam_required' => 'boolean',
            'comprehensive_exam_passed' => 'boolean',
            'english_requirement_met' => 'boolean',
            'arabic_requirement_met' => 'boolean',
            'gpa_requirement_met' => 'boolean',
            'is_eligible_to_graduate' => 'boolean',
            'eligibility_checked_at' => 'datetime',
            'missing_required_courses' => 'array',
            'deficiencies' => 'array',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function eligibilityChecker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'eligibility_checked_by');
    }

    // Credit Calculations
    public function getUniversityProgressAttribute(): float
    {
        $total = $this->university_required_credits + $this->university_elective_credits;
        $completed = $this->university_required_completed + $this->university_elective_completed;

        return $total > 0 ? round(($completed / $total) * 100, 1) : 0;
    }

    public function getCollegeProgressAttribute(): float
    {
        $total = $this->college_required_credits + $this->college_elective_credits;
        $completed = $this->college_required_completed + $this->college_elective_completed;

        return $total > 0 ? round(($completed / $total) * 100, 1) : 0;
    }

    public function getMajorProgressAttribute(): float
    {
        $total = $this->major_required_credits + $this->major_elective_credits;
        $completed = $this->major_required_completed + $this->major_elective_completed;

        return $total > 0 ? round(($completed / $total) * 100, 1) : 0;
    }

    public function getFreeElectiveProgressAttribute(): float
    {
        return $this->free_elective_credits > 0
            ? round(($this->free_elective_completed / $this->free_elective_credits) * 100, 1)
            : 0;
    }

    public function getInternshipProgressAttribute(): float
    {
        if (!$this->internship_required) {
            return 100;
        }
        if ($this->internship_completed) {
            return 100;
        }

        return $this->internship_hours_required > 0
            ? round(($this->internship_hours_completed / $this->internship_hours_required) * 100, 1)
            : 0;
    }

    // Requirement Status Checks
    public function hasMetCreditRequirements(): bool
    {
        return $this->total_credits_completed >= $this->total_credits_required;
    }

    public function hasMetUniversityRequirements(): bool
    {
        return $this->university_required_completed >= $this->university_required_credits
            && $this->university_elective_completed >= $this->university_elective_credits;
    }

    public function hasMetCollegeRequirements(): bool
    {
        return $this->college_required_completed >= $this->college_required_credits
            && $this->college_elective_completed >= $this->college_elective_credits;
    }

    public function hasMetMajorRequirements(): bool
    {
        return $this->major_required_completed >= $this->major_required_credits
            && $this->major_elective_completed >= $this->major_elective_credits;
    }

    public function hasMetSpecialRequirements(): bool
    {
        $internshipMet = !$this->internship_required || $this->internship_completed;
        $projectMet = !$this->graduation_project_required || $this->graduation_project_completed;
        $thesisMet = !$this->thesis_required || $this->thesis_completed;
        $examMet = !$this->comprehensive_exam_required || $this->comprehensive_exam_passed;

        return $internshipMet && $projectMet && $thesisMet && $examMet;
    }

    public function getDeficiencyListAttribute(): array
    {
        $deficiencies = [];

        if (!$this->hasMetCreditRequirements()) {
            $deficiencies[] = "Need {$this->total_credits_remaining} more credits";
        }

        if (!$this->hasMetUniversityRequirements()) {
            $remaining = ($this->university_required_credits - $this->university_required_completed)
                + ($this->university_elective_credits - $this->university_elective_completed);
            if ($remaining > 0) {
                $deficiencies[] = "Need {$remaining} more university credits";
            }
        }

        if (!$this->hasMetCollegeRequirements()) {
            $remaining = ($this->college_required_credits - $this->college_required_completed)
                + ($this->college_elective_credits - $this->college_elective_completed);
            if ($remaining > 0) {
                $deficiencies[] = "Need {$remaining} more college credits";
            }
        }

        if (!$this->gpa_requirement_met) {
            $deficiencies[] = "GPA below minimum requirement ({$this->minimum_gpa_required})";
        }

        if ($this->internship_required && !$this->internship_completed) {
            $deficiencies[] = 'Internship not completed';
        }

        if ($this->graduation_project_required && !$this->graduation_project_completed) {
            $deficiencies[] = 'Graduation project not completed';
        }

        if ($this->thesis_required && !$this->thesis_completed) {
            $deficiencies[] = 'Thesis not completed';
        }

        if (!$this->english_requirement_met) {
            $deficiencies[] = 'English requirement not met';
        }

        if (!empty($this->missing_required_courses)) {
            $deficiencies[] = count($this->missing_required_courses) . ' required courses missing';
        }

        return $deficiencies;
    }

    public function checkEligibility(): bool
    {
        $eligible = $this->hasMetCreditRequirements()
            && $this->hasMetUniversityRequirements()
            && $this->hasMetCollegeRequirements()
            && $this->hasMetMajorRequirements()
            && $this->hasMetSpecialRequirements()
            && $this->gpa_requirement_met
            && $this->english_requirement_met
            && empty($this->missing_required_courses);

        $this->update([
            'is_eligible_to_graduate' => $eligible,
            'eligibility_checked_at' => now(),
        ]);

        return $eligible;
    }

    // Scopes
    public function scopeEligible($query)
    {
        return $query->where('is_eligible_to_graduate', true);
    }

    public function scopeNotEligible($query)
    {
        return $query->where('is_eligible_to_graduate', false);
    }

    public function scopeWithDeficiencies($query)
    {
        return $query->where(function ($q) {
            $q->whereRaw('total_credits_completed < total_credits_required')
                ->orWhere('gpa_requirement_met', false)
                ->orWhereNotNull('missing_required_courses');
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        // User & Program Relations
        'user_id',
        'program_id',
        'advisor_id',

        // Student Card Info
        'student_id',
        'name_ar',
        'name_en',
        'profile_picture',
        'qr_code',
        'barcode',
        'status',
        'program_type',

        // Arabic Name Parts
        'first_name_ar',
        'middle_name_ar',
        'last_name_ar',
        'fourth_name_ar',

        // English Name Parts
        'first_name_en',
        'middle_name_en',
        'last_name_en',
        'fourth_name_en',

        // Personal Data
        'national_id',
        'passport_number',
        'id_type',
        'id_expiry_date',
        'passport_expiry_date',
        'date_of_birth',
        'birth_city',
        'birth_country',
        'gender',
        'nationality',
        'secondary_nationality',
        'marital_status',
        'religion',
        'primary_language',
        'admission_date',

        // Residency Info
        'residency_type',
        'residency_number',
        'refugee_card_number',
        'current_residence_country',
        'residency_expiry_date',

        // Contact Information
        'phone',
        'alternative_phone',
        'landline_phone',
        'personal_email',
        'university_email',
        'linkedin_profile',
        'telegram_username',

        // Permanent Address
        'address_country',
        'address_region',
        'address_city',
        'address_street',
        'address_neighborhood',
        'address_description',
        'postal_code',

        // Current Address
        'current_address_country',
        'current_address_region',
        'current_address_city',
        'current_address_street',
        'current_address_neighborhood',
        'current_address_description',
        'current_postal_code',

        // Guardian Information
        'guardian_name',
        'guardian_relationship',
        'guardian_phone',
        'guardian_alternative_phone',
        'guardian_email',
        'guardian_address',
        'guardian_occupation',
        'guardian_workplace',

        // Mother Information
        'mother_name',
        'mother_phone',

        // Family Details
        'family_members_count',
        'siblings_in_university',

        // Emergency Contact 1
        'emergency_name',
        'emergency_phone',
        'emergency_relationship',
        'emergency_notes',

        // Emergency Contact 2
        'emergency2_name',
        'emergency2_phone',
        'emergency2_relationship',
        'emergency2_notes',

        // Previous Education
        'high_school_certificate_type',
        'high_school_track',
        'high_school_country',
        'high_school_name',
        'high_school_graduation_year',
        'high_school_gpa',
        'high_school_seat_number',

        // Academic Information
        'college',
        'department',
        'major',
        'degree',
        'study_plan_code',
        'study_plan_name',
        'cohort',
        'first_enrollment_term',
        'level',
        'current_semester',
        'academic_status',
        'administrative_status',

        // Academic Summary
        'total_required_credits',
        'completed_credits',
        'registered_credits',
        'remaining_credits',
        'academic_warnings_count',
        'term_gpa',
        'gpa',

        // Graduation Tracking
        'has_completed_required_credits',
        'has_completed_core_courses',
        'has_completed_electives',
        'graduation_application_status',
        'graduation_project_title',
        'graduation_project_supervisor',
        'graduation_project_status',
        'graduation_project_grade',
        'internship_organization',
        'internship_hours',
        'internship_status',

        // Financial Summary
        'total_fees',
        'paid_amount',
        'current_balance',
        'previous_balance',
        'scholarships',
        'financial_status',

        // Systems & Accounts
        'sis_username',
        'lms_username',
        'sis_account_status',
        'lms_account_status',
        'account_status',
        'last_login',

        // Notes and Classifications
        'tags',
        'admission_notes',
        'student_affairs_notes',
        'advisor_notes',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'admission_date' => 'date',
            'id_expiry_date' => 'date',
            'passport_expiry_date' => 'date',
            'residency_expiry_date' => 'date',
            'last_login' => 'datetime',
            'term_gpa' => 'decimal:2',
            'gpa' => 'decimal:2',
            'high_school_gpa' => 'decimal:2',
            'graduation_project_grade' => 'decimal:2',
            'total_fees' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'current_balance' => 'decimal:2',
            'previous_balance' => 'decimal:2',
            'scholarships' => 'decimal:2',
            'tags' => 'array',
            'has_completed_required_credits' => 'boolean',
            'has_completed_core_courses' => 'boolean',
            'has_completed_electives' => 'boolean',
        ];
    }

    // ==========================================
    // Core Relationships
    // ==========================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function departmentModel(): HasOne
    {
        return $this->hasOne(Department::class, 'id', 'department');
    }

    public function advisor(): BelongsTo
    {
        return $this->belongsTo(Advisor::class);
    }

    // ==========================================
    // Academic Relationships
    // ==========================================

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function currentEnrollments(): HasMany
    {
        return $this->enrollments()
            ->whereHas('semester', fn($q) => $q->where('is_current', true))
            ->where('status', 'ENROLLED');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function approvedGrades(): HasMany
    {
        return $this->grades()->whereIn('status', ['APPROVED', 'FINAL']);
    }

    public function studyPlanCourses(): HasMany
    {
        return $this->hasMany(StudentStudyPlanCourse::class);
    }

    public function semesterSummaries(): HasMany
    {
        return $this->hasMany(StudentSemesterSummary::class);
    }

    public function enrollmentActions(): HasMany
    {
        return $this->hasMany(EnrollmentAction::class);
    }

    // ==========================================
    // Financial Relationships
    // ==========================================

    public function financialRecords(): HasMany
    {
        return $this->hasMany(FinancialRecord::class);
    }

    // ==========================================
    // Document Relationships
    // ==========================================

    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function documentsV2(): HasMany
    {
        return $this->hasMany(StudentDocumentV2::class);
    }

    // ==========================================
    // Guardian & Family Relationships
    // ==========================================

    public function guardians(): HasMany
    {
        return $this->hasMany(StudentGuardian::class);
    }

    public function primaryGuardian(): HasOne
    {
        return $this->hasOne(StudentGuardian::class)->where('is_primary', true);
    }

    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(EmergencyContact::class)->orderBy('priority');
    }

    // ==========================================
    // Education & Special Needs Relationships
    // ==========================================

    public function previousEducation(): HasMany
    {
        return $this->hasMany(PreviousEducation::class);
    }

    public function specialNeeds(): HasOne
    {
        return $this->hasOne(StudentSpecialNeeds::class);
    }

    // ==========================================
    // Notes & Tags Relationships
    // ==========================================

    public function notes(): HasMany
    {
        return $this->hasMany(StudentNote::class);
    }

    public function studentTags(): HasMany
    {
        return $this->hasMany(StudentTag::class);
    }

    public function activeTags(): HasMany
    {
        return $this->studentTags()->where('is_active', true);
    }

    // ==========================================
    // Academic Advising Relationships
    // ==========================================

    public function advisingSessions(): HasMany
    {
        return $this->hasMany(AcademicAdvisingSession::class);
    }

    // ==========================================
    // Graduation Relationships
    // ==========================================

    public function graduationRequirements(): HasOne
    {
        return $this->hasOne(GraduationRequirement::class);
    }

    public function graduationApplications(): HasMany
    {
        return $this->hasMany(GraduationApplication::class);
    }

    public function latestGraduationApplication(): HasOne
    {
        return $this->hasOne(GraduationApplication::class)->latestOfMany();
    }

    // ==========================================
    // Service Request Relationships
    // ==========================================

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    // ==========================================
    // Discipline Relationships
    // ==========================================

    public function disciplineIncidents(): HasMany
    {
        return $this->hasMany(DisciplineIncident::class);
    }

    public function activeDisciplineIncidents(): HasMany
    {
        return $this->disciplineIncidents()->whereNotIn('status', ['DISMISSED', 'RESOLVED']);
    }

    public function disciplineActions(): HasMany
    {
        return $this->hasMany(DisciplineAction::class);
    }

    public function activeDisciplineActions(): HasMany
    {
        return $this->disciplineActions()->where('status', 'ACTIVE');
    }

    public function disciplinePoints(): HasMany
    {
        return $this->hasMany(DisciplinePoints::class);
    }

    public function currentDisciplinePoints(): HasOne
    {
        return $this->hasOne(DisciplinePoints::class)
            ->whereHas('semester', fn($q) => $q->where('is_current', true));
    }

    public function disciplineAppeals(): HasMany
    {
        return $this->hasMany(DisciplineAppeal::class);
    }

    // ==========================================
    // Notification Relationships
    // ==========================================

    public function notifications(): HasManyThrough
    {
        return $this->hasManyThrough(
            Notification::class,
            User::class,
            'id',
            'user_id',
            'user_id',
            'id'
        );
    }

    // ==========================================
    // Moodle Integration Relationships
    // ==========================================

    public function moodleUser(): HasOne
    {
        return $this->hasOne(MoodleUser::class);
    }

    // ==========================================
    // Schedule
    // ==========================================

    public function schedules()
    {
        return Schedule::whereIn('course_id', $this->currentEnrollments()->pluck('course_id'))
            ->whereHas('semester', fn($q) => $q->where('is_current', true));
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getFullNameAttribute(): string
    {
        return $this->name_en;
    }

    public function getFullNameArAttribute(): string
    {
        return $this->name_ar ?? $this->name_en;
    }

    public function getFullNamePartsEnAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name_en,
            $this->middle_name_en,
            $this->last_name_en,
            $this->fourth_name_en
        ])));
    }

    public function getFullNamePartsArAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name_ar,
            $this->middle_name_ar,
            $this->last_name_ar,
            $this->fourth_name_ar
        ])));
    }

    public function getEmailAttribute(): string
    {
        return $this->university_email ?? $this->personal_email ?? '';
    }

    public function getAcademicStandingAttribute(): string
    {
        $gpa = (float) $this->gpa;
        return match (true) {
            $gpa >= 3.7 => 'Dean\'s List',
            $gpa >= 3.0 => 'Good Standing',
            $gpa >= 2.0 => 'Satisfactory',
            $gpa >= 1.0 => 'Probation',
            default => 'Academic Suspension',
        };
    }

    public function getAcademicStandingArAttribute(): string
    {
        $gpa = (float) $this->gpa;
        return match (true) {
            $gpa >= 3.7 => 'قائمة العميد',
            $gpa >= 3.0 => 'وضع جيد',
            $gpa >= 2.0 => 'مرضي',
            $gpa >= 1.0 => 'إنذار أكاديمي',
            default => 'فصل أكاديمي',
        };
    }

    public function getProgressPercentageAttribute(): float
    {
        if (!$this->total_required_credits || $this->total_required_credits == 0) {
            return 0;
        }
        return round(($this->completed_credits / $this->total_required_credits) * 100, 1);
    }

    public function getOutstandingBalanceAttribute(): float
    {
        return (float) $this->current_balance;
    }

    public function getProfilePictureUrlAttribute(): ?string
    {
        if (!$this->profile_picture) {
            return null;
        }
        return asset('storage/' . $this->profile_picture);
    }

    public function getLevelDisplayAttribute(): string
    {
        return "Year {$this->level}, Semester {$this->current_semester}";
    }

    public function getLevelDisplayArAttribute(): string
    {
        return "السنة {$this->level}، الفصل {$this->current_semester}";
    }

    public function getHasSpecialNeedsAttribute(): bool
    {
        return $this->specialNeeds?->has_special_needs ?? false;
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByProgram($query, $programId)
    {
        return $query->where('program_id', $programId);
    }

    public function scopeByDepartment($query, $departmentId)
    {
        return $query->whereHas('program', fn($q) => $q->where('department_id', $departmentId));
    }

    public function scopeByCollege($query, $collegeId)
    {
        return $query->whereHas('program.department', fn($q) => $q->where('college_id', $collegeId));
    }

    public function scopeWithGoodStanding($query)
    {
        return $query->where('gpa', '>=', 2.0);
    }

    public function scopeOnProbation($query)
    {
        return $query->where('gpa', '<', 2.0)->where('gpa', '>=', 1.0);
    }

    public function scopeWithSpecialNeeds($query)
    {
        return $query->whereHas('specialNeeds', fn($q) => $q->where('has_special_needs', true));
    }

    public function scopeEligibleForGraduation($query)
    {
        return $query->whereHas('graduationRequirements', fn($q) => $q->where('is_eligible_to_graduate', true));
    }

    public function scopeWithTag($query, string $tagName)
    {
        return $query->whereHas('studentTags', fn($q) => $q->where('tag_name', $tagName)->where('is_active', true));
    }

    public function scopeScholarship($query)
    {
        return $query->where('scholarships', '>', 0);
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    public function calculateGPA(): float
    {
        $grades = $this->approvedGrades()->with('course')->get();

        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($grades as $grade) {
            $credits = $grade->course->credits ?? 0;
            $points = $this->gradeToPoints($grade->grade) * $credits;
            $totalPoints += $points;
            $totalCredits += $credits;
        }

        return $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;
    }

    private function gradeToPoints(string $grade): float
    {
        return match ($grade) {
            'A+', 'A' => 4.0,
            'A-' => 3.7,
            'B+' => 3.3,
            'B' => 3.0,
            'B-' => 2.7,
            'C+' => 2.3,
            'C' => 2.0,
            'C-' => 1.7,
            'D+' => 1.3,
            'D' => 1.0,
            'F' => 0.0,
            default => 0.0,
        };
    }

    public function canEnrollInCourse(Course $course): array
    {
        return $course->canStudentEnroll($this);
    }

    public function hasCompletedCourse(int $courseId): bool
    {
        return $this->grades()
            ->where('course_id', $courseId)
            ->whereIn('status', ['APPROVED', 'FINAL'])
            ->where('grade', '!=', 'F')
            ->exists();
    }

    public function getGradeForCourse(int $courseId): ?string
    {
        return $this->grades()
            ->where('course_id', $courseId)
            ->whereIn('status', ['APPROVED', 'FINAL'])
            ->value('grade');
    }

    public function isEligibleForGraduation(): bool
    {
        $requirements = $this->graduationRequirements;
        return $requirements?->is_eligible_to_graduate ?? false;
    }

    public function getActiveTagNames(): array
    {
        return $this->activeTags()->pluck('tag_name')->toArray();
    }

    public function addTag(string $tagName, string $category = 'OTHER', int $addedBy = null): StudentTag
    {
        return $this->studentTags()->create([
            'tag_name' => $tagName,
            'tag_category' => $category,
            'added_by' => $addedBy ?? auth()->id(),
            'is_active' => true,
        ]);
    }

    public function removeTag(string $tagName): void
    {
        $this->studentTags()
            ->where('tag_name', $tagName)
            ->update(['is_active' => false]);
    }

    public function generateQRCode(): string
    {
        // Generate a QR code containing student info
        // This would typically integrate with a QR code library
        $qrData = json_encode([
            'student_id' => $this->student_id,
            'name' => $this->name_en,
            'program' => $this->program?->name_en,
        ]);

        // Store and return the path
        // Implementation depends on QR code library choice
        return $qrData;
    }
}

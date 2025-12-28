<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSemesterSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'semester_id',
        'status',
        'initial_registered_credits',
        'final_registered_credits',
        'dropped_credits',
        'added_credits',
        'term_gpa',
        'cumulative_gpa',
        'courses_registered',
        'courses_dropped',
        'courses_failed',
        'courses_passed',
        'courses_incomplete',
        'academic_standing',
        'semester_fees',
        'paid_amount',
        'balance',
        'financial_status',
        'overall_attendance_percentage',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'term_gpa' => 'decimal:2',
            'cumulative_gpa' => 'decimal:2',
            'semester_fees' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'balance' => 'decimal:2',
            'overall_attendance_percentage' => 'decimal:2',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'REGISTERED' => 'Registered / مسجل',
            'POSTPONED' => 'Postponed / مؤجل',
            'WITHDRAWN' => 'Withdrawn / منسحب',
            'DISMISSED' => 'Dismissed / مفصول',
            'NOT_REGISTERED' => 'Not Registered / غير مسجل',
            default => $this->status,
        };
    }

    public function getAcademicStandingLabelAttribute(): string
    {
        return match ($this->academic_standing) {
            'DEANS_LIST' => 'Dean\'s List / قائمة العميد',
            'GOOD_STANDING' => 'Good Standing / وضع جيد',
            'SATISFACTORY' => 'Satisfactory / مرضي',
            'FIRST_PROBATION' => 'First Probation / إنذار أول',
            'SECOND_PROBATION' => 'Second Probation / إنذار ثاني',
            'FINAL_PROBATION' => 'Final Probation / إنذار نهائي',
            'DISMISSAL' => 'Dismissal / فصل',
            default => $this->academic_standing ?? 'N/A',
        };
    }

    public function getFinancialStatusLabelAttribute(): string
    {
        return match ($this->financial_status) {
            'CLEARED' => 'Cleared / مسدد',
            'PARTIAL' => 'Partial Payment / دفع جزئي',
            'UNPAID' => 'Unpaid / غير مسدد',
            'ON_HOLD' => 'On Hold / موقوف',
            default => $this->financial_status,
        };
    }

    public function getCreditChangeAttribute(): int
    {
        return $this->final_registered_credits - $this->initial_registered_credits;
    }

    public function getPassRateAttribute(): ?float
    {
        $totalCompleted = $this->courses_passed + $this->courses_failed;
        if ($totalCompleted === 0) {
            return null;
        }
        return round(($this->courses_passed / $totalCompleted) * 100, 1);
    }

    public function isOnProbation(): bool
    {
        return in_array($this->academic_standing, [
            'FIRST_PROBATION',
            'SECOND_PROBATION',
            'FINAL_PROBATION'
        ]);
    }

    public function hasOutstandingBalance(): bool
    {
        return $this->balance > 0;
    }

    public function scopeRegistered($query)
    {
        return $query->where('status', 'REGISTERED');
    }

    public function scopePostponed($query)
    {
        return $query->where('status', 'POSTPONED');
    }

    public function scopeWithdrawn($query)
    {
        return $query->where('status', 'WITHDRAWN');
    }

    public function scopeOnProbation($query)
    {
        return $query->whereIn('academic_standing', [
            'FIRST_PROBATION',
            'SECOND_PROBATION',
            'FINAL_PROBATION'
        ]);
    }

    public function scopeDeansListStudents($query)
    {
        return $query->where('academic_standing', 'DEANS_LIST');
    }

    public function scopeWithOutstandingBalance($query)
    {
        return $query->where('balance', '>', 0);
    }

    public function scopeForSemester($query, $semesterId)
    {
        return $query->where('semester_id', $semesterId);
    }
}

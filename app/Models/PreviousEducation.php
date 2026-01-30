<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreviousEducation extends Model
{
    use HasFactory;

    protected $table = 'previous_education';

    protected $fillable = [
        'student_id',
        'education_level',
        'certificate_type',
        'high_school_track',
        'country',
        'city',
        'institution_name',
        'institution_name_en',
        'specialization',
        'specialization_en',
        'graduation_year',
        'graduation_date',
        'seat_number',
        'certificate_number',
        'gpa',
        'gpa_scale',
        'grade_letter',
        'total_score',
        'max_score',
        'class_rank',
        'verification_status',
        'verification_date',
        'verified_by',
        'is_primary',
        'notes',
        'additional_info',
    ];

    protected function casts(): array
    {
        return [
            'graduation_date' => 'date',
            'verification_date' => 'date',
            'gpa' => 'decimal:2',
            'is_primary' => 'boolean',
            'additional_info' => 'array',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function getEducationLevelLabelAttribute(): string
    {
        return match ($this->education_level) {
            'HIGH_SCHOOL' => 'High School / ثانوية عامة',
            'DIPLOMA' => 'Diploma / دبلوم',
            'BACHELOR' => 'Bachelor\'s Degree / بكالوريوس',
            'MASTER' => 'Master\'s Degree / ماجستير',
            'PHD' => 'Ph.D. / دكتوراه',
            'PROFESSIONAL' => 'Professional Certificate / شهادة مهنية',
            'OTHER' => 'Other / أخرى',
            default => $this->education_level,
        };
    }

    public function getCertificateTypeLabelAttribute(): string
    {
        return match ($this->certificate_type) {
            'TAWJIHI' => 'Tawjihi / توجيهي',
            'EQUIVALENT' => 'Equivalent / معادلة',
            'INTERNATIONAL' => 'International (IB, SAT) / دولية',
            'GED' => 'GED',
            'BRITISH' => 'British System (IGCSE, A-Levels)',
            'AMERICAN' => 'American High School Diploma',
            'OTHER' => 'Other / أخرى',
            default => $this->certificate_type ?? '',
        };
    }

    public function getHighSchoolTrackLabelAttribute(): string
    {
        return match ($this->high_school_track) {
            'SCIENTIFIC' => 'Scientific / علمي',
            'LITERARY' => 'Literary / أدبي',
            'RELIGIOUS' => 'Religious / شرعي',
            'TECHNOLOGY' => 'Technology / تكنولوجيا',
            'COMMERCIAL' => 'Commercial / تجاري',
            'INDUSTRIAL' => 'Industrial / صناعي',
            'AGRICULTURAL' => 'Agricultural / زراعي',
            'NURSING' => 'Nursing / تمريض',
            'HOTEL_MANAGEMENT' => 'Hotel Management / إدارة فندقية',
            'OTHER' => 'Other / أخرى',
            default => $this->high_school_track ?? '',
        };
    }

    public function getScorePercentageAttribute(): ?float
    {
        if ($this->total_score && $this->max_score && $this->max_score > 0) {
            return round(($this->total_score / $this->max_score) * 100, 2);
        }
        return null;
    }

    public function scopeHighSchool($query)
    {
        return $query->where('education_level', 'HIGH_SCHOOL');
    }

    public function scopeBachelor($query)
    {
        return $query->where('education_level', 'BACHELOR');
    }

    public function scopeMaster($query)
    {
        return $query->where('education_level', 'MASTER');
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'VERIFIED');
    }

    public function scopePending($query)
    {
        return $query->where('verification_status', 'PENDING');
    }
}

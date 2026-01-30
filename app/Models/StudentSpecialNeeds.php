<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSpecialNeeds extends Model
{
    use HasFactory;

    protected $table = 'student_special_needs';

    protected $fillable = [
        'student_id',
        // Special Needs
        'has_special_needs',
        'special_need_type',
        'special_need_type_other',
        'severity_level',
        'condition_description',
        // Medical
        'has_chronic_illness',
        'chronic_illnesses',
        'has_allergies',
        'allergies',
        'blood_type',
        'current_medications',
        'medical_notes',
        'emergency_medical_contact',
        'preferred_hospital',
        // Accommodations
        'requires_accommodations',
        'needs_extra_time',
        'extra_time_percentage',
        'needs_separate_room',
        'needs_reader',
        'needs_scribe',
        'needs_enlarged_text',
        'needs_braille',
        'needs_audio_exam',
        'needs_computer',
        'needs_rest_breaks',
        'rest_break_frequency',
        'needs_front_seat',
        'needs_wheelchair_access',
        'needs_elevator_access',
        'needs_sign_interpreter',
        'needs_note_taker',
        'needs_recording_permission',
        'needs_priority_registration',
        'other_accommodations',
        // Documentation
        'documentation_status',
        'documentation_date',
        'documentation_expiry',
        'approved_by',
        'approval_date',
        // Privacy
        'disclose_to_instructors',
        'disclose_to_staff',
        'disclosure_notes',
        'internal_notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'has_special_needs' => 'boolean',
            'has_chronic_illness' => 'boolean',
            'has_allergies' => 'boolean',
            'requires_accommodations' => 'boolean',
            'needs_extra_time' => 'boolean',
            'needs_separate_room' => 'boolean',
            'needs_reader' => 'boolean',
            'needs_scribe' => 'boolean',
            'needs_enlarged_text' => 'boolean',
            'needs_braille' => 'boolean',
            'needs_audio_exam' => 'boolean',
            'needs_computer' => 'boolean',
            'needs_rest_breaks' => 'boolean',
            'needs_front_seat' => 'boolean',
            'needs_wheelchair_access' => 'boolean',
            'needs_elevator_access' => 'boolean',
            'needs_sign_interpreter' => 'boolean',
            'needs_note_taker' => 'boolean',
            'needs_recording_permission' => 'boolean',
            'needs_priority_registration' => 'boolean',
            'disclose_to_instructors' => 'boolean',
            'disclose_to_staff' => 'boolean',
            'is_active' => 'boolean',
            'documentation_date' => 'date',
            'documentation_expiry' => 'date',
            'approval_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function getSpecialNeedTypeLabelAttribute(): string
    {
        if ($this->special_need_type === 'OTHER') {
            return $this->special_need_type_other ?? 'Other';
        }

        return match ($this->special_need_type) {
            'HEARING' => 'Hearing Impairment / إعاقة سمعية',
            'VISUAL' => 'Visual Impairment / إعاقة بصرية',
            'MOBILITY' => 'Mobility Impairment / إعاقة حركية',
            'COGNITIVE' => 'Cognitive Impairment / إعاقة إدراكية',
            'PSYCHOLOGICAL' => 'Psychological / نفسي',
            'SPEECH' => 'Speech Impairment / إعاقة نطقية',
            'CHRONIC_ILLNESS' => 'Chronic Illness / مرض مزمن',
            'LEARNING' => 'Learning Disability / صعوبات تعلم',
            'AUTISM' => 'Autism Spectrum / طيف التوحد',
            'MULTIPLE' => 'Multiple Disabilities / إعاقات متعددة',
            default => $this->special_need_type ?? '',
        };
    }

    public function getSeverityLevelLabelAttribute(): string
    {
        return match ($this->severity_level) {
            'MILD' => 'Mild / خفيف',
            'MODERATE' => 'Moderate / متوسط',
            'SEVERE' => 'Severe / شديد',
            'PROFOUND' => 'Profound / عميق',
            default => $this->severity_level ?? '',
        };
    }

    public function getExamAccommodationsAttribute(): array
    {
        $accommodations = [];

        if ($this->needs_extra_time) {
            $accommodations[] = "Extra time ({$this->extra_time_percentage}%)";
        }
        if ($this->needs_separate_room) {
            $accommodations[] = 'Separate room';
        }
        if ($this->needs_reader) {
            $accommodations[] = 'Reader';
        }
        if ($this->needs_scribe) {
            $accommodations[] = 'Scribe';
        }
        if ($this->needs_enlarged_text) {
            $accommodations[] = 'Enlarged text';
        }
        if ($this->needs_braille) {
            $accommodations[] = 'Braille';
        }
        if ($this->needs_audio_exam) {
            $accommodations[] = 'Audio exam';
        }
        if ($this->needs_computer) {
            $accommodations[] = 'Computer';
        }
        if ($this->needs_rest_breaks) {
            $accommodations[] = "Rest breaks (every {$this->rest_break_frequency} min)";
        }

        return $accommodations;
    }

    public function getClassroomAccommodationsAttribute(): array
    {
        $accommodations = [];

        if ($this->needs_front_seat) {
            $accommodations[] = 'Front seat';
        }
        if ($this->needs_wheelchair_access) {
            $accommodations[] = 'Wheelchair access';
        }
        if ($this->needs_elevator_access) {
            $accommodations[] = 'Elevator access';
        }
        if ($this->needs_sign_interpreter) {
            $accommodations[] = 'Sign language interpreter';
        }
        if ($this->needs_note_taker) {
            $accommodations[] = 'Note taker';
        }
        if ($this->needs_recording_permission) {
            $accommodations[] = 'Recording permission';
        }
        if ($this->needs_priority_registration) {
            $accommodations[] = 'Priority registration';
        }

        return $accommodations;
    }

    public function isDocumentationExpired(): bool
    {
        return $this->documentation_expiry && $this->documentation_expiry->isPast();
    }

    public function scopeWithSpecialNeeds($query)
    {
        return $query->where('has_special_needs', true);
    }

    public function scopeRequiringAccommodations($query)
    {
        return $query->where('requires_accommodations', true);
    }

    public function scopeApproved($query)
    {
        return $query->where('documentation_status', 'APPROVED');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

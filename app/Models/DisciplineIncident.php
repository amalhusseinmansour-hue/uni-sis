<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class DisciplineIncident extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'reported_by',
        'semester_id',
        'incident_number',
        'type',
        'type_other',
        'severity',
        'points',
        'incident_date',
        'incident_time',
        'location',
        'description',
        'description_ar',
        'witnesses',
        'evidence',
        'status',
        'guardian_notified',
        'guardian_notified_at',
        'guardian_notification_method',
        'investigation_notes',
        'investigated_by',
        'investigation_completed_at',
        'resolution_notes',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'incident_date' => 'date',
            'incident_time' => 'datetime:H:i',
            'witnesses' => 'array',
            'evidence' => 'array',
            'guardian_notified' => 'boolean',
            'guardian_notified_at' => 'datetime',
            'investigation_completed_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    // ==========================================
    // Relationships
    // ==========================================

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function investigator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investigated_by');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(DisciplineAction::class, 'incident_id');
    }

    public function appeals(): HasMany
    {
        return $this->hasMany(DisciplineAppeal::class, 'incident_id');
    }

    public function latestAppeal(): HasOne
    {
        return $this->hasOne(DisciplineAppeal::class, 'incident_id')->latestOfMany();
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('incident_date', [$startDate, $endDate]);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['REPORTED', 'INVESTIGATING']);
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'RESOLVED');
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getTypeDisplayAttribute(): string
    {
        return match ($this->type) {
            'TARDINESS' => 'Tardiness',
            'ABSENCE' => 'Unexcused Absence',
            'ACADEMIC_DISHONESTY' => 'Academic Dishonesty',
            'MISCONDUCT' => 'Misconduct',
            'DRESS_CODE' => 'Dress Code Violation',
            'PROPERTY_DAMAGE' => 'Property Damage',
            'BULLYING' => 'Bullying',
            'SUBSTANCE_ABUSE' => 'Substance Abuse',
            'VIOLENCE' => 'Violence',
            'HARASSMENT' => 'Harassment',
            'THEFT' => 'Theft',
            'OTHER' => $this->type_other ?? 'Other',
            default => $this->type,
        };
    }

    public function getTypeDisplayArAttribute(): string
    {
        return match ($this->type) {
            'TARDINESS' => 'تأخر',
            'ABSENCE' => 'غياب غير مبرر',
            'ACADEMIC_DISHONESTY' => 'غش أكاديمي',
            'MISCONDUCT' => 'سوء سلوك',
            'DRESS_CODE' => 'مخالفة الزي',
            'PROPERTY_DAMAGE' => 'إتلاف ممتلكات',
            'BULLYING' => 'تنمر',
            'SUBSTANCE_ABUSE' => 'استخدام مواد محظورة',
            'VIOLENCE' => 'عنف',
            'HARASSMENT' => 'تحرش',
            'THEFT' => 'سرقة',
            'OTHER' => $this->type_other ?? 'أخرى',
            default => $this->type,
        };
    }

    public function getSeverityDisplayAttribute(): string
    {
        return match ($this->severity) {
            'MINOR' => 'Minor',
            'MODERATE' => 'Moderate',
            'MAJOR' => 'Major',
            'SEVERE' => 'Severe',
            default => $this->severity,
        };
    }

    public function getSeverityDisplayArAttribute(): string
    {
        return match ($this->severity) {
            'MINOR' => 'بسيطة',
            'MODERATE' => 'متوسطة',
            'MAJOR' => 'كبيرة',
            'SEVERE' => 'خطيرة',
            default => $this->severity,
        };
    }

    public function getStatusDisplayAttribute(): string
    {
        return match ($this->status) {
            'REPORTED' => 'Reported',
            'INVESTIGATING' => 'Under Investigation',
            'CONFIRMED' => 'Confirmed',
            'DISMISSED' => 'Dismissed',
            'RESOLVED' => 'Resolved',
            'APPEALED' => 'Appealed',
            default => $this->status,
        };
    }

    public function getStatusDisplayArAttribute(): string
    {
        return match ($this->status) {
            'REPORTED' => 'تم الإبلاغ',
            'INVESTIGATING' => 'قيد التحقيق',
            'CONFIRMED' => 'مؤكد',
            'DISMISSED' => 'مرفوض',
            'RESOLVED' => 'تم الحل',
            'APPEALED' => 'تم الاستئناف',
            default => $this->status,
        };
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    public static function generateIncidentNumber(): string
    {
        $year = date('Y');
        $count = self::whereYear('created_at', $year)->count() + 1;
        return sprintf('INC-%s-%04d', $year, $count);
    }

    public function calculatePoints(): int
    {
        return match ($this->severity) {
            'MINOR' => rand(1, 5),
            'MODERATE' => rand(5, 10),
            'MAJOR' => rand(10, 20),
            'SEVERE' => rand(20, 30),
            default => 0,
        };
    }

    public function canBeAppealed(): bool
    {
        return in_array($this->status, ['CONFIRMED', 'RESOLVED'])
            && $this->actions()->where('is_appealable', true)->exists();
    }

    public function isResolved(): bool
    {
        return $this->status === 'RESOLVED';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($incident) {
            if (empty($incident->incident_number)) {
                $incident->incident_number = self::generateIncidentNumber();
            }
            if (empty($incident->points)) {
                $incident->points = $incident->calculatePoints();
            }
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentNote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'created_by',
        'source_department',
        'note_type',
        'priority',
        'title',
        'content',
        'attachments',
        'visible_to_student',
        'visible_to_advisor',
        'visible_to_all_staff',
        'visible_to_departments',
        'requires_follow_up',
        'follow_up_date',
        'follow_up_assigned_to',
        'follow_up_status',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'visible_to_departments' => 'array',
            'visible_to_student' => 'boolean',
            'visible_to_advisor' => 'boolean',
            'visible_to_all_staff' => 'boolean',
            'requires_follow_up' => 'boolean',
            'follow_up_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function followUpAssignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follow_up_assigned_to');
    }

    public function getSourceDepartmentLabelAttribute(): string
    {
        return match ($this->source_department) {
            'ADMISSION' => 'Admission & Registration / القبول والتسجيل',
            'STUDENT_AFFAIRS' => 'Student Affairs / شؤون الطلبة',
            'ACADEMIC_ADVISOR' => 'Academic Advisor / المرشد الأكاديمي',
            'FINANCE' => 'Finance / الشؤون المالية',
            'DEAN' => 'Dean\'s Office / العمادة',
            'DEPARTMENT' => 'Department / القسم',
            'IT' => 'IT / تقنية المعلومات',
            'SECURITY' => 'Security / الأمن',
            'COUNSELING' => 'Counseling / الإرشاد النفسي',
            'CAREER' => 'Career Services / الإرشاد المهني',
            'HOUSING' => 'Housing / السكن',
            'LIBRARY' => 'Library / المكتبة',
            'OTHER' => 'Other / أخرى',
            default => $this->source_department,
        };
    }

    public function getNoteTypeLabelAttribute(): string
    {
        return match ($this->note_type) {
            'GENERAL' => 'General / عامة',
            'ACADEMIC' => 'Academic / أكاديمية',
            'BEHAVIORAL' => 'Behavioral / سلوكية',
            'FINANCIAL' => 'Financial / مالية',
            'DISCIPLINARY' => 'Disciplinary / تأديبية',
            'MEDICAL' => 'Medical / طبية',
            'FOLLOW_UP' => 'Follow Up / متابعة',
            'RECOMMENDATION' => 'Recommendation / توصية',
            'WARNING' => 'Warning / تحذير',
            'ACHIEVEMENT' => 'Achievement / إنجاز',
            'COMPLAINT' => 'Complaint / شكوى',
            'INQUIRY' => 'Inquiry / استفسار',
            'OTHER' => 'Other / أخرى',
            default => $this->note_type,
        };
    }

    public function getPriorityLabelAttribute(): string
    {
        return match ($this->priority) {
            'LOW' => 'Low / منخفض',
            'NORMAL' => 'Normal / عادي',
            'HIGH' => 'High / عالي',
            'URGENT' => 'Urgent / عاجل',
            default => $this->priority,
        };
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    public function scopeByDepartment($query, string $department)
    {
        return $query->where('source_department', $department);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('note_type', $type);
    }

    public function scopeVisibleToStudent($query)
    {
        return $query->where('visible_to_student', true);
    }

    public function scopeRequiringFollowUp($query)
    {
        return $query->where('requires_follow_up', true)
            ->where('follow_up_status', '!=', 'COMPLETED');
    }

    public function scopeOverdueFollowUp($query)
    {
        return $query->where('requires_follow_up', true)
            ->where('follow_up_date', '<', now())
            ->whereIn('follow_up_status', ['PENDING', 'IN_PROGRESS']);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeUrgent($query)
    {
        return $query->where('priority', 'URGENT');
    }
}

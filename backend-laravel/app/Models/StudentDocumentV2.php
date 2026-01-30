<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentDocumentV2 extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'student_documents_v2';

    protected $fillable = [
        'student_id',
        'document_category',
        'type',
        'type_other',
        'name',
        'name_ar',
        'description',
        'file_path',
        'file_name',
        'file_extension',
        'file_size',
        'mime_type',
        'issue_date',
        'expiry_date',
        'document_number',
        'issuing_authority',
        'upload_date',
        'uploaded_by_type',
        'uploaded_by',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'rejection_reason',
        'is_required',
        'is_original_required',
        'original_submitted',
        'visible_to_student',
        'visible_to_staff',
        'is_confidential',
        'version',
        'replaces_document_id',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'expiry_date' => 'date',
            'upload_date' => 'date',
            'reviewed_at' => 'datetime',
            'is_required' => 'boolean',
            'is_original_required' => 'boolean',
            'original_submitted' => 'boolean',
            'visible_to_student' => 'boolean',
            'visible_to_staff' => 'boolean',
            'is_confidential' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function replacedDocument(): BelongsTo
    {
        return $this->belongsTo(self::class, 'replaces_document_id');
    }

    public function getCategoryLabelAttribute(): string
    {
        return match ($this->document_category) {
            'IDENTITY' => 'Identity Documents / وثائق هوية',
            'ACADEMIC' => 'Academic Documents / وثائق أكاديمية',
            'FINANCIAL' => 'Financial Documents / وثائق مالية',
            'MEDICAL' => 'Medical Documents / وثائق طبية',
            'PERSONAL' => 'Personal Documents / وثائق شخصية',
            'ADMINISTRATIVE' => 'Administrative Documents / وثائق إدارية',
            'OTHER' => 'Other / أخرى',
            default => $this->document_category,
        };
    }

    public function getTypeLabelAttribute(): string
    {
        if ($this->type === 'OTHER') {
            return $this->type_other ?? 'Other';
        }

        return match ($this->type) {
            // Identity
            'NATIONAL_ID' => 'National ID / هوية وطنية',
            'PASSPORT' => 'Passport / جواز سفر',
            'RESIDENCE_PERMIT' => 'Residence Permit / إقامة',
            'REFUGEE_CARD' => 'Refugee Card / بطاقة لاجئ',
            'BIRTH_CERTIFICATE' => 'Birth Certificate / شهادة ميلاد',
            // Academic
            'HIGH_SCHOOL_CERTIFICATE' => 'High School Certificate / شهادة ثانوية',
            'HIGH_SCHOOL_TRANSCRIPT' => 'High School Transcript / كشف درجات ثانوية',
            'BACHELOR_CERTIFICATE' => 'Bachelor Certificate / شهادة بكالوريوس',
            'BACHELOR_TRANSCRIPT' => 'Bachelor Transcript / كشف درجات بكالوريوس',
            'MASTER_CERTIFICATE' => 'Master Certificate / شهادة ماجستير',
            'MASTER_TRANSCRIPT' => 'Master Transcript / كشف درجات ماجستير',
            'PHD_CERTIFICATE' => 'Ph.D. Certificate / شهادة دكتوراه',
            'EQUIVALENCY_CERTIFICATE' => 'Equivalency Certificate / شهادة معادلة',
            'LANGUAGE_CERTIFICATE' => 'Language Certificate / شهادة لغة',
            'PROFESSIONAL_CERTIFICATE' => 'Professional Certificate / شهادة مهنية',
            // Photos
            'PERSONAL_PHOTO' => 'Personal Photo / صورة شخصية',
            'FORMAL_PHOTO' => 'Formal Photo / صورة رسمية',
            // Financial
            'SCHOLARSHIP_LETTER' => 'Scholarship Letter / كتاب منحة',
            'PAYMENT_RECEIPT' => 'Payment Receipt / إيصال دفع',
            'BANK_STATEMENT' => 'Bank Statement / كشف حساب بنكي',
            'SPONSOR_LETTER' => 'Sponsor Letter / كتاب كفالة',
            // Medical
            'MEDICAL_REPORT' => 'Medical Report / تقرير طبي',
            'DISABILITY_CERTIFICATE' => 'Disability Certificate / شهادة إعاقة',
            'VACCINATION_RECORD' => 'Vaccination Record / سجل تطعيم',
            // Administrative
            'ACCEPTANCE_LETTER' => 'Acceptance Letter / كتاب قبول',
            'NO_OBJECTION_LETTER' => 'No Objection Letter / كتاب عدم ممانعة',
            'RECOMMENDATION_LETTER' => 'Recommendation Letter / خطاب توصية',
            'TRANSFER_LETTER' => 'Transfer Letter / كتاب انتقال',
            'CLEARANCE_FORM' => 'Clearance Form / نموذج مخالصة',
            default => $this->type,
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'PENDING' => 'Pending Review / بانتظار المراجعة',
            'UNDER_REVIEW' => 'Under Review / قيد المراجعة',
            'ACCEPTED' => 'Accepted / مقبول',
            'REJECTED' => 'Rejected / مرفوض',
            'NEEDS_UPDATE' => 'Needs Update / يحتاج تحديث',
            'EXPIRED' => 'Expired / منتهي الصلاحية',
            default => $this->status,
        };
    }

    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size ?? 0;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function isAccepted(): bool
    {
        return $this->status === 'ACCEPTED';
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['PENDING', 'UNDER_REVIEW']);
    }

    public function isRejected(): bool
    {
        return $this->status === 'REJECTED';
    }

    public function needsOriginal(): bool
    {
        return $this->is_original_required && !$this->original_submitted;
    }

    // Scopes
    public function scopeAccepted($query)
    {
        return $query->where('status', 'ACCEPTED');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['PENDING', 'UNDER_REVIEW']);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'REJECTED');
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->whereBetween('expiry_date', [now(), now()->addDays($days)]);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('document_category', $category);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeIdentityDocuments($query)
    {
        return $query->where('document_category', 'IDENTITY');
    }

    public function scopeAcademicDocuments($query)
    {
        return $query->where('document_category', 'ACADEMIC');
    }

    public function scopeVisibleToStudent($query)
    {
        return $query->where('visible_to_student', true);
    }

    public function scopeConfidential($query)
    {
        return $query->where('is_confidential', true);
    }
}

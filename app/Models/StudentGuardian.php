<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentGuardian extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'is_primary',
        'name_ar',
        'name_en',
        'relationship',
        'relationship_other',
        'phone',
        'alternative_phone',
        'landline',
        'email',
        'occupation',
        'workplace',
        'work_phone',
        'same_address_as_student',
        'address_country',
        'address_region',
        'address_city',
        'address_street',
        'address_neighborhood',
        'address_description',
        'postal_code',
        'national_id',
        'monthly_income',
        'is_alive',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'same_address_as_student' => 'boolean',
            'is_alive' => 'boolean',
            'monthly_income' => 'decimal:2',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function getFullNameAttribute(): string
    {
        return $this->name_en ?? $this->name_ar;
    }

    public function getRelationshipLabelAttribute(): string
    {
        if ($this->relationship === 'OTHER') {
            return $this->relationship_other ?? 'Other';
        }

        return match ($this->relationship) {
            'FATHER' => 'Father / أب',
            'MOTHER' => 'Mother / أم',
            'BROTHER' => 'Brother / أخ',
            'SISTER' => 'Sister / أخت',
            'UNCLE' => 'Uncle / عم/خال',
            'AUNT' => 'Aunt / عمة/خالة',
            'GRANDFATHER' => 'Grandfather / جد',
            'GRANDMOTHER' => 'Grandmother / جدة',
            'SPOUSE' => 'Spouse / زوج/زوجة',
            'LEGAL_GUARDIAN' => 'Legal Guardian / وصي قانوني',
            default => $this->relationship,
        };
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeAlive($query)
    {
        return $query->where('is_alive', true);
    }
}

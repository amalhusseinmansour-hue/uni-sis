<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'priority',
        'name_ar',
        'name_en',
        'relationship',
        'relationship_other',
        'phone',
        'alternative_phone',
        'landline',
        'email',
        'address',
        'work_address',
        'work_phone',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
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
            'FRIEND' => 'Friend / صديق',
            'NEIGHBOR' => 'Neighbor / جار',
            'COLLEAGUE' => 'Colleague / زميل',
            'LEGAL_GUARDIAN' => 'Legal Guardian / وصي قانوني',
            default => $this->relationship,
        };
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'asc');
    }

    public function scopePrimary($query)
    {
        return $query->where('priority', 1);
    }
}

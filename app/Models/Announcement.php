<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'title_en',
        'title_ar',
        'content',
        'content_en',
        'content_ar',
        'type',
        'sender',
        'is_published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeAcademic($query)
    {
        return $query->where('type', 'ACADEMIC');
    }

    public function scopeFinancial($query)
    {
        return $query->where('type', 'FINANCIAL');
    }

    public function scopeGeneral($query)
    {
        return $query->where('type', 'GENERAL');
    }
}

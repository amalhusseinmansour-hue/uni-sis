<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class LectureMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'lecture_id',
        'uploaded_by',
        'type',
        'title_en',
        'title_ar',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'external_url',
        'is_downloadable',
        'is_visible_to_students',
        'download_count',
        'view_count',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_downloadable' => 'boolean',
            'is_visible_to_students' => 'boolean',
            'download_count' => 'integer',
            'view_count' => 'integer',
            'order' => 'integer',
        ];
    }

    // ==========================================
    // العلاقات
    // ==========================================

    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getTitleAttribute(): string
    {
        return app()->getLocale() === 'ar' ? $this->title_ar : $this->title_en;
    }

    public function getUrlAttribute(): ?string
    {
        if ($this->external_url) {
            return $this->external_url;
        }
        if ($this->file_path) {
            return Storage::url($this->file_path);
        }
        return null;
    }

    public function getFileSizeFormattedAttribute(): string
    {
        if (!$this->file_size) return 'N/A';

        $bytes = (int) $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $index = 0;

        while ($bytes >= 1024 && $index < count($units) - 1) {
            $bytes /= 1024;
            $index++;
        }

        return round($bytes, 2) . ' ' . $units[$index];
    }

    public function getIconAttribute(): string
    {
        return match($this->type) {
            'SLIDES' => 'presentation',
            'PDF' => 'file-text',
            'VIDEO' => 'video',
            'AUDIO' => 'music',
            'DOCUMENT' => 'file',
            'LINK' => 'link',
            'IMAGE' => 'image',
            'CODE' => 'code',
            default => 'file',
        };
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeVisibleToStudents($query)
    {
        return $query->where('is_visible_to_students', true);
    }

    public function scopeDownloadable($query)
    {
        return $query->where('is_downloadable', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    // ==========================================
    // الدوال المساعدة
    // ==========================================

    /**
     * تسجيل عملية تحميل
     */
    public function recordDownload(): void
    {
        $this->increment('download_count');
    }

    /**
     * تسجيل عملية مشاهدة
     */
    public function recordView(): void
    {
        $this->increment('view_count');
    }

    /**
     * حذف الملف من التخزين
     */
    public function deleteFile(): bool
    {
        if ($this->file_path && Storage::exists($this->file_path)) {
            return Storage::delete($this->file_path);
        }
        return true;
    }

    /**
     * تحديد نوع الملف من الـ MIME type
     */
    public static function getTypeFromMime(string $mimeType): string
    {
        if (str_contains($mimeType, 'pdf')) return 'PDF';
        if (str_contains($mimeType, 'presentation') || str_contains($mimeType, 'powerpoint')) return 'SLIDES';
        if (str_contains($mimeType, 'video')) return 'VIDEO';
        if (str_contains($mimeType, 'audio')) return 'AUDIO';
        if (str_contains($mimeType, 'image')) return 'IMAGE';
        if (str_contains($mimeType, 'text')) return 'CODE';
        return 'DOCUMENT';
    }
}

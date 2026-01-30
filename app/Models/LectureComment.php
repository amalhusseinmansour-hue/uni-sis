<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LectureComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lecture_id',
        'user_id',
        'parent_id',
        'content',
        'is_question',
        'is_answered',
        'is_pinned',
        'is_anonymous',
    ];

    protected function casts(): array
    {
        return [
            'is_question' => 'boolean',
            'is_answered' => 'boolean',
            'is_pinned' => 'boolean',
            'is_anonymous' => 'boolean',
        ];
    }

    // ==========================================
    // العلاقات
    // ==========================================

    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(LectureComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(LectureComment::class, 'parent_id')->orderBy('created_at');
    }

    // ==========================================
    // Accessors
    // ==========================================

    public function getAuthorNameAttribute(): string
    {
        if ($this->is_anonymous) {
            return 'مجهول / Anonymous';
        }
        return $this->user->name ?? 'Unknown';
    }

    public function getIsReplyAttribute(): bool
    {
        return $this->parent_id !== null;
    }

    public function getRepliesCountAttribute(): int
    {
        return $this->replies()->count();
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeQuestions($query)
    {
        return $query->where('is_question', true);
    }

    public function scopeUnanswered($query)
    {
        return $query->where('is_question', true)->where('is_answered', false);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeRootComments($query)
    {
        return $query->whereNull('parent_id');
    }

    // ==========================================
    // الدوال المساعدة
    // ==========================================

    /**
     * تثبيت التعليق
     */
    public function pin(): bool
    {
        return $this->update(['is_pinned' => true]);
    }

    /**
     * إلغاء تثبيت التعليق
     */
    public function unpin(): bool
    {
        return $this->update(['is_pinned' => false]);
    }

    /**
     * تحديد السؤال كمُجاب عنه
     */
    public function markAsAnswered(): bool
    {
        return $this->update(['is_answered' => true]);
    }

    /**
     * إضافة رد
     */
    public function addReply(int $userId, string $content, bool $isAnonymous = false): self
    {
        $reply = self::create([
            'lecture_id' => $this->lecture_id,
            'user_id' => $userId,
            'parent_id' => $this->id,
            'content' => $content,
            'is_anonymous' => $isAnonymous,
        ]);

        // إذا كان التعليق الأصلي سؤالاً، نحدده كمُجاب
        if ($this->is_question && !$this->is_answered) {
            $this->markAsAnswered();
        }

        return $reply;
    }
}

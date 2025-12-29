<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'group',
        'value',
        'type',
        'options',
        'label_en',
        'label_ar',
        'description_en',
        'description_ar',
        'order',
        'is_public',
    ];

    protected $casts = [
        'options' => 'array',
        'is_public' => 'boolean',
    ];

    public static function get(string $key, $default = null)
    {
        $setting = Cache::rememberForever("setting.{$key}", function () use ($key) {
            return static::where('key', $key)->first();
        });

        return $setting?->value ?? $default;
    }

    public static function set(string $key, $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget("setting.{$key}");
    }

    public static function getByGroup(string $group)
    {
        return static::where('group', $group)->orderBy('order')->get();
    }

    public function getLabel(): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? ($this->label_ar ?: $this->label_en) : $this->label_en;
    }

    public function getDescription(): ?string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? ($this->description_ar ?: $this->description_en) : $this->description_en;
    }
}

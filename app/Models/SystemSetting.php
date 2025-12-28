<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class SystemSetting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'label_en',
        'label_ar',
        'description_en',
        'description_ar',
        'options',
        'validation',
        'is_public',
        'is_encrypted',
        'order',
    ];

    protected $casts = [
        'options' => 'array',
        'validation' => 'array',
        'is_public' => 'boolean',
        'is_encrypted' => 'boolean',
    ];

    // Get setting value with caching
    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            if (!$setting) {
                return $default;
            }
            return $setting->getTypedValue();
        });
    }

    // Set setting value
    public static function set(string $key, $value): void
    {
        $setting = static::where('key', $key)->first();
        if ($setting) {
            $setting->update(['value' => $setting->is_encrypted ? Crypt::encryptString($value) : $value]);
        }
        Cache::forget("setting.{$key}");
        Cache::forget("settings.group.{$setting->group}");
    }

    // Get all settings by group
    public static function getGroup(string $group): array
    {
        return Cache::remember("settings.group.{$group}", 3600, function () use ($group) {
            return static::where('group', $group)
                ->orderBy('order')
                ->get()
                ->mapWithKeys(fn($s) => [$s->key => $s->getTypedValue()])
                ->toArray();
        });
    }

    // Get public settings only
    public static function getPublic(): array
    {
        return Cache::remember('settings.public', 3600, function () {
            return static::where('is_public', true)
                ->get()
                ->mapWithKeys(fn($s) => [$s->key => $s->getTypedValue()])
                ->toArray();
        });
    }

    // Get typed value
    public function getTypedValue()
    {
        $value = $this->is_encrypted && $this->value
            ? Crypt::decryptString($this->value)
            : $this->value;

        return match ($this->type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'number' => is_numeric($value) ? (float) $value : null,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    // Clear all settings cache
    public static function clearCache(): void
    {
        $groups = static::distinct('group')->pluck('group');
        foreach ($groups as $group) {
            Cache::forget("settings.group.{$group}");
        }

        $keys = static::pluck('key');
        foreach ($keys as $key) {
            Cache::forget("setting.{$key}");
        }

        Cache::forget('settings.public');
    }
}

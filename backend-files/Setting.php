<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class Setting extends Model
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
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            if (!$setting) {
                return $default;
            }

            // Handle file type - return full URL
            if ($setting->type === 'file' && $setting->value) {
                return Storage::disk('public')->url($setting->value);
            }

            // Handle boolean type
            if ($setting->type === 'boolean') {
                return filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
            }

            // Handle number type
            if ($setting->type === 'number') {
                return is_numeric($setting->value) ? (float) $setting->value : $default;
            }

            // Handle JSON type
            if ($setting->type === 'json') {
                return json_decode($setting->value, true) ?? $default;
            }

            return $setting->value ?? $default;
        });
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $key, $value, ?string $type = null): bool
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return false;
        }

        // Handle JSON type
        if ($setting->type === 'json' && is_array($value)) {
            $value = json_encode($value);
        }

        $setting->update(['value' => $value]);

        // Clear cache
        Cache::forget("setting.{$key}");
        Cache::forget("settings.group.{$setting->group}");

        return true;
    }

    /**
     * Get all settings by group
     */
    public static function getByGroup(string $group): array
    {
        return Cache::remember("settings.group.{$group}", 3600, function () use ($group) {
            return static::where('group', $group)
                ->get()
                ->mapWithKeys(function ($setting) {
                    $value = $setting->value;

                    if ($setting->type === 'file' && $value) {
                        $value = Storage::disk('public')->url($value);
                    } elseif ($setting->type === 'boolean') {
                        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                    } elseif ($setting->type === 'number') {
                        $value = is_numeric($value) ? (float) $value : null;
                    } elseif ($setting->type === 'json') {
                        $value = json_decode($value, true);
                    }

                    return [$setting->key => $value];
                })
                ->toArray();
        });
    }

    /**
     * Get university settings
     */
    public static function getUniversitySettings(): array
    {
        return static::getByGroup('university');
    }

    /**
     * Get ID card settings
     */
    public static function getIdCardSettings(): array
    {
        return static::getByGroup('id_card');
    }

    /**
     * Get document settings
     */
    public static function getDocumentSettings(): array
    {
        return static::getByGroup('documents');
    }

    /**
     * Get all public settings (for frontend)
     */
    public static function getPublicSettings(): array
    {
        return Cache::remember('settings.public', 3600, function () {
            return static::where('is_public', true)
                ->get()
                ->mapWithKeys(function ($setting) {
                    $value = $setting->value;

                    if ($setting->type === 'file' && $value) {
                        $value = Storage::disk('public')->url($value);
                    }

                    return [$setting->key => $value];
                })
                ->toArray();
        });
    }

    /**
     * Clear all settings cache
     */
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

    /**
     * Boot method to clear cache on update
     */
    protected static function booted()
    {
        static::saved(function ($setting) {
            Cache::forget("setting.{$setting->key}");
            Cache::forget("settings.group.{$setting->group}");
            Cache::forget('settings.public');
        });

        static::deleted(function ($setting) {
            Cache::forget("setting.{$setting->key}");
            Cache::forget("settings.group.{$setting->group}");
            Cache::forget('settings.public');
        });
    }
}

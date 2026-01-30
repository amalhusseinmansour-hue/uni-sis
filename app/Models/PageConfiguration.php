<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageConfiguration extends Model
{
    protected $fillable = [
        'page_key',
        'title_en',
        'title_ar',
        'description_en',
        'description_ar',
        'icon',
        'breadcrumbs',
        'header_actions',
        'components',
        'tabs',
        'settings',
        'roles',
        'is_active',
    ];

    protected $casts = [
        'breadcrumbs' => 'array',
        'header_actions' => 'array',
        'components' => 'array',
        'tabs' => 'array',
        'settings' => 'array',
        'roles' => 'array',
        'is_active' => 'boolean',
    ];

    public static function getByKey(string $key): ?array
    {
        $config = static::where('page_key', $key)
            ->where('is_active', true)
            ->first();

        if (!$config) {
            return null;
        }

        return $config->toFrontendFormat();
    }

    public function toFrontendFormat(): array
    {
        return [
            'key' => $this->page_key,
            'title_en' => $this->title_en,
            'title_ar' => $this->title_ar,
            'description_en' => $this->description_en,
            'description_ar' => $this->description_ar,
            'icon' => $this->icon,
            'breadcrumbs' => $this->breadcrumbs,
            'header_actions' => $this->header_actions,
            'components' => $this->components,
            'tabs' => $this->tabs,
            'settings' => $this->settings,
        ];
    }
}

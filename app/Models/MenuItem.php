<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    protected $fillable = [
        'menu_id',
        'parent_id',
        'title_en',
        'title_ar',
        'icon',
        'route',
        'url',
        'target',
        'roles',
        'permissions',
        'badge_type',
        'badge_source',
        'badge_color',
        'is_visible',
        'is_active',
        'order',
    ];

    protected $casts = [
        'roles' => 'array',
        'permissions' => 'array',
        'is_visible' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('order');
    }

    public function toMenuArray(?string $role = null): array
    {
        $children = $this->children()
            ->where('is_active', true)
            ->where('is_visible', true)
            ->get();

        if ($role) {
            $children = $children->filter(function ($item) use ($role) {
                return !$item->roles || in_array($role, $item->roles);
            });
        }

        return [
            'id' => $this->id,
            'title_en' => $this->title_en,
            'title_ar' => $this->title_ar,
            'icon' => $this->icon,
            'route' => $this->route,
            'url' => $this->url,
            'target' => $this->target,
            'badge' => $this->badge_type ? [
                'type' => $this->badge_type,
                'source' => $this->badge_source,
                'color' => $this->badge_color,
            ] : null,
            'children' => $children->map(fn($item) => $item->toMenuArray($role))->values()->toArray(),
        ];
    }
}

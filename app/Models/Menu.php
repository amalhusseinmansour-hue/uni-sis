<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'location',
        'roles',
        'is_active',
    ];

    protected $casts = [
        'roles' => 'array',
        'is_active' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->whereNull('parent_id')->orderBy('order');
    }

    public function allItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('order');
    }

    // Get menu with nested items for a specific role
    public function getForRole(?string $role = null): array
    {
        $items = $this->items()
            ->where('is_active', true)
            ->where('is_visible', true)
            ->with(['children' => function ($q) {
                $q->where('is_active', true)->where('is_visible', true)->orderBy('order');
            }])
            ->get();

        if ($role) {
            $items = $items->filter(function ($item) use ($role) {
                return !$item->roles || in_array($role, $item->roles);
            });
        }

        return $items->map(fn($item) => $item->toMenuArray($role))->values()->toArray();
    }
}

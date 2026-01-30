<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DashboardLayout extends Model
{
    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'role',
        'widgets',
        'grid_settings',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'widgets' => 'array',
        'grid_settings' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Get layout for a role
    public static function getForRole(string $role): ?self
    {
        return static::where('role', $role)
            ->where('is_active', true)
            ->first()
            ?? static::where('is_default', true)
                ->where('is_active', true)
                ->first();
    }

    // Get widgets with data
    public function getWidgetsWithData(array $params = []): array
    {
        $widgetCodes = collect($this->widgets)->pluck('code')->toArray();
        $widgets = DashboardWidget::whereIn('code', $widgetCodes)
            ->where('is_active', true)
            ->get()
            ->keyBy('code');

        return collect($this->widgets)->map(function ($placement) use ($widgets, $params) {
            $widget = $widgets->get($placement['code']);
            if (!$widget) {
                return null;
            }

            return [
                'code' => $widget->code,
                'name_en' => $widget->name_en,
                'name_ar' => $widget->name_ar,
                'type' => $widget->type,
                'component' => $widget->component,
                'settings' => $widget->settings,
                'styles' => $widget->styles,
                'size' => $widget->size,
                'position' => $placement['position'] ?? null,
                'data' => $widget->getData($params),
            ];
        })->filter()->values()->toArray();
    }
}

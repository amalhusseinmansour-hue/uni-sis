<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\UiTheme;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\DashboardWidget;
use App\Models\DashboardLayout;
use App\Models\PageConfiguration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SystemConfigController extends Controller
{
    // =========================================================================
    // SYSTEM SETTINGS
    // =========================================================================

    public function getSettings(Request $request): JsonResponse
    {
        $group = $request->query('group');

        $query = SystemSetting::orderBy('group')->orderBy('order');

        if ($group) {
            $query->where('group', $group);
        }

        $settings = $query->get()->groupBy('group');

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $settings = $request->input('settings', []);
        $group = $request->input('group', 'academic');

        foreach ($settings as $key => $value) {
            // Determine type based on value
            $type = 'string';
            if (is_bool($value)) {
                $type = 'boolean';
            } elseif (is_numeric($value)) {
                $type = 'number';
            }
            SystemSetting::set($key, $value, $group, $type);
        }

        SystemSetting::clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
        ]);
    }

    public function createSetting(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'group' => 'required|string',
            'key' => 'required|string|unique:system_settings',
            'value' => 'nullable',
            'type' => 'required|in:string,number,boolean,json,file',
            'label_en' => 'required|string',
            'label_ar' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $setting = SystemSetting::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $setting,
        ], 201);
    }

    public function deleteSetting(string $key): JsonResponse
    {
        $setting = SystemSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json(['success' => false, 'message' => 'Setting not found'], 404);
        }

        $setting->delete();
        SystemSetting::clearCache();

        return response()->json(['success' => true, 'message' => 'Setting deleted']);
    }

    // =========================================================================
    // UI THEMES
    // =========================================================================

    public function getThemes(): JsonResponse
    {
        $themes = UiTheme::orderBy('name_en')->get();

        return response()->json([
            'success' => true,
            'data' => $themes,
        ]);
    }

    public function saveTheme(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'name_en' => 'required|string',
            'name_ar' => 'required|string',
            'colors' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $theme = UiTheme::updateOrCreate(
            ['code' => $request->code],
            $request->all()
        );

        if ($request->is_default) {
            UiTheme::where('id', '!=', $theme->id)->update(['is_default' => false]);
        }

        return response()->json([
            'success' => true,
            'data' => $theme,
        ]);
    }

    public function deleteTheme(string $code): JsonResponse
    {
        $theme = UiTheme::where('code', $code)->first();

        if (!$theme) {
            return response()->json(['success' => false, 'message' => 'Theme not found'], 404);
        }

        if ($theme->is_default) {
            return response()->json(['success' => false, 'message' => 'Cannot delete default theme'], 400);
        }

        $theme->delete();

        return response()->json(['success' => true, 'message' => 'Theme deleted']);
    }

    // =========================================================================
    // MENUS
    // =========================================================================

    public function getMenus(): JsonResponse
    {
        $menus = Menu::with(['items' => function ($q) {
            $q->orderBy('order');
        }])->get();

        return response()->json([
            'success' => true,
            'data' => $menus,
        ]);
    }

    public function getMenu(string $code): JsonResponse
    {
        $menu = Menu::where('code', $code)
            ->with(['allItems' => function ($q) {
                $q->orderBy('order');
            }])
            ->first();

        if (!$menu) {
            return response()->json(['success' => false, 'message' => 'Menu not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menu,
        ]);
    }

    public function saveMenu(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'name_en' => 'required|string',
            'name_ar' => 'required|string',
            'location' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $menu = Menu::updateOrCreate(
            ['code' => $request->code],
            $request->only(['name_en', 'name_ar', 'location', 'roles', 'is_active'])
        );

        return response()->json([
            'success' => true,
            'data' => $menu,
        ]);
    }

    public function saveMenuItems(Request $request, string $menuCode): JsonResponse
    {
        $menu = Menu::where('code', $menuCode)->first();

        if (!$menu) {
            return response()->json(['success' => false, 'message' => 'Menu not found'], 404);
        }

        $items = $request->input('items', []);

        // Delete removed items
        $existingIds = collect($items)->pluck('id')->filter()->toArray();
        MenuItem::where('menu_id', $menu->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        // Update or create items
        foreach ($items as $index => $itemData) {
            $itemData['menu_id'] = $menu->id;
            $itemData['order'] = $index;

            if (!empty($itemData['id'])) {
                MenuItem::where('id', $itemData['id'])->update($itemData);
            } else {
                MenuItem::create($itemData);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu items updated',
        ]);
    }

    public function deleteMenu(string $code): JsonResponse
    {
        $menu = Menu::where('code', $code)->first();

        if (!$menu) {
            return response()->json(['success' => false, 'message' => 'Menu not found'], 404);
        }

        $menu->delete();

        return response()->json(['success' => true, 'message' => 'Menu deleted']);
    }

    // =========================================================================
    // DASHBOARD WIDGETS
    // =========================================================================

    public function getWidgets(): JsonResponse
    {
        $widgets = DashboardWidget::orderBy('name_en')->get();

        return response()->json([
            'success' => true,
            'data' => $widgets,
        ]);
    }

    public function saveWidget(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'name_en' => 'required|string',
            'name_ar' => 'required|string',
            'type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $widget = DashboardWidget::updateOrCreate(
            ['code' => $request->code],
            $request->all()
        );

        return response()->json([
            'success' => true,
            'data' => $widget,
        ]);
    }

    public function deleteWidget(string $code): JsonResponse
    {
        $widget = DashboardWidget::where('code', $code)->first();

        if (!$widget) {
            return response()->json(['success' => false, 'message' => 'Widget not found'], 404);
        }

        $widget->delete();

        return response()->json(['success' => true, 'message' => 'Widget deleted']);
    }

    // =========================================================================
    // DASHBOARD LAYOUTS
    // =========================================================================

    public function getDashboardLayouts(): JsonResponse
    {
        $layouts = DashboardLayout::orderBy('name_en')->get();

        return response()->json([
            'success' => true,
            'data' => $layouts,
        ]);
    }

    public function saveDashboardLayout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'name_en' => 'required|string',
            'name_ar' => 'required|string',
            'widgets' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $layout = DashboardLayout::updateOrCreate(
            ['code' => $request->code],
            $request->all()
        );

        if ($request->is_default) {
            DashboardLayout::where('id', '!=', $layout->id)->update(['is_default' => false]);
        }

        return response()->json([
            'success' => true,
            'data' => $layout,
        ]);
    }

    public function deleteDashboardLayout(string $code): JsonResponse
    {
        $layout = DashboardLayout::where('code', $code)->first();

        if (!$layout) {
            return response()->json(['success' => false, 'message' => 'Layout not found'], 404);
        }

        $layout->delete();

        return response()->json(['success' => true, 'message' => 'Layout deleted']);
    }

    // =========================================================================
    // PAGE CONFIGURATIONS
    // =========================================================================

    public function getPageConfigs(): JsonResponse
    {
        $pages = PageConfiguration::orderBy('page_key')->get();

        return response()->json([
            'success' => true,
            'data' => $pages,
        ]);
    }

    public function getPageConfig(string $key): JsonResponse
    {
        $config = PageConfiguration::getByKey($key);

        if (!$config) {
            return response()->json(['success' => false, 'message' => 'Page config not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $config,
        ]);
    }

    public function savePageConfig(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_key' => 'required|string',
            'title_en' => 'required|string',
            'title_ar' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $config = PageConfiguration::updateOrCreate(
            ['page_key' => $request->page_key],
            $request->all()
        );

        return response()->json([
            'success' => true,
            'data' => $config,
        ]);
    }

    public function deletePageConfig(string $key): JsonResponse
    {
        $config = PageConfiguration::where('page_key', $key)->first();

        if (!$config) {
            return response()->json(['success' => false, 'message' => 'Page config not found'], 404);
        }

        $config->delete();

        return response()->json(['success' => true, 'message' => 'Page config deleted']);
    }

    // =========================================================================
    // PUBLIC CONFIG (For Frontend)
    // =========================================================================

    public function getPublicConfig(Request $request): JsonResponse
    {
        $role = $request->user()?->role;

        // Get public settings
        $settings = SystemSetting::getPublic();

        // Get active theme
        $theme = UiTheme::getDefault();

        // Get sidebar menu
        $sidebarMenu = Menu::where('code', 'sidebar')
            ->where('is_active', true)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'settings' => $settings,
                'theme' => $theme ? [
                    'code' => $theme->code,
                    'name_en' => $theme->name_en,
                    'name_ar' => $theme->name_ar,
                    'is_dark' => $theme->is_dark,
                    'colors' => $theme->colors,
                    'typography' => $theme->typography,
                    'css_variables' => $theme->toCssVariables(),
                ] : null,
                'menu' => $sidebarMenu?->getForRole($role) ?? [],
            ],
        ]);
    }

    public function getDashboard(Request $request): JsonResponse
    {
        $role = $request->user()?->role ?? 'guest';
        $params = $request->query();

        $layout = DashboardLayout::getForRole($role);

        if (!$layout) {
            return response()->json([
                'success' => true,
                'data' => [
                    'layout' => null,
                    'widgets' => [],
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'layout' => [
                    'code' => $layout->code,
                    'name_en' => $layout->name_en,
                    'name_ar' => $layout->name_ar,
                    'grid_settings' => $layout->grid_settings,
                ],
                'widgets' => $layout->getWidgetsWithData($params),
            ],
        ]);
    }

    // =========================================================================
    // FRONTEND SPECIFIC ENDPOINTS
    // =========================================================================

    /**
     * Get menu by role (for frontend sidebar)
     */
    public function getMenuByRole(string $role): JsonResponse
    {
        // Map role to menu key
        $menuKey = strtolower($role) . '_sidebar';

        $menu = Menu::where('key', $menuKey)
            ->where('is_active', true)
            ->with(['items' => function ($q) {
                $q->whereNull('parent_id')
                    ->where('is_active', true)
                    ->orderBy('order_column')
                    ->with(['children' => function ($q) {
                        $q->where('is_active', true)->orderBy('order_column');
                    }]);
            }])
            ->first();

        if (!$menu) {
            // Try default sidebar
            $menu = Menu::where('key', 'default_sidebar')
                ->where('is_active', true)
                ->with(['items' => function ($q) {
                    $q->whereNull('parent_id')
                        ->where('is_active', true)
                        ->orderBy('order_column')
                        ->with(['children' => function ($q) {
                            $q->where('is_active', true)->orderBy('order_column');
                        }]);
                }])
                ->first();
        }

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $menu->id,
                'key' => $menu->key,
                'name' => $menu->name,
                'description' => $menu->description,
                'role' => $menu->role,
                'items' => $menu->items->map(function ($item) {
                    return $this->formatMenuItem($item);
                }),
            ],
        ]);
    }

    private function formatMenuItem($item): array
    {
        return [
            'id' => $item->id,
            'title_en' => $item->title_en,
            'title_ar' => $item->title_ar,
            'icon' => $item->icon,
            'route' => $item->route,
            'is_external' => $item->is_external,
            'permission' => $item->permission,
            'roles' => $item->roles,
            'badge_type' => $item->badge_type,
            'badge_value' => $item->badge_value,
            'order_column' => $item->order_column,
            'is_active' => $item->is_active,
            'children' => $item->children ? $item->children->map(function ($child) {
                return $this->formatMenuItem($child);
            }) : [],
        ];
    }

    /**
     * Get dashboard layout by role
     */
    public function getDashboardByRole(string $role): JsonResponse
    {
        $layoutKey = strtolower($role) . '_dashboard';

        $layout = DashboardLayout::where('key', $layoutKey)
            ->where('is_active', true)
            ->first();

        if (!$layout) {
            // Try default
            $layout = DashboardLayout::where('is_default', true)
                ->where('is_active', true)
                ->first();
        }

        if (!$layout) {
            return response()->json([
                'success' => false,
                'message' => 'Dashboard layout not found',
            ], 404);
        }

        // Get widgets for this layout
        $widgets = $layout->widgets ?? [];
        $widgetIds = collect($widgets)->pluck('widget_id')->filter()->toArray();
        $widgetModels = DashboardWidget::whereIn('id', $widgetIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        $layoutWidgets = collect($widgets)->map(function ($w) use ($widgetModels) {
            $widget = $widgetModels->get($w['widget_id'] ?? null);
            if (!$widget) return null;

            return [
                'widget_id' => $widget->id,
                'widget' => [
                    'id' => $widget->id,
                    'key' => $widget->key,
                    'name' => $widget->name,
                    'type' => $widget->type,
                    'component' => $widget->component,
                    'data_source' => $widget->data_source,
                    'config' => $widget->config,
                    'refresh_interval' => $widget->refresh_interval,
                    'cache_duration' => $widget->cache_duration,
                    'roles' => $widget->roles,
                    'is_active' => $widget->is_active,
                ],
                'order_column' => $w['order'] ?? 0,
                'column_span' => $w['column_span'] ?? 1,
                'row_span' => $w['row_span'] ?? 1,
                'config' => $w['config'] ?? [],
            ];
        })->filter()->values();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $layout->id,
                'key' => $layout->key,
                'name' => $layout->name,
                'role' => $layout->role,
                'columns' => $layout->columns,
                'gap' => $layout->gap,
                'widgets' => $layoutWidgets,
                'is_default' => $layout->is_default,
                'is_active' => $layout->is_active,
            ],
        ]);
    }

    /**
     * Get current active theme
     */
    public function getCurrentTheme(): JsonResponse
    {
        $theme = UiTheme::where('is_default', true)
            ->where('is_active', true)
            ->first();

        if (!$theme) {
            $theme = UiTheme::where('is_active', true)->first();
        }

        if (!$theme) {
            return response()->json([
                'success' => false,
                'message' => 'No active theme found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $theme->id,
                'key' => $theme->key,
                'name' => $theme->name,
                'colors' => $theme->colors,
                'typography' => $theme->typography,
                'spacing' => $theme->spacing,
                'borders' => $theme->borders,
                'shadows' => $theme->shadows,
                'is_default' => $theme->is_default,
                'is_active' => $theme->is_active,
            ],
        ]);
    }

    /**
     * Get all active widgets
     */
    public function getActiveWidgets(): JsonResponse
    {
        $widgets = DashboardWidget::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $widgets->map(function ($widget) {
                return [
                    'id' => $widget->id,
                    'key' => $widget->key,
                    'name' => $widget->name,
                    'type' => $widget->type,
                    'component' => $widget->component,
                    'data_source' => $widget->data_source,
                    'config' => $widget->config,
                    'refresh_interval' => $widget->refresh_interval,
                    'cache_duration' => $widget->cache_duration,
                    'roles' => $widget->roles,
                    'is_active' => $widget->is_active,
                ];
            }),
        ]);
    }
}

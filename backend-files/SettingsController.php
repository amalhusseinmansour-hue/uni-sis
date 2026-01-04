<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    /**
     * Get all public settings (no auth required)
     */
    public function publicSettings(): JsonResponse
    {
        $settings = Setting::getPublicSettings();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Get university settings
     */
    public function universitySettings(): JsonResponse
    {
        $settings = Setting::getUniversitySettings();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Get current semester info
     */
    public function currentSemester(): JsonResponse
    {
        $semester = \App\Models\Semester::getCurrentSemester();

        if (!$semester) {
            return response()->json([
                'message' => 'No active semester found',
                'message_ar' => 'لا يوجد فصل دراسي نشط',
            ], 404);
        }

        return response()->json([
            'data' => [
                'id' => $semester->id,
                'name' => $semester->name,
                'name_ar' => $semester->name_ar ?? $semester->name,
                'start_date' => $semester->start_date?->format('Y-m-d'),
                'end_date' => $semester->end_date?->format('Y-m-d'),
                'is_registration_open' => $semester->is_registration_open ?? false,
            ],
        ]);
    }

    /**
     * Get all settings (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Setting::query();

        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->orderBy('group')->orderBy('key')->get();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update a setting (admin only)
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'nullable',
        ]);

        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'message' => 'Setting not found',
                'message_ar' => 'الإعداد غير موجود',
            ], 404);
        }

        $setting->update(['value' => $validated['value']]);

        return response()->json([
            'message' => 'Setting updated successfully',
            'message_ar' => 'تم تحديث الإعداد بنجاح',
            'data' => $setting,
        ]);
    }

    /**
     * Update multiple settings (admin only)
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        $updated = [];

        foreach ($validated['settings'] as $item) {
            $setting = Setting::where('key', $item['key'])->first();
            if ($setting) {
                $setting->update(['value' => $item['value']]);
                $updated[] = $item['key'];
            }
        }

        // Clear all settings cache
        Setting::clearCache();

        return response()->json([
            'message' => 'Settings updated successfully',
            'message_ar' => 'تم تحديث الإعدادات بنجاح',
            'updated_keys' => $updated,
        ]);
    }

    /**
     * Upload a file setting (logo, signature, etc.)
     */
    public function uploadFile(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $setting = Setting::where('key', $key)->where('type', 'file')->first();

        if (!$setting) {
            return response()->json([
                'message' => 'File setting not found',
                'message_ar' => 'إعداد الملف غير موجود',
            ], 404);
        }

        // Delete old file if exists
        if ($setting->value) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($setting->value);
        }

        // Store new file
        $path = $validated['file']->store('settings', 'public');

        $setting->update(['value' => $path]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'message_ar' => 'تم رفع الملف بنجاح',
            'data' => [
                'key' => $key,
                'path' => $path,
                'url' => \Illuminate\Support\Facades\Storage::disk('public')->url($path),
            ],
        ]);
    }
}

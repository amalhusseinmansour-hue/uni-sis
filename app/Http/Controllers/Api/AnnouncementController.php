<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $announcements = Announcement::query()
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->published !== null, fn($q) => $q->where('is_published', $request->published))
            ->orderBy('published_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($announcements);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return response()->json($announcement);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_en' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'content_en' => 'required|string',
            'content_ar' => 'required|string',
            'type' => 'required|in:ACADEMIC,FINANCIAL,GENERAL',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        // Set published_at if is_published is true and not provided
        if (($validated['is_published'] ?? false) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $announcement = Announcement::create($validated);

        return response()->json($announcement, 201);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $validated = $request->validate([
            'title_en' => 'sometimes|string|max:255',
            'title_ar' => 'sometimes|string|max:255',
            'content_en' => 'sometimes|string',
            'content_ar' => 'sometimes|string',
            'type' => 'sometimes|in:ACADEMIC,FINANCIAL,GENERAL',
            'is_published' => 'sometimes|boolean',
            'published_at' => 'nullable|date',
        ]);

        // Set published_at if publishing for the first time
        if (($validated['is_published'] ?? false) && !$announcement->is_published && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $announcement->update($validated);

        return response()->json($announcement);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(null, 204);
    }

    public function published(): JsonResponse
    {
        $announcements = Announcement::published()
            ->orderBy('published_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($announcements);
    }

    public function publish(Announcement $announcement): JsonResponse
    {
        $announcement->update([
            'is_published' => true,
            'published_at' => now(),
        ]);

        return response()->json($announcement);
    }

    public function unpublish(Announcement $announcement): JsonResponse
    {
        $announcement->update([
            'is_published' => false,
        ]);

        return response()->json($announcement);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SemesterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Semester::query();

        if ($request->has('is_current')) {
            $query->where('is_current', $request->boolean('is_current'));
        }

        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        $semesters = $query->orderBy('start_date', 'desc')->get();
        return response()->json($semesters);
    }

    public function show(Semester $semester): JsonResponse
    {
        return response()->json($semester);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'type' => 'nullable|in:FALL,SPRING,SUMMER',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'registration_start' => 'nullable|date',
            'registration_end' => 'nullable|date',
            'add_drop_start' => 'nullable|date',
            'add_drop_end' => 'nullable|date',
            'is_current' => 'boolean',
            'is_closed' => 'boolean',
        ]);

        // If this is set as current, unset all others
        if ($validated['is_current'] ?? false) {
            Semester::where('is_current', true)->update(['is_current' => false]);
        }

        // Set name from name_en if not provided
        if (empty($validated['name'])) {
            $validated['name'] = $validated['name_en'];
        }

        $semester = Semester::create($validated);
        return response()->json($semester, 201);
    }

    public function update(Request $request, Semester $semester): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'academic_year' => 'sometimes|string|max:20',
            'type' => 'sometimes|in:FALL,SPRING,SUMMER',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'registration_start' => 'nullable|date',
            'registration_end' => 'nullable|date',
            'add_drop_start' => 'nullable|date',
            'add_drop_end' => 'nullable|date',
            'is_current' => 'boolean',
            'is_closed' => 'boolean',
        ]);

        // If this is set as current, unset all others
        if ($validated['is_current'] ?? false) {
            Semester::where('is_current', true)->where('id', '!=', $semester->id)->update(['is_current' => false]);
        }

        // Update name from name_en if name_en is provided but name is not
        if (isset($validated['name_en']) && !isset($validated['name'])) {
            $validated['name'] = $validated['name_en'];
        }

        $semester->update($validated);
        return response()->json($semester);
    }

    public function destroy(Semester $semester): JsonResponse
    {
        $semester->delete();
        return response()->json(null, 204);
    }

    public function current(): JsonResponse
    {
        $semester = Semester::where('is_current', true)->first();

        if (!$semester) {
            return response()->json(['message' => 'No current semester set'], 404);
        }

        return response()->json($semester);
    }

    public function setCurrent(Semester $semester): JsonResponse
    {
        Semester::where('is_current', true)->update(['is_current' => false]);
        $semester->update(['is_current' => true]);

        return response()->json($semester);
    }

    public function close(Semester $semester): JsonResponse
    {
        $semester->close();

        return response()->json([
            'message' => 'تم إغلاق الفصل الدراسي',
            'message_en' => 'Semester closed successfully',
            'semester' => $semester->fresh(),
        ]);
    }

    public function reopen(Semester $semester): JsonResponse
    {
        $semester->reopen();

        return response()->json([
            'message' => 'تم إعادة فتح الفصل الدراسي',
            'message_en' => 'Semester reopened successfully',
            'semester' => $semester->fresh(),
        ]);
    }

    public function openRegistration(Semester $semester): JsonResponse
    {
        // Set registration dates to allow registration now
        $semester->update([
            'registration_start' => now()->subDay(),
            'registration_end' => now()->addMonths(1),
            'is_closed' => false,
        ]);

        return response()->json([
            'message' => 'تم فتح التسجيل',
            'message_en' => 'Registration opened successfully',
            'semester' => $semester->fresh(),
        ]);
    }

    public function closeRegistration(Semester $semester): JsonResponse
    {
        // Set registration end to now to close registration
        $semester->update([
            'registration_end' => now()->subDay(),
        ]);

        return response()->json([
            'message' => 'تم إغلاق التسجيل',
            'message_en' => 'Registration closed successfully',
            'semester' => $semester->fresh(),
        ]);
    }
}

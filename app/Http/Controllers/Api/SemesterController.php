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
            'name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'type' => 'required|in:FALL,SPRING,SUMMER',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'registration_start' => 'nullable|date',
            'registration_end' => 'nullable|date|after:registration_start',
            'is_current' => 'boolean',
        ]);

        // If this is set as current, unset all others
        if ($validated['is_current'] ?? false) {
            Semester::where('is_current', true)->update(['is_current' => false]);
        }

        $semester = Semester::create($validated);
        return response()->json($semester, 201);
    }

    public function update(Request $request, Semester $semester): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'academic_year' => 'sometimes|string|max:20',
            'type' => 'sometimes|in:FALL,SPRING,SUMMER',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'registration_start' => 'nullable|date',
            'registration_end' => 'nullable|date|after:registration_start',
            'is_current' => 'boolean',
        ]);

        // If this is set as current, unset all others
        if ($validated['is_current'] ?? false) {
            Semester::where('is_current', true)->where('id', '!=', $semester->id)->update(['is_current' => false]);
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
}

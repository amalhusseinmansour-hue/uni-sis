<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courses = Course::with(['department', 'college'])
            ->when($request->active, fn($q) => $q->where('is_active', true))
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->when($request->college_id, fn($q) => $q->where('college_id', $request->college_id))
            ->when($request->search, fn($q) => $q->where(function($query) use ($request) {
                $query->where('name_en', 'like', "%{$request->search}%")
                    ->orWhere('name_ar', 'like', "%{$request->search}%")
                    ->orWhere('code', 'like', "%{$request->search}%");
            }))
            ->paginate($request->per_page ?? 15);

        return response()->json($courses);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load(['department', 'college', 'enrollments.student']);

        return response()->json($course);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20',  // Removed unique - same course can be in multiple programs
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'credits' => 'required|integer|min:1|max:6',
            'capacity' => 'required|integer|min:1',
            'college_id' => 'nullable|exists:colleges,id',
            'department_id' => 'nullable|exists:departments,id',
            'is_active' => 'boolean',
        ]);

        $course = Course::create($validated);

        return response()->json($course->load(['department', 'college']), 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:20',  // Removed unique - same course can be in multiple programs
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'credits' => 'sometimes|integer|min:1|max:6',
            'capacity' => 'sometimes|integer|min:1',
            'college_id' => 'nullable|exists:colleges,id',
            'department_id' => 'nullable|exists:departments,id',
            'is_active' => 'sometimes|boolean',
        ]);

        $course->update($validated);

        return response()->json($course->load(['department', 'college']));
    }

    public function destroy(Course $course): JsonResponse
    {
        // Check if course has active enrollments
        if ($course->enrollments()->where('status', 'ENROLLED')->exists()) {
            return response()->json([
                'message' => 'Cannot delete course with active enrollments'
            ], 422);
        }

        $course->delete();

        return response()->json(null, 204);
    }

    public function activate(Course $course): JsonResponse
    {
        $course->update(['is_active' => true]);

        return response()->json($course);
    }

    public function deactivate(Course $course): JsonResponse
    {
        $course->update(['is_active' => false]);

        return response()->json($course);
    }

    public function enrollments(Course $course): JsonResponse
    {
        $enrollments = $course->enrollments()
            ->with(['student', 'semester'])
            ->paginate(15);

        return response()->json($enrollments);
    }

    public function statistics(Course $course): JsonResponse
    {
        $stats = [
            'total_enrollments' => $course->enrollments()->count(),
            'active_enrollments' => $course->enrollments()->where('status', 'ENROLLED')->count(),
            'completed_enrollments' => $course->enrollments()->where('status', 'COMPLETED')->count(),
            'dropped_enrollments' => $course->enrollments()->where('status', 'DROPPED')->count(),
            'capacity' => $course->capacity,
            'available_slots' => max(0, $course->capacity - $course->enrollments()->where('status', 'ENROLLED')->count()),
        ];

        return response()->json($stats);
    }

    public function assignPrograms(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'program_ids' => 'required|array',
            'program_ids.*' => 'exists:programs,id',
            'course_type' => 'required|in:UNIVERSITY,COLLEGE,MAJOR,GRADUATION',
        ]);

        $syncData = [];
        foreach ($validated['program_ids'] as $programId) {
            $syncData[$programId] = [
                'type' => $validated['course_type'],
                'semester' => 1,
                'is_common' => $validated['course_type'] === 'UNIVERSITY',
            ];
        }

        // Sync without detaching existing programs
        $course->programs()->syncWithoutDetaching($syncData);

        return response()->json([
            'message' => 'Course assigned to programs successfully',
            'course' => $course->load('programs'),
        ]);
    }
}

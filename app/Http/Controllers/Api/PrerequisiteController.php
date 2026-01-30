<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePrerequisite;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrerequisiteController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $prerequisites = $course->prerequisites()
            ->with('department:id,name_en,name_ar')
            ->get()
            ->map(function ($prereq) {
                return [
                    'id' => $prereq->id,
                    'code' => $prereq->code,
                    'name_en' => $prereq->name_en,
                    'name_ar' => $prereq->name_ar,
                    'credits' => $prereq->credits,
                    'department' => $prereq->department,
                    'min_grade' => $prereq->pivot->min_grade,
                    'is_required' => $prereq->pivot->is_required,
                ];
            });

        return response()->json([
            'course' => $course->only(['id', 'code', 'name_en', 'name_ar']),
            'prerequisites' => $prerequisites,
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'prerequisite_id' => 'required|exists:courses,id|different:course_id',
            'min_grade' => 'nullable|string|in:A+,A,A-,B+,B,B-,C+,C,C-,D+,D,F',
            'is_required' => 'boolean',
        ]);

        // Prevent self-reference
        if ($validated['prerequisite_id'] == $course->id) {
            return response()->json([
                'message' => 'A course cannot be its own prerequisite'
            ], 422);
        }

        // Check if already exists
        if ($course->hasPrerequisite($validated['prerequisite_id'])) {
            return response()->json([
                'message' => 'This prerequisite already exists'
            ], 422);
        }

        // Check for circular dependency
        $prereqCourse = Course::find($validated['prerequisite_id']);
        if ($prereqCourse->hasPrerequisite($course->id)) {
            return response()->json([
                'message' => 'Circular dependency detected: the selected course already requires this course as a prerequisite'
            ], 422);
        }

        $course->prerequisites()->attach($validated['prerequisite_id'], [
            'min_grade' => $validated['min_grade'] ?? null,
            'is_required' => $validated['is_required'] ?? true,
        ]);

        return response()->json([
            'message' => 'Prerequisite added successfully',
            'prerequisites' => $course->getPrerequisitesList(),
        ], 201);
    }

    public function update(Request $request, Course $course, int $prerequisiteId): JsonResponse
    {
        $validated = $request->validate([
            'min_grade' => 'nullable|string|in:A+,A,A-,B+,B,B-,C+,C,C-,D+,D,F',
            'is_required' => 'boolean',
        ]);

        if (!$course->hasPrerequisite($prerequisiteId)) {
            return response()->json([
                'message' => 'Prerequisite not found'
            ], 404);
        }

        $course->prerequisites()->updateExistingPivot($prerequisiteId, $validated);

        return response()->json([
            'message' => 'Prerequisite updated successfully',
            'prerequisites' => $course->getPrerequisitesList(),
        ]);
    }

    public function destroy(Course $course, int $prerequisiteId): JsonResponse
    {
        if (!$course->hasPrerequisite($prerequisiteId)) {
            return response()->json([
                'message' => 'Prerequisite not found'
            ], 404);
        }

        $course->prerequisites()->detach($prerequisiteId);

        return response()->json([
            'message' => 'Prerequisite removed successfully',
        ]);
    }

    public function checkEligibility(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        // Get student (either from request or from authenticated user)
        $studentId = $request->student_id;
        if (!$studentId && $user->isStudent()) {
            $studentId = $user->student?->id;
        }

        if (!$studentId) {
            return response()->json([
                'message' => 'Student ID is required'
            ], 422);
        }

        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        $result = $course->canStudentEnroll($student);

        return response()->json([
            'course' => $course->only(['id', 'code', 'name_en', 'name_ar']),
            'student' => $student->only(['id', 'student_id', 'full_name_en']),
            'can_enroll' => $result['can_enroll'],
            'reasons' => $result['reasons'],
            'prerequisites' => $course->getPrerequisitesList(),
        ]);
    }

    public function coursesRequiringThis(Course $course): JsonResponse
    {
        $dependentCourses = $course->prerequisiteFor()
            ->with('department:id,name_en,name_ar')
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'code' => $c->code,
                    'name_en' => $c->name_en,
                    'name_ar' => $c->name_ar,
                    'department' => $c->department,
                ];
            });

        return response()->json([
            'course' => $course->only(['id', 'code', 'name_en', 'name_ar']),
            'required_for' => $dependentCourses,
        ]);
    }
}

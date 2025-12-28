<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Enrollment::with(['student', 'course', 'semester']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $enrollments = $query->paginate($request->get('per_page', 15));
        return response()->json($enrollments);
    }

    public function show(Enrollment $enrollment): JsonResponse
    {
        return response()->json($enrollment->load(['student', 'course', 'semester', 'grade']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
            'section' => 'nullable|string|max:10',
            'status' => 'required|in:ENROLLED,DROPPED,WITHDRAWN,COMPLETED',
        ]);

        // Check for duplicate enrollment
        $exists = Enrollment::where('student_id', $validated['student_id'])
            ->where('course_id', $validated['course_id'])
            ->where('semester_id', $validated['semester_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Student is already enrolled in this course for this semester'], 422);
        }

        $enrollment = Enrollment::create($validated);
        return response()->json($enrollment->load(['student', 'course', 'semester']), 201);
    }

    public function update(Request $request, Enrollment $enrollment): JsonResponse
    {
        $validated = $request->validate([
            'section' => 'nullable|string|max:10',
            'status' => 'sometimes|in:ENROLLED,DROPPED,WITHDRAWN,COMPLETED',
        ]);

        $enrollment->update($validated);
        return response()->json($enrollment);
    }

    public function destroy(Enrollment $enrollment): JsonResponse
    {
        $enrollment->delete();
        return response()->json(null, 204);
    }

    public function drop(Enrollment $enrollment): JsonResponse
    {
        $enrollment->update(['status' => 'DROPPED']);
        return response()->json($enrollment);
    }

    public function withdraw(Enrollment $enrollment): JsonResponse
    {
        $enrollment->update(['status' => 'WITHDRAWN']);
        return response()->json($enrollment);
    }

    // ========== Student Self-Service Methods ==========

    /**
     * Get current student's enrollments
     */
    public function myEnrollments(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $query = Enrollment::with(['course', 'semester'])
            ->where('student_id', $student->id)
            ->where('status', 'ENROLLED');

        // Filter by semester if provided
        if ($request->has('semester')) {
            $query->whereHas('semester', function ($q) use ($request) {
                $q->where('code', $request->semester);
            });
        } else {
            // Default to current semester
            $query->whereHas('semester', function ($q) {
                $q->where('is_current', true);
            });
        }

        $enrollments = $query->get()->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'code' => $enrollment->course->code,
                'name_en' => $enrollment->course->name_en,
                'name_ar' => $enrollment->course->name_ar,
                'credits' => $enrollment->course->credits,
                'section' => $enrollment->section,
                'instructor' => $enrollment->course->instructor ?? 'TBA',
                'schedule' => $enrollment->schedule ?? $enrollment->course->schedule ?? '',
                'status' => $enrollment->status,
            ];
        });

        return response()->json($enrollments);
    }

    /**
     * Student enrolls in a course section
     */
    public function enroll(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $validated = $request->validate([
            'section_id' => 'required',
        ]);

        // Get current semester
        $currentSemester = \App\Models\Semester::where('is_current', true)->first();

        if (!$currentSemester) {
            return response()->json(['message' => 'No active semester found'], 422);
        }

        // Check registration period
        // if (!$currentSemester->isRegistrationOpen()) {
        //     return response()->json(['message' => 'Registration period is closed'], 422);
        // }

        // Find course by section_id (could be course_id or a section identifier)
        $course = \App\Models\Course::find($validated['section_id']);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Check if already enrolled
        $exists = Enrollment::where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->where('semester_id', $currentSemester->id)
            ->whereIn('status', ['ENROLLED', 'COMPLETED'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already enrolled in this course'], 422);
        }

        // Check prerequisites
        // TODO: Add prerequisite checking logic

        // Check credit limit
        $currentCredits = Enrollment::where('student_id', $student->id)
            ->where('semester_id', $currentSemester->id)
            ->where('status', 'ENROLLED')
            ->join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->sum('courses.credits');

        $maxCredits = 21; // Could be from settings

        if (($currentCredits + $course->credits) > $maxCredits) {
            return response()->json(['message' => 'Maximum credit limit exceeded'], 422);
        }

        // Create enrollment
        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'semester_id' => $currentSemester->id,
            'section' => $request->section ?? 'A',
            'status' => 'ENROLLED',
        ]);

        return response()->json([
            'message' => 'Enrolled successfully',
            'enrollment' => $enrollment->load(['course', 'semester']),
        ], 201);
    }

    /**
     * Student drops their own enrollment
     */
    public function dropMyEnrollment(Request $request, $enrollmentId): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $enrollment = Enrollment::where('id', $enrollmentId)
            ->where('student_id', $student->id)
            ->where('status', 'ENROLLED')
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Check if drop is allowed (deadline check)
        // TODO: Add deadline checking logic

        $enrollment->update(['status' => 'DROPPED']);

        return response()->json([
            'message' => 'Course dropped successfully',
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Get available sections for course registration
     */
    public function availableSections(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        // Get current semester
        $currentSemester = \App\Models\Semester::where('is_current', true)->first();

        if (!$currentSemester) {
            return response()->json(['message' => 'No active semester found'], 422);
        }

        // Get student's already enrolled courses
        $enrolledCourseIds = Enrollment::where('student_id', $student->id)
            ->where('semester_id', $currentSemester->id)
            ->whereIn('status', ['ENROLLED', 'COMPLETED'])
            ->pluck('course_id')
            ->toArray();

        // Get available courses (excluding already enrolled)
        $courses = \App\Models\Course::where('is_active', true)
            ->whereNotIn('id', $enrolledCourseIds)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name_en' => $course->name_en,
                    'name_ar' => $course->name_ar,
                    'credits' => $course->credits,
                    'section' => 'A', // Default section
                    'instructor' => $course->instructor ?? 'TBA',
                    'schedule' => $course->schedule ?? 'TBA',
                    'location' => $course->location ?? 'TBA',
                    'capacity' => $course->capacity ?? 30,
                    'enrolled' => $course->enrollments()->where('status', 'ENROLLED')->count(),
                    'prerequisites' => $course->prerequisites ?? [],
                    'department' => $course->department->name_en ?? 'General',
                ];
            });

        return response()->json($courses);
    }
}

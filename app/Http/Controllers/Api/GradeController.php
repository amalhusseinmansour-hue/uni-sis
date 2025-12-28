<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GradeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Grade::with(['student', 'course', 'semester']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        $grades = $query->paginate($request->get('per_page', 15));
        return response()->json($grades);
    }

    public function show(Grade $grade): JsonResponse
    {
        return response()->json($grade->load(['student', 'course', 'semester']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
            'midterm_score' => 'nullable|numeric|min:0|max:100',
            'final_score' => 'nullable|numeric|min:0|max:100',
            'assignments_score' => 'nullable|numeric|min:0|max:100',
            'total_score' => 'nullable|numeric|min:0|max:100',
            'letter_grade' => 'nullable|string|max:5',
            'grade_points' => 'nullable|numeric|min:0|max:4',
            'status' => 'required|in:PENDING,SUBMITTED,APPROVED,CONTESTED',
            'remarks' => 'nullable|string',
        ]);

        // Check if grade already exists
        $exists = Grade::where('student_id', $validated['student_id'])
            ->where('course_id', $validated['course_id'])
            ->where('semester_id', $validated['semester_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Grade already exists for this student in this course'], 422);
        }

        $grade = Grade::create($validated);

        // Update enrollment status to completed if grade is approved
        if ($validated['status'] === 'APPROVED') {
            Enrollment::where('student_id', $validated['student_id'])
                ->where('course_id', $validated['course_id'])
                ->where('semester_id', $validated['semester_id'])
                ->update(['status' => 'COMPLETED']);
        }

        return response()->json($grade->load(['student', 'course', 'semester']), 201);
    }

    public function update(Request $request, Grade $grade): JsonResponse
    {
        $validated = $request->validate([
            'midterm_score' => 'nullable|numeric|min:0|max:100',
            'final_score' => 'nullable|numeric|min:0|max:100',
            'assignments_score' => 'nullable|numeric|min:0|max:100',
            'total_score' => 'nullable|numeric|min:0|max:100',
            'letter_grade' => 'nullable|string|max:5',
            'grade_points' => 'nullable|numeric|min:0|max:4',
            'status' => 'sometimes|in:PENDING,SUBMITTED,APPROVED,CONTESTED',
            'remarks' => 'nullable|string',
        ]);

        $grade->update($validated);
        return response()->json($grade);
    }

    public function destroy(Grade $grade): JsonResponse
    {
        $grade->delete();
        return response()->json(null, 204);
    }

    public function approve(Grade $grade): JsonResponse
    {
        $grade->update(['status' => 'APPROVED']);

        // Update enrollment status
        Enrollment::where('student_id', $grade->student_id)
            ->where('course_id', $grade->course_id)
            ->where('semester_id', $grade->semester_id)
            ->update(['status' => 'COMPLETED']);

        return response()->json($grade);
    }

    public function calculateGPA(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        $grades = Grade::where('student_id', $validated['student_id'])
            ->where('status', 'APPROVED')
            ->with('course')
            ->get();

        if ($grades->isEmpty()) {
            return response()->json(['gpa' => 0, 'total_credits' => 0]);
        }

        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($grades as $grade) {
            $credits = $grade->course->credits ?? 3;
            $totalPoints += $grade->grade_points * $credits;
            $totalCredits += $credits;
        }

        $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;

        return response()->json([
            'gpa' => $gpa,
            'total_credits' => $totalCredits,
            'courses_completed' => $grades->count(),
        ]);
    }
}

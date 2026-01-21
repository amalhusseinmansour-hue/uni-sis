<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Program::with(['college', 'department']);

        if ($request->has('college_id')) {
            $query->where('college_id', $request->college_id);
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $programs = $query->get();
        return response()->json($programs);
    }

    public function show(Program $program): JsonResponse
    {
        return response()->json($program->load(['college', 'department', 'students']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'college_id' => 'required|exists:colleges,id',
            'department_id' => 'nullable|exists:departments,id',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:programs',
            'type' => 'required|in:BACHELOR,MASTER,PHD,DIPLOMA',
            'duration_years' => 'required|integer|min:1|max:10',
            'total_credits' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $program = Program::create($validated);
        return response()->json($program, 201);
    }

    public function update(Request $request, Program $program): JsonResponse
    {
        $validated = $request->validate([
            'college_id' => 'sometimes|exists:colleges,id',
            'department_id' => 'nullable|exists:departments,id',
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:20|unique:programs,code,' . $program->id,
            'type' => 'sometimes|in:BACHELOR,MASTER,PHD,DIPLOMA',
            'duration_years' => 'sometimes|integer|min:1|max:10',
            'total_credits' => 'sometimes|integer|min:1',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $program->update($validated);
        return response()->json($program);
    }

    public function destroy(Program $program): JsonResponse
    {
        $program->delete();
        return response()->json(null, 204);
    }

    public function students(Program $program): JsonResponse
    {
        return response()->json($program->students);
    }

    /**
     * Get courses for a program grouped by semester
     */
    public function courses(Program $program): JsonResponse
    {
        $courses = $program->courses()
            ->select('courses.*')
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name_en' => $course->name_en,
                    'name_ar' => $course->name_ar,
                    'credits' => $course->credits,
                    'semester' => $course->pivot->semester,
                    'type' => $course->pivot->type,
                    'is_common' => $course->pivot->is_common,
                    'order' => $course->pivot->order,
                ];
            })->values(); // Ensure proper array indexing for JSON

        // Group by semester with proper array indexing
        $bySemester = $courses->groupBy('semester')->map(function ($items) {
            return $items->values();
        })->sortKeys();

        return response()->json([
            'program' => [
                'id' => $program->id,
                'code' => $program->code,
                'name_en' => $program->name_en,
                'name_ar' => $program->name_ar,
                'type' => $program->type,
                'total_credits' => $program->total_credits,
            ],
            'courses' => $courses,
            'by_semester' => $bySemester,
            'total_courses' => $courses->count(),
            'total_credits' => $courses->sum('credits'),
        ]);
    }

    /**
     * Add a course to a program
     */
    public function addCourse(Request $request, Program $program): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'semester' => 'required|integer|min:1|max:12',
            'type' => 'required|in:REQUIRED,ELECTIVE,UNIVERSITY,COLLEGE,MAJOR',
            'is_common' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        // Check if course already exists in program
        if ($program->courses()->where('course_id', $validated['course_id'])->exists()) {
            return response()->json([
                'error' => 'Course already exists in this program',
            ], 422);
        }

        $program->courses()->attach($validated['course_id'], [
            'semester' => $validated['semester'],
            'type' => $validated['type'],
            'is_common' => $validated['is_common'] ?? false,
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Course added to program successfully',
        ], 201);
    }

    /**
     * Update a course in a program
     */
    public function updateCourse(Request $request, Program $program, int $courseId): JsonResponse
    {
        $validated = $request->validate([
            'semester' => 'sometimes|integer|min:1|max:12',
            'type' => 'sometimes|in:REQUIRED,ELECTIVE,UNIVERSITY,COLLEGE,MAJOR',
            'is_common' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        $program->courses()->updateExistingPivot($courseId, $validated);

        return response()->json([
            'message' => 'Course updated successfully',
        ]);
    }

    /**
     * Remove a course from a program
     */
    public function removeCourse(Program $program, int $courseId): JsonResponse
    {
        $program->courses()->detach($courseId);

        return response()->json([
            'message' => 'Course removed from program successfully',
        ]);
    }

    /**
     * Add common courses to all bachelor programs
     */
    public function addCommonCoursesToBachelor(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'courses' => 'required|array|min:1',
            'courses.*.course_id' => 'required|exists:courses,id',
            'courses.*.semester' => 'required|integer|min:1|max:12',
            'courses.*.type' => 'required|in:REQUIRED,ELECTIVE,UNIVERSITY,COLLEGE,MAJOR',
            'courses.*.order' => 'integer|min:0',
        ]);

        $bachelorPrograms = Program::where('type', 'BACHELOR')->get();
        $addedCount = 0;

        foreach ($bachelorPrograms as $program) {
            foreach ($validated['courses'] as $courseData) {
                // Skip if course already exists in program
                if ($program->courses()->where('course_id', $courseData['course_id'])->exists()) {
                    continue;
                }

                $program->courses()->attach($courseData['course_id'], [
                    'semester' => $courseData['semester'],
                    'type' => $courseData['type'],
                    'is_common' => true,
                    'order' => $courseData['order'] ?? 0,
                ]);
                $addedCount++;
            }
        }

        return response()->json([
            'message' => "Common courses added to {$bachelorPrograms->count()} bachelor programs",
            'programs_count' => $bachelorPrograms->count(),
            'courses_added' => $addedCount,
        ]);
    }
}

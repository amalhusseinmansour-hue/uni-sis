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
        $courses = Course::with(['department', 'program', 'college', 'programs'])
            ->when($request->active, fn($q) => $q->where('is_active', true))
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->when($request->college_id, fn($q) => $q->where('college_id', $request->college_id))
            ->when($request->program_id, fn($q) => $q->whereHas('programs', fn($pq) => $pq->where('programs.id', $request->program_id)))
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
        $course->load(['department', 'college', 'programs', 'enrollments.student']);

        return response()->json($course);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'credits' => 'required|integer|min:1|max:12',
            'capacity' => 'nullable|integer|min:1',
            'department_id' => 'nullable|integer',
            'college_id' => 'nullable|integer',
            'college_ids' => 'nullable|array',
            'college_ids.*' => 'integer',
            'program_ids' => 'nullable|array',
            'program_ids.*' => 'integer',
            'course_type' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        // Extract program_ids and course_type
        $programIds = $request->input('program_ids', []);
        $courseType = $request->input('course_type', 'MAJOR');
        $collegeId = $request->input('college_id');
        $collegeIds = $request->input('college_ids', []);

        // Check if course with this code already exists
        $existingCourse = Course::where('code', $validated['code'])->first();

        // For UNIVERSITY or COLLEGE requirements, if course exists, just add it to new programs
        if ($existingCourse && in_array($courseType, ['UNIVERSITY', 'COLLEGE'])) {
            // Course exists - just attach to programs based on type
            if ($courseType === 'UNIVERSITY') {
                // University requirement: attach to ALL programs
                $allProgramIds = \App\Models\Program::pluck('id')->toArray();
                if (!empty($allProgramIds)) {
                    $syncData = [];
                    foreach ($allProgramIds as $pid) {
                        $syncData[$pid] = ['type' => $courseType, 'semester' => 1];
                    }
                    $existingCourse->programs()->syncWithoutDetaching($syncData);
                }
            } elseif ($courseType === 'COLLEGE') {
                // College requirement: attach to all programs in selected colleges
                $targetCollegeIds = !empty($collegeIds) ? $collegeIds : ($collegeId ? [$collegeId] : []);
                if (!empty($targetCollegeIds)) {
                    $collegeProgramIds = \App\Models\Program::where(function($q) use ($targetCollegeIds) {
                        $q->whereIn('college_id', $targetCollegeIds)
                          ->orWhereHas('department', function($dq) use ($targetCollegeIds) {
                              $dq->whereIn('college_id', $targetCollegeIds);
                          });
                    })->pluck('id')->toArray();
                    if (!empty($collegeProgramIds)) {
                        $syncData = [];
                        foreach ($collegeProgramIds as $pid) {
                            $syncData[$pid] = ['type' => $courseType, 'semester' => 1];
                        }
                        $existingCourse->programs()->syncWithoutDetaching($syncData);
                    }
                }
            }

            return response()->json([
                'message' => 'Course already exists. Added to programs successfully.',
                'course' => $existingCourse->load(['department', 'college', 'programs']),
            ], 200);
        }

        // For MAJOR/GRADUATION or if course doesn't exist, check uniqueness
        if ($existingCourse) {
            return response()->json(['message' => 'The code has already been taken.'], 422);
        }

        unset($validated['program_ids'], $validated['course_type'], $validated['college_ids']);

        // Set defaults
        $validated['capacity'] = $validated['capacity'] ?? 30;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $course = Course::create($validated);

        // Determine which programs to attach based on course type
        if ($courseType === 'UNIVERSITY') {
            // University requirement: attach to ALL programs
            $allProgramIds = \App\Models\Program::pluck('id')->toArray();
            if (!empty($allProgramIds)) {
                $course->programs()->attach($allProgramIds, ['type' => $courseType, 'semester' => 1]);
            }
        } elseif ($courseType === 'COLLEGE') {
            // College requirement: attach to all programs in selected colleges
            $targetCollegeIds = !empty($collegeIds) ? $collegeIds : ($collegeId ? [$collegeId] : []);
            if (!empty($targetCollegeIds)) {
                $collegeProgramIds = \App\Models\Program::where(function($q) use ($targetCollegeIds) {
                    $q->whereIn('college_id', $targetCollegeIds)
                      ->orWhereHas('department', function($dq) use ($targetCollegeIds) {
                          $dq->whereIn('college_id', $targetCollegeIds);
                      });
                })->pluck('id')->toArray();
                if (!empty($collegeProgramIds)) {
                    $course->programs()->attach($collegeProgramIds, ['type' => $courseType, 'semester' => 1]);
                }
            }
        } elseif (!empty($programIds) && is_array($programIds)) {
            // Major/Graduation: attach only to selected programs
            $course->programs()->attach($programIds, ['type' => $courseType, 'semester' => 1]);
        }

        return response()->json($course->load(['department', 'college', 'programs']), 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:50',
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'credits' => 'sometimes|integer|min:1|max:12',
            'capacity' => 'sometimes|integer|min:1',
            'department_id' => 'nullable|integer',
            'college_id' => 'nullable|integer',
            'program_ids' => 'nullable|array',
            'program_ids.*' => 'integer',
            'course_type' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        // Check code uniqueness only if code is being changed (case-insensitive comparison)
        if (isset($validated['code']) && strtoupper($validated['code']) !== strtoupper($course->code)) {
            $exists = Course::whereRaw('UPPER(code) = ?', [strtoupper($validated['code'])])->where('id', '!=', $course->id)->exists();
            if ($exists) {
                return response()->json(['message' => 'The code has already been taken.'], 422);
            }
        }

        // Extract program_ids and course_type before updating
        $programIds = $request->input('program_ids');
        $courseType = $request->input('course_type', 'MAJOR');
        unset($validated['program_ids'], $validated['course_type']);

        // Update the course
        $course->update($validated);

        // Sync programs if provided
        if (is_array($programIds)) {
            $syncData = [];
            foreach ($programIds as $programId) {
                $syncData[$programId] = ['type' => $courseType, 'semester' => 1];
            }
            $course->programs()->sync($syncData);
        }

        return response()->json($course->load(['department', 'college', 'programs']));
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

    /**
     * Assign course to multiple programs
     */
    public function assignPrograms(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'program_ids' => 'required|array|min:1',
            'program_ids.*' => 'integer|exists:programs,id',
            'course_type' => 'required|string|in:UNIVERSITY,COLLEGE,MAJOR,GRADUATION',
        ]);

        $programIds = $validated['program_ids'];
        $courseType = $validated['course_type'];

        // Prepare sync data with pivot values
        $syncData = [];
        foreach ($programIds as $programId) {
            $syncData[$programId] = ['type' => $courseType, 'semester' => 1];
        }

        // Sync without detaching existing relationships
        $course->programs()->syncWithoutDetaching($syncData);

        return response()->json([
            'message' => 'Course assigned to programs successfully',
            'course' => $course->load('programs'),
        ]);
    }

    /**
     * Remove course from a program
     */
    public function removeFromProgram(Course $course, $programId): JsonResponse
    {
        $course->programs()->detach($programId);

        return response()->json([
            'message' => 'Course removed from program successfully',
            'course' => $course->load('programs'),
        ]);
    }
}

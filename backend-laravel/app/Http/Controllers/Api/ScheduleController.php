<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Course;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Schedule::with(['course', 'semester']);

        if ($request->semester_id) {
            $query->where('semester_id', $request->semester_id);
        } else {
            // Default to current semester
            $currentSemester = Semester::current()->first();
            if ($currentSemester) {
                $query->where('semester_id', $currentSemester->id);
            }
        }

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->day) {
            $query->where('day', $request->day);
        }

        $schedules = $query->orderBy('day')
            ->orderBy('start_time')
            ->paginate($request->per_page ?? 50);

        return response()->json($schedules);
    }

    public function show(Schedule $schedule): JsonResponse
    {
        return response()->json($schedule->load(['course', 'semester']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
            'day' => 'required|in:SUNDAY,MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
            'building' => 'nullable|string|max:100',
            'instructor' => 'nullable|string|max:255',
            'section' => 'nullable|string|max:10',
        ]);

        // Check for room conflicts
        if ($validated['room']) {
            $conflict = Schedule::where('semester_id', $validated['semester_id'])
                ->where('day', $validated['day'])
                ->where('room', $validated['room'])
                ->where(function ($q) use ($validated) {
                    $q->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                      ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']])
                      ->orWhere(function ($q2) use ($validated) {
                          $q2->where('start_time', '<=', $validated['start_time'])
                             ->where('end_time', '>=', $validated['end_time']);
                      });
                })
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'Room conflict: This room is already booked for this time slot'
                ], 422);
            }
        }

        $schedule = Schedule::create($validated);

        return response()->json($schedule->load(['course', 'semester']), 201);
    }

    public function update(Request $request, Schedule $schedule): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'sometimes|exists:courses,id',
            'semester_id' => 'sometimes|exists:semesters,id',
            'day' => 'sometimes|in:SUNDAY,MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
            'building' => 'nullable|string|max:100',
            'instructor' => 'nullable|string|max:255',
            'section' => 'nullable|string|max:10',
        ]);

        $schedule->update($validated);

        return response()->json($schedule->load(['course', 'semester']));
    }

    public function destroy(Schedule $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json(null, 204);
    }

    public function courseSchedule(Course $course, Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;
        if (!$semesterId) {
            $currentSemester = Semester::current()->first();
            $semesterId = $currentSemester?->id;
        }

        $schedules = $course->schedules()
            ->when($semesterId, fn($q) => $q->where('semester_id', $semesterId))
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'course' => $course->only(['id', 'code', 'name_en', 'name_ar']),
            'schedules' => $schedules,
        ]);
    }

    public function studentTimetable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'STUDENT') {
            return response()->json(['message' => 'Only students can view timetables'], 403);
        }

        $student = $user->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $currentSemester = Semester::current()->first();
        if (!$currentSemester) {
            return response()->json(['message' => 'No active semester'], 404);
        }

        // Get student's enrolled courses
        $enrolledCourseIds = $student->enrollments()
            ->where('semester_id', $currentSemester->id)
            ->where('status', 'ENROLLED')
            ->pluck('course_id');

        $schedules = Schedule::with(['course:id,code,name_en,name_ar,credits'])
            ->where('semester_id', $currentSemester->id)
            ->whereIn('course_id', $enrolledCourseIds)
            ->orderBy('day')
            ->orderBy('start_time')
            ->get()
            ->groupBy('day');

        return response()->json([
            'semester' => $currentSemester->only(['id', 'name_en', 'name_ar']),
            'timetable' => $schedules,
        ]);
    }

    public function weeklyView(Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;
        if (!$semesterId) {
            $currentSemester = Semester::current()->first();
            $semesterId = $currentSemester?->id;
        }

        $schedules = Schedule::with(['course:id,code,name_en,name_ar'])
            ->where('semester_id', $semesterId)
            ->orderBy('start_time')
            ->get()
            ->groupBy('day');

        $days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        $weeklySchedule = [];

        foreach ($days as $day) {
            $weeklySchedule[$day] = $schedules->get($day, collect())->values();
        }

        return response()->json($weeklySchedule);
    }
}

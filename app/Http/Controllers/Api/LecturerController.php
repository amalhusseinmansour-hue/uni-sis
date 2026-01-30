<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LecturerController extends Controller
{
    public function myCourses(Request $request): JsonResponse
    {
        $user = $request->user();
        $semesterId = $request->semester_id;

        if (!$semesterId) {
            $currentSemester = Semester::current()->first();
            $semesterId = $currentSemester?->id;
        }

        // Get courses where the lecturer is assigned (via schedules)
        $courseIds = Schedule::where('instructor', $user->name)
            ->when($semesterId, fn($q) => $q->where('semester_id', $semesterId))
            ->pluck('course_id')
            ->unique();

        $courses = Course::with('department:id,name_en,name_ar')
            ->whereIn('id', $courseIds)
            ->get()
            ->map(function ($course) use ($semesterId) {
                $enrolledCount = Enrollment::where('course_id', $course->id)
                    ->where('semester_id', $semesterId)
                    ->where('status', 'ENROLLED')
                    ->count();

                return [
                    'id' => $course->id,
                    'code' => $course->code,
                    'name_en' => $course->name_en,
                    'name_ar' => $course->name_ar,
                    'credits' => $course->credits,
                    'department' => $course->department,
                    'enrolled_students' => $enrolledCount,
                ];
            });

        return response()->json([
            'semester_id' => $semesterId,
            'courses' => $courses,
        ]);
    }

    public function courseStudents(Course $course, Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;

        if (!$semesterId) {
            $currentSemester = Semester::current()->first();
            $semesterId = $currentSemester?->id;
        }

        $enrollments = Enrollment::with(['student:id,student_id,first_name_en,last_name_en,email'])
            ->where('course_id', $course->id)
            ->where('semester_id', $semesterId)
            ->where('status', 'ENROLLED')
            ->get();

        $students = $enrollments->map(function ($enrollment) use ($course, $semesterId) {
            $grade = Grade::where('student_id', $enrollment->student_id)
                ->where('course_id', $course->id)
                ->where('semester_id', $semesterId)
                ->first();

            return [
                'enrollment_id' => $enrollment->id,
                'student' => [
                    'id' => $enrollment->student->id,
                    'student_id' => $enrollment->student->student_id,
                    'name' => $enrollment->student->first_name_en . ' ' . $enrollment->student->last_name_en,
                    'email' => $enrollment->student->email,
                ],
                'section' => $enrollment->section,
                'grade' => $grade ? [
                    'id' => $grade->id,
                    'midterm' => $grade->midterm,
                    'final_exam' => $grade->final_exam,
                    'assignments' => $grade->assignments,
                    'attendance' => $grade->attendance,
                    'grade' => $grade->grade,
                    'status' => $grade->status,
                ] : null,
                'attendance_count' => $enrollment->attendance_count ?? 0,
                'total_classes' => $enrollment->total_classes ?? 0,
            ];
        });

        return response()->json([
            'course' => $course->only(['id', 'code', 'name_en', 'name_ar']),
            'semester_id' => $semesterId,
            'students' => $students,
            'total_students' => $students->count(),
        ]);
    }

    public function mySchedule(Request $request): JsonResponse
    {
        $user = $request->user();
        $semesterId = $request->semester_id;

        if (!$semesterId) {
            $currentSemester = Semester::current()->first();
            $semesterId = $currentSemester?->id;
        }

        $schedules = Schedule::with(['course:id,code,name_en,name_ar,credits'])
            ->where('instructor', $user->name)
            ->where('semester_id', $semesterId)
            ->orderBy('day')
            ->orderBy('start_time')
            ->get()
            ->groupBy('day');

        $days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        $weeklySchedule = [];

        foreach ($days as $day) {
            $weeklySchedule[$day] = $schedules->get($day, collect())->values();
        }

        return response()->json([
            'semester_id' => $semesterId,
            'schedule' => $weeklySchedule,
        ]);
    }

    public function submitGrades(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:students,id',
            'grades.*.midterm' => 'nullable|numeric|min:0|max:100',
            'grades.*.final_exam' => 'nullable|numeric|min:0|max:100',
            'grades.*.assignments' => 'nullable|numeric|min:0|max:100',
            'grades.*.attendance' => 'nullable|numeric|min:0|max:100',
            'grades.*.grade' => 'nullable|in:A+,A,A-,B+,B,B-,C+,C,C-,D+,D,F',
        ]);

        $results = [];

        foreach ($validated['grades'] as $gradeData) {
            $grade = Grade::updateOrCreate(
                [
                    'student_id' => $gradeData['student_id'],
                    'course_id' => $course->id,
                    'semester_id' => $validated['semester_id'],
                ],
                [
                    'midterm' => $gradeData['midterm'] ?? null,
                    'final_exam' => $gradeData['final_exam'] ?? null,
                    'assignments' => $gradeData['assignments'] ?? null,
                    'attendance' => $gradeData['attendance'] ?? null,
                    'grade' => $gradeData['grade'] ?? null,
                    'status' => 'PENDING',
                ]
            );

            $results[] = [
                'student_id' => $gradeData['student_id'],
                'grade_id' => $grade->id,
                'status' => 'submitted',
            ];
        }

        return response()->json([
            'message' => 'Grades submitted successfully',
            'course' => $course->only(['id', 'code', 'name_en']),
            'results' => $results,
        ]);
    }

    public function updateStudentGrade(Request $request, Course $course, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'midterm' => 'nullable|numeric|min:0|max:100',
            'final_exam' => 'nullable|numeric|min:0|max:100',
            'assignments' => 'nullable|numeric|min:0|max:100',
            'attendance' => 'nullable|numeric|min:0|max:100',
            'grade' => 'nullable|in:A+,A,A-,B+,B,B-,C+,C,C-,D+,D,F',
            'remarks' => 'nullable|string|max:500',
        ]);

        $grade = Grade::updateOrCreate(
            [
                'student_id' => $student->id,
                'course_id' => $course->id,
                'semester_id' => $validated['semester_id'],
            ],
            array_filter([
                'midterm' => $validated['midterm'] ?? null,
                'final_exam' => $validated['final_exam'] ?? null,
                'assignments' => $validated['assignments'] ?? null,
                'attendance' => $validated['attendance'] ?? null,
                'grade' => $validated['grade'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'status' => 'PENDING',
            ], fn($v) => $v !== null)
        );

        return response()->json([
            'message' => 'Grade updated successfully',
            'grade' => $grade,
        ]);
    }

    public function courseStatistics(Course $course, Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;

        if (!$semesterId) {
            $currentSemester = Semester::current()->first();
            $semesterId = $currentSemester?->id;
        }

        $enrollments = Enrollment::where('course_id', $course->id)
            ->where('semester_id', $semesterId)
            ->get();

        $grades = Grade::where('course_id', $course->id)
            ->where('semester_id', $semesterId)
            ->get();

        $gradeDistribution = $grades->groupBy('grade')->map->count();

        $avgMidterm = $grades->whereNotNull('midterm')->avg('midterm');
        $avgFinal = $grades->whereNotNull('final_exam')->avg('final_exam');
        $avgAssignments = $grades->whereNotNull('assignments')->avg('assignments');

        $passCount = $grades->whereIn('grade', ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'])->count();
        $failCount = $grades->where('grade', 'F')->count();
        $gradedCount = $grades->whereNotNull('grade')->count();

        return response()->json([
            'course' => $course->only(['id', 'code', 'name_en', 'name_ar']),
            'semester_id' => $semesterId,
            'enrollment' => [
                'total' => $enrollments->count(),
                'enrolled' => $enrollments->where('status', 'ENROLLED')->count(),
                'dropped' => $enrollments->where('status', 'DROPPED')->count(),
                'withdrawn' => $enrollments->where('status', 'WITHDRAWN')->count(),
            ],
            'grades' => [
                'graded_count' => $gradedCount,
                'pending_count' => $enrollments->where('status', 'ENROLLED')->count() - $gradedCount,
                'pass_count' => $passCount,
                'fail_count' => $failCount,
                'pass_rate' => $gradedCount > 0 ? round(($passCount / $gradedCount) * 100, 1) : 0,
                'distribution' => $gradeDistribution,
            ],
            'averages' => [
                'midterm' => $avgMidterm ? round($avgMidterm, 1) : null,
                'final_exam' => $avgFinal ? round($avgFinal, 1) : null,
                'assignments' => $avgAssignments ? round($avgAssignments, 1) : null,
            ],
        ]);
    }

    public function markAttendance(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'date' => 'required|date',
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.present' => 'required|boolean',
        ]);

        $results = [];

        foreach ($validated['attendance'] as $record) {
            $enrollment = Enrollment::where('student_id', $record['student_id'])
                ->where('course_id', $course->id)
                ->where('semester_id', $validated['semester_id'])
                ->where('status', 'ENROLLED')
                ->first();

            if ($enrollment) {
                if ($record['present']) {
                    $enrollment->increment('attendance_count');
                }
                $enrollment->increment('total_classes');

                $results[] = [
                    'student_id' => $record['student_id'],
                    'present' => $record['present'],
                    'recorded' => true,
                ];
            } else {
                $results[] = [
                    'student_id' => $record['student_id'],
                    'present' => $record['present'],
                    'recorded' => false,
                    'error' => 'Student not enrolled',
                ];
            }
        }

        return response()->json([
            'message' => 'Attendance recorded',
            'date' => $validated['date'],
            'results' => $results,
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentSemester = Semester::current()->first();
        $semesterId = $currentSemester?->id;

        // Get lecturer's courses
        $courseIds = Schedule::where('instructor', $user->name)
            ->where('semester_id', $semesterId)
            ->pluck('course_id')
            ->unique();

        $totalStudents = Enrollment::whereIn('course_id', $courseIds)
            ->where('semester_id', $semesterId)
            ->where('status', 'ENROLLED')
            ->distinct('student_id')
            ->count('student_id');

        $pendingGrades = Grade::whereIn('course_id', $courseIds)
            ->where('semester_id', $semesterId)
            ->where('status', 'PENDING')
            ->count();

        // Today's schedule
        $today = now()->format('l');
        $todaySchedule = Schedule::with('course:id,code,name_en')
            ->where('instructor', $user->name)
            ->where('semester_id', $semesterId)
            ->where('day', strtoupper($today))
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'semester' => $currentSemester?->only(['id', 'name_en', 'name_ar']),
            'statistics' => [
                'total_courses' => $courseIds->count(),
                'total_students' => $totalStudents,
                'pending_grades' => $pendingGrades,
            ],
            'today_schedule' => $todaySchedule,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function show(Enrollment $enrollment): JsonResponse
    {
        return response()->json([
            'enrollment_id' => $enrollment->id,
            'student_id' => $enrollment->student_id,
            'student_name' => $enrollment->student->full_name_en ?? null,
            'course_id' => $enrollment->course_id,
            'course_name' => $enrollment->course->name_en ?? null,
            'attendance_percentage' => $enrollment->attendance,
            'status' => $enrollment->status,
        ]);
    }

    public function update(Request $request, Enrollment $enrollment): JsonResponse
    {
        $validated = $request->validate([
            'attendance' => 'required|numeric|min:0|max:100',
        ]);

        $enrollment->update(['attendance' => $validated['attendance']]);

        return response()->json([
            'message' => 'Attendance updated successfully',
            'enrollment_id' => $enrollment->id,
            'attendance_percentage' => $enrollment->attendance,
        ]);
    }

    public function courseAttendance(Request $request, Course $course): JsonResponse
    {
        $query = $course->enrollments()
            ->with(['student:id,student_id,full_name_en,full_name_ar', 'semester:id,name_en,name_ar'])
            ->where('status', 'ENROLLED');

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        $enrollments = $query->get()->map(function ($enrollment) {
            return [
                'enrollment_id' => $enrollment->id,
                'student_id' => $enrollment->student_id,
                'student_number' => $enrollment->student->student_id ?? null,
                'student_name_en' => $enrollment->student->full_name_en ?? null,
                'student_name_ar' => $enrollment->student->full_name_ar ?? null,
                'semester' => $enrollment->semester->name_en ?? $enrollment->semester,
                'attendance_percentage' => $enrollment->attendance,
                'status' => $enrollment->status,
            ];
        });

        $averageAttendance = $enrollments->avg('attendance_percentage') ?? 0;

        return response()->json([
            'course_id' => $course->id,
            'course_code' => $course->code,
            'course_name' => $course->name_en,
            'total_students' => $enrollments->count(),
            'average_attendance' => round($averageAttendance, 2),
            'enrollments' => $enrollments,
        ]);
    }

    public function bulkUpdate(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'attendance_records' => 'required|array|min:1',
            'attendance_records.*.enrollment_id' => 'required|exists:enrollments,id',
            'attendance_records.*.attendance' => 'required|numeric|min:0|max:100',
        ]);

        $updated = [];
        $errors = [];

        foreach ($validated['attendance_records'] as $record) {
            $enrollment = Enrollment::where('id', $record['enrollment_id'])
                ->where('course_id', $course->id)
                ->first();

            if ($enrollment) {
                $enrollment->update(['attendance' => $record['attendance']]);
                $updated[] = [
                    'enrollment_id' => $enrollment->id,
                    'student_id' => $enrollment->student_id,
                    'attendance' => $record['attendance'],
                ];
            } else {
                $errors[] = [
                    'enrollment_id' => $record['enrollment_id'],
                    'message' => 'Enrollment not found or does not belong to this course',
                ];
            }
        }

        return response()->json([
            'message' => 'Bulk attendance update completed',
            'updated_count' => count($updated),
            'updated' => $updated,
            'errors' => $errors,
        ]);
    }

    public function statistics(Course $course): JsonResponse
    {
        $enrollments = $course->enrollments()->where('status', 'ENROLLED')->get();

        if ($enrollments->isEmpty()) {
            return response()->json([
                'course_id' => $course->id,
                'total_students' => 0,
                'average_attendance' => 0,
                'excellent_count' => 0,
                'good_count' => 0,
                'warning_count' => 0,
                'critical_count' => 0,
            ]);
        }

        $excellent = $enrollments->where('attendance', '>=', 90)->count(); // 90%+
        $good = $enrollments->whereBetween('attendance', [75, 89.99])->count(); // 75-89%
        $warning = $enrollments->whereBetween('attendance', [60, 74.99])->count(); // 60-74%
        $critical = $enrollments->where('attendance', '<', 60)->count(); // <60%

        return response()->json([
            'course_id' => $course->id,
            'course_name' => $course->name_en,
            'total_students' => $enrollments->count(),
            'average_attendance' => round($enrollments->avg('attendance'), 2),
            'excellent_count' => $excellent,
            'excellent_percentage' => round(($excellent / $enrollments->count()) * 100, 2),
            'good_count' => $good,
            'good_percentage' => round(($good / $enrollments->count()) * 100, 2),
            'warning_count' => $warning,
            'warning_percentage' => round(($warning / $enrollments->count()) * 100, 2),
            'critical_count' => $critical,
            'critical_percentage' => round(($critical / $enrollments->count()) * 100, 2),
        ]);
    }
}

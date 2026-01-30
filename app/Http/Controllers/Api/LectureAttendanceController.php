<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lecture;
use App\Models\LectureAttendance;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LectureAttendanceController extends Controller
{
    /**
     * عرض حضور محاضرة معينة
     */
    public function index(Lecture $lecture): JsonResponse
    {
        $attendance = $lecture->attendance()
            ->with(['student', 'recorder'])
            ->orderBy('status')
            ->get();

        $stats = $lecture->getAttendanceStats();

        return response()->json([
            'attendance' => $attendance,
            'statistics' => $stats,
        ]);
    }

    /**
     * عرض سجل حضور طالب معين
     */
    public function studentAttendance(Student $student, Request $request): JsonResponse
    {
        $query = LectureAttendance::with(['lecture.course'])
            ->where('student_id', $student->id);

        if ($request->course_id) {
            $query->whereHas('lecture', fn($q) => $q->where('course_id', $request->course_id));
        }

        if ($request->semester_id) {
            $query->whereHas('lecture', fn($q) => $q->where('semester_id', $request->semester_id));
        }

        $attendance = $query->orderByDesc('created_at')->paginate($request->per_page ?? 20);

        // حساب الإحصائيات
        $statsQuery = LectureAttendance::where('student_id', $student->id);

        if ($request->course_id) {
            $statsQuery->whereHas('lecture', fn($q) => $q->where('course_id', $request->course_id));
        }

        $stats = $statsQuery->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $total = array_sum($stats);
        $presentCount = ($stats['PRESENT'] ?? 0) + ($stats['LATE'] ?? 0) + ($stats['EXCUSED'] ?? 0);

        return response()->json([
            'attendance' => $attendance,
            'statistics' => [
                'total_lectures' => $total,
                'present' => $stats['PRESENT'] ?? 0,
                'absent' => $stats['ABSENT'] ?? 0,
                'late' => $stats['LATE'] ?? 0,
                'excused' => $stats['EXCUSED'] ?? 0,
                'left_early' => $stats['LEFT_EARLY'] ?? 0,
                'attendance_rate' => $total > 0 ? round(($presentCount / $total) * 100, 2) : 100,
            ],
        ]);
    }

    /**
     * تهيئة سجلات الحضور لمحاضرة
     */
    public function initialize(Lecture $lecture): JsonResponse
    {
        $created = LectureAttendance::initializeForLecture($lecture);

        return response()->json([
            'message' => "$created attendance records initialized",
            'attendance' => $lecture->attendance()->with('student')->get(),
        ]);
    }

    /**
     * تسجيل حضور فردي
     */
    public function recordSingle(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'status' => 'required|in:PRESENT,ABSENT,LATE,EXCUSED,LEFT_EARLY',
            'notes' => 'nullable|string|max:500',
            'excuse_reason' => 'nullable|string|max:500',
        ]);

        $attendance = LectureAttendance::updateOrCreate(
            [
                'lecture_id' => $lecture->id,
                'student_id' => $validated['student_id'],
            ],
            [
                'status' => $validated['status'],
                'recorded_by' => Auth::id(),
                'notes' => $validated['notes'] ?? null,
                'excuse_reason' => $validated['excuse_reason'] ?? null,
                'check_in_time' => in_array($validated['status'], ['PRESENT', 'LATE']) ? now() : null,
            ]
        );

        // تحديث إحصائيات الحضور
        $lecture->calculateAttendance();

        return response()->json($attendance->load('student'));
    }

    /**
     * تسجيل حضور جماعي
     */
    public function recordBulk(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'attendance' => 'required|array|min:1',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status' => 'required|in:PRESENT,ABSENT,LATE,EXCUSED,LEFT_EARLY',
            'attendance.*.notes' => 'nullable|string|max:500',
        ]);

        $results = [];
        DB::transaction(function () use ($lecture, $validated, &$results) {
            foreach ($validated['attendance'] as $record) {
                $attendance = LectureAttendance::updateOrCreate(
                    [
                        'lecture_id' => $lecture->id,
                        'student_id' => $record['student_id'],
                    ],
                    [
                        'status' => $record['status'],
                        'recorded_by' => Auth::id(),
                        'notes' => $record['notes'] ?? null,
                        'check_in_time' => in_array($record['status'], ['PRESENT', 'LATE']) ? now() : null,
                    ]
                );
                $results[] = $attendance;
            }
        });

        // تحديث إحصائيات الحضور
        $lecture->calculateAttendance();

        return response()->json([
            'message' => count($results) . ' attendance records updated',
            'attendance' => $lecture->fresh()->attendance()->with('student')->get(),
            'statistics' => $lecture->getAttendanceStats(),
        ]);
    }

    /**
     * تسجيل الحضور عبر QR Code
     */
    public function checkInByQR(Request $request, Lecture $lecture): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'STUDENT') {
            return response()->json(['message' => 'Only students can check in'], 403);
        }

        $student = $user->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        // التحقق من تسجيل الطالب في المقرر
        $isEnrolled = $lecture->course->enrollments()
            ->where('student_id', $student->id)
            ->where('status', 'ENROLLED')
            ->exists();

        if (!$isEnrolled) {
            return response()->json(['message' => 'You are not enrolled in this course'], 403);
        }

        // التحقق من أن المحاضرة في وقتها
        if (!$lecture->canRecordAttendance()) {
            return response()->json(['message' => 'Attendance cannot be recorded at this time'], 422);
        }

        $attendance = LectureAttendance::firstOrCreate(
            [
                'lecture_id' => $lecture->id,
                'student_id' => $student->id,
            ],
            [
                'status' => 'ABSENT',
            ]
        );

        $attendance->checkIn(true, false);

        return response()->json([
            'message' => 'Check-in successful',
            'attendance' => $attendance->fresh(),
        ]);
    }

    /**
     * تسجيل الانصراف
     */
    public function checkOut(Lecture $lecture): JsonResponse
    {
        $user = Auth::user();

        if ($user->role !== 'STUDENT') {
            return response()->json(['message' => 'Only students can check out'], 403);
        }

        $student = $user->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $attendance = LectureAttendance::where('lecture_id', $lecture->id)
            ->where('student_id', $student->id)
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'No attendance record found'], 404);
        }

        if (!$attendance->check_in_time) {
            return response()->json(['message' => 'You have not checked in yet'], 422);
        }

        $attendance->checkOut();

        return response()->json([
            'message' => 'Check-out successful',
            'attendance' => $attendance->fresh(),
        ]);
    }

    /**
     * تحديد غياب بعذر
     */
    public function markExcused(Request $request, Lecture $lecture, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'document_path' => 'nullable|string',
        ]);

        $attendance = LectureAttendance::where('lecture_id', $lecture->id)
            ->where('student_id', $student->id)
            ->firstOrFail();

        $attendance->markExcused($validated['reason'], $validated['document_path'] ?? null);

        return response()->json([
            'message' => 'Marked as excused',
            'attendance' => $attendance->fresh(),
        ]);
    }

    /**
     * تقرير الحضور لمقرر
     */
    public function courseAttendanceReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'nullable|exists:semesters,id',
        ]);

        $lectureIds = Lecture::where('course_id', $validated['course_id'])
            ->when($validated['semester_id'] ?? null, fn($q, $v) => $q->where('semester_id', $v))
            ->where('status', 'COMPLETED')
            ->pluck('id');

        $attendanceData = LectureAttendance::whereIn('lecture_id', $lectureIds)
            ->with(['student', 'lecture'])
            ->get();

        // تجميع حسب الطالب
        $byStudent = $attendanceData->groupBy('student_id')
            ->map(function ($records) use ($lectureIds) {
                $student = $records->first()->student;
                $statusCounts = $records->groupBy('status')
                    ->map(fn($g) => $g->count());

                $total = $lectureIds->count();
                $present = ($statusCounts['PRESENT'] ?? 0) + ($statusCounts['LATE'] ?? 0) + ($statusCounts['EXCUSED'] ?? 0);

                return [
                    'student_id' => $student->student_id,
                    'student_name_en' => $student->full_name_en,
                    'student_name_ar' => $student->full_name_ar,
                    'total_lectures' => $total,
                    'present' => $statusCounts['PRESENT'] ?? 0,
                    'absent' => $statusCounts['ABSENT'] ?? 0,
                    'late' => $statusCounts['LATE'] ?? 0,
                    'excused' => $statusCounts['EXCUSED'] ?? 0,
                    'attendance_rate' => $total > 0 ? round(($present / $total) * 100, 2) : 100,
                ];
            })
            ->values();

        return response()->json([
            'total_lectures' => $lectureIds->count(),
            'students' => $byStudent,
        ]);
    }

    /**
     * الحضور الخاص بي (للطالب)
     */
    public function myAttendance(Request $request): JsonResponse
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $query = LectureAttendance::with(['lecture.course', 'lecture.lecturer'])
            ->where('student_id', $student->id);

        if ($request->course_id) {
            $query->whereHas('lecture', fn($q) => $q->where('course_id', $request->course_id));
        }

        $attendance = $query->orderByDesc('created_at')->paginate($request->per_page ?? 20);

        // إحصائيات عامة
        $statsQuery = LectureAttendance::where('student_id', $student->id);
        $stats = $statsQuery->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $total = array_sum($stats);
        $presentCount = ($stats['PRESENT'] ?? 0) + ($stats['LATE'] ?? 0) + ($stats['EXCUSED'] ?? 0);

        return response()->json([
            'attendance' => $attendance,
            'summary' => [
                'total' => $total,
                'present' => $stats['PRESENT'] ?? 0,
                'absent' => $stats['ABSENT'] ?? 0,
                'late' => $stats['LATE'] ?? 0,
                'excused' => $stats['EXCUSED'] ?? 0,
                'attendance_rate' => $total > 0 ? round(($presentCount / $total) * 100, 2) : 100,
            ],
        ]);
    }
}

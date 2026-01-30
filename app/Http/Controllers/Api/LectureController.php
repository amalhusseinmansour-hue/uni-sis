<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lecture;
use App\Models\LectureAttendance;
use App\Models\Course;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LectureController extends Controller
{
    /**
     * عرض قائمة المحاضرات
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lecture::with(['course', 'lecturer', 'semester']);

        // فلاتر
        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->lecturer_id) {
            $query->where('lecturer_id', $request->lecturer_id);
        }

        if ($request->semester_id) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->mode) {
            $query->where('mode', $request->mode);
        }

        if ($request->date_from) {
            $query->where('lecture_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->where('lecture_date', '<=', $request->date_to);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title_en', 'like', "%{$request->search}%")
                  ->orWhere('title_ar', 'like', "%{$request->search}%")
                  ->orWhereHas('course', function ($cq) use ($request) {
                      $cq->where('name_en', 'like', "%{$request->search}%")
                         ->orWhere('code', 'like', "%{$request->search}%");
                  });
            });
        }

        // ترتيب
        $sortField = $request->sort_by ?? 'lecture_date';
        $sortDirection = $request->sort_direction ?? 'desc';
        $query->orderBy($sortField, $sortDirection);

        if ($sortField === 'lecture_date') {
            $query->orderBy('start_time', $sortDirection);
        }

        $lectures = $query->paginate($request->per_page ?? 15);

        return response()->json($lectures);
    }

    /**
     * عرض محاضرة واحدة
     */
    public function show(Lecture $lecture): JsonResponse
    {
        $lecture->load([
            'course',
            'lecturer',
            'semester',
            'materials' => fn($q) => $q->orderBy('order'),
            'attendance.student',
        ]);

        $lecture->attendance_stats = $lecture->getAttendanceStats();
        $lecture->average_rating = $lecture->average_rating;
        $lecture->ratings_count = $lecture->ratings_count;

        return response()->json($lecture);
    }

    /**
     * إنشاء محاضرة جديدة
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'lecturer_id' => 'required|exists:users,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'title_en' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'lecture_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:100',
            'building' => 'nullable|string|max:100',
            'type' => 'nullable|in:REGULAR,MAKEUP,EXTRA,EXAM_REVIEW,WORKSHOP,LAB,ONLINE',
            'mode' => 'nullable|in:IN_PERSON,ONLINE,HYBRID',
            'online_meeting_url' => 'nullable|url',
            'online_meeting_id' => 'nullable|string',
            'online_meeting_password' => 'nullable|string',
            'lecture_number' => 'nullable|integer|min:1',
            'week_number' => 'nullable|integer|min:1',
            'expected_students' => 'nullable|integer|min:0',
        ]);

        // حساب مدة المحاضرة بالدقائق
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $validated['duration_minutes'] = $start->diffInMinutes($end);

        // تعيين الفصل الدراسي الحالي إذا لم يُحدد
        if (!isset($validated['semester_id'])) {
            $currentSemester = Semester::where('is_current', true)->first();
            if ($currentSemester) {
                $validated['semester_id'] = $currentSemester->id;
            }
        }

        // تعيين عدد الطلاب المتوقع من المقرر إذا لم يُحدد
        if (!isset($validated['expected_students'])) {
            $course = Course::find($validated['course_id']);
            $validated['expected_students'] = $course->enrollments()
                ->where('status', 'ENROLLED')
                ->count();
        }

        $lecture = Lecture::create($validated);

        return response()->json($lecture->load(['course', 'lecturer', 'semester']), 201);
    }

    /**
     * تعديل محاضرة
     */
    public function update(Request $request, Lecture $lecture): JsonResponse
    {
        if (!$lecture->canBeEdited()) {
            return response()->json([
                'message' => 'Cannot edit a completed or cancelled lecture'
            ], 422);
        }

        $validated = $request->validate([
            'course_id' => 'sometimes|exists:courses,id',
            'lecturer_id' => 'sometimes|exists:users,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'title_en' => 'sometimes|string|max:255',
            'title_ar' => 'sometimes|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'lecture_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'room' => 'nullable|string|max:100',
            'building' => 'nullable|string|max:100',
            'type' => 'nullable|in:REGULAR,MAKEUP,EXTRA,EXAM_REVIEW,WORKSHOP,LAB,ONLINE',
            'mode' => 'nullable|in:IN_PERSON,ONLINE,HYBRID',
            'online_meeting_url' => 'nullable|url',
            'online_meeting_id' => 'nullable|string',
            'online_meeting_password' => 'nullable|string',
            'recording_url' => 'nullable|url',
            'topics_covered' => 'nullable|string',
            'notes' => 'nullable|string',
            'homework_assigned' => 'nullable|string',
            'lecture_number' => 'nullable|integer|min:1',
            'week_number' => 'nullable|integer|min:1',
            'expected_students' => 'nullable|integer|min:0',
        ]);

        // إعادة حساب المدة إذا تغيرت الأوقات
        if (isset($validated['start_time']) || isset($validated['end_time'])) {
            $start = Carbon::parse($validated['start_time'] ?? $lecture->start_time);
            $end = Carbon::parse($validated['end_time'] ?? $lecture->end_time);
            $validated['duration_minutes'] = $start->diffInMinutes($end);
        }

        $lecture->update($validated);

        return response()->json($lecture->load(['course', 'lecturer', 'semester']));
    }

    /**
     * حذف محاضرة
     */
    public function destroy(Lecture $lecture): JsonResponse
    {
        // التحقق من عدم وجود حضور مسجل
        if ($lecture->attendance()->whereIn('status', ['PRESENT', 'LATE'])->exists()) {
            return response()->json([
                'message' => 'Cannot delete a lecture with recorded attendance'
            ], 422);
        }

        // حذف المواد المرتبطة
        foreach ($lecture->materials as $material) {
            $material->deleteFile();
        }

        $lecture->delete();

        return response()->json(null, 204);
    }

    /**
     * إلغاء محاضرة
     */
    public function cancel(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $lecture->cancel($validated['reason']);

        return response()->json([
            'message' => 'Lecture cancelled successfully',
            'lecture' => $lecture->fresh()
        ]);
    }

    /**
     * تأجيل محاضرة
     */
    public function postpone(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'new_date' => 'required|date|after:today',
            'reason' => 'nullable|string|max:500',
        ]);

        $lecture->postpone($validated['new_date'], $validated['reason'] ?? null);

        return response()->json([
            'message' => 'Lecture postponed successfully',
            'lecture' => $lecture->fresh()
        ]);
    }

    /**
     * بدء محاضرة
     */
    public function start(Lecture $lecture): JsonResponse
    {
        if ($lecture->status !== 'SCHEDULED') {
            return response()->json([
                'message' => 'Can only start scheduled lectures'
            ], 422);
        }

        $lecture->start();

        // تهيئة سجلات الحضور
        LectureAttendance::initializeForLecture($lecture);

        return response()->json([
            'message' => 'Lecture started successfully',
            'lecture' => $lecture->fresh()
        ]);
    }

    /**
     * إنهاء محاضرة
     */
    public function complete(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'topics_covered' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $lecture->complete(
            $validated['topics_covered'] ?? null,
            $validated['notes'] ?? null
        );

        // تحديث إحصائيات الحضور
        $lecture->calculateAttendance();

        return response()->json([
            'message' => 'Lecture completed successfully',
            'lecture' => $lecture->fresh()
        ]);
    }

    /**
     * نسخ محاضرة
     */
    public function duplicate(Request $request, Lecture $lecture): JsonResponse
    {
        $validated = $request->validate([
            'new_date' => 'required|date',
        ]);

        $newLecture = $lecture->duplicate($validated['new_date']);

        return response()->json($newLecture->load(['course', 'lecturer']), 201);
    }

    /**
     * إنشاء محاضرات متكررة
     */
    public function createRecurring(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'lecturer_id' => 'required|exists:users,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'title_en' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:100',
            'building' => 'nullable|string|max:100',
            'mode' => 'nullable|in:IN_PERSON,ONLINE,HYBRID',
            'dates' => 'required|array|min:1',
            'dates.*' => 'date',
        ]);

        $dates = $validated['dates'];
        unset($validated['dates']);

        // حساب المدة
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $validated['duration_minutes'] = $start->diffInMinutes($end);

        $lectures = Lecture::createRecurring($validated, $dates);

        return response()->json([
            'message' => count($lectures) . ' lectures created successfully',
            'lectures' => $lectures
        ], 201);
    }

    /**
     * محاضرات اليوم
     */
    public function today(Request $request): JsonResponse
    {
        $query = Lecture::with(['course', 'lecturer'])->today();

        if ($request->lecturer_id) {
            $query->where('lecturer_id', $request->lecturer_id);
        }

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        return response()->json($query->get());
    }

    /**
     * محاضرات الأسبوع
     */
    public function thisWeek(Request $request): JsonResponse
    {
        $query = Lecture::with(['course', 'lecturer'])->thisWeek();

        if ($request->lecturer_id) {
            $query->where('lecturer_id', $request->lecturer_id);
        }

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        return response()->json($query->get());
    }

    /**
     * المحاضرات القادمة
     */
    public function upcoming(Request $request): JsonResponse
    {
        $query = Lecture::with(['course', 'lecturer'])->upcoming();

        if ($request->lecturer_id) {
            $query->where('lecturer_id', $request->lecturer_id);
        }

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        $limit = $request->limit ?? 10;

        return response()->json($query->limit($limit)->get());
    }

    /**
     * إحصائيات المحاضرات
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = Lecture::query();

        if ($request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->lecturer_id) {
            $query->where('lecturer_id', $request->lecturer_id);
        }

        if ($request->semester_id) {
            $query->where('semester_id', $request->semester_id);
        }

        $stats = [
            'total' => $query->count(),
            'by_status' => $query->clone()->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'by_type' => $query->clone()->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'by_mode' => $query->clone()->selectRaw('mode, COUNT(*) as count')
                ->groupBy('mode')
                ->pluck('count', 'mode'),
            'completed' => $query->clone()->where('status', 'COMPLETED')->count(),
            'cancelled' => $query->clone()->where('status', 'CANCELLED')->count(),
            'upcoming' => $query->clone()->where('lecture_date', '>=', now()->toDateString())
                ->where('status', 'SCHEDULED')->count(),
            'average_attendance_rate' => $query->clone()
                ->where('status', 'COMPLETED')
                ->where('expected_students', '>', 0)
                ->selectRaw('AVG(actual_attendance * 100.0 / expected_students) as avg_rate')
                ->value('avg_rate') ?? 0,
        ];

        return response()->json($stats);
    }

    /**
     * جدول المحاضر
     */
    public function lecturerSchedule(Request $request): JsonResponse
    {
        $lecturerId = $request->lecturer_id ?? Auth::id();

        $lectures = Lecture::with(['course'])
            ->where('lecturer_id', $lecturerId)
            ->where('lecture_date', '>=', now()->subDays(7)->toDateString())
            ->where('lecture_date', '<=', now()->addDays(30)->toDateString())
            ->orderBy('lecture_date')
            ->orderBy('start_time')
            ->get();

        // تجميع حسب التاريخ
        $grouped = $lectures->groupBy(fn($l) => $l->lecture_date->format('Y-m-d'));

        return response()->json([
            'lectures' => $lectures,
            'grouped_by_date' => $grouped,
        ]);
    }

    /**
     * محاضرات المقرر
     */
    public function courseLectures(Course $course, Request $request): JsonResponse
    {
        $query = $course->lectures()->with(['lecturer']);

        if ($request->semester_id) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $lectures = $query->orderBy('lecture_date')
            ->orderBy('start_time')
            ->paginate($request->per_page ?? 15);

        return response()->json($lectures);
    }
}

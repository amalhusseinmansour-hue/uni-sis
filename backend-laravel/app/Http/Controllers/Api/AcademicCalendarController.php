<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicEvent;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicCalendarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AcademicEvent::with('semester');

        // Filter by semester
        if ($request->semester_id) {
            $query->where('semester_id', $request->semester_id);
        }

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->from_date) {
            $query->where('start_date', '>=', $request->from_date);
        }
        if ($request->to_date) {
            $query->where('start_date', '<=', $request->to_date);
        }

        // Only published for non-admin
        if (!request()->user() || !request()->user()->isAdmin()) {
            $query->published();
        }

        $events = $query->orderBy('start_date')
            ->paginate($request->per_page ?? 50);

        return response()->json($events);
    }

    public function show(AcademicEvent $academicEvent): JsonResponse
    {
        return response()->json($academicEvent->load('semester'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'semester_id' => 'nullable|exists:semesters,id',
            'title_en' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'type' => 'required|in:HOLIDAY,EXAM,REGISTRATION,DEADLINE,EVENT,BREAK,OTHER',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_all_day' => 'boolean',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'is_published' => 'boolean',
        ]);

        $event = AcademicEvent::create($validated);

        return response()->json($event->load('semester'), 201);
    }

    public function update(Request $request, AcademicEvent $academicEvent): JsonResponse
    {
        $validated = $request->validate([
            'semester_id' => 'nullable|exists:semesters,id',
            'title_en' => 'sometimes|string|max:255',
            'title_ar' => 'sometimes|string|max:255',
            'description_en' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'type' => 'sometimes|in:HOLIDAY,EXAM,REGISTRATION,DEADLINE,EVENT,BREAK,OTHER',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_all_day' => 'boolean',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'is_published' => 'boolean',
        ]);

        $academicEvent->update($validated);

        return response()->json($academicEvent->load('semester'));
    }

    public function destroy(AcademicEvent $academicEvent): JsonResponse
    {
        $academicEvent->delete();

        return response()->json(null, 204);
    }

    public function upcoming(Request $request): JsonResponse
    {
        $limit = $request->limit ?? 10;

        $events = AcademicEvent::published()
            ->upcoming()
            ->orderBy('start_date')
            ->limit($limit)
            ->get();

        return response()->json($events);
    }

    public function currentMonth(Request $request): JsonResponse
    {
        $month = $request->month ?? now()->month;
        $year = $request->year ?? now()->year;

        $startOfMonth = now()->setYear($year)->setMonth($month)->startOfMonth()->toDateString();
        $endOfMonth = now()->setYear($year)->setMonth($month)->endOfMonth()->toDateString();

        $events = AcademicEvent::published()
            ->where(function ($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                  ->orWhereBetween('end_date', [$startOfMonth, $endOfMonth])
                  ->orWhere(function ($q2) use ($startOfMonth, $endOfMonth) {
                      $q2->where('start_date', '<=', $startOfMonth)
                         ->where('end_date', '>=', $endOfMonth);
                  });
            })
            ->orderBy('start_date')
            ->get();

        return response()->json([
            'month' => $month,
            'year' => $year,
            'events' => $events,
        ]);
    }

    public function semesterCalendar(Semester $semester): JsonResponse
    {
        $events = AcademicEvent::published()
            ->where('semester_id', $semester->id)
            ->orderBy('start_date')
            ->get();

        return response()->json([
            'semester' => $semester,
            'events' => $events,
        ]);
    }

    public function holidays(Request $request): JsonResponse
    {
        $year = $request->year ?? now()->year;

        $events = AcademicEvent::published()
            ->where('type', 'HOLIDAY')
            ->whereYear('start_date', $year)
            ->orderBy('start_date')
            ->get();

        return response()->json($events);
    }

    public function exams(Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;

        $query = AcademicEvent::published()
            ->where('type', 'EXAM');

        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        } else {
            $query->upcoming();
        }

        $events = $query->orderBy('start_date')->get();

        return response()->json($events);
    }

    public function deadlines(Request $request): JsonResponse
    {
        $events = AcademicEvent::published()
            ->where('type', 'DEADLINE')
            ->upcoming()
            ->orderBy('start_date')
            ->limit($request->limit ?? 10)
            ->get();

        return response()->json($events);
    }
}

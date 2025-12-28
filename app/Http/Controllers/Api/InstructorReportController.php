<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InstructorReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstructorReportController extends Controller
{
    protected InstructorReportService $reportService;

    public function __construct(InstructorReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * تقرير حضور الطلاب للمادة
     * GET /api/reports/instructor/course/{courseId}/attendance
     */
    public function courseAttendance(Request $request, int $courseId): JsonResponse
    {
        $semesterId = $request->query('semester_id');
        $section = $request->query('section');

        $data = $this->reportService->getCourseAttendanceReport($courseId, $semesterId, $section);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير الدرجات للمادة
     * GET /api/reports/instructor/course/{courseId}/grades
     */
    public function courseGrades(Request $request, int $courseId): JsonResponse
    {
        $semesterId = $request->query('semester_id');
        $section = $request->query('section');

        $data = $this->reportService->getCourseGradesReport($courseId, $semesterId, $section);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير رصد الدرجات النهائي
     * GET /api/reports/instructor/course/{courseId}/grade-submission
     */
    public function gradeSubmission(Request $request, int $courseId): JsonResponse
    {
        $semesterId = $request->query('semester_id');

        $data = $this->reportService->getFinalGradeSubmissionReport($courseId, $semesterId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير المدرس
     * GET /api/reports/instructor/{instructorId}/courses
     */
    public function instructorCourses(Request $request, int $instructorId): JsonResponse
    {
        $semesterId = $request->query('semester_id');

        $data = $this->reportService->getInstructorCourseReport($instructorId, $semesterId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير مقارنة الفصول للمادة
     * GET /api/reports/instructor/course/{courseId}/comparison
     */
    public function semesterComparison(Request $request, int $courseId): JsonResponse
    {
        $numberOfSemesters = $request->query('semesters', 4);

        $data = $this->reportService->getSemesterComparisonReport($courseId, $numberOfSemesters);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير الشكاوى الأكاديمية للمادة
     * GET /api/reports/instructor/course/{courseId}/complaints
     */
    public function courseComplaints(Request $request, int $courseId): JsonResponse
    {
        $semesterId = $request->query('semester_id');

        $data = $this->reportService->getCourseComplaintsReport($courseId, $semesterId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}

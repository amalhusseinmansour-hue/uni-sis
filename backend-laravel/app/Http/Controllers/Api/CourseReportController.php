<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * تقرير المواد المطروحة هذا الفصل
     * GET /api/reports/courses/offered
     */
    public function coursesOffered(Request $request): JsonResponse
    {
        $programId = $request->query('program_id');
        $departmentId = $request->query('department_id');

        $data = $this->reportService->getCoursesOfferedThisSemester($programId, $departmentId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير المساقات حسب النوع
     * GET /api/reports/courses/by-type
     */
    public function coursesByType(Request $request): JsonResponse
    {
        $programId = $request->query('program_id');

        $data = $this->reportService->getCoursesByType($programId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير المواد عالية التسجيل
     * GET /api/reports/courses/high-enrollment
     */
    public function highEnrollmentCourses(Request $request): JsonResponse
    {
        $threshold = $request->query('threshold', 50);
        $semesterId = $request->query('semester_id');

        $data = $this->reportService->getHighEnrollmentCourses($threshold, $semesterId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير المواد التي تحتاج شعب إضافية
     * GET /api/reports/courses/needs-sections
     */
    public function coursesNeedingSections(Request $request): JsonResponse
    {
        $semesterId = $request->query('semester_id');
        $capacityThreshold = $request->query('capacity_threshold', 90);

        $data = $this->reportService->getCoursesNeedingMoreSections($semesterId, $capacityThreshold);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير المواد ذات نسب الرسوب المرتفعة
     * GET /api/reports/courses/high-failure
     */
    public function highFailureCourses(Request $request): JsonResponse
    {
        $threshold = $request->query('threshold', 30);
        $semesterId = $request->query('semester_id');
        $semestersToCompare = $request->query('semesters', 4);

        $data = $this->reportService->getHighFailureCourses($threshold, $semesterId, $semestersToCompare);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}

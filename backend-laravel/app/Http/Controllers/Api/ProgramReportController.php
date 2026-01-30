<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * تقرير الطلاب حسب التخصص/البرنامج
     * GET /api/reports/program/{programId}/students
     */
    public function studentsByProgram(Request $request, int $programId): JsonResponse
    {
        $data = $this->reportService->getStudentsByProgram($programId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير الطلاب حسب المستوى الدراسي
     * GET /api/reports/program/{programId}/levels
     */
    public function studentsByLevel(Request $request, int $programId): JsonResponse
    {
        $data = $this->reportService->getStudentsByLevel($programId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير الطلاب حسب الخطة الدراسية
     * GET /api/reports/program/{programId}/study-plans
     */
    public function studentsByStudyPlan(Request $request, int $programId): JsonResponse
    {
        $data = $this->reportService->getStudentsByStudyPlan($programId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * توزيع المعدلات التراكمية
     * GET /api/reports/program/{programId}/gpa-distribution
     */
    public function gpaDistribution(Request $request, int $programId): JsonResponse
    {
        $data = $this->reportService->getGPADistribution($programId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * ملخص البرنامج الكامل
     * GET /api/reports/program/{programId}/summary
     */
    public function programSummary(Request $request, int $programId): JsonResponse
    {
        $data = $this->reportService->getProgramSummary($programId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير القسم
     * GET /api/reports/department/{departmentId}/summary
     */
    public function departmentSummary(Request $request, int $departmentId): JsonResponse
    {
        $data = $this->reportService->getDepartmentSummary($departmentId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير الكلية
     * GET /api/reports/college/{collegeId}/summary
     */
    public function collegeSummary(Request $request, int $collegeId): JsonResponse
    {
        $data = $this->reportService->getCollegeSummary($collegeId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير الطلاب حسب القسم
     * GET /api/reports/department/{departmentId}/students
     */
    public function studentsByDepartment(Request $request, int $departmentId): JsonResponse
    {
        $data = $this->reportService->getStudentsByProgram(null, $departmentId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * تقرير الطلاب حسب الكلية
     * GET /api/reports/college/{collegeId}/students
     */
    public function studentsByCollege(Request $request, int $collegeId): JsonResponse
    {
        $data = $this->reportService->getStudentsByProgram(null, null, $collegeId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}

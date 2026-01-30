<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Semester;
use App\Services\ReportCardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ReportCardController extends Controller
{
    public function __construct(
        protected ReportCardService $reportCardService
    ) {}

    // ==========================================
    // STUDENT ROUTES
    // ==========================================

    /**
     * Get my report cards list (for student)
     */
    public function myReportCards(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
                'message_ar' => 'لم يتم العثور على الملف الشخصي للطالب',
            ], 404);
        }

        $reportCards = $this->reportCardService->getStudentReportCards($student);

        return response()->json([
            'student' => [
                'student_id' => $student->student_id,
                'name_en' => $student->name_en,
                'name_ar' => $student->name_ar,
                'gpa' => $student->gpa,
            ],
            'report_cards' => $reportCards,
        ]);
    }

    /**
     * Get my report card for specific semester (for student)
     */
    public function myReportCard(Request $request, Semester $semester): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
            ], 404);
        }

        $reportCard = $this->reportCardService->getReportCardData($student, $semester);

        return response()->json($reportCard);
    }

    /**
     * Download my report card PDF (for student)
     */
    public function downloadMyReportCard(Request $request, Semester $semester)
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
            ], 404);
        }

        $language = $request->get('lang', 'en');
        $path = $this->reportCardService->generateReportCardPdf($student, $semester, $language);

        return response()->download(
            Storage::disk('public')->path($path),
            "report_card_{$student->student_id}_{$semester->id}.pdf",
            ['Content-Type' => 'application/pdf']
        )->deleteFileAfterSend(true);
    }

    // ==========================================
    // ADMIN ROUTES
    // ==========================================

    /**
     * Get student report card (admin)
     */
    public function show(Student $student, Semester $semester): JsonResponse
    {
        $reportCard = $this->reportCardService->getReportCardData($student, $semester);

        return response()->json($reportCard);
    }

    /**
     * Get all report cards for a student (admin)
     */
    public function studentReportCards(Student $student): JsonResponse
    {
        $reportCards = $this->reportCardService->getStudentReportCards($student);

        return response()->json([
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name_en' => $student->name_en,
                'name_ar' => $student->name_ar,
                'gpa' => $student->gpa,
                'program' => $student->program?->name_en,
            ],
            'report_cards' => $reportCards,
        ]);
    }

    /**
     * Generate report card PDF (admin)
     */
    public function generatePdf(Request $request, Student $student, Semester $semester): JsonResponse
    {
        $language = $request->get('lang', 'en');
        $path = $this->reportCardService->generateReportCardPdf($student, $semester, $language);

        return response()->json([
            'message' => 'Report card generated successfully',
            'message_ar' => 'تم إنشاء كشف الدرجات بنجاح',
            'download_url' => Storage::disk('public')->url($path),
            'path' => $path,
        ]);
    }

    /**
     * Download report card PDF (admin)
     */
    public function downloadPdf(Request $request, Student $student, Semester $semester)
    {
        $language = $request->get('lang', 'en');
        $path = $this->reportCardService->generateReportCardPdf($student, $semester, $language);

        return response()->download(
            Storage::disk('public')->path($path),
            "report_card_{$student->student_id}_{$semester->id}.pdf",
            ['Content-Type' => 'application/pdf']
        )->deleteFileAfterSend(true);
    }

    /**
     * Generate bulk report cards (admin)
     */
    public function bulkGenerate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
            'semester_id' => 'required|exists:semesters,id',
            'lang' => 'nullable|in:en,ar',
        ]);

        $language = $validated['lang'] ?? 'en';
        $path = $this->reportCardService->generateBulkReportCards(
            $validated['student_ids'],
            $validated['semester_id'],
            $language
        );

        return response()->json([
            'message' => 'Bulk report cards generated successfully',
            'message_ar' => 'تم إنشاء كشوف الدرجات بنجاح',
            'download_url' => Storage::disk('public')->url($path),
            'path' => $path,
            'count' => count($validated['student_ids']),
        ]);
    }

    /**
     * Download bulk report cards (admin)
     */
    public function downloadBulkPdf(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
            'semester_id' => 'required|exists:semesters,id',
            'lang' => 'nullable|in:en,ar',
        ]);

        $language = $validated['lang'] ?? 'en';
        $semester = Semester::find($validated['semester_id']);
        $path = $this->reportCardService->generateBulkReportCards(
            $validated['student_ids'],
            $validated['semester_id'],
            $language
        );

        return response()->download(
            Storage::disk('public')->path($path),
            "report_cards_bulk_{$semester->id}_" . now()->format('Y-m-d') . ".pdf",
            ['Content-Type' => 'application/pdf']
        )->deleteFileAfterSend(true);
    }
}

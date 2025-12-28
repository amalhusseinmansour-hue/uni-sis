<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\StudentIdCardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StudentIdCardController extends Controller
{
    public function __construct(
        protected StudentIdCardService $idCardService
    ) {}

    /**
     * Get my digital ID card (for student)
     */
    public function myIdCard(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
                'message_ar' => 'لم يتم العثور على الملف الشخصي للطالب',
            ], 404);
        }

        $idCard = $this->idCardService->getDigitalIdCard($student);
        $idCard['needs_renewal'] = $this->idCardService->needsRenewal($student);

        return response()->json($idCard);
    }

    /**
     * Download my ID card PDF (for student)
     */
    public function downloadMyIdCard(Request $request)
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found',
            ], 404);
        }

        $path = $this->idCardService->generateIdCardPdf($student);

        return response()->download(
            Storage::disk('public')->path($path),
            "id_card_{$student->student_id}.pdf",
            ['Content-Type' => 'application/pdf']
        )->deleteFileAfterSend(true);
    }

    /**
     * Get student ID card (admin)
     */
    public function show(Student $student): JsonResponse
    {
        $idCard = $this->idCardService->getDigitalIdCard($student);
        $idCard['needs_renewal'] = $this->idCardService->needsRenewal($student);

        return response()->json($idCard);
    }

    /**
     * Generate ID card PDF for a student (admin)
     */
    public function generatePdf(Student $student): JsonResponse
    {
        $path = $this->idCardService->generateIdCardPdf($student);

        return response()->json([
            'message' => 'ID card generated successfully',
            'message_ar' => 'تم إنشاء بطاقة الهوية بنجاح',
            'download_url' => Storage::disk('public')->url($path),
            'path' => $path,
        ]);
    }

    /**
     * Download student ID card PDF (admin)
     */
    public function downloadPdf(Student $student)
    {
        $path = $this->idCardService->generateIdCardPdf($student);

        return response()->download(
            Storage::disk('public')->path($path),
            "id_card_{$student->student_id}.pdf",
            ['Content-Type' => 'application/pdf']
        )->deleteFileAfterSend(true);
    }

    /**
     * Generate bulk ID cards PDF (admin)
     */
    public function bulkGenerate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
        ]);

        $path = $this->idCardService->generateBulkIdCardsPdf($validated['student_ids']);

        return response()->json([
            'message' => 'Bulk ID cards generated successfully',
            'message_ar' => 'تم إنشاء بطاقات الهوية بنجاح',
            'download_url' => Storage::disk('public')->url($path),
            'path' => $path,
            'count' => count($validated['student_ids']),
        ]);
    }

    /**
     * Download bulk ID cards PDF (admin)
     */
    public function downloadBulkPdf(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
        ]);

        $path = $this->idCardService->generateBulkIdCardsPdf($validated['student_ids']);

        return response()->download(
            Storage::disk('public')->path($path),
            "id_cards_bulk_" . now()->format('Y-m-d') . ".pdf",
            ['Content-Type' => 'application/pdf']
        )->deleteFileAfterSend(true);
    }

    /**
     * Upload student photo (admin)
     */
    public function uploadPhoto(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $path = $this->idCardService->updateStudentPhoto($student, $validated['photo']);

        return response()->json([
            'message' => 'Photo uploaded successfully',
            'message_ar' => 'تم رفع الصورة بنجاح',
            'photo_url' => Storage::disk('public')->url($path),
            'path' => $path,
        ]);
    }

    /**
     * Verify student from QR code (public endpoint)
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'qr_data' => 'required|string',
        ]);

        $result = $this->idCardService->verifyFromQR($validated['qr_data']);

        $statusCode = $result['valid'] ? 200 : 400;

        return response()->json($result, $statusCode);
    }

    /**
     * Verify from URL parameter (public - for QR scanner apps)
     */
    public function verifyFromUrl(string $encryptedData): JsonResponse
    {
        $result = $this->idCardService->verifyFromQR(urldecode($encryptedData));

        $statusCode = $result['valid'] ? 200 : 400;

        return response()->json($result, $statusCode);
    }
}

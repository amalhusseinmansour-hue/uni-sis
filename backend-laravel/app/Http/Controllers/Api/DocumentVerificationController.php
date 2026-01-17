<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentDocumentV2;
use App\Models\CertificateRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DocumentVerificationController extends Controller
{
    /**
     * Verify a document by its verification code
     */
    public function verifyByCode(string $code): JsonResponse
    {
        // Try to find in certificates first
        $certificate = CertificateRequest::where('verification_code', $code)
            ->orWhere('reference_number', $code)
            ->with(['student.program', 'student.user'])
            ->first();

        if ($certificate) {
            return $this->formatCertificateResponse($certificate);
        }

        // Try to find in student documents
        $document = StudentDocumentV2::where('verification_code', $code)
            ->with(['student.program', 'student.user'])
            ->first();

        if ($document) {
            return $this->formatDocumentResponse($document);
        }

        return response()->json([
            'valid' => false,
            'message' => 'Document not found',
            'message_ar' => 'الوثيقة غير موجودة',
        ], 404);
    }

    /**
     * Verify a certificate by its reference number
     */
    public function verifyCertificate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:100',
        ]);

        return $this->verifyByCode($validated['code']);
    }

    /**
     * Format certificate response
     */
    private function formatCertificateResponse($certificate): JsonResponse
    {
        $student = $certificate->student;

        return response()->json([
            'valid' => true,
            'document' => [
                'type' => $this->getCertificateTypeName($certificate->type, 'en'),
                'type_ar' => $this->getCertificateTypeName($certificate->type, 'ar'),
                'issue_date' => $certificate->completed_at ?? $certificate->created_at,
                'expiry_date' => $certificate->expiry_date,
                'reference_number' => $certificate->reference_number ?? $certificate->verification_code,
                'student' => [
                    'name_en' => $student->name_en ?? $student->user?->name,
                    'name_ar' => $student->name_ar ?? $student->name_en,
                    'student_id' => $student->student_id,
                    'program_en' => $student->program?->name_en ?? $student->major,
                    'program_ar' => $student->program?->name_ar ?? $student->major,
                ],
                'university' => [
                    'name_en' => config('app.university_name_en', 'University'),
                    'name_ar' => config('app.university_name_ar', 'الجامعة'),
                ],
            ],
        ]);
    }

    /**
     * Format document response
     */
    private function formatDocumentResponse($document): JsonResponse
    {
        $student = $document->student;

        return response()->json([
            'valid' => true,
            'document' => [
                'type' => $this->getDocumentTypeName($document->document_type, 'en'),
                'type_ar' => $this->getDocumentTypeName($document->document_type, 'ar'),
                'issue_date' => $document->issue_date ?? $document->created_at,
                'expiry_date' => $document->expiry_date,
                'reference_number' => $document->verification_code ?? $document->id,
                'student' => [
                    'name_en' => $student->name_en ?? $student->user?->name,
                    'name_ar' => $student->name_ar ?? $student->name_en,
                    'student_id' => $student->student_id,
                    'program_en' => $student->program?->name_en ?? $student->major,
                    'program_ar' => $student->program?->name_ar ?? $student->major,
                ],
                'university' => [
                    'name_en' => config('app.university_name_en', 'University'),
                    'name_ar' => config('app.university_name_ar', 'الجامعة'),
                ],
            ],
        ]);
    }

    /**
     * Get certificate type name
     */
    private function getCertificateTypeName(string $type, string $lang): string
    {
        $types = [
            'enrollment' => ['en' => 'Enrollment Certificate', 'ar' => 'شهادة قيد'],
            'transcript' => ['en' => 'Academic Transcript', 'ar' => 'كشف العلامات'],
            'gpa' => ['en' => 'GPA Certificate', 'ar' => 'شهادة المعدل التراكمي'],
            'good_conduct' => ['en' => 'Good Conduct Certificate', 'ar' => 'شهادة حسن السيرة والسلوك'],
            'expected_graduation' => ['en' => 'Expected Graduation Certificate', 'ar' => 'شهادة التخرج المتوقع'],
            'ranking' => ['en' => 'Ranking Certificate', 'ar' => 'شهادة الترتيب'],
            'course_completion' => ['en' => 'Course Completion Certificate', 'ar' => 'شهادة إتمام مقرر'],
            'graduation' => ['en' => 'Graduation Certificate', 'ar' => 'شهادة التخرج'],
            'financial_clearance' => ['en' => 'Financial Clearance', 'ar' => 'إخلاء طرف مالي'],
        ];

        return $types[$type][$lang] ?? ucfirst(str_replace('_', ' ', $type));
    }

    /**
     * Get document type name
     */
    private function getDocumentTypeName(string $type, string $lang): string
    {
        $types = [
            'HIGH_SCHOOL_CERTIFICATE' => ['en' => 'High School Certificate', 'ar' => 'شهادة الثانوية العامة'],
            'HIGH_SCHOOL_TRANSCRIPT' => ['en' => 'High School Transcript', 'ar' => 'كشف علامات الثانوية'],
            'BACHELOR_DEGREE' => ['en' => 'Bachelor Degree', 'ar' => 'شهادة البكالوريوس'],
            'BACHELOR_TRANSCRIPT' => ['en' => 'Bachelor Transcript', 'ar' => 'كشف علامات البكالوريوس'],
            'MASTER_DEGREE' => ['en' => 'Master Degree', 'ar' => 'شهادة الماجستير'],
            'MASTER_TRANSCRIPT' => ['en' => 'Master Transcript', 'ar' => 'كشف علامات الماجستير'],
            'PHD_DEGREE' => ['en' => 'PhD Degree', 'ar' => 'شهادة الدكتوراه'],
            'NATIONAL_ID' => ['en' => 'National ID', 'ar' => 'الهوية الوطنية'],
            'PASSPORT' => ['en' => 'Passport', 'ar' => 'جواز السفر'],
            'PERSONAL_PHOTO' => ['en' => 'Personal Photo', 'ar' => 'صورة شخصية'],
            'FORMAL_PHOTO' => ['en' => 'Formal Photo', 'ar' => 'صورة رسمية'],
            'BIRTH_CERTIFICATE' => ['en' => 'Birth Certificate', 'ar' => 'شهادة الميلاد'],
        ];

        return $types[$type][$lang] ?? ucfirst(str_replace('_', ' ', strtolower($type)));
    }
}

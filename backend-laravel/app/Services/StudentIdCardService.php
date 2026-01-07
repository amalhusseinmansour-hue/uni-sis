<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Semester;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Crypt;
use Barryvdh\DomPDF\Facade\Pdf;

class StudentIdCardService
{
    /**
     * Generate digital ID card data for a student
     */
    public function getDigitalIdCard(Student $student): array
    {
        $semester = Semester::getCurrentSemester();
        $program = $student->program;

        // Calculate valid expiry date - must be in the future
        $expiryDate = $this->calculateValidExpiryDate($semester);

        return [
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name_en' => $student->name_en,
                'name_ar' => $student->name_ar,
                'profile_picture_url' => $student->profile_picture_url,
                'status' => $student->status,
            ],
            'program' => $program ? [
                'name_en' => $program->name_en,
                'name_ar' => $program->name_ar,
                'degree' => $program->type,
            ] : null,
            'academic' => [
                'level' => $student->level,
                'semester' => $student->current_semester,
                'gpa' => $student->gpa,
                'academic_status' => $student->academic_status,
            ],
            'validity' => [
                'current_semester' => $semester ? [
                    'name' => $semester->name,
                    'name_ar' => $semester->name ?? null,
                    'start_date' => $semester->start_date?->format('Y-m-d'),
                    'end_date' => $semester->end_date?->format('Y-m-d'),
                ] : null,
                'issue_date' => now()->format('Y-m-d'),
                'expiry_date' => $expiryDate,
            ],
            'verification' => [
                'qr_data' => $this->generateQRData($student),
                'barcode' => $this->generateBarcode($student->student_id),
            ],
            'needs_renewal' => false,
        ];
    }

    /**
     * Calculate a valid expiry date that is always in the future
     */
    protected function calculateValidExpiryDate(?Semester $semester): string
    {
        // If semester has a valid future end_date, use it
        if ($semester?->end_date && $semester->end_date->isFuture()) {
            return $semester->end_date->format('Y-m-d');
        }

        // Otherwise, calculate based on current academic year
        $now = now();
        $currentYear = $now->year;
        $currentMonth = $now->month;

        // Academic year ends in August
        // If we're between September and December, expiry is next year August
        // If we're between January and August, expiry is this year August
        if ($currentMonth >= 9) {
            // Fall semester - expires end of next August
            return ($currentYear + 1) . '-08-31';
        } else {
            // Spring/Summer - expires end of this August
            return $currentYear . '-08-31';
        }
    }

    /**
     * Generate QR code data for verification
     */
    public function generateQRData(Student $student): string
    {
        $semester = Semester::getCurrentSemester();
        $expiryDate = $this->calculateValidExpiryDate($semester);

        $data = [
            'student_id' => $student->student_id,
            'name' => $student->name_en,
            'program' => $student->program?->name_en,
            'status' => $student->status,
            'valid_until' => $expiryDate,
            'timestamp' => now()->timestamp,
        ];

        // Encrypt the data for secure verification
        return Crypt::encryptString(json_encode($data));
    }

    /**
     * Generate barcode string
     */
    public function generateBarcode(string $studentId): string
    {
        // Format: University Code + Year + Student Number
        return 'UNI' . date('Y') . str_pad($studentId, 8, '0', STR_PAD_LEFT);
    }

    /**
     * Verify student from encrypted QR data
     */
    public function verifyFromQR(string $encryptedData): array
    {
        try {
            $jsonData = Crypt::decryptString($encryptedData);
            $data = json_decode($jsonData, true);

            if (!$data || !isset($data['student_id'])) {
                return [
                    'valid' => false,
                    'message' => 'Invalid QR code data',
                    'message_ar' => 'بيانات رمز QR غير صالحة',
                ];
            }

            // Check if card is expired
            if (isset($data['valid_until'])) {
                $validUntil = \Carbon\Carbon::parse($data['valid_until']);
                if ($validUntil->isPast()) {
                    return [
                        'valid' => false,
                        'message' => 'Student ID card has expired',
                        'message_ar' => 'انتهت صلاحية بطاقة الطالب',
                        'expired_on' => $data['valid_until'],
                    ];
                }
            }

            // Find the student
            $student = Student::where('student_id', $data['student_id'])->first();

            if (!$student) {
                return [
                    'valid' => false,
                    'message' => 'Student not found',
                    'message_ar' => 'الطالب غير موجود',
                ];
            }

            // Check student status
            if ($student->status !== 'ACTIVE') {
                return [
                    'valid' => false,
                    'message' => 'Student is not active',
                    'message_ar' => 'الطالب غير نشط',
                    'student_status' => $student->status,
                ];
            }

            return [
                'valid' => true,
                'message' => 'Valid student ID',
                'message_ar' => 'بطاقة طالب صالحة',
                'student' => [
                    'student_id' => $student->student_id,
                    'name_en' => $student->name_en,
                    'name_ar' => $student->name_ar,
                    'program' => $student->program?->name_en,
                    'program_ar' => $student->program?->name_ar,
                    'level' => $student->level,
                    'status' => $student->status,
                    'profile_picture_url' => $student->profile_picture_url,
                ],
                'valid_until' => $data['valid_until'] ?? null,
            ];
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'message' => 'Could not verify QR code',
                'message_ar' => 'تعذر التحقق من رمز QR',
            ];
        }
    }

    /**
     * Generate ID card PDF for a student
     */
    public function generateIdCardPdf(Student $student): string
    {
        $data = $this->getDigitalIdCard($student);

        // Generate QR code image (base64)
        $qrCode = $this->generateQRCodeImage($data['verification']['qr_data']);

        $pdfData = [
            'student' => $student,
            'program' => $student->program,
            'validity' => $data['validity'],
            'qr_code' => $qrCode,
            'barcode' => $data['verification']['barcode'],
            'university_name' => config('app.university_name', 'University SIS'),
            'university_name_ar' => config('app.university_name_ar', 'نظام الجامعة'),
            'university_logo' => config('app.university_logo'),
        ];

        $pdf = Pdf::loadView('pdf.student-id-card', $pdfData);
        $pdf->setPaper([0, 0, 243, 153], 'landscape'); // ID card size (85.6mm x 54mm)

        $filename = 'id_card_' . $student->student_id . '_' . time() . '.pdf';
        $path = 'students/id_cards/' . $filename;

        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * Generate bulk ID cards PDF
     */
    public function generateBulkIdCardsPdf(array $studentIds): string
    {
        $students = Student::whereIn('id', $studentIds)->with('program')->get();
        $cardsData = [];
        $semester = Semester::getCurrentSemester();
        $expiryDate = $this->calculateValidExpiryDate($semester);

        foreach ($students as $student) {
            $qrCode = $this->generateQRCodeImage($this->generateQRData($student));
            $cardsData[] = [
                'student' => $student,
                'program' => $student->program,
                'qr_code' => $qrCode,
                'barcode' => $this->generateBarcode($student->student_id),
                'validity' => [
                    'issue_date' => now()->format('Y-m-d'),
                    'expiry_date' => $expiryDate,
                ],
            ];
        }

        $pdf = Pdf::loadView('pdf.student-id-cards-bulk', [
            'cards' => $cardsData,
            'university_name' => config('app.university_name', 'University SIS'),
            'university_name_ar' => config('app.university_name_ar', 'نظام الجامعة'),
            'university_logo' => config('app.university_logo'),
        ]);
        $pdf->setPaper('a4', 'portrait');

        $filename = 'id_cards_bulk_' . time() . '.pdf';
        $path = 'students/id_cards/bulk/' . $filename;

        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * Generate QR code image as base64
     * Note: This is a placeholder. In production, use simplesoftwareio/simple-qrcode
     */
    protected function generateQRCodeImage(string $data): string
    {
        // If QR code library is available
        if (class_exists('\SimpleSoftwareIO\QrCode\Facades\QrCode')) {
            $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png')
                ->size(200)
                ->margin(1)
                ->generate($data);
            return 'data:image/png;base64,' . base64_encode($qrCode);
        }

        // Fallback: Use a QR code API (for development/testing)
        // In production, install the QR code package
        $encodedData = urlencode($data);
        return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={$encodedData}";
    }

    /**
     * Update student photo for ID card
     */
    public function updateStudentPhoto(Student $student, $photoFile): string
    {
        // Delete old photo if exists
        if ($student->profile_picture) {
            Storage::disk('public')->delete($student->profile_picture);
        }

        // Store new photo
        $path = $photoFile->store('students/photos', 'public');

        $student->update(['profile_picture' => $path]);

        return $path;
    }

    /**
     * Check if student needs ID card renewal
     */
    public function needsRenewal(Student $student): bool
    {
        $semester = Semester::getCurrentSemester();
        if (!$semester || !$semester->end_date) {
            return false;
        }

        // Card needs renewal if it expires within 30 days
        return $semester->end_date->diffInDays(now()) <= 30;
    }
}

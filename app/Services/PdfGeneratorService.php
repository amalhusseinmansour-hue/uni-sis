<?php

namespace App\Services;

use App\Models\AdmissionApplication;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfGeneratorService
{
    /**
     * إنشاء خطاب القبول
     */
    public function generateAcceptanceLetter(AdmissionApplication $application): string
    {
        $data = [
            'application' => $application,
            'program' => $application->program,
            'student_id' => $application->student_id,
            'date' => now()->format('Y-m-d'),
            'academic_year' => $this->getAcademicYear(),
        ];

        $pdf = Pdf::loadView('pdf.acceptance-letter', $data);
        $pdf->setPaper('a4', 'portrait');

        $filename = 'acceptance_letter_' . $application->student_id . '_' . time() . '.pdf';
        $path = 'admission/acceptance_letters/' . $filename;

        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * إنشاء بطاقة الجامعة
     */
    public function generateUniversityCard(AdmissionApplication $application): string
    {
        $data = [
            'application' => $application,
            'program' => $application->program,
            'student_id' => $application->student_id,
            'issue_date' => now()->format('Y-m-d'),
            'expiry_date' => now()->addYears(4)->format('Y-m-d'),
            'barcode' => $this->generateBarcode($application->student_id),
        ];

        $pdf = Pdf::loadView('pdf.university-card', $data);
        $pdf->setPaper([0, 0, 243, 153], 'landscape'); // حجم بطاقة ID (85.6mm x 54mm)

        $filename = 'university_card_' . $application->student_id . '_' . time() . '.pdf';
        $path = 'admission/university_cards/' . $filename;

        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * الحصول على السنة الأكاديمية
     */
    protected function getAcademicYear(): string
    {
        $year = (int) date('Y');
        $month = (int) date('m');

        // إذا كان الشهر بعد أغسطس، نعتبرها السنة الأكاديمية الجديدة
        if ($month >= 8) {
            return $year . '/' . ($year + 1);
        }

        return ($year - 1) . '/' . $year;
    }

    /**
     * توليد باركود بسيط (يمكن استخدام مكتبة متخصصة لاحقاً)
     */
    protected function generateBarcode(string $studentId): string
    {
        return '*' . $studentId . '*';
    }
}

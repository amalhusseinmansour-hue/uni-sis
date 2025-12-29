<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Semester;
use App\Models\Enrollment;
use App\Models\Grade;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;

class ReportCardService
{
    /**
     * Generate report card data for a student and semester
     */
    public function getReportCardData(Student $student, Semester $semester): array
    {
        $enrollments = Enrollment::where('student_id', $student->id)
            ->where('semester_id', $semester->id)
            ->with(['course', 'grade'])
            ->get();

        $grades = $this->processGrades($enrollments);
        $semesterGPA = $this->calculateSemesterGPA($grades);
        $attendance = $this->getAttendanceSummary($enrollments);
        $ranking = $this->getStudentRanking($student, $semester);

        return [
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'name_en' => $student->name_en,
                'name_ar' => $student->name_ar,
                'profile_picture_url' => $student->profile_picture_url,
                'level' => $student->level,
                'gpa' => $student->gpa,
                'academic_standing' => $student->academic_standing,
                'academic_standing_ar' => $student->academic_standing_ar,
            ],
            'program' => $student->program ? [
                'name_en' => $student->program->name_en,
                'name_ar' => $student->program->name_ar,
                'degree' => $student->program->type,
                'department' => $student->program->department?->name_en,
                'department_ar' => $student->program->department?->name_ar,
                'college' => $student->program->department?->college?->name_en,
                'college_ar' => $student->program->department?->college?->name_ar,
            ] : null,
            'semester' => [
                'id' => $semester->id,
                'name' => $semester->name,
                'name_ar' => $semester->name ?? null,
                'academic_year' => $semester->academic_year,
                'start_date' => $semester->start_date?->format('Y-m-d'),
                'end_date' => $semester->end_date?->format('Y-m-d'),
            ],
            'courses' => $grades,
            'summary' => [
                'total_courses' => count($grades),
                'total_credits' => collect($grades)->sum('credits'),
                'earned_credits' => collect($grades)->where('passed', true)->sum('credits'),
                'semester_gpa' => $semesterGPA,
                'cumulative_gpa' => $student->gpa,
                'academic_standing' => $student->academic_standing,
                'academic_standing_ar' => $student->academic_standing_ar,
            ],
            'attendance' => $attendance,
            'ranking' => $ranking,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Process grades for courses
     */
    protected function processGrades(Collection $enrollments): array
    {
        $grades = [];

        foreach ($enrollments as $enrollment) {
            $course = $enrollment->course;
            $grade = $enrollment->grade;

            $gradeData = [
                'course_code' => $course?->code,
                'course_name_en' => $course?->name_en,
                'course_name_ar' => $course?->name_ar,
                'credits' => $course?->credits ?? 0,
                'type' => $course?->type,
                'grade' => $grade?->grade ?? '-',
                'grade_points' => $grade ? $this->gradeToPoints($grade->grade) : 0,
                'status' => $grade?->status ?? 'PENDING',
                'passed' => $grade ? $this->isPassing($grade->grade) : false,
                'midterm_score' => $grade?->midterm_score,
                'final_score' => $grade?->final_score,
                'total_score' => $grade?->total_score,
                'attendance_percentage' => $enrollment->attendance_percentage ?? null,
            ];

            $grades[] = $gradeData;
        }

        return $grades;
    }

    /**
     * Calculate semester GPA
     */
    protected function calculateSemesterGPA(array $grades): float
    {
        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($grades as $grade) {
            if ($grade['status'] === 'APPROVED' || $grade['status'] === 'FINAL') {
                $totalPoints += $grade['grade_points'] * $grade['credits'];
                $totalCredits += $grade['credits'];
            }
        }

        return $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;
    }

    /**
     * Get attendance summary
     */
    protected function getAttendanceSummary(Collection $enrollments): array
    {
        $totalClasses = 0;
        $attendedClasses = 0;

        foreach ($enrollments as $enrollment) {
            $attendance = $enrollment->attendance ?? [];
            if (is_array($attendance)) {
                $totalClasses += count($attendance);
                $attendedClasses += collect($attendance)->where('status', 'PRESENT')->count();
            }
        }

        return [
            'total_classes' => $totalClasses,
            'attended_classes' => $attendedClasses,
            'missed_classes' => $totalClasses - $attendedClasses,
            'attendance_percentage' => $totalClasses > 0 ? round(($attendedClasses / $totalClasses) * 100, 1) : 100,
        ];
    }

    /**
     * Get student ranking in program
     */
    protected function getStudentRanking(Student $student, Semester $semester): array
    {
        $programStudents = Student::where('program_id', $student->program_id)
            ->where('level', $student->level)
            ->where('status', 'ACTIVE')
            ->orderByDesc('gpa')
            ->get(['id', 'gpa']);

        $totalStudents = $programStudents->count();
        $rank = $programStudents->search(fn($s) => $s->id === $student->id) + 1;

        $percentile = $totalStudents > 0 ? round((($totalStudents - $rank) / $totalStudents) * 100, 1) : 0;

        return [
            'rank' => $rank,
            'total_students' => $totalStudents,
            'percentile' => $percentile,
        ];
    }

    /**
     * Generate report card PDF
     */
    public function generateReportCardPdf(Student $student, Semester $semester, string $language = 'en'): string
    {
        $data = $this->getReportCardData($student, $semester);

        $view = $language === 'ar' ? 'pdf.report-card-ar' : 'pdf.report-card-en';

        $pdf = Pdf::loadView($view, [
            'data' => $data,
            'university_name' => config('app.university_name', 'University SIS'),
            'university_name_ar' => config('app.university_name_ar', 'نظام الجامعة'),
            'university_logo' => config('app.university_logo'),
            'rtl' => $language === 'ar',
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = "report_card_{$student->student_id}_{$semester->id}_{$language}_" . time() . '.pdf';
        $path = 'students/report_cards/' . $filename;

        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * Get all report cards for a student
     */
    public function getStudentReportCards(Student $student): array
    {
        $semesters = Semester::whereHas('enrollments', fn($q) => $q->where('student_id', $student->id))
            ->orderBy('start_date', 'desc')
            ->get();

        $reportCards = [];

        foreach ($semesters as $semester) {
            $reportCards[] = [
                'semester' => [
                    'id' => $semester->id,
                    'name' => $semester->name,
                    'name_ar' => $semester->name ?? null,
                    'academic_year' => $semester->academic_year,
                ],
                'summary' => $this->getSemesterSummary($student, $semester),
            ];
        }

        return $reportCards;
    }

    /**
     * Get semester summary (lighter version for listing)
     */
    protected function getSemesterSummary(Student $student, Semester $semester): array
    {
        $enrollments = Enrollment::where('student_id', $student->id)
            ->where('semester_id', $semester->id)
            ->with('grade')
            ->get();

        $grades = $this->processGrades($enrollments);
        $semesterGPA = $this->calculateSemesterGPA($grades);

        return [
            'total_courses' => count($grades),
            'total_credits' => collect($grades)->sum('credits'),
            'earned_credits' => collect($grades)->where('passed', true)->sum('credits'),
            'semester_gpa' => $semesterGPA,
            'has_pending_grades' => collect($grades)->where('status', 'PENDING')->isNotEmpty(),
        ];
    }

    /**
     * Generate bulk report cards
     */
    public function generateBulkReportCards(array $studentIds, int $semesterId, string $language = 'en'): string
    {
        $semester = Semester::findOrFail($semesterId);
        $students = Student::whereIn('id', $studentIds)->with('program')->get();

        $allData = [];
        foreach ($students as $student) {
            $allData[] = $this->getReportCardData($student, $semester);
        }

        $view = $language === 'ar' ? 'pdf.report-cards-bulk-ar' : 'pdf.report-cards-bulk-en';

        $pdf = Pdf::loadView($view, [
            'reports' => $allData,
            'semester' => $semester,
            'university_name' => config('app.university_name', 'University SIS'),
            'university_name_ar' => config('app.university_name_ar', 'نظام الجامعة'),
            'university_logo' => config('app.university_logo'),
            'rtl' => $language === 'ar',
        ]);

        $pdf->setPaper('a4', 'portrait');

        $filename = "report_cards_bulk_{$semester->id}_{$language}_" . time() . '.pdf';
        $path = 'students/report_cards/bulk/' . $filename;

        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * Convert grade letter to points
     */
    protected function gradeToPoints(string $grade): float
    {
        return match ($grade) {
            'A+', 'A' => 4.0,
            'A-' => 3.7,
            'B+' => 3.3,
            'B' => 3.0,
            'B-' => 2.7,
            'C+' => 2.3,
            'C' => 2.0,
            'C-' => 1.7,
            'D+' => 1.3,
            'D' => 1.0,
            'F' => 0.0,
            default => 0.0,
        };
    }

    /**
     * Check if grade is passing
     */
    protected function isPassing(string $grade): bool
    {
        return !in_array($grade, ['F', 'W', 'I', '-']);
    }
}

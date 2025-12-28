<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Grade;
use App\Models\Enrollment;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function transcript(Student $student): JsonResponse
    {
        $grades = Grade::with(['course:id,code,name_en,name_ar,credits', 'semester:id,name_en,name_ar,year'])
            ->where('student_id', $student->id)
            ->whereIn('status', ['APPROVED', 'FINAL'])
            ->orderBy('semester_id')
            ->get()
            ->groupBy('semester_id');

        $transcriptData = [];
        $totalCredits = 0;
        $totalPoints = 0;

        foreach ($grades as $semesterId => $semesterGrades) {
            $semester = $semesterGrades->first()->semester;
            $semesterCredits = 0;
            $semesterPoints = 0;
            $courses = [];

            foreach ($semesterGrades as $grade) {
                $credits = $grade->course->credits ?? 0;
                $points = $this->gradeToPoints($grade->grade) * $credits;

                $courses[] = [
                    'code' => $grade->course->code,
                    'name_en' => $grade->course->name_en,
                    'name_ar' => $grade->course->name_ar,
                    'credits' => $credits,
                    'grade' => $grade->grade,
                    'points' => $points,
                ];

                $semesterCredits += $credits;
                $semesterPoints += $points;
            }

            $semesterGPA = $semesterCredits > 0 ? round($semesterPoints / $semesterCredits, 2) : 0;

            $transcriptData[] = [
                'semester' => [
                    'id' => $semester->id,
                    'name_en' => $semester->name_en,
                    'name_ar' => $semester->name_ar,
                    'year' => $semester->year,
                ],
                'courses' => $courses,
                'semester_credits' => $semesterCredits,
                'semester_gpa' => $semesterGPA,
            ];

            $totalCredits += $semesterCredits;
            $totalPoints += $semesterPoints;
        }

        $cumulativeGPA = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;

        return response()->json([
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'full_name_en' => $student->full_name_en,
                'full_name_ar' => $student->full_name_ar,
                'program' => $student->program?->only(['id', 'name_en', 'name_ar']),
                'department' => $student->department?->only(['id', 'name_en', 'name_ar']),
            ],
            'semesters' => $transcriptData,
            'summary' => [
                'total_credits' => $totalCredits,
                'cumulative_gpa' => $cumulativeGPA,
                'academic_standing' => $this->getAcademicStanding($cumulativeGPA),
            ],
        ]);
    }

    public function transcriptPdf(Student $student)
    {
        $transcriptResponse = $this->transcript($student);
        $data = json_decode($transcriptResponse->getContent(), true);

        $pdf = Pdf::loadView('reports.transcript', $data);

        return $pdf->download("transcript_{$student->student_id}.pdf");
    }

    public function gradeReport(Student $student, Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;

        if (!$semesterId) {
            $currentSemester = Semester::current()->first();
            $semesterId = $currentSemester?->id;
        }

        $grades = Grade::with(['course:id,code,name_en,name_ar,credits'])
            ->where('student_id', $student->id)
            ->where('semester_id', $semesterId)
            ->get();

        $semester = Semester::find($semesterId);

        $totalCredits = 0;
        $totalPoints = 0;
        $courseGrades = [];

        foreach ($grades as $grade) {
            $credits = $grade->course->credits ?? 0;
            $points = $this->gradeToPoints($grade->grade) * $credits;

            $courseGrades[] = [
                'course' => $grade->course->only(['id', 'code', 'name_en', 'name_ar', 'credits']),
                'grade' => $grade->grade,
                'midterm' => $grade->midterm,
                'final_exam' => $grade->final_exam,
                'assignments' => $grade->assignments,
                'attendance' => $grade->attendance,
                'status' => $grade->status,
            ];

            if (in_array($grade->status, ['APPROVED', 'FINAL'])) {
                $totalCredits += $credits;
                $totalPoints += $points;
            }
        }

        $semesterGPA = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;

        return response()->json([
            'student' => $student->only(['id', 'student_id', 'full_name_en', 'full_name_ar']),
            'semester' => $semester?->only(['id', 'name_en', 'name_ar', 'year']),
            'grades' => $courseGrades,
            'summary' => [
                'total_credits' => $totalCredits,
                'semester_gpa' => $semesterGPA,
            ],
        ]);
    }

    public function enrollmentReport(Student $student, Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;

        $query = Enrollment::with(['course:id,code,name_en,name_ar,credits', 'semester:id,name_en,name_ar,year'])
            ->where('student_id', $student->id);

        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        }

        $enrollments = $query->orderBy('semester_id', 'desc')->get();

        $enrollmentsByStatus = $enrollments->groupBy('status');

        return response()->json([
            'student' => $student->only(['id', 'student_id', 'full_name_en', 'full_name_ar']),
            'enrollments' => $enrollments->map(function ($e) {
                return [
                    'id' => $e->id,
                    'course' => $e->course?->only(['id', 'code', 'name_en', 'name_ar', 'credits']),
                    'semester' => $e->semester?->only(['id', 'name_en', 'name_ar', 'year']),
                    'status' => $e->status,
                    'section' => $e->section,
                    'enrolled_at' => $e->enrolled_at,
                ];
            }),
            'summary' => [
                'total_enrolled' => $enrollmentsByStatus->get('ENROLLED', collect())->count(),
                'total_completed' => $enrollmentsByStatus->get('COMPLETED', collect())->count(),
                'total_dropped' => $enrollmentsByStatus->get('DROPPED', collect())->count(),
                'total_withdrawn' => $enrollmentsByStatus->get('WITHDRAWN', collect())->count(),
            ],
        ]);
    }

    public function financialReport(Student $student, Request $request): JsonResponse
    {
        $records = $student->financialRecords()
            ->with('semester:id,name_en,name_ar,year')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalTuition = $records->where('type', 'TUITION')->sum('amount');
        $totalFees = $records->whereIn('type', ['FEE', 'REGISTRATION_FEE'])->sum('amount');
        $totalPayments = $records->where('type', 'PAYMENT')->sum('amount');
        $totalScholarships = $records->where('type', 'SCHOLARSHIP')->sum('amount');

        $balance = $totalTuition + $totalFees - $totalPayments - $totalScholarships;

        return response()->json([
            'student' => $student->only(['id', 'student_id', 'full_name_en', 'full_name_ar']),
            'records' => $records->map(function ($r) {
                return [
                    'id' => $r->id,
                    'type' => $r->type,
                    'amount' => $r->amount,
                    'description' => $r->description,
                    'semester' => $r->semester?->only(['id', 'name_en', 'name_ar', 'year']),
                    'status' => $r->status,
                    'due_date' => $r->due_date,
                    'paid_at' => $r->paid_at,
                ];
            }),
            'summary' => [
                'total_tuition' => $totalTuition,
                'total_fees' => $totalFees,
                'total_payments' => $totalPayments,
                'total_scholarships' => $totalScholarships,
                'current_balance' => $balance,
            ],
        ]);
    }

    public function attendanceReport(Student $student, Request $request): JsonResponse
    {
        $semesterId = $request->semester_id;

        if (!$semesterId) {
            $currentSemester = Semester::current()->first();
            $semesterId = $currentSemester?->id;
        }

        $enrollments = Enrollment::with(['course:id,code,name_en,name_ar'])
            ->where('student_id', $student->id)
            ->where('semester_id', $semesterId)
            ->where('status', 'ENROLLED')
            ->get();

        $attendanceData = [];

        foreach ($enrollments as $enrollment) {
            $attendanceData[] = [
                'course' => $enrollment->course?->only(['id', 'code', 'name_en', 'name_ar']),
                'classes_attended' => $enrollment->attendance_count ?? 0,
                'total_classes' => $enrollment->total_classes ?? 0,
                'attendance_percentage' => $enrollment->total_classes > 0
                    ? round(($enrollment->attendance_count / $enrollment->total_classes) * 100, 1)
                    : 0,
            ];
        }

        $totalAttended = collect($attendanceData)->sum('classes_attended');
        $totalClasses = collect($attendanceData)->sum('total_classes');
        $overallPercentage = $totalClasses > 0 ? round(($totalAttended / $totalClasses) * 100, 1) : 0;

        return response()->json([
            'student' => $student->only(['id', 'student_id', 'full_name_en', 'full_name_ar']),
            'semester_id' => $semesterId,
            'courses' => $attendanceData,
            'summary' => [
                'total_classes_attended' => $totalAttended,
                'total_classes' => $totalClasses,
                'overall_attendance_percentage' => $overallPercentage,
            ],
        ]);
    }

    public function academicSummary(Student $student): JsonResponse
    {
        // Get all grades
        $grades = Grade::with('course:id,credits')
            ->where('student_id', $student->id)
            ->whereIn('status', ['APPROVED', 'FINAL'])
            ->get();

        $totalCredits = 0;
        $totalPoints = 0;

        foreach ($grades as $grade) {
            $credits = $grade->course->credits ?? 0;
            $points = $this->gradeToPoints($grade->grade) * $credits;
            $totalCredits += $credits;
            $totalPoints += $points;
        }

        $cumulativeGPA = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;

        // Get enrollment counts
        $enrollmentCounts = Enrollment::where('student_id', $student->id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Get current semester enrollment
        $currentSemester = Semester::current()->first();
        $currentEnrollments = $currentSemester
            ? Enrollment::where('student_id', $student->id)
                ->where('semester_id', $currentSemester->id)
                ->where('status', 'ENROLLED')
                ->count()
            : 0;

        return response()->json([
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'full_name_en' => $student->full_name_en,
                'full_name_ar' => $student->full_name_ar,
                'program' => $student->program?->only(['id', 'name_en', 'name_ar', 'required_credits']),
                'department' => $student->department?->only(['id', 'name_en', 'name_ar']),
                'enrollment_date' => $student->enrollment_date,
                'status' => $student->status,
            ],
            'academic_record' => [
                'cumulative_gpa' => $cumulativeGPA,
                'academic_standing' => $this->getAcademicStanding($cumulativeGPA),
                'total_credits_earned' => $totalCredits,
                'credits_required' => $student->program?->required_credits ?? 0,
                'credits_remaining' => max(0, ($student->program?->required_credits ?? 0) - $totalCredits),
                'completion_percentage' => $student->program?->required_credits > 0
                    ? round(($totalCredits / $student->program->required_credits) * 100, 1)
                    : 0,
            ],
            'enrollment_statistics' => [
                'current_semester_courses' => $currentEnrollments,
                'total_completed' => $enrollmentCounts['COMPLETED'] ?? 0,
                'total_dropped' => $enrollmentCounts['DROPPED'] ?? 0,
                'total_withdrawn' => $enrollmentCounts['WITHDRAWN'] ?? 0,
            ],
        ]);
    }

    private function gradeToPoints(string $grade): float
    {
        return match ($grade) {
            'A+' => 4.0,
            'A' => 4.0,
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

    private function getAcademicStanding(float $gpa): string
    {
        return match (true) {
            $gpa >= 3.7 => 'Dean\'s List',
            $gpa >= 3.0 => 'Good Standing',
            $gpa >= 2.0 => 'Satisfactory',
            $gpa >= 1.0 => 'Academic Probation',
            default => 'Academic Suspension',
        };
    }
}

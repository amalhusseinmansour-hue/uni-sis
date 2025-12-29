<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class InstructorReportService
{
    /**
     * تقرير حضور الطلاب للمادة
     * Student attendance report for a course
     */
    public function getCourseAttendanceReport(int $courseId, ?int $semesterId = null, ?string $section = null): array
    {
        $semesterId = $semesterId ?? Semester::where('is_current', true)->value('id');

        $query = Enrollment::query()
            ->where('course_id', $courseId)
            ->where('semester_id', $semesterId)
            ->where('status', 'ENROLLED')
            ->with('student:id,student_id,name_en,name_ar');

        if ($section) {
            $query->where('section', $section);
        }

        $enrollments = $query->get();

        $attendanceData = [];
        $atRiskStudents = [];
        $totalAttendance = 0;
        $count = 0;

        foreach ($enrollments as $enrollment) {
            $attendance = $enrollment->attendance ?? 0;
            $totalAttendance += $attendance;
            $count++;

            $data = [
                'student_id' => $enrollment->student->student_id,
                'student_name_en' => $enrollment->student->name_en,
                'student_name_ar' => $enrollment->student->name_ar,
                'section' => $enrollment->section,
                'attendance_percentage' => $attendance,
                'status' => $this->getAttendanceStatus($attendance),
            ];

            $attendanceData[] = $data;

            // طلاب معرضين للحرمان (أقل من 75%)
            if ($attendance < 75) {
                $atRiskStudents[] = $data;
            }
        }

        return [
            'course_id' => $courseId,
            'semester_id' => $semesterId,
            'section' => $section,
            'total_students' => $count,
            'average_attendance' => $count > 0 ? round($totalAttendance / $count, 1) : 0,
            'at_risk_count' => count($atRiskStudents),
            'students' => $attendanceData,
            'at_risk_students' => $atRiskStudents,
            'attendance_distribution' => [
                'excellent' => collect($attendanceData)->where('attendance_percentage', '>=', 90)->count(),
                'good' => collect($attendanceData)->whereBetween('attendance_percentage', [75, 89])->count(),
                'warning' => collect($attendanceData)->whereBetween('attendance_percentage', [60, 74])->count(),
                'critical' => collect($attendanceData)->where('attendance_percentage', '<', 60)->count(),
            ],
        ];
    }

    private function getAttendanceStatus(float $percentage): string
    {
        return match (true) {
            $percentage >= 90 => 'EXCELLENT',
            $percentage >= 75 => 'GOOD',
            $percentage >= 60 => 'WARNING',
            default => 'CRITICAL',
        };
    }

    /**
     * تقرير الدرجات للمادة
     * Course grades report (coursework, midterm, final)
     */
    public function getCourseGradesReport(int $courseId, ?int $semesterId = null, ?string $section = null): array
    {
        $semesterId = $semesterId ?? Semester::where('is_current', true)->value('id');

        $query = Grade::query()
            ->where('course_id', $courseId)
            ->where('semester_id', $semesterId)
            ->with('student:id,student_id,name_en,name_ar');

        // Get section from enrollment if needed
        $gradesData = $query->get()->map(function ($grade) use ($section) {
            // Check if student is in the specified section
            $enrollment = $grade->student->enrollments()
                ->where('course_id', $grade->course_id)
                ->where('semester_id', $grade->semester_id)
                ->first();

            if ($section && $enrollment?->section !== $section) {
                return null;
            }

            return [
                'student_id' => $grade->student->student_id,
                'student_name_en' => $grade->student->name_en,
                'student_name_ar' => $grade->student->name_ar,
                'section' => $enrollment?->section,
                'coursework' => $grade->coursework_score,
                'midterm' => $grade->midterm_score,
                'final' => $grade->final_score,
                'total' => $grade->total_score,
                'grade' => $grade->grade,
                'status' => $grade->status,
            ];
        })->filter()->values();

        // Calculate statistics
        $courseworkScores = $gradesData->pluck('coursework')->filter();
        $midtermScores = $gradesData->pluck('midterm')->filter();
        $finalScores = $gradesData->pluck('final')->filter();
        $totalScores = $gradesData->pluck('total')->filter();

        return [
            'course_id' => $courseId,
            'semester_id' => $semesterId,
            'section' => $section,
            'total_students' => $gradesData->count(),
            'statistics' => [
                'coursework' => [
                    'average' => $courseworkScores->avg() ? round($courseworkScores->avg(), 2) : null,
                    'min' => $courseworkScores->min(),
                    'max' => $courseworkScores->max(),
                ],
                'midterm' => [
                    'average' => $midtermScores->avg() ? round($midtermScores->avg(), 2) : null,
                    'min' => $midtermScores->min(),
                    'max' => $midtermScores->max(),
                ],
                'final' => [
                    'average' => $finalScores->avg() ? round($finalScores->avg(), 2) : null,
                    'min' => $finalScores->min(),
                    'max' => $finalScores->max(),
                ],
                'total' => [
                    'average' => $totalScores->avg() ? round($totalScores->avg(), 2) : null,
                    'min' => $totalScores->min(),
                    'max' => $totalScores->max(),
                ],
            ],
            'grade_distribution' => $gradesData->groupBy('grade')->map->count()->toArray(),
            'pass_rate' => $gradesData->count() > 0
                ? round(($gradesData->where('grade', '!=', 'F')->count() / $gradesData->count()) * 100, 1)
                : 0,
            'students' => $gradesData->toArray(),
        ];
    }

    /**
     * تقرير رصد الدرجات النهائي
     * Final grade submission report
     */
    public function getFinalGradeSubmissionReport(int $courseId, ?int $semesterId = null): array
    {
        $semesterId = $semesterId ?? Semester::where('is_current', true)->value('id');

        $enrollments = Enrollment::query()
            ->where('course_id', $courseId)
            ->where('semester_id', $semesterId)
            ->where('status', 'ENROLLED')
            ->count();

        $grades = Grade::query()
            ->where('course_id', $courseId)
            ->where('semester_id', $semesterId)
            ->get();

        $submitted = $grades->count();
        $approved = $grades->where('status', 'APPROVED')->count();
        $pending = $grades->where('status', 'PENDING')->count();
        $final = $grades->where('status', 'FINAL')->count();

        return [
            'course_id' => $courseId,
            'semester_id' => $semesterId,
            'total_enrolled' => $enrollments,
            'grades_submitted' => $submitted,
            'grades_pending' => $pending,
            'grades_approved' => $approved,
            'grades_finalized' => $final,
            'missing_grades' => $enrollments - $submitted,
            'completion_percentage' => $enrollments > 0
                ? round(($submitted / $enrollments) * 100, 1)
                : 0,
            'is_complete' => $submitted >= $enrollments && $pending === 0,
        ];
    }

    /**
     * تقرير المساق للمدرس
     * Instructor course report
     */
    public function getInstructorCourseReport(int $instructorId, ?int $semesterId = null): array
    {
        $semesterId = $semesterId ?? Semester::where('is_current', true)->value('id');

        // Get courses taught by instructor (would need a schedule or assignment table)
        // For now, using enrollments grouped by course
        $courses = Enrollment::query()
            ->where('semester_id', $semesterId)
            ->select('course_id')
            ->distinct()
            ->with('course:id,code,name_en,credits')
            ->get()
            ->map(function ($enrollment) use ($semesterId) {
                $course = $enrollment->course;
                $grades = Grade::where('course_id', $course->id)
                    ->where('semester_id', $semesterId)
                    ->get();

                return [
                    'course_id' => $course->id,
                    'course_code' => $course->code,
                    'course_name' => $course->name_en,
                    'credits' => $course->credits,
                    'enrolled_students' => Enrollment::where('course_id', $course->id)
                        ->where('semester_id', $semesterId)
                        ->where('status', 'ENROLLED')
                        ->count(),
                    'grades_submitted' => $grades->count(),
                    'average_grade' => $grades->avg('total_score'),
                    'pass_rate' => $grades->count() > 0
                        ? round(($grades->where('grade', '!=', 'F')->count() / $grades->count()) * 100, 1)
                        : null,
                ];
            });

        return [
            'instructor_id' => $instructorId,
            'semester_id' => $semesterId,
            'courses' => $courses->toArray(),
            'total_courses' => $courses->count(),
            'total_students' => $courses->sum('enrolled_students'),
        ];
    }

    /**
     * تقرير مقارنة الفصول
     * Semester comparison report for a course
     */
    public function getSemesterComparisonReport(int $courseId, int $numberOfSemesters = 4): array
    {
        $semesters = Semester::orderByDesc('id')
            ->limit($numberOfSemesters)
            ->get();

        $comparisonData = [];

        foreach ($semesters as $semester) {
            $grades = Grade::query()
                ->where('course_id', $courseId)
                ->where('semester_id', $semester->id)
                ->whereIn('status', ['APPROVED', 'FINAL'])
                ->get();

            $total = $grades->count();
            $passed = $grades->where('grade', '!=', 'F')->count();
            $failed = $grades->where('grade', 'F')->count();

            $comparisonData[] = [
                'semester_id' => $semester->id,
                'semester_name' => $semester->name_en,
                'academic_year' => $semester->academic_year,
                'total_students' => $total,
                'passed' => $passed,
                'failed' => $failed,
                'pass_rate' => $total > 0 ? round(($passed / $total) * 100, 1) : 0,
                'failure_rate' => $total > 0 ? round(($failed / $total) * 100, 1) : 0,
                'average_score' => $grades->avg('total_score') ? round($grades->avg('total_score'), 2) : null,
                'grade_distribution' => $grades->groupBy('grade')->map->count()->toArray(),
            ];
        }

        return [
            'course_id' => $courseId,
            'semesters_compared' => $numberOfSemesters,
            'data' => $comparisonData,
            'trend' => $this->calculateTrend($comparisonData),
        ];
    }

    private function calculateTrend(array $data): string
    {
        if (count($data) < 2) {
            return 'INSUFFICIENT_DATA';
        }

        $recentPassRate = $data[0]['pass_rate'] ?? 0;
        $previousPassRate = $data[1]['pass_rate'] ?? 0;
        $difference = $recentPassRate - $previousPassRate;

        return match (true) {
            $difference > 5 => 'IMPROVING',
            $difference < -5 => 'DECLINING',
            default => 'STABLE',
        };
    }

    /**
     * تقرير الشكاوى الأكاديمية للمادة
     * Academic complaints report for a course
     */
    public function getCourseComplaintsReport(int $courseId, ?int $semesterId = null): array
    {
        $semesterId = $semesterId ?? Semester::where('is_current', true)->value('id');

        // Get grade appeals and reviews for this course
        $requests = DB::table('student_requests')
            ->where('course_id', $courseId)
            ->where('semester_id', $semesterId)
            ->whereIn('request_type', ['GRADE_REVIEW', 'GRADE_APPEAL', 'EXAM_RETAKE', 'ACADEMIC_EXCUSE'])
            ->get();

        return [
            'course_id' => $courseId,
            'semester_id' => $semesterId,
            'total_complaints' => $requests->count(),
            'by_type' => [
                'grade_review' => $requests->where('request_type', 'GRADE_REVIEW')->count(),
                'grade_appeal' => $requests->where('request_type', 'GRADE_APPEAL')->count(),
                'exam_retake' => $requests->where('request_type', 'EXAM_RETAKE')->count(),
                'academic_excuse' => $requests->where('request_type', 'ACADEMIC_EXCUSE')->count(),
            ],
            'by_status' => [
                'pending' => $requests->whereIn('status', ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'])->count(),
                'approved' => $requests->where('status', 'APPROVED')->count(),
                'rejected' => $requests->where('status', 'REJECTED')->count(),
            ],
            'requests' => $requests->map(fn($r) => [
                'id' => $r->id,
                'request_number' => $r->request_number,
                'type' => $r->request_type,
                'status' => $r->status,
                'date' => $r->request_date,
                'reason' => $r->reason,
            ])->toArray(),
        ];
    }
}

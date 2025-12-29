<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Program;
use App\Models\Department;
use App\Models\College;
use App\Models\Semester;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * تقرير الطلاب حسب التخصص/البرنامج
     * Student statistics by program
     */
    public function getStudentsByProgram(?int $programId = null, ?int $departmentId = null, ?int $collegeId = null): array
    {
        $query = Student::query();

        if ($programId) {
            $query->where('program_id', $programId);
        }
        if ($departmentId) {
            $query->whereHas('program', fn($q) => $q->where('department_id', $departmentId));
        }
        if ($collegeId) {
            $query->whereHas('program.department', fn($q) => $q->where('college_id', $collegeId));
        }

        $total = $query->count();

        return [
            'total_students' => $total,
            'by_status' => [
                'active' => (clone $query)->where('status', 'ACTIVE')->count(),
                'suspended' => (clone $query)->where('status', 'SUSPENDED')->count(),
                'withdrawn' => (clone $query)->where('status', 'WITHDRAWN')->count(),
                'graduated' => (clone $query)->where('status', 'GRADUATED')->count(),
            ],
            'by_academic_status' => [
                'regular' => (clone $query)->where('academic_status', 'REGULAR')->count(),
                'on_probation' => (clone $query)->where('academic_status', 'ON_PROBATION')->count(),
                'dismissed' => (clone $query)->where('academic_status', 'DISMISSED')->count(),
                'completed' => (clone $query)->where('academic_status', 'COMPLETED_REQUIREMENTS')->count(),
            ],
            'by_administrative_status' => [
                'active' => (clone $query)->where('administrative_status', 'ACTIVE')->count(),
                'postponed' => (clone $query)->where('administrative_status', 'POSTPONED')->count(),
                'suspended' => (clone $query)->where('administrative_status', 'SUSPENDED')->count(),
                'withdrawn' => (clone $query)->where('administrative_status', 'WITHDRAWN')->count(),
            ],
        ];
    }

    /**
     * تقرير الطلاب حسب المستوى الدراسي
     * Students by academic level
     */
    public function getStudentsByLevel(?int $programId = null, ?int $departmentId = null): array
    {
        $query = Student::query()->where('status', 'ACTIVE');

        if ($programId) {
            $query->where('program_id', $programId);
        }
        if ($departmentId) {
            $query->whereHas('program', fn($q) => $q->where('department_id', $departmentId));
        }

        $levels = [];
        for ($i = 1; $i <= 6; $i++) {
            $levels["level_{$i}"] = (clone $query)->where('level', $i)->count();
        }

        return [
            'by_level' => $levels,
            'completed_mandatory_credits' => (clone $query)
                ->where('has_completed_required_credits', true)->count(),
            'with_delayed_courses' => (clone $query)
                ->whereHas('studyPlanCourses', fn($q) => $q->where('status', 'FAILED'))->count(),
            'eligible_for_graduation' => (clone $query)
                ->whereHas('graduationRequirements', fn($q) => $q->where('is_eligible_to_graduate', true))->count(),
        ];
    }

    /**
     * تقرير الطلاب حسب الخطة الدراسية
     * Students by study plan version
     */
    public function getStudentsByStudyPlan(?int $programId = null): array
    {
        $query = Student::query()
            ->where('status', 'ACTIVE');

        if ($programId) {
            $query->where('program_id', $programId);
        }

        return $query->select('study_plan_code', 'study_plan_name', DB::raw('count(*) as count'))
            ->groupBy('study_plan_code', 'study_plan_name')
            ->get()
            ->map(fn($item) => [
                'plan_code' => $item->study_plan_code,
                'plan_name' => $item->study_plan_name,
                'student_count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * تقرير المواد المطروحة هذا الفصل
     * Courses offered this semester by program
     */
    public function getCoursesOfferedThisSemester(?int $programId = null, ?int $departmentId = null): array
    {
        $currentSemester = Semester::where('is_current', true)->first();
        if (!$currentSemester) {
            return [];
        }

        $query = Enrollment::query()
            ->where('semester_id', $currentSemester->id)
            ->with(['course', 'course.department']);

        if ($departmentId) {
            $query->whereHas('course', fn($q) => $q->where('department_id', $departmentId));
        }

        $courses = $query->select('course_id', 'section', DB::raw('count(*) as enrolled_count'))
            ->groupBy('course_id', 'section')
            ->get();

        $courseData = [];
        foreach ($courses as $enrollment) {
            $course = $enrollment->course;
            $courseId = $course->id;

            if (!isset($courseData[$courseId])) {
                $courseData[$courseId] = [
                    'course_id' => $course->id,
                    'course_code' => $course->code,
                    'course_name_en' => $course->name_en,
                    'course_name_ar' => $course->name_ar,
                    'credits' => $course->credits,
                    'department' => $course->department?->name_en,
                    'sections' => [],
                    'total_enrolled' => 0,
                    'section_count' => 0,
                ];
            }

            $courseData[$courseId]['sections'][] = [
                'section' => $enrollment->section,
                'enrolled' => $enrollment->enrolled_count,
            ];
            $courseData[$courseId]['total_enrolled'] += $enrollment->enrolled_count;
            $courseData[$courseId]['section_count']++;
        }

        return array_values($courseData);
    }

    /**
     * تقرير المساقات المرتبطة بالتخصص
     * Courses by type (core, elective, university, college)
     */
    public function getCoursesByType(?int $programId = null): array
    {
        $query = DB::table('student_study_plan_courses')
            ->join('courses', 'student_study_plan_courses.course_id', '=', 'courses.id')
            ->select('course_type', DB::raw('count(DISTINCT course_id) as course_count'));

        if ($programId) {
            $query->whereIn('student_id', function ($sq) use ($programId) {
                $sq->select('id')->from('students')->where('program_id', $programId);
            });
        }

        $byType = $query->groupBy('course_type')->get();

        return [
            'university_required' => $byType->firstWhere('course_type', 'UNIVERSITY_REQUIRED')?->course_count ?? 0,
            'university_elective' => $byType->firstWhere('course_type', 'UNIVERSITY_ELECTIVE')?->course_count ?? 0,
            'college_required' => $byType->firstWhere('course_type', 'COLLEGE_REQUIRED')?->course_count ?? 0,
            'college_elective' => $byType->firstWhere('course_type', 'COLLEGE_ELECTIVE')?->course_count ?? 0,
            'major_required' => $byType->firstWhere('course_type', 'MAJOR_REQUIRED')?->course_count ?? 0,
            'major_elective' => $byType->firstWhere('course_type', 'MAJOR_ELECTIVE')?->course_count ?? 0,
            'free_elective' => $byType->firstWhere('course_type', 'FREE_ELECTIVE')?->course_count ?? 0,
        ];
    }

    /**
     * تقرير المواد عالية التسجيل
     * High enrollment courses
     */
    public function getHighEnrollmentCourses(int $threshold = 50, ?int $semesterId = null): array
    {
        $semesterId = $semesterId ?? Semester::where('is_current', true)->value('id');

        return Enrollment::query()
            ->where('semester_id', $semesterId)
            ->where('status', 'ENROLLED')
            ->select('course_id', DB::raw('count(*) as enrollment_count'))
            ->groupBy('course_id')
            ->having('enrollment_count', '>=', $threshold)
            ->with('course:id,code,name_en,name_ar,capacity')
            ->orderByDesc('enrollment_count')
            ->get()
            ->map(fn($e) => [
                'course_id' => $e->course_id,
                'course_code' => $e->course->code,
                'course_name' => $e->course->name_en,
                'enrollment_count' => $e->enrollment_count,
                'capacity' => $e->course->capacity,
                'utilization' => $e->course->capacity > 0
                    ? round(($e->enrollment_count / $e->course->capacity) * 100, 1)
                    : null,
            ])
            ->toArray();
    }

    /**
     * تقرير المواد التي تحتاج شعب إضافية
     * Courses needing additional sections
     */
    public function getCoursesNeedingMoreSections(?int $semesterId = null, int $capacityThreshold = 90): array
    {
        $semesterId = $semesterId ?? Semester::where('is_current', true)->value('id');

        return Course::query()
            ->withCount(['enrollments as current_enrollment' => function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId)->where('status', 'ENROLLED');
            }])
            ->having('current_enrollment', '>', DB::raw('capacity * ' . ($capacityThreshold / 100)))
            ->orderByDesc('current_enrollment')
            ->get()
            ->map(fn($course) => [
                'course_id' => $course->id,
                'course_code' => $course->code,
                'course_name' => $course->name_en,
                'capacity' => $course->capacity,
                'current_enrollment' => $course->current_enrollment,
                'utilization_percentage' => $course->capacity > 0
                    ? round(($course->current_enrollment / $course->capacity) * 100, 1)
                    : 0,
                'sections_needed' => max(1, ceil(($course->current_enrollment - $course->capacity) / 30)),
            ])
            ->toArray();
    }

    /**
     * تقرير المواد ذات نسب الرسوب المرتفعة
     * Courses with high failure rates
     */
    public function getHighFailureCourses(float $threshold = 30, ?int $semesterId = null, int $semestersToCompare = 4): array
    {
        $semesters = Semester::orderByDesc('id')
            ->limit($semestersToCompare)
            ->pluck('id');

        $failureData = Grade::query()
            ->whereIn('semester_id', $semesters)
            ->whereIn('status', ['APPROVED', 'FINAL'])
            ->select(
                'course_id',
                'semester_id',
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN grade = "F" THEN 1 ELSE 0 END) as failed')
            )
            ->groupBy('course_id', 'semester_id')
            ->with('course:id,code,name_en,name_ar')
            ->get();

        $courseStats = [];
        foreach ($failureData as $data) {
            $courseId = $data->course_id;
            $failureRate = $data->total > 0 ? ($data->failed / $data->total) * 100 : 0;

            if (!isset($courseStats[$courseId])) {
                $courseStats[$courseId] = [
                    'course_id' => $courseId,
                    'course_code' => $data->course?->code,
                    'course_name' => $data->course?->name_en,
                    'semesters' => [],
                    'average_failure_rate' => 0,
                    'total_students' => 0,
                    'total_failed' => 0,
                ];
            }

            $courseStats[$courseId]['semesters'][] = [
                'semester_id' => $data->semester_id,
                'total' => $data->total,
                'failed' => $data->failed,
                'failure_rate' => round($failureRate, 1),
            ];
            $courseStats[$courseId]['total_students'] += $data->total;
            $courseStats[$courseId]['total_failed'] += $data->failed;
        }

        // Calculate average failure rate and filter
        $result = [];
        foreach ($courseStats as $stats) {
            $avgRate = $stats['total_students'] > 0
                ? ($stats['total_failed'] / $stats['total_students']) * 100
                : 0;
            $stats['average_failure_rate'] = round($avgRate, 1);

            if ($avgRate >= $threshold) {
                $result[] = $stats;
            }
        }

        // Sort by failure rate descending
        usort($result, fn($a, $b) => $b['average_failure_rate'] <=> $a['average_failure_rate']);

        return $result;
    }

    /**
     * تقرير ملخص البرنامج
     * Program summary report
     */
    public function getProgramSummary(int $programId): array
    {
        $program = Program::with(['department.college'])->find($programId);
        if (!$program) {
            return [];
        }

        $students = Student::where('program_id', $programId);

        return [
            'program' => [
                'id' => $program->id,
                'name_en' => $program->name_en,
                'name_ar' => $program->name_ar,
                'code' => $program->code,
                'type' => $program->type,
                'department' => $program->department?->name_en,
                'college' => $program->department?->college?->name_en,
            ],
            'statistics' => $this->getStudentsByProgram($programId),
            'by_level' => $this->getStudentsByLevel($programId),
            'by_study_plan' => $this->getStudentsByStudyPlan($programId),
            'gpa_distribution' => $this->getGPADistribution($programId),
        ];
    }

    /**
     * توزيع المعدلات التراكمية
     * GPA Distribution
     */
    public function getGPADistribution(?int $programId = null): array
    {
        $query = Student::query()->where('status', 'ACTIVE');

        if ($programId) {
            $query->where('program_id', $programId);
        }

        return [
            'excellent' => (clone $query)->where('gpa', '>=', 3.7)->count(),      // امتياز
            'very_good' => (clone $query)->whereBetween('gpa', [3.0, 3.69])->count(), // جيد جداً
            'good' => (clone $query)->whereBetween('gpa', [2.5, 2.99])->count(),  // جيد
            'satisfactory' => (clone $query)->whereBetween('gpa', [2.0, 2.49])->count(), // مقبول
            'probation' => (clone $query)->whereBetween('gpa', [1.0, 1.99])->count(), // إنذار
            'failing' => (clone $query)->where('gpa', '<', 1.0)->count(),         // راسب
        ];
    }

    /**
     * تقرير القسم
     * Department summary
     */
    public function getDepartmentSummary(int $departmentId): array
    {
        $department = Department::with(['college', 'programs'])->find($departmentId);
        if (!$department) {
            return [];
        }

        $programIds = $department->programs->pluck('id');

        return [
            'department' => [
                'id' => $department->id,
                'name_en' => $department->name_en,
                'name_ar' => $department->name_ar,
                'code' => $department->code,
                'college' => $department->college?->name_en,
            ],
            'programs' => $department->programs->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name_en,
                'type' => $p->type,
                'student_count' => Student::where('program_id', $p->id)->where('status', 'ACTIVE')->count(),
            ]),
            'statistics' => $this->getStudentsByProgram(null, $departmentId),
            'by_level' => $this->getStudentsByLevel(null, $departmentId),
        ];
    }

    /**
     * تقرير الكلية
     * College summary
     */
    public function getCollegeSummary(int $collegeId): array
    {
        $college = College::with(['departments.programs'])->find($collegeId);
        if (!$college) {
            return [];
        }

        return [
            'college' => [
                'id' => $college->id,
                'name_en' => $college->name_en,
                'name_ar' => $college->name_ar,
                'code' => $college->code,
                'dean_name' => $college->dean_name,
            ],
            'departments' => $college->departments->map(fn($d) => [
                'id' => $d->id,
                'name' => $d->name_en,
                'program_count' => $d->programs->count(),
                'student_count' => Student::whereIn('program_id', $d->programs->pluck('id'))
                    ->where('status', 'ACTIVE')->count(),
            ]),
            'statistics' => $this->getStudentsByProgram(null, null, $collegeId),
        ];
    }
}

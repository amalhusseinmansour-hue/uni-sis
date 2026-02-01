<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\MoodleCourse;
use App\Models\MoodleEnrollment;
use App\Models\MoodleGrade;
use App\Models\MoodleSyncLog;
use App\Models\MoodleUser;
use App\Models\Student;
use App\Models\User;
use App\Services\MoodleIntegrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MoodleSyncController extends Controller
{
    public function __construct(
        protected MoodleIntegrationService $moodleService
    ) {}

    /**
     * Get Moodle connection status
     * GET /api/moodle/status
     */
    public function getStatus(): JsonResponse
    {
        $connectionTest = $this->moodleService->testConnection();
        $stats = $this->moodleService->getSyncStatistics();

        return response()->json([
            'configured' => $this->moodleService->isConfigured(),
            'enabled' => $this->moodleService->isSyncEnabled(),
            'connection' => $connectionTest,
            'statistics' => $stats,
        ]);
    }

    /**
     * Get sync statistics
     * GET /api/moodle/sync/status
     */
    public function getSyncStatus(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->moodleService->getSyncStatistics(),
        ]);
    }

    /**
     * Get all students from LMS (view only)
     * GET /api/moodle/students
     */
    public function getLmsStudents(): JsonResponse
    {
        $result = $this->moodleService->getLmsStudents();

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * Sync all students to Moodle
     * POST /api/moodle/sync/students
     */
    public function syncStudents(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'integer|exists:students,id',
            'only_pending' => 'nullable|boolean',
        ]);

        $query = Student::query();

        if (!empty($validated['student_ids'])) {
            $query->whereIn('id', $validated['student_ids']);
        } elseif ($validated['only_pending'] ?? false) {
            // Only sync students without Moodle record or with pending status
            $query->whereDoesntHave('moodleUser')
                ->orWhereHas('moodleUser', fn ($q) => $q->pending());
        }

        $students = $query->where('status', 'ACTIVE')->get();
        $results = $this->moodleService->syncStudents($students);

        return response()->json([
            'success' => true,
            'message' => "Synced {$results['success']} students, {$results['failed']} failed",
            'data' => $results,
        ]);
    }

    /**
     * Sync all lecturers to Moodle
     * POST /api/moodle/sync/lecturers
     */
    public function syncLecturers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer|exists:users,id',
        ]);

        $query = User::where('role', 'LECTURER');

        if (!empty($validated['user_ids'])) {
            $query->whereIn('id', $validated['user_ids']);
        }

        $lecturers = $query->get();
        $results = $this->moodleService->syncLecturers($lecturers);

        return response()->json([
            'success' => true,
            'message' => "Synced {$results['success']} lecturers, {$results['failed']} failed",
            'data' => $results,
        ]);
    }

    /**
     * Sync all courses to Moodle
     * POST /api/moodle/sync/courses
     */
    public function syncCourses(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_ids' => 'nullable|array',
            'course_ids.*' => 'integer|exists:courses,id',
            'only_pending' => 'nullable|boolean',
        ]);

        $query = Course::query();

        if (!empty($validated['course_ids'])) {
            $query->whereIn('id', $validated['course_ids']);
        } elseif ($validated['only_pending'] ?? false) {
            $query->whereDoesntHave('moodleCourse')
                ->orWhereHas('moodleCourse', fn ($q) => $q->pending());
        }

        $courses = $query->where('is_active', true)->get();
        $results = $this->moodleService->syncCourses($courses);

        return response()->json([
            'success' => true,
            'message' => "Synced {$results['success']} courses, {$results['failed']} failed",
            'data' => $results,
        ]);
    }

    /**
     * Sync all enrollments to Moodle
     * POST /api/moodle/sync/enrollments
     */
    public function syncEnrollments(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enrollment_ids' => 'nullable|array',
            'enrollment_ids.*' => 'integer|exists:enrollments,id',
            'semester_id' => 'nullable|integer|exists:semesters,id',
            'only_pending' => 'nullable|boolean',
        ]);

        $query = Enrollment::query();

        if (!empty($validated['enrollment_ids'])) {
            $query->whereIn('id', $validated['enrollment_ids']);
        } else {
            if (!empty($validated['semester_id'])) {
                $query->where('semester_id', $validated['semester_id']);
            }

            if ($validated['only_pending'] ?? false) {
                $query->whereDoesntHave('moodleEnrollment')
                    ->orWhereHas('moodleEnrollment', fn ($q) => $q->pending());
            }
        }

        $enrollments = $query->where('status', 'ENROLLED')->get();
        $results = $this->moodleService->syncEnrollments($enrollments);

        return response()->json([
            'success' => true,
            'message' => "Synced {$results['success']} enrollments, {$results['failed']} failed",
            'data' => $results,
        ]);
    }

    /**
     * Import grades from Moodle for a course
     * POST /api/moodle/import/grades
     */
    public function importGrades(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'moodle_course_id' => 'required|integer',
        ]);

        try {
            $results = $this->moodleService->importGradesFromMoodle($validated['moodle_course_id']);

            return response()->json([
                'success' => true,
                'message' => "Imported {$results['success']} grades, {$results['failed']} failed",
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Import ALL grades from Moodle for ALL students
     * POST /api/moodle/import/all-grades
     */
    public function importAllGrades(Request $request): JsonResponse
    {
        try {
            $results = $this->moodleService->importAllGradesFromMoodle();

            return response()->json([
                'success' => true,
                'message' => "تم استيراد {$results['success']} درجة بنجاح، {$results['failed']} فشلت",
                'message_en' => "Imported {$results['success']} grades, {$results['failed']} failed, {$results['skipped']} skipped",
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get grades summary by semester
     * GET /api/moodle/grades/by-semester
     */
    public function getGradesBySemester(): JsonResponse
    {
        try {
            $data = $this->moodleService->getGradesBySemester();

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Sync pending grades from Moodle to SIS
     * POST /api/moodle/sync/grades-to-sis
     */
    public function syncGradesToSis(Request $request): JsonResponse
    {
        $pendingGrades = MoodleGrade::pendingSync()
            ->whereIn('completion_status', ['COMPLETED', 'FAILED'])
            ->get();

        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($pendingGrades as $moodleGrade) {
            try {
                $this->moodleService->syncGradeToSis($moodleGrade);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'grade_id' => $moodleGrade->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Synced {$results['success']} grades to SIS, {$results['failed']} failed",
            'data' => $results,
        ]);
    }

    /**
     * Get sync logs
     * GET /api/moodle/logs
     */
    public function getLogs(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'nullable|string|in:USER,COURSE,ENROLLMENT,GRADE',
            'direction' => 'nullable|string|in:TO_MOODLE,FROM_MOODLE',
            'status' => 'nullable|string|in:SUCCESS,FAILED',
            'days' => 'nullable|integer|min:1|max:30',
            'per_page' => 'nullable|integer|min:10|max:100',
        ]);

        $query = MoodleSyncLog::query();

        if (!empty($validated['type'])) {
            $query->ofType($validated['type']);
        }

        if (!empty($validated['direction'])) {
            $query->where('direction', $validated['direction']);
        }

        if (!empty($validated['status'])) {
            $validated['status'] === 'SUCCESS'
                ? $query->successful()
                : $query->failed();
        }

        $days = $validated['days'] ?? 7;
        $query->recent($days);

        $logs = $query->orderBy('synced_at', 'desc')
            ->paginate($validated['per_page'] ?? 25);

        return response()->json($logs);
    }

    /**
     * Test Moodle connection
     * POST /api/moodle/test-connection
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->moodleService->testConnection();

        return response()->json([
            'success' => $result['success'],
            'data' => $result,
        ], $result['success'] ? 200 : 400);
    }

    /**
     * Import students from LMS (Moodle) to SIS
     * POST /api/moodle/import/students
     */
    public function importStudentsFromLms(): JsonResponse
    {
        try {
            $results = $this->moodleService->importStudentsFromMoodle();

            return response()->json([
                'success' => true,
                'message' => "Imported {$results['imported']} students, updated {$results['updated']}, skipped {$results['skipped']}, failed {$results['failed']}",
                'message_ar' => "تم استيراد {$results['imported']} طالب، تحديث {$results['updated']}، تخطي {$results['skipped']}، فشل {$results['failed']}",
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to import students from LMS',
                'message_ar' => 'فشل استيراد الطلاب من نظام إدارة التعلم',
            ], 422);
        }
    }

    /**
     * Sync profile pictures from LMS to SIS
     * POST /api/moodle/sync/profile-pictures
     */
    public function syncProfilePictures(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'nullable|integer|exists:students,id',
        ]);

        try {
            if (!empty($validated['student_id'])) {
                // Sync single student
                $student = Student::findOrFail($validated['student_id']);
                $success = $this->moodleService->syncStudentProfilePicture($student);

                return response()->json([
                    'success' => $success,
                    'message' => $success
                        ? 'Profile picture synced successfully'
                        : 'No profile picture found in LMS',
                    'message_ar' => $success
                        ? 'تم مزامنة الصورة الشخصية بنجاح'
                        : 'لم يتم العثور على صورة شخصية في نظام إدارة التعلم',
                ]);
            }

            // Sync all students
            $results = $this->moodleService->syncProfilePictures();

            return response()->json([
                'success' => true,
                'message' => "Synced {$results['success']} profile pictures, {$results['failed']} failed, {$results['skipped']} skipped",
                'message_ar' => "تم مزامنة {$results['success']} صورة، فشل {$results['failed']}، تم تخطي {$results['skipped']}",
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to sync profile pictures',
                'message_ar' => 'فشل مزامنة الصور الشخصية',
            ], 422);
        }
    }

    /**
     * Retry failed syncs
     * POST /api/moodle/retry-failed
     */
    public function retryFailed(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:users,courses,enrollments',
        ]);

        $results = ['success' => 0, 'failed' => 0];

        switch ($validated['type']) {
            case 'users':
                $failed = MoodleUser::failed()->get();
                foreach ($failed as $moodleUser) {
                    try {
                        if ($moodleUser->user_type === MoodleUser::TYPE_STUDENT && $moodleUser->student) {
                            $this->moodleService->syncStudent($moodleUser->student);
                        } elseif ($moodleUser->user_type === MoodleUser::TYPE_LECTURER && $moodleUser->user) {
                            $this->moodleService->syncLecturer($moodleUser->user);
                        }
                        $results['success']++;
                    } catch (\Exception $e) {
                        $results['failed']++;
                    }
                }
                break;

            case 'courses':
                $failed = MoodleCourse::failed()->get();
                foreach ($failed as $moodleCourse) {
                    try {
                        if ($moodleCourse->course) {
                            $this->moodleService->syncCourse($moodleCourse->course);
                        }
                        $results['success']++;
                    } catch (\Exception $e) {
                        $results['failed']++;
                    }
                }
                break;

            case 'enrollments':
                $failed = MoodleEnrollment::failed()->get();
                foreach ($failed as $moodleEnrollment) {
                    try {
                        if ($moodleEnrollment->enrollment) {
                            $this->moodleService->syncEnrollment($moodleEnrollment->enrollment);
                        }
                        $results['success']++;
                    } catch (\Exception $e) {
                        $results['failed']++;
                    }
                }
                break;
        }

        return response()->json([
            'success' => true,
            'message' => "Retried {$results['success']} items, {$results['failed']} still failed",
            'data' => $results,
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\MoodleCourse;
use App\Models\MoodleEnrollment;
use App\Models\MoodleGrade;
use App\Models\MoodleSyncLog;
use App\Models\MoodleUser;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MoodleIntegrationService
{
    protected string $baseUrl;
    protected string $token;
    protected bool $syncEnabled;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.moodle.url', ''), '/');
        $this->token = config('services.moodle.token', '');
        $this->syncEnabled = config('services.moodle.sync_enabled', false);
    }

    // ==========================================
    // Configuration & Status
    // ==========================================

    public function isConfigured(): bool
    {
        return !empty($this->baseUrl) && !empty($this->token);
    }

    public function isSyncEnabled(): bool
    {
        return $this->syncEnabled && $this->isConfigured();
    }

    public function testConnection(): array
    {
        try {
            $response = $this->callMoodleApi('core_webservice_get_site_info');

            return [
                'success' => true,
                'site_name' => $response['sitename'] ?? 'Unknown',
                'version' => $response['release'] ?? 'Unknown',
                'username' => $response['username'] ?? 'Unknown',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==========================================
    // Student Sync (SIS → Moodle)
    // ==========================================

    public function syncStudent(Student $student): MoodleUser
    {
        $moodleUser = MoodleUser::firstOrCreate(
            ['student_id' => $student->id],
            [
                'user_type' => MoodleUser::TYPE_STUDENT,
                'username' => $this->generateUsername($student),
                'sync_status' => MoodleUser::STATUS_PENDING,
            ]
        );

        if (!$this->isSyncEnabled()) {
            return $moodleUser;
        }

        try {
            // Check if user already exists in Moodle
            $existingUser = $this->findMoodleUserByUsername($moodleUser->username);

            if ($existingUser) {
                // Update existing user
                $this->updateMoodleUser($existingUser['id'], $student);
                $moodleUser->markAsSynced($existingUser['id']);
            } else {
                // Create new user
                $moodleUserId = $this->createMoodleUser($student);
                $moodleUser->markAsSynced($moodleUserId);
            }

            MoodleSyncLog::logSuccess(
                $moodleUser,
                MoodleSyncLog::TYPE_USER,
                MoodleSyncLog::DIRECTION_TO_MOODLE,
                $this->buildStudentData($student)
            );

        } catch (\Exception $e) {
            $moodleUser->markAsFailed($e->getMessage());

            MoodleSyncLog::logFailure(
                $moodleUser,
                MoodleSyncLog::TYPE_USER,
                MoodleSyncLog::DIRECTION_TO_MOODLE,
                $e->getMessage(),
                $this->buildStudentData($student)
            );

            Log::error('Moodle student sync failed', [
                'student_id' => $student->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $moodleUser;
    }

    public function syncStudents(Collection $students): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($students as $student) {
            try {
                $this->syncStudent($student);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'student_id' => $student->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    // ==========================================
    // Lecturer Sync (SIS → Moodle)
    // ==========================================

    public function syncLecturer(User $lecturer): MoodleUser
    {
        if ($lecturer->role !== 'LECTURER') {
            throw new \InvalidArgumentException('User is not a lecturer');
        }

        $moodleUser = MoodleUser::firstOrCreate(
            ['user_id' => $lecturer->id],
            [
                'user_type' => MoodleUser::TYPE_LECTURER,
                'username' => $lecturer->email,
                'sync_status' => MoodleUser::STATUS_PENDING,
            ]
        );

        if (!$this->isSyncEnabled()) {
            return $moodleUser;
        }

        try {
            $existingUser = $this->findMoodleUserByUsername($moodleUser->username);

            if ($existingUser) {
                $this->updateMoodleLecturer($existingUser['id'], $lecturer);
                $moodleUser->markAsSynced($existingUser['id']);
            } else {
                $moodleUserId = $this->createMoodleLecturer($lecturer);
                $moodleUser->markAsSynced($moodleUserId);
            }

            MoodleSyncLog::logSuccess(
                $moodleUser,
                MoodleSyncLog::TYPE_USER,
                MoodleSyncLog::DIRECTION_TO_MOODLE,
                $this->buildLecturerData($lecturer)
            );

        } catch (\Exception $e) {
            $moodleUser->markAsFailed($e->getMessage());

            MoodleSyncLog::logFailure(
                $moodleUser,
                MoodleSyncLog::TYPE_USER,
                MoodleSyncLog::DIRECTION_TO_MOODLE,
                $e->getMessage(),
                $this->buildLecturerData($lecturer)
            );

            Log::error('Moodle lecturer sync failed', [
                'user_id' => $lecturer->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $moodleUser;
    }

    public function syncLecturers(Collection $lecturers): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($lecturers as $lecturer) {
            try {
                $this->syncLecturer($lecturer);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'user_id' => $lecturer->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    // ==========================================
    // Course Sync (SIS → Moodle)
    // ==========================================

    public function syncCourse(Course $course): MoodleCourse
    {
        $shortname = MoodleCourse::generateShortname($course);

        $moodleCourse = MoodleCourse::firstOrCreate(
            ['course_id' => $course->id],
            [
                'shortname' => $shortname,
                'sync_status' => MoodleCourse::STATUS_PENDING,
            ]
        );

        if (!$this->isSyncEnabled()) {
            return $moodleCourse;
        }

        try {
            // Check if course exists
            $existingCourse = $this->findMoodleCourseByShortname($shortname);

            if ($existingCourse) {
                $this->updateMoodleCourse($existingCourse['id'], $course);
                $moodleCourse->markAsSynced($existingCourse['id'], $existingCourse['categoryid'] ?? null);
            } else {
                $result = $this->createMoodleCourse($course);
                $moodleCourse->markAsSynced($result['id'], $result['categoryid'] ?? null);
            }

            MoodleSyncLog::logSuccess(
                $moodleCourse,
                MoodleSyncLog::TYPE_COURSE,
                MoodleSyncLog::DIRECTION_TO_MOODLE,
                $this->buildCourseData($course)
            );

        } catch (\Exception $e) {
            $moodleCourse->markAsFailed($e->getMessage());

            MoodleSyncLog::logFailure(
                $moodleCourse,
                MoodleSyncLog::TYPE_COURSE,
                MoodleSyncLog::DIRECTION_TO_MOODLE,
                $e->getMessage(),
                $this->buildCourseData($course)
            );

            Log::error('Moodle course sync failed', [
                'course_id' => $course->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $moodleCourse;
    }

    public function syncCourses(Collection $courses): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($courses as $course) {
            try {
                $this->syncCourse($course);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'course_id' => $course->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    // ==========================================
    // Enrollment Sync (SIS → Moodle)
    // ==========================================

    public function syncEnrollment(Enrollment $enrollment): MoodleEnrollment
    {
        // Ensure student and course are synced first
        $student = $enrollment->student;
        $course = $enrollment->course;

        $moodleUser = MoodleUser::where('student_id', $student->id)->first();
        $moodleCourse = MoodleCourse::where('course_id', $course->id)->first();

        if (!$moodleUser || !$moodleUser->moodle_user_id) {
            $moodleUser = $this->syncStudent($student);
        }

        if (!$moodleCourse || !$moodleCourse->moodle_course_id) {
            $moodleCourse = $this->syncCourse($course);
        }

        $moodleEnrollment = MoodleEnrollment::firstOrCreate(
            ['enrollment_id' => $enrollment->id],
            [
                'moodle_user_id' => $moodleUser->moodle_user_id,
                'moodle_course_id' => $moodleCourse->moodle_course_id,
                'role' => MoodleEnrollment::ROLE_STUDENT,
                'sync_status' => MoodleEnrollment::STATUS_PENDING,
            ]
        );

        if (!$this->isSyncEnabled()) {
            return $moodleEnrollment;
        }

        try {
            // Handle based on enrollment status
            if (in_array($enrollment->status, ['DROPPED', 'WITHDRAWN'])) {
                $this->unenrollUserFromCourse(
                    $moodleUser->moodle_user_id,
                    $moodleCourse->moodle_course_id
                );
                $moodleEnrollment->markAsUnenrolled();
            } else {
                $this->enrollUserInCourse(
                    $moodleUser->moodle_user_id,
                    $moodleCourse->moodle_course_id,
                    MoodleEnrollment::ROLE_STUDENT
                );
                $moodleEnrollment->markAsSynced();
            }

            MoodleSyncLog::logSuccess(
                $moodleEnrollment,
                MoodleSyncLog::TYPE_ENROLLMENT,
                MoodleSyncLog::DIRECTION_TO_MOODLE,
                [
                    'user_id' => $moodleUser->moodle_user_id,
                    'course_id' => $moodleCourse->moodle_course_id,
                    'status' => $enrollment->status,
                ]
            );

        } catch (\Exception $e) {
            $moodleEnrollment->markAsFailed($e->getMessage());

            MoodleSyncLog::logFailure(
                $moodleEnrollment,
                MoodleSyncLog::TYPE_ENROLLMENT,
                MoodleSyncLog::DIRECTION_TO_MOODLE,
                $e->getMessage()
            );

            Log::error('Moodle enrollment sync failed', [
                'enrollment_id' => $enrollment->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $moodleEnrollment;
    }

    public function syncEnrollments(Collection $enrollments): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($enrollments as $enrollment) {
            try {
                $this->syncEnrollment($enrollment);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'enrollment_id' => $enrollment->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    // ==========================================
    // Grade Import (Moodle → SIS)
    // ==========================================

    public function processGradeWebhook(array $data): MoodleGrade
    {
        // Find the enrollment by Moodle IDs
        $moodleEnrollment = MoodleEnrollment::where('moodle_user_id', $data['user_id'])
            ->where('moodle_course_id', $data['course_id'])
            ->first();

        if (!$moodleEnrollment) {
            throw new \Exception('Enrollment not found for Moodle user/course');
        }

        // Create or update Moodle grade record
        $moodleGrade = MoodleGrade::updateOrCreate(
            ['enrollment_id' => $moodleEnrollment->enrollment_id],
            [
                'moodle_user_id' => $data['user_id'],
                'moodle_course_id' => $data['course_id'],
                'moodle_grade' => $data['grade'] ?? null,
                'moodle_grade_max' => $data['grade_max'] ?? 100,
                'completion_status' => MoodleGrade::mapMoodleStatus($data['status'] ?? 'in_progress'),
                'completed_at' => isset($data['completed_at']) ? now()->parse($data['completed_at']) : null,
                'received_at' => now(),
                'synced_to_sis' => false,
                'grade_items' => $data['grade_items'] ?? null,
            ]
        );

        MoodleSyncLog::logSuccess(
            $moodleGrade,
            MoodleSyncLog::TYPE_GRADE,
            MoodleSyncLog::DIRECTION_FROM_MOODLE,
            null,
            $data
        );

        // Optionally sync to SIS Grade table
        if ($moodleGrade->isCompleted() || $moodleGrade->isFailed()) {
            $this->syncGradeToSis($moodleGrade);
        }

        return $moodleGrade;
    }

    public function syncGradeToSis(MoodleGrade $moodleGrade): ?Grade
    {
        $enrollment = $moodleGrade->enrollment;
        if (!$enrollment) {
            return null;
        }

        $scaledGrade = $moodleGrade->scaled_grade;
        $gradeData = Grade::calculateGrade($scaledGrade ?? 0);

        $grade = Grade::updateOrCreate(
            ['enrollment_id' => $enrollment->id],
            [
                'student_id' => $enrollment->student_id,
                'course_id' => $enrollment->course_id,
                'semester_id' => $enrollment->semester_id,
                'total' => $scaledGrade,
                'grade' => $gradeData['grade'],
                'points' => $gradeData['points'],
                'status' => 'APPROVED',
                'remarks' => 'Imported from Moodle LMS',
            ]
        );

        // Update enrollment status
        $enrollment->update([
            'status' => $moodleGrade->getSisEnrollmentStatus(),
        ]);

        $moodleGrade->markAsSyncedToSis();

        return $grade;
    }

    public function importGradesFromMoodle(int $moodleCourseId): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        try {
            $grades = $this->callMoodleApi('gradereport_user_get_grade_items', [
                'courseid' => $moodleCourseId,
            ]);

            foreach ($grades['usergrades'] ?? [] as $userGrade) {
                try {
                    $this->processGradeWebhook([
                        'user_id' => $userGrade['userid'],
                        'course_id' => $moodleCourseId,
                        'grade' => $userGrade['gradeitems'][0]['graderaw'] ?? null,
                        'grade_max' => $userGrade['gradeitems'][0]['grademax'] ?? 100,
                        'status' => $this->determineMoodleStatus($userGrade),
                        'grade_items' => $userGrade['gradeitems'] ?? null,
                    ]);
                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'user_id' => $userGrade['userid'],
                        'error' => $e->getMessage(),
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to import grades from Moodle', [
                'course_id' => $moodleCourseId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        return $results;
    }

    // ==========================================
    // Moodle API Helpers
    // ==========================================

    protected function callMoodleApi(string $function, array $params = []): array
    {
        $url = "{$this->baseUrl}/webservice/rest/server.php";

        // Flatten nested arrays for Moodle REST API format
        $flatParams = [
            'wstoken' => $this->token,
            'wsfunction' => $function,
            'moodlewsrestformat' => 'json',
        ];

        // Convert nested arrays to Moodle's expected format: criteria[0][key]=value
        foreach ($params as $key => $value) {
            if (is_array($value)) {
                foreach ($value as $index => $item) {
                    if (is_array($item)) {
                        foreach ($item as $subKey => $subValue) {
                            $flatParams["{$key}[{$index}][{$subKey}]"] = $subValue;
                        }
                    } else {
                        $flatParams["{$key}[{$index}]"] = $item;
                    }
                }
            } else {
                $flatParams[$key] = $value;
            }
        }

        $response = Http::timeout(30)->asForm()->post($url, $flatParams);

        if ($response->failed()) {
            throw new \Exception("Moodle API request failed: {$response->status()}");
        }

        $data = $response->json();

        if (isset($data['exception'])) {
            throw new \Exception("Moodle API error: {$data['message']} ({$data['errorcode']})");
        }

        return $data;
    }

    protected function createMoodleUser(Student $student): int
    {
        $userData = $this->buildStudentData($student);

        $response = $this->callMoodleApi('core_user_create_users', [
            'users' => [$userData],
        ]);

        return $response[0]['id'];
    }

    protected function updateMoodleUser(int $moodleUserId, Student $student): void
    {
        $userData = $this->buildStudentData($student);
        $userData['id'] = $moodleUserId;
        unset($userData['password']); // Don't update password

        $this->callMoodleApi('core_user_update_users', [
            'users' => [$userData],
        ]);
    }

    protected function createMoodleLecturer(User $lecturer): int
    {
        $userData = $this->buildLecturerData($lecturer);

        $response = $this->callMoodleApi('core_user_create_users', [
            'users' => [$userData],
        ]);

        return $response[0]['id'];
    }

    protected function updateMoodleLecturer(int $moodleUserId, User $lecturer): void
    {
        $userData = $this->buildLecturerData($lecturer);
        $userData['id'] = $moodleUserId;
        unset($userData['password']);

        $this->callMoodleApi('core_user_update_users', [
            'users' => [$userData],
        ]);
    }

    protected function createMoodleCourse(Course $course): array
    {
        $courseData = $this->buildCourseData($course);

        $response = $this->callMoodleApi('core_course_create_courses', [
            'courses' => [$courseData],
        ]);

        return $response[0];
    }

    protected function updateMoodleCourse(int $moodleCourseId, Course $course): void
    {
        $courseData = $this->buildCourseData($course);
        $courseData['id'] = $moodleCourseId;

        $this->callMoodleApi('core_course_update_courses', [
            'courses' => [$courseData],
        ]);
    }

    protected function enrollUserInCourse(int $userId, int $courseId, string $role): void
    {
        $roleId = $this->getRoleId($role);

        $this->callMoodleApi('enrol_manual_enrol_users', [
            'enrolments' => [[
                'roleid' => $roleId,
                'userid' => $userId,
                'courseid' => $courseId,
            ]],
        ]);
    }

    protected function unenrollUserFromCourse(int $userId, int $courseId): void
    {
        $this->callMoodleApi('enrol_manual_unenrol_users', [
            'enrolments' => [[
                'userid' => $userId,
                'courseid' => $courseId,
            ]],
        ]);
    }

    protected function findMoodleUserByUsername(string $username): ?array
    {
        try {
            $response = $this->callMoodleApi('core_user_get_users', [
                'criteria' => [[
                    'key' => 'username',
                    'value' => $username,
                ]],
            ]);

            return $response['users'][0] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function findMoodleCourseByShortname(string $shortname): ?array
    {
        try {
            $response = $this->callMoodleApi('core_course_get_courses_by_field', [
                'field' => 'shortname',
                'value' => $shortname,
            ]);

            return $response['courses'][0] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    // ==========================================
    // Data Builders
    // ==========================================

    protected function buildStudentData(Student $student): array
    {
        $nameParts = $this->splitName($student->name_en ?? $student->name_ar);

        return [
            'username' => $this->generateUsername($student),
            'email' => $student->university_email ?? $student->personal_email,
            'firstname' => $student->first_name_en ?? $nameParts['firstname'],
            'lastname' => $student->last_name_en ?? $nameParts['lastname'],
            'idnumber' => $student->student_id,
            'password' => $this->generateTempPassword(),
            'auth' => 'manual',
            'suspended' => $student->status !== 'ACTIVE' ? 1 : 0,
            'department' => $student->program?->name_en ?? '',
        ];
    }

    protected function buildLecturerData(User $lecturer): array
    {
        $nameParts = $this->splitName($lecturer->name);

        return [
            'username' => $lecturer->email,
            'email' => $lecturer->email,
            'firstname' => $nameParts['firstname'],
            'lastname' => $nameParts['lastname'],
            'idnumber' => 'LECT-' . $lecturer->id,
            'password' => $this->generateTempPassword(),
            'auth' => 'manual',
        ];
    }

    protected function buildCourseData(Course $course): array
    {
        return [
            'shortname' => $course->code ?? 'COURSE-' . $course->id,
            'fullname' => $course->name_en ?? $course->name_ar,
            'idnumber' => (string) $course->id,
            'summary' => $course->description ?? '',
            'summaryformat' => 1, // HTML format
            'categoryid' => 1, // Default category, can be mapped from department
            'visible' => $course->is_active ? 1 : 0,
        ];
    }

    protected function generateUsername(Student $student): string
    {
        return $student->university_email ?? $student->student_id;
    }

    protected function generateTempPassword(): string
    {
        return 'Temp' . now()->format('Ymd') . '!';
    }

    protected function splitName(string $fullName): array
    {
        $parts = explode(' ', trim($fullName), 2);

        return [
            'firstname' => $parts[0] ?? 'Unknown',
            'lastname' => $parts[1] ?? 'User',
        ];
    }

    protected function getRoleId(string $role): int
    {
        // Standard Moodle role IDs
        return match ($role) {
            'student' => 5,
            'editingteacher' => 3,
            'teacher' => 4,
            'manager' => 1,
            default => 5,
        };
    }

    protected function determineMoodleStatus(array $userGrade): string
    {
        // Check if course is completed based on grade items
        $gradeItem = $userGrade['gradeitems'][0] ?? null;

        if (!$gradeItem) {
            return 'in_progress';
        }

        $grade = $gradeItem['graderaw'] ?? null;
        $gradeMax = $gradeItem['grademax'] ?? 100;

        if ($grade === null) {
            return 'in_progress';
        }

        $percentage = ($grade / $gradeMax) * 100;

        return $percentage >= 50 ? 'completed' : 'failed';
    }

    // ==========================================
    // Sync Statistics
    // ==========================================

    public function getSyncStatistics(): array
    {
        return [
            'users' => [
                'total' => MoodleUser::count(),
                'synced' => MoodleUser::synced()->count(),
                'pending' => MoodleUser::pending()->count(),
                'failed' => MoodleUser::failed()->count(),
                'students' => MoodleUser::students()->count(),
                'lecturers' => MoodleUser::lecturers()->count(),
            ],
            'courses' => [
                'total' => MoodleCourse::count(),
                'synced' => MoodleCourse::synced()->count(),
                'pending' => MoodleCourse::pending()->count(),
                'failed' => MoodleCourse::failed()->count(),
            ],
            'enrollments' => [
                'total' => MoodleEnrollment::count(),
                'synced' => MoodleEnrollment::synced()->count(),
                'pending' => MoodleEnrollment::pending()->count(),
                'failed' => MoodleEnrollment::failed()->count(),
                'unenrolled' => MoodleEnrollment::unenrolled()->count(),
            ],
            'grades' => [
                'total' => MoodleGrade::count(),
                'synced_to_sis' => MoodleGrade::syncedToSis()->count(),
                'pending_sync' => MoodleGrade::pendingSync()->count(),
                'completed' => MoodleGrade::completed()->count(),
                'failed' => MoodleGrade::failed()->count(),
            ],
            'recent_logs' => MoodleSyncLog::recent(1)->count(),
        ];
    }

    // ==========================================
    // Fetch Lecturers FROM LMS (View Only)
    // ==========================================

    /**
     * Fetch all lecturers/teachers from Moodle (view only, no import)
     */
    public function getLmsLecturers(): array
    {
        try {
            // Fetch all users from Moodle
            $moodleUsers = $this->callMoodleApi('core_user_get_users', [
                'criteria' => [[
                    'key' => 'suspended',
                    'value' => '0',
                ]],
            ]);

            $users = $moodleUsers['users'] ?? [];
            $lecturers = [];

            // Lecturer-related usernames/keywords to identify lecturers
            $lecturerKeywords = ['teacher', 'instructor', 'lecturer', 'professor', 'dr.', 'dr ', 'prof.', 'prof '];

            // Admin/system usernames to exclude
            $excludedUsernames = ['admin', 'guest', 'system', 'manager', 'coordinator', 'staff', 'support', 'helpdesk'];

            foreach ($users as $moodleUser) {
                $username = strtolower($moodleUser['username'] ?? '');
                $email = strtolower($moodleUser['email'] ?? '');
                $department = strtolower($moodleUser['department'] ?? '');

                // Skip system accounts
                if (in_array($username, $excludedUsernames)) {
                    continue;
                }

                // Check if user is a lecturer by:
                // 1. Username contains lecturer keywords
                // 2. Email domain suggests staff (not student)
                // 3. Department indicates teaching role
                // 4. Has 'teacher' or 'editingteacher' role assignment
                $isLecturer = false;

                foreach ($lecturerKeywords as $keyword) {
                    if (str_contains($username, $keyword) ||
                        str_contains($email, $keyword) ||
                        str_contains($department, $keyword)) {
                        $isLecturer = true;
                        break;
                    }
                }

                // Also include users with staff email patterns
                if (str_contains($email, '@staff.') ||
                    str_contains($email, '.staff@') ||
                    str_contains($email, '@faculty.') ||
                    str_contains($email, '@lecturer.')) {
                    $isLecturer = true;
                }

                // Include based on department field containing teaching indicators
                if (str_contains($department, 'faculty') ||
                    str_contains($department, 'academic') ||
                    str_contains($department, 'teaching')) {
                    $isLecturer = true;
                }

                if (!$isLecturer) {
                    continue;
                }

                // Check if already exists in SIS
                $existsInSis = User::where('email', $moodleUser['email'] ?? '')
                    ->where('role', 'LECTURER')
                    ->exists();

                $lecturers[] = [
                    'id' => $moodleUser['id'],
                    'moodle_id' => $moodleUser['id'],
                    'username' => $moodleUser['username'] ?? '',
                    'name_en' => trim(($moodleUser['firstname'] ?? '') . ' ' . ($moodleUser['lastname'] ?? '')),
                    'first_name' => $moodleUser['firstname'] ?? '',
                    'last_name' => $moodleUser['lastname'] ?? '',
                    'email' => $moodleUser['email'] ?? '',
                    'country' => $moodleUser['country'] ?? '',
                    'city' => $moodleUser['city'] ?? '',
                    'department' => $moodleUser['department'] ?? '',
                    'profile_url' => $moodleUser['profileimageurl'] ?? null,
                    'last_access' => isset($moodleUser['lastaccess']) && $moodleUser['lastaccess'] > 0
                        ? date('Y-m-d H:i:s', $moodleUser['lastaccess'])
                        : null,
                    'exists_in_sis' => $existsInSis,
                    'source' => 'LMS',
                ];
            }

            return [
                'success' => true,
                'total' => count($lecturers),
                'lecturers' => $lecturers,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to fetch lecturers from Moodle', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'lecturers' => [],
            ];
        }
    }

    /**
     * Fetch ALL users from LMS and return them for admin to select lecturers
     */
    public function getAllLmsUsers(): array
    {
        try {
            $moodleUsers = $this->callMoodleApi('core_user_get_users', [
                'criteria' => [[
                    'key' => 'suspended',
                    'value' => '0',
                ]],
            ]);

            $users = $moodleUsers['users'] ?? [];
            $result = [];

            $excludedUsernames = ['admin', 'guest', 'system'];

            foreach ($users as $moodleUser) {
                $username = strtolower($moodleUser['username'] ?? '');

                if (in_array($username, $excludedUsernames)) {
                    continue;
                }

                // Check if already exists in SIS as lecturer
                $existingUser = User::where('email', $moodleUser['email'] ?? '')->first();

                $result[] = [
                    'id' => $moodleUser['id'],
                    'moodle_id' => $moodleUser['id'],
                    'username' => $moodleUser['username'] ?? '',
                    'name_en' => trim(($moodleUser['firstname'] ?? '') . ' ' . ($moodleUser['lastname'] ?? '')),
                    'first_name' => $moodleUser['firstname'] ?? '',
                    'last_name' => $moodleUser['lastname'] ?? '',
                    'email' => $moodleUser['email'] ?? '',
                    'country' => $moodleUser['country'] ?? '',
                    'city' => $moodleUser['city'] ?? '',
                    'department' => $moodleUser['department'] ?? '',
                    'profile_url' => $moodleUser['profileimageurl'] ?? null,
                    'last_access' => isset($moodleUser['lastaccess']) && $moodleUser['lastaccess'] > 0
                        ? date('Y-m-d H:i:s', $moodleUser['lastaccess'])
                        : null,
                    'exists_in_sis' => $existingUser !== null,
                    'sis_role' => $existingUser?->role,
                    'source' => 'LMS',
                ];
            }

            return [
                'success' => true,
                'total' => count($result),
                'users' => $result,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to fetch users from Moodle', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'users' => [],
            ];
        }
    }

    // ==========================================
    // Import Lecturers FROM LMS to SIS
    // ==========================================

    /**
     * Import selected lecturers from Moodle into SIS
     */
    public function importLecturersFromMoodle(array $moodleUserIds = []): array
    {
        $results = ['imported' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0, 'errors' => [], 'lecturers' => []];

        try {
            // Fetch all users from Moodle
            $moodleUsers = $this->callMoodleApi('core_user_get_users', [
                'criteria' => [[
                    'key' => 'suspended',
                    'value' => '0',
                ]],
            ]);

            $users = $moodleUsers['users'] ?? [];

            foreach ($users as $moodleUser) {
                try {
                    // If specific IDs provided, only import those
                    if (!empty($moodleUserIds) && !in_array($moodleUser['id'], $moodleUserIds)) {
                        continue;
                    }

                    // Skip system accounts
                    $excludedUsernames = ['admin', 'guest', 'system'];
                    if (in_array(strtolower($moodleUser['username'] ?? ''), $excludedUsernames)) {
                        $results['skipped']++;
                        continue;
                    }

                    $email = $moodleUser['email'] ?? '';
                    if (empty($email)) {
                        $results['skipped']++;
                        continue;
                    }

                    // Check if user already exists in SIS
                    $existingUser = User::where('email', $email)->first();

                    if ($existingUser) {
                        // Update existing user to lecturer if not already
                        if ($existingUser->role !== 'LECTURER') {
                            $existingUser->update([
                                'role' => 'LECTURER',
                                'name' => trim($moodleUser['firstname'] . ' ' . $moodleUser['lastname']),
                            ]);
                            $results['updated']++;
                            $results['lecturers'][] = [
                                'id' => $existingUser->id,
                                'name' => $existingUser->name,
                                'email' => $existingUser->email,
                                'status' => 'updated_to_lecturer',
                            ];
                        } else {
                            // Update name if needed
                            $existingUser->update([
                                'name' => trim($moodleUser['firstname'] . ' ' . $moodleUser['lastname']),
                            ]);
                            $results['updated']++;
                            $results['lecturers'][] = [
                                'id' => $existingUser->id,
                                'name' => $existingUser->name,
                                'email' => $existingUser->email,
                                'status' => 'updated',
                            ];
                        }

                        // Update MoodleUser record
                        MoodleUser::updateOrCreate(
                            ['user_id' => $existingUser->id, 'user_type' => MoodleUser::TYPE_LECTURER],
                            [
                                'moodle_user_id' => $moodleUser['id'],
                                'username' => $moodleUser['username'],
                                'sync_status' => MoodleUser::STATUS_SYNCED,
                                'last_synced_at' => now(),
                            ]
                        );

                        continue;
                    }

                    // Create new lecturer user
                    $user = User::create([
                        'name' => trim($moodleUser['firstname'] . ' ' . $moodleUser['lastname']),
                        'email' => $email,
                        'password' => \Illuminate\Support\Facades\Hash::make('LMS' . date('Ymd') . '!'),
                        'role' => 'LECTURER',
                        'status' => 'ACTIVE',
                    ]);

                    // Create MoodleUser record
                    MoodleUser::create([
                        'user_id' => $user->id,
                        'moodle_user_id' => $moodleUser['id'],
                        'user_type' => MoodleUser::TYPE_LECTURER,
                        'username' => $moodleUser['username'],
                        'sync_status' => MoodleUser::STATUS_SYNCED,
                        'last_synced_at' => now(),
                    ]);

                    $results['imported']++;
                    $results['lecturers'][] = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => 'imported',
                    ];

                    MoodleSyncLog::logSuccess(
                        $user,
                        MoodleSyncLog::TYPE_USER,
                        MoodleSyncLog::DIRECTION_FROM_MOODLE,
                        $moodleUser
                    );

                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'moodle_user_id' => $moodleUser['id'],
                        'username' => $moodleUser['username'] ?? 'unknown',
                        'error' => $e->getMessage(),
                    ];

                    Log::error('Failed to import lecturer from Moodle', [
                        'moodle_user' => $moodleUser,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to fetch users from Moodle', ['error' => $e->getMessage()]);
            throw $e;
        }

        return $results;
    }
}

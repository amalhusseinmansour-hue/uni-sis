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
            // First, get all enrolled users in this course
            $enrolledUsers = $this->getEnrolledUsersInCourse($moodleCourseId);

            foreach ($enrolledUsers as $user) {
                try {
                    // Use gradereport_overview_get_course_grades for each user
                    $gradesResponse = $this->callMoodleApi('gradereport_overview_get_course_grades', [
                        'userid' => $user['id'],
                    ]);

                    // Find the grade for this specific course
                    $courseGrade = null;
                    foreach ($gradesResponse['grades'] ?? [] as $grade) {
                        if (($grade['courseid'] ?? null) == $moodleCourseId) {
                            $courseGrade = $grade;
                            break;
                        }
                    }

                    if ($courseGrade) {
                        $this->processGradeWebhook([
                            'user_id' => $user['id'],
                            'course_id' => $moodleCourseId,
                            'grade' => $courseGrade['grade'] ?? null,
                            'grade_max' => 100,
                            'status' => $this->determineGradeStatus($courseGrade),
                            'grade_items' => null,
                        ]);
                        $results['success']++;
                    }
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'user_id' => $user['id'],
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

    /**
     * Get enrolled users in a Moodle course
     */
    protected function getEnrolledUsersInCourse(int $courseId): array
    {
        try {
            // Get all users and filter by course enrollment
            $courses = $this->callMoodleApi('core_course_get_courses', []);
            $users = [];

            // Get users enrolled in this course by checking their courses
            $allUsers = $this->callMoodleApi('core_user_get_users', [
                'criteria' => [[
                    'key' => 'suspended',
                    'value' => '0',
                ]],
            ]);

            foreach ($allUsers['users'] ?? [] as $user) {
                // Skip admin/system users
                if (in_array(strtolower($user['username'] ?? ''), ['admin', 'guest', 'system'])) {
                    continue;
                }

                // Check if user is enrolled in this course
                $userCourses = $this->callMoodleApi('core_enrol_get_users_courses', [
                    'userid' => $user['id'],
                ]);

                foreach ($userCourses as $course) {
                    if ($course['id'] == $courseId) {
                        $users[] = $user;
                        break;
                    }
                }
            }

            return $users;
        } catch (\Exception $e) {
            Log::error('Failed to get enrolled users', ['course_id' => $courseId, 'error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Determine grade status from overview grade data
     */
    protected function determineGradeStatus(array $gradeData): string
    {
        $grade = $gradeData['grade'] ?? null;

        if ($grade === null || $grade === '-') {
            return 'in_progress';
        }

        // Parse percentage if it's a string like "85.00 %"
        if (is_string($grade)) {
            $grade = (float) str_replace(['%', ' '], '', $grade);
        }

        return $grade >= 50 ? 'completed' : 'failed';
    }

    /**
     * Get enrolled courses for a user from Moodle
     */
    public function getUserEnrolledCourses(int $moodleUserId): array
    {
        try {
            $courses = $this->callMoodleApi('core_enrol_get_users_courses', [
                'userid' => $moodleUserId,
            ]);

            return array_map(function ($course) {
                return [
                    'moodle_course_id' => $course['id'],
                    'shortname' => $course['shortname'] ?? '',
                    'fullname' => $course['fullname'] ?? '',
                    'category' => $course['category'] ?? null,
                    'startdate' => isset($course['startdate']) ? date('Y-m-d', $course['startdate']) : null,
                    'enddate' => isset($course['enddate']) && $course['enddate'] > 0 ? date('Y-m-d', $course['enddate']) : null,
                    'progress' => $course['progress'] ?? null,
                    'completed' => $course['completed'] ?? false,
                ];
            }, $courses);
        } catch (\Exception $e) {
            Log::error('Failed to get user courses from Moodle', [
                'user_id' => $moodleUserId,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Get all courses from Moodle with their categories
     */
    public function getAllMoodleCourses(): array
    {
        try {
            $courses = $this->callMoodleApi('core_course_get_courses', []);

            return array_map(function ($course) {
                return [
                    'moodle_course_id' => $course['id'],
                    'shortname' => $course['shortname'] ?? '',
                    'fullname' => $course['fullname'] ?? '',
                    'categoryid' => $course['categoryid'] ?? null,
                    'startdate' => isset($course['startdate']) ? date('Y-m-d', $course['startdate']) : null,
                    'enddate' => isset($course['enddate']) && $course['enddate'] > 0 ? date('Y-m-d', $course['enddate']) : null,
                ];
            }, $courses);
        } catch (\Exception $e) {
            Log::error('Failed to get courses from Moodle', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    // ==========================================
    // Moodle API Helpers
    // ==========================================

    protected function callMoodleApi(string $function, array $params = []): array
    {
        $url = "{$this->baseUrl}/webservice/rest/server.php";

        $response = Http::timeout(30)->asForm()->post($url, array_merge([
            'wstoken' => $this->token,
            'wsfunction' => $function,
            'moodlewsrestformat' => 'json',
        ], $params));

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
    // Fetch Students FROM LMS (View Only)
    // ==========================================

    /**
     * Fetch all students from Moodle (view only, no import)
     */
    public function getLmsStudents(): array
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
            $students = [];

            // List of non-student usernames to exclude
            $excludedUsernames = ['admin', 'guest', 'system', 'manager', 'teacher', 'instructor', 'lecturer', 'coordinator', 'staff', 'support', 'helpdesk'];

            foreach ($users as $moodleUser) {
                // Skip admin, guest, manager, and other non-student users
                if (in_array(strtolower($moodleUser['username'] ?? ''), $excludedUsernames)) {
                    continue;
                }

                // Check if already exists in SIS
                $existsInSis = Student::where('university_email', $moodleUser['email'] ?? '')
                    ->orWhere('personal_email', $moodleUser['email'] ?? '')
                    ->orWhere('student_id', $moodleUser['idnumber'] ?? 'NONE')
                    ->exists();

                $students[] = [
                    'id' => $moodleUser['id'],
                    'moodle_id' => $moodleUser['id'],
                    'student_id' => $moodleUser['idnumber'] ?? null,
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
                'total' => count($students),
                'students' => $students,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to fetch students from Moodle', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'students' => [],
            ];
        }
    }

    // ==========================================
    // Import Students FROM LMS to SIS
    // ==========================================

    /**
     * Fetch all students from Moodle and import them into SIS
     */
    public function importStudentsFromMoodle(): array
    {
        $results = ['imported' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0, 'errors' => [], 'students' => []];

        try {
            // Fetch all users from Moodle
            $moodleUsers = $this->callMoodleApi('core_user_get_users', [
                'criteria' => [[
                    'key' => 'suspended',
                    'value' => '0',
                ]],
            ]);

            $users = $moodleUsers['users'] ?? [];

            // List of non-student usernames to exclude
            $excludedUsernames = ['admin', 'guest', 'system', 'manager', 'teacher', 'instructor', 'lecturer', 'coordinator', 'staff', 'support', 'helpdesk'];

            foreach ($users as $moodleUser) {
                try {
                    // Skip admin, guest, manager, and other non-student users
                    if (in_array(strtolower($moodleUser['username'] ?? ''), $excludedUsernames)) {
                        $results['skipped']++;
                        continue;
                    }

                    // Check if student already exists in SIS by email or username
                    $existingStudent = Student::where('university_email', $moodleUser['email'])
                        ->orWhere('personal_email', $moodleUser['email'])
                        ->orWhere('student_id', $moodleUser['idnumber'] ?? null)
                        ->first();

                    if ($existingStudent) {
                        // Update existing student if needed
                        $existingStudent->update([
                            'name_en' => trim($moodleUser['firstname'] . ' ' . $moodleUser['lastname']),
                            'first_name_en' => $moodleUser['firstname'],
                            'last_name_en' => $moodleUser['lastname'],
                        ]);

                        // Update MoodleUser record
                        MoodleUser::updateOrCreate(
                            ['student_id' => $existingStudent->id],
                            [
                                'moodle_user_id' => $moodleUser['id'],
                                'user_type' => MoodleUser::TYPE_STUDENT,
                                'username' => $moodleUser['username'],
                                'sync_status' => MoodleUser::STATUS_SYNCED,
                                'last_synced_at' => now(),
                            ]
                        );

                        $results['updated']++;
                        $results['students'][] = [
                            'id' => $existingStudent->id,
                            'student_id' => $existingStudent->student_id,
                            'name' => $existingStudent->name_en,
                            'email' => $existingStudent->university_email,
                            'status' => 'updated',
                        ];
                        continue;
                    }

                    // Create new student
                    $studentId = $moodleUser['idnumber'] ?: $this->generateStudentId();
                    $email = $moodleUser['email'];

                    // Create user account
                    $user = User::create([
                        'name' => trim($moodleUser['firstname'] . ' ' . $moodleUser['lastname']),
                        'email' => $email,
                        'password' => \Illuminate\Support\Facades\Hash::make('LMS' . date('Ymd') . '!'),
                        'role' => 'STUDENT',
                    ]);

                    // Create student record
                    $student = Student::create([
                        'user_id' => $user->id,
                        'student_id' => $studentId,
                        'name_en' => trim($moodleUser['firstname'] . ' ' . $moodleUser['lastname']),
                        'name_ar' => null,
                        'first_name_en' => $moodleUser['firstname'],
                        'last_name_en' => $moodleUser['lastname'],
                        'university_email' => $email,
                        'personal_email' => $email,
                        'status' => 'ACTIVE',
                        'admission_type' => 'DIRECT',
                        'admission_date' => now(),
                        'national_id' => $moodleUser['idnumber'] ?: 'LMS-' . $moodleUser['id'],
                        'gender' => 'MALE', // Default, can be updated later
                        'nationality' => $moodleUser['country'] ?? 'Unknown',
                    ]);

                    // Create MoodleUser record
                    MoodleUser::create([
                        'student_id' => $student->id,
                        'moodle_user_id' => $moodleUser['id'],
                        'user_type' => MoodleUser::TYPE_STUDENT,
                        'username' => $moodleUser['username'],
                        'sync_status' => MoodleUser::STATUS_SYNCED,
                        'last_synced_at' => now(),
                    ]);

                    $results['imported']++;
                    $results['students'][] = [
                        'id' => $student->id,
                        'student_id' => $student->student_id,
                        'name' => $student->name_en,
                        'email' => $student->university_email,
                        'status' => 'imported',
                    ];

                    MoodleSyncLog::logSuccess(
                        $student,
                        MoodleSyncLog::TYPE_USER,
                        MoodleSyncLog::DIRECTION_FROM_MOODLE,
                        $moodleUser
                    );

                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'moodle_user_id' => $moodleUser['id'],
                        'username' => $moodleUser['username'],
                        'error' => $e->getMessage(),
                    ];

                    Log::error('Failed to import student from Moodle', [
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

    /**
     * Generate a unique student ID
     */
    protected function generateStudentId(): string
    {
        $year = date('Y');
        $lastStudent = Student::whereYear('created_at', $year)->orderBy('id', 'desc')->first();
        $sequence = $lastStudent ? ((int)substr($lastStudent->student_id ?? '0', -4) + 1) : 1;
        return $year . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    // ==========================================
    // Profile Pictures Sync (LMS → SIS)
    // ==========================================

    /**
     * Sync profile pictures from Moodle to SIS for all students
     */
    public function syncProfilePictures(): array
    {
        $results = ['success' => 0, 'failed' => 0, 'skipped' => 0, 'errors' => []];

        try {
            // Get all students from LMS
            $lmsData = $this->getLmsStudents();

            if (!$lmsData['success']) {
                throw new \Exception($lmsData['error'] ?? 'Failed to fetch LMS students');
            }

            foreach ($lmsData['students'] as $lmsStudent) {
                try {
                    // Skip if no profile image URL
                    if (empty($lmsStudent['profile_url'])) {
                        $results['skipped']++;
                        continue;
                    }

                    // Skip default Moodle avatar (theme/image.php is the default, pluginfile.php is uploaded)
                    if (str_contains($lmsStudent['profile_url'], 'theme/image.php')) {
                        $results['skipped']++;
                        continue;
                    }

                    // Find student in SIS by email or student_id
                    $student = Student::where('university_email', $lmsStudent['email'])
                        ->orWhere('personal_email', $lmsStudent['email'])
                        ->orWhere('student_id', $lmsStudent['student_id'] ?? 'NONE')
                        ->first();

                    if (!$student) {
                        $results['skipped']++;
                        continue;
                    }

                    // Download and save profile picture
                    $saved = $this->downloadAndSaveProfilePicture($student, $lmsStudent['profile_url']);

                    if ($saved) {
                        $results['success']++;
                    } else {
                        $results['failed']++;
                    }

                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'student' => $lmsStudent['email'] ?? $lmsStudent['username'],
                        'error' => $e->getMessage(),
                    ];
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to sync profile pictures', ['error' => $e->getMessage()]);
            throw $e;
        }

        return $results;
    }

    /**
     * Sync profile picture for a single student by their email or student_id
     */
    public function syncStudentProfilePicture(Student $student): bool
    {
        try {
            // Find student in Moodle
            $moodleUser = $this->findMoodleUserByEmail($student->university_email ?? $student->personal_email);

            if (!$moodleUser || empty($moodleUser['profileimageurl'])) {
                return false;
            }

            // Skip default avatar (theme/image.php is the default, pluginfile.php is uploaded)
            if (str_contains($moodleUser['profileimageurl'], 'theme/image.php')) {
                return false;
            }

            return $this->downloadAndSaveProfilePicture($student, $moodleUser['profileimageurl']);

        } catch (\Exception $e) {
            Log::error('Failed to sync profile picture for student', [
                'student_id' => $student->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Download profile picture from URL and save it locally
     */
    protected function downloadAndSaveProfilePicture(Student $student, string $imageUrl): bool
    {
        try {
            // Remove any existing token from URL and add our token
            $cleanUrl = preg_replace('/[?&]token=[^&]*/', '', $imageUrl);

            // Try to get larger version (f3 = full size, f2 = medium, f1 = small)
            // Replace f1 with f3 in the URL for full-size image
            $largeImageUrl = str_replace('/f1', '/f3', $cleanUrl);

            // Add token for authentication
            $separator = str_contains($largeImageUrl, '?') ? '&' : '?';
            $largeImageUrl .= $separator . 'token=' . $this->token;

            Log::info('Attempting to download profile picture', [
                'student_id' => $student->id,
                'original_url' => $imageUrl,
                'download_url' => $largeImageUrl,
            ]);

            // Download the large image first
            $response = Http::timeout(30)->get($largeImageUrl);

            // If large image fails or is too small, try f2 (medium)
            if (!$response->successful() || strlen($response->body()) < 1500) {
                $mediumImageUrl = str_replace('/f1', '/f2', $cleanUrl);
                $separator = str_contains($mediumImageUrl, '?') ? '&' : '?';
                $mediumImageUrl .= $separator . 'token=' . $this->token;

                Log::info('Trying medium size image', ['url' => $mediumImageUrl]);
                $response = Http::timeout(30)->get($mediumImageUrl);
            }

            // If medium fails, try original URL with token
            if (!$response->successful() || strlen($response->body()) < 1500) {
                $separator = str_contains($cleanUrl, '?') ? '&' : '?';
                $originalWithToken = $cleanUrl . $separator . 'token=' . $this->token;

                Log::info('Trying original size image', ['url' => $originalWithToken]);
                $response = Http::timeout(30)->get($originalWithToken);
            }

            if (!$response->successful()) {
                Log::warning('Failed to download profile picture - HTTP error', [
                    'student_id' => $student->id,
                    'status' => $response->status(),
                ]);
                return false;
            }

            // Check if response is actually an image (not HTML login page)
            $contentType = $response->header('Content-Type');
            if ($contentType && !str_contains($contentType, 'image/')) {
                Log::warning('Profile picture URL returned non-image content', [
                    'student_id' => $student->id,
                    'content_type' => $contentType,
                    'body_preview' => substr($response->body(), 0, 200),
                ]);
                return false;
            }

            $imageContent = $response->body();

            // Additional check: if size is too small, it's likely a default avatar
            // Moodle profile pictures are typically 2-3KB for uploaded images
            if (strlen($imageContent) < 1500) {
                Log::warning('Profile picture is too small, likely default avatar', [
                    'student_id' => $student->id,
                    'size' => strlen($imageContent),
                ]);
                return false;
            }

            // Detect image type
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($imageContent);

            $extension = match($mimeType) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                default => 'jpg',
            };

            // Generate filename
            $filename = 'profile_pictures/' . $student->student_id . '_' . time() . '.' . $extension;

            // Save to storage
            \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $imageContent);

            // Delete old profile picture if exists
            if ($student->profile_picture && \Illuminate\Support\Facades\Storage::disk('public')->exists($student->profile_picture)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($student->profile_picture);
            }

            // Update student record
            $student->update(['profile_picture' => $filename]);

            Log::info('Profile picture synced from LMS', [
                'student_id' => $student->id,
                'filename' => $filename,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to download profile picture', [
                'student_id' => $student->id,
                'url' => $imageUrl,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Find Moodle user by email
     */
    protected function findMoodleUserByEmail(string $email): ?array
    {
        try {
            $response = $this->callMoodleApi('core_user_get_users', [
                'criteria' => [[
                    'key' => 'email',
                    'value' => $email,
                ]],
            ]);

            return $response['users'][0] ?? null;
        } catch (\Exception $e) {
            return null;
        }
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
}

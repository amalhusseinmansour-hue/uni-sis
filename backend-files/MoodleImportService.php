<?php

namespace App\Services;

use App\Models\MoodleUser;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MoodleImportService
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

    /**
     * Test Moodle connection
     */
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

    /**
     * Fetch all students from Moodle
     */
    public function fetchMoodleStudents(int $limit = 0): array
    {
        // Get all users with student role
        // Method 1: Get users by role
        try {
            $students = $this->callMoodleApi('core_user_get_users', [
                'criteria' => [
                    [
                        'key' => 'auth',
                        'value' => 'manual',
                    ],
                ],
            ]);

            $users = $students['users'] ?? [];

            // Filter out admin/manager accounts (typically have certain patterns)
            $users = array_filter($users, function ($user) {
                // Skip admin accounts
                if (in_array($user['username'] ?? '', ['admin', 'guest'])) {
                    return false;
                }
                // Skip suspended accounts if needed
                // if (isset($user['suspended']) && $user['suspended']) {
                //     return false;
                // }
                return true;
            });

            // Re-index array
            $users = array_values($users);

            if ($limit > 0) {
                $users = array_slice($users, 0, $limit);
            }

            return $users;
        } catch (\Exception $e) {
            Log::error('Failed to fetch Moodle students', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Fetch students enrolled in courses (more accurate method)
     */
    public function fetchEnrolledStudents(int $limit = 0): array
    {
        $allStudents = [];
        $seenUserIds = [];

        try {
            // First get all courses
            $courses = $this->callMoodleApi('core_course_get_courses');

            foreach ($courses as $course) {
                if ($course['id'] == 1) continue; // Skip site course

                try {
                    // Get enrolled users for each course
                    $enrolled = $this->callMoodleApi('core_enrol_get_enrolled_users', [
                        'courseid' => $course['id'],
                    ]);

                    foreach ($enrolled as $user) {
                        // Check if user has student role
                        $isStudent = false;
                        foreach ($user['roles'] ?? [] as $role) {
                            if (in_array($role['shortname'], ['student', 'learner'])) {
                                $isStudent = true;
                                break;
                            }
                        }

                        if ($isStudent && !in_array($user['id'], $seenUserIds)) {
                            $seenUserIds[] = $user['id'];
                            $allStudents[] = $user;
                        }
                    }
                } catch (\Exception $e) {
                    // Skip courses that fail
                    continue;
                }
            }

            if ($limit > 0) {
                $allStudents = array_slice($allStudents, 0, $limit);
            }

            return $allStudents;
        } catch (\Exception $e) {
            Log::error('Failed to fetch enrolled students', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Preview import without creating records
     */
    public function previewImport(array $moodleStudents): array
    {
        $new = 0;
        $existing = 0;
        $update = 0;

        foreach ($moodleStudents as $mStudent) {
            $email = $mStudent['email'] ?? null;
            $username = $mStudent['username'] ?? null;
            $moodleId = $mStudent['id'];

            // Check if already linked
            $moodleUser = MoodleUser::where('moodle_user_id', $moodleId)->first();
            if ($moodleUser) {
                $update++;
                continue;
            }

            // Check if user exists by email
            if ($email && User::where('email', $email)->exists()) {
                $existing++;
                continue;
            }

            $new++;
        }

        return [
            'new' => $new,
            'existing' => $existing,
            'update' => $update,
            'total' => count($moodleStudents),
        ];
    }

    /**
     * Import students from Moodle to SIS
     */
    public function importStudents(array $moodleStudents, ?callable $progressCallback = null): array
    {
        $results = [
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'failed' => 0,
            'errors' => [],
            'imported_students' => [],
        ];

        foreach ($moodleStudents as $mStudent) {
            try {
                $result = $this->importSingleStudent($mStudent);

                if ($result['status'] === 'created') {
                    $results['created']++;
                    $results['imported_students'][] = $result['student'];
                } elseif ($result['status'] === 'updated') {
                    $results['updated']++;
                } else {
                    $results['skipped']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'moodle_id' => $mStudent['id'] ?? 'unknown',
                    'username' => $mStudent['username'] ?? 'unknown',
                    'message' => $e->getMessage(),
                ];

                Log::error('Failed to import student from Moodle', [
                    'moodle_user' => $mStudent,
                    'error' => $e->getMessage(),
                ]);
            }

            if ($progressCallback) {
                $progressCallback();
            }
        }

        return $results;
    }

    /**
     * Import a single student
     */
    public function importSingleStudent(array $moodleStudent): array
    {
        $moodleId = $moodleStudent['id'];
        $email = $moodleStudent['email'] ?? null;
        $username = $moodleStudent['username'] ?? '';
        $firstName = $moodleStudent['firstname'] ?? '';
        $lastName = $moodleStudent['lastname'] ?? '';
        $fullName = trim($firstName . ' ' . $lastName);
        $phone = $moodleStudent['phone1'] ?? $moodleStudent['phone2'] ?? null;
        $department = $moodleStudent['department'] ?? null;
        $idNumber = $moodleStudent['idnumber'] ?? null;
        $suspended = isset($moodleStudent['suspended']) && $moodleStudent['suspended'];

        // Check if already linked via MoodleUser
        $existingMoodleUser = MoodleUser::where('moodle_user_id', $moodleId)->first();
        if ($existingMoodleUser && $existingMoodleUser->student) {
            // Update existing student
            $this->updateStudentFromMoodle($existingMoodleUser->student, $moodleStudent);
            return [
                'status' => 'updated',
                'student' => $existingMoodleUser->student,
            ];
        }

        // Check if user exists by email
        if ($email) {
            $existingUser = User::where('email', $email)->first();
            if ($existingUser && $existingUser->student) {
                // Link existing student to Moodle
                $this->linkStudentToMoodle($existingUser->student, $moodleId, $username);
                return [
                    'status' => 'updated',
                    'student' => $existingUser->student,
                ];
            }
        }

        // Create new user and student
        return DB::transaction(function () use (
            $moodleId, $email, $username, $firstName, $lastName,
            $fullName, $phone, $department, $idNumber, $suspended
        ) {
            // Generate email if not provided
            if (!$email) {
                $email = $username . '@student.vertexuniversity.edu.eu';
            }

            // Create User
            $user = User::create([
                'name' => $fullName ?: $username,
                'email' => $email,
                'password' => Hash::make($this->generateDefaultPassword($username)),
                'role' => 'STUDENT',
                'phone' => $phone,
            ]);

            // Generate student ID
            $studentId = $this->generateStudentId();

            // Try to find program by department name
            $program = null;
            if ($department) {
                $program = Program::where('name_en', 'like', "%{$department}%")
                    ->orWhere('name_ar', 'like', "%{$department}%")
                    ->first();
            }

            // Create Student
            $student = Student::create([
                'user_id' => $user->id,
                'student_id' => $idNumber ?: $studentId,
                'name_en' => $fullName ?: $username,
                'name_ar' => null,
                'first_name_en' => $firstName,
                'last_name_en' => $lastName,
                'personal_email' => $email,
                'university_email' => $email,
                'phone' => $phone,
                'status' => $suspended ? 'SUSPENDED' : 'ACTIVE',
                'program_id' => $program?->id,
                'lms_username' => $username,
                'lms_account_status' => 'ACTIVE',
                'sis_account_status' => 'ACTIVE',
                'admission_date' => now(),
                'level' => 1,
                'current_semester' => 1,
                'gpa' => 0,
            ]);

            // Create MoodleUser link
            MoodleUser::create([
                'user_type' => MoodleUser::TYPE_STUDENT,
                'student_id' => $student->id,
                'user_id' => $user->id,
                'moodle_user_id' => $moodleId,
                'username' => $username,
                'sync_status' => MoodleUser::STATUS_SYNCED,
                'last_synced_at' => now(),
            ]);

            return [
                'status' => 'created',
                'student' => $student,
                'user' => $user,
                'credentials' => [
                    'email' => $email,
                    'password' => $this->generateDefaultPassword($username),
                ],
            ];
        });
    }

    /**
     * Update existing student from Moodle data
     */
    protected function updateStudentFromMoodle(Student $student, array $moodleStudent): void
    {
        $updates = [];

        if (!empty($moodleStudent['firstname']) && !$student->first_name_en) {
            $updates['first_name_en'] = $moodleStudent['firstname'];
        }

        if (!empty($moodleStudent['lastname']) && !$student->last_name_en) {
            $updates['last_name_en'] = $moodleStudent['lastname'];
        }

        if (!empty($moodleStudent['phone1']) && !$student->phone) {
            $updates['phone'] = $moodleStudent['phone1'];
        }

        if (isset($moodleStudent['suspended'])) {
            $updates['status'] = $moodleStudent['suspended'] ? 'SUSPENDED' : 'ACTIVE';
        }

        if (!empty($updates)) {
            $student->update($updates);
        }

        // Update MoodleUser sync time
        $student->moodleUser?->update([
            'last_synced_at' => now(),
            'sync_status' => MoodleUser::STATUS_SYNCED,
        ]);
    }

    /**
     * Link existing student to Moodle
     */
    protected function linkStudentToMoodle(Student $student, int $moodleId, string $username): void
    {
        MoodleUser::updateOrCreate(
            ['student_id' => $student->id],
            [
                'user_type' => MoodleUser::TYPE_STUDENT,
                'user_id' => $student->user_id,
                'moodle_user_id' => $moodleId,
                'username' => $username,
                'sync_status' => MoodleUser::STATUS_SYNCED,
                'last_synced_at' => now(),
            ]
        );
    }

    /**
     * Generate default password
     */
    protected function generateDefaultPassword(string $username): string
    {
        // Pattern: Vu + Year + first 4 chars of username + !
        $year = date('Y');
        $userPart = substr(preg_replace('/[^a-zA-Z0-9]/', '', $username), 0, 4);
        return "Vu{$year}{$userPart}!";
    }

    /**
     * Generate unique student ID
     */
    protected function generateStudentId(): string
    {
        $year = date('Y');
        $prefix = 'STU';

        // Get the last student ID for this year
        $lastStudent = Student::where('student_id', 'like', "{$prefix}{$year}%")
            ->orderBy('student_id', 'desc')
            ->first();

        if ($lastStudent) {
            $lastNumber = (int) substr($lastStudent->student_id, -5);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . $year . str_pad($newNumber, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Call Moodle API
     */
    protected function callMoodleApi(string $function, array $params = []): array
    {
        $url = "{$this->baseUrl}/webservice/rest/server.php";

        $response = Http::timeout(60)->asForm()->post($url, array_merge([
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

    /**
     * Get import statistics
     */
    public function getImportStatistics(): array
    {
        return [
            'total_moodle_users' => MoodleUser::students()->count(),
            'synced' => MoodleUser::students()->synced()->count(),
            'pending' => MoodleUser::students()->pending()->count(),
            'failed' => MoodleUser::students()->failed()->count(),
            'total_students' => Student::count(),
            'active_students' => Student::where('status', 'ACTIVE')->count(),
        ];
    }

    /**
     * Sync grades and enrollments for imported students
     */
    public function syncStudentData(Student $student): array
    {
        $moodleUser = $student->moodleUser;
        if (!$moodleUser || !$moodleUser->moodle_user_id) {
            return ['success' => false, 'error' => 'Student not linked to Moodle'];
        }

        try {
            // Get user's enrolled courses
            $courses = $this->callMoodleApi('core_enrol_get_users_courses', [
                'userid' => $moodleUser->moodle_user_id,
            ]);

            $syncedCourses = [];
            foreach ($courses as $course) {
                // Get grades for this course
                try {
                    $grades = $this->callMoodleApi('gradereport_user_get_grade_items', [
                        'courseid' => $course['id'],
                        'userid' => $moodleUser->moodle_user_id,
                    ]);

                    $syncedCourses[] = [
                        'course_id' => $course['id'],
                        'course_name' => $course['fullname'],
                        'grades' => $grades['usergrades'][0]['gradeitems'] ?? [],
                    ];
                } catch (\Exception $e) {
                    continue;
                }
            }

            return [
                'success' => true,
                'courses_synced' => count($syncedCourses),
                'data' => $syncedCourses,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
